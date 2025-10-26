import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function verifyDatabase() {
  console.log('🔍 Verifying database has been cleared...')
  
  try {
    const userCount = await prisma.user.count()
    const oltCount = await prisma.oLT.count()
    const onuCount = await prisma.oNU.count()
    const alertCount = await prisma.alert.count()
    const logCount = await prisma.monitoringLog.count()
    const sessionCount = await prisma.session.count()
    const accountCount = await prisma.account.count()
    const tokenCount = await prisma.verificationToken.count()
    
    console.log('\n📊 Current database status:')
    console.log(`👥 Users: ${userCount}`)
    console.log(`🖥️  OLTs: ${oltCount}`)
    console.log(`📡 ONUs: ${onuCount}`)
    console.log(`🚨 Alerts: ${alertCount}`)
    console.log(`📈 Monitoring Logs: ${logCount}`)
    console.log(`🔐 Sessions: ${sessionCount}`)
    console.log(`🔑 Accounts: ${accountCount}`)
    console.log(`🎫 Verification Tokens: ${tokenCount}`)
    
    if (userCount === 0 && oltCount === 0 && onuCount === 0 && alertCount === 0 && 
        logCount === 0 && sessionCount === 0 && accountCount === 0 && tokenCount === 0) {
      console.log('\n✅ Database is completely empty - all sample data has been cleared!')
    } else {
      console.log('\n⚠️  Some data still remains in the database')
    }
    
  } catch (error) {
    console.error('❌ Error verifying database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

verifyDatabase()
  .then(() => process.exit(0))
  .catch((error) => {
    console.error('💥 Failed to verify database:', error)
    process.exit(1)
  })