# Database Migration Guide

## MySQL Database Setup

### 1. Create MySQL Database

```sql
CREATE DATABASE dmoc_production CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
CREATE USER 'dmoc_user'@'localhost' IDENTIFIED BY 'your_secure_password';
GRANT ALL PRIVILEGES ON dmoc_production.* TO 'dmoc_user'@'localhost';
FLUSH PRIVILEGES;
```

### 2. Environment Configuration

Create a `.env` file with your MySQL connection:

```bash
# Production MySQL Database
DATABASE_URL="mysql://dmoc_user:your_secure_password@localhost:3306/dmoc_production"

# NextAuth Configuration
NEXTAUTH_URL="http://localhost:3000"
NEXTAUTH_SECRET="your-super-secret-jwt-key-that-is-at-least-32-characters-long"

# Redis Configuration (for BullMQ)
REDIS_URL="redis://localhost:6379"

# MinIO Configuration (for file storage)
MINIO_ENDPOINT="localhost"
MINIO_PORT=9000
MINIO_ACCESS_KEY="minioadmin"
MINIO_SECRET_KEY="minioadmin"
MINIO_BUCKET="dmoc-files"
MINIO_USE_SSL=false
```

### 3. Run Database Migration

```bash
# Generate Prisma client
npm run db:prod

# Push schema to database
npx prisma db push

# Seed with production data
npm run db:seed:prod
```

### 4. Verify Migration

```bash
# Open Prisma Studio to view data
npx prisma studio
```

## Performance Benefits

After migrating to MySQL with Prisma:

1. **Faster Initial Load**: Database queries are optimized and cached
2. **Real-time Updates**: Socket.IO can push updates directly to database
3. **Scalability**: MySQL handles larger datasets efficiently
4. **Data Persistence**: No more mock data loss on page refresh
5. **Multi-tenant Isolation**: Proper tenant-based data separation

## Next Steps

1. Update your pages to use database queries instead of mock data
2. Implement real-time updates via Socket.IO
3. Add proper error handling and loading states
4. Set up database backups and monitoring
