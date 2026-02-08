"use client"

import { useState, useEffect } from "react"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { useToast } from "@/hooks/use-toast"
import { Plus, Trash, Play, Square, AreaChart } from "lucide-react"
import type { Database } from "@/types/database.types"

type Event = Database["public"]["Tables"]["events"]["Row"]
type Poll = Database["public"]["Tables"]["polls"]["Row"]

export default function AdminDashboard() {
    const [events, setEvents] = useState<Event[]>([])
    const [selectedEventId, setSelectedEventId] = useState<string | null>(null)
    const [newEventName, setNewEventName] = useState("")
    const [newEventCode, setNewEventCode] = useState("")
    const [polls, setPolls] = useState<Poll[]>([])

    // New Poll State
    const [newPollQuestion, setNewPollQuestion] = useState("")
    const [newPollOptions, setNewPollOptions] = useState([{ id: 'opt1', text: '', votes: 0 }, { id: 'opt2', text: '', votes: 0 }])

    const supabase = createClient()
    const { toast } = useToast()

    // Fetch Events
    useEffect(() => {
        const fetchEvents = async () => {
            const { data } = await supabase.from("events").select("*").order("created_at", { ascending: false })
            if (data) setEvents(data)
        }
        fetchEvents()
    }, [])

    // Fetch Polls when event selected
    useEffect(() => {
        if (!selectedEventId) return
        const fetchPolls = async () => {
            const { data } = await supabase.from("polls").select("*").eq("event_id", selectedEventId).order("created_at", { ascending: false })
            if (data) setPolls(data)
        }
        fetchPolls()
    }, [selectedEventId])

    const createEvent = async () => {
        if (!newEventName || !newEventCode) return

        // Auth check should be here or in RLS, for MVP assuming admin logged in or public dev mode
        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            toast({ title: "Error", description: "Not authenticated", variant: "destructive" })
            return
        }

        const { data, error } = await supabase.from("events").insert({
            name: newEventName,
            event_code: newEventCode,
            created_by: user.id
        }).select().single()

        if (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" })
        } else if (data) {
            setEvents([data, ...events])
            setNewEventName("")
            setNewEventCode("")
            toast({ title: "Event Created", description: "Event is ready." })
        }
    }

    const createPoll = async () => {
        if (!selectedEventId || !newPollQuestion || newPollOptions.some(o => !o.text)) return

        const { data, error } = await supabase.from("polls").insert({
            event_id: selectedEventId,
            question: newPollQuestion,
            options: newPollOptions,
            active: false
        }).select().single()

        if (error) {
            toast({ title: "Error", description: error.message, variant: "destructive" })
        } else if (data) {
            setPolls([data, ...polls])
            setNewPollQuestion("")
            setNewPollOptions([{ id: 'opt1', text: '', votes: 0 }, { id: 'opt2', text: '', votes: 0 }])
            toast({ title: "Poll Created", description: "Poll added to list." })
        }
    }

    const togglePollStatus = async (poll: Poll) => {
        const newStatus = !poll.active

        // If activating, deactivate others? Ideally yes for single active poll requirement
        if (newStatus) {
            await supabase.from("polls").update({ active: false }).eq("event_id", selectedEventId)
        }

        const { error } = await supabase
            .from("polls")
            .update({ active: newStatus })
            .eq("id", poll.id)

        if (!error) {
            // Optimistic update or refetch
            setPolls(prev => prev.map(p => {
                if (p.id === poll.id) return { ...p, active: newStatus }
                if (newStatus && p.id !== poll.id) return { ...p, active: false }
                return p
            }))
        }
    }

    return (
        <div className="container mx-auto p-6 max-w-6xl">
            <h1 className="text-3xl font-bold mb-8">Admin Dashboard</h1>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                {/* Left: Events List */}
                <div className="space-y-6">
                    <Card>
                        <CardHeader>
                            <CardTitle>Create Event</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-4">
                            <div className="space-y-2">
                                <Label>Event Name</Label>
                                <Input value={newEventName} onChange={e => setNewEventName(e.target.value)} placeholder="Townhall 2024" />
                            </div>
                            <div className="space-y-2">
                                <Label>Event Code (Unique)</Label>
                                <Input value={newEventCode} onChange={e => setNewEventCode(e.target.value)} placeholder="TH2024" />
                            </div>
                            <Button onClick={createEvent} className="w-full">Create Event</Button>
                        </CardContent>
                    </Card>

                    <Card>
                        <CardHeader>
                            <CardTitle>Your Events</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-2 max-h-[400px] overflow-y-auto">
                            {events.map(event => (
                                <div
                                    key={event.id}
                                    onClick={() => setSelectedEventId(event.id)}
                                    className={`p-4 rounded-lg border cursor-pointer hover:bg-muted/50 transition-colors ${selectedEventId === event.id ? 'border-primary bg-muted/30' : ''}`}
                                >
                                    <div className="font-bold">{event.name}</div>
                                    <div className="text-sm text-muted-foreground">{event.event_code}</div>
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Right: Event Details & Polls */}
                <div className="md:col-span-2">
                    {selectedEventId ? (
                        <Tabs defaultValue="overview">
                            <TabsList>
                                <TabsTrigger value="overview">Overview</TabsTrigger>
                                <TabsTrigger value="polls">Polls</TabsTrigger>
                                <TabsTrigger value="settings">Settings</TabsTrigger>
                            </TabsList>

                            <TabsContent value="overview" className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <Card>
                                        <CardHeader className="pb-2"><CardTitle className="text-sm">Participant Link</CardTitle></CardHeader>
                                        <CardContent><code className="text-xs bg-muted p-2 rounded block break-all">{`${window.location.origin}/event/${events.find(e => e.id === selectedEventId)?.event_code}`}</code></CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="pb-2"><CardTitle className="text-sm">Moderator Link</CardTitle></CardHeader>
                                        <CardContent><code className="text-xs bg-muted p-2 rounded block break-all">{`${window.location.origin}/moderate/${selectedEventId}`}</code></CardContent>
                                    </Card>
                                    <Card>
                                        <CardHeader className="pb-2"><CardTitle className="text-sm">Display Link</CardTitle></CardHeader>
                                        <CardContent><code className="text-xs bg-muted p-2 rounded block break-all">{`${window.location.origin}/display/${selectedEventId}`}</code></CardContent>
                                    </Card>
                                </div>
                            </TabsContent>

                            <TabsContent value="polls" className="space-y-6">
                                <Card>
                                    <CardHeader>
                                        <CardTitle>Create New Poll</CardTitle>
                                    </CardHeader>
                                    <CardContent className="space-y-4">
                                        <div className="space-y-2">
                                            <Label>Question</Label>
                                            <Input value={newPollQuestion} onChange={e => setNewPollQuestion(e.target.value)} placeholder="What is your favorite color?" />
                                        </div>
                                        <div className="space-y-2">
                                            <Label>Options</Label>
                                            {newPollOptions.map((opt, idx) => (
                                                <div key={idx} className="flex gap-2">
                                                    <Input
                                                        value={opt.text}
                                                        onChange={e => {
                                                            const newOpts = [...newPollOptions]
                                                            newOpts[idx].text = e.target.value
                                                            setNewPollOptions(newOpts)
                                                        }}
                                                        placeholder={`Option ${idx + 1}`}
                                                    />
                                                </div>
                                            ))}
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => setNewPollOptions([...newPollOptions, { id: `opt${newPollOptions.length + 1}`, text: '', votes: 0 }])}
                                            >
                                                <Plus className="h-4 w-4 mr-2" /> Add Option
                                            </Button>
                                        </div>
                                        <Button onClick={createPoll}>Create Poll</Button>
                                    </CardContent>
                                </Card>

                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold">Existing Polls</h3>
                                    {polls.map(poll => (
                                        <Card key={poll.id} className="overflow-hidden">
                                            <div className="flex items-center justify-between p-4 bg-muted/40">
                                                <div className="font-medium">{poll.question}</div>
                                                <div className="flex items-center gap-2">
                                                    {poll.active ? (
                                                        <Button size="sm" variant="destructive" onClick={() => togglePollStatus(poll)}>
                                                            <Square className="h-4 w-4 mr-2" /> Stop
                                                        </Button>
                                                    ) : (
                                                        <Button size="sm" className="bg-green-600 hover:bg-green-700" onClick={() => togglePollStatus(poll)}>
                                                            <Play className="h-4 w-4 mr-2" /> Start Live
                                                        </Button>
                                                    )}
                                                </div>
                                            </div>
                                        </Card>
                                    ))}
                                </div>
                            </TabsContent>
                        </Tabs>
                    ) : (
                        <div className="flex h-full items-center justify-center text-muted-foreground">
                            Select an event to manage
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
