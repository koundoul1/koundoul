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

**Phase 1 terminée. Phase 2 non démarrée — en attente d'instructions.**
