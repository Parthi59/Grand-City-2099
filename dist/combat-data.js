export const WEAPONS=[
 {id:'sidearm',name:'A9 SIDEARM',label:'Precision sidearm',clip:12,reserve:84,damage:34,interval:.27,reload:1.45,range:120,automatic:false,recoil:.030},
 {id:'carbine',name:'VX CARBINE',label:'Automatic carbine',clip:30,reserve:180,damage:24,interval:.105,reload:2.15,range:190,automatic:true,recoil:.017}
];
export const weaponDef=id=>WEAPONS.find(w=>w.id===id);
export function createCombat(){return{selected:null,last:'sidearm',aiming:false,cooldown:0,reloading:0,reloadDuration:0,recoil:0,hit:0,shotCount:0,clips:Object.fromEntries(WEAPONS.map(w=>[w.id,w.clip])),reserve:Object.fromEntries(WEAPONS.map(w=>[w.id,w.reserve]))};}
export function selectWeapon(s,id){if(s.phase!=='playing'||s.mode!=='foot'||s.transition)return false;const c=s.combat;if(id&&!weaponDef(id))return false;c.selected=id;c.last=id||c.last;c.reloading=0;c.aiming=false;c.cooldown=.20;s.events.push('equip');return true;}
export function reloadWeapon(s){const c=s.combat,w=weaponDef(c.selected);if(s.phase!=='playing'||s.mode!=='foot'||s.transition||!w||c.reloading||c.clips[w.id]>=w.clip||!c.reserve[w.id])return false;c.reloading=w.reload;c.reloadDuration=w.reload;s.events.push('reload');return true;}
export function tickCombat(s,dt){const c=s.combat;if(!c||s.phase!=='playing')return;c.cooldown=Math.max(0,c.cooldown-dt);c.recoil*=Math.exp(-dt*15);c.hit=Math.max(0,c.hit-dt);if(s.mode!=='foot'||s.transition){c.aiming=false;c.reloading=0;return;}if(c.reloading){c.reloading=Math.max(0,c.reloading-dt);if(!c.reloading){const w=weaponDef(c.selected);if(w){const amount=Math.min(w.clip-c.clips[w.id],c.reserve[w.id]);c.clips[w.id]+=amount;c.reserve[w.id]-=amount;s.events.push('reloadDone');}}}}
export function fireWeapon(s){const c=s.combat,w=weaponDef(c.selected);if(s.phase!=='playing'||s.mode!=='foot'||s.transition||!w||c.cooldown>0||c.reloading)return null;if(c.clips[w.id]<=0){c.cooldown=.28;s.events.push('empty');reloadWeapon(s);return null;}c.clips[w.id]--;c.cooldown=w.interval;c.recoil=Math.min(.10,c.recoil+w.recoil);c.shotCount++;s.events.push('shot-'+w.id);return w;}
export function restoreCombat(c,saved){if(!saved)return;c.selected=weaponDef(saved.selected)?.id||null;c.last=weaponDef(saved.last)?.id||'sidearm';for(const w of WEAPONS){for(const [field,max]of[['clips',w.clip],['reserve',999]]){const n=saved[field]?.[w.id];if(Number.isFinite(n))c[field][w.id]=Math.max(0,Math.min(max,Math.floor(n)));}}}

// A shot tests real scene bounds. The nearest solid surface stops it.
export function rayBox(origin,direction,box,maxDistance=200){
 const co=Math.cos(box.heading||0),si=Math.sin(box.heading||0),px=origin.x-box.x,pz=origin.z-box.z;
 const o=[co*px+si*pz,origin.y-(box.y||0),-si*px+co*pz],d=[co*direction.x+si*direction.z,direction.y,-si*direction.x+co*direction.z],half=[box.w/2,box.h/2,box.d/2];let near=0,far=maxDistance,normal=[0,0,0];
 for(let axis=0;axis<3;axis++){if(Math.abs(d[axis])<1e-8){if(Math.abs(o[axis])>half[axis])return null;continue;}let t0=(-half[axis]-o[axis])/d[axis],t1=(half[axis]-o[axis])/d[axis],sign=-1;if(t0>t1){[t0,t1]=[t1,t0];sign=1;}if(t0>near){near=t0;normal=[0,0,0];normal[axis]=sign;}far=Math.min(far,t1);if(near>far)return null;}
 if(near>maxDistance||far<0)return null;return{distance:near,point:{x:origin.x+direction.x*near,y:origin.y+direction.y*near,z:origin.z+direction.z*near},normal:{x:co*normal[0]-si*normal[2],y:normal[1],z:si*normal[0]+co*normal[2]},object:box};
}
export function traceShot(origin,direction,objects,maxDistance=200){let best=null;for(const object of objects){if(object.disabled)continue;const hit=rayBox(origin,direction,object,best?.distance??maxDistance);if(hit&&(!best||hit.distance<best.distance))best=hit;}return best;}
