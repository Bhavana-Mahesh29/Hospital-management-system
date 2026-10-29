import express, { Express, Request, Response, NextFunction } from 'express';
import { authRouter } from './routes/auth';
import { doctorsRouter } from './routes/doctors';
import { appointmentsRouter } from './routes/appointments';
import { ehrRouter } from './routes/ehr';
import { notificationsRouter } from './routes/notifications';
import { adminRouter } from './routes/admin';

export const app: Express = express();

// Body parser
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Simple logger & CORS headers if needed
app.use((req: Request, res: Response, next: NextFunction) => {
  res.header('Access-Control-Allow-Origin', '*');
  res.header('Access-Control-Allow-Methods', 'GET, POST, PUT, PATCH, DELETE, OPTIONS');
  res.header('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Authorization');
  if (req.method === 'OPTIONS') {
    return res.sendStatus(200);
  }
  next();
});

// API Routes
app.use('/api/auth', authRouter);
app.use('/api/doctors', doctorsRouter);
app.use('/api/appointments', appointmentsRouter);
app.use('/api/ehr', ehrRouter);
app.use('/api/notifications', notificationsRouter);
app.use('/api/admin', adminRouter);

// API Root & Status check
app.get(['/api', '/api/', '/api/status', '/api/health', '/health'], (_req: Request, res: Response) => {
  res.json({
    message: 'Smart Hospital Management System API is running!',
    system: 'CarePulse Clinical & EHR Scheduling System',
    status: 'healthy',
    timestamp: new Date().toISOString(),
  });
});

// Catch-all for unhandled /api requests
app.all('/api/*', (_req: Request, res: Response) => {
  res.status(404).json({
    error: 'API endpoint not found',
  });
});

// Error handling middleware
app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
  console.error('[CarePulse API Error]:', err);
  res.status(err.status || 500).json({
    error: err.message || 'Internal Server Error',
  });
});
