/* UZI18K cart stock guard
   Fail-safe: it only blocks the + button when the cart item can be
   positively matched to a product/variant in the public inventory.
*/
(function(){
  "use strict";

  var SUPABASE_URL="https://meulxqleymbjkedaagby.supabase.co";
  var SUPABASE_KEY="sb_publishable_8UM9No_56gY8ArX0yb1MmA_XVH-V-mV";
  var rows=[];
  var loaded=false;
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

  function norm(v){return String(v||"").normalize("NFD").replace(/[\u0300-\u036f]/g,"").toLowerCase().replace(/\\s+/g," ").trim();}
  function sizeNorm(v){
    var m=String(v||"").match(/\\b(\\d+(?:[.,]\\d+)?)\\s*cm\\b/i);
    return m ? m[1].replace(",",".")+"cm" : "";
  }
  function keyFromText(t){
    var n=norm(t);
    var names=Object.keys(nameMap).sort(function(a,b){return b.length-a.length;});
    for(var i=0;i<names.length;i++){ if(n.indexOf(norm(names[i]))>=0) return nameMap[names[i]]; }
    return "";
  }
  function findAttr(el,names){
    for(var i=0;i<names.length;i++){
      var v=el.getAttribute && el.getAttribute(names[i]);
      if(v) return v;
    }
    return "";
  }
  function cartContext(btn){
    var qbtn=btn.closest && btn.closest("button[data-v108-qty]");
    if(!qbtn) return null;
    var idx=Number(qbtn.getAttribute("data-v108-index"));
    if(!isFinite(idx) || !window.__UZI18K_CART || !window.__UZI18K_CART[idx]) return null;
    var cartItem=window.__UZI18K_CART[idx];
    var domItem=qbtn.closest(".uzi-cart-item") || qbtn.parentElement;
    var key="";
    var rawId=String(cartItem.id||"");
    var baseId=rawId.split("|")[0];
    if(productMap[baseId]) key=productMap[baseId];
    if(!key) key=keyFromText(String(cartItem.name||""));
    var variant=sizeNorm(cartItem.size||"");
    if(!key) return null;
    var candidates=rows.filter(function(r){return r.product_key===key && r.active!==false;});
    var row=null;
    if(variant) row=candidates.find(function(r){return sizeNorm(r.variant)===variant;})||null;
    if(!row && candidates.length===1) row=candidates[0];
    if(!row) return null;
    return {index:idx,cartItem:cartItem,domItem:domItem,row:row,qty:Number(cartItem.qty||0)};
  }

  function decorate(){
    document.querySelectorAll('button[data-v108-qty="1"]').forEach(function(btn){
      var ctx=cartContext(btn);
      if(!ctx) return;
      var stock=Number(ctx.row.stock||0);
      var atMax=ctx.qty>=stock;
      btn.disabled=stock<=0 || atMax;
      btn.setAttribute("aria-disabled",String(btn.disabled));
      btn.title=stock<=0 ? "Esgotado" : (atMax ? "Máximo disponível: "+stock : "");
      btn.style.opacity=btn.disabled?".45":"";
      btn.style.cursor=btn.disabled?"not-allowed":"";
      var item=ctx.domItem;
      if(item){
        var msg=item.querySelector(".uzi-stock-limit-msg");
        if(atMax && stock>0){
          if(!msg){
            msg=document.createElement("div");
            msg.className="uzi-stock-limit-msg";
            msg.style.cssText="font-size:11px;color:#aaa;margin-top:3px;";
            item.appendChild(msg);
          }
          msg.textContent="Máximo disponível: "+stock;
        }else if(msg) msg.remove();
      }
    });
  }

;