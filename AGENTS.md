<!-- BEGIN:nextjs-agent-rules -->

# This is NOT the Next.js you know

This version has breaking changes — APIs, conventions, and file structure may all differ from your training data. Read the relevant guide in `node_modules/next/dist/docs/` (resolved from this file's directory; in monorepos the `next` package may not be visible from the repo root) before writing any code. Heed deprecation notices.

This block is written and re-added by `next dev` — verify at `node_modules/next/dist/server/lib/generate-agent-files.js`. Removing it from a diff only re-creates the uncommitted change; committing it with your work keeps the tree clean.

<!-- END:nextjs-agent-rules -->

---

# Les Petits Pas — livret d'accueil pour l'agent IA

## Le projet en deux phrases

Application web de vie quotidienne pour la crèche **Les Petits Pas**. Deux espaces
cloisonnés : l'**équipe** saisit les événements de la journée des enfants (repas, sieste,
activité, médicament, incident) et lit les messages des parents ; les **parents**
consultent la journée de leur(s) enfant(s) et envoient des messages à l'équipe.

30 enfants, 3 sections (Bébés, Moyens, Grands), chaque enfant rattaché à une ou deux
familles. Aucune donnée d'un enfant n'est visible par un parent non rattaché.

## Stack

| Brique | Rôle |
|---|---|
| **Next.js** (App Router) | Framework, pages, navigation, Server Actions |
| **TypeScript** | Tout le code applicatif |
| **Tailwind CSS v4** | Styles via classes utilitaires dans le JSX, tokens de la charte dans `app/globals.css` |
| **ShadCN** (Radix, preset Nova) | Bibliothèque de composants UI |
| **Supabase** | Base Postgres, Auth (email/mot de passe), Row Level Security |
| **Resend** | Emails transactionnels (invitation parent, notification équipe) |
| **Playwright** | Tests end-to-end des parcours critiques |
| **Vercel** | Hébergement — `local` / `staging` (branche `staging`) / `production` (branche `main`) |

Gestionnaire de paquets : **pnpm** (`pnpm@11.24.0`, Node ≥ 22.13).
Charte graphique retenue : **Nuage** (voir tokens dans `app/globals.css`).

## Structure du projet

```
app/                    # App Router : pages, layouts, Server Actions, route handlers
  globals.css           # tokens de la charte Nuage (couleurs, polices, rayons)
  login/                # /login
  staff/                # /staff, /staff/children/[id], /staff/messages
  parent/               # /parent, /parent/children/[id], /parent/messages/new
components/
  ui/                   # composants ShadCN (ajoutés au fil de l'eau)
  <Composant>.tsx       # composants applicatifs (Timeline, EventForm, EmptyState…)
lib/
  supabase/             # clients Supabase (browser / server / middleware)
  utils.ts              # helper `cn` + utilitaires purs (durée de sieste, garde médicament…)
docs/
  datamodel.md          # modèle de données (Phase 4)
  featurebonus.md       # doc de la fonctionnalité bonus (Phase 7)
  recette/              # scénarios de recette (Phase 8)
supabase/ ou docs/sql/  # scripts SQL de structure (tables, trigger, policies RLS)
e2e/ ou tests/          # tests Playwright
backlog.md              # Product Backlog (voir règle ci-dessous)
prototype/              # projet SÉPARÉ — maquette Phase 2, ne pas y toucher (voir plus bas)
JOURNAL.md              # carnet de bord privé, jamais commité (gitignore)
```

Routes attendues : `/login`, `/staff`, `/staff/children/[id]`, `/staff/messages`,
`/parent`, `/parent/children/[id]`, `/parent/messages/new`.

## Commandes

```bash
pnpm dev            # serveur de développement (http://localhost:3000)
pnpm build          # build de production
pnpm lint           # ESLint
pnpm test           # tests unitaires (à mettre en place en Phase 8)
pnpm exec playwright test   # tests end-to-end (à mettre en place en Phase 8)
```

Les scripts SQL ne s'exécutent pas via une commande : ils s'appliquent à la main dans le
**SQL Editor** de Supabase (base `lespetitspas` pour le dev/staging).

## Product Backlog — règle de mise à jour (IMPORTANT)

Le fichier [`backlog.md`](backlog.md) est le Product Backlog. Il doit rester vivant **sans
qu'on ait à le demander** :

1. **Avant de commencer** une User Story, passer son **Statut** à `En cours` dans `backlog.md`.
2. **Une fois la story terminée ET vérifiée** (critères d'acceptation remplis, `pnpm build`
   au vert, tests concernés au vert), passer son **Statut** à `Terminé`.
3. Si une story se révèle plus grosse que prévu, la **découper** en ajoutant de nouvelles
   lignes `US-xx` (IDs séquentiels, jamais réattribués) plutôt que d'élargir la story.
4. Tenir à jour la section **Contraintes / Dépendances** si une dépendance apparaît.
5. **Toujours citer l'ID `US-xx`** dans le message de commit (ex. `feat(staff): liste des
   enfants (US-11)`).
6. Ne jamais supprimer une ligne du backlog ; une story abandonnée passe en `Terminé` avec
   une note, ou reste `À faire` avec une note d'explication.

## Cahier de recette — règle de mise à jour (IMPORTANT)

Le fichier [`docs/recette/cahierrecette.md`](docs/recette/cahierrecette.md) liste les
scénarios de test (ID, objectif, prérequis, étapes, résultat attendu, résultat obtenu,
commentaire/capture si KO). Il est rédigé **avant** de tester et tenu vivant **sans qu'on
ait à le demander** :

1. **Dès qu'un scénario est joué** (par l'humain ou en vérification agent), mettre à jour
   son **Résultat obtenu** (`OK` / `KO` / `Bloquant` / `Non joué`) et, si `KO`/`Bloquant`,
   la colonne **Commentaire** (cause, et capture à joindre dans `docs/recette/`).
2. **Dès qu'un comportement de l'application change** (nouvelle US, correctif, refactor
   visible), revoir les scénarios impactés : ajuster le résultat attendu, repasser le
   **Résultat obtenu** à `Non joué`, ajouter un scénario si un nouveau parcours apparaît
   (IDs `SCxx` séquentiels, jamais réattribués).
3. Tenir à jour le **tableau de synthèse** en tête de fichier (vue Go/NoGo).
4. Après mise à jour, proposer le commit :
   `git add docs/recette/ && git commit -m "docs: maj cahier de recette"`.

L'humain valide le contenu et garde la main sur le choix des scénarios.

## Tableau de bugs — règle de mise à jour (IMPORTANT)

Le fichier [`docs/recette/bugs.md`](docs/recette/bugs.md) recense **tout** problème
rencontré, même mineur. Tenu vivant **sans qu'on ait à le demander** :

1. **Dès qu'un bug est détecté** : créer l'entrée (`BUGxxx`, IDs séquentiels jamais
   réattribués) — description en une phrase, page/route concernée, comportement
   attendu, comportement observé, sévérité proposée (`Bloquant` / `Majeur` / `Mineur`),
   statut `Nouveau`.
2. **Bug `Bloquant` ou `Majeur`** : créer une branche `fix/BUGxxx-…` depuis `staging`,
   corriger, ajouter/adapter un test, vérifier (`pnpm build`, `pnpm lint`, scénario de
   recette concerné), fusionner.
3. **Dès qu'un bug est corrigé** : passer le statut à `Corrigé` avec l'**ID du commit
   ou de la PR**, puis rejouer et mettre à jour le scénario de recette impacté.
4. Tenir à jour le **tableau de synthèse** en tête de fichier.
5. Après mise à jour, proposer :
   `git add docs/recette/ && git commit -m "docs: maj tableau de bugs"`.

L'humain valide la sévérité et la priorisation.

## Conventions & patterns

- **Langue de l'interface : français.** Textes utilisateur, libellés, messages d'erreur.
- **Opérations sensibles = Server Action ou route handler**, jamais côté client :
  insertion d'un événement avec vérification de l'autorisation médicament, changement de
  statut d'un message, génération du lien d'invitation parent, envoi d'emails.
- **Lecture directe Supabase côté client** uniquement pour des opérations couvertes par la
  RLS ; sinon passer par le serveur.
- **La RLS est la source de vérité de la sécurité.** Les gardes côté application (redirection
  d'un parent hors de ses enfants) sont un complément, pas un substitut.
- **Tous les écrans sont construits en composants ShadCN et alignés sur la charte Nuage.**
  Règle non négociable : dès qu'un composant ShadCN existe pour un besoin (bouton, champ,
  carte, dialog, badge, onglets, sélecteur de date…), on l'utilise et on le personnalise
  via les tokens — jamais de HTML brut restylé à la main, jamais de couleur / rayon /
  ombre / police en dur. Cette règle s'applique automatiquement à chaque écran, sans avoir
  à la redemander.
- **Styles** : classes Tailwind dans le JSX (`className="flex items-center gap-4 p-4"`),
  jamais de fichier CSS séparé. Toujours les tokens de la charte Nuage (définis dans
  [`app/globals.css`](app/globals.css)) plutôt que des valeurs en dur :
  - sémantiques ShadCN : `bg-primary`, `bg-card`, `text-muted-foreground`, `border-border`,
    `ring-ring`, `bg-destructive`…
  - charte Nuage : `text-ink`, `text-ink-soft`, `bg-surface`, `bg-canvas`, `border-line`,
    `bg-primary-soft`, `bg-secondary-strong`, `bg-accent-strong`, `text-success`,
    `text-warning`, `rounded-pill`, `shadow-soft`, `shadow-lift`, `font-heading`.
  - couleurs d'événement : `bg-event-repas` / `text-event-repas-foreground`, idem `sieste`,
    `activite`, `medicament`, `incident`.
- **Composants ShadCN** : les ajouter avec `pnpm dlx shadcn@latest add <composant>`,
  puis les personnaliser via les tokens de la charte (ne pas les contourner).
- **Responsive** : navigation par sidebar sur desktop, bottom navigation sur mobile
  (l'équipe utilise l'app debout sur téléphone/tablette). Cibles tactiles ≥ 44 px.
- **Timeline** : tri `created_at` décroissant, filtre « Aujourd'hui » par défaut, sélecteur
  de date, **pas de temps réel** (rechargement de page ; bandeau « dernière synchro »).
- **Messagerie** : modèle asynchrone, pas de Realtime. Un message = un `INSERT`. Côté staff,
  liste triée récent → ancien (pas un fil par enfant). Côté parent, 500 caractères max avec
  compteur.
- **Types d'événements** (`events.type`) : `repas`, `sieste`, `activité`, `médicament`,
  `incident`. Chaque événement conserve `author_id` et `created_at`.
- **États vides** : toujours un message bienveillant + action. **Jamais d'écran blanc** :
  toute erreur réseau affiche un message explicite + bouton « Réessayer ».
- **Git** : jamais de push direct sur `main`. Travail sur `staging`, passage en production
  par Pull Request. Citer l'`US-xx` dans le commit.

## Exemples concrets à reproduire

### Server Action d'insertion d'événement avec garde médicament (US-15)

```ts
// app/staff/children/[id]/actions.ts
"use server";
import { createServerClient } from "@/lib/supabase/server";

export async function addEvent(childId: string, input: EventInput) {
  const supabase = await createServerClient();

  if (input.type === "médicament") {
    const { data: child } = await supabase
      .from("children")
      .select("medication_allowed")
      .eq("id", childId)
      .single();

    // Garde-fou serveur : non négociable, la validation client ne suffit pas.
    if (!child?.medication_allowed) {
      return { ok: false, status: 403, error: "Autorisation parentale absente." };
    }
  }

  const { error } = await supabase.from("events").insert({ child_id: childId, ...input });
  return error ? { ok: false, error: error.message } : { ok: true };
}
```

### Policy RLS : un parent ne lit que les événements de ses enfants (US-04)

```sql
alter table events enable row level security;

create policy "events_select_staff_or_parent"
on events for select
using (
  is_staff()
  or exists (
    select 1 from family_members fm
    where fm.child_id = events.child_id
      and fm.profile_id = auth.uid()
  )
);

create policy "events_insert_staff_only"
on events for insert
with check (is_staff());
```

### Composant : classes Tailwind + tokens de la charte

```tsx
<article className="rounded-2xl bg-surface p-4 shadow-sm">
  <h3 className="font-heading text-lg font-bold text-ink">{child.firstName}</h3>
  <p className="text-sm text-ink-soft">{child.section}</p>
</article>
```

## À ne JAMAIS modifier / faire

- **Ne pas toucher au bloc `nextjs-agent-rules`** en tête de ce fichier : il est réécrit
  par `next dev`. Le laisser tel quel et le commiter avec le reste.
- **Ne pas modifier le dossier `prototype/`** : c'est un projet autonome (maquette Phase 2,
  React + Vite), avec son propre `package.json`, son propre lockfile et son propre workflow
  GitHub Actions. Il n'a rien à voir avec l'application Next.js.
- **Ne jamais exposer `SUPABASE_SERVICE_ROLE_KEY` côté client** : jamais dans une variable
  `NEXT_PUBLIC_*`, jamais importée dans un composant client. Uniquement Server Action / route
  handler.
- **Ne jamais commiter `JOURNAL.md`** ni aucun fichier `.env*` : ils contiennent des secrets
  et restent dans `.gitignore`.
- **Ne jamais pousser directement sur `main`** : le passage en production se fait par Pull
  Request depuis `staging`.
- **Ne jamais insérer de données de test dans `lespetitspas-prod`** : cette base ne reçoit
  que les scripts de structure (tables, trigger, policies RLS).
- **Ne pas contourner la RLS** : ne pas utiliser la clé `service_role` pour des lectures qui
  devraient passer par les policies.
- **Ne pas réattribuer un ID `US-xx`** dans `backlog.md` et ne pas y supprimer de ligne.
- **Ne pas ajouter de temps réel** (Supabase Realtime, indicateur « en train d'écrire »,
  accusé de lecture) : hors périmètre du MVP.
