const mongoose = require('mongoose');

const orderSchema = new mongoose.Schema({
  order_id: {
    type: String,
    required: true,
    unique: true
  },
  customer_name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  phone: {
    type: String,
    required: true
  },
  quantity: {
    type: Number,
    required: true,
    min: 1
  },
  qr_code: {
    type: String,
    required: true,
    unique: true
  },
  status: {
    type: String,
    enum: ['Pending', 'Processing', 'Fulfilled', 'Cancelled'],
    default: 'Pending'
  },
  fulfilled_by: {
    type: String,
    default: null
  },
  fulfilled_at: {
    type: Date,
    default: null
  },
  cancelled_by: {
    type: String,
    default: null
  },
  cancelled_at: {
    type: Date,
    default: null
  },
  has_issue: {
    type: Boolean,
    default: false
  },
  issue_description: {
    type: String,
    default: null
  },
  notes: [{
    note: {
      type: String,
      required: true
    },
    added_by: {
      type: String,
      required: true
    },
    added_at: {
      type: Date,
      default: Date.now
    },
    is_internal: {
      type: Boolean,
      default: true
    }
  }],
  status_history: [{
    status: {
      type: String,
      required: true
    },
    changed_by: {
      type: String,
      required: true
    },
    changed_at: {
      type: Date,
      default: Date.now
    },
    note: {
      type: String,
      default: null
    }
  }],
  total_price: {
    type: Number,
    required: true
  },
  created_at: {
    type: Date,
    default: Date.now
  }
});

module.exports = mongoose.model('Order', orderSchema);
