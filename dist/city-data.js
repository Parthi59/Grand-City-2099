import {createFleet, vehicleById, GARAGE, VEHICLES} from './fleet-data.js';
import {createCombat,restoreCombat} from './combat-data.js';
export const BLOCK=100, LIMIT=345, ROAD=22;
export const seed=n=>{const v=Math.sin(n*127.1+311.7)*43758.5453;return v-Math.floor(v)};
export const buildings=[];
for(let bx=-3;bx<3;bx++)for(let bz=-3;bz<3;bz++){
 if((bx===0&&bz===1)||(bx===-1&&bz===-1))continue;
 for(let i=0;i<4;i++){
  const id=(bx+3)*24+(bz+3)*4+i, x=bx*BLOCK+28+(i%2)*44,z=bz*BLOCK+28+Math.floor(i/2)*44;
  const district=bx>=0&&bz<0?'zenith':bx<0&&bz>=0?'old':bz>=1?'harbor':'civic';
  const style=district==='zenith'?(id%3?'glass':'limestone'):district==='old'?(id%3?'apartment':'brick'):district==='harbor'?'terrace':id%3?'limestone':'glass';
  let h=style==='glass'?42+Math.floor(seed(id+80)*20)*3.2:style==='terrace'?13+Math.floor(seed(id+80)*5)*3.2:13+Math.floor(seed(id+80)*8)*3.2;
  if(district==='old')h=10+Math.floor(seed(id+80)*5)*3.2;
  buildings.push({x,z,w:24+seed(id)*8,d:24+seed(id+20)*8,h,id,style,district});
 }
}
export const structures=[{x:57,z:184.5,w:28,d:.6},{x:25,z:159,w:24,d:.3},{x:13,z:162,w:.3,d:.3},{x:37,z:162,w:.3,d:.3},{x:50,z:150,w:17,d:17},{x:-50,z:-50,w:17,d:17}];
export const districts=[{name:'ZENITH',x:150,z:-190,color:'#66e8df'},{name:'OLD QUARTER',x:-190,z:160,color:'#ffa786'},{name:'CIVIC CORE',x:-50,z:-50,color:'#afa1ff'},{name:'HARBOR',x:215,z:250,color:'#5bbcff'}];
export const contracts=[
 {id:'courier',title:'Morning express',type:'COURIER',reward:750,time:180,heat:0,description:'A priority package. Three drop points across Grand City. Follow the amber beacons.',points:[{x:100,z:160,name:'Zenith Arcade'},{x:200,z:-90,name:'North Tower'},{x:-95,z:-200,name:'Civic Archives'}]},
 {id:'circuit',title:'The sunrise circuit',type:'STREET RUN',reward:1200,time:140,heat:0,description:'Cross four city checkpoints before the clock runs out. Corners matter more than top speed.',points:[{x:0,z:-210,name:'North checkpoint'},{x:210,z:-100,name:'East checkpoint'},{x:100,z:210,name:'South checkpoint'},{x:-210,z:100,name:'West checkpoint'}]},
 {id:'ghost',title:'Ghost protocol',type:'PURSUIT',reward:1800,time:210,heat:2,description:'Security has your signal. Reach the uplink, then break contact and lose the patrols.',points:[{x:-200,z:-140,name:'Signal uplink'}]}
];
export const clamp=(n,a,b)=>Math.max(a,Math.min(b,n));
export function collision(x,z,r=1){if(Math.abs(x)>LIMIT||Math.abs(z)>LIMIT)return true;return [...buildings,...structures].some(b=>Math.abs(x-b.x)<b.w/2+r&&Math.abs(z-b.z)<b.d/2+r)}
export function onRoad(x,z){return Math.abs(x-Math.round(x/BLOCK)*BLOCK)<ROAD/2||Math.abs(z-Math.round(z/BLOCK)*BLOCK)<ROAD/2}
export function groundHeight(x,z){if(x>13&&x<37&&z>160&&z<172){if(Math.abs(z-166)<1.95&&[18,21.4,24.8,28.2,31.6].some(b=>Math.abs(x-b)<1.3))return .335;return .28;}return onRoad(x,z)?0:.14}
export const approach=(a,b,rate,dt)=>a+(b-a)*(1-Math.exp(-rate*dt));
export const angleDiff=(a,b)=>Math.atan2(Math.sin(a-b),Math.cos(a-b));
export const smooth=t=>{t=clamp(t,0,1);return t*t*(3-2*t)};
export function initialState(){return {phase:'intro',combat:createCombat(),mode:'foot',x:15,z:171,heading:-Math.PI/2,speed:0,moveHeading:-Math.PI/2,steering:0,throttle:0,braking:0,vehicleId:null,transition:null,vehicles:createFleet(),health:100,nitro:100,cash:0,wanted:0,heatTimer:0,bust:0,mission:null,completed:0,elapsed:0,invincible:0,distance:0,boosting:false,sprinting:false,footstep:0,notice:'',noticeLeft:0,cops:[],trafficHit:0,arrested:false,events:[],stats:{distance:0},savedAt:0}}
export const activeVehicle=s=>s.vehicles.find(v=>v.uid===s.vehicleId);
export function localPoint(v,x,z){return{x:v.x+Math.cos(v.heading)*x-Math.sin(v.heading)*z,z:v.z+Math.sin(v.heading)*x+Math.cos(v.heading)*z}}
export function nearestVehicle(s){let best=null,dist=4.8;for(const v of [...s.vehicles,...s.cops]){if(v.reserved||v.disabled||Math.abs(v.speed)>8)continue;const d=Math.hypot(s.x-v.x,s.z-v.z);if(d<dist){best=v;dist=d}}return best}
export function mount(s){
 if(s.transition)return false;
 if(s.combat){s.combat.aiming=false;s.combat.reloading=0;}
 if(s.mode==='foot'){
  const v=nearestVehicle(s);if(!v)return false;if(Math.abs(v.speed)>1.5){v.stopTimer=8;s.interceptId=v.uid;announce(s,'Driver stopping · Stay beside the vehicle');return true;}s.interceptId=null;const def=vehicleById(v.type);const side=localPoint(v,-def.width/2-.65,def.kind==='car'?.1:.25);
  if(collision(side.x,side.z,.35))return false;
  const dx=s.x-v.x,dz=s.z-v.z,localX=Math.cos(v.heading)*dx+Math.sin(v.heading)*dz,localZ=-Math.sin(v.heading)*dx+Math.cos(v.heading)*dz;const path=[{x:s.x,z:s.z}];
  if(localX>0&&Math.abs(localZ)<def.length/2+.5){const rear=def.length/2+.8;path.push(localPoint(v,def.width/2+.72,rear),localPoint(v,-def.width/2-.70,rear));}path.push(side);
  if(path.some(p=>collision(p.x,p.z,.32)))return false;let length=0;for(let i=1;i<path.length;i++)length+=Math.hypot(path[i].x-path[i-1].x,path[i].z-path[i-1].z);
  if(s.cops.includes(v)){s.cops.splice(s.cops.indexOf(v),1);s.vehicles.push(v);v.police=true;}const takeover=!!v.driver&&!v.driver.exited;v.reserved=true;v.traffic=false;v.speed=0;if(!takeover&&(v.police||def.engine==='security'))setHeat(s,2);if(takeover){setHeat(s,v.police?2:1);v.stolen=true;announce(s,'Taking vehicle · Driver is getting out');s.events.push('door');}
  s.transition={kind:'enter',time:0,duration:length/1.8+1.65+(takeover?1.25:0),takeover,ejectDuration:takeover?1.25:0,walkDuration:length/1.8,path,pathLength:length,vehicleId:v.uid,start:{x:s.x,z:s.z,heading:s.heading},side,progress:0};s.speed=0;return true;
 }
 const v=activeVehicle(s);if(!v||Math.abs(s.speed)>1.5)return false;const def=vehicleById(v.type);let side=localPoint(v,-def.width/2-.72,.2);if(collision(side.x,side.z,.4)){announce(s,'Door blocked · Move to an open space');return false}
 s.transition={kind:'exit',time:0,duration:1.8,vehicleId:v.uid,start:{x:s.x,z:s.z,heading:s.heading},side,progress:0};s.speed=0;v.speed=0;s.events.push('door');return true;
}
export function updateTransition(s,dt){
 const t=s.transition,v=s.vehicles.find(v=>v.uid===t.vehicleId),def=vehicleById(v.type),oldX=s.x,oldZ=s.z;t.time+=dt;t.progress=clamp(t.time/t.duration,0,1);let p=t.progress;
 if(t.kind==='enter'){
  if(t.time<t.walkDuration){t.walking=true;let travel=t.time*1.8;for(let i=1;i<t.path.length;i++){const a=t.path[i-1],b=t.path[i],length=Math.hypot(b.x-a.x,b.z-a.z);if(travel<=length){const f=length?travel/length:1;s.x=a.x+(b.x-a.x)*f;s.z=a.z+(b.z-a.z)*f;const heading=Math.atan2(b.x-a.x,a.z-b.z);s.heading+=angleDiff(heading,s.heading)*(1-Math.exp(-10*dt));break}travel-=length;}t.seated=0;
  }else{t.walking=false;if(t.takeover&&!v.driver.exited){const driver=v.driver,e=clamp((t.time-t.walkDuration)/t.ejectDuration,0,1),seat=localPoint(v,def.kind==='bike'?0:-.37,def.kind==='bike'?.28:.12);driver.exiting=true;driver.exitProgress=e;driver.x=seat.x+(t.side.x-seat.x)*smooth(e);driver.z=seat.z+(t.side.z-seat.z)*smooth(e);driver.heading=v.heading;if(e>=1&&!driver.exited){driver.exited=true;driver.flee=14;driver.fleeX=t.side.x-v.x;driver.fleeZ=t.side.z-v.z;driver.axis='z';driver.dir=1;driver.speed=1.4;driver.phase=0;}}const q=clamp((t.time-t.walkDuration-t.ejectDuration)/1.65,0,1);t.interaction=q;if(!t.sound){t.sound=true;s.events.push('door')}const f=smooth((q-.26)/.55);s.x=t.side.x+(v.x-t.side.x)*f;s.z=t.side.z+(v.z-t.side.z)*f;s.heading+=angleDiff(v.heading,s.heading)*(1-Math.exp(-10*dt));t.seated=f;v.door=def.kind==='car'?Math.max(t.takeover&&q===0?1:0,smooth(q/.25))*(1-smooth((q-.80)/.20)):0;}
 }else{
  const f=smooth((p-.26)/.53);s.x=v.x+(t.side.x-v.x)*f;s.z=v.z+(t.side.z-v.z)*f;s.heading=v.heading;t.seated=1-f;t.walking=p>.72;t.interaction=p;v.door=def.kind==='car'?smooth(p/.22)*(1-smooth((p-.78)/.22)):0;
 }
 s.footstep+=Math.hypot(s.x-oldX,s.z-oldZ)/1.75*Math.PI*2;
 if(p>=1){v.door=0;v.reserved=false;if(t.kind==='enter'){s.vehicleId=v.uid;s.mode=def.kind;s.x=v.x;s.z=v.z;s.heading=v.heading;announce(s,def.name+' · Connected')}else{s.mode='foot';s.vehicleId=null;announce(s,'On foot · Vehicle parked here')}s.transition=null;s.speed=0;}
}
export function beginContract(s,id){const c=contracts.find(x=>x.id===id);if(!c||s.mission)return false;s.mission={...c,stage:0,left:c.time,escaping:false};s.wanted=Math.max(s.wanted,c.heat);s.heatTimer=0;s.events.push('mission');return true}
export function announce(s,text){s.notice=text;s.noticeLeft=3.2}
export function setHeat(s,n){s.wanted=clamp(s.wanted+n,0,3);s.heatTimer=0}
export function movePlayer(s,input,dt,camYaw=0){
 s.elapsed+=dt;s.invincible=Math.max(0,s.invincible-dt);s.noticeLeft=Math.max(0,s.noticeLeft-dt);const oldX=s.x,oldZ=s.z;
 if(s.transition){updateTransition(s,dt);updateMission(s,dt);return}
 const v=activeVehicle(s),def=v&&vehicleById(v.type);s.throttle=input.forward>0?1:0;s.braking=input.forward<0&&s.speed>.3?1:0;
 if(v){
  s.boosting=!!(input.boost&&s.nitro>1&&s.speed>8&&s.throttle);const max=def.max*(s.boosting?1.18:1)*Math.max(.18,1-(v.damage||0)*.65),drag=1.0+Math.abs(s.speed)**2*.0018;
  if(v.disabled){s.speed*=Math.exp(-dt*3);s.throttle=0;}else if(input.forward>0)s.speed+=def.accel*(.52+.48*(1-Math.abs(s.speed)/max))*dt*(s.boosting?1.5:1);
  else if(input.forward<0)s.speed-=dt*(s.speed>.4?def.brake:3.8);
  else s.speed=Math.sign(s.speed)*Math.max(0,Math.abs(s.speed)-drag*dt);
  if(input.handbrake){s.speed=Math.sign(s.speed)*Math.max(0,Math.abs(s.speed)-def.brake*.75*dt);s.braking=1;}
  s.speed=clamp(s.speed,-5,max);s.steering=approach(s.steering,input.steer,def.kind==='bike'?6:3.8,dt);
  const turnAngle=s.steering*(def.kind==='bike'?.50:.52)/(1+Math.abs(s.speed)*.052);let yaw=Math.tan(turnAngle)*s.speed/def.wheelbase;const grip=def.grip*(v.punctured?.60:1)*(input.handbrake?.72:1);yaw=clamp(yaw,-1.2*grip,1.2*grip);s.heading+=yaw*dt;
  s.nitro=clamp(s.nitro+(s.boosting?-26:9)*dt,0,100);s.x+=Math.sin(s.heading)*s.speed*dt;s.z-=Math.cos(s.heading)*s.speed*dt;
 }else{
  s.boosting=false;s.sprinting=!!input.boost;const moving=input.forward||input.steer;const target=moving?(s.combat?.aiming?1.7:input.walk?1.65:s.sprinting?7.2:3.6):0;s.speed=approach(s.speed,target,moving?8:13,dt);
  if(moving){const a=Math.atan2(input.steer,input.forward)+camYaw;s.moveHeading=a;s.heading+=angleDiff(a,s.heading)*(1-Math.exp(-12*dt));}
  s.x+=Math.sin(s.moveHeading)*s.speed*dt;s.z-=Math.cos(s.moveHeading)*s.speed*dt;s.nitro=Math.min(100,s.nitro+10*dt);
 }
 const radius=v?(def.kind==='car'?1.15:.48):.32;
 const blocked=(x,z)=>collision(x,z,radius)||(def?.kind==='car'&&[-1,1].some(side=>collision(x+Math.sin(s.heading)*side*def.length*.30,z-Math.cos(s.heading)*side*def.length*.30,radius*.8)));
 if(blocked(s.x,s.z)){
  if(!blocked(s.x,oldZ))s.z=oldZ;else if(!blocked(oldX,s.z))s.x=oldX;else{s.x=oldX;s.z=oldZ}
  if(v){impact(s,Math.abs(s.speed));s.speed*=-.12}else s.speed*=.5;
 }
 for(const other of s.vehicles){if(other===v||other.reserved)continue;const od=vehicleById(other.type),dx=s.x-other.x,dz=s.z-other.z,co=Math.cos(other.heading),si=Math.sin(other.heading),lx=co*dx+si*dz,lz=-si*dx+co*dz;
  if(Math.abs(lx)<od.width/2+radius&&Math.abs(lz)<od.length/2+radius){s.x=oldX;s.z=oldZ;if(v){impact(s,Math.abs(s.speed),true);s.speed*=-.12;other.speed*=.15;}else s.speed=0;break;}
 }
 const travelled=Math.hypot(s.x-oldX,s.z-oldZ);s.distance+=travelled;s.stats.distance+=travelled;s.footstep+=travelled/(s.sprinting?2.6:1.75)*Math.PI*2;
 if(v){v.x=s.x;v.z=s.z;v.heading=s.heading;v.speed=s.speed;v.steering=s.steering;v.distance+=travelled;}
 updateMission(s,dt);
}
function impact(s,speed,traffic=false){const car=activeVehicle(s);if(car&&speed>3)car.damage=Math.min(1,(car.damage||0)+speed*.004);if(speed>3&&s.invincible<=0){s.health=Math.max(0,s.health-Math.min(24,speed*.6));s.invincible=1;s.events.push('impact');if(traffic)setHeat(s,1);announce(s,traffic?'Collision · Security alerted':'Impact · Slow down')}}
function updateMission(s,dt){if(s.mission){const m=s.mission;m.left-=dt;if(m.left<=0){s.mission=null;announce(s,'Contract expired · Try again from the jobs board')}else if(!m.escaping){const p=m.points[m.stage];if(Math.hypot(s.x-p.x,s.z-p.z)<11){m.stage++;s.events.push('checkpoint');if(m.stage>=m.points.length){if(m.id==='ghost'){m.escaping=true;announce(s,'Uplink complete · Lose your wanted level')}else completeContract(s)}else announce(s,'Checkpoint reached · Next location marked')}}else if(s.wanted===0)completeContract(s)}}
export function completeContract(s){if(!s.mission)return;s.cash+=s.mission.reward;s.completed++;announce(s,'Contract complete · +₡'+s.mission.reward);s.mission=null;s.health=Math.min(100,s.health+20);s.events.push('reward')}
export function trafficSignal(axis,time){return (Math.floor(time/10)%2===0)===(axis==='z')}
export function updateTraffic(s,dt){
 for(const c of s.vehicles.filter(v=>v.traffic&&!v.reserved)){
  c.stopTimer=Math.max(0,(c.stopTimer||0)-dt);if(c.driver?.health<=0||c.driver?.exited||c.disabled){c.speed=Math.max(0,c.speed-12*dt);if(c.speed<.1){c.speed=0;c.traffic=false;}continue;}const distance=Math.hypot(c.x-s.x,c.z-s.z),toward=((c.x-s.x)*Math.sin(s.heading)-(c.z-s.z)*Math.cos(s.heading))/Math.max(1,distance);if(s.combat?.aiming&&distance<20&&toward>.92){c.stopTimer=3;c.driver&&(c.driver.scared=true);}let allowed=c.stopTimer>0?0:c.cruise;const forward={x:Math.sin(c.heading),z:-Math.cos(c.heading)};
  const obstacles=[...s.vehicles.filter(v=>v!==c&&!v.traffic),...s.vehicles.filter(v=>v!==c&&v.traffic),...(s.mode==='foot'?[{x:s.x,z:s.z}]:[])];
  for(const o of obstacles){const dx=o.x-c.x,dz=o.z-c.z,along=dx*forward.x+dz*forward.z,across=Math.abs(dx*forward.z-dz*forward.x);if(along>0&&along<18&&across<2.5)allowed=Math.min(allowed,Math.max(0,(along-6)*.8));}
  const pos=c.axis==='x'?c.x:c.z;let intersection=Math.round((pos+c.dir*18)/100)*100;const to=(intersection-pos)*c.dir;
  if(!trafficSignal(c.axis,s.elapsed)&&to>8&&to<30)allowed=Math.min(allowed,Math.max(0,(to-13)*.65));
  c.speed=approach(c.speed,allowed,allowed<c.speed?4:1.2,dt);c.x+=forward.x*c.speed*dt;c.z+=forward.z*c.speed*dt;c.distance+=c.speed*dt;
  if(c.x>335)c.x=-335;if(c.x< -335)c.x=335;if(c.z>335)c.z=-335;if(c.z< -335)c.z=335;
  if(Math.hypot(s.x-c.x,s.z-c.z)<2.5&&s.invincible<=0&&c.speed>2&&!s.transition){impact(s,c.speed,true);c.speed=0;s.speed*=.2}
 }
 if(s.mode!=='foot'&&s.speed>45&&s.wanted===0){s.trafficHit+=dt;if(s.trafficHit>6){setHeat(s,1);announce(s,'Speed scan · Security alerted')}}else s.trafficHit=Math.max(0,s.trafficHit-dt);
}
export function saveProgress(s){try{localStorage.setItem('nightfall-save-v3',JSON.stringify({cash:s.cash,completed:s.completed,x:s.x,z:s.z,heading:s.heading,health:s.health,stats:s.stats,mode:s.mode,vehicleId:s.vehicleId,mission:s.mission,combat:s.combat,vehicles:s.vehicles.filter(v=>!v.traffic).map(v=>({uid:v.uid,type:v.type,x:v.x,z:v.z,heading:v.heading,garage:v.garage,stolen:!!v.stolen,damage:v.damage||0,disabled:!!v.disabled})),savedAt:Date.now()}));s.savedAt=Date.now();return true}catch{return false}}
export function restoreProgress(s){try{const p=JSON.parse(localStorage.getItem('nightfall-save-v3'));if(!p)return false;restoreCombat(s.combat,p.combat);for(const key of ['cash','completed','heading','health'])if(Number.isFinite(p[key]))s[key]=p[key];if(p.stats&&Number.isFinite(p.stats.distance))s.stats=p.stats;if(Number.isFinite(p.x)&&Number.isFinite(p.z)&&!collision(p.x,p.z,.5)){s.x=p.x;s.z=p.z;}for(const v of p.vehicles||[]){let target=s.vehicles.find(q=>q.uid===v.uid);if(!target&&typeof v.uid==='string'&&v.uid.startsWith('patrol-')&&VEHICLES.some(d=>d.id===v.type)&&s.vehicles.length<100){target={uid:v.uid,type:v.type,distance:0,steering:0,door:0,police:true};s.vehicles.push(target);}if(target&&Number.isFinite(v.x)&&Number.isFinite(v.z)&&!collision(v.x,v.z,.5))Object.assign(target,v,{traffic:false,speed:0,driver:null});}const current=s.vehicles.find(v=>v.uid===p.vehicleId);if(current&&['car','bike'].includes(p.mode)){s.vehicleId=current.uid;s.mode=vehicleById(current.type).kind;s.x=current.x;s.z=current.z;s.heading=current.heading;}else {const overlap=s.vehicles.find(v=>Math.hypot(v.x-s.x,v.z-s.z)<2);if(overlap){const side=localPoint(overlap,-vehicleById(overlap.type).width/2-.8,.2);s.x=side.x;s.z=side.z;}}
 const contract=contracts.find(c=>c.id===p.mission?.id);if(contract&&Number.isFinite(p.mission.left)&&p.mission.left>0&&Number.isInteger(p.mission.stage)&&p.mission.stage>=0&&p.mission.stage<contract.points.length){s.mission={...contract,stage:p.mission.stage,left:p.mission.left,escaping:!!p.mission.escaping};s.wanted=contract.heat;}s.savedAt=p.savedAt;return true}catch{return false}}
export function updatePolice(s,dt){
 const nearest=s.cops.length?Math.min(...s.cops.map(c=>Math.hypot(c.x-s.x,c.z-s.z))):Infinity;
 if(s.wanted){const seen=nearest<75;s.heatTimer=seen?0:s.heatTimer+dt;if(s.heatTimer>9){s.wanted--;s.heatTimer=0;if(s.wanted===0)announce(s,'SIGNAL LOST · You are clear')}
  if(nearest<5&&Math.abs(s.speed)<6)s.bust+=dt;else s.bust=Math.max(0,s.bust-dt*1.5);
  if(s.bust>3){s.arrested=true;s.phase='busted'}
 }else{s.heatTimer=0;s.bust=0}
 for(const c of s.cops){
  const gx=Math.round(s.x/BLOCK)*BLOCK,gz=Math.round(s.z/BLOCK)*BLOCK;
  if(!c.target||Math.hypot(c.x-c.target.x,c.z-c.target.z)<3){
   const nx=Math.round(c.x/BLOCK)*BLOCK,nz=Math.round(c.z/BLOCK)*BLOCK;
   if(Math.abs(nx-gx)>2)c.target={x:nx+Math.sign(gx-nx)*BLOCK,z:nz};else if(Math.abs(nz-gz)>2)c.target={x:nx,z:nz+Math.sign(gz-nz)*BLOCK};else c.target={x:s.x,z:s.z};
  }
  if(Math.hypot(c.x-s.x,c.z-s.z)<28&&onRoad(s.x,s.z))c.target={x:s.x,z:s.z};
  const dx=c.target.x-c.x,dz=c.target.z-c.z,dd=Math.hypot(dx,dz)||1;c.heading=Math.atan2(dx,-dz);const step=Math.min(dd,(18+s.wanted*4)*dt),nx=c.x+dx/dd*step,nz=c.z+dz/dd*step;
  if(c.disabled||c.driver?.health<=0||c.guard){c.speed=0;continue;}if(!collision(nx,nz,1)){c.speed=step/dt;c.distance=(c.distance||0)+step;c.x=nx;c.z=nz}else c.target={x:Math.round(c.x/BLOCK)*BLOCK,z:Math.round(c.z/BLOCK)*BLOCK};
  if(dd<1)c.target=null;
  if(Math.hypot(c.x-s.x,c.z-s.z)<3.5&&s.mode!=='foot'&&s.invincible<=0){s.health=Math.max(0,s.health-8);s.speed*=.5;s.invincible=1.5}
 }
 if(s.health<=0)s.phase='wrecked';
}
// Short pedestrian routes for garage pickup. Replanned if moving traffic blocks a step.
export function walkingPath(s,target){
 const start={x:Math.round(s.x),z:Math.round(s.z)},end={x:Math.round(target.x),z:Math.round(target.z)},key=(x,z)=>x+','+z;
 const blocked=(x,z)=>{if(collision(x,z,.36))return true;for(const v of s.vehicles){const d=vehicleById(v.type),dx=x-v.x,dz=z-v.z,lx=Math.cos(v.heading)*dx+Math.sin(v.heading)*dz,lz=-Math.sin(v.heading)*dx+Math.cos(v.heading)*dz;if(Math.abs(lx)<d.width/2+.38&&Math.abs(lz)<d.length/2+.38)return true}return false;};
 if(blocked(end.x,end.z)){let choice=null,dist=Infinity;for(let dx=-1;dx<=1;dx++)for(let dz=-1;dz<=1;dz++){const x=end.x+dx,z=end.z+dz,d=Math.hypot(x-target.x,z-target.z);if(!blocked(x,z)&&d<dist){choice={x,z};dist=d}}if(!choice)return[];Object.assign(end,choice);}
 const first={...start,g:0,f:0,parent:null},open=[first],seen=new Map([[key(start.x,start.z),0]]);let found=null;
 for(let tries=0;open.length&&tries<4500;tries++){
  open.sort((a,b)=>a.f-b.f);const n=open.shift();if(n.x===end.x&&n.z===end.z){found=n;break}
  for(const [dx,dz]of[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const x=n.x+dx,z=n.z+dz;if(Math.abs(x-start.x)>55||Math.abs(z-start.z)>55||blocked(x,z)||(dx&&dz&&(blocked(n.x+dx,n.z)||blocked(n.x,n.z+dz))))continue;const g=n.g+Math.hypot(dx,dz),id=key(x,z);if((seen.get(id)??Infinity)<=g)continue;seen.set(id,g);open.push({x,z,g,f:g+Math.hypot(x-end.x,z-end.z),parent:n});}
 }
 if(!found)return[];const points=[];while(found.parent){points.push({x:found.x,z:found.z});found=found.parent}points.reverse();points.push(target);return points;
}
