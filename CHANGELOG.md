# Changelog

All notable changes to the DMOC Web (PWA) project will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

### Added

- **Connection-Ready Integration Architecture** - Complete integration setup for safe Vercel deployment without credentials (JUS-29)
- **Standardized Environment Guards** - `ensureConfigured()` pattern prevents live API calls when credentials are missing
- **Integration Status Dashboard** - `/api/integrations/status` endpoint shows configuration status for all services
- **UltraMsg WhatsApp Service** - Complete WhatsApp integration with message sending and webhook handling
- **Traccar GPS Tracking Service** - Full GPS tracking integration with device management and position tracking
- **Tive Logistics Service** - Shipment and tracker management integration
- **HTTP Client Factory** - Robust HTTP client with retry logic, abort signals, and error handling
- **Environment Configuration Template** - Complete `.env.example` with all required variables and documentation
- **Production-Ready Prisma Schema** - MySQL schema ready for `npx prisma db pull` when credentials are available
- **Integration Verification Checklist** - Comprehensive testing guide in `docs/INTEGRATION_CHECKS.md`
- **WhatsApp API Endpoints** - `/api/whatsapp/send` and `/api/whatsapp/webhook` for message handling
- **Traccar API Endpoints** - `/api/traccar/devices`, `/api/traccar/positions`, and `/api/traccar/webhook`
- **Safe Deployment Pattern** - Build succeeds without credentials, integrations activate when env vars are added
- **Context7-Grounded Service Modules** - All integrations use Context7 documentation for accurate API implementation
- **Comprehensive tRPC API Routers** - Complete CRUD operations for clients, drivers, and vehicles with tenant isolation
- **Database Schema Migration** - Full MySQL production schema with SQLite development support
- **Database Migration Documentation** - Complete setup guide for MySQL production deployment
- **Enhanced Database Seeding** - Comprehensive seed data for clients, drivers, vehicles, and tenants
- **Production Database Support** - Separate production and development database configurations
- **Advanced Search and Filtering** - Multi-field search capabilities across all entity types
- **Entity Statistics APIs** - Comprehensive statistics endpoints for clients, drivers, and vehicles
- **Tenant-Based Data Isolation** - Proper multi-tenant data separation at the database level
- **Grouped Sidebar Navigation** - Organized navigation items into logical groups (Manifests, Fleet Management, Operations, People & Contacts, Business, System)
- **Collapsible Menu Groups** - Click to expand/collapse navigation groups with smooth animations
- **Scrollable Sidebar** - Fixed sidebar height with proper overflow handling for long navigation lists
- **Enhanced Menu Animations** - Smooth expand/collapse transitions with staggered item animations
- **Chevron Indicators** - Visual indicators (ChevronDown/ChevronRight) showing group expansion state
- **VehicleCombination Models** - Added VehicleCombination and VehicleCombinationTrailer models to Prisma schema for horse-trailer pairing functionality
- **Vehicle Combinations Router** - Complete tRPC router for managing vehicle combinations with CRUD operations and tenant isolation
- **Linear Integration Documentation** - Added comprehensive Linear workspace configuration to .cursorrules
- **Project Configuration File** - Created LINEAR_CONFIG.md with detailed Linear integration settings
- **MCP Configuration Guidelines** - Documented correct team identifiers and issue creation process
- **Git Branch Naming Standards** - Established consistent branch naming format (jjwprotozoa/jus-{issue-number}-{title})
- **Issue Tracking Workflow** - Defined process for creating and managing Linear issues

- Enhanced mobile responsiveness for modal dialogs across all device sizes
- Fixed modal positioning and sizing issues on mobile devices
- Added mobile-first responsive design utilities and breakpoints
- Created comprehensive mobile modal test suite
### Changed

- **Integration Architecture** - Migrated to connection-ready pattern with environment guards preventing build failures
- **Service Module Structure** - Standardized all integration services with `ensureConfigured()` guards
- **Environment Variable Handling** - Enhanced env.ts with integration status helpers and standardized guards
- **API Architecture** - Migrated from mock data to comprehensive tRPC routers with database integration
- **Database Configuration** - Updated to support both MySQL (production) and SQLite (development) databases
- **Data Persistence** - Replaced temporary mock data with persistent database storage
- **Router Structure** - Added dedicated routers for clients, drivers, and vehicles with full CRUD operations
- **Database Schema** - Enhanced with proper relationships, indexes, and tenant isolation
- **Seed Data Structure** - Comprehensive seeding with realistic data for all entity types
- **Tailwind Configuration** - Added custom animations and enhanced styling capabilities
- **Navigation Structure** - Reorganized 19 navigation items into 6 logical groups for better organization
- **Color Scheme** - Improved contrast with dark gray background and white text/icons for better readability
- **Menu Behavior** - Groups expand/collapse independently with persistent state management
- **Visual Hierarchy** - Better visual separation between group headers and individual items
- **Default Group States** - Manifests and Fleet Management groups open by default, others collapsed

### Fixed

- **Navigation Menu Collapse Issue** - Fixed Fleet Management and other navigation groups not collapsing properly (JUS-28)
- **Database Connection Issues** - Resolved SQLite/MySQL configuration conflicts and connection errors
- **TypeScript Router Errors** - Fixed all TypeScript errors in new tRPC routers including proper imports and context access
- **Database Schema Validation** - Corrected Prisma schema relationships and field types for proper data integrity
- **Tenant Isolation** - Ensured proper tenant-based data filtering across all database queries
- **API Response Consistency** - Standardized API responses and error handling across all routers
- **Database Migration Process** - Streamlined migration from mock data to persistent database storage
- **Color Contrast Issues** - Resolved poor visibility of yellow/gold icons on light gradient backgrounds
- **Menu Overflow** - Fixed static menu that couldn't scroll to show all navigation items
- **Vehicle Router TypeScript Errors** - Fixed 14 TypeScript compilation errors in vehicles router related to VehicleWhereInput type recognition
- **Prisma Type Generation Issues** - Resolved VehicleWhereInput type not recognizing Vehicle model fields (tenantId, registration, countryOfOrigin, entityTypeDescription, currentDriver, location, status)
- **Navigation Organization** - Improved findability by grouping related functions together
- **Visual Consistency** - Consistent color scheme throughout entire sidebar for better UX
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
- **Data Masking System** - ID numbers and contact details masked for unauthorized users (e.g., TAE**_089, 255_**0307)
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
- \*\*Comprehensive TypeScript type definitions for Cloudflare Workers
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

- **TypeScript Router Errors** - Fixed all 28 TypeScript errors in vehicles router including tRPC imports, context access, and Prisma schema issues
- **tRPC Import Issues** - Corrected createTRPCRouter import to use router from trpc.ts across all router files
- **Context User Access** - Fixed ctx.user references to use ctx.session.user for proper context structure
- **Prisma Schema Validation** - Removed non-existent VehicleCombination and VehicleCombinationTrailer models causing relation errors
- **Database Relations** - Added proper companyId relations between Company, Driver, and Vehicle models
- **Type Safety** - Added type assertions for Prisma where clauses to resolve tenantId filtering issues
- **Router Consistency** - Applied same fixes to clients.ts and drivers.ts routers for consistency
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

- **Enhanced Database Security** - Proper tenant isolation at the database level preventing cross-tenant data access
- **API Authentication** - All new tRPC routers require proper authentication and tenant validation
- **Data Validation** - Comprehensive input validation using Zod schemas for all API endpoints
- **SQL Injection Prevention** - Prisma ORM provides protection against SQL injection attacks
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

### Technical Improvements

- **Database Architecture** - Migrated from mock data to full database persistence with Prisma ORM
- **Multi-Database Support** - SQLite for development, MySQL for production with seamless switching
- **API Standardization** - Consistent tRPC patterns across all routers with proper error handling
- **Type Safety** - Enhanced TypeScript integration with proper Prisma types and Zod validation
- **Performance Optimization** - Database queries optimized with proper indexing and relationships
- **Scalability Preparation** - Database architecture ready for multi-tenant production deployment
- **Development Workflow** - Streamlined database setup with comprehensive seeding and migration scripts
- **Code Organization** - Modular router structure with clear separation of concerns
- **Error Handling** - Comprehensive error handling and validation across all API endpoints
- **Documentation** - Complete database migration guide and setup instructions

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

| Version | Date       | Description                                                  |
| ------- | ---------- | ------------------------------------------------------------ |
| 1.0.2   | 2025-01-15 | React Leaflet migration and map responsiveness fixes (JUS-7) |
| 1.0.1   | 2024-12-19 | Map component enhancements and WebSocket fixes               |
| 0.1.0   | 2024-01-15 | Initial release with core PWA functionality                  |

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
