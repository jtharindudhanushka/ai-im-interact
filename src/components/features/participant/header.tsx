"use client"

import { ModeToggle } from "@/components/ui/mode-toggle"
import { Button } from "@/components/ui/button"
import { HelpCircle } from "lucide-react"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog"

interface ParticipantHeaderProps {
    eventName: string
}

export function ParticipantHeader({ eventName }: ParticipantHeaderProps) {
    return (
        <header className="sticky top-0 z-10 bg-surface/80 px-6 py-4 backdrop-blur-md border-b border-border/40 supports-[backdrop-filter]:bg-surface/60">
            <div className="mx-auto max-w-lg flex items-center justify-between">
                <div>
                    <p className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                        {eventName}
                    </p>
                    <h1 className="text-xl font-bold tracking-tight text-foreground">
                        Live Interaction
                    </h1>
                </div>
                <div className="flex items-center gap-2">
                    <ModeToggle />

                    <Dialog>
                        <DialogTrigger asChild>
                            <Button variant="ghost" size="icon" className="rounded-full">
                                <HelpCircle className="h-[1.2rem] w-[1.2rem]" />
                                <span className="sr-only">Help</span>
                            </Button>
                        </DialogTrigger>
                        <DialogContent>
                            <DialogHeader>
                                <DialogTitle>About AI@IM Portal</DialogTitle>
                                <DialogDescription>
                                    This application allows real-time interaction during AI@IM sessions.
                                </DialogDescription>
                            </DialogHeader>
                            <div className="space-y-4 text-sm text-muted-foreground">
                                <p>
                                    <strong>Ask a Question:</strong> Submit your questions for the speakers. Moderators will review them before they appear on the main screen.
                                </p>
                                <p>
                                    <strong>Live Polls:</strong> Participate in polls created by the presenters in real-time.
                                </p>
                                <div className="rounded-lg bg-muted p-3 text-xs italic">
                                    <span className="font-semibold not-italic">Privacy Notice:</span> Your participation is fully anonymous. No user IDs or personal data are collected or displayed.
                                </div>
                                <p className="pt-2 text-xs text-center border-t">
                                    Developed for the AI@IM Community.
                                </p>
                            </div>
                        </DialogContent>
                    </Dialog>
                </div>
            </div>
        </header>
    )
}
