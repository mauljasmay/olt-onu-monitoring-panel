'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Zap, 
  HardDrive, 
  Cpu,
  Clock,
  Download,
  Upload,
  AlertTriangle,
  CheckCircle
} from 'lucide-react'

interface PerformanceMetric {
  id: string
  name: string
  value: number
  unit: string
  status: 'good' | 'warning' | 'critical'
  trend: 'up' | 'down' | 'stable'
  change: number
  icon: React.ReactNode
  threshold: {
    warning: number
    critical: number
  }
}

interface BandwidthData {
  timestamp: Date
  download: number
  upload: number
}

interface PerformanceMetricsProps {
  className?: string
}

export function PerformanceMetrics({ className }: PerformanceMetricsProps) {
  const [metrics, setMetrics] = useState<PerformanceMetric[]>([
    {
      id: 'cpu',
      name: 'CPU Usage',
      value: 67,
      unit: '%',
      status: 'good',
      trend: 'up',
      change: 2.4,
      icon: <Cpu className="h-4 w-4" />,
      threshold: { warning: 80, critical: 95 }
    },
    {
      id: 'memory',
      name: 'Memory Usage',
      value: 847,
      unit: 'MB',
      status: 'warning',
      trend: 'up',
      change: 5.2,
      icon: <HardDrive className="h-4 w-4" />,
      threshold: { warning: 1024, critical: 1536 }
    },
    {
      id: 'response-time',
      name: 'Response Time',
      value: 45,
      unit: 'ms',
      status: 'good',
      trend: 'down',
      change: -8.1,
      icon: <Clock className="h-4 w-4" />,
      threshold: { warning: 100, critical: 200 }
    },
    {
      id: 'throughput',
      name: 'Throughput',
      value: 847,
      unit: 'Mbps',
      status: 'good',
      trend: 'up',
      change: 12.5,
      icon: <Activity className="h-4 w-4" />,
      threshold: { warning: 500, critical: 200 }
    }
  ])

  const [bandwidthData, setBandwidthData] = useState<BandwidthData[]>([
    { timestamp: new Date(Date.now() - 6 * 60 * 1000), download: 650, upload: 320 },
    { timestamp: new Date(Date.now() - 5 * 60 * 1000), download: 720, upload: 380 },
    { timestamp: new Date(Date.now() - 4 * 60 * 1000), download: 680, upload: 350 },
    { timestamp: new Date(Date.now() - 3 * 60 * 1000), download: 890, upload: 420 },
    { timestamp: new Date(Date.now() - 2 * 60 * 1000), download: 920, upload: 450 },
    { timestamp: new Date(Date.now() - 1 * 60 * 1000), download: 847, upload: 410 },
    { timestamp: new Date(), download: 780, upload: 390 }
  ])

  const [selectedTimeRange, setSelectedTimeRange] = useState<'1h' | '6h' | '24h' | '7d'>('1h')

  // Simulate real-time updates
  useEffect(() => {
    const interval = setInterval(() => {
      setMetrics(prev => prev.map(metric => {
        const change = (Math.random() - 0.5) * 10
        const newValue = Math.max(0, metric.value + change)
        
        // Determine status based on thresholds
        let status: 'good' | 'warning' | 'critical' = 'good'
        if (newValue >= metric.threshold.critical) {
          status = 'critical'
        } else if (newValue >= metric.threshold.warning) {
          status = 'warning'
        }
        
        // Determine trend
        let trend: 'up' | 'down' | 'stable' = 'stable'
        if (Math.abs(change) > 2) {
          trend = change > 0 ? 'up' : 'down'
        }
        
        return {
          ...metric,
          value: newValue,
          status,
          trend,
          change: change
        }
      }))

      // Update bandwidth data
      setBandwidthData(prev => {
        const newData = [...prev.slice(1), {
          timestamp: new Date(),
          download: Math.floor(Math.random() * 400) + 600,
          upload: Math.floor(Math.random() * 200) + 300
        }]
        return newData
      })
    }, 3000)

    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'text-green-600'
      case 'warning':
        return 'text-yellow-600'
      case 'critical':
        return 'text-red-600'
      default:
        return 'text-gray-600'
    }
  }

  const getStatusBgColor = (status: string) => {
    switch (status) {
      case 'good':
        return 'bg-green-100'
      case 'warning':
        return 'bg-yellow-100'
      case 'critical':
        return 'bg-red-100'
      default:
        return 'bg-gray-100'
    }
  }

  const getTrendIcon = (trend: string) => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3" />
      case 'down':
        return <TrendingDown className="h-3 w-3" />
      default:
        return <Activity className="h-3 w-3" />
    }
  }

  const getProgressColor = (value: number, threshold: { warning: number; critical: number }) => {
    if (value >= threshold.critical) return 'bg-red-500'
    if (value >= threshold.warning) return 'bg-yellow-500'
    return 'bg-green-500'
  }

  const formatValue = (value: number, unit: string) => {
    if (unit === 'MB') {
      return value >= 1024 ? `${(value / 1024).toFixed(1)} GB` : `${value} MB`
    }
    return `${value.toFixed(1)} ${unit}`
  }

  const maxBandwidth = Math.max(...bandwidthData.map(d => Math.max(d.download, d.upload)))

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Performance Metrics</h3>
          <p className="text-sm text-muted-foreground">Real-time system performance monitoring</p>
        </div>
        <div className="flex items-center gap-2">
          {['1h', '6h', '24h', '7d'].map((range) => (
            <Button
              key={range}
              variant={selectedTimeRange === range ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeRange(range as any)}
            >
              {range}
            </Button>
          ))}
        </div>
      </div>

      {/* Performance Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric) => (
          <Card key={metric.id} className="relative">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">{metric.name}</CardTitle>
              <div className="flex items-center gap-1">
                {metric.icon}
                <Badge 
                  variant="secondary" 
                  className={`${getStatusBgColor(metric.status)} ${getStatusColor(metric.status)} border-0`}
                >
                  {metric.status}
                </Badge>
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                {formatValue(metric.value, metric.unit)}
              </div>
              <div className="flex items-center justify-between text-xs text-muted-foreground mt-2">
                <div className={`flex items-center gap-1 ${
                  metric.trend === 'up' ? 'text-green-600' : 
                  metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                }`}>
                  {getTrendIcon(metric.trend)}
                  {Math.abs(metric.change).toFixed(1)}%
                </div>
                <span>
                  {metric.threshold.warning}{metric.unit} / {metric.threshold.critical}{metric.unit}
                </span>
              </div>
              <Progress 
                value={(metric.value / metric.threshold.critical) * 100} 
                className="mt-2 h-2"
              />
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Bandwidth Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Bandwidth Usage
          </CardTitle>
          <CardDescription>Network bandwidth utilization over time</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Bandwidth Bars */}
            <div className="space-y-2">
              {bandwidthData.map((data, index) => (
                <div key={index} className="flex items-center gap-4">
                  <div className="text-xs text-muted-foreground w-12">
                    {data.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                  </div>
                  <div className="flex-1 flex items-center gap-2">
                    <div className="flex items-center gap-1 text-xs text-blue-600 w-12">
                      <Download className="h-3 w-3" />
                      {data.download}
                    </div>
                    <div className="flex-1 bg-gray-100 rounded-full h-4 relative overflow-hidden">
                      <div 
                        className="absolute left-0 top-0 h-full bg-blue-500 rounded-full"
                        style={{ width: `${(data.download / maxBandwidth) * 100}%` }}
                      ></div>
                    </div>
                    <div className="flex items-center gap-1 text-xs text-green-600 w-12">
                      <Upload className="h-3 w-3" />
                      {data.upload}
                    </div>
                    <div className="flex-1 bg-gray-100 rounded-full h-4 relative overflow-hidden">
                      <div 
                        className="absolute left-0 top-0 h-full bg-green-500 rounded-full"
                        style={{ width: `${(data.upload / maxBandwidth) * 100}%` }}
                      ></div>
                    </div>
                  </div>
                </div>
              ))}
            </div>

            {/* Legend */}
            <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-blue-500 rounded"></div>
                <span>Download</span>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-3 h-3 bg-green-500 rounded"></div>
                <span>Upload</span>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* System Health */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <CheckCircle className="h-5 w-5" />
            System Health
          </CardTitle>
          <CardDescription>Overall system health indicators</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-2">
            <div className="space-y-3">
              <h4 className="text-sm font-medium">Resource Utilization</h4>
              <div className="space-y-2">
                {metrics.slice(0, 2).map((metric) => (
                  <div key={metric.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {metric.icon}
                      <span className="text-sm">{metric.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 bg-gray-100 rounded-full h-2">
                        <div 
                          className={`h-2 rounded-full ${getProgressColor(metric.value, metric.threshold)}`}
                          style={{ width: `${Math.min((metric.value / metric.threshold.critical) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-sm font-medium w-12 text-right">
                        {formatValue(metric.value, metric.unit)}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <div className="space-y-3">
              <h4 className="text-sm font-medium">Performance Indicators</h4>
              <div className="space-y-2">
                {metrics.slice(2, 4).map((metric) => (
                  <div key={metric.id} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      {metric.icon}
                      <span className="text-sm">{metric.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge 
                        variant="outline" 
                        className={`${getStatusColor(metric.status)} border-current`}
                      >
                        {formatValue(metric.value, metric.unit)}
                      </Badge>
                      <div className={`flex items-center gap-1 text-xs ${
                        metric.trend === 'up' ? 'text-green-600' : 
                        metric.trend === 'down' ? 'text-red-600' : 'text-gray-600'
                      }`}>
                        {getTrendIcon(metric.trend)}
                        {Math.abs(metric.change).toFixed(1)}%
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Overall Health Score */}
          <div className="mt-6 pt-4 border-t">
            <div className="flex items-center justify-between">
              <div>
                <h4 className="text-sm font-medium">Overall Health Score</h4>
                <p className="text-xs text-muted-foreground">Based on all performance metrics</p>
              </div>
              <div className="flex items-center gap-3">
                <div className="text-2xl font-bold text-green-600">
                  {Math.round(metrics.reduce((acc, m) => {
                    let score = 100
                    if (m.status === 'warning') score = 75
                    if (m.status === 'critical') score = 50
                    return acc + score
                  }, 0) / metrics.length)}%
                </div>
                <Badge variant="outline" className="bg-green-100 text-green-800 border-green-200">
                  Healthy
                </Badge>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}