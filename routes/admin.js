const express = require('express');
const router = express.Router();
const Order = require('../models/Order');

// Middleware to verify admin role
const verifyAdmin = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'No token provided' });
  }

  try {
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'arenawave-secret-key');
    
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
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'arenawave-secret-key');
    
    if (decoded.role !== 'admin' && decoded.role !== 'employee') {
      return res.status(403).json({ error: 'Employee or admin access required' });
    }
    
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Get all orders
router.get('/orders', verifyAdmin, async (req, res) => {
  try {
    const orders = await Order.find().sort({ created_at: -1 });
    
    res.json({
      success: true,
      orders: orders.map(order => ({
        order_id: order.order_id,
        customer_name: order.customer_name,
        email: order.email,
        phone: order.phone,
        quantity: order.quantity,
        total_price: order.total_price,
        status: order.status,
        fulfilled_by: order.fulfilled_by,
        fulfilled_at: order.fulfilled_at,
        created_at: order.created_at
      }))
    });
  } catch (error) {
    console.error('Get orders error:', error);
    res.status(500).json({ error: 'Failed to get orders' });
  }
});

// Get customers with aggregated data
router.get('/customers', verifyAdmin, async (req, res) => {
  try {
    const customers = await Order.aggregate([
      {
        $group: {
          _id: '$email',
          name: { $first: '$customer_name' },
          email: { $first: '$email' },
          phone: { $first: '$phone' },
          totalOrders: { $sum: 1 },
          totalSpent: { $sum: '$total_price' },
          lastOrder: { $max: '$created_at' }
        }
      },
      {
        $sort: { lastOrder: -1 }
      }
    ]);

    res.json({
      success: true,
      customers: customers.map(customer => ({
        name: customer.name,
        email: customer.email,
        phone: customer.phone,
        totalOrders: customer.totalOrders,
        totalSpent: customer.totalSpent,
        lastOrder: customer.lastOrder
      }))
    });
  } catch (error) {
    console.error('Get customers error:', error);
    res.status(500).json({ error: 'Failed to get customers' });
  }
});

// Get employees (hardcoded for now)
router.get('/employees', verifyAdmin, async (req, res) => {
  try {
    // In a real application, this would come from a database
    const employees = [
      {
        username: 'admin1',
        role: 'admin',
        status: 'active'
      },
      {
        username: 'employee1',
        role: 'employee',
        status: 'active'
      }
    ];

    res.json({
      success: true,
      employees
    });
  } catch (error) {
    console.error('Get employees error:', error);
    res.status(500).json({ error: 'Failed to get employees' });
  }
});

// Search orders and customers
router.get('/search', verifyAdmin, async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const searchTerm = query.trim();
    
    // Search orders by order_id, customer_name, email, or phone
    const orders = await Order.find({
      $or: [
        { order_id: { $regex: searchTerm, $options: 'i' } },
        { customer_name: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
        { phone: { $regex: searchTerm, $options: 'i' } }
      ]
    }).sort({ created_at: -1 });

    // Get unique customers from search results
    const customerMap = new Map();
    
    orders.forEach(order => {
      const key = order.email.toLowerCase();
      if (!customerMap.has(key)) {
        customerMap.set(key, {
          name: order.customer_name,
          email: order.email,
          phone: order.phone,
          totalOrders: 0,
          totalSpent: 0,
          lastOrder: order.created_at,
          orders: []
        });
      }
      const customer = customerMap.get(key);
      customer.totalOrders += 1;
      customer.totalSpent += order.total_price;
      customer.orders.push({
        order_id: order.order_id,
        quantity: order.quantity,
        total_price: order.total_price,
        status: order.status,
        created_at: order.created_at,
        fulfilled_at: order.fulfilled_at
      });
      if (order.created_at > customer.lastOrder) {
        customer.lastOrder = order.created_at;
      }
    });

    const customers = Array.from(customerMap.values());

    res.json({
      success: true,
      orders: orders.map(order => ({
        order_id: order.order_id,
        customer_name: order.customer_name,
        email: order.email,
        phone: order.phone,
        quantity: order.quantity,
        total_price: order.total_price,
        status: order.status,
        fulfilled_by: order.fulfilled_by,
        fulfilled_at: order.fulfilled_at,
        created_at: order.created_at
      })),
      customers
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ error: 'Failed to search' });
  }
});

// Get all orders for a specific customer (by email)
router.get('/customer/:email/orders', verifyAdmin, async (req, res) => {
  try {
    const { email } = req.params;
    
    const orders = await Order.find({ email: decodeURIComponent(email) })
      .sort({ created_at: -1 });

    if (orders.length === 0) {
      return res.json({
        success: true,
        customer: null,
        orders: []
      });
    }

    // Get customer info from first order
    const customer = {
      name: orders[0].customer_name,
      email: orders[0].email,
      phone: orders[0].phone,
      totalOrders: orders.length,
      totalSpent: orders.reduce((sum, order) => sum + order.total_price, 0),
      lastOrder: orders[0].created_at
    };

    res.json({
      success: true,
      customer,
      orders: orders.map(order => ({
        order_id: order.order_id,
        customer_name: order.customer_name,
        email: order.email,
        phone: order.phone,
        quantity: order.quantity,
        total_price: order.total_price,
        status: order.status,
        fulfilled_by: order.fulfilled_by,
        fulfilled_at: order.fulfilled_at,
        created_at: order.created_at
      }))
    });
  } catch (error) {
    console.error('Get customer orders error:', error);
    res.status(500).json({ error: 'Failed to get customer orders' });
  }
});

// Employee search endpoint (for both employees and admins)
router.get('/employee/search', verifyEmployee, async (req, res) => {
  try {
    const { query } = req.query;
    
    if (!query || query.trim() === '') {
      return res.status(400).json({ error: 'Search query is required' });
    }

    const searchTerm = query.trim();
    
    // Search orders by order_id, customer_name, email, or phone
    const orders = await Order.find({
      $or: [
        { order_id: { $regex: searchTerm, $options: 'i' } },
        { customer_name: { $regex: searchTerm, $options: 'i' } },
        { email: { $regex: searchTerm, $options: 'i' } },
        { phone: { $regex: searchTerm, $options: 'i' } }
      ]
    }).sort({ created_at: -1 }).limit(50); // Limit to 50 results for performance

    res.json({
      success: true,
      orders: orders.map(order => ({
        order_id: order.order_id,
        customer_name: order.customer_name,
        email: order.email,
        phone: order.phone,
        quantity: order.quantity,
        total_price: order.total_price,
        status: order.status,
        fulfilled_by: order.fulfilled_by,
        fulfilled_at: order.fulfilled_at,
        created_at: order.created_at,
        items: order.items || []
      }))
    });
  } catch (error) {
    console.error('Employee search error:', error);
    res.status(500).json({ error: 'Failed to search orders' });
  }
});

// Get customer order history (for employees)
router.get('/employee/customer/:email/orders', verifyEmployee, async (req, res) => {
  try {
    const { email } = req.params;
    
    const orders = await Order.find({ email: decodeURIComponent(email) })
      .sort({ created_at: -1 });

    if (orders.length === 0) {
      return res.json({
        success: true,
        customer: null,
        orders: [],
        stats: {
          totalOrders: 0,
          totalSpent: 0,
          averageOrderValue: 0,
          mostCommonQuantity: 0,
          statusBreakdown: {}
        }
      });
    }

    // Get customer info from first order
    const customer = {
      name: orders[0].customer_name,
      email: orders[0].email,
      phone: orders[0].phone,
      totalOrders: orders.length,
      totalSpent: orders.reduce((sum, order) => sum + order.total_price, 0),
      firstOrder: orders[orders.length - 1].created_at,
      lastOrder: orders[0].created_at
    };

    // Calculate statistics
    const totalSpent = orders.reduce((sum, order) => sum + order.total_price, 0);
    const averageOrderValue = totalSpent / orders.length;
    
    // Find most common quantity
    const quantityCounts = {};
    orders.forEach(order => {
      quantityCounts[order.quantity] = (quantityCounts[order.quantity] || 0) + 1;
    });
    const mostCommonQuantity = Object.keys(quantityCounts).reduce((a, b) => 
      quantityCounts[a] > quantityCounts[b] ? a : b
    );

    // Status breakdown
    const statusBreakdown = {};
    orders.forEach(order => {
      statusBreakdown[order.status] = (statusBreakdown[order.status] || 0) + 1;
    });

    res.json({
      success: true,
      customer,
      orders: orders.map(order => ({
        order_id: order.order_id,
        customer_name: order.customer_name,
        email: order.email,
        phone: order.phone,
        quantity: order.quantity,
        total_price: order.total_price,
        status: order.status,
        fulfilled_by: order.fulfilled_by,
        fulfilled_at: order.fulfilled_at,
        cancelled_at: order.cancelled_at,
        has_issue: order.has_issue || false,
        created_at: order.created_at
      })),
      stats: {
        totalOrders: orders.length,
        totalSpent,
        averageOrderValue: Math.round(averageOrderValue * 100) / 100,
        mostCommonQuantity: parseInt(mostCommonQuantity),
        statusBreakdown
      }
    });
  } catch (error) {
    console.error('Get customer orders error:', error);
    res.status(500).json({ error: 'Failed to get customer orders' });
  }
});

// Get order details by order ID (for employees)
router.get('/employee/order/:orderId', verifyEmployee, async (req, res) => {
  try {
    const { orderId } = req.params;
    
    const order = await Order.findOne({ order_id: orderId });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      success: true,
      order: {
        order_id: order.order_id,
        customer_name: order.customer_name,
        email: order.email,
        phone: order.phone,
        address: order.address,
        quantity: order.quantity,
        total_price: order.total_price,
        status: order.status,
        fulfilled_by: order.fulfilled_by,
        fulfilled_at: order.fulfilled_at,
        cancelled_by: order.cancelled_by,
        cancelled_at: order.cancelled_at,
        has_issue: order.has_issue || false,
        issue_description: order.issue_description,
        notes: order.notes || [],
        status_history: order.status_history || [],
        created_at: order.created_at,
        items: order.items || []
      }
    });
  } catch (error) {
    console.error('Get order details error:', error);
    res.status(500).json({ error: 'Failed to get order details' });
  }
});

// Update order status
router.put('/employee/order/:orderId/status', verifyEmployee, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { status, note, counter_id } = req.body;
    const username = req.user.username;
    
    if (!status || !['Pending', 'Processing', 'Fulfilled', 'Cancelled'].includes(status)) {
      return res.status(400).json({ error: 'Valid status is required' });
    }
    
    const Order = require('../models/Order');
    const Counter = require('../models/Counter');
    const StockTransaction = require('../models/StockTransaction');
    
    const order = await Order.findOne({ order_id: orderId });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    // If changing to Fulfilled, require counter_id and handle stock
    if (status === 'Fulfilled') {
      if (!counter_id) {
        return res.status(400).json({ error: 'counter_id is required when fulfilling order' });
      }
      
      const counter = await Counter.findOne({ counter_id });
      
      if (!counter) {
        return res.status(404).json({ error: 'Counter not found' });
      }
      
      if (!counter.is_active) {
        return res.status(400).json({ error: 'Counter is not active' });
      }
      
      if (!counter.hasEnoughStock(order.quantity)) {
        return res.status(400).json({ 
          error: `Insufficient stock. Available: ${counter.current_stock}, Required: ${order.quantity}`,
          available_stock: counter.current_stock,
          required_quantity: order.quantity
        });
      }
      
      // Decrease counter stock
      const quantity_before = counter.current_stock;
      await counter.decreaseStock(order.quantity);
      const quantity_after = counter.current_stock;
      
      // Create stock transaction
      await StockTransaction.create({
        counter_id: counter_id,
        order_id: orderId,
        transaction_type: 'fulfill',
        quantity_change: -order.quantity,
        quantity_before: quantity_before,
        quantity_after: quantity_after,
        performed_by: username,
        notes: `Order ${orderId} fulfilled via status update`
      });
      
      order.fulfilled_at_counter = counter_id;
    }
    
    const oldStatus = order.status;
    order.status = status;
    
    // Update status-specific fields
    if (status === 'Fulfilled') {
      order.fulfilled_by = username;
      order.fulfilled_at = new Date();
    } else if (status === 'Cancelled') {
      order.cancelled_by = username;
      order.cancelled_at = new Date();
    }
    
    // Add to status history
    if (!order.status_history) {
      order.status_history = [];
    }
    order.status_history.push({
      status: status,
      changed_by: username,
      changed_at: new Date(),
      note: note || null
    });
    
    await order.save();
    
    res.json({
      success: true,
      message: `Order status updated from ${oldStatus} to ${status}`,
      order: {
        order_id: order.order_id,
        status: order.status,
        fulfilled_by: order.fulfilled_by,
        fulfilled_at: order.fulfilled_at,
        fulfilled_at_counter: order.fulfilled_at_counter,
        cancelled_by: order.cancelled_by,
        cancelled_at: order.cancelled_at
      }
    });
  } catch (error) {
    console.error('Update order status error:', error);
    res.status(500).json({ error: error.message || 'Failed to update order status' });
  }
});

// Add note to order
router.post('/employee/order/:orderId/notes', verifyEmployee, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { note, is_internal } = req.body;
    const username = req.user.username;
    
    if (!note || note.trim() === '') {
      return res.status(400).json({ error: 'Note is required' });
    }
    
    const order = await Order.findOne({ order_id: orderId });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    if (!order.notes) {
      order.notes = [];
    }
    
    order.notes.push({
      note: note.trim(),
      added_by: username,
      added_at: new Date(),
      is_internal: is_internal !== false // Default to true (internal)
    });
    
    await order.save();
    
    res.json({
      success: true,
      message: 'Note added successfully',
      note: order.notes[order.notes.length - 1]
    });
  } catch (error) {
    console.error('Add note error:', error);
    res.status(500).json({ error: 'Failed to add note' });
  }
});

// Mark/unmark order as having issue
router.put('/employee/order/:orderId/issue', verifyEmployee, async (req, res) => {
  try {
    const { orderId } = req.params;
    const { has_issue, issue_description } = req.body;
    
    const order = await Order.findOne({ order_id: orderId });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    order.has_issue = has_issue === true;
    order.issue_description = has_issue ? (issue_description || null) : null;
    
    // Add note when marking as issue
    if (has_issue && issue_description) {
      if (!order.notes) {
        order.notes = [];
      }
      order.notes.push({
        note: `Issue flagged: ${issue_description}`,
        added_by: req.user.username,
        added_at: new Date(),
        is_internal: true
      });
    }
    
    await order.save();
    
    res.json({
      success: true,
      message: has_issue ? 'Order marked as having issue' : 'Issue flag removed',
      order: {
        order_id: order.order_id,
        has_issue: order.has_issue,
        issue_description: order.issue_description
      }
    });
  } catch (error) {
    console.error('Update issue flag error:', error);
    res.status(500).json({ error: 'Failed to update issue flag' });
  }
});

// Resend order confirmation email (for employees)
router.post('/employee/order/:orderId/resend-email', verifyEmployee, async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ order_id: orderId });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    // Import nodemailer
    const nodemailer = require('nodemailer');
    const transporter = nodemailer.createTransport({
      host: 'smtp.ethereal.email',
      port: 587,
      secure: false,
      auth: {
        user: 'maddison53@ethereal.email',
        pass: 'jnrjnEtqhYzqkzqkzq'
      }
    });

    const mailOptions = {
      from: 'noreply@arenawave.com',
      to: order.email,
      subject: 'Order Confirmation - FM Radio Earwing (Resent)',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Order Confirmation</h2>
          <p>Dear ${order.customer_name},</p>
          <p>This is a resend of your order confirmation.</p>
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Order Details:</h3>
            <p><strong>Order ID:</strong> ${order.order_id}</p>
            <p><strong>Product:</strong> FM Radio Earwing</p>
            <p><strong>Quantity:</strong> ${order.quantity}</p>
            <p><strong>Total Amount:</strong> ₹${order.total_price}</p>
            <p><strong>Status:</strong> ${order.status}</p>
          </div>
          <p>Please present this QR code to collect your order:</p>
          <img src="${order.qr_code}" alt="QR Code" style="max-width: 200px; display: block; margin: 20px auto;">
          <p>Thank you for choosing ArenaWave!</p>
        </div>
      `
    };
    
    try {
      await transporter.sendMail(mailOptions);
      res.json({
        success: true,
        message: 'Order confirmation email resent successfully'
      });
    } catch (emailError) {
      console.error('Email sending error:', emailError);
      res.status(500).json({ error: 'Failed to send email' });
    }
  } catch (error) {
    console.error('Resend email error:', error);
    res.status(500).json({ error: 'Failed to resend email' });
  }
});

// Get order summary for PDF generation (for employees)
router.get('/employee/order/:orderId/summary', verifyEmployee, async (req, res) => {
  try {
    const { orderId } = req.params;
    const order = await Order.findOne({ order_id: orderId });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }

    res.json({
      success: true,
      summary: {
        order_id: order.order_id,
        customer_name: order.customer_name,
        email: order.email,
        phone: order.phone,
        quantity: order.quantity,
        total_price: order.total_price,
        status: order.status,
        created_at: order.created_at,
        fulfilled_at: order.fulfilled_at,
        product: 'FM Radio Earwing',
        unit_price: 500
      }
    });
  } catch (error) {
    console.error('Get order summary error:', error);
    res.status(500).json({ error: 'Failed to get order summary' });
  }
});

// Get dashboard statistics
router.get('/stats', verifyAdmin, async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments();
    const totalRevenue = await Order.aggregate([
      {
        $group: {
          _id: null,
          total: { $sum: '$total_price' }
        }
      }
    ]);
    
    const pendingOrders = await Order.countDocuments({ status: 'Pending' });
    const fulfilledOrders = await Order.countDocuments({ status: 'Fulfilled' });
    
    const uniqueCustomers = (await Order.distinct('email')).length;

    res.json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingOrders,
        fulfilledOrders,
        totalCustomers: uniqueCustomers
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

module.exports = router;
