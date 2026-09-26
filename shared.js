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

/* ── Scroll reveal ── */
(function () {
    const els = document.querySelectorAll('.reveal');
    if (!els.length) return;
    const obs = new IntersectionObserver(entries => {
        entries.forEach(e => {
            if (e.isIntersecting) { e.target.classList.add('visible'); obs.unobserve(e.target); }
        });
    }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
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
