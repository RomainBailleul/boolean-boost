import React from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ArrowLeft, ArrowRight, Plus } from 'lucide-react';
import { useJobTitleSuggestions } from '@/hooks/useJobTitleSuggestions';
import enhancedJobTitlesData from '@/data/enhancedJobTitles.json';

interface StepSelectProps {
  mode: 'free' | 'category';
  inputValue: string;
  selectedCategory: string;
  selectedTitles: string[];
  setSelectedTitles: React.Dispatch<React.SetStateAction<string[]>>;
  customTitles: string[];
  setCustomTitles: React.Dispatch<React.SetStateAction<string[]>>;
  onNext: () => void;
  onBack: () => void;
}

const StepSelect: React.FC<StepSelectProps> = ({
  mode, inputValue, selectedCategory,
  selectedTitles, setSelectedTitles,
  customTitles, setCustomTitles,
  onNext, onBack,
}) => {
  const [customInput, setCustomInput] = React.useState('');
  const suggestions = useJobTitleSuggestions(inputValue, enhancedJobTitlesData, 20);

  // In category mode, show all titles from selected category
  const categoryTitles = mode === 'category' && selectedCategory
    ? enhancedJobTitlesData[selectedCategory as keyof typeof enhancedJobTitlesData] || []
    : [];

  const availableTitles = mode === 'free' ? suggestions : categoryTitles;

  const toggleTitle = (title: string) => {
    setSelectedTitles(prev =>
      prev.includes(title) ? prev.filter(t => t !== title) : [...prev, title]
    );
  };

  const addCustom = () => {
    const trimmed = customInput.trim();
    if (trimmed && !customTitles.includes(trimmed) && !selectedTitles.includes(trimmed)) {
      setCustomTitles(prev => [...prev, trimmed]);
      setSelectedTitles(prev => [...prev, trimmed]);
      setCustomInput('');
    }
  };

  const selectAll = () => {
    const all = [...new Set([...availableTitles, ...customTitles])];
    setSelectedTitles(all);
  };

  const deselectAll = () => setSelectedTitles([]);

  const totalSelected = selectedTitles.length;

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg">
              Sélectionnez les variantes à inclure
            </CardTitle>
            <Badge variant="secondary" className="text-sm">
              {totalSelected} sélectionné{totalSelected > 1 ? 's' : ''}
            </Badge>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Bulk actions */}
          <div className="flex gap-2">
            <Button variant="outline" size="sm" onClick={selectAll}>
              Tout sélectionner
            </Button>
            <Button variant="outline" size="sm" onClick={deselectAll}>
              Tout désélectionner
            </Button>
          </div>

          {/* Available titles */}
          <div className="flex flex-wrap gap-2 max-h-[300px] overflow-y-auto p-1">
            {availableTitles.map((title) => (
              <Badge
                key={title}
                variant={selectedTitles.includes(title) ? 'default' : 'outline'}
                className="cursor-pointer text-sm py-1.5 px-3 transition-all hover:shadow-sm"
                onClick={() => toggleTitle(title)}
              >
                {title}
              </Badge>
            ))}
            {customTitles.filter(t => !availableTitles.includes(t)).map((title) => (
              <Badge
                key={`custom-${title}`}
                variant={selectedTitles.includes(title) ? 'default' : 'outline'}
                className="cursor-pointer text-sm py-1.5 px-3 transition-all hover:shadow-sm border-dashed"
                onClick={() => toggleTitle(title)}
              >
                {title}
              </Badge>
            ))}
          </div>

          {/* Add custom title */}
          <div className="flex gap-2 pt-2 border-t border-border">
            <Input
              value={customInput}
              onChange={(e) => setCustomInput(e.target.value)}
              placeholder="Ajouter un titre personnalisé..."
              className="flex-1"
              onKeyDown={(e) => e.key === 'Enter' && addCustom()}
            />
            <Button variant="outline" onClick={addCustom} disabled={!customInput.trim()}>
              <Plus className="w-4 h-4" />
            </Button>
          </div>
        </CardContent>
      </Card>

      <div className="flex justify-between">
        <Button variant="outline" onClick={onBack} size="lg">
          <ArrowLeft className="w-4 h-4 mr-2" />
          Retour
        </Button>
        <Button onClick={onNext} disabled={totalSelected === 0} size="lg">
          Générer la requête
          <ArrowRight className="w-4 h-4 ml-2" />
        </Button>
      </div>
    </div>
  );
};

export default StepSelect;
