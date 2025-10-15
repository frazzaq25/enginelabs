const mongoose = require('mongoose');

mongoose.set('strictQuery', true);

async function connect(uri) {
  const connectionUri = uri || process.env.MONGO_URI;

  if (!connectionUri) {
    throw new Error('MongoDB connection URI must be provided through MONGO_URI environment variable or as an argument.');
  }

  if (mongoose.connection.readyState === 1) {
    return mongoose.connection;
  }

  await mongoose.connect(connectionUri, {
    dbName: process.env.MONGO_DB_NAME || undefined
  });

  return mongoose.connection;
}

async function disconnect() {
  if (mongoose.connection.readyState !== 0) {
    await mongoose.disconnect();
  }
}

module.exports = {
  connect,
  disconnect
};
