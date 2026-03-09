import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Users, Search, Shield, ShieldOff, Download } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import {
  Table, TableBody, TableCell, TableHead, TableHeader, TableRow,
} from '@/components/ui/table';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from '@/components/ui/select';
import {
  AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent,
  AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { toast } from 'sonner';
import { downloadCsv } from '@/utils/csvExport';

interface UserRow {
  id: string;
  email: string;
  created_at: string;
  last_sign_in_at: string | null;
  email_confirmed_at: string | null;
}

interface RoleMap {
  [userId: string]: 'admin' | 'user';
}

const PER_PAGE = 20;

const AdminUsers: React.FC = () => {
  const [users, setUsers] = useState<UserRow[]>([]);
  const [roles, setRoles] = useState<RoleMap>({});
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Confirmation modal state
  const [pendingChange, setPendingChange] = useState<{
    userId: string;
    email: string;
    newRole: 'admin' | 'user';
  } | null>(null);
  const [updating, setUpdating] = useState(false);

  const fetchUsers = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const url = `https://${projectId}.supabase.co/functions/v1/list-users?page=${page}&per_page=${PER_PAGE}&search=${encodeURIComponent(search)}`;
      const session = (await supabase.auth.getSession()).data.session;

      const res = await fetch(url, {
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
      });

      if (!res.ok) {
        const errData = await res.json().catch(() => ({}));
        throw new Error(errData.error || `Erreur ${res.status}`);
      }

      const result = await res.json();
      const fetchedUsers: UserRow[] = result.users || [];
      setUsers(fetchedUsers);
      setTotal(result.total || 0);

      // Fetch roles for these users
      if (fetchedUsers.length > 0) {
        const { data: rolesData } = await supabase
          .from('user_roles')
          .select('user_id, role')
          .in('user_id', fetchedUsers.map((u) => u.id));

        const map: RoleMap = {};
        fetchedUsers.forEach((u) => { map[u.id] = 'user'; });
        rolesData?.forEach((r) => {
          if (r.role === 'admin') map[r.user_id] = 'admin';
        });
        setRoles(map);
      }
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [page, search]);

  useEffect(() => {
    fetchUsers();
  }, [fetchUsers]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    setSearch(searchInput);
  };

  const confirmRoleChange = async () => {
    if (!pendingChange) return;
    setUpdating(true);
    try {
      const projectId = import.meta.env.VITE_SUPABASE_PROJECT_ID;
      const url = `https://${projectId}.supabase.co/functions/v1/update-user-role`;
      const session = (await supabase.auth.getSession()).data.session;

      const res = await fetch(url, {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${session?.access_token}`,
          'Content-Type': 'application/json',
          apikey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY,
        },
        body: JSON.stringify({
          target_user_id: pendingChange.userId,
          new_role: pendingChange.newRole,
        }),
      });

      const result = await res.json();
      if (!res.ok) throw new Error(result.error || `Erreur ${res.status}`);

      setRoles((prev) => ({ ...prev, [pendingChange.userId]: pendingChange.newRole }));
      toast.success(
        pendingChange.newRole === 'admin'
          ? `${pendingChange.email} promu admin`
          : `${pendingChange.email} rétrogradé en utilisateur`
      );
    } catch (err: any) {
      toast.error(err.message || 'Erreur lors du changement de rôle');
    } finally {
      setUpdating(false);
      setPendingChange(null);
    }
  };

  const totalPages = Math.ceil(total / PER_PAGE);

  const formatDate = (d: string | null) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });
  };

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <Users className="w-6 h-6 text-primary" />
          <span className="gradient-text">Utilisateurs</span>
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-muted-foreground">
            {!loading && `${total} utilisateur${total > 1 ? 's' : ''}`}
          </span>
          <Button
            variant="outline"
            size="sm"
            disabled={loading || users.length === 0}
            onClick={() => {
              downloadCsv(
                users.map((u) => ({
                  email: u.email,
                  rôle: roles[u.id] || 'user',
                  inscrit_le: formatDate(u.created_at),
                  dernière_connexion: formatDate(u.last_sign_in_at),
                })),
                `utilisateurs-${new Date().toISOString().slice(0, 10)}.csv`,
              );
              toast.success('Export CSV téléchargé');
            }}
          >
            <Download className="w-4 h-4 mr-1.5" />
            Exporter CSV
          </Button>
        </div>
      </div>

      {/* Search */}
      <form onSubmit={handleSearch} className="flex gap-2 mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Rechercher par email…"
            value={searchInput}
            onChange={(e) => setSearchInput(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="secondary" size="sm">Rechercher</Button>
        {search && (
          <Button type="button" variant="ghost" size="sm" onClick={() => {
            setSearchInput(''); setSearch(''); setPage(1);
          }}>Effacer</Button>
        )}
      </form>

      {/* Error */}
      {error && (
        <div className="rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-sm text-destructive mb-6">
          {error}
        </div>
      )}

      {/* Table */}
      <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
        <div className="rounded-xl border border-border overflow-hidden">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Email</TableHead>
                <TableHead className="hidden sm:table-cell">Inscrit le</TableHead>
                <TableHead className="hidden md:table-cell">Dernière connexion</TableHead>
                <TableHead>Rôle</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-48" /></TableCell>
                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-24" /></TableCell>
                  </TableRow>
                ))
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={4} className="text-center text-muted-foreground py-12">
                    Aucun utilisateur trouvé
                  </TableCell>
                </TableRow>
              ) : (
                users.map((u) => (
                  <TableRow key={u.id}>
                    <TableCell className="font-medium">{u.email}</TableCell>
                    <TableCell className="hidden sm:table-cell text-muted-foreground text-sm">
                      {formatDate(u.created_at)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-muted-foreground text-sm">
                      {formatDate(u.last_sign_in_at)}
                    </TableCell>
                    <TableCell>
                      <Select
                        value={roles[u.id] || 'user'}
                        onValueChange={(val) =>
                          setPendingChange({
                            userId: u.id,
                            email: u.email,
                            newRole: val as 'admin' | 'user',
                          })
                        }
                      >
                        <SelectTrigger className="w-[120px] h-8 text-xs">
                          {roles[u.id] === 'admin' ? (
                            <span className="flex items-center gap-1.5">
                              <Shield className="w-3.5 h-3.5 text-primary" />
                              Admin
                            </span>
                          ) : (
                            <span className="flex items-center gap-1.5">
                              <ShieldOff className="w-3.5 h-3.5 text-muted-foreground" />
                              User
                            </span>
                          )}
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">
                            <span className="flex items-center gap-1.5">
                              <ShieldOff className="w-3.5 h-3.5" /> User
                            </span>
                          </SelectItem>
                          <SelectItem value="admin">
                            <span className="flex items-center gap-1.5">
                              <Shield className="w-3.5 h-3.5" /> Admin
                            </span>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </motion.div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <Button variant="outline" size="sm" disabled={page <= 1} onClick={() => setPage((p) => p - 1)}>
            Précédent
          </Button>
          <span className="text-sm text-muted-foreground">Page {page} / {totalPages}</span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Suivant
          </Button>
        </div>
      )}

      {/* Confirmation Modal */}
      <AlertDialog open={!!pendingChange} onOpenChange={(open) => !open && setPendingChange(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmer le changement de rôle</AlertDialogTitle>
            <AlertDialogDescription>
              {pendingChange?.newRole === 'admin'
                ? `Promouvoir ${pendingChange?.email} en admin ? Cette personne aura accès au panel d'administration.`
                : `Rétrograder ${pendingChange?.email} en utilisateur standard ? Cette personne perdra l'accès au panel admin.`}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel disabled={updating}>Annuler</AlertDialogCancel>
            <AlertDialogAction onClick={confirmRoleChange} disabled={updating}>
              {updating ? 'En cours…' : 'Confirmer'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default AdminUsers;
