const AUTH = {
    admins: [
        { nip: '198204152006041001', name: 'Admin 1', password: 'admin123' },
        { nip: '198204152006041002', name: 'Admin 2', password: 'admin123' },
        { nip: '198204152006041003', name: 'Admin 3', password: 'admin123' }
    ],
    maxTries: 10,          
    lockMs: 30 * 1000     
};

try {
    localStorage.removeItem('pintar_admin_lock');
    localStorage.removeItem('pintar_admin_tries');
} catch {}

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

const SEED_ACCOUNTS = { '3171021405880004': { name: 'Agus Santoso' } };
const CLOUD_ACCOUNTS_URL = 'https://kvdb.io/GHRXtWpZqV3NZBkXjvx4pn/pintar_accounts';

function loadAccounts() {
    try { return Object.assign({}, SEED_ACCOUNTS, JSON.parse(localStorage.getItem('pintar_accounts')) || {}); }
    catch (err) { return Object.assign({}, SEED_ACCOUNTS); }
}

async function syncAccountsFromCloud() {
    try {
        const res = await fetch(`${CLOUD_ACCOUNTS_URL}?_t=${Date.now()}`);
        if (!res.ok) return;
        const remote = await res.json();
        if (remote && typeof remote === 'object') {
            const current = loadAccounts();
            const merged = Object.assign({}, current, remote);
            localStorage.setItem('pintar_accounts', JSON.stringify(merged));
        }
    } catch {}
}

async function syncAccountsToCloud(accounts) {
    try {
        await fetch(CLOUD_ACCOUNTS_URL, {
            method: 'POST',
            body: JSON.stringify(accounts),
            headers: { 'Content-Type': 'application/json' }
        });
    } catch {}
}

// Sinkronkan akun saat login page dimuat
if (typeof window !== 'undefined') {
    syncAccountsFromCloud();
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
        syncAccountsToCloud(accounts);
    }

    /* Mulai bersih: hapus sisa sesi orang sebelumnya, lalu isi sesi baru */
    sessionStorage.clear();
    sessionStorage.setItem('namaUser', accounts[nik].name);
    sessionStorage.setItem('nikUser', nik);
    sessionStorage.setItem('roleUser', 'warga');
    window.location.href = 'warga.html';
}

/* ---------- Petugas: NIP + kata sandi langsung (plaintext) ---------- */
function handleOfficerLogin(e) {
    e.preventDefault();
    const nip = el('officerNip').value.replace(/\D/g, '');
    const password = el('officerPass').value.trim();
    const dept = el('officerDept').value;

    const lockedUntil = Number(localStorage.getItem('pintar_admin_lock') || 0);
    if (Date.now() < lockedUntil) {
        const sec = Math.ceil((lockedUntil - Date.now()) / 1000);
        return showAuthError('officerSection', 'Terlalu banyak percobaan. Coba lagi dalam ' + sec + ' detik.');
    }

    const account = AUTH.admins.find(a => a.nip === nip);
    const ok = account && account.password === password;
    if (!ok) {
        const tries = Number(localStorage.getItem('pintar_admin_tries') || 0) + 1;
        if (tries >= AUTH.maxTries) {
            localStorage.setItem('pintar_admin_lock', String(Date.now() + AUTH.lockMs));
            localStorage.setItem('pintar_admin_tries', '0');
            return showAuthError('officerSection', 'Terlalu banyak percobaan. Akses dikunci sementara.');
        }
        localStorage.setItem('pintar_admin_tries', String(tries));
        return showAuthError('officerSection', 'NIP atau kata sandi salah. Sisa percobaan: ' + (AUTH.maxTries - tries) + '.');
    }

    localStorage.removeItem('pintar_admin_tries');
    localStorage.removeItem('pintar_admin_lock');
    sessionStorage.clear();
    sessionStorage.setItem('nipOfficer', nip);
    sessionStorage.setItem('deptOfficer', dept);
    sessionStorage.setItem('roleUser', 'petugas');
    window.location.href = 'admin.html';
}

function fillDemoOfficer() {
    const nipEl = el('officerNip');
    if (nipEl) {
        nipEl.dataset.demoFilled = 'true';
        nipEl.value = AUTH.admins[0].nip;
    }
    const passEl = el('officerPass');
    if (passEl) {
        passEl.dataset.demoFilled = 'true';
        passEl.focus();
    }
}