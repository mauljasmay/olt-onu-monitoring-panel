'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Switch } from '@/components/ui/switch'
import { 
  Dialog, 
  DialogContent, 
  DialogDescription, 
  DialogHeader, 
  DialogTitle, 
  DialogTrigger 
} from '@/components/ui/dialog'
import { 
  Tabs, 
  TabsContent, 
  TabsList, 
  TabsTrigger 
} from '@/components/ui/tabs'
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import { 
  Plus, 
  Settings, 
  Sync, 
  CheckCircle, 
  XCircle, 
  Clock,
  Server,
  Database,
  Activity,
  Monitor,
  AlertTriangle,
  Heart,
  Package,
  Users,
  Calendar,
  BarChart3,
  Zap,
  Target,
  Filter
} from 'lucide-react'
import { toast } from 'sonner'

interface GenieACSConfig {
  id: string
  name: string
  baseUrl: string
  username?: string
  password?: string
  timeout: number
  isActive: boolean
  description?: string
  autoSync: boolean
  syncInterval: number
  lastSync?: string
  createdAt: string
  updatedAt: string
}

interface GenieDevice {
  _id: string
  _serialNumber?: string
  _manufacturer?: string
  _productId?: string
  _lastInform?: string
  _isOnline: boolean
  _deviceType: 'olt' | 'onu' | 'unknown'
  _localDevice?: any
}

interface DeviceHealth {
  deviceId: string
  overallScore: number
  connectivityScore: number
  performanceScore: number
  stabilityScore: number
  lastCalculated: string
}

interface ParameterThreshold {
  id: string
  parameterPath: string
  deviceType: string
  condition: string
  thresholdValue: string | number
  severity: string
  enabled: boolean
  description?: string
}

export default function GenieACSConfig() {
  const [configs, setConfigs] = useState<GenieACSConfig[]>([])
  const [devices, setDevices] = useState<GenieDevice[]>([])
  const [deviceHealth, setDeviceHealth] = useState<DeviceHealth[]>([])
  const [thresholds, setThresholds] = useState<ParameterThreshold[]>([])
  const [loading, setLoading] = useState(true)
  const [syncing, setSyncing] = useState(false)
  const [showAddDialog, setShowAddDialog] = useState(false)
  const [showThresholdDialog, setShowThresholdDialog] = useState(false)
  const [selectedConfig, setSelectedConfig] = useState<string | null>(null)
  const [activeTab, setActiveTab] = useState('configs')

  // Form state
  const [formData, setFormData] = useState({
    name: '',
    baseUrl: '',
    username: '',
    password: '',
    timeout: 30000,
    description: '',
    autoSync: true,
    syncInterval: 300
  })

  // Threshold form state
  const [thresholdForm, setThresholdForm] = useState({
    parameterPath: '',
    deviceType: 'all',
    condition: 'greater_than',
    thresholdValue: '',
    severity: 'warning',
    enabled: true,
    description: ''
  })

  useEffect(() => {
    fetchConfigs()
    fetchThresholds()
    fetchDeviceHealth()
  }, [])

  useEffect(() => {
    if (selectedConfig && activeTab === 'devices') {
      fetchDevices(selectedConfig)
    }
  }, [selectedConfig, activeTab])

  const fetchConfigs = async () => {
    try {
      const response = await fetch('/api/genieacs/config')
      if (response.ok) {
        const data = await response.json()
        setConfigs(data)
        if (data.length > 0) {
          setSelectedConfig(data[0].id)
        }
      }
    } catch (error) {
      console.error('Error fetching configs:', error)
      toast.error('Failed to fetch GenieACS configurations')
    } finally {
      setLoading(false)
    }
  }

  const fetchDevices = async (configId: string) => {
    try {
      const response = await fetch(`/api/genieacs/devices?configId=${configId}`)
      if (response.ok) {
        const data = await response.json()
        setDevices(data)
      }
    } catch (error) {
      console.error('Error fetching devices:', error)
      toast.error('Failed to fetch devices from GenieACS')
    }
  }

  const fetchThresholds = async () => {
    try {
      const response = await fetch('/api/genieacs/monitoring?metric=thresholds')
      if (response.ok) {
        const data = await response.json()
        setThresholds(data)
      }
    } catch (error) {
      console.error('Error fetching thresholds:', error)
    }
  }

  const fetchDeviceHealth = async () => {
    try {
      const response = await fetch('/api/genieacs/monitoring?metric=device-health')
      if (response.ok) {
        const data = await response.json()
        setDeviceHealth(data)
      }
    } catch (error) {
      console.error('Error fetching device health:', error)
    }
  }

  const handleAddConfig = async () => {
    try {
      const response = await fetch('/api/genieacs/config', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData)
      })

      if (response.ok) {
        toast.success('GenieACS configuration added successfully')
        setShowAddDialog(false)
        setFormData({
          name: '',
          baseUrl: '',
          username: '',
          password: '',
          timeout: 30000,
          description: '',
          autoSync: true,
          syncInterval: 300
        })
        fetchConfigs()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to add configuration')
      }
    } catch (error) {
      console.error('Error adding config:', error)
      toast.error('Failed to add GenieACS configuration')
    }
  }

  const handleCreateThreshold = async () => {
    try {
      const response = await fetch('/api/genieacs/monitoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create-threshold',
          ...thresholdForm
        })
      })

      if (response.ok) {
        toast.success('Parameter threshold created successfully')
        setShowThresholdDialog(false)
        setThresholdForm({
          parameterPath: '',
          deviceType: 'all',
          condition: 'greater_than',
          thresholdValue: '',
          severity: 'warning',
          enabled: true,
          description: ''
        })
        fetchThresholds()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to create threshold')
      }
    } catch (error) {
      console.error('Error creating threshold:', error)
      toast.error('Failed to create parameter threshold')
    }
  }

  const handleSync = async (configId: string, deviceType: string = 'all') => {
    setSyncing(true)
    try {
      const response = await fetch('/api/genieacs/sync', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ configId, deviceType })
      })

      if (response.ok) {
        const result = await response.json()
        toast.success(`Synced ${result.syncedDevices} devices successfully`)
        if (selectedConfig === configId) {
          fetchDevices(configId)
        }
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to sync devices')
      }
    } catch (error) {
      console.error('Error syncing devices:', error)
      toast.error('Failed to sync devices from GenieACS')
    } finally {
      setSyncing(false)
    }
  }

  const handleStartMonitoring = async (configId: string) => {
    try {
      const response = await fetch('/api/genieacs/monitoring', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start-monitoring',
          configId,
          intervalMinutes: 5
        })
      })

      if (response.ok) {
        toast.success('Parameter monitoring started')
      } else {
        const error = await response.json()
        toast.error(error.error || 'Failed to start monitoring')
      }
    } catch (error) {
      console.error('Error starting monitoring:', error)
      toast.error('Failed to start parameter monitoring')
    }
  }

  const getDeviceHealthScore = (deviceId: string) => {
    const health = deviceHealth.find(h => h.deviceId === deviceId)
    return health?.overallScore || 0
  }

  const getHealthColor = (score: number) => {
    if (score >= 80) return 'text-green-600'
    if (score >= 60) return 'text-yellow-600'
    return 'text-red-600'
  }

  const getHealthIcon = (score: number) => {
    if (score >= 80) return <CheckCircle className="h-4 w-4 text-green-500" />
    if (score >= 60) return <AlertTriangle className="h-4 w-4 text-yellow-500" />
    return <XCircle className="h-4 w-4 text-red-500" />
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <Activity className="h-8 w-8 animate-spin" />
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">GenieACS Advanced Integration</h2>
          <p className="text-muted-foreground">
            Enterprise-grade device management with monitoring, automation, and analytics
          </p>
        </div>
        <div className="flex space-x-2">
          <Dialog open={showThresholdDialog} onOpenChange={setShowThresholdDialog}>
            <DialogTrigger asChild>
              <Button variant="outline">
                <AlertTriangle className="h-4 w-4 mr-2" />
                Add Threshold
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Create Parameter Threshold</DialogTitle>
                <DialogDescription>
                  Set up alerts for device parameter values
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="parameterPath">Parameter Path</Label>
                  <Input
                    id="parameterPath"
                    value={thresholdForm.parameterPath}
                    onChange={(e) => setThresholdForm(prev => ({ ...prev, parameterPath: e.target.value }))}
                    placeholder="e.g., InternetGatewayDevice.DeviceInfo.Temperature.Value"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="deviceType">Device Type</Label>
                    <Select value={thresholdForm.deviceType} onValueChange={(value) => setThresholdForm(prev => ({ ...prev, deviceType: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">All Devices</SelectItem>
                        <SelectItem value="olt">OLT Only</SelectItem>
                        <SelectItem value="onu">ONU Only</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div>
                    <Label htmlFor="condition">Condition</Label>
                    <Select value={thresholdForm.condition} onValueChange={(value) => setThresholdForm(prev => ({ ...prev, condition: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="greater_than">Greater Than</SelectItem>
                        <SelectItem value="less_than">Less Than</SelectItem>
                        <SelectItem value="equals">Equals</SelectItem>
                        <SelectItem value="not_equals">Not Equals</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="thresholdValue">Threshold Value</Label>
                    <Input
                      id="thresholdValue"
                      value={thresholdForm.thresholdValue}
                      onChange={(e) => setThresholdForm(prev => ({ ...prev, thresholdValue: e.target.value }))}
                      placeholder="e.g., 80"
                    />
                  </div>
                  <div>
                    <Label htmlFor="severity">Severity</Label>
                    <Select value={thresholdForm.severity} onValueChange={(value) => setThresholdForm(prev => ({ ...prev, severity: value }))}>
                      <SelectTrigger>
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="info">Info</SelectItem>
                        <SelectItem value="warning">Warning</SelectItem>
                        <SelectItem value="critical">Critical</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div>
                  <Label htmlFor="thresholdDescription">Description</Label>
                  <Textarea
                    id="thresholdDescription"
                    value={thresholdForm.description}
                    onChange={(e) => setThresholdForm(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Optional description..."
                  />
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowThresholdDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleCreateThreshold} disabled={!thresholdForm.parameterPath || !thresholdForm.thresholdValue}>
                    Create Threshold
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
          
          <Dialog open={showAddDialog} onOpenChange={setShowAddDialog}>
            <DialogTrigger asChild>
              <Button>
                <Plus className="h-4 w-4 mr-2" />
                Add Configuration
              </Button>
            </DialogTrigger>
            <DialogContent className="max-w-md">
              <DialogHeader>
                <DialogTitle>Add GenieACS Configuration</DialogTitle>
                <DialogDescription>
                  Configure connection to your GenieACS server
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4">
                <div>
                  <Label htmlFor="name">Configuration Name</Label>
                  <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="e.g., Main GenieACS Server"
                  />
                </div>
                <div>
                  <Label htmlFor="baseUrl">Base URL</Label>
                  <Input
                    id="baseUrl"
                    value={formData.baseUrl}
                    onChange={(e) => setFormData(prev => ({ ...prev, baseUrl: e.target.value }))}
                    placeholder="http://localhost:7557"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="username">Username</Label>
                    <Input
                      id="username"
                      value={formData.username}
                      onChange={(e) => setFormData(prev => ({ ...prev, username: e.target.value }))}
                      placeholder="admin"
                    />
                  </div>
                  <div>
                    <Label htmlFor="password">Password</Label>
                    <Input
                      id="password"
                      type="password"
                      value={formData.password}
                      onChange={(e) => setFormData(prev => ({ ...prev, password: e.target.value }))}
                      placeholder="password"
                    />
                  </div>
                </div>
                <div>
                  <Label htmlFor="description">Description</Label>
                  <Textarea
                    id="description"
                    value={formData.description}
                    onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                    placeholder="Optional description..."
                  />
                </div>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="autoSync"
                    checked={formData.autoSync}
                    onCheckedChange={(checked) => setFormData(prev => ({ ...prev, autoSync: checked }))}
                  />
                  <Label htmlFor="autoSync">Enable auto-sync</Label>
                </div>
                <div className="flex justify-end space-x-2">
                  <Button variant="outline" onClick={() => setShowAddDialog(false)}>
                    Cancel
                  </Button>
                  <Button onClick={handleAddConfig} disabled={!formData.name || !formData.baseUrl}>
                    Add Configuration
                  </Button>
                </div>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="configs">Configurations</TabsTrigger>
          <TabsTrigger value="devices">Devices</TabsTrigger>
          <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
          <TabsTrigger value="health">Health</TabsTrigger>
          <TabsTrigger value="automation">Automation</TabsTrigger>
          <TabsTrigger value="analytics">Analytics</TabsTrigger>
        </TabsList>

        <TabsContent value="configs" className="space-y-4">
          {configs.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Server className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No GenieACS Configurations</h3>
                <p className="text-muted-foreground text-center mb-4">
                  Add your first GenieACS configuration to start syncing devices
                </p>
                <Button onClick={() => setShowAddDialog(true)}>
                  <Plus className="h-4 w-4 mr-2" />
                  Add Configuration
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {configs.map((config) => (
                <Card key={config.id} className="relative">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-lg">{config.name}</CardTitle>
                      <Badge variant={config.isActive ? 'default' : 'secondary'}>
                        {config.isActive ? 'Active' : 'Inactive'}
                      </Badge>
                    </div>
                    <CardDescription className="text-sm">
                      {config.baseUrl}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {config.description && (
                      <p className="text-sm text-muted-foreground">{config.description}</p>
                    )}
                    
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-muted-foreground">Auto-sync:</span>
                      <Badge variant={config.autoSync ? 'default' : 'secondary'}>
                        {config.autoSync ? 'Enabled' : 'Disabled'}
                      </Badge>
                    </div>

                    {config.lastSync && (
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Last sync:</span>
                        <span className="text-xs">
                          {new Date(config.lastSync).toLocaleString()}
                        </span>
                      </div>
                    )}

                    <div className="flex space-x-2 pt-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleSync(config.id, 'all')}
                        disabled={syncing}
                      >
                        <Sync className={`h-4 w-4 mr-1 ${syncing ? 'animate-spin' : ''}`} />
                        Sync All
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => handleStartMonitoring(config.id)}
                      >
                        <Monitor className="h-4 w-4 mr-1" />
                        Monitor
                      </Button>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => {
                          setSelectedConfig(config.id)
                          setActiveTab('devices')
                        }}
                      >
                        <Database className="h-4 w-4 mr-1" />
                        View
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </TabsContent>

        <TabsContent value="devices" className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Label htmlFor="config-select">Configuration:</Label>
              <select
                id="config-select"
                value={selectedConfig || ''}
                onChange={(e) => setSelectedConfig(e.target.value)}
                className="px-3 py-2 border rounded-md"
              >
                {configs.map((config) => (
                  <option key={config.id} value={config.id}>
                    {config.name}
                  </option>
                ))}
              </select>
            </div>
            {selectedConfig && (
              <div className="flex space-x-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSync(selectedConfig, 'olt')}
                  disabled={syncing}
                >
                  <Sync className={`h-4 w-4 mr-1 ${syncing ? 'animate-spin' : ''}`} />
                  Sync OLTs
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleSync(selectedConfig, 'onu')}
                  disabled={syncing}
                >
                  <Sync className={`h-4 w-4 mr-1 ${syncing ? 'animate-spin' : ''}`} />
                  Sync ONUs
                </Button>
              </div>
            )}
          </div>

          {!selectedConfig ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Database className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">Select Configuration</h3>
                <p className="text-muted-foreground">
                  Select a GenieACS configuration to view devices
                </p>
              </CardContent>
            </Card>
          ) : devices.length === 0 ? (
            <Card>
              <CardContent className="flex flex-col items-center justify-center py-12">
                <Server className="h-12 w-12 text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">No Devices Found</h3>
                <p className="text-muted-foreground text-center mb-4">
                  No devices found in GenieACS. Try syncing devices or check your configuration.
                </p>
                <Button onClick={() => handleSync(selectedConfig, 'all')} disabled={syncing}>
                  <Sync className={`h-4 w-4 mr-1 ${syncing ? 'animate-spin' : ''}`} />
                  Sync Devices
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
              {devices.map((device) => {
                const healthScore = getDeviceHealthScore(device._id)
                return (
                  <Card key={device._id}>
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-sm font-mono">
                          {device._serialNumber || device._id}
                        </CardTitle>
                        <div className="flex items-center space-x-1">
                          {device._isOnline ? (
                            <CheckCircle className="h-4 w-4 text-green-500" />
                          ) : (
                            <XCircle className="h-4 w-4 text-red-500" />
                          )}
                          <Badge variant={device._isOnline ? 'default' : 'secondary'}>
                            {device._isOnline ? 'Online' : 'Offline'}
                          </Badge>
                        </div>
                      </div>
                      <CardDescription className="text-xs">
                        {device._manufacturer} {device._productId}
                      </CardDescription>
                    </CardHeader>
                    <CardContent className="space-y-2">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Type:</span>
                        <Badge variant="outline">
                          {device._deviceType.toUpperCase()}
                        </Badge>
                      </div>

                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">Health:</span>
                        <div className="flex items-center space-x-1">
                          {getHealthIcon(healthScore)}
                          <span className={`text-sm font-medium ${getHealthColor(healthScore)}`}>
                            {healthScore}%
                          </span>
                        </div>
                      </div>

                      {device._lastInform && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Last seen:</span>
                          <span className="text-xs">
                            {new Date(device._lastInform).toLocaleString()}
                          </span>
                        </div>
                      )}

                      {device._localDevice && (
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-muted-foreground">Synced:</span>
                          <CheckCircle className="h-4 w-4 text-green-500" />
                        </div>
                      )}

                      <div className="flex space-x-2 pt-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {/* Handle reboot */}}
                        >
                          Reboot
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {/* Handle connect */}}
                        >
                          Connect
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {/* Handle details */}}
                        >
                          Details
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>
          )}
        </TabsContent>

        <TabsContent value="monitoring" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <AlertTriangle className="h-5 w-5 mr-2" />
                  Parameter Thresholds
                </CardTitle>
                <CardDescription>
                  Configure alerts for device parameter values
                </CardDescription>
              </CardHeader>
              <CardContent>
                {thresholds.length === 0 ? (
                  <div className="text-center py-8">
                    <AlertTriangle className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No thresholds configured</p>
                    <Button 
                      size="sm" 
                      className="mt-2"
                      onClick={() => setShowThresholdDialog(true)}
                    >
                      Add First Threshold
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {thresholds.map((threshold) => (
                      <div key={threshold.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex-1">
                          <p className="text-sm font-medium">{threshold.parameterPath}</p>
                          <p className="text-xs text-muted-foreground">
                            {threshold.condition} {threshold.thresholdValue}
                          </p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Badge variant={threshold.severity === 'critical' ? 'destructive' : threshold.severity === 'warning' ? 'default' : 'secondary'}>
                            {threshold.severity}
                          </Badge>
                          <Switch
                            checked={threshold.enabled}
                            size="sm"
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Monitor className="h-5 w-5 mr-2" />
                  Monitoring Status
                </CardTitle>
                <CardDescription>
                  Real-time parameter monitoring status
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Parameter Monitoring</span>
                    <Badge variant="default">Active</Badge>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Monitoring Interval</span>
                    <span className="text-sm">5 minutes</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Devices Monitored</span>
                    <span className="text-sm">{devices.length}</span>
                  </div>
                  <div className="flex items-center justify-between">
                    <span className="text-sm">Active Thresholds</span>
                    <span className="text-sm">{thresholds.filter(t => t.enabled).length}</span>
                  </div>
                  <Button className="w-full" variant="outline">
                    <Settings className="h-4 w-4 mr-2" />
                    Configure Monitoring
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="health" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <Heart className="h-5 w-5 mr-2" />
                Device Health Overview
              </CardTitle>
              <CardDescription>
                Overall health scores and performance metrics for all devices
              </CardDescription>
            </CardHeader>
            <CardContent>
              {deviceHealth.length === 0 ? (
                <div className="text-center py-8">
                  <Heart className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No health data available</p>
                  <p className="text-xs text-muted-foreground mt-1">
                    Start monitoring to see device health scores
                  </p>
                </div>
              ) : (
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {deviceHealth.map((health) => (
                    <Card key={health.deviceId}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-2">
                          <span className="text-sm font-medium truncate">
                            {health.deviceId.substring(0, 12)}...
                          </span>
                          {getHealthIcon(health.overallScore)}
                        </div>
                        <div className="space-y-2">
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Overall</span>
                            <span className={`text-sm font-medium ${getHealthColor(health.overallScore)}`}>
                              {health.overallScore}%
                            </span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Connectivity</span>
                            <span className="text-xs">{health.connectivityScore}%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Performance</span>
                            <span className="text-xs">{health.performanceScore}%</span>
                          </div>
                          <div className="flex items-center justify-between">
                            <span className="text-xs text-muted-foreground">Stability</span>
                            <span className="text-xs">{health.stabilityScore}%</span>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="automation" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Calendar className="h-5 w-5 mr-2" />
                  Scheduled Tasks
                </CardTitle>
                <CardDescription>
                  Automate repetitive tasks with scheduling
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="text-center py-8">
                  <Calendar className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                  <p className="text-muted-foreground">No scheduled tasks</p>
                  <Button size="sm" className="mt-2">
                    Create Schedule
                  </Button>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Target className="h-5 w-5 mr-2" />
                  Bulk Operations
                </CardTitle>
                <CardDescription>
                  Execute operations on multiple devices simultaneously
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <Button size="sm" variant="outline" className="w-full justify-start">
                    <Zap className="h-4 w-4 mr-2" />
                    Bulk Reboot
                  </Button>
                  <Button size="sm" variant="outline" className="w-full justify-start">
                    <Package className="h-4 w-4 mr-2" />
                    Firmware Update
                  </Button>
                  <Button size="sm" variant="outline" className="w-full justify-start">
                    <Settings className="h-4 w-4 mr-2" />
                    Bulk Configuration
                  </Button>
                  <Button size="sm" variant="outline" className="w-full justify-start">
                    <Users className="h-4 w-4 mr-2" />
                    Device Grouping
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="analytics" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <BarChart3 className="h-5 w-5 mr-2" />
                Performance Analytics
              </CardTitle>
              <CardDescription>
                Advanced analytics and reporting for device performance
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8">
                <BarChart3 className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                <p className="text-muted-foreground">Analytics dashboard coming soon</p>
                <p className="text-xs text-muted-foreground mt-1">
                  View historical data, trends, and performance metrics
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}