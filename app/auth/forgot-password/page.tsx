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
        setMessage("Unexpected error occurred");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-1 min-h-[calc(100dvh-4rem)] w-full items-center justify-center p-4 sm:p-6 bg-muted/40">
      <Card className="w-full max-w-sm border-border shadow-sm rounded-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl sm:text-2xl text-center">
            Reset Password
          </CardTitle>
          <CardDescription className="text-center text-sm">
            Enter your email address to receive a password reset link
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
                  className={`text-sm text-center font-medium ${
                    isError
                      ? "text-destructive"
                      : "text-emerald-600 dark:text-emerald-400"
                  }`}
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
        <CardFooter className="flex-col gap-2">
          <div className="text-sm text-center text-muted-foreground">
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
