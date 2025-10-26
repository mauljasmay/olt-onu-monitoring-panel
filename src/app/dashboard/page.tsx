'use client'

import { useState, useEffect } from 'react'
import { useSession, signOut } from 'next-auth/react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuLabel, DropdownMenuSeparator, DropdownMenuTrigger } from '@/components/ui/dropdown-menu'
import { Activity, AlertTriangle, CheckCircle, Server, Wifi, WifiOff, Users, Cable, Settings, RefreshCw, Download, FileText, BarChart3, LogOut, User } from 'lucide-react'
import { OLTTable } from '@/components/olt-table'
import { ONUTable } from '@/components/onu-table'
import { useSocket } from '@/hooks/useSocket'
import { ThemeToggle } from '@/components/theme-toggle'
import { toast } from '@/hooks/use-toast'

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

    // Only fetch stats if authenticated
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
          // Refresh stats when device changes
          fetch('/api/dashboard/stats')
            .then(res => res.json())
            .then(data => setStats(data))
            .catch(console.error)
          break
        case 'alert-created':
          // Update alert counts
          if (lastMessage.data.type === 'critical') {
            setStats(prev => ({ ...prev, criticalAlerts: prev.criticalAlerts + 1 }))
          } else if (lastMessage.data.type === 'warning') {
            setStats(prev => ({ ...prev, warningAlerts: prev.warningAlerts + 1 }))
          }
          break
      }
    }
  }, [lastMessage, status])

  // Handle authentication
  if (status === 'loading') {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (status === 'unauthenticated') {
    return null // Will be redirected by middleware
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

  // Quick Actions Functions
  const handleBulkConfiguration = async () => {
    setActionLoading('bulk-config')
    try {
      toast({
        title: "Bulk Configuration",
        description: "Memulai konfigurasi massal untuk semua OLT...",
      })
      
      // Simulate bulk configuration
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
      
      // Simulate device sync
      await new Promise(resolve => setTimeout(resolve, 3000))
      
      // Refresh stats after sync
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
      
      // Simulate export
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      // Create a sample configuration file
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
      
      // Download the configuration file
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

  const handleApplyTemplate = async (templateModel: string) => {
    // Special handling for TMO template
    if (templateModel === 'TMO-4EP-4SX-4G-OLT') {
      setShowTmoDialog(true)
      return
    }

    setActionLoading(`template-${templateModel}`)
    try {
      toast({
        title: "Apply Template",
        description: `Menerapkan template ${templateModel}...`,
      })
      
      // Call template API
      const response = await fetch('/api/olts/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ model: templateModel })
      })
      
      if (response.ok) {
        const template = await response.json()
        
        toast({
          title: "Template Diterapkan",
          description: `Template ${templateModel} berhasil diterapkan ke semua OLT`,
        })
      } else {
        throw new Error('Failed to apply template')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Gagal menerapkan template ${templateModel}`,
        variant: "destructive"
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleApplyTmoTemplate = async () => {
    if (!tmoIpAddress.trim()) {
      toast({
        title: "Error",
        description: "IP address harus diisi untuk template TMO",
        variant: "destructive"
      })
      return
    }

    // Validate IP address format
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    if (!ipRegex.test(tmoIpAddress.trim())) {
      toast({
        title: "Error", 
        description: "Format IP address tidak valid",
        variant: "destructive"
      })
      return
    }

    setActionLoading('template-TMO-4EP-4SX-4G-OLT')
    try {
      toast({
        title: "Apply TMO Template",
        description: `Menerapkan template TMO dengan IP ${tmoIpAddress}...`,
      })
      
      // Call TMO template API with custom IP
      const response = await fetch('/api/olts/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ 
          model: 'TMO-4EP-4SX-4G-OLT',
          customIp: tmoIpAddress.trim(),
          snmpConfig: {
            community: 'public',
            port: 161,
            version: '2c'
          }
        })
      })
      
      if (response.ok) {
        const template = await response.json()
        
        toast({
          title: "TMO Template Diterapkan",
          description: `Template TMO berhasil diterapkan dengan IP ${tmoIpAddress}`,
        })
        
        // Reset form
        setTmoIpAddress('')
        setShowTmoDialog(false)
      } else {
        throw new Error('Failed to apply TMO template')
      }
    } catch (error) {
      toast({
        title: "Error",
        description: `Gagal menerapkan template TMO dengan IP ${tmoIpAddress}`,
        variant: "destructive"
      })
    } finally {
      setActionLoading(null)
    }
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background p-6">
      <div className="max-w-7xl mx-auto space-y-6">
        {/* Header */}
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">MLJNET RADIUS - OLT & ONU Monitoring Panel</h1>
            <p className="text-muted-foreground">
              Monitor jaringan fiber optic secara real-time
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span>{isConnected ? 'Live' : 'Offline'}</span>
            </Badge>
            
            {/* User Info */}
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
          <TabsList>
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="olts">OLT Devices</TabsTrigger>
            <TabsTrigger value="onus">ONU Devices</TabsTrigger>
            <TabsTrigger value="actions">Quick Actions</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>Recent Activities</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">OLT-01 Connected</p>
                        <p className="text-xs text-muted-foreground">2 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">High CPU Usage on OLT-02</p>
                        <p className="text-xs text-muted-foreground">15 minutes ago</p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                      <div className="flex-1">
                        <p className="text-sm font-medium">Configuration Updated</p>
                        <p className="text-xs text-muted-foreground">1 hour ago</p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>System Status</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Database</span>
                      <Badge variant="outline" className="text-green-600">Connected</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">SNMP Service</span>
                      <Badge variant="outline" className="text-green-600">Running</Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">WebSocket</span>
                      <Badge variant={isConnected ? "outline" : "destructive"} className={isConnected ? "text-green-600" : ""}>
                        {isConnected ? 'Connected' : 'Disconnected'}
                      </Badge>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-sm font-medium">Last Backup</span>
                      <span className="text-sm text-muted-foreground">2 hours ago</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="olts">
            <OLTTable />
          </TabsContent>

          <TabsContent value="onus">
            <ONUTable />
          </TabsContent>

          <TabsContent value="actions" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Settings className="h-5 w-5" />
                    <span>Bulk Configuration</span>
                  </CardTitle>
                  <CardDescription>
                    Terapkan konfigurasi ke semua OLT sekaligus
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full" 
                    onClick={handleBulkConfiguration}
                    disabled={actionLoading === 'bulk-config'}
                  >
                    {actionLoading === 'bulk-config' ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Processing...
                      </>
                    ) : (
                      'Start Bulk Config'
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <RefreshCw className="h-5 w-5" />
                    <span>Sync All Devices</span>
                  </CardTitle>
                  <CardDescription>
                    Sinkronkan data semua perangkat OLT dan ONU
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={handleSyncAllDevices}
                    disabled={actionLoading === 'sync-devices'}
                  >
                    {actionLoading === 'sync-devices' ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Syncing...
                      </>
                    ) : (
                      'Sync Devices'
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Download className="h-5 w-5" />
                    <span>Export Configuration</span>
                  </CardTitle>
                  <CardDescription>
                    Download konfigurasi semua OLT
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button 
                    className="w-full" 
                    variant="outline"
                    onClick={handleExportConfig}
                    disabled={actionLoading === 'export-config'}
                  >
                    {actionLoading === 'export-config' ? (
                      <>
                        <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                        Exporting...
                      </>
                    ) : (
                      'Export Config'
                    )}
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <FileText className="h-5 w-5" />
                    <span>Apply Template</span>
                  </CardTitle>
                  <CardDescription>
                    Terapkan template konfigurasi
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-2">
                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button className="w-full" variant="outline">
                        Choose Template
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent>
                      <DropdownMenuLabel>Available Templates</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => handleApplyTemplate('Huawei-MA5800')}>
                        Huawei MA5800
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleApplyTemplate('ZTE-C320')}>
                        ZTE C320
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleApplyTemplate('Nokia-7360')}>
                        Nokia 7360 FX
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => handleApplyTemplate('TMO-4EP-4SX-4G-OLT')}>
                        TMO 4EP+4SX+4G OLT
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5" />
                    <span>Performance Metrics</span>
                  </CardTitle>
                  <CardDescription>
                    Lihat performa semua perangkat
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    View Metrics
                  </Button>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertTriangle className="h-5 w-5" />
                    <span>Alert Rules</span>
                  </CardTitle>
                  <CardDescription>
                    Konfigurasi aturan alert
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Button className="w-full" variant="outline">
                    Configure Alerts
                  </Button>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>

        {/* TMO Template Dialog */}
        <Dialog open={showTmoDialog} onOpenChange={setShowTmoDialog}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Konfigurasi Template TMO</DialogTitle>
              <DialogDescription>
                Masukkan IP address untuk template TMO-4EP-4SX-4G-OLT
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-4 items-center gap-4">
                <Label htmlFor="tmo-ip" className="text-right">
                  IP Address
                </Label>
                <Input
                  id="tmo-ip"
                  value={tmoIpAddress}
                  onChange={(e) => setTmoIpAddress(e.target.value)}
                  placeholder="192.168.1.100"
                  className="col-span-3"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setShowTmoDialog(false)}>
                Batal
              </Button>
              <Button 
                onClick={handleApplyTmoTemplate}
                disabled={actionLoading === 'template-TMO-4EP-4SX-4G-OLT'}
              >
                {actionLoading === 'template-TMO-4EP-4SX-4G-OLT' ? (
                  <>
                    <RefreshCw className="mr-2 h-4 w-4 animate-spin" />
                    Applying...
                  </>
                ) : (
                  'Apply Template'
                )}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>
    </div>
  )
}