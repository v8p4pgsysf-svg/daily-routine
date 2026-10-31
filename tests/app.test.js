const {JSDOM}=require("jsdom");const fs=require("fs");
const html=fs.readFileSync(process.argv[2],"utf8");
let store={};
function boot(now){
  const dom=new JSDOM("<!doctype html><html><head></head><body>"+html+"</body></html>",{runScripts:"dangerously",url:"https://artifact.test/",pretendToBeVisual:true,
    beforeParse(w){if(now){const RD=w.Date;const t=new RD(now).getTime();class FD extends RD{constructor(...a){a.length?super(...a):super(t)}static now(){return t}};w.Date=FD}
      for(const k in store)w.localStorage.setItem(k,store[k]);w.scrollTo=()=>{};w.scrollBy=()=>{};w.Element.prototype.scrollIntoView=function(){};
      w.addEventListener("error",e=>console.log("PAGE ERROR",e.message));}});
  return dom.window;
}
const ok=(c,m)=>{console.log((c?"PASS ":"FAIL ")+m);if(!c)process.exitCode=1};
const click=(w,el)=>el.dispatchEvent(new w.MouseEvent("click",{bubbles:true}));
const type=(w,el,v)=>{el.value=String(v);el.dispatchEvent(new w.Event("input",{bubbles:true}))};
const setDate=(w,el,v)=>{el.value=v;el.dispatchEvent(new w.Event("change",{bubbles:true}))};
function save(w){store={};for(let i=0;i<w.localStorage.length;i++){const k=w.localStorage.key(i);store[k]=w.localStorage.getItem(k)}}
const $=(w,s)=>w.document.querySelector(s);const $$=(w,s)=>[...w.document.querySelectorAll(s)];

let w=boot();
// 1 start workout A on Monday 26 Oct
click(w,$(w,"#tab-strength"));
click(w,$(w,'[data-st="type"][data-type="A"]'));
$(w,"#st-date").value="2026-10-26";
click(w,$(w,'[data-st="start"]'));
ok($(w,"#ed-prog2")&&$(w,"#ed-prog2").textContent==="0/16","1. Workout A started with 16 sets, none done");
ok($$(w,".ex").length===6&&$(w,".ex .nm").textContent==="Barbell Squat","   6 exercise cards in order, Barbell Squat first");
// 2+3 enter bench 60 x 8,7,6 and squat 80 x 8,8,8, tick
const fill=(xi,sets)=>sets.forEach(([kg,r],si)=>{type(w,$(w,`#w-${xi}-${si}`),kg);type(w,$(w,`#r-${xi}-${si}`),r);click(w,$(w,`[data-tick="${xi}-${si}"]`))});
fill(0,[[80,8],[80,8],[80,8]]);fill(1,[[60,8],[60,7],[60,6]]);
ok($(w,"#ed-prog2").textContent==="6/16","2-3. Weights/reps entered and 6 sets ticked");
ok($(w,"#ex-0").classList.contains("done")&&/All sets done/.test($(w,"#exf-0").textContent),"   Squat card shows all sets done");
ok(/Top of range/.test($(w,"#exf-0").textContent)&&!/Top of range/.test($(w,"#exf-1").textContent),"   Progression flag on squat (8,8,8) only, not bench (8,7,6)");
// resume check: pause and come back
ok(!$(w,'#st-main [data-st="close"]'),"   Only Finish and Discard at the bottom (no Back)");
click(w,$(w,"#tab-week"));
ok(/Workout A in progress/.test($(w,"#today").textContent),"   Leaving mid-workout shows Resume in Today");
click(w,$(w,'#today [data-st="resume"]'));
ok($(w,"#ed-prog2").textContent==="6/16"&&$(w,"#w-1-0").value==="60","   Resumed with entries intact");
// 4 save
click(w,$(w,'[data-st="finish"]'));
ok(/saved/.test($(w,"#st-msg").textContent),"4. Workout saved");
// 5 scorecard
click(w,$(w,"#tab-week"));
const s=JSON.parse(w.localStorage.getItem("weekly-routine.workouts.v1"));
ok(Object.values(s).filter(x=>x.status==="done").length===1,"   One completed workout stored");
ok($(w,'[data-ct="strength"]').textContent==="1/3"&&$(w,"button.wk").textContent==="A","5. Scorecard strength shows 1/3 with an A on Monday");
// resave / edit shouldn't double count
const id=Object.keys(s)[0];
click(w,$(w,"button.wk"));
ok($(w,".hitem.open .hdetail")&&/60×8 · 60×7 · 60×6/.test($(w,".hitem.open").textContent),"6a. Tapping the scorecard box drops down the workout in Training history");
click(w,$(w,".hitem.open .hrow"));ok(!$(w,".hitem.open"),"    Tapping the line again closes it");
click(w,$(w,"button.wk"));click(w,$(w,".hitem.open [data-edit]"));
ok($(w,"#w-1-1").value==="60"&&$(w,"#r-1-1").value==="7","6. Reopened workout shows recorded results (bench set 2: 60 x 7)");
type(w,$(w,"#r-1-2"),"7");click(w,$(w,'[data-st="close"]'));
click(w,$(w,"#tab-week"));
ok($(w,'[data-ct="strength"]').textContent==="1/3","   Editing a saved workout does not double count");
// manual tick preserved on another day + workout day
ok(!$(w,'#d-strength-1'),"   No hand-tick box for strength: saved workouts are the only input");
// 7 next workout A shows previous
click(w,$(w,"#tab-strength"));
click(w,$(w,'[data-st="type"][data-type="A"]'));
$(w,"#st-date").value="2026-10-30";
click(w,$(w,'[data-st="start"]'));
ok([0,1,2].map(i=>$(w,`#sr-1-${i} .pv`).textContent.replace("Last ","")).join(" · ")==="60×8 · 60×7 · 60×7","7. Next Workout A shows last bench session in the Prev column: 60×8 · 60×7 · 60×7");
ok($(w,"#w-1-0").value==="60"&&$(w,"#r-1-0").value===""&&$(w,"#r-1-0").placeholder==="8","   Weight prefilled, reps left blank with last time as a hint");
ok(!$$(w,".setrow.done").length,"   No sets pre-ticked");
ok(w.document.getElementById("pane-strength").classList.contains("focus"),"   Focused mode on during the workout (history and progress hidden)");
ok(/\+2\.5 kg from last time/.test($(w,"#ex-0 .exprev").textContent),"   Squat flagged ready: +2.5 kg from last time");
{const lw=parseFloat($(w,"#sr-0-0 .pv").textContent.replace("Last ",""));
ok([0,1,2].every(i=>parseFloat($(w,`#w-0-${i}`).value)===lw+2.5),"   Squat weights prefilled 2.5 kg up on last time ("+lw+" → "+(lw+2.5)+")");}
ok($(w,"#w-1-0").value==="60","   Bench not ready, so it stays at last time's weight");
// tick bench with blank reps -> uses hint
click(w,$(w,'[data-tick="1-0"]'));
ok($(w,"#r-1-0").value==="8"&&$(w,"#sr-1-0").classList.contains("done"),"   Ticking a blank set fills last time's reps");
type(w,$(w,"#w-0-0"),"82.5");
ok($(w,"#w-0-1").value==="82.5"&&$(w,"#w-0-2").value==="82.5","   Changing set 1 weight carries to later sets");
fill(0,[[82.5,8],[82.5,7],[82.5,7]]);
click(w,$(w,'[data-st="finish"]'));
click(w,$(w,"#tab-week"));
ok($(w,'[data-ct="strength"]').textContent==="2/3","   Second workout counted (2/3)");
// 8 progress
click(w,$(w,"#tab-strength"));
const sel=$(w,"#prog-ex");sel.value="squat";sel.dispatchEvent(new w.Event("change",{bubbles:true}));
ok($$(w,"#st-prog svg").length===1&&/82.5 kg × 8/.test($(w,"#st-prog .pbs").textContent),"8. Squat progress: 1 chart, heaviest set 82.5 kg × 8");
ok($$(w,"#st-history .hrow").length===2,"   History lists both workouts");
// lateral raise shared across workouts? (no data) just check option exists once
ok($$(w,'#prog-ex option[value="lateral_raise"]').length===1,"   Lateral raise is a single exercise across A, B and C");
// delete updates scorecard
// 9 refresh
save(w);w.close();w=boot();
ok($(w,'[data-ct="strength"]').textContent==="2/3","9. After refresh, scorecard still 2/3");
click(w,$(w,"#tab-strength"));
ok($$(w,"#st-history .hrow").length===2,"   After refresh, workout history intact");
// reset week keeps workouts
// delete one workout
click(w,$(w,"button.wk"));
click(w,$(w,'.hitem.open [data-st="hdel"]'));click(w,$(w,'.hitem.open [data-st="hdel"]'));
click(w,$(w,"#tab-week"));
ok($(w,'[data-ct="strength"]').textContent==="1/3","   Deleting a workout updates the scorecard to 1/3");
// export
// Progress tab carries strength through
click(w,$(w,"#tab-progress"));
ok($$(w,"#pslifts .lrow:not(.lhd)").length>=2&&$(w,"#pschart svg"),"P. Progress tab shows workouts-per-week chart and key lifts");
w.close();
// --- Wednesday: Today view
store={};w=boot("2026-10-28T09:00:00");
ok(/Workout B/.test($(w,"#today .tact").textContent)&&$(w,'#today [data-st="start-today"]'),"T1. Wednesday Today shows Workout B with a Start button");
ok(/Prepare breakfasts/.test($(w,"#today").textContent)&&/For Thursday to Sunday/.test($(w,"#today").textContent),"T2. Wednesday shows breakfast prep covering Thursday to Sunday");
ok($(w,"#revbody").hidden&&/Due Sun 1 Nov/.test($(w,"#revsub").textContent),"R1. Midweek the review is collapsed to one row, due Sunday 1 Nov");
click(w,$(w,"#revtoggle"));ok(!$(w,"#revbody").hidden,"   Tapping the row opens it early");click(w,$(w,"#revtoggle"));
click(w,$(w,"#d-protein-2"));
ok(!$(w,"#t-protein-2")&&$(w,"#d-protein-2").checked&&$(w,'[data-ct="protein"]').textContent==="1/7","T3. Today has no habit boxes; grid protein tick counts");
click(w,$(w,"#t-breakfast-1"));
ok($(w,"#d-breakfast-1").checked&&$(w,'[data-ct="breakfast"]').textContent==="1/2","T4. Breakfast prep in Today fills the same weekly slot");
click(w,$(w,'#today [data-st="start-today"]'));
ok(!$(w,"#pane-strength").hidden&&/Workout B/.test($(w,"#st-main .stbar").textContent)&&$(w,"#ed-date").value==="2026-10-28","T5. Start goes straight into Workout B dated today");
type(w,$(w,"#w-0-0"),100);type(w,$(w,"#r-0-0"),8);click(w,$(w,'[data-tick="0-0"]'));
click(w,$(w,'[data-st="finish"]'));
click(w,$(w,"#tab-week"));
ok(/Workout B done/.test($(w,"#today").textContent)&&$(w,'[data-ct="strength"]').textContent==="1/3","T6. Today shows Workout B done; weekly strength 1/3");
w.close();
// --- Sunday: review
store={};w=boot("2026-11-01T18:00:00");
ok(/Weekly review/.test($(w,"#today").textContent)&&/Prepare lunches/.test($(w,"#today").textContent),"S1. Sunday Today lists lunch prep, breakfast prep and the review");
ok($(w,'[data-st="rev-complete"]').disabled,"S2. Complete review disabled until weight and one answer are in");
type(w,$(w,"#well"),"Hit all sessions");
ok($(w,'[data-st="rev-complete"]').disabled,"   Still disabled with an answer but no weight");
type(w,$(w,"#weight"),"79.4");
ok(!$(w,'[data-st="rev-complete"]').disabled,"   Enabled with weight plus one answer");
type(w,$(w,"#way"),"Late nights");type(w,$(w,"#improve"),"Bed by 11");
click(w,$(w,'[data-st="rev-complete"]'));
ok($(w,'[data-ct="review"]').textContent==="1/1"&&!!$(w,"#daily .revbox.done")&&/Done/.test($(w,"#today .revpill").textContent),"S3. Completing the review updates the weekly target, grid and Today");
click(w,$(w,'[data-st="rev-undo"]'));
ok($(w,'[data-ct="review"]').textContent==="0/1","   Marking it not done reverses the count");
ok(!$(w,"#revbody").hidden,"R2. On Sunday the review is open automatically");
save(w);w.close();w=boot("2026-11-02T08:00:00");
ok(/Bed by 11/.test($(w,"#today .tfocus").textContent),"R3. Monday's Today shows last week's improvement as this week's focus");
ok(/Finish last week's review/.test($(w,"#today").textContent),"R4. Monday prompts to finish last week's incomplete review");
click(w,$(w,'[data-goto="review-last"]'));
ok($(w,"#weeklabel").textContent==="26 Oct – 1 Nov"&&!$(w,"#revbody").hidden&&$(w,"#well").value==="Hit all sessions","   Prompt opens last week's review with its answers");
click(w,$(w,'[data-st="rev-complete"]'));
ok($(w,'[data-ct="review"]').textContent==="1/1","   Completing it late counts for last week");
// --- timer and swap
store={};w=boot();
click(w,$(w,"#tab-strength"));click(w,$(w,'[data-st="type"][data-type="A"]'));click(w,$(w,'[data-st="start"]'));
ok(/^0:0\d$/.test($(w,"#ed-timer").textContent),"W1. Timer starts at 0:0x when the workout begins");
click(w,$(w,'[data-swap="0"]'));ok(!$(w,"#sw-0").hidden,"W2. Swap opens an inline box");
$(w,"#swin-0").value="Goblet Squat";click(w,$(w,'[data-swapgo="0"]'));
ok($(w,"#ex-0 .nm").textContent==="Goblet Squat"&&/swapped for Barbell Squat/.test($(w,"#ex-0").textContent),"W3. Exercise swapped for this workout, original noted");
type(w,$(w,"#w-0-0"),24);type(w,$(w,"#r-0-0"),10);click(w,$(w,'[data-tick="0-0"]'));
const t0=Date.now();while(Date.now()-t0<1100){}
w.document.dispatchEvent(new w.Event("visibilitychange"));
ok($(w,"#ed-timer").textContent!=="0:00","W4. Timer advances from wall-clock time (not a counter)");
click(w,$(w,"#ed-pause"));const pv=$(w,"#ed-timer").textContent;
ok($(w,"#ed-pause").textContent==="Resume"&&$(w,"#ed-tlab").textContent==="Paused","W4b. Pause stops the clock and offers Resume");
const t1=Date.now();while(Date.now()-t1<1100){}
w.document.dispatchEvent(new w.Event("visibilitychange"));
ok($(w,"#ed-timer").textContent===pv,"   Paused time does not advance");
click(w,$(w,"#ed-pause"));ok($(w,"#ed-pause").textContent==="Pause","   Resume restarts it");
// log every remaining set -> auto stop
const sx=Object.values(JSON.parse(w.localStorage.getItem("weekly-routine.workouts.v1")))[0];
sx.items.forEach((it,xi)=>it.log.forEach((l,si)=>{if(!(xi===0&&si===0)){type(w,$(w,`#w-${xi}-${si}`),20);type(w,$(w,`#r-${xi}-${si}`),10);click(w,$(w,`[data-tick="${xi}-${si}"]`))}}));
ok(/all sets logged/.test($(w,"#ed-tlab").textContent)&&$(w,"#ed-pause").textContent==="Resume","W4c. Timer stops automatically once every set is logged");
click(w,$(w,'[data-st="finish"]'));
const ws=Object.values(JSON.parse(w.localStorage.getItem("weekly-routine.workouts.v1")));
const it0=ws[0].items[0];
ok(ws[0].accMs>=1000&&ws[0].activeFrom===null,"W5. Finishing stops the timer and saves the duration");
ok(it0.ex==="custom_goblet_squat"&&it0.swappedFrom==="squat"&&it0.log[0].w===24&&it0.log[0].r===10,"W6. History saves the actual exercise with its weight and reps");
click(w,$(w,'[data-st="type"][data-type="A"]'));
ok(/Barbell Squat/.test($(w,"#st-main .plist").textContent)&&!/Goblet/.test($(w,"#st-main .plist").textContent),"W7. Standard programme unchanged for next Workout A");
ok($$(w,'#prog-ex option[value="custom_goblet_squat"]').length===1,"W8. Swapped exercise has its own progress history");
// --- cardio
store={};w=boot("2026-10-27T07:30:00");
ok(/Cardio/.test($(w,"#today .tact").textContent)&&$(w,'#today [data-st="log-cardio"]'),"C1. Tuesday's Today shows Cardio with Log cardio");
ok(!$(w,"#t-cardio-1")&&!$(w,"#d-cardio-1"),"   No cardio tick boxes; logging is the only input");
click(w,$(w,'#today [data-st="log-cardio"]'));
ok(!$(w,"#pane-strength").hidden&&$(w,"#cf-card")&&$(w,'[data-ctype="Run"]').getAttribute("aria-pressed")==="true"&&$(w,"#cf-date").value==="2026-10-27","C2. Opens the cardio form in Training, Run preselected, dated today");
click(w,$(w,'[data-st="cf-save"]'));ok(/minutes/.test($(w,"#cf-err").textContent),"   Minutes required");
type(w,$(w,"#cf-min"),32);type(w,$(w,"#cf-km"),5.1);click(w,$(w,'[data-st="cf-save"]'));
click(w,$(w,"#tab-week"));
ok($(w,'[data-ct="cardio"]').textContent==="1/2"&&$(w,"button.wk.cw").textContent==="32","C3. Saved run counts 1/2 and shows 32 (minutes) on Tuesday");
ok(/Run done/.test($(w,"#today").textContent)&&/5.1 km/.test($(w,"#today").textContent),"   Today shows Run done with minutes and distance");
// walk on Thursday doesn't count
click(w,$(w,"#tab-strength"));click(w,$(w,'[data-st="log-cardio"]'));
click(w,$(w,'[data-ctype="Walk"]'));ok(!$(w,"#cf-walk").hidden,"C4. Choosing Walk explains it won't count");
setDate(w,$(w,"#cf-date"),"2026-10-25");type(w,$(w,"#cf-min"),45);click(w,$(w,'[data-st="cf-save"]'));
// custom type
click(w,$(w,'[data-st="log-cardio"]'));type(w,$(w,"#cf-type"),"Stair climber");click(w,$(w,'[data-ceff="Moderate"]'));setDate(w,$(w,"#cf-date"),"2026-10-26");type(w,$(w,"#cf-min"),20);click(w,$(w,'[data-st="cf-save"]'));
click(w,$(w,"#tab-week"));
ok($(w,'[data-ct="cardio"]').textContent==="2/2","C5. Custom 'Stair climber' counts; the walk (last week) doesn't affect this week");
click(w,$(w,"#tab-strength"));
ok($$(w,'#st-history .htype.cw').length===3&&/not counted/.test($(w,"#st-history").textContent)&&/Stair climber · Moderate/.test($(w,"#st-history").textContent),"C6. History lists all three cardio sessions, walk marked not counted");
// edit without duplicating
click(w,$(w,"#tab-week"));click(w,$(w,'button.wk.cw[title^="Run"]'));
ok(/5.1 km/.test($(w,".hitem.open .hdetail").textContent)&&/6:16 \/km/.test($(w,".hitem.open .hdetail").textContent),"C7a. Grid box drops down the run in history with distance and pace");
click(w,$(w,".hitem.open [data-cardio-edit]"));
ok($(w,"#cf-min").value==="32"&&/Edit cardio/.test($(w,"#cf-card").textContent),"C7. Tapping the grid box opens that session to edit");
type(w,$(w,"#cf-min"),35);click(w,$(w,'[data-st="cf-save"]'));
const cs=Object.values(JSON.parse(w.localStorage.getItem("weekly-routine.workouts.v1"))).filter(x=>x.kind==="cardio"&&x.status!=="deleted");
ok(cs.length===3&&cs.some(x=>x.minutes===35),"   Edit updates the same record (still 3 sessions, 35 min)");
click(w,$(w,"#tab-week"));ok($(w,'[data-ct="cardio"]').textContent==="2/2"&&$(w,'button.wk.cw[title^="Run"]').textContent==="35","   Count unchanged, box shows 35");
click(w,$(w,'button.wk.cw[title^="Run"]'));click(w,$(w,'.hitem.open [data-st="hdel"]'));click(w,$(w,'.hitem.open [data-st="hdel"]'));
click(w,$(w,"#tab-week"));ok($(w,'[data-ct="cardio"]').textContent==="1/2","C8. Deleting a session updates the count");
click(w,$(w,"#tab-progress"));ok($(w,"#pccchart svg"),"C9. Progress shows cardio minutes per week");
save(w);w.close();w=boot("2026-10-27T19:00:00");
ok($(w,'[data-ct="cardio"]').textContent==="1/2","C10. Cardio survives a refresh");
// --- photos linked to weight trend
const id1="a".repeat(32),id2="b".repeat(32);
store={"weekly-routine.v1":JSON.stringify({
  "2026-10-12":{week:"2026-10-12",weight:80.0,photos:[{id:id1}],updatedAt:1},
  "2026-10-19":{week:"2026-10-19",weight:79.2,photos:[],updatedAt:1},
  "2026-10-26":{week:"2026-10-26",weight:78.4,photos:[{id:id2}],updatedAt:1}})};
w=boot("2026-10-30T12:00:00");click(w,$(w,"#tab-progress"));
ok($$(w,"#wchart .wring").length===2&&/ringed weeks have photos/.test($(w,"#wchart").textContent),"PH1. Weight chart rings the two weeks that have photos");
click(w,$(w,'#wchart circle[data-lb="2026-10-26|0"]'));
ok(!$(w,"#lb").hidden&&/78.4 kg/.test($(w,"#lb-trend").textContent)&&/−1.6 kg since first photo \(12 Oct\)/.test($(w,"#lb-trend").textContent),"PH2. Tapping a ringed point opens the photo with 78.4 kg, −1.6 kg since first photo");
ok($$(w,"#lb-trend .lbme").length===1&&$(w,"#lb-pos").textContent==="2 / 2","   Mini trend highlights that week; position 2 / 2");
click(w,$(w,"#lb-prev"));
ok(/80.0 kg/.test($(w,"#lb-trend").textContent)&&!/since first photo/.test($(w,"#lb-trend").textContent)&&$(w,"#lb-prev").disabled,"PH3. Stepping back moves to 12 Oct at 80.0 kg");
w.document.dispatchEvent(new w.KeyboardEvent("keydown",{key:"ArrowRight",bubbles:true}));
ok($(w,"#lb-pos").textContent==="2 / 2","   Arrow key steps forward");
// --- strength index + status board
const mk=(id,date,items)=>({id,type:"A",date,status:"done",startedAt:Date.parse(date),updatedAt:1,notes:"",accMs:0,activeFrom:null,
  items:items.map(([ex,sets])=>({ex,name:ex,sets:sets.length,lo:6,hi:8,log:sets.map(([w,r])=>({w,r,done:true}))}))});
const S={};
[["s1","2026-10-12",[["squat",[[80,8]]],["bench",[[60,8]]],["rdl",[[100,8]]]]],
 ["s2","2026-10-19",[["squat",[[82.5,8]]],["bench",[[60,8]]],["rdl",[[102.5,8]]],["lateral_raise",[[8,15]]]]],
 ["s3","2026-10-26",[["squat",[[85,8]]],["bench",[[60,7]]],["rdl",[[100,8]]],["lateral_raise",[[10,12]]]]]].forEach(([id,d,it])=>S[id]=mk(id,d,it));
store={"weekly-routine.workouts.v1":JSON.stringify(S)};
w=boot("2026-10-30T12:00:00");click(w,$(w,"#tab-strength"));
const ov=$(w,"#st-prog .ovw");
ok(ov&&!$(w,"#st-prog .ovw svg")&&/Stalled/.test(ov.textContent),"X1. Training shows the lift status board (no index chart)");
click(w,$(w,"#tab-progress"));ok($(w,"#psindex svg")&&/4 lifts/.test($(w,"#psindex").textContent),"   Progress shows the strength index across 4 lifts");
click(w,$(w,"#tab-strength"));
ok(/Bench Press/.test($(w,".ovw").textContent)&&/Romanian Deadlift/.test($(w,".ovw").textContent)&&!/Barbell Squat/.test($(w,".ovw").textContent)&&/Progressing\s*1/.test($(w,".sst.up").textContent),"X2. Bench stalled and RDL holding are named; progressing shown as a count");
click(w,$(w,'.ovw [data-st="prog-toggle"]'));ok(/Barbell Squat/.test($(w,".ovw").textContent),"   'Show lifts' reveals squat as progressing");
ok(/Building data.*Lateral Raise/.test(ov.textContent),"   Lateral raise (2 sessions) listed as building data");
click(w,$(w,'.ovw [data-prog-ex="bench"]'));
ok($(w,"#prog-ex").value==="bench"&&/Heaviest set/.test($(w,"#prog-detail").textContent),"X3. Tapping a lift opens its own chart below");
// --- reopening mid-workout
store={};w=boot();click(w,$(w,"#tab-strength"));click(w,$(w,'[data-st="start"]'));save(w);w.close();
w=boot();ok(!$(w,"#pane-strength").hidden&&$(w,"#ed-timer"),"Z1. Reopening the page mid-workout lands back in the workout");
// --- alcohol-free days ticked like other habits
store={};
w=boot("2026-10-30T20:00:00");
ok($(w,"#d-af-4")&&!$(w,"#d-drink-4")&&$(w,'[data-ct="af"]').textContent==="0/6","D1. Alcohol row is tick-the-days-without-a-drink (0/6)");
click(w,$(w,"#d-af-0"));click(w,$(w,"#d-af-1"));
ok($(w,'[data-ct="af"]').textContent==="2/6","D2. Ticking two alcohol-free days makes 2/6");
// tomorrow + planned week row
click(w,$(w,"#weeklabel"));
ok(!$(w,"#today .tmrw"),"P1. No Tomorrow line in the Today box");
ok($(w,"#planbody").hidden&&$(w,"#plantoggle"),"P2. Planned week is a collapsed row");
click(w,$(w,"#plantoggle"));ok(!$(w,"#planbody").hidden&&$$(w,"#plan .pday").length===7,"   Tapping shows all seven days");
const order=[...w.document.querySelectorAll("#pane-week > section")].map(x=>x.id||x.querySelector("h2,.rh-title")?.textContent||x.className);
ok(order.indexOf("review-sec")<order.indexOf("Planned week")||order.join("|").indexOf("review-sec")<order.join("|").indexOf("Planned week"),"   Planned week sits below the Sunday review");
// review summary
click(w,$(w,"#revtoggle"));
ok(/This week at a glance/.test($(w,"#revsum").textContent)&&/Targets hit/.test($(w,"#revsum").textContent)&&/Alcohol2\/6 days/.test($(w,"#revsum").textContent),"R5. Review opens with a read-only week summary above the questions");
ok($(w,"#revsum").compareDocumentPosition($(w,"#well"))&w.Node.DOCUMENT_POSITION_FOLLOWING,"   The three questions are still underneath");
w.close();
// --- timer idle cap and editable duration
store={};const T0=Date.parse("2026-10-30T07:00:00");
w=boot(T0);click(w,$(w,"#tab-strength"));click(w,$(w,'[data-st="start"]'));save(w);w.close();
w=boot(T0+10*60000);type(w,$(w,"#w-0-0"),80);type(w,$(w,"#r-0-0"),8);click(w,$(w,'[data-tick="0-0"]'));save(w);w.close();
w=boot(T0+50*60000);
ok($(w,"#ed-tlab").textContent==="Stopped at your last set"&&$(w,"#ed-timer").textContent==="10:00","TM1. After 30+ min with no ticks the timer stops at the last set (10:00)");
click(w,$(w,'[data-st="finish"]'));
const sv=Object.values(JSON.parse(w.localStorage.getItem("weekly-routine.workouts.v1")))[0];
ok(sv.accMs===600000,"TM2. Finishing later still saves 10 min, not 50");
click(w,$(w,".hrow"));click(w,$(w,".hitem.open [data-edit]"));
ok($(w,"#ed-dur").value==="10","TM3. Saved workout shows an editable duration (10)");
type(w,$(w,"#ed-dur"),45);
ok(Object.values(JSON.parse(w.localStorage.getItem("weekly-routine.workouts.v1")))[0].accMs===2700000,"   Changing it to 45 saves 45 min");
// --- top box stays on today while the grid shows another week
store={};w=boot("2026-10-28T09:00:00");
click(w,$(w,"#d-protein-0"));
const tgt0=$(w,"#targetshit").textContent,p0=$(w,"#pct").textContent;
click(w,$(w,"#prev"));
ok(!$(w,"#today").hidden&&/Wednesday 28 Oct/.test($(w,"#tdate").textContent),"WK1. Looking back a week keeps the Today box on today");
ok($(w,"#pct").textContent===p0&&$(w,"#weeklabel").textContent==="19 Oct – 25 Oct"&&$(w,'[data-ct="protein"]').textContent==="0/7","   Weekly targets stay on this week; the grid shows last week (0/7)");
click(w,$(w,"#t-breakfast-1"));
const wk=JSON.parse(w.localStorage.getItem("weekly-routine.v1"));
ok(wk["2026-10-26"].breakfast[1]===true&&!(wk["2026-10-19"]&&wk["2026-10-19"].breakfast[1]),"   Ticking prep in Today saves to this week, not the week on screen");
click(w,$(w,"#weeklabel"));ok($(w,"#weeklabel").textContent==="This week"&&$(w,"#d-breakfast-1").checked,"WK2. Tapping the dates returns to this week, where the tick shows");
// --- master export
// --- routine settings
store={};w=boot("2026-10-28T09:00:00");
const chg=(w,el,v)=>{if(el.type==="checkbox")el.checked=v;else el.value=String(v);el.dispatchEvent(new w.Event("change",{bubbles:true}))};
click(w,$(w,"#d-protein-0"));save(w);w.close();w=boot("2026-10-28T09:00:00");
click(w,$(w,"#tab-progress"));click(w,$(w,'#setcog'));
ok(!$(w,"#setsheet").hidden&&$$(w,"#setbody .swk").length===3&&$(w,'[data-snw="3"]').getAttribute("aria-pressed")==="true","SET1. Edit routine opens with the current 3 workouts");
const lab=d=>$$(w,"#setbody .pgw")[d].textContent;
ok(["0","2","5"].every(d=>$(w,`[data-pgym="${d}"]`).getAttribute("aria-pressed")==="true")&&lab(0)==="Workout A"&&lab(1)==="Cardio"&&lab(2)==="Workout B"&&lab(5)==="Workout C"&&lab(6)==="Cardio"&&lab(3)==="Rest","   Planned days read Workout A / Cardio / Workout B / Rest… with Gym and Cardio buttons");
click(w,$(w,'[data-pgym="2"]'));ok(lab(5)==="Workout B"&&/Gym days 2\/3/.test($(w,"#setbody .pcount").textContent),"   Unticking Wednesday re-letters: Saturday becomes B; count shows 2/3 gym days");
click(w,$(w,'[data-st="set-save"]'));ok(!$(w,"#setsheet").hidden&&/Pick 3 gym days in Planned days \(2 picked\)/.test($(w,".serr").textContent),"   Can't save until every gym session has a day");
click(w,$(w,'[data-pgym="3"]'));click(w,$(w,'[data-pgym="4"]'));ok(/You have 3 weights sessions a week/.test($(w,"#setbody").textContent)&&lab(4)==="Rest","   Can't tick more gym days than sessions");
click(w,$(w,'[data-pgym="3"]'));click(w,$(w,'[data-pgym="2"]'));ok(lab(2)==="Workout B"&&lab(5)==="Workout C","   Ticking Wednesday again restores A/B/C");
ok($(w,'[data-sname="0-0"]').textContent==="Barbell Squat"&&$(w,'[data-sexf="0-0-sets"]').value==="3"&&$(w,'[data-sexf="0-0-lo"]').value==="6"&&$(w,'[data-sexf="0-0-hi"]').value==="8","   Workout A starts with Barbell Squat · 3 · 6 – 8 in a grid row");
click(w,$(w,'[data-snw="2"]'));click(w,$(w,'[data-pgym="2"]'));click(w,$(w,'[data-pgym="3"]'));
click(w,$(w,'[data-sexadd="0"]'));{const n=$$(w,'#setbody [data-row^="0-"]').length-1;ok(!!$(w,`input[data-sexn="0-${n}"]`),"   Add exercise opens a name box on the new row");type(w,$(w,`[data-sexn="0-${n}"]`),"Hip Thrust");type(w,$(w,`[data-sexf="0-${n}-lo"]`),"8");type(w,$(w,`[data-sexf="0-${n}-hi"]`),"12");}
chg(w,$(w,'[data-shab="protein"]'),false);chg(w,$(w,"[data-scard]"),3);click(w,$(w,'[data-pcard="4"]'));
chg(w,$(w,'[data-sdays="af"]'),5);
click(w,$(w,'[data-st="set-save"]'));
ok($(w,"#setsheet").hidden,"SET2. Saving closes the sheet");
click(w,$(w,"#tab-week"));
ok(!$(w,"#d-protein-1")&&$(w,'[data-ct="strength"]').textContent==="0/2"&&$(w,'[data-ct="cardio"]').textContent==="0/3"&&$(w,'[data-ct="af"]').textContent==="0/5","   Grid drops protein; strength target 2, cardio 3, alcohol-free 5");
click(w,$(w,"#plantoggle"));const pd=$$(w,"#plan .pday");
ok(/Workout B/.test(pd[3].textContent)&&/Cardio/.test(pd[4].textContent)&&/Rest/.test(pd[2].textContent)&&!/Workout C/.test($(w,"#plan").textContent),"   Planned week: B on Thursday, cardio added Friday, Wednesday now rest, no Workout C");
click(w,$(w,"#tab-strength"));
ok($$(w,'[data-st="type"]').map(b=>b.dataset.type).join(",")==="A,B,cardio","   Training picker shows A, B and Cardio only");
click(w,$(w,'[data-st="type"][data-type="A"]'));click(w,$(w,'[data-st="start"]'));
ok($$(w,"#st-main .ex .nm").map(e=>e.textContent).includes("Hip Thrust"),"SET3. Starting Workout A includes the new Hip Thrust");
click(w,$(w,'[data-st="discard"]'));click(w,$(w,'[data-st="discard"]'));
save(w);w.close();w=boot("2026-10-28T09:00:00");
ok($(w,'[data-ct="strength"]').textContent==="0/2"&&!$(w,"#d-protein-0"),"SET4. Settings survive a reload");
click(w,$(w,"#tab-progress"));click(w,$(w,'#setcog'));
chg(w,$(w,'[data-shab="protein"]'),true);
click(w,$(w,'[data-sexdel="1-0"]'));while($(w,'[data-sexdel^="1-"]'))click(w,$(w,'[data-sexdel^="1-"]'));
click(w,$(w,'[data-st="set-save"]'));
ok(!$(w,"#setsheet").hidden&&/Workout B needs at least one exercise/.test($(w,".serr").textContent),"SET5. A workout with no exercises can't be saved");
click(w,$(w,'[data-st="set-cancel"]'));click(w,$(w,"#tab-week"));
ok(!$(w,"#d-protein-0"),"   Cancel discards the unsaved edits");
click(w,$(w,"#tab-progress"));click(w,$(w,'#setcog'));
chg(w,$(w,'[data-shab="protein"]'),true);click(w,$(w,'[data-st="set-save"]'));click(w,$(w,"#tab-week"));
ok($(w,"#d-protein-0").checked,"SET6. Turning protein back on brings back the ticks logged before it was off");
click(w,$(w,'#setcog'));ok(!$(w,'[data-srevday]')&&$(w,'[data-pexp="review"]').textContent.trim()==="Sun"&&$(w,'[data-pexp="breakfast"]').textContent.trim()==="Wed · Sun","PR1. Prep and review show their days on one line (Sun; Wed · Sun), buttons hidden");
click(w,$(w,'[data-pexp="review"]'));ok($$(w,'[data-srevday]').length===7,"   Tapping the days opens the day buttons");
click(w,$(w,'[data-srevday="2"]'));ok($(w,'[data-pexp="review"]').textContent.trim()==="Wed","   Picking Wednesday updates the line");click(w,$(w,'[data-st="set-save"]'));click(w,$(w,"#tab-week"));
ok(/Weekly review/.test($(w,"#today").textContent)&&!$(w,"#revbody").hidden&&/Due today/.test($(w,"#revsub").textContent),"SET8. Review moved to Wednesday: it's on Today and open, due today");
click(w,$(w,"#plantoggle"));ok(/Weekly review/.test($$(w,"#plan .pday")[2].textContent)&&!/Weekly review/.test($$(w,"#plan .pday")[6].textContent),"   Planned week shows the review on Wednesday, not Sunday");
click(w,$(w,'#setcog'));chg(w,$(w,'[data-srev]'),false);click(w,$(w,'[data-st="set-save"]'));
ok($(w,"#review-sec").hidden&&!$(w,'[data-ct="review"]')&&!/Weekly review/.test($(w,"#today").textContent),"SET9. Review switched off: section, grid row and Today task all gone");
click(w,$(w,"#tab-progress"));click(w,$(w,'#setcog'));
chg(w,$(w,"[data-scard]"),1);ok($$(w,'[data-pcard][aria-pressed="true"]').length===1,"SET10. Lowering cardio to 1 keeps only the first cardio day");
click(w,$(w,'[data-pcard="5"]'));ok(/You have 1 cardio session a week/.test($(w,"#setbody").textContent),"   Can't tick more cardio days than sessions");
click(w,$(w,'[data-st="set-presets"]'));ok($$(w,"#setbody .preset").length===2,"SET7. Suggested programmes: full body and glute focus");
click(w,$(w,'[data-preset="fullbody"]'));ok(/Tap to replace/.test($(w,'[data-preset="fullbody"]').textContent),"   Choosing one asks for a second tap");
click(w,$(w,'[data-preset="fullbody"]'));
ok($$(w,"#setbody details.swk").length===3&&$(w,'[data-sname="0-0"]').textContent==="Barbell Squat"&&["0","2","5"].every(d=>$(w,`[data-pgym="${d}"]`).getAttribute("aria-pressed")==="true"),"   It loads A/B/C with the original exercises on Mon, Wed, Sat");
click(w,$(w,'[data-st="set-save"]'));click(w,$(w,"#tab-week"));
ok($(w,"#setsheet").hidden&&$(w,'[data-ct="strength"]').textContent==="0/3"&&$(w,'[data-ct="af"]').textContent==="0/5"&&$(w,'[data-ct="cardio"]').textContent==="0/1","   Saved: 3 workouts again, while habits and cardio keep your own settings");
w.close();
// --- glute programme
store={};w=boot("2026-10-28T09:00:00");
click(w,$(w,'#setcog'));click(w,$(w,'[data-st="set-presets"]'));click(w,$(w,'[data-preset="glute"]'));click(w,$(w,'[data-preset="glute"]'));
ok($(w,'[data-sname="0-0"]').textContent==="Hip Thrust Machine"&&$(w,'[data-sname="1-0"]').textContent==="Reverse Dumbbell Lunge"&&$(w,'[data-sname="2-5"]').textContent==="Reverse Pec Deck"&&$(w,'[data-sexf="1-1-sets"]').value==="3","GL1. Glute focus loads A/B/C with its exercises");
click(w,$(w,'[data-st="set-save"]'));click(w,$(w,"#tab-strength"));click(w,$(w,'[data-st="type"][data-type="A"]'));click(w,$(w,'[data-st="start"]'));
ok($$(w,"#st-main .ex .nm").map(e=>e.textContent).join("|")==="Hip Thrust Machine|Bulgarian Split Squat|Flat Dumbbell Bench Press|Seated Cable Row|Assisted Pull-Up|Leg Curl","   Workout A starts with the glute programme's exercises");
w.close();
// --- exercise picker and programme-only progress list
store={};w=boot("2026-10-28T09:00:00");
const focus=(w,el)=>{el.focus();el.dispatchEvent(new w.FocusEvent("focusin",{bubbles:true}))};
click(w,$(w,'#setcog'));click(w,$(w,'[data-sname="0-0"]'));const ein=$(w,'[data-sexn="0-0"]');focus(w,ein);type(w,ein,"thru");
{const opts=$$(w,"#setbody .exsug [data-exsug]").map(b=>b.textContent);ok(opts.includes("Hip Thrust Machine")&&!opts.includes("Bench Press"),"EP1. Typing filters the exercise list ("+opts.join(", ")+")");}
click(w,$(w,'#setbody .exsug [data-exsug="Hip Thrust Machine"]'));
ok(ein.value==="Hip Thrust Machine"&&!$(w,"#setbody .exsug"),"   Picking one fills the box and closes the list");
type(w,$(w,'[data-sexf="0-1-lo"]'),"10");type(w,$(w,'[data-sexf="0-1-hi"]'),"8");click(w,$(w,'[data-st="set-save"]'));ok(/the second reps number should be the higher one/.test($(w,".serr").textContent),"EP1b. A reps range the wrong way round is caught on save");
type(w,$(w,'[data-sexf="0-1-lo"]'),"5");type(w,$(w,'[data-sexf="0-1-hi"]'),"7");
click(w,$(w,'[data-st="set-save"]'));click(w,$(w,"#tab-strength"));
{const o=$$(w,"#prog-ex option").map(x=>x.value).filter(Boolean);ok(o.includes("hip_thrust_machine")&&!o.includes("squat")&&o.length===16,"EP2. Exercise progress lists only the programme's 16 exercises (squat swapped out is gone)");}
click(w,$(w,'[data-st="type"][data-type="A"]'));click(w,$(w,'[data-st="start"]'));click(w,$(w,'[data-swap="1"]'));
const sin=$(w,"#swin-1");focus(w,sin);ok($$(w,".swapbox .exsug [data-exsug]").length>10,"EP3. Swap shows the full exercise list before typing");
type(w,sin,"lat p");click(w,$(w,'.swapbox .exsug [data-exsug="Lat Pulldown"]'));ok(sin.value==="Lat Pulldown","   and picking from it fills the swap box");
w.close();
// --- cancel with unsaved changes
store={};w=boot("2026-10-28T09:00:00");
click(w,$(w,'#setcog'));click(w,$(w,'[data-st="set-cancel"]'));ok($(w,"#setsheet").hidden,"CX1. Cancel with no changes closes straight away");
click(w,$(w,'#setcog'));click(w,$(w,'[data-pgym="3"]'));click(w,$(w,'[data-pgym="2"]'));click(w,$(w,'[data-st="set-cancel"]'));
ok(!$(w,"#setsheet").hidden&&$(w,'[data-st="set-cancel"]').textContent==="Discard?","   With changes, the first tap asks Discard?");
click(w,$(w,'[data-st="set-cancel"]'));ok($(w,"#setsheet").hidden&&/Workout B/.test($$(w,"#plan .pday")[2].textContent),"   Second tap discards; Wednesday is still Workout B");
w.close();
// --- no weights sessions
store={};w=boot("2026-10-28T09:00:00");
click(w,$(w,'#setcog'));click(w,$(w,'[data-snw="0"]'));
ok(!$(w,'[data-pgym]')&&$$(w,"#setbody details.swk").length===0&&!/Gym days/.test($(w,"#setbody .pcount").textContent),"Z1. Weights 0: no gym buttons, no workouts, no gym-day count");
click(w,$(w,'[data-st="set-save"]'));
ok($(w,"#setsheet").hidden&&!$(w,'[data-ct="strength"]'),"Z2. Saved: the Strength row leaves the check-ins grid");
click(w,$(w,"#tab-strength"));ok($$(w,'[data-st="type"]').map(b=>b.dataset.type).join(",")==="cardio"&&$(w,'[data-st="log-cardio"]'),"Z3. Training offers cardio only");
click(w,$(w,"#tab-progress"));ok(!/target/.test($(w,"#pschart-h").textContent),"Z4. Progress strength chart has no target line label");
click(w,$(w,"#tab-week"));click(w,$(w,"#revtoggle"));ok(!/Strength/.test($(w,"#revsum").textContent),"Z5. Review summary leaves out Strength");
w.close();
// --- kg / lb
store={};w=boot("2026-10-28T09:00:00");
click(w,$(w,'#setcog'));ok(!!$(w,'[data-sunit="kg"]')&&$(w,'[data-sunit="kg"]').getAttribute("aria-pressed")==="true","U1. Settings has a Units row, kg by default");
click(w,$(w,'[data-sunit="lb"]'));click(w,$(w,'[data-st="set-save"]'));
click(w,$(w,"#tab-strength"));click(w,$(w,'[data-st="type"][data-type="A"]'));setDate(w,$(w,"#st-date"),"2026-10-27");click(w,$(w,'[data-st="start"]'));
ok(/lb/.test($(w,"#w-0-0").getAttribute("aria-label")),"U2. Workout weight boxes are in lb");
type(w,$(w,"#w-0-0"),"135");type(w,$(w,"#r-0-0"),"8");click(w,$(w,'[data-tick="0-0"]'));
{const ss=JSON.parse(w.localStorage.getItem("weekly-routine.workouts.v1"));const it=Object.values(ss)[0].items[0];
 ok(Math.abs(it.log[0].w-61.235)<0.01,"   135 lb is stored as "+it.log[0].w+" kg");
 ok($(w,"#w-0-1").value==="135","   The next set shows 135 (carried down, shown in lb)");}
click(w,$(w,'[data-st="finish"]'));if($(w,'[data-st="finish"]'))click(w,$(w,'[data-st="finish"]'));click(w,$(w,'[data-st="type"][data-type="A"]'));click(w,$(w,'[data-st="start"]'));
ok($(w,"#sr-0-0 .pv").textContent==="Last 135×8","U3. Next time, Last shows 135×8 (lb)");
click(w,$(w,'[data-st="discard"]'));click(w,$(w,'[data-st="discard"]'));
click(w,$(w,"#tab-week"));click(w,$(w,"#revtoggle"));ok($(w,"#weight-l").textContent==="Weight (lb)","U4. Weekly review weight is in lb");
type(w,$(w,"#weight"),"176.4");{const wk=JSON.parse(w.localStorage.getItem("weekly-routine.v1"))["2026-10-26"];ok(Math.abs(wk.weight-80.01)<0.05,"   176.4 lb saved as "+wk.weight+" kg");}
w.close();
// --- more habits and your own
store={};w=boot("2026-10-28T09:00:00");
click(w,$(w,'#setcog'));ok($(w,'[data-shab="steps"]')&&!$(w,'[data-shab="steps"]').checked&&!$(w,'[data-shab="water"]')&&!$(w,'[data-shab="nic"]')&&w.document.querySelectorAll('#setbody [data-shab]').length===5,"H1. Five built-in habits; steps offered, off; water and no nicotine gone");
chg(w,$(w,'[data-shab="steps"]'),true);
ok($(w,"#ch-name").placeholder==="Add a habit, e.g. Water"&&!$(w,"#ch-days")&&!$(w,"#ch-sub"),"   Add a habit is one box (e.g. Water) and an Add button");
type(w,$(w,"#ch-name"),"Water");click(w,$(w,'[data-st="ch-add"]'));type(w,$(w,'[data-scsub="0"]'),"2 litres");
type(w,$(w,"#ch-name"),"water");click(w,$(w,'[data-st="ch-add"]'));
ok(/Water/.test($(w,"#setbody").textContent)&&w.document.querySelectorAll('[data-scdel]').length===1&&$(w,'[data-scsub="0"]').value==="2 litres","H2. Add your own habit: Water, 2 litres (a duplicate name isn't added twice)");
click(w,$(w,'[data-st="set-save"]'));
const lbl=[...w.document.querySelectorAll("#daily .lbl")].map(e=>e.textContent);
ok(lbl.some(t=>/Steps/.test(t)&&/10,000/.test(t))&&lbl.some(t=>/Water/.test(t)&&/2 litres/.test(t)),"H3. Both appear in the check-ins grid with their targets");
{const k=JSON.parse(w.localStorage.getItem("weekly-routine.settings.v1")).custom[0].k;click(w,$(w,`#d-${k}-0`));
 ok($(w,`[data-ct="${k}"]`).textContent==="1/7","H4. Ticking your own habit counts as a daily habit (1/7)");
 save(w);w.close();w=boot("2026-10-28T09:00:00");ok($(w,`#d-${k}-0`).checked,"   and the tick survives a reload");
 click(w,$(w,'#setcog'));click(w,$(w,'[data-scdel="0"]'));click(w,$(w,'[data-st="set-save"]'));ok(!$(w,`#d-${k}-0`),"H5. Deleting it removes it from the grid");}
w.close();
// --- past weeks keep their own targets
store={};w=boot("2026-10-28T09:00:00");
click(w,$(w,"#prev"));click(w,$(w,"#d-protein-0"));click(w,$(w,"#d-sleep-0"));click(w,$(w,"#next"));
click(w,$(w,'#setcog'));chg(w,$(w,'[data-shab="protein"]'),false);chg(w,$(w,"[data-scard]"),1);chg(w,$(w,'[data-sdays="af"]'),4);click(w,$(w,'[data-st="set-save"]'));
ok(!$(w,"#d-protein-0")&&$(w,'[data-ct="cardio"]').textContent==="0/1"&&$(w,'[data-ct="af"]').textContent==="0/4","PW1. This week uses the new targets (no protein, cardio 1, alcohol-free 4)");
click(w,$(w,"#prev"));
ok($(w,"#d-protein-0")&&$(w,"#d-protein-0").checked&&$(w,'[data-ct="cardio"]').textContent==="0/2"&&$(w,'[data-ct="af"]').textContent==="0/6","   Last week keeps its own: protein row with its tick, cardio 0/2, alcohol-free 0/6");
{const wk=JSON.parse(w.localStorage.getItem("weekly-routine.v1"))["2026-10-19"];ok(wk&&wk.plan&&wk.plan.habits.some(h=>h.k==="protein")&&!JSON.parse(w.localStorage.getItem("weekly-routine.v1"))["2026-10-26"]?.plan,"   The plan is stored on last week's record; this week has none and follows settings");}
save(w);w.close();w=boot("2026-10-28T09:00:00");click(w,$(w,"#prev"));
ok($(w,"#d-protein-0")&&$(w,'[data-ct="af"]').textContent==="0/6","   Still true after a reload");
w.close();
store={};w=boot("2026-10-28T09:00:00");
ok(!$(w,"#exp-week")&&!$(w,'[data-st="exp-csv"]')&&$(w,"#exp-master"),"EX1. Exports removed from Today and Training; one Export on Progress");
click(w,$(w,"#tab-progress"));click(w,$(w,"#exp-master"));
setTimeout(()=>{ok(!$(w,"#pr-exportsheet").hidden&&/"weeks"/.test($(w,"#pr-exportsheet textarea").value),"   Without a download option it shows the full backup to copy");
setTimeout(()=>process.exit(process.exitCode||0),50);},200);
