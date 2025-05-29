
'use client';

import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { AlertBadge } from '@/components/ui/alert-badge';
import { Alert } from '@/lib/types';
import { Check, X, Clock } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface AlertListProps {
  alerts: Alert[];
  maxItems?: number;
  showActions?: boolean;
}

export function AlertList({ alerts, maxItems = 10, showActions = true }: AlertListProps) {
  const [localAlerts, setLocalAlerts] = useState(alerts);

  const handleAcknowledge = (alertId: string) => {
    setLocalAlerts(prev => 
      prev.map(alert => 
        alert.id === alertId 
          ? { ...alert, acknowledged: true }
          : alert
      )
    );
  };

  const handleDismiss = (alertId: string) => {
    setLocalAlerts(prev => prev.filter(alert => alert.id !== alertId));
  };

  const displayAlerts = localAlerts.slice(0, maxItems);
  const unacknowledgedCount = localAlerts.filter(a => !a.acknowledged).length;

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <CardTitle className="text-lg font-semibold">System Alerts</CardTitle>
        {unacknowledgedCount > 0 && (
          <Badge variant="destructive">
            {unacknowledgedCount} unacknowledged
          </Badge>
        )}
      </CardHeader>
      <CardContent className="space-y-3">
        {displayAlerts.length === 0 ? (
          <div className="text-center py-8 text-muted-foreground">
            <Check className="h-8 w-8 mx-auto mb-2 text-green-500" />
            <p>No active alerts</p>
          </div>
        ) : (
          displayAlerts.map((alert) => (
            <div
              key={alert.id}
              className={`p-3 rounded-lg border transition-colors ${
                alert.acknowledged 
                  ? 'bg-muted/50 border-muted' 
                  : 'bg-background border-border shadow-sm'
              }`}
            >
              <div className="flex items-start justify-between gap-3">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-1">
                    <AlertBadge alert={alert} />
                    {alert.acknowledged && (
                      <Badge variant="outline" className="text-xs">
                        <Check className="h-3 w-3 mr-1" />
                        Acknowledged
                      </Badge>
                    )}
                  </div>
                  
                  <p className="text-sm font-medium text-foreground mb-1">
                    {alert.message}
                  </p>
                  
                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                    <span className="flex items-center gap-1">
                      <Clock className="h-3 w-3" />
                      {formatDistanceToNow(new Date(alert.timestamp), { addSuffix: true })}
                    </span>
                    {alert.minerIp && (
                      <span>Miner: {alert.minerIp}</span>
                    )}
                    {alert.metricValue && alert.threshold && (
                      <span>
                        Value: {alert.metricValue.toFixed(1)} / Threshold: {alert.threshold}
                      </span>
                    )}
                  </div>
                </div>
                
                {showActions && !alert.acknowledged && (
                  <div className="flex items-center gap-1">
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleAcknowledge(alert.id)}
                      className="h-8 px-2"
                    >
                      <Check className="h-3 w-3" />
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() => handleDismiss(alert.id)}
                      className="h-8 px-2"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                )}
              </div>
            </div>
          ))
        )}
        
        {localAlerts.length > maxItems && (
          <div className="text-center pt-2">
            <Button variant="outline" size="sm">
              View all {localAlerts.length} alerts
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
