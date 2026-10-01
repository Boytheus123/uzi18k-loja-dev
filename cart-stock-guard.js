/* UZI18K cart stock guard - native cart controls */
(function(){
  "use strict";
  var SUPABASE_URL="https://meulxqleymbjkedaagby.supabase.co";
  var rows=[],loaded=false;

  var productMap={
    "produto-duplix-5mm":"pulseira-duplix-5mm",
    "produto-pulseira-cartier":"pulseira-cartier-2mm",
    "produto-pulseira-grumet":"pulseira-grumet-2-5mm",
    "produto-pulseira-piastrine-3mm":"pulseira-piastrini-3mm",
    "produto-corrente-duplix":"duplix-3mm",
    "produto-cordao-entrelacado":"cordao-baiano-3mm",
    "produto-corrente-veneziana":"veneziana-1mm",
    "produto-corrente-grumet":"grumet-3mm",
    "produto-corrente-cadeado":"cadeado-3mm",
    "produto-corrente-cartier":"cartier-2mm",
    "produto-corrente-elo-portugues":"elo-portugues-2mm",
    "produto-corrente-piastrini":"piastrini-2mm",
    "produto-escapulario-cruz":"escapulario-espirito-santo-cruz",
    "produto-escapulario-jesus-nossa-senhora":"escapulario-nossa-senhora-cristo",
    "produto-duplix-3mm":"pulseira-duplix-3mm",
    "produto-pulseira-veneziana":"pulseira-veneziana-1mm",
    "produto-pulseira-cadeado":"pulseira-cadeado-2-8mm"
  };

  var nameMap={
    "pulseira duplix 5mm":"pulseira-duplix-5mm",
    "pulseira duplix 3mm":"pulseira-duplix-3mm",
    "pulseira cartier 2mm":"pulseira-cartier-2mm",
    "pulseira grumet 2,5mm":"pulseira-grumet-2-5mm",
    "pulseira piastrine 3mm":"pulseira-piastrini-3mm",
    "pulseira veneziana 1mm":"pulseira-veneziana-1mm",
    "pulseira cadeado 2,8mm":"pulseira-cadeado-2-8mm",
    "corrente duplix 3mm":"duplix-3mm",
    "corrente cordão baiano 3mm":"cordao-baiano-3mm",
    "corrente veneziana 1mm":"veneziana-1mm",
    "corrente grumet 3mm":"grumet-3mm",
    "corrente cadeado 3mm":"cadeado-3mm",
    "corrente cartier 2mm":"cartier-2mm",
    "corrente elo português 2mm":"elo-portugues-2mm",
    "corrente piastrini 2mm":"piastrini-2mm",
    "escapulário espírito santo e cruz":"escapulario-espirito-santo-cruz",
    "escapulário nossa senhora das graças e cristo diamantado":"escapulario-nossa-senhora-cristo",
    "corrente grumet":"grumet-3mm",
    "grumet 3mm":"grumet-3mm",
    "corrente cadeado":"cadeado-3mm",
    "corrente cartier":"cartier-2mm",
    "corrente duplix":"duplix-3mm",
    "corrente piastrini":"piastrini-2mm",
    "corrente veneziana":"veneziana-1mm",
    "corrente elo portugues":"elo-portugues-2mm",
    "corrente cordao baiano":"cordao-baiano-3mm",
    "pulseira grumet":"pulseira-grumet-2-5mm",
    "pulseira cartier":"pulseira-cartier-2mm",
    "pulseira duplix":"pulseira-duplix-3mm",
    "pulseira veneziana":"pulseira-veneziana-1mm",
    "pulseira cadeado":"pulseira-cadeado-2-8mm",
    "pulseira piastrine":"pulseira-piastrini-3mm"
  };

  function norm(v){return String(v||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/\s+/g," ").trim();}
  function sizeNorm(v){var m=String(v||"").match(/\b(\d+(?:[.,]\d+)?)\s*cm\b/i);return m?m[1].replace(",",".")+"cm":"";}
  function keyFromName(name){
    var n=norm(name),keys=Object.keys(nameMap).sort(function(a,b){return b.length-a.length;});
    for(var i=0;i<keys.length;i++)if(n.indexOf(norm(keys[i]))>=0)return nameMap[keys[i]];
    return "";
  }

  function context(btn){
    var qbtn=btn.closest&&btn.closest('button[data-v108-qty]');
    if(!qbtn)return null;
    var idx=Number(qbtn.getAttribute("data-v108-index")),cart=window.__UZI18K_CART;
    if(!isFinite(idx)||!Array.isArray(cart)||!cart[idx])return null;
    var item=cart[idx],base=String(item.id||"").split("|")[0],key=productMap[base]||keyFromName(item.name);
    if(!key)return null;
    var variant=sizeNorm(item.size);
    var candidates=rows.filter(function(r){return r.product_key===key&&r.active!==false;});
    var row=variant?candidates.find(function(r){return sizeNorm(r.variant)===variant;}):null;
    if(!row&&candidates.length===1)row=candidates[0];
    if(!row)return null;
    return {item:item,row:row,qty:Number(item.qty||0),dom:qbtn.closest(".uzi-cart-item")||qbtn.parentElement};
  }

  function decorate(){
    if(!loaded)return;
    document.querySelectorAll('button[data-v108-qty="1"]').forEach(function(btn){
      var ctx=context(btn);if(!ctx)return;
      var stock=Number(ctx.row.stock||0),blocked=stock<=0||ctx.qty>=stock;
      btn.disabled=blocked;btn.setAttribute("aria-disabled",String(blocked));
      btn.title=stock<=0?"Esgotado":(blocked?"Máximo disponível: "+stock:"");
      btn.style.opacity=blocked?".45":"";btn.style.cursor=blocked?"not-allowed":"";
      if(ctx.dom){
        var msg=ctx.dom.querySelector(".uzi-stock-limit-msg");
        if(blocked&&stock>0){
          if(!msg){msg=document.createElement("div");msg.className="uzi-stock-limit-msg";msg.style.cssText="font-size:11px;color:#aaa;margin-top:3px;";ctx.dom.appendChild(msg);}
          msg.textContent="Máximo disponível: "+stock;
        }else if(msg)msg.remove();
      }
    });
  }

  function toast(msg){
    var old=document.getElementById("uzi-stock-toast");if(old)old.remove();
    var d=document.createElement("div");d.id="uzi-stock-toast";d.textContent=msg;
    d.style.cssText="position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:2147483647;background:#111;color:#fff;border:1px solid #d4af37;border-radius:10px;padding:11px 16px;font:600 13px Arial,sans-serif;";
    document.body.appendChild(d);setTimeout(function(){if(d.parentNode)d.remove();},2200);
  }

  async function load(){
    try{
      var source=await fetch("estoque.js?v=stock-key").then(function(r){return r.text();});
      var m=source.match(/SUPABASE_KEY\s*=\s*['"]([^'"]+)['"]/);
      if(!m)throw new Error("Supabase key not found");
      var res=await fetch(SUPABASE_URL+"/rest/v1/inventory_items?select=product_key,variant,stock,active&active=eq.true",{headers:{apikey:m[1],Authorization:"Bearer "+m[1]}});
      if(!res.ok)throw new Error("inventory "+res.status);
      rows=await res.json();loaded=true;decorate();
    }catch(e){console.warn("[UZI18K] cart stock guard",e);}
  }

  document.addEventListener("click",function(e){
    var btn=e.target.closest&&e.target.closest('button[data-v108-qty="1"]');
    if(!btn||!loaded)return;
    var ctx=context(btn);if(!ctx)return;
    var stock=Number(ctx.row.stock||0);
    if(stock<=0||ctx.qty>=stock){
      e.preventDefault();e.stopImmediatePropagation();
      toast(stock<=0?"Produto esgotado.":"Máximo disponível: "+stock);
      decorate();
    }
  },true);

  var observer=new MutationObserver(function(){decorate();});
  function start(){load();observer.observe(document.body,{childList:true,subtree:true});setInterval(decorate,1000);}
  if(document.readyState==="loading")document.addEventListener("DOMContentLoaded",start,{once:true});else start();
})();