const jsonServer = require('json-server');
const auth = require('json-server-auth');
const cors = require('cors');
const server = jsonServer.create();
const router = jsonServer.router('db.json');
const middlewares = jsonServer.defaults();

server.db = router.db;

server.use(cors());
server.use(middlewares);
server.use(jsonServer.bodyParser);

// Auth middleware first
server.use(auth);

const protectedRoutes = ['/cart', '/orders', '/addresses', '/wishlists', '/payments', '/reviews'];

function isAdminRoute(req) {
  return ["POST", "PUT", "PATCH", "DELETE"].includes(req.method) &&
    ["/products", "/categories"].some(p => req.path.startsWith(p + '/') || req.path === p);
}

function isProtectedRoute(req) {
  return ["POST", "PUT", "PATCH", "DELETE"].includes(req.method) &&
    protectedRoutes.find(route => req.path.startsWith(route));
}

function extractResourceId(req) {
  return parseInt(req.path.split('/').pop());
}

function isOwner(resource, userId) {
  return resource && resource.userId === userId;
}

server.use((req, res, next) => {
  const user = req.user;

  if (isAdminRoute(req)) {
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can modify products or categories.' });
    }
  }

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

// --- Shared Validation Functions ---

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

// --- Apply Validations ---
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

// Hide passwords in user responses
server.get('/users', (req, res) => {
  const users = server.db.get('users').map(u => ({
    id: u.id,
    name: u.name,
    email: u.email,
    role: u.role
  })).value();
  res.json(users);
});

// Auth rewrite rules
const rules = auth.rewriter({
  users: 600,
  cart: 660,
  orders: 660,
  addresses: 660,
  wishlists: 660,
  payments: 660,
  reviews: 660,
  products: 644,
  categories: 644,
  coupons: 644
});

server.use(rules);
server.use(router);
server.listen(3000, () => {
  console.log('JSON Server is running on port 3000');
});
