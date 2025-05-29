
import { Badge } from '@/components/ui/badge';
import { Alert } from '@/lib/types';
import { AlertTriangle, Info, XCircle } from 'lucide-react';

interface AlertBadgeProps {
  alert: Alert;
  showIcon?: boolean;
}

export function AlertBadge({ alert, showIcon = true }: AlertBadgeProps) {
  const getVariant = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return 'destructive';
      case 'warning':
        return 'secondary';
      case 'info':
        return 'outline';
      default:
        return 'outline';
    }
  };

  const getIcon = (severity: Alert['severity']) => {
    switch (severity) {
      case 'critical':
        return XCircle;
      case 'warning':
        return AlertTriangle;
      case 'info':
        return Info;
      default:
        return Info;
    }
  };

  const Icon = getIcon(alert.severity);

  return (
    <Badge variant={getVariant(alert.severity)} className="flex items-center gap-1">
      {showIcon && <Icon className="h-3 w-3" />}
      {alert.severity.toUpperCase()}
    </Badge>
  );
}
