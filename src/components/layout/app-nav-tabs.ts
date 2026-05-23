import {
  Search,
  Bookmark,
  MessageCircle,
  Calendar,
  User,
  type LucideIcon,
} from "lucide-react";

export type AppNavTab = {
  href: string;
  label: string;
  playerLabel?: string;
  coachLabel?: string;
  icon: LucideIcon;
  coachOnly?: boolean;
};

export const appNavTabs: AppNavTab[] = [
  {
    href: "/search",
    label: "Search",
    playerLabel: "Explore",
    coachLabel: "Discover",
    icon: Search,
  },
  { href: "/shortlist", label: "Saved", icon: Bookmark, coachOnly: true },
  { href: "/messages", label: "Messages", icon: MessageCircle },
  { href: "/trials", label: "Trials", icon: Calendar },
  { href: "/profile", label: "Profile", icon: User },
];

export function getTabLabel(
  tab: AppNavTab,
  opts: { isPlayer: boolean; isCoach: boolean }
): string {
  if (opts.isPlayer && tab.playerLabel) return tab.playerLabel;
  if (opts.isCoach && tab.coachLabel) return tab.coachLabel;
  return tab.label;
}
