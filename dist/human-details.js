import * as T from './vendor/three.module.js';
let cloth;const fingers=new T.SphereGeometry(1,8,6);const limbCache=new Map();
export function clothTexture(){
 if(cloth||typeof document==='undefined')return cloth;
 const c=document.createElement('canvas');c.width=c.height=128;const q=c.getContext('2d');if(!q?.createImageData)return null;
 const image=q.createImageData(128,128);let seed=391;
 for(let y=0;y<128;y++)for(let x=0;x<128;x++){seed=(seed*1664525+1013904223)>>>0;const weave=((x+y)%4===0?-12:0)+(x%2===0?4:0),v=235+weave+(seed%13);const i=(y*128+x)*4;image.data[i]=image.data[i+1]=image.data[i+2]=v;image.data[i+3]=255;}
 q.putImageData(image,0,0);cloth=new T.CanvasTexture(c);cloth.colorSpace=T.SRGBColorSpace;cloth.wrapS=cloth.wrapT=T.RepeatWrapping;cloth.repeat.set(3,3);return cloth;
}
// Rings produce fitted cloth silhouettes, with soft elbow/knee folds, not tubes.
export function limbGeometry(kind,lowDetail){
 const key=kind+lowDetail;if(limbCache.has(key))return limbCache.get(key);
 const profiles={thigh:[[-.5,.92],[-.37,1.03],[-.13,.99],[.13,.87],[.35,.74],[.5,.74]],shin:[[-.5,1.01],[-.30,1.10],[-.1,.96],[.16,.83],[.35,.72],[.5,.76]],sleeve:[[-.5,.84],[-.36,1.08],[-.13,1.02],[.12,.87],[.34,.78],[.5,.84]],forearm:[[-.5,1.08],[-.31,1.02],[-.05,.91],[.23,.72],[.4,.70],[.5,.79]]}[kind];
 const n=lowDetail?12:20,p=[],uv=[],idx=[];
 for(let r=0;r<profiles.length;r++){const[y,width]=profiles[r];for(let j=0;j<=n;j++){const a=j/n*Math.PI*2,fold=1+.025*Math.sin(a*3+r*2);p.push(Math.sin(a)*width*fold,y,Math.cos(a)*width*.94*fold);uv.push(j/n,r/(profiles.length-1));}}
 for(let r=0;r<profiles.length-1;r++)for(let j=0;j<n;j++){const a=r*(n+1)+j,b=a+n+1;idx.push(a,a+1,b,a+1,b+1,b);}
 const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(idx);g.computeVertexNormals();limbCache.set(key,g);return g;
}
export function makeHand(material,side,sphere){
 const hand=new T.Group();
 const part=(x,y,z,sx,sy,sz)=>{const m=new T.Mesh(fingers,material);m.position.set(x,y,z);m.scale.set(sx,sy,sz);hand.add(m);return m;};
 part(0,-.022,0,.034,.045,.018);
 for(let i=0;i<4;i++){const length=[.043,.05,.047,.036][i],x=(i-1.5)*.015;part(x,-.054-length*.28,-.004,.008,length*.57,.008);part(x,-.062-length*.70,-.013,.0075,length*.28,.0075);}
 const thumb=part(-side*.033,-.022,-.007,.012,.034,.011);thumb.rotation.z=-side*.45;
 return hand;
}
