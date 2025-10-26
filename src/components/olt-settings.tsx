'use client'

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Separator } from '@/components/ui/separator'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { Settings, Save, X, Zap, Copy, RefreshCw, AlertTriangle, CheckCircle } from 'lucide-react'
import { toast } from '@/hooks/use-toast'

interface OLTSettings {
  id: string
  name: string
  ipAddress: string
  model: string
  location?: string
  description?: string
  snmpCommunity: string
  snmpPort: number
  telnetPort: number
  sshPort: number
  webPort: number
  monitoringInterval: number
  alertThresholds: {
    cpuWarning: number
    cpuCritical: number
    memoryWarning: number
    memoryCritical: number
    temperatureWarning: number
    temperatureCritical: number
  }
  vlanConfig: {
    management: number
    internet: number
    voip: number
    iptv: number
  }
}

interface OLTSettingsProps {
  oltId: string
  oltName: string
  isOpen: boolean
  onClose: () => void
  onSave: (settings: OLTSettings) => void
}

export function OLTSettings({ oltId, oltName, isOpen, onClose, onSave }: OLTSettingsProps) {
  const [settings, setSettings] = useState<OLTSettings>({
    id: oltId,
    name: oltName,
    ipAddress: '',
    model: '',
    location: '',
    description: '',
    snmpCommunity: 'public',
    snmpPort: 161,
    telnetPort: 23,
    sshPort: 22,
    webPort: 80,
    monitoringInterval: 300,
    alertThresholds: {
      cpuWarning: 70,
      cpuCritical: 90,
      memoryWarning: 70,
      memoryCritical: 90,
      temperatureWarning: 60,
      temperatureCritical: 75
    },
    vlanConfig: {
      management: 1,
      internet: 100,
      voip: 200,
      iptv: 300
    }
  })

  const [loading, setLoading] = useState(false)
  const [testing, setTesting] = useState(false)
  const [connectionStatus, setConnectionStatus] = useState<'idle' | 'testing' | 'success' | 'error'>('idle')

  useEffect(() => {
    if (isOpen && oltId) {
      fetchOLTSettings()
    }
  }, [isOpen, oltId])

  const fetchOLTSettings = async () => {
    try {
      setLoading(true)
      const response = await fetch(`/api/olts/${oltId}/settings`)
      if (response.ok) {
        const data = await response.json()
        setSettings(prev => ({
          ...prev,
          ...data,
          alertThresholds: data.alertThresholds ? JSON.parse(data.alertThresholds) : prev.alertThresholds,
          vlanConfig: data.vlanConfig ? JSON.parse(data.vlanConfig) : prev.vlanConfig
        }))
      }
    } catch (error) {
      console.error('Failed to fetch OLT settings:', error)
      toast({
        title: "Error",
        description: "Gagal memuat pengaturan OLT",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const testConnection = async () => {
    try {
      setTesting(true)
      setConnectionStatus('testing')
      
      const response = await fetch('/api/olts/test-connection', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ipAddress: settings.ipAddress,
          snmpCommunity: settings.snmpCommunity,
          snmpPort: settings.snmpPort
        })
      })

      if (response.ok) {
        setConnectionStatus('success')
        toast({
          title: "Koneksi Berhasil",
          description: "Terhubung ke OLT berhasil",
        })
      } else {
        setConnectionStatus('error')
        toast({
          title: "Koneksi Gagal",
          description: "Tidak dapat terhubung ke OLT",
          variant: "destructive"
        })
      }
    } catch (error) {
      setConnectionStatus('error')
      toast({
        title: "Koneksi Gagal",
        description: "Terjadi kesalahan saat menguji koneksi",
        variant: "destructive"
      })
    } finally {
      setTesting(false)
      setTimeout(() => setConnectionStatus('idle'), 3000)
    }
  }

  const handleSave = async () => {
    try {
      setLoading(true)
      
      const response = await fetch(`/api/olts/${oltId}/settings`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...settings,
          alertThresholds: JSON.stringify(settings.alertThresholds),
          vlanConfig: JSON.stringify(settings.vlanConfig)
        })
      })

      if (response.ok) {
        toast({
          title: "Berhasil",
          description: "Pengaturan OLT berhasil disimpan",
        })
        onSave(settings)
        onClose()
      } else {
        throw new Error('Failed to save settings')
      }
    } catch (error) {
      console.error('Failed to save OLT settings:', error)
      toast({
        title: "Error",
        description: "Gagal menyimpan pengaturan OLT",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  const copyConfig = () => {
    const config = {
      ...settings,
      alertThresholds: settings.alertThresholds,
      vlanConfig: settings.vlanConfig
    }
    navigator.clipboard.writeText(JSON.stringify(config, null, 2))
    toast({
      title: "Berhasil",
      description: "Konfigurasi disalin ke clipboard",
    })
  }

  const applyTemplate = async (templateModel: string) => {
    try {
      setLoading(true)
      
      const response = await fetch('/api/olts/templates', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ model: templateModel })
      })

      if (response.ok) {
        const template = await response.json()
        setSettings(prev => ({
          ...prev,
          ...template,
          alertThresholds: template.alertThresholds ? JSON.parse(template.alertThresholds) : prev.alertThresholds,
          vlanConfig: template.vlanConfig ? JSON.parse(template.vlanConfig) : prev.vlanConfig
        }))
        
        toast({
          title: "Template Diterapkan",
          description: `Konfigurasi template ${templateModel} berhasil diterapkan`,
        })
      } else {
        throw new Error('Failed to apply template')
      }
    } catch (error) {
      console.error('Failed to apply template:', error)
      toast({
        title: "Error",
        description: "Gagal menerapkan template",
        variant: "destructive"
      })
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Settings className="h-5 w-5" />
            <span>Pengaturan OLT - {oltName}</span>
          </DialogTitle>
          <DialogDescription>
            Konfigurasi parameter dan pengaturan monitoring untuk perangkat OLT
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Connection Status */}
          {connectionStatus !== 'idle' && (
            <Alert className={connectionStatus === 'success' ? 'border-green-200 bg-green-50' : 'border-red-200 bg-red-50'}>
              <div className="flex items-center space-x-2">
                {connectionStatus === 'success' ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                )}
                <AlertDescription className={connectionStatus === 'success' ? 'text-green-800' : 'text-red-800'}>
                  {connectionStatus === 'success' ? 'Koneksi berhasil' : 'Koneksi gagal'}
                </AlertDescription>
              </div>
            </Alert>
          )}

          <Tabs defaultValue="basic" className="w-full">
            <TabsList className="grid w-full grid-cols-4">
              <TabsTrigger value="basic">Dasar</TabsTrigger>
              <TabsTrigger value="network">Jaringan</TabsTrigger>
              <TabsTrigger value="monitoring">Monitoring</TabsTrigger>
              <TabsTrigger value="vlan">VLAN</TabsTrigger>
            </TabsList>

            <TabsContent value="basic" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nama OLT</Label>
                  <Input
                    id="name"
                    value={settings.name}
                    onChange={(e) => setSettings(prev => ({ ...prev, name: e.target.value }))}
                    placeholder="Contoh: OLT-01"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="model">Model</Label>
                  <Select value={settings.model} onValueChange={(value) => setSettings(prev => ({ ...prev, model: value }))}>
                    <SelectTrigger>
                      <SelectValue placeholder="Pilih model" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="ZTE-C320">ZTE C320</SelectItem>
                      <SelectItem value="ZTE-C300">ZTE C300</SelectItem>
                      <SelectItem value="Huawei-MA5600">Huawei MA5600</SelectItem>
                      <SelectItem value="Huawei-MA5800">Huawei MA5800</SelectItem>
                      <SelectItem value="Nokia-7360">Nokia 7360</SelectItem>
                      <SelectItem value="Fiberhome-AN5500">Fiberhome AN5500</SelectItem>
                      <SelectItem value="TMO-4EP-4SX-4G-OLT">TMO 4EP-4SX-4G-OLT</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="ipAddress">Alamat IP</Label>
                <Input
                  id="ipAddress"
                  value={settings.ipAddress}
                  onChange={(e) => setSettings(prev => ({ ...prev, ipAddress: e.target.value }))}
                  placeholder="192.168.1.100"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="location">Lokasi</Label>
                <Input
                  id="location"
                  value={settings.location || ''}
                  onChange={(e) => setSettings(prev => ({ ...prev, location: e.target.value }))}
                  placeholder="Contoh: Data Center Jakarta"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Deskripsi</Label>
                <Textarea
                  id="description"
                  value={settings.description || ''}
                  onChange={(e) => setSettings(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Deskripsi perangkat OLT..."
                  rows={3}
                />
              </div>
            </TabsContent>

            <TabsContent value="network" className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="snmpCommunity">SNMP Community</Label>
                  <Input
                    id="snmpCommunity"
                    value={settings.snmpCommunity}
                    onChange={(e) => setSettings(prev => ({ ...prev, snmpCommunity: e.target.value }))}
                    placeholder="public"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="snmpPort">SNMP Port</Label>
                  <Input
                    id="snmpPort"
                    type="number"
                    value={settings.snmpPort}
                    onChange={(e) => setSettings(prev => ({ ...prev, snmpPort: parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="telnetPort">Telnet Port</Label>
                  <Input
                    id="telnetPort"
                    type="number"
                    value={settings.telnetPort}
                    onChange={(e) => setSettings(prev => ({ ...prev, telnetPort: parseInt(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="sshPort">SSH Port</Label>
                  <Input
                    id="sshPort"
                    type="number"
                    value={settings.sshPort}
                    onChange={(e) => setSettings(prev => ({ ...prev, sshPort: parseInt(e.target.value) }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="webPort">Web Port</Label>
                  <Input
                    id="webPort"
                    type="number"
                    value={settings.webPort}
                    onChange={(e) => setSettings(prev => ({ ...prev, webPort: parseInt(e.target.value) }))}
                  />
                </div>
              </div>

              <div className="flex space-x-2">
                <Button 
                  variant="outline" 
                  onClick={testConnection}
                  disabled={testing || !settings.ipAddress}
                  className="flex items-center space-x-2"
                >
                  {testing ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Zap className="h-4 w-4" />
                  )}
                  <span>Test Koneksi</span>
                </Button>
              </div>
            </TabsContent>

            <TabsContent value="monitoring" className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="monitoringInterval">Interval Monitoring (detik)</Label>
                <Input
                  id="monitoringInterval"
                  type="number"
                  value={settings.monitoringInterval}
                  onChange={(e) => setSettings(prev => ({ ...prev, monitoringInterval: parseInt(e.target.value) }))}
                  min="30"
                  max="3600"
                />
              </div>

              <Separator />

              <div className="space-y-4">
                <h4 className="text-sm font-medium">Threshold Alert</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>CPU Usage Warning (%)</Label>
                    <Input
                      type="number"
                      value={settings.alertThresholds.cpuWarning}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        alertThresholds: { ...prev.alertThresholds, cpuWarning: parseInt(e.target.value) }
                      }))}
                      min="0"
                      max="100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>CPU Usage Critical (%)</Label>
                    <Input
                      type="number"
                      value={settings.alertThresholds.cpuCritical}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        alertThresholds: { ...prev.alertThresholds, cpuCritical: parseInt(e.target.value) }
                      }))}
                      min="0"
                      max="100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Memory Usage Warning (%)</Label>
                    <Input
                      type="number"
                      value={settings.alertThresholds.memoryWarning}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        alertThresholds: { ...prev.alertThresholds, memoryWarning: parseInt(e.target.value) }
                      }))}
                      min="0"
                      max="100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Memory Usage Critical (%)</Label>
                    <Input
                      type="number"
                      value={settings.alertThresholds.memoryCritical}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        alertThresholds: { ...prev.alertThresholds, memoryCritical: parseInt(e.target.value) }
                      }))}
                      min="0"
                      max="100"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Temperature Warning (°C)</Label>
                    <Input
                      type="number"
                      value={settings.alertThresholds.temperatureWarning}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        alertThresholds: { ...prev.alertThresholds, temperatureWarning: parseInt(e.target.value) }
                      }))}
                      min="0"
                      max="100"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Temperature Critical (°C)</Label>
                    <Input
                      type="number"
                      value={settings.alertThresholds.temperatureCritical}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        alertThresholds: { ...prev.alertThresholds, temperatureCritical: parseInt(e.target.value) }
                      }))}
                      min="0"
                      max="100"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>

            <TabsContent value="vlan" className="space-y-4">
              <div className="space-y-4">
                <h4 className="text-sm font-medium">Konfigurasi VLAN</h4>
                
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vlanManagement">VLAN Management</Label>
                    <Input
                      id="vlanManagement"
                      type="number"
                      value={settings.vlanConfig.management}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        vlanConfig: { ...prev.vlanConfig, management: parseInt(e.target.value) }
                      }))}
                      min="1"
                      max="4094"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vlanInternet">VLAN Internet</Label>
                    <Input
                      id="vlanInternet"
                      type="number"
                      value={settings.vlanConfig.internet}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        vlanConfig: { ...prev.vlanConfig, internet: parseInt(e.target.value) }
                      }))}
                      min="1"
                      max="4094"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="vlanVoip">VLAN VoIP</Label>
                    <Input
                      id="vlanVoip"
                      type="number"
                      value={settings.vlanConfig.voip}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        vlanConfig: { ...prev.vlanConfig, voip: parseInt(e.target.value) }
                      }))}
                      min="1"
                      max="4094"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="vlanIptv">VLAN IPTV</Label>
                    <Input
                      id="vlanIptv"
                      type="number"
                      value={settings.vlanConfig.iptv}
                      onChange={(e) => setSettings(prev => ({
                        ...prev,
                        vlanConfig: { ...prev.vlanConfig, iptv: parseInt(e.target.value) }
                      }))}
                      min="1"
                      max="4094"
                    />
                  </div>
                </div>
              </div>
            </TabsContent>
          </Tabs>

          <div className="flex justify-between pt-4 border-t">
            <div className="flex space-x-2">
              <Button variant="outline" onClick={copyConfig}>
                <Copy className="h-4 w-4 mr-2" />
                Salin Config
              </Button>
            </div>
            <div className="flex space-x-2">
              <Button variant="outline" onClick={onClose}>
                <X className="h-4 w-4 mr-2" />
                Batal
              </Button>
              <Button onClick={handleSave} disabled={loading}>
                <Save className="h-4 w-4 mr-2" />
                {loading ? 'Menyimpan...' : 'Simpan'}
              </Button>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}