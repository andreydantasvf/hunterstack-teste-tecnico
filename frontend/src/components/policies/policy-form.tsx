import { useState, useEffect } from 'react';
import { Policy, CreatePolicyRequest } from '@/types/policy';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/ui/dialog';
import { Loader2, Save, X } from 'lucide-react';
import { policiesApi } from '@/lib/api';

interface PolicyFormProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CreatePolicyRequest) => Promise<void>;
  policy?: Policy | null;
  isLoading?: boolean;
}

export const PolicyForm = ({ 
  isOpen, 
  onClose, 
  onSubmit, 
  policy, 
  isLoading = false 
}: PolicyFormProps) => {
  const [formData, setFormData] = useState<CreatePolicyRequest>({
    title: '',
    source_url: '',
    content: '',
    category: ''
  });
  const [categories, setCategories] = useState<string[]>([]);
  const [errors, setErrors] = useState<Record<string, string>>({});

  useEffect(() => {
    if (policy) {
      setFormData({
        title: policy.title,
        source_url: policy.source_url,
        content: policy.content,
        category: policy.category
      });
    } else {
      setFormData({
        title: '',
        source_url: '',
        content: '',
        category: ''
      });
    }
    setErrors({});
  }, [policy, isOpen]);

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

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.title.trim()) {
      newErrors.title = 'Título é obrigatório';
    }

    if (!formData.source_url.trim()) {
      newErrors.source_url = 'URL da fonte é obrigatória';
    } else {
      try {
        new URL(formData.source_url);
      } catch {
        newErrors.source_url = 'URL inválida';
      }
    }

    if (!formData.content.trim()) {
      newErrors.content = 'Conteúdo é obrigatório';
    }

    if (!formData.category) {
      newErrors.category = 'Categoria é obrigatória';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    try {
      await onSubmit(formData);
      onClose();
    } catch (error) {
      console.error('Error submitting form:', error);
    }
  };

  const handleInputChange = (field: keyof CreatePolicyRequest, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: '' }));
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-background max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="text-xl font-semibold">
            {policy ? 'Editar Política' : 'Nova Política'}
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="md:col-span-2">
              <Label htmlFor="title" className="text-sm font-medium">
                Título *
              </Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => handleInputChange('title', e.target.value)}
                placeholder="Digite o título da política"
                className={`bg-background border-input-border ${errors.title ? 'border-destructive' : ''}`}
              />
              {errors.title && (
                <p className="text-xs text-destructive mt-1">{errors.title}</p>
              )}
            </div>

            <div>
              <Label htmlFor="source_url" className="text-sm font-medium">
                URL da Fonte *
              </Label>
              <Input
                id="source_url"
                type="url"
                value={formData.source_url}
                onChange={(e) => handleInputChange('source_url', e.target.value)}
                placeholder="https://exemplo.com/politica"
                className={`bg-background border-input-border ${errors.source_url ? 'border-destructive' : ''}`}
              />
              {errors.source_url && (
                <p className="text-xs text-destructive mt-1">{errors.source_url}</p>
              )}
            </div>

            <div>
              <Label htmlFor="category" className="text-sm font-medium">
                Categoria *
              </Label>
              <Select 
                value={formData.category} 
                onValueChange={(value) => handleInputChange('category', value)}
              >
                <SelectTrigger className={`bg-background border-input-border ${errors.category ? 'border-destructive' : ''}`}>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent className="bg-popover">
                  {categories.map((category) => (
                    <SelectItem key={category} value={category}>
                      {category}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
              {errors.category && (
                <p className="text-xs text-destructive mt-1">{errors.category}</p>
              )}
            </div>
          </div>

          <div>
            <Label htmlFor="content" className="text-sm font-medium">
              Conteúdo *
            </Label>
            <Textarea
              id="content"
              value={formData.content}
              onChange={(e) => handleInputChange('content', e.target.value)}
              placeholder="Cole o conteúdo da política de privacidade aqui..."
              rows={8}
              className={`bg-background border-input-border resize-none ${errors.content ? 'border-destructive' : ''}`}
            />
            {errors.content && (
              <p className="text-xs text-destructive mt-1">{errors.content}</p>
            )}
          </div>

          <DialogFooter className="flex flex-col sm:flex-row gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoading}
            >
              <X className="h-4 w-4 mr-2" />
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-gradient-primary hover:bg-primary-hover"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              ) : (
                <Save className="h-4 w-4 mr-2" />
              )}
              {policy ? 'Atualizar' : 'Criar'} Política
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
};