/* ═══════════════════════════════════════
   PIXELART IMPRESSION — Studio (admin)
   Sign in, pick a category, drop photos, upload. The server checks the session
   on every upload and delete; hiding this page is not the protection.
   ═══════════════════════════════════════ */

const $ = id => document.getElementById(id);
const loginView = $("loginView"), dashView = $("dashView");
const MAX_EDGE = 2400;
const MAX_BYTES = 4_300_000;

function showView(admin) {
    loginView.hidden = admin;
    dashView.hidden = !admin;
    $("signOut").hidden = !admin;
    $("viewSite").hidden = !admin;
    if (admin) loadLibrary();
    else $("password").focus();
}

async function api(path, options) {
    const res = await fetch(path, Object.assign({ credentials: "same-origin" }, options));
    const data = await res.json().catch(() => ({}));
    if (res.status === 401 && path !== "/api/login") showView(false);
    if (!res.ok) throw new Error(data.error || "Something went wrong. Please try again.");
    return data;
}

/* ── Sign in / out ── */
$("loginForm").addEventListener("submit", async e => {
    e.preventDefault();
    const btn = e.target.querySelector("button");
    const status = $("loginStatus");
    status.textContent = "";
    btn.disabled = true;
    try {
        await api("/api/login", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ password: $("password").value }),
        });
        $("password").value = "";
        showView(true);
    } catch (err) {
        status.textContent = err.message;
        $("password").select();
    } finally {
        btn.disabled = false;
    }
});
$("signOut").addEventListener("click", async () => {
    await api("/api/login", { method: "DELETE" }).catch(() => {});
    showView(false);
});

/* ── Categories ── */
$("catPills").innerHTML = PX.categories.map((c, i) => `
    <label class="cat-pill"><input type="radio" name="category" value="${c.id}"${i === 0 ? " checked" : ""}><span>${c.label}</span></label>`).join("");
const category = () => document.querySelector('input[name="category"]:checked').value;
const categoryLabel = id => (PX.categories.find(c => c.id === id) || {}).label || id;
$("catPills").addEventListener("change", syncButton);

/* ── Picking files ── */
let queue = [];   // { file, url, el, state }
const queueEl = $("queue");

function addFiles(files) {
    Array.from(files).filter(f => /^image\//.test(f.type)).forEach(file => {
        const item = { file, url: URL.createObjectURL(file), state: "ready" };
        const li = document.createElement("li");
        li.className = "q-item";
        li.style.setProperty("--i", queue.length % 8);
        li.innerHTML = `<img src="${item.url}" alt="">
            <button class="q-remove" type="button" aria-label="Remove ${file.name}"><svg class="icon" aria-hidden="true"><use href="img/icons.svg#i-x"/></svg></button>
            <div class="q-bar"><span></span></div>
            <div class="q-meta"><span class="q-name"></span><span class="q-state">Ready</span></div>`;
        li.querySelector(".q-name").textContent = file.name;
        li.querySelector(".q-remove").addEventListener("click", () => {
            queue = queue.filter(q => q !== item);
            URL.revokeObjectURL(item.url);
            li.remove();
            syncButton();
        });
        item.el = li;
        queue.push(item);
        queueEl.appendChild(li);
    });
    $("uploadStatus").textContent = "";
    syncButton();
}
function syncButton() {
    const n = queue.filter(q => q.state === "ready" || q.state === "error").length;
    $("uploadBtn").disabled = n === 0;
    $("uploadBtn").textContent = n ? `Upload ${n} photo${n > 1 ? "s" : ""} to ${categoryLabel(category())}` : "Upload";
}

$("fileInput").addEventListener("change", e => { addFiles(e.target.files); e.target.value = ""; });
const drop = $("drop");
["dragenter", "dragover"].forEach(t => drop.addEventListener(t, e => { e.preventDefault(); drop.classList.add("is-over"); }));
["dragleave", "drop"].forEach(t => drop.addEventListener(t, () => drop.classList.remove("is-over")));
drop.addEventListener("drop", e => { e.preventDefault(); addFiles(e.dataTransfer.files); });

/* ── Resize in the browser so every upload fits the server's size limit ── */
async function prepare(file) {
    const bitmap = await createImageBitmap(file, { imageOrientation: "from-image" });
    const scale = Math.min(1, MAX_EDGE / Math.max(bitmap.width, bitmap.height));
    if (scale === 1 && file.size <= MAX_BYTES && /jpeg|webp/.test(file.type)) { bitmap.close(); return file; }
    const canvas = document.createElement("canvas");
    canvas.width = Math.round(bitmap.width * scale);
    canvas.height = Math.round(bitmap.height * scale);
    canvas.getContext("2d").drawImage(bitmap, 0, 0, canvas.width, canvas.height);
    bitmap.close();
    for (const q of [0.9, 0.82, 0.72]) {
        const blob = await new Promise(r => canvas.toBlob(r, "image/jpeg", q));
        if (blob && blob.size <= MAX_BYTES) return blob;
    }
    throw new Error("Too large");
}

function send(body, cat, name, onProgress) {
    return new Promise((resolve, reject) => {
        const xhr = new XMLHttpRequest();
        xhr.open("POST", "/api/photos");
        xhr.setRequestHeader("Content-Type", body.type || "image/jpeg");
        xhr.setRequestHeader("X-Category", cat);
        xhr.setRequestHeader("X-Filename", name);
        xhr.upload.onprogress = e => { if (e.lengthComputable) onProgress(e.loaded / e.total); };
        xhr.onload = () => {
            let data = {};
            try { data = JSON.parse(xhr.responseText); } catch (e) {}
            if (xhr.status === 401) showView(false);
            if (xhr.status >= 200 && xhr.status < 300) resolve(data);
            else reject(new Error(data.error || "Upload failed"));
        };
        xhr.onerror = () => reject(new Error("Network error"));
        xhr.send(body);
    });
}

$("uploadBtn").addEventListener("click", async () => {
    const cat = category();
    const todo = queue.filter(q => q.state === "ready" || q.state === "error");
    const status = $("uploadStatus");
    status.textContent = "";
    status.classList.remove("is-ok");
    $("uploadBtn").disabled = true;
    let ok = 0;
    for (const item of todo) {
        const li = item.el, stateEl = li.querySelector(".q-state"), bar = li.querySelector(".q-bar span");
        li.classList.remove("is-error");
        li.classList.add("is-uploading");
        li.querySelector(".q-remove").hidden = true;
        item.state = "uploading";
        stateEl.textContent = "Preparing";
        try {
            const body = await prepare(item.file);
            stateEl.textContent = "Uploading";
            await send(body, cat, item.file.name, p => bar.style.setProperty("--p", p));
            item.state = "done";
            ok++;
            li.classList.add("is-done");
            stateEl.textContent = "Added";
        } catch (err) {
            item.state = "error";
            li.classList.add("is-error");
            li.querySelector(".q-remove").hidden = false;
            stateEl.textContent = err.message === "Too large" ? "Too large" : "Failed";
            status.textContent = err.message;
            if (loginView.hidden === false) return;   // session ran out; the sign-in form is showing
        } finally {
            li.classList.remove("is-uploading");
        }
    }
    if (ok) {
        status.classList.add("is-ok");
        status.textContent = `${ok} photo${ok > 1 ? "s" : ""} added to ${categoryLabel(cat)}. They're live on the gallery within a minute.`;
        // Clear finished items after a moment so the queue is ready for the next batch
        setTimeout(() => {
            queue.filter(q => q.state === "done").forEach(q => { URL.revokeObjectURL(q.url); q.el.remove(); });
            queue = queue.filter(q => q.state !== "done");
            syncButton();
        }, 1600);
        loadLibrary();
    }
    syncButton();
});

/* ── Library of uploads, with delete ── */
async function loadLibrary() {
    const lib = $("library");
    try {
        const { photos } = await api("/api/photos?fresh=1");
        $("libCount").textContent = photos.length ? `${photos.length} photo${photos.length > 1 ? "s" : ""}` : "";
        if (!photos.length) { lib.innerHTML = `<p class="lib-empty">Nothing uploaded yet. Photos you add appear here.</p>`; return; }
        lib.innerHTML = PX.categories.map(c => {
            const mine = photos.filter(p => p.category === c.id);
            if (!mine.length) return "";
            return `<div class="lib-group"><h3>${c.label} · ${mine.length}</h3><div class="lib-grid">${mine.map(p => `
                <figure class="lib-item" data-url="${p.url}">
                    <img src="${PX.src(p.url, "w_320")}" alt="" loading="lazy">
                    <button class="lib-del" type="button">Delete</button>
                </figure>`).join("")}</div></div>`;
        }).join("");
    } catch (err) {
        lib.innerHTML = `<p class="lib-empty">Couldn't load your uploads. ${err.message}</p>`;
    }
}

// Delete asks twice: the first tap arms the button, the second within 3s deletes
$("library").addEventListener("click", async e => {
    const btn = e.target.closest(".lib-del");
    if (!btn) return;
    const item = btn.closest(".lib-item");
    if (!btn.classList.contains("is-armed")) {
        btn.classList.add("is-armed");
        btn.textContent = "Tap again to delete";
        setTimeout(() => { btn.classList.remove("is-armed"); btn.textContent = "Delete"; }, 3000);
        return;
    }
    btn.disabled = true;
    btn.textContent = "Deleting…";
    try {
        await api("/api/photos", {
            method: "DELETE",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ url: item.dataset.url }),
        });
        item.classList.add("is-removing");
        setTimeout(loadLibrary, 260);
    } catch (err) {
        btn.disabled = false;
        btn.textContent = "Delete";
        $("uploadStatus").textContent = err.message;
    }
});

/* ── Start: signed in already? ── */
api("/api/login").then(d => showView(!!d.admin)).catch(() => {
    showView(false);
    $("loginStatus").textContent = "The studio only works on the live site (it needs the server). Open it from your Vercel URL.";
});
