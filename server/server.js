require('dotenv').config();

const path = require('path');
const express = require('express');
const session = require('express-session');
const MySQLStoreFactory = require('express-mysql-session');
const helmet = require('helmet');
const { pool, testDatabaseConnection } = require('./config/database');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');

const app = express();
const PORT = Number(process.env.PORT || 3000);
const isProduction = process.env.NODE_ENV === 'production';

if (!process.env.SESSION_SECRET || process.env.SESSION_SECRET.length < 32) {
  throw new Error('SESSION_SECRET must be set in .env and contain at least 32 characters.');
}
for (const key of ['DB_HOST', 'DB_USER', 'DB_NAME']) {
  if (!process.env[key]) throw new Error(`${key} must be configured in .env.`);
}

app.disable('x-powered-by');
app.use(helmet({
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      styleSrc: ["'self'", 'https://fonts.googleapis.com', "'unsafe-inline'"],
      fontSrc: ["'self'", 'https://fonts.gstatic.com', 'data:'],
      scriptSrc: ["'self'"],
      imgSrc: ["'self'", 'data:'],
      connectSrc: ["'self'"]
    }
  }
}));
app.use(express.json({ limit: '20kb' }));
app.use(express.urlencoded({ extended: false, limit: '20kb' }));

const MySQLStore = MySQLStoreFactory(session);
const sessionStore = new MySQLStore({
  host: process.env.DB_HOST,
  port: Number(process.env.DB_PORT || 3306),
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  createDatabaseTable: true,
  clearExpired: true,
  checkExpirationInterval: 15 * 60 * 1000,
  expiration: 7 * 24 * 60 * 60 * 1000
});

app.use(session({
  name: 'admin.sid',
  secret: process.env.SESSION_SECRET,
  store: sessionStore,
  resave: false,
  saveUninitialized: false,
  cookie: {
    httpOnly: true,
    secure: isProduction,
    sameSite: 'lax',
    maxAge: 24 * 60 * 60 * 1000
  }
}));

app.use('/api/auth', authRoutes);
app.use('/api/admin', adminRoutes);

// Server-side page gate: the dashboard HTML itself is not served to logged-out visitors.
app.get('/admin/dashboard', (req, res) => {
  if (!req.session || !req.session.user) return res.redirect('/login');
  res.sendFile(path.join(__dirname, '..', 'public', 'dashboard.html'));
});

app.get('/admin/users', (req, res) => {
  if (!req.session || !req.session.user) return res.redirect('/login');
  if (req.session.user.role !== 'admin') return res.status(403).sendFile(path.join(__dirname, '..', 'public', 'forbidden.html'));
  res.sendFile(path.join(__dirname, '..', 'public', 'users.html'));
});

app.get('/login', (req, res) => {
  if (req.session && req.session.user) return res.redirect('/admin/dashboard');
  res.sendFile(path.join(__dirname, '..', 'public', 'login.html'));
});
app.get('/signup', (req, res) => {
  if (req.session && req.session.user) return res.redirect('/admin/dashboard');
  res.sendFile(path.join(__dirname, '..', 'public', 'signup.html'));
});
app.get('/', (req, res) => res.redirect(req.session && req.session.user ? '/admin/dashboard' : '/login'));

app.use(express.static(path.join(__dirname, '..', 'public'), {
  index: false,
  dotfiles: 'ignore',
  extensions: ['html']
}));

app.use((req, res) => {
  if (req.path.startsWith('/api/')) return res.status(404).json({ message: 'API route not found.' });
  res.status(404).sendFile(path.join(__dirname, '..', 'public', '404.html'));
});

app.use((error, req, res, next) => {
  console.error(error);
  if (res.headersSent) return next(error);
  res.status(500).json({
    message: isProduction ? 'An unexpected server error occurred.' : (error.message || 'Internal server error.')
  });
});

async function start() {
  await testDatabaseConnection();
  app.listen(PORT, () => {
    console.log(`Admin Panel running at http://localhost:${PORT}`);
    console.log('Press CTRL+C to stop the server.');
  });
}

start().catch((error) => {
  console.error('Could not start the application:', error.message);
  process.exit(1);
});
