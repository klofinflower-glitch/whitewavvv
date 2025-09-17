import express from 'express';
import crypto from 'crypto';
import cors from 'cors';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
app.use(cors());
app.use(express.json());

const BOT_TOKEN = process.env.BOT_TOKEN || 'PUT_YOUR_BOT_TOKEN_HERE';

function checkInitData(initData) {
  try{
    const urlParams = new URLSearchParams(initData);
    const hash = urlParams.get('hash');
    urlParams.delete('hash');
    const dataCheckString = Array.from(urlParams.entries())
      .sort(([a],[b]) => a.localeCompare(b))
      .map(([k,v]) => `${k}=${v}`)
      .join('\n');
    const secretKey = crypto.createHmac('sha256', 'WebAppData').update(BOT_TOKEN).digest();
    const hmac = crypto.createHmac('sha256', secretKey).update(dataCheckString).digest('hex');
    return hmac === hash;
  }catch(e){ return false; }
}

app.post('/auth/verify', (req, res) => {
  const { initData } = req.body || {};
  if (!initData) return res.status(400).json({ ok:false, error:'NO_INIT_DATA' });
  const ok = checkInitData(initData);
  if (!ok) return res.status(401).json({ ok:false, error:'BAD_SIG' });
  const session = crypto.randomBytes(24).toString('hex');
  res.json({ ok:true, session });
});

// Mock catalog
app.get('/products', (req,res)=>{
  const p = JSON.parse(fs.readFileSync(path.join(__dirname,'data','products.json'),'utf-8'));
  res.json({ ok:true, items:p });
});
app.get('/categories', (req,res)=>{
  res.json({ ok:true, items:[
    { id:'men', title:'Мужчинам' },
    { id:'women', title:'Женщинам' },
  ]});
});
app.post('/cart/checkout', (req,res)=>{
  // TODO: integrate payments
  res.json({ ok:true, id: 'ORD-'+Math.random().toString(36).slice(2,8).toUpperCase() });
});

// Referral stats (mock)
app.get('/ref', (req,res)=>{
  res.json({ ok:true, invites:3, subs:1, earned:500 });
});

const port = process.env.PORT || 3000;
app.listen(port, ()=> console.log('WHITEWAVE backend on http://localhost:'+port));
