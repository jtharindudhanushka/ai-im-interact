import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const supabase = await createClient()

    try {
        const json = await request.json()
        const { poll_id, option_ids, session_id } = json

        if (!poll_id || !option_ids || !session_id) {
            return NextResponse.json({ error: 'Poll ID, Option IDs, and Session ID required' }, { status: 400 })
        }

        // Check if already voted with this session_id?
        // RLS might not prevent logic checks like "one vote per session".
        // We should check here.
        const { data: existingVote } = await supabase
            .from('poll_votes')
            .select('id')
            .eq('poll_id', poll_id)
            .eq('session_id', session_id)
            .single()

        if (existingVote) {
            return NextResponse.json({ error: 'Already voted' }, { status: 403 })
        }

        const { data, error } = await supabase
            .from('poll_votes')
            .insert({
                poll_id,
                option_ids, // JSON array
                session_id
            })
            .select()
            .single()

        // Also increment total_votes on poll table? 
        // Or just count count(id) on read. 
        // Requirement said "Total vote count displayed".
        // Better to use a trigger or just count on read. 
        // Detailed implementation: Let's increment a counter if we want, but Supabase Realtime aggregation is tricky.
        // For now, simple insert. Clients will count votes.

        if (error) throw error

        return NextResponse.json(data)
    } catch (error) {
        console.error('Error submitting vote:', error)
        return NextResponse.json({ error: 'Failed to submit vote' }, { status: 500 })
    }
}
