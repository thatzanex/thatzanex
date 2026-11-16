// Zane's Crystal Service: one card per colour with a Standard / Unstable switch, and an order panel.
// The order goes to the crystal-service Worker, which checks it, works out the price from
// crystals.json and posts it to Discord.
import { startHalftone } from "./halftone.js";

const API = location.hostname.endsWith("thatzane.de")
  ? "https://crystal-service.thatzane.workers.dev"
  : `http://${location.hostname}:8787`;

const $ = (s) => document.querySelector(s);
const esc = (s) => String(s).replace(/[&<>"']/g, (c) => `&#${c.charCodeAt(0)};`);
const num = (n) => n.toLocaleString("en-US");
const img = (c) => `/crystals/img/${c.id}.webp`;

let crystals = [];
/** One entry per colour: its standard and unstable crystal. */
let colours = [];
const byId = new Map();
const picked = new Set();
/** Which variant each card shows; the switch above the grid sets them all. */
const showing = new Map();
let showAll = "standard";
/** The most one order may total, and the wait between orders (both from crystals.json). */
let maxOrder = 3000;
let cooldownDays = 7;

// ---------- One order a week, remembered in this browser ----------
const LAST = "zcs-last-order";
function lastOrder() {
  try {
    const v = JSON.parse(localStorage.getItem(LAST) ?? "null");
    return v && typeof v.at === "number" ? v : null;
  } catch {
    return null;
  }
}
function rememberOrder(order) {
  try {
    localStorage.setItem(LAST, JSON.stringify(order));
  } catch {
    // storage blocked (private window): the limit just isn't remembered here
  }
}
/** When this browser may order again (0 = now). */
const nextOrderAt = () => {
  const last = lastOrder();
  return last ? last.at + cooldownDays * 86400000 : 0;
};
const waiting = () => nextOrderAt() > Date.now();
const day = (ms) => new Date(ms).toLocaleDateString("en-GB", { weekday: "long", day: "numeric", month: "long" });

const totalOf = () => crystals.filter((c) => picked.has(c.id)).reduce((sum, c) => sum + c.price, 0);

function card(col, i) {
  const v = showing.get(col.key) ?? showAll;
  const c = col[v];
  const has = picked.has(col.standard.id) || picked.has(col.unstable.id);
  const inThis = picked.has(c.id);
  // a crystal that would take the order past the limit can't be added
  const over = !inThis && totalOf() + c.price > maxOrder;
  const blocked = !inThis && (over || waiting());
  return `<article class="card${has ? " has" : ""}" style="--c:${c.color}" data-key="${col.key}">
    <div class="shot">
      <img src="${img(c)}" alt="${esc(c.name)} kyber crystal" width="300" height="300" ${i > 5 ? 'loading="lazy"' : ""}>
      ${v === "unstable" ? `<span class="tag">Unstable</span>` : ""}
      ${inThis ? `<span class="check" aria-hidden="true"><i class="ph-bold ph-check"></i></span>` : ""}
    </div>
    <div class="info"><h3><span class="swatch" aria-hidden="true"></span>${esc(col.standard.name)}</h3><span class="price">${num(c.price)} R$</span></div>
    <div class="quick" role="group" aria-label="${esc(col.standard.name)}: standard or unstable">
      <button type="button" class="quick-btn" data-variant="standard" aria-pressed="${v === "standard"}">Standard</button>
      <button type="button" class="quick-btn" data-variant="unstable" aria-pressed="${v === "unstable"}">Unstable</button>
    </div>
    <button type="button" class="btn" data-toggle="${c.id}" aria-pressed="${inThis}" ${blocked ? "disabled" : ""}
      ${over && !waiting() ? `title="This would take your order past ${num(maxOrder)} R$"` : ""}>
      <i class="ph${inThis ? "-bold ph-check" : over && !waiting() ? " ph-prohibit" : " ph-plus"}" aria-hidden="true"></i>${
        inThis ? "In your order" : over && !waiting() ? "Over the limit" : "Add to order"
      }
    </button>
  </article>`;
}

const drawGrid = () => ($("[data-grid]").innerHTML = colours.map(card).join(""));

function drawOrder() {
  const list = crystals.filter((c) => picked.has(c.id));
  const total = list.reduce((sum, c) => sum + c.price, 0);
  const words = `${list.length} ${list.length === 1 ? "crystal" : "crystals"}`;
  $("[data-picked]").innerHTML = list
    .map(
      (c) => `<li><img src="${img(c)}" alt="" width="40" height="40">
        <span class="label">${esc(c.name)}<small>${num(c.price)} R$</small></span>
        <button type="button" data-remove="${c.id}" aria-label="Remove ${esc(c.name)}"><i class="ph ph-x"></i></button></li>`,
    )
    .join("");
  $("[data-empty]").hidden = list.length > 0;
  $("[data-count]").textContent = words;
  $("[data-total]").textContent = num(total);
  const meter = $("[data-budget-bar]");
  meter.setAttribute("aria-valuemax", maxOrder);
  meter.setAttribute("aria-valuenow", total);
  meter.classList.toggle("full", total >= maxOrder);
  $("[data-budget-fill]").style.width = `${Math.min(100, (total / maxOrder) * 100)}%`;
  $("[data-budget-text]").textContent =
    total >= maxOrder ? `Limit reached: ${num(maxOrder)} R$ per order` : `${num(total)} of ${num(maxOrder)} R$ per order, ${num(maxOrder - total)} R$ left`;
  $("[data-chip-count]").textContent = list.length;
  $("[data-chip]").classList.toggle("on", list.length > 0);
  const bar = $("[data-bar]");
  bar.hidden = !list.length || window.matchMedia("(min-width: 1001px)").matches || !$("[data-done]").hidden || waiting();
  $("[data-bar-text]").textContent = `${words}, ${num(total)} R$`;
}

/** Redraws one card in place, keeping focus on the control that was used. */
function redrawCard(key) {
  const el = document.querySelector(`.card[data-key="${key}"]`);
  const i = colours.findIndex((c) => c.key === key);
  if (!el || i < 0) return;
  const a = document.activeElement;
  const focus = a?.dataset?.variant ? `[data-variant="${a.dataset.variant}"]` : a?.dataset?.toggle ? "[data-toggle]" : null;
  el.outerHTML = card(colours[i], i);
  if (focus) document.querySelector(`.card[data-key="${key}"] ${focus}`)?.focus();
}

/** Redraws every card (an add or remove changes which ones still fit), keeping focus where it was. */
function redrawAll(key) {
  const a = document.activeElement;
  const focus = a?.dataset?.toggle ? "[data-toggle]" : null;
  drawGrid();
  if (focus && key) document.querySelector(`.card[data-key="${key}"] ${focus}`)?.focus();
}

/** Within a week of the last order: the form makes way for when the next order is possible. */
function showWait() {
  if (!waiting() || !$("[data-done]").hidden) return;
  const last = lastOrder();
  $("[data-form]").hidden = true;
  $("[data-wait]").hidden = false;
  $("[data-wait-text]").innerHTML = `Your last order${last.id ? ` <strong class="mono">${esc(last.id)}</strong>` : ""} was on ${esc(day(last.at))}. You can look around in the meantime.`;
  $("[data-wait-next]").textContent = `Next order from ${day(nextOrderAt())}`;
}

function status(text, bad = false) {
  const el = $("[data-status]");
  el.textContent = text;
  el.classList.toggle("bad", bad);
}

async function load() {
  try {
    const res = await fetch("/crystals/crystals.json");
    const data = await res.json();
    crystals = data.crystals;
    maxOrder = Number(data.maxOrder) || maxOrder;
    cooldownDays = Number(data.cooldownDays) || cooldownDays;
  } catch {
    $("[data-grid]").innerHTML = `<p class="muted">The crystals couldn't be loaded. Refresh the page to try again.</p>`;
    return;
  }
  for (const c of crystals) byId.set(c.id, c);
  colours = crystals.filter((c) => !c.unstable).map((c) => ({ key: c.id, standard: c, unstable: byId.get(`unstable-${c.id}`) ?? c }));
  drawGrid();
  drawOrder();
  showWait();
}

const keyOf = (id) => id.replace(/^unstable-/, "");

document.addEventListener("click", (e) => {
  const all = e.target.closest("[data-show]");
  if (all) {
    showAll = all.dataset.show;
    showing.clear();
    document.querySelectorAll("[data-show]").forEach((b) => b.setAttribute("aria-pressed", String(b === all)));
    return drawGrid();
  }
  const variant = e.target.closest("[data-variant]");
  if (variant) {
    const key = variant.closest(".card").dataset.key;
    showing.set(key, variant.dataset.variant);
    return redrawCard(key);
  }
  const toggle = e.target.closest("[data-toggle]");
  if (toggle) {
    const id = toggle.dataset.toggle;
    picked.has(id) ? picked.delete(id) : picked.add(id);
    status("");
    redrawAll(keyOf(id));
    return drawOrder();
  }
  const rm = e.target.closest("[data-remove]");
  if (rm) {
    picked.delete(rm.dataset.remove);
    redrawAll();
    return drawOrder();
  }
});
window.matchMedia("(min-width: 1001px)").addEventListener("change", drawOrder);

$("[data-form]").addEventListener("submit", async (e) => {
  e.preventDefault();
  const form = e.target;
  const data = Object.fromEntries(new FormData(form));
  const roblox = String(data.roblox ?? "").trim();
  const discord = String(data.discord ?? "").trim();
  form.roblox.setAttribute("aria-invalid", String(!/^[A-Za-z0-9_]{3,20}$/.test(roblox)));
  form.discord.setAttribute("aria-invalid", String(discord.length < 2));
  if (waiting()) return showWait();
  if (!picked.size) return status("Add at least one crystal first.", true);
  if (totalOf() > maxOrder) return status(`An order can be at most ${num(maxOrder)} R$. Remove a crystal first.`, true);
  if (!/^[A-Za-z0-9_]{3,20}$/.test(roblox)) return status("Enter your Roblox username (3 to 20 letters, numbers or _).", true), form.roblox.focus();
  if (discord.length < 2) return status("Enter your Discord username, so Zane can message you.", true), form.discord.focus();

  const btn = $("[data-send]");
  const label = btn.querySelector("span");
  btn.disabled = true;
  label.textContent = "Sending…";
  status("");
  try {
    const res = await fetch(`${API}/order`, {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ roblox, discord, note: String(data.note ?? "").trim(), items: [...picked], website: data.website ?? "" }),
    });
    const body = await res.json().catch(() => ({}));
    if (!res.ok || !body.ok) throw new Error(body.error || "The order couldn't be sent. Try again in a minute.");
    $("[data-order-id]").textContent = body.id;
    $("[data-order-discord]").textContent = discord;
    // one order a week from this browser
    rememberOrder({ at: Date.now(), id: body.id });
    $("[data-done-next]").textContent = `Next order from ${day(nextOrderAt())}`;
    // the order is in: start fresh
    picked.clear();
    form.reset();
    form.hidden = true;
    const done = $("[data-done]");
    done.hidden = false;
    drawGrid();
    drawOrder();
    done.focus();
  } catch (err) {
    status(err.message === "Failed to fetch" ? "The order service can't be reached right now. Try again in a minute." : err.message, true);
  } finally {
    btn.disabled = false;
    label.textContent = "Send order";
  }
});

startHalftone();
load();
