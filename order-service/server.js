const express = require("express");
const mongoose = require("mongoose");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// MongoDB Connection
const MONGO_URI = process.env.MONGO_URI || "mongodb://localhost:27017/orderdb";
mongoose.connect(MONGO_URI)
    .then(() => console.log("✅ Order Service connected to MongoDB"))
    .catch((err) => console.error("❌ MongoDB error:", err.message));

// Order Schema
const orderSchema = new mongoose.Schema({
    userId: { type: String, required: true },
    productId: { type: String, required: true },
    quantity: { type: Number, required: true, default: 1 },
    totalPrice: { type: Number },
    status: { type: String, enum: ["pending", "confirmed", "shipped", "delivered"], default: "pending" },
    createdAt: { type: Date, default: Date.now },
});
const Order = mongoose.model("Order", orderSchema);

// Routes
app.get("/", (req, res) => {
    res.json({ message: "Order Service is Running 🚀", port: 5003 });
});

app.get("/orders", async (req, res) => {
    try {
        const orders = await Order.find();
        res.json({ success: true, data: orders });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

app.post("/orders", async (req, res) => {
    try {
        const { userId, productId, quantity } = req.body;

        // Call product service to verify & get price
        let totalPrice = 0;
        try {
            const USER_SERVICE_URL = process.env.USER_SERVICE_URL || "http://localhost:5001";
            const PRODUCT_SERVICE_URL = process.env.PRODUCT_SERVICE_URL || "http://localhost:5002";

            const productRes = await axios.get(`${PRODUCT_SERVICE_URL}/products`);
            const product = productRes.data.data.find(p => p._id === productId);
            if (product) {
                totalPrice = product.price * quantity;
            }
        } catch (e) {
            console.warn("⚠️  Could not reach product service:", e.message);
        }

        const order = new Order({ userId, productId, quantity, totalPrice });
        await order.save();
        res.status(201).json({ success: true, data: order });
    } catch (err) {
        res.status(400).json({ success: false, error: err.message });
    }
});

app.patch("/orders/:id/status", async (req, res) => {
    try {
        const { status } = req.body;
        const order = await Order.findByIdAndUpdate(req.params.id, { status }, { new: true });
        res.json({ success: true, data: order });
    } catch (err) {
        res.status(500).json({ success: false, error: err.message });
    }
});

const PORT = process.env.PORT || 5003;
app.listen(PORT, () => console.log(`🛒 Order Service running on port ${PORT}`));
