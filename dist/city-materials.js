import * as T from './vendor/three.module.js';
export function cityMaterials(){
 const pending=[],loader=new T.TextureLoader();
 function texture(url,onLoad){let resolve;pending.push(new Promise(r=>resolve=r));const map=loader.load(url,t=>{onLoad?.(t);resolve();},undefined,()=>resolve());map.colorSpace=T.SRGBColorSpace;map.anisotropy=8;return map;}
 // Pre-tile aggregate and paving inside their atlas cells to keep physical scale
 // without multiplying the street's geometry or adding a texture per road segment.
 const streetCanvas=document.createElement('canvas');streetCanvas.width=streetCanvas.height=1024;const streetMap=new T.CanvasTexture(streetCanvas);streetMap.colorSpace=T.SRGBColorSpace;streetMap.anisotropy=8;
 const facade=texture('/assets/coastal-facades-atlas.webp'),surface=texture('/assets/coastal-materials-atlas.webp',t=>{const q=streetCanvas.getContext('2d'),img=t.image;q.drawImage(img,0,0,1024,1024);for(const [quadrant,repeats]of[[0,16],[1,2]]){const sx=quadrant*img.width/2,dx=quadrant*512,size=512/repeats;for(let y=0;y<repeats;y++)for(let x=0;x<repeats;x++)q.drawImage(img,sx,0,img.width/2,img.height/2,dx+x*size,y*size,size,size);}streetMap.needsUpdate=true;});
 const mat=(color,metalness=.05,roughness=.78)=>new T.MeshStandardMaterial({color,metalness,roughness});
 const m={
  facade:new T.MeshStandardMaterial({color:'#eee8dc',map:facade,roughness:.87}),
  glassFacade:new T.MeshStandardMaterial({color:'#dcebf1',map:facade,metalness:.38,roughness:.31,envMapIntensity:.65}),
  asphalt:new T.MeshStandardMaterial({color:'#969b9a',map:streetMap,roughness:.96}),
  pavement:new T.MeshStandardMaterial({color:'#f6efe1',map:streetMap,roughness:.91}),
  stone:new T.MeshStandardMaterial({color:'#d7d0c0',roughness:.86}),
  ivory:mat('#d6d1bf'),concrete:mat('#a0a8a5'),plaster:mat('#cfba9e'),brick:mat('#9f7666'),
  roof:mat('#646965'),metal:mat('#6b7477',.7,.38),dark:mat('#273c43',.30,.45),
  glass:new T.MeshPhysicalMaterial({color:'#62838a',metalness:.22,roughness:.14,transparent:true,opacity:.79,clearcoat:1,envMapIntensity:1.2}),
  shopGlass:mat('#263c40',.35,.18),white:mat('#e1dfcf'),paint:mat('#d2ccb3',0,.96),yellow:mat('#c9b175',0,.96),
  grass:mat('#626e49',0,1),soil:mat('#665b49',0,1),bark:mat('#6f6250'),leaf:mat('#516849',0,.9),leafLight:mat('#6d7b50',0,.9),
  copper:mat('#9a8770',.7,.4),water:new T.MeshPhysicalMaterial({color:'#41818d',metalness:.35,roughness:.18,clearcoat:1,envMapIntensity:1.4}),
  shadow:new T.MeshBasicMaterial({color:'#17222a',transparent:true,opacity:.18,depthWrite:false}),
  teal:mat('#4f8a88',.2,.58),fabric:mat('#6d8176',0,.9),red:mat('#a75d4d'),
 };
 const c=document.createElement('canvas');c.width=1024;c.height=512;const q=c.getContext('2d'),sky=q.createLinearGradient(0,0,0,512);sky.addColorStop(0,'#608fae');sky.addColorStop(.38,'#bcd5df');sky.addColorStop(.5,'#f8dfb3');sky.addColorStop(.53,'#adad92');sky.addColorStop(1,'#454e48');q.fillStyle=sky;q.fillRect(0,0,1024,512);const glow=q.createRadialGradient(775,216,2,775,216,95);glow.addColorStop(0,'#fff7dd');glow.addColorStop(.07,'#fff3c9');glow.addColorStop(.16,'#f6d9a284');glow.addColorStop(1,'#f7d8a300');q.fillStyle=glow;q.fillRect(650,100,250,230);
 const environment=new T.CanvasTexture(c);environment.colorSpace=T.SRGBColorSpace;environment.mapping=T.EquirectangularReflectionMapping;
 return{m,environment,ready:Promise.all(pending)};
}
// Geometry tiles sample a single atlas quadrant without texture wrapping into adjacent materials.
export function makeAtlasGeometry(width,height,tileW,tileH,quadrant=0){
 const positions=[],normals=[],uvs=[],indices=[],ox=(quadrant%2)*.5,oy=quadrant<2?.5:0,pad=.0012,unit=.5-2*pad;
 for(let y=0;y<height-.001;y+=tileH)for(let x=0;x<width-.001;x+=tileW){const w=Math.min(tileW,width-x),h=Math.min(tileH,height-y),a=positions.length/3,x0=x-width/2,y0=y-height/2;
  positions.push(x0,y0,0,x0+w,y0,0,x0+w,y0+h,0,x0,y0+h,0);normals.push(0,0,1,0,0,1,0,0,1,0,0,1);uvs.push(ox+pad,oy+pad,ox+pad+unit*w/tileW,oy+pad,ox+pad+unit*w/tileW,oy+pad+unit*h/tileH,ox+pad,oy+pad+unit*h/tileH);indices.push(a,a+1,a+2,a,a+2,a+3);
 }
 const geo=new T.BufferGeometry();geo.setAttribute('position',new T.Float32BufferAttribute(positions,3));geo.setAttribute('normal',new T.Float32BufferAttribute(normals,3));geo.setAttribute('uv',new T.Float32BufferAttribute(uvs,2));geo.setIndex(indices);return geo;
}
