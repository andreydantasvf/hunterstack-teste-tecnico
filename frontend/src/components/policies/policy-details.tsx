import { type Policy } from '@/lib/schemas';
import { useDownloadPolicy, useCopyPolicy } from '@/hooks/use-policies';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from '@/components/ui/dialog';
import {
  Calendar,
  Globe,
  Download,
  Edit,
  Copy,
  Trash2,
  Loader2
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PolicyDetailsProps {
  policy: Policy | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (policy: Policy) => void;
  onDelete: (policy: Policy) => void;
}

const getCategoryColor = (category: string) => {
  const colors: Record<string, string> = {
    'Tech Giant': 'bg-primary-light text-primary',
    'E-commerce': 'bg-accent-light text-accent',
    'Entertainment': 'bg-warning-light text-warning',
    'Financial': 'bg-destructive-light text-destructive',
    'Healthcare': 'bg-secondary text-secondary-foreground',
    'Social Media': 'bg-muted text-muted-foreground',
  };
  return colors[category] || 'bg-muted text-muted-foreground';
};

export const PolicyDetails = ({ policy, isOpen, onClose, onEdit, onDelete }: PolicyDetailsProps) => {
  const downloadPolicyMutation = useDownloadPolicy();
  const copyPolicyMutation = useCopyPolicy();

  if (!policy) return null;

  const handleDownload = () => {
    downloadPolicyMutation.mutate({ id: policy.id });
  };

  const handleCopy = () => {
    copyPolicyMutation.mutate(policy);
  };

  const createdAt = policy.createdAt ? new Date(policy.createdAt) : new Date();
  const updatedAt = policy.updatedAt ? new Date(policy.updatedAt) : new Date();

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="bg-background max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader className="space-y-4 pt-4">
          <div className="flex items-start justify-between">
            <div className="flex-1 space-y-2">
              <Badge className={getCategoryColor(policy.category)}>
                {policy.category}
              </Badge>
              <DialogTitle className="text-2xl font-bold text-foreground leading-tight">
                {policy.title}
              </DialogTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEdit(policy)}
              >
                <Edit className="h-4 w-4 mr-2" />
                Editar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleDownload}
                disabled={downloadPolicyMutation.isPending}
              >
                {downloadPolicyMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Download className="h-4 w-4 mr-2" />
                )}
                Download
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopy}
                disabled={copyPolicyMutation.isPending}
              >
                {copyPolicyMutation.isPending ? (
                  <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Copy className="h-4 w-4 mr-2" />
                )}
                Copiar
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onDelete(policy)}
                className="text-destructive hover:text-destructive"
              >
                <Trash2 className="h-4 w-4 mr-2" />
                Deletar
              </Button>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-6 pt-2">
          {/* Metadata */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 p-4 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Criado em</p>
                <p className="text-sm text-muted-foreground">
                  {format(createdAt, 'dd/MM/yyyy', { locale: ptBR })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground" />
              <div>
                <p className="text-sm font-medium">Atualizado</p>
                <p className="text-sm text-muted-foreground">
                  {formatDistanceToNow(updatedAt, {
                    addSuffix: true,
                    locale: ptBR
                  })}
                </p>
              </div>
            </div>
          </div>

          {/* Source URL */}
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <Globe className="h-4 w-4 text-muted-foreground" />
              <h3 className="font-semibold">URL da Fonte</h3>
            </div>
            <div className="flex items-center gap-2 p-3 rounded bg-muted/50">
              <a
                href={policy.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-sm text-primary hover:underline break-all"
              >
                {policy.source_url}
              </a>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(policy.source_url, '_blank')}
              >
                <Globe className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <Separator />

          {/* Content */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Conteúdo da Política</h3>
            </div>
            <div className="max-h-96 overflow-y-auto p-4 rounded-lg bg-muted/30 text-sm leading-relaxed whitespace-pre-wrap">
              {policy.content}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
