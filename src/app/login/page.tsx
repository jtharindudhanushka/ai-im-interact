import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";

export default function LoginPage() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-surface p-4 text-center">
            <div className="w-full max-w-md space-y-8">
                <div className="space-y-2">
                    <h1 className="text-3xl font-bold tracking-tight">Login Checkpoint</h1>
                    <p className="text-muted-foreground">Select your role to continue</p>
                </div>

                <Card className="border-0 shadow-lg ring-1 ring-black/5 dark:ring-white/10">
                    <CardHeader>
                        <CardTitle>Choose Login Type</CardTitle>
                        <CardDescription>Are you hosting or moderating?</CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-4">
                        <Button className="w-full text-lg" size="lg" asChild>
                            <Link href="/admin/login">Host (Admin) Login</Link>
                        </Button>

                        <div className="relative">
                            <div className="absolute inset-0 flex items-center">
                                <span className="w-full border-t" />
                            </div>
                            <div className="relative flex justify-center text-xs uppercase">
                                <span className="bg-card px-2 text-muted-foreground">Or</span>
                            </div>
                        </div>

                        <Button variant="outline" className="w-full text-lg" size="lg" asChild>
                            <Link href="/moderate/login">Moderator Login</Link>
                        </Button>

                        <div className="mt-4 text-sm text-muted-foreground">
                            <Link href="/" className="hover:underline">← Back to Event Entry</Link>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
