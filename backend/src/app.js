const express = require('express');
const cors = require('cors');
const mongoose = require('mongoose');
const authRoutes = require('./routes/authRoutes');
const taskRoutes = require('./routes/taskRoutes');
const { notFound, errorHandler } = require('./middleware/errorHandler');

const app = express();

// Allow only our React app to call this API from a browser.
// Postman and JMeter are not browsers, so CORS does not affect them.
app.use(
  cors({
    origin: process.env.CLIENT_URL || 'http://localhost:5173',
  })
);

// Read JSON request bodies. The 10kb limit rejects unreasonably large bodies.
app.use(express.json({ limit: '10kb' }));

// ---------- ROUTES ----------

// Health check: tells us the API is running and the database is connected.
app.get('/api/health', (req, res) => {
  // readyState 1 means "connected" in Mongoose.
  const dbConnected = mongoose.connection.readyState === 1;

  res.status(dbConnected ? 200 : 503).json({
    success: dbConnected,
    message: dbConnected ? 'API is healthy' : 'Database is not connected',
    data: {
      status: dbConnected ? 'ok' : 'degraded',
      database: dbConnected ? 'connected' : 'disconnected',
      uptimeSeconds: Math.floor(process.uptime()),
      timestamp: new Date().toISOString(),
    },
  });
});

// Authentication routes: /api/auth/register, /api/auth/login, /api/auth/me
app.use('/api/auth', authRoutes);

// Task routes (all protected): /api/tasks
app.use('/api/tasks', taskRoutes);

// ---------- ERROR HANDLING (must stay at the bottom, in this order) ----------

// 1. No route matched, so reply with a JSON 404.
app.use(notFound);

// 2. Any error thrown above ends up here.
app.use(errorHandler);

module.exports = app;