'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Activity, AlertTriangle, CheckCircle, Server, Wifi, WifiOff, Users, Cable, Settings, RefreshCw, Download, FileText, BarChart3 } from 'lucide-react'
import { OLTTable } from '@/components/olt-table'
import { ONUTable } from '@/components/onu-table'
import { useSocket } from '@/hooks/useSocket'
import { ThemeToggle } from '@/components/theme-toggle'

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
                        <Button variant="outline" className="w-full justify-start">
                          <Settings className="h-4 w-4 mr-2" />
                          Bulk Configuration
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <RefreshCw className="h-4 w-4 mr-2" />
                          Sync All Devices
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <Download className="h-4 w-4 mr-2" />
                          Export Config
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="border-dashed">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Templates</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button variant="outline" className="w-full justify-start">
                          <FileText className="h-4 w-4 mr-2" />
                          ZTE Template
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <FileText className="h-4 w-4 mr-2" />
                          Huawei Template
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <FileText className="h-4 w-4 mr-2" />
                          Nokia Template
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <FileText className="h-4 w-4 mr-2" />
                          TMO 4EP-4SX-4G Template
                        </Button>
                      </CardContent>
                    </Card>

                    <Card className="border-dashed">
                      <CardHeader className="pb-3">
                        <CardTitle className="text-base">Monitoring</CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-3">
                        <Button variant="outline" className="w-full justify-start">
                          <Activity className="h-4 w-4 mr-2" />
                          Connection Status
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <AlertTriangle className="h-4 w-4 mr-2" />
                          Alert Rules
                        </Button>
                        <Button variant="outline" className="w-full justify-start">
                          <BarChart3 className="h-4 w-4 mr-2" />
                          Performance
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