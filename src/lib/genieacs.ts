import axios, { AxiosInstance, AxiosRequestConfig } from 'axios'
import { parseString } from 'xml2js'
import { promisify } from 'util'

const parseXml = promisify(parseString)

export interface GenieACSConfig {
  baseUrl: string
  username?: string
  password?: string
  timeout?: number
}

export interface GenieDevice {
  _id: string
  InternetGatewayDevice?: any
  Device?: any
  _lastInform?: string
  _registered?: string
  _serialNumber?: string
  _productId?: string
  _manufacturer?: string
  _oui?: string
  _hardwareVersion?: string
  _softwareVersion?: string
  _connectionRequestUrl?: string
  _tags?: string[]
  _parameters?: Record<string, any>
}

export interface GenieParameter {
  path: string
  value: any
  type?: string
  writable?: boolean
  notification?: number
  accessList?: string[]
}

export interface GenieTask {
  _id: string
  name: string
  device: string
  script: string
  timestamp: string
  status: 'pending' | 'completed' | 'failed'
  retries?: number
  nextRetry?: string
}

export interface GenieFault {
  _id: string
  device: string
  code: string
  message: string
  timestamp: string
  retries?: number
  channel?: string
  detail?: string
}

export class GenieACSClient {
  private client: AxiosInstance
  private config: GenieACSConfig

  constructor(config: GenieACSConfig) {
    this.config = {
      timeout: 30000,
      ...config
    }

    this.client = axios.create({
      baseURL: this.config.baseUrl,
      timeout: this.config.timeout,
      headers: {
        'Content-Type': 'application/json',
      },
      auth: this.config.username && this.config.password ? {
        username: this.config.username,
        password: this.config.password
      } : undefined
    })
  }

  // Device Management
  async getDevices(filter?: string, limit?: number, skip?: number): Promise<GenieDevice[]> {
    try {
      const params: any = {}
      if (filter) params.query = filter
      if (limit) params.limit = limit
      if (skip) params.skip = skip

      const response = await this.client.get('/devices', { params })
      return response.data
    } catch (error) {
      console.error('Error fetching devices:', error)
      throw new Error(`Failed to fetch devices: ${error}`)
    }
  }

  async getDevice(deviceId: string): Promise<GenieDevice> {
    try {
      const response = await this.client.get(`/devices/${deviceId}`)
      return response.data
    } catch (error) {
      console.error(`Error fetching device ${deviceId}:`, error)
      throw new Error(`Failed to fetch device: ${error}`)
    }
  }

  async getDeviceParameters(deviceId: string, paths?: string[]): Promise<GenieParameter[]> {
    try {
      const params: any = {}
      if (paths && paths.length > 0) {
        params.parameter = paths.join(',')
      }

      const response = await this.client.get(`/devices/${deviceId}/parameters`, { params })
      return response.data
    } catch (error) {
      console.error(`Error fetching device parameters for ${deviceId}:`, error)
      throw new Error(`Failed to fetch device parameters: ${error}`)
    }
  }

  async setDeviceParameter(deviceId: string, path: string, value: any): Promise<void> {
    try {
      await this.client.put(`/devices/${deviceId}/parameters`, {
        [path]: value
      })
    } catch (error) {
      console.error(`Error setting parameter ${path} for device ${deviceId}:`, error)
      throw new Error(`Failed to set device parameter: ${error}`)
    }
  }

  async setDeviceParameters(deviceId: string, parameters: Record<string, any>): Promise<void> {
    try {
      await this.client.put(`/devices/${deviceId}/parameters`, parameters)
    } catch (error) {
      console.error(`Error setting parameters for device ${deviceId}:`, error)
      throw new Error(`Failed to set device parameters: ${error}`)
    }
  }

  // Task Management
  async getTasks(filter?: string, limit?: number): Promise<GenieTask[]> {
    try {
      const params: any = {}
      if (filter) params.query = filter
      if (limit) params.limit = limit

      const response = await this.client.get('/tasks', { params })
      return response.data
    } catch (error) {
      console.error('Error fetching tasks:', error)
      throw new Error(`Failed to fetch tasks: ${error}`)
    }
  }

  async createTask(deviceId: string, script: string, name?: string): Promise<GenieTask> {
    try {
      const response = await this.client.post('/tasks', {
        name: name || `Task for ${deviceId}`,
        device: deviceId,
        script: script
      })
      return response.data
    } catch (error) {
      console.error('Error creating task:', error)
      throw new Error(`Failed to create task: ${error}`)
    }
  }

  async deleteTask(taskId: string): Promise<void> {
    try {
      await this.client.delete(`/tasks/${taskId}`)
    } catch (error) {
      console.error(`Error deleting task ${taskId}:`, error)
      throw new Error(`Failed to delete task: ${error}`)
    }
  }

  // Fault Management
  async getFaults(filter?: string, limit?: number): Promise<GenieFault[]> {
    try {
      const params: any = {}
      if (filter) params.query = filter
      if (limit) params.limit = limit

      const response = await this.client.get('/faults', { params })
      return response.data
    } catch (error) {
      console.error('Error fetching faults:', error)
      throw new Error(`Failed to fetch faults: ${error}`)
    }
  }

  async deleteFault(faultId: string): Promise<void> {
    try {
      await this.client.delete(`/faults/${faultId}`)
    } catch (error) {
      console.error(`Error deleting fault ${faultId}:`, error)
      throw new Error(`Failed to delete fault: ${error}`)
    }
  }

  // Connection Request
  async connectionRequest(deviceId: string, username?: string, password?: string): Promise<void> {
    try {
      const data: any = {
        command: 'connection_request'
      }
      
      if (username && password) {
        data.username = username
        data.password = password
      }

      await this.client.post(`/devices/${deviceId}/tasks`, data)
    } catch (error) {
      console.error(`Error sending connection request to ${deviceId}:`, error)
      throw new Error(`Failed to send connection request: ${error}`)
    }
  }

  // Presets Management
  async getPresets(): Promise<any[]> {
    try {
      const response = await this.client.get('/presets')
      return response.data
    } catch (error) {
      console.error('Error fetching presets:', error)
      throw new Error(`Failed to fetch presets: ${error}`)
    }
  }

  async createPreset(name: string, script: string, preconditions?: string): Promise<any> {
    try {
      const response = await this.client.post('/presets', {
        name,
        script,
        preconditions
      })
      return response.data
    } catch (error) {
      console.error('Error creating preset:', error)
      throw new Error(`Failed to create preset: ${error}`)
    }
  }

  // Statistics
  async getStatistics(): Promise<any> {
    try {
      const response = await this.client.get('/statistics')
      return response.data
    } catch (error) {
      console.error('Error fetching statistics:', error)
      throw new Error(`Failed to fetch statistics: ${error}`)
    }
  }

  // Health Check
  async healthCheck(): Promise<boolean> {
    try {
      await this.client.get('/health')
      return true
    } catch (error) {
      console.error('GenieACS health check failed:', error)
      return false
    }
  }

  // Utility Methods
  async searchDevices(query: string): Promise<GenieDevice[]> {
    try {
      const response = await this.client.get('/devices', {
        params: { query }
      })
      return response.data
    } catch (error) {
      console.error('Error searching devices:', error)
      throw new Error(`Failed to search devices: ${error}`)
    }
  }

  async getDeviceBySerial(serialNumber: string): Promise<GenieDevice | null> {
    try {
      const devices = await this.searchDevices(`_serialNumber:"${serialNumber}"`)
      return devices.length > 0 ? devices[0] : null
    } catch (error) {
      console.error(`Error finding device by serial ${serialNumber}:`, error)
      return null
    }
  }

  async getOnlineDevices(): Promise<GenieDevice[]> {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
      return await this.searchDevices(`_lastInform:[${fiveMinutesAgo} TO *]`)
    } catch (error) {
      console.error('Error fetching online devices:', error)
      return []
    }
  }

  async getOfflineDevices(): Promise<GenieDevice[]> {
    try {
      const fiveMinutesAgo = new Date(Date.now() - 5 * 60 * 1000).toISOString()
      return await this.searchDevices(`_lastInform:[* TO ${fiveMinutesAgo}]`)
    } catch (error) {
      console.error('Error fetching offline devices:', error)
      return []
    }
  }
}

// Singleton instance
let genieACSClient: GenieACSClient | null = null

export function getGenieACSClient(config?: GenieACSConfig): GenieACSClient {
  if (!genieACSClient && config) {
    genieACSClient = new GenieACSClient(config)
  }
  return genieACSClient!
}

export function initializeGenieACS(config: GenieACSConfig): GenieACSClient {
  genieACSClient = new GenieACSClient(config)
  return genieACSClient
}

// Default configuration
export const defaultGenieACSConfig: GenieACSConfig = {
  baseUrl: process.env.GENIEACS_URL || 'http://localhost:7557',
  username: process.env.GENIEACS_USERNAME,
  password: process.env.GENIEACS_PASSWORD,
  timeout: 30000
}