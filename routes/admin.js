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
    
    const uniqueCustomers = await Order.distinct('email').count();

    // Get employee performance data
    const employeeStats = await Order.aggregate([
      {
        $match: { status: 'Fulfilled' }
      },
      {
        $group: {
          _id: '$fulfilled_by',
          ordersFulfilled: { $sum: 1 },
          totalRevenue: { $sum: '$total_price' }
        }
      },
      {
        $sort: { ordersFulfilled: -1 }
      },
      {
        $limit: 1
      }
    ]);

    const topEmployee = employeeStats[0] || null;

    res.json({
      success: true,
      stats: {
        totalOrders,
        totalRevenue: totalRevenue[0]?.total || 0,
        pendingOrders,
        fulfilledOrders,
        totalCustomers: uniqueCustomers,
        topEmployee: topEmployee ? {
          username: topEmployee._id,
          ordersFulfilled: topEmployee.ordersFulfilled,
          totalRevenue: topEmployee.totalRevenue
        } : null
      }
    });
  } catch (error) {
    console.error('Get stats error:', error);
    res.status(500).json({ error: 'Failed to get statistics' });
  }
});

module.exports = router;
