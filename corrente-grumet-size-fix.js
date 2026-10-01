(function(){
  function fix(){
    var p=document.querySelector('.v75-product-page#produto-corrente-grumet');
    if(!p)return;
    var box=p.querySelector('.v75-sizes');
    if(!box)return;
    var sizes=[].slice.call(box.querySelectorAll('.v75-size'));
    if(!sizes.length)return;
    var first=sizes[0];
    first.setAttribute('data-size','65cm');
    first.textContent='65cm';
    first.style.display='';
    first.style.pointerEvents='';
    first.style.opacity='';
    first.classList.remove('is-sold-out');
    first.removeAttribute('aria-disabled');
    first.removeAttribute('title');
    first.classList.add('is-selected');
    for(var i=1;i<sizes.length;i++){
      sizes[i].style.display='none';
      sizes[i].classList.remove('is-selected');
      sizes[i].setAttribute('aria-disabled','true');
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