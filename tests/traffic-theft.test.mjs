import assert from 'node:assert/strict';
import {initialState,mount,movePlayer,updateTraffic,nearestVehicle,saveProgress,restoreProgress} from '../dist/city-data.js';
import {VEHICLES} from '../dist/fleet-data.js';
const idle={forward:0,steer:0};
const scene=(speed=0)=>{const s=initialState();s.phase='playing';s.vehicles=[{uid:'vehicle-9',type:'metro',x:0,z:150,heading:0,speed,distance:0,traffic:true,axis:'z',dir:-1,cruise:9,driver:{health:100}}];s.x=-1.65;s.z=150;return s;};
const stolen=scene();assert(mount(stolen));assert.equal(stolen.transition.takeover,true);assert.equal(stolen.wanted,1);assert(stolen.vehicles[0].driver.health>0);
for(let i=0;i<130;i++)movePlayer(stolen,idle,1/60);
assert(stolen.vehicles[0].driver.exited);assert.equal(stolen.mode,'foot');assert(stolen.transition);const driver=stolen.vehicles[0].driver;driver.x=-9;
for(let i=0;i<130;i++)movePlayer(stolen,idle,1/60);
assert.equal(driver.x,-9,'Entry must not pull an escaped driver back to the door');assert.equal(stolen.mode,'car');assert(stolen.vehicles[0].stolen);assert(!stolen.vehicles[0].traffic);
const moving=scene(6);assert.equal(nearestVehicle(moving).uid,'vehicle-9');assert(mount(moving));assert.equal(moving.interceptId,'vehicle-9');assert.equal(moving.transition,null);for(let i=0;i<90;i++)updateTraffic(moving,1/60);assert(moving.vehicles[0].speed<1.5);
const fast=scene(16);assert.equal(nearestVehicle(fast),null);
const dead=scene(5);dead.vehicles[0].driver.health=0;for(let i=0;i<120;i++)updateTraffic(dead,1/60);assert.equal(dead.vehicles[0].speed,0);assert.equal(dead.vehicles[0].traffic,false);
const police=scene();const patrol=police.vehicles.pop();patrol.uid='patrol-test';patrol.type='warden';patrol.police=true;police.cops.push(patrol);assert(mount(police));assert.equal(police.cops.length,0);assert.equal(police.vehicles[0],patrol);assert.equal(police.wanted,2);
const memory=new Map();globalThis.localStorage={setItem:(k,v)=>memory.set(k,v),getItem:k=>memory.get(k)};assert(saveProgress(stolen));const restored=initialState();assert(restoreProgress(restored));assert.equal(restored.mode,'car');assert.equal(restored.vehicles.find(v=>v.uid==='vehicle-9').driver,null);assert(restored.vehicles.find(v=>v.uid==='vehicle-9').stolen);
assert.equal(new Set(VEHICLES.filter(v=>v.kind==='car').map(v=>v.design)).size,15);
console.log('PASS: occupied-car approach, braking, timed driver exit, escape continuity, player takeover, fast-traffic gate, incapacitated drivers, patrol theft and stolen-car save.');

for(let i=0;i<250;i++)movePlayer(police,idle,1/60);assert.equal(police.mode,'car');assert(saveProgress(police));const restoredPolice=initialState();assert(restoreProgress(restoredPolice));assert.equal(restoredPolice.vehicleId,'patrol-test');assert.equal(restoredPolice.mode,'car');
