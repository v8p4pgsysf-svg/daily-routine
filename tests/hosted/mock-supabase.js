/* A stand-in for supabase-js used only in testing. Enforces "own rows only" like the real database's RLS. */
(function(){
const DBK="mock-db",STK="mock-storage";
const load=k=>{try{return JSON.parse(localStorage.getItem(k)||"{}")}catch(e){return {}}};
const save=(k,v)=>localStorage.setItem(k,JSON.stringify(v));
const bc=new BroadcastChannel("mock-rt");const listeners=[];
bc.onmessage=e=>listeners.forEach(l=>l(e.data,true));
const uidOf=email=>{let h=0;for(const c of email)h=(h*31+c.charCodeAt(0))>>>0;const x=h.toString(16).padStart(8,"0");return `${x}-0000-4000-8000-${x}${x.slice(0,4)}`};
window.__mockOffline=false;
function createClient(){
  const auth={_cbs:[],
    async getSession(){const s=JSON.parse(localStorage.getItem("routine-auth")||"null");return {data:{session:s}}},
    async signInWithOtp({email}){window.__lastOtpEmail=email;if(email.startsWith("stranger"))return {error:{message:"Signups not allowed for otp"}};return {error:null}},
    async verifyOtp({email,token}){if(token!=="123456")return {data:{},error:{message:"Token has expired or is invalid"}};
      const s={access_token:"t",user:{id:uidOf(email),email}};localStorage.setItem("routine-auth",JSON.stringify(s));return {data:{session:s},error:null}},
    async signInWithPassword({email,password}){const pw=JSON.parse(localStorage.getItem("mock-pw")||"{}");const want=pw[email]||"Start-1234";
      if(JSON.parse(localStorage.getItem("mock-deleted")||"[]").includes(email))return {data:{},error:{message:"Invalid login credentials"}};
      if(email.startsWith("stranger")||password!==want)return {data:{},error:{message:"Invalid login credentials"}};
      const s={access_token:"t",user:{id:uidOf(email),email}};localStorage.setItem("routine-auth",JSON.stringify(s));return {data:{session:s},error:null}},
    async updateUser({password}){const s=JSON.parse(localStorage.getItem("routine-auth")||"null");const pw=JSON.parse(localStorage.getItem("mock-pw")||"{}");
      if((pw[s.user.email]||"Start-1234")===password)return {error:{message:"New password should be different from the old password."}};pw[s.user.email]=password;localStorage.setItem("mock-pw",JSON.stringify(pw));return {error:null}},
    async signUp({email,password,options}){const inv=JSON.parse(localStorage.getItem("mock-invites")||"[]");const pw=JSON.parse(localStorage.getItem("mock-pw")||"{}");
      const code=(localStorage.getItem("mock-code")||"change-me").toLowerCase(),given=String((options&&options.data&&options.data.invite_code)||"").trim().toLowerCase();
      if(pw[email])return {data:{},error:{message:"User already registered"}};
      if(!inv.includes(email)&&!(code!=="change-me"&&given===code))return {data:{},error:{message:"Database error saving new user"}};
      pw[email]=password;localStorage.setItem("mock-pw",JSON.stringify(pw));const s={access_token:"t",user:{id:uidOf(email),email}};localStorage.setItem("routine-auth",JSON.stringify(s));return {data:{session:s,user:s.user},error:null}},
    async signOut(){localStorage.removeItem("routine-auth");this._cbs.forEach(c=>c("SIGNED_OUT"));return {error:null}},
    onAuthStateChange(cb){this._cbs.push(cb);return {data:{subscription:{unsubscribe(){}}}}}};
  const me=()=>{const s=JSON.parse(localStorage.getItem("routine-auth")||"null");return s&&s.user.id};
  const off=()=>window.__mockOffline?{error:{message:"TypeError: Failed to fetch"}}:null;
  function from(){return {
    select(){const q={_f:{},eq(c,v){this._f[c]=v;return this},then(res,rej){const o=off();if(o)return Promise.resolve(o).then(res,rej);
      const db=load(DBK),u=me();const rows=Object.values(db).filter(r=>r.user_id===u&&Object.entries(this._f).every(([c,v])=>r[c]===v));
      return Promise.resolve({data:rows.map(r=>({id:r.id,data:r.data})),error:null}).then(res,rej)}};return q},
    upsert(row){return {then(res,rej){const o=off();if(o)return Promise.resolve(o).then(res,rej);
      const u=me();if(row.user_id!==u||!row.col.startsWith("data/users/"+u))return Promise.resolve({error:{message:"new row violates row-level security policy"}}).then(res,rej);
      const db=load(DBK),key=[row.user_id,row.col,row.id].join("|"),ev=db[key]?"UPDATE":"INSERT";db[key]=row;save(DBK,db);
      const msg={eventType:ev,new:row};bc.postMessage(msg);listeners.forEach(l=>l(msg,false));
      return Promise.resolve({error:null}).then(res,rej)}}}}}
  function channel(){const ch={_cb:null,_filter:null,on(t,f,cb){this._filter=f.filter;this._cb=cb;return this},subscribe(){
    const fn=(msg,remote)=>{if(this._filter==="user_id=eq."+msg.new.user_id)this._cb(msg)};this._fn=fn;listeners.push(fn);return this}};return ch}
  const storage={from(){return {
    async upload(path,blob,{upsert}={}){const o=off();if(o)return o;const u=me();if(!path.startsWith(u+"/"))return {error:{message:"new row violates row-level security policy"}};
      const st=load(STK);if(st[path]&&!upsert)return {error:{message:"The resource already exists"}};
      const url=await new Promise(r=>{const fr=new FileReader();fr.onload=()=>r(fr.result);fr.readAsDataURL(blob)});st[path]=url;save(STK,st);return {data:{path},error:null}},
    async createSignedUrls(paths){const st=load(STK),u=me();return {data:paths.map(p=>p.startsWith(u+"/")&&st[p]?{path:p,signedUrl:st[p]}:{path:p,error:"not found",signedUrl:null}),error:null}},
    async list(folder){const st=load(STK),u=me();if(folder!==u)return {data:[],error:null};return {data:Object.keys(st).filter(k=>k.startsWith(u+"/")).map(k=>({name:k.slice(u.length+1)})),error:null}},
    async remove(paths){const st=load(STK),u=me();paths.forEach(p=>{if(p.startsWith(u+"/"))delete st[p]});save(STK,st);return {error:null}}}}};
  async function rpc(name){if(name!=="delete_my_account")return {error:{message:"unknown"}};const u=me();if(!u)return {error:{message:"not_signed_in"}};
    const db=load(DBK);for(const k in db)if(db[k].user_id===u)delete db[k];save(DBK,db);
    const s=JSON.parse(localStorage.getItem("routine-auth"));const del=JSON.parse(localStorage.getItem("mock-deleted")||"[]");del.push(s.user.email);localStorage.setItem("mock-deleted",JSON.stringify(del));
    return {error:null}}
  return {auth,from,channel,removeChannel(){},storage,rpc};
}
window.supabase={createClient};
})();
