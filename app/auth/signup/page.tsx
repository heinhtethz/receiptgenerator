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

export default function SignUpPage() {
  const router = useRouter();

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function handleEmailSignUp(e: React.FormEvent) {
    e.preventDefault();
    setIsLoading(true);
    setErrorMessage("");

    if (password !== confirmPassword) {
      setErrorMessage("Passwords do not match. Please try again.");
      setIsLoading(false);
      return;
    }

    try {
      const { data, error: signUpError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            full_name: name,
          },
        },
      });

      if (signUpError && signUpError.message.includes("rate limit")) {
        setErrorMessage(
          "Too many attempts. Please wait a little while and try again.",
        );
        return;
      }

      if (
        signUpError &&
        signUpError.message.includes("User already registered")
      ) {
        const { error: signInError } = await supabase.auth.signInWithPassword({
          email,
          password,
        });

        if (signInError) {
          if (signInError.message.includes("rate limit")) {
            setErrorMessage(
              "Too many login attempts. Please wait a little while and try again.",
            );
            return;
          }
          setErrorMessage(
            "An account exists for this email, but the password was incorrect.",
          );
          return;
        }

        router.push("/");
        return;
      }

      if (signUpError) throw signUpError;

      if (data.session) {
        await supabase.auth.signOut();
      }

      router.push("/auth/signin");
    } catch (error) {
      console.error("Error with authentication:", error);
      if (error instanceof Error) {
        setErrorMessage(error.message);
      } else {
        setErrorMessage("An unexpected error occurred.");
      }
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="flex flex-1 min-h-[calc(100dvh-4rem)] w-full items-center justify-center p-4 sm:p-6 py-8 bg-muted/40">
      <Card className="w-full max-w-sm border-border shadow-sm rounded-xl">
        <CardHeader className="space-y-1">
          <CardTitle className="text-xl sm:text-2xl text-center">
            Create Account
          </CardTitle>
          <CardDescription className="text-center text-sm">
            Enter your details below to create a new account or log in
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleEmailSignUp}>
            <div className="flex flex-col gap-4">
              <div className="grid gap-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  placeholder="John Doe"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

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

              <div className="grid gap-2">
                <Label htmlFor="password">Password</Label>
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              <div className="grid gap-2">
                <Label htmlFor="confirmPassword">Confirm Password</Label>
                <Input
                  id="confirmPassword"
                  type="password"
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  required
                  disabled={isLoading}
                />
              </div>

              {/* Error Message Display */}
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
                {isLoading ? "Processing..." : "Continue with Email"}
              </Button>
            </div>
          </form>
        </CardContent>
        <CardFooter className="flex-col gap-2">
          <div className="text-sm text-center text-muted-foreground">
            <span>Already have an account? </span>
            <Link
              href="/auth/signin"
              className="text-primary hover:underline font-medium"
            >
              Sign in
            </Link>
          </div>
        </CardFooter>
      </Card>
    </div>
  );
}
