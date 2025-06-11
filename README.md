# 🛒 JSON Server eCommerce API

A mock eCommerce REST API built with [json-server](https://github.com/typicode/json-server) and [json-server-auth](https://github.com/jeremyben/json-server-auth) to simulate user registration, login, product management, cart, and order handling.

---

## 🚀 Features

- ✅ User Registration & Login (JWT based)
- 📦 Product CRUD
- 🧺 Cart API per user
- 🧾 Orders API per user
- 🔐 Protected routes via `json-server-auth`
- ⚙️ Easily deployable to Render/Replit/Railway

---

## 🧪 Sample Credentials

```json
{
  "email": "test@example.com",
  "password": "secret123"
}
```

---

## 📦 Install & Run Locally

```
git clone https://github.com/your-username/json-server-ecommerce.git
cd json-server-ecommerce

npm install
npm start
```

Open your browser or Postman:
```
http://localhost:3000
```

## 🔐 Auth Rules (`json-server-auth`)

| Resource    | Access Rule        |
| ----------- | ------------------ |
| `/users`    | owner only (`644`) |
| `/products` | public (`644`)     |
| `/cart`     | owner only (`660`) |
| `/orders`   | owner only (`660`) |

To change access rules, add this before `app.use(auth)` in `server.js`:
```
const rules = auth.rewriter({
  users: 640,
  products: 644,
  cart: 660,
  orders: 660
})
app.use(rules)
```

## 🌍 Deploy on Render (Free)
1. Push this repo to GitHub

2. Go to https://render.com

3. Click New > Web Service

4. Connect your repo

5. Fill in:
    - Build Command: `npm install`
    - Start Command: `npm start`

Render will give you a public URL like: https://your-api.onrender.com

## 🧪 Sample Endpoints
| Method | Endpoint         | Description                 |
| ------ | ---------------- | --------------------------- |
| POST   | `/register`      | Register a new user         |
| POST   | `/login`         | Login and get JWT token     |
| GET    | `/products`      | List all products           |
| POST   | `/products`      | Add product (auth required) |
| GET    | `/cart?userId=1` | Get cart for user           |
| POST   | `/orders`        | Place a new order           |

## 🧰 Tech Stack
- Node.js

- json-server

- json-server-auth

- Render (deployment)

## 📄 License
MIT

Built for mock development and prototyping eCommerce features.


---
