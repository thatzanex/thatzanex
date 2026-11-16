// The halftone field behind the page, the same as in the Guardians Command Center: a grid of dots
// whose size follows a few slow, drifting waves, strongest at the top right and fading toward the
// bottom left. The dots near the pointer swell, like a lamp passing over them; the lamp follows the
// pointer smoothly and fades when it stops moving or leaves the window.
// It draws about 20 times a second, stops while the tab is hidden, and holds still for people who
// turn animations off.

const FPS = 20;

export function startHalftone() {
  const canvas = document.createElement("canvas");
  canvas.className = "halftone";
  canvas.setAttribute("aria-hidden", "true");
  document.body.prepend(canvas);
  const ctx = canvas.getContext("2d");
  if (!ctx) return;
  const still = matchMedia("(prefers-reduced-motion: reduce)");

  let w = 0;
  let h = 0;
  let gap = 16;
  // the lamp: where it is, where the pointer is, and how bright it is (0..1)
  const LAMP = 190;
  const lamp = { x: -999, y: -999, tx: -999, ty: -999, on: 0, target: 0, movedAt: 0 };

  function resize() {
    const dpr = Math.min(window.devicePixelRatio || 1, 2);
    w = window.innerWidth;
    h = window.innerHeight;
    gap = w < 640 ? 13 : 16;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    draw(performance.now());
  }

  function draw(now) {
    const t = now / 7000;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = "#6f9ef0";
    ctx.globalAlpha = 0.3;
    const maxR = gap * 0.19;
    // ease the lamp toward the pointer, and fade it after a second without movement
    if (now - lamp.movedAt > 1200) lamp.target = 0;
    lamp.x += (lamp.tx - lamp.x) * 0.18;
    lamp.y += (lamp.ty - lamp.y) * 0.18;
    lamp.on += (lamp.target - lamp.on) * 0.12;
    ctx.beginPath();
    for (let y = gap / 2; y < h; y += gap) {
      const ny = y / h;
      for (let x = gap / 2; x < w; x += gap) {
        const nx = x / w;
        // brighter toward the top right corner, never quite gone elsewhere
        const near = 0.3 + 0.7 * Math.max(0, 1 - Math.hypot(nx - 0.92, ny + 0.05) / 1.4);
        // four slow waves crossing each other, 0..1
        const wave =
          (Math.sin(nx * 6.0 + t * 1.3) +
            Math.sin(ny * 4.6 - t) +
            Math.sin((nx + ny) * 3.4 + t * 0.6) +
            Math.sin(Math.hypot(nx - 0.75, ny - 0.15) * 11 - t * 1.8) +
            4) /
          8;
        let r = maxR * near * (0.15 + 0.85 * wave * wave);
        if (lamp.on > 0.01) {
          const d = Math.hypot(x - lamp.x, y - lamp.y);
          if (d < LAMP) {
            const k = 1 - d / LAMP;
            r += maxR * 1.1 * k * k * lamp.on;
          }
        }
        if (r < 0.35) continue;
        ctx.moveTo(x + r, y);
        ctx.arc(x, y, r, 0, Math.PI * 2);
      }
    }
    ctx.fill();
  }

  let last = 0;
  let frame = 0;
  function loop(now) {
    frame = requestAnimationFrame(loop);
    if (now - last < 1000 / FPS) return;
    last = now;
    draw(now);
  }
  function play() {
    cancelAnimationFrame(frame);
    if (still.matches || document.hidden) return draw(performance.now());
    frame = requestAnimationFrame(loop);
  }

  window.addEventListener(
    "pointermove",
    (e) => {
      if (still.matches || e.pointerType === "touch") return;
      if (lamp.on < 0.02) {
        lamp.x = e.clientX;
        lamp.y = e.clientY;
      }
      lamp.tx = e.clientX;
      lamp.ty = e.clientY;
      lamp.target = 1;
      lamp.movedAt = performance.now();
    },
    { passive: true },
  );
  document.documentElement.addEventListener("pointerleave", () => (lamp.target = 0));
  window.addEventListener("resize", resize);
  document.addEventListener("visibilitychange", play);
  still.addEventListener?.("change", play);
  resize();
  play();
}
