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
- [ ] P2-02 | Tests | useSavedQueries | Tests mode cloud
- [x] P2-03 | Performance | App.tsx | Lazy-load Dashboard
- [x] P2-04 | UX | useDashboardStats | Fix dépendance user → user?.id
