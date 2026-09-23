import http from 'node:http';
import {readFile,stat} from 'node:fs/promises';
import {fileURLToPath} from 'node:url';
import path from 'node:path';
import {spawn} from 'node:child_process';
const root=fileURLToPath(new URL('./build/',import.meta.url));
const port=Number(process.env.PORT||4173);
const types={'.html':'text/html; charset=utf-8','.js':'text/javascript; charset=utf-8','.css':'text/css; charset=utf-8','.webp':'image/webp','.png':'image/png','.jpg':'image/jpeg','.glb':'model/gltf-binary','.json':'application/json','.txt':'text/plain; charset=utf-8','.svg':'image/svg+xml'};
const server=http.createServer(async(req,res)=>{
 if(!['GET','HEAD'].includes(req.method)){res.writeHead(405);res.end();return;}
 try{
  const url=new URL(req.url,'http://localhost');
  let name=decodeURIComponent(url.pathname);
  let target=path.resolve(root,'.'+name);
  const relative=path.relative(root,target);
  if(relative.startsWith('..')||path.isAbsolute(relative)){res.writeHead(403);res.end();return;}
  if((await stat(target)).isDirectory())target=path.join(target,'index.html');
  const data=await readFile(target);
  res.writeHead(200,{'Content-Type':types[path.extname(target)]||'application/octet-stream','Content-Length':data.length,'Cache-Control':'no-cache','X-Content-Type-Options':'nosniff'});
  res.end(req.method==='HEAD'?undefined:data);
 }catch{res.writeHead(404,{'Content-Type':'text/plain'});res.end('File not found');}
});
server.on('error',err=>{console.error(err.code==='EADDRINUSE'?'Port 4173 is already in use. Close the other game server, or set PORT to another port.':err.message);process.exitCode=1;});
server.listen(port,'127.0.0.1',()=>{
 const url='http://127.0.0.1:'+port+'/';
 console.log('Grand City 2099 — full game');console.log('Open '+url);console.log('Keep this window open while playing. Press Ctrl+C to stop.');
 if(process.argv.includes('--open')){
  const command=process.platform==='win32'?['cmd',['/c','start','',url]]:process.platform==='darwin'?['open',[url]]:['xdg-open',[url]];
  const child=spawn(command[0],command[1],{stdio:'ignore',detached:true});child.on('error',()=>{});child.unref();
 }
});
