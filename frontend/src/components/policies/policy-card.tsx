import { Policy } from '@/types/policy';
import { Card, CardContent, CardFooter, CardHeader } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  MoreVertical,
  Eye,
  Edit,
  Trash2,
  Download,
  ExternalLink,
  Calendar,
  Globe
} from 'lucide-react';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { formatDistanceToNow } from 'date-fns';
import { ptBR } from 'date-fns/locale';

interface PolicyCardProps {
  policy: Policy;
  onView: (policy: Policy) => void;
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

export const PolicyCard = ({ policy, onView, onEdit, onDelete }: PolicyCardProps) => {
  return (
    <Card className="group bg-gradient-card border-border hover:border-primary/20 hover:shadow-glow transition-all duration-300">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex-1 space-y-2 max-w-full">
            <div className="flex items-center gap-2">
              <Badge className={getCategoryColor(policy.category)}>
                {policy.category}
              </Badge>
              <span className="text-xs text-muted-foreground flex items-center gap-1">
                <Calendar className="h-3 w-3" />
                {formatDistanceToNow(new Date(policy.updatedAt), {
                  addSuffix: true,
                  locale: ptBR
                })}
              </span>
            </div>
            <h3 
              className="font-semibold text-lg text-foreground truncate group-hover:text-primary transition-colors"
              title={policy.title}
            >
              {policy.title}
            </h3>
          </div>

          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="icon" className="transition-opacity">
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-popover">
              <DropdownMenuItem className='cursor-pointer' onClick={() => onView(policy)}>
                <Eye className="mr-2 h-4 w-4" />
                Visualizar
              </DropdownMenuItem>
              <DropdownMenuItem className='cursor-pointer' onClick={() => onEdit(policy)}>
                <Edit className="mr-2 h-4 w-4" />
                Editar
              </DropdownMenuItem>
              <DropdownMenuItem className='cursor-pointer'>
                <Download className="mr-2 h-4 w-4" />
                Download
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem
                onClick={() => onDelete(policy)}
                className="text-destructive focus:text-destructive cursor-pointer"
              >
                <Trash2 className="mr-2 h-4 w-4" />
                Deletar
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>

      <CardContent className="pb-4">
        <p className="text-sm text-muted-foreground line-clamp-3 mb-3">
          {policy.content}
        </p>

        <div className="flex items-center gap-2 text-xs text-muted-foreground min-w-0">
          <Globe className="h-3 w-3 flex-shrink-0" />
          <a 
            href={policy.source_url} 
            target="_blank" 
            rel="noopener noreferrer" 
            className="flex-1 truncate hover:text-primary transition-colors"
            title={policy.source_url}
          >
            {policy.source_url}
          </a>
          <Button 
            variant="ghost" 
            size="sm" 
            className="h-auto p-1 flex-shrink-0"
            onClick={(e) => {
              e.preventDefault();
              window.open(policy.source_url, '_blank');
            }}
          >
            <ExternalLink className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>

      <CardFooter className="pt-0">
        <div className="flex w-full gap-2">
          <Button
            variant="outline"
            size="sm"
            className="flex-1"
            onClick={() => onView(policy)}
          >
            <Eye className="h-4 w-4 mr-2" />
            Ver Detalhes
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onEdit(policy)}
          >
            <Edit className="h-4 w-4" />
          </Button>
        </div>
      </CardFooter>
    </Card>
  );
};
