const PINTAR_API_BASE_URL = (() => {
    const hostname = window.location.hostname;
    const isLocal = hostname === 'localhost' || hostname === '127.0.0.1';
    return isLocal
        ? 'http://127.0.0.1:5000'
        : 'https://YOUR-BACKEND-NAME.onrender.com';
})();

const refreshIcons = () => {};
const $ = id => document.getElementById(id);
const esc = s => String(s ?? '').replace(/[&<>"']/g, c => ({
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;'
}[c]));

const DEMO_NIK = '3171021405880004';

let ticketDatabase = JSON.parse(localStorage.getItem('pintar_tickets_v4')) || {
    "PGD-88210": {
        name: "Budi Santoso",
        nik: DEMO_NIK,
        type: "Pengaduan Infrastruktur",
        facilityName: "Lampu Penerangan Jalan Umum",
        damageType: "Lampu Jalan Padam",
        desc: "Lampu penerangan jalan mati total sejak dua minggu.",
        location: "Jl. Merdeka No. 10",
        geo: { lat: -6.175392, lng: 106.827153 },
        imageData: null,
        status: "Sedang Diproses",
        officer: "Suku Dinas Perhubungan",
        createdAt: Date.now() - 4 * 864e5,
        history: [
            { status: "Baru Diterima", at: Date.now() - 4 * 864e5 },
            { status: "Sedang Diproses", at: Date.now() - 2 * 864e5 }
        ]
    },
    "PRZ-41507": {
        name: "Budi Santoso",
        nik: DEMO_NIK,
        type: "Perizinan & Surat Administrasi",
        docType: "Surat Keterangan Domisili",
        desc: "Pengajuan surat keterangan domisili untuk keperluan bank.",
        location: "Kelurahan Gambir",
        imageData: null,
        status: "Selesai",
        officer: "Petugas PTSP Kelurahan",
        adminNote: "Surat domisili selesai dicetak dan dapat diambil di loket PTSP.",
        finishedAt: Date.now() - 12 * 864e5,
        createdAt: Date.now() - 14 * 864e5,
        history: [
            { status: "Baru Diterima", at: Date.now() - 14 * 864e5 },
            { status: "Selesai", at: Date.now() - 12 * 864e5 }
        ],
        feedback: {
            rating: 5,
            tags: ["Respon Cepat", "Petugas Ramah", "Hasil Bersih & Rapi"],
            comment: "Pelayanan sangat cepat dan surat domisili langsung selesai dalam 1 hari kerja.",
            submittedAt: Date.now() - 11 * 864e5
        }
    }
};

function saveDatabase() {
    if ($('view-beranda') || $('adminTableBody')) return;

    localStorage.setItem('pintar_tickets_v4', JSON.stringify(ticketDatabase));
}

const SEED_NEWS = [
    {
        id: "news-001",
        title: "Perbaikan Fasilitas WC UNTAR 1 FIKOM Telah Selesai",
        category: "Fasilitas Umum",
        desc: "Perbaikan fasilitas WC UNTAR 1 FIKOM telah selesai dilaksanakan oleh tim sarana dan prasarana. Fasilitas kini sudah bersih, saluran air lancar, dan dapat digunakan kembali secara optimal oleh masyarakat dan civitas akademika.",
        ticketRef: "PGD-88210",
        author: "Suku Dinas Bina Marga & Sarpras",
        publishedAt: Date.now() - 2 * 864e5,
        imgBefore: "",
        imgAfter: ""
    },
    {
        id: "news-002",
        title: "Penyaluran dan Pemutakhiran Data Bansos Tahap Akhir Berjalan Lancar",
        category: "Bantuan Sosial",
        desc: "Dinas Sosial telah menyelesaikan verifikasi lapangan untuk penerima manfaat bansos sembako dan BLT daerah. Seluruh data ganda telah diperbaiki untuk memastikan bantuan sampai ke warga yang benar-benar membutuhkan.",
        ticketRef: "",
        author: "Dinas Sosial",
        publishedAt: Date.now() - 5 * 864e5,
        imgBefore: "",
        imgAfter: ""
    },
    {
        id: "news-003",
        title: "Pembersihan Rutin dan Peremajaan Trotoar Sudirman Selesai",
        category: "Pengumuman",
        desc: "Pekerjaan penataan paving block trotoar dan perbaikan ubin pemandu disabilitas di sepanjang jalur utama telah rampung. Warga diimbau untuk turut menjaga kebersihan sarana umum.",
        ticketRef: "",
        author: "Petugas Pemeliharaan Prasarana",
        publishedAt: Date.now() - 8 * 864e5,
        imgBefore: "",
        imgAfter: ""
    }
];

function loadNewsList() {
    try {
        const stored = localStorage.getItem('pintar_news_v1');
        return stored ? JSON.parse(stored) : SEED_NEWS;
    } catch {
        return SEED_NEWS;
    }
}

let newsDatabase = loadNewsList();

function saveNewsDatabase() {
    localStorage.setItem('pintar_news_v1', JSON.stringify(newsDatabase));

    if (typeof pushNewsToCloud === 'function') {
        pushNewsToCloud();
    }
}

const SERVICES = [
    {
        prefix: 'PGD',
        title: 'Pengaduan Fasilitas Umum',
        type: 'Pengaduan Fasilitas Umum',
        officer: 'Tim Suku Dinas Bina Marga',
        icon: 'traffic-cone',
        tone: 'amber',
        eta: 'Tanggapan 3 hari',
        cta: 'Buat laporan',
        desc: 'Jalan rusak, lampu jalan padam, saluran tersumbat, atau fasilitas umum bermasalah.',
        needs: ['Lokasi di peta', 'Foto bukti']
    },
    {
        prefix: 'PRZ',
        title: 'Perizinan & Surat',
        type: 'Perizinan & Surat Administrasi',
        officer: 'Petugas PTSP Kelurahan',
        icon: 'file-text',
        tone: 'blue',
        eta: '1–3 hari kerja',
        cta: 'Ajukan dokumen',
        desc: 'Surat keterangan domisili, izin usaha, atau dokumen kelurahan lainnya.',
        needs: ['KTP aktif', 'Keperluan jelas']
    },
    {
        prefix: 'BNS',
        title: 'Verifikasi Bansos',
        type: 'Peninjauan Bantuan Sosial',
        officer: 'Tim Verifikasi Dinas Sosial',
        icon: 'shield-check',
        tone: 'green',
        eta: '3–5 hari kerja',
        cta: 'Ajukan peninjauan',
        desc: 'Peninjauan ulang status kepesertaan bantuan sosial daerah.',
        needs: ['NIK terdaftar', 'Alasan peninjauan']
    }
];

let currentCitizenProfile = null;
let adminProfile = null;
let adminTicketsChannel = null;
let adminDataLoading = false;

function getUser() {
    const s = sessionStorage;

    return {
        name: s.getItem('namaUser') || s.getItem('current_user_name') || '',
        nik: s.getItem('nikUser') || s.getItem('current_user_nik') || ''
    };
}

async function getSupabaseCitizenProfile() {
    const sb = window.supabase;

    if (!sb) {
        throw new Error('Supabase belum siap. Muat ulang halaman lalu coba lagi.');
    }

    const { data: authData, error: authError } = await sb.auth.getUser();

    if (authError || !authData.user) {
        window.location.replace('index.html#masuk');
        throw new Error('Sesi login tidak ditemukan. Silakan masuk kembali.');
    }

    const { data: profile, error: profileError } = await sb
        .from('profiles')
        .select('id, full_name, nik, role')
        .eq('id', authData.user.id)
        .single();

    if (profileError) {
        throw new Error(`Profil akun gagal dibaca: ${profileError.message}`);
    }

    if (profile.role !== 'citizen') {
        throw new Error('Akun ini bukan akun warga.');
    }

    currentCitizenProfile = {
        id: profile.id,
        name: profile.full_name || 'Warga',
        nik: profile.nik || '',
        role: profile.role
    };

    sessionStorage.setItem('namaUser', currentCitizenProfile.name);
    sessionStorage.setItem('nikUser', currentCitizenProfile.nik);
    sessionStorage.setItem('roleUser', 'warga');

    return currentCitizenProfile;
}

function dateToMillis(value) {
    if (!value) return null;
    const parsed = new Date(value).getTime();
    return Number.isFinite(parsed) ? parsed : null;
}

async function loadCitizenTickets() {
    if (!currentCitizenProfile) {
        throw new Error('Profil warga belum dimuat.');
    }

    const sb = window.supabase;
    const { data: rows, error } = await sb
        .from('tickets')
        .select('*')
        .eq('user_id', currentCitizenProfile.id)
        .order('created_at', { ascending: false });

    if (error) {
        throw new Error(`Data tiket gagal dimuat: ${error.message}`);
    }

    const ticketIds = (rows || []).map(row => row.id);
    let historyRows = [];
    let feedbackRows = [];

    if (ticketIds.length) {
        const [historyResult, feedbackResult] = await Promise.all([
            sb.from('ticket_history')
                .select('ticket_id, new_status, note, created_at')
                .in('ticket_id', ticketIds)
                .order('created_at', { ascending: true }),
            sb.from('feedback')
                .select('ticket_id, rating, tags, comment, submitted_at')
                .in('ticket_id', ticketIds)
        ]);

        if (!historyResult.error) historyRows = historyResult.data || [];
        if (!feedbackResult.error) feedbackRows = feedbackResult.data || [];
    }

    const historyByTicket = new Map();
    historyRows.forEach(item => {
        if (!historyByTicket.has(item.ticket_id)) historyByTicket.set(item.ticket_id, []);
        historyByTicket.get(item.ticket_id).push({
            status: item.new_status,
            at: dateToMillis(item.created_at),
            note: item.note || ''
        });
    });

    const feedbackByTicket = new Map(feedbackRows.map(item => [item.ticket_id, {
        rating: item.rating,
        tags: item.tags || [],
        comment: item.comment || '',
        submittedAt: dateToMillis(item.submitted_at)
    }]));

    const nextDatabase = {};

    for (const row of (rows || [])) {
        let imageData = null;
        let resultImage = null;

        if (row.image_path) {
            const { data: signedImage } = await sb.storage
                .from('ticket-evidence')
                .createSignedUrl(row.image_path, 3600);
            imageData = signedImage?.signedUrl || null;
        }

        if (row.result_image_path) {
            const { data: signedResult, error: signedError } = await sb.storage
                .from('ticket-results')
                .createSignedUrl(row.result_image_path, 3600);

            if (signedError) {
                console.error('Gagal mengambil foto hasil penanganan:', signedError);
            } else {
                resultImage = signedResult?.signedUrl || null;
            }
        }

        nextDatabase[row.ticket_code] = {
            id: row.id,
            userId: row.user_id,
            name: row.applicant_name,
            nik: currentCitizenProfile.nik,
            type: row.service_type,
            desc: row.description,
            location: row.location,
            geo: row.latitude != null && row.longitude != null
                ? { lat: Number(row.latitude), lng: Number(row.longitude) }
                : null,
            facilityName: row.facility_name,
            damageType: row.damage_type,
            familyHead: row.family_head,
            bansosProgram: row.bansos_program,
            bansosIssue: row.bansos_issue,
            docType: row.document_type,
            imagePath: row.image_path,
            imageData,
            resultImagePath: row.result_image_path,
            resultImage,
            status: row.status,
            officer: row.officer_department || 'Petugas PINTAR',
            adminNote: row.admin_note,
            cancelReason: row.cancel_reason,
            cancelledAt: dateToMillis(row.cancelled_at),
            finishedAt: dateToMillis(row.finished_at),
            eta: row.eta,
            createdAt: dateToMillis(row.created_at),
            history: historyByTicket.get(row.id) || [],
            feedback: feedbackByTicket.get(row.id) || null
        };
    }

    ticketDatabase = nextDatabase;
}

let citizenTicketsChannel = null;

function subscribeToCitizenTickets() {
    if (!window.supabase || !currentCitizenProfile) return;

    if (citizenTicketsChannel) {
        window.supabase.removeChannel(citizenTicketsChannel);
    }

    citizenTicketsChannel = window.supabase
        .channel(`citizen-tickets-${currentCitizenProfile.id}`)
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'tickets',
            filter: `user_id=eq.${currentCitizenProfile.id}`
        }, async payload => {
            const code = payload.new?.ticket_code || payload.old?.ticket_code;
            const oldStatus = code && ticketDatabase[code]
                ? ticketDatabase[code].status
                : null;

            try {
                await loadCitizenTickets();
                renderHome();
                renderMyTickets();

                if (code && oldStatus && ticketDatabase[code] && oldStatus !== ticketDatabase[code].status) {
                    toast(`Tiket ${code} kini: ${ticketDatabase[code].status}`);
                }

                if ($('ticketInput') && $('ticketInput').value.trim().toUpperCase() === code && !$('trackResult').hidden) {
                    trackTicket();
                }
            } catch (err) {
                console.warn('Pembaruan tiket realtime gagal dimuat:', err);
            }
        })
        .subscribe();
}

async function logout() {
    try {
        if (window.supabase) {
            await window.supabase.auth.signOut();
        }
    } catch (err) {
        console.error('Gagal mengakhiri sesi Supabase:', err);
    }

    sessionStorage.clear();
    window.location.href = 'index.html#masuk';
}

async function initCitizenSession() {
    let user;

    try {
        user = await getSupabaseCitizenProfile();
        await loadCitizenTickets();
        subscribeToCitizenTickets();
    } catch (err) {
        console.error('Inisialisasi portal warga gagal:', err);
        if (!String(err.message || '').includes('Sesi login tidak ditemukan')) {
            toast(err.message || 'Gagal memuat data warga.', true);
        }
        return;
    }

    if ($('userNameDisplay')) {
        $('userNameDisplay').innerText = user.name;
    }

    if ($('userNikDisplay')) {
        $('userNikDisplay').innerText = user.nik
            ? 'NIK •••• ' + user.nik.slice(-4)
            : '';
    }

    if ($('welcomeName')) {
        $('welcomeName').innerText = user.name.split(' ')[0];
    }

    if ($('userAvatarText')) {
        $('userAvatarText').innerText = user.name.charAt(0).toUpperCase();
    }

    if ($('botGreeting')) {
        $('botGreeting').innerText = `Halo ${user.name.split(' ')[0]}! Saya asisten cerdas PINTAR. Ada yang bisa saya bantu terkait layanan publik?`;
    }

    if ($('chatQuick')) {
        $('chatQuick').innerHTML = [
            'Cara membuat laporan',
            'Cek status tiket',
            'Cara batalkan laporan',
            'Fitur peta & kamera',
            'Berapa lama prosesnya?',
            'Syarat pengajuan'
        ].map(q => `<button type="button" onclick="sendChatMessage('${q}')">${q}</button>`).join('');
    }

    renderServices();
    renderHome();
    renderMyTickets();
    renderNewsCards();
    refreshIcons();
}

const STAGES = [
    'Laporan diterima',
    'Verifikasi petugas',
    'Sedang diproses',
    'Selesai'
];

const stageOf = s => (
    s === 'Selesai' ? 4 :
    s === 'Sedang Diproses' ? 2 : 1
);

const badgeClass = s => ({
    'Sedang Diproses': 'st-proses',
    'Selesai': 'st-selesai',
    'Ditolak': 'st-ditolak',
    'Dibatalkan': 'st-dibatalkan'
}[s] || '');

const badge = s => `<span class="badge-status ${badgeClass(s)}">${esc(s)}</span>`;

const fmtDate = t => (
    t
        ? new Date(t).toLocaleDateString('id-ID', {
            day: 'numeric',
            month: 'long',
            year: 'numeric'
        })
        : ''
);

function stepsHTML(status) {
    if (status === 'Dibatalkan') {
        return '<div class="steps"><div class="step rejected" style="width:100%"><span class="dot">✕</span>Laporan Dibatalkan oleh Pemohon</div></div>';
    }

    const at = stageOf(status);
    const rejected = status === 'Ditolak';

    return '<div class="steps">' + STAGES.map((label, i) => {
        let cls = i < at ? 'done' : i === at ? 'current' : '';

        if (rejected && i === at) {
            cls = 'rejected';
        }

        return `<div class="step ${cls}"><span class="dot">${cls === 'done' ? '✓' : i + 1}</span>${rejected && i === at ? 'Ditolak' : label}</div>`;
    }).join('') + '</div>';
}

function myTickets() {
    const userId = currentCitizenProfile?.id;
    const nik = getUser().nik;

    return Object.entries(ticketDatabase)
        .filter(([, t]) => userId ? t.userId === userId : t.nik === nik)
        .sort(([, a], [, b]) => (b.createdAt || 0) - (a.createdAt || 0));
}

const kOf = code => 'k-' + String(code).slice(0, 3).toUpperCase();

const ticketRow = ([code, t]) => `
    <button class="trow ${kOf(code)}" onclick="openTicket('${code}')">
        <span class="trow-info">
            <span class="trow-code">${code}</span>
            <span class="trow-desc">${esc(t.type)} · ${esc(t.desc)}</span>
        </span>
        ${badge(t.status)}
    </button>`;

const emptyTickets = `
    <div class="empty-state">
        <div class="empty-ic"><i class="ph ph-ticket"></i></div>
        <h3>Belum ada tiket</h3>
        <p>Buat pengaduan pertamamu dan pantau prosesnya di sini.</p>
        <button class="btn btn-primary" onclick="switchView('layanan')">Buat pengaduan</button>
    </div>`;

function serviceCard(s) {
    const eta = s.eta.replace(/^Tanggapan\s*/, '');

    return `<article class="tk k-${s.prefix}">
        <div class="tk-stub">
            <span class="tk-label">Nomor tiket</span>
            <span class="tk-code">${s.prefix}-<i aria-hidden="true">●●●●●</i></span>
        </div>
        <div class="tk-perf" aria-hidden="true"></div>
        <div class="tk-body">
            <h3>${esc(s.title)}</h3>
            <p>${esc(s.desc)}</p>
            <dl class="tk-meta">
                <div><dt>Tanggapan</dt><dd>${esc(eta)}</dd></div>
                <div><dt>Siapkan</dt><dd>${esc(s.needs.join(', '))}</dd></div>
            </dl>
            <button class="btn btn-primary" onclick="openModal('${s.title}', '${s.prefix}')">${esc(s.cta)}</button>
        </div>
    </article>`;
}

function launchRow(s) {
    return `<button class="launch k-${s.prefix}" onclick="openModal('${s.title}', '${s.prefix}')">
        <span class="launch-code">${s.prefix}</span>
        <span class="launch-info">
            <b>${esc(s.title)}</b>
            <small>${esc(s.eta)}</small>
        </span>
        <span class="launch-go" aria-hidden="true">→</span>
    </button>`;
}

function renderServices() {
    if ($('serviceGrid')) {
        $('serviceGrid').innerHTML = SERVICES.map(serviceCard).join('');
    }

    if ($('homeServices')) {
        $('homeServices').innerHTML = SERVICES.map(launchRow).join('');
    }
}

function renderHome() {
    const list = myTickets();
    const n = st => list.filter(([, t]) => t.status === st).length;
    const running = n('Sedang Diproses') + n('Baru Diterima');

    if ($('homeSummary')) {
        $('homeSummary').innerText = list.length
            ? `${list.length} tiket, ${running} dalam proses, ${n('Selesai')} selesai`
            : 'Belum ada tiket.';
    }

    renderNotice();

    if ($('homeTickets')) {
        $('homeTickets').innerHTML = list.length
            ? list.slice(0, 4).map(ticketRow).join('')
            : emptyTickets;
    }

    if (!list.length) {
        if ($('recentTicket')) {
            $('recentTicket').innerHTML = '';
        }
        return;
    }

    const [code, t] = list.find(([, x]) => !isFinished(x)) || list[0];

    if ($('recentTicket')) {
        $('recentTicket').innerHTML = `<div class="tkw ${kOf(code)}">
            <div class="tkw-stub">
                <span class="tkw-label">${isFinished(t) ? 'Tiket terakhir' : 'Tiket aktif'}</span>
                <span class="tkw-code">${code}</span>
                <span class="tkw-date">${fmtDate(t.createdAt)}</span>
            </div>
            <div class="tkw-perf" aria-hidden="true"></div>
            <div class="tkw-body">
                <div class="tkw-top">
                    <span class="tkw-type">${esc(t.type)}</span>
                    ${badge(t.status)}
                </div>
                <p class="tkw-desc">${esc(t.desc)}</p>
                ${stepsHTML(t.status)}
                <div style="display:flex; gap:8px; align-items:center; flex-wrap:wrap; margin-top:8px;">
                    <button class="btn btn-secondary" onclick="openTicket('${code}')">Lihat rincian</button>
                    ${t.status === 'Baru Diterima' ? `<button class="btn btn-cancel-ticket" style="margin-top:0;" onclick="openCancelModal('${code}')"><i class="ph ph-x-circle"></i> Batalkan</button>` : ''}
                </div>
            </div>
        </div>`;
    }
}

const getSeen = () => {
    try {
        return JSON.parse(localStorage.getItem('pintar_seen_v1')) || {};
    } catch {
        return {};
    }
};

function markSeen(code, t) {
    if (!t.finishedAt) {
        return;
    }

    const seen = getSeen();

    if (seen[code] === t.finishedAt) {
        return;
    }

    seen[code] = t.finishedAt;

    localStorage.setItem('pintar_seen_v1', JSON.stringify(seen));
    renderNotice();
}

function renderNotice() {
    const box = $('notice');

    if (!box) {
        return;
    }

    const seen = getSeen();

    const fresh = myTickets().filter(([c, t]) => (
        (t.status === 'Selesai' || t.status === 'Ditolak') &&
        t.finishedAt &&
        seen[c] !== t.finishedAt
    ));

    box.hidden = !fresh.length;

    if (!fresh.length) {
        return;
    }

    const [code, t] = fresh[0];
    const done = t.status === 'Selesai';

    box.className = 'notice ' + (done ? 'ok' : 'bad');

    box.innerHTML = `<i class="ph ph-${done ? 'check-circle' : 'warning-circle'}"></i>
        <div>
            <strong>Tiket ${code} ${done ? 'telah selesai' : 'ditolak'}</strong>
            <span>${fresh.length > 1 ? `Ada ${fresh.length - 1} pembaruan lain. ` : ''}Lihat catatan dari petugas.</span>
        </div>
        <button class="btn" onclick="openTicket('${code}')">Lihat hasil</button>`;

    refreshIcons();
}

function resultHTML(t) {
    if (t.status === 'Dibatalkan') {
        return `<div class="result-note bad">
            <strong>Laporan Dibatalkan</strong>
            <p>${esc(t.cancelReason || 'Laporan dibatalkan oleh pemohon sebelum diverifikasi petugas.')}</p>
            <small>${fmtDate(t.cancelledAt || t.createdAt)}</small>
        </div>`;
    }

    if (!t.adminNote) {
        return '';
    }

    const bad = t.status === 'Ditolak';

    return `<div class="result-note ${bad ? 'bad' : 'ok'}">
        <strong>${bad ? 'Alasan penolakan' : 'Hasil penanganan'}</strong>
        <p>${esc(t.adminNote)}</p>
        ${t.resultImage ? `<img class="photo" src="${t.resultImage}" alt="Foto hasil penanganan">` : ''}
        <small>${fmtDate(t.finishedAt)}</small>
    </div>`;
}

function historyHTML(t) {
    if (!t.history || !t.history.length) {
        return '';
    }

    return '<h4 class="mini-title">Riwayat tiket</h4><ul class="hist">' +
        t.history.slice().reverse().map(h =>
            `<li>
                <span>${esc(h.status)}</span>
                <small>${new Date(h.at).toLocaleString('id-ID', {
                    dateStyle: 'medium',
                    timeStyle: 'short'
                })}</small>
            </li>`
        ).join('') +
        '</ul>';
}

function renderMyTickets() {
    const list = myTickets();

    if ($('myTickets')) {
        $('myTickets').innerHTML = list.length
            ? list.map(ticketRow).join('')
            : '<p class="chip">Belum ada tiket.</p>';
    }

    refreshIcons();
}

function toast(msg, error = false) {
    const el = document.createElement('div');

    el.className = 'toast' + (error ? ' error' : '');
    el.innerText = msg;

    let wrap = $('toastWrap');

    if (!wrap) {
        wrap = document.createElement('div');
        wrap.id = 'toastWrap';
        wrap.className = 'toast-wrap';
        document.body.appendChild(wrap);
    }

    wrap.appendChild(el);
    setTimeout(() => el.remove(), 3800);
}

function switchView(viewName) {
    document.querySelectorAll('.view-section').forEach(el => {
        el.classList.remove('active');
    });

    document.querySelectorAll('.nav-link').forEach(el => {
        el.classList.remove('active');
    });

    const target = $('view-' + viewName);

    if (target) {
        target.classList.add('active');
    }

    const nav = document.querySelector(`.nav-link[data-target="${viewName}"]`);

    if (nav) {
        nav.classList.add('active');
    }

    if (viewName === 'lacak') {
        renderMyTickets();
    }

    if (viewName === 'news') {
        renderNewsCards();
    }

    window.scrollTo({ top: 0, behavior: 'smooth' });
}

let pendingCancelCode = null;

function openCancelModal(code) {
    const t = ticketDatabase[code];

    if (!t) {
        return;
    }

    if (t.status !== 'Baru Diterima') {
        toast('Laporan tidak dapat dibatalkan karena sudah dalam penanganan petugas.', true);
        return;
    }

    pendingCancelCode = code;

    $('cancelTicketDesc').innerText = `Apakah Anda yakin ingin membatalkan laporan tiket #${code}? Petugas tidak akan memproses pengajuan ini.`;
    $('cancelReasonInput').value = '';
    $('cancelTicketModal').classList.add('active');
}

function closeCancelModal() {
    $('cancelTicketModal').classList.remove('active');
    pendingCancelCode = null;
}

async function confirmCancelTicket() {
    if (!pendingCancelCode || !ticketDatabase[pendingCancelCode]) {
        return;
    }

    const code = pendingCancelCode;
    const reason = $('cancelReasonInput').value.trim() || 'Dibatalkan oleh pemohon.';
    const sb = window.supabase;

    if (!sb || !currentCitizenProfile) {
        toast('Sesi Supabase tidak ditemukan. Silakan masuk kembali.', true);
        return;
    }

    const cancelButton = $('cancelTicketModal').querySelector('.btn-bad');
    if (cancelButton) {
        cancelButton.disabled = true;
        cancelButton.innerText = 'Memproses...';
    }

    try {
        const { error } = await sb.rpc('cancel_own_ticket', {
            p_ticket_code: code,
            p_reason: reason
        });

        if (error) throw error;

        closeCancelModal();
        try {
            await loadCitizenTickets();
        } catch (refreshError) {
            console.warn('Pembatalan tersimpan, tetapi daftar tiket gagal diperbarui:', refreshError);
            if (ticketDatabase[code]) {
                ticketDatabase[code].status = 'Dibatalkan';
                ticketDatabase[code].cancelReason = reason;
                ticketDatabase[code].cancelledAt = Date.now();
            }
        }
        toast(`Laporan ${code} berhasil dibatalkan.`);
        renderHome();
        renderMyTickets();

        if (!$('trackResult').hidden && $('ticketInput').value.trim().toUpperCase() === code) {
            trackTicket();
        }
    } catch (err) {
        console.error('Pembatalan tiket gagal:', err);
        toast(err.message || 'Laporan gagal dibatalkan.', true);
    } finally {
        if (cancelButton) {
            cancelButton.disabled = false;
            cancelButton.innerText = 'Ya, Batalkan Laporan';
        }
    }
}

let leafletMap = null;
let reportMarker = null;

function initReportMap() {
    const mapBox = $('reportMap');

    if (!mapBox) {
        return;
    }

    const defLat = -6.175392;
    const defLng = 106.827153;

    if (!leafletMap && typeof L !== 'undefined') {
        leafletMap = L.map('reportMap').setView([defLat, defLng], 14);

        L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
            maxZoom: 19,
            attribution: '© OpenStreetMap'
        }).addTo(leafletMap);

        leafletMap.on('click', function (e) {
            setMapCoordinates(e.latlng.lat, e.latlng.lng);
        });
    }

    setTimeout(() => {
        if (leafletMap) {
            leafletMap.invalidateSize();

            if (!$('formLat').value) {
                setMapCoordinates(defLat, defLng, false);
            }
        }
    }, 250);
}

function setMapCoordinates(lat, lng, fetchAddress = true) {
    lat = Number(lat.toFixed(6));
    lng = Number(lng.toFixed(6));

    $('formLat').value = lat;
    $('formLng').value = lng;
    $('mapCoordsText').innerText = `Koordinat: ${lat}, ${lng}`;

    if (leafletMap && typeof L !== 'undefined') {
        if (reportMarker) {
            reportMarker.setLatLng([lat, lng]);
        } else {
            reportMarker = L.marker([lat, lng], {
                draggable: true
            }).addTo(leafletMap);

            reportMarker.on('dragend', function (e) {
                const pos = e.target.getLatLng();
                setMapCoordinates(pos.lat, pos.lng, true);
            });
        }

        leafletMap.panTo([lat, lng]);
    }

    if (fetchAddress && $('formLocation')) {
        fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}`)
            .then(res => res.json())
            .then(data => {
                if (data && data.display_name && !$('formLocation').value) {
                    $('formLocation').value = data.display_name;
                }
            })
            .catch(() => {});
    }
}

function getCurrentGpsLocation() {
    if (!navigator.geolocation) {
        toast('Browser tidak mendukung pendeteksian lokasi GPS.', true);
        return;
    }

    toast('Mendeteksi lokasi perangkat...');

    navigator.geolocation.getCurrentPosition(
        pos => {
            const lat = pos.coords.latitude;
            const lng = pos.coords.longitude;

            setMapCoordinates(lat, lng, true);
            toast('Lokasi GPS berhasil ditandai.');
        },
        err => {
            toast('Gagal mendeteksi lokasi GPS. Pastikan izin lokasi aktif.', true);
        },
        { enableHighAccuracy: true, timeout: 8000 }
    );
}

let activeMediaMode = 'upload';
let cameraStream = null;
let currentCompressedPhoto = null;

function switchMediaMode(mode) {
    activeMediaMode = mode;

    $('tabUploadBtn').classList.toggle('active', mode === 'upload');
    $('tabCameraBtn').classList.toggle('active', mode === 'camera');

    $('mediaUploadPanel').hidden = (mode !== 'upload');
    $('mediaCameraPanel').hidden = (mode !== 'camera');

    if (mode === 'camera') {
        startCameraStream();
    } else {
        stopCameraStream();
    }
}

async function startCameraStream() {
    if (!navigator.mediaDevices || !navigator.mediaDevices.getUserMedia) {
        toast('Perangkat tidak mendukung akses kamera.', true);
        switchMediaMode('upload');
        return;
    }

    try {
        cameraStream = await navigator.mediaDevices.getUserMedia({
            video: {
                facingMode: 'environment',
                width: { ideal: 1280 },
                height: { ideal: 720 }
            },
            audio: false
        });

        const video = $('cameraVideo');

        if (video) {
            video.srcObject = cameraStream;
            video.play();
        }
    } catch (err) {
        toast('Tidak dapat mengakses kamera. Periksa izin kamera pada browser Anda.', true);
        switchMediaMode('upload');
    }
}

function stopCameraStream() {
    if (cameraStream) {
        cameraStream.getTracks().forEach(track => track.stop());
        cameraStream = null;
    }

    const video = $('cameraVideo');

    if (video) {
        video.srcObject = null;
    }
}

async function captureCameraPhoto() {
    const video = $('cameraVideo');

    if (!video || !video.videoWidth) {
        toast('Kamera belum siap, tunggu beberapa detik.', true);
        return;
    }

    const canvas = document.createElement('canvas');

    canvas.width = video.videoWidth;
    canvas.height = video.videoHeight;

    const ctx = canvas.getContext('2d');
    ctx.drawImage(video, 0, 0, canvas.width, canvas.height);

    const lat = $('formLat').value;
    const lng = $('formLng').value;

    const stamped = await applyStampOverlay(canvas, { lat, lng });

    stopCameraStream();
    setFinalPhoto(stamped);
}

async function onFileSelected(e) {
    const file = e.target.files[0];

    $('errFile').innerText = '';

    if (!file) {
        return;
    }

    if (!/^image\/(png|jpeg)$/.test(file.type) || file.size > 4 * 1048576) {
        $('errFile').innerText = 'Gunakan foto JPG atau PNG maksimal 4 MB.';
        e.target.value = '';
        return;
    }

    const img = new Image();

    img.onload = async () => {
        const r = Math.min(1, 1024 / Math.max(img.width, img.height));
        const c = document.createElement('canvas');

        c.width = Math.round(img.width * r);
        c.height = Math.round(img.height * r);

        const ctx = c.getContext('2d');
        ctx.drawImage(img, 0, 0, c.width, c.height);

        const lat = $('formLat').value;
        const lng = $('formLng').value;

        const stamped = await applyStampOverlay(c, { lat, lng });
        setFinalPhoto(stamped);
        URL.revokeObjectURL(img.src);
    };

    img.onerror = () => {
        $('errFile').innerText = 'Foto tidak dapat dibaca.';
        URL.revokeObjectURL(img.src);
    };

    img.src = URL.createObjectURL(file);
}

function applyStampOverlay(canvas, meta = {}) {
    return new Promise(resolve => {
        const ctx = canvas.getContext('2d');
        const now = new Date();

        const dateStr = now.toLocaleDateString('id-ID', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        });

        const timeStr = now.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit'
        }) + ' WIB';

        const coordStr = (meta.lat && meta.lng)
            ? `KOORD: ${meta.lat}, ${meta.lng}`
            : 'KOORD: DOKUMENTASI PINTAR';

        const boxH = Math.max(38, Math.round(canvas.height * 0.08));
        const y = canvas.height - boxH;

        ctx.fillStyle = 'rgba(27, 30, 59, 0.82)';
        ctx.fillRect(0, y, canvas.width, boxH);

        ctx.fillStyle = '#f4eef6';
        ctx.font = `bold ${Math.max(11, Math.round(boxH * 0.32))}px "Geist Mono", monospace`;
        ctx.fillText(`PINTAR DOKUMENTASI RESMI • ${dateStr} ${timeStr}`, 14, y + boxH * 0.44);

        ctx.fillStyle = '#d9a3d6';
        ctx.font = `${Math.max(10, Math.round(boxH * 0.28))}px "Geist Mono", monospace`;
        ctx.fillText(`${coordStr} • REF: DRAFT LAPORAN`, 14, y + boxH * 0.82);

        resolve(canvas.toDataURL('image/jpeg', 0.72));
    });
}

function setFinalPhoto(base64Data) {
    currentCompressedPhoto = base64Data;

    $('mediaPreviewImg').src = base64Data;
    $('mediaPreviewPanel').hidden = false;
    $('mediaUploadPanel').hidden = true;
    $('mediaCameraPanel').hidden = true;

    $('mediaMetaText').innerHTML = `<i class="ph ph-check-circle" style="color:var(--ok)"></i> Dokumentasi & timestamp tersimpan`;
}

function clearSelectedPhoto() {
    currentCompressedPhoto = null;

    $('formFile').value = '';
    $('mediaPreviewImg').src = '';
    $('mediaPreviewPanel').hidden = true;

    switchMediaMode(activeMediaMode);
}

function openModal(title, prefix) {
    const user = getUser();

    $('modalTitle').innerText = title;
    $('formPrefix').value = prefix;
    $('formName').value = user.name || 'Warga';
    $('formNik').value = user.nik;

    [
        'errLocation',
        'errDesc',
        'errFile',
        'errFacilityName',
        'errFamilyHead'
    ].forEach(id => {
        if ($(id)) {
            $(id).innerText = '';
        }
    });

    clearSelectedPhoto();

    $('fields-PGD').hidden = (prefix !== 'PGD');
    $('fields-BNS').hidden = (prefix !== 'BNS');
    $('fields-PRZ').hidden = (prefix !== 'PRZ');

    if (prefix === 'PGD') {
        $('labelLocation').innerText = 'Lokasi / alamat fasilitas kejadian';
        $('labelDesc').innerText = 'Detail kerusakan & kondisi di lapangan';
        $('formDesc').placeholder = 'Jelaskan kondisi kerusakan fasilitas, potensi bahaya bagi warga sekitar, dan waktu kejadian.';

        setTimeout(initReportMap, 150);
    } else if (prefix === 'BNS') {
        $('labelLocation').innerText = 'Alamat domisili keluarga / penerima';
        $('labelDesc').innerText = 'Uraian kendala bantuan sosial';
        $('formDesc').placeholder = 'Jelaskan permasalahan bansos (misal: penonaktifan tanpa pemberitahuan, data belum sesuai, dll).';
    } else {
        $('labelLocation').innerText = 'Kelurahan / alamat pemohon';
        $('labelDesc').innerText = 'Keperluan & rincian permohonan';
        $('formDesc').placeholder = 'Jelaskan tujuan pengajuan dokumen/surat keterangan secara jelas.';
    }

    $('formModal').classList.add('active');
    $('formLocation').focus();
}

function closeModal() {
    stopCameraStream();

    $('formModal').classList.remove('active');
    $('publicServiceForm').reset();

    clearSelectedPhoto();
}

async function handleFormSubmit(e) {
    e.preventDefault();

    const prefix = $('formPrefix').value;
    const location = $('formLocation').value.trim();
    const desc = $('formDesc').value.trim();

    let valid = true;

    $('errLocation').innerText = location.length >= 5
        ? ''
        : 'Isi lokasi minimal 5 karakter.';

    $('errDesc').innerText = desc.length >= 10
        ? ''
        : 'Jelaskan laporan minimal 10 karakter.';

    if (location.length < 5 || desc.length < 10) {
        valid = false;
    }

    let extraData = {};

    if (prefix === 'PGD') {
        const facName = $('formFacilityName').value.trim();
        const damage = $('formDamageType').value;
        const latValue = $('formLat').value;
        const lngValue = $('formLng').value;
        const lat = latValue === '' ? null : Number(latValue);
        const lng = lngValue === '' ? null : Number(lngValue);

        if (facName.length < 3) {
            $('errFacilityName').innerText = 'Nama fasilitas minimal 3 karakter.';
            valid = false;
        } else {
            $('errFacilityName').innerText = '';
        }

        extraData = {
            facilityName: facName,
            damageType: damage,
            geo: lat !== null && lng !== null ? { lat, lng } : null
        };
    } else if (prefix === 'BNS') {
        const famHead = $('formFamilyHead').value.trim();
        const prog = $('formBansosProgram').value;
        const issue = $('formBansosIssue').value;

        if (famHead.length < 3) {
            $('errFamilyHead').innerText = 'Nama kepala keluarga minimal 3 karakter.';
            valid = false;
        } else {
            $('errFamilyHead').innerText = '';
        }

        extraData = {
            familyHead: famHead,
            bansosProgram: prog,
            bansosIssue: issue
        };
    } else if (prefix === 'PRZ') {
        extraData = {
            docType: $('formDocType').value
        };
    }

    if (!valid || $('errFile').innerText) {
        return;
    }

    const btn = $('submitBtn');
    const originalButtonText = btn.innerText;
    btn.disabled = true;
    btn.innerText = 'Mengirim...';

    let uploadedImagePath = null;

    try {
        const sb = window.supabase;
        const user = currentCitizenProfile || await getSupabaseCitizenProfile();

        if (!sb) {
            throw new Error('Supabase belum siap. Muat ulang halaman lalu coba lagi.');
        }

        let code;
        do {
            code = `${prefix}-${Math.floor(10000 + Math.random() * 90000)}`;
        } while (ticketDatabase[code]);

        const svc = SERVICES.find(item => item.prefix === prefix) || SERVICES[0];
        const imageData = currentCompressedPhoto || null;

        if (imageData) {
            const imageBlob = await fetch(imageData).then(response => response.blob());
            const extension = imageBlob.type === 'image/png' ? 'png' : 'jpg';
            uploadedImagePath = `${user.id}/${code}.${extension}`;

            const { error: uploadError } = await sb.storage
                .from('ticket-evidence')
                .upload(uploadedImagePath, imageBlob, {
                    contentType: imageBlob.type || 'image/jpeg',
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) {
                throw new Error(`Foto bukti gagal diunggah: ${uploadError.message}`);
            }
        }

        const ticketPayload = {
            ticket_code: code,
            user_id: user.id,
            applicant_name: user.name,
            service_prefix: prefix,
            service_type: svc.type,
            description: desc,
            location,
            latitude: extraData.geo?.lat ?? null,
            longitude: extraData.geo?.lng ?? null,
            facility_name: extraData.facilityName || null,
            damage_type: extraData.damageType || null,
            family_head: extraData.familyHead || null,
            bansos_program: extraData.bansosProgram || null,
            bansos_issue: extraData.bansosIssue || null,
            document_type: extraData.docType || null,
            image_path: uploadedImagePath,
            status: 'Baru Diterima',
            officer_department: svc.officer,
            eta: svc.eta
        };

        const { data: insertedTicket, error: insertError } = await sb
            .from('tickets')
            .insert(ticketPayload)
            .select('*')
            .single();

        if (insertError) throw insertError;

        ticketDatabase[code] = {
            id: insertedTicket.id,
            userId: insertedTicket.user_id,
            name: insertedTicket.applicant_name,
            nik: user.nik,
            type: insertedTicket.service_type,
            desc: insertedTicket.description,
            location: insertedTicket.location,
            geo: insertedTicket.latitude != null && insertedTicket.longitude != null
                ? { lat: Number(insertedTicket.latitude), lng: Number(insertedTicket.longitude) }
                : null,
            facilityName: insertedTicket.facility_name,
            damageType: insertedTicket.damage_type,
            familyHead: insertedTicket.family_head,
            bansosProgram: insertedTicket.bansos_program,
            bansosIssue: insertedTicket.bansos_issue,
            docType: insertedTicket.document_type,
            imagePath: insertedTicket.image_path,
            imageData,
            status: insertedTicket.status,
            officer: insertedTicket.officer_department || svc.officer,
            eta: insertedTicket.eta,
            createdAt: dateToMillis(insertedTicket.created_at),
            history: [{ status: insertedTicket.status, at: dateToMillis(insertedTicket.created_at) }]
        };

        try {
            await loadCitizenTickets();
        } catch (refreshError) {
            console.warn('Tiket sudah tersimpan, tetapi penyegaran daftar gagal:', refreshError);
        }

        closeModal();
        toast(`Pengajuan terkirim. Nomor tiket: ${code}`);
        renderHome();
        renderMyTickets();
        switchView('lacak');
        $('ticketInput').value = code;
        trackTicket();
    } catch (err) {
        console.error('Pengiriman laporan gagal:', err);

        if (uploadedImagePath && window.supabase) {
            try {
                await window.supabase.storage
                    .from('ticket-evidence')
                    .remove([uploadedImagePath]);
            } catch (cleanupError) {
                console.warn('Pembersihan foto sementara gagal:', cleanupError);
            }
        }

        toast(err.message || 'Pengajuan gagal dikirim. Silakan coba lagi.', true);
    } finally {
        btn.disabled = false;
        btn.innerText = originalButtonText || 'Kirim pengajuan';
    }
}

function saveNewTicket(code, name, nik, prefix, desc, location, imageData, extraData = {}) {
    const svc = SERVICES.find(s => s.prefix === prefix) || SERVICES[0];

    ticketDatabase[code] = Object.assign({
        name,
        nik,
        type: svc.type,
        desc,
        location,
        imageData,
        status: 'Baru Diterima',
        officer: svc.officer,
        createdAt: Date.now(),
        history: [
            { status: 'Baru Diterima', at: Date.now() }
        ]
    }, extraData);

    try {
        saveDatabase();
        return true;
    } catch {
        delete ticketDatabase[code];
        toast('Penyimpanan penuh. Coba tanpa foto.', true);
        return false;
    }
}

function openTicket(code) {
    switchView('lacak');
    $('ticketInput').value = code;
    trackTicket();
}

let currentRating = 5;
let currentFeedbackTags = [];

function setFeedbackRating(score) {
    currentRating = score;

    for (let i = 1; i <= 5; i++) {
        const star = $('starBtn_' + i);

        if (star) {
            star.classList.toggle('active', i <= score);
            star.innerHTML = i <= score ? '★' : '☆';
        }
    }
}

function toggleFeedbackTag(tag, btn) {
    const idx = currentFeedbackTags.indexOf(tag);

    if (idx >= 0) {
        currentFeedbackTags.splice(idx, 1);
        btn.classList.remove('active');
    } else {
        currentFeedbackTags.push(tag);
        btn.classList.add('active');
    }
}

async function submitFeedback(code) {
    const t = ticketDatabase[code];

    if (!t || !t.id || !currentCitizenProfile || !window.supabase) {
        toast('Data tiket atau sesi akun tidak ditemukan.', true);
        return;
    }

    if (t.feedback) {
        toast('Umpan balik untuk tiket ini sudah pernah dikirim.', true);
        return;
    }

    const commentEl = $('feedbackComment');
    const comment = commentEl ? commentEl.value.trim() : '';

    try {
        const { data, error } = await window.supabase
            .from('feedback')
            .insert({
                ticket_id: t.id,
                user_id: currentCitizenProfile.id,
                rating: currentRating,
                tags: currentFeedbackTags.slice(),
                comment
            })
            .select('rating, tags, comment, submitted_at')
            .single();

        if (error) throw error;

        t.feedback = {
            rating: data.rating,
            tags: data.tags || [],
            comment: data.comment || '',
            submittedAt: dateToMillis(data.submitted_at)
        };

        toast('Terima kasih! Umpan balik Anda telah tersimpan.');
        trackTicket();
    } catch (err) {
        console.error('Penyimpanan umpan balik gagal:', err);
        toast(err.message || 'Umpan balik gagal disimpan.', true);
    }
}

function copyTicketCode(code) {
    if (navigator.clipboard) {
        navigator.clipboard.writeText(code);
        toast(`Nomor tiket ${code} disalin.`);
    } else {
        const input = document.createElement('input');

        input.value = code;
        document.body.appendChild(input);
        input.select();
        document.execCommand('copy');
        input.remove();

        toast(`Nomor tiket ${code} disalin.`);
    }
}

function getProgressPercent(status) {
    if (status === 'Selesai') return 100;
    if (status === 'Sedang Diproses') return 75;
    if (status === 'Ditolak' || status === 'Dibatalkan') return 100;
    return 35;
}

function renderModernStepper(status) {
    if (status === 'Dibatalkan') {
        return `
        <div style="background:#fef2f2; border:1px solid #fecaca; color:#b91c1c; padding:10px 14px; border-radius:8px; display:flex; align-items:center; gap:8px; font-size:0.84rem; font-weight:600; margin-top:14px;">
            <i class="ph ph-x-circle" style="font-size:1.15rem;"></i> Laporan dibatalkan oleh pemohon.
        </div>`;
    }

    const isDone = status === 'Selesai';
    const isProc = status === 'Sedang Diproses' || isDone;
    const isRejected = status === 'Ditolak';

    return `
    <div class="stepper-modern">
        <div class="step-m done">
            <span class="step-m-icon"><i class="ph ph-check"></i></span>
            <span class="step-m-label">Laporan Diterima</span>
        </div>
        <div class="step-m ${isProc ? 'done' : 'active'}">
            <span class="step-m-icon">${isProc ? '<i class="ph ph-check"></i>' : '<i class="ph ph-user-check"></i>'}</span>
            <span class="step-m-label">Verifikasi Petugas</span>
        </div>
        <div class="step-m ${isDone ? 'done' : isProc ? 'active' : ''}">
            <span class="step-m-icon">${isDone ? '<i class="ph ph-check"></i>' : '<i class="ph ph-wrench"></i>'}</span>
            <span class="step-m-label">Penanganan Lapangan</span>
        </div>
        <div class="step-m ${isRejected ? 'rejected' : isDone ? 'done' : ''}">
            <span class="step-m-icon">${isRejected ? '<i class="ph ph-x"></i>' : isDone ? '<i class="ph ph-check-circle"></i>' : '<i class="ph ph-flag"></i>'}</span>
            <span class="step-m-label">${isRejected ? 'Ditolak' : 'Selesai'}</span>
        </div>
    </div>`;
}

function renderFeedbackBox(code, t) {
    if (t.status !== 'Selesai') {
        return '';
    }

    if (t.feedback) {
        return `
        <div class="feedback-done-box">
            <div style="display:flex; justify-content:space-between; align-items:center; margin-bottom:6px;">
                <strong><i class="ph ph-seal-check" style="color:#16a34a; font-size:1.1rem; vertical-align:middle;"></i> Penilaian Warga Terverifikasi</strong>
                <span class="feedback-done-stars">${'★'.repeat(t.feedback.rating)}${'☆'.repeat(5 - t.feedback.rating)}</span>
            </div>
            ${t.feedback.tags && t.feedback.tags.length ? `<div style="display:flex; flex-wrap:wrap; gap:4px; margin:6px 0;">${t.feedback.tags.map(tag => `<span class="chip" style="background:#dcfce7; color:#15803d; border-color:#bbf7d0;">${esc(tag)}</span>`).join('')}</div>` : ''}
            ${t.feedback.comment ? `<p style="font-size:0.84rem; margin:6px 0 0; color:#14532d; font-style:italic;">"${esc(t.feedback.comment)}"</p>` : ''}
            <small style="color:#15803d; font-size:0.74rem; display:block; margin-top:6px;">Ulasan Anda membantu meningkatkan akuntabilitas dan mutu layanan publik daerah.</small>
        </div>`;
    }

    return `
    <div class="feedback-box">
        <h4><i class="ph ph-chats-circle"></i> Umpan Balik &amp; Evaluasi Warga</h4>
        <p class="sub">Bagaimana tanggapan Anda mengenai kecepatan dan hasil penanganan laporan ini?</p>
        <div class="star-rating-row">
            ${[1, 2, 3, 4, 5].map(i => `<button type="button" class="star-btn ${i <= currentRating ? 'active' : ''}" id="starBtn_${i}" onclick="setFeedbackRating(${i})">★</button>`).join('')}
            <span style="font-size:0.8rem; font-weight:600; color:#6b21a8; margin-left:6px;">Sangat Puas</span>
        </div>
        <div class="feedback-tags">
            <button type="button" class="feedback-tag-btn" onclick="toggleFeedbackTag('Respon Cepat', this)">⏱️ Respon Cepat</button>
            <button type="button" class="feedback-tag-btn" onclick="toggleFeedbackTag('Petugas Ramah', this)">👷 Petugas Ramah</button>
            <button type="button" class="feedback-tag-btn" onclick="toggleFeedbackTag('Hasil Bersih &amp; Rapi', this)">✨ Hasil Bersih &amp; Rapi</button>
            <button type="button" class="feedback-tag-btn" onclick="toggleFeedbackTag('Komunikasi Jelas', this)">📱 Komunikasi Jelas</button>
        </div>
        <textarea id="feedbackComment" class="feedback-input" placeholder="Tuliskan saran atau pesan apresiasi untuk petugas (opsional)..."></textarea>
        <button type="button" class="btn btn-primary btn-sm" style="width:100%; justify-content:center;" onclick="submitFeedback('${code}')">
            <i class="ph ph-paper-plane-right"></i> Kirim Umpan Balik
        </button>
    </div>`;
}

function trackTicket() {
    let input = $('ticketInput').value.trim().toUpperCase();

    if (input.startsWith('#')) {
        input = input.substring(1);
    }

    const err = $('trackError');
    const box = $('trackResult');
    const t = ticketDatabase[input];

    err.innerText = '';

    if (!t || (currentCitizenProfile ? t.userId !== currentCitizenProfile.id : t.nik !== getUser().nik)) {
        box.hidden = true;
        $('trackEmpty').hidden = false;
        err.innerText = input
            ? 'Tiket tidak ditemukan pada akun Anda.'
            : 'Masukkan nomor tiket terlebih dahulu.';
        return;
    }

    $('trackEmpty').hidden = true;
    box.hidden = false;
    box.className = 'result ' + kOf(input);

    const percent = getProgressPercent(t.status);
    const canCancel = t.status === 'Baru Diterima';

    const geoLink = (t.geo && t.geo.lat)
        ? `<a href="https://www.google.com/maps?q=${t.geo.lat},${t.geo.lng}" target="_blank" class="link" style="font-size:0.8rem; display:inline-flex; align-items:center; gap:4px;"><i class="ph ph-arrow-square-out"></i> Buka Google Maps (${t.geo.lat.toFixed(4)}, ${t.geo.lng.toFixed(4)})</a>`
        : '';

    box.innerHTML = `
        <div class="result-stub">
            <div>
                <small>Nomor Tiket</small>
                <h3 style="display:flex; align-items:center; gap:8px;">
                    ${input}
                    <button type="button" class="btn-copy-code" onclick="copyTicketCode('${input}')" title="Salin nomor tiket"><i class="ph ph-copy"></i> Salin</button>
                </h3>
            </div>
            ${badge(t.status)}
        </div>
        <div class="result-body">
            <div class="track-progress-card">
                <div class="track-progress-header">
                    <span class="track-live-tag"><span class="live-pulse-dot"></span> Pemantauan Real-Time</span>
                    <span class="track-progress-percent">${percent}%</span>
                </div>
                <div class="track-progress-track">
                    <div class="track-progress-fill ${t.status === 'Sedang Diproses' ? 'active' : ''}" style="width: ${percent}%;"></div>
                </div>
                <div class="track-progress-footer">
                    <span><i class="ph ph-clock"></i> Target SLA: ${esc(t.eta || '1–3 hari kerja')}</span>
                    <span>Tahap: <strong>${esc(t.status)}</strong></span>
                </div>
                ${renderModernStepper(t.status)}
            </div>
            <div class="track-card">
                <div class="track-card-head"><i class="ph ph-file-text"></i> Data Pengaduan Warga</div>
                <div class="info-row"><span class="info-label">Jenis Layanan</span><span class="info-val">${esc(t.type)}</span></div>
                ${t.facilityName ? `<div class="info-row"><span class="info-label">Fasilitas</span><span class="info-val">${esc(t.facilityName)} (${esc(t.damageType || 'Rusak')})</span></div>` : ''}
                ${t.docType ? `<div class="info-row"><span class="info-label">Jenis Dokumen</span><span class="info-val">${esc(t.docType)}</span></div>` : ''}
                ${t.familyHead ? `<div class="info-row"><span class="info-label">Bansos Terkait</span><span class="info-val">${esc(t.bansosProgram)} (KK: ${esc(t.familyHead)})</span></div>` : ''}
                <div class="info-row"><span class="info-label">Waktu Kirim</span><span class="info-val">${fmtDate(t.createdAt)}</span></div>
                <div class="info-row"><span class="info-label">Lokasi</span><span class="info-val">${esc(t.location)} ${geoLink ? `<br>${geoLink}` : ''}</span></div>
                <div class="info-row"><span class="info-label">Uraian</span><span class="info-val" style="text-align:left;">${esc(t.desc)}</span></div>
                ${t.imageData ? `<div style="margin-top:10px;"><span class="info-label" style="display:block; margin-bottom:4px;">Dokumentasi Awal:</span><img class="photo" src="${t.imageData}" alt="Bukti foto" onclick="previewImage(this.src)" style="cursor:zoom-in;"></div>` : ''}
            </div>
            <div class="track-card">
                <div class="track-card-head"><i class="ph ph-user-gear"></i> Tindak Lanjut Penanganan Dinas</div>
                <div class="info-row"><span class="info-label">Unit Petugas</span><span class="info-val"><strong>${esc(t.officer)}</strong></span></div>
                ${resultHTML(t)}
            </div>
            ${canCancel ? `
                <div style="background:var(--surface-2); border:1px dashed var(--line); border-radius:var(--r); padding:14px; margin-bottom:14px; text-align:center;">
                    <button class="btn btn-cancel-ticket" style="margin:0 auto; width:100%; justify-content:center;" onclick="openCancelModal('${input}')">
                        <i class="ph ph-x-circle"></i> Batalkan Laporan Ini
                    </button>
                    <small style="display:block; color:var(--ink-3); margin-top:6px; font-size:0.78rem;">Laporan dapat dibatalkan mandiri oleh warga sebelum diverifikasi petugas.</small>
                </div>
            ` : ''}
            ${renderFeedbackBox(input, t)}
            ${historyHTML(t)}
        </div>`;

    markSeen(input, t);
    refreshIcons();
}

function toggleChat() {
    $('chatBox').classList.toggle('active');
}

function handleChatKey(e) {
    if (e.key === 'Enter') {
        sendChatMessage();
    }
}

const CHAT_FAQ = [
    [['syarat', 'dokumen'], 'Syarat pengajuan: NIK aktif, lokasi kejadian yang jelas, uraian laporan, dan foto pendukung bila ada.'],
    [['status', 'lacak', 'cek', 'tiket'], "Buka menu 'Lacak Tiket', lalu pilih tiket Anda atau masukkan nomornya."],
    [['lama', 'berapa', 'waktu'], 'Verifikasi biasanya 1–2 hari kerja. Penanganan menyesuaikan jenis laporan.'],
    [['buat', 'ajukan', 'lapor', 'cara'], "Buka menu 'Buat Pengaduan', pilih kategori, isi formulir, dan lampirkan foto bila ada."],
    [['foto', 'bukti', 'kamera'], 'Anda dapat memilih foto dari galeri atau memotret langsung dengan kamera perangkat. Timestamp akan otomatis tersemat.'],
    [['peta', 'map', 'lokasi'], 'Khusus laporan fasilitas umum, Anda dapat menandai titik koordinat langsung pada peta interaktif atau menggunakan GPS.'],
    [['batal', 'batalkan'], 'Anda dapat membatalkan laporan melalui menu Lacak Tiket selama statusnya masih "Baru Diterima".'],
    [['berita', 'informasi publik', 'news'], 'Menu "Informasi Publik" menampilkan perkembangan penyelesaian fasilitas dan pengumuman resmi pemerintah.']
];

function chatAdd(text, who, isAi = false) {
    const body = $('chatBody');
    const row = document.createElement('div');

    row.className = 'chat-row ' + who;

    if (who === 'bot') {
        const avatar = document.createElement('img');

        avatar.src = 'PINTAR_BOT.png';
        avatar.alt = 'Bot';
        avatar.className = 'chat-avatar-bot';

        row.appendChild(avatar);
    }

    const div = document.createElement('div');

    div.className = 'chat-msg ' + who;

    if (isAi && who === 'bot') {
        div.innerHTML = `<span class="chat-msg-ai-tag">PINTAR AI</span><div>${esc(text).replace(/\n/g, '<br>')}</div>`;
    } else {
        div.innerText = text;
    }

    row.appendChild(div);
    body.appendChild(row);
    body.scrollTop = body.scrollHeight;
}

function showChatTyping() {
    const body = $('chatBody');
    const div = document.createElement('div');

    div.className = 'chat-msg bot chat-typing';
    div.id = 'chatTypingIndicator';
    div.innerHTML = '<span></span><span></span><span></span>';

    body.appendChild(div);
    body.scrollTop = body.scrollHeight;
}

function hideChatTyping() {
    const el = $('chatTypingIndicator');

    if (el) {
        el.remove();
    }
}

async function sendChatMessage(preset) {
    const input = $('chatInput');
    const text = (preset || input.value).trim();

    if (!text) {
        return;
    }

    chatAdd(text, 'user');

    if (!preset) {
        input.value = '';
    }

    const lower = text.toLowerCase();
    const user = getUser();

    if (lower.includes('nama') || lower.includes('siapa saya')) {
        setTimeout(() => {
            const message = user.name
                ? `Halo ${user.name}, nama Anda terdaftar pada sesi ini.`
                : 'Anda belum memiliki sesi pengguna aktif.';

            chatAdd(message, 'bot');
        }, 300);

        return;
    }

    const hit = CHAT_FAQ.find(([keys]) => keys.some(key => lower.includes(key)));

    if (preset || hit) {
        setTimeout(() => {
            chatAdd(
                hit ? hit[1] : "Untuk membuat laporan, silakan buka menu 'Buat Pengaduan'.",
                'bot'
            );
        }, 400);

        return;
    }

    showChatTyping();

    try {
        const response = await fetch(`${PINTAR_API_BASE_URL}/api/chat`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify({
                prompt: text,
                userName: user.name || 'Warga'
            })
        });

        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.error || 'Chatbot tidak dapat memproses permintaan.');
        }

        if (typeof data.reply !== 'string' || !data.reply.trim()) {
            throw new Error('Server tidak mengirimkan jawaban yang valid.');
        }

        chatAdd(data.reply, 'bot', true);
    } catch (error) {
        console.error('PINTAR chatbot error:', error);

        chatAdd(
            'Maaf, layanan asisten PINTAR sedang tidak dapat dihubungi. Silakan coba kembali beberapa saat lagi.',
            'bot'
        );
    } finally {
        hideChatTyping();
    }
}

let activeNewsFilter = 'all';

function filterNews(cat) {
    activeNewsFilter = cat;

    document.querySelectorAll('.news-filter-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.cat === cat);
    });

    renderNewsCards();
}

function renderNewsCards() {
    const list = loadNewsList();
    const container = $('newsGridList');

    if (!container) {
        return;
    }

    const filtered = activeNewsFilter === 'all'
        ? list
        : list.filter(item => item.category === activeNewsFilter);

    if (!filtered.length) {
        container.innerHTML = `<div class="empty-state" style="grid-column: 1 / -1;">
            <div class="empty-ic"><i class="ph ph-newspaper"></i></div>
            <h3>Belum ada berita</h3>
            <p>Informasi publik dan perkembangan fasilitas akan ditampilkan di sini.</p>
        </div>`;
        return;
    }

    container.innerHTML = filtered.map(item => {
        const thumb = item.imgAfter || item.imgBefore || 'PINTAR_BG.jpg';

        return `
            <article class="news-card" onclick="openNewsDetail('${item.id}')">
                <div class="news-media">
                    <img src="${thumb}" alt="${esc(item.title)}" onerror="this.src='PINTAR_BG.jpg'">
                    <span class="news-tag">${esc(item.category)}</span>
                </div>
                <div class="news-body">
                    <div class="news-date">${fmtDate(item.publishedAt)} · ${esc(item.author || 'Petugas')}</div>
                    <h3 class="news-title">${esc(item.title)}</h3>
                    <p class="news-desc">${esc(item.desc)}</p>
                    <div class="news-foot">
                        <span>Baca selengkapnya</span>
                        <i class="ph ph-arrow-right"></i>
                    </div>
                </div>
            </article>`;
    }).join('');

    refreshIcons();
}

function openNewsDetail(newsId) {
    const item = loadNewsList().find(n => n.id === newsId);

    if (!item) {
        return;
    }

    $('newsDetailCat').innerText = item.category;
    $('newsDetailTitle').innerText = item.title;
    $('newsDetailDate').innerText = fmtDate(item.publishedAt);
    $('newsDetailAuthor').innerText = item.author || 'Petugas PINTAR';
    $('newsDetailDesc').innerText = item.desc;

    const wrapBefore = $('newsWrapBefore');
    const wrapAfter = $('newsWrapAfter');
    const grid = $('newsComparisonGrid');

    if (item.imgBefore || item.imgAfter) {
        grid.hidden = false;

        if (item.imgBefore) {
            $('newsImgBefore').src = item.imgBefore;
            wrapBefore.hidden = false;
        } else {
            wrapBefore.hidden = true;
        }

        if (item.imgAfter) {
            $('newsImgAfter').src = item.imgAfter;
            wrapAfter.hidden = false;
        } else {
            wrapAfter.hidden = true;
        }
    } else {
        grid.hidden = true;
    }

    const refBox = $('newsDetailRef');

    if (item.ticketRef) {
        refBox.hidden = false;
        refBox.innerHTML = `<i class="ph ph-ticket"></i> Informasi ini dipublikasikan berdasarkan tindak lanjut laporan pengaduan warga nomor <strong>#${esc(item.ticketRef)}</strong>.`;
    } else {
        refBox.hidden = true;
    }

    $('newsDetailModal').classList.add('active');
    refreshIcons();
}

function closeNewsDetailModal() {
    $('newsDetailModal').classList.remove('active');
}

async function initAdminSession() {
    if (sessionStorage.getItem('roleUser') !== 'petugas') {
        window.location.replace('index.html#masuk');
        return;
    }

    try {
        const sb = window.supabase;

        if (!sb) {
            throw new Error('Supabase belum siap. Muat ulang halaman.');
        }

        const { data: authData, error: authError } = await sb.auth.getUser();

        if (authError || !authData.user) {
            sessionStorage.clear();
            window.location.replace('index.html#masuk');
            return;
        }

        const { data: profile, error: profileError } = await sb
            .from('profiles')
            .select('id, full_name, role, department, nip')
            .eq('id', authData.user.id)
            .single();

        if (profileError) throw profileError;

        if (!['officer', 'admin'].includes(profile.role)) {
            await sb.auth.signOut();
            sessionStorage.clear();
            window.location.replace('index.html#masuk');
            return;
        }

        adminProfile = {
            id: profile.id,
            name: profile.full_name || 'Petugas',
            role: profile.role,
            department: profile.department || 'Petugas PINTAR',
            nip: profile.nip || ''
        };

        sessionStorage.setItem('namaUser', adminProfile.name);
        sessionStorage.setItem('deptOfficer', adminProfile.department);
        sessionStorage.setItem('staffRole', adminProfile.role);

        if ($('adminDept')) {
            $('adminDept').innerText = adminProfile.department;
        }

        const clearButtons = document.querySelectorAll('button[onclick*="openClearModal"]');
        clearButtons.forEach(button => {
            button.disabled = adminProfile.role !== 'admin';
            button.title = adminProfile.role === 'admin'
                ? ''
                : 'Hanya admin yang dapat menghapus tiket.';
        });

        ticketDatabase = {};
        await loadAdminData();
        loadAdminNewsData();
        subscribeToAdminTickets();
    } catch (err) {
        console.error('Inisialisasi panel petugas gagal:', err);
        toast(err.message || 'Panel petugas gagal dimuat.', true);
    }
}

async function loadAdminTicketsFromSupabase() {
    if (!adminProfile || !window.supabase) {
        throw new Error('Sesi petugas Supabase tidak ditemukan.');
    }

    const sb = window.supabase;

    const { data: rows, error } = await sb
        .from('tickets')
        .select('*')
        .order('created_at', { ascending: false });

    if (error) throw error;

    const ticketIds = (rows || []).map(row => row.id);
    const userIds = [...new Set((rows || []).map(row => row.user_id).filter(Boolean))];

    let profileRows = [];
    let historyRows = [];
    let feedbackRows = [];

    const requests = [];

    if (userIds.length) {
        requests.push(
            sb.from('profiles')
                .select('id, nik')
                .in('id', userIds)
                .then(result => {
                    if (result.error) throw result.error;
                    profileRows = result.data || [];
                })
        );
    }

    if (ticketIds.length) {
        requests.push(
            sb.from('ticket_history')
                .select('ticket_id, old_status, new_status, note, created_at')
                .in('ticket_id', ticketIds)
                .order('created_at', { ascending: true })
                .then(result => {
                    if (result.error) throw result.error;
                    historyRows = result.data || [];
                })
        );

        requests.push(
            sb.from('feedback')
                .select('ticket_id, rating, tags, comment, submitted_at')
                .in('ticket_id', ticketIds)
                .then(result => {
                    if (result.error) throw result.error;
                    feedbackRows = result.data || [];
                })
        );
    }

    await Promise.all(requests);

    const profileById = new Map(profileRows.map(profile => [profile.id, profile]));
    const historyByTicket = new Map();

    historyRows.forEach(item => {
        if (!historyByTicket.has(item.ticket_id)) {
            historyByTicket.set(item.ticket_id, []);
        }

        historyByTicket.get(item.ticket_id).push({
            status: item.new_status,
            at: dateToMillis(item.created_at),
            note: item.note || ''
        });
    });

    const feedbackByTicket = new Map(feedbackRows.map(item => [item.ticket_id, {
        rating: item.rating,
        tags: item.tags || [],
        comment: item.comment || '',
        submittedAt: dateToMillis(item.submitted_at)
    }]));

    const nextDatabase = {};

    await Promise.all((rows || []).map(async row => {
        let imageData = null;
        let resultImage = null;

        if (row.image_path) {
            const { data, error: imageError } = await sb.storage
                .from('ticket-evidence')
                .createSignedUrl(row.image_path, 3600);

            if (!imageError) imageData = data?.signedUrl || null;
        }

        if (row.result_image_path) {
            const { data, error: resultError } = await sb.storage
                .from('ticket-results')
                .createSignedUrl(row.result_image_path, 3600);

            if (!resultError) resultImage = data?.signedUrl || null;
        }

        const profile = profileById.get(row.user_id);

        nextDatabase[row.ticket_code] = {
            id: row.id,
            userId: row.user_id,
            name: row.applicant_name,
            nik: profile?.nik || '',
            type: row.service_type,
            desc: row.description,
            location: row.location,
            geo: row.latitude != null && row.longitude != null
                ? {
                    lat: Number(row.latitude),
                    lng: Number(row.longitude)
                }
                : null,
            facilityName: row.facility_name,
            damageType: row.damage_type,
            familyHead: row.family_head,
            bansosProgram: row.bansos_program,
            bansosIssue: row.bansos_issue,
            docType: row.document_type,
            imagePath: row.image_path,
            imageData,
            resultImagePath: row.result_image_path,
            resultImage,
            status: row.status,
            officer: row.officer_department || 'Petugas PINTAR',
            adminNote: row.admin_note,
            cancelReason: row.cancel_reason,
            cancelledAt: dateToMillis(row.cancelled_at),
            finishedAt: dateToMillis(row.finished_at),
            eta: row.eta,
            createdAt: dateToMillis(row.created_at),
            history: historyByTicket.get(row.id) || [],
            feedback: feedbackByTicket.get(row.id) || null
        };
    }));

    ticketDatabase = nextDatabase;
}

function subscribeToAdminTickets() {
    if (!adminProfile || !window.supabase) return;

    if (adminTicketsChannel) {
        window.supabase.removeChannel(adminTicketsChannel);
    }

    adminTicketsChannel = window.supabase
        .channel('admin-ticket-updates')
        .on('postgres_changes', {
            event: '*',
            schema: 'public',
            table: 'tickets'
        }, async payload => {
            const isNew = payload.eventType === 'INSERT';

            try {
                await loadAdminTicketsFromSupabase();
                renderAdminData();

                if (isNew && payload.new?.ticket_code) {
                    toast(`Laporan baru masuk: ${payload.new.ticket_code}`);
                }
            } catch (err) {
                console.error('Pembaruan antrean realtime gagal:', err);
            }
        })
        .subscribe();
}

function switchAdminTab(tab) {
    $('tabAdmTicketsBtn').classList.toggle('active', tab === 'tickets');
    $('tabAdmNewsBtn').classList.toggle('active', tab === 'news');

    $('admSectionTickets').hidden = (tab !== 'tickets');
    $('admSectionNews').hidden = (tab !== 'news');

    if (tab === 'news') {
        loadAdminNewsData();
    }
}

let adminFilter = 'all';

function setAdminFilter(f) {
    adminFilter = f;

    document.querySelectorAll('.adm-filter').forEach(b => {
        b.classList.toggle('active', b.dataset.filter === f);
    });

    loadAdminData();
}

async function loadAdminData() {
    const tbody = $('adminTableBody');

    if (!tbody) return;

    if (adminProfile && !adminDataLoading) {
        adminDataLoading = true;

        try {
            await loadAdminTicketsFromSupabase();
        } catch (err) {
            console.error('Gagal memuat tiket dari Supabase:', err);
            toast(err.message || 'Data tiket gagal dimuat dari Supabase.', true);
        } finally {
            adminDataLoading = false;
        }
    }

    renderAdminData();
}

function renderAdminData() {
    const tbody = $('adminTableBody');

    if (!tbody) {
        return;
    }

    const all = Object.entries(ticketDatabase).reverse();
    const n = st => all.filter(([, t]) => t.status === st).length;
    const set = (id, v) => {
        if ($(id)) {
            $(id).innerText = v;
        }
    };

    set('cntAll', all.length);
    set('cntNew', n('Baru Diterima'));
    set('cntRun', n('Sedang Diproses'));
    set('cntDone', n('Selesai'));
    set('cntBad', n('Ditolak'));
    set('cntCancel', n('Dibatalkan'));

    set(
        'admLead',
        n('Baru Diterima')
            ? `${n('Baru Diterima')} tiket baru menunggu verifikasi.`
            : n('Sedang Diproses')
                ? `${n('Sedang Diproses')} tiket sedang diproses.`
                : 'Tidak ada tiket yang menunggu.'
    );

    const feedbacks = all.map(([, t]) => t.feedback).filter(Boolean);

    if (feedbacks.length > 0) {
        const avg = (
            feedbacks.reduce((sum, f) => sum + (f.rating || 5), 0) /
            feedbacks.length
        ).toFixed(1);

        set('ikmScore', `${avg} / 5.0`);
        set('ikmCount', `${feedbacks.length} ulasan`);
    } else {
        set('ikmScore', '5.0 / 5.0');
        set('ikmCount', '0 ulasan');
    }

    const entries = adminFilter === 'all'
        ? all
        : all.filter(([, t]) => t.status === adminFilter);

    if (!entries.length) {
        tbody.innerHTML = `<tr><td colspan="6" class="adm-empty">${all.length ? 'Tidak ada tiket dengan status ini.' : 'Belum ada laporan masuk.'}</td></tr>`;
        return;
    }

    tbody.innerHTML = entries.map(([code, item]) => {
        const finished = (
            item.status === 'Selesai' ||
            item.status === 'Ditolak' ||
            item.status === 'Dibatalkan'
        );

        const img = item.imageData
            ? `<img class="thumb" src="${item.imageData}" onclick="previewImage(this.src)" alt="Foto bukti ${code}" title="Klik untuk memperbesar">`
            : `<span class="adm-muted">Tanpa foto</span>`;

        const note = item.adminNote
            ? `<div class="adm-muted" style="margin-top:6px;">Catatan: ${esc(item.adminNote)}</div>`
            : '';

        const cancelNote = item.cancelReason
            ? `<div class="adm-muted" style="margin-top:6px; color:var(--bad);">Batal: ${esc(item.cancelReason)}</div>`
            : '';

        const geoBadge = (item.geo && item.geo.lat)
            ? `<div class="adm-muted"><i class="ph ph-map-pin"></i> ${item.geo.lat}, ${item.geo.lng}</div>`
            : '';

        const feedbackBadge = item.feedback ? `
            <div style="margin-top:6px; background:#fef3c7; border:1px solid #fde68a; color:#92400e; padding:4px 8px; border-radius:6px; font-size:0.75rem;">
                <strong><i class="ph ph-star-fill"></i> ${item.feedback.rating}/5</strong>
                ${item.feedback.comment ? `"${esc(item.feedback.comment)}"` : '(Tanpa catatan)'}
                ${item.feedback.tags && item.feedback.tags.length ? `<div style="font-size:0.7rem; color:#b45309; margin-top:2px;">${item.feedback.tags.join(', ')}</div>` : ''}
            </div>`
            : '';

        return `<tr class="${kOf(code)}">
            <td data-label="Tiket">
                <span class="adm-code">${code}</span>
                <div class="adm-muted">${fmtDate(item.createdAt)}</div>
            </td>
            <td data-label="Pelapor">
                <strong>${esc(item.name)}</strong>
                <div class="adm-muted adm-mono">${esc(item.nik)}</div>
            </td>
            <td data-label="Laporan">
                <strong>${esc(item.type)}</strong>
                ${item.facilityName ? `<div class="adm-muted">${esc(item.facilityName)} (${esc(item.damageType || '')})</div>` : ''}
                <div class="adm-desc">${esc(item.desc)}</div>
                <span class="adm-loc"><i class="ph ph-map-pin"></i>${esc(item.location)}</span>
                ${geoBadge}
            </td>
            <td data-label="Foto">${img}</td>
            <td data-label="Status">${badge(item.status)}${note}${cancelNote}${feedbackBadge}</td>
            <td data-label="Aksi">
                <div class="adm-btns">
                    <button class="btn btn-secondary btn-sm" ${item.status !== 'Baru Diterima' ? 'disabled' : ''} onclick="updateStatus('${code}', 'Sedang Diproses')">Proses</button>
                    <button class="btn btn-ok btn-sm" ${finished ? 'disabled' : ''} onclick="updateStatus('${code}', 'Selesai')">Selesai</button>
                    <button class="btn btn-bad btn-sm" ${finished ? 'disabled' : ''} onclick="updateStatus('${code}', 'Ditolak')">Tolak</button>
                </div>
            </td>
        </tr>`;
    }).join('');
}

function previewImage(src) {
    if ($('modalPreviewImg')) {
        $('modalPreviewImg').src = src;
    }

    if ($('imagePreviewModal')) {
        $('imagePreviewModal').classList.add('active');
    }
}

function closeImageModal() {
    if ($('imagePreviewModal')) {
        $('imagePreviewModal').classList.remove('active');
    }
}

let pendingStatus = null;

function updateStatus(code, newStatus) {
    if (!ticketDatabase[code]) return;

    if (newStatus === 'Sedang Diproses') {
        applyStatus(code, newStatus, '', null);
        return;
    }

    pendingStatus = {
        code,
        status: newStatus
    };

    const done = newStatus === 'Selesai';

    $('statusModalTitle').innerText = (done ? 'Selesaikan tiket #' : 'Tolak tiket #') + code;
    $('statusNoteLabel').innerText = done
        ? 'Catatan penyelesaian (dilihat warga)'
        : 'Alasan penolakan (dilihat warga)';

    $('statusFileWrap').hidden = !done;
    $('statusNote').value = '';
    $('statusFile').value = '';
    $('statusError').innerText = '';

    $('statusModal').classList.add('active');
    $('statusNote').focus();
}

function closeStatusModal() {
    $('statusModal').classList.remove('active');
    pendingStatus = null;
}

async function confirmStatus(e) {
    e.preventDefault();

    if (!pendingStatus) return;

    const note = $('statusNote').value.trim();
    const file = $('statusFile').files[0];

    if (note.length < 5) {
        $('statusError').innerText = 'Tulis catatan minimal 5 karakter.';
        return;
    }

    if (file && (!/^image\/(png|jpeg)$/.test(file.type) || file.size > 4 * 1048576)) {
        $('statusError').innerText = 'Foto harus JPG/PNG maksimal 4 MB.';
        return;
    }

    const submitButton = $('statusModal').querySelector('button[type="submit"]');
    const { code, status } = pendingStatus;

    if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerText = 'Menyimpan...';
    }

    try {
        const photo = file && status === 'Selesai'
            ? await compressImage(file)
            : null;

        if (file && status === 'Selesai' && !photo) {
            throw new Error('Foto hasil penanganan gagal diproses.');
        }

        const saved = await applyStatus(code, status, note, photo);

        if (saved) closeStatusModal();
    } catch (err) {
        console.error('Pembaruan status gagal:', err);
        $('statusError').innerText = err.message || 'Status gagal diperbarui.';
    } finally {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerText = 'Simpan & kirim ke warga';
        }
    }
}

async function applyStatus(code, status, note, resultImage) {
    const t = ticketDatabase[code];
    const sb = window.supabase;

    if (!t || !t.id || !adminProfile || !sb) {
        toast('Data tiket atau sesi petugas tidak ditemukan.', true);
        return false;
    }

    let uploadedPath = null;

    try {
        const updatePayload = {
            status,
            officer_department: adminProfile.department
        };

        if (status === 'Selesai' || status === 'Ditolak') {
            updatePayload.admin_note = note;
            updatePayload.finished_at = new Date().toISOString();
        }

        if (resultImage) {
            const imageBlob = await fetch(resultImage).then(response => response.blob());
            const extension = imageBlob.type === 'image/png' ? 'png' : 'jpg';
            uploadedPath = `${adminProfile.id}/${code}-${Date.now()}.${extension}`;

            const { error: uploadError } = await sb.storage
                .from('ticket-results')
                .upload(uploadedPath, imageBlob, {
                    contentType: imageBlob.type || 'image/jpeg',
                    cacheControl: '3600',
                    upsert: false
                });

            if (uploadError) throw uploadError;

            updatePayload.result_image_path = uploadedPath;
        }

        const { error: updateError } = await sb
            .from('tickets')
            .update(updatePayload)
            .eq('id', t.id);

        if (updateError) throw updateError;

        await loadAdminTicketsFromSupabase();
        renderAdminData();

        toast(`Tiket ${code}: ${status}. Perubahan tersimpan di Supabase.`);
        return true;
    } catch (err) {
        if (uploadedPath) {
            try {
                await sb.storage.from('ticket-results').remove([uploadedPath]);
            } catch (cleanupError) {
                console.warn('Pembersihan foto hasil gagal:', cleanupError);
            }
        }

        console.error('Penyimpanan status ke Supabase gagal:', err);
        toast(err.message || 'Status gagal disimpan.', true);
        return false;
    }
}

function compressImage(file) {
    return new Promise(resolve => {
        const img = new Image();

        img.onload = () => {
            const r = Math.min(1, 800 / Math.max(img.width, img.height));
            const c = document.createElement('canvas');

            c.width = Math.round(img.width * r);
            c.height = Math.round(img.height * r);

            c.getContext('2d').drawImage(img, 0, 0, c.width, c.height);

            resolve(c.toDataURL('image/jpeg', 0.7));
            URL.revokeObjectURL(img.src);
        };

        img.onerror = () => {
            resolve(null);
            URL.revokeObjectURL(img.src);
        };

        img.src = URL.createObjectURL(file);
    });
}

function loadAdminNewsData() {
    const tbody = $('adminNewsTableBody');

    if (!tbody) {
        return;
    }

    const list = loadNewsList();

    if (!list.length) {
        tbody.innerHTML = `<tr><td colspan="6" class="adm-empty">Belum ada berita informasi publik yang dibuat.</td></tr>`;
        return;
    }

    tbody.innerHTML = list.map(item => {
        const hasBefore = item.imgBefore
            ? `<img class="thumb" src="${item.imgBefore}" onclick="previewImage(this.src)" title="Foto Sebelum">`
            : '';

        const hasAfter = item.imgAfter
            ? `<img class="thumb" src="${item.imgAfter}" onclick="previewImage(this.src)" title="Foto Sesudah">`
            : '';

        const docs = (hasBefore || hasAfter)
            ? `<div style="display:flex; gap:6px;">${hasBefore}${hasAfter}</div>`
            : '<span class="adm-muted">Tanpa foto</span>';

        const ref = item.ticketRef
            ? `<span class="adm-code">#${item.ticketRef}</span>`
            : '<span class="adm-muted">-</span>';

        return `<tr>
            <td data-label="Tanggal"><span class="adm-muted">${fmtDate(item.publishedAt)}</span></td>
            <td data-label="Judul & Kategori">
                <strong>${esc(item.title)}</strong>
                <div class="adm-muted"><span class="chip">${esc(item.category)}</span> · ${esc(item.author || 'Petugas')}</div>
            </td>
            <td data-label="Keterangan">
                <div class="adm-desc" style="-webkit-line-clamp:2; display:-webkit-box; -webkit-box-orient:vertical; overflow:hidden;">${esc(item.desc)}</div>
            </td>
            <td data-label="Dokumentasi">${docs}</td>
            <td data-label="Referensi">${ref}</td>
            <td data-label="Aksi">
                <div class="adm-btns">
                    <button class="btn btn-secondary btn-sm" onclick="editNewsItem('${item.id}')"><i class="ph ph-pencil-simple"></i> Edit</button>
                    <button class="btn btn-bad btn-sm" onclick="deleteNewsItem('${item.id}')"><i class="ph ph-trash"></i> Hapus</button>
                </div>
            </td>
        </tr>`;
    }).join('');
}

function openCreateNewsModal() {
    $('newsFormModalTitle').innerText = 'Buat Berita Informasi Publik';
    $('adminNewsId').value = '';
    $('adminNewsTitle').value = '';
    $('adminNewsCat').value = 'Fasilitas Umum';
    $('adminNewsDesc').value = '';
    $('adminNewsImgBefore').value = '';
    $('adminNewsImgAfter').value = '';
    $('adminNewsBeforeStatus').innerText = 'Maksimal 4 MB';
    $('adminNewsAfterStatus').innerText = 'Maksimal 4 MB';
    $('errAdminNewsTitle').innerText = '';
    $('errAdminNewsDesc').innerText = '';

    const refSelect = $('adminNewsTicketRef');

    refSelect.innerHTML = '<option value="">-- Tanpa Tautan Tiket --</option>' +
        Object.entries(ticketDatabase).map(([c, t]) =>
            `<option value="${c}">Tiket #${c} - ${esc(t.type)} (${t.status})</option>`
        ).join('');

    $('newsFormModal').classList.add('active');
}

function closeNewsFormModal() {
    $('newsFormModal').classList.remove('active');
}

function editNewsItem(id) {
    const item = loadNewsList().find(n => n.id === id);

    if (!item) {
        return;
    }

    openCreateNewsModal();

    $('newsFormModalTitle').innerText = 'Edit Berita Informasi Publik';
    $('adminNewsId').value = item.id;
    $('adminNewsTitle').value = item.title;
    $('adminNewsCat').value = item.category;
    $('adminNewsDesc').value = item.desc;
    $('adminNewsTicketRef').value = item.ticketRef || '';

    if (item.imgBefore) {
        $('adminNewsBeforeStatus').innerText = 'Foto tersimpan (pilih baru jika ingin mengganti)';
    }

    if (item.imgAfter) {
        $('adminNewsAfterStatus').innerText = 'Foto tersimpan (pilih baru jika ingin mengganti)';
    }
}

function deleteNewsItem(id) {
    if (!confirm('Hapus berita ini dari informasi publik? Seluruh warga tidak akan melihatnya lagi.')) {
        return;
    }

    newsDatabase = loadNewsList().filter(item => item.id !== id);

    saveNewsDatabase();
    toast('Berita berhasil dihapus.');
    loadAdminNewsData();
}

async function handleSaveNews(e) {
    e.preventDefault();

    const title = $('adminNewsTitle').value.trim();
    const desc = $('adminNewsDesc').value.trim();
    const cat = $('adminNewsCat').value;
    const ticketRef = $('adminNewsTicketRef').value;
    const id = $('adminNewsId').value;

    let valid = true;

    if (title.length < 5) {
        $('errAdminNewsTitle').innerText = 'Judul minimal 5 karakter.';
        valid = false;
    } else {
        $('errAdminNewsTitle').innerText = '';
    }

    if (desc.length < 15) {
        $('errAdminNewsDesc').innerText = 'Deskripsi berita minimal 15 karakter.';
        valid = false;
    } else {
        $('errAdminNewsDesc').innerText = '';
    }

    if (!valid) {
        return;
    }

    const fileBefore = $('adminNewsImgBefore').files[0];
    const fileAfter = $('adminNewsImgAfter').files[0];

    const btn = $('btnSaveNews');

    btn.disabled = true;
    btn.innerText = 'Menyimpan...';

    let list = loadNewsList();
    let existing = id ? list.find(n => n.id === id) : null;

    let imgBeforeData = existing ? existing.imgBefore : '';
    let imgAfterData = existing ? existing.imgAfter : '';

    if (fileBefore) {
        imgBeforeData = await compressImage(fileBefore);
    }

    if (fileAfter) {
        imgAfterData = await compressImage(fileAfter);
    }

    const officerDept = sessionStorage.getItem('deptOfficer') || 'Petugas PINTAR';

    if (existing) {
        existing.title = title;
        existing.category = cat;
        existing.desc = desc;
        existing.ticketRef = ticketRef;
        existing.imgBefore = imgBeforeData;
        existing.imgAfter = imgAfterData;
        existing.author = officerDept;
    } else {
        list.unshift({
            id: 'news-' + Date.now(),
            title,
            category: cat,
            desc,
            ticketRef,
            imgBefore: imgBeforeData,
            imgAfter: imgAfterData,
            author: officerDept,
            publishedAt: Date.now()
        });
    }

    try {
        newsDatabase = list;
        saveNewsDatabase();

        btn.disabled = false;
        btn.innerText = 'Publikasikan Berita';

        closeNewsFormModal();
        toast('Berita publik berhasil diterbitkan.');
        loadAdminNewsData();
    } catch {
        btn.disabled = false;
        btn.innerText = 'Publikasikan Berita';

        toast('Penyimpanan penuh. Kurangi ukuran foto berita.', true);
    }
}

let clearMode = null;

const isFinished = t => (
    t.status === 'Selesai' ||
    t.status === 'Ditolak' ||
    t.status === 'Dibatalkan'
);

function openClearModal(mode) {
    if (!adminProfile || adminProfile.role !== 'admin') {
        toast('Hanya admin yang dapat menghapus tiket.', true);
        return;
    }

    const entries = Object.entries(ticketDatabase);
    const targets = mode === 'all'
        ? entries
        : entries.filter(([, t]) => isFinished(t));

    if (!targets.length) {
        toast('Tidak ada tiket yang bisa dihapus.', true);
        return;
    }

    clearMode = mode;

    const active = mode === 'all' && entries.some(([, t]) => !isFinished(t));

    $('clearTitle').innerText = mode === 'all'
        ? 'Hapus semua pengajuan'
        : 'Hapus pengajuan yang sudah selesai/ditolak/dibatalkan';

    $('clearInfo').innerText = `${targets.length} tiket akan dihapus permanen${active ? ', termasuk tiket yang masih berjalan' : ''}. Warga tidak akan bisa melihatnya lagi.`;

    $('clearConfirmWrap').hidden = mode !== 'all';
    $('clearConfirm').value = '';
    $('clearError').innerText = '';

    $('clearModal').classList.add('active');
}

function closeClearModal() {
    $('clearModal').classList.remove('active');
    clearMode = null;
}

function downloadBackup() {
    const blob = new Blob(
        [JSON.stringify(ticketDatabase, null, 2)],
        { type: 'application/json' }
    );

    const a = document.createElement('a');

    a.href = URL.createObjectURL(blob);
    a.download = `pintar-tiket-${new Date().toISOString().slice(0, 10)}.json`;

    a.click();
    URL.revokeObjectURL(a.href);
}

async function confirmClear(e) {
    e.preventDefault();

    if (!adminProfile || adminProfile.role !== 'admin' || !window.supabase) {
        $('clearError').innerText = 'Hanya admin yang dapat menghapus tiket.';
        return;
    }

    if (
        clearMode === 'all' &&
        $('clearConfirm').value.trim().toUpperCase() !== 'HAPUS'
    ) {
        $('clearError').innerText = 'Ketik HAPUS untuk melanjutkan.';
        return;
    }

    const targets = Object.entries(ticketDatabase).filter(([, ticket]) =>
        clearMode === 'all' || isFinished(ticket)
    );

    const ids = targets.map(([, ticket]) => ticket.id).filter(Boolean);

    if (!ids.length) {
        $('clearError').innerText = 'Tidak ada tiket yang dapat dihapus.';
        return;
    }

    const submitButton = $('clearModal').querySelector('button[type="submit"]');

    if (submitButton) {
        submitButton.disabled = true;
        submitButton.innerText = 'Menghapus...';
    }

    try {
        const { error } = await window.supabase
            .from('tickets')
            .delete()
            .in('id', ids);

        if (error) throw error;

        const evidencePaths = targets.map(([, ticket]) => ticket.imagePath).filter(Boolean);
        const resultPaths = targets.map(([, ticket]) => ticket.resultImagePath).filter(Boolean);

        if (evidencePaths.length) {
            await window.supabase.storage.from('ticket-evidence').remove(evidencePaths);
        }

        if (resultPaths.length) {
            await window.supabase.storage.from('ticket-results').remove(resultPaths);
        }

        if (clearMode === 'all') {
            localStorage.removeItem('pintar_seen_v1');
        }

        closeClearModal();
        await loadAdminData();
        toast(`${ids.length} tiket berhasil dihapus dari Supabase.`);
    } catch (err) {
        console.error('Penghapusan tiket gagal:', err);
        $('clearError').innerText = err.message || 'Tiket gagal dihapus.';
    } finally {
        if (submitButton) {
            submitButton.disabled = false;
            submitButton.innerText = 'Hapus permanen';
        }
    }
}

function onCitizenDataChanged(old) {
    const user = getUser();

    myTickets().forEach(([code, t]) => {
        if (old[code] && old[code].status !== t.status) {
            toast(`Tiket ${code} kini: ${t.status}`);
        }
    });

    renderHome();
    renderMyTickets();

    const open = $('ticketInput').value.trim().toUpperCase();

    if (open && !$('trackResult').hidden) {
        if (ticketDatabase[open] && (currentCitizenProfile ? ticketDatabase[open].userId === currentCitizenProfile.id : ticketDatabase[open].nik === user.nik)) {
            trackTicket();
        } else {
            $('trackResult').hidden = true;
            $('trackEmpty').hidden = false;
            toast(`Tiket ${open} sudah dihapus oleh petugas.`, true);
        }
    }
}

window.addEventListener('storage', e => {
    if ($('view-beranda') && e.key === 'pintar_tickets_v4') {
        return;
    }

    if (e.key === 'pintar_tickets_v4') {
        const old = ticketDatabase;
        ticketDatabase = JSON.parse(e.newValue) || {};

        if ($('adminTableBody')) {
            loadAdminData();
        } else if ($('view-beranda')) {
            onCitizenDataChanged(old);
        }
    } else if (e.key === 'pintar_news_v1') {
        if ($('adminNewsTableBody')) {
            loadAdminNewsData();
        }

        if ($('newsGridList')) {
            renderNewsCards();
        }
    }
});

const CLOUD_SYNC = {
    enabled: true,
    baseUrl: 'https://kvdb.io/GHRXtWpZqV3NZBkXjvx4pn',
    ticketsUrl: 'https://kvdb.io/GHRXtWpZqV3NZBkXjvx4pn/pintar_tickets',
    newsUrl: 'https://kvdb.io/GHRXtWpZqV3NZBkXjvx4pn/pintar_news',
    lastTicketsHash: '',
    lastNewsHash: '',
    isPushingTickets: false,
    isPushingNews: false
};

async function pushTicketsToCloud() {
    if ($('view-beranda') || $('adminTableBody') || !CLOUD_SYNC.enabled || CLOUD_SYNC.isPushingTickets) {
        return;
    }

    CLOUD_SYNC.isPushingTickets = true;

    try {
        const payload = JSON.stringify(ticketDatabase);

        CLOUD_SYNC.lastTicketsHash = payload;

        await fetch(CLOUD_SYNC.ticketsUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: payload
        });
    } catch (err) {
    } finally {
        CLOUD_SYNC.isPushingTickets = false;
    }
}

async function pullTicketsFromCloud() {
    if ($('view-beranda') || $('adminTableBody') || !CLOUD_SYNC.enabled || CLOUD_SYNC.isPushingTickets) {
        return;
    }

    try {
        const res = await fetch(`${CLOUD_SYNC.ticketsUrl}?_t=${Date.now()}`);

        if (!res.ok) {
            return;
        }

        const text = await res.text();

        if (!text || text === CLOUD_SYNC.lastTicketsHash) {
            return;
        }

        const remote = JSON.parse(text);

        if (!remote || typeof remote !== 'object') {
            return;
        }

        const currentLocalStr = JSON.stringify(ticketDatabase);

        if (text !== currentLocalStr) {
            const old = Object.assign({}, ticketDatabase);

            if ($('adminTableBody')) {
                const oldKeys = Object.keys(old);
                const newKeys = Object.keys(remote);
                const freshlyAdded = newKeys.filter(k => !oldKeys.includes(k));

                if (freshlyAdded.length > 0 && oldKeys.length > 0) {
                    const firstCode = freshlyAdded[0];

                    toast(`🔔 Laporan baru masuk: ${firstCode} (${remote[firstCode].type || 'Warga'})`);
                }
            }

            ticketDatabase = remote;
            CLOUD_SYNC.lastTicketsHash = text;

            localStorage.setItem('pintar_tickets_v4', text);

            if ($('adminTableBody')) {
                loadAdminData();
            } else if ($('view-beranda')) {
                onCitizenDataChanged(old);
            }
        }
    } catch (err) {
    }
}

async function pushNewsToCloud() {
    if (!CLOUD_SYNC.enabled || CLOUD_SYNC.isPushingNews) {
        return;
    }

    CLOUD_SYNC.isPushingNews = true;

    try {
        const payload = JSON.stringify(newsDatabase);

        CLOUD_SYNC.lastNewsHash = payload;

        await fetch(CLOUD_SYNC.newsUrl, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: payload
        });
    } catch (err) {
    } finally {
        CLOUD_SYNC.isPushingNews = false;
    }
}

async function pullNewsFromCloud() {
    if (!CLOUD_SYNC.enabled || CLOUD_SYNC.isPushingNews) {
        return;
    }

    try {
        const res = await fetch(`${CLOUD_SYNC.newsUrl}?_t=${Date.now()}`);

        if (!res.ok) {
            return;
        }

        const text = await res.text();

        if (!text || text === CLOUD_SYNC.lastNewsHash) {
            return;
        }

        const remote = JSON.parse(text);

        if (!Array.isArray(remote)) {
            return;
        }

        const currentLocalStr = JSON.stringify(newsDatabase);

        if (text !== currentLocalStr) {
            newsDatabase = remote;
            CLOUD_SYNC.lastNewsHash = text;

            localStorage.setItem('pintar_news_v1', text);

            if ($('adminNewsTableBody')) {
                loadAdminNewsData();
            }

            if ($('newsGridList')) {
                renderNewsCards();
            }
        }
    } catch (err) {
    }
}

setInterval(() => {
    if (document.hidden) {
        return;
    }

    pullTicketsFromCloud();
    pullNewsFromCloud();
}, 3000);

window.addEventListener('focus', () => {
    pullTicketsFromCloud();
    pullNewsFromCloud();
});

document.addEventListener('visibilitychange', () => {
    if (!document.hidden) {
        pullTicketsFromCloud();
        pullNewsFromCloud();
    }
});

if (typeof window !== 'undefined') {
    pullTicketsFromCloud();
    pullNewsFromCloud();
}
