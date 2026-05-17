import http from 'http';
import { createApp } from './app';
import { config } from './config';
import { connectDatabase } from './config/database';
import { initSocketServer } from './socket/socket.service';

async function bootstrap() {
  await connectDatabase();
  const app = createApp();
  const httpServer = http.createServer(app);

  initSocketServer(httpServer);

  httpServer.on('error', (err: NodeJS.ErrnoException) => {
    if (err.code === 'EADDRINUSE') {
      console.error(
        `Port ${config.PORT} is already in use. Stop the other process or run:\n` +
          `  netstat -ano | findstr :${config.PORT}\n` +
          `  taskkill /PID <pid> /F`
      );
      process.exit(1);
    }
    throw err;
  });

  httpServer.listen(config.PORT, () => {
    console.log(`Server running on port ${config.PORT} [${config.NODE_ENV}]`);
    console.log(`WebSocket ready at ws://localhost:${config.PORT}`);
  });
}

bootstrap().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
