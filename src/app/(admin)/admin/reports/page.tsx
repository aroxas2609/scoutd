import { createServiceClient } from "@/lib/supabase/server";
import { GlassCard } from "@/components/ui/glass-card";
import { PremiumButton } from "@/components/ui/premium-button";
import { resolveReportAction } from "@/features/admin/actions";

export default async function AdminReportsPage() {
  const supabase = await createServiceClient();
  const { data: reports } = await supabase
    .from("reports")
    .select("*")
    .eq("status", "open")
    .order("created_at", { ascending: false });

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Reports</h1>
      <div className="mt-6 space-y-4">
        {reports?.map((r) => (
          <GlassCard key={r.id} className="p-4">
            <p className="font-medium">{r.reason}</p>
            <p className="mt-1 text-xs text-muted-foreground">
              {new Date(r.created_at).toLocaleString()}
            </p>
            <div className="mt-4 flex gap-2">
              <form action={resolveReportAction.bind(null, r.id, "resolved")}>
                <PremiumButton type="submit" size="sm">Resolve</PremiumButton>
              </form>
              <form action={resolveReportAction.bind(null, r.id, "dismissed")}>
                <PremiumButton type="submit" size="sm" variant="outline" className="border-white/20">
                  Dismiss
                </PremiumButton>
              </form>
            </div>
          </GlassCard>
        )) ?? <p className="text-muted-foreground">No open reports</p>}
      </div>
    </div>
  );
}
