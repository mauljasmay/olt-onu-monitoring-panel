'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Label } from '@/components/ui/label'
import { Search, Server, Wifi, WifiOff, AlertTriangle, Settings, Eye, Plus, Trash2 } from 'lucide-react'
import { OLTSettings } from './olt-settings'
import { toast } from '@/hooks/use-toast'

interface OLTDevice {
  id: string
  name: string
  ip: string
  model: string
  status: 'online' | 'offline' | 'warning'
  uptime: string
  cpuUsage: number
  memoryUsage: number
  temperature: number
  onuCount: number
  activeONU: number
  lastSeen: string
}

export function OLTTable() {
  const [devices, setDevices] = useState<OLTDevice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [selectedOLT, setSelectedOLT] = useState<{ id: string; name: string } | null>(null)
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [addDialogOpen, setAddDialogOpen] = useState(false)
  const [addLoading, setAddLoading] = useState(false)
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false)
  const [deleteLoading, setDeleteLoading] = useState(false)
  const [oltToDelete, setOltToDelete] = useState<OLTDevice | null>(null)
  
  // Form state for new OLT
  const [newOlt, setNewOlt] = useState({
    name: '',
    ipAddress: '',
    model: '',
    snmpCommunity: 'public',
    snmpPort: 161,
    location: ''
  })

  const handleOpenSettings = (device: OLTDevice) => {
    setSelectedOLT({ id: device.id, name: device.name })
    setSettingsOpen(true)
  }

  const handleCloseSettings = () => {
    setSettingsOpen(false)
    setSelectedOLT(null)
  }

  const handleSaveSettings = (settings: any) => {
    // Refresh the devices list to reflect any changes
    fetchDevices()
  }

  const handleAddOLT = async () => {
    // Validation
    if (!newOlt.name.trim()) {
      toast({
        title: "Error",
        description: "Nama OLT harus diisi",
        variant: "destructive"
      })
      return
    }

    if (!newOlt.ipAddress.trim()) {
      toast({
        title: "Error", 
        description: "IP address harus diisi",
        variant: "destructive"
      })
      return
    }

    // Validate IP address format
    const ipRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)\.){3}(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)$/
    if (!ipRegex.test(newOlt.ipAddress.trim())) {
      toast({
        title: "Error",
        description: "Format IP address tidak valid",
        variant: "destructive"
      })
      return
    }

    if (!newOlt.model) {
      toast({
        title: "Error",
        description: "Model OLT harus dipilih",
        variant: "destructive"
      })
      return
    }

    setAddLoading(true)
    try {
      toast({
        title: "Menambah OLT",
        description: `Menambahkan OLT ${newOlt.name}...`,
      })

      // Call API to add OLT
      const response = await fetch('/api/olts', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          name: newOlt.name.trim(),
          ipAddress: newOlt.ipAddress.trim(),
          model: newOlt.model,
          snmpCommunity: newOlt.snmpCommunity,
          snmpPort: newOlt.snmpPort,
          location: newOlt.location.trim()
        })
      })

      if (response.ok) {
        const result = await response.json()
        
        toast({
          title: "OLT Berhasil Ditambahkan",
          description: `OLT ${newOlt.name} berhasil ditambahkan dengan SNMP ${newOlt.ipAddress}:${newOlt.snmpPort}`,
        })

        // Reset form
        setNewOlt({
          name: '',
          ipAddress: '',
          model: '',
          snmpCommunity: 'public',
          snmpPort: 161,
          location: ''
        })
        setAddDialogOpen(false)

        // Refresh devices list
        fetchDevices()
        
        // Also refresh dashboard stats
        fetch('/api/dashboard/stats')
          .then(res => res.json())
          .then(data => {
            // This will update the main dashboard stats if needed
            console.log('Dashboard stats refreshed:', data)
          })
          .catch(console.error)
      } else {
        throw new Error('Failed to add OLT')
      }
    } catch (error) {
      console.error('Failed to add OLT:', error)
      toast({
        title: "Error",
        description: `Gagal menambahkan OLT ${newOlt.name}`,
        variant: "destructive"
      })
    } finally {
      setAddLoading(false)
    }
  }

  const resetAddForm = () => {
    setNewOlt({
      name: '',
      ipAddress: '',
      model: '',
      snmpCommunity: 'public',
      snmpPort: 161,
      location: ''
    })
    setAddDialogOpen(false)
  }

  const handleDeleteOLT = (device: OLTDevice) => {
    setOltToDelete(device)
    setDeleteDialogOpen(true)
  }

  const confirmDeleteOLT = async () => {
    if (!oltToDelete) return

    setDeleteLoading(true)
    try {
      toast({
        title: "Menghapus OLT",
        description: `Menghapus OLT ${oltToDelete.name}...`,
      })

      const response = await fetch(`/api/olts/${oltToDelete.id}`, {
        method: 'DELETE'
      })

      if (response.ok) {
        toast({
          title: "OLT Berhasil Dihapus",
          description: `OLT ${oltToDelete.name} telah dihapus beserta semua data terkait`,
        })

        // Close dialog and reset state
        setDeleteDialogOpen(false)
        setOltToDelete(null)

        // Refresh devices list
        fetchDevices()
        
        // Also refresh dashboard stats
        fetch('/api/dashboard/stats')
          .then(res => res.json())
          .then(data => {
            console.log('Dashboard stats refreshed:', data)
          })
          .catch(console.error)
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to delete OLT')
      }
    } catch (error) {
      console.error('Failed to delete OLT:', error)
      toast({
        title: "Error",
        description: `Gagal menghapus OLT ${oltToDelete?.name}`,
        variant: "destructive"
      })
    } finally {
      setDeleteLoading(false)
    }
  }

  const cancelDelete = () => {
    setDeleteDialogOpen(false)
    setOltToDelete(null)
  }

  const fetchDevices = async () => {
    try {
      const params = new URLSearchParams()
      if (statusFilter !== 'all') params.append('status', statusFilter)
      if (searchTerm) params.append('search', searchTerm)
      
      const response = await fetch(`/api/olts?${params}`)
      if (response.ok) {
        const data = await response.json()
        setDevices(data)
      }
    } catch (error) {
      console.error('Failed to fetch OLT devices:', error)
      // Fallback to mock data
      const mockDevices: OLTDevice[] = [
        {
          id: '1',
          name: 'OLT-01',
          ip: '192.168.1.10',
          model: 'Huawei MA5800',
          status: 'online',
          uptime: '15 hari 3 jam',
          cpuUsage: 45,
          memoryUsage: 62,
          temperature: 42,
          onuCount: 32,
          activeONU: 30,
          lastSeen: '2 menit yang lalu'
        },
        {
          id: '2',
          name: 'OLT-02',
          ip: '192.168.1.11',
          model: 'ZTE C320',
          status: 'online',
          uptime: '8 hari 12 jam',
          cpuUsage: 38,
          memoryUsage: 55,
          temperature: 38,
          onuCount: 28,
          activeONU: 27,
          lastSeen: '1 menit yang lalu'
        },
        {
          id: '3',
          name: 'OLT-03',
          ip: '192.168.1.12',
          model: 'Huawei MA5800',
          status: 'offline',
          uptime: '0 hari 0 jam',
          cpuUsage: 0,
          memoryUsage: 0,
          temperature: 0,
          onuCount: 24,
          activeONU: 0,
          lastSeen: '1 jam yang lalu'
        },
        {
          id: '4',
          name: 'OLT-04',
          ip: '192.168.1.13',
          model: 'Nokia ISAM',
          status: 'warning',
          uptime: '3 hari 5 jam',
          cpuUsage: 78,
          memoryUsage: 85,
          temperature: 58,
          onuCount: 20,
          activeONU: 18,
          lastSeen: '5 menit yang lalu'
        },
        {
          id: '5',
          name: 'OLT-05',
          ip: '192.168.1.14',
          model: 'ZTE C320',
          status: 'online',
          uptime: '22 hari 8 jam',
          cpuUsage: 32,
          memoryUsage: 48,
          temperature: 35,
          onuCount: 24,
          activeONU: 22,
          lastSeen: '1 menit yang lalu'
        },
        {
          id: '6',
          name: 'OLT-06',
          ip: '192.168.1.15',
          model: 'TMO 4EP-4SX-4G-OLT',
          status: 'online',
          uptime: '5 hari 14 jam',
          cpuUsage: 28,
          memoryUsage: 41,
          temperature: 33,
          onuCount: 16,
          activeONU: 15,
          lastSeen: '30 detik yang lalu'
        }
      ]
      setDevices(mockDevices)
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    fetchDevices()
  }, [statusFilter, searchTerm])

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return <Badge className="bg-green-500">Online</Badge>
      case 'offline':
        return <Badge variant="destructive">Offline</Badge>
      case 'warning':
        return <Badge variant="secondary">Warning</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'online':
        return <Wifi className="h-4 w-4 text-green-500" />
      case 'offline':
        return <WifiOff className="h-4 w-4 text-red-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      default:
        return <Server className="h-4 w-4 text-gray-500" />
    }
  }

  const getUsageColor = (usage: number) => {
    if (usage >= 80) return 'text-red-600 dark:text-red-400'
    if (usage >= 60) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-green-600 dark:text-green-400'
  }

  const getTemperatureColor = (temp: number) => {
    if (temp >= 55) return 'text-red-600 dark:text-red-400'
    if (temp >= 45) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-green-600 dark:text-green-400'
  }

  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.ip.includes(searchTerm) ||
                         device.model.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesStatus = statusFilter === 'all' || device.status === statusFilter
    return matchesSearch && matchesStatus
  })

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>OLT Devices</CardTitle>
          <CardDescription>Loading device information...</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        </CardContent>
      </Card>
    )
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle>OLT Devices</CardTitle>
            <CardDescription>
              Monitor semua perangkat Optical Line Terminal
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Dialog open={addDialogOpen} onOpenChange={setAddDialogOpen}>
              <DialogTrigger asChild>
                <Button variant="outline" size="sm">
                  <Plus className="h-4 w-4 mr-2" />
                  Add OLT
                </Button>
              </DialogTrigger>
              <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <Plus className="h-5 w-5" />
                    <span>Tambah OLT Baru</span>
                  </DialogTitle>
                  <DialogDescription>
                    Tambahkan perangkat OLT baru dengan konfigurasi SNMP
                  </DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-4">
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="olt-name" className="text-right">
                      Nama OLT
                    </Label>
                    <Input
                      id="olt-name"
                      placeholder="OLT-07"
                      value={newOlt.name}
                      onChange={(e) => setNewOlt(prev => ({ ...prev, name: e.target.value }))}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="olt-ip" className="text-right">
                      IP Address
                    </Label>
                    <Input
                      id="olt-ip"
                      placeholder="192.168.1.100"
                      value={newOlt.ipAddress}
                      onChange={(e) => setNewOlt(prev => ({ ...prev, ipAddress: e.target.value }))}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="olt-model" className="text-right">
                      Model
                    </Label>
                    <Select value={newOlt.model} onValueChange={(value) => setNewOlt(prev => ({ ...prev, model: value }))}>
                      <SelectTrigger className="col-span-3">
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
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="snmp-community" className="text-right">
                      SNMP Community
                    </Label>
                    <Input
                      id="snmp-community"
                      placeholder="public"
                      value={newOlt.snmpCommunity}
                      onChange={(e) => setNewOlt(prev => ({ ...prev, snmpCommunity: e.target.value }))}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="snmp-port" className="text-right">
                      SNMP Port
                    </Label>
                    <Input
                      id="snmp-port"
                      type="number"
                      placeholder="161"
                      value={newOlt.snmpPort}
                      onChange={(e) => setNewOlt(prev => ({ ...prev, snmpPort: parseInt(e.target.value) || 161 }))}
                      className="col-span-3"
                    />
                  </div>
                  <div className="grid grid-cols-4 items-center gap-4">
                    <Label htmlFor="olt-location" className="text-right">
                      Lokasi
                    </Label>
                    <Input
                      id="olt-location"
                      placeholder="Data Center Jakarta"
                      value={newOlt.location}
                      onChange={(e) => setNewOlt(prev => ({ ...prev, location: e.target.value }))}
                      className="col-span-3"
                    />
                  </div>
                </div>
                <div className="bg-blue-50 p-3 rounded-md">
                  <p className="text-sm text-blue-800">
                    <strong>Informasi:</strong> OLT akan ditambahkan dengan konfigurasi SNMP untuk monitoring otomatis. 
                    Pastikan IP address dan SNMP community sudah benar.
                  </p>
                </div>
                <DialogFooter>
                  <Button 
                    type="button" 
                    variant="outline" 
                    onClick={resetAddForm}
                    disabled={addLoading}
                  >
                    Batal
                  </Button>
                  <Button 
                    type="button" 
                    onClick={handleAddOLT}
                    disabled={addLoading}
                  >
                    {addLoading ? 'Menambahkan...' : 'Tambah OLT'}
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search OLT devices..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-8"
            />
          </div>
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="online">Online</SelectItem>
              <SelectItem value="offline">Offline</SelectItem>
              <SelectItem value="warning">Warning</SelectItem>
            </SelectContent>
          </Select>
        </div>

        <div className="rounded-md border">
          <div className="overflow-x-auto scrollbar-thin">
            <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Status</TableHead>
                <TableHead>Device Name</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Model</TableHead>
                <TableHead>Uptime</TableHead>
                <TableHead>CPU</TableHead>
                <TableHead>Memory</TableHead>
                <TableHead>Temp</TableHead>
                <TableHead>ONU</TableHead>
                <TableHead>Last Seen</TableHead>
                <TableHead>Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredDevices.map((device) => (
                <TableRow key={device.id}>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getStatusIcon(device.status)}
                      {getStatusBadge(device.status)}
                    </div>
                  </TableCell>
                  <TableCell className="font-medium">{device.name}</TableCell>
                  <TableCell>{device.ip}</TableCell>
                  <TableCell>{device.model}</TableCell>
                  <TableCell>{device.uptime}</TableCell>
                  <TableCell>
                    <span className={getUsageColor(device.cpuUsage)}>
                      {device.cpuUsage}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={getUsageColor(device.memoryUsage)}>
                      {device.memoryUsage}%
                    </span>
                  </TableCell>
                  <TableCell>
                    <span className={getTemperatureColor(device.temperature)}>
                      {device.temperature}°C
                    </span>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{device.activeONU}/{device.onuCount}</div>
                      <div className="text-muted-foreground">
                        {Math.round((device.activeONU / device.onuCount) * 100)}% active
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {device.lastSeen}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm" onClick={() => handleOpenSettings(device)}>
                        <Settings className="h-4 w-4" />
                      </Button>
                      <Button 
                        variant="ghost" 
                        size="sm" 
                        onClick={() => handleDeleteOLT(device)}
                        className="text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
            </Table>
          </div>
        </div>

        {filteredDevices.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            No OLT devices found matching your criteria.
          </div>
        )}

        {/* OLT Settings Dialog */}
        {selectedOLT && (
          <OLTSettings
            oltId={selectedOLT.id}
            oltName={selectedOLT.name}
            isOpen={settingsOpen}
            onClose={handleCloseSettings}
            onSave={handleSaveSettings}
          />
        )}

        {/* Delete Confirmation Dialog */}
        <Dialog open={deleteDialogOpen} onOpenChange={setDeleteDialogOpen}>
          <DialogContent className="sm:max-w-[425px]">
            <DialogHeader>
              <DialogTitle className="flex items-center space-x-2 text-red-600">
                <Trash2 className="h-5 w-5" />
                <span>Hapus OLT</span>
              </DialogTitle>
              <DialogDescription>
                Apakah Anda yakin ingin menghapus OLT {oltToDelete?.name}? 
                Tindakan ini akan menghapus semua data terkait termasuk ONU, alerts, dan monitoring logs.
              </DialogDescription>
            </DialogHeader>
            
            {oltToDelete && (
              <div className="bg-red-50 p-4 rounded-md">
                <h4 className="font-medium text-red-800 mb-2">Detail OLT yang akan dihapus:</h4>
                <div className="space-y-1 text-sm text-red-700">
                  <p><strong>Nama:</strong> {oltToDelete.name}</p>
                  <p><strong>IP Address:</strong> {oltToDelete.ip}</p>
                  <p><strong>Model:</strong> {oltToDelete.model}</p>
                  <p><strong>Status:</strong> {oltToDelete.status}</p>
                  <p><strong>Jumlah ONU:</strong> {oltToDelete.onuCount}</p>
                </div>
              </div>
            )}

            <DialogFooter>
              <Button 
                type="button" 
                variant="outline" 
                onClick={cancelDelete}
                disabled={deleteLoading}
              >
                Batal
              </Button>
              <Button 
                type="button" 
                variant="destructive"
                onClick={confirmDeleteOLT}
                disabled={deleteLoading}
              >
                {deleteLoading ? 'Menghapus...' : 'Hapus OLT'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  )
}