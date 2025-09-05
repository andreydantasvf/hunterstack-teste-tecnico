import { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Filter, X, RefreshCw } from 'lucide-react';
import { PolicyFilters as FilterType } from '@/types/policy';
import { policiesApi } from '@/lib/api';

interface PolicyFiltersProps {
  filters: FilterType;
  onFiltersChange: (filters: FilterType) => void;
  totalResults: number;
}

export const PolicyFilters = ({ 
  filters, 
  onFiltersChange, 
  totalResults 
}: PolicyFiltersProps) => {
  const [categories, setCategories] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadCategories = async () => {
      try {
        const cats = await policiesApi.getCategories();
        setCategories(cats);
      } catch (error) {
        console.error('Error loading categories:', error);
      }
    };
    loadCategories();
  }, []);

  const hasActiveFilters = filters.category && filters.category !== 'all';

  const handleCategoryChange = (category: string) => {
    onFiltersChange({
      ...filters,
      category: category === 'all' ? undefined : category,
      page: 1
    });
  };

  const clearFilters = () => {
    onFiltersChange({
      search: filters.search,
      page: 1
    });
  };

  const handleRefresh = () => {
    setIsLoading(true);
    onFiltersChange({ ...filters });
    setTimeout(() => setIsLoading(false), 1000);
  };

  return (
    <Card className="bg-gradient-card border-border">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <h3 className="text-sm font-medium text-foreground">Filtros</h3>
            {hasActiveFilters && (
              <Badge variant="secondary" className="text-xs">
                1 filtro ativo
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
            >
              <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
              >
                <X className="h-4 w-4 mr-1" />
                Limpar
              </Button>
            )}
          </div>
        </div>

        <div className="space-y-4">
          <div>
            <label className="text-xs font-medium text-muted-foreground mb-2 block">
              Categoria
            </label>
            <Select 
              value={filters.category || 'all'} 
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className="bg-background border-input-border">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent className="bg-popover">
                <SelectItem value="all">Todas as categorias</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category} value={category}>
                    {category}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="pt-2 border-t border-border">
            <div className="flex justify-between items-center text-xs text-muted-foreground">
              <span>Total de resultados:</span>
              <Badge variant="outline" className="text-xs">
                {totalResults}
              </Badge>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};