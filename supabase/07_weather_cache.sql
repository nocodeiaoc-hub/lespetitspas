-- =============================================================================
-- Les Petits Pas — 07. Cache météo (fonctionnalité bonus, US-28 / US-29)
-- =============================================================================
-- À exécuter dans Supabase > SQL Editor, sur `lespetitspas`
-- (et sur `lespetitspas-prod` au passage en production).
--
-- Une ligne par jour : évite de rappeler l'API météo externe à chaque visite
-- d'un parent. La route `/api/weather` lit ce cache et, si le jour manque,
-- appelle l'API puis fait un `upsert` (via la clé service_role).
-- =============================================================================

create table if not exists public.weather_cache (
  day          date primary key,
  temperature  numeric      not null,
  weather_code integer      not null,
  summary      text         not null,
  advice       text         not null,
  fetched_at   timestamptz  not null default now()
);

comment on table public.weather_cache is
  'Cache journalier de la météo + conseil d''habillement (fonctionnalité bonus).';

alter table public.weather_cache enable row level security;

-- Lecture : tout utilisateur connecté (staff comme parent).
drop policy if exists weather_cache_select_authenticated on public.weather_cache;
create policy weather_cache_select_authenticated
  on public.weather_cache for select to authenticated
  using ( true );

-- Écriture : aucune policy pour `authenticated` → réservée à la clé
-- `service_role` (route handler `/api/weather`), qui contourne la RLS.
