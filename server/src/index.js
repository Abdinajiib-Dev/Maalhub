import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import projectsRoutes from './routes/projects.js';
import savedProjectsRoutes from './routes/savedProjects.js';
import investmentRequestsRoutes from './routes/investmentRequests.js';
import messagesRoutes from './routes/messages.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet());

const allowedOrigin = process.env.FRONTEND_URL || 'http://localhost:5173';
app.use(cors({
  origin: allowedOrigin,
  credentials: true,
}));

app.use(morgan('dev'));
app.use(express.json());

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 100, // limit each IP to 100 requests per windowMs
  standardHeaders: true,
  legacyHeaders: false,
});
app.use('/api', limiter); // Apply to all /api routes

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/projects', projectsRoutes);
app.use('/api/saved-projects', savedProjectsRoutes);
app.use('/api/investment-requests', investmentRequestsRoutes);
app.use('/api/messages', messagesRoutes);

// Basic health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'MaalHub API is running' });
});

// 404 handler for API routes
app.use('/api/*', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// Error handling
app.use(errorHandler);

if (process.env.NODE_ENV !== 'production') {
  app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
  });
}

export default app;
