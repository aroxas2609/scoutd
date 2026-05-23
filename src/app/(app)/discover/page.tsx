import { redirect } from "next/navigation";

/** Legacy route — discovery lives on /search for all roles. */
export default function DiscoverPage() {
  redirect("/search");
}
