import * as T from './vendor/three.module.js';
import {GLTFLoader} from './vendor/loaders/GLTFLoader.js';
import {clone} from './vendor/utils/SkeletonUtils.js';
let source;
export async function installCivilianAsset({group,rig,variant=0}){
 source??=new GLTFLoader().loadAsync('/assets/civilian-rig.glb');const gltf=await source,model=clone(gltf.scene);group.add(model);model.updateMatrixWorld(true);
 const bones={};model.traverse(o=>{if(o.isBone)bones[o.name.replace(/^mixamorig:?/,'')]=o;if(o.isMesh){o.material=o.material.clone();o.material.roughness=.85;o.castShadow=true;o.receiveShadow=true;o.frustumCulled=false;o.userData.dynamic=true;}});
 const size=new T.Box3().setFromObject(model).getSize(new T.Vector3());model.scale.multiplyScalar(1.72/size.y);model.rotation.y=Math.PI;model.updateMatrixWorld(true);
 const phone=new T.Mesh(new T.BoxGeometry(.06,.115,.009),new T.MeshStandardMaterial({color:'#16202b'}));group.add(phone);phone.visible=false;
 const rest=new Map();model.traverse(o=>{if(o.isBone)rest.set(o,{position:o.position.clone(),quaternion:o.quaternion.clone()});});
 const pos=b=>group.worldToLocal(b.getWorldPosition(new T.Vector3()));
 function point(bone,child,target){model.updateMatrixWorld(true);const start=bone.getWorldPosition(new T.Vector3()),from=child.getWorldPosition(new T.Vector3()).sub(start).normalize(),to=group.localToWorld(new T.Vector3(...target)).sub(start).normalize();bone.quaternion.copy(bone.parent.getWorldQuaternion(new T.Quaternion()).invert().multiply(new T.Quaternion().setFromUnitVectors(from,to).multiply(bone.getWorldQuaternion(new T.Quaternion()))));bone.updateMatrixWorld(true);}
 function solve(a,b,c,target,bend){const start=pos(a),end=new T.Vector3(...target),l1=pos(b).distanceTo(start),l2=pos(c).distanceTo(pos(b)),dir=end.clone().sub(start),d=Math.min(l1+l2-.001,Math.max(.01,dir.length()));dir.normalize();const along=(l1*l1-l2*l2+d*d)/(2*d),rise=Math.sqrt(Math.max(0,l1*l1-along*along)),normal=new T.Vector3(...bend).addScaledVector(dir,-new T.Vector3(...bend).dot(dir)).normalize(),joint=start.clone().addScaledVector(dir,along).addScaledVector(normal,rise);point(a,b,joint.toArray());point(b,c,target);}
 return{update({time=0,phase=0,speed=0,fallen=0,flinch=0,activity='walk',detail=true}={}){
 model.visible=detail;rig.visible=!detail;phone.visible=detail&&activity==='phone';phone.position.set(.16,1.30,-.25);if(!detail)return;
 model.rotation.z=0;model.position.y=0;for(const [bone,t]of rest){bone.position.copy(t.position);bone.quaternion.copy(t.quaternion);}model.updateMatrixWorld(true);
 const moving=Math.min(1,speed/1.2),run=Math.min(1,speed/3.8),hip=1.06+Math.abs(Math.sin(phase))*.022*moving+Math.sin(time*2)*.003;
 bones.Hips.position.copy(bones.Hips.parent.worldToLocal(group.localToWorld(new T.Vector3(0,hip,0))));bones.Hips.updateMatrixWorld(true);
 for(const side of[-1,1]){const n=side<0?'Left':'Right',q=phase+(side>0?Math.PI:0),ankle=[side*.10,.12+Math.max(0,Math.cos(q))*(.10+run*.08)*moving,Math.sin(q)*(.25+run*.12)*moving];solve(bones[n+'UpLeg'],bones[n+'Leg'],bones[n+'Foot'],ankle,[0,0,-1]);
 let wrist=[side*.25,hip-.16+run*.12,-.015+Math.sin(q)*(.19+run*.12)*moving];if(activity==='phone'&&side>0)wrist=[.16,1.30,-.25];if(activity==='talk')wrist=[side*(.25+.05*Math.sin(time*1.8)),1.08+.09*Math.sin(time*1.6+side),-.24];wrist[1]+=flinch*.14;solve(bones[n+'Arm'],bones[n+'ForeArm'],bones[n+'Hand'],wrist,[side*.5,0,1]);}
 if(activity==='phone')bones.Head.rotation.x+=.12;else if(!moving)bones.Head.rotation.y+=Math.sin(time*.55+variant)*.12;
 model.rotation.z=fallen*Math.PI*.48;model.position.y=fallen*.12;
 }};
}
