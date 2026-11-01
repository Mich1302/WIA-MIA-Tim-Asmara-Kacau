const AUTH = {
    salt: 'pintar-salt-v1',
    admins: [
        { nip: '198204152006041003', hash: 905de95d4ce53ee46cbe27fd4f8f5e5fb53656fbd7431499b2beee415895dbb2' }
    ],
    maxTries: 5,          // salah sandi berturut-turut sebelum dikunci
    lockMs: 60 * 1000     // lama kunci
};

async function hashPassword(password) {
    const bytes = new TextEncoder().encode(AUTH.salt + ':' + password);
    const digest = await crypto.subtle.digest('SHA-256', bytes);
    return Array.from(new Uint8Array(digest)).map(b => b.toString(16).padStart(2, '0')).join('');
}

const el = id => document.getElementById(id);
function showAuthError(sectionId, message) {
    const form = el(sectionId).querySelector('form');
    let box = form.querySelector('.auth-error');
    if (!box) {
        box = document.createElement('p');
        box.className = 'auth-error';
        box.setAttribute('role', 'alert');
        form.querySelector('.btn-submit').before(box);
    }
    box.textContent = message;
}

const SEED_ACCOUNTS = { '3171021405880004': { name: 'Budi Santoso' } };
function loadAccounts() {
    try { return Object.assign({}, SEED_ACCOUNTS, JSON.parse(localStorage.getItem('pintar_accounts')) || {}); }
    catch (err) { return Object.assign({}, SEED_ACCOUNTS); }
}

function handleCitizenLogin(e) {
    e.preventDefault();
    const name = el('citizenName').value.trim().replace(/\s+/g, ' ');
    const nik = el('citizenNik').value.replace(/\D/g, '');
    if (name.length < 3) return showAuthError('citizenSection', 'Nama minimal 3 huruf.');
    if (nik.length !== 16) return showAuthError('citizenSection', 'NIK harus terdiri dari tepat 16 digit angka.');

    const accounts = loadAccounts();
    const known = accounts[nik];
    if (known && known.name.toLowerCase() !== name.toLowerCase()) {
        return showAuthError('citizenSection', 'NIK ini sudah terdaftar atas nama lain. Periksa nama sesuai KTP.');
    }
    if (!known) {
        accounts[nik] = { name: name, createdAt: Date.now() };
        localStorage.setItem('pintar_accounts', JSON.stringify(accounts));
    }

    /* Mulai bersih: hapus sisa sesi orang sebelumnya, lalu isi sesi baru */
    sessionStorage.clear();
    sessionStorage.setItem('namaUser', accounts[nik].name);
    sessionStorage.setItem('nikUser', nik);
    sessionStorage.setItem('roleUser', 'warga');
    window.location.href = 'warga.html';
}

/* ---------- Petugas: NIP + sandi (dibandingkan lewat hash) ---------- */
async function handleOfficerLogin(e) {
    e.preventDefault();
    const nip = el('officerNip').value.replace(/\D/g, '');
    const password = el('officerPass').value;
    const dept = el('officerDept').value;

    const lockedUntil = Number(localStorage.getItem('pintar_admin_lock') || 0);
    if (Date.now() < lockedUntil) {
        const sec = Math.ceil((lockedUntil - Date.now()) / 1000);
        return showAuthError('officerSection', 'Terlalu banyak percobaan. Coba lagi dalam ' + sec + ' detik.');
    }
    if (!window.crypto || !crypto.subtle) {
        return showAuthError('officerSection', 'Browser tidak mendukung verifikasi sandi. Buka lewat Live Server (localhost).');
    }

    const account = AUTH.admins.find(a => a.nip === nip);
    const ok = account && account.hash === await hashPassword(password);
    if (!ok) {
        const tries = Number(localStorage.getItem('pintar_admin_tries') || 0) + 1;
        if (tries >= AUTH.maxTries) {
            localStorage.setItem('pintar_admin_lock', String(Date.now() + AUTH.lockMs));
            localStorage.setItem('pintar_admin_tries', '0');
            return showAuthError('officerSection', 'Terlalu banyak percobaan. Akses dikunci selama 1 menit.');
        }
        localStorage.setItem('pintar_admin_tries', String(tries));
        return showAuthError('officerSection', 'NIP atau kata sandi salah. Sisa percobaan: ' + (AUTH.maxTries - tries) + '.');
    }

    localStorage.removeItem('pintar_admin_tries');
    sessionStorage.clear();
    sessionStorage.setItem('nipOfficer', nip);
    sessionStorage.setItem('deptOfficer', dept);
    sessionStorage.setItem('roleUser', 'petugas');
    window.location.href = 'admin.html';
}

/* Tombol "Isi Akun Petugas" tidak lagi mengisi sandi, supaya sandi tidak terbaca siapa pun */
function fillDemoOfficer() {
    el('officerNip').value = AUTH.admins[0].nip;
    el('officerPass').focus();
}
