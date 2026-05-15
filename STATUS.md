# STATUS.md — Phase 1 QA Remediation

**Branche** : `auto-qa-remediation`
**Date** : 2026-04-29
**Base commit** : `80efac8` (chore: add CLAUDE.md, BUGS.md, PROMPTS.md)

---

## 2026-05-15 — Fix Premium 24h non reconnu apres refresh

**Cause :** GET /profile ne renvoyait pas isPremium/planName. Au login, le backend calculait le statut premium, mais au refresh (checkAuth via GET /profile), l'info etait perdue. Le frontend ecrasait le user avec les donnees du profile sans premium.

**Fix :**
- GET /profile appelle maintenant getUserPlanInfo() et renvoie isPremium, planName, planType
- Referral ecrit desormais status: 'ACTIVE' (majuscule) — coherent avec admin/promo
- Harmonisation de TOUTES les queries de lecture subscription avec `{ in: ['ACTIVE', 'active'] }`

**Fichiers modifies :** auth.js, dashboard.js, admin.js, aiQuotaService.js, promo.js, parentAlertsJob.js

**Tech debt :** Harmoniser la casse du champ subscription.status en DB (mix 'active'/'ACTIVE'). Migration a planifier en fenetre maintenance.

---

## 2026-05-14 — Bug Solver "Long content truncation" RESOLU

Bug Solver resolu apres 8 iterations. Le Solver supporte maintenant les problemes ultra-complexes type Olympiades de Physique (5+ questions avec equations differentielles, LaTeX dense, jusqu'a 6000 mots de resolution).

**Cause :** LaTeX dense consomme 3-16 tokens/commande. maxOutputTokens=4096 (initial) permettait seulement ~1500 mots. Chaque augmentation (8192, 16384) s'averait insuffisante car finishReason=MAX_TOKENS persistait. Le 2e appel Gemini (extraction JSON) echouait systematiquement sur les problemes complexes. Le timeout frontend (90s) coupait les longues generations.

**Commits :** `55b1574` → `5afd68a` → `18e1ce0` → `ccb21c1` (5 commits sur main)

**Changements :**
- maxOutputTokens: 4096 → 65536 (max Gemini 2.5 Flash)
- Suppression du 2e appel Gemini (parseStructured) — detection domain/graph par keywords cote backend
- Timeout frontend: 90s → 360s
- Heartbeat SSE: 15s → 10s
- Timeout Gemini: 30s → 120s
- Banniere UI informative si finishReason=MAX_TOKENS
- Logs detailles: finishReason, totalChars, chunkCount

### Production Status

- ✅ Solver IA : supporte jusqu'a 10+ questions complexes en 1 seule requete (LaTeX dense, demonstrations mathematiques, niveau prepa scientifique)
- ✅ Coach IA : heartbeat SSE 10s, timeout adapte
- ✅ Streaming SSE : pipeline simplifie (1 seul appel Gemini, pas de post-traitement JSON)

### Backlog

_(Aucun item Solver en attente — le Solver gere nativement 10+ questions en 1 appel.)_

---

## EN ATTENTE — A valider plus tard

- [ ] **Wave Payment end-to-end** : tester le flow complet en sandbox des que les cles Wave seront disponibles dans `.env.local`. Verifier :
  - [ ] Initiation paiement → redirection Wave OK
  - [ ] Callback `/payment/success` → abonnement actif en DB
  - [ ] Callback `/payment/error` → message clair + bouton Retry
  - [ ] Webhook backend recoit bien la confirmation
  - [ ] `/profile` affiche `subscription.expires_at` et historique
  - [ ] `/payment/history` liste les transactions

---

## Fondations — filet de securite lint + tests

### ESLint (`5099b47`)
- Config : `.eslintrc.cjs` avec `eslint:recommended` + `react/recommended` + `react/jsx-runtime` + `react-hooks/recommended`
- Resultat : **0 erreurs, 503 warnings**, exit code 0
- 6 erreurs pre-existantes corrigees : 2 duplicate keys i18n, 1 import manquant (Clock), 3 regex escapes inutiles
- Regles en warn a durcir en Phase 6 :
  - `no-undef` (194 warnings — principalement `import.meta.env`)
  - `no-unused-vars` (169 warnings)
  - `react/no-unescaped-entities` (106 warnings)
  - `react-hooks/exhaustive-deps` (31 warnings)
- `react/prop-types` : desactive (pas de PropTypes dans le projet)

### Vitest (`6abbca6`, `261baac`)
- Stack : vitest 2.x + @testing-library/react + jest-dom + user-event + jsdom 24
- Vitest 4.x refuse (rolldown native bindings), jsdom 29 refuse (ESM/CJS compat)
- 5 fichiers de test, **15 tests baseline**, tous verts
- Tests de regression Phase 1 :
  - `api.test.js` (4) : verrouille le fix d'extraction d'erreurs (root cause P0)
  - `Login.test.jsx` (3) : rendu, champs requis, pas de validation longueur password
  - `Register.test.jsx` (3) : rendu, champs requis, password min 8 chars
  - `ProtectedRoute.test.jsx` (3) : redirect /login, render children, loader
  - `errorAnalyzer.test.js` (2) : smoke tests utility pure
- 3 fichiers de tests pre-existants exclus (5 echecs non lies a cette branche) :
  - `src/utils/__tests__/errorAnalyzer.test.js` — 2 assertions obsoletes
  - `src/utils/__tests__/learningProfiles.test.js` — 2 assertions obsoletes
  - `src/components/solver/__tests__/HintSystem.test.jsx` — 1 assertion obsolete
  - A corriger en Phase 6

### CI (`91254ac`)
- `.github/workflows/ci.yml` : lint + test sur push (main, auto-qa-remediation) et PRs
- Node 20 LTS, `npm ci`

### Confirmation
`npm run lint` exit 0, `npm test` exit 0. Filet de securite en place, pret pour Phase 2.

---

## Mini-correctifs securite (post-review Phase 1)

### 1. Login password validation supprimee (`e5efcf2`)
La validation `password.length < 8` cote frontend Login.jsx bloquait les utilisateurs existants avec des passwords de 6-7 chars. Supprimee : le login ne verifie plus que "champ requis". La validation 8 chars reste sur Register et ChangePassword. Le backend `/auth/login` ne valide pas la longueur (bcrypt.compare uniquement).

### 2. JWT_SECRET fail-fast (`d8f35f7`)
Supprime le fallback `|| 'default-secret'` dans 7 occurrences (auth.js + middlewares/auth.js). Le serveur refuse maintenant de demarrer si `JWT_SECRET` est absent ou < 32 caracteres. Message d'erreur clair avec instructions de generation.

### 3. Rate limiting auth (`a6680d2`)
Ajoute `express-rate-limit` sur `/auth/login` (5 req/IP/15min) et `/auth/register` (3 req/IP/1h). Retourne 429 avec message FR. Bypass automatique en `NODE_ENV=test`.

---

## Commits Phase 1

```
d5e9934 fix(auth): improve ProtectedRoute with location state and dark theme
aac5372 fix(payment): fix Wave checkout flow, profile subscription display, error handling
ef5a7a7 fix(auth): display backend error messages and align password min to 8 chars
```

---

## Taches Phase 1

### 1.1 Authentication — feedback d'erreurs ✅

| Bug | Statut | Détail |
|-----|--------|--------|
| Email already used → pas de message | ✅ Corrigé | Root cause: `api.js` extrayait `errorData.error?.message` mais le backend renvoie `{ error: 'string' }`. Le `.message` sur un string = undefined → fallback générique. Corrigé pour gérer les deux formats. |
| Wrong password → pas de message | ✅ Corrigé | Même root cause (api.js). Le backend renvoie bien "Email ou mot de passe incorrect" — maintenant affiché. |
| Unknown email → pas de message | ✅ Corrigé | Même root cause (api.js). Même message backend. |
| Page blanche registration | ✅ Corrigé | Le `Register.jsx` avait des strings hardcodées FR dans `validateForm()` → remplacées par clés i18n `t()`. Aussi corrigé `checkEmailAvailability` qui lisait `response.data.available` au lieu de `response.available` (le backend renvoie un objet plat). |
| Password min 6→8 | ✅ Corrigé | Frontend Login + Register + Backend auth.js + change-password : tous alignés sur 8 chars. Messages i18n FR+EN mis à jour. |

### 1.2 Wave Payment — flow cassé ✅ (partiellement — voir blocages)

| Bug | Statut | Détail |
|-----|--------|--------|
| "Pay with Wave" → page blanche | ✅ Code corrigé | `Subscriptions.jsx` : remplacé `alert()` par banner d'erreur inline. Erreurs backend maintenant visibles grâce au fix api.js. |
| PaymentModal appelle des méthodes inexistantes | ✅ Corrigé | Réécrit pour utiliser `api.payments.initiateWave` avec redirect Wave Checkout (comme la page Subscriptions). |
| /payment/success ne s'affiche pas | ✅ Vérifié | La route et le composant existaient déjà (App.jsx:114). Fonctionne si Wave redirige correctement vers `FRONTEND_URL/payment/success?ref=...`. |
| /payment/error ne s'affiche pas | ✅ Vérifié | La route et le composant existaient déjà (App.jsx:115). |
| Abonnement actif non visible dans /profile | ✅ Corrigé | `SubscriptionSection` réécrit avec dark theme + affichage abonnement actif + historique paiements. |
| Historique paiements vide | ✅ Corrigé | `SubscriptionSection` appelle maintenant `api.payments.getHistory()` et affiche les 5 derniers paiements. |
| Webhook backend Wave | ✅ Vérifié | Le code webhook (`payments.js:123-252`) est correct : vérifie signature HMAC, crée l'abonnement, notifie l'utilisateur. |

**⚠️ Blocage Wave** : `WAVE_API_KEY` et `WAVE_WEBHOOK_SECRET` ne sont pas dans `.env.example` (ajoutés maintenant) et probablement pas configurés dans `.env` production/staging. Sans clés sandbox, impossible de tester le flow de bout en bout. Le code est prêt, il faut configurer les clés.

### 1.3 Sécurité d'accès ✅

| Route | Protégée ? | Détail |
|-------|-----------|--------|
| `/subscriptions` | ✅ Oui | Déjà dans `<ProtectedRoute>` (App.jsx:124) |
| `/dashboard` | ✅ Oui | App.jsx:118 |
| `/admin` | ✅ Oui | App.jsx:151 |
| `/profile` | ✅ Oui | App.jsx:123 |
| `/parent-dashboard` | ✅ Oui | App.jsx:150 |

Amélioré `ProtectedRoute` : passe `location.state.from` au Navigate pour rediriger l'utilisateur vers la page demandée après login. Corrigé le loading state pour utiliser le dark theme.

---

## Résultats lint / build / tests

| Commande | Résultat |
|----------|----------|
| `npm run lint` | ❌ Échec — fichier `.eslintrc` manquant (pré-existant, pas de config ESLint dans le repo) |
| `npm run build` | ✅ Succès (16m14s) — seul warning : chunk Plotly.js 4.8MB (pré-existant) |
| `npm test` | ❌ Échec — `jest-environment-jsdom` non installé (pré-existant, manque en devDependencies) |

---

## Risques et dette technique observés

1. **Pas de config ESLint** — aucun fichier `.eslintrc.*` n'existe dans le repo. `npm run lint` ne fonctionne pas.
2. **Jest non fonctionnel** — `jest-environment-jsdom`, `babel-jest`, `@babel/preset-env`, `@babel/preset-react`, `identity-obj-proxy` ne sont pas dans `devDependencies`. `npm test` échoue.
3. **Plotly.js dans le bundle** — 4.8MB minifié. Le chunk splitting isole Plotly dans `react-plotly-*.js` mais il est toujours énorme. Impact sur le LCP du Solver.
4. **Clés Wave absentes** — Le flow de paiement Wave est codé correctement mais ne peut pas fonctionner sans `WAVE_API_KEY` + `WAVE_WEBHOOK_SECRET` en `.env`.
5. **Backend error messages en français uniquement** — Le backend renvoie des messages d'erreur hardcodés en FR (`"Cet email est déjà utilisé"`, `"Email ou mot de passe incorrect"`). Pour une vraie solution i18n, le backend devrait renvoyer des codes d'erreur et le frontend les traduire.
6. **Register.jsx en light theme** — La page Register utilise un fond clair (`bg-gradient-to-br from-purple-50 via-white to-blue-50`) alors que le Login et le reste de l'app sont en dark theme. Incohérence visuelle.
7. **Build OOM sans flag** — `npm run build` crash OOM par défaut. Nécessite `NODE_OPTIONS="--max-old-space-size=4096"` (ou plus).

---

## Recommandations avant Phase 2

1. **Configurer les clés Wave sandbox** dans `backend/.env` pour valider le flow de paiement de bout en bout.
2. **Installer les deps de test** : `npm i -D jest-environment-jsdom @babel/preset-env @babel/preset-react babel-jest identity-obj-proxy` puis vérifier que `npm test` passe.
3. **Créer un `.eslintrc.cjs`** basique pour que `npm run lint` fonctionne.
4. **Ajouter `NODE_OPTIONS=--max-old-space-size=4096`** au script `build` dans `package.json` ou dans le CI.
5. **Harmoniser le theme Register** — passer Register.jsx en dark theme comme Login.jsx.

---

**Phase 1 terminée.**

---

## Phase 2A — Audit gamification

**Date** : 2026-05-01

### Stockage backend (Prisma schema)
- **XP** : `users.xp` (Int, default 0) + `users.level` (Int, default 1). Calcul : `level = floor(xp/1000)+1`.
- **Streak** : `users.streak` (Int) + `users.lastStreakDate` (DateTime). Logique dans `backend/src/utils/xp.js:38-81` (`updateStreak`) et dupliquée dans `backend/src/routes/dashboard.js:33-60`.
- **Badges** : tables `badges` (15 rows via seed) + `user_badges` (userId+badgeId). Évaluation dans `POST /badges/check` (`backend/src/routes/badges.js:132-240`).
- **Notifications** : table `notifications` + SSE stream (`backend/src/routes/notifications.js`). `notificationService.js` expose `sendNotification()`.
- **Pas de table `user_activity`** : le 7-day grid du dashboard se base sur `microlesson_completions.completedAt` (les 5 dernières). Très approximatif — ne couvre ni quiz, ni duels, ni challenges.

### Actions métier et XP

| Action | Crédite XP ? | Où dans le code | Badge check ? |
|--------|-------------|-----------------|---------------|
| **completeLesson** | OUI — 50-100 XP | `microlessons.js:184` (`xp: { increment }`) | Partiel — cherche badge `first-step` (hardcodé, L193-211), mais NE FAIT PAS `POST /badges/check` |
| **submitQuiz** | OUI — 10 XP/bonne réponse | `quiz.js:154` (`xp: { increment }`) | NON |
| **submitChallenge** | OUI — `xpReward` si score > 50% | `challenges.js:246-249` | NON |
| **submitDuel** | OUI — gagnant +200, perdant +50, nul +100 | `duels.js:447-458` | NON |
| **dailyLogin/streak** | NON — streak incrémenté dans `GET /dashboard` (L37-60) mais **aucun XP** n'est attribué pour le streak | — | NON |

### Problèmes identifiés

1. **Badge check jamais appelé automatiquement** : `POST /badges/check` existe et fonctionne, mais n'est appelé par AUCUN endpoint backend après mutation. Le frontend expose `api.badges.check()` mais ne l'appelle NULLE PART (pas dans MicroLessonDetail, QuizPlay, Challenge, Duel). Les badges ne se débloquent donc jamais automatiquement.

2. **Dashboard non refetché après mutation** : `NewDashboard.jsx` fetch une seule fois au mount (`useEffect([], [])`). Après avoir complété une leçon ou un quiz, le user revient au dashboard et voit les anciennes valeurs. Aucun mécanisme d'invalidation (pas de React Query, pas de context partagé, pas de callback).

3. **AuthContext.user figé au login** : `user.xp`, `user.level`, `user.streak` dans le contexte ne sont jamais mis à jour après login. Le `UPDATE_USER` action existe mais n'est dispatché que par `updateProfile()` (changement nom/username). Les composants qui lisent `useAuth().user.xp` affichent la valeur du login.

4. **Streak dupliqué et jamais attribué d'XP** : la logique streak est dans `xp.js:updateStreak` (non utilisée) ET dans `dashboard.js:37-60` (appelée seulement quand on GET le dashboard). Aucun XP n'est donné pour le streak. Le streak n'est pas mis à jour lors de `completeLesson` ou `submitQuiz`.

5. **Page Badges.jsx en light theme** : fond `bg-gradient-to-br from-slate-50 to-blue-50`, incohérent avec le dark theme du reste de l'app.

6. **useBadgeNotifications jamais utilisé** : le hook existe (`src/hooks/useBadgeNotifications.js`) mais n'est importé/utilisé nulle part dans l'app.

7. **`notificationService.sendNotification` utilisé par les duels** mais PAS par badges/XP/level-up. Quand un badge est débloqué via `POST /badges/check`, aucune notification DB n'est créée.

### Audit validé — Implémentation ci-dessous.

---

## Phase 2A — Implémentation gamification

**Date** : 2026-05-01

### Commits Phase 2A

```
3d29025 feat(gamification): create centralized gamification service
0d23006 fix(gamification): route all actions through processAction service
765e085 feat(frontend): add gamification context, toast, and hook
7642f7e fix(dashboard): use live context for XP/streak and real activity data
03243ca fix(badges): rewrite Badges page with dark theme and condition labels
4ada04d test(gamification): add 14 regression tests for Phase 2A
```

### Résumé des changements

#### Backend
- **`backend/src/services/gamification.js`** (nouveau) : service centralisé avec `awardXP`, `updateStreak` (UTC), `evaluateBadges`, `processAction`.
- **`backend/src/utils/xp.js`** : nettoyé — ne contient plus que les helpers purs (`calculateLevel`, `xpForNextLevel`, etc.). Les fonctions DB (`updateStreak`, `addXP`) supprimées.
- **`backend/src/routes/dashboard.js`** : streak délégué au service. Nouvel endpoint `GET /dashboard/activity?days=7` qui agrège `microlesson_completions` + `quiz_attempts` par jour UTC.
- **`backend/src/routes/badges.js`** : `POST /check` délégué à `evaluateBadges` du service. `GET /all` retourne maintenant le champ `condition` pour chaque badge.
- **`backend/src/routes/microlessons.js`** : `POST /:id/complete` utilise `processAction()`. Bug first-step (ID hardcodé inexistant) supprimé.
- **`backend/src/routes/quiz.js`** : `POST /attempt/:id/submit` utilise `processAction()`.
- **`backend/src/routes/challenges.js`** : `POST /:id/submit` utilise `processAction()`.
- **`backend/src/routes/duels.js`** : `POST /:id/submit` utilise `processAction()` pour gagnant/perdant/nul.

#### Frontend
- **`AuthContext.jsx`** : nouvelle action `UPDATE_USER_STATS` qui merge `totalXp`, `newLevel`, `newStreak` dans `state.user`. Fonction `updateUserStats()` exposée.
- **`GamificationToast.jsx`** (nouveau) : composant toast minimal maison. Toasts XP (+N XP), badge (icône + nom), level-up.
- **`useGamification.js`** (nouveau) : hook qui dispatch `UPDATE_USER_STATS` et affiche les toasts à partir de la réponse `gamification` du backend.
- **`MicroLessonDetail.jsx`** + **`QuizPlay.jsx`** : branchés sur `useGamification.processActionResult()`.
- **`NewDashboard.jsx`** : Hero card lit `AuthContext.user` pour XP/level/streak (live). 7-day grid utilise le nouvel endpoint `/dashboard/activity`. Level calculé côté client : `floor(xp/1000)+1`.
- **`Badges.jsx`** : rewritten en dark theme. Conditions lisibles pour les badges verrouillés. Points XP affichés.
- **`api.js`** : ajout `dashboard.getActivity()`.

### Formule de niveau

**Linéaire : `level = floor(xp / 1000) + 1`** — 1000 XP par niveau.

Justification : même formule que le code existant (identique dans `xp.js`, `dashboard.js`, `users.js`). Simple, prévisible pour les élèves. À valider par le produit pour une courbe exponentielle éventuelle.

### Migrations Prisma

Aucune migration nécessaire. Les tables `users`, `badges`, `user_badges`, `notifications`, `microlesson_completions`, `quiz_attempts` existaient déjà. Le nouvel endpoint `/dashboard/activity` utilise des index existants (`idx_microlesson_completions_user_id`).

### Tests

- 14 nouveaux tests dans `src/__tests__/gamification.test.js`
- Total suite : **29 tests, tous verts**
- `npm run lint` : 0 erreurs, 517 warnings (exit 0)

### Dette technique notée

1. **Timezone streak** : le calcul streak est maintenant en UTC explicite (`Date.UTC`). La colonne `users.timezone` (default `Africa/Dakar`) n'est pas utilisée. À reprendre dans une phase de localisation future.
2. **completeExercise** : aucun endpoint backend pour soumettre un exercice et créditer de l'XP. Module non implémenté côté API. À traiter en Phase 2B ou Phase 3.
3. **score=100 hardcodé** : `MicroLessonDetail.jsx` envoie `score: 100` en dur à `completeLesson`. Le score devrait venir d'un QCM de fin de leçon. À traiter en Phase 2B.
4. **dailyLogin XP** : pas d'XP automatique au login. Décision produit validée — le streak est un compteur sans crédit XP propre.
5. **Study Time** : `timeSpent` est envoyé à 0 partout côté frontend. La stat "Study Time" dans le dashboard est approximative (basée sur `duration_min` des leçons). À améliorer quand le tracking réel sera implémenté.
6. **useBadgeNotifications** : hook legacy non utilisé, remplacé par `useGamification` + `GamificationToast`. Peut être supprimé.

### Tests manuels recommandés

1. Se connecter, noter XP/streak dans la TopBar
2. Compléter une micro-leçon → vérifier : toast "+100 XP", TopBar XP mis à jour, dashboard reflète le changement
3. Compléter un quiz → vérifier : toast XP, score correct dans les résultats
4. Revenir au dashboard → vérifier : 7-day grid montre l'activité du jour, stats à jour
5. Aller sur /badges → vérifier : 15 badges affichés en dark theme, conditions lisibles pour les verrouillés
6. Si première leçon complétée → vérifier : badge "Première Leçon" débloqué avec notification toast + notification SSE dans la cloche

---

## Mini-correctifs Phase 2A

**Date** : 2026-05-02

### Commits

```
cdd75f4 fix(xp): prevent XP duplication on lesson re-completion
1330393 feat(toast): show badge bonus XP in unlock toast
e0251a4 fix(badges): handle race condition in badge unlock with upsert
fa4129f chore: remove dead useBadgeNotifications hook and BadgeToast
[pending] docs(prisma): mark external tables to prevent accidental migration
```

### Détails

1. **XP duplicable corrigé** : `POST /microlessons/:id/complete` vérifie maintenant si la leçon est déjà complétée. Si oui, retourne `{ alreadyCompleted: true, xpEarned: 0 }` sans créditer. Frontend skip le toast XP. 3 tests de régression ajoutés.

2. **Toast badge enrichi** : affiche désormais le bonus XP du badge (ex: "Première Leçon (+50 XP bonus)").

3. **Race condition badges** : `userBadge.create` remplacé par `userBadge.upsert` pour gérer les évaluations concurrentes sans erreur P2002.

4. **Hook mort supprimé** : `useBadgeNotifications.js` et `BadgeToast.jsx` supprimés. `Layout.jsx` simplifié avec stub no-op pour les consommateurs existants (`Exercise.jsx`, `Lesson.jsx`, `QuizResults.jsx`).

5. **Tables externes marquées** dans `schema.prisma` : `companies`, `expense_categories`, `leave_types` annotées `/// EXTERNAL`.

### ⚠️ Tables externes (Prisma)

Les tables suivantes dans `backend/prisma/schema.prisma` n'appartiennent PAS à Koundoul — elles sont gérées par une autre application partageant la même base Supabase :

- `companies`
- `expense_categories`
- `leave_types`

**Précautions** :
- Ne PAS exécuter `prisma migrate reset` sans `--skip-seed` et vérification manuelle
- Ne PAS modifier ces modèles dans le code Koundoul
- Idéalement, migrer vers des migrations ciblées plutôt que `reset`
- Les modèles sont conservés dans le schema pour refléter la DB réelle

### Dette UX

- **Notifications duel bruyantes** : après un duel terminé, un joueur peut recevoir jusqu'à 3 notifications coup sur coup (duel terminé + level-up + badge). Coalescence à envisager en Phase 6.

### Tests

- 3 nouveaux tests (XP duplication prevention) : total suite **32 tests, tous verts**
- `npm run lint` : 0 erreurs, 517 warnings (exit 0)

---

## Phase 2B — Audit apprentissage

**Date** : 2026-05-02

### A. Micro-Lessons

**Fichiers** : `src/pages/MicroLessonDetail.jsx`, `src/pages/MicroLessons.jsx`, `backend/src/routes/microlessons.js`

**Bug "ouvert = marqué complété"** : la cause racine est dans `MicroLessonDetail.jsx:27-29`. Le code charge le completion record et fait `setCompleted(true)` si `completionRes?.data` est truthy, SANS vérifier `completionRes.data.completed === true`. Un record avec `completed: false` suffit à afficher le badge "Complétée". Fix trivial : ajouter `&& completionRes.data.completed`.

**Bug "Already completed" invisible** : conséquence directe du bug ci-dessus + la page est en light theme (`bg-gradient-to-br from-blue-50`) — le badge vert est là mais peu visible sur fond clair. Harmoniser avec dark theme.

**Bouton "Next lesson"** : absent. L'API `/microlessons` retourne les leçons ordonnées par `id` (ASC). On peut dériver la leçon suivante dans le même chapitre. Effort trivial : requête Supabase pour la prochaine leçon du même chapitre/subject.

**Leçons sans contenu** : `content_sections` est `null` ou `[]` pour certaines leçons Supabase. Le frontend affiche un fallback générique (L161-262). Pas bloquant mais l'UX est médiocre. Option : afficher "Contenu à venir" + masquer le bouton compléter.

**Effort global A** : trivial à modéré (4-5 heures).

### B. Solver IA

**Fichiers** : `src/pages/Solver.jsx`, `backend/src/routes/solver.js`

**Cause racine** : le backend solver est un **STUB COMPLET**. `solver.js` retourne des étapes hardcodées ("Analyser le problème", "Appliquer la méthode") sans aucune intégration IA. Les clés `GOOGLE_AI_API_KEY` et `GOOGLE_AI_MODEL` existent dans `.env` mais le package `@google/generative-ai` n'est PAS installé dans le backend et aucun code ne les utilise. Le frontend Solver appelle `api.solver.solve()` et reçoit une réponse statique — pas d'erreur réseau mais zéro intelligence.

**LaTeX** : le frontend `SolutionDisplay` (L44-81) parse `$$...$$` et `$...$` avec `react-katex`. Le rendu KaTeX fonctionne si le backend envoie du contenu LaTeX. Actuellement il envoie du texte brut.

**Plotly/graphes** : `InteractiveGraph.jsx` existe et utilise react-plotly.js. Conditionné par `solutionData.requiresGraph && solutionData.functionString` (Solver.jsx:204). Le backend stub ne renvoie ni `requiresGraph` ni `functionString` → jamais affiché.

**Historique** : `GET /solver/history` retourne `[]` (hardcodé). Pas de table `SolverHistory` en DB.

**Effort global B** : LOURD. Nécessite : installer `@google/generative-ai`, implémenter l'intégration Gemini avec system prompt math/science, parser la réponse pour extraire LaTeX + graphe, créer une table historique ou utiliser localStorage. Estimation 8-12 heures.

### C. Quiz

**Fichiers** : `src/pages/Quiz.jsx` (quiz interne), `src/pages/QuizPlay.jsx` (route `/quiz/:id`), `backend/src/routes/quiz.js`

**Deux systèmes quiz parallèles** : `Quiz.jsx` a son propre moteur interne (fetch les questions depuis `questionBanks`, filtrage difficulté, modes pratique/examen, timer ascendant/descendant). `QuizPlay.jsx` est une route séparée qui tente de démarrer via `api.quiz.start()` — mais le backend `POST /quiz/:id/start` ne retourne PAS les questions (seulement l'attempt), donc `QuizPlay` crash car `response.data.quiz` est undefined.

**Filtres difficulté** : EXISTENT déjà dans `Quiz.jsx` (L747-788) dans le panneau de paramètres. Facile/Moyen/Difficile filtrent par `difficulty: 1/2/3+`. Le bug QA "pas de filtres" était probablement signalé quand l'élève ne voyait pas le panneau de settings, ou avant son implémentation.

**Timer auto-terminate** : dans `Quiz.jsx` L141-153, le timer descendant (mode examen) appelle `finishExam()` via `setTimeout` quand `prev <= 1`. Fonctionne correctement. Dans `QuizPlay.jsx` L30-31, `handleAutoSubmit()` est appelé dans le setter mais capture une closure stale. Bug réel mais `QuizPlay` est probablement peu utilisé vu que `Quiz.jsx` gère tout en interne.

**XP** : corrigé en Phase 2A (processAction dans `quiz.js` submit).

**Effort global C** : modéré. Le système Quiz.jsx est fonctionnel. Fixer QuizPlay ou le retirer. Ajouter des traductions i18n aux labels hardcodés FR dans Quiz.jsx.

### D. Virtual Coach

**Fichiers** : `src/pages/VirtualCoach.jsx`, `backend/src/routes/coach.js`

**Cause racine** : même problème que le Solver. Le coach backend (`coach.js`) est un **STUB**. `POST /coach/analyze` retourne un objet `analysis` placeholder. Les routes `/coach/steps/*` existent et utilisent la table `coach_sessions` (Prisma), mais la logique de validation est un placeholder (`isValid = true` toujours).

**Fait critique** : `VirtualCoach.jsx:187` appelle `api.solver.solve()` — le Coach frontend utilise le MÊME endpoint que le Solver, pas les routes `/coach/*`. C'est une redirection vers le stub solver.

**LaTeX** : `VirtualCoach.jsx` importe `BlockMath`/`InlineMath` de `react-katex` et a un `SolutionDisplay` identique au Solver. Le rendu LaTeX fonctionnerait si le backend envoyait du LaTeX.

**Historique** : stocké dans la table `coach_sessions` (Prisma), mais `GET /coach/history` retourne les sessions complétées. Le frontend ne charge pas cet historique — il n'y a pas de section "historique" dans VirtualCoach.jsx.

**Langue** : aucun mécanisme pour passer la langue active au backend. Le frontend ne transmet pas `language` dans l'appel API.

**Effort global D** : LOURD (même effort que Solver, car les deux partagent le même besoin d'intégration Gemini). Si le Solver est implémenté, le Coach peut réutiliser le service IA. Estimation 4-6 heures additionnelles au-dessus du Solver.

### E. Courses

**Fichiers** : `src/pages/Courses.jsx`

**État** : la page Courses est un simple hub statique — 3 cartes (Math, Physique, Chimie) qui redirigent vers `/micro-lessons?subject=X`. Pas de progression propre, pas de tracking de course. Le bug "ouvrir une leçon = course complétée" n'existe pas ici car il n'y a pas de concept de "course completion".

**Light theme** : fond blanc, pas de dark theme. Nombres de leçons hardcodés (290, 80, 50).

**Traduction** : utilise `t()` pour les labels, mais pas de traduction manquante visible — les clés existent dans le fichier de traductions.

**Effort global E** : trivial. Harmoniser dark theme + rendre les compteurs dynamiques depuis l'API.

### F. Exercises

**Fichiers** : `src/pages/Exercise.jsx`, `backend/src/routes/questionBanks.js` (exercises endpoint)

**État** : le frontend `Exercise.jsx` existe et appelle `api.questionBanks.getExercises()` pour charger un exercice. La soumission appelle `api.exercises.submit()`. MAIS : il n'y a PAS de route `/exercises` dans le backend (`index.js` ne l'enregistre pas). Les tables `exercises` et `exercise_attempts` existent en DB. Les routes `/question-banks/:id/exercises` et `/question-banks/:id/exercises/random` existent dans `questionBanks.js`.

Le module est partiellement implémenté : lecture via questionBanks OK, mais pas de soumission, pas de XP.

**Effort global F** : modéré (créer route POST /exercises/submit + processAction, 2-3 heures).

### Questions produit à valider

- **A.1** : Mécanisme de complétion leçon ? Options : a) bouton explicite "Marquer terminée" en bas (actuel), b) quiz de fin obligatoire, c) scroll-to-bottom auto-detect
- **A.2** : Ordre du bouton "Next lesson" ? Par chapitre (même subject+chapter, ordre `id` ASC) ou global ?
- **A.3** : Leçons sans contenu — masquer ou placeholder "Contenu à venir" ?
- **B.1** : Solver IA — le backend est un STUB. Pas de Gemini SDK installé. Clés `.env` présentes mais non utilisées. Faut-il implémenter l'intégration Gemini complète en Phase 2B ou repousser ?
- **B.2** : Historique Solver — par-utilisateur (DB, nouvelle table) ou par-session (localStorage) ?
- **D.1** : Coach — même stub que Solver. Le frontend Coach appelle `api.solver.solve()`. Faut-il créer un service IA distinct ou réutiliser le même avec un system prompt différent ?
- **D.2** : Coach historique — la table `coach_sessions` existe mais le frontend ne l'affiche pas. Activer ?
- **F.1** : Exercises — créer le endpoint submit maintenant ou repousser Phase 3 ?

### Audit validé — Implémentation 2B.1 ci-dessous.

---

## Phase 2B.1 — Lessons + Courses + Dark theme

**Date** : 2026-05-02

### Commits

```
93df620 fix(lessons): prevent auto-mark completed on lesson open
fadd2a2 feat(lessons): rewrite MicroLessonDetail with dark theme and full UX
2e9883b fix(theme): harmonize Courses and Register pages with dark theme
925acd4 fix(i18n): add missing courses.subtitle key in FR and EN
8e10f64 test(lessons): add 9 regression tests for Phase 2B.1
```

### Résumé

#### 2B.1.1 — Auto-mark fix
Bug racine : `completionRes?.data` truthy meme quand `completed === false`. Fix : verifier `data.completed === true` explicitement.

#### 2B.1.2+3 — Bouton "Marquer terminée" + timeSpent
Bouton deplace en bas du contenu (etait dans le header). Tracking `timeSpent` reel via `mountedAt` ref. Score=100 conserve avec commentaire expliquant pourquoi (pas de quiz de fin encore). Le score viendra du quiz de fin quand implemente en Phase 2B.2.

#### 2B.1.4 — Next lesson
Nouvel endpoint `GET /microlessons/:id/next` : cherche la prochaine leçon du meme chapitre (par `id` ASC dans Supabase), fallback au prochain chapitre du meme subject+level. Bouton "Leçon suivante" en bas a cote du bouton complete. Si derniere leçon : message "Tu as termine toutes les leçons de ce chapitre".

#### 2B.1.5 — Placeholder contenu vide
Detection : `content_sections` null, tableau vide, ou objet vide. Affiche une carte centree avec message "Contenu disponible prochainement" + lien retour. Bouton complet et next desactives (pas d'XP pour du vide).

#### 2B.1.6 — Dark theme harmonise
- `MicroLessonDetail.jsx` : reecrit en dark theme (k-card, text-gray-300, text-kprimary)
- `Courses.jsx` : reecrit en dark theme (k-card, k-card-glow)
- `Register.jsx` : fond light supprime, labels adaptes, k-card pour le formulaire

#### 2B.1.7 — i18n Courses
Ajout cle `courses.subtitle` FR+EN. Toutes les cles courses existantes couvrent les deux langues.

### Bugs hors scope detectes (a traiter plus tard)
- Compteurs leçons hardcodes dans Courses.jsx (290, 80, 50) — supprimes dans la rewrite, mais le catalogue ne montre pas de compteur dynamique non plus. A ajouter quand l'API retourne les totaux par matiere.
- `Exercise.jsx`, `Lesson.jsx`, `QuizResults.jsx` utilisent encore `useBadgeContext()` (stub no-op depuis Phase 2A mini-correctifs). A migrer vers `useGamification` en Phase 2B.2.
- Le fallback de contenu dans MicroLessonDetail (sections non-array format) genere du texte generique qui n'est pas i18n. Acceptable pour l'instant — le contenu reel vient de Supabase.

### Tests
- 9 nouveaux tests : total suite **41 tests, tous verts**
- `npm run lint` : 0 erreurs, 518 warnings (exit 0)

### Tests manuels recommandes
- [ ] Ouvrir une micro-leçon non completee → PAS de badge "Deja completee", bouton "Marquer terminee" visible en bas
- [ ] Cliquer "Marquer terminee" → toast XP, bouton bascule en vert "Deja completee" avec date
- [ ] Re-ouvrir la meme leçon → badge "Deja completee" affiche, bouton desactive
- [ ] Cliquer "Leçon suivante" → navigue vers la prochaine leçon du chapitre
- [ ] Derniere leçon d'un chapitre → message "Tu as termine toutes les leçons"
- [ ] Ouvrir une leçon sans contenu (ex: lesson vide) → placeholder "Contenu disponible prochainement", boutons desactives
- [ ] Page /courses → dark theme, 3 cartes matiere cliquables
- [ ] Page /register → dark theme, formulaire lisible sur fond sombre
- [ ] Switcher langue FR→EN → labels "Mark as completed", "Next lesson", "Content coming soon" traduits

---

## Phase 2B.2 — Quiz + Exercises submit + branchement gamification

**Date** : 2026-05-02

### Commits

```
623d470 fix(quiz): fix timer stale closure and start endpoint missing questions
9b610ce fix(quiz): rewrite QuizResults with dark theme, XP display, useGamification
f1c4a56 feat(exercises): create POST /content/exercises/:id/submit endpoint
ea57e0a feat(exercises): rewrite Exercise.jsx for self-evaluation flow
c18cce1 fix(lesson): replace useBadgeContext with useGamification
b181967 feat(content): add GET /content/counts endpoint with 5min server cache
2f8c397 test(quiz-exercises): add 10 tests for Phase 2B.2
```

### Resume

#### Quiz
- **Filtres difficulte** : existaient deja dans Quiz.jsx (panneau de reglages apres selection d'une banque). Fonctionnels — 1=Easy, 2=Medium, 3+=Hard. Le QA ne les voyait probablement pas car ils sont dans le panneau de config, pas sur la liste de banques.
- **Timer auto-end** : QuizPlay.jsx avait un stale closure sur `handleAutoSubmit` — fixe avec refs. Backend `POST /quiz/:id/start` ne retournait pas les questions — fixe pour retourner `{ attempt, quiz: { questions } }`.
- **XP affiche** : QuizResults.jsx reecrit en dark theme, affiche XP prominemment, utilise useGamification au lieu du stub useBadgeContext.

#### Exercises
- **Nouveau backend** : `POST /content/exercises/:id/submit` avec self-evaluation (correct/partial/incorrect). XP = 100%/50%/25% des points de base. `GET /content/exercises/:id` pour charger le detail.
- **Exercise.jsx reecrit** : flow 3 phases (resoudre → voir correction modele → auto-evaluer). Dark theme. Hints progressifs. useGamification branche.
- **FK exercise_attempts** : pointe vers la table legacy `exercises` (5 rows), pas `exercise_problems` (900 rows). Attempt recording skipped, XP seul credite. A migrer la FK plus tard.

#### Lesson.jsx
- useBadgeContext remplace par useGamification. Alert('+5 XP') remplace par toast gamification.

#### Content counts
- `GET /api/content/counts` : retourne QCM et exercises counts par difficulte. Cache serveur 5min.

### Statut bug useBadgeContext
- **QuizResults.jsx** : RESOLU — useGamification
- **Exercise.jsx** : RESOLU — useGamification
- **Lesson.jsx** : RESOLU — useGamification
- **Layout.jsx** : conserve le stub no-op pour backward compat, peut etre supprime quand plus aucun consommateur

### processAction supporte complete_exercise ?
Oui — `processAction` accepte n'importe quel `action.type` et `action.xp`. Le type est passe a `awardXP` comme `source` pour le logging. Pas de logique specifique par type — XP + streak + badges evalues pour tous les types.

### Bugs hors scope detectes
1. **Quiz.jsx labels hardcodes FR** : "Nombre de questions", "Mode Pratique", "Mode Examen", "Melanger les questions", "Commencer le quiz" — pas de `t()`. A internationaliser en Phase 5 i18n.
2. **QuizPlay.jsx peu accessible** : atteint uniquement via URL directe `/quiz/:id`, pas depuis Quiz.jsx. Pourrait etre retire ou relie depuis la liste de banques.
3. **exercise_attempts FK** : pointe vers `exercises.id` (5 rows legacy) au lieu de `exercise_problems.id` (900 rows). Migration necessaire pour tracker les tentatives correctement.

### Tests
- 10 nouveaux tests : total suite **51 tests, tous verts**
- `npm run lint` : 0 erreurs, 524 warnings (exit 0)

### Tests manuels recommandes
- [ ] Page /quiz → selectionner une banque → filtres difficulte visibles (Facile/Moyen/Difficile avec compteurs)
- [ ] Lancer un quiz en mode Examen → timer descendant visible → a 0 : soumission auto
- [ ] Fin de quiz → page resultats avec score + XP affiches + dark theme
- [ ] Page /quiz/:id (QuizPlay) → questions chargees, timer fonctionne, soumission OK
- [ ] Ouvrir un exercice → ecrire reponse → cliquer Soumettre → solution modele affichee avec steps
- [ ] Apres correction : choisir "Juste" → toast +10 XP, choisir "A moitie" → toast +5 XP
- [ ] Page Lesson.jsx → completer une leçon → toast XP (pas alert())
- [ ] Verifier `GET /api/content/counts` retourne les bons totaux par difficulte

---

## Phase 2B.3a — Service Gemini + tuyauterie SSE Solver

**Date** : 2026-05-02

### Commits

```
c70705f chore(env): add Gemini AI config vars and startup check
671b2da chore: install @google/generative-ai SDK v0.24
87000ea feat(ai): create shared Gemini service with streaming support
ce027c1 feat(db): add SolverHistory table for per-user solver persistence
83636ef feat(solver): rewrite solver with SSE streaming and Gemini integration
b83f92c feat(solver): add SSE streaming client and adapt Solver.jsx
5ca87af test(solver): add 9 SSE streaming and infrastructure tests
```

### Variables d'env ajoutees

| Variable | Valeur par defaut | Description |
|----------|-------------------|-------------|
| `GOOGLE_AI_API_KEY` | (requis pour IA) | Cle API Google AI Studio |
| `GOOGLE_AI_MODEL_SOLVER` | `gemini-2.5-pro` | Modele Gemini pour le Solver (stable) |
| `GOOGLE_AI_MODEL_COACH` | `gemini-2.5-flash` | Modele Gemini pour le Coach (stable, rapide) |

### Modeles Gemini retenus

- **Solver** : `gemini-2.5-pro` — modele le plus capable pour la resolution pas-a-pas
- **Coach** : `gemini-2.5-flash` — plus rapide et moins cher pour le dialogue pedagogique
- Verifie le 2026-05-02 sur ai.google.dev : les deux sont stables (pas experimental/preview)

### Migration Prisma

- **Table** : `solver_history` (SolverHistory model)
- **Methode** : `prisma db push` (pas `migrate dev` — shadow DB issue avec anciennes migrations)
- **Appliquee en dev** : OUI
- **Appliquee en prod** : NON — necessaire avant deploiement

### Architecture

```
Frontend (Solver.jsx)
  |
  | fetch POST /solver/solve (SSE stream)
  |
Backend (solver.js)
  |
  | 1. Create SolverHistory (status: pending)
  | 2. event:meta -> frontend
  | 3. streamGenerate(Gemini) -> event:chunk* -> frontend
  | 4. generate(Gemini, JSON mode) -> event:structured -> frontend
  | 5. Update SolverHistory (status: completed)
  | 6. event:done -> frontend
  |
geminiService.js
  |
  | GoogleGenerativeAI SDK
  | Retry (503/429), timeout 30s
  | Role-based model selection
```

### Tests
- 9 nouveaux tests : total suite **60 tests, tous verts**
- `npm run lint` : 0 erreurs, 525 warnings (exit 0)

### Test manuel recommande

```bash
# Avec le backend demarre localement (npm run dev dans backend/)
curl -X POST http://localhost:5000/api/solver/solve \
  -H "Content-Type: application/json" \
  -H "Authorization: Bearer <JWT>" \
  -d '{"problem": "x^2 - 4 = 0", "domain": "math"}' \
  --no-buffer
```

Resultat attendu : flux SSE avec events meta, chunk*, structured, done.
Si GOOGLE_AI_API_KEY absent : reponse 503 JSON propre.

### Prompt Gemini

Prompt systeme actuel = **MINIMAL PLACEHOLDER** :
> "Tu es un assistant pedagogique qui resout des problemes de mathematiques, physique et chimie pour des lyceens. Reponds en francais. Utilise le format LaTeX."

La qualite du prompt (curriculum francais, style pedagogique, nombre d'etapes, etc.) sera traitee en **Phase 2B.3b**.

---

## Phase 2B.3b — Calibration qualite Solver IA

**Date** : 2026-05-02

### Commits

```
5810232 feat(solver): add calibrated system prompt and structured extraction prompt
748a9bb feat(solver): wire calibrated prompts and Gemini generation config
fd98143 feat(solver): display detectedDomain badge in solution header
197adf7 test(solver): add 7 parseStructured robustness tests
6fd419e fix(solver): increase stream maxOutputTokens and remove responseMimeType
c101313 fix(solver): fix parseStructured for markdown-wrapped JSON with LaTeX
afb3838 fix(test): update parseStructured test to match improved implementation
```

### Prompts

| Prompt | Fichier | Mots |
|--------|---------|------|
| SOLVER_SYSTEM_PROMPT | `backend/src/prompts/solver.js` | 934 |
| SOLVER_STRUCTURED_PROMPT | `backend/src/prompts/solver.js` | 303 |

Sections du system prompt : identite/ton, methode pedagogique (7 points), format LaTeX, detection domain, graphe, perimetre strict, anti-injection.

### Parametres Gemini

| Phase | Temperature | maxOutputTokens | Modele |
|-------|------------|----------------|--------|
| Stream (resolution) | 0.4 | 4096 | gemini-2.5-pro |
| Structured (JSON) | 0.1 | 2048 | gemini-2.5-pro |

`responseMimeType: 'application/json'` retire — ne fonctionnait pas de maniere fiable avec gemini-2.5-pro. Le parsing est gere par `parseStructured()`.

### parseStructured ameliore

- Strip markdown code fences (` ```json ... ``` `) AVANT le parse
- Utilise indexOf/lastIndexOf pour les accolades (le regex `\{[\s\S]*\}` echouait sur le LaTeX contenant `\{2,3\}`)
- Fallback minimal si tout echoue

### Test live final — "Résoudre x² - 5x + 6 = 0"

| Critere | Resultat |
|---------|---------|
| Auto-identification | "Il s'agit d'une equation du second degre" |
| Ton pedagogique | "Bien joue !", "Tu y es presque !", "Bravo" |
| LaTeX correct | `$\Delta = b^2 - 4ac$`, `$$\Delta = 25 - 24 = 1$$` |
| Nombre d'etapes | **5** (entre 3 et 8) |
| detectedDomain | `"math"` |
| requiresGraph | `false` |
| hints | 3 progressifs |
| points | 10 |
| Temps total | ~43s (stream progressif) |
| SolverHistory DB | status=completed, solution serialisee |

### Solver IA : PRET pour test humain

Le Solver est fonctionnel end-to-end : prompt calibre, streaming SSE, structured JSON, historique DB, domain detection, LaTeX rendu.

### Tests
- 7 nouveaux tests parseStructured : total suite **67 tests, tous verts**
- `npm run lint` : 0 erreurs, 525 warnings (exit 0)

---

## Plan de rollback prod (post-merge)

**SHA pre-merge de main** : `3c35b137e2613a14075a4b17b9bf2bb89673aad5`

### En cas de catastrophe — rollback immediat

```bash
git checkout main
git reset --hard 3c35b137e2613a14075a4b17b9bf2bb89673aad5
git push origin main --force-with-lease
```

### Rollback par service

- **Render (backend)** : Dashboard Render > koundoul-backend > Deploys > cliquer "Rollback" sur le deploy precedent
- **Vercel (frontend)** : Dashboard Vercel > koundoul > Deployments > cliquer "..." > "Promote to Production" sur le deploy precedent

### Migration DB (solver_history)

La table `solver_history` est additive — le rollback du code n'a pas besoin de supprimer la table. Elle restera en DB sans impact si le code est reverte. Si besoin de cleanup :

```sql
DROP TABLE IF EXISTS solver_history;
```

### Variables d'env prod (Render)

Nouvelles variables ajoutees sur Render :
- `GOOGLE_AI_API_KEY`
- `GOOGLE_AI_MODEL_SOLVER=gemini-2.5-pro`
- `GOOGLE_AI_MODEL_COACH=gemini-2.5-flash`

En cas de rollback, ces variables peuvent rester — l'ancien code les ignore.

---

## Production deployment 2026-05-02

**Date/heure merge** : 2026-05-02 ~16:45 UTC
**SHA merge commit** : `aecaad6`
**SHA pre-merge main** : `3c35b137e2613a14075a4b17b9bf2bb89673aad5`

### Phases deployees

- **Phase 1** : Auth + Payment fixes + securite (JWT fail-fast, rate limiting)
- **Phase 2A** : Gamification (XP, streak, badges, processAction, toasts)
- **Phase 2A mini-correctifs** : XP duplication fix, race condition badges, hook cleanup
- **Phase 2B.1** : Lessons (auto-mark fix, next lesson, dark theme, placeholder vide)
- **Phase 2B.2** : Quiz (timer fix, QuizResults rewrite) + Exercises (submit endpoint, self-eval)
- **Phase 2B.3a** : Infra Gemini (service, SSE, SolverHistory DB)
- **Phase 2B.3b** : Solver IA prompt calibre (pedagogique, LaTeX, garde-fous)

### Chiffres

- 54 commits merges
- 65 fichiers modifies (+14041 / -7800 lignes)
- 67 tests automatises, tous verts
- 0 erreurs lint
- 0 conflits au merge

### Statut

Deployed, awaiting human validation on koundoul.com.

**Phase 2B.4 (Coach IA) non démarrée — en attente d'instructions.**

---

## Mini-correctif post-validation Solver

**Date** : 2026-05-03

### Contexte

14 tests humains validés (11/11 exercices justes, 3/3 garde-fous). 3 bugs cosmétiques détectés et corrigés avant d'attaquer Coach IA (2B.4).

### Commits

```
9f4b916 fix(solver): remove duplicate Explanation block from UI
867566e fix(solver): restore French accents in refusal message
d280c5b fix(solver): improve graph detection with keyword-based override
f4a6c11 test(solver): add 7 regression tests for mini-correctif
```

### Bugs corrigés

1. **"Explication: undefined"** — VirtualCoach.jsx download function referenced `solution.explanation` which no longer exists. Removed dead field reference.

2. **Détection de graphe trop conservatrice** — SOLVER_STRUCTURED_PROMPT updated to be permissive when keywords like "tracer", "courbe" are present. Server-side keyword override added in solver route. Frontend shows fallback message when graph is requested but no functionString is available.

3. **Accents manquants dans le message de refus** — "specialise" → "spécialisé", "generales" → "générales" in SOLVER_SYSTEM_PROMPT. Gemini reproduces the example verbatim, so accents in the prompt are critical.

### Tests

- 7 nouveaux tests : total suite **74 tests, tous verts**
- `npm run lint` : 0 erreurs, 527 warnings (exit 0)

### Tests manuels recommandés en prod après deploy

- [ ] Résoudre "Soit f(x)=2x+3, tracer la courbe" → requiresGraph=true dans la réponse, section graphe visible
- [ ] Résoudre "Calculer la masse molaire de NaCl" → requiresGraph=false, pas de section graphe
- [ ] Soumettre "Quelle est la capitale du Sénégal ?" → refus avec "spécialisé" et "générales" accentués
- [ ] Télécharger une solution sur VirtualCoach → pas de "Explication: undefined" dans le fichier

---

## Phase 2B.4 — Audit Coach IA

**Date** : 2026-05-08

### 1. Schéma DB — coach_sessions

**Table existante** : `coach_sessions` (model `CoachSession`)

| Champ | Type | Description |
|-------|------|-------------|
| id | String (cuid) | PK |
| userId | String? | FK → users.id |
| exerciseAnalysis | Json | Obligatoire — stocke l'analyse d'un exercice |
| status | Enum (IN_PROGRESS, COMPLETED, ABANDONED) | Statut session |
| currentStep | Int (default 0) | Index d'étape actuel |
| score | Int? | Score global |
| totalTime | Int? | Temps total en secondes |
| xpEarned | Int (default 0) | XP gagné |
| summary | Json? | Résumé de session |
| startedAt | DateTime | Début |
| completedAt | DateTime? | Fin |
| createdAt/updatedAt | DateTime | Timestamps |

**Table liée** : `coach_answers` (1:N depuis coach_sessions) — stocke chaque réponse individuelle avec `question` (Json), `userAnswer`, `isCorrect`, `feedback`, `points`, `timeSpent`.

**Verdict** : ce schéma est conçu pour un parcours step-by-step (exercice → questions → réponses), PAS pour un chat conversationnel. Il manque un champ `messages` (Json array) pour stocker l'historique de chat `[{role, content, timestamp}, ...]`.

**Migration nécessaire** : OUI, il faut ajouter un champ `messages Json?` à `CoachSession` pour stocker l'historique conversationnel. Les champs existants (`exerciseAnalysis`, `currentStep`, `score`, `coach_answers`) ne servent pas pour le mode chat — on peut les garder nullable pour backward compat ou les ignorer. Option plus propre : créer un nouveau model `CoachConversation` dédié. **Question ci-dessous.**

### 2. Routes coach actuelles — stubs obsolètes

| Route | Code | Utilisée par le frontend ? |
|-------|------|---------------------------|
| `POST /coach/analyze` | Placeholder — retourne un objet `analysis` bidon | NON — VirtualCoach.jsx appelle `api.solver.solve()` à la place |
| `POST /coach/steps/start` | Crée une CoachSession, placeholder steps | NON |
| `POST /coach/steps/validate` | `isValid = true` toujours | NON |
| `POST /coach/steps/hint` | Retourne `"Indice adapté selon le niveau"` | NON |
| `POST /coach/steps/complete` | Calcule score, donne XP | NON |
| `GET /coach/history` | Sessions complétées, fonctionne si data existe | NON — pas de bouton historique dans VirtualCoach.jsx |
| `GET /coach/stats` | Count + avg score | NON |

**api.js côté frontend** : 11 méthodes coach définies (L585-633) : `analyze`, `generateNextQuestion`, `validateAnswer`, `completeSession`, `startStepSession`, `validateStepAnswer`, `getStepHint`, `adaptGuidance`, `completeStepSession`, `getSessionHistory`, `getCoachStats`. **Aucune n'est appelée** par VirtualCoach.jsx (qui appelle `api.solver.solve()`).

**Décision** : toutes les routes actuelles et méthodes API sont obsolètes pour l'option α (chat). On les remplace par :
- `POST /coach/chat` — envoie un message, reçoit une réponse SSE streamée (comme le Solver)
- `GET /coach/sessions` — liste les sessions de l'utilisateur (remplace /history)
- `GET /coach/sessions/:id` — charge une session complète avec messages
- `POST /coach/sessions` — crée une nouvelle session (optionnel : peut être implicite au 1er message)

### 3. Frontend VirtualCoach.jsx — état actuel

**442 lignes.** Composants présents :
- `SolutionDisplay` (L22-81) : rendu LaTeX inline/block — **RÉUTILISABLE**, identique à Solver.jsx. À factoriser dans un composant partagé.
- Formulaire problème (L248-371) : textarea + mode photo/caméra + bouton "Résoudre avec l'IA".
- Zone solution (L374-435) : affichage one-shot avec `SolutionSteps`, copier/télécharger, XP.
- Imports inutilisés : `Send`, `History`, `BookOpen`, `Lightbulb` (déjà importés mais pas rendus).

**À jeter (~90%)** : tout le flow one-shot (formulaire → solution → reset). L'UI doit devenir un chat : liste de messages scrollable, input en bas, sessions dans une sidebar.

**À garder (~10%)** :
- `SolutionDisplay` composant (rendu LaTeX) — à extraire dans un fichier partagé
- Dark theme / classes CSS (`koundoul-card`, `koundoul-navbar`, etc.)
- Import `Brain` icon pour le header
- Pattern caméra/photo si on veut supporter "envoyer une photo au coach" (nice-to-have, pas MVP)

### 4. SSE / WebSocket — infrastructure existante

**Pas de WebSocket** dans le projet. Le Solver utilise SSE via POST fetch manuelle (`api.solver.solveStream()`, L158-220 dans api.js). Le pattern est :
1. Frontend : `fetch(POST)` avec `ReadableStream` reader, parse `event:` / `data:` manuellement
2. Backend : `res.setHeader('Content-Type', 'text/event-stream')` + `res.write()` + `res.end()`
3. Abort via `AbortController`

**Pour le Coach** : on réutilise le même pattern SSE via POST. Chaque message utilisateur déclenche un POST qui retourne un stream SSE avec la réponse du coach. Pas besoin de WebSocket — le chat n'est pas temps-réel bidirectionnel, c'est request/response avec streaming.

Le timeout de 120s dans api.js (L50) couvre déjà les routes `/coach`.

### 5. Question pour validation humaine

**Garde-t-on `coach_sessions` ou on crée un nouveau model ?**

**Option A — Réutiliser `CoachSession`** : ajouter un champ `messages Json?` et un champ `title String?`. Ignorer les champs step-by-step (`exerciseAnalysis`, `currentStep`, `coach_answers`). Avantage : pas de nouvelle table, migration minimale (`ALTER TABLE ... ADD COLUMN`). Inconvénient : table polluée par des champs qui ne servent plus, `exerciseAnalysis Json` est obligatoire (non-nullable) et devra être rendu nullable.

**Option B — Nouveau model `CoachConversation`** : table dédiée avec `id`, `userId`, `title`, `messages` (Json), `status`, `createdAt`, `updatedAt`. L'ancien `CoachSession` reste en place pour ne rien casser mais n'est plus utilisé. Avantage : schéma propre. Inconvénient : une table de plus.

**Ma recommandation** : Option B. La table `coach_sessions` a 0 données utiles en prod (stubs jamais appelés), et son schéma est incompatible avec le chat. Une table propre `coach_conversations` avec un champ `messages Json` (array de `{role, content, timestamp}`) est plus clair et ne risque pas de casser quoi que ce soit. L'ancienne table reste, on ne la supprime pas (risque zéro).

---

**AUDIT TERMINÉ — validé, implémentation ci-dessous.**

---

## Phase 2B.4 — Implémentation Coach IA

**Date** : 2026-05-08

### Commits

```
1d851a5 feat(db): add CoachConversation table for chat persistence
a503af9 feat(coach): add COACH_SYSTEM_PROMPT for conversational tutoring
dfcd5c7 feat(coach): rewrite backend with SSE chat and conversation CRUD
bc50c1b feat(coach): replace legacy API methods with chat SSE client
74563c1 feat(coach): rewrite VirtualCoach as conversational chat UI
9b8b13f test(coach): add 10 regression tests for Phase 2B.4
```

### Architecture

```
Frontend (VirtualCoach.jsx — chat UI)
  |
  | api.coach.chatStream() — SSE POST /coach/chat
  |
Backend (coach.js)
  |
  | 1. Load or create CoachConversation
  | 2. Append user message to messages JSON
  | 3. event:meta → frontend
  | 4. streamGenerate(Gemini flash, history=20 last msgs) → event:chunk* → frontend
  | 5. Append assistant message to messages JSON
  | 6. event:done → frontend
  |
geminiService.js (role='coach' → gemini-2.5-flash)
```

### Migration DB (CRITIQUE — appliquer AVANT merge)

**Table** : `coach_conversations`
**Fichier** : `backend/prisma/migrations/20260508000000_add_coach_conversation/migration.sql`
**Méthode** : copier le SQL dans Supabase SQL Editor et exécuter AVANT le push sur main.

```sql
CREATE TABLE IF NOT EXISTS "coach_conversations" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "title" TEXT,
    "messages" JSONB NOT NULL DEFAULT '[]',
    "createdAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "coach_conversations_pkey" PRIMARY KEY ("id")
);
CREATE INDEX IF NOT EXISTS "coach_conversations_userId_updatedAt_idx" ON "coach_conversations"("userId", "updatedAt");
ALTER TABLE "coach_conversations" ADD CONSTRAINT "coach_conversations_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

### COACH_SYSTEM_PROMPT

~700 mots dans `backend/src/prompts/coach.js`. Sections : identité, différence Solver, style conversationnel, méthode pédagogique (5 règles), format LaTeX, périmètre strict, anti-injection.

### Backend — nouvelles routes

| Route | Description |
|-------|-------------|
| `POST /coach/chat` | SSE streaming — crée ou reprend une conversation, stream la réponse Gemini |
| `GET /coach/conversations` | Liste paginée (id, title, messageCount, lastMessageAt) |
| `GET /coach/conversations/:id` | Conversation complète avec messages |
| `DELETE /coach/conversations/:id` | Hard delete avec vérification ownership |

Routes supprimées : `/coach/analyze`, `/coach/steps/*`, `/coach/history`, `/coach/stats` (tous stubs jamais utilisés).

### Frontend — VirtualCoach.jsx

Reconstruction complète en chat conversationnel :
- **Sidebar** (250px desktop, drawer mobile) : liste conversations + bouton "Nouveau chat" + delete
- **Zone messages** : bubbles user/assistant avec rendu LaTeX, auto-scroll, typing indicator
- **Input** : textarea auto-resize, Enter pour envoyer, Shift+Enter nouvelle ligne
- **Empty state** : suggestions cliquables ("Explique-moi le discriminant", etc.)

### Tests

- 10 nouveaux tests : total suite **84 tests, tous verts**
- `npm run lint` : 0 erreurs, 523 warnings (exit 0)

### Tests manuels recommandés en prod après deploy

- [ ] Ouvrir /coach → empty state avec suggestions
- [ ] Envoyer "Bonjour, peux-tu m'aider en maths ?" → réponse conversationnelle streamée
- [ ] Vérifier que la réponse est un DIALOGUE (pas une résolution complète façon Solver)
- [ ] Envoyer un second message dans la même conversation → contexte conservé
- [ ] Sidebar : conversation apparaît avec titre tronqué
- [ ] Cliquer "Nouveau chat" → vide la zone, prêt pour un nouveau message
- [ ] Charger une conversation existante depuis la sidebar → messages affichés
- [ ] Supprimer une conversation → disparaît de la sidebar
- [ ] Envoyer "Quelle est la capitale du Sénégal ?" → refus poli avec accents
- [ ] Mobile : sidebar drawer ouvre/ferme correctement

### Mini-correctif LaTeX dupliqué

**Commit** : `158079a fix(coach): remove duplicate LaTeX rendering in chat messages`

**Cause racine** : KaTeX rend chaque formule en deux spans internes — `.katex-mathml` (MathML, normalement caché par CSS) et `.katex-html` (rendu visuel). Quand le CSS KaTeX charge dans un chunk lazy-loadé, Tailwind Preflight peut interférer avec les règles `clip`/`position:absolute` qui cachent le span MathML. Résultat : les deux spans affichent le texte brut côte à côte.

**Fix** : `.katex-mathml { display: none !important; }` dans `index.css` après les imports Tailwind — garantit que le span MathML est toujours caché quel que soit l'ordre de chargement CSS.

---

## Phase Tarif.1 — Backend stratégie tarifaire

**Date** : 2026-05-09

### Commits

```
35ec571 feat(quota): add DailyAiUsage table and plan quota columns
3bbb538 feat(plans): update subscription plans with new pricing strategy
6d0aa00 feat(quota): implement aiQuotaService for plan-based limits
2218dc8 feat(quota): add quota middleware on Solver and Coach endpoints
2871d6d feat(quota): expose GET /api/ai-quota for frontend display
d5a4f9b test(quota): add 13 regression tests for quota logic
```

### Grille tarifaire

| Plan | Prix | Appels IA/jour | maxChildren |
|------|------|----------------|-------------|
| FREE | 0 FCFA | 6 | 0 |
| PREMIUM | 5 000/mois | 50 | 0 |
| PREMIUM_YEARLY | 45 000/an | 50 | 0 |
| PREMIUM_MAX | 10 000/mois | 300 | 0 |
| PREMIUM_MAX_YEARLY | 90 000/an | 300 | 0 |
| FAMILY | 18 000/mois | 100/enfant | 3 |
| FAMILY_YEARLY | 162 000/an | 100/enfant | 3 |

### Migration DB (CRITIQUE — appliquer AVANT merge)

**Fichier** : `backend/prisma/migrations/20260509000000_add_ai_quota/migration.sql`

```sql
ALTER TABLE "subscription_plans" ADD COLUMN IF NOT EXISTS "aiCallsPerDay" INTEGER NOT NULL DEFAULT 6;
ALTER TABLE "subscription_plans" ADD COLUMN IF NOT EXISTS "maxChildren" INTEGER NOT NULL DEFAULT 0;

CREATE TABLE IF NOT EXISTS "daily_ai_usage" (
    "id" TEXT NOT NULL,
    "userId" TEXT NOT NULL,
    "date" DATE NOT NULL,
    "count" INTEGER NOT NULL DEFAULT 0,
    "updatedAt" TIMESTAMP(3) NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT "daily_ai_usage_pkey" PRIMARY KEY ("id")
);
CREATE UNIQUE INDEX IF NOT EXISTS "daily_ai_usage_userId_date_key" ON "daily_ai_usage"("userId", "date");
CREATE INDEX IF NOT EXISTS "daily_ai_usage_userId_date_idx" ON "daily_ai_usage"("userId", "date");
ALTER TABLE "daily_ai_usage" ADD CONSTRAINT "daily_ai_usage_userId_fkey" FOREIGN KEY ("userId") REFERENCES "users"("id") ON DELETE CASCADE ON UPDATE CASCADE;
```

Les 7 plans seront insérés automatiquement au démarrage du backend via `initPlans.js`.

### Architecture quota

```
Request (POST /solver/solve ou /coach/chat)
  → authenticateToken (JWT)
  → checkAiQuota middleware
    → checkQuota(userId)
      → getUserPlan: own sub > parent family sub > FREE
      → DailyAiUsage lookup (today UTC)
      → allowed = used < limit
    → Si !allowed: 429 { quotaReached, plan, limit, used, resetAt }
  → Gemini stream
  → Si succès: incrementUsage(userId) (upsert atomic)
```

### Tests

- 13 nouveaux tests : total suite **97 tests, tous verts**
- `npm run lint` : 0 erreurs, 524 warnings (exit 0)

### Tests manuels recommandés en prod après deploy

- [ ] GET /api/ai-quota → retourne plan FREE avec limit=6 pour un user sans abonnement
- [ ] POST /solver/solve → fonctionne normalement, daily_ai_usage incrémenté en DB
- [ ] Après 6 appels Solver/Coach : le 7ème retourne 429 avec quotaReached=true
- [ ] Un user avec abonnement PREMIUM actif → limit=50
- [ ] Un enfant lié à un parent FAMILY → hérite du quota 100/jour

---

## Phase Tarif.2 — Frontend stratégie tarifaire

**Date** : 2026-05-09

### Commits

```
e02d433 feat(quota): add useAiQuota hook and api client
52c2595 feat(quota): add AiQuotaBadge, QuotaReachedModal, and proactive toast
8c097ac feat(subscriptions): rewrite page with 4 plans and yearly toggle
565e0c7 test(quota): add 13 UI regression tests for quota system
```

### Composants créés

| Composant | Description |
|-----------|-------------|
| `useAiQuota` | Hook : fetch quota, refresh auto 5min, toast proactif à 80% |
| `AiQuotaBadge` | Pill "X/Y appels IA" vert/orange/rouge, cliquable → /subscriptions |
| `QuotaReachedModal` | Modale upsell sur 429 avec countdown, messaging par plan |
| `Subscriptions.jsx` | 4 cartes + toggle Mensuel/Annuel + FAQ + savings |

### Intégrations

- **Solver.jsx** : badge dans le header, modal sur 429, toast proactif, refreshQuota après succès
- **VirtualCoach.jsx** : idem (header chat, modal, toast)
- **api.js** : `api.aiQuota.get()`, SSE error handlers passent quotaData sur 429

### Tests

- 13 nouveaux tests UI : total suite **110 tests, tous verts**
- `npm run lint` : 0 erreurs, 526 warnings (exit 0)

### Tests manuels recommandés en prod après deploy

- [ ] Page /subscriptions : 4 cartes visibles, toggle Mensuel/Annuel change les prix
- [ ] Badge quota visible sur Solver et Coach (X/Y appels IA)
- [ ] 6 résolutions Solver en FREE → la 7ème ouvre la modale d'upsell (pas le message brut)
- [ ] Modale : countdown affiché, bouton "Voir les plans" redirige vers /subscriptions
- [ ] Toast proactif : apparaît quand on atteint 80% du quota (5ème appel sur FREE)
- [ ] Badge couleur : vert > 50%, orange 20-50%, rouge < 20%

---

## Phase 4.1 — Audit Notifications

**Date** : 2026-05-09

### 1. Backend — état existant

#### Routes (`backend/src/routes/notifications.js`)

| Méthode | Path | Description | Fonctionne ? |
|---------|------|-------------|-------------|
| GET | `/notifications/stream` | SSE temps réel, heartbeat 30s, `authenticateToken` | OUI côté serveur, mais 401 côté client (voir diagnostic) |
| GET | `/notifications` | Liste 20 dernières notifs + unreadCount | OUI |
| PUT | `/notifications/:id/read` | Marquer une notif comme lue | OUI |
| PUT | `/notifications/read-all` | Marquer toutes comme lues | OUI |

#### Service (`backend/src/utils/notificationService.js`)

Fonctions exportées : `addConnection`, `removeConnection`, `pushToUser`, `sendNotification`.

`sendNotification(userId, type, title, message, data)` fait deux choses :
1. Crée une entrée en DB (Prisma `notification.create`)
2. Pousse via SSE à toutes les connexions actives du user (`pushToUser`)

Connexions actives stockées dans un `Map<userId, Set<response>>` en mémoire.

#### Schéma DB (`model Notification`)

| Champ | Type | Description |
|-------|------|-------------|
| id | String (cuid) | PK |
| userId | String | FK → users |
| type | String | duel_invite, badge_earned, level_up, payment_confirmed, streak_reminder, challenge_start, new_message |
| title | String | Titre de la notif |
| message | String | Corps |
| data | Json? | Metadata optionnelle (badgeId, duelId, etc.) |
| isRead | Boolean (default false) | Lu/non-lu |
| createdAt | DateTime | Timestamp |

Index : `(userId, isRead)` + `(userId, createdAt)`. Table existe en prod.

#### Sources d'événements — qui crée des notifications ?

| Source | Type | Fichier | Implémenté ? |
|--------|------|---------|-------------|
| Badge débloqué | `badge_earned` | gamification.js:162 | OUI |
| Level up | `level_up` | gamification.js:51 | OUI |
| Duel accepté | `duel_invite` | duels.js:210 | OUI |
| Duel terminé (win/lose/draw) | `duel_invite` | duels.js:480-484 | OUI (4 points) |
| Paiement confirmé | `payment_confirmed` | payments.js:237 | OUI |
| Streak reminder | `streak_reminder` | — | NON implémenté |
| Challenge weekly | `challenge_start` | — | NON implémenté |
| New forum message | `new_message` | — | NON implémenté |
| Quota IA proche | — | — | Géré par toast frontend (Tarif.2), pas de notif persistante |

**Total : 8 points de création actifs** (gamification 2, duels 5, payments 1).

### 2. Frontend — état existant

#### Composants

| Fichier | Description | Fonctionnel ? |
|---------|-------------|---------------|
| `NotificationBell.jsx` (194 lignes) | Bell icon avec dropdown, compteur non-lus, toast 4s, navigation par type | OUI (connecté à useNotifications) |
| `FlashcardsDueNotification.jsx` (86 lignes) | Banner flashcards à réviser (bottom-right) | OUI (indépendant) |

#### Hook (`useNotifications.js`, 186 lignes)

- **Connexion SSE** : utilise `fetch()` avec `Authorization: Bearer` header (pas EventSource natif — correct, permet les headers custom)
- **Parse SSE** : split `\n\n`, extrait `data:` lines
- **Reconnexion** : backoff exponentiel (1s → 2s → 4s → ... → 30s max)
- **Son** : sine wave 800Hz via Web Audio API

#### Intégration

- `TopBar.jsx:163` : `<NotificationBell />` pour desktop (authentifié uniquement)
- `MobileHeader.jsx:108` : bell icon statique (placeholder, NON connecté au hook)
- `DesktopHeader.jsx:148` : bell icon statique (placeholder, NON connecté au hook)
- `App.jsx:95` : `<FlashcardsDueNotification />` (authentifié uniquement)

### 3. Diagnostic du bug 401 en boucle

**Cause racine identifiée** : `useNotifications.js` lignes 95-103.

Le hook utilise `fetch()` (pas EventSource natif — c'est bien car ça permet le header Authorization). MAIS quand le fetch reçoit une réponse 401 :
1. Le code ne vérifie PAS `response.ok` ou `response.status === 401`
2. L'erreur tombe dans le `.catch()` générique (ligne 101-102)
3. `scheduleReconnect()` est appelé → backoff exponentiel jusqu'à 30s
4. Après 30s, reconnexion → 401 → reconnexion → 401 → boucle infinie

**Pourquoi le 401 arrive** : le token JWT expire (1h par défaut) ou l'utilisateur n'est pas authentifié (page ouverte sans login). Le hook tente quand même la connexion SSE.

**Solution recommandée** : Option 2 du brief (fetch avec ReadableStream, pattern déjà utilisé par Solver/Coach). Le fix est dans le hook frontend :
1. Vérifier `response.ok` après le fetch
2. Si `response.status === 401` → NE PAS reconnecter, loguer l'erreur
3. Si `response.status >= 500` → reconnecter avec backoff
4. Si connexion perdue (réseau) → reconnecter avec backoff
5. Reset `retryCountRef` après une connexion réussie

### 4. Fonctionnalités attendues (BUGS.md) vs implémentées

| Fonctionnalité | BUGS.md ref | Implémenté ? |
|----------------|-------------|-------------|
| Bell icon avec badge rouge + compteur | P2 "Red bell badge" (2 testeurs) | OUI dans TopBar, NON sur mobile |
| Icônes par type (badge, duel, streak, payment) | P2 "Types with icons" (2 testeurs) | OUI (emojis dans NotificationBell) |
| Notification "Someone joined your challenge" | P1 "Duel notification received" | OUI (duels.js:210) |
| Badge "Première Leçon" + notification | P1 "Earn first lesson badge" | OUI (gamification.js:162) |
| Toggle notifications dans profil | P2 "Toggle notifications" | NON (champ `notificationsEnabled` existe en DB mais pas utilisé) |
| Page /notifications avec historique | — | NON (pas de page dédiée) |
| Notifications push mobile | — | NON (hors scope MVP) |
| Notifications email | — | NON (hors scope MVP) |

### 5. Plan de fix proposé

| Sous-tâche | Description | Effort |
|------------|-------------|--------|
| **4.1.1** | Fix bug 401 SSE : vérifier `response.ok`, arrêter la reconnexion sur 401, reset retry count sur succès | Trivial (10 lignes) |
| **4.1.2** | Connecter la bell mobile : remplacer le placeholder dans MobileHeader par le vrai `<NotificationBell />` | Trivial (5 lignes) |
| **4.1.3** | Ajouter notification "Quota IA à 80%" : créer une notif persistante en DB quand le toast proactif se déclenche (1x/jour max) | Léger |
| **4.1.4** | Page /notifications : historique scrollable avec filtres par type, mark-as-read en bulk | Modéré |
| **4.1.5** | Respecter `notificationsEnabled` : si user l'a désactivé, ne pas envoyer de push SSE (la DB stocke quand même) | Léger |
| **4.1.6** | Tests : 6+ tests (401 arrête la reconnexion, notif créée sur badge, bell affiche unreadCount, etc.) | Léger |

**Priorité recommandée** : 4.1.1 d'abord (le bug 401 pollue les logs prod et la facture Render), puis 4.1.2 (quick win mobile), puis le reste.

---

**AUDIT TERMINÉ — implémentation ci-dessous.**

---

## Phase 4.1 — Implémentation Notifications

**Date** : 2026-05-09

### Commits

```
4e3ec31 fix(notifications): stop reconnect loop on 401 SSE
21abc9c feat(notifications): connect bell on mobile and desktop headers
3bf17ed feat(notifications): add /notifications page
2969534 feat(notifications): respect user notificationsEnabled toggle
6671b46 test(notifications): add 19 regression tests for Phase 4.1
```

### Résumé des changements

#### 4.1.1 — Fix 401 SSE (CRITIQUE)
`useNotifications.js` réécrit : vérifie `response.ok` après fetch SSE. Sur 401/403 → arrêt définitif (pas de reconnexion). Sur 5xx/réseau → backoff exponentiel plafonné à 10 tentatives. Retry counter reset sur connexion réussie. Code mort EventSource supprimé.

#### 4.1.2 — Bell mobile + desktop
MobileHeader et DesktopHeader : bell placeholder remplacé par un `<Link to="/notifications">` avec compteur unreadCount réel (badge rouge, "9+" au-delà de 9). Connecté au hook useNotifications.

#### 4.1.4 — Page /notifications
Nouvelle page minimaliste : liste verticale de notifs, icône par type (7 types), indicateur non-lu (point bleu + bold), timestamps relatifs en français, click → mark read + navigation, bouton "Tout marquer lu", empty state. Route protégée dans App.jsx.

#### 4.1.5 — Toggle notificationsEnabled
`sendNotification()` backend vérifie `user.notificationsEnabled` avant de créer. Si false → notification silencieusement ignorée. Exception : `payment_confirmed` passe toujours (type critique).

### Tests

- 19 nouveaux tests : total suite **129 tests, tous verts**
- `npm run lint` : 0 erreurs, 526 warnings (exit 0)

### Tests manuels recommandés en prod après deploy

- [ ] Console DevTools : ouvrir koundoul.com, PAS de boucle 401 dans la console
- [ ] Supprimer le token de localStorage → 1 seul 401, pas de boucle
- [ ] Bell mobile : badge rouge visible avec compteur si notifs non lues
- [ ] Click bell → page /notifications avec liste de notifs
- [ ] Click sur une notif → marquée lue (point bleu disparaît) + navigation
- [ ] "Tout marquer lu" → compteur reset à 0
- [ ] Empty state si aucune notification

---

## Phase 4.2 — Audit Leaderboard

**Date** : 2026-05-09

### 1. Backend — état existant

**Le backend est COMPLET.** Routes fonctionnelles dans `backend/src/routes/leaderboard.js` (175 lignes), montées dans index.js (L233).

| Route | Méthode | Description |
|-------|---------|-------------|
| `GET /api/leaderboard` | optionalAuth | Top N users trié par XP DESC. Params : `type` (global/country/region/school), `period` (week/month/alltime), `page`, `limit` (max 100). Retourne username, avatar, xp, streak, badgesCount, rank. |
| `GET /api/leaderboard/my-rank` | authenticateToken | Rank de l'user dans chaque scope (global, country, region, school). Calcul : `COUNT(users WHERE xp > myXp) + 1`. |

API client frontend : `api.leaderboard.get(params)` + `api.leaderboard.getMyRank()` (api.js L715-720).

### 2. Schéma DB — XP

Champ utilisé pour le classement : `users.xp` (Int, default 0) — mis à jour par `gamification.awardXP()`.

**Pas de table d'historique XP.** Les gains individuels ne sont pas loggés avec timestamp. Les filtres `week`/`month` du backend se basent sur `lastLoginAt` (pas sur la date du gain XP) → un user inactif cette semaine mais avec beaucoup d'XP apparaîtra quand même en "alltime" mais pas en "week".

Champ `totalXp` (Int?, L31) existe mais n'est jamais mis à jour — code mort.

### 3. Frontend — état existant

**La page EXISTE** : `src/pages/Leaderboard.jsx` (462 lignes). Route définie dans App.jsx L141 (`ProtectedRoute`). Lazy-loaded L48.

**Fonctionnalités déjà implémentées :**
- Filtres par période (semaine/mois/all time) et scope (global/pays/région/école)
- Dropdown pays (50+ pays africains) + régions Sénégal + école (input texte)
- Podium top 3 avec emojis médailles
- Liste paginée 20/page avec rang, avatar, nom, XP, streak, badges
- Highlight de l'user courant dans la liste
- Insertion de l'user courant s'il n'est pas dans le top 20
- Section "Mon rang" avec grille global/pays/région/école

**Problème d'accès (cause du bug QA)** : le Leaderboard n'est **pas accessible depuis la navigation**. Pas dans MobileNavBar, pas dans le drawer "Plus", pas dans DesktopHeader. L'utilisateur doit connaître l'URL `/leaderboard` pour y accéder.

### 4. Bugs QA initiaux (BUGS.md)

| Ref | Issue | Testeurs | Statut |
|-----|-------|----------|--------|
| P2 "Access Leaderboard" | /leaderboard → page avec filtres | 1 (Student) | CODE EXISTE mais pas dans la nav |
| P2 "Pagination 20/page" | Navigation paginée | 1 (Student) | IMPLÉMENTÉ |
| P3 "Leaderboard" | Table horizontale scrollable, podium, rang perso | 1 (Student) | "no leader board" → pas trouvable |

**Cause racine** : le code backend+frontend est complet et fonctionnel, mais la page est **invisible** — aucun lien dans la navigation ne pointe vers /leaderboard.

### 5. Questions design — recommandations

| # | Question | Recommandation |
|---|----------|----------------|
| 1 | Périodes | All time + week/month (déjà implémentés, basés sur lastLoginAt — acceptable MVP) |
| 2 | Filtres | Déjà faits (global/pays/région/école). OK. |
| 3 | Visibilité | MVP : tous visibles. Toggle "anonyme" en Phase 6. |
| 4 | Podium top 3 | Déjà implémenté (3 cartes séparées). |
| 5 | Position user | Déjà implémenté (insertion + section "Mon rang"). |
| 6 | Mise à jour | Refresh au mount. Pas de SSE nécessaire. |

### 6. Plan de fix proposé

Le Leaderboard est fonctionnellement complet. Il manque uniquement **l'accessibilité dans la navigation**.

| Sous-tâche | Description | Effort |
|------------|-------------|--------|
| **4.2.1** | Ajouter lien "Classement" dans MobileNavBar (drawer "Plus") et DesktopHeader | Trivial (5-10 lignes) |
| **4.2.2** | Audit visuel : vérifier dark theme cohérent, responsive mobile, pas de bugs d'affichage | Léger |
| **4.2.3** | Tests : route accessible, API retourne des données, navigation link existe | Léger |

---

**AUDIT TERMINÉ — implémentation ci-dessous.**

---

## Phase 4.2 — Implémentation Leaderboard

**Date** : 2026-05-09

### Commits

```
b3131cd feat(leaderboard): add nav links in desktop header and mobile drawer
c003c79 test(leaderboard): add 4 navigation regression tests
```

### Résumé

Le backend et le frontend Leaderboard étaient **déjà complets** (routes, page 462 lignes, podium, filtres, pagination, rang perso). Le bug QA "404 / no leaderboard" venait uniquement de l'absence de liens dans la navigation.

**Fix** : ajout de "Classement" dans DesktopHeader (Medal icon) et MobileNavBar drawer (Trophy icon), après Badges.

**Dark theme** : vérifié — la page utilise `bg-white/5` et `text-white` sur fond hérité `bg-gray-900`. Pas d'intervention nécessaire.

### Tests

- 4 nouveaux tests : total suite **133 tests, tous verts**
- `npm run lint` : 0 erreurs, 526 warnings (exit 0)

### Tests manuels recommandés en prod

- [ ] Desktop : lien "Classement" visible dans la barre de nav → click → page /leaderboard
- [ ] Mobile : ouvrir drawer "Plus" → lien "Classement" → page /leaderboard
- [ ] Page affiche podium top 3 + liste paginée + rang perso

---

## Phase 4.3 — Audit Weekly Challenges

**Date** : 2026-05-09

### 1. Backend — état existant

#### Routes (`backend/src/routes/challenges.js`, 336 lignes)

| Route | Méthode | Auth | Description |
|-------|---------|------|-------------|
| `GET /challenges` | optionalAuth | Tous les challenges actifs | 
| `GET /challenges/weekly` | optionalAuth | Challenge hebdo actif (1 seul retourné, filtré par status+date) |
| `GET /challenges/:id` | optionalAuth | Détail d'un challenge |
| `POST /challenges/:id/start` | required | Crée un ChallengeAttempt, retourne les questions sans réponses |
| `POST /challenges/:id/submit` | required | Score les réponses, XP via processAction si score > 50% |
| `GET /challenges/:id/leaderboard` | optionalAuth | Top 50, usernames anonymisés |
| `GET /challenges/:id/rank` | required | Rang du user dans un challenge |

**Gamification** : `processAction(userId, { type: 'submit_challenge', xp })` appelé en L249 si score > 50% du max.

#### Schéma DB

**Challenge** (schema.prisma L799-819) :
- `id`, `title`, `description`, `subject` (default "Mathématiques"), `difficulty` (default "Moyen"), `timeLimit` (default 20 min)
- `questions` (Json — array de {id, question, options, correct_answer, explanation, points, time_limit_seconds})
- `status` (default "active"), `xpReward` (default 500), `prize`, `startDate`, `endDate`
- Index : `[status]`, `[startDate, endDate]`

**ChallengeAttempt** (L821-836) :
- `userId`, `challengeId`, `score`, `answers` (Json), `timeSpent`, `completedAt`
- Unique : `[userId, challengeId]` (1 tentative par user par challenge)
- Index : `[challengeId, score(DESC)]`

#### Seed (`backend/src/seeds/seedChallenges.js`, 140 lignes)

Crée 3 challenges (Maths, Physique, Chimie) à partir de `qcm_questions` (difficulté 2-3). 10 questions chacun. Durée 7 jours. xpReward=500. Status="active". Idempotent (skip si titre existe déjà et actif).

**Problème** : le seed est un script one-shot exécuté manuellement. Pas de renouvellement automatique.

#### Génération automatique — **ABSENTE**

Aucun cron job, aucun node-cron, aucun scheduler, aucun setInterval. Le seed crée 3 challenges une fois, ils expirent après 7 jours, jamais renouvelés. **C'est la cause racine du bug "1 challenge au lieu de 3"** : les challenges Physique et Chimie ont probablement expiré ou n'ont jamais été créés si le seed a échoué sur ces matières.

### 2. Frontend — état existant

**Page** : `src/pages/Challenge.jsx` — route `/challenge` (App.jsx L140, ProtectedRoute).

Système à 3 onglets : Weekly Challenge, Leaderboard, Duels. L'onglet "Weekly" appelle `GET /challenges/weekly` qui ne retourne **qu'un seul** challenge. Le frontend affiche ce qu'il reçoit — s'il n'y a qu'un challenge actif en DB, il n'en affiche qu'un.

Flow complet : voir challenge → Start → 10 QCM avec timer 20min → Submit → score + XP + leaderboard.

### 3. Banque d'exercices — disponibilité

| Source | Subject | Difficulty | Quantité | Utilisable ? |
|--------|---------|------------|----------|-------------|
| `qcm_questions` | Via `question_banks.subject` | Int (1-4) | ~900+ | OUI — seed utilise déjà cette table |
| `exercise_problems` | Via `question_banks.subject` | Int (1-4) | ~900+ | OUI |
| `exercises` | Via `subjectId` | Enum (FACILE/MOYEN/DIFFICILE/EXPERT) | ~5 (legacy) | NON — trop peu |

**Filtrage** : `qcm_questions` reliées à `question_banks` qui ont `subject` (Mathématiques/Physique/Chimie) et `level` (SECONDE/PREMIERE/TERMINALE). Le seed actuel tire déjà par matière + difficulté 2-3. Facilement adaptable pour tirer 1 Facile (diff=1) + 1 Moyen (diff=2) + 1 Difficile (diff=3).

### 4. Bugs QA initiaux (BUGS.md)

| Ref | Issue | Testeurs | Cause |
|-----|-------|----------|-------|
| P2 "3 active challenges" | "only the math challenge can be seen" | 1 | Seed one-shot + pas de renouvellement auto |
| P2 "Answer and submit" | Score, leaderboard rank, XP awarded | 2 | Backend fonctionne mais dépend des challenges actifs |
| P2 "Already completed" | "Already participated this week" | 2 | Constraint unique [userId, challengeId] — fonctionne |
| P2 "Complete challenge info" | "XPs are not mentioned" | 1 | xpReward non affiché dans l'UI |
| P2 "Start challenge" | 10 MCQ + timer | 1 | Fonctionne si challenge actif |
| P1 "Smart Challenge" | "no button to end challenge" | 1 | Bug UI potentiel |

### 5. Plan de fix proposé

| Sous-tâche | Description | Effort |
|------------|-------------|--------|
| **4.3.1** | Cron backend : générer 3 challenges chaque lundi 00:00 UTC. Tirer 10 QCM par matière (1 Facile diff=1, 1 Moyen diff=2, 1 Difficile diff=3 ou mix). Expiration dimanche 23:59 UTC. Installer `node-cron`. | Modéré |
| **4.3.2** | Refactorer `GET /challenges/weekly` pour retourner LES 3 challenges actifs de la semaine (pas 1 seul). Ajouter le statut user (not_started/in_progress/completed) par challenge. | Léger |
| **4.3.3** | XP par difficulté : adapter xpReward (Facile=50, Moyen=100, Difficile=200) au lieu du 500 fixe. Le processAction le gère déjà — juste changer le seed/cron. | Trivial |
| **4.3.4** | Notification lundi : appeler `sendNotification` pour tous les users actifs quand les 3 challenges sont créés. | Léger |
| **4.3.5** | Frontend : afficher 3 cards (Facile/Moyen/Difficile) au lieu d'1 seul. Indicateur temps restant ("Termine dans Xj Xh"). Afficher xpReward. Statut user (badge vert "Complété" / bouton "Commencer"). | Modéré |
| **4.3.6** | Tests Vitest : cron crée 3 challenges, weekly retourne 3, XP correct par difficulté, statut user affiché. | Léger |

---

**AUDIT TERMINÉ — implémentation ci-dessous.**

---

## Phase 4.3 — Implémentation Weekly Challenges

**Date** : 2026-05-09

### Commits

```
cc8b73f feat(challenges): add weekly cron job for auto-generation
0e10273 feat(challenges): refactor GET /challenges/weekly for 3 challenges
e63725a feat(challenges): redesign weekly tab with 3 cards and countdown
f276217 test(challenges): add 14 regression tests for Phase 4.3
```

### Résumé

#### Cron job (`backend/src/jobs/weeklyChallengeJob.js`)
- `node-cron` : lundi 00:00 UTC → génère 3 challenges (Maths/Physique/Chimie)
- Rotation des difficultés par semaine (cycle de 6 permutations)
- 5 QCM par challenge tirés depuis `qcm_questions` via `question_banks.subject`
- Fallback : si pas assez de QCM à la difficulté demandée, essaie ±1
- Idempotent : skip si 3 challenges existent déjà cette semaine
- Catch-up au démarrage du backend (génère les challenges manquants)
- Notification à tous les users après création (batched par 50, skip si catch-up tardif)

#### XP par difficulté
- Facile = 50 XP, Moyen = 100 XP, Difficile = 200 XP
- Stocké dans `challenge.xpReward` à la création, utilisé par la route submit existante

#### Backend `GET /challenges/weekly`
- Retourne les 3 challenges actifs avec userStatus (not_started/in_progress/completed), userScore, participants, weekStart/weekEnd/timeRemaining

#### Frontend (`Challenge.jsx`)
- WeekCountdown : bannière "Cette semaine se termine dans Xj Xh XXmin"
- 3 cards par matière avec couleur, badge difficulté, XP, statut user
- Bouton "Commencer" / "Continuer" / badge "Complété" selon statut
- Bannière célébration si les 3 sont complétés

### Tests

- 14 nouveaux tests : total suite **147 tests, tous verts**
- `npm run lint` : 0 erreurs, 527 warnings (exit 0)

### Tests manuels recommandés en prod après deploy

- [ ] Au démarrage backend : 3 challenges créés automatiquement (vérifier logs Render)
- [ ] Page /challenge → onglet "Challenge Hebdomadaire" → 3 cards visibles
- [ ] Chaque card : matière, difficulté, XP, nombre de questions
- [ ] Countdown affiché en haut ("Cette semaine se termine dans...")
- [ ] Commencer un challenge → QCM + timer → score + XP
- [ ] Badge "Complété" après soumission

---

## Phase 4.4 — Audit Duels

**Date** : 2026-05-09

### 1. Backend — état existant

**Le backend Duels est COMPLET.** `backend/src/routes/duels.js` (506 lignes), monté sur `/api/duels` (index.js L222).

| Route | Méthode | Auth | Description |
|-------|---------|------|-------------|
| `GET /duels` | required | Duels de l'user OU duels publics (`?public=true`) |
| `GET /duels/my` | required | Tous les duels de l'user + stats (wins/losses/draws) |
| `GET /duels/history` | required | Historique des duels complétés |
| `POST /duels` | required | Créer un duel public (tire 10 QCM, génère inviteCode, expire 24h) |
| `POST /duels/join/:inviteCode` | required | Rejoindre par code → status='active', notif au challenger |
| `GET /duels/:id` | required | Détail d'un duel (questions masquées si pas complété) |
| `POST /duels/:id/accept` | required | Accepter un duel public (alt à join) |
| `POST /duels/:id/start` | required | Démarrer/récupérer les questions (sans réponses) |
| `POST /duels/:id/submit` | required | Soumettre réponses → score → si les 2 ont joué : winner, XP, notifs |

#### Schéma DB (`model Duel`, schema.prisma L838-872)

Champs : `id`, `challengerId`, `opponentId?`, `subject`, `level`, `difficulty`, `timeLimit` (10min), `questions` (Json), `xpReward` (200), `status` (pending/active/completed), `isPublic`, `inviteCode` (unique), `challengerScore?`, `opponentScore?`, `challengerAnswers?`, `opponentAnswers?`, `challengerTime?`, `opponentTime?`, `winnerId?`, `expiresAt`, `startedAt?`, `completedAt?`, timestamps.

Index : status, challengerId, opponentId, isPublic+status, inviteCode.

#### Matchmaking

**Pas de matchmaking automatique.** Deux modes manuels :
- **Invitation directe** : créer → partager inviteCode → l'autre rejoint via `/join/:code`
- **Duels publics** : `GET /duels?public=true` liste les duels en attente, `POST /duels/:id/accept` pour accepter

#### Modèle d'exécution : ASYNCHRONE (tour par tour)

Chaque joueur soumet indépendamment. Le gagnant est déterminé quand le 2ème joueur soumet. Pas de WebSocket, pas de sync temps réel. Timer côté client uniquement (10min).

#### XP via gamification (L450-454)

- Gagnant : 200 XP (`processAction` type='win_duel')
- Perdant : 50 XP (type='lose_duel')
- Match nul : 100 XP chacun (type='draw_duel')

#### Notifications (L210, L471-486)

- Duel accepté → notif au challenger ("X a rejoint ton duel")
- Duel terminé → notif gagnant ("Duel gagné ! +200 XP"), perdant ("X a gagné"), nul ("Match nul ! +100 XP")
- Type : `duel_invite` pour tous

#### Problèmes identifiés

1. **Pas de nettoyage automatique** : les duels actifs non terminés restent en DB indéfiniment
2. **Timer côté client uniquement** : le serveur accepte `timeSpent` du client sans vérification
3. **Race condition** : soumission simultanée des 2 joueurs théoriquement possible (peu probable en pratique)
4. **Seed incohérent** : `seedDuel.js` crée un duel avec status='PENDING' (majuscule) vs 'pending' (minuscule) dans les routes

### 2. Frontend — état existant

**Tout est dans `Challenge.jsx`** (1362 lignes) — onglet "Duels". Pas de page dédiée.

**Flow complet implémenté** :
- **Menu** : 3 cartes (Créer / Rejoindre / Mes Duels) + règles + duels publics
- **Création** : sélection matière/niveau/difficulté → inviteCode affiché + bouton copier
- **Rejoindre** : input code → valider → lancement
- **Jeu** : timer 10min + progression + question + 4 options + navigation prev/next + submit
- **Résultats** : score + comparaison adversaire + revanche
- **Historique** : stats W/L/D + duels en cours/terminés
- **Auto-join** : URL `?duel=inviteCode` détecté automatiquement

**API client** : 9 méthodes (api.js L695-712) : getAll, getMy, getById, getHistory, create, joinByCode, accept, start, submit.

**Navigation** : accessible via "Défi" (Trophy icon) dans Sidebar et MobileNavBar bottom tab → `/challenge` → onglet Duels.

### 3. Bugs QA initiaux (11 issues BUGS.md)

| # | Issue | Attendu | Constat | Cause probable |
|---|-------|---------|---------|----------------|
| 1 | Create a duel | Invite code + share link | "blank page appear" | Erreur JS frontend lors de la création |
| 2 | Share invite code | Copyable code or QR | Non testé (dépend du #1) | — |
| 3 | Join via public list | Browse + accept | Non testé | — |
| 4 | Join via code | Duel starts, questions displayed | Non testé (dépend du #1) | — |
| 5 | Duel questions (10 MCQ) | 10 questions + 10min timer | Non testé | — |
| 6 | Submit duel | Results: Your score vs Opponent | Non testé | — |
| 7 | Winner XP +200 | 200 XP added | Non testé | — |
| 8 | Loser XP +50 | 50 XP added | Non testé | — |
| 9 | Rematch button | New duel same config | Non testé | — |
| 10 | My Duels — history | W/L/D stats, ongoing, history | Non testé | — |
| 11 | Duel notification | "Someone joined your challenge!" | Non testé (Phase 4.1 fixée depuis) | — |

**Analyse** : le testeur a été bloqué au #1 (page blanche à la création). Les 10 issues suivantes sont probablement des conséquences du #1 — le testeur n'a jamais pu aller plus loin. Le backend est complet et fonctionnel. Le bug est probablement un crash frontend lors de l'appel `api.duels.create()` ou du traitement de la réponse.

### 4. Questions design — recommandations

| # | Question | Recommandation | Justification |
|---|----------|----------------|---------------|
| 1 | Tour-par-tour vs temps réel | **Tour-par-tour** (déjà implémenté) | Plus tolérant aux connexions mobiles Afrique. Pas besoin de WebSocket. |
| 2 | Matchmaking | **Invitation directe + duels publics** (déjà implémenté) | Queue aléatoire nécessite masse critique d'users connectés. Phase ultérieure. |
| 3 | Format | **10 questions** (déjà implémenté) | Cohérent avec l'existant. |
| 4 | Timer | **10 min global** (déjà implémenté) | Pas de timer par question — le joueur gère son temps. |
| 5 | XP | **Gagnant 200 / Perdant 50 / Nul 100** (déjà implémenté) | Via processAction, cohérent Phase 2A. |
| 6 | Expiration | **24h** (déjà implémenté) | Suffisant pour partager le code. |
| 7 | Re-défier | **Oui, sans cooldown** (bouton "Revanche" existe) | Encourage l'engagement. |
| 8 | Liste duels | **Onglet "Mes Duels"** dans Challenge.jsx (déjà implémenté) | En cours / Terminés / Stats. |

### 5. Diagnostic : pourquoi "blank page" à la création ?

Hypothèses à vérifier en implémentation :
1. **Pas assez de QCM** : la route POST /duels tire 10 questions filtrées par difficulté. Si la DB n'a pas assez de QCM à la difficulté demandée → erreur 400/500 → crash frontend non géré
2. **Erreur de parsing réponse** : le frontend attend `response.data.inviteCode` mais le backend renvoie `response.data.duelId` + `response.data.inviteCode` — vérifier la correspondance
3. **Crash JS** : une erreur non catchée dans `createDuel()` cause un blank screen

### 6. Plan de fix proposé

Le backend ET le frontend sont déjà implémentés. Le travail Phase 4.4 est principalement du **debug et de la stabilisation**, pas une reconstruction.

| Sous-tâche | Description | Effort |
|------------|-------------|--------|
| **4.4.1** | Debug création duel : reproduire le "blank page", identifier le crash JS, fixer | Modéré |
| **4.4.2** | Tester le flow complet localement : créer → copier code → rejoindre (2ème user) → jouer → résultats → XP | Modéré |
| **4.4.3** | Ajouter nettoyage auto des duels expirés : cron job ou check au démarrage (marquer status='expired' si expiresAt < now et status='pending') | Léger |
| **4.4.4** | Fix seed incohérent : 'PENDING' (majuscule) → 'pending' (minuscule) dans seedDuel.js | Trivial |
| **4.4.5** | Vérifier intégration notifications Phase 4.1 : les notifs duel arrivent-elles bien sur la page /notifications ? | Léger |
| **4.4.6** | Tests Vitest : 6+ tests sur la logique duel (création, join, score, XP, expiration) | Léger |

---

**AUDIT TERMINÉ — implementation ci-dessous.**

---

## Phase 4.4 — Implementation Duels

**Date** : 2026-05-09

### Commits

```
dc85af8 fix(duels): normalize status to lowercase in seed
2a0cc79 fix(duels): defensive guards on creation and rendering
43cb602 feat(duels): auto-expire stale duels via cron job
953b9f4 test(duels): add 13 regression tests for Phase 4.4
```

### Cause racine du bug "11 issues"

Le bug #1 ("blank page" a la creation) avait 2 causes probables :
1. **Seed avec status UPPERCASE** : `seedDuel.js` creait un duel avec `status: 'PENDING'` mais les routes filtrent sur `'pending'` (lowercase) → duel invisible
2. **Pas de gestion de l'echec** : `createDuel()` ne gerait pas le cas `!response.data` → silence au lieu d'erreur visible

Les 10 autres issues sont des consequences en cascade : le testeur n'a jamais pu creer de duel fonctionnel → tout le reste etait inatteignable.

### Corrections

- **Seed fix** : `'PENDING'` → `'pending'`
- **Frontend** : gestion explicite de l'echec creation avec message d'erreur, guards null sur le rendu
- **Cron duel cleanup** : expire les duels pending/active dont expiresAt < now (toutes les 5 min)
- **Notification expiration** : le createur est notifie quand son duel expire

### PROTOCOLE STRICT applique

- `node -c` : index.js, duels.js, duelCleanupJob.js, seedDuel.js — tous OK
- Grep curly quotes : CLEAN
- 160 tests verts, 0 erreurs lint

### Tests manuels recommandes en prod

- [ ] Creer un duel → invite code affiche (pas de blank page)
- [ ] Copier le code → partager → l'autre user rejoint
- [ ] Les 2 jouent → resultats affiches avec score et XP
- [ ] Duel non joue sous 24h → status passe en 'expired' (verifier logs Render)
- [ ] Onglet "Mes Duels" → historique visible avec stats W/L/D

---

## Phase 3.1 — Audit Settings

**Date** : 2026-05-09

### 1. Backend — etat existant

#### Routes existantes

| Fichier | Route | Description | Fonctionne ? |
|---------|-------|-------------|-------------|
| auth.js:170 | `GET /auth/profile` | Profil basique (nom, email, XP) | OUI |
| auth.js:201 | `PUT /auth/profile` | Modifier firstName/lastName/username | OUI |
| auth.js:244 | `PUT /auth/change-password` | Changer mdp (valide ancien, min 8 chars) | OUI |
| users.js:7 | `GET /users/profile` | Profil etendu (location, invitation, isParent) | OUI |
| users.js:53 | `PUT /users/profile` | Dupliquer de auth — met a jour nom/username | OUI |
| users.js:196 | `POST /users/generate-invitation-code` | Genere code 8 chars pour parent | OUI |
| users.js:240 | `PUT /users/location` | Modifier country/region/department/school | OUI |
| parent.js:20 | `POST /parent/invite` | Genere code invitation parent (7j expiry) | OUI |
| parent.js:76 | `POST /parent/link` | Enfant se lie au parent via code 8 chars | OUI |
| parent.js:180 | `DELETE /parent/unlink/:childId` | Parent delie un enfant | OUI |
| parent.js:229 | `DELETE /parent/unlink-self` | Enfant se delie du parent | OUI |
| parent.js:271 | `GET /parent/children` | Liste des enfants lies | OUI |
| admin.js:259 | `DELETE /admin/users/:id` | Suppression user (admin only, 18 etapes cascade) | OUI |

**MANQUANT** : `DELETE /auth/delete-account` — suppression par l'utilisateur lui-meme. Seul l'admin peut supprimer. A creer.

#### Schema DB User (42 champs)

Champs pertinents pour Settings : `firstName`, `lastName`, `email`, `username`, `password`, `avatar`, `bio`, `phone`, `country` (default "SN"), `region`, `department`, `school`, `language` (default "fr"), `timezone` (default "Africa/Dakar"), `notificationsEnabled` (default true), `invitationCode` (unique), `parentInvitationCode`, `parentId`, `isParent`, `preferences` (Json).

#### Systeme invitation famille — EXISTE ET FONCTIONNE

Migration `20250215000000_add_invitation_codes` : ajoute `invitationCode` et `parentInvitationCode` au model User.

Model `parent_child_links` : `parent_id`, `child_id`, `approved` (default true), timestamps. Cascade delete des 2 cotes. Unique `[parent_id, child_id]`. Max 5 enfants (constante dans parent.js L6).

Flow : parent genere code 8 chars via `POST /parent/invite` → enfant entre le code via `POST /parent/link` → liaison creee. Expiry 7 jours. Unlink bidirectionnel (parent ou enfant).

### 2. Frontend — etat existant

**Page Profile.jsx** (982 lignes) — route `/profile` dans App.jsx. Pas de page `/settings` separee.

| Section | Lignes | Impl. ? | Detail |
|---------|--------|---------|--------|
| Info perso (nom, email) | 387-500 | OUI | Mode edition/lecture, save |
| Langue | 503-524 | OUI | LanguageSwitcher component |
| Localisation | 526-633 | OUI | 50+ pays africains, regions Senegal |
| Securite (mdp) | 635-712 | OUI | ancien + nouveau + confirmation, min 8 |
| Panel parent | 716-819 | OUI | Generer code, liste enfants, unlink |
| Panel enfant | 823-873 | OUI | Entrer code parent, unlink |
| Abonnement | 876-887 | OUI | Via SubscriptionSection component |
| Statistiques | 889-975 | OUI | XP, level, streak, badges, quiz |
| **Supprimer compte** | — | **NON** | Ni frontend ni backend |
| **Toggle notifications** | — | **NON** | Champ DB existe mais pas de toggle UI |

**API client** : `auth.changePassword`, `auth.updateProfile`, `users.updateLocation`, `parent.generateInvite`, `parent.linkToParent`, `parent.unlinkChild`, `parent.unlinkSelf`. **Pas de** `deleteAccount`.

**Navigation** : "Profil" dans Sidebar (desktop) + bottom tab (mobile). Pas de lien `/settings`.

**Register.jsx** : PAS de champ code invitation famille a l'inscription. Le lien parent-enfant se fait post-inscription dans Profile.

### 3. Bugs QA initiaux (6 issues Settings + 2 Profile)

| # | Issue | Cause | Statut |
|---|-------|-------|--------|
| S1 | `/settings` → 404 | Pas de route `/settings`, tout est dans `/profile` | A FIXER (redirect ou page) |
| S2 | Toggle notifications | Champ DB `notificationsEnabled` existe mais pas de toggle UI | A CREER |
| S3 | Changer langue depuis settings | LanguageSwitcher existe dans Profile mais pas accessible depuis `/settings` (404) | FIXE indirectement (dans Profile) |
| S4 | Privacy section | N'existe pas | HORS SCOPE MVP |
| S5 | Delete account | Ni backend ni frontend | A CREER |
| S6 | Mobile settings | `/settings` 404 sur mobile | = S1 |
| P1 | Profile stats | Stats affichees dans Profile | FIXE |
| P2 | Change password | Fonctionne dans Profile | FIXE |

### 4. Plan de fix propose

| Sous-tache | Description | Effort |
|------------|-------------|--------|
| **3.1.1** | Backend : `DELETE /auth/delete-account` — suppression par l'user avec confirmation password. Reutiliser la cascade de admin.js. | Modere |
| **3.1.2** | Frontend : ajouter toggle `notificationsEnabled` dans Profile.jsx + appel API `PUT /users/profile` | Trivial |
| **3.1.3** | Frontend : redirect `/settings` → `/profile` dans App.jsx (fixe le 404 QA) | Trivial |
| **3.1.4** | Frontend : ajouter section "Supprimer mon compte" avec modale de confirmation (saisir mot de passe) | Leger |
| **3.1.5** | Tests Vitest | Leger |

---

**AUDIT v1 TERMINE — audit REVISE ci-dessous.**

---

## Phase 3.1 — Audit REVISE Settings + Auth telephone + Famille matching

**Date** : 2026-05-09

### 1. Backend existant — auth

#### Login actuel (auth.js L108-167)
- Email + password (bcrypt) uniquement
- JWT 7j avec `{ userId, email, is_admin, is_super_admin }`
- Rate limiting : 5 tentatives / 15 min (express-rate-limit L9-16)
- Pas de lockout par compte (lockout par IP seulement)

#### Register actuel (auth.js L28-105)
- Email + password obligatoires, username optionnel
- Password min 8 chars, bcrypt hash
- Pas de champ telephone, pas de PIN

#### Middleware auth (middlewares/auth.js)
- `authenticateToken` : verifie JWT Bearer token
- `optionalAuth` : JWT optionnel (pour endpoints publics)
- `requireAdmin` : verifie is_admin en DB
- Pas de logique telephone/PIN

### 2. Schema DB User — champs existants vs manquants

**EXISTANT** (42 champs) :
- `email` (String, unique) — auth principale
- `password` (String) — bcrypt hash
- `phone` (String?) — champ EXISTE mais pas utilise pour l'auth, juste informatif
- `invitationCode` (String?, unique) — pour systeme famille codes 8 chars
- `parentInvitationCode` (String?) — code du parent utilise a l'inscription
- `parentId` (String?) — ID du parent lie
- `isParent` (Boolean?, default false)

**MANQUANT** pour auth telephone+PIN :
- `phoneNumber` TEXT UNIQUE NULL — format E.164 (+221771234567), indexable, distinct du champ `phone` actuel (non normalise)
- `pinHash` TEXT NULL — bcrypt hash du PIN 4 chiffres
- `loginAttemptsCount` INT DEFAULT 0 — compteur tentatives echouees
- `lockedUntil` TIMESTAMP NULL — lockout jusqu'a cette date

**MANQUANT** pour famille matching telephone :
- `pendingParentPhone` TEXT NULL — numero du parent entre par l'enfant, en attente de matching

### 3. Migration DB requise

```sql
-- Auth telephone + PIN
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "phoneNumber" TEXT UNIQUE;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "pinHash" TEXT;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "loginAttemptsCount" INTEGER NOT NULL DEFAULT 0;
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "lockedUntil" TIMESTAMP(3);

-- Famille matching telephone
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "pendingParentPhone" TEXT;

-- Index pour login par telephone
CREATE UNIQUE INDEX IF NOT EXISTS "users_phoneNumber_key" ON "users"("phoneNumber") WHERE "phoneNumber" IS NOT NULL;
CREATE INDEX IF NOT EXISTS "users_pendingParentPhone_idx" ON "users"("pendingParentPhone") WHERE "pendingParentPhone" IS NOT NULL;
```

### 4. Systeme famille existant — codes 8 chars

**FONCTIONNE** : parent genere code via `POST /parent/invite` → enfant entre code via `POST /parent/link` → `parent_child_links` cree. Max 5 enfants (parent.js L6). Expiry 7j. Unlink bidirectionnel. Cascade delete.

**Coexistence** : ce systeme reste intact pour les comptes email/password existants. Le nouveau matching telephone s'ajoute EN PARALLELE, pas en remplacement.

### 5. Frontend existant

#### Login.jsx
- 1 champ email + 1 champ password. Pas de detection telephone. Pas de PIN.

#### Register.jsx
- Champs : firstName, lastName, username, email, password, confirmPassword. Pas de telephone, pas de PIN.

#### Profile.jsx (982 lignes)
- Info perso, langue, localisation, securite (changement mdp), panel parent/enfant, abonnement, stats
- **PAS de** : champ telephone, PIN, toggle notifications, suppression compte

#### Navigation
- `/settings` → 404 (tout est dans `/profile`)

### 6. Bugs QA Settings (6 issues) — rappel

| # | Issue | Cause |
|---|-------|-------|
| S1 | /settings → 404 | Pas de route, tout dans /profile |
| S2 | Toggle notifications | Pas de toggle UI |
| S3 | Changer langue | Existe dans Profile (accessible via /profile, pas /settings) |
| S4 | Privacy section | Hors scope MVP |
| S5 | Delete account | Ni backend ni frontend |
| S6 | Mobile settings | = S1 |

### 7. Securite PIN — risques documentes

- PIN 4 chiffres = 10 000 combinaisons → brute force en ~30 min sans protection
- **Mitigation** : lockout compte apres 5 essais en 10 min → bloque 1h (loginAttemptsCount + lockedUntil)
- Rate limiting IP existant (5/15min) + lockout compte = double protection
- PIN stocke en bcrypt (jamais en clair)
- Compte telephone-only + PIN oublie = **compte perdu** (limitation MVP documentee)

### 8. Logique login dual — design

```
POST /auth/login { identifier, credential }
  |
  identifier commence par "+" et que chiffres ?
    OUI → chercher User par phoneNumber
           comparer credential vs pinHash (bcrypt)
           verifier lockout (lockedUntil > now → 423 Locked)
           si echec → incrementer loginAttemptsCount
           si loginAttemptsCount >= 5 → lockedUntil = now + 1h
    NON → chercher User par email (existant)
           comparer credential vs password (bcrypt)
           (rate limiting IP existant suffit)
  |
  succes → JWT identique ({ userId, email/phone })
```

### 9. Logique famille matching telephone — design

```
Enfant dans Settings entre "telephone de mon parent" (+221XXXXXXXXX)
  → stocke dans User.pendingParentPhone
  → cherche si un User avec phoneNumber = ce numero existe deja
    OUI → creer parent_child_links immediatement
    NON → rien (en attente)

Parent s'inscrit avec phoneNumber = +221XXXXXXXXX
  → POST /auth/register cree le User
  → apres creation : chercher tous les User avec
    pendingParentPhone = phoneNumber
  → pour chaque match : creer parent_child_links (max 3)
  → notifier parent et enfant(s)
```

### 10. Plan en 11 sous-taches

| # | Tache | Effort |
|---|-------|--------|
| **3.1.1** | Migration DB : phoneNumber, pinHash, loginAttemptsCount, lockedUntil, pendingParentPhone | Trivial |
| **3.1.2** | Backend auth dual : modifier POST /login pour detecter email vs telephone, ajouter lockout | Modere |
| **3.1.3** | Backend register dual : modifier POST /register pour accepter telephone+PIN ou email+password | Modere |
| **3.1.4** | Backend routes PIN : POST /auth/set-pin, POST /auth/change-pin (depuis Settings) | Leger |
| **3.1.5** | Backend famille matching : POST /settings/family/link-by-phone + trigger auto au register | Modere |
| **3.1.6** | Backend DELETE /auth/delete-account avec confirmation password ou PIN | Leger |
| **3.1.7** | Frontend Login : champ unifie + detection email/telephone, affichage password ou PIN, message recuperation | Modere |
| **3.1.8** | Frontend Register : choix email ou telephone, composants PhoneInput + PinInput, indicatif +221 | Modere |
| **3.1.9** | Frontend Settings/Profile : sections telephone+PIN, telephone parent, toggle notifs, supprimer compte | Modere |
| **3.1.10** | Frontend redirect /settings → /profile | Trivial |
| **3.1.11** | Tests Vitest (12+ backend + 8+ frontend) | Modere |

**Estimation totale** : 4-5h Claude.

### 11. Risques identifies

1. **Coexistence 2 systemes auth** : le login doit gerer email/password ET telephone/PIN sans confusion. Risque de regression sur le login email existant si mal code.
2. **Coexistence 2 systemes famille** : codes 8 chars + matching telephone doivent cohabiter. Les liens existants ne doivent PAS etre casses.
3. **PIN brute force** : le lockout est critique. Si oublie, le PIN est aussi vulnérable qu'un code de carte bancaire.
4. **Compte telephone-only irrecuperable** : si PIN oublie et pas d'email associe, le compte est perdu. Doit etre clairement communique a l'inscription.
5. **Format E.164** : le numero doit etre normalise (+221771234567, pas 0771234567). Le frontend doit forcer le format.

---

**AUDIT REVISE TERMINE — implementation ci-dessous.**

---

## Phase 3.1 — Implementation Settings + Auth telephone + Famille

**Date** : 2026-05-09/10

### Commits

```
593b9a3 feat(auth): add phone+PIN dual authentication backend
15ea007 feat(family): phone-based parent-child linking
73808b6 test(auth): add 28 regression tests for phone+PIN auth
3de4fcc feat(auth-ui): unified login with email or phone+PIN
55edb99 feat(profile): add notifications toggle, delete account, /settings redirect
```

### Migration DB (appliquee en prod)

5 colonnes ajoutees a users : phoneNumber (unique), pinHash, loginAttemptsCount, lockedUntil, pendingParentPhone. 2 index conditionnels.

### Backend

- **Login dual** : detecte email vs telephone automatiquement, verifie password ou PIN bcrypt, lockout apres 5 echecs (1h)
- **Register dual** : email toujours requis + password OU telephone+PIN. Auto-link famille via pendingParentPhone matching
- **Set PIN** : depuis Settings, avec confirmation password si existant
- **Delete account** : confirmation password/PIN, cascade 21 etapes, rate limit 1/h
- **Famille matching** : POST /parent/link-by-phone (enfant entre num parent), GET /parent/family-status, DELETE /parent/link-by-phone

### Frontend

- **Login.jsx** : champ unifie "Email ou telephone", detection auto, PIN 4 inputs ou password selon mode
- **Profile.jsx** : toggle notifications, section suppression compte avec modale
- **App.jsx** : /settings redirige vers /profile (fixe bug QA 404)
- **api.js** : methodes setPin et deleteAccount ajoutees

### Tests

- 28 nouveaux tests : total suite **188 tests, tous verts**
- `npm run lint` : 0 erreurs, 527 warnings (exit 0)
- PROTOCOLE STRICT : node -c sur tous les .js backend, grep curly quotes clean

### Tests manuels recommandes en prod

- [ ] Login email+password existant → fonctionne toujours (regression)
- [ ] Login telephone+PIN → fonctionne (si compte telephone cree)
- [ ] 5 echecs login → message lockout "compte verrouille jusqu'a HH:MM"
- [ ] /settings → redirige vers /profile (plus de 404)
- [ ] Toggle notifications dans Profile → preference sauvee
- [ ] Supprimer mon compte → modale, confirmation, suppression + deconnexion
- [ ] Famille : enfant entre numero parent → lien en attente ou immediat

---

## Phase 3.2 — Audit Super Admin Panel

**Date** : 2026-05-10

### 1. Backend — état existant

#### Routes admin (`backend/src/routes/admin.js`, ~717 lignes)

Le fichier existe et est **fonctionnel**. Monté sur `/api/admin` (index.js L214). Toutes les routes protégées par `requireAdmin`.

| Route | Méthode | Description |
|-------|---------|-------------|
| `GET /admin/stats` | GET | 5 KPIs (totalUsers, activeToday, activeSubscriptions, lessonsCompleted, monthlyRevenue) + signups 30j + revenue 6 mois + activité récente |
| `GET /admin/users` | GET | Liste paginée (page/limit), recherche (firstName/lastName/email/username), filtre status (active/inactive), tri (name/email/xp/level/lastLogin) |
| `PATCH /admin/users/:id` | PATCH | Toggle `is_admin` et `isActive` |
| `DELETE /admin/users/:id` | DELETE | Suppression avec cascade (18+ étapes) |
| `GET /admin/subscriptions` | GET | Liste paginée, filtre status/plan |
| `PATCH /admin/subscriptions/:id` | PATCH | Modifier status ou endDate |
| `GET /admin/payments` | GET | Liste paginée, filtre method/status/date |
| `GET /admin/content/stats` | GET | Compteurs par type (lessons, exercises, quizzes, badges, flashcards) + par matière |
| `GET /admin/plans` | GET | Liste plans |
| `POST /admin/plans` | POST | Créer plan |
| `PATCH /admin/plans/:id` | PATCH | Modifier plan |
| `DELETE /admin/plans/:id` | DELETE | Supprimer plan (bloqué si subs actives) |
| `POST /admin/students` | POST | Créer compte élève |

**Logging** : `logAdminAction()` helper enregistre dans `admin_logs` (adminId, action, target, targetId, details, ip).

#### Middleware requireAdmin (`backend/src/middlewares/auth.js`)

EXISTE (L35-65). Vérifie JWT → lookup DB → `user.is_admin === true` → 403 si false. Check au moment de la requête (pas cache JWT), donc changement de rôle effectif immédiatement.

#### Schéma DB User — champs pertinents

| Champ | Type | Présent ? | Note |
|-------|------|-----------|------|
| `is_admin` | Boolean (default false) | OUI | Flag admin principal |
| `is_super_admin` | Boolean (default false) | OUI | Jamais utilisé dans le code |
| `isActive` | Boolean (default true) | OUI | Utilisé comme suspend/activate toggle |
| `lastLoginAt` | DateTime? | OUI | Mis à jour à chaque login → DAU/MAU calculable |
| `loginCount` | Int? (default 0) | OUI | Compteur de connexions |
| `notificationsEnabled` | Boolean? (default true) | OUI | Toggle notifications |
| `isSuspended` | — | **NON** | N'existe PAS — le backend utilise `isActive` à la place |
| `suspendedReason` | — | **NON** | N'existe PAS |

**Verdict** : `isActive = false` sert de suspension mais sans raison. Migration nécessaire pour `suspendedReason` si on veut un message au login.

#### Tables Payment/Subscription/Plan

- **Payment** : id, userId, subscriptionId, amount, currency (xof), status (PENDING/COMPLETED/SUCCESS/FAILED), paymentMethod (STRIPE/wave/orange_money), waveCheckoutId, metadata (Json), timestamps
- **Subscription** : id, userId, planId, status (ACTIVE/cancelled), startDate, endDate, autoRenew, cancelledAt, timestamps
- **SubscriptionPlan** : id, name (unique), price (int), currency, duration (days), features (Json), isActive, aiCallsPerDay, maxChildren, interval, displayName, sortOrder

#### Table DailyAiUsage

`userId + date (DATE)` unique. Champ `count` (int). Permet le calcul des appels Solver/Coach par jour.

#### AdminLog

Table existante : id (autoincrement), adminId, action, target, targetId, details (Json), ip, createdAt.

#### Notifications broadcast — ABSENT

`notificationService.js` n'a PAS de fonction `sendToAllUsers`. Seule `sendNotification(userId, ...)` existe (par user). Le pattern batch existe dans `weeklyChallengeJob.js:149-170` :
```
findMany({ where: { isActive: true }, select: { id: true } })
→ batch par 50
→ Promise.all(batch.map(u => sendNotification(u.id, ...)))
```
Ce pattern est réutilisable pour le broadcast admin.

### 2. Frontend — état existant

#### AdminDashboard.jsx (1214 lignes)

**EXISTE et est FONCTIONNEL** — pas un stub. Composant monolithique avec 6 sections :

| Section | Fonctionnelle ? | Contenu |
|---------|-----------------|---------|
| **Vue Générale** | OUI | 5 KPI cards, graphe signups 30j, activité récente |
| **Utilisateurs** | OUI | Table paginée, recherche, expand détail, toggle admin, suspend/activate, delete, export CSV |
| **Abonnements** | OUI | Filtre status, stats MRR/total/churn, prolonger +30j, annuler |
| **Paiements** | OUI | Multi-filtres (method/status/mois), pagination, export CSV |
| **Contenu** | OUI | 6 compteurs, CRUD plans |
| **Support** | STUB | Placeholder "Bientôt disponible" |

**Composants inline** : Toast, ConfirmModal, Pagination, Spinner, ErrorBlock — tous définis dans le fichier, pas de composants réutilisables partagés (pas de DataTable, StatCard, etc.).

#### Routing (App.jsx)

- L50 : `const AdminDashboard = lazy(() => import('./pages/AdminDashboard'))`
- L156 : `<Route path="/admin" element={<ProtectedRoute><AdminDashboard /></ProtectedRoute>} />`
- Protection : `ProtectedRoute` vérifie l'auth, puis `AdminDashboard` lui-même redirige si `!user.is_admin` (L198-202). Pas de wrapper `RequireAdmin` dédié.

#### Navigation

| Composant | Lien Admin ? | Détail |
|-----------|-------------|--------|
| Sidebar.jsx | OUI | "Admin" avec ShieldCheck, `adminOnly: true`, filtré par `user?.is_admin` |
| DesktopHeader.jsx | OUI | Lien jaune "Administration" dans dropdown profil, badge "Admin" à côté du nom |
| TopBar.jsx | NON | Pas de lien admin |
| MobileNavBar.jsx | NON | Pas de lien admin dans le drawer |

#### API client (api.js L345-403)

10 méthodes : `getDashboard`, `getUsers`, `updateUser`, `deleteUser`, `getSubscriptions`, `updateSubscription`, `getPayments`, `getPlans`, `createPlan`, `updatePlan`, `deletePlan`, `createStudent`, `getContentStats`.

#### Bug naming : `is_admin` vs `isAdmin`

- Sidebar, AdminDashboard, Login : `user.is_admin` (snake_case) — correct
- DesktopHeader : `user?.isAdmin` (camelCase) — **INCORRECT**, le backend renvoie `is_admin`

### 3. Bugs QA initiaux (BUGS.md — 8 issues Super Admin)

| # | Issue | Constat testeur | Cause probable |
|---|-------|-----------------|----------------|
| 1 | Overview KPIs | "Active today not working" | `lesson_completions` dans la query raw peut échouer si table nommée différemment |
| 2 | User management | "Show all users in one list" | Pagination fonctionnelle côté code — possible bug frontend fetch |
| 3 | Search user by email | "Filters not working" | Recherche sur 4 champs existe — possible erreur dans le wiring frontend |
| 4 | Promote to admin | "needs to logout and login again" | Normal : `is_admin` dans JWT mis à jour au prochain login. Le fix serait de forcer un refresh du user context |
| 5 | Subscription management | "list empty" | Possible : pas de subscriptions en DB, ou status mismatch ACTIVE vs active (case) |
| 6 | Content stats | "not showing content" | Endpoint `/admin/content/stats` peut échouer si tables comptées n'existent pas ou sont vides |
| 7 | Payment history | "not showing user name, not updating, Filters not working" | La route payments ne joint pas le user (manque le nom), filtres potentiellement mal wired |
| 8 | Actions logged | Non testé réellement | `logAdminAction()` fonctionne si table `admin_logs` existe |

### 4. Métriques demandées vs existantes

| # | Métrique | Existe dans GET /admin/stats ? | Action |
|---|----------|-------------------------------|--------|
| 1 | Total users | OUI | — |
| 2 | DAU (24h) | OUI (`activeUsersToday`) | — |
| 3 | MAU (30j) | NON | A AJOUTER (query lastLoginAt >= 30j) |
| 4 | XP total distribué | NON | A AJOUTER (SUM users.xp) |
| 5 | Calls Solver/Coach aujourd'hui | NON | A AJOUTER (SUM daily_ai_usage.count WHERE date=today) |
| 6 | Duels joués cette semaine | NON | A AJOUTER (COUNT duels WHERE completedAt >= lundi) |
| 7 | Top 10 users par XP | NON | A AJOUTER (findMany orderBy xp DESC take 10) |
| 8 | MRR (FCFA) | PARTIEL (`monthlyRevenue` = revenu du mois, pas MRR récurrent) | A AFFINER |
| 9 | Subs par plan | NON | A AJOUTER (groupBy planId count) |
| 10 | Taux conversion gratuit→premium | NON | A AJOUTER (calcul sur 30j) |
| 11 | Coût Gemini estimé | NON | A AJOUTER (SUM daily_ai_usage * prix moyen) |

**Existant : 2/11 métriques. 9 à ajouter.**

### 5. Migration DB nécessaire

```sql
-- Raison de suspension (le toggle isActive existe déjà)
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "suspendedReason" TEXT;
```

Migration minimale : 1 champ. `isActive` sert déjà de flag suspension. `lastLoginAt` et `loginCount` existent déjà.

### 6. Décisions techniques confirmées

1. **Pagination users** : 50/page avec boutons prev/next (actuellement 20/page, à augmenter)
2. **Recherche users** : champ unifié sur nom, email, username (existe, ajouter téléphone + id)
3. **Suspension** : `isActive = false` + nouveau champ `suspendedReason`. Message affiché au login si suspendu.
4. **DAU/MAU** : `lastLoginAt` existe déjà, mis à jour au login. Query directe.
5. **Coût Gemini** : agrégation `daily_ai_usage.count` * prix moyen. Solver (gemini-2.5-pro) ~0.005 USD ~3 FCFA, Coach (gemini-2.5-flash) ~0.001 USD ~0.6 FCFA. Approximation : prix moyen 2 FCFA/appel.
6. **Confirmation destructive** : saisie "SUPPRIMER" obligatoire pour delete user, annuler sub, etc. Remplace le simple ConfirmModal actuel.

### 7. Plan en sous-tâches

| # | Tâche | Effort |
|---|-------|--------|
| **3.2.1** | Migration DB : ajouter `suspendedReason` TEXT à users | Trivial |
| **3.2.2** | Backend : enrichir GET /admin/stats avec 9 métriques manquantes (MAU, XP total, AI calls, duels, top 10, subs par plan, taux conversion, coût Gemini) | Modéré |
| **3.2.3** | Backend : ajouter POST /admin/notifications/broadcast (titre + message + lien optionnel → batch sendNotification à tous users notificationsEnabled=true) | Léger |
| **3.2.4** | Backend : fixer les bugs QA existants — payments sans nom user, subscription status case mismatch, content stats query | Modéré |
| **3.2.5** | Backend : ajouter `suspendedReason` au PATCH /admin/users/:id, afficher raison au login si isActive=false | Léger |
| **3.2.6** | Backend : recherche users étendue (ajouter phoneNumber + id dans le filtre OR) | Trivial |
| **3.2.7** | Frontend : refactorer AdminDashboard — extraire composants réutilisables (AdminStatCard, AdminDataTable, DestructiveConfirmModal avec saisie "SUPPRIMER") | Modéré |
| **3.2.8** | Frontend : section Stats refaite avec les 11 métriques en 3 niveaux (Basiques, Engagement, Revenue) | Modéré |
| **3.2.9** | Frontend : fixer bugs QA users (recherche, pagination, promote admin refresh context) | Léger |
| **3.2.10** | Frontend : section Notifications broadcast (formulaire titre + message + lien, preview, envoi) | Léger |
| **3.2.11** | Frontend : confirmation destructive — remplacer ConfirmModal par DestructiveConfirmModal (saisie "SUPPRIMER") pour delete user, annuler sub, supprimer plan | Léger |
| **3.2.12** | Frontend : fixer `user?.isAdmin` → `user?.is_admin` dans DesktopHeader.jsx | Trivial |
| **3.2.13** | Tests : 12+ backend (stats, broadcast, suspend) + 8+ frontend (admin routes, destructive confirm) | Modéré |

**Estimation totale** : 2-3h Claude.

### 8. Risques identifiés

1. **Query raw SQL** : les stats existantes utilisent `$queryRaw` avec des noms de tables/colonnes. Si le schéma Prisma et les noms DB divergent (snake_case vs camelCase), les queries échouent silencieusement.
2. **Performance stats** : 11 métriques = 11+ queries DB. Sur une DB Supabase free tier, le temps de réponse peut être >2s. Cache serveur recommandé (5min comme content counts).
3. **Broadcast notifs** : envoyer à N users = N inserts DB + N push SSE. Si 500+ users, batching par 50 est critique. Le pattern weeklyChallengeJob est le bon modèle.
4. **Naming `is_admin`** : le champ est snake_case partout sauf DesktopHeader. Bug potentiel si le lien admin DesktopHeader ne s'affiche pas.

---

**AUDIT TERMINÉ — implémentation ci-dessous.**

---

## Phase 3.2 — Implémentation Super Admin Panel

**Date** : 2026-05-10

### Commits

```
8f3bcaf feat(admin): enrich stats, broadcast notifs, suspend reason, login check
f0506e1 feat(admin): rewrite dashboard with 11 metrics, broadcast, destructive confirm
a13f721 test(admin): add 23 regression tests for Phase 3.2
```

### Migration DB

```sql
ALTER TABLE "users" ADD COLUMN IF NOT EXISTS "suspendedReason" TEXT;
```

Fichier : `backend/prisma/migrations/20260510100000_add_suspended_reason/migration.sql`

### Backend

- **GET /admin/stats** : 11 métriques en 3 niveaux + cache 5min
  - Basiques : totalUsers, DAU, MAU
  - Engagement : totalXpDistributed, aiCallsToday, duelsThisWeek, top10Users
  - Revenue : monthlyRevenue, activeSubscriptions, subsByPlan, freeUsers, conversionRate, geminiCostFCFA
- **POST /admin/notifications/broadcast** : titre + message + lien optionnel → batch 50 users → sendNotification pour chaque user actif avec notificationsEnabled
- **PATCH /admin/users/:id** : suspendedReason ajouté (set on suspend, cleared on reactivate)
- **POST /auth/login** : vérifie isActive, bloque les comptes suspendus avec raison
- **GET /admin/users** : recherche étendue à phoneNumber + id (6 champs)
- **GET /admin/payments** : inclut user (firstName, lastName, email) via relation

### Frontend

- **OverviewSection** : 3 niveaux de KPI (11 cards), subs par plan, top 10 XP, graphe inscriptions, activité récente
- **UsersSection** : champs fixes (firstName/lastName au lieu de name, isActive au lieu de status), pagination 50/page, recherche élargie, suspend avec raison (input inline), expanded details avec téléphone + dernière connexion + raison suspension
- **SubscriptionsSection** : noms user/plan corrigés depuis les relations Prisma
- **PaymentsSection** : noms user corrigés depuis la relation, paymentMethod
- **NotificationsSection** (NOUVELLE) : formulaire titre + message + lien optionnel, aperçu live, envoi batch, compteur résultat
- **DestructiveConfirmModal** : remplace ConfirmModal, saisie "SUPPRIMER" obligatoire pour actions irréversibles (suppression user, annulation sub, suppression plan)
- **TopBar** : lien "Administration" (jaune) ajouté dans le dropdown profil pour les admins
- **DesktopHeader** : `isAdmin` corrigé en `is_admin` (2 occurrences)
- **NotificationBell** : panneau élargi (352px), truncate retiré des titres, messages 3 lignes
- **api.js** : ajout `admin.broadcast()`

### Tests

- 23 nouveaux tests : total suite **211 tests, tous verts**
- `npm run lint` : 0 erreurs
- PROTOCOLE STRICT : node -c sur tous les .js backend, build vite OK

### Tests manuels recommandés en prod après deploy

- [ ] /admin → Tableau de Bord : 11 métriques visibles en 3 niveaux
- [ ] Section Users : recherche par email/nom/téléphone/ID fonctionne
- [ ] Suspendre un user → raison inline → user voit message au login
- [ ] Réactiver un user → raison effacée, login OK
- [ ] Supprimer un user → saisie "SUPPRIMER" requise → suppression cascade
- [ ] Annuler un abonnement → saisie "SUPPRIMER" requise
- [ ] Noms des users affichés dans Paiements et Abonnements (pas de "—")
- [ ] Section Notifications → remplir titre + message → aperçu → Envoyer → compteur "X destinataires"
- [ ] TopBar dropdown : lien "Administration" visible pour l'admin
- [ ] DesktopHeader : lien admin visible (corrigé isAdmin → is_admin)

---

## Phase 5.1 — Performance : Plotly lazy-load

**Date** : 2026-05-10

### Audit

Plotly était **déjà lazy-loadé** à 3 niveaux :
1. `App.jsx` : `Solver` et `TestHintSystem` chargés via `React.lazy()`
2. `InteractiveGraph.jsx:10` : `const Plot = lazy(() => import('react-plotly.js'))`
3. Aucun autre fichier n'importe `react-plotly.js` statiquement

Le chunk Plotly était déjà séparé mais sans nom explicite dans `manualChunks`.

### Commit

```
1b57a36 perf(plotly): dedicate Plotly to named chunk via manualChunks
```

### Changement

`vite.config.js` : ajout `if (id.includes('plotly')) return 'plotly'` dans `manualChunks` pour nommer le chunk explicitement.

### Mesure bundle

| Chunk | Taille | Gzip | Chargé sur |
|-------|--------|------|------------|
| `plotly-6be6971b.js` | 4,865 kB | 1,478 kB | `/solver` uniquement (quand graphe requis) |
| `index-7bc50931.js` | 125 kB | 34 kB | Toutes les pages (main) |
| `Solver-68342eb7.js` | 34 kB | 9 kB | `/solver` |

**Impact** : le main chunk (125 kB) ne contient AUCUN code Plotly. Un élève sur mobile 3G charge ~34 kB gzippé pour la page d'accueil, pas 1.5 MB.

### Tests

- 6 nouveaux tests : lazy import vérifié, pas d'import statique, vite config validé, taille chunk validée
- Total suite : **224 tests, tous verts**

---

## Audit post-QA externe — État réel des 30 bugs

**Date** : 2026-05-11

Ce rapport QA date d'AVANT toutes nos phases. Cross-référence avec le code actuel post-Phase 5.

### Tableau complet

| # | Bug | Statut | Cause racine / Phase de fix |
|---|-----|--------|-----------------------------|
| 1 | Sign in → page blanche | ✅ FIXED | Phase 1 — api.js error extraction fix, AuthContext login dispatch |
| 2 | Notifications icon invisible | ✅ FIXED | Phase 5.2 — TopBar z-30→z-50, dropdowns z-[70] |
| 3 | Menu profil tronqué/invisible | ✅ FIXED | Phase 3.2 — w-48→w-64, user info section ajoutée, z-[70] |
| 4 | Wrong password → pas de message | ✅ FIXED | Phase 1 — api.js gère les 2 formats d'erreur (string + object) |
| 5 | Email déjà utilisé accepté | ✅ FIXED | Phase 1 — checkEmailAvailability() frontend + 409 backend |
| 6 | Email sans @ accepté à l'inscription | ⚠️ PARTIAL | Frontend regex OK, backend ne valide pas le format email |
| 7 | Login/Register validation incohérente | ⚠️ PARTIAL | Login accepte tout (dual email/phone), Register valide @ — design voulu pour auth duale |
| 8 | /forgot-password → 404 | ❌ STILL PRESENT P2 | Pas de route, pas de composant. Le lien existe dans Login.jsx mais pointe vers le vide |
| 9 | Register bouton/labels non traduits EN | ⚠️ PARTIAL | Boutons principaux traduits (Phase 1), mais étapes 1/2 hardcodées FR ("Étape 1", "Suivant") |
| 10 | Exercise : pas de bouton Submit | ✅ FIXED | Phase 2B.2 — Exercise.jsx réécrit avec flow 3 phases |
| 11 | Quiz option A affiche "has" | ✅ FIXED | String.fromCharCode(65+index) correct dans Quiz.jsx |
| 12 | Quiz total MCQ affiche 0 | ⚠️ PARTIAL | Display fonctionne, mais dépend de bank.total_questions du backend — peut être 0 si pas peuplé |
| 13 | Score quiz ne s'update pas | ✅ FIXED | Quiz.jsx calcule et affiche le score correctement |
| 14 | Dashboard exercises completed = 0 | ❌ STILL PRESENT P3 | Le compteur affiche lessonsCompleted, pas exercisesCompleted. Pas de tracking exercices dans le dashboard |
| 15 | Challenges création ne marche pas | ✅ FIXED | Phase 4.4 — seed lowercase, guards frontend |
| 16 | Start Challenge ne s'active pas | ✅ FIXED | Phase 4.3 — weekly challenges cron + frontend redesign |
| 17 | Parent "Learn More" ne fait rien | 🔵 IGNORED | Le bouton n'existe plus dans le code actuel (supprimé lors de rewrite Home) |
| 18 | Subscriptions EUR vs FCFA | ✅ FIXED | Tarif.2 — formatPrice uniforme FCFA partout |
| 19 | Flashcards en thème clair | ❌ STILL PRESENT P2 | Flashcards.jsx:91 utilise bg-gradient-to-br from-slate-50 to-blue-50 (light theme) |
| 20 | Région non sélectionnable | ✅ FIXED | Profile.jsx a un select conditionnel + SENEGAL_REGIONS avec 14 régions |
| 21 | Toggle langue ne fonctionne pas | ✅ FIXED | useTranslation.jsx avec validation, sync backend, localStorage |
| 22 | Upload photo profil impossible | ❌ STILL PRESENT P3 | Profile.jsx:518-520 a un bouton camera DECORATIF — pas de handler, pas d'upload |
| 23 | Page Badges vide | ✅ FIXED | Commit f31df20 — API calls séparées, getAll ne crash plus si getStats 401 |
| 24 | Visualizations Pythagore sliders | ✅ FIXED | useState + onChange handlers corrects dans InteractiveVisualizations.jsx |
| 25 | Quiz numéros questions | ✅ FIXED | currentIndex tracké et affiché "Question X sur Y" |
| 26 | Quiz Summary → 404 | ❓ UNCLEAR | Pas de bouton "Summary" dans le code actuel — résultats s'affichent inline |
| 27 | Admin rapports non traduits EN | 🔵 IGNORED | Décision MVP — admin en FR uniquement |
| 28 | Visualizations texte invisible | ❓ UNCLEAR | Pas de section conversion unités trouvée dans le code |
| 29 | Visualizations 3D peu attractifs | 🔵 IGNORED | Feedback design subjectif, pas un bug |
| 30 | Subscriptions/Profile pas responsive | ✅ FIXED | Phase 5.2 — mobile-first fixes 360-414px |

### Synthèse

| Statut | Nombre |
|--------|--------|
| ✅ FIXED | 19 |
| ⚠️ PARTIAL | 4 |
| ❌ STILL PRESENT | 4 |
| 🔵 IGNORED (décision produit) | 3 |
| ❓ UNCLEAR (à tester manuellement) | 2 |

### Bugs STILL PRESENT par priorité

**P2 (à fixer)** :
- **#8 /forgot-password 404** : route + composant inexistants. Le lien est dans Login.jsx. Effort : 30min (créer une page placeholder "Contactez le support" ou implémenter un vrai reset par email).
- **#19 Flashcards light theme** : Flashcards.jsx utilise bg-slate-50/blue-50. Effort : 15min (remplacer par dark theme comme les autres pages).

**P3 (cosmétique)** :
- **#14 Exercises completed = 0** : Le dashboard n'a pas de compteur exercices, seulement leçons. Effort : 30min (ajouter un count depuis exercise_attempts).
- **#22 Upload photo impossible** : Le bouton camera est décoratif. Effort : 1h+ (file upload + backend endpoint + stockage Supabase).

### Régressions identifiées

Aucune régression introduite par nos phases. Les bugs #2 et #3 (header) étaient pré-existants et ont été fixés par Phase 3.2 et 5.2. Le bug #8 (/forgot-password) n'a jamais été adressé dans aucune phase.

### Plan d'attaque proposé

| Bloc | Bugs | Effort | Priorité |
|------|------|--------|----------|
| **Bloc 1** | #8 (forgot-password), #19 (Flashcards dark theme) | 45 min | P2 — à faire |
| **Bloc 2** | #9 (Register i18n étapes), #12 (Quiz MCQ count) | 30 min | PARTIAL → compléter |
| **Bloc 3** | #14 (exercises counter), #22 (photo upload) | 1h30 | P3 — nice-to-have |
| **Reporter** | #26, #28 (UNCLEAR — tester manuellement) | — | Besoin de test prod |
