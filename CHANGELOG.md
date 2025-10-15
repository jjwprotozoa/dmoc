# Changelog

All notable changes to the DMOC Web (PWA) project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added
- N/A

### Changed
- N/A

### Fixed
- N/A

### Security
- N/A

### Deprecated
- N/A

### Removed
- N/A

---

## [1.0.1] - 2024-12-19

### Added
- Enhanced Map component with improved Leaflet integration
- Real-time location tracking with dynamic markers
- Comprehensive popup information for vehicle locations
- Automatic map bounds fitting for multiple vehicles
- ResizeObserver integration for responsive map sizing
- Improved CSS containment for Leaflet elements
- Enhanced error handling and loading states

### Changed
- Map component now uses dynamic Leaflet imports for better performance
- Improved map initialization with multiple resize attempts
- Enhanced marker management with proper cleanup
- Better container sizing and positioning for map elements

### Fixed
- Fixed online status tracking and WebSocket connection issues
- Resolved map container sizing problems in dashboard
- Fixed Leaflet marker icon loading issues
- Improved map responsiveness on window resize
- Fixed CSS z-index conflicts with map elements

### Security
- Enhanced webhook rate limiting for WhatsApp integration
- Improved input validation for location data
- Better error handling for unauthorized access attempts

---

## [0.1.0] - 2024-01-15

### Added
- Multi-tenant logistics operations PWA
- Real-time vehicle tracking with Socket.IO
- Manifest management system
- WhatsApp and GPS webhook integration
- ANPR (Automatic Number Plate Recognition) mock endpoints
- Biometrics placeholder system
- PWA installation and offline support
- NextAuth.js authentication system
- Prisma ORM with MySQL database
- BullMQ job queue system
- MinIO/S3-compatible file storage
- Tailwind CSS + shadcn/ui components
- Real-time activity feed
- Multi-tenant data isolation
- Rate limiting for webhook endpoints
- Service worker for offline functionality

### Technical Stack
- **Frontend**: Next.js 15 (App Router), TypeScript, Tailwind CSS
- **Backend**: NestJS, tRPC, Prisma ORM
- **Database**: MySQL 8.0+
- **Real-time**: Socket.IO
- **Authentication**: NextAuth.js
- **Maps**: React Leaflet + OpenStreetMap
- **Storage**: S3-compatible (MinIO/Cloudflare R2)
- **Queues**: BullMQ + Redis
- **PWA**: Workbox + Service Worker
- **AI/ML**: YOLOv8 + PaddleOCR (ANPR), InsightFace/DeepFace (Biometrics)

### Security Features
- Tenant isolation via tenant_id on all queries
- Rate limiting on webhook endpoints
- Input validation with Zod schemas
- Content Security Policy headers
- Secure authentication with NextAuth.js

---

## Version History

| Version | Date | Description |
|---------|------|-------------|
| 1.0.1 | 2024-12-19 | Map component enhancements and WebSocket fixes |
| 0.1.0 | 2024-01-15 | Initial release with core PWA functionality |

---

## Changelog Guidelines

### Version Numbering
- **MAJOR** (X.0.0): Breaking changes, major feature additions
- **MINOR** (0.X.0): New features, significant improvements
- **PATCH** (0.0.X): Bug fixes, minor improvements, documentation updates

### Change Categories
- **Added**: New features
- **Changed**: Changes to existing functionality
- **Fixed**: Bug fixes
- **Security**: Security improvements or fixes
- **Deprecated**: Features marked for removal
- **Removed**: Removed features

### Entry Format
```markdown
### Added
- Feature description with context
- Another feature

### Changed
- Change description with impact
- Another change

### Fixed
- Bug fix description
- Another fix
```

### Automated Updates
This changelog is automatically updated using:
- `npm run changelog:add` - Add new changelog entry
- `npm run changelog:version` - Bump version and create new section
- Git hooks for automatic updates on commit/merge

### Manual Updates
For manual updates, follow the format above and ensure:
1. Entries are in reverse chronological order (newest first)
2. Each entry includes a brief description
3. Breaking changes are clearly marked
4. Security-related changes are highlighted
5. Version dates follow YYYY-MM-DD format
