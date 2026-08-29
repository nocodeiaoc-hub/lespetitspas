-- =============================================================================
-- Les Petits Pas — 01. Schéma de la base
-- =============================================================================
-- À exécuter dans Supabase > SQL Editor > New query, sur le projet `lespetitspas`
-- (base de test/staging). NE PAS lancer les données de test (04) sur
-- `lespetitspas-prod` : la prod ne reçoit que 01, 02 et 03.
--
-- Ordre d'exécution : 01_schema → 02_auth_trigger → 03_rls → 04_seed_test_data
-- =============================================================================

-- Extension pour gen_random_uuid() (présente par défaut sur Supabase).
create extension if not exists pgcrypto;

-- -----------------------------------------------------------------------------
-- profiles : une ligne par compte (créée automatiquement par le trigger 02).
-- profiles.id = auth.users.id = auth.uid().
-- -----------------------------------------------------------------------------
create table if not exists public.profiles (
  id          uuid primary key references auth.users (id) on delete cascade,
  role        text not null default 'parent' check (role in ('staff', 'parent')),
  first_name  text not null default '',
  last_name   text not null default '',
  created_at  timestamptz not null default now()
);

comment on table public.profiles is 'Profil applicatif lié à auth.users. Porte le rôle (staff/parent).';
comment on column public.profiles.role is 'Rôle applicatif. Jamais modifiable depuis l''app (voir GRANT de colonne plus bas).';

-- -----------------------------------------------------------------------------
-- children : les enfants inscrits à la crèche.
-- -----------------------------------------------------------------------------
create table if not exists public.children (
  id                 uuid primary key default gen_random_uuid(),
  first_name         text not null,
  last_name          text not null,
  section            text not null check (section in ('Bébés', 'Moyens', 'Grands')),
  birth_date         date not null,
  allergies          text[] not null default '{}',
  medication_allowed boolean not null default false,
  photo_url          text,
  created_at         timestamptz not null default now()
);

comment on table public.children is 'Enfants de la crèche. Créés par script SQL (pas d''écran dans le MVP).';
comment on column public.children.allergies is 'Liste d''allergies pour affichage (pas de requête sur une allergie précise) -> tableau texte plutôt qu''une table dédiée.';
comment on column public.children.medication_allowed is 'Autorisation parentale de médicament. Vérifiée côté serveur avant tout INSERT d''un événement de type medicament.';

-- -----------------------------------------------------------------------------
-- family_members : lien parent <-> enfant (relation n..n).
-- Noms de colonnes imposés par l'énoncé : child_id, profile_id.
-- -----------------------------------------------------------------------------
create table if not exists public.family_members (
  id          uuid primary key default gen_random_uuid(),
  child_id    uuid not null references public.children (id) on delete cascade,
  profile_id  uuid not null references public.profiles (id) on delete cascade,
  created_at  timestamptz not null default now(),
  unique (child_id, profile_id)
);

comment on table public.family_members is 'Rattachement d''un parent à un enfant. Rempli par script SQL (Phase 4), pas d''écran.';

create index if not exists family_members_child_idx   on public.family_members (child_id);
create index if not exists family_members_profile_idx on public.family_members (profile_id);

-- -----------------------------------------------------------------------------
-- events : tous les événements de journée, dans UNE seule table.
-- Un discriminant `type` + des colonnes par type, nullables, encadrées par une
-- contrainte CHECK qui refuse toute ligne incohérente.
-- Valeurs en ASCII sans accent ; l'affichage accentué se fait côté interface.
-- -----------------------------------------------------------------------------
create table if not exists public.events (
  id          uuid primary key default gen_random_uuid(),
  child_id    uuid not null references public.children (id) on delete cascade,
  author_id   uuid not null references public.profiles (id),
  type        text not null check (type in ('repas', 'sieste', 'activite', 'medicament', 'incident')),
  note        text,
  created_at  timestamptz not null default now(),

  -- repas
  meal_moment  text check (meal_moment  in ('matin', 'midi', 'gouter')),
  meal_quality text check (meal_quality in ('tout', 'moitie', 'peu', 'rien')),

  -- sieste
  nap_start   time,
  nap_end     time,
  nap_quality text check (nap_quality in ('calme', 'agitee', 'reveil_precoce')),

  -- activite
  activity_name text,

  -- medicament
  med_name                   text,
  med_dose                   text,
  med_time                   time,
  parental_consent_confirmed boolean,

  -- incident
  incident_kind     text check (incident_kind     in ('chute', 'morsure', 'fievre', 'autre')),
  incident_severity text check (incident_severity in ('leger', 'modere', 'urgent')),

  -- Cohérence : chaque type impose ses champs et interdit ceux des autres types.
  constraint events_type_fields_ck check (
    case type
      when 'repas' then
        meal_moment is not null and meal_quality is not null
        and nap_start is null and nap_end is null and nap_quality is null
        and activity_name is null
        and med_name is null and med_dose is null and med_time is null and parental_consent_confirmed is null
        and incident_kind is null and incident_severity is null
      when 'sieste' then
        nap_start is not null and nap_end is not null and nap_quality is not null
        and meal_moment is null and meal_quality is null
        and activity_name is null
        and med_name is null and med_dose is null and med_time is null and parental_consent_confirmed is null
        and incident_kind is null and incident_severity is null
      when 'activite' then
        activity_name is not null
        and meal_moment is null and meal_quality is null
        and nap_start is null and nap_end is null and nap_quality is null
        and med_name is null and med_dose is null and med_time is null and parental_consent_confirmed is null
        and incident_kind is null and incident_severity is null
      when 'medicament' then
        med_name is not null and med_dose is not null and med_time is not null
        and parental_consent_confirmed = true
        and meal_moment is null and meal_quality is null
        and nap_start is null and nap_end is null and nap_quality is null
        and activity_name is null
        and incident_kind is null and incident_severity is null
      when 'incident' then
        incident_kind is not null and incident_severity is not null
        and meal_moment is null and meal_quality is null
        and nap_start is null and nap_end is null and nap_quality is null
        and activity_name is null
        and med_name is null and med_dose is null and med_time is null and parental_consent_confirmed is null
      else false
    end
  )
);

comment on table public.events is 'Événements de journée (repas, sieste, activite, medicament, incident) dans une table unique. author_id = membre de l''équipe qui a saisi.';
comment on column public.events.parental_consent_confirmed is 'Case "Autorisation parentale confirmée". La vérif de children.medication_allowed se fait EN PLUS, côté Server Action.';

create index if not exists events_child_created_idx on public.events (child_id, created_at desc);

-- -----------------------------------------------------------------------------
-- messages : messages envoyés par un parent à l'équipe (asynchrone).
-- -----------------------------------------------------------------------------
create table if not exists public.messages (
  id               uuid primary key default gen_random_uuid(),
  child_id         uuid not null references public.children (id) on delete cascade,
  from_profile_id  uuid not null references public.profiles (id),
  body             text not null check (char_length(body) between 1 and 500),
  status           text not null default 'nouveau' check (status in ('nouveau', 'lu', 'traite')),
  created_at       timestamptz not null default now()
);

comment on table public.messages is 'Messages parent -> équipe. Liste côté staff triée par created_at desc (pas un fil par enfant).';

create index if not exists messages_created_idx on public.messages (created_at desc);
create index if not exists messages_child_idx   on public.messages (child_id);

-- -----------------------------------------------------------------------------
-- is_staff() : utilisée par toutes les policies RLS (fichier 03).
-- security definer -> contourne la RLS de profiles, pas de récursion.
-- -----------------------------------------------------------------------------
create or replace function public.is_staff()
returns boolean
language sql
stable
security definer
set search_path = ''
as $$
  select exists (
    select 1 from public.profiles
    where id = (select auth.uid()) and role = 'staff'
  );
$$;

-- -----------------------------------------------------------------------------
-- Protection de profiles.role : un utilisateur authentifié ne peut mettre à
-- jour que first_name / last_name. Le rôle n'est modifiable qu'en base
-- (script 04 pour promouvoir le staff).
-- -----------------------------------------------------------------------------
revoke update on public.profiles from anon, authenticated;
grant  update (first_name, last_name) on public.profiles to authenticated;
