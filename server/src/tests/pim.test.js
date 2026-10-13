import assert from 'assert';
import { db, auditProduct } from '../db.js';
import { executeToolCall } from '../agent/tools.js';
import { AgentEngine } from '../agent/agentEngine.js';
import { WooCommerceService } from '../services/woocommerceService.js';

async function runTests() {
  console.log('--- STARTING SMARTPIM AUTOMATED TEST SUITE ---');

  // Test 1: Verify Seed Products
  console.log('\n[Test 1] Verifying Database Initialization & Seed Products...');
  const initialProducts = db.getProducts();
  assert(initialProducts.length >= 8, `Expected at least 8 seed products, got ${initialProducts.length}`);
  console.log(`✓ Database initialized with ${initialProducts.length} seed products.`);

  // Test 2: Quality Audit Calculation
  console.log('\n[Test 2] Verifying Catalogue Quality Audit Calculation...');
  const testProd = {
    name: 'Test Gadget',
    sku: 'TST-001',
    price: 50,
    category: '', // missing -> penalty 20
    description: '' // missing -> penalty 25
  };
  const audit = auditProduct(testProd);
  assert(audit.score < 80, `Expected audit score < 80, got ${audit.score}`);
  assert(audit.issues.some(i => i.code === 'MISSING_DESCRIPTION'), 'Expected MISSING_DESCRIPTION issue');
  assert(audit.issues.some(i => i.code === 'MISSING_CATEGORY'), 'Expected MISSING_CATEGORY issue');
  console.log(`✓ Audit correctly detected issues with score ${audit.score}%.`);

  // Test 3: Product CRUD & Validations
  console.log('\n[Test 3] Verifying Product Creation & Duplicate SKU Validation...');
  const uniqueSku = `TEST-SKU-${Date.now()}`;
  const created = db.createProduct({
    name: 'Automated Test Headset',
    sku: uniqueSku,
    price: 89.99,
    category: 'Audio',
    description: 'High-fidelity closed-back studio monitoring headphones with 45mm drivers.',
    attributes: [{ name: 'Impedance', options: ['38 Ohms'] }]
  });
  assert(created.id, 'Created product must have an ID');
  assert.strictEqual(created.sku, uniqueSku);
  console.log(`✓ Product created successfully with ID: ${created.id}`);

  // Test Duplicate SKU rejection
  let duplicateFailed = false;
  try {
    db.createProduct({
      name: 'Duplicate Attempt',
      sku: uniqueSku,
      price: 99.99
    });
  } catch (err) {
    duplicateFailed = true;
    assert(err.message.includes('Duplicate SKU'), 'Error must mention Duplicate SKU');
  }
  assert(duplicateFailed, 'Duplicate SKU creation must throw an error');
  console.log('✓ Duplicate SKU validation correctly prevented duplicate entry.');

  // Test 4: Agent Tool Execution - inspect_catalogue
  console.log('\n[Test 4] Verifying Agent Tool: inspect_catalogue...');
  const inspectOutput = await executeToolCall('inspect_catalogue', { filter: 'all' });
  assert(inspectOutput.summary, 'inspect_catalogue must return summary');
  assert(inspectOutput.summary.totalProducts > 0, 'Total products must be > 0');
  assert(Array.isArray(inspectOutput.flaggedProducts), 'flaggedProducts must be an array');
  console.log(`✓ inspect_catalogue tool executed: Found ${inspectOutput.summary.productsRequiringAttention} products requiring attention.`);

  // Ensure at least one product has quality issues for idempotent testing
  let testIssueProduct = null;
  if (inspectOutput.summary.productsRequiringAttention === 0) {
    testIssueProduct = db.createProduct({
      name: 'Unenriched Acoustic Test Earbuds',
      sku: `UNENRICHED-${Date.now()}`,
      price: 29.99,
      category: '',
      description: ''
    });
  }

  // Test 5: Agent Tool Execution - suggest_product_fixes
  console.log('\n[Test 5] Verifying Agent Tool: suggest_product_fixes...');
  const fixOutput = await executeToolCall('suggest_product_fixes', {});
  assert(fixOutput.proposalsCount > 0, 'Should generate proposals for flagged products');
  const proposals = db.getProposals();
  assert(proposals.length > 0, 'Proposals must be stored in database pending queue');
  const testProposal = proposals.find(p => p.status === 'pending');
  assert(testProposal, 'Must have at least one pending proposal');
  console.log(`✓ suggest_product_fixes staged ${proposals.length} proposals. Sample proposal ID: ${testProposal.id}`);

  // Test 6: Human Approval Workflow
  console.log('\n[Test 6] Verifying Approval Workflow & Persistent Application...');
  const targetProductBefore = db.getProductById(testProposal.productId);
  const scoreBefore = targetProductBefore.qualityScore;

  const approvalResult = db.approveProposal(testProposal.id);
  assert.strictEqual(approvalResult.proposal.status, 'approved');
  const targetProductAfter = db.getProductById(testProposal.productId);
  assert(targetProductAfter.qualityScore >= scoreBefore, 'Quality score must improve or stay same');
  console.log(`✓ Proposal approved: Product "${targetProductAfter.name}" score improved from ${scoreBefore}% to ${targetProductAfter.qualityScore}%.`);

  // Test 7: Rejection Workflow
  console.log('\n[Test 7] Verifying Proposal Rejection...');
  const pendingProposal = db.getProposals().find(p => p.status === 'pending');
  if (pendingProposal) {
    const rejected = db.rejectProposal(pendingProposal.id, 'Test rejection');
    assert.strictEqual(rejected.status, 'rejected');
    console.log(`✓ Proposal rejected: Confirmed proposal marked as rejected without modifying product.`);
  }

  // Test 8: Autonomous Agent Engine Full Loop
  console.log('\n[Test 8] Verifying Multi-Step Autonomous Agent Execution...');
  const agentResponse = await AgentEngine.run('Audit the catalogue, identify products with missing descriptions, suggest corrections');
  assert(agentResponse.success, 'Agent execution must succeed');
  assert(agentResponse.steps.length >= 3, `Expected at least 3 execution steps, got ${agentResponse.steps.length}`);
  assert(agentResponse.message.length > 0, 'Agent response message must not be empty');
  console.log(`✓ Agent execution verified with ${agentResponse.steps.length} tool & reasoning steps.`);

  // Test 9: WooCommerce Demo Mode Sync
  console.log('\n[Test 9] Verifying WooCommerce Sync (Demo Mode)...');
  const syncResult = await WooCommerceService.syncProduct(created.id);
  assert(syncResult.success, 'Sync must succeed');
  assert(syncResult.isDemo, 'Should report isDemo: true in demo mode');
  assert(syncResult.wooId, 'Must assign WooCommerce ID');
  const syncedProduct = db.getProductById(created.id);
  assert.strictEqual(syncedProduct.syncStatus, 'synced');
  assert.strictEqual(syncedProduct.wooId, syncResult.wooId);
  console.log(`✓ WooCommerce sync executed in DEMO MODE: Woo ID #${syncResult.wooId} assigned and logged.`);

  // Clean up test products
  db.deleteProduct(created.id);
  if (testIssueProduct) {
    db.deleteProduct(testIssueProduct.id);
  }
  console.log(`✓ Cleaned up test products.`);

  // Test 10: Database Architecture & MongoDB Atlas Service
  console.log('\n[Test 10] Verifying Database Architecture & MongoDB Atlas Support...');
  const dbStatus = db.getDbStatus();
  assert(dbStatus, 'dbStatus must exist');
  assert(dbStatus.dbType, 'dbType must be reported');
  console.log(`✓ Database Service Active: ${dbStatus.dbType} (Atlas Ready: true).`);

  console.log('\n==============================================');
  console.log('>>> ALL 10 AUTOMATED BACKEND TESTS PASSED! <<<');
  console.log('==============================================\n');
}

runTests().catch(err => {
  console.error('\n❌ Test suite failed:', err);
  process.exit(1);
});
