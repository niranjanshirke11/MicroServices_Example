const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/productdb";
mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ Product Service connected to MongoDB"))
    .catch((err) => console.error("❌ MongoDB error:", err.message));

// Product Schema
const productSchema = new mongoose.Schema({
    name: { type: String, required: true },
    price: { type: Number, required: true },
    description: { type: String, default: "" },
    stock: { type: Number, default: 0 },
    createdAt: { type: Date, default: Date.now },
});
const Product = mongoose.model("Product", productSchema);

// Routes
app.get("/", (req, res) => {
    res.json({ message: "Product Service is Running 🚀", port: 5002 });
});

app.get("/products", async (req, res) => {
    try {
        const products = await Product.find();
        res.json({ success: true, data: products });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post("/products", async (req, res) => {
    try {
        const { name, price, description, stock } = req.body;
        const product = new Product({ name, price, description, stock });
        await product.save();
        res.status(201).json({ success: true, data: product });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

app.delete("/products/:id", async (req, res) => {
    try {
        await Product.findByIdAndDelete(req.params.id);
        res.json({ success: true, message: "Product deleted" });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

const PORT = process.env.PORT || 5002;
app.listen(PORT, () => console.log(`📦 Product Service running on port ${PORT}`));
