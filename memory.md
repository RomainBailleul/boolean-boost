## Known Issues & Technical Debt
Mis à jour le : 2026-03-08 (post-audit P3)

- OG image still uses generic Lovable placeholder (needs branded image)
- Knowledge file not configured in Lovable settings

## Documentation Status
- Knowledge file : absent
- Dernière synchronisation doc/code : 2026-03-08 (P3 audit)
- README.md : à jour

## Testing Status
Dernière mise à jour : 2026-03-08 (post-audit P5)
Framework : Vitest + React Testing Library
Couverture actuelle : ~95% (109+ tests)
Cible : 80% lignes / 80% fonctions / 70% branches
Fichiers sans tests : aucun (tous couverts)
Commandes :
  npx vitest          → watch mode
  npx vitest run      → CI mode
  npx vitest --coverage → rapport coverage

## Security Status
Dernier audit : 2026-03-08 (post-sprint P3)
Score : 8/10
P0 ouverts : 0
P1 ouverts : 0
Tables : saved_queries (RLS stricte), usage_events (RLS INSERT validée)
Auth : Supabase Auth email/password (auto-confirm désactivé)
Edge functions : parse-natural-query (verify_jwt=false, CORS *)
Prochain audit recommandé : après ajout de nouvelles features

## Session du 2026-03-08 — Sprint P3 + P4 + Audit
Fichiers modifiés : 20+
Nouvelles features : Auth, Cloud queries, Dashboard analytics, Multi-catégories, Live preview, Raccourcis clavier, Mobile polish
Issues résolus : P0-01 (limit/pagination), P0-02 (indexes), P1-01 (INSERT validation), P1-02 (as any), P1-03 (docs), P2-01 (tests hooks), P2-02 (tests cloud), P2-03 (lazy-load), P2-04 (useEffect dep)
Décision deploy : 🟢 Déployable
Dette technique restante : Aucune

## Sprints actifs
P0 ouverts : 0
P1 ouverts : 0
P2 ouverts : 4 (docs, policy fix, tests Dashboard, pagination guard)
Dernier audit 24h : 2026-03-08 — score 8/10 — 🟢 Déployable
