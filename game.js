(() => {
  "use strict";

  // The map is drawn at a 2:1 aspect ratio. These coordinates trace the path on its artwork.
  const W = 768, H = 384;
  const roads = {
    west: [0.018, .706], w0: [.062, .727], w1: [.12, .754],
    chongqing: [.17, .736], w2: [.19, .731], bridgeWest: [.255, .688],
    w3: [.30, .686], w4: [.35, .654], w5: [.405, .652], centerSteps: [.467, .615],
    shanghai: [.49, .611], c0: [.512, .608], c1: [.572, .629], c2: [.621, .601],
    bridgeEast: [.683, .565], e0: [.738, .582], e1: [.79, .538],
    harbin: [.807, .535], e2: [.85, .537], e3: [.887, .512], e4: [.927, .409], east: [.959, .375],
    cqSteps: [.075, .667], cqPath: [.109, .61], cqBend: [.092, .551], cqShrine: [.064, .536],
    cqTerrace: [.079, .447], cqRoof: [.105, .41],
    shSouth: [.483, .689], shTerrace: [.5, .749], shLoop: [.532, .584], shGarden: [.542, .56],
    shSquare: [.529, .521], hbSteps: [.807, .509], hbCourt: [.807, .483]
  };
  const city = {
    chongqing: { title: "Chongqing", color: "#ffcf70", feature: "Profile" },
    shanghai: { title: "Shanghai", color: "#86e3bd", feature: "Projects" },
    harbin: { title: "Harbin", color: "#ace1ff", feature: "Education" }
  };
  const routes = [
    ["west","w0","w1","chongqing","w2","bridgeWest","w3","w4","w5","centerSteps","shanghai",
      "c0","c1","c2","bridgeEast","e0","e1","harbin","e2","e3","e4","east"],
    ["w0","cqSteps","cqPath","cqBend","cqShrine","cqTerrace","cqRoof"],
    ["centerSteps","shSouth","shTerrace"], ["c0","shLoop","shGarden","shSquare"],
    ["harbin","hbSteps","hbCourt"]
  ];
  const palette = {
    o: "#15162e", h: "#30283d", H: "#504058", g: "#74637b", s: "#edac8b",
    S: "#ffd1a5", p: "#d9857b", w: "#f6e8cd", j: "#343351", J: "#51506c",
    T: "#636985", t: "#333b5a", b: "#252941", B: "#646783", f: "#b0aaae"
  };
  const portrait = [
    "       oooooo      ",
    "     oohhhHHhoo    ",
    "    ohhhHHHHhhho   ",
    "   ohhHHHhHHhHhho  ",
    "   ohhHhhHhhhhhho  ",
    "  ohhHhhhhohHHhhho ",
    "  ohHhhhsSSShhhHho ",
    "  ohHhsSSSSSSShhho ",
    "  ohhhSSooSSooShho ",
    "  ohhhsSoSSSSoSsho ",
    "  ohhhspSSSSSSpSho ",
    "  ohhhhsSSpsShhhho ",
    "  ohhhhhhssshhhhho ",
    "   ohhhoowSwoshhho ",
    "   ohhoJwwtwwJohho ",
    "  ohhoJjJwtwJjjohho",
    "  ohhoJjJwtwJjJjoho",
    "  ohhoJjJjtJjjJjoh ",
    "   ooJjJjJtJjjJjo  ",
    "    oJjJjjTJjjJjo  ",
    "    ojjJjjjjjJjjo  ",
    "    ossjJjjjJjSso  ",
    "    ossjJJjJJjSso  ",
    "     ooojjjjjooo   "
  ];
  const feet = [
    [
      "      obbbBbbbo    ", "      obbbobbbo    ", "      obbbobbbo    ", "      osSsosSso    ",
      "      osssossso    ", "      obbbobbbo    ", "     obbbbobbbbo   ", "     ooooooooooo   "
    ],
    [
      "      obbbBbbbo    ", "      obbboBbbo    ", "      obbo ossso   ", "     osso   osso   ",
      "     osso   obbbo  ", "    obbbo   obBbbo ", "   obbBbo    oooo  ", "   oooooo          "
    ],
    [
      "      obbbBbbbo    ", "     obBbobbbbo    ", "     osso obbbo    ", "    obbbo  osso    ",
      "   obBbbo  osso    ", "   ooooo   obbbo   ", "           obBbbo  ", "           oooooo  "
    ]
  ];

  const clamp = (value, min, max) => Math.min(max, Math.max(min, value));
  const distance = (a, b) => Math.hypot(a.x - b.x, a.y - b.y);
  const nodes = Object.fromEntries(Object.entries(roads).map(([id, [x, y]]) => [id, { id, x: x * W, y: y * H, exits: [] }]));
  const edges = [];
  routes.forEach(route => route.slice(1).forEach((id, i) => {
    const a = nodes[route[i]], b = nodes[id];
    const edge = { a, b, length: distance(a, b) };
    edges.push(edge);
    a.exits.push({ to: b, edge }); b.exits.push({ to: a, edge });
  }));

  const buttons = { ArrowLeft: "left", ArrowRight: "right", ArrowUp: "up", ArrowDown: "down", a: "left", d: "right", w: "up", s: "down" };
  const held = new Map();
  let ui, frame = 0, previousTime = 0, elapsed = 0, pose = "", district = "";
  let lastFacing = 1, faceBack = false, plan = null;
  let position = { edge: edges[1], t: .28 };
  const pointOn = ({ edge, t }) => ({ x: edge.a.x + (edge.b.x - edge.a.x) * t, y: edge.a.y + (edge.b.y - edge.a.y) * t });
  const atNode = (node, edge = node.exits[0].edge) => ({ edge, t: edge.b === node ? 1 : 0 });

  function closestPath(x, y) {
    let best, least = Infinity;
    for (const edge of edges) {
      const dx = edge.b.x - edge.a.x, dy = edge.b.y - edge.a.y;
      const t = clamp(((x - edge.a.x) * dx + (y - edge.a.y) * dy) / (edge.length ** 2), 0, 1);
      const candidate = { edge, t };
      const d = distance(pointOn(candidate), { x, y });
      if (d < least) { best = candidate; least = d; }
    }
    return best;
  }

  // Plot a continuous walk over the road graph, including both partial end segments.
  function pathTo(target) {
    const start = pointOn(position), finish = pointOn(target);
    if (position.edge === target.edge) return [target];
    const cost = new Map(), previous = new Map(), open = new Set(Object.values(nodes));
    for (const node of [position.edge.a, position.edge.b]) cost.set(node, distance(start, node));
    while (open.size) {
      let node, best = Infinity;
      for (const item of open) {
        const value = cost.get(item) ?? Infinity;
        if (value < best) { node = item; best = value; }
      }
      if (!node) break;
      open.delete(node);
      for (const exit of node.exits) {
        if (!open.has(exit.to)) continue;
        const next = best + exit.edge.length;
        if (next >= (cost.get(exit.to) ?? Infinity)) continue;
        cost.set(exit.to, next);
        previous.set(exit.to, { node, edge: exit.edge });
      }
    }
    const candidates = [target.edge.a, target.edge.b];
    let end = candidates.reduce((a, b) => cost.get(b) + distance(b, finish) < cost.get(a) + distance(a, finish) ? b : a);
    const steps = [target];
    while (previous.has(end)) {
      const link = previous.get(end);
      steps.unshift(atNode(end, link.edge));
      end = link.node;
    }
    steps.unshift(atNode(end, position.edge));
    return steps;
  }

  function openDialog() { return Boolean(document.querySelector("dialog[open]")); }

  function sprite(step) {
    const key = step + "/" + faceBack;
    if (key === pose) return;
    pose = key;
    const ctx = ui.canvas.getContext("2d");
    ctx.clearRect(0, 0, 19, 32);
    portrait.concat(feet[step]).forEach((row, y) => {
      [...row].forEach((color, x) => {
        if (!palette[color]) return;
        if (faceBack && y >= 6 && y <= 13 && x >= 5 && x <= 14) color = x === 8 || x === 13 ? "H" : "h";
        if (faceBack && y > 13 && y < 21 && ["w","t","T"].includes(color)) color = "j";
        ctx.fillStyle = palette[color];
        ctx.fillRect(x, y, 1, 1);
      });
    });
  }

  function nearby() {
    const p = pointOn(position);
    return Object.keys(city).find(id => distance(p, nodes[id]) < 21);
  }

  function paint(moving = false, follow = false) {
    if (!ui) return;
    const p = pointOn(position);
    const name = p.x < W * .332 ? "chongqing" : p.x < W * .676 ? "shanghai" : "harbin";
    if (name !== district) {
      district = name;
      ui.current.textContent = city[district].title;
      ui.root.style.setProperty("--map-city", city[district].color);
    }
    ui.player.style.left = (p.x * 100 / W) + "%";
    ui.player.style.top = (p.y * 100 / H) + "%";
    ui.canvas.style.transform = "scaleX(" + lastFacing + ")";
    sprite(moving && !ui.reduced.matches ? [1, 0, 2, 0][Math.floor(elapsed / 100) % 4] : 0);
    const stop = nearby();
    ui.root.querySelectorAll("[data-map-city]").forEach(pin => pin.classList.toggle("map-near", pin.dataset.mapCity === stop));
    const action = stop ? "Open " + city[stop].feature.toLowerCase() : "Go to stop";
    if (ui.actionText.textContent !== action) ui.actionText.textContent = action;
    if (follow && ui.world.clientWidth > ui.view.clientWidth) {
      const viewport = ui.view.clientWidth, world = ui.world.clientWidth;
      const px = p.x / W * world, relative = px - ui.view.scrollLeft;
      if (relative < viewport * .25) ui.view.scrollLeft = Math.max(0, px - viewport * .25);
      else if (relative > viewport * .72) ui.view.scrollLeft = Math.min(world - viewport, px - viewport * .72);
    }
  }

  function stop() {
    held.clear(); plan = null; previousTime = 0;
    if (frame) cancelAnimationFrame(frame);
    frame = 0;
    paint();
  }

  function openStop(id) {
    stop();
    ui.root.querySelector('[data-map-city="' + id + '"]').classList.add("map-visited");
    if (typeof window.markCityVisited === "function") window.markCityVisited(id);
    if (typeof window.openPortfolioPanel === "function") window.openPortfolioPanel(id);
  }

  function queue() {
    if (!frame && !openDialog() && !document.hidden) frame = requestAnimationFrame(tick);
  }

  function setDestination(target, openId) {
    held.clear();
    plan = { steps: pathTo(target), openId };
    previousTime = 0;
    queue();
  }

  function keyboardStep(dx, dy, budget) {
    const edge = position.edge;
    let at = position.t <= .00001 ? edge.a : position.t >= .99999 ? edge.b : null;
    let heading;
    if (at) {
      let best = .045;
      for (const exit of at.exits) {
        const dot = (dx * (exit.to.x - at.x) + dy * (exit.to.y - at.y)) / exit.edge.length;
        if (dot > best) { best = dot; heading = exit; }
      }
      if (!heading) return 0;
      position = atNode(at, heading.edge);
    }
    const active = position.edge;
    const dot = dx * (active.b.x - active.a.x) + dy * (active.b.y - active.a.y);
    if (Math.abs(dot / active.length) <= .045) return 0;
    const t = position.t;
    position.t = clamp(t + Math.sign(dot) * budget / active.length, 0, 1);
    return Math.abs(t - position.t) * active.length;
  }

  function walkPlan(budget) {
    while (plan.steps.length) {
      const target = plan.steps[0];
      const goal = pointOn(target), here = pointOn(position);
      const remaining = distance(here, goal);
      if (remaining <= budget + .00001) {
        position = { ...target };
        plan.steps.shift();
        budget -= remaining;
        continue;
      }
      // A route turns onto a new edge only at a shared endpoint.
      const fromT = position.edge === target.edge ? position.t : distance(here, target.edge.a) < .001 ? 0 : 1;
      position = { edge: target.edge, t: fromT + Math.sign(target.t - fromT) * budget / target.edge.length };
      return;
    }
  }

  function tick(time) {
    frame = 0;
    if (openDialog() || document.hidden) { stop(); return; }
    const dt = previousTime ? clamp(time - previousTime, 0, 48) : 16;
    previousTime = time;
    elapsed += dt;
    const before = pointOn(position);
    let budget = dt * (plan ? .245 : .14);
    if (plan) {
      walkPlan(budget);
    } else {
      const values = [...held.values()];
      const dx = Number(values.includes("right")) - Number(values.includes("left"));
      const dy = Number(values.includes("down")) - Number(values.includes("up"));
      if (!dx && !dy) { stop(); return; }
      while (budget > .0001) {
        const consumed = keyboardStep(dx, dy, budget);
        if (consumed <= .00001) break;
        budget -= consumed;
      }
    }
    const after = pointOn(position), vx = after.x - before.x, vy = after.y - before.y;
    if (Math.abs(vx) > .02) lastFacing = vx > 0 ? 1 : -1;
    if (Math.abs(vx) + Math.abs(vy) > .02) faceBack = vy < -Math.abs(vx) * .65;
    paint(Math.abs(vx) + Math.abs(vy) > .02, true);
    if (plan && !plan.steps.length) {
      const openId = plan.openId;
      stop();
      if (openId) openStop(openId);
      return;
    }
    queue();
  }

  function focusMap(scroll = true) {
    if (!ui && !initialize()) return false;
    if (scroll) {
      const bounds = ui.view.getBoundingClientRect();
      if (bounds.bottom < 110 || bounds.top > window.innerHeight * .64) {
        ui.root.scrollIntoView({ block: "center", behavior: ui.reduced.matches ? "instant" : "smooth" });
      }
    }
    ui.view.focus({ preventScroll: true });
    return true;
  }

  function walkTo(id) {
    if (!city[id] || !focusMap() || openDialog()) return;
    setDestination(atNode(nodes[id]), id);
  }

  function interact() {
    if (openDialog()) return;
    const stopId = nearby();
    if (stopId) { openStop(stopId); return; }
    walkTo(district);
  }

  function acceptsKeys(target) {
    if (openDialog() || !ui || document.hidden || target.closest?.("input,textarea,select,[contenteditable=true]")) return false;
    if (ui.root.contains(target)) return true;
    if (target !== document.body && target !== document.documentElement) return false;
    const box = ui.view.getBoundingClientRect();
    return box.bottom > 100 && box.top < window.innerHeight - 80;
  }

  function initialize() {
    if (ui) return true;
    const root = document.querySelector("#world-map #gameRoot");
    if (!root) return false;
    const pins = Object.entries(city).map(([id, data]) => {
      const [x, y] = roads[id];
      return '<button class="map-pin" type="button" data-map-city="' + id + '" style="left:' + x*100 + '%;top:' + y*100 + '%;--pin-color:' + data.color + '" aria-label="Visit ' + data.title + ', ' + data.feature + '"><span class="map-pin-tag"><i aria-hidden="true"></i><span class="map-pin-copy"><strong>' + data.title + '</strong><small>' + data.feature + '</small></span></span><span class="map-pin-tip" aria-hidden="true"></span></button>';
    }).join("");
    root.innerHTML = `
      <div class="map-stage">
        <div class="map-viewport" tabindex="0" role="group" aria-label="Playable China world map" aria-describedby="map-help">
          <div class="map-world">
            <img class="map-art" src="assets/world-map.webp" alt="A winding road connects Chongqing’s hillside buildings, Shanghai’s skyline, and Harbin’s snowy cathedral." width="1536" height="768" draggable="false">
            ${pins}
            <div class="map-player" aria-hidden="true"><i></i><canvas width="19" height="32"></canvas></div>
          </div>
        </div>
        <div class="map-hud"><span class="map-gps" aria-hidden="true"></span><span>Current district<strong class="map-current">Chongqing</strong></span></div>
      </div>
      <div class="map-toolbar">
        <div class="map-legend" aria-label="Map legend"><span><i class="map-legend-player" aria-hidden="true"></i>You</span><span><i class="map-legend-stop" aria-hidden="true"></i>Portfolio stop</span></div>
        <p id="map-help"><span class="map-desktop-hint"><kbd>WASD</kbd> / <kbd>↑↓←→</kbd> Move</span><span class="map-touch-hint">Tap a road to walk</span></p>
        <div class="map-dpad" aria-label="Movement controls">${["left","up","down","right"].map(dir => '<button type="button" data-move="' + dir + '" aria-label="Move ' + dir + '"><i aria-hidden="true"></i></button>').join("")}</div>
        <button class="map-action" type="button"><kbd>E</kbd><span>Go to stop</span></button>
      </div>`;
    const el = selector => root.querySelector(selector);
    ui = { root, view: el(".map-viewport"), world: el(".map-world"), current: el(".map-current"),
      player: el(".map-player"), canvas: el(".map-player canvas"), actionText: el(".map-action span"),
      reduced: window.matchMedia("(prefers-reduced-motion: reduce)") };
    root.querySelectorAll("[data-map-city]").forEach(pin => pin.addEventListener("click", () => walkTo(pin.dataset.mapCity)));
    el(".map-action").addEventListener("click", interact);
    ui.world.addEventListener("click", event => {
      if (event.target.closest("button") || !event.detail || openDialog()) return;
      const box = ui.world.getBoundingClientRect();
      const x = W * (event.clientX - box.left) / box.width, y = H * (event.clientY - box.top) / box.height;
      focusMap(false);
      setDestination(closestPath(x, y), null);
    });
    root.querySelectorAll("[data-move]").forEach(button => {
      const dir = button.dataset.move;
      button.addEventListener("pointerdown", event => {
        if (event.button !== 0 || openDialog()) return;
        event.preventDefault();
        button.setPointerCapture(event.pointerId);
        held.set("pointer" + event.pointerId, dir);
        plan = null; queue();
      });
      button.addEventListener("lostpointercapture", event => {
        held.delete("pointer" + event.pointerId);
        if (!held.size && !plan) stop();
      });
      button.addEventListener("click", event => {
        if (event.detail || openDialog()) return;
        const dx = Number(dir === "right") - Number(dir === "left");
        const dy = Number(dir === "down") - Number(dir === "up");
        keyboardStep(dx, dy, 9); paint(false, true);
      });
    });
    document.addEventListener("keydown", event => {
      if (event.altKey || event.ctrlKey || event.metaKey || !acceptsKeys(event.target)) return;
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      if (key === "e") { event.preventDefault(); if (!event.repeat) interact(); return; }
      if (!buttons[key]) return;
      event.preventDefault();
      held.set(key, buttons[key]); plan = null; queue();
    });
    document.addEventListener("keyup", event => {
      const key = event.key.length === 1 ? event.key.toLowerCase() : event.key;
      if (!held.delete(key)) return;
      if (!held.size && !plan) stop();
    });
    window.addEventListener("blur", stop);
    document.addEventListener("visibilitychange", () => { if (document.hidden) stop(); });
    window.addEventListener("resize", () => paint(false, true));
    paint(false, true);
    return true;
  }

  window.ChinaGame = { start: () => focusMap(), walkTo, refresh: () => paint() };
  if (document.readyState === "loading") document.addEventListener("DOMContentLoaded", initialize, { once: true });
  else initialize();
})();
