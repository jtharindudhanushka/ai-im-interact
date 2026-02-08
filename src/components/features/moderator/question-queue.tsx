"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Check, X, Clock, AlertCircle } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import type { Database } from "@/types/database.types"
import { formatDistanceToNow } from "date-fns"

type Question = Database["public"]["Tables"]["questions"]["Row"]

interface QuestionQueueProps {
    eventId: string
}

export function QuestionQueue({ eventId }: QuestionQueueProps) {
    const [questions, setQuestions] = useState<Question[]>([])
    const [stats, setStats] = useState({ approved: 0, rejected: 0, pending: 0 })
    const supabase = createClient()
    const { toast } = useToast()

    // Real-time subscription
    useEffect(() => {
        // Initial fetch
        const fetchQuestions = async () => {
            const { data } = await supabase
                .from("questions")
                .select("*")
                .eq("event_id", eventId)
                .order("submitted_at", { ascending: true }) // Oldest first for queue

            if (data) {
                setQuestions(data.filter(q => q.status === 'pending'))
                // Calculate stats roughly from full fetch or separate count query
                // For efficiency in MVP, let's just count locally or fetch counts
            }
        }

        fetchQuestions()

        const channel = supabase
            .channel("moderator_questions")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "questions",
                    filter: `event_id=eq.${eventId}`,
                },
                (payload) => {
                    if (payload.eventType === 'INSERT') {
                        setQuestions((prev) => [...prev, payload.new as Question])
                        setStats(s => ({ ...s, pending: s.pending + 1 }))
                        toast({
                            title: "New Question",
                            description: "A new question has arrived.",
                            duration: 2000
                        })
                    } else if (payload.eventType === 'UPDATE') {
                        const updated = payload.new as Question
                        if (updated.status !== 'pending') {
                            setQuestions((prev) => prev.filter(q => q.id !== updated.id))
                        }
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [eventId])

    const handleModeration = async (id: string, status: 'approved' | 'rejected') => {
        // Optimistic update
        setQuestions(prev => prev.filter(q => q.id !== id))

        const { error } = await supabase
            .from("questions")
            .update({
                status,
                moderated_at: new Date().toISOString()
                // moderated_by should be set by RLS or trigger, but for now client sends it? 
                // Or we use creating user from session on server side.
            })
            .eq("id", id)

        if (error) {
            console.error(error)
            toast({ title: "Error", description: "Failed to update status", variant: "destructive" })
            // Revert optimism if needed (complex)
        } else {
            if (status === 'approved') setStats(s => ({ ...s, approved: s.approved + 1, pending: s.pending - 1 }))
            else setStats(s => ({ ...s, rejected: s.rejected + 1, pending: s.pending - 1 }))
        }
    }

    // Keyboard shortcuts
    useEffect(() => {
        const handleKeyDown = (e: KeyboardEvent) => {
            if (questions.length === 0) return

            // Process first question in queue
            const currentQ = questions[0]

            if (e.key === 'ArrowRight' || e.key.toLowerCase() === 'a') {
                handleModeration(currentQ.id, 'approved')
            } else if (e.key === 'ArrowLeft' || e.key.toLowerCase() === 'r') {
                handleModeration(currentQ.id, 'rejected')
            }
        }

        window.addEventListener('keydown', handleKeyDown)
        return () => window.removeEventListener('keydown', handleKeyDown)
    }, [questions])

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold">Moderation Queue</h2>
                <Badge variant="outline" className="text-sm">
                    Pending: {questions.length}
                </Badge>
            </div>

            {questions.length === 0 ? (
                <div className="flex min-h-[400px] flex-col items-center justify-center rounded-3xl border-2 border-dashed bg-muted/20 text-muted-foreground">
                    <Check className="mb-4 h-12 w-12 text-green-500 opacity-50" />
                    <p className="text-lg font-medium">All caught up!</p>
                    <p>Waiting for new questions...</p>
                </div>
            ) : (
                <div className="grid gap-6">
                    {questions.map((q, index) => (
                        <Card key={q.id} className={`overflow-hidden border-l-4 transition-all ${index === 0 ? 'border-l-primary shadow-lg scale-100 ring-2 ring-primary/20' : 'border-l-muted opacity-60 scale-95'}`}>
                            <CardContent className="p-6">
                                <div className="mb-4 flex items-center justify-between text-sm text-muted-foreground">
                                    <span className="flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {formatDistanceToNow(new Date(q.submitted_at), { addSuffix: true })}
                                    </span>
                                    <span className="font-mono text-xs">ID: {q.id.slice(0, 4)}</span>
                                </div>

                                <p className="text-xl font-medium leading-relaxed text-foreground">
                                    {q.content}
                                </p>

                                {index === 0 && (
                                    <div className="mt-8 grid grid-cols-2 gap-4">
                                        <Button
                                            variant="outline"
                                            className="h-14 border-red-200 text-red-600 hover:bg-red-50 hover:text-red-700 dark:border-red-900/30 dark:hover:bg-red-900/20"
                                            onClick={() => handleModeration(q.id, 'rejected')}
                                        >
                                            <X className="mr-2 h-6 w-6" />
                                            Reject (←)
                                        </Button>
                                        <Button
                                            className="h-14 bg-green-600 text-white hover:bg-green-700 dark:bg-green-700 dark:hover:bg-green-600"
                                            onClick={() => handleModeration(q.id, 'approved')}
                                        >
                                            <Check className="mr-2 h-6 w-6" />
                                            Approve (→)
                                        </Button>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}
        </div>
    )
}
