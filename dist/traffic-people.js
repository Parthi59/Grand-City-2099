import {makeHuman} from './character.js';
import {vehicleById} from './fleet-data.js';
import {localPoint,groundHeight} from './city-data.js';
// A bounded pool keeps visible drivers and people leaving vehicles inexpensive.
export class TrafficPeople{
 constructor(world,{lowDetail=false}={}){this.world=world;this.lowDetail=lowDetail;this.pool=[];this.limit=lowDetail?10:30;this.departed=[];}
 acquire(driver){let actor=this.pool.find(a=>!a.owner&&a.rider===!!driver.rider);if(!actor&&this.pool.filter(a=>a.rider===!!driver.rider).length<(driver.rider?Math.ceil(this.limit/4):Math.floor(this.limit*3/4))){const colors=['#465f79','#c5b8a0','#677b55','#8b5f56','#41474e'];actor=makeHuman({lowDetail:true,helmet:!!driver.rider,color:driver.police?'#344658':colors[this.pool.length%colors.length],skin:['#a47355','#c09979','#77503e'][this.pool.length%3]});actor.rider=!!driver.rider;this.pool.push(actor);}if(!actor)return null;actor.owner=driver;driver.group=actor.group;driver.pose=actor.pose;this.world.scene.add(actor.group);return actor;}
 release(actor){const driver=actor.owner;if(!driver)return;this.world.scene.remove(actor.group);const i=this.world.pedestrians.indexOf(driver);if(i>=0)this.world.pedestrians.splice(i,1);delete driver.group;delete driver.pose;actor.owner=null;}
 update(s,dt,time,camera){const cars=[...s.vehicles,...s.cops].sort((a,b)=>Math.hypot(a.x-camera.x,a.z-camera.z)-Math.hypot(b.x-camera.x,b.z-camera.z));for(const actor of this.pool){const p=actor.owner;if(!p)continue;const car=cars.find(v=>v.driver===p);if((!car&&!p.exited)||(!p.exited&&car&&Math.hypot(car.x-camera.x,car.z-camera.z)>(this.lowDetail?32:70)))this.release(actor);}
  for(const car of cars){const p=car.driver;if(!p||car.guard)continue;if(p.exited){if(p.group&&!this.world.pedestrians.includes(p)){this.world.pedestrians.push(p);this.departed.push(p);}continue;}
   const distance=Math.hypot(car.x-camera.x,car.z-camera.z);if(distance>(this.lowDetail?32:70))continue;const actor=this.pool.find(a=>a.owner===p)||this.acquire(p);if(!actor)continue;const def=vehicleById(car.type),seat=localPoint(car,def.kind==='bike'?0:-.37,def.kind==='bike'?.28:.12),exit=p.exiting?p.exitProgress||0:0;
   actor.group.visible=true;actor.group.position.set(p.exiting?p.x:seat.x,groundHeight(car.x,car.z),p.exiting?p.z:seat.z);actor.group.rotation.y=-car.heading;
   actor.pose({detail:distance<(this.lowDetail?8:24),time,phase:0,seated:1-exit,kind:def.kind,seat:def.kind==='bike'?def.seat:['suv','pickup','van'].includes(def.design)?.72:Math.min(.54,def.height-.93),turn:car.steering||0,speed:0,slump:p.health<=0?1:0});
  }
  while(this.departed.length>12){const p=this.departed.find(p=>Math.hypot(p.x-s.x,p.z-s.z)>35);if(!p)break;this.departed.splice(this.departed.indexOf(p),1);const actor=this.pool.find(a=>a.owner===p);if(actor)this.release(actor);}
 }
 reset(s){for(const a of this.pool)this.release(a);this.departed.length=0;for(const v of s.vehicles){if(v.driver?.exiting){v.driver.exited=true;v.driver.exiting=false;}}}
}
