
// Core data types for mining fleet monitoring

export interface MinerTelemetry {
  id: string;
  minerIp: string;
  timestamp: number;
  hashrate: number; // TH/s
  temperature: {
    chip: number;
    board: number;
    waterInlet?: number;
    waterOutlet?: number;
  };
  power: number; // watts
  uptime: number; // seconds
  status: 'online' | 'offline' | 'error' | 'maintenance';
  fanSpeed?: number; // RPM
  acceptedShares: number;
  rejectedShares: number;
  efficiency: number; // W/TH
}

export interface ChipData {
  id: number;
  hashrate: number;
  temperature: number;
  status: 'active' | 'inactive' | 'error';
}

export interface ChainData {
  id: number;
  chips: number;
  hashrate: number;
  temperature: number;
  status: 'healthy' | 'degraded' | 'failed';
}

export interface MinerDetails extends MinerTelemetry {
  name: string;
  model: string;
  firmwareVersion: string;
  chips: ChipData[];
  chains: ChainData[];
  poolConfig: {
    url: string;
    username: string;
    algorithm: string;
  };
}

export interface FleetMetrics {
  totalMiners: number;
  onlineMiners: number;
  totalHashrate: number; // TH/s
  totalPower: number; // watts
  averageTemperature: number;
  averageEfficiency: number; // W/TH
  estimatedDailyEarnings: number; // USD
  uptime: number; // percentage
}

export interface PoolStats {
  algorithm: string;
  usdProfitability: number;
  btcProfitability: number;
  maxUsd: number;
  maxBtc: number;
  percentileUsd: number;
  percentileBtc: number;
  dataTimestamp: number;
  serverTimestamp: number;
  serverId: number;
}

export interface WorkerStatus {
  workerId: string;
  minerIp: string;
  connected: boolean;
  hashrate: number;
  sharesAccepted: number;
  sharesRejected: number;
  lastSeen: number;
  earnings: {
    daily: number;
    weekly: number;
    monthly: number;
  };
}

export interface Alert {
  id: string;
  severity: 'info' | 'warning' | 'critical';
  message: string;
  minerIp?: string;
  timestamp: number;
  acknowledged: boolean;
  metricValue?: number;
  threshold?: number;
}

export interface ProfitabilityData {
  coin: string;
  algorithm: string;
  profitability: number; // USD per TH/day
  difficulty: number;
  blockReward: number;
  price: number; // USD
  volume24h: number;
}

export interface EarningsBreakdown {
  coin: string;
  amount: number;
  usdValue: number;
  percentage: number;
  hashrate: number;
}

export interface PerformanceHistory {
  timestamp: number;
  hashrate: number;
  power: number;
  temperature: number;
  earnings: number;
  efficiency: number;
}
