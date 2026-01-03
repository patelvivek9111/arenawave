const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { MongoMemoryServer } = require('mongodb-memory-server');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
let mongoServer;
let isConnected = false;

async function connectDB() {
  // If already connected, return
  if (mongoose.connection.readyState === 1) {
    return;
  }

  try {
    console.log('Environment variables:');
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
    console.log('NODE_ENV:', process.env.NODE_ENV);
    
    const mongoUri = process.env.MONGODB_URI || 'mongodb://localhost:27017/arenawave';
    
    // If MONGODB_URI is set, use it (Atlas or local)
    if (process.env.MONGODB_URI) {
      console.log('Attempting to connect to MongoDB Atlas...');
      await mongoose.connect(process.env.MONGODB_URI, {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        serverSelectionTimeoutMS: 10000, // 10 seconds timeout
        socketTimeoutMS: 45000, // 45 seconds socket timeout
      });
      console.log('Connected to MongoDB Atlas');
      isConnected = true;
    } else {
      // Try to connect to local MongoDB first, fallback to in-memory
      try {
        await mongoose.connect('mongodb://localhost:27017/arenawave', {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        console.log('Connected to local MongoDB');
        isConnected = true;
      } catch (localError) {
        console.log('Local MongoDB not available, using in-memory database...');
        mongoServer = await MongoMemoryServer.create();
        const mongoUri = mongoServer.getUri();
        await mongoose.connect(mongoUri, {
          useNewUrlParser: true,
          useUnifiedTopology: true,
        });
        console.log('Connected to in-memory MongoDB');
        isConnected = true;
      }
    }
  } catch (error) {
    console.error('MongoDB connection error:', error);
    isConnected = false;
  }
}

// Connect to database
connectDB();

// Handle connection events
mongoose.connection.on('connected', () => {
  console.log('Mongoose connected to MongoDB');
  isConnected = true;
});

mongoose.connection.on('error', (err) => {
  console.error('Mongoose connection error:', err);
  isConnected = false;
});

mongoose.connection.on('disconnected', () => {
  console.log('Mongoose disconnected');
  isConnected = false;
});

// Import routes
const orderRoutes = require('./routes/orders');
const authRoutes = require('./routes/auth');
const adminRoutes = require('./routes/admin');

// Routes
app.use('/api/order', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({ 
    status: 'OK', 
    message: 'Server is running',
    mongooseState: mongoose.connection.readyState,
    hasMongoUri: !!process.env.MONGODB_URI
  });
});

// MongoDB connection test endpoint
app.get('/api/test/mongodb', async (req, res) => {
  try {
    const mongoose = require('mongoose');
    const mongoUri = process.env.MONGODB_URI;
    
    if (!mongoUri) {
      return res.status(500).json({ 
        error: 'MONGODB_URI not set',
        mongooseState: mongoose.connection.readyState
      });
    }
    
    // Test connection
    if (mongoose.connection.readyState === 1) {
      // Already connected, test with a simple query
      await mongoose.connection.db.admin().ping();
      return res.json({ 
        status: 'Connected',
        readyState: mongoose.connection.readyState,
        host: mongoose.connection.host,
        name: mongoose.connection.name
      });
    }
    
    // Try to connect
    await mongoose.connect(mongoUri, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      serverSelectionTimeoutMS: 10000,
      socketTimeoutMS: 45000,
    });
    
    res.json({ 
      status: 'Connected successfully',
      readyState: mongoose.connection.readyState,
      host: mongoose.connection.host,
      name: mongoose.connection.name
    });
  } catch (error) {
    console.error('MongoDB test error:', error);
    res.status(500).json({ 
      error: 'MongoDB connection failed',
      message: error.message,
      name: error.name,
      code: error.code,
      mongooseState: mongoose.connection.readyState
    });
  }
});

// Test endpoint to create a sample order
app.post('/api/test/create-order', async (req, res) => {
  try {
    const Order = require('./models/Order');
    const QRCode = require('qrcode');
    
    const order_id = 'TEST_ORDER_123';
    const qrData = JSON.stringify({
      order_id: order_id,
      type: 'order'
    });
    
    const qr_code = await QRCode.toDataURL(qrData);
    
    const order = new Order({
      order_id,
      customer_name: 'Test Customer',
      email: 'test@example.com',
      phone: '1234567890',
      quantity: 1,
      qr_code,
      total_price: 500
    });
    
    await order.save();
    
    res.json({
      success: true,
      message: 'Test order created',
      order: {
        order_id,
        qr_code
      }
    });
  } catch (error) {
    console.error('Test order creation error:', error);
    res.status(500).json({ error: 'Failed to create test order' });
  }
});

// Serve static files from React app (only in production)
if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.join(__dirname, 'client/build')));

  // Catch all handler: send back React's index.html file
  app.get('*', (req, res) => {
    res.sendFile(path.join(__dirname, 'client/build', 'index.html'));
  });
}

// Export app for Vercel serverless functions
module.exports = app;

// Only start server if not in Vercel environment
if (process.env.VERCEL !== '1') {
  app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
}
