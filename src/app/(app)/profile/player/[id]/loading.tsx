import { Skeleton } from "@/components/ui/skeleton";

export default function PlayerProfileLoading() {
  return (
    <div className="pb-24">
      <div className="flex items-center justify-between border-b border-white/[0.06] px-4 py-3">
        <Skeleton className="h-10 w-10 rounded-xl" />
        <Skeleton className="h-10 w-10 rounded-xl" />
      </div>
      <div className="space-y-4 px-4 pt-6">
        <div className="flex gap-4">
          <Skeleton className="h-[88px] w-[88px] rounded-2xl" />
          <div className="flex-1 space-y-2 pt-2">
            <Skeleton className="h-6 w-40" />
            <Skeleton className="h-4 w-32" />
            <Skeleton className="h-6 w-24 rounded-lg" />
          </div>
        </div>
        <Skeleton className="h-11 w-full rounded-xl" />
        <Skeleton className="h-64 w-full rounded-2xl" />
      </div>
    </div>
  );
}
