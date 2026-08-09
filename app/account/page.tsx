"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { supabase } from "@/lib/supabase/client";
import ConfirmDeleteDialogButton from "@/components/ConfirmDeleteDialogButton";

export default function ProfileComponent() {
  const [userData, setUserData] = useState({ name: "", email: "", image: "" });
  const [initialUserData, setInitialUserData] = useState({
    initialName: "",
    initialEmail: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState("");

  useEffect(() => {
    const loadUser = async () => {
      const {
        data: { user },
      } = await supabase.auth.getUser();

      if (user) {
        const loadedEmail = user.email || "";
        const loadedName = user.user_metadata?.full_name || "";
        const loadedImage = user.user_metadata.avatar_url || "";

        setUserData((prev) => ({
          ...prev,
          name: loadedName,
          email: loadedEmail,
          image: loadedImage,
        }));
        setInitialUserData((prev) => ({
          ...prev,
          initialName: loadedName,
          initialEmail: loadedEmail,
        }));
      }
    };
    loadUser();
  }, []);

  const seed = encodeURIComponent(userData.name || "default");
  const avatarUrl = `https://ui-avatars.com/api/?name=${seed}&background=random&size=128`;

  const hasEmailChange = userData.email !== initialUserData.initialEmail;
  const hasNameChange = userData.name !== initialUserData.initialName;
  const hasChanges = hasNameChange || hasEmailChange;

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setMessage("");
    setIsLoading(true);

    try {
      const updates: { email?: string; data?: { full_name: string } } = {};

      if (hasEmailChange) {
        updates.email = userData.email;
      }

      if (hasNameChange) {
        updates.data = { full_name: userData.name };
      }

      if (!hasNameChange && !hasEmailChange) {
        setIsLoading(false);
        return;
      }

      const { data, error } = await supabase.auth.updateUser(updates);

      if (error) {
        console.error("Supabase Update Error:", error);
        alert(`FAILED: ${error.message}`);
        setIsLoading(false);
        return;
      }

      if (hasEmailChange && data.user?.new_email) {
        setMessage(
          "Success! Please check your new email address for a confirmation link to complete the email change.",
        );
      } else {
        setMessage("Profile updated successfully!");
      }

      setInitialUserData((prev) => ({
        ...prev,
        initialName: userData.name,
        initialEmail: userData.email,
      }));
    } catch (error) {
      if (error instanceof Error) setMessage(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="h-[calc(100vh-64px)] flex flex-col items-center gap-5 bg-muted/40 p-4">
      <Card className="w-full max-w-md shadow-lg">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl">Account Settings</CardTitle>
          <CardDescription>Manage your profile and email.</CardDescription>
        </CardHeader>

        <form onSubmit={handleSubmit}>
          <CardContent className="space-y-6">
            <div className="flex justify-center">
              <Avatar className="h-28 w-28 border-4 border-background shadow-sm">
                <AvatarImage
                  src={userData.image ? userData.image : avatarUrl}
                  alt="Profile picture"
                />
                <AvatarFallback className="text-2xl font-bold bg-primary text-primary-foreground">
                  {userData.name ? userData.name.charAt(0).toUpperCase() : "?"}
                </AvatarFallback>
              </Avatar>
            </div>

            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name</Label>
                <Input
                  id="name"
                  type="text"
                  value={userData.name}
                  onChange={(e) =>
                    setUserData((prev) => ({ ...prev, name: e.target.value }))
                  }
                  placeholder="Enter your name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address</Label>
                <Input
                  id="email"
                  type="email"
                  value={userData.email}
                  onChange={(e) =>
                    setUserData((prev) => ({ ...prev, email: e.target.value }))
                  }
                  placeholder="Enter your email"
                  required
                />
              </div>
              {message && (
                <p
                  className={`text-sm text-center font-medium ${message.includes("Error") ? "text-red-500" : "text-green-600"}`}
                >
                  {message}
                </p>
              )}
            </div>

            <Button
              type="submit"
              className="w-full"
              disabled={isLoading || !hasChanges}
            >
              {isLoading ? "Saving..." : "Save Changes"}
            </Button>
          </CardContent>
        </form>
      </Card>
      <Card className="w-full max-w-md shadow-lg border border-destructive">
        <CardHeader>
          <CardTitle className="text-destructive text-lg">
            Danger Zone
          </CardTitle>
          <CardDescription>
            Permanently delete your account and data.
          </CardDescription>
        </CardHeader>
        <CardAction className="w-full p-3">
          <ConfirmDeleteDialogButton />
        </CardAction>
      </Card>
    </div>
  );
}
