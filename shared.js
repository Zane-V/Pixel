/* ═══════════════════════════════════════
   PIXELART IMPRESSION — Shared Utilities
   Loaded on every page
   ═══════════════════════════════════════ */

/* ── Preloader (mobile-safe) ── */
(function () {
    let hidden = false;
    function hidePreloader() {
        if (hidden) return;
        hidden = true;
        const pre = document.getElementById('preloader');
        if (!pre) return;
        pre.classList.add('pre-out');
        setTimeout(() => { if (pre.parentNode) pre.remove(); }, 700);
    }
    window.addEventListener('load', () => setTimeout(hidePreloader, 1800));
    document.addEventListener('DOMContentLoaded', () => setTimeout(hidePreloader, 4000));
    setTimeout(hidePreloader, 6000);
})();

/* ── Cursor trail (desktop only) ── */
(function () {
    // Skip on touch devices — no mouse to track
    if (window.matchMedia('(hover: none)').matches) {
        const spot = document.querySelector('.cursor-spot');
        if (spot) spot.style.display = 'none';
        document.body.style.cursor = 'auto';
        return;
    }
    const spot = document.querySelector('.cursor-spot');
    if (!spot) return;
    let hue = 0, tc = 0;
    document.addEventListener('mousemove', e => {
        hue = (hue + 4) % 360;
        const c = `hsl(${hue},100%,60%)`;
        spot.style.background = c;
        spot.style.boxShadow  = `0 0 20px ${c}`;
        spot.style.transform  = `translate(${e.clientX}px,${e.clientY}px)`;
        if (tc < 18) {
            tc++;
            const t = document.createElement('div');
            t.className = 'trail';
            t.style.cssText = `left:${e.clientX}px;top:${e.clientY}px;background:${c};box-shadow:0 0 15px ${c}`;
            document.body.appendChild(t);
            setTimeout(() => { t.remove(); tc--; }, 600);
        }
    });
})();

/* ── Mobile burger menu ── */
(function () {
    const burger = document.getElementById('burgerBtn');
    const mob    = document.getElementById('mobileMenu');
    if (!burger || !mob) return;

    function closeMenu() {
        mob.classList.remove('open');
        burger.classList.remove('active');
        burger.setAttribute('aria-expanded', 'false');
        mob.setAttribute('aria-hidden', 'true');
    }
    burger.addEventListener('click', e => {
        e.stopPropagation();
        const open = mob.classList.toggle('open');
        burger.classList.toggle('active', open);
        burger.setAttribute('aria-expanded', open);
        mob.setAttribute('aria-hidden', !open);
    });
    mob.querySelectorAll('a').forEach(a => a.addEventListener('click', closeMenu));
    document.addEventListener('click', e => {
        if (!burger.contains(e.target) && !mob.contains(e.target)) closeMenu();
    });
    document.addEventListener('keydown', e => { if (e.key === 'Escape') closeMenu(); });
})();

/* ── Header scroll effect ── */
(function () {
    const header = document.getElementById('site-header');
    if (!header) return;
    window.addEventListener('scroll', () => {
        header.classList.toggle('scrolled', window.scrollY > 60);
    }, { passive: true });
})();

/* ── Back to top ── */
(function () {
    const btt = document.getElementById('btt');
    if (!btt) return;
    window.addEventListener('scroll', () => btt.classList.toggle('btt-on', window.scrollY > 500), { passive: true });
    btt.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));
})();

/* ── Footer year ── */
(function () {
    const el = document.getElementById('year');
    if (el) el.textContent = new Date().getFullYear();
})();

//   -- Whatsapp Message --
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
