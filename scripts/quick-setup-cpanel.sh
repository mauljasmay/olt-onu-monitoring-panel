#!/bin/bash

# cPanel Quick Setup Script for GenieACS Advanced Integration
# This script handles the basic setup for cPanel environments

set -e

# Colors
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
RED='\033[0;31m'
NC='\033[0m'

print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if cPanel environment
if [ ! -d "/usr/local/cpanel" ]; then
    print_error "This script must be run on a cPanel server"
    exit 1
fi

print_status "cPanel environment detected"

# Get user input
echo "Please enter the following information:"
read -p "Application directory (default: nodejs-app): " APP_DIR
APP_DIR=${APP_DIR:-nodejs-app}

read -p "Domain name (e.g., example.com): " DOMAIN
if [ -z "$DOMAIN" ]; then
    print_error "Domain name is required"
    exit 1
fi

read -p "Database name (default: olt_onu_monitoring): " DB_NAME
DB_NAME=${DB_NAME:-olt_onu_monitoring}

read -p "Database username (default: olt_user): " DB_USER
DB_USER=${DB_USER:-olt_user}

read -s -p "Database password: " DB_PASS
echo

if [ -z "$DB_PASS" ]; then
    print_error "Database password is required"
    exit 1
fi

# Create application directory
print_status "Creating application directory..."
mkdir -p "$HOME/$APP_DIR"
cd "$HOME/$APP_DIR"

# Clone repository
print_status "Downloading application..."
if [ -d ".git" ]; then
    git pull origin master
else
    git clone https://github.com/mauljasmay/olt-onu-monitoring-panel.git .
fi

# Install dependencies
print_status "Installing dependencies..."
npm install --production

# Create environment file
print_status "Creating environment configuration..."
cat > .env << EOF
# Database Configuration
DATABASE_URL="mysql://$DB_USER:$DB_PASS@localhost:3306/$DB_NAME"

# Next.js Configuration
NEXTAUTH_URL="https://$DOMAIN"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"

# GenieACS Configuration
GENIEACS_API_URL="http://localhost:7557"
GENIEACS_UI_URL="http://localhost:3000"

# Application Settings
NODE_ENV="production"
PORT=3000
EOF

# Setup database
print_status "Setting up database..."
mysql -u root -e "CREATE DATABASE IF NOT EXISTS $DB_NAME;" 2>/dev/null || print_warning "Could not create database. Please create manually."
mysql -u root -e "CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';" 2>/dev/null || print_warning "Could not create user. Please create manually."
mysql -u root -e "GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';" 2>/dev/null || print_warning "Could not grant privileges. Please grant manually."
mysql -u root -e "FLUSH PRIVILEGES;" 2>/dev/null

# Build application
print_status "Building application..."
npx prisma generate
npx prisma db push
npm run build

# Setup permissions
print_status "Setting permissions..."
chmod 755 "$HOME/$APP_DIR"
chmod 600 "$HOME/$APP_DIR/.env"
chmod -R 755 "$HOME/$APP_DIR/.next"
chmod -R 755 "$HOME/$APP_DIR/public"

# Create startup script
print_status "Creating startup script..."
cat > start.sh << 'EOF'
#!/bin/bash
cd "$(dirname "$0")"
npm run start
EOF
chmod +x start.sh

# Create logs directory
mkdir -p logs

# Setup basic cron job
print_status "Setting up monitoring cron job..."
(crontab -l 2>/dev/null; echo "*/5 * * * * cd $HOME/$APP_DIR && pgrep -f 'node app.js' > /dev/null || ./start.sh > /dev/null 2>&1 &") | crontab -

print_status "Setup completed successfully!"
echo
print_status "Next steps:"
echo "1. Go to cPanel > Setup Node.js App"
echo "2. Create application with these settings:"
echo "   - Node.js version: 18.x or 20.x"
echo "   - Application mode: Production"
echo "   - Application root: $APP_DIR"
echo "   - Application URL: https://$DOMAIN"
echo "   - Application startup file: app.js"
echo "3. Click 'Create' and then 'Run NPM Install'"
echo "4. Click 'Restart' to start the application"
echo
print_status "Your application will be available at: https://$DOMAIN"