import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import rateLimit from 'express-rate-limit';
import { errorHandler } from './middleware/errorHandler.js';
import authRoutes from './routes/auth.js';
import projectsRoutes from './routes/projects.js';
import savedProjectsRoutes from './routes/savedProjects.js';
import investmentRequestsRoutes from './routes/investmentRequests.js';
import messagesRoutes from './routes/messages.js';
import contactRoutes from './routes/contact.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const clientDistPath = path.join(__dirname, '../../client/dist');

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(helmet({
  contentSecurityPolicy: false
}));

app.use(cors({
  origin: true,
  credentials: true,
}));

app.use(morgan('dev'));
app.use(express.json());

// Serve static frontend files
app.use(express.static(clientDistPath));

// Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, // 15 minutes
  max: 1000, // limit each IP to 1000 requests per windowMs (increased for polling)
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
app.use('/api/contact', contactRoutes);

// Basic health check
app.get('/api/health', (req, res) => {
  res.status(200).json({ status: 'ok', message: 'MaalHub API is running' });
});

// 404 handler for API routes
app.use('/api', (req, res) => {
  res.status(404).json({ error: 'API endpoint not found' });
});

// SPA Fallback for non-API routes (serves frontend on single port)
app.get(/(.*)/, (req, res, next) => {
  if (req.path.startsWith('/api')) return next();
  res.sendFile(path.join(clientDistPath, 'index.html'));
});

// Error handling
app.use(errorHandler);

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});

export default app;
