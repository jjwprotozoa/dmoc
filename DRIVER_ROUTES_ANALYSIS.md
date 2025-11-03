# Driver Routes Analysis

## Database Schema Relationships

### Current Structure:

1. **Driver Model** (drivers table)
   - No direct foreign keys to routes or manifests
   - Drivers are identified by `name` field

2. **VehicleCombination Model** (vehicle_combinations table)
   - `driver` (String) - stores driver name (NOT a foreign key)
   - `horseId` (String) - links to Vehicle
   - `route` (String?) - stores route name as text (NOT a foreign key)
   - **A driver can have MULTIPLE VehicleCombinations**
   - Multiple combinations can be active simultaneously

3. **Manifest Model** (manifests table)
   - `horseId` (String?) - links to Vehicle
   - `routeId` (String?) - links to Route (foreign key)
   - **A vehicle can have MULTIPLE Manifests**
   - **Each manifest has ONE route**

4. **Route Model** (routes table)
   - `manifests Manifest[]` - one route can have many manifests

## Relationship Chain:

```
Driver (name: "John Doe")
  ├─ VehicleCombination 1 (driver: "John Doe", horseId: "V-12")
  │   └─ Vehicle V-12
  │       ├─ Manifest 1 (routeId: "Route-A")
  │       └─ Manifest 2 (routeId: "Route-B")
  │
  └─ VehicleCombination 2 (driver: "John Doe", horseId: "V-18")
      └─ Vehicle V-18
          └─ Manifest 3 (routeId: "Route-C")
```

## Answer: YES, drivers CAN have multiple routes

### Reasons:

1. ✅ A driver can have **multiple VehicleCombinations** simultaneously
2. ✅ Each VehicleCombination links to a Vehicle (horse)
3. ✅ Each Vehicle can have **multiple Manifests**
4. ✅ Each Manifest can have a **different Route**

### Example Scenario:

A driver "John Doe" could simultaneously be:

- Assigned to Vehicle V-12 with Manifest going to Route A
- Assigned to Vehicle V-18 with Manifest going to Route B
- Have multiple manifests on the same vehicle with different routes

## Current Implementation Status:

The current `driverRouter.getMyTrips` query **CORRECTLY supports multiple routes**:

```typescript
// Finds ALL vehicle combinations for driver
const driverCombinations = await db.vehicleCombination.findMany({
  where: {
    tenantId: ctx.session.user.tenantId,
    driver: driver.name, // Finds ALL combinations for this driver
    status: { in: ['Active', 'In Transit'] },
  },
});

// Gets ALL vehicles from those combinations
const horseIds = driverCombinations.map((vc) => vc.horseId);

// Finds ALL manifests for those vehicles (can have different routes)
const manifests = await db.manifest.findMany({
  where: {
    tenantId: ctx.session.user.tenantId,
    horseId: { in: horseIds }, // All vehicles for this driver
  },
  include: {
    route: { select: { id: true, name: true } }, // Each manifest has its route
  },
});
```

## Conclusion:

✅ **YES - Drivers can have multiple routes**  
✅ **Current implementation already supports this**  
✅ **The query returns all manifests across all routes for a driver**
