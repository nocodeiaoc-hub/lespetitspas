import { requireProfile } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";

const NAV = [
  { href: "/parent", label: "Mes enfants" },
  { href: "/parent/messages/new", label: "Écrire à l'équipe" },
];

export default async function ParentLayout({ children }: LayoutProps<"/parent">) {
  await requireProfile("parent");
  return (
    <AppShell title="Espace parent" nav={NAV}>
      {children}
    </AppShell>
  );
}
