import { PrismaClient } from '@prisma/client'

const prisma = new PrismaClient()

async function clearDatabase() {
  console.log('🗑️  Starting to clear all sample data from database...')
  
  try {
    // Clear in order of dependencies to avoid foreign key constraints
    
    // Clear monitoring logs first (no dependencies)
    const deletedLogs = await prisma.monitoringLog.deleteMany()
    console.log(`✅ Deleted ${deletedLogs.count} monitoring logs`)
    
    // Clear alerts
    const deletedAlerts = await prisma.alert.deleteMany()
    console.log(`✅ Deleted ${deletedAlerts.count} alerts`)
    
    // Clear ONUs
    const deletedONUS = await prisma.oNU.deleteMany()
    console.log(`✅ Deleted ${deletedONUS.count} ONUs`)
    
    // Clear OLTs
    const deletedOLTs = await prisma.oLT.deleteMany()
    console.log(`✅ Deleted ${deletedOLTs.count} OLTs`)
    
    // Clear sessions
    const deletedSessions = await prisma.session.deleteMany()
    console.log(`✅ Deleted ${deletedSessions.count} sessions`)
    
    // Clear accounts
    const deletedAccounts = await prisma.account.deleteMany()
    console.log(`✅ Deleted ${deletedAccounts.count} accounts`)
    
    // Clear verification tokens
    const deletedTokens = await prisma.verificationToken.deleteMany()
    console.log(`✅ Deleted ${deletedTokens.count} verification tokens`)
    
    // Clear users (except keep one admin if needed)
    const deletedUsers = await prisma.user.deleteMany()
    console.log(`✅ Deleted ${deletedUsers.count} users`)
    
    console.log('🎉 All sample data has been successfully cleared from the database!')
    
  } catch (error) {
    console.error('❌ Error clearing database:', error)
    throw error
  } finally {
    await prisma.$disconnect()
  }
}

// Run the function
clearDatabase()
  .then(() => {
    console.log('✨ Database clearing completed successfully')
    process.exit(0)
  })
  .catch((error) => {
    console.error('💥 Failed to clear database:', error)
    process.exit(1)
  })