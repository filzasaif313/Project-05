import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/authRoutes.js';
import itemRoutes from './routes/itemRoutes.js';
import stockRoutes from './routes/stockRoutes.js';
import reportRoutes from './routes/reportRoutes.js';
import toolRoutes from './routes/toolRoutes.js';
import chatRoutes, { getAiSystemStatus } from './routes/chatRoutes.js';
import { initializeDatabase } from './config/db.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: true,
  credentials: true
}));
app.use(express.json());

// API Routes
app.use('/api/auth', authRoutes);
app.use('/api/items', itemRoutes);
app.use('/api/stock', stockRoutes);
app.use('/api/reports', reportRoutes);
app.use('/api/tools', toolRoutes);
app.use('/api/chat', chatRoutes);

// System Health & AI Status Route (For Manager Health Dashboard & Test Case 5)
app.get('/api/system/status', (req, res) => {
  res.json({
    status: 'ONLINE',
    serverTime: new Date(),
    aiSystem: getAiSystemStatus()
  });
});

// Root ping
app.get('/', (req, res) => {
  res.json({
    name: 'StockSense API Gateway',
    version: '1.0.0',
    mall: 'Nowshera Shopping Mall',
    status: 'Operational'
  });
});

// Start server
async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`\n======================================================`);
      console.log(`🚀 StockSense Central Server running on http://localhost:${PORT}`);
      console.log(`🏬 Ready for Nowshera Shopping Mall Operations`);
      console.log(`======================================================\n`);
    });
  } catch (err) {
    console.error('Failed to start server:', err);
    process.exit(1);
  }
}

startServer();
