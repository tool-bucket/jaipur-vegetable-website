const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, trim: true, maxlength: 120 },
  category: { type: String, default: "Daily Use", trim: true, maxlength: 80 },
  description: { type: String, default: "Fresh, carefully selected produce for your needs.", trim: true, maxlength: 300 },
  unit: { type: String, enum: ["mala", "kg"], default: "kg" },
  price: { type: Number, required: true, min: 0 },
  minQuantity: { type: Number, required: true, min: 1 },
  image: { type: String, default: "" },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
