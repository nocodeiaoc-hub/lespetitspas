import { requireProfile } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";

const NAV = [
  { href: "/staff", label: "Enfants" },
  { href: "/staff/messages", label: "Messages" },
];

export default async function StaffLayout({ children }: LayoutProps<"/staff">) {
  await requireProfile("staff");
  return (
    <AppShell title="Espace équipe" nav={NAV}>
      {children}
    </AppShell>
  );
}
