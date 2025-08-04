const path = require('path');
require('dotenv').config({ path: path.join(__dirname, '.env') });
const express = require('express');
const db = require('./utils/db');
const multer = require('multer');
const upload = multer({ dest: 'public/images/' });
const session = require('express-session');
const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const app = express();

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

// Session Management
app.use(session({
  secret: process.env.SESSION_SECRET,
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false } // Set to true if using HTTPS
}));

// Passport Configuration
passport.use(new GoogleStrategy({
  clientID: process.env.GOOGLE_CLIENT_ID,
  clientSecret: process.env.GOOGLE_CLIENT_SECRET,
  callbackURL: '/auth/google/callback'
}, (accessToken, refreshToken, profile, done) => {
  // Placeholder: Find or create user in the database
  console.log('Google profile:', profile);
  return done(null, profile);
}));

passport.serializeUser((user, done) => {
  done(null, user);
});

passport.deserializeUser((user, done) => {
  done(null, user);
});

// Middleware for Passport
app.use(passport.initialize());
app.use(passport.session());

// View Engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Routes
app.get('/', (req, res) => {
  res.render('pages/index');
});

// Render Contact Page
app.get('/contact', (req, res) => {
  res.render('pages/contact');
});

// Contact form submission
app.post('/contact', (req, res) => {
  const { name, email, message } = req.body;
  const query = `INSERT INTO contact_submissions (name, email, message) VALUES (?, ?, ?)`;
  db.run(query, [name, email, message], function (err) {
    if (err) {
      console.error('Error saving contact submission:', err.message);
      res.status(500).send('An error occurred. Please try again later.');
    } else {
      res.render('pages/contact', { message: 'Thank you for reaching out! We will get back to you soon.' });
    }
  });
});

// Booking form submission with email notification placeholder
app.post('/booking', (req, res) => {
  const { date, time } = req.body;
  const query = `INSERT INTO booking_submissions (date, time) VALUES (?, ?)`;
  db.run(query, [date, time], function (err) {
    if (err) {
      console.error('Error saving booking submission:', err.message);
      res.status(500).send('An error occurred. Please try again later.');
    } else {
      // Placeholder for email notification
      console.log(`Email notification: Booking request received for ${date} at ${time}`);
      res.render('pages/booking', { message: 'Your booking request has been received.' });
    }
  });
});

// Password Reset Request
app.post('/password-reset', (req, res) => {
  const { email } = req.body;
  const query = 'SELECT * FROM users WHERE email = ?';
  db.get(query, [email], (err, user) => {
    if (err || !user) {
      console.error('Error finding user for password reset:', err?.message || 'User not found');
      res.status(404).send('User not found.');
    } else {
      // Placeholder for sending reset email
      console.log(`Password reset email sent to ${email}`);
      res.send('Password reset instructions have been sent to your email.');
    }
  });
});

// Password Reset Form Submission
app.post('/password-reset/:token', (req, res) => {
  const { token } = req.params;
  const { newPassword } = req.body;
  // Placeholder for token validation and password update
  console.log(`Password reset for token: ${token}`);
  res.send('Your password has been reset successfully.');
});

// Basic Authentication Middleware
function authenticate(req, res, next) {
  const auth = { login: 'admin', password: 'password' }; // Change these credentials

  const b64auth = (req.headers.authorization || '').split(' ')[1] || '';
  const [login, password] = Buffer.from(b64auth, 'base64').toString().split(':');

  if (login && password && login === auth.login && password === auth.password) {
    return next();
  }

  res.set('WWW-Authenticate', 'Basic realm="401"');
  res.status(401).send('Authentication required.');
}

// Secure Admin Dashboard Route
app.get('/admin/dashboard', authenticate, (req, res) => {
  const contactQuery = 'SELECT * FROM contact_submissions';
  const bookingQuery = 'SELECT * FROM booking_submissions';

  db.all(contactQuery, [], (err, contactSubmissions) => {
    if (err) {
      console.error('Error fetching contact submissions:', err.message);
      res.status(500).send('An error occurred. Please try again later.');
    } else {
      db.all(bookingQuery, [], (err, bookingSubmissions) => {
        if (err) {
          console.error('Error fetching booking submissions:', err.message);
          res.status(500).send('An error occurred. Please try again later.');
        } else {
          res.render('pages/admin/dashboard', { contactSubmissions, bookingSubmissions });
        }
      });
    }
  });
});

// Admin - View Products
app.get('/admin/products', authenticate, (req, res) => {
  const query = 'SELECT * FROM products';
  db.all(query, [], (err, products) => {
    if (err) {
      console.error('Error fetching products:', err.message);
      res.status(500).send('An error occurred. Please try again later.');
    } else {
      res.render('pages/admin/products', { products });
    }
  });
});

// Admin - Add Product
app.post('/admin/products', authenticate, upload.single('image'), (req, res) => {
  const { name, price, category } = req.body;
  const image = req.file.filename;
  const query = 'INSERT INTO products (name, price, category, image) VALUES (?, ?, ?, ?)';
  db.run(query, [name, price, category, image], function (err) {
    if (err) {
      console.error('Error adding product:', err.message);
      res.status(500).send('An error occurred. Please try again later.');
    } else {
      res.redirect('/admin/products');
    }
  });
});

// Admin - Delete Product
app.get('/admin/products/delete/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const query = 'DELETE FROM products WHERE id = ?';
  db.run(query, [id], function (err) {
    if (err) {
      console.error('Error deleting product:', err.message);
      res.status(500).send('An error occurred. Please try again later.');
    } else {
      res.redirect('/admin/products');
    }
  });
});

// Admin - View Orders
app.get('/admin/orders', authenticate, (req, res) => {
  const query = 'SELECT * FROM orders';
  db.all(query, [], (err, orders) => {
    if (err) {
      console.error('Error fetching orders:', err.message);
      res.status(500).send('An error occurred. Please try again later.');
    } else {
      // Fetch order items for each order
      const ordersWithItems = orders.map(order => {
        return new Promise((resolve, reject) => {
          const itemsQuery = 'SELECT * FROM order_items WHERE order_id = ?';
          db.all(itemsQuery, [order.id], (err, items) => {
            if (err) {
              reject(err);
            } else {
              order.items = items;
              resolve(order);
            }
          });
        });
      });

      Promise.all(ordersWithItems)
        .then(completeOrders => {
          res.render('pages/admin/orders', { orders: completeOrders });
        })
        .catch(err => {
          console.error('Error fetching order items:', err.message);
          res.status(500).send('An error occurred. Please try again later.');
        });
    }
  });
});

// Admin - Update Order Status
app.post('/admin/orders/update/:id', authenticate, (req, res) => {
  const { id } = req.params;
  const { status } = req.body;
  const query = 'UPDATE orders SET status = ? WHERE id = ?';
  db.run(query, [status, id], function (err) {
    if (err) {
      console.error('Error updating order status:', err.message);
      res.status(500).send('An error occurred. Please try again later.');
    } else {
      res.redirect('/admin/orders');
    }
  });
});

// Admin - View Bookings
app.get('/admin/bookings', authenticate, (req, res) => {
  const query = 'SELECT * FROM booking_submissions';
  db.all(query, [], (err, bookings) => {
    if (err) {
      console.error('Error fetching bookings:', err.message);
      res.status(500).send('An error occurred. Please try again later.');
    } else {
      res.render('pages/admin/bookings', { bookings });
    }
  });
});

// Admin - Analytics Dashboard
app.get('/admin/analytics', authenticate, (req, res) => {
  const topSellingQuery = 'SELECT name, SUM(quantity) as totalSold FROM order_items GROUP BY name ORDER BY totalSold DESC LIMIT 5';
  const totalEarningsQuery = 'SELECT SUM(total) as totalEarnings FROM orders';

  db.all(topSellingQuery, [], (err, topSelling) => {
    if (err) {
      console.error('Error fetching top-selling items:', err.message);
      res.status(500).send('An error occurred. Please try again later.');
    } else {
      db.get(totalEarningsQuery, [], (err, totalEarnings) => {
        if (err) {
          console.error('Error fetching total earnings:', err.message);
          res.status(500).send('An error occurred. Please try again later.');
        } else {
          res.render('pages/admin/analytics', { topSelling, totalEarnings });
        }
      });
    }
  });
});

// User Address Book - Add Address
app.post('/profile/address', (req, res) => {
  const { userId, address } = req.body;
  const query = 'INSERT INTO addresses (user_id, address) VALUES (?, ?)';
  db.run(query, [userId, address], function (err) {
    if (err) {
      console.error('Error adding address:', err.message);
      res.status(500).send('An error occurred. Please try again later.');
    } else {
      res.redirect('/profile');
    }
  });
});

// User Address Book - View Addresses
app.get('/profile/addresses', (req, res) => {
  const { userId } = req.query;
  const query = 'SELECT * FROM addresses WHERE user_id = ?';
  db.all(query, [userId], (err, addresses) => {
    if (err) {
      console.error('Error fetching addresses:', err.message);
      res.status(500).send('An error occurred. Please try again later.');
    } else {
      res.render('pages/profile/addresses', { addresses });
    }
  });
});

// User Order Status Tracking
app.get('/profile/orders', (req, res) => {
  const { userId } = req.query;
  const query = 'SELECT * FROM orders WHERE user_id = ?';
  db.all(query, [userId], (err, orders) => {
    if (err) {
      console.error('Error fetching orders:', err.message);
      res.status(500).send('An error occurred. Please try again later.');
    } else {
      res.render('pages/profile/orders', { orders });
    }
  });
});

// Product Filtering and Search
app.get('/store', (req, res) => {
  const { search, category, brand, minPrice, maxPrice } = req.query;
  let query = 'SELECT * FROM products WHERE 1=1';
  const params = [];

  if (search) {
    query += ' AND name LIKE ?';
    params.push(`%${search}%`);
  }
  if (category) {
    query += ' AND category = ?';
    params.push(category);
  }
  if (brand) {
    query += ' AND brand = ?';
    params.push(brand);
  }
  if (minPrice) {
    query += ' AND price >= ?';
    params.push(minPrice);
  }
  if (maxPrice) {
    query += ' AND price <= ?';
    params.push(maxPrice);
  }

  db.all(query, params, (err, products) => {
    if (err) {
      console.error('Error fetching products:', err.message);
      res.status(500).send('An error occurred. Please try again later.');
    } else {
      res.render('pages/store', { products });
    }
  });
});

// Build-Your-Own-PC
app.get('/build-pc', (req, res) => {
  const query = 'SELECT * FROM products WHERE category IN ("CPU", "Motherboard", "RAM", "Storage", "GPU")';
  db.all(query, [], (err, components) => {
    if (err) {
      console.error('Error fetching components:', err.message);
      res.status(500).send('An error occurred. Please try again later.');
    } else {
      res.render('pages/build-pc', { components });
    }
  });
});

app.post('/build-pc/validate', (req, res) => {
  const { cpu, motherboard, ram } = req.body;
  // Placeholder for compatibility logic
  if (cpu.includes('DDR5') && !motherboard.includes('DDR5')) {
    return res.status(400).send('Incompatible CPU and Motherboard selected.');
  }
  res.send('Configuration is valid.');
});

// Google OAuth Routes
app.get('/auth/google', passport.authenticate('google', { scope: ['profile', 'email'] }));

app.get('/auth/google/callback', passport.authenticate('google', {
  failureRedirect: '/login'
}), (req, res) => {
  res.redirect('/');
});

// Debug Log
console.log('GOOGLE_CLIENT_ID:', process.env.GOOGLE_CLIENT_ID);
console.log('Environment Variables:', process.env);

// Start Server
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on http://localhost:${PORT}`);
});
