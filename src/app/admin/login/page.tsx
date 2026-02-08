import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import Link from "next/link"

export default function AdminLoginPage() {
    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
            <Card className="w-full max-w-md shadow-lg border-primary/20">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold">Admin Portal</CardTitle>
                    <CardDescription>Login to manage events and polls</CardDescription>
                </CardHeader>
                <CardContent>
                    <form className="space-y-4">
                        <div className="space-y-2">
                            <Input type="email" placeholder="Email" />
                        </div>
                        <div className="space-y-2">
                            <Input type="password" placeholder="Password" />
                        </div>
                        <Button className="w-full" size="lg">Login</Button>
                    </form>
                    <div className="mt-4 text-center text-sm">
                        <Link href="/" className="text-primary hover:underline">
                            Back to Home
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
