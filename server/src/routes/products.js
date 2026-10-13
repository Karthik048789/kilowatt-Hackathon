import express from 'express';
import { db, auditProduct } from '../db.js';

const router = express.Router();

// GET /api/products/stats
router.get('/stats', (req, res) => {
  try {
    const products = db.getProducts();
    const total = products.length;
    const published = products.filter(p => p.status === 'publish').length;
    const drafts = products.filter(p => p.status === 'draft').length;
    const needsAttention = products.filter(p => p.issues && p.issues.length > 0).length;
    const synced = products.filter(p => p.syncStatus === 'synced').length;
    const notSynced = products.filter(p => p.syncStatus === 'not_synced' || !p.syncStatus).length;
    const failedSync = products.filter(p => p.syncStatus === 'failed').length;
    const avgScore = total > 0 ? Math.round(products.reduce((acc, p) => acc + (p.qualityScore || 0), 0) / total) : 0;

    const proposals = db.getProposals();
    const pendingProposals = proposals.filter(p => p.status === 'pending').length;

    res.json({
      total,
      published,
      drafts,
      needsAttention,
      synced,
      notSynced,
      failedSync,
      avgScore,
      pendingProposals
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products
router.get('/', (req, res) => {
  try {
    const { search, category, status, syncStatus, needsAttention, page, limit } = req.query;
    let products = db.getProducts();

    if (search) {
      const q = search.toLowerCase();
      products = products.filter(p =>
        (p.name || '').toLowerCase().includes(q) ||
        (p.sku || '').toLowerCase().includes(q) ||
        (p.category && p.category.toLowerCase().includes(q))
      );
    }

    if (category) {
      products = products.filter(p => p.category === category);
    }

    if (status) {
      products = products.filter(p => p.status === status);
    }

    if (syncStatus) {
      products = products.filter(p => p.syncStatus === syncStatus);
    }

    if (needsAttention === 'true') {
      products = products.filter(p => p.issues && p.issues.length > 0);
    }

    const total = products.length;

    // Optional pagination
    if (page || limit) {
      const pageNum = Math.max(1, parseInt(page) || 1);
      const pageSize = Math.min(200, Math.max(1, parseInt(limit) || 50));
      const start = (pageNum - 1) * pageSize;
      products = products.slice(start, start + pageSize);
      return res.json({ total, page: pageNum, limit: pageSize, products });
    }

    res.json(products);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products/reset-demo  ← MUST be before /:id to avoid param collision
router.post('/reset-demo', (req, res) => {
  try {
    const products = db.resetDemoData();
    res.json({
      success: true,
      message: 'Demo catalogue reset: 8 products re-seeded with intentional quality defects for demonstration.',
      productsCount: products.length
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// GET /api/products/:id
router.get('/:id', (req, res) => {
  try {
    const product = db.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    res.json(product);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products
router.post('/', (req, res) => {
  try {
    const { name, sku, price, category, description, shortDescription, stockStatus, stockQuantity, status, attributes } = req.body;

    // Backend validations
    if (!name || name.trim().length === 0) {
      return res.status(400).json({ error: 'Validation Error: Product name is required.' });
    }
    if (!sku || sku.trim().length === 0) {
      return res.status(400).json({ error: 'Validation Error: SKU identifier is required.' });
    }
    if (price === undefined || price === null || isNaN(Number(price)) || Number(price) < 0) {
      return res.status(400).json({ error: 'Validation Error: Price must be a valid non-negative number.' });
    }

    const created = db.createProduct({
      name: name.trim(),
      sku: sku.trim().toUpperCase(),
      price: Number(price),
      regularPrice: req.body.regularPrice ? Number(req.body.regularPrice) : Number(price),
      category: category ? category.trim() : '',
      description: description ? description.trim() : '',
      shortDescription: shortDescription ? shortDescription.trim() : '',
      stockStatus: stockStatus || 'instock',
      stockQuantity: Number(stockQuantity) || 0,
      status: status || 'draft',
      attributes: Array.isArray(attributes) ? attributes : []
    });

    res.status(201).json(created);
  } catch (err) {
    if (err.message.includes('Duplicate SKU')) {
      return res.status(409).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

// PUT /api/products/:id
router.put('/:id', (req, res) => {
  try {
    const { name, sku, price } = req.body;

    if (name !== undefined && name.trim().length === 0) {
      return res.status(400).json({ error: 'Validation Error: Product name cannot be blank.' });
    }
    if (sku !== undefined && sku.trim().length === 0) {
      return res.status(400).json({ error: 'Validation Error: SKU cannot be blank.' });
    }
    if (price !== undefined && (isNaN(Number(price)) || Number(price) < 0)) {
      return res.status(400).json({ error: 'Validation Error: Price must be a non-negative number.' });
    }

    const updated = db.updateProduct(req.params.id, req.body);
    res.json(updated);
  } catch (err) {
    if (err.message.includes('Duplicate SKU')) {
      return res.status(409).json({ error: err.message });
    }
    if (err.message.includes('not found')) {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/products/:id
router.delete('/:id', (req, res) => {
  try {
    db.deleteProduct(req.params.id);
    res.json({ success: true, message: 'Product deleted successfully.' });
  } catch (err) {
    if (err.message.includes('not found')) {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

// POST /api/products/:id/audit
router.post('/:id/audit', (req, res) => {
  try {
    const product = db.getProductById(req.params.id);
    if (!product) {
      return res.status(404).json({ error: 'Product not found' });
    }
    const audit = auditProduct(product);
    const updated = db.updateProduct(req.params.id, {
      qualityScore: audit.score,
      issues: audit.issues
    });
    res.json({ audit, product: updated });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
