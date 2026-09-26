/* ═══════════════════════════════════════
   PIXELART IMPRESSION — Gallery
   Renders every category from photos.js (plus admin uploads), lays each one out
   as an editorial grid, and drives the filter strip and lightbox.
   ═══════════════════════════════════════ */

const main  = document.getElementById("galleryMain");
const track = document.querySelector(".cat-track");
let sections = [];
let catBtns = [];

/* ── Layout ──
   Each grid alternates a "feature" block (one photo at 2×2 plus the small tiles beside it)
   with a plain row, and features swap sides as you go down. Blocks always fill whole rows,
   so only the very last row of a category can be short. */
function columns() {
    return Number(getComputedStyle(main).getPropertyValue("--cols")) || 4;
}
function plan(n, cols) {
    const featureBlock = cols === 2 ? 1 : cols === 3 ? 3 : 5;   // photos in a feature block
    const sequence = cols === 2 ? ["F", "R", "R"] : ["F", "R"];
    const out = new Array(n).fill(null);
    let i = 0, b = 0, side = "start";
    while (i < n) {
        const kind = sequence[b++ % sequence.length];
        if (kind === "F" && n - i >= featureBlock) {
            out[i] = side;
            side = side === "start" ? "end" : "start";
            i += featureBlock;
        } else {
            i += cols;
        }
    }
    return out;
}
function relayout(grid, cols) {
    const tiles = grid.querySelectorAll(".tile");
    const p = plan(tiles.length, cols);
    tiles.forEach((t, i) => {
        const wasFeature = t.classList.contains("is-feature");
        t.classList.toggle("is-feature", !!p[i]);
        t.classList.toggle("is-end", p[i] === "end");
        t.style.setProperty("--i", i % cols);
        if (!!p[i] !== wasFeature) t.querySelector("img").src = p[i] ? t.dataset.feature : t.dataset.small;
    });
}

/* ── Render ── */
function tileHTML(photo, label, n, place, cols) {
    const feature = PX.src(photo, "f_auto,q_auto,c_fill,g_auto,w_1000,h_1250");
    const small   = PX.src(photo, "f_auto,q_auto,c_fill,g_auto,w_720,h_900");
    const full    = PX.src(photo, "f_auto,q_auto,w_2000");
    const alt = `${label}, photo ${n}`;
    const cls = place ? (place === "end" ? " is-feature is-end" : " is-feature") : "";
    return `<button class="tile reveal-photo${cls}" type="button" style="--i:${(n - 1) % cols}" data-full="${full}" data-small="${small}" data-feature="${feature}" aria-label="Open ${alt}">
        <img src="${place ? feature : small}" alt="${alt}" loading="lazy" decoding="async">
    </button>`;
}

let cols = 4;
function render(cats) {
    cols = columns();
    main.innerHTML = cats.filter(c => c.photos.length).map(c => `
    <section class="gal-section" id="${c.id}-section" aria-labelledby="${c.id}-title">
        <div class="gal-section-header reveal">
            <h2 class="display" id="${c.id}-title">${c.label}</h2>
            <span class="gal-count">${c.photos.length} photos</span>
            <p>“${c.quote}”</p>
        </div>
        <div class="gal-grid">
            ${(pl => c.photos.map((p, i) => tileHTML(p, c.label, i + 1, pl[i], cols)).join(""))(plan(c.photos.length, cols))}
        </div>
    </section>`).join("");

    sections = Array.from(main.querySelectorAll(".gal-section"));
    const total = cats.reduce((n, c) => n + c.photos.length, 0);
    track.querySelector('[data-target="all"]').insertAdjacentHTML("beforeend", ` <span class="cat-count">${total}</span>`);
    track.insertAdjacentHTML("beforeend", cats.filter(c => c.photos.length).map(c =>
        `<button class="cat-btn" data-target="${c.id}-section" aria-pressed="false">${c.label} <span class="cat-count">${c.photos.length}</span></button>`
    ).join(""));
    catBtns = Array.from(track.querySelectorAll(".cat-btn"));

    main.querySelectorAll(".tile img").forEach(img => {
        if (img.complete && img.naturalWidth) img.classList.add("is-loaded");
        else img.addEventListener("load", () => img.classList.add("is-loaded"), { once: true });
    });
    PX.reveal(main.querySelectorAll(".reveal, .reveal-photo"));
    catBtns.forEach(btn => btn.addEventListener("click", () => filter(btn, true)));

    // Arriving from the home page's work list (gallery.html#bridals-section)
    const fromHash = location.hash && catBtns.find(b => "#" + b.dataset.target === location.hash);
    if (fromHash) filter(fromHash, true);
}

let resizeTimer = 0;
window.addEventListener("resize", () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(() => {
        const now = columns();
        if (now === cols) return;
        cols = now;
        main.querySelectorAll(".gal-grid").forEach(grid => relayout(grid, cols));
    }, 150);
});

/* ── Category filter ── */
function filter(btn, scroll) {
    catBtns.forEach(b => { b.classList.toggle("active", b === btn); b.setAttribute("aria-pressed", String(b === btn)); });
    track.scrollTo({ left: btn.offsetLeft - (track.clientWidth - btn.offsetWidth) / 2, behavior: "smooth" });
    const target = btn.dataset.target;
    sections.forEach(s => {
        const show = target === "all" || s.id === target;
        s.hidden = !show;
        if (show) { s.classList.remove("is-entering"); void s.offsetWidth; s.classList.add("is-entering"); }
    });
    if (!scroll) return;
    // Sections carry scroll-margin-top for the sticky header + strip
    const anchor = target === "all" ? sections[0] : document.getElementById(target);
    if (target !== "all" || anchor.getBoundingClientRect().top < 0) {
        anchor.scrollIntoView({ behavior: "smooth", block: "start" });
    }
}

/* ── Lightbox ── */
const lightbox = document.getElementById("lightbox");
const lbImg    = document.getElementById("lbImg");
const lbClose  = document.getElementById("lbClose");
const lbPrev   = document.getElementById("lbPrev");
const lbNext   = document.getElementById("lbNext");
const lbCount  = document.getElementById("lbCounter");

let visible = [];
let cur = 0;
let opener = null;

function visibleTiles() {
    return sections.filter(s => !s.hidden).flatMap(s => Array.from(s.querySelectorAll(".tile")));
}
function show(i) {
    cur = (i + visible.length) % visible.length;
    const tile = visible[cur];
    // Show the cached grid rendition at once, then upgrade to the large one when it arrives
    lbImg.src = tile.querySelector("img").currentSrc || tile.dataset.small;
    const idx = cur;
    const hi = new Image();
    hi.onload = () => { if (cur === idx) lbImg.src = tile.dataset.full; };
    hi.src = tile.dataset.full;
    lbImg.alt = tile.querySelector("img").alt;
    lbCount.textContent = `${cur + 1} / ${visible.length}`;
}
function openLB(tile) {
    visible = visibleTiles();
    opener = tile;
    show(visible.indexOf(tile));
    lightbox.classList.add("open");
    document.body.style.overflow = "hidden";
    lbClose.focus();
}
function closeLB() {
    lightbox.classList.remove("open");
    document.body.style.overflow = "";
    if (opener) opener.focus({ preventScroll: true });
}
function goTo(i) {
    lbImg.classList.add("is-swapping");
    setTimeout(() => {
        show(i);
        const done = () => lbImg.classList.remove("is-swapping");
        if (lbImg.complete) done(); else lbImg.addEventListener("load", done, { once: true });
    }, 140);
}

main.addEventListener("click", e => {
    const tile = e.target.closest(".tile");
    if (tile) openLB(tile);
});
lbClose.addEventListener("click", closeLB);
lbPrev.addEventListener("click",  () => goTo(cur - 1));
lbNext.addEventListener("click",  () => goTo(cur + 1));
lightbox.querySelector(".lb-backdrop").addEventListener("click", closeLB);
document.addEventListener("keydown", e => {
    if (!lightbox.classList.contains("open")) return;
    if (e.key === "ArrowLeft")  goTo(cur - 1);
    if (e.key === "ArrowRight") goTo(cur + 1);
    if (e.key === "Escape")     closeLB();
});

/* ── Touch swipe for lightbox ── */
let touchStartX = 0;
lightbox.addEventListener("touchstart", e => { touchStartX = e.touches[0].clientX; }, { passive: true });
lightbox.addEventListener("touchend",   e => {
    const dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 50) goTo(dx < 0 ? cur + 1 : cur - 1);
}, { passive: true });

PX.catalog().then(render);
