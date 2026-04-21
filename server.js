const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const path = require('path');
const { MongoMemoryServer } = require('mongodb-memory-server');
require('dotenv').config();
// Force local/in-memory DB when Atlas URI is wrong or DNS-blocked (dev only).
if (process.env.USE_IN_MEMORY_DB === '1' || process.env.USE_IN_MEMORY_DB === 'true') {
  delete process.env.MONGODB_URI;
}

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// MongoDB Connection
let mongoServer;
let isConnected = false;

const mongooseOpts = {
  useNewUrlParser: true,
  useUnifiedTopology: true,
};

async function connectLocalOrMemory() {
  try {
    await mongoose.connect('mongodb://localhost:27017/arenawav', mongooseOpts);
    console.log('Connected to local MongoDB');
    isConnected = true;
  } catch {
    console.log('Local MongoDB not available, using in-memory database...');
    mongoServer = await MongoMemoryServer.create();
    await mongoose.connect(mongoServer.getUri(), mongooseOpts);
    console.log('Connected to in-memory MongoDB');
    isConnected = true;
  }
}

async function connectDB() {
  // If already connected, return
  if (mongoose.connection.readyState === 1) {
    return;
  }

  try {
    console.log('Environment variables:');
    console.log('MONGODB_URI:', process.env.MONGODB_URI ? 'SET' : 'NOT SET');
    console.log('NODE_ENV:', process.env.NODE_ENV);

    if (process.env.MONGODB_URI) {
      console.log('Attempting to connect using MONGODB_URI...');
      try {
        await mongoose.connect(process.env.MONGODB_URI, {
          ...mongooseOpts,
          serverSelectionTimeoutMS: 10000,
          socketTimeoutMS: 45000,
        });
        console.log('Connected to MongoDB');
        isConnected = true;
      } catch (remoteError) {
        const allowDevFallback = process.env.NODE_ENV !== 'production';
        if (!allowDevFallback) {
          throw remoteError;
        }
        console.warn(
          'Configured MongoDB unreachable (e.g. DNS/network). Falling back to local or in-memory (development only).'
        );
        if (mongoose.connection.readyState !== 0) {
          await mongoose.disconnect();
        }
        await connectLocalOrMemory();
      }
    } else {
      await connectLocalOrMemory();
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
const counterRoutes = require('./routes/counters');

// Serve manifest.json explicitly (for Vercel)
// This route must be defined BEFORE any API routes to avoid conflicts
app.get('/manifest.json', (req, res) => {
  // Return manifest JSON directly to avoid filesystem issues in serverless
  const manifest = {
    "short_name": "ArenaWav",
    "name": "ArenaWav E-commerce",
    "icons": [
      {
        "src": "favicon.png",
        "sizes": "512x512 192x192 32x32",
        "type": "image/png",
        "purpose": "any maskable"
      }
    ],
    "start_url": ".",
    "display": "standalone",
    "theme_color": "#000000",
    "background_color": "#ffffff"
  };
  
  res.setHeader('Content-Type', 'application/manifest+json');
  res.setHeader('Cache-Control', 'public, max-age=3600');
  res.json(manifest);
});

// Routes
app.use('/api/order', orderRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/counters', counterRoutes);

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
      total_price: 20,
      currency: 'USD',
      pricing_region: 'north_america'
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

// Serve static files from React app (only in production and NOT in Vercel)
// In Vercel, static files are handled by the filesystem handler in vercel.json
if (process.env.NODE_ENV === 'production' && !process.env.VERCEL) {
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
  const server = app.listen(PORT, () => {
    console.log(`Server running on port ${PORT}`);
  });
  server.on('error', (err) => {
    if (err.code === 'EADDRINUSE') {
      console.error(
        `Port ${PORT} is already in use. Close the other app (often another "npm run dev") or set PORT in .env to a free port.`
      );
      console.error(`Find PID: Get-NetTCPConnection -LocalPort ${PORT} | Select-Object OwningProcess`);
      process.exit(1);
    }
    throw err;
  });
}
