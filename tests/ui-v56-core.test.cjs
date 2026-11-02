const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');

const root = path.resolve(__dirname, '..');

function loadClubs(){
  const file = path.join(root, 'club-badges.js');
  assert.equal(fs.existsSync(file), true, 'club-badges.js should exist');
  delete require.cache[require.resolve(file)];
  return require(file);
}
function loadUI(){
  const file = path.join(root, 'ui-v56.js');
  assert.equal(fs.existsSync(file), true, 'ui-v56.js should exist');
  delete require.cache[require.resolve(file)];
  return require(file);
}

test('tournamentStatus marks champion tournaments completed and others active', () => {
  const ui = loadUI();
  assert.equal(ui.tournamentStatus({champ:0}), 'completed');
  assert.equal(ui.tournamentStatus({champ:null}), 'active');
  assert.equal(ui.tournamentStatus({}), 'active');
});

test('filterTournaments supports all active and completed', () => {
  const ui = loadUI();
  const list = [{id:'a',champ:null},{id:'b',champ:0},{id:'c',champ:2}];
  assert.deepEqual(ui.filterTournaments(list,'all').map(x=>x.id), ['a','b','c']);
  assert.deepEqual(ui.filterTournaments(list,'active').map(x=>x.id), ['a']);
  assert.deepEqual(ui.filterTournaments(list,'completed').map(x=>x.id), ['b','c']);
});

test('known clubs provide crest metadata', () => {
  const clubs = loadClubs();
  for(const name of ['Real Madrid','AC Milan']){
    const meta = clubs.clubMeta(name);
    assert.equal(meta.name, name);
    assert.ok(meta.url && /^https:\/\//.test(meta.url));
    assert.ok(meta.short.length >= 2);
  }
});

test('unknown club metadata is a safe fallback', () => {
  const clubs = loadClubs();
  const meta = clubs.clubMeta('Sunday XI');
  assert.equal(meta.name, 'Sunday XI');
  assert.equal(meta.url, '');
  assert.equal(meta.short, 'SX');
});

test('index loads v56 assets after cloud integration', () => {
  const html = fs.readFileSync(path.join(root,'index.html'),'utf8');
  assert.match(html,/styles-v56\.css/);
  const cloud = html.indexOf('cloud.js');
  const clubs = html.indexOf('club-badges.js');
  const ui = html.indexOf('ui-v56.js');
  assert.ok(cloud >= 0 && clubs > cloud && ui > clubs);
});

test('v56 stylesheet defines core emerald and navy tokens', () => {
  const file = path.join(root,'styles-v56.css');
  assert.equal(fs.existsSync(file), true, 'styles-v56.css should exist');
  const css = fs.readFileSync(file,'utf8');
  assert.match(css,/--pr-emerald\s*:/);
  assert.match(css,/--pr-navy\s*:/);
  assert.match(css,/\.pr-club-frame/);
});

test('standings render is player-only and contains no club frame', () => {
  const ui = loadUI();
  const t={ps:[{n:'Wahab',team:'Real Madrid'},{n:'Ibrahim',team:'Barcelona'}]};
  const rows=[{i:0,P:2,W:2,D:0,L:0,F:5,A:1,Pt:6},{i:1,P:2,W:0,D:0,L:2,F:1,A:5,Pt:0}];
  const html=ui.renderStandings(t,rows,()=>['W','W']);
  assert.match(html,/Wahab/);assert.match(html,/Ibrahim/);
  assert.doesNotMatch(html,/Real Madrid|Barcelona/);
  assert.doesNotMatch(html,/pr-club-frame/);
});

test('fixture render contains framed clubs and dominant player names', () => {
  const ui = loadUI();
  const t={ps:[{n:'Wahab',team:'Real Madrid'},{n:'Ibrahim',team:'Barcelona'}]};
  const m={id:1,a:0,b:1,sa:0,sb:0,st:'up',g:[],ta:'Real Madrid',tb:'Barcelona',ka:'G',kb:'G'};
  const html=ui.renderFixture(t,m,0);
  assert.match(html,/pr-club-frame/);
  assert.match(html,/Wahab/);assert.match(html,/Ibrahim/);
  assert.match(html,/Real Madrid/);assert.match(html,/Barcelona/);
  assert.match(html,/data-a="st"/);
});

test('tournament list filter cards expose all active and completed actions', () => {
  const ui=loadUI();
  const state={tours:[{id:'a',name:'Active Cup',ps:[{n:'A'},{n:'B'}],rounds:[[]],champ:null},{id:'b',name:'Done Cup',ps:[{n:'A'},{n:'B'}],rounds:[[]],champ:0}]};
  const html=ui.renderTournamentList(state,'active');
  assert.match(html,/data-a="v56filter" data-filter="all"/);
  assert.match(html,/data-filter="active"/);
  assert.match(html,/data-filter="completed"/);
  assert.match(html,/Active Cup/);
  assert.doesNotMatch(html,/Done Cup/);
});

test('player profile renders initials fallback when photo is absent',()=>{
  const ui=loadUI();
  const html=ui.renderPlayerProfile({name:'Wahab',rating:86,titles:3,form:['W','W','D','L','W'],m:58,w:34,gf:128,ga:75,finals:4,hist:[]},[]);
  assert.match(html,/pr-profile-hero/);assert.match(html,/>W<\/span>/);assert.doesNotMatch(html,/class="pr-profile-photo"[^>]*><img/);
});

test('player profile accepts optional photo without requiring it',()=>{
  const ui=loadUI();
  const html=ui.renderPlayerProfile({name:'Wahab',rating:86,titles:3,form:[],m:2,w:1,gf:3,ga:2,finals:1,hist:[],photo:'data:image/png;base64,abc'},[]);
  assert.match(html,/data:image\/png;base64,abc/);assert.match(html,/data-a="v56photo"/);assert.match(html,/data-a="v56photorm"/);
});

test('player profile only uses club frames in most-used-clubs section',()=>{
  const ui=loadUI();
  const tours=[{ps:[{n:'Wahab',team:'Real Madrid'}],rounds:[],champ:null}];
  const html=ui.renderPlayerProfile({name:'Wahab',rating:86,titles:0,form:[],m:0,w:0,gf:0,ga:0,finals:0,hist:[]},tours);
  const before=html.split('Most Used Clubs')[0];
  assert.doesNotMatch(before,/pr-club-frame/);
  assert.match(html,/Most Used Clubs/);
});

test('career page renders OVR title and form from supplied career data',()=>{
  const ui=loadUI();
  const html=ui.renderCareer([{n:'Wahab',rating:86,titles:3,form:['W','L'],m:10,w:6,gf:20,ga:12,cs:2,finals:4}]);
  assert.match(html,/Wahab/);assert.match(html,/86/);assert.match(html,/3 titles/);assert.match(html,/class="W"/);
});

test('account modal uses centered v56 two-column shell with auth tabs',()=>{
  const ui=loadUI();
  const html=ui.renderAccountModal('login',null,'Local Mode');
  assert.match(html,/pr-account-overlay/);assert.match(html,/pr-account-card/);assert.match(html,/pr-account-side/);
  assert.match(html,/Log in/);assert.match(html,/Create account/);assert.match(html,/Forgot password/);
  assert.match(html,/id="prEmail"/);assert.match(html,/id="prPassword"/);
});

test('backup tool preserves v55 backup and restore action hooks',()=>{
  const ui=loadUI();
  const html=ui.renderToolPage('backup',{trash:[]});
  assert.match(html,/id="bkt"/);assert.match(html,/data-a="bk"/);assert.match(html,/data-a="rs"/);
});

test('responsive stylesheet keeps nav labels unwrapped and defines mobile bottom nav',()=>{
  const css=fs.readFileSync(path.join(root,'styles-v56.css'),'utf8');
  assert.match(css,/\.pr-nav button[^}]*white-space\s*:\s*nowrap/s);
  assert.match(css,/@media\(max-width:900px\)/);
  assert.match(css,/\.pr-bottom-nav[^}]*display\s*:\s*grid/s);
});

test('cloud auth gate delegates presentation to v56 when available',()=>{
  const cloud=fs.readFileSync(path.join(root,'cloud.js'),'utf8');
  assert.match(cloud,/PRV56[\s\S]{0,120}showAccountModal/);
});

test('Final view uses prestige styling and framed club identities',()=>{
  const ui=loadUI();
  const t={name:'Weekend League',ps:[{n:'Wahab',team:'Real Madrid'},{n:'Ibrahim',team:'Barcelona'}],rounds:[],final:{id:'F',a:0,b:1,sa:0,sb:0,st:'up',g:[],ta:'Real Madrid',tb:'Barcelona',ka:'G',kb:'G'},champ:null};
  const html=ui.renderFinal(t);
  assert.match(html,/pr-final-stage/);
  assert.match(html,/GRAND FINAL/);
  assert.match(html,/pr-club-frame/);
  assert.match(html,/Wahab/);assert.match(html,/Ibrahim/);
});

test('Champion view contains winner result context and Lift Trophy action',()=>{
  const ui=loadUI();
  const t={name:'Weekend League',ps:[{n:'Wahab',team:'Real Madrid'},{n:'Ibrahim',team:'Barcelona'}],rounds:[],final:{id:'F',a:0,b:1,sa:3,sb:2,st:'ft',g:['a','b','a','b','a'],ta:'Real Madrid',tb:'Barcelona',ka:'G',kb:'G'},champ:0};
  const html=ui.renderChampion(t);
  assert.match(html,/pr-champion-stage/);
  assert.match(html,/CHAMPION/);
  assert.match(html,/Wahab/);
  assert.match(html,/3\s*[–-]\s*2/);
  assert.match(html,/data-a="v56lift"/);
  assert.match(html,/Lift Trophy/);
});

test('gold prestige accents are scoped to Final and champion surfaces',()=>{
  const css=fs.readFileSync(path.join(root,'styles-v56.css'),'utf8');
  assert.match(css,/\.pr-final-stage[\s\S]*var\(--pr-gold\)/);
  assert.match(css,/\.pr-champion-stage[\s\S]*var\(--pr-gold\)/);
  assert.doesNotMatch(css,/\.pr-page\s*\{[^}]*background\s*:\s*var\(--pr-gold\)/s);
});

test('drawn Grand Final exposes preserved penalty winner actions',()=>{
  const ui=loadUI();
  const t={name:'Weekend League',ps:[{n:'Wahab',team:'Real Madrid'},{n:'Ibrahim',team:'Barcelona'}],rounds:[],final:{id:'F',a:0,b:1,sa:2,sb:2,st:'ft',g:[],pen:null,ta:'Real Madrid',tb:'Barcelona',ka:'G',kb:'G'},champ:null};
  const html=ui.renderFinal(t);
  assert.match(html,/data-a="pen" data-s="a"/);
  assert.match(html,/data-a="pen" data-s="b"/);
});

test('v57 champion view no longer auto-launches the legacy replay ceremony',()=>{
  const src=fs.readFileSync(path.join(root,'ui-v56.js'),'utf8');
  assert.match(src,/champ\s*!=\s*null[\s\S]{0,220}!\s*t\.seen/);
  assert.doesNotMatch(src,/champ\s*!=\s*null[\s\S]{0,220}!\s*t\.seen[\s\S]{0,260}boom/);
});

test('boot guard reports generic support wording and index identifies v57 review build',()=>{
  const boot=fs.readFileSync(path.join(root,'boot-guard.js'),'utf8');
  const html=fs.readFileSync(path.join(root,'index.html'),'utf8');
  assert.doesNotMatch(boot,/Claude/i);
  assert.match(boot,/reporting the issue|report the issue/i);
  assert.match(html,/Pitch Royale v57/i);
});

test('live fixture preserves goal and optional scorer controls for both players',()=>{
  const ui=loadUI();
  const t={ps:[{n:'Wahab',team:'Real Madrid'},{n:'Ibrahim',team:'Barcelona'}]};
  const m={id:3,a:0,b:1,sa:1,sb:0,st:'live',g:['a'],ta:'Real Madrid',tb:'Barcelona',ka:'G',kb:'G'};
  const html=ui.renderFixture(t,m,0);
  assert.match(html,/class="pr-fixture[^\"]*\bcard\b/);
  assert.match(html,/data-a="goal" data-m="3" data-s="a"/);
  assert.match(html,/data-a="goal" data-m="3" data-s="b"/);
  assert.match(html,/data-ms="3a"/);assert.match(html,/data-ms="3b"/);
  assert.match(html,/class="pr-match-person s/);
});

test('new tournament club pool keeps all built-in teams selectable after deselection',()=>{
  const ui=loadUI();
  const oldN=global.N,oldS=global.S,oldTM=global.TM;
  global.TM=[['Real Madrid',5,86],['Barcelona',5,85],['Manchester City',4.5,84],['Liverpool',4,81]];
  global.N={name:'Test',ps:[],pool:['Real Madrid','Liverpool'],assign:true,rot:true,fmt:1,pr:3,r:5,err:''};
  global.S={saved:[]};
  try{
    const html=ui.renderNewTournament();
    for(const name of ['Real Madrid','Barcelona','Manchester City','Liverpool']) assert.match(html,new RegExp(name));
    assert.match(html,/data-a="pall"/);assert.match(html,/data-a="pnone"/);
    assert.match(html,/data-n="Barcelona"/);
  }finally{global.N=oldN;global.S=oldS;global.TM=oldTM}
});

test('every built-in v55 team has a non-empty badge asset URL',()=>{
  const clubs=loadClubs();
  const names=['Real Madrid','Bayern Munich','Juventus','Barcelona','Brazil','Spain','Germany','Manchester City','France','Belgium','Manchester United','Atletico Madrid','Tottenham','Paris SG','Chelsea','Arsenal','England','Portugal','Argentina','Liverpool','Borussia Dortmund','Uruguay','Inter Milan','Porto','Netherlands','AC Milan'];
  for(const name of names) assert.match(clubs.clubMeta(name).url,/^https:\/\//,`${name} should have badge metadata`);
});

test('standings and fixture DOM preserve v55 animation compatibility hooks',()=>{
  const ui=loadUI();
  const t={ps:[{n:'Wahab',team:'Real Madrid'},{n:'Ibrahim',team:'Barcelona'}]};
  const rows=[{i:0,P:1,W:1,D:0,L:0,F:4,A:0,Pt:3},{i:1,P:1,W:0,D:0,L:1,F:0,A:4,Pt:0}];
  const tableHtml=ui.renderStandings(t,rows,()=>['W']);
  assert.match(tableHtml,/tr data-p="0"/);
  assert.match(tableHtml,/class="left pl"/);
  const up=ui.renderFixture(t,{id:1,a:0,b:1,sa:0,sb:0,st:'up',g:[],ta:'Real Madrid',tb:'Barcelona',ka:'G',kb:'G'},0);
  assert.match(up,/pr-match-status bd up/);
  const ft=ui.renderFixture(t,{id:1,a:0,b:1,sa:4,sb:0,st:'ft',g:[],ta:'Real Madrid',tb:'Barcelona',ka:'G',kb:'G'},0);
  assert.match(ft,/pr-match-person s w/);
});

test('start-next selection prioritizes an already live match over another upcoming match',()=>{
  const ui=loadUI();
  const live={id:1,st:'live'},up={id:2,st:'up'};
  assert.equal(ui.nextActionable({rounds:[[live,up]],final:null}),live);
  assert.equal(ui.nextActionable({rounds:[[{id:3,st:'ft'},up]],final:null}),up);
});

test('completed tournament header does not offer Start next match',()=>{
  const ui=loadUI();
  const oldV=global.V,oldEnsure=global.ensureFinal;
  global.V={v:'tour',id:'done',tab:'ovw'};
  global.ensureFinal=()=>{};
  const t={id:'done',name:'Completed Cup',ps:[{n:'Wahab'},{n:'Ibrahim'}],rounds:[[{id:1,a:0,b:1,sa:2,sb:1,st:'ft',g:[]}]],final:{id:'F',a:0,b:1,sa:3,sb:1,st:'ft',g:[]},champ:0};
  try{
    const html=ui.renderTournament(t);
    assert.doesNotMatch(html,/Start next match/);
    assert.match(html,/View champion/);
  }finally{global.V=oldV;global.ensureFinal=oldEnsure}
});

test('v57 shell exposes collapsible sidebar control and collapsed class',()=>{
  const ui=loadUI();
  const oldV=global.V;
  global.V={v:'list'};
  try{
    ui.ui.sidebarCollapsed=true;
    const html=ui.shell('<p>content</p>');
    assert.match(html,/pr-app-shell[^\"]*is-collapsed/);
    assert.match(html,/data-a="v57collapse"/);
  }finally{ui.ui.sidebarCollapsed=false;global.V=oldV}
});

test('v57 shell immersive mode hides navigation chrome by class contract',()=>{
  const ui=loadUI();
  const oldV=global.V;
  global.V={v:'tour'};
  try{
    ui.ui.immersive=true;
    const html=ui.shell('<section>celebration</section>');
    assert.match(html,/pr-app-shell[^\"]*is-immersive/);
  }finally{ui.ui.immersive=false;global.V=oldV}
});

test('v57 live fixture renders aligned score steppers with plus minus and scorer fields',()=>{
  const ui=loadUI();
  const t={ps:[{n:'Haseeb',team:'Manchester City'},{n:'Wahab',team:'Arsenal'}]};
  const m={id:9,a:0,b:1,sa:2,sb:1,st:'live',g:['a','b','a'],ta:'Manchester City',tb:'Arsenal',ka:'G',kb:'M'};
  const html=ui.renderFixture(t,m,0);
  assert.match(html,/pr-live-match-grid/);
  assert.match(html,/pr-score-stepper/);
  assert.match(html,/data-a="v57minus" data-m="9" data-s="a"/);
  assert.match(html,/data-a="v57minus" data-m="9" data-s="b"/);
  assert.match(html,/data-a="goal" data-m="9" data-s="a"/);
  assert.match(html,/data-a="goal" data-m="9" data-s="b"/);
  assert.match(html,/data-ms="9a"/);assert.match(html,/data-ms="9b"/);
});

test('v57 side-specific undo only allows the side that scored the latest logged goal',()=>{
  const ui=loadUI();
  assert.equal(ui.canUndoSide({g:['a','b','a']},'a'),true);
  assert.equal(ui.canUndoSide({g:['a','b','a']},'b'),false);
  assert.equal(ui.canUndoSide({g:[]},'a'),false);
});

test('v57 player profile tabs are actionable and render selected statistics panel',()=>{
  const ui=loadUI();
  const old=ui.ui.profileTab;
  try{
    ui.ui.profileTab='statistics';
    const html=ui.renderPlayerProfile({name:'Wahab',rating:82,titles:2,form:['W','D','W'],m:12,w:7,gf:18,ga:9,cs:3,finals:3,hist:[]},[]);
    assert.match(html,/data-a="v57profiletab" data-tab="statistics"/);
    assert.match(html,/data-profile-panel="statistics"/);
    assert.match(html,/Season Statistics/);
    assert.match(html,/Clean Sheets/);
  }finally{ui.ui.profileTab=old}
});

test('v57 new tournament uses readable player picks and custom assignment switches',()=>{
  const ui=loadUI();
  const oldN=global.N,oldS=global.S,oldTM=global.TM;
  global.TM=[['Real Madrid',5,86],['Barcelona',5,85]];
  global.N={name:'Friday Night League',ps:[{n:'Wahab'}],pool:['Real Madrid'],assign:true,rot:true,fmt:1,pr:3,r:5,err:''};
  global.S={saved:[{n:'Wahab'},{n:'Ibrahim'},{n:'Haseeb'}]};
  try{
    const html=ui.renderNewTournament();
    assert.match(html,/pr-player-pick/);
    assert.match(html,/Wahab/);assert.match(html,/Ibrahim/);assert.match(html,/Haseeb/);
    assert.match(html,/pr-assignment-toggle/);
    assert.match(html,/pr-switch/);
    assert.match(html,/data-a="asg"/);assert.match(html,/data-a="rot"/);
  }finally{global.N=oldN;global.S=oldS;global.TM=oldTM}
});

test('v57 audio page exposes real mute volume and direct effects controls',()=>{
  const ui=loadUI();
  const html=ui.renderToolPage('audio',{});
  assert.match(html,/id="prVolume"/);
  assert.match(html,/type="range"/);
  assert.match(html,/data-a="v57mute"/);
  assert.match(html,/data-a="v57fx" data-level="off"/);
  assert.match(html,/data-a="v57fx" data-level="full"/);
  assert.match(html,/Effects Intensity/);
});

test('v57 audio helpers clamp volume and map five visual levels onto engine modes',()=>{
  const ui=loadUI();
  assert.equal(ui.clampVolume(-10),0);
  assert.equal(ui.clampVolume(45),45);
  assert.equal(ui.clampVolume(150),100);
  assert.equal(ui.engineFxLevel('off'),'off');
  assert.equal(ui.engineFxLevel('low'),'lite');
  assert.equal(ui.engineFxLevel('medium'),'lite');
  assert.equal(ui.engineFxLevel('high'),'full');
  assert.equal(ui.engineFxLevel('full'),'full');
});

test('v57 top music bar exposes mute and functional volume controls',()=>{
  const ui=loadUI();
  const oldV=global.V;global.V={v:'list'};
  try{
    const html=ui.shell('<p>x</p>');
    assert.match(html,/data-a="v57mute"/);
    assert.match(html,/id="prTopVolume"/);
    assert.match(html,/PRV56\.setAudioVolume\(this\.value\)/);
  }finally{global.V=oldV}
});

test('v57 integrates with the real TM2 soundtrack volume controller',()=>{
  const app=fs.readFileSync(path.join(root,'app.js'),'utf8');
  assert.match(app,/setVolume/);
  assert.match(app,/volume:\(\)=>vol/);
  const src=fs.readFileSync(path.join(root,'ui-v56.js'),'utf8');
  assert.match(src,/TM2\.setVolume/);
  assert.match(src,/TM2\.toggle/);
});

test('v57 champion summary shows career-style final stats and separate one-time actions',()=>{
  const ui=loadUI();
  const t={name:'Friday Night League',ps:[{n:'Wahab',team:'Arsenal'},{n:'Ibrahim',team:'Barcelona'}],rounds:[[{id:1,a:0,b:1,sa:3,sb:1,st:'ft',g:['a','a','b','a']}]],final:{id:'F',a:0,b:1,sa:2,sb:1,st:'ft',g:['a','b','a'],ta:'Arsenal',tb:'Barcelona'},champ:0};
  const html=ui.renderChampion(t);
  assert.match(html,/Matches/);assert.match(html,/Wins/);assert.match(html,/Goals/);assert.match(html,/Goal Diff/);assert.match(html,/Win Rate/);
  assert.match(html,/data-a="v56lift"/);
  assert.match(html,/data-a="v57matchreplay"/);
  assert.doesNotMatch(html,/data-a="replay"/);
});

test('v57 trophy celebration is trophy-only and never contains match replay prompt',()=>{
  const ui=loadUI();
  const t={name:'Friday Night League',ps:[{n:'Wahab',team:'Arsenal'},{n:'Ibrahim'}],final:{a:0,b:1,sa:2,sb:1,st:'ft',ta:'Arsenal'},champ:0};
  const html=ui.renderTrophyCelebration(t);
  assert.match(html,/LIFT THE TROPHY/);
  assert.match(html,/CHAMPION OF FRIDAY NIGHT LEAGUE/);
  assert.doesNotMatch(html,/MATCH REPLAY/);
  assert.match(html,/data-a="v57celebrationdone"/);
});

test('v57 lift action calls trophy celebration instead of old replay ceremony',()=>{
  const src=fs.readFileSync(path.join(root,'ui-v56.js'),'utf8');
  assert.match(src,/ACT\.v56lift=\(\)=>showV57TrophyCelebration\(T\(\)\)/);
  assert.doesNotMatch(src,/ACT\.v56lift=\(\)=>\{if\(ACT\.replay\)ACT\.replay\(\)\}/);
});

test('v57 tournament overview matches reference-board split layout',()=>{
  const ui=loadUI();
  const oldTable=global.table;
  global.table=()=>[{i:0,P:2,W:2,D:0,L:0,F:5,A:1,Pt:6},{i:1,P:2,W:1,D:0,L:1,F:3,A:3,Pt:3}];
  const t={ps:[{n:'Haseeb'},{n:'Wahab'}],rounds:[[{id:1,a:0,b:1,sa:0,sb:0,st:'up',ta:'Manchester City',tb:'Arsenal',g:[]}]]};
  try{
    const html=ui.renderOverview(t);
    assert.match(html,/pr-board-overview/);
    assert.match(html,/pr-board-standings/);
    assert.match(html,/pr-board-next/);
    assert.match(html,/Upcoming Fixture/);
    assert.match(html,/Bad team/);assert.match(html,/Moderate team/);assert.match(html,/Good team/);
  }finally{global.table=oldTable}
});

test('v57 career bridge exposes real v55 career stats to the profile UI',()=>{
  const oldBridge=global.PRCareer, oldS=global.S;
  global.PRCareer={allCareer:()=>[{n:'Wahab',m:12,w:7,gf:18,ga:10,titles:2,finals:3,rating:84,form:['W','W','D','W','L'],hist:[]}]};
  global.S={saved:[{n:'Wahab',photo:''}],tours:[]};
  try{
    const ui=loadUI();
    assert.equal(typeof ui.careerData,'function');
    const data=ui.careerData();
    assert.equal(data.length,1);
    assert.equal(data[0].m,12);
    assert.equal(data[0].gf,18);
    assert.equal(data[0].rating,84);
  }finally{
    if(oldBridge===undefined)delete global.PRCareer;else global.PRCareer=oldBridge;
    if(oldS===undefined)delete global.S;else global.S=oldS;
  }
});

test('v55 engine publishes the career bridge consumed by v57',()=>{
  const src=fs.readFileSync(path.join(root,'app.js'),'utf8');
  assert.match(src,/PRCareer/);
  assert.match(src,/allCareer/);
});

test('v57 career profile lookup normalizes player names before matching',()=>{
  const ui=loadUI();
  assert.equal(typeof ui.findCareerPlayer,'function');
  const p=ui.findCareerPlayer([{n:'Wahab',m:12}], '  wahab  ');
  assert.equal(p&&p.m,12);
});
