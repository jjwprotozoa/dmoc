// src/server/api/root.ts
import { clientsRouter } from './routers/clients';
import { contactsRouter } from './routers/contacts';
import { countriesRouter } from './routers/countries';
import { driverRouter } from './routers/driver';
import { driversRouter } from './routers/drivers';
import { locationsRouter } from './routers/locations';
import { logisticsOfficersRouter } from './routers/logistics-officers';
import { manifestRouter } from './routers/manifest';
import { offensesRouter } from './routers/offenses';
import { tenantsRouter } from './routers/tenants';
import { trackingRouter } from './routers/tracking';
import { uploadsRouter } from './routers/uploads';
import { vehicleCombinationsRouter } from './routers/vehicle-combinations';
import { vehiclesRouter } from './routers/vehicles';
import { router } from './trpc';

export const appRouter = router({
  manifest: manifestRouter,
  tracking: trackingRouter,
  offenses: offensesRouter,
  uploads: uploadsRouter,
  tenants: tenantsRouter,
  vehicles: vehiclesRouter,
  drivers: driversRouter,
  driver: driverRouter,
  clients: clientsRouter,
  contacts: contactsRouter,
  countries: countriesRouter,
  locations: locationsRouter,
  logisticsOfficers: logisticsOfficersRouter,
  vehicleCombinations: vehicleCombinationsRouter,
});

export type AppRouter = typeof appRouter;
