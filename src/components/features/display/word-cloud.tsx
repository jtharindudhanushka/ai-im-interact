"use client"

import { useEffect, useState } from "react"
import { createClient } from "@/lib/supabase/client"
import { motion, AnimatePresence } from "framer-motion"
import type { Database } from "@/types/database.types"

type Question = Database["public"]["Tables"]["questions"]["Row"]

interface WordCloudProps {
    eventId: string
}

export function WordCloud({ eventId }: WordCloudProps) {
    const [questions, setQuestions] = useState<Question[]>([])
    const supabase = createClient()

    useEffect(() => {
        // Initial fetch of APPROVED questions
        const fetchQuestions = async () => {
            const { data } = await supabase
                .from("questions")
                .select("*")
                .eq("event_id", eventId)
                .eq("status", "approved")
                .order("moderated_at", { ascending: false }) // Newest first? Or random?
                .limit(50)

            if (data) setQuestions(data)
        }

        fetchQuestions()

        const channel = supabase
            .channel("display_questions")
            .on(
                "postgres_changes",
                {
                    event: "UPDATE",
                    schema: "public",
                    table: "questions",
                    filter: `event_id=eq.${eventId}`,
                },
                (payload) => {
                    const updated = payload.new as Question
                    if (updated.status === 'approved') {
                        setQuestions((prev) => {
                            if (prev.find(q => q.id === updated.id)) return prev
                            return [updated, ...prev].slice(0, 50)
                        })
                    }
                }
            )
            .subscribe()

        return () => {
            supabase.removeChannel(channel)
        }
    }, [eventId])

    // Simple layout algorithm (randomized positions for now, sophisticated packing would need D3-cloud or similar)
    // For this MVP, we will use a flex/grid flow with randomized sizes/colors for effect.

    const getRandomSize = (id: string) => {
        // Deterministic random based on ID char
        const charCode = id.charCodeAt(0)
        const sizes = ['text-lg', 'text-xl', 'text-2xl', 'text-3xl', 'text-4xl']
        return sizes[charCode % sizes.length]
    }

    const getRandomColor = (id: string) => {
        const charCode = id.charCodeAt(1)
        // Notion/Modern palette colors
        const colors = [
            'bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-200',
            'bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-200',
            'bg-purple-100 text-purple-800 dark:bg-purple-900/40 dark:text-purple-200',
            'bg-orange-100 text-orange-800 dark:bg-orange-900/40 dark:text-orange-200',
            'bg-pink-100 text-pink-800 dark:bg-pink-900/40 dark:text-pink-200',
        ]
        return colors[charCode % colors.length]
    }

    return (
        <div className="flex h-full w-full flex-wrap content-center justify-center gap-4 overflow-hidden p-8">
            <AnimatePresence mode="popLayout">
                {questions.map((q) => (
                    <motion.div
                        key={q.id}
                        layout
                        initial={{ opacity: 0, scale: 0.8, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.5 }}
                        transition={{ type: "spring", stiffness: 300, damping: 25 }}
                        className={`inline-block rounded-full px-6 py-3 font-medium shadow-sm backdrop-blur-sm ${getRandomColor(q.id)} ${getRandomSize(q.id)}`}
                    >
                        {q.content}
                    </motion.div>
                ))}
            </AnimatePresence>
            {questions.length === 0 && (
                <div className="flex h-full w-full flex-col items-center justify-center text-muted-foreground opacity-50">
                    <p className="text-2xl font-light">Waiting for questions...</p>
                </div>
            )}
        </div>
    )
}
