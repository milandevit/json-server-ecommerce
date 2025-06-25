const jsonServer = require('json-server');
const auth = require('json-server-auth');
const cors = require('cors');
const server = jsonServer.create();

// Use a persistent path for db.json if deploying (e.g., '/data/db.json' on Render)
// For local dev, 'db.json' is fine
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.db = router.db;

// --- MIDDLEWARE SETUP ---

server.use(cors());
server.use(middlewares);
server.use(jsonServer.bodyParser);

// --- VALIDATION HELPERS ---

function validateProduct(req, res) {
  const { name, price, stock, categoryId } = req.body;
  if (!name || !price || !stock || !categoryId) {
    return 'Missing required product fields.';
  }
  if (typeof price !== 'number' || price < 0) {
    return 'Price must be a positive number.';
  }
  if (typeof stock !== 'number' || stock < 0) {
    return 'Stock must be a positive number.';
  }
  return null;
}

function validateCart(req) {
  const product = server.db.get('products').find({ id: req.body.productId }).value();
  if (!product) return 'Invalid product ID.';
  return null;
}

function validateCoupon(req) {
  const { code, discount, expires } = req.body;
  if (!code || typeof discount !== 'number' || !expires) {
    return 'Coupon code, discount, and expiration are required.';
  }
  const now = new Date();
  const exp = new Date(expires);
  if (exp < now) return 'Coupon expiry date must be in the future.';
  return null;
}

function validateOrder(req) {
  const { items, total } = req.body;
  if (!items || !Array.isArray(items) || items.length === 0) {
    return 'Order must contain items.';
  }
  let calculatedTotal = 0;
  for (const item of items) {
    const product = server.db.get('products').find({ id: item.productId }).value();
    if (!product) return `Product ID ${item.productId} not found.`;
    calculatedTotal += product.price * item.quantity;
  }
  if (Math.abs(calculatedTotal - total) > 0.01) {
    return `Total mismatch. Expected ${calculatedTotal}.`;
  }
  return null;
}

function validateReview(req) {
  const { productId, rating, userId } = req.body;
  if (!productId || typeof rating !== 'number') {
    return 'Product ID and rating are required.';
  }
  const product = server.db.get('products').find({ id: productId }).value();
  if (!product) return 'Invalid product ID.';
  const existingReview = server.db.get('reviews').find({ productId, userId }).value();
  if (existingReview) return 'You have already reviewed this product.';
  return null;
}

// --- GENERIC VALIDATION APPLIER ---

function applyValidation(route, validator) {
  server.post(route, (req, res, next) => {
    const error = validator(req, res);
    if (error) return res.status(400).json({ error });
    next();
  });
  server.put(route + '/:id', (req, res, next) => {
    const error = validator(req, res);
    if (error) return res.status(400).json({ error });
    next();
  });
  server.patch(route + '/:id', (req, res, next) => {
    const error = validator(req, res);
    if (error) return res.status(400).json({ error });
    next();
  });
}

// --- APPLY VALIDATIONS TO ROUTES ---

applyValidation('/addresses', req => {
  const { address, type } = req.body;
  if (!address || typeof address !== 'string') {
    return 'Address is required.';
  }
  if (!type || !['shipping', 'billing'].includes(type)) {
    return 'Type must be either "shipping" or "billing".';
  }
  return null;
});

applyValidation('/wishlists', req => {
  const product = server.db.get('products').find({ id: req.body.productId }).value();
  if (!product) return 'Invalid product ID.';
  const existing = server.db.get('wishlists').find({ userId: req.body.userId, productId: req.body.productId }).value();
  if (existing) return 'Product is already in wishlist.';
  return null;
});

applyValidation('/payments', req => {
  const { orderId, amount, method } = req.body;
  if (!orderId || typeof amount !== 'number' || !method) {
    return 'Order ID, amount, and method are required.';
  }
  const order = server.db.get('orders').find({ id: orderId }).value();
  if (!order) return 'Invalid order ID.';
  if (Math.abs(order.total - amount) > 0.01) return 'Payment amount does not match order total.';
  return null;
});
applyValidation('/products', validateProduct);
applyValidation('/cart', validateCart);
applyValidation('/coupons', validateCoupon);
applyValidation('/orders', validateOrder);
applyValidation('/reviews', validateReview);

// --- HIDE PASSWORDS IN USER RESPONSES ---

server.get('/users/:id', (req, res) => {
  const userId = parseInt(req.params.id);
  const user = server.db.get('users').find({ id: userId }).value();
  if (!user) return res.status(404).json({ error: 'User not found.' });
  const userResponse = {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role
  };
  res.json(userResponse);
});

// --- ADMIN/OWNERSHIP MIDDLEWARE ---

const protectedRoutes = [
  '/cart',
  '/orders',
  '/addresses',
  '/wishlists',
  '/payments',
  '/reviews',
  '/users'
];

// Check if route is for admin-only resources
function isAdminRoute(req) {
  return ["POST", "PUT", "PATCH", "DELETE"].includes(req.method) &&
    ["/products", "/categories"].some(p => req.path.startsWith(p + '/') || req.path === p);
}

// Check if route is protected (user must own resource)
function isProtectedRoute(req) {
  return ["POST", "PUT", "PATCH", "DELETE"].includes(req.method) &&
    protectedRoutes.find(route => req.path.startsWith(route));
}

// Extract resource ID from path
function extractResourceId(req) {
  return parseInt(req.path.split('/').pop());
}

// Check if user owns the resource
function isOwner(resource, userId) {
  return resource && resource.userId === userId;
}
/**
 * Extracts and decodes the JWT token from the Authorization header in the request,
 * and returns the corresponding user object from the database.
 * Returns null if token is missing, invalid, or user not found.
 */
const jwt = require('jsonwebtoken'); // Make sure to install this package

function getUserFromJWT(req) {
  const authHeader = req.headers['authorization'] || req.headers['Authorization'];
  if (!authHeader || !authHeader.startsWith('Bearer ')) return null;

  const token = authHeader.split(' ')[1];
  try {
    // Use the same secret as json-server-auth (default: 'secret')
    const decoded = jwt.verify(token, 'json-server-auth-123456');
    // Find user in db by id (decoded.sub or decoded.id)
    const userId = parseInt(decoded.sub);
    if (!userId) return null;
    const user = server.db.get('users').find({ id: userId }).value();
    return user || null;
  } catch (err) {
    console.error('JWT verification failed:', err);
    return null;
  }
}
// Ownership and admin check middleware
server.use((req, res, next) => {
  const user = getUserFromJWT(req);

  // Admin check for products/categories
  if (isAdminRoute(req)) {
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can modify products or categories.' });
    }
  }

  // Ownership check for protected resources
  const entity = isProtectedRoute(req);
  if (entity) {
    if (!user) return res.status(401).json({ error: 'Unauthorized' });

    if (req.method === 'POST') {
      req.body.userId = user.id;
    } else if (req.path.match(/^\/\w+\/\d+$/)) {
      const id = extractResourceId(req);
      const resource = server.db.get(entity.replace('/', '')).find({ id }).value();
      if (!isOwner(resource, user.id)) {
        return res.status(403).json({ error: 'Access denied. You do not own this resource.' });
      }
    }
  }

  next();
});

// --- AUTH REWRITE RULES ---

const rules = auth.rewriter({
  users: 600,        // Only owner can read/write
  cart: 660,         // Only owner can read/write, authenticated can read
  orders: 660,
  addresses: 660,
  wishlists: 660,
  payments: 660,
  reviews: 660,
  products: 644,     // Public read, only admin can modify (enforced above)
  categories: 644,   // Authenticated can read, only admin can modify
  coupons: 644
});

server.use(rules);
server.use(auth);
server.use(router);

// --- START SERVER ---

server.listen(3000, () => {
  console.log('JSON Server is running on port 3000');
});
