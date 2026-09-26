/* ═══════════════════════════════════════
   PIXELART IMPRESSION — Photo catalog
   The one list every page reads from. Cloudinary photos live here;
   photos uploaded from the admin page are merged in at runtime.
   ═══════════════════════════════════════ */

window.PX = window.PX || {};

PX.CLOUD = 'https://res.cloudinary.com/dx3j36ymx/image/upload/';

PX.categories = [
    {
        id: "beauty",
        label: "Beauty",
        quote: "Glamour redefined in every frame: bold, unapologetic, timeless.",
        photos: [
            "v1773508412/b1_dtw8no.jpg",
            "v1773508415/b2_ub8xlr.jpg",
            "v1773508421/b3_an8uda.jpg",
            "v1773508425/b4_papulo.jpg",
            "v1773508428/b5_h706fv.jpg",
            "v1773508435/b6_hcfkxk.jpg",
            "v1773508439/b7_yvthwz.jpg",
            "v1773508439/b8_zwtx2o.jpg",
            "v1773508441/b9_ol5ib3.jpg",
            "v1773508443/b10_g6tn7j.jpg",
            "v1773508445/b11_fxqlwv.jpg",
            "v1773508447/b12_hdo8ip.jpg",
            "v1773508448/b13_gbykkm.jpg",
            "v1773508450/b14_ahedyn.jpg",
            "v1773508451/b15_pnyur7.jpg",
            "v1773508459/b16_ixbobs.jpg",
            "v1773508460/b17_gdirak.jpg",
            "v1773508465/b18_xwcmjo.jpg",
            "v1773508468/b19_wjtepw.jpg",
            "v1773508469/b20_rnozvd.jpg",
            "v1773508480/b21_hfmrlu.jpg",
            "v1773508481/b22_tyydzr.jpg",
            "v1773508482/b23_hshqq4.jpg"
        ]
    },
    {
        id: "birthday",
        label: "Birthdays",
        quote: "Framed in love, lit by joy, edited with grace.",
        photos: [
            "v1773508648/b1_jkbinn.jpg",
            "v1773508650/b2_rpsz0l.jpg",
            "v1773508653/b3_pchvpl.jpg",
            "v1773508655/b4_ckmhw5.jpg",
            "v1773508695/b5_wchapk.jpg",
            "v1773508699/b6_owxeyh.jpg"
        ]
    },
    {
        id: "bridals",
        label: "Bridals",
        quote: "Just a bride, her dress, and a camera capturing forever.",
        photos: [
            "v1773508850/b1_twqqoj.jpg",
            "v1773508852/b2_kozc97.jpg",
            "v1773508857/b3_wriuey.jpg",
            "v1773508867/b5_uf3vxp.jpg",
            "v1773508869/b6_tkgrtl.jpg",
            "v1773508876/b7_ot9qci.jpg",
            "v1773508876/b8_oa577f.jpg",
            "v1773508887/b9_cvxgxq.jpg",
            "v1773508885/b10_fausoc.jpg",
            "v1773508894/b11_saeat1.jpg",
            "v1773508893/b12_m7ifeb.jpg",
            "v1773508900/b13_hohnzp.jpg",
            "v1773508900/b14_kqyhjh.jpg",
            "v1773508908/b15_irih4p.jpg",
            "v1773508908/b16_mnrctg.jpg",
            "v1773508921/b17_tlmoqg.jpg",
            "v1773508923/b18_yq0zrm.jpg",
            "v1773508935/b19_ngzbdi.jpg",
            "v1773508932/b20_qbi1jm.jpg",
            "v1773508936/b21_cw4qur.jpg",
            "v1773508944/b22_mj1txb.jpg",
            "v1773508949/b24_au1rpo.jpg",
            "v1773508949/b25_xvvkba.jpg",
            "v1773508956/b26_nmxogb.jpg",
            "v1773508959/b27_hvac3p.jpg",
            "v1773508966/b28_r6lxzi.jpg",
            "v1773508969/b29_t5i952.jpg",
            "v1773508978/b30_brobyx.jpg",
            "v1773508978/b31_r8emny.jpg",
            "v1773508987/b32_pgseu9.jpg",
            "v1773508986/b33_ah6lgx.jpg",
            "v1773508994/b34_d4mdy4.jpg",
            "v1773508995/b35_lvukvm.jpg"
        ]
    },
    {
        id: "lifestyle",
        label: "Lifestyle",
        quote: "Candid moments, real vibes, and a little magic in between.",
        photos: [
            "v1773509004/l1_vigeji.jpg",
            "v1773509008/l2_lsdkxr.jpg",
            "v1773509010/l3_i7dbfs.jpg",
            "v1773509014/l4_gyuqvh.jpg",
            "v1773509020/l5_lllydo.jpg",
            "v1773509021/l6_h7uoxj.jpg",
            "v1773509028/l7_rpeshx.jpg",
            "v1773509028/l8_a9qjhe.jpg",
            "v1773509034/l9_rt9bbx.jpg",
            "v1773509035/l10_tyyti6.jpg",
            "v1773509040/l11_jk3odo.jpg"
        ]
    },
    {
        id: "men",
        label: "Men",
        quote: "Living the moment. Framed by the lens.",
        photos: [
            "v1773509044/m1_rucvkx.jpg",
            "v1773509048/m2_pvzu3a.jpg",
            "v1773509052/m3_hevfve.jpg",
            "v1773509056/m4_d1ldtd.jpg",
            "v1773509059/m5_bth7o1.jpg",
            "v1773509064/m6_pwsf4q.jpg",
            "v1773509065/m7_soa1vs.jpg",
            "v1773509073/m8_zneqsu.jpg",
            "v1773509217/m9_fmmwnu.jpg",
            "v1773509363/m10_dgczwl.jpg",
            "v1773509513/m11_iqiz5f.jpg",
            "v1773509660/m12_oaozpu.jpg",
            "v1773509662/m13_khmtlg.jpg",
            "v1773509805/m14_c6vpzw.jpg"
        ]
    },
    {
        id: "pregnancy",
        label: "Pregnancy",
        quote: "From a tiny heartbeat to a lifetime of love.",
        photos: [
            "v1773509864/p1_cpvilh.jpg",
            "v1773509866/p2_tztpeb.jpg",
            "v1773509868/p3_ggfaae.jpg",
            "v1773509875/p4_xrum4s.jpg",
            "v1773509878/p5_mwtxhl.jpg",
            "v1773509881/p6_v3jin1.jpg",
            "v1773509886/p7_tavwkn.jpg",
            "v1773509888/p8_ujfoak.jpg",
            "v1773509891/p9_glyunh.jpg"
        ]
    },
    {
        id: "wedding",
        label: "Wedding",
        quote: "Forever just found its favourite frame.",
        photos: [
            "v1773509896/w1_oddlfl.jpg",
            "v1773509901/w2_wfcppt.jpg",
            "v1773509903/w3_j4qlct.jpg",
            "v1773509909/w4_xrqqbi.jpg"
        ]
    }
];

/* A photo is either a Cloudinary path ("v123/name.jpg") or an absolute URL (an upload).
   Uploads are resized by Vercel's image optimizer to the width the transform asks for;
   the widths must match "images.sizes" in vercel.json. */
PX.UPLOAD_SIZES = [320, 720, 1000, 1400, 2000];
PX.src = function (photo, transform) {
    transform = transform || 'f_auto,q_auto,w_720';
    if (photo.startsWith(PX.CLOUD) || photo.startsWith('/')) return photo;   // already a finished URL
    if (/^https?:/.test(photo)) {
        const want = Number((transform.match(/w_(\d+)/) || [])[1]) || 1000;
        const w = PX.UPLOAD_SIZES.find(s => s >= want) || 2000;
        return '/_vercel/image?url=' + encodeURIComponent(photo) + '&w=' + w + '&q=80';
    }
    return PX.CLOUD + transform + '/' + photo;
};

/* Uploaded photos, grouped by category id. Resolves to {} when the API isn't there
   (opening the files locally, or before the site is deployed). */
PX.uploads = (function () {
    let pending = null;
    return function () {
        if (!pending) {
            pending = fetch('/api/photos', { headers: { Accept: 'application/json' } })
                .then(r => r.ok ? r.json() : { photos: [] })
                .catch(() => ({ photos: [] }))
                .then(data => {
                    const byCat = {};
                    (data.photos || []).forEach(p => { (byCat[p.category] = byCat[p.category] || []).push(p.url); });
                    return byCat;
                });
        }
        return pending;
    };
})();

/* Every category with its uploads first (newest work leads), then the catalog. */
PX.catalog = function () {
    return PX.uploads().then(up => PX.categories.map(c => Object.assign({}, c, {
        photos: (up[c.id] || []).concat(c.photos)
    })));
};

PX.shuffle = function (list) {
    const a = list.slice();
    for (let i = a.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [a[i], a[j]] = [a[j], a[i]];
    }
    return a;
};
