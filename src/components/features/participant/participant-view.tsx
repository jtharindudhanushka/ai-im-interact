"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { ParticipantHeader } from "@/components/features/participant/header"
import { QuestionForm } from "@/components/features/participant/question-form"
import { PollVoting } from "@/components/features/participant/poll-voting"
import { MessageSquare, BarChart2, Sparkles } from "lucide-react"
import { cn } from "@/lib/utils"

interface ParticipantViewProps {
    event: any
}

export function ParticipantView({ event }: ParticipantViewProps) {
    const [activeTab, setActiveTab] = useState<'ask' | 'poll'>('ask')

    return (
        <div className="min-h-screen bg-gradient-to-br from-background to-muted/20 pb-20 selection:bg-primary/20">
            <ParticipantHeader eventName={event.name} />

            <main className="container mx-auto max-w-lg p-4 pt-8">
                {/* Modern Custom Tabs */}
                <div className="relative mb-8 h-16 rounded-full bg-muted/40 p-1.5 ring-1 ring-black/5 dark:ring-white/5 backdrop-blur-sm">
                    <div className="absolute inset-[6px] grid grid-cols-2 gap-2">
                        {/* Moving Background */}
                        <motion.div
                            className="absolute left-0 top-0 bottom-0 w-1/2 bg-background rounded-full shadow-sm"
                            animate={{
                                x: activeTab === 'ask' ? 0 : '100%'
                            }}
                            transition={{ type: "spring", stiffness: 300, damping: 30 }}
                        />
                    </div>

                    <div className="relative z-10 grid h-full w-full grid-cols-2">
                        <button
                            onClick={() => setActiveTab('ask')}
                            className={cn(
                                "flex items-center justify-center gap-2 rounded-full font-semibold transition-colors duration-200",
                                activeTab === 'ask' ? "text-primary dark:text-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <MessageSquare className="h-5 w-5" />
                            <span className="text-sm sm:text-base">Ask Question</span>
                        </button>
                        <button
                            onClick={() => setActiveTab('poll')}
                            className={cn(
                                "flex items-center justify-center gap-2 rounded-full font-semibold transition-colors duration-200",
                                activeTab === 'poll' ? "text-primary dark:text-foreground" : "text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <BarChart2 className="h-5 w-5" />
                            <span className="text-sm sm:text-base">Live Poll</span>
                            {/* Optional: Add a badge if there's an active poll? */}
                        </button>
                    </div>
                </div>

                {/* Content Area */}
                <AnimatePresence mode="wait">
                    {activeTab === 'ask' ? (
                        <motion.div
                            key="ask"
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: 20 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="w-full"
                        >
                            <div className="rounded-3xl border bg-card/60 backdrop-blur-sm p-1 shadow-sm">
                                <QuestionForm eventId={event.id} />
                            </div>
                        </motion.div>
                    ) : (
                        <motion.div
                            key="poll"
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            transition={{ duration: 0.3, ease: "easeInOut" }}
                            className="w-full"
                        >
                            <div className="rounded-3xl border bg-card/60 backdrop-blur-sm p-1 shadow-sm">
                                <PollVoting eventId={event.id} />
                            </div>
                        </motion.div>
                    )}
                </AnimatePresence>

                {/* Footer / Vibe Check */}
                <div className="mt-12 text-center text-xs text-muted-foreground flex items-center justify-center gap-1 opacity-50">
                    <Sparkles className="h-3 w-3" />
                    <span>Real-time interaction powered by AI@IM</span>
                </div>
            </main>
        </div>
    )
}
