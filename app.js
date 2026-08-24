let last=[];
const $=x=>document.getElementById(x);
$("check").onclick=async()=>{
 $("error").textContent="";$("load").style.display="block";
 try{
  const wallets=$("wallets").value.split(/\r?\n/).map(x=>x.trim()).filter(Boolean);
  const r=await fetch("/api/check",{method:"POST",headers:{"Content-Type":"application/json"},body:JSON.stringify({url:$("url").value,wallets})});
  const d=await r.json();if(!r.ok)throw Error(d.error);
  last=d.results;
  $("drop").style.display="block";$("drop").innerHTML=`<div class="grid"><div class="item"><span>Collection</span><b>${d.collection||d.slug}</b></div><div class="item"><span>Chain</span><b>${d.chain||"—"}</b></div></div>`;
  let a=0,n=0,u=0;last.forEach(x=>x.eligible===true?a++:x.eligible===false?n++:u++);
  $("stats").style.display="grid";$("stats").className="stats";$("stats").innerHTML=`<div class="stat"><b class="ok">${a}</b>Eligible</div><div class="stat"><b class="bad">${n}</b>Not eligible</div><div class="stat"><b class="unk">${u}</b>Unable to verify</div>`;
  $("res").style.display="block";$("table").innerHTML=`<table><tr><th>Wallet</th><th>Status</th><th>Details</th></tr>${last.map(x=>`<tr><td>${x.address}</td><td class="${x.eligible===true?"ok":x.eligible===false?"bad":"unk"}">${x.eligible===true?"Eligible":x.eligible===false?"Not eligible":"Unable to verify"}</td><td>${x.message||x.status||""}</td></tr>`).join("")}</table>`;
 }catch(e){$("error").textContent=e.message||"Request failed"}finally{$("load").style.display="none"}
};
$("csv").onclick=()=>{const s=[["wallet","status","details"],...last.map(x=>[x.address,x.status,x.message||""])].map(r=>r.map(v=>`"${String(v).replaceAll('"','""')}"`).join(",")).join("\n");const a=document.createElement("a");a.href=URL.createObjectURL(new Blob([s],{type:"text/csv"}));a.download="opensea-eligibility.csv";a.click()};
