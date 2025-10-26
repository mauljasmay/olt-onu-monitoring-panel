'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { Button } from '@/components/ui/button'
import { 
  Activity, 
  Wifi, 
  WifiOff, 
  AlertTriangle, 
  CheckCircle, 
  Clock,
  Zap,
  Server,
  RefreshCw,
  Bell
} from 'lucide-react'
import { useSocket } from '@/hooks/useSocket'

interface DeviceStatus {
  id: string
  name: string
  type: 'OLT' | 'ONU'
  status: 'online' | 'offline' | 'warning'
  signal?: number
  uptime: number
  lastSeen: Date
  responseTime: number
}

interface AlertItem {
  id: string
  type: 'critical' | 'warning' | 'info'
  message: string
  device: string
  timestamp: Date
  acknowledged: boolean
}

interface RealTimeMonitoringProps {
  className?: string
}

export function RealTimeMonitoring({ className }: RealTimeMonitoringProps) {
  const { isConnected, lastMessage } = useSocket()
  const [devices, setDevices] = useState<DeviceStatus[]>([
    {
      id: '1',
      name: 'OLT-01',
      type: 'OLT',
      status: 'online',
      uptime: 99.8,
      lastSeen: new Date(),
      responseTime: 45
    },
    {
      id: '2',
      name: 'OLT-02',
      type: 'OLT',
      status: 'online',
      uptime: 98.5,
      lastSeen: new Date(),
      responseTime: 52
    },
    {
      id: '3',
      name: 'OLT-03',
      type: 'OLT',
      status: 'warning',
      uptime: 95.2,
      lastSeen: new Date(Date.now() - 5 * 60 * 1000),
      responseTime: 120
    },
    {
      id: '4',
      name: 'ONU-045',
      type: 'ONU',
      status: 'online',
      signal: -18.5,
      uptime: 99.9,
      lastSeen: new Date(),
      responseTime: 38
    },
    {
      id: '5',
      name: 'ONU-046',
      type: 'ONU',
      status: 'offline',
      signal: -28.5,
      uptime: 0,
      lastSeen: new Date(Date.now() - 15 * 60 * 1000),
      responseTime: 9999
    }
  ])

  const [alerts, setAlerts] = useState<AlertItem[]>([
    {
      id: '1',
      type: 'critical',
      message: 'Device ONU-046 is offline',
      device: 'ONU-046',
      timestamp: new Date(Date.now() - 2 * 60 * 1000),
      acknowledged: false
    },
    {
      id: '2',
      type: 'warning',
      message: 'High response time on OLT-03',
      device: 'OLT-03',
      timestamp: new Date(Date.now() - 5 * 60 * 1000),
      acknowledged: false
    },
    {
      id: '3',
      type: 'info',
      message: 'Scheduled maintenance completed',
      device: 'OLT-01',
      timestamp: new Date(Date.now() - 10 * 60 * 1000),
      acknowledged: true
    }
  ])

  const [isRefreshing, setIsRefreshing] = useState(false)

  // Simulate real-time updates
  useEffect(() => {
    if (!isConnected) return

    const interval = setInterval(() => {
      // Update device statuses randomly
      setDevices(prev => prev.map(device => {
        const random = Math.random()
        if (random > 0.95) {
          // Random status change
          const statuses: Array<'online' | 'offline' | 'warning'> = ['online', 'offline', 'warning']
          const newStatus = statuses[Math.floor(Math.random() * statuses.length)]
          
          if (newStatus !== device.status) {
            // Add alert for status change
            const alertType = newStatus === 'offline' ? 'critical' : newStatus === 'warning' ? 'warning' : 'info'
            const newAlert: AlertItem = {
              id: Date.now().toString(),
              type: alertType,
              message: `Device ${device.name} status changed to ${newStatus}`,
              device: device.name,
              timestamp: new Date(),
              acknowledged: false
            }
            setAlerts(prev => [newAlert, ...prev].slice(0, 10))
          }
          
          return {
            ...device,
            status: newStatus,
            lastSeen: new Date(),
            responseTime: Math.floor(Math.random() * 100) + 20
          }
        }
        
        // Update response time
        return {
          ...device,
          responseTime: Math.floor(Math.random() * 100) + 20,
          lastSeen: new Date()
        }
      }))
    }, 5000)

    return () => clearInterval(interval)
  }, [isConnected])

  const handleRefresh = async () => {
    setIsRefreshing(true)
    try {
      // Simulate refresh
      await new Promise(resolve => setTimeout(resolve, 1000))
    } finally {
      setIsRefreshing(false)
    }
  }

  const handleAcknowledgeAlert = (alertId: string) => {
    setAlerts(prev => prev.map(alert => 
      alert.id === alertId ? { ...alert, acknowledged: true } : alert
    ))
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'offline':
        return <WifiOff className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getAlertIcon = (type: string) => {
    switch (type) {
      case 'critical':
        return <AlertTriangle className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'info':
        return <Bell className="h-4 w-4 text-blue-500" />
      default:
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'bg-green-500'
      case 'offline':
        return 'bg-red-500'
      case 'warning':
        return 'bg-yellow-500'
      default:
        return 'bg-gray-500'
    }
  }

  const formatUptime = (uptime: number) => {
    return `${uptime.toFixed(1)}%`
  }

  const formatResponseTime = (time: number) => {
    return time > 9999 ? 'Timeout' : `${time}ms`
  }

  const formatTimeAgo = (date: Date) => {
    const seconds = Math.floor((new Date().getTime() - date.getTime()) / 1000)
    if (seconds < 60) return 'just now'
    if (seconds < 3600) return `${Math.floor(seconds / 60)}m ago`
    return `${Math.floor(seconds / 3600)}h ago`
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-semibold">Real-time Monitoring</h3>
          <p className="text-sm text-muted-foreground">Live device status and alerts</p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
            {isConnected ? 'Connected' : 'Disconnected'}
          </Badge>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={handleRefresh}
            disabled={isRefreshing}
          >
            <RefreshCw className={`h-4 w-4 mr-2 ${isRefreshing ? 'animate-spin' : ''}`} />
            Refresh
          </Button>
        </div>
      </div>

      <div className="grid gap-6 lg:grid-cols-2">
        {/* Device Status */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Server className="h-5 w-5" />
              Device Status
            </CardTitle>
            <CardDescription>Current status of all devices</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4 max-h-96 overflow-y-auto">
              {devices.map((device) => (
                <div key={device.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex items-center gap-3">
                    {getStatusIcon(device.status)}
                    <div>
                      <div className="font-medium">{device.name}</div>
                      <div className="text-sm text-muted-foreground">
                        {device.type} • {formatTimeAgo(device.lastSeen)}
                      </div>
                    </div>
                  </div>
                  <div className="text-right">
                    <div className="flex items-center gap-2 text-sm">
                      <Zap className="h-3 w-3" />
                      {formatResponseTime(device.responseTime)}
                    </div>
                    <div className="text-xs text-muted-foreground">
                      Uptime: {formatUptime(device.uptime)}
                    </div>
                    {device.signal !== undefined && (
                      <div className="text-xs text-muted-foreground">
                        Signal: {device.signal} dBm
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Recent Alerts */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Bell className="h-5 w-5" />
              Recent Alerts
            </CardTitle>
            <CardDescription>Latest system alerts and notifications</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {alerts.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <CheckCircle className="h-8 w-8 mx-auto mb-2" />
                  <p>No active alerts</p>
                </div>
              ) : (
                alerts.map((alert) => (
                  <div 
                    key={alert.id} 
                    className={`flex items-start gap-3 p-3 border rounded-lg ${
                      alert.acknowledged ? 'opacity-60' : ''
                    }`}
                  >
                    {getAlertIcon(alert.type)}
                    <div className="flex-1 min-w-0">
                      <div className="font-medium text-sm">{alert.message}</div>
                      <div className="text-xs text-muted-foreground">
                        {alert.device} • {formatTimeAgo(alert.timestamp)}
                      </div>
                    </div>
                    {!alert.acknowledged && (
                      <Button 
                        variant="outline" 
                        size="sm"
                        onClick={() => handleAcknowledgeAlert(alert.id)}
                      >
                        Ack
                      </Button>
                    )}
                  </div>
                ))
              )}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Network Overview */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            Network Overview
          </CardTitle>
          <CardDescription>Overall network performance metrics</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Online Devices</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span className="text-sm">{devices.filter(d => d.status === 'online').length}</span>
                </div>
              </div>
              <Progress value={(devices.filter(d => d.status === 'online').length / devices.length) * 100} />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Offline Devices</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                  <span className="text-sm">{devices.filter(d => d.status === 'offline').length}</span>
                </div>
              </div>
              <Progress value={(devices.filter(d => d.status === 'offline').length / devices.length) * 100} className="bg-red-100" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Warning Devices</span>
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span className="text-sm">{devices.filter(d => d.status === 'warning').length}</span>
                </div>
              </div>
              <Progress value={(devices.filter(d => d.status === 'warning').length / devices.length) * 100} className="bg-yellow-100" />
            </div>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Avg Response</span>
                <span className="text-sm">
                  {Math.round(devices.reduce((acc, d) => acc + d.responseTime, 0) / devices.length)}ms
                </span>
              </div>
              <Progress value={75} className="bg-blue-100" />
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}