import * as T from './vendor/three.module.js';
import {GLTFLoader} from './vendor/loaders/GLTFLoader.js';
let shared;
function clippedScalp(geometry){
 const p=geometry.attributes.position,n=geometry.attributes.normal,idx=geometry.index.array,positions=[],normals=[],indices=[];
 const distance=v=>{const front=T.MathUtils.smoothstep(-v[2],.01,.04);const edge=-.022+front*(.097+.013*Math.exp(-(((v[0]+.025)/.035)**2)));return Math.min(v[1]-edge,Math.abs(v[0])>.071?v[1]-.035:1);};
 for(let i=0;i<idx.length;i+=3){let poly=[idx[i],idx[i+1],idx[i+2]].map(j=>[p.getX(j),p.getY(j),p.getZ(j),n.getX(j),n.getY(j),n.getZ(j)]),out=[];
  for(let k=0;k<3;k++){const a=poly[k],b=poly[(k+1)%3],da=distance(a),db=distance(b);if(da>=0)out.push(a);if((da>=0)!==(db>=0)){const t=da/(da-db);out.push(a.map((v,j)=>v+t*(b[j]-v)));}}
  const start=positions.length/3;for(const v of out){positions.push(v[0]+v[3]*.002,v[1]+v[4]*.002,v[2]+v[5]*.002);normals.push(...v.slice(3));}for(let k=1;k<out.length-1;k++)indices.push(start,start+k,start+k+1);
 }
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(positions,3));g.setAttribute('normal',new T.Float32BufferAttribute(normals,3));g.setIndex(indices);g.computeBoundingSphere();return g;
}
function eyeMaterial(){
 const c=document.createElement('canvas');c.width=128;c.height=64;const q=c.getContext('2d'),im=q.createImageData(128,64);
 for(let y=0;y<64;y++)for(let x=0;x<128;x++){const dx=(x/127-.5)*.026,dy=(y/63-.5)*.010,r=Math.hypot(dx,dy),a=Math.atan2(dy,dx),i=(y*128+x)*4;let rgb=[171,160,148];if(r<.004){const streak=(Math.sin(a*39+r*6500)+1)*9,t=r/.004;rgb=r<.00165?[22,24,22]:[69+streak*t,64+streak*.7,48+streak*.5];if(r>.0037)rgb=[42,43,35];}if(Math.hypot(dx+.001,dy-.0013)<.00042)rgb=[184,179,163];im.data.set([...rgb,255],i);}
 q.putImageData(im,0,0);const map=new T.CanvasTexture(c);map.colorSpace=T.SRGBColorSpace;return new T.MeshStandardMaterial({map,roughness:.36});
}
function eyeGeometry(){
 const p=[0,0,-.089],uv=[.5,.5],idx=[];for(let i=0;i<=40;i++){const a=i/40*Math.PI*2,x=Math.cos(a)*.0125,y=Math.sin(a)*.004;p.push(x,y,-.0845);uv.push(.5+x/.026,.5+y/.010);if(i>0)idx.push(0,i+1,i);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();return g;
}
function loadFace(){
 return shared??=Promise.all([new GLTFLoader().loadAsync('/assets/human/head.glb'),new T.TextureLoader().loadAsync('/assets/human/face-color.jpg'),new T.TextureLoader().loadAsync('/assets/human/face-normal.jpg')]).then(([gltf,map,normalMap])=>{
  let geometry;gltf.scene.traverse(o=>{if(o.isMesh)geometry=o.geometry;});map.colorSpace=T.SRGBColorSpace;map.flipY=true;normalMap.flipY=true;map.anisotropy=4;
  return{geometry,map,normalMap,scalp:clippedScalp(geometry),eyeGeo:eyeGeometry(),eyeMat:eyeMaterial()};
 });
}
export async function installScannedFace({head,fallback,hairMesh,skinMat,variant=0}){
 const {geometry,map,normalMap,scalp:scalpGeometry,eyeGeo,eyeMat}=await loadFace();
 // One licensed scan with restrained complexion variations, not the user's likeness.
 const tint=['#fff7ed','#d8b9a0','#ebd3ba','#cbb098','#f4ddc9','#e5c5ae'][variant%6];
 const material=new T.MeshStandardMaterial({map,normalMap,color:tint,normalScale:new T.Vector2(.48,.48),roughness:.78});
 const detailGroup=new T.Group();head.add(detailGroup);const scan=new T.Mesh(geometry,material);scan.name='Photographic face';detailGroup.add(scan);
 const scalp=new T.Mesh(scalpGeometry,hairMesh.material);detailGroup.add(scalp);const eyes=new T.Group();detailGroup.add(eyes);
 for(const x of[-.024,.033]){const eye=new T.Mesh(eyeGeo,eyeMat);eye.position.set(x,.008,0);eyes.add(eye);}
 detailGroup.traverse(o=>{if(o.isMesh){o.castShadow=true;o.userData.dynamic=true;}});skinMat.color.set('#b98a73').multiply(new T.Color(tint));
 return{update({detail=true,time=1,fallen=0}={}){detailGroup.visible=detail;fallback.visible=!detail;hairMesh.visible=!detail;eyes.visible=!fallen&&((time+variant*.71)%5.3>.11);},scan};
}
