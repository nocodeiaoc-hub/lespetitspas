# Cahier de recette — Les Petits Pas

> Document rédigé **avant** l'exécution des tests. Il fait foi pour la décision
> **Go / NoGo** de mise en production. Tenu à jour en continu par l'IA
> (règle dans [`AGENTS.md`](../../AGENTS.md), section « Cahier de recette »).

## Légende — Résultat obtenu

| Valeur | Signification |
|---|---|
| `OK` | Le résultat attendu est constaté. |
| `KO` | Le résultat attendu n'est pas constaté (bug non bloquant). |
| `Bloquant` | Échec sur un critère NoGo (sécurité, isolation, règle médicament). |
| `Non joué` | Scénario pas encore exécuté formellement. |

Les captures d'écran des scénarios `KO` / `Bloquant` sont déposées dans
`docs/recette/` et référencées dans la colonne **Commentaire**.

## Environnement de test

- **URL locale** : `http://localhost:3000` (`pnpm dev`)
- **Base** : Supabase `lespetitspas` (scripts `01` → `07` appliqués)
- **Comptes** (alias `+` d'une même adresse Gmail) :
  - `…+staff@…` — rôle `staff`
  - `…+parent1@…` — rôle `parent`, rattaché à **Ana Maria** et **Sarah**
  - `…+parent2@…` — rôle `parent`, rattaché à **Ilyès**
- **Enfants de test** : Ana Maria, Sarah, Ilyès (répartis sur les 3 sections ;
  `medication_allowed` à `true` pour certains, `false` pour d'autres).
- **Emails** : mode test Resend (`onboarding@resend.dev`) + `RESEND_TEST_RECIPIENT`
  pointant sur l'adresse du compte Resend.

---

## Tableau de synthèse

| ID | Objectif | Criticité | Résultat |
|---|---|---|---|
| SC01 | Connexion staff + redirection `/staff` | Majeur | OK |
| SC02 | Connexion parent + redirection `/parent` | Majeur | OK |
| SC03 | Identifiants invalides → message d'erreur | Majeur | OK |
| SC04 | Déconnexion + persistance de session | Majeur | OK |
| SC05 | Liste des enfants : recherche + filtre section | Majeur | OK |
| SC06 | Fiche enfant : informations clés | Majeur | OK |
| SC07 | Timeline staff + sélecteur de date | Majeur | OK |
| SC08 | Saisie d'un repas → apparaît dans la timeline | Majeur | OK |
| SC09 | Saisie d'une sieste | Majeur | OK |
| **SC10** | **Blocage médicament — enfant sans autorisation** | **NoGo** | OK |
| SC11 | Saisie médicament — enfant autorisé | Majeur | OK |
| SC12 | Messagerie équipe : liste + statuts nouveau/lu/traité | Majeur | OK |
| SC13 | États vides & erreur (espace équipe) | Mineur | OK |
| SC14 | Indicateur d'activité du jour sur la carte enfant | Mineur | OK |
| **SC15** | **Accueil parent — voit uniquement ses enfants** | **NoGo** | OK |
| SC16 | Timeline parent : lecture seule + prénom du staff | Majeur | OK |
| **SC17** | **Garde serveur parent → enfant (URL forgée)** | **NoGo** | OK |
| **SC18** | **Envoi message parent vers un enfant non rattaché** | **NoGo** | OK |
| SC19 | Envoi d'un message parent (compteur 500) | Majeur | OK |
| SC20 | Historique des messages envoyés (parent) | Majeur | OK |
| SC21 | États vides parent | Mineur | OK |
| SC22 | Email d'invitation parent (Resend) | Majeur | OK |
| SC23 | Email de notification équipe + RGPD (pas de contenu) | Majeur | OK |
| SC24 | Échec d'envoi email non bloquant | Majeur | OK |
| SC25 | Bloc météo + conseil d'habillement (parent) | Bonus | OK |
| SC26 | Météo indisponible → message clair | Bonus | OK |

**Critère NoGo** : tout scénario `NoGo` en `KO` / `Bloquant` interdit la mise en
production. À ce jour : **les 4 scénarios NoGo (SC10, SC15, SC17, SC18) sont `OK`** →
feu vert sécurité.

**Bilan : 26 / 26 scénarios `OK`.**

### Couverture automatisée (Playwright — US-31 / US-32)

Six parcours critiques sont rejoués automatiquement à chaque exécution de
`pnpm exec playwright test` :

| Test | Scénarios couverts |
|---|---|
| `tests/auth.spec.ts` | SC01 (login staff), SC15 (parent1 ne voit que ses enfants) |
| `tests/staff-events.spec.ts` | SC08 (création repas → timeline), SC10 (blocage médicament) |
| `tests/parent-isolation.spec.ts` | SC17 (URL forgée → redirection `/parent`) |
| `tests/parent-messages.spec.ts` | SC19 + SC12 (message parent → visible côté équipe) |

Suite exécutée le 2026-09-02 : **tous les tests au vert**, en local **et en CI**
(GitHub Actions, à chaque push sur `staging`/`main` et PR vers `main` — US-33).

---

## Scénarios détaillés

### SC01 — Connexion staff + redirection `/staff`

- **Objectif** : un membre de l'équipe se connecte et arrive sur son espace.
- **Prérequis** : déconnecté ; compte `…+staff@…` existant.
- **Étapes** :
  1. Ouvrir `/login`.
  2. Saisir l'email et le mot de passe du compte staff.
  3. Valider « Se connecter ».
- **Résultat attendu** : redirection vers `/staff`, la liste des enfants s'affiche.
- **Résultat obtenu** : `OK`
- **Commentaire** : validé pendant la Phase 5.

### SC02 — Connexion parent + redirection `/parent`

- **Objectif** : un parent se connecte et arrive sur son espace.
- **Prérequis** : déconnecté ; compte `…+parent1@…` existant.
- **Étapes** :
  1. Ouvrir `/login`.
  2. Saisir l'email et le mot de passe du compte parent1.
  3. Valider « Se connecter ».
- **Résultat attendu** : redirection vers `/parent`, la liste de ses enfants s'affiche.
- **Résultat obtenu** : `OK`
- **Commentaire** : validé Phase 5 / Phase 6.

### SC03 — Identifiants invalides → message d'erreur

- **Objectif** : un échec de connexion affiche un message clair, sans fuite d'info.
- **Prérequis** : déconnecté.
- **Étapes** :
  1. Ouvrir `/login`.
  2. Saisir un email valide et un mauvais mot de passe.
  3. Valider « Se connecter ».
- **Résultat attendu** : message **« Email ou mot de passe incorrect. »**, champs en
  état invalide, aucune redirection.
- **Résultat obtenu** : `OK`
- **Commentaire** : validé Phase 5.

### SC04 — Déconnexion + persistance de session

- **Objectif** : la session survit à un rechargement ; la déconnexion est accessible partout.
- **Prérequis** : connecté (staff ou parent).
- **Étapes** :
  1. Recharger la page (F5) depuis une page authentifiée → rester connecté.
  2. Cliquer « Se déconnecter » depuis l'en-tête.
  3. Tenter d'accéder à `/staff` (ou `/parent`) via l'URL.
- **Résultat attendu** : (1) toujours connecté ; (2) retour à `/login` ; (3) redirection
  vers `/login`.
- **Résultat obtenu** : `OK`
- **Commentaire** : validé Phase 5 (proxy de rafraîchissement de session).

### SC05 — Liste des enfants : recherche + filtre section

- **Objectif** : retrouver un enfant rapidement parmi la liste.
- **Prérequis** : connecté staff ; au moins 3 enfants.
- **Étapes** :
  1. Aller sur `/staff`.
  2. Taper « Ana » dans le champ de recherche.
  3. Vider la recherche, cliquer le filtre « Bébés » (ou une autre section).
- **Résultat attendu** : (2) seule **Ana Maria** reste visible ; (3) seuls les enfants
  de la section choisie s'affichent ; chaque carte est cliquable.
- **Résultat obtenu** : `OK`
- **Commentaire** : validé Phase 5 (recherche tolérante aux accents).

### SC06 — Fiche enfant : informations clés

- **Objectif** : voir en un coup d'œil les infos d'un enfant.
- **Prérequis** : connecté staff.
- **Étapes** :
  1. Depuis `/staff`, cliquer sur **Ana Maria**.
- **Résultat attendu** : URL `/staff/children/[id]` ; encart résumé avec prénom/nom,
  section, âge, **allergies**, **badge d'autorisation médicament**, **parents rattachés**.
- **Résultat obtenu** : `OK`
- **Commentaire** : validé Phase 5 (US-12).

### SC07 — Timeline staff + sélecteur de date

- **Objectif** : consulter les événements d'une journée, naviguer entre les jours.
- **Prérequis** : connecté staff ; fiche d'un enfant ouverte.
- **Étapes** :
  1. Observer la timeline (filtre « Aujourd'hui » par défaut).
  2. Reculer d'un jour avec la flèche ‹, puis choisir une date avec le sélecteur.
- **Résultat attendu** : événements triés du plus récent au plus ancien, un badge
  coloré par type, note de « dernière synchro » ; la date change bien le contenu ;
  pas de futur sélectionnable.
- **Résultat obtenu** : `OK`
- **Commentaire** : validé Phase 5 (US-13).

### SC08 — Saisie d'un repas → apparaît dans la timeline

- **Objectif** : enregistrer un événement en quelques interactions.
- **Prérequis** : connecté staff ; fiche d'**Ana Maria** ouverte.
- **Étapes** :
  1. Cliquer « Ajouter un événement ».
  2. Choisir le type **Repas**.
  3. Renseigner le moment (midi) et la quantité (tout), ajouter une note.
  4. Enregistrer.
- **Résultat attendu** : retour sur la fiche, l'événement **Repas** apparaît en haut
  de la timeline avec l'heure et l'auteur (staff connecté).
- **Résultat obtenu** : `OK`
- **Commentaire** : validé Phase 5 (US-14).

### SC09 — Saisie d'une sieste

- **Objectif** : enregistrer une sieste avec heures de début/fin.
- **Prérequis** : connecté staff ; fiche d'un enfant ouverte.
- **Étapes** :
  1. « Ajouter un événement » → type **Sieste**.
  2. Renseigner heure de début, heure de fin, qualité (calme).
  3. Enregistrer.
- **Résultat attendu** : l'événement **Sieste** apparaît dans la timeline avec la
  plage horaire et la durée calculée.
- **Résultat obtenu** : `OK`
- **Commentaire** : validé Phase 5.

### SC10 — Blocage médicament, enfant sans autorisation *(NoGo)*

- **Objectif** : impossible d'enregistrer un médicament sans autorisation parentale,
  côté client **et** côté serveur.
- **Prérequis** : connecté staff ; fiche d'un enfant dont `medication_allowed = false`.
- **Étapes** :
  1. « Ajouter un événement » → type **Médicament**.
  2. Observer l'écran.
  3. (Avancé) forger une requête `addEvent` de type `medicament` pour cet enfant.
- **Résultat attendu** :
  - **Client** : bandeau rouge explicite, **bouton « Enregistrer » désactivé**, aucun
    champ de saisie.
  - **Serveur** : la Server Action `addEvent` relit `children.medication_allowed`,
    **refuse sans aucun INSERT**, renvoie un message clair. La contrainte CHECK Postgres
    l'interdit également.
- **Résultat obtenu** : `OK`
- **Commentaire** : validé Phase 5 (US-15). Garde sur 2 niveaux + contrainte base.

### SC11 — Saisie médicament, enfant autorisé

- **Objectif** : le flux médicament complet fonctionne quand l'autorisation existe.
- **Prérequis** : connecté staff ; fiche d'un enfant dont `medication_allowed = true`.
- **Étapes** :
  1. « Ajouter un événement » → type **Médicament**.
  2. Renseigner nom, dose, heure.
  3. Cocher « Autorisation parentale confirmée ».
  4. Enregistrer.
- **Résultat attendu** : bouton actif seulement après la case cochée ; l'événement
  **Médicament** apparaît dans la timeline.
- **Résultat obtenu** : `OK`
- **Commentaire** : joué sur **Ana Maria** (`medication_allowed = true`) le 2026-09-02.
  Bouton désactivé tant que la case n'est pas cochée, puis événement Médicament visible
  en tête de timeline.

### SC12 — Messagerie équipe : liste + statuts

- **Objectif** : voir tous les messages parents et suivre leur traitement.
- **Prérequis** : connecté staff ; au moins 2 messages en base (statut `nouveau`).
- **Étapes** :
  1. Aller sur `/staff/messages`.
  2. Cliquer un message « nouveau ».
  3. Cliquer « Marquer comme traité » sur un message.
  4. Utiliser le filtre par statut.
- **Résultat attendu** : liste triée récent → ancien ; prénom parent + prénom enfant +
  heure + contenu ; badge « Nouveau » ; (2) passe en « Lu » ; (3) passe en « Traité » ;
  le filtre restreint bien la liste.
- **Résultat obtenu** : `OK`
- **Commentaire** : validé Phase 5 (US-16 / US-17).

### SC13 — États vides & erreur (espace équipe)

- **Objectif** : jamais d'écran blanc.
- **Prérequis** : connecté staff.
- **Étapes** :
  1. Ouvrir la fiche d'un enfant sans événement pour la date consultée.
  2. Ouvrir `/staff/messages` sans message.
  3. Simuler une panne réseau et recharger `/staff`.
- **Résultat attendu** : (1) message bienveillant + « Ajouter un événement » ;
  (2) message d'onboarding ; (3) écran d'erreur + bouton **« Réessayer »**.
- **Résultat obtenu** : `OK`
- **Commentaire** : validé Phase 5 (US-18) — `loading.tsx` / `error.tsx` / `not-found.tsx`.

### SC14 — Indicateur d'activité du jour

- **Objectif** : repérer d'un coup d'œil les enfants sans événement aujourd'hui.
- **Prérequis** : connecté staff ; au moins un enfant avec événement, un sans.
- **Étapes** :
  1. Aller sur `/staff`.
- **Résultat attendu** : chaque carte affiche « N événement(s) aujourd'hui » (vert) ou
  « Aucun événement aujourd'hui ».
- **Résultat obtenu** : `OK`
- **Commentaire** : validé Phase 5 (US-39).

### SC15 — Accueil parent, voit uniquement ses enfants *(NoGo)*

- **Objectif** : un parent ne voit que ses propres enfants (isolation RLS).
- **Prérequis** : comptes parent1 (Ana Maria + Sarah) et parent2 (Ilyès).
- **Étapes** :
  1. Se connecter en **parent1** → observer `/parent`.
  2. Se déconnecter, se connecter en **parent2** → observer `/parent`.
- **Résultat attendu** : parent1 voit **uniquement Ana Maria et Sarah** ; parent2 voit
  **uniquement Ilyès**. Aucun enfant d'une autre famille.
- **Résultat obtenu** : `OK`
- **Commentaire** : validé Phase 6 (US-19). Filtrage assuré par la RLS, aucun `where`
  applicatif.

### SC16 — Timeline parent : lecture seule + prénom du staff

- **Objectif** : le parent consulte la journée de son enfant, sans pouvoir la modifier.
- **Prérequis** : connecté parent1 ; événements créés par le staff pour Ana Maria.
- **Étapes** :
  1. Depuis `/parent`, cliquer sur **Ana Maria**.
  2. Observer la timeline du jour.
  3. Changer la date pour hier.
- **Résultat attendu** : événements du jour, icône + couleur par type, champs utiles par
  type, **prénom du membre d'équipe** qui a saisi ; **aucun bouton d'ajout** ; hier =
  timeline vide.
- **Résultat obtenu** : `OK`
- **Commentaire** : validé Phase 6 (US-20). Nécessite `06_profiles_staff_readable.sql`.

### SC17 — Garde serveur parent → enfant (URL forgée) *(NoGo)*

- **Objectif** : un parent ne peut pas consulter la fiche d'un enfant qui n'est pas le
  sien, même en tapant l'URL.
- **Prérequis** : connecté **parent1** ; connaître l'`id` d'**Ilyès** (enfant de parent2).
- **Étapes** :
  1. Aller sur `/parent/children/<id-d-Ilyès>` en modifiant l'URL.
- **Résultat attendu** : **redirection immédiate vers `/parent`**, aucune donnée d'Ilyès
  affichée. Les événements d'Ilyès ne sont jamais chargés.
- **Résultat obtenu** : `OK`
- **Commentaire** : joué le 2026-09-02 — connecté en parent1, saisie de l'URL
  `/parent/children/<id-Ilyès>` (et avec `?date=…`) → **redirection immédiate vers
  `/parent`**, aucune donnée d'Ilyès affichée. Capture : `docs/recette/SC17.png`.

### SC18 — Envoi message parent vers un enfant non rattaché *(NoGo)*

- **Objectif** : l'API refuse d'enregistrer un message pour un enfant d'une autre famille.
- **Prérequis** : connecté **parent1**.
- **Étapes** :
  1. (Avancé) forger un appel `sendMessage` avec le `child_id` d'**Ilyès**.
- **Résultat attendu** : refus avec message **« Cet enfant n'est pas rattaché à votre
  compte. »**, aucune ligne insérée. La policy RLS `messages_insert_parent` le refuse
  également.
- **Résultat obtenu** : `OK`
- **Commentaire** : validé Phase 6 (garde serveur explicite + RLS).

### SC19 — Envoi d'un message parent (compteur 500)

- **Objectif** : un parent envoie un message court à l'équipe.
- **Prérequis** : connecté parent1.
- **Étapes** :
  1. `/parent` → « Envoyer un message à l'équipe ».
  2. Choisir l'enfant, taper un message ; observer le compteur.
  3. Tenter d'envoyer un message vide, puis un message > 500 caractères.
  4. Envoyer un message valide.
- **Résultat attendu** : compteur `N/500` visible, **rouge au-delà de 500** ; bouton
  **désactivé** si vide ou trop long ; à l'envoi, redirection vers l'historique avec
  confirmation.
- **Résultat obtenu** : `OK`
- **Commentaire** : validé Phase 6 (US-22).

### SC20 — Historique des messages envoyés (parent)

- **Objectif** : le parent retrouve ses échanges avec l'équipe.
- **Prérequis** : connecté parent1 ; au moins un message envoyé.
- **Étapes** :
  1. Aller sur `/parent/messages`.
- **Résultat attendu** : liste des messages **envoyés par ce parent**, du plus récent au
  plus ancien ; enfant concerné + date/heure + statut (Envoyé / Lu par l'équipe / Traité).
- **Résultat obtenu** : `OK`
- **Commentaire** : validé Phase 6 (US-23). Le statut suit celui géré côté staff.

### SC21 — États vides parent

- **Objectif** : messages clairs quand il n'y a rien à afficher.
- **Prérequis** : divers.
- **Étapes** :
  1. Parent sans enfant rattaché → `/parent`.
  2. Timeline d'un enfant pour une date sans événement.
  3. `/parent/messages` sans message envoyé.
- **Résultat attendu** : (1) invitation à contacter la crèche ; (2) message bienveillant ;
  (3) « Vous n'avez pas encore envoyé de message à l'équipe ».
- **Résultat obtenu** : `OK`
- **Commentaire** : validé Phase 6 (US-24).

### SC22 — Email d'invitation parent (Resend)

- **Objectif** : un parent rattaché reçoit un email avec un lien de création de compte.
- **Prérequis** : connecté staff ; `SUPABASE_SERVICE_ROLE_KEY` + `RESEND_API_KEY` +
  `RESEND_TEST_RECIPIENT` renseignés ; `pnpm dev` redémarré.
- **Étapes** :
  1. Fiche d'un enfant → « Envoyer l'invitation » à côté d'un parent.
- **Résultat attendu** : message « Invitation envoyée à … » ; email reçu avec l'objet
  **« Vous êtes invité à suivre la journée de [prénom] sur Les Petits Pas »**, une courte
  présentation, un bouton **« Créer mon mot de passe »**, la mention RGPD ; le bouton
  mène à un lien Supabase valide.
- **Résultat obtenu** : `OK`
- **Commentaire** : validé Phase 7 (US-10 / US-25) via `RESEND_TEST_RECIPIENT`.

### SC23 — Email de notification équipe + RGPD

- **Objectif** : l'équipe est prévenue par email d'un nouveau message, **sans contenu
  sensible**.
- **Prérequis** : `RESEND_*` + `SUPABASE_SERVICE_ROLE_KEY` renseignés ; compte staff avec
  email connu.
- **Étapes** :
  1. Se connecter en parent1, envoyer un message pour Ana Maria (avec un texte type
     « réaction allergique »).
  2. Consulter la boîte email du staff (ou l'onglet Emails de Resend).
- **Résultat attendu** : email d'objet **« Nouveau message de [parent] pour Ana Maria »**,
  bouton vers `/staff/messages`. **Le corps ne contient NI le texte du message NI aucune
  donnée de santé.**
- **Résultat obtenu** : `OK`
- **Commentaire** : validé Phase 7 (US-26). Décision RGPD documentée dans le backlog.

### SC24 — Échec d'envoi email non bloquant

- **Objectif** : un email qui échoue ne casse pas le parcours utilisateur.
- **Prérequis** : `RESEND_TEST_RECIPIENT` **vide** (ou destinataire non autorisé en
  mode test).
- **Étapes** :
  1. Se connecter en parent1, envoyer un message.
- **Résultat attendu** : le message est **enregistré** et visible dans `/staff/messages` ;
  le parent est redirigé normalement ; l'échec d'email est **journalisé** côté serveur
  (`staff notification skipped: …`), aucun plantage.
- **Résultat obtenu** : `OK`
- **Commentaire** : validé Phase 7 (US-27) — observé dans les logs `pnpm dev`.

### SC25 — Bloc météo + conseil d'habillement (parent)

- **Objectif** : le parent voit la météo du jour et un conseil d'habillement.
- **Prérequis** : connecté parent ; `07_weather_cache.sql` appliqué ; timeline d'un
  enfant ouverte (date du jour).
- **Étapes** :
  1. Observer le haut de la timeline.
  2. Recharger la page.
- **Résultat attendu** : bloc avec icône, température, résumé météo et **une phrase de
  conseil** cohérente ; au rechargement, réponse instantanée (cache).
- **Résultat obtenu** : `OK`
- **Commentaire** : validé Phase 7 (US-28 / US-29).

### SC26 — Météo indisponible → message clair

- **Objectif** : l'indisponibilité de l'API externe est gérée proprement.
- **Prérequis** : connecté parent ; date du jour **non encore en cache**.
- **Étapes** :
  1. Couper le réseau (ou bloquer `api.open-meteo.com`).
  2. Ouvrir la timeline parent.
- **Résultat attendu** : le bloc affiche **« Météo indisponible pour le moment. »** ;
  la timeline et le reste de la page fonctionnent ; la route renvoie `503`, l'erreur est
  journalisée.
- **Résultat obtenu** : `OK`
- **Commentaire** : joué le 2026-09-02 — cache du jour vidé + `WEATHER_FORCE_ERROR=1`.
  Le bloc affiche « Météo indisponible pour le moment. », la timeline fonctionne,
  `/api/weather` renvoie `503`. Interrupteur remis à vide ensuite. Capture :
  `docs/recette/SC26.png`.

---

## Historique des révisions

| Date | Révision |
|---|---|
| 2026-09-02 | Création du cahier (SC01–SC26), rédigé avant l'exécution formelle. Statuts « OK » repris des validations effectuées pendant le développement des Phases 5–7. |
| 2026-09-02 | SC11, SC17, SC26 joués et passés `OK` (captures SC17 / SC26 dans `docs/recette/`). **26 / 26 scénarios `OK`, 4 / 4 NoGo `OK`.** |
| 2026-09-02 | Automatisation Playwright (US-31 / US-32) : 6 parcours critiques rejoués, suite au vert. Voir « Couverture automatisée ». |
