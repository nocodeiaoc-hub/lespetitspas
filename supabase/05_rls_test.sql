-- =============================================================================
-- Les Petits Pas — 05. Test des RLS depuis le SQL Editor
-- =============================================================================
-- À exécuter APRÈS 04, sur `lespetitspas`. L'écran de connexion n'existe pas
-- encore (Phase 5) : on se fait passer pour un utilisateur via son UUID.
--
-- 1) Récupère les UUID des comptes :
select u.email, u.id as uuid, p.role
from auth.users u
join public.profiles p on p.id = u.id
order by u.email;

-- 2) Copie les UUID ci-dessus et remplace-les dans les 3 blocs suivants.
--    Lance chaque bloc séparément (sélection + Run) et regarde "Results".

-- ---- PARENT 1 : doit voir UNIQUEMENT Ana Maria et Sarah ---------------------
begin;
  select set_config('request.jwt.claims',
    '{"sub":"UUID_PARENT_1","role":"authenticated"}', true);
  set local role authenticated;

  select first_name, last_name, section from public.children order by first_name;
  -- attendu : Ana Maria, Sarah
rollback;

-- ---- PARENT 2 : doit voir UNIQUEMENT Ilyès ---------------------------------
begin;
  select set_config('request.jwt.claims',
    '{"sub":"UUID_PARENT_2","role":"authenticated"}', true);
  set local role authenticated;

  select first_name, last_name, section from public.children order by first_name;
  -- attendu : Ilyès
rollback;

-- ---- STAFF : doit voir les 3 enfants --------------------------------------
begin;
  select set_config('request.jwt.claims',
    '{"sub":"UUID_STAFF","role":"authenticated"}', true);
  set local role authenticated;

  select first_name, last_name, section from public.children order by first_name;
  -- attendu : Ana Maria, Ilyès, Sarah
rollback;

-- ---- Bonus : un parent ne peut PAS créer d'événement ---------------------
begin;
  select set_config('request.jwt.claims',
    '{"sub":"UUID_PARENT_1","role":"authenticated"}', true);
  set local role authenticated;

  -- Doit échouer (policy events_insert_staff) :
  -- insert into public.events (child_id, author_id, type, activity_name)
  -- select id, '<UUID_PARENT_1>', 'activite', 'test' from public.children limit 1;
rollback;

-- Si un parent voit un enfant qui n'est pas le sien -> revoir 03_rls.sql.
-- Tant que ce test n'est pas vert, les données sont considérées NON protégées.
