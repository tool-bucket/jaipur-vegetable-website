require("dotenv").config();

const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const path = require("path");

const Order = require("./models/Order");
const Product = require("./models/Product");
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

const DEFAULT_MALA_PRODUCTS = [
  { productId: "gulab-red-mala", name: "Gulab Mala – Red", description: "Fresh red rose malas for weddings, functions and event decoration.", category: "Gulab Mala", unit: "mala", price: 15, minQuantity: 20, image: "/assets/Gulab Red Bulk Mala.svg" },
  { productId: "gulab-yellow-mala", name: "Gulab Mala – Yellow", description: "Fresh yellow rose malas for weddings, functions and special events.", category: "Gulab Mala", unit: "mala", price: 15, minQuantity: 20, image: "/assets/Gulab Yellow Bulk Mala.svg" },
  { productId: "hazara-mala", name: "Hazara Ki Mala", description: "Fresh Hazara flower malas for bulk function and event orders.", category: "Hazara Mala", unit: "mala", price: 10, minQuantity: 50, image: "/assets/Hazara Mala.svg" },
  { productId: "rukhadi-mala", name: "Rukhadi", description: "Fresh Rukhadi malas for bulk function, event and decoration requirements.", category: "Rukhadi", unit: "mala", price: 20, minQuantity: 50, image: "/assets/Rukhadi Mala.svg" }
];

const DEFAULT_VEGETABLE_PRODUCTS = [
  { productId: 'fresh-tomato', name: 'Fresh Tomato', category: 'Daily Use', unit: "kg", price: 40, minQuantity: 250, image: '/assets/Fresh Tomato online in Jaipur.jpg' },
  { productId: 'fresh-onion', name: 'Fresh Onion', category: 'Daily Use', unit: "kg", price: 32, minQuantity: 250, image: '/assets/Fresh Onion online in Jaipur.jpg' },
  { productId: 'fresh-cucumber', name: 'Fresh Cucumber', category: 'Daily Use', unit: "kg", price: 45, minQuantity: 250, image: '/assets/Fresh Cucumber online in Jaipur.jpg' },
  { productId: 'fresh-garlic', name: 'Fresh Garlic', category: 'Daily Use', unit: "kg", price: 120, minQuantity: 250, image: '/assets/Fresh Garlic online in Jaipur.jpg' },
  { productId: 'fresh-green-chili', name: 'Fresh Green Chili', category: 'Daily Use', unit: "kg", price: 80, minQuantity: 250, image: '/assets/Fresh Green Chili online in Jaipur.jpg' },
  { productId: 'fresh-green-capsicum', name: 'Fresh Green Capsicum', category: 'Daily Use', unit: "kg", price: 70, minQuantity: 250, image: '/assets/Fresh Green Capsicum online in Jaipur.jpg' },
  { productId: 'fresh-ginger', name: 'Fresh Ginger', category: 'Daily Use', unit: "kg", price: 140, minQuantity: 250, image: '/assets/Fresh Ginger online in Jaipur.jpg' },
  { productId: 'fresh-okra', name: 'Fresh Okra', category: 'Daily Use', unit: "kg", price: 55, minQuantity: 250, image: '/assets/Fresh Okra online in Jaipur.jpg' },
  { productId: 'fresh-coriander', name: 'Fresh Coriander', category: 'Daily Use', unit: "kg", price: 25, minQuantity: 250, image: '/assets/Fresh Coriander online in Jaipur.jpg' },
  { productId: 'fresh-mint', name: 'Fresh Mint', category: 'Daily Use', unit: "kg", price: 20, minQuantity: 250, image: '/assets/Fresh Mint online in Jaipur.jpg' },
  { productId: 'fresh-spring-onion', name: 'Fresh Spring Onion', category: 'Daily Use', unit: "kg", price: 35, minQuantity: 250, image: '/assets/Fresh Spring Onion online in Jaipur.jpg' },
  { productId: 'fresh-celery', name: 'Fresh Celery', category: 'Daily Use', unit: "kg", price: 90, minQuantity: 250, image: '/assets/Fresh Celery online in Jaipur.jpg' },
  { productId: 'fresh-lemon', name: 'Fresh Lemon', category: 'Daily Use', unit: "kg", price: 90, minQuantity: 250, image: '/assets/Fresh Lemon online in Jaipur.jpg' },
  { productId: 'fresh-desi-cucumber', name: 'Fresh desi cucumber', category: 'Daily Use', unit: "kg", price: 90, minQuantity: 250, image: '/assets/Fresh desi cucumber online in Jaipur.jpg' },
  { productId: 'fresh-potato', name: 'Fresh Potato', category: 'Root Vegetables', unit: "kg", price: 35, minQuantity: 250, image: '/assets/Fresh Potato online in Jaipur.jpg' },
  { productId: 'fresh-carrot', name: 'Fresh Carrot', category: 'Root Vegetables', unit: "kg", price: 50, minQuantity: 250, image: '/assets/Fresh Carrot online in Jaipur.jpg' },
  { productId: 'fresh-beetroot', name: 'Fresh Beetroot', category: 'Root Vegetables', unit: "kg", price: 60, minQuantity: 250, image: '/assets/Fresh Beetroot online in Jaipur.jpg' },
  { productId: 'fresh-radish', name: 'Fresh Radish', category: 'Root Vegetables', unit: "kg", price: 35, minQuantity: 250, image: '/assets/Fresh Radish online in Jaipur.jpg' },
  { productId: 'fresh-sweet-potato', name: 'Fresh Sweet Potato', category: 'Root Vegetables', unit: "kg", price: 55, minQuantity: 250, image: '/assets/Fresh Sweet Potato online in Jaipur.jpg' },
  { productId: 'fresh-spinach', name: 'Fresh Spinach', category: 'Leafy Vegetables', unit: "kg", price: 30, minQuantity: 250, image: '/assets/Fresh Spinach online in Jaipur.jpg' },
  { productId: 'fresh-cabbage', name: 'Fresh Cabbage', category: 'Leafy Vegetables', unit: "kg", price: 40, minQuantity: 250, image: '/assets/Fresh Cabbage online in Jaipur.jpg' },
  { productId: 'fresh-kale', name: 'Fresh Kale', category: 'Leafy Vegetables', unit: "kg", price: 90, minQuantity: 250, image: '/assets/Fresh Kale online in Jaipur.jpg' },
  { productId: 'fresh-bok-choy', name: 'Fresh Bok Choy', category: 'Leafy Vegetables', unit: "kg", price: 75, minQuantity: 250, image: '/assets/Fresh Bok Choy online in Jaipur.jpg' },
  { productId: 'fresh-parsley', name: 'Fresh Parsley', category: 'Leafy Vegetables', unit: "kg", price: 45, minQuantity: 250, image: '/assets/Fresh Parsley online in Jaipur.jpg' },
  { productId: 'fresh-mint-leaves', name: 'Fresh Mint Leaves', category: 'Leafy Vegetables', unit: "kg", price: 20, minQuantity: 250, image: '/assets/Fresh Mint online in Jaipur.jpg' },
  { productId: 'fresh-coriander-leaves', name: 'Fresh Coriander Leaves', category: 'Leafy Vegetables', unit: "kg", price: 25, minQuantity: 250, image: '/assets/Fresh Coriander online in Jaipur.jpg' },
  { productId: 'fresh-leek', name: 'Fresh Leek', category: 'Leafy Vegetables', unit: "kg", price: 80, minQuantity: 250, image: '/assets/Fresh Leek online in Jaipur.jpg' },
  { productId: 'fresh-methi-leaves', name: 'Fresh Methi Leaves', category: 'Leafy Vegetables', unit: "kg", price: 35, minQuantity: 250, image: '/assets/Fresh Methi Leaves online in Jaipur.jpg' },
  { productId: 'fresh-green-peas', name: 'Fresh Green Peas', category: 'Seasonal Vegetables', unit: "kg", price: 70, minQuantity: 250, image: '/assets/Fresh Green Peas online in Jaipur.jpg' },
  { productId: 'fresh-green-beans', name: 'Fresh Green Beans', category: 'Seasonal Vegetables', unit: "kg", price: 65, minQuantity: 250, image: '/assets/Fresh Green Beans online in Jaipur.jpg' },
  { productId: 'fresh-cauliflower', name: 'Fresh Cauliflower', category: 'Seasonal Vegetables', unit: "kg", price: 55, minQuantity: 250, image: '/assets/Fresh Cauliflower online in Jaipur.jpg' },
  { productId: 'fresh-sweet-corn', name: 'Fresh Sweet Corn', category: 'Seasonal Vegetables', unit: "kg", price: 45, minQuantity: 250, image: '/assets/Fresh Sweet Corn online in Jaipur.jpg' },
  { productId: 'fresh-pumpkin', name: 'Fresh Pumpkin', category: 'Seasonal Vegetables', unit: "kg", price: 45, minQuantity: 250, image: '/assets/Fresh Pumpkin online in Jaipur.jpg' },
  { productId: 'fresh-bitter-gourd', name: 'Fresh Bitter Gourd', category: 'Seasonal Vegetables', unit: "kg", price: 60, minQuantity: 250, image: '/assets/Fresh Bitter Gourd online in Jaipur.jpg' },
  { productId: 'fresh-broccoli', name: 'Fresh Broccoli', category: 'Exotic Vegetables', unit: "kg", price: 80, minQuantity: 250, image: '/assets/Fresh Broccoli online in Jaipur.jpg' },
  { productId: 'fresh-eggplant', name: 'Fresh Eggplant', category: 'Exotic Vegetables', unit: "kg", price: 70, minQuantity: 250, image: '/assets/Fresh Eggplant online in Jaipur.jpg' },
  { productId: 'fresh-red-capsicum', name: 'Fresh Red Capsicum', category: 'Exotic Vegetables', unit: "kg", price: 110, minQuantity: 250, image: '/assets/Fresh Red Capsicum online in Jaipur.jpg' },
  { productId: 'fresh-yellow-capsicum', name: 'Fresh Yellow Capsicum', category: 'Exotic Vegetables', unit: "kg", price: 110, minQuantity: 250, image: '/assets/Fresh Yellow Capsicum online in Jaipur.jpg' },
  { productId: 'fresh-mushroom', name: 'Fresh Mushroom', category: 'Exotic Vegetables', unit: "kg", price: 140, minQuantity: 250, image: '/assets/Fresh Mushroom online in Jaipur.jpg' },
  { productId: 'fresh-purple-kale', name: 'Fresh Purple Kale', category: 'Exotic Vegetables', unit: "kg", price: 90, minQuantity: 250, image: '/assets/Fresh Kale online in Jaipur.jpg' },
  { productId: 'fresh-asparagus', name: 'Fresh Asparagus', category: 'Exotic Vegetables', unit: "kg", price: 120, minQuantity: 250, image: '/assets/Fresh Asparagus online in Jaipur.jpg' },
  { productId: 'fresh-premium-parsley', name: 'Fresh Premium Parsley', category: 'Exotic Vegetables', unit: "kg", price: 45, minQuantity: 250, image: '/assets/Fresh Parsley online in Jaipur.jpg' },
  { productId: 'fresh-premium-zucchini', name: 'Fresh Premium Zucchini', category: 'Exotic Vegetables', unit: "kg", price: 80, minQuantity: 250, image: '/assets/Fresh Premium Zucchini online in Jaipur.jpg' }
];

async function seedProducts() {
  for (const product of [...DEFAULT_MALA_PRODUCTS, ...DEFAULT_VEGETABLE_PRODUCTS]) {
    await Product.updateOne(
      { productId: product.productId },
      { $setOnInsert: product },
      { upsert: true }
    );
  }
}

app.get("/api/products", async (req, res) => {
  try {
    const products = await Product.find({ active: true })
      .select("productId name category description unit price minQuantity image active")
      .sort({ unit: 1, category: 1, name: 1 })
      .lean();
    res.json(products);
  } catch {
    res.status(500).json({ message: "Could not load products." });
  }
});

app.get("/api/admin/products", requireAdmin, async (req, res) => {
  try {
    const products = await Product.find()
      .select("productId name category description unit price minQuantity image active")
      .sort({ active: -1, unit: 1, category: 1, name: 1 })
      .lean();
    res.json(products);
  } catch {
    res.status(500).json({ message: "Could not load product manager." });
  }
});

app.get("/api/products/vegetables", async (req, res) => {
  try {
    const products = await Product.find({ unit: "kg", active: true })
      .select("productId name category description unit price minQuantity image active")
      .sort({ category: 1, name: 1 })
      .lean();
    res.json(products);
  } catch {
    res.status(500).json({ message: "Could not load vegetable prices." });
  }
});

app.get("/api/products/malas", async (req, res) => {
  try {
    const products = await Product.find({ unit: "mala", active: true })
      .select("productId name category description unit price minQuantity image active")
      .sort({ createdAt: 1 })
      .lean();
    res.json(products);
  } catch {
    res.status(500).json({ message: "Could not load mala prices." });
  }
});

function slugifyProductId(value) {
  return String(value || "")
    .toLowerCase()
    .trim()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "")
    .slice(0, 70) || `product-${Date.now()}`;
}

function cleanProductPayload(body = {}) {
  const name = String(body.name || "").trim().slice(0, 120);
  const category = String(body.category || (body.unit === "mala" ? "Mala" : "Daily Use")).trim().slice(0, 80);
  const description = String(body.description || "Fresh, carefully selected produce for your needs.").trim().slice(0, 300);
  const unit = body.unit === "mala" ? "mala" : "kg";
  const price = Number(body.price);
  const minQuantity = Number(body.minQuantity);
  const image = String(body.image || "").trim().slice(0, 1000);

  if (!name) throw new Error("Product name is required.");
  if (!Number.isFinite(price) || price < 0 || price > 100000) throw new Error("Enter a valid price.");
  if (!Number.isInteger(minQuantity) || minQuantity < 1 || minQuantity > 50000) throw new Error("Enter a valid minimum quantity.");
  if (unit === "kg" && minQuantity % 250 !== 0) throw new Error("Vegetable minimum quantity must be in 250 g steps.");

  return { name, category, description, unit, price, minQuantity, image };
}

app.post("/api/admin/products", requireAdmin, async (req, res) => {
  try {
    const payload = cleanProductPayload(req.body);
    let productId = slugifyProductId(req.body.productId || payload.name);
    const existing = await Product.findOne({ productId }).lean();
    if (existing) {
      return res.status(409).json({ message: "A product with this name/ID already exists. Use Edit instead." });
    }

    const product = await Product.create({ ...payload, productId, active: true });
    res.status(201).json(product);
  } catch (error) {
    const message = error?.message || "Could not add product.";
    res.status(400).json({ message });
  }
});

app.patch("/api/admin/products/:productId", requireAdmin, async (req, res) => {
  try {
    const existing = await Product.findOne({ productId: req.params.productId });
    if (!existing) return res.status(404).json({ message: "Product not found." });

    const payload = cleanProductPayload({
      name: req.body.name ?? existing.name,
      category: req.body.category ?? existing.category,
      description: req.body.description ?? existing.description,
      unit: req.body.unit ?? existing.unit,
      price: req.body.price ?? existing.price,
      minQuantity: req.body.minQuantity ?? existing.minQuantity,
      image: req.body.image ?? existing.image
    });

    existing.set(payload);
    if (typeof req.body.active === "boolean") existing.active = req.body.active;
    await existing.save();
    res.json(existing.toObject());
  } catch (error) {
    res.status(400).json({ message: error?.message || "Could not update product." });
  }
});

app.patch("/api/admin/products/:productId/active", requireAdmin, async (req, res) => {
  if (typeof req.body?.active !== "boolean") {
    return res.status(400).json({ message: "Active must be true or false." });
  }
  try {
    const product = await Product.findOneAndUpdate(
      { productId: req.params.productId },
      { $set: { active: req.body.active } },
      { new: true }
    ).lean();
    if (!product) return res.status(404).json({ message: "Product not found." });
    res.json(product);
  } catch {
    res.status(500).json({ message: "Could not change product status." });
  }
});

app.delete("/api/admin/products/:productId", requireAdmin, async (req, res) => {
  try {
    const product = await Product.findOne({ productId: req.params.productId }).lean();
    if (!product) return res.status(404).json({ message: "Product not found." });

    const usedInOrders = await Order.exists({ "items.productId": product.productId });
    if (usedInOrders) {
      return res.status(409).json({ message: "This product is already present in an order. Deactivate it instead of permanently deleting it." });
    }

    await Product.deleteOne({ productId: product.productId });
    res.json({ message: "Product deleted successfully.", productId: product.productId });
  } catch {
    res.status(500).json({ message: "Could not delete product." });
  }
});

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
      unit: item.unit === "mala" ? "mala" : "kg",
      grams: Number(item.grams || 0),
      quantity: Number(item.quantity || 0),
      minQuantity: Number(item.minQuantity || 1),
      price: Number(item.price || 0),
      image: String(item.image || "").slice(0, 500),
      note: String(item.note || "").trim().slice(0, 300)
    }));

    if (cleanItems.some(item => {
      if (!item.productId || !item.name || !Number.isInteger(item.quantity) ||
          item.quantity < 1 || item.quantity > 50000 ||
          !Number.isFinite(item.price) || item.price < 0) return true;

      if (item.unit === "mala") {
        return item.grams !== 0 ||
          !Number.isInteger(item.minQuantity) ||
          item.minQuantity < 1 ||
          item.quantity < item.minQuantity;
      }

      return !Number.isFinite(item.grams) ||
        item.grams < 250 ||
        item.grams > 100000 ||
        item.grams % 250 !== 0;
    })) {
      return res.status(400).json({ message: "Invalid product or quantity data." });
    }

    const productIds = [...new Set(cleanItems.map(item => item.productId))];
    const products = await Product.find({ productId: { $in: productIds }, active: true }).lean();
    const byId = new Map(products.map(p => [p.productId, p]));

    for (const item of cleanItems) {
      const product = byId.get(item.productId);
      if (!product || product.unit !== item.unit) {
        return res.status(400).json({ message: "A product is no longer available. Please refresh the shop and try again." });
      }

      if (item.unit === "mala") {
        if (item.quantity < product.minQuantity || Math.abs(item.price - product.price) > 0.001) {
          return res.status(400).json({ message: "Mala price or minimum quantity has changed. Please refresh the Mala page and add the product again." });
        }
        item.price = product.price;
        item.minQuantity = product.minQuantity;
      } else {
        const expectedPrice = Math.round(product.price * (item.grams / 1000) * 100) / 100;
        if (item.grams < product.minQuantity || Math.abs(item.price - expectedPrice) > 0.01) {
          return res.status(400).json({ message: "A vegetable price or quantity has changed. Please refresh the Vegetables page and add the product again." });
        }
        item.price = expectedPrice;
        item.minQuantity = product.minQuantity;
      }
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
      functionDetails: {
        type: String(body.functionDetails?.type || "").trim().slice(0, 100),
        date: String(body.functionDetails?.date || "").trim().slice(0, 30),
        requirements: String(body.functionDetails?.requirements || "").trim().slice(0, 500)
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
    await seedProducts();
    console.log("MongoDB connected and products ready.");
    app.listen(PORT, () => console.log(`FreshJaipur API running on port ${PORT}`));
  } catch (error) {
    console.error("MongoDB connection failed:", error.message);
    process.exit(1);
  }
}

start();
