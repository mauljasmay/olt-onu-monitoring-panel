import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { GenieACSClient, initializeGenieACS } from '@/lib/genieacs'

// GET /api/genieacs/config - Get all GenieACS configurations
export async function GET() {
  try {
    const configs = await db.genieACSConfig.findMany({
      orderBy: { createdAt: 'desc' }
    })

    // Remove password from response for security
    const sanitizedConfigs = configs.map(config => ({
      ...config,
      password: config.password ? '***' : null
    }))

    return NextResponse.json(sanitizedConfigs)
  } catch (error) {
    console.error('Error fetching GenieACS configs:', error)
    return NextResponse.json(
      { error: 'Failed to fetch GenieACS configurations' },
      { status: 500 }
    )
  }
}

// POST /api/genieacs/config - Create new GenieACS configuration
export async function POST(request: NextRequest) {
  try {
    const data = await request.json()
    const { name, baseUrl, username, password, timeout = 30000, description } = data

    // Validate required fields
    if (!name || !baseUrl) {
      return NextResponse.json(
        { error: 'Name and baseUrl are required' },
        { status: 400 }
      )
    }

    // Check if name already exists
    const existingConfig = await db.genieACSConfig.findUnique({
      where: { name }
    })

    if (existingConfig) {
      return NextResponse.json(
        { error: 'Configuration with this name already exists' },
        { status: 409 }
      )
    }

    // Test connection to GenieACS
    const testClient = new GenieACSClient({
      baseUrl,
      username,
      password,
      timeout
    })

    const isHealthy = await testClient.healthCheck()
    if (!isHealthy) {
      return NextResponse.json(
        { error: 'Failed to connect to GenieACS server' },
        { status: 400 }
      )
    }

    // Create configuration
    const config = await db.genieACSConfig.create({
      data: {
        name,
        baseUrl,
        username,
        password, // In production, encrypt this
        timeout,
        description
      }
    })

    // Initialize the client if this is the first active config
    if (config.isActive) {
      initializeGenieACS({
        baseUrl: config.baseUrl,
        username: config.username || undefined,
        password: config.password || undefined,
        timeout: config.timeout
      })
    }

    return NextResponse.json(config, { status: 201 })
  } catch (error) {
    console.error('Error creating GenieACS config:', error)
    return NextResponse.json(
      { error: 'Failed to create GenieACS configuration' },
      { status: 500 }
    )
  }
}