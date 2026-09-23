import * as T from './vendor/three.module.js';
const up=new T.Vector3(0,1,0),cube=new T.BoxGeometry(1,1,1);
export function buildMotorcycle({d,group,wheels,front,lowDetail}){
 const heavy=d.design==='heavy',street=d.design==='street',concept=d.design==='concept',superbike=d.design==='super',r=heavy?.355:.325,wb=d.wheelbase;
 const material=(color,metalness=.1,roughness=.55)=>new T.MeshStandardMaterial({color,metalness,roughness});
 const paint=new T.MeshPhysicalMaterial({color:d.color,metalness:.55,roughness:.20,clearcoat:1,clearcoatRoughness:.12}),carbon=material('#1b242a',.23,.43),rubber=material('#13171b',0,.91),alloy=material('#9ca7ab',.85,.24),engine=material('#4a5155',.8,.4),gold=material('#ad894e',.72,.26),accent=material(d.accent,.4,.3),brake=material('#a34736',.5,.4),light=new T.MeshStandardMaterial({color:'#f2f4e8',emissive:'#e1eee1',emissiveIntensity:.8}),rear=new T.MeshStandardMaterial({color:'#e14732',emissive:'#d53224',emissiveIntensity:.7});
 const add=(geo,mat,x=0,y=0,z=0,parent=group)=>{const m=new T.Mesh(geo,mat);m.position.set(x,y,z);parent.add(m);return m;};
 const box=(x,y,z,w,h,l,mat,parent=group)=>{const o=add(cube,mat,x,y,z,parent);o.scale.set(w,h,l);return o;};
 const ell=(x,y,z,w,h,l,mat,parent=group)=>{const o=add(new T.SphereGeometry(1,lowDetail?16:28,lowDetail?10:18),mat,x,y,z,parent);o.scale.set(w,h,l);return o;};
 const tube=(points,radius,mat,parent=group)=>add(new T.TubeGeometry(new T.CatmullRomCurve3(points.map(p=>new T.Vector3(...p))),lowDetail?12:24,radius,lowDetail?6:10,false),mat,0,0,0,parent);
 const rod=(a,b,radius,mat,parent=group)=>{const a1=new T.Vector3(...a),b1=new T.Vector3(...b),v=b1.clone().sub(a1),o=add(new T.CylinderGeometry(radius,radius,v.length(),lowDetail?8:14),mat,...a1.add(b1).multiplyScalar(.5).toArray(),parent);o.quaternion.setFromUnitVectors(up,v.normalize());return o;};
 function shell(rings,mat){const n=lowDetail?18:32,p=[],idx=[];for(const [z,y,rx,ry]of rings)for(let j=0;j<=n;j++){const a=j/n*Math.PI*2;p.push(Math.sin(a)*rx,y+Math.cos(a)*ry,z);}for(let i=0;i<rings.length-1;i++)for(let j=0;j<n;j++){const a=i*(n+1)+j,b=a+n+1;idx.push(a,b,a+1,a+1,b,b+1);}const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(p,3));geo.setIndex(idx);geo.computeVertexNormals();return add(geo,mat);}
 function tire(z,width,isFront){const pivot=new T.Group();pivot.position.set(0,r,z);group.add(pivot);if(isFront)front.push(pivot);const spin=new T.Group();pivot.add(spin);wheels.push(spin);const tyre=add(new T.TorusGeometry(r*.79,r*.21,lowDetail?8:14,lowDetail?28:48),rubber,0,0,0,spin);tyre.rotation.y=Math.PI/2;tyre.scale.z=width/(r*.42);
 for(const side of[-1,1]){const rim=add(new T.TorusGeometry(r*.67,.019,8,32),concept?accent:alloy,side*width*.43,0,0,spin);rim.rotation.y=Math.PI/2;const disc=add(new T.RingGeometry(r*.30,r*.59,32),engine,side*(width*.46+.009),0,0,spin);disc.rotation.y=side*Math.PI/2;disc.material.side=T.DoubleSide;
 for(let j=0;j<(heavy?10:5);j++){const a=j/(heavy?10:5)*Math.PI*2;rod([side*width*.42,Math.cos(a)*.045,Math.sin(a)*.045],[side*width*.42,Math.cos(a+.12)*r*.65,Math.sin(a+.12)*r*.65],heavy?.010:.019,concept?carbon:alloy,spin);}box(side*(width*.5+.025),.08,.16,.042,.115,.068,brake,pivot);}rod([-.10,0,0],[.10,0,0],.028,alloy,spin);}
 tire(-wb/2,heavy?.145:.125,true);tire(wb/2,heavy?.245:.195,false);
 for(const side of[-1,1]){
 rod([side*.10,r,-wb/2],[side*.10,.96,-.43],.026,alloy);rod([side*.10,.58,-wb/2+.12],[side*.10,.91,-.45],.039,gold);
 tube([[side*.15,.82,-.35],[side*.18,.49,-.08],[side*.17,.42,.29],[side*.15,.72,.45]],street?.025:.034,street?accent:carbon);
 rod([side*.14,r,wb/2],[side*.17,.49,.09],.032,alloy);rod([side*.16,.74,.36],[side*.10,.52,.01],.025,alloy);
 const handleY=heavy?1.04:1.01,handleZ=heavy?-.34:-.43;rod([0,.96,-.43],[side*.34,handleY,handleZ],.018,alloy);rod([side*.28,handleY,handleZ],[side*.40,handleY,handleZ],.025,rubber);rod([side*.29,handleY-.025,handleZ-.02],[side*.41,handleY-.022,handleZ-.07],.009,alloy);
 rod([side*.27,.94,-.48],[side*.38,1.11,-.54],.012,carbon);ell(side*.39,1.11,-.54,.064,.030,.025,carbon);ell(side*.39,1.113,-.513,.055,.024,.004,alloy);rod([side*.17,.43,.10],[side*.29,.43,.15],.015,alloy);box(side*.29,.43,.15,.12,.024,.045,rubber);
 }
 shell([[-.48,.77,.018,.035],[-.34,.84,heavy?.23:.20,.125],[-.08,.84,heavy?.25:.205,.145],[.11,.79,.145,.085],[.20,.77,.05,.027]],paint);
 ell(0,d.seat+.012,.28,heavy?.205:.155,.048,heavy?.28:.22,rubber);ell(0,d.seat+.09,.60,.12,.040,.18,rubber);add(new T.CylinderGeometry(.05,.05,.012,24),alloy,0,.984,-.12);
 if(heavy){
 for(const side of[-1,1])for(let j=0;j<7;j++){const cylinder=box(side*.125,.48+j*.022,-.01+side*.06,.23,.011,.26,engine);cylinder.rotation.z=side*.28;}
 ell(0,.47,.10,.23,.15,.23,engine);for(const z of[.08,.20])tube([[.10,.51,z],[.23,.30,z+.12],[.28,.32,.71],[.29,.38,.91]],.042,alloy);ell(0,.88,-.60,.14,.13,.065,carbon);ell(0,.88,-.66,.115,.108,.015,light);
 for(const side of[-1,1]){rod([side*.17,.73,.44],[side*.24,.48,.75],.027,alloy);for(let j=0;j<8;j++){const coil=add(new T.TorusGeometry(.04,.008,6,12),gold,side*(.17+j*.009),.73-j*.032,.44+j*.04);coil.rotation.z=side*.23;}}
 shell([[.40,.74,.18,.035],[.70,.72,.21,.07],[.94,.60,.17,.055],[1.11,.49,.025,.025]],paint);
 }else if(street){
 ell(0,.48,.06,.20,.18,.26,engine);for(let j=0;j<7;j++)box(0,.40+j*.026,.015,.39,.012,.26,alloy);ell(0,.89,-.62,.12,.115,.07,carbon);ell(0,.89,-.691,.10,.095,.012,light);rod([-.08,.90,-.707],[.08,.90,-.707],.006,carbon);
 shell([[.28,.72,.15,.035],[.52,.84,.16,.055],[.82,.91,.10,.04],[.91,.91,.012,.01]],paint);tube([[.10,.42,-.15],[.18,.27,-.01],[.23,.29,.30],[.24,.41,.65]],.027,alloy);ell(.25,.42,.61,.058,.055,.20,carbon);
 }else{
 ell(0,.49,.045,.19,.19,.28,engine);shell([[-.96,.73,.012,.015],[-.77,.81,.14,.13],[-.53,.82,concept?.245:.27,.20],[-.26,.68,.265,.24],[.03,.50,.18,.10],[.24,.49,.025,.028]],paint);
 for(const side of[-1,1]){ell(side*.258,.66,-.22,.012,.11,.18,carbon);tube([[side*.24,.89,-.49],[side*.26,.75,-.28],[side*.18,.57,-.05]],.010,accent);rod([side*.10,.79,-.91],[side*.23,.84,-.72],.016,light);}
 shell([[.28,.72,.15,.035],[.53,.91,.16,.06],[.83,.97,.08,.038],[1.03,.94,.013,.010]],paint);const screen=ell(0,1.005,-.57,.145,.165,.027,new T.MeshPhysicalMaterial({color:'#49656e',roughness:.08,transparent:true,opacity:.40,depthWrite:false}));screen.rotation.x=-.42;
 if(superbike)for(const side of[-1,1]){box(side*.31,.71,-.60,.21,.018,.18,carbon).rotation.z=side*.08;tube([[side*.18,.34,-.06],[side*.24,.36,.36],[side*.22,.57,.62]],.039,alloy);}
 if(concept){shell([[-.43,.48,.14,.06],[0,.43,.19,.095],[.49,.51,.12,.06]],carbon);for(const side of[-1,1]){rod([side*.22,.49,-.32],[side*.22,.49,.34],.010,accent);const cover=add(new T.CircleGeometry(r*.53,32),paint,side*.105,r,wb/2);cover.rotation.y=side*Math.PI/2;}}
 if(d.design==='sport'){ell(.24,.40,.53,.064,.058,.23,carbon);tube([[.12,.43,-.14],[.18,.26,.01],[.24,.31,.43]],.028,alloy);}}
 for(const z of[-wb/2,wb/2]){const points=[];for(let j=0;j<=20;j++){const a=.23+j/20*2.55;points.push([0,r+Math.sin(a)*(r+.044),z+Math.cos(a)*(r+.044)]);}tube(points,heavy?.085:.055,paint);}
 rod([0,.68,.25],[0,.52,.02],.031,gold);for(let i=0;i<7;i++){const c=add(new T.TorusGeometry(.035,.007,6,12),alloy,0,.54+i*.019,.03+i*.028);c.rotation.x=-.5;}
 tube([[-.115,.34,wb/2],[-.115,.44,.05],[-.115,.48,.05],[-.115,.38,wb/2]],.010,engine);box(0,1.018,-.39,.15,.019,.085,carbon);box(0,1.029,-.39,.125,.004,.060,accent);
 box(0,heavy?.62:.91,heavy?1.02:.88,.13,.034,.024,rear);box(0,heavy?.48:.64,heavy?1.06:.87,.17,.10,.014,alloy).rotation.x=-.22;
 for(const side of[-1,1]){ell(side*.20,.80,-.59,.029,.016,.028,material('#d79036'));ell(side*.16,heavy?.60:.86,.81,.024,.015,.022,material('#d79036'));}
}
