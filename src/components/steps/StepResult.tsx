import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, Copy, Check, RotateCcw } from 'lucide-react';
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
      toast({
        title: "Copié !",
        description: "Requête copiée dans le presse-papier.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast({
        title: "Erreur",
        description: "Impossible de copier la requête.",
        variant: "destructive",
      });
    }
  };

  const charCount = booleanQuery.length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between flex-wrap gap-2">
            <CardTitle className="text-lg">Votre requête Boolean LinkedIn</CardTitle>
            <div className="flex gap-2">
              <Badge variant="secondary">{selectedCount} titres</Badge>
              <Badge variant="outline">{charCount} caractères</Badge>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            value={booleanQuery}
            readOnly
            className="font-mono text-sm min-h-[150px] bg-muted/50 border-border"
          />

          <Button
            onClick={copyToClipboard}
            size="lg"
            className="w-full"
          >
            {copied ? <Check className="w-5 h-5 mr-2" /> : <Copy className="w-5 h-5 mr-2" />}
            {copied ? 'Copié !' : 'Copier la requête'}
          </Button>

          <p className="text-sm text-muted-foreground text-center">
            Collez cette requête dans le champ «&nbsp;Titre&nbsp;» de LinkedIn Sales Navigator.
          </p>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} size="lg">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Modifier
        </Button>
        <Button variant="outline" onClick={onReset} size="lg">
          <RotateCcw className="w-4 h-4 mr-2" />
          Nouvelle recherche
        </Button>
      </div>
    </div>
  );
};

export default StepResult;
