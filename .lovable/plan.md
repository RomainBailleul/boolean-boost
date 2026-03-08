

# Rapport d'Audit 24H Post-Sprint P3 — 2026-03-08

---

## PHASE 1 — CARTOGRAPHIE DES CHANGEMENTS

| Fichier | Type | Domaine | Risque |
|---------|------|---------|--------|
| `src/hooks/useAuth.ts` | Créé | Authentification | 🟠 Moyen |
| `src/components/AuthModal.tsx` | Créé | Authentification | 🟠 Moyen |
| `src/hooks/useKeyboardShortcuts.ts` | Créé | UX / Hooks | 🟢 Faible |
| `src/hooks/useUsageTracking.ts` | Créé | Data / Analytics | 🟠 Moyen |
| `src/hooks/useDashboardStats.ts` | Créé | Data / Analytics | 🟠 Moyen |
| `src/pages/Dashboard.tsx` | Créé | UI / Page | 🟢 Faible |
| `supabase/migrations/...8acf371a...sql` | Créé | Base de données | 🔴 Élevé |
| `supabase/migrations/...30671ca9...sql` | Créé | Base de données | 🔴 Élevé |
| `src/components/BooleanGenerator.tsx` | Modifié | UI / Orchestration | 🟠 Moyen |
| `src/components/steps/StepInput.tsx` | Modifié | UI / Step | 🟢 Faible |
| `src/components/steps/StepSelect.tsx` | Modifié | UI / Step | 🟢 Faible |
| `src/components/steps/StepResult.tsx` | Modifié | UI / Step | 🟢 Faible |
| `src/hooks/useSavedQueries.ts` | Modifié | Data / Hooks | 🟠 Moyen |
| `src/utils/queryGenerator.ts` | Modifié | Utils | 🟢 Faible |
| `src/App.tsx` | Modifié | Routing | 🟢 Faible |
| `src/integrations/supabase/types.ts` | Modifié (auto) | Types | 🟢 Faible |
| `src/components/__tests__/StepInput.test.tsx` | Modifié | Tests | 🟢 Faible |
| `src/components/__tests__/StepSelect.test.tsx` | Modifié | Tests | 🟢 Faible |
| `src/components/__tests__/StepResult.test.tsx` | Modifié | Tests | 🟢 Faible |
| `src/hooks/__tests__/useSavedQueries.test.ts` | Modifié | Tests | 🟢 Faible |

**Total : 20 fichiers touchés (8 créés, 12 modifiés)**

---

## PHASE 2 — AUDIT DE QUALITÉ

### Composants React

| Check | Statut |
|-------|--------|
| Compilation TypeScript | ✅ Aucune erreur visible |
| Props typées (pas de `any`) | ⚠️ `useUsageTracking.ts` l.14 utilise `as any` sur `usage_events` |
| ⚠️ `useDashboardStats.ts` l.47 et l.51 utilisent `as any` | Contournement type car `usage_events` n'est pas dans les types auto-générés correctement |
| États loading/error/empty | ✅ Dashboard gère loading + empty |
| Console.log oubliés | ✅ Aucun |
| Logique métier dans JSX | ✅ Extraite dans hooks |
| Re-renders inutiles | ⚠️ `useDashboardStats` n'a pas de dépendance `user?.id`, seulement `user` — pourrait re-fetcher si l'objet user change de référence |

### Hooks

| Check | Statut |
|-------|--------|
| Cleanup subscriptions | ✅ `useAuth` unsubscribe, `useKeyboardShortcuts` removeEventListener |
| Gestion erreurs Supabase | ⚠️ `useDashboardStats` : pas de `try/catch` ni gestion d'erreur sur les requêtes |
| ⚠️ `useUsageTracking` : résultat insert silencieusement ignoré | |
| Types retour explicites | ✅ Interfaces définies |

### Migrations Supabase

| Check | `saved_queries` | `usage_events` |
|-------|----------------|----------------|
| RLS activé | ✅ | ✅ |
| SELECT policy | ✅ own rows | ✅ public |
| INSERT policy | ✅ own rows | ✅ public |
| UPDATE policy | ❌ Absente (acceptable — pas de feature update) | ❌ Absente (OK) |
| DELETE policy | ✅ own rows | ❌ Absente (OK — events immutables) |
| Foreign keys | ✅ → auth.users | ✅ → auth.users (SET NULL) |
| Index | ✅ `idx_saved_queries_user_id` | ❌ Pas d'index sur `created_at` ni `user_id` |
| Réversible | ✅ DROP TABLE suffit | ✅ |

### Edge Functions

| Check | `parse-natural-query` |
|-------|----------------------|
| Auth check | ⚠️ `verify_jwt = false` dans config.toml — intentionnel (NLP accessible sans auth) |
| Service role exposé | ✅ Non |
| CORS | ⚠️ `Access-Control-Allow-Origin: *` — permissif, acceptable pour un outil gratuit |
| Gestion erreurs HTTP | ✅ 400, 429, 402, 500 gérés |

---

## PHASE 3 — TESTS DE NON-RÉGRESSION

### Matrice d'impact

| Changement | Fichiers impactés | Flux affectés | Tests existants |
|-----------|------------------|---------------|-----------------|
| `useAuth` créé | BooleanGenerator, StepResult, Dashboard | Connexion, sauvegarde cloud, stats perso | ❌ Aucun test unitaire |
| `useSavedQueries` modifié (cloud) | StepResult | Sauvegarde/suppression requêtes | ⚠️ Partiel — tests ne couvrent que localStorage |
| `useUsageTracking` créé | BooleanGenerator (Step 2→3) | Tracking analytics | ❌ Aucun |
| `useDashboardStats` créé | Dashboard | Affichage stats | ❌ Aucun |
| `useKeyboardShortcuts` créé | BooleanGenerator | Navigation raccourcis | ❌ Aucun |
| Multi-catégories | StepInput, StepSelect, queryGenerator | Sélection + génération | ⚠️ Partiel |
| Live preview (StepSelect) | StepSelect | Aperçu requête | ❌ Non testé |
| Dashboard page + route | App.tsx, Dashboard | Navigation | ❌ Aucun |

### Régressions potentielles

1. **🔴 Vérifier maintenant** — `useSavedQueries` : le hook accepte `user` optionnel, mais les tests ne testent que le mode anonyme. Le mode cloud (insert avec `user_id`) n'a aucun test.

2. **🟠 Avant deploy** — `useDashboardStats` : la requête `.select('*')` sur `usage_events` n'a pas de `limit()`. Si la table grossit (>1000 rows), les stats seront tronquées silencieusement à cause du défaut Supabase de 1000 rows max.

3. **🟠 Avant deploy** — `useUsageTracking.trackQueryGenerated` est un fire-and-forget sans gestion d'erreur. Si l'insert échoue, l'utilisateur ne le sait pas (acceptable pour analytics, mais les stats seront faussées).

4. **🟡 Sprint suivant** — Le raccourci `Escape` peut interférer avec la fermeture de l'AuthModal ou du dialog (Radix gère son propre Escape).

---

## PHASE 4 — AUDIT SÉCURITÉ DELTA

### Nouvelles surfaces d'attaque

| Surface | Risque | Statut |
|---------|--------|--------|
| Table `saved_queries` | Exposition données | ✅ RLS stricte (own rows only) |
| Table `usage_events` | Écriture publique | ⚠️ **N'importe qui peut insérer des événements arbitraires** — pas de validation serveur |
| AuthModal (formulaire) | XSS/injection | ✅ Supabase Auth gère la validation |
| Route `/dashboard` | Accès non authentifié | ✅ Intentionnel (stats publiques) |
| `parse-natural-query` | Déjà existant | ⚠️ `verify_jwt = false` — OK si intentionnel |

### Risque principal : `usage_events` INSERT sans restriction

La policy `WITH CHECK (true)` permet à quiconque d'insérer des lignes arbitraires dans `usage_events`. Un attaquant pourrait :
- Injecter des milliers de faux événements pour fausser les stats
- Insérer des `categories` ou `location` très longs pour gonfler le stockage

**Sévérité** : 🟠 Moyen — les données ne sont pas sensibles mais les stats deviennent non fiables.

### Checklist

| Vérification | Statut |
|-------------|--------|
| `saved_queries` RLS | ✅ SELECT/INSERT/DELETE per user |
| `usage_events` RLS | ⚠️ INSERT public sans validation |
| Secrets dans le code | ✅ Aucun |
| API keys dans Supabase Secrets | ✅ LOVABLE_API_KEY configuré |
| CORS edge function | ⚠️ `*` (acceptable pour outil gratuit) |

---

## PHASE 5 — AUDIT PERFORMANCE DELTA

### Requêtes à risque

| Requête | Table | Filtres | Limit | Index | Risque |
|---------|-------|---------|-------|-------|--------|
| `useDashboardStats` : `.select('*').order('created_at')` | `usage_events` | Aucun | ❌ Aucun | ❌ Pas d'index | 🔴 **Full table scan sans limit** |
| `useSavedQueries` : `.select('*').order('created_at')` | `saved_queries` | `.eq('user_id')` implicite via RLS | ❌ Aucun | ✅ `idx_saved_queries_user_id` | 🟢 OK (filtré par RLS) |
| `useDashboardStats` : `.select('*', { count: 'exact', head: true })` | `saved_queries` | `.eq('user_id')` | Head only | ✅ Indexé | 🟢 OK |

### Autres problèmes performance

| Check | Statut |
|-------|--------|
| useEffect sans deps | ✅ Tous ont des deps |
| Images non optimisées | N/A |
| Lazy loading routes | ❌ Dashboard n'est pas lazy-loaded (mineur) |
| Re-renders cascade | ⚠️ `useDashboardStats(user)` dépend de l'objet `user` qui change de référence à chaque re-render du parent |

---

## PHASE 6 — ÉTAT DE LA DOCUMENTATION

| Fichier | Statut | Sections à mettre à jour |
|---------|--------|--------------------------|
| `memory.md` | 🔴 **Obsolète** | Security Status dit "pas de Supabase" alors que 2 tables + auth existent. Testing Status ne mentionne pas les nouveaux hooks/pages non testés. Known Issues incomplet. |
| `sprint-backlog.md` | 🔴 **Obsolète** | Ne contient pas le Sprint P3. Tous les items P3 sont implémentés mais non listés. |
| `security-backlog.md` | 🔴 **Obsolète** | Score 9/10 et "pas de Supabase" alors que le backend est actif. Nouvelles surfaces d'attaque non documentées. |
| `testing-audit-2026-03-08.md` | 🟠 **Partiel** | Ne couvre pas les nouveaux fichiers créés. |

---

## PHASE 7 — RÉSUMÉ EXÉCUTIF 24H

### Score de santé

| Dimension | Score | Commentaire |
|-----------|-------|-------------|
| Qualité du code | 7/10 | Plusieurs `as any` pour contourner les types, pas de gestion d'erreur sur analytics |
| Couverture sécurité | 7/10 | RLS bien configurée sauf `usage_events` INSERT trop permissif |
| Tests | 5/10 | Aucun test pour 5 nouveaux fichiers (useAuth, useUsageTracking, useDashboardStats, useKeyboardShortcuts, Dashboard). Tests `useSavedQueries` ne couvrent pas le mode cloud. |
| Performance | 7/10 | Requête `usage_events` sans limit ni index — problème à l'échelle |
| Documentation | 3/10 | 4 fichiers .md obsolètes |
| **Score global** | **6/10** | |

### Ce qui s'est bien passe

1. Auth email/password correctement implémentée avec Supabase Auth, sans auto-confirm (bonne pratique).
2. RLS stricte sur `saved_queries` — SELECT/INSERT/DELETE per user avec index.
3. Multi-catégories et live preview fonctionnent correctement en frontend.
4. Raccourcis clavier bien isolés dans un hook dédié avec cleanup.
5. Sticky navigation mobile et touch targets 44px implémentés.

### Ce qui pose probleme

1. **🔴 `useDashboardStats.ts` l.46-48** — Requête `.select('*')` sur `usage_events` sans `limit()`. Le défaut Supabase de 1000 rows tronquera silencieusement les stats. Les KPIs "total requêtes" seront faux dès 1001 événements.

2. **🟠 `usage_events` migration** — INSERT policy `WITH CHECK (true)` permet l'injection de faux événements par quiconque.

3. **🟠 `useDashboardStats.ts` l.51** — Cast `as any[]` sur les résultats : perte de type safety, erreurs runtime invisibles.

4. **🟠 `useUsageTracking.ts` l.14** — Cast `as any` pour contourner le type. Insert fire-and-forget sans gestion d'erreur.

5. **🟡 Documentation** — 4 fichiers .md complètement désynchronisés du code.

### Decision de deploiement

```
🟠 DEPLOYABLE AVEC PRECAUTIONS
— Ajouter limit() sur la requête usage_events (P0-01)
— Valider manuellement le flux auth complet (inscription + email + connexion + sauvegarde cloud)
— Vérifier le dashboard après génération d'une requête
```

---

## PHASE 8 — ACTIONS IMMÉDIATES

### Corrections MAINTENANT

1. `src/hooks/useDashboardStats.ts` l.46-48 → Requête sans `limit()` tronquera à 1000 rows → Ajouter `.limit(10000)` ou paginer / utiliser un COUNT côté serveur
2. `src/hooks/useDashboardStats.ts` l.43 → Pas de `try/catch` → Wraper dans try/catch avec état `error`

### Corrections AVANT PROCHAIN DEPLOY

3. `usage_events` INSERT policy → Ajouter validation minimale (ex: `titles_count >= 0 AND array_length(categories, 1) <= 20`)
4. `memory.md` → Mettre à jour Security Status, Testing Status, Known Issues
5. `sprint-backlog.md` → Ajouter Sprint P3 complété
6. `security-backlog.md` → Mettre à jour avec nouvelles surfaces d'attaque

### Améliorations PROCHAIN SPRINT

7. Ajouter tests unitaires pour `useAuth`, `useKeyboardShortcuts`, `useDashboardStats`, `useUsageTracking`
8. Ajouter tests `useSavedQueries` mode cloud (mock Supabase)
9. Lazy-load route `/dashboard`
10. Ajouter index sur `usage_events(created_at)` pour les requêtes temporelles
11. Remplacer les `as any` par des types corrects

---

## PHASE 9 — SPRINTS

### 🔴 P0 — BLOQUANT (2 items)

**[P0-01]** | 🏷️ Performance | 📄 `src/hooks/useDashboardStats.ts`
Probleme : La requête `.select('*')` sur `usage_events` n'a pas de `limit()`. Au-delà de 1000 rows, les stats globales (totalQueries, topCategories) seront silencieusement tronquées et fausses.
Prompt : "Dans `src/hooks/useDashboardStats.ts`, la requête sur `usage_events` n'a pas de limit(). Ajoute une pagination ou un COUNT serveur pour que les stats restent exactes au-delà de 1000 lignes. Ajoute aussi un try/catch avec un état `error` pour gérer les échecs de requête."

**[P0-02]** | 🏷️ Performance | 📄 `supabase/migrations`
Probleme : Pas d'index sur `usage_events(created_at)` ni `usage_events(user_id)`. Les requêtes de filtrage temporel et par user feront des full table scans.
Prompt : "Crée une migration SQL pour ajouter un index sur `usage_events(created_at)` et un index sur `usage_events(user_id)` pour optimiser les requêtes du dashboard."

### 🟠 P1 — IMPORTANT (3 items)

**[P1-01]** | 🏷️ Sécurité | 📄 `supabase/migrations`
Probleme : La policy INSERT sur `usage_events` est `WITH CHECK (true)` sans aucune validation. N'importe qui peut injecter des milliers de faux événements.
Prompt : "Ajoute une validation sur la policy INSERT de `usage_events` : limite `titles_count` entre 0 et 10000, limite le nombre de categories à 20, et limite la longueur de `location` et `platform` à 200 caractères."

**[P1-02]** | 🏷️ Code Quality | 📄 `src/hooks/useUsageTracking.ts`, `src/hooks/useDashboardStats.ts`
Probleme : Usage de `as any` pour contourner les types TypeScript sur la table `usage_events`. Perte de type safety.
Prompt : "Supprime les casts `as any` dans `useUsageTracking.ts` et `useDashboardStats.ts`. Si `usage_events` n'est pas dans les types auto-générés, vérifie que le fichier `types.ts` est à jour. La table `usage_events` existe déjà dans les types, donc les casts sont inutiles."

**[P1-03]** | 🏷️ Documentation | 📄 `memory.md`, `sprint-backlog.md`, `security-backlog.md`
Probleme : Les 3 fichiers .md sont obsolètes — ils indiquent "pas de Supabase" alors que 2 tables, auth, et un dashboard existent.
Prompt : "Mets à jour `memory.md`, `sprint-backlog.md` et `security-backlog.md` pour refléter l'état actuel du projet : auth Supabase active, 2 tables (saved_queries, usage_events) avec RLS, dashboard /dashboard, edge function parse-natural-query, raccourcis clavier, multi-catégories. Ajoute le Sprint P3 complété dans sprint-backlog.md."

### 🟡 P2 — AMÉLIORATION (4 items)

**[P2-01]** | 🏷️ Tests | 📄 `src/hooks/`
Probleme : 5 nouveaux hooks/pages sans aucun test unitaire (useAuth, useKeyboardShortcuts, useUsageTracking, useDashboardStats, Dashboard).
Prompt : "Ajoute des tests unitaires pour `useAuth` (mock Supabase auth), `useKeyboardShortcuts` (test Ctrl+Enter, Escape, Ctrl+C), et `useDashboardStats` (mock Supabase queries). Cible : couvrir les cas nominaux et les erreurs."

**[P2-02]** | 🏷️ Tests | 📄 `src/hooks/__tests__/useSavedQueries.test.ts`
Probleme : Les tests de `useSavedQueries` ne couvrent que le mode localStorage. Le mode cloud (avec user authentifié) n'est pas testé.
Prompt : "Ajoute des tests pour `useSavedQueries` en mode cloud : mock un user Supabase authentifié et vérifie que saveQuery, deleteQuery, et le chargement initial passent par Supabase au lieu de localStorage."

**[P2-03]** | 🏷️ Performance | 📄 `src/App.tsx`
Probleme : La page Dashboard est importée statiquement. Elle charge recharts même si l'utilisateur ne visite jamais /dashboard.
Prompt : "Lazy-load la page Dashboard dans App.tsx avec React.lazy et Suspense pour éviter de charger recharts dans le bundle principal."

**[P2-04]** | 🏷️ UX | 📄 `src/hooks/useDashboardStats.ts`
Probleme : La dépendance `[user]` du useEffect peut causer des re-fetches inutiles si l'objet user change de référence.
Prompt : "Dans `useDashboardStats.ts`, change la dépendance du useEffect de `[user]` à `[user?.id]` pour éviter les re-fetches inutiles quand l'objet user change de référence sans changer d'identité."

### Tableau de synthese

| ID | Priorité | Domaine | Effort | Dépendances |
|----|----------|---------|--------|-------------|
| P0-01 | 🔴 Bloquant | Performance | 1 prompt | Aucune |
| P0-02 | 🔴 Bloquant | Performance | 1 prompt | Aucune |
| P1-01 | 🟠 Important | Sécurité | 1 prompt | Aucune |
| P1-02 | 🟠 Important | Code Quality | 1 prompt | Aucune |
| P1-03 | 🟠 Important | Documentation | 1 prompt | P0 résolus |
| P2-01 | 🟡 Amélioration | Tests | 2-3 prompts | P1 résolus |
| P2-02 | 🟡 Amélioration | Tests | 1 prompt | P1 résolus |
| P2-03 | 🟡 Amélioration | Performance | 1 prompt | Aucune |
| P2-04 | 🟡 Amélioration | UX | 1 prompt | Aucune |

### Ordre d'execution recommande

**ETAPE 1** — P0-01 + P0-02 (index + limit) → pin version
**ETAPE 2** — P1-01 + P1-02 + P1-03 (sécurité + types + docs) → pin version
**ETAPE 3** — P2-01 à P2-04 (tests + lazy load) → prochain sprint

---

## PHASE 10 — CONTENU POUR FICHIERS .MD

### Diff `sprint-backlog.md`

```
## Sprint P3 — Polish & Power Features (2026-03-08)

### ✅ Complétés
- [x] P3-01 | Auth + Cloud | Authentification email/password + table saved_queries avec RLS
- [x] P3-02 | StepSelect.tsx | Preview live de la requête avec compteur caractères
- [x] P3-03 | Multi-catégories | Sélection multiple de familles métier
- [x] P3-04 | Mobile polish | Touch targets 44px, sticky buttons, responsive
- [x] P3-05 | Raccourcis clavier | Ctrl+Enter, Escape, Ctrl+C

### Sprint P4 — Post-audit (issu de l'audit du 2026-03-08)

## 🔴 P0 — Bloquant
- [ ] P0-01 | Performance | useDashboardStats.ts | Ajouter limit/pagination sur usage_events
- [ ] P0-02 | Performance | migrations | Index sur usage_events(created_at, user_id)

## 🟠 P1 — Important
- [ ] P1-01 | Sécurité | migrations | Validation INSERT policy usage_events
- [ ] P1-02 | Code Quality | useUsageTracking + useDashboardStats | Supprimer as any
- [ ] P1-03 | Documentation | memory.md + sprint-backlog.md + security-backlog.md | MAJ

## 🟡 P2 — Amélioration
- [ ] P2-01 | Tests | useAuth, useKeyboardShortcuts, useDashboardStats | Tests unitaires
- [ ] P2-02 | Tests | useSavedQueries | Tests mode cloud
- [ ] P2-03 | Performance | App.tsx | Lazy-load Dashboard
- [ ] P2-04 | UX | useDashboardStats | Fix dépendance user → user?.id
```

### Diff `memory.md`

```
## Known Issues & Technical Debt
Mis à jour le : 2026-03-08 (post-audit P3)

- OG image still uses generic Lovable placeholder (needs branded image)
- Knowledge file not configured in Lovable settings
- useDashboardStats: requête usage_events sans limit() — tronquée à 1000 rows
- useUsageTracking / useDashboardStats : casts `as any` à supprimer
- usage_events INSERT policy trop permissive (WITH CHECK true)
- 5 nouveaux fichiers sans tests unitaires

## Documentation Status
- Knowledge file : absent
- Dernière synchronisation doc/code : 2026-03-08 (P3 audit)
- README.md : à jour

## Testing Status
Dernière mise à jour : 2026-03-08 (post-audit P3)
Framework : Vitest + React Testing Library
Couverture actuelle : ~55% (baisse due aux nouveaux fichiers non testés)
Cible : 80% lignes / 80% fonctions / 70% branches
Fichiers sans tests : useAuth, useKeyboardShortcuts, useUsageTracking, useDashboardStats, Dashboard.tsx
Commandes :
  npx vitest          → watch mode
  npx vitest run      → CI mode
  npx vitest --coverage → rapport coverage

## Security Status
Dernier audit : 2026-03-08 (post-sprint P3)
Score : 7/10
P0 ouverts : 2 (performance)
P1 ouverts : 3 (sécurité + code + docs)
Tables : saved_queries (RLS stricte), usage_events (RLS permissive INSERT)
Auth : Supabase Auth email/password (auto-confirm désactivé)
Edge functions : parse-natural-query (verify_jwt=false, CORS *)
Prochain audit recommandé : après résolution P0+P1

## Session du 2026-03-08 — Sprint P3
Fichiers modifiés : 20
Nouvelles features : Auth, Cloud queries, Dashboard analytics, Multi-catégories, Live preview, Raccourcis clavier, Mobile polish
Issues découverts : 9 (2 P0, 3 P1, 4 P2)
Décision deploy : 🟠 Déployable avec précautions
Dette technique ajoutée : as any casts, tests manquants, docs obsolètes

## Sprints actifs
P0 ouverts : 2 → à traiter en priorité absolue
P1 ouverts : 3 → session suivante
P2 ouverts : 4 → backlog
Dernier audit 24h : 2026-03-08 — score 6/10
```

