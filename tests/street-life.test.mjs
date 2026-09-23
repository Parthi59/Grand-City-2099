import assert from 'node:assert/strict';
import {pedestrianRoute,stepPedestrian} from '../dist/street-life.js';
import {initialState,collision,mount,movePlayer,trafficSignal} from '../dist/city-data.js';
import {vehicleById} from '../dist/fleet-data.js';
import {makeVehicle} from '../dist/vehicle-model.js';
const s=initialState();s.phase='playing';s.vehicles=[];
for(const [bx,bz] of [[-2,-2],[-1,1],[0,1],[1,0]]){const route=pedestrianRoute(bx,bz),p={...route[0],route,routeIndex:1,speed:1.3,activity:'walk'};let distance=0;for(let i=0;i<3600;i++){s.elapsed=i/60;const {x,z}=p;stepPedestrian(p,s,1/60);distance+=Math.hypot(p.x-x,p.z-z);assert(!collision(p.x,p.z,.32));}assert(distance>70,`Sidewalk pedestrian stuck: ${distance}`);}
const crossing={x:-11.55,z:186,route:[{x:11.55,z:186}],activity:'walk',speed:1.3};s.elapsed=0;assert(!trafficSignal('x',0));stepPedestrian(crossing,s,.1);assert.equal(crossing.x,-11.55);s.elapsed=10;stepPedestrian(crossing,s,.1);assert(crossing.x>-11.55);
const phone={x:12.8,z:178,activity:'phone'};stepPedestrian(phone,s,1);assert.equal(phone.x,12.8);phone.flee=3;phone.fleeX=1;phone.fleeZ=0;assert.equal(stepPedestrian(phone,s,.1).activity,'run');assert(phone.x>12.8);
const city=initialState(),bikes=city.vehicles.filter(v=>v.traffic&&vehicleById(v.type).kind==='bike');assert.equal(bikes.length,11);assert(bikes.every(v=>v.driver.rider));const bike=bikes[0];Object.assign(bike,{x:0,z:150,speed:0,heading:0});city.vehicles=[bike];city.x=-1;city.z=150;city.phase='playing';assert(mount(city));for(let i=0;i<500;i++)movePlayer(city,{forward:0,steer:0},1/60);assert.equal(city.mode,'bike');assert(bike.driver.exited);assert(bike.stolen);
for(const type of['vanta','spectre','brutus','kite','aether','atlas','flux','apex'])for(const lowDetail of[true,false]){const model=makeVehicle(type,{lowDetail});let meshes=0;model.group.traverse(o=>{if(o.isMesh){meshes++;assert(o.geometry.index);for(const value of o.geometry.attributes.position.array)assert(Number.isFinite(value));}});assert(meshes>15);}
console.log('PASS: continuous sidewalk walking, crosswalk signals, idle/flee, motorcycle traffic and takeover, finite vehicle geometry in both render modes.');
