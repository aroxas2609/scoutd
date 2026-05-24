"use client";

import { RefreshCw } from "lucide-react";
import { useQueryClient } from "@tanstack/react-query";
import { clearAuthQueries } from "@/features/auth/auth-query-cache";
import { goBackToRoleSelection } from "@/features/auth/role-actions";
import { ProfileSettingsRow } from "@/components/profile/profile-settings";

export function SwitchAccountTypeRow() {
  const qc = useQueryClient();

  return (
    <ProfileSettingsRow
      icon={RefreshCw}
      label="Switch player / club account"
      onClick={() => {
        clearAuthQueries(qc);
        void goBackToRoleSelection();
      }}
    />
  );
}
