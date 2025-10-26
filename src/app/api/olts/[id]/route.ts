import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { id } = params

    // Check if OLT exists
    const existingOLT = await db.oLT.findUnique({
      where: { id },
      include: {
        onus: {
          select: { id: true }
        },
        alerts: {
          select: { id: true }
        }
      }
    })

    if (!existingOLT) {
      return NextResponse.json(
        { error: 'OLT not found' },
        { status: 404 }
      )
    }

    // Delete OLT and all related data (cascade delete should handle this)
    await db.oLT.delete({
      where: { id }
    })

    return NextResponse.json({
      message: `OLT ${existingOLT.name} berhasil dihapus`,
      deletedData: {
        olt: existingOLT.name,
        onusCount: existingOLT.onus.length,
        alertsCount: existingOLT.alerts.length
      }
    })
  } catch (error) {
    console.error('Error deleting OLT:', error)
    return NextResponse.json(
      { error: 'Failed to delete OLT' },
      { status: 500 }
    )
  }
}