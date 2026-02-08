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
        <div className="mx-auto max-w-lg space-y-6 text-center">
            <div className="space-y-2">
                <h2 className="text-2xl font-semibold tracking-tight">Ask a Question</h2>
                <p className="text-muted-foreground">
                    Submit your question for the speakers.
                </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
                <div className="relative">
                    <Textarea
                        placeholder="Type your question here..."
                        className="min-h-[120px] resize-none rounded-3xl border-2 px-6 py-4 text-lg focus-visible:ring-offset-0"
                        maxLength={280}
                        value={question}
                        onChange={(e) => setQuestion(e.target.value)}
                    />
                    <div className="absolute bottom-4 right-4 text-xs text-muted-foreground">
                        {question.length}/280
                    </div>
                </div>

                <Button
                    type="submit"
                    size="lg"
                    className="h-12 w-full text-lg"
                    disabled={!question.trim() || isSubmitting}
                >
                    {isSubmitting ? (
                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                    ) : (
                        <Send className="mr-2 h-5 w-5" />
                    )}
                    Submit Question
                </Button>
            </form>
        </div>
    )
}
