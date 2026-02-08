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
        <div className="flex bg-surface text-foreground w-screen h-screen overflow-hidden">
            {/* Left: Word Cloud (60%) */}
            <div className="w-[60%] h-full border-r relative bg-gradient-to-br from-surface to-muted/20">
                <DisplayHeader eventCode={event.event_code} eventName={event.name} />
                <WordCloud eventId={eventId} />
            </div>

            {/* Right: Polls (40%) */}
            <div className="w-[40%] h-full bg-surface-elevated dark:bg-black/10">
                <PollDisplay eventId={eventId} />
            </div>
        </div>
    )
}
