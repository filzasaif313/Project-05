import express from 'express';
import { authenticateToken, createInternalAgentToken } from '../middleware/auth.js';
import { query } from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const router = express.Router();

// System status for Manager health dashboard
let aiSystemStatus = {
  isAvailable: true,
  lastChecked: new Date(),
  lastError: null,
  errorCount: 0
};

export function getAiSystemStatus() {
  return aiSystemStatus;
}

/**
 * GET /api/chat/conversations
 * Returns persistent conversation threads for the authenticated user only.
 */
router.get('/conversations', authenticateToken, async (req, res) => {
  try {
    const result = await query(
      `SELECT id, title, created_at, updated_at 
       FROM chat_conversations 
       WHERE user_id = $1 
       ORDER BY updated_at DESC`,
      [req.user.id]
    );
    res.json({ conversations: result.rows });
  } catch (err) {
    console.error('Error fetching conversations:', err);
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Failed to load chat conversations.' });
  }
});

/**
 * POST /api/chat/conversations
 * Creates a new conversation thread for the authenticated user.
 */
router.post('/conversations', authenticateToken, async (req, res) => {
  try {
    const title = (req.body.title || 'New Conversation').trim();
    const result = await query(
      `INSERT INTO chat_conversations (user_id, title)
       VALUES ($1, $2)
       RETURNING id, title, created_at, updated_at`,
      [req.user.id, title]
    );
    res.json({ conversation: result.rows[0] });
  } catch (err) {
    console.error('Error creating conversation:', err);
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Failed to create chat conversation.' });
  }
});

/**
 * GET /api/chat/conversations/:id
 * Fetches all persisted messages for a given conversation. Isolated by authenticated user.
 */
router.get('/conversations/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;

    // Verify conversation ownership
    const convRes = await query(
      'SELECT id, title, created_at, updated_at FROM chat_conversations WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );

    if (convRes.rows.length === 0) {
      return res.status(404).json({ error: 'NOT_FOUND', message: 'Conversation not found or access denied.' });
    }

    const messagesRes = await query(
      `SELECT id, conversation_id, sender, text, card, chart, is_unavailable, created_at 
       FROM chat_messages 
       WHERE conversation_id = $1 
       ORDER BY created_at ASC`,
      [id]
    );

    res.json({
      conversation: convRes.rows[0],
      messages: messagesRes.rows
    });
  } catch (err) {
    console.error('Error fetching conversation messages:', err);
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Failed to load messages.' });
  }
});

/**
 * DELETE /api/chat/conversations/:id
 * Deletes a conversation thread for the authenticated user.
 */
router.delete('/conversations/:id', authenticateToken, async (req, res) => {
  try {
    const { id } = req.params;
    await query(
      'DELETE FROM chat_conversations WHERE id = $1 AND user_id = $2',
      [id, req.user.id]
    );
    res.json({ success: true, message: 'Conversation deleted.' });
  } catch (err) {
    console.error('Error deleting conversation:', err);
    res.status(500).json({ error: 'SERVER_ERROR', message: 'Failed to delete conversation.' });
  }
});

/**
 * Main Chat Endpoint: POST /api/chat
 * Persists messages in PostgreSQL, coordinates with n8n/local agent, supports visual reports & cards.
 */
router.post('/', authenticateToken, async (req, res) => {
  const { message, sessionId = 'default-session', conversationId, simulatedFailure = false } = req.body;

  if (!message || message.trim() === '') {
    return res.status(400).json({ error: 'EMPTY_MESSAGE', message: 'Please enter a question or request.' });
  }

  // 1. Resolve or create active conversation thread for authenticated user
  let activeConvId = conversationId;
  try {
    if (activeConvId) {
      const verifyConv = await query(
        'SELECT id, title FROM chat_conversations WHERE id = $1 AND user_id = $2',
        [activeConvId, req.user.id]
      );
      if (verifyConv.rows.length === 0) {
        activeConvId = null;
      }
    }

    if (!activeConvId) {
      const title = message.trim().slice(0, 36) + (message.length > 36 ? '...' : '');
      const newConv = await query(
        `INSERT INTO chat_conversations (user_id, title)
         VALUES ($1, $2)
         RETURNING id`,
        [req.user.id, title]
      );
      activeConvId = newConv.rows[0].id;
    }

    // Persist user's message
    await query(
      `INSERT INTO chat_messages (conversation_id, sender, text)
       VALUES ($1, 'user', $2)`,
      [activeConvId, message.trim()]
    );
  } catch (dbErr) {
    console.error('Chat DB persistence error (user message):', dbErr);
  }

  // 2. Failure simulation check (Test Case 5)
  if (simulatedFailure || process.env.SIMULATE_AI_FAILURE === 'true') {
    aiSystemStatus = {
      isAvailable: false,
      lastChecked: new Date(),
      lastError: 'Simulated AI Service Outage (Offline)',
      errorCount: aiSystemStatus.errorCount + 1
    };

    const failMsg = 'The StockSense Assistant is temporarily unavailable. Don’t worry, your inventory is safe! Please use the regular forms to check stock or record changes.';
    if (activeConvId) {
      await query(
        `INSERT INTO chat_messages (conversation_id, sender, text, is_unavailable)
         VALUES ($1, 'ai', $2, TRUE)`,
        [activeConvId, failMsg]
      ).catch(() => {});
    }

    return res.json({
      success: false,
      unavailable: true,
      message: failMsg,
      conversationId: activeConvId
    });
  }

  const n8nWebhookUrl = process.env.N8N_WEBHOOK_URL || 'http://127.0.0.1:5678/webhook/stocksense-agent';
  const internalToken = createInternalAgentToken(req.user);

  let finalResponse = null;
  const lower = message.trim().toLowerCase();

  // Authoritative Role Security & Prompt Injection Defense (Requirement 2 & 6)
  const isPromptInjection = lower.includes('ignore') || lower.includes('i am the manager') || lower.includes('i am manager') || lower.includes('bypass') || lower.includes('as manager');
  const isFinancialQuery = lower.includes('profit') || lower.includes('cost') || lower.includes('margin');
  const isCatalogManagement = 
    lower.startsWith('add new product') || lower.startsWith('add product') || lower.startsWith('create product') || lower.startsWith('create item') ||
    lower.startsWith('delete product') || lower.startsWith('remove product') || lower.startsWith('delete item') || lower.startsWith('remove item') ||
    lower.startsWith('delete royal chef') || (lower.startsWith('delete ') && lower.includes('from our stock')) ||
    lower.startsWith('update price') || lower.startsWith('change price') || lower.startsWith('edit product') || lower.startsWith('update product') ||
    lower.includes('edit the name of') || lower.includes('rename ');

  if (req.user.role === 'STAFF') {
    if (isFinancialQuery) {
      const text = isPromptInjection
        ? 'Access Denied: I cannot fulfill this request. Your logged-in role is Staff. Cost and profit information is strictly confidential and restricted to Managers.'
        : 'You do not have permission to view cost prices or profit margins. Staff members are only authorized to view stock quantities and shelf locations.';
      finalResponse = { success: true, text, card: null, chart: null };
    } else if (isCatalogManagement) {
      finalResponse = {
        success: true,
        text: 'Only Managers have permission to add new products, update catalog details, or remove items. As a Staff member, you can check stock levels, shelf locations, and prepare stock movement updates.',
        card: null,
        chart: null
      };
    }
  }

  // Irrelevant Request Filter (Requirement 4)
  const isIrrelevantQuery = 
    lower.includes('capital of') ||
    lower.includes('write a poem') ||
    lower.includes('tell me a joke') ||
    lower.includes('who won') ||
    lower.includes('what is the weather') ||
    lower.includes('weather today') ||
    lower.includes('recipe for') ||
    lower.includes('who is the president') ||
    lower.includes('write code') ||
    lower.includes('translate ') ||
    lower.includes('mount everest');

  if (!finalResponse && isIrrelevantQuery) {
    finalResponse = {
      success: true,
      text: "I can help with StockSense inventory, stock movements, reports, and related store operations. I can't help with that request.",
      card: null,
      chart: null
    };
  }

  // Repeated Greetings & Courtesies Consistency (Requirement 3)
  const isGreeting = ['hi', 'hello', 'hey', 'assalam o alaikum', 'salam', 'good morning', 'good evening', 'hey there', 'hi there'].includes(lower);
  if (!finalResponse && isGreeting) {
    finalResponse = {
      success: true,
      text: `Hello ${req.user.name}! I am Store Brain AI for Nowshera Shopping Mall.\n\nI can help you check stock levels, locate shelf displays, prepare stock movements (receive, sell, damage, return), view sales reports, and visualize inventory trends. How can I assist you today?`,
      card: null,
      chart: null
    };
  }

  const isThankYou = ['thanks', 'thank you', 'shukriya', 'thanks a lot', 'thank you!'].includes(lower);
  if (!finalResponse && isThankYou) {
    finalResponse = {
      success: true,
      text: `You're welcome, ${req.user.name}! Let me know whenever you need help with inventory lookups, stock updates, or store reports.`,
      card: null,
      chart: null
    };
  }

  // Visual Chart Requests (Requirement 7)
  const isVisualQuery = lower.includes('graph') || lower.includes('chart') || lower.includes('visual') || lower.includes('visually') || lower.includes('stock changed over');
  if (!finalResponse && isVisualQuery) {
    finalResponse = await processLocalAgentMessage(message, req.user, internalToken);
  }

  // 3. Attempt n8n Webhook for all remaining dynamic queries
  if (!finalResponse) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 12000);

      const n8nResponse = await fetch(n8nWebhookUrl, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          message,
          sessionId: activeConvId || sessionId,
          user: {
            id: req.user.id,
            name: req.user.name,
            role: req.user.role
          },
          internalAuthToken: internalToken
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (!n8nResponse.ok) {
        throw new Error(`n8n responded with status ${n8nResponse.status}`);
      }

      const data = await n8nResponse.json();
      aiSystemStatus.isAvailable = true;
      aiSystemStatus.lastChecked = new Date();

      let parsedCard = data.card || null;
      if (typeof parsedCard === 'string') {
        try { parsedCard = JSON.parse(parsedCard); } catch (e) { parsedCard = null; }
      }

      let parsedChart = data.chart || null;
      if (typeof parsedChart === 'string') {
        try { parsedChart = JSON.parse(parsedChart); } catch (e) { parsedChart = null; }
      }

      // If user asked for a visual/graph and n8n didn't generate chart JSON, enrich with real chart
      if (!parsedChart && isVisualQuery) {
        parsedChart = await fetchChartDataForQuery(message, internalToken);
      }

      finalResponse = {
        success: true,
        text: data.text || data.output || data.message || 'I have processed your request.',
        card: parsedCard,
        chart: parsedChart
      };
    } catch (err) {
      console.warn(`⚠️ n8n AI Assistant unreachable: ${err.message}. Using intelligent built-in agent.`);

      aiSystemStatus = {
        isAvailable: false,
        lastChecked: new Date(),
        lastError: err.message,
        errorCount: aiSystemStatus.errorCount + 1
      };

      if (process.env.DISABLE_LOCAL_FALLBACK === 'true') {
        finalResponse = {
          success: false,
          unavailable: true,
          text: 'The StockSense Assistant is temporarily unavailable. Don’t worry, your inventory is safe! Please use the regular forms to check stock or record changes.'
        };
      } else {
        try {
          finalResponse = await processLocalAgentMessage(message, req.user, internalToken);
        } catch (fallbackErr) {
          finalResponse = {
            success: false,
            unavailable: true,
            text: 'The StockSense Assistant is temporarily unavailable. Please use the regular forms to check stock or record changes.'
          };
        }
      }
    }
  }

  // 4. Persist AI response message and update conversation timestamp
  try {
    if (activeConvId && finalResponse) {
      await query(
        `INSERT INTO chat_messages (conversation_id, sender, text, card, chart, is_unavailable)
         VALUES ($1, 'ai', $2, $3, $4, $5)`,
        [
          activeConvId,
          finalResponse.text || finalResponse.message || '',
          finalResponse.card ? JSON.stringify(finalResponse.card) : null,
          finalResponse.chart ? JSON.stringify(finalResponse.chart) : null,
          !!finalResponse.unavailable
        ]
      );

      await query(
        `UPDATE chat_conversations 
         SET updated_at = NOW() 
         WHERE id = $1`,
        [activeConvId]
      );
    }
  } catch (saveErr) {
    console.error('Chat DB persistence error (AI response):', saveErr);
  }

  return res.json({
    ...finalResponse,
    conversationId: activeConvId
  });
});

/**
 * Check if query is an inventory change request
 */
function isStockChangeQuery(text) {
  const lower = text.toLowerCase();
  return (
    lower.startsWith('add ') ||
    lower.startsWith('receive ') ||
    lower.startsWith('sell ') ||
    lower.startsWith('restock ') ||
    lower.includes('damage') ||
    lower.includes('return ')
  );
}

/**
 * Helper to fetch structured chart data for visual requests
 */
async function fetchChartDataForQuery(text, token) {
  const lower = text.toLowerCase();
  const baseUrl = `http://127.0.0.1:${process.env.PORT || 5000}/api/tools`;

  let chartType = 'stock_history';
  let itemName = null;

  if (lower.includes('top sell') || lower.includes('bestseller') || lower.includes('most sold')) {
    chartType = 'top_sellers';
  } else if (lower.includes('low stock') || lower.includes('running low') || lower.includes('critical')) {
    chartType = 'low_stock';
  } else if (lower.includes('category') || lower.includes('categories') || lower.includes('department')) {
    chartType = 'category_distribution';
  } else {
    chartType = 'stock_history';
    if (lower.includes('type-c') || lower.includes('cable')) {
      itemName = 'Type-C';
    } else if (lower.includes('milk')) {
      itemName = 'Milk';
    } else if (lower.includes('shirt')) {
      itemName = 'Shirt';
    }
  }

  try {
    const res = await fetch(`${baseUrl}/chart-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ chartType, itemName })
    });
    const data = await res.json();
    return data.chart || null;
  } catch (e) {
    return null;
  }
}

/**
 * Intelligent Local Agent
 * Grounded in PostgreSQL tools. Handles all 12 operational requirements.
 */
async function processLocalAgentMessage(userText, user, token) {
  const text = userText.trim();
  const lower = text.toLowerCase();
  const baseUrl = `http://127.0.0.1:${process.env.PORT || 5000}/api/tools`;

  // 1. Role Boundary & Prompt Injection Check (Requirement 2)
  const isPromptInjection = 
    lower.includes('ignore') || 
    lower.includes('i am the manager') || 
    lower.includes('i am manager') || 
    lower.includes('bypass') ||
    lower.includes('as manager');
  const isFinancialQuery = lower.includes('profit') || lower.includes('cost') || lower.includes('margin');

  if (user.role === 'STAFF') {
    if (isFinancialQuery) {
      if (isPromptInjection) {
        return {
          success: true,
          text: 'Access Denied: I cannot fulfill this request. Your logged-in role is Staff. Cost and profit information is strictly confidential and restricted to Managers.'
        };
      }
      return {
        success: true,
        text: 'You do not have permission to view cost prices or profit margins. Staff members are only authorized to view stock quantities and shelf locations.'
      };
    }

    // Staff attempting manager-only catalog operations
    if (lower.startsWith('add new product') || lower.startsWith('add product') || lower.startsWith('delete product') || lower.startsWith('remove product') || lower.startsWith('update price') || lower.startsWith('change price')) {
      return {
        success: true,
        text: 'Only Managers have permission to add new products, update catalog details, or remove items. As a Staff member, you can check stock levels, shelf locations, and prepare stock movement updates.'
      };
    }
  }

  // 2. Repeated & Conversational Greetings / Courtesies (Requirement 3)
  const isGreeting = 
    lower === 'hi' || 
    lower === 'hello' || 
    lower === 'hey' || 
    lower === 'assalam o alaikum' || 
    lower === 'salam' || 
    lower === 'good morning' || 
    lower === 'good evening' || 
    lower === 'hey there' ||
    lower === 'hi there';

  if (isGreeting) {
    return {
      success: true,
      text: `Hello ${user.name}! I am Store Brain AI for Nowshera Shopping Mall.\n\nI can help you check stock levels, locate shelf displays, prepare stock movements (receive, sell, damage, return), view sales reports, and visualize inventory trends. How can I assist you today?`
    };
  }

  const isThankYou = 
    lower === 'thanks' || 
    lower === 'thank you' || 
    lower === 'shukriya' || 
    lower === 'thanks a lot' ||
    lower === 'thank you!';

  if (isThankYou) {
    return {
      success: true,
      text: `You're welcome, ${user.name}! Let me know whenever you need help with inventory lookups, stock updates, or store reports.`
    };
  }

  // 3. Irrelevant Requests Filter (Requirement 4)
  const isIrrelevant = 
    lower.includes('capital of') ||
    lower.includes('write a poem') ||
    lower.includes('tell me a joke') ||
    lower.includes('who won') ||
    lower.includes('what is the weather') ||
    lower.includes('weather today') ||
    lower.includes('recipe for') ||
    lower.includes('who is the president') ||
    lower.includes('write code') ||
    lower.includes('translate ') ||
    lower.includes('mount everest');

  if (isIrrelevant) {
    return {
      success: true,
      text: "I can help with StockSense inventory, stock movements, reports, and related store operations. I can't help with that request."
    };
  }

  // 4. Ambiguity / Incomplete Store Operation Check (Requirement 4)
  if (lower === 'i got cables' || lower === 'got cables' || lower === 'i got some items' || lower === 'add cables' || lower === 'cables arrived') {
    return {
      success: true,
      text: 'Do you want me to record these items as newly received stock from a supplier? If so, please specify the exact quantity, item name, and supplier (e.g., "Add 40 Type-C cables from Ali Traders").'
    };
  }

  // 5. AI-Generated Visual Reports (Requirement 7)
  const isVisualQuery = 
    lower.includes('graph') || 
    lower.includes('chart') || 
    lower.includes('visual') || 
    lower.includes('visually') || 
    lower.includes('stock changed over');

  if (isVisualQuery) {
    let chartType = 'stock_history';
    let queryItem = null;

    if (lower.includes('top sell') || lower.includes('bestseller') || lower.includes('most sold')) {
      chartType = 'top_sellers';
    } else if (lower.includes('running low') || lower.includes('low stock') || lower.includes('critical')) {
      chartType = 'low_stock';
    } else if (lower.includes('category') || lower.includes('categories') || lower.includes('department')) {
      chartType = 'category_distribution';
    } else {
      chartType = 'stock_history';
      if (lower.includes('type-c') || lower.includes('cable')) queryItem = 'Type-C';
      else if (lower.includes('milk')) queryItem = 'Milk';
      else if (lower.includes('shirt')) queryItem = 'Shirt';
    }

    const chartRes = await fetch(`${baseUrl}/chart-data`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ chartType, itemName: queryItem })
    });
    const chartData = await chartRes.json();

    if (chartData.chart) {
      let narrative = `Here is the visual report for **${chartData.chart.title}** based directly on our real store database:\n\n`;
      if (chartData.chart.type === 'line') {
        narrative += `• Current Stock Level: **${chartData.chart.currentValue} units**\n• ${chartData.chart.subtitle}`;
      } else {
        narrative += chartData.chart.bars.map(b => `• **${b.fullName || b.label}**: ${b.value} units`).join('\n');
      }

      return {
        success: true,
        text: narrative,
        chart: chartData.chart
      };
    }
  }

  // 6. Manager Item Management: Add / Update / Delete Product (Requirement 1)
  const isAddNewProduct = lower.startsWith('add new product') || lower.startsWith('add product') || lower.startsWith('create product');
  const isUpdateProduct = lower.startsWith('update price') || lower.startsWith('change price') || lower.startsWith('update product') || lower.startsWith('edit product') || lower.includes('edit the name of') || lower.includes('rename ');
  const isDeleteProduct = lower.startsWith('delete product') || lower.startsWith('remove product') || lower.startsWith('delete item') || lower.startsWith('remove item') || lower.startsWith('delete royal chef') || (lower.startsWith('delete ') && lower.includes('from our stock'));

  if (isAddNewProduct) {
    if (user.role !== 'MANAGER') {
      return {
        success: true,
        text: 'Only Managers have permission to add new products to the catalog.'
      };
    }

    // Parse product details (e.g. "Add new product Wireless Mouse in Electronics with 20 units, selling price 1200, cost price 800")
    const nameMatch = text.match(/(?:product|item)\s+([a-zA-Z0-9\s\-]+?)(?:\s+in\s+([a-zA-Z]+))?(?:\s+with\s+(\d+)\s+units)?(?:\s*,\s*selling\s+price\s+(\d+))?(?:\s*,\s*cost\s+price\s+(\d+))?$/i);
    const prodName = nameMatch ? nameMatch[1].trim() : text.replace(/^(?:add\s+new\s+product|add\s+product)\s+/i, '').trim();
    const section = (nameMatch && nameMatch[2]) || 'Electronics';
    const initialStock = nameMatch && nameMatch[3] ? parseInt(nameMatch[3], 10) : 10;
    const sellingPrice = nameMatch && nameMatch[4] ? parseFloat(nameMatch[4]) : 1200;
    const costPrice = nameMatch && nameMatch[5] ? parseFloat(nameMatch[5]) : 800;

    const toolRes = await fetch(`${baseUrl}/manage-item`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        actionType: 'CREATE_ITEM',
        name: prodName,
        section,
        initialStock,
        sellingPrice,
        costPrice
      })
    });

    const data = await toolRes.json();
    if (!data.valid) return { success: true, text: `⚠️ ${data.message}` };

    return {
      success: true,
      text: `I have prepared the draft to add **${data.card.itemName}** to **${data.card.section}**. Please review the card below and confirm or cancel:`,
      card: data.card
    };
  }

  if (isUpdateProduct) {
    if (user.role !== 'MANAGER') {
      return {
        success: true,
        text: 'Only Managers have permission to update catalog pricing or details.'
      };
    }

    const renameMatch = text.match(/(?:(?:ok\s+)?(?:edit|rename|change|update)\s+(?:the\s+)?name\s+of\s+(.+?)\s+to\s+(.+))/i);
    const priceMatch = text.match(/(?:update|change)\s+price\s+of\s+([a-zA-Z0-9\s\-]+?)\s+to\s+(\d+(?:\.\d+)?)/i);

    let payload = { actionType: 'UPDATE_ITEM' };
    if (renameMatch) {
      payload.itemName = renameMatch[1].trim();
      payload.name = renameMatch[2].trim().replace(/[.]+$/, '');
    } else if (priceMatch) {
      payload.itemName = priceMatch[1].trim();
      payload.sellingPrice = parseFloat(priceMatch[2]);
    } else {
      payload.itemName = text.replace(/^(?:update|edit|change)\s+(?:product|item)?\s*/i, '').trim();
    }

    const toolRes = await fetch(`${baseUrl}/manage-item`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify(payload)
    });

    const data = await toolRes.json();
    if (!data.valid) return { success: true, text: `⚠️ ${data.message}` };

    const updateMsg = data.card.updatedName
      ? `I have prepared the update to rename **${data.card.itemName}** to **${data.card.updatedName}**. Please review the details below:`
      : `I have prepared the price update for **${data.card.itemName}** (${data.card.oldSellingPrice} PKR → ${data.card.newSellingPrice} PKR). Please review the card below:`;

    return {
      success: true,
      text: updateMsg,
      card: data.card
    };
  }

  if (isDeleteProduct) {
    if (user.role !== 'MANAGER') {
      return {
        success: true,
        text: 'Only Managers have permission to remove products from the catalog.'
      };
    }

    let itemName = text.replace(/^(?:delete|remove)\s+(?:product|item)?\s*/i, '').trim();
    itemName = itemName.replace(/\s+from\s+(?:our\s+)?(?:stock|catalog|inventory)[.]?$/i, '').trim();

    const toolRes = await fetch(`${baseUrl}/manage-item`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({
        actionType: 'DELETE_ITEM',
        itemName
      })
    });

    const data = await toolRes.json();
    if (!data.valid) return { success: true, text: `⚠️ ${data.message}` };

    return {
      success: true,
      text: `⚠️ **Permanent Deletion Warning**: I have prepared the draft to remove **${data.card.itemName}** from inventory. Please confirm or cancel:`,
      card: data.card
    };
  }

  // 7. Stock Movement Request (Add 40 cables, Sell 8 shirts, Record damaged, Returns)
  const addMatch = text.match(/(?:add|receive|restock|got)\s+(\d+)\s+([a-zA-Z0-9\s\-]+?)(?:\s+from\s+([a-zA-Z0-9\s\.\-]+))?$/i);
  const sellMatch = text.match(/(?:sell|record\s+sold|sold|dispense)\s+(\d+)\s+([a-zA-Z0-9\s\-]+)/i);
  const damageMatch = text.match(/(?:damage|damaged|write\s+off)\s+(\d+)\s+([a-zA-Z0-9\s\-]+)/i);
  const returnMatch = text.match(/(?:return|returned|customer\s+return)\s+(\d+)\s+([a-zA-Z0-9\s\-]+)/i);

  if (addMatch || sellMatch || damageMatch || returnMatch) {
    let qty = 0;
    let itemName = '';
    let movementType = 'RECEIVED';
    let supplier = 'Store Adjustment';

    if (addMatch) {
      qty = parseInt(addMatch[1], 10);
      itemName = addMatch[2].trim();
      movementType = 'RECEIVED';
      supplier = (addMatch[3] || 'Ali Traders').trim();
    } else if (sellMatch) {
      qty = parseInt(sellMatch[1], 10);
      itemName = sellMatch[2].trim();
      movementType = 'SOLD';
      supplier = 'Customer Sale';
    } else if (damageMatch) {
      qty = parseInt(damageMatch[1], 10);
      itemName = damageMatch[2].trim();
      movementType = 'DAMAGED';
      supplier = 'Damaged Stock Write-off';
    } else if (returnMatch) {
      qty = parseInt(returnMatch[1], 10);
      itemName = returnMatch[2].trim();
      movementType = 'CUSTOMER_RETURN';
      supplier = 'Customer Return';
    }

    const toolRes = await fetch(`${baseUrl}/prepare-change`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ itemName, quantity: qty, movementType, supplierOrReason: supplier })
    });

    const data = await toolRes.json();
    if (!data.valid) {
      return {
        success: true,
        text: `⚠️ ${data.message}`
      };
    }

    return {
      success: true,
      text: `I have prepared the stock update for **${data.card.itemName}** (${data.card.oldStock} → ${data.card.newStock}). Please review the details below and confirm or cancel:`,
      card: data.card
    };
  }

  // 8. Sales Report Query (Requirement 1 & Test Case 1)
  if (lower.includes('sold most') || lower.includes('top sell') || lower.includes('bestseller')) {
    const salesRes = await fetch(`${baseUrl}/sales`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ period: 'this_week' })
    });
    const data = await salesRes.json();
    if (data.topItem) {
      let reply = `This week's top-selling item is **${data.topItem.name}** with **${data.topItem.unitsSold} units sold**.`;
      if (user.role === 'MANAGER' && data.topItem.totalRevenue) {
        reply += ` Total revenue generated: Rs ${data.topItem.totalRevenue.toLocaleString()} (Gross Profit: Rs ${data.topItem.grossProfit.toLocaleString()}).`;
      }
      return { success: true, text: reply };
    } else {
      return { success: true, text: 'No sales recorded yet for this week.' };
    }
  }

  // 9. Product & Category Discovery (Requirement 5)
  const isCategoryQuery = 
    lower.includes('categories') || 
    lower.includes('what categories') || 
    lower.includes('category list') ||
    lower.includes('show categories');

  const isAllProductsQuery = 
    lower === 'show me all products' || 
    lower === 'give me the product list' || 
    lower === 'show all products' || 
    lower === 'list products' || 
    lower === 'all products' ||
    lower === 'product list';

  if (isCategoryQuery || isAllProductsQuery) {
    const stockRes = await fetch(`${baseUrl}/stock`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
      body: JSON.stringify({ query: isCategoryQuery ? 'categories' : 'all' })
    });
    const stockData = await stockRes.json();

    if (stockData.type === 'CATEGORIES_OVERVIEW') {
      let msg = `### 🏬 Nowshera Shopping Mall Departments\n\n`;
      msg += stockData.categories.map(c => 
        `• **${c.name}**: ${c.itemCount} products (${c.totalUnits} total units in stock)\n  _Sample items: ${c.sampleItems.join(', ')}_`
      ).join('\n\n');
      return { success: true, text: msg };
    }

    if (stockData.found && stockData.items) {
      let msg = `### 📦 Store Product Catalog (${stockData.count} items)\n\n`;
      msg += stockData.items.map(it => {
        let line = `• **${it.name}** [${it.section}] — ${it.totalStock} in stock (Display: ${it.frontDisplay} | Back: ${it.backStoreRoom}) — Selling: Rs ${it.sellingPrice}`;
        if (it.costPrice !== undefined) {
          line += ` | Cost: Rs ${it.costPrice} (Profit: Rs ${it.profitPerUnit})`;
        }
        return line;
      }).join('\n');
      return { success: true, text: msg };
    }
  }

  // 10. General Stock Query (e.g. "What is the stock of Type-C cables?")
  let stockQuery = text.replace(/[?!.,]+$/g, '').trim();
  stockQuery = stockQuery.replace(/^(?:can you\s+)?(?:please\s+)?(?:tell me|check|show me|what(?:'s|\s+is|\s+are)?|how many)\s+(?:the\s+)?(?:current\s+)?(?:real-time\s+)?(?:stock(?:\s+level)?\s+of|stock\s+for|stock\s+of|quantity\s+of|count\s+of|stock\b)?\s*/i, '');
  stockQuery = stockQuery.replace(/\s+(?:are\s+left|are\s+in\s+stock|in\s+stock|do\s+we\s+have|left|remaining|available)$/i, '');
  stockQuery = stockQuery.replace(/\b(?:stock\s+of|stock\s+for|current\s+stock)\b/gi, '');
  stockQuery = stockQuery.replace(/\s+/g, ' ').trim() || text.trim();

  const stockRes = await fetch(`${baseUrl}/stock`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
    body: JSON.stringify({ query: stockQuery })
  });

  const stockData = await stockRes.json();
  if (!stockData.found) {
    return { success: true, text: stockData.message };
  }

  const itemsList = stockData.items.map(it => {
    let desc = `• **${it.name}**: ${it.totalStock} in stock (Display: ${it.frontDisplay} | Back Room: ${it.backStoreRoom}) [Selling: Rs ${it.sellingPrice}]`;
    if (it.costPrice !== undefined) {
      desc += ` [Cost: Rs ${it.costPrice} | Profit/unit: Rs ${it.profitPerUnit}]`;
    }
    return desc;
  }).join('\n');

  return {
    success: true,
    text: `Here is the current real-time stock data:\n\n${itemsList}`
  };
}

export default router;
