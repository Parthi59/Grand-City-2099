import * as THREE from './vendor/three.module.js';
import { RoomEnvironment } from './vendor/RoomEnvironment.js';
import { makeBike } from './bike-model.js';
import { installSoftwareBikeView } from './bike-software.js';

try{
 const canvas=document.createElement('canvas');canvas.id='bike3d';canvas.setAttribute('aria-hidden','true');document.querySelector('#world').after(canvas);
 const renderer=new THREE.WebGLRenderer({canvas,alpha:true,antialias:true,powerPreference:'high-performance'});renderer.setPixelRatio(Math.min(devicePixelRatio,1.75));renderer.setClearColor(0,0);renderer.outputColorSpace=THREE.SRGBColorSpace;renderer.toneMapping=THREE.ACESFilmicToneMapping;renderer.toneMappingExposure=1.45;renderer.shadowMap.enabled=true;renderer.shadowMap.type=THREE.PCFSoftShadowMap;
 const scene=new THREE.Scene(),camera=new THREE.PerspectiveCamera(38,1,.1,80),bike=makeBike();scene.add(bike.group);
 const pmrem=new THREE.PMREMGenerator(renderer);const room=new RoomEnvironment();const env=pmrem.fromScene(room,.04);scene.environment=env.texture;room.dispose();pmrem.dispose();
 scene.add(new THREE.HemisphereLight('#c4e8ff','#102235',2.1));const key=new THREE.DirectionalLight('#e8f4ff',4.0);key.position.set(-3,6,-4);key.castShadow=true;key.shadow.mapSize.set(1024,1024);key.shadow.camera.left=-5;key.shadow.camera.right=5;key.shadow.camera.top=5;key.shadow.camera.bottom=-5;key.shadow.bias=-.0006;scene.add(key);
 const rim=new THREE.DirectionalLight('#61bbff',3.8);rim.position.set(4,3,4);scene.add(rim);const fill=new THREE.DirectionalLight('#ffffff',1.2);fill.position.set(-5,2,2);scene.add(fill);
 const stage=new THREE.Group();scene.add(stage);const platform=new THREE.Mesh(new THREE.CylinderGeometry(3.1,3.2,.1,96),new THREE.MeshStandardMaterial({color:'#111c29',metalness:.75,roughness:.29}));platform.position.y=-.08;platform.receiveShadow=true;stage.add(platform);
 const stageRing=new THREE.Mesh(new THREE.TorusGeometry(3.08,.018,8,96),new THREE.MeshBasicMaterial({color:'#4bd6ee'}));stageRing.rotation.x=Math.PI/2;stageRing.position.y=-.016;stage.add(stageRing);
 const shadow=new THREE.Mesh(new THREE.PlaneGeometry(12,12),new THREE.ShadowMaterial({opacity:.45}));shadow.rotation.x=-Math.PI/2;shadow.position.y=-.019;shadow.receiveShadow=true;scene.add(shadow);
 let width=0,height=0,orbit=0,drag=false,lastX=0;const host=document.querySelector('#game');
 host.addEventListener('pointerdown',e=>{if(!document.body.classList.contains('racing')&&e.target.tagName==='CANVAS'){drag=true;lastX=e.clientX;host.setPointerCapture(e.pointerId)}});host.addEventListener('pointermove',e=>{if(drag){orbit+=(e.clientX-lastX)*.007;lastX=e.clientX}});host.addEventListener('pointerup',()=>drag=false);host.addEventListener('pointercancel',()=>drag=false);
 canvas.addEventListener('webglcontextlost',e=>{e.preventDefault();window.bikeView=null;canvas.style.display='none'});
 window.bikeView={render(o){
  if(o.w!==width||o.h!==height){width=o.w;height=o.h;renderer.setSize(width,height,false)}
  const isMenu=o.menu;stage.visible=isMenu;bike.rider.visible=!isMenu;shadow.visible=true;
  if(bike.variant!==o.selected){bike.variant=o.selected;bike.accent.color.set(o.color);bike.accent.emissive.set(o.color);bike.silver.color.set(o.selected===0?'#c5cdd3':o.selected===1?'#cbdfe5':'#647082')}
  bike.group.visible=o.camera!=='cockpit'||isMenu;
  if(isMenu){camera.fov=37;camera.aspect=width/height;camera.position.set(5.1,2.9,-6.0);camera.lookAt(0,1.0,0);camera.updateProjectionMatrix();camera.projectionMatrix.elements[8]=width>760?-.40:-.3;camera.projectionMatrix.elements[9]=width>760?0:-.23;camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();bike.group.position.set(0,0,0);bike.group.rotation.set(0,orbit+Math.sin(o.clock*.13)*.13,0);const scale=width>760?.82:Math.min(.64,width/650);bike.group.scale.setScalar(scale);stage.scale.setScalar(scale);stage.position.set(0,0,0);shadow.position.set(0,-.019,0);key.target.position.set(0,1,0);bike.wheels.forEach(w=>w.rotation.x=0)}
  else{const fov=THREE.MathUtils.radToDeg(2*Math.atan(height/(2*o.focal)));camera.fov=fov;camera.aspect=width/height;camera.position.set(o.camX,o.camY,0);camera.lookAt(o.camX,o.camY,-1);camera.updateProjectionMatrix();camera.projectionMatrix.elements[9]=2*o.horizon/height-1;camera.projectionMatrixInverse.copy(camera.projectionMatrix).invert();bike.group.position.set(o.x,0,-12.5);bike.group.scale.setScalar(1.05);bike.group.rotation.set(0,-o.steer*.10,-o.steer*.21);bike.wheels.forEach(w=>w.rotation.x=-o.distance/.7);shadow.position.set(o.x,-.019,-12.5);key.position.set(o.x-3,6,-16);key.target.position.set(o.x,1,-12.5)}
  if(isMenu)key.position.set(-3,6,-4);scene.add(key.target);bike.glows.forEach(g=>{g.visible=o.boosting&&!isMenu;g.scale.z=o.boosting?4+Math.sin(o.clock*40):1});renderer.render(scene,camera);
 },stats(){return{meshes:renderer.info.render.calls,triangles:renderer.info.render.triangles}}};
 document.querySelector('#modelHint').textContent='DRAG TO INSPECT YOUR MACHINE';
}catch(error){console.error('3D motorcycle renderer:',error);document.querySelector('#modelHint').textContent='3D view needs hardware acceleration';document.querySelector('#bike3d')?.remove();installSoftwareBikeView()}
