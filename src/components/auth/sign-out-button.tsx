"use client";

import { LogOut } from "lucide-react";
import { signOut } from "@/features/auth/actions";
import { ProfileSettingsCard, ProfileSettingsRow } from "@/components/profile/profile-settings";

export function SignOutButton({ embedded }: { embedded?: boolean }) {
  if (embedded) {
    return (
      <form action={signOut}>
        <ProfileSettingsRow
          type="submit"
          icon={LogOut}
          label="Log out"
          chevron="none"
          destructive
        />
      </form>
    );
  }

  return (
    <form action={signOut}>
      <ProfileSettingsCard>
        <ProfileSettingsRow
          type="submit"
          icon={LogOut}
          label="Log out"
          chevron="none"
          destructive
        />
      </ProfileSettingsCard>
    </form>
  );
}
