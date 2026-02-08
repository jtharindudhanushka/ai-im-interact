import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export default function Home() {
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
            <form action="/api/join" method="POST" className="space-y-4">
              {/* For MVP, we'll just redirect via client side or separate form component */}
              <Input placeholder="Enter Event Code" className="text-center text-lg" />
              <Button className="w-full text-lg" size="lg">
                Enter Event
              </Button>
            </form>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <span className="w-full border-t" />
              </div>
              <div className="relative flex justify-center text-xs uppercase">
                <span className="bg-card px-2 text-muted-foreground">Or</span>
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <Button variant="outline" asChild>
                <Link href="/admin/login">Host Login</Link>
              </Button>
              <Button variant="outline" asChild>
                <Link href="/moderate/login">Moderator</Link>
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
