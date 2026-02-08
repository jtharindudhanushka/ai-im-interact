import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    // Public submission, but rate limiting should be handled (TODO: Middleware/Upstash)
    const supabase = await createClient()

    try {
        const json = await request.json()
        const { event_id, content } = json

        if (!event_id || !content) {
            return NextResponse.json({ error: 'Event ID and content are required' }, { status: 400 })
        }

        if (content.length > 500) {
            return NextResponse.json({ error: 'Question too long (max 500 chars)' }, { status: 400 })
        }

        // Basic profanity check could go here

        const { data, error } = await supabase
            .from('questions')
            .insert({
                event_id,
                content,
                status: 'pending' // Always pending first
            } as any)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(data)
    } catch (error) {
        console.error('Error submitting question:', error)
        return NextResponse.json({ error: 'Failed to submit question' }, { status: 500 })
    }
}
