# Tableau de bugs — Les Petits Pas

> Tout problème rencontré est consigné ici, **même mineur**. Tenu à jour par l'IA
> (règle dans [`AGENTS.md`](../../AGENTS.md), section « Tableau de bugs »).
> L'humain valide la sévérité et la priorisation.

## Sévérités

| Niveau | Définition | Traitement |
|---|---|---|
| **Bloquant** | Fonctionnalité inutilisable **ou** sécurité compromise. | Correction **obligatoire avant mise en production**. |
| **Majeur** | Fonctionnalité dégradée mais contournable. | À corriger en priorité. |
| **Mineur** | Problème esthétique ou cas extrême peu probable. | Peut attendre. |

## Statuts

`Nouveau` · `En cours` · `Corrigé` (avec l'ID du commit ou de la PR).

---

## État à ce jour

La **recette formelle** ([`cahierrecette.md`](cahierrecette.md), SC01–SC26) n'a
révélé **aucun bug** (26/26 `OK`, 4/4 NoGo `OK`).

Le tableau ci-dessous recense les problèmes rencontrés **pendant le développement**
(Phases 5–7). Tous ont été corrigés **avant la validation de la User Story
concernée** — ils ne sont jamais arrivés en `staging` sous forme de régression.

| ID | Description | Page | Sévérité | Statut |
|---|---|---|---|---|
| BUG001 | Erreur runtime `normalize is not a function` à l'ouverture de la liste des enfants | `/staff` | Majeur | Corrigé — `2c91def` |
| BUG002 | Le prénom du membre d'équipe n'apparaît pas sur la timeline parent | `/parent/children/[id]` | Majeur | Corrigé — `f2ee6ad` + `supabase/06_profiles_staff_readable.sql` |
| BUG003 | Les emails transactionnels n'arrivent pas aux comptes de test (alias `+`) | Fiche enfant → « Envoyer l'invitation » ; notification message | Mineur | Corrigé (contournement) — `1f876d9` |
| BUG004 | Adresse email personnelle présente dans l'historique git public (3 anciens commits) | Dépôt GitHub (historique) | Mineur | Nouveau — décision en attente (voir détail) |

---

## Détail des bugs

### BUG001 — `normalize is not a function` sur `/staff`

- **Description** : ouverture de `/staff` impossible, erreur JavaScript à l'exécution.
- **Page concernée** : `/staff` (composant `app/staff/children-list.tsx`).
- **Comportement attendu** : la grille des enfants s'affiche.
- **Comportement observé** : overlay d'erreur Next.js — `TypeError` sur l'appel
  `normalize(query)`. L'export `normalize` venait d'être ajouté à `lib/utils.ts` ;
  le serveur de dev (Turbopack) servait encore l'ancienne version du module au bundle
  client (cache HMR périmé).
- **Sévérité** : **Majeur** — page entièrement inaccessible, mais isolée à `/staff`
  et liée à l'outillage de dev (invisible sur un build de production).
- **Statut** : **Corrigé** — commit `2c91def`. Renommage `normalize` → `foldAccents`
  (nouveau symbole = ré-résolution forcée du module) et purge de `.next`. Vérifié :
  `pnpm build` + serveur de dev relancé au propre.

### BUG002 — Prénom du staff absent sur la timeline parent

- **Description** : sur la timeline parent, aucun événement n'indique qui l'a saisi.
- **Page concernée** : `/parent/children/[id]`.
- **Comportement attendu** : chaque carte d'événement affiche « Saisi par [prénom du
  membre d'équipe] » (critère d'acceptation **US-20**).
- **Comportement observé** : la jointure `events.author_id → profiles(first_name)`
  renvoyait `null` pour un parent. La policy RLS `profiles_select_self_or_staff`
  (script `03_rls.sql`) n'autorise un utilisateur qu'à lire **son propre** profil ou,
  s'il est staff, tous les profils — un parent ne pouvait donc pas lire le profil du
  staff auteur.
- **Sévérité** : **Majeur** — fonctionnalité livrable mais critère d'acceptation non
  rempli ; contournable (l'événement s'affiche sans l'auteur).
- **Statut** : **Corrigé** — livré avec `f2ee6ad`. Nouveau script
  `supabase/06_profiles_staff_readable.sql` : policy permissive « tout utilisateur
  connecté peut lire les profils de rôle `staff` » (les prénoms du staff sont montrés
  aux familles par conception ; les profils `parent` restent cloisonnés). Détecté en
  revue de code avant la validation d'US-20 ; script appliqué manuellement dans le
  SQL Editor.

### BUG003 — Emails de test non délivrés aux alias `+`

- **Description** : l'email d'invitation (US-25) et la notification équipe (US-26)
  n'arrivaient pas dans la boîte Gmail lors des tests.
- **Page concernée** : fiche enfant → bouton « Envoyer l'invitation » ; Server Action
  `sendMessage` (notification à l'équipe).
- **Comportement attendu** : l'email arrive à l'adresse de test (`…+staff@…`,
  `…+parent1@…`).
- **Comportement observé** : Resend renvoie `403 validation_error` —
  *« You can only send testing emails to your own email address (…@gmail.com) »*.
  En mode test (`onboarding@resend.dev`), Resend n'accepte que l'adresse **exacte** du
  compte ; les alias `+` (pourtant livrés par Gmail) ne sont **pas** reconnus.
- **Sévérité** : **Mineur** — limitation d'un service tiers, pas un défaut applicatif.
  Non bloquant : l'échec est géré proprement (message enregistré, parcours non
  interrompu, erreur journalisée — cf. **SC24** / **US-27**).
- **Statut** : **Corrigé (contournement)** — commit `1f876d9`. Variable d'environnement
  `RESEND_TEST_RECIPIENT` : quand elle est renseignée, tous les emails sont redirigés
  vers l'adresse exacte du compte Resend, avec un bandeau « en production, irait à … ».
  **Résolution définitive** en production : vérifier un domaine Resend et changer
  `RESEND_FROM_EMAIL` (**US-35**), puis vider `RESEND_TEST_RECIPIENT`.

### BUG004 — Adresse email personnelle dans l'historique git public

- **Description** : lors de l'audit de sécurité du 2026-09-02, l'adresse
  `nocodeia.oc+…@gmail.com` (donc l'adresse de base `nocodeia.oc@gmail.com`) a été
  retrouvée dans **3 anciens commits** de l'historique public : `f04114b`, `9bac08e`,
  `7b2c73a` (scripts `supabase/04_seed_test_data.sql` et `05_rls_test.sql`).
- **Page concernée** : dépôt GitHub `nocodeiaoc-hub/lespetitspas` (historique git,
  branches `main` et `staging`).
- **Comportement attendu** : les scripts SQL versionnés utilisent un **placeholder**
  (`prenom.nom+…@gmail.com`), pas d'adresse réelle.
- **Comportement observé** : l'arbre **courant est propre** (placeholder rétabli au
  commit `146f70f`), mais les 3 commits antérieurs contiennent encore l'adresse réelle.
- **Sévérité** : **Mineur** — il s'agit d'une **adresse email, pas d'un identifiant**
  (aucun mot de passe, aucune clé API ou `service_role` n'a jamais été committé —
  vérifié). Risque : spam / hameçonnage ciblé.
- **Statut** : **Nouveau — décision en attente**. Trois options, au choix du chef de
  projet :
  1. **Accepter et documenter** (risque `R8` du PV) — le plus simple ; le dépôt reste
     public, l'exposition est jugée acceptable pour un projet d'école.
  2. **Passer le dépôt en privé** — supprime toute exposition publique (email + schéma
     SQL) ; à vérifier avec les contraintes de la soutenance / de GitHub Pages.
  3. **Réécrire l'historique** (`git filter-repo` + `push --force` sur `main` et
     `staging`) — nettoie l'email, mais **invalide tous les SHA de commit** référencés
     dans `bugs.md` / `pvrecette.md` / les messages de commit, et GitHub garde les
     anciens commits en cache ~90 j.

---

## Procédure pour un nouveau bug

1. Créer l'entrée ici (`BUGxxx`, IDs séquentiels jamais réattribués) : description,
   page, comportement attendu / observé, sévérité proposée. Statut `Nouveau`.
2. **Bloquant ou Majeur** : créer une branche `fix/BUGxxx-…` depuis `staging`,
   corriger, ajouter/adapter un test, vérifier (`pnpm build`, `pnpm lint`, scénario
   de recette concerné), puis fusionner dans `staging`.
3. Passer le statut à `Corrigé` avec l'**ID du commit ou de la PR**, rejouer le
   scénario de recette impacté et mettre à jour `cahierrecette.md`.
4. Proposer : `git add docs/recette/ && git commit -m "docs: maj tableau de bugs"`.

---

## Historique des révisions

| Date | Révision |
|---|---|
| 2026-09-02 | Création du tableau. Recensement rétroactif de BUG001–BUG003 (rencontrés en dev Phases 5–7, tous corrigés). Recette formelle SC01–SC26 : aucun bug. |
| 2026-09-02 | Audit de sécurité du dépôt : **aucun secret exposé** (ni `.env*`, ni clé API/`service_role`, ni `JOURNAL.md` — jamais committés). BUG004 ajouté (adresse email dans 3 anciens commits, Mineur, décision en attente). |
