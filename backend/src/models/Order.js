
const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true },
  grams: { type: Number, required: true },
  quantity: { type: Number, required: true, min: 1 },
  price: { type: Number, required: true, min: 0 },
  image: { type: String, default: "" }
}, { _id: false });

const orderSchema = new mongoose.Schema({
  orderId: { type: String, required: true, unique: true, index: true },
  customer: {
    name: { type: String, required: true, trim: true },
    phone: { type: String, required: true, trim: true },
    address: { type: String, required: true, trim: true },
    landmark: { type: String, default: "", trim: true },
    pincode: { type: String, required: true, trim: true },
    city: { type: String, required: true, trim: true },
    notes: { type: String, default: "", trim: true }
  },
  location: {
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    googleMapsUrl: { type: String, default: "" }
  },
  items: { type: [orderItemSchema], required: true },
  subtotal: { type: Number, required: true, min: 200 },
  total: { type: Number, required: true, min: 200 },
  status: {
    type: String,
    enum: ["new", "confirmed", "out-for-delivery", "delivered", "cancelled"],
    default: "new",
    index: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
