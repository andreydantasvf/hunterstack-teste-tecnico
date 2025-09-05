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
      } catch {
        // Error loading categories - continue with empty array
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
      <CardContent className="p-4">
        {/* Header compacto */}
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <span className="text-sm font-medium text-foreground">Filtros</span>
            {hasActiveFilters && (
              <Badge variant="secondary" className="text-xs h-5">
                1 ativo
              </Badge>
            )}
          </div>
          
          <div className="flex items-center gap-1">
            <Button
              variant="ghost"
              size="sm"
              onClick={handleRefresh}
              disabled={isLoading}
              className="h-8 w-8 p-0"
            >
              <RefreshCw className={`h-3.5 w-3.5 ${isLoading ? 'animate-spin' : ''}`} />
            </Button>
            
            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearFilters}
                className="h-8 px-2 text-xs"
              >
                <X className="h-3.5 w-3.5 mr-1" />
                Limpar
              </Button>
            )}
          </div>
        </div>

        {/* Filtros em layout horizontal compacto */}
        <div className="flex flex-col sm:flex-row sm:items-end gap-3">
          <div className="flex-1 min-w-0">
            <label className="text-xs font-medium text-muted-foreground mb-1.5 block">
              Categoria
            </label>
            <Select 
              value={filters.category || 'all'} 
              onValueChange={handleCategoryChange}
            >
              <SelectTrigger className="bg-background border-input-border h-9">
                <SelectValue placeholder="Todas as categorias" />
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

          {/* Total de resultados compacto */}
          <div className="flex items-center gap-2 text-xs text-muted-foreground sm:pb-1">
            <span className="whitespace-nowrap">Total:</span>
            <Badge variant="outline" className="text-xs h-6 px-2">
              {totalResults}
            </Badge>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
