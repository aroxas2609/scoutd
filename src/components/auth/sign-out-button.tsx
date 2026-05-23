"use client";

import { LogOut } from "lucide-react";
import { signOut } from "@/features/auth/actions";
import { Button } from "@/components/ui/button";

export function SignOutButton() {
  return (
    <form action={signOut}>
      <Button
        type="submit"
        variant="outline"
        className="w-full gap-2 border-white/10 bg-white/5 text-muted-foreground hover:text-white"
      >
        <LogOut className="h-4 w-4" />
        Log out
      </Button>
    </form>
  );
}
