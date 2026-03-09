# Sprint Backlog — Boolean Boost
Généré le : 2026-03-08 (v3)

## 🔴 P0 — Bloquant
- [x] P0-01 | BooleanGenerator.tsx | Fix generateBooleanQuery: passer customTitles et inputValue réels
- [x] P0-02 | vite.config.ts | Retirer base: '/boolean-boost/'
- [x] P0-03 | .github/workflows/pages.yml | Fix working-directory et artifact path

## 🟠 P1 — Important
- [x] P1-01 | variantGenerator.ts | Réécrire reverse gender logic sans masc.source
- [x] P1-02 | StepSelect.tsx | Clear anciennes variantes auto-sélectionnées au changement d'input
- [x] P1-03 | App.css | Supprimer le fichier orphelin
- [x] P1-04 | index.css + index.html | Déplacer Google Fonts de @import CSS vers link HTML
- [x] P1-05 | variantGenerator.ts | Réécrire GENDER_PATTERNS avec mapping string explicite (v2)
- [x] P1-06 | queryGenerator.ts | Dédupliquer inputValue dans la requête boolean

## 🟡 P2 — Amélioration
- [x] P2-01 | Step components | Ajouter aria-label / aria-checked sur badges
- [x] P2-02 | StepProgressBar.tsx | Ajouter role="progressbar" et attributs ARIA
- [x] P2-03 | README.md | Mettre à jour le titre
- [x] P2-04 | useSavedQueries.ts | Gérer localStorage quota exceeded
- [x] P2-05 | StepResult.tsx | Désactiver sauvegarde si requête vide
- [x] P2-07 | StepSelect.tsx | Ajouter aria-label/role sur badges custom
- [x] P2-08 | StepResult.tsx | Rendre boutons copier/supprimer visibles sur mobile
- [x] P2-09 | useSavedQueries.ts | Corriger stale closure dans saveQuery
- [x] P2-10 | useJobTitleSuggestions.ts | Mémoiser le flat array des titres
- [x] P2-11 | StepResult.tsx | Bloquer Enter sur save si requête vide
- [x] P2-06 | index.html | Remplacer OG image par une image branded

## Sprint P3 — Polish & Power Features (2026-03-08)

### ✅ Complétés
- [x] P3-01 | Auth + Cloud | Authentification email/password + table saved_queries avec RLS
- [x] P3-02 | StepSelect.tsx | Preview live de la requête avec compteur caractères
- [x] P3-03 | Multi-catégories | Sélection multiple de familles métier
- [x] P3-04 | Mobile polish | Touch targets 44px, sticky buttons, responsive
- [x] P3-05 | Raccourcis clavier | Ctrl+Enter, Escape, Ctrl+C
- [x] P3-06 | Dashboard | Page /dashboard avec stats, graphiques recharts, tracking usage_events

## Sprint P4 — Post-audit (issu de l'audit du 2026-03-08)

### 🔴 P0 — Bloquant
- [x] P0-01 | Performance | useDashboardStats.ts | Pagination + try/catch + error state
- [x] P0-02 | Performance | migrations | Index sur usage_events(created_at, user_id)

### 🟠 P1 — Important
- [x] P1-01 | Sécurité | migrations | Validation INSERT policy usage_events
- [x] P1-02 | Code Quality | useUsageTracking + useDashboardStats | Supprimer as any
- [x] P1-03 | Documentation | memory.md + sprint-backlog.md + security-backlog.md | MAJ

### 🟡 P2 — Amélioration
- [x] P2-01 | Tests | useAuth, useKeyboardShortcuts, useDashboardStats, useUsageTracking | Tests unitaires
- [x] P2-02 | Tests | useSavedQueries | Tests mode cloud (5 tests)
- [x] P2-03 | Performance | App.tsx | Lazy-load Dashboard
- [x] P2-04 | UX | useDashboardStats | Fix dépendance user → user?.id

## Sprint P5 — Post-audit 2 (issu de l'audit du 2026-03-08)

### 🟡 P2 — Amélioration
- [x] P2-01 | Documentation | memory.md | Corriger incohérence P2 ouverts
- [x] P2-02 | Sécurité | migrations | Fix policy INSERT OR logic usage_events
- [x] P2-03 | Tests | Dashboard.tsx | Tests unitaires page Dashboard
- [x] P2-04 | Performance | useDashboardStats.ts | Limite max itérations pagination

## Sprint P6 — Post-audit 48h (issu de l'audit du 2026-03-08)

### 🟡 P2 — Amélioration
- [x] P2-01 | Documentation | testing-audit-2026-03-08.md | MAJ count tests + Dashboard
- [x] P2-02 | Sécurité | parse-natural-query | Restreindre CORS au domaine de production

### ✅ Complétés lors des sprints P3-P5
- [x] Auth + Cloud queries + Dashboard analytics
- [x] Multi-catégories, live preview, raccourcis clavier, mobile polish
- [x] Pagination + indexes + INSERT policy fix
- [x] 109+ tests unitaires (tous hooks + Dashboard)
- [x] Documentation synchronisée (memory.md, sprint-backlog.md, security-backlog.md)

### ✅ Complétés lors du sprint P4
- [x] P0-01 + P0-02 | Pagination + indexes usage_events
- [x] P1-01 | Validation INSERT policy usage_events
- [x] P1-02 | Suppression as any
- [x] P1-03 | MAJ documentation
- [x] P2-01 | Tests unitaires hooks (32+ tests)
- [x] P2-02 | Tests useSavedQueries cloud (5 tests)
- [x] P2-03 | Lazy-load Dashboard
- [x] P2-04 | Fix dépendance user?.id

## Sprint MVP Audit — 2026-03-09
Score global : 65/100 → 85/100 après P1
PMF (Shreya) : 26/40 | Growth (Marcus) : 17/35 | UX (Yuki) : 22/25

### 🔴 P0 — Bloquants MVP (3 items, impact +10 pts) ✅
- [x] P0-01 | Marcus | Social Proof | Compteur requêtes animé sur homepage (edge function query-count)
- [x] P0-02 | Marcus | Rétention | Welcome toast enrichi post-signup (AuthModal.tsx)
- [x] P0-03 | Shreya | Feedback | Micro-survey post-copie + table feedback_responses + KPI admin

### 🟠 P1 — PMF & Growth (4 items, impact +10 pts) ✅
- [x] P1-01 | Yuki | Conversion | Empty state Dashboard avec CTA login (Dashboard.tsx)
- [x] P1-02 | Marcus | Viralité | Branding footer sur exports PNG/PDF (StepResult.tsx)
- [x] P1-03 | Shreya | Stickiness | Historique récent 10 dernières requêtes (Dashboard.tsx + useRecentHistory)
- [x] P1-04 | Marcus | Acquisition | OG image branded 1200×630 + meta tags mis à jour

### 🟡 P2 — Différenciateurs (5 items, impact +8 pts)
- [ ] P2-01 | Shreya | Community | Templates communautaires
- [ ] P2-02 | Marcus | Monétisation | Freemium avec limites
- [x] P2-03 | Yuki | Onboarding | Coachmarks première visite
- [ ] P2-04 | Marcus | Rétention | Digest hebdomadaire email
- [ ] P2-05 | Yuki | Polish | Animation première copie
