const express = require('express');
const router = express.Router();
const Product = require('../models/Product');
const validateProduct = require('../middleware/validateProduct');
const auth = require('../middleware/auth');

router.get('/', auth, async (req, res, next) => {
  try {
    let { category, page = 1, limit = 5, search } = req.query;
    let query = {};

    if (category) query.category = new RegExp(category, 'i');
    if (search) query.name = new RegExp(search, 'i');

    const total = await Product.countDocuments(query);
    const products = await Product.find(query)
      .skip((page - 1) * limit)
      .limit(parseInt(limit));

    res.json({ total, page: parseInt(page), limit: parseInt(limit), data: products });
  } catch (error) {
    next(error);
  }
});

router.get('/:id', auth, async (req, res, next) => {
  try {
    const product = await Product.findById(req.params.id);
    if (!product) return res.status(404).json({ message: 'Product not found' });
    res.json(product);
  } catch (error) {
    next(error);
  }
});

router.post('/', auth, validateProduct, async (req, res, next) => {
  try {
    const newProduct = await Product.create(req.body);
    res.status(201).json(newProduct);
  } catch (error) {
    next(error);
  }
});

router.put('/:id', auth, validateProduct, async (req, res, next) => {
  try {
    const updatedProduct = await Product.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!updatedProduct) return res.status(404).json({ message: 'Product not found' });
    res.json(updatedProduct);
  } catch (error) {
    next(error);
  }
});

router.delete('/:id', auth, async (req, res, next) => {
  try {
    const deleted = await Product.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ message: 'Product not found' });
    res.json({ message: 'Product deleted successfully' });
  } catch (error) {
    next(error);
  }
});

module.exports = router;
