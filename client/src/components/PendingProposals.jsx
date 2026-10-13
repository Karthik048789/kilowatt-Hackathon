import React, { useState } from 'react';
import { 
  FileCheck2, 
  Check, 
  X, 
  CheckCheck, 
  AlertCircle, 
  ArrowRight, 
  Sparkles, 
  ShieldAlert, 
  Trash2,
  Tag,
  Layers,
  Clock
} from 'lucide-react';

export default function PendingProposals({ 
  proposals, 
  onApproveProposal, 
  onRejectProposal, 
  onApproveAll, 
  onClearProposals,
  isLoading 
}) {
  const [filter, setFilter] = useState('pending');

  const filteredProposals = proposals.filter(p => {
    if (filter === 'all') return true;
    return p.status === filter;
  });

  const pendingCount = proposals.filter(p => p.status === 'pending').length;

  return (
    <div className="space-y-6">
      {/* Top Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-indigo-950/40 via-slate-900 to-purple-950/40 border border-indigo-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center space-x-2">
            <h2 className="text-lg font-bold text-white">AI Agent Proposed Changes</h2>
            <span className="px-2.5 py-0.5 rounded-full text-xs font-semibold bg-indigo-500/10 text-indigo-300 border border-indigo-500/20">
              Human-in-the-Loop Review
            </span>
          </div>
          <p className="text-xs text-slate-300 mt-1">
            Carefully inspect proposed enhancements. No AI modifications are applied to your live catalogue without explicit approval.
          </p>
        </div>

        {/* Global actions */}
        <div className="flex items-center space-x-2 shrink-0">
          {pendingCount > 0 && (
            <button
              onClick={onApproveAll}
              disabled={isLoading}
              className="flex items-center space-x-1.5 px-4 py-2 bg-emerald-600 hover:bg-emerald-500 disabled:opacity-50 text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-600/20 transition active:scale-95"
            >
              <CheckCheck className="w-4 h-4" />
              <span>Approve All ({pendingCount})</span>
            </button>
          )}

          {proposals.length > 0 && (
            <button
              onClick={onClearProposals}
              className="p-2 rounded-xl bg-slate-800 hover:bg-slate-700 text-slate-400 hover:text-white border border-slate-700 transition"
              title="Clear proposal history"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex items-center space-x-2 border-b border-slate-800 pb-3">
        <button
          onClick={() => setFilter('pending')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
            filter === 'pending'
              ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Pending Review ({pendingCount})
        </button>
        <button
          onClick={() => setFilter('approved')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
            filter === 'approved'
              ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Approved History ({proposals.filter(p => p.status === 'approved').length})
        </button>
        <button
          onClick={() => setFilter('rejected')}
          className={`px-3.5 py-1.5 rounded-xl text-xs font-semibold transition ${
            filter === 'rejected'
              ? 'bg-rose-500/20 text-rose-300 border border-rose-500/30'
              : 'text-slate-400 hover:text-white'
          }`}
        >
          Rejected History ({proposals.filter(p => p.status === 'rejected').length})
        </button>
      </div>

      {/* Proposals List */}
      <div className="space-y-4">
        {filteredProposals.length === 0 ? (
          <div className="p-10 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-2">
            <FileCheck2 className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm font-medium text-slate-400">
              No {filter} proposals in the queue.
            </p>
            <p className="text-xs text-slate-500">
              When the AI Agent inspects the catalogue, it stages suggested improvements here for your review.
            </p>
          </div>
        ) : (
          filteredProposals.map((prop) => (
            <ProposalCard
              key={prop.id}
              proposal={prop}
              onApprove={() => onApproveProposal(prop.id)}
              onReject={(reason) => onRejectProposal(prop.id, reason)}
              isLoading={isLoading}
            />
          ))
        )}
      </div>
    </div>
  );
}

function ProposalCard({ proposal, onApprove, onReject, isLoading }) {
  const [rejecting, setRejecting] = useState(false);
  const [reason, setReason] = useState('');

  const isPending = proposal.status === 'pending';

  return (
    <div className={`rounded-2xl border transition overflow-hidden ${
      isPending
        ? 'bg-slate-900/80 border-slate-700/80 shadow-lg hover:border-indigo-500/50'
        : proposal.status === 'approved'
        ? 'bg-emerald-950/20 border-emerald-500/30'
        : 'bg-rose-950/20 border-rose-500/30'
    }`}>
      {/* Proposal Top Bar */}
      <div className="p-4 bg-slate-950/60 border-b border-slate-800/80 flex flex-col md:flex-row md:items-center justify-between gap-3">
        <div className="space-y-0.5">
          <div className="flex items-center space-x-2">
            <h4 className="font-bold text-white text-base">{proposal.productName}</h4>
            <span className="font-mono text-xs px-2 py-0.5 rounded bg-slate-800 text-slate-300">
              {proposal.sku}
            </span>
          </div>
          <div className="text-[11px] text-slate-400">
            Proposal ID: <span className="font-mono text-slate-300">{proposal.id}</span> • Staged at {proposal.createdAt ? new Date(proposal.createdAt).toLocaleTimeString() : '—'}
          </div>
        </div>

        {/* Score Improvement Badge */}
        <div className="flex items-center space-x-3">
          <div className="flex items-center space-x-1.5 px-3 py-1 rounded-full bg-slate-800 border border-slate-700 text-xs">
            <span className="text-slate-400">Quality Score:</span>
            <span className="text-rose-400 font-bold">{proposal.currentScore}%</span>
            <ArrowRight className="w-3 h-3 text-slate-500" />
            <span className="text-emerald-400 font-bold">{proposal.projectedScore}%</span>
          </div>

          <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider ${
            isPending ? 'bg-indigo-500/20 text-indigo-300 border border-indigo-500/30' :
            proposal.status === 'approved' ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30' :
            'bg-rose-500/20 text-rose-300 border border-rose-500/30'
          }`}>
            {proposal.status}
          </span>
        </div>
      </div>

      {/* Changes Comparison */}
      <div className="p-5 space-y-4 text-xs">
        {/* Agent Rationale */}
        {proposal.reasoning && (
          <div className="p-3 rounded-xl bg-slate-950/70 border border-slate-800 text-slate-300">
            <strong className="text-indigo-300 font-semibold">AI Rationale: </strong>
            {proposal.reasoning}
          </div>
        )}

        {/* Proposed Changes Fields */}
        <div className="space-y-3">
          {proposal.changes?.description && (
            <div className="space-y-1">
              <span className="font-semibold text-slate-400 uppercase tracking-wider text-[11px]">
                Enriched Product Description:
              </span>
              <div className="p-3 rounded-xl bg-emerald-950/30 border border-emerald-500/30 text-emerald-200 leading-relaxed">
                {proposal.changes.description}
              </div>
            </div>
          )}

          {proposal.changes?.category && (
            <div className="space-y-1">
              <span className="font-semibold text-slate-400 uppercase tracking-wider text-[11px]">
                Target Category:
              </span>
              <div className="inline-flex items-center space-x-1.5 px-3 py-1 rounded-lg bg-emerald-950/30 border border-emerald-500/30 text-emerald-300 font-medium">
                <Tag className="w-3.5 h-3.5 text-emerald-400" />
                <span>{proposal.changes.category}</span>
              </div>
            </div>
          )}

          {proposal.changes?.attributes && (
            <div className="space-y-1">
              <span className="font-semibold text-slate-400 uppercase tracking-wider text-[11px]">
                Generated Specifications / Attributes:
              </span>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {proposal.changes.attributes.map((attr, aIdx) => (
                  <div key={aIdx} className="p-2 rounded-lg bg-slate-950/70 border border-slate-800 flex items-center justify-between">
                    <span className="text-slate-400 font-medium">{attr.name}:</span>
                    <span className="text-slate-200 font-semibold">{attr.options?.join(', ')}</span>
                  </div>
                ))}
              </div>
            </div>
          )}

          {proposal.changes?.price && (
            <div className="space-y-1">
              <span className="font-semibold text-slate-400 uppercase tracking-wider text-[11px]">
                Corrected Retail Price:
              </span>
              <div className="text-emerald-300 font-bold">
                ${proposal.changes.price.toFixed(2)}
              </div>
            </div>
          )}
        </div>

        {/* Action Controls for Pending Proposals */}
        {isPending && (
          <div className="pt-3 border-t border-slate-800/80 flex items-center justify-end space-x-3">
            {rejecting ? (
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  placeholder="Optional reason for rejection..."
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="px-3 py-1.5 bg-slate-950 border border-slate-700 rounded-lg text-xs text-white placeholder-slate-500 focus:outline-none focus:border-rose-500"
                />
                <button
                  onClick={() => {
                    onReject(reason);
                    setRejecting(false);
                  }}
                  disabled={isLoading}
                  className="px-3 py-1.5 bg-rose-600 hover:bg-rose-500 text-white rounded-lg font-semibold transition"
                >
                  Confirm Reject
                </button>
                <button
                  onClick={() => setRejecting(false)}
                  className="px-2 py-1.5 text-slate-400 hover:text-white"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <>
                <button
                  onClick={() => setRejecting(true)}
                  disabled={isLoading}
                  className="flex items-center space-x-1 px-3.5 py-1.5 rounded-lg text-rose-400 hover:text-rose-300 bg-rose-500/10 hover:bg-rose-500/20 border border-rose-500/30 transition font-semibold"
                >
                  <X className="w-3.5 h-3.5" />
                  <span>Reject</span>
                </button>
                <button
                  onClick={onApprove}
                  disabled={isLoading}
                  className="flex items-center space-x-1.5 px-4 py-1.5 rounded-lg text-white bg-emerald-600 hover:bg-emerald-500 shadow-md shadow-emerald-600/20 transition font-semibold"
                >
                  <Check className="w-3.5 h-3.5" />
                  <span>Approve & Apply to Catalogue</span>
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
