"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { createClient } from "@/lib/supabase/client"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { useToast } from "@/hooks/use-toast"
import Link from "next/link"
import { Loader2 } from "lucide-react"

export default function LoginPage() {
    const [email, setEmail] = useState("")
    const [password, setPassword] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const router = useRouter()
    const { toast } = useToast()
    const supabase = createClient()

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsLoading(true)

        // 1. Authenticate with Supabase Auth
        const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
            email,
            password,
        })

        if (authError || !authData.user) {
            toast({
                title: "Login Failed",
                description: authError?.message || "Invalid credentials",
                variant: "destructive",
            })
            setIsLoading(false)
            return
        }

        // 2. Check User Role in Public Table
        const { data: userData, error: userError } = await supabase
            .from("users")
            .select("role")
            .eq("id", authData.user.id)
            .single()

        if (userError || !userData) {
            toast({
                title: "Access Denied",
                description: "User role not found. Contact administrator.",
                variant: "destructive",
            })
            // Optional: Sign out if role check fails
            await supabase.auth.signOut()
            setIsLoading(false)
            return
        }

        // 3. Redirect based on Role
        toast({
            title: "Welcome back!",
            description: `Logging in as ${userData.role}...`,
        })

        if (userData.role === 'admin') {
            router.push("/admin")
        } else if (userData.role === 'moderator') {
            router.push("/moderate")
        } else {
            // Fallback
            router.push("/")
        }

        router.refresh()
    }

    return (
        <div className="flex min-h-screen items-center justify-center bg-muted/30 p-4">
            <Card className="w-full max-w-md shadow-lg">
                <CardHeader className="space-y-1 text-center">
                    <CardTitle className="text-2xl font-bold">Staff Portal</CardTitle>
                    <CardDescription>Enter your credentials to continue</CardDescription>
                </CardHeader>
                <CardContent>
                    <form onSubmit={handleLogin} className="space-y-4">
                        <div className="space-y-2">
                            <Input
                                type="email"
                                placeholder="Email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                required
                            />
                        </div>
                        <div className="space-y-2">
                            <Input
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                required
                            />
                        </div>
                        <Button className="w-full" size="lg" disabled={isLoading}>
                            {isLoading ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : null}
                            Login
                        </Button>
                    </form>
                    <div className="mt-4 text-center text-sm">
                        <Link href="/" className="text-primary hover:underline">
                            Back into Event Entry
                        </Link>
                    </div>
                </CardContent>
            </Card>
        </div>
    )
}
