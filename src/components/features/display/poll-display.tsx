"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { Bar, BarChart, ResponsiveContainer, XAxis, YAxis, Cell, LabelList } from "recharts"
import type { Database } from "@/types/database.types"
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card"
import { motion } from "framer-motion"

type Poll = Database["public"]["Tables"]["polls"]["Row"]

interface PollDisplayProps {
    eventId: string
}

export function PollDisplay({ eventId }: PollDisplayProps) {
    const [activePoll, setActivePoll] = useState<Poll | null>(null)
    const [data, setData] = useState<{ name: string, votes: number }[]>([])
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

    // Need separate subscription for VOTES on the active poll
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
                    // On every vote, re-fetch counts
                    // Ideally we'd just increment local state, but options structure makes it tricky to map ID to index
                    // Let's just re-run the aggregate query
                    updateVoteCounts(activePoll.id, activePoll.options as any[])
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [activePoll?.id])


    const updateVoteCounts = async (pollId: string, options: any[]) => {
        // 1. Fetch all votes for this poll
        const { data: votes } = await supabase
            .from('poll_votes')
            .select('option_ids')
            .eq('poll_id', pollId)

        if (!votes) return

        // 2. Aggregate
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

        // 3. Format for Recharts
        const chartData = options.map(opt => ({
            name: opt.text,
            votes: counts[opt.id] || 0
        }))

        setData(chartData)
        setTotalVotes(total)
    }

    if (!activePoll) {
        return (
            <div className="flex h-full flex-col items-center justify-center p-8 text-center bg-muted/10">
                <h2 className="text-3xl font-bold text-muted-foreground/50">AI & IM Live</h2>
                <p className="text-muted-foreground/40 mt-2">Waiting for next poll...</p>
            </div>
        )
    }

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            className="h-full p-6"
        >
            <Card className="h-full border-0 shadow-none bg-transparent">
                <CardHeader className="pb-2">
                    <CardTitle className="text-2xl md:text-3xl lg:text-4xl text-center leading-tight">
                        {activePoll.question}
                    </CardTitle>
                    <p className="text-center text-muted-foreground text-lg">Total Votes: {totalVotes}</p>
                </CardHeader>
                <CardContent className="h-[calc(100%-8rem)] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                        <BarChart data={data} layout="vertical" margin={{ top: 20, right: 50, left: 20, bottom: 5 }}>
                            <XAxis type="number" hide />
                            <YAxis
                                dataKey="name"
                                type="category"
                                width={150}
                                tick={{ fontSize: 16, fill: 'currentColor' }}
                                interval={0}
                            />
                            <Bar dataKey="votes" fill="var(--primary)" radius={[0, 10, 10, 0]} barSize={40}>
                                <LabelList dataKey="votes" position="right" style={{ fontSize: '18px', fontWeight: 'bold' }} />
                                {data.map((entry, index) => (
                                    <Cell key={`cell-${index}`} fill={index % 2 === 0 ? 'hsl(var(--primary))' : 'hsl(var(--primary) / 0.8)'} />
                                ))}
                            </Bar>
                        </BarChart>
                    </ResponsiveContainer>
                </CardContent>
            </Card>
        </motion.div>
    )
}
