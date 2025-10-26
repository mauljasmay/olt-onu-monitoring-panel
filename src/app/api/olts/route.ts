import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const status = searchParams.get('status')
    const search = searchParams.get('search')

    let whereClause: any = {}
    
    if (status && status !== 'all') {
      whereClause.status = status
    }
    
    if (search) {
      whereClause.OR = [
        { name: { contains: search } },
        { ipAddress: { contains: search } },
        { model: { contains: search } }
      ]
    }

    const olts = await db.oLT.findMany({
      where: whereClause,
      include: {
        onus: {
          select: {
            id: true,
            status: true
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

    const formattedOLTS = olts.map(olt => ({
      id: olt.id,
      name: olt.name,
      ip: olt.ipAddress,
      model: olt.model,
      status: olt.status,
      uptime: formatUptime(olt.uptime),
      cpuUsage: olt.cpuUsage,
      memoryUsage: olt.memoryUsage,
      temperature: olt.temperature,
      onuCount: olt.onus.length,
      activeONU: olt.onus.filter(onu => onu.status === 'online').length,
      lastSeen: olt.lastSeen ? formatLastSeen(olt.lastSeen) : 'Never',
      criticalAlerts: olt.alerts.filter(alert => alert.type === 'critical').length,
      warningAlerts: olt.alerts.filter(alert => alert.type === 'warning').length
    }))

    return NextResponse.json(formattedOLTS)
  } catch (error) {
    console.error('Error fetching OLTs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch OLTs' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, ipAddress, model, snmpCommunity, snmpPort, location } = body

    if (!name || !ipAddress || !model) {
      return NextResponse.json(
        { error: 'Name, IP address, and model are required' },
        { status: 400 }
      )
    }

    // Check if IP address already exists
    const existingOLT = await db.oLT.findUnique({
      where: { ipAddress }
    })

    if (existingOLT) {
      return NextResponse.json(
        { error: 'OLT with this IP address already exists' },
        { status: 409 }
      )
    }

    const olt = await db.oLT.create({
      data: {
        name,
        ipAddress,
        model,
        location: location || null,
        snmpCommunity: snmpCommunity || 'public',
        snmpPort: snmpPort || 161,
        status: 'offline',
        cpuUsage: 0,
        memoryUsage: 0,
        temperature: 0,
        uptime: 0,
        onuCount: 0,
        activeONU: 0,
        // Default alert thresholds as JSON
        alertThresholds: JSON.stringify({
          cpuWarning: 70,
          cpuCritical: 90,
          memoryWarning: 70,
          memoryCritical: 90,
          temperatureWarning: 60,
          temperatureCritical: 75
        }),
        // Default VLAN configuration as JSON
        vlanConfig: JSON.stringify({
          management: 1,
          internet: 100,
          voip: 200,
          iptv: 300
        })
      }
    })

    return NextResponse.json({
      ...olt,
      message: `OLT ${name} berhasil ditambahkan dengan konfigurasi SNMP ${ipAddress}:${snmpPort || 161}`
    }, { status: 201 })
  } catch (error) {
    console.error('Error creating OLT:', error)
    return NextResponse.json(
      { error: 'Failed to create OLT' },
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