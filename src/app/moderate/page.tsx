"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { LogOut, ArrowRight } from "lucide-react"

type Event = {
    id: string
    name: string
    event_code: string
    created_at: string
}

export default function ModeratorDashboardList() {
    const [events, setEvents] = useState<Event[]>([])
    const [loading, setLoading] = useState(true)
    const supabase = createClient()

    useEffect(() => {
        const fetchEvents = async () => {
            // For MVP, showing all events. In production, filter by `event_access`
            const { data } = await supabase
                .from("events")
                .select("id, name, event_code, created_at")
                .order("created_at", { ascending: false })

            if (data) setEvents(data)
            setLoading(false)
        }
        fetchEvents()
    }, [])

    return (
        <div className="min-h-screen bg-surface p-6">
            <header className="mb-8 flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold">Select Event</h1>
                    <p className="text-muted-foreground">Choose an event to moderate</p>
                </div>
                <form action="/auth/signout" method="post">
                    <Button variant="outline" size="sm">
                        <LogOut className="mr-2 h-4 w-4" /> Sign Out
                    </Button>
                </form>
            </header>

            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {events.map((event) => (
                    <Card key={event.id} className="hover:bg-muted/50 transition-colors">
                        <CardHeader className="pb-2">
                            <CardTitle>{event.name}</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="mb-4 flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Code: <span className="font-mono font-bold text-foreground">{event.event_code}</span></span>
                            </div>
                            <Button className="w-full" asChild>
                                <Link href={`/moderate/${event.id}`}>
                                    Open Dashboard <ArrowRight className="ml-2 h-4 w-4" />
                                </Link>
                            </Button>
                        </CardContent>
                    </Card>
                ))}

                {!loading && events.length === 0 && (
                    <div className="col-span-full py-12 text-center text-muted-foreground">
                        No events found. Ask an admin to create one.
                    </div>
                )}
            </div>
        </div>
    )
}
