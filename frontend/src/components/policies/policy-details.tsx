import { type Policy } from '@/lib/schemas';
import { useDownloadPolicy, useCopyPolicy } from '@/hooks/use-policies';
import { getCategoryColor } from '@/lib/constants';
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
          <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
            <div className="flex-1 space-y-2">
              <Badge className={getCategoryColor(policy.category)}>
                {policy.category}
              </Badge>
              <DialogTitle className="text-xl sm:text-2xl font-bold text-foreground leading-tight">
                {policy.title}
              </DialogTitle>
            </div>
            
            {/* Desktop action buttons */}
            <div className="hidden sm:flex items-center gap-2">
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

            {/* Mobile action buttons */}
            <div className="sm:hidden flex flex-col gap-2">
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onEdit(policy)}
                  className="flex-1"
                >
                  <Edit className="h-4 w-4 mr-2" />
                  Editar
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => onDelete(policy)}
                  className="flex-1 text-destructive hover:text-destructive"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Deletar
                </Button>
              </div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownload}
                  disabled={downloadPolicyMutation.isPending}
                  className="flex-1"
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
                  className="flex-1"
                >
                  {copyPolicyMutation.isPending ? (
                    <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                  ) : (
                    <Copy className="h-4 w-4 mr-2" />
                  )}
                  Copiar
                </Button>
              </div>
            </div>
          </div>
        </DialogHeader>

        <div className="space-y-4 sm:space-y-6 pt-2">
          {/* Metadata */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 sm:gap-4 p-3 sm:p-4 rounded-lg bg-muted/30">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <div>
                <p className="text-sm font-medium">Criado em</p>
                <p className="text-sm text-muted-foreground">
                  {format(createdAt, 'dd/MM/yyyy', { locale: ptBR })}
                </p>
              </div>
            </div>
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0" />
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
              <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0" />
              <h3 className="font-semibold">URL da Fonte</h3>
            </div>
            <div className="flex flex-col sm:flex-row sm:items-center gap-2 p-3 rounded bg-muted/50">
              <a
                href={policy.source_url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 text-sm text-primary hover:underline break-all leading-relaxed"
              >
                {policy.source_url}
              </a>
              <Button
                variant="ghost"
                size="sm"
                onClick={() => window.open(policy.source_url, '_blank')}
                className="self-start sm:self-center flex-shrink-0"
              >
                <Globe className="h-4 w-4" />
                <span className="sr-only">Abrir URL</span>
              </Button>
            </div>
          </div>

          <Separator />

          {/* Content */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <h3 className="font-semibold">Conteúdo da Política</h3>
            </div>
            <div className="max-h-64 sm:max-h-96 overflow-y-auto p-3 sm:p-4 rounded-lg bg-muted/30 text-sm leading-relaxed whitespace-pre-wrap">
              {policy.content}
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
