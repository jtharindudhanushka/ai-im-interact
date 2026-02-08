"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { useToast } from "@/hooks/use-toast"
import { Loader2, Send } from "lucide-react"
import { createClient } from "@/lib/supabase/client"

interface QuestionFormProps {
    eventId: string
}

export function QuestionForm({ eventId }: QuestionFormProps) {
    const [question, setQuestion] = useState("")
    const [isSubmitting, setIsSubmitting] = useState(false)
    const { toast } = useToast()
    const supabase = createClient()

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!question.trim()) return

        setIsSubmitting(true)
        try {
            // Direct Supabase insert via RLS
            const { error } = await supabase.from("questions").insert({
                event_id: eventId,
                content: question.trim(),
                status: "pending",
            })

            if (error) throw error

            toast({
                title: "Question Submitted!",
                description: "Your question is under review by the moderator.",
                variant: "default", // Success style if implemented or default
            })
            setQuestion("")
        } catch (error) {
            console.error(error)
            toast({
                title: "Error",
                description: "Failed to submit question. Please try again.",
                variant: "destructive",
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="space-y-6 p-6">
            <div className="text-center space-y-2">
                <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-br from-foreground to-muted-foreground bg-clip-text text-transparent">Ask anything</h2>
                <p className="text-muted-foreground text-sm">Your question will be reviewed by moderators.</p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative group">
                    <Textarea
                        placeholder="Type your question here..."
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                        className="min-h-[160px] resize-none rounded-2xl border-2 border-muted bg-background/50 p-4 text-lg shadow-sm transition-all focus:border-primary/50 focus:ring-4 focus:ring-primary/10 group-hover:border-primary/30"
                        maxLength={280}
                        required
                    />
                    <div className="absolute bottom-4 right-4 text-xs text-muted-foreground font-mono bg-background/80 px-2 py-1 rounded-full border">
                        {question.length}/280
                    </div>
                </div>
                <Button
                    type="submit"
                    className="h-14 w-full rounded-2xl text-lg font-semibold shadow-lg shadow-primary/20 transition-all hover:scale-[1.02] active:scale-[0.98]"
                    disabled={isSubmitting || !question.trim()}
                >
                    {isSubmitting ? (
                        <>
                            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                            Sending...
                        </>
                    ) : (
                        <>
                            <Send className="mr-2 h-5 w-5" />
                            Submit Question
                        </>
                    )}
                </Button>
            </form>
        </div>
    )
}
