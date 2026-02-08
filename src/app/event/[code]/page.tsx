import { notFound } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { ParticipantView } from "@/components/features/participant/participant-view"

interface PageProps {
    params: Promise<{
        code: string
    }>
}

// This is a Server Component
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
        <ParticipantView event={event} />
    )
}
