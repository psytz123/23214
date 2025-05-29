
import { 
  MinerTelemetry, 
  MinerDetails, 
  FleetMetrics, 
  PoolStats, 
  WorkerStatus, 
  Alert, 
  ProfitabilityData, 
  EarningsBreakdown,
  PerformanceHistory 
} from './types';

// Mock miner IPs for the fleet
const MINER_IPS = [
  '192.168.1.100', '192.168.1.101', '192.168.1.102', '192.168.1.103',
  '192.168.1.104', '192.168.1.105', '192.168.1.106', '192.168.1.107',
  '192.168.1.108', '192.168.1.109', '192.168.1.110', '192.168.1.111'
];

// Simple seeded random number generator for consistent values
class SeededRandom {
  public seed: number;

  constructor(seed: number) {
    this.seed = seed;
  }

  next(): number {
    this.seed = (this.seed * 9301 + 49297) % 233280;
    return this.seed / 233280;
  }

  between(min: number, max: number): number {
    return this.next() * (max - min) + min;
  }
}

// Create a global seeded random instance for consistent values
const seededRandom = new SeededRandom(12345);

// Generate consistent value within range
const randomBetween = (min: number, max: number): number => 
  seededRandom.between(min, max);

// Generate mock miner telemetry
export const generateMockMinerTelemetry = (): MinerTelemetry[] => {
  // Reset seed for consistent results
  seededRandom.seed = 12345;
  
  return MINER_IPS.map((ip, index) => {
    const isOnline = seededRandom.next() > 0.1; // 90% uptime
    const baseHashrate = randomBetween(140, 160);
    const hashrate = isOnline ? baseHashrate * randomBetween(0.95, 1.05) : 0;
    const power = isOnline ? hashrate * randomBetween(22, 26) : 0;
    
    return {
      id: `miner-${index + 1}`,
      minerIp: ip,
      timestamp: Date.now(),
      hashrate,
      temperature: {
        chip: isOnline ? randomBetween(70, 85) : 0,
        board: isOnline ? randomBetween(60, 75) : 0,
        waterInlet: isOnline ? randomBetween(18, 25) : 0,
        waterOutlet: isOnline ? randomBetween(22, 30) : 0,
      },
      power,
      uptime: isOnline ? randomBetween(86000, 90000) : 0,
      status: isOnline ? 'online' : seededRandom.next() > 0.5 ? 'offline' : 'error',
      fanSpeed: isOnline ? randomBetween(2800, 3200) : 0,
      acceptedShares: isOnline ? Math.floor(randomBetween(1000, 5000)) : 0,
      rejectedShares: isOnline ? Math.floor(randomBetween(10, 100)) : 0,
      efficiency: power > 0 ? power / hashrate : 0,
    };
  });
};

// Generate detailed miner data
export const generateMockMinerDetails = (minerIp: string): MinerDetails => {
  const telemetry = generateMockMinerTelemetry().find(m => m.minerIp === minerIp);
  if (!telemetry) throw new Error('Miner not found');

  const isOnline = telemetry.status === 'online';
  
  return {
    ...telemetry,
    name: `Antminer L7 ${telemetry.id.split('-')[1]}`,
    model: 'Antminer L7',
    firmwareVersion: '1.0.2.8',
    chips: Array.from({ length: 126 }, (_, i) => ({
      id: i + 1,
      hashrate: isOnline ? randomBetween(1.1, 1.3) : 0,
      temperature: isOnline ? randomBetween(70, 80) : 0,
      status: isOnline ? (seededRandom.next() > 0.02 ? 'active' : 'error') : 'inactive',
    })),
    chains: Array.from({ length: 3 }, (_, i) => ({
      id: i,
      chips: 42,
      hashrate: isOnline ? telemetry.hashrate / 3 : 0,
      temperature: isOnline ? randomBetween(72, 78) : 0,
      status: isOnline ? 'healthy' : 'failed',
    })),
    poolConfig: {
      url: 'stratum+tcp://prohashing.com:3333',
      username: `worker${telemetry.id.split('-')[1]}`,
      algorithm: 'scrypt',
    },
  };
};

// Generate fleet metrics
export const generateMockFleetMetrics = (): FleetMetrics => {
  // Reset seed for consistent results
  seededRandom.seed = 12345;
  
  const miners = generateMockMinerTelemetry();
  const onlineMiners = miners.filter(m => m.status === 'online');
  
  const totalHashrate = onlineMiners.reduce((sum, m) => sum + m.hashrate, 0);
  const totalPower = onlineMiners.reduce((sum, m) => sum + m.power, 0);
  const avgTemp = onlineMiners.length > 0 
    ? onlineMiners.reduce((sum, m) => sum + m.temperature.chip, 0) / onlineMiners.length 
    : 0;
  
  return {
    totalMiners: miners.length,
    onlineMiners: onlineMiners.length,
    totalHashrate,
    totalPower,
    averageTemperature: avgTemp,
    averageEfficiency: totalPower > 0 ? totalPower / totalHashrate : 0,
    estimatedDailyEarnings: totalHashrate * 0.0025 * 24, // Mock profitability
    uptime: (onlineMiners.length / miners.length) * 100,
  };
};

// Generate pool statistics
export const generateMockPoolStats = (): PoolStats => {
  // Reset seed for consistent results
  seededRandom.seed = 54321;
  
  return {
  algorithm: 'Scrypt',
  usdProfitability: randomBetween(0.002, 0.003),
  btcProfitability: randomBetween(6e-7, 8e-7),
  maxUsd: randomBetween(0.004, 0.006),
  maxBtc: randomBetween(1.2e-6, 1.6e-6),
  percentileUsd: randomBetween(0.0022, 0.0028),
  percentileBtc: randomBetween(6.2e-7, 7.8e-7),
  dataTimestamp: Date.now() / 1000,
  serverTimestamp: Date.now() / 1000,
  serverId: 4,
  };
};

// Generate worker status data
export const generateMockWorkerStatus = (): WorkerStatus[] => {
  // Reset seed for consistent results
  seededRandom.seed = 67890;
  
  return MINER_IPS.map((ip, index) => {
    const isConnected = seededRandom.next() > 0.1;
    const hashrate = isConnected ? randomBetween(140, 160) : 0;
    
    return {
      workerId: `worker${index + 1}`,
      minerIp: ip,
      connected: isConnected,
      hashrate,
      sharesAccepted: isConnected ? Math.floor(randomBetween(1000, 5000)) : 0,
      sharesRejected: isConnected ? Math.floor(randomBetween(10, 100)) : 0,
      lastSeen: Date.now() - (isConnected ? randomBetween(0, 300000) : randomBetween(300000, 3600000)),
      earnings: {
        daily: hashrate * 0.0025 * 24,
        weekly: hashrate * 0.0025 * 24 * 7,
        monthly: hashrate * 0.0025 * 24 * 30,
      },
    };
  });
};

// Generate alerts
export const generateMockAlerts = (): Alert[] => {
  // Reset seed for consistent results
  seededRandom.seed = 11111;
  
  const alerts: Alert[] = [];
  const miners = generateMockMinerTelemetry();
  
  miners.forEach((miner, index) => {
    // Temperature alerts
    if (miner.temperature.chip > 80) {
      alerts.push({
        id: `alert-temp-${index}`,
        severity: miner.temperature.chip > 85 ? 'critical' : 'warning',
        message: `High temperature detected on ${miner.minerIp}`,
        minerIp: miner.minerIp,
        timestamp: Date.now() - randomBetween(0, 3600000),
        acknowledged: seededRandom.next() > 0.3,
        metricValue: miner.temperature.chip,
        threshold: 80,
      });
    }
    
    // Offline alerts
    if (miner.status === 'offline') {
      alerts.push({
        id: `alert-offline-${index}`,
        severity: 'critical',
        message: `Miner ${miner.minerIp} is offline`,
        minerIp: miner.minerIp,
        timestamp: Date.now() - randomBetween(0, 1800000),
        acknowledged: false,
      });
    }
    
    // Low hashrate alerts
    if (miner.hashrate > 0 && miner.hashrate < 130) {
      alerts.push({
        id: `alert-hashrate-${index}`,
        severity: 'warning',
        message: `Low hashrate detected on ${miner.minerIp}`,
        minerIp: miner.minerIp,
        timestamp: Date.now() - randomBetween(0, 7200000),
        acknowledged: seededRandom.next() > 0.5,
        metricValue: miner.hashrate,
        threshold: 140,
      });
    }
  });
  
  return alerts.sort((a, b) => b.timestamp - a.timestamp);
};

// Generate profitability data for different coins
export const generateMockProfitabilityData = (): ProfitabilityData[] => {
  // Reset seed for consistent results
  seededRandom.seed = 22222;
  
  return [
  {
    coin: 'Litecoin (LTC)',
    algorithm: 'Scrypt',
    profitability: randomBetween(0.0024, 0.0028),
    difficulty: 26431840.83787,
    blockReward: 12.5,
    price: randomBetween(85, 95),
    volume24h: randomBetween(800000000, 1200000000),
  },
  {
    coin: 'Dogecoin (DOGE)',
    algorithm: 'Scrypt',
    profitability: randomBetween(0.0008, 0.0012),
    difficulty: 9654321.12345,
    blockReward: 10000,
    price: randomBetween(0.08, 0.12),
    volume24h: randomBetween(400000000, 600000000),
  },
  {
    coin: 'DigiByte (DGB)',
    algorithm: 'Scrypt',
    profitability: randomBetween(0.0002, 0.0004),
    difficulty: 1234567.89012,
    blockReward: 665,
    price: randomBetween(0.012, 0.018),
    volume24h: randomBetween(5000000, 15000000),
  },
  ];
};

// Generate earnings breakdown
export const generateMockEarningsBreakdown = (): EarningsBreakdown[] => {
  // Reset seed for consistent results
  seededRandom.seed = 33333;
  
  const totalHashrate = generateMockFleetMetrics().totalHashrate;
  
  return [
    {
      coin: 'Litecoin (LTC)',
      amount: randomBetween(0.8, 1.2),
      usdValue: randomBetween(70, 110),
      percentage: randomBetween(65, 75),
      hashrate: totalHashrate * randomBetween(0.65, 0.75),
    },
    {
      coin: 'Dogecoin (DOGE)',
      amount: randomBetween(800, 1200),
      usdValue: randomBetween(80, 120),
      percentage: randomBetween(20, 30),
      hashrate: totalHashrate * randomBetween(0.20, 0.30),
    },
    {
      coin: 'DigiByte (DGB)',
      amount: randomBetween(200, 400),
      usdValue: randomBetween(3, 7),
      percentage: randomBetween(3, 8),
      hashrate: totalHashrate * randomBetween(0.03, 0.08),
    },
  ];
};

// Generate performance history
export const generateMockPerformanceHistory = (hours: number = 24): PerformanceHistory[] => {
  // Reset seed for consistent results
  seededRandom.seed = 44444;
  
  const history: PerformanceHistory[] = [];
  const now = Date.now();
  const interval = (hours * 60 * 60 * 1000) / 100; // 100 data points
  
  for (let i = 0; i < 100; i++) {
    const timestamp = now - (99 - i) * interval;
    const baseHashrate = randomBetween(1600, 1800);
    const hashrate = baseHashrate * randomBetween(0.95, 1.05);
    const power = hashrate * randomBetween(22, 26);
    
    history.push({
      timestamp,
      hashrate,
      power,
      temperature: randomBetween(72, 82),
      earnings: hashrate * 0.0025,
      efficiency: power / hashrate,
    });
  }
  
  return history;
};
