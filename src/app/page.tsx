"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function Home() {
  const [eventCode, setEventCode] = useState("")
  const router = useRouter()

  const handleJoin = (e: React.FormEvent) => {
    e.preventDefault()
    if (eventCode.trim()) {
      router.push(`/event/${eventCode.trim()}`)
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center bg-surface p-4 text-center">
      <div className="w-full max-w-md space-y-8">
        <div className="space-y-2">
          <h1 className="text-4xl font-bold tracking-tight">AI & IM</h1>
          <p className="text-muted-foreground">Live User Engagement Portal</p>
        </div>

        <Card className="border-0 shadow-lg ring-1 ring-black/5 dark:ring-white/10">
          <CardHeader>
            <CardTitle>Join Event</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <form onSubmit={handleJoin} className="space-y-4">
              <Input
                placeholder="Enter Event Code"
                className="text-center text-lg shadow-sm"
                value={eventCode}
                onChange={(e) => setEventCode(e.target.value)}
              />
              <Button type="submit" className="w-full text-lg shadow-md" size="lg" disabled={!eventCode.trim()}>
                Enter Event
              </Button>
            </form>


          </CardContent>
        </Card>
      </div>
    </div>
  )
}
