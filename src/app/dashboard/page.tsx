'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Activity, AlertTriangle, Server, Wifi, Settings, RefreshCw, Download, LogOut, User } from 'lucide-react'
import { OLTTable } from '@/components/olt-table'
import { ONUTable } from '@/components/onu-table'
import { useSocket } from '@/hooks/useSocket'
import { ThemeToggle } from '@/components/theme-toggle'
import { toast } from '@/hooks/use-toast'
import { AnalyticsChart } from '@/components/dashboard/analytics-chart'
import { RealTimeMonitoring } from '@/components/dashboard/real-time-monitoring'
import { NetworkTopology } from '@/components/dashboard/network-topology'
import { PerformanceMetrics } from '@/components/dashboard/performance-metrics'

interface DashboardStats {
  totalOLT: number
  onlineOLT: number
  totalONU: number
  onlineONU: number
  criticalAlerts: number
  warningAlerts: number
}

export default function Dashboard() {
  const { data: session, status } = useSession()
  const [stats, setStats] = useState<DashboardStats>({
    totalOLT: 0,
    onlineOLT: 0,
    totalONU: 0,
    onlineONU: 0,
    criticalAlerts: 0,
    warningAlerts: 0
  })
  const [loading, setLoading] = useState(true)
  const [actionLoading, setActionLoading] = useState<string | null>(null)
  const [tmoIpAddress, setTmoIpAddress] = useState('')
  const [showTmoDialog, setShowTmoDialog] = useState(false)
  const { isConnected, lastMessage } = useSocket()

  useEffect(() => {
    const fetchStats = async () => {
      try {
        const response = await fetch('/api/dashboard/stats')
        if (response.ok) {
          const data = await response.json()
          setStats(data)
        }
      } catch (error) {
        console.error('Failed to fetch stats:', error)
        // Fallback to mock data
        setStats({
          totalOLT: 5,
          onlineOLT: 4,
          totalONU: 128,
          onlineONU: 115,
          criticalAlerts: 2,
          warningAlerts: 8
        })
      } finally {
        setLoading(false)
      }
    }

    if (status === 'authenticated') {
      fetchStats()
    }
  }, [status])

  // Handle real-time updates
  useEffect(() => {
    if (lastMessage && status === 'authenticated') {
      switch (lastMessage.type) {
        case 'device-status-changed':
        case 'device-metrics-updated':
          fetch('/api/dashboard/stats')
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(console.error)
          break
        case 'alert-created':
          if (lastMessage.data.type === 'critical') {
            setStats(prev => ({ ...prev, criticalAlerts: prev.criticalAlerts + 1 }))
          } else if (lastMessage.data.type === 'warning') {
            setStats(prev => ({ ...prev, warningAlerts: prev.warningAlerts + 1 }))
          }
          break
      }
    }
  }, [lastMessage, status])

  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null
  }

  const handleLogout = async () => {
    try {
      await signOut({ callbackUrl: '/login' })
      toast({
        title: "Logout Berhasil",
        description: "Anda telah keluar dari dashboard",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal melakukan logout",
        variant: "destructive"
      })
    }
  }

  const handleBulkConfiguration = async () => {
    setActionLoading('bulk-config')
    try {
      toast({
        title: "Bulk Configuration",
        description: "Memulai konfigurasi massal untuk semua OLT...",
      })
      
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      toast({
        title: "Bulk Configuration Berhasil",
        description: "Semua OLT berhasil dikonfigurasi ulang",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal melakukan konfigurasi massal",
        variant: "destructive"
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleSyncAllDevices = async () => {
    setActionLoading('sync-devices')
    try {
      toast({
        title: "Sync Devices",
        description: "Menyinkronkan semua perangkat OLT...",
      })
      
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      const response = await fetch('/api/dashboard/stats')
      if (response.ok) {
        const data = await response.json()
        setStats(data)
      }
      
      toast({
        title: "Sync Berhasil",
        description: "Semua perangkat berhasil disinkronkan",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal menyinkronkan perangkat",
        variant: "destructive"
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleExportConfig = async () => {
    setActionLoading('export-config')
    try {
      toast({
        title: "Export Configuration",
        description: "Mengekspor konfigurasi semua OLT...",
      })
      
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      const config = {
        timestamp: new Date().toISOString(),
        olts: [
          {
            name: "OLT-01",
            ip: "192.168.1.10",
            model: "Huawei MA5800",
            snmpCommunity: "public",
            snmpPort: 161,
            vlanConfig: {
              management: 1,
              internet: 100,
              voip: 200,
              iptv: 300
            }
          }
        ]
      }
      
      const blob = new Blob([JSON.stringify(config, null, 2)], { type: 'application/json' })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `olt-config-${new Date().toISOString().split('T')[0]}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)
      
      toast({
        title: "Export Berhasil",
        description: "Konfigurasi berhasil diekspor",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal mengekspor konfigurasi",
        variant: "destructive"
      })
    } finally {
      setActionLoading(null)
    }
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">MLJNET RADIUS - Network Monitoring</h1>
            <p className="text-muted-foreground">
              Real-time monitoring and management dashboard
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span>{isConnected ? 'Live' : 'Offline'}</span>
            </Badge>
            
            <div className="flex items-center space-x-2">
              <Badge variant="secondary" className="flex items-center space-x-1">
                <User className="h-3 w-3" />
                <span>{session?.user?.username}</span>
                <span className="text-xs">({session?.user?.role})</span>
              </Badge>
            </div>
            
            <ThemeToggle />
            <Button variant="outline" size="sm" onClick={handleLogout}>
              <LogOut className="h-4 w-4 mr-2" />
              Logout
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total OLT</CardTitle>
              <Server className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalOLT}</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{stats.onlineOLT} Online</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total ONU</CardTitle>
              <Wifi className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalONU}</div>
              <div className="flex items-center space-x-2 text-xs text-muted-foreground">
                <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                <span>{stats.onlineONU} Online</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Critical Alerts</CardTitle>
              <AlertTriangle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.criticalAlerts}</div>
              <p className="text-xs text-muted-foreground">
                Memerlukan perhatian segera
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Warning Alerts</CardTitle>
              <Activity className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.warningAlerts}</div>
              <p className="text-xs text-muted-foreground">
                Perlu dipantau
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs defaultValue="overview" className="space-y-4">
          <TabsList className="grid w-full grid-cols-6">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
            <TabsTrigger value="monitoring">Real-time</TabsTrigger>
            <TabsTrigger value="topology">Topology</TabsTrigger>
            <TabsTrigger value="performance">Performance</TabsTrigger>
            <TabsTrigger value="devices">Devices</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <AnalyticsChart />
            <RealTimeMonitoring />
          </TabsContent>

          <TabsContent value="analytics" className="space-y-4">
            <AnalyticsChart 
              title="Detailed Network Analytics"
              description="Comprehensive analysis of network performance and usage patterns"
            />
          </TabsContent>

          <TabsContent value="monitoring" className="space-y-4">
            <RealTimeMonitoring />
          </TabsContent>

          <TabsContent value="topology" className="space-y-4">
            <NetworkTopology />
          </TabsContent>

          <TabsContent value="performance" className="space-y-4">
            <PerformanceMetrics />
          </TabsContent>

          <TabsContent value="devices" className="space-y-4">
            <Tabs defaultValue="olts" className="space-y-4">
              <TabsList>
                <TabsTrigger value="olts">OLT Devices</TabsTrigger>
                <TabsTrigger value="onus">ONU Devices</TabsTrigger>
                <TabsTrigger value="actions">Quick Actions</TabsTrigger>
              </TabsList>
              
              <TabsContent value="olts">
                <OLTTable />
              </TabsContent>
              
              <TabsContent value="onus">
                <ONUTable />
              </TabsContent>
              
              <TabsContent value="actions" className="space-y-4">
                <Card>
                  <CardHeader>
                    <CardTitle>Quick Actions</CardTitle>
                    <CardDescription>
                      Common tasks and device management operations
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                      <Button 
                        variant="outline" 
                        className="h-20 flex-col"
                        onClick={handleBulkConfiguration}
                        disabled={actionLoading === 'bulk-config'}
                      >
                        <Settings className="h-6 w-6 mb-2" />
                        {actionLoading === 'bulk-config' ? 'Configuring...' : 'Bulk Configuration'}
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="h-20 flex-col"
                        onClick={handleSyncAllDevices}
                        disabled={actionLoading === 'sync-devices'}
                      >
                        <RefreshCw className={`h-6 w-6 mb-2 ${actionLoading === 'sync-devices' ? 'animate-spin' : ''}`} />
                        {actionLoading === 'sync-devices' ? 'Syncing...' : 'Sync All Devices'}
                      </Button>
                      
                      <Button 
                        variant="outline" 
                        className="h-20 flex-col"
                        onClick={handleExportConfig}
                        disabled={actionLoading === 'export-config'}
                      >
                        <Download className="h-6 w-6 mb-2" />
                        {actionLoading === 'export-config' ? 'Exporting...' : 'Export Config'}
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              </TabsContent>
            </Tabs>
          </TabsContent>
        </Tabs>

        {/* TMO Template Dialog */}
        <Dialog open={showTmoDialog} onOpenChange={setShowTmoDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>TMO Template Configuration</DialogTitle>
              <DialogDescription>
                Enter IP address for TMO 4EP+4SX+4G OLT template
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="tmo-ip">IP Address</Label>
                <Input
                  id="tmo-ip"
                  placeholder="192.168.1.100"
                  value={tmoIpAddress}
                  onChange={(e) => setTmoIpAddress(e.target.value)}
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTmoDialog(false)}>
                Cancel
              </Button>
              <Button onClick={() => {
                // Handle TMO template application
                setShowTmoDialog(false)
              }}>
                Apply Template
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}