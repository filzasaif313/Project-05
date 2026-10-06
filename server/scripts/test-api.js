import assert from 'assert';

async function testApi() {
  console.log('🧪 Starting Direct Security & Functional API Tests...\n');
  const base = 'http://localhost:5000/api';

  // 1. Sign in as Staff
  const staffLogin = await fetch(`${base}/auth/demo-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'STAFF' })
  }).then(r => r.json());

  assert(staffLogin.token, 'Staff login failed to provide token');
  assert.strictEqual(staffLogin.user.role, 'STAFF', 'Role must be STAFF');
  console.log('✅ 1. Staff Demo Login succeeded:', staffLogin.user.name);

  // 2. Sign in as Manager
  const managerLogin = await fetch(`${base}/auth/demo-login`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ role: 'MANAGER' })
  }).then(r => r.json());

  assert(managerLogin.token, 'Manager login failed');
  assert.strictEqual(managerLogin.user.role, 'MANAGER', 'Role must be MANAGER');
  console.log('✅ 2. Manager Demo Login succeeded:', managerLogin.user.name);

  // 3. Verify Staff item list redacts cost_price
  const staffItems = await fetch(`${base}/items`, {
    headers: { 'Authorization': `Bearer ${staffLogin.token}` }
  }).then(r => r.json());

  const hasAnyCostPrice = staffItems.items.some(item => 'cost_price' in item);
  assert.strictEqual(hasAnyCostPrice, false, 'CRITICAL SECURITY BREACH: Staff saw cost_price!');
  console.log('✅ 3. Role Security Verified: Staff items list has ZERO cost_price fields.');

  // 4. Verify Manager item list includes cost_price
  const managerItems = await fetch(`${base}/items`, {
    headers: { 'Authorization': `Bearer ${managerLogin.token}` }
  }).then(r => r.json());

  const managerHasCost = managerItems.items.every(item => 'cost_price' in item);
  assert.strictEqual(managerHasCost, true, 'Manager must be able to view cost_price');
  console.log('✅ 4. Manager Access Verified: Manager can view all cost prices.');

  // 5. Test Case 4 Direct Attack: Staff attempts direct price modification
  const staffPriceAttack = await fetch(`${base}/items/1/price`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${staffLogin.token}`
    },
    body: JSON.stringify({ selling_price: 999.00 })
  });

  assert.strictEqual(staffPriceAttack.status, 403, 'Price attack should have returned 403 Forbidden!');
  const attackBody = await staffPriceAttack.json();
  assert.strictEqual(attackBody.error, 'PERMISSION_DENIED');
  console.log('✅ 5. Direct Price Attack Blocked: Server returned 403 Forbidden to Staff token.');

  // 6. Test Case 3: Zero-stock invariant check (Sell 8 when only 5 exist)
  // Find Men's Shirt (has 5 in stock)
  const shirt = managerItems.items.find(i => i.name.includes("Men's Oxford Cotton Shirt"));
  assert(shirt, "Men's shirt not found");

  const zeroStockAttack = await fetch(`${base}/stock/manual`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${staffLogin.token}`
    },
    body: JSON.stringify({
      itemId: shirt.id,
      movementType: 'SOLD',
      quantity: 8,
      supplierOrReason: 'Counter sale attempt'
    })
  });

  assert.strictEqual(zeroStockAttack.status, 400, 'Selling 8 when 5 exist must return 400');
  const zeroStockBody = await zeroStockAttack.json();
  assert.strictEqual(zeroStockBody.error, 'INSUFFICIENT_STOCK');
  console.log('✅ 6. Zero-Stock Guardrail Verified: Attempt to sell 8 when 5 exist was blocked with clear message:', zeroStockBody.message);

  // 7. Test Case 2: AI Prepare -> Cancel -> Confirm Lifecycle
  // Cable currently has 15
  const cable = managerItems.items.find(i => i.name.includes("Type-C"));
  assert(cable, "Type-C cable not found");
  const initialCableStock = cable.total_stock;

  // Ask AI in chat: "Add 40 Type-C cables from Ali Traders"
  const aiChatRes = await fetch(`${base}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${staffLogin.token}`
    },
    body: JSON.stringify({
      message: 'Add 40 Type-C cables from Ali Traders'
    })
  }).then(r => r.json());

  assert(aiChatRes.card, 'AI Chat should have returned a confirmation preview card');
  assert.strictEqual(aiChatRes.card.oldStock, initialCableStock);
  assert.strictEqual(aiChatRes.card.newStock, initialCableStock + 40);
  assert.strictEqual(aiChatRes.card.status, 'PENDING');
  console.log(`✅ 7a. AI Confirmation Card Prepared: ${aiChatRes.card.oldStock} → ${aiChatRes.card.newStock} (Ali Traders)`);

  const confId = aiChatRes.card.confirmationId;

  // Cancel the draft
  const cancelRes = await fetch(`${base}/stock/cancel`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${staffLogin.token}`
    },
    body: JSON.stringify({ confirmationId: confId })
  }).then(r => r.json());

  assert(cancelRes.success, 'Cancel should succeed');

  // Verify stock is STILL 15!
  const cableAfterCancel = await fetch(`${base}/items/${cable.id}`, {
    headers: { 'Authorization': `Bearer ${managerLogin.token}` }
  }).then(r => r.json());
  assert.strictEqual(cableAfterCancel.item.total_stock, initialCableStock, 'Stock MUST remain unchanged after Cancel');
  console.log('✅ 7b. Cancel Verified: Stock remains unchanged at', cableAfterCancel.item.total_stock);

  // Now ask again and Confirm!
  const aiChatRes2 = await fetch(`${base}/chat`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${staffLogin.token}`
    },
    body: JSON.stringify({
      message: 'Add 40 Type-C cables from Ali Traders'
    })
  }).then(r => r.json());

  const confId2 = aiChatRes2.card.confirmationId;

  const confirmRes = await fetch(`${base}/stock/confirm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${staffLogin.token}`
    },
    body: JSON.stringify({ confirmationId: confId2 })
  }).then(r => r.json());

  console.log('Confirm response payload:', confirmRes);
  assert(confirmRes.success, 'Confirm must succeed');
  assert.strictEqual(confirmRes.item.newStock, initialCableStock + 40, 'Stock must now be 55');
  console.log('✅ 7c. Confirm Verified: Stock updated to', confirmRes.item.newStock);

  // 8. Edge Check: Double-Click Replay Protection
  const doubleClickRes = await fetch(`${base}/stock/confirm`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${staffLogin.token}`
    },
    body: JSON.stringify({ confirmationId: confId2 })
  });
  assert.strictEqual(doubleClickRes.status, 409, 'Double click must return 409 Conflict');
  console.log('✅ 8. Double-Click Replay Protection Verified: Second confirmation rejected with 409 Conflict.');

  // 9. Verify History Entry
  const movementsRes = await fetch(`${base}/stock/movements?itemId=${cable.id}`, {
    headers: { 'Authorization': `Bearer ${managerLogin.token}` }
  }).then(r => r.json());

  const latestMovement = movementsRes.movements[0];
  assert.strictEqual(latestMovement.source, 'AI_CONFIRMED');
  assert.strictEqual(latestMovement.supplier_or_reason, 'Ali Traders');
  assert.strictEqual(latestMovement.quantity_change, 40);
  console.log('✅ 9. Audit Ledger Verified: Change recorded in history with who made it (', latestMovement.user_name, ') and supplier (', latestMovement.supplier_or_reason, ').');

  console.log('\n🎉 ALL 9 AUTOMATED SECURITY AND BUSINESS LOGIC TESTS PASSED!\n');
}

testApi().catch(err => {
  console.error('\n❌ TEST FAILED:', err);
  process.exit(1);
});
