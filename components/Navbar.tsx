"use client";

import Link from "next/link";
import Logo from "./Logo";
import { useEffect, useState } from "react";
import { usePathname } from "next/navigation";
import { User } from "@supabase/supabase-js";
import { supabase } from "@/lib/supabase/client";
import { AccountDropdown } from "./AccountDropdown";

export default function Navbar() {
  const [isVisible, setIsVisible] = useState(true);
  const [user, setUser] = useState<User | null>(null);
  const pathname = usePathname();

  // Handle scroll visibility
  useEffect(() => {
    let prevScrollPos = window.scrollY;
    const handleScroll = () => {
      const currentScrollPos = window.scrollY;
      setIsVisible(prevScrollPos > currentScrollPos || currentScrollPos < 10);
      prevScrollPos = currentScrollPos;
    };
    window.addEventListener("scroll", handleScroll);
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  // Listen to Supabase auth changes
  useEffect(() => {
    // Get initial session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setUser(session?.user ?? null);
    });

    // Subscribe to auth state changes (login/logout)
    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (pathname.startsWith("/auth")) return null;
  return (
    <header
      className={`sticky top-0 z-50 w-full flex justify-center border-b bg-background/95 backdrop-blur transition-transform duration-300 ease-in-out ${
        isVisible ? "translate-y-0" : "-translate-y-full"
      }`}
    >
      <div className="w-full h-14 flex items-center justify-between px-5 sm:px-10">
        <Link href="/" className="font-bold text-xl">
          <Logo />
        </Link>
        <nav className="flex items-center gap-2">
          {user && <AccountDropdown email={user.email} />}
        </nav>
      </div>
    </header>
  );
}
