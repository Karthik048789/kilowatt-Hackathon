import 'dotenv/config';
import dns from 'dns';
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {}

import express from 'express';
import cors from 'cors';
import productsRouter from './routes/products.js';
import agentRouter from './routes/agent.js';
import woocommerceRouter from './routes/woocommerce.js';
import logsRouter from './routes/logs.js';
import settingsRouter from './routes/settings.js';

const app = express();
const PORT = process.env.PORT || 5000;

// Enable CORS for frontend
app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '2mb' }));

// API Routes
app.use('/api/products', productsRouter);
app.use('/api/agent', agentRouter);
app.use('/api/woocommerce', woocommerceRouter);
app.use('/api/logs', logsRouter);
app.use('/api/settings', settingsRouter);

// Root endpoint: Sleek API Welcome Dashboard
app.get('/', (req, res) => {
  if (req.accepts('html')) {
    res.send(`
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>SmartPIM AI — Backend API</title>
        <style>
          body {
            margin: 0;
            padding: 40px;
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
            background: #0b0f17;
            color: #f1f5f9;
            display: flex;
            justify-content: center;
            align-items: center;
            min-height: 80vh;
          }
          .card {
            background: #111827;
            border: 1px solid rgba(255,255,255,0.1);
            border-radius: 20px;
            padding: 36px;
            max-width: 650px;
            width: 100%;
            box-shadow: 0 20px 40px rgba(0,0,0,0.5);
          }
          .badge {
            display: inline-flex;
            align-items: center;
            gap: 6px;
            background: rgba(16, 185, 129, 0.15);
            color: #34d399;
            border: 1px solid rgba(16, 185, 129, 0.3);
            padding: 4px 12px;
            border-radius: 9999px;
            font-size: 12px;
            font-weight: 600;
          }
          .dot { width: 8px; height: 8px; background: #10b981; border-radius: 50%; }
          h1 { margin: 16px 0 8px; font-size: 24px; font-weight: 700; color: #fff; }
          p { margin: 0 0 24px; color: #94a3b8; font-size: 14px; line-height: 1.6; }
          .btn-primary {
            display: inline-block;
            background: linear-gradient(135deg, #10b981, #059669);
            color: #fff;
            text-decoration: none;
            padding: 12px 24px;
            border-radius: 12px;
            font-size: 14px;
            font-weight: 600;
            box-shadow: 0 4px 14px rgba(16, 185, 129, 0.3);
            margin-bottom: 24px;
          }
          .endpoints {
            border-top: 1px solid #1f2937;
            padding-top: 20px;
          }
          .endpoints h3 { font-size: 12px; text-transform: uppercase; color: #64748b; margin: 0 0 12px; letter-spacing: 0.05em; }
          .endpoint-list { list-style: none; padding: 0; margin: 0; display: grid; grid-template-columns: 1fr 1fr; gap: 8px; }
          .endpoint-list a {
            display: block;
            background: #1e293b;
            color: #38bdf8;
            text-decoration: none;
            padding: 8px 12px;
            border-radius: 8px;
            font-family: monospace;
            font-size: 12px;
            border: 1px solid #334155;
            transition: all 0.2s;
          }
          .endpoint-list a:hover { background: #334155; color: #fff; }
        </style>
      </head>
      <body>
        <div class="card">
          <div class="badge">
            <span class="dot"></span>
            <span>BACKEND API OPERATIONAL & ONLINE</span>
          </div>
          <h1>SmartPIM AI Backend Server</h1>
          <p>
            The Node.js & Express REST API server is running on <strong>Port 5000</strong> with active <strong>MongoDB Atlas</strong> integration and <strong>Agentic AI Tool Dispatcher</strong>.
          </p>
          <a href="http://localhost:3000" class="btn-primary">
            🚀 Open Frontend Dashboard (Port 3000) &rarr;
          </a>
          <div class="endpoints">
            <h3>Available REST API Endpoints</h3>
            <div class="endpoint-list">
              <a href="/api/health" target="_blank">GET /api/health</a>
              <a href="/api/products" target="_blank">GET /api/products</a>
              <a href="/api/products/stats" target="_blank">GET /api/products/stats</a>
              <a href="/api/settings" target="_blank">GET /api/settings</a>
              <a href="/api/agent/proposals" target="_blank">GET /api/agent/proposals</a>
              <a href="/api/logs" target="_blank">GET /api/logs</a>
            </div>
          </div>
        </div>
      </body>
      </html>
    `);
  } else {
    res.json({
      status: 'ok',
      service: 'SmartPIM AI Backend API',
      version: '1.0.0',
      frontendUrl: 'http://localhost:3000',
      endpoints: [
        '/api/health',
        '/api/products',
        '/api/products/stats',
        '/api/agent/chat',
        '/api/agent/proposals',
        '/api/woocommerce/status',
        '/api/settings',
        '/api/logs'
      ]
    });
  }
});

// Health check endpoint
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ok',
    service: 'SmartPIM AI Backend',
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// Global error handling middleware
app.use((err, req, res, next) => {
  if (err instanceof SyntaxError && err.status === 400 && 'body' in err) {
    return res.status(400).json({ error: 'Malformed JSON payload.' });
  }
  const status = err.status || err.statusCode || 500;
  res.status(status).json({
    error: err.message || 'Internal Server Error'
  });
});

app.listen(PORT, () => {
  console.log(`[SmartPIM AI Backend] Server running on http://localhost:${PORT}`);
});
