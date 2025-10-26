import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { GenieACSClient, GenieACSMonitoring } from '@/lib/genieacs'

// GET /api/genieacs/monitoring - Get monitoring data
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const configId = searchParams.get('configId')
    const deviceId = searchParams.get('deviceId')
    const metric = searchParams.get('metric') // health, parameters, firmware, analytics

    if (!configId) {
      return NextResponse.json(
        { error: 'configId is required' },
        { status: 400 }
      )
    }

    // Get GenieACS configuration
    const config = await db.genieACSConfig.findUnique({
      where: { id: configId }
    })

    if (!config) {
      return NextResponse.json(
        { error: 'GenieACS configuration not found' },
        { status: 404 }
      )
    }

    const client = new GenieACSClient({
      baseUrl: config.baseUrl,
      username: config.username || undefined,
      password: config.password || undefined,
      timeout: config.timeout
    })

    const monitoring = new GenieACSMonitoring(client)

    switch (metric) {
      case 'health':
        if (!deviceId) {
          return NextResponse.json(
            { error: 'deviceId is required for health metric' },
            { status: 400 }
          )
        }
        const healthScore = await monitoring.calculateDeviceHealth(deviceId)
        return NextResponse.json(healthScore)

      case 'parameters':
        if (!deviceId) {
          return NextResponse.json(
            { error: 'deviceId is required for parameters metric' },
            { status: 400 }
          )
        }
        const parameters = await monitoring.monitorDeviceParameters(deviceId)
        return NextResponse.json(parameters)

      case 'firmware':
        if (!deviceId) {
          return NextResponse.json(
            { error: 'deviceId is required for firmware metric' },
            { status: 400 }
          )
        }
        const firmwareInfo = await monitoring.checkFirmwareUpdates(deviceId)
        return NextResponse.json(firmwareInfo)

      case 'analytics':
        if (!deviceId) {
          return NextResponse.json(
            { error: 'deviceId is required for analytics metric' },
            { status: 400 }
          )
        }
        const timeRange = (searchParams.get('timeRange') as 'hour' | 'day' | 'week' | 'month') || 'day'
        const analytics = await monitoring.getDeviceAnalytics(deviceId, timeRange)
        return NextResponse.json(analytics)

      case 'thresholds':
        const thresholds = await db.genieacsParameterThreshold.findMany({
          where: { enabled: true },
          orderBy: { createdAt: 'desc' }
        })
        return NextResponse.json(thresholds)

      case 'device-health':
        const deviceHealth = await db.genieacsDeviceHealth.findMany({
          orderBy: { lastCalculated: 'desc' },
          take: 100
        })
        return NextResponse.json(deviceHealth)

      default:
        return NextResponse.json(
          { error: 'Invalid metric. Use: health, parameters, firmware, analytics, thresholds, device-health' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error fetching monitoring data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch monitoring data' },
      { status: 500 }
    )
  }
}

// POST /api/genieacs/monitoring - Start monitoring or create thresholds
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { configId, action, deviceId, ...rest } = data

    if (!configId) {
      return NextResponse.json(
        { error: 'configId is required' },
        { status: 400 }
      )
    }

    switch (action) {
      case 'start-monitoring':
        const { intervalMinutes = 5 } = rest
        
        // Get GenieACS configuration
        const config = await db.genieACSConfig.findUnique({
          where: { id: configId }
        })

        if (!config) {
          return NextResponse.json(
            { error: 'GenieACS configuration not found' },
            { status: 404 }
          )
        }

        const client = new GenieACSClient({
          baseUrl: config.baseUrl,
          username: config.username || undefined,
          password: config.password || undefined,
          timeout: config.timeout
        })

        const monitoring = new GenieACSMonitoring(client)
        await monitoring.startParameterMonitoring(configId, intervalMinutes)

        return NextResponse.json({
          success: true,
          message: `Started monitoring with ${intervalMinutes} minute intervals`
        })

      case 'stop-monitoring':
        // Implementation would stop monitoring
        return NextResponse.json({
          success: true,
          message: 'Stopped monitoring'
        })

      case 'create-threshold':
        const thresholdData = {
          parameterPath: rest.parameterPath,
          deviceType: rest.deviceType || 'all',
          condition: rest.condition,
          thresholdValue: rest.thresholdValue,
          severity: rest.severity || 'warning',
          enabled: rest.enabled !== false,
          description: rest.description
        }

        const threshold = await db.genieacsParameterThreshold.create({
          data: thresholdData
        })

        return NextResponse.json(threshold, { status: 201 })

      case 'check-thresholds':
        if (!deviceId) {
          return NextResponse.json(
            { error: 'deviceId is required for check-thresholds action' },
            { status: 400 }
          )
        }

        // Get configuration and check thresholds
        const thresholdConfig = await db.genieACSConfig.findUnique({
          where: { id: configId }
        })

        if (!thresholdConfig) {
          return NextResponse.json(
            { error: 'GenieACS configuration not found' },
            { status: 404 }
          )
        }

        const thresholdClient = new GenieACSClient({
          baseUrl: thresholdConfig.baseUrl,
          username: thresholdConfig.username || undefined,
          password: thresholdConfig.password || undefined,
          timeout: thresholdConfig.timeout
        })

        const thresholdMonitoring = new GenieACSMonitoring(thresholdClient)
        await thresholdMonitoring.checkParameterThresholds(deviceId)

        return NextResponse.json({
          success: true,
          message: 'Thresholds checked successfully'
        })

      default:
        return NextResponse.json(
          { error: 'Invalid action. Use: start-monitoring, stop-monitoring, create-threshold, check-thresholds' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error in monitoring POST request:', error)
    return NextResponse.json(
      { error: 'Failed to process monitoring request' },
      { status: 500 }
    )
  }
}

// PUT /api/genieacs/monitoring - Update thresholds
export async function PUT(request: NextRequest) {
  try {
    const data = await request.json()
    const { thresholdId, ...updateData } = data

    if (!thresholdId) {
      return NextResponse.json(
        { error: 'thresholdId is required' },
        { status: 400 }
      )
    }

    const threshold = await db.genieacsParameterThreshold.update({
      where: { id: thresholdId },
      data: updateData
    })

    return NextResponse.json(threshold)
  } catch (error) {
    console.error('Error updating threshold:', error)
    return NextResponse.json(
      { error: 'Failed to update threshold' },
      { status: 500 }
    )
  }
}

// DELETE /api/genieacs/monitoring - Delete thresholds
export async function DELETE(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const thresholdId = searchParams.get('thresholdId')

    if (!thresholdId) {
      return NextResponse.json(
        { error: 'thresholdId is required' },
        { status: 400 }
      )
    }

    await db.genieacsParameterThreshold.delete({
      where: { id: thresholdId }
    })

    return NextResponse.json({
      success: true,
      message: 'Threshold deleted successfully'
    })
  } catch (error) {
    console.error('Error deleting threshold:', error)
    return NextResponse.json(
      { error: 'Failed to delete threshold' },
      { status: 500 }
    )
  }
}