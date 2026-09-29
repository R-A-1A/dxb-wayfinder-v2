/* DXB Staff Wayfinder access-control foundation.
   Role/code access is a convenience gate for normal staff. Owner/Admin management
   remains on Firebase Authentication and must be backed by server-side authorization.
*/
(() => {
  const STAFF_CODE = 'DXB2026';
  const ROLES = ['GXA', 'STL', 'TL'];
  const MAX_ATTEMPTS = 3;
  const LOCK_KEY = 'dxb_wayfinder_access_lock_v1';
  const SESSION_KEY = 'dxb_wayfinder_staff_session_v1';
  const gate = document.getElementById('authGate');
  const roleSelect = document.getElementById('staffRole');
  const codeInput = document.getElementById('staffAccessCode');
  const errorBox = document.getElementById('staffAuthError');
  const submit = document.getElementById('staffAuthSubmit');
  const attemptsBox = document.getElementById('staffAuthAttempts');
  const locationBox = document.getElementById('staffLocationStatus');
  const managementBtn = document.getElementById('managementLoginOption');

  if (!gate || !roleSelect || !codeInput || !submit) return;

  function readLock() {
    try { return JSON.parse(localStorage.getItem(LOCK_KEY) || '{}'); } catch (_) { return {}; }
  }
  function writeLock(v) { localStorage.setItem(LOCK_KEY, JSON.stringify(v)); }
  function getSession() {
    try { return JSON.parse(sessionStorage.getItem(SESSION_KEY) || 'null'); } catch (_) { return null; }
  }
  function setSession(role) {
    const session = { role, authenticatedAt: Date.now() };
    sessionStorage.setItem(SESSION_KEY, JSON.stringify(session));
    window.dxbStaffSession = session;
  }
  function clearSession() {
    sessionStorage.removeItem(SESSION_KEY);
    window.dxbStaffSession = null;
  }
  function showError(message) {
    if (!errorBox) return;
    errorBox.textContent = message;
    errorBox.classList.add('show');
  }
  function clearError() {
    if (!errorBox) return;
    errorBox.textContent = '';
    errorBox.classList.remove('show');
  }
  function refreshAttempts() {
    const lock = readLock();
    const count = Number(lock.attempts || 0);
    if (attemptsBox) attemptsBox.textContent = count ? `${count} of ${MAX_ATTEMPTS} failed attempts used` : '';
  }
  function isLocked() { return Boolean(readLock().locked); }
  function updateGate() {
    const session = getSession();
    if (session?.role && ROLES.includes(session.role) && !isLocked()) {
      window.dxbStaffSession = session;
      document.body.classList.remove('auth-locked');
      gate.classList.add('auth-hidden');
      gate.setAttribute('aria-hidden', 'true');
      return;
    }
    document.body.classList.add('auth-locked');
    gate.classList.remove('auth-hidden');
    gate.setAttribute('aria-hidden', 'false');
    refreshAttempts();
  }

  async function checkAirportProximity() {
    if (!navigator.geolocation) return { allowed: false, reason: 'Location is not available on this device.' };
    return new Promise(resolve => {
      navigator.geolocation.getCurrentPosition(
        p => {
          const toRad = x => x * Math.PI / 180;
          const airport = { lat: 25.2532, lon: 55.3657 };
          const dLat = toRad(p.coords.latitude - airport.lat);
          const dLon = toRad(p.coords.longitude - airport.lon);
          const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(airport.lat)) * Math.cos(toRad(p.coords.latitude)) * Math.sin(dLon / 2) ** 2;
          const distance = 6371000 * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
          resolve({ allowed: distance <= 4500, distance });
        },
        () => resolve({ allowed: false, reason: 'Location permission is required for the staff-premises check.' }),
        { enableHighAccuracy: false, timeout: 5000, maximumAge: 120000 }
      );
    });
  }

  submit.addEventListener('click', async event => {
    event.preventDefault();
    clearError();
    if (isLocked()) {
      showError('Access is locked after three failed attempts. Owner recovery is required.');
      return;
    }
    const role = String(roleSelect.value || '').toUpperCase();
    const code = String(codeInput.value || '').trim();
    if (!ROLES.includes(role)) { showError('Select GXA, STL or TL.'); return; }
    if (!code) { showError('Enter the access code.'); return; }

    submit.disabled = true;
    submit.textContent = 'Checking…';
    try {
      const lock = readLock();
      if (code !== STAFF_CODE) {
        const attempts = Number(lock.attempts || 0) + 1;
        writeLock({ attempts, locked: attempts >= MAX_ATTEMPTS, lockedAt: attempts >= MAX_ATTEMPTS ? Date.now() : null });
        refreshAttempts();
        showError(attempts >= MAX_ATTEMPTS ? 'Three failed attempts. Access is now locked. Owner recovery is required.' : 'Incorrect access code.');
        return;
      }

      if (role === 'STL' || role === 'TL') {
        if (locationBox) { locationBox.textContent = 'Checking airport premises…'; locationBox.classList.add('show'); }
        const proximity = await checkAirportProximity();
        if (!proximity.allowed) {
          if (locationBox) locationBox.textContent = proximity.reason || 'This staff role must be verified near DXB premises.';
          showError('STL/TL operational access requires the device to be near the DXB premises.');
          return;
        }
        locationBox?.classList.remove('show');
      }

      writeLock({ attempts: 0, locked: false, lockedAt: null });
      setSession(role);
      codeInput.value = '';
      updateGate();
    } finally {
      submit.disabled = false;
      submit.textContent = 'Enter Wayfinder';
    }
  });

  codeInput.addEventListener('keydown', e => { if (e.key === 'Enter') submit.click(); });

  document.getElementById('authSignOutOption')?.addEventListener('click', () => {
    clearSession();
    updateGate();
  });

  managementBtn?.addEventListener('click', async e => {
    e.preventDefault();
    const auth = window.dxbFirebaseAuth;
    if (!auth) { showError('Management authentication is still initializing.'); return; }
    const email = prompt('Owner/Admin email');
    if (!email) return;
    const password = prompt('Password');
    if (!password) return;
    try {
      const { signInWithEmailAndPassword } = await import('https://www.gstatic.com/firebasejs/12.9.0/firebase-auth.js');
      await signInWithEmailAndPassword(auth, email.trim(), password);
      clearSession();
      document.body.classList.remove('auth-locked');
      gate.classList.add('auth-hidden');
      gate.setAttribute('aria-hidden', 'true');
      window.dxbManagementSession = true;
    } catch (_) {
      showError('Management sign-in failed.');
    }
  });

  refreshAttempts();
  updateGate();
})();