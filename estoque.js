(function () {
  'use strict';

  const SUPABASE_URL =
    'https://meulxqleymbjkedaagby.supabase.co';

  const SUPABASE_KEY =
    'sb_publishable_8UM9No_56gY8ArX0yb1MmA_XVH-V-mV';

  const PRODUCT_KEYS = {
    'produto-duplix-5mm': 'pulseira-duplix-5mm',
    'produto-pulseira-cartier': 'pulseira-cartier-2mm',
    'produto-pulseira-grumet': 'pulseira-grumet-2-5mm',
    'produto-pulseira-piastrine-3mm': 'pulseira-piastrini-3mm',

    'produto-corrente-duplix': 'duplix-3mm',
    'produto-cordao-entrelacado': 'cordao-baiano-3mm',
    'produto-corrente-veneziana': 'veneziana-1mm',
    'produto-corrente-grumet': 'grumet-3mm',
    'produto-corrente-cadeado': 'cadeado-3mm',
    'produto-corrente-cartier': 'cartier-2mm',
    'produto-corrente-elo-portugues': 'elo-portugues-2mm',
    'produto-corrente-piastrini': 'piastrini-2mm',

    'produto-escapulario-cruz':
      'escapulario-espirito-santo-cruz',

    'produto-escapulario-jesus-nossa-senhora':
      'escapulario-nossa-senhora-cristo',

    'produto-duplix-3mm': 'pulseira-duplix-3mm',
    'produto-pulseira-veneziana': 'pulseira-veneziana-1mm',
    'produto-pulseira-cadeado': 'pulseira-cadeado-2-8mm'
  };


  function createClient() {
    if (
      !window.supabase ||
      !window.supabase.createClient
    ) {
      console.error('Supabase não carregado.');
      return null;
    }

    return window.supabase.createClient(
      SUPABASE_URL,
      SUPABASE_KEY
    );
  }


  function addSupabaseScript(callback) {
    if (window.supabase) {
      callback();
      return;
    }

    const script = document.createElement('script');

    script.src =
      'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2';

    script.onload = callback;

    script.onerror = function () {
      console.error(
        'Não foi possível carregar o Supabase.'
      );
    };

    document.head.appendChild(script);
  }


  function createStockStatus(product) {
    let status =
      product.querySelector('.uzi-live-stock');

    if (status) return status;

    status = document.createElement('div');

    status.className =
      'uzi-live-stock';

    status.style.cssText = `
      margin:10px 0 14px;
      font:700 12px/1.4 Arial,sans-serif;
      letter-spacing:.6px;
    `;

    const sizes =
      product.querySelector('.v75-sizes');

    if (sizes) {
      sizes.insertAdjacentElement(
        'afterend',
        status
      );
    }

    return status;
  }


  function setButtonState(
    product,
    stock,
    loaded
  ) {
    if (!loaded) return;

    const buttons =
      product.querySelectorAll(
        '.uzi-add-cart, .uzi-buy-now'
      );

    buttons.forEach(function (button) {

      const disabled =
        stock <= 0;

      button.disabled = disabled;

      button.setAttribute(
        'aria-disabled',
        disabled ? 'true' : 'false'
      );

      button.style.opacity =
        disabled ? '.45' : '1';

      button.style.cursor =
        disabled
          ? 'not-allowed'
          : 'pointer';

      if (disabled) {
        button.title =
          'Produto esgotado neste tamanho';
      } else {
        button.removeAttribute('title');
      }

    });
  }


  function connectProduct(
    product,
    rows
  ) {

    const sizes =
      product.querySelector('.v75-sizes');

    if (!sizes) return;

    const originalButtons =
      Array.from(
        sizes.querySelectorAll('.v75-size')
      );

    const template =
      originalButtons[0];

    const byVariant = {};

    rows.forEach(function (row) {

      const variant =
        String(
          row.variant || 'Único'
        ).toLowerCase();

      byVariant[variant] = row;

    });


    /*
      Reconstrói os tamanhos usando
      exatamente o estoque cadastrado.
    */

    sizes.innerHTML = '';


    rows.forEach(function (row) {

      const variant =
        String(
          row.variant || 'Único'
        );

      let button =
        originalButtons.find(function (old) {

          return String(
            old.getAttribute('data-size') ||
            old.textContent.trim()
          ).toLowerCase()
          === variant.toLowerCase();

        });


      if (!button) {

        button =
          template
            ? template.cloneNode(true)
            : document.createElement('a');

        if (!button.className) {
          button.className = 'v75-size';
        }

      }


      button.setAttribute(
        'data-size',
        variant
      );

      button.textContent =
        variant;


      if (!button.getAttribute('href')) {
        button.setAttribute(
          'href',
          '#' + product.id
        );
      }


      const stock =
        Number(row.stock || 0);


      if (stock <= 0) {

        button.style.pointerEvents =
          'none';

        button.style.opacity =
          '.45';

        button.style.borderColor =
          'rgba(255,90,90,.35)';

        button.setAttribute(
          'aria-disabled',
          'true'
        );

        button.setAttribute(
          'title',
          'Esgotado'
        );

      } else {

        button.style.pointerEvents =
          'auto';

        button.style.opacity =
          '1';

        button.setAttribute(
          'aria-disabled',
          'false'
        );

        button.setAttribute(
          'title',
          'Estoque: ' + stock
        );

      }


      sizes.appendChild(button);

    });


    const status =
      createStockStatus(product);


    function refresh() {

      const selected =
        product.querySelector(
          '.v75-size.is-selected'
        );


      if (!selected) {

        status.textContent =
          'SELECIONE UM TAMANHO';

        status.style.color =
          '#999';

        setButtonState(
          product,
          0,
          true
        );

        return;

      }


      const variant =
        String(
          selected.getAttribute('data-size') ||
          selected.textContent.trim()
        ).toLowerCase();


      const row =
        byVariant[variant];


      const stock =
        row
          ? Number(row.stock || 0)
          : 0;


      if (stock <= 0) {

        status.textContent =
          'ESGOTADO';

        status.style.color =
          '#ff7070';

      } else if (stock <= 2) {

        status.textContent =
          'ÚLTIMAS UNIDADES • ' +
          stock +
          ' disponível' +
          (stock === 1 ? '' : 'is');

        status.style.color =
          '#f3c65b';

      } else {

        status.textContent =
          'EM ESTOQUE • ' +
          stock +
          ' unidades disponíveis';

        status.style.color =
          '#62d889';

      }


      setButtonState(
        product,
        stock,
        true
      );

    }


    /*
      Quando o cliente escolhe um tamanho,
      atualizamos o estoque exibido.
    */

    sizes.addEventListener(
      'click',
      function (event) {

        const button =
          event.target.closest &&
          event.target.closest(
            '.v75-size'
          );

        if (!button) return;


        const variant =
          String(
            button.getAttribute(
              'data-size'
            ) ||
            button.textContent.trim()
          ).toLowerCase();


        const row =
          byVariant[variant];


        if (
          row &&
          Number(row.stock || 0) <= 0
        ) {

          event.preventDefault();

          event.stopImmediatePropagation();

          alert(
            'Este tamanho está esgotado.'
          );

          return;

        }


        setTimeout(
          refresh,
          20
        );

      },
      true
    );


    refresh();

  }


  async function loadInventory() {

    const supabase =
      createClient();

    if (!supabase) return;


    const products =
      Object.keys(
        PRODUCT_KEYS
      )
      .map(function (id) {
        return document.getElementById(id);
      })
      .filter(Boolean);


    if (!products.length) return;


    const keys =
      [...new Set(
        products.map(function (product) {
          return PRODUCT_KEYS[
            product.id
          ];
        })
      )];


    const result =
      await supabase
        .from('inventory_items')
        .select(
          'product_key,variant,stock,active'
        )
        .in(
          'product_key',
          keys
        )
        .eq(
          'active',
          true
        );


    if (result.error) {

      console.error(
        'Erro ao consultar estoque:',
        result.error
      );

      return;

    }


    const grouped = {};


    (result.data || [])
      .forEach(function (row) {

        if (
          !grouped[
            row.product_key
          ]
        ) {
          grouped[
            row.product_key
          ] = [];
        }


        grouped[
          row.product_key
        ].push(row);

      });


    products.forEach(
      function (product) {

        const key =
          PRODUCT_KEYS[
            product.id
          ];


        const rows =
          grouped[key] || [];


        if (rows.length) {

          connectProduct(
            product,
            rows
          );

        }

      }
    );

  }


  function start() {

    addSupabaseScript(
      loadInventory
    );

  }


  if (
    document.readyState ===
    'loading'
  ) {

    document.addEventListener(
      'DOMContentLoaded',
      start
    );

  } else {

    start();

  }

})();
