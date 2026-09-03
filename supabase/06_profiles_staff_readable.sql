-- =============================================================================
-- Les Petits Pas — 06. Profils du staff lisibles par les parents
-- =============================================================================
-- À exécuter dans Supabase > SQL Editor, sur `lespetitspas` (et sur
-- `lespetitspas-prod` au moment du passage en production).
--
-- Contexte : le prénom du membre de l'équipe qui a saisi un événement est
-- affiché au parent sur la timeline (US-20). Or la policy `profiles` d'origine
-- (03_rls.sql) ne laisse chacun lire que SON profil, ou tout au staff.
--
-- Les prénoms / noms du staff ne sont pas des données sensibles : ils sont
-- montrés aux familles par conception. On ajoute donc une policy permissive
-- (les policies RLS se combinent en OU) : tout utilisateur connecté peut lire
-- les lignes `profiles` dont le rôle est `staff`.
--
-- Effet net des policies SELECT sur `profiles` après ce script :
--   visible si  id = auth.uid()  OU  is_staff()  OU  role = 'staff'
-- Les profils `parent` restent donc lisibles uniquement par eux-mêmes et le staff.
-- =============================================================================

drop policy if exists profiles_select_staff_public on public.profiles;
create policy profiles_select_staff_public
  on public.profiles for select to authenticated
  using ( role = 'staff' );
