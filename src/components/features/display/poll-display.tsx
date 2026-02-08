"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import type { Database } from "@/types/database.types"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { motion, AnimatePresence } from "framer-motion"

type Poll = Database["public"]["Tables"]["polls"]["Row"]

interface PollDisplayProps {
    eventId: string
}

export function PollDisplay({ eventId }: PollDisplayProps) {
    const [activePoll, setActivePoll] = useState<Poll | null>(null)
    const [data, setData] = useState<{ id: string, text: string, votes: number, percentage: number }[]>([])
    const [totalVotes, setTotalVotes] = useState(0)
    const supabase = createClient()

    // Subscribe to Poll changes (activation)
    useEffect(() => {
        const fetchActivePoll = async () => {
            const { data } = await supabase
                .from("polls")
                .select("*")
                .eq("event_id", eventId)
                .eq("active", true)
                .single()

            if (data) {
                setActivePoll(data)
                await updateVoteCounts(data.id, data.options as any[])
            } else {
                setActivePoll(null)
            }
        }

        fetchActivePoll()

        const channel = supabase
            .channel("display_poll_status")
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "polls",
                    filter: `event_id=eq.${eventId}`,
                },
                async (payload) => {
                    const poll = payload.new as Poll
                    if (poll.active) {
                        setActivePoll(poll)
                        await updateVoteCounts(poll.id, poll.options as any[])
                    } else if (activePoll?.id === poll.id) {
                        setActivePoll(null)
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [eventId])

    // Subscribe to VOTES on the active poll
    useEffect(() => {
        if (!activePoll) return

        const channel = supabase
            .channel(`poll_votes_${activePoll.id}`)
            .on(
                "postgres_changes",
                {
                    event: "INSERT",
                    schema: "public",
                    table: "poll_votes",
                    filter: `poll_id=eq.${activePoll.id}`,
                },
                () => {
                    updateVoteCounts(activePoll.id, activePoll.options as any[])
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [activePoll?.id])


    const updateVoteCounts = async (pollId: string, options: any[]) => {
        const { data: votes } = await supabase
            .from('poll_votes')
            .select('option_ids')
            .eq('poll_id', pollId)

        if (!votes) return

        const counts: Record<string, number> = {}
        options.forEach(opt => counts[opt.id] = 0)

        let total = 0
        votes.forEach(v => {
            const ids = v.option_ids as string[]
            ids.forEach(id => {
                if (counts[id] !== undefined) {
                    counts[id]++
                    total++
                }
            })
        })

        const chartData = options.map(opt => ({
            id: opt.id,
            text: opt.text,
            votes: counts[opt.id] || 0,
            percentage: total === 0 ? 0 : Math.round(((counts[opt.id] || 0) / total) * 100)
        })).sort((a, b) => b.votes - a.votes) // Sort by votes

        setData(chartData)
        setTotalVotes(total)
    }

    if (!activePoll) {
        return (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center bg-muted/5 rounded-3xl border-2 border-dashed border-muted">
                <div className="bg-background/50 p-6 rounded-full shadow-sm mb-4">
                    <span className="text-4xl">📊</span>
                </div>
                <h2 className="text-2xl font-bold text-muted-foreground/70">Waiting for Poll</h2>
                <p className="text-muted-foreground/50 mt-2">Polls active will appear here instantly.</p>
            </div>
        )
    }

    return (
        <Card className="h-full border-0 shadow-lg bg-card/80 backdrop-blur-md rounded-3xl overflow-hidden flex flex-col w-full max-w-2xl mx-auto">
            <CardHeader className="bg-primary/5 pb-6 border-b">
                <div className="flex justify-between items-start gap-4">
                    <CardTitle className="text-2xl md:text-3xl font-bold leading-tight break-words">
                        {activePoll.question}
                    </CardTitle>
                    <div className="bg-primary/10 text-primary px-3 py-1 rounded-full text-sm font-bold whitespace-nowrap">
                        Live Vote
                    </div>
                </div>
                <p className="text-muted-foreground font-medium mt-2 flex items-center gap-2">
                    <span className="inline-block w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                    {totalVotes} total votes
                </p>
            </CardHeader>
            <CardContent className="flex-1 overflow-y-auto p-6 space-y-6">
                <AnimatePresence>
                    {data.map((opt, index) => (
                        <motion.div
                            key={opt.id}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: index * 0.1 }}
                            className="space-y-2"
                        >
                            <div className="flex justify-between items-end text-sm font-medium">
                                <span className="text-lg">{opt.text}</span>
                                <span className="text-primary font-bold text-lg">{opt.percentage}% <span className="text-muted-foreground text-sm font-normal">({opt.votes})</span></span>
                            </div>
                            <Progress value={opt.percentage} className="h-4 rounded-full" />
                        </motion.div>
                    ))}
                </AnimatePresence>
            </CardContent>
        </Card>
    )
}

