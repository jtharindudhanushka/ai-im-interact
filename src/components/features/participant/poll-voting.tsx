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
                <CardContent className="space-y-6">
                    {hasVoted ? (
                        <div className="py-8 text-center">
                            <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-green-100 text-green-600 dark:bg-green-900/30">
                                <span className="text-2xl">✓</span>
                            </div>
                            <h3 className="text-xl font-medium">Vote Submitted!</h3>
                            <p className="mt-2 text-muted-foreground">Wait for results on the main screen.</p>
                        </div>
                    ) : (
                        <>
                            <RadioGroup
                                value={selectedOption}
                                onValueChange={setSelectedOption}
                                className="space-y-3"
                            >
                                {options.map((opt: any) => (
                                    <div key={opt.id} className="relative">
                                        <RadioGroupItem
                                            value={opt.id}
                                            id={opt.id}
                                            className="peer sr-only"
                                        />
                                        <Label
                                            htmlFor={opt.id}
                                            className="flex cursor-pointer items-center justify-between rounded-full border-2 border-muted bg-popover px-6 py-4 text-base font-medium transition-all hover:bg-accent peer-data-[state=checked]:border-primary peer-data-[state=checked]:bg-primary/5 peer-data-[state=checked]:text-primary"
                                        >
                                            {opt.text}
                                        </Label>
                                    </div>
                                ))}
                            </RadioGroup>

                            <Button
                                size="lg"
                                className="w-full text-lg"
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
