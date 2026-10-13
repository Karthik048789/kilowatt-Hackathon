# SmartPIM AI — AI-Powered Product Information Management with WooCommerce Integration

> **Kilowott Placement Challenge MVP**  
> *Demonstrating Autonomous Agentic AI, Multi-Turn Tool Calling, Human-in-the-Loop Safeguards, and WooCommerce REST API Integration.*

---

## 🌟 Executive Overview

**SmartPIM AI** is an enterprise-grade Product Information Management (PIM) platform built with **React, Tailwind CSS, Node.js / Express**, and an **Autonomous Agentic AI Engine**. It empowers e-commerce and catalogue operations teams to:
1. Manage product records with strict validations (duplicate SKU prevention, price sanity, required fields).
2. Automatically audit catalogue data quality and identify missing descriptions, blank categories, or weak specifications.
3. Deploy an **Autonomous Product Catalogue AI Agent** that executes genuine backend tool calling to inspect products, generate tailored e-commerce enhancements, and stage proposed diffs.
4. Review and approve AI-generated changes with strict **Human-in-the-Loop (HITL)** safeguards before database persistence.
5. Synchronize validated products with **WooCommerce REST API v3** (or in transparent **DEMO MODE** when credentials are not configured).

---

## 📐 Architecture Explanation

```
                            ┌────────────────────────────────────────┐
                            │     SmartPIM AI React Client (Vite)    │
                            │  (Dashboard, Catalogue, Agent, Logs)   │
                            └───────────────────┬────────────────────┘
                                                │ REST API Calls (/api)
                                                ▼
                            ┌────────────────────────────────────────┐
                            │      Express API & Middleware Layer    │
                            │   (/products, /agent, /woocommerce)    │
                            └───────┬──────────────┬──────────────┬──┘
                                    │              │              │
                   ┌────────────────┘              │              └────────────────┐
                   ▼                               ▼                               ▼
     ┌───────────────────────────┐   ┌───────────────────────────┐   ┌───────────────────────────┐
     │  Persistent JSON Storage  │   │   Agentic AI Engine Loop  │   │ WooCommerce REST Service  │
     │   • Products & Scores     │   │   • Intent Reasoning      │   │   • REST API v3 Client    │
     │   • Staged Proposals      │   │   • Dynamic Tool Selector │   │   • Schema Validation     │
     │   • Immutable Audit Logs  │   │   • Tool Execution Loop   │   │   • DEMO MODE Fallback    │
     └───────────────────────────┘   └─────────────┬─────────────┘   └───────────────────────────┘
                                                   │
                                     ┌─────────────┴─────────────┐
                                     │   Backend Tool Dispatcher │
                                     │   1. inspect_catalogue    │
                                     │   2. suggest_product_fixes│
                                     │   3. apply_product_fixes  │
                                     │   4. sync_product         │
                                     └───────────────────────────┘
```

### Key Architectural Pillars:
1. **Agentic Tool-Calling Loop**:
   - The AI Agent is **NOT** a chatbot returning arbitrary static text. It executes an autonomous multi-turn reasoning and tool invocation loop.
   - Upon receiving an objective (e.g. *"Audit catalogue, identify products with missing descriptions, suggest corrections, and show me changes before applying"*), the agent invokes `inspect_catalogue`, analyzes output, decides to call `suggest_product_fixes`, stages before/after diffs in the Pending Proposals queue, and halts for user authorization.
2. **Pluggable AI Engine**:
   - **Autonomous Tool-Calling Engine (Built-in)**: Zero-dependency local orchestrator guaranteeing full demonstration readiness out of the box without external API keys.
   - **Google Gemini (Live Function Calling)**: Directly executes function declarations against Gemini 1.5/2.0 Flash when an API key is provided in Settings.
   - **OpenAI (Live Tool Calling)**: Direct support for GPT-4o-mini tools.
3. **Safety & Human-in-the-Loop (HITL)**:
   - AI suggestions **never mutate live records directly**.
   - Changes are staged in an approval queue with calculated score improvements ($50\% \rightarrow 100\%$).
   - Explicit user approval applies changes and triggers atomic quality score recalculations; rejected proposals leave products intact.
4. **WooCommerce Integration & Transparent DEMO MODE**:
   - Connects to WooCommerce REST API v3 using HTTP Basic Authentication (`consumer_key`, `consumer_secret`).
   - If credentials are not yet configured, the system activates a transparent **DEMO SIMULATION MODE** that generates valid WooCommerce JSON payloads, validates them against WooCommerce schemas, assigns mock WooCommerce IDs, and logs the operation.

---

## 🛠️ Technology Stack

- **Frontend**: React 18, Vite, Tailwind CSS, Lucide Icons.
- **Backend**: Node.js v24, Express, Mongoose, UUID, Axios, Dotenv, Cors.
- **Database**: **MongoDB Atlas (Cloud Cluster)** with transparent fallback to Local Persistent JSON Storage.
- **Testing**: Automated backend test suite (`node src/tests/pim.test.js` - 10/10 passed) + Browser Subagent recording.

---

## 🚀 Installation & Quick Start

### 1. Prerequisites
- Node.js (v18+ recommended)
- npm

### 2. Install Dependencies
```bash
# Install root, server, and client packages
npm install
npm --prefix server install
npm --prefix client install
```

### 3. Environment Configuration
Copy the provided `.env.example` file:
```bash
cp .env.example .env
```
*(The application works immediately in DEMO MODE without any external API keys).*

### 4. Run the Application
```bash
# Run both Backend Server (port 5000) and Client (port 3000) concurrently:
npm run dev
```

- **Frontend Dashboard**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:5000/api/health](http://localhost:5000/api/health)

### 5. Run Automated Tests
```bash
npm test
# Or directly:
node server/src/tests/pim.test.js
```
*Executes all 9 automated verification checks (Seed data, Quality Audits, CRUD & Duplicate SKU validations, Tool Calling, Proposals, Approvals, Rejections, and WooCommerce Demo sync).*

---

## 📋 5-Step Evaluator Demonstration Script

Follow these 5 steps to verify all requirements of the Kilowott placement challenge:

### Step 1: Inspect Catalogue & Quality Health (Priority 1)
1. Open [http://localhost:3000](http://localhost:3000) in your browser.
2. Observe the **Summary Cards** (Total Products: 8, Catalogue Issues, Average Quality Score, and Sync Status).
3. In the **Product Catalogue** table, notice realistic products seeded with varying quality scores:
   - High-quality products (e.g. *Aurora Smart Ambient LED Strip* at 100%).
   - Products flagged with issues (e.g. *SonicPulse Wireless Earbuds* missing category and short description, or *HyperCharge 65W GaN Charger* missing description).
4. Click **"Add New Product"**, enter a duplicate SKU (e.g. `AUR-LGT-5M`), and observe client-side and server-side duplicate prevention.

### Step 2: Trigger Autonomous Product Catalogue AI Agent (Priority 2)
1. Click **"AI Agent Console"** on the sidebar or click **"Launch AI Agent"** in the top navigation.
2. Click the recommended prompt pill:
   > *"Audit the catalogue, identify products with missing descriptions or categories, suggest corrections, and show me the changes before applying them."*
3. Click **"Execute Agent"**.
4. Observe the multi-step execution trace in real time:
   - **Step 1**: Agent analyzes objective.
   - **Step 2 & 3**: Invokes `inspect_catalogue`, inspects real database records, flags quality issues.
   - **Step 4 & 5**: Evaluates that fixes are required; automatically selects and executes `suggest_product_fixes`.
   - **Step 6**: Stages proposed changes with before/after diffs in the Pending Proposals queue.

### Step 3: Human-in-the-Loop Proposal Review & Approval (Priority 3)
1. Navigate to the **"Pending Proposals"** tab on the sidebar (or click the callout button in the AI chat).
2. Review the staged proposal cards:
   - Inspect the **Quality Score Projection** (e.g. $55\% \rightarrow 100\%$).
   - Review the **Enriched Description**, **Category**, and **Technical Attributes**.
   - Read the AI Rationale explaining the commercial reasoning.
3. Click **"Approve & Apply to Catalogue"** on a proposal.
4. Switch to the **"Product Catalogue"** tab: verify that the product's quality score instantly increased to 100% and its live description was persisted.
5. On another proposal, click **"Reject"** and enter a reason: verify that the proposal is archived without altering the product.

### Step 4: WooCommerce REST API Synchronization (Priority 4)
1. Navigate to the **"WooCommerce Sync"** tab on the sidebar.
2. Observe the **DEMO SIMULATION MODE** banner explaining transparent schema validation when credentials are unconfigured.
3. Click **"Test Connection"** to verify connection status.
4. Click **"Sync All Ready Products"** (or click **"Sync Now"** on an individual product).
5. Verify that simulated WooCommerce IDs (e.g. `#1024`, `#4664`) and timestamps are assigned, and the product sync status changes to *Synced*.

### Step 5: Verify Audit & Immutable Activity Logs (Priority 5)
1. Navigate to the **"Audit & Sync Logs"** tab on the sidebar.
2. Review the chronological audit feed documenting:
   - System initialization.
   - Product updates and creations.
   - AI Agent inspections and proposal stagings.
   - Human approvals and score improvements.
   - WooCommerce synchronization events with payload metadata.
3. Click **Settings** in the top navbar to see how live WooCommerce credentials or Google Gemini / OpenAI API keys can be securely supplied at any time.

---

## 🔒 Security & Privacy Practices

- **Zero Plaintext Secrets**: API keys and WooCommerce secrets are stored exclusively server-side and masked in all UI responses (`ck_...****`).
- **Safe Environment**: The included `.env.example` contains only placeholders.
- **Fail-Safe Fallbacks**: If external APIs or credentials are unavailable, transparent local fallbacks activate with explicit **DEMO MODE** labeling.

---

## 📄 License
Created for the **Kilowott Placement Challenge**. All rights reserved.
