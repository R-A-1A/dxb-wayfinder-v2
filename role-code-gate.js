(() => {
const CODE='DXB2026',ROLES=['GXA','STL','TL'],MAX=3;
const gate=document.getElementById('authGate'),roleInput=document.getElementById('staffRole'),codeInput=document.getElementById('staffAccessCode'),submit=document.getElementById('staffAuthSubmit'),error=document.getElementById('staffAuthError'),attempts=document.getElementById('staffAuthAttempts');
if(!gate||!roleInput||!codeInput||!submit)return;
let step=1,selected='';
const grid=gate.querySelector('.staff-role-grid'),oldLabel=gate.querySelector('.staff-auth-label');
const role=document.createElement('input'); role.id='staffRoleText'; role.type='text'; role.placeholder='GXA / STL / TL'; role.autocomplete='off'; role.autocapitalize='characters'; role.spellcheck=false; role.inputMode='text'; role.style.cssText='display:block;width:100%;box-sizing:border-box;padding:14px;border:1px solid #ccd3df;border-radius:12px;font-size:18px;text-align:center;text-transform:uppercase;';
grid.parentNode.insertBefore(role,grid);
const lock=()=>{try{return JSON.parse(localStorage.getItem('dxb_access_lock')||'{}')}catch(e){return{}}};
const save=v=>localStorage.setItem('dxb_access_lock',JSON.stringify(v));
const msg=t=>{error.textContent=t;error.classList.add('show')};
const clear=()=>{error.textContent='';error.classList.remove('show')};
function render(){
const title=gate.querySelector('.auth-title'),sub=gate.querySelector('.auth-sub'),management=document.getElementById('managementLoginOption');
if(step===1){title.textContent='DXB Staff Wayfinder';sub.textContent='Enter your user role to continue.';role.style.display='block';grid.style.display='none';oldLabel.style.display='none';submit.textContent='Continue';management.style.display='block';setTimeout(()=>role.focus(),150)}
else{title.textContent='Access code';sub.textContent='User: '+selected;role.style.display='none';grid.style.display='none';oldLabel.style.display='block';submit.textContent='Enter Wayfinder';management.style.display='none';setTimeout(()=>codeInput.focus(),150)}
}
role.addEventListener('input',()=>{selected=role.value.trim().toUpperCase();roleInput.value=selected;clear()});
role.addEventListener('keydown',e=>{if(e.key==='Enter')submit.click()});
submit.addEventListener('click',()=>{
clear();
if(step===1){selected=role.value.trim().toUpperCase();roleInput.value=selected;if(!ROLES.includes(selected)){msg('Enter GXA, STL or TL.');role.focus();return}step=2;render();return}
const l=lock(),n=Number(l.attempts||0);if(l.locked){msg('Access is locked after three failed attempts. Owner recovery is required.');return}
if(codeInput.value.trim()!==CODE){const next=n+1;save({attempts:next,locked:next>=MAX});attempts.textContent=next+' of '+MAX+' failed attempts';msg(next>=MAX?'Three failed attempts. Owner recovery is required.':'Incorrect access code.');codeInput.focus();return}
save({attempts:0,locked:false});sessionStorage.setItem('dxb_staff_role',selected);gate.classList.add('auth-hidden');gate.setAttribute('aria-hidden','true');document.body.classList.remove('auth-locked');
});
codeInput.addEventListener('keydown',e=>{if(e.key==='Enter')submit.click()});
render();
})();