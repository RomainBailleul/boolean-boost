# Security Backlog — Boolean Boost
Généré le : 2026-03-08 (post-audit P3)
Score : 8/10

## 🚨 P0 — Critique
(aucun)

## 🔴 P1 — Élevé
(aucun)

## 🟠 P2 — Moyen
- [ ] P2-01 | Config | Deployment | Ajouter X-Frame-Options header si possible
- [x] P2-02 | Sécurité | usage_events INSERT policy validée (titles_count, categories, location, platform, mode)

## Notes
- Tables : saved_queries (RLS stricte per-user), usage_events (RLS INSERT validée, SELECT public)
- Auth : Supabase Auth email/password, auto-confirm désactivé
- Edge functions : parse-natural-query (verify_jwt=false — intentionnel, CORS *)
- Indexes : saved_queries(user_id), usage_events(created_at), usage_events(user_id)
