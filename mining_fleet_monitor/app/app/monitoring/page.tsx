
'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams } from 'next/navigation';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatCard } from '@/components/ui/stat-card';
import { HashrateChart } from '@/components/charts/hashrate-chart';
import { TemperatureChart } from '@/components/charts/temperature-chart';
import { MinerStatusGrid } from '@/components/miners/miner-status-grid';
import { 
  generateMockMinerTelemetry,
  generateMockMinerDetails,
  generateMockPerformanceHistory
} from '@/lib/mock-data';
import { MinerDetails, MinerTelemetry } from '@/lib/types';
import { 
  Activity, 
  Thermometer, 
  Zap, 
  Clock,
  Cpu,
  HardDrive,
  Wifi,
  Settings,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Monitor
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

function MonitoringContent() {
  const searchParams = useSearchParams();
  const selectedMinerIp = searchParams?.get('miner');
  
  const [miners, setMiners] = useState<MinerTelemetry[]>([]);
  const [selectedMiner, setSelectedMiner] = useState<MinerDetails | null>(null);
  const [performanceHistory, setPerformanceHistory] = useState(generateMockPerformanceHistory());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadData = () => {
      const minerData = generateMockMinerTelemetry();
      setMiners(minerData);
      
      if (selectedMinerIp) {
        try {
          const details = generateMockMinerDetails(selectedMinerIp);
          setSelectedMiner(details);
        } catch (error) {
          console.error('Miner not found:', error);
        }
      }
    };

    loadData();
    
    // Real-time updates
    const interval = setInterval(loadData, 30000);
    return () => clearInterval(interval);
  }, [selectedMinerIp]);

  const handleMinerSelect = (miner: MinerTelemetry) => {
    setIsLoading(true);
    try {
      const details = generateMockMinerDetails(miner.minerIp);
      setSelectedMiner(details);
      // Update URL without page reload
      window.history.pushState({}, '', `/monitoring?miner=${miner.minerIp}`);
    } catch (error) {
      console.error('Error loading miner details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setMiners(generateMockMinerTelemetry());
      setPerformanceHistory(generateMockPerformanceHistory());
      if (selectedMiner) {
        const updated = generateMockMinerDetails(selectedMiner.minerIp);
        setSelectedMiner(updated);
      }
      setIsLoading(false);
    }, 1000);
  };

  const onlineMiners = miners.filter(m => m.status === 'online');
  const offlineMiners = miners.filter(m => m.status === 'offline');
  const errorMiners = miners.filter(m => m.status === 'error');

  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: { staggerChildren: 0.1 }
    }
  };

  const itemVariants = {
    hidden: { y: 20, opacity: 0 },
    visible: { y: 0, opacity: 1, transition: { duration: 0.5 } }
  };

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Page Header */}
      <motion.div 
        className="flex items-center justify-between"
        variants={itemVariants}
      >
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Machine Monitoring</h1>
          <p className="text-muted-foreground">
            Real-time telemetry and health monitoring for individual mining machines
          </p>
        </div>
        
        <div className="flex items-center gap-2">
          <Button 
            variant="outline" 
            onClick={handleRefresh}
            disabled={isLoading}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isLoading ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </motion.div>

      {/* Fleet Summary */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
        variants={itemVariants}
      >
        <StatCard
          title="Online Miners"
          value={onlineMiners.length}
          change={`${((onlineMiners.length / miners.length) * 100).toFixed(1)}% uptime`}
          changeType="positive"
          icon={CheckCircle}
          className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800"
        />
        
        <StatCard
          title="Offline Miners"
          value={offlineMiners.length}
          change={offlineMiners.length > 0 ? "Requires attention" : "All systems operational"}
          changeType={offlineMiners.length > 0 ? "negative" : "positive"}
          icon={XCircle}
          className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800"
        />
        
        <StatCard
          title="Error States"
          value={errorMiners.length}
          change={errorMiners.length > 0 ? "Check diagnostics" : "No errors detected"}
          changeType={errorMiners.length > 0 ? "negative" : "positive"}
          icon={AlertTriangle}
          className="border-yellow-200 bg-yellow-50 dark:bg-yellow-950 dark:border-yellow-800"
        />
        
        <StatCard
          title="Total Fleet"
          value={miners.length}
          change="Mining machines"
          changeType="neutral"
          icon={HardDrive}
        />
      </motion.div>

      {/* Main Content */}
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Fleet Overview</TabsTrigger>
            <TabsTrigger value="individual">Individual Miners</TabsTrigger>
            <TabsTrigger value="diagnostics">Diagnostics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Performance Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <HashrateChart 
                data={performanceHistory} 
                title="Fleet Hashrate Trend"
                height={300}
              />
              <TemperatureChart 
                data={performanceHistory} 
                title="Average Temperature Trend"
                height={300}
              />
            </div>

            {/* Miner Grid */}
            <div>
              <h2 className="text-xl font-semibold mb-4">All Mining Machines</h2>
              <MinerStatusGrid 
                miners={miners} 
                onMinerClick={handleMinerSelect}
              />
            </div>
          </TabsContent>

          <TabsContent value="individual" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              {/* Miner Selection */}
              <div className="space-y-4">
                <h2 className="text-xl font-semibold">Select Miner</h2>
                <div className="space-y-2 max-h-96 overflow-y-auto">
                  {miners.map((miner) => (
                    <Card 
                      key={miner.id}
                      className={`cursor-pointer transition-all hover:shadow-md ${
                        selectedMiner?.minerIp === miner.minerIp ? 'ring-2 ring-primary' : ''
                      }`}
                      onClick={() => handleMinerSelect(miner)}
                    >
                      <CardContent className="p-3">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="font-medium">{miner.minerIp}</p>
                            <p className="text-sm text-muted-foreground">
                              {miner.status === 'online' ? `${miner.hashrate.toFixed(1)} TH/s` : 'Offline'}
                            </p>
                          </div>
                          <Badge variant={
                            miner.status === 'online' ? 'default' :
                            miner.status === 'offline' ? 'destructive' : 'secondary'
                          }>
                            {miner.status}
                          </Badge>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>

              {/* Detailed Miner View */}
              <div className="lg:col-span-2">
                {selectedMiner ? (
                  <div className="space-y-6">
                    {/* Miner Header */}
                    <Card>
                      <CardHeader>
                        <div className="flex items-center justify-between">
                          <div>
                            <CardTitle className="text-xl">{selectedMiner.name}</CardTitle>
                            <p className="text-muted-foreground">
                              {selectedMiner.minerIp} • {selectedMiner.model}
                            </p>
                          </div>
                          <Badge variant={
                            selectedMiner.status === 'online' ? 'default' :
                            selectedMiner.status === 'offline' ? 'destructive' : 'secondary'
                          }>
                            {selectedMiner.status.toUpperCase()}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                          <div className="text-center">
                            <Activity className="h-6 w-6 mx-auto mb-1 text-blue-500" />
                            <p className="text-sm text-muted-foreground">Hashrate</p>
                            <p className="font-semibold">{selectedMiner.hashrate.toFixed(1)} TH/s</p>
                          </div>
                          <div className="text-center">
                            <Thermometer className="h-6 w-6 mx-auto mb-1 text-red-500" />
                            <p className="text-sm text-muted-foreground">Temperature</p>
                            <p className="font-semibold">{selectedMiner.temperature.chip}°C</p>
                          </div>
                          <div className="text-center">
                            <Zap className="h-6 w-6 mx-auto mb-1 text-yellow-500" />
                            <p className="text-sm text-muted-foreground">Power</p>
                            <p className="font-semibold">{selectedMiner.power}W</p>
                          </div>
                          <div className="text-center">
                            <Clock className="h-6 w-6 mx-auto mb-1 text-green-500" />
                            <p className="text-sm text-muted-foreground">Uptime</p>
                            <p className="font-semibold">
                              {formatDistanceToNow(new Date(Date.now() - selectedMiner.uptime * 1000))}
                            </p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>

                    {/* Detailed Metrics */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <StatCard
                        title="Efficiency"
                        value={`${selectedMiner.efficiency.toFixed(1)} W/TH`}
                        icon={Cpu}
                        description="Power consumption per TH/s"
                      />
                      <StatCard
                        title="Fan Speed"
                        value={`${selectedMiner.fanSpeed || 0} RPM`}
                        icon={RefreshCw}
                        description="Cooling system speed"
                      />
                    </div>

                    {/* Chain Status */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Hash Chains Status</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          {selectedMiner.chains.map((chain) => (
                            <div key={chain.id} className="p-3 border rounded-lg">
                              <div className="flex items-center justify-between mb-2">
                                <span className="font-medium">Chain {chain.id}</span>
                                <Badge variant={chain.status === 'healthy' ? 'default' : 'destructive'}>
                                  {chain.status}
                                </Badge>
                              </div>
                              <div className="space-y-1 text-sm">
                                <div className="flex justify-between">
                                  <span>Chips:</span>
                                  <span>{chain.chips}</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Hashrate:</span>
                                  <span>{chain.hashrate.toFixed(1)} TH/s</span>
                                </div>
                                <div className="flex justify-between">
                                  <span>Temperature:</span>
                                  <span>{chain.temperature}°C</span>
                                </div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    {/* Pool Configuration */}
                    <Card>
                      <CardHeader>
                        <CardTitle>Pool Configuration</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-2">
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Pool URL:</span>
                            <span className="font-mono text-sm">{selectedMiner.poolConfig.url}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Worker:</span>
                            <span className="font-mono text-sm">{selectedMiner.poolConfig.username}</span>
                          </div>
                          <div className="flex justify-between">
                            <span className="text-muted-foreground">Algorithm:</span>
                            <span className="font-mono text-sm">{selectedMiner.poolConfig.algorithm}</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                ) : (
                  <Card>
                    <CardContent className="flex items-center justify-center h-64">
                      <div className="text-center">
                        <Monitor className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                        <p className="text-muted-foreground">Select a miner to view detailed information</p>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="diagnostics" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle>Fleet Diagnostics</CardTitle>
                <p className="text-muted-foreground">
                  Advanced diagnostics and troubleshooting tools
                </p>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Settings className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Diagnostics tools coming soon</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Advanced chip analysis, network diagnostics, and performance optimization
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}

export default function MonitoringPage() {
  return (
    <Suspense fallback={
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Loading monitoring data...</p>
        </div>
      </div>
    }>
      <MonitoringContent />
    </Suspense>
  );
}
