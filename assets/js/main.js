/**
 * thatzane.de — motion layer (anime.js v4, vendored).
 * The page is fully readable without this file; everything here is enhancement.
 * When <html> has no `.motion` class (reduced motion / failsafe) only the
 * non-animated bits run: day counter and active nav state.
 */
import {
    animate,
    createTimeline,
    createAnimatable,
    stagger,
    onScroll,
    splitText,
    scrambleText,
    utils,
} from '../vendor/anime.esm.min.js';

const root = document.documentElement;
const $ = (sel, ctx = document) => ctx.querySelector(sel);
const $$ = (sel, ctx = document) => [...ctx.querySelectorAll(sel)];

const EASE_OUT = 'out(4)';
const REVAMP_START = new Date(2026, 8, 19); // 19.09.2026, local time

/* ------------------------------------------------------------------ */
/* Static enhancements (always run)                                   */
/* ------------------------------------------------------------------ */

function revampDay() {
    const now = new Date();
    const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
    return Math.max(1, Math.round((today - REVAMP_START) / 86400000) + 1);
}

const day = revampDay();
$$('[data-day-count]').forEach((el) => {
    el.textContent = String(day);
    if (el.hasAttribute('data-count')) el.dataset.count = String(day);
});

function trackActiveSection() {
    const links = new Map($$('.nav-links a').map((a) => [a.getAttribute('href').slice(1), a]));
    const io = new IntersectionObserver((entries) => {
        entries.forEach((entry) => {
            const link = links.get(entry.target.id);
            if (link && entry.isIntersecting) {
                links.forEach((l) => l.classList.remove('is-active'));
                link.classList.add('is-active');
            }
        });
    }, { rootMargin: '-45% 0px -50% 0px' });
    links.forEach((_, id) => { const s = document.getElementById(id); if (s) io.observe(s); });
}

function trackScroll() {
    const nav = $('.nav');
    const bar = $('.progress span');
    let lastY = window.scrollY;
    let ticking = false;

    const update = () => {
        const y = window.scrollY;
        const max = document.documentElement.scrollHeight - window.innerHeight;
        bar.style.transform = `scaleX(${max > 0 ? y / max : 0})`;
        // Hide the nav while reading downwards, bring it back on any upward scroll.
        nav.classList.toggle('is-hidden', y > lastY && y > 240);
        lastY = y;
        ticking = false;
    };
    window.addEventListener('scroll', () => {
        if (!ticking) { requestAnimationFrame(update); ticking = true; }
    }, { passive: true });
    update();
}

trackActiveSection();
trackScroll();

/* ------------------------------------------------------------------ */
/* Motion                                                             */
/* ------------------------------------------------------------------ */

window.__tzReady = true;

if (root.classList.contains('motion')) {
    // Webfonts change glyph widths; split text only once they are in.
    (document.fonts ? document.fonts.ready : Promise.resolve()).then(start);
}

function start() {
    const playIntro = root.classList.contains('intro');
    const heroDelay = playIntro ? introSequence() : 0;
    heroSequence(heroDelay);
    sectionHeadings();
    reveals();
    counters();
    timelineProgress();
    parallax();
    magnetic();
}

/** Full-screen counter on first visit of the session, then wipe away. Returns ms until done. */
function introSequence() {
    const screen = $('.intro-screen');
    const count = $('.intro-count');
    const word = $('.intro-word');
    const counter = { v: 0 };

    try { sessionStorage.setItem('tz-intro', '1'); } catch (e) { /* storage blocked */ }

    createTimeline()
        .add(word, { innerHTML: scrambleText({ chars: 'uppercase', duration: 700 }) }, 0)
        .add(counter, {
            v: 100,
            duration: 1000,
            ease: 'inOut(3)',
            modifier: utils.round(0),
            onUpdate: () => { count.textContent = String(Math.round(counter.v)).padStart(3, '0'); },
        }, 0)
        .add(screen, {
            clipPath: ['inset(0% 0% 0% 0%)', 'inset(0% 0% 100% 0%)'],
            duration: 750,
            ease: 'inOut(4)',
            onComplete: () => root.classList.remove('intro'),
        }, 1100);

    return 1350;
}

function heroSequence(delay) {
    const title = $('[data-hero-title]');
    const { chars } = splitText(title, { chars: true });
    title.style.visibility = 'visible';

    const tl = createTimeline({ delay, defaults: { ease: EASE_OUT } });

    tl.add('.hero-grid > span', {
        scaleY: [0, 1],
        duration: 1400,
        ease: 'inOut(3)',
        delay: stagger(70, { from: 'center' }),
    }, 0)
    .add(chars, {
        y: ['0.6em', '0em'],
        opacity: [0, 1],
        rotate: [6, 0],
        duration: 1100,
        delay: stagger(22),
    }, 150)
    .add('[data-hero-meta] > div', {
        opacity: [0, 1],
        y: [12, 0],
        duration: 800,
        delay: stagger(80),
    }, 500)
    .add('[data-scramble]', {
        innerHTML: scrambleText({ chars: 'a-z0-9', duration: 900 }),
    }, 550)
    .add('[data-hero-fade]', {
        opacity: [0, 1],
        y: [20, 0],
        duration: 1000,
        delay: stagger(120),
    }, 800)
    .add('.cross', {
        opacity: [0, 0.55],
        scale: [0, 1],
        rotate: [90, 0],
        duration: 700,
        delay: stagger(60, { from: 'random' }),
    }, 900);

    // Once in place, the crosshairs breathe slowly at random offsets.
    tl.call(() => {
        animate('.cross', {
            opacity: [0.55, 0.15],
            duration: 2600,
            delay: stagger(400, { from: 'random' }),
            loop: true,
            alternate: true,
            ease: 'inOut(2)',
        });
    });
}

/** Section headings rise word by word as they enter. */
function sectionHeadings() {
    $$('[data-split]').forEach((el) => {
        const { words } = splitText(el, { words: { wrap: 'clip' } });
        el.style.visibility = 'visible';
        utils.set(words, { y: '110%' });
        animate(words, {
            y: ['110%', '0%'],
            duration: 1000,
            ease: EASE_OUT,
            delay: stagger(60),
            autoplay: onScroll({ target: el, enter: 'end-=12% start', repeat: false, sync: 'play' }),
        });
    });
}

/** Fade-up reveal for blocks; groups stagger their children. */
function reveals() {
    const grouped = new Set();
    $$('[data-reveal-group]').forEach((group) => {
        const items = $$('[data-reveal]', group);
        items.forEach((i) => grouped.add(i));
        animate(items, {
            opacity: [0, 1],
            y: [24, 0],
            duration: 900,
            ease: EASE_OUT,
            delay: stagger(70),
            autoplay: onScroll({ target: group, enter: 'end-=10% start', repeat: false, sync: 'play' }),
        });
    });
    $$('[data-reveal]').filter((el) => !grouped.has(el)).forEach((el) => {
        animate(el, {
            opacity: [0, 1],
            y: [24, 0],
            duration: 900,
            ease: EASE_OUT,
            autoplay: onScroll({ target: el, enter: 'end-=8% start', repeat: false, sync: 'play' }),
        });
    });
}

function counters() {
    $$('[data-count]').forEach((el) => {
        const to = Number(el.dataset.count);
        const from = Number(el.dataset.countFrom ?? 0);
        const state = { v: from };
        el.textContent = String(from);
        animate(state, {
            v: to,
            duration: 1600,
            ease: 'out(3)',
            onUpdate: () => { el.textContent = String(Math.round(state.v)); },
            autoplay: onScroll({ target: el, enter: 'end-=10% start', repeat: false, sync: 'play' }),
        });
    });
}

/** The red line on the timeline fills as you scroll through it. */
function timelineProgress() {
    const wrap = $('[data-timeline]');
    if (!wrap) return;
    animate('.timeline-fill', {
        scaleY: [0, 1],
        ease: 'linear',
        autoplay: onScroll({
            target: wrap,
            enter: 'center start',
            leave: 'center end',
            sync: 0.25,
        }),
    });
}

/** Giant outline section numbers drift against the scroll. */
function parallax() {
    $$('[data-parallax]').forEach((el) => {
        animate(el, {
            y: ['-30%', '40%'],
            ease: 'linear',
            autoplay: onScroll({
                target: el.closest('.section'),
                enter: 'end start',
                leave: 'start end',
                sync: true,
            }),
        });
    });
}

/** Buttons and the contact link lean toward the pointer. Pointer devices only. */
function magnetic() {
    if (!window.matchMedia('(hover: hover) and (pointer: fine)').matches) return;
    $$('[data-magnetic]').forEach((el) => {
        const pull = el.classList.contains('contact-mail') ? 0.18 : 0.3;
        const a = createAnimatable(el, { x: 500, y: 500, ease: 'out(3)' });
        el.addEventListener('pointermove', (e) => {
            const r = el.getBoundingClientRect();
            a.x((e.clientX - (r.left + r.width / 2)) * pull);
            a.y((e.clientY - (r.top + r.height / 2)) * pull);
        });
        el.addEventListener('pointerleave', () => {
            a.x(0, 900, 'out(elastic(1, .4))');
            a.y(0, 900, 'out(elastic(1, .4))');
        });
    });
}
