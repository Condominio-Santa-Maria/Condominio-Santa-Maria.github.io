/* Menú superior compartido: toggle en móvil */
(function () {
  var t = document.querySelector('.smnav-toggle');
  var l = document.querySelector('.smnav-links');
  if (!t || !l) return;
  t.addEventListener('click', function () {
    var open = l.classList.toggle('open');
    t.setAttribute('aria-expanded', open);
  });
  l.querySelectorAll('a').forEach(function (a) {
    a.addEventListener('click', function () {
      l.classList.remove('open');
      t.setAttribute('aria-expanded', false);
    });
  });
})();
