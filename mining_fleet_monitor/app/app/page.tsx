
'use client';

import { useEffect, useState } from 'react';
import { StatCard } from '@/components/ui/stat-card';
import { HashrateChart } from '@/components/charts/hashrate-chart';
import { TemperatureChart } from '@/components/charts/temperature-chart';
import { AlertList } from '@/components/alerts/alert-list';
import { MinerStatusGrid } from '@/components/miners/miner-status-grid';
import { 
  generateMockFleetMetrics,
  generateMockMinerTelemetry,
  generateMockAlerts,
  generateMockPerformanceHistory
} from '@/lib/mock-data';
import { 
  Activity, 
  Zap, 
  Thermometer, 
  DollarSign,
  TrendingUp,
  Users,
  AlertTriangle,
  Gauge
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function DashboardPage() {
  const [fleetMetrics, setFleetMetrics] = useState(() => generateMockFleetMetrics());
  const [miners, setMiners] = useState(() => generateMockMinerTelemetry());
  const [alerts, setAlerts] = useState(() => generateMockAlerts());
  const [performanceHistory, setPerformanceHistory] = useState(() => generateMockPerformanceHistory());

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setFleetMetrics(generateMockFleetMetrics());
      setMiners(generateMockMinerTelemetry());
      setAlerts(generateMockAlerts());
      setPerformanceHistory(generateMockPerformanceHistory());
    }, 30000); // Update every 30 seconds

    return () => clearInterval(interval);
  }, []);

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        duration: 0.5
      }
    }
  };

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Page Header */}
      <motion.div variants={itemVariants}>
        <h1 className="text-3xl font-bold tracking-tight">Dashboard Overview</h1>
        <p className="text-muted-foreground">
          Real-time monitoring of your cryptocurrency mining fleet performance
        </p>
      </motion.div>

      {/* Key Performance Indicators */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={itemVariants}
      >
        <StatCard
          title="Total Hashrate"
          value={`${fleetMetrics.totalHashrate.toFixed(1)} TH/s`}
          change="+2.5% from last hour"
          changeType="positive"
          icon={Activity}
          description="Combined fleet mining power"
        />
        
        <StatCard
          title="Active Miners"
          value={`${fleetMetrics.onlineMiners}/${fleetMetrics.totalMiners}`}
          change={`${fleetMetrics.uptime.toFixed(1)}% uptime`}
          changeType={fleetMetrics.uptime > 95 ? "positive" : "negative"}
          icon={Users}
          description="Online mining machines"
        />
        
        <StatCard
          title="Daily Earnings"
          value={`$${fleetMetrics.estimatedDailyEarnings.toFixed(2)}`}
          change="+$12.50 from yesterday"
          changeType="positive"
          icon={DollarSign}
          description="Estimated daily revenue"
        />
        
        <StatCard
          title="Fleet Efficiency"
          value={`${fleetMetrics.averageEfficiency.toFixed(1)} W/TH`}
          change="Optimal range"
          changeType="positive"
          icon={Gauge}
          description="Power consumption per TH/s"
        />
      </motion.div>

      {/* Charts Section */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-2 gap-6"
        variants={itemVariants}
      >
        <HashrateChart 
          data={performanceHistory} 
          title="Fleet Hashrate (24h)"
          height={300}
        />
        <TemperatureChart 
          data={performanceHistory} 
          title="Average Temperature (24h)"
          height={300}
        />
      </motion.div>

      {/* Secondary Metrics */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-3 gap-4"
        variants={itemVariants}
      >
        <StatCard
          title="Total Power Draw"
          value={`${(fleetMetrics.totalPower / 1000).toFixed(1)} kW`}
          change={`${fleetMetrics.totalPower.toLocaleString()} watts`}
          changeType="neutral"
          icon={Zap}
          description="Current power consumption"
        />
        
        <StatCard
          title="Average Temperature"
          value={`${fleetMetrics.averageTemperature.toFixed(1)}°C`}
          change={fleetMetrics.averageTemperature > 80 ? "High temperature" : "Normal range"}
          changeType={fleetMetrics.averageTemperature > 80 ? "negative" : "positive"}
          icon={Thermometer}
          description="Fleet average chip temperature"
        />
        
        <StatCard
          title="Performance Trend"
          value="+5.2%"
          change="vs last 7 days"
          changeType="positive"
          icon={TrendingUp}
          description="Hashrate improvement"
        />
      </motion.div>

      {/* Alerts and Miner Status */}
      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-3 gap-6"
        variants={itemVariants}
      >
        <div className="lg:col-span-1">
          <AlertList alerts={alerts} maxItems={6} />
        </div>
        
        <div className="lg:col-span-2">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-semibold">Fleet Status</h2>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500" />
                  Online ({miners.filter(m => m.status === 'online').length})
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-red-500" />
                  Offline ({miners.filter(m => m.status === 'offline').length})
                </div>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-yellow-500" />
                  Issues ({miners.filter(m => m.status === 'error').length})
                </div>
              </div>
            </div>
            
            <MinerStatusGrid 
              miners={miners.slice(0, 8)} 
              onMinerClick={(miner) => {
                // Navigate to detailed miner view
                window.location.href = `/monitoring?miner=${miner.minerIp}`;
              }}
            />
            
            {miners.length > 8 && (
              <div className="text-center">
                <button 
                  className="text-sm text-primary hover:underline"
                  onClick={() => window.location.href = '/monitoring'}
                >
                  View all {miners.length} miners →
                </button>
              </div>
            )}
          </div>
        </div>
      </motion.div>

      {/* Quick Actions */}
      <motion.div 
        className="flex flex-wrap gap-4 pt-4 border-t"
        variants={itemVariants}
      >
        <button 
          className="px-4 py-2 bg-primary text-primary-foreground rounded-md hover:bg-primary/90 transition-colors"
          onClick={() => window.location.href = '/monitoring'}
        >
          View All Miners
        </button>
        <button 
          className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
          onClick={() => window.location.href = '/performance'}
        >
          Mining Performance
        </button>
        <button 
          className="px-4 py-2 border border-border rounded-md hover:bg-muted transition-colors"
          onClick={() => {
            // Refresh data
            setFleetMetrics(generateMockFleetMetrics());
            setMiners(generateMockMinerTelemetry());
            setAlerts(generateMockAlerts());
            setPerformanceHistory(generateMockPerformanceHistory());
          }}
        >
          Refresh Data
        </button>
      </motion.div>
    </motion.div>
  );
}
