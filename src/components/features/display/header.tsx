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
        <div className="w-full grid grid-cols-[1fr_auto_1fr] items-center px-8 py-6 bg-background/50 backdrop-blur-md border-b border-white/10 relative z-50 gap-4">
            {/* Left: Event Name */}
            <h1 className="text-4xl md:text-5xl font-extrabold tracking-tight text-foreground/90 drop-shadow-sm pointer-events-auto justify-self-start truncate max-w-full">
                {eventName}
            </h1>

            {/* Center: Join Info */}
            <div className="pointer-events-auto justify-self-center">
                <div className="flex items-center gap-4 bg-surface/80 backdrop-blur-xl px-6 py-3 rounded-full border border-white/10 shadow-lg transition-all hover:scale-105 hover:bg-surface/90 hover:shadow-xl">
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Join at</span>
                        <code className="text-2xl font-bold text-primary tracking-tight">{host || "Loading..."}</code>
                    </div>
                    <div className="h-6 w-px bg-border/50" />
                    <div className="flex items-center gap-2">
                        <span className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Code</span>
                        <code className="text-2xl font-bold text-primary tracking-tight">{eventCode}</code>
                    </div>
                </div>
            </div>

            {/* Right: Actions */}
            <div className="pointer-events-auto justify-self-end">
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
