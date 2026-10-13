import express from 'express';
import { db } from '../db.js';

const router = express.Router();

function maskSecret(str) {
  if (!str) return '';
  if (str.length <= 8) return '********';
  return str.slice(0, 4) + '...' + str.slice(-4);
}

function maskMongoUri(uri) {
  if (!uri) return '';
  try {
    return uri.replace(/:([^@]+)@/, ':••••••••@');
  } catch (e) {
    return maskSecret(uri);
  }
}

// GET /api/settings
router.get('/', (req, res) => {
  try {
    const s = db.getSettings();
    const dbStatus = db.getDbStatus();

    res.json({
      wooCommerceUrl: s.wooCommerceUrl || '',
      consumerKey: maskSecret(s.consumerKey),
      hasConsumerSecret: Boolean(s.consumerSecret),
      demoMode: s.demoMode !== false,
      aiProvider: s.aiProvider || 'gemini',
      hasGeminiApiKey: Boolean(s.geminiApiKey || process.env.GEMINI_API_KEY),
      hasOpenaiApiKey: Boolean(s.openaiApiKey || process.env.OPENAI_API_KEY),
      mongoUri: maskMongoUri(s.mongoUri || process.env.MONGODB_URI),
      hasMongoUri: Boolean(s.mongoUri || process.env.MONGODB_URI),
      dbStatus
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/settings/test-mongo
router.post('/test-mongo', async (req, res) => {
  try {
    const { mongoUri } = req.body;
    const uriToTest = mongoUri && !mongoUri.includes('••••') 
      ? mongoUri.trim() 
      : (db.getSettings().mongoUri || process.env.MONGODB_URI);

    if (!uriToTest) {
      return res.status(400).json({ connected: false, error: 'No MongoDB URI provided to test' });
    }

    const result = await db.testMongoConnection(uriToTest);
    res.json(result);
  } catch (err) {
    res.status(500).json({ connected: false, error: err.message });
  }
});

// PUT /api/settings
router.put('/', async (req, res) => {
  try {
    const { wooCommerceUrl, consumerKey, consumerSecret, demoMode, aiProvider, geminiApiKey, openaiApiKey, mongoUri } = req.body;
    const current = db.getSettings();

    const updates = {};
    if (wooCommerceUrl !== undefined) updates.wooCommerceUrl = wooCommerceUrl.trim();
    if (consumerKey !== undefined && consumerKey && !consumerKey.includes('...')) updates.consumerKey = consumerKey.trim();
    if (consumerSecret !== undefined && consumerSecret) updates.consumerSecret = consumerSecret.trim();
    if (demoMode !== undefined) updates.demoMode = Boolean(demoMode);
    if (aiProvider !== undefined) updates.aiProvider = aiProvider;
    if (geminiApiKey !== undefined && geminiApiKey) updates.geminiApiKey = geminiApiKey.trim();
    if (openaiApiKey !== undefined && openaiApiKey) updates.openaiApiKey = openaiApiKey.trim();
    if (mongoUri !== undefined && mongoUri && !mongoUri.includes('••••')) {
      updates.mongoUri = mongoUri.trim();
      // Try connecting to new MongoDB Atlas URI
      await db.testMongoConnection(mongoUri.trim());
    }

    const updated = db.updateSettings(updates);
    const dbStatus = db.getDbStatus();

    res.json({
      success: true,
      message: 'Settings updated successfully.',
      settings: {
        wooCommerceUrl: updated.wooCommerceUrl,
        consumerKey: maskSecret(updated.consumerKey),
        hasConsumerSecret: Boolean(updated.consumerSecret),
        demoMode: updated.demoMode,
        aiProvider: updated.aiProvider,
        hasGeminiApiKey: Boolean(updated.geminiApiKey || process.env.GEMINI_API_KEY),
        hasOpenaiApiKey: Boolean(updated.openaiApiKey || process.env.OPENAI_API_KEY),
        mongoUri: maskMongoUri(updated.mongoUri || process.env.MONGODB_URI),
        hasMongoUri: Boolean(updated.mongoUri || process.env.MONGODB_URI),
        dbStatus
      }
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
