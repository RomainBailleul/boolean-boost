import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { User } from '@supabase/supabase-js';

export interface SavedQuery {
  id: string;
  label: string;
  query: string;
  titlesCount: number;
  platform?: string;
  location?: string;
  createdAt: string;
}

const STORAGE_KEY = 'boolean-boost-saved-queries';

export const useSavedQueries = (user?: User | null) => {
  const [savedQueries, setSavedQueries] = useState<SavedQuery[]>([]);
  const isAuthed = !!user;

  // Load from cloud or localStorage
  useEffect(() => {
    if (isAuthed) {
      supabase
        .from('saved_queries')
        .select('*')
        .order('created_at', { ascending: false })
        .then(({ data }) => {
          if (data) {
            setSavedQueries(data.map(r => ({
              id: r.id,
              label: r.label,
              query: r.query,
              titlesCount: r.titles_count,
              platform: r.platform,
              location: r.location,
              createdAt: r.created_at,
            })));
          }
        });
    } else {
      try {
        const raw = localStorage.getItem(STORAGE_KEY);
        if (raw) setSavedQueries(JSON.parse(raw));
      } catch { /* ignore */ }
    }
  }, [isAuthed, user?.id]);

  const saveQuery = useCallback(async (label: string, query: string, titlesCount: number, platform?: string, location?: string) => {
    const trimmedLabel = label.trim() || `Requête du ${new Date().toLocaleDateString('fr-FR')}`;

    if (isAuthed && user) {
      const { data, error } = await supabase.from('saved_queries').insert({
        user_id: user.id,
        label: trimmedLabel,
        query,
        titles_count: titlesCount,
        platform: platform || 'sales-navigator',
        location: location || '',
      }).select().single();

      if (!error && data) {
        const entry: SavedQuery = {
          id: data.id,
          label: data.label,
          query: data.query,
          titlesCount: data.titles_count,
          platform: data.platform,
          location: data.location,
          createdAt: data.created_at,
        };
        setSavedQueries(prev => [entry, ...prev]);
        return entry;
      }
    } else {
      const entry: SavedQuery = {
        id: crypto.randomUUID(),
        label: trimmedLabel,
        query,
        titlesCount,
        createdAt: new Date().toISOString(),
      };
      setSavedQueries(prev => {
        const updated = [entry, ...prev];
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch { /* quota */ }
        return updated;
      });
      return entry;
    }
  }, [isAuthed, user]);

  const deleteQuery = useCallback(async (id: string) => {
    if (isAuthed) {
      await supabase.from('saved_queries').delete().eq('id', id);
    }
    setSavedQueries(prev => {
      const updated = prev.filter(q => q.id !== id);
      if (!isAuthed) {
        try { localStorage.setItem(STORAGE_KEY, JSON.stringify(updated)); } catch { /* quota */ }
      }
      return updated;
    });
  }, [isAuthed]);

  return { savedQueries, saveQuery, deleteQuery };
};
