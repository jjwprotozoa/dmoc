// server.js
// Custom Next.js server with Socket.IO integration
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(async () => {
  // Create HTTP server with request handler
  const httpServer = createServer(async (req, res) => {
    try {
      const parsedUrl = parse(req.url, true);

      // Handle Socket.IO requests
      if (parsedUrl.pathname?.startsWith('/api/socketio')) {
        // Let Socket.IO handle these requests
        return;
      }

      await handle(req, res, parsedUrl);
    } catch (err) {
      console.error('Error occurred handling', req.url, err);
      res.statusCode = 500;
      res.end('internal server error');
    }
  });

  // Initialize Socket.IO after creating the server
  // Use dynamic import for TypeScript module
  try {
    const socketModule = await import('./src/server/ws/socket.ts');
    const io = socketModule.initSocket(httpServer);
    console.log('Socket.IO initialized successfully');
  } catch (error) {
    console.error('Failed to initialize Socket.IO:', error);
    // Continue without Socket.IO for now
  }

  // Add error handling for the server
  httpServer.on('error', (err) => {
    console.error('HTTP Server error:', err);
  });

  httpServer.listen(port, (err) => {
    if (err) throw err;
    console.log(`> Ready on http://${hostname}:${port}`);
    console.log(`> Socket.IO server initialized on path: /api/socketio`);
    console.log(`> Environment: ${dev ? 'development' : 'production'}`);
  });
});
