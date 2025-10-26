'use client'

import { useState, useEffect } from 'react'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Search, Wifi, WifiOff, AlertTriangle, Settings, Eye, Signal, Activity } from 'lucide-react'

interface ONUDevice {
  id: string
  name: string
  serialNumber: string
  oltId: string
  oltName: string
  port: number
  status: 'online' | 'offline' | 'warning'
  signalStrength: number
  rxPower: number
  txPower: number
  distance: number
  uptime: string
  lastSeen: string
  customerName?: string
  ipAddress?: string
}

export function ONUTable() {
  const [devices, setDevices] = useState<ONUDevice[]>([])
  const [loading, setLoading] = useState(true)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [oltFilter, setOltFilter] = useState<string>('all')

  useEffect(() => {
    const fetchDevices = async () => {
      try {
        const params = new URLSearchParams()
        if (statusFilter !== 'all') params.append('status', statusFilter)
        if (oltFilter !== 'all') params.append('oltId', oltFilter)
        if (searchTerm) params.append('search', searchTerm)
        
        const response = await fetch(`/api/onus?${params}`)
        if (response.ok) {
          const data = await response.json()
          setDevices(data)
        }
      } catch (error) {
        console.error('Failed to fetch ONU devices:', error)
        // Fallback to mock data
        const mockDevices: ONUDevice[] = [
          {
            id: '1',
            name: 'ONU-001',
            serialNumber: 'ZTEG12345678',
            oltId: '1',
            oltName: 'OLT-01',
            port: 1,
            status: 'online',
            signalStrength: -18,
            rxPower: -20.5,
            txPower: 2.1,
            distance: 1250,
            uptime: '5 hari 12 jam',
            lastSeen: '1 menit yang lalu',
            customerName: 'PT. Maju Jaya',
            ipAddress: '192.168.100.10'
          },
          {
            id: '2',
            name: 'ONU-002',
            serialNumber: 'ZTEG87654321',
            oltId: '1',
            oltName: 'OLT-01',
            port: 2,
            status: 'online',
            signalStrength: -22,
            rxPower: -24.8,
            txPower: 1.8,
            distance: 2100,
            uptime: '12 hari 3 jam',
            lastSeen: '2 menit yang lalu',
            customerName: 'CV. Sukses Sejahtera',
            ipAddress: '192.168.100.11'
          },
          {
            id: '3',
            name: 'ONU-003',
            serialNumber: 'HWTC11223344',
            oltId: '2',
            oltName: 'OLT-02',
            port: 5,
            status: 'warning',
            signalStrength: -28,
            rxPower: -30.2,
            txPower: 0.5,
            distance: 3200,
            uptime: '2 hari 8 jam',
            lastSeen: '5 menit yang lalu',
            customerName: 'Toko ABC',
            ipAddress: '192.168.100.12'
          },
          {
            id: '4',
            name: 'ONU-004',
            serialNumber: 'HWTC55667788',
            oltId: '2',
            oltName: 'OLT-02',
            port: 8,
            status: 'offline',
            signalStrength: 0,
            rxPower: 0,
            txPower: 0,
            distance: 0,
            uptime: '0 hari 0 jam',
            lastSeen: '3 jam yang lalu',
            customerName: 'Rumah Pak Budi',
            ipAddress: '192.168.100.13'
          },
          {
            id: '5',
            name: 'ONU-005',
            serialNumber: 'NKIA99887766',
            oltId: '4',
            oltName: 'OLT-04',
            port: 3,
            status: 'online',
            signalStrength: -15,
            rxPower: -17.2,
            txPower: 2.8,
            distance: 800,
            uptime: '8 hari 15 jam',
            lastSeen: '1 menit yang lalu',
            customerName: 'Kantor Kelurahan',
            ipAddress: '192.168.100.14'
          }
        ]
        setDevices(mockDevices)
      } finally {
        setLoading(false)
      }
    }

    fetchDevices()
  }, [statusFilter, oltFilter, searchTerm])

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
        return <Activity className="h-4 w-4 text-gray-500" />
    }
  }

  const getSignalColor = (signal: number) => {
    if (signal === 0) return 'text-red-600 dark:text-red-400'
    if (signal >= -25) return 'text-green-600 dark:text-green-400'
    if (signal >= -27) return 'text-yellow-600 dark:text-yellow-400'
    return 'text-red-600 dark:text-red-400'
  }

  const getSignalIcon = (signal: number) => {
    if (signal === 0) return <WifiOff className="h-4 w-4 text-red-500" />
    if (signal >= -20) return <Signal className="h-4 w-4 text-green-500" />
    if (signal >= -25) return <Signal className="h-4 w-4 text-yellow-500" />
    return <Signal className="h-4 w-4 text-red-500" />
  }

  const filteredDevices = devices.filter(device => {
    const matchesSearch = device.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.serialNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.customerName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         device.ipAddress?.includes(searchTerm)
    const matchesStatus = statusFilter === 'all' || device.status === statusFilter
    const matchesOLT = oltFilter === 'all' || device.oltId === oltFilter
    return matchesSearch && matchesStatus && matchesOLT
  })

  const uniqueOLTs = Array.from(new Set(devices.map(d => d.oltId))).map(oltId => {
    const device = devices.find(d => d.oltId === oltId)
    return { id: oltId, name: device?.oltName || `OLT-${oltId}` }
  })

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>ONU Devices</CardTitle>
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
            <CardTitle>ONU Devices</CardTitle>
            <CardDescription>
              Monitor semua perangkat Optical Network Unit
            </CardDescription>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" size="sm">
              <Settings className="h-4 w-4 mr-2" />
              Bulk Actions
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        <div className="flex items-center space-x-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-2 top-2.5 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Search ONU devices..."
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
          <Select value={oltFilter} onValueChange={setOltFilter}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Filter by OLT" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All OLTs</SelectItem>
              {uniqueOLTs.map(olt => (
                <SelectItem key={olt.id} value={olt.id}>{olt.name}</SelectItem>
              ))}
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
                <TableHead>Serial Number</TableHead>
                <TableHead>OLT / Port</TableHead>
                <TableHead>Signal</TableHead>
                <TableHead>RX Power</TableHead>
                <TableHead>Distance</TableHead>
                <TableHead>Customer</TableHead>
                <TableHead>IP Address</TableHead>
                <TableHead>Uptime</TableHead>
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
                  <TableCell className="font-mono text-sm">{device.serialNumber}</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{device.oltName}</div>
                      <div className="text-muted-foreground">Port {device.port}</div>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      {getSignalIcon(device.signalStrength)}
                      <span className={getSignalColor(device.signalStrength)}>
                        {device.signalStrength} dBm
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>RX: {device.rxPower} dBm</div>
                      <div className="text-muted-foreground">TX: {device.txPower} dBm</div>
                    </div>
                  </TableCell>
                  <TableCell>{device.distance} m</TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <div>{device.customerName || '-'}</div>
                    </div>
                  </TableCell>
                  <TableCell className="font-mono text-sm">
                    {device.ipAddress || '-'}
                  </TableCell>
                  <TableCell className="text-muted-foreground">
                    {device.uptime}
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <Button variant="ghost" size="sm">
                        <Eye className="h-4 w-4" />
                      </Button>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
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
            No ONU devices found matching your criteria.
          </div>
        )}
      </CardContent>
    </Card>
  )
}