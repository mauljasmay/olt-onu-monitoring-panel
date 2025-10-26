import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')
    const oltId = searchParams.get('oltId')

    let whereClause: any = {}
    
    if (status && status !== 'all') {
      whereClause.status = status
    }
    
    if (oltId && oltId !== 'all') {
      whereClause.oltId = oltId
    }
    
    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { serialNumber: { contains: search } },
        { customerName: { contains: search } },
        { ipAddress: { contains: search } }
      ]
    }

    const onus = await db.oNU.findMany({
      where: whereClause,
      include: {
        olt: {
          select: {
            id: true,
            name: true
          }
        },
        alerts: {
          where: {
            status: 'active'
          },
          select: {
            id: true,
            type: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      }
    })

    const formattedONUS = onus.map(onu => ({
      id: onu.id,
      name: onu.name,
      serialNumber: onu.serialNumber,
      oltId: onu.oltId,
      oltName: onu.olt.name,
      port: onu.port,
      status: onu.status,
      signalStrength: onu.signalStrength,
      rxPower: onu.rxPower,
      txPower: onu.txPower,
      distance: onu.distance,
      uptime: formatUptime(onu.uptime),
      lastSeen: onu.lastSeen ? formatLastSeen(onu.lastSeen) : 'Never',
      customerName: onu.customerName,
      ipAddress: onu.ipAddress,
      criticalAlerts: onu.alerts.filter(alert => alert.type === 'critical').length,
      warningAlerts: onu.alerts.filter(alert => alert.type === 'warning').length
    }))

    return NextResponse.json(formattedONUS)
  } catch (error) {
    console.error('Error fetching ONUs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch ONUs' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, serialNumber, oltId, port, customerName, ipAddress } = body

    if (!name || !serialNumber || !oltId || !port) {
      return NextResponse.json(
        { error: 'Name, serial number, OLT ID, and port are required' },
        { status: 400 }
      )
    }

    // Check if serial number already exists
    const existingONU = await db.oNU.findUnique({
      where: { serialNumber }
    })

    if (existingONU) {
      return NextResponse.json(
        { error: 'ONU with this serial number already exists' },
        { status: 409 }
      )
    }

    // Check if OLT exists
    const olt = await db.oLT.findUnique({
      where: { id: oltId }
    })

    if (!olt) {
      return NextResponse.json(
        { error: 'OLT not found' },
        { status: 404 }
      )
    }

    const onu = await db.oNU.create({
      data: {
        name,
        serialNumber,
        oltId,
        port,
        customerName,
        ipAddress,
        status: 'offline'
      }
    })

    return NextResponse.json(onu, { status: 201 })
  } catch (error) {
    console.error('Error creating ONU:', error)
    return NextResponse.json(
      { error: 'Failed to create ONU' },
      { status: 500 }
    )
  }
}

function formatUptime(seconds: number): string {
  if (seconds === 0) return '0 hari 0 jam'
  
  const days = Math.floor(seconds / 86400)
  const hours = Math.floor((seconds % 86400) / 3600)
  
  return `${days} hari ${hours} jam`
}

function formatLastSeen(date: Date): string {
  const now = new Date()
  const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000)
  
  if (diffInSeconds < 60) return 'Baru saja'
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} menit yang lalu`
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} jam yang lalu`
  return `${Math.floor(diffInSeconds / 86400)} hari yang lalu`
}