

# Audit Admin Panel — Boolean Boost
Date : 2026-03-09

---

## PHASE 1 — CARTOGRAPHIE DE L'ADMIN EXISTANT

### 1.1 Découverte de la surface admin

**Routes admin :**

| Route | Fichier | Composant | Protection auth | Role requis |
|-------|---------|-----------|----------------|-------------|
| /dashboard | App.tsx | Dashboard | ✅ (ProtectedRoute) | Aucun (tout user authentifié) |

Il n'existe **aucune** route `/admin`, `/backoffice`, ou équivalent. Le `/dashboard` est la seule page protégée et sert de tableau de bord personnel, pas d'un panel admin.

**Composants admin identifiés :** Aucun. Pas de dossier `src/admin/`, `src/components/admin/`, ou `src/pages/admin/`.

**Hooks admin identifiés :** Aucun hook dédié à l'administration. Les hooks existants (`useDashboardStats`, `useAuth`) sont orientés utilisateur.

**Tables accédées depuis le "dashboard" :**

| Table | Opérations | RLS admin configuré | Filtre rôle |
|-------|-----------|--------------------|-----------| 
| usage_events | SELECT | ❌ (pas de rôle admin) | ❌ |
| saved_queries | SELECT (count) | ❌ | ❌ |

### 1.2 Modele de roles existant

**Définition des rôles :** Aucun systeme de rôles n'existe.
- Pas de table `user_roles`
- Pas de fonction `has_role()`
- Pas d'enum `app_role`
- Pas de champ `role` sur aucune table
- Pas de vérification de rôle dans le code React ni dans les RLS policies

**Application des rôles :**
- Guards de routes : React uniquement (vérifie `user` non-null, pas de rôle)
- Policies RLS différenciées par rôle : ❌
- Vérification dans les Edge Functions : ❌
- Un utilisateur peut-il s'auto-promouvoir : N/A (pas de rôles)

**Matrice de permissions actuelle :**

| Action | Anonyme | User authentifié |
|--------|---------|-----------------|
| Voir dashboard stats | ❌ | ✅ (toutes les stats globales) |
| Voir usage_events anonymes | ❌ | ✅ |
| Voir usage_events d'autres users | ❌ | ❌ |
| Gérer ses saved_queries | ❌ | ✅ |
| Gérer d'autres users | ❌ | ❌ |

### 1.3 Inventaire fonctionnel actuel

**Gestion des utilisateurs :** Rien n'est implémenté. Aucune liste, recherche, modification, suspension, suppression, ou gestion de rôles.

**Tableau de bord & métriques :**
- [x] KPIs principaux visibles (4 cartes : requêtes, titres, mes requêtes, mes sauvegardes)
- [x] Graphiques d'activité (bar chart 30j, pie chart catégories)
- [ ] Données en temps réel
- [ ] Exports

**Configuration système, Logs & audit trail, Gestion contenu :** Rien n'est implémenté.

---

## PHASE 2 — FEATURES MANQUANTES

### 2.1 Entités détectées

| Entité | Table | Features admin attendues | Implémenté |
|--------|-------|------------------------|------------|
| Users | auth.users | Liste, CRUD, rôles, suspension | ❌ |
| Saved queries | saved_queries | Modération, stats | ❌ |
| Usage events | usage_events | Monitoring, alertes, export | Partiel (lecture) |

### 2.2 Gaps critiques vs souhaitables

**Gaps CRITIQUES :**
1. **Pas de système de rôles** — N'importe quel utilisateur authentifié voit toutes les stats globales. Impossible de distinguer admin/user.
2. **Pas de panel admin** — Aucune page pour gérer les utilisateurs ou modérer le contenu.
3. **Dashboard expose les stats globales sans contrôle** — Tout user authentifié voit le volume total d'utilisation.

**Gaps IMPORTANTS :**
1. Pas de gestion des utilisateurs (liste, ban, rôles)
2. Pas d'audit trail (qui fait quoi)
3. Pas d'export de données

**Gaps SOUHAITABLES :**
1. Feature flags
2. Alertes anomalies
3. Maintenance mode

---

## PHASE 3 — AUDIT UX/UI

### 3.1 Navigation

Le dashboard a une navigation minimale : un bouton retour vers `/` et un ThemeToggle. Pas de sidebar, pas de breadcrumbs, pas de menu admin.

Score navigation : 3/10

### 3.2 Tableaux de données

Aucun tableau de données dans le dashboard. Les données sont affichées via des cartes KPI et des graphiques uniquement.

### 3.3 Formulaires admin

Aucun formulaire admin.

### 3.4 Feedback & états UI

| Situation | Géré ? | Type |
|-----------|--------|------|
| Chargement initial | ✅ | Skeleton |
| Erreur réseau | ✅ (dans hook) | State error |
| État vide | ✅ | Message texte |
| Action destructive | N/A | — |

### 3.5 Responsive & accessibilité

- Responsive tablette/mobile : ✅ (grid responsive)
- Contraste : ✅
- Focus visible : ✅ (Radix)
- Aria labels : Partiel

### 3.7 Score UX/UI global

| Dimension | Score |
|-----------|-------|
| Navigation | 3/10 |
| Tableaux & listes | N/A |
| Formulaires | N/A |
| Feedback & états | 7/10 |
| Responsive | 7/10 |
| Cohérence visuelle | 8/10 |
| **Score UX global** | **4/10** |

---

## PHASE 4 — RÉSUMÉ EXÉCUTIF

### 4.1 État de maturité

```text
🔴 PROTOTYPE — Il n'existe pas de panel admin. Le /dashboard est un
               tableau de bord personnel sans contrôle d'accès par rôle,
               sans gestion d'utilisateurs, sans audit trail.
```

### 4.2 Top 5 problemes critiques

1. **Pas de système de rôles** — Tout user authentifié = même niveau d'accès → `useAuth.ts`, DB
2. **Pas de page admin** — Aucune interface pour administrer l'application → inexistant
3. **Stats globales accessibles à tous** — Données sensibles (volume, catégories) exposées → `Dashboard.tsx`
4. **Pas d'audit trail** — Aucune traçabilité des actions → inexistant
5. **Pas de gestion utilisateurs** — Impossible de lister, suspendre, ou supprimer un compte → inexistant

### 4.3 Top 5 features à plus forte valeur ajoutée

1. **Système de rôles (table + RLS + guard)** — Fondation de tout le panel → Effort : 1 prompt
2. **Page admin /admin/users** — Lister et gérer les utilisateurs → Effort : 2 prompts
3. **Restreindre dashboard aux admins ou séparer stats perso/globales** — Sécuriser les données → Effort : 1 prompt
4. **Audit trail (table admin_actions)** — Traçabilité → Effort : 1 prompt
5. **Layout admin avec sidebar** — Navigation structurée → Effort : 1 prompt

---

## PHASE 5 — SPRINTS

### 🔴 SPRINT P0 — BLOQUANT

**[P0-01]** | 🏷️ Sécurité | 📄 migrations, DB

Probleme : Aucun système de rôles. Impossible de distinguer admin d'un utilisateur standard. Le dashboard expose les stats globales à tout utilisateur authentifié.

Impact : N'importe quel utilisateur inscrit voit les données globales d'utilisation.

Prompt Lovable :
"Crée un système de rôles admin dans la base de données. Ajoute un enum `app_role` avec les valeurs 'admin' et 'user'. Crée une table `user_roles` avec `user_id` (référence auth.users, ON DELETE CASCADE) et `role` (app_role), avec contrainte UNIQUE sur (user_id, role). Active RLS sur la table. Crée une fonction SECURITY DEFINER `has_role(uuid, app_role)` qui vérifie si un user a un rôle donné. Ajoute une RLS policy SELECT sur user_roles pour que seuls les admins puissent lire la table (via has_role). Les utilisateurs ne doivent PAS pouvoir s'auto-attribuer un rôle : seule une policy INSERT réservée aux admins existants doit exister."

**[P0-02]** | 🏷️ Sécurité | 📄 Dashboard.tsx, ProtectedRoute.tsx

Probleme : Le dashboard affiche les stats globales (totalQueries, totalTitles, topCategories, topPlatforms) à tout utilisateur authentifié sans vérification de rôle.

Impact : Fuite de données d'usage globales.

Prompt Lovable :
"Sépare le dashboard en deux vues : (1) une vue utilisateur standard qui montre uniquement 'Mes requêtes' et 'Mes sauvegardes', et (2) une vue admin qui montre en plus les stats globales (total requêtes, titres, catégories, plateformes, graphique 30j). Utilise la fonction `has_role` côté DB pour vérifier le rôle admin. Crée un hook `useUserRole` qui appelle une RPC ou query la table `user_roles` pour déterminer si l'utilisateur courant est admin. Affiche conditionnellement les sections globales."

---

### 🟠 SPRINT P1 — IMPORTANT

**[P1-01]** | 🏷️ Features | 📄 Nouveau fichier src/pages/admin/Users.tsx

Feature : Aucune interface pour lister ou gérer les utilisateurs.

Valeur : Permet à l'admin de voir qui utilise l'application et de gérer les comptes.

Prompt Lovable :
"Crée une page admin `/admin/users` accessible uniquement aux utilisateurs avec le rôle admin. Crée une edge function `list-users` qui utilise le service role key pour lister les utilisateurs depuis auth.users (email, created_at, last_sign_in_at). La page affiche un tableau avec pagination (20 par page), recherche par email, et tri par date. Ajoute la route dans App.tsx protégée par un composant AdminRoute qui vérifie has_role. Utilise les composants Table existants de shadcn/ui."

**[P1-02]** | 🏷️ Features | 📄 Nouveau layout admin

Feature : Pas de navigation admin structurée.

Valeur : UX admin cohérente avec sidebar et navigation entre les sections.

Prompt Lovable :
"Crée un layout admin `src/components/admin/AdminLayout.tsx` avec une sidebar utilisant le composant Sidebar existant de shadcn/ui. La sidebar contient les liens : Dashboard, Utilisateurs, Logs. Ajoute un header avec le nom de l'admin et un bouton de déconnexion. Toutes les routes `/admin/*` utilisent ce layout. Le layout est responsive avec un menu burger sur mobile."

**[P1-03]** | 🏷️ Sécurité | 📄 Nouvelle table admin_actions

Feature : Aucun audit trail des actions admin.

Valeur : Traçabilité de qui a fait quoi et quand.

Prompt Lovable :
"Crée une table `admin_actions` avec les colonnes : id (uuid), admin_user_id (uuid, ref auth.users), action (text), target_user_id (uuid nullable), details (jsonb), created_at (timestamptz default now()). Active RLS : seuls les admins (via has_role) peuvent SELECT et INSERT. Crée un index sur created_at. Crée une page `/admin/logs` qui affiche les actions dans un tableau paginé avec filtre par date et par type d'action."

---

### 🟡 SPRINT P2 — AMELIORATION

**[P2-01]** | 🏷️ Analytics | 📄 Dashboard admin

Feature : Pas de métriques avancées pour l'admin (DAU, MAU, rétention).

Valeur : Vision claire de l'activité et de la croissance.

Prompt Lovable :
"Dans la vue admin du dashboard, ajoute des KPIs supplémentaires : nombre d'utilisateurs inscrits (via edge function), utilisateurs actifs aujourd'hui (count distinct user_id dans usage_events du jour), et taux de sauvegarde (saved_queries / usage_events). Ajoute un graphique linéaire montrant l'évolution des inscriptions par semaine."

**[P2-02]** | 🏷️ Export | 📄 Dashboard, admin/Users

Feature : Aucun export de données.

Valeur : Permet l'analyse externe et le reporting.

Prompt Lovable :
"Ajoute un bouton 'Exporter CSV' sur la page admin/users et sur le dashboard admin. Pour les users, exporte email + date inscription + dernière connexion. Pour les stats, exporte les données du graphique d'activité 30j. Utilise la génération CSV côté client avec download automatique du fichier."

**[P2-03]** | 🏷️ UX | 📄 admin/Users

Feature : Pas de gestion des rôles depuis l'interface.

Valeur : Permettre de promouvoir/rétrograder des utilisateurs sans SQL.

Prompt Lovable :
"Sur la page admin/users, ajoute un dropdown par utilisateur permettant de changer son rôle (user/admin). Le changement appelle une edge function `update-user-role` qui vérifie que l'appelant est admin via has_role avant d'insérer/supprimer dans user_roles. Affiche une confirmation modale avant tout changement de rôle. Logge l'action dans admin_actions."

---

### Tableau de synthese

| ID | Priorité | Catégorie | Type | Effort | Dépendances |
|----|----------|-----------|------|--------|-------------|
| P0-01 | 🔴 | Sécurité | Ajout | 1 prompt | Aucune |
| P0-02 | 🔴 | Sécurité | Fix | 1 prompt | P0-01 |
| P1-01 | 🟠 | Features | Ajout | 2 prompts | P0-01 |
| P1-02 | 🟠 | UX | Ajout | 1 prompt | P0-01 |
| P1-03 | 🟠 | Sécurité | Ajout | 1 prompt | P0-01 |
| P2-01 | 🟡 | Analytics | Ajout | 1 prompt | P1-01 |
| P2-02 | 🟡 | Export | Ajout | 1 prompt | P1-01 |
| P2-03 | 🟡 | UX | Ajout | 1 prompt | P0-01, P1-01 |

### Ordre d'execution recommande

```text
ETAPE 1 — P0-01 : Système de rôles (table + fonction + RLS)
ETAPE 2 — P0-02 : Séparer dashboard user/admin
ETAPE 3 — P1-02 : Layout admin avec sidebar
ETAPE 4 — P1-01 : Page gestion utilisateurs
ETAPE 5 — P1-03 : Audit trail + page logs
ETAPE 6 — P2-01/02/03 : Analytics, exports, gestion rôles UI
```

---

## PHASE 6 — DIFFS .MD

### Diff `memory.md`

```
## Admin Panel — Status 2026-03-09
Maturité : PROTOTYPE
Score UX : 4/10
Features implémentées : 1 (dashboard stats basique)
Features manquantes P0 : 2
Features manquantes P1 : 3
Rôles configurés : aucun
RLS admin en place : ❌
Prochain audit recommandé : après sprint P1
```

### Diff `sprint-backlog.md`

```
## Audit Admin — 2026-03-09
Maturité : PROTOTYPE
Score UX global : 4/10

### 🔴 P0 — Bloquant sécurité (2 items)
- [ ] P0-01 | Sécurité | migrations | Système rôles (table user_roles + has_role + RLS)
- [ ] P0-02 | Sécurité | Dashboard.tsx | Séparer vue user/admin sur le dashboard

### 🟠 P1 — Features & bugs importants (3 items)
- [ ] P1-01 | Features | admin/Users.tsx | Page gestion utilisateurs avec edge function
- [ ] P1-02 | UX | AdminLayout.tsx | Layout admin avec sidebar
- [ ] P1-03 | Sécurité | admin_actions | Audit trail + page logs

### 🟡 P2 — Améliorations (3 items)
- [ ] P2-01 | Analytics | Dashboard admin | KPIs avancés (DAU, inscriptions)
- [ ] P2-02 | Export | admin/Users + Dashboard | Export CSV
- [ ] P2-03 | UX | admin/Users | Gestion rôles depuis l'interface
```

