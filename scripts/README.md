# Database Scripts

This directory contains utility scripts for managing the MLJNET RADIUS database.

## Scripts

### 1. clear-database.ts
TypeScript script to clear all sample/demo data from the database.

**Usage:**
```bash
npm run db:clear
# or
npx tsx scripts/clear-database.ts
```

**What it clears:**
- All monitoring logs
- All alerts
- All ONUs
- All OLTs
- All sessions
- All accounts
- All verification tokens
- All users

### 2. verify-database.ts
Script to verify the current state of the database and show record counts.

**Usage:**
```bash
npx tsx scripts/verify-database.ts
```

### 3. clear-database.sql
SQL script for manual database clearing using SQLite CLI.

**Usage:**
```bash
sqlite3 db/dev.db < scripts/clear-database.sql
```

## Available NPM Scripts

- `npm run db:clear` - Clear all sample data from database
- `npm run db:reset` - Reset database (delete and recreate)
- `npm run db:push` - Push schema changes to database
- `npm run db:generate` - Generate Prisma client
- `npm run db:migrate` - Run database migrations

## Important Notes

⚠️ **Warning:** These scripts will permanently delete all data from the database. Make sure to backup any important data before running them.

✅ **Safe to use:** These scripts are designed to clear sample/demo data and will not affect the database schema.

🔄 **Order matters:** The TypeScript script clears data in the correct order to respect foreign key constraints.

## After Clearing

After clearing the database:
1. The database will be completely empty
2. You'll need to create new admin users
3. You'll need to add OLTs and ONUs again
4. All historical data will be lost

## Recovery

If you accidentally clear important data:
1. Check if you have a recent backup
2. Use `npm run db:reset` to restore from seed files (if available)
3. Manually re-enter the required data