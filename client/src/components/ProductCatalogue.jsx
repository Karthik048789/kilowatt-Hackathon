import React, { useState } from 'react';
import { 
  Search, 
  Plus, 
  Filter, 
  Edit3, 
  Trash2, 
  RefreshCw, 
  Sparkles, 
  CheckCircle, 
  AlertCircle, 
  Tag, 
  Layers,
  ExternalLink,
  ChevronRight
} from 'lucide-react';

export default function ProductCatalogue({ 
  products, 
  onAddProduct, 
  onEditProduct, 
  onDeleteProduct, 
  onSyncProduct, 
  onAuditProduct,
  onOpenAgentForProduct
}) {
  const [searchTerm, setSearchTerm] = useState('');
  const [categoryFilter, setCategoryFilter] = useState('ALL');
  const [statusFilter, setStatusFilter] = useState('ALL');
  const [issuesOnly, setIssuesOnly] = useState(false);

  // Extract unique categories
  const categories = Array.from(new Set(products.map(p => p.category).filter(Boolean)));

  const filteredProducts = products.filter(p => {
    const matchesSearch =
      (p.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.sku || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (p.category && p.category.toLowerCase().includes(searchTerm.toLowerCase()));

    const matchesCategory = categoryFilter === 'ALL' || p.category === categoryFilter;
    const matchesStatus = statusFilter === 'ALL' || p.status === statusFilter;
    const matchesIssues = !issuesOnly || (p.issues && p.issues.length > 0);

    return matchesSearch && matchesCategory && matchesStatus && matchesIssues;
  });

  const getQualityBadge = (score, issues) => {
    if (score >= 85) {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
          <CheckCircle className="w-3 h-3" />
          <span>{score}% High Quality</span>
        </span>
      );
    }
    if (score >= 60) {
      return (
        <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-amber-500/10 text-amber-400 border border-amber-500/20">
          <AlertCircle className="w-3 h-3" />
          <span>{score}% Needs Review ({issues?.length || 0})</span>
        </span>
      );
    }
    return (
      <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-semibold bg-rose-500/10 text-rose-400 border border-rose-500/20">
        <AlertCircle className="w-3 h-3" />
        <span>{score}% Critical Issues ({issues?.length || 0})</span>
      </span>
    );
  };

  const getSyncBadge = (status, wooId) => {
    switch (status) {
      case 'synced':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
            <CheckCircle className="w-3 h-3 text-emerald-400" />
            <span>Synced {wooId ? `#${wooId}` : ''}</span>
          </span>
        );
      case 'failed':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium bg-rose-500/15 text-rose-300 border border-rose-500/30">
            <AlertCircle className="w-3 h-3 text-rose-400" />
            <span>Sync Failed</span>
          </span>
        );
      case 'pending':
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium bg-blue-500/15 text-blue-300 border border-blue-500/30">
            <RefreshCw className="w-3 h-3 text-blue-400 animate-spin" />
            <span>Pending Sync</span>
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center space-x-1 px-2.5 py-1 rounded-full text-xs font-medium bg-slate-800 text-slate-400 border border-slate-700">
            <span>Not Synced</span>
          </span>
        );
    }
  };

  return (
    <div className="space-y-4">
      {/* Controls Bar */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 p-4 rounded-2xl bg-slate-900/70 border border-slate-800">
        <div className="flex flex-1 items-center gap-3 flex-wrap">
          {/* Search Box */}
          <div className="relative flex-1 min-w-[220px]">
            <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="text"
              placeholder="Search by title, SKU, or category..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-slate-950/70 border border-slate-700/60 rounded-xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition"
            />
          </div>

          {/* Category Dropdown */}
          <select
            value={categoryFilter}
            onChange={(e) => setCategoryFilter(e.target.value)}
            className="px-3.5 py-2 bg-slate-950/70 border border-slate-700/60 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Categories</option>
            {categories.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>

          {/* Status Dropdown */}
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="px-3.5 py-2 bg-slate-950/70 border border-slate-700/60 rounded-xl text-sm text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Statuses</option>
            <option value="publish">Published</option>
            <option value="draft">Draft</option>
          </select>

          {/* Toggle Issues Only */}
          <button
            onClick={() => setIssuesOnly(!issuesOnly)}
            className={`px-3.5 py-2 rounded-xl text-sm font-medium border transition flex items-center space-x-1.5 ${
              issuesOnly
                ? 'bg-amber-500/20 text-amber-300 border-amber-500/40 shadow-sm'
                : 'bg-slate-950/70 text-slate-400 border-slate-700/60 hover:text-slate-200'
            }`}
          >
            <AlertCircle className="w-3.5 h-3.5" />
            <span>Issues Only</span>
          </button>
        </div>

        {/* Action Button: Add Product */}
        <button
          onClick={onAddProduct}
          className="flex items-center space-x-2 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white text-sm font-semibold rounded-xl shadow-md shadow-emerald-600/20 transition active:scale-95 shrink-0"
        >
          <Plus className="w-4 h-4" />
          <span>Add New Product</span>
        </button>
      </div>

      {/* Products Table Card */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden shadow-xl">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm text-slate-300">
            <thead className="bg-slate-950/80 text-xs uppercase tracking-wider text-slate-400 border-b border-slate-800">
              <tr>
                <th className="py-3.5 px-4 font-semibold">Product & SKU</th>
                <th className="py-3.5 px-4 font-semibold">Category</th>
                <th className="py-3.5 px-4 font-semibold">Price</th>
                <th className="py-3.5 px-4 font-semibold">Quality & Audit</th>
                <th className="py-3.5 px-4 font-semibold">Sync Status</th>
                <th className="py-3.5 px-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-800/60">
              {filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-slate-500">
                    <p className="text-base font-medium">No products match your search criteria.</p>
                    <p className="text-xs text-slate-600 mt-1">Try resetting filters or adding a new product.</p>
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => (
                  <tr key={p.id} className="hover:bg-slate-800/30 transition group">
                    {/* Product Name & SKU */}
                    <td className="py-4 px-4">
                      <div>
                        <div className="font-semibold text-white group-hover:text-emerald-300 transition">
                          {p.name}
                        </div>
                        <div className="flex items-center space-x-2 mt-0.5">
                          <span className="font-mono text-xs text-slate-400">{p.sku}</span>
                          <span className="text-[10px] uppercase px-1.5 py-0.2 rounded bg-slate-800 text-slate-400">
                            {p.status}
                          </span>
                        </div>
                      </div>
                    </td>

                    {/* Category */}
                    <td className="py-4 px-4">
                      {p.category && p.category.toLowerCase() !== 'uncategorized' ? (
                        <span className="inline-flex items-center space-x-1 text-slate-300 text-xs">
                          <Tag className="w-3 h-3 text-slate-500" />
                          <span>{p.category}</span>
                        </span>
                      ) : (
                        <span className="text-xs text-rose-400 font-medium italic">
                          Missing Category
                        </span>
                      )}
                    </td>

                    {/* Price */}
                    <td className="py-4 px-4">
                      {p.price > 0 ? (
                        <div className="font-semibold text-white">${p.price.toFixed(2)}</div>
                      ) : (
                        <span className="text-xs font-semibold text-rose-400">$0.00 (Invalid)</span>
                      )}
                    </td>

                    {/* Quality Score & Issues */}
                    <td className="py-4 px-4">
                      <div className="space-y-1">
                        <div>{getQualityBadge(p.qualityScore, p.issues)}</div>
                        {p.issues && p.issues.length > 0 && (
                          <div className="text-[11px] text-slate-400 truncate max-w-xs">
                            {p.issues.map(i => i.label).join(' • ')}
                          </div>
                        )}
                      </div>
                    </td>

                    {/* Sync Status */}
                    <td className="py-4 px-4">
                      <div>{getSyncBadge(p.syncStatus, p.wooId)}</div>
                    </td>

                    {/* Actions */}
                    <td className="py-4 px-4 text-right">
                      <div className="flex items-center justify-end space-x-2">
                        {/* Quick AI Enrich Action if issues exist */}
                        {p.issues && p.issues.length > 0 && (
                          <button
                            onClick={() => onOpenAgentForProduct(p)}
                            className="p-1.5 rounded-lg bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-400 border border-indigo-500/30 transition"
                            title="Auto-enrich with AI Agent"
                          >
                            <Sparkles className="w-4 h-4" />
                          </button>
                        )}

                        {/* Quick Sync */}
                        <button
                          onClick={() => onSyncProduct(p.id)}
                          className="p-1.5 rounded-lg bg-emerald-500/10 hover:bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 transition"
                          title="Sync to WooCommerce"
                        >
                          <RefreshCw className="w-4 h-4" />
                        </button>

                        {/* Edit */}
                        <button
                          onClick={() => onEditProduct(p)}
                          className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-300 hover:text-white border border-slate-700/60 transition"
                          title="Edit Product"
                        >
                          <Edit3 className="w-4 h-4" />
                        </button>

                        {/* Delete */}
                        <button
                          onClick={() => onDeleteProduct(p.id, p.name)}
                          className="p-1.5 rounded-lg bg-rose-500/10 hover:bg-rose-500/20 text-rose-400 border border-rose-500/30 transition"
                          title="Delete Product"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
