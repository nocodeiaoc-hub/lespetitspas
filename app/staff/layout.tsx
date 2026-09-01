import { requireProfile } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";

export default async function StaffLayout({ children }: LayoutProps<"/staff">) {
  await requireProfile("staff");
  return <AppShell title="Espace équipe">{children}</AppShell>;
}
