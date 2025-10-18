# VPS_DEPLOYMENT.md

# DMOC Web PWA - VPS Deployment Guide

## Overview

This guide covers deploying the DMOC Web PWA to a cloud VPS server using Docker Compose. The VPS deployment provides better performance and control compared to Vercel for applications with real-time features, background jobs, and persistent storage requirements.

## Prerequisites

- Cloud VPS with at least 4GB RAM and 2 CPU cores
- Ubuntu 20.04+ or similar Linux distribution
- Docker and Docker Compose installed
- Domain name with SSL certificate (Let's Encrypt recommended)
- Basic knowledge of Linux server administration

## VPS Requirements

### Minimum Specifications

- **RAM**: 4GB (8GB recommended for production)
- **CPU**: 2 cores (4 cores recommended)
- **Storage**: 50GB SSD (100GB recommended)
- **Network**: 1Gbps connection

### Recommended VPS Providers

- **DigitalOcean**: Droplet with 4GB RAM, 2 CPU cores
- **Linode**: Nanode 4GB or higher
- **Vultr**: High Frequency Compute instances
- **AWS EC2**: t3.medium or larger
- **Google Cloud**: e2-medium or larger

## Installation Steps

### 1. Server Setup

```bash
# Update system
sudo apt update && sudo apt upgrade -y

# Install Docker
curl -fsSL https://get.docker.com -o get-docker.sh
sudo sh get-docker.sh
sudo usermod -aG docker $USER

# Install Docker Compose
sudo curl -L "https://github.com/docker/compose/releases/latest/download/docker-compose-$(uname -s)-$(uname -m)" -o /usr/local/bin/docker-compose
sudo chmod +x /usr/local/bin/docker-compose

# Logout and login to apply Docker group changes
```

### 2. Clone Repository

```bash
# Clone your repository
git clone https://github.com/your-username/dmoc-web.git
cd dmoc-web

# Create environment file
cp .env.example .env
nano .env  # Edit with your values
```

### 3. Environment Configuration

Create `.env` file with these variables:

```bash
# Application
NODE_ENV=production
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-super-secret-jwt-key-that-is-at-least-32-characters-long

# Database
MYSQL_ROOT_PASSWORD=your-secure-root-password
MYSQL_PASSWORD=your-secure-user-password

# MinIO
MINIO_ACCESS_KEY=your-minio-access-key
MINIO_SECRET_KEY=your-minio-secret-key

# External Services (if using)
WHATSAPP_TOKEN=your-whatsapp-token
TRACCAR_USERNAME=your-traccar-username
TRACCAR_PASSWORD=your-traccar-password
```

### 4. SSL Certificate Setup

```bash
# Install Certbot
sudo apt install certbot -y

# Get SSL certificate
sudo certbot certonly --standalone -d your-domain.com

# Copy certificates to project
sudo cp /etc/letsencrypt/live/your-domain.com/fullchain.pem ./ssl/cert.pem
sudo cp /etc/letsencrypt/live/your-domain.com/privkey.pem ./ssl/key.pem
sudo chown $USER:$USER ./ssl/*
```

### 5. Deploy Application

```bash
# Build and start all services
docker-compose up -d --build

# Check service status
docker-compose ps

# View logs
docker-compose logs -f app
```

### 6. Database Setup

```bash
# Run database migrations
docker-compose exec app npx prisma db push

# Seed production database
docker-compose exec app npx tsx prisma/seed-production.ts
```

## Service Management

### Start Services

```bash
docker-compose up -d
```

### Stop Services

```bash
docker-compose down
```

### Restart Services

```bash
docker-compose restart
```

### Update Application

```bash
git pull
docker-compose up -d --build
```

### View Logs

```bash
# All services
docker-compose logs -f

# Specific service
docker-compose logs -f app
docker-compose logs -f mysql
docker-compose logs -f redis
```

## Monitoring and Maintenance

### Health Checks

```bash
# Check application health
curl https://your-domain.com/api/health

# Check database connection
docker-compose exec app npx prisma db status

# Check Redis connection
docker-compose exec redis redis-cli ping
```

### Backup Strategy

```bash
# Database backup
docker-compose exec mysql mysqldump -u root -p transport > backup-$(date +%Y%m%d).sql

# MinIO backup (if needed)
docker-compose exec minio mc mirror /data /backup
```

### Log Rotation

```bash
# Install logrotate
sudo apt install logrotate -y

# Create logrotate config
sudo nano /etc/logrotate.d/dmoc-web
```

Add this content:

```
/var/lib/docker/containers/*/*.log {
    daily
    rotate 7
    compress
    delaycompress
    missingok
    notifempty
    create 0644 root root
}
```

## Performance Optimization

### 1. Database Optimization

```sql
-- Add indexes for better performance
CREATE INDEX idx_tenant_id ON manifests(tenant_id);
CREATE INDEX idx_created_at ON manifests(created_at);
CREATE INDEX idx_status ON manifests(status);
```

### 2. Redis Configuration

```bash
# Edit redis.conf for production
docker-compose exec redis redis-cli CONFIG SET maxmemory 512mb
docker-compose exec redis redis-cli CONFIG SET maxmemory-policy allkeys-lru
```

### 3. Nginx Optimization

```nginx
# Add to nginx.conf
worker_processes auto;
worker_connections 1024;

# Enable gzip
gzip on;
gzip_vary on;
gzip_min_length 1024;
gzip_types text/plain text/css application/json application/javascript text/xml application/xml application/xml+rss text/javascript;
```

## Security Considerations

### 1. Firewall Setup

```bash
# Install UFW
sudo apt install ufw -y

# Configure firewall
sudo ufw default deny incoming
sudo ufw default allow outgoing
sudo ufw allow ssh
sudo ufw allow 80
sudo ufw allow 443
sudo ufw enable
```

### 2. Docker Security

```bash
# Run containers as non-root user
# Update Dockerfile to use nextjs user

# Regular security updates
sudo apt update && sudo apt upgrade -y
docker-compose pull
docker-compose up -d
```

### 3. Database Security

```sql
-- Create application-specific user
CREATE USER 'dmoc_user'@'%' IDENTIFIED BY 'strong_password';
GRANT SELECT, INSERT, UPDATE, DELETE ON transport.* TO 'dmoc_user'@'%';
FLUSH PRIVILEGES;
```

## Troubleshooting

### Common Issues

1. **Application won't start**

   ```bash
   docker-compose logs app
   # Check environment variables and database connection
   ```

2. **Database connection failed**

   ```bash
   docker-compose exec mysql mysql -u root -p
   # Verify database is running and accessible
   ```

3. **Socket.IO not working**

   ```bash
   # Check if WebSocket connections are properly proxied
   # Verify NEXTAUTH_URL matches your domain
   ```

4. **SSL certificate issues**
   ```bash
   # Renew certificate
   sudo certbot renew
   # Restart nginx
   docker-compose restart nginx
   ```

### Performance Issues

1. **High memory usage**

   ```bash
   # Check container resource usage
   docker stats
   # Consider upgrading VPS or optimizing application
   ```

2. **Slow database queries**
   ```bash
   # Enable slow query log
   docker-compose exec mysql mysql -u root -p
   SET GLOBAL slow_query_log = 'ON';
   SET GLOBAL long_query_time = 2;
   ```

## Migration from Vercel

### Data Migration

1. **Export from Vercel Postgres** (if using)

   ```bash
   pg_dump $DATABASE_URL > vercel-backup.sql
   ```

2. **Import to MySQL**

   ```bash
   # Convert PostgreSQL dump to MySQL format
   # Use tools like pgloader or manual conversion
   ```

3. **Update environment variables**
   - Change `DATABASE_URL` to MySQL format
   - Update `NEXTAUTH_URL` to your VPS domain
   - Configure MinIO for file storage

### DNS Update

1. **Update DNS records**
   - Point your domain to VPS IP address
   - Update A record: `your-domain.com -> VPS_IP`

2. **Test deployment**
   ```bash
   curl https://your-domain.com/api/health
   ```

## Cost Comparison

### Vercel (Current)

- **Hobby Plan**: $0/month (with limitations)
- **Pro Plan**: $20/month per member
- **External services**: Database, Redis, Storage (additional costs)

### VPS Deployment

- **VPS**: $20-40/month (4GB RAM, 2 CPU)
- **Domain**: $10-15/year
- **SSL**: Free (Let's Encrypt)
- **Total**: ~$25-45/month (all-inclusive)

## Benefits of VPS Deployment

1. **Better Performance**: No function timeouts, persistent connections
2. **Full Control**: Custom configurations, background jobs
3. **Cost Effective**: Predictable pricing, no per-request charges
4. **Scalability**: Easy to upgrade resources as needed
5. **Integration**: Better support for external services (ANPR, biometrics)
6. **Compliance**: Full control over data location and security

## Next Steps

1. **Choose VPS Provider**: DigitalOcean, Linode, or similar
2. **Set up Domain**: Purchase domain and configure DNS
3. **Deploy Application**: Follow installation steps above
4. **Configure SSL**: Set up Let's Encrypt certificate
5. **Test Thoroughly**: Verify all features work correctly
6. **Set up Monitoring**: Configure alerts and backups
7. **Migrate Data**: Transfer from Vercel if needed
8. **Update DNS**: Point domain to VPS

Your DMOC Web PWA is well-architected for VPS deployment with Docker Compose, making the migration straightforward and providing significant benefits for your logistics operations application.
