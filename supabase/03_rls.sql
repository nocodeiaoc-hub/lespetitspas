-- =============================================================================
-- Les Petits Pas — 03. Row Level Security (RLS)
-- =============================================================================
-- À exécuter APRÈS 01 et 02, dans Supabase > SQL Editor, sur `lespetitspas`.
-- (À rejouer aussi sur `lespetitspas-prod` en fin de Phase 4.)
--
-- Principe : la RLS est la source de vérité de la sécurité.
-- - staff  : lit tout, écrit children / events, met à jour le statut des messages.
-- - parent : ne voit QUE ses enfants (via family_members) et leurs événements /
--            messages ; peut envoyer des messages ; ne crée jamais d'événement.
--
-- Le vrai test se fait avec le script 05, une fois les comptes de test créés.
-- =============================================================================

-- -----------------------------------------------------------------------------
-- profiles
-- -----------------------------------------------------------------------------
alter table public.profiles enable row level security;

drop policy if exists profiles_select_self_or_staff on public.profiles;
create policy profiles_select_self_or_staff
  on public.profiles for select to authenticated
  using ( id = (select auth.uid()) or public.is_staff() );

drop policy if exists profiles_update_self on public.profiles;
create policy profiles_update_self
  on public.profiles for update to authenticated
  using ( id = (select auth.uid()) )
  with check ( id = (select auth.uid()) );
-- INSERT : réservé au trigger (security definer). DELETE : cascade depuis auth.users.

-- -----------------------------------------------------------------------------
-- children
-- -----------------------------------------------------------------------------
alter table public.children enable row level security;

drop policy if exists children_select_staff_or_parent on public.children;
create policy children_select_staff_or_parent
  on public.children for select to authenticated
  using (
    public.is_staff()
    or exists (
      select 1 from public.family_members fm
      where fm.child_id = children.id
        and fm.profile_id = (select auth.uid())
    )
  );

drop policy if exists children_insert_staff on public.children;
create policy children_insert_staff
  on public.children for insert to authenticated
  with check ( public.is_staff() );

drop policy if exists children_update_staff on public.children;
create policy children_update_staff
  on public.children for update to authenticated
  using ( public.is_staff() )
  with check ( public.is_staff() );

-- -----------------------------------------------------------------------------
-- family_members
-- -----------------------------------------------------------------------------
alter table public.family_members enable row level security;

drop policy if exists family_members_select_staff_or_self on public.family_members;
create policy family_members_select_staff_or_self
  on public.family_members for select to authenticated
  using ( public.is_staff() or profile_id = (select auth.uid()) );
-- INSERT / UPDATE / DELETE : hors interface (script SQL uniquement).

-- -----------------------------------------------------------------------------
-- events
-- -----------------------------------------------------------------------------
alter table public.events enable row level security;

drop policy if exists events_select_staff_or_parent on public.events;
create policy events_select_staff_or_parent
  on public.events for select to authenticated
  using (
    public.is_staff()
    or exists (
      select 1 from public.family_members fm
      where fm.child_id = events.child_id
        and fm.profile_id = (select auth.uid())
    )
  );

drop policy if exists events_insert_staff on public.events;
create policy events_insert_staff
  on public.events for insert to authenticated
  with check ( public.is_staff() and author_id = (select auth.uid()) );

drop policy if exists events_update_staff on public.events;
create policy events_update_staff
  on public.events for update to authenticated
  using ( public.is_staff() )
  with check ( public.is_staff() );

-- -----------------------------------------------------------------------------
-- messages
-- -----------------------------------------------------------------------------
alter table public.messages enable row level security;

drop policy if exists messages_select_staff_or_parent on public.messages;
create policy messages_select_staff_or_parent
  on public.messages for select to authenticated
  using (
    public.is_staff()
    or exists (
      select 1 from public.family_members fm
      where fm.child_id = messages.child_id
        and fm.profile_id = (select auth.uid())
    )
  );

drop policy if exists messages_insert_parent on public.messages;
create policy messages_insert_parent
  on public.messages for insert to authenticated
  with check (
    not public.is_staff()
    and from_profile_id = (select auth.uid())
    and exists (
      select 1 from public.family_members fm
      where fm.child_id = messages.child_id
        and fm.profile_id = (select auth.uid())
    )
  );

drop policy if exists messages_update_staff on public.messages;
create policy messages_update_staff
  on public.messages for update to authenticated
  using ( public.is_staff() )
  with check ( public.is_staff() );
