import { notFound, redirect } from "next/navigation"
import { createClient } from "@/lib/supabase/server"
import { QuestionQueue } from "@/components/features/moderator/question-queue"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ShieldAlert, LogOut } from "lucide-react"
import Link from "next/link"

interface PageProps {
    params: {
        id: string
    }
}

export default async function ModeratorPage({ params }: PageProps) {
    const eventId = params.id
    const supabase = await createClient()

    // Verify Auth
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
        redirect("/moderate/login")
    }

    // Verify Event & Access
    const { data: event } = await supabase
        .from("events")
        .select("*")
        .eq("id", eventId)
        .single()

    if (!event) {
        notFound()
    }

    // TODO: Check if user is actually a moderator for this event via `event_access` table

    return (
        <div className="min-h-screen bg-surface pb-20">
            <header className="border-b bg-surface px-6 py-4">
                <div className="mx-auto flex max-w-6xl items-center justify-between">
                    <div className="flex items-center gap-3">
                        <ShieldAlert className="h-6 w-6 text-primary" />
                        <div>
                            <h1 className="text-xl font-bold tracking-tight">Moderator Dashboard</h1>
                            <p className="text-xs text-muted-foreground">{event.name} ({event.event_code})</p>
                        </div>
                    </div>
                    <div className="flex gap-4">
                        <Button variant="ghost" size="sm" asChild>
                            <Link href={`/display/${eventId}`} target="_blank">Open Display</Link>
                        </Button>
                        <form action="/auth/signout" method="post">
                            <Button variant="outline" size="icon" className="rounded-full">
                                <LogOut className="h-4 w-4" />
                            </Button>
                        </form>
                    </div>
                </div>
            </header>

            <main className="container mx-auto max-w-4xl p-6">
                <div className="grid gap-6 md:grid-cols-3">
                    {/* Main Queue - Takes up 2/3 space */}
                    <div className="md:col-span-2">
                        <QuestionQueue eventId={eventId} />
                    </div>

                    {/* Sidebar - Stats & Info */}
                    <div className="space-y-6">
                        <Card>
                            <CardHeader>
                                <CardTitle className="text-sm font-medium uppercase text-muted-foreground">Session Info</CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="flex justify-between">
                                    <span className="text-sm">Status</span>
                                    <span className="font-mono font-bold text-green-600 uppercase">{event.status}</span>
                                </div>
                                <div className="flex justify-between">
                                    <span className="text-sm">Code</span>
                                    <span className="font-mono font-bold">{event.event_code}</span>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="bg-muted/30">
                            <CardContent className="p-4 text-center text-sm text-muted-foreground">
                                <p>Keyboard Shortcuts:</p>
                                <div className="mt-2 flex justify-center gap-4">
                                    <span className="rounded border bg-background px-2 py-1 font-mono text-xs">A / →</span>
                                    <span className="rounded border bg-background px-2 py-1 font-mono text-xs">R / ←</span>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </main>
        </div>
    )
}
