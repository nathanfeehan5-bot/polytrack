(() => {
  "use strict";

  const UNLOCK_NAME = "openmenumod";
  const LOCK_NAME = "closemenumod";
  const STORAGE_KEY = "polytrack2_modmenu_unlocked";

  // Capture the simulation worker so the menu can send Fly controls to it.
  const NativeWorker = window.Worker;
  window.Worker = class extends NativeWorker {
    constructor(...args) {
      super(...args);
      window.__pt2SimulationWorker = this;
    }
  };

  let flyEnabled = false;
  let flyKeyDown = false;
  let invisibilityEnabled = false;

  function setInvisibility(enabled) {
    invisibilityEnabled = enabled;
    const cars = window.__pt2CarObjects || [];
    cars.forEach((car, index) => {
      if (!car) return;
      if (!enabled) {
        if (typeof car.setVisible === "function") car.setVisible(true);
        if (typeof car.setOpacity === "function") car.setOpacity(1);
        return;
      }
      if (index === 0) {
        // The first car created is the local player's car.
        if (typeof car.setVisible === "function") car.setVisible(true);
        if (typeof car.setOpacity === "function") car.setOpacity(0.3);
      } else if (typeof car.setVisible === "function") {
        car.setVisible(false);
      }
    });
  }
  function sendFlyControl(up) {
    const worker = window.__pt2SimulationWorker;
    if (worker) worker.postMessage({ messageType: "PolytrackFlyControl", up: !!up });
  }

  window.addEventListener("keydown", event => {
    if (event.code === "KeyQ" && flyEnabled) {
      event.preventDefault();
      if (!flyKeyDown) { flyKeyDown = true; sendFlyControl(true); }
    }
  });
  window.addEventListener("keyup", event => {
    if (event.code === "KeyQ" && flyKeyDown) {
      flyKeyDown = false;
      sendFlyControl(false);
    }
  });
  window.addEventListener("blur", () => {
    if (flyKeyDown) { flyKeyDown = false; sendFlyControl(false); }
  });

  const isUnlocked = () => localStorage.getItem(STORAGE_KEY) === "true";
  const setUnlocked = value => localStorage.setItem(STORAGE_KEY, value ? "true" : "false");

  const style = document.createElement("style");
  style.textContent = `
    #pt2-mod-launcher{position:fixed;right:18px;top:18px;z-index:99999;background:#b5121b;color:#fff;border:2px solid #fff;padding:10px 15px;font:bold 15px Arial;cursor:pointer;border-radius:8px;box-shadow:0 3px 14px #0009}
    #pt2-mod-panel{position:fixed;right:18px;top:64px;z-index:99999;width:180px;box-sizing:border-box;background:#17191f;color:#fff;border:2px solid #b5121b;border-radius:10px;padding:16px;font:14px Arial;box-shadow:0 8px 30px #000b}
    #pt2-mod-panel h2{margin:0 0 8px;color:#ff5a62;font-size:20px}
    #pt2-mod-panel p{color:#ccc;line-height:1.4}
    #pt2-mod-panel button{background:#b5121b;color:white;border:0;border-radius:6px;padding:8px 12px;cursor:pointer}
    #pt2-mod-panel .pt2-close{float:right;background:#444}
    #pt2-mod-panel .pt2-feature{padding:9px 0;border-top:1px solid #393b43}
    #pt2-mod-panel .pt2-status{color:#ffb8bb;font-size:12px}
  `;
  document.head.appendChild(style);

  function buildMenu() {
    if (!isUnlocked() || document.getElementById("pt2-mod-launcher")) return;

    const launcher = document.createElement("button");
    launcher.id = "pt2-mod-launcher";
    launcher.textContent = "⚙ MOD MENU";
    launcher.addEventListener("click", () => {
      const panel = document.getElementById("pt2-mod-panel");
      panel.hidden = !panel.hidden;
    });
    document.body.appendChild(launcher);

    const panel = document.createElement("section");
    panel.id = "pt2-mod-panel";
    panel.hidden = true;
    panel.innerHTML = `
      <button class="pt2-close" type="button">✕</button>
      <h2>POLYTRACK 2 MODS</h2>
      <p>Secret menu unlocked.</p>
      <div class="pt2-feature"><strong>Fly</strong><div class="pt2-status" id="pt2-fly-status">OFF — turn on to use Q</div><button id="pt2-fly-toggle" type="button">Enable Fly</button><div style="font-size:11px;color:#aaa;margin-top:5px">Hold Q to rise. Release to stop rising.</div></div>
      <div class="pt2-feature"><strong>Super Speed</strong><div class="pt2-status">Not connected to car physics yet</div></div>
      <div class="pt2-feature"><strong>Slow Other Cars</strong><div class="pt2-status">Not connected to multiplayer yet</div></div>
      <div class="pt2-feature"><strong>Invisibility</strong><div class="pt2-status" id="pt2-invis-status">OFF</div><button id="pt2-invis-toggle" type="button">Enable Invisibility</button><div style="font-size:11px;color:#aaa;margin-top:5px">Your car stays faintly visible; other cars are hidden on your screen.</div></div>
      <p style="font-size:11px">Enter closemenumod as your player name to lock this menu.</p>
    `;
    panel.querySelector(".pt2-close").addEventListener("click", () => panel.hidden = true);
    const flyButton = panel.querySelector("#pt2-fly-toggle");
    const flyStatus = panel.querySelector("#pt2-fly-status");
    flyButton.addEventListener("click", () => {
      flyEnabled = !flyEnabled;
      if (!flyEnabled && flyKeyDown) { flyKeyDown = false; sendFlyControl(false); }
      flyButton.textContent = flyEnabled ? "Disable Fly" : "Enable Fly";
      flyStatus.textContent = flyEnabled ? "ON — hold Q to rise" : "OFF — turn on to use Q";
      flyStatus.style.color = flyEnabled ? "#8dffad" : "#ffb8bb";
    });
    const invisButton = panel.querySelector("#pt2-invis-toggle");
    const invisStatus = panel.querySelector("#pt2-invis-status");
    invisButton.addEventListener("click", () => {
      setInvisibility(!invisibilityEnabled);
      invisButton.textContent = invisibilityEnabled ? "Disable Invisibility" : "Enable Invisibility";
      invisStatus.textContent = invisibilityEnabled ? "ON — your car is faint, others hidden" : "OFF";
      invisStatus.style.color = invisibilityEnabled ? "#8dffad" : "#ffb8bb";
    });
    document.body.appendChild(panel);
  }

  function removeMenu() {
    document.getElementById("pt2-mod-launcher")?.remove();
    document.getElementById("pt2-mod-panel")?.remove();
  }

  function checkName(value) {
    const name = String(value || "").trim().toLowerCase();
    if (name === UNLOCK_NAME) {
      setUnlocked(true);
      buildMenu();
    } else if (name === LOCK_NAME) {
      setUnlocked(false);
      removeMenu();
    }
  }

  function watchNickname() {
    document.querySelectorAll(".nickname input, .nickname input[type=text], input").forEach(input => {
      if (input.dataset.pt2ModWatcher) return;
      input.dataset.pt2ModWatcher = "1";
      input.addEventListener("change", () => checkName(input.value));
      input.addEventListener("keydown", event => {
        if (event.key === "Enter") checkName(input.value);
      });
      input.addEventListener("blur", () => checkName(input.value));
    });
  }

  if (isUnlocked()) buildMenu();
  watchNickname();
  new MutationObserver(() => {
    watchNickname();
    if (isUnlocked()) buildMenu();
  }).observe(document.documentElement, { childList: true, subtree: true });
})();