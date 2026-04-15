'use strict';const{v4:uuid}=require('uuid');
const referrals=new Map();const campaigns=new Map();
const REWARD_TIERS=[{tier:'bronze',referrals_needed:1,reward_usdc:0.50},{tier:'silver',referrals_needed:5,reward_usdc:3.00},{tier:'gold',referrals_needed:15,reward_usdc:10.00},{tier:'platinum',referrals_needed:50,reward_usdc:50.00}];
let stats={total_referrals:0,total_rewards_usdc:0,active_campaigns:0,conversion_rate:0.72};
function createReferral(referrerDid,refereeDid,opts={}){const id=uuid();const r={id,referrer:referrerDid,referee:refereeDid,campaign:opts.campaign||'default',reward_tier:calculateTier(referrerDid),status:'pending',created_at:new Date().toISOString()};referrals.set(id,r);stats.total_referrals++;return r}
function calculateTier(did){const count=[...referrals.values()].filter(r=>r.referrer===did).length;for(let i=REWARD_TIERS.length-1;i>=0;i--){if(count>=REWARD_TIERS[i].referrals_needed)return REWARD_TIERS[i]}return REWARD_TIERS[0]}
function createCampaign(opts={}){const id=uuid();const c={id,name:opts.name||'growth-'+id.slice(0,8),bonus_multiplier:opts.bonus_multiplier||1.5,expires_at:new Date(Date.now()+(opts.days||30)*86400000).toISOString(),created_at:new Date().toISOString(),status:'active'};campaigns.set(id,c);stats.active_campaigns++;return c}
function getLeaderboard(limit=10){const counts={};[...referrals.values()].forEach(r=>{counts[r.referrer]=(counts[r.referrer]||0)+1});return Object.entries(counts).sort((a,b)=>b[1]-a[1]).slice(0,limit).map(([did,count])=>({did,referrals:count,tier:calculateTier(did)}))}
function getStats(){return{...stats,tiers:REWARD_TIERS,leaderboard:getLeaderboard(5)}}
module.exports={createReferral,createCampaign,getLeaderboard,getStats,referrals,campaigns};