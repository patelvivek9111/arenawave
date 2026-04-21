const express = require('express');
const router = express.Router();
const Counter = require('../models/Counter');
const StockTransaction = require('../models/StockTransaction');

// Middleware to verify admin role
const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'arenawav-secret-key');
    
    if (decoded.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Middleware to verify employee or admin role
const verifyEmployee = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'arenawav-secret-key');
    
    if (decoded.role !== 'admin' && decoded.role !== 'employee') {
      return res.status(403).json({ error: 'Employee or admin access required' });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Ensure MongoDB connection
async function ensureMongoConnection() {
  const mongoose = require('mongoose');
  if (mongoose.connection.readyState === 0) {
    await mongoose.connect(process.env.MONGODB_URI || 'mongodb://localhost:27017/arenawav');
  }
}

// GET all counters (Admin & Employee)
router.get('/', verifyEmployee, async (req, res) => {
  try {
    await ensureMongoConnection();
    const counters = await Counter.find().sort({ counter_id: 1 });
    
    res.json({
      success: true,
      counters: counters.map(counter => ({
        counter_id: counter.counter_id,
        name: counter.name,
        location: counter.location,
        current_stock: counter.current_stock,
        initial_stock: counter.initial_stock,
        low_stock_threshold: counter.low_stock_threshold,
        critical_stock_threshold: counter.critical_stock_threshold,
        stock_status: counter.stock_status,
        is_active: counter.is_active,
        last_restocked_at: counter.last_restocked_at,
        created_at: counter.created_at
      }))
    });
  } catch (error) {
    console.error('Get counters error:', error);
    res.status(500).json({ error: 'Failed to get counters' });
  }
});

// GET single counter by ID
router.get('/:counterId', verifyEmployee, async (req, res) => {
  try {
    await ensureMongoConnection();
    const { counterId } = req.params;
    
    const counter = await Counter.findOne({ counter_id: counterId });
    
    if (!counter) {
      return res.status(404).json({ error: 'Counter not found' });
    }
    
    res.json({
      success: true,
      counter: {
        counter_id: counter.counter_id,
        name: counter.name,
        location: counter.location,
        current_stock: counter.current_stock,
        initial_stock: counter.initial_stock,
        low_stock_threshold: counter.low_stock_threshold,
        critical_stock_threshold: counter.critical_stock_threshold,
        stock_status: counter.stock_status,
        is_active: counter.is_active,
        last_restocked_at: counter.last_restocked_at,
        created_at: counter.created_at
      }
    });
  } catch (error) {
    console.error('Get counter error:', error);
    res.status(500).json({ error: 'Failed to get counter' });
  }
});

// POST create new counter (Admin only)
router.post('/', verifyAdmin, async (req, res) => {
  try {
    await ensureMongoConnection();
    const { counter_id, name, location, initial_stock, low_stock_threshold, critical_stock_threshold } = req.body;
    
    if (!counter_id || initial_stock === undefined) {
      return res.status(400).json({ error: 'counter_id and initial_stock are required' });
    }
    
    // Check if counter already exists
    const existingCounter = await Counter.findOne({ counter_id });
    if (existingCounter) {
      return res.status(400).json({ error: 'Counter with this ID already exists' });
    }
    
    // Use counter_id as name if name is not provided
    const counterName = name || counter_id;
    
    const counter = new Counter({
      counter_id,
      name: counterName,
      location: location || null,
      current_stock: initial_stock,
      initial_stock,
      low_stock_threshold: low_stock_threshold || 10,
      critical_stock_threshold: critical_stock_threshold || 5,
      is_active: true
    });
    
    await counter.save();
    
    res.json({
      success: true,
      message: 'Counter created successfully',
      counter: {
        counter_id: counter.counter_id,
        name: counter.name,
        location: counter.location,
        current_stock: counter.current_stock,
        initial_stock: counter.initial_stock,
        low_stock_threshold: counter.low_stock_threshold,
        critical_stock_threshold: counter.critical_stock_threshold,
        stock_status: counter.stock_status,
        is_active: counter.is_active
      }
    });
  } catch (error) {
    console.error('Create counter error:', error);
    res.status(500).json({ error: 'Failed to create counter' });
  }
});

// PUT update counter (Admin only)
router.put('/:counterId', verifyAdmin, async (req, res) => {
  try {
    await ensureMongoConnection();
    const { counterId } = req.params;
    const { name, location, low_stock_threshold, critical_stock_threshold, is_active } = req.body;
    
    const counter = await Counter.findOne({ counter_id: counterId });
    
    if (!counter) {
      return res.status(404).json({ error: 'Counter not found' });
    }
    
    if (name !== undefined) counter.name = name;
    if (location !== undefined) counter.location = location;
    if (low_stock_threshold !== undefined) counter.low_stock_threshold = low_stock_threshold;
    if (critical_stock_threshold !== undefined) counter.critical_stock_threshold = critical_stock_threshold;
    if (is_active !== undefined) counter.is_active = is_active;
    
    await counter.save();
    
    res.json({
      success: true,
      message: 'Counter updated successfully',
      counter: {
        counter_id: counter.counter_id,
        name: counter.name,
        location: counter.location,
        current_stock: counter.current_stock,
        initial_stock: counter.initial_stock,
        low_stock_threshold: counter.low_stock_threshold,
        critical_stock_threshold: counter.critical_stock_threshold,
        stock_status: counter.stock_status,
        is_active: counter.is_active
      }
    });
  } catch (error) {
    console.error('Update counter error:', error);
    res.status(500).json({ error: 'Failed to update counter' });
  }
});

// PUT restock counter (Admin & Employee)
router.put('/:counterId/restock', verifyEmployee, async (req, res) => {
  try {
    await ensureMongoConnection();
    const { counterId } = req.params;
    const { quantity, source_counter_id, notes } = req.body;
    const username = req.user.username;
    
    if (!quantity || quantity <= 0) {
      return res.status(400).json({ error: 'Valid quantity is required' });
    }
    
    const counter = await Counter.findOne({ counter_id: counterId });
    
    if (!counter) {
      return res.status(404).json({ error: 'Counter not found' });
    }
    
    if (!counter.is_active) {
      return res.status(400).json({ error: 'Cannot restock inactive counter' });
    }
    
    const quantity_before = counter.current_stock;
    
    // If restocking from another counter, decrease source counter stock
    if (source_counter_id) {
      const sourceCounter = await Counter.findOne({ counter_id: source_counter_id });
      
      if (!sourceCounter) {
        return res.status(404).json({ error: 'Source counter not found' });
      }
      
      if (!sourceCounter.hasEnoughStock(quantity)) {
        return res.status(400).json({ 
          error: `Insufficient stock in source counter. Available: ${sourceCounter.current_stock}, Requested: ${quantity}` 
        });
      }
      
      // Decrease source counter stock
      await sourceCounter.decreaseStock(quantity);
      
      // Create transaction for source counter
      await StockTransaction.create({
        counter_id: source_counter_id,
        transaction_type: 'restock_from_counter',
        quantity_change: -quantity,
        quantity_before: sourceCounter.current_stock + quantity,
        quantity_after: sourceCounter.current_stock,
        performed_by: username,
        notes: `Transferred to ${counterId}. ${notes || ''}`
      });
    }
    
    // Increase target counter stock
    await counter.increaseStock(quantity);
    
    const quantity_after = counter.current_stock;
    
    // Create transaction for target counter
    await StockTransaction.create({
      counter_id: counterId,
      transaction_type: source_counter_id ? 'restock_from_counter' : 'restock_new_batch',
      quantity_change: quantity,
      quantity_before: quantity_before,
      quantity_after: quantity_after,
      source_counter_id: source_counter_id || null,
      performed_by: username,
      notes: notes || null
    });
    
    res.json({
      success: true,
      message: source_counter_id 
        ? `Stock transferred from ${source_counter_id} to ${counterId}`
        : `Counter ${counterId} restocked with new stock`,
      counter: {
        counter_id: counter.counter_id,
        name: counter.name,
        current_stock: counter.current_stock,
        stock_status: counter.stock_status,
        last_restocked_at: counter.last_restocked_at
      }
    });
  } catch (error) {
    console.error('Restock counter error:', error);
    res.status(500).json({ error: error.message || 'Failed to restock counter' });
  }
});

// GET counter recommendations (find counters with available stock)
router.get('/:counterId/recommendations', verifyEmployee, async (req, res) => {
  try {
    await ensureMongoConnection();
    const { counterId } = req.params;
    
    const currentCounter = await Counter.findOne({ counter_id: counterId });
    
    if (!currentCounter) {
      return res.status(404).json({ error: 'Counter not found' });
    }
    
    // Find all active counters with stock > 0, excluding current counter
    const availableCounters = await Counter.find({
      counter_id: { $ne: counterId },
      is_active: true,
      current_stock: { $gt: 0 }
    }).sort({ current_stock: -1 }); // Sort by highest stock first
    
    res.json({
      success: true,
      current_counter: {
        counter_id: currentCounter.counter_id,
        name: currentCounter.name,
        current_stock: currentCounter.current_stock,
        stock_status: currentCounter.stock_status
      },
      recommendations: availableCounters.map(counter => ({
        counter_id: counter.counter_id,
        name: counter.name,
        location: counter.location,
        current_stock: counter.current_stock,
        stock_status: counter.stock_status
      }))
    });
  } catch (error) {
    console.error('Get recommendations error:', error);
    res.status(500).json({ error: 'Failed to get recommendations' });
  }
});

module.exports = router;

