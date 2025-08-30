import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Textarea } from '@/components/ui/textarea';
import { Copy, Check, Search, Briefcase } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import enhancedJobTitlesData from '@/data/enhancedJobTitles.json';
import { generateBooleanQuery } from '@/utils/queryGenerator';
import { useJobTitleSuggestions } from '@/hooks/useJobTitleSuggestions';

const BooleanGenerator = () => {
  const [inputValue, setInputValue] = useState('');
  const [mode, setMode] = useState<'free' | 'category'>('free');
  const [selectedCategory, setSelectedCategory] = useState<string>('');
  const [selectedTitles, setSelectedTitles] = useState<string[]>([]);
  const [customTitles, setCustomTitles] = useState<string[]>([]);
  const [copied, setCopied] = useState(false);
  const { toast } = useToast();

  // Suggestions basées sur l'input avec algorithme amélioré
  const suggestions = useJobTitleSuggestions(inputValue, enhancedJobTitlesData, 10);

  // Génération de la requête boolean avec la nouvelle logique
  const booleanQuery = generateBooleanQuery(enhancedJobTitlesData, {
    mode,
    inputValue,
    selectedCategory,
    selectedTitles,
    customTitles
  });

  const copyToClipboard = async () => {
    if (!booleanQuery) return;
    
    try {
      await navigator.clipboard.writeText(booleanQuery);
      setCopied(true);
      toast({
        title: "Copié !",
        description: "La requête boolean a été copiée dans le presse-papier.",
      });
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      toast({
        title: "Erreur",
        description: "Impossible de copier la requête.",
        variant: "destructive",
      });
    }
  };

  const addCustomTitle = (title: string) => {
    if (title && !customTitles.includes(title)) {
      setCustomTitles([...customTitles, title]);
    }
  };

  const toggleSelectedTitle = (title: string) => {
    setSelectedTitles(prev => 
      prev.includes(title) 
        ? prev.filter(t => t !== title)
        : [...prev, title]
    );
  };

  const removeCustomTitle = (title: string) => {
    setCustomTitles(prev => prev.filter(t => t !== title));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8 max-w-4xl">
        {/* Header */}
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-primary mb-4">
            Prospection B2B Master
          </h1>
          <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
            Transformez un intitulé de poste en requête boolean LinkedIn enrichie avec synonymes, 
            variantes linguistiques et genres
          </p>
        </header>

        {/* Mode Selection */}
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Search className="w-5 h-5" />
              Mode de recherche
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex gap-4">
              <Button
                variant={mode === 'free' ? 'default' : 'outline'}
                onClick={() => setMode('free')}
                className="flex-1"
              >
                Recherche libre
              </Button>
              <Button
                variant={mode === 'category' ? 'default' : 'outline'}
                onClick={() => setMode('category')}
                className="flex-1"
              >
                <Briefcase className="w-4 h-4 mr-2" />
                Arborescence métier
              </Button>
            </div>
          </CardContent>
        </Card>

        {mode === 'free' ? (
          /* Mode Recherche Libre */
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Saisissez un intitulé de poste</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="job-input">Intitulé de poste / fonction</Label>
                <Input
                  id="job-input"
                  value={inputValue}
                  onChange={(e) => setInputValue(e.target.value)}
                  placeholder="Ex: CMO, Directeur Marketing, Head of Sales..."
                  className="mt-2"
                />
              </div>

              {/* Suggestions */}
              {suggestions.length > 0 && (
                <div>
                  <Label>Suggestions (cliquez pour ajouter)</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {suggestions.map((suggestion) => (
                      <Badge
                        key={suggestion}
                        variant={selectedTitles.includes(suggestion) ? "default" : "outline"}
                        className="cursor-pointer hover:bg-accent"
                        onClick={() => toggleSelectedTitle(suggestion)}
                      >
                        {suggestion}
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              {/* Titres personnalisés */}
              {customTitles.length > 0 && (
                <div>
                  <Label>Titres ajoutés</Label>
                  <div className="flex flex-wrap gap-2 mt-2">
                    {customTitles.map((title) => (
                      <Badge
                        key={title}
                        variant="secondary"
                        className="cursor-pointer"
                        onClick={() => removeCustomTitle(title)}
                      >
                        {title} ×
                      </Badge>
                    ))}
                  </div>
                </div>
              )}

              <Button
                onClick={() => {
                  if (inputValue.trim()) {
                    addCustomTitle(inputValue.trim());
                    setInputValue('');
                  }
                }}
                disabled={!inputValue.trim()}
                variant="outline"
              >
                Ajouter ce titre
              </Button>
            </CardContent>
          </Card>
        ) : (
          /* Mode Arborescence */
          <Card className="mb-8">
            <CardHeader>
              <CardTitle>Sélectionnez une catégorie métier</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                {Object.keys(enhancedJobTitlesData).map((category) => (
                  <Button
                    key={category}
                    variant={selectedCategory === category ? 'default' : 'outline'}
                    onClick={() => setSelectedCategory(category)}
                    className="h-auto p-4 text-left"
                  >
                    <div>
                      <div className="font-semibold capitalize">{category}</div>
                      <div className="text-sm opacity-70">
                        {enhancedJobTitlesData[category as keyof typeof enhancedJobTitlesData].length} titres
                      </div>
                    </div>
                  </Button>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Résultat */}
        {booleanQuery && (
          <Card className="mb-8">
            <CardHeader>
              <CardTitle className="flex items-center justify-between">
                Requête Boolean LinkedIn
                <Button
                  onClick={copyToClipboard}
                  size="sm"
                  variant="outline"
                  className="flex items-center gap-2"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copié !' : 'Copier'}
                </Button>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <Textarea
                value={booleanQuery}
                readOnly
                className="font-mono text-sm min-h-[100px] bg-muted"
              />
              <p className="text-sm text-muted-foreground mt-2">
                Copiez cette requête et utilisez-la dans LinkedIn Sales Navigator pour une prospection ciblée.
              </p>
            </CardContent>
          </Card>
        )}

        {/* CTA */}
        <div className="text-center">
          <Button
            onClick={copyToClipboard}
            disabled={!booleanQuery}
            size="lg"
            className="px-8"
          >
            {booleanQuery ? 'Générer et Copier la Requête' : 'Saisissez un poste pour générer'}
          </Button>
        </div>

        {/* Footer */}
        <footer className="mt-16 text-center border-t pt-8">
          <p className="text-sm text-muted-foreground">
            Made by{' '}
            <a
              href="https://la-mine.io"
              target="_blank"
              rel="noopener noreferrer"
              className="text-accent hover:underline"
            >
              La‑Mine.io
            </a>
          </p>
        </footer>
      </div>
    </div>
  );
};

export default BooleanGenerator;