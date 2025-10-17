# MCP Linear Configuration for AI Chats

This file contains the exact configuration needed for AI chats to properly interact with the Linear workspace.

## 🚨 CRITICAL: Use These Exact Values

### Team Configuration

- **Team Parameter**: `"justwessels"` (exactly this string, lowercase, no spaces)
- **Team ID**: `39290bde-f690-4d61-94e3-439faf1892d1`
- **Project**: `dmoc` (optional, for project-specific issues)

### Workspace Details

- **Workspace URL**: https://linear.app/justwessels
- **Workspace Name**: justwessels
- **Issue Prefix**: JUS- (e.g., JUS-16, JUS-17, JUS-27)

## ✅ CORRECT MCP Tool Usage

### List Issues

```typescript
mcp_Linear_list_issues({
  team: 'justwessels',
  limit: 50,
});
```

### Create Issue

```typescript
mcp_Linear_create_issue({
  title: 'Issue Title',
  description: 'Issue description with details',
  team: 'justwessels',
  priority: 2, // 1=Urgent, 2=High, 3=Normal, 4=Low
  labels: ['bug', 'feature', 'ui/ux'],
});
```

### Get Team Information

```typescript
mcp_Linear_get_team({
  query: 'justwessels',
});
```

### Update Issue

```typescript
mcp_Linear_update_issue({
  id: 'issue-id-here',
  state: 'Done', // or "In Progress", "Backlog", etc.
  description: 'Updated description',
});
```

### List Teams (for verification)

```typescript
mcp_Linear_list_teams();
```

## ❌ INCORRECT - Do NOT Use These

- ~~"Justin's projects"~~ (wrong team name)
- ~~"Justwessels"~~ (wrong case)
- ~~"justins-projects-f7a019bf"~~ (wrong team slug)
- ~~"team_fgz0ZrAX9LKDiH2lBWDvVoB0"~~ (wrong team ID)

## 🔧 Troubleshooting

### Common Errors and Solutions

**Error**: "Team not found" or "Invalid team"

- **Solution**: Use exactly `"justwessels"` as the team parameter

**Error**: "Permission denied"

- **Solution**: Check Linear API token permissions in Linear settings

**Error**: "Workspace not accessible"

- **Solution**: Verify workspace URL: https://linear.app/justwessels

### Quick Test Commands

```typescript
// Test 1: Verify team access
mcp_Linear_get_team({ query: 'justwessels' });

// Test 2: List recent issues
mcp_Linear_list_issues({ team: 'justwessels', limit: 5 });

// Test 3: Check all teams
mcp_Linear_list_teams();
```

## 📋 Current Issues Status

### Recently Completed (✅ DONE)

- JUS-16: Fix TypeScript Router Errors - tRPC and Prisma Issues
- JUS-17: Update Prisma Schema Consistency - Development/Production Sync
- JUS-18: Add Linear Integration Documentation and Configuration

### Active Development (🔄 IN PROGRESS)

- JUS-19: Modernized Navigation System Implementation
- JUS-20: Socket.IO Connection Stability Fixes
- JUS-21: TypeScript Build Errors Resolution
- JUS-22: Database Architecture Migration
- JUS-23: Vehicle Management System Enhancement
- JUS-24: Privacy and Security System Implementation
- JUS-25: shadcn/ui Component Library Integration
- JUS-26: PWA Implementation and Offline Support
- JUS-27: Feature Branch Integration - Modernized Navigation

### Future Development (📋 BACKLOG)

- JUS-11: Implement User Registration System
- JUS-12: Implement Real ANPR Service
- JUS-13: Implement WhatsApp Message Processing with BullMQ
- JUS-14: Replace Mock Data with Real API Integration
- JUS-15: Implement Biometrics System with InsightFace/DeepFace

## 🎯 Priority Guidelines

- **Priority 1 (Urgent)**: Critical bugs, security issues, production blockers
- **Priority 2 (High)**: Important features, significant improvements
- **Priority 3 (Normal)**: Standard features, minor improvements
- **Priority 4 (Low)**: Nice-to-have features, documentation updates

## 📝 Issue Creation Guidelines

### Always Create Issues For:

- Bug fixes
- New features
- Significant refactoring
- Security updates
- Performance improvements
- Database migrations
- UI/UX changes

### Issue Description Template:

```markdown
## Summary

Brief description of the issue/feature

## Problem/Requirement

What needs to be solved or implemented

## Solution/Implementation

How it will be addressed

## Files Modified

- file1.ts
- file2.tsx

## Testing

- [ ] Test case 1
- [ ] Test case 2

## Impact

What this change affects
```

## 🔗 Integration with Development

- Include Linear issue IDs in commit messages: `fix: resolve TypeScript errors (JUS-16)`
- Update changelog with Linear issue references
- Use Linear issues to track progress and communicate changes
- Link PRs to Linear issues for better project management

## 📚 Additional Resources

- **Complete Configuration**: See `LINEAR_CONFIG.md` for detailed setup
- **Project Rules**: See `.cursorrules` for development guidelines
- **Changelog**: See `CHANGELOG.md` for version history
- **Linear Workspace**: https://linear.app/justwessels

---

**Remember**: Always use `"justwessels"` as the team parameter in MCP tools!
