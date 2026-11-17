(() => {
  "use strict";

  const UNLOCK_NAME = "openmenumod";
  const LOCK_NAME = "closemenumod";
  const STORAGE_KEY = "polytrack2_modmenu_unlocked";
  const OPACITY_KEY = "polytrack2_ghost_opacity";

  let ghostEnabled = false;
  let ownOpacity = Number(localStorage.getItem(OPACITY_KEY)) || 0.3;
  let menuOpen = false;

  const cars = () => window.__pt2CarObjects || [];
  const isTyping = event => {
    const el = event.target;
    return el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
  };

  function applyGhostMode() {
    const allCars = cars();
    allCars.forEach((car, index) => {
      if (!car) return;
      if (!ghostEnabled) {
        if (typeof car.setVisible === "function") car.setVisible(true);
        if (typeof car.setOpacity === "function") car.setOpacity(1);
      } else if (index === 0) {
        // The first created car is treated as the local player's car.
        if (typeof car.setVisible === "function") car.setVisible(true);
        if (typeof car.setOpacity === "function") car.setOpacity(ownOpacity);
      } else {
        if (typeof car.setVisible === "function") car.setVisible(false);
      }
    });
  }

  function setGhostMode(enabled) {
    ghostEnabled = enabled;
    applyGhostMode();
    updateControls();
  }

  function isUnlocked() {
    return localStorage.getItem(STORAGE_KEY) === "true";
  }

  function setUnlocked(value) {
    localStorage.setItem(STORAGE_KEY, value ? "true" : "false");
  }

  const style = document.createElement("style");
  style.textContent = `
    #pt2-mod-launcher {
      position:fixed; right:16px; top:16px; z-index:99999;
      background:#d62936; color:#fff; border:1px solid #fff;
      padding:8px 11px; font:bold 12px Arial; cursor:pointer;
      border-radius:8px; box-shadow:0 3px 12px #0009;
    }
    #pt2-mod-panel {
      position:fixed; right:16px; top:58px; z-index:99999;
      width:180px; box-sizing:border-box; padding:9px;
      color:#f5f5f7; background:rgba(20,22,29,.97);
      border:1px solid #d62936; border-radius:10px;
      box-shadow:0 8px 26px #000b; font:12px Arial,sans-serif;
    }
    #pt2-mod-panel[hidden] { display:none !important; }
    #pt2-mod-panel .pt2-head { display:flex; align-items:center; justify-content:space-between; margin-bottom:5px; }
    #pt2-mod-panel h2 { margin:0; color:#ff626c; font-size:14px; letter-spacing:.4px; }
    #pt2-mod-panel button {
      border:0; border-radius:5px; padding:6px 8px;
      color:#fff; background:#c52230; font-size:11px;
      font-weight:bold; cursor:pointer;
    }
    #pt2-mod-panel button:active { transform:scale(.97); }
    #pt2-mod-panel .pt2-close { background:#454852; padding:4px 7px; }
    #pt2-mod-panel .pt2-card { border-top:1px solid #383b45; padding:7px 0; }
    #pt2-mod-panel .pt2-row { display:flex; align-items:center; justify-content:space-between; gap:5px; }
    #pt2-mod-panel .pt2-status { color:#ffb9bd; font-size:10px; margin:3px 0 5px; }
    #pt2-mod-panel .pt2-status.on { color:#83f0a1; }
    #pt2-mod-panel .pt2-help { color:#aeb2bd; font-size:10px; line-height:1.3; margin:4px 0 0; }
    #pt2-mod-panel input[type=range] { width:100%; accent-color:#ed3543; margin:6px 0 1px; }
    #pt2-mod-panel .pt2-footer { color:#858a96; font-size:9px; line-height:1.3; margin-top:5px; }
  `;
  document.head.appendChild(style);

  let panel;
  let ghostButton;
  let ghostStatus;
  let opacityValue;

  function updateControls() {
    if (!ghostButton) return;
    ghostButton.textContent = ghostEnabled ? "Turn OFF" : "Turn ON";
    ghostStatus.textContent = ghostEnabled ? "ON  •  opponents hidden" : "OFF  •  normal visibility";
    ghostStatus.classList.toggle("on", ghostEnabled);
    if (opacityValue) opacityValue.textContent = Math.round(ownOpacity * 100) + "%";
  }

  function togglePanel(force) {
    if (!panel) return;
    menuOpen = typeof force === "boolean" ? force : !menuOpen;
    panel.hidden = !menuOpen;
  }

  function buildMenu() {
    if (!isUnlocked() || document.getElementById("pt2-mod-launcher")) return;

    const launcher = document.createElement("button");
    launcher.id = "pt2-mod-launcher";
    launcher.textContent = "⚙ MODS";
    launcher.addEventListener("click", () => togglePanel());

    panel = document.createElement("section");
    panel.id = "pt2-mod-panel";
    panel.hidden = true;
    panel.innerHTML = `
      <div class="pt2-head">
        <h2>POLYTRACK MODS</h2>
        <button class="pt2-close" type="button" aria-label="Close">✕</button>
      </div>
      <div class="pt2-card">
        <div class="pt2-row"><strong>👻 Ghost mode</strong><span style="color:#aeb2bd;font-size:9px">[G]</span></div>
        <div class="pt2-status" id="pt2-ghost-status">OFF • normal visibility</div>
        <button id="pt2-ghost-toggle" type="button">Turn ON</button>
        <p class="pt2-help">Your car stays visible. Other cars disappear on your screen.</p>
      </div>
      <div class="pt2-card">
        <div class="pt2-row"><strong>Car transparency</strong><strong id="pt2-opacity-value">30%</strong></div>
        <input id="pt2-opacity" type="range" min="15" max="70" step="5" value="${Math.round(ownOpacity * 100)}">
        <p class="pt2-help">Adjust how see-through your car is in Ghost mode.</p>
      </div>
      <div class="pt2-card">
        <div class="pt2-row"><strong>Visibility reset</strong><button id="pt2-reset" type="button">Reset</button></div>
        <p class="pt2-help">Show all cars and restore normal opacity.</p>
      </div>
      <div class="pt2-footer">F8 = open/close menu • G = Ghost mode<br>Type closemenumod as your player name to lock.</div>
    `;

    panel.querySelector(".pt2-close").addEventListener("click", () => togglePanel(false));
    ghostButton = panel.querySelector("#pt2-ghost-toggle");
    ghostStatus = panel.querySelector("#pt2-ghost-status");
    opacityValue = panel.querySelector("#pt2-opacity-value");

    ghostButton.addEventListener("click", () => setGhostMode(!ghostEnabled));
    panel.querySelector("#pt2-opacity").addEventListener("input", event => {
      ownOpacity = Number(event.target.value) / 100;
      localStorage.setItem(OPACITY_KEY, String(ownOpacity));
      if (ghostEnabled) applyGhostMode();
      updateControls();
    });
    panel.querySelector("#pt2-reset").addEventListener("click", () => {
      setGhostMode(false);
      ownOpacity = 0.3;
      localStorage.setItem(OPACITY_KEY, "0.3");
      panel.querySelector("#pt2-opacity").value = "30";
      updateControls();
    });

    document.body.appendChild(launcher);
    document.body.appendChild(panel);
    updateControls();
  }

  function removeMenu() {
    document.getElementById("pt2-mod-launcher")?.remove();
    document.getElementById("pt2-mod-panel")?.remove();
    panel = null;
    ghostButton = null;
    ghostStatus = null;
    opacityValue = null;
    menuOpen = false;
  }

  function checkName(value) {
    const name = String(value || "").trim().toLowerCase();
    if (name === UNLOCK_NAME) {
      setUnlocked(true);
      buildMenu();
    } else if (name === LOCK_NAME) {
      setUnlocked(false);
      setGhostMode(false);
      removeMenu();
    }
  }

  function watchNickname() {
    document.querySelectorAll("input").forEach(input => {
      if (input.dataset.pt2ModWatcher) return;
      input.dataset.pt2ModWatcher = "1";
      input.addEventListener("change", () => checkName(input.value));
      input.addEventListener("keydown", event => {
        if (event.key === "Enter") checkName(input.value);
      });
      input.addEventListener("blur", () => checkName(input.value));
    });
  }

  window.addEventListener("keydown", event => {
    if (isTyping(event) || !isUnlocked()) return;
    if (event.code === "F8") {
      event.preventDefault();
      togglePanel();
    } else if (event.code === "KeyG") {
      event.preventDefault();
      setGhostMode(!ghostEnabled);
    }
  });

  // Re-apply while Ghost mode is active so cars created later are handled too.
  window.setInterval(() => {
    if (ghostEnabled) applyGhostMode();
  }, 400);

  if (isUnlocked()) buildMenu();
  watchNickname();
  new MutationObserver(() => {
    watchNickname();
    if (isUnlocked()) buildMenu();
  }).observe(document.documentElement, { childList: true, subtree: true });
})();