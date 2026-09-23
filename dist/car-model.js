import * as T from './vendor/three.module.js';
const up=new T.Vector3(0,1,0),unitBox=new T.BoxGeometry(1,1,1);
export function buildCar({d,group,lowDetail,doors,wheels,front,lights}){
 const w=d.width,l=d.length,h=d.height,pickup=d.design==='pickup',van=d.design==='van',wagon=d.design==='wagon',hatch=d.design==='hatch',roadster=d.design==='roadster',hyper=d.design==='hyper',muscle=d.design==='muscle',limo=d.design==='limo',police=d.engine==='security',suv=d.design==='suv'||pickup||van,sport=['sport','concept','roadster','hyper'].includes(d.design),ev=['ev','concept'].includes(d.design);
 const mat=(color,metalness=0,roughness=.6)=>new T.MeshStandardMaterial({color,metalness,roughness});
 const paint=new T.MeshPhysicalMaterial({color:d.color,metalness:.64,roughness:.23,clearcoat:1,clearcoatRoughness:.12,envMapIntensity:1.15}),dark=mat('#152029',.15,.42),rubber=mat('#17191c',0,.95),chrome=mat('#a4b0b5',.92,.20),seatMat=mat('#22272d',0,.76),brake=mat('#a34832',.5,.4);
 const glass=new T.MeshPhysicalMaterial({color:'#344c58',metalness:.25,roughness:.09,transparent:true,opacity:.35,depthWrite:false,clearcoat:1,envMapIntensity:1.4}),white=new T.MeshStandardMaterial({color:'#f8efdb',emissive:'#f4ead2',emissiveIntensity:.6}),red=new T.MeshStandardMaterial({color:'#9e2626',emissive:'#df3222',emissiveIntensity:.7});
 const mesh=(geo,material,x=0,y=0,z=0,parent=group)=>{const o=new T.Mesh(geo,material);o.position.set(x,y,z);parent.add(o);return o;};
 const box=(x,y,z,sx,sy,sz,material,parent=group)=>{const o=mesh(unitBox,material,x,y,z,parent);o.scale.set(sx,sy,sz);return o;};
 const ell=(x,y,z,sx,sy,sz,material,parent=group)=>{const o=mesh(new T.SphereGeometry(1,lowDetail?14:24,lowDetail?8:14),material,x,y,z,parent);o.scale.set(sx,sy,sz);return o;};
 const rod=(a,b,r,material,parent=group)=>{const av=new T.Vector3(...a),bv=new T.Vector3(...b),delta=bv.clone().sub(av),mid=av.add(bv).multiplyScalar(.5);const o=mesh(new T.CylinderGeometry(r,r,delta.length(),8),material,...mid.toArray(),parent);o.quaternion.setFromUnitVectors(up,delta.normalize());return o;};
 const quad=(points,material,parent=group)=>{const g=new T.BufferGeometry();g.setAttribute('position',new T.Float32BufferAttribute(points.flat(),3));g.setIndex([0,1,2,0,2,3]);g.computeVertexNormals();const o=mesh(g,material,0,0,0,parent);o.material.side=T.DoubleSide;return o;};
 const bodyY=van?.82:suv?.75:hyper?.49:.57,bodyH=van?.46:suv?.40:muscle?.33:.28,radius=suv?.405:sport?.335:.355,axle=d.wheelbase/2;
 const ringCount=lowDetail?28:64,segments=lowDetail?16:32,p=[],ix=[];
 const profile=new T.CatmullRomCurve3([new T.Vector3(-.5,.83,.64),new T.Vector3(-.46,.94,.87),new T.Vector3(-.31,1,1),new T.Vector3(0,.985,.93),new T.Vector3(.32,1,1),new T.Vector3(.46,.95,.92),new T.Vector3(.5,.83,.72)]);
 for(let i=0;i<=ringCount;i++){const a=profile.getPoint(i/ringCount),z=a.x*l;for(let j=0;j<=segments;j++){const angle=j/segments*Math.PI*2,c=Math.cos(angle),si=Math.sin(angle);p.push(Math.sign(c)*Math.abs(c)**(hyper?.60:muscle?.30:.43)*w*.495*a.y,bodyY+Math.sign(si)*Math.abs(si)**.60*bodyH*a.z,z);}}
 for(let i=0;i<ringCount;i++)for(let j=0;j<segments;j++){const a=i*(segments+1)+j,b=a+segments+1;for(const tri of[[a,a+1,b],[a+1,b+1,b]]){const x=tri.reduce((n,id)=>n+p[id*3],0)/3,y=tri.reduce((n,id)=>n+p[id*3+1],0)/3,z=tri.reduce((n,id)=>n+p[id*3+2],0)/3;const arch=Math.abs(x)>w*.365&&[-axle,axle].some(center=>Math.hypot(z-center,y-radius)<radius+.066);const cabin=Math.abs(z-.13)<.95&&Math.abs(x)<w*.40&&y>bodyY+.06;const door=Math.abs(x)>w*.43&&z>-.85&&z<.49&&y>.35;const cargo=pickup&&z>.86&&Math.abs(x)<w*.43&&y>bodyY;if(!arch&&!cabin&&!door&&!cargo)ix.push(...tri);}}
 const bodyGeo=new T.BufferGeometry();bodyGeo.setAttribute('position',new T.Float32BufferAttribute(p,3));bodyGeo.setIndex(ix);bodyGeo.computeVertexNormals();mesh(bodyGeo,paint);
 // Sculpted nose, rear valance and lower chassis close the body shell.
 ell(0,bodyY,-l*.477,w*.46,bodyH*.74,.115,paint);ell(0,bodyY+.02,l*.477,w*.455,bodyH*.78,.115,paint);box(0,.29,0,w*.86,.12,l*.90,dark);
 const sill=suv?.48:.33;for(const side of[-1,1])box(side*w*.476,sill,.03,.055,.105,l*.55,dark);
 const roofFront=van?-1.12:hyper?-.18:muscle?-.20:sport?-.25:-.46,roofRear=pickup?.61:van?l*.43:limousineRear(),roofW=w*(suv?.405:hyper?.34:.373),beltY=suv?1.09:hyper?.74:.88;function limousineRear(){return limo?1.72:wagon?1.73:hatch?1.33:suv?1.45:sport?.89:1.18;}
 // Continuous curved roof, with a distinct coupe/sedan/SUV profile.
 const rp=[],ri=[],rn=lowDetail?10:20;for(let j=0;j<=rn;j++){const t=j/rn,x=(t*2-1)*roofW,y=h-.045-Math.abs(t*2-1)**3*.045;rp.push(x,y,roofFront-.025,x,y+.015,roofRear);}for(let j=0;j<rn;j++){const a=j*2;ri.push(a,a+1,a+2,a+2,a+1,a+3);}const rg=new T.BufferGeometry();rg.setAttribute('position',new T.Float32BufferAttribute(rp,3));rg.setIndex(ri);rg.computeVertexNormals();if(!roadster)mesh(rg,paint).material.side=T.DoubleSide;
 const screenFront=van?-1.64:hyper?-.86:-1.04,screenRear=pickup?.83:van?l*.445:wagon?1.95:hatch?1.54:limo?1.98:suv?1.64:1.49;
 quad([[-w*.407,beltY,screenFront],[w*.407,beltY,screenFront],[roofW,h-.068,roofFront],[ -roofW,h-.068,roofFront]],glass);
 if(!roadster)quad([[w*.414,beltY,screenRear],[-w*.414,beltY,screenRear],[-roofW,h-.06,roofRear],[roofW,h-.06,roofRear]],glass);
 for(const side of[-1,1]){
  rod([side*w*.41,beltY,screenFront],[side*roofW,h-.055,roofFront],.032,paint);if(!roadster)rod([side*w*.415,beltY,screenRear],[side*roofW,h-.055,roofRear],suv?.058:.043,paint);if(!roadster)rod([side*roofW,h-.049,roofFront],[side*roofW,h-.034,roofRear],.022,paint);
  // The front door owns its glass and trim, so the complete assembly opens.
  const hinge=new T.Group();hinge.position.set(side*w*.481,0,-.85);group.add(hinge);doors.push({group:hinge,side});
  quad([[0,.37,0],[0,.37,1.34],[-side*.014,beltY,1.34],[-side*.008,beltY,0]],paint,hinge);
  const inner=side*(roofW-w*.481);if(!roadster)quad([[-side*.018,beltY+.025,.035],[-side*.018,beltY+.025,1.31],[inner,h-.093,1.29],[inner,h-.093,roofFront+.88]],glass,hinge);
  rod([0,beltY+.005,.01],[0,beltY+.005,1.33],.013,chrome,hinge);rod([inner,h-.075,1.32],[-side*.014,beltY,1.32],.025,dark,hinge);box(side*.018,beltY-.08,1.10,.026,.024,.16,chrome,hinge);
  if(!roadster)quad([[side*w*.46,beltY+.02,.54],[side*w*.423,beltY+.02,screenRear-.04],[side*roofW,h-.09,roofRear-.07],[side*roofW,h-.09,.50]],glass);
  rod([side*w*.46,beltY+.013,.54],[side*w*.422,beltY+.013,screenRear-.04],.011,chrome);
  rod([side*w*.48,beltY-.08,-.71],[side*w*.58,beltY-.035,-.76],.023,dark);ell(side*w*.586,beltY+.01,-.75,.12,.055,.09,paint);ell(side*w*.59,beltY+.013,-.695,.094,.037,.008,glass);
  // Wheel arches follow the tyre opening rather than covering it with a slab.
  for(const z of[-axle,axle]){const path=[];for(let j=0;j<=22;j++){const a=-.13+j/22*(Math.PI+.26);path.push(new T.Vector3(side*w*.492,radius+Math.sin(a)*(radius+.045),z+Math.cos(a)*(radius+.045)));}mesh(new T.TubeGeometry(new T.CatmullRomCurve3(path),lowDetail?16:24,suv?.022:.012,6,false),suv?dark:paint);}
  const lampY=bodyY+bodyH*.47;
 if(suv){box(side*w*.33,lampY,-l*.483,w*.22,.13,.042,dark);for(const dy of[-.037,.037])rod([side*w*.24,lampY+dy,-l*.51],[side*w*.43,lampY+dy,-l*.50],.014,white);rod([side*w*.435,lampY-.04,-l*.5],[side*w*.435,lampY+.04,-l*.5],.014,white);}
 else if(!muscle){ell(side*w*.31,lampY,-l*.485,w*.15,.040,.035,dark);rod([side*w*.18,lampY+.009,-l*.501],[side*w*.43,lampY+.025,-l*.482],.014,white);if(hyper||d.design==='concept')rod([side*w*.43,lampY+.025,-l*.482],[side*w*.41,lampY-.12,-l*.497],.012,white);else if(roadster)for(const dx of[-.045,.045])ell(side*w*.31+dx,lampY,-l*.506,.027,.027,.016,white);}

  rod([side*w*.19,bodyY+bodyH*.61,l*.496],[side*w*.43,bodyY+bodyH*.55,l*.489],.025,red);
  ell(side*w*.34,bodyY-.07,-l*.496,w*.12,.066,.024,dark);
 }
 // Seats, headrests and dashboard remain visible through the glazing and doors.
 for(const z of(roadster||hyper||pickup?[.15]:[.15,.92]))for(const side of[-1,1]){const sx=side*w*.215;ell(sx,.48,z,.21,.065,.27,seatMat);const back=ell(sx,.73,z+.22,.21,.27,.060,seatMat);back.rotation.x=.12;ell(sx,1.03,z+.25,.11,.095,.06,seatMat);}
 box(0,.77,-.76,w*.79,.13,.28,dark);box(0,.48,.1,.18,.12,1.1,dark);const steering=mesh(new T.TorusGeometry(.165,.018,8,24),dark,-.37,.94,-.53);steering.rotation.x=-.25;rod([-.50,.94,-.53],[-.24,.94,-.53],.013,chrome);box(-.37,.96,-.775,.25,.09,.015,mat('#508b94',.3,.3));box(.05,.84,-.745,.22,.11,.02,mat('#344951',.2,.3));
 if(ev){rod([-w*.3,bodyY-.12,-l*.50],[w*.3,bodyY-.12,-l*.50],.016,dark);}else if(suv){box(0,bodyY-.025,-l*.503,w*.45,.22,.035,dark);for(let i=-2;i<=2;i++)box(i*w*.083,bodyY-.025,-l*.527,.037,.19,.02,chrome);}else if(sport){ell(0,bodyY-.10,-l*.501,w*.26,.087,.024,dark);}else{ell(0,bodyY-.04,-l*.501,w*.23,.065,.018,dark);for(let i=-2;i<=2;i++)box(0,bodyY-.04+i*.021,-l*.524,w*.40,.009,.018,chrome);}
 box(0,.42,l*.496,.37,.087,.018,mat('#d4d7ce'));box(0,.35,l*.46,w*.75,.065,.15,dark);
 if(sport&&!roadster){for(const side of[-1,1]){ell(side*w*.32,.36,l*.50,.055,.046,.024,chrome);box(side*w*.30,bodyY+bodyH+.14,l*.36,.04,.16,.07,dark);}box(0,bodyY+bodyH+.23,l*.36,w*.85,.037,.18,paint);}
 if(d.design==='suv'||wagon)for(const side of[-1,1])rod([side*roofW*.85,h,-.4],[side*roofW*.85,h,1.3],.025,dark);
 if(ev)rod([-w*.29,bodyY+bodyH*.58,-l*.50],[w*.29,bodyY+bodyH*.58,-l*.50],.008,white);

 // Class-specific bodywork: silhouettes, cargo areas and fittings, not just paint swaps.
 if(pickup){box(0,.68,1.85,w*.86,.08,1.5,dark);for(const side of[-1,1]){box(side*w*.46,1.04,1.85,.12,.49,1.5,paint);box(side*w*.46,1.3,1.85,.14,.035,1.5,dark);}box(0,1.03,l*.47,w*.90,.50,.08,paint);box(0,1.12,l*.486,.22,.04,.025,chrome);for(let i=-4;i<=4;i++)box(i*.15,.731,1.87,.022,.016,1.40,chrome);}
 if(van){for(const side of[-1,1]){box(side*w*.435,1.58,1.04,.065,1.15,2.23,paint);box(side*w*.472,1.35,.62,.02,.05,.21,dark);rod([side*w*.477,1.1,-.1],[side*w*.477,1.1,2.1],.009,chrome);}box(0,1.55,l*.443,w*.82,1.27,.07,paint);rod([0,.94,l*.46],[0,2.13,l*.46],.008,dark);}
 if(muscle){box(0,bodyY+bodyH+.037,-1.39,w*.34,.046,.94,dark);box(0,bodyY+bodyH+.092,-1.34,w*.24,.075,.25,paint);for(const side of[-1,1])for(let i=0;i<2;i++){const lamp=mesh(new T.CylinderGeometry(.075,.075,.028,20),white,side*(w*.28+i*.15),bodyY+.1,-l*.5);lamp.rotation.x=Math.PI/2;}}
 if(hyper){for(const side of[-1,1]){ell(side*w*.46,.61,.52,.052,.14,.32,dark);rod([side*w*.48,.41,-.9],[side*w*.49,.40,.95],.035,dark);}box(0,.66,1.30,w*.54,.028,.55,dark);for(let i=0;i<7;i++)box(0,.689,1.1+i*.07,w*.52,.014,.023,chrome);}
 if(roadster){for(const side of[-1,1]){const hoop=mesh(new T.TorusGeometry(.14,.025,8,20,Math.PI),chrome,side*.38,.98,.55);hoop.rotation.z=0;}box(0,.86,.90,w*.78,.07,.6,paint);}
 if(d.design==='taxi'){box(0,h+.085,.16,.57,.15,.22,white);for(const side of[-1,1])for(let i=0;i<12;i++)box(side*w*.487,.69,-.55+i*.12,.008,.058,.06,i%2?dark:white);}
 if(police){for(const side of[-1,1]){box(side*w*.484,.77,.08,.016,.14,1.3,dark);for(let i=0;i<5;i++)box(side*w*.497,.80,-.48+i*.23,.016,.055,.12,white);rod([side*w*.24,.42,-l*.52],[side*w*.24,.8,-l*.52],.033,dark);}rod([-w*.36,.60,-l*.53],[w*.36,.60,-l*.53],.034,dark);rod([w*.32,h,1.05],[w*.32,h+.35,1.05],.007,dark);box(.25,.85,-.73,.21,.14,.02,white);}
 // Panel seams, washer jets, wipers, fuel flap and tread add readable close-up detail.
 for(const side of[-1,1]){rod([side*w*.40,bodyY+bodyH*.91,-l*.38],[side*w*.39,bodyY+bodyH*.94,-1.06],.004,dark);rod([side*w*.40,bodyY+bodyH*.91,l*.34],[side*w*.36,bodyY+bodyH*.93,l*.45],.004,dark);rod([side*.13,beltY+.035,screenFront-.018],[side*.52,beltY+.065,screenFront+.03],.008,dark);box(side*w*.489,bodyY+.08,l*.33,.008,.12,.15,dark);box(side*w*.494,bodyY+.08,l*.33,.009,.10,.13,paint);}

 for(const side of[-1,1])for(const z of[-axle,axle]){
  const pivot=new T.Group();pivot.position.set(side*w*.476,radius,z);group.add(pivot);if(z<0)front.push(pivot);const spin=new T.Group();pivot.add(spin);wheels.push(spin);
  const tire=mesh(new T.TorusGeometry(radius*.79,radius*.21,lowDetail?7:12,lowDetail?24:40),rubber,0,0,0,spin);tire.rotation.y=Math.PI/2;tire.scale.z=.22/(radius*.42);
  const rim=mesh(new T.RingGeometry(radius*.61,radius*.77,lowDetail?16:32),chrome,side*.105,0,0,spin);rim.rotation.y=side*Math.PI/2;rim.material.side=T.DoubleSide;
  const rotor=mesh(new T.CircleGeometry(radius*.58,lowDetail?16:32),mat('#51585b',.8,.47),side*.103,0,0,spin);rotor.rotation.y=side*Math.PI/2;
  const spokes=hyper?10:muscle?5:limo?12:suv?6:ev?5:8;for(let i=0;i<spokes;i++){const a=i/spokes*Math.PI*2;rod([side*.115,Math.sin(a)*radius*.12,Math.cos(a)*radius*.12],[side*.115,Math.sin(a+.12)*radius*.69,Math.cos(a+.12)*radius*.69],ev?.023:.016,chrome,spin);}
  ell(side*.125,0,0,.015,.055,.055,chrome,spin);box(side*.072,.025,-radius*.43,.045,.11,.075,brake,pivot);
 }
 if(police){box(0,h+.025,.25,.95,.055,.24,dark);for(const side of[-1,1])lights.push(box(side*.27,h+.086,.25,.36,.075,.22,new T.MeshStandardMaterial({color:side<0?'#447cee':'#ef3e37',emissive:side<0?'#447cee':'#ef3e37',emissiveIntensity:1})));}
}
