import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { GenieACSClient } from '@/lib/genieacs'

// GET /api/genieacs/devices - Get devices from GenieACS
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const configId = searchParams.get('configId')
    const deviceType = searchParams.get('type') // 'olt', 'onu', or 'all'
    const online = searchParams.get('online') // 'true', 'false', or undefined

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

    // Initialize GenieACS client
    const client = new GenieACSClient({
      baseUrl: config.baseUrl,
      username: config.username || undefined,
      password: config.password || undefined,
      timeout: config.timeout
    })

    // Build query filter
    let query = ''
    
    if (deviceType && deviceType !== 'all') {
      const manufacturers = deviceType === 'olt' 
        ? ['Huawei', 'ZTE', 'Nokia', 'FiberHome', 'Calix']
        : ['Unknown'] // Exclude known OLT manufacturers for ONUs
      
      if (deviceType === 'olt') {
        query += `(${manufacturers.map(m => `_manufacturer:"${m}"`).join(' OR ')})`
      }
    }

    if (online === 'true') {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
      if (query) query += ' AND '
      query += `_lastInform:[${fiveMinutesAgo} TO *]`
    } else if (online === 'false') {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
      if (query) query += ' AND '
      query += `_lastInform:[* TO ${fiveMinutesAgo}]`
    }

    // Fetch devices from GenieACS
    const devices = await client.getDevices(query || undefined)

    // Enhance device data with local database info
    const enhancedDevices = await Promise.all(
      devices.map(async (device: any) => {
        // Check if device exists in local database
        const localOLT = await db.oLT.findFirst({
          where: { genieacsDeviceId: device._id }
        })
        
        const localONU = await db.oNU.findFirst({
          where: { genieacsDeviceId: device._id }
        })

        const lastInform = device._lastInform ? new Date(device._lastInform) : null
        const isOnline = lastInform && (Date.now() - lastInform.getTime()) < 5 * 60 * 1000

        return {
          ...device,
          _isOnline: isOnline,
          _lastInformFormatted: lastInform?.toISOString(),
          _localDevice: localOLT || localONU,
          _deviceType: localOLT ? 'olt' : localONU ? 'onu' : 'unknown'
        }
      })
    )

    return NextResponse.json(enhancedDevices)
  } catch (error) {
    console.error('Error fetching GenieACS devices:', error)
    return NextResponse.json(
      { error: 'Failed to fetch devices from GenieACS' },
      { status: 500 }
    )
  }
}

// POST /api/genieacs/devices - Execute device operations
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { configId, deviceId, operation, parameters } = data

    if (!configId || !deviceId || !operation) {
      return NextResponse.json(
        { error: 'configId, deviceId, and operation are required' },
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

    // Initialize GenieACS client
    const client = new GenieACSClient({
      baseUrl: config.baseUrl,
      username: config.username || undefined,
      password: config.password || undefined,
      timeout: config.timeout
    })

    let result

    switch (operation) {
      case 'reboot':
        result = await client.createTask(deviceId, 'reboot()', 'Reboot Device')
        break

      case 'factoryReset':
        result = await client.createTask(deviceId, 'factoryReset()', 'Factory Reset')
        break

      case 'connectionRequest':
        result = await client.connectionRequest(deviceId)
        break

      case 'setParameter':
        if (!parameters || !parameters.path || parameters.value === undefined) {
          return NextResponse.json(
            { error: 'path and value are required for setParameter operation' },
            { status: 400 }
          )
        }
        await client.setDeviceParameter(deviceId, parameters.path, parameters.value)
        result = { success: true, message: 'Parameter set successfully' }
        break

      case 'setParameters':
        if (!parameters || typeof parameters !== 'object') {
          return NextResponse.json(
            { error: 'parameters object is required for setParameters operation' },
            { status: 400 }
          )
        }
        await client.setDeviceParameters(deviceId, parameters)
        result = { success: true, message: 'Parameters set successfully' }
        break

      case 'getParameters':
        const paths = Array.isArray(parameters) ? parameters : undefined
        result = await client.getDeviceParameters(deviceId, paths)
        break

      default:
        return NextResponse.json(
          { error: `Unsupported operation: ${operation}` },
          { status: 400 }
        )
    }

    // Log the operation
    await db.genieACSTask.create({
      data: {
        taskId: result._id || 'local-' + Date.now(),
        deviceType: 'unknown', // Could be determined from local DB
        deviceId,
        taskType: operation,
        status: result._id ? 'pending' : 'completed',
        script: JSON.stringify(parameters),
        result: JSON.stringify(result)
      }
    })

    return NextResponse.json(result)
  } catch (error) {
    console.error('Error executing GenieACS device operation:', error)
    return NextResponse.json(
      { error: 'Failed to execute device operation' },
      { status: 500 }
    )
  }
}