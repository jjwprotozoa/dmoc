// src/server/api/routers/adminUsers.ts
// Admin user management router for Digiwize platform administrators
// Allows managing all users across tenants (create, read, update, deactivate)

import { z } from 'zod';
import * as bcrypt from 'bcrypt';
import { db } from '@/lib/db';
import { digiwizeAdminProcedure, router } from '../trpc';
import { TRPCError } from '@trpc/server';

export const adminUsersRouter = router({
  /**
   * List all users across all tenants with tenant and company information
   * Filters to only show production tenants (Delta, Kobra, Inara, Digiwize)
   * Matches legacy Windows Users screen structure
   */
  list: digiwizeAdminProcedure.query(async () => {
    try {
      // Only show users from production tenants
      const productionTenantSlugs = ['digiwize', 'delta', 'kobra', 'inara'];
      
      const users = await db.user.findMany({
        where: {
          tenant: {
            slug: {
              in: productionTenantSlugs,
            },
          },
        },
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          clientAccess: {
            include: {
              client: {
                select: {
                  id: true,
                  companyId: true,
                  name: true,
                  displayValue: true,
                },
              },
            },
          },
        },
      });

    const mappedUsers = users.map((user) => {
      // Get companies/clients the user has access to
      // Handle case where clientAccess might be empty or client might be null
      const companies = (user.clientAccess || [])
        .filter((uc) => uc.client) // Filter out any null clients
        .map((uc) => ({
          id: uc.client.id,
          companyId: uc.client.companyId,
          name: uc.client.name,
          displayValue: uc.client.displayValue,
        }));

      // Username logic: Use name if available, otherwise use email prefix
      // This matches legacy where username can be "MUWEMA EUGINE", "Accounts", "admin", etc.
      // or email addresses like "dirk@digiwize.tech"
      let username: string;
      if (user.name && user.name.trim() !== '') {
        username = user.name;
      } else {
        // Extract from email - if it's a real email, show the part before @
        // If it's already a username format, use as-is
        username = user.email.includes('@') 
          ? user.email.split('@')[0] 
          : user.email;
      }

      return {
        id: user.id,
        username, // Display name or email prefix as username
        email: user.email,
        name: user.name,
        roleName: user.role,
        isActive: user.isActive ?? true, // Use isActive field from schema
        profileId: user.tenantId,
        profileName: user.tenant.name,
        tenantSlug: user.tenantSlug || user.tenant.slug,
        companies,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    });

      // Sort by username alphabetically (matching legacy Windows Users screen)
      return mappedUsers.sort((a, b) => {
        const usernameA = (a.username || '').toUpperCase();
        const usernameB = (b.username || '').toUpperCase();
        return usernameA.localeCompare(usernameB);
      });
    } catch (error) {
      console.error('Error in adminUsers.list:', error);
      throw new TRPCError({
        code: 'INTERNAL_SERVER_ERROR',
        message: `Failed to fetch users: ${error instanceof Error ? error.message : 'Unknown error'}`,
      });
    }
  }),

  /**
   * Get a single user by ID with all editable fields
   */
  getById: digiwizeAdminProcedure
    .input(z.object({ id: z.string() }))
    .query(async ({ input }) => {
      const user = await db.user.findUnique({
        where: { id: input.id },
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          clientAccess: {
            include: {
              client: {
                select: {
                  id: true,
                  companyId: true,
                  name: true,
                  displayValue: true,
                },
              },
            },
          },
          images: {
            select: {
              id: true,
              type: true,
              uri: true,
              mimeType: true,
              createdAt: true,
            },
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      // Get all clients (companies) available for assignment
      const allClients = await db.client.findMany({
        where: {
          tenantId: user.tenantId,
        },
        select: {
          id: true,
          companyId: true,
          name: true,
          displayValue: true,
        },
        orderBy: {
          name: 'asc',
        },
      });

      // Get currently assigned client IDs
      const companyIds = user.clientAccess.map((uc) => uc.client.id);

      return {
        id: user.id,
        username: user.email,
        email: user.email,
        name: user.name,
        roleId: user.role,
        roleName: user.role,
        profileId: user.tenantId,
        profileName: user.tenant.name,
        tenantSlug: user.tenantSlug || user.tenant.slug,
        companyIds,
        availableClients: allClients,
        images: user.images,
        isActive: user.isActive ?? true,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
      };
    }),

  /**
   * Create a new user
   */
  create: digiwizeAdminProcedure
    .input(
      z.object({
        username: z.string().min(1, 'Username is required'), // Can be email or plain username
        email: z.string().email().optional().or(z.literal('')),
        name: z.string().optional(),
        roleId: z.string(),
        profileId: z.string(), // tenantId
        clientIds: z.array(z.string()).optional(), // Client IDs (not Company IDs)
        isActive: z.boolean().default(true),
        password: z.string().optional(), // If not provided, generate temporary
      })
    )
    .mutation(async ({ input }) => {
      // Verify tenant exists
      const tenant = await db.tenant.findUnique({
        where: { id: input.profileId },
      });

      if (!tenant) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'Tenant not found',
        });
      }

      // Use username as email if email is not provided, otherwise use provided email
      const userEmail = input.email && input.email.trim() !== '' 
        ? input.email 
        : (input.username.includes('@') ? input.username : `${input.username}@${tenant.slug}.local`);

      // Check if user with this email already exists
      const existingUser = await db.user.findUnique({
        where: { email: userEmail },
      });

      if (existingUser) {
        throw new TRPCError({
          code: 'CONFLICT',
          message: 'User with this email already exists',
        });
      }

      // Generate password if not provided
      const password = input.password || `Temp${Math.random().toString(36).slice(-8)}!`;
      const passwordHash = await bcrypt.hash(password, 12);

      // Create user
      const user = await db.user.create({
        data: {
          tenantId: input.profileId,
          email: userEmail,
          name: input.name || input.username,
          passwordHash,
          role: input.roleId,
          tenantSlug: tenant.slug,
          isActive: input.isActive,
          clientAccess: input.clientIds && input.clientIds.length > 0
            ? {
                create: input.clientIds.map((clientId) => ({
                  clientId,
                })),
              }
            : undefined,
        },
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          clientAccess: {
            include: {
              client: {
                select: {
                  id: true,
                  companyId: true,
                  name: true,
                  displayValue: true,
                },
              },
            },
          },
        },
      });

      return {
        id: user.id,
        username: user.email,
        email: user.email,
        name: user.name,
        roleName: user.role,
        profileId: user.tenantId,
        profileName: user.tenant.name,
        tenantSlug: user.tenantSlug || user.tenant.slug,
        companies: user.clientAccess.map((uc) => ({
          id: uc.client.id,
          companyId: uc.client.companyId,
          name: uc.client.name,
          displayValue: uc.client.displayValue,
        })),
        // Temporary password (only returned on creation)
        temporaryPassword: input.password ? undefined : password,
      };
    }),

  /**
   * Update an existing user
   */
  update: digiwizeAdminProcedure
    .input(
      z.object({
        id: z.string(),
        email: z.string().email().optional(),
        name: z.string().optional(),
        roleId: z.string().optional(),
        profileId: z.string().optional(), // tenantId
        clientIds: z.array(z.string()).optional(), // Client IDs (not Company IDs)
        isActive: z.boolean().optional(),
      })
    )
    .mutation(async ({ input }) => {
      const { id, ...updateData } = input;

      // Check if user exists
      const existingUser = await db.user.findUnique({
        where: { id },
      });

      if (!existingUser) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      // If changing tenant, verify it exists
      if (updateData.profileId) {
        const tenant = await db.tenant.findUnique({
          where: { id: updateData.profileId },
        });

        if (!tenant) {
          throw new TRPCError({
            code: 'NOT_FOUND',
            message: 'Tenant not found',
          });
        }
      }

      // If changing email, check for conflicts
      if (updateData.email && updateData.email !== existingUser.email) {
        const emailConflict = await db.user.findUnique({
          where: { email: updateData.email },
        });

        if (emailConflict) {
          throw new TRPCError({
            code: 'CONFLICT',
            message: 'User with this email already exists',
          });
        }
      }

      // Prepare update data
      const data: {
        email?: string;
        name?: string;
        role?: string;
        tenantId?: string;
        tenantSlug?: string;
        isActive?: boolean;
        // companyList?: string | null;
      } = {};

      if (updateData.email !== undefined) {
        data.email = updateData.email;
      }
      if (updateData.name !== undefined) {
        data.name = updateData.name;
      }
      if (updateData.roleId !== undefined) {
        data.role = updateData.roleId;
      }
      if (updateData.profileId !== undefined) {
        data.tenantId = updateData.profileId;
        // Get tenant slug
        const tenant = await db.tenant.findUnique({
          where: { id: updateData.profileId },
          select: { slug: true },
        });
        if (tenant) {
          data.tenantSlug = tenant.slug;
        }
      }
      if (updateData.isActive !== undefined) {
        data.isActive = updateData.isActive;
      }

      // Handle client access updates
      if (updateData.clientIds !== undefined) {
        // Delete existing client access
        await db.userClient.deleteMany({
          where: { userId: id },
        });

        // Create new client access if provided
        if (updateData.clientIds.length > 0) {
          await db.userClient.createMany({
            data: updateData.clientIds.map((clientId) => ({
              userId: id,
              clientId,
            })),
          });
        }
      }

      const user = await db.user.update({
        where: { id },
        data,
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          clientAccess: {
            include: {
              client: {
                select: {
                  id: true,
                  companyId: true,
                  name: true,
                  displayValue: true,
                },
              },
            },
          },
        },
      });

      return {
        id: user.id,
        username: user.email,
        email: user.email,
        name: user.name,
        roleName: user.role,
        profileId: user.tenantId,
        profileName: user.tenant.name,
        tenantSlug: user.tenantSlug || user.tenant.slug,
        companies: user.clientAccess.map((uc) => ({
          id: uc.client.id,
          companyId: uc.client.companyId,
          name: uc.client.name,
          displayValue: uc.client.displayValue,
        })),
      };
    }),

  /**
   * Deactivate a user (soft delete by setting isActive to false)
   */
  deactivate: digiwizeAdminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const user = await db.user.findUnique({
        where: { id: input.id },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      await db.user.update({
        where: { id: input.id },
        data: { isActive: false },
      });

      return { success: true };
    }),

  /**
   * Reset user password (generate new temporary password)
   */
  resetPassword: digiwizeAdminProcedure
    .input(z.object({ id: z.string() }))
    .mutation(async ({ input }) => {
      const user = await db.user.findUnique({
        where: { id: input.id },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      // Use standard temporary password (same as seed script)
      const tempPassword = 'TempPassword123!';
      const passwordHash = await bcrypt.hash(tempPassword, 12);

      await db.user.update({
        where: { id: input.id },
        data: { passwordHash },
      });

      return {
        success: true,
        temporaryPassword: tempPassword,
      };
    }),

  /**
   * Get all tenants for dropdown
   * Filters to show only production tenants: Digiwize, Delta, Kobra, Inara
   * Excludes test tenants like "Tenant A", "Tenant B", etc.
   */
  getTenants: digiwizeAdminProcedure.query(async () => {
    // Define the allowed tenant slugs for production (matching legacy structure)
    const allowedSlugs = ['digiwize', 'delta', 'kobra', 'inara'];
    
    const tenants = await db.tenant.findMany({
      where: {
        slug: {
          in: allowedSlugs,
        },
      },
      select: {
        id: true,
        name: true,
        slug: true,
      },
      orderBy: {
        name: 'asc',
      },
    });

    // If tenants don't exist, create them (for initial setup)
    const existingSlugs = new Set(tenants.map((t) => t.slug));
    
    // Map slugs to proper names
    const tenantNames: Record<string, string> = {
      digiwize: 'Digiwize',
      delta: 'Delta',
      kobra: 'Kobra',
      inara: 'Inara',
    };
    
    for (const slug of allowedSlugs) {
      if (!existingSlugs.has(slug)) {
        const name = tenantNames[slug] || slug.charAt(0).toUpperCase() + slug.slice(1);
        try {
          const newTenant = await db.tenant.create({
            data: {
              name,
              slug,
              settings: '{}',
            },
            select: {
              id: true,
              name: true,
              slug: true,
            },
          });
          tenants.push(newTenant);
        } catch (error) {
          console.warn(`Failed to create tenant ${slug}:`, error);
        }
      }
    }

    // Sort by name after potentially adding new tenants
    return tenants.sort((a, b) => a.name.localeCompare(b.name));
  }),

  /**
   * Get all clients (companies) for a tenant
   * These are the companies users can be assigned access to
   * For Digiwize admins, returns all clients regardless of tenant
   */
  getClients: digiwizeAdminProcedure
    .input(z.object({ tenantId: z.string().optional() }))
    .query(async () => {
      // For Digiwize admins, return all clients (companies are shared across tenants)
      // If tenantId is provided, we can still filter, but typically we want all clients
      const clients = await db.client.findMany({
        select: {
          id: true,
          companyId: true,
          name: true,
          displayValue: true,
        },
        orderBy: {
          companyId: 'asc', // Sort by companyId to match the list order
        },
      });

      return clients;
    }),

  /**
   * Get all clients (companies) - for all tenants (admin view)
   */
  getAllClients: digiwizeAdminProcedure.query(async () => {
    const clients = await db.client.findMany({
      select: {
        id: true,
        companyId: true,
        name: true,
        displayValue: true,
        tenantId: true,
        tenant: {
          select: {
            name: true,
            slug: true,
          },
        },
      },
      orderBy: [
        { tenant: { name: 'asc' } },
        { name: 'asc' },
      ],
    });

    return clients;
  }),

  /**
   * Get signed upload URL for user image
   */
  getSignedImageUpload: digiwizeAdminProcedure
    .input(
      z.object({
        userId: z.string(),
        type: z.enum(['photo', 'id', 'passport']),
        filename: z.string(),
        contentType: z.string().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Verify user exists
      const user = await db.user.findUnique({
        where: { id: input.userId },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      // Import storage utilities
      const { getSignedPutUrl, objectUri } = await import('@/server/lib/storage');
      
      const key = `users/${input.userId}/${input.type}/${Date.now()}_${input.filename}`;
      const url = await getSignedPutUrl(key, input.contentType);

      return { key, url, publicUri: objectUri(key) };
    }),

  /**
   * Upload user image (photo, ID, or passport) - saves URI after upload
   */
  uploadImage: digiwizeAdminProcedure
    .input(
      z.object({
        userId: z.string(),
        type: z.enum(['photo', 'id', 'passport']),
        uri: z.string(),
        mimeType: z.string().optional(),
        sizeBytes: z.number().optional(),
      })
    )
    .mutation(async ({ input }) => {
      // Verify user exists
      const user = await db.user.findUnique({
        where: { id: input.userId },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      const image = await db.userImage.create({
        data: {
          userId: input.userId,
          type: input.type,
          uri: input.uri,
          mimeType: input.mimeType,
          sizeBytes: input.sizeBytes,
        },
      });

      return image;
    }),

  /**
   * Delete user image
   */
  deleteImage: digiwizeAdminProcedure
    .input(z.object({ imageId: z.string() }))
    .mutation(async ({ input }) => {
      await db.userImage.delete({
        where: { id: input.imageId },
      });

      return { success: true };
    }),

  /**
   * Get user details with images and company access
   */
  getUserDetails: digiwizeAdminProcedure
    .input(z.object({ userId: z.string() }))
    .query(async ({ input }) => {
      const user = await db.user.findUnique({
        where: { id: input.userId },
        include: {
          tenant: {
            select: {
              id: true,
              name: true,
              slug: true,
            },
          },
          clientAccess: {
            include: {
              client: {
                select: {
                  id: true,
                  companyId: true,
                  name: true,
                  displayValue: true,
                },
              },
            },
          },
          images: {
            orderBy: {
              createdAt: 'desc',
            },
          },
        },
      });

      if (!user) {
        throw new TRPCError({
          code: 'NOT_FOUND',
          message: 'User not found',
        });
      }

      return {
        id: user.id,
        username: user.name || user.email.split('@')[0],
        email: user.email,
        name: user.name,
        role: user.role,
        isActive: user.isActive,
        profileName: user.tenant.name,
        tenantSlug: user.tenantSlug || user.tenant.slug,
        companies: user.clientAccess.map((uc) => ({
          id: uc.client.id,
          companyId: uc.client.companyId,
          name: uc.client.name,
          displayValue: uc.client.displayValue,
        })),
        images: user.images.map((img) => ({
          id: img.id,
          type: img.type,
          uri: img.uri,
          mimeType: img.mimeType,
          sizeBytes: img.sizeBytes,
          createdAt: img.createdAt,
        })),
      };
    }),

  /**
   * Get available roles
   * Matches legacy system roles: ADMINISTRATOR, CONTROLLER, VIEWER, MANAGER, ACCOUNTS, DRIVER, DIGIWIZE_ADMIN
   */
  getRoles: digiwizeAdminProcedure.query(async () => {
    // Return roles matching legacy system structure
    return [
      { id: 'DIGIWIZE_ADMIN', name: 'Digiwize Admin' },
      { id: 'ADMINISTRATOR', name: 'Administrator' },
      { id: 'MANAGER', name: 'Manager' },
      { id: 'CONTROLLER', name: 'Controller' },
      { id: 'ACCOUNTS', name: 'Accounts' },
      { id: 'DRIVER', name: 'Driver' },
      { id: 'VIEWER', name: 'Viewer' },
    ];
  }),
});

