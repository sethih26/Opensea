import "dotenv/config";
import express from "express";
import path from "node:path";
import {fileURLToPath} from "node:url";
const __dirname=path.dirname(fileURLToPath(import.meta.url)), app=express(), port=Number(process.env.PORT||3000);
app.use(express.json({limit:"1mb"})); app.use(express.static(path.join(__dirname,"public")));

function slugOf(input){
  const u=new URL(String(input||"").trim());
  if(!["opensea.io","www.opensea.io"].includes(u.hostname)) throw Error("Use an opensea.io URL.");
  const p=u.pathname.split("/").filter(Boolean);
  const i=p.indexOf("drops"), c=p.indexOf("collection");
  if(i>=0&&p[i+1]) return p[i+1];
  if(c>=0&&p[c+1]) return p[c+1];
  throw Error("Could not find an OpenSea drop/collection slug.");
}
const valid=a=>/^0x[a-fA-F0-9]{40}$/.test(a);
async function os(pathname,headers={}){
  if(!process.env.OPENSEA_API_KEY) throw Error("OPENSEA_API_KEY is not configured.");
  const r=await fetch("https://api.opensea.io"+pathname,{headers:{"X-API-KEY":process.env.OPENSEA_API_KEY,"Accept":"application/json",...headers}});
  const t=await r.text(); let d; try{d=JSON.parse(t)}catch{d={}};
  if(!r.ok){const e=Error(d.message||d.error||`OpenSea HTTP ${r.status}`);e.status=r.status;throw e}
  return d;
}
app.post("/api/check",async(req,res)=>{
 try{
  const slug=slugOf(req.body.url);
  const wallets=[...new Set((req.body.wallets||[]).map(x=>String(x).trim().toLowerCase()).filter(Boolean))];
  if(!wallets.length) throw Error("Add at least one wallet.");
  if(wallets.length>5000) throw Error("Maximum 5,000 wallets.");
  const drop=await os(`/api/v2/drops/${encodeURIComponent(slug)}`);
  const results=[];
  for(const address of wallets){
   if(!valid(address)){results.push({address,eligible:false,status:"invalid_address"});continue}
   if(!process.env.OPENSEA_ELIGIBILITY_JWT){
    results.push({address,eligible:null,status:"eligibility_auth_required",message:"Add an OpenSea JWT with read:eligibility."});continue
   }
   try{
    const d=await os(`/api/v2/drops/${encodeURIComponent(slug)}/eligibility?address=${encodeURIComponent(address)}`,{"Authorization":`Bearer ${process.env.OPENSEA_ELIGIBILITY_JWT}`});
    results.push({address,eligible:true,status:"eligible",data:d});
   }catch(e){
    results.push({address,eligible:e.status===404||e.status===422?false:null,status:e.status===404||e.status===422?"not_eligible":"check_error",message:e.message});
   }
  }
  res.json({slug,collection:drop.collectionName,chain:drop.chain,totalSupply:drop.totalSupply,maxSupply:drop.maxSupply,stages:drop.stages||[],results});
 }catch(e){res.status(e.status||400).json({error:e.message})}
});
app.listen(port,()=>console.log(`http://localhost:${port}`));
