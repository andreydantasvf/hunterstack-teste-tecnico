import { Policy } from '@/types/policy';
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
  Check
} from 'lucide-react';
import { formatDistanceToNow, format } from 'date-fns';
import { ptBR } from 'date-fns/locale';
import { useState } from 'react';
import { toast } from 'sonner';

interface PolicyDetailsProps {
  policy: Policy | null;
  isOpen: boolean;
  onClose: () => void;
  onEdit: (policy: Policy) => void;
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

export const PolicyDetails = ({ policy, isOpen, onClose, onEdit }: PolicyDetailsProps) => {
  const [copied, setCopied] = useState(false);

  if (!policy) return null;

  const handleCopyContent = async () => {
    try {
      await navigator.clipboard.writeText(policy.content);
      setCopied(true);
      toast("Conteúdo copiado para a área de transferência.");
      setTimeout(() => setCopied(false), 2000);
    } catch {
      toast("Não foi possível copiar o conteúdo.");
    }
  };

  const handleDownload = () => {
    const dataStr = JSON.stringify(policy, null, 2);
    const dataBlob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(dataBlob);
    const link = document.createElement('a');
    link.href = url;
    link.download = `${policy.title.replace(/[^a-z0-9]/gi, '_').toLowerCase()}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);

    toast("O arquivo foi baixado com sucesso.");
  };

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
              >
                <Download className="h-4 w-4 mr-2" />
                Download
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 p-4 bg-muted/30 rounded-lg">
            <div className="flex items-start gap-2 text-sm min-w-0">
              <Globe className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div className="min-w-0 flex-1">
                <p className="text-muted-foreground mb-1">URL da Fonte</p>
                <a
                  href={policy.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-primary hover:underline block truncate text-sm"
                  title={policy.source_url}
                >
                  {policy.source_url}
                </a>
              </div>
            </div>

            <div className="flex items-start gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-muted-foreground mb-1">Criado em</p>
                <p className="font-medium">
                  {format(new Date(policy.createdAt), 'dd/MM/yyyy', { locale: ptBR })}
                </p>
              </div>
            </div>

            <div className="flex items-start gap-2 text-sm">
              <Calendar className="h-4 w-4 text-muted-foreground flex-shrink-0 mt-0.5" />
              <div>
                <p className="text-muted-foreground mb-1">Última atualização</p>
                <p className="font-medium">
                  {formatDistanceToNow(new Date(policy.updatedAt), {
                    addSuffix: true,
                    locale: ptBR
                  })}
                </p>
              </div>
            </div>
          </div>
        </DialogHeader>

        <Separator />

        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-foreground">Conteúdo da Política</h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleCopyContent}
            >
              {copied ? (
                <>
                  <Check className="h-4 w-4 mr-2" />
                  Copiado!
                </>
              ) : (
                <>
                  <Copy className="h-4 w-4 mr-2" />
                  Copiar
                </>
              )}
            </Button>
          </div>

          <div className="prose prose-sm max-w-none">
            <div className="bg-muted/30 rounded-lg p-6 border border-border">
              <pre className="whitespace-pre-wrap text-sm leading-relaxed text-foreground font-sans">
                {policy.content}
              </pre>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
