# Product Backlog — Les Petits Pas

Application web de vie quotidienne pour la crèche **Les Petits Pas** : l'équipe saisit
les événements de la journée des enfants, les parents consultent la journée de leur
enfant et échangent des messages avec l'équipe.

Ce fichier est le **Product Backlog** du projet. Il est tenu à jour en continu :
voir la règle dans [`AGENTS.md`](AGENTS.md) (section « Product Backlog »).

## Légende des statuts

| Statut | Signification |
|---|---|
| `À faire` | Pas encore commencé |
| `En cours` | Développement démarré (au moins un commit lié) |
| `Terminé` | Développé **et vérifié** (critères d'acceptation remplis, tests au vert) |

## Contexte déjà acquis (hors backlog)

- **Phase 1** — Environnement de vibe coding : projet Next.js + ShadCN initialisé, chaîne
  de déploiement Vercel (local / staging / production) opérationnelle.
- **Phase 2** — Design : prototype d'interface navigable livré dans [`prototype/`](prototype/)
  (React + Vite + Tailwind, données fictives), déployé comme référence visuelle.
  Charte graphique retenue : **Nuage**.

## Conventions du backlog

- **Format d'une User Story** : `En tant que <rôle>, je veux <action> afin de <bénéfice>`.
- **Rôles** : `Équipe` (staff de la crèche), `Parent`, `Développeur` (tâches techniques
  sans valeur utilisateur directe).
- **Entité** : table(s) Supabase ou brique concernée. Les noms de tables sont indicatifs
  et seront figés en Phase 4 (`docs/datamodel.md`).
- **IDs** : `US-01` … séquentiels, jamais réattribués.
- Priorité = ordre de lecture (les phases se font dans l'ordre 4 → 8).

---

## Phase 4 — Socle : modèle de données & authentification

> Cette phase se joue surtout dans Supabase (SQL Editor, Authentication) et dans la
> configuration du projet. Base de travail : `lespetitspas` (local + staging).

### US-01 — Modèle de données relationnel

- **User Story** : En tant que développeur, je veux un modèle de données relationnel
  couvrant tous les besoins fonctionnels afin de construire l'application sur une base saine.
- **Entité** : `profiles`, `children`, `family_members`, `events`, `messages`
- **Critères d'acceptation** :
  - Le modèle identifie toutes les informations à stocker (enfants, sections, allergies,
    autorisation médicament, familles, événements typés, messages, rôles, auteurs).
  - Chaque table a ses colonnes, types et relations documentés dans `docs/datamodel.md`.
  - Le rôle (`staff` / `parent`) est porté par `profiles.role`.
  - Chaque `event` conserve son auteur (`author_id`) et son horodatage (`created_at`).
  - Un enfant peut être rattaché à une ou deux familles via `family_members`.
- **Statut** : Terminé
- **Contraintes / Dépendances** : conception faite avec une IA gratuite (pas Cursor).
  Aucune dépendance.
- **Description technique** : modélisation type P3 (Airtable) transposée sur Postgres.
  Diagramme Mermaid + dictionnaire de données livrés dans `docs/datamodel.md`. Modèle
  validé (6 tables, `events` en table unique avec colonnes typées + CHECK).

### US-02 — Scripts SQL de création des tables

- **User Story** : En tant que développeur, je veux générer et appliquer les scripts SQL
  afin de créer la structure de la base sans la construire à la main.
- **Entité** : toutes les tables
- **Critères d'acceptation** :
  - Les scripts SQL (tables, contraintes, index, enums de types d'événements) sont générés
    à partir du modèle US-01.
  - Ils sont appliqués via le **SQL Editor** de Supabase sur `lespetitspas`.
  - Les scripts de structure sont versionnés (`supabase/` ou `docs/sql/`).
- **Statut** : Terminé
- **Contraintes / Dépendances** : dépend de **US-01**. `supabase/01_schema.sql` appliqué
  sur `lespetitspas` ; à rejouer sur `lespetitspas-prod` en fin de Phase 4.
- **Description technique** : génération assistée par IA, exécution manuelle dans le
  SQL Editor. Types d'événements (valeurs ASCII) : `repas`, `sieste`, `activite`,
  `medicament`, `incident`.

### US-03 — Table `profiles` + trigger de création automatique

- **User Story** : En tant que développeur, je veux qu'un profil soit créé automatiquement
  à chaque inscription afin de lier chaque compte à un rôle.
- **Entité** : `profiles`, `auth.users`
- **Critères d'acceptation** :
  - `profiles.id = auth.uid()` (référence `auth.users`).
  - Un **trigger SQL** insère une ligne dans `profiles` à chaque nouvelle inscription.
  - `profiles.role` vaut `staff` ou `parent`, jamais modifiable depuis l'application.
- **Statut** : Terminé
- **Contraintes / Dépendances** : dépend de **US-02**. `supabase/02_auth_trigger.sql`
  appliqué ; profils créés automatiquement, vérifié. À rejouer sur `lespetitspas-prod`.
- **Description technique** : fonction `handle_new_user()` (SECURITY DEFINER) + trigger
  `on_auth_user_created` sur `auth.users`. Rôle par défaut `parent` (le staff est promu
  par `supabase/04_seed_test_data.sql`).

### US-04 — Row Level Security (RLS) sur toutes les tables

- **User Story** : En tant que parent, je veux qu'aucune donnée d'un enfant qui n'est pas
  le mien ne me soit accessible afin que les données restent cloisonnées.
- **Entité** : `profiles`, `children`, `events`, `messages`, `family_members`
- **Critères d'acceptation** :
  - RLS **activée** sur toutes les tables.
  - `profiles` : chacun lit son profil ; un staff lit les profils nécessaires à l'affichage
    (auteur d'événement, parent émetteur). UPDATE limité à son propre profil, jamais le rôle.
  - `children` / `events` : SELECT si staff **ou** parent rattaché via `family_members` ;
    INSERT/UPDATE staff uniquement.
  - `messages` : SELECT si staff ou parent rattaché ; INSERT parent (ses messages) ;
    UPDATE staff (statuts).
  - `family_members` : SELECT si staff ou si le profil concerné = utilisateur connecté ;
    écriture hors interface (script SQL).
- **Statut** : Terminé
- **Contraintes / Dépendances** : dépend de **US-02**, **US-03**. `supabase/03_rls.sql`
  appliqué ; isolation **validée** avec `supabase/05_rls_test.sql` (chaque parent ne voit
  que ses enfants, un parent ne peut pas créer d'événement). À rejouer sur `lespetitspas-prod`.
- **Description technique** : policies `using` / `with check`, helper `is_staff()` et
  jointure `family_members`. À tester depuis le SQL Editor en se faisant passer pour un user.

### US-05 — Configuration de l'authentification Supabase

- **User Story** : En tant que développeur, je veux configurer l'authentification
  email/mot de passe afin que staff et parents puissent se connecter.
- **Entité** : `auth` (Supabase)
- **Critères d'acceptation** :
  - Provider **Email** activé.
  - Option **Confirm email** cohérente avec les comptes de test (si active, adresses
    confirmées avant première connexion).
  - Réinitialisation de mot de passe gérée nativement par Supabase Auth.
- **Statut** : Terminé
- **Contraintes / Dépendances** : dépend de **US-03**. Provider Email activé, 3 comptes de
  test créés et fonctionnels. Reste à consigner le choix `Confirm email` dans `JOURNAL.md`.
- **Description technique** : réglages tableau de bord Supabase (Authentication → Providers,
  Email templates, URL de redirection `NEXT_PUBLIC_APP_URL`).

### US-06 — Jeu de données de test (script SQL)

- **User Story** : En tant que développeur, je veux un jeu de données réaliste afin de
  développer et tester l'application sans écran de création.
- **Entité** : `children`, `family_members`, `profiles`
- **Critères d'acceptation** :
  - 1 compte `staff` + 2 comptes `parent` créés avec des alias `+` d'une même adresse Gmail.
  - Enfants répartis sur les 3 sections (Bébés, Moyens, Grands), avec allergies variées et
    `medication_allowed` à `true` pour certains / `false` pour d'autres.
  - Liens `family_members` créés par script SQL.
- **Statut** : Terminé
- **Contraintes / Dépendances** : dépend de **US-02**, **US-03**. Uniquement sur
  `lespetitspas` (jamais sur `lespetitspas-prod`). `supabase/04_seed_test_data.sql`
  appliqué : staff promu, 3 enfants (Ana Maria, Sarah, Ilyès), liens `family_members` OK.
- **Description technique** : script `04_seed_test_data.sql` idempotent (promotion staff,
  enfants Ana Maria / Sarah / Ilyès, liens `family_members` par lookup email). Non appliqué
  en production.

### US-37 — Branchement des clients Supabase (SDK + navigateur/serveur)

- **User Story** : En tant que développeur, je veux préparer la connexion à Supabase
  (librairies + clients navigateur et serveur) afin que les écrans d'authentification et
  de données puissent s'appuyer dessus.
- **Entité** : brique Supabase (`lib/supabase/`)
- **Critères d'acceptation** :
  - `@supabase/supabase-js` et `@supabase/ssr` installés.
  - `.env.local` créé avec `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
    `NEXT_PUBLIC_APP_URL` (valeurs à renseigner par le développeur).
  - Client navigateur (`lib/supabase/client.ts`) et client serveur
    (`lib/supabase/server.ts`, asynchrone, gestion des cookies) créés pour l'App Router.
  - Aucun écran ni style modifié à ce stade ; `pnpm build` au vert.
- **Statut** : Terminé
- **Contraintes / Dépendances** : dépend de **US-05**. Bloquant pour **US-07**, **US-08**.
  Le middleware de rafraîchissement de session (renommé « proxy » dans cette version de
  Next.js) est hors périmètre ici et traité en **US-08**. Connexion vérifiée en réel
  (endpoint Auth joignable, PostgREST joignable, RLS bloque la lecture anonyme de `children`).
- **Description technique** : `createBrowserClient` / `createServerClient` de `@supabase/ssr`,
  API cookies `getAll` / `setAll`, `cookies()` de `next/headers` désormais asynchrone.

### US-38 — Configuration de la charte graphique « Nuage » dans le thème

- **User Story** : En tant que développeur, je veux configurer la charte Nuage dans le
  thème du projet afin que tous les écrans soient cohérents sans réglage écran par écran.
- **Entité** : thème (`app/globals.css`, `app/layout.tsx`)
- **Critères d'acceptation** :
  - Tokens de la charte Nuage (couleurs, polices, rayons, ombres) repris de la maquette
    Phase 2 et mappés sur les tokens sémantiques ShadCN dans `app/globals.css`.
  - Polices DM Sans (corps) et Plus Jakarta Sans (titres) chargées via `next/font`.
  - Layout global en place : `lang="fr"`, fond `canvas`, texte `ink`, police, metadata.
  - Règle ajoutée dans `AGENTS.md` : tous les écrans en composants ShadCN alignés sur la
    charte.
  - `pnpm dev` démarre et affiche les couleurs de la charte ; `pnpm build` au vert.
  - Aucun écran métier codé à ce stade.
- **Statut** : Terminé
- **Contraintes / Dépendances** : charte **Nuage** retenue en Phase 2. Aucune dépendance.
- **Description technique** : `@theme inline` (Tailwind v4) — deux familles de tokens
  (sémantiques ShadCN + palette Nuage étendue `ink` / `surface` / `canvas` / `*-soft` /
  `event-*`). Pas de dark mode métier (charte claire uniquement) ; bloc `.dark` fourni mais
  dormant (pas de sélecteur de thème).

### US-07 — Écran de connexion `/login`

- **User Story** : En tant qu'utilisateur, je veux me connecter avec mon email et mon mot
  de passe afin d'accéder à mon espace.
- **Entité** : `auth`, `profiles`
- **Critères d'acceptation** :
  - Champs email + mot de passe, message d'erreur **explicite** en cas d'échec.
  - Redirection par rôle : `staff` → `/staff`, `parent` → `/parent`.
  - Un utilisateur déjà connecté qui ouvre `/login` est redirigé vers son espace.
- **Statut** : Terminé
- **Contraintes / Dépendances** : dépend de **US-05**, **US-37**. Route : `/login`.
- **Description technique** : `@supabase/ssr`. Connexion via **Server Action** `signIn`
  (`app/actions.ts`) sur le client serveur — c'est elle qui pose les cookies d'auth —,
  puis lecture du rôle dans `profiles` (`lib/auth.ts`, `getProfile` mémoïsé) et
  `redirect()` par rôle. Formulaire client `useActionState` (`app/login/login-form.tsx`),
  message d'erreur générique « Email ou mot de passe incorrect. ». `/login` et `/`
  redirigent l'utilisateur déjà connecté vers son espace.

### US-08 — Déconnexion & persistance de session

- **User Story** : En tant qu'utilisateur, je veux rester connecté après un rafraîchissement
  et pouvoir me déconnecter depuis n'importe quelle page.
- **Entité** : `auth`
- **Critères d'acceptation** :
  - Bouton de déconnexion accessible depuis toutes les pages authentifiées.
  - La session persiste après rechargement de la page.
  - Après déconnexion, tout accès à une route protégée renvoie vers `/login`.
- **Statut** : Terminé
- **Contraintes / Dépendances** : dépend de **US-07**, **US-37**.
- **Description technique** : `proxy.ts` (ex-`middleware`, renommé Next.js 16) +
  `lib/supabase/middleware.ts` (`updateSession`) rafraîchit la session à chaque
  navigation et réécrit les cookies → persistance après rechargement + garde optimiste
  (visiteur → `/login`). Bouton de déconnexion (`components/logout-button.tsx`) dans la
  coquille `AppShell`, présent sur toutes les pages `/staff` et `/parent` ; Server Action
  `signOut` → `supabase.auth.signOut()` → `redirect('/login')`.

### US-09 — Réinitialisation du mot de passe

- **User Story** : En tant qu'utilisateur, je veux réinitialiser mon mot de passe afin de
  récupérer l'accès à mon compte.
- **Entité** : `auth`
- **Critères d'acceptation** :
  - Le flux utilise l'écran natif Supabase (aucun écran à construire).
  - Le lien d'invitation parent réutilise ce même mécanisme (définition du mot de passe).
- **Statut** : À faire
- **Contraintes / Dépendances** : dépend de **US-05**.
- **Description technique** : `resetPasswordForEmail` / page de callback Supabase,
  `redirectTo` configuré.

### US-10 — Server Action d'invitation parent (génération du lien)

- **User Story** : En tant que développeur, je veux générer un lien sécurisé de création de
  mot de passe quand un parent est rattaché à un enfant afin de préparer son invitation.
- **Entité** : `family_members`, `auth.users`, `profiles`
- **Critères d'acceptation** :
  - Une **Server Action** (jamais exposée au client) appelle
    `supabase.auth.admin.generateLink()` avec la clé `service_role`.
  - Le lien est à usage unique, valable 24 h.
  - Le cas « parent a déjà défini son mot de passe » est géré (message clair, pas de crash).
- **Statut** : Terminé
- **Contraintes / Dépendances** : dépend de **US-04**, **US-06**. L'envoi de l'email est
  traité en **US-25**.
- **Description technique** : Server Action `sendParentInvitation(childId, parentProfileId)`
  (`app/staff/children/[id]/actions.ts`, garde staff). Client admin isolé
  (`lib/supabase/admin.ts`, `import "server-only"`, `SUPABASE_SERVICE_ROLE_KEY`).
  `admin.auth.admin.generateLink({ type: "invite" })` puis repli sur `{ type: "recovery" }`
  si le parent a déjà un compte. Vérifie le rattachement `family_members` avant.
  Déclenchable depuis la fiche enfant (bouton « Envoyer l'invitation » par parent).

---

## Phase 5 — Espace équipe

> Interface complète utilisée par l'équipe, sur téléphone ou tablette, debout,
> tout au long de la journée.

### US-11 — Liste des enfants `/staff`

- **User Story** : En tant qu'équipe, je veux voir tous les enfants inscrits, les rechercher
  par nom et les filtrer par section afin d'accéder rapidement à une fiche.
- **Entité** : `children`
- **Critères d'acceptation** :
  - Recherche par prénom/nom.
  - Filtre par section : Bébés / Moyens / Grands (+ « Tous »).
  - Carte enfant : avatar (photo si URL renseignée, sinon initiales colorées), prénom,
    section.
  - Clic sur une carte → fiche enfant.
- **Statut** : Terminé
- **Contraintes / Dépendances** : dépend de **US-04**, **US-07**. Route : `/staff`.
  L'indicateur d'activité du jour est sorti dans **US-39** (dépend des événements, US-13).
- **Description technique** : `app/staff/page.tsx` (Server Component) lit `children`
  (RLS staff), passe la liste à `app/staff/children-list.tsx` (`"use client"`) qui gère
  recherche (tolérante aux accents) et filtre de section. Cartes = `<Link>` vers
  `/staff/children/[id]`. Composant `ChildAvatar` (photo → repli initiales colorées).
  États vides : aucun enfant / aucun résultat. Pas de champ « statut » stocké en base.

### US-12 — Fiche enfant : résumé `/staff/children/[id]`

- **User Story** : En tant qu'équipe, je veux voir en un coup d'œil les informations clés
  d'un enfant afin d'agir en connaissance de cause.
- **Entité** : `children`, `family_members`, `profiles`, `messages`
- **Critères d'acceptation** :
  - Encart résumé : allergies, autorisation médicament (badge), parents rattachés (noms/contact).
  - Bloc « messages non traités » avec compteur et aperçu, lien vers la messagerie.
- **Statut** : Terminé
- **Contraintes / Dépendances** : dépend de **US-11**. Route : `/staff/children/[id]`.
  Lien vers la messagerie repoussé à **US-16** (route `/staff/messages` pas encore créée) :
  pour l'instant, aperçu inline des messages non traités.
- **Description technique** : Server Component `app/staff/children/[id]/page.tsx`, 4 requêtes
  en parallèle (child, `family_members`→`profiles`, `messages` non traités +
  `from`→`profiles`, `events` du jour). Bouton « Ajouter un événement » →
  `/staff/children/[id]/nouvel-evenement` (stub US-14).

### US-13 — Timeline du jour + sélecteur de date

- **User Story** : En tant qu'équipe, je veux consulter tous les événements de la journée
  d'un enfant afin de suivre son déroulé.
- **Entité** : `events`
- **Critères d'acceptation** :
  - Événements triés par `created_at` décroissant (plus récent en haut).
  - Filtre « Aujourd'hui » par défaut, sélecteur de date pour les jours précédents.
  - Un badge distinct par type d'événement.
  - Note indiquant la dernière heure de synchronisation (pas de temps réel).
- **Statut** : Terminé
- **Contraintes / Dépendances** : dépend de **US-12**.
- **Description technique** : requête `events` filtrée par `child_id` et bornes UTC de la
  journée vécue à Paris (`lib/date.ts`, `parisDayRange`). Sélecteur de date client
  (`date-selector.tsx`) qui pousse `?date=YYYY-MM-DD` → le Server Component recharge.
  `Timeline` : badge coloré par type (`EventBadge` + tokens `event-*`), résumé lisible
  (`lib/events.ts`), note « dernière synchro », état vide bienveillant. Pas de Realtime.

### US-14 — Formulaire d'ajout d'événement (repas / sieste / activité / incident)

- **User Story** : En tant qu'équipe, je veux ajouter un événement en quelques interactions
  afin de renseigner la journée sans perdre de temps.
- **Entité** : `events`
- **Critères d'acceptation** :
  - Select de type + champs conditionnels :
    - **Repas** : moment (matin/midi/goûter) + qualité (tout/moitié/peu/rien) + note.
    - **Sieste** : heure début + heure fin + qualité (calme/agitée/réveil précoce) + note.
    - **Activité** : nom + note.
    - **Incident** : type (chute/morsure/fièvre/autre) + gravité (léger/modéré/urgent) + note.
  - À l'enregistrement, l'événement apparaît en haut de la timeline.
  - L'auteur (membre de l'équipe connecté) et l'horodatage sont enregistrés.
- **Statut** : Terminé
- **Contraintes / Dépendances** : dépend de **US-13**. Le type **médicament** est traité
  en **US-15**. Route : `/staff/children/[id]/nouvel-evenement`.
- **Description technique** : `event-form.tsx` (`"use client"`) — 5 boutons de type,
  champs conditionnels, `SegmentedField` (radios en puces) pour les enums, `Input type=time`
  pour les heures. Server Action `addEvent` (`actions.ts`, `.bind(childId)`) : garde staff,
  `author_id = profil connecté`, insertion `events` avec seulement les colonnes du type
  choisi (contrainte CHECK), puis `revalidatePath` + `redirect` vers la fiche.

### US-15 — Saisie d'un médicament : double validation obligatoire

- **User Story** : En tant qu'équipe, je veux être empêché d'enregistrer un médicament sans
  autorisation parentale afin de respecter la règle de sécurité.
- **Entité** : `events`, `children`
- **Critères d'acceptation** :
  - Champs : nom + dose + heure + case « Autorisation parentale confirmée ».
  - **Client** : bouton « Enregistrer » `disabled` tant que la case n'est pas cochée +
    message explicite sous le formulaire.
  - **Serveur** : la Server Action vérifie que la colonne d'autorisation médicament de
    `children` est `true` pour cet enfant avant tout `INSERT`. Sinon → statut **403**,
    aucune donnée écrite.
- **Statut** : Terminé
- **Contraintes / Dépendances** : dépend de **US-14**. Règle non négociable.
- **Description technique** : **Client** — si `medication_allowed` est faux, bandeau rouge
  + bouton désactivé (aucun champ affiché) ; sinon case « Autorisation parentale
  confirmée » obligatoire, bouton désactivé tant qu'elle n'est pas cochée + texte d'aide.
  **Serveur** — `addEvent` relit `children.medication_allowed`, refuse si faux (aucun
  INSERT), puis exige `consent === "on"`. La contrainte CHECK Postgres impose en plus
  `parental_consent_confirmed = true`. Test unitaire dédié (**US-30**), E2E (**US-31**).

### US-16 — Messagerie équipe `/staff/messages`

- **User Story** : En tant qu'équipe, je veux voir tous les messages reçus des parents au
  même endroit afin de les traiter.
- **Entité** : `messages`, `children`, `profiles`
- **Critères d'acceptation** :
  - Liste triée du plus récent au plus ancien (pas un fil de discussion par enfant).
  - Chaque ligne : prénom du parent, prénom de l'enfant concerné, extrait, date/heure, statut.
  - Filtre par statut.
- **Statut** : Terminé
- **Contraintes / Dépendances** : dépend de **US-04**, **US-07**. Route : `/staff/messages`.
- **Description technique** : `page.tsx` (Server Component) lit `messages` (RLS staff)
  triés `created_at desc`, joint `from_profile_id`→`profiles.first_name` et
  `child_id`→`children.first_name`. `messages-list.tsx` (`"use client"`) : filtre par
  statut (Tous / Nouveaux / Lus / Traités avec compteurs), carte par message. Lien
  « Messages » ajouté à la nav de l'espace équipe (`AppShell` + `Nav`).

### US-17 — Gestion des statuts de message (nouveau / lu / traité)

- **User Story** : En tant qu'équipe, je veux suivre l'état de traitement de chaque message
  afin de ne rien oublier.
- **Entité** : `messages`
- **Critères d'acceptation** :
  - Un message arrive en `nouveau`.
  - Il passe à `lu` quand l'équipe l'ouvre.
  - Il passe à `traité` via un bouton dédié, une fois l'information prise en compte.
- **Statut** : Terminé
- **Contraintes / Dépendances** : dépend de **US-16**.
- **Description technique** : Server Actions `markRead` / `markProcessed`
  (`app/staff/messages/actions.ts`, garde staff, `UPDATE messages.status`, RLS staff).
  Client : `useOptimistic` pour un retour immédiat, clic sur un message « nouveau » →
  `lu`, bouton « Marquer comme traité » → `traite`. `revalidatePath` rafraîchit aussi
  le bloc « messages à traiter » de la fiche enfant.

### US-18 — États vides & états d'erreur (espace équipe)

- **User Story** : En tant qu'équipe, je veux des écrans clairs quand il n'y a pas de
  données ou en cas de problème afin de ne jamais rester bloqué devant un écran blanc.
- **Entité** : —
- **Critères d'acceptation** :
  - Aucun événement du jour → message bienveillant + bouton « Ajouter un événement ».
  - Aucun enfant inscrit → message d'onboarding (enfants créés par script SQL en Phase 4).
  - Erreur réseau / Supabase indisponible → message explicite + bouton « Réessayer ».
  - Jamais d'écran blanc.
- **Statut** : Terminé
- **Contraintes / Dépendances** : transverse aux US-11 à US-17.
- **Description technique** : `app/staff/loading.tsx` (squelettes `SkeletonCards`),
  `app/staff/error.tsx` + `app/error.tsx` (composant partagé `ErrorState`, bouton
  « Réessayer » via `reset()`), `app/not-found.tsx` global pour les `notFound()`. États
  vides déjà en place (liste enfants, timeline, messagerie). Les pages lèvent désormais
  l'erreur Supabase pour atteindre la boundary plutôt que d'afficher un encart figé.

### US-39 — Indicateur d'activité du jour sur la carte enfant (`/staff`)

- **User Story** : En tant qu'équipe, je veux voir d'un coup d'œil quels enfants ont déjà
  des événements aujourd'hui afin de repérer ceux dont la journée n'est pas encore saisie.
- **Entité** : `events`, `children`
- **Critères d'acceptation** :
  - Chaque carte de `/staff` affiche « Aucun événement aujourd'hui » ou « N événement(s)
    aujourd'hui », dérivé côté interface (pas de champ stocké).
  - Le comptage porte sur la journée en cours (fuseau Europe/Paris).
- **Statut** : Terminé
- **Contraintes / Dépendances** : sortie de **US-11**. Dépend de **US-13** (bornes de date
  des événements). Route : `/staff`.
- **Description technique** : `app/staff/page.tsx` requête `events` (RLS staff) sur
  `parisDayRange(todayInParis())`, agrège par `child_id` en `Record<string, number>`,
  passé à `ChildrenList` → ligne « N événement(s) aujourd'hui » (verte) / « Aucun événement
  aujourd'hui » sur chaque carte.

---

## Phase 6 — Espace parent & messagerie

> Phase plus courte mais critique : c'est ici que se vérifie l'isolation des données.

### US-19 — Liste de mes enfants `/parent`

- **User Story** : En tant que parent, je veux voir uniquement mes enfants et un aperçu de
  leur journée afin d'accéder vite à l'essentiel.
- **Entité** : `children`, `family_members`, `events`
- **Critères d'acceptation** :
  - Une carte par enfant rattaché : prénom, photo ou initiales, dernier événement du jour,
    bouton « envoyer un message à l'équipe ».
  - Aucun enfant non rattaché n'apparaît.
- **Statut** : Terminé
- **Contraintes / Dépendances** : dépend de **US-04**. Route : `/parent`.
- **Description technique** : `app/parent/page.tsx` (Server Component) — `select` sur
  `children` filtré **implicitement par la RLS** (aucun `where` applicatif) ; requête
  `events` du jour (fuseau Paris) pour le dernier événement par enfant. Carte = `<Link>`
  vers `/parent/children/[id]` (stub US-20, protégé par la RLS). Bouton « Envoyer un
  message à l'équipe » → `/parent/messages/new` (stub US-22). `loading.tsx` / `error.tsx`
  dédiés, état vide « aucun enfant rattaché → contactez la crèche ». Nav parent ajoutée.

### US-20 — Journée de mon enfant `/parent/children/[id]`

- **User Story** : En tant que parent, je veux consulter la timeline de la journée de mon
  enfant afin de savoir comment s'est passée sa journée.
- **Entité** : `events`, `profiles`
- **Critères d'acceptation** :
  - Timeline en lecture seule (le parent ne peut pas ajouter d'événement).
  - Affiche le prénom du membre de l'équipe qui a saisi chaque événement.
  - Sélecteur de date pour les jours précédents.
- **Statut** : Terminé
- **Contraintes / Dépendances** : dépend de **US-19**, **US-21**. Route : `/parent/children/[id]`.
- **Description technique** : `app/parent/children/[id]/page.tsx` réutilise les composants
  partagés `Timeline` et `DateSelector` (extraits de l'espace équipe vers `components/`).
  Jointure `events` → `author:profiles(first_name)` ; nécessite la policy
  `supabase/06_profiles_staff_readable.sql` (parent peut lire les profils `staff`).
  Timeline en lecture seule (pas de bouton d'ajout). `loading.tsx` / `error.tsx` hérités
  du segment `/parent`.

### US-21 — Contrôle d'accès serveur parent → enfant

- **User Story** : En tant que parent, je veux être empêché d'accéder à la fiche d'un enfant
  qui n'est pas le mien afin que la confidentialité soit garantie même en tapant l'URL.
- **Entité** : `family_members`
- **Critères d'acceptation** :
  - Une vérification **côté serveur** confirme que l'enfant consulté est rattaché au parent
    connecté.
  - Sinon → redirection vers `/parent` (ou erreur explicite).
- **Statut** : Terminé
- **Contraintes / Dépendances** : dépend de **US-04**. Bloquant pour **US-20**. Vérifié par
  le test E2E **US-32**.
- **Description technique** : dans `app/parent/children/[id]/page.tsx`, `select` sur
  `children` filtré par la RLS ; si `single()` ne renvoie rien (enfant non rattaché ou
  inexistant) → `redirect("/parent")`. Complément de la RLS, pas un substitut.

### US-22 — Envoi d'un message à l'équipe `/parent/messages/new`

- **User Story** : En tant que parent, je veux envoyer un message court à l'équipe afin de
  signaler une allergie, une mauvaise nuit, un changement d'horaire.
- **Entité** : `messages`, `children`
- **Critères d'acceptation** :
  - Choix de l'enfant concerné.
  - Texte libre limité à **500 caractères** avec **compteur** visible.
  - Bouton d'envoi désactivé si vide ou au-delà de 500 caractères.
- **Statut** : Terminé
- **Contraintes / Dépendances** : dépend de **US-04**. Route : `/parent/messages/new`.
  Déclenche l'email de notification **US-26**.
- **Description technique** : `message-form.tsx` (`"use client"`) — choix de l'enfant
  (`SegmentedField`, ou masqué si un seul enfant), `Textarea` + compteur `len/500` qui
  passe en rouge au-delà, bouton désactivé si vide / trop long / en cours. Server Action
  `sendMessage` (`actions.ts`) : garde parent, revérifie 1–500, `INSERT messages`
  (`from_profile_id = profil`, statut `nouveau`), `redirect('/parent/messages?envoye=1')`.

### US-23 — Historique des messages envoyés (parent)

- **User Story** : En tant que parent, je veux revoir les messages que j'ai envoyés afin de
  garder une trace de mes échanges.
- **Entité** : `messages`
- **Critères d'acceptation** :
  - Liste des messages envoyés par le parent, du plus récent au plus ancien.
  - Chaque message rattaché à un enfant, avec date/heure et statut.
- **Statut** : Terminé
- **Contraintes / Dépendances** : dépend de **US-22**. Route : `/parent/messages`.
- **Description technique** : `app/parent/messages/page.tsx` — lecture `messages` filtrée
  `from_profile_id = profil`, jointe à `children.first_name`, triée `created_at desc`.
  Badge de statut orienté parent (Envoyé / Lu par l'équipe / Traité), bandeau de
  confirmation si `?envoye=1`, bouton « Écrire ». Nav parent : Mes enfants / Messages.

### US-24 — États vides parent

- **User Story** : En tant que parent, je veux des messages clairs quand il n'y a rien à
  afficher afin de comprendre quoi faire.
- **Entité** : —
- **Critères d'acceptation** :
  - Parent sans enfant rattaché → message invitant à contacter la crèche.
  - Aucun événement pour la date consultée → message bienveillant.
  - Aucun message envoyé → « Vous n'avez pas encore envoyé de message à l'équipe ».
- **Statut** : Terminé
- **Contraintes / Dépendances** : transverse aux US-19 à US-23.
- **Description technique** : les trois cas sont couverts — `/parent` (aucun enfant
  rattaché → contacter la crèche), `Timeline` (`emptyHint` par date), `/parent/messages`
  (aucun message envoyé). Même style d'état vide que la Phase 5.

---

## Phase 7 — Services externes & fonctionnalité bonus

> L'application fonctionne : on branche les emails transactionnels et on ajoute le bonus.

### US-25 — Email d'invitation parent (Resend)

- **User Story** : En tant que parent, je veux recevoir un email d'invitation quand je suis
  rattaché à un enfant afin de créer mon compte et suivre sa journée.
- **Entité** : `family_members`, `auth.users`
- **Critères d'acceptation** :
  - Déclenché après rattachement en base ; la Server Action **US-10** produit le lien.
  - Email branded envoyé via **Resend** (pas l'email Supabase générique) : objet du type
    « Vous êtes invité à suivre la journée de [prénom] sur Les Petits Pas », présentation
    courte, bouton vers le lien, mention RGPD.
- **Statut** : Terminé
- **Contraintes / Dépendances** : dépend de **US-10**. Variables : `RESEND_API_KEY`,
  `RESEND_FROM_EMAIL` (`onboarding@resend.dev`), `NEXT_PUBLIC_APP_URL`.
- **Description technique** : `lib/email/parent-invitation.ts` (`import "server-only"`) —
  objet « Vous êtes invité à suivre la journée de [prénom] sur Les Petits Pas », corps HTML
  aux couleurs de la charte (styles inline), bouton « Créer mon mot de passe » vers le lien
  Supabase, mention RGPD. Envoi via SDK `resend`. Erreur non bloquante : le 403 du mode
  test (destinataire ≠ compte Resend) est renvoyé proprement (base de l'US-27).

### US-26 — Email de notification à l'équipe (nouveau message)

- **User Story** : En tant qu'équipe, je veux être prévenu par email dès qu'un parent envoie
  un message afin de réagir vite malgré l'absence de temps réel.
- **Entité** : `messages`, `profiles`
- **Critères d'acceptation** :
  - Envoi via Resend à chaque `INSERT` dans `messages`, à tous les profils `staff`.
  - Objet « Nouveau message de [prénom parent] pour [prénom enfant] », lien vers
    `/staff/messages`.
  - Aucune donnée médicale ou sensible dans le corps de l'email.
- **Statut** : Terminé
- **Contraintes / Dépendances** : dépend de **US-22**.
- **Description technique** : `sendMessage` (`app/parent/messages/actions.ts`) appelle
  `notifyStaff()` après l'`INSERT` réussi — **non bloquant** (try/catch, le message est
  déjà enregistré). Client admin pour lister les profils `staff` puis résoudre leurs
  emails (`admin.auth.admin.getUserById`). Email via `lib/email/staff-notification.ts`.
  **Décision RGPD** : contrairement au libellé « extrait », le corps NE contient PAS le
  texte du message (aside « Point RGPD important » : l'email dit seulement qu'il y a un
  message, le contenu reste dans l'application). Objet + prénoms + bouton uniquement.

### US-27 — Gestion des statuts d'envoi Resend

- **User Story** : En tant qu'utilisateur, je veux que l'application ne casse pas si un
  email échoue afin de pouvoir continuer à l'utiliser.
- **Entité** : —
- **Critères d'acceptation** :
  - Succès et erreurs d'envoi gérés sans interrompre le parcours utilisateur.
  - Une erreur 403 (destinataire non autorisé avec l'adresse de test) est loguée, pas
    remontée comme un plantage.
- **Statut** : Terminé
- **Contraintes / Dépendances** : dépend de **US-25**, **US-26**.
- **Description technique** : appliqué dans les deux flux — invitation (`sendParentInvitation`
  renvoie `{ ok, message }`, jamais de throw) et notification (`notifyStaff` en try/catch,
  le message parent est déjà enregistré). Les helpers `lib/email/*` renvoient
  `{ ok, error }` et journalisent le détail (`console.error`). Vérifié en réel : envoi
  d'un message parent → message bien enregistré et parcours non interrompu malgré le
  refus Resend 403 (destinataire non autorisé en mode test), erreur journalisée.
- **Dev sans domaine vérifié** : `RESEND_TEST_RECIPIENT` (dans `.env.local`) redirige tous
  les emails vers l'adresse du compte Resend, avec un bandeau « en prod, irait à … ».
  Vide en production (US-35 : domaine vérifié).

### US-28 — Bonus : météo du jour + conseil d'habillement

- **User Story** : En tant que parent, je veux voir la météo du jour et un conseil
  d'habillement afin de préparer les affaires de mon enfant.
- **Entité** : `weather_advice` (ou cache météo), consommée sur la timeline parent
- **Critères d'acceptation** :
  - Bloc météo affiché sur la timeline parent (et, au choix, sur l'espace équipe).
  - Résumé météo + une phrase de conseil d'habillement.
  - État de chargement et état d'erreur (« Météo indisponible pour le moment »).
- **Statut** : Terminé
- **Contraintes / Dépendances** : fonctionnalité bonus retenue = **météo + conseil
  d'habillement**. Dépend de **US-20**.
- **Description technique** : API **Open-Meteo** (gratuite, sans clé) appelée par le route
  handler `app/api/weather/route.ts`. Logique pure `lib/weather.ts` (`weatherKind`,
  `describeWeather`, `clothingAdvice` dérivé de la température + code WMO). Composant client
  `components/weather-block.tsx` (`fetch('/api/weather')`, 3 états) affiché en tête de la
  timeline parent, uniquement pour la date du jour.

### US-29 — Bonus : stockage & documentation

- **User Story** : En tant que développeur, je veux persister la donnée du bonus et la
  documenter afin de respecter les attendus du projet.
- **Entité** : `weather_advice` (ou table de cache)
- **Critères d'acceptation** :
  - Écran, stockage en base et composant associés livrés.
  - Documentation dans `docs/featurebonus.md`.
  - Indisponibilité de l'API externe couverte par un scénario de test.
- **Statut** : Terminé
- **Contraintes / Dépendances** : dépend de **US-28**.
- **Description technique** : table `weather_cache` (`supabase/07_weather_cache.sql`),
  1 ligne par `day`, RLS lecture `authenticated`, écriture réservée à `service_role` (le
  route handler fait l'`upsert`). Doc complète dans `docs/featurebonus.md` (archi +
  3 scénarios de test, dont « API indisponible → message + 503, aucun crash »).
  `lib/weather.test.ts` écrit (exécuté quand le runner est en place, US-30).

---

## Phase 8 — Tests, recette & mise en production

### US-30 — Tests unitaires de la logique sensible

- **User Story** : En tant que développeur, je veux des tests unitaires sur la logique
  critique afin de prévenir les régressions.
- **Entité** : —
- **Critères d'acceptation** :
  - Test du blocage médicament (autorisation absente → refus).
  - Test du calcul de durée de sieste.
- **Statut** : Terminé
- **Contraintes / Dépendances** : dépend de **US-15**, **US-14**.
- **Description technique** : **Vitest** (`vitest.config.mts`, `pnpm test`). Garde médicament
  extraite en fonction pure `checkMedicationAllowed` (`lib/events.ts`) utilisée par la
  Server Action `addEvent` ET testée. **31 tests au vert** : `lib/events.test.ts`
  (médicament + `eventSummary`), `lib/utils.test.ts` (`napDurationLabel` + accents + âge),
  `lib/date.test.ts` (bornes de journée Paris CET/CEST), `lib/weather.test.ts` (conseil
  d'habillement). Tests E2E dans `tests/` (US-31/32), hors périmètre Vitest.

### US-31 — Tests E2E Playwright : parcours critiques équipe

- **User Story** : En tant que développeur, je veux automatiser les parcours critiques de
  l'équipe afin de valider l'application avant chaque mise en production.
- **Entité** : —
- **Critères d'acceptation** :
  - Connexion staff → arrivée sur `/staff` avec la liste des enfants visible.
  - Création d'un événement de type repas → apparition dans la timeline.
  - Blocage médicament : bouton d'enregistrement désactivé pour un enfant sans autorisation.
- **Statut** : Terminé
- **Contraintes / Dépendances** : dépend des Phases 4 et 5. `playwright.config.ts` :
  `baseURL = http://localhost:3000`, `webServer` lance `pnpm dev`.
- **Description technique** : `playwright.config.ts` configuré (`baseURL`, `webServer`,
  `dotenv` charge `.env.local`). `tests/helpers.ts` : `login(page, who)` via `/login`,
  comptes lus dans `E2E_STAFF_*` / `E2E_PARENT1_*` (valeurs dans `JOURNAL.md`).
  `tests/auth.spec.ts` (login staff) + `tests/staff-events.spec.ts` (création repas,
  blocage médicament). Sélecteurs par rôles/labels/textes. Reste : lancer la suite avec
  les comptes renseignés.

### US-32 — Tests E2E Playwright : isolation parent

- **User Story** : En tant que développeur, je veux prouver le cloisonnement des données
  parent afin de garantir la confidentialité.
- **Entité** : —
- **Critères d'acceptation** :
  - Connexion parent 1 → seuls ses enfants sont visibles.
  - Parent 1 tente d'accéder à la fiche d'un enfant qui n'est pas le sien → erreur ou
    redirection vers `/parent`.
  - Envoi d'un message par parent 1 → réception côté équipe dans `/staff/messages`.
- **Statut** : Terminé
- **Contraintes / Dépendances** : dépend de **US-04**, **US-21**, **US-22**.
- **Description technique** : `tests/auth.spec.ts` (parent1 ne voit que Ana Maria + Sarah),
  `tests/parent-isolation.spec.ts` (URL forgée vers Ilyès → redirection `/parent`, id
  récupéré via une session staff), `tests/parent-messages.spec.ts` (parent1 envoie →
  staff retrouve dans `/staff/messages` via un marqueur unique). Reste : lancer la suite.

### US-33 — Intégration continue Playwright

- **User Story** : En tant que développeur, je veux rejouer les tests à chaque push afin de
  ne jamais fusionner du code cassé.
- **Entité** : Infrastructure
- **Critères d'acceptation** :
  - Workflow `.github/workflows/playwright.yml` créé par `pnpm create playwright`.
  - Les tests tournent sur push et sur PR.
- **Statut** : Terminé
- **Contraintes / Dépendances** : dépend de **US-31**, **US-32**. Node ≥ 22.13 (pnpm 11).
  7 secrets GitHub créés (Repository secrets) : `NEXT_PUBLIC_SUPABASE_URL`,
  `NEXT_PUBLIC_SUPABASE_ANON_KEY`, `SUPABASE_SERVICE_ROLE_KEY`, `E2E_STAFF_EMAIL`,
  `E2E_STAFF_PASSWORD`, `E2E_PARENT1_EMAIL`, `E2E_PARENT1_PASSWORD`.
- **Description technique** : workflow `CI` — 2 jobs. `checks` (aucun secret) : `pnpm lint` +
  `pnpm test` (Vitest) + `pnpm build`. `e2e` : step de garde qui échoue tôt si un secret
  manque, `playwright install chromium`, `pnpm build`, serveur de **prod** (`pnpm start`)
  lancé par le webServer Playwright, `playwright test --project=chromium`. Rapport en
  artefact. Déclencheurs : push sur `staging`/`main`, PR vers `main`. Les deux jobs verts
  sur `staging` le 2026-09-02.

### US-34 — Recette & cas limites

- **User Story** : En tant que chef de projet, je veux une recette documentée afin de valider
  l'application avant la soutenance.
- **Entité** : —
- **Critères d'acceptation** :
  - Scénarios de recette dans `docs/recette/`.
  - Cas d'erreur couverts : identifiants invalides, accès à une ressource non autorisée,
    aucune donnée pour le jour consulté, API du bonus indisponible.
- **Statut** : Terminé
- **Contraintes / Dépendances** : dépend de toutes les phases précédentes.
- **Description technique** : [`docs/recette/cahierrecette.md`](docs/recette/cahierrecette.md)
  rédigé (SC01–SC26 : ID, objectif, prérequis, étapes, résultat attendu/obtenu,
  commentaire). Tableau de synthèse Go/NoGo en tête. Règle de mise à jour dans `AGENTS.md`.
  **26/26 scénarios `OK`, 4/4 NoGo `OK`** (SC11/SC17/SC26 joués le 2026-09-02).
  Cas d'erreur couverts : SC03 (identifiants), SC17/SC18 (accès non autorisé), SC21
  (aucune donnée), SC26 (API bonus indisponible). Captures SC17/SC26 dans `docs/recette/`.
  Le cahier reste vivant (mis à jour à chaque changement de comportement).
  **Tableau de bugs** : [`docs/recette/bugs.md`](docs/recette/bugs.md) — BUG001–BUG003
  (rencontrés en dev, corrigés avant validation des US), aucun bug en recette formelle.
  Règle de tenue ajoutée dans `AGENTS.md`.

### US-35 — Base de production & variables d'environnement

- **User Story** : En tant que développeur, je veux une base de production propre afin de
  déployer sans données de test.
- **Entité** : Infrastructure (`lespetitspas-prod`)
- **Critères d'acceptation** :
  - `lespetitspas-prod` ne reçoit que les scripts de structure (tables, trigger, policies RLS),
    jamais les données de test.
  - Variables réparties dans Vercel entre Production (`lespetitspas-prod`) et Preview
    (`lespetitspas`).
- **Statut** : À faire
- **Contraintes / Dépendances** : dépend de **US-02**, **US-03**, **US-04**.
- **Description technique** : `NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`,
  `NEXT_PUBLIC_APP_URL`, `SUPABASE_SERVICE_ROLE_KEY` (serveur), `RESEND_API_KEY`,
  `RESEND_FROM_EMAIL`.

### US-36 — Mise en production via Pull Request

- **User Story** : En tant que développeur, je veux passer en production par une PR
  `staging → main` afin de contrôler chaque livraison.
- **Entité** : Infrastructure
- **Critères d'acceptation** :
  - Aucun push direct sur `main`.
  - Le passage en production se fait par une Pull Request depuis `staging`, déployée par
    Vercel en Production.
  - L'URL de production est notée dans `JOURNAL.md` (non commité).
- **Statut** : À faire
- **Contraintes / Dépendances** : dépend de **US-34**.
- **Description technique** : branche `staging` → Preview, `main` → Production.
