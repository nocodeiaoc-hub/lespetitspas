import { requireProfile } from "@/lib/auth";
import { AppShell } from "@/components/app-shell";

export default async function ParentLayout({ children }: LayoutProps<"/parent">) {
  await requireProfile("parent");
  return <AppShell title="Espace parent">{children}</AppShell>;
}
