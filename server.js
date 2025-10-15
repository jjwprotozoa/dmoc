// server.js
// Custom Next.js server with Socket.IO integration
const { createServer } = require('http');
const { parse } = require('url');
const next = require('next');
const { initSocket } = require('./src/server/ws/socket.js');

const dev = process.env.NODE_ENV !== 'production';
const hostname = process.env.HOSTNAME || 'localhost';
const port = parseInt(process.env.PORT || '3000', 10);

// Initialize Next.js app
const app = next({ dev, hostname, port });
const handle = app.getRequestHandler();

app.prepare().then(() => {
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
  const io = initSocket(httpServer);

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
