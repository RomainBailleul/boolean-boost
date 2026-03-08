import React, { useState, useRef, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { ArrowLeft, Copy, Check, RotateCcw, Bookmark, Trash2, Download, AlertTriangle, Globe, Search, Zap, MapPin, Share2, Image, FileText } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSavedQueries } from '@/hooks/useSavedQueries';
import { type Platform, PLATFORM_LIMITS } from '@/utils/queryGenerator';
import { fireConfetti } from '@/utils/confetti';

interface StepResultProps {
  booleanQuery: string;
  selectedCount: number;
  platform: Platform;
  setPlatform: (p: Platform) => void;
  location: string;
  setLocation: (loc: string) => void;
  shareUrl: string;
  onBack: () => void;
  onReset: () => void;
}

const PLATFORM_OPTIONS: { value: Platform; icon: React.ReactNode; label: string }[] = [
  { value: 'linkedin', icon: <Search className="w-4 h-4" />, label: 'LinkedIn Free' },
  { value: 'sales-navigator', icon: <Zap className="w-4 h-4" />, label: 'Sales Navigator' },
  { value: 'google-xray', icon: <Globe className="w-4 h-4" />, label: 'Google X-Ray' },
];

const StepResult: React.FC<StepResultProps> = ({
  booleanQuery, selectedCount, platform, setPlatform, location, setLocation, shareUrl, onBack, onReset,
}) => {
  const [copied, setCopied] = useState(false);
  const [linkCopied, setLinkCopied] = useState(false);
  const [saveLabel, setSaveLabel] = useState('');
  const [justSaved, setJustSaved] = useState(false);
  const { toast } = useToast();
  const { savedQueries, saveQuery, deleteQuery } = useSavedQueries();
  const queryCardRef = useRef<HTMLDivElement>(null);

  const exportAsPng = useCallback(async () => {
    if (!queryCardRef.current) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const canvas = await html2canvas(queryCardRef.current, {
        backgroundColor: null,
        scale: 2,
      });
      const link = document.createElement('a');
      link.download = 'boolean-boost-query.png';
      link.href = canvas.toDataURL('image/png');
      link.click();
      toast({ title: 'PNG exporté !', description: 'Image téléchargée.' });
    } catch {
      toast({ title: 'Erreur', description: "Impossible d'exporter en PNG.", variant: 'destructive' });
    }
  }, [toast]);

  const exportAsPdf = useCallback(async () => {
    if (!queryCardRef.current) return;
    try {
      const html2canvas = (await import('html2canvas')).default;
      const { jsPDF } = await import('jspdf');
      const canvas = await html2canvas(queryCardRef.current, { backgroundColor: '#ffffff', scale: 2 });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF({ orientation: 'landscape', unit: 'px', format: [canvas.width / 2, canvas.height / 2] });
      pdf.addImage(imgData, 'PNG', 0, 0, canvas.width / 2, canvas.height / 2);
      pdf.save('boolean-boost-query.pdf');
      toast({ title: 'PDF exporté !', description: 'Document téléchargé.' });
    } catch {
      toast({ title: 'Erreur', description: "Impossible d'exporter en PDF.", variant: 'destructive' });
    }
  }, [toast]);

  const limit = PLATFORM_LIMITS[platform];
  const queryLength = booleanQuery.length;
  const isOverLimit = queryLength > limit.limit;
  const isNearLimit = queryLength > limit.limit * 0.85 && !isOverLimit;

  const copyToClipboard = async (text?: string) => {
    try {
      await navigator.clipboard.writeText(text || booleanQuery);
      setCopied(true);
      toast({ title: "Copié !", description: "Requête copiée dans le presse-papier." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Erreur", description: "Impossible de copier.", variant: "destructive" });
    }
  };

  const handleSave = () => {
    saveQuery(saveLabel, booleanQuery, selectedCount);
    setSaveLabel('');
    setJustSaved(true);
    toast({ title: "Sauvegardée !", description: "Requête enregistrée localement." });
    setTimeout(() => setJustSaved(false), 2000);
  };

  const exportQueries = (format: 'csv' | 'txt') => {
    if (savedQueries.length === 0) return;
    let content: string;
    let mimeType: string;
    let ext: string;

    if (format === 'csv') {
      const header = 'Nom,Titres,Date,Requête';
      const rows = savedQueries.map(q =>
        `"${q.label.replace(/"/g, '""')}",${q.titlesCount},"${new Date(q.createdAt).toLocaleDateString('fr-FR')}","${q.query.replace(/"/g, '""')}"`
      );
      content = [header, ...rows].join('\n');
      mimeType = 'text/csv;charset=utf-8';
      ext = 'csv';
    } else {
      content = savedQueries.map((q, i) =>
        `--- Requête ${i + 1}: ${q.label} ---\nTitres: ${q.titlesCount} | Date: ${new Date(q.createdAt).toLocaleDateString('fr-FR')}\n\n${q.query}\n`
      ).join('\n');
      mimeType = 'text/plain;charset=utf-8';
      ext = 'txt';
    }

    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `boolean-boost-requetes.${ext}`;
    a.click();
    URL.revokeObjectURL(url);
    toast({ title: "Exporté !", description: `Fichier .${ext} téléchargé.` });
  };

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Platform selector */}
      <div className="glass-card rounded-xl p-4 sm:p-5">
        <h3 className="text-sm font-bold text-foreground mb-3">Plateforme cible</h3>
        <div className="grid grid-cols-3 gap-2">
          {PLATFORM_OPTIONS.map((opt) => (
            <button
              key={opt.value}
              onClick={() => setPlatform(opt.value)}
              aria-pressed={platform === opt.value}
              className={`rounded-lg border p-2.5 sm:p-3 text-center transition-all text-xs sm:text-sm font-medium ${
                platform === opt.value
                  ? 'border-primary bg-primary/8 ring-2 ring-primary/25 text-foreground'
                  : 'border-border bg-card text-muted-foreground hover:border-primary/30'
              }`}
            >
              <span className="flex items-center justify-center gap-1.5">
                {opt.icon}
                {opt.label}
              </span>
            </button>
          ))}
        </div>
      </div>

      {/* Location */}
      <div className="glass-card rounded-xl p-4 sm:p-5">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
          <MapPin className="w-4 h-4 text-primary" />
          Localisation (optionnel)
        </h3>
        <Input
          value={location}
          onChange={(e) => setLocation(e.target.value)}
          placeholder="Ex: Paris, France, Île-de-France..."
          className="h-9 text-sm rounded-lg"
        />
        <p className="text-[11px] text-muted-foreground mt-2">
          Sera ajouté en AND à la requête
        </p>
      </div>

      {/* Result card */}
      <div ref={queryCardRef} className="glass-card rounded-xl p-4 sm:p-6">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
          <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
            Votre requête Boolean
          </h2>
          <div className="flex gap-2 text-[11px] sm:text-xs">
            <span className="font-medium text-accent bg-accent/10 px-2 py-0.5 rounded-full">
              {selectedCount} titres
            </span>
            <span className={`font-medium px-2 py-0.5 rounded-full ${
              isOverLimit
                ? 'text-destructive bg-destructive/10'
                : isNearLimit
                  ? 'text-[hsl(40_90%_45%)] bg-[hsl(40_90%_45%/0.1)]'
                  : 'text-muted-foreground bg-muted'
            }`}>
              {queryLength}/{limit.limit} car.
            </span>
          </div>
        </div>

        {/* Character limit warnings */}
        {isOverLimit && (
          <Alert className="mb-4 border-destructive/50 bg-destructive/5">
            <AlertTriangle className="h-4 w-4 text-destructive" />
            <AlertDescription className="text-xs text-destructive">
              La requête dépasse la limite de {limit.limit} caractères pour {limit.label}. Retirez des titres ou exclusions pour réduire la taille.
            </AlertDescription>
          </Alert>
        )}
        {isNearLimit && (
          <Alert className="mb-4 border-[hsl(40_90%_45%/0.5)] bg-[hsl(40_90%_45%/0.05)]">
            <AlertTriangle className="h-4 w-4 text-[hsl(40_90%_45%)]" />
            <AlertDescription className="text-xs text-[hsl(40_90%_45%)]">
              Vous approchez de la limite de {limit.limit} caractères pour {limit.label}.
            </AlertDescription>
          </Alert>
        )}

        <Textarea
          value={booleanQuery}
          readOnly
          className="font-mono text-xs sm:text-sm min-h-[120px] sm:min-h-[150px] bg-background/60 border-border rounded-lg resize-none"
        />

        <Button
          onClick={() => copyToClipboard()}
          size="lg"
          className="w-full mt-4 glow-button rounded-xl h-12 sm:h-14 text-sm sm:text-base font-bold"
        >
          {copied ? <Check className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
          {copied ? 'Copié !' : 'Copier la requête'}
        </Button>

        <div className="flex gap-2 mt-3">
          <p className="flex-1 text-[11px] sm:text-xs text-muted-foreground">
            {platform === 'google-xray'
              ? 'Collez dans la barre de recherche Google'
              : platform === 'sales-navigator'
                ? 'Collez dans le champ «\u00a0Titre\u00a0» de LinkedIn Sales Navigator'
                : 'Collez dans la barre de recherche LinkedIn'}
          </p>
          {shareUrl && (
            <Button
              variant="outline"
              size="sm"
              className="h-7 rounded-md text-[11px] px-2.5 shrink-0"
              onClick={async () => {
                await navigator.clipboard.writeText(shareUrl);
                setLinkCopied(true);
                toast({ title: "Lien copié !", description: "Partagez ce lien pour partager votre requête." });
                setTimeout(() => setLinkCopied(false), 2000);
              }}
            >
              {linkCopied ? <Check className="w-3 h-3 mr-1" /> : <Share2 className="w-3 h-3 mr-1" />}
              {linkCopied ? 'Copié' : 'Partager'}
            </Button>
          )}
        </div>
      </div>

      {/* Export buttons */}
      <div className="glass-card rounded-xl p-4 sm:p-5">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
          <Download className="w-4 h-4 text-primary" />
          Exporter la requête
        </h3>
        <div className="grid grid-cols-2 gap-2">
          <Button variant="outline" onClick={exportAsPng} className="rounded-lg h-9 text-xs font-medium">
            <Image className="w-3.5 h-3.5 mr-1.5" />
            Exporter en PNG
          </Button>
          <Button variant="outline" onClick={exportAsPdf} className="rounded-lg h-9 text-xs font-medium">
            <FileText className="w-3.5 h-3.5 mr-1.5" />
            Exporter en PDF
          </Button>
        </div>
      </div>

      <div className="glass-card rounded-xl p-4 sm:p-5">
        <h3 className="text-sm font-bold text-foreground flex items-center gap-2 mb-3">
          <Bookmark className="w-4 h-4 text-primary" />
          Sauvegarder cette requête
        </h3>
        <div className="flex gap-2">
          <Input
            value={saveLabel}
            onChange={(e) => setSaveLabel(e.target.value)}
            placeholder="Nom (ex: Prospection CMO France)..."
            className="flex-1 h-9 text-sm rounded-lg"
            onKeyDown={(e) => e.key === 'Enter' && booleanQuery.trim() && handleSave()}
          />
          <Button
            onClick={handleSave}
            variant="outline"
            disabled={!booleanQuery.trim()}
            className="h-9 rounded-lg text-xs font-semibold px-4"
          >
            {justSaved ? <Check className="w-4 h-4" /> : <Bookmark className="w-4 h-4" />}
          </Button>
        </div>
      </div>

      {/* Saved queries */}
      {savedQueries.length > 0 && (
        <div className="glass-card rounded-xl p-4 sm:p-5">
          <div className="flex items-center justify-between mb-3">
            <h3 className="text-sm font-bold text-foreground">
              Requêtes sauvegardées ({savedQueries.length})
            </h3>
            <div className="flex gap-1.5">
              <Button
                variant="outline"
                size="sm"
                className="h-7 rounded-md text-[11px] px-2.5"
                onClick={() => exportQueries('csv')}
                title="Exporter en CSV"
              >
                <Download className="w-3 h-3 mr-1" />
                CSV
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="h-7 rounded-md text-[11px] px-2.5"
                onClick={() => exportQueries('txt')}
                title="Exporter en TXT"
              >
                <Download className="w-3 h-3 mr-1" />
                TXT
              </Button>
            </div>
          </div>
          <div className="space-y-2 max-h-[250px] overflow-y-auto">
            {savedQueries.map((sq) => (
              <div
                key={sq.id}
                className="flex items-center gap-2 p-2.5 rounded-lg border border-border bg-background/50 hover:bg-background/80 transition-colors group"
              >
                <div className="flex-1 min-w-0">
                  <div className="text-sm font-medium text-foreground truncate">{sq.label}</div>
                  <div className="text-[10px] text-muted-foreground">
                    {sq.titlesCount} titres · {new Date(sq.createdAt).toLocaleDateString('fr-FR')}
                  </div>
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 rounded-md opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity"
                  onClick={() => copyToClipboard(sq.query)}
                  title="Copier"
                >
                  <Copy className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 rounded-md opacity-100 sm:opacity-0 sm:group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
                  onClick={() => deleteQuery(sq.id)}
                  title="Supprimer"
                >
                  <Trash2 className="w-3.5 h-3.5" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      )}

      <div className="flex justify-between gap-3">
        <Button variant="outline" onClick={onBack} size="lg" className="rounded-xl h-11 sm:h-12 px-5">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Modifier
        </Button>
        <Button variant="outline" onClick={onReset} size="lg" className="rounded-xl h-11 sm:h-12 px-5">
          <RotateCcw className="w-4 h-4 mr-2" />
          Nouveau
        </Button>
      </div>
    </div>
  );
};

export default StepResult;
