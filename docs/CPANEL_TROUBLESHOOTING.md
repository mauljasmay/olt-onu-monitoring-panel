# cPanel Troubleshooting Guide
## GenieACS Advanced Integration - OLT/ONU Monitoring Panel

Panduan lengkap untuk troubleshooting masalah umum saat instalasi dan penggunaan GenieACS Advanced Integration di cPanel.

## 🚨 Common Issues dan Solutions

### 1. Application Tidak Start

#### Symptoms
- Blank page atau 502 error
- Application tidak loading
- Error "Application not found"

#### Solutions

**Step 1: Check Node.js Application Status**
```bash
# Check jika Node.js process running
ps aux | grep node

# Check port usage
netstat -tulpn | grep :3000

# Check application logs
tail -f ~/nodejs-app/logs/error.log
```

**Step 2: Restart Application**
```bash
# Kill existing process
pkill -f "node app.js"

# Start application manually
cd ~/nodejs-app
npm run start

# Atau gunakan startup script
./start.sh
```

**Step 3: Check cPanel Node.js Configuration**
1. Login ke cPanel
2. Go to "Setup Node.js App"
3. Verify application settings:
   - Node.js version: 18.x atau 20.x
   - Application mode: Production
   - Application startup file: app.js
4. Click "Restart"

**Step 4: Rebuild Application**
```bash
cd ~/nodejs-app

# Clean build
rm -rf .next

# Rebuild
npm run build

# Restart
npm run start
```

### 2. Database Connection Issues

#### Symptoms
- Error "Database connection failed"
- 500 error pada API endpoints
- Login tidak berfungsi

#### Solutions

**Step 1: Test Database Connection**
```bash
# Test connection via command line
mysql -u olt_user -ppassword -h localhost olt_onu_monitoring

# Check database exists
mysql -u olt_user -ppassword -e "SHOW DATABASES;"

# Check tables
mysql -u olt_user -ppassword olt_onu_monitoring -e "SHOW TABLES;"
```

**Step 2: Verify .env Configuration**
```bash
cd ~/nodejs-app
cat .env | grep DATABASE_URL
```

Pastikan formatnya benar:
```env
DATABASE_URL="mysql://username:password@localhost:3306/database_name"
```

**Step 3: Reset Database Schema**
```bash
cd ~/nodejs-app

# Force reset dan recreate
npx prisma db push --force-reset

# Generate client
npx prisma generate

# Seed data
npx tsx scripts/seed-admin.ts
```

**Step 4: Check Database Permissions**
```sql
-- Grant privileges (run as root)
GRANT ALL PRIVILEGES ON olt_onu_monitoring.* TO 'olt_user'@'localhost';
FLUSH PRIVILEGES;
```

### 3. Port Conflicts

#### Symptoms
- Error "Port 3000 already in use"
- Application tidak bisa start
- Nginx/Apache proxy errors

#### Solutions

**Step 1: Identify Process Using Port**
```bash
# Check port 3000
lsof -i :3000

# Atau
netstat -tulpn | grep :3000
```

**Step 2: Kill Conflicting Process**
```bash
# Kill process by PID
kill -9 <PID>

# Atau kill all Node.js processes
pkill -f node
```

**Step 3: Use Different Port**
```bash
# Edit .env file
echo "PORT=3001" >> ~/nodejs-app/.env

# Update .htaccess proxy rule
sed -i 's/localhost:3000/localhost:3001/g' ~/nodejs-app/.htaccess
```

### 4. Memory Issues

#### Symptoms
- Application crash secara tiba-tiba
- Error "JavaScript heap out of memory"
- Slow response time

#### Solutions

**Step 1: Check Memory Usage**
```bash
# Check system memory
free -h

# Check process memory
ps aux --sort=-%mem | head

# Check Node.js memory usage
ps aux | grep node
```

**Step 2: Increase Node.js Memory Limit**
```bash
# Add to .env
echo "NODE_OPTIONS=--max-old-space-size=2048" >> ~/nodejs-app/.env

# Atau set temporarily
export NODE_OPTIONS="--max-old-space-size=2048"
npm run start
```

**Step 3: Optimize Application**
```bash
# Enable production mode
export NODE_ENV=production

# Use PM2 for process management
npm install -g pm2
pm2 start app.js --name olt-monitoring --max-memory-restart 1G
```

### 5. File Permission Issues

#### Symptoms
- 403 Forbidden errors
- Cannot write to logs
- Cannot read .env file

#### Solutions

**Step 1: Check Current Permissions**
```bash
# Check directory permissions
ls -la ~/nodejs-app/

# Check file permissions
ls -la ~/nodejs-app/.env
```

**Step 2: Fix Permissions**
```bash
# Set proper permissions
chmod 755 ~/nodejs-app
chmod 644 ~/nodejs-app/.env
chmod -R 755 ~/nodejs-app/.next
chmod -R 755 ~/nodejs-app/public
chmod -R 755 ~/nodejs-app/src

# Protect sensitive files
chmod 600 ~/nodejs-app/.env
```

**Step 3: Check Ownership**
```bash
# Check file ownership
ls -la ~/nodejs-app/

# Fix ownership if needed
chown -R $(whoami):$(whoami) ~/nodejs-app/
```

### 6. SSL/HTTPS Issues

#### Symptoms
- Mixed content warnings
- HTTPS redirect loops
- SSL certificate errors

#### Solutions

**Step 1: Check SSL Certificate**
```bash
# Check certificate expiry
openssl s_client -connect yourdomain.com:443 -servername yourdomain.com 2>/dev/null | openssl x509 -noout -dates

# Check certificate chain
curl -I https://yourdomain.com
```

**Step 2: Fix Mixed Content**
```bash
# Update .htaccess untuk force HTTPS
cat > ~/nodejs-app/.htaccess << 'EOF'
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
EOF
```

**Step 3: Update NEXTAUTH_URL**
```bash
# Edit .env file
sed -i 's|NEXTAUTH_URL=.*|NEXTAUTH_URL=https://yourdomain.com|' ~/nodejs-app/.env
```

### 7. GenieACS Integration Issues

#### Symptoms
- Cannot connect to GenieACS
- Device discovery tidak berfungsi
- API timeouts

#### Solutions

**Step 1: Check GenieACS Services**
```bash
# Check jika GenieACS running
ps aux | grep genieacs

# Check ports
netstat -tulpn | grep -E "(7547|7557|7567|3000)"

# Test API connection
curl -X GET http://localhost:7557/devices
```

**Step 2: Verify GenieACS Configuration**
```bash
# Check config file
cat ~/genieacs/config/genieacs.yaml

# Check logs
tail -f ~/genieacs/logs/genieacs-nbi-error.log
```

**Step 3: Restart GenieACS Services**
```bash
# Restart all services
pkill -f genieacs
genieacs-cwmp &
genieacs-nbi &
genieacs-fs &
genieacs-ui &
```

### 8. Performance Issues

#### Symptoms
- Slow loading times
- High CPU usage
- Database timeouts

#### Solutions

**Step 1: Monitor Performance**
```bash
# Check system load
top
htop

# Check disk I/O
iostat -x 1

# Check database performance
mysql -u root -e "SHOW PROCESSLIST;"
```

**Step 2: Optimize Database**
```sql
-- Add indexes
CREATE INDEX idx_devices_serial ON devices(serial_number);
CREATE INDEX idx_device_health_created_at ON device_health(created_at);
CREATE INDEX idx_monitoring_logs_timestamp ON monitoring_logs(timestamp);

-- Optimize tables
OPTIMIZE TABLE devices;
OPTIMIZE TABLE device_health;
OPTIMIZE TABLE monitoring_logs;
```

**Step 3: Enable Caching**
```bash
# Install Redis jika available
npm install redis

# Update .env
echo "REDIS_URL=redis://localhost:6379" >> ~/nodejs-app/.env
```

## 🔧 Diagnostic Commands

### System Information
```bash
# System info
uname -a
df -h
free -h
uptime

# cPanel version
cat /usr/local/cpanel/version

# Node.js version
node --version
npm --version

# Database version
mysql --version
```

### Application Status
```bash
# Check application logs
tail -f ~/nodejs-app/logs/error.log
tail -f ~/nodejs-app/logs/access.log

# Check database connection
mysql -u olt_user -ppassword -e "SELECT 1;"

# Check API endpoints
curl -X GET https://yourdomain.com/api/health
```

### Network Diagnostics
```bash
# Check port availability
netstat -tulpn | grep -E "(3000|7547|7557|7567)"

# Test DNS resolution
nslookup yourdomain.com

# Test HTTP/HTTPS connectivity
curl -I http://yourdomain.com
curl -I https://yourdomain.com
```

## 📞 Getting Help

### Log Files Location
- **Application logs**: `~/nodejs-app/logs/`
- **cPanel logs**: `/usr/local/cpanel/logs/`
- **Apache/Nginx logs**: `/var/log/apache2/` atau `/var/log/nginx/`
- **Database logs**: `/var/log/mysql/` atau `/var/log/mariadb/`

### Support Information
Jika masalah berlanjut, kumpulkan informasi berikut:

1. **System Information**:
   ```bash
   uname -a > system-info.txt
   cPanel -V >> system-info.txt
   node --version >> system-info.txt
   mysql --version >> system-info.txt
   ```

2. **Application Logs**:
   ```bash
   tar -czf application-logs.tar.gz ~/nodejs-app/logs/
   ```

3. **Configuration Files**:
   ```bash
   cp ~/nodejs-app/.env config-env.txt
   cp ~/nodejs-app/package.json config-package.txt
   ```

4. **Error Screenshots**: Screenshot dari error messages

### Contact Support
- **GitHub Issues**: https://github.com/mauljasmay/olt-onu-monitoring-panel/issues
- **Email**: support@domainanda.com
- **Documentation**: Lihat `docs/GENIEACS_INTEGRATION.md`

## 🔄 Recovery Procedures

### Full Application Reset
```bash
# Backup current data
cp -r ~/nodejs-app ~/nodejs-app.backup

# Remove application
rm -rf ~/nodejs-app

# Re-clone and setup
git clone https://github.com/mauljasmay/olt-onu-monitoring-panel.git ~/nodejs-app
cd ~/nodejs-app
npm install --production
npm run build
npm run start
```

### Database Recovery
```bash
# Create backup
mysqldump -u root --single-transaction --all-databases > full-backup.sql

# Restore from backup
mysql -u root < full-backup.sql

# Recreate schema
npx prisma db push
npx prisma generate
```

---

## 📝 Prevention Tips

1. **Regular Backups**: Setup automated backup harian
2. **Monitoring**: Gunakan health check script
3. **Updates**: Keep Node.js dan dependencies updated
4. **Security**: Review file permissions secara berkala
5. **Performance**: Monitor resource usage dan optimalkan database

Dengan mengikuti guide ini, sebagian besar masalah umum di cPanel dapat diatasi dengan cepat dan efektif.