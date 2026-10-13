import React, { useState, useEffect } from 'react';
import { 
  RefreshCw, 
  CheckCircle2, 
  AlertTriangle, 
  Globe, 
  Download, 
  Upload, 
  ShieldCheck, 
  ExternalLink,
  Sliders,
  CheckCircle,
  AlertCircle
} from 'lucide-react';

export default function WooCommerceSyncPanel({ 
  products, 
  onSyncSingle, 
  onSyncAll, 
  onImportRemote, 
  onCheckStatus,
  onOpenSettings,
  isLoading 
}) {
  const [wcStatus, setWcStatus] = useState(null);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    handleCheck();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleCheck = async () => {
    setChecking(true);
    try {
      const res = await onCheckStatus();
      setWcStatus(res);
    } catch (e) {
      console.error(e);
    } finally {
      setChecking(false);
    }
  };

  const readyToSync = products.filter(p => p.qualityScore >= 80 && p.syncStatus !== 'synced');
  const syncedProducts = products.filter(p => p.syncStatus === 'synced');

  return (
    <div className="space-y-6">
      {/* Store Connection Status Banner */}
      <div className="p-6 rounded-2xl bg-slate-900/80 border border-slate-800 shadow-xl space-y-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="flex items-center space-x-3.5">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-purple-600 to-indigo-500 p-0.5 shadow-lg shadow-purple-500/20 shrink-0">
              <div className="w-full h-full bg-[#0d131f] rounded-[14px] flex items-center justify-center">
                <Globe className="w-6 h-6 text-purple-400" />
              </div>
            </div>
            <div>
              <div className="flex items-center space-x-2">
                <h2 className="text-lg font-bold text-white">WooCommerce REST API Integration</h2>
                {wcStatus?.isDemo ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-300 border border-amber-500/20">
                    DEMO SIMULATION MODE
                  </span>
                ) : wcStatus?.connected ? (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
                    LIVE CONNECTION ACTIVE
                  </span>
                ) : (
                  <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
                    DISCONNECTED
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-400 mt-0.5">
                Full WooCommerce REST API v3 schema payload builder, bidirectional synchronization, and audit verification.
              </p>
            </div>
          </div>

          {/* Connection Actions */}
          <div className="flex items-center space-x-2 shrink-0">
            <button
              onClick={handleCheck}
              disabled={checking}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-medium bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700 transition"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${checking ? 'animate-spin' : ''}`} />
              <span>Test Connection</span>
            </button>
            <button
              onClick={onOpenSettings}
              className="flex items-center space-x-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-purple-600 hover:bg-purple-500 text-white transition shadow-sm"
            >
              <Sliders className="w-3.5 h-3.5" />
              <span>Configure Credentials</span>
            </button>
          </div>
        </div>

        {/* Demo Mode Notice */}
        {wcStatus?.isDemo && (
          <div className="p-4 rounded-xl bg-amber-950/20 border border-amber-500/30 text-xs text-amber-300/90 leading-relaxed flex items-start space-x-2.5">
            <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0 mt-0.5" />
            <div>
              <strong className="text-amber-200 font-semibold block">Transparent Evaluation Notice:</strong>
              SmartPIM AI is currently running in <span className="font-bold underline">DEMO MODE</span> because live WooCommerce store API credentials have not been configured in Settings. All product sync payloads are strictly built and verified against the authentic WooCommerce REST API v3 schema, assigning simulated Woo IDs and recording complete audit logs. Enter your WooCommerce store URL, Consumer Key, and Consumer Secret in Settings to activate live REST calls at any time.
            </div>
          </div>
        )}
      </div>

      {/* Sync Operations Bar */}
      <div className="p-5 rounded-2xl bg-slate-900/60 border border-slate-800 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-white">Catalogue Sync Actions</h3>
          <p className="text-xs text-slate-400 mt-0.5">
            {readyToSync.length} products ready for synchronization (meets &gt;= 80% quality score benchmark).
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <button
            onClick={onImportRemote}
            disabled={isLoading || wcStatus?.isDemo}
            className="flex items-center space-x-1.5 px-4 py-2 bg-slate-800 hover:bg-slate-700 disabled:opacity-40 disabled:cursor-not-allowed text-slate-200 text-xs font-semibold rounded-xl border border-slate-700 transition"
            title={wcStatus?.isDemo ? 'Importing requires live credentials' : 'Pull remote products from WooCommerce'}
          >
            <Download className="w-4 h-4 text-slate-400" />
            <span>Import from Store</span>
          </button>

          <button
            onClick={onSyncAll}
            disabled={isLoading || readyToSync.length === 0}
            className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-40 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition active:scale-95"
          >
            <Upload className="w-4 h-4" />
            <span>Sync All Ready Products ({readyToSync.length})</span>
          </button>
        </div>
      </div>

      {/* Synchronized Products Catalogue Table */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden shadow-lg">
        <div className="p-4 bg-slate-950/70 border-b border-slate-800 text-xs font-bold uppercase tracking-wider text-slate-400">
          Sync Status & WooCommerce Identifiers ({products.length} Products)
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs text-slate-300">
            <thead className="bg-slate-950 text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3 px-4 font-semibold">Product Title</th>
                <th className="py-3 px-4 font-semibold">SKU</th>
                <th className="py-3 px-4 font-semibold">Quality Score</th>
                <th className="py-3 px-4 font-semibold">WooCommerce ID</th>
                <th className="py-3 px-4 font-semibold">Last Synchronized</th>
                <th className="py-3 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {products.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-10 text-center text-slate-500 text-xs">
                    No products in the catalogue yet.
                  </td>
                </tr>
              ) : products.map((p) => (
                <tr key={p.id} className="hover:bg-slate-850/50 transition">
                  <td className="py-3 px-4 font-semibold text-white">{p.name}</td>
                  <td className="py-3 px-4 font-mono text-slate-400">{p.sku}</td>
                  <td className="py-3 px-4">
                    <span className={`font-bold ${p.qualityScore >= 80 ? 'text-emerald-400' : 'text-amber-400'}`}>
                      {p.qualityScore}%
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    {p.wooId ? (
                      <span className="font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-500/20">
                        #{p.wooId}
                      </span>
                    ) : (
                      <span className="text-slate-500 italic">—</span>
                    )}
                  </td>
                  <td className="py-3 px-4 text-slate-400">
                    {p.lastSyncedAt ? new Date(p.lastSyncedAt).toLocaleString() : 'Never synced'}
                  </td>
                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => onSyncSingle(p.id)}
                      disabled={isLoading}
                      className="px-3 py-1 bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 rounded-lg text-xs font-semibold transition"
                    >
                      Sync Now
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
