/* ═══════════════════════════════════════
   PIXELART IMPRESSION — Shared Utilities
   Loaded on every page
   ═══════════════════════════════════════ */

/* ── Page-ready signal ──
   <html> gets .is-ready once the webfont is in (capped at 700ms), so the hero
   entrance never animates fallback type. */
(function () {
    const root = document.documentElement;
    let done = false;
    const ready = () => { if (!done) { done = true; requestAnimationFrame(() => root.classList.add('is-ready')); } };
    if (document.fonts && document.fonts.ready) document.fonts.ready.then(ready);
    setTimeout(ready, 700);
})();

/* ── Theme toggle ──
   Follows the system until the visitor picks; the choice is remembered on this device.
   The early <head> script applies it before first paint. */
(function () {
    const btn = document.getElementById('themeToggle');
    if (!btn) return;
    const root = document.documentElement;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const current = () => root.dataset.theme || (mq.matches ? 'dark' : 'light');
    const sync = () => {
        const next = current() === 'dark' ? 'light' : 'dark';
        btn.setAttribute('aria-label', `Switch to ${next} theme`);
        const meta = document.querySelector('meta[name="theme-color"]');
        if (meta) meta.setAttribute('content', current() === 'dark' ? '#0f0f0f' : '#f1f1ee');
    };
    btn.addEventListener('click', () => {
        const next = current() === 'dark' ? 'light' : 'dark';
        root.dataset.theme = next;
        try { localStorage.setItem('px-theme', next); } catch (e) {}
        sync();
    });
    mq.addEventListener('change', sync);
    sync();
})();

/* ── Mobile burger menu ── */
(function () {
    const burger = document.getElementById('burgerBtn');
    const mob    = document.getElementById('mobileMenu');
    if (!burger || !mob) return;

    function setOpen(open) {
        mob.classList.toggle('open', open);
        burger.classList.toggle('active', open);
        burger.setAttribute('aria-expanded', String(open));
        burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
        mob.setAttribute('aria-hidden', String(!open));
    }
    burger.addEventListener('click', e => {
        e.stopPropagation();
        setOpen(!mob.classList.contains('open'));
    });
    mob.querySelectorAll('a').forEach(a => a.addEventListener('click', () => setOpen(false)));
    document.addEventListener('click', e => {
        if (!burger.contains(e.target) && !mob.contains(e.target)) setOpen(false);
    });
    document.addEventListener('keydown', e => {
        if (e.key === 'Escape' && mob.classList.contains('open')) { setOpen(false); burger.focus(); }
    });
})();

/* ── Scroll-position states (header surface, back-to-top) ──
   Invisible sentinels at the top of the page instead of a scroll listener. */
(function () {
    function watch(offset, onChange) {
        const s = document.createElement('div');
        s.setAttribute('aria-hidden', 'true');
        s.style.cssText = `position:absolute;top:0;left:0;width:1px;height:${offset}px;pointer-events:none;visibility:hidden;`;
        document.body.prepend(s);
        new IntersectionObserver(([e]) => onChange(!e.isIntersecting)).observe(s);
    }
    const header = document.getElementById('site-header');
    if (header) watch(40, past => header.classList.toggle('scrolled', past));

    const btt = document.getElementById('btt');
    if (btt) {
        watch(600, past => btt.classList.toggle('btt-on', past));
        btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
    }
})();

window.PX = window.PX || {};
PX.reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

/* ── Scroll reveal ──
   PX.reveal(elements) lets pages that render content later (the gallery) join in. */
(function () {
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
    PX.reveal = els => els.forEach(el => obs.observe(el));
    PX.reveal(document.querySelectorAll('.reveal, .reveal-photo, .footer-mark'));
})();

/* ── Rotating photos ──
   PX.rotate(box, photos, { interval, delay, transform, kenBurns, onChange })
   box holds one <img> (the first photo, already in the markup). A second layer is added
   and the two crossfade. Pauses when off screen or when the tab is hidden. */
PX.rotate = function (box, photos, opts) {
    opts = opts || {};
    const first = box && box.querySelector('img');
    if (!first || photos.length < 2) return;
    const interval = opts.interval || 5000;
    const kenBurns = opts.kenBurns && !PX.reducedMotion;
    const fade = 1400;

    const back0 = document.createElement('img');
    back0.alt = '';
    back0.decoding = 'async';
    back0.setAttribute('aria-hidden', 'true');
    box.classList.add('rotator');
    if (kenBurns) {
        box.style.setProperty('--kb-dur', (interval + fade + 600) + 'ms');
        box.classList.add('kb');
    }
    first.classList.add('rot-img');
    back0.classList.add('rot-img');
    box.appendChild(back0);

    // Start the drift on the first photo without fading it in
    if (kenBurns) {
        first.style.opacity = '1';
        first.style.transition = 'none';
        void first.offsetWidth;
        first.style.transition = '';
        requestAnimationFrame(() => { first.classList.add('is-current'); first.style.opacity = ''; });
    } else {
        first.classList.add('is-current');
    }

    let front = first, back = back0, i = 0, timer = 0, onScreen = false, busy = false;

    function schedule(delay) {
        clearTimeout(timer);
        if (onScreen && !document.hidden) timer = setTimeout(step, delay);
    }
    function step() {
        if (busy) return;
        busy = true;
        i = (i + 1) % photos.length;
        back.src = PX.src(photos[i], opts.transform);
        const ready = back.decode ? back.decode() : Promise.resolve();
        ready.catch(() => {}).then(() => {
            const leaving = front;
            if (kenBurns) {
                // Freeze the outgoing photo mid-drift so it doesn't snap while fading
                leaving.style.transform = getComputedStyle(leaving).transform;
                leaving.style.transition = `opacity ${fade}ms var(--ease-in-out)`;
                setTimeout(() => { leaving.style.transform = ''; leaving.style.transition = ''; }, fade + 100);
            }
            back.classList.add('is-current');
            leaving.classList.remove('is-current');
            front = back; back = leaving;
            if (opts.onChange) opts.onChange(i, photos[i]);
            busy = false;
            schedule(interval);
        });
    }

    let started = false;
    new IntersectionObserver(([e]) => {
        onScreen = e.isIntersecting;
        if (!onScreen) { clearTimeout(timer); return; }
        schedule(started ? interval : (opts.delay || 0) + interval);
        started = true;
    }).observe(box);
    document.addEventListener('visibilitychange', () => {
        if (document.hidden) clearTimeout(timer); else schedule(interval);
    });
};

/* ── Count-up on the numbers in .count-up ("200+", "24h") when they scroll in ── */
(function () {
    const els = document.querySelectorAll('.count-up');
    if (!els.length || PX.reducedMotion) return;
    const ease = t => 1 - Math.pow(1 - t, 4);
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (!e.isIntersecting) return;
            obs.unobserve(e.target);
            const el = e.target;
            const m = el.textContent.match(/^(\d+)(.*)$/);
            if (!m) return;
            const end = Number(m[1]), suffix = m[2], dur = 1400, t0 = performance.now();
            (function tick(now) {
                const t = Math.min(1, (now - t0) / dur);
                el.textContent = Math.round(end * ease(t)) + suffix;
                if (t < 1) requestAnimationFrame(tick);
            })(t0);
        });
    }, { threshold: 0.6 });
    els.forEach(el => obs.observe(el));
})();

/* ── Footer year ── */
(function () {
    const el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
})();

/* ── WhatsApp message ── */
(function () {
    let message = "";

    if (
        window.location.pathname.includes("index") ||
        window.location.pathname.includes("gallery")
    ) {
        message = "Hi! Daniel, I came from your website and I would like to book a session";
    }

    if (window.location.pathname.includes("thank-you")) {
        message = "Hi! Daniel, I just booked a session from your website and would love to have a chat about the details";
    }

    const waLinks = document.querySelectorAll('a[href*="wa.me"]');

    waLinks.forEach(link => {

        if (!link.href.includes("text=")) {   // only modify if no message exists
            link.href = "https://wa.me/2349167486667?text=" + encodeURIComponent(message);
        }

    });

})();
