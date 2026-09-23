import * as THREE from './vendor/three.module.js';

export function makeBike({lowDetail=false}={}){
 const group=new THREE.Group(),wheels=[],glows=[],rider=new THREE.Group();
 const mat=(color,metalness=.7,roughness=.27)=>new THREE.MeshStandardMaterial({color,metalness,roughness});
 const silver=mat('#bac6d0',.85,.22),dark=mat('#17212c',.8,.3),black=mat('#090d14',.15,.55),rubber=mat('#111319',.03,.88),chrome=mat('#e5edf2',1,.17),gold=mat('#c99542',.8,.23),seat=mat('#171c25',.05,.72),red=new THREE.MeshStandardMaterial({color:'#ff314e',emissive:'#ff163b',emissiveIntensity:3}),white=new THREE.MeshStandardMaterial({color:'#eaffff',emissive:'#95eeff',emissiveIntensity:3});
 const accent=new THREE.MeshStandardMaterial({color:'#c7ff4b',emissive:'#aaff29',emissiveIntensity:1.6,metalness:.4,roughness:.25});
 const glass=new THREE.MeshPhysicalMaterial({color:'#162c3b',metalness:.6,roughness:.12,clearcoat:1,side:THREE.DoubleSide});
 function mesh(geometry,material,pos=[0,0,0],parent=group){const m=new THREE.Mesh(geometry,material);m.position.set(...pos);m.castShadow=true;m.receiveShadow=true;parent.add(m);return m}
 function cube(pos,scale,material,parent=group){const m=mesh(new THREE.BoxGeometry(...scale),material,pos,parent);return m}
 function ellipsoid(pos,scale,material,parent=group){const m=mesh(new THREE.SphereGeometry(1,lowDetail?12:28,lowDetail?8:16),material,pos,parent);m.scale.set(...scale);return m}
 function rod(a,b,r,material,parent=group,r2=r){const aa=new THREE.Vector3(...a),bb=new THREE.Vector3(...b),v=bb.clone().sub(aa);const m=mesh(new THREE.CylinderGeometry(r2,r,v.length(),lowDetail?6:12),material,aa.add(bb).multiplyScalar(.5).toArray(),parent);m.quaternion.setFromUnitVectors(new THREE.Vector3(0,1,0),v.normalize());return m}
 function torus(pos,r,t,material,parent=group){const m=mesh(new THREE.TorusGeometry(r,t,lowDetail?6:12,lowDetail?20:56),material,pos,parent);m.rotation.y=Math.PI/2;return m}
 function loft(rings,material,parent=group){const points=[],idx=[],n=16;for(const [z,y,rx,ry] of rings){for(let j=0;j<n;j++){const a=j/n*Math.PI*2;points.push(Math.cos(a)*rx,y+Math.sin(a)*ry,z)}}for(let i=0;i<rings.length-1;i++)for(let j=0;j<n;j++){const a=i*n+j,b=i*n+(j+1)%n,c=(i+1)*n+j,d=(i+1)*n+(j+1)%n;idx.push(a,b,c,b,d,c)}idx.push(...Array.from({length:n-2},(_,i)=>[0,i+2,i+1]).flat());const k=(rings.length-1)*n;idx.push(...Array.from({length:n-2},(_,i)=>[k,k+i+1,k+i+2]).flat());const g=new THREE.BufferGeometry();g.setAttribute('position',new THREE.Float32BufferAttribute(points,3));g.setIndex(idx);g.computeVertexNormals();return mesh(g,material,[0,0,0],parent)}
 // Two complete wheels: rubber contact patch, machined rim, brake rotors and spokes.
 for(const [z,width] of [[-1.64,.21],[1.50,.29]]){
  const wheel=new THREE.Group();wheel.position.set(0,.70,z);group.add(wheel);wheels.push(wheel);
  const tyre=torus([0,0,0],.51,.18,rubber,wheel);tyre.scale.z=width/.18;
  for(const side of [-1,1]){
   torus([side*width,0,0],.405,.045,chrome,wheel);torus([side*(width+.012),0,0],.445,.017,accent,wheel);
   const disc=mesh(new THREE.CylinderGeometry(.32,.32,.018,48),chrome,[side*(width+.026),0,0],wheel);disc.rotation.z=Math.PI/2;
   const hub=mesh(new THREE.CylinderGeometry(.10,.10,width*2+.10,24),dark,[0,0,0],wheel);hub.rotation.z=Math.PI/2;
   for(let i=0;i<12;i++){const a=i/12*Math.PI*2;const hole=mesh(new THREE.CircleGeometry(.022,7),black,[side*(width+.037),Math.sin(a)*.263,Math.cos(a)*.263],wheel);hole.rotation.y=side*Math.PI/2}
   for(let i=0;i<6;i++){const a=i/6*Math.PI*2;rod([side*width,Math.sin(a)*.09,Math.cos(a)*.09],[side*width,Math.sin(a+.22)*.39,Math.cos(a+.22)*.39],.031,dark,wheel)}
   for(let i=0;i<32;i++){const a=i/32*Math.PI*2;rod([side*width*.55,Math.sin(a)*.686,Math.cos(a)*.686],[side*width*.96,Math.sin(a+.027)*.649,Math.cos(a+.027)*.649],.008,black,wheel)}
  }
  cube([-.36,.75,z+.25],[.13,.25,.14],gold);
 }
 // Chassis and visible electric powertrain.
 for(const s of [-1,1]){
  rod([s*.30,.68,1.5],[s*.34,.90,.33],.105,dark);rod([s*.30,.74,1.5],[s*.34,1.33,.20],.045,chrome);
  rod([s*.34,.75,-1.64],[s*.34,1.62,-1.12],.065,chrome);rod([s*.34,1.12,-1.42],[s*.34,1.96,-.98],.081,gold);
  rod([s*.36,1.52,-.65],[s*.42,.79,.55],.075,chrome);rod([s*.37,.79,.55],[s*.34,1.60,.78],.065,dark);
  rod([s*.48,1.35,.45],[s*.73,.95,.83],.032,chrome);cube([s*.73,.96,.82],[.22,.08,.12],black);
 }
 rod([0,.78,.72],[0,1.50,.44],.09,chrome);
 for(let i=0;i<9;i++)torus([0,1.05+i*.046,.61-i*.012],.12,.019,gold).rotation.set(Math.PI/2-.25,0,0);
 loft([[-1.02,.9,.09,.08],[-.70,.80,.40,.27],[.12,.74,.46,.28],[.66,.94,.33,.27],[.82,1.13,.05,.05]],dark);
 for(const s of [-1,1]){
  const motor=mesh(new THREE.CylinderGeometry(.31,.31,.1,40),dark,[s*.43,1.03,.24]);motor.rotation.z=Math.PI/2;
  torus([s*.50,1.03,.24],.25,.012,chrome);torus([s*.512,1.03,.24],.13,.017,accent);
  for(let i=0;i<7;i++)cube([s*.46,.94+i*.048,-.50],[.035,.015,.52],chrome);
 }
 // Sculpted fairing, tank, sharp tail and floating seat.
 loft([[-1.63,1.36,.025,.025],[-1.30,1.45,.36,.24],[-.86,1.52,.52,.37],[-.30,1.35,.51,.33],[.17,1.07,.40,.17],[.36,1.0,.1,.05]],silver);
 loft([[-.91,1.65,.08,.05],[-.65,1.72,.35,.24],[-.12,1.76,.42,.23],[.34,1.61,.30,.17],[.55,1.49,.15,.06]],silver);
 loft([[.15,1.51,.25,.06],[.48,1.52,.31,.09],[.98,1.67,.25,.065],[1.18,1.77,.13,.025]],seat);
 loft([[.69,1.50,.28,.14],[1.08,1.65,.31,.12],[1.64,1.87,.23,.065],[1.98,1.88,.025,.015]],silver);
 for(const s of [-1,1]){
  rod([s*.48,1.52,-.86],[s*.44,1.20,-.2],.018,accent);
  rod([s*.28,1.57,.83],[s*.24,1.82,1.63],.017,accent);
  const wing=cube([s*.58,1.13,-.91],[.44,.035,.25],dark);wing.rotation.z=s*.1;wing.rotation.y=s*.25;
  cube([s*.70,1.11,-.92],[.13,.023,.25],accent);
  const intake=cube([s*.48,1.16,-.40],[.045,.18,.32],black);intake.rotation.x=-.30;
  for(let i=0;i<4;i++)rod([s*.50,1.13+i*.032,-.53],[s*.50,1.13+i*.032,-.32],.006,chrome);
  rod([s*.27,1.96,-.97],[s*.67,1.93,-.83],.035,chrome);rod([s*.61,1.93,-.85],[s*.79,1.91,-.78],.057,black);
  rod([s*.30,1.78,-1.05],[s*.65,2.1,-1.18],.02,dark);ellipsoid([s*.66,2.12,-1.20],[.16,.067,.055],chrome);
  rod([s*.12,1.47,-1.51],[s*.30,1.51,-1.34],.022,white);
  rod([s*.10,1.83,1.75],[s*.21,1.83,1.65],.026,red);
  // Rear electric boost outlet.
  rod([s*.40,.91,.9],[s*.47,1.10,1.48],.10,dark,group,.07);
  const jet=ellipsoid([s*.47,1.1,1.56],[.07,.07,.14],white);glows.push(jet);
 }
 const wind=loft([[-1.43,1.57,.15,.025],[-1.19,1.99,.24,.015],[-.78,2.10,.30,.02]],glass);wind.material.side=THREE.DoubleSide;
 const cap=mesh(new THREE.CylinderGeometry(.085,.085,.017,24),chrome,[0,1.995,-.13]);
 const dash=cube([0,1.98,-.71],[.43,.025,.23],black);dash.rotation.x=-.42;
 const screen=cube([0,2.002,-.71],[.34,.012,.15],new THREE.MeshStandardMaterial({color:'#51d5f2',emissive:'#30aaba',emissiveIntensity:1}));screen.rotation.x=-.42;
 for(let i=0;i<5;i++)cube([-.1+i*.05,2.016,-.71],[.027,.009,.025],white).rotation.x=-.42;
 // Fenders follow the tyre arc.
 for(const z of [-1.64,1.50]){const f=mesh(new THREE.TorusGeometry(.77,.048,8,32,Math.PI*.9),dark,[0,.7,z]);f.rotation.set(0,Math.PI/2,Math.PI*.05);f.scale.z=5}
 // A crouched rider is shown only during the race.
 group.add(rider);
 ellipsoid([0,2.04,.40],[.29,.39,.45],black,rider).rotation.x=-.75;
 ellipsoid([0,2.24,-.17],[.37,.25,.52],dark,rider).rotation.x=-.35;
 ellipsoid([0,2.50,-.61],[.27,.31,.32],silver,rider);
 ellipsoid([0,2.50,-.85],[.245,.14,.15],glass,rider);
 for(const s of [-1,1]){
  rod([s*.28,2.27,-.27],[s*.51,1.98,-.36],.11,black,rider);rod([s*.51,1.98,-.36],[s*.69,1.94,-.81],.085,dark,rider);ellipsoid([s*.69,1.94,-.81],[.09,.07,.12],black,rider);
  rod([s*.20,1.92,.64],[s*.59,1.20,.1],.14,black,rider);ellipsoid([s*.60,1.20,.1],[.16,.17,.18],silver,rider);rod([s*.59,1.20,.1],[s*.67,1.02,.72],.10,dark,rider);ellipsoid([s*.65,.95,.66],[.13,.10,.25],black,rider);
  rod([s*.16,2.37,.06],[s*.15,2.2,.54],.015,accent,rider);
 }
 return {group,wheels,rider,glows,accent,silver,wind,variant:-1};
}
