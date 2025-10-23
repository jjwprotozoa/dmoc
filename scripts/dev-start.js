// scripts/dev-start.js
// Development startup script that kills processes on ports 3000/3001 and starts the dev server

const { exec, spawn } = require('child_process');
const path = require('path');

function killProcessOnPort(port) {
  return new Promise((resolve) => {
    console.log(`🔍 Checking for processes on port ${port}...`);
    
    exec(`netstat -ano | findstr :${port}`, (error, stdout) => {
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

      console.log(`🔪 Killing processes on port ${port}: ${Array.from(pids).join(', ')}`);
      
      const killPromises = Array.from(pids).map(pid => {
        return new Promise((resolveKill) => {
          exec(`taskkill /PID ${pid} /F`, (killError) => {
            if (killError) {
              console.log(`⚠️  Could not kill process ${pid}: ${killError.message}`);
            } else {
              console.log(`✅ Killed process ${pid}`);
            }
            resolveKill();
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

