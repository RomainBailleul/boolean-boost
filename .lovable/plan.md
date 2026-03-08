

# Sprint P3 — Polish & Power Features

All P0 (core fixes), P1 (templates, location, dark mode, sharing), and P2 (NLP, seniority, export, micro-interactions) are complete. P3 focuses on usability polish, query intelligence, and mobile experience.

---

## P3-01 | Historique des requêtes persistant (Cloud)

Currently saved queries use `localStorage` only. Migrate to a `saved_queries` database table so queries persist across devices for logged-in users, while keeping localStorage as fallback for anonymous users.

- Create `saved_queries` table (`id`, `user_id`, `label`, `query`, `titles_count`, `platform`, `location`, `created_at`)
- Add basic email/password auth (signup + login)
- Update `useSavedQueries` hook to read/write from database when authenticated, localStorage otherwise
- RLS: users can only CRUD their own rows

## P3-02 | Query preview en temps réel (Step 2)

Add a live collapsible preview of the boolean query at the bottom of StepSelect, so users see the impact of each badge toggle instantly without navigating to Step 3.

- Add collapsible panel at the bottom of `StepSelect.tsx` with the generated query preview
- Show live character count with platform limit indicator
- Use `framer-motion` for smooth expand/collapse

## P3-03 | Combinaison multi-catégories

Currently category mode allows selecting only one category. Allow selecting multiple categories to combine titles across job families (e.g. Marketing + Sales).

- Change `selectedCategory: string` to `selectedCategories: string[]` in BooleanGenerator state
- Update StepInput category grid to support multi-select with checkmarks
- Update StepSelect to merge titles from all selected categories
- Update queryGenerator to handle multiple categories

## P3-04 | Responsive mobile polish

Improve touch targets, spacing, and scroll behavior on small screens.

- Increase badge touch targets to min 44px height on mobile
- Add sticky "Generate" / "Copy" buttons at bottom on mobile viewport
- Fix horizontal overflow on long queries in textarea
- Add swipe gesture hint between steps (optional)

## P3-05 | Keyboard shortcuts

Add power-user keyboard shortcuts for common actions.

- `Ctrl/Cmd + Enter` → advance to next step from any step
- `Ctrl/Cmd + C` on Step 3 → copy query (when textarea not focused)
- `Escape` → go back one step
- Show shortcut hints as tooltips on buttons

---

## Technical notes

- **P3-01** requires a database migration (one table + RLS) and an auth flow. This is the biggest item.
- **P3-02 through P3-05** are pure frontend changes with no backend dependency.
- All items are independent and can be implemented in any order.

