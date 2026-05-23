"use server";

import { setUserRole } from "./actions";
import type { UserRole } from "@/types/database";

export async function selectRole(role: UserRole) {
  await setUserRole(role);
}
