import React, { useState, useEffect, useCallback } from "react";
import "./App.css";

const GATEWAY = "http://localhost:5000";

// ─── API helpers ─────────────────────────────────────────────────────────────
const api = {
  get: (path) => fetch(`${GATEWAY}${path}`).then(r => r.json()),
  post: (path, body) => fetch(`${GATEWAY}${path}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
  delete: (path) => fetch(`${GATEWAY}${path}`, { method: "DELETE" }).then(r => r.json()),
  patch: (path, body) => fetch(`${GATEWAY}${path}`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify(body) }).then(r => r.json()),
};

// ─── Shared UI Atoms ──────────────────────────────────────────────────────────
const Badge = ({ children, color }) => (
  <span className={`badge badge-${color}`}>{children}</span>
);

const ServiceCard = ({ name, port, icon, status }) => (
  <div className={`service-card ${status}`}>
    <div className="service-icon">{icon}</div>
    <div className="service-info">
      <span className="service-name">{name}</span>
      <span className="service-port">:{port}</span>
    </div>
    <div className={`service-dot ${status}`} />
  </div>
);

const Toast = ({ msg, type, onClose }) => (
  <div className={`toast toast-${type}`}>
    <span>{msg}</span>
    <button onClick={onClose}>✕</button>
  </div>
);

// ─── Section: Users ───────────────────────────────────────────────────────────
function UsersSection({ toast }) {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoad] = useState(false);

  const load = useCallback(async () => {
    try { const r = await api.get("/users"); setUsers(r.data || []); }
    catch { toast("User Service unreachable ❌", "error"); }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const add = async () => {
    if (!name || !email) return toast("Fill in name & email", "warn");
    setLoad(true);
    const r = await api.post("/users", { name, email });
    setLoad(false);
    if (r.success) { toast("User added ✅", "success"); setName(""); setEmail(""); load(); }
    else toast(r.error || "Failed", "error");
  };

  const remove = async (id) => {
    await api.delete(`/users/${id}`);
    toast("User removed", "info");
    load();
  };

  return (
    <div className="section">
      <h2 className="section-title"><span>👤</span> Users</h2>
      <div className="form-row">
        <input className="inp" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <input className="inp" placeholder="Email" value={email} onChange={e => setEmail(e.target.value)} />
        <button className="btn btn-blue" onClick={add} disabled={loading}>{loading ? "Adding…" : "Add User"}</button>
      </div>
      <div className="table-wrap">
        <table className="tbl">
          <thead><tr><th>#</th><th>Name</th><th>Email</th><th>Joined</th><th></th></tr></thead>
          <tbody>
            {users.length === 0 && <tr><td colSpan={5} className="empty">No users yet</td></tr>}
            {users.map((u, i) => (
              <tr key={u._id}>
                <td>{i + 1}</td>
                <td><strong>{u.name}</strong></td>
                <td>{u.email}</td>
                <td>{new Date(u.createdAt).toLocaleDateString()}</td>
                <td><button className="btn-del" onClick={() => remove(u._id)}>✕</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Section: Products ────────────────────────────────────────────────────────
function ProductsSection({ toast }) {
  const [products, setProducts] = useState([]);
  const [name, setName] = useState("");
  const [price, setPrice] = useState("");
  const [desc, setDesc] = useState("");
  const [stock, setStock] = useState("");
  const [loading, setLoad] = useState(false);

  const load = useCallback(async () => {
    try { const r = await api.get("/products"); setProducts(r.data || []); }
    catch { toast("Product Service unreachable ❌", "error"); }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const add = async () => {
    if (!name || !price) return toast("Fill in name & price", "warn");
    setLoad(true);
    const r = await api.post("/products", { name, price: Number(price), description: desc, stock: Number(stock) || 0 });
    setLoad(false);
    if (r.success) { toast("Product added ✅", "success"); setName(""); setPrice(""); setDesc(""); setStock(""); load(); }
    else toast(r.error || "Failed", "error");
  };

  const remove = async (id) => {
    await api.delete(`/products/${id}`);
    toast("Product removed", "info");
    load();
  };

  return (
    <div className="section">
      <h2 className="section-title"><span>📦</span> Products</h2>
      <div className="form-row">
        <input className="inp" placeholder="Name" value={name} onChange={e => setName(e.target.value)} />
        <input className="inp" placeholder="Price (₹)" type="number" value={price} onChange={e => setPrice(e.target.value)} />
        <input className="inp" placeholder="Description" value={desc} onChange={e => setDesc(e.target.value)} />
        <input className="inp" placeholder="Stock" type="number" value={stock} onChange={e => setStock(e.target.value)} />
        <button className="btn btn-green" onClick={add} disabled={loading}>{loading ? "Adding…" : "Add Product"}</button>
      </div>
      <div className="table-wrap">
        <table className="tbl">
          <thead><tr><th>#</th><th>Name</th><th>Price</th><th>Stock</th><th>Description</th><th></th></tr></thead>
          <tbody>
            {products.length === 0 && <tr><td colSpan={6} className="empty">No products yet</td></tr>}
            {products.map((p, i) => (
              <tr key={p._id}>
                <td>{i + 1}</td>
                <td><strong>{p.name}</strong></td>
                <td>₹{p.price.toFixed(2)}</td>
                <td><Badge color={p.stock > 0 ? "green" : "red"}>{p.stock}</Badge></td>
                <td>{p.description || "—"}</td>
                <td><button className="btn-del" onClick={() => remove(p._id)}>✕</button></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Section: Orders ──────────────────────────────────────────────────────────
function OrdersSection({ toast }) {
  const [orders, setOrders] = useState([]);
  const [users, setUsers] = useState([]);
  const [products, setProducts] = useState([]);
  const [userId, setUserId] = useState("");
  const [productId, setProdId] = useState("");
  const [qty, setQty] = useState(1);
  const [loading, setLoad] = useState(false);

  const load = useCallback(async () => {
    try {
      const [o, u, p] = await Promise.all([api.get("/orders"), api.get("/users"), api.get("/products")]);
      setOrders(o.data || []);
      setUsers(u.data || []);
      setProducts(p.data || []);
    } catch { toast("Service unreachable ❌", "error"); }
  }, [toast]);

  useEffect(() => { load(); }, [load]);

  const place = async () => {
    if (!userId || !productId) return toast("Select user & product", "warn");
    setLoad(true);
    const r = await api.post("/orders", { userId, productId, quantity: Number(qty) });
    setLoad(false);
    if (r.success) { toast("Order placed ✅", "success"); load(); }
    else toast(r.error || "Failed", "error");
  };

  const updateStatus = async (id, status) => {
    await api.patch(`/orders/${id}/status`, { status });
    toast(`Status → ${status}`, "info");
    load();
  };

  const STATUS_COLORS = { pending: "orange", confirmed: "blue", shipped: "purple", delivered: "green" };

  return (
    <div className="section">
      <h2 className="section-title"><span>🛒</span> Orders</h2>
      <div className="form-row">
        <select className="inp" value={userId} onChange={e => setUserId(e.target.value)}>
          <option value="">Select User</option>
          {users.map(u => <option key={u._id} value={u._id}>{u.name}</option>)}
        </select>
        <select className="inp" value={productId} onChange={e => setProdId(e.target.value)}>
          <option value="">Select Product</option>
          {products.map(p => <option key={p._id} value={p._id}>{p.name} — ₹{p.price}</option>)}
        </select>
        <input className="inp" type="number" min={1} placeholder="Qty" value={qty} onChange={e => setQty(e.target.value)} style={{ width: "80px" }} />
        <button className="btn btn-purple" onClick={place} disabled={loading}>{loading ? "Placing…" : "Place Order"}</button>
      </div>
      <div className="table-wrap">
        <table className="tbl">
          <thead><tr><th>#</th><th>User ID</th><th>Product ID</th><th>Qty</th><th>Total</th><th>Status</th><th>Change Status</th></tr></thead>
          <tbody>
            {orders.length === 0 && <tr><td colSpan={7} className="empty">No orders yet</td></tr>}
            {orders.map((o, i) => (
              <tr key={o._id}>
                <td>{i + 1}</td>
                <td className="mono">{o.userId.slice(-6)}</td>
                <td className="mono">{o.productId.slice(-6)}</td>
                <td>{o.quantity}</td>
                <td>{o.totalPrice ? `₹${o.totalPrice}` : "—"}</td>
                <td><Badge color={STATUS_COLORS[o.status]}>{o.status}</Badge></td>
                <td>
                  <select className="status-sel" value={o.status} onChange={e => updateStatus(o._id, e.target.value)}>
                    {["pending", "confirmed", "shipped", "delivered"].map(s => <option key={s}>{s}</option>)}
                  </select>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─── Section: Health ──────────────────────────────────────────────────────────
function HealthSection({ toast }) {
  const [health, setHealth] = useState(null);
  const [loading, setLoad] = useState(false);

  const check = async () => {
    setLoad(true);
    try { const r = await api.get("/health"); setHealth(r); }
    catch { toast("Gateway unreachable ❌", "error"); setHealth(null); }
    setLoad(false);
  };

  useEffect(() => { check(); }, []); // eslint-disable-line

  return (
    <div className="section">
      <div className="health-header">
        <h2 className="section-title"><span>🩺</span> Service Health</h2>
        <button className="btn btn-blue" onClick={check} disabled={loading}>{loading ? "Checking…" : "Refresh"}</button>
      </div>
      <div className="health-grid">
        <ServiceCard name="API Gateway" port="5000" icon="🌐" status={health ? "up" : "unknown"} />
        {health?.services?.map(s => (
          <ServiceCard key={s.name} name={s.name} port={
            s.name === "User Service" ? "5001" : s.name === "Product Service" ? "5002" : "5003"
          } icon={
            s.name === "User Service" ? "👤" : s.name === "Product Service" ? "📦" : "🛒"
          } status={s.status.includes("UP") ? "up" : "down"} />
        ))}
      </div>
      {health && (
        <div className="health-detail">
          {health.services?.map(s => (
            <div key={s.name} className={`health-row ${s.status.includes("UP") ? "up" : "down"}`}>
              <span>{s.status}</span>
              <span><strong>{s.name}</strong></span>
              <span className="health-msg">{s.message || "Service is down"}</span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── App Root ─────────────────────────────────────────────────────────────────
const TABS = [
  { id: "health", label: "Health", icon: "🩺" },
  { id: "users", label: "Users", icon: "👤" },
  { id: "products", label: "Products", icon: "📦" },
  { id: "orders", label: "Orders", icon: "🛒" },
];

export default function App() {
  const [tab, setTab] = useState("health");
  const [toasts, setToasts] = useState([]);

  const toast = useCallback((msg, type = "info") => {
    const id = Date.now();
    setToasts(t => [...t, { id, msg, type }]);
    setTimeout(() => setToasts(t => t.filter(x => x.id !== id)), 3500);
  }, []);

  return (
    <div className="app">
      {/* Header */}
      <header className="header">
        <div className="header-inner">
          <div className="logo">
            <span className="logo-icon">⚡</span>
            <span className="logo-text">MERN<span>Microservices</span></span>
          </div>
          <div className="header-tag">College Demo — Microservices Architecture</div>
        </div>
      </header>

      {/* Architecture Banner */}
      <div className="arch-banner">
        <div className="arch-flow">
          <div className="arch-node client">React Client :3000</div>
          <div className="arch-arrow">→</div>
          <div className="arch-node gateway">API Gateway :5000</div>
          <div className="arch-arrow">→</div>
          <div className="arch-group">
            <div className="arch-node svc">User :5001</div>
            <div className="arch-node svc">Product :5002</div>
            <div className="arch-node svc">Order :5003</div>
          </div>
          <div className="arch-arrow">→</div>
          <div className="arch-node db">MongoDB</div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="nav">
        {TABS.map(t => (
          <button key={t.id} className={`nav-btn ${tab === t.id ? "active" : ""}`} onClick={() => setTab(t.id)}>
            <span>{t.icon}</span> {t.label}
          </button>
        ))}
      </nav>

      {/* Content */}
      <main className="main">
        {tab === "health" && <HealthSection toast={toast} />}
        {tab === "users" && <UsersSection toast={toast} />}
        {tab === "products" && <ProductsSection toast={toast} />}
        {tab === "orders" && <OrdersSection toast={toast} />}
      </main>

      {/* Toast Stack */}
      <div className="toast-stack">
        {toasts.map(t => <Toast key={t.id} msg={t.msg} type={t.type} onClose={() => setToasts(ts => ts.filter(x => x.id !== t.id))} />)}
      </div>
    </div>
  );
}
