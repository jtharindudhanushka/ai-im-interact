"use client"

import { useEffect, useState } from "react"
import { Maximize2, Minimize2 } from "lucide-react"
import { Button } from "@/components/ui/button"

interface DisplayHeaderProps {
    eventCode: string
    eventName: string
}

export function DisplayHeader({ eventCode, eventName }: DisplayHeaderProps) {
    const [host, setHost] = useState("")
    const [isFullscreen, setIsFullscreen] = useState(false)

    useEffect(() => {
        setHost(window.location.host)

        const handleFullscreenChange = () => {
            setIsFullscreen(!!document.fullscreenElement)
        }
        document.addEventListener("fullscreenchange", handleFullscreenChange)
        return () => document.removeEventListener("fullscreenchange", handleFullscreenChange)
    }, [])

    const toggleFullscreen = () => {
        if (!document.fullscreenElement) {
            document.documentElement.requestFullscreen()
        } else {
            document.exitFullscreen()
        }
    }

    return (
        <div className="absolute top-6 left-8 z-10 space-y-2 max-w-md">
            <h1 className="text-4xl font-extrabold tracking-tight text-foreground/90 drop-shadow-sm">{eventName}</h1>

            <div className="flex flex-wrap items-center gap-3">
                <div className="flex items-center gap-3 bg-surface/60 backdrop-blur-md px-5 py-2.5 rounded-full border shadow-sm transition-all hover:bg-surface/80">
                    <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Join at</span>
                    <code className="text-xl font-bold text-primary tracking-tight">{host || "Loading..."}</code>
                    <div className="h-4 w-px bg-border mx-1" />
                    <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Code</span>
                    <code className="text-xl font-bold text-primary tracking-tight">{eventCode}</code>
                </div>

                <Button
                    variant="outline"
                    size="icon"
                    onClick={toggleFullscreen}
                    className="rounded-full bg-surface/60 backdrop-blur-md border shadow-sm hover:bg-surface/80 h-12 w-12"
                    title="Toggle Fullscreen"
                >
                    {isFullscreen ? (
                        <Minimize2 className="h-5 w-5 text-muted-foreground" />
                    ) : (
                        <Maximize2 className="h-5 w-5 text-muted-foreground" />
                    )}
                </Button>
            </div>
        </div>
    )
}
