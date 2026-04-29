# PROMPTS.md — Plan d'exécution Claude Code (Koundoul)

> Ce fichier est conçu pour être exécuté en autonomie par Claude Code (la commande `claude` du CLI).
>
> **Mode d'emploi** :
> 1. Place ce fichier à la racine du projet : `C:\Users\conta\koundoul\PROMPTS.md`
> 2. Place aussi `CLAUDE.md` et `BUGS.md` à la racine.
> 3. Crée une branche dédiée : `git checkout -b auto-qa-remediation`
> 4. Ouvre Claude Code dans le projet : `cd C:\Users\conta\koundoul && claude`
> 5. Colle le **PROMPT MAÎTRE** ci-dessous au démarrage de la session.
> 6. Pour ne pas être bloqué par des demandes de permission, lance avec :
>    `claude --dangerously-skip-permissions` (à utiliser en connaissance de cause, sur branche dédiée).
> 7. Suis depuis l'app mobile Claude pendant ton absence ; tu peux intervenir si nécessaire.

---

## 🚀 PROMPT MAÎTRE (à coller dans Claude Code)

```
Tu es l'ingénieur principal sur le projet Koundoul (SaaS EdTech). Lis d'abord
CLAUDE.md (contexte projet), BUGS.md (liste des issues priorisées P0→P4 issues
d'un audit QA externe), et PROMPTS.md (ce plan d'exécution).

Tu vas exécuter les Phases 1 à 7 ci-dessous, dans l'ordre, en autonomie
complète. Pour chaque tâche :

1. Lis le code concerné AVANT de modifier (utilise grep, ls, et read).
2. Implémente le fix le plus minimal qui résout le bug rapporté.
3. Ajoute un test de régression quand c'est pertinent.
4. Vérifie le critère de succès de la tâche.
5. Commit avec un message Conventional Commits clair et atomique
   (ex: "fix(auth): display error message on duplicate email registration").
6. Passe à la tâche suivante.

Règles strictes :
- N'ATTENDS PAS de confirmation entre les tâches. Enchaîne.
- Ne demande PAS de validation pour des choix triviaux (nom de variable, ordre
  de paramètres, formatage). Décide et avance.
- Si une tâche est BLOQUÉE (info manquante, choix produit ambigu, dépendance
  d'une décision humaine) : commit "wip:", documente dans STATUS.md la raison
  exacte et ce que tu suggères, puis passe à la tâche suivante.
- Mets à jour STATUS.md après chaque PHASE complétée (pas après chaque tâche).
- Ne touche pas aux données de production, secrets, ou clés API.
- Si tu vois un .env, ne l'expose jamais dans tes commits.

À la fin (ou si tu épuises le contexte), produit un rapport final dans
STATUS.md avec : phases complétées, tâches skippées et pourquoi, dette
technique observée, prochaines actions recommandées.

Commence MAINTENANT par la Phase 1.
```

---

## Phase 1 — 🔴 Bloquants P0 (Auth + Paiement)

**Objectif** : Que personne ne reste coincé. Sans auth qui marche et sans paiement,
le SaaS n'est pas utilisable du tout.

### 1.1 Authentication — feedback d'erreurs

- **Bug** : "Email already in use" ne s'affiche pas, ni "Email or password incorrect", ni "Unknown email" → page blanche ou silence.
- **Bug** : Sur certains comptes, "Account not register" et message non shown, l'utilisateur reste sur une page blanche.
- **Bug** : Message de mot de passe incorrect : "Password must contain at least 6 characters" alors que la spec demande 8.
- **Tâche** :
  - Auditer `pages/login`, `pages/register`, le service auth (probablement `services/auth.js` ou `api/auth.ts`).
  - S'assurer que TOUTES les erreurs backend remontent un message FR + EN clair sous le champ concerné.
  - Aligner la validation password sur **8 caractères minimum** (mettre à jour le message d'erreur).
  - Ajouter un test e2e "register avec email déjà utilisé → message d'erreur visible".
- **Critère de succès** : les 4 cas d'erreur (email déjà utilisé, password trop court, email inconnu, mauvais password) affichent tous un message visible. Aucune page blanche.

### 1.2 Wave Payment — flow cassé

- **Bug** : "Pay with Wave" → page blanche, pas de redirection.
- **Bug** : `/payment/success` et `/payment/error` ne s'affichent pas.
- **Bug** : Abonnement actif non visible dans le profil après paiement.
- **Bug** : Historique des paiements vide.
- **Tâche** :
  - Vérifier le client API Wave (probablement `services/wave.js`). Logger la réponse réelle pour comprendre l'échec.
  - Implémenter ou corriger les pages `/payment/success` et `/payment/error` avec animation + bouton "Retry".
  - Vérifier le webhook Wave côté backend : la réception confirme-t-elle bien l'abonnement en DB ?
  - Afficher `subscription.expires_at` et l'historique des transactions dans `/profile`.
- **Critère de succès** : un paiement test passe de bout en bout (initiation → redirection Wave → callback success → abonnement actif dans le profil).

### 1.3 Sécurité d'accès

- **Bug** : `/subscriptions` accessible sans login (devrait rediriger).
- **Tâche** : ajouter le middleware/guard de route sur `/subscriptions` (et vérifier que `/dashboard`, `/admin`, `/profile`, `/parent-dashboard` sont aussi bien protégés).
- **Critère de succès** : test e2e "non-logged user tries /subscriptions → redirected to /login".

---

## Phase 2 — 🟠 Cœur produit P1 : gamification + IA

### 2.1 XP / Streak / Progress (TopBar + Dashboard)

- **Bug central** : XP, streak, progress bar, 7-day grid, 4 key stats, badges → tous **affichent** mais **ne se mettent pas à jour** après une action (lesson complétée, quiz fini, exercise validé).
- **Tâche** :
  - Identifier le store/service qui gère XP+streak (probablement `store/user.js` ou `hooks/useXP`).
  - Vérifier que chaque action métier (`completeLesson`, `submitQuiz`, `winDuel`) appelle bien le backend et invalide les caches.
  - Implémenter un système d'invalidation/refetch après mutation (ex: React Query `invalidateQueries`).
  - Vérifier le calcul streak côté backend (timezone-safe).
- **Critère de succès** : compléter une leçon → XP+10 (ou valeur attendue), streak passe à 1 si premier jour, dashboard reflète ça en moins de 1s.

### 2.2 Micro-Lessons — bugs critiques

- **Bug** : "Already completed" badge ne s'affiche pas → la leçon paraît refaisable.
- **Bug** : nouvelle leçon ouverte = marquée complétée immédiatement (devrait nécessiter une action).
- **Bug** : pas de bouton "Next" pour passer à la leçon suivante.
- **Bug** : leçon 46 (entre autres) n'a pas de contenu.
- **Tâche** :
  - Corriger la logique `markAsCompleted` (déclenchée seulement après lecture/quiz de fin).
  - Ajouter un bouton "Next lesson" qui suit l'ordre du curriculum.
  - Ajouter un script de validation `npm run validate:lessons` qui liste les leçons sans contenu, et logger un warning dans le panneau admin.
- **Critère de succès** : ouvrir une nouvelle leçon → pas marquée complétée. Cliquer "Mark as complete" → marquée. Rouvrir → badge "Already completed" visible. Bouton "Next" présent.

### 2.3 Solver IA — entièrement cassé

- **Bug** : équation simple `x^2-4=0` → erreur affichée, IA ne répond pas.
- **Bug** : LaTeX non rendu, graphes Plotly non chargés.
- **Tâche** :
  - Auditer l'intégration de l'API IA (probablement Gemini, vu le coach).
  - Vérifier la clé API, la quota, et le format de prompt.
  - Tester avec un prompt minimal et logger toute réponse d'erreur.
  - Vérifier que Plotly.js est bien lazy-loadé sur `/solver` uniquement (pas dans le bundle initial).
  - Vérifier le rendu KaTeX (probable lib `react-katex`).
- **Critère de succès** : `x^2-4=0` → réponse "x=2 ou x=-2" en LaTeX rendu + graphe Plotly interactif.

### 2.4 Quiz — filtres et scoring

- **Bug** : filtres difficulté Easy/Medium/Hard absents.
- **Bug** : timer ne s'auto-termine pas à 0.
- **Bug** : XP gagné non affiché en fin de quiz.
- **Bug** : XP non ajouté au profil après quiz.
- **Tâche** :
  - Ajouter les 3 filtres difficulté sur `/quiz`.
  - Hook `useEffect` sur le timer : à 0 → soumission auto.
  - Vérifier que `submitQuiz` appelle bien l'endpoint qui crédite l'XP (et que le frontend invalide le cache user).
- **Critère de succès** : finir un quiz → score, XP gagné, timer correct, profil mis à jour.

### 2.5 Coach Virtuel (IA Gemini)

- **Bug** : réponses "non générées selon les nouvelles mesures", LaTeX non rendu, historique non scrollable, pas de réponse en EN quand langue = EN.
- **Tâche** :
  - Mettre à jour le system prompt Gemini avec consigne pédagogique claire et instruction de répondre dans la langue active.
  - Brancher KaTeX sur le rendu des réponses.
  - Implémenter le scroll virtuel/infini sur la conversation.
- **Critère de succès** : poser "Explique le théorème de Pythagore" → réponse pédagogique, formules rendues, en EN si langue=EN.

### 2.6 Courses — progression

- **Bug** : ouvrir une leçon = marque la course complétée (même bug que 2.2 sur les courses).
- **Bug** : course détail non traduit en anglais.
- **Tâche** : même fix que 2.2, élargi aux courses. Ajouter les traductions manquantes dans `i18n/en.json`.
- **Critère de succès** : progression d'un course = somme pondérée des leçons effectivement complétées.

---

## Phase 3 — 🟡 Social & Compétition P2

### 3.1 Duels — module entièrement cassé

11 issues sur 11 sous-modules. Hypothèse : un module récent jamais terminé.

- **Bug** : créer un duel → page blanche.
- **Bug** : "Copy code" ne fait rien.
- **Bug** : invitations, scores, XP +200/+50, rematch, historique → tout cassé.
- **Tâche** :
  - Audit complet du dossier `pages/duels` ou `features/duels`.
  - Vérifier le backend : table `duels`, endpoint `POST /duels/create`, websocket pour notifications.
  - Implémenter ce qui manque, en suivant le user flow décrit dans le QA.
- **Critère de succès** : créer un duel, copier le code, joindre depuis un 2e compte, jouer 10 questions, voir le score, recevoir les XP corrects.

### 3.2 Weekly Challenge

- **Bug** : seul le challenge Math s'affiche (devrait y avoir Math, Physics, Chemistry).
- **Bug** : XP du challenge non mentionnés.
- **Bug** : "Start Challenge" ne marche pas, "Already participated this week" non affiché.
- **Bug** : règles, timer 20min → tous cassés.
- **Tâche** :
  - Vérifier la query qui récupère les 3 challenges actifs de la semaine.
  - Implémenter la logique "1 participation par semaine par matière" côté backend.
- **Critère de succès** : 3 challenges visibles, lancer Math = 10 questions / 20min, score + XP + classement à la fin, retentative bloquée jusqu'à la semaine suivante.

### 3.3 Leaderboard

- **Bug** : page leaderboard pas trouvée.
- **Tâche** : implémenter `/leaderboard` avec onglets Global / Pays / Région, filtres "Cette semaine / Ce mois / Tout temps", podium top 3 animé, surlignage de ma position.
- **Critère de succès** : un user voit le top 100 + sa propre position.

### 3.4 Badges

- **Bug** : page badges vide.
- **Bug** : conditions d'obtention non visibles.
- **Bug** : pas de notif quand un badge est débloqué.
- **Tâche** :
  - Seeder/créer les 15 badges en DB (si absents).
  - Implémenter le système d'évaluation badges après chaque action métier.
  - Toast/notif quand un badge est débloqué.
- **Critère de succès** : 15 badges visibles. Premier lesson complétée → badge "First Lesson" débloqué + notif.

### 3.5 Notifications temps réel

- Vérifier le système de notifications (probablement WebSocket ou Server-Sent Events) — issues mentionnent "Duel notification" qui n'arrive pas.

---

## Phase 4 — 🟢 Modules secondaires P3

### 4.1 Flashcards — entièrement cassées

- 6 issues, tout est "not working" : ouvrir deck, flip card, navigation, marquer connue, progress.
- Tâche : audit + reconstruction du module flashcards.

### 4.2 Forum

- 7 issues : forum non créé du tout côté Student.
- Tâche : implémenter `/forum` avec discussions, réponses, recherche, pagination, formatage basique, protection (login required).

### 4.3 Resources

- Filtres par matière et niveau absents.
- Tâche : ajouter les filtres.

### 4.4 Settings

- 6 issues — auditer la page settings et corriger.

### 4.5 Super Admin Panel

- 8 issues — vérifier que le compte `contact@peak-performance-partner.com` redirige vers `/admin` au login (auto), et que les fonctions admin marchent.

### 4.6 Visualizations

- Erreurs JS dans la console + interactivité partielle.
- Tâche : nettoyer la console, uniformiser l'interactivité Plotly.

### 4.7 User Profile

- Profile stats ne se mettent pas à jour (lié à Phase 2.1, devrait être résolu).
- Change password ne marche pas.

---

## Phase 5 — ⚪ Polish P4

### 5.1 Internationalisation FR/EN

- 10 issues : panneaux pas traduits, dropdown UI cassé, certains contenus seulement en FR.
- **Tâche** :
  - Lancer un script qui détecte les chaînes de texte hardcodées (regex sur JSX/TSX).
  - Migrer toutes les chaînes dans `i18n/fr.json` et `i18n/en.json`.
  - Corriger le selector FR/EN (UI dropdown cassée).
- **Critère de succès** : changer la langue → toute l'UI bascule, aucune chaîne non traduite.

### 5.2 Responsive

- 4 issues majeures :
  - 768px : UI cassée (Hero section, etc.).
  - 1920px : trop dézoomé, peu confortable.
  - Mobile : certains panneaux ont des bugs.
- **Tâche** :
  - Audit avec DevTools sur 375 / 768 / 1920px.
  - Ajuster les media queries / Tailwind breakpoints.
  - Sur 1920px : envisager un `max-width: 1440px` centré pour le confort de lecture.

### 5.3 Performance

- **Bug** : Landing prend 11+ secondes à charger (vs 3s attendus).
- **Tâche** :
  - Lighthouse audit sur la landing.
  - Lazy-load des images, code-splitting, optimisation des fonts.
  - Vérifier que Plotly n'est PAS dans le bundle initial.
  - CDN ou optimisation des assets statiques.
- **Critère de succès** : Lighthouse Performance > 80, FCP < 2s, LCP < 3s sur WiFi simulé.

### 5.4 Landing Page

- Issue UI sur le bouton "Ready to Succeed" (color grading).
- Texte topbar "login/register" au lieu de "Sign In / Sign Up".

---

## Phase 6 — Tests & Qualité

- [ ] Suite de tests unitaires (Jest/Vitest) — couverture > 60% sur les modules P0/P1.
- [ ] Suite e2e (Playwright) couvrant les user flows critiques :
  - Inscription → vérification email → premier login → première leçon → premier quiz → premier badge.
  - Achat abonnement Wave (sandbox).
  - Création + complétion d'un duel.
  - Création compte parent → liaison enfant → consultation stats.
- [ ] CI/CD : configurer GitHub Actions pour faire tourner lint + tests à chaque push.
- [ ] Monitoring : ajouter Sentry (ou équivalent) pour tracker les erreurs en prod.

---

## Phase 7 — Production-Ready

- [ ] `npm run build` clean, 0 warning critique.
- [ ] Variables d'environnement documentées dans `.env.example`.
- [ ] README projet mis à jour avec : installation, dev, build, deploy.
- [ ] CHANGELOG.md avec toutes les corrections groupées par phase.
- [ ] STATUS.md final : "Production Ready ✅" avec checklist du `CLAUDE.md` toutes cochées.
- [ ] Backup DB, plan de rollback documenté.
- [ ] Faire passer le checklist "Critères Production Ready" du `CLAUDE.md`.

---

## Pendant ton absence : check-list de relance

Si tu reviens et la session a tourné :
1. Lis `STATUS.md` (état réel).
2. `git log --oneline` pour voir ce qui a été commité.
3. `git diff main..auto-qa-remediation --stat` pour voir l'ampleur.
4. Si la session est morte avant la fin : relance `claude` et colle :
   > "Reprends là où tu t'es arrêté d'après STATUS.md. Continue les phases restantes en suivant PROMPTS.md."

## Recommandation finale

Ne lance PAS les 7 phases d'un coup en pleine prod. Procède plutôt par lots de 2-3 phases sur une branche dédiée, review humaine entre chaque lot, merge si OK, puis lot suivant. Tu garderas la main, et si Claude part dans le décor sur une phase, tu n'auras pas tout à reviewer d'un coup.
