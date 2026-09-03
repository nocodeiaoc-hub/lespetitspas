import { requireProfile } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";

const NAV = [
  { href: "/parent", label: "Mes enfants" },
  { href: "/parent/messages", label: "Messages" },
];

export default async function ParentLayout({ children }: LayoutProps<"/parent">) {
  await requireProfile("parent");
  return (
    <AppShell title="Espace parent" nav={NAV}>
      {children}
    </AppShell>
  );
}
