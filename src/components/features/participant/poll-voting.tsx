"use client"

import { useEffect, useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group"
import { Label } from "@/components/ui/label"
import { createClient } from "@/lib/supabase/client"
import { Loader2, BarChart2 } from "lucide-react"
import type { Database } from "@/types/database.types"
import { useToast } from "@/hooks/use-toast"

type Poll = Database["public"]["Tables"]["polls"]["Row"]

interface PollVotingProps {
    eventId: string
}

export function PollVoting({ eventId }: PollVotingProps) {
    const [activePoll, setActivePoll] = useState<Poll | null>(null)
    const [selectedOption, setSelectedOption] = useState<string>("")
    const [isVoting, setIsVoting] = useState(false)
    const [hasVoted, setHasVoted] = useState(false)
    const { toast } = useToast()
    const supabase = createClient()

    // Real-time subscription to polls
    useEffect(() => {
        // Initial fetch
        const fetchActivePoll = async () => {
            const { data } = await supabase
                .from("polls")
                .select("*")
                .eq("event_id", eventId)
                .eq("active", true)
                .single()

            if (data) setActivePoll(data)
            else setActivePoll(null)
        }

        fetchActivePoll()

        const channel = supabase
            .channel("active_poll")
            .on(
                "postgres_changes",
                {
                    event: "*",
                    schema: "public",
                    table: "polls",
                    filter: `event_id=eq.${eventId}`,
                },
                (payload) => {
                    // If update or insert relative to this event
                    if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
                        if (payload.new.active) {
                            setActivePoll(payload.new as Poll)
                            setHasVoted(false) // Reset vote state for new poll? 
                            // Actually need to check local storage if voted for THIS poll ID
                        } else {
                            // If the current active poll became inactive
                            if (activePoll && payload.new.id === activePoll.id && !payload.new.active) {
                                setActivePoll(null)
                            }
                        }
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [eventId, supabase, activePoll]) // Added activePoll dependency carefully

    const handleVote = async () => {
        if (!activePoll || !selectedOption) return

        setIsVoting(true)
        try {
            // Get session ID (simple implementation: local storage UUID)
            let sessionId = localStorage.getItem("aiim_session_id")
            if (!sessionId) {
                sessionId = crypto.randomUUID()
                localStorage.setItem("aiim_session_id", sessionId)
            }

            // Optimistic upate? Direct insert
            await fetch("/api/votes", {
                method: "POST",
                body: JSON.stringify({
                    poll_id: activePoll.id,
                    option_ids: [selectedOption], // Single choice for now
                    session_id: sessionId
                })
            })

            // Assuming success or using RLS insert
            setHasVoted(true)
            toast({
                title: "Vote Recorded",
                description: "Thanks for participating!",
            })
        } catch (error) {
            console.error(error)
            toast({
                title: "Error",
                description: "Failed to record vote.",
                variant: "destructive",
            })
        } finally {
            setIsVoting(false)
        }
    }

    if (!activePoll) {
        return (
            <div className="flex min-h-[50vh] flex-col items-center justify-center space-y-4 text-center text-muted-foreground">
                <BarChart2 className="h-16 w-16 opacity-20" />
                <p className="text-xl font-medium">No active poll right now</p>
                <p className="text-sm">Wait for the host to start a poll.</p>
            </div>
        )
    }

    // Parse options from JSON
    const options = (activePoll.options as any[]) || []

    return (
        <div className="mx-auto max-w-lg animate-in fade-in slide-in-from-bottom-4">
            <Card className="border-2 border-primary/10">
                <CardHeader className="text-center">
                    <CardTitle className="text-2xl">{activePoll.question}</CardTitle>
                </CardHeader>
                <CardContent className="space-y-8 p-6">
                    {hasVoted ? (
                        <div className="py-12 text-center animate-in zoom-in-50 duration-500">
                            <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-500/20 dark:text-green-400 shadow-inner">
                                <span className="text-4xl">✓</span>
                            </div>
                            <h3 className="text-2xl font-bold tracking-tight">Vote Submitted!</h3>
                            <p className="mt-3 text-lg text-muted-foreground">Keep watching the main screen.</p>
                        </div>
                    ) : (
                        <>
                            <RadioGroup
                                value={selectedOption}
                                onValueChange={setSelectedOption}
                                className="space-y-3"
                            >
                                {options.map((opt: any) => (
                                    <div key={opt.id} className="relative group">
                                        <RadioGroupItem
                                            value={opt.id}
                                            id={opt.id}
                                            className="peer sr-only"
                                        />
                                        <Label
                                            htmlFor={opt.id}
                                            className="flex w-full cursor-pointer items-center justify-between rounded-xl border-2 border-muted bg-card px-6 py-5 text-lg font-medium transition-all hover:border-primary/50 hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:text-primary peer-data-[state=checked]:shadow-md"
                                        >
                                            {opt.text}
                                            <div className="h-5 w-5 rounded-full border-2 border-muted peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary transition-colors" />
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>

                            <Button
                                size="lg"
                                className="w-full h-14 rounded-xl text-lg font-bold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                                onClick={handleVote}
                                disabled={!selectedOption || isVoting}
                            >
                                {isVoting ? (
                                    <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                ) : null}
                                Submit Vote
                            </Button>
                        </>
                    )}
                </CardContent>
            </Card>
        </div>
    )
}
