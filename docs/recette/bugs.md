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
