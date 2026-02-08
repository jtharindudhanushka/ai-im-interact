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

    // Track newly added questions for glow effect
    const [newFields, setNewFields] = useState<Set<string>>(new Set())

    useEffect(() => {
        if (questions.length > 0) {
            const latest = questions[0].id
            setNewFields(prev => {
                const next = new Set(prev)
                next.add(latest)
                return next
            })

            // Remove glow after 5 seconds
            const timer = setTimeout(() => {
                setNewFields(prev => {
                    const next = new Set(prev)
                    if (next.has(latest)) next.delete(latest)
                    return next
                })
            }, 5000)
            return () => clearTimeout(timer)
        }
    }, [questions])

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
        <div className="relative h-full w-full overflow-hidden">
            {/* Abstract Wave Background */}
            <div className="absolute inset-0 z-0 opacity-30 dark:opacity-20">
                <svg className="absolute bottom-0 left-0 w-full h-full" xmlns="http://www.w3.org/2000/svg" preserveAspectRatio="none" viewBox="0 0 1440 320">
                    <defs>
                        <linearGradient id="grad1" x1="0%" y1="0%" x2="100%" y2="0%">
                            <stop offset="0%" style={{ stopColor: 'rgb(59, 130, 246)', stopOpacity: 0.2 }} />
                            <stop offset="100%" style={{ stopColor: 'rgb(147, 51, 234)', stopOpacity: 0.2 }} />
                        </linearGradient>
                    </defs>
                    <path fill="url(#grad1)" fillOpacity="1" d="M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z">
                        <animate attributeName="d"
                            dur="20s"
                            repeatCount="indefinite"
                            values="
                                M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
                                M0,128L48,144C96,160,192,192,288,192C384,192,480,160,576,165.3C672,171,768,213,864,213.3C960,213,1056,171,1152,149.3C1248,128,1344,128,1392,128L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z;
                                M0,192L48,197.3C96,203,192,213,288,229.3C384,245,480,267,576,250.7C672,235,768,181,864,181.3C960,181,1056,235,1152,234.7C1248,235,1344,181,1392,154.7L1440,128L1440,320L1392,320C1344,320,1248,320,1152,320C1056,320,960,320,864,320C768,320,672,320,576,320C480,320,384,320,288,320C192,320,96,320,48,320L0,320Z
                             "
                        />
                    </path>
                </svg>
            </div>

            <div className="relative z-10 flex h-full w-full flex-wrap content-center justify-center gap-4 p-8 pt-24">
                <AnimatePresence mode="popLayout">
                    {questions.map((q) => (
                        <motion.div
                            key={q.id}
                            layout
                            initial={{ opacity: 0, scale: 0.5, y: 20 }}
                            animate={{
                                opacity: 1,
                                scale: 1,
                                y: 0,
                                transition: {
                                    type: "spring",
                                    stiffness: 400,
                                    damping: 15,
                                    mass: 0.8
                                }
                            }}
                            exit={{ opacity: 0, scale: 0, transition: { duration: 0.2 } }}
                            className={`inline-flex items-center justify-center text-center rounded-3xl px-6 py-3 font-semibold shadow-md backdrop-blur-md border border-white/10 ${getRandomColor(q.id)} ${getRandomSize(q.id)} cursor-default select-none transition-all duration-500`}
                            style={{
                                boxShadow: newFields.has(q.id)
                                    ? "0 0 20px 5px rgba(255, 255, 255, 0.4), inset 0 0 10px rgba(255,255,255,0.5)"
                                    : "0 4px 6px -1px rgba(0, 0, 0, 0.1)"
                            }}
                            whileHover={{ scale: 1.05, rotate: 2, zIndex: 10 }}
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
        </div>
    )
}
