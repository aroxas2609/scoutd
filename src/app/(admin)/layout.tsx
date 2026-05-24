import Link from "next/link";
import { redirect } from "next/navigation";
import { createClient } from "@/lib/supabase/server";
import { cn } from "@/lib/utils";
import { Logo } from "@/components/brand/logo";

const links = [
  { href: "/admin", label: "Overview" },
  { href: "/admin/users", label: "Users" },
  { href: "/admin/reports", label: "Reports" },
  { href: "/admin/verification", label: "Verification" },
  { href: "/admin/featured", label: "Featured" },
];

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) redirect("/login");

  const { data: profile } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (profile?.role !== "admin") redirect("/search");

  return (
    <div className="min-h-dvh bg-[var(--bg-deep)]">
      <header className="border-b border-white/10 px-6 py-4 lg:hidden">
        <Link href="/admin" className="flex items-center gap-2">
          <Logo variant="icon" size="sm" />
          <span className="font-display text-xl font-bold text-[var(--accent-electric)]">Admin</span>
        </Link>
        <nav className="mt-4 flex flex-wrap gap-4 text-sm">
          {links.map((l) => (
            <Link key={l.href} href={l.href} className="text-muted-foreground hover:text-white">
              {l.label}
            </Link>
          ))}
        </nav>
      </header>

      <div className="lg:flex">
        <aside className="hidden lg:flex lg:w-56 lg:shrink-0 lg:flex-col lg:border-r lg:border-white/10 lg:px-4 lg:py-6">
          <Link href="/admin" className="flex items-center gap-2">
            <Logo variant="icon" size="sm" />
            <span className="font-display text-lg font-bold text-[var(--accent-brand)]">Admin</span>
          </Link>
          <nav className="mt-8 flex flex-col gap-1">
            {links.map((l) => (
              <AdminNavLink key={l.href} href={l.href} label={l.label} />
            ))}
          </nav>
          <Link
            href="/search"
            className="mt-auto pt-8 text-sm text-muted-foreground hover:text-foreground"
          >
            Back to app
          </Link>
        </aside>
        <main className="mx-auto min-w-0 flex-1 max-w-6xl p-6 lg:max-w-none lg:px-10 lg:py-8">
          {children}
        </main>
      </div>
    </div>
  );
}

function AdminNavLink({ href, label }: { href: string; label: string }) {
  return (
    <Link
      href={href}
      className={cn(
        "rounded-lg px-3 py-2 text-sm font-medium text-muted-foreground transition-colors hover:bg-white/[0.04] hover:text-foreground"
      )}
    >
      {label}
    </Link>
  );
}
