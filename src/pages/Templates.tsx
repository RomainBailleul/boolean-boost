import React from 'react';
import { motion } from 'framer-motion';
import { Link, useNavigate } from 'react-router-dom';
import { useQueryTemplates, type QueryTemplate } from '@/hooks/useQueryTemplates';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import ThemeToggle from '@/components/ThemeToggle';
import { Search, ArrowLeft, Copy, Check, Users, Zap, Globe } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

const platformIcon: Record<string, React.ReactNode> = {
  'sales-navigator': <Zap className="w-3 h-3" />,
  'linkedin': <Search className="w-3 h-3" />,
  'google-xray': <Globe className="w-3 h-3" />,
};

const TemplateCard: React.FC<{ template: QueryTemplate; onUse: (t: QueryTemplate) => void }> = ({ template, onUse }) => {
  const [copied, setCopied] = React.useState(false);
  const { toast } = useToast();

  const copyQuery = async () => {
    await navigator.clipboard.writeText(template.query);
    setCopied(true);
    toast({ title: 'Copié !', description: 'Requête copiée dans le presse-papier.' });
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card rounded-xl p-4 border border-border hover:border-primary/30 transition-all"
    >
      <div className="flex items-start justify-between gap-2 mb-2">
        <h3 className="text-sm font-bold text-foreground leading-tight">{template.title}</h3>
        <Badge variant="outline" className="shrink-0 text-[10px] gap-1">
          {platformIcon[template.platform] || null}
          {template.platform === 'sales-navigator' ? 'SN' : template.platform === 'google-xray' ? 'GX' : 'LI'}
        </Badge>
      </div>
      {template.description && (
        <p className="text-xs text-muted-foreground mb-2 line-clamp-2">{template.description}</p>
      )}
      <div className="flex flex-wrap gap-1 mb-3">
        {template.categories.slice(0, 3).map(c => (
          <Badge key={c} variant="secondary" className="text-[10px] px-1.5 py-0">{c}</Badge>
        ))}
        {template.categories.length > 3 && (
          <Badge variant="secondary" className="text-[10px] px-1.5 py-0">+{template.categories.length - 3}</Badge>
        )}
      </div>
      <div className="font-mono text-[10px] text-muted-foreground bg-muted/30 rounded-lg p-2 mb-3 line-clamp-3 break-all">
        {template.query}
      </div>
      <div className="flex gap-2">
        <Button size="sm" variant="outline" onClick={copyQuery} className="flex-1 h-8 text-xs rounded-lg">
          {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
          {copied ? 'Copié' : 'Copier'}
        </Button>
        <Button size="sm" onClick={() => onUse(template)} className="flex-1 h-8 text-xs rounded-lg">
          Utiliser
        </Button>
      </div>
      <p className="text-[10px] text-muted-foreground mt-2">
        {new Date(template.created_at).toLocaleDateString('fr-FR')}
      </p>
    </motion.div>
  );
};

const Templates: React.FC = () => {
  const { templates, loading, search, setSearch } = useQueryTemplates();
  const navigate = useNavigate();

  const handleUse = (template: QueryTemplate) => {
    const params = new URLSearchParams();
    params.set('q', template.query);
    params.set('p', template.platform);
    navigate(`/?${params.toString()}`);
  };

  return (
    <div className="min-h-screen bg-background dot-grid">
      <div className="h-1.5 w-full" style={{ background: 'var(--gradient-hero)' }} />
      <div className="container mx-auto px-4 sm:px-6 py-6 sm:py-10 max-w-4xl">
        <header className="flex items-center justify-between mb-8">
          <div className="flex items-center gap-3">
            <Button variant="ghost" size="sm" asChild className="h-8 rounded-lg">
              <Link to="/"><ArrowLeft className="w-4 h-4 mr-1" /> Retour</Link>
            </Button>
            <h1 className="text-xl sm:text-2xl font-bold text-foreground flex items-center gap-2">
              <Users className="w-5 h-5 text-primary" />
              Templates communautaires
            </h1>
          </div>
          <ThemeToggle />
        </header>

        <div className="relative mb-6">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
          <Input
            value={search}
            onChange={e => setSearch(e.target.value)}
            placeholder="Rechercher un template..."
            className="pl-9 h-10 rounded-xl"
          />
        </div>

        {loading ? (
          <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary" />
          </div>
        ) : templates.length === 0 ? (
          <div className="text-center py-20">
            <Users className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
            <p className="text-muted-foreground font-medium">
              {search ? 'Aucun template trouvé' : 'Aucun template pour le moment'}
            </p>
            <p className="text-xs text-muted-foreground mt-1">
              Soyez le premier à partager une requête !
            </p>
            <Button asChild className="mt-4 rounded-xl">
              <Link to="/">Créer une requête</Link>
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            {templates.map(t => (
              <TemplateCard key={t.id} template={t} onUse={handleUse} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Templates;
