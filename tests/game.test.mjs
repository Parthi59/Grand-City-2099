import assert from 'node:assert/strict';
import {initialState,mount,movePlayer,activeVehicle,updateTraffic,beginContract,collision,updatePolice,restoreProgress,saveProgress} from '../dist/city-data.js';
import {VEHICLES,vehicleById} from '../dist/fleet-data.js';
const idle={forward:0,steer:0,boost:false};
const step=(s,n=180,input=idle)=>{for(let i=0;i<n;i++)movePlayer(s,input,1/60,0)};
const s=initialState();s.phase='playing';assert.equal(VEHICLES.filter(v=>v.kind==='bike').length,5);assert.equal(VEHICLES.filter(v=>v.kind==='car').length,16);
// Every vehicle is usable; mounts take time and end at the same physical position.
for(const def of VEHICLES){const t=initialState();t.phase='playing';t.vehicles=[{uid:'test',type:def.id,x:0,z:150,heading:0,speed:0,distance:0}];t.x=-def.width/2-.7;t.z=150;assert(mount(t),def.id+' enter');const before=t.x;step(t,20);assert.equal(t.mode,'foot');assert(t.transition);assert(Math.abs(t.x-before)<2);step(t,150);assert.equal(t.mode,def.kind);assert(!t.transition);assert.equal(activeVehicle(t).type,def.id);step(t,60,{forward:1,steer:0,boost:false});assert(t.speed>3);assert(!mount(t));step(t,180,{...idle,handbrake:true});assert(Math.abs(t.speed)<1.5);assert(mount(t));step(t,130);assert.equal(t.mode,'foot');assert(!t.transition);assert.equal(t.vehicleId,null);}
// Movement speeds distinguish walking, running, and sprinting.
const velocities=[];for(const controls of [{walk:true},{},{boost:true}]){const t=initialState();t.x=0;t.z=250;t.vehicles=[];step(t,60,{forward:1,steer:0,...controls});velocities.push(t.speed)}assert(velocities[0]<velocities[1]&&velocities[1]<velocities[2]);
// Traffic slows for an on-foot obstacle and keeps a safe gap.
const t=initialState();t.x=0;t.z=0;t.elapsed=0;t.vehicles=[{uid:'traffic',type:'civic',traffic:true,axis:'z',dir:-1,x:0,z:12,heading:0,speed:9,cruise:9,distance:0}];for(let i=0;i<180;i++)updateTraffic(t,1/60);assert(t.vehicles[0].z>4);assert(t.vehicles[0].speed<.5);
// Missions award credits from any mode, and expire cleanly.
const m=initialState();m.vehicles=[];m.phase='playing';assert(beginContract(m,'courier'));for(const p of m.mission.points){m.x=p.x;m.z=p.z;step(m,1)}assert.equal(m.cash,750);assert.equal(m.completed,1);assert.equal(m.mission,null);assert(m.events.includes('reward'));
assert(beginContract(m,'circuit'));m.mission.left=.001;step(m,1);assert.equal(m.mission,null);
assert(collision(900,900));assert(!collision(0,150));
console.log('PASS: 21 classes, timed entry/exit, acceleration, exit-speed gate, walk/run/sprint, traffic obstacle stop, mission reward/timeout, world collision.');
// Approaching from the opposite side must walk around the body, not through it.
const entry=initialState();entry.vehicles=[{uid:'entry',type:'strada',x:5,z:170,heading:0,speed:0,distance:0}];entry.x=7;entry.z=171;assert(mount(entry));for(let i=0;i<700&&entry.transition;i++){movePlayer(entry,idle,1/60);if(entry.transition?.walking)assert(!(Math.abs(entry.x-5)<.95&&Math.abs(entry.z-170)<2.25));}assert.equal(entry.mode,'car');
// Contact damages the vehicle and does not permit passing through a building.
const crash=initialState();crash.vehicles=[{uid:'crash',type:'strada',x:0,z:172,heading:Math.PI/2,speed:0,distance:0}];crash.vehicleId='crash';crash.mode='car';crash.x=0;crash.z=172;crash.heading=Math.PI/2;crash.speed=35;step(crash,180,{forward:1,steer:0});assert(crash.health<100);assert(!collision(crash.x,crash.z,.6));
// Police heat can be escaped, while a stationary player can be detained.
const ghost=initialState();ghost.phase='playing';ghost.vehicles=[];ghost.wanted=2;for(let i=0;i<1300;i++)updatePolice(ghost,1/60);assert.equal(ghost.wanted,0);
const caught=initialState();caught.phase='playing';caught.wanted=1;caught.cops=[{x:caught.x,z:caught.z,heading:0}];for(let i=0;i<240;i++)updatePolice(caught,1/60);assert.equal(caught.phase,'busted');
// Progress and occupied vehicle survive a reload; no on-foot spawn inside a car.
const memory=new Map();globalThis.localStorage={getItem:k=>memory.get(k),setItem:(k,v)=>memory.set(k,v)};
const saved=initialState();saved.mode='car';saved.vehicleId=saved.vehicles[5].uid;saved.x=saved.vehicles[5].x;saved.z=saved.vehicles[5].z;saved.cash=345;beginContract(saved,'courier');saved.mission.stage=1;saved.mission.left=100;assert(saveProgress(saved));const restored=initialState();assert(restoreProgress(restored));assert.equal(restored.mode,'car');assert.equal(restored.vehicleId,saved.vehicleId);assert.equal(restored.mission.stage,1);assert.equal(restored.mission.left,100);assert.equal(restored.cash,345);
console.log('PASS: Door approach, collision damage, escape/detention, occupied-vehicle save and mission recovery.');
