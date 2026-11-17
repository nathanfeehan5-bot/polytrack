(() => {
  "use strict";
  const UNLOCK_NAME="openmenumod", LOCK_NAME="closemenumod";
  const STORAGE_KEY="polytrack2_modmenu_unlocked", OPACITY_KEY="polytrack2_ghost_opacity";
  let ghostEnabled=false, ownOpacity=Number(localStorage.getItem(OPACITY_KEY))||0.3, menuOpen=false, activeTab="home";
  const cars=()=>window.__pt2CarObjects||[];
  const isTyping=e=>{const el=e.target;return el&&(el.tagName==="INPUT"||el.tagName==="TEXTAREA"||el.isContentEditable);};
  function applyGhostMode(){cars().forEach((car,index)=>{if(!car)return;if(!ghostEnabled){if(typeof car.setVisible==="function")car.setVisible(true);if(typeof car.setOpacity==="function")car.setOpacity(1);}else if(index===0){if(typeof car.setVisible==="function")car.setVisible(true);if(typeof car.setOpacity==="function")car.setOpacity(ownOpacity);}else if(typeof car.setVisible==="function")car.setVisible(false);});}
  function setGhostMode(v){ghostEnabled=v;applyGhostMode();updateControls();}
  const isUnlocked=()=>localStorage.getItem(STORAGE_KEY)==="true";
  const setUnlocked=v=>localStorage.setItem(STORAGE_KEY,v?"true":"false");
  const style=document.createElement("style");
  style.textContent=`
  #pt2-mod-launcher{position:fixed;right:20px;top:18px;z-index:99999;padding:10px 15px;border:1px solid #5365ff;border-radius:9px;background:linear-gradient(135deg,#202b62,#11162d);color:#fff;font:800 12px Arial;letter-spacing:1px;cursor:pointer;box-shadow:0 5px 22px #111b}
  #pt2-mod-panel{position:fixed;z-index:99998;right:20px;top:62px;width:min(560px,calc(100vw - 24px));height:min(390px,calc(100vh - 90px));display:flex;overflow:hidden;border:1px solid #303b70;border-radius:13px;background:#101321;color:#f5f6ff;font:13px Arial,sans-serif;box-shadow:0 18px 55px #000b}
  #pt2-mod-panel[hidden]{display:none!important}#pt2-mod-panel *{box-sizing:border-box}
  #pt2-mod-panel .pt2-side{width:142px;flex:0 0 142px;padding:15px 10px;background:linear-gradient(180deg,#171d39,#111525);border-right:1px solid #293052}
  #pt2-mod-panel .pt2-brand{font-size:14px;font-weight:900;letter-spacing:1.5px;margin:2px 5px 4px}#pt2-mod-panel .pt2-brand span{color:#7d8cff}
  #pt2-mod-panel .pt2-sub{font-size:9px;color:#8189ad;letter-spacing:2px;margin:0 5px 22px}
  #pt2-mod-panel .pt2-nav{display:grid;gap:6px}#pt2-mod-panel .pt2-nav button{width:100%;text-align:left;padding:10px 9px;border:1px solid transparent;border-radius:7px;background:transparent;color:#9ba3c4;font-size:11px;font-weight:700;cursor:pointer}
  #pt2-mod-panel .pt2-nav button.active{background:#28315b;border-color:#4654a0;color:white}
  #pt2-mod-panel .pt2-main{min-width:0;flex:1;padding:16px 17px;overflow:auto;background:radial-gradient(ellipse at 90% 0%,#20284a 0%,#121626 48%)}
  #pt2-mod-panel .pt2-top{display:flex;align-items:center;justify-content:space-between;padding-bottom:12px;border-bottom:1px solid #2b3150;margin-bottom:15px}
  #pt2-mod-panel .pt2-top h2{margin:0;font-size:16px;letter-spacing:.5px}#pt2-mod-panel .pt2-close{width:27px;height:27px;border:1px solid #3c456d;border-radius:7px;background:#202743;color:#cbd0eb;cursor:pointer}
  #pt2-mod-panel .pt2-page{display:none}#pt2-mod-panel .pt2-page.active{display:block}
  #pt2-mod-panel .pt2-card{padding:13px;margin-bottom:10px;border:1px solid #303858;border-radius:9px;background:linear-gradient(135deg,#1b2138,#171c2e)}
  #pt2-mod-panel .pt2-row{display:flex;align-items:center;justify-content:space-between;gap:10px}
  #pt2-mod-panel .pt2-muted{color:#929bbd;font-size:11px;line-height:1.5;margin:7px 0 0}
  #pt2-mod-panel .pt2-kicker{color:#8994c4;font-size:9px;font-weight:800;letter-spacing:1.7px;margin:0 0 7px}
  #pt2-mod-panel .pt2-action{padding:8px 12px;border:1px solid #5667df;border-radius:7px;background:linear-gradient(135deg,#5366ed,#3848b7);color:white;font-size:11px;font-weight:800;cursor:pointer}
  #pt2-mod-panel .pt2-action.secondary{background:#252c48;border-color:#424b72;color:#d8dcf4}
  #pt2-mod-panel .pt2-status{font-size:10px;color:#aab1d0;margin-top:6px}#pt2-mod-panel .pt2-status.on{color:#8ef0ba}
  #pt2-mod-panel input[type=range]{width:100%;accent-color:#7788ff;margin:12px 0 2px}
  #pt2-mod-panel .pt2-foot{font-size:9px;color:#747d9f;margin-top:15px}
  @media(max-width:430px){#pt2-mod-panel{right:8px;width:calc(100vw - 16px)}#pt2-mod-panel .pt2-side{width:112px;flex-basis:112px;padding:12px 7px}#pt2-mod-panel .pt2-main{padding:12px}}
  `;
  document.head.appendChild(style);
  let panel,ghostButton,ghostStatus,opacityValue,opacitySlider,homeStatus,homeToggle;
  function updateControls(){if(!ghostButton)return;ghostButton.textContent=ghostEnabled?"DISABLE":"ENABLE";ghostStatus.textContent=ghostEnabled?"ACTIVE · other cars hidden locally":"INACTIVE · normal visibility";ghostStatus.classList.toggle("on",ghostEnabled);opacityValue.textContent=Math.round(ownOpacity*100)+"%";opacitySlider.value=String(Math.round(ownOpacity*100));homeStatus.textContent=ghostEnabled?"ACTIVE":"INACTIVE";homeStatus.style.color=ghostEnabled?"#8ef0ba":"#aab1d0";homeToggle.textContent=ghostEnabled?"DISABLE GHOST":"ENABLE GHOST";}
  function togglePanel(force){if(!panel)return;menuOpen=typeof force==="boolean"?force:!menuOpen;panel.hidden=!menuOpen;}
  function showTab(tab){activeTab=tab;panel.querySelectorAll(".pt2-nav button").forEach(b=>b.classList.toggle("active",b.dataset.tab===tab));panel.querySelectorAll(".pt2-page").forEach(p=>p.classList.toggle("active",p.dataset.page===tab));panel.querySelector("#pt2-page-title").textContent=({home:"Dashboard",visuals:"Visual mods",settings:"Settings"})[tab]||"Dashboard";}
  function buildMenu(){
    if(!isUnlocked()||document.getElementById("pt2-mod-launcher"))return;
    const launcher=document.createElement("button");launcher.id="pt2-mod-launcher";launcher.textContent="✦ POLYTRACK";launcher.addEventListener("click",()=>togglePanel());
    panel=document.createElement("section");panel.id="pt2-mod-panel";panel.hidden=true;
    panel.innerHTML=`
      <aside class="pt2-side"><div class="pt2-brand">DELTA<span>•</span>PT</div><div class="pt2-sub">POLYTRACK MENU</div>
      <nav class="pt2-nav"><button class="active" data-tab="home">⌂ &nbsp; Dashboard</button><button data-tab="visuals">◈ &nbsp; Visuals</button><button data-tab="settings">⚙ &nbsp; Settings</button></nav><div class="pt2-foot">BUILD 1.0 · CLIENT</div></aside>
      <div class="pt2-main"><div class="pt2-top"><h2 id="pt2-page-title">Dashboard</h2><button class="pt2-close" type="button" aria-label="Close">✕</button></div>
      <section class="pt2-page active" data-page="home"><div class="pt2-card"><div class="pt2-kicker">WELCOME BACK</div><div style="font-size:17px;font-weight:800">Polytrack control centre</div><p class="pt2-muted">Quick access to your game modifications. Choose a section on the left to get started.</p></div>
      <div class="pt2-card"><div class="pt2-row"><strong>Ghost mode</strong><span id="pt2-home-status" class="pt2-status">INACTIVE</span></div><p class="pt2-muted">Hide other cars on your screen while keeping your own car faintly visible.</p><button class="pt2-action" id="pt2-home-toggle" type="button" style="margin-top:10px">ENABLE GHOST</button></div></section>
      <section class="pt2-page" data-page="visuals"><div class="pt2-card"><div class="pt2-kicker">PLAYER VISUALS</div><div class="pt2-row"><strong>Ghost mode</strong><button class="pt2-action" id="pt2-ghost-toggle" type="button">ENABLE</button></div><div class="pt2-status" id="pt2-ghost-status">INACTIVE · normal visibility</div><p class="pt2-muted">This is a local visual effect. It does not make you invisible to other players.</p></div>
      <div class="pt2-card"><div class="pt2-row"><strong>Car transparency</strong><strong id="pt2-opacity-value">30%</strong></div><input id="pt2-opacity" type="range" min="15" max="70" step="5" value="30"><p class="pt2-muted">Adjust your car's transparency while Ghost mode is active.</p></div></section>
      <section class="pt2-page" data-page="settings"><div class="pt2-card"><div class="pt2-kicker">PREFERENCES</div><div class="pt2-row"><strong>Reset visual settings</strong><button class="pt2-action secondary" id="pt2-reset" type="button">RESET</button></div><p class="pt2-muted">Turns Ghost mode off and restores the default 30% transparency setting.</p></div>
      <div class="pt2-card"><strong>Keyboard shortcuts</strong><p class="pt2-muted">F8 — open or close menu<br>G — toggle Ghost mode</p></div><div class="pt2-card"><strong>Lock menu</strong><p class="pt2-muted">Enter <b>closemenumod</b> as your player name to lock this menu.</p></div></section></div>`;
    document.body.appendChild(launcher);document.body.appendChild(panel);
    panel.querySelector(".pt2-close").addEventListener("click",()=>togglePanel(false));
    panel.querySelectorAll(".pt2-nav button").forEach(b=>b.addEventListener("click",()=>showTab(b.dataset.tab)));
    ghostButton=panel.querySelector("#pt2-ghost-toggle");ghostStatus=panel.querySelector("#pt2-ghost-status");opacityValue=panel.querySelector("#pt2-opacity-value");opacitySlider=panel.querySelector("#pt2-opacity");homeStatus=panel.querySelector("#pt2-home-status");homeToggle=panel.querySelector("#pt2-home-toggle");
    ghostButton.addEventListener("click",()=>setGhostMode(!ghostEnabled));homeToggle.addEventListener("click",()=>setGhostMode(!ghostEnabled));
    opacitySlider.addEventListener("input",e=>{ownOpacity=Number(e.target.value)/100;localStorage.setItem(OPACITY_KEY,String(ownOpacity));if(ghostEnabled)applyGhostMode();updateControls();});
    panel.querySelector("#pt2-reset").addEventListener("click",()=>{ownOpacity=.3;localStorage.setItem(OPACITY_KEY,"0.3");setGhostMode(false);});
    updateControls();showTab(activeTab);
  }
  function removeMenu(){document.getElementById("pt2-mod-launcher")?.remove();document.getElementById("pt2-mod-panel")?.remove();panel=ghostButton=ghostStatus=opacityValue=opacitySlider=homeStatus=homeToggle=null;menuOpen=false;}
  function checkName(value){const name=String(value||"").trim().toLowerCase();if(name===UNLOCK_NAME){setUnlocked(true);buildMenu();}else if(name===LOCK_NAME){setUnlocked(false);setGhostMode(false);removeMenu();}}
  function watchNickname(){document.querySelectorAll("input").forEach(input=>{if(input.dataset.pt2ModWatcher)return;input.dataset.pt2ModWatcher="1";input.addEventListener("change",()=>checkName(input.value));input.addEventListener("keydown",e=>{if(e.key==="Enter")checkName(input.value);});input.addEventListener("blur",()=>checkName(input.value));});}
  window.addEventListener("keydown",e=>{if(isTyping(e)||!isUnlocked())return;if(e.code==="F8"){e.preventDefault();togglePanel();}else if(e.code==="KeyG"){e.preventDefault();setGhostMode(!ghostEnabled);}});
  window.setInterval(()=>{if(ghostEnabled)applyGhostMode();},400);
  if(isUnlocked())buildMenu();watchNickname();new MutationObserver(()=>{watchNickname();if(isUnlocked())buildMenu();}).observe(document.documentElement,{childList:true,subtree:true});
})();