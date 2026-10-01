(function(){
  function fix(){
    var p=document.querySelector('.v75-product-page#produto-pulseira-cadeado');
    if(!p)return;
    var sizes=[].slice.call(p.querySelectorAll('.v75-size'));
    if(sizes.length<2)return;
    ['19cm','21cm'].forEach(function(v,i){
      var el=sizes[i];
      el.setAttribute('data-size',v);
      el.textContent=v;
      el.style.display='';
      el.style.pointerEvents='';
      el.style.opacity='';
      el.classList.remove('is-sold-out');
      el.classList.remove('is-selected');
      el.removeAttribute('aria-disabled');
      el.removeAttribute('title');
    });
    for(var i=2;i<sizes.length;i++){
      sizes[i].style.display='none';
      sizes[i].classList.remove('is-selected');
      sizes[i].setAttribute('aria-disabled','true');
    }
  }
  fix();
  setTimeout(fix,300);
  setTimeout(fix,1000);
  setTimeout(fix,2000);
})();