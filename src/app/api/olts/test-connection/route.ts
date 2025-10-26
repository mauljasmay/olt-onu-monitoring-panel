import { NextRequest, NextResponse } from 'next/server'
import ZAI from 'z-ai-web-dev-sdk'

export async function POST(request: NextRequest) {
  try {
    const { ipAddress, snmpCommunity, snmpPort } = await request.json()

    // Simulate connection test using AI to generate realistic test results
    const zai = await ZAI.create()
    
    const prompt = `Simulate an OLT connection test for IP ${ipAddress} with SNMP community "${snmpCommunity}" on port ${snmpPort}. 
    Generate a realistic test result that includes:
    - Connection success/failure status
    - Response time in milliseconds
    - Device information if successful
    - Error message if failed
    
    Return only a JSON object with these fields:
    {
      "success": boolean,
      "responseTime": number,
      "deviceInfo": {
        "model": string,
        "firmware": string,
        "uptime": string
      } | null,
      "error": string | null
    }`

    const completion = await zai.chat.completions.create({
      messages: [
        {
          role: 'system',
          content: 'You are a network monitoring system that simulates OLT connection tests. Generate realistic results.'
        },
        {
          role: 'user',
          content: prompt
        }
      ],
      temperature: 0.3,
      max_tokens: 200
    })

    const result = JSON.parse(completion.choices[0].message.content || '{}')

    // Add some randomness to make it more realistic
    const responseTime = Math.floor(Math.random() * 100) + 20
    result.responseTime = responseTime

    // Simulate 80% success rate for demo purposes
    if (Math.random() > 0.8) {
      result.success = false
      result.error = "Connection timeout - Device not responding"
      result.deviceInfo = null
    }

    return NextResponse.json(result)
  } catch (error) {
    console.error('Connection test failed:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Connection test failed',
        responseTime: 0,
        deviceInfo: null
      }, 
      { status: 500 }
    )
  }
}