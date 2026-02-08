import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { QuestionForm } from "@/components/features/participant/question-form"
import { PollVoting } from "@/components/features/participant/poll-voting"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, BarChart2 } from "lucide-react"
import { ParticipantHeader } from "@/components/features/participant/header"

interface PageProps {
    params: Promise<{
        code: string
    }>
}

export default async function ParticipantPage({ params }: PageProps) {
    const { code } = await params
    const supabase = await createClient()

    // Verify event code
    const { data: eventData } = await supabase
        .from("events")
        .select("id, name, settings")
        .eq("event_code", code)
        .single()

    const event = eventData as any

    if (!event) {
        notFound()
    }

    return (
        <div className="min-h-screen bg-surface pb-20 selection:bg-primary/20">
            <ParticipantHeader eventName={event.name} />

            <main className="container mx-auto max-w-lg p-4 pt-6">
                <Tabs defaultValue="ask" className="w-full">
                    <TabsList className="mb-8 grid w-full grid-cols-2 h-14 rounded-full border bg-muted/50 p-1.5 ring-1 ring-black/5 dark:ring-white/10">
                        <TabsTrigger
                            value="ask"
                            className="rounded-full h-full text-base font-medium transition-all data-[state=active]:bg-surface-elevated data-[state=active]:text-primary data-[state=active]:shadow-sm"
                        >
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Ask
                        </TabsTrigger>
                        <TabsTrigger
                            value="poll"
                            className="rounded-full h-full text-base font-medium transition-all data-[state=active]:bg-surface-elevated data-[state=active]:text-primary data-[state=active]:shadow-sm"
                        >
                            <BarChart2 className="mr-2 h-4 w-4" />
                            Poll
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="ask" className="animate-in fade-in slide-in-from-left-4 duration-500 fill-mode-both">
                        <QuestionForm eventId={event.id} />
                    </TabsContent>

                    <TabsContent value="poll" className="animate-in fade-in slide-in-from-right-4 duration-500 fill-mode-both">
                        <PollVoting eventId={event.id} />
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    )
}
