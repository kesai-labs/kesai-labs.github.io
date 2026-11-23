// Lightbox for the example images in section 4: click to open, previous/next buttons,
// arrow keys, Escape to close; click the image to zoom in and drag or scroll to pan.
(function () {
  var LABELS = {
    en: { prev: 'Previous image', next: 'Next image', close: 'Close', dialog: 'Example images' },
    de: { prev: 'Vorheriges Bild', next: 'Nächstes Bild', close: 'Schließen', dialog: 'Beispielbilder' },
    fr: { prev: 'Image précédente', next: 'Image suivante', close: 'Fermer', dialog: "Images d'exemple" }
  };

  var lb, stage, img, count, btnPrev, btnNext, btnClose;
  var items = [], index = 0, opener = null;
  var drag = null, dragMoved = false;

  function build() {
    lb = document.createElement('div');
    lb.className = 'pix-lb';
    lb.setAttribute('role', 'dialog');
    lb.setAttribute('aria-modal', 'true');
    lb.innerHTML =
      '<div class="pix-lb-stage"><img alt=""></div>' +
      '<div class="pix-lb-count"></div>' +
      '<button class="pix-lb-btn pix-lb-prev" type="button">&#8249;</button>' +
      '<button class="pix-lb-btn pix-lb-next" type="button">&#8250;</button>' +
      '<button class="pix-lb-btn pix-lb-close" type="button">&times;</button>';
    document.body.appendChild(lb);
    stage = lb.querySelector('.pix-lb-stage');
    img = stage.querySelector('img');
    count = lb.querySelector('.pix-lb-count');
    btnPrev = lb.querySelector('.pix-lb-prev');
    btnNext = lb.querySelector('.pix-lb-next');
    btnClose = lb.querySelector('.pix-lb-close');

    btnPrev.addEventListener('click', function () { show(index - 1); });
    btnNext.addEventListener('click', function () { show(index + 1); });
    btnClose.addEventListener('click', close);
    lb.addEventListener('click', function (e) { if (e.target === lb || e.target === stage) close(); });
    img.addEventListener('click', function (e) {
      if (dragMoved) { dragMoved = false; return; }
      toggleZoom(e);
    });

    stage.addEventListener('mousedown', function (e) {
      if (!lb.classList.contains('zoomed') || e.button !== 0) return;
      drag = { x: e.clientX, y: e.clientY, left: stage.scrollLeft, top: stage.scrollTop };
      dragMoved = false;
      stage.classList.add('dragging');
      e.preventDefault();
    });
    window.addEventListener('mousemove', function (e) {
      if (!drag) return;
      var dx = e.clientX - drag.x, dy = e.clientY - drag.y;
      if (Math.abs(dx) + Math.abs(dy) > 4) dragMoved = true;
      stage.scrollLeft = drag.left - dx;
      stage.scrollTop = drag.top - dy;
    });
    window.addEventListener('mouseup', function () {
      drag = null;
      stage.classList.remove('dragging');
    });

    document.addEventListener('keydown', function (e) {
      if (!lb.classList.contains('open')) return;
      if (e.key === 'Escape') close();
      else if (e.key === 'ArrowLeft') show(index - 1);
      else if (e.key === 'ArrowRight') show(index + 1);
    });
  }

  function unzoom() {
    lb.classList.remove('zoomed');
    img.style.width = '';
    stage.scrollLeft = 0;
    stage.scrollTop = 0;
  }

  function toggleZoom(e) {
    if (lb.classList.contains('zoomed')) { unzoom(); return; }
    var r = img.getBoundingClientRect();
    var fx = (e.clientX - r.left) / r.width, fy = (e.clientY - r.top) / r.height;
    var width = Math.max(img.naturalWidth, r.width * 2);
    lb.classList.add('zoomed');
    img.style.width = width + 'px';
    var s = stage.getBoundingClientRect();
    var height = width * img.naturalHeight / img.naturalWidth;
    stage.scrollLeft = fx * width - (e.clientX - s.left);
    stage.scrollTop = fy * height - (e.clientY - s.top);
  }

  function show(i) {
    index = (i + items.length) % items.length;
    unzoom();
    var a = items[index];
    img.src = a.getAttribute('href');
    img.alt = a.querySelector('img').alt;
    count.textContent = (index + 1) + ' / ' + items.length;
  }

  function open(gallery, i, link) {
    if (!lb) build();
    var t = LABELS[document.documentElement.lang] || LABELS.en;
    lb.setAttribute('aria-label', t.dialog);
    btnPrev.setAttribute('aria-label', t.prev);
    btnNext.setAttribute('aria-label', t.next);
    btnClose.setAttribute('aria-label', t.close);
    items = Array.prototype.slice.call(gallery.querySelectorAll('.pix-thumb'));
    opener = link;
    show(i);
    lb.classList.add('open');
    document.documentElement.classList.add('pix-lb-open');
    btnClose.focus();
  }

  function close() {
    lb.classList.remove('open');
    document.documentElement.classList.remove('pix-lb-open');
    unzoom();
    if (opener) opener.focus();
  }

  document.addEventListener('click', function (e) {
    var link = e.target.closest && e.target.closest('.pix-thumb');
    if (!link || e.ctrlKey || e.metaKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    var gallery = link.closest('.pix-gallery');
    var thumbs = Array.prototype.slice.call(gallery.querySelectorAll('.pix-thumb'));
    open(gallery, thumbs.indexOf(link), link);
  });
})();
