'use client'

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  BarChart3, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Users, 
  Wifi,
  Server,
  AlertTriangle
} from 'lucide-react'

interface AnalyticsData {
  label: string
  value: number
  change: number
  changeType: 'increase' | 'decrease'
  icon: React.ReactNode
  color: string
}

interface ChartData {
  name: string
  online: number
  offline: number
  warning: number
}

interface AnalyticsChartProps {
  data?: AnalyticsData[]
  chartData?: ChartData[]
  title?: string
  description?: string
}

export function AnalyticsChart({ 
  data, 
  chartData, 
  title = "Network Analytics",
  description = "Real-time network performance metrics"
}: AnalyticsChartProps) {
  // Default data if not provided
  const defaultAnalyticsData: AnalyticsData[] = data || [
    {
      label: "Active Users",
      value: 1247,
      change: 12.5,
      changeType: "increase",
      icon: <Users className="h-4 w-4" />,
      color: "text-blue-600"
    },
    {
      label: "Bandwidth Usage",
      value: 847,
      change: -3.2,
      changeType: "decrease", 
      icon: <Activity className="h-4 w-4" />,
      color: "text-green-600"
    },
    {
      label: "Connected Devices",
      value: 89,
      change: 8.1,
      changeType: "increase",
      icon: <Wifi className="h-4 w-4" />,
      color: "text-purple-600"
    },
    {
      label: "Server Load",
      value: 67,
      change: 2.4,
      changeType: "increase",
      icon: <Server className="h-4 w-4" />,
      color: "text-orange-600"
    }
  ]

  const defaultChartData: ChartData[] = chartData || [
    { name: "OLT-01", online: 45, offline: 5, warning: 2 },
    { name: "OLT-02", online: 38, offline: 8, warning: 3 },
    { name: "OLT-03", online: 52, offline: 3, warning: 1 },
    { name: "OLT-04", online: 41, offline: 7, warning: 4 },
    { name: "OLT-05", online: 48, offline: 4, warning: 2 }
  ]

  return (
    <Card className="col-span-2">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              {title}
            </CardTitle>
            <CardDescription>{description}</CardDescription>
          </div>
          <Badge variant="outline" className="text-xs">
            Live
          </Badge>
        </div>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Analytics Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {defaultAnalyticsData.map((item, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <div className={`flex items-center gap-2 ${item.color}`}>
                  {item.icon}
                  <span className="text-sm font-medium">{item.label}</span>
                </div>
                <div className={`flex items-center gap-1 text-xs ${
                  item.changeType === 'increase' ? 'text-green-600' : 'text-red-600'
                }`}>
                  {item.changeType === 'increase' ? (
                    <TrendingUp className="h-3 w-3" />
                  ) : (
                    <TrendingDown className="h-3 w-3" />
                  )}
                  {Math.abs(item.change)}%
                </div>
              </div>
              <div className="text-2xl font-bold">{item.value.toLocaleString()}</div>
              <Progress 
                value={(item.value / 1500) * 100} 
                className="h-2"
              />
            </div>
          ))}
        </div>

        {/* Bar Chart */}
        <div className="space-y-4">
          <h4 className="text-sm font-medium">Device Status Distribution</h4>
          <div className="space-y-3">
            {defaultChartData.map((item, index) => {
              const total = item.online + item.offline + item.warning
              const onlinePercent = (item.online / total) * 100
              const offlinePercent = (item.offline / total) * 100
              const warningPercent = (item.warning / total) * 100

              return (
                <div key={index} className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="font-medium">{item.name}</span>
                    <div className="flex items-center gap-4">
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                        <span>{item.online}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                        <span>{item.offline}</span>
                      </div>
                      <div className="flex items-center gap-1">
                        <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                        <span>{item.warning}</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex h-6 rounded-md overflow-hidden">
                    <div 
                      className="bg-green-500 flex items-center justify-center text-xs text-white"
                      style={{ width: `${onlinePercent}%` }}
                    >
                      {onlinePercent > 10 && `${onlinePercent.toFixed(0)}%`}
                    </div>
                    <div 
                      className="bg-red-500 flex items-center justify-center text-xs text-white"
                      style={{ width: `${offlinePercent}%` }}
                    >
                      {offlinePercent > 10 && `${offlinePercent.toFixed(0)}%`}
                    </div>
                    <div 
                      className="bg-yellow-500 flex items-center justify-center text-xs text-white"
                      style={{ width: `${warningPercent}%` }}
                    >
                      {warningPercent > 10 && `${warningPercent.toFixed(0)}%`}
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Legend */}
        <div className="flex items-center justify-center gap-6 text-xs text-muted-foreground">
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-green-500 rounded"></div>
            <span>Online</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-red-500 rounded"></div>
            <span>Offline</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-3 h-3 bg-yellow-500 rounded"></div>
            <span>Warning</span>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}