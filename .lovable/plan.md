

# Test Audit & Generation Plan — Boolean Boost

## Phase 1 — Current State

- **Tests existants** : 0
- **Configuration Vitest** : absente
- **MSW** : non installé (non nécessaire — pas de backend)
- **Couverture actuelle** : 0%

## Cartographie des unités testables

| Fichier | Type | Complexité | Priorité | Testé ? |
|---------|------|-----------|----------|---------|
| `src/utils/queryGenerator.ts` | Utilitaire pur | Moyenne | **P0** | Non |
| `src/utils/variantGenerator.ts` | Utilitaire pur | Elevee | **P0** | Non |
| `src/hooks/useSavedQueries.ts` | Hook custom | Moyenne | **P1** | Non |
| `src/hooks/useJobTitleSuggestions.ts` | Hook custom | Faible | **P1** | Non |
| `src/lib/utils.ts` | Utilitaire pur | Faible | **P2** | Non |
| `src/components/StepProgressBar.tsx` | Composant UI | Faible | **P2** | Non |
| `src/components/BooleanGenerator.tsx` | Composant page | Elevee | **P2** | Non |
| `src/components/steps/StepInput.tsx` | Composant UI | Moyenne | **P2** | Non |
| `src/components/steps/StepSelect.tsx` | Composant UI | Elevee | **P2** | Non |
| `src/components/steps/StepResult.tsx` | Composant UI | Moyenne | **P2** | Non |

## Phase 2 — Configuration

Create 3 new files:

1. **`vitest.config.ts`** — Vitest config with jsdom, globals, setup file, path aliases
2. **`src/test/setup.ts`** — jest-dom import, cleanup, matchMedia/IntersectionObserver/ResizeObserver mocks
3. **`src/test/utils/render.tsx`** — `renderWithProviders` wrapper with BrowserRouter + QueryClientProvider + TooltipProvider

Also update `tsconfig.app.json` to add `"vitest/globals"` to types, and add test deps to `package.json`.

## Phase 3 — Test Files to Generate

### P0 — Core business logic (6 test files → ~40 tests)

**`src/utils/__tests__/queryGenerator.test.ts`**
- `generateBooleanQuery`: free mode, category mode, deduplication, empty input, missing category
- `normalizeForSearch`: accents, casing, whitespace
- `calculateRelevanceScore`: exact match (1000), startsWith (800), contains (600), word matches, no match (0)
- `getSortedSuggestions`: sorting order, maxResults limit, empty search

**`src/utils/__tests__/variantGenerator.test.ts`**
- `generateVariants`: acronym expansion (DRH → all FR/EN variants), gender reversal (Directrice → Directeur), FR↔EN translation, seniority variants (Director → Head of/VP), empty input, unknown title (returns original only)

### P1 — Custom hooks (2 test files → ~12 tests)

**`src/hooks/__tests__/useSavedQueries.test.ts`**
- Initial load from localStorage, save new query, delete query, handle corrupted localStorage, handle quota exceeded

**`src/hooks/__tests__/useJobTitleSuggestions.test.ts`**
- Returns suggestions matching input, returns empty for blank input, respects maxSuggestions

### P2 — UI components (1 test file → ~5 tests)

**`src/components/__tests__/StepProgressBar.test.tsx`**
- Renders all steps, highlights current step, shows check for completed steps, has accessible progressbar role

## Phase 4 — Documentation

Generate:
- **`testing-audit-2026-03-08.md`** — audit report
- **`test-backlog.md`** — prioritized backlog
- Update **`memory.md`** with Testing Status section

## Summary

- 9 new files total (3 config + 5 test files + 1 doc update)
- ~57 test cases covering all business logic
- Target coverage: 90%+ on P0 files, 80%+ on P1

