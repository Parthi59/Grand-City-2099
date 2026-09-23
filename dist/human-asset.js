import * as T from './vendor/three.module.js';
import {GLTFLoader} from './vendor/loaders/GLTFLoader.js';
import {clone} from './vendor/utils/SkeletonUtils.js';
let source;
const v=()=>new T.Vector3(),q=()=>new T.Quaternion();
export async function installHumanAsset({group,rig,head,gunSocket}){
 source ||=new GLTFLoader().loadAsync('/assets/nightfall-rig.glb');
 const gltf=await source,model=clone(gltf.scene);group.add(model);model.updateMatrixWorld(true);
 const bones={};model.traverse(o=>{if(o.isBone)bones[o.name.replace('mixamorig','')]=o;});
 // Keep the rigged, textured body and replace the helmet with an uncovered head.
 model.traverse(mesh=>{if(!mesh.isMesh)return;if(mesh.name.includes('visor')){mesh.visible=false;return;}mesh.material=mesh.material.clone();mesh.material.color.set('#dce5df');mesh.material.roughness=.78;mesh.castShadow=true;mesh.receiveShadow=true;mesh.frustumCulled=false;mesh.userData.dynamic=true;
  if(mesh.isSkinnedMesh){const geo=mesh.geometry.clone(),indices=[],skin=geo.attributes.skinIndex,weights=geo.attributes.skinWeight;const headIds=new Set(mesh.skeleton.bones.map((b,i)=>/Head/.test(b.name)?i:-1));for(let i=0;i<geo.index.count;i+=3){let remove=false;for(let j=0;j<3;j++){const id=geo.index.getX(i+j);let weight=0;for(let k=0;k<4;k++)if(headIds.has(skin.getComponent(id,k)))weight+=weights.getComponent(id,k);if(weight>.48)remove=true;}if(!remove)indices.push(geo.index.getX(i),geo.index.getX(i+1),geo.index.getX(i+2));}geo.setIndex(indices);mesh.geometry=geo;}
 });
 group.add(head,gunSocket);rig.visible=false;
 const headRest=bones.Head.getWorldQuaternion(q()).invert(),mixer=new T.AnimationMixer(model),actions={};
 for(const name of ['Idle','Walk','Run']){actions[name]=mixer.clipAction(gltf.animations.find(a=>a.name===name));actions[name].play();actions[name].weight=name==='Idle'?1:0;}
 let previousTime=0;
 const localPos=bone=>group.worldToLocal(bone.getWorldPosition(v()));
 const positionBone=(bone,p)=>{bone.position.copy(bone.parent.worldToLocal(group.localToWorld(new T.Vector3(...p))));bone.updateMatrixWorld(true);};
 function pointBone(bone,child,target){group.updateMatrixWorld(true);const start=bone.getWorldPosition(v()),from=child.getWorldPosition(v()).sub(start).normalize(),to=group.localToWorld(new T.Vector3(...target)).sub(start).normalize(),delta=q().setFromUnitVectors(from,to);const result=delta.multiply(bone.getWorldQuaternion(q()));bone.quaternion.copy(bone.parent.getWorldQuaternion(q()).invert().multiply(result));bone.updateMatrixWorld(true);}
 function solve(upper,lower,end,target,bend){const a=localPos(upper),b=new T.Vector3(...target),l1=localPos(lower).distanceTo(a),l2=localPos(end).distanceTo(localPos(lower)),delta=b.clone().sub(a),length=Math.min(l1+l2-.002,Math.max(.005,delta.length()));delta.normalize();const along=(l1*l1-l2*l2+length*length)/(2*length),height=Math.sqrt(Math.max(0,l1*l1-along*along)),normal=new T.Vector3(...bend).addScaledVector(delta,-new T.Vector3(...bend).dot(delta)).normalize(),joint=a.clone().addScaledVector(delta,along).addScaledVector(normal,height);pointBone(upper,lower,joint.toArray());pointBone(lower,end,target);}
 function tilt(bone,angle){const axis=new T.Vector3(1,0,0).applyQuaternion(group.getWorldQuaternion(q())),world=q().setFromAxisAngle(axis,angle).multiply(bone.getWorldQuaternion(q()));bone.quaternion.copy(bone.parent.getWorldQuaternion(q()).invert().multiply(world));bone.updateMatrixWorld(true);}
 return{update({time=0,speed=0,seated=0,kind='bike',seat=.81,weapon=null,aiming=false,aimPitch=0,reload=0,recoil=0,fallen=0}={}){
  const dt=Math.min(.06,Math.max(0,time-previousTime));previousTime=time;const moving=speed>.25&&!seated,run=speed>2.5;const desired={Idle:moving?0:1,Walk:moving&&!run?1:0,Run:moving&&run?1:0};for(const name of Object.keys(actions))actions[name].weight=T.MathUtils.lerp(actions[name].weight,desired[name],1-Math.exp(-dt*10));mixer.update(dt*(moving?speed/(run?5.4:1.6):1));group.updateMatrixWorld(true);
  if(seated){const hip=localPos(bones.Hips);positionBone(bones.Hips,[0,T.MathUtils.lerp(hip.y,seat+.04,seated),0]);tilt(bones.Spine1,kind==='bike'?-.30*seated:.05*seated);for(const side of[-1,1]){const n=side<0?'Left':'Right';solve(bones[n+'UpLeg'],bones[n+'Leg'],bones[n+'Foot'],kind==='car'?[side*.17,.16,-.53]:[side*.27,.39,.10],[0,0,-1]);solve(bones[n+'Arm'],bones[n+'ForeArm'],bones[n+'Hand'],kind==='car'?[side*.17,seat+.40,-.49]:[side*.34,1.02,-.34],[side*.65,-.3,.35]);}}
  if(weapon&&!seated){tilt(bones.Spine1,-.11);const hip=localPos(bones.Hips),lower=Math.sin(reload*Math.PI)*.19,pitch=Math.sin(aimPitch)*.38,y=hip.y+(aiming?.40:.31)-lower-pitch;solve(bones.RightArm,bones.RightForeArm,bones.RightHand,[.18,y,-.30+recoil],[.7,-.4,.25]);solve(bones.LeftArm,bones.LeftForeArm,bones.LeftHand,weapon==='carbine'?[.015,y-.025,-.38]:[.115,y-.03,-.31],[-.6,-.5,.15]);
   const right=localPos(bones.RightHand);gunSocket.position.copy(right).add(new T.Vector3(.0,.015,-.095));gunSocket.rotation.set(-aimPitch+recoil*1.7,0,-Math.sin(reload*Math.PI)*.22);
  }
  model.updateMatrixWorld(true);head.position.copy(localPos(bones.Head)).add(new T.Vector3(0,.112,-.028));const worldHead=bones.Head.getWorldQuaternion(q()).multiply(headRest);head.quaternion.copy(group.getWorldQuaternion(q()).invert().multiply(worldHead));model.rotation.z=fallen*Math.PI*.48;model.position.y=fallen*.12;
 }};
}
