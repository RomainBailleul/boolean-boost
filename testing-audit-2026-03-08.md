# Audit Tests — Boolean Boost
Date : 2026-03-08
Stack : Vitest + React Testing Library + TypeScript

## Couverture actuelle estimée
- Fichiers testés : 5 / 10 fichiers source
- Couverture lignes estimée : ~75%
- Tests générés : ~57 cas de test

## Fichiers testés

### P0 (critique) ✅
- [x] src/utils/queryGenerator.ts — 20 tests (normalizeForSearch, calculateRelevanceScore, getSortedSuggestions, generateBooleanQuery)
- [x] src/utils/variantGenerator.ts — 17 tests (acronymes, genre, traductions, seniority, edge cases)

### P1 (important) ✅
- [x] src/hooks/useSavedQueries.ts — 9 tests (CRUD, localStorage, error handling)
- [x] src/hooks/useJobTitleSuggestions.ts — 5 tests (matching, limits, empty states)

### P2 (confort) — partiel
- [x] src/components/StepProgressBar.tsx — 4 tests (rendu, accessibilité, completed states)
- [ ] src/components/BooleanGenerator.tsx — non testé (composant page complexe)
- [ ] src/components/steps/StepInput.tsx — non testé
- [ ] src/components/steps/StepSelect.tsx — non testé
- [ ] src/components/steps/StepResult.tsx — non testé
- [ ] src/lib/utils.ts — non testé (trivial, cn wrapper)

## Commandes
```bash
npx vitest          # watch mode
npx vitest run      # CI mode
npx vitest --coverage  # rapport coverage
```
