import { Server as NetServer } from 'http'
import { NextApiRequest, NextApiResponse } from 'next'
import { Server as ServerIO } from 'socket.io'
import { db } from '@/lib/db'

export const config = {
  api: {
    bodyParser: false
  }
}

const SocketHandler = (req: NextApiRequest, res: NextApiResponse & { socket: any }) => {
  if (res.socket.server.io) {
    console.log('Socket is already running')
  } else {
    console.log('Socket is initializing')
    const httpServer: NetServer = res.socket.server as any
    const io = new ServerIO(httpServer, {
      path: '/api/socket/io',
      addTrailingSlash: false,
      cors: {
        origin: "*",
        methods: ["GET", "POST"]
      }
    })

    res.socket.server.io = io

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id)

      // Join monitoring room
      socket.join('monitoring')

      // Handle device status updates
      socket.on('device-update', async (data) => {
        try {
          const { deviceId, deviceType, status, metrics } = data

          if (deviceType === 'olt') {
            await db.oLT.update({
              where: { id: deviceId },
              data: {
                status,
                ...metrics,
                lastSeen: new Date()
              }
            })
          } else if (deviceType === 'onu') {
            await db.oNU.update({
              where: { id: deviceId },
              data: {
                status,
                ...metrics,
                lastSeen: new Date()
              }
            })
          }

          // Broadcast update to all clients in monitoring room
          io.to('monitoring').emit('device-status-changed', {
            deviceId,
            deviceType,
            status,
            metrics,
            timestamp: new Date()
          })
        } catch (error) {
          console.error('Error updating device:', error)
          socket.emit('error', { message: 'Failed to update device' })
        }
      })

      // Handle new alerts
      socket.on('new-alert', async (data) => {
        try {
          const alert = await db.alert.create({
            data: {
              ...data,
              createdAt: new Date()
            }
          })

          // Broadcast alert to all clients
          io.to('monitoring').emit('alert-created', alert)
        } catch (error) {
          console.error('Error creating alert:', error)
          socket.emit('error', { message: 'Failed to create alert' })
        }
      })

      // Handle monitoring logs
      socket.on('log-metric', async (data) => {
        try {
          const { deviceId, deviceType, metric, value, unit } = data
          
          await db.monitoringLog.create({
            data: {
              deviceId,
              deviceType,
              metric,
              value,
              unit,
              timestamp: new Date()
            }
          })

          // Broadcast to monitoring dashboard
          io.to('monitoring').emit('metric-logged', {
            deviceId,
            deviceType,
            metric,
            value,
            unit,
            timestamp: new Date()
          })
        } catch (error) {
          console.error('Error logging metric:', error)
        }
      })

      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)
      })
    })

    // Simulate real-time updates (for demo purposes)
    setInterval(async () => {
      try {
        // Get random OLT and update metrics
        const olts = await db.oLT.findMany({
          where: { status: 'online' }
        })

        if (olts.length > 0) {
          const randomOLT = olts[Math.floor(Math.random() * olts.length)]
          const cpuUsage = Math.floor(Math.random() * 30) + 30 // 30-60%
          const memoryUsage = Math.floor(Math.random() * 25) + 45 // 45-70%
          const temperature = Math.floor(Math.random() * 15) + 35 // 35-50°C

          await db.oLT.update({
            where: { id: randomOLT.id },
            data: {
              cpuUsage,
              memoryUsage,
              temperature
            }
          })

          io.to('monitoring').emit('device-metrics-updated', {
            deviceId: randomOLT.id,
            deviceType: 'olt',
            metrics: {
              cpuUsage,
              memoryUsage,
              temperature
            },
            timestamp: new Date()
          })
        }

        // Get random ONU and update signal
        const onus = await db.oNU.findMany({
          where: { status: 'online' }
        })

        if (onus.length > 0) {
          const randomONU = onus[Math.floor(Math.random() * onus.length)]
          const signalStrength = Math.floor(Math.random() * 10) - 25 // -25 to -15 dBm
          const rxPower = signalStrength - 2.5

          await db.oNU.update({
            where: { id: randomONU.id },
            data: {
              signalStrength,
              rxPower
            }
          })

          io.to('monitoring').emit('device-metrics-updated', {
            deviceId: randomONU.id,
            deviceType: 'onu',
            metrics: {
              signalStrength,
              rxPower
            },
            timestamp: new Date()
          })
        }
      } catch (error) {
        console.error('Error in simulation:', error)
      }
    }, 10000) // Update every 10 seconds
  }
  res.end()
}

export default SocketHandler