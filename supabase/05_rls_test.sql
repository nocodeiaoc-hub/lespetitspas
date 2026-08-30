-- =============================================================================
-- Les Petits Pas — 05. Test des RLS depuis le SQL Editor
-- =============================================================================
-- À exécuter APRÈS 04, sur `lespetitspas`. L'écran de connexion n'existe pas
-- encore (Phase 5) : on se fait passer pour un utilisateur en injectant son
-- identité dans la session.
--
-- AVANT DE LANCER : Rechercher/Remplacer  prenom.nom  ->  la partie avant le @
--                   de TON adresse Gmail (comme dans 04_seed_test_data.sql).
--
-- COMMENT LANCER : le SQL Editor n'affiche que le résultat du DERNIER SELECT.
-- Lance donc CHAQUE bloc séparément : sélectionne-le à la souris puis Ctrl/Cmd+Entrée.
-- =============================================================================


-- ============================ BLOC 0 — contrôle ==============================
-- Vérifie que les 3 comptes existent et que le staff est bien 'staff'.
select u.email, p.role, p.first_name, p.last_name
from auth.users u
join public.profiles p on p.id = u.id
order by u.email;
-- Attendu : 3 lignes, dont prenom.nom+staff@... avec role = staff.


-- =================== BLOC 1 — PARENT 1 : Ana Maria + Sarah ===================
begin;
  select set_config(
    'request.jwt.claims',
    json_build_object(
      'sub', (select id from auth.users where email = 'prenom.nom+parent1@gmail.com'),
      'role', 'authenticated'
    )::text,
    true
  );
  set local role authenticated;

  select first_name, last_name, section from public.children order by first_name;
  -- Attendu : Ana Maria, Sarah  (PAS Ilyès)
rollback;


-- ======================= BLOC 2 — PARENT 2 : Ilyès =========================
begin;
  select set_config(
    'request.jwt.claims',
    json_build_object(
      'sub', (select id from auth.users where email = 'prenom.nom+parent2@gmail.com'),
      'role', 'authenticated'
    )::text,
    true
  );
  set local role authenticated;

  select first_name, last_name, section from public.children order by first_name;
  -- Attendu : Ilyès  (PAS Ana Maria ni Sarah)
rollback;


-- ==================== BLOC 3 — STAFF : les 3 enfants =======================
begin;
  select set_config(
    'request.jwt.claims',
    json_build_object(
      'sub', (select id from auth.users where email = 'prenom.nom+staff@gmail.com'),
      'role', 'authenticated'
    )::text,
    true
  );
  set local role authenticated;

  select first_name, last_name, section from public.children order by first_name;
  -- Attendu : Ana Maria, Ilyès, Sarah
rollback;


-- ============= BLOC 4 — un PARENT ne peut PAS créer d'événement =============
begin;
  select set_config(
    'request.jwt.claims',
    json_build_object(
      'sub', (select id from auth.users where email = 'prenom.nom+parent1@gmail.com'),
      'role', 'authenticated'
    )::text,
    true
  );
  set local role authenticated;

  -- Doit ÉCHOUER avec "new row violates row-level security policy for table events" :
  insert into public.events (child_id, author_id, type, activity_name)
  select c.id, (select auth.uid()), 'activite', 'tentative interdite'
  from public.children c
  limit 1;
rollback;


-- Si un parent voit un enfant qui n'est pas le sien, ou si le BLOC 4 réussit,
-- les policies de 03_rls.sql sont à revoir.
-- Tant que ces tests ne sont pas verts, les données sont considérées NON protégées.
