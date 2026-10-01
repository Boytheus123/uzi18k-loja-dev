(function(){
  function fixPulseiraVeneziana(){
    var p=document.querySelector('.v75-product-page#produto-pulseira-veneziana');
    if(!p)return false;
    var sizes=[].slice.call(p.querySelectorAll('.v75-size'));
    if(sizes.length<2)return false;
    var wanted=['20cm','21cm'];
    for(var i=0;i<2;i++){
      var el=sizes[i];
      el.setAttribute('data-size',wanted[i]);
      el.textContent=wanted[i];
      el.style.display='';
      el.style.pointerEvents='';
      el.style.opacity='';
      el.classList.remove('is-sold-out');
      el.classList.remove('is-selected');
      el.removeAttribute('aria-disabled');
      el.removeAttribute('title');
    }
    for(var j=2;j<sizes.length;j++){
      sizes[j].style.display='none';
      sizes[j].classList.remove('is-selected');
      sizes[j].setAttribute('aria-disabled','true');
    }
    return true;
  }
  fixPulseiraVeneziana();
  setTimeout(fixPulseiraVeneziana,300);
  setTimeout(fixPulseiraVeneziana,1000);
  setTimeout(fixPulseiraVeneziana,2000);
})();