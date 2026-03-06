# 🚀 MERN Microservices Demo Architecture

This project is a detailed, educational demonstration of a **Microservices Architecture** built using the **MERN** stack (MongoDB, Express, React, Node.js). It is designed to be easily understood while demonstrating industry-standard concepts like API Gateways, separate service databases, and inter-service communication.

![Microservices Dashboard](https://img.shields.io/badge/Architecture-Microservices-blue)
![Stack](https://img.shields.io/badge/Stack-MERN-green)

---

## 🏗️ Architecture Overview

In a traditional monolithic application, all features (Users, Products, Orders) are bundled into a single codebase and run on a single server, connecting to a single database.

In this **Microservices Architecture**, we break down the application into smaller, independent services. Each service:
- Has its own dedicated codebase.
- Runs on its own separate port.
- Connects to its *own* separate database.
- Can be started, stopped, or scaled independently.

### 🌐 The API Gateway Pattern

Instead of the React client talking to 3 different servers on 3 different ports, we use an **API Gateway**. The Gateway acts as a single entry point (a "front door"). 
- The React App only talks to the API Gateway.
- The API Gateway looks at the request and forwards (routes) it to the correct underlying microservice.

---

## 📂 Project Structure & Services

This repository contains 5 individual projects (1 Frontend + 4 Backend Services):

| Service | Port | Database | Description |
| :--- | :--- | :--- | :--- |
| **API Gateway** | `5000` | *None* | Central router & health checker. Routes traffic to other services. |
| **User Service** | `5001` | `userdb` | Handles user registration and management. |
| **Product Service** | `5002` | `productdb` | Manages the product catalog, pricing, and stock. |
| **Order Service** | `5003` | `orderdb` | Creates orders. *Communicates with Product Service to verify pricing.* |
| **React Client** | `3000` | *None* | The frontend dashboard UI that connects to the Gateway. |

---

## 🛠️ Key Concepts Demonstrated

### 1. Independent Databases
If you look at the code, you will notice something important:
- User Service connects to `mongodb://localhost:27017/userdb`
- Product Service connects to `mongodb://localhost:27017/productdb`
- Order Service connects to `mongodb://localhost:27017/orderdb`

**Why?** If the Product database crashes, the User service remains online and completely unaffected. 

### 2. Inter-Service Communication
Microservices sometimes need to talk to each other. In this app, when a user places an order, the **Order Service** needs to know the price of the product.
Instead of connecting to the Product database directly (which violates microservice rules), the Order Service makes a direct HTTP `GET` request to the Product Service via `axios`!

### 3. Centralized Health Monitoring
The API Gateway contains a `/health` endpoint. It actively pings the User, Product, and Order services to verify they are alive and responds with a unified status report to the frontend dashboard.

---

## 🚀 How to Run the Project Locally

### Prerequisites
Make sure you have installed on your computer:
- [Node.js](https://nodejs.org/)
- [MongoDB Community Server](https://www.mongodb.com/try/download/community) (Running locally on port `27017`)

### Step 1: Install Dependencies
Open a terminal in the root directory and install all dependencies for all 5 services with a single command:
```bash
npm run install:all
```

### Step 2: Start the Application
You can start all services at the same time using either command line or Visual Studio Code.

**Option A (Separate Terminals):** 
Open 5 different terminals and run:
- Terminal 1: `npm run start:gateway`
- Terminal 2: `npm run start:users`
- Terminal 3: `npm run start:products`
- Terminal 4: `npm run start:orders`
- Terminal 5: `npm run start:client`

**Option B (Manually):**
Navigate into each folder (`cd api-gateway`, etc) and run `npm start` or `node server.js`.

### Step 3: View the Dashboard
Once all terminals are running, open your web browser and go to:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 💡 RESTful API Endpoints Reference

If you want to test the APIs using Postman instead of the React Dashboard, you can make requests straight to the Gateway (`http://localhost:5000`):

### Users
- `GET /users` - Get all users
- `POST /users` - Create user (`{ "name": "John", "email": "john@example.com" }`)
- `DELETE /users/:id` - Delete user

### Products
- `GET /products` - Get all products
- `POST /products` - Create product (`{ "name": "Laptop", "price": 1000, "stock": 10 }`)
- `DELETE /products/:id` - Delete product

### Orders
- `GET /orders` - Get all orders
- `POST /orders` - Place order (`{ "userId": "...", "productId": "...", "quantity": 1 }`)
- `PATCH /orders/:id/status` - Update status (`{ "status": "shipped" }`)

---

## 🎓 Educational Note
This repository was strictly designed as an educational college project to easily demonstrate Microservices flow. In a real-world enterprise scenario, you would also incorporate elements like Docker containers, message brokers (like RabbitMQ or Kafka) for asynchronous communication, and service registries (like Eureka).
