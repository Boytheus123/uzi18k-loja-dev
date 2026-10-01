/* UZI18K stock limit - capture guard loaded before native cart */
(function(){
  "use strict";
  var SUPABASE_URL="https://meulxqleymbjkedaagby.supabase.co";
  var SUPABASE_KEY="sb_publishable_8UM9No_56gY8ArX0yb1MmA_XVH-V-mV";
  var rows=null;

  var map={
    "produto-pulseira-cartier":"pulseira-cartier-2mm",
    "produto-duplix-5mm":"pulseira-duplix-5mm",
    "produto-pulseira-grumet":"pulseira-grumet-2-5mm",
    "produto-pulseira-piastrine-3mm":"pulseira-piastrini-3mm",
    "produto-duplix-3mm":"pulseira-duplix-3mm",
    "produto-corrente-duplix":"duplix-3mm",
    "produto-cordao-entrelacado":"cordao-baiano-3mm",
    "produto-corrente-veneziana":"veneziana-1mm",
    "produto-corrente-grumet":"pulseira-grumet-2-5mm",
    "produto-corrente-cadeado":"cadeado-3mm",
    "produto-corrente-cartier":"cartier-2mm",
    "produto-corrente-elo-portugues":"elo-portugues-2mm",
    "produto-corrente-piastrini":"piastrini-2mm",
    "produto-escapulario-cruz":"escapulario-espirito-santo-cruz",
    "produto-escapulario-jesus-nossa-senhora":"escapulario-nossa-senhora-cristo",
    "produto-pulseira-veneziana":"pulseira-veneziana-1mm",
    "produto-pulseira-cadeado":"pulseira-cadeado-2-8mm"
  };

  function size(v){
    var m=String(v||"").match(/\b(\d+(?:[.,]\d+)?)\s*cm\b/i);
    return m?m[1].replace(",",".")+"cm":"";
  }
  function key(item){
    var base=String(item&&item.id||"").split("|")[0];
    if(map[base])return map[base];
    var n=String(item&&item.name||"").toLowerCase();
    if(n.includes("pulseira cartier"))return "pulseira-cartier-2mm";
    if(n.includes("pulseira duplix 5"))return "pulseira-duplix-5mm";
    if(n.includes("pulseira duplix"))return "pulseira-duplix-3mm";
    if(n.includes("pulseira grumet"))return "pulseira-grumet-2-5mm";
    if(n.includes("pulseira veneziana"))return "pulseira-veneziana-1mm";
    if(n.includes("pulseira cadeado"))return "pulseira-cadeado-2-8mm";
    if(n.includes("pulseira piastrine"))return "pulseira-piastrini-3mm";
    if(n.includes("corrente grumet"))return "pulseira-grumet-2-5mm";
    if(n.includes("corrente cadeado"))return "cadeado-3mm";
    if(n.includes("corrente cartier"))return "cartier-2mm";
    if(n.includes("corrente duplix"))return "duplix-3mm";
    if(n.includes("corrente veneziana"))return "veneziana-1mm";
    if(n.includes("corrente elo português")||n.includes("corrente elo portugues"))return "elo-portugues-2mm";
    if(n.includes("corrente piastrini"))return "piastrini-2mm";
    if(n.includes("cordão baiano")||n.includes("cordao baiano"))return "cordao-baiano-3mm";
    return "";
  }
  function toast(t){
    var d=document.createElement("div");
    d.textContent=t;
    d.style.cssText="position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:2147483647;background:#111;color:#fff;border:1px solid #d4af37;border-radius:10px;padding:10px 15px;font:600 13px Arial";
    document.body.appendChild(d);
    setTimeout(function(){d.remove();},1800);
  }
  async function load(){
    try{
      var s=await fetch(SUPABASE_URL+"/rest/v1/inventory_items?select=product_key,variant,stock,active&active=eq.true",{headers:{apikey:SUPABASE_KEY,Authorization:"Bearer "+SUPABASE_KEY}});
      if(!s.ok)throw 0;
      rows=await s.json();
    }catch(e){rows=[];console.warn("[UZI18K] stock guard load failed");}
  }
  function refreshButtons(){
    if(!rows || !Array.isArray(window.__UZI18K_CART)) return;
    document.querySelectorAll('button[data-v108-qty="1"]').forEach(function(b){
      var idx=Number(b.getAttribute("data-v108-index")),cart=window.__UZI18K_CART;
      if(!isFinite(idx)||!cart[idx]) return;
      var item=cart[idx],k=key(item),v=size(item.size);
      var matches=rows.filter(function(r){return r.product_key===k&&r.active!==false;});
      var row=v?matches.find(function(r){return size(r.variant)===v;}):matches[0];
      if(!row)return;
      var stock=Number(row.stock||0),qty=Number(item.qty||0),blocked=stock<=0||qty>=stock;
      b.disabled=blocked;
      b.setAttribute("aria-disabled",String(blocked));
      b.style.pointerEvents=blocked?"none":"auto";
      b.style.opacity=blocked?".45":"";
      b.style.cursor=blocked?"not-allowed":"";
      b.title=stock<=0?"Produto esgotado.":(blocked?"Máximo disponível: "+stock:"");
    });
  }

  document.addEventListener("click",function(e){
    var b=e.target.closest&&e.target.closest('button[data-v108-qty="1"]');
    if(!b)return;
    var idx=Number(b.getAttribute("data-v108-index"));
    var cart=window.__UZI18K_CART;
    if(!Array.isArray(cart)||!isFinite(idx)||!cart[idx])return;
    if(!rows){
      e.preventDefault();e.stopImmediatePropagation();
      toast("Verificando estoque...");
      return;
    }
    var item=cart[idx],k=key(item),v=size(item.size);
    var matches=rows.filter(function(r){return r.product_key===k&&r.active!==false;});
    var row=v?matches.find(function(r){return size(r.variant)===v;}):matches[0];
    if(!row)return;
    var stock=Number(row.stock||0),qty=Number(item.qty||0);
    if(qty>=stock){
      e.preventDefault();e.stopImmediatePropagation();
      toast(stock>0?"Máximo disponível: "+stock:"Produto esgotado.");
      refreshButtons();
    }else{
      setTimeout(refreshButtons,0);
    }
  },true);
  load();
  setInterval(refreshButtons,250);
})();