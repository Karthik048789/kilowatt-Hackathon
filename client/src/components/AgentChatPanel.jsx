import React, { useState } from 'react';
import { 
  Bot, 
  Sparkles, 
  Send, 
  CheckCircle2, 
  Terminal, 
  ChevronDown, 
  ChevronUp, 
  Layers, 
  ArrowRight,
  ShieldCheck,
  RefreshCw,
  Cpu,
  FileCheck2,
  RotateCcw
} from 'lucide-react';

export default function AgentChatPanel({ 
  onRunAgent, 
  isLoading, 
  agentHistory = [], 
  onNavigateToProposals,
  pendingProposalsCount = 0,
  onResetDemo
}) {
  const [prompt, setPrompt] = useState('');

  const quickPrompts = [
    "Audit the catalogue, identify products with missing descriptions or categories, suggest corrections, and show me the changes before applying them.",
    "Inspect the catalogue for products requiring attention, suggest rich descriptions and categories, and stage them for approval.",
    "Check for products with invalid prices or missing categories and propose corrections.",
    "Run catalogue quality inspection and sync ready products to WooCommerce."
  ];

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!prompt.trim() || isLoading) return;
    onRunAgent(prompt.trim());
    setPrompt('');
  };

  const handleSelectQuickPrompt = (p) => {
    setPrompt(p);
  };

  return (
    <div className="space-y-6">
      {/* Agent Banner */}
      <div className="p-5 rounded-2xl bg-gradient-to-r from-emerald-950/40 via-slate-900 to-indigo-950/40 border border-emerald-500/30 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div className="flex items-center space-x-3.5">
          <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-emerald-500 to-teal-400 p-0.5 shadow-lg shadow-emerald-500/20 shrink-0">
            <div className="w-full h-full bg-[#0d131f] rounded-[14px] flex items-center justify-center">
              <Bot className="w-6 h-6 text-emerald-400" />
            </div>
          </div>
          <div>
            <div className="flex items-center space-x-2">
              <h2 className="text-lg font-bold text-white">Product Catalogue AI Agent</h2>
              <span className="px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 text-xs font-semibold">
                Multi-Turn Tool Calling
              </span>
            </div>
            <p className="text-xs text-slate-300">
              Autonomous reasoning orchestrator with real backend tool execution: <code className="text-emerald-400 font-mono">inspect_catalogue</code>, <code className="text-emerald-400 font-mono">suggest_product_fixes</code>, <code className="text-emerald-400 font-mono">apply_product_fixes</code>, <code className="text-emerald-400 font-mono">sync_product</code>
            </p>
          </div>
        </div>

        <div className="flex items-center space-x-2.5 shrink-0">
          <button
            onClick={onResetDemo}
            className="flex items-center space-x-1.5 px-3.5 py-2 bg-slate-800 hover:bg-slate-700 text-amber-300 border border-slate-700/80 rounded-xl text-xs font-semibold transition active:scale-95 shrink-0"
            title="Reset sample products with missing descriptions and categories to test the AI Agent"
          >
            <RotateCcw className="w-3.5 h-3.5 text-amber-400" />
            <span>Reset Demo Flaws</span>
          </button>

          {pendingProposalsCount > 0 && (
            <button
              onClick={onNavigateToProposals}
              className="flex items-center space-x-2 px-4 py-2 bg-indigo-600/30 hover:bg-indigo-600/40 text-indigo-300 border border-indigo-500/40 rounded-xl text-xs font-semibold transition active:scale-95 shrink-0"
            >
              <FileCheck2 className="w-4 h-4 text-indigo-400" />
              <span>Review {pendingProposalsCount} Staged Proposals</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>
      </div>

      {/* Suggested Prompts */}
      <div className="space-y-2">
        <div className="text-xs font-semibold text-slate-400 flex items-center space-x-1.5">
          <Sparkles className="w-3.5 h-3.5 text-emerald-400" />
          <span>Recommended Agentic Invocations (Click to load):</span>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
          {quickPrompts.map((qp, idx) => (
            <button
              key={idx}
              onClick={() => handleSelectQuickPrompt(qp)}
              className="text-left p-3 rounded-xl bg-slate-900/60 hover:bg-slate-800/80 border border-slate-800 hover:border-emerald-500/40 text-xs text-slate-300 hover:text-white transition group"
            >
              <span className="line-clamp-2">"{qp}"</span>
            </button>
          ))}
        </div>
      </div>

      {/* Prompt Input Form */}
      <form onSubmit={handleSubmit} className="relative">
        <textarea
          rows={3}
          placeholder="Ask the Agent to audit the catalogue, identify quality defects, suggest corrections, or sync..."
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          disabled={isLoading}
          className="w-full p-4 pr-32 bg-slate-950/80 border border-slate-700 rounded-2xl text-sm text-white placeholder-slate-500 focus:outline-none focus:border-emerald-500 focus:ring-1 focus:ring-emerald-500 transition shadow-inner resize-none"
        />
        <button
          type="submit"
          disabled={isLoading || !prompt.trim()}
          className="absolute right-3 bottom-4 flex items-center space-x-2 px-4 py-2.5 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-500 hover:to-teal-500 disabled:opacity-50 disabled:cursor-not-allowed text-white text-xs font-bold rounded-xl shadow-md shadow-emerald-500/20 transition active:scale-95"
        >
          {isLoading ? (
            <>
              <RefreshCw className="w-3.5 h-3.5 animate-spin" />
              <span>Executing Tools...</span>
            </>
          ) : (
            <>
              <span>Execute Agent</span>
              <Send className="w-3.5 h-3.5" />
            </>
          )}
        </button>
      </form>

      {/* Conversation & Tool Execution Log Stream */}
      <div className="space-y-4">
        <h3 className="text-xs font-semibold uppercase tracking-wider text-slate-400 flex items-center space-x-1.5">
          <Terminal className="w-4 h-4 text-emerald-400" />
          <span>Agent Execution Trace & Verification Logs</span>
        </h3>

        {agentHistory.length === 0 ? (
          <div className="p-8 rounded-2xl bg-slate-900/40 border border-slate-800 text-center space-y-2">
            <Bot className="w-8 h-8 text-slate-600 mx-auto" />
            <p className="text-sm font-medium text-slate-400">No agent sessions yet in this session.</p>
            <p className="text-xs text-slate-500 max-w-md mx-auto">
              Select one of the prompt templates above or type your instruction. The agent will execute actual backend tool calls and display each step.
            </p>
          </div>
        ) : (
          agentHistory.map((session, sIdx) => (
            <AgentSessionCard 
              key={sIdx} 
              session={session} 
              onNavigateToProposals={onNavigateToProposals} 
            />
          ))
        )}
      </div>
    </div>
  );
}

function AgentSessionCard({ session, onNavigateToProposals }) {
  const [expanded, setExpanded] = useState(true);

  return (
    <div className="rounded-2xl bg-slate-900/80 border border-slate-800 overflow-hidden shadow-lg">
      {/* Session Header */}
      <div className="p-4 bg-slate-950/70 border-b border-slate-800/80 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <div className="w-8 h-8 rounded-lg bg-emerald-500/10 border border-emerald-500/30 flex items-center justify-center text-emerald-400">
            <Cpu className="w-4 h-4" />
          </div>
          <div>
            <div className="text-xs font-semibold text-white">
              Prompt: <span className="text-emerald-300 font-normal">"{session.prompt}"</span>
            </div>
            <div className="flex items-center space-x-2 text-[11px] text-slate-400 mt-0.5">
              <span>Engine: <span className="text-slate-300 font-medium">{session.provider}</span></span>
              <span>•</span>
              <span>Steps Executed: <span className="text-emerald-400 font-bold">{session.steps?.length || 0}</span></span>
              <span>•</span>
              <span>{new Date(session.timestamp).toLocaleTimeString()}</span>
            </div>
          </div>
        </div>

        <button
          onClick={() => setExpanded(!expanded)}
          className="p-1.5 rounded-lg text-slate-400 hover:text-white hover:bg-slate-800 transition"
        >
          {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
        </button>
      </div>

      {/* Expanded Tool Execution Steps */}
      {expanded && (
        <div className="p-5 space-y-4">
          {/* Step Timeline */}
          <div className="space-y-3">
            {session.steps?.map((step, idx) => (
              <div 
                key={idx} 
                className={`p-3.5 rounded-xl border text-xs ${
                  step.type === 'tool_call'
                    ? 'bg-blue-950/20 border-blue-500/30 text-blue-200'
                    : step.type === 'tool_result'
                    ? 'bg-emerald-950/20 border-emerald-500/30 text-emerald-200'
                    : 'bg-slate-950/40 border-slate-800 text-slate-300'
                }`}
              >
                <div className="flex items-center justify-between font-semibold mb-1">
                  <div className="flex items-center space-x-2">
                    <span className="px-1.5 py-0.5 rounded text-[10px] uppercase font-mono bg-slate-800 text-slate-300">
                      Step {step.step}: {step.type}
                    </span>
                    <span className="text-white">{step.title}</span>
                  </div>
                  {step.tool && (
                    <code className="text-emerald-400 font-mono text-[11px]">
                      {step.tool}()
                    </code>
                  )}
                </div>

                {step.details && <p className="text-slate-300 mt-1">{step.details}</p>}
                {step.reasoning && (
                  <p className="text-slate-400 italic mt-1">
                    <strong className="text-slate-300 font-semibold not-italic">Agent Reasoning: </strong>
                    {step.reasoning}
                  </p>
                )}
                {step.summary && <p className="text-emerald-300 font-medium mt-1">✓ {step.summary}</p>}

                {/* Inspectable tool arguments / output */}
                {step.arguments && (
                  <details className="mt-2 text-[11px] font-mono bg-slate-950/80 p-2 rounded-lg border border-slate-800/80">
                    <summary className="cursor-pointer text-slate-400 hover:text-slate-200">
                      View Tool Arguments
                    </summary>
                    <pre className="mt-1 text-slate-300 overflow-x-auto whitespace-pre-wrap">
                      {JSON.stringify(step.arguments, null, 2)}
                    </pre>
                  </details>
                )}

                {step.output && (
                  <details className="mt-2 text-[11px] font-mono bg-slate-950/80 p-2 rounded-lg border border-slate-800/80">
                    <summary className="cursor-pointer text-slate-400 hover:text-slate-200">
                      View Real Backend Output JSON
                    </summary>
                    <pre className="mt-1 text-emerald-300/90 overflow-x-auto whitespace-pre-wrap max-h-48">
                      {JSON.stringify(step.output, null, 2)}
                    </pre>
                  </details>
                )}
              </div>
            ))}
          </div>

          {/* Staged Proposals Callout */}
          {session.proposals && session.proposals.length > 0 && (
            <div className="p-4 rounded-xl bg-gradient-to-r from-indigo-950/40 to-purple-950/40 border border-indigo-500/40 flex items-center justify-between">
              <div>
                <div className="text-xs font-bold text-white flex items-center space-x-1.5">
                  <ShieldCheck className="w-4 h-4 text-indigo-400" />
                  <span>{session.proposals.length} Proposals Staged for Human Approval</span>
                </div>
                <p className="text-[11px] text-slate-300 mt-0.5">
                  Safe Agent Policy: Generated fixes require explicit approval before database persistence.
                </p>
              </div>

              <button
                onClick={onNavigateToProposals}
                className="px-3.5 py-1.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg text-xs font-semibold shadow transition"
              >
                Review in Proposals Tab
              </button>
            </div>
          )}

          {/* Formatted Markdown Output */}
          <div className="p-4 rounded-xl bg-slate-950/60 border border-slate-800/80 text-xs text-slate-200 leading-relaxed whitespace-pre-line">
            {session.message}
          </div>
        </div>
      )}
    </div>
  );
}
