import dns from 'dns';
import mongoose from 'mongoose';

// Ensure Windows resolves MongoDB Atlas SRV records properly
try {
  dns.setServers(['8.8.8.8', '1.1.1.1']);
} catch (e) {
  // Ignore if permissions or platform restricts
}

// Mongoose Schema Definitions for MongoDB Atlas
const ProductSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  sku: { type: String, required: true, unique: true },
  price: { type: Number, required: true },
  regularPrice: { type: Number },
  category: { type: String, default: '' },
  shortDescription: { type: String, default: '' },
  description: { type: String, default: '' },
  stockStatus: { type: String, default: 'instock' },
  stockQuantity: { type: Number, default: 0 },
  status: { type: String, default: 'draft' },
  attributes: [{
    name: String,
    options: [String]
  }],
  qualityScore: { type: Number, default: 0 },
  issues: [{
    code: String,
    label: String,
    severity: String,
    penalty: Number
  }],
  syncStatus: { type: String, default: 'not_synced' },
  wooId: { type: Number, default: null },
  lastSyncedAt: { type: String, default: null }
}, { timestamps: true });

const ProposalSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  productId: { type: String, required: true },
  productName: { type: String, required: true },
  sku: { type: String, required: true },
  currentScore: { type: Number },
  projectedScore: { type: Number },
  changes: { type: mongoose.Schema.Types.Mixed },
  reasoning: { type: String },
  status: { type: String, default: 'pending' },
  rejectionReason: { type: String },
  resolvedAt: { type: String }
}, { timestamps: true });

const LogSchema = new mongoose.Schema({
  id: { type: String, required: true, unique: true },
  action: { type: String, required: true },
  details: { type: String, required: true },
  status: { type: String, default: 'info' },
  metadata: { type: mongoose.Schema.Types.Mixed },
  timestamp: { type: String, required: true }
});

const SettingSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: { type: mongoose.Schema.Types.Mixed }
});

export const MongoProduct = mongoose.models.Product || mongoose.model('Product', ProductSchema);
export const MongoProposal = mongoose.models.Proposal || mongoose.model('Proposal', ProposalSchema);
export const MongoLog = mongoose.models.Log || mongoose.model('Log', LogSchema);
export const MongoSetting = mongoose.models.Setting || mongoose.model('Setting', SettingSchema);

export class MongoAtlasService {
  static isConnected = false;
  static connectionUri = '';
  static connectionError = null;

  static async connect(uri) {
    if (!uri) {
      this.isConnected = false;
      return { connected: false, message: 'No MongoDB Atlas URI provided' };
    }

    try {
      this.connectionUri = uri;
      // Disconnect existing if any
      if (mongoose.connection.readyState !== 0) {
        await mongoose.disconnect();
      }

      await mongoose.connect(uri, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 8000
      });

      this.isConnected = true;
      this.connectionError = null;
      console.log(`[SmartPIM DB] Successfully connected to MongoDB Atlas!`);
      return { connected: true, message: 'Connected to MongoDB Atlas' };
    } catch (err) {
      this.isConnected = false;
      this.connectionError = err.message;
      console.warn(`[SmartPIM DB] MongoDB Atlas connection warning: ${err.message}. Operating in Local Persistent JSON storage.`);
      return { connected: false, error: err.message };
    }
  }

  static getStatus() {
    return {
      connected: this.isConnected,
      readyState: mongoose.connection.readyState, // 0: disconnected, 1: connected, 2: connecting
      dbType: this.isConnected ? 'MongoDB Atlas (Cloud Cluster)' : 'Local Persistent Storage (JSON)',
      error: this.connectionError
    };
  }
}
