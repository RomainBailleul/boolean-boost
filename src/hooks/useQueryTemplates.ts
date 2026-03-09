import { useState, useEffect, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface QueryTemplate {
  id: string;
  user_id: string;
  title: string;
  description: string;
  query: string;
  categories: string[];
  platform: string;
  is_public: boolean;
  uses_count: number;
  created_at: string;
}

export const useQueryTemplates = () => {
  const [templates, setTemplates] = useState<QueryTemplate[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');

  const fetchTemplates = useCallback(async () => {
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('query_templates' as any)
        .select('*')
        .eq('is_public', true)
        .order('created_at', { ascending: false })
        .limit(50);

      if (!error && data) {
        setTemplates(data as unknown as QueryTemplate[]);
      }
    } catch {
      // silent
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchTemplates();
  }, [fetchTemplates]);

  const publishTemplate = useCallback(async (params: {
    title: string;
    description: string;
    query: string;
    categories: string[];
    platform: string;
    userId: string;
  }) => {
    const { error } = await supabase.from('query_templates' as any).insert({
      user_id: params.userId,
      title: params.title,
      description: params.description,
      query: params.query,
      categories: params.categories,
      platform: params.platform,
      is_public: true,
    });
    if (error) throw error;
    await fetchTemplates();
  }, [fetchTemplates]);

  const incrementUses = useCallback(async (templateId: string) => {
    // Best-effort increment via RPC or direct — skip if no update policy
    try {
      await supabase.rpc('increment_template_uses' as any, { template_id: templateId });
    } catch {
      // no-op if function doesn't exist
    }
  }, []);

  const filteredTemplates = search.trim()
    ? templates.filter(t =>
        t.title.toLowerCase().includes(search.toLowerCase()) ||
        t.description.toLowerCase().includes(search.toLowerCase()) ||
        t.categories.some(c => c.toLowerCase().includes(search.toLowerCase()))
      )
    : templates;

  return { templates: filteredTemplates, loading, search, setSearch, publishTemplate, incrementUses, refetch: fetchTemplates };
};
