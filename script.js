(function () {
  "use strict";

  var root = document.documentElement;
  var fireButton = document.querySelector("[data-fire-toggle]");
  var ticker = document.querySelector(".ticker");
  var tickerButton = document.querySelector("[data-ticker-pause]");
  var rockCount = document.querySelector("#rock-count");
  var rockPile = document.querySelector("#rock-pile");
  var rockNote = document.querySelector("#rock-note");
  var rockAdd = document.querySelector("[data-rock-add]");
  var rockRemove = document.querySelector("[data-rock-remove]");
  var form = document.querySelector("#grunt-form");
  var status = form ? form.querySelector(".form__status") : null;

  function store(key, value) {
    try {
      localStorage.setItem(key, String(value));
    } catch (error) {}
  }

  function read(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  /* ————— fire / night mode ————— */

  function syncFire() {
    if (!fireButton) return;
    var night = root.dataset.fire === "night";
    fireButton.textContent = night ? "SUN UP" : "SUN DOWN";
    fireButton.setAttribute("aria-pressed", String(night));
    fireButton.setAttribute("aria-label", night ? "Turn the cave light" : "Turn the cave dark");
  }

  if (fireButton) {
    syncFire();
    fireButton.addEventListener("click", function () {
      var night = root.dataset.fire === "night";
      root.dataset.fire = night ? "day" : "night";
      store("cave-fire", root.dataset.fire);
      syncFire();
    });
  }

  /* ————— ticker pause ————— */

  if (ticker && tickerButton) {
    tickerButton.addEventListener("click", function () {
      var paused = ticker.classList.toggle("is-paused");
      tickerButton.textContent = paused ? "GO" : "STOP";
      tickerButton.setAttribute("aria-pressed", String(paused));
      tickerButton.setAttribute("aria-label", paused ? "Start cave news" : "Pause cave news");
    });
  }

  /* ————— rock counter ————— */

  var rockPaths = [
    "M4 26 L10 9 L24 4 L39 10 L45 24 L34 31 L14 30 Z",
    "M3 22 L8 8 L20 3 L36 8 L44 20 L39 30 L15 32 Z",
    "M6 28 L5 14 L18 5 L34 6 L43 18 L40 29 L22 33 Z",
    "M5 20 L12 7 L28 4 L42 12 L43 26 L30 32 L11 29 Z"
  ];
  var maxRocksShown = 60;

  function clampRock(value) {
    var number = Number.parseInt(value, 10);
    if (!Number.isFinite(number)) return 0;
    return Math.min(Math.max(number, 0), 9999);
  }

  var rocks = clampRock(read("cave-rock") || 0);

  function makeRock(index, isNew) {
    var svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
    var path = document.createElementNS("http://www.w3.org/2000/svg", "path");
    var variant = index % rockPaths.length;
    var rotation = ((index * 37) % 31) - 15;

    svg.setAttribute("class", "rock-glyph" + (index % 7 === 0 ? " rock-glyph--accent" : "") + (isNew ? " is-new" : ""));
    svg.setAttribute("viewBox", "0 0 48 34");
    svg.setAttribute("aria-hidden", "true");
    svg.setAttribute("focusable", "false");
    svg.style.setProperty("--rot", rotation + "deg");
    path.setAttribute("d", rockPaths[variant]);
    svg.appendChild(path);
    return svg;
  }

  function renderRocks(isNew) {
    if (!rockPile || !rockCount || !rockRemove) return;

    rockCount.textContent = String(rocks);
    rockRemove.disabled = rocks === 0;

    var fragment = document.createDocumentFragment();
    var shown = Math.min(rocks, maxRocksShown);

    if (shown === 0) {
      var empty = document.createElement("p");
      empty.className = "rock__empty";
      empty.textContent = "NO ROCK. YET.";
      fragment.appendChild(empty);
    } else {
      for (var index = 0; index < shown; index += 1) {
        fragment.appendChild(makeRock(index, isNew && index === shown - 1));
      }
    }

    rockPile.replaceChildren(fragment);

    if (rockNote) {
      rockNote.textContent = rocks > maxRocksShown
        ? "PILE TOO BIG. NUMBER STILL TRUE."
        : "CAVE REMEMBER. (THIS BROWSER ONLY.)";
    }
  }

  if (rockAdd && rockRemove) {
    renderRocks(false);

    rockAdd.addEventListener("click", function () {
      rocks = Math.min(rocks + 1, 9999);
      store("cave-rock", rocks);
      renderRocks(true);
    });

    rockRemove.addEventListener("click", function () {
      rocks = Math.max(rocks - 1, 0);
      store("cave-rock", rocks);
      renderRocks(false);
    });
  }

  /* ————— grunt form ————— */

  if (form && status) {
    form.addEventListener("submit", function (event) {
      event.preventDefault();
      var nameField = form.elements.namedItem("name");
      var messageField = form.elements.namedItem("message");
      var name = nameField ? nameField.value.trim() : "";
      var message = messageField ? messageField.value.trim() : "";

      if (!name || !message) return;

      status.textContent = "GRUNT RECEIVED, " + name.toUpperCase() + ". WE GRUNT BACK WHEN SUN COME UP.";
      form.reset();
    });
  }

  /* ————— cave door ————— */

  var doorForm = document.querySelector("#door-form");
  var doorStatus = doorForm ? doorForm.querySelector(".form__status") : null;

  if (doorForm && doorStatus) {
    doorForm.addEventListener("submit", function (event) {
      event.preventDefault();
      var nameField = doorForm.elements.namedItem("name");
      var secretField = doorForm.elements.namedItem("secret");
      var name = nameField ? nameField.value.trim() : "";
      var secret = secretField ? secretField.value : "";

      if (!name || !secret) return;

      store("cave-name", name);
      doorStatus.textContent = "DOOR OPEN, " + name.toUpperCase() + ". YOU IN CAVE.";
    });
  }
})();
