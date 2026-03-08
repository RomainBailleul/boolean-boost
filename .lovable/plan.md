

# Audit Universel — Boolean Boost (2026-03-08, post-fix)

## PHASE 1 — Documentation Review

### 📄 `README.md`
- ✅ Title and description now accurate ("Boolean Boost — Générateur de requêtes Boolean LinkedIn")
- ✅ Setup instructions, tech stack, deployment info present

### 📄 `index.html`
- ✅ Full SEO meta tags, JSON-LD, canonical, OG, Twitter cards
- ⚠️ OG image still uses generic Lovable placeholder (`lovable.dev/opengraph-image-p98pqg.png`)

### 📄 `audit-2026-03-08.md`
- ✅ Complete audit record with all fixes documented

### 📄 `sprint-backlog.md`
- ✅ All P0/P1/P2 items marked as done except P2-06 (OG image, manual)

### 📄 `memory.md`
- ✅ Known issues and documentation status documented
- ✅ Synced with current code state

### 📄 `.github/workflows/pages.yml`
- ✅ Fixed — working-directory removed, artifact path corrected

### Knowledge file
- ❌ Still absent — requires manual configuration in Lovable Settings

---

## PHASE 2 — Audit of Current Codebase

### 🔐 Security
No issues. Pure client-side app, no auth, no API keys, no backend.

### 🐛 Bugs & Stability

| Sev | File | Issue |
|-----|------|-------|
| 🟠 | `variantGenerator.ts:160-162` | **P1-01 was NOT actually fixed.** The reverse gender logic still uses `masc.source.replace(/\\b/g, '')` which produces strings like `Directeur` correctly for simple cases but will fail for patterns with special regex chars. The previous audit flagged this and claimed it was fixed, but the code is unchanged. |
| 🟠 | `queryGenerator.ts:22-28` | In free mode, `inputValue` is included as a raw title in the boolean query alongside `selectedTitles`. If the user typed "DRH" and auto-variants include "DRH", it will appear twice: once from `inputValue` and once from `selectedTitles`. Duplicates in the OR query. |
| 🟡 | `useSavedQueries.ts:32-42` | `saveQuery` uses a closure over `savedQueries` state. If called rapidly twice, second call may overwrite first due to stale closure. Should use functional setState pattern inside `persist`. |
| 🟡 | `StepResult.tsx:127-128` | Save button disabled only on empty `booleanQuery`, but user can save with empty `saveLabel` — generates auto-label, which is fine, but the `onKeyDown` handler calls `handleSave` on Enter even when `booleanQuery` is empty (the button is disabled but keyboard shortcut bypasses it). |

### ⚡ Performance

| Sev | File | Issue |
|-----|------|-------|
| 🟡 | `useJobTitleSuggestions.ts` | `Object.values(jobTitlesData).flat()` called on every recompute. Should memoize the flat array separately since `jobTitlesData` is a static import. |

### 🏗️ Architecture

| Sev | File | Issue |
|-----|------|-------|
| 🟡 | `variantGenerator.ts:30-46` | `GENDER_PATTERNS` uses regex objects with `/g` flag as constants. Global regexes retain `lastIndex` state between calls. Since `generateGenderVariant` calls `.replace()` (which resets lastIndex), this works, but the pattern is fragile. |
| 🟡 | `StepSelect.tsx:46-60` | `useEffect` depends on `setSelectedTitles` (a setState dispatcher, stable ref) — harmless but unnecessary in deps array. |

### 🎨 UX & Accessibility

| Sev | File | Issue |
|-----|------|-------|
| 🟡 | `StepSelect.tsx:154-163` | Custom title badges lack `aria-label` and `role="checkbox"` unlike auto-variant badges above. Inconsistent accessibility. |
| 🟡 | `StepResult.tsx:182-199` | Copy/delete buttons on saved queries use `opacity-0 group-hover:opacity-100` — completely invisible on touch devices with no hover. |

### 📦 Documentation
- ⚠️ Knowledge file still absent (manual action required)
- ⚠️ P2-06 OG image still placeholder (manual action required)

---

## PHASE 3 — Sprints

### 🔴 P0 — Bloquant

No P0 issues. Previous P0s were all resolved.

### 🟠 P1 — Important

| ID | Fichier(s) | Problème | Fix recommandé |
|----|-----------|----------|----------------|
| P1-01 | `variantGenerator.ts:160-162` | Reverse gender logic still uses `masc.source` — not actually fixed from prior audit | Replace with explicit `GENDER_MAP` object `{ masc: string, fem: string }[]` instead of extracting from regex source |
| P1-02 | `queryGenerator.ts:22-28` | `inputValue` duplicated in boolean output when also present in `selectedTitles` | Deduplicate titles with a `Set` before generating the OR query |

### 🟡 P2 — Amélioration

| ID | Fichier(s) | Problème | Fix recommandé |
|----|-----------|----------|----------------|
| P2-01 | `StepSelect.tsx:154-163` | Custom badges missing `role="checkbox"` and `aria-label` | Add matching ARIA attributes |
| P2-02 | `StepResult.tsx:182-199` | Copy/delete buttons invisible on touch (opacity-0 on no hover) | Use `opacity-100 sm:opacity-0 sm:group-hover:opacity-100` |
| P2-03 | `useSavedQueries.ts:40` | Stale closure risk in `saveQuery` if called rapidly | Use `setSavedQueries(prev => ...)` inside persist |
| P2-04 | `useJobTitleSuggestions.ts` | Flat array recomputed every render | Memoize `allTitles` separately from suggestions |
| P2-05 | `StepResult.tsx:127` | Enter key on save input bypasses disabled state | Add `&& booleanQuery.trim()` guard in onKeyDown |

---

## PHASE 4 — Résumé Exécutif

1. **Score de santé : 8/10** — All previous P0 blockers resolved. App is functional and deployable. Remaining issues are quality/polish items. The `masc.source` issue is the most impactful remaining bug (produces incorrect gender reversals for some edge cases).

2. **Top 3 risques si déployé :**
   - Reverse gender variants may produce malformed titles for certain feminine inputs (P1-01)
   - Duplicate titles in boolean output inflate query length (P1-02)
   - Saved query buttons invisible on mobile/touch devices (P2-02)

3. **Effort estimé :**
   - P1: 1 session Lovable
   - P2: 1 session Lovable

4. **Ordre d'exécution :** P1-01 → P1-02 → P2-02 → P2-01 → P2-03 → P2-05 → P2-04

5. **Actions manuelles requises :**
   - 🔧 Configure Knowledge file in Lovable Settings → Manage Knowledge
   - 🔧 Create branded OG image and upload to `/public`

---

## PHASE 5 — Fichiers .md

### `audit-2026-03-08-v2.md`

```markdown
# Audit Boolean Boost — 2026-03-08 (v2, post-fix)

## Documentation Review
- README.md: ✅ Up to date
- index.html: ✅ SEO complete, ⚠️ OG image still placeholder
- sprint-backlog.md: ✅ Reflects completed work
- memory.md: ✅ Synced
- Knowledge file: ❌ Absent

## Remaining Issues

### 🟠 P1 — Important
- P1-01: variantGenerator.ts:160-162 — reverse gender still uses masc.source (unfixed from v1)
- P1-02: queryGenerator.ts — inputValue duplicated in boolean output

### 🟡 P2 — Amélioration
- P2-01: Custom badges in StepSelect missing ARIA attributes
- P2-02: Saved query action buttons invisible on touch devices
- P2-03: Stale closure in useSavedQueries.saveQuery
- P2-04: allTitles flat array not memoized in useJobTitleSuggestions
- P2-05: Enter key bypasses disabled save button
```

### `sprint-backlog.md`

```markdown
# Sprint Backlog — Boolean Boost
Généré le : 2026-03-08 (v2)

## 🔴 P0 — Bloquant
(aucun)

## 🟠 P1 — Important
- [ ] P1-01 | variantGenerator.ts | Réécrire reverse gender avec mapping explicite (masc.source toujours présent)
- [ ] P1-02 | queryGenerator.ts | Dédupliquer inputValue dans la requête boolean

## 🟡 P2 — Amélioration
- [ ] P2-01 | StepSelect.tsx | Ajouter aria-label/role sur badges custom
- [ ] P2-02 | StepResult.tsx | Rendre boutons copier/supprimer visibles sur mobile
- [ ] P2-03 | useSavedQueries.ts | Corriger stale closure dans saveQuery
- [ ] P2-04 | useJobTitleSuggestions.ts | Mémoiser le flat array des titres
- [ ] P2-05 | StepResult.tsx | Bloquer Enter sur save si requête vide
- [ ] P2-06 | index.html | Remplacer OG image (action manuelle)
```

### `memory.md`

```markdown
## Known Issues & Technical Debt
Mis à jour le : 2026-03-08

- variantGenerator reverse gender logic still uses masc.source (edge case malformed titles)
- queryGenerator free mode may duplicate inputValue in boolean output
- OG image still uses generic Lovable placeholder
- Knowledge file not configured in Lovable settings
- Saved query action buttons invisible on touch/mobile devices

## Documentation Status
- Knowledge file : absent
- Dernière synchronisation doc/code : 2026-03-08
- README.md : à jour
```

