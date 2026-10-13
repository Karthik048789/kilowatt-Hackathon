import React from 'react';
import { Bot, Sparkles, RefreshCw, Settings, ShieldCheck, CheckCircle2, AlertTriangle, RotateCcw } from 'lucide-react';

export default function Navbar({ onOpenSettings, onTriggerAudit, onResetDemo, stats, isDemoMode, activeTab, setActiveTab }) {
  return (
    <header className="sticky top-0 z-30 border-b border-slate-800/80 bg-[#0b0f17]/90 backdrop-blur-md px-6 py-3.5 flex items-center justify-between">
      {/* Brand */}
      <div className="flex items-center space-x-3">
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-emerald-600 via-teal-500 to-cyan-500 p-0.5 flex items-center justify-center shadow-lg shadow-emerald-500/20">
          <div className="w-full h-full bg-[#0d131f] rounded-[10px] flex items-center justify-center">
            <Bot className="w-5 h-5 text-emerald-400" />
          </div>
        </div>
        <div>
          <div className="flex items-center space-x-2">
            <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-slate-200 to-slate-400 bg-clip-text text-transparent">
              SmartPIM AI
            </span>
            <span className="px-2 py-0.5 text-[10px] font-semibold tracking-wide uppercase bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 rounded-full">
              Agentic v1.0
            </span>
          </div>
        </div>
      </div>

      {/* Center status badges */}
      <div className="hidden md:flex items-center space-x-3">
        {isDemoMode ? (
          <div className="flex items-center space-x-2 px-3 py-1 bg-amber-500/10 border border-amber-500/20 rounded-full text-amber-300 text-xs">
            <span className="w-2 h-2 rounded-full bg-amber-400 animate-pulse"></span>
            <span className="font-medium">DEMO MODE: Safe Simulation Active</span>
          </div>
        ) : (
          <div className="flex items-center space-x-2 px-3 py-1 bg-emerald-500/10 border border-emerald-500/20 rounded-full text-emerald-300 text-xs">
            <span className="w-2 h-2 rounded-full bg-emerald-400"></span>
            <span className="font-medium">LIVE STORE CONNECTED</span>
          </div>
        )}

        {stats?.pendingProposals > 0 && (
          <button
            onClick={() => setActiveTab('proposals')}
            className="flex items-center space-x-1.5 px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 hover:bg-indigo-500/30 rounded-full text-indigo-300 text-xs transition"
          >
            <Sparkles className="w-3.5 h-3.5 text-indigo-400 animate-pulse" />
            <span>{stats.pendingProposals} AI Proposals Pending Review</span>
          </button>
        )}
      </div>

      {/* Right controls */}
      <div className="flex items-center space-x-2.5">
        <button
          onClick={onResetDemo}
          className="flex items-center space-x-1.5 px-3 py-1.5 bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white text-xs font-medium rounded-lg border border-slate-700/50 transition"
          title="Reset sample products with missing descriptions and categories to test the AI Agent"
        >
          <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
          <span className="hidden sm:inline">Reset Demo Flaws</span>
        </button>

        <button
          onClick={onTriggerAudit}
          className="flex items-center space-x-1.5 px-3.5 py-1.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 text-white text-xs font-semibold rounded-lg shadow-sm shadow-emerald-500/20 transition active:scale-95"
          title="Run Autonomous Catalogue Quality Audit"
        >
          <Sparkles className="w-3.5 h-3.5" />
          <span>Launch AI Agent</span>
        </button>

        <button
          onClick={onOpenSettings}
          className="p-2 rounded-lg bg-slate-800/80 hover:bg-slate-700/80 text-slate-300 hover:text-white border border-slate-700/50 transition"
          title="Settings & Credentials"
        >
          <Settings className="w-4 h-4" />
        </button>
      </div>
    </header>
  );
}
