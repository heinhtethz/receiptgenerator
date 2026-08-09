"use client";

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { supabase } from "@/lib/supabase/client";
import { CircleUser } from "lucide-react";
import { HoverCard, HoverCardContent, HoverCardTrigger } from "./ui/hover-card";
import Link from "next/link";

export function AccountDropdown({ email }: { email: string | undefined }) {
  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = "/auth/login";
  };

  return (
    <DropdownMenu>
      <DropdownMenuTrigger className="outline-none">
        <HoverCard openDelay={0} closeDelay={0}>
          <HoverCardTrigger asChild>
            <div className="w-8 h-8 flex items-center justify-center rounded-full bg-mauve-950">
              <CircleUser size={25} className="text-white" />
            </div>
          </HoverCardTrigger>
          <HoverCardContent className="w-fit" align={"center"}>
            <div className="font-semibold">Account Settings</div>
          </HoverCardContent>
        </HoverCard>
      </DropdownMenuTrigger>
      <DropdownMenuContent className="w-fit mr-2" align="start">
        <DropdownMenuGroup>
          <h3 className="font-semibold text-sm p-1">{email}</h3>
          <DropdownMenuSeparator />
          <DropdownMenuItem asChild>
            <Link href={"/account"} className="flex justify-between w-full">
              <span>Account</span>
            </Link>
          </DropdownMenuItem>
          <DropdownMenuItem>Billing</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem>Support</DropdownMenuItem>
          <DropdownMenuItem disabled>API</DropdownMenuItem>
        </DropdownMenuGroup>
        <DropdownMenuSeparator />
        <DropdownMenuGroup>
          <DropdownMenuItem onClick={handleLogout}>Log out</DropdownMenuItem>
        </DropdownMenuGroup>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
