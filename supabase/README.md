# Scripts SQL — Supabase (Phase 4)

Scripts à **coller à la main** dans _Supabase → SQL Editor → New query → Run_.
On n'utilise pas le CLI Supabase pour ce projet (Phase 4 = dashboard).

## Quel projet Supabase ?

| Base | Usage | Reçoit |
|---|---|---|
| `lespetitspas` | local + staging | **tout** (01 → 05) |
| `lespetitspas-prod` | production | **structure seulement** : 01, 02, 03 — jamais 04/05 |

## Ordre d'exécution (sur `lespetitspas`)

| # | Fichier | Ce qu'il fait | Manip dashboard associée |
|---|---|---|---|
| 1 | `01_schema.sql` | Tables `profiles`, `children`, `family_members`, `events`, `messages` + `is_staff()` + protection de `profiles.role` | — |
| 2 | `02_auth_trigger.sql` | Trigger : crée un `profiles` à chaque nouvel `auth.users` | Vérifier avant : _Authentication → Sign In / Providers → Email = Enabled_. Choisir _Confirm email_ (le noter dans `JOURNAL.md`). |
| — | | | **Créer les 3 comptes** : _Authentication → Users → Add user → **Create new user**_ (pas « Send invitation »), avec des alias `+` de ta vraie adresse Gmail : `…+staff@`, `…+parent1@`, `…+parent2@`. Noter les mots de passe dans `JOURNAL.md`. |
| — | | | **Vérifier le trigger** : _Table Editor → profiles_ contient bien 3 lignes (rôle `parent` par défaut). |
| 3 | `03_rls.sql` | Active la RLS + toutes les policies sur les 5 tables | Vérifier dans _Table Editor_ la mention « RLS enabled » sur chaque table. |
| 4 | `04_seed_test_data.sql` | Promeut le staff, crée Ana Maria / Sarah / Ilyès, crée les liens parent-enfant | **Avant** : _Rechercher/Remplacer_ `prenom.nom` → la partie avant le `@` de ton Gmail. |
| 5 | `05_rls_test.sql` | Teste l'isolation (parent 1 ↝ Ana Maria + Sarah, parent 2 ↝ Ilyès, staff ↝ les 3) | Remplacer `prenom.nom`, puis lancer **chaque bloc séparément** (sélection + Ctrl/Cmd+Entrée) : le SQL Editor n'affiche que le dernier résultat. |
| 6 | `06_profiles_staff_readable.sql` | Ajoute une policy : tout utilisateur connecté peut lire les profils `staff` (prénom du staff affiché au parent sur la timeline, US-20). Les profils `parent` restent cloisonnés. | À rejouer sur `lespetitspas-prod`. |

## Critère bloquant

Tant que `05_rls_test.sql` n'est pas vert (chaque parent ne voit que ses enfants),
**les données sont considérées comme non protégées** — ne pas construire la vue
parent (Phase 6) avant.

## Fin de Phase 4 — production

Une fois tout validé sur `lespetitspas`, rejouer **uniquement** `01`, `02`, `03`
sur `lespetitspas-prod` (mêmes scripts, base vide de données).

## Modèle de données

Diagramme et dictionnaire : [`../docs/datamodel.md`](../docs/datamodel.md).
