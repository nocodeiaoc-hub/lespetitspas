-- =============================================================================
-- Les Petits Pas — 04. Données de TEST
-- =============================================================================
--  ⚠  À exécuter UNIQUEMENT sur `lespetitspas` (test/staging).
--  ⚠  JAMAIS sur `lespetitspas-prod` : la prod ne contient que les vraies
--     données de la crèche.
--
-- PRÉ-REQUIS : avoir d'abord créé les 3 comptes dans
--   Supabase > Authentication > Users > Add user > "Create new user"
--   (et NON "Send invitation"), avec des alias + de TON adresse Gmail :
--     - <prenom.nom>+staff@gmail.com
--     - <prenom.nom>+parent1@gmail.com
--     - <prenom.nom>+parent2@gmail.com
--   Le trigger 02 a créé les 3 profils avec le rôle 'parent' par défaut.
--
-- AVANT DE LANCER : Rechercher/Remplacer  prenom.nom  ->  la partie avant le @
--                   de TON adresse Gmail (Ctrl/Cmd + F dans le SQL Editor).
--
-- Ce script fait 3 choses :
--   A. promeut le compte staff en rôle 'staff' (+ renseigne les prénoms/noms)
--   B. crée 3 enfants (Ana Maria, Sarah, Ilyès)
--   C. relie parent1 -> Ana Maria + Sarah, parent2 -> Ilyès
-- Il est ré-exécutable (idempotent).
-- =============================================================================

-- --- A. Rôles et identités des comptes de test --------------------------------
update public.profiles p
set role = 'staff', first_name = 'Camille', last_name = 'Bonnet'
from auth.users u
where u.id = p.id and u.email = 'nocodeia.oc+staff@gmail.com';

update public.profiles p
set first_name = 'Léa', last_name = 'Martin'
from auth.users u
where u.id = p.id and u.email = 'nocodeia.oc+parent1@gmail.com';

update public.profiles p
set first_name = 'Thomas', last_name = 'Dubois'
from auth.users u
where u.id = p.id and u.email = 'nocodeia.oc+parent2@gmail.com';

-- --- B. Enfants --------------------------------------------------------------
-- Au moins un enfant AVEC autorisation de médicament, un SANS (règle médicament).
insert into public.children (first_name, last_name, section, birth_date, allergies, medication_allowed)
values
  ('Ana Maria', 'Costa',  'Moyens', date '2024-03-12', '{}',                 true),
  ('Sarah',     'Costa',  'Bébés',  date '2025-09-02', '{"Lait de vache"}',  false),
  ('Ilyès',     'Benali', 'Grands', date '2023-06-20', '{"Arachides"}',      true)
on conflict do nothing;

-- --- C. Liens parent <-> enfant --------------------------------------------
-- parent1 -> Ana Maria + Sarah
insert into public.family_members (child_id, profile_id)
select c.id, p.id
from public.children c
cross join (
  select pr.id
  from public.profiles pr
  join auth.users u on u.id = pr.id
  where u.email = 'nocodeia.oc+parent1@gmail.com'
) p
where c.first_name in ('Ana Maria', 'Sarah')
on conflict (child_id, profile_id) do nothing;

-- parent2 -> Ilyès
insert into public.family_members (child_id, profile_id)
select c.id, p.id
from public.children c
cross join (
  select pr.id
  from public.profiles pr
  join auth.users u on u.id = pr.id
  where u.email = 'nocodeia.oc+parent2@gmail.com'
) p
where c.first_name = 'Ilyès'
on conflict (child_id, profile_id) do nothing;

-- --- Vérification rapide ---------------------------------------------------
-- Rôles :
select u.email, p.role, p.first_name, p.last_name
from public.profiles p join auth.users u on u.id = p.id
order by u.email;

-- Liens :
select c.first_name as enfant, u.email as parent
from public.family_members fm
join public.children c on c.id = fm.child_id
join public.profiles p on p.id = fm.profile_id
join auth.users u on u.id = p.id
order by c.first_name;
