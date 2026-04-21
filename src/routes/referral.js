'use strict';
const { Router } = require('express');
const e = require('../services/referral-engine');
const r = Router();

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

module.exports = r;
