// models/Product.js
const mongoose = require('mongoose');

// Define Product schema
const productSchema = new mongoose.Schema({
  name: { type: String, required: true },
  description: { type: String, required: true },
  price: { type: Number, required: true },
  category: { type: String, required: true },
  inStock: { type: Boolean, required: true }
}, { timestamps: true });

// Export model
module.exports = mongoose.model('Product', productSchema);

