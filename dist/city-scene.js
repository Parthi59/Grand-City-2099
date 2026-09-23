import {pedestrianRoute} from './street-life.js';
import * as T from './vendor/three.module.js';
import {buildings,seed} from './city-data.js';
import {makeHuman} from './character.js';
import {makeVehicle} from './vehicle-model.js';
import {cityMaterials,makeAtlasGeometry} from './city-materials.js';

export function createCity({lowDetail=false}={}){
 const {m,environment,ready}=cityMaterials(),scene=new T.Scene();scene.background=new T.Color('#c9dae0');scene.fog=new T.Fog('#c9d5d5',180,620);
 const geobox=new T.BoxGeometry(1,1,1),sphereGeo=new T.SphereGeometry(1,lowDetail?12:20,lowDetail?8:14),tubeGeo=new T.CylinderGeometry(1,1,1,8);
 const up=new T.Vector3(0,1,0),colliders=[],palms=[],signals=[];
 const glow=c=>new T.MeshStandardMaterial({color:c,emissive:c,emissiveIntensity:.4,roughness:.45});
 const warm=glow('#f7dfb0'),cyan=glow('#96cec5'),amber=glow('#ffcd7d'),signalGreen=glow('#71c68e'),signalRed=glow('#d76347');
 function box(x,y,z,w,h,d,mat,parent=scene,detail=false){const o=new T.Mesh(geobox,mat);o.position.set(x,y,z);o.scale.set(w,h,d);o.castShadow=h>.3;o.receiveShadow=true;o.userData.detail=detail;parent.add(o);return o;}
 function ball(x,y,z,sx,sy,sz,mat,parent=scene){const o=new T.Mesh(sphereGeo,mat);o.position.set(x,y,z);o.scale.set(sx,sy,sz);o.castShadow=true;parent.add(o);return o;}
 function tube(a,b,r,mat,parent=scene,detail=true){const av=new T.Vector3(...a),bv=new T.Vector3(...b),delta=bv.clone().sub(av);const o=new T.Mesh(tubeGeo,mat);o.position.copy(av.add(bv).multiplyScalar(.5));o.scale.set(r,delta.length(),r);o.quaternion.setFromUnitVectors(up,delta.normalize());o.castShadow=true;o.userData.detail=detail;parent.add(o);return o;}
 function surface(x,y,z,w,h,yaw,quadrant,material,tileW=14,tileH=16){const o=new T.Mesh(makeAtlasGeometry(w,h,tileW,tileH,quadrant),material);o.position.set(x,y,z);o.rotation.y=yaw;o.receiveShadow=true;o.userData.surface=true;scene.add(o);return o;}
 function paving(x,z,w,d,quadrant,material,y=.15,tile=8,order=-20){const o=surface(x,y,z,w,d,0,quadrant,material,tile,tile);o.rotation.x=-Math.PI/2;o.renderOrder=order;return o;}
 function sign(text,x,y,z,w,h=1,color='#e8e6d3',bg='#294048',yaw=0){const c=document.createElement('canvas');c.width=512;c.height=128;const q=c.getContext('2d');q.fillStyle=bg;q.fillRect(0,0,512,128);q.fillStyle=color;q.textAlign='center';q.textBaseline='middle';q.font='600 62px Arial';const measure=q.measureText(text).width;if(measure>466)q.font='600 '+Math.floor(62*466/measure)+'px Arial';q.fillText(text,256,66);const tex=new T.CanvasTexture(c);tex.colorSpace=T.SRGBColorSpace;const o=new T.Mesh(new T.PlaneGeometry(w,h),new T.MeshStandardMaterial({map:tex,roughness:.8,side:T.DoubleSide}));o.position.set(x,y,z);o.rotation.y=yaw;o.userData.detail=true;scene.add(o);return o;}
 // Roads use metre-scaled surface tiles and remain on the existing continuous street network.
 box(0,-.18,0,760,.3,760,m.concrete).renderOrder=-40;
 for(let i=-3;i<=3;i++){
  paving(i*100,0,22,690,0,m.asphalt,.005,lowDetail?16:10,-35);
  for(let block=-3;block<3;block++)paving(block*100+50,i*100,78,22,0,m.asphalt,.007,lowDetail?16:10,-35);
  for(let along=-337;along<340;along+=9){const near=Math.abs(along-Math.round(along/100)*100)<18;if(near)continue;
   for(const side of[-1,1]){
    box(i*100+side*.14,.025,along,.10,.018,8,m.yellow,scene,true);box(along,.025,i*100+side*.14,8,.018,.10,m.yellow,scene,true);
    box(i*100+side*3.25,.027,along,.10,.018,3,m.paint,scene,true);box(along,.027,i*100+side*3.25,3,.018,.10,m.paint,scene,true);
    box(i*100+side*7.55,.027,along,.10,.018,8,m.paint,scene,true);box(along,.027,i*100+side*7.55,8,.018,.10,m.paint,scene,true);
   }
  }
 }
 for(let bx=-3;bx<3;bx++)for(let bz=-3;bz<3;bz++){
  const x=bx*100+50,z=bz*100+50;box(x,.035,z,78,.22,78,m.concrete).renderOrder=-30;paving(x,z,78,78,1,m.pavement,.15,8,-25);
  // Real curb edges and drainage strips, with gaps at every intersection.
  for(const side of[-1,1]){box(x,.19,z+side*38.9,77,.22,.23,m.stone);box(x+side*38.9,.19,z,.23,.22,77,m.stone);box(x,.019,z+side*39.25,77,.024,.25,m.dark,scene,true);box(x+side*39.25,.019,z,.25,.024,77,m.dark,scene,true);}
 }
 const shopNames=['MARÉ COFFEE','SOUTH COAST','STUDIO 07','NORI MARKET','ATELIER','LUMA HOTEL','ORBIT AUDIO','PALM HOUSE'];
 function facadeBlock(b,x,z,w,d,y,h,style){
  const quadrant=style==='glass'?1:style==='brick'?2:style==='limestone'?3:0,material=style==='glass'?m.glassFacade:m.facade;
  const tw=style==='glass'?14:14,th=style==='glass'?25.6:style==='brick'||style==='limestone'?12.8:16;
  box(x,y+h/2,z,w,h,d,style==='glass'?m.dark:m.ivory);
  surface(x,y+h/2,z+d/2+.02,w,h,0,quadrant,material,tw,th);
  surface(x,y+h/2,z-d/2-.02,w,h,Math.PI,quadrant,material,tw,th);
  surface(x-w/2-.02,y+h/2,z,d,h,-Math.PI/2,quadrant,material,tw,th);
  surface(x+w/2+.02,y+h/2,z,d,h,Math.PI/2,quadrant,material,tw,th);
  box(x,y+h+.12,z,w+.42,.25,d+.42,m.stone);
  box(x,y+h+.3,z,w-.4,.2,d-.4,m.roof);
 }
 function shopFront(b,axis){const along=axis==='z'?b.w:b.d,cx=b.x,cz=b.z,side=axis==='z'?(b.z%100+100)%100<50?-1:1:(b.x%100+100)%100<50?-1:1;
  const p=(a,y,out=0)=>axis==='z'?[cx+a,y,cz+side*(b.d/2+out)]:[cx+side*(b.w/2+out),y,cz+a];
  const sized=(a,y,out,w,h,d,mat,detail=true)=>{const v=p(a,y,out);return box(v[0],v[1],v[2],axis==='z'?w:d,h,axis==='z'?d:w,mat,scene,detail)};
  sized(0,1.82,.06,along-.8,3.3,.1,m.shopGlass,false);
  for(let a=-along/2+1.7;a<along/2;a+=4.1){sized(a,1.85,.18,.12,3.35,.20,m.stone);sized(a+.35,1.3,.23,.045,.6,.07,m.metal);}
  sized(0,.27,.2,along,.24,.32,m.stone);sized(0,3.58,.2,along+.4,.24,.5,m.stone);
  if(b.id%2===0){sized(0,3.35,.85,along*.82,.15,1.7,b.id%4===0?m.fabric:m.ivory);for(const a of[-along*.35,along*.35])sized(a,1.7,1.4,.06,3.0,.06,m.metal);}
  const v=p(0,4.08,.19),yaw=axis==='z'?(side<0?Math.PI:0):(side<0?-Math.PI/2:Math.PI/2);sign(shopNames[b.id%shopNames.length],v[0],v[1],v[2],Math.min(10,along*.55),.65,'#e8e0c9',b.style==='brick'?'#485851':'#39494b',yaw);
 }
 for(const b of buildings){
  const y=.16,base=4.7;box(b.x,base/2+y,b.z,b.w,base,b.d,m.stone);colliders.push(b);
  if(b.style==='glass'){
   const setback=b.id%3===0,lower=setback?b.h*.50:b.h-base;
   facadeBlock(b,b.x,b.z,b.w-.35,b.d-.35,y+base,lower,b.style);
   if(setback)facadeBlock(b,b.x+b.w*.1,b.z-b.d*.04,b.w*.67,b.d*.76,y+base+lower,b.h-base-lower,b.style);
   for(const side of[-1,1])for(let k=-1;k<=1;k++){box(b.x+k*b.w*.28,y+b.h*.5,b.z+side*(b.d/2+.12),.16,b.h,.2,m.metal,scene,true);}
   if(b.id%4===0){box(b.x,b.h+1.6,b.z,b.w*.4,2.5,b.d*.35,m.dark);tube([b.x,b.h+2,b.z],[b.x,b.h+9,b.z],.045,m.metal,scene,false);}
  }else{
   const upper=b.style==='terrace'?b.h*.62:b.h-base;
   facadeBlock(b,b.x,b.z,b.w,b.d,y+base,upper,b.style);
   if(b.style==='terrace')facadeBlock(b,b.x,b.z,b.w*.80,b.d*.72,y+base+upper,b.h-base-upper,b.style);
   for(let floor=base+3.2;floor<b.h;floor+=3.2){if(b.style==='limestone'&&Math.round(floor)%2)continue;box(b.x,floor,b.z,b.w+.4,.13,b.d+.4,m.stone,scene,true);}
   if(b.id%3===0||b.style==='terrace')for(let floor=6.6;floor<Math.min(b.h,23);floor+=3.2)for(const side of[-1,1]){
    const x=b.x+side*b.w*.24,z=b.z-b.d/2-.65;box(x,floor,z,4.3,.16,1.6,m.stone,scene,true);box(x,floor+.56,z-.76,4.25,1.0,.045,m.glass,scene,true);for(const edge of[-1,1])box(x+edge*2.1,floor+.56,z,.05,1,1.5,m.metal,scene,true);
   }
   for(const a of[-1,1]){box(b.x+a*b.w*.27,b.h+.65,b.z,2.5,1.1,2,m.concrete,scene,true);box(b.x+a*b.w*.27,b.h+1.2,b.z,2.6,.1,2.1,m.dark,scene,true);}
  }
  // Street corners have commercial entrances; upper floors remain proportioned to 3.2 m stories.
  shopFront(b,'z');shopFront(b,'x');
  if(b.id%5===0){for(let i=0;i<3;i++){const o=box(b.x-4+i*4,b.h+.7,b.z+4,3.3,.07,2,m.glass,scene,true);o.rotation.x=-.23;}}
  // Soft projected building shadows also ground the compatibility renderer.
  if(lowDetail){const g=new T.BufferGeometry(),dx=Math.min(40,b.h*.45),dz=Math.min(30,b.h*.32),x=b.x,z=b.z,w=b.w/2,d=b.d/2;g.setAttribute('position',new T.Float32BufferAttribute([x-w,.155,z-d,x+w,.155,z-d,x+w+dx,.155,z+d+dz,x-w+dx,.155,z+d+dz],3));g.setIndex([0,2,1,0,3,2]);g.computeVertexNormals();const shadow=new T.Mesh(g,m.shadow);shadow.material.side=T.DoubleSide;shadow.renderOrder=-12;shadow.userData.groundShadow=true;scene.add(shadow);}
 }
 // Palms use feathered fronds, curved trunks, and shared geometries.
 const palmCrown=new T.BufferGeometry(),verts=[],idx=[];let count=0;
 for(let leaf=0;leaf<9;leaf++){const a=leaf/9*Math.PI*2,dir=new T.Vector3(Math.sin(a),0,Math.cos(a)),side=new T.Vector3(Math.cos(a),0,-Math.sin(a)),length=2.9+seed(leaf+41)*.8;
  for(let j=1;j<13;j++){const u=j/13,center=dir.clone().multiplyScalar(length*u);center.y=Math.sin(u*Math.PI)*.45-u*u*1.05;for(const s of[-1,1]){const end=center.clone().addScaledVector(side,s*(1-u)*.85).addScaledVector(dir,.38);end.y-=.16;const next=center.clone().addScaledVector(dir,.23);verts.push(center.x,center.y,center.z,end.x,end.y,end.z,next.x,next.y,next.z);idx.push(count,count+1,count+2);count+=3;}}
 }
 palmCrown.setAttribute('position',new T.Float32BufferAttribute(verts,3));palmCrown.setIndex(idx);palmCrown.computeVertexNormals();m.leaf.side=T.DoubleSide;m.leafLight.side=T.DoubleSide;
 const trunkCurve=new T.CatmullRomCurve3([new T.Vector3(0,0,0),new T.Vector3(.08,2,0),new T.Vector3(.3,5,-.07),new T.Vector3(.63,8.2,.1)]),palmTrunk=new T.TubeGeometry(trunkCurve,9,.125,7,false);
 function palm(x,z,height=9){const g=new T.Group();g.position.set(x,.16,z);g.scale.setScalar(height/8.2);const trunk=new T.Mesh(palmTrunk,m.bark);trunk.castShadow=true;g.add(trunk);const leaves=new T.Mesh(palmCrown,m.leaf);leaves.position.set(.63,8.2,.1);leaves.rotation.y=seed(x+z)*6;leaves.castShadow=true;g.add(leaves);g.userData.palm=true;g.userData.baseAngle=leaves.rotation.y;g.userData.leaves=leaves;scene.add(g);palms.push(g);box(x,.29,z,1.3,.28,1.3,m.soil,scene,true);}
 for(let lane=-2;lane<=2;lane++)for(let z=-270;z<=290;z+=40){if(Math.abs(z-Math.round(z/100)*100)<17)continue;for(const side of[-1,1]){const x=lane*100+side*13.7;if(x>10&&x<40&&z>154&&z<180)continue;palm(x,z,7.8+seed(x+z)*3.2);}}
 for(let x=-285;x<300;x+=25)palm(x,339,9+seed(x)*2);
 // Green civic courts replace featureless paved voids.
 for(const [cx,cz]of[[50,150],[-50,-50]]){
  box(cx,.17,cz,70,.09,70,m.grass).renderOrder=-22;paving(cx,cz,10,70,3,m.pavement,.235,8,-18);paving(cx,cz,70,8,3,m.pavement,.236,8,-18);
  box(cx,.28,cz,19,.32,19,m.stone);box(cx,.47,cz,16,.10,16,m.water);
  const sculpture=new T.Mesh(new T.TorusGeometry(3.6,.16,8,48),m.copper);sculpture.position.set(cx,5,cz);sculpture.rotation.y=.45;sculpture.castShadow=true;scene.add(sculpture);box(cx,2.0,cz,.55,4,.55,m.copper);
  for(let i=0;i<8;i++){const a=i/8*Math.PI*2,x=cx+Math.cos(a)*27,z=cz+Math.sin(a)*27;if(x<40&&z>153&&z<178)continue;const g=new T.Group();g.position.set(x,.15,z);tube([0,0,0],[.2,3.9,.1],.20,m.bark,g,false);for(let j=0;j<5;j++){const p=j*2.4;ball(Math.sin(p)*1.3,4.4+seed(i+j)*1.1,Math.cos(p)*1.3,1.7,1.7,1.7,j%2?m.leaf:m.leafLight,g);}scene.add(g);}
 }
 // Street furniture is placed at sidewalk scale rather than scattered on traffic lanes.
 for(let i=0;i<48;i++){
  const x=(i%6-3)*100+13.3,z=-265+Math.floor(i/6)*72;
  tube([x,.2,z],[x,6.5,z],.065,m.metal);tube([x,6.5,z],[x-2,6.5,z],.06,m.metal);box(x-2,6.5,z,1.2,.09,.27,m.ivory,scene,true);
  box(x+1.2,.52,z,.42,.9,.45,m.dark,scene,true);
  if(i%2===0){const bx=x+1.4,bz=z+4;for(let slat=0;slat<4;slat++)box(bx,.5,bz+slat*.12,1.9,.06,.08,m.copper,scene,true);box(bx,.8,bz+.42,1.9,.4,.06,m.copper,scene,true);for(const side of[-1,1])box(bx+side*.72,.28,bz+.17,.07,.48,.42,m.metal,scene,true);}
  if(i%8===0){box(x+1.6,2.9,z-6,3.6,.13,4.6,m.ivory);for(const s of[-1,1])tube([x+3,.2,z-6+s*2],[x+3,2.9,z-6+s*2],.06,m.metal);box(x+3,1.6,z-6,.045,2.4,4.2,m.glass);sign('CITYLINK',x+1.5,2.6,z-3.66,2.7,.38);}
 }
 for(let x=-2;x<=2;x++)for(let z=-2;z<=2;z++){
  const cx=x*100,cz=z*100;
  for(const side of[-1,1]){
   for(let j=-6;j<=6;j++){box(cx+j*1.48,.033,cz+side*13.5,.75,.018,3.2,m.paint,scene,true);box(cx+side*13.5,.034,cz+j*1.48,3.2,.018,.75,m.paint,scene,true);}
   box(cx-side*5.2,.033,cz+side*18.2,8.2,.018,.25,m.paint,scene,true);box(cx+side*18.2,.033,cz+side*5.2,.25,.018,8.2,m.paint,scene,true);
   const px=cx+side*12.5,pz=cz+side*16.5;tube([px,.2,pz],[px,5.8,pz],.075,m.metal);box(px,5.45,pz,.32,.96,.22,m.dark);const light=ball(px,5.6,pz+.13,.085,.085,.035,signalGreen);light.userData.axis=side>0?'z':'x';signals.push(light);
  }
  sign(x<0?'OLD QUARTER':z>0?'HARBOR DRIVE':'ZENITH AVENUE',cx-12.6,3.15,cz-13,3.3,.34,'#e1e6df','#50645c');
 }
 // South Gate workshop and its five visible bike bays remain at their original locations.
 box(25,.19,166,24,.15,12,m.concrete).renderOrder=-18;paving(25,166,24,12,1,m.pavement,.267,6,-16);
 box(25,3.8,162,26,.24,8,m.ivory);box(25,1.9,159,24,3.8,.16,m.dark);
 for(const x of[13,37])tube([x,.2,162],[x,3.8,162],.09,m.metal);
 for(let i=0;i<3;i++){const x=17+i*8;box(x,1.6,159.12,6.5,3.0,.045,m.metal);for(let h=.3;h<3.1;h+=.18)box(x,h,159.16,6.4,.023,.035,m.dark,scene,true);box(x,3.45,159.16,6.6,.10,.04,warm);}
 sign('GRAND CITY MOTORWORKS',25,4.03,166.02,12,.7,'#e8e4cc','#263c43');
 for(let i=0;i<5;i++){const x=18+i*3.4;box(x,.29,166,2.6,.08,3.9,m.dark).renderOrder=-14;box(x,.338,167.9,2.6,.008,.035,cyan);sign(String(i+1).padStart(2,'0'),x,.62,168.18,.35,.18,'#f2eedf','#3f555a');}
 // Promenade, sea wall, marina and distant hills establish a coastal setting.
 box(0,-1.1,357,740,2.2,2,m.stone);paving(0,346,710,18,3,m.pavement,.15,8,-22);
 const ocean=box(0,-.78,1050,2500,.08,1400,m.water);ocean.renderOrder=-38;
 for(let x=-337;x<340;x+=7){tube([x,.2,355],[x,1.25,355],.035,m.metal,scene,true);tube([x,1.25,355],[x+7,1.25,355],.035,m.metal,scene,true);}
 for(let pier=0;pier<4;pier++){const x=150+pier*30;box(x,-.25,375,3,.6,37,m.copper);for(const side of[-1,1]){const boat=new T.Group();boat.position.set(x+side*5,-.2,378+seed(pier)*10);boat.rotation.y=.08*side;const hull=new T.Mesh(new T.SphereGeometry(1,16,8),m.ivory);hull.scale.set(1.5,.5,4.3);boat.add(hull);box(0,.6,.5,2.0,1.0,2.7,m.dark,boat);box(0,1.2,.6,2.1,.10,2.8,m.ivory,boat);scene.add(boat);}}
 const hillsGeo=new T.PlaneGeometry(1800,700,40,16);hillsGeo.rotateX(-Math.PI/2);const hp=hillsGeo.attributes.position;for(let i=0;i<hp.count;i++){const x=hp.getX(i),z=hp.getZ(i);hp.setY(i,20+Math.sin(x*.006)*25+Math.cos(z*.012+x*.003)*22+Math.max(0,Math.sin(x*.012))*26);}hillsGeo.computeVertexNormals();const hills=new T.Mesh(hillsGeo,new T.MeshStandardMaterial({color:'#829182',roughness:1}));hills.position.set(0,-15,-790);hills.userData.distant=true;scene.add(hills);
 // Elevated transit stays on the western perimeter and provides a moving skyline detail.
 box(-318,10,0,5.4,.65,690,m.stone);for(let z=-300;z<=300;z+=60)box(-318,5,z,.95,10,1.2,m.concrete);
 const train=new T.Group();train.position.set(-318,12,0);for(let car=-1;car<=1;car++){box(0,0,car*17,2.8,2.0,16,m.ivory,train);box(0,1.0,car*17,2.8,.13,16.2,m.metal,train);for(const side of[-1,1]){box(side*1.41,.22,car*17,.025,.87,14,m.shopGlass,train);for(let i=-3;i<=3;i++)box(side*1.44,.2,car*17+i*2,.035,1.8,.1,m.ivory,train);}box(0,-.7,car*17,2.83,.12,16,m.teal,train);}scene.add(train);
 // Warm low sun, cooler skylight, filmic exposure, and a reflective sky environment.
 scene.add(new T.HemisphereLight('#dceaf1','#8f856e',1.45));const sun=new T.DirectionalLight('#ffe3b6',3.2);sun.position.set(-65,95,45);sun.castShadow=!lowDetail;sun.shadow.mapSize.set(2048,2048);Object.assign(sun.shadow.camera,{left:-58,right:58,top:58,bottom:-58,near:.1,far:240});sun.shadow.bias=-.00025;sun.shadow.normalBias=.035;sun.shadow.radius=3;scene.add(sun,sun.target);
 const player=makeHuman({lowDetail,hero:false,variant:1});scene.add(player.group);
 const pedestrians=[];for(let i=0;i<(lowDetail?30:52);i++){
 const route=pedestrianRoute(i<14?0:(i%5)-2,i<14?1:(Math.floor(i/5)%5)-2,i%2?1:-1),p=makeHuman({color:['#667c97','#b7a48e','#835a51','#bec9ce','#526753','#343e50'][i%6],skin:['#ae795a','#d5ac87','#795b43'][i%3],lowDetail:true,variant:i%6,civilian:lowDetail?i===12:i%4===1||i===12});
 const start=i%4;Object.assign(p,{route,routeIndex:(start+1)%4,x:route[start].x,z:route[start].z,heading:0,speed:1.08+seed(i+111)*.5,phase:i,activity:i%7===0?'jog':i%5===0?'browse':'walk'});
 if(i<10){p.x=i%2?-11.55:11.55;p.z=135+i*5;p.route=i%2?[{x:-11.55,z:188.45},{x:-88.45,z:188.45},{x:-88.45,z:111.55},{x:-11.55,z:111.55}]:[{x:11.55,z:188.45},{x:88.45,z:188.45},{x:88.45,z:111.55},{x:11.55,z:111.55}];p.routeIndex=0;}
 if(i===10||i===11){p.x=18+(i-10)*1.4;p.z=178.5;p.route=null;p.activity='talk';p.heading=i===10?Math.PI/2:-Math.PI/2;}
 if(i===12){p.x=12.8;p.z=178;p.route=null;p.activity='phone';p.heading=-.5;}
 if(i===13){p.x=39;p.z=172;p.route=null;p.activity='look';p.heading=-Math.PI/2;}
 if(i===14||i===15){p.x=i===14?-11.55:11.55;p.z=186;p.route=[{x:-11.55,z:186},{x:11.55,z:186}];p.routeIndex=i===14?1:0;p.activity='walk';}
 scene.add(p.group);pedestrians.push(p);}
 const marker=new T.Group(),ring=new T.Mesh(new T.TorusGeometry(5,.06,6,40),amber);ring.rotation.x=Math.PI/2;ring.position.y=.12;marker.add(ring);const diamond=new T.Mesh(new T.OctahedronGeometry(.75),amber);diamond.position.y=5;marker.add(diamond);const beacon=new T.Mesh(new T.CylinderGeometry(.045,.045,45,6),new T.MeshBasicMaterial({color:'#ffd280',transparent:true,opacity:.22}));beacon.position.y=23;beacon.userData.detail=true;marker.add(beacon);marker.visible=false;scene.add(marker);
 // Repeated details are instanced by material; facade surfaces are merged by neighbourhood.
 if(!lowDetail){
  const groups=new Map();scene.traverse(o=>{if(o.isMesh&&o.geometry===geobox&&o.parent===scene){const key=o.material.uuid;if(!groups.has(key))groups.set(key,[]);groups.get(key).push(o)}});
  for(const items of groups.values()){const batch=new T.InstancedMesh(geobox,items[0].material,items.length);items.forEach((o,i)=>{o.updateMatrix();batch.setMatrixAt(i,o.matrix);scene.remove(o)});batch.instanceMatrix.needsUpdate=true;batch.castShadow=items.some(o=>o.castShadow);batch.receiveShadow=true;batch.computeBoundingSphere();scene.add(batch);}
  const surfaces=new Map();scene.traverse(o=>{if(o.isMesh&&o.userData.surface){const key=o.material.uuid+':'+Math.floor(o.position.x/200)+':'+Math.floor(o.position.z/200);if(!surfaces.has(key))surfaces.set(key,[]);surfaces.get(key).push(o)}});
  for(const items of surfaces.values()){const p=[],n=[],uv=[],index=[];let offset=0;for(const o of items){o.updateMatrix();const g=o.geometry.clone().applyMatrix4(o.matrix);p.push(...g.attributes.position.array);n.push(...g.attributes.normal.array);uv.push(...g.attributes.uv.array);for(const id of g.index.array)index.push(id+offset);offset+=g.attributes.position.count;scene.remove(o);o.geometry.dispose();g.dispose();}const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(p,3));g.setAttribute('normal',new T.Float32BufferAttribute(n,3));g.setAttribute('uv',new T.Float32BufferAttribute(uv,2));g.setIndex(index);const batch=new T.Mesh(g,items[0].material);batch.receiveShadow=true;batch.frustumCulled=true;scene.add(batch);}
 }
 return{scene,player,pedestrians,marker,diamond,sun,signals,signalGreen,signalRed,train,colliders,palms,environment,ready:Promise.all([ready,player.ready]),water:m.water,makeVehicle:type=>{const v=makeVehicle(type,{lowDetail});scene.add(v.group);return v;}};
}
