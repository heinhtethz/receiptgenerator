"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import Link from "next/link";
import { supabase } from "@/lib/supabase/client";

export default function ForgotPasswordPage() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");
  const [isError, setIsError] = useState(false);

  async function handleResetPassword(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setMessage("");
    setIsError(false);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/auth/update-password`,
      });

      if (error) throw error;

      setMessage("A password reset link has been sent to your email.");
    } catch (error) {
      console.error("Error resetting password:", error);
      setIsError(true);
      if (error instanceof Error) {
        setMessage(error.message);
      } else {
        setMessage("Unexpected error occur");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex bg-muted/40 h-[calc(100vh-64px)] justify-center items-center">
      <Card className="w-full max-w-sm flex flex-col gap-6 border-2 border-gray-600 rounded-4xl py-4">
        <CardHeader>
          <CardTitle className="text-center">Reset Password</CardTitle>
          <CardDescription className="text-center">
            Type your email address
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleResetPassword}>
            <div className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="email">Email</Label>
                <Input
                  id="email"
                  type="email"
                  placeholder="m@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {message && (
                <div
                  className={`text-sm text-center font-medium ${isError ? "text-destructive" : "text-emerald-600"}`}
                >
                  {message}
                </div>
              )}

              <Button
                type="submit"
                className="w-full mt-2"
                disabled={isLoading}
              >
                {isLoading ? "Sending..." : "Send Reset Link"}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-4">
          <div className="text-sm text-center text-muted-foreground mt-2">
            <Link
              href="/auth/signin"
              className="text-primary hover:underline font-medium"
            >
              Back to Login Page
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
