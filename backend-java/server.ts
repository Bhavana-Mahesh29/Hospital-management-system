import path from 'path';
import fs from 'fs';
import express from 'express';
import { createServer as createViteServer } from 'vite';
import { app } from './server/app';

const PORT = parseInt(process.env.PORT || '3000', 10);
const isProduction = process.env.NODE_ENV === 'production';

async function startServer() {
  if (!isProduction) {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.resolve(__dirname, 'dist');
    if (fs.existsSync(distPath)) {
      app.use(express.static(distPath));
      app.get('*', (req, res, next) => {
        if (req.path.startsWith('/api')) {
          return next();
        }
        res.sendFile(path.join(distPath, 'index.html'));
      });
    }
  }

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`Smart Hospital Management System running on http://0.0.0.0:${PORT}`);
  });

  // Also bind port 5000 for legacy compatibility with direct http://localhost:5000/ requests
  if (PORT !== 5000) {
    try {
      const server5000 = express();
      server5000.use((req, res, next) => {
        res.header('Access-Control-Allow-Origin', '*');
        res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
        res.header('Access-Control-Allow-Headers', '*');
        if (req.method === 'OPTIONS') return res.sendStatus(200);
        next();
      });
      server5000.get('*', (_req, res) => {
        res.json({
          message: 'Smart Hospital Management System API is running!',
          status: 'healthy',
        });
      });
      server5000.listen(5000, '0.0.0.0', () => {
        console.log('SHMS backend running on http://0.0.0.0:5000');
      });
    } catch (e) {
      console.warn('Port 5000 listener could not be bound:', e);
    }
  }
}

startServer().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
