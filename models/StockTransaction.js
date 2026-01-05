const mongoose = require('mongoose');

const stockTransactionSchema = new mongoose.Schema({
  counter_id: {
    type: String,
    required: true,
    ref: 'Counter'
  },
  order_id: {
    type: String,
    default: null,
    ref: 'Order'
  },
  transaction_type: {
    type: String,
    required: true,
    enum: ['fulfill', 'restock_from_counter', 'restock_new_batch', 'adjustment']
  },
  quantity_change: {
    type: Number,
    required: true
  },
  quantity_before: {
    type: Number,
    required: true
  },
  quantity_after: {
    type: Number,
    required: true
  },
  source_counter_id: {
    type: String,
    default: null,
    ref: 'Counter'
  },
  performed_by: {
    type: String,
    required: true
  },
  timestamp: {
    type: Date,
    default: Date.now
  },
  notes: {
    type: String,
    default: null
  }
});

// Index for faster queries
stockTransactionSchema.index({ counter_id: 1, timestamp: -1 });
stockTransactionSchema.index({ order_id: 1 });

module.exports = mongoose.model('StockTransaction', stockTransactionSchema);

