import { createServiceClient } from "@/lib/supabase/server";
import { GlassCard } from "@/components/ui/glass-card";

export default async function AdminFeaturedPage() {
  const supabase = await createServiceClient();
  const { data: featured } = await supabase
    .from("featured_entities")
    .select("*")
    .order("sort_order");

  return (
    <div>
      <h1 className="font-display text-2xl font-bold">Featured management</h1>
      <p className="mt-2 text-sm text-muted-foreground">
        Use Supabase dashboard or API to add featured players/clubs. Listed entries:
      </p>
      <div className="mt-6 space-y-2">
        {featured?.map((f) => (
          <GlassCard key={f.id} className="p-4">
            <p className="font-medium capitalize">
              {f.entity_type} · {f.entity_id}
            </p>
            <p className="text-xs text-muted-foreground">Order: {f.sort_order}</p>
          </GlassCard>
        )) ?? <p className="text-muted-foreground">No featured entities</p>}
      </div>
    </div>
  );
}
