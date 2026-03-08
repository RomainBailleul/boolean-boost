## Known Issues & Technical Debt
Mis à jour le : 2026-03-08

- OG image still uses generic Lovable placeholder (needs branded image)
- Knowledge file not configured in Lovable settings

## Documentation Status
- Knowledge file : absent
- Dernière synchronisation doc/code : 2026-03-08
- README.md : à jour

## Testing Status
Dernière mise à jour : 2026-03-08
Framework : Vitest + React Testing Library
Couverture actuelle : ~75% (P0+P1 couverts)
Cible : 80% lignes / 80% fonctions / 70% branches
Fichiers P0 sans tests : aucun
Commandes :
  npx vitest          → watch mode
  npx vitest run      → CI mode
  npx vitest --coverage → rapport coverage

## Security Status
Dernier audit : 2026-03-08
Score : 9/10
P0 ouverts : 0
P1 ouverts : 0
Tables RLS manquantes : aucune (pas de Supabase)
Secrets à rotation : aucun
Prochain audit recommandé : lors de l'ajout d'un backend ou d'auth
