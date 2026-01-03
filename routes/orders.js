const express = require('express');
const router = express.Router();
const QRCode = require('qrcode');
const nodemailer = require('nodemailer');
const Order = require('../models/Order');

// Generate unique order ID
const generateOrderId = () => {
  return 'AW' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
};

// Email transporter setup (dummy SMTP - using Ethereal Email for testing)
const transporter = nodemailer.createTransport({
  host: 'smtp.ethereal.email',
  port: 587,
  secure: false,
  auth: {
    user: 'maddison53@ethereal.email',
    pass: 'jnrjnEtqhYzqkzqkzq'
  }
});

// Create order and generate QR code
router.post('/create', async (req, res) => {
  try {
    const { customer_name, email, phone, quantity } = req.body;
    
    if (!customer_name || !email || !phone || !quantity) {
      return res.status(400).json({ error: 'All fields are required' });
    }

    const order_id = generateOrderId();
    const total_price = quantity * 500; // ₹500 per unit
    
    // Generate QR code data
    const qrData = JSON.stringify({
      order_id: order_id,
      type: 'order'
    });
    
    // Generate QR code as data URL
    const qr_code = await QRCode.toDataURL(qrData);
    
    // Create order in database
    const order = new Order({
      order_id,
      customer_name,
      email,
      phone,
      quantity,
      qr_code,
      total_price
    });
    
    await order.save();
    
    // Send email confirmation
    const mailOptions = {
      from: 'noreply@arenawave.com',
      to: email,
      subject: 'Order Confirmation - FM Radio Earwing',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #2563eb;">Order Confirmation</h2>
          <p>Dear ${customer_name},</p>
          <p>Your order has been successfully placed!</p>
          <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
            <h3>Order Details:</h3>
            <p><strong>Order ID:</strong> ${order_id}</p>
            <p><strong>Product:</strong> FM Radio Earwing</p>
            <p><strong>Quantity:</strong> ${quantity}</p>
            <p><strong>Total Amount:</strong> ₹${total_price}</p>
          </div>
          <p>Please present this QR code to collect your order:</p>
          <img src="${qr_code}" alt="QR Code" style="max-width: 200px; display: block; margin: 20px auto;">
          <p>Thank you for choosing ArenaWave!</p>
        </div>
      `
    };
    
    try {
      await transporter.sendMail(mailOptions);
    } catch (emailError) {
      console.log('Email sending failed:', emailError.message);
    }
    
    res.json({
      success: true,
      order: {
        order_id,
        customer_name,
        email,
        phone,
        quantity,
        total_price,
        qr_code
      }
    });
    
  } catch (error) {
    console.error('Order creation error:', error);
    res.status(500).json({ error: 'Failed to create order' });
  }
});

// Check order status by QR code
router.post('/fulfill', async (req, res) => {
  try {
    const { qrData } = req.body;
    
    if (!qrData) {
      return res.status(400).json({ error: 'QR data is required' });
    }
    
    let orderData;
    try {
      orderData = JSON.parse(qrData);
    } catch (parseError) {
      return res.status(400).json({ error: 'Invalid QR code format' });
    }
    
    const order = await Order.findOne({ order_id: orderData.order_id });
    
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
        quantity: order.quantity,
        total_price: order.total_price,
        status: order.status
      }
    });
    
  } catch (error) {
    console.error('Order fulfillment check error:', error);
    res.status(500).json({ error: 'Failed to check order' });
  }
});

// Mark order as fulfilled
router.put('/fulfill/:orderId', async (req, res) => {
  try {
    const { orderId } = req.params;
    const token = req.headers.authorization?.split(' ')[1];
    
    if (!token) {
      return res.status(401).json({ error: 'No token provided' });
    }

    // Verify token and get employee info
    const jwt = require('jsonwebtoken');
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'arenawave-secret-key');
    
    const order = await Order.findOne({ order_id: orderId });
    
    if (!order) {
      return res.status(404).json({ error: 'Order not found' });
    }
    
    if (order.status === 'Fulfilled') {
      return res.status(400).json({ error: 'Order already fulfilled' });
    }
    
    order.status = 'Fulfilled';
    order.fulfilled_by = decoded.username;
    order.fulfilled_at = new Date();
    await order.save();
    
    res.json({
      success: true,
      message: 'Order marked as fulfilled',
      order: {
        order_id: order.order_id,
        customer_name: order.customer_name,
        quantity: order.quantity,
        status: order.status,
        fulfilled_by: order.fulfilled_by,
        fulfilled_at: order.fulfilled_at
      }
    });
    
  } catch (error) {
    console.error('Order fulfillment error:', error);
    res.status(500).json({ error: 'Failed to fulfill order' });
  }
});

// Get order status by ID
router.get('/status/:orderId', async (req, res) => {
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
        quantity: order.quantity,
        total_price: order.total_price,
        status: order.status,
        created_at: order.created_at
      }
    });
    
  } catch (error) {
    console.error('Order status check error:', error);
    res.status(500).json({ error: 'Failed to get order status' });
  }
});

module.exports = router;
