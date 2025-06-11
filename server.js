
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

// Role-based access control middleware
server.use((req, res, next) => {
  const user = req.user;

  if (req.method === 'POST' && req.path === '/products') {
    if (!user || user.role !== 'admin') {
      return res.status(403).json({ error: 'Only admins can add products' });
    }
  }

  if (['/cart', '/orders', '/addresses', '/wishlists', '/payments', '/reviews'].some(path => req.path.startsWith(path))) {
    if (req.method !== 'GET' && (!user || parseInt(req.body.userId) !== user.id)) {
      return res.status(403).json({ error: 'You can only modify your own data' });
    }
  }

  next();
});

const rules = auth.rewriter({
  users: 600,
  cart: 660,
  orders: 660,
  addresses: 660,
  wishlists: 660,
  payments: 660,
  reviews: 660,
  products: 444,
  coupons: 444
});

server.use(rules);
server.use(auth);
server.use(router);
server.listen(3000, () => {
  console.log('JSON Server is running on port 3000');
});
