const mongoose = require("mongoose");

const orderItemSchema = new mongoose.Schema({
  productId: { type: String, required: true },
  name: { type: String, required: true, trim: true },
  unit: { type: String, enum: ["kg", "mala"], default: "kg" },
  grams: { type: Number, required: true, min: 0, max: 100000 },
  quantity: { type: Number, required: true, min: 1, max: 50000 },
  minQuantity: { type: Number, default: 1, min: 1, max: 50000 },
  price: { type: Number, required: true, min: 0 },
  image: { type: String, default: "" },
  note: { type: String, default: "", trim: true, maxlength: 300 }
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
    notes: { type: String, default: "", trim: true, maxlength: 300 }
  },
  functionDetails: {
    type: { type: String, default: "", trim: true, maxlength: 100 },
    date: { type: String, default: "", trim: true, maxlength: 30 },
    requirements: { type: String, default: "", trim: true, maxlength: 500 }
  },
  location: {
    latitude: { type: Number, default: null },
    longitude: { type: Number, default: null },
    googleMapsUrl: { type: String, default: "" }
  },
  items: { type: [orderItemSchema], required: true },
  subtotal: { type: Number, required: true, min: 0 },
  total: { type: Number, required: true, min: 0 },
  status: {
    type: String,
    enum: ["new", "confirmed", "out-for-delivery", "delivered", "cancelled"],
    default: "new",
    index: true
  }
}, { timestamps: true });

module.exports = mongoose.model("Order", orderSchema);
