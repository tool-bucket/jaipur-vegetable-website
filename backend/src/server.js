require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const Order = require("./models/Order");
const { createToken, requireAdmin } = require("./auth");

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors({
  origin: process.env.FRONTEND_URL
    ? process.env.FRONTEND_URL.split(",").map(v => v.trim())
    : true
}));
app.use(express.json({ limit: "1mb" }));

app.get("/api/health", (req, res) => {
  res.json({ ok: true, service: "FreshJaipur API" });
});

app.post("/api/admin/login", (req, res) => {
  const { email, password } = req.body || {};

  if (email !== process.env.ADMIN_EMAIL || password !== process.env.ADMIN_PASSWORD) {
    return res.status(401).json({ message: "Invalid email or password." });
  }

  res.json({ token: createToken() });
});

function makeOrderId() {
  const stamp = Date.now().toString().slice(-8);
  const random = Math.floor(100 + Math.random() * 900);
  return `FJ-${stamp}-${random}`;
}

app.post("/api/orders", async (req, res) => {
  try {
    const body = req.body || {};
    const { customer, location, items } = body;

    if (!customer?.name || !customer?.phone || !customer?.address ||
        !customer?.pincode || !customer?.city) {
      return res.status(400).json({ message: "Please provide all required customer details." });
    }

    if (!Array.isArray(items) || items.length === 0) {
      return res.status(400).json({ message: "Cart is empty." });
    }

    const cleanItems = items.map(item => ({
      productId: String(item.productId || item.id || ""),
      name: String(item.name || "").slice(0, 120),
      grams: Number(item.grams || 0),
      quantity: Number(item.quantity || 0),
      price: Number(item.price || 0),
      image: String(item.image || "").slice(0, 500),
      note: String(item.note || "").trim().slice(0, 300)
    }));

    if (cleanItems.some(item =>
      !item.productId ||
      !item.name ||
      !Number.isFinite(item.grams) ||
      item.grams < 250 ||
      item.grams > 100000 ||
      item.grams % 250 !== 0 ||
      !Number.isInteger(item.quantity) ||
      item.quantity < 1 ||
      item.quantity > 1000 ||
      !Number.isFinite(item.price) ||
      item.price < 0
    )) {
      return res.status(400).json({ message: "Invalid product or quantity data." });
    }

    const subtotal = Math.round(
      cleanItems.reduce((sum, item) => sum + item.price * item.quantity, 0) * 100
    ) / 100;

    if (subtotal < 200) {
      return res.status(400).json({ message: "Minimum order value is ₹200." });
    }

    const order = await Order.create({
      orderId: makeOrderId(),
      customer: {
        name: String(customer.name).trim().slice(0, 100),
        phone: String(customer.phone).trim().slice(0, 20),
        address: String(customer.address).trim().slice(0, 500),
        landmark: String(customer.landmark || "").trim().slice(0, 150),
        pincode: String(customer.pincode).trim().slice(0, 10),
        city: String(customer.city).trim().slice(0, 80),
        notes: String(customer.notes || "").trim().slice(0, 300)
      },
      location: {
        latitude: location?.latitude ? Number(location.latitude) : null,
        longitude: location?.longitude ? Number(location.longitude) : null,
        googleMapsUrl: String(location?.googleMapsUrl || "").slice(0, 600)
      },
      items: cleanItems,
      subtotal,
      total: subtotal
    });

    res.status(201).json({
      message: "Order received successfully.",
      orderId: order.orderId
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({ message: "Could not save order. Please try again." });
  }
});

app.get("/api/admin/orders", requireAdmin, async (req, res) => {
  try {
    const orders = await Order.find().sort({ createdAt: -1 }).lean();
    res.json(orders);
  } catch {
    res.status(500).json({ message: "Could not load orders." });
  }
});

app.patch("/api/admin/orders/:orderId/status", requireAdmin, async (req, res) => {
  const allowed = ["new", "confirmed", "out-for-delivery", "delivered", "cancelled"];
  const { status } = req.body || {};

  if (!allowed.includes(status)) {
    return res.status(400).json({ message: "Invalid order status." });
  }

  try {
    const order = await Order.findOneAndUpdate(
      { orderId: req.params.orderId },
      { status },
      { new: true }
    ).lean();

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    res.json(order);
  } catch {
    res.status(500).json({ message: "Could not update order status." });
  }
});

/* Admin-only permanent order deletion. */
app.delete("/api/admin/orders/:orderId", requireAdmin, async (req, res) => {
  try {
    const order = await Order.findOneAndDelete({
      orderId: req.params.orderId
    }).lean();

    if (!order) {
      return res.status(404).json({ message: "Order not found." });
    }

    res.json({
      message: "Order deleted successfully.",
      orderId: order.orderId
    });
  } catch {
    res.status(500).json({ message: "Could not delete order." });
  }
});

app.use("/admin", express.static(path.join(__dirname, "../public/admin")));

async function start() {
  if (!process.env.MONGODB_URI) {
    console.error("MONGODB_URI is missing. Create backend/.env first.");
    process.exit(1);
  }

  try {
    await mongoose.connect(process.env.MONGODB_URI);
    console.log("MongoDB connected.");
    app.listen(PORT, () => console.log(`FreshJaipur API running on port ${PORT}`));
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

start();
