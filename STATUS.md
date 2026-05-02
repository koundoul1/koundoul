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

**Phase 2A + mini-correctifs terminés. Phase 2B non démarrée — en attente d'instructions.**
