"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
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

export default function UpdatePasswordPage() {
  const router = useRouter();
  const [newPassword, setNewPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleUpdatePassword(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    if (newPassword !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please try again.");
      setIsLoading(false);
      return;
    }

    try {
      const { error } = await supabase.auth.updateUser({
        password: newPassword,
      });

      if (error) throw error;

      router.push("/auth/signin");
    } catch (error) {
      console.error("Error updating password:", error);

      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("Unexpected error occurred");
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
            Update Password
          </CardTitle>
          <CardDescription className="text-center text-sm">
            Enter your new password below to update your account
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleUpdatePassword}>
            <div className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="password">New Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm New Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {errorMessage && (
                <div className="text-sm text-destructive text-center font-medium">
                  {errorMessage}
                </div>
              )}

              <Button
                type="submit"
                className="w-full mt-2"
                disabled={isLoading}
              >
                {isLoading ? "Updating..." : "Update Password"}
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
