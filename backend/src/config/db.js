const mongoose = require('mongoose');

// Connects to MongoDB using the address stored in the .env file.
async function connectDB() {
  const uri = process.env.MONGODB_URI;

  // Stop early with a clear message if the setting is missing.
  if (!uri) {
    throw new Error('MONGODB_URI is missing. Check your backend/.env file.');
  }

  // If MongoDB is not reachable, give up after 5 seconds instead of waiting 30.
  await mongoose.connect(uri, { serverSelectionTimeoutMS: 5000 });

  // Print the host and database name only, never the full address.
  console.log(
    `MongoDB connected. Host: ${mongoose.connection.host}, Database: ${mongoose.connection.name}`
  );
}

// Helpful messages if the connection drops later while the server is running.
mongoose.connection.on('disconnected', () => {
  console.warn('MongoDB disconnected.');
});
mongoose.connection.on('reconnected', () => {
  console.log('MongoDB reconnected.');
});

module.exports = connectDB;