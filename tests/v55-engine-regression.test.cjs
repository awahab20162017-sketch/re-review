const test=require('node:test');
const assert=require('node:assert/strict');
const fs=require('node:fs');
const path=require('node:path');
const vm=require('node:vm');

function loadEngine(){
  const store=new Map([['pr_mu','0'],['pr_fx','off']]);
  const localStorage={getItem:k=>store.has(k)?store.get(k):null,setItem:(k,v)=>store.set(k,String(v)),removeItem:k=>store.delete(k)};
  const dummy=()=>({style:{},dataset:{},classList:{add(){},remove(){},contains(){return false}},setAttribute(){},addEventListener(){},appendChild(){},remove(){},closest(){return null},querySelector(){return null},querySelectorAll(){return[]},getBoundingClientRect(){return{left:0,top:0,width:0,height:0}},focus(){},textContent:'',innerHTML:''});
  const app=dummy();
  const document={querySelector:s=>s==='#app'?app:null,querySelectorAll:()=>[],addEventListener(){},createElement:dummy,body:{appendChild(){}},documentElement:{className:'',classList:{add(){},remove(){}}},hidden:false};
  const sandbox={console,localStorage,document,matchMedia:()=>({matches:true,addEventListener(){},removeEventListener(){}}),addEventListener(){},removeEventListener(){},setTimeout:()=>0,clearTimeout(){},setInterval:()=>0,clearInterval(){},requestAnimationFrame:()=>0,cancelAnimationFrame(){},performance:{now:()=>0},navigator:{},innerWidth:1280,innerHeight:720,devicePixelRatio:1,confirm:()=>true,alert(){},URL:{createObjectURL:()=>'',revokeObjectURL(){}},Blob:function(){},FileReader:function(){},Date,Math};
  sandbox.window=sandbox;sandbox.globalThis=sandbox;
  vm.createContext(sandbox);
  const code=fs.readFileSync(path.join(__dirname,'..','app.js'),'utf8');
  vm.runInContext(code,sandbox,{filename:'app.js'});
  vm.runInContext(`render=()=>{}; globalThis.__engine={ACT,setState:x=>S=x,setView:x=>V=x,getState:()=>S,getView:()=>V};`,sandbox);
  return sandbox.__engine;
}

test('v55 match controls still perform start goal undo and full time in order',()=>{
  const e=loadEngine();
  const t={id:'seed',name:'Seed',ps:[{n:'Wahab'},{n:'Ibrahim'}],rounds:[[{id:1,a:0,b:1,sa:0,sb:0,st:'up',g:[],t:0}]],final:null,champ:null,seen:false,fmt:1,pr:0};
  e.setState({tours:[t],saved:[]});e.setView({v:'tour',id:'seed',tab:'fix'});
  e.ACT.st({m:'1'});assert.equal(t.rounds[0][0].st,'live');
  e.ACT.goal({m:'1',s:'a'});assert.equal(t.rounds[0][0].sa,1);assert.deepEqual(Array.from(t.rounds[0][0].g),['a']);
  e.ACT.un({m:'1'});assert.equal(t.rounds[0][0].sa,0);assert.deepEqual(Array.from(t.rounds[0][0].g),[]);
  e.ACT.ft({m:'1'});assert.equal(t.rounds[0][0].st,'ft');
});
