'use strict';
const express=require('express');const cors=require('cors');const app=express();const PORT=process.env.PORT||3030;
app.use(cors());app.use(express.json());app.use('/',require('./routes/health'));app.use('/',require('./routes/referral'));
app.get('/',(_,r)=>r.json({service:'hive-referral-agent',version:'1.0.0',description:'Viral referral engine — reward tiers, attribution tracking, network growth campaigns',endpoints:{execute:'POST /v1/referral/execute',record:'GET /v1/referral/record/:id',stats:'GET /v1/referral/stats',records:'GET /v1/referral/records',health:'GET /health',pulse:'GET /.well-known/hive-pulse.json',ai:'GET /.well-known/ai.json'}}));
const hc=require('./services/hive-client');
app.listen(PORT,async()=>{console.log(`[hive-referral-agent] Listening on port ${PORT}`);try{await hc.registerWithHiveTrust()}catch(e){}try{await hc.registerWithHiveGate()}catch(e){}});
module.exports=app;
