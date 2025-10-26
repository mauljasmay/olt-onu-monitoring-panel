# cPanel Quick Start Guide

## 🚀 Instalasi Cepat di cPanel

### Prerequisites
- cPanel Version 98+
- Node.js Selector aktif
- MySQL/MariaDB database
- SSH access (recommended)

### 1-Click Setup (Recommended)

```bash
# Download dan jalankan quick setup script
curl -fsSL https://raw.githubusercontent.com/mauljasmay/olt-onu-monitoring-panel/main/scripts/quick-setup-cpanel.sh | bash

# Atau download manual
wget https://raw.githubusercontent.com/mauljasmay/olt-onu-monitoring-panel/main/scripts/quick-setup-cpanel.sh
chmod +x quick-setup-cpanel.sh
./quick-setup-cpanel.sh
```

### Manual Setup

#### Step 1: Clone Repository
```bash
cd ~
git clone https://github.com/mauljasmay/olt-onu-monitoring-panel.git nodejs-app
cd nodejs-app
```

#### Step 2: Install Dependencies
```bash
npm install --production
```

#### Step 3: Setup Database
```bash
# Buat database via cPanel > MySQL Databases
# Lalu update .env file dengan database credentials
```

#### Step 4: Build Application
```bash
npx prisma generate
npx prisma db push
npm run build
```

#### Step 5: Configure cPanel Node.js App
1. Login ke cPanel
2. Go to "Setup Node.js App"
3. Create application dengan settings:
   - **Node.js version**: 18.x atau 20.x
   - **Application mode**: Production
   - **Application root**: nodejs-app
   - **Application URL**: https://yourdomain.com
   - **Application startup file**: app.js
4. Click "Create" → "Run NPM Install" → "Restart"

### Environment Configuration

Edit `.env` file:
```env
DATABASE_URL="mysql://username:password@localhost:3306/database_name"
NEXTAUTH_URL="https://yourdomain.com"
NEXTAUTH_SECRET="your-secret-key"
GENIEACS_API_URL="http://localhost:7557"
NODE_ENV="production"
PORT=3000
```

### Access Your Application

Setelah setup selesai:
- **Main Application**: https://yourdomain.com
- **Default Login**: admin / admin123
- **API Documentation**: https://yourdomain.com/api/docs

### Troubleshooting

Jika mengalami masalah:
1. Check logs: `tail -f ~/nodejs-app/logs/error.log`
2. Restart application via cPanel Node.js App
3. Lihat [Troubleshooting Guide](docs/CPANEL_TROUBLESHOOTING.md)

### Support

- 📖 [Full Documentation](docs/CPANEL_INSTALLATION.md)
- 🐛 [Troubleshooting Guide](docs/CPANEL_TROUBLESHOOTING.md)
- 🚀 [Deployment Scripts](scripts/)
- 💬 [GitHub Issues](https://github.com/mauljasmay/olt-onu-monitoring-panel/issues)