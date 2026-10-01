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
  function itemFor(el){
    var cur=el, depth=0;
    while(cur && depth++<12){
      if(cur.matches && cur.matches("[data-product-key],[data-product],[data-key],[data-variant]")) return cur;
      var txt=String(cur.textContent||"").replace(/\s+/g," ").trim();
      var hasQty=/[−-]\s*\d+\s*\+/.test(txt);
      var hasRemove=/\bremover\b/i.test(txt);
      if((hasQty||hasRemove) && txt.length>20) return cur;
      cur=cur.parentElement;
    }
    return el.parentElement;
  }
  function getKey(item){
    var cur=item, depth=0;
    while(cur && depth++<8){
      var raw=findAttr(cur,["data-product-key","data-product-key-id","data-product","data-key","data-product-id"]);
      if(raw){
        if(productMap[raw]) return productMap[raw];
        if(rows.some(function(r){return r.product_key===raw;})) return raw;
      }
      cur=cur.parentElement;
    }
    cur=item; depth=0;
    while(cur && depth++<8){
      var byText=keyFromText(cur.textContent||"");
      if(byText) return byText;
      cur=cur.parentElement;
    }
    return "";
  }
  function getVariant(item){
    var cur=item, depth=0;
    while(cur && depth++<8){
      var raw=findAttr(cur,["data-variant","data-size","data-product-variant"]);
      var s=sizeNorm(raw);
      if(s) return s;
      cur=cur.parentElement;
    }
    return sizeNorm(item && item.textContent);
  }
  function getQty(item){
    var input=item && item.querySelector && item.querySelector("input[type=number],input[data-quantity]");
    if(input && input.value!=="" && isFinite(Number(input.value))) return Number(input.value);
    var raw=findAttr(item,["data-quantity","data-qty","data-qtd"]);
    if(raw!=="" && isFinite(Number(raw))) return Number(raw);

    // O carrinho atual mostra a quantidade como texto entre "-" e "+".
    var nodes=item && item.querySelectorAll ? item.querySelectorAll("*") : [];
    for(var i=0;i<nodes.length;i++){
      var txt=String(nodes[i].textContent||"").replace(/\s+/g," ").trim();
      var m=txt.match(/(?:^|\s)[−-]\s*(\d+)\s*\+(?:\s|$)/);
      if(m) return Number(m[1]);
    }
    var whole=String(item && item.textContent||"").replace(/\s+/g," ").trim();
    var m2=whole.match(/(?:^|\s)[−-]\s*(\d+)\s*\+(?:\s|$)/);
    if(m2) return Number(m2[1]);
    return null;
  }
  function getRow(item){
    var key=getKey(item), variant=getVariant(item);
    if(!key) return null;
    var candidates=rows.filter(function(r){return r.product_key===key && r.active!==false;});
    if(!candidates.length) return null;
    if(variant){
      var exact=candidates.find(function(r){return norm(r.variant)===norm(variant) || sizeNorm(r.variant)===sizeNorm(variant);});
      if(exact) return exact;
    }
    if(candidates.length===1) return candidates[0];
    return null;
  }

  function resolveContext(btn){
    var cur=btn, depth=0, best=null;
    while(cur && depth++<12){
      var row=getRow(cur);
      if(row){
        var qty=getQty(cur);
        if(qty!==null) return {item:cur,row:row,qty:qty};
        if(!best) best={item:cur,row:row,qty:null};
      }
      cur=cur.parentElement;
    }
    return best;
  }
  function toast(msg){
    var old=document.getElementById("uzi-stock-toast");
    if(old) old.remove();
    var d=document.createElement("div");
    d.id="uzi-stock-toast";
    d.textContent=msg;
    d.style.cssText="position:fixed;left:50%;bottom:24px;transform:translateX(-50%);z-index:2147483647;background:#111;color:#fff;border:1px solid #d4af37;border-radius:10px;padding:11px 16px;font:600 13px Arial,sans-serif;box-shadow:0 8px 30px rgba(0,0,0,.35);";
    document.body.appendChild(d);
    setTimeout(function(){d.remove();},2200);
  }
  function isPlus(btn){
    var t=norm(btn.textContent);
    var a=norm(btn.getAttribute("aria-label"));
    var title=norm(btn.getAttribute("title"));
    return t==="+" || /aument|increment|adicionar/.test(a+" "+title);
  }
  function decorate(){
    document.querySelectorAll("button").forEach(function(btn){
      if(!isPlus(btn)) return;
      var ctx=resolveContext(btn);
      if(!ctx) return;
      var item=ctx.item, row=ctx.row;
      var qty=ctx.qty!==null?ctx.qty:getQty(item), stock=Number(row.stock||0);
      var atMax=qty!==null && qty>=stock;
      if(stock<=0 || atMax){
        btn.disabled=true;
        btn.setAttribute("aria-disabled","true");
        btn.title=stock<=0 ? "Esgotado" : "Máximo disponível: "+stock;
        btn.style.opacity=".45";
        btn.style.cursor="not-allowed";
      }else{
        btn.disabled=false;
        btn.removeAttribute("aria-disabled");
        btn.removeAttribute("title");
        btn.style.opacity="";
        btn.style.cursor="";
      }
      if(atMax && stock>0 && !item.querySelector(".uzi-stock-limit-msg")){
        var m=document.createElement("div");
        m.className="uzi-stock-limit-msg";
        m.textContent="Máximo disponível: "+stock;
        m.style.cssText="font-size:11px;color:#aaa;margin-top:3px;";
        item.appendChild(m);
      }else if(!atMax){
        var old=item.querySelector(".uzi-stock-limit-msg");
        if(old) old.remove();
      }
    });
  }
  async function load(){
    try{
      var u=SUPABASE_URL+"/rest/v1/inventory_items?select=product_key,variant,stock,active&active=eq.true";
      var res=await fetch(u,{headers:{apikey:SUPABASE_KEY,Authorization:"Bearer "+SUPABASE_KEY}});
      if(!res.ok) throw new Error("inventory "+res.status);
      rows=await res.json();
      loaded=true;
      decorate();
    }catch(e){ console.warn("[UZI18K] cart stock guard:",e); }
  }

  document.addEventListener("click",function(e){
    var btn=e.target.closest && e.target.closest("button");
    if(!btn || !isPlus(btn) || !loaded) return;
    var ctx=resolveContext(btn);
    if(!ctx) return;
    var item=ctx.item, row=ctx.row;
    var stock=Number(row.stock||0), qty=ctx.qty!==null?ctx.qty:getQty(item);
    if(stock<=0 || (qty!==null && qty>=stock)){
      e.preventDefault();
      e.stopImmediatePropagation();
      toast(stock<=0 ? "Produto esgotado." : "Máximo disponível: "+stock);
      decorate();
    }
  },true);

  var mo=new MutationObserver(function(){ decorate(); });
  function start(){
    load();
    mo.observe(document.body,{childList:true,subtree:true});
    setInterval(decorate,1200);
  }
  if(document.readyState==="loading") document.addEventListener("DOMContentLoaded",start,{once:true});
  else start();
})();