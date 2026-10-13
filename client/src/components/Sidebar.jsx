import React from 'react';
import { 
  LayoutDashboard, 
  Package, 
  Bot, 
  FileCheck2, 
  RefreshCw, 
  ScrollText, 
  Sliders, 
  Sparkles,
  ShieldAlert
} from 'lucide-react';

export default function Sidebar({ activeTab, setActiveTab, stats }) {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'catalogue', label: 'Product Catalogue', icon: Package, badge: stats?.total },
    { 
      id: 'agent', 
      label: 'AI Agent Console', 
      icon: Bot, 
      highlight: true 
    },
    { 
      id: 'proposals', 
      label: 'Pending Proposals', 
      icon: FileCheck2, 
      badge: stats?.pendingProposals,
      badgeColor: 'bg-indigo-500/20 text-indigo-300 border-indigo-500/30'
    },
    { 
      id: 'sync', 
      label: 'WooCommerce Sync', 
      icon: RefreshCw, 
      badge: stats?.synced ? `${stats.synced} Synced` : null,
      badgeColor: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30'
    },
    { id: 'logs', label: 'Audit & Sync Logs', icon: ScrollText }
  ];

  return (
    <aside className="w-64 border-r border-slate-800/80 bg-[#0d121c]/95 flex flex-col justify-between shrink-0">
      {/* Navigation Links */}
      <div className="p-4 space-y-1">
        <div className="px-3 py-2 text-[11px] font-semibold uppercase tracking-wider text-slate-400">
          PIM Core Navigation
        </div>
        
        {navItems.map((item) => {
          const Icon = item.icon;
          const isActive = activeTab === item.id;
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-sm font-medium transition group ${
                isActive
                  ? 'bg-gradient-to-r from-emerald-600/20 to-teal-600/10 text-emerald-400 border border-emerald-500/30 shadow-sm'
                  : 'text-slate-400 hover:text-slate-200 hover:bg-slate-800/50 border border-transparent'
              }`}
            >
              <div className="flex items-center space-x-3">
                <Icon className={`w-4 h-4 transition ${isActive ? 'text-emerald-400' : 'text-slate-400 group-hover:text-slate-200'}`} />
                <span>{item.label}</span>
              </div>

              {item.badge !== undefined && item.badge !== null && item.badge > 0 && (
                <span className={`px-2 py-0.5 text-xs rounded-full border ${item.badgeColor || 'bg-slate-800 text-slate-300 border-slate-700'}`}>
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {/* Catalogue Health Card in Sidebar Footer */}
      <div className="p-4 m-3 rounded-2xl bg-gradient-to-b from-slate-900 to-slate-950 border border-slate-800/80">
        <div className="flex items-center justify-between mb-2">
          <span className="text-xs font-semibold text-slate-400">Catalogue Health</span>
          <span className={`text-xs font-bold ${
            (stats?.avgScore || 0) >= 80 ? 'text-emerald-400' : (stats?.avgScore || 0) >= 60 ? 'text-amber-400' : 'text-rose-400'
          }`}>
            {stats?.avgScore || 0}%
          </span>
        </div>
        
        {/* Progress Bar */}
        <div className="w-full h-2 bg-slate-800 rounded-full overflow-hidden">
          <div 
            className={`h-full rounded-full transition-all duration-500 ${
              (stats?.avgScore || 0) >= 80 ? 'bg-gradient-to-r from-emerald-500 to-teal-400' :
              (stats?.avgScore || 0) >= 60 ? 'bg-gradient-to-r from-amber-500 to-yellow-400' :
              'bg-gradient-to-r from-rose-500 to-orange-400'
            }`}
            style={{ width: `${Math.max(5, stats?.avgScore || 0)}%` }}
          />
        </div>

        <div className="mt-3 pt-3 border-t border-slate-800/80 flex items-center justify-between text-[11px] text-slate-400">
          <span>{stats?.needsAttention || 0} issues detected</span>
          <button 
            onClick={() => setActiveTab('agent')} 
            className="text-emerald-400 hover:text-emerald-300 font-medium inline-flex items-center space-x-1"
          >
            <span>Fix with AI</span>
            <Sparkles className="w-3 h-3" />
          </button>
        </div>
      </div>
    </aside>
  );
}
