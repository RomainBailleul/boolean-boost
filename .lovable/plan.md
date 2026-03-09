

## État actuel

- **P2-03** (Coachmarks) et **P2-05** (Animation première copie) sont **implémentés** mais non cochés dans `sprint-backlog.md`.
- **3 items P2 restants** : P2-01, P2-02, P2-04.

## Actions immédiates

1. **Mettre à jour sprint-backlog.md** : cocher P2-03 et P2-05 comme terminés.

## Sprint P7 — Différenciateurs restants

### 🟡 P2-01 | Templates communautaires (impact PMF)
- Créer une table `query_templates` (id, user_id, title, query, categories, platform, is_public, created_at) avec RLS.
- Ajouter une page `/templates` listant les templates publics avec recherche/filtre.
- Permettre aux utilisateurs connectés de publier un template depuis StepResult ("Partager comme template").
- Bouton "Utiliser" qui pré-remplit le générateur.

### 🟡 P2-02 | Freemium avec limites (impact Growth)
- Créer une backend function `check-usage-limit` qui compte les `usage_events` du jour pour l'utilisateur.
- Limites : 5 requêtes/jour pour les anonymes (via fingerprint localStorage), 20/jour pour les connectés, illimité pour les admins.
- Afficher un modal "Limite atteinte — créez un compte gratuit" ou "Revenez demain" avec compteur.
- Modifier `BooleanGenerator.tsx` pour vérifier la limite avant génération.

### 🟡 P2-04 | Digest hebdomadaire email (impact Rétention)
- Créer une edge function `weekly-digest` qui agrège les stats de la semaine (requêtes, nouveaux templates, feedback).
- Ajouter un champ `digest_opt_in` (default true) dans une table `user_preferences`.
- Utiliser un cron Supabase (pg_cron ou appel externe) pour déclencher l'envoi chaque lundi.
- Email envoyé via Supabase Auth / Resend avec template HTML simple.

### Ordre recommandé
1. **P2-01** (templates) — forte valeur PMF, pas de dépendance externe.
2. **P2-02** (freemium) — monétisation, logique simple.
3. **P2-04** (digest) — nécessite un service email, plus complexe.

### Score estimé après P2 : 93/100

