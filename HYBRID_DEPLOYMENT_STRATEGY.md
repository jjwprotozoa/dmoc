# HYBRID_DEPLOYMENT_STRATEGY.md

# DMOC Web PWA - Hybrid Deployment Strategy

## Overview

This document outlines our hybrid deployment strategy: **Vercel for development/testing** and **VPS for production delivery**. The goal is to maintain rapid development cycles while ensuring production-ready VPS deployment.

## Strategy Summary

### Development Phase (Vercel)

- **Platform**: Vercel
- **Purpose**: Rapid iteration, testing, client demos
- **Benefits**:
  - Instant deployments
  - Built-in CI/CD
  - Easy environment management
  - Global CDN
  - Preview deployments

### Production Phase (VPS)

- **Platform**: Cloud VPS with Docker
- **Purpose**: Final delivery, full control, performance
- **Benefits**:
  - Persistent Socket.IO connections
  - Background job processing
  - Local database and storage
  - No function timeouts
  - Full infrastructure control

## Code Compatibility Requirements

### Database Layer

```typescript
// ✅ CORRECT - MySQL compatible (works on both)
const user = await prisma.user.findFirst({
  where: { tenant_id: tenantId },
});

// ❌ AVOID - PostgreSQL specific features
// Use MySQL-compatible SQL syntax only
```

### Storage Layer

```typescript
// ✅ CORRECT - S3/MinIO compatible
const uploadResult = await s3Client.putObject({
  Bucket: process.env.S3_BUCKET,
  Key: `uploads/${filename}`,
  Body: fileBuffer,
});

// ❌ AVOID - Platform-specific storage APIs
```

### Real-time Features

```typescript
// ✅ CORRECT - Socket.IO with fallback
const socket = io(process.env.NEXTAUTH_URL, {
  transports: ['websocket', 'polling'],
});

// ❌ AVOID - WebSocket-only implementations
```

### Background Jobs

```typescript
// ✅ CORRECT - BullMQ with Redis
const queue = new Queue('manifest-processing', {
  connection: { host: 'localhost', port: 6379 },
});

// ❌ AVOID - Long-running synchronous operations
```

## Environment Configuration

### Vercel Environment Variables

```bash
# Vercel Dashboard Settings
NEXTAUTH_URL=https://dmoc-web.vercel.app
NEXTAUTH_SECRET=your-secret-key
DATABASE_URL=postgresql://user:pass@host:port/db
REDIS_URL=redis://user:pass@host:port
S3_ENDPOINT=https://your-s3-endpoint.com
S3_REGION=us-east-1
S3_BUCKET=your-bucket
S3_ACCESS_KEY_ID=your-key
S3_SECRET_ACCESS_KEY=your-secret
```

### VPS Environment Variables

```bash
# .env file for VPS
NODE_ENV=production
NEXTAUTH_URL=https://your-domain.com
NEXTAUTH_SECRET=your-secret-key
DATABASE_URL=mysql://user:password@mysql:3306/transport
REDIS_URL=redis://redis:6379
S3_ENDPOINT=http://minio:9000
S3_REGION=us-east-1
S3_BUCKET=dmoc-media
S3_ACCESS_KEY_ID=minioadmin
S3_SECRET_ACCESS_KEY=minioadmin
```

## Deployment Workflow

### 1. Development on Vercel

```bash
# Push to main branch
git push origin main

# Vercel auto-deploys
# Test features on Vercel preview
# Client demos on Vercel URL
```

### 2. Production on VPS

```bash
# One-click VPS deployment
./deploy-vps.sh

# Or manual deployment
docker-compose up -d --build
```

## Platform-Specific Considerations

### Vercel Limitations to Work Around

- **Function timeout**: 30 seconds max
- **No persistent connections**: Socket.IO may disconnect
- **External dependencies**: Database, Redis, Storage must be external
- **Cold starts**: Initial request may be slow

### VPS Advantages to Leverage

- **Persistent connections**: Socket.IO stays connected
- **Background processing**: BullMQ jobs run continuously
- **Local services**: MySQL, Redis, MinIO all local
- **No timeouts**: Long-running operations supported

## Migration Checklist

### Pre-Migration (Development)

- [ ] All features tested on Vercel
- [ ] Database schema compatible with MySQL
- [ ] Storage operations use S3/MinIO APIs
- [ ] Socket.IO works with polling fallback
- [ ] Background jobs designed for BullMQ
- [ ] Environment variables documented

### Migration (Production)

- [ ] VPS server provisioned
- [ ] Docker Compose configured
- [ ] SSL certificates installed
- [ ] Domain DNS updated
- [ ] Environment variables set
- [ ] Database migrated
- [ ] Application deployed
- [ ] Health checks passing

## Testing Strategy

### Vercel Testing

```bash
# Test on Vercel preview
vercel --prod

# Check Vercel-specific features
curl https://your-app.vercel.app/api/health
```

### VPS Testing

```bash
# Test on VPS
docker-compose up -d
curl http://localhost:3000/api/health

# Test Socket.IO
curl http://localhost:3000/socket.io/
```

### Cross-Platform Testing

```bash
# Test both platforms
npm run test:vercel
npm run test:vps
npm run test:compatibility
```

## Monitoring and Maintenance

### Vercel Monitoring

- Built-in analytics
- Function execution metrics
- Error tracking
- Performance monitoring

### VPS Monitoring

- Custom health checks
- Docker container monitoring
- Database performance
- Redis queue monitoring
- MinIO storage monitoring

## Cost Analysis

### Development Phase (Vercel)

- **Hobby Plan**: $0/month (with limitations)
- **Pro Plan**: $20/month per member
- **External Services**: Database, Redis, Storage (~$30-50/month)
- **Total**: $50-70/month

### Production Phase (VPS)

- **VPS**: $25-40/month (4GB RAM, 2 CPU)
- **Domain**: $10-15/year
- **SSL**: Free (Let's Encrypt)
- **Total**: ~$30-45/month

## Best Practices

### Code Development

1. **Write VPS-compatible code** that also works on Vercel
2. **Use MySQL syntax** (not PostgreSQL-specific features)
3. **Design for BullMQ** (not long-running sync operations)
4. **Use S3/MinIO APIs** (not platform-specific storage)
5. **Support both environments** in environment variables

### Deployment Process

1. **Develop on Vercel** for rapid iteration
2. **Test thoroughly** on Vercel preview
3. **Document VPS requirements** for each feature
4. **Deploy to VPS** when ready for production
5. **Monitor both platforms** during transition

### Feature Development

1. **Check compatibility** before implementing
2. **Test on both platforms** during development
3. **Document platform differences** in code comments
4. **Use feature flags** for platform-specific code
5. **Plan migration path** for each feature

## Troubleshooting

### Common Issues

#### Socket.IO Disconnections on Vercel

```typescript
// Solution: Use polling fallback
const socket = io(process.env.NEXTAUTH_URL, {
  transports: ['websocket', 'polling'],
  upgrade: true,
  rememberUpgrade: true,
});
```

#### Database Connection Issues

```typescript
// Solution: Use connection pooling
const prisma = new PrismaClient({
  datasources: {
    db: {
      url: process.env.DATABASE_URL,
    },
  },
});
```

#### File Upload Timeouts

```typescript
// Solution: Use streaming uploads
const uploadStream = s3Client.upload({
  Bucket: process.env.S3_BUCKET,
  Key: filename,
  Body: fileStream,
});
```

## Future Considerations

### Scalability

- **Vercel**: Auto-scaling, global CDN
- **VPS**: Manual scaling, single region

### Maintenance

- **Vercel**: Managed platform, automatic updates
- **VPS**: Manual maintenance, security updates

### Compliance

- **Vercel**: Shared infrastructure
- **VPS**: Full control over data location

## Conclusion

This hybrid approach provides the best of both worlds:

- **Rapid development** on Vercel
- **Production control** on VPS
- **One-click deployment** when ready
- **Cost-effective** long-term solution

The key is writing VPS-compatible code that also works on Vercel, ensuring smooth migration when ready for production delivery.
