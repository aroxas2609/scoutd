import { createServiceClient } from "@/lib/supabase/server";
import { GlassCard } from "@/components/ui/glass-card";

export default async function AdminUsersPage() {
  const supabase = await createServiceClient();
  const { data: users } = await supabase
    .from("profiles")
    .select("*")
    .order("created_at", { ascending: false })
    .limit(50);

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">User moderation</h1>
      <div className="mt-6 space-y-2">
        {users?.map((u) => (
          <GlassCard key={u.id} className="flex items-center justify-between p-4">
            <div>
              <p className="font-medium">{u.full_name ?? u.email}</p>
              <p className="text-xs text-muted-foreground">{u.email} · {u.role ?? "—"}</p>
            </div>
            <span className="text-xs text-muted-foreground">
              {new Date(u.created_at).toLocaleDateString()}
            </span>
          </GlassCard>
        )) ?? <p className="text-muted-foreground">No users yet</p>}
      </div>
    </div>
  );
}
