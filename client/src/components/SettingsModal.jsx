import React, { useState, useEffect } from 'react';
import { X, Sliders, ShieldCheck, Key, Globe, Cpu, Database, CheckCircle2, AlertCircle, RefreshCw } from 'lucide-react';
import { api } from '../api/client.js';

export default function SettingsModal({ isOpen, onClose, onSaveSettings, currentSettings }) {
  const [formData, setFormData] = useState({
    wooCommerceUrl: '',
    consumerKey: '',
    consumerSecret: '',
    demoMode: true,
    aiProvider: 'autonomous_engine',
    geminiApiKey: '',
    openaiApiKey: '',
    mongoUri: ''
  });

  const [mongoTesting, setMongoTesting] = useState(false);
  const [mongoTestResult, setMongoTestResult] = useState(null);

  useEffect(() => {
    if (currentSettings) {
      setFormData({
        wooCommerceUrl: currentSettings.wooCommerceUrl || '',
        consumerKey: currentSettings.consumerKey || '',
        consumerSecret: '',
        demoMode: currentSettings.demoMode !== false,
        aiProvider: currentSettings.aiProvider || 'autonomous_engine',
        geminiApiKey: '',
        openaiApiKey: '',
        mongoUri: currentSettings.mongoUri || ''
      });
      setMongoTestResult(null);
    }
  }, [currentSettings, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSaveSettings(formData);
  };

  const handleTestMongo = async () => {
    setMongoTesting(true);
    setMongoTestResult(null);
    try {
      const res = await api.testMongoConnection(formData.mongoUri);
      setMongoTestResult(res);
    } catch (err) {
      setMongoTestResult({ connected: false, error: err.message });
    } finally {
      setMongoTesting(false);
    }
  };

  const dbStatus = currentSettings?.dbStatus;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm overflow-y-auto">
      <div className="relative w-full max-w-xl bg-[#0f1523] border border-slate-700/80 rounded-2xl shadow-2xl overflow-hidden my-8">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-slate-800 bg-slate-900/50">
          <div className="flex items-center space-x-2.5">
            <Sliders className="w-5 h-5 text-emerald-400" />
            <div>
              <h3 className="text-base font-bold text-white">System Settings & Integrations</h3>
              <p className="text-xs text-slate-400">Configure MongoDB Atlas, AI Providers & WooCommerce</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Form Body */}
        <form onSubmit={handleSubmit} className="p-6 space-y-5 text-xs max-h-[75vh] overflow-y-auto">
          {/* MongoDB Atlas Section */}
          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                <Database className="w-4 h-4 text-emerald-400" />
                <span>Database: MongoDB Atlas</span>
              </div>

              {dbStatus?.connected ? (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center space-x-1">
                  <CheckCircle2 className="w-3 h-3" />
                  <span>Atlas Connected</span>
                </span>
              ) : (
                <span className="px-2.5 py-0.5 rounded-full text-[10px] font-semibold bg-slate-800 text-slate-400 border border-slate-700">
                  Local JSON Store Active
                </span>
              )}
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">
                MongoDB Atlas Connection URI
              </label>
              <div className="flex items-center gap-2">
                <input
                  type="password"
                  placeholder="mongodb+srv://<username>:<password>@cluster0.mongodb.net/smartpim?retryWrites=true&w=majority"
                  value={formData.mongoUri}
                  onChange={(e) => setFormData({ ...formData, mongoUri: e.target.value })}
                  className="flex-1 px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                />
                <button
                  type="button"
                  onClick={handleTestMongo}
                  disabled={mongoTesting || !formData.mongoUri}
                  className="px-3 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 text-slate-200 rounded-xl border border-slate-700 transition font-semibold shrink-0 flex items-center space-x-1"
                >
                  <RefreshCw className={`w-3.5 h-3.5 ${mongoTesting ? 'animate-spin' : ''}`} />
                  <span>Test Connection</span>
                </button>
              </div>
              <p className="text-[11px] text-slate-500 mt-1">
                Leave empty or unconfigured to automatically use the persistent local JSON database. When connected to MongoDB Atlas, products, staged proposals, and audit logs are synced to Atlas collections.
              </p>
            </div>

            {mongoTestResult && (
              <div className={`p-3 rounded-xl border text-[11px] flex items-start space-x-2 ${
                mongoTestResult.connected
                  ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-300'
                  : 'bg-rose-950/20 border-rose-500/30 text-rose-300'
              }`}>
                {mongoTestResult.connected ? (
                  <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0 mt-0.5" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-rose-400 shrink-0 mt-0.5" />
                )}
                <div>
                  <strong className="block">{mongoTestResult.connected ? 'Success: MongoDB Atlas is reachable!' : 'Connection Error:'}</strong>
                  <span>{mongoTestResult.connected ? mongoTestResult.message : mongoTestResult.error}</span>
                </div>
              </div>
            )}
          </div>

          {/* AI Provider Section */}
          <div className="space-y-3 pt-3 border-t border-slate-800/80">
            <div className="flex items-center space-x-2 text-slate-200 font-semibold uppercase tracking-wider text-[11px]">
              <Cpu className="w-4 h-4 text-emerald-400" />
              <span>AI Agent Provider</span>
            </div>

            <div className="grid grid-cols-1 gap-2">
              <label className={`p-3 rounded-xl border flex items-start space-x-3 cursor-pointer transition ${
                formData.aiProvider === 'autonomous_engine' ? 'bg-emerald-950/20 border-emerald-500/50' : 'bg-slate-950 border-slate-800'
              }`}>
                <input
                  type="radio"
                  name="aiProvider"
                  value="autonomous_engine"
                  checked={formData.aiProvider === 'autonomous_engine'}
                  onChange={() => setFormData({ ...formData, aiProvider: 'autonomous_engine' })}
                  className="mt-0.5 text-emerald-500 focus:ring-0"
                />
                <div>
                  <div className="font-bold text-white text-xs">Autonomous Agent Engine (Built-in)</div>
                  <p className="text-slate-400 text-[11px]">
                    Zero-dependency local multi-turn tool-calling loop. Perfect for placement challenge demonstration without external API keys.
                  </p>
                </div>
              </label>

              <label className={`p-3 rounded-xl border flex items-start space-x-3 cursor-pointer transition ${
                formData.aiProvider === 'gemini' ? 'bg-emerald-950/20 border-emerald-500/50' : 'bg-slate-950 border-slate-800'
              }`}>
                <input
                  type="radio"
                  name="aiProvider"
                  value="gemini"
                  checked={formData.aiProvider === 'gemini'}
                  onChange={() => setFormData({ ...formData, aiProvider: 'gemini' })}
                  className="mt-0.5 text-emerald-500 focus:ring-0"
                />
                <div>
                  <div className="font-bold text-white text-xs">Google Gemini (Live Function Calling)</div>
                  <p className="text-slate-400 text-[11px]">
                    Uses Gemini 1.5/2.0 Flash function declarations for live model tool calling.
                  </p>
                </div>
              </label>
            </div>

            {formData.aiProvider === 'gemini' && (
              <div>
                <label className="block text-slate-300 font-semibold mb-1">
                  Google Gemini API Key
                </label>
                <input
                  type="password"
                  placeholder={currentSettings?.hasGeminiApiKey ? '•••••••••••••••• (API Key Active)' : 'Enter GEMINI_API_KEY'}
                  value={formData.geminiApiKey}
                  onChange={(e) => setFormData({ ...formData, geminiApiKey: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
                />
              </div>
            )}
          </div>

          {/* WooCommerce Integration Section */}
          <div className="space-y-3 pt-3 border-t border-slate-800/80">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-2 text-slate-200 font-semibold uppercase tracking-wider text-[11px]">
                <Globe className="w-4 h-4 text-purple-400" />
                <span>WooCommerce REST API Configuration</span>
              </div>

              {/* Demo Mode Toggle */}
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={formData.demoMode}
                  onChange={(e) => setFormData({ ...formData, demoMode: e.target.checked })}
                  className="rounded text-amber-500 focus:ring-0"
                />
                <span className="text-amber-300 font-medium">Demo Mode (Simulate Sync)</span>
              </label>
            </div>

            <div>
              <label className="block text-slate-300 font-semibold mb-1">Store URL</label>
              <input
                type="url"
                placeholder="https://yourstore.com"
                value={formData.wooCommerceUrl}
                onChange={(e) => setFormData({ ...formData, wooCommerceUrl: e.target.value })}
                className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Consumer Key (ck_...)</label>
                <input
                  type="text"
                  placeholder={currentSettings?.consumerKey || 'ck_xxxxxxxxxxxx'}
                  value={formData.consumerKey}
                  onChange={(e) => setFormData({ ...formData, consumerKey: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                />
              </div>
              <div>
                <label className="block text-slate-300 font-semibold mb-1">Consumer Secret (cs_...)</label>
                <input
                  type="password"
                  placeholder={currentSettings?.hasConsumerSecret ? '••••••••••••••••' : 'cs_xxxxxxxxxxxx'}
                  value={formData.consumerSecret}
                  onChange={(e) => setFormData({ ...formData, consumerSecret: e.target.value })}
                  className="w-full px-3.5 py-2 bg-slate-950 border border-slate-800 rounded-xl text-white placeholder-slate-600 focus:outline-none focus:border-emerald-500 font-mono text-[11px]"
                />
              </div>
            </div>
          </div>

          {/* Security Notice */}
          <div className="p-3 rounded-xl bg-slate-950 border border-slate-800 flex items-center space-x-2 text-[11px] text-slate-400">
            <ShieldCheck className="w-4 h-4 text-emerald-400 shrink-0" />
            <span>All API keys and credentials are stored strictly server-side and masked in UI responses.</span>
          </div>

          {/* Action Footer */}
          <div className="flex items-center justify-end space-x-3 pt-3 border-t border-slate-800">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 rounded-xl text-slate-400 hover:text-white bg-slate-900 border border-slate-800 transition"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-5 py-2 rounded-xl text-white font-semibold bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition active:scale-95"
            >
              Save Configuration
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
