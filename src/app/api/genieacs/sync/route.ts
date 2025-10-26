import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { GenieACSClient } from '@/lib/genieacs'

// POST /api/genieacs/sync - Sync devices from GenieACS
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { configId, deviceType = 'all' } = data

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

    // Fetch devices from GenieACS
    const genieDevices = await client.getDevices()
    
    let syncedDevices = 0
    let errors = []

    // Process each device
    for (const device of genieDevices) {
      try {
        const serialNumber = device._serialNumber
        const manufacturer = device._manufacturer || 'Unknown'
        const model = device._productId || 'Unknown'
        const lastInform = device._lastInform ? new Date(device._lastInform) : null
        const isOnline = lastInform && (Date.now() - lastInform.getTime()) < 5 * 60 * 1000

        // Determine device type based on manufacturer/model
        const isOLT = manufacturer.toLowerCase().includes('huawei') || 
                     manufacturer.toLowerCase().includes('zte') ||
                     manufacturer.toLowerCase().includes('nokia') ||
                     model.toLowerCase().includes('olt')

        if (deviceType === 'all' || (deviceType === 'olt' && isOLT) || (deviceType === 'onu' && !isOLT)) {
          if (isOLT) {
            // Sync OLT
            await syncOLT(device, client)
          } else {
            // Sync ONU
            await syncONU(device, client)
          }
          syncedDevices++
        }
      } catch (error) {
        console.error(`Error syncing device ${device._id}:`, error)
        errors.push({
          deviceId: device._id,
          error: error instanceof Error ? error.message : 'Unknown error'
        })
      }
    }

    // Update last sync time
    await db.genieACSConfig.update({
      where: { id: configId },
      data: { lastSync: new Date() }
    })

    return NextResponse.json({
      success: true,
      syncedDevices,
      totalDevices: genieDevices.length,
      errors: errors.length > 0 ? errors : undefined
    })
  } catch (error) {
    console.error('Error syncing GenieACS devices:', error)
    return NextResponse.json(
      { error: 'Failed to sync devices from GenieACS' },
      { status: 500 }
    )
  }
}

async function syncOLT(device: any, client: any) {
  const serialNumber = device._serialNumber
  const manufacturer = device._manufacturer || 'Unknown'
  const model = device._productId || 'Unknown'
  const lastInform = device._lastInform ? new Date(device._lastInform) : null
  const isOnline = lastInform && (Date.now() - lastInform.getTime()) < 5 * 60 * 1000

  // Check if OLT already exists
  let olt = await db.oLT.findFirst({
    where: { 
      OR: [
        { genieacsDeviceId: device._id },
        { name: `OLT-${serialNumber}` }
      ]
    }
  })

  if (olt) {
    // Update existing OLT
    olt = await db.oLT.update({
      where: { id: olt.id },
      data: {
        name: olt.name || `OLT-${serialNumber}`,
        model: olt.model || model,
        status: isOnline ? 'online' : 'offline',
        lastSeen: lastInform,
        genieacsDeviceId: device._id,
        genieacsSynced: true,
        genieacsLastSync: new Date(),
        updatedAt: new Date()
      }
    })
  } else {
    // Create new OLT
    olt = await db.oLT.create({
      data: {
        name: `OLT-${serialNumber}`,
        ipAddress: '0.0.0.0', // Will be updated from device parameters
        model,
        status: isOnline ? 'online' : 'offline',
        lastSeen: lastInform,
        genieacsDeviceId: device._id,
        genieacsSynced: true,
        genieacsLastSync: new Date()
      }
    })
  }

  // Try to get additional parameters
  try {
    const parameters = await client.getDeviceParameters(device._id, [
      'InternetGatewayDevice.DeviceInfo.HardwareVersion',
      'InternetGatewayDevice.DeviceInfo.SoftwareVersion',
      'InternetGatewayDevice.ManagementServer.ConnectionRequestURL',
      'InternetGatewayDevice.LANDevice.1.Hosts.HostNumberOfEntries'
    ])

    let ipAddress = '0.0.0.0'
    let onuCount = 0

    for (const param of parameters) {
      if (param.path.includes('ConnectionRequestURL')) {
        // Extract IP from connection request URL
        const match = param.value?.match(/http:\/\/([\d.]+):/)
        if (match) {
          ipAddress = match[1]
        }
      }
      if (param.path.includes('HostNumberOfEntries')) {
        onuCount = parseInt(param.value) || 0
      }
    }

    // Update OLT with additional info
    await db.oLT.update({
      where: { id: olt.id },
      data: {
        ipAddress,
        onuCount,
        activeONU: isOnline ? onuCount : 0
      }
    })
  } catch (error) {
    console.warn(`Could not fetch additional parameters for OLT ${device._id}:`, error)
  }
}

async function syncONU(device: any, client: any) {
  const serialNumber = device._serialNumber
  const manufacturer = device._manufacturer || 'Unknown'
  const model = device._productId || 'Unknown'
  const lastInform = device._lastInform ? new Date(device._lastInform) : null
  const isOnline = lastInform && (Date.now() - lastInform.getTime()) < 5 * 60 * 1000

  // Check if ONU already exists
  let onu = await db.oNU.findFirst({
    where: { 
      OR: [
        { genieacsDeviceId: device._id },
        { serialNumber }
      ]
    }
  })

  if (onu) {
    // Update existing ONU
    onu = await db.oNU.update({
      where: { id: onu.id },
      data: {
        name: onu.name || `ONU-${serialNumber}`,
        status: isOnline ? 'online' : 'offline',
        lastSeen: lastInform,
        genieacsDeviceId: device._id,
        genieacsSynced: true,
        genieacsLastSync: new Date(),
        updatedAt: new Date()
      }
    })
  } else {
    // Create new ONU (need to associate with an OLT)
    // For now, create without OLT association - user can manually assign later
    onu = await db.oNU.create({
      data: {
        name: `ONU-${serialNumber}`,
        serialNumber,
        oltId: 'default', // This should be updated by user
        port: 1,
        status: isOnline ? 'online' : 'offline',
        lastSeen: lastInform,
        genieacsDeviceId: device._id,
        genieacsSynced: true,
        genieacsLastSync: new Date()
      }
    })
  }

  // Try to get additional parameters
  try {
    const parameters = await client.getDeviceParameters(device._id, [
      'InternetGatewayDevice.WANDevice.1.WANConnectionDevice.1.WANIPConnection.1.ExternalIPAddress',
      'InternetGatewayDevice.DeviceInfo.X_CT-COM_MgtDevIp',
      'InternetGatewayDevice.DeviceInfo.X_CT-COM_UplinkRate',
      'InternetGatewayDevice.DeviceInfo.X_CT-COM_DownlinkRate'
    ])

    let ipAddress = null
    let rxPower = 0
    let txPower = 0

    for (const param of parameters) {
      if (param.path.includes('ExternalIPAddress') || param.path.includes('MgtDevIp')) {
        ipAddress = param.value
      }
      // Add more parameter parsing as needed
    }

    // Update ONU with additional info
    await db.oNU.update({
      where: { id: onu.id },
      data: {
        ipAddress,
        rxPower,
        txPower
      }
    })
  } catch (error) {
    console.warn(`Could not fetch additional parameters for ONU ${device._id}:`, error)
  }
}