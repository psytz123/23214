
'use client';

import { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { StatCard } from '@/components/ui/stat-card';
import { HashrateChart } from '@/components/charts/hashrate-chart';
import { EarningsChart } from '@/components/charts/earnings-chart';
import { 
  generateMockPoolStats,
  generateMockWorkerStatus,
  generateMockProfitabilityData,
  generateMockEarningsBreakdown,
  generateMockPerformanceHistory
} from '@/lib/mock-data';
import { 
  PoolStats, 
  WorkerStatus, 
  ProfitabilityData, 
  EarningsBreakdown 
} from '@/lib/types';
import { 
  DollarSign, 
  TrendingUp, 
  Users, 
  Activity,
  Coins,
  BarChart3,
  RefreshCw,
  Download,
  Settings,
  Wifi,
  WifiOff,
  Clock
} from 'lucide-react';
import { motion } from 'framer-motion';
import { formatDistanceToNow } from 'date-fns';

export default function PerformancePage() {
  const [poolStats, setPoolStats] = useState<PoolStats>(generateMockPoolStats());
  const [workers, setWorkers] = useState<WorkerStatus[]>(generateMockWorkerStatus());
  const [profitabilityData, setProfitabilityData] = useState<ProfitabilityData[]>(generateMockProfitabilityData());
  const [earningsBreakdown, setEarningsBreakdown] = useState<EarningsBreakdown[]>(generateMockEarningsBreakdown());
  const [performanceHistory, setPerformanceHistory] = useState(generateMockPerformanceHistory());
  const [isLoading, setIsLoading] = useState(false);

  useEffect(() => {
    const loadData = () => {
      setPoolStats(generateMockPoolStats());
      setWorkers(generateMockWorkerStatus());
      setProfitabilityData(generateMockProfitabilityData());
      setEarningsBreakdown(generateMockEarningsBreakdown());
      setPerformanceHistory(generateMockPerformanceHistory());
    };

    loadData();
    
    // Real-time updates every 60 seconds
    const interval = setInterval(loadData, 60000);
    return () => clearInterval(interval);
  }, []);

  const handleRefresh = () => {
    setIsLoading(true);
    setTimeout(() => {
      setPoolStats(generateMockPoolStats());
      setWorkers(generateMockWorkerStatus());
      setProfitabilityData(generateMockProfitabilityData());
      setEarningsBreakdown(generateMockEarningsBreakdown());
      setPerformanceHistory(generateMockPerformanceHistory());
      setIsLoading(false);
    }, 1000);
  };

  const connectedWorkers = workers.filter(w => w.connected);
  const totalHashrate = connectedWorkers.reduce((sum, w) => sum + w.hashrate, 0);
  const totalDailyEarnings = connectedWorkers.reduce((sum, w) => sum + w.earnings.daily, 0);
  const totalShares = connectedWorkers.reduce((sum, w) => sum + w.sharesAccepted, 0);
  const totalRejected = connectedWorkers.reduce((sum, w) => sum + w.sharesRejected, 0);
  const rejectRate = totalShares > 0 ? (totalRejected / (totalShares + totalRejected)) * 100 : 0;

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
          <h1 className="text-3xl font-bold tracking-tight">Mining Performance</h1>
          <p className="text-muted-foreground">
            Pool statistics, earnings tracking, and profitability analysis
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
            <Download className="h-4 w-4 mr-2" />
            Export
          </Button>
          <Button variant="outline">
            <Settings className="h-4 w-4 mr-2" />
            Settings
          </Button>
        </div>
      </motion.div>

      {/* Key Performance Metrics */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4"
        variants={itemVariants}
      >
        <StatCard
          title="Daily Earnings"
          value={`$${totalDailyEarnings.toFixed(2)}`}
          change="+8.5% from yesterday"
          changeType="positive"
          icon={DollarSign}
          description="Total estimated daily revenue"
        />
        
        <StatCard
          title="Pool Hashrate"
          value={`${totalHashrate.toFixed(1)} TH/s`}
          change={`${connectedWorkers.length}/${workers.length} workers`}
          changeType="positive"
          icon={Activity}
          description="Combined mining power"
        />
        
        <StatCard
          title="Scrypt Profitability"
          value={`$${poolStats.usdProfitability.toFixed(6)}`}
          change="per TH/s per day"
          changeType="neutral"
          icon={TrendingUp}
          description="Current algorithm profitability"
        />
        
        <StatCard
          title="Share Efficiency"
          value={`${(100 - rejectRate).toFixed(1)}%`}
          change={`${rejectRate.toFixed(2)}% reject rate`}
          changeType={rejectRate < 2 ? "positive" : "negative"}
          icon={BarChart3}
          description="Accepted vs rejected shares"
        />
      </motion.div>

      {/* Main Content Tabs */}
      <motion.div variants={itemVariants}>
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-4">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="workers">Workers</TabsTrigger>
            <TabsTrigger value="profitability">Profitability</TabsTrigger>
            <TabsTrigger value="earnings">Earnings</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* Pool Statistics */}
            <Card>
              <CardHeader>
                <CardTitle>Pool Performance (Prohashing.com)</CardTitle>
                <p className="text-muted-foreground">
                  Real-time PPLNS scrypt mining statistics
                </p>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Current Profitability</p>
                    <p className="text-2xl font-bold">${poolStats.usdProfitability.toFixed(6)}</p>
                    <p className="text-xs text-muted-foreground">USD per TH/s per day</p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">BTC Profitability</p>
                    <p className="text-2xl font-bold">{poolStats.btcProfitability.toExponential(2)}</p>
                    <p className="text-xs text-muted-foreground">BTC per TH/s per day</p>
                  </div>
                  
                  <div className="space-y-2">
                    <p className="text-sm text-muted-foreground">Server Status</p>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500" />
                      <span className="text-sm">Server {poolStats.serverId}</span>
                    </div>
                    <p className="text-xs text-muted-foreground">
                      Updated {formatDistanceToNow(new Date(poolStats.dataTimestamp * 1000), { addSuffix: true })}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Performance Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <HashrateChart 
                data={performanceHistory} 
                title="Hashrate Performance (24h)"
                height={300}
              />
              <EarningsChart 
                data={earningsBreakdown} 
                title="Earnings Distribution"
                height={300}
              />
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                title="Max USD Observed"
                value={`$${poolStats.maxUsd.toFixed(6)}`}
                icon={TrendingUp}
                description="Highest profitability recorded"
              />
              <StatCard
                title="Percentile USD"
                value={`$${poolStats.percentileUsd.toFixed(6)}`}
                icon={BarChart3}
                description="75th percentile profitability"
              />
              <StatCard
                title="Algorithm"
                value={poolStats.algorithm}
                icon={Coins}
                description="Mining algorithm"
              />
            </div>
          </TabsContent>

          <TabsContent value="workers" className="space-y-6">
            {/* Worker Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                title="Connected Workers"
                value={connectedWorkers.length}
                change={`${workers.length} total workers`}
                changeType="positive"
                icon={Users}
                className="border-green-200 bg-green-50 dark:bg-green-950 dark:border-green-800"
              />
              <StatCard
                title="Disconnected Workers"
                value={workers.length - connectedWorkers.length}
                change={workers.length - connectedWorkers.length > 0 ? "Requires attention" : "All connected"}
                changeType={workers.length - connectedWorkers.length > 0 ? "negative" : "positive"}
                icon={WifiOff}
                className="border-red-200 bg-red-50 dark:bg-red-950 dark:border-red-800"
              />
              <StatCard
                title="Total Shares"
                value={totalShares.toLocaleString()}
                change={`${totalRejected} rejected`}
                changeType="neutral"
                icon={Activity}
              />
            </div>

            {/* Worker List */}
            <Card>
              <CardHeader>
                <CardTitle>Worker Status</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {workers.map((worker) => (
                    <div 
                      key={worker.workerId}
                      className="flex items-center justify-between p-3 border rounded-lg"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex items-center gap-2">
                          {worker.connected ? (
                            <Wifi className="h-4 w-4 text-green-500" />
                          ) : (
                            <WifiOff className="h-4 w-4 text-red-500" />
                          )}
                          <span className="font-medium">{worker.workerId}</span>
                        </div>
                        
                        <Badge variant={worker.connected ? 'default' : 'destructive'}>
                          {worker.connected ? 'Connected' : 'Disconnected'}
                        </Badge>
                        
                        <span className="text-sm text-muted-foreground">
                          {worker.minerIp}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-6 text-sm">
                        <div className="text-right">
                          <p className="font-medium">{worker.hashrate.toFixed(1)} TH/s</p>
                          <p className="text-muted-foreground">Hashrate</p>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-medium">${worker.earnings.daily.toFixed(2)}</p>
                          <p className="text-muted-foreground">Daily</p>
                        </div>
                        
                        <div className="text-right">
                          <p className="font-medium">
                            {worker.sharesAccepted.toLocaleString()}
                          </p>
                          <p className="text-muted-foreground">Shares</p>
                        </div>
                        
                        <div className="text-right">
                          <p className="text-xs text-muted-foreground">
                            Last seen: {formatDistanceToNow(new Date(worker.lastSeen), { addSuffix: true })}
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="profitability" className="space-y-6">
            {/* Profitability Overview */}
            <Card>
              <CardHeader>
                <CardTitle>Algorithm Profitability</CardTitle>
                <p className="text-muted-foreground">
                  Real-time profitability data for different cryptocurrencies
                </p>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {profitabilityData.map((coin, index) => (
                    <div key={index} className="p-4 border rounded-lg">
                      <div className="flex items-center justify-between mb-3">
                        <div>
                          <h3 className="font-semibold">{coin.coin}</h3>
                          <p className="text-sm text-muted-foreground">{coin.algorithm}</p>
                        </div>
                        <Badge variant="outline">
                          ${coin.profitability.toFixed(6)}/TH/day
                        </Badge>
                      </div>
                      
                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-muted-foreground">Price</p>
                          <p className="font-medium">${coin.price.toFixed(4)}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Difficulty</p>
                          <p className="font-medium">{coin.difficulty.toLocaleString()}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">Block Reward</p>
                          <p className="font-medium">{coin.blockReward}</p>
                        </div>
                        <div>
                          <p className="text-muted-foreground">24h Volume</p>
                          <p className="font-medium">${(coin.volume24h / 1000000).toFixed(1)}M</p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Profitability Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Profitability Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <TrendingUp className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
                  <p className="text-muted-foreground">Profitability trend charts coming soon</p>
                  <p className="text-sm text-muted-foreground mt-2">
                    Historical profitability analysis and forecasting
                  </p>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="earnings" className="space-y-6">
            {/* Earnings Summary */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <StatCard
                title="Daily Earnings"
                value={`$${totalDailyEarnings.toFixed(2)}`}
                change="+$12.50 vs yesterday"
                changeType="positive"
                icon={DollarSign}
              />
              <StatCard
                title="Weekly Earnings"
                value={`$${(totalDailyEarnings * 7).toFixed(2)}`}
                change="Estimated"
                changeType="neutral"
                icon={TrendingUp}
              />
              <StatCard
                title="Monthly Earnings"
                value={`$${(totalDailyEarnings * 30).toFixed(2)}`}
                change="Estimated"
                changeType="neutral"
                icon={BarChart3}
              />
            </div>

            {/* Earnings Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              <EarningsChart 
                data={earningsBreakdown} 
                title="Earnings by Cryptocurrency"
                height={400}
              />
              
              <Card>
                <CardHeader>
                  <CardTitle>Detailed Breakdown</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {earningsBreakdown.map((earning, index) => (
                      <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                        <div>
                          <p className="font-medium">{earning.coin}</p>
                          <p className="text-sm text-muted-foreground">
                            {earning.amount.toFixed(4)} coins
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="font-medium">${earning.usdValue.toFixed(2)}</p>
                          <p className="text-sm text-muted-foreground">
                            {earning.percentage.toFixed(1)}%
                          </p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Payout Information */}
            <Card>
              <CardHeader>
                <CardTitle>Payout Information</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <h4 className="font-medium mb-2">Next Payout</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Estimated Date:</span>
                        <span>Tomorrow, 12:00 UTC</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Estimated Amount:</span>
                        <span>${totalDailyEarnings.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Minimum Payout:</span>
                        <span>$10.00</span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-medium mb-2">Payment Method</h4>
                    <div className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Method:</span>
                        <span>Cryptocurrency</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Fee:</span>
                        <span>Network fee only</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Frequency:</span>
                        <span>Daily</span>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </motion.div>
    </motion.div>
  );
}
