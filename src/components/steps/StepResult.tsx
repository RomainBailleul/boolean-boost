import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { ArrowLeft, Copy, Check, RotateCcw, Linkedin, Bookmark, Trash2, Download } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useSavedQueries } from '@/hooks/useSavedQueries';

interface StepResultProps {
  booleanQuery: string;
  selectedCount: number;
  onBack: () => void;
  onReset: () => void;
}

const StepResult: React.FC<StepResultProps> = ({
  booleanQuery, selectedCount, onBack, onReset,
}) => {
  const [copied, setCopied] = useState(false);
  const [saveLabel, setSaveLabel] = useState('');
  const [justSaved, setJustSaved] = useState(false);
  const { toast } = useToast();
  const { savedQueries, saveQuery, deleteQuery } = useSavedQueries();

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

  return (
    <div className="space-y-4 sm:space-y-6">
      {/* Result card */}
      <div className="glass-card rounded-xl p-4 sm:p-6">
        <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
          <h2 className="text-base sm:text-lg font-bold text-foreground flex items-center gap-2">
            <Linkedin className="w-5 h-5 text-primary" />
            Votre requête Boolean
          </h2>
          <div className="flex gap-2 text-[11px] sm:text-xs">
            <span className="font-medium text-accent bg-accent/10 px-2 py-0.5 rounded-full">
              {selectedCount} titres
            </span>
            <span className="font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-full">
              {booleanQuery.length} car.
            </span>
          </div>
        </div>

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

        <p className="text-[11px] sm:text-xs text-muted-foreground text-center mt-3">
          Collez dans le champ «&nbsp;Titre&nbsp;» de LinkedIn Sales Navigator
        </p>
      </div>

      {/* Save card */}
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
            onKeyDown={(e) => e.key === 'Enter' && handleSave()}
          />
          <Button
            onClick={handleSave}
            variant="outline"
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
                  className="h-7 w-7 p-0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity"
                  onClick={() => copyToClipboard(sq.query)}
                  title="Copier"
                >
                  <Copy className="w-3.5 h-3.5" />
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-7 w-7 p-0 rounded-md opacity-0 group-hover:opacity-100 transition-opacity text-destructive hover:text-destructive"
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