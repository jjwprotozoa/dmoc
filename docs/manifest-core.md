# DMOC Manifest Core Documentation

## Overview

The DMOC Manifest Core is a comprehensive system for managing logistics manifests with real-time tracking, WhatsApp integration, and audit trails. This implementation provides the foundation for the DMOC web application's manifest management capabilities.

## Features

- **Manifest Management**: Create, read, update, and track manifests
- **Real-time Location Tracking**: Record and display GPS coordinates
- **WhatsApp Integration**: Store and manage WhatsApp messages, files, media, and locations
- **Audit Trail**: Complete audit logging for all manifest changes
- **File Storage**: S3/MinIO integration for media files
- **Tenant Isolation**: Multi-tenant architecture with proper data isolation

## Database Schema

### Core Models

#### Manifest
- Primary manifest entity with tracking information
- Links to routes, locations, invoice states
- Contains tracking ID, job number, RMN, etc.

#### ManifestLocation
- GPS tracking data for manifests
- Stores latitude/longitude with timestamps
- Used for route visualization and tracking

#### InvoiceState
- Invoice status management (New, Sent, Paid, etc.)
- Referenced by manifests for billing status

#### Route
- Route definitions for manifests
- Tenant-isolated route management

#### Location
- Physical locations (depots, ports, hubs)
- GPS coordinates and descriptions

### WhatsApp Integration Models

#### WhatsappData
- Parent entity for WhatsApp messages
- Links to manifests for context

#### WhatsappFile
- File attachments from WhatsApp
- Stores metadata (name, size, checksum, URI)

#### WhatsappMedia
- Media files (images, videos, audio)
- Includes extension and original link

#### WhatsappLocation
- Location shares from WhatsApp
- GPS coordinates with optional thumbnail

### Audit & User Management

#### ManifestAudit
- Complete audit trail for manifest changes
- Stores old/new values as JSON
- Action tracking (create, update, location_update, etc.)

#### UserProfile & UserRole
- User management system
- Role-based access control

## API Endpoints

### tRPC Router: `manifest`

#### Read Operations
- `list({ q?, limit?, cursor? })` - Paginated manifest list with search
- `getById({ id })` - Get complete manifest details
- `timeline({ manifestId })` - Get location and WhatsApp data timeline
- `audit({ manifestId, limit? })` - Get audit trail

#### Write Operations
- `create({ trackingId, routeId?, locationId?, ... })` - Create new manifest
- `update({ id, patch })` - Update manifest fields
- `addLocation({ manifestId, latitude, longitude, recordedAt? })` - Add GPS point
- `getSignedUpload({ manifestId, kind, filename, contentType? })` - Get S3 upload URL
- `attachMedia({ manifestId, type, fileName, uri, ... })` - Link uploaded file

## Storage Integration

### S3/MinIO Configuration
```env
S3_ENDPOINT=https://s3.your-endpoint.tld
S3_REGION=auto
S3_BUCKET=dmoc-media
S3_ACCESS_KEY_ID=***
S3_SECRET_ACCESS_KEY=***
S3_FORCE_PATH_STYLE=false
```

### File Upload Flow
1. Client requests signed upload URL via `getSignedUpload`
2. Client uploads file directly to S3/MinIO
3. Client calls `attachMedia` to link file to manifest
4. File metadata stored in database with URI reference

## UI Components

### Manifest Detail Page (`/manifests/[id]`)
- **Details Tab**: Basic manifest information
- **Timeline Tab**: Location tracking and WhatsApp media
- **Files Tab**: File upload and management
- **Audit Tab**: Complete change history

### Key Features
- Real-time file upload with progress
- Location tracking visualization
- WhatsApp media display
- Audit trail with JSON diff display

## Security & Tenant Isolation

- All queries filtered by `tenantId` from session
- No cross-tenant data access
- Signed URLs for secure file uploads
- Audit trail for compliance

## Development Setup

### Prerequisites
- Node.js 18+
- SQLite (development) / MySQL (production)
- S3/MinIO instance for file storage

### Installation
```bash
# Install dependencies
npm install

# Generate Prisma client
npx prisma generate

# Push schema to database
npx prisma db push

# Seed with sample data
npm run db:seed

# Start development server
npm run dev
```

### Testing
```bash
# Run integration tests
npm test

# Run specific manifest tests
npm test tests/manifest.router.test.ts
```

## Sample Data

The seed script creates:
- 2 sample manifests with tracking IDs
- 5 location tracking points
- WhatsApp data with files and media
- Complete audit trail
- Invoice states and routes

## Migration from Windows

This implementation preserves legacy IDs (`companyId`, `driverId`, `vehicleId`) for Windows migration compatibility while adding modern web features:

- Real-time updates via WebSocket
- PWA offline support
- Modern responsive UI
- Cloud file storage
- Multi-tenant architecture

## Next Steps

1. **Real-time Updates**: Implement WebSocket integration for live manifest updates
2. **Map Integration**: Add Leaflet maps for route visualization
3. **WhatsApp Webhook**: Process incoming WhatsApp messages
4. **Mobile App**: React Native app for drivers
5. **Analytics**: Dashboard with manifest statistics

## Troubleshooting

### Common Issues

1. **S3 Upload Fails**: Check credentials and bucket permissions
2. **Tenant Isolation**: Ensure session includes `tenantId`
3. **File Not Found**: Verify S3/MinIO endpoint configuration
4. **Audit Trail Missing**: Check JSON serialization in audit creation

### Debug Mode
Set `NODE_ENV=development` for detailed logging and error messages.
