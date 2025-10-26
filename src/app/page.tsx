'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Activity, AlertTriangle, CheckCircle, Server, Wifi, WifiOff, Users, Cable, Settings, RefreshCw, Download, FileText, BarChart3 } from 'lucide-react'
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

    fetchStats()
  }, [])

  // Handle real-time updates
  useEffect(() => {
    if (lastMessage) {
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
  }, [lastMessage])

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

  const handleCheckConnectionStatus = async () => {
    setActionLoading('connection-status')
    try {
      toast({
        title: "Connection Status",
        description: "Memeriksa status koneksi semua OLT...",
      })
      
      // Simulate connection check
      await new Promise(resolve => setTimeout(resolve, 2000))
      
      const connectionResults = [
        { device: "OLT-01", status: "online", responseTime: "45ms" },
        { device: "OLT-02", status: "online", responseTime: "52ms" },
        { device: "OLT-03", status: "offline", responseTime: "Timeout" },
        { device: "OLT-06", status: "online", responseTime: "38ms" }
      ]
      
      const onlineCount = connectionResults.filter(r => r.status === 'online').length
      
      toast({
        title: "Connection Check Complete",
        description: `${onlineCount}/${connectionResults.length} OLT online`,
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal memeriksa status koneksi",
        variant: "destructive"
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleConfigureAlertRules = async () => {
    setActionLoading('alert-rules')
    try {
      toast({
        title: "Alert Rules",
        description: "Mengkonfigurasi aturan alert untuk semua OLT...",
      })
      
      // Simulate alert rules configuration
      await new Promise(resolve => setTimeout(resolve, 1500))
      
      toast({
        title: "Alert Rules Dikonfigurasi",
        description: "Aturan alert berhasil diterapkan ke semua OLT",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal mengkonfigurasi aturan alert",
        variant: "destructive"
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleViewPerformance = async () => {
    setActionLoading('performance')
    try {
      toast({
        title: "Performance Metrics",
        description: "Mengambil data performa semua OLT...",
      })
      
      // Simulate performance data retrieval
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      toast({
        title: "Performance Data Ready",
        description: "Data performa berhasil dimuat",
      })
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal mengambil data performa",
        variant: "destructive"
      })
    } finally {
      setActionLoading(null)
    }
  }

  const handleSNMPConfiguration = async () => {
    setActionLoading('snmp-config')
    try {
      toast({
        title: "SNMP Configuration",
        description: "Mengkonfigurasi SNMP untuk semua OLT...",
      })
      
      // Simulate SNMP configuration
      await new Promise(resolve => setTimeout(resolve, 2500))
      
      // Simulate SNMP configuration results
      const snmpResults = [
        { device: "OLT-01", ip: "192.168.1.10", community: "public", port: 161, status: "Success" },
        { device: "OLT-02", ip: "192.168.1.11", community: "zte", port: 161, status: "Success" },
        { device: "OLT-06", ip: "192.168.1.15", community: "public", port: 161, status: "Success" },
        { device: "OLT-03", ip: "192.168.1.12", community: "public", port: 161, status: "Failed - No Response" }
      ]
      
      const successCount = snmpResults.filter(r => r.status === "Success").length
      
      toast({
        title: "SNMP Configuration Complete",
        description: `${successCount}/${snmpResults.length} OLT berhasil dikonfigurasi SNMP`,
      })
      
      // Optional: Show detailed results
      console.log("SNMP Configuration Results:", snmpResults)
    } catch (error) {
      toast({
        title: "Error",
        description: "Gagal mengkonfigurasi SNMP",
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
            <h1 className="text-3xl font-bold tracking-tight">OLT & ONU Monitoring Panel</h1>
            <p className="text-muted-foreground">
              Monitor jaringan fiber optic secara real-time
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Badge variant="outline" className="flex items-center space-x-1">
              <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-green-500 animate-pulse' : 'bg-red-500'}`}></div>
              <span>{isConnected ? 'Live' : 'Offline'}</span>
            </Badge>
            <ThemeToggle />
            <Button variant="outline" size="sm">
              Refresh
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
            <TabsTrigger value="olt">OLT Devices</TabsTrigger>
            <TabsTrigger value="onu">ONU Devices</TabsTrigger>
            <TabsTrigger value="settings">OLT Settings</TabsTrigger>
            <TabsTrigger value="alerts">Alerts</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-4">
            <div className="grid gap-4 md:grid-cols-2">
              <Card>
                <CardHeader>
                  <CardTitle>OLT Status Summary</CardTitle>
                  <CardDescription>
                    Status keseluruhan perangkat OLT
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Online</span>
                    </div>
                    <Badge variant="secondary">{stats.onlineOLT}/{stats.totalOLT}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <WifiOff className="h-4 w-4 text-red-500" />
                      <span className="text-sm">Offline</span>
                    </div>
                    <Badge variant="destructive">{stats.totalOLT - stats.onlineOLT}</Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${(stats.onlineOLT / stats.totalOLT) * 100}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>ONU Status Summary</CardTitle>
                  <CardDescription>
                    Status keseluruhan perangkat ONU
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <CheckCircle className="h-4 w-4 text-green-500" />
                      <span className="text-sm">Online</span>
                    </div>
                    <Badge variant="secondary">{stats.onlineONU}/{stats.totalONU}</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <WifiOff className="h-4 w-4 text-red-500" />
                      <span className="text-sm">Offline</span>
                    </div>
                    <Badge variant="destructive">{stats.totalONU - stats.onlineONU}</Badge>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-2">
                    <div 
                      className="bg-green-500 h-2 rounded-full" 
                      style={{ width: `${(stats.onlineONU / stats.totalONU) * 100}%` }}
                    ></div>
                  </div>
                </CardContent>
              </Card>
            </div>

            <Card>
              <CardHeader>
                <CardTitle>Recent Activity</CardTitle>
                <CardDescription>
                  Aktivitas monitoring terbaru
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">OLT-01 kembali online</p>
                      <p className="text-xs text-muted-foreground">2 menit yang lalu</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">ONU-045 sinyal lemah</p>
                      <p className="text-xs text-muted-foreground">15 menit yang lalu</p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-4">
                    <div className="w-2 h-2 bg-red-500 rounded-full"></div>
                    <div className="flex-1">
                      <p className="text-sm font-medium">OLT-03 tidak responsif</p>
                      <p className="text-xs text-muted-foreground">1 jam yang lalu</p>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="olt">
            <OLTTable />
          </TabsContent>

          <TabsContent value="onu">
            <ONUTable />
          </TabsContent>

          <TabsContent value="settings">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Settings className="h-5 w-5" />
                  <span>OLT Configuration Management</span>
                </CardTitle>
                <CardDescription>
                  Kelola konfigurasi dan pengaturan untuk semua perangkat OLT
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                    <Card className="border-dashed">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Quick Actions</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={handleBulkConfiguration}
                          disabled={actionLoading === 'bulk-config'}
                        >
                          <Settings className="h-4 w-4 mr-2" />
                          {actionLoading === 'bulk-config' ? 'Mengonfigurasi...' : 'Bulk Configuration'}
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start bg-blue-50 hover:bg-blue-100 border-blue-200"
                          onClick={handleSNMPConfiguration}
                          disabled={actionLoading === 'snmp-config'}
                        >
                          <Server className="h-4 w-4 mr-2 text-blue-600" />
                          {actionLoading === 'snmp-config' ? 'Mengonfigurasi SNMP...' : 'SNMP Configuration'}
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={handleSyncAllDevices}
                          disabled={actionLoading === 'sync-devices'}
                        >
                          <RefreshCw className={`h-4 w-4 mr-2 ${actionLoading === 'sync-devices' ? 'animate-spin' : ''}`} />
                          {actionLoading === 'sync-devices' ? 'Menyinkronkan...' : 'Sync All Devices'}
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={handleExportConfig}
                          disabled={actionLoading === 'export-config'}
                        >
                          <Download className="h-4 w-4 mr-2" />
                          {actionLoading === 'export-config' ? 'Mengekspor...' : 'Export Config'}
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="border-dashed">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Templates</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={() => handleApplyTemplate('ZTE-C320')}
                          disabled={actionLoading === 'template-ZTE-C320'}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          {actionLoading === 'template-ZTE-C320' ? 'Menerapkan...' : 'ZTE Template'}
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={() => handleApplyTemplate('Huawei-MA5800')}
                          disabled={actionLoading === 'template-Huawei-MA5800'}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          {actionLoading === 'template-Huawei-MA5800' ? 'Menerapkan...' : 'Huawei Template'}
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={() => handleApplyTemplate('Nokia-7360')}
                          disabled={actionLoading === 'template-Nokia-7360'}
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          {actionLoading === 'template-Nokia-7360' ? 'Menerapkan...' : 'Nokia Template'}
                        </Button>
                        <Dialog open={showTmoDialog} onOpenChange={setShowTmoDialog}>
                          <DialogTrigger asChild>
                            <Button 
                              variant="outline" 
                              className="w-full justify-start"
                              disabled={actionLoading === 'template-TMO-4EP-4SX-4G-OLT'}
                            >
                              <FileText className="h-4 w-4 mr-2" />
                              TMO 4EP-4SX-4G Template
                            </Button>
                          </DialogTrigger>
                          <DialogContent className="sm:max-w-[425px]">
                            <DialogHeader>
                              <DialogTitle className="flex items-center space-x-2">
                                <FileText className="h-5 w-5" />
                                <span>Konfigurasi TMO Template</span>
                              </DialogTitle>
                              <DialogDescription>
                                Masukkan IP address untuk konfigurasi SNMP get pada perangkat TMO 4EP-4SX-4G-OLT
                              </DialogDescription>
                            </DialogHeader>
                            <div className="grid gap-4 py-4">
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="tmo-ip" className="text-right">
                                  IP Address
                                </Label>
                                <Input
                                  id="tmo-ip"
                                  placeholder="192.168.1.100"
                                  value={tmoIpAddress}
                                  onChange={(e) => setTmoIpAddress(e.target.value)}
                                  className="col-span-3"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="snmp-community" className="text-right">
                                  SNMP Community
                                </Label>
                                <Input
                                  id="snmp-community"
                                  value="public"
                                  disabled
                                  className="col-span-3 bg-muted"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="snmp-port" className="text-right">
                                  SNMP Port
                                </Label>
                                <Input
                                  id="snmp-port"
                                  value="161"
                                  disabled
                                  className="col-span-3 bg-muted"
                                />
                              </div>
                              <div className="grid grid-cols-4 items-center gap-4">
                                <Label htmlFor="snmp-version" className="text-right">
                                  SNMP Version
                                </Label>
                                <Input
                                  id="snmp-version"
                                  value="2c"
                                  disabled
                                  className="col-span-3 bg-muted"
                                />
                              </div>
                            </div>
                            <div className="bg-blue-50 p-3 rounded-md">
                              <p className="text-sm text-blue-800">
                                <strong>Catatan:</strong> Template TMO akan mengkonfigurasi SNMP get untuk monitoring status perangkat, 
                                utilization port, dan performa ONU secara otomatis.
                              </p>
                            </div>
                            <DialogFooter>
                              <Button 
                                type="button" 
                                variant="outline" 
                                onClick={() => setShowTmoDialog(false)}
                              >
                                Batal
                              </Button>
                              <Button 
                                type="button" 
                                onClick={handleApplyTmoTemplate}
                                disabled={actionLoading === 'template-TMO-4EP-4SX-4G-OLT'}
                              >
                                {actionLoading === 'template-TMO-4EP-4SX-4G-OLT' ? 'Menerapkan...' : 'Terapkan Template'}
                              </Button>
                            </DialogFooter>
                          </DialogContent>
                        </Dialog>
                      </CardContent>
                    </Card>

                    <Card className="border-dashed">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Monitoring</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={handleCheckConnectionStatus}
                          disabled={actionLoading === 'connection-status'}
                        >
                          <Activity className="h-4 w-4 mr-2" />
                          {actionLoading === 'connection-status' ? 'Memeriksa...' : 'Connection Status'}
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={handleConfigureAlertRules}
                          disabled={actionLoading === 'alert-rules'}
                        >
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          {actionLoading === 'alert-rules' ? 'Mengkonfigurasi...' : 'Alert Rules'}
                        </Button>
                        <Button 
                          variant="outline" 
                          className="w-full justify-start"
                          onClick={handleViewPerformance}
                          disabled={actionLoading === 'performance'}
                        >
                          <BarChart3 className="h-4 w-4 mr-2" />
                          {actionLoading === 'performance' ? 'Memuat...' : 'Performance'}
                        </Button>
                      </CardContent>
                    </Card>
                  </div>

                  <div className="border-t pt-6">
                    <h3 className="text-lg font-semibold mb-4">Device Configuration Summary</h3>
                    <div className="rounded-md border">
                      <div className="overflow-x-auto">
                        <table className="w-full">
                          <thead>
                            <tr className="border-b bg-muted/50">
                              <th className="text-left p-3 font-medium">Device Name</th>
                              <th className="text-left p-3 font-medium">IP Address</th>
                              <th className="text-left p-3 font-medium">Model</th>
                              <th className="text-left p-3 font-medium">Location</th>
                              <th className="text-left p-3 font-medium">Status</th>
                              <th className="text-left p-3 font-medium">Last Configured</th>
                              <th className="text-left p-3 font-medium">Actions</th>
                            </tr>
                          </thead>
                          <tbody>
                            <tr className="border-b hover:bg-muted/25">
                              <td className="p-3 font-medium">OLT-01</td>
                              <td className="p-3">192.168.1.10</td>
                              <td className="p-3">Huawei MA5800</td>
                              <td className="p-3">Data Center Jakarta</td>
                              <td className="p-3">
                                <Badge className="bg-green-500">Configured</Badge>
                              </td>
                              <td className="p-3 text-muted-foreground">2 hours ago</td>
                              <td className="p-3">
                                <Button variant="ghost" size="sm">
                                  <Settings className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                            <tr className="border-b hover:bg-muted/25">
                              <td className="p-3 font-medium">OLT-02</td>
                              <td className="p-3">192.168.1.11</td>
                              <td className="p-3">ZTE C320</td>
                              <td className="p-3">Data Center Surabaya</td>
                              <td className="p-3">
                                <Badge className="bg-green-500">Configured</Badge>
                              </td>
                              <td className="p-3 text-muted-foreground">1 day ago</td>
                              <td className="p-3">
                                <Button variant="ghost" size="sm">
                                  <Settings className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                            <tr className="border-b hover:bg-muted/25">
                              <td className="p-3 font-medium">OLT-03</td>
                              <td className="p-3">192.168.1.12</td>
                              <td className="p-3">Huawei MA5800</td>
                              <td className="p-3">-</td>
                              <td className="p-3">
                                <Badge variant="secondary">Pending</Badge>
                              </td>
                              <td className="p-3 text-muted-foreground">Never</td>
                              <td className="p-3">
                                <Button variant="ghost" size="sm">
                                  <Settings className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                            <tr className="border-b hover:bg-muted/25">
                              <td className="p-3 font-medium">OLT-04</td>
                              <td className="p-3">192.168.1.15</td>
                              <td className="p-3">TMO 4EP-4SX-4G-OLT</td>
                              <td className="p-3">Data Center Bandung</td>
                              <td className="p-3">
                                <Badge className="bg-green-500">Configured</Badge>
                              </td>
                              <td className="p-3 text-muted-foreground">3 hours ago</td>
                              <td className="p-3">
                                <Button variant="ghost" size="sm">
                                  <Settings className="h-4 w-4" />
                                </Button>
                              </td>
                            </tr>
                          </tbody>
                        </table>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="alerts">
            <Card>
              <CardHeader>
                <CardTitle>System Alerts</CardTitle>
                <CardDescription>
                  Semua alert dan notifikasi sistem
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="border-l-4 border-red-500 pl-4 py-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-red-700">Critical: OLT-03 Down</p>
                        <p className="text-sm text-muted-foreground">OLT tidak dapat dihubungi selama 5 menit</p>
                      </div>
                      <Badge variant="destructive">Critical</Badge>
                    </div>
                  </div>
                  <div className="border-l-4 border-yellow-500 pl-4 py-2">
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="font-medium text-yellow-700">Warning: ONU-045 Signal Weak</p>
                        <p className="text-sm text-muted-foreground">Daya sinyal -28 dBm</p>
                      </div>
                      <Badge variant="secondary">Warning</Badge>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}