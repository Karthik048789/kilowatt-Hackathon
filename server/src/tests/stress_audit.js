import assert from 'assert';

const BASE_URL = 'http://localhost:5000/api';

async function runStressAudit() {
  console.log('=== STARTING DEEP STRESS & EDGE-CASE BUG AUDIT ===\n');

  // 1. Health check
  console.log('[Check 1] Health Endpoint...');
  const healthRes = await fetch(`${BASE_URL}/health`);
  assert.strictEqual(healthRes.status, 200);
  const health = await healthRes.json();
  assert.strictEqual(health.status, 'ok');
  console.log('✓ Health endpoint OK.');

  // 2. Settings & DB Status (MongoDB Atlas)
  console.log('\n[Check 2] Settings & MongoDB Atlas Status...');
  const settRes = await fetch(`${BASE_URL}/settings`);
  assert.strictEqual(settRes.status, 200);
  const sett = await settRes.json();
  assert(sett.dbStatus, 'dbStatus must exist');
  assert(typeof sett.dbStatus.connected === 'boolean', 'dbStatus.connected should be a boolean');
  assert(sett.dbStatus.dbType, 'dbStatus.dbType should be defined');
  console.log(`✓ Database Status: ${sett.dbStatus.dbType} (connected: ${sett.dbStatus.connected})`);

  // 3. Product Queries & Filter Edge Cases
  console.log('\n[Check 3] Product Search & Filter Edge Cases...');
  const allProds = await (await fetch(`${BASE_URL}/products`)).json();
  assert(Array.isArray(allProds));
  console.log(`✓ Products count: ${allProds.length}`);

  // Search filter
  const searchRes = await (await fetch(`${BASE_URL}/products?search=Earbuds`)).json();
  assert(Array.isArray(searchRes));
  console.log(`✓ Search "Earbuds" returned ${searchRes.length} items`);

  // Needs attention filter
  const attentionRes = await (await fetch(`${BASE_URL}/products?needsAttention=true`)).json();
  assert(Array.isArray(attentionRes));
  console.log(`✓ Needs attention returned ${attentionRes.length} items`);

  // 4. Validation Edge Cases
  console.log('\n[Check 4] Strict Validation Edge Cases...');

  // Blank name
  const blankNameRes = await fetch(`${BASE_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: '   ', sku: 'VAL-TEST-01', price: 10 })
  });
  assert.strictEqual(blankNameRes.status, 400, 'Blank name must return 400');
  console.log('✓ Rejection of blank product name verified (400 Bad Request).');

  // Blank SKU
  const blankSkuRes = await fetch(`${BASE_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Valid Name', sku: '  ', price: 10 })
  });
  assert.strictEqual(blankSkuRes.status, 400, 'Blank SKU must return 400');
  console.log('✓ Rejection of blank SKU verified (400 Bad Request).');

  // Negative Price
  const negPriceRes = await fetch(`${BASE_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Valid Name', sku: 'VAL-TEST-02', price: -15 })
  });
  assert.strictEqual(negPriceRes.status, 400, 'Negative price must return 400');
  console.log('✓ Rejection of negative price verified (400 Bad Request).');

  // Duplicate SKU Case-Insensitive
  const testSku = `EDGE-SKU-${Date.now()}`;
  const validProd = await (await fetch(`${BASE_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Edge Case Product', sku: testSku, price: 55 })
  })).json();
  assert(validProd.id);

  const dupRes = await fetch(`${BASE_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Duplicate SKU Attempt', sku: testSku.toLowerCase(), price: 60 })
  });
  assert.strictEqual(dupRes.status, 409, 'Duplicate SKU must return 409 Conflict');
  console.log('✓ Case-insensitive duplicate SKU correctly rejected with 409 Conflict.');

  // Clean up
  await fetch(`${BASE_URL}/products/${validProd.id}`, { method: 'DELETE' });
  console.log('✓ Cleaned up test product.');

  // 5. Agent Chat & Tool Execution Loop
  console.log('\n[Check 5] AI Agent Empty Prompt & Execution Loop...');
  const emptyAgentRes = await fetch(`${BASE_URL}/agent/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ prompt: '  ' })
  });
  assert.strictEqual(emptyAgentRes.status, 400, 'Empty prompt must return 400');
  console.log('✓ Empty agent prompt rejected with 400.');

  // 6. WooCommerce Integration in Demo Mode
  console.log('\n[Check 6] WooCommerce Connection & Sync Safety...');
  const wcStatus = await (await fetch(`${BASE_URL}/woocommerce/status`)).json();
  assert.strictEqual(wcStatus.isDemo, true);
  console.log('✓ WooCommerce reported transparent DEMO MODE.');

  // Test sync on product with invalid price
  const zeroPriceProd = await (await fetch(`${BASE_URL}/products`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ name: 'Zero Price Test', sku: `ZERO-${Date.now()}`, price: 0 })
  })).json();

  const syncFailRes = await fetch(`${BASE_URL}/woocommerce/sync/${zeroPriceProd.id}`, { method: 'POST' });
  assert.strictEqual(syncFailRes.status, 500, 'Sync of $0 price must fail');
  console.log('✓ Prevented WooCommerce sync of $0 price product.');

  await fetch(`${BASE_URL}/products/${zeroPriceProd.id}`, { method: 'DELETE' });
  console.log('✓ Cleaned up zero-price product.');

  // 7. Activity Logs
  console.log('\n[Check 7] Activity & Audit Logs...');
  const logs = await (await fetch(`${BASE_URL}/logs?limit=5`)).json();
  assert(Array.isArray(logs));
  assert(logs.length > 0);
  console.log(`✓ Fetched ${logs.length} recent audit log entries.`);

  console.log('\n======================================================');
  console.log('>>> ZERO BUGS DETECTED! ALL STRESS AUDITS PASSED! <<<');
  console.log('======================================================\n');
}

runStressAudit().catch(err => {
  console.error('\n❌ Stress audit failed:', err);
  process.exit(1);
});
