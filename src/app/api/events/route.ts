import { createClient } from '@/lib/supabase/server'
import { NextResponse } from 'next/server'

export async function POST(request: Request) {
    const supabase = await createClient()

    // Check auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    try {
        const json = await request.json()
        const { name, event_code, settings } = json

        if (!name || !event_code) {
            return NextResponse.json({ error: 'Name and Event Code are required' }, { status: 400 })
        }

        const { data, error } = await supabase
            .from('events')
            .insert({
                name,
                event_code,
                created_by: user.id,
                settings: settings || { qa_enabled: true, polls_enabled: true },
                status: 'draft'
            } as any)
            .select()
            .single()

        if (error) throw error

        return NextResponse.json(data)
    } catch (error) {
        console.error('Error creating event:', error)
        return NextResponse.json({ error: 'Failed to create event' }, { status: 500 })
    }
}

export async function GET(request: Request) {
    const supabase = await createClient()
    const { searchParams } = new URL(request.url)
    const code = searchParams.get('code')

    if (code) {
        // Public lookup by code
        const { data, error } = await supabase
            .from('events')
            .select('id, name, status, settings, starts_at')
            .eq('event_code', code)
            .single()

        if (error) {
            return NextResponse.json({ error: 'Event not found' }, { status: 404 })
        }
        return NextResponse.json(data)
    }

    // Admin list view (requires auth)
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    }

    const { data, error } = await supabase
        .from('events')
        .select('*')
        .eq('created_by', user.id)
        .order('created_at', { ascending: false })

    if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 })
    }

    return NextResponse.json(data)
}
