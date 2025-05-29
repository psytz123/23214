
'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MinerTelemetry } from '@/lib/types';
import { 
  Thermometer, 
  Zap, 
  Activity, 
  Clock,
  Wifi,
  WifiOff,
  AlertTriangle
} from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';

interface MinerStatusGridProps {
  miners: MinerTelemetry[];
  onMinerClick?: (miner: MinerTelemetry) => void;
}

export function MinerStatusGrid({ miners, onMinerClick }: MinerStatusGridProps) {
  const getStatusColor = (status: MinerTelemetry['status']) => {
    switch (status) {
      case 'online':
        return 'bg-green-500';
      case 'offline':
        return 'bg-red-500';
      case 'error':
        return 'bg-yellow-500';
      case 'maintenance':
        return 'bg-blue-500';
      default:
        return 'bg-gray-500';
    }
  };

  const getStatusIcon = (status: MinerTelemetry['status']) => {
    switch (status) {
      case 'online':
        return Wifi;
      case 'offline':
        return WifiOff;
      case 'error':
        return AlertTriangle;
      case 'maintenance':
        return Clock;
      default:
        return WifiOff;
    }
  };

  const getStatusVariant = (status: MinerTelemetry['status']) => {
    switch (status) {
      case 'online':
        return 'default';
      case 'offline':
        return 'destructive';
      case 'error':
        return 'secondary';
      case 'maintenance':
        return 'outline';
      default:
        return 'outline';
    }
  };

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
      {miners.map((miner) => {
        const StatusIcon = getStatusIcon(miner.status);
        const isOnline = miner.status === 'online';
        
        return (
          <Card 
            key={miner.id}
            className={`cursor-pointer transition-all hover:shadow-md ${
              onMinerClick ? 'hover:scale-105' : ''
            }`}
            onClick={() => onMinerClick?.(miner)}
          >
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <CardTitle className="text-sm font-medium">
                  {miner.minerIp}
                </CardTitle>
                <div className="flex items-center gap-2">
                  <div className={`w-2 h-2 rounded-full ${getStatusColor(miner.status)}`} />
                  <StatusIcon className="h-4 w-4 text-muted-foreground" />
                </div>
              </div>
              <Badge variant={getStatusVariant(miner.status)} className="w-fit">
                {miner.status.toUpperCase()}
              </Badge>
            </CardHeader>
            
            <CardContent className="space-y-3">
              {isOnline ? (
                <>
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Activity className="h-3 w-3" />
                      Hashrate
                    </span>
                    <span className="font-medium">
                      {miner.hashrate.toFixed(1)} TH/s
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Thermometer className="h-3 w-3" />
                      Temperature
                    </span>
                    <span className={`font-medium ${
                      miner.temperature.chip > 85 ? 'text-red-500' :
                      miner.temperature.chip > 80 ? 'text-yellow-500' :
                      'text-foreground'
                    }`}>
                      {miner.temperature.chip.toFixed(0)}°C
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="flex items-center gap-1 text-muted-foreground">
                      <Zap className="h-3 w-3" />
                      Power
                    </span>
                    <span className="font-medium">
                      {miner.power.toFixed(0)}W
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Efficiency</span>
                    <span className="font-medium">
                      {miner.efficiency.toFixed(1)} W/TH
                    </span>
                  </div>
                  
                  <div className="pt-2 border-t">
                    <div className="text-xs text-muted-foreground">
                      Uptime: {formatDistanceToNow(new Date(Date.now() - miner.uptime * 1000))}
                    </div>
                    <div className="text-xs text-muted-foreground mt-1">
                      Shares: {miner.acceptedShares.toLocaleString()} / {miner.rejectedShares.toLocaleString()}
                    </div>
                  </div>
                </>
              ) : (
                <div className="text-center py-4 text-muted-foreground">
                  <StatusIcon className="h-8 w-8 mx-auto mb-2" />
                  <p className="text-sm">
                    {miner.status === 'offline' ? 'Miner is offline' :
                     miner.status === 'error' ? 'Error detected' :
                     'Under maintenance'}
                  </p>
                  <p className="text-xs mt-1">
                    Last seen: {formatDistanceToNow(new Date(miner.timestamp), { addSuffix: true })}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        );
      })}
    </div>
  );
}
