"""Crop and normalize the licensed Lee Perry-Smith scan for game-scale heads.
Run with the downloaded official asset directory as argv[1]. No network access.
"""
import json, struct, pathlib, sys, shutil
src=pathlib.Path(sys.argv[1]); out=pathlib.Path('dist/public/assets/human')
b=(src/'LeePerrySmith.glb').read_bytes(); n=struct.unpack_from('<I',b,12)[0]; gltf=json.loads(b[20:20+n]); data=b[28+n:]
def read(i,width,fmt):
 a=gltf['accessors'][i]; v=gltf['bufferViews'][a['bufferView']]; vals=struct.unpack_from('<'+fmt*a['count']*width,data,v.get('byteOffset',0)+a.get('byteOffset',0));return [vals[k:k+width] for k in range(0,len(vals),width)]
p=read(1,3,'f'); normals=read(2,3,'f'); uv=read(3,2,'f'); indices=[i[0] for i in read(0,1,'H')]
tri=[indices[i:i+3] for i in range(0,len(indices),3) if min(p[j][1] for j in indices[i:i+3])> -1.45]
used=sorted(set(sum(tri,[]))); remap={old:i for i,old in enumerate(used)}
pos=[(-p[i][0]*.047,max(-.128,(p[i][1]-1.55)*.050),-p[i][2]*.044) for i in used]
# Fit the cropped nape into the original neck, removing the scan bust flare.
for k,(x,y,z) in enumerate(pos):
 t=max(0,min(1,(-y-.095)/.030));pos[k]=(x+(max(-.048,min(.048,x))-x)*t,y,z+(max(-.045,min(.047,z))-z)*t)
ns=[]
for i in used:
 v=(-normals[i][0]/.047,normals[i][1]/.05,-normals[i][2]/.044);l=sum(x*x for x in v)**.5;ns.append(tuple(x/l for x in v))
arrays=[([remap[i] for t in tri for i in t],1,'H',5123),([x for v in pos for x in v],3,'f',5126),([x for v in ns for x in v],3,'f',5126),([x for i in used for x in uv[i]],2,'f',5126)]
blob=bytearray(); views=[]; access=[]
for vals,w,fmt,ct in arrays:
 while len(blob)%4:blob.append(0)
 views.append({'buffer':0,'byteOffset':len(blob),'byteLength':len(vals)*struct.calcsize(fmt)});blob.extend(struct.pack('<'+fmt*len(vals),*vals));a={'bufferView':len(views)-1,'componentType':ct,'count':len(vals)//w,'type':{1:'SCALAR',2:'VEC2',3:'VEC3'}[w]}
 if len(views)==2:a.update(min=[min(v[k] for v in pos) for k in range(3)],max=[max(v[k] for v in pos) for k in range(3)])
 access.append(a)
while len(blob)%4:blob.append(0)
j={'asset':{'version':'2.0','copyright':'Lee Perry-Smith / Infinite Realities, CC BY 3.0; crop and scale by Grand City 2099'},'scene':0,'scenes':[{'nodes':[0]}],'nodes':[{'mesh':0,'name':'Scanned human head'}],'meshes':[{'primitives':[{'attributes':{'POSITION':1,'NORMAL':2,'TEXCOORD_0':3},'indices':0}]}],'buffers':[{'byteLength':len(blob)}],'bufferViews':views,'accessors':access}
jb=json.dumps(j,separators=(',',':')).encode();jb+=b' '*((-len(jb))%4)
result=struct.pack('<III',0x46546c67,2,12+8+len(jb)+8+len(blob))+struct.pack('<II',len(jb),0x4e4f534a)+jb+struct.pack('<II',len(blob),0x004e4942)+blob
out.mkdir(parents=True,exist_ok=True);(out/'head.glb').write_bytes(result)
for a,z in [('Map-COL.jpg','face-color.jpg'),('Infinite-Level_02_Tangent_SmoothUV.jpg','face-normal.jpg'),('LeePerrySmith_License.txt','LICENSE.txt')]:shutil.copy2(src/a,out/z)
print(f'{len(pos)} vertices, {len(tri)} triangles; bounds {access[1]["min"]} to {access[1]["max"]}')
