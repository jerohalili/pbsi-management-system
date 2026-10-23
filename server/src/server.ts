import app from './app.js';
import { testConnection } from './config/db.js';

const PORT = Number(process.env.PORT) || 4000;

async function start() {
  try {
    await testConnection();
    app.listen(PORT, () => {
      console.log(`[SERVER] Running on http://localhost:${PORT}`);
      console.log(`[SERVER] Environment: ${process.env.NODE_ENV ?? 'development'}`);
    });
  } catch (err) {
    console.error('[SERVER] Failed to start:', err);
    process.exit(1);
  }
}

start();
