(() => {
  const CODES = { GXA: 'DXB2027', STL: 'DXB2025', TL: 'DXB2026' };
  const gate = document.getElementById('authGate');
  if (!gate) return;

  gate.innerHTML = `
    <div class="auth-card staff-auth-card clean-auth-card">
      <div class="auth-brand">Dubai International Airport</div>
      <div class="auth-title">DXB Staff Wayfinder</div>
      <div class="auth-sub">Staff authentication</div>

      <div class="auth-field">
        <label for="staffUserSelect">USER</label>
        <select id="staffUserSelect" autocomplete="off">
          <option value="" selected disabled>Select user</option>
          <option value="GXA">GXA</option>
          <option value="TL">TL</option>
          <option value="STL">STL</option>
        </select>
      </div>

      <div class="auth-field">
        <label for="staffAccessCode">ACCESS CODE</label>
        <input id="staffAccessCode" type="password" inputmode="numeric" pattern="[0-9]*"
          autocomplete="one-time-code" placeholder="Enter access code">
      </div>

      <div id="staffAuthError" class="auth-error" role="alert"></div>
      <button id="staffAuthSubmit" class="auth-submit" type="button">LOGIN</button>
    </div>
  `;

  const style = document.createElement('style');
  style.textContent = `
    #authGate.clean-auth-gate{z-index:500}
    .clean-auth-card{width:min(92vw,430px);padding:28px 24px}
    .clean-auth-card .auth-sub{margin-bottom:24px}
    .auth-field{margin:0 0 17px;text-align:left}
    .auth-field label{display:block;font-size:12px;font-weight:850;letter-spacing:.08em;color:#344054;margin-bottom:7px}
    .auth-field select,.auth-field input{
      width:100%;height:56px;border:1px solid #d7dce7;border-radius:13px;
      background:#fff;color:#14224a;padding:0 15px;font-size:17px;outline:none;
      box-sizing:border-box;
    }
    .auth-field select:focus,.auth-field input:focus{
      border-color:#132b71;box-shadow:0 0 0 3px rgba(19,43,113,.10)
    }
    .auth-field input{letter-spacing:.08em}
    .auth-field input::placeholder{color:#98a2b3;letter-spacing:0}
    .clean-auth-card .auth-submit{width:100%;height:56px;margin-top:4px}
    .clean-auth-card .auth-error{min-height:20px;margin:0 0 8px}
    #startupOverlay{z-index:600}
    body.auth-locked{overflow:hidden}
  `;
  document.head.appendChild(style);
  gate.classList.add('clean-auth-gate');
  gate.setAttribute('aria-hidden','true');
  gate.style.display='none';

  const user = document.getElementById('staffUserSelect');
  const code = document.getElementById('staffAccessCode');
  const login = document.getElementById('staffAuthSubmit');
  const error = document.getElementById('staffAuthError');

  function showError(text) {
    error.textContent = text;
    error.classList.add('show');
  }
  function clearError() {
    error.textContent = '';
    error.classList.remove('show');
  }

  login.addEventListener('click', () => {
    clearError();
    const selected = user.value;
    if (!selected) {
      showError('Select your user role.');
      user.focus();
      return;
    }
    if (code.value !== CODES[selected]) {
      showError('Incorrect access code.');
      code.focus();
      code.select();
      return;
    }
    sessionStorage.setItem('dxb_staff_role', selected);
    gate.classList.add('auth-hidden');
    gate.setAttribute('aria-hidden','true');
    document.body.classList.remove('auth-locked');
  });

  code.addEventListener('keydown', e => {
    if (e.key === 'Enter') login.click();
  });

  function showAuthentication() {
    gate.style.display = 'grid';
    gate.classList.remove('auth-hidden');
    gate.setAttribute('aria-hidden','false');
    document.body.classList.add('auth-locked');
  }

  const startup = document.getElementById('startupOverlay');
  if (startup) {
    startup.style.zIndex = '600';
    startup.classList.remove('hide');
    setTimeout(() => {
      startup.classList.add('hide');
      showAuthentication();
    }, 2700);
    setTimeout(() => startup.remove(), 3400);
  } else {
    showAuthentication();
  }
})();