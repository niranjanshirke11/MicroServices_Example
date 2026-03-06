const express = require("express");
const axios = require("axios");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Service URLs
const USER_SERVICE = process.env.USER_SERVICE_URL || "http://localhost:5001";
const PRODUCT_SERVICE = process.env.PRODUCT_SERVICE_URL || "http://localhost:5002";
const ORDER_SERVICE = process.env.ORDER_SERVICE_URL || "http://localhost:5003";

// Health check
app.get("/", (req, res) => {
    res.json({
        message: "API Gateway is Running 🌐",
        port: 5000,
        services: {
            users: `${USER_SERVICE}`,
            products: `${PRODUCT_SERVICE}`,
            orders: `${ORDER_SERVICE}`,
        },
    });
});

// Gateway health status — checks if each service is alive
app.get("/health", async (req, res) => {
    const check = async (name, url) => {
        try {
            const r = await axios.get(url, { timeout: 3000 });
            return { name, status: "✅ UP", message: r.data.message };
        } catch {
            return { name, status: "❌ DOWN" };
        }
    };

    const results = await Promise.all([
        check("User Service", USER_SERVICE),
        check("Product Service", PRODUCT_SERVICE),
        check("Order Service", ORDER_SERVICE),
    ]);

    res.json({ gateway: "✅ UP", services: results });
});

// ── USER ROUTES ──────────────────────────────────────────
app.get("/users", async (req, res) => {
    try {
        const response = await axios.get(`${USER_SERVICE}/users`);
        res.json(response.data);
    } catch (err) {
        res.status(503).json({ success: false, error: "User Service unavailable", detail: err.message });
    }
});

app.post("/users", async (req, res) => {
    try {
        const response = await axios.post(`${USER_SERVICE}/users`, req.body);
        res.status(201).json(response.data);
    } catch (err) {
        res.status(503).json({ success: false, error: "User Service unavailable", detail: err.message });
    }
});

app.delete("/users/:id", async (req, res) => {
    try {
        const response = await axios.delete(`${USER_SERVICE}/users/${req.params.id}`);
        res.json(response.data);
    } catch (err) {
        res.status(503).json({ success: false, error: "User Service unavailable", detail: err.message });
    }
});

// ── PRODUCT ROUTES ───────────────────────────────────────
app.get("/products", async (req, res) => {
    try {
        const response = await axios.get(`${PRODUCT_SERVICE}/products`);
        res.json(response.data);
    } catch (err) {
        res.status(503).json({ success: false, error: "Product Service unavailable", detail: err.message });
    }
});

app.post("/products", async (req, res) => {
    try {
        const response = await axios.post(`${PRODUCT_SERVICE}/products`, req.body);
        res.status(201).json(response.data);
    } catch (err) {
        res.status(503).json({ success: false, error: "Product Service unavailable", detail: err.message });
    }
});

app.delete("/products/:id", async (req, res) => {
    try {
        const response = await axios.delete(`${PRODUCT_SERVICE}/products/${req.params.id}`);
        res.json(response.data);
    } catch (err) {
        res.status(503).json({ success: false, error: "Product Service unavailable", detail: err.message });
    }
});

// ── ORDER ROUTES ─────────────────────────────────────────
app.get("/orders", async (req, res) => {
    try {
        const response = await axios.get(`${ORDER_SERVICE}/orders`);
        res.json(response.data);
    } catch (err) {
        res.status(503).json({ success: false, error: "Order Service unavailable", detail: err.message });
    }
});

app.post("/orders", async (req, res) => {
    try {
        const response = await axios.post(`${ORDER_SERVICE}/orders`, req.body);
        res.status(201).json(response.data);
    } catch (err) {
        res.status(503).json({ success: false, error: "Order Service unavailable", detail: err.message });
    }
});

app.patch("/orders/:id/status", async (req, res) => {
    try {
        const response = await axios.patch(`${ORDER_SERVICE}/orders/${req.params.id}/status`, req.body);
        res.json(response.data);
    } catch (err) {
        res.status(503).json({ success: false, error: "Order Service unavailable", detail: err.message });
    }
});

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`🌐 API Gateway running on port ${PORT}`));
