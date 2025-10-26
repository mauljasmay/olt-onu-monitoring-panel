import { NextRequest, NextResponse } from 'next/server'

// Validation schema for contact form (simple validation without zod)
function validateContactData(data: any) {
  const errors: string[] = []
  
  if (!data.name || data.name.length < 2) {
    errors.push('Name must be at least 2 characters')
  }
  
  if (!data.email || !data.email.includes('@')) {
    errors.push('Valid email address is required')
  }
  
  if (!data.phone || data.phone.length < 10) {
    errors.push('Phone number must be at least 10 characters')
  }
  
  return errors
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Validate the request body
    const validationErrors = validateContactData(body)
    if (validationErrors.length > 0) {
      return NextResponse.json({
        success: false,
        message: 'Validation error',
        errors: validationErrors
      }, { status: 400 })
    }
    
    // Log the contact request (in production, you'd save to database)
    console.log('Contact form submission:', {
      ...body,
      timestamp: new Date().toISOString(),
      ip: request.ip || 'unknown'
    })
    
    // Here you would typically:
    // 1. Save to database
    // 2. Send email notification
    // 3. Create ticket in CRM system
    // 4. Send confirmation email to customer
    
    // Simulate processing time
    await new Promise(resolve => setTimeout(resolve, 1000))
    
    return NextResponse.json({
      success: true,
      message: 'Contact form submitted successfully',
      data: {
        id: `contact-${Date.now()}`,
        name: body.name,
        email: body.email,
        plan: body.plan
      }
    })
    
  } catch (error) {
    console.error('Contact form error:', error)
    
    return NextResponse.json({
      success: false,
      message: 'Internal server error'
    }, { status: 500 })
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Contact API endpoint',
    methods: ['POST']
  })
}