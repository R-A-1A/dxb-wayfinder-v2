(() => {
  const CODE='DXB2026', ROLES=['GXA','STL','TL'], MAX=3;
  const gate=document.getElementById('authGate');
  const roleInput=document.getElementById('staffRole');
  const codeInput=document.getElementById('staffAccessCode');
  const submit=document.getElementById('staffAuthSubmit');
  const error=document.getElementById('staffAuthError');
  const attempts=document.getElementById('staffAuthAttempts');
  const loc=document.getElementById('staffLocationStatus');
  const roleButtons=[...document.querySelectorAll('.staff-role-btn')];
  if(!gate||!roleInput||!codeInput||!submit)return;
  let step=1, selected='';

  function lock(){try{return JSON.parse(localStorage.getItem('dxb_access_lock')||'{}')}catch(e){return{}}}
  function save(v){localStorage.setItem('dxb_access_lock',JSON.stringify(v))}
  function msg(t){error.textContent=t;error.classList.add('show')}
  function clear(){error.textContent='';error.classList.remove('show')}
  function render(){
    const title=gate.querySelector('.auth-title'), sub=gate.querySelector('.auth-sub');
    const grid=gate.querySelector('.staff-role-grid'), label=gate.querySelector('.staff-auth-label');
    const management=document.getElementById('managementLoginOption');
    if(step===1){
      title.textContent='DXB Staff Wayfinder'; sub.textContent='Enter your user role to continue.';
      grid.style.display='grid'; label.style.display='none'; codeInput.value='';
      submit.textContent='Continue'; management.style.display='block';
    }else{
      title.textContent='Access code'; sub.textContent=`User: ${selected}`;
      grid.style.display='none'; label.style.display='block'; codeInput.focus();
      submit.textContent='Enter Wayfinder'; management.style.display='none';
    }
  }
  roleButtons.forEach(b=>b.addEventListener('click',()=>{
    roleButtons.forEach(x=>x.classList.remove('active')); b.classList.add('active');
    selected=b.dataset.role; roleInput.value=selected; clear();
  }));
  selected='GXA'; roleInput.value='GXA';
  submit.addEventListener('click',async()=>{
    clear();
    if(step===1){
      if(!ROLES.includes(selected)){msg('Enter GXA, STL or TL.');return}
      step=2; render(); return;
    }
    const l=lock(), n=Number(l.attempts||0);
    if(l.locked){msg('Access is locked after three failed attempts. Owner recovery is required.');return}
    if(codeInput.value.trim()!==CODE){
      const next=n+1; save({attempts:next,locked:next>=MAX});
      attempts.textContent=`${next} of ${MAX} failed attempts`;
      msg(next>=MAX?'Three failed attempts. Owner recovery is required.':'Incorrect access code.');
      return;
    }
    save({attempts:0,locked:false});
    sessionStorage.setItem('dxb_staff_role',selected);
    gate.classList.add('auth-hidden'); gate.setAttribute('aria-hidden','true');
    document.body.classList.remove('auth-locked');
  });
  codeInput.addEventListener('keydown',e=>{if(e.key==='Enter')submit.click()});
  document.querySelector('.auth-card')?.addEventListener('click',e=>{
    if(e.target.matches('.staff-role-btn'))return;
  });
  render();
})();