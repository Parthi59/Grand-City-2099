import {collision,trafficSignal,angleDiff} from './city-data.js';
export const SIDEWALK=11.55;
export function pedestrianRoute(bx,bz,side=1){const x=bx*100,z=bz*100,a=SIDEWALK,b=100-SIDEWALK;const route=[{x:x+a,z:z+a},{x:x+a,z:z+b},{x:x+b,z:z+b},{x:x+b,z:z+a}];return side<0?route.reverse():route;}
export function stepPedestrian(p,s,dt){
 const from={x:p.x,z:p.z};p.flee=Math.max(0,(p.flee||0)-dt);let speed=0,targetHeading=p.heading||0,activity=p.activity||'walk';
 if(p.flee){targetHeading=Math.atan2(p.fleeX||1,-(p.fleeZ||1));speed=3.7;activity='run';}
 else if(p.route?.length){const target=p.route[p.routeIndex||0],dx=target.x-p.x,dz=target.z-p.z,distance=Math.hypot(dx,dz);targetHeading=Math.atan2(dx,-dz);
 if(distance<.3){p.routeIndex=((p.routeIndex||0)+1)%p.route.length;p.wait=Math.max(p.wait||0,p.activity==='browse'?2.5:0);}
 p.wait=Math.max(0,(p.wait||0)-dt);const axis=Math.abs(dx)>Math.abs(dz)?'x':'z',road=Math.round((axis==='x'?p.x:p.z)/100)*100,coordinate=axis==='x'?p.x:p.z,destination=axis==='x'?target.x:target.z,crossing=Math.abs(coordinate-road)>10&&Math.abs(coordinate-road)<13&&(coordinate-road)*(destination-road)<0;
 const blocked=s.vehicles.some(v=>Math.hypot(v.x-p.x,v.z-p.z)<(v.speed>3?4.3:1.8));speed=p.wait||blocked||(crossing&&!trafficSignal(axis,s.elapsed))?0:p.activity==='jog'?2.8:p.speed||1.3;
 }
 if(p.stun)speed=0;p.heading=(p.heading??targetHeading)+angleDiff(targetHeading,p.heading??targetHeading)*(1-Math.exp(-dt*8));
 const nx=p.x+Math.sin(targetHeading)*speed*dt,nz=p.z-Math.cos(targetHeading)*speed*dt;
 if(!collision(nx,nz,.32)){p.x=nx;p.z=nz;p.stuck=0;}else{speed=0;p.stuck=(p.stuck||0)+dt;if(p.stuck>1.5&&p.route?.length){p.routeIndex=((p.routeIndex||0)+1)%p.route.length;p.stuck=0;}if(p.flee){const oldX=p.fleeX||1;p.fleeX=-(p.fleeZ||1);p.fleeZ=oldX;}}
 p.phase=(p.phase||0)+Math.hypot(p.x-from.x,p.z-from.z)*4.2;return{speed,heading:p.heading,activity};
}
