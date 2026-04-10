import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import path from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

import connectDB from './DB/connection.js';
import UserRoute from './route/User.route.js';
import cartRoutes from './route/cart.routes.js';
import subCategoryRouter from './route/subCategory.routes.js';
import orderRouter from './route/order.routes.js';
import categoryRouter from './route/category.routes.js';
import addressRouter from './route/address.routes.js';
import productRouter from './route/product.routes.js';
import couponRouter from './route/coupon.route.js';
import imageUplodeRouter from './route/image_uplode.routes.js';
import routes from './route/paymentRoutes.js';
import reviewRouter from './route/review.routes.js';

dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const app = express();

// ─── Gzip Compression ───────────────────────────────────────────────────────
// Compress all responses — improves load time significantly for JS/CSS/JSON
app.use(compression());

// ─── Security Headers (Helmet) ───────────────────────────────────────────────
// connectSrc: "'self'" covers same-origin API calls in both dev and production.
// No hardcoded localhost URLs — this works on Cloudflare/any domain.
app.use(helmet({
  crossOriginResourcePolicy: { policy: 'cross-origin' },
  contentSecurityPolicy: {
    directives: {
      defaultSrc: ["'self'"],
      scriptSrc:  ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
      styleSrc:   ["'self'", "'unsafe-inline'"],
      imgSrc:     ["'self'", 'data:', 'https:'],
      connectSrc: ["'self'"],  // same-origin — works on any domain
    },
  },
}));

// ─── Body Parsers ────────────────────────────────────────────────────────────
app.use(express.json());
app.use(cookieParser());
app.use(morgan('dev'));

// ─── CORS ────────────────────────────────────────────────────────────────────
// Using origin: true reflects the request's own Origin header back.
// This means any origin (localhost:3000 in dev, Cloudflare URL in prod) is
// accepted — but ONLY if the request includes credentials, matching the same-
// origin policy. No hardcoded URLs needed.
app.use(cors({
  origin: true,
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization'],
}));

// ─── Static Uploads ──────────────────────────────────────────────────────────
// Serve uploaded files (images) — accessible at /uploads/...
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

// ─── API Routes ──────────────────────────────────────────────────────────────
console.log('Registering API routes...');

app.get('/', (req, res) => {
  // In production, React handles the root — this is a sanity check for API-only testing
  res.json({ message: 'NexaMart API is running. Frontend served separately.' });
});

// Auth / Users
app.use('/api/user', UserRoute);

// Store routes
app.use('/api/category',     categoryRouter);
app.use('/api/sub-category', subCategoryRouter);
app.use('/api/product',      productRouter);
app.use('/api/cart',         cartRoutes);
app.use('/api/order',        orderRouter);
app.use('/api/address',      addressRouter);
app.use('/api/coupon',       couponRouter);
app.use('/api/reviews',      reviewRouter);
app.use('/api/image-upload', imageUplodeRouter);
app.use('/api/payment',      routes);

// Admin routes
app.use('/api/admin/users', UserRoute);

console.log('All API routes registered.');

// ─── Serve React Frontend Build ───────────────────────────────────────────────
// In production (and when using Cloudflare Tunnel), Express serves the React
// build so both API and frontend are on the same origin (port 5000).
// Run `cd Frontend && npm run build` before starting the server.
const frontendBuild = path.join(__dirname, '../Frontend/build');
app.use(express.static(frontendBuild));

// SPA fallback — any route not matched by /api/* sends back index.html
// React Router handles the client-side routing from there.
app.get('*', (req, res) => {
  res.sendFile(path.resolve(frontendBuild, 'index.html'));
});

// ─── Global Error Handler ────────────────────────────────────────────────────
app.use((err, req, res, next) => {
  console.error('Unhandled error:', err);
  res.status(500).json({
    message: 'Internal Server Error',
    error: process.env.NODE_ENV === 'development' ? err.message : undefined,
  });
});

// ─── Start Server ────────────────────────────────────────────────────────────
const PORT = process.env.PORT || 5000;

connectDB()
  .then(() => {
    console.log('Database connected successfully');
    app.listen(PORT, () => {
      console.log('==============================================');
      console.log('  NexaMart Server');
      console.log(`  Port    : ${PORT}`);
      console.log(`  Mode    : ${process.env.NODE_ENV || 'production'}`);
      console.log(`  API     : http://localhost:${PORT}/api`);
      console.log(`  Frontend: http://localhost:${PORT}`);
      console.log('  Cloudflare: cloudflared tunnel --url http://localhost:' + PORT);
      console.log('==============================================');
    });
  })
  .catch(err => {
    console.error('Database connection failed:', err);
    process.exit(1);
  });
