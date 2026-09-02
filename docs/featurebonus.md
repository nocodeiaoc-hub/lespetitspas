# Fonctionnalité bonus — Météo du jour & conseil d'habillement

> User Stories **US-28** (écran + logique) et **US-29** (stockage + doc).

## Objectif

Aider les parents à préparer les affaires de leur enfant : sur la timeline
parent, un bloc affiche la météo du jour à la crèche et **une phrase de conseil
d'habillement** dérivée de la température et des conditions.

## Où ça s'affiche

- Route : `/parent/children/[id]` (timeline de l'enfant).
- Le bloc n'apparaît que pour la **date du jour** (pas sur les jours passés).
- Trois états gérés :
  - **chargement** : squelette animé ;
  - **succès** : icône + « 12°C · Ciel couvert » + conseil ;
  - **erreur** : « Météo indisponible pour le moment. » (jamais d'écran cassé).

## Architecture

| Élément | Fichier | Rôle |
|---|---|---|
| Logique pure | [`lib/weather.ts`](../lib/weather.ts) | `weatherKind`, `describeWeather`, `clothingAdvice`, emplacement crèche |
| Route handler | [`app/api/weather/route.ts`](../app/api/weather/route.ts) | lit le cache, sinon appelle l'API, `upsert`, renvoie le JSON |
| Composant | [`components/weather-block.tsx`](../components/weather-block.tsx) | `fetch('/api/weather')` côté client, gère les 3 états |
| Cache | [`supabase/07_weather_cache.sql`](../supabase/07_weather_cache.sql) | table `weather_cache`, 1 ligne / jour |

### API externe

[Open-Meteo](https://open-meteo.com/) — gratuite, **sans clé API**.
Endpoint : `GET https://api.open-meteo.com/v1/forecast?latitude=…&longitude=…&current=temperature_2m,weather_code&timezone=Europe/Paris`.

Emplacement de la crèche : constantes dans `lib/weather.ts`, surchargées si besoin
par `NEXT_PUBLIC_CRECHE_LAT` / `NEXT_PUBLIC_CRECHE_LON` (Paris par défaut).

### Cache journalier (`weather_cache`)

- Clé primaire = `day` (date). Une visite le même jour ne rappelle jamais l'API.
- **RLS** : lecture pour tout utilisateur connecté ; écriture réservée à la clé
  `service_role` (le route handler), aucune policy d'écriture pour `authenticated`.
- Le premier parent qui ouvre sa timeline dans la journée déclenche l'appel API
  et remplit la ligne ; les suivants lisent le cache.

### Logique du conseil (`clothingAdvice`)

Base selon la température :

| Température | Conseil de base |
|---|---|
| ≤ 0°C | Manteau chaud, bonnet, écharpe et moufles indispensables. |
| 1–7°C | Manteau, bonnet et gants : il fait froid. |
| 8–14°C | Une veste chaude et un pull sont recommandés. |
| 15–21°C | Une petite veste ou un gilet suffira. |
| 22–27°C | Vêtements légers ; pensez à une gourde d'eau. |
| ≥ 28°C | Vêtements très légers, chapeau, crème solaire et beaucoup d'eau. |

Complément selon le code météo WMO : pluie → imperméable + bottes ; neige →
bottes fourrées ; brouillard → vêtements clairs ; orage → vêtement de pluie à
portée ; ciel dégagé et chaud → casquette et lunettes.

## Scénarios de test

### 1. Affichage nominal
1. Se connecter en parent, ouvrir la timeline d'un enfant.
2. Le bloc météo s'affiche avec température, résumé et conseil cohérents.
3. Recharger la page : réponse instantanée (lecture du cache, aucun appel réseau).

### 2. API externe indisponible (US-29)
1. Simuler la panne : couper le réseau, **ou** pointer `lib/weather.ts` vers un
   host invalide, **ou** bloquer `api.open-meteo.com`.
2. Ouvrir la timeline parent pour un jour **non encore en cache**.
3. Attendu : le bloc affiche **« Météo indisponible pour le moment. »**, la
   timeline et le reste de la page fonctionnent normalement (route → `503`,
   erreur journalisée côté serveur, aucun crash).

### 3. Logique pure
`lib/weather.ts` est testable sans réseau — voir `lib/weather.test.ts`
(exécuté quand le runner de tests est en place, Phase 8 / US-30) :
- `clothingAdvice(-2, 71)` → mentionne moufles **et** neige ;
- `clothingAdvice(30, 0)` → mentionne crème solaire **et** casquette ;
- `clothingAdvice(18, 61)` → gilet **et** imperméable ;
- `weatherKind(95)` → `"storm"`, `weatherKind(0)` → `"clear"`.
