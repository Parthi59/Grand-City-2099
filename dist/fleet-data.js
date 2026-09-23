export const VEHICLES = [
 {id:'vanta',name:'VANTA S6',label:'Sleek sport bike',kind:'bike',design:'sport',color:'#ee704d',accent:'#ffe2b1',max:49,accel:13.5,brake:27,grip:1.06,mass:195,wheelbase:1.5,length:2.18,width:.78,seat:.81,engine:'sport'},
 {id:'spectre',name:'SPECTRE RR',label:'Futuristic superbike',kind:'bike',design:'super',color:'#c9e3e4',accent:'#47efe1',max:61,accel:17,brake:30,grip:.97,mass:218,wheelbase:1.54,length:2.25,width:.83,seat:.83,engine:'electric'},
 {id:'brutus',name:'BRUTUS 900',label:'Heavy power bike',kind:'bike',design:'heavy',color:'#303b43',accent:'#ffc062',max:43,accel:10,brake:22,grip:.8,mass:310,wheelbase:1.8,length:2.5,width:.95,seat:.73,engine:'heavy'},
 {id:'kite',name:'KITE 450',label:'Agile street bike',kind:'bike',design:'street',color:'#d2ee75',accent:'#edfff3',max:40,accel:12,brake:26,grip:1.3,mass:160,wheelbase:1.4,length:2.04,width:.78,seat:.79,engine:'street'},
 {id:'aether',name:'AETHER ONE',label:'Premium concept bike',kind:'bike',design:'concept',color:'#ece8f3',accent:'#9678ef',max:56,accel:15,brake:31,grip:1.15,mass:205,wheelbase:1.55,length:2.3,width:.81,seat:.82,engine:'electric'},
 {id:'strada',name:'STRADA GT',label:'Sports coupe',kind:'car',design:'sport',color:'#c95e45',accent:'#fbf0d2',max:58,accel:10.5,brake:24,grip:1.0,mass:1460,wheelbase:2.65,length:4.5,width:1.92,height:1.25,engine:'sport'},
 {id:'civic',name:'MERIDIAN',label:'Executive sedan',kind:'car',design:'sedan',color:'#8698aa',accent:'#e7f9ff',max:43,accel:7,brake:20,grip:.92,mass:1770,wheelbase:2.85,length:4.7,width:1.85,height:1.48,engine:'sedan'},
 {id:'atlas',name:'ATLAS X',label:'Utility SUV',kind:'car',design:'suv',color:'#798274',accent:'#e3f2c5',max:39,accel:6,brake:18,grip:.75,mass:2400,wheelbase:2.9,length:4.85,width:2.03,height:1.84,engine:'heavy'},
 {id:'flux',name:'FLUX E4',label:'Futuristic EV',kind:'car',design:'ev',color:'#e3e0ce',accent:'#72e5dd',max:48,accel:11,brake:24,grip:1.08,mass:1950,wheelbase:2.8,length:4.4,width:1.91,height:1.4,engine:'electric'},
 {id:'elysian',name:'ELYSIAN 01',label:'Premium concept car',kind:'car',design:'concept',color:'#746c9d',accent:'#c7afff',max:63,accel:13,brake:27,grip:1.1,mass:1660,wheelbase:2.9,length:4.8,width:2.05,height:1.18,engine:'electric'},
 {id:'sentinel',name:'SENTINEL',label:'Security interceptor',kind:'car',design:'security',color:'#d9dedc',accent:'#6a9dff',max:51,accel:10,brake:25,grip:1.05,mass:1870,wheelbase:2.8,length:4.7,width:1.93,height:1.5,engine:'security'},
 {"id": "pulse", "name": "PULSE RS", "label": "Compact hot hatch", "kind": "car", "design": "hatch", "color": "#277a87", "accent": "#e9f4f4", "max": 44, "accel": 9, "brake": 23, "grip": 1.2, "mass": 1280, "wheelbase": 2.5, "length": 3.95, "width": 1.78, "height": 1.46, "engine": "sport"},
 {"id": "crown", "name": "CROWN V8", "label": "Long-hood muscle coupe", "kind": "car", "design": "muscle", "color": "#5d3148", "accent": "#e9f4f4", "max": 55, "accel": 11, "brake": 22, "grip": 0.9, "mass": 1820, "wheelbase": 2.9, "length": 5.0, "width": 2.0, "height": 1.33, "engine": "heavy"},
 {"id": "solace", "name": "SOLACE CABRIO", "label": "Open-top roadster", "kind": "car", "design": "roadster", "color": "#e4bf78", "accent": "#e9f4f4", "max": 54, "accel": 10, "brake": 25, "grip": 1.16, "mass": 1330, "wheelbase": 2.55, "length": 4.2, "width": 1.84, "height": 1.18, "engine": "sport"},
 {"id": "nomad", "name": "NOMAD TOURING", "label": "Family estate", "kind": "car", "design": "wagon", "color": "#415e86", "accent": "#e9f4f4", "max": 43, "accel": 7.8, "brake": 21, "grip": 0.98, "mass": 1790, "wheelbase": 2.85, "length": 4.95, "width": 1.9, "height": 1.53, "engine": "sedan"},
 {"id": "titan", "name": "TITAN CREW", "label": "Utility pickup", "kind": "car", "design": "pickup", "color": "#8f4d31", "accent": "#e9f4f4", "max": 40, "accel": 6.5, "brake": 20, "grip": 0.73, "mass": 2650, "wheelbase": 3.3, "length": 5.6, "width": 2.14, "height": 1.95, "engine": "heavy"},
 {"id": "courier", "name": "CARGO 240", "label": "City delivery van", "kind": "car", "design": "van", "color": "#d1d5cb", "accent": "#e9f4f4", "max": 35, "accel": 5, "brake": 18, "grip": 0.7, "mass": 2500, "wheelbase": 3.15, "length": 5.2, "width": 2.05, "height": 2.28, "engine": "heavy"},
 {"id": "regent", "name": "REGENT L", "label": "Long-wheelbase limousine", "kind": "car", "design": "limo", "color": "#252b36", "accent": "#e9f4f4", "max": 46, "accel": 7.1, "brake": 22, "grip": 0.83, "mass": 2250, "wheelbase": 3.55, "length": 5.8, "width": 1.98, "height": 1.52, "engine": "sedan"},
 {"id": "apex", "name": "APEX R", "label": "Mid-engine hypercar", "kind": "car", "design": "hyper", "color": "#adb941", "accent": "#e9f4f4", "max": 70, "accel": 15, "brake": 31, "grip": 1.23, "mass": 1430, "wheelbase": 2.8, "length": 4.68, "width": 2.08, "height": 1.08, "engine": "sport"},
 {"id": "metro", "name": "METRO CAB", "label": "City taxi", "kind": "car", "design": "taxi", "color": "#d4ab37", "accent": "#e9f4f4", "max": 41, "accel": 7.4, "brake": 22, "grip": 0.94, "mass": 1690, "wheelbase": 2.73, "length": 4.6, "width": 1.84, "height": 1.5, "engine": "sedan"},
 {"id": "warden", "name": "WARDEN X", "label": "Police response SUV", "kind": "car", "design": "suv", "color": "#e2e6e5", "accent": "#e9f4f4", "max": 48, "accel": 9.5, "brake": 26, "grip": 0.91, "mass": 2510, "wheelbase": 2.98, "length": 5.05, "width": 2.08, "height": 1.92, "engine": "security"}
];
export const vehicleById=id=>VEHICLES.find(v=>v.id===id)||VEHICLES[0];
export const GARAGE={x:24,z:166,radius:30};
export function createFleet(){
 const fleet=[];
 const add=(type,x,z,heading=0,extra={})=>{fleet.push({uid:'vehicle-'+fleet.length,type,x,z,heading,speed:0,steering:0,distance:0,door:0,...extra});};
 VEHICLES.slice(0,5).forEach((v,i)=>add(v.id,18+i*3.4,166,Math.PI,{garage:true}));
 add('strada',5,170);add('flux',-5,156,Math.PI);add('atlas',5,144);add('elysian',5,132);
 for(let i=0;i<24;i++){const axis=i%2?'x':'z',dir=i%4<2?1:-1,lane=(Math.floor(i/4)-3)*100;const along=-275+(i*83)%560;add(VEHICLES.filter(v=>v.kind==='car'&&v.engine!=='security')[i%14].id,axis==='z'?lane-dir*4.6:along,axis==='x'?lane+dir*4.6:along,axis==='z'?(dir>0?Math.PI:0):(dir>0?Math.PI/2:-Math.PI/2),{driver:{health:100,temper:i%3},traffic:true,axis,dir,cruise:7+(i%5)*1.6,speed:7});}
 for(let i=0;i<18;i++){const road=(i%5-2)*100;add(VEHICLES[(i%3===0?i%5:5+i%6)].id,road+8.2,-255+(i*41)%520,0);}
 for(const [i,type] of ['pulse','crown','solace','nomad','titan','courier','regent','apex','metro','warden'].entries())add(type,5,118-i*13,0);
 add('metro',-4.6,172,Math.PI,{traffic:true,axis:'z',dir:1,cruise:9,speed:0,stopTimer:60,driver:{health:100,temper:1}});
 for(let i=0;i<11;i++){const axis=i%2?'x':'z',dir=i%4<2?1:-1,lane=(Math.floor(i/4)-1)*100,along=-255+i*51;add(VEHICLES[i%5].id,axis==='z'?lane-dir*6.5:along,axis==='x'?lane+dir*6.5:along,axis==='z'?(dir>0?Math.PI:0):(dir>0?Math.PI/2:-Math.PI/2),{traffic:true,axis,dir,cruise:10+i%3*2,speed:8,driver:{health:100,rider:true}});}
 return fleet;
}
