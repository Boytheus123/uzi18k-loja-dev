(function(){
  function fix(){
    var p=document.querySelector('.v75-product-page#produto-pulseira-cadeado');
    if(!p)return;
    var box=p.querySelector('.v75-sizes');
    if(!box)return;
    var sizes=[].slice.call(box.querySelectorAll('.v75-size'));
    if(!sizes.length)return;
    var wanted=['19cm','21cm'];

    if(sizes.length===1){
      var first=sizes[0];
      var second=first.cloneNode(true);
      first.setAttribute('data-size','19cm');
      first.textContent='19cm';
      second.setAttribute('data-size','21cm');
      second.textContent='21cm';
      second.classList.remove('is-selected');
      second.removeAttribute('aria-disabled');
      second.removeAttribute('title');
      box.appendChild(second);
      sizes=[first,second];
    }

    for(var i=0;i<2;i++){
      var el=sizes[i];
      if(!el)continue;
      el.setAttribute('data-size',wanted[i]);
      el.textContent=wanted[i];
      el.style.display='';
      el.style.pointerEvents='';
      el.style.opacity='';
      el.classList.remove('is-sold-out');
      el.removeAttribute('aria-disabled');
      el.removeAttribute('title');
    }
    for(var j=2;j<sizes.length;j++){
      sizes[j].style.display='none';
      sizes[j].classList.remove('is-selected');
    }
  }
  fix();
  var tries=0;
  var timer=setInterval(function(){
    fix();
    if(++tries>=100)clearInterval(timer);
  },300);
  window.addEventListener('hashchange',function(){setTimeout(fix,50);});
})();