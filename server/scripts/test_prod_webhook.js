import { createInternalAgentToken } from '../middleware/auth.js';

const token = createInternalAgentToken({
  id: '11111111-1111-1111-1111-111111111111',
  role: 'MANAGER',
  name: 'Store Manager'
});

async function runTest(label, message, sessionId) {
  console.log(`\n========================================`);
  console.log(`TEST: ${label}`);
  console.log(`Input message: "${message}"`);
  const payload = {
    message,
    role: 'MANAGER',
    userRole: 'MANAGER',
    internalAuthToken: token,
    sessionId: sessionId || 'test-session-' + Date.now()
  };

  try {
    const res = await fetch('http://localhost:5678/webhook/stocksense-agent', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    console.log(`Status: ${res.status}`);
    const data = await res.json();
    console.log('Response JSON:');
    console.log(JSON.stringify(data, null, 2));
    return data;
  } catch (err) {
    console.error(`Error:`, err.message);
  }
}

async function main() {
  // 1. Repeated greeting
  await runTest('Greeting #1', 'Hi');
  await runTest('Greeting #2', 'hello');

  // 2. Irrelevant query
  await runTest('Irrelevant Request', 'What is the capital of France?');

  // 3. Category discovery
  await runTest('Category Discovery', 'What categories do we have?');

  // 4. Product discovery
  await runTest('Product Discovery', 'Show me all products');

  // 5. Prepare stock change
  await runTest('Prepare Stock Change', 'Add 40 Type-C cables from Ali Traders');
}

main();
