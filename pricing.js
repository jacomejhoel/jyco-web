/* ════════════════════════════════════════════════════════════════
   J&Co — FUENTE ÚNICA DE PRECIOS
   Edita los precios SOLO aquí. La cotizadora del index y las filas de
   precios de cada página de servicio se alimentan de este objeto.
   Todos los valores terminan en .99 y se muestran en formato es-EC.
   ════════════════════════════════════════════════════════════════ */
(function (w, d) {
  var PRICING = {
    'diag-op':  { label: 'Diagnóstico Operativo', type: 'fijo',  micro: 299.99, pequena: 449.99, mediana: 699.99,  grande: 999.99 },
    'diag-iso': { label: 'Diagnóstico ISO',       type: 'fijo',  micro: 349.99, pequena: 549.99, mediana: 849.99,  grande: 1199.99 },
    'mejora':   { label: 'Mejora Operativa',      type: 'rango', micro: [1499.99, 2999.99], pequena: [2999.99, 5999.99], mediana: [5999.99, 11999.99], grande: [11999.99, 19999.99] },
    'capac':    { label: 'Capacitación',          type: 'rango', micro: [499.99, 999.99],   pequena: [999.99, 1999.99],  mediana: [1999.99, 3999.99],  grande: [3999.99, 6999.99] },
    'iso-impl': { label: 'Implementación ISO',    type: 'rango', micro: [2499.99, 3999.99], pequena: [4499.99, 7999.99], mediana: [7999.99, 14999.99], grande: [14999.99, 24999.99], plusGrande: true }
  };
  var SIZE_LBL = { micro: 'Micro (1-10)', pequena: 'Pequeña (11-50)', mediana: 'Mediana (51-200)', grande: 'Grande (200+)' };
  var ORDER = ['micro', 'pequena', 'mediana', 'grande'];

  var money = function (n) {
    return '$' + (Number.isInteger(n)
      ? n.toLocaleString('es-EC')
      : n.toLocaleString('es-EC', { minimumFractionDigits: 2, maximumFractionDigits: 2 }));
  };

  // Texto de precio para un servicio + tamaño (igual que muestra la cotizadora).
  function priceFor(p, size) {
    if (p.type === 'fijo') return money(p[size]);
    var r = p[size];
    return money(r[0]) + ' – ' + money(r[1]) + (p.plusGrande && size === 'grande' ? '+' : '');
  }

  // Exponer para que el index (cotizadora) use la misma fuente.
  w.JCO_PRICING = PRICING;
  w.JCO_SIZE_LBL = SIZE_LBL;
  w.JCO_money = money;
  w.JCO_priceFor = priceFor;

  // Rellena las filas de precios de las páginas de servicio.
  // Markup esperado:
  //   <div data-pricing="mejora"> ... <span data-price="micro"></span> ... </div>
  function fillTables() {
    var cards = d.querySelectorAll('[data-pricing]');
    for (var i = 0; i < cards.length; i++) {
      var card = cards[i];
      var p = PRICING[card.getAttribute('data-pricing')];
      if (!p) continue;
      for (var j = 0; j < ORDER.length; j++) {
        var sz = ORDER[j];
        var cell = card.querySelector('[data-price="' + sz + '"]');
        if (cell) cell.textContent = priceFor(p, sz);
      }
    }
  }

  if (d.readyState === 'loading') d.addEventListener('DOMContentLoaded', fillTables);
  else fillTables();
})(window, document);
