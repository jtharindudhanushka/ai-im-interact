import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const supabase = await createClient()

    // Check auth - Only admin/moderator/creator can create polls
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const json = await request.json()
        const { event_id, question, options, poll_type } = json

        if (!event_id || !question || !options || !Array.isArray(options) || options.length < 2) {
            return NextResponse.json({ error: 'Invalid poll data. Need question and at least 2 options.' }, { status: 400 })
        }

        // Verify user owns event or is mod
        // For MVP, just check if user exists, RLS will handle the insert permission if set correctly
        // But good to check here too.

        const { data, error } = await supabase
            .from('polls')
            .insert({
                event_id,
                question,
                options, // JSONB array
                poll_type: poll_type || 'single',
                active: false // Inactive by default
            })
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(data)
    } catch (error) {
        console.error('Error creating poll:', error)
        return NextResponse.json({ error: 'Failed to create poll' }, { status: 500 })
    }
}
