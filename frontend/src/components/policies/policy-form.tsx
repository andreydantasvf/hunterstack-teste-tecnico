import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { createPolicySchema, updatePolicySchema, type CreatePolicyRequest, type UpdatePolicyRequest, type Policy } from '@/lib/schemas';
import { useCreatePolicy, useUpdatePolicy } from '@/hooks/use-policies';
import { POLICY_CATEGORIES } from '@/lib/constants';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
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
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/components/ui/form';
import { Loader2, Save, X } from 'lucide-react';

interface PolicyFormProps {
  isOpen: boolean;
  onClose: () => void;
  policy?: Policy | null;
}

export const PolicyForm = ({
  isOpen,
  onClose,
  policy
}: PolicyFormProps) => {
  const createPolicyMutation = useCreatePolicy();
  const updatePolicyMutation = useUpdatePolicy();

  const isEditing = !!policy;
  const schema = isEditing ? updatePolicySchema : createPolicySchema;

  const form = useForm<CreatePolicyRequest | UpdatePolicyRequest>({
    resolver: zodResolver(schema),
    defaultValues: {
      title: '',
      source_url: '',
      content: '',
      category: 'OUTROS'
    }
  });

  useEffect(() => {
    if (isOpen) {
      if (policy) {
        form.reset({
          title: policy.title,
          source_url: policy.source_url,
          content: policy.content,
          category: policy.category
        });
      } else {
        form.reset({
          title: '',
          source_url: '',
          content: '',
          category: 'OUTROS',
        });
      }
    }
  }, [isOpen, policy, form]);

  const onSubmit = async (data: CreatePolicyRequest | UpdatePolicyRequest) => {
    try {
      if (isEditing && policy?.id) {
        await updatePolicyMutation.mutateAsync({
          id: policy.id,
          data: data as UpdatePolicyRequest
        });
      } else {
        await createPolicyMutation.mutateAsync(data as CreatePolicyRequest);
      }
      onClose();
    } catch {
      // Error handling is done in the hooks
    }
  };

  const isLoading = createPolicyMutation.isPending || updatePolicyMutation.isPending;

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Save className="h-5 w-5" />
            {isEditing ? 'Editar Política' : 'Nova Política'}
          </DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4 sm:space-y-6">
            <FormField
              control={form.control}
              name="title"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Título *</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Digite o título da política..."
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="source_url"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>URL da Fonte *</FormLabel>
                  <FormControl>
                    <Input
                      type="url"
                      placeholder="https://exemplo.com/privacy-policy"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="category"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Categoria *</FormLabel>
                  <Select value={field.value} onValueChange={field.onChange}>
                    <FormControl>
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione uma categoria" />
                      </SelectTrigger>
                    </FormControl>
                    <SelectContent>
                      {POLICY_CATEGORIES.map((category) => (
                        <SelectItem key={category} value={category}>
                          {category}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="content"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Conteúdo *</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Cole aqui o conteúdo da política de privacidade..."
                      className="min-h-24 sm:min-h-32 resize-y"
                      {...field}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="gap-2 flex-col sm:flex-row">
              <Button
                type="button"
                variant="outline"
                onClick={onClose}
                disabled={isLoading}
                className="w-full sm:w-auto"
              >
                <X className="h-4 w-4 mr-2" />
                Cancelar
              </Button>
              <Button type="submit" disabled={isLoading} className="w-full sm:w-auto">
                {isLoading ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                {isEditing ? 'Atualizar' : 'Criar'}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
};
