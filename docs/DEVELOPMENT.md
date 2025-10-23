# DMOC Development Server Setup

## Quick Start

The DMOC application runs both frontend (Next.js) and backend (Socket.IO) services in a single process on port 3000.

### Development Scripts

#### Option 1: Clean Start (Recommended)

```bash
npm run dev:clean
```

This script automatically:

- Kills any existing processes on ports 3000 and 3001
- Waits for ports to be released
- Starts the development server with both frontend and backend

#### Option 2: Windows Batch File

```bash
npm run dev:clean:win
```

Same functionality as above, but uses a Windows batch file.

#### Option 3: Standard Start

```bash
npm run dev
```

Standard start (may fail if ports are already in use).

### What Gets Started

The development server includes:

- **Frontend**: Next.js application on `http://localhost:3000`
- **Backend**: Socket.IO server on `/api/socketio`
- **Database**: Prisma client with SQLite (dev) or MySQL/PostgreSQL (prod)
- **tRPC**: API routes for data fetching

### Troubleshooting

#### Port Already in Use Error

If you get `EADDRINUSE` errors:

1. Use `npm run dev:clean` instead of `npm run dev`
2. Or manually kill processes: `taskkill /f /im node.exe`

#### ChunkLoadError

If you see chunk loading errors:

1. Stop the dev server (`Ctrl+C`)
2. Clear Next.js cache: `Remove-Item -Recurse -Force .next`
3. Restart with `npm run dev:clean`

#### Database Issues

If you have database connection issues:

1. Run `npm run db:dev` to regenerate Prisma client
2. Run `npm run db:push` to sync schema changes
3. Run `npm run db:seed` to populate test data

### Environment Variables

Set these in your `.env.local` file:

```env
NEXT_PUBLIC_DMOC_MIGRATION=1
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-super-secret-jwt-key-that-is-at-least-32-characters-long
```

### File Structure

```
scripts/
├── dev-start.js      # Node.js startup script (cross-platform)
├── dev-start.bat     # Windows batch startup script
└── copy-schema.js    # Database schema management
```

### Development Workflow

1. **Start Development**: `npm run dev:clean`
2. **Make Changes**: Edit files in `src/`
3. **Hot Reload**: Changes automatically reload
4. **Database Changes**: Run `npm run db:push` after schema changes
5. **Stop Server**: `Ctrl+C` in terminal

