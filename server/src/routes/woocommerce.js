import express from 'express';
import { WooCommerceService } from '../services/woocommerceService.js';
import { db } from '../db.js';

const router = express.Router();

// GET /api/woocommerce/status
router.get('/status', async (req, res) => {
  try {
    const status = await WooCommerceService.testConnection();
    res.json(status);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/woocommerce/sync/:productId
router.post('/sync/:productId', async (req, res) => {
  try {
    const result = await WooCommerceService.syncProduct(req.params.productId);
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/woocommerce/sync-all
router.post('/sync-all', async (req, res) => {
  try {
    const products = db.getProducts();
    const ready = products.filter(p => p.qualityScore >= 80 && p.name && p.sku && Number(p.price) > 0);
    const results = [];
    const errors = [];

    for (const p of ready) {
      try {
        const syncRes = await WooCommerceService.syncProduct(p.id);
        results.push(syncRes);
      } catch (err) {
        errors.push({ productId: p.id, productName: p.name, error: err.message });
      }
    }

    res.json({
      totalCandidate: ready.length,
      syncedCount: results.length,
      errorsCount: errors.length,
      results,
      errors
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/woocommerce/import
router.post('/import', async (req, res) => {
  try {
    const result = await WooCommerceService.fetchFromWooCommerce();
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
