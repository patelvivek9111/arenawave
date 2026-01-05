const mongoose = require('mongoose');

const counterSchema = new mongoose.Schema({
  counter_id: {
    type: String,
    required: true,
    unique: true,
    trim: true
  },
  name: {
    type: String,
    required: true,
    trim: true
  },
  location: {
    type: String,
    default: null,
    trim: true
  },
  current_stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  initial_stock: {
    type: Number,
    required: true,
    default: 0,
    min: 0
  },
  low_stock_threshold: {
    type: Number,
    required: true,
    default: 10,
    min: 0
  },
  critical_stock_threshold: {
    type: Number,
    required: true,
    default: 5,
    min: 0
  },
  is_active: {
    type: Boolean,
    default: true
  },
  last_restocked_at: {
    type: Date,
    default: null
  },
  created_at: {
    type: Date,
    default: Date.now
  },
  updated_at: {
    type: Date,
    default: Date.now
  }
});

// Update the updated_at field before saving
counterSchema.pre('save', function(next) {
  this.updated_at = Date.now();
  next();
});

// Virtual for stock status
counterSchema.virtual('stock_status').get(function() {
  if (this.current_stock === 0) {
    return 'out';
  } else if (this.current_stock <= this.critical_stock_threshold) {
    return 'critical';
  } else if (this.current_stock <= this.low_stock_threshold) {
    return 'low';
  } else {
    return 'good';
  }
});

// Method to check if counter has enough stock
counterSchema.methods.hasEnoughStock = function(quantity) {
  return this.current_stock >= quantity;
};

// Method to decrease stock
counterSchema.methods.decreaseStock = async function(quantity) {
  if (this.current_stock < quantity) {
    throw new Error(`Insufficient stock. Available: ${this.current_stock}, Requested: ${quantity}`);
  }
  this.current_stock -= quantity;
  return await this.save();
};

// Method to increase stock
counterSchema.methods.increaseStock = async function(quantity) {
  this.current_stock += quantity;
  this.last_restocked_at = new Date();
  return await this.save();
};

module.exports = mongoose.model('Counter', counterSchema);

