import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { WordCloud } from "@/components/features/display/word-cloud"
import { PollDisplay } from "@/components/features/display/poll-display"
import { DisplayHeader } from "@/components/features/display/header"

interface PageProps {
    params: Promise<{
        id: string
    }>
}

export default async function DisplayPage({ params }: PageProps) {
    const { id: eventId } = await params
    const supabase = await createClient()

    const { data: eventData } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single()

    const event = eventData as any

    if (!event) {
        notFound()
    }

    return (
        <div className="flex flex-col h-screen w-screen overflow-hidden bg-background text-foreground">
            {/* Header spans full width */}
            <div className="relative z-50">
                <DisplayHeader eventCode={event.event_code} eventName={event.name} />
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden relative z-0">
                {/* Left: Word Cloud (60%) */}
                <div className="w-[60%] h-full relative border-r border-border/50 bg-background/50 backdrop-blur-sm">
                    <WordCloud eventId={eventId} />
                </div>

                {/* Right: Polls (40%) */}
                <div className="w-[40%] h-full bg-muted/10 p-6 flex flex-col justify-center">
                    <PollDisplay eventId={eventId} />
                </div>
            </div>
        </div>
    )
}
