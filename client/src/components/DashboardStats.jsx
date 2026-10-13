import React from 'react';
import { Package, CheckCircle2, AlertTriangle, RefreshCw, Sparkles, TrendingUp, ArrowRight } from 'lucide-react';

export default function DashboardStats({ stats, onLaunchAgent, onViewAttention, onViewSync }) {
  const cards = [
    {
      title: 'Total Products',
      value: stats?.total || 0,
      detail: `${stats?.published || 0} Published • ${stats?.drafts || 0} Drafts`,
      icon: Package,
      gradient: 'from-blue-600/20 to-indigo-600/5',
      borderColor: 'border-blue-500/20',
      iconColor: 'text-blue-400'
    },
    {
      title: 'Catalogue Issues',
      value: stats?.needsAttention || 0,
      detail: `${stats?.needsAttention || 0} items need description / category / pricing fixes`,
      icon: AlertTriangle,
      gradient: 'from-amber-600/20 to-orange-600/5',
      borderColor: 'border-amber-500/20',
      iconColor: 'text-amber-400',
      action: onViewAttention,
      actionText: 'View Issues'
    },
    {
      title: 'WooCommerce Sync',
      value: stats?.synced || 0,
      detail: `${stats?.notSynced || 0} pending sync • ${stats?.failedSync || 0} failed`,
      icon: RefreshCw,
      gradient: 'from-emerald-600/20 to-teal-600/5',
      borderColor: 'border-emerald-500/20',
      iconColor: 'text-emerald-400',
      action: onViewSync,
      actionText: 'Manage Sync'
    },
    {
      title: 'Average Quality Score',
      value: `${stats?.avgScore || 0}%`,
      detail: (stats?.avgScore || 0) >= 80 ? 'Optimal catalogue health' : 'Below benchmark quality',
      icon: TrendingUp,
      gradient: 'from-purple-600/20 to-pink-600/5',
      borderColor: 'border-purple-500/20',
      iconColor: 'text-purple-400'
    }
  ];

  return (
    <div className="space-y-6">
      {/* Hero AI Quick Callout */}
      <div className="relative overflow-hidden rounded-2xl bg-gradient-to-r from-emerald-950/60 via-slate-900 to-slate-950 border border-emerald-500/30 p-6 shadow-xl">
        <div className="absolute -right-8 -top-8 w-64 h-64 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />
        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div className="space-y-1.5 max-w-2xl">
            <div className="inline-flex items-center space-x-2 px-2.5 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-semibold border border-emerald-500/30">
              <Sparkles className="w-3.5 h-3.5" />
              <span>Autonomous Product Catalogue AI Agent</span>
            </div>
            <h2 className="text-xl md:text-2xl font-bold tracking-tight text-white">
              Agentic Catalogue Auditing & Auto-Enrichment
            </h2>
            <p className="text-sm text-slate-300">
              The agent autonomously audits database records, selects backend inspection and enrichment tools, generates high-converting product descriptions, and stages proposals for your explicit approval.
            </p>
          </div>

          <button
            onClick={onLaunchAgent}
            className="self-start md:self-center shrink-0 flex items-center space-x-2 px-5 py-2.5 bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-semibold rounded-xl text-sm shadow-lg shadow-emerald-500/25 transition active:scale-95"
          >
            <span>Run Agentic Audit</span>
            <ArrowRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Grid of Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {cards.map((c, idx) => {
          const Icon = c.icon;
          return (
            <div
              key={idx}
              className={`p-5 rounded-2xl bg-gradient-to-br ${c.gradient} bg-slate-900/60 border ${c.borderColor} backdrop-blur-md flex flex-col justify-between transition hover:border-opacity-60`}
            >
              <div className="flex items-start justify-between">
                <div>
                  <span className="text-xs font-medium text-slate-400 uppercase tracking-wider">{c.title}</span>
                  <div className="text-2xl font-extrabold text-white mt-1.5 tracking-tight">{c.value}</div>
                </div>
                <div className={`p-2.5 rounded-xl bg-slate-800/80 border border-slate-700/50 ${c.iconColor}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-4 pt-3 border-t border-slate-800/60 flex items-center justify-between text-xs text-slate-400">
                <span className="truncate">{c.detail}</span>
                {c.action && (
                  <button
                    onClick={c.action}
                    className="text-emerald-400 hover:text-emerald-300 font-medium ml-2 shrink-0 inline-flex items-center space-x-1"
                  >
                    <span>{c.actionText}</span>
                  </button>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
