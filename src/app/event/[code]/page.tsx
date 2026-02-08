import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { QuestionForm } from "@/components/features/participant/question-form"
import { PollVoting } from "@/components/features/participant/poll-voting"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MessageSquare, BarChart2 } from "lucide-react"

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
        <div className="min-h-screen bg-surface pb-20">
            {/* Header */}
            <header className="sticky top-0 z-10 bg-surface/80 px-6 py-4 backdrop-blur-md">
                <div className="mx-auto max-w-lg">
                    <p className="text-sm font-medium text-muted-foreground uppercase tracking-wider">
                        {event.name}
                    </p>
                    <h1 className="text-2xl font-bold tracking-tight text-foreground">
                        Hi, Welcome 👋
                    </h1>
                </div>
            </header>

            <main className="container mx-auto max-w-lg p-4">
                <Tabs defaultValue="ask" className="w-full">
                    <TabsList className="mb-8 grid w-full grid-cols-2 rounded-full border bg-muted/50 p-1">
                        <TabsTrigger
                            value="ask"
                            className="rounded-full py-3 text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
                        >
                            <MessageSquare className="mr-2 h-4 w-4" />
                            Ask
                        </TabsTrigger>
                        <TabsTrigger
                            value="poll"
                            className="rounded-full py-3 text-base data-[state=active]:bg-primary data-[state=active]:text-primary-foreground data-[state=active]:shadow-md"
                        >
                            <BarChart2 className="mr-2 h-4 w-4" />
                            Poll
                        </TabsTrigger>
                    </TabsList>

                    <TabsContent value="ask" className="animate-in fade-in slide-in-from-left-4 duration-300">
                        <QuestionForm eventId={event.id} />
                    </TabsContent>

                    <TabsContent value="poll" className="animate-in fade-in slide-in-from-right-4 duration-300">
                        <PollVoting eventId={event.id} />
                    </TabsContent>
                </Tabs>
            </main>
        </div>
    )
}
