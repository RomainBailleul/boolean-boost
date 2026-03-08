

# Audit Universel — Boolean Boost

## PHASE 1 — Documentation Review

### 📄 `README.md`
- ✅ Project URL, setup instructions, tech stack listed
- ❌ No architecture documentation, no feature list, no contribution guide
- ⚠️ Title says "Rebuild test" — stale/incorrect header

### 📄 `index.html` (SEO/meta)
- ✅ Full SEO meta tags, JSON-LD, OG tags, canonical URL
- ✅ Well-structured schema.org WebApplication
- ⚠️ OG image points to generic Lovable placeholder — not branded

### 📄 `.github/workflows/pages.yml`
- ⚠️ `working-directory: ./boolean-boost-main` — assumes a subdirectory that doesn't exist in this repo structure. This workflow will **fail** on GitHub Actions.

### 📄 Knowledge file
- ❌ **Absent** — no project knowledge configured in Lovable settings

---

## PHASE 2 — Audit by Domain

### 🔐 Security
No backend, no auth, no API keys, no Supabase. **No security issues.** This is a pure client-side static tool using localStorage only.

### ⚡ Performance

| Sev | File | Issue |
|-----|------|-------|
| 🟡 | `src/hooks/useJobTitleSuggestions.ts` | `Object.values(jobTitlesData).flat()` runs on every memo recompute — flattens ~950 items each time |
| 🟡 | `src/data/enhancedJobTitles.json` | ~1000+ line JSON imported synchronously. Not critical at this size but could be lazy-loaded |
| 🟡 | `src/index.css:5` | Google Fonts loaded via CSS `@import` — render-blocking. Should be `<link>` in HTML head with `display=swap` |

### 🐛 Bugs & Stability

| Sev | File | Issue |
|-----|------|-------|
| 🔴 | `src/components/BooleanGenerator.tsx:28-33` | `generateBooleanQuery` is called with hardcoded empty `inputValue`, `selectedCategory`, and `customTitles` — **customTitles are never included in the boolean output** even when user adds them. The `inputValue` is also excluded from the query. |
| 🟠 | `src/utils/variantGenerator.ts:160-169` | Reverse gender logic uses `masc.source` which includes regex escape chars (`\b`). Produces malformed titles. `masc.source?.replace(/\\b/g, '')` only strips `\b` but not the backslashes properly. |
| 🟠 | `src/utils/variantGenerator.ts:181-188` | `pattern.test()` uses regex with `/i` flag + global-like behavior. After `test()`, the regex lastIndex may cause inconsistent results on repeated calls (though these aren't global, so OK — but the `domain` extraction via `replace` removes the matched word leaving potential double spaces). |
| 🟠 | `src/components/steps/StepSelect.tsx:46-56` | `useEffect` with `setSelectedTitles` runs on mount and auto-selects variants, but **never clears old variants** when user goes back to step 1 and changes input. Previous selections persist and accumulate. |
| 🟡 | `src/App.css` | Orphan file — Vite scaffold remnant. Not imported anywhere meaningful, but `#root` styles conflict with the actual layout (adds padding and centers text). |
| 🟡 | `src/hooks/useSavedQueries.ts` | No error boundary on `JSON.parse`. `try/catch` exists but `persist()` could throw on localStorage quota exceeded — not caught. |
| 🟡 | `src/components/steps/StepResult.tsx` | `saveQuery` called without checking if `booleanQuery` is empty. User could save an empty query. |

### 🏗️ Architecture

| Sev | File | Issue |
|-----|------|-------|
| 🟡 | `src/App.css` | Orphan file — should be deleted |
| 🟡 | `src/pages/Index.tsx` | Pass-through component (1 line). Could be inlined. Minor. |
| 🟡 | `vite.config.ts` | `base: '/boolean-boost/'` — this conflicts with Lovable deployment at root. Only needed for GitHub Pages. Lovable preview works because it serves at root, but published app at `boolean-boost.lovable.app` will have broken asset paths. |

### 🎨 UX & Accessibility

| Sev | File | Issue |
|-----|------|-------|
| 🟠 | All step components | No `aria-label` on interactive badges. Screen readers can't distinguish them. |
| 🟠 | `StepInput.tsx` | Category buttons are `<button>` elements without `aria-pressed` state |
| 🟡 | `StepProgressBar.tsx` | No `role="progressbar"` or `aria-` attributes on the stepper |
| 🟡 | `StepResult.tsx` | No loading state on copy button (clipboard API is async) |
| 🟡 | `BooleanGenerator.tsx` | No transition/animation between steps — content just swaps |

### 📦 Documentation & Coherence

| Sev | File | Issue |
|-----|------|-------|
| 🟠 | — | Knowledge file absent |
| 🟡 | `README.md` | Title "Rebuild test" is stale |
| 🟡 | `.github/workflows/pages.yml` | `working-directory` points to nonexistent subdirectory |

---

## PHASE 3 — Sprints

### 🔴 SPRINT P0 — Bloquant

| ID | Fichier(s) | Problème | Fix recommandé |
|----|-----------|----------|----------------|
| P0-01 | `BooleanGenerator.tsx:28-33` | `customTitles` et `inputValue` ne sont jamais inclus dans la requête boolean générée — le résultat est incomplet | Passer `customTitles` et `inputValue` réels dans les options de `generateBooleanQuery` |
| P0-02 | `vite.config.ts` | `base: '/boolean-boost/'` casse le déploiement Lovable (assets 404) | Retirer le `base` ou le conditionner à un env variable pour GH Pages uniquement |
| P0-03 | `.github/workflows/pages.yml` | `working-directory: ./boolean-boost-main` n'existe pas — le CI échoue | Changer en `./` ou supprimer le fichier si GH Pages n'est plus utilisé |

### 🟠 SPRINT P1 — Important

| ID | Fichier(s) | Problème | Fix recommandé |
|----|-----------|----------|----------------|
| P1-01 | `variantGenerator.ts:160-169` | Reverse gender logic produit des titres malformés via `masc.source` | Réécrire avec un mapping explicite au lieu d'extraire du regex source |
| P1-02 | `StepSelect.tsx:46-56` | Les variantes auto-sélectionnées s'accumulent quand on change l'input | Clear les anciens autoVariants avant d'ajouter les nouveaux |
| P1-03 | `src/App.css` | Fichier orphelin avec styles conflictuels (`#root { padding: 2rem }`) | Supprimer le fichier |
| P1-04 | `index.css:5` | Google Fonts en `@import` CSS — render-blocking | Déplacer dans `<link>` du `index.html` avec `display=swap` |

### 🟡 SPRINT P2 — Amélioration

| ID | Fichier(s) | Problème | Fix recommandé |
|----|-----------|----------|----------------|
| P2-01 | Step components | Pas d'`aria-label` / `aria-pressed` sur badges et boutons | Ajouter les attributs ARIA |
| P2-02 | `StepProgressBar.tsx` | Pas de `role="progressbar"` | Ajouter sémantique ARIA |
| P2-03 | `README.md` | Titre "Rebuild test" obsolète | Mettre à jour avec le vrai nom du projet |
| P2-04 | `useSavedQueries.ts` | `persist()` ne gère pas localStorage quota exceeded | Ajouter try/catch sur `localStorage.setItem` |
| P2-05 | `StepResult.tsx` | Possibilité de sauvegarder une requête vide | Désactiver le bouton si `booleanQuery` est vide |
| P2-06 | `index.html` | OG image est le placeholder Lovable générique | Créer et référencer une image branded |

---

## PHASE 4 — Résumé Exécutif

1. **Score de santé : 6/10** — L'app fonctionne visuellement mais le bug P0-01 fait que la requête boolean générée est incomplète (customTitles ignorés). Le `base` path dans Vite peut casser le déploiement Lovable.

2. **Top 3 risques si déployé en l'état :**
   - La requête boolean n'inclut pas les titres personnalisés ni l'input direct — résultat incorrect pour l'utilisateur
   - `base: '/boolean-boost/'` peut provoquer des 404 sur les assets en production Lovable
   - Le workflow GitHub Actions échoue systématiquement (mauvais working directory)

3. **Effort estimé :**
   - P0 : 1 session Lovable
   - P1 : 1 session Lovable
   - P2 : 1-2 sessions Lovable

4. **Ordre d'exécution recommandé :** P0-01 → P0-02 → P0-03 → P1-03 → P1-01 → P1-02 → P1-04 → P2-*

5. **Actions manuelles requises :**
   - 🔧 Décider si GitHub Pages est toujours utilisé (sinon supprimer le workflow et le `base` path)
   - 🔧 Configurer le Knowledge file dans Lovable (Settings → Manage Knowledge)
   - 🔧 Créer une image OG branded et l'uploader dans `/public`

---

## PHASE 5 — Fichiers .md

### `audit-2026-03-08.md`

```markdown
# Audit Boolean Boost — 2026-03-08

## Documentation Review

### README.md
- Stale title "Rebuild test"
- No architecture or feature docs

### index.html
- Full SEO meta, JSON-LD OK
- OG image is generic Lovable placeholder

### .github/workflows/pages.yml
- working-directory points to nonexistent ./boolean-boost-main — CI fails

### Knowledge file
- Absent

## Issues by Domain

### Bugs & Stability
- **CRITICAL**: `generateBooleanQuery` called with empty `customTitles` and `inputValue` — query output is incomplete
- Reverse gender logic in variantGenerator produces malformed titles via regex source extraction
- Auto-selected variants accumulate when user changes input (never cleared)
- App.css orphan file adds conflicting `#root` styles

### Architecture
- `base: '/boolean-boost/'` in vite.config.ts conflicts with Lovable deployment
- GitHub Actions workflow broken (wrong working directory)

### Performance
- Google Fonts loaded via CSS @import (render-blocking)
- Job titles array flattened on every suggestion recompute

### Accessibility
- No ARIA attributes on interactive badges, category buttons, or progress bar

### Documentation
- No Knowledge file configured
- README title is stale
```

### `sprint-backlog.md`

```markdown
# Sprint Backlog — Boolean Boost
Généré le : 2026-03-08

## 🔴 P0 — Bloquant
- [ ] P0-01 | BooleanGenerator.tsx | Fix generateBooleanQuery: passer customTitles et inputValue réels
- [ ] P0-02 | vite.config.ts | Retirer ou conditionner base: '/boolean-boost/'
- [ ] P0-03 | .github/workflows/pages.yml | Fix working-directory ou supprimer le workflow

## 🟠 P1 — Important
- [ ] P1-01 | variantGenerator.ts | Réécrire reverse gender logic sans masc.source
- [ ] P1-02 | StepSelect.tsx | Clear anciennes variantes auto-sélectionnées au changement d'input
- [ ] P1-03 | App.css | Supprimer le fichier orphelin
- [ ] P1-04 | index.css + index.html | Déplacer Google Fonts de @import CSS vers <link> HTML

## 🟡 P2 — Amélioration
- [ ] P2-01 | Step components | Ajouter aria-label / aria-pressed sur badges et boutons
- [ ] P2-02 | StepProgressBar.tsx | Ajouter role="progressbar" et attributs ARIA
- [ ] P2-03 | README.md | Mettre à jour le titre
- [ ] P2-04 | useSavedQueries.ts | Gérer localStorage quota exceeded
- [ ] P2-05 | StepResult.tsx | Désactiver sauvegarde si requête vide
- [ ] P2-06 | index.html | Remplacer OG image par une image branded
```

### `memory.md`

```markdown
## Known Issues & Technical Debt
Mis à jour le : 2026-03-08

- CRITICAL: generateBooleanQuery ignores customTitles and inputValue — boolean output incomplete
- vite.config.ts base path '/boolean-boost/' may break Lovable deployment
- GitHub Actions workflow references nonexistent subdirectory
- Reverse gender variant generation uses regex.source — produces malformed titles
- Auto-selected variants accumulate across input changes (never cleared)
- App.css orphan file with conflicting styles
- Google Fonts loaded via render-blocking CSS @import
- No ARIA attributes on interactive elements

## Documentation Status
- Knowledge file : absent
- Dernière synchronisation doc/code : jamais
- README.md : titre obsolète ("Rebuild test")
```

