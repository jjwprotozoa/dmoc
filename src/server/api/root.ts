// src/server/api/root.ts
import { clientsRouter } from './routers/clients';
import { driversRouter } from './routers/drivers';
import { manifestRouter } from './routers/manifest';
import { offensesRouter } from './routers/offenses';
import { tenantsRouter } from './routers/tenants';
import { trackingRouter } from './routers/tracking';
import { uploadsRouter } from './routers/uploads';
import { vehicleCombinationsRouter } from './routers/vehicle-combinations';
import { vehiclesRouter } from './routers/vehicles';
import { countriesRouter } from './routers/countries';
import { logisticsOfficersRouter } from './routers/logistics-officers';
import { contactsRouter } from './routers/contacts';
import { locationsRouter } from './routers/locations';
import { router } from './trpc';

export const appRouter = router({
  manifest: manifestRouter,
  tracking: trackingRouter,
  offenses: offensesRouter,
  uploads: uploadsRouter,
  tenants: tenantsRouter,
  vehicles: vehiclesRouter,
  drivers: driversRouter,
  clients: clientsRouter,
  vehicleCombinations: vehicleCombinationsRouter,
  countries: countriesRouter,
  logisticsOfficers: logisticsOfficersRouter,
  contacts: contactsRouter,
  locations: locationsRouter,
});

export type AppRouter = typeof appRouter;
