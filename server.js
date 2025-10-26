const express = require('express');
const cors = require('cors');
const { MongoClient, ObjectId } = require('mongodb');
require('dotenv').config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.static(__dirname));

// MongoDB Connection
const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/homego';
let db;

MongoClient.connect(MONGODB_URI, { useUnifiedTopology: true })
  .then(client => {
    console.log('Connected to MongoDB');
    db = client.db();
    
    // Create collections if they don't exist
    createCollections();
  })
  .catch(error => console.error('MongoDB connection error:', error));

async function createCollections() {
  const collections = ['users', 'sellers', 'products', 'orders', 'transactions', 'promotions', 'supportTickets', 'content'];
  for (const collection of collections) {
    try {
      await db.createCollection(collection);
    } catch (err) {
      // Collection might already exist
    }
  }
}

// ========== AUTHENTICATION ROUTES ==========

// Register new user
app.post('/api/auth/register', async (req, res) => {
  try {
    const { email, password, name, userType } = req.body;
    
    // Check if user already exists
    const existingUser = await db.collection('users').findOne({ email });
    if (existingUser) {
      return res.status(400).json({ error: 'User already exists' });
    }
    
    // In production, hash the password!
    const result = await db.collection('users').insertOne({
      email,
      password, // In production: await bcrypt.hash(password, 10)
      name,
      userType: userType || 'customer',
      createdAt: new Date(),
      status: 'active'
    });
    
    res.status(201).json({
      success: true,
      userId: result.insertedId,
      email,
      name,
      userType: userType || 'customer'
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Login
app.post('/api/auth/login', async (req, res) => {
  try {
    const { email, password, userType } = req.body;
    
    // Find user
    const user = await db.collection('users').findOne({ email });
    
    if (!user) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check password (in production, use bcrypt.compare)
    if (user.password !== password) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }
    
    // Check if userType matches
    if (userType && user.userType !== userType) {
      return res.status(401).json({ error: 'Invalid user type' });
    }
    
    // Return user data (in production, return JWT token)
    res.json({
      success: true,
      userId: user._id,
      email: user.email,
      name: user.name,
      userType: user.userType,
      token: 'dummy-token-' + user._id // In production, generate JWT
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get current user
app.get('/api/auth/user', async (req, res) => {
  try {
    // In production, verify JWT from Authorization header
    const userId = req.query.userId;
    
    if (!userId) {
      return res.status(401).json({ error: 'Not authenticated' });
    }
    
    const user = await db.collection('users').findOne({ _id: new ObjectId(userId) });
    
    if (!user) {
      return res.status(404).json({ error: 'User not found' });
    }
    
    // Don't send password
    const { password, ...userData } = user;
    res.json(userData);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== SELLER ROUTES ==========

// Get all sellers
app.get('/api/sellers', async (req, res) => {
  try {
    const sellers = await db.collection('sellers').find().toArray();
    res.json(sellers);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get seller by ID
app.get('/api/sellers/:id', async (req, res) => {
  try {
    const seller = await db.collection('sellers').findOne({ _id: new ObjectId(req.params.id) });
    if (!seller) return res.status(404).json({ error: 'Seller not found' });
    res.json(seller);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create seller
app.post('/api/sellers', async (req, res) => {
  try {
    const result = await db.collection('sellers').insertOne({
      ...req.body,
      createdAt: new Date(),
      status: 'active'
    });
    res.status(201).json({ id: result.insertedId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update seller status
app.patch('/api/sellers/:id/status', async (req, res) => {
  try {
    const result = await db.collection('sellers').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status: req.body.status, updatedAt: new Date() } }
    );
    res.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== PRODUCT ROUTES ==========

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    const { sellerId, category } = req.query;
    const filter = {};
    if (sellerId) filter.sellerId = sellerId;
    if (category) filter.category = category;
    
    const products = await db.collection('products').find(filter).toArray();
    res.json(products);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await db.collection('products').findOne({ _id: new ObjectId(req.params.id) });
    if (!product) return res.status(404).json({ error: 'Product not found' });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create product
app.post('/api/products', async (req, res) => {
  try {
    const result = await db.collection('products').insertOne({
      ...req.body,
      createdAt: new Date(),
      status: 'active'
    });
    res.status(201).json({ id: result.insertedId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update product
app.put('/api/products/:id', async (req, res) => {
  try {
    const result = await db.collection('products').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { ...req.body, updatedAt: new Date() } }
    );
    res.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const result = await db.collection('products').deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== ORDER ROUTES ==========

// Get all orders
app.get('/api/orders', async (req, res) => {
  try {
    const { sellerId, customerId } = req.query;
    const filter = {};
    if (sellerId) filter.sellerId = sellerId;
    if (customerId) filter.customerId = customerId;
    
    const orders = await db.collection('orders').find(filter).sort({ createdAt: -1 }).toArray();
    res.json(orders);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create order
app.post('/api/orders', async (req, res) => {
  try {
    const result = await db.collection('orders').insertOne({
      ...req.body,
      createdAt: new Date(),
      status: 'pending'
    });
    res.status(201).json({ id: result.insertedId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update order status
app.patch('/api/orders/:id/status', async (req, res) => {
  try {
    const result = await db.collection('orders').updateOne(
      { _id: new ObjectId(req.params.id) },
      { $set: { status: req.body.status, updatedAt: new Date() } }
    );
    res.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== TRANSACTION ROUTES ==========

// Get all transactions
app.get('/api/transactions', async (req, res) => {
  try {
    const transactions = await db.collection('transactions').find().sort({ createdAt: -1 }).toArray();
    res.json(transactions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create transaction
app.post('/api/transactions', async (req, res) => {
  try {
    const result = await db.collection('transactions').insertOne({
      ...req.body,
      createdAt: new Date()
    });
    res.status(201).json({ id: result.insertedId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== PROMOTION ROUTES ==========

// Get all promotions
app.get('/api/promotions', async (req, res) => {
  try {
    const promotions = await db.collection('promotions').find().toArray();
    res.json(promotions);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create promotion
app.post('/api/promotions', async (req, res) => {
  try {
    const result = await db.collection('promotions').insertOne({
      ...req.body,
      createdAt: new Date()
    });
    res.status(201).json({ id: result.insertedId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Delete promotion
app.delete('/api/promotions/:id', async (req, res) => {
  try {
    const result = await db.collection('promotions').deleteOne({ _id: new ObjectId(req.params.id) });
    res.json({ success: true, deletedCount: result.deletedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== SUPPORT TICKET ROUTES ==========

// Get all support tickets
app.get('/api/support-tickets', async (req, res) => {
  try {
    const { userEmail, userType, status } = req.query;
    const filter = {};
    if (userEmail) filter.userEmail = userEmail;
    if (userType) filter.userType = userType;
    if (status) filter.status = status;
    
    const tickets = await db.collection('supportTickets').find(filter).sort({ createdAt: -1 }).toArray();
    res.json(tickets);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get ticket by ID
app.get('/api/support-tickets/:id', async (req, res) => {
  try {
    const ticket = await db.collection('supportTickets').findOne({ ticketId: req.params.id });
    if (!ticket) return res.status(404).json({ error: 'Ticket not found' });
    res.json(ticket);
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Create support ticket
app.post('/api/support-tickets', async (req, res) => {
  try {
    const ticketId = 'TKT-' + Date.now() + Math.random().toString(36).substr(2, 5).toUpperCase();
    const result = await db.collection('supportTickets').insertOne({
      ticketId,
      ...req.body,
      status: 'open',
      responses: [],
      createdAt: new Date(),
      updatedAt: new Date()
    });
    res.status(201).json({ id: result.insertedId, ticketId, ...req.body });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update ticket status
app.patch('/api/support-tickets/:id/status', async (req, res) => {
  try {
    const result = await db.collection('supportTickets').updateOne(
      { ticketId: req.params.id },
      { $set: { status: req.body.status, updatedAt: new Date() } }
    );
    res.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Add response to ticket
app.post('/api/support-tickets/:id/responses', async (req, res) => {
  try {
    const result = await db.collection('supportTickets').updateOne(
      { ticketId: req.params.id },
      { 
        $push: { 
          responses: {
            ...req.body,
            timestamp: new Date()
          }
        },
        $set: { updatedAt: new Date() }
      }
    );
    res.json({ success: true, modifiedCount: result.modifiedCount });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== STATISTICS ROUTES ==========

// Get seller statistics
app.get('/api/stats/seller/:sellerId', async (req, res) => {
  try {
    const sellerId = req.params.sellerId;
    
    const [products, orders] = await Promise.all([
      db.collection('products').countDocuments({ sellerId }),
      db.collection('orders').find({ sellerId }).toArray()
    ]);
    
    const totalSales = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    
    res.json({
      totalProducts: products,
      totalOrders: orders.length,
      totalSales
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Get admin dashboard statistics
app.get('/api/stats/admin', async (req, res) => {
  try {
    const [sellers, products, orders, tickets] = await Promise.all([
      db.collection('sellers').countDocuments(),
      db.collection('products').countDocuments(),
      db.collection('orders').find().toArray(),
      db.collection('supportTickets').find().toArray()
    ]);
    
    const totalRevenue = orders.reduce((sum, order) => sum + (order.total || 0), 0);
    
    const ticketStats = {
      total: tickets.length,
      open: tickets.filter(t => t.status === 'open').length,
      inProgress: tickets.filter(t => t.status === 'in-progress').length,
      resolved: tickets.filter(t => t.status === 'resolved').length,
      closed: tickets.filter(t => t.status === 'closed').length
    };
    
    res.json({
      totalSellers: sellers,
      totalProducts: products,
      totalOrders: orders.length,
      totalRevenue,
      tickets: ticketStats
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// ========== CONTENT MANAGEMENT ROUTES ==========

// Get content
app.get('/api/content/:key', async (req, res) => {
  try {
    const content = await db.collection('content').findOne({ key: req.params.key });
    res.json(content || {});
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Update content
app.put('/api/content/:key', async (req, res) => {
  try {
    const result = await db.collection('content').updateOne(
      { key: req.params.key },
      { $set: { ...req.body, updatedAt: new Date() } },
      { upsert: true }
    );
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
});

// Start server
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
