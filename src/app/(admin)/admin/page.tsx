import { createServiceClient } from "@/lib/supabase/server";
import { GlassCard } from "@/components/ui/glass-card";

export default async function AdminOverviewPage() {
  const supabase = await createServiceClient();

  const [users, players, coaches, reports] = await Promise.all([
    supabase.from("profiles").select("id", { count: "exact", head: true }),
    supabase.from("player_profiles").select("user_id", { count: "exact", head: true }),
    supabase.from("coach_profiles").select("user_id", { count: "exact", head: true }),
    supabase.from("reports").select("id", { count: "exact", head: true }).eq("status", "open"),
  ]);

  const stats = [
    { label: "Total users", value: users.count ?? 0 },
    { label: "Players", value: players.count ?? 0 },
    { label: "Coaches", value: coaches.count ?? 0 },
    { label: "Open reports", value: reports.count ?? 0 },
  ];

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Analytics overview</h1>
      <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <GlassCard key={s.label} className="p-6">
            <p className="text-3xl font-bold text-[var(--accent-electric)]">{s.value}</p>
            <p className="text-sm text-muted-foreground">{s.label}</p>
          </GlassCard>
        ))}
      </div>
    </div>
  );
}
