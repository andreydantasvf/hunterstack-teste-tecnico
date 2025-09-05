import { type Policy } from '@/lib/schemas';
import { useDeletePolicy } from '@/hooks/use-policies';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Trash2, Loader2 } from 'lucide-react';

interface DeletePolicyDialogProps {
  policy: Policy | null;
  isOpen: boolean;
  onClose: () => void;
}

export const DeletePolicyDialog = ({ 
  policy, 
  isOpen, 
  onClose
}: DeletePolicyDialogProps) => {
  const deletePolicyMutation = useDeletePolicy();

  if (!policy) return null;

  const handleConfirm = async () => {
    if (policy.id) {
      await deletePolicyMutation.mutateAsync(policy.id);
      onClose();
    }
  };

  const isLoading = deletePolicyMutation.isPending;

  return (
    <AlertDialog open={isOpen} onOpenChange={onClose}>
      <AlertDialogContent className="bg-background">
        <AlertDialogHeader>
          <AlertDialogTitle className="flex items-center gap-2 text-destructive">
            <Trash2 className="h-5 w-5" />
            Deletar Política
          </AlertDialogTitle>
          <AlertDialogDescription className="text-muted-foreground">
            Tem certeza que deseja deletar a política{' '}
            <span className="font-semibold text-foreground">&ldquo;{policy.title}&rdquo;</span>?
            <br />
            <br />
            Esta ação não pode ser desfeita e todos os dados relacionados serão permanentemente removidos.
          </AlertDialogDescription>
        </AlertDialogHeader>
        <AlertDialogFooter>
          <AlertDialogCancel disabled={isLoading}>
            Cancelar
          </AlertDialogCancel>
          <AlertDialogAction
            onClick={handleConfirm}
            disabled={isLoading}
            className="bg-destructive hover:bg-destructive/90 text-destructive-foreground"
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4 mr-2" />
            )}
            Deletar Política
          </AlertDialogAction>
        </AlertDialogFooter>
      </AlertDialogContent>
    </AlertDialog>
  );
};
