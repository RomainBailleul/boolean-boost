import React, { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { ScrollText, Search, CalendarDays, Loader2 } from 'lucide-react';
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

interface ActionRow {
  id: string;
  admin_user_id: string;
  action: string;
  target_user_id: string | null;
  details: Record<string, unknown> | null;
  created_at: string;
}

const PER_PAGE = 20;

const DATE_RANGES = [
  { label: 'Tout', value: 'all' },
  { label: "Aujourd'hui", value: 'today' },
  { label: '7 derniers jours', value: '7d' },
  { label: '30 derniers jours', value: '30d' },
] as const;

const AdminLogs: React.FC = () => {
  const [actions, setActions] = useState<ActionRow[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [dateRange, setDateRange] = useState<string>('all');
  const [actionFilter, setActionFilter] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchLogs = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      let query = supabase
        .from('admin_actions')
        .select('*', { count: 'exact' })
        .order('created_at', { ascending: false });

      // Date filter
      if (dateRange === 'today') {
        const start = new Date();
        start.setHours(0, 0, 0, 0);
        query = query.gte('created_at', start.toISOString());
      } else if (dateRange === '7d') {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        query = query.gte('created_at', d.toISOString());
      } else if (dateRange === '30d') {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        query = query.gte('created_at', d.toISOString());
      }

      // Action type filter
      if (actionFilter.trim()) {
        query = query.ilike('action', `%${actionFilter.trim()}%`);
      }

      // Pagination
      const from = (page - 1) * PER_PAGE;
      query = query.range(from, from + PER_PAGE - 1);

      const { data, count, error: dbError } = await query;

      if (dbError) throw dbError;
      setActions((data as ActionRow[]) || []);
      setTotal(count ?? 0);
    } catch (err: any) {
      setError(err.message || 'Erreur lors du chargement');
    } finally {
      setLoading(false);
    }
  }, [page, dateRange, actionFilter]);

  useEffect(() => {
    fetchLogs();
  }, [fetchLogs]);

  const handleFilterSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setPage(1);
    fetchLogs();
  };

  const totalPages = Math.ceil(total / PER_PAGE);

  const formatDate = (d: string) =>
    new Date(d).toLocaleDateString('fr-FR', {
      day: '2-digit', month: '2-digit', year: 'numeric',
      hour: '2-digit', minute: '2-digit',
    });

  const truncateId = (id: string | null) =>
    id ? `${id.slice(0, 8)}…` : '—';

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <h1 className="text-2xl font-bold text-foreground flex items-center gap-2">
          <ScrollText className="w-6 h-6 text-primary" />
          <span className="gradient-text">Audit Trail</span>
        </h1>
        <span className="text-sm text-muted-foreground">
          {!loading && `${total} action${total > 1 ? 's' : ''}`}
        </span>
      </div>

      {/* Filters */}
      <form onSubmit={handleFilterSubmit} className="flex flex-wrap gap-2 mb-6">
        <Select value={dateRange} onValueChange={(v) => { setDateRange(v); setPage(1); }}>
          <SelectTrigger className="w-[180px]">
            <CalendarDays className="w-4 h-4 mr-2 text-muted-foreground" />
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {DATE_RANGES.map((r) => (
              <SelectItem key={r.value} value={r.value}>{r.label}</SelectItem>
            ))}
          </SelectContent>
        </Select>

        <div className="relative flex-1 max-w-xs">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            placeholder="Filtrer par action…"
            value={actionFilter}
            onChange={(e) => setActionFilter(e.target.value)}
            className="pl-9"
          />
        </div>
        <Button type="submit" variant="secondary" size="sm">Filtrer</Button>
        {(actionFilter || dateRange !== 'all') && (
          <Button type="button" variant="ghost" size="sm" onClick={() => {
            setActionFilter('');
            setDateRange('all');
            setPage(1);
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
                <TableHead>Date</TableHead>
                <TableHead>Action</TableHead>
                <TableHead className="hidden sm:table-cell">Admin</TableHead>
                <TableHead className="hidden md:table-cell">Cible</TableHead>
                <TableHead className="hidden lg:table-cell">Détails</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading ? (
                Array.from({ length: 5 }).map((_, i) => (
                  <TableRow key={i}>
                    <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                    <TableCell><Skeleton className="h-4 w-32" /></TableCell>
                    <TableCell className="hidden sm:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell className="hidden md:table-cell"><Skeleton className="h-4 w-20" /></TableCell>
                    <TableCell className="hidden lg:table-cell"><Skeleton className="h-4 w-40" /></TableCell>
                  </TableRow>
                ))
              ) : actions.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} className="text-center text-muted-foreground py-12">
                    Aucune action enregistrée
                  </TableCell>
                </TableRow>
              ) : (
                actions.map((a) => (
                  <TableRow key={a.id}>
                    <TableCell className="text-sm text-muted-foreground whitespace-nowrap">
                      {formatDate(a.created_at)}
                    </TableCell>
                    <TableCell className="font-medium">{a.action}</TableCell>
                    <TableCell className="hidden sm:table-cell text-xs text-muted-foreground font-mono">
                      {truncateId(a.admin_user_id)}
                    </TableCell>
                    <TableCell className="hidden md:table-cell text-xs text-muted-foreground font-mono">
                      {truncateId(a.target_user_id)}
                    </TableCell>
                    <TableCell className="hidden lg:table-cell text-xs text-muted-foreground max-w-[200px] truncate">
                      {a.details ? JSON.stringify(a.details) : '—'}
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
          <span className="text-sm text-muted-foreground">
            Page {page} / {totalPages}
          </span>
          <Button variant="outline" size="sm" disabled={page >= totalPages} onClick={() => setPage((p) => p + 1)}>
            Suivant
          </Button>
        </div>
      )}
    </div>
  );
};

export default AdminLogs;
