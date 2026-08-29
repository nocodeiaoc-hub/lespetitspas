-- =============================================================================
-- Les Petits Pas — 02. Création automatique du profil
-- =============================================================================
-- À exécuter APRÈS 01_schema.sql, dans Supabase > SQL Editor, sur `lespetitspas`.
-- (À rejouer aussi sur `lespetitspas-prod` en fin de Phase 4.)
--
-- Quand un utilisateur est créé dans auth.users (inscription, invitation,
-- "Create new user" dans le dashboard), une ligne est insérée dans profiles.
-- Le rôle est TOUJOURS 'parent' par défaut : le staff est promu par le
-- script 04 (update en base). Cela évite qu'un compte s'auto-attribue 'staff'
-- via les métadonnées d'inscription.
-- =============================================================================

create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer
set search_path = ''
as $$
begin
  insert into public.profiles (id, first_name, last_name)
  values (
    new.id,
    coalesce(new.raw_user_meta_data ->> 'first_name', ''),
    coalesce(new.raw_user_meta_data ->> 'last_name', '')
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row
  execute function public.handle_new_user();
