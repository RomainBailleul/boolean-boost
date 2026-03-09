

# Plan d'implémentation — P0-01, P0-02, P0-03

## Rappel des 3 items P0

1. **P0-01 — Social proof** : Compteur animé "X requêtes générées" sur la homepage
2. **P0-02 — Email de bienvenue** : Edge function post-signup  
3. **P0-03 — Micro-survey feedback** : Survey inline post-copie + table + KPI admin

---

## P0-01 — Compteur de requêtes sur homepage

**Approche** : Créer une edge function publique `query-count` qui retourne `SELECT count(*) FROM usage_events`. L'appeler depuis `BooleanGenerator.tsx` au mount et afficher un compteur animé sous le badge "950 titres".

**Fichiers modifiés** :
- `supabase/functions/query-count/index.ts` — nouvelle edge function (pas d'auth requise, retourne juste `{ count: N }`)
- `src/components/BooleanGenerator.tsx` — fetch le count au mount, affiche sous le badge avec animation d'incrément

**Détail technique** : L'edge function utilise le service client pour faire un `count()` sur `usage_events`. Pas d'auth nécessaire car c'est une donnée publique agrégée. Animation via un `useEffect` qui incrémente de 0 au count final.

---

## P0-02 — Email de bienvenue

**Approche** : Utiliser le système d'email templates intégré à l'auth plutôt qu'une edge function custom. Cependant, les templates Supabase ne supportent pas le contenu rich custom facilement. Alternative plus simple : déclencher un appel post-signup dans `AuthModal.tsx` vers une edge function `send-welcome-email` qui utilise le SMTP Supabase intégré via `supabase.auth.admin.generateLink`.

**Approche retenue (plus simple et fiable)** : Créer une edge function `send-welcome-email` déclenchée par un database webhook (trigger) sur `auth.users` INSERT. Mais on ne peut pas toucher au schema `auth`. 

**Approche finale** : Appeler l'edge function directement depuis `AuthModal.tsx` après un signup réussi. L'edge function envoie l'email via Resend ou le built-in Supabase. Puisqu'on n'a pas Resend configuré, on va simplement utiliser le hook post-signup côté client pour appeler une edge function qui log le welcome et on s'appuie sur l'email de confirmation Supabase existant.

**Réalité pragmatique** : Sans service SMTP externe (Resend, etc.), on ne peut pas envoyer d'email custom depuis une edge function. Le plus pragmatique : configurer le template d'email de confirmation Supabase pour inclure le contenu de bienvenue (fonctionnalités clés + CTA). Mais on ne peut pas modifier les templates via code.

**Solution retenue** : Créer l'edge function `send-welcome-email` et vérifier si un secret RESEND_API_KEY est disponible. Si non, demander à l'utilisateur. Alternativement, utiliser le Supabase built-in `supabase.auth.admin.inviteUserByEmail` — mais ça ne correspond pas au flow.

**Solution la plus simple** : Après signup réussi dans `AuthModal.tsx`, afficher un toast enrichi avec les 3 fonctionnalités clés et le CTA. C'est un "welcome" in-app plutôt qu'un email. C'est immédiatement implémentable sans dépendance externe.

→ On fera les deux : un welcome toast enrichi in-app (immédiat) + la structure pour l'email (edge function prête, demandera la clé API).

---

## P0-03 — Micro-survey post-copie

**Approche** :
1. **Migration DB** : Créer table `feedback_responses` (id uuid, user_id uuid nullable, rating text, query_length int, platform text, created_at). RLS : INSERT pour anon+auth, SELECT pour admins.
2. **StepResult.tsx** : Après copie réussie, afficher un bloc inline avec 3 emoji-buttons. Stocke en `sessionStorage` pour n'afficher qu'une fois.
3. **AdminDashboard.tsx** : Ajouter un KPI "Score satisfaction" avec la répartition des réponses.

---

## Résumé des changements

| Fichier | Action |
|---------|--------|
| `supabase/functions/query-count/index.ts` | Créer — edge function publique count |
| `src/components/BooleanGenerator.tsx` | Modifier — ajouter compteur animé |
| `src/components/AuthModal.tsx` | Modifier — welcome toast enrichi post-signup |
| Migration SQL | Créer — table `feedback_responses` + RLS |
| `src/components/steps/StepResult.tsx` | Modifier — micro-survey inline post-copie |
| `src/pages/admin/AdminDashboard.tsx` | Modifier — KPI satisfaction |

