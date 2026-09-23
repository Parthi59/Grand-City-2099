import assert from 'node:assert/strict';
import * as T from '../dist/vendor/three.module.js';
import {SoftwareWorldRenderer} from '../dist/world-software.js';
import {createCity} from '../dist/city-scene.js';

// A minimal canvas surface supports scene construction and CPU pixel verification.
function canvas(){
 const c={width:32,height:32};let last;
 const q={createImageData:(w,h)=>({width:w,height:h,data:new Uint8ClampedArray(w*h*4)}),putImageData:im=>{c.output=im;},drawImage:img=>{last=img;},getImageData:(x,y,w,h)=>{const im=q.createImageData(w,h);for(let i=0;i<im.data.length;i+=4){im.data[i]=last?.rgb?.[0]||0;im.data[i+1]=last?.rgb?.[1]||0;im.data[i+2]=last?.rgb?.[2]||0;im.data[i+3]=255;}return im;},createLinearGradient:()=>({addColorStop(){}}),createRadialGradient:()=>({addColorStop(){}}),fillRect(){},fillText(){},measureText:text=>({width:text.length*30})};c.getContext=()=>q;return c;
}
globalThis.document={createElement:canvas,createElementNS:()=>{const handlers={};return{width:128,height:128,addEventListener:(name,fn)=>{handlers[name]=fn;},removeEventListener(){},set src(value){queueMicrotask(()=>handlers.load?.call(this));}};}};

// Texture tiles must win depth tests against a larger underlying building face,
// independent of painter order. Transparent glass behind the wall stays hidden.
const c=canvas(),r=new SoftwareWorldRenderer(c);r.setSize(48,48);
const scene=new T.Scene(),camera=new T.PerspectiveCamera(55,1,.1,100);camera.position.z=5;
const wall=new T.Mesh(new T.PlaneGeometry(5,5),new T.MeshBasicMaterial({color:'red'}));scene.add(wall);
const tile=new T.Mesh(new T.PlaneGeometry(2,2),new T.MeshBasicMaterial({color:'white',map:new T.Texture({width:16,height:16,rgb:[0,0,255]})}));tile.position.z=.02;tile.renderOrder=-30;scene.add(tile);
const behind=new T.Mesh(new T.PlaneGeometry(2,2),new T.MeshBasicMaterial({color:'green',transparent:true,opacity:.9}));behind.position.z=-.1;scene.add(behind);r.render(scene,camera);
const center=(24*48+24)*4;assert(c.output.data[center+2]>100);assert.equal(c.output.data[center],0);assert.equal(c.output.data[center+1],0);
tile.visible=false;r.render(scene,camera);assert(c.output.data[center]>100);assert.equal(c.output.data[center+1],0);

// Exercise the hardware scene's geometry merging and instancing even on CI
// hosts without a GPU. This does not claim visual WebGL validation.
const world=createCity({lowDetail:false});await world.ready;let batches=0,surfaces=0;
world.scene.traverse(mesh=>{if(mesh.isInstancedMesh)batches++;if(mesh.isMesh){const p=mesh.geometry.attributes.position;for(const value of p.array)assert(Number.isFinite(value));if(mesh.material.map)surfaces++;}});
assert(batches>=8);assert(surfaces>20);assert.equal(world.pedestrians.length,52);assert(world.palms.length>60);
console.log('PASS: depth-correct textured facades, transparent occlusion, finite merged geometry and hardware instance construction.');
