import { GenieACSClient } from './genieacs'
import { db } from '@/lib/db'

export interface DeviceParameter {
  path: string
  value: any
  type: string
  writable: boolean
  notification: number
  timestamp: Date
  deviceId: string
}

export interface ParameterThreshold {
  id: string
  parameterPath: string
  deviceType: 'olt' | 'onu' | 'all'
  condition: 'greater_than' | 'less_than' | 'equals' | 'not_equals' | 'contains'
  thresholdValue: number | string
  severity: 'info' | 'warning' | 'critical'
  enabled: boolean
  description: string
}

export interface DeviceHealthScore {
  deviceId: string
  overallScore: number // 0-100
  connectivityScore: number
  performanceScore: number
  stabilityScore: number
  lastCalculated: Date
  factors: {
    uptime: number
    responseTime: number
    errorRate: number
    parameterHealth: number
  }
}

export interface FirmwareInfo {
  deviceId: string
  currentVersion: string
  availableVersion?: string
  updateStatus: 'up-to-date' | 'available' | 'updating' | 'failed'
  lastUpdateCheck: Date
  updateHistory: Array<{
    version: string
    timestamp: Date
    status: 'success' | 'failed'
    duration?: number
  }>
}

export class GenieACSMonitoring {
  private client: GenieACSClient
  private monitoringInterval: NodeJS.Timeout | null = null
  private parameterCache: Map<string, DeviceParameter[]> = new Map()

  constructor(client: GenieACSClient) {
    this.client = client
  }

  // Advanced Parameter Monitoring
  async startParameterMonitoring(configId: string, intervalMinutes: number = 5) {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
    }

    this.monitoringInterval = setInterval(async () => {
      await this.monitorAllDeviceParameters(configId)
    }, intervalMinutes * 60 * 1000)

    // Initial monitoring
    await this.monitorAllDeviceParameters(configId)
  }

  async stopParameterMonitoring() {
    if (this.monitoringInterval) {
      clearInterval(this.monitoringInterval)
      this.monitoringInterval = null
    }
  }

  private async monitorAllDeviceParameters(configId: string) {
    try {
      const devices = await this.client.getDevices()
      
      for (const device of devices) {
        await this.monitorDeviceParameters(device._id)
        await this.checkParameterThresholds(device._id)
        await this.calculateDeviceHealth(device._id)
      }
    } catch (error) {
      console.error('Error in parameter monitoring:', error)
    }
  }

  async monitorDeviceParameters(deviceId: string): Promise<DeviceParameter[]> {
    try {
      // Define critical parameters to monitor based on device type
      const criticalParams = await this.getCriticalParameters(deviceId)
      const parameters = await this.client.getDeviceParameters(deviceId, criticalParams)
      
      const deviceParameters: DeviceParameter[] = parameters.map(param => ({
        path: param.path,
        value: param.value,
        type: param.type || 'string',
        writable: param.writable || false,
        notification: param.notification || 0,
        timestamp: new Date(),
        deviceId
      }))

      // Cache parameters
      this.parameterCache.set(deviceId, deviceParameters)

      // Store in database
      await this.storeParameterHistory(deviceParameters)

      return deviceParameters
    } catch (error) {
      console.error(`Error monitoring parameters for device ${deviceId}:`, error)
      return []
    }
  }

  private async getCriticalParameters(deviceId: string): Promise<string[]> {
    try {
      const device = await this.client.getDevice(deviceId)
      const manufacturer = device._manufacturer?.toLowerCase() || ''
      const isOLT = manufacturer.includes('huawei') || manufacturer.includes('zte') || manufacturer.includes('nokia')

      if (isOLT) {
        return [
          'InternetGatewayDevice.DeviceInfo.HardwareVersion',
          'InternetGatewayDevice.DeviceInfo.SoftwareVersion',
          'InternetGatewayDevice.DeviceInfo.UpTime',
          'InternetGatewayDevice.DeviceInfo.ProcessorStatus',
          'InternetGatewayDevice.DeviceInfo.MemoryStatus.Total',
          'InternetGatewayDevice.DeviceInfo.MemoryStatus.Free',
          'InternetGatewayDevice.DeviceInfo.Temperature.Status',
          'InternetGatewayDevice.DeviceInfo.Temperature.Value',
          'InternetGatewayDevice.LANDevice.1.Hosts.HostNumberOfEntries',
          'InternetGatewayDevice.WANDevice.1.WANConnectionDevice.1.WANIPConnection.1.ExternalIPAddress',
          'InternetGatewayDevice.WANDevice.1.WANConnectionDevice.1.WANIPConnection.1.Stats',
          'InternetGatewayDevice.ManagementServer.ConnectionRequestURL',
          'InternetGatewayDevice.Layer2Bridging.BridgeNumberOfEntries',
          'InternetGatewayDevice.QueueManagement.NumberOfQueues'
        ]
      } else {
        // ONU parameters
        return [
          'InternetGatewayDevice.DeviceInfo.HardwareVersion',
          'InternetGatewayDevice.DeviceInfo.SoftwareVersion',
          'InternetGatewayDevice.DeviceInfo.UpTime',
          'InternetGatewayDevice.WANDevice.1.WANConnectionDevice.1.WANIPConnection.1.ExternalIPAddress',
          'InternetGatewayDevice.WANDevice.1.WANConnectionDevice.1.WANIPConnection.1.Stats',
          'InternetGatewayDevice.LANDevice.1.LANHostConfigManagement.IPInterface.1.IPInterfaceIPAddress',
          'InternetGatewayDevice.DeviceInfo.X_CT-COM_MgtDevIp',
          'InternetGatewayDevice.DeviceInfo.X_CT-COM_UplinkRate',
          'InternetGatewayDevice.DeviceInfo.X_CT-COM_DownlinkRate',
          'InternetGatewayDevice.DeviceInfo.X_CT-COM_OpticalSignal',
          'InternetGatewayDevice.DeviceInfo.X_CT-COM_Temperature',
          'InternetGatewayDevice.DeviceInfo.X_CT-COM_Voltage',
          'InternetGatewayDevice.DeviceInfo.X_CT-COM_BiasCurrent',
          'InternetGatewayDevice.DeviceInfo.X_CT-COM_TransmitPower',
          'InternetGatewayDevice.DeviceInfo.X_CT-COM_ReceivePower'
        ]
      }
    } catch (error) {
      console.error('Error getting critical parameters:', error)
      return []
    }
  }

  private async storeParameterHistory(parameters: DeviceParameter[]) {
    try {
      const monitoringLogs = parameters.map(param => ({
        deviceId: param.deviceId,
        deviceType: 'genieacs', // Could be determined from device ID
        metric: param.path.split('.').pop() || param.path,
        value: typeof param.value === 'number' ? param.value : 0,
        unit: this.getParameterUnit(param.path),
        timestamp: param.timestamp
      }))

      await db.monitoringLog.createMany({
        data: monitoringLogs,
        skipDuplicates: true
      })
    } catch (error) {
      console.error('Error storing parameter history:', error)
    }
  }

  private getParameterUnit(parameterPath: string): string {
    if (parameterPath.includes('Temperature')) return '°C'
    if (parameterPath.includes('Voltage')) return 'V'
    if (parameterPath.includes('Power')) return 'dBm'
    if (parameterPath.includes('Rate') || parameterPath.includes('Speed')) return 'Mbps'
    if (parameterPath.includes('Memory')) return 'MB'
    if (parameterPath.includes('Time') || parameterPath.includes('UpTime')) return 'seconds'
    return ''
  }

  // Parameter Threshold Monitoring
  async createParameterThreshold(threshold: Omit<ParameterThreshold, 'id'>): Promise<ParameterThreshold> {
    try {
      const created = await db.genieacsParameterThreshold.create({
        data: threshold
      })
      return created
    } catch (error) {
      console.error('Error creating parameter threshold:', error)
      throw error
    }
  }

  async checkParameterThresholds(deviceId: string) {
    try {
      const thresholds = await db.genieacsParameterThreshold.findMany({
        where: { enabled: true }
      })

      const deviceParameters = this.parameterCache.get(deviceId) || []
      
      for (const threshold of thresholds) {
        const parameter = deviceParameters.find(p => p.path === threshold.parameterPath)
        if (!parameter) continue

        const isTriggered = this.evaluateThreshold(
          parameter.value,
          threshold.condition,
          threshold.thresholdValue
        )

        if (isTriggered) {
          await this.createThresholdAlert(deviceId, threshold, parameter.value)
        }
      }
    } catch (error) {
      console.error('Error checking parameter thresholds:', error)
    }
  }

  private evaluateThreshold(
    value: any,
    condition: string,
    threshold: number | string
  ): boolean {
    const numValue = typeof value === 'number' ? value : parseFloat(value)
    const numThreshold = typeof threshold === 'number' ? threshold : parseFloat(threshold)

    if (isNaN(numValue) || isNaN(numThreshold)) {
      // String comparison
      const strValue = String(value)
      const strThreshold = String(threshold)

      switch (condition) {
        case 'equals': return strValue === strThreshold
        case 'not_equals': return strValue !== strThreshold
        case 'contains': return strValue.includes(strThreshold)
        default: return false
      }
    }

    // Numeric comparison
    switch (condition) {
      case 'greater_than': return numValue > numThreshold
      case 'less_than': return numValue < numThreshold
      case 'equals': return numValue === numThreshold
      case 'not_equals': return numValue !== numThreshold
      default: return false
    }
  }

  private async createThresholdAlert(
    deviceId: string,
    threshold: ParameterThreshold,
    currentValue: any
  ) {
    try {
      // Check if alert already exists for this threshold and device
      const existingAlert = await db.alert.findFirst({
        where: {
          deviceId,
          type: threshold.severity,
          title: `Parameter Threshold: ${threshold.parameterPath}`,
          status: 'active'
        }
      })

      if (existingAlert) return // Alert already exists

      await db.alert.create({
        data: {
          type: threshold.severity,
          title: `Parameter Threshold: ${threshold.parameterPath}`,
          description: `${threshold.description}. Current value: ${currentValue}, Threshold: ${threshold.thresholdValue}`,
          deviceId,
          deviceType: 'genieacs'
        }
      })
    } catch (error) {
      console.error('Error creating threshold alert:', error)
    }
  }

  // Device Health Scoring
  async calculateDeviceHealth(deviceId: string): Promise<DeviceHealthScore> {
    try {
      const device = await this.client.getDevice(deviceId)
      const parameters = this.parameterCache.get(deviceId) || []

      // Calculate individual scores
      const connectivityScore = this.calculateConnectivityScore(device)
      const performanceScore = this.calculatePerformanceScore(parameters)
      const stabilityScore = this.calculateStabilityScore(deviceId, parameters)

      // Calculate overall score
      const overallScore = Math.round(
        (connectivityScore * 0.3) +
        (performanceScore * 0.4) +
        (stabilityScore * 0.3)
      )

      const healthScore: DeviceHealthScore = {
        deviceId,
        overallScore,
        connectivityScore,
        performanceScore,
        stabilityScore,
        lastCalculated: new Date(),
        factors: {
          uptime: this.getUptimePercentage(device),
          responseTime: this.getAverageResponseTime(deviceId),
          errorRate: this.getErrorRate(deviceId),
          parameterHealth: performanceScore
        }
      }

      // Store health score
      await this.storeHealthScore(healthScore)

      return healthScore
    } catch (error) {
      console.error(`Error calculating health for device ${deviceId}:`, error)
      return {
        deviceId,
        overallScore: 0,
        connectivityScore: 0,
        performanceScore: 0,
        stabilityScore: 0,
        lastCalculated: new Date(),
        factors: {
          uptime: 0,
          responseTime: 0,
          errorRate: 100,
          parameterHealth: 0
        }
      }
    }
  }

  private calculateConnectivityScore(device: any): number {
    const lastInform = device._lastInform ? new Date(device._lastInform) : new Date(0)
    const now = new Date()
    const timeDiff = now.getTime() - lastInform.getTime()
    const minutesDiff = timeDiff / (1000 * 60)

    if (minutesDiff < 5) return 100
    if (minutesDiff < 15) return 80
    if (minutesDiff < 60) return 60
    if (minutesDiff < 24 * 60) return 40
    return 20
  }

  private calculatePerformanceScore(parameters: DeviceParameter[]): number {
    let totalScore = 0
    let parameterCount = 0

    for (const param of parameters) {
      let score = 100

      // Check CPU usage
      if (param.path.includes('Processor') && param.path.includes('Load')) {
        const cpuUsage = parseFloat(param.value)
        if (cpuUsage > 90) score = 20
        else if (cpuUsage > 70) score = 50
        else if (cpuUsage > 50) score = 80
      }

      // Check memory usage
      if (param.path.includes('Memory') && param.path.includes('Free')) {
        const totalMemory = parseFloat(param.value) || 0
        if (totalMemory < 10) score = 30 // Less than 10MB free
        else if (totalMemory < 50) score = 60 // Less than 50MB free
      }

      // Check temperature
      if (param.path.includes('Temperature') && param.path.includes('Value')) {
        const temperature = parseFloat(param.value)
        if (temperature > 80) score = 10
        else if (temperature > 70) score = 40
        else if (temperature > 60) score = 70
      }

      // Check optical signal
      if (param.path.includes('OpticalSignal') || param.path.includes('ReceivePower')) {
        const signal = parseFloat(param.value)
        if (signal < -30) score = 20
        else if (signal < -25) score = 50
        else if (signal < -20) score = 80
      }

      totalScore += score
      parameterCount++
    }

    return parameterCount > 0 ? Math.round(totalScore / parameterCount) : 100
  }

  private calculateStabilityScore(deviceId: string, parameters: DeviceParameter[]): number {
    // Calculate based on uptime, error rate, and parameter consistency
    const uptimeScore = this.getUptimeScore(deviceId)
    const errorScore = 100 - this.getErrorRate(deviceId)
    const consistencyScore = this.getParameterConsistencyScore(deviceId)

    return Math.round((uptimeScore + errorScore + consistencyScore) / 3)
  }

  private getUptimePercentage(device: any): number {
    const uptime = device._uptime || 0
    const totalSeconds = 7 * 24 * 60 * 60 // 7 days in seconds
    return Math.min(100, Math.round((uptime / totalSeconds) * 100))
  }

  private getUptimeScore(deviceId: string): number {
    // Implementation would check uptime history
    return 85 // Placeholder
  }

  private getAverageResponseTime(deviceId: string): number {
    // Implementation would track response times
    return 150 // Placeholder in milliseconds
  }

  private getErrorRate(deviceId: string): number {
    // Implementation would track error rates
    return 5 // Placeholder percentage
  }

  private getParameterConsistencyScore(deviceId: string): number {
    // Implementation would check parameter value consistency
    return 90 // Placeholder
  }

  private async storeHealthScore(healthScore: DeviceHealthScore) {
    try {
      await db.genieacsDeviceHealth.upsert({
        where: { deviceId: healthScore.deviceId },
        update: {
          overallScore: healthScore.overallScore,
          connectivityScore: healthScore.connectivityScore,
          performanceScore: healthScore.performanceScore,
          stabilityScore: healthScore.stabilityScore,
          lastCalculated: healthScore.lastCalculated,
          factors: healthScore.factors
        },
        create: {
          deviceId: healthScore.deviceId,
          overallScore: healthScore.overallScore,
          connectivityScore: healthScore.connectivityScore,
          performanceScore: healthScore.performanceScore,
          stabilityScore: healthScore.stabilityScore,
          lastCalculated: healthScore.lastCalculated,
          factors: healthScore.factors
        }
      })
    } catch (error) {
      console.error('Error storing health score:', error)
    }
  }

  // Firmware Management
  async checkFirmwareUpdates(deviceId: string): Promise<FirmwareInfo> {
    try {
      const parameters = await this.client.getDeviceParameters(deviceId, [
        'InternetGatewayDevice.DeviceInfo.SoftwareVersion',
        'InternetGatewayDevice.DeviceInfo.HardwareVersion',
        'InternetGatewayDevice.DeviceInfo.ModelName'
      ])

      const currentVersion = parameters.find(p => p.path.includes('SoftwareVersion'))?.value || 'Unknown'
      const hardwareVersion = parameters.find(p => p.path.includes('HardwareVersion'))?.value || 'Unknown'
      const modelName = parameters.find(p => p.path.includes('ModelName'))?.value || 'Unknown'

      // Check for available updates (this would integrate with your firmware repository)
      const availableVersion = await this.checkAvailableFirmware(modelName, hardwareVersion, currentVersion)

      const firmwareInfo: FirmwareInfo = {
        deviceId,
        currentVersion,
        availableVersion,
        updateStatus: availableVersion && availableVersion !== currentVersion ? 'available' : 'up-to-date',
        lastUpdateCheck: new Date(),
        updateHistory: await this.getFirmwareUpdateHistory(deviceId)
      }

      // Store firmware info
      await this.storeFirmwareInfo(firmwareInfo)

      return firmwareInfo
    } catch (error) {
      console.error(`Error checking firmware for device ${deviceId}:`, error)
      throw error
    }
  }

  private async checkAvailableFirmware(
    modelName: string,
    hardwareVersion: string,
    currentVersion: string
  ): Promise<string | undefined> {
    // This would integrate with your firmware repository or vendor API
    // For now, return a mock implementation
    const firmwareRepo = {
      'Huawei MA5800': 'v2.3.5',
      'ZTE C320': 'v3.1.2',
      'Nokia ISAM': 'v5.4.1'
    }

    return firmwareRepo[modelName as keyof typeof firmwareRepo]
  }

  private async getFirmwareUpdateHistory(deviceId: string) {
    try {
      return await db.genieacsFirmwareHistory.findMany({
        where: { deviceId },
        orderBy: { timestamp: 'desc' },
        take: 10
      })
    } catch (error) {
      console.error('Error getting firmware history:', error)
      return []
    }
  }

  private async storeFirmwareInfo(firmwareInfo: FirmwareInfo) {
    try {
      await db.genieacsFirmwareInfo.upsert({
        where: { deviceId: firmwareInfo.deviceId },
        update: {
          currentVersion: firmwareInfo.currentVersion,
          availableVersion: firmwareInfo.availableVersion,
          updateStatus: firmwareInfo.updateStatus,
          lastUpdateCheck: firmwareInfo.lastUpdateCheck
        },
        create: {
          deviceId: firmwareInfo.deviceId,
          currentVersion: firmwareInfo.currentVersion,
          availableVersion: firmwareInfo.availableVersion,
          updateStatus: firmwareInfo.updateStatus,
          lastUpdateCheck: firmwareInfo.lastUpdateCheck
        }
      })
    } catch (error) {
      console.error('Error storing firmware info:', error)
    }
  }

  // Advanced Analytics
  async getDeviceAnalytics(deviceId: string, timeRange: 'hour' | 'day' | 'week' | 'month') {
    try {
      const endTime = new Date()
      const startTime = this.getStartTime(timeRange)

      const analytics = {
        parameterHistory: await this.getParameterHistory(deviceId, startTime, endTime),
        healthTrends: await this.getHealthTrends(deviceId, startTime, endTime),
        performanceMetrics: await this.getPerformanceMetrics(deviceId, startTime, endTime),
        alertHistory: await this.getAlertHistory(deviceId, startTime, endTime)
      }

      return analytics
    } catch (error) {
      console.error(`Error getting analytics for device ${deviceId}:`, error)
      throw error
    }
  }

  private getStartTime(timeRange: 'hour' | 'day' | 'week' | 'month'): Date {
    const now = new Date()
    switch (timeRange) {
      case 'hour':
        return new Date(now.getTime() - 60 * 60 * 1000)
      case 'day':
        return new Date(now.getTime() - 24 * 60 * 60 * 1000)
      case 'week':
        return new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000)
      case 'month':
        return new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000)
      default:
        return new Date(now.getTime() - 24 * 60 * 60 * 1000)
    }
  }

  private async getParameterHistory(deviceId: string, startTime: Date, endTime: Date) {
    try {
      return await db.monitoringLog.findMany({
        where: {
          deviceId,
          timestamp: {
            gte: startTime,
            lte: endTime
          }
        },
        orderBy: { timestamp: 'asc' }
      })
    } catch (error) {
      console.error('Error getting parameter history:', error)
      return []
    }
  }

  private async getHealthTrends(deviceId: string, startTime: Date, endTime: Date) {
    try {
      return await db.genieacsDeviceHealth.findMany({
        where: {
          deviceId,
          lastCalculated: {
            gte: startTime,
            lte: endTime
          }
        },
        orderBy: { lastCalculated: 'asc' }
      })
    } catch (error) {
      console.error('Error getting health trends:', error)
      return []
    }
  }

  private async getPerformanceMetrics(deviceId: string, startTime: Date, endTime: Date) {
    try {
      // Aggregate performance metrics from monitoring logs
      const logs = await this.getParameterHistory(deviceId, startTime, endTime)
      
      // Group by metric type and calculate aggregates
      const metrics = logs.reduce((acc, log) => {
        if (!acc[log.metric]) {
          acc[log.metric] = {
            min: log.value,
            max: log.value,
            avg: log.value,
            count: 1,
            unit: log.unit
          }
        } else {
          const metric = acc[log.metric]
          metric.min = Math.min(metric.min, log.value)
          metric.max = Math.max(metric.max, log.value)
          metric.avg = (metric.avg * metric.count + log.value) / (metric.count + 1)
          metric.count += 1
        }
        return acc
      }, {} as Record<string, any>)

      return metrics
    } catch (error) {
      console.error('Error getting performance metrics:', error)
      return {}
    }
  }

  private async getAlertHistory(deviceId: string, startTime: Date, endTime: Date) {
    try {
      return await db.alert.findMany({
        where: {
          deviceId,
          createdAt: {
            gte: startTime,
            lte: endTime
          }
        },
        orderBy: { createdAt: 'desc' }
      })
    } catch (error) {
      console.error('Error getting alert history:', error)
      return []
    }
  }
}