# 🛒 Advanced E-Commerce API with JSON Server & Auth

This project is a mock e-commerce REST API built using `json-server` and `json-server-auth`. It supports user authentication, role-based access (admin/customer), and realistic e-commerce features like products, cart, orders, reviews, and more.

---

## 📦 Database Schema Overview (`db.json`)

- `users`: Registered users with roles (`admin` or `customer`)
- `products`: Product catalog with categories, prices, and inventory
- `categories`: Product categories
- `cart`: Items added to cart by users
- `orders`: Orders placed by users
- `reviews`: Product reviews by users
- `addresses`: Shipping and billing addresses
- `wishlists`: Saved products for later
- `payments`: Payment records for orders
- `inventory`: Stock tracking
- `coupons`: Promotional discount codes

---

## 🔐 Access Control Rules

Using `json-server-auth` and custom middleware:

| Resource     | Access Rule Description                                  |
|--------------|----------------------------------------------------------|
| `users`      | Users can only read/update their own profile             |
| `cart`       | Only the owner can read/write their cart                 |
| `orders`     | Only the owner can place/view their orders               |
| `products`   | Admins can create/update/delete, everyone can read       |
| `reviews`    | Only the owner can write/edit/delete their reviews       |
| `addresses`  | Only the owner can manage their addresses                |
| `wishlists`  | Only the owner can manage their wishlist                 |
| `payments`   | Only the owner can view their payment records            |
| `coupons`    | Admins can create, users can read                        |

---

## 📬 API Endpoints

### 🔐 Auth
- `POST /register` – Register a new user
- `POST /login` – Login and receive JWT token

### 👤 Users
- `GET /users/:id` – Get user profile
- `PATCH /users/:id` – Update user profile

### 🛍️ Products
- `GET /products` – List all products
- `POST /products` – (Admin only) Add new product
- `PATCH /products/:id` – (Admin only) Update product
- `DELETE /products/:id` – (Admin only) Delete product

### 🛒 Cart
- `GET /cart?userId=1` – Get user's cart
- `POST /cart` – Add item to cart
- `PATCH /cart/:id` – Update cart item
- `DELETE /cart/:id` – Remove item from cart

### 📦 Orders
- `GET /orders?userId=1` – Get user's orders
- `POST /orders` – Place a new order

### 📝 Reviews
- `GET /reviews?productId=1` – Get reviews for a product
- `POST /reviews` – Add a review
- `PATCH /reviews/:id` – Edit a review
- `DELETE /reviews/:id` – Delete a review

### 🧾 Payments
- `GET /payments?userId=1` – Get payment history
- `POST /payments` – Record a payment

### 🧳 Addresses
- `GET /addresses?userId=1` – Get user's addresses
- `POST /addresses` – Add address
- `PATCH /addresses/:id` – Update address
- `DELETE /addresses/:id` – Delete address

### ❤️ Wishlists
- `GET /wishlists?userId=1` – Get wishlist
- `POST /wishlists` – Add to wishlist
- `DELETE /wishlists/:id` – Remove from wishlist

### 🎟️ Coupons
- `GET /coupons` – List available coupons
- `POST /coupons` – (Admin only) Create coupon

---

## 🧪 Testing

Use the provided Postman collection to test all endpoints:
- Import `ecommerce_postman_collection.json` into Postman
- Set `Authorization` header with `Bearer <token>` after login

---

## 📄 License

This project is for educational and prototyping purposes only.
