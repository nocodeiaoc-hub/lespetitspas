"use client";

import { LogOut } from "lucide-react";
import { signOut } from "@/app/actions";
import { Button } from "@/components/ui/button";

export function LogoutButton() {
  return (
    <form action={signOut}>
      <Button
        type="submit"
        variant="ghost"
        className="h-11 px-3 text-ink-soft hover:text-ink"
      >
        <LogOut />
        <span className="hidden sm:inline">Se déconnecter</span>
      </Button>
    </form>
  );
}
