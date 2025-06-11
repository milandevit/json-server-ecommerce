# 🛒 E-Commerce API with JSON Server and JSON Server Auth

This project provides a fully functional e-commerce API using `json-server` and `json-server-auth`, complete with role-based access control, sample data, and deployment instructions.

---

## 📦 Schema Overview

### Entities
- `users`: Registered users with roles (`admin`, `customer`)
- `products`: Items available for purchase
- `cart`: Items added to cart by users
- `orders`: Orders placed by users
- `reviews`: Product reviews by users
- `addresses`: Shipping/billing addresses
- `wishlists`: Saved products
- `payments`: Payment records
- `coupons`: Promotional discount codes

---

## 🔐 Access Control Rules

Using `json-server-auth` and custom middleware:

| Resource    | Access Level | Description                          |
|-------------|--------------|--------------------------------------|
| `users`     | 600          | Only owner can read/write            |
| `products`  | 444          | Read-only for all, write by admin    |
| `cart`      | 660          | Owner can write, all can read        |
| `orders`    | 660          | Owner can write, all can read        |
| `reviews`   | 660          | Owner can write, all can read        |
| `addresses` | 660          | Owner can write, all can read        |
| `wishlists` | 660          | Owner can write, all can read        |
| `payments`  | 660          | Owner can write, all can read        |
| `coupons`   | 444          | Read-only for all                    |

---

## 📘 API Reference

### Auth
**POST** `/register` - Register a new user  
**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123",
  "name": "John Doe",
  "role": "customer"
}
```

**POST** `/login` - Login and receive access token  
**Body:**
```json
{
  "email": "user@example.com",
  "password": "password123"
}
```

---

### Users
**GET** `/users` - Get all users (admin only)

---

### Products
**GET** `/products` - List all products  
**POST** `/products` - Create product (admin only)  
**Body:**
```json
{
  "name": "Wireless Keyboard",
  "description": "Mechanical keyboard with backlight",
  "price": 45.99,
  "category": "Electronics",
  "stock": 150,
  "userId": 3
}
```

**PATCH** `/products/:id` - Update product  
**DELETE** `/products/:id` - Delete product

---

### Cart
**GET** `/cart?userId=1` - Get cart items for user  
**POST** `/cart` - Add item to cart  
**Body:**
```json
{
  "userId": 1,
  "productId": 2,
  "quantity": 1
}
```

**PATCH** `/cart/:id` - Update cart item  
**Body:**
```json
{
  "quantity": 3
}
```

**DELETE** `/cart/:id` - Remove item from cart

---

### Orders
**GET** `/orders?userId=1` - Get orders for user  
**POST** `/orders` - Place an order  
**Body:**
```json
{
  "userId": 1,
  "items": [
    {
      "productId": 2,
      "quantity": 1
    }
  ],
  "total": 89.99,
  "status": "processing"
}
```

---

### Reviews
**GET** `/reviews?productId=1` - Get reviews for product  
**POST** `/reviews` - Submit a review  
**Body:**
```json
{
  "userId": 1,
  "productId": 1,
  "rating": 4,
  "comment": "Very good quality."
}
```

---

### Addresses
**GET** `/addresses?userId=1` - Get addresses for user  
**POST** `/addresses` - Add address  
**Body:**
```json
{
  "userId": 1,
  "type": "shipping",
  "address": "456 Park Ave, NY, USA"
}
```

---

### Wishlists
**GET** `/wishlists?userId=1` - Get wishlist items  
**POST** `/wishlists` - Add to wishlist  
**Body:**
```json
{
  "userId": 2,
  "productId": 1
}
```

---

### Payments
**GET** `/payments?userId=1` - Get payment records  
**POST** `/payments` - Make a payment  
**Body:**
```json
{
  "userId": 1,
  "orderId": 1,
  "amount": 89.99,
  "method": "credit_card",
  "status": "paid"
}
```

---

### Coupons
**GET** `/coupons` - List available coupons

---

## 🧪 Testing

Use the provided Postman collection to test all endpoints with sample requests and authentication flows.