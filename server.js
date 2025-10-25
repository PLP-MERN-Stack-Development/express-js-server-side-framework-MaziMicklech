// server.js - Complete Express API (MongoDB Connected)

// ==========================
// 🔹 Import required modules
// ==========================
const express = require('express');
const bodyParser = require('body-parser');
const mongoose = require('mongoose');
require('dotenv').config(); // loads .env variables

// Import Product model
const Product = require('./models/Product');

// ==========================
// 🔹 Initialize Express app
// ==========================
const app = express();
const PORT = process.env.PORT || 4000;

// ==========================
// 🔹 Connect to MongoDB Atlas
// ==========================
mongoose.connect(process.env.MONGO_URI, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
})
.then(() => console.log('✅ MongoDB Atlas connected successfully'))
.catch(err => console.error('❌ MongoDB connection error:', err.message));

// ==========================
// 🔹 Middleware setup
// ==========================
app.use(bodyParser.json());

// Logger Middleware
app.use((req, res, next) => {
  console.log(`[${new Date().toISOString()}] ${req.method} ${req.url}`);
  next();
});

// ✅ Removed API Key Middleware — open access for Postman

// ==========================
// 🔹 Routes
// ==========================

// Root route
app.get('/', (req, res) => {
  res.send('Welcome to the Product API! MongoDB connection is live.');
});

// GET all products
app.get('/api/products', async (req, res) => {
  try {
    const { category, search, page = 1, limit = 5 } = req.query;
    let query = {};

    if (category) query.category = category;
    if (search) query.name = { $regex: search, $options: 'i' };

    const products = await Product.find(query)
      .skip((page - 1) * limit)
      .limit(Number(limit));

    const total = await Product.countDocuments(query);

    res.json({
      total,
      page: Number(page),
      limit: Number(limit),
      data: products
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// GET one product by ID
app.get('/api/products/:id', async (req, res) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// CREATE a product
app.post('/api/products', async (req, res) => {
  try {
    const { name, description, price, category, inStock } = req.body;
    const product = new Product({ name, description, price, category, inStock });
    const saved = await product.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// UPDATE a product
app.put('/api/products/:id', async (req, res) => {
  try {
    const updated = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updated) return res.status(404).json({ message: 'Product not found' });
    res.json(updated);
  } catch (err) {
    res.status(400).json({ message: err.message });
  }
});

// DELETE a product
app.delete('/api/products/:id', async (req, res) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

// ==========================
// 🔹 Global Error Handler
// ==========================
app.use((err, req, res, next) => {
  console.error('Error:', err.stack);
  res.status(500).json({ message: 'Something went wrong!', error: err.message });
});

// ==========================
// 🔹 Start the server
// ==========================
app.listen(PORT, () => {
  console.log(`✅ Server is running on http://localhost:${PORT}`);
});

module.exports = app;

