import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { WordCloud } from "@/components/features/display/word-cloud"
import { PollDisplay } from "@/components/features/display/poll-display"

interface PageProps {
    params: {
        id: string
    }
}

export default async function DisplayPage({ params }: PageProps) {
    const eventId = params.id
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
                <div className="absolute top-4 left-6 z-10">
                    <h1 className="text-2xl font-bold opacity-50">{event.name}</h1>
                    <p className="text-sm opacity-40">Code: {event.event_code}</p>
                </div>
                <WordCloud eventId={eventId} />
            </div>

            {/* Right: Polls (40%) */}
            <div className="w-[40%] h-full bg-surface-elevated dark:bg-black/10">
                <PollDisplay eventId={eventId} />
            </div>
        </div>
    )
}
