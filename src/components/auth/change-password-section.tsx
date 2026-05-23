"use client";

import { useState } from "react";
import { KeyRound } from "lucide-react";
import { ChangePasswordForm } from "@/components/auth/change-password-form";
import {
  ProfileSettingsDivider,
  ProfileSettingsPanel,
  ProfileSettingsRow,
} from "@/components/profile/profile-settings";

export function ChangePasswordSection({ embedded }: { embedded?: boolean }) {
  const [open, setOpen] = useState(false);

  if (embedded) {
    return (
      <>
        <ProfileSettingsDivider />
        <ProfileSettingsRow
          icon={KeyRound}
          label="Change password"
          onClick={() => setOpen((v) => !v)}
          chevron="down"
          expanded={open}
          iconClassName="text-muted-foreground"
        />
        {open ? (
          <ProfileSettingsPanel>
            <ChangePasswordForm compact />
          </ProfileSettingsPanel>
        ) : null}
      </>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/[0.08] bg-[var(--bg-surface)]">
      <ProfileSettingsRow
        icon={KeyRound}
        label="Change password"
        onClick={() => setOpen((v) => !v)}
        chevron="down"
        expanded={open}
        iconClassName="text-muted-foreground"
      />
      {open ? (
        <ProfileSettingsPanel>
          <ChangePasswordForm compact />
        </ProfileSettingsPanel>
      ) : null}
    </div>
  );
}
