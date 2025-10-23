// scripts/dev-start.js
// Development startup script that kills processes on ports 3000/3001 and starts the dev server

const { exec, spawn } = require('child_process');
const path = require('path');

function isNodeProcess(pid) {
  return new Promise((resolve) => {
    exec(`wmic process where "ProcessId=${pid}" get Name /format:list`, (error, stdout) => {
      if (error) {
        resolve(false);
        return;
      }
      
      const isNode = stdout.toLowerCase().includes('node.exe') || 
                    stdout.toLowerCase().includes('npm.exe') || 
                    stdout.toLowerCase().includes('next.exe');
      resolve(isNode);
    });
  });
}

function killProcessOnPort(port) {
  return new Promise(async (resolve) => {
    console.log(`🔍 Checking for processes on port ${port}...`);
    
    exec(`netstat -ano | findstr :${port}`, async (error, stdout) => {
      if (error || !stdout.trim()) {
        console.log(`✅ Port ${port} is free`);
        resolve();
        return;
      }

      // Extract PIDs from netstat output
      const lines = stdout.trim().split('\n');
      const pids = new Set();
      
      lines.forEach(line => {
        const parts = line.trim().split(/\s+/);
        if (parts.length >= 5) {
          const pid = parts[parts.length - 1];
          if (pid && pid !== '0') {
            pids.add(pid);
          }
        }
      });

      if (pids.size === 0) {
        console.log(`✅ Port ${port} is free`);
        resolve();
        return;
      }

      // Filter to only Node.js related processes
      const nodePids = [];
      for (const pid of pids) {
        const isNode = await isNodeProcess(pid);
        if (isNode) {
          nodePids.push(pid);
        } else {
          console.log(`⚠️  Skipping non-Node process ${pid} on port ${port}`);
        }
      }

      if (nodePids.length === 0) {
        console.log(`✅ No Node.js processes found on port ${port}`);
        resolve();
        return;
      }

      console.log(`🔪 Killing Node.js processes on port ${port}: ${nodePids.join(', ')}`);
      
      const killPromises = nodePids.map(pid => {
        return new Promise((resolveKill) => {
          // First try graceful termination, then force if needed
          exec(`taskkill /PID ${pid}`, (killError) => {
            if (killError) {
              // If graceful kill fails, try force kill
              exec(`taskkill /PID ${pid} /F`, (forceKillError) => {
                if (forceKillError) {
                  console.log(`⚠️  Could not kill process ${pid}: ${forceKillError.message}`);
                } else {
                  console.log(`✅ Force killed process ${pid}`);
                }
                resolveKill();
              });
            } else {
              console.log(`✅ Gracefully killed process ${pid}`);
              resolveKill();
            }
          });
        });
      });

      Promise.all(killPromises).then(() => {
        console.log(`✅ Port ${port} cleared`);
        resolve();
      });
    });
  });
}

async function startDevServer() {
  try {
    console.log('🚀 Starting DMOC development server...');
    
    // Kill processes on ports 3000 and 3001
    await killProcessOnPort(3000);
    await killProcessOnPort(3001);
    
    // Wait a moment for ports to be fully released
    await new Promise(resolve => setTimeout(resolve, 1000));
    
    console.log('🔄 Starting development server...');
    
    // Start the dev server
    const devProcess = spawn('npm', ['run', 'dev'], {
      stdio: 'inherit',
      shell: true,
      cwd: path.resolve(__dirname, '..')
    });

    devProcess.on('error', (error) => {
      console.error('❌ Failed to start development server:', error);
      process.exit(1);
    });

    devProcess.on('exit', (code) => {
      if (code !== 0) {
        console.error(`❌ Development server exited with code ${code}`);
        process.exit(code);
      }
    });

    // Handle graceful shutdown
    process.on('SIGINT', () => {
      console.log('\n🛑 Shutting down development server...');
      devProcess.kill('SIGINT');
    });

    process.on('SIGTERM', () => {
      console.log('\n🛑 Shutting down development server...');
      devProcess.kill('SIGTERM');
    });

  } catch (error) {
    console.error('❌ Error starting development server:', error);
    process.exit(1);
  }
}

// Run the startup process
startDevServer();

