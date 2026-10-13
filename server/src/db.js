import 'dotenv/config';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { v4 as uuidv4 } from 'uuid';
import { MongoAtlasService, MongoProduct, MongoProposal, MongoLog, MongoSetting } from './mongo.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const DATA_DIR = path.resolve(__dirname, '../data');
const DB_PATH = path.join(DATA_DIR, 'pim_database.json');

// Ensure data directory exists
if (!fs.existsSync(DATA_DIR)) {
  fs.mkdirSync(DATA_DIR, { recursive: true });
}

export function auditProduct(product) {
  const issues = [];
  let score = 100;

  if (!product.name || product.name.trim().length === 0) {
    issues.push({ code: 'MISSING_NAME', label: 'Missing product title', severity: 'critical', penalty: 30 });
    score -= 30;
  }
  if (!product.sku || product.sku.trim().length === 0) {
    issues.push({ code: 'MISSING_SKU', label: 'Missing SKU identifier', severity: 'critical', penalty: 25 });
    score -= 25;
  }
  if (product.price === undefined || product.price === null || Number(product.price) <= 0) {
    issues.push({ code: 'INVALID_PRICE', label: 'Price is zero or invalid', severity: 'critical', penalty: 25 });
    score -= 25;
  }
  if (!product.description || product.description.trim().length === 0) {
    issues.push({ code: 'MISSING_DESCRIPTION', label: 'Missing product description', severity: 'high', penalty: 25 });
    score -= 25;
  } else if (product.description.trim().length < 50) {
    issues.push({ code: 'SHORT_DESCRIPTION', label: 'Description is too brief (< 50 characters)', severity: 'medium', penalty: 15 });
    score -= 15;
  }
  if (!product.category || product.category.trim().length === 0 || product.category.toLowerCase() === 'uncategorized') {
    issues.push({ code: 'MISSING_CATEGORY', label: 'Missing or uncategorized classification', severity: 'high', penalty: 20 });
    score -= 20;
  }
  if (!product.attributes || product.attributes.length === 0) {
    issues.push({ code: 'MISSING_ATTRIBUTES', label: 'Missing technical specifications / attributes', severity: 'low', penalty: 10 });
    score -= 10;
  }

  score = Math.max(0, Math.min(100, score));
  return { score, issues };
}

const DEFAULT_PRODUCTS = [
  {
    id: 'prod_1',
    name: 'Aurora Smart Ambient LED Strip (5M)',
    sku: 'AUR-LGT-5M',
    price: 49.99,
    regularPrice: 59.99,
    category: 'Smart Home & Lighting',
    shortDescription: 'App-controlled RGBIC ambient lighting strip with music synchronization.',
    description: 'Transform your living space with the Aurora 5M Smart LED Strip. Features individually addressable RGBIC LEDs, seamless voice control with Alexa and Google Assistant, 16 million colors, and dynamic music sync modes. Easy peel-and-stick installation suitable for TVs, desks, and ceilings.',
    stockStatus: 'instock',
    stockQuantity: 150,
    status: 'publish',
    attributes: [
      { name: 'Length', options: ['5 Meters'] },
      { name: 'Connectivity', options: ['Wi-Fi 2.4GHz', 'Bluetooth 5.0'] },
      { name: 'Color Tech', options: ['RGBIC Addressable'] }
    ],
    syncStatus: 'synced',
    wooId: 1024,
    lastSyncedAt: new Date(Date.now() - 3600000 * 4).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 4).toISOString()
  },
  {
    id: 'prod_2',
    name: 'ErgoPro Ultra-Mesh Ergonomic Desk Chair',
    sku: 'ERG-CHR-BLK',
    price: 289.00,
    regularPrice: 329.00,
    category: 'Office & Furniture',
    shortDescription: 'High-performance breathable mesh ergonomic task chair with 4D armrests.',
    description: 'Engineered for all-day comfort and spine alignment. The ErgoPro chair features full Korean elastomeric breathable mesh, dynamic self-adjusting lumbar support, 4D multi-directional armrests, and a heavy-duty aluminum wheelbase tested up to 300 lbs.',
    stockStatus: 'instock',
    stockQuantity: 42,
    status: 'publish',
    attributes: [
      { name: 'Material', options: ['Breathable Elastomer Mesh', 'Aluminum'] },
      { name: 'Weight Capacity', options: ['300 lbs / 136 kg'] },
      { name: 'Warranty', options: ['5 Years'] }
    ],
    syncStatus: 'synced',
    wooId: 1025,
    lastSyncedAt: new Date(Date.now() - 3600000 * 12).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 4).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 12).toISOString()
  },
  {
    id: 'prod_3',
    name: 'SonicPulse Active Noise Cancelling Earbuds',
    sku: 'AUD-EAR-ANC',
    price: 79.99,
    regularPrice: 99.99,
    category: '', // MISSING CATEGORY INTENTIONALLY
    shortDescription: 'Compact wireless earbuds with ANC.',
    description: 'Good earbuds with sound.', // SHORT/POOR DESCRIPTION INTENTIONALLY
    stockStatus: 'instock',
    stockQuantity: 88,
    status: 'draft',
    attributes: [], // MISSING ATTRIBUTES INTENTIONALLY
    syncStatus: 'not_synced',
    wooId: null,
    lastSyncedAt: null,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
  },
  {
    id: 'prod_4',
    name: 'HyperCharge 65W GaN Dual-Port Travel Charger',
    sku: 'PWR-GAN-65W',
    price: 34.50,
    regularPrice: 39.99,
    category: 'Electronics & Accessories',
    shortDescription: 'Pocket-sized GaN III fast charger with USB-C and USB-A ports.',
    description: '', // MISSING DESCRIPTION INTENTIONALLY
    stockStatus: 'instock',
    stockQuantity: 210,
    status: 'draft',
    attributes: [
      { name: 'Max Power', options: ['65W Total'] },
      { name: 'Ports', options: ['1x USB-C PD 3.0', '1x USB-A QC 4.0'] }
    ],
    syncStatus: 'pending',
    wooId: null,
    lastSyncedAt: null,
    createdAt: new Date(Date.now() - 86400000 * 1).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 1).toISOString()
  },
  {
    id: 'prod_5',
    name: 'HydroFlow Insulated Stainless Steel Bottle (1L)',
    sku: 'HYD-BTL-1L',
    price: 24.95,
    regularPrice: 29.95,
    category: 'Uncategorized', // UNCATEGORIZED INTENTIONALLY
    shortDescription: 'Vacuum insulated sports water bottle.',
    description: 'Durable double-wall 18/8 food-grade stainless steel flask keeps beverages cold for 24 hours or piping hot for 12 hours. Sweat-free powder coat finish with leak-proof spout lid.',
    stockStatus: 'instock',
    stockQuantity: 310,
    status: 'publish',
    attributes: [], // MISSING ATTRIBUTES INTENTIONALLY
    syncStatus: 'not_synced',
    wooId: null,
    lastSyncedAt: null,
    createdAt: new Date(Date.now() - 86400000 * 3).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 3).toISOString()
  },
  {
    id: 'prod_6',
    name: 'Quantum Pro Mechanical Keyboard RGB',
    sku: 'KEY-MECH-PRO',
    price: 0, // INVALID PRICE INTENTIONALLY
    regularPrice: 0,
    category: 'Computer Peripherals',
    shortDescription: 'Compact 75% hot-swappable keyboard.',
    description: '', // MISSING DESCRIPTION INTENTIONALLY
    stockStatus: 'instock',
    stockQuantity: 50,
    status: 'draft',
    attributes: [
      { name: 'Layout', options: ['75% Compact (84 Keys)'] },
      { name: 'Switches', options: ['Gateron Pro Yellow (Hot-Swappable)'] }
    ],
    syncStatus: 'failed',
    wooId: null,
    lastSyncedAt: null,
    createdAt: new Date(Date.now() - 86400000 * 5).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 5).toISOString()
  },
  {
    id: 'prod_7',
    name: 'AeroGlide Featherlight Trail Running Shoes',
    sku: 'SHOE-TRAIL-01',
    price: 119.00,
    regularPrice: 139.00,
    category: 'Footwear & Athletics',
    shortDescription: 'All-terrain lightweight trail runners with responsive carbon-plate cushioning.',
    description: 'Conquer tough terrain with the AeroGlide Trail Runners. Engineered with a rugged Vibram Megagrip lug outsole, water-resistant ripstop mesh upper, and high-rebound supercritical foam midsole for responsive propulsion across mud, gravel, and mountain trails.',
    stockStatus: 'instock',
    stockQuantity: 65,
    status: 'publish',
    attributes: [
      { name: 'Terrain', options: ['Trail', 'Mountain', 'Mixed'] },
      { name: 'Drop', options: ['6mm'] },
      { name: 'Weight', options: ['245g (Size 9)'] }
    ],
    syncStatus: 'synced',
    wooId: 1026,
    lastSyncedAt: new Date(Date.now() - 3600000 * 8).toISOString(),
    createdAt: new Date(Date.now() - 86400000 * 6).toISOString(),
    updatedAt: new Date(Date.now() - 3600000 * 8).toISOString()
  },
  {
    id: 'prod_8',
    name: 'Nordic Minimalist Solid Oak Coffee Table',
    sku: 'FUR-TBL-OAK',
    price: 219.00,
    regularPrice: 249.00,
    category: 'Home & Living',
    shortDescription: 'Scandinavian handcrafted natural white oak living room table.',
    description: '', // MISSING DESCRIPTION INTENTIONALLY
    stockStatus: 'outofstock',
    stockQuantity: 0,
    status: 'draft',
    attributes: [
      { name: 'Material', options: ['Solid White Oak', 'Matte Lacquer'] },
      { name: 'Dimensions', options: ['110cm x 60cm x 42cm'] }
    ],
    syncStatus: 'not_synced',
    wooId: null,
    lastSyncedAt: null,
    createdAt: new Date(Date.now() - 86400000 * 2).toISOString(),
    updatedAt: new Date(Date.now() - 86400000 * 2).toISOString()
  }
];

class Database {
  constructor() {
    this.init();
    this.initMongo();
  }

  init() {
    if (!fs.existsSync(DB_PATH)) {
      const seededProducts = DEFAULT_PRODUCTS.map(p => {
        const audit = auditProduct(p);
        return {
          ...p,
          qualityScore: audit.score,
          issues: audit.issues
        };
      });

      const initialData = {
        products: seededProducts,
        proposals: [],
        logs: [
          {
            id: 'log_init',
            action: 'SYSTEM_INITIALIZATION',
            details: 'SmartPIM AI database initialized with 8 sample products.',
            status: 'success',
            timestamp: new Date().toISOString()
          }
        ],
        settings: {
          wooCommerceUrl: process.env.WOOCOMMERCE_URL || '',
          consumerKey: process.env.WOOCOMMERCE_CONSUMER_KEY || '',
          consumerSecret: process.env.WOOCOMMERCE_CONSUMER_SECRET || '',
          demoMode: true,
          aiProvider: 'gemini', // 'gemini' | 'openai' | 'local_agent'
          geminiApiKey: process.env.GEMINI_API_KEY || '',
          openaiApiKey: process.env.OPENAI_API_KEY || '',
          mongoUri: process.env.MONGODB_URI || ''
        }
      };

      fs.writeFileSync(DB_PATH, JSON.stringify(initialData, null, 2), 'utf-8');
    }
  }

  async initMongo() {
    try {
      const s = this.getSettings();
      const uri = process.env.MONGODB_URI || s.mongoUri;
      if (uri) {
        await MongoAtlasService.connect(uri);
        if (MongoAtlasService.isConnected) {
          const count = await MongoProduct.countDocuments();
          if (count === 0) {
            const prods = this.getProducts();
            await MongoProduct.insertMany(prods);
            console.log(`[SmartPIM DB] Seeded ${prods.length} products to MongoDB Atlas.`);
          }
        }
      }
    } catch (err) {
      console.warn('MongoDB Atlas initialization warning:', err.message);
    }
  }

  getDbStatus() {
    return MongoAtlasService.getStatus();
  }

  async testMongoConnection(uri) {
    return await MongoAtlasService.connect(uri);
  }

  read() {
    try {
      if (!fs.existsSync(DB_PATH)) {
        this.init();
      }
      const raw = fs.readFileSync(DB_PATH, 'utf-8');
      return JSON.parse(raw);
    } catch (err) {
      console.error('Error reading database:', err);
      return { products: [], proposals: [], logs: [], settings: {} };
    }
  }

  write(data) {
    try {
      fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2), 'utf-8');
      return true;
    } catch (err) {
      console.error('Error writing database:', err);
      return false;
    }
  }

  // --- Products ---
  getProducts() {
    const data = this.read();
    return data.products || [];
  }

  getProductById(id) {
    const products = this.getProducts();
    return products.find(p => p.id === id);
  }

  createProduct(productData) {
    const data = this.read();
    const existing = data.products.find(p => p.sku.toLowerCase() === productData.sku.toLowerCase().trim());
    if (existing) {
      throw new Error(`Duplicate SKU: A product with SKU "${productData.sku}" already exists.`);
    }

    const audit = auditProduct(productData);
    const newProduct = {
      ...productData,
      id: `prod_${uuidv4().slice(0, 8)}`,
      price: Number(productData.price) || 0,
      regularPrice: productData.regularPrice ? Number(productData.regularPrice) : Number(productData.price) || 0,
      stockQuantity: Number(productData.stockQuantity) || 0,
      stockStatus: productData.stockStatus || 'instock',
      status: productData.status || 'draft',
      attributes: Array.isArray(productData.attributes) ? productData.attributes : [],
      qualityScore: audit.score,
      issues: audit.issues,
      syncStatus: 'not_synced',
      wooId: null,
      lastSyncedAt: null,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString()
    };

    data.products.unshift(newProduct);
    this.addLog('PRODUCT_CREATED', `Created product "${newProduct.name}" (SKU: ${newProduct.sku})`, 'success', { productId: newProduct.id });
    this.write(data);

    // Sync new product to MongoDB Atlas
    if (MongoAtlasService.isConnected) {
      MongoProduct.findOneAndUpdate({ id: newProduct.id }, newProduct, { upsert: true })
        .catch(e => console.warn('Mongo createProduct sync err:', e.message));
    }

    return newProduct;
  }

  updateProduct(id, updates) {
    const data = this.read();
    const index = data.products.findIndex(p => p.id === id);
    if (index === -1) {
      throw new Error(`Product not found: ${id}`);
    }

    if (updates.sku) {
      const duplicate = data.products.find(p => p.id !== id && p.sku.toLowerCase() === updates.sku.toLowerCase().trim());
      if (duplicate) {
        throw new Error(`Duplicate SKU: Another product already uses SKU "${updates.sku}".`);
      }
    }

    const existing = data.products[index];
    const merged = {
      ...existing,
      ...updates,
      price: updates.price !== undefined ? Number(updates.price) : existing.price,
      regularPrice: updates.regularPrice !== undefined ? Number(updates.regularPrice) : existing.regularPrice,
      stockQuantity: updates.stockQuantity !== undefined ? Number(updates.stockQuantity) : existing.stockQuantity,
      updatedAt: new Date().toISOString()
    };

    const audit = auditProduct(merged);
    merged.qualityScore = audit.score;
    merged.issues = audit.issues;

    data.products[index] = merged;
    this.addLog('PRODUCT_UPDATED', `Updated product "${merged.name}" (SKU: ${merged.sku})`, 'success', { productId: merged.id });
    this.write(data);

    // Sync updated product to MongoDB Atlas
    if (MongoAtlasService.isConnected) {
      MongoProduct.findOneAndUpdate({ id: merged.id }, merged, { upsert: true })
        .catch(e => console.warn('Mongo updateProduct sync err:', e.message));
    }

    return merged;
  }

  deleteProduct(id) {
    const data = this.read();
    const target = data.products.find(p => p.id === id);
    if (!target) {
      throw new Error(`Product not found: ${id}`);
    }

    data.products = data.products.filter(p => p.id !== id);
    if (data.proposals) {
      data.proposals = data.proposals.filter(p => p.productId !== id);
    }
    this.addLog('PRODUCT_DELETED', `Deleted product "${target.name}" (SKU: ${target.sku})`, 'info', { productId: id });
    this.write(data);

    if (MongoAtlasService.isConnected) {
      MongoProduct.deleteOne({ id }).catch(e => console.warn('Mongo deleteProduct err:', e.message));
      MongoProposal.deleteMany({ productId: id }).catch(e => console.warn('Mongo deleteProposal cascade err:', e.message));
    }
    return true;
  }

  // --- Proposals (Staged AI Actions requiring approval) ---
  getProposals() {
    const data = this.read();
    return data.proposals || [];
  }

  saveProposals(newProposals) {
    const data = this.read();
    const newProductIds = new Set(newProposals.map(p => p.productId));
    // Filter out existing pending proposals for the same products to avoid duplicates
    const retained = (data.proposals || []).filter(
      p => !(newProductIds.has(p.productId) && p.status === 'pending')
    );
    data.proposals = [...newProposals, ...retained];
    this.write(data);

    if (MongoAtlasService.isConnected) {
      MongoProposal.deleteMany({
        productId: { $in: Array.from(newProductIds) },
        status: 'pending'
      }).catch(e => console.warn('Mongo saveProposals deduplicate err:', e.message));
      MongoProposal.insertMany(newProposals)
        .catch(e => console.warn('Mongo saveProposals sync err:', e.message));
    }
    return data.proposals;
  }

  approveProposal(proposalId) {
    const data = this.read();
    const proposal = (data.proposals || []).find(p => p.id === proposalId);
    if (!proposal) {
      throw new Error(`Proposal not found: ${proposalId}`);
    }

    // Apply the fix to the product
    const product = data.products.find(p => p.id === proposal.productId);
    if (!product) {
      throw new Error(`Product referenced by proposal not found: ${proposal.productId}`);
    }

    const updated = {
      ...product,
      ...proposal.changes,
      updatedAt: new Date().toISOString()
    };
    const audit = auditProduct(updated);
    updated.qualityScore = audit.score;
    updated.issues = audit.issues;

    const prodIndex = data.products.findIndex(p => p.id === proposal.productId);
    data.products[prodIndex] = updated;

    // Mark proposal approved
    proposal.status = 'approved';
    proposal.resolvedAt = new Date().toISOString();

    this.addLog('PROPOSAL_APPROVED', `Applied AI proposal for "${product.name}": updated ${Object.keys(proposal.changes).join(', ')}`, 'success', {
      proposalId,
      productId: product.id,
      scoreImprovement: `${product.qualityScore}% -> ${updated.qualityScore}%`
    });

    this.write(data);

    // Sync updated product and proposal to MongoDB Atlas
    if (MongoAtlasService.isConnected) {
      MongoProduct.findOneAndUpdate({ id: updated.id }, updated, { upsert: true })
        .catch(e => console.warn('Mongo approveProposal product sync err:', e.message));
      MongoProposal.findOneAndUpdate({ id: proposalId }, proposal, { upsert: true })
        .catch(e => console.warn('Mongo approveProposal proposal sync err:', e.message));
    }

    return { proposal, product: updated };
  }

  rejectProposal(proposalId, reason = 'User rejected') {
    const data = this.read();
    const proposal = (data.proposals || []).find(p => p.id === proposalId);
    if (!proposal) {
      throw new Error(`Proposal not found: ${proposalId}`);
    }

    proposal.status = 'rejected';
    proposal.rejectionReason = reason;
    proposal.resolvedAt = new Date().toISOString();

    this.addLog('PROPOSAL_REJECTED', `User rejected AI proposal ${proposalId} for product ${proposal.productName}`, 'warning', { proposalId });
    this.write(data);

    // Sync rejected proposal status to MongoDB Atlas
    if (MongoAtlasService.isConnected) {
      MongoProposal.findOneAndUpdate({ id: proposalId }, proposal, { upsert: true })
        .catch(e => console.warn('Mongo rejectProposal sync err:', e.message));
    }

    return proposal;
  }

  clearProposals() {
    const data = this.read();
    data.proposals = [];
    this.write(data);
    if (MongoAtlasService.isConnected) {
      MongoProposal.deleteMany({}).catch(e => console.warn('Mongo clearProposals sync err:', e.message));
    }
    return true;
  }

  // --- Logs ---
  getLogs(limit = 100) {
    const data = this.read();
    return (data.logs || []).slice(0, limit);
  }

  addLog(action, details, status = 'info', metadata = {}) {
    const data = this.read();
    const logEntry = {
      id: `log_${uuidv4().slice(0, 8)}`,
      action,
      details,
      status, // 'success' | 'warning' | 'error' | 'info'
      metadata,
      timestamp: new Date().toISOString()
    };
    if (!data.logs) data.logs = [];
    data.logs.unshift(logEntry);
    if (data.logs.length > 500) data.logs = data.logs.slice(0, 500);
    this.write(data);
    if (MongoAtlasService.isConnected) {
      MongoLog.create(logEntry).catch(e => console.warn('Mongo addLog sync err:', e.message));
    }
    return logEntry;
  }

  // --- Settings ---
  getSettings() {
    const data = this.read();
    return data.settings || {};
  }

  updateSettings(newSettings) {
    const data = this.read();
    data.settings = { ...data.settings, ...newSettings };
    this.write(data);
    this.addLog('SETTINGS_UPDATED', 'Updated integration settings and credentials', 'info');
    if (MongoAtlasService.isConnected) {
      MongoSetting.findOneAndUpdate(
        { key: 'app_settings' },
        { key: 'app_settings', value: data.settings },
        { upsert: true }
      ).catch(e => console.warn('Mongo updateSettings sync err:', e.message));
    }
    return data.settings;
  }

  resetDemoData() {
    const seededProducts = DEFAULT_PRODUCTS.map(p => {
      const audit = auditProduct(p);
      return {
        ...p,
        qualityScore: audit.score,
        issues: audit.issues
      };
    });

    const data = this.read();
    data.products = seededProducts;
    data.proposals = [];
    this.addLog('DEMO_RESET', 'Reset product catalogue to 8 sample products with intentional quality flaws for demonstration.', 'warning');
    this.write(data);

    if (MongoAtlasService.isConnected) {
      (async () => {
        try {
          await MongoProduct.deleteMany({});
          await MongoProposal.deleteMany({});
          await MongoProduct.insertMany(seededProducts);
          console.log('[SmartPIM DB] Synced reset demo products to MongoDB Atlas.');
        } catch (e) {
          console.warn('Mongo resetDemoData err:', e.message);
        }
      })();
    }

    return seededProducts;
  }
}

export const db = new Database();
