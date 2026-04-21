const express = require('express');
const router = express.Router();
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

// Hardcoded employee credentials
const EMPLOYEES = {
  'employee1': {
    password: 'password123',
    role: 'employee'
  },
  'admin1': {
    password: 'password123',
    role: 'admin'
  }
};

// Employee login
router.post('/login', async (req, res) => {
  try {
    const { username, password } = req.body;
    
    if (!username || !password) {
      return res.status(400).json({ error: 'Username and password are required' });
    }
    
    const employee = EMPLOYEES[username];
    
    if (!employee || employee.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Create JWT token
    const token = jwt.sign(
      { 
        username, 
        role: employee.role 
      },
      process.env.JWT_SECRET || 'arenawav-secret-key',
      { expiresIn: '24h' }
    );
    
    res.json({
      success: true,
      token,
      user: {
        username,
        role: employee.role
      }
    });
    
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Login failed' });
  }
});

// Verify token middleware
const verifyToken = (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ error: 'Access token required' });
  }
  
  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || 'arenawav-secret-key');
    req.user = decoded;
    next();
  } catch (error) {
    return res.status(401).json({ error: 'Invalid token' });
  }
};

// Protected route example
router.get('/verify', verifyToken, (req, res) => {
  res.json({
    success: true,
    user: req.user
  });
});

module.exports = router;
