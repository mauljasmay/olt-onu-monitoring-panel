'use client'

import { useEffect, useRef, useState } from 'react'
import { io, Socket } from 'socket.io-client'

export function useSocket() {
  const [socket, setSocket] = useState<Socket | null>(null)
  const [isConnected, setIsConnected] = useState(false)
  const [lastMessage, setLastMessage] = useState<any>(null)

  useEffect(() => {
    const socketInstance = io({
      path: '/api/socket/io',
      addTrailingSlash: false,
    })

    socketInstance.on('connect', () => {
      console.log('Connected to WebSocket server')
      setIsConnected(true)
    })

    socketInstance.on('disconnect', () => {
      console.log('Disconnected from WebSocket server')
      setIsConnected(false)
    })

    socketInstance.on('device-status-changed', (data) => {
      setLastMessage({ type: 'device-status-changed', data })
    })

    socketInstance.on('device-metrics-updated', (data) => {
      setLastMessage({ type: 'device-metrics-updated', data })
    })

    socketInstance.on('alert-created', (data) => {
      setLastMessage({ type: 'alert-created', data })
    })

    socketInstance.on('metric-logged', (data) => {
      setLastMessage({ type: 'metric-logged', data })
    })

    setSocket(socketInstance)

    return () => {
      socketInstance.disconnect()
    }
  }, [])

  const emitDeviceUpdate = (deviceId: string, deviceType: string, status: string, metrics: any) => {
    if (socket) {
      socket.emit('device-update', { deviceId, deviceType, status, metrics })
    }
  }

  const emitNewAlert = (alertData: any) => {
    if (socket) {
      socket.emit('new-alert', alertData)
    }
  }

  const emitLogMetric = (deviceId: string, deviceType: string, metric: string, value: number, unit: string) => {
    if (socket) {
      socket.emit('log-metric', { deviceId, deviceType, metric, value, unit })
    }
  }

  return {
    socket,
    isConnected,
    lastMessage,
    emitDeviceUpdate,
    emitNewAlert,
    emitLogMetric
  }
}