import assert from 'node:assert/strict';
import {initialState,saveProgress,restoreProgress} from '../dist/city-data.js';
import {selectWeapon,fireWeapon,tickCombat,reloadWeapon,traceShot,rayBox} from '../dist/combat-data.js';
const s=initialState();assert(!selectWeapon(s,'sidearm'));s.phase='playing';assert(selectWeapon(s,'sidearm'));tickCombat(s,.21);assert(fireWeapon(s));assert.equal(s.combat.clips.sidearm,11);assert(!fireWeapon(s));tickCombat(s,.3);assert(fireWeapon(s));assert.equal(s.combat.clips.sidearm,10);
assert(reloadWeapon(s));assert(!fireWeapon(s));tickCombat(s,.7);assert.equal(s.combat.clips.sidearm,10);s.phase='paused';const left=s.combat.reloading;tickCombat(s,10);assert.equal(s.combat.reloading,left);assert(!fireWeapon(s));s.phase='playing';tickCombat(s,1);assert.equal(s.combat.clips.sidearm,12);assert.equal(s.combat.reserve.sidearm,82);
selectWeapon(s,'carbine');tickCombat(s,.3);for(let i=0;i<30;i++){assert(fireWeapon(s));tickCombat(s,.11);}assert.equal(s.combat.clips.carbine,0);assert(!fireWeapon(s));assert(s.combat.reloading>0);tickCombat(s,2.2);assert.equal(s.combat.clips.carbine,30);assert.equal(s.combat.reserve.carbine,150);
s.mode='car';assert(!fireWeapon(s));assert(!selectWeapon(s,'sidearm'));s.mode='foot';s.transition={kind:'enter'};assert(!fireWeapon(s));s.transition=null;selectWeapon(s,null);assert(!fireWeapon(s));
// Walls and nearby car bodies stop the ray before a character behind them.
const origin={x:0,y:1.4,z:10},direction={x:0,y:0,z:-1},wall={x:0,y:1.5,z:3,w:5,h:3,d:.4,kind:'wall'},person={x:0,y:1,z:0,w:.45,h:2,d:.4,kind:'person'};
assert.equal(traceShot(origin,direction,[person,wall]).object.kind,'wall');assert.equal(traceShot(origin,direction,[person]).object.kind,'person');assert.equal(traceShot(origin,{x:1,y:0,z:0},[wall,person]),null);assert.equal(traceShot(origin,direction,[person],3),null);
const rotated=rayBox({x:6,y:1,z:0},{x:-1,y:0,z:0},{x:0,y:1,z:0,w:2,h:2,d:5,heading:Math.PI/2});assert(Math.abs(rotated.distance-3.5)<1e-6);assert(Math.abs(rotated.normal.x-1)<1e-6);
// Ammunition persists with existing vehicle/mission progress and is clamped on load.
const memory=new Map();globalThis.localStorage={setItem:(k,v)=>memory.set(k,v),getItem:k=>memory.get(k)};selectWeapon(s,'carbine');assert(saveProgress(s));const loaded=initialState();assert(restoreProgress(loaded));assert.equal(loaded.combat.selected,'carbine');assert.equal(loaded.combat.reserve.carbine,150);assert.equal(loaded.combat.clips.carbine,30);
console.log('PASS: weapon selection, fire rate, ammunition, reload timing, pause/vehicle gates, solid cover, rotated bounds and weapon save recovery.');
