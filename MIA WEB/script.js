/* PINTAR - script.js (portal warga + fungsi admin)
   Data tiket disimpan di localStorage 'pintar_tickets_v4' sebagai objek { "PGD-12345": {...} }.
   Fungsi loadAdminData, updateStatus, previewImage, closeImageModal dipakai admin.html. */

/* Ikon memakai Phosphor (font ikon), jadi tidak perlu dirender ulang. Fungsi ini dipertahankan agar pemanggilnya tetap jalan. */
const refreshIcons = () => {};

const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));

/* ---------- Data ---------- */
const DEMO_NIK = '3171021405880004';
let ticketDatabase = JSON.parse(localStorage.getItem('pintar_tickets_v4')) || {
    "PGD-88210": { name: "Budi Santoso", nik: DEMO_NIK, type: "Pengaduan Infrastruktur", desc: "Lampu penerangan jalan mati total sejak dua minggu.", location: "Jl. Merdeka No. 10", imageData: null, status: "Sedang Diproses", officer: "Suku Dinas Perhubungan", createdAt: Date.now() - 4 * 864e5 },
    "PRZ-41507": { name: "Budi Santoso", nik: DEMO_NIK, type: "Perizinan & Surat Administrasi", desc: "Pengajuan surat keterangan domisili untuk keperluan bank.", location: "Kelurahan Contoh", imageData: null, status: "Selesai", officer: "Petugas PTSP Kelurahan", createdAt: Date.now() - 12 * 864e5 }
};
function saveDatabase() { localStorage.setItem('pintar_tickets_v4', JSON.stringify(ticketDatabase)); }

const SERVICES = [
    { prefix: 'PGD', title: 'Pengaduan Infrastruktur', type: 'Pengaduan Infrastruktur', officer: 'Tim Suku Dinas Bina Marga', icon: 'traffic-cone', tone: 'amber', eta: 'Tanggapan 3 hari', cta: 'Buat laporan',
      desc: 'Jalan rusak, lampu jalan padam, saluran tersumbat, atau fasilitas umum bermasalah.', needs: ['Lokasi kejadian', 'Foto kondisi'] },
    { prefix: 'PRZ', title: 'Perizinan & Surat', type: 'Perizinan & Surat Administrasi', officer: 'Petugas PTSP Kelurahan', icon: 'file-text', tone: 'blue', eta: '1–3 hari kerja', cta: 'Ajukan dokumen',
      desc: 'Surat keterangan domisili, izin usaha, atau dokumen kelurahan lainnya.', needs: ['KTP aktif', 'Keperluan jelas'] },
    { prefix: 'BNS', title: 'Verifikasi Bansos', type: 'Peninjauan Bantuan Sosial', officer: 'Tim Verifikasi Dinas Sosial', icon: 'shield-check', tone: 'green', eta: '3–5 hari kerja', cta: 'Ajukan peninjauan',
      desc: 'Peninjauan ulang status kepesertaan bantuan sosial daerah.', needs: ['NIK terdaftar', 'Alasan peninjauan'] }
];

/* ---------- Sesi ---------- */
/* login.html menyimpan namaUser/nikUser; versi lama memakai current_user_*. Keduanya dibaca. */
function getUser() {
    const s = sessionStorage;
    return { name: s.getItem('namaUser') || s.getItem('current_user_name') || '', nik: s.getItem('nikUser') || s.getItem('current_user_nik') || '' };
}
function logout() { sessionStorage.clear(); window.location.href = 'login.html'; }

function initCitizenSession() {
    const user = getUser();
    if (!user.name) { window.location.replace('login.html'); return; }
    $('userNameDisplay').innerText = user.name;
    $('userNikDisplay').innerText = user.nik ? 'NIK •••• ' + user.nik.slice(-4) : '';
    $('welcomeName').innerText = user.name.split(' ')[0];
    $('userAvatarText').innerText = user.name.charAt(0).toUpperCase();
    $('botGreeting').innerText = `Halo ${user.name.split(' ')[0]}! Saya asisten virtual PINTAR. Ada yang bisa saya bantu?`;
    $('chatQuick').innerHTML = ['Cara membuat laporan', 'Cek status tiket', 'Berapa lama prosesnya?', 'Syarat pengajuan']
        .map(q => `<button type="button" onclick="sendChatMessage('${q}')">${q}</button>`).join('');
    renderServices(); renderHome(); renderMyTickets();
    refreshIcons();
}

/* ---------- Helper tampilan ---------- */
const STAGES = ['Laporan diterima', 'Verifikasi petugas', 'Sedang diproses', 'Selesai'];
const stageOf = s => (s === 'Selesai' ? 4 : s === 'Sedang Diproses' ? 2 : 1);
const badgeClass = s => ({ 'Sedang Diproses': 'st-proses', 'Selesai': 'st-selesai', 'Ditolak': 'st-ditolak' }[s] || '');
const badge = s => `<span class="badge-status ${badgeClass(s)}">${esc(s)}</span>`;
const fmtDate = t => (t ? new Date(t).toLocaleDateString('id-ID', { day: 'numeric', month: 'long', year: 'numeric' }) : '');

function stepsHTML(status) {
    const at = stageOf(status), rejected = status === 'Ditolak';
    return '<div class="steps">' + STAGES.map((label, i) => {
        let cls = i < at ? 'done' : i === at ? 'current' : '';
        if (rejected && i === at) cls = 'rejected';
        return `<div class="step ${cls}"><span class="dot">${cls === 'done' ? '✓' : i + 1}</span>${rejected && i === at ? 'Ditolak' : label}</div>`;
    }).join('') + '</div>';
}

/* Tiket milik warga yang login, terbaru di atas */
function myTickets() {
    const nik = getUser().nik;
    return Object.entries(ticketDatabase).filter(([, t]) => t.nik === nik).reverse();
}
const ticketRow = ([code, t]) => `
    <button class="trow" onclick="openTicket('${code}')">
        <span class="trow-ic"><i class="ph ph-ticket"></i></span>
        <span class="trow-info"><span class="trow-code">${code}</span><span class="trow-desc">${esc(t.type)} · ${esc(t.desc)}</span></span>
        ${badge(t.status)}
    </button>`;
const emptyTickets = `<div class="empty-state"><div class="empty-ic"><i class="ph ph-ticket"></i></div><h3>Belum ada tiket</h3><p>Buat pengaduan pertama Anda dan pantau prosesnya di sini.</p><button class="btn btn-primary" onclick="switchView('layanan')">Buat pengaduan</button></div>`;

function serviceCard(s) {
    return `<article class="svc-card tone-${s.tone}">
        <div class="svc-ic"><i class="ph ph-${s.icon}"></i></div>
        <h3>${s.title}</h3><p>${s.desc}</p>
        <div class="chips"><span class="chip">${s.eta}</span>${s.needs.map(n => `<span class="chip">${n}</span>`).join('')}</div>
        <button class="btn btn-primary" onclick="openModal('${s.title}', '${s.prefix}')">${s.cta}</button></article>`;
}
function renderServices() {
    $('homeServices').innerHTML = $('serviceGrid').innerHTML = SERVICES.map(serviceCard).join('');
}

function renderHome() {
    const list = myTickets(), n = st => list.filter(([, t]) => t.status === st).length;
    $('statTotal').innerText = list.length;
    $('statProses').innerText = n('Sedang Diproses') + n('Baru Diterima');
    $('statSelesai').innerText = n('Selesai');
    renderNotice();
    $('homeTickets').innerHTML = list.length ? list.slice(0, 3).map(ticketRow).join('') : emptyTickets;
    if (list.length) {
        const [code, t] = list[0];
        $('recentTicket').innerHTML = `<div class="ticket-top"><div><small>Tiket terakhir Anda</small><strong>${code}</strong></div>${badge(t.status)}</div>
            <p class="ticket-title">${esc(t.desc)}</p>${stepsHTML(t.status)}
            <button class="btn btn-secondary" onclick="openTicket('${code}')">Lihat rincian</button>`;
    } else {
        $('recentTicket').innerHTML = `<div class="ticket-top"><div><small>Tiket terakhir Anda</small><strong>Belum ada</strong></div></div>
            <p class="ticket-title">Belum ada pengajuan aktif. Buat pengaduan baru melalui menu layanan.</p>
            <button class="btn btn-primary" onclick="switchView('layanan')">Mulai sekarang</button>`;
    }
    refreshIcons();
}
/* Banner di beranda: muncul saat petugas menyelesaikan/menolak tiket dan warga belum melihat hasilnya */
const getSeen = () => { try { return JSON.parse(localStorage.getItem('pintar_seen_v1')) || {}; } catch { return {}; } };
function markSeen(code, t) {
    if (!t.finishedAt) return;
    const seen = getSeen();
    if (seen[code] === t.finishedAt) return;
    seen[code] = t.finishedAt; localStorage.setItem('pintar_seen_v1', JSON.stringify(seen));
    renderNotice();
}
function renderNotice() {
    const box = $('notice');
    if (!box) return;
    const seen = getSeen();
    const fresh = myTickets().filter(([c, t]) => (t.status === 'Selesai' || t.status === 'Ditolak') && t.finishedAt && seen[c] !== t.finishedAt);
    box.hidden = !fresh.length;
    if (!fresh.length) return;
    const [code, t] = fresh[0], done = t.status === 'Selesai';
    box.className = 'notice ' + (done ? 'ok' : 'bad');
    box.innerHTML = `<i class="ph ph-${done ? 'check-circle' : 'warning-circle'}"></i>
        <div><strong>Tiket ${code} ${done ? 'telah selesai' : 'ditolak'}</strong><span>${fresh.length > 1 ? `Ada ${fresh.length - 1} pembaruan lain. ` : ''}Lihat catatan dari petugas.</span></div>
        <button class="btn" onclick="openTicket('${code}')">Lihat hasil</button>`;
    refreshIcons();
}
/* Blok hasil penanganan + riwayat pada rincian tiket */
function resultHTML(t) {
    if (!t.adminNote) return '';
    const bad = t.status === 'Ditolak';
    return `<div class="result-note ${bad ? 'bad' : 'ok'}"><strong>${bad ? 'Alasan penolakan' : 'Hasil penanganan'}</strong><p>${esc(t.adminNote)}</p>
        ${t.resultImage ? `<img class="photo" src="${t.resultImage}" alt="Foto hasil penanganan">` : ''}<small>${fmtDate(t.finishedAt)}</small></div>`;
}
function historyHTML(t) {
    if (!t.history || !t.history.length) return '';
    return '<h4 class="mini-title">Riwayat tiket</h4><ul class="hist">' + t.history.slice().reverse().map(h =>
        `<li><span>${esc(h.status)}</span><small>${new Date(h.at).toLocaleString('id-ID', { dateStyle: 'medium', timeStyle: 'short' })}</small></li>`).join('') + '</ul>';
}
function renderMyTickets() {
    const list = myTickets();
    $('myTickets').innerHTML = list.length ? list.map(ticketRow).join('') : '<p class="chip">Belum ada tiket.</p>';
    refreshIcons();
}

function toast(msg, error = false) {
    const el = document.createElement('div');
    el.className = 'toast' + (error ? ' error' : '');
    el.innerText = msg;
    let wrap = $('toastWrap');
    if (!wrap) { wrap = document.createElement('div'); wrap.id = 'toastWrap'; wrap.className = 'toast-wrap'; document.body.appendChild(wrap); }
    wrap.appendChild(el);
    setTimeout(() => el.remove(), 3800);
}

/* ---------- Navigasi ---------- */
function switchView(viewName) {
    document.querySelectorAll('.view-section').forEach(el => el.classList.remove('active'));
    document.querySelectorAll('.nav-link').forEach(el => el.classList.remove('active'));
    const target = $('view-' + viewName);
    if (target) target.classList.add('active');
    const nav = document.querySelector(`.nav-link[data-target="${viewName}"]`);
    if (nav) nav.classList.add('active');
    if (viewName === 'lacak') renderMyTickets();
    window.scrollTo({ top: 0, behavior: 'smooth' });
}

/* ---------- Formulir pengajuan ---------- */
function openModal(title, prefix) {
    const user = getUser();
    $('modalTitle').innerText = title;
    $('formPrefix').value = prefix;
    $('formName').value = user.name || 'Warga';
    $('formNik').value = user.nik;
    $('formModal').classList.add('active');
    $('formLocation').focus();
}
function closeModal() {
    $('formModal').classList.remove('active');
    $('publicServiceForm').reset();
    ['errLocation', 'errDesc', 'errFile'].forEach(id => ($(id).innerText = ''));
    updateDrop();
}
function updateDrop() {
    const f = $('formFile').files[0], img = $('dropPreview');
    $('errFile').innerText = '';
    if (!f) { img.hidden = true; $('dropText').innerText = 'Ketuk untuk memilih foto JPG/PNG, maksimal 4 MB'; return; }
    if (!/^image\/(png|jpeg)$/.test(f.type) || f.size > 4 * 1048576) {
        $('errFile').innerText = 'Gunakan foto JPG atau PNG maksimal 4 MB.'; $('formFile').value = ''; img.hidden = true; return;
    }
    $('dropText').innerText = f.name;
    img.src = URL.createObjectURL(f); img.hidden = false;
}
/* Perkecil foto agar muat di localStorage */
function compressImage(file) {
    return new Promise(resolve => {
        const img = new Image();
        img.onload = () => {
            const r = Math.min(1, 800 / Math.max(img.width, img.height)), c = document.createElement('canvas');
            c.width = Math.round(img.width * r); c.height = Math.round(img.height * r);
            c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);
            resolve(c.toDataURL('image/jpeg', 0.7));
        };
        img.onerror = () => resolve(null);
        img.src = URL.createObjectURL(file);
    });
}

async function handleFormSubmit(e) {
    e.preventDefault();
    const location = $('formLocation').value.trim(), desc = $('formDesc').value.trim();
    $('errLocation').innerText = location.length >= 5 ? '' : 'Isi lokasi minimal 5 karakter.';
    $('errDesc').innerText = desc.length >= 10 ? '' : 'Jelaskan laporan minimal 10 karakter.';
    $('formLocation').setAttribute('aria-invalid', location.length < 5);
    $('formDesc').setAttribute('aria-invalid', desc.length < 10);
    if (location.length < 5 || desc.length < 10 || $('errFile').innerText) return;

    const btn = $('submitBtn'); btn.disabled = true; btn.innerText = 'Mengirim...';
    const file = $('formFile').files[0];
    const imageData = file ? await compressImage(file) : null;
    const prefix = $('formPrefix').value, user = getUser();
    let code;
    do { code = `${prefix}-${Math.floor(10000 + Math.random() * 90000)}`; } while (ticketDatabase[code]);
    const ok = saveNewTicket(code, user.name, user.nik, prefix, desc, location, imageData);
    btn.disabled = false; btn.innerText = 'Kirim pengajuan';
    if (!ok) return;

    closeModal();
    toast(`Pengajuan terkirim. Nomor tiket: ${code}`);
    renderHome();
    switchView('lacak');
    $('ticketInput').value = code;
    trackTicket();
}

function saveNewTicket(code, name, nik, prefix, desc, location, imageData) {
    const svc = SERVICES.find(s => s.prefix === prefix) || SERVICES[0];
    ticketDatabase[code] = { name, nik, type: svc.type, desc, location, imageData, status: 'Baru Diterima', officer: svc.officer, createdAt: Date.now(), history: [{ status: 'Baru Diterima', at: Date.now() }] };
    try { saveDatabase(); return true; }
    catch { delete ticketDatabase[code]; toast('Penyimpanan penuh. Coba tanpa foto.', true); return false; }
}

/* ---------- Lacak tiket ---------- */
function openTicket(code) {
    switchView('lacak');
    $('ticketInput').value = code;
    trackTicket();
}
function trackTicket() {
    let input = $('ticketInput').value.trim().toUpperCase();
    if (input.startsWith('#')) input = input.substring(1);
    const err = $('trackError'), box = $('trackResult'), t = ticketDatabase[input];
    err.innerText = '';
    /* Hanya pemilik tiket (NIK sama) yang dapat melihat rinciannya */
    if (!t || t.nik !== getUser().nik) {
        box.hidden = true; $('trackEmpty').hidden = false;
        err.innerText = input ? 'Tiket tidak ditemukan pada akun Anda.' : 'Masukkan nomor tiket terlebih dahulu.';
        return;
    }
    $('trackEmpty').hidden = true; box.hidden = false;
    box.innerHTML = `
        <div class="result-head"><h3>${input}</h3>${badge(t.status)}</div>
        ${stepsHTML(t.status)}
        <dl class="kv"><dt>Kategori</dt><dd>${esc(t.type)}</dd>
            ${t.createdAt ? `<dt>Dikirim</dt><dd>${fmtDate(t.createdAt)}</dd>` : ''}
            <dt>Lokasi</dt><dd>${esc(t.location)}</dd><dt>Detail</dt><dd>${esc(t.desc)}</dd>
            ${t.imageData ? `<dt>Bukti foto</dt><dd><img class="photo" src="${t.imageData}" alt="Bukti foto laporan"></dd>` : ''}</dl>
        ${resultHTML(t)}
        <div class="officer"><i class="ph ph-user-check"></i><span>Ditangani oleh <strong>${esc(t.officer)}</strong></span></div>${historyHTML(t)}`;
    markSeen(input, t);
    refreshIcons();
}

/* ---------- Admin (dipakai admin.html) ---------- */
function initAdminSession() {
    if (sessionStorage.getItem('roleUser') !== 'petugas') { window.location.replace('login.html'); return; }
    if ($('adminDept')) $('adminDept').innerText = sessionStorage.getItem('deptOfficer') || 'Petugas';
    loadAdminData();
}
let adminFilter = 'all';
function setAdminFilter(f) {
    adminFilter = f;
    document.querySelectorAll('.adm-filter').forEach(b => b.classList.toggle('active', b.dataset.filter === f));
    loadAdminData();
}
function loadAdminData() {
    const tbody = $('adminTableBody');
    if (!tbody) return;
    const all = Object.entries(ticketDatabase).reverse();
    const n = s => all.filter(([, t]) => t.status === s).length;
    const set = (id, v) => { if ($(id)) $(id).innerText = v; };
    set('admNew', n('Baru Diterima')); set('admRun', n('Sedang Diproses')); set('admDone', n('Selesai')); set('admBad', n('Ditolak'));
    set('adminSummary', `${n('Baru Diterima')} baru, ${n('Sedang Diproses')} diproses, ${n('Selesai')} selesai, ${n('Ditolak')} ditolak`);
    const entries = adminFilter === 'all' ? all : all.filter(([, t]) => t.status === adminFilter);
    if (!entries.length) {
        tbody.innerHTML = `<tr><td colspan="6" class="adm-empty">${all.length ? 'Tidak ada tiket dengan status ini.' : 'Belum ada laporan masuk.'}</td></tr>`;
        return;
    }
    tbody.innerHTML = entries.map(([code, item]) => {
        const finished = item.status === 'Selesai' || item.status === 'Ditolak';
        const img = item.imageData
            ? `<img class="thumb" src="${item.imageData}" onclick="previewImage(this.src)" alt="Foto bukti ${code}" title="Klik untuk memperbesar">`
            : `<span class="adm-muted">Tanpa foto</span>`;
        const note = item.adminNote ? `<div class="adm-muted" style="margin-top:6px;">Catatan: ${esc(item.adminNote)}</div>` : '';
        return `<tr>
            <td data-label="Tiket"><span class="adm-code">${code}</span></td>
            <td data-label="Pelapor"><strong>${esc(item.name)}</strong><div class="adm-muted adm-mono">${esc(item.nik)}</div></td>
            <td data-label="Laporan"><strong>${esc(item.type)}</strong><div class="adm-desc">${esc(item.desc)}</div><span class="adm-loc"><i class="ph ph-map-pin"></i>${esc(item.location)}</span></td>
            <td data-label="Foto">${img}</td>
            <td data-label="Status">${badge(item.status)}${note}</td>
            <td data-label="Aksi"><div class="adm-btns">
                <button class="btn btn-secondary btn-sm" ${item.status !== 'Baru Diterima' ? 'disabled' : ''} onclick="updateStatus('${code}', 'Sedang Diproses')">Proses</button>
                <button class="btn btn-ok btn-sm" ${finished ? 'disabled' : ''} onclick="updateStatus('${code}', 'Selesai')">Selesai</button>
                <button class="btn btn-bad btn-sm" ${finished ? 'disabled' : ''} onclick="updateStatus('${code}', 'Ditolak')">Tolak</button>
            </div></td></tr>`;
    }).join('');
}
function previewImage(src) {
    $('modalPreviewImg').src = src;
    $('imagePreviewModal').classList.add('active');
}
function closeImageModal() { $('imagePreviewModal').classList.remove('active'); }

/* "Proses" langsung disimpan. "Selesai" dan "Tolak" meminta catatan yang akan dilihat warga. */
let pendingStatus = null;
function updateStatus(code, newStatus) {
    if (!ticketDatabase[code]) return;
    if (newStatus === 'Sedang Diproses') { applyStatus(code, newStatus, '', null); return; }
    pendingStatus = { code, status: newStatus };
    const done = newStatus === 'Selesai';
    $('statusModalTitle').innerText = (done ? 'Selesaikan tiket #' : 'Tolak tiket #') + code;
    $('statusNoteLabel').innerText = done ? 'Catatan penyelesaian (dilihat warga)' : 'Alasan penolakan (dilihat warga)';
    $('statusFileWrap').hidden = !done;
    $('statusNote').value = ''; $('statusFile').value = ''; $('statusError').innerText = '';
    $('statusModal').classList.add('active');
    $('statusNote').focus();
}
function closeStatusModal() { $('statusModal').classList.remove('active'); pendingStatus = null; }
async function confirmStatus(e) {
    e.preventDefault();
    const note = $('statusNote').value.trim(), file = $('statusFile').files[0];
    if (note.length < 5) { $('statusError').innerText = 'Tulis catatan minimal 5 karakter.'; return; }
    if (file && (!/^image\/(png|jpeg)$/.test(file.type) || file.size > 4 * 1048576)) { $('statusError').innerText = 'Foto harus JPG/PNG maksimal 4 MB.'; return; }
    const { code, status } = pendingStatus;
    const photo = file && status === 'Selesai' ? await compressImage(file) : null;
    if (applyStatus(code, status, note, photo)) closeStatusModal();
}
function applyStatus(code, status, note, resultImage) {
    const t = ticketDatabase[code], backup = JSON.stringify(t), now = Date.now();
    t.status = status;
    t.history = (t.history || []).concat({ status, at: now, note });
    const dept = sessionStorage.getItem('deptOfficer');
    if (dept) t.officer = dept;
    if (status === 'Selesai' || status === 'Ditolak') { t.adminNote = note; t.finishedAt = now; if (resultImage) t.resultImage = resultImage; }
    try { saveDatabase(); }
    catch { ticketDatabase[code] = JSON.parse(backup); toast('Penyimpanan penuh. Coba tanpa foto hasil.', true); return false; }
    toast(`Tiket ${code}: ${status}. Warga akan melihat pembaruan ini.`);
    loadAdminData();
    return true;
}

/* ---------- Bersihkan data (admin) ---------- */
/* Mode 'done' = hapus tiket Selesai/Ditolak saja. Mode 'all' = hapus semua dan wajib mengetik HAPUS. */
let clearMode = null;
const isFinished = t => t.status === 'Selesai' || t.status === 'Ditolak';
function openClearModal(mode) {
    const entries = Object.entries(ticketDatabase);
    const targets = mode === 'all' ? entries : entries.filter(([, t]) => isFinished(t));
    if (!targets.length) { toast('Tidak ada tiket yang bisa dihapus.', true); return; }
    clearMode = mode;
    const active = mode === 'all' && entries.some(([, t]) => !isFinished(t));
    $('clearTitle').innerText = mode === 'all' ? 'Hapus semua pengajuan' : 'Hapus pengajuan yang sudah selesai/ditolak';
    $('clearInfo').innerText = `${targets.length} tiket akan dihapus permanen${active ? ', termasuk tiket yang masih berjalan' : ''}. Warga tidak akan bisa melihatnya lagi.`;
    $('clearConfirmWrap').hidden = mode !== 'all';
    $('clearConfirm').value = ''; $('clearError').innerText = '';
    $('clearModal').classList.add('active');
}
function closeClearModal() { $('clearModal').classList.remove('active'); clearMode = null; }
function downloadBackup() {
    const blob = new Blob([JSON.stringify(ticketDatabase, null, 2)], { type: 'application/json' });
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `pintar-tiket-${new Date().toISOString().slice(0, 10)}.json`;
    a.click();
    URL.revokeObjectURL(a.href);
}
function confirmClear(e) {
    e.preventDefault();
    if (clearMode === 'all' && $('clearConfirm').value.trim().toUpperCase() !== 'HAPUS') { $('clearError').innerText = 'Ketik HAPUS untuk melanjutkan.'; return; }
    const backup = Object.assign({}, ticketDatabase);
    const keys = Object.keys(ticketDatabase).filter(c => clearMode === 'all' || isFinished(ticketDatabase[c]));
    keys.forEach(c => delete ticketDatabase[c]);
    try { saveDatabase(); }
    catch { ticketDatabase = backup; toast('Gagal menyimpan perubahan.', true); return; }
    if (clearMode === 'all') localStorage.removeItem('pintar_seen_v1');
    closeClearModal();
    toast(`${keys.length} tiket dihapus.`);
    loadAdminData();
}

/* ---------- Chatbot ---------- */
function toggleChat() { $('chatBox').classList.toggle('active'); }
function handleChatKey(e) { if (e.key === 'Enter') sendChatMessage(); }
const CHAT_FAQ = [
    [['syarat', 'dokumen'], 'Syarat pengajuan: NIK aktif, lokasi kejadian yang jelas, uraian laporan, dan foto pendukung bila ada.'],
    [['status', 'lacak', 'cek', 'tiket'], "Buka menu 'Lacak Tiket', lalu pilih tiket Anda atau masukkan nomornya."],
    [['lama', 'berapa', 'waktu'], 'Verifikasi biasanya 1–2 hari kerja. Penanganan menyesuaikan jenis laporan.'],
    [['buat', 'ajukan', 'lapor', 'cara'], "Buka menu 'Buat Pengaduan', pilih kategori, isi formulir, dan lampirkan foto bila ada."],
    [['foto', 'bukti'], 'Unggah foto JPG atau PNG maksimal 4 MB pada formulir pengajuan.']
];
function chatAdd(text, who) {
    const body = $('chatBody'), div = document.createElement('div');
    div.className = 'chat-msg ' + who; div.innerText = text;
    body.appendChild(div); body.scrollTop = body.scrollHeight;
}
function sendChatMessage(preset) {
    const input = $('chatInput'), text = (preset || input.value).trim();
    if (!text) return;
    chatAdd(text, 'user'); input.value = '';
    const lower = text.toLowerCase(), user = getUser();
    setTimeout(() => {
        if (lower.includes('nama') || lower.includes('siapa saya')) return chatAdd(`Nama Anda di sesi ini adalah ${user.name}.`, 'bot');
        const hit = CHAT_FAQ.find(([keys]) => keys.some(k => lower.includes(k)));
        chatAdd(hit ? hit[1] : "Maaf, saya belum paham. Coba pilih pertanyaan di atas atau gunakan menu 'Buat Pengaduan'.", 'bot');
    }, 450);
}


/* ---------- Sinkronisasi antar tab ---------- */
/* Event 'storage' aktif di tab lain saat data berubah, jadi halaman warga yang sedang terbuka ikut diperbarui. */
function onCitizenDataChanged(old) {
    const user = getUser();
    myTickets().forEach(([code, t]) => {
        if (old[code] && old[code].status !== t.status) toast(`Tiket ${code} kini: ${t.status}`);
    });
    renderHome(); renderMyTickets();
    const open = $('ticketInput').value.trim().toUpperCase();
    if (open && !$('trackResult').hidden) {
        if (ticketDatabase[open] && ticketDatabase[open].nik === user.nik) trackTicket();
        else { $('trackResult').hidden = true; $('trackEmpty').hidden = false; toast(`Tiket ${open} sudah dihapus oleh petugas.`, true); }
    }
}
window.addEventListener('storage', e => {
    if (e.key !== 'pintar_tickets_v4') return;
    const old = ticketDatabase;
    ticketDatabase = JSON.parse(e.newValue) || {};
    if ($('adminTableBody')) loadAdminData();
    else if ($('view-beranda')) onCitizenDataChanged(old);
});