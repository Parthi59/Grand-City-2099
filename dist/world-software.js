import * as T from './vendor/three.module.js';
export class SoftwareWorldRenderer{
 constructor(canvas){this.canvas=canvas;this.ctx=canvas.getContext('2d',{alpha:false});this.width=0;this.height=0;this.last=0;this.proj=new T.Matrix4();this.mv=new T.Matrix4();this.normal=new T.Matrix3();this.frustum=new T.Frustum();this.tmp=new T.Vector3();this.cache=new WeakMap();this.materials=new WeakMap();this.textures=new WeakMap();this.skinPoint=new T.Vector3();this.skinNormal=new T.Vector3()}
 setSize(w,h){const scale=Math.min(1,960/w,720/h);this.width=Math.round(w*scale);this.height=Math.round(h*scale);this.canvas.width=this.width;this.canvas.height=this.height;this.frame=this.ctx.createImageData(this.width,this.height);this.depth=new Float32Array(this.width*this.height);this.sky=new Uint8ClampedArray(this.frame.data.length);for(let y=0;y<this.height;y++){const t=y/this.height,a=t<.62?[132,174,197]:[219,229,223],b=t<.62?[219,229,223]:[241,223,191],u=t<.62?t/.62:(t-.62)/.38;for(let x=0;x<this.width;x++){const p=(y*this.width+x)*4;for(let k=0;k<3;k++)this.sky[p+k]=a[k]+(b[k]-a[k])*u;this.sky[p+3]=255;}}}
 render(scene,camera){
 const ctx=this.ctx,w=this.width,h=this.height;scene.updateMatrixWorld();camera.updateMatrixWorld();this.proj.multiplyMatrices(camera.projectionMatrix,camera.matrixWorldInverse);this.frustum.setFromProjectionMatrix(this.proj);this.frame.data.set(this.sky);this.depth.fill(0);
 const faces=[],light=new T.Vector3(-.5,.9,.2).normalize().transformDirection(camera.matrixWorldInverse),f=camera.projectionMatrix.elements;
 const screen=v=>[(f[0]*v[0]/-v[2]+1)*w*.5,(1-f[5]*v[1]/-v[2])*h*.5];
 scene.traverseVisible(mesh=>{
  if(!mesh.isMesh||!mesh.geometry?.attributes?.position||Array.isArray(mesh.material))return;
  mesh.getWorldPosition(this.tmp);const distance=this.tmp.distanceTo(camera.position);
  if(mesh.userData.detail&&distance>65)return;if(!this.frustum.intersectsObject(mesh))return;const radius=(mesh.geometry.boundingSphere?.radius||0)*mesh.matrixWorld.getMaxScaleOnAxis();if(distance-radius>(mesh.userData.distant?1200:350)&&mesh.renderOrder>=0)return;
  const geo=mesh.geometry,p=geo.attributes.position.array,n=geo.attributes.normal?.array,index=geo.index?.array,uv=geo.attributes.uv?.array;if(!index||!n)return;
  if(mesh.isSkinnedMesh)mesh.skeleton.update();this.mv.multiplyMatrices(camera.matrixWorldInverse,mesh.matrixWorld);this.normal.getNormalMatrix(this.mv);const mv=this.mv.elements,nm=this.normal.elements;
  let verts=this.cache.get(geo);if(!verts){verts=new Float32Array(p.length*2);this.cache.set(geo,verts)}
  for(let j=0;j<p.length;j+=3){let x=p[j],y=p[j+1],z=p[j+2],vx=n[j],vy=n[j+1],vz=n[j+2];const k=j*2;if(mesh.isSkinnedMesh){this.skinPoint.set(x,y,z);mesh.applyBoneTransform(j/3,this.skinPoint);this.skinNormal.set(x+vx,y+vy,z+vz);mesh.applyBoneTransform(j/3,this.skinNormal);this.skinNormal.sub(this.skinPoint).normalize();x=this.skinPoint.x;y=this.skinPoint.y;z=this.skinPoint.z;vx=this.skinNormal.x;vy=this.skinNormal.y;vz=this.skinNormal.z;}verts[k]=mv[0]*x+mv[4]*y+mv[8]*z+mv[12];verts[k+1]=mv[1]*x+mv[5]*y+mv[9]*z+mv[13];verts[k+2]=mv[2]*x+mv[6]*y+mv[10]*z+mv[14];let nx=nm[0]*vx+nm[3]*vy+nm[6]*vz,ny=nm[1]*vx+nm[4]*vy+nm[7]*vz,nz=nm[2]*vx+nm[5]*vy+nm[8]*vz,len=Math.hypot(nx,ny,nz)||1;verts[k+3]=nx/len;verts[k+4]=ny/len;verts[k+5]=nz/len}
  const mat=mesh.material;let mc=this.materials.get(mat);const key=mat.color?.getHex();if(!mc||mc.key!==key){const c=(mat.color||new T.Color('#ffffff')).clone().convertLinearToSRGB();mc={key,base:[c.r*255,c.g*255,c.b*255],glow:!!mat.emissive?.getHex()};this.materials.set(mat,mc)}
  for(let i=0;i<index.length;i+=3){const a=index[i]*6,b=index[i+1]*6,c=index[i+2]*6;if(verts[a+2]>=-.18&&verts[b+2]>=-.18&&verts[c+2]>=-.18)continue;
   let poly=[a,b,c].map(k=>[verts[k],verts[k+1],verts[k+2],uv?.[k/3]||0,uv?.[k/3+1]||0,mc.glow?1.18:.5+.5*Math.max(0,verts[k+3]*light.x+verts[k+4]*light.y+verts[k+5]*light.z)+(mat.metalness>.4?Math.pow(Math.max(0,verts[k+5]*.90+verts[k+4]*.38),24)*.24:0)]);
   if(poly.some(v=>v[2]>-.18)){const out=[];for(let k=0;k<3;k++){const u=poly[k],v=poly[(k+1)%3],inside=u[2]<=-.18,vi=v[2]<=-.18;if(inside)out.push(u);if(inside!==vi){const t=(-.18-u[2])/(v[2]-u[2]);out.push([u[0]+t*(v[0]-u[0]),u[1]+t*(v[1]-u[1]),-.18,u[3]+t*(v[3]-u[3]),u[4]+t*(v[4]-u[4]),u[5]+t*(v[5]-u[5])])}}poly=out;if(poly.length<3)continue}
   const pts=poly.map(screen);const winding=(pts[1][0]-pts[0][0])*(pts[2][1]-pts[0][1])-(pts[1][1]-pts[0][1])*(pts[2][0]-pts[0][0]);if(winding>=0&&mat.side!==T.DoubleSide)continue;if(pts.every(v=>v[0]<0)||pts.every(v=>v[0]>w)||pts.every(v=>v[1]<0)||pts.every(v=>v[1]>h))continue;
   let nx=(verts[a+3]+verts[b+3]+verts[c+3])/3,ny=(verts[a+4]+verts[b+4]+verts[c+4])/3,nz=(verts[a+5]+verts[b+5]+verts[c+5])/3;const len=Math.hypot(nx,ny,nz)||1;nx/=len;ny/=len;nz/=len;
   const shade=mc.glow?1.18:.50+.50*Math.max(0,nx*light.x+ny*light.y+nz*light.z),spec=mat.metalness>.5?Math.pow(Math.max(0,nz*.90+ny*.38),24)*60:0;
   const depth=poly.reduce((s,v)=>s+v[2],0)/poly.length,fog=Math.max(0,Math.min(.92,(-depth-130)/420));const rgb=mc.base.map((v,k)=>Math.round(Math.min(255,v*shade+spec)*(1-fog)+[201,213,213][k]*fog));faces.push({pts,poly,tint:mc.base,texture:(-depth)<350?mat.map?.image:null,flipY:mat.map?.flipY!==false,shade,fog,z:depth,rgb,alpha:mat.transparent?mat.opacity:1});
  }
 });
 // Opaque geometry writes reciprocal depth. Transparent surfaces blend back-to-front.
 faces.sort((a,b)=>(a.alpha<1)-(b.alpha<1)||(a.alpha<1?a.z-b.z:b.z-a.z));
 for(const face of faces){for(let k=1;k<face.poly.length-1;k++)this.rasterTriangle(face,[0,k,k+1]);}ctx.putImageData(this.frame,0,0);
 }
 textureLevels(img){
  if(!img?.width)return null;let levels=this.textures.get(img);if(levels)return levels;
  levels=[];const c=document.createElement('canvas'),q=c.getContext('2d',{willReadFrequently:true});let width=Math.min(1024,img.width),height=Math.round(img.height*width/img.width);
  while(width>=8&&height>=8){c.width=width;c.height=height;q.drawImage(img,0,0,width,height);levels.push(q.getImageData(0,0,width,height));width=Math.floor(width/2);height=Math.floor(height/2);}this.textures.set(img,levels);return levels;
 }
 rasterTriangle(face,ids){
  const [p0,p1,p2]=ids.map(i=>face.pts[i]),[v0,v1,v2]=ids.map(i=>face.poly[i]);
  const den=(p1[1]-p2[1])*(p0[0]-p2[0])+(p2[0]-p1[0])*(p0[1]-p2[1]);if(Math.abs(den)<.015)return;
  const w=this.width,h=this.height,x0=Math.max(0,Math.floor(Math.min(p0[0],p1[0],p2[0]))),x1=Math.min(w-1,Math.ceil(Math.max(p0[0],p1[0],p2[0]))),y0=Math.max(0,Math.floor(Math.min(p0[1],p1[1],p2[1]))),y1=Math.min(h-1,Math.ceil(Math.max(p0[1],p1[1],p2[1])));if(x0>x1||y0>y1)return;
  const dx0=(p1[1]-p2[1])/den,dy0=(p2[0]-p1[0])/den,dx1=(p2[1]-p0[1])/den,dy1=(p0[0]-p2[0])/den;
  const iz0=-1/v0[2],iz1=-1/v1[2],iz2=-1/v2[2],u0=v0[3]*iz0,u1=v1[3]*iz1,u2=v2[3]*iz2,t0=(face.flipY?1-v0[4]:v0[4])*iz0,t1=(face.flipY?1-v1[4]:v1[4])*iz1,t2=(face.flipY?1-v2[4]:v2[4])*iz2;
  let texture=null;const levels=this.textureLevels(face.texture);if(levels){const uvArea=Math.abs((v1[3]-v0[3])*(v2[4]-v0[4])-(v2[3]-v0[3])*(v1[4]-v0[4]))*levels[0].width*levels[0].height;const lod=Math.max(0,Math.min(levels.length-1,Math.floor(Math.log2(Math.max(1,Math.sqrt(uvArea/Math.abs(den)))))));texture=levels[lod];}
  const smooth=Math.max(v0[5],v1[5],v2[5])-Math.min(v0[5],v1[5],v2[5])>.012,ls0=v0[5]*iz0,ls1=v1[5]*iz1,ls2=v2[5]*iz2;
  const data=this.frame.data,depth=this.depth,alpha=face.alpha,opaque=alpha>=.999,base=face.rgb,fog=face.fog,light=face.tint.map(v=>v/255*Math.min(1,face.shade)*(1-fog));
  let row0=((p1[1]-p2[1])*(x0+.5-p2[0])+(p2[0]-p1[0])*(y0+.5-p2[1]))/den,row1=((p2[1]-p0[1])*(x0+.5-p2[0])+(p0[0]-p2[0])*(y0+.5-p2[1]))/den;
  for(let y=y0;y<=y1;y++,row0+=dy0,row1+=dy1){let a=row0,b=row1;for(let x=x0;x<=x1;x++,a+=dx0,b+=dx1){const c=1-a-b;if(a<-.00001||b<-.00001||c<-.00001)continue;const z=a*iz0+b*iz1+c*iz2,pixel=y*w+x;if(z<depth[pixel]-1e-7)continue;const p=pixel*4;const illumination=smooth?(a*ls0+b*ls1+c*ls2)/z:face.shade;let r=smooth?face.tint[0]*illumination*(1-fog)+201*fog:base[0],g=smooth?face.tint[1]*illumination*(1-fog)+213*fog:base[1],bl=smooth?face.tint[2]*illumination*(1-fog)+213*fog:base[2];if(texture){const tx=Math.max(0,Math.min(texture.width-1,Math.floor((a*u0+b*u1+c*u2)/z*texture.width))),ty=Math.max(0,Math.min(texture.height-1,Math.floor((a*t0+b*t1+c*t2)/z*texture.height))),j=(ty*texture.width+tx)*4;const ratio=smooth?illumination/Math.min(1,face.shade):1;r=texture.data[j]*light[0]*ratio+201*fog;g=texture.data[j+1]*light[1]*ratio+213*fog;bl=texture.data[j+2]*light[2]*ratio+213*fog;}if(opaque){depth[pixel]=z;data[p]=r;data[p+1]=g;data[p+2]=bl;}else{data[p]=r*alpha+data[p]*(1-alpha);data[p+1]=g*alpha+data[p+1]*(1-alpha);data[p+2]=bl*alpha+data[p+2]*(1-alpha);}}}
 }
}
