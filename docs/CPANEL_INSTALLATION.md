# cPanel Installation Guide
## GenieACS Advanced Integration - OLT/ONU Monitoring Panel

Panduan lengkap untuk menginstal dan mengkonfigurasi GenieACS Advanced Integration di cPanel hosting.

## 📋 Persyaratan Sistem

### cPanel Requirements
- **cPanel Version**: 98 atau lebih tinggi
- **Node.js Selector**: Terinstall dan aktif
- **MySQL/MariaDB**: Versi 10.2 atau lebih tinggi
- **PHP**: 7.4+ (untuk Composer dan dependency management)
- **SSH Access**: Diperlukan untuk setup awal

### Resource Minimum
- **RAM**: 2GB minimum (4GB recommended)
- **Storage**: 10GB available space
- **CPU**: 2 cores minimum
- **Bandwidth**: Unlimited atau 100GB+ bulanan

## 🚀 Langkah 1: Setup Node.js di cPanel

### 1.1 Aktifkan Node.js Selector
1. Login ke cPanel
2. Cari "Setup Node.js App" atau "Node.js Selector"
3. Klik untuk membuka aplikasi Node.js

### 1.2 Buat Aplikasi Node.js
1. Klik "Create Application"
2. Konfigurasi sebagai berikut:
   ```
   Node.js version: 18.x atau 20.x (recommended)
   Application mode: Production
   Application root: nodejs-app
   Application URL: / atau subdomain
   Application startup file: package.json
   ```

### 1.3 Install Dependencies
```bash
# Masuk ke directory aplikasi
cd ~/nodejs-app

# Upload project files atau clone dari GitHub
git clone https://github.com/mauljasmay/olt-onu-monitoring-panel.git .

# Install dependencies
npm install --production
```

## 🗄️ Langkah 2: Database Setup

### 2.1 Buat Database di cPanel
1. Login ke cPanel
2. Cari "MySQL Databases" atau "MariaDB Databases"
3. Buat database baru:
   ```
   Database name: olt_onu_monitoring
   Username: olt_user
   Password: [password_kuat]
   ```

### 2.2 Grant Privileges
1. Add user to database
2. Grant all privileges
3. Save changes

### 2.3 Environment Configuration
Buat file `.env` di root directory:
```env
# Database Configuration
DATABASE_URL="mysql://olt_user:password_kuat@localhost:3306/olt_onu_monitoring"

# Next.js Configuration
NEXTAUTH_URL="https://domainanda.com"
NEXTAUTH_SECRET="your-secret-key-here"

# GenieACS Configuration
GENIEACS_API_URL="http://genieacs-server:7557"
GENIEACS_UI_URL="http://genieacs-ui:3000"

# Application Settings
NODE_ENV="production"
PORT=3000
```

## 🔧 Langkah 3: Build dan Deploy

### 3.1 Build Application
```bash
# Generate Prisma Client
npx prisma generate

# Push database schema
npx prisma db push

# Build Next.js application
npm run build

# Seed initial data (optional)
npm run db:seed
```

### 3.2 Konfigurasi Startup File
Buat file `app.js` di root directory:
```javascript
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const app = next({ dev });
const handle = app.getRequestHandler();

app.prepare().then(() => {
  createServer((req, res) => {
    const parsedUrl = parse(req.url, true);
    handle(req, res, parsedUrl);
  }).listen(3000, (err) => {
    if (err) throw err;
    console.log('> Ready on http://localhost:3000');
  });
});
```

### 3.3 Update package.json
Pastikan package.json memiliki script berikut:
```json
{
  "scripts": {
    "dev": "next dev",
    "build": "next build",
    "start": "node app.js",
    "lint": "next lint"
  }
}
```

## 🌐 Langkah 4: Konfigurasi Domain dan SSL

### 4.1 Setup Domain
1. Di cPanel, buat subdomain (opsional):
   ```
   Subdomain: monitoring
   Domain: domainanda.com
   Document Root: /nodejs-app
   ```

### 4.2 SSL Certificate
1. Aktifkan "Let's Encrypt" di cPanel
2. Install SSL certificate untuk domain/subdomain
3. Force HTTPS redirect

### 4.3 .htaccess Configuration
Buat file `.htaccess` di root directory:
```apache
# Force HTTPS
RewriteEngine On
RewriteCond %{HTTPS} off
RewriteRule ^(.*)$ https://%{HTTP_HOST}%{REQUEST_URI} [L,R=301]

# Proxy to Node.js
RewriteCond %{REQUEST_FILENAME} !-f
RewriteCond %{REQUEST_FILENAME} !-d
RewriteRule ^(.*)$ http://localhost:3000/$1 [P,L]
```

## 🔒 Langkah 5: Security Configuration

### 5.1 File Permissions
```bash
# Set proper permissions
chmod 755 ~/nodejs-app
chmod 644 ~/nodejs-app/.env
chmod -R 755 ~/nodejs-app/.next
chmod -R 755 ~/nodejs-app/public
```

### 5.2 Environment Security
```bash
# Protect .env file
echo ".env" >> ~/nodejs-app/.gitignore

# Set restrictive permissions
chmod 600 ~/nodejs-app/.env
```

### 5.3 Firewall Configuration
Di cPanel "ConfigServer Security & Firewall":
- Buka port 3000 untuk localhost
- Block direct access ke port 3000 dari luar
- Allow port 443 (HTTPS) dan 80 (HTTP)

## 📊 Langkah 6: GenieACS Integration

### 6.1 Install GenieACS (jika belum ada)
```bash
# Install Node.js dependencies untuk GenieACS
npm install -g genieacs-genieacs
npm install -g genieacs-ui
npm install -g genieacs-cwmp
npm install -g genieacs-nbi
npm install -g genieacs-fs
```

### 6.2 Konfigurasi GenieACS
Buat file `config/genieacs.yaml`:
```yaml
genieacs:
  ui:
    port: 3000
  nbi:
    port: 7557
  cwmp:
    port: 7547
  fs:
    path: ./files
  mongodb:
    uri: mongodb://localhost:27017/genieacs
```

### 6.3 Start GenieACS Services
```bash
# Start GenieACS services
genieacs-cwmp &
genieacs-nbi &
genieacs-fs &
genieacs-ui &
```

## 🔧 Langkah 7: Monitoring dan Maintenance

### 7.1 Setup Cron Jobs
Di cPanel "Cron Jobs":
```bash
# Backup database harian
0 2 * * * mysqldump -u olt_user -ppassword olt_onu_monitoring > backup_$(date +\%Y\%m\%d).sql

# Restart aplikasi jika crash
*/5 * * * * cd ~/nodejs-app && npm run start > /dev/null 2>&1 &

# Cleanup logs
0 0 * * 0 find ~/nodejs-app/logs -name "*.log" -mtime +7 -delete
```

### 7.2 Log Monitoring
```bash
# Buat log directory
mkdir -p ~/nodejs-app/logs

# Setup log rotation
echo "*/6 * * * * /usr/sbin/logrotate /home/user/nodejs-app/config/logrotate.conf" | crontab -
```

### 7.3 Health Check Script
Buat `scripts/health-check.sh`:
```bash
#!/bin/bash
# Health check untuk aplikasi

# Check jika aplikasi running
if ! pgrep -f "node app.js" > /dev/null; then
    echo "$(date): Application is down, restarting..." >> ~/nodejs-app/logs/health.log
    cd ~/nodejs-app
    npm run start > /dev/null 2>&1 &
fi

# Check database connection
if ! mysql -u olt_user -ppassword -e "USE olt_onu_monitoring;" 2>/dev/null; then
    echo "$(date): Database connection failed" >> ~/nodejs-app/logs/health.log
fi

# Check disk space
DISK_USAGE=$(df ~/nodejs-app | tail -1 | awk '{print $5}' | sed 's/%//')
if [ $DISK_USAGE -gt 80 ]; then
    echo "$(date): Disk usage is ${DISK_USAGE}%" >> ~/nodejs-app/logs/health.log
fi
```

## 🚨 Troubleshooting

### Common Issues dan Solutions

#### 1. Application tidak start
```bash
# Check logs
tail -f ~/nodejs-app/logs/error.log

# Check Node.js version
node --version

# Rebuild jika perlu
rm -rf .next
npm run build
```

#### 2. Database connection error
```bash
# Test connection
mysql -u olt_user -ppassword -h localhost olt_onu_monitoring

# Check database exists
mysql -u olt_user -ppassword -e "SHOW DATABASES;"

# Reset database schema
npx prisma db push --force-reset
```

#### 3. Port conflicts
```bash
# Check ports in use
netstat -tulpn | grep :3000

# Kill process jika perlu
pkill -f "node app.js"
```

#### 4. Memory issues
```bash
# Check memory usage
free -h

# Increase Node.js memory limit
export NODE_OPTIONS="--max-old-space-size=2048"
```

## 📈 Performance Optimization

### 1. Enable Caching
```bash
# Install Redis jika available
npm install redis

# Konfigurasi Redis cache di environment
REDIS_URL="redis://localhost:6379"
```

### 2. Database Optimization
```sql
-- Add indexes untuk performance
CREATE INDEX idx_devices_serial ON devices(serial_number);
CREATE INDEX idx_device_health_created_at ON device_health(created_at);
CREATE INDEX idx_monitoring_logs_timestamp ON monitoring_logs(timestamp);
```

### 3. CDN Configuration
Di cPanel "Cloudflare" atau "CDN":
- Enable static file caching
- Compress images dan assets
- Enable Brotli compression

## 🔄 Backup dan Recovery

### Automated Backup Script
Buat `scripts/backup.sh`:
```bash
#!/bin/bash
BACKUP_DIR="/home/user/backups"
DATE=$(date +%Y%m%d_%H%M%S)

# Buat backup directory
mkdir -p $BACKUP_DIR

# Backup database
mysqldump -u olt_user -ppassword olt_onu_monitoring > $BACKUP_DIR/db_backup_$DATE.sql

# Backup application files
tar -czf $BACKUP_DIR/app_backup_$DATE.tar.gz ~/nodejs-app

# Cleanup old backups (7 days)
find $BACKUP_DIR -name "*.sql" -mtime +7 -delete
find $BACKUP_DIR -name "*.tar.gz" -mtime +7 -delete
```

### Recovery Process
```bash
# Restore database
mysql -u olt_user -ppassword olt_onu_monitoring < backup.sql

# Restore application files
tar -xzf app_backup.tar.gz -C ~/

# Restart services
cd ~/nodejs-app
npm run start
```

## 📞 Support dan Maintenance

### Monitoring Contact
- **Email**: admin@domainanda.com
- **Phone**: +62 xxx-xxxx-xxxx
- **Slack**: #monitoring-support

### Regular Maintenance Tasks
- **Daily**: Check logs dan health status
- **Weekly**: Review performance metrics
- **Monthly**: Update dependencies dan security patches
- **Quarterly**: Full system audit dan optimization

---

## 🎉 Setup Complete!

Setelah mengikuti semua langkah di atas, GenieACS Advanced Integration seharusnya sudah running di cPanel hosting Anda.

### Access URLs:
- **Main Application**: https://domainanda.com
- **GenieACS UI**: https://domainanda.com:3000 (jika diinstall)
- **API Documentation**: https://domainanda.com/api/docs

### Next Steps:
1. Login dan konfigurasi GenieACS server
2. Add devices dan monitoring parameters
3. Setup alerts dan notifications
4. Configure backup dan recovery

Untuk bantuan lebih lanjut, hubungi team support atau lihat dokumentasi lengkap di `docs/GENIEACS_INTEGRATION.md`.