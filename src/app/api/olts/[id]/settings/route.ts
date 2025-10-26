import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const olt = await db.oLT.findUnique({
      where: { id: params.id },
      select: {
        id: true,
        name: true,
        ipAddress: true,
        model: true,
        location: true,
        description: true,
        snmpCommunity: true,
        snmpPort: true,
        telnetPort: true,
        sshPort: true,
        webPort: true,
        monitoringInterval: true,
        alertThresholds: true,
        vlanConfig: true
      }
    })

    if (!olt) {
      return NextResponse.json({ error: 'OLT not found' }, { status: 404 })
    }

    return NextResponse.json(olt)
  } catch (error) {
    console.error('Failed to fetch OLT settings:', error)
    return NextResponse.json({ error: 'Failed to fetch OLT settings' }, { status: 500 })
  }
}

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    
    const updatedOLT = await db.oLT.update({
      where: { id: params.id },
      data: {
        name: body.name,
        ipAddress: body.ipAddress,
        model: body.model,
        location: body.location,
        description: body.description,
        snmpCommunity: body.snmpCommunity,
        snmpPort: body.snmpPort,
        telnetPort: body.telnetPort,
        sshPort: body.sshPort,
        webPort: body.webPort,
        monitoringInterval: body.monitoringInterval,
        alertThresholds: body.alertThresholds,
        vlanConfig: body.vlanConfig,
        updatedAt: new Date()
      }
    })

    return NextResponse.json(updatedOLT)
  } catch (error) {
    console.error('Failed to update OLT settings:', error)
    return NextResponse.json({ error: 'Failed to update OLT settings' }, { status: 500 })
  }
}