# Les Petits Pas — Prototype d'interface (Phase 2)

Prototype **navigable** de l'application Les Petits Pas, réalisé à la place de Figma Make.
Sert de référence visuelle avant le développement (Phase 4+) et en soutenance.

- **Stack** : React 19 + TypeScript + Vite + Tailwind CSS v4
- **Données** : 100 % **fictives**, en mémoire. Aucune connexion à Supabase / Resend.
  Tout se réinitialise au rechargement de la page.
- **Charte** : « Nuage » (lavande / menthe sauge / rose blush, Plus Jakarta Sans + DM Sans)
- **Isolé du reste du repo** : ce dossier a son propre `package.json` et n'est pas
  dans le workspace pnpm. Il n'affecte pas l'app Next.js à la racine.

## Lancer en local

```bash
cd prototype
pnpm install --ignore-workspace
pnpm dev
```

Puis ouvrir l'URL affichée (http://localhost:5173).

Autres commandes :

```bash
pnpm test            # tests unitaires (blocage médicament, durée de sieste, isolation des rôles)
pnpm run build       # build de production (base "/")
pnpm run preview     # prévisualiser le build
```

## Comptes de démonstration

L'écran de connexion propose 3 connexions en un clic :

| Compte | Rôle | Accès |
|---|---|---|
| Camille | équipe | Tous les enfants, saisie d'événements, messagerie |
| Léa Martin | parent | Gabriel + Rose |
| Thomas Dubois | parent | Noah |

Connexion par formulaire aussi possible : utiliser une adresse email d'un profil
(ex. `prenom.nom+staff@gmail.com`) avec n'importe quel mot de passe d'au moins 4 caractères.

## Écrans couverts

- `/login` — connexion + comptes démo, redirection par rôle
- **Équipe** : liste des enfants (recherche + filtre section), fiche enfant
  (résumé, messages non traités, timeline + sélecteur de date, formulaire d'événement),
  messagerie (statuts nouveau / lu / traité)
- **Parent** : liste de ses enfants, journée de l'enfant (lecture seule, auteur affiché),
  envoi de message (500 caractères + compteur) + historique
- **Bonus** : carte météo + conseil d'habillement (simulée)
- États vides et états d'erreur pour chaque liste

## Points de conformité aux spécifications

- **Blocage médicament** : bouton « Enregistrer » désactivé tant que la case
  « Autorisation parentale confirmée » n'est pas cochée + garde-fou « serveur » simulé
  (le reducer refuse la saisie si l'enfant n'a pas l'autorisation → message type 403).
- **Isolation des rôles** : un parent ne voit que ses enfants ; l'accès direct à
  `/parent/children/:id` pour un enfant non rattaché redirige vers `/parent`.
- **Timeline** : tri du plus récent en haut, filtre « Aujourd'hui » par défaut,
  sélecteur de date, pas de temps réel (bandeau « dernière synchronisation »).
- **Messagerie** : asynchrone, liste côté staff triée récent → ancien (pas un fil),
  message parent rattaché à un enfant, limité à 500 caractères.

## Déploiement (lien public pour la soutenance)

### Option A — GitHub Pages (workflow fourni)

1. Sur GitHub : **Settings → Pages → Source = « GitHub Actions »**.
2. Pousser sur `main` ou `staging` (le workflow `.github/workflows/prototype-pages.yml`
   se déclenche sur toute modification de `prototype/**`).
3. URL finale : `https://<utilisateur>.github.io/LesPetitsPas/`

Le build de déploiement utilise `pnpm run build:pages` (base `/LesPetitsPas/`).

### Option B — Netlify

Connecter le repo avec **Base directory = `prototype`**, ou glisser-déposer le dossier
`prototype/dist` après `pnpm run build`. Le fichier `netlify.toml` est déjà configuré.
