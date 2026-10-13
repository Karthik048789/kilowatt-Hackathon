import React, { useState, useEffect } from 'react';
import Navbar from './components/Navbar.jsx';
import Sidebar from './components/Sidebar.jsx';
import DashboardStats from './components/DashboardStats.jsx';
import ProductCatalogue from './components/ProductCatalogue.jsx';
import ProductModal from './components/ProductModal.jsx';
import AgentChatPanel from './components/AgentChatPanel.jsx';
import PendingProposals from './components/PendingProposals.jsx';
import WooCommerceSyncPanel from './components/WooCommerceSyncPanel.jsx';
import ActivityLogs from './components/ActivityLogs.jsx';
import SettingsModal from './components/SettingsModal.jsx';
import NotificationToast from './components/NotificationToast.jsx';
import { api } from './api/client.js';

export default function App() {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [products, setProducts] = useState([]);
  const [stats, setStats] = useState(null);
  const [proposals, setProposals] = useState([]);
  const [logs, setLogs] = useState([]);
  const [settings, setSettings] = useState(null);
  const [agentHistory, setAgentHistory] = useState(() => {
    try {
      const saved = localStorage.getItem('smartpim_agent_history');
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  useEffect(() => {
    try {
      localStorage.setItem('smartpim_agent_history', JSON.stringify(agentHistory));
    } catch (e) {}
  }, [agentHistory]);

  // Modals & loading states
  const [isProductModalOpen, setIsProductModalOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [isAgentLoading, setIsAgentLoading] = useState(false);
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'success') => {
    setToast({ message, type });
  };

  const loadData = async () => {
    try {
      const [prods, st, props, lg, sett] = await Promise.all([
        api.getProducts(),
        api.getProductStats(),
        api.getProposals(),
        api.getLogs(),
        api.getSettings()
      ]);
      setProducts(prods);
      setStats(st);
      setProposals(props);
      setLogs(lg);
      setSettings(sett);
    } catch (err) {
      console.error('Failed to load application data:', err);
      showToast(err.message, 'error');
    }
  };

  useEffect(() => {
    loadData();
  }, []);

  // --- Product CRUD Actions ---
  const handleOpenAddProduct = () => {
    setEditingProduct(null);
    setIsProductModalOpen(true);
  };

  const handleOpenEditProduct = (prod) => {
    setEditingProduct(prod);
    setIsProductModalOpen(true);
  };

  const handleSaveProduct = async (formData) => {
    try {
      setIsLoading(true);
      if (editingProduct) {
        await api.updateProduct(editingProduct.id, formData);
        showToast(`Successfully updated "${formData.name}"`);
      } else {
        await api.createProduct(formData);
        showToast(`Created new product "${formData.name}"`);
      }
      setIsProductModalOpen(false);
      await loadData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleDeleteProduct = async (id, name) => {
    if (!window.confirm(`Are you sure you want to delete product "${name}"?`)) return;
    try {
      setIsLoading(true);
      await api.deleteProduct(id);
      showToast(`Deleted product "${name}"`, 'info');
      await loadData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleAuditProduct = async (id) => {
    try {
      const res = await api.auditProduct(id);
      showToast(`Audit complete: Score is ${res.audit.score}%`);
      await loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // --- Agentic AI Execution ---
  const handleRunAgent = async (prompt) => {
    try {
      setIsAgentLoading(true);
      const res = await api.runAgentChat(prompt);
      
      const newSession = {
        prompt,
        timestamp: new Date().toISOString(),
        provider: res.provider,
        steps: res.steps,
        proposals: res.proposals,
        message: res.message
      };

      setAgentHistory(prev => [newSession, ...prev]);
      showToast(`AI Agent executed ${res.steps?.length || 0} tool & reasoning steps.`);
      await loadData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsAgentLoading(false);
    }
  };

  const handleOpenAgentForProduct = (prod) => {
    setActiveTab('agent');
    handleRunAgent(`Audit and enrich product "${prod.name}" (SKU: ${prod.sku}), resolve its quality issues, and propose fixes for approval.`);
  };

  // --- Proposal Approvals ---
  const handleApproveProposal = async (id) => {
    try {
      setIsLoading(true);
      const res = await api.approveProposal(id);
      showToast(res.message);
      await loadData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleRejectProposal = async (id, reason) => {
    try {
      setIsLoading(true);
      const res = await api.rejectProposal(id, reason);
      showToast(res.message, 'warning');
      await loadData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleApproveAll = async () => {
    try {
      setIsLoading(true);
      const res = await api.approveAllProposals();
      showToast(res.message);
      await loadData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleClearProposals = async () => {
    try {
      await api.clearProposals();
      showToast('Proposal history cleared', 'info');
      await loadData();
    } catch (err) {
      showToast(err.message, 'error');
    }
  };

  // --- WooCommerce Sync ---
  const handleSyncSingle = async (id) => {
    try {
      setIsLoading(true);
      const res = await api.syncProduct(id);
      showToast(res.message);
      await loadData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSyncAll = async () => {
    try {
      setIsLoading(true);
      const res = await api.syncAllProducts();
      showToast(`Synchronized ${res.syncedCount} products to WooCommerce.`);
      await loadData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleImportRemote = async () => {
    try {
      setIsLoading(true);
      const res = await api.importWooCommerceProducts();
      showToast(res.message);
      await loadData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleCheckWcStatus = async () => {
    return await api.getWooCommerceStatus();
  };

  // --- Settings ---
  const handleSaveSettings = async (newSettings) => {
    try {
      setIsLoading(true);
      const res = await api.updateSettings(newSettings);
      setSettings(res.settings);
      setIsSettingsModalOpen(false);
      showToast('Settings and credentials saved successfully.');
      await loadData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  const handleResetDemo = async () => {
    try {
      setIsLoading(true);
      const res = await api.resetDemoData();
      showToast(res.message, 'warning');
      await loadData();
    } catch (err) {
      showToast(err.message, 'error');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex flex-col min-h-screen bg-[#0b0f17] text-slate-100 font-sans">
      {/* Top Navbar */}
      <Navbar
        onOpenSettings={() => setIsSettingsModalOpen(true)}
        onTriggerAudit={() => setActiveTab('agent')}
        onResetDemo={handleResetDemo}
        stats={stats}
        isDemoMode={settings?.demoMode !== false}
        activeTab={activeTab}
        setActiveTab={setActiveTab}
      />

      {/* Main Body */}
      <div className="flex flex-1 overflow-hidden">
        {/* Sidebar */}
        <Sidebar
          activeTab={activeTab}
          setActiveTab={setActiveTab}
          stats={stats}
        />

        {/* Content Area */}
        <main className="flex-1 p-6 md:p-8 overflow-y-auto max-h-[calc(100vh-61px)]">
          <div className="max-w-7xl mx-auto space-y-6">
            {activeTab === 'dashboard' && (
              <>
                <DashboardStats
                  stats={stats}
                  onLaunchAgent={() => setActiveTab('agent')}
                  onViewAttention={() => setActiveTab('catalogue')}
                  onViewSync={() => setActiveTab('sync')}
                />
                <ProductCatalogue
                  products={products}
                  onAddProduct={handleOpenAddProduct}
                  onEditProduct={handleOpenEditProduct}
                  onDeleteProduct={handleDeleteProduct}
                  onSyncProduct={handleSyncSingle}
                  onAuditProduct={handleAuditProduct}
                  onOpenAgentForProduct={handleOpenAgentForProduct}
                />
              </>
            )}

            {activeTab === 'catalogue' && (
              <ProductCatalogue
                products={products}
                onAddProduct={handleOpenAddProduct}
                onEditProduct={handleOpenEditProduct}
                onDeleteProduct={handleDeleteProduct}
                onSyncProduct={handleSyncSingle}
                onAuditProduct={handleAuditProduct}
                onOpenAgentForProduct={handleOpenAgentForProduct}
              />
            )}

            {activeTab === 'agent' && (
              <AgentChatPanel
                onRunAgent={handleRunAgent}
                isLoading={isAgentLoading}
                agentHistory={agentHistory}
                onNavigateToProposals={() => setActiveTab('proposals')}
                pendingProposalsCount={stats?.pendingProposals || 0}
                onResetDemo={handleResetDemo}
              />
            )}

            {activeTab === 'proposals' && (
              <PendingProposals
                proposals={proposals}
                onApproveProposal={handleApproveProposal}
                onRejectProposal={handleRejectProposal}
                onApproveAll={handleApproveAll}
                onClearProposals={handleClearProposals}
                isLoading={isLoading}
              />
            )}

            {activeTab === 'sync' && (
              <WooCommerceSyncPanel
                products={products}
                onSyncSingle={handleSyncSingle}
                onSyncAll={handleSyncAll}
                onImportRemote={handleImportRemote}
                onCheckStatus={handleCheckWcStatus}
                onOpenSettings={() => setIsSettingsModalOpen(true)}
                isLoading={isLoading}
              />
            )}

            {activeTab === 'logs' && (
              <ActivityLogs
                logs={logs}
                onRefreshLogs={loadData}
                isLoading={isLoading}
              />
            )}
          </div>
        </main>
      </div>

      {/* Add / Edit Product Modal */}
      <ProductModal
        isOpen={isProductModalOpen}
        onClose={() => setIsProductModalOpen(false)}
        onSave={handleSaveProduct}
        product={editingProduct}
        existingSkus={products
          .filter(p => !editingProduct || p.id !== editingProduct.id)
          .map(p => p.sku)
        }
      />

      {/* Settings & Credentials Modal */}
      <SettingsModal
        isOpen={isSettingsModalOpen}
        onClose={() => setIsSettingsModalOpen(false)}
        onSaveSettings={handleSaveSettings}
        currentSettings={settings}
      />

      {/* Notification Toast */}
      <NotificationToast
        toast={toast}
        onClose={() => setToast(null)}
      />
    </div>
  );
}
