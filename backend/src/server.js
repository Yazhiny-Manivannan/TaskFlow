// Load the settings file FIRST so every other file can read process.env.
// Normally this is ".env". For testing we can set ENV_FILE=.env.test
require('dotenv').config({ path: process.env.ENV_FILE || '.env' });

const mongoose = require('mongoose');
const app = require('./app');
const connectDB = require('./config/db');

const PORT = process.env.PORT || 5000;

async function startServer() {
  try {
    // 1. Connect to the database first.
    await connectDB();

    // 2. Only then start accepting requests.
    const server = app.listen(PORT, () => {
      console.log(`TaskFlow API running at http://localhost:${PORT}`);
      console.log(`Health check: http://localhost:${PORT}/api/health`);
    });

    // Handle problems starting the server, such as the port already being used.
    server.on('error', (error) => {
      if (error.code === 'EADDRINUSE') {
        console.error(`Port ${PORT} is already in use. Stop the other program or change PORT in .env.`);
      } else {
        console.error('Server error:', error.message);
      }
      process.exit(1);
    });

    // Shut down cleanly when you press Ctrl+C.
    const shutdown = async () => {
      console.log('Shutting down...');
      server.close();
      await mongoose.connection.close();
      process.exit(0);
    };
    process.on('SIGINT', shutdown);
    process.on('SIGTERM', shutdown);
  } catch (error) {
    console.error('Failed to start the server:', error.message);
    process.exit(1);
  }
}

startServer();