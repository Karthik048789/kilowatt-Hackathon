import express from 'express';
import { db } from '../db.js';

const router = express.Router();

// GET /api/logs
router.get('/', (req, res) => {
  try {
    const rawLimit = parseInt(req.query.limit);
    const limit = !isNaN(rawLimit) && rawLimit > 0 ? Math.min(rawLimit, 500) : 100;
    const logs = db.getLogs(limit);
    res.json(logs);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
