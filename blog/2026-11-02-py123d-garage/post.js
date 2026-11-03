// Citation tooltips. Hovering or focusing a citation such as [12] shows the
// matching entry of the reference list in a card next to it, so the reader
// does not have to jump to the end of the post and back. The card stays open
// while the pointer is over it, so the links inside remain usable.
(function () {
  var links = document.querySelectorAll('.blog-body sup a[href^="#ref-"]');
  if (!links.length) return;

  var tip = document.createElement("div");
  tip.className = "cite-tip";
  tip.setAttribute("role", "tooltip");
  tip.hidden = true;
  document.body.appendChild(tip);

  var current = null;
  var hideTimer = null;

  function entryFor(link) {
    return document.getElementById(link.getAttribute("href").slice(1));
  }

  // Position of the entry in the reference list, independent of the number
  // printed in the citation, so a mismatch between the two is visible.
  function listNumber(entry) {
    var items = entry.parentElement ? entry.parentElement.children : [];
    for (var i = 0; i < items.length; i++) {
      if (items[i] === entry) return String(i + 1);
    }
    return "";
  }

  function fill(link, entry) {
    var cited = link.textContent.trim().replace(/^\[|\]$/g, "");
    var listed = listNumber(entry);
    var head = document.createElement("div");
    head.className = "cite-tip-head";
    if (listed && listed !== cited) {
      head.classList.add("is-mismatch");
      head.textContent = "Citation [" + cited + "] points to reference " + listed;
    } else {
      head.textContent = "Reference " + (listed || cited);
    }
    var body = document.createElement("div");
    body.className = "cite-tip-body";
    body.innerHTML = entry.innerHTML;
    tip.innerHTML = "";
    tip.appendChild(head);
    tip.appendChild(body);
  }

  function place(link) {
    var rect = link.getBoundingClientRect();
    var gap = 8;
    var margin = 12;
    tip.style.left = "0px";
    tip.style.top = "0px";
    var width = tip.offsetWidth;
    var height = tip.offsetHeight;
    var viewportWidth = document.documentElement.clientWidth;
    var left = Math.max(margin, Math.min(rect.left, viewportWidth - width - margin));
    var below = rect.bottom + gap + height <= window.innerHeight;
    var top = below ? rect.bottom + gap : rect.top - gap - height;
    tip.style.left = left + window.scrollX + "px";
    tip.style.top = top + window.scrollY + "px";
  }

  function show(link) {
    var entry = entryFor(link);
    if (!entry) return;
    clearTimeout(hideTimer);
    if (current !== link) {
      fill(link, entry);
      current = link;
    }
    tip.hidden = false;
    place(link);
  }

  function hide() {
    tip.hidden = true;
    current = null;
  }

  function scheduleHide() {
    clearTimeout(hideTimer);
    hideTimer = setTimeout(hide, 150);
  }

  links.forEach(function (link) {
    link.addEventListener("mouseenter", function () { show(link); });
    link.addEventListener("mouseleave", scheduleHide);
    link.addEventListener("focus", function () { show(link); });
    link.addEventListener("blur", scheduleHide);
  });
  tip.addEventListener("mouseenter", function () { clearTimeout(hideTimer); });
  tip.addEventListener("mouseleave", scheduleHide);
  document.addEventListener("keydown", function (event) {
    if (event.key === "Escape") hide();
  });
})();
