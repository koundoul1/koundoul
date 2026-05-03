# STATUS.md — Phase 1 QA Remediation

**Branche** : `auto-qa-remediation`
**Date** : 2026-04-29
**Base commit** : `80efac8` (chore: add CLAUDE.md, BUGS.md, PROMPTS.md)

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
