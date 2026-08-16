const mongoose = require("mongoose");

const productSchema = new mongoose.Schema({
  productId: { type: String, required: true, unique: true, index: true },
  name: { type: String, required: true, trim: true },
  category: { type: String, default: "Mala", trim: true },
  unit: { type: String, enum: ["mala", "kg"], default: "mala" },
  price: { type: Number, required: true, min: 0 },
  minQuantity: { type: Number, required: true, min: 1 },
  image: { type: String, default: "" },
  active: { type: Boolean, default: true }
}, { timestamps: true });

module.exports = mongoose.model("Product", productSchema);
