# Linear Integration Configuration

This document contains the correct Linear workspace configuration for the DMOC Web (PWA) project.

## Workspace Details

- **Workspace URL**: https://linear.app/justwessels
- **Workspace Name**: justwessels
- **Team Name**: Justwessels
- **Team ID**: 39290bde-f690-4d61-94e3-439faf1892d1
- **Project**: DMOC (dmoc-86db242489ad)
- **Issue Prefix**: JUS- (e.g., JUS-16, JUS-17)

## MCP Usage - CRITICAL FOR AI CHATS

When using Linear MCP tools in ANY AI chat, ALWAYS use these exact parameters:

### ✅ CORRECT Configuration

- **Team Parameter**: `justwessels` (exactly this string)
- **Team ID**: `39290bde-f690-4d61-94e3-439faf1892d1`
- **Project**: `dmoc` (optional, for project-specific issues)

### ❌ INCORRECT - Do NOT use these

- ~~"Justin's projects"~~ (wrong team name)
- ~~"Justwessels"~~ (wrong case)
- ~~"justins-projects-f7a019bf"~~ (wrong team slug)

### MCP Tool Examples for AI Chats

```typescript
// ✅ CORRECT - List issues
mcp_Linear_list_issues({
  team: 'justwessels',
  limit: 50,
});

// ✅ CORRECT - Create issue
mcp_Linear_create_issue({
  title: 'Issue Title',
  description: 'Issue description',
  team: 'justwessels',
  priority: 2,
  labels: ['bug', 'feature'],
});

// ✅ CORRECT - Get team info
mcp_Linear_get_team({
  query: 'justwessels',
});

// ✅ CORRECT - Update issue
mcp_Linear_update_issue({
  id: 'issue-id',
  state: 'Done',
});
```

## Git Branch Naming

Use the format: `jjwprotozoa/jus-{issue-number}-{kebab-case-title}`

Examples:

- `jjwprotozoa/jus-16-fix-typescript-router-errors-trpc-and-prisma-issues`
- `jjwprotozoa/jus-17-update-prisma-schema-consistency-developmentproduction-sync`

## Issue Creation Guidelines

1. **Always create issues for**:
   - Bug fixes
   - New features
   - Significant refactoring
   - Security updates
   - Performance improvements

2. **Include in issue descriptions**:
   - Summary of changes
   - Files modified
   - Impact assessment
   - Testing checklist
   - Related issues/PRs

3. **Use appropriate priority**:
   - 1 = Urgent
   - 2 = High
   - 3 = Normal
   - 4 = Low

## Current Issues Status

### Recently Completed Issues

- [JUS-16: Fix TypeScript Router Errors - tRPC and Prisma Issues](https://linear.app/justwessels/issue/JUS-16/fix-typescript-router-errors-trpc-and-prisma-issues) ✅ DONE
- [JUS-17: Update Prisma Schema Consistency - Development/Production Sync](https://linear.app/justwessels/issue/JUS-17/update-prisma-schema-consistency-developmentproduction-sync) ✅ DONE
- [JUS-18: Add Linear Integration Documentation and Configuration](https://linear.app/justwessels/issue/JUS-18/add-linear-integration-documentation-and-configuration) ✅ DONE

### Active Development Issues

- [JUS-19: Modernized Navigation System Implementation](https://linear.app/justwessels/issue/JUS-19/modernized-navigation-system-implementation) 🔄 IN PROGRESS
- [JUS-20: Socket.IO Connection Stability Fixes](https://linear.app/justwessels/issue/JUS-20/socketio-connection-stability-fixes) 🔄 IN PROGRESS
- [JUS-21: TypeScript Build Errors Resolution](https://linear.app/justwessels/issue/JUS-21/typescript-build-errors-resolution) 🔄 IN PROGRESS
- [JUS-22: Database Architecture Migration](https://linear.app/justwessels/issue/JUS-22/database-architecture-migration) 🔄 IN PROGRESS
- [JUS-23: Vehicle Management System Enhancement](https://linear.app/justwessels/issue/JUS-23/vehicle-management-system-enhancement) 🔄 IN PROGRESS
- [JUS-24: Privacy and Security System Implementation](https://linear.app/justwessels/issue/JUS-24/privacy-and-security-system-implementation) 🔄 IN PROGRESS
- [JUS-25: shadcn/ui Component Library Integration](https://linear.app/justwessels/issue/JUS-25/shadcnui-component-library-integration) 🔄 IN PROGRESS
- [JUS-26: PWA Implementation and Offline Support](https://linear.app/justwessels/issue/JUS-26/pwa-implementation-and-offline-support) 🔄 IN PROGRESS
- [JUS-27: Feature Branch Integration - Modernized Navigation](https://linear.app/justwessels/issue/JUS-27/feature-branch-integration-modernized-navigation) 🔄 IN PROGRESS

### Future Development Issues

- [JUS-11: Implement User Registration System](https://linear.app/justwessels/issue/JUS-11/implement-user-registration-system) 📋 BACKLOG
- [JUS-12: Implement Real ANPR Service](https://linear.app/justwessels/issue/JUS-12/implement-real-anpr-automatic-number-plate-recognition-service) 📋 BACKLOG
- [JUS-13: Implement WhatsApp Message Processing with BullMQ](https://linear.app/justwessels/issue/JUS-13/implement-whatsapp-message-processing-with-bullmq) 📋 BACKLOG
- [JUS-14: Replace Mock Data with Real API Integration](https://linear.app/justwessels/issue/JUS-14/replace-mock-data-with-real-api-integration) 📋 BACKLOG
- [JUS-15: Implement Biometrics System with InsightFace/DeepFace](https://linear.app/justwessels/issue/JUS-15/implement-biometrics-system-with-insightfacedeepface) 📋 BACKLOG

## Troubleshooting for AI Chats

If Linear MCP issues persist in new AI chats:

1. **Verify the team name is exactly "justwessels"** (lowercase, no spaces)
2. **Check that the Linear API token has proper permissions**
3. **Ensure the workspace URL matches**: https://linear.app/justwessels
4. **Use the team ID**: 39290bde-f690-4d61-94e3-439faf1892d1
5. **Test with**: `mcp_Linear_get_team({ query: "justwessels" })`

### Common MCP Errors and Solutions

**Error**: "Team not found" or "Invalid team"

- **Solution**: Use exactly `"justwessels"` as the team parameter

**Error**: "Permission denied"

- **Solution**: Check Linear API token permissions in Linear settings

**Error**: "Workspace not accessible"

- **Solution**: Verify workspace URL: https://linear.app/justwessels

### Quick Test Commands for AI Chats

```typescript
// Test team access
mcp_Linear_get_team({ query: 'justwessels' });

// List recent issues
mcp_Linear_list_issues({ team: 'justwessels', limit: 10 });

// Check team info
mcp_Linear_list_teams();
```

## Integration with Development Workflow

- Include Linear issue IDs in commit messages: `fix: resolve TypeScript errors (JUS-16)`
- Update changelog with Linear issue references
- Use Linear issues to track progress and communicate changes
- Link PRs to Linear issues for better project management
