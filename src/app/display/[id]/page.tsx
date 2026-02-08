import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { WordCloud } from "@/components/features/display/word-cloud"
import { PollDisplay } from "@/components/features/display/poll-display"

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
                <div className="absolute top-6 left-8 z-10 space-y-1">
                    <h1 className="text-3xl font-bold tracking-tight text-foreground/80">{event.name}</h1>
                    <div className="flex items-center gap-3 bg-surface/50 backdrop-blur-sm px-4 py-2 rounded-full border shadow-sm w-fit">
                        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider">Join at</span>
                        <code className="text-xl font-bold text-primary">ai-im.live</code>
                        <span className="text-sm font-medium text-muted-foreground uppercase tracking-wider pl-2">Code</span>
                        <code className="text-xl font-bold text-primary">{event.event_code}</code>
                    </div>
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
