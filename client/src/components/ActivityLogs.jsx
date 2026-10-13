import React, { useState } from 'react';
import { ScrollText, CheckCircle2, AlertTriangle, AlertCircle, Info, RefreshCw, Filter } from 'lucide-react';

export default function ActivityLogs({ logs, onRefreshLogs, isLoading }) {
  const [filter, setFilter] = useState('ALL');

  const filteredLogs = logs.filter(l => {
    if (filter === 'ALL') return true;
    return l.status === filter;
  });

  const getStatusIcon = (status) => {
    switch (status) {
      case 'success':
        return <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />;
      case 'warning':
        return <AlertTriangle className="w-4 h-4 text-amber-400 shrink-0" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-rose-400 shrink-0" />;
      default:
        return <Info className="w-4 h-4 text-blue-400 shrink-0" />;
    }
  };

  return (
    <div className="space-y-4">
      {/* Top Bar */}
      <div className="p-4 rounded-2xl bg-slate-900/60 border border-slate-800 flex items-center justify-between">
        <div>
          <h2 className="text-base font-bold text-white flex items-center space-x-2">
            <ScrollText className="w-4 h-4 text-emerald-400" />
            <span>Activity History & Audit Logs</span>
          </h2>
          <p className="text-xs text-slate-400 mt-0.5">
            Immutable log trail of all product modifications, AI tool executions, approvals, and sync attempts.
          </p>
        </div>

        <div className="flex items-center space-x-3">
          <select
            value={filter}
            onChange={(e) => setFilter(e.target.value)}
            className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-xl text-xs text-slate-300 focus:outline-none focus:border-emerald-500"
          >
            <option value="ALL">All Events ({logs.length})</option>
            <option value="success">Success</option>
            <option value="warning">Warnings</option>
            <option value="error">Errors</option>
            <option value="info">Info</option>
          </select>

          <button
            onClick={onRefreshLogs}
            disabled={isLoading}
            className="p-1.5 rounded-lg bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white transition"
            title="Refresh logs"
          >
            <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      {/* Logs Table */}
      <div className="rounded-2xl bg-slate-900/60 border border-slate-800 overflow-hidden shadow-lg">
        <div className="divide-y divide-slate-800/60 max-h-[600px] overflow-y-auto">
          {filteredLogs.length === 0 ? (
            <div className="p-8 text-center text-slate-500 text-xs">
              No logs recorded yet.
            </div>
          ) : (
            filteredLogs.map((log, idx) => (
              <div key={log.id || idx} className="p-4 hover:bg-slate-850/40 transition flex items-start space-x-3 text-xs">
                {getStatusIcon(log.status)}

                <div className="flex-1 space-y-1">
                  <div className="flex items-center justify-between">
                    <span className="font-mono text-[11px] font-semibold text-slate-300 uppercase tracking-wider">
                      {log.action}
                    </span>
                    <span className="text-[11px] text-slate-500">
                      {log.timestamp ? new Date(log.timestamp).toLocaleString() : '—'}
                    </span>
                  </div>

                  <p className="text-slate-200">{log.details}</p>

                  {log.metadata && Object.keys(log.metadata).length > 0 && (
                    <div className="text-[11px] font-mono text-slate-400 bg-slate-950/60 p-2 rounded-lg border border-slate-800/60">
                      {JSON.stringify(log.metadata)}
                    </div>
                  )}
                </div>
              </div>
            ))
          )}
        </div>
      </div>
    </div>
  );
}
