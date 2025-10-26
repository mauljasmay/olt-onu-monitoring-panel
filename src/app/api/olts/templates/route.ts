import { NextRequest, NextResponse } from 'next/server'

export async function POST(request: NextRequest) {
  try {
    const { model } = await request.json()

    const templates = {
      'TMO-4EP-4SX-4G-OLT': {
        model: 'TMO-4EP-4SX-4G-OLT',
        snmpCommunity: 'public',
        snmpPort: 161,
        telnetPort: 23,
        sshPort: 22,
        webPort: 80,
        monitoringInterval: 300,
        alertThresholds: {
          cpuWarning: 75,
          cpuCritical: 90,
          memoryWarning: 75,
          memoryCritical: 90,
          temperatureWarning: 65,
          temperatureCritical: 80
        },
        vlanConfig: {
          management: 1,
          internet: 100,
          voip: 200,
          iptv: 300
        },
        description: 'TMO 4EP-4SX-4G OLT with 4 Ethernet Ports, 4 SX SFP, and 4G Uplink'
      },
      'ZTE-C320': {
        model: 'ZTE-C320',
        snmpCommunity: 'zte',
        snmpPort: 161,
        telnetPort: 23,
        sshPort: 22,
        webPort: 80,
        monitoringInterval: 300,
        alertThresholds: {
          cpuWarning: 70,
          cpuCritical: 85,
          memoryWarning: 70,
          memoryCritical: 85,
          temperatureWarning: 60,
          temperatureCritical: 75
        },
        vlanConfig: {
          management: 1,
          internet: 100,
          voip: 200,
          iptv: 300
        },
        description: 'ZTE C320 GPON OLT System'
      },
      'Huawei-MA5800': {
        model: 'Huawei-MA5800',
        snmpCommunity: 'huawei',
        snmpPort: 161,
        telnetPort: 23,
        sshPort: 22,
        webPort: 443,
        monitoringInterval: 300,
        alertThresholds: {
          cpuWarning: 70,
          cpuCritical: 90,
          memoryWarning: 70,
          memoryCritical: 90,
          temperatureWarning: 60,
          temperatureCritical: 75
        },
        vlanConfig: {
          management: 1,
          internet: 100,
          voip: 200,
          iptv: 300
        },
        description: 'Huawei MA5800 SmartAX OLT'
      }
    }

    const template = templates[model as keyof typeof templates]
    
    if (!template) {
      return NextResponse.json({ error: 'Template not found' }, { status: 404 })
    }

    return NextResponse.json({
      ...template,
      alertThresholds: JSON.stringify(template.alertThresholds),
      vlanConfig: JSON.stringify(template.vlanConfig)
    })
  } catch (error) {
    console.error('Failed to get template:', error)
    return NextResponse.json({ error: 'Failed to get template' }, { status: 500 })
  }
}