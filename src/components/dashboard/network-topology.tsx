'use client'

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { 
  Network, 
  Server, 
  Wifi, 
  Users, 
  AlertTriangle,
  CheckCircle,
  WifiOff,
  Settings,
  Zap,
  Activity
} from 'lucide-react'

interface NetworkNode {
  id: string
  name: string
  type: 'core' | 'olt' | 'onu' | 'router'
  status: 'online' | 'offline' | 'warning'
  position: { x: number; y: number }
  connections: string[]
  metrics?: {
    users?: number
    bandwidth?: number
    signal?: number
  }
}

interface NetworkTopologyProps {
  className?: string
}

export function NetworkTopology({ className }: NetworkTopologyProps) {
  const [selectedNode, setSelectedNode] = useState<NetworkNode | null>(null)
  const [isExpanded, setIsExpanded] = useState(false)

  // Network topology data
  const networkNodes: NetworkNode[] = [
    {
      id: 'core-1',
      name: 'Core Router',
      type: 'core',
      status: 'online',
      position: { x: 50, y: 10 },
      connections: ['olt-1', 'olt-2', 'olt-3'],
      metrics: {
        bandwidth: 1000,
        users: 1247
      }
    },
    {
      id: 'olt-1',
      name: 'OLT-01',
      type: 'olt',
      status: 'online',
      position: { x: 20, y: 35 },
      connections: ['core-1', 'onu-1', 'onu-2', 'onu-3'],
      metrics: {
        users: 45,
        bandwidth: 100
      }
    },
    {
      id: 'olt-2',
      name: 'OLT-02',
      type: 'olt',
      status: 'online',
      position: { x: 50, y: 35 },
      connections: ['core-1', 'onu-4', 'onu-5', 'onu-6'],
      metrics: {
        users: 38,
        bandwidth: 100
      }
    },
    {
      id: 'olt-3',
      name: 'OLT-03',
      type: 'olt',
      status: 'warning',
      position: { x: 80, y: 35 },
      connections: ['core-1', 'onu-7', 'onu-8'],
      metrics: {
        users: 28,
        bandwidth: 100
      }
    },
    {
      id: 'onu-1',
      name: 'ONU-001',
      type: 'onu',
      status: 'online',
      position: { x: 10, y: 60 },
      connections: ['olt-1'],
      metrics: {
        signal: -18.5
      }
    },
    {
      id: 'onu-2',
      name: 'ONU-002',
      type: 'onu',
      status: 'online',
      position: { x: 20, y: 60 },
      connections: ['olt-1'],
      metrics: {
        signal: -20.1
      }
    },
    {
      id: 'onu-3',
      name: 'ONU-003',
      type: 'onu',
      status: 'offline',
      position: { x: 30, y: 60 },
      connections: ['olt-1'],
      metrics: {
        signal: -35.2
      }
    },
    {
      id: 'onu-4',
      name: 'ONU-004',
      type: 'onu',
      status: 'online',
      position: { x: 40, y: 60 },
      connections: ['olt-2'],
      metrics: {
        signal: -19.8
      }
    },
    {
      id: 'onu-5',
      name: 'ONU-005',
      type: 'onu',
      status: 'online',
      position: { x: 50, y: 60 },
      connections: ['olt-2'],
      metrics: {
        signal: -17.2
      }
    },
    {
      id: 'onu-6',
      name: 'ONU-006',
      type: 'onu',
      status: 'online',
      position: { x: 60, y: 60 },
      connections: ['olt-2'],
      metrics: {
        signal: -21.5
      }
    },
    {
      id: 'onu-7',
      name: 'ONU-007',
      type: 'onu',
      status: 'warning',
      position: { x: 70, y: 60 },
      connections: ['olt-3'],
      metrics: {
        signal: -28.5
      }
    },
    {
      id: 'onu-8',
      name: 'ONU-008',
      type: 'onu',
      status: 'online',
      position: { x: 80, y: 60 },
      connections: ['olt-3'],
      metrics: {
        signal: -22.1
      }
    }
  ]

  const getNodeIcon = (type: string, status: string) => {
    const baseClass = "h-6 w-6"
    
    switch (type) {
      case 'core':
        return <Network className={`${baseClass} ${status === 'online' ? 'text-green-500' : status === 'warning' ? 'text-yellow-500' : 'text-red-500'}`} />
      case 'olt':
        return <Server className={`${baseClass} ${status === 'online' ? 'text-green-500' : status === 'warning' ? 'text-yellow-500' : 'text-red-500'}`} />
      case 'onu':
        return <Wifi className={`${baseClass} ${status === 'online' ? 'text-green-500' : status === 'warning' ? 'text-yellow-500' : 'text-red-500'}`} />
      default:
        return <Activity className={`${baseClass} text-gray-500`} />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'online':
        return 'border-green-500 bg-green-50'
      case 'warning':
        return 'border-yellow-500 bg-yellow-50'
      case 'offline':
        return 'border-red-500 bg-red-50'
      default:
        return 'border-gray-500 bg-gray-50'
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'online':
        return <Badge variant="default" className="bg-green-500 text-white">Online</Badge>
      case 'warning':
        return <Badge variant="secondary" className="bg-yellow-500 text-white">Warning</Badge>
      case 'offline':
        return <Badge variant="destructive">Offline</Badge>
      default:
        return <Badge variant="outline">Unknown</Badge>
    }
  }

  const handleNodeClick = (node: NetworkNode) => {
    setSelectedNode(node)
  }

  const renderConnection = (fromNode: NetworkNode, toNodeId: string) => {
    const toNode = networkNodes.find(n => n.id === toNodeId)
    if (!toNode) return null

    const fromStatus = fromNode.status
    const toStatus = toNode.status
    
    let strokeColor = '#10b981' // green-500
    if (fromStatus === 'offline' || toStatus === 'offline') {
      strokeColor = '#ef4444' // red-500
    } else if (fromStatus === 'warning' || toStatus === 'warning') {
      strokeColor = '#f59e0b' // yellow-500
    }

    return (
      <line
        key={`${fromNode.id}-${toNodeId}`}
        x1={`${fromNode.position.x}%`}
        y1={`${fromNode.position.y}%`}
        x2={`${toNode.position.x}%`}
        y2={`${toNode.position.y}%`}
        stroke={strokeColor}
        strokeWidth="2"
        strokeDasharray={fromStatus === 'offline' || toStatus === 'offline' ? '5,5' : '0'}
        opacity="0.6"
      />
    )
  }

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="flex items-center gap-2">
              <Network className="h-5 w-5" />
              Network Topology
            </CardTitle>
            <CardDescription>Visual representation of network infrastructure</CardDescription>
          </div>
          <Button 
            variant="outline" 
            size="sm"
            onClick={() => setIsExpanded(!isExpanded)}
          >
            {isExpanded ? 'Compact' : 'Expand'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="grid gap-6 lg:grid-cols-3">
          {/* Network Visualization */}
          <div className={`lg:col-span-2 ${isExpanded ? 'min-h-[500px]' : 'min-h-[400px]'}`}>
            <div className="relative w-full h-full border rounded-lg bg-gradient-to-br from-blue-50 to-indigo-50 p-4">
              <svg className="absolute inset-0 w-full h-full" style={{ zIndex: 1 }}>
                {/* Render connections */}
                {networkNodes.map(node => 
                  node.connections.map(connectionId => 
                    renderConnection(node, connectionId)
                  )
                )}
              </svg>
              
              {/* Render nodes */}
              {networkNodes.map((node) => (
                <div
                  key={node.id}
                  className={`absolute transform -translate-x-1/2 -translate-y-1/2 cursor-pointer transition-all duration-200 hover:scale-110 ${selectedNode?.id === node.id ? 'z-10' : 'z-2'}`}
                  style={{ 
                    left: `${node.position.x}%`, 
                    top: `${node.position.y}%`,
                    zIndex: selectedNode?.id === node.id ? 10 : 2
                  }}
                  onClick={() => handleNodeClick(node)}
                >
                  <div className={`p-2 rounded-full border-2 ${getStatusColor(node.status)} ${selectedNode?.id === node.id ? 'ring-2 ring-blue-500 ring-offset-2' : ''}`}>
                    {getNodeIcon(node.type, node.status)}
                  </div>
                  <div className="text-xs font-medium text-center mt-1 bg-white px-1 rounded shadow-sm">
                    {node.name}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Node Details */}
          <div className="space-y-4">
            {selectedNode ? (
              <Card>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">{selectedNode.name}</CardTitle>
                    {getStatusBadge(selectedNode.status)}
                  </div>
                  <CardDescription className="capitalize">
                    {selectedNode.type} Device
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center gap-2">
                    {getNodeIcon(selectedNode.type, selectedNode.status)}
                    <span className="text-sm font-medium">Device Information</span>
                  </div>
                  
                  {selectedNode.metrics && (
                    <div className="space-y-3">
                      {selectedNode.metrics.users !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Connected Users</span>
                          <div className="flex items-center gap-1">
                            <Users className="h-3 w-3" />
                            <span className="text-sm font-medium">{selectedNode.metrics.users}</span>
                          </div>
                        </div>
                      )}
                      
                      {selectedNode.metrics.bandwidth !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Bandwidth</span>
                          <div className="flex items-center gap-1">
                            <Zap className="h-3 w-3" />
                            <span className="text-sm font-medium">{selectedNode.metrics.bandwidth} Mbps</span>
                          </div>
                        </div>
                      )}
                      
                      {selectedNode.metrics.signal !== undefined && (
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Signal Strength</span>
                          <span className={`text-sm font-medium ${
                            selectedNode.metrics.signal > -20 ? 'text-green-600' : 
                            selectedNode.metrics.signal > -30 ? 'text-yellow-600' : 'text-red-600'
                          }`}>
                            {selectedNode.metrics.signal} dBm
                          </span>
                        </div>
                      )}
                    </div>
                  )}
                  
                  <div className="space-y-2">
                    <div className="text-sm font-medium">Connections</div>
                    <div className="space-y-1">
                      {selectedNode.connections.map(connId => {
                        const connNode = networkNodes.find(n => n.id === connId)
                        return connNode ? (
                          <div key={connId} className="flex items-center justify-between text-sm">
                            <span>{connNode.name}</span>
                            {getStatusBadge(connNode.status)}
                          </div>
                        ) : null
                      })}
                    </div>
                  </div>
                  
                  <div className="flex gap-2">
                    <Button variant="outline" size="sm" className="flex-1">
                      <Settings className="h-3 w-3 mr-1" />
                      Configure
                    </Button>
                    <Button variant="outline" size="sm" className="flex-1">
                      <Activity className="h-3 w-3 mr-1" />
                      Details
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ) : (
              <Card>
                <CardContent className="pt-6">
                  <div className="text-center text-muted-foreground">
                    <Network className="h-8 w-8 mx-auto mb-2" />
                    <p className="text-sm">Select a node to view details</p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Network Summary */}
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Network Summary</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center justify-between text-sm">
                  <span>Total Devices</span>
                  <span className="font-medium">{networkNodes.length}</span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Online</span>
                  <span className="font-medium text-green-600">
                    {networkNodes.filter(n => n.status === 'online').length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Warning</span>
                  <span className="font-medium text-yellow-600">
                    {networkNodes.filter(n => n.status === 'warning').length}
                  </span>
                </div>
                <div className="flex items-center justify-between text-sm">
                  <span>Offline</span>
                  <span className="font-medium text-red-600">
                    {networkNodes.filter(n => n.status === 'offline').length}
                  </span>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}