const el = (id) => document.getElementById(id);

let supabasePromise = null;
let citizenRegisterMode = false;


async function getSupabaseClient() {
    if (window.supabase) return window.supabase;

    if (!supabasePromise) {
        supabasePromise = import('./supabase-client.js')
            .then((module) => {
                const client = module.supabase || window.supabase;

                if (!client) {
                    throw new Error(
                        'Supabase belum terhubung. Periksa supabase-client.js.'
                    );
                }

                window.supabase = client;
                return client;
            })
            .catch((error) => {
                supabasePromise = null;
                throw error;
            });
    }

    return supabasePromise;
}

function showAuthError(sectionId, message) {
    const section = el(sectionId);
    const form = section?.querySelector('form');

    if (!form) {
        alert(message);
        return;
    }

    let box = form.querySelector('.auth-error');

    if (!box) {
        box = document.createElement('p');
        box.className = 'auth-error';
        box.setAttribute('role', 'alert');

        const button = form.querySelector('.btn-submit');

        if (button) {
            button.before(box);
        } else {
            form.appendChild(box);
        }
    }

    box.textContent = message;
}

function clearAuthError(sectionId) {
    const box = el(sectionId)?.querySelector('.auth-error');
    if (box) box.remove();
}

function setLoginButtonLoading(
    sectionId,
    loading,
    label = 'Masuk'
) {
    const button = el(sectionId)?.querySelector('.btn-submit');

    if (!button) return;

    if (loading) {
        if (!button.disabled) {
            button.dataset.originalText = button.textContent;
        }

        button.disabled = true;
        button.textContent = label;
    } else {
        button.disabled = false;
        button.textContent = button.dataset.originalText || 'Masuk';
        delete button.dataset.originalText;
    }
}

function normalizeText(value) {
    return String(value || '')
        .trim()
        .replace(/\s+/g, ' ')
        .toLowerCase();
}


function setCitizenMode(registerMode) {
    citizenRegisterMode = registerMode;

    const nameInput = el('citizenName');
    const nikInput = el('citizenNik');
    const emailInput = el('citizenEmail');
    const passwordInput = el('citizenPassword');

    const nameGroup = nameInput?.closest('.form-group');
    const nikGroup = nikInput?.closest('.form-group');

    const title = el('citizenSection')?.querySelector('h3');
    const subtitle = el('citizenSection')?.querySelector('.sub');
    const submitButton = el('citizenSection')?.querySelector('.btn-submit');
    const toggleButton = el('citizenModeToggle');
    const toggleText = el('citizenSection')?.querySelector('.demo-bar span');

    if (nameGroup) {
        nameGroup.style.display = registerMode ? '' : 'none';
    }

    if (nikGroup) {
        nikGroup.style.display = registerMode ? '' : 'none';
    }

    if (nameInput) nameInput.required = registerMode;
    if (nikInput) nikInput.required = registerMode;
    if (emailInput) emailInput.required = true;

    if (passwordInput) {
        passwordInput.required = true;
        passwordInput.autocomplete = registerMode
            ? 'new-password'
            : 'current-password';
    }

    if (title) {
        title.textContent = registerMode
            ? 'Daftar sebagai warga'
            : 'Masuk sebagai warga';
    }

    if (subtitle) {
        subtitle.textContent = registerMode
            ? 'Buat akun menggunakan email, kata sandi, nama lengkap, dan NIK.'
            : 'Masuk menggunakan email dan kata sandi akun PINTAR.';
    }

    if (submitButton) {
        submitButton.textContent = registerMode
            ? 'Buat akun'
            : 'Masuk';
    }

    if (toggleButton) {
        toggleButton.textContent = registerMode
            ? 'Masuk'
            : 'Daftar akun';
    }

    if (toggleText) {
        toggleText.textContent = registerMode
            ? 'Sudah punya akun?'
            : 'Belum punya akun?';
    }

    clearAuthError('citizenSection');
}

function toggleCitizenMode() {
    setCitizenMode(!citizenRegisterMode);
}



async function getCitizenProfile(sb, user) {
    const { data: profile, error } = await sb
        .from('profiles')
        .select('id, full_name, nik, role')
        .eq('id', user.id)
        .maybeSingle();

    if (error) {
        throw new Error(
            'Gagal membaca profil warga: ' + error.message
        );
    }

    if (profile) {
        if (profile.role !== 'citizen') {
            throw new Error(
                'Akun ini bukan akun warga. Gunakan akun warga untuk masuk.'
            );
        }

        return profile;
    }

    const metadata = user.user_metadata || {};

    const fullName = metadata.full_name || '';
    const nik = metadata.nik || '';

    if (!fullName || !nik) {
        throw new Error(
            'Profil warga belum tersedia. Periksa trigger pembuatan profil di Supabase.'
        );
    }

    const { data: newProfile, error: insertError } = await sb
        .from('profiles')
        .insert({
            id: user.id,
            full_name: fullName,
            nik: nik,
            role: 'citizen'
        })
        .select('id, full_name, nik, role')
        .single();

    if (insertError) {
        throw new Error(
            'Profil warga gagal dibuat: ' + insertError.message
        );
    }

    return newProfile;
}



async function handleCitizenLogin(event) {
    event.preventDefault();
    clearAuthError('citizenSection');

    const email = (el('citizenEmail')?.value || '')
        .trim()
        .toLowerCase();

    const password = el('citizenPassword')?.value || '';

    const name = (el('citizenName')?.value || '')
        .trim()
        .replace(/\s+/g, ' ');

    const nik = (el('citizenNik')?.value || '')
        .replace(/\D/g, '');

    if (!email) {
        showAuthError('citizenSection', 'Email wajib diisi.');
        return;
    }

    if (!password) {
        showAuthError('citizenSection', 'Kata sandi wajib diisi.');
        return;
    }

    if (password.length < 6) {
        showAuthError(
            'citizenSection',
            'Kata sandi minimal 6 karakter.'
        );
        return;
    }

    if (citizenRegisterMode) {
        if (name.length < 3) {
            showAuthError(
                'citizenSection',
                'Nama lengkap minimal 3 huruf.'
            );
            return;
        }

        if (nik.length !== 16) {
            showAuthError(
                'citizenSection',
                'NIK harus terdiri dari tepat 16 digit.'
            );
            return;
        }
    }

    setLoginButtonLoading(
        'citizenSection',
        true,
        citizenRegisterMode ? 'Membuat akun...' : 'Memverifikasi...'
    );

    let sb = null;
    let signedIn = false;

    try {
        sb = await getSupabaseClient();

        if (citizenRegisterMode) {
            await sb.auth.signOut();

            const { data, error } = await sb.auth.signUp({
                email,
                password,
                options: {
                    data: {
                        full_name: name,
                        nik,
                        role: 'citizen'
                    }
                }
            });

            if (error) {
                throw new Error(error.message);
            }

            if (!data?.user) {
                throw new Error(
                    'Pendaftaran belum berhasil. Silakan coba lagi.'
                );
            }

            if (!data.session) {
                alert(
                    'Pendaftaran berhasil. Silakan cek email untuk melakukan konfirmasi, lalu masuk menggunakan email dan kata sandi.'
                );

                setCitizenMode(false);
                return;
            }

            signedIn = true;

            const profile = await getCitizenProfile(sb, data.user);

            sessionStorage.clear();

            sessionStorage.setItem(
                'namaUser',
                profile.full_name || name
            );

            sessionStorage.setItem(
                'nikUser',
                profile.nik || nik
            );

            sessionStorage.setItem('roleUser', 'warga');

            window.location.href = 'warga.html';
            return;
        }

        const { data, error } = await sb.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            throw new Error(
                'Email atau kata sandi salah. Periksa kembali akun warga.'
            );
        }

        signedIn = true;

        if (!data?.user?.id) {
            throw new Error('Data akun tidak ditemukan.');
        }

        const profile = await getCitizenProfile(sb, data.user);

        sessionStorage.clear();

        sessionStorage.setItem(
            'namaUser',
            profile.full_name || data.user.email || 'Warga'
        );

        sessionStorage.setItem('nikUser', profile.nik || '');
        sessionStorage.setItem('roleUser', 'warga');

        window.location.href = 'warga.html';

    } catch (error) {
        console.error('Login/pendaftaran warga gagal:', error);

        if (signedIn && sb) {
            await sb.auth.signOut().catch(() => {});
        }

        sessionStorage.clear();

        showAuthError(
            'citizenSection',
            error.message || 'Proses login warga gagal.'
        );

    } finally {
        setLoginButtonLoading('citizenSection', false);
    }
}



async function handleOfficerLogin(event) {
    event.preventDefault();
    clearAuthError('officerSection');

    const email = (el('officerEmail')?.value || '')
        .trim()
        .toLowerCase();

    const nip = (el('officerNip')?.value || '')
        .trim()
        .toUpperCase();

    const password = el('officerPass')?.value || '';

    const selectedDepartment = (el('officerDept')?.value || '')
        .trim();

    // Validasi input
    if (!email) {
        showAuthError(
            'officerSection',
            'Email universitas wajib diisi.'
        );
        return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        showAuthError(
            'officerSection',
            'Format email tidak valid.'
        );
        return;
    }

    if (!/^[A-Z0-9._-]{3,40}$/.test(nip)) {
        showAuthError(
            'officerSection',
            'NIP tidak valid. Periksa kembali NIP yang dimasukkan.'
        );
        return;
    }

    if (!password) {
        showAuthError(
            'officerSection',
            'Kata sandi wajib diisi.'
        );
        return;
    }

    if (!selectedDepartment) {
        showAuthError(
            'officerSection',
            'Pilih satuan kerja terlebih dahulu.'
        );
        return;
    }

    setLoginButtonLoading(
        'officerSection',
        true,
        'Memverifikasi akun...'
    );

    let sb = null;
    let signedIn = false;

    try {
        sb = await getSupabaseClient();

        // 1. Login menggunakan email universitas dan password
        const { data, error } = await sb.auth.signInWithPassword({
            email,
            password
        });

        if (error) {
            throw new Error(
                'Email atau kata sandi salah. Pastikan akun sudah dibuat di Supabase Authentication.'
            );
        }

        signedIn = true;

        const authUser = data?.user;

        if (!authUser?.id) {
            throw new Error(
                'Data akun tidak ditemukan di Supabase Auth.'
            );
        }

        // 2. Ambil profil berdasarkan UUID akun Auth
        const { data: profile, error: profileError } = await sb
            .from('profiles')
            .select('id, full_name, role, department, nip')
            .eq('id', authUser.id)
            .maybeSingle();

        if (profileError) {
            throw new Error(
                'Gagal membaca profil admin: ' + profileError.message
            );
        }

        if (!profile) {
            throw new Error(
                'Profil belum terdaftar. Pastikan UUID akun Authentication sama dengan ID pada tabel profiles.'
            );
        }

        // 3. Validasi NIP
        const storedNip = String(profile.nip || '')
            .trim()
            .toUpperCase();

        if (storedNip !== nip) {
            throw new Error(
                'NIP tidak cocok dengan akun ini.'
            );
        }

        // 4. Validasi role
        const storedRole = String(profile.role || '')
            .trim()
            .toLowerCase();

        if (!['admin', 'officer'].includes(storedRole)) {
            throw new Error(
                'Akun ini tidak memiliki hak akses sebagai admin atau petugas.'
            );
        }

        // 5. Validasi satuan kerja berdasarkan database
        const storedDepartment = String(profile.department || '')
            .trim();

        if (!storedDepartment) {
            throw new Error(
                'Satuan kerja belum diatur pada profil akun.'
            );
        }

        if (
            normalizeText(storedDepartment) !==
            normalizeText(selectedDepartment)
        ) {
            throw new Error(
                'Satuan kerja tidak cocok dengan data profil akun.'
            );
        }

        // 6. Simpan informasi sesi aplikasi
        sessionStorage.clear();

        sessionStorage.setItem(
            'namaUser',
            profile.full_name || authUser.email || 'Petugas'
        );

        sessionStorage.setItem('emailOfficer', authUser.email || email);
        sessionStorage.setItem('nipOfficer', storedNip);
        sessionStorage.setItem('deptOfficer', storedDepartment);
        sessionStorage.setItem('staffRole', storedRole);
        sessionStorage.setItem('roleUser', 'petugas');

        // 7. Masuk ke dashboard petugas
        window.location.href = 'admin.html';

    } catch (error) {
        console.error('Login petugas gagal:', error);

        // Logout jika login Auth berhasil tetapi validasi profil gagal
        if (signedIn && sb) {
            await sb.auth.signOut().catch(() => {});
        }

        sessionStorage.clear();

        showAuthError(
            'officerSection',
            error.message || 'Login petugas gagal.'
        );

    } finally {
        setLoginButtonLoading('officerSection', false);
    }
}



function fillDemoOfficer() {
    const nipInput = el('officerNip');

    if (nipInput) {
        nipInput.value = 'ADM001';
    }
}



window.handleCitizenLogin = handleCitizenLogin;
window.handleOfficerLogin = handleOfficerLogin;
window.toggleCitizenMode = toggleCitizenMode;
window.fillDemoOfficer = fillDemoOfficer;

// Mode awal: login warga
setCitizenMode(false);
