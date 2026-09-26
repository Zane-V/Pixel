/* ═══════════════════════════════════════
   PIXELART IMPRESSION — Shared Utilities
   Loaded on every page
   ═══════════════════════════════════════ */

/* ── Preloader + page-ready signal ──
   Shown once per session, lifted as soon as the page has loaded (min ~0.9s so the
   logo animation can finish, max 2.5s so a slow image never holds the page hostage).
   <html> gets .is-ready when content can animate in. */
(function () {
    const root = document.documentElement;
    const pre = document.getElementById('preloader');
    let done = false;

    function ready() {
        if (done) return;
        done = true;
        root.classList.add('is-ready');
        try { sessionStorage.setItem('px-seen', '1'); } catch (e) {}
        if (!pre || getComputedStyle(pre).display === 'none') return;
        pre.classList.add('pre-out');
        setTimeout(() => pre.remove(), 500);
    }

    if (!pre || root.classList.contains('px-seen')) {
        requestAnimationFrame(ready);
        return;
    }
    const start = performance.now();
    const onLoad = () => setTimeout(ready, Math.max(0, 900 - (performance.now() - start)));
    if (document.readyState === 'complete') onLoad();
    else window.addEventListener('load', onLoad, { once: true });
    setTimeout(ready, 2500);
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
