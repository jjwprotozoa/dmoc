# DMOC Web (PWA)

**Multi-tenant logistics operations app converted from Windows to web**

A comprehensive Progressive Web Application (PWA) for logistics operations management, built with modern web technologies and designed for multi-tenant deployment.

## 📋 Project Management

### Linear Integration

This project uses Linear for issue tracking and project management:

- **Workspace**: [justwessels](https://linear.app/justwessels)
- **Team**: Justwessels
- **Issue Prefix**: JUS- (e.g., JUS-16, JUS-17)
- **Configuration**: See `LINEAR_CONFIG.md` and `MCP_LINEAR_CONFIG.md`

### Current Development Status

- **Active Branch**: `feature/modernized-navigation`
- **Recent Issues**: JUS-19 through JUS-27 (see Linear workspace)
- **Major Features**: Navigation overhaul, database migration, vehicle management, privacy controls

### AI Chat Integration

For AI assistants working on this project:

1. **Always use team parameter**: `"justwessels"` in Linear MCP tools
2. **Reference**: `MCP_LINEAR_CONFIG.md` for complete MCP configuration
3. **Check**: `LINEAR_CONFIG.md` for detailed setup instructions
4. **Follow**: `.cursorrules` for development guidelines

## 🚀 Features

### Core Functionality

- **Multi-tenant Architecture** - Support for multiple logistics clients (Delta, Cobra, etc.) under Digiwize
- **Real-time Tracking** - Live vehicle and manifest updates via Socket.IO
- **Fleet Management** - Comprehensive vehicle, driver, and client management
- **Manifest System** - Complete logistics manifest tracking and management
- **PWA Support** - Offline functionality with service worker and Dexie storage
- **Mobile-First Design** - Responsive design optimized for mobile devices

### Security & Privacy

- **POPIA Compliance** - Comprehensive data protection for personal information
- **Role-Based Access Control** - Admin/Manager/Operator/Viewer roles with granular permissions
- **Data Masking** - Sensitive information automatically masked for unauthorized users
- **Tenant Isolation** - Strict data separation between different logistics clients
- **Authentication** - NextAuth.js with JWT tokens and secure session management

### Advanced Features

- **ANPR Integration** - Automatic Number Plate Recognition with YOLOv8 + PaddleOCR
- **Biometric Verification** - Selfie/ID matching with InsightFace/DeepFace
- **WhatsApp Integration** - Real-time communication and status updates
- **GPS Tracking** - Real-time location tracking with Traccar integration
- **Background Processing** - BullMQ job queue system for heavy operations
- **File Storage** - S3-compatible storage for media and documents

## 🛠️ Tech Stack

### Frontend

- **Next.js 14** - React framework with App Router
- **TypeScript** - Type-safe development
- **Tailwind CSS** - Utility-first CSS framework
- **shadcn/ui** - Modern component library
- **React Leaflet** - Interactive maps
- **Lucide React** - Beautiful icons

### Backend

- **NestJS** - Scalable Node.js framework
- **tRPC** - End-to-end typesafe APIs
- **Prisma ORM** - Database toolkit and ORM
- **Socket.IO** - Real-time bidirectional communication
- **BullMQ** - Redis-based job queue
- **NextAuth.js** - Authentication framework

### Database & Storage

- **MySQL 8.0+** - Primary database (PostgreSQL for production)
- **Redis** - Caching and job queue
- **S3/MinIO** - Object storage for media files
- **Dexie** - Client-side database for offline support

### DevOps & Deployment

- **Vercel** - Hosting and deployment platform
- **Docker** - Containerization for local development
- **GitHub Actions** - CI/CD pipeline
- **PWA** - Service worker and offline capabilities

## 📦 Installation

### Prerequisites

- Node.js 18.0.0 or higher
- MySQL 8.0+ or PostgreSQL
- Redis (optional, for background jobs)

### Local Development

1. **Clone the repository**

   ```bash
   git clone https://github.com/digiwize/dmoc-web.git
   cd dmoc-web
   ```

2. **Install dependencies**

   ```bash
   npm install
   ```

3. **Set up environment variables**

   ```bash
   cp .env.example .env.local
   # Edit .env.local with your configuration
   ```

4. **Set up the database**

   ```bash
   # For development (SQLite)
   npm run db:dev

   # For production (MySQL/PostgreSQL)
   npm run db:prod
   npm run db:push
   ```

5. **Seed the database**

   ```bash
   # Development data
   npm run db:seed

   # Production data
   npm run db:seed:prod
   ```

6. **Start the development server**
   ```bash
   npm run dev
   ```

The application will be available at `http://localhost:3000`

## 🚀 Deployment

### Hybrid Deployment Strategy

**Development**: Vercel for rapid iteration and testing  
**Production**: VPS for full control and performance

This hybrid approach allows us to:

- ✅ Develop quickly on Vercel with instant deployments
- ✅ Test features with clients on Vercel previews
- ✅ Deploy to VPS with one-click when ready for production
- ✅ Maintain VPS-compatible code throughout development

### Vercel Deployment (Development/Testing)

1. **Connect to Vercel**

   ```bash
   vercel --prod
   ```

2. **Set environment variables** in Vercel dashboard:

   ```bash
   NEXTAUTH_URL=https://your-app.vercel.app
   NEXTAUTH_SECRET=your-super-secret-jwt-key-that-is-at-least-32-characters-long
   DATABASE_URL=postgresql://username:password@host:port/database_name
   REDIS_URL=redis://username:password@host:port
   S3_ENDPOINT=https://your-s3-endpoint.com
   S3_REGION=us-east-1
   S3_BUCKET=your-bucket-name
   S3_ACCESS_KEY_ID=your-access-key
   S3_SECRET_ACCESS_KEY=your-secret-key
   ```

3. **Run database setup**
   ```bash
   npx prisma db push
   npx tsx prisma/seed-production.ts
   ```

### VPS Deployment (Production)

**One-click deployment to VPS:**

```bash
# Automated VPS deployment
./deploy-vps.sh
```

**Manual VPS deployment:**

```bash
# Set up environment
cp .env.example .env
# Edit .env with your VPS configuration

# Deploy with Docker Compose
docker-compose up -d --build

# Run database setup
docker-compose exec app npx prisma db push
docker-compose exec app npx tsx prisma/seed-production.ts
```

**VPS includes:**

- 🐳 **Docker Compose** - Complete infrastructure
- 🗄️ **MySQL** - Local database with persistent storage
- 🔴 **Redis** - Background jobs and caching
- 📁 **MinIO** - S3-compatible file storage
- 🌐 **Nginx** - Reverse proxy with SSL termination
- 🔒 **SSL** - Let's Encrypt certificates

### Platform Comparison

| Feature             | Vercel (Dev) | VPS (Prod)   |
| ------------------- | ------------ | ------------ |
| **Deployment**      | Instant      | One-click    |
| **Socket.IO**       | Limited      | Persistent   |
| **Background Jobs** | Timeout      | Continuous   |
| **Database**        | External     | Local MySQL  |
| **Storage**         | External S3  | Local MinIO  |
| **Cost**            | $50-70/month | $30-45/month |
| **Control**         | Limited      | Full control |

### Migration Path

1. **Develop** on Vercel for rapid iteration
2. **Test** features thoroughly on Vercel previews
3. **Deploy** to VPS when ready for production
4. **Monitor** both platforms during transition

See [HYBRID_DEPLOYMENT_STRATEGY.md](HYBRID_DEPLOYMENT_STRATEGY.md) for detailed migration guide.

## 🔧 Configuration

### Environment Variables

| Variable               | Description                    | Default                        |
| ---------------------- | ------------------------------ | ------------------------------ |
| `DATABASE_URL`         | Database connection string     | `file:./dev.db`                |
| `NEXTAUTH_URL`         | Application URL                | `http://localhost:3000`        |
| `NEXTAUTH_SECRET`      | JWT secret key                 | `your-super-secret-jwt-key...` |
| `REDIS_URL`            | Redis connection string        | `redis://localhost:6379`       |
| `S3_ENDPOINT`          | S3-compatible storage endpoint | `http://localhost:9000`        |
| `S3_REGION`            | S3 region                      | `us-east-1`                    |
| `S3_BUCKET`            | S3 bucket name                 | `logistics-media`              |
| `S3_ACCESS_KEY_ID`     | S3 access key                  | `minioadmin`                   |
| `S3_SECRET_ACCESS_KEY` | S3 secret key                  | `minioadmin`                   |

### Multi-tenant Configuration

The application supports multiple tenants with different themes:

- **Delta** - Blue theme
- **Cobra** - Red theme
- **Digiwize** - Amber theme (admin)

## 📱 PWA Features

- **Offline Support** - Works without internet connection
- **Install Prompt** - Native app-like installation
- **Push Notifications** - Real-time updates
- **Background Sync** - Data synchronization when online
- **Service Worker** - Caching and offline functionality

## 🔐 Security

### Authentication

- JWT-based authentication with NextAuth.js
- Role-based access control (Admin/Manager/Operator/Viewer)
- Multi-factor authentication support
- Session management with secure cookies

### Data Protection

- POPIA compliance for personal data
- Automatic data masking for sensitive information
- Tenant isolation with strict data separation
- Audit logging for compliance

### API Security

- Rate limiting on webhook endpoints
- Input validation with Zod schemas
- CORS configuration
- Security headers (CSP, HSTS, etc.)

## 🧪 Testing

```bash
# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Type checking
npm run type-check

# Linting
npm run lint

# Format code
npm run format
```

## 📊 Monitoring

### Health Checks

- `/api/health` - Application health status
- Database connection monitoring
- Redis connection status
- S3 storage availability

### Logging

- Structured logging with Winston
- Error tracking and monitoring
- Performance metrics
- Audit trail for sensitive operations

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add some amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

### Development Guidelines

- Follow the existing code style and conventions
- Write tests for new features
- Update documentation as needed
- Ensure all TypeScript and ESLint checks pass
- Follow semantic versioning for releases

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🆘 Support

For support and questions:

- **Documentation**: Check the [DEPLOYMENT.md](DEPLOYMENT.md) guide
- **Issues**: Open an issue on GitHub
- **Email**: support@digiwize.com

## 🏢 About Digiwize

Digiwize is a technology company specializing in logistics and transportation management solutions. This PWA represents our commitment to modernizing traditional Windows-based logistics applications for the web.

---

**Built with ❤️ by the Digiwize team**
