#!/bin/bash

# cPanel Deployment Script for GenieACS Advanced Integration
# Usage: ./deploy-cpanel.sh

set -e

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Configuration
APP_NAME="olt-onu-monitoring"
APP_DIR="$HOME/nodejs-app"
BACKUP_DIR="$HOME/backups"
LOG_FILE="$HOME/deploy.log"

# Logging function
log() {
    echo "$(date '+%Y-%m-%d %H:%M:%S') - $1" | tee -a "$LOG_FILE"
}

# Print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
    log "$1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
    log "$1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
    log "$1"
}

# Check if running on cPanel
check_cpanel() {
    if [ ! -d "/usr/local/cpanel" ]; then
        print_error "This script is designed for cPanel environments only"
        exit 1
    fi
    print_status "cPanel environment detected"
}

# Create backup
create_backup() {
    print_status "Creating backup..."
    
    # Create backup directory
    mkdir -p "$BACKUP_DIR"
    
    # Backup current application if exists
    if [ -d "$APP_DIR" ]; then
        BACKUP_FILE="$BACKUP_DIR/app_backup_$(date +%Y%m%d_%H%M%S).tar.gz"
        tar -czf "$BACKUP_FILE" -C "$HOME" nodejs-app
        print_status "Backup created: $BACKUP_FILE"
    fi
    
    # Backup database if exists
    if command -v mysql &> /dev/null; then
        DB_BACKUP_FILE="$BACKUP_DIR/db_backup_$(date +%Y%m%d_%H%M%S).sql"
        mysqldump -u root --single-transaction --all-databases > "$DB_BACKUP_FILE" 2>/dev/null || print_warning "Database backup failed"
        if [ -f "$DB_BACKUP_FILE" ]; then
            print_status "Database backup created: $DB_BACKUP_FILE"
        fi
    fi
}

# Setup Node.js application
setup_nodejs_app() {
    print_status "Setting up Node.js application..."
    
    # Create application directory
    mkdir -p "$APP_DIR"
    cd "$APP_DIR"
    
    # Clone or update repository
    if [ -d ".git" ]; then
        print_status "Updating existing repository..."
        git pull origin master
    else
        print_status "Cloning repository..."
        git clone https://github.com/mauljasmay/olt-onu-monitoring-panel.git .
    fi
    
    # Install dependencies
    print_status "Installing dependencies..."
    npm install --production
    
    # Setup environment file
    if [ ! -f ".env" ]; then
        print_status "Creating environment file..."
        cat > .env << EOF
# Database Configuration
DATABASE_URL="mysql://olt_user:CHANGE_PASSWORD@localhost:3306/olt_onu_monitoring"

# Next.js Configuration
NEXTAUTH_URL="https://\$(hostname)"
NEXTAUTH_SECRET="$(openssl rand -base64 32)"

# GenieACS Configuration
GENIEACS_API_URL="http://localhost:7557"
GENIEACS_UI_URL="http://localhost:3000"

# Application Settings
NODE_ENV="production"
PORT=3000
EOF
        print_warning "Please update the DATABASE_URL in .env file with your actual database credentials"
    fi
}

# Setup database
setup_database() {
    print_status "Setting up database..."
    
    # Check if MySQL is available
    if ! command -v mysql &> /dev/null; then
        print_warning "MySQL not found. Please setup database manually."
        return
    fi
    
    # Prompt for database credentials
    echo "Please enter your database credentials:"
    read -p "Database name (default: olt_onu_monitoring): " DB_NAME
    DB_NAME=${DB_NAME:-olt_onu_monitoring}
    
    read -p "Database username (default: olt_user): " DB_USER
    DB_USER=${DB_USER:-olt_user}
    
    read -s -p "Database password: " DB_PASS
    echo
    
    # Create database and user (this might need root privileges)
    print_status "Attempting to create database and user..."
    mysql -u root -e "CREATE DATABASE IF NOT EXISTS $DB_NAME;" 2>/dev/null || print_warning "Could not create database. Please create manually."
    mysql -u root -e "CREATE USER IF NOT EXISTS '$DB_USER'@'localhost' IDENTIFIED BY '$DB_PASS';" 2>/dev/null || print_warning "Could not create user. Please create manually."
    mysql -u root -e "GRANT ALL PRIVILEGES ON $DB_NAME.* TO '$DB_USER'@'localhost';" 2>/dev/null || print_warning "Could not grant privileges. Please grant manually."
    mysql -u root -e "FLUSH PRIVILEGES;" 2>/dev/null
    
    # Update .env file with database credentials
    sed -i "s|DATABASE_URL=\".*\"|DATABASE_URL=\"mysql://$DB_USER:$DB_PASS@localhost:3306/$DB_NAME\"|" .env
    
    # Generate Prisma client and push schema
    print_status "Setting up database schema..."
    npx prisma generate
    npx prisma db push
    
    # Seed initial data
    if [ -f "scripts/seed-admin.ts" ]; then
        print_status "Seeding initial data..."
        npx tsx scripts/seed-admin.ts
    fi
}

# Build application
build_application() {
    print_status "Building application..."
    
    cd "$APP_DIR"
    
    # Build Next.js application
    npm run build
    
    # Create startup script if not exists
    if [ ! -f "app.js" ]; then
        print_warning "app.js not found. Please ensure it exists in the application directory."
    fi
}

# Setup cron jobs
setup_cron_jobs() {
    print_status "Setting up cron jobs..."
    
    # Create cron entries
    (crontab -l 2>/dev/null; echo "# OLT/ONU Monitoring Backup") | crontab -
    (crontab -l; echo "0 2 * * * mysqldump -u olt_user -p'$DB_PASS' $DB_NAME > $BACKUP_DIR/db_backup_\$(date +\%Y\%m\%d).sql") | crontab -
    (crontab -l; echo "*/5 * * * * cd $APP_DIR && pgrep -f 'node app.js' > /dev/null || npm run start > /dev/null 2>&1 &") | crontab -
    (crontab -l; echo "0 0 * * 0 find $APP_DIR/logs -name '*.log' -mtime +7 -delete") | crontab -
    
    print_status "Cron jobs configured"
}

# Setup permissions
setup_permissions() {
    print_status "Setting up file permissions..."
    
    cd "$HOME"
    
    # Set proper permissions
    chmod 755 "$APP_DIR"
    chmod 644 "$APP_DIR/.env"
    chmod -R 755 "$APP_DIR/.next"
    chmod -R 755 "$APP_DIR/public"
    chmod -R 755 "$APP_DIR/src"
    
    # Protect sensitive files
    chmod 600 "$APP_DIR/.env"
    
    print_status "Permissions configured"
}

# Create monitoring scripts
create_monitoring_scripts() {
    print_status "Creating monitoring scripts..."
    
    # Create health check script
    mkdir -p "$APP_DIR/scripts"
    cat > "$APP_DIR/scripts/health-check.sh" << 'EOF'
#!/bin/bash

# Health check script for OLT/ONU Monitoring
LOG_DIR="$HOME/nodejs-app/logs"
mkdir -p "$LOG_DIR"

# Check if application is running
if ! pgrep -f "node app.js" > /dev/null; then
    echo "$(date): Application is down, restarting..." >> "$LOG_DIR/health.log"
    cd "$HOME/nodejs-app"
    npm run start > /dev/null 2>&1 &
fi

# Check disk space
DISK_USAGE=$(df "$HOME/nodejs-app" | tail -1 | awk '{print $5}' | sed 's/%//')
if [ "$DISK_USAGE" -gt 80 ]; then
    echo "$(date): Disk usage is ${DISK_USAGE}%" >> "$LOG_DIR/health.log"
fi
EOF
    
    chmod +x "$APP_DIR/scripts/health-check.sh"
    
    # Create backup script
    cat > "$APP_DIR/scripts/backup.sh" << 'EOF'
#!/bin/bash

BACKUP_DIR="$HOME/backups"
DATE=$(date +%Y%m%d_%H%M%S)

mkdir -p "$BACKUP_DIR"

# Backup application
tar -czf "$BACKUP_DIR/app_backup_$DATE.tar.gz" -C "$HOME" nodejs-app

# Cleanup old backups (7 days)
find "$BACKUP_DIR" -name "app_backup_*.tar.gz" -mtime +7 -delete
find "$BACKUP_DIR" -name "db_backup_*.sql" -mtime +7 -delete
EOF
    
    chmod +x "$APP_DIR/scripts/backup.sh"
    
    print_status "Monitoring scripts created"
}

# Main deployment function
main() {
    print_status "Starting cPanel deployment for GenieACS Advanced Integration..."
    
    # Run deployment steps
    check_cpanel
    create_backup
    setup_nodejs_app
    setup_database
    build_application
    setup_permissions
    setup_cron_jobs
    create_monitoring_scripts
    
    print_status "Deployment completed successfully!"
    echo
    print_status "Next steps:"
    echo "1. Update your database credentials in $APP_DIR/.env"
    echo "2. Configure your domain in cPanel to point to $APP_DIR"
    echo "3. Setup SSL certificate for your domain"
    echo "4. Access your application at https://your-domain.com"
    echo
    print_status "For support, check the logs at: $LOG_FILE"
}

# Run main function
main "$@"