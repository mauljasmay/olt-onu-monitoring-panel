# GenieACS Advanced Integration

This document describes the comprehensive GenieACS integration feature in the MLJNET RADIUS monitoring panel with advanced enterprise-grade capabilities.

## Overview

GenieACS is a popular open-source TR-069 Auto Configuration Server (ACS) used for managing CPE (Customer Premises Equipment) devices. This advanced integration provides enterprise-grade device management with real-time monitoring, automation, analytics, and intelligent alerting.

## 🚀 Advanced Features

### 🔗 **Multi-Server Management**
- Configure and manage multiple GenieACS servers
- Switch between different configurations seamlessly
- Connection testing and health monitoring
- Load balancing and failover support

### 📊 **Real-Time Parameter Monitoring**
- Continuous monitoring of critical device parameters
- Configurable monitoring intervals (1-60 minutes)
- Historical data tracking and trending
- Performance metrics collection

### 🚨 **Intelligent Alerting System**
- Custom parameter thresholds with multiple conditions
- Multi-severity alerting (Info, Warning, Critical)
- Alert correlation and deduplication
- Real-time notification system

### 🏥 **Device Health Scoring**
- Comprehensive health assessment (0-100 score)
- Multi-factor analysis: connectivity, performance, stability
- Real-time health calculations
- Health trend analysis and forecasting

### 📦 **Advanced Firmware Management**
- Automated firmware update detection
- Version compatibility checking
- Update scheduling and rollback capabilities
- Firmware repository integration

### 🎯 **Device Grouping & Bulk Operations**
- Dynamic device grouping based on criteria
- Bulk configuration deployment
- Mass firmware updates
- Group-based automation workflows

### ⏰ **Scheduled Automation**
- Cron-based task scheduling
- Recurring maintenance windows
- Automated health checks
- Scheduled parameter optimization

### 📈 **Performance Analytics**
- Historical data analysis
- Performance trend identification
- Capacity planning insights
- Custom reporting dashboards

## 🏗️ Technical Architecture

### Database Schema Enhancements

#### Extended Device Tables
```sql
-- Enhanced OLT/ONU tables with GenieACS integration
ALTER TABLE olts ADD COLUMN genieacsDeviceId STRING;
ALTER TABLE olts ADD COLUMN genieacsSynced BOOLEAN DEFAULT FALSE;
ALTER TABLE olts ADD COLUMN genieacsLastSync DATETIME;

ALTER TABLE onus ADD COLUMN genieacsDeviceId STRING;
ALTER TABLE onus ADD COLUMN genieacsSynced BOOLEAN DEFAULT FALSE;
ALTER TABLE onus ADD COLUMN genieacsLastSync DATETIME;
```

#### New Advanced Tables
- `GenieACSParameterThreshold` - Alert threshold configurations
- `GenieACSDeviceHealth` - Device health scores and metrics
- `GenieACSFirmwareInfo` - Firmware version tracking
- `GenieACSDeviceGroup` - Device grouping management
- `GenieACSScheduledTask` - Automation scheduling

### API Architecture

#### Core API Endpoints
```
/api/genieacs/config          - Configuration management
/api/genieacs/devices         - Device operations
/api/genieacs/sync            - Device synchronization
/api/genieacs/monitoring      - Advanced monitoring
/api/genieacs/groups          - Device grouping
/api/genieacs/bulk            - Bulk operations
/api/genieacs/schedule        - Scheduled tasks
```

#### Monitoring API Endpoints
```
GET  /api/genieacs/monitoring?metric=health        - Device health scores
GET  /api/genieacs/monitoring?metric=parameters   - Real-time parameters
GET  /api/genieacs/monitoring?metric=firmware     - Firmware status
GET  /api/genieacs/monitoring?metric=analytics    - Performance analytics
POST /api/genieacs/monitoring?action=start-monitoring - Start monitoring
POST /api/genieacs/monitoring?action=create-threshold - Create alerts
```

## 📋 Feature Breakdown

### 1. **Configuration Management**

#### Multi-Server Support
- **Unlimited Configurations**: Add multiple GenieACS servers
- **Connection Testing**: Validate connectivity before saving
- **Health Monitoring**: Continuous server health checks
- **Failover Support**: Automatic server switching

#### Configuration Options
```json
{
  "name": "Production GenieACS",
  "baseUrl": "https://genieacs.example.com:7557",
  "username": "admin",
  "password": "secure_password",
  "timeout": 30000,
  "autoSync": true,
  "syncInterval": 300,
  "description": "Main production server"
}
```

### 2. **Advanced Device Monitoring**

#### Real-Time Parameter Tracking
- **Critical Parameters**: CPU, Memory, Temperature, Signal Strength
- **Custom Parameters**: User-defined monitoring paths
- **Data Collection**: Configurable intervals (1-60 minutes)
- **Historical Storage**: Complete parameter history

#### Monitored Parameters by Device Type

**OLT Devices:**
- Hardware/Software versions
- CPU and memory usage
- Temperature monitoring
- Host count and port status
- VLAN configuration
- Network interface statistics

**ONU Devices:**
- Optical signal levels
- Power consumption
- Network connectivity
- WiFi configuration
- Customer usage metrics

### 3. **Intelligent Alerting System**

#### Threshold Configuration
```json
{
  "parameterPath": "InternetGatewayDevice.DeviceInfo.Temperature.Value",
  "deviceType": "olt",
  "condition": "greater_than",
  "thresholdValue": 70,
  "severity": "warning",
  "enabled": true,
  "description": "High temperature alert"
}
```

#### Alert Conditions
- **greater_than**: Value exceeds threshold
- **less_than**: Value below threshold
- **equals**: Exact value match
- **not_equals**: Value doesn't match
- **contains**: String contains value

#### Alert Severity Levels
- **Info**: Informational notifications
- **Warning**: Requires attention
- **Critical**: Immediate action required

### 4. **Device Health Scoring**

#### Health Score Calculation
```
Overall Score = (Connectivity × 30%) + (Performance × 40%) + (Stability × 30%)
```

#### Score Components
- **Connectivity Score** (0-100): Based on last inform time and response rates
- **Performance Score** (0-100): CPU, memory, temperature, and parameter health
- **Stability Score** (0-100): Uptime percentage and error rates

#### Health Indicators
- 🟢 **80-100**: Excellent - Device operating optimally
- 🟡 **60-79**: Good - Minor issues detected
- 🔴 **0-59**: Poor - Requires immediate attention

### 5. **Firmware Management**

#### Firmware Information Tracking
```json
{
  "deviceId": "device-123",
  "currentVersion": "v2.3.5",
  "availableVersion": "v2.4.0",
  "updateStatus": "available",
  "lastUpdateCheck": "2024-01-15T10:30:00Z",
  "updateHistory": [
    {
      "version": "v2.3.5",
      "timestamp": "2024-01-01T08:00:00Z",
      "status": "success",
      "duration": 180
    }
  ]
}
```

#### Update Status Types
- **up-to-date**: Running latest version
- **available**: Update ready for installation
- **updating**: Update in progress
- **failed**: Update failed, requires attention

### 6. **Device Grouping & Bulk Operations**

#### Dynamic Grouping Criteria
```json
{
  "name": "Critical OLTs",
  "description": "High-priority OLT devices",
  "criteria": {
    "manufacturer": "Huawei",
    "model": "MA5800",
    "online": true,
    "healthScore": { "min": 80 }
  },
  "deviceIds": ["device-1", "device-2", "device-3"]
}
```

#### Bulk Operation Types
- **Reboot**: Mass device restart
- **Factory Reset**: Restore to default settings
- **Firmware Update**: Group firmware deployment
- **Parameter Set**: Bulk configuration changes
- **WiFi Configuration**: Mass WiFi settings
- **VLAN Configuration**: Network setup

### 7. **Scheduled Automation**

#### Cron-Based Scheduling
```json
{
  "name": "Weekly Health Check",
  "description": "Comprehensive device health assessment",
  "taskType": "health_check",
  "target": "all",
  "schedule": "0 2 * * 0", // Every Sunday at 2 AM
  "enabled": true,
  "lastRun": "2024-01-14T02:00:00Z",
  "nextRun": "2024-01-21T02:00:00Z"
}
```

#### Supported Task Types
- **reboot**: Scheduled device restart
- **firmware_update**: Automated firmware deployment
- **parameter_set**: Configuration updates
- **health_check**: Health assessment
- **custom_script**: User-defined operations

### 8. **Performance Analytics**

#### Analytics Time Ranges
- **Hour**: Last 60 minutes of data
- **Day**: Last 24 hours of data
- **Week**: Last 7 days of data
- **Month**: Last 30 days of data

#### Analytics Metrics
- **Parameter History**: Historical parameter values
- **Health Trends**: Device health over time
- **Performance Metrics**: Aggregated performance data
- **Alert History**: Alert frequency and patterns

## 🛠️ Implementation Guide

### Environment Setup

#### Required Environment Variables
```env
# GenieACS Configuration
GENIEACS_URL=http://localhost:7557
GENIEACS_USERNAME=admin
GENIEACS_PASSWORD=admin

# Optional: Monitoring Configuration
GENIEACS_MONITORING_INTERVAL=300
GENIEACS_HEALTH_CHECK_INTERVAL=60
```

#### Database Setup
```bash
# Push updated schema
npm run db:push

# Generate Prisma client
npm run db:generate
```

### Configuration Steps

#### 1. Add GenieACS Server
1. Navigate to **GenieACS** tab in dashboard
2. Click **"Add Configuration"**
3. Enter server details and test connection
4. Save configuration

#### 2. Configure Monitoring
1. Go to **Monitoring** tab
2. Click **"Add Threshold"** to set up alerts
3. Configure parameter thresholds
4. Enable monitoring

#### 3. Set Up Device Groups
1. Navigate to **Automation** tab
2. Create device groups based on criteria
3. Configure bulk operations
4. Set up scheduled tasks

#### 4. Enable Analytics
1. Go to **Analytics** tab
2. Select time ranges for analysis
3. View performance trends
4. Generate reports

## 📊 API Usage Examples

### Start Parameter Monitoring
```bash
curl -X POST "http://localhost:3000/api/genieacs/monitoring" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "start-monitoring",
    "configId": "config-123",
    "intervalMinutes": 5
  }'
```

### Create Parameter Threshold
```bash
curl -X POST "http://localhost:3000/api/genieacs/monitoring" \
  -H "Content-Type: application/json" \
  -d '{
    "action": "create-threshold",
    "parameterPath": "InternetGatewayDevice.DeviceInfo.Temperature.Value",
    "deviceType": "olt",
    "condition": "greater_than",
    "thresholdValue": 70,
    "severity": "warning",
    "description": "High temperature alert"
  }'
```

### Execute Bulk Operation
```bash
curl -X POST "http://localhost:3000/api/genieacs/bulk" \
  -H "Content-Type: application/json" \
  -d '{
    "configId": "config-123",
    "operation": "reboot",
    "targets": [
      {"deviceId": "device-1", "name": "OLT-01"},
      {"deviceId": "device-2", "name": "OLT-02"}
    ]
  }'
```

### Get Device Health Score
```bash
curl "http://localhost:3000/api/genieacs/monitoring?configId=config-123&deviceId=device-1&metric=health"
```

### Get Performance Analytics
```bash
curl "http://localhost:3000/api/genieacs/monitoring?configId=config-123&deviceId=device-1&metric=analytics&timeRange=day"
```

## 🔧 Advanced Configuration

### Custom Parameter Monitoring
```javascript
// Define custom parameters for monitoring
const customParameters = [
  'InternetGatewayDevice.DeviceInfo.X_CT-COM_OpticalSignal',
  'InternetGatewayDevice.DeviceInfo.X_CT-COM_Temperature',
  'InternetGatewayDevice.WANDevice.1.WANConnectionDevice.1.WANIPConnection.1.Stats'
]
```

### Advanced Threshold Logic
```javascript
// Complex threshold example
const advancedThreshold = {
  parameterPath: 'InternetGatewayDevice.DeviceInfo.ProcessorStatus',
  condition: 'greater_than',
  thresholdValue: 80,
  deviceType: 'olt',
  severity: 'critical',
  description: 'Critical CPU usage detected',
  customActions: ['send_alert', 'create_ticket', 'notify_admin']
}
```

### Scheduled Task Examples
```javascript
// Weekly maintenance window
const weeklyMaintenance = {
  name: 'Weekly Device Maintenance',
  schedule: '0 2 * * 0', // Sunday 2 AM
  taskType: 'maintenance',
  target: 'all',
  script: `
    // Custom maintenance script
    declare("InternetGatewayDevice.DeviceInfo.ResetCount", {value: "0"});
    declare("InternetGatewayDevice.ManagementServer.PeriodicInformInterval", {value: "3600"});
  `
}
```

## 📈 Performance Optimization

### Monitoring Best Practices
- **Interval Optimization**: Set appropriate monitoring intervals
- **Parameter Selection**: Monitor critical parameters only
- **Threshold Tuning**: Avoid alert fatigue with proper thresholds
- **Data Retention**: Configure appropriate data retention policies

### Database Optimization
- **Indexing**: Proper indexes on frequently queried fields
- **Partitioning**: Partition large tables by date
- **Cleanup**: Regular cleanup of old monitoring data
- **Archiving**: Archive historical data periodically

### API Performance
- **Caching**: Cache frequently accessed data
- **Pagination**: Use pagination for large device lists
- **Batching**: Batch API requests when possible
- **Compression**: Enable response compression

## 🔍 Troubleshooting

### Common Issues

#### Connection Problems
```bash
# Test GenieACS connectivity
curl -I http://your-genieacs-server:7557/health

# Check authentication
curl -u admin:password http://your-genieacs-server:7557/devices
```

#### Monitoring Issues
- Check parameter paths are correct
- Verify device permissions
- Review threshold configurations
- Monitor system resources

#### Performance Issues
- Reduce monitoring frequency
- Optimize database queries
- Check network latency
- Review system logs

### Debug Mode
```env
# Enable debug logging
DEBUG=genieacs:*
LOG_LEVEL=debug
```

## 📚 Advanced Use Cases

### 1. **Proactive Maintenance**
- Monitor device health trends
- Schedule preventive maintenance
- Predictive failure analysis
- Automated issue resolution

### 2. **Capacity Planning**
- Track resource utilization
- Analyze growth patterns
- Plan infrastructure upgrades
- Optimize device distribution

### 3. **Compliance Reporting**
- Generate compliance reports
- Audit trail maintenance
- Security monitoring
- Performance SLA tracking

### 4. **Multi-Tenant Management**
- Tenant-specific configurations
- Resource isolation
- Usage billing integration
- Custom dashboards

## 🔮 Future Enhancements

### Planned Features
- [ ] **Machine Learning Integration**: Predictive analytics
- [ ] **Mobile App**: Native mobile application
- [ ] **API Gateway**: Enhanced API management
- [ ] **Edge Computing**: Distributed monitoring
- [ ] **Blockchain Integration**: Immutable audit logs
- [ ] **AI-Powered Optimization**: Intelligent parameter tuning

### Integration Opportunities
- [ ] **IoT Platforms**: AWS IoT, Azure IoT
- [ ] **Monitoring Tools**: Prometheus, Grafana
- [ ] **Ticketing Systems**: Jira, ServiceNow
- [ ] **Communication Platforms**: Slack, Teams
- [ ] **Cloud Providers**: AWS, Azure, GCP

## 📞 Support

### Technical Support
- **Documentation**: Complete API and user guides
- **Community**: Active user community
- **Professional Support**: Enterprise support packages
- **Training**: Comprehensive training programs

### Resources
- **GitHub Repository**: Source code and issues
- **Documentation Portal**: Complete documentation
- **Video Tutorials**: Step-by-step guides
- **Webinars**: Regular training sessions

---

## 📋 Quick Reference

### Essential Commands
```bash
# Start monitoring
npm run genieacs:monitor:start

# Stop monitoring
npm run genieacs:monitor:stop

# Sync devices
npm run genieacs:sync

# Health check
npm run genieacs:health

# Backup configuration
npm run genieacs:backup
```

### Key Configuration Files
- `src/lib/genieacs.ts` - Core GenieACS client
- `src/lib/genieacs-monitoring.ts` - Advanced monitoring
- `prisma/schema.prisma` - Database schema
- `.env` - Environment configuration

### Important URLs
- Dashboard: `http://localhost:3000/dashboard`
- API Docs: `http://localhost:3000/api/docs`
- Health Check: `http://localhost:3000/api/health`

This advanced GenieACS integration transforms your network monitoring capabilities with enterprise-grade features, intelligent automation, and comprehensive analytics. 🚀