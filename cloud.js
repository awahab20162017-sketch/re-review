window.PRCloud=(function(){
  let client=null,user=null,profile=null,syncTimer=null,booted=false,localOnly=false,loadingState=false,lastSync=0;
  const defaults=()=>({tours:[],saved:[{n:'abdullah',r:5},{n:'ibrahim',r:5},{n:'wahab',r:5},{n:'haseeb',r:4}]});
  const safeJson=x=>{try{return JSON.parse(x)}catch(e){return null}};
  function cfg(){
    const d=window.PITCH_ROYALE_SUPABASE||{},l=safeJson(localStorage.getItem('pr_supabase_config'))||{};
    return {url:String(d.url||l.url||'').trim(),key:String(d.key||l.key||'').trim()}
  }
  function configured(){const c=cfg();return /^https:\/\/.+\.supabase\.co\/?$/i.test(c.url)&&c.key.length>20}
  function cloudClass(v){window.PR_CLOUD_CLASS=v||''}
  function label(v){window.PR_ACCOUNT_NAME=v||'Account'}
  function setStatus(kind,text,quiet){cloudClass(kind==='ok'?'ok':kind==='busy'?'busy':kind==='err'?'err':'');if(!quiet&&text)syncPop(text,kind)}
  function syncPop(text,kind){const old=document.querySelector('.pr-sync-toast');if(old)old.remove();const d=document.createElement('div');d.className='pr-sync-toast';d.innerHTML=`<span class="pr-cloud-dot ${kind==='ok'?'ok':kind==='busy'?'busy':kind==='err'?'err':''}"></span>${E(text)}`;document.body.appendChild(d);setTimeout(()=>d.remove(),1700)}
  function escState(x){return x&&Array.isArray(x.tours)&&Array.isArray(x.saved)?x:null}
  function modal(html){closeModal();const d=document.createElement('div');d.id='prModal';d.className='pr-modal-bg';d.innerHTML=html;document.body.appendChild(d);const f=d.querySelector('input,button');if(f)setTimeout(()=>f.focus(),30)}
  function closeModal(){const d=document.getElementById('prModal');if(d)d.remove()}
  function cleanRecoveryUrl(){try{if(location.hash)history.replaceState(null,document.title,location.pathname+location.search)}catch(e){}}
  function recoveryMessage(msg,type=''){const e=document.getElementById('prRecoveryMsg');if(!e)return;e.className='pr-auth-msg '+type;e.textContent=msg;e.style.display=msg?'block':'none'}
  function getVal(id){const e=document.getElementById(id);return e?e.value.trim():''}
  function validUsername(u){return /^[a-z0-9_]{3,24}$/.test(u)}
  function authMessage(msg,type=''){const e=document.getElementById('prAuthMsg');if(e){e.className='pr-auth-msg '+type;e.textContent=msg;e.style.display='block'}}
  function gate(mode='login',msg='',type=''){
    if(window.PRV56&&typeof window.PRV56.showAccountModal==='function'){label('Account');cloudClass('');return window.PRV56.showAccountModal(mode,msg,type)}
    const signup=mode==='signup',reset=mode==='reset';
    label('Account');cloudClass('');
    $('#app').innerHTML=`<div class="pr-auth-shell"><div class="card pr-auth-card"><div class="pr-auth-logo"><div class="ball">⚽</div><h1>PITCH ROYALE</h1><p>Accounts & Cloud</p></div><div id="prAuthMsg" class="pr-auth-msg ${type}" style="${msg?'':'display:none'}">${E(msg)}</div>${reset?`<div class="pr-auth-form"><label>Email</label><input id="prEmail" type="email" autocomplete="email" placeholder="you@example.com"><button class="gd" data-a="prreset">Send reset link</button></div>`:signup?`<div class="pr-auth-form"><label>Username</label><input id="prUsername" autocomplete="username" maxlength="24" placeholder="wahab_356"><div class="help">3–24 lowercase letters, numbers or underscores.</div><label>Email</label><input id="prEmail" type="email" autocomplete="email" placeholder="you@example.com"><label>Password</label><input id="prPassword" type="password" autocomplete="new-password" minlength="8" placeholder="At least 8 characters"><label>Confirm password</label><input id="prPassword2" type="password" autocomplete="new-password" minlength="8"><button class="gd" data-a="prsignup">Create account</button></div>`:`<div class="pr-auth-form"><label>Email</label><input id="prEmail" type="email" autocomplete="email" placeholder="you@example.com"><label>Password</label><input id="prPassword" type="password" autocomplete="current-password"><button class="gd" data-a="prlogin">Log in</button></div>`}<div class="pr-auth-switch">${!signup&&!reset?'<button data-a="prgate" data-mode="signup">Create account</button>':''}${signup||reset?'<button data-a="prgate" data-mode="login">Back to login</button>':''}${!reset?'<button data-a="prgate" data-mode="reset">Forgot password</button>':''}<button data-a="prlocal">Continue locally</button></div><div class="pr-config-note">Cloud login is optional while testing. Local mode still saves on this device. For published accounts, configure Supabase once and host the app over HTTPS.</div></div></div>`;
  }
  function setupModal(){const c=cfg();modal(`<div class="card pr-account"><div class="pr-account-head"><div class="pr-user-orb">☁</div><div><h2>Connect Cloud</h2><div class="mu sm">Supabase project configuration</div></div><span class="sp"></span><button data-a="prclose">✕</button></div><div class="pr-config-note">Use only your <b>Project URL</b> and <b>Publishable/anon key</b> here. Never paste a service-role or secret key into this HTML.</div><div class="pr-auth-form"><label>Project URL</label><input id="prCfgUrl" value="${E(c.url)}" placeholder="https://YOUR_PROJECT.supabase.co"><label>Publishable / anon key</label><input id="prCfgKey" value="${E(c.key)}" autocomplete="off" placeholder="sb_publishable_... or anon key"><button class="gd" data-a="prsavecfg">Save & connect</button></div><div class="pr-sect"><button data-a="prclose">Cancel</button></div></div>`)}
  async function init(){
    if(booted)return;booted=true;
    if(!configured()){localOnly=true;label('Local');cloudClass('');render();setTimeout(()=>toast('Local mode · open Account to connect cloud'),500);return}
    if(!window.supabase||!window.supabase.createClient){localOnly=true;label('Offline');cloudClass('err');render();setTimeout(()=>toast('Cloud library could not load · using local mode'),500);return}
    const c=cfg();client=window.supabase.createClient(c.url,c.key,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:true}});
    client.auth.onAuthStateChange((event,session)=>{setTimeout(async()=>{if(event==='PASSWORD_RECOVERY'){user=session&&session.user;showRecovery();return}if(event==='SIGNED_OUT'){closeModal();cleanRecoveryUrl();user=null;profile=null;label('Account');cloudClass('');gate('login','Signed out.','ok');return}if(session&&session.user&&(!user||user.id!==session.user.id)){user=session.user;await signedIn()}},0)});
    setStatus('busy','Connecting…',true);
    const {data,error}=await client.auth.getSession();
    if(error){setStatus('err','Cloud unavailable',true);localOnly=true;render();return}
    if(data.session&&data.session.user){user=data.session.user;await signedIn()}else gate('login');
  }
  async function fetchProfile(){if(!client||!user)return null;const {data,error}=await client.from('profiles').select('username,created_at').eq('id',user.id).maybeSingle();if(!error&&data){profile=data;label('@'+data.username)}else label(user.email?user.email.split('@')[0]:'Account');return data}
  async function signedIn(){
    localOnly=false;setStatus('busy','Loading account…',true);await fetchProfile();
    const {data,error}=await client.from('pitch_royale_state').select('state,updated_at').eq('user_id',user.id).maybeSingle();
    if(error){setStatus('err','Cloud data error');render();return}
    const owner=localStorage.getItem('pr_cloud_owner'),localTs=+(localStorage.getItem('pr_local_updated')||0),cloudTs=data&&data.updated_at?Date.parse(data.updated_at):0;
    const localHas=!!(S&&S.tours&&S.tours.length);
    if(!data){
      if(localHas&&(!owner||owner===user.id)){await uploadNow(S);localStorage.setItem('pr_cloud_owner',user.id)}
      else{S=defaults();await uploadNow(S);try{localStorage.setItem('pr1',JSON.stringify(S))}catch(e){}}
    }else if(owner===user.id&&localTs>cloudTs+1500&&localHas){await uploadNow(S)}
    else{
      const st=escState(data.state);if(st){try{localStorage.setItem('pr_precloud_backup',JSON.stringify(S))}catch(e){};loadingState=true;S=st;try{localStorage.setItem('pr1',JSON.stringify(S));localStorage.setItem('pr_cloud_owner',user.id);localStorage.setItem('pr_local_updated',String(cloudTs||Date.now()))}catch(e){};loadingState=false}
    }
    setStatus('ok','Cloud synced',true);render();
  }
  async function uploadNow(state){
    if(!client||!user||loadingState)return false;setStatus('busy','Syncing…',true);
    const now=new Date().toISOString();const {error}=await client.from('pitch_royale_state').upsert({user_id:user.id,state:state,updated_at:now},{onConflict:'user_id'});
    if(error){setStatus('err','Sync failed');return false}
    lastSync=Date.now();try{localStorage.setItem('pr_cloud_owner',user.id);localStorage.setItem('pr_local_updated',String(lastSync))}catch(e){};setStatus('ok','Synced',true);return true
  }
  function queueSave(){if(localOnly||!client||!user||loadingState)return;clearTimeout(syncTimer);syncTimer=setTimeout(()=>uploadNow(S),850)}
  async function login(){const email=getVal('prEmail'),password=(document.getElementById('prPassword')||{}).value||'';if(!email||!password)return authMessage('Enter your email and password.','err');authMessage('Signing in…');const {error}=await client.auth.signInWithPassword({email,password});if(error)authMessage(error.message,'err')}
  async function signup(){const username=getVal('prUsername').toLowerCase(),email=getVal('prEmail'),p=(document.getElementById('prPassword')||{}).value||'',p2=(document.getElementById('prPassword2')||{}).value||'';if(!validUsername(username))return authMessage('Username must be 3–24 lowercase letters, numbers or underscores.','err');if(!email)return authMessage('Enter an email address.','err');if(p.length<8)return authMessage('Use a password with at least 8 characters.','err');if(p!==p2)return authMessage('Passwords do not match.','err');authMessage('Checking username…');const {data:available,error:checkError}=await client.rpc('username_available',{p_username:username});if(checkError)return authMessage('Username check failed. Make sure the v50 database setup SQL has been installed.','err');if(!available)return authMessage('That username is already taken.','err');authMessage('Creating account…');const signOpts={data:{username}};if(location.protocol==='https:'||location.protocol==='http:')signOpts.emailRedirectTo=location.origin+location.pathname;const {data,error}=await client.auth.signUp({email,password:p,options:signOpts});if(error)return authMessage(error.message,'err');if(!data.session)gate('login','Account created. Check your email to verify it, then log in.','ok')}
  async function reset(){const email=getVal('prEmail');if(!email)return authMessage('Enter your email first.','err');const opts={};if(location.protocol==='https:'||location.protocol==='http:')opts.redirectTo=location.origin+location.pathname;const {error}=await client.auth.resetPasswordForEmail(email,opts);if(error)return authMessage(error.message,'err');gate('login','If that email belongs to an account, a reset link has been sent.','ok')}
  function showRecovery(){modal(`<div class="card pr-account pr-recovery-card"><div class="pr-account-head"><div class="pr-user-orb">🔐</div><div><h2>New Password</h2><div class="mu sm">Password recovery</div></div><span class="sp"></span><button class="pr-close-btn" data-a="prclose" aria-label="Close">✕</button></div><div id="prRecoveryMsg" class="pr-auth-msg" style="display:none"></div><div class="pr-auth-form"><label>New password</label><input id="prNewPass" type="password" autocomplete="new-password" minlength="8"><label>Confirm password</label><input id="prNewPass2" type="password" autocomplete="new-password" minlength="8"><button id="prSetPassBtn" class="gd" data-a="prsetpass">Update password</button></div></div>`)}
  async function setPassword(){const p=(document.getElementById('prNewPass')||{}).value||'',p2=(document.getElementById('prNewPass2')||{}).value||'',btn=document.getElementById('prSetPassBtn');recoveryMessage('');if(p.length<8)return recoveryMessage('Password must be at least 8 characters.','err');if(p!==p2)return recoveryMessage('Passwords do not match.','err');if(btn){btn.disabled=true;btn.textContent='Updating…'}const {error}=await client.auth.updateUser({password:p});if(error){if(btn){btn.disabled=false;btn.textContent='Update password'}return recoveryMessage(error.message,'err')}recoveryMessage('Password updated successfully.','ok');cleanRecoveryUrl();setTimeout(()=>{closeModal();render();toast('Password updated')},450)}
  function account(){if(!configured())return setupModal();if(!client||localOnly&&!user)return gate('login');if(!user)return gate('login');const u=profile&&profile.username||user.email?.split('@')[0]||'player',initial=String(u).charAt(0).toUpperCase();modal(`<div class="card pr-account"><div class="pr-account-head"><div class="pr-user-orb">${E(initial)}</div><div><h2>@${E(u)}</h2><div class="mu sm">${E(user.email||'')}</div></div><span class="sp"></span><button data-a="prclose">✕</button></div><div class="pr-status"><span class="pr-cloud-dot ok"></span><div><b>Cloud connected</b><div class="mu sm">Your tournaments save to this account and this device.</div></div></div><div class="pr-sect"><div class="pr-sect-title">Profile</div><div class="row"><input id="prEditUsername" maxlength="24" value="${E(u)}"><button data-a="prusername">Save username</button></div></div><div class="pr-sect"><div class="pr-sect-title">Security</div><div class="pr-auth-form"><label>New password</label><input id="prChangePass" type="password" autocomplete="new-password" minlength="8" placeholder="Leave blank unless changing"><button data-a="prchangepass">Change password</button></div><div class="row" style="margin-top:8px"><button data-a="prlogout">Sign out this device</button><button data-a="prlogoutall">Sign out everywhere</button></div></div><div class="pr-sect"><div class="pr-sect-title">Data</div><div class="row"><button data-a="prsync">Sync now</button><button data-a="prbackup">Download backup</button></div></div><div class="pr-sect pr-danger"><div class="pr-sect-title" style="color:var(--red)">Danger zone</div><div class="mu sm">Deleting your account permanently removes the auth account and cloud data. Type DELETE to unlock.</div><div class="row" style="margin-top:8px"><input id="prDeleteConfirm" placeholder="Type DELETE"><button class="dg" data-a="prdelete">Delete account</button></div></div></div>`)}
  async function username(){const v=getVal('prEditUsername').toLowerCase();if(!validUsername(v))return toast('Use 3–24 lowercase letters, numbers or underscores');const {error}=await client.from('profiles').update({username:v,updated_at:new Date().toISOString()}).eq('id',user.id);if(error)return toast(error.message);profile={...(profile||{}),username:v};label('@'+v);closeModal();render();toast('Username updated')}
  async function changePass(){const p=(document.getElementById('prChangePass')||{}).value||'';if(p.length<8)return toast('Password must be at least 8 characters');const {error}=await client.auth.updateUser({password:p});if(error)return toast(error.message);toast('Password changed')}
  async function logout(scope){await uploadNow(S);const {error}=await client.auth.signOut({scope:scope||'local'});if(error)return toast(error.message);closeModal();cleanRecoveryUrl()}
  function backup(){const blob=new Blob([JSON.stringify({pitchRoyale:S,exportedAt:new Date().toISOString(),account:profile&&profile.username||null},null,2)],{type:'application/json'}),a=document.createElement('a');a.href=URL.createObjectURL(blob);a.download='pitch-royale-backup-'+new Date().toISOString().slice(0,10)+'.json';a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1000)}
  async function deleteAccount(){if(getVal('prDeleteConfirm')!=='DELETE')return toast('Type DELETE first');if(!confirm('Permanently delete this account and its cloud data? This cannot be undone.'))return;setStatus('busy','Deleting account…',true);const {error}=await client.functions.invoke('delete-account',{body:{confirm:'DELETE'}});if(error){setStatus('err','Delete failed');return toast('Delete-account function is not deployed yet: '+error.message)}try{localStorage.removeItem('pr_cloud_owner')}catch(e){};await client.auth.signOut({scope:'local'});toast('Account deleted')}
  async function saveCfg(){const url=getVal('prCfgUrl').replace(/\/$/,''),key=getVal('prCfgKey');if(!/^https:\/\/.+\.supabase\.co$/i.test(url)||key.length<20)return toast('Enter a valid Supabase URL and publishable/anon key');localStorage.setItem('pr_supabase_config',JSON.stringify({url,key}));location.reload()}
  function local(){localOnly=true;closeModal();label('Local');cloudClass('');render();toast('Local mode')}
  function setup(){setupModal()}
  return {boot:init,queueSave,account,gate,login,signup,reset,setPassword,username,changePass,logout,backup,deleteAccount,saveCfg,local,setup,closeModal,uploadNow,get user(){return user},get client(){return client}}
})();

ACT.account=()=>PRCloud.account();
ACT.prgate=d=>PRCloud.gate(d.mode||'login');
ACT.prlogin=()=>PRCloud.login();
ACT.prsignup=()=>PRCloud.signup();
ACT.prreset=()=>PRCloud.reset();
ACT.prlocal=()=>PRCloud.local();
ACT.prclose=()=>PRCloud.closeModal();
ACT.prsavecfg=()=>PRCloud.saveCfg();
ACT.prsetup=()=>PRCloud.setup();
ACT.prsetpass=()=>PRCloud.setPassword();
ACT.prusername=()=>PRCloud.username();
ACT.prchangepass=()=>PRCloud.changePass();
ACT.prlogout=()=>PRCloud.logout('local');
ACT.prlogoutall=()=>PRCloud.logout('global');
ACT.prsync=async()=>{const ok=await PRCloud.uploadNow(S);toast(ok?'Cloud synced':'Sync failed')};
ACT.prbackup=()=>PRCloud.backup();
ACT.prdelete=()=>PRCloud.deleteAccount();

document.addEventListener('keydown',e=>{if(e.key==='Escape'&&document.getElementById('prModal'))PRCloud.closeModal()});


try{localStorage.setItem('pr_t','1');localStorage.removeItem('pr_t')}catch(e){setTimeout(function(){toast('Saving is blocked in this view. Open the file in Chrome or Safari to keep your tournaments.')},1500)}

PRCloud.boot();
