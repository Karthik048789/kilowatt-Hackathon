import express from 'express';
import { AgentEngine } from '../agent/agentEngine.js';
import { db } from '../db.js';

const router = express.Router();

// POST /api/agent/chat - Trigger AI Agent tool execution loop
router.post('/chat', async (req, res) => {
  // Server-side timeout: abort after 30s to prevent hanging connections
  const TIMEOUT_MS = 30000;
  let timedOut = false;
  const timeoutHandle = setTimeout(() => {
    timedOut = true;
    if (!res.headersSent) {
      res.status(504).json({ error: 'Agent execution timed out after 30 seconds.' });
    }
  }, TIMEOUT_MS);

  try {
    const { prompt, provider, apiKey } = req.body;

    if (!prompt || prompt.trim().length === 0) {
      clearTimeout(timeoutHandle);
      return res.status(400).json({ error: 'Agent requires a prompt to execute.' });
    }

    const result = await AgentEngine.run(prompt.trim(), { provider, apiKey });
    clearTimeout(timeoutHandle);
    if (!timedOut) res.json(result);
  } catch (err) {
    clearTimeout(timeoutHandle);
    console.error('Agent execution error:', err);
    if (!timedOut && !res.headersSent) {
      res.status(500).json({ error: err.message });
    }
  }
});

// GET /api/agent/proposals - Retrieve pending and past staged proposals
router.get('/proposals', (req, res) => {
  try {
    const proposals = db.getProposals();
    res.json(proposals);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/agent/proposals/approve-all  ← MUST be before /:id routes
router.post('/proposals/approve-all', (req, res) => {
  try {
    const proposals = db.getProposals();
    const pending = proposals.filter(p => p.status === 'pending');
    const applied = [];
    const errors = [];

    for (const prop of pending) {
      try {
        const r = db.approveProposal(prop.id);
        applied.push(r.product);
      } catch (e) {
        errors.push({ proposalId: prop.id, error: e.message });
      }
    }

    res.json({
      success: true,
      appliedCount: applied.length,
      errorsCount: errors.length,
      message: `Applied ${applied.length} pending AI proposals to the catalogue.`
    });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST /api/agent/proposals/:id/approve - Approve proposal and apply to product
router.post('/proposals/:id/approve', (req, res) => {
  try {
    const result = db.approveProposal(req.params.id);
    res.json({
      success: true,
      message: `Approved and applied AI enhancement for product "${result.product.name}".`,
      proposal: result.proposal,
      product: result.product
    });
  } catch (err) {
    if (err.message.includes('not found')) {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

// POST /api/agent/proposals/:id/reject - Reject proposal without altering product
router.post('/proposals/:id/reject', (req, res) => {
  try {
    const { reason } = req.body;
    const proposal = db.rejectProposal(req.params.id, reason);
    res.json({
      success: true,
      message: 'Proposal was rejected. Product was not modified.',
      proposal
    });
  } catch (err) {
    if (err.message.includes('not found')) {
      return res.status(404).json({ error: err.message });
    }
    res.status(500).json({ error: err.message });
  }
});

// DELETE /api/agent/proposals - Clear proposal history
router.delete('/proposals', (req, res) => {
  try {
    db.clearProposals();
    res.json({ success: true, message: 'Proposal queue cleared.' });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
