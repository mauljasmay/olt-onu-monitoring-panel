-- SQL script to clear all sample data from MLJNET RADIUS database
-- Run this script to reset the database to empty state

-- Clear monitoring logs
DELETE FROM monitoring_logs;

-- Clear alerts
DELETE FROM alerts;

-- Clear ONUs
DELETE FROM onus;

-- Clear OLTs
DELETE FROM olts;

-- Clear sessions
DELETE FROM sessions;

-- Clear accounts
DELETE FROM accounts;

-- Clear verification tokens
DELETE FROM verificationtokens;

-- Clear users
DELETE FROM users;

-- Reset auto-increment counters (if needed)
-- Note: SQLite doesn't support AUTO_INCREMENT reset like MySQL
-- The IDs will continue from the last used value

VACUUM; -- Optimize the database after clearing data