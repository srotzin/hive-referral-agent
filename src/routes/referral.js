'use strict';
const { Router } = require('express');
const https = require('https');
const e = require('../services/referral-engine');
const r = Router();

// ─── HiveAI helper ─────────────────────────────────────────────────────────
const HIVEAI_URL   = 'https://hive-ai-1.onrender.com/v1/chat/completions';
const HIVEAI_KEY   = 'hive_internal_125e04e071e8829be631ea0216dd4a0c9b707975fcecaf8c62c6a2ab43327d46';
const HIVEAI_MODEL = 'meta-llama/llama-3.1-8b-instruct';

function callHiveAI(systemPrompt, userMessage, maxTokens = 150) {
  return new Promise((resolve) => {
    const payload = JSON.stringify({
      model: HIVEAI_MODEL,
      max_tokens: maxTokens,
      messages: [
        { role: 'system', content: systemPrompt },
        { role: 'user',   content: userMessage  },
      ],
    });
    const options = {
      hostname: 'hive-ai-1.onrender.com',
      path:     '/v1/chat/completions',
      method:   'POST',
      headers: {
        'Authorization': `Bearer ${HIVEAI_KEY}`,
        'Content-Type':  'application/json',
        'Content-Length': Buffer.byteLength(payload),
      },
    };
    const req = https.request(options, (res) => {
      let data = '';
      res.on('data', chunk => { data += chunk; });
      res.on('end', () => {
        try {
          const parsed = JSON.parse(data);
          resolve(parsed.choices[0].message.content.trim());
        } catch {
          resolve('HiveReferral viral engine is active. Focus on high-value agent networks and time-sensitive incentive campaigns for maximum growth velocity.');
        }
      });
    });
    req.on('error', () => {
      resolve('HiveReferral viral engine is active. Focus on high-value agent networks and time-sensitive incentive campaigns for maximum growth velocity.');
    });
    req.setTimeout(20000, () => {
      req.destroy();
      resolve('HiveReferral viral engine is active. Focus on high-value agent networks and time-sensitive incentive campaigns for maximum growth velocity.');
    });
    req.write(payload);
    req.end();
  });
}

// POST /v1/referral/execute — fixed: was calling e.execute() which doesn't exist
r.post('/v1/referral/execute', (q, s) => {
  try {
    const { referrer_did, referred_did, platform, campaign } = q.body || {};
    if (!referrer_did || !referred_did) {
      return s.status(400).json({ error: 'referrer_did and referred_did are required' });
    }
    const result = e.createReferral(referrer_did, referred_did, { campaign: campaign || platform || 'default' });
    const stats = e.getStats();
    s.status(201).json({
      status: 'completed',
      result,
      referrer_tier: result.reward_tier,
      total_referrals: stats.total_referrals,
      next_tier: stats.tiers,
    });
  } catch (err) {
    console.error('[POST /v1/referral/execute]', err.message);
    s.status(500).json({ error: err.message });
  }
});

r.get('/v1/referral/record/:id', (q, s) => {
  const rec = [...e.referrals.values()].find(r => r.id === q.params.id);
  if (!rec) return s.status(404).json({ error: 'Not found' });
  s.json(rec);
});

r.get('/v1/referral/stats', (_, s) => s.json(e.getStats()));

r.get('/v1/referral/records', (_, s) => s.json({ records: [...e.referrals.values()] }));

// GET /v1/referral/ai/strategy-brief — $0.02/call
r.get('/v1/referral/ai/strategy-brief', async (_, s) => {
  try {
    const stats = e.getStats();
    const systemPrompt = (
      'You are HiveReferral \u2014 the viral growth engine. Based on current referral stats, ' +
      'what is the optimal referral strategy right now? Where is the highest-value agent to recruit? 2 sentences.'
    );
    const userMsg = (
      `Referral stats: total_referrals=${stats.total_referrals}, ` +
      `total_rewards_usdc=${stats.total_rewards_usdc}, ` +
      `active_campaigns=${stats.active_campaigns}, ` +
      `conversion_rate=${stats.conversion_rate}. ` +
      'Identify the optimal referral strategy and highest-value recruitment target.'
    );
    const brief = await callHiveAI(systemPrompt, userMsg);

    // Derive top strategy heuristic
    let topStrategy;
    if (stats.conversion_rate >= 0.7) {
      topStrategy = 'Amplify existing high-conversion channels with bonus incentives.';
    } else if (stats.total_referrals < 10) {
      topStrategy = 'Bootstrap network with platinum-tier agents to accelerate early growth.';
    } else {
      topStrategy = 'Optimise mid-funnel conversion with gold-tier referral campaigns.';
    }

    s.json({
      success:      true,
      brief,
      top_strategy: topStrategy,
      price_usdc:   0.02,
    });
  } catch (err) {
    console.error('[GET /v1/referral/ai/strategy-brief]', err.message);
    s.status(500).json({ error: err.message });
  }
});

module.exports = r;
