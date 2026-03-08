import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { ArrowLeft, Copy, Check, RotateCcw, Linkedin } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

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
  const { toast } = useToast();

  const copyToClipboard = async () => {
    try {
      await navigator.clipboard.writeText(booleanQuery);
      setCopied(true);
      toast({ title: "Copié !", description: "Requête copiée dans le presse-papier." });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({ title: "Erreur", description: "Impossible de copier.", variant: "destructive" });
    }
  };

  return (
    <div className="space-y-4 sm:space-y-6">
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
          onClick={copyToClipboard}
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