# PV de recette — Les Petits Pas

> Procès-verbal de recette : décision formelle de mise en production.
> Synthèse de [`cahierrecette.md`](cahierrecette.md) et [`bugs.md`](bugs.md),
> tenue à jour par l'IA (règle dans [`AGENTS.md`](../../AGENTS.md)).
> **La ligne « Décision » et sa « Justification » sont à remplir et à signer par
> le chef de projet — l'IA ne tranche pas.**

---

## Version

| | |
|---|---|
| **Date** | 2026-09-02 |
| **Version / commit** | branche `staging` (dernier commit du jour) |
| **Environnement testé** | app en local (`http://localhost:3000`) + CI GitHub Actions ; base Supabase `lespetitspas` (dev/staging), scripts `01`→`07` appliqués ; emails Resend en mode test (`onboarding@resend.dev` + `RESEND_TEST_RECIPIENT`) |
| **Testeur** | _[nom / rôle]_ |
| **Base de production** | `lespetitspas-prod` **non encore créée** (US-35) |

---

## Fonctionnalités couvertes

26 scénarios de recette joués — **26 `OK` / 0 `KO` / 0 `Bloquant`**.
Détail par domaine :

| Domaine | Scénarios | Statut |
|---|---|---|
| **Authentification & session** | SC01 connexion staff · SC02 connexion parent · SC03 identifiants invalides · SC04 déconnexion + persistance | ✅ OK |
| **Espace équipe — enfants** | SC05 liste + recherche + filtre · SC06 fiche enfant · SC14 indicateur d'activité du jour | ✅ OK |
| **Espace équipe — timeline & saisie** | SC07 timeline + sélecteur de date · SC08 repas · SC09 sieste · SC11 médicament (enfant autorisé) | ✅ OK |
| **Règle de sécurité médicament** *(NoGo)* | SC10 blocage client + serveur pour un enfant sans autorisation | ✅ OK |
| **Messagerie équipe** | SC12 liste + statuts nouveau/lu/traité | ✅ OK |
| **Espace parent — consultation** | SC02 accueil · SC16 timeline lecture seule + prénom du staff | ✅ OK |
| **Isolation des données parent** *(NoGo)* | SC15 ne voit que ses enfants · SC17 URL forgée → redirection `/parent` · SC18 message vers un enfant non rattaché refusé | ✅ OK |
| **Messagerie parent** | SC19 envoi + compteur 500 · SC20 historique | ✅ OK |
| **États vides & erreurs** | SC13 espace équipe · SC21 espace parent (jamais d'écran blanc, bouton « Réessayer ») | ✅ OK |
| **Emails transactionnels (Resend)** | SC22 invitation parent · SC23 notification équipe (objet + lien, RGPD : aucun contenu sensible) · SC24 échec d'envoi non bloquant | ✅ OK |
| **Fonctionnalité bonus — météo** | SC25 bloc météo + conseil d'habillement · SC26 API indisponible → message clair | ✅ OK |

### Couverture automatisée
- **Tests unitaires** (Vitest) : 31 tests au vert — blocage médicament, durée de sieste,
  bornes de journée (fuseau Paris), conseil d'habillement, résumés d'événements.
- **Tests E2E** (Playwright) : 6 parcours critiques rejoués à chaque push et PR via
  **GitHub Actions** — login staff, création d'événement, blocage médicament, isolation
  parent (URL forgée), envoi de message parent → équipe. Verts en local et en CI.

---

## Bugs résiduels

**Aucun bug résiduel non corrigé.**

3 bugs ont été rencontrés **pendant le développement** (Phases 5–7) et **tous corrigés
avant la validation de la User Story concernée** — aucun n'a atteint `staging` sous forme
de régression (détail dans [`bugs.md`](bugs.md)) :

| ID | Description | Sévérité | Statut |
|---|---|---|---|
| BUG001 | Erreur runtime `normalize is not a function` sur `/staff` (cache Turbopack) | Majeur | Corrigé (`2c91def`) |
| BUG002 | Prénom du staff absent sur la timeline parent (policy RLS manquante) | Majeur | Corrigé (`f2ee6ad` + `06_profiles_staff_readable.sql`) |
| BUG003 | Emails de test non délivrés aux alias `+` (limitation Resend mode test) | Mineur | Contourné (`1f876d9`, `RESEND_TEST_RECIPIENT`) ; résolution définitive = domaine vérifié (US-35) |

La recette formelle (SC01–SC26) n'a révélé **aucun bug**.

---

## Risques connus (production)

| # | Risque | Impact | Atténuation prévue |
|---|---|---|---|
| R1 | **Base de production `lespetitspas-prod` pas encore créée / testée** | La recette a été faite sur `lespetitspas` (staging). Un écart de config (scripts SQL non rejoués, RLS absente) casserait la sécurité en prod. | US-35 : appliquer `01`→`07` sur `lespetitspas-prod`, rejouer `05_rls_test.sql`, **ne jamais** exécuter le seed `04`. |
| R2 | **Emails Resend en mode test** (`onboarding@resend.dev`) | Sans domaine vérifié, les emails d'invitation et de notification **ne partent qu'à l'adresse du compte Resend**, pas aux vrais parents/staff. | US-35 : vérifier un domaine sur Resend, changer `RESEND_FROM_EMAIL`, **vider `RESEND_TEST_RECIPIENT`** en prod. |
| R3 | **Dépôt GitHub public** | Le schéma SQL et la structure des données de test sont visibles. **Audit du 2026-09-02 : aucun secret exposé** — `.env*`, `JOURNAL.md`, clés API et `service_role` n'ont jamais été committés (`.gitignore` en place). | Aucune donnée réelle en base tant que la prod n'est pas ouverte ; ne jamais committer `.env*` ni `JOURNAL.md` ; envisager le passage en dépôt privé après la soutenance. |
| R4 | **Tests E2E contre la base staging** | Chaque run CI crée un événement et un message de test dans `lespetitspas` → accumulation. | Sans impact sur la prod. Nettoyage périodique du seed possible si besoin. |
| R5 | **Dépendance à Open-Meteo** (fonctionnalité bonus) | API gratuite sans SLA ; une panne rend le bloc météo indisponible. | Déjà géré : cache journalier + message « Météo indisponible pour le moment », aucun crash (SC26). |
| R6 | **Pas de monitoring / alerting en production** | Une erreur serveur ou une indisponibilité Supabase ne serait pas détectée automatiquement. | Hors périmètre MVP ; à prévoir après la mise en production. |
| R7 | **Confirmation d'email Supabase** | Le choix `Confirm email` doit être cohérent en prod (comptes créés vs invitation). | À consigner dans `JOURNAL.md` et vérifier au moment de créer les comptes de production. |
| R8 | **Adresse email personnelle dans l'historique git** (BUG004) | `nocodeia.oc@gmail.com` figure dans 3 anciens commits publics (arbre courant propre). Risque spam / hameçonnage, **pas un identifiant**. | Décision à prendre : accepter et documenter / dépôt privé / réécriture d'historique (voir `bugs.md`). |

---

## Rappel des critères de décision

| Décision | Conditions |
|---|---|
| **Go** | 0 bug bloquant, 0 bug majeur non corrigé, **tous** les scénarios MVP passent. |
| **Go conditionnel** | 1 ou 2 bugs mineurs documentés, la sécurité est assurée, la fonctionnalité principale marche. |
| **NoGo** | Il reste un bug bloquant, **ou** une faille RLS, **ou** une fonctionnalité MVP manquante. |

État constaté : 26/26 scénarios `OK` · 4/4 scénarios NoGo (sécurité) `OK` ·
0 bug bloquant · 0 bug majeur non corrigé · **1 bug mineur ouvert** (BUG004, email dans
l'historique git) · risques R1 et R2 = **prérequis de mise en production à lever (US-35)**.

---

## Décision

> _À compléter par le chef de projet : **Go** / **Go conditionnel** / **NoGo**._



## Justification

> _À compléter (5 à 10 lignes) : synthèse de l'état de l'application, prise en compte des
> risques R1–R7, conditions éventuelles (ce qui doit être fait avant/juste après la mise
> en production)._



---

_Signé : ______________________  Date : _______________________
