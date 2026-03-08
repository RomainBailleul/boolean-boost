# Audit Tests — Boolean Boost
Date : 2026-03-08
Stack : Vitest + React Testing Library + TypeScript

## Couverture actuelle estimée
- Fichiers testés : 8 / 10 fichiers source
- Couverture lignes estimée : ~90%
- Tests générés : ~100 cas de test

## Fichiers testés

### P0 (critique) ✅
- [x] src/utils/queryGenerator.ts — 20 tests (normalizeForSearch, calculateRelevanceScore, getSortedSuggestions, generateBooleanQuery)
- [x] src/utils/variantGenerator.ts — 17 tests (acronymes, genre, traductions, seniority, edge cases)

### P1 (important) ✅
- [x] src/hooks/useSavedQueries.ts — 9 tests (CRUD, localStorage, error handling)
- [x] src/hooks/useJobTitleSuggestions.ts — 5 tests (matching, limits, empty states)

### P2 (confort) ✅
- [x] src/components/StepProgressBar.tsx — 4 tests (rendu, accessibilité, completed states)
- [x] src/components/steps/StepInput.tsx — 14 tests (mode toggle, catégories, validation, keyboard)
- [x] src/components/steps/StepSelect.tsx — 15 tests (badges, custom input, navigation, variants)
- [x] src/components/steps/StepResult.tsx — 12 tests (copy, save, navigation, edge cases)
- [ ] src/components/BooleanGenerator.tsx — non testé (composant page, orchestration)
- [ ] src/lib/utils.ts — non testé (trivial, cn wrapper)

## Commandes
```bash
npx vitest          # watch mode
npx vitest run      # CI mode
npx vitest --coverage  # rapport coverage
```
