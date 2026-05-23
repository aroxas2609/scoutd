import { createServiceClient } from "@/lib/supabase/server";
import { GlassCard } from "@/components/ui/glass-card";
import { PremiumButton } from "@/components/ui/premium-button";
import { updateVerificationAction } from "@/features/admin/actions";

export default async function AdminVerificationPage() {
  const supabase = await createServiceClient();
  const { data: requests } = await supabase
    .from("verification_requests")
    .select("*")
    .eq("status", "pending");

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Verification approvals</h1>
      <div className="mt-6 space-y-4">
        {requests?.map((req) => (
          <GlassCard key={req.id} className="p-4">
            <p className="font-medium capitalize">{req.role} verification</p>
            <p className="text-xs text-muted-foreground">User: {req.user_id}</p>
            <div className="mt-4 flex gap-2">
              <form action={updateVerificationAction.bind(null, req.id, "approved")}>
                <PremiumButton type="submit" size="sm">Approve</PremiumButton>
              </form>
              <form action={updateVerificationAction.bind(null, req.id, "rejected")}>
                <PremiumButton type="submit" size="sm" variant="outline" className="border-white/20">
                  Reject
                </PremiumButton>
              </form>
            </div>
          </GlassCard>
        )) ?? <p className="text-muted-foreground">No pending requests</p>}
      </div>
    </div>
  );
}
