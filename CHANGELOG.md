# Changelog

All notable changes to the DMOC Web (PWA) project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Fixed
- **TypeScript Build Errors** - Resolved all unused variable errors in dashboard components
- **ESLint Compliance** - Fixed unescaped entities and explicit any types throughout codebase
- **Production Build** - Eliminated all compilation errors preventing production deployment
- **Code Quality** - Removed unused state variables and onClick handlers in card view components
- **Type Safety** - Added proper Manifest interface with company and createdAt properties
- **Component Cleanup** - Removed unused selectedClient, selectedDriver, selectedVehicle state variables
- **Handler Cleanup** - Removed unused handleSelectAll functions from card view components
- **Index Parameter** - Fixed unused index parameter in vehicle combinations mapping
- **Entity Escaping** - Fixed unescaped apostrophe in call dialog component
- **Type Definitions** - Replaced explicit any types with proper Manifest interface in active manifests page

### Changed
- **Build Process** - Streamlined build process with proper error handling and validation
- **Code Standards** - Enhanced code quality standards with stricter TypeScript and ESLint rules
- **Production Readiness** - Improved production deployment readiness with comprehensive error fixes
- **Vehicles Card View with Tabbed Interface** - Comprehensive fleet management with Horses, Trailers, and Combinations tabs
- **Manual Fuel Monitoring System** - Realistic fuel entry logging with driver input for refuel tracking
- **Horse-Trailer Combination Management** - Track active combinations with multiple trailers per horse
- **Vehicle Logbook System** - Complete maintenance and fuel consumption history tracking
- **Multi-Trailer Support** - Support for road trains with multiple trailers attached to one horse
- **Fuel Entry Dialog** - Manual fuel logging form with amount, cost, odometer, driver, location, and date
- **Combination Status Tracking** - Active, In Transit, Loading, Unloading status for horse-trailer pairs
- **Cargo and Route Management** - Track what each combination is carrying and where it's going
- **Service Due Alerts** - Visual warnings for upcoming maintenance with color-coded status indicators
- **Days Since Last Fuel Tracking** - Smart fuel status with green/orange/red indicators based on refuel frequency
- **Tab-Based Vehicle Filtering** - Separate views for Horses (trucks), Trailers, and active Combinations
- **Enhanced Vehicle Details Modal** - Comprehensive vehicle information with maintenance history
- **Disconnect Combination Functionality** - Break up horse-trailer combinations when needed
- **Context-Aware Empty States** - Different messages and icons for each tab when no vehicles found
- **Individual Card Authentication** - Each driver card requires separate authentication for unlocking sensitive data
- **Call Dialog Component** - Professional modal for phone call confirmation with privacy controls
- **Per-Card Privacy State** - Independent lock/unlock state management for each driver card
- **Enhanced Phone Calling** - Click-to-call functionality with masked number display for privacy protection
- **POPIA-Compliant Privacy Controls** - Comprehensive data protection system for sensitive driver information
- **Role-Based Access Control** - Admin/Manager roles with full access, Operator/Viewer roles with masked data
- **Data Masking System** - ID numbers and contact details masked for unauthorized users (e.g., TAE***089, 255***0307)
- **Authentication Dialog** - Password-protected access to sensitive driver details with audit trail
- **Click-to-Dial Functionality** - Direct phone dialing for authorized users with proper privacy controls
- **Driver Card View (A/B Test)** - Mobile-optimized card layout with progressive disclosure of information
- **Driver Details Modal** - Comprehensive modal with full driver information and privacy-controlled actions
- **Privacy Notice Banner** - Real-time display of user role and data access level
- **shadcn/ui Component Library** - Professional UI components (Button, DropdownMenu, Dialog, Input, Label)
- **Modernized Navigation System** - Complete redesign with steampunk/industrial theme
- **Responsive Sidebar Navigation** - Collapsible desktop sidebar with all 19 navigation categories
- **Mobile Bottom Navigation** - Touch-friendly bottom nav with expandable "More" menu
- **Tenant-Specific Theming** - Dynamic theme support for Delta (blue), Cobra (red), and Digiwize (amber)
- **Theme Context Provider** - Centralized theme management with automatic tenant-based switching
- **Modern Top Navigation Bar** - Clean header with search, notifications, and user menu
- **Navigation State Management** - Active state indicators and smooth transitions
- **Sample Dashboard Pages** - Functional pages for Active Manifests, Vehicles, Routes, Trackers, Settings, and Clients
- **Comprehensive TypeScript type definitions for Cloudflare Workers
- Service Worker event type interfaces (PushEvent, NotificationEvent, PushMessageData)
- Client and WindowClient interfaces for service worker client management
- Proper ExecutionContext interface for Cloudflare Workers
- Custom Next.js server with Socket.IO integration for real-time features
- Socket.IO server configuration with tenant, company, and manifest room management
- Enhanced Socket.IO client hook with connection error handling and status monitoring
- Socket.IO test page for connection verification and debugging
- Real-time activity feed with Socket.IO connection status indicator

### Changed
- **Vehicle Management Architecture** - Replaced single vehicle list with tabbed interface for better fleet organization
- **Fuel Monitoring Approach** - Changed from automatic fuel level monitoring to manual refuel entry system
- **Vehicle Data Structure** - Enhanced with combination tracking, fuel entries, and maintenance scheduling
- **Fleet Organization** - Separated Horses (prime movers) and Trailers for specialized management
- **Search Functionality** - Enhanced to work across all tabs with appropriate context filtering
- **Authentication Flow** - Removed global authentication state, now requires individual authentication per driver card
- **Phone Calling Behavior** - Phone calls now show masked numbers in call dialog until individual card is authenticated
- **Privacy Controls** - Enhanced per-card privacy state management with independent lock/unlock functionality
- **Call Dialog UX** - Improved call confirmation modal with privacy notices and masked number display
- **Driver Actions Layout** - Moved actions column to left side for better visibility and accessibility
- **Driver Actions Organization** - Separated global actions (Add Driver) from driver-specific actions (Edit, Capture, Generate)
- **Table vs Card View** - Created A/B test setup with easy navigation between traditional table and modern card layouts
- **Privacy-First Design** - All sensitive data now properly masked with visual indicators for unauthorized users
- **Mobile-First Approach** - Card view optimized for mobile devices with responsive grid layout
- **Dashboard Layout Architecture** - Replaced basic DashboardNav with comprehensive MainNav system
- **Navigation Component Structure** - Modularized navigation into SidebarNav, TopNav, and BottomNav components
- **Theme Integration** - Updated all navigation components to support dynamic tenant theming
- **Layout Responsiveness** - Enhanced mobile experience with dedicated bottom navigation
- **User Experience** - Improved navigation flow with active state indicators and smooth transitions
- Updated manifest router to properly handle JSON field serialization
- Enhanced tenants router with proper type conversion for settings field
- Improved uploads router meta field handling with JSON serialization
- Refactored service worker with proper TypeScript typing throughout
- Modified package.json scripts to use custom server for Socket.IO support
- Updated Socket.IO client configuration with improved transport settings and timeout handling

### Fixed
- **Individual Card Authentication** - Fixed issue where authenticating one card would unlock all driver cards
- **Phone Call Privacy** - Resolved phone number exposure in call dialogs for unauthorized users
- **Lock Icon Behavior** - Corrected lock/unlock state management to be per-card instead of global
- **CRITICAL**: Fixed Socket.IO connection error "Could not establish connection. Receiving end does not exist"
- **Socket.IO Server Configuration** - Enhanced server setup with proper request handling and error management
- **Socket.IO Client Connection** - Improved client configuration with robust reconnection logic and error handling
- **CORS Configuration** - Added multiple allowed origins for Socket.IO connections in development and production
- **Middleware Integration** - Excluded Socket.IO routes from authentication middleware to prevent connection interference
- **API Route Handler** - Created proper Socket.IO API route handler for Next.js App Router compatibility
- **Connection Debugging** - Added comprehensive error logging and connection state monitoring
- **Transport Optimization** - Improved polling and WebSocket upgrade handling with proper timeouts
- **Database Configuration** - Fixed database configuration mismatch causing 500 errors on TRPC endpoints
- **Database Provider Configuration** - Corrected Prisma schema to use MySQL for production and SQLite for development
- **Windows Compatibility** - Fixed package.json scripts to use Windows-compatible copy commands instead of Unix cp
- **Database Connection Errors** - Resolved "URL must start with postgresql://" validation errors
- **Prisma Client Generation** - Fixed permission issues preventing proper client generation on Windows
- **Development Environment Setup** - Ensured development server uses correct SQLite schema by default
- **Navigation TypeScript Errors** - Resolved duplicate Truck icon imports in navigation components
- **Manifest Data Structure** - Fixed active manifests page to use correct Prisma schema properties
- **Map Container Z-Index** - Fixed map container floating over other elements and bottom navigation menu
- **Map Layout Positioning** - Ensured proper z-index hierarchy with map at z-0 and navigation at z-50
- **Icon Import Issues** - Corrected TruckConvoy icon references (replaced with Truck icon)
- **Theme Class Generation** - Fixed dynamic Tailwind CSS class generation for tenant themes
- **Component Props** - Resolved TypeScript errors in navigation component interfaces
- Resolved TypeScript build errors in manifest router (location field type mismatch)
- Fixed ESLint warning in Map component (replaced 'any' with proper type assertion)
- Corrected tenants router settings field type conversion issue
- Fixed uploads router meta field JSON serialization
- Resolved Cloudflare Workers ExecutionContext type definition
- Fixed service worker NavigationRoute return type issue
- Corrected service worker event listener typing problems
- Resolved missing ServiceWorkerGlobalScope properties (registration, clients)
- Fixed push notification event data typing
- Corrected notification click event handling
- **CRITICAL**: Fixed Socket.IO HTTP headers conflict causing ERR_HTTP_HEADERS_SENT errors
- **CRITICAL**: Resolved Socket.IO rapid connection looping issue
- Fixed Socket.IO request routing conflicts with Next.js request handler
- Corrected Socket.IO server initialization order and configuration
- Fixed Socket.IO client connection stability and error handling

### Security
- **Enhanced Per-Card Privacy** - Individual authentication required for each driver card, preventing bulk data exposure
- **Call Dialog Privacy Protection** - Phone numbers remain masked in call dialogs until individual authentication
- **Granular Access Control** - Each driver's sensitive data requires separate authentication for maximum security
- **POPIA Compliance** - Implemented comprehensive data protection measures for personal information
- **Sensitive Data Masking** - ID numbers and contact details automatically masked for unauthorized users
- **Role-Based Data Access** - Strict access controls based on user roles (Admin/Manager vs Operator/Viewer)
- **Authentication Required** - Password protection for accessing sensitive driver information
- **Audit Trail** - All sensitive data access logged for compliance and security monitoring
- **Privacy by Design** - Data masking applied by default with clear visual indicators
- **Click-to-Dial Security** - Phone dialing functionality restricted to authorized users only

### Deprecated
- N/A

### Removed
- N/A

---

## [1.0.2] - 2025-01-15

### Added
- React Leaflet integration for better React component lifecycle management
- Error boundary component for map loading failures with retry functionality
- Enhanced loading states with animated spinner for better UX
- Automatic map bounds fitting component using React Leaflet hooks

### Changed
- Migrated Map component from manual Leaflet to React Leaflet components
- Replaced complex manual map lifecycle management with declarative React components
- Simplified marker management using React's reconciliation algorithm
- Improved TypeScript integration with proper Leaflet types

### Fixed
- Resolved map container sizing and responsiveness issues (JUS-7)
- Fixed Leaflet marker icon loading problems
- Eliminated CSS z-index conflicts with map elements
- Removed complex ResizeObserver integration - React Leaflet handles responsiveness automatically
- Reduced code complexity by ~50% (300+ lines → 145 lines)

### Removed
- Manual Leaflet map initialization and cleanup logic
- Complex ResizeObserver and window resize event handling
- Manual CSS injection for Leaflet container styling
- Custom TypeScript interfaces replaced with proper Leaflet types

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
| 1.0.2 | 2025-01-15 | React Leaflet migration and map responsiveness fixes (JUS-7) |
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
