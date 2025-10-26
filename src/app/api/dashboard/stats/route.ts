import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    // Get OLT stats
    const totalOLT = await db.oLT.count()
    const onlineOLT = await db.oLT.count({
      where: { status: 'online' }
    })

    // Get ONU stats
    const totalONU = await db.oNU.count()
    const onlineONU = await db.oNU.count({
      where: { status: 'online' }
    })

    // Get alert stats
    const criticalAlerts = await db.alert.count({
      where: {
        type: 'critical',
        status: 'active'
      }
    })

    const warningAlerts = await db.alert.count({
      where: {
        type: 'warning',
        status: 'active'
      }
    })

    // Get GenieACS stats
    const genieacsConfigs = await db.genieACSConfig.count({
      where: { isActive: true }
    })

    const syncedOLTs = await db.oLT.count({
      where: { 
        genieacsSynced: true,
        genieacsDeviceId: { not: null }
      }
    })

    const syncedONUs = await db.oNU.count({
      where: { 
        genieacsSynced: true,
        genieacsDeviceId: { not: null }
      }
    })

    const stats = {
      totalOLT,
      onlineOLT,
      totalONU,
      onlineONU,
      criticalAlerts,
      warningAlerts,
      genieacs: {
        activeConfigs: genieacsConfigs,
        syncedOLTs,
        syncedONUs
      }
    }

    return NextResponse.json(stats)
  } catch (error) {
    console.error('Error fetching dashboard stats:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard stats' },
      { status: 500 }
    )
  }
}