import { redirect } from "next/navigation";
import { getProfile, spaceForRole } from "@/lib/auth";

// La racine ne montre rien : elle aiguille vers /login ou l'espace de l'utilisateur.
export default async function HomePage() {
  const profile = await getProfile();
  redirect(profile ? spaceForRole(profile.role) : "/login");
}
