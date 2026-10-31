/* Daily Routine — hosted version.
   Signs you in with a one-time email code (Supabase), then runs the same app as the Claude version,
   with Supabase standing in for Claude's storage, photos and downloads. Each person's data is private
   to them: the database only ever returns rows that belong to the signed-in user. */
(function(){
"use strict";
const C=window.ROUTINE_CONFIG||{};
const $=id=>document.getElementById(id);
const esc=s=>String(s).replace(/[&<>"]/g,c=>({"&":"&amp;","<":"&lt;",">":"&gt;",'"':"&quot;"}[c]));
const LOCAL_KEYS=["weekly-routine.v1","weekly-routine.workouts.v1","weekly-routine.settings.v1","routine-photo-urls"];
const clearLocal=()=>LOCAL_KEYS.forEach(k=>{try{localStorage.removeItem(k)}catch(e){}});

if(!C.supabaseUrl||!C.supabaseAnonKey||/YOUR-/.test(C.supabaseUrl)){
  $("login").hidden=false;
  $("login").innerHTML=`<div class="lg-card"><h1>Daily Routine</h1><p class="lg-err">This copy isn't connected to its database yet. Add the Supabase project URL and anon key to <b>config.js</b> (see SETUP).</p></div>`;
  return;
}
const sb=window.supabase.createClient(C.supabaseUrl,C.supabaseAnonKey,{auth:{persistSession:true,autoRefreshToken:true,detectSessionInUrl:false,storageKey:"routine-auth"}});

/* ---------- home screen: on a phone's browser, suggest adding the app before signing in ----------
   Same heading and intro on every phone; only the steps differ.
   On every phone the steps come first and the form waits behind "Continue in … instead" (on iPhone a Home Screen
   app keeps its own sign-in, separate from Safari, so signing in first would mean signing in twice).
   iPhone: browsers can't be asked to install, so show the steps.
   Android: a real Install button when the browser offers one; until then (or in browsers that never do), the menu steps.
   Apps like Instagram open links in their own browser, which can't add to the Home Screen: send people to the real browser.
   Desktop, or already opened from the Home Screen: nothing. */
const UA=navigator.userAgent;
const IOS=/iPhone|iPad|iPod/.test(UA)||(/Macintosh/.test(UA)&&navigator.maxTouchPoints>1);
const ANDROID=/Android/.test(UA);
const IN_APP=(IOS||ANDROID)&&/Instagram|FBAN|FBAV|FB_IAB|LinkedInApp|Snapchat|Line\/|GSA\/|Twitter/.test(UA);
const OTHER_IOS=IOS&&/CriOS|FxiOS|EdgiOS/.test(UA);
const standalone=()=>navigator.standalone===true||(window.matchMedia&&matchMedia("(display-mode: standalone)").matches);
const SKIP="routine-a2hs-skip";
const skipped=()=>{try{return localStorage.getItem(SKIP)==="1"}catch(e){return false}};
const SHARE_ICO='<svg class="lg-ico" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 15V3M8 7l4-4 4 4"/><path d="M6 11H5a1 1 0 0 0-1 1v8a1 1 0 0 0 1 1h14a1 1 0 0 0 1-1v-8a1 1 0 0 0-1-1h-1"/></svg>';
let installEvt=null;
addEventListener("beforeinstallprompt",e=>{if(window.__routineHost)return; // signed in: leave the browser's own install option alone
  e.preventDefault();installEvt=e;const box=$("login");if(!box||box.hidden)return;
  const c=$("lg-a2hs");if(c&&c.dataset.kind==="android-steps")c.remove(); // swap the written steps for the Install button
  addInstallHint(box)});
function addInstallHint(box){
  if(!(IOS||ANDROID)||standalone()||skipped()||$("lg-a2hs"))return false;
  const done=()=>{try{localStorage.setItem(SKIP,"1")}catch(e){}const c=$("lg-a2hs");c&&c.remove();box.classList.remove("a2hs")};
  const browser=IOS?"Safari":"Chrome";
  const intro=`<h1>Add to your Home Screen</h1>
      <p class="lg-sub">Daily Routine works best as an app on your Home Screen.</p>`;
  let html,kind;
  if(IN_APP){kind="in-app";html=`<h1>Open in ${browser} first</h1>
      <p class="lg-sub">This link opened inside another app, which can't add Daily Routine to your Home Screen.</p>
      <ol class="lg-steps"><li><span>Tap <b>${IOS?"⋯":"⋮"}</b> (or the compass icon), then <b>Open in ${browser}</b> or <b>Open in browser</b>.</span></li>
      <li><span>Then follow the steps there to add it to your Home Screen.</span></li></ol>
      <button class="lg-link" type="button" id="lg-skip">Continue here instead</button>`}
  else if(IOS){kind="ios-steps";html=`${intro}
      <ol class="lg-steps"><li><span>Tap the Share button ${SHARE_ICO}${OTHER_IOS?" in the address bar":". If you can't see it, tap <b>⋯</b> first"}.</span></li>
      <li><span>Choose <b>Add to Home Screen</b>. You may need to scroll down to find it.</span></li>
      <li><span>Tap <b>Add</b>. If you see <b>Open as Web App</b>, leave it on.</span></li>
      <li><span>Open <b>Routine</b> from your Home Screen and sign in.</span></li></ol>
      <button class="lg-link" type="button" id="lg-skip">Continue in Safari instead</button>`}
  else if(installEvt){kind="android-button";html=`${intro}
      <button class="lg-btn" type="button" id="lg-inst">Install</button>
      <button class="lg-link" type="button" id="lg-skip">Continue in the browser instead</button>`}
  else{kind="android-steps";html=`${intro}
      <ol class="lg-steps"><li><span>Tap the <b>⋮</b> menu in your browser.</span></li>
      <li><span>Choose <b>Install app</b> or <b>Add to Home screen</b>.</span></li>
      <li><span>Open <b>Routine</b> from your Home Screen and sign in.</span></li></ol>
      <button class="lg-link" type="button" id="lg-skip">Continue in the browser instead</button>`}
  const card=document.createElement("div");card.className="lg-card";card.id="lg-a2hs";card.dataset.kind=kind;card.innerHTML=html;
  box.prepend(card);
  box.classList.add("a2hs"); // the steps come first; the form waits
  $("lg-skip").onclick=()=>{done();const f=box.querySelector("input:not([hidden])");f&&setTimeout(()=>f.focus(),30)};
  const ib=$("lg-inst");if(ib)ib.onclick=async()=>{const e=installEvt;installEvt=null;if(!e)return;
    try{await e.prompt();const r=await e.userChoice;if(r&&r.outcome==="accepted"){done();return}}catch(err){}
    done()};
  return true;
}

/* ---------- sign in: email and password (default), or a code by email if config says authMode:"code" ----------
   Both forms stay on the page (one hidden) so password managers always find a stable sign-in form. */
let errT={};
function flashErr(id,msg){const el=$(id);if(!el)return;clearTimeout(errT[id]);el.classList.remove("fade");el.textContent=msg||"";el.hidden=!msg;
  if(msg)errT[id]=setTimeout(()=>{el.classList.add("fade");errT[id]=setTimeout(()=>{el.hidden=true;el.textContent="";el.classList.remove("fade")},350)},5000)}
function showLogin(note){
  const box=$("login");box.hidden=false;
  if(C.authMode==="code")return codeLogin(note);
  box.innerHTML=`<form class="lg-card" id="lg-fp" method="post" action="#" novalidate>
      <h1>Daily Routine</h1><p class="lg-sub">Sign in to continue.</p>
      <p class="lg-err" id="lg-err" role="alert" hidden></p>
      <label for="lg-email">Email</label><input id="lg-email" name="email" type="email" autocomplete="username" inputmode="email" autocapitalize="none" spellcheck="false" required>
      <label for="lg-pass">Password</label><input id="lg-pass" name="password" type="password" autocomplete="current-password" required>
      <button class="lg-btn" id="lg-btn" type="submit">Sign in</button>
      <button class="lg-link" type="button" id="lg-forgot">Forgot password?</button>
      <button class="lg-link" type="button" id="lg-new">New here? Create an account</button></form>
    <form class="lg-card" id="lg-fs" method="post" action="#" novalidate hidden>
      <h1>Create your account</h1><p class="lg-sub">Choose a password and enter the invite code you were given.</p>
      <p class="lg-err" id="lg-serr" role="alert" hidden></p>
      <label for="lg-semail">Email</label><input id="lg-semail" name="new-email" type="email" autocomplete="username" inputmode="email" autocapitalize="none" spellcheck="false" required>
      <label for="lg-spass">Password</label><input id="lg-spass" name="new-password" type="password" autocomplete="new-password" placeholder="At least 8 characters" required>
      <label for="lg-spass2">Password again</label><input id="lg-spass2" name="new-password-confirm" type="password" autocomplete="new-password" required>
      <label for="lg-scode">Invite code</label><input id="lg-scode" name="invite-code" type="text" autocomplete="off" autocapitalize="none" spellcheck="false" placeholder="From whoever shared the app">
      
      <button class="lg-btn" id="lg-sbtn" type="submit">Create account</button>
      <button class="lg-link" type="button" id="lg-have">Already have an account? Sign in</button></form>
    <form class="lg-card" id="lg-fr" method="post" action="#" novalidate hidden>
      <h1>Reset your password</h1><p class="lg-sub" id="lg-frsub"></p>
      <p class="lg-err" id="lg-frerr" role="alert" hidden></p>
      <div class="lg-step" id="lg-fr1">
        <label for="lg-femail">Email</label><input id="lg-femail" name="email" type="email" autocomplete="username" inputmode="email" autocapitalize="none" spellcheck="false" required>
        <button class="lg-btn" id="lg-fsend" type="submit">Email me a code</button></div>
      <div class="lg-step" id="lg-fr2" hidden>
        <div class="lg-step" id="lg-fcodewrap"><label for="lg-fcode">Code from the email</label><input id="lg-fcode" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="10" required></div>
        <label for="lg-fp1">New password</label><input id="lg-fp1" name="new-password" type="password" autocomplete="new-password" placeholder="At least 8 characters" required>
        <label for="lg-fp2">New password again</label><input id="lg-fp2" name="new-password-confirm" type="password" autocomplete="new-password" required>
        <button class="lg-btn" id="lg-fset" type="submit">Set new password</button>
        <button class="lg-link" type="button" id="lg-fresend">Send a new code</button></div>
      <button class="lg-link" type="button" id="lg-fback">Back to sign in</button></form>`;
  const fp=$("lg-fp"),fs=$("lg-fs");
  const toSignIn=()=>{fs.hidden=true;fp.hidden=false;flashErr("lg-serr","");if($("lg-semail").value)$("lg-email").value=$("lg-semail").value;setTimeout(()=>$($("lg-email").value?"lg-pass":"lg-email").focus(),30)};
  const toSignUp=()=>{fp.hidden=true;fs.hidden=false;flashErr("lg-err","");$("lg-semail").value=$("lg-email").value;setTimeout(()=>$("lg-semail").focus(),30)};
  $("lg-new").onclick=toSignUp;$("lg-have").onclick=toSignIn;
  /* forgotten password: sign in with a 6-digit code emailed to them, then set a new password, all in this card.
     A code rather than a reset link, because on iPhone a link opens in Safari, not the Home Screen app. */
  const fr=$("lg-fr");let frEmail="",frSession=null;
  const frStep=(n,sub)=>{$("lg-fr1").hidden=n!==1;$("lg-fr2").hidden=n!==2;
    $("lg-frsub").innerHTML=sub||(n===1?"We'll email you a code so you can choose a new password.":`Enter the code we sent to <b>${esc(frEmail)}</b>, then choose a new password. Not there? Check your junk folder.`)};
  const toForgot=()=>{fp.hidden=true;fs.hidden=true;fr.hidden=false;flashErr("lg-err","");flashErr("lg-frerr","");frSession=null;$("lg-fcodewrap").hidden=false;
    $("lg-femail").value=$("lg-email").value;frStep(1);setTimeout(()=>$("lg-femail").focus(),30)};
  const fromForgot=()=>{fr.hidden=true;fp.hidden=false;flashErr("lg-frerr","");if(frEmail||$("lg-femail").value)$("lg-email").value=frEmail||$("lg-femail").value;setTimeout(()=>$($("lg-email").value?"lg-pass":"lg-email").focus(),30)};
  $("lg-forgot").onclick=toForgot;$("lg-fback").onclick=fromForgot;
  async function sendCode(again){const email=again?frEmail:$("lg-femail").value.trim().toLowerCase();
    if(!/^\S+@\S+\.\S+$/.test(email)){flashErr("lg-frerr","Enter your email address.");return}
    const b=again?$("lg-fresend"):$("lg-fsend"),label=b.textContent;b.disabled=true;b.textContent="Sending…";
    let res;try{res=await sb.auth.signInWithOtp({email,options:{shouldCreateUser:false}})}catch(err){res={error:err}}
    b.disabled=false;b.textContent=label;
    if(res.error){const m=String(res.error.message||"");
      flashErr("lg-frerr",/signups? not allowed|not found|user not found/i.test(m)?"There's no account with that email. Check it, or create an account."
        :/rate|seconds|too many/i.test(m)?"A code was sent very recently. Wait a minute, then try again."
        :!navigator.onLine||/fetch|network|load failed|offline/i.test(m)?"Couldn't send the email. Check your connection and try again."
        :"Couldn't send the email right now. Try again in a few minutes.");return}
    frEmail=email;frSession=null;flashErr("lg-frerr","");$("lg-fcodewrap").hidden=false;
    frStep(2,again?`We've sent a new code to <b>${esc(email)}</b>. Enter it below, then choose a new password. Not there? Check your junk folder.`:"");
    if(!again)$("lg-fcode").value="";setTimeout(()=>$("lg-fcode").focus(),30)}
  $("lg-fresend").onclick=()=>sendCode(true);
  fr.onsubmit=async e=>{e.preventDefault();if(!$("lg-fr1").hidden){sendCode(false);return}
    const token=$("lg-fcode").value.replace(/\s/g,""),p1=$("lg-fp1").value,p2=$("lg-fp2").value;
    if(!frSession&&!/^\d{6,10}$/.test(token)){flashErr("lg-frerr","Enter the code from the email.");return}
    if(p1.length<8){flashErr("lg-frerr","Choose a password of at least 8 characters.");return}
    if(p1!==p2){flashErr("lg-frerr","The two passwords don't match.");return}
    const b=$("lg-fset");b.disabled=true;b.textContent="Saving…";const done=()=>{b.disabled=false;b.textContent="Set new password"};
    if(!frSession){let r;try{r=await sb.auth.verifyOtp({email:frEmail,token,type:"email"})}catch(err){r={error:err}}
      if(r.error||!r.data||!r.data.session){done();const m=String(r.error&&r.error.message||"");
        flashErr("lg-frerr",/expired|invalid|token/i.test(m)?"That code didn't work or has expired. Check it, or send a new one.":"Couldn't check the code. Check your connection and try again.");return}
      frSession=r.data.session;$("lg-fcodewrap").hidden=true} // the code is used up; a retry only needs the password
    let u;try{u=await sb.auth.updateUser({password:p1})}catch(err){u={error:err}}
    done();const m=String(u.error&&u.error.message||"");
    if(u.error&&!/same|different/i.test(m)){flashErr("lg-frerr",/weak|short|least/i.test(m)?"That password is too weak. Make it longer.":"Couldn't save the new password. Check your connection and try again.");return}
    box.hidden=true;start(frSession)}; // a "same as before" password is fine: they're signed in either way
  if(note)flashErr("lg-err",note);
  const hint=!note&&addInstallHint(box);
  fp.onsubmit=async e=>{e.preventDefault();const email=$("lg-email").value.trim().toLowerCase(),password=$("lg-pass").value;
    if(!/^\S+@\S+\.\S+$/.test(email)||!password){flashErr("lg-err","Enter your email and password.");return}
    const b=$("lg-btn");b.disabled=true;b.textContent="Signing in…";
    let res;try{res=await sb.auth.signInWithPassword({email,password})}catch(err){res={error:err}}
    b.disabled=false;b.textContent="Sign in";
    if(res.error||!res.data||!res.data.session){const m=String(res.error&&res.error.message||"");
      flashErr("lg-err",/invalid|credentials|password/i.test(m)?"That email and password don't match. Check them, or tap Forgot password.":/rate|too many/i.test(m)?"Too many attempts. Wait a minute, then try again.":"Couldn't sign in. Check your connection and try again.");return}
    box.hidden=true;start(res.data.session)};
  fs.onsubmit=async e=>{e.preventDefault();const email=$("lg-semail").value.trim().toLowerCase(),p1=$("lg-spass").value,p2=$("lg-spass2").value;
    if(!/^\S+@\S+\.\S+$/.test(email)){flashErr("lg-serr","Enter a valid email address.");return}
    if(p1.length<8){flashErr("lg-serr","Choose a password of at least 8 characters.");return}
    if(p1!==p2){flashErr("lg-serr","The two passwords don't match.");return}
    const b=$("lg-sbtn");b.disabled=true;b.textContent="Creating…";
    const invite_code=$("lg-scode").value.trim();
    let res;try{res=await sb.auth.signUp({email,password:p1,options:{data:invite_code?{invite_code}:{}}})}catch(err){res={error:err}}
    b.disabled=false;b.textContent="Create account";
    const m=String(res.error&&res.error.message||"");
    if(res.error){flashErr("lg-serr",/not_invited|database error|saving new user|signups not allowed|not allowed/i.test(m)?($("lg-scode").value.trim()?"That invite code isn't right. Check it with whoever shared the app.":"Enter the invite code you were given.")
      :/already|registered|exists/i.test(m)?"There's already an account for this email. Sign in instead."
      :/weak|password/i.test(m)?"That password is too weak. Make it longer.":/rate|too many/i.test(m)?"Too many attempts. Wait a minute, then try again.":"Couldn't create the account. Check your connection and try again.");return}
    if(res.data&&res.data.session){box.hidden=true;start(res.data.session);return}
    toSignIn();flashErr("lg-err","Account created. Check your email for a confirmation link, then sign in here.")};
  if(!hint||!box.classList.contains("a2hs"))setTimeout(()=>$("lg-email").focus(),50);
}
function codeLogin(note){
  const box=$("login");box.hidden=false;let email="";
  const step1=n=>{box.innerHTML=`<form class="lg-card" id="lg-f1" novalidate>
      <h1>Daily Routine</h1><p class="lg-sub">Sign in with your email. We'll send you a code — no password needed.</p>
      ${n?`<p class="lg-err" role="alert">${esc(n)}</p>`:""}
      <label for="lg-email">Email</label><input id="lg-email" type="email" autocomplete="email" inputmode="email" required value="${esc(email)}">
      <button class="lg-btn" type="submit">Send code</button></form>`;
    $("lg-f1").onsubmit=async e=>{e.preventDefault();email=$("lg-email").value.trim().toLowerCase();if(!/^\S+@\S+\.\S+$/.test(email)){step1("Enter a valid email address.");return}
      const b=e.submitter||box.querySelector("button");b.disabled=true;b.textContent="Sending…";
      const {error}=await sb.auth.signInWithOtp({email,options:{shouldCreateUser:!!C.allowSignups}});
      if(error){step1(/signup|not allowed|not found/i.test(error.message)?"This email isn't set up yet. Ask whoever shared the app with you to add it.":/rate|seconds/i.test(error.message)?"Too many attempts. Wait a minute, then try again.":"Couldn't send the code. Check your connection and try again.");return}
      step2()};
    if(!(!n&&addInstallHint(box)&&box.classList.contains("a2hs")))setTimeout(()=>$("lg-email").focus(),50)};
  const step2=n=>{box.innerHTML=`<form class="lg-card" id="lg-f2" novalidate>
      <h1>Check your email</h1><p class="lg-sub">Enter the code sent to <b>${esc(email)}</b>.</p>
      ${n?`<p class="lg-err" role="alert">${esc(n)}</p>`:""}
      <label for="lg-code">Code</label><input id="lg-code" type="text" inputmode="numeric" autocomplete="one-time-code" maxlength="10" required>
      <button class="lg-btn" type="submit">Sign in</button>
      <button class="lg-link" type="button" id="lg-back">Use a different email</button></form>`;
    $("lg-back").onclick=()=>step1();
    $("lg-f2").onsubmit=async e=>{e.preventDefault();const token=$("lg-code").value.replace(/\s/g,"");if(!/^\d{6,10}$/.test(token)){step2("Enter the code from the email.");return}
      const b=e.submitter||box.querySelector(".lg-btn");b.disabled=true;b.textContent="Signing in…";
      const {data,error}=await sb.auth.verifyOtp({email,token,type:"email"});
      if(error||!data.session){step2("That code didn't work. Check it, or go back and send a new one.");return}
      box.hidden=true;start(data.session)};
    setTimeout(()=>$("lg-code").focus(),50)};
  step1(note);
}

/* ---------- the adapter: same interface the app uses inside Claude ---------- */
function start(session){
  const user=session.user,uid=user.id;
  // one person per browser's local copy: if someone else signs in here, start them clean
  try{if(localStorage.getItem("routine-owner")!==uid){clearLocal();localStorage.setItem("routine-owner",uid)}}catch(e){}
  const netErr=e=>{const m=String((e&&(e.message||e.error_description))||e||"");
    return {code:!navigator.onLine||/fetch|network|timeout|load failed|offline|503|502|504/i.test(m)?"unavailable":/jwt|auth|401|403|permission|policy/i.test(m)?"not_granted":"internal",message:m}};
  const waitOnline=ms=>new Promise(r=>{const t=setTimeout(done,ms);function done(){clearTimeout(t);removeEventListener("online",done);r()}addEventListener("online",done)});

  class Col{constructor(path){this.path=path}
    doc(id){return new Doc(this.path,id)}
    async get(){ // keeps trying while offline, so the app shows local data now and cloud data when it can
      for(;;){let res;try{res=await sb.from("docs").select("id,data").eq("col",this.path)}catch(e){res={error:e}}
        if(!res.error)return {docs:(res.data||[]).map(r=>({id:r.id,data:()=>r.data}))};
        const e=netErr(res.error);if(e.code!=="unavailable")throw e;await waitOnline(10000)}}
    onSnapshot(cb){const path=this.path;
      const ch=sb.channel("docs-"+Math.random().toString(36).slice(2)).on("postgres_changes",{event:"*",schema:"public",table:"docs",filter:"user_id=eq."+uid},p=>{
        const row=p.new&&p.new.id?p.new:p.old;if(!row||row.col!==path)return;
        const type=p.eventType==="DELETE"?"removed":p.eventType==="INSERT"?"added":"modified";
        try{cb({docChanges:()=>[{type,doc:{id:row.id,data:()=>row.data}}]})}catch(e){}}).subscribe();
      return ()=>sb.removeChannel(ch)}}
  class Doc{constructor(col,id){this.col=col;this.id=id}
    collection(name){return new Col(this.col+"/"+this.id+"/"+name)}
    async set(body){let res;try{res=await sb.from("docs").upsert({user_id:uid,col:this.col,id:this.id,data:body,updated_at:new Date().toISOString()},{onConflict:"user_id,col,id"})}catch(e){res={error:e}}
      if(res.error)throw netErr(res.error)}}
  const db={collection:p=>new Col(p),doc:p=>{const i=p.lastIndexOf("/");return new Doc(p.slice(0,i),p.slice(i+1))}};

  // photos: private bucket, one folder per person; shown through long-lived signed links cached on the device
  const BLANK="data:image/gif;base64,R0lGODlhAQABAIAAAAAAAP///yH5BAEAAAAALAAAAAABAAEAAAIBRAA7";
  let urls={};try{urls=JSON.parse(localStorage.getItem("routine-photo-urls")||"{}")}catch(e){}
  const pending=new Set(),failed=new Set();let pt=null;
  const saveUrls=()=>{try{localStorage.setItem("routine-photo-urls",JSON.stringify(urls))}catch(e){}};
  async function fetchUrls(){const ids=[...pending];pending.clear();if(!ids.length)return;
    let res;try{res=await sb.storage.from("photos").createSignedUrls(ids.map(i=>uid+"/"+i),60*60*24*30)}catch(e){res={error:e}}
    if(res.error||!res.data){ids.forEach(i=>failed.add(i));return}
    res.data.forEach((d,i)=>{if(d&&d.signedUrl)urls[ids[i]]={url:d.signedUrl,exp:Date.now()+29*864e5};else failed.add(ids[i])});
    saveUrls();window.__routineRerender&&window.__routineRerender()}
  function photoUrl(id){const u=urls[id];if(u&&u.exp>Date.now())return u.url;
    if(!failed.has(id)){pending.add(id);clearTimeout(pt);pt=setTimeout(fetchUrls,40)}return u?u.url:BLANK}
  const newId=()=>[...crypto.getRandomValues(new Uint8Array(16))].map(b=>b.toString(16).padStart(2,"0")).join("");
  async function put(id,blob,upsert){const type=blob.type||"image/jpeg";
    if(blob.size>10*1024*1024)throw {code:"too_large"};
    let res;try{res=await sb.storage.from("photos").upload(uid+"/"+id,blob,{contentType:type,upsert:!!upsert})}catch(e){res={error:e}}
    if(res.error){const m=String(res.error.message||"");throw {code:/size|large/i.test(m)?"too_large":/mime|type/i.test(m)?"unsupported_type":netErr(res.error).code}}
    failed.delete(id);pending.add(id);await fetchUrls()}
  const assets={upload:async blob=>{const id=newId();await put(id,blob,false);return {id}},
    delete:async id=>{await sb.storage.from("photos").remove([uid+"/"+(typeof id==="string"?id:id.id)]);delete urls[id];saveUrls()}};

  const downloads={save:async({filename,data})=>{
    const blob=data instanceof Blob?data:new Blob([data],{type:/\.json$/.test(filename)?"application/json":/\.csv$/.test(filename)?"text/csv":"application/octet-stream"});
    const file=new File([blob],filename,{type:blob.type});
    if(navigator.canShare&&/iPhone|iPad|iPod/.test(navigator.userAgent)&&navigator.canShare({files:[file]})){
      try{await navigator.share({files:[file]});return {status:"saved"}}catch(e){if(e&&e.name==="AbortError")throw {code:"declined"}}}
    const a=document.createElement("a");a.href=URL.createObjectURL(blob);a.download=filename;document.body.appendChild(a);a.click();
    setTimeout(()=>{URL.revokeObjectURL(a.href);a.remove()},4000);return {status:"saved"}}};

  window.claude={use:async name=>({db,user:{id:async()=>uid},assets,downloads})[name]||null};
  window.__routineHost={email:user.email,photoUrl,canChangePassword:C.authMode!=="code",
    changePassword:async pw=>{const {error}=await sb.auth.updateUser({password:pw});if(error)throw new Error(/same|different/i.test(error.message)?"same":/weak|short|least/i.test(error.message)?"weak":"failed")},
    importPhoto:(id,blob)=>put(id,blob,true),
    // feedback goes to a table people can add to but not read; the database fills in their email
    sendFeedback:async({kind,message})=>{
      const ver=(document.querySelector('meta[name="app-version"]')||{}).content||"";
      const device=[/iPhone|iPad|iPod/.test(navigator.userAgent)?"iPhone/iPad":/Android/.test(navigator.userAgent)?"Android":"Computer",
        innerWidth+"×"+innerHeight,standalone()?"Home Screen app":"browser",navigator.userAgent].join(" · ").slice(0,400);
      let res;try{res=await sb.from("feedback").insert({user_id:uid,kind:kind||null,message:String(message).slice(0,2000),app_version:ver,device})}catch(e){res={error:e}}
      if(res.error){const e=netErr(res.error);throw new Error(e.code==="unavailable"?"offline":"failed")}},
    deleteAccount:async()=>{
      // photos first (the storage API removes the files), then the database removes records and the login
      let r;try{r=await sb.storage.from("photos").list(uid,{limit:1000})}catch(e){r={error:e}}
      if(r.error)throw new Error("photos");
      const paths=(r.data||[]).map(f=>uid+"/"+f.name);
      if(paths.length){const d=await sb.storage.from("photos").remove(paths);if(d.error)throw new Error("photos")}
      const {error}=await sb.rpc("delete_my_account");if(error)throw new Error("account");
      try{await sb.auth.signOut({scope:"local"})}catch(e){}
      clearLocal();try{localStorage.removeItem("routine-owner");localStorage.removeItem("routine-tip-done")}catch(e){}
      try{sessionStorage.setItem("routine-deleted","1")}catch(e){}location.replace(location.pathname)},
    signOut:async()=>{try{await sb.auth.signOut()}catch(e){}clearLocal();try{localStorage.removeItem("routine-owner")}catch(e){}location.replace(location.pathname)}};
  // run the app
  document.body.classList.add("in");
  const src=$("app-src").textContent,sc=document.createElement("script");sc.textContent=src;document.body.appendChild(sc);
}

sb.auth.onAuthStateChange(ev=>{if(ev==="SIGNED_OUT"&&window.__routineHost)location.replace(location.pathname)});
let deleted=false;try{deleted=sessionStorage.getItem("routine-deleted")==="1";sessionStorage.removeItem("routine-deleted")}catch(e){}
sb.auth.getSession().then(({data})=>{if(data&&data.session&&!deleted)start(data.session);else showLogin(deleted?"Your account and data have been deleted.":"")}).catch(()=>showLogin());
if("serviceWorker" in navigator&&location.protocol==="https:")addEventListener("load",()=>navigator.serviceWorker.register("sw.js").then(r=>r.update()).catch(()=>{}));
})();
