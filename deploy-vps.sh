# deploy-vps.sh
#!/bin/bash
# DMOC Web PWA - VPS Deployment Script
# Automated deployment script for cloud VPS servers

set -e

echo "🚀 Starting DMOC Web PWA VPS Deployment..."

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Function to print colored output
print_status() {
    echo -e "${GREEN}[INFO]${NC} $1"
}

print_warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

print_error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

# Check if running as root
if [[ $EUID -eq 0 ]]; then
   print_error "This script should not be run as root"
   exit 1
fi

# Check if Docker is installed
if ! command -v docker &> /dev/null; then
    print_error "Docker is not installed. Please install Docker first."
    exit 1
fi

# Check if Docker Compose is installed
if ! command -v docker-compose &> /dev/null; then
    print_error "Docker Compose is not installed. Please install Docker Compose first."
    exit 1
fi

# Check if .env file exists
if [ ! -f .env ]; then
    print_warning ".env file not found. Creating from .env.example..."
    if [ -f .env.example ]; then
        cp .env.example .env
        print_warning "Please edit .env file with your configuration before continuing."
        exit 1
    else
        print_error ".env.example file not found. Cannot create .env file."
        exit 1
    fi
fi

# Check if SSL certificates exist
if [ ! -f ssl/cert.pem ] || [ ! -f ssl/key.pem ]; then
    print_warning "SSL certificates not found in ssl/ directory."
    print_warning "Please obtain SSL certificates and place them in ssl/ directory:"
    print_warning "  - ssl/cert.pem (certificate file)"
    print_warning "  - ssl/key.pem (private key file)"
    print_warning ""
    print_warning "You can use Let's Encrypt:"
    print_warning "  sudo certbot certonly --standalone -d your-domain.com"
    print_warning "  sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./ssl/cert.pem"
    print_warning "  sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./ssl/key.pem"
    print_warning "  sudo chown \$USER:\$USER ./ssl/*"
    exit 1
fi

# Create necessary directories
print_status "Creating necessary directories..."
mkdir -p uploads
mkdir -p ssl
mkdir -p logs

# Pull latest changes
print_status "Pulling latest changes from repository..."
git pull origin main

# Build and start services
print_status "Building and starting Docker services..."
docker-compose down --remove-orphans
docker-compose up -d --build

# Wait for services to be ready
print_status "Waiting for services to be ready..."
sleep 30

# Check if services are running
print_status "Checking service status..."
docker-compose ps

# Run database migrations
print_status "Running database migrations..."
docker-compose exec -T app npx prisma db push

# Seed production database
print_status "Seeding production database..."
docker-compose exec -T app npx tsx prisma/seed-production.ts

# Check application health
print_status "Checking application health..."
sleep 10

if curl -f http://localhost:3000/api/health > /dev/null 2>&1; then
    print_status "✅ Application is healthy and running!"
else
    print_warning "⚠️  Application health check failed. Check logs:"
    docker-compose logs app
fi

# Display service URLs
print_status "🎉 Deployment completed successfully!"
echo ""
echo "Service URLs:"
echo "  - Application: http://localhost:3000"
echo "  - MinIO Console: http://localhost:9001"
echo "  - Database: localhost:3306"
echo "  - Redis: localhost:6379"
echo ""
echo "Useful commands:"
echo "  - View logs: docker-compose logs -f"
echo "  - Restart services: docker-compose restart"
echo "  - Stop services: docker-compose down"
echo "  - Update application: git pull && docker-compose up -d --build"
echo ""
print_status "Deployment completed! 🚀"
