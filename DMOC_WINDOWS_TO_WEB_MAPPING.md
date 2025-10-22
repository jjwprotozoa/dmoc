# DMOC Windows to Web Application Mapping

## Overview

This document provides a comprehensive mapping between the Windows DMOC.exe application and the new Next.js+tRPC+Prisma web application structure. Use this for reverse engineering and analysis.

## 🏗️ **Application Architecture Mapping**

### **Windows DMOC.exe → Web PWA**

- **Legacy**: Windows Desktop Application (.exe)
- **Modern**: Progressive Web Application (PWA)
- **Architecture**: Monolithic → Multi-tenant SaaS
- **Database**: Local SQL Server → Cloud MySQL/PostgreSQL
- **UI**: Windows Forms → React/Next.js with Tailwind CSS

## 📊 **Database Schema Mapping**

### **Core Entities (Prisma Models)**

#### **Tenant Management**

```typescript
// Multi-tenant isolation (NEW in web version)
model Tenant {
  id        String   @id @default(cuid())
  name      String   // "Delta", "Cobra", "Digiwize"
  slug      String   @unique
  settings  String   // JSON configuration
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}
```

#### **User Management**

```typescript
model User {
  id           String   @id @default(cuid())
  tenantId     String   // Multi-tenant isolation
  email        String   @unique
  passwordHash String
  role         String   // ADMIN, MANAGER, OPERATOR, VIEWER
  createdAt    DateTime @default(now())
  updatedAt    DateTime @updatedAt
}
```

#### **Client Management**

```typescript
model Client {
  id                   String   @id @default(cuid())
  tenantId            String   // Multi-tenant isolation
  companyId           Int      @unique // Legacy ID from Windows
  companyTypeId       Int?
  entityTypeDescription String
  name                String
  address             String?
  displayValue        String
  createdAt           DateTime @default(now())
  updatedAt           DateTime @updatedAt
}
```

#### **Driver Management**

```typescript
model Driver {
  id              String   @id @default(cuid())
  tenantId        String   // Multi-tenant isolation
  companyId       String?
  driverId        Int      @unique // Legacy ID from Windows
  name            String
  contactNr       String?
  idNumber        String
  pictureLoaded   Boolean  @default(false)
  countryOfOrigin String
  displayValue    String
  info            String?
  active          Boolean  @default(true)
  createdAt       DateTime @default(now())
  updatedAt       DateTime @updatedAt
}
```

#### **Vehicle Management**

```typescript
model Vehicle {
  id                    String   @id @default(cuid())
  tenantId              String   // Multi-tenant isolation
  companyId             String?
  vehicleId             Int      @unique // Legacy ID from Windows
  vehicleTypeId         Int?
  entityTypeDescription String   // "HORSE", "TRAILER"
  registration          String
  color                 String?
  countryOfOrigin       String
  displayValue          String
  mileage               Int?
  lastServiceDate       DateTime?
  nextServiceDue        DateTime?
  status                String   // Active, In Transit, Maintenance, Out of Service
  currentDriver         String?
  location              String?
  lastSeen              String?
  trackerDeviceId       String?
  createdAt             DateTime @default(now())
  updatedAt             DateTime @updatedAt
}
```

#### **Vehicle Combinations (Horse + Trailer)**

```typescript
model VehicleCombination {
  id        String   @id @default(cuid())
  tenantId  String   // Multi-tenant isolation
  horseId   String   // References Vehicle (HORSE type)
  driver    String
  status    String   // Active, In Transit, Loading, Unloading
  startDate DateTime
  cargo     String?
  route     String?
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model VehicleCombinationTrailer {
  id            String   @id @default(cuid())
  combinationId String
  trailerId     String   // References Vehicle (TRAILER type)
  createdAt     DateTime @default(now())
}
```

#### **Manifest System**

```typescript
model Manifest {
  id          String   @id @default(cuid())
  companyId   String
  title       String
  status      String   // SCHEDULED, IN_PROGRESS, COMPLETED, CANCELLED
  scheduledAt DateTime
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Stop {
  id         String   @id @default(cuid())
  manifestId String
  order      Int
  location   String   // JSON: {lat: number, lng: number}
  arrivedAt  DateTime?
  departedAt DateTime?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}
```

#### **Tracking & GPS**

```typescript
model Device {
  id         String   @id @default(cuid())
  tenantId   String   // Multi-tenant isolation
  externalId String   @unique
  lastPingAt DateTime?
  createdAt  DateTime @default(now())
  updatedAt  DateTime @updatedAt
}

model LocationPing {
  id        String   @id @default(cuid())
  deviceId  String
  lat       Float
  lng       Float
  speed     Float?
  heading   Float?
  timestamp DateTime
  createdAt DateTime @default(now())
}
```

#### **Offense Management**

```typescript
model Offense {
  id        String      @id @default(cuid())
  driverId  String?
  vehicleId String?
  kind      String      // SPEEDING, PARKING_VIOLATION, TRAFFIC_VIOLATION, SAFETY_VIOLATION, OTHER
  severity  String      // MINOR, MODERATE, MAJOR, CRITICAL
  notes     String?
  createdAt DateTime    @default(now())
  updatedAt DateTime    @updatedAt
}
```

## 🔌 **API Layer Mapping (tRPC Routers)**

### **Router Structure**

```typescript
// src/server/api/root.ts
export const appRouter = router({
  manifest: manifestRouter, // Manifest management
  tracking: trackingRouter, // GPS tracking
  offenses: offensesRouter, // Offense tracking
  uploads: uploadsRouter, // File uploads
  tenants: tenantsRouter, // Multi-tenant management
  vehicles: vehiclesRouter, // Vehicle management
  drivers: driversRouter, // Driver management
  clients: clientsRouter, // Client management
  vehicleCombinations: vehicleCombinationsRouter, // Horse+Trailer combinations
});
```

### **Key API Endpoints**

#### **Vehicles Router**

- `vehicles.getAll()` - Get all vehicles with filtering
- `vehicles.getById()` - Get specific vehicle
- `vehicles.getStats()` - Vehicle statistics

#### **Drivers Router**

- `drivers.getAll()` - Get all drivers with filtering
- `drivers.getById()` - Get specific driver with offenses
- `drivers.update()` - Update driver information
- `drivers.addOffense()` - Add offense to driver
- `drivers.getStats()` - Driver statistics

#### **Clients Router**

- `clients.getAll()` - Get all clients
- `clients.getById()` - Get specific client
- `clients.create()` - Create new client
- `clients.update()` - Update client
- `clients.delete()` - Delete client
- `clients.getStats()` - Client statistics

#### **Manifest Router**

- `manifest.getAll()` - Get all manifests
- `manifest.getById()` - Get specific manifest with stops
- `manifest.create()` - Create new manifest
- `manifest.updateStatus()` - Update manifest status

#### **Tracking Router**

- `tracking.getDevices()` - Get all tracking devices
- `tracking.getLocationHistory()` - Get location history
- `tracking.getLatestPings()` - Get latest GPS pings

#### **Vehicle Combinations Router**

- `vehicleCombinations.getAll()` - Get all combinations
- `vehicleCombinations.getById()` - Get specific combination
- `vehicleCombinations.create()` - Create new combination
- `vehicleCombinations.updateStatus()` - Update status
- `vehicleCombinations.disconnect()` - Disconnect trailers
- `vehicleCombinations.delete()` - Delete combination

## 🖥️ **Frontend Page Mapping**

### **Dashboard Structure**

```
/dashboard/
├── page.tsx                    // Main dashboard with map, manifests, activity
├── layout.tsx                  // Dashboard layout with navigation
├── clients/
│   ├── page.tsx               // Client list view
│   └── card-view/page.tsx     // Client card view
├── drivers/
│   ├── page.tsx               // Driver list view
│   └── card-view/page.tsx     // Driver card view
├── vehicles/
│   ├── page.tsx               // Vehicle list view
│   └── card-view/page.tsx     // Vehicle card view
├── manifests/
│   ├── active/page.tsx        // Active manifests
│   └── closed/page.tsx       // Closed manifests
├── routes/page.tsx            // Route management
├── trackers/page.tsx          // GPS tracker management
├── incidents/page.tsx         // Incident management
├── contacts/page.tsx          // Contact management
├── countries/page.tsx        // Country management
├── convoys/page.tsx           // Convoy management
├── invoicing/page.tsx         // Invoicing
├── logistics-officers/page.tsx // Logistics officers
├── locations/page.tsx         // Location management
├── transporters/page.tsx      // Transporter management
├── manifest-health/page.tsx   // Manifest health monitoring
└── settings/page.tsx          // Settings
```

### **Key Components**

- `DashboardNav.tsx` - Main navigation
- `ManifestsList.tsx` - Manifest listing
- `ActivityFeed.tsx` - Activity feed
- `Map.tsx` - Interactive map with GPS tracking
- `InstallPrompt.tsx` - PWA installation prompt

## 🔐 **Authentication & Security**

### **Authentication Flow**

- **Windows**: Local Windows authentication
- **Web**: NextAuth.js with JWT tokens
- **Session Management**: Secure cookies
- **Role-Based Access**: ADMIN, MANAGER, OPERATOR, VIEWER

### **Multi-Tenant Security**

- **Tenant Isolation**: All queries filtered by `tenantId`
- **Data Masking**: Sensitive data automatically masked
- **POPIA Compliance**: South African data protection
- **Audit Logging**: All sensitive operations logged

## 📱 **PWA Features (New)**

### **Offline Capabilities**

- **Service Worker**: Caching and offline functionality
- **Dexie Storage**: Client-side database for offline data
- **Background Sync**: Data synchronization when online
- **Install Prompt**: Native app-like installation

### **Real-time Features**

- **Socket.IO**: Real-time updates for manifests and GPS
- **Live Tracking**: Real-time vehicle location updates
- **Push Notifications**: Real-time alerts and updates

## 🔄 **Data Migration Mapping**

### **Legacy ID Preservation**

- **Clients**: `companyId` field preserves Windows client IDs
- **Drivers**: `driverId` field preserves Windows driver IDs
- **Vehicles**: `vehicleId` field preserves Windows vehicle IDs

### **Seed Data Structure**

```typescript
// Example from seed files
const clients = [
  {
    companyId: 3103, // Legacy Windows ID
    name: 'ACCESS',
    address: '',
    entityTypeDescription: 'CLIENT',
    displayValue: 'ACCESS',
  },
  // ... more clients
];
```

## 🚀 **Advanced Features (New)**

### **ANPR Integration**

- **YOLOv8 + PaddleOCR**: Automatic Number Plate Recognition
- **Microservice**: FastAPI-based ANPR service
- **Real-time Processing**: Live plate recognition

### **Biometric Verification**

- **InsightFace/DeepFace**: Selfie/ID matching
- **Security**: Driver identity verification
- **Compliance**: Enhanced security measures

### **WhatsApp Integration**

- **Real-time Communication**: WhatsApp status updates
- **Webhook Integration**: Incoming message processing
- **Driver Communication**: Direct driver contact

### **Background Processing**

- **BullMQ**: Redis-based job queue
- **Heavy Operations**: Async processing for large tasks
- **Scalability**: Queue-based architecture

## 📊 **Monitoring & Analytics**

### **Health Checks**

- `/api/health` - Application health status
- Database connection monitoring
- Redis connection status
- S3 storage availability

### **Logging**

- Structured logging with Winston
- Error tracking and monitoring
- Performance metrics
- Audit trail for compliance

## 🔧 **Development Workflow**

### **Project Management**

- **Linear Integration**: Issue tracking (justwessels team)
- **Git Workflow**: Feature branches with Linear issue IDs
- **Version Control**: Semantic versioning with automated changelog

### **Code Quality**

- **TypeScript**: Strict type checking
- **ESLint + Prettier**: Code formatting
- **Testing**: Vitest for unit testing
- **Git Hooks**: Pre-commit checks

## 📋 **Key Differences from Windows Version**

### **Architecture Changes**

1. **Multi-tenant**: Single app serves multiple clients
2. **Cloud-native**: Designed for cloud deployment
3. **PWA**: Works offline and installable
4. **Real-time**: Live updates via WebSockets
5. **Mobile-first**: Responsive design for mobile devices

### **Security Enhancements**

1. **Tenant Isolation**: Strict data separation
2. **Role-based Access**: Granular permissions
3. **Data Masking**: Automatic sensitive data protection
4. **Audit Logging**: Comprehensive activity tracking

### **New Capabilities**

1. **ANPR**: Automatic license plate recognition
2. **Biometrics**: Driver identity verification
3. **WhatsApp**: Real-time communication
4. **Offline Support**: Works without internet
5. **Push Notifications**: Real-time alerts

## 🎯 **Reverse Engineering Checklist**

### **Windows DMOC.exe Analysis**

- [ ] Identify main forms/windows in Windows app
- [ ] Map Windows forms to web pages
- [ ] Identify database tables and relationships
- [ ] Map Windows database to Prisma models
- [ ] Identify business logic and workflows
- [ ] Map Windows workflows to tRPC procedures
- [ ] Identify user roles and permissions
- [ ] Map Windows permissions to web roles
- [ ] Identify reporting features
- [ ] Map Windows reports to web analytics

### **Data Migration**

- [ ] Extract data from Windows database
- [ ] Map Windows data structure to Prisma schema
- [ ] Preserve legacy IDs for reference
- [ ] Implement data validation and cleaning
- [ ] Test data migration scripts
- [ ] Verify data integrity after migration

### **Feature Parity**

- [ ] Compare Windows features to web features
- [ ] Identify missing features in web version
- [ ] Plan implementation of missing features
- [ ] Test feature compatibility
- [ ] Document differences and limitations

This mapping document should provide you with a comprehensive understanding of how the Windows DMOC.exe application has been transformed into the modern web PWA. Use this as a reference for your reverse engineering work and to ensure feature parity between the two versions.
