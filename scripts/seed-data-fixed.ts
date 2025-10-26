import { db } from '../src/lib/db'

async function seedData() {
  try {
    // Create sample OLTs
    const olt1 = await db.oLT.create({
      data: {
        name: 'OLT-01',
        ipAddress: '192.168.1.10',
        model: 'Huawei MA5800',
        status: 'online',
        uptime: 1324800, // 15 days 3 hours in seconds
        cpuUsage: 45,
        memoryUsage: 62,
        temperature: 42,
        onuCount: 32,
        activeONU: 30,
        lastSeen: new Date(Date.now() - 2 * 60 * 1000) // 2 minutes ago
      }
    })

    const olt2 = await db.oLT.create({
      data: {
        name: 'OLT-02',
        ipAddress: '192.168.1.11',
        model: 'ZTE C320',
        status: 'online',
        uptime: 734400, // 8 days 12 hours
        cpuUsage: 38,
        memoryUsage: 55,
        temperature: 38,
        onuCount: 28,
        activeONU: 27,
        lastSeen: new Date(Date.now() - 1 * 60 * 1000) // 1 minute ago
      }
    })

    const olt3 = await db.oLT.create({
      data: {
        name: 'OLT-03',
        ipAddress: '192.168.1.12',
        model: 'Huawei MA5800',
        status: 'offline',
        uptime: 0,
        cpuUsage: 0,
        memoryUsage: 0,
        temperature: 0,
        onuCount: 24,
        activeONU: 0,
        lastSeen: new Date(Date.now() - 60 * 60 * 1000) // 1 hour ago
      }
    })

    const olt4 = await db.oLT.create({
      data: {
        name: 'OLT-04',
        ipAddress: '192.168.1.13',
        model: 'Nokia ISAM',
        status: 'warning',
        uptime: 273600, // 3 days 5 hours
        cpuUsage: 78,
        memoryUsage: 85,
        temperature: 58,
        onuCount: 20,
        activeONU: 18,
        lastSeen: new Date(Date.now() - 5 * 60 * 1000) // 5 minutes ago
      }
    })

    const olt5 = await db.oLT.create({
      data: {
        name: 'OLT-05',
        ipAddress: '192.168.1.14',
        model: 'ZTE C320',
        status: 'online',
        uptime: 1944000, // 22 days 8 hours
        cpuUsage: 32,
        memoryUsage: 48,
        temperature: 35,
        onuCount: 24,
        activeONU: 22,
        lastSeen: new Date(Date.now() - 1 * 60 * 1000) // 1 minute ago
      }
    })

    // Create sample ONUs
    await db.oNU.createMany({
      data: [
        {
          name: 'ONU-001',
          serialNumber: 'ZTEG12345678',
          oltId: olt1.id,
          port: 1,
          status: 'online',
          signalStrength: -18,
          rxPower: -20.5,
          txPower: 2.1,
          distance: 1250,
          uptime: 475200, // 5 days 12 hours
          lastSeen: new Date(Date.now() - 1 * 60 * 1000),
          customerName: 'PT. Maju Jaya',
          ipAddress: '192.168.100.10'
        },
        {
          name: 'ONU-002',
          serialNumber: 'ZTEG87654321',
          oltId: olt1.id,
          port: 2,
          status: 'online',
          signalStrength: -22,
          rxPower: -24.8,
          txPower: 1.8,
          distance: 2100,
          uptime: 1051200, // 12 days 3 hours
          lastSeen: new Date(Date.now() - 2 * 60 * 1000),
          customerName: 'CV. Sukses Sejahtera',
          ipAddress: '192.168.100.11'
        },
        {
          name: 'ONU-003',
          serialNumber: 'HWTC11223344',
          oltId: olt2.id,
          port: 5,
          status: 'warning',
          signalStrength: -28,
          rxPower: -30.2,
          txPower: 0.5,
          distance: 3200,
          uptime: 187200, // 2 days 8 hours
          lastSeen: new Date(Date.now() - 5 * 60 * 1000),
          customerName: 'Toko ABC',
          ipAddress: '192.168.100.12'
        },
        {
          name: 'ONU-004',
          serialNumber: 'HWTC55667788',
          oltId: olt2.id,
          port: 8,
          status: 'offline',
          signalStrength: 0,
          rxPower: 0,
          txPower: 0,
          distance: 0,
          uptime: 0,
          lastSeen: new Date(Date.now() - 3 * 60 * 60 * 1000),
          customerName: 'Rumah Pak Budi',
          ipAddress: '192.168.100.13'
        },
        {
          name: 'ONU-005',
          serialNumber: 'NKIA99887766',
          oltId: olt4.id,
          port: 3,
          status: 'online',
          signalStrength: -15,
          rxPower: -17.2,
          txPower: 2.8,
          distance: 800,
          uptime: 748800, // 8 days 15 hours
          lastSeen: new Date(Date.now() - 1 * 60 * 1000),
          customerName: 'Kantor Kelurahan',
          ipAddress: '192.168.100.14'
        }
      ]
    })

    // Create sample alerts
    await db.alert.createMany({
      data: [
        {
          type: 'critical',
          title: 'OLT-03 Down',
          description: 'OLT tidak dapat dihubungi selama 5 menit',
          deviceId: olt3.id,
          deviceType: 'olt',
          status: 'active'
        },
        {
          type: 'warning',
          title: 'OLT-04 High Temperature',
          description: 'Suhu perangkat 58°C',
          deviceId: olt4.id,
          deviceType: 'olt',
          status: 'active'
        }
      ]
    })

    console.log('Sample data seeded successfully!')
  } catch (error) {
    console.error('Error seeding data:', error)
  } finally {
    await db.$disconnect()
  }
}

seedData()