(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))n(i);new MutationObserver(i=>{for(const r of i)if(r.type==="childList")for(const o of r.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&n(o)}).observe(document,{childList:!0,subtree:!0});function t(i){const r={};return i.integrity&&(r.integrity=i.integrity),i.referrerPolicy&&(r.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?r.credentials="include":i.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function n(i){if(i.ep)return;i.ep=!0;const r=t(i);fetch(i.href,r)}})();class Ju{constructor(e=()=>{},t){this.onStatus=e,this.contextFactory=t,this.enabled=!0,this.volume=.62,this.music=!1,this.status="ready",this.ctx=null,this.pending=null,this.nextStep=0,this.nextBird=0,this.nextMusic=0,this.previousHealth=100;try{const n=JSON.parse(localStorage.getItem("nightfall-audio"));n&&(this.volume=Math.max(0,Math.min(1,n.volume??.62)),this.enabled=n.enabled!==!1,this.music=!!n.music)}catch{}}report(e){this.status=e,this.onStatus(e)}persist(){try{localStorage.setItem("nightfall-audio",JSON.stringify({volume:this.volume,enabled:this.enabled,music:this.music}))}catch{}}build(){const e=this.contextFactory||globalThis.AudioContext||globalThis.webkitAudioContext;if(!e)throw new Error("Audio is unavailable");const t=this.ctx=new e;this.master=t.createGain(),this.master.gain.value=this.volume;const n=t.createDynamicsCompressor();n.threshold.value=-14,n.knee.value=15,n.ratio.value=5,this.analyser=t.createAnalyser(),this.analyser.fftSize=256,this.samples=new Uint8Array(256),this.master.connect(n),n.connect(this.analyser),this.analyser.connect(t.destination);const i=(l,c)=>{const h=t.createOscillator(),u=t.createGain();return h.type=l,h.frequency.value=c,u.gain.value=0,h.connect(u),u.connect(this.master),h.start(),[h,u]};[this.motor,this.motorGain]=i("sawtooth",72),[this.sub,this.subGain]=i("triangle",36),[this.whine,this.whineGain]=i("sine",240),[this.siren,this.sirenGain]=i("sine",600),[this.traffic,this.trafficGain]=i("triangle",88),this.motor.disconnect(),this.motorFilter=t.createBiquadFilter(),this.motorFilter.type="lowpass",this.motorFilter.frequency.value=700,this.motorFilter.Q.value=.7,this.motor.connect(this.motorFilter),this.motorFilter.connect(this.motorGain);const r=t.createBuffer(1,t.sampleRate*2,t.sampleRate),o=r.getChannelData(0);for(let l=0;l<o.length;l++)o[l]=Math.random()*2-1;this.noiseBuffer=r;const a=(l,c="lowpass")=>{const h=t.createBufferSource(),u=t.createBiquadFilter(),d=t.createGain();return h.buffer=r,h.loop=!0,u.type=c,u.frequency.value=l,d.gain.value=0,h.connect(u),u.connect(d),d.connect(this.master),h.start(),d};this.ambientGain=a(180),this.windGain=a(1050),this.brakeGain=a(2600,"bandpass"),this.boostGain=a(1700,"bandpass"),t.onstatechange=()=>this.report(this.enabled?t.state==="running"?"on":t.state==="closed"?"unavailable":"blocked":"off")}unlock(){if(!this.enabled)return Promise.resolve(!1);if(this.pending)return this.pending;try{return(!this.ctx||this.ctx.state==="closed")&&this.build(),this.ctx.state==="running"?(this.report("on"),Promise.resolve(!0)):(this.pending=Promise.resolve(this.ctx.resume()).then(()=>{if(!this.enabled)return this.report("off"),!1;const e=this.ctx.state==="running";return this.report(e?"on":"blocked"),e}).catch(()=>(this.report(this.enabled?"blocked":"off"),!1)).finally(()=>this.pending=null),this.pending)}catch{return this.report("unavailable"),Promise.resolve(!1)}}async setEnabled(e){if(this.enabled=e,this.persist(),!e)return this.silence(),this.report("off"),!1;const t=await this.unlock();return t&&(this.master.gain.setTargetAtTime(this.volume,this.ctx.currentTime,.02),this.cue("click")),t}setVolume(e){this.volume=Math.max(0,Math.min(1,e)),this.persist(),this.ctx&&this.master.gain.setTargetAtTime(this.enabled?this.volume:0,this.ctx.currentTime,.02)}tone(e=440,t=.12,n=.13,i=0,r=e*.98,o="sine"){var u;if(!this.enabled||((u=this.ctx)==null?void 0:u.state)!=="running")return;const a=this.ctx,l=a.currentTime+i,c=a.createOscillator(),h=a.createGain();c.type=o,c.frequency.setValueAtTime(e,l),c.frequency.exponentialRampToValueAtTime(Math.max(30,r),l+t),h.gain.setValueAtTime(.001,l),h.gain.exponentialRampToValueAtTime(n,l+.01),h.gain.exponentialRampToValueAtTime(.001,l+t),c.connect(h),h.connect(this.master),c.start(l),c.stop(l+t+.02),c.onended=()=>{c.disconnect(),h.disconnect()}}burst(e=.12,t=.2,n=500){var c;if(!this.enabled||((c=this.ctx)==null?void 0:c.state)!=="running")return;const i=this.ctx,r=i.currentTime,o=i.createBufferSource(),a=i.createGain(),l=i.createBiquadFilter();o.buffer=this.noiseBuffer,l.frequency.value=n,o.connect(l),l.connect(a),a.connect(this.master),a.gain.setValueAtTime(t,r),a.gain.exponentialRampToValueAtTime(.001,r+e),o.start(r),o.stop(r+e+.01),o.onended=()=>{o.disconnect(),a.disconnect(),l.disconnect()}}cue(e){e==="shot-sidearm"&&(this.burst(.16,.7,3100),this.tone(135,.16,.25,0,42,"triangle"),this.tone(88,.13,.05,.16,35)),e==="shot-carbine"&&(this.burst(.105,.53,2450),this.tone(110,.095,.22,0,48,"triangle")),e==="reload"&&(this.burst(.08,.18,2600),this.tone(230,.06,.07,.1,95)),(e==="reloadDone"||e==="equip")&&(this.burst(.065,.18,1700),this.tone(340,.06,.07,0,150)),e==="empty"&&this.burst(.027,.13,3500),e==="hitMetal"&&(this.tone(2100,.16,.055,0,670,"triangle"),this.burst(.07,.18,3400)),e==="hitBody"&&this.burst(.08,.17,360),e==="incoming"&&(this.burst(.12,.32,800),this.tone(70,.15,.12,0,35)),e==="click"&&this.tone(720,.065,.12),e==="door"&&(this.burst(.14,.3,400),this.tone(100,.1,.1)),e==="impact"&&(this.burst(.4,.7,1200),this.tone(68,.3,.3,0,30)),e==="checkpoint"&&[660,880].forEach((t,n)=>this.tone(t,.15,.13,n*.08)),e==="mission"&&[330,440,660].forEach((t,n)=>this.tone(t,.22,.15,n*.1)),e==="reward"&&[523,659,784,1046].forEach((t,n)=>this.tone(t,.35,.16,n*.12)),e==="test"&&(this.tone(440,.3,.19),this.tone(660,.3,.19,.36),this.tone(880,.4,.19,.72))}level(){return this.analyser?(this.analyser.getByteTimeDomainData(this.samples),Math.sqrt(this.samples.reduce((e,t)=>e+((t-128)/128)**2,0)/this.samples.length)):0}update(e,t){const n=this.ctx;if(!n||n.state!=="running"){e.events.length=0;return}const i=n.currentTime,r=e.phase==="playing"&&this.enabled,o=r&&e.mode!=="foot"&&!e.transition,a=Math.abs(e.speed||0),l=(t==null?void 0:t.engine)==="electric",c=(t==null?void 0:t.engine)==="heavy",h=e.throttle||0,u=(p,M,y=.1)=>p.setTargetAtTime(M,i,y);u(this.master.gain,this.enabled?this.volume:0,.025);const d=55+a%12*7+h*22;u(this.motor.frequency,c?d*.57:l?d*1.8:d),u(this.sub.frequency,c?d*.28:d*.5),u(this.motorFilter.frequency,280+h*750+a*15),u(this.motorGain.gain,o?(l?.032:c?.17:.13)*(1+h*.4):0),u(this.subGain.gain,o?l?.035:.09:0),u(this.whine.frequency,l?180+a*21:220+a*9),u(this.whineGain.gain,o?l?.08:e.boosting?.07:.015:0),u(this.ambientGain.gain,r?.13:0,.3),u(this.windGain.gain,r?Math.min(.22,a*.004):0,.2),u(this.boostGain.gain,r&&e.boosting?.13:0),u(this.brakeGain.gain,o&&e.braking&&a>6?Math.min(.1,a*.002):0);const f=(e.cops||[]).reduce((p,M)=>Math.min(p,Math.hypot(M.x-e.x,M.z-e.z)),1/0),g=r&&e.wanted>0?Math.max(0,1-f/115)*.1:0;u(this.siren.frequency,650+Math.sin(i*4.8)*240,.05),u(this.sirenGain.gain,g);let x=0,m=0;for(const p of e.vehicles||[]){if(!p.traffic)continue;const M=Math.hypot(p.x-e.x,p.z-e.z);M<40&&(x+=.018*(1-M/40),m=Math.max(m,p.speed))}if(u(this.trafficGain.gain,r?Math.min(.07,x):0),u(this.traffic.frequency,65+m*5),r&&e.mode==="foot"&&!e.transition&&a>.6&&i>=this.nextStep&&(this.burst(.065,.15,350),this.tone(95,.07,.08),this.nextStep=i+(e.sprinting?.23:a>2?.32:.5)),r&&i>this.nextBird&&(this.tone(1650,.13,.026,0,2300),this.tone(1900,.12,.02,.18,1350),this.nextBird=i+9+Math.random()*7),r&&this.music&&i>this.nextMusic&&([130.81,164.81,196].forEach((p,M)=>this.tone(p,3.8,.018,M*.4,p)),this.nextMusic=i+5),r)for(const p of e.events)this.cue(p);e.events.length=0}silence(){this.ctx&&this.master&&this.master.gain.setTargetAtTime(0,this.ctx.currentTime,.02)}}/**
 * @license
 * Copyright 2010-2025 Three.js Authors
 * SPDX-License-Identifier: MIT
 */const Ec="180",Zu=0,nl=1,$u=2,Nh=1,Uh=2,ni=3,ui=0,tn=1,Ct=2,Pi=0,Ss=1,il=2,sl=3,rl=4,Qu=5,Yi=100,ed=101,td=102,nd=103,id=104,sd=200,rd=201,od=202,ad=203,Ea=204,Ta=205,cd=206,ld=207,hd=208,ud=209,dd=210,fd=211,pd=212,md=213,gd=214,wa=0,Aa=1,Ra=2,ws=3,Ca=4,Ia=5,Pa=6,La=7,Fh=0,_d=1,xd=2,Li=0,vd=1,Md=2,yd=3,Oh=4,bd=5,Sd=6,Ed=7,ol="attached",Td="detached",zh=300,As=301,Rs=302,co=303,Da=304,Mo=306,Zi=1e3,Ai=1001,lo=1002,$t=1003,Bh=1004,$s=1005,pn=1006,eo=1007,ri=1008,Gn=1009,kh=1010,Hh=1011,ar=1012,Tc=1013,$i=1014,Pn=1015,_r=1016,wc=1017,Ac=1018,cr=1020,Vh=35902,Gh=35899,Wh=1021,Xh=1022,En=1023,lr=1026,hr=1027,Rc=1028,Cc=1029,qh=1030,Ic=1031,Pc=1033,to=33776,no=33777,io=33778,so=33779,Na=35840,Ua=35841,Fa=35842,Oa=35843,za=36196,Ba=37492,ka=37496,Ha=37808,Va=37809,Ga=37810,Wa=37811,Xa=37812,qa=37813,Ya=37814,ja=37815,Ka=37816,Ja=37817,Za=37818,$a=37819,Qa=37820,ec=37821,tc=36492,nc=36494,ic=36495,sc=36283,rc=36284,oc=36285,ac=36286,wd=2200,Ad=2201,Rd=2202,ur=2300,dr=2301,Io=2302,Ms=2400,ys=2401,ho=2402,Lc=2500,Cd=2501,Id=0,Yh=1,cc=2,Pd=3200,Ld=3201,jh=0,Dd=1,wi="",Mt="srgb",Qt="srgb-linear",uo="linear",_t="srgb",ss=7680,al=519,Nd=512,Ud=513,Fd=514,Kh=515,Od=516,zd=517,Bd=518,kd=519,lc=35044,cl="300 es",kn=2e3,fo=2001;class ts{addEventListener(e,t){this._listeners===void 0&&(this._listeners={});const n=this._listeners;n[e]===void 0&&(n[e]=[]),n[e].indexOf(t)===-1&&n[e].push(t)}hasEventListener(e,t){const n=this._listeners;return n===void 0?!1:n[e]!==void 0&&n[e].indexOf(t)!==-1}removeEventListener(e,t){const n=this._listeners;if(n===void 0)return;const i=n[e];if(i!==void 0){const r=i.indexOf(t);r!==-1&&i.splice(r,1)}}dispatchEvent(e){const t=this._listeners;if(t===void 0)return;const n=t[e.type];if(n!==void 0){e.target=this;const i=n.slice(0);for(let r=0,o=i.length;r<o;r++)i[r].call(this,e);e.target=null}}}const Vt=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"];let ll=1234567;const er=Math.PI/180,Cs=180/Math.PI;function Dn(){const s=Math.random()*4294967295|0,e=Math.random()*4294967295|0,t=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Vt[s&255]+Vt[s>>8&255]+Vt[s>>16&255]+Vt[s>>24&255]+"-"+Vt[e&255]+Vt[e>>8&255]+"-"+Vt[e>>16&15|64]+Vt[e>>24&255]+"-"+Vt[t&63|128]+Vt[t>>8&255]+"-"+Vt[t>>16&255]+Vt[t>>24&255]+Vt[n&255]+Vt[n>>8&255]+Vt[n>>16&255]+Vt[n>>24&255]).toLowerCase()}function et(s,e,t){return Math.max(e,Math.min(t,s))}function Dc(s,e){return(s%e+e)%e}function Hd(s,e,t,n,i){return n+(s-e)*(i-n)/(t-e)}function Vd(s,e,t){return s!==e?(t-s)/(e-s):0}function tr(s,e,t){return(1-t)*s+t*e}function Gd(s,e,t,n){return tr(s,e,1-Math.exp(-t*n))}function Wd(s,e=1){return e-Math.abs(Dc(s,e*2)-e)}function Xd(s,e,t){return s<=e?0:s>=t?1:(s=(s-e)/(t-e),s*s*(3-2*s))}function qd(s,e,t){return s<=e?0:s>=t?1:(s=(s-e)/(t-e),s*s*s*(s*(s*6-15)+10))}function Yd(s,e){return s+Math.floor(Math.random()*(e-s+1))}function jd(s,e){return s+Math.random()*(e-s)}function Kd(s){return s*(.5-Math.random())}function Jd(s){s!==void 0&&(ll=s);let e=ll+=1831565813;return e=Math.imul(e^e>>>15,e|1),e^=e+Math.imul(e^e>>>7,e|61),((e^e>>>14)>>>0)/4294967296}function Zd(s){return s*er}function $d(s){return s*Cs}function Qd(s){return(s&s-1)===0&&s!==0}function ef(s){return Math.pow(2,Math.ceil(Math.log(s)/Math.LN2))}function tf(s){return Math.pow(2,Math.floor(Math.log(s)/Math.LN2))}function nf(s,e,t,n,i){const r=Math.cos,o=Math.sin,a=r(t/2),l=o(t/2),c=r((e+n)/2),h=o((e+n)/2),u=r((e-n)/2),d=o((e-n)/2),f=r((n-e)/2),g=o((n-e)/2);switch(i){case"XYX":s.set(a*h,l*u,l*d,a*c);break;case"YZY":s.set(l*d,a*h,l*u,a*c);break;case"ZXZ":s.set(l*u,l*d,a*h,a*c);break;case"XZX":s.set(a*h,l*g,l*f,a*c);break;case"YXY":s.set(l*f,a*h,l*g,a*c);break;case"ZYZ":s.set(l*g,l*f,a*h,a*c);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+i)}}function Cn(s,e){switch(e.constructor){case Float32Array:return s;case Uint32Array:return s/4294967295;case Uint16Array:return s/65535;case Uint8Array:return s/255;case Int32Array:return Math.max(s/2147483647,-1);case Int16Array:return Math.max(s/32767,-1);case Int8Array:return Math.max(s/127,-1);default:throw new Error("Invalid component type.")}}function pt(s,e){switch(e.constructor){case Float32Array:return s;case Uint32Array:return Math.round(s*4294967295);case Uint16Array:return Math.round(s*65535);case Uint8Array:return Math.round(s*255);case Int32Array:return Math.round(s*2147483647);case Int16Array:return Math.round(s*32767);case Int8Array:return Math.round(s*127);default:throw new Error("Invalid component type.")}}const po={DEG2RAD:er,RAD2DEG:Cs,generateUUID:Dn,clamp:et,euclideanModulo:Dc,mapLinear:Hd,inverseLerp:Vd,lerp:tr,damp:Gd,pingpong:Wd,smoothstep:Xd,smootherstep:qd,randInt:Yd,randFloat:jd,randFloatSpread:Kd,seededRandom:Jd,degToRad:Zd,radToDeg:$d,isPowerOfTwo:Qd,ceilPowerOfTwo:ef,floorPowerOfTwo:tf,setQuaternionFromProperEuler:nf,normalize:pt,denormalize:Cn};class Oe{constructor(e=0,t=0){Oe.prototype.isVector2=!0,this.x=e,this.y=t}get width(){return this.x}set width(e){this.x=e}get height(){return this.y}set height(e){this.y=e}set(e,t){return this.x=e,this.y=t,this}setScalar(e){return this.x=e,this.y=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y)}copy(e){return this.x=e.x,this.y=e.y,this}add(e){return this.x+=e.x,this.y+=e.y,this}addScalar(e){return this.x+=e,this.y+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this}subScalar(e){return this.x-=e,this.y-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this}multiply(e){return this.x*=e.x,this.y*=e.y,this}multiplyScalar(e){return this.x*=e,this.y*=e,this}divide(e){return this.x/=e.x,this.y/=e.y,this}divideScalar(e){return this.multiplyScalar(1/e)}applyMatrix3(e){const t=this.x,n=this.y,i=e.elements;return this.x=i[0]*t+i[3]*n+i[6],this.y=i[1]*t+i[4]*n+i[7],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this}clamp(e,t){return this.x=et(this.x,e.x,t.x),this.y=et(this.y,e.y,t.y),this}clampScalar(e,t){return this.x=et(this.x,e,t),this.y=et(this.y,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(et(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(e){return this.x*e.x+this.y*e.y}cross(e){return this.x*e.y-this.y*e.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(et(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y;return t*t+n*n}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this}equals(e){return e.x===this.x&&e.y===this.y}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this}rotateAround(e,t){const n=Math.cos(t),i=Math.sin(t),r=this.x-e.x,o=this.y-e.y;return this.x=r*n-o*i+e.x,this.y=r*i+o*n+e.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}}class qt{constructor(e=0,t=0,n=0,i=1){this.isQuaternion=!0,this._x=e,this._y=t,this._z=n,this._w=i}static slerpFlat(e,t,n,i,r,o,a){let l=n[i+0],c=n[i+1],h=n[i+2],u=n[i+3];const d=r[o+0],f=r[o+1],g=r[o+2],x=r[o+3];if(a===0){e[t+0]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u;return}if(a===1){e[t+0]=d,e[t+1]=f,e[t+2]=g,e[t+3]=x;return}if(u!==x||l!==d||c!==f||h!==g){let m=1-a;const p=l*d+c*f+h*g+u*x,M=p>=0?1:-1,y=1-p*p;if(y>Number.EPSILON){const w=Math.sqrt(y),S=Math.atan2(w,p*M);m=Math.sin(m*S)/w,a=Math.sin(a*S)/w}const v=a*M;if(l=l*m+d*v,c=c*m+f*v,h=h*m+g*v,u=u*m+x*v,m===1-a){const w=1/Math.sqrt(l*l+c*c+h*h+u*u);l*=w,c*=w,h*=w,u*=w}}e[t]=l,e[t+1]=c,e[t+2]=h,e[t+3]=u}static multiplyQuaternionsFlat(e,t,n,i,r,o){const a=n[i],l=n[i+1],c=n[i+2],h=n[i+3],u=r[o],d=r[o+1],f=r[o+2],g=r[o+3];return e[t]=a*g+h*u+l*f-c*d,e[t+1]=l*g+h*d+c*u-a*f,e[t+2]=c*g+h*f+a*d-l*u,e[t+3]=h*g-a*u-l*d-c*f,e}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get w(){return this._w}set w(e){this._w=e,this._onChangeCallback()}set(e,t,n,i){return this._x=e,this._y=t,this._z=n,this._w=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(e){return this._x=e.x,this._y=e.y,this._z=e.z,this._w=e.w,this._onChangeCallback(),this}setFromEuler(e,t=!0){const n=e._x,i=e._y,r=e._z,o=e._order,a=Math.cos,l=Math.sin,c=a(n/2),h=a(i/2),u=a(r/2),d=l(n/2),f=l(i/2),g=l(r/2);switch(o){case"XYZ":this._x=d*h*u+c*f*g,this._y=c*f*u-d*h*g,this._z=c*h*g+d*f*u,this._w=c*h*u-d*f*g;break;case"YXZ":this._x=d*h*u+c*f*g,this._y=c*f*u-d*h*g,this._z=c*h*g-d*f*u,this._w=c*h*u+d*f*g;break;case"ZXY":this._x=d*h*u-c*f*g,this._y=c*f*u+d*h*g,this._z=c*h*g+d*f*u,this._w=c*h*u-d*f*g;break;case"ZYX":this._x=d*h*u-c*f*g,this._y=c*f*u+d*h*g,this._z=c*h*g-d*f*u,this._w=c*h*u+d*f*g;break;case"YZX":this._x=d*h*u+c*f*g,this._y=c*f*u+d*h*g,this._z=c*h*g-d*f*u,this._w=c*h*u-d*f*g;break;case"XZY":this._x=d*h*u-c*f*g,this._y=c*f*u-d*h*g,this._z=c*h*g+d*f*u,this._w=c*h*u+d*f*g;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+o)}return t===!0&&this._onChangeCallback(),this}setFromAxisAngle(e,t){const n=t/2,i=Math.sin(n);return this._x=e.x*i,this._y=e.y*i,this._z=e.z*i,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(e){const t=e.elements,n=t[0],i=t[4],r=t[8],o=t[1],a=t[5],l=t[9],c=t[2],h=t[6],u=t[10],d=n+a+u;if(d>0){const f=.5/Math.sqrt(d+1);this._w=.25/f,this._x=(h-l)*f,this._y=(r-c)*f,this._z=(o-i)*f}else if(n>a&&n>u){const f=2*Math.sqrt(1+n-a-u);this._w=(h-l)/f,this._x=.25*f,this._y=(i+o)/f,this._z=(r+c)/f}else if(a>u){const f=2*Math.sqrt(1+a-n-u);this._w=(r-c)/f,this._x=(i+o)/f,this._y=.25*f,this._z=(l+h)/f}else{const f=2*Math.sqrt(1+u-n-a);this._w=(o-i)/f,this._x=(r+c)/f,this._y=(l+h)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(e,t){let n=e.dot(t)+1;return n<1e-8?(n=0,Math.abs(e.x)>Math.abs(e.z)?(this._x=-e.y,this._y=e.x,this._z=0,this._w=n):(this._x=0,this._y=-e.z,this._z=e.y,this._w=n)):(this._x=e.y*t.z-e.z*t.y,this._y=e.z*t.x-e.x*t.z,this._z=e.x*t.y-e.y*t.x,this._w=n),this.normalize()}angleTo(e){return 2*Math.acos(Math.abs(et(this.dot(e),-1,1)))}rotateTowards(e,t){const n=this.angleTo(e);if(n===0)return this;const i=Math.min(1,t/n);return this.slerp(e,i),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(e){return this._x*e._x+this._y*e._y+this._z*e._z+this._w*e._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let e=this.length();return e===0?(this._x=0,this._y=0,this._z=0,this._w=1):(e=1/e,this._x=this._x*e,this._y=this._y*e,this._z=this._z*e,this._w=this._w*e),this._onChangeCallback(),this}multiply(e){return this.multiplyQuaternions(this,e)}premultiply(e){return this.multiplyQuaternions(e,this)}multiplyQuaternions(e,t){const n=e._x,i=e._y,r=e._z,o=e._w,a=t._x,l=t._y,c=t._z,h=t._w;return this._x=n*h+o*a+i*c-r*l,this._y=i*h+o*l+r*a-n*c,this._z=r*h+o*c+n*l-i*a,this._w=o*h-n*a-i*l-r*c,this._onChangeCallback(),this}slerp(e,t){if(t===0)return this;if(t===1)return this.copy(e);const n=this._x,i=this._y,r=this._z,o=this._w;let a=o*e._w+n*e._x+i*e._y+r*e._z;if(a<0?(this._w=-e._w,this._x=-e._x,this._y=-e._y,this._z=-e._z,a=-a):this.copy(e),a>=1)return this._w=o,this._x=n,this._y=i,this._z=r,this;const l=1-a*a;if(l<=Number.EPSILON){const f=1-t;return this._w=f*o+t*this._w,this._x=f*n+t*this._x,this._y=f*i+t*this._y,this._z=f*r+t*this._z,this.normalize(),this}const c=Math.sqrt(l),h=Math.atan2(c,a),u=Math.sin((1-t)*h)/c,d=Math.sin(t*h)/c;return this._w=o*u+this._w*d,this._x=n*u+this._x*d,this._y=i*u+this._y*d,this._z=r*u+this._z*d,this._onChangeCallback(),this}slerpQuaternions(e,t,n){return this.copy(e).slerp(t,n)}random(){const e=2*Math.PI*Math.random(),t=2*Math.PI*Math.random(),n=Math.random(),i=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(i*Math.sin(e),i*Math.cos(e),r*Math.sin(t),r*Math.cos(t))}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._w===this._w}fromArray(e,t=0){return this._x=e[t],this._y=e[t+1],this._z=e[t+2],this._w=e[t+3],this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._w,e}fromBufferAttribute(e,t){return this._x=e.getX(t),this._y=e.getY(t),this._z=e.getZ(t),this._w=e.getW(t),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}}class P{constructor(e=0,t=0,n=0){P.prototype.isVector3=!0,this.x=e,this.y=t,this.z=n}set(e,t,n){return n===void 0&&(n=this.z),this.x=e,this.y=t,this.z=n,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this}multiplyVectors(e,t){return this.x=e.x*t.x,this.y=e.y*t.y,this.z=e.z*t.z,this}applyEuler(e){return this.applyQuaternion(hl.setFromEuler(e))}applyAxisAngle(e,t){return this.applyQuaternion(hl.setFromAxisAngle(e,t))}applyMatrix3(e){const t=this.x,n=this.y,i=this.z,r=e.elements;return this.x=r[0]*t+r[3]*n+r[6]*i,this.y=r[1]*t+r[4]*n+r[7]*i,this.z=r[2]*t+r[5]*n+r[8]*i,this}applyNormalMatrix(e){return this.applyMatrix3(e).normalize()}applyMatrix4(e){const t=this.x,n=this.y,i=this.z,r=e.elements,o=1/(r[3]*t+r[7]*n+r[11]*i+r[15]);return this.x=(r[0]*t+r[4]*n+r[8]*i+r[12])*o,this.y=(r[1]*t+r[5]*n+r[9]*i+r[13])*o,this.z=(r[2]*t+r[6]*n+r[10]*i+r[14])*o,this}applyQuaternion(e){const t=this.x,n=this.y,i=this.z,r=e.x,o=e.y,a=e.z,l=e.w,c=2*(o*i-a*n),h=2*(a*t-r*i),u=2*(r*n-o*t);return this.x=t+l*c+o*u-a*h,this.y=n+l*h+a*c-r*u,this.z=i+l*u+r*h-o*c,this}project(e){return this.applyMatrix4(e.matrixWorldInverse).applyMatrix4(e.projectionMatrix)}unproject(e){return this.applyMatrix4(e.projectionMatrixInverse).applyMatrix4(e.matrixWorld)}transformDirection(e){const t=this.x,n=this.y,i=this.z,r=e.elements;return this.x=r[0]*t+r[4]*n+r[8]*i,this.y=r[1]*t+r[5]*n+r[9]*i,this.z=r[2]*t+r[6]*n+r[10]*i,this.normalize()}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this}divideScalar(e){return this.multiplyScalar(1/e)}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this}clamp(e,t){return this.x=et(this.x,e.x,t.x),this.y=et(this.y,e.y,t.y),this.z=et(this.z,e.z,t.z),this}clampScalar(e,t){return this.x=et(this.x,e,t),this.y=et(this.y,e,t),this.z=et(this.z,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(et(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this}cross(e){return this.crossVectors(this,e)}crossVectors(e,t){const n=e.x,i=e.y,r=e.z,o=t.x,a=t.y,l=t.z;return this.x=i*l-r*a,this.y=r*o-n*l,this.z=n*a-i*o,this}projectOnVector(e){const t=e.lengthSq();if(t===0)return this.set(0,0,0);const n=e.dot(this)/t;return this.copy(e).multiplyScalar(n)}projectOnPlane(e){return Po.copy(this).projectOnVector(e),this.sub(Po)}reflect(e){return this.sub(Po.copy(e).multiplyScalar(2*this.dot(e)))}angleTo(e){const t=Math.sqrt(this.lengthSq()*e.lengthSq());if(t===0)return Math.PI/2;const n=this.dot(e)/t;return Math.acos(et(n,-1,1))}distanceTo(e){return Math.sqrt(this.distanceToSquared(e))}distanceToSquared(e){const t=this.x-e.x,n=this.y-e.y,i=this.z-e.z;return t*t+n*n+i*i}manhattanDistanceTo(e){return Math.abs(this.x-e.x)+Math.abs(this.y-e.y)+Math.abs(this.z-e.z)}setFromSpherical(e){return this.setFromSphericalCoords(e.radius,e.phi,e.theta)}setFromSphericalCoords(e,t,n){const i=Math.sin(t)*e;return this.x=i*Math.sin(n),this.y=Math.cos(t)*e,this.z=i*Math.cos(n),this}setFromCylindrical(e){return this.setFromCylindricalCoords(e.radius,e.theta,e.y)}setFromCylindricalCoords(e,t,n){return this.x=e*Math.sin(t),this.y=n,this.z=e*Math.cos(t),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this}setFromMatrixScale(e){const t=this.setFromMatrixColumn(e,0).length(),n=this.setFromMatrixColumn(e,1).length(),i=this.setFromMatrixColumn(e,2).length();return this.x=t,this.y=n,this.z=i,this}setFromMatrixColumn(e,t){return this.fromArray(e.elements,t*4)}setFromMatrix3Column(e,t){return this.fromArray(e.elements,t*3)}setFromEuler(e){return this.x=e._x,this.y=e._y,this.z=e._z,this}setFromColor(e){return this.x=e.r,this.y=e.g,this.z=e.b,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){const e=Math.random()*Math.PI*2,t=Math.random()*2-1,n=Math.sqrt(1-t*t);return this.x=n*Math.cos(e),this.y=t,this.z=n*Math.sin(e),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}}const Po=new P,hl=new qt;class $e{constructor(e,t,n,i,r,o,a,l,c){$e.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],e!==void 0&&this.set(e,t,n,i,r,o,a,l,c)}set(e,t,n,i,r,o,a,l,c){const h=this.elements;return h[0]=e,h[1]=i,h[2]=a,h[3]=t,h[4]=r,h[5]=l,h[6]=n,h[7]=o,h[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],this}extractBasis(e,t,n){return e.setFromMatrix3Column(this,0),t.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(e){const t=e.elements;return this.set(t[0],t[4],t[8],t[1],t[5],t[9],t[2],t[6],t[10]),this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,i=t.elements,r=this.elements,o=n[0],a=n[3],l=n[6],c=n[1],h=n[4],u=n[7],d=n[2],f=n[5],g=n[8],x=i[0],m=i[3],p=i[6],M=i[1],y=i[4],v=i[7],w=i[2],S=i[5],R=i[8];return r[0]=o*x+a*M+l*w,r[3]=o*m+a*y+l*S,r[6]=o*p+a*v+l*R,r[1]=c*x+h*M+u*w,r[4]=c*m+h*y+u*S,r[7]=c*p+h*v+u*R,r[2]=d*x+f*M+g*w,r[5]=d*m+f*y+g*S,r[8]=d*p+f*v+g*R,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[3]*=e,t[6]*=e,t[1]*=e,t[4]*=e,t[7]*=e,t[2]*=e,t[5]*=e,t[8]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8];return t*o*h-t*a*c-n*r*h+n*a*l+i*r*c-i*o*l}invert(){const e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8],u=h*o-a*c,d=a*l-h*r,f=c*r-o*l,g=t*u+n*d+i*f;if(g===0)return this.set(0,0,0,0,0,0,0,0,0);const x=1/g;return e[0]=u*x,e[1]=(i*c-h*n)*x,e[2]=(a*n-i*o)*x,e[3]=d*x,e[4]=(h*t-i*l)*x,e[5]=(i*r-a*t)*x,e[6]=f*x,e[7]=(n*l-c*t)*x,e[8]=(o*t-n*r)*x,this}transpose(){let e;const t=this.elements;return e=t[1],t[1]=t[3],t[3]=e,e=t[2],t[2]=t[6],t[6]=e,e=t[5],t[5]=t[7],t[7]=e,this}getNormalMatrix(e){return this.setFromMatrix4(e).invert().transpose()}transposeIntoArray(e){const t=this.elements;return e[0]=t[0],e[1]=t[3],e[2]=t[6],e[3]=t[1],e[4]=t[4],e[5]=t[7],e[6]=t[2],e[7]=t[5],e[8]=t[8],this}setUvTransform(e,t,n,i,r,o,a){const l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*o+c*a)+o+e,-i*c,i*l,-i*(-c*o+l*a)+a+t,0,0,1),this}scale(e,t){return this.premultiply(Lo.makeScale(e,t)),this}rotate(e){return this.premultiply(Lo.makeRotation(-e)),this}translate(e,t){return this.premultiply(Lo.makeTranslation(e,t)),this}makeTranslation(e,t){return e.isVector2?this.set(1,0,e.x,0,1,e.y,0,0,1):this.set(1,0,e,0,1,t,0,0,1),this}makeRotation(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,n,t,0,0,0,1),this}makeScale(e,t){return this.set(e,0,0,0,t,0,0,0,1),this}equals(e){const t=this.elements,n=e.elements;for(let i=0;i<9;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<9;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e}clone(){return new this.constructor().fromArray(this.elements)}}const Lo=new $e;function Jh(s){for(let e=s.length-1;e>=0;--e)if(s[e]>=65535)return!0;return!1}function fr(s){return document.createElementNS("http://www.w3.org/1999/xhtml",s)}function sf(){const s=fr("canvas");return s.style.display="block",s}const ul={};function pr(s){s in ul||(ul[s]=!0,console.warn(s))}function rf(s,e,t){return new Promise(function(n,i){function r(){switch(s.clientWaitSync(e,s.SYNC_FLUSH_COMMANDS_BIT,0)){case s.WAIT_FAILED:i();break;case s.TIMEOUT_EXPIRED:setTimeout(r,t);break;default:n()}}setTimeout(r,t)})}const dl=new $e().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),fl=new $e().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function of(){const s={enabled:!0,workingColorSpace:Qt,spaces:{},convert:function(i,r,o){return this.enabled===!1||r===o||!r||!o||(this.spaces[r].transfer===_t&&(i.r=li(i.r),i.g=li(i.g),i.b=li(i.b)),this.spaces[r].primaries!==this.spaces[o].primaries&&(i.applyMatrix3(this.spaces[r].toXYZ),i.applyMatrix3(this.spaces[o].fromXYZ)),this.spaces[o].transfer===_t&&(i.r=Es(i.r),i.g=Es(i.g),i.b=Es(i.b))),i},workingToColorSpace:function(i,r){return this.convert(i,this.workingColorSpace,r)},colorSpaceToWorking:function(i,r){return this.convert(i,r,this.workingColorSpace)},getPrimaries:function(i){return this.spaces[i].primaries},getTransfer:function(i){return i===wi?uo:this.spaces[i].transfer},getToneMappingMode:function(i){return this.spaces[i].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(i,r=this.workingColorSpace){return i.fromArray(this.spaces[r].luminanceCoefficients)},define:function(i){Object.assign(this.spaces,i)},_getMatrix:function(i,r,o){return i.copy(this.spaces[r].toXYZ).multiply(this.spaces[o].fromXYZ)},_getDrawingBufferColorSpace:function(i){return this.spaces[i].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(i=this.workingColorSpace){return this.spaces[i].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(i,r){return pr("THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),s.workingToColorSpace(i,r)},toWorkingColorSpace:function(i,r){return pr("THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),s.colorSpaceToWorking(i,r)}},e=[.64,.33,.3,.6,.15,.06],t=[.2126,.7152,.0722],n=[.3127,.329];return s.define({[Qt]:{primaries:e,whitePoint:n,transfer:uo,toXYZ:dl,fromXYZ:fl,luminanceCoefficients:t,workingColorSpaceConfig:{unpackColorSpace:Mt},outputColorSpaceConfig:{drawingBufferColorSpace:Mt}},[Mt]:{primaries:e,whitePoint:n,transfer:_t,toXYZ:dl,fromXYZ:fl,luminanceCoefficients:t,outputColorSpaceConfig:{drawingBufferColorSpace:Mt}}}),s}const ot=of();function li(s){return s<.04045?s*.0773993808:Math.pow(s*.9478672986+.0521327014,2.4)}function Es(s){return s<.0031308?s*12.92:1.055*Math.pow(s,.41666)-.055}let rs;class af{static getDataURL(e,t="image/png"){if(/^data:/i.test(e.src)||typeof HTMLCanvasElement>"u")return e.src;let n;if(e instanceof HTMLCanvasElement)n=e;else{rs===void 0&&(rs=fr("canvas")),rs.width=e.width,rs.height=e.height;const i=rs.getContext("2d");e instanceof ImageData?i.putImageData(e,0,0):i.drawImage(e,0,0,e.width,e.height),n=rs}return n.toDataURL(t)}static sRGBToLinear(e){if(typeof HTMLImageElement<"u"&&e instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&e instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&e instanceof ImageBitmap){const t=fr("canvas");t.width=e.width,t.height=e.height;const n=t.getContext("2d");n.drawImage(e,0,0,e.width,e.height);const i=n.getImageData(0,0,e.width,e.height),r=i.data;for(let o=0;o<r.length;o++)r[o]=li(r[o]/255)*255;return n.putImageData(i,0,0),t}else if(e.data){const t=e.data.slice(0);for(let n=0;n<t.length;n++)t instanceof Uint8Array||t instanceof Uint8ClampedArray?t[n]=Math.floor(li(t[n]/255)*255):t[n]=li(t[n]);return{data:t,width:e.width,height:e.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),e}}let cf=0;class Nc{constructor(e=null){this.isSource=!0,Object.defineProperty(this,"id",{value:cf++}),this.uuid=Dn(),this.data=e,this.dataReady=!0,this.version=0}getSize(e){const t=this.data;return typeof HTMLVideoElement<"u"&&t instanceof HTMLVideoElement?e.set(t.videoWidth,t.videoHeight,0):t instanceof VideoFrame?e.set(t.displayHeight,t.displayWidth,0):t!==null?e.set(t.width,t.height,t.depth||0):e.set(0,0,0),e}set needsUpdate(e){e===!0&&this.version++}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.images[this.uuid]!==void 0)return e.images[this.uuid];const n={uuid:this.uuid,url:""},i=this.data;if(i!==null){let r;if(Array.isArray(i)){r=[];for(let o=0,a=i.length;o<a;o++)i[o].isDataTexture?r.push(Do(i[o].image)):r.push(Do(i[o]))}else r=Do(i);n.url=r}return t||(e.images[this.uuid]=n),n}}function Do(s){return typeof HTMLImageElement<"u"&&s instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&s instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&s instanceof ImageBitmap?af.getDataURL(s):s.data?{data:Array.from(s.data),width:s.width,height:s.height,type:s.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}let lf=0;const No=new P;class Nt extends ts{constructor(e=Nt.DEFAULT_IMAGE,t=Nt.DEFAULT_MAPPING,n=Ai,i=Ai,r=pn,o=ri,a=En,l=Gn,c=Nt.DEFAULT_ANISOTROPY,h=wi){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:lf++}),this.uuid=Dn(),this.name="",this.source=new Nc(e),this.mipmaps=[],this.mapping=t,this.channel=0,this.wrapS=n,this.wrapT=i,this.magFilter=r,this.minFilter=o,this.anisotropy=c,this.format=a,this.internalFormat=null,this.type=l,this.offset=new Oe(0,0),this.repeat=new Oe(1,1),this.center=new Oe(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new $e,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=h,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(e&&e.depth&&e.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(No).x}get height(){return this.source.getSize(No).y}get depth(){return this.source.getSize(No).z}get image(){return this.source.data}set image(e=null){this.source.data=e}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(e){return this.name=e.name,this.source=e.source,this.mipmaps=e.mipmaps.slice(0),this.mapping=e.mapping,this.channel=e.channel,this.wrapS=e.wrapS,this.wrapT=e.wrapT,this.magFilter=e.magFilter,this.minFilter=e.minFilter,this.anisotropy=e.anisotropy,this.format=e.format,this.internalFormat=e.internalFormat,this.type=e.type,this.offset.copy(e.offset),this.repeat.copy(e.repeat),this.center.copy(e.center),this.rotation=e.rotation,this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrix.copy(e.matrix),this.generateMipmaps=e.generateMipmaps,this.premultiplyAlpha=e.premultiplyAlpha,this.flipY=e.flipY,this.unpackAlignment=e.unpackAlignment,this.colorSpace=e.colorSpace,this.renderTarget=e.renderTarget,this.isRenderTargetTexture=e.isRenderTargetTexture,this.isArrayTexture=e.isArrayTexture,this.userData=JSON.parse(JSON.stringify(e.userData)),this.needsUpdate=!0,this}setValues(e){for(const t in e){const n=e[t];if(n===void 0){console.warn(`THREE.Texture.setValues(): parameter '${t}' has value of undefined.`);continue}const i=this[t];if(i===void 0){console.warn(`THREE.Texture.setValues(): property '${t}' does not exist.`);continue}i&&n&&i.isVector2&&n.isVector2||i&&n&&i.isVector3&&n.isVector3||i&&n&&i.isMatrix3&&n.isMatrix3?i.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";if(!t&&e.textures[this.uuid]!==void 0)return e.textures[this.uuid];const n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(e).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),t||(e.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(e){if(this.mapping!==zh)return e;if(e.applyMatrix3(this.matrix),e.x<0||e.x>1)switch(this.wrapS){case Zi:e.x=e.x-Math.floor(e.x);break;case Ai:e.x=e.x<0?0:1;break;case lo:Math.abs(Math.floor(e.x)%2)===1?e.x=Math.ceil(e.x)-e.x:e.x=e.x-Math.floor(e.x);break}if(e.y<0||e.y>1)switch(this.wrapT){case Zi:e.y=e.y-Math.floor(e.y);break;case Ai:e.y=e.y<0?0:1;break;case lo:Math.abs(Math.floor(e.y)%2)===1?e.y=Math.ceil(e.y)-e.y:e.y=e.y-Math.floor(e.y);break}return this.flipY&&(e.y=1-e.y),e}set needsUpdate(e){e===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(e){e===!0&&this.pmremVersion++}}Nt.DEFAULT_IMAGE=null;Nt.DEFAULT_MAPPING=zh;Nt.DEFAULT_ANISOTROPY=1;class ht{constructor(e=0,t=0,n=0,i=1){ht.prototype.isVector4=!0,this.x=e,this.y=t,this.z=n,this.w=i}get width(){return this.z}set width(e){this.z=e}get height(){return this.w}set height(e){this.w=e}set(e,t,n,i){return this.x=e,this.y=t,this.z=n,this.w=i,this}setScalar(e){return this.x=e,this.y=e,this.z=e,this.w=e,this}setX(e){return this.x=e,this}setY(e){return this.y=e,this}setZ(e){return this.z=e,this}setW(e){return this.w=e,this}setComponent(e,t){switch(e){case 0:this.x=t;break;case 1:this.y=t;break;case 2:this.z=t;break;case 3:this.w=t;break;default:throw new Error("index is out of range: "+e)}return this}getComponent(e){switch(e){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+e)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(e){return this.x=e.x,this.y=e.y,this.z=e.z,this.w=e.w!==void 0?e.w:1,this}add(e){return this.x+=e.x,this.y+=e.y,this.z+=e.z,this.w+=e.w,this}addScalar(e){return this.x+=e,this.y+=e,this.z+=e,this.w+=e,this}addVectors(e,t){return this.x=e.x+t.x,this.y=e.y+t.y,this.z=e.z+t.z,this.w=e.w+t.w,this}addScaledVector(e,t){return this.x+=e.x*t,this.y+=e.y*t,this.z+=e.z*t,this.w+=e.w*t,this}sub(e){return this.x-=e.x,this.y-=e.y,this.z-=e.z,this.w-=e.w,this}subScalar(e){return this.x-=e,this.y-=e,this.z-=e,this.w-=e,this}subVectors(e,t){return this.x=e.x-t.x,this.y=e.y-t.y,this.z=e.z-t.z,this.w=e.w-t.w,this}multiply(e){return this.x*=e.x,this.y*=e.y,this.z*=e.z,this.w*=e.w,this}multiplyScalar(e){return this.x*=e,this.y*=e,this.z*=e,this.w*=e,this}applyMatrix4(e){const t=this.x,n=this.y,i=this.z,r=this.w,o=e.elements;return this.x=o[0]*t+o[4]*n+o[8]*i+o[12]*r,this.y=o[1]*t+o[5]*n+o[9]*i+o[13]*r,this.z=o[2]*t+o[6]*n+o[10]*i+o[14]*r,this.w=o[3]*t+o[7]*n+o[11]*i+o[15]*r,this}divide(e){return this.x/=e.x,this.y/=e.y,this.z/=e.z,this.w/=e.w,this}divideScalar(e){return this.multiplyScalar(1/e)}setAxisAngleFromQuaternion(e){this.w=2*Math.acos(e.w);const t=Math.sqrt(1-e.w*e.w);return t<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=e.x/t,this.y=e.y/t,this.z=e.z/t),this}setAxisAngleFromRotationMatrix(e){let t,n,i,r;const l=e.elements,c=l[0],h=l[4],u=l[8],d=l[1],f=l[5],g=l[9],x=l[2],m=l[6],p=l[10];if(Math.abs(h-d)<.01&&Math.abs(u-x)<.01&&Math.abs(g-m)<.01){if(Math.abs(h+d)<.1&&Math.abs(u+x)<.1&&Math.abs(g+m)<.1&&Math.abs(c+f+p-3)<.1)return this.set(1,0,0,0),this;t=Math.PI;const y=(c+1)/2,v=(f+1)/2,w=(p+1)/2,S=(h+d)/4,R=(u+x)/4,I=(g+m)/4;return y>v&&y>w?y<.01?(n=0,i=.707106781,r=.707106781):(n=Math.sqrt(y),i=S/n,r=R/n):v>w?v<.01?(n=.707106781,i=0,r=.707106781):(i=Math.sqrt(v),n=S/i,r=I/i):w<.01?(n=.707106781,i=.707106781,r=0):(r=Math.sqrt(w),n=R/r,i=I/r),this.set(n,i,r,t),this}let M=Math.sqrt((m-g)*(m-g)+(u-x)*(u-x)+(d-h)*(d-h));return Math.abs(M)<.001&&(M=1),this.x=(m-g)/M,this.y=(u-x)/M,this.z=(d-h)/M,this.w=Math.acos((c+f+p-1)/2),this}setFromMatrixPosition(e){const t=e.elements;return this.x=t[12],this.y=t[13],this.z=t[14],this.w=t[15],this}min(e){return this.x=Math.min(this.x,e.x),this.y=Math.min(this.y,e.y),this.z=Math.min(this.z,e.z),this.w=Math.min(this.w,e.w),this}max(e){return this.x=Math.max(this.x,e.x),this.y=Math.max(this.y,e.y),this.z=Math.max(this.z,e.z),this.w=Math.max(this.w,e.w),this}clamp(e,t){return this.x=et(this.x,e.x,t.x),this.y=et(this.y,e.y,t.y),this.z=et(this.z,e.z,t.z),this.w=et(this.w,e.w,t.w),this}clampScalar(e,t){return this.x=et(this.x,e,t),this.y=et(this.y,e,t),this.z=et(this.z,e,t),this.w=et(this.w,e,t),this}clampLength(e,t){const n=this.length();return this.divideScalar(n||1).multiplyScalar(et(n,e,t))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(e){return this.x*e.x+this.y*e.y+this.z*e.z+this.w*e.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(e){return this.normalize().multiplyScalar(e)}lerp(e,t){return this.x+=(e.x-this.x)*t,this.y+=(e.y-this.y)*t,this.z+=(e.z-this.z)*t,this.w+=(e.w-this.w)*t,this}lerpVectors(e,t,n){return this.x=e.x+(t.x-e.x)*n,this.y=e.y+(t.y-e.y)*n,this.z=e.z+(t.z-e.z)*n,this.w=e.w+(t.w-e.w)*n,this}equals(e){return e.x===this.x&&e.y===this.y&&e.z===this.z&&e.w===this.w}fromArray(e,t=0){return this.x=e[t],this.y=e[t+1],this.z=e[t+2],this.w=e[t+3],this}toArray(e=[],t=0){return e[t]=this.x,e[t+1]=this.y,e[t+2]=this.z,e[t+3]=this.w,e}fromBufferAttribute(e,t){return this.x=e.getX(t),this.y=e.getY(t),this.z=e.getZ(t),this.w=e.getW(t),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}}class hf extends ts{constructor(e=1,t=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:pn,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},n),this.isRenderTarget=!0,this.width=e,this.height=t,this.depth=n.depth,this.scissor=new ht(0,0,e,t),this.scissorTest=!1,this.viewport=new ht(0,0,e,t);const i={width:e,height:t,depth:n.depth},r=new Nt(i);this.textures=[];const o=n.count;for(let a=0;a<o;a++)this.textures[a]=r.clone(),this.textures[a].isRenderTargetTexture=!0,this.textures[a].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview}_setTextureOptions(e={}){const t={minFilter:pn,generateMipmaps:!1,flipY:!1,internalFormat:null};e.mapping!==void 0&&(t.mapping=e.mapping),e.wrapS!==void 0&&(t.wrapS=e.wrapS),e.wrapT!==void 0&&(t.wrapT=e.wrapT),e.wrapR!==void 0&&(t.wrapR=e.wrapR),e.magFilter!==void 0&&(t.magFilter=e.magFilter),e.minFilter!==void 0&&(t.minFilter=e.minFilter),e.format!==void 0&&(t.format=e.format),e.type!==void 0&&(t.type=e.type),e.anisotropy!==void 0&&(t.anisotropy=e.anisotropy),e.colorSpace!==void 0&&(t.colorSpace=e.colorSpace),e.flipY!==void 0&&(t.flipY=e.flipY),e.generateMipmaps!==void 0&&(t.generateMipmaps=e.generateMipmaps),e.internalFormat!==void 0&&(t.internalFormat=e.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(t)}get texture(){return this.textures[0]}set texture(e){this.textures[0]=e}set depthTexture(e){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),e!==null&&(e.renderTarget=this),this._depthTexture=e}get depthTexture(){return this._depthTexture}setSize(e,t,n=1){if(this.width!==e||this.height!==t||this.depth!==n){this.width=e,this.height=t,this.depth=n;for(let i=0,r=this.textures.length;i<r;i++)this.textures[i].image.width=e,this.textures[i].image.height=t,this.textures[i].image.depth=n,this.textures[i].isArrayTexture=this.textures[i].image.depth>1;this.dispose()}this.viewport.set(0,0,e,t),this.scissor.set(0,0,e,t)}clone(){return new this.constructor().copy(this)}copy(e){this.width=e.width,this.height=e.height,this.depth=e.depth,this.scissor.copy(e.scissor),this.scissorTest=e.scissorTest,this.viewport.copy(e.viewport),this.textures.length=0;for(let t=0,n=e.textures.length;t<n;t++){this.textures[t]=e.textures[t].clone(),this.textures[t].isRenderTargetTexture=!0,this.textures[t].renderTarget=this;const i=Object.assign({},e.textures[t].image);this.textures[t].source=new Nc(i)}return this.depthBuffer=e.depthBuffer,this.stencilBuffer=e.stencilBuffer,this.resolveDepthBuffer=e.resolveDepthBuffer,this.resolveStencilBuffer=e.resolveStencilBuffer,e.depthTexture!==null&&(this.depthTexture=e.depthTexture.clone()),this.samples=e.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}}class Qi extends hf{constructor(e=1,t=1,n={}){super(e,t,n),this.isWebGLRenderTarget=!0}}class Zh extends Nt{constructor(e=null,t=1,n=1,i=1){super(null),this.isDataArrayTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=$t,this.minFilter=$t,this.wrapR=Ai,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(e){this.layerUpdates.add(e)}clearLayerUpdates(){this.layerUpdates.clear()}}class uf extends Nt{constructor(e=null,t=1,n=1,i=1){super(null),this.isData3DTexture=!0,this.image={data:e,width:t,height:n,depth:i},this.magFilter=$t,this.minFilter=$t,this.wrapR=Ai,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}class Yn{constructor(e=new P(1/0,1/0,1/0),t=new P(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=e,this.max=t}set(e,t){return this.min.copy(e),this.max.copy(t),this}setFromArray(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t+=3)this.expandByPoint(Tn.fromArray(e,t));return this}setFromBufferAttribute(e){this.makeEmpty();for(let t=0,n=e.count;t<n;t++)this.expandByPoint(Tn.fromBufferAttribute(e,t));return this}setFromPoints(e){this.makeEmpty();for(let t=0,n=e.length;t<n;t++)this.expandByPoint(e[t]);return this}setFromCenterAndSize(e,t){const n=Tn.copy(t).multiplyScalar(.5);return this.min.copy(e).sub(n),this.max.copy(e).add(n),this}setFromObject(e,t=!1){return this.makeEmpty(),this.expandByObject(e,t)}clone(){return new this.constructor().copy(this)}copy(e){return this.min.copy(e.min),this.max.copy(e.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(e){return this.isEmpty()?e.set(0,0,0):e.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(e){return this.isEmpty()?e.set(0,0,0):e.subVectors(this.max,this.min)}expandByPoint(e){return this.min.min(e),this.max.max(e),this}expandByVector(e){return this.min.sub(e),this.max.add(e),this}expandByScalar(e){return this.min.addScalar(-e),this.max.addScalar(e),this}expandByObject(e,t=!1){e.updateWorldMatrix(!1,!1);const n=e.geometry;if(n!==void 0){const r=n.getAttribute("position");if(t===!0&&r!==void 0&&e.isInstancedMesh!==!0)for(let o=0,a=r.count;o<a;o++)e.isMesh===!0?e.getVertexPosition(o,Tn):Tn.fromBufferAttribute(r,o),Tn.applyMatrix4(e.matrixWorld),this.expandByPoint(Tn);else e.boundingBox!==void 0?(e.boundingBox===null&&e.computeBoundingBox(),br.copy(e.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),br.copy(n.boundingBox)),br.applyMatrix4(e.matrixWorld),this.union(br)}const i=e.children;for(let r=0,o=i.length;r<o;r++)this.expandByObject(i[r],t);return this}containsPoint(e){return e.x>=this.min.x&&e.x<=this.max.x&&e.y>=this.min.y&&e.y<=this.max.y&&e.z>=this.min.z&&e.z<=this.max.z}containsBox(e){return this.min.x<=e.min.x&&e.max.x<=this.max.x&&this.min.y<=e.min.y&&e.max.y<=this.max.y&&this.min.z<=e.min.z&&e.max.z<=this.max.z}getParameter(e,t){return t.set((e.x-this.min.x)/(this.max.x-this.min.x),(e.y-this.min.y)/(this.max.y-this.min.y),(e.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(e){return e.max.x>=this.min.x&&e.min.x<=this.max.x&&e.max.y>=this.min.y&&e.min.y<=this.max.y&&e.max.z>=this.min.z&&e.min.z<=this.max.z}intersectsSphere(e){return this.clampPoint(e.center,Tn),Tn.distanceToSquared(e.center)<=e.radius*e.radius}intersectsPlane(e){let t,n;return e.normal.x>0?(t=e.normal.x*this.min.x,n=e.normal.x*this.max.x):(t=e.normal.x*this.max.x,n=e.normal.x*this.min.x),e.normal.y>0?(t+=e.normal.y*this.min.y,n+=e.normal.y*this.max.y):(t+=e.normal.y*this.max.y,n+=e.normal.y*this.min.y),e.normal.z>0?(t+=e.normal.z*this.min.z,n+=e.normal.z*this.max.z):(t+=e.normal.z*this.max.z,n+=e.normal.z*this.min.z),t<=-e.constant&&n>=-e.constant}intersectsTriangle(e){if(this.isEmpty())return!1;this.getCenter(Vs),Sr.subVectors(this.max,Vs),os.subVectors(e.a,Vs),as.subVectors(e.b,Vs),cs.subVectors(e.c,Vs),_i.subVectors(as,os),xi.subVectors(cs,as),zi.subVectors(os,cs);let t=[0,-_i.z,_i.y,0,-xi.z,xi.y,0,-zi.z,zi.y,_i.z,0,-_i.x,xi.z,0,-xi.x,zi.z,0,-zi.x,-_i.y,_i.x,0,-xi.y,xi.x,0,-zi.y,zi.x,0];return!Uo(t,os,as,cs,Sr)||(t=[1,0,0,0,1,0,0,0,1],!Uo(t,os,as,cs,Sr))?!1:(Er.crossVectors(_i,xi),t=[Er.x,Er.y,Er.z],Uo(t,os,as,cs,Sr))}clampPoint(e,t){return t.copy(e).clamp(this.min,this.max)}distanceToPoint(e){return this.clampPoint(e,Tn).distanceTo(e)}getBoundingSphere(e){return this.isEmpty()?e.makeEmpty():(this.getCenter(e.center),e.radius=this.getSize(Tn).length()*.5),e}intersect(e){return this.min.max(e.min),this.max.min(e.max),this.isEmpty()&&this.makeEmpty(),this}union(e){return this.min.min(e.min),this.max.max(e.max),this}applyMatrix4(e){return this.isEmpty()?this:(Jn[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(e),Jn[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(e),Jn[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(e),Jn[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(e),Jn[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(e),Jn[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(e),Jn[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(e),Jn[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(e),this.setFromPoints(Jn),this)}translate(e){return this.min.add(e),this.max.add(e),this}equals(e){return e.min.equals(this.min)&&e.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(e){return this.min.fromArray(e.min),this.max.fromArray(e.max),this}}const Jn=[new P,new P,new P,new P,new P,new P,new P,new P],Tn=new P,br=new Yn,os=new P,as=new P,cs=new P,_i=new P,xi=new P,zi=new P,Vs=new P,Sr=new P,Er=new P,Bi=new P;function Uo(s,e,t,n,i){for(let r=0,o=s.length-3;r<=o;r+=3){Bi.fromArray(s,r);const a=i.x*Math.abs(Bi.x)+i.y*Math.abs(Bi.y)+i.z*Math.abs(Bi.z),l=e.dot(Bi),c=t.dot(Bi),h=n.dot(Bi);if(Math.max(-Math.max(l,c,h),Math.min(l,c,h))>a)return!1}return!0}const df=new Yn,Gs=new P,Fo=new P;class jn{constructor(e=new P,t=-1){this.isSphere=!0,this.center=e,this.radius=t}set(e,t){return this.center.copy(e),this.radius=t,this}setFromPoints(e,t){const n=this.center;t!==void 0?n.copy(t):df.setFromPoints(e).getCenter(n);let i=0;for(let r=0,o=e.length;r<o;r++)i=Math.max(i,n.distanceToSquared(e[r]));return this.radius=Math.sqrt(i),this}copy(e){return this.center.copy(e.center),this.radius=e.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(e){return e.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(e){return e.distanceTo(this.center)-this.radius}intersectsSphere(e){const t=this.radius+e.radius;return e.center.distanceToSquared(this.center)<=t*t}intersectsBox(e){return e.intersectsSphere(this)}intersectsPlane(e){return Math.abs(e.distanceToPoint(this.center))<=this.radius}clampPoint(e,t){const n=this.center.distanceToSquared(e);return t.copy(e),n>this.radius*this.radius&&(t.sub(this.center).normalize(),t.multiplyScalar(this.radius).add(this.center)),t}getBoundingBox(e){return this.isEmpty()?(e.makeEmpty(),e):(e.set(this.center,this.center),e.expandByScalar(this.radius),e)}applyMatrix4(e){return this.center.applyMatrix4(e),this.radius=this.radius*e.getMaxScaleOnAxis(),this}translate(e){return this.center.add(e),this}expandByPoint(e){if(this.isEmpty())return this.center.copy(e),this.radius=0,this;Gs.subVectors(e,this.center);const t=Gs.lengthSq();if(t>this.radius*this.radius){const n=Math.sqrt(t),i=(n-this.radius)*.5;this.center.addScaledVector(Gs,i/n),this.radius+=i}return this}union(e){return e.isEmpty()?this:this.isEmpty()?(this.copy(e),this):(this.center.equals(e.center)===!0?this.radius=Math.max(this.radius,e.radius):(Fo.subVectors(e.center,this.center).setLength(e.radius),this.expandByPoint(Gs.copy(e.center).add(Fo)),this.expandByPoint(Gs.copy(e.center).sub(Fo))),this)}equals(e){return e.center.equals(this.center)&&e.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(e){return this.radius=e.radius,this.center.fromArray(e.center),this}}const Zn=new P,Oo=new P,Tr=new P,vi=new P,zo=new P,wr=new P,Bo=new P;class yo{constructor(e=new P,t=new P(0,0,-1)){this.origin=e,this.direction=t}set(e,t){return this.origin.copy(e),this.direction.copy(t),this}copy(e){return this.origin.copy(e.origin),this.direction.copy(e.direction),this}at(e,t){return t.copy(this.origin).addScaledVector(this.direction,e)}lookAt(e){return this.direction.copy(e).sub(this.origin).normalize(),this}recast(e){return this.origin.copy(this.at(e,Zn)),this}closestPointToPoint(e,t){t.subVectors(e,this.origin);const n=t.dot(this.direction);return n<0?t.copy(this.origin):t.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(e){return Math.sqrt(this.distanceSqToPoint(e))}distanceSqToPoint(e){const t=Zn.subVectors(e,this.origin).dot(this.direction);return t<0?this.origin.distanceToSquared(e):(Zn.copy(this.origin).addScaledVector(this.direction,t),Zn.distanceToSquared(e))}distanceSqToSegment(e,t,n,i){Oo.copy(e).add(t).multiplyScalar(.5),Tr.copy(t).sub(e).normalize(),vi.copy(this.origin).sub(Oo);const r=e.distanceTo(t)*.5,o=-this.direction.dot(Tr),a=vi.dot(this.direction),l=-vi.dot(Tr),c=vi.lengthSq(),h=Math.abs(1-o*o);let u,d,f,g;if(h>0)if(u=o*l-a,d=o*a-l,g=r*h,u>=0)if(d>=-g)if(d<=g){const x=1/h;u*=x,d*=x,f=u*(u+o*d+2*a)+d*(o*u+d+2*l)+c}else d=r,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*l)+c;else d=-r,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*l)+c;else d<=-g?(u=Math.max(0,-(-o*r+a)),d=u>0?-r:Math.min(Math.max(-r,-l),r),f=-u*u+d*(d+2*l)+c):d<=g?(u=0,d=Math.min(Math.max(-r,-l),r),f=d*(d+2*l)+c):(u=Math.max(0,-(o*r+a)),d=u>0?r:Math.min(Math.max(-r,-l),r),f=-u*u+d*(d+2*l)+c);else d=o>0?-r:r,u=Math.max(0,-(o*d+a)),f=-u*u+d*(d+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,u),i&&i.copy(Oo).addScaledVector(Tr,d),f}intersectSphere(e,t){Zn.subVectors(e.center,this.origin);const n=Zn.dot(this.direction),i=Zn.dot(Zn)-n*n,r=e.radius*e.radius;if(i>r)return null;const o=Math.sqrt(r-i),a=n-o,l=n+o;return l<0?null:a<0?this.at(l,t):this.at(a,t)}intersectsSphere(e){return e.radius<0?!1:this.distanceSqToPoint(e.center)<=e.radius*e.radius}distanceToPlane(e){const t=e.normal.dot(this.direction);if(t===0)return e.distanceToPoint(this.origin)===0?0:null;const n=-(this.origin.dot(e.normal)+e.constant)/t;return n>=0?n:null}intersectPlane(e,t){const n=this.distanceToPlane(e);return n===null?null:this.at(n,t)}intersectsPlane(e){const t=e.distanceToPoint(this.origin);return t===0||e.normal.dot(this.direction)*t<0}intersectBox(e,t){let n,i,r,o,a,l;const c=1/this.direction.x,h=1/this.direction.y,u=1/this.direction.z,d=this.origin;return c>=0?(n=(e.min.x-d.x)*c,i=(e.max.x-d.x)*c):(n=(e.max.x-d.x)*c,i=(e.min.x-d.x)*c),h>=0?(r=(e.min.y-d.y)*h,o=(e.max.y-d.y)*h):(r=(e.max.y-d.y)*h,o=(e.min.y-d.y)*h),n>o||r>i||((r>n||isNaN(n))&&(n=r),(o<i||isNaN(i))&&(i=o),u>=0?(a=(e.min.z-d.z)*u,l=(e.max.z-d.z)*u):(a=(e.max.z-d.z)*u,l=(e.min.z-d.z)*u),n>l||a>i)||((a>n||n!==n)&&(n=a),(l<i||i!==i)&&(i=l),i<0)?null:this.at(n>=0?n:i,t)}intersectsBox(e){return this.intersectBox(e,Zn)!==null}intersectTriangle(e,t,n,i,r){zo.subVectors(t,e),wr.subVectors(n,e),Bo.crossVectors(zo,wr);let o=this.direction.dot(Bo),a;if(o>0){if(i)return null;a=1}else if(o<0)a=-1,o=-o;else return null;vi.subVectors(this.origin,e);const l=a*this.direction.dot(wr.crossVectors(vi,wr));if(l<0)return null;const c=a*this.direction.dot(zo.cross(vi));if(c<0||l+c>o)return null;const h=-a*vi.dot(Bo);return h<0?null:this.at(h/o,r)}applyMatrix4(e){return this.origin.applyMatrix4(e),this.direction.transformDirection(e),this}equals(e){return e.origin.equals(this.origin)&&e.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}}class Ze{constructor(e,t,n,i,r,o,a,l,c,h,u,d,f,g,x,m){Ze.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],e!==void 0&&this.set(e,t,n,i,r,o,a,l,c,h,u,d,f,g,x,m)}set(e,t,n,i,r,o,a,l,c,h,u,d,f,g,x,m){const p=this.elements;return p[0]=e,p[4]=t,p[8]=n,p[12]=i,p[1]=r,p[5]=o,p[9]=a,p[13]=l,p[2]=c,p[6]=h,p[10]=u,p[14]=d,p[3]=f,p[7]=g,p[11]=x,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new Ze().fromArray(this.elements)}copy(e){const t=this.elements,n=e.elements;return t[0]=n[0],t[1]=n[1],t[2]=n[2],t[3]=n[3],t[4]=n[4],t[5]=n[5],t[6]=n[6],t[7]=n[7],t[8]=n[8],t[9]=n[9],t[10]=n[10],t[11]=n[11],t[12]=n[12],t[13]=n[13],t[14]=n[14],t[15]=n[15],this}copyPosition(e){const t=this.elements,n=e.elements;return t[12]=n[12],t[13]=n[13],t[14]=n[14],this}setFromMatrix3(e){const t=e.elements;return this.set(t[0],t[3],t[6],0,t[1],t[4],t[7],0,t[2],t[5],t[8],0,0,0,0,1),this}extractBasis(e,t,n){return e.setFromMatrixColumn(this,0),t.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(e,t,n){return this.set(e.x,t.x,n.x,0,e.y,t.y,n.y,0,e.z,t.z,n.z,0,0,0,0,1),this}extractRotation(e){const t=this.elements,n=e.elements,i=1/ls.setFromMatrixColumn(e,0).length(),r=1/ls.setFromMatrixColumn(e,1).length(),o=1/ls.setFromMatrixColumn(e,2).length();return t[0]=n[0]*i,t[1]=n[1]*i,t[2]=n[2]*i,t[3]=0,t[4]=n[4]*r,t[5]=n[5]*r,t[6]=n[6]*r,t[7]=0,t[8]=n[8]*o,t[9]=n[9]*o,t[10]=n[10]*o,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromEuler(e){const t=this.elements,n=e.x,i=e.y,r=e.z,o=Math.cos(n),a=Math.sin(n),l=Math.cos(i),c=Math.sin(i),h=Math.cos(r),u=Math.sin(r);if(e.order==="XYZ"){const d=o*h,f=o*u,g=a*h,x=a*u;t[0]=l*h,t[4]=-l*u,t[8]=c,t[1]=f+g*c,t[5]=d-x*c,t[9]=-a*l,t[2]=x-d*c,t[6]=g+f*c,t[10]=o*l}else if(e.order==="YXZ"){const d=l*h,f=l*u,g=c*h,x=c*u;t[0]=d+x*a,t[4]=g*a-f,t[8]=o*c,t[1]=o*u,t[5]=o*h,t[9]=-a,t[2]=f*a-g,t[6]=x+d*a,t[10]=o*l}else if(e.order==="ZXY"){const d=l*h,f=l*u,g=c*h,x=c*u;t[0]=d-x*a,t[4]=-o*u,t[8]=g+f*a,t[1]=f+g*a,t[5]=o*h,t[9]=x-d*a,t[2]=-o*c,t[6]=a,t[10]=o*l}else if(e.order==="ZYX"){const d=o*h,f=o*u,g=a*h,x=a*u;t[0]=l*h,t[4]=g*c-f,t[8]=d*c+x,t[1]=l*u,t[5]=x*c+d,t[9]=f*c-g,t[2]=-c,t[6]=a*l,t[10]=o*l}else if(e.order==="YZX"){const d=o*l,f=o*c,g=a*l,x=a*c;t[0]=l*h,t[4]=x-d*u,t[8]=g*u+f,t[1]=u,t[5]=o*h,t[9]=-a*h,t[2]=-c*h,t[6]=f*u+g,t[10]=d-x*u}else if(e.order==="XZY"){const d=o*l,f=o*c,g=a*l,x=a*c;t[0]=l*h,t[4]=-u,t[8]=c*h,t[1]=d*u+x,t[5]=o*h,t[9]=f*u-g,t[2]=g*u-f,t[6]=a*h,t[10]=x*u+d}return t[3]=0,t[7]=0,t[11]=0,t[12]=0,t[13]=0,t[14]=0,t[15]=1,this}makeRotationFromQuaternion(e){return this.compose(ff,e,pf)}lookAt(e,t,n){const i=this.elements;return ln.subVectors(e,t),ln.lengthSq()===0&&(ln.z=1),ln.normalize(),Mi.crossVectors(n,ln),Mi.lengthSq()===0&&(Math.abs(n.z)===1?ln.x+=1e-4:ln.z+=1e-4,ln.normalize(),Mi.crossVectors(n,ln)),Mi.normalize(),Ar.crossVectors(ln,Mi),i[0]=Mi.x,i[4]=Ar.x,i[8]=ln.x,i[1]=Mi.y,i[5]=Ar.y,i[9]=ln.y,i[2]=Mi.z,i[6]=Ar.z,i[10]=ln.z,this}multiply(e){return this.multiplyMatrices(this,e)}premultiply(e){return this.multiplyMatrices(e,this)}multiplyMatrices(e,t){const n=e.elements,i=t.elements,r=this.elements,o=n[0],a=n[4],l=n[8],c=n[12],h=n[1],u=n[5],d=n[9],f=n[13],g=n[2],x=n[6],m=n[10],p=n[14],M=n[3],y=n[7],v=n[11],w=n[15],S=i[0],R=i[4],I=i[8],T=i[12],b=i[1],U=i[5],V=i[9],F=i[13],O=i[2],W=i[6],J=i[10],H=i[14],z=i[3],Z=i[7],le=i[11],re=i[15];return r[0]=o*S+a*b+l*O+c*z,r[4]=o*R+a*U+l*W+c*Z,r[8]=o*I+a*V+l*J+c*le,r[12]=o*T+a*F+l*H+c*re,r[1]=h*S+u*b+d*O+f*z,r[5]=h*R+u*U+d*W+f*Z,r[9]=h*I+u*V+d*J+f*le,r[13]=h*T+u*F+d*H+f*re,r[2]=g*S+x*b+m*O+p*z,r[6]=g*R+x*U+m*W+p*Z,r[10]=g*I+x*V+m*J+p*le,r[14]=g*T+x*F+m*H+p*re,r[3]=M*S+y*b+v*O+w*z,r[7]=M*R+y*U+v*W+w*Z,r[11]=M*I+y*V+v*J+w*le,r[15]=M*T+y*F+v*H+w*re,this}multiplyScalar(e){const t=this.elements;return t[0]*=e,t[4]*=e,t[8]*=e,t[12]*=e,t[1]*=e,t[5]*=e,t[9]*=e,t[13]*=e,t[2]*=e,t[6]*=e,t[10]*=e,t[14]*=e,t[3]*=e,t[7]*=e,t[11]*=e,t[15]*=e,this}determinant(){const e=this.elements,t=e[0],n=e[4],i=e[8],r=e[12],o=e[1],a=e[5],l=e[9],c=e[13],h=e[2],u=e[6],d=e[10],f=e[14],g=e[3],x=e[7],m=e[11],p=e[15];return g*(+r*l*u-i*c*u-r*a*d+n*c*d+i*a*f-n*l*f)+x*(+t*l*f-t*c*d+r*o*d-i*o*f+i*c*h-r*l*h)+m*(+t*c*u-t*a*f-r*o*u+n*o*f+r*a*h-n*c*h)+p*(-i*a*h-t*l*u+t*a*d+i*o*u-n*o*d+n*l*h)}transpose(){const e=this.elements;let t;return t=e[1],e[1]=e[4],e[4]=t,t=e[2],e[2]=e[8],e[8]=t,t=e[6],e[6]=e[9],e[9]=t,t=e[3],e[3]=e[12],e[12]=t,t=e[7],e[7]=e[13],e[13]=t,t=e[11],e[11]=e[14],e[14]=t,this}setPosition(e,t,n){const i=this.elements;return e.isVector3?(i[12]=e.x,i[13]=e.y,i[14]=e.z):(i[12]=e,i[13]=t,i[14]=n),this}invert(){const e=this.elements,t=e[0],n=e[1],i=e[2],r=e[3],o=e[4],a=e[5],l=e[6],c=e[7],h=e[8],u=e[9],d=e[10],f=e[11],g=e[12],x=e[13],m=e[14],p=e[15],M=u*m*c-x*d*c+x*l*f-a*m*f-u*l*p+a*d*p,y=g*d*c-h*m*c-g*l*f+o*m*f+h*l*p-o*d*p,v=h*x*c-g*u*c+g*a*f-o*x*f-h*a*p+o*u*p,w=g*u*l-h*x*l-g*a*d+o*x*d+h*a*m-o*u*m,S=t*M+n*y+i*v+r*w;if(S===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);const R=1/S;return e[0]=M*R,e[1]=(x*d*r-u*m*r-x*i*f+n*m*f+u*i*p-n*d*p)*R,e[2]=(a*m*r-x*l*r+x*i*c-n*m*c-a*i*p+n*l*p)*R,e[3]=(u*l*r-a*d*r-u*i*c+n*d*c+a*i*f-n*l*f)*R,e[4]=y*R,e[5]=(h*m*r-g*d*r+g*i*f-t*m*f-h*i*p+t*d*p)*R,e[6]=(g*l*r-o*m*r-g*i*c+t*m*c+o*i*p-t*l*p)*R,e[7]=(o*d*r-h*l*r+h*i*c-t*d*c-o*i*f+t*l*f)*R,e[8]=v*R,e[9]=(g*u*r-h*x*r-g*n*f+t*x*f+h*n*p-t*u*p)*R,e[10]=(o*x*r-g*a*r+g*n*c-t*x*c-o*n*p+t*a*p)*R,e[11]=(h*a*r-o*u*r-h*n*c+t*u*c+o*n*f-t*a*f)*R,e[12]=w*R,e[13]=(h*x*i-g*u*i+g*n*d-t*x*d-h*n*m+t*u*m)*R,e[14]=(g*a*i-o*x*i-g*n*l+t*x*l+o*n*m-t*a*m)*R,e[15]=(o*u*i-h*a*i+h*n*l-t*u*l-o*n*d+t*a*d)*R,this}scale(e){const t=this.elements,n=e.x,i=e.y,r=e.z;return t[0]*=n,t[4]*=i,t[8]*=r,t[1]*=n,t[5]*=i,t[9]*=r,t[2]*=n,t[6]*=i,t[10]*=r,t[3]*=n,t[7]*=i,t[11]*=r,this}getMaxScaleOnAxis(){const e=this.elements,t=e[0]*e[0]+e[1]*e[1]+e[2]*e[2],n=e[4]*e[4]+e[5]*e[5]+e[6]*e[6],i=e[8]*e[8]+e[9]*e[9]+e[10]*e[10];return Math.sqrt(Math.max(t,n,i))}makeTranslation(e,t,n){return e.isVector3?this.set(1,0,0,e.x,0,1,0,e.y,0,0,1,e.z,0,0,0,1):this.set(1,0,0,e,0,1,0,t,0,0,1,n,0,0,0,1),this}makeRotationX(e){const t=Math.cos(e),n=Math.sin(e);return this.set(1,0,0,0,0,t,-n,0,0,n,t,0,0,0,0,1),this}makeRotationY(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,0,n,0,0,1,0,0,-n,0,t,0,0,0,0,1),this}makeRotationZ(e){const t=Math.cos(e),n=Math.sin(e);return this.set(t,-n,0,0,n,t,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(e,t){const n=Math.cos(t),i=Math.sin(t),r=1-n,o=e.x,a=e.y,l=e.z,c=r*o,h=r*a;return this.set(c*o+n,c*a-i*l,c*l+i*a,0,c*a+i*l,h*a+n,h*l-i*o,0,c*l-i*a,h*l+i*o,r*l*l+n,0,0,0,0,1),this}makeScale(e,t,n){return this.set(e,0,0,0,0,t,0,0,0,0,n,0,0,0,0,1),this}makeShear(e,t,n,i,r,o){return this.set(1,n,r,0,e,1,o,0,t,i,1,0,0,0,0,1),this}compose(e,t,n){const i=this.elements,r=t._x,o=t._y,a=t._z,l=t._w,c=r+r,h=o+o,u=a+a,d=r*c,f=r*h,g=r*u,x=o*h,m=o*u,p=a*u,M=l*c,y=l*h,v=l*u,w=n.x,S=n.y,R=n.z;return i[0]=(1-(x+p))*w,i[1]=(f+v)*w,i[2]=(g-y)*w,i[3]=0,i[4]=(f-v)*S,i[5]=(1-(d+p))*S,i[6]=(m+M)*S,i[7]=0,i[8]=(g+y)*R,i[9]=(m-M)*R,i[10]=(1-(d+x))*R,i[11]=0,i[12]=e.x,i[13]=e.y,i[14]=e.z,i[15]=1,this}decompose(e,t,n){const i=this.elements;let r=ls.set(i[0],i[1],i[2]).length();const o=ls.set(i[4],i[5],i[6]).length(),a=ls.set(i[8],i[9],i[10]).length();this.determinant()<0&&(r=-r),e.x=i[12],e.y=i[13],e.z=i[14],wn.copy(this);const c=1/r,h=1/o,u=1/a;return wn.elements[0]*=c,wn.elements[1]*=c,wn.elements[2]*=c,wn.elements[4]*=h,wn.elements[5]*=h,wn.elements[6]*=h,wn.elements[8]*=u,wn.elements[9]*=u,wn.elements[10]*=u,t.setFromRotationMatrix(wn),n.x=r,n.y=o,n.z=a,this}makePerspective(e,t,n,i,r,o,a=kn,l=!1){const c=this.elements,h=2*r/(t-e),u=2*r/(n-i),d=(t+e)/(t-e),f=(n+i)/(n-i);let g,x;if(l)g=r/(o-r),x=o*r/(o-r);else if(a===kn)g=-(o+r)/(o-r),x=-2*o*r/(o-r);else if(a===fo)g=-o/(o-r),x=-o*r/(o-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+a);return c[0]=h,c[4]=0,c[8]=d,c[12]=0,c[1]=0,c[5]=u,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=g,c[14]=x,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(e,t,n,i,r,o,a=kn,l=!1){const c=this.elements,h=2/(t-e),u=2/(n-i),d=-(t+e)/(t-e),f=-(n+i)/(n-i);let g,x;if(l)g=1/(o-r),x=o/(o-r);else if(a===kn)g=-2/(o-r),x=-(o+r)/(o-r);else if(a===fo)g=-1/(o-r),x=-r/(o-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+a);return c[0]=h,c[4]=0,c[8]=0,c[12]=d,c[1]=0,c[5]=u,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=g,c[14]=x,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(e){const t=this.elements,n=e.elements;for(let i=0;i<16;i++)if(t[i]!==n[i])return!1;return!0}fromArray(e,t=0){for(let n=0;n<16;n++)this.elements[n]=e[n+t];return this}toArray(e=[],t=0){const n=this.elements;return e[t]=n[0],e[t+1]=n[1],e[t+2]=n[2],e[t+3]=n[3],e[t+4]=n[4],e[t+5]=n[5],e[t+6]=n[6],e[t+7]=n[7],e[t+8]=n[8],e[t+9]=n[9],e[t+10]=n[10],e[t+11]=n[11],e[t+12]=n[12],e[t+13]=n[13],e[t+14]=n[14],e[t+15]=n[15],e}}const ls=new P,wn=new Ze,ff=new P(0,0,0),pf=new P(1,1,1),Mi=new P,Ar=new P,ln=new P,pl=new Ze,ml=new qt;class Wn{constructor(e=0,t=0,n=0,i=Wn.DEFAULT_ORDER){this.isEuler=!0,this._x=e,this._y=t,this._z=n,this._order=i}get x(){return this._x}set x(e){this._x=e,this._onChangeCallback()}get y(){return this._y}set y(e){this._y=e,this._onChangeCallback()}get z(){return this._z}set z(e){this._z=e,this._onChangeCallback()}get order(){return this._order}set order(e){this._order=e,this._onChangeCallback()}set(e,t,n,i=this._order){return this._x=e,this._y=t,this._z=n,this._order=i,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(e){return this._x=e._x,this._y=e._y,this._z=e._z,this._order=e._order,this._onChangeCallback(),this}setFromRotationMatrix(e,t=this._order,n=!0){const i=e.elements,r=i[0],o=i[4],a=i[8],l=i[1],c=i[5],h=i[9],u=i[2],d=i[6],f=i[10];switch(t){case"XYZ":this._y=Math.asin(et(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(-h,f),this._z=Math.atan2(-o,r)):(this._x=Math.atan2(d,c),this._z=0);break;case"YXZ":this._x=Math.asin(-et(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(a,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-u,r),this._z=0);break;case"ZXY":this._x=Math.asin(et(d,-1,1)),Math.abs(d)<.9999999?(this._y=Math.atan2(-u,f),this._z=Math.atan2(-o,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-et(u,-1,1)),Math.abs(u)<.9999999?(this._x=Math.atan2(d,f),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-o,c));break;case"YZX":this._z=Math.asin(et(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-h,c),this._y=Math.atan2(-u,r)):(this._x=0,this._y=Math.atan2(a,f));break;case"XZY":this._z=Math.asin(-et(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(d,c),this._y=Math.atan2(a,r)):(this._x=Math.atan2(-h,f),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+t)}return this._order=t,n===!0&&this._onChangeCallback(),this}setFromQuaternion(e,t,n){return pl.makeRotationFromQuaternion(e),this.setFromRotationMatrix(pl,t,n)}setFromVector3(e,t=this._order){return this.set(e.x,e.y,e.z,t)}reorder(e){return ml.setFromEuler(this),this.setFromQuaternion(ml,e)}equals(e){return e._x===this._x&&e._y===this._y&&e._z===this._z&&e._order===this._order}fromArray(e){return this._x=e[0],this._y=e[1],this._z=e[2],e[3]!==void 0&&(this._order=e[3]),this._onChangeCallback(),this}toArray(e=[],t=0){return e[t]=this._x,e[t+1]=this._y,e[t+2]=this._z,e[t+3]=this._order,e}_onChange(e){return this._onChangeCallback=e,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}}Wn.DEFAULT_ORDER="XYZ";class $h{constructor(){this.mask=1}set(e){this.mask=(1<<e|0)>>>0}enable(e){this.mask|=1<<e|0}enableAll(){this.mask=-1}toggle(e){this.mask^=1<<e|0}disable(e){this.mask&=~(1<<e|0)}disableAll(){this.mask=0}test(e){return(this.mask&e.mask)!==0}isEnabled(e){return(this.mask&(1<<e|0))!==0}}let mf=0;const gl=new P,hs=new qt,$n=new Ze,Rr=new P,Ws=new P,gf=new P,_f=new qt,_l=new P(1,0,0),xl=new P(0,1,0),vl=new P(0,0,1),Ml={type:"added"},xf={type:"removed"},us={type:"childadded",child:null},ko={type:"childremoved",child:null};class Et extends ts{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:mf++}),this.uuid=Dn(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=Et.DEFAULT_UP.clone();const e=new P,t=new Wn,n=new qt,i=new P(1,1,1);function r(){n.setFromEuler(t,!1)}function o(){t.setFromQuaternion(n,void 0,!1)}t._onChange(r),n._onChange(o),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:e},rotation:{configurable:!0,enumerable:!0,value:t},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:i},modelViewMatrix:{value:new Ze},normalMatrix:{value:new $e}}),this.matrix=new Ze,this.matrixWorld=new Ze,this.matrixAutoUpdate=Et.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=Et.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new $h,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(e){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(e),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(e){return this.quaternion.premultiply(e),this}setRotationFromAxisAngle(e,t){this.quaternion.setFromAxisAngle(e,t)}setRotationFromEuler(e){this.quaternion.setFromEuler(e,!0)}setRotationFromMatrix(e){this.quaternion.setFromRotationMatrix(e)}setRotationFromQuaternion(e){this.quaternion.copy(e)}rotateOnAxis(e,t){return hs.setFromAxisAngle(e,t),this.quaternion.multiply(hs),this}rotateOnWorldAxis(e,t){return hs.setFromAxisAngle(e,t),this.quaternion.premultiply(hs),this}rotateX(e){return this.rotateOnAxis(_l,e)}rotateY(e){return this.rotateOnAxis(xl,e)}rotateZ(e){return this.rotateOnAxis(vl,e)}translateOnAxis(e,t){return gl.copy(e).applyQuaternion(this.quaternion),this.position.add(gl.multiplyScalar(t)),this}translateX(e){return this.translateOnAxis(_l,e)}translateY(e){return this.translateOnAxis(xl,e)}translateZ(e){return this.translateOnAxis(vl,e)}localToWorld(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4(this.matrixWorld)}worldToLocal(e){return this.updateWorldMatrix(!0,!1),e.applyMatrix4($n.copy(this.matrixWorld).invert())}lookAt(e,t,n){e.isVector3?Rr.copy(e):Rr.set(e,t,n);const i=this.parent;this.updateWorldMatrix(!0,!1),Ws.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?$n.lookAt(Ws,Rr,this.up):$n.lookAt(Rr,Ws,this.up),this.quaternion.setFromRotationMatrix($n),i&&($n.extractRotation(i.matrixWorld),hs.setFromRotationMatrix($n),this.quaternion.premultiply(hs.invert()))}add(e){if(arguments.length>1){for(let t=0;t<arguments.length;t++)this.add(arguments[t]);return this}return e===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",e),this):(e&&e.isObject3D?(e.removeFromParent(),e.parent=this,this.children.push(e),e.dispatchEvent(Ml),us.child=e,this.dispatchEvent(us),us.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",e),this)}remove(e){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}const t=this.children.indexOf(e);return t!==-1&&(e.parent=null,this.children.splice(t,1),e.dispatchEvent(xf),ko.child=e,this.dispatchEvent(ko),ko.child=null),this}removeFromParent(){const e=this.parent;return e!==null&&e.remove(this),this}clear(){return this.remove(...this.children)}attach(e){return this.updateWorldMatrix(!0,!1),$n.copy(this.matrixWorld).invert(),e.parent!==null&&(e.parent.updateWorldMatrix(!0,!1),$n.multiply(e.parent.matrixWorld)),e.applyMatrix4($n),e.removeFromParent(),e.parent=this,this.children.push(e),e.updateWorldMatrix(!1,!0),e.dispatchEvent(Ml),us.child=e,this.dispatchEvent(us),us.child=null,this}getObjectById(e){return this.getObjectByProperty("id",e)}getObjectByName(e){return this.getObjectByProperty("name",e)}getObjectByProperty(e,t){if(this[e]===t)return this;for(let n=0,i=this.children.length;n<i;n++){const o=this.children[n].getObjectByProperty(e,t);if(o!==void 0)return o}}getObjectsByProperty(e,t,n=[]){this[e]===t&&n.push(this);const i=this.children;for(let r=0,o=i.length;r<o;r++)i[r].getObjectsByProperty(e,t,n);return n}getWorldPosition(e){return this.updateWorldMatrix(!0,!1),e.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ws,e,gf),e}getWorldScale(e){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Ws,_f,e),e}getWorldDirection(e){this.updateWorldMatrix(!0,!1);const t=this.matrixWorld.elements;return e.set(t[8],t[9],t[10]).normalize()}raycast(){}traverse(e){e(this);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverse(e)}traverseVisible(e){if(this.visible===!1)return;e(this);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].traverseVisible(e)}traverseAncestors(e){const t=this.parent;t!==null&&(e(t),t.traverseAncestors(e))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(e){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||e)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,e=!0);const t=this.children;for(let n=0,i=t.length;n<i;n++)t[n].updateMatrixWorld(e)}updateWorldMatrix(e,t){const n=this.parent;if(e===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),t===!0){const i=this.children;for(let r=0,o=i.length;r<o;r++)i[r].updateWorldMatrix(!1,!0)}}toJSON(e){const t=e===void 0||typeof e=="string",n={};t&&(e={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});const i={};i.uuid=this.uuid,i.type=this.type,this.name!==""&&(i.name=this.name),this.castShadow===!0&&(i.castShadow=!0),this.receiveShadow===!0&&(i.receiveShadow=!0),this.visible===!1&&(i.visible=!1),this.frustumCulled===!1&&(i.frustumCulled=!1),this.renderOrder!==0&&(i.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(i.userData=this.userData),i.layers=this.layers.mask,i.matrix=this.matrix.toArray(),i.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(i.matrixAutoUpdate=!1),this.isInstancedMesh&&(i.type="InstancedMesh",i.count=this.count,i.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(i.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(i.type="BatchedMesh",i.perObjectFrustumCulled=this.perObjectFrustumCulled,i.sortObjects=this.sortObjects,i.drawRanges=this._drawRanges,i.reservedRanges=this._reservedRanges,i.geometryInfo=this._geometryInfo.map(a=>({...a,boundingBox:a.boundingBox?a.boundingBox.toJSON():void 0,boundingSphere:a.boundingSphere?a.boundingSphere.toJSON():void 0})),i.instanceInfo=this._instanceInfo.map(a=>({...a})),i.availableInstanceIds=this._availableInstanceIds.slice(),i.availableGeometryIds=this._availableGeometryIds.slice(),i.nextIndexStart=this._nextIndexStart,i.nextVertexStart=this._nextVertexStart,i.geometryCount=this._geometryCount,i.maxInstanceCount=this._maxInstanceCount,i.maxVertexCount=this._maxVertexCount,i.maxIndexCount=this._maxIndexCount,i.geometryInitialized=this._geometryInitialized,i.matricesTexture=this._matricesTexture.toJSON(e),i.indirectTexture=this._indirectTexture.toJSON(e),this._colorsTexture!==null&&(i.colorsTexture=this._colorsTexture.toJSON(e)),this.boundingSphere!==null&&(i.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(i.boundingBox=this.boundingBox.toJSON()));function r(a,l){return a[l.uuid]===void 0&&(a[l.uuid]=l.toJSON(e)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?i.background=this.background.toJSON():this.background.isTexture&&(i.background=this.background.toJSON(e).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(i.environment=this.environment.toJSON(e).uuid);else if(this.isMesh||this.isLine||this.isPoints){i.geometry=r(e.geometries,this.geometry);const a=this.geometry.parameters;if(a!==void 0&&a.shapes!==void 0){const l=a.shapes;if(Array.isArray(l))for(let c=0,h=l.length;c<h;c++){const u=l[c];r(e.shapes,u)}else r(e.shapes,l)}}if(this.isSkinnedMesh&&(i.bindMode=this.bindMode,i.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(e.skeletons,this.skeleton),i.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){const a=[];for(let l=0,c=this.material.length;l<c;l++)a.push(r(e.materials,this.material[l]));i.material=a}else i.material=r(e.materials,this.material);if(this.children.length>0){i.children=[];for(let a=0;a<this.children.length;a++)i.children.push(this.children[a].toJSON(e).object)}if(this.animations.length>0){i.animations=[];for(let a=0;a<this.animations.length;a++){const l=this.animations[a];i.animations.push(r(e.animations,l))}}if(t){const a=o(e.geometries),l=o(e.materials),c=o(e.textures),h=o(e.images),u=o(e.shapes),d=o(e.skeletons),f=o(e.animations),g=o(e.nodes);a.length>0&&(n.geometries=a),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),h.length>0&&(n.images=h),u.length>0&&(n.shapes=u),d.length>0&&(n.skeletons=d),f.length>0&&(n.animations=f),g.length>0&&(n.nodes=g)}return n.object=i,n;function o(a){const l=[];for(const c in a){const h=a[c];delete h.metadata,l.push(h)}return l}}clone(e){return new this.constructor().copy(this,e)}copy(e,t=!0){if(this.name=e.name,this.up.copy(e.up),this.position.copy(e.position),this.rotation.order=e.rotation.order,this.quaternion.copy(e.quaternion),this.scale.copy(e.scale),this.matrix.copy(e.matrix),this.matrixWorld.copy(e.matrixWorld),this.matrixAutoUpdate=e.matrixAutoUpdate,this.matrixWorldAutoUpdate=e.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=e.matrixWorldNeedsUpdate,this.layers.mask=e.layers.mask,this.visible=e.visible,this.castShadow=e.castShadow,this.receiveShadow=e.receiveShadow,this.frustumCulled=e.frustumCulled,this.renderOrder=e.renderOrder,this.animations=e.animations.slice(),this.userData=JSON.parse(JSON.stringify(e.userData)),t===!0)for(let n=0;n<e.children.length;n++){const i=e.children[n];this.add(i.clone())}return this}}Et.DEFAULT_UP=new P(0,1,0);Et.DEFAULT_MATRIX_AUTO_UPDATE=!0;Et.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;const An=new P,Qn=new P,Ho=new P,ei=new P,ds=new P,fs=new P,yl=new P,Vo=new P,Go=new P,Wo=new P,Xo=new ht,qo=new ht,Yo=new ht;class In{constructor(e=new P,t=new P,n=new P){this.a=e,this.b=t,this.c=n}static getNormal(e,t,n,i){i.subVectors(n,t),An.subVectors(e,t),i.cross(An);const r=i.lengthSq();return r>0?i.multiplyScalar(1/Math.sqrt(r)):i.set(0,0,0)}static getBarycoord(e,t,n,i,r){An.subVectors(i,t),Qn.subVectors(n,t),Ho.subVectors(e,t);const o=An.dot(An),a=An.dot(Qn),l=An.dot(Ho),c=Qn.dot(Qn),h=Qn.dot(Ho),u=o*c-a*a;if(u===0)return r.set(0,0,0),null;const d=1/u,f=(c*l-a*h)*d,g=(o*h-a*l)*d;return r.set(1-f-g,g,f)}static containsPoint(e,t,n,i){return this.getBarycoord(e,t,n,i,ei)===null?!1:ei.x>=0&&ei.y>=0&&ei.x+ei.y<=1}static getInterpolation(e,t,n,i,r,o,a,l){return this.getBarycoord(e,t,n,i,ei)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,ei.x),l.addScaledVector(o,ei.y),l.addScaledVector(a,ei.z),l)}static getInterpolatedAttribute(e,t,n,i,r,o){return Xo.setScalar(0),qo.setScalar(0),Yo.setScalar(0),Xo.fromBufferAttribute(e,t),qo.fromBufferAttribute(e,n),Yo.fromBufferAttribute(e,i),o.setScalar(0),o.addScaledVector(Xo,r.x),o.addScaledVector(qo,r.y),o.addScaledVector(Yo,r.z),o}static isFrontFacing(e,t,n,i){return An.subVectors(n,t),Qn.subVectors(e,t),An.cross(Qn).dot(i)<0}set(e,t,n){return this.a.copy(e),this.b.copy(t),this.c.copy(n),this}setFromPointsAndIndices(e,t,n,i){return this.a.copy(e[t]),this.b.copy(e[n]),this.c.copy(e[i]),this}setFromAttributeAndIndices(e,t,n,i){return this.a.fromBufferAttribute(e,t),this.b.fromBufferAttribute(e,n),this.c.fromBufferAttribute(e,i),this}clone(){return new this.constructor().copy(this)}copy(e){return this.a.copy(e.a),this.b.copy(e.b),this.c.copy(e.c),this}getArea(){return An.subVectors(this.c,this.b),Qn.subVectors(this.a,this.b),An.cross(Qn).length()*.5}getMidpoint(e){return e.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(e){return In.getNormal(this.a,this.b,this.c,e)}getPlane(e){return e.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(e,t){return In.getBarycoord(e,this.a,this.b,this.c,t)}getInterpolation(e,t,n,i,r){return In.getInterpolation(e,this.a,this.b,this.c,t,n,i,r)}containsPoint(e){return In.containsPoint(e,this.a,this.b,this.c)}isFrontFacing(e){return In.isFrontFacing(this.a,this.b,this.c,e)}intersectsBox(e){return e.intersectsTriangle(this)}closestPointToPoint(e,t){const n=this.a,i=this.b,r=this.c;let o,a;ds.subVectors(i,n),fs.subVectors(r,n),Vo.subVectors(e,n);const l=ds.dot(Vo),c=fs.dot(Vo);if(l<=0&&c<=0)return t.copy(n);Go.subVectors(e,i);const h=ds.dot(Go),u=fs.dot(Go);if(h>=0&&u<=h)return t.copy(i);const d=l*u-h*c;if(d<=0&&l>=0&&h<=0)return o=l/(l-h),t.copy(n).addScaledVector(ds,o);Wo.subVectors(e,r);const f=ds.dot(Wo),g=fs.dot(Wo);if(g>=0&&f<=g)return t.copy(r);const x=f*c-l*g;if(x<=0&&c>=0&&g<=0)return a=c/(c-g),t.copy(n).addScaledVector(fs,a);const m=h*g-f*u;if(m<=0&&u-h>=0&&f-g>=0)return yl.subVectors(r,i),a=(u-h)/(u-h+(f-g)),t.copy(i).addScaledVector(yl,a);const p=1/(m+x+d);return o=x*p,a=d*p,t.copy(n).addScaledVector(ds,o).addScaledVector(fs,a)}equals(e){return e.a.equals(this.a)&&e.b.equals(this.b)&&e.c.equals(this.c)}}const Qh={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},yi={h:0,s:0,l:0},Cr={h:0,s:0,l:0};function jo(s,e,t){return t<0&&(t+=1),t>1&&(t-=1),t<1/6?s+(e-s)*6*t:t<1/2?e:t<2/3?s+(e-s)*6*(2/3-t):s}class Ye{constructor(e,t,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(e,t,n)}set(e,t,n){if(t===void 0&&n===void 0){const i=e;i&&i.isColor?this.copy(i):typeof i=="number"?this.setHex(i):typeof i=="string"&&this.setStyle(i)}else this.setRGB(e,t,n);return this}setScalar(e){return this.r=e,this.g=e,this.b=e,this}setHex(e,t=Mt){return e=Math.floor(e),this.r=(e>>16&255)/255,this.g=(e>>8&255)/255,this.b=(e&255)/255,ot.colorSpaceToWorking(this,t),this}setRGB(e,t,n,i=ot.workingColorSpace){return this.r=e,this.g=t,this.b=n,ot.colorSpaceToWorking(this,i),this}setHSL(e,t,n,i=ot.workingColorSpace){if(e=Dc(e,1),t=et(t,0,1),n=et(n,0,1),t===0)this.r=this.g=this.b=n;else{const r=n<=.5?n*(1+t):n+t-n*t,o=2*n-r;this.r=jo(o,r,e+1/3),this.g=jo(o,r,e),this.b=jo(o,r,e-1/3)}return ot.colorSpaceToWorking(this,i),this}setStyle(e,t=Mt){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+e+" will be ignored.")}let i;if(i=/^(\w+)\(([^\)]*)\)/.exec(e)){let r;const o=i[1],a=i[2];switch(o){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,t);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,t);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(a))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,t);break;default:console.warn("THREE.Color: Unknown color model "+e)}}else if(i=/^\#([A-Fa-f\d]+)$/.exec(e)){const r=i[1],o=r.length;if(o===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,t);if(o===6)return this.setHex(parseInt(r,16),t);console.warn("THREE.Color: Invalid hex color "+e)}else if(e&&e.length>0)return this.setColorName(e,t);return this}setColorName(e,t=Mt){const n=Qh[e.toLowerCase()];return n!==void 0?this.setHex(n,t):console.warn("THREE.Color: Unknown color "+e),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(e){return this.r=e.r,this.g=e.g,this.b=e.b,this}copySRGBToLinear(e){return this.r=li(e.r),this.g=li(e.g),this.b=li(e.b),this}copyLinearToSRGB(e){return this.r=Es(e.r),this.g=Es(e.g),this.b=Es(e.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(e=Mt){return ot.workingToColorSpace(Gt.copy(this),e),Math.round(et(Gt.r*255,0,255))*65536+Math.round(et(Gt.g*255,0,255))*256+Math.round(et(Gt.b*255,0,255))}getHexString(e=Mt){return("000000"+this.getHex(e).toString(16)).slice(-6)}getHSL(e,t=ot.workingColorSpace){ot.workingToColorSpace(Gt.copy(this),t);const n=Gt.r,i=Gt.g,r=Gt.b,o=Math.max(n,i,r),a=Math.min(n,i,r);let l,c;const h=(a+o)/2;if(a===o)l=0,c=0;else{const u=o-a;switch(c=h<=.5?u/(o+a):u/(2-o-a),o){case n:l=(i-r)/u+(i<r?6:0);break;case i:l=(r-n)/u+2;break;case r:l=(n-i)/u+4;break}l/=6}return e.h=l,e.s=c,e.l=h,e}getRGB(e,t=ot.workingColorSpace){return ot.workingToColorSpace(Gt.copy(this),t),e.r=Gt.r,e.g=Gt.g,e.b=Gt.b,e}getStyle(e=Mt){ot.workingToColorSpace(Gt.copy(this),e);const t=Gt.r,n=Gt.g,i=Gt.b;return e!==Mt?`color(${e} ${t.toFixed(3)} ${n.toFixed(3)} ${i.toFixed(3)})`:`rgb(${Math.round(t*255)},${Math.round(n*255)},${Math.round(i*255)})`}offsetHSL(e,t,n){return this.getHSL(yi),this.setHSL(yi.h+e,yi.s+t,yi.l+n)}add(e){return this.r+=e.r,this.g+=e.g,this.b+=e.b,this}addColors(e,t){return this.r=e.r+t.r,this.g=e.g+t.g,this.b=e.b+t.b,this}addScalar(e){return this.r+=e,this.g+=e,this.b+=e,this}sub(e){return this.r=Math.max(0,this.r-e.r),this.g=Math.max(0,this.g-e.g),this.b=Math.max(0,this.b-e.b),this}multiply(e){return this.r*=e.r,this.g*=e.g,this.b*=e.b,this}multiplyScalar(e){return this.r*=e,this.g*=e,this.b*=e,this}lerp(e,t){return this.r+=(e.r-this.r)*t,this.g+=(e.g-this.g)*t,this.b+=(e.b-this.b)*t,this}lerpColors(e,t,n){return this.r=e.r+(t.r-e.r)*n,this.g=e.g+(t.g-e.g)*n,this.b=e.b+(t.b-e.b)*n,this}lerpHSL(e,t){this.getHSL(yi),e.getHSL(Cr);const n=tr(yi.h,Cr.h,t),i=tr(yi.s,Cr.s,t),r=tr(yi.l,Cr.l,t);return this.setHSL(n,i,r),this}setFromVector3(e){return this.r=e.x,this.g=e.y,this.b=e.z,this}applyMatrix3(e){const t=this.r,n=this.g,i=this.b,r=e.elements;return this.r=r[0]*t+r[3]*n+r[6]*i,this.g=r[1]*t+r[4]*n+r[7]*i,this.b=r[2]*t+r[5]*n+r[8]*i,this}equals(e){return e.r===this.r&&e.g===this.g&&e.b===this.b}fromArray(e,t=0){return this.r=e[t],this.g=e[t+1],this.b=e[t+2],this}toArray(e=[],t=0){return e[t]=this.r,e[t+1]=this.g,e[t+2]=this.b,e}fromBufferAttribute(e,t){return this.r=e.getX(t),this.g=e.getY(t),this.b=e.getZ(t),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}}const Gt=new Ye;Ye.NAMES=Qh;let vf=0;class Hn extends ts{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:vf++}),this.uuid=Dn(),this.name="",this.type="Material",this.blending=Ss,this.side=ui,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Ea,this.blendDst=Ta,this.blendEquation=Yi,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new Ye(0,0,0),this.blendAlpha=0,this.depthFunc=ws,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=al,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=ss,this.stencilZFail=ss,this.stencilZPass=ss,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(e){this._alphaTest>0!=e>0&&this.version++,this._alphaTest=e}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(e){if(e!==void 0)for(const t in e){const n=e[t];if(n===void 0){console.warn(`THREE.Material: parameter '${t}' has value of undefined.`);continue}const i=this[t];if(i===void 0){console.warn(`THREE.Material: '${t}' is not a property of THREE.${this.type}.`);continue}i&&i.isColor?i.set(n):i&&i.isVector3&&n&&n.isVector3?i.copy(n):this[t]=n}}toJSON(e){const t=e===void 0||typeof e=="string";t&&(e={textures:{},images:{}});const n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(e).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(e).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(e).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(e).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(e).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(e).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(e).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(e).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(e).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(e).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(e).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(e).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(e).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(e).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(e).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(e).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(e).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(e).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(e).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(e).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(e).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(e).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(e).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(e).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(e).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(e).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==Ss&&(n.blending=this.blending),this.side!==ui&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==Ea&&(n.blendSrc=this.blendSrc),this.blendDst!==Ta&&(n.blendDst=this.blendDst),this.blendEquation!==Yi&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==ws&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==al&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==ss&&(n.stencilFail=this.stencilFail),this.stencilZFail!==ss&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==ss&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function i(r){const o=[];for(const a in r){const l=r[a];delete l.metadata,o.push(l)}return o}if(t){const r=i(e.textures),o=i(e.images);r.length>0&&(n.textures=r),o.length>0&&(n.images=o)}return n}clone(){return new this.constructor().copy(this)}copy(e){this.name=e.name,this.blending=e.blending,this.side=e.side,this.vertexColors=e.vertexColors,this.opacity=e.opacity,this.transparent=e.transparent,this.blendSrc=e.blendSrc,this.blendDst=e.blendDst,this.blendEquation=e.blendEquation,this.blendSrcAlpha=e.blendSrcAlpha,this.blendDstAlpha=e.blendDstAlpha,this.blendEquationAlpha=e.blendEquationAlpha,this.blendColor.copy(e.blendColor),this.blendAlpha=e.blendAlpha,this.depthFunc=e.depthFunc,this.depthTest=e.depthTest,this.depthWrite=e.depthWrite,this.stencilWriteMask=e.stencilWriteMask,this.stencilFunc=e.stencilFunc,this.stencilRef=e.stencilRef,this.stencilFuncMask=e.stencilFuncMask,this.stencilFail=e.stencilFail,this.stencilZFail=e.stencilZFail,this.stencilZPass=e.stencilZPass,this.stencilWrite=e.stencilWrite;const t=e.clippingPlanes;let n=null;if(t!==null){const i=t.length;n=new Array(i);for(let r=0;r!==i;++r)n[r]=t[r].clone()}return this.clippingPlanes=n,this.clipIntersection=e.clipIntersection,this.clipShadows=e.clipShadows,this.shadowSide=e.shadowSide,this.colorWrite=e.colorWrite,this.precision=e.precision,this.polygonOffset=e.polygonOffset,this.polygonOffsetFactor=e.polygonOffsetFactor,this.polygonOffsetUnits=e.polygonOffsetUnits,this.dithering=e.dithering,this.alphaTest=e.alphaTest,this.alphaHash=e.alphaHash,this.alphaToCoverage=e.alphaToCoverage,this.premultipliedAlpha=e.premultipliedAlpha,this.forceSinglePass=e.forceSinglePass,this.visible=e.visible,this.toneMapped=e.toneMapped,this.userData=JSON.parse(JSON.stringify(e.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(e){e===!0&&this.version++}}class Xt extends Hn{constructor(e){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new Ye(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Wn,this.combine=Fh,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.specularMap=e.specularMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.combine=e.combine,this.reflectivity=e.reflectivity,this.refractionRatio=e.refractionRatio,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.fog=e.fog,this}}const It=new P,Ir=new Oe;let Mf=0;class Yt{constructor(e,t,n=!1){if(Array.isArray(e))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Mf++}),this.name="",this.array=e,this.itemSize=t,this.count=e!==void 0?e.length/t:0,this.normalized=n,this.usage=lc,this.updateRanges=[],this.gpuType=Pn,this.version=0}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.name=e.name,this.array=new e.array.constructor(e.array),this.itemSize=e.itemSize,this.count=e.count,this.normalized=e.normalized,this.usage=e.usage,this.gpuType=e.gpuType,this}copyAt(e,t,n){e*=this.itemSize,n*=t.itemSize;for(let i=0,r=this.itemSize;i<r;i++)this.array[e+i]=t.array[n+i];return this}copyArray(e){return this.array.set(e),this}applyMatrix3(e){if(this.itemSize===2)for(let t=0,n=this.count;t<n;t++)Ir.fromBufferAttribute(this,t),Ir.applyMatrix3(e),this.setXY(t,Ir.x,Ir.y);else if(this.itemSize===3)for(let t=0,n=this.count;t<n;t++)It.fromBufferAttribute(this,t),It.applyMatrix3(e),this.setXYZ(t,It.x,It.y,It.z);return this}applyMatrix4(e){for(let t=0,n=this.count;t<n;t++)It.fromBufferAttribute(this,t),It.applyMatrix4(e),this.setXYZ(t,It.x,It.y,It.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)It.fromBufferAttribute(this,t),It.applyNormalMatrix(e),this.setXYZ(t,It.x,It.y,It.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)It.fromBufferAttribute(this,t),It.transformDirection(e),this.setXYZ(t,It.x,It.y,It.z);return this}set(e,t=0){return this.array.set(e,t),this}getComponent(e,t){let n=this.array[e*this.itemSize+t];return this.normalized&&(n=Cn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=pt(n,this.array)),this.array[e*this.itemSize+t]=n,this}getX(e){let t=this.array[e*this.itemSize];return this.normalized&&(t=Cn(t,this.array)),t}setX(e,t){return this.normalized&&(t=pt(t,this.array)),this.array[e*this.itemSize]=t,this}getY(e){let t=this.array[e*this.itemSize+1];return this.normalized&&(t=Cn(t,this.array)),t}setY(e,t){return this.normalized&&(t=pt(t,this.array)),this.array[e*this.itemSize+1]=t,this}getZ(e){let t=this.array[e*this.itemSize+2];return this.normalized&&(t=Cn(t,this.array)),t}setZ(e,t){return this.normalized&&(t=pt(t,this.array)),this.array[e*this.itemSize+2]=t,this}getW(e){let t=this.array[e*this.itemSize+3];return this.normalized&&(t=Cn(t,this.array)),t}setW(e,t){return this.normalized&&(t=pt(t,this.array)),this.array[e*this.itemSize+3]=t,this}setXY(e,t,n){return e*=this.itemSize,this.normalized&&(t=pt(t,this.array),n=pt(n,this.array)),this.array[e+0]=t,this.array[e+1]=n,this}setXYZ(e,t,n,i){return e*=this.itemSize,this.normalized&&(t=pt(t,this.array),n=pt(n,this.array),i=pt(i,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this}setXYZW(e,t,n,i,r){return e*=this.itemSize,this.normalized&&(t=pt(t,this.array),n=pt(n,this.array),i=pt(i,this.array),r=pt(r,this.array)),this.array[e+0]=t,this.array[e+1]=n,this.array[e+2]=i,this.array[e+3]=r,this}onUpload(e){return this.onUploadCallback=e,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){const e={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(e.name=this.name),this.usage!==lc&&(e.usage=this.usage),e}}class eu extends Yt{constructor(e,t,n){super(new Uint16Array(e),t,n)}}class tu extends Yt{constructor(e,t,n){super(new Uint32Array(e),t,n)}}class We extends Yt{constructor(e,t,n){super(new Float32Array(e),t,n)}}let yf=0;const yn=new Ze,Ko=new Et,ps=new P,hn=new Yn,Xs=new Yn,zt=new P;class dt extends ts{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:yf++}),this.uuid=Dn(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(e){return Array.isArray(e)?this.index=new(Jh(e)?tu:eu)(e,1):this.index=e,this}setIndirect(e){return this.indirect=e,this}getIndirect(){return this.indirect}getAttribute(e){return this.attributes[e]}setAttribute(e,t){return this.attributes[e]=t,this}deleteAttribute(e){return delete this.attributes[e],this}hasAttribute(e){return this.attributes[e]!==void 0}addGroup(e,t,n=0){this.groups.push({start:e,count:t,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(e,t){this.drawRange.start=e,this.drawRange.count=t}applyMatrix4(e){const t=this.attributes.position;t!==void 0&&(t.applyMatrix4(e),t.needsUpdate=!0);const n=this.attributes.normal;if(n!==void 0){const r=new $e().getNormalMatrix(e);n.applyNormalMatrix(r),n.needsUpdate=!0}const i=this.attributes.tangent;return i!==void 0&&(i.transformDirection(e),i.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(e){return yn.makeRotationFromQuaternion(e),this.applyMatrix4(yn),this}rotateX(e){return yn.makeRotationX(e),this.applyMatrix4(yn),this}rotateY(e){return yn.makeRotationY(e),this.applyMatrix4(yn),this}rotateZ(e){return yn.makeRotationZ(e),this.applyMatrix4(yn),this}translate(e,t,n){return yn.makeTranslation(e,t,n),this.applyMatrix4(yn),this}scale(e,t,n){return yn.makeScale(e,t,n),this.applyMatrix4(yn),this}lookAt(e){return Ko.lookAt(e),Ko.updateMatrix(),this.applyMatrix4(Ko.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(ps).negate(),this.translate(ps.x,ps.y,ps.z),this}setFromPoints(e){const t=this.getAttribute("position");if(t===void 0){const n=[];for(let i=0,r=e.length;i<r;i++){const o=e[i];n.push(o.x,o.y,o.z||0)}this.setAttribute("position",new We(n,3))}else{const n=Math.min(e.length,t.count);for(let i=0;i<n;i++){const r=e[i];t.setXYZ(i,r.x,r.y,r.z||0)}e.length>t.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),t.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new Yn);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new P(-1/0,-1/0,-1/0),new P(1/0,1/0,1/0));return}if(e!==void 0){if(this.boundingBox.setFromBufferAttribute(e),t)for(let n=0,i=t.length;n<i;n++){const r=t[n];hn.setFromBufferAttribute(r),this.morphTargetsRelative?(zt.addVectors(this.boundingBox.min,hn.min),this.boundingBox.expandByPoint(zt),zt.addVectors(this.boundingBox.max,hn.max),this.boundingBox.expandByPoint(zt)):(this.boundingBox.expandByPoint(hn.min),this.boundingBox.expandByPoint(hn.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new jn);const e=this.attributes.position,t=this.morphAttributes.position;if(e&&e.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new P,1/0);return}if(e){const n=this.boundingSphere.center;if(hn.setFromBufferAttribute(e),t)for(let r=0,o=t.length;r<o;r++){const a=t[r];Xs.setFromBufferAttribute(a),this.morphTargetsRelative?(zt.addVectors(hn.min,Xs.min),hn.expandByPoint(zt),zt.addVectors(hn.max,Xs.max),hn.expandByPoint(zt)):(hn.expandByPoint(Xs.min),hn.expandByPoint(Xs.max))}hn.getCenter(n);let i=0;for(let r=0,o=e.count;r<o;r++)zt.fromBufferAttribute(e,r),i=Math.max(i,n.distanceToSquared(zt));if(t)for(let r=0,o=t.length;r<o;r++){const a=t[r],l=this.morphTargetsRelative;for(let c=0,h=a.count;c<h;c++)zt.fromBufferAttribute(a,c),l&&(ps.fromBufferAttribute(e,c),zt.add(ps)),i=Math.max(i,n.distanceToSquared(zt))}this.boundingSphere.radius=Math.sqrt(i),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){const e=this.index,t=this.attributes;if(e===null||t.position===void 0||t.normal===void 0||t.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}const n=t.position,i=t.normal,r=t.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new Yt(new Float32Array(4*n.count),4));const o=this.getAttribute("tangent"),a=[],l=[];for(let I=0;I<n.count;I++)a[I]=new P,l[I]=new P;const c=new P,h=new P,u=new P,d=new Oe,f=new Oe,g=new Oe,x=new P,m=new P;function p(I,T,b){c.fromBufferAttribute(n,I),h.fromBufferAttribute(n,T),u.fromBufferAttribute(n,b),d.fromBufferAttribute(r,I),f.fromBufferAttribute(r,T),g.fromBufferAttribute(r,b),h.sub(c),u.sub(c),f.sub(d),g.sub(d);const U=1/(f.x*g.y-g.x*f.y);isFinite(U)&&(x.copy(h).multiplyScalar(g.y).addScaledVector(u,-f.y).multiplyScalar(U),m.copy(u).multiplyScalar(f.x).addScaledVector(h,-g.x).multiplyScalar(U),a[I].add(x),a[T].add(x),a[b].add(x),l[I].add(m),l[T].add(m),l[b].add(m))}let M=this.groups;M.length===0&&(M=[{start:0,count:e.count}]);for(let I=0,T=M.length;I<T;++I){const b=M[I],U=b.start,V=b.count;for(let F=U,O=U+V;F<O;F+=3)p(e.getX(F+0),e.getX(F+1),e.getX(F+2))}const y=new P,v=new P,w=new P,S=new P;function R(I){w.fromBufferAttribute(i,I),S.copy(w);const T=a[I];y.copy(T),y.sub(w.multiplyScalar(w.dot(T))).normalize(),v.crossVectors(S,T);const U=v.dot(l[I])<0?-1:1;o.setXYZW(I,y.x,y.y,y.z,U)}for(let I=0,T=M.length;I<T;++I){const b=M[I],U=b.start,V=b.count;for(let F=U,O=U+V;F<O;F+=3)R(e.getX(F+0)),R(e.getX(F+1)),R(e.getX(F+2))}}computeVertexNormals(){const e=this.index,t=this.getAttribute("position");if(t!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new Yt(new Float32Array(t.count*3),3),this.setAttribute("normal",n);else for(let d=0,f=n.count;d<f;d++)n.setXYZ(d,0,0,0);const i=new P,r=new P,o=new P,a=new P,l=new P,c=new P,h=new P,u=new P;if(e)for(let d=0,f=e.count;d<f;d+=3){const g=e.getX(d+0),x=e.getX(d+1),m=e.getX(d+2);i.fromBufferAttribute(t,g),r.fromBufferAttribute(t,x),o.fromBufferAttribute(t,m),h.subVectors(o,r),u.subVectors(i,r),h.cross(u),a.fromBufferAttribute(n,g),l.fromBufferAttribute(n,x),c.fromBufferAttribute(n,m),a.add(h),l.add(h),c.add(h),n.setXYZ(g,a.x,a.y,a.z),n.setXYZ(x,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let d=0,f=t.count;d<f;d+=3)i.fromBufferAttribute(t,d+0),r.fromBufferAttribute(t,d+1),o.fromBufferAttribute(t,d+2),h.subVectors(o,r),u.subVectors(i,r),h.cross(u),n.setXYZ(d+0,h.x,h.y,h.z),n.setXYZ(d+1,h.x,h.y,h.z),n.setXYZ(d+2,h.x,h.y,h.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){const e=this.attributes.normal;for(let t=0,n=e.count;t<n;t++)zt.fromBufferAttribute(e,t),zt.normalize(),e.setXYZ(t,zt.x,zt.y,zt.z)}toNonIndexed(){function e(a,l){const c=a.array,h=a.itemSize,u=a.normalized,d=new c.constructor(l.length*h);let f=0,g=0;for(let x=0,m=l.length;x<m;x++){a.isInterleavedBufferAttribute?f=l[x]*a.data.stride+a.offset:f=l[x]*h;for(let p=0;p<h;p++)d[g++]=c[f++]}return new Yt(d,h,u)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;const t=new dt,n=this.index.array,i=this.attributes;for(const a in i){const l=i[a],c=e(l,n);t.setAttribute(a,c)}const r=this.morphAttributes;for(const a in r){const l=[],c=r[a];for(let h=0,u=c.length;h<u;h++){const d=c[h],f=e(d,n);l.push(f)}t.morphAttributes[a]=l}t.morphTargetsRelative=this.morphTargetsRelative;const o=this.groups;for(let a=0,l=o.length;a<l;a++){const c=o[a];t.addGroup(c.start,c.count,c.materialIndex)}return t}toJSON(){const e={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(e.uuid=this.uuid,e.type=this.type,this.name!==""&&(e.name=this.name),Object.keys(this.userData).length>0&&(e.userData=this.userData),this.parameters!==void 0){const l=this.parameters;for(const c in l)l[c]!==void 0&&(e[c]=l[c]);return e}e.data={attributes:{}};const t=this.index;t!==null&&(e.data.index={type:t.array.constructor.name,array:Array.prototype.slice.call(t.array)});const n=this.attributes;for(const l in n){const c=n[l];e.data.attributes[l]=c.toJSON(e.data)}const i={};let r=!1;for(const l in this.morphAttributes){const c=this.morphAttributes[l],h=[];for(let u=0,d=c.length;u<d;u++){const f=c[u];h.push(f.toJSON(e.data))}h.length>0&&(i[l]=h,r=!0)}r&&(e.data.morphAttributes=i,e.data.morphTargetsRelative=this.morphTargetsRelative);const o=this.groups;o.length>0&&(e.data.groups=JSON.parse(JSON.stringify(o)));const a=this.boundingSphere;return a!==null&&(e.data.boundingSphere=a.toJSON()),e}clone(){return new this.constructor().copy(this)}copy(e){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;const t={};this.name=e.name;const n=e.index;n!==null&&this.setIndex(n.clone());const i=e.attributes;for(const c in i){const h=i[c];this.setAttribute(c,h.clone(t))}const r=e.morphAttributes;for(const c in r){const h=[],u=r[c];for(let d=0,f=u.length;d<f;d++)h.push(u[d].clone(t));this.morphAttributes[c]=h}this.morphTargetsRelative=e.morphTargetsRelative;const o=e.groups;for(let c=0,h=o.length;c<h;c++){const u=o[c];this.addGroup(u.start,u.count,u.materialIndex)}const a=e.boundingBox;a!==null&&(this.boundingBox=a.clone());const l=e.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=e.drawRange.start,this.drawRange.count=e.drawRange.count,this.userData=e.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}}const bl=new Ze,ki=new yo,Pr=new jn,Sl=new P,Lr=new P,Dr=new P,Nr=new P,Jo=new P,Ur=new P,El=new P,Fr=new P;class Fe extends Et{constructor(e=new dt,t=new Xt){super(),this.isMesh=!0,this.type="Mesh",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),e.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=e.morphTargetInfluences.slice()),e.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},e.morphTargetDictionary)),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=i.length;r<o;r++){const a=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}getVertexPosition(e,t){const n=this.geometry,i=n.attributes.position,r=n.morphAttributes.position,o=n.morphTargetsRelative;t.fromBufferAttribute(i,e);const a=this.morphTargetInfluences;if(r&&a){Ur.set(0,0,0);for(let l=0,c=r.length;l<c;l++){const h=a[l],u=r[l];h!==0&&(Jo.fromBufferAttribute(u,e),o?Ur.addScaledVector(Jo,h):Ur.addScaledVector(Jo.sub(t),h))}t.add(Ur)}return t}raycast(e,t){const n=this.geometry,i=this.material,r=this.matrixWorld;i!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Pr.copy(n.boundingSphere),Pr.applyMatrix4(r),ki.copy(e.ray).recast(e.near),!(Pr.containsPoint(ki.origin)===!1&&(ki.intersectSphere(Pr,Sl)===null||ki.origin.distanceToSquared(Sl)>(e.far-e.near)**2))&&(bl.copy(r).invert(),ki.copy(e.ray).applyMatrix4(bl),!(n.boundingBox!==null&&ki.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(e,t,ki)))}_computeIntersections(e,t,n){let i;const r=this.geometry,o=this.material,a=r.index,l=r.attributes.position,c=r.attributes.uv,h=r.attributes.uv1,u=r.attributes.normal,d=r.groups,f=r.drawRange;if(a!==null)if(Array.isArray(o))for(let g=0,x=d.length;g<x;g++){const m=d[g],p=o[m.materialIndex],M=Math.max(m.start,f.start),y=Math.min(a.count,Math.min(m.start+m.count,f.start+f.count));for(let v=M,w=y;v<w;v+=3){const S=a.getX(v),R=a.getX(v+1),I=a.getX(v+2);i=Or(this,p,e,n,c,h,u,S,R,I),i&&(i.faceIndex=Math.floor(v/3),i.face.materialIndex=m.materialIndex,t.push(i))}}else{const g=Math.max(0,f.start),x=Math.min(a.count,f.start+f.count);for(let m=g,p=x;m<p;m+=3){const M=a.getX(m),y=a.getX(m+1),v=a.getX(m+2);i=Or(this,o,e,n,c,h,u,M,y,v),i&&(i.faceIndex=Math.floor(m/3),t.push(i))}}else if(l!==void 0)if(Array.isArray(o))for(let g=0,x=d.length;g<x;g++){const m=d[g],p=o[m.materialIndex],M=Math.max(m.start,f.start),y=Math.min(l.count,Math.min(m.start+m.count,f.start+f.count));for(let v=M,w=y;v<w;v+=3){const S=v,R=v+1,I=v+2;i=Or(this,p,e,n,c,h,u,S,R,I),i&&(i.faceIndex=Math.floor(v/3),i.face.materialIndex=m.materialIndex,t.push(i))}}else{const g=Math.max(0,f.start),x=Math.min(l.count,f.start+f.count);for(let m=g,p=x;m<p;m+=3){const M=m,y=m+1,v=m+2;i=Or(this,o,e,n,c,h,u,M,y,v),i&&(i.faceIndex=Math.floor(m/3),t.push(i))}}}}function bf(s,e,t,n,i,r,o,a){let l;if(e.side===tn?l=n.intersectTriangle(o,r,i,!0,a):l=n.intersectTriangle(i,r,o,e.side===ui,a),l===null)return null;Fr.copy(a),Fr.applyMatrix4(s.matrixWorld);const c=t.ray.origin.distanceTo(Fr);return c<t.near||c>t.far?null:{distance:c,point:Fr.clone(),object:s}}function Or(s,e,t,n,i,r,o,a,l,c){s.getVertexPosition(a,Lr),s.getVertexPosition(l,Dr),s.getVertexPosition(c,Nr);const h=bf(s,e,t,n,Lr,Dr,Nr,El);if(h){const u=new P;In.getBarycoord(El,Lr,Dr,Nr,u),i&&(h.uv=In.getInterpolatedAttribute(i,a,l,c,u,new Oe)),r&&(h.uv1=In.getInterpolatedAttribute(r,a,l,c,u,new Oe)),o&&(h.normal=In.getInterpolatedAttribute(o,a,l,c,u,new P),h.normal.dot(n.direction)>0&&h.normal.multiplyScalar(-1));const d={a,b:l,c,normal:new P,materialIndex:0};In.getNormal(Lr,Dr,Nr,d.normal),h.face=d,h.barycoord=u}return h}class sn extends dt{constructor(e=1,t=1,n=1,i=1,r=1,o=1){super(),this.type="BoxGeometry",this.parameters={width:e,height:t,depth:n,widthSegments:i,heightSegments:r,depthSegments:o};const a=this;i=Math.floor(i),r=Math.floor(r),o=Math.floor(o);const l=[],c=[],h=[],u=[];let d=0,f=0;g("z","y","x",-1,-1,n,t,e,o,r,0),g("z","y","x",1,-1,n,t,-e,o,r,1),g("x","z","y",1,1,e,n,t,i,o,2),g("x","z","y",1,-1,e,n,-t,i,o,3),g("x","y","z",1,-1,e,t,n,i,r,4),g("x","y","z",-1,-1,e,t,-n,i,r,5),this.setIndex(l),this.setAttribute("position",new We(c,3)),this.setAttribute("normal",new We(h,3)),this.setAttribute("uv",new We(u,2));function g(x,m,p,M,y,v,w,S,R,I,T){const b=v/R,U=w/I,V=v/2,F=w/2,O=S/2,W=R+1,J=I+1;let H=0,z=0;const Z=new P;for(let le=0;le<J;le++){const re=le*U-F;for(let _e=0;_e<W;_e++){const me=_e*b-V;Z[x]=me*M,Z[m]=re*y,Z[p]=O,c.push(Z.x,Z.y,Z.z),Z[x]=0,Z[m]=0,Z[p]=S>0?1:-1,h.push(Z.x,Z.y,Z.z),u.push(_e/R),u.push(1-le/I),H+=1}}for(let le=0;le<I;le++)for(let re=0;re<R;re++){const _e=d+re+W*le,me=d+re+W*(le+1),ze=d+(re+1)+W*(le+1),ke=d+(re+1)+W*le;l.push(_e,me,ke),l.push(me,ze,ke),z+=6}a.addGroup(f,z,T),f+=z,d+=H}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new sn(e.width,e.height,e.depth,e.widthSegments,e.heightSegments,e.depthSegments)}}function Is(s){const e={};for(const t in s){e[t]={};for(const n in s[t]){const i=s[t][n];i&&(i.isColor||i.isMatrix3||i.isMatrix4||i.isVector2||i.isVector3||i.isVector4||i.isTexture||i.isQuaternion)?i.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),e[t][n]=null):e[t][n]=i.clone():Array.isArray(i)?e[t][n]=i.slice():e[t][n]=i}}return e}function Jt(s){const e={};for(let t=0;t<s.length;t++){const n=Is(s[t]);for(const i in n)e[i]=n[i]}return e}function Sf(s){const e=[];for(let t=0;t<s.length;t++)e.push(s[t].clone());return e}function nu(s){const e=s.getRenderTarget();return e===null?s.outputColorSpace:e.isXRRenderTarget===!0?e.texture.colorSpace:ot.workingColorSpace}const Ef={clone:Is,merge:Jt};var Tf=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,wf=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`;class Ni extends Hn{constructor(e){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Tf,this.fragmentShader=wf,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,e!==void 0&&this.setValues(e)}copy(e){return super.copy(e),this.fragmentShader=e.fragmentShader,this.vertexShader=e.vertexShader,this.uniforms=Is(e.uniforms),this.uniformsGroups=Sf(e.uniformsGroups),this.defines=Object.assign({},e.defines),this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.fog=e.fog,this.lights=e.lights,this.clipping=e.clipping,this.extensions=Object.assign({},e.extensions),this.glslVersion=e.glslVersion,this}toJSON(e){const t=super.toJSON(e);t.glslVersion=this.glslVersion,t.uniforms={};for(const i in this.uniforms){const o=this.uniforms[i].value;o&&o.isTexture?t.uniforms[i]={type:"t",value:o.toJSON(e).uuid}:o&&o.isColor?t.uniforms[i]={type:"c",value:o.getHex()}:o&&o.isVector2?t.uniforms[i]={type:"v2",value:o.toArray()}:o&&o.isVector3?t.uniforms[i]={type:"v3",value:o.toArray()}:o&&o.isVector4?t.uniforms[i]={type:"v4",value:o.toArray()}:o&&o.isMatrix3?t.uniforms[i]={type:"m3",value:o.toArray()}:o&&o.isMatrix4?t.uniforms[i]={type:"m4",value:o.toArray()}:t.uniforms[i]={value:o}}Object.keys(this.defines).length>0&&(t.defines=this.defines),t.vertexShader=this.vertexShader,t.fragmentShader=this.fragmentShader,t.lights=this.lights,t.clipping=this.clipping;const n={};for(const i in this.extensions)this.extensions[i]===!0&&(n[i]=!0);return Object.keys(n).length>0&&(t.extensions=n),t}}class iu extends Et{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Ze,this.projectionMatrix=new Ze,this.projectionMatrixInverse=new Ze,this.coordinateSystem=kn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(e,t){return super.copy(e,t),this.matrixWorldInverse.copy(e.matrixWorldInverse),this.projectionMatrix.copy(e.projectionMatrix),this.projectionMatrixInverse.copy(e.projectionMatrixInverse),this.coordinateSystem=e.coordinateSystem,this}getWorldDirection(e){return super.getWorldDirection(e).negate()}updateMatrixWorld(e){super.updateMatrixWorld(e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(e,t){super.updateWorldMatrix(e,t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}}const bi=new P,Tl=new Oe,wl=new Oe;class Zt extends iu{constructor(e=50,t=1,n=.1,i=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=e,this.zoom=1,this.near=n,this.far=i,this.focus=10,this.aspect=t,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.fov=e.fov,this.zoom=e.zoom,this.near=e.near,this.far=e.far,this.focus=e.focus,this.aspect=e.aspect,this.view=e.view===null?null:Object.assign({},e.view),this.filmGauge=e.filmGauge,this.filmOffset=e.filmOffset,this}setFocalLength(e){const t=.5*this.getFilmHeight()/e;this.fov=Cs*2*Math.atan(t),this.updateProjectionMatrix()}getFocalLength(){const e=Math.tan(er*.5*this.fov);return .5*this.getFilmHeight()/e}getEffectiveFOV(){return Cs*2*Math.atan(Math.tan(er*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(e,t,n){bi.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),t.set(bi.x,bi.y).multiplyScalar(-e/bi.z),bi.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(bi.x,bi.y).multiplyScalar(-e/bi.z)}getViewSize(e,t){return this.getViewBounds(e,Tl,wl),t.subVectors(wl,Tl)}setViewOffset(e,t,n,i,r,o){this.aspect=e/t,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=this.near;let t=e*Math.tan(er*.5*this.fov)/this.zoom,n=2*t,i=this.aspect*n,r=-.5*i;const o=this.view;if(this.view!==null&&this.view.enabled){const l=o.fullWidth,c=o.fullHeight;r+=o.offsetX*i/l,t-=o.offsetY*n/c,i*=o.width/l,n*=o.height/c}const a=this.filmOffset;a!==0&&(r+=e*a/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+i,t,t-n,e,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.fov=this.fov,t.object.zoom=this.zoom,t.object.near=this.near,t.object.far=this.far,t.object.focus=this.focus,t.object.aspect=this.aspect,this.view!==null&&(t.object.view=Object.assign({},this.view)),t.object.filmGauge=this.filmGauge,t.object.filmOffset=this.filmOffset,t}}const ms=-90,gs=1;class Af extends Et{constructor(e,t,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;const i=new Zt(ms,gs,e,t);i.layers=this.layers,this.add(i);const r=new Zt(ms,gs,e,t);r.layers=this.layers,this.add(r);const o=new Zt(ms,gs,e,t);o.layers=this.layers,this.add(o);const a=new Zt(ms,gs,e,t);a.layers=this.layers,this.add(a);const l=new Zt(ms,gs,e,t);l.layers=this.layers,this.add(l);const c=new Zt(ms,gs,e,t);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){const e=this.coordinateSystem,t=this.children.concat(),[n,i,r,o,a,l]=t;for(const c of t)this.remove(c);if(e===kn)n.up.set(0,1,0),n.lookAt(1,0,0),i.up.set(0,1,0),i.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),o.up.set(0,0,1),o.lookAt(0,-1,0),a.up.set(0,1,0),a.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(e===fo)n.up.set(0,-1,0),n.lookAt(-1,0,0),i.up.set(0,-1,0),i.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),o.up.set(0,0,-1),o.lookAt(0,-1,0),a.up.set(0,-1,0),a.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+e);for(const c of t)this.add(c),c.updateMatrixWorld()}update(e,t){this.parent===null&&this.updateMatrixWorld();const{renderTarget:n,activeMipmapLevel:i}=this;this.coordinateSystem!==e.coordinateSystem&&(this.coordinateSystem=e.coordinateSystem,this.updateCoordinateSystem());const[r,o,a,l,c,h]=this.children,u=e.getRenderTarget(),d=e.getActiveCubeFace(),f=e.getActiveMipmapLevel(),g=e.xr.enabled;e.xr.enabled=!1;const x=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,e.setRenderTarget(n,0,i),e.render(t,r),e.setRenderTarget(n,1,i),e.render(t,o),e.setRenderTarget(n,2,i),e.render(t,a),e.setRenderTarget(n,3,i),e.render(t,l),e.setRenderTarget(n,4,i),e.render(t,c),n.texture.generateMipmaps=x,e.setRenderTarget(n,5,i),e.render(t,h),e.setRenderTarget(u,d,f),e.xr.enabled=g,n.texture.needsPMREMUpdate=!0}}class su extends Nt{constructor(e=[],t=As,n,i,r,o,a,l,c,h){super(e,t,n,i,r,o,a,l,c,h),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(e){this.image=e}}class Rf extends Qi{constructor(e=1,t={}){super(e,e,t),this.isWebGLCubeRenderTarget=!0;const n={width:e,height:e,depth:1},i=[n,n,n,n,n,n];this.texture=new su(i),this._setTextureOptions(t),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(e,t){this.texture.type=t.type,this.texture.colorSpace=t.colorSpace,this.texture.generateMipmaps=t.generateMipmaps,this.texture.minFilter=t.minFilter,this.texture.magFilter=t.magFilter;const n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},i=new sn(5,5,5),r=new Ni({name:"CubemapFromEquirect",uniforms:Is(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:tn,blending:Pi});r.uniforms.tEquirect.value=t;const o=new Fe(i,r),a=t.minFilter;return t.minFilter===ri&&(t.minFilter=pn),new Af(1,10,this).update(e,o),t.minFilter=a,o.geometry.dispose(),o.material.dispose(),this}clear(e,t=!0,n=!0,i=!0){const r=e.getRenderTarget();for(let o=0;o<6;o++)e.setRenderTarget(this,o),e.clear(t,n,i);e.setRenderTarget(r)}}class at extends Et{constructor(){super(),this.isGroup=!0,this.type="Group"}}const Cf={type:"move"};class Zo{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new at,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new at,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new P,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new P),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new at,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new P,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new P),this._grip}dispatchEvent(e){return this._targetRay!==null&&this._targetRay.dispatchEvent(e),this._grip!==null&&this._grip.dispatchEvent(e),this._hand!==null&&this._hand.dispatchEvent(e),this}connect(e){if(e&&e.hand){const t=this._hand;if(t)for(const n of e.hand.values())this._getHandJoint(t,n)}return this.dispatchEvent({type:"connected",data:e}),this}disconnect(e){return this.dispatchEvent({type:"disconnected",data:e}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(e,t,n){let i=null,r=null,o=null;const a=this._targetRay,l=this._grip,c=this._hand;if(e&&t.session.visibilityState!=="visible-blurred"){if(c&&e.hand){o=!0;for(const x of e.hand.values()){const m=t.getJointPose(x,n),p=this._getHandJoint(c,x);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}const h=c.joints["index-finger-tip"],u=c.joints["thumb-tip"],d=h.position.distanceTo(u.position),f=.02,g=.005;c.inputState.pinching&&d>f+g?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:e.handedness,target:this})):!c.inputState.pinching&&d<=f-g&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:e.handedness,target:this}))}else l!==null&&e.gripSpace&&(r=t.getPose(e.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));a!==null&&(i=t.getPose(e.targetRaySpace,n),i===null&&r!==null&&(i=r),i!==null&&(a.matrix.fromArray(i.transform.matrix),a.matrix.decompose(a.position,a.rotation,a.scale),a.matrixWorldNeedsUpdate=!0,i.linearVelocity?(a.hasLinearVelocity=!0,a.linearVelocity.copy(i.linearVelocity)):a.hasLinearVelocity=!1,i.angularVelocity?(a.hasAngularVelocity=!0,a.angularVelocity.copy(i.angularVelocity)):a.hasAngularVelocity=!1,this.dispatchEvent(Cf)))}return a!==null&&(a.visible=i!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=o!==null),this}_getHandJoint(e,t){if(e.joints[t.jointName]===void 0){const n=new at;n.matrixAutoUpdate=!1,n.visible=!1,e.joints[t.jointName]=n,e.add(n)}return e.joints[t.jointName]}}class Uc{constructor(e,t=1,n=1e3){this.isFog=!0,this.name="",this.color=new Ye(e),this.near=t,this.far=n}clone(){return new Uc(this.color,this.near,this.far)}toJSON(){return{type:"Fog",name:this.name,color:this.color.getHex(),near:this.near,far:this.far}}}class If extends Et{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new Wn,this.environmentIntensity=1,this.environmentRotation=new Wn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(e,t){return super.copy(e,t),e.background!==null&&(this.background=e.background.clone()),e.environment!==null&&(this.environment=e.environment.clone()),e.fog!==null&&(this.fog=e.fog.clone()),this.backgroundBlurriness=e.backgroundBlurriness,this.backgroundIntensity=e.backgroundIntensity,this.backgroundRotation.copy(e.backgroundRotation),this.environmentIntensity=e.environmentIntensity,this.environmentRotation.copy(e.environmentRotation),e.overrideMaterial!==null&&(this.overrideMaterial=e.overrideMaterial.clone()),this.matrixAutoUpdate=e.matrixAutoUpdate,this}toJSON(e){const t=super.toJSON(e);return this.fog!==null&&(t.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(t.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(t.object.backgroundIntensity=this.backgroundIntensity),t.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(t.object.environmentIntensity=this.environmentIntensity),t.object.environmentRotation=this.environmentRotation.toArray(),t}}class Pf{constructor(e,t){this.isInterleavedBuffer=!0,this.array=e,this.stride=t,this.count=e!==void 0?e.length/t:0,this.usage=lc,this.updateRanges=[],this.version=0,this.uuid=Dn()}onUploadCallback(){}set needsUpdate(e){e===!0&&this.version++}setUsage(e){return this.usage=e,this}addUpdateRange(e,t){this.updateRanges.push({start:e,count:t})}clearUpdateRanges(){this.updateRanges.length=0}copy(e){return this.array=new e.array.constructor(e.array),this.count=e.count,this.stride=e.stride,this.usage=e.usage,this}copyAt(e,t,n){e*=this.stride,n*=t.stride;for(let i=0,r=this.stride;i<r;i++)this.array[e+i]=t.array[n+i];return this}set(e,t=0){return this.array.set(e,t),this}clone(e){e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Dn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=this.array.slice(0).buffer);const t=new this.array.constructor(e.arrayBuffers[this.array.buffer._uuid]),n=new this.constructor(t,this.stride);return n.setUsage(this.usage),n}onUpload(e){return this.onUploadCallback=e,this}toJSON(e){return e.arrayBuffers===void 0&&(e.arrayBuffers={}),this.array.buffer._uuid===void 0&&(this.array.buffer._uuid=Dn()),e.arrayBuffers[this.array.buffer._uuid]===void 0&&(e.arrayBuffers[this.array.buffer._uuid]=Array.from(new Uint32Array(this.array.buffer))),{uuid:this.uuid,buffer:this.array.buffer._uuid,type:this.array.constructor.name,stride:this.stride}}}const Kt=new P;class Fc{constructor(e,t,n,i=!1){this.isInterleavedBufferAttribute=!0,this.name="",this.data=e,this.itemSize=t,this.offset=n,this.normalized=i}get count(){return this.data.count}get array(){return this.data.array}set needsUpdate(e){this.data.needsUpdate=e}applyMatrix4(e){for(let t=0,n=this.data.count;t<n;t++)Kt.fromBufferAttribute(this,t),Kt.applyMatrix4(e),this.setXYZ(t,Kt.x,Kt.y,Kt.z);return this}applyNormalMatrix(e){for(let t=0,n=this.count;t<n;t++)Kt.fromBufferAttribute(this,t),Kt.applyNormalMatrix(e),this.setXYZ(t,Kt.x,Kt.y,Kt.z);return this}transformDirection(e){for(let t=0,n=this.count;t<n;t++)Kt.fromBufferAttribute(this,t),Kt.transformDirection(e),this.setXYZ(t,Kt.x,Kt.y,Kt.z);return this}getComponent(e,t){let n=this.array[e*this.data.stride+this.offset+t];return this.normalized&&(n=Cn(n,this.array)),n}setComponent(e,t,n){return this.normalized&&(n=pt(n,this.array)),this.data.array[e*this.data.stride+this.offset+t]=n,this}setX(e,t){return this.normalized&&(t=pt(t,this.array)),this.data.array[e*this.data.stride+this.offset]=t,this}setY(e,t){return this.normalized&&(t=pt(t,this.array)),this.data.array[e*this.data.stride+this.offset+1]=t,this}setZ(e,t){return this.normalized&&(t=pt(t,this.array)),this.data.array[e*this.data.stride+this.offset+2]=t,this}setW(e,t){return this.normalized&&(t=pt(t,this.array)),this.data.array[e*this.data.stride+this.offset+3]=t,this}getX(e){let t=this.data.array[e*this.data.stride+this.offset];return this.normalized&&(t=Cn(t,this.array)),t}getY(e){let t=this.data.array[e*this.data.stride+this.offset+1];return this.normalized&&(t=Cn(t,this.array)),t}getZ(e){let t=this.data.array[e*this.data.stride+this.offset+2];return this.normalized&&(t=Cn(t,this.array)),t}getW(e){let t=this.data.array[e*this.data.stride+this.offset+3];return this.normalized&&(t=Cn(t,this.array)),t}setXY(e,t,n){return e=e*this.data.stride+this.offset,this.normalized&&(t=pt(t,this.array),n=pt(n,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this}setXYZ(e,t,n,i){return e=e*this.data.stride+this.offset,this.normalized&&(t=pt(t,this.array),n=pt(n,this.array),i=pt(i,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this}setXYZW(e,t,n,i,r){return e=e*this.data.stride+this.offset,this.normalized&&(t=pt(t,this.array),n=pt(n,this.array),i=pt(i,this.array),r=pt(r,this.array)),this.data.array[e+0]=t,this.data.array[e+1]=n,this.data.array[e+2]=i,this.data.array[e+3]=r,this}clone(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.clone(): Cloning an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const i=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[i+r])}return new Yt(new this.array.constructor(t),this.itemSize,this.normalized)}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.clone(e)),new Fc(e.interleavedBuffers[this.data.uuid],this.itemSize,this.offset,this.normalized)}toJSON(e){if(e===void 0){console.log("THREE.InterleavedBufferAttribute.toJSON(): Serializing an interleaved buffer attribute will de-interleave buffer data.");const t=[];for(let n=0;n<this.count;n++){const i=n*this.data.stride+this.offset;for(let r=0;r<this.itemSize;r++)t.push(this.data.array[i+r])}return{itemSize:this.itemSize,type:this.array.constructor.name,array:t,normalized:this.normalized}}else return e.interleavedBuffers===void 0&&(e.interleavedBuffers={}),e.interleavedBuffers[this.data.uuid]===void 0&&(e.interleavedBuffers[this.data.uuid]=this.data.toJSON(e)),{isInterleavedBufferAttribute:!0,itemSize:this.itemSize,data:this.data.uuid,offset:this.offset,normalized:this.normalized}}}const Al=new P,Rl=new ht,Cl=new ht,Lf=new P,Il=new Ze,zr=new P,$o=new jn,Pl=new Ze,Qo=new yo;class Df extends Fe{constructor(e,t){super(e,t),this.isSkinnedMesh=!0,this.type="SkinnedMesh",this.bindMode=ol,this.bindMatrix=new Ze,this.bindMatrixInverse=new Ze,this.boundingBox=null,this.boundingSphere=null}computeBoundingBox(){const e=this.geometry;this.boundingBox===null&&(this.boundingBox=new Yn),this.boundingBox.makeEmpty();const t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,zr),this.boundingBox.expandByPoint(zr)}computeBoundingSphere(){const e=this.geometry;this.boundingSphere===null&&(this.boundingSphere=new jn),this.boundingSphere.makeEmpty();const t=e.getAttribute("position");for(let n=0;n<t.count;n++)this.getVertexPosition(n,zr),this.boundingSphere.expandByPoint(zr)}copy(e,t){return super.copy(e,t),this.bindMode=e.bindMode,this.bindMatrix.copy(e.bindMatrix),this.bindMatrixInverse.copy(e.bindMatrixInverse),this.skeleton=e.skeleton,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}raycast(e,t){const n=this.material,i=this.matrixWorld;n!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),$o.copy(this.boundingSphere),$o.applyMatrix4(i),e.ray.intersectsSphere($o)!==!1&&(Pl.copy(i).invert(),Qo.copy(e.ray).applyMatrix4(Pl),!(this.boundingBox!==null&&Qo.intersectsBox(this.boundingBox)===!1)&&this._computeIntersections(e,t,Qo)))}getVertexPosition(e,t){return super.getVertexPosition(e,t),this.applyBoneTransform(e,t),t}bind(e,t){this.skeleton=e,t===void 0&&(this.updateMatrixWorld(!0),this.skeleton.calculateInverses(),t=this.matrixWorld),this.bindMatrix.copy(t),this.bindMatrixInverse.copy(t).invert()}pose(){this.skeleton.pose()}normalizeSkinWeights(){const e=new ht,t=this.geometry.attributes.skinWeight;for(let n=0,i=t.count;n<i;n++){e.fromBufferAttribute(t,n);const r=1/e.manhattanLength();r!==1/0?e.multiplyScalar(r):e.set(1,0,0,0),t.setXYZW(n,e.x,e.y,e.z,e.w)}}updateMatrixWorld(e){super.updateMatrixWorld(e),this.bindMode===ol?this.bindMatrixInverse.copy(this.matrixWorld).invert():this.bindMode===Td?this.bindMatrixInverse.copy(this.bindMatrix).invert():console.warn("THREE.SkinnedMesh: Unrecognized bindMode: "+this.bindMode)}applyBoneTransform(e,t){const n=this.skeleton,i=this.geometry;Rl.fromBufferAttribute(i.attributes.skinIndex,e),Cl.fromBufferAttribute(i.attributes.skinWeight,e),Al.copy(t).applyMatrix4(this.bindMatrix),t.set(0,0,0);for(let r=0;r<4;r++){const o=Cl.getComponent(r);if(o!==0){const a=Rl.getComponent(r);Il.multiplyMatrices(n.bones[a].matrixWorld,n.boneInverses[a]),t.addScaledVector(Lf.copy(Al).applyMatrix4(Il),o)}}return t.applyMatrix4(this.bindMatrixInverse)}}class ru extends Et{constructor(){super(),this.isBone=!0,this.type="Bone"}}class ou extends Nt{constructor(e=null,t=1,n=1,i,r,o,a,l,c=$t,h=$t,u,d){super(null,o,a,l,c,h,i,r,u,d),this.isDataTexture=!0,this.image={data:e,width:t,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}}const Ll=new Ze,Nf=new Ze;class Oc{constructor(e=[],t=[]){this.uuid=Dn(),this.bones=e.slice(0),this.boneInverses=t,this.boneMatrices=null,this.boneTexture=null,this.init()}init(){const e=this.bones,t=this.boneInverses;if(this.boneMatrices=new Float32Array(e.length*16),t.length===0)this.calculateInverses();else if(e.length!==t.length){console.warn("THREE.Skeleton: Number of inverse bone matrices does not match amount of bones."),this.boneInverses=[];for(let n=0,i=this.bones.length;n<i;n++)this.boneInverses.push(new Ze)}}calculateInverses(){this.boneInverses.length=0;for(let e=0,t=this.bones.length;e<t;e++){const n=new Ze;this.bones[e]&&n.copy(this.bones[e].matrixWorld).invert(),this.boneInverses.push(n)}}pose(){for(let e=0,t=this.bones.length;e<t;e++){const n=this.bones[e];n&&n.matrixWorld.copy(this.boneInverses[e]).invert()}for(let e=0,t=this.bones.length;e<t;e++){const n=this.bones[e];n&&(n.parent&&n.parent.isBone?(n.matrix.copy(n.parent.matrixWorld).invert(),n.matrix.multiply(n.matrixWorld)):n.matrix.copy(n.matrixWorld),n.matrix.decompose(n.position,n.quaternion,n.scale))}}update(){const e=this.bones,t=this.boneInverses,n=this.boneMatrices,i=this.boneTexture;for(let r=0,o=e.length;r<o;r++){const a=e[r]?e[r].matrixWorld:Nf;Ll.multiplyMatrices(a,t[r]),Ll.toArray(n,r*16)}i!==null&&(i.needsUpdate=!0)}clone(){return new Oc(this.bones,this.boneInverses)}computeBoneTexture(){let e=Math.sqrt(this.bones.length*4);e=Math.ceil(e/4)*4,e=Math.max(e,4);const t=new Float32Array(e*e*4);t.set(this.boneMatrices);const n=new ou(t,e,e,En,Pn);return n.needsUpdate=!0,this.boneMatrices=t,this.boneTexture=n,this}getBoneByName(e){for(let t=0,n=this.bones.length;t<n;t++){const i=this.bones[t];if(i.name===e)return i}}dispose(){this.boneTexture!==null&&(this.boneTexture.dispose(),this.boneTexture=null)}fromJSON(e,t){this.uuid=e.uuid;for(let n=0,i=e.bones.length;n<i;n++){const r=e.bones[n];let o=t[r];o===void 0&&(console.warn("THREE.Skeleton: No bone found with UUID:",r),o=new ru),this.bones.push(o),this.boneInverses.push(new Ze().fromArray(e.boneInverses[n]))}return this.init(),this}toJSON(){const e={metadata:{version:4.7,type:"Skeleton",generator:"Skeleton.toJSON"},bones:[],boneInverses:[]};e.uuid=this.uuid;const t=this.bones,n=this.boneInverses;for(let i=0,r=t.length;i<r;i++){const o=t[i];e.bones.push(o.uuid);const a=n[i];e.boneInverses.push(a.toArray())}return e}}class hc extends Yt{constructor(e,t,n,i=1){super(e,t,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=i}copy(e){return super.copy(e),this.meshPerAttribute=e.meshPerAttribute,this}toJSON(){const e=super.toJSON();return e.meshPerAttribute=this.meshPerAttribute,e.isInstancedBufferAttribute=!0,e}}const _s=new Ze,Dl=new Ze,Br=[],Nl=new Yn,Uf=new Ze,qs=new Fe,Ys=new jn;class au extends Fe{constructor(e,t,n){super(e,t),this.isInstancedMesh=!0,this.instanceMatrix=new hc(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let i=0;i<n;i++)this.setMatrixAt(i,Uf)}computeBoundingBox(){const e=this.geometry,t=this.count;this.boundingBox===null&&(this.boundingBox=new Yn),e.boundingBox===null&&e.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,_s),Nl.copy(e.boundingBox).applyMatrix4(_s),this.boundingBox.union(Nl)}computeBoundingSphere(){const e=this.geometry,t=this.count;this.boundingSphere===null&&(this.boundingSphere=new jn),e.boundingSphere===null&&e.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<t;n++)this.getMatrixAt(n,_s),Ys.copy(e.boundingSphere).applyMatrix4(_s),this.boundingSphere.union(Ys)}copy(e,t){return super.copy(e,t),this.instanceMatrix.copy(e.instanceMatrix),e.morphTexture!==null&&(this.morphTexture=e.morphTexture.clone()),e.instanceColor!==null&&(this.instanceColor=e.instanceColor.clone()),this.count=e.count,e.boundingBox!==null&&(this.boundingBox=e.boundingBox.clone()),e.boundingSphere!==null&&(this.boundingSphere=e.boundingSphere.clone()),this}getColorAt(e,t){t.fromArray(this.instanceColor.array,e*3)}getMatrixAt(e,t){t.fromArray(this.instanceMatrix.array,e*16)}getMorphAt(e,t){const n=t.morphTargetInfluences,i=this.morphTexture.source.data.data,r=n.length+1,o=e*r+1;for(let a=0;a<n.length;a++)n[a]=i[o+a]}raycast(e,t){const n=this.matrixWorld,i=this.count;if(qs.geometry=this.geometry,qs.material=this.material,qs.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Ys.copy(this.boundingSphere),Ys.applyMatrix4(n),e.ray.intersectsSphere(Ys)!==!1))for(let r=0;r<i;r++){this.getMatrixAt(r,_s),Dl.multiplyMatrices(n,_s),qs.matrixWorld=Dl,qs.raycast(e,Br);for(let o=0,a=Br.length;o<a;o++){const l=Br[o];l.instanceId=r,l.object=this,t.push(l)}Br.length=0}}setColorAt(e,t){this.instanceColor===null&&(this.instanceColor=new hc(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),t.toArray(this.instanceColor.array,e*3)}setMatrixAt(e,t){t.toArray(this.instanceMatrix.array,e*16)}setMorphAt(e,t){const n=t.morphTargetInfluences,i=n.length+1;this.morphTexture===null&&(this.morphTexture=new ou(new Float32Array(i*this.count),i,this.count,Rc,Pn));const r=this.morphTexture.source.data.data;let o=0;for(let c=0;c<n.length;c++)o+=n[c];const a=this.geometry.morphTargetsRelative?1:1-o,l=i*e;r[l]=a,r.set(n,l+1)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}}const ea=new P,Ff=new P,Of=new $e;class Xi{constructor(e=new P(1,0,0),t=0){this.isPlane=!0,this.normal=e,this.constant=t}set(e,t){return this.normal.copy(e),this.constant=t,this}setComponents(e,t,n,i){return this.normal.set(e,t,n),this.constant=i,this}setFromNormalAndCoplanarPoint(e,t){return this.normal.copy(e),this.constant=-t.dot(this.normal),this}setFromCoplanarPoints(e,t,n){const i=ea.subVectors(n,t).cross(Ff.subVectors(e,t)).normalize();return this.setFromNormalAndCoplanarPoint(i,e),this}copy(e){return this.normal.copy(e.normal),this.constant=e.constant,this}normalize(){const e=1/this.normal.length();return this.normal.multiplyScalar(e),this.constant*=e,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(e){return this.normal.dot(e)+this.constant}distanceToSphere(e){return this.distanceToPoint(e.center)-e.radius}projectPoint(e,t){return t.copy(e).addScaledVector(this.normal,-this.distanceToPoint(e))}intersectLine(e,t){const n=e.delta(ea),i=this.normal.dot(n);if(i===0)return this.distanceToPoint(e.start)===0?t.copy(e.start):null;const r=-(e.start.dot(this.normal)+this.constant)/i;return r<0||r>1?null:t.copy(e.start).addScaledVector(n,r)}intersectsLine(e){const t=this.distanceToPoint(e.start),n=this.distanceToPoint(e.end);return t<0&&n>0||n<0&&t>0}intersectsBox(e){return e.intersectsPlane(this)}intersectsSphere(e){return e.intersectsPlane(this)}coplanarPoint(e){return e.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(e,t){const n=t||Of.getNormalMatrix(e),i=this.coplanarPoint(ea).applyMatrix4(e),r=this.normal.applyMatrix3(n).normalize();return this.constant=-i.dot(r),this}translate(e){return this.constant-=e.dot(this.normal),this}equals(e){return e.normal.equals(this.normal)&&e.constant===this.constant}clone(){return new this.constructor().copy(this)}}const Hi=new jn,zf=new Oe(.5,.5),kr=new P;class bo{constructor(e=new Xi,t=new Xi,n=new Xi,i=new Xi,r=new Xi,o=new Xi){this.planes=[e,t,n,i,r,o]}set(e,t,n,i,r,o){const a=this.planes;return a[0].copy(e),a[1].copy(t),a[2].copy(n),a[3].copy(i),a[4].copy(r),a[5].copy(o),this}copy(e){const t=this.planes;for(let n=0;n<6;n++)t[n].copy(e.planes[n]);return this}setFromProjectionMatrix(e,t=kn,n=!1){const i=this.planes,r=e.elements,o=r[0],a=r[1],l=r[2],c=r[3],h=r[4],u=r[5],d=r[6],f=r[7],g=r[8],x=r[9],m=r[10],p=r[11],M=r[12],y=r[13],v=r[14],w=r[15];if(i[0].setComponents(c-o,f-h,p-g,w-M).normalize(),i[1].setComponents(c+o,f+h,p+g,w+M).normalize(),i[2].setComponents(c+a,f+u,p+x,w+y).normalize(),i[3].setComponents(c-a,f-u,p-x,w-y).normalize(),n)i[4].setComponents(l,d,m,v).normalize(),i[5].setComponents(c-l,f-d,p-m,w-v).normalize();else if(i[4].setComponents(c-l,f-d,p-m,w-v).normalize(),t===kn)i[5].setComponents(c+l,f+d,p+m,w+v).normalize();else if(t===fo)i[5].setComponents(l,d,m,v).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+t);return this}intersectsObject(e){if(e.boundingSphere!==void 0)e.boundingSphere===null&&e.computeBoundingSphere(),Hi.copy(e.boundingSphere).applyMatrix4(e.matrixWorld);else{const t=e.geometry;t.boundingSphere===null&&t.computeBoundingSphere(),Hi.copy(t.boundingSphere).applyMatrix4(e.matrixWorld)}return this.intersectsSphere(Hi)}intersectsSprite(e){Hi.center.set(0,0,0);const t=zf.distanceTo(e.center);return Hi.radius=.7071067811865476+t,Hi.applyMatrix4(e.matrixWorld),this.intersectsSphere(Hi)}intersectsSphere(e){const t=this.planes,n=e.center,i=-e.radius;for(let r=0;r<6;r++)if(t[r].distanceToPoint(n)<i)return!1;return!0}intersectsBox(e){const t=this.planes;for(let n=0;n<6;n++){const i=t[n];if(kr.x=i.normal.x>0?e.max.x:e.min.x,kr.y=i.normal.y>0?e.max.y:e.min.y,kr.z=i.normal.z>0?e.max.z:e.min.z,i.distanceToPoint(kr)<0)return!1}return!0}containsPoint(e){const t=this.planes;for(let n=0;n<6;n++)if(t[n].distanceToPoint(e)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}}class cu extends Hn{constructor(e){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new Ye(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.linewidth=e.linewidth,this.linecap=e.linecap,this.linejoin=e.linejoin,this.fog=e.fog,this}}const mo=new P,go=new P,Ul=new Ze,js=new yo,Hr=new jn,ta=new P,Fl=new P;class zc extends Et{constructor(e=new dt,t=new cu){super(),this.isLine=!0,this.type="Line",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[0];for(let i=1,r=t.count;i<r;i++)mo.fromBufferAttribute(t,i-1),go.fromBufferAttribute(t,i),n[i]=n[i-1],n[i]+=mo.distanceTo(go);e.setAttribute("lineDistance",new We(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(e,t){const n=this.geometry,i=this.matrixWorld,r=e.params.Line.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Hr.copy(n.boundingSphere),Hr.applyMatrix4(i),Hr.radius+=r,e.ray.intersectsSphere(Hr)===!1)return;Ul.copy(i).invert(),js.copy(e.ray).applyMatrix4(Ul);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=this.isLineSegments?2:1,h=n.index,d=n.attributes.position;if(h!==null){const f=Math.max(0,o.start),g=Math.min(h.count,o.start+o.count);for(let x=f,m=g-1;x<m;x+=c){const p=h.getX(x),M=h.getX(x+1),y=Vr(this,e,js,l,p,M,x);y&&t.push(y)}if(this.isLineLoop){const x=h.getX(g-1),m=h.getX(f),p=Vr(this,e,js,l,x,m,g-1);p&&t.push(p)}}else{const f=Math.max(0,o.start),g=Math.min(d.count,o.start+o.count);for(let x=f,m=g-1;x<m;x+=c){const p=Vr(this,e,js,l,x,x+1,x);p&&t.push(p)}if(this.isLineLoop){const x=Vr(this,e,js,l,g-1,f,g-1);x&&t.push(x)}}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=i.length;r<o;r++){const a=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}}function Vr(s,e,t,n,i,r,o){const a=s.geometry.attributes.position;if(mo.fromBufferAttribute(a,i),go.fromBufferAttribute(a,r),t.distanceSqToSegment(mo,go,ta,Fl)>n)return;ta.applyMatrix4(s.matrixWorld);const c=e.ray.origin.distanceTo(ta);if(!(c<e.near||c>e.far))return{distance:c,point:Fl.clone().applyMatrix4(s.matrixWorld),index:o,face:null,faceIndex:null,barycoord:null,object:s}}const Ol=new P,zl=new P;class Bf extends zc{constructor(e,t){super(e,t),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){const e=this.geometry;if(e.index===null){const t=e.attributes.position,n=[];for(let i=0,r=t.count;i<r;i+=2)Ol.fromBufferAttribute(t,i),zl.fromBufferAttribute(t,i+1),n[i]=i===0?0:n[i-1],n[i+1]=n[i]+Ol.distanceTo(zl);e.setAttribute("lineDistance",new We(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}}class kf extends zc{constructor(e,t){super(e,t),this.isLineLoop=!0,this.type="LineLoop"}}class lu extends Hn{constructor(e){super(),this.isPointsMaterial=!0,this.type="PointsMaterial",this.color=new Ye(16777215),this.map=null,this.alphaMap=null,this.size=1,this.sizeAttenuation=!0,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.color.copy(e.color),this.map=e.map,this.alphaMap=e.alphaMap,this.size=e.size,this.sizeAttenuation=e.sizeAttenuation,this.fog=e.fog,this}}const Bl=new Ze,uc=new yo,Gr=new jn,Wr=new P;class Hf extends Et{constructor(e=new dt,t=new lu){super(),this.isPoints=!0,this.type="Points",this.geometry=e,this.material=t,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(e,t){return super.copy(e,t),this.material=Array.isArray(e.material)?e.material.slice():e.material,this.geometry=e.geometry,this}raycast(e,t){const n=this.geometry,i=this.matrixWorld,r=e.params.Points.threshold,o=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),Gr.copy(n.boundingSphere),Gr.applyMatrix4(i),Gr.radius+=r,e.ray.intersectsSphere(Gr)===!1)return;Bl.copy(i).invert(),uc.copy(e.ray).applyMatrix4(Bl);const a=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=a*a,c=n.index,u=n.attributes.position;if(c!==null){const d=Math.max(0,o.start),f=Math.min(c.count,o.start+o.count);for(let g=d,x=f;g<x;g++){const m=c.getX(g);Wr.fromBufferAttribute(u,m),kl(Wr,m,l,i,e,t,this)}}else{const d=Math.max(0,o.start),f=Math.min(u.count,o.start+o.count);for(let g=d,x=f;g<x;g++)Wr.fromBufferAttribute(u,g),kl(Wr,g,l,i,e,t,this)}}updateMorphTargets(){const t=this.geometry.morphAttributes,n=Object.keys(t);if(n.length>0){const i=t[n[0]];if(i!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,o=i.length;r<o;r++){const a=i[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[a]=r}}}}}function kl(s,e,t,n,i,r,o){const a=uc.distanceSqToPoint(s);if(a<t){const l=new P;uc.closestPointToPoint(s,l),l.applyMatrix4(n);const c=i.ray.origin.distanceTo(l);if(c<i.near||c>i.far)return;r.push({distance:c,distanceToRay:Math.sqrt(a),point:l,index:e,face:null,faceIndex:null,barycoord:null,object:o})}}class Ps extends Nt{constructor(e,t,n,i,r,o,a,l,c){super(e,t,n,i,r,o,a,l,c),this.isCanvasTexture=!0,this.needsUpdate=!0}}class hu extends Nt{constructor(e,t,n=$i,i,r,o,a=$t,l=$t,c,h=lr,u=1){if(h!==lr&&h!==hr)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");const d={width:e,height:t,depth:u};super(d,i,r,o,a,l,h,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(e){return super.copy(e),this.source=new Nc(Object.assign({},e.image)),this.compareFunction=e.compareFunction,this}toJSON(e){const t=super.toJSON(e);return this.compareFunction!==null&&(t.compareFunction=this.compareFunction),t}}class uu extends Nt{constructor(e=null){super(),this.sourceTexture=e,this.isExternalTexture=!0}copy(e){return super.copy(e),this.sourceTexture=e.sourceTexture,this}}class Ui extends dt{constructor(e=1,t=32,n=0,i=Math.PI*2){super(),this.type="CircleGeometry",this.parameters={radius:e,segments:t,thetaStart:n,thetaLength:i},t=Math.max(3,t);const r=[],o=[],a=[],l=[],c=new P,h=new Oe;o.push(0,0,0),a.push(0,0,1),l.push(.5,.5);for(let u=0,d=3;u<=t;u++,d+=3){const f=n+u/t*i;c.x=e*Math.cos(f),c.y=e*Math.sin(f),o.push(c.x,c.y,c.z),a.push(0,0,1),h.x=(o[d]/e+1)/2,h.y=(o[d+1]/e+1)/2,l.push(h.x,h.y)}for(let u=1;u<=t;u++)r.push(u,u+1,0);this.setIndex(r),this.setAttribute("position",new We(o,3)),this.setAttribute("normal",new We(a,3)),this.setAttribute("uv",new We(l,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Ui(e.radius,e.segments,e.thetaStart,e.thetaLength)}}class gn extends dt{constructor(e=1,t=1,n=1,i=32,r=1,o=!1,a=0,l=Math.PI*2){super(),this.type="CylinderGeometry",this.parameters={radiusTop:e,radiusBottom:t,height:n,radialSegments:i,heightSegments:r,openEnded:o,thetaStart:a,thetaLength:l};const c=this;i=Math.floor(i),r=Math.floor(r);const h=[],u=[],d=[],f=[];let g=0;const x=[],m=n/2;let p=0;M(),o===!1&&(e>0&&y(!0),t>0&&y(!1)),this.setIndex(h),this.setAttribute("position",new We(u,3)),this.setAttribute("normal",new We(d,3)),this.setAttribute("uv",new We(f,2));function M(){const v=new P,w=new P;let S=0;const R=(t-e)/n;for(let I=0;I<=r;I++){const T=[],b=I/r,U=b*(t-e)+e;for(let V=0;V<=i;V++){const F=V/i,O=F*l+a,W=Math.sin(O),J=Math.cos(O);w.x=U*W,w.y=-b*n+m,w.z=U*J,u.push(w.x,w.y,w.z),v.set(W,R,J).normalize(),d.push(v.x,v.y,v.z),f.push(F,1-b),T.push(g++)}x.push(T)}for(let I=0;I<i;I++)for(let T=0;T<r;T++){const b=x[T][I],U=x[T+1][I],V=x[T+1][I+1],F=x[T][I+1];(e>0||T!==0)&&(h.push(b,U,F),S+=3),(t>0||T!==r-1)&&(h.push(U,V,F),S+=3)}c.addGroup(p,S,0),p+=S}function y(v){const w=g,S=new Oe,R=new P;let I=0;const T=v===!0?e:t,b=v===!0?1:-1;for(let V=1;V<=i;V++)u.push(0,m*b,0),d.push(0,b,0),f.push(.5,.5),g++;const U=g;for(let V=0;V<=i;V++){const O=V/i*l+a,W=Math.cos(O),J=Math.sin(O);R.x=T*J,R.y=m*b,R.z=T*W,u.push(R.x,R.y,R.z),d.push(0,b,0),S.x=W*.5+.5,S.y=J*.5*b+.5,f.push(S.x,S.y),g++}for(let V=0;V<i;V++){const F=w+V,O=U+V;v===!0?h.push(O,O+1,F):h.push(O+1,O,F),I+=3}c.addGroup(p,I,v===!0?1:2),p+=I}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new gn(e.radiusTop,e.radiusBottom,e.height,e.radialSegments,e.heightSegments,e.openEnded,e.thetaStart,e.thetaLength)}}class Bc extends dt{constructor(e=[],t=[],n=1,i=0){super(),this.type="PolyhedronGeometry",this.parameters={vertices:e,indices:t,radius:n,detail:i};const r=[],o=[];a(i),c(n),h(),this.setAttribute("position",new We(r,3)),this.setAttribute("normal",new We(r.slice(),3)),this.setAttribute("uv",new We(o,2)),i===0?this.computeVertexNormals():this.normalizeNormals();function a(M){const y=new P,v=new P,w=new P;for(let S=0;S<t.length;S+=3)f(t[S+0],y),f(t[S+1],v),f(t[S+2],w),l(y,v,w,M)}function l(M,y,v,w){const S=w+1,R=[];for(let I=0;I<=S;I++){R[I]=[];const T=M.clone().lerp(v,I/S),b=y.clone().lerp(v,I/S),U=S-I;for(let V=0;V<=U;V++)V===0&&I===S?R[I][V]=T:R[I][V]=T.clone().lerp(b,V/U)}for(let I=0;I<S;I++)for(let T=0;T<2*(S-I)-1;T++){const b=Math.floor(T/2);T%2===0?(d(R[I][b+1]),d(R[I+1][b]),d(R[I][b])):(d(R[I][b+1]),d(R[I+1][b+1]),d(R[I+1][b]))}}function c(M){const y=new P;for(let v=0;v<r.length;v+=3)y.x=r[v+0],y.y=r[v+1],y.z=r[v+2],y.normalize().multiplyScalar(M),r[v+0]=y.x,r[v+1]=y.y,r[v+2]=y.z}function h(){const M=new P;for(let y=0;y<r.length;y+=3){M.x=r[y+0],M.y=r[y+1],M.z=r[y+2];const v=m(M)/2/Math.PI+.5,w=p(M)/Math.PI+.5;o.push(v,1-w)}g(),u()}function u(){for(let M=0;M<o.length;M+=6){const y=o[M+0],v=o[M+2],w=o[M+4],S=Math.max(y,v,w),R=Math.min(y,v,w);S>.9&&R<.1&&(y<.2&&(o[M+0]+=1),v<.2&&(o[M+2]+=1),w<.2&&(o[M+4]+=1))}}function d(M){r.push(M.x,M.y,M.z)}function f(M,y){const v=M*3;y.x=e[v+0],y.y=e[v+1],y.z=e[v+2]}function g(){const M=new P,y=new P,v=new P,w=new P,S=new Oe,R=new Oe,I=new Oe;for(let T=0,b=0;T<r.length;T+=9,b+=6){M.set(r[T+0],r[T+1],r[T+2]),y.set(r[T+3],r[T+4],r[T+5]),v.set(r[T+6],r[T+7],r[T+8]),S.set(o[b+0],o[b+1]),R.set(o[b+2],o[b+3]),I.set(o[b+4],o[b+5]),w.copy(M).add(y).add(v).divideScalar(3);const U=m(w);x(S,b+0,M,U),x(R,b+2,y,U),x(I,b+4,v,U)}}function x(M,y,v,w){w<0&&M.x===1&&(o[y]=M.x-1),v.x===0&&v.z===0&&(o[y]=w/2/Math.PI+.5)}function m(M){return Math.atan2(M.z,-M.x)}function p(M){return Math.atan2(-M.y,Math.sqrt(M.x*M.x+M.z*M.z))}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Bc(e.vertices,e.indices,e.radius,e.details)}}class pi{constructor(){this.type="Curve",this.arcLengthDivisions=200,this.needsUpdate=!1,this.cacheArcLengths=null}getPoint(){console.warn("THREE.Curve: .getPoint() not implemented.")}getPointAt(e,t){const n=this.getUtoTmapping(e);return this.getPoint(n,t)}getPoints(e=5){const t=[];for(let n=0;n<=e;n++)t.push(this.getPoint(n/e));return t}getSpacedPoints(e=5){const t=[];for(let n=0;n<=e;n++)t.push(this.getPointAt(n/e));return t}getLength(){const e=this.getLengths();return e[e.length-1]}getLengths(e=this.arcLengthDivisions){if(this.cacheArcLengths&&this.cacheArcLengths.length===e+1&&!this.needsUpdate)return this.cacheArcLengths;this.needsUpdate=!1;const t=[];let n,i=this.getPoint(0),r=0;t.push(0);for(let o=1;o<=e;o++)n=this.getPoint(o/e),r+=n.distanceTo(i),t.push(r),i=n;return this.cacheArcLengths=t,t}updateArcLengths(){this.needsUpdate=!0,this.getLengths()}getUtoTmapping(e,t=null){const n=this.getLengths();let i=0;const r=n.length;let o;t?o=t:o=e*n[r-1];let a=0,l=r-1,c;for(;a<=l;)if(i=Math.floor(a+(l-a)/2),c=n[i]-o,c<0)a=i+1;else if(c>0)l=i-1;else{l=i;break}if(i=l,n[i]===o)return i/(r-1);const h=n[i],d=n[i+1]-h,f=(o-h)/d;return(i+f)/(r-1)}getTangent(e,t){let i=e-1e-4,r=e+1e-4;i<0&&(i=0),r>1&&(r=1);const o=this.getPoint(i),a=this.getPoint(r),l=t||(o.isVector2?new Oe:new P);return l.copy(a).sub(o).normalize(),l}getTangentAt(e,t){const n=this.getUtoTmapping(e);return this.getTangent(n,t)}computeFrenetFrames(e,t=!1){const n=new P,i=[],r=[],o=[],a=new P,l=new Ze;for(let f=0;f<=e;f++){const g=f/e;i[f]=this.getTangentAt(g,new P)}r[0]=new P,o[0]=new P;let c=Number.MAX_VALUE;const h=Math.abs(i[0].x),u=Math.abs(i[0].y),d=Math.abs(i[0].z);h<=c&&(c=h,n.set(1,0,0)),u<=c&&(c=u,n.set(0,1,0)),d<=c&&n.set(0,0,1),a.crossVectors(i[0],n).normalize(),r[0].crossVectors(i[0],a),o[0].crossVectors(i[0],r[0]);for(let f=1;f<=e;f++){if(r[f]=r[f-1].clone(),o[f]=o[f-1].clone(),a.crossVectors(i[f-1],i[f]),a.length()>Number.EPSILON){a.normalize();const g=Math.acos(et(i[f-1].dot(i[f]),-1,1));r[f].applyMatrix4(l.makeRotationAxis(a,g))}o[f].crossVectors(i[f],r[f])}if(t===!0){let f=Math.acos(et(r[0].dot(r[e]),-1,1));f/=e,i[0].dot(a.crossVectors(r[0],r[e]))>0&&(f=-f);for(let g=1;g<=e;g++)r[g].applyMatrix4(l.makeRotationAxis(i[g],f*g)),o[g].crossVectors(i[g],r[g])}return{tangents:i,normals:r,binormals:o}}clone(){return new this.constructor().copy(this)}copy(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}toJSON(){const e={metadata:{version:4.7,type:"Curve",generator:"Curve.toJSON"}};return e.arcLengthDivisions=this.arcLengthDivisions,e.type=this.type,e}fromJSON(e){return this.arcLengthDivisions=e.arcLengthDivisions,this}}class du extends pi{constructor(e=0,t=0,n=1,i=1,r=0,o=Math.PI*2,a=!1,l=0){super(),this.isEllipseCurve=!0,this.type="EllipseCurve",this.aX=e,this.aY=t,this.xRadius=n,this.yRadius=i,this.aStartAngle=r,this.aEndAngle=o,this.aClockwise=a,this.aRotation=l}getPoint(e,t=new Oe){const n=t,i=Math.PI*2;let r=this.aEndAngle-this.aStartAngle;const o=Math.abs(r)<Number.EPSILON;for(;r<0;)r+=i;for(;r>i;)r-=i;r<Number.EPSILON&&(o?r=0:r=i),this.aClockwise===!0&&!o&&(r===i?r=-i:r=r-i);const a=this.aStartAngle+e*r;let l=this.aX+this.xRadius*Math.cos(a),c=this.aY+this.yRadius*Math.sin(a);if(this.aRotation!==0){const h=Math.cos(this.aRotation),u=Math.sin(this.aRotation),d=l-this.aX,f=c-this.aY;l=d*h-f*u+this.aX,c=d*u+f*h+this.aY}return n.set(l,c)}copy(e){return super.copy(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}toJSON(){const e=super.toJSON();return e.aX=this.aX,e.aY=this.aY,e.xRadius=this.xRadius,e.yRadius=this.yRadius,e.aStartAngle=this.aStartAngle,e.aEndAngle=this.aEndAngle,e.aClockwise=this.aClockwise,e.aRotation=this.aRotation,e}fromJSON(e){return super.fromJSON(e),this.aX=e.aX,this.aY=e.aY,this.xRadius=e.xRadius,this.yRadius=e.yRadius,this.aStartAngle=e.aStartAngle,this.aEndAngle=e.aEndAngle,this.aClockwise=e.aClockwise,this.aRotation=e.aRotation,this}}class Vf extends du{constructor(e,t,n,i,r,o){super(e,t,n,n,i,r,o),this.isArcCurve=!0,this.type="ArcCurve"}}function kc(){let s=0,e=0,t=0,n=0;function i(r,o,a,l){s=r,e=a,t=-3*r+3*o-2*a-l,n=2*r-2*o+a+l}return{initCatmullRom:function(r,o,a,l,c){i(o,a,c*(a-r),c*(l-o))},initNonuniformCatmullRom:function(r,o,a,l,c,h,u){let d=(o-r)/c-(a-r)/(c+h)+(a-o)/h,f=(a-o)/h-(l-o)/(h+u)+(l-a)/u;d*=h,f*=h,i(o,a,d,f)},calc:function(r){const o=r*r,a=o*r;return s+e*r+t*o+n*a}}}const Xr=new P,na=new kc,ia=new kc,sa=new kc;class Ls extends pi{constructor(e=[],t=!1,n="centripetal",i=.5){super(),this.isCatmullRomCurve3=!0,this.type="CatmullRomCurve3",this.points=e,this.closed=t,this.curveType=n,this.tension=i}getPoint(e,t=new P){const n=t,i=this.points,r=i.length,o=(r-(this.closed?0:1))*e;let a=Math.floor(o),l=o-a;this.closed?a+=a>0?0:(Math.floor(Math.abs(a)/r)+1)*r:l===0&&a===r-1&&(a=r-2,l=1);let c,h;this.closed||a>0?c=i[(a-1)%r]:(Xr.subVectors(i[0],i[1]).add(i[0]),c=Xr);const u=i[a%r],d=i[(a+1)%r];if(this.closed||a+2<r?h=i[(a+2)%r]:(Xr.subVectors(i[r-1],i[r-2]).add(i[r-1]),h=Xr),this.curveType==="centripetal"||this.curveType==="chordal"){const f=this.curveType==="chordal"?.5:.25;let g=Math.pow(c.distanceToSquared(u),f),x=Math.pow(u.distanceToSquared(d),f),m=Math.pow(d.distanceToSquared(h),f);x<1e-4&&(x=1),g<1e-4&&(g=x),m<1e-4&&(m=x),na.initNonuniformCatmullRom(c.x,u.x,d.x,h.x,g,x,m),ia.initNonuniformCatmullRom(c.y,u.y,d.y,h.y,g,x,m),sa.initNonuniformCatmullRom(c.z,u.z,d.z,h.z,g,x,m)}else this.curveType==="catmullrom"&&(na.initCatmullRom(c.x,u.x,d.x,h.x,this.tension),ia.initCatmullRom(c.y,u.y,d.y,h.y,this.tension),sa.initCatmullRom(c.z,u.z,d.z,h.z,this.tension));return n.set(na.calc(l),ia.calc(l),sa.calc(l)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const i=e.points[t];this.points.push(i.clone())}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){const i=this.points[t];e.points.push(i.toArray())}return e.closed=this.closed,e.curveType=this.curveType,e.tension=this.tension,e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const i=e.points[t];this.points.push(new P().fromArray(i))}return this.closed=e.closed,this.curveType=e.curveType,this.tension=e.tension,this}}function Hl(s,e,t,n,i){const r=(n-e)*.5,o=(i-t)*.5,a=s*s,l=s*a;return(2*t-2*n+r+o)*l+(-3*t+3*n-2*r-o)*a+r*s+t}function Gf(s,e){const t=1-s;return t*t*e}function Wf(s,e){return 2*(1-s)*s*e}function Xf(s,e){return s*s*e}function nr(s,e,t,n){return Gf(s,e)+Wf(s,t)+Xf(s,n)}function qf(s,e){const t=1-s;return t*t*t*e}function Yf(s,e){const t=1-s;return 3*t*t*s*e}function jf(s,e){return 3*(1-s)*s*s*e}function Kf(s,e){return s*s*s*e}function ir(s,e,t,n,i){return qf(s,e)+Yf(s,t)+jf(s,n)+Kf(s,i)}class Jf extends pi{constructor(e=new Oe,t=new Oe,n=new Oe,i=new Oe){super(),this.isCubicBezierCurve=!0,this.type="CubicBezierCurve",this.v0=e,this.v1=t,this.v2=n,this.v3=i}getPoint(e,t=new Oe){const n=t,i=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(ir(e,i.x,r.x,o.x,a.x),ir(e,i.y,r.y,o.y,a.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class Zf extends pi{constructor(e=new P,t=new P,n=new P,i=new P){super(),this.isCubicBezierCurve3=!0,this.type="CubicBezierCurve3",this.v0=e,this.v1=t,this.v2=n,this.v3=i}getPoint(e,t=new P){const n=t,i=this.v0,r=this.v1,o=this.v2,a=this.v3;return n.set(ir(e,i.x,r.x,o.x,a.x),ir(e,i.y,r.y,o.y,a.y),ir(e,i.z,r.z,o.z,a.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this.v3.copy(e.v3),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e.v3=this.v3.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this.v3.fromArray(e.v3),this}}class $f extends pi{constructor(e=new Oe,t=new Oe){super(),this.isLineCurve=!0,this.type="LineCurve",this.v1=e,this.v2=t}getPoint(e,t=new Oe){const n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new Oe){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class Qf extends pi{constructor(e=new P,t=new P){super(),this.isLineCurve3=!0,this.type="LineCurve3",this.v1=e,this.v2=t}getPoint(e,t=new P){const n=t;return e===1?n.copy(this.v2):(n.copy(this.v2).sub(this.v1),n.multiplyScalar(e).add(this.v1)),n}getPointAt(e,t){return this.getPoint(e,t)}getTangent(e,t=new P){return t.subVectors(this.v2,this.v1).normalize()}getTangentAt(e,t){return this.getTangent(e,t)}copy(e){return super.copy(e),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class ep extends pi{constructor(e=new Oe,t=new Oe,n=new Oe){super(),this.isQuadraticBezierCurve=!0,this.type="QuadraticBezierCurve",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new Oe){const n=t,i=this.v0,r=this.v1,o=this.v2;return n.set(nr(e,i.x,r.x,o.x),nr(e,i.y,r.y,o.y)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class fu extends pi{constructor(e=new P,t=new P,n=new P){super(),this.isQuadraticBezierCurve3=!0,this.type="QuadraticBezierCurve3",this.v0=e,this.v1=t,this.v2=n}getPoint(e,t=new P){const n=t,i=this.v0,r=this.v1,o=this.v2;return n.set(nr(e,i.x,r.x,o.x),nr(e,i.y,r.y,o.y),nr(e,i.z,r.z,o.z)),n}copy(e){return super.copy(e),this.v0.copy(e.v0),this.v1.copy(e.v1),this.v2.copy(e.v2),this}toJSON(){const e=super.toJSON();return e.v0=this.v0.toArray(),e.v1=this.v1.toArray(),e.v2=this.v2.toArray(),e}fromJSON(e){return super.fromJSON(e),this.v0.fromArray(e.v0),this.v1.fromArray(e.v1),this.v2.fromArray(e.v2),this}}class tp extends pi{constructor(e=[]){super(),this.isSplineCurve=!0,this.type="SplineCurve",this.points=e}getPoint(e,t=new Oe){const n=t,i=this.points,r=(i.length-1)*e,o=Math.floor(r),a=r-o,l=i[o===0?o:o-1],c=i[o],h=i[o>i.length-2?i.length-1:o+1],u=i[o>i.length-3?i.length-1:o+2];return n.set(Hl(a,l.x,c.x,h.x,u.x),Hl(a,l.y,c.y,h.y,u.y)),n}copy(e){super.copy(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const i=e.points[t];this.points.push(i.clone())}return this}toJSON(){const e=super.toJSON();e.points=[];for(let t=0,n=this.points.length;t<n;t++){const i=this.points[t];e.points.push(i.toArray())}return e}fromJSON(e){super.fromJSON(e),this.points=[];for(let t=0,n=e.points.length;t<n;t++){const i=e.points[t];this.points.push(new Oe().fromArray(i))}return this}}var np=Object.freeze({__proto__:null,ArcCurve:Vf,CatmullRomCurve3:Ls,CubicBezierCurve:Jf,CubicBezierCurve3:Zf,EllipseCurve:du,LineCurve:$f,LineCurve3:Qf,QuadraticBezierCurve:ep,QuadraticBezierCurve3:fu,SplineCurve:tp});class So extends Bc{constructor(e=1,t=0){const n=[1,0,0,-1,0,0,0,1,0,0,-1,0,0,0,1,0,0,-1],i=[0,2,4,0,4,3,0,3,5,0,5,2,1,2,5,1,5,3,1,3,4,1,4,2];super(n,i,e,t),this.type="OctahedronGeometry",this.parameters={radius:e,detail:t}}static fromJSON(e){return new So(e.radius,e.detail)}}class es extends dt{constructor(e=1,t=1,n=1,i=1){super(),this.type="PlaneGeometry",this.parameters={width:e,height:t,widthSegments:n,heightSegments:i};const r=e/2,o=t/2,a=Math.floor(n),l=Math.floor(i),c=a+1,h=l+1,u=e/a,d=t/l,f=[],g=[],x=[],m=[];for(let p=0;p<h;p++){const M=p*d-o;for(let y=0;y<c;y++){const v=y*u-r;g.push(v,-M,0),x.push(0,0,1),m.push(y/a),m.push(1-p/l)}}for(let p=0;p<l;p++)for(let M=0;M<a;M++){const y=M+c*p,v=M+c*(p+1),w=M+1+c*(p+1),S=M+1+c*p;f.push(y,v,S),f.push(v,w,S)}this.setIndex(f),this.setAttribute("position",new We(g,3)),this.setAttribute("normal",new We(x,3)),this.setAttribute("uv",new We(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new es(e.width,e.height,e.widthSegments,e.heightSegments)}}class Eo extends dt{constructor(e=.5,t=1,n=32,i=1,r=0,o=Math.PI*2){super(),this.type="RingGeometry",this.parameters={innerRadius:e,outerRadius:t,thetaSegments:n,phiSegments:i,thetaStart:r,thetaLength:o},n=Math.max(3,n),i=Math.max(1,i);const a=[],l=[],c=[],h=[];let u=e;const d=(t-e)/i,f=new P,g=new Oe;for(let x=0;x<=i;x++){for(let m=0;m<=n;m++){const p=r+m/n*o;f.x=u*Math.cos(p),f.y=u*Math.sin(p),l.push(f.x,f.y,f.z),c.push(0,0,1),g.x=(f.x/t+1)/2,g.y=(f.y/t+1)/2,h.push(g.x,g.y)}u+=d}for(let x=0;x<i;x++){const m=x*(n+1);for(let p=0;p<n;p++){const M=p+m,y=M,v=M+n+1,w=M+n+2,S=M+1;a.push(y,v,S),a.push(v,w,S)}}this.setIndex(a),this.setAttribute("position",new We(l,3)),this.setAttribute("normal",new We(c,3)),this.setAttribute("uv",new We(h,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new Eo(e.innerRadius,e.outerRadius,e.thetaSegments,e.phiSegments,e.thetaStart,e.thetaLength)}}class _n extends dt{constructor(e=1,t=32,n=16,i=0,r=Math.PI*2,o=0,a=Math.PI){super(),this.type="SphereGeometry",this.parameters={radius:e,widthSegments:t,heightSegments:n,phiStart:i,phiLength:r,thetaStart:o,thetaLength:a},t=Math.max(3,Math.floor(t)),n=Math.max(2,Math.floor(n));const l=Math.min(o+a,Math.PI);let c=0;const h=[],u=new P,d=new P,f=[],g=[],x=[],m=[];for(let p=0;p<=n;p++){const M=[],y=p/n;let v=0;p===0&&o===0?v=.5/t:p===n&&l===Math.PI&&(v=-.5/t);for(let w=0;w<=t;w++){const S=w/t;u.x=-e*Math.cos(i+S*r)*Math.sin(o+y*a),u.y=e*Math.cos(o+y*a),u.z=e*Math.sin(i+S*r)*Math.sin(o+y*a),g.push(u.x,u.y,u.z),d.copy(u).normalize(),x.push(d.x,d.y,d.z),m.push(S+v,1-y),M.push(c++)}h.push(M)}for(let p=0;p<n;p++)for(let M=0;M<t;M++){const y=h[p][M+1],v=h[p][M],w=h[p+1][M],S=h[p+1][M+1];(p!==0||o>0)&&f.push(y,v,S),(p!==n-1||l<Math.PI)&&f.push(v,w,S)}this.setIndex(f),this.setAttribute("position",new We(g,3)),this.setAttribute("normal",new We(x,3)),this.setAttribute("uv",new We(m,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new _n(e.radius,e.widthSegments,e.heightSegments,e.phiStart,e.phiLength,e.thetaStart,e.thetaLength)}}class mn extends dt{constructor(e=1,t=.4,n=12,i=48,r=Math.PI*2){super(),this.type="TorusGeometry",this.parameters={radius:e,tube:t,radialSegments:n,tubularSegments:i,arc:r},n=Math.floor(n),i=Math.floor(i);const o=[],a=[],l=[],c=[],h=new P,u=new P,d=new P;for(let f=0;f<=n;f++)for(let g=0;g<=i;g++){const x=g/i*r,m=f/n*Math.PI*2;u.x=(e+t*Math.cos(m))*Math.cos(x),u.y=(e+t*Math.cos(m))*Math.sin(x),u.z=t*Math.sin(m),a.push(u.x,u.y,u.z),h.x=e*Math.cos(x),h.y=e*Math.sin(x),d.subVectors(u,h).normalize(),l.push(d.x,d.y,d.z),c.push(g/i),c.push(f/n)}for(let f=1;f<=n;f++)for(let g=1;g<=i;g++){const x=(i+1)*f+g-1,m=(i+1)*(f-1)+g-1,p=(i+1)*(f-1)+g,M=(i+1)*f+g;o.push(x,m,M),o.push(m,p,M)}this.setIndex(o),this.setAttribute("position",new We(a,3)),this.setAttribute("normal",new We(l,3)),this.setAttribute("uv",new We(c,2))}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}static fromJSON(e){return new mn(e.radius,e.tube,e.radialSegments,e.tubularSegments,e.arc)}}class Fs extends dt{constructor(e=new fu(new P(-1,-1,0),new P(-1,1,0),new P(1,1,0)),t=64,n=1,i=8,r=!1){super(),this.type="TubeGeometry",this.parameters={path:e,tubularSegments:t,radius:n,radialSegments:i,closed:r};const o=e.computeFrenetFrames(t,r);this.tangents=o.tangents,this.normals=o.normals,this.binormals=o.binormals;const a=new P,l=new P,c=new Oe;let h=new P;const u=[],d=[],f=[],g=[];x(),this.setIndex(g),this.setAttribute("position",new We(u,3)),this.setAttribute("normal",new We(d,3)),this.setAttribute("uv",new We(f,2));function x(){for(let y=0;y<t;y++)m(y);m(r===!1?t:0),M(),p()}function m(y){h=e.getPointAt(y/t,h);const v=o.normals[y],w=o.binormals[y];for(let S=0;S<=i;S++){const R=S/i*Math.PI*2,I=Math.sin(R),T=-Math.cos(R);l.x=T*v.x+I*w.x,l.y=T*v.y+I*w.y,l.z=T*v.z+I*w.z,l.normalize(),d.push(l.x,l.y,l.z),a.x=h.x+n*l.x,a.y=h.y+n*l.y,a.z=h.z+n*l.z,u.push(a.x,a.y,a.z)}}function p(){for(let y=1;y<=t;y++)for(let v=1;v<=i;v++){const w=(i+1)*(y-1)+(v-1),S=(i+1)*y+(v-1),R=(i+1)*y+v,I=(i+1)*(y-1)+v;g.push(w,S,I),g.push(S,R,I)}}function M(){for(let y=0;y<=t;y++)for(let v=0;v<=i;v++)c.x=y/t,c.y=v/i,f.push(c.x,c.y)}}copy(e){return super.copy(e),this.parameters=Object.assign({},e.parameters),this}toJSON(){const e=super.toJSON();return e.path=this.parameters.path.toJSON(),e}static fromJSON(e){return new Fs(new np[e.path.type]().fromJSON(e.path),e.tubularSegments,e.radius,e.radialSegments,e.closed)}}class st extends Hn{constructor(e){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new Ye(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new Ye(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=jh,this.normalScale=new Oe(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new Wn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(e)}copy(e){return super.copy(e),this.defines={STANDARD:""},this.color.copy(e.color),this.roughness=e.roughness,this.metalness=e.metalness,this.map=e.map,this.lightMap=e.lightMap,this.lightMapIntensity=e.lightMapIntensity,this.aoMap=e.aoMap,this.aoMapIntensity=e.aoMapIntensity,this.emissive.copy(e.emissive),this.emissiveMap=e.emissiveMap,this.emissiveIntensity=e.emissiveIntensity,this.bumpMap=e.bumpMap,this.bumpScale=e.bumpScale,this.normalMap=e.normalMap,this.normalMapType=e.normalMapType,this.normalScale.copy(e.normalScale),this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.roughnessMap=e.roughnessMap,this.metalnessMap=e.metalnessMap,this.alphaMap=e.alphaMap,this.envMap=e.envMap,this.envMapRotation.copy(e.envMapRotation),this.envMapIntensity=e.envMapIntensity,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this.wireframeLinecap=e.wireframeLinecap,this.wireframeLinejoin=e.wireframeLinejoin,this.flatShading=e.flatShading,this.fog=e.fog,this}}class kt extends st{constructor(e){super(),this.isMeshPhysicalMaterial=!0,this.defines={STANDARD:"",PHYSICAL:""},this.type="MeshPhysicalMaterial",this.anisotropyRotation=0,this.anisotropyMap=null,this.clearcoatMap=null,this.clearcoatRoughness=0,this.clearcoatRoughnessMap=null,this.clearcoatNormalScale=new Oe(1,1),this.clearcoatNormalMap=null,this.ior=1.5,Object.defineProperty(this,"reflectivity",{get:function(){return et(2.5*(this.ior-1)/(this.ior+1),0,1)},set:function(t){this.ior=(1+.4*t)/(1-.4*t)}}),this.iridescenceMap=null,this.iridescenceIOR=1.3,this.iridescenceThicknessRange=[100,400],this.iridescenceThicknessMap=null,this.sheenColor=new Ye(0),this.sheenColorMap=null,this.sheenRoughness=1,this.sheenRoughnessMap=null,this.transmissionMap=null,this.thickness=0,this.thicknessMap=null,this.attenuationDistance=1/0,this.attenuationColor=new Ye(1,1,1),this.specularIntensity=1,this.specularIntensityMap=null,this.specularColor=new Ye(1,1,1),this.specularColorMap=null,this._anisotropy=0,this._clearcoat=0,this._dispersion=0,this._iridescence=0,this._sheen=0,this._transmission=0,this.setValues(e)}get anisotropy(){return this._anisotropy}set anisotropy(e){this._anisotropy>0!=e>0&&this.version++,this._anisotropy=e}get clearcoat(){return this._clearcoat}set clearcoat(e){this._clearcoat>0!=e>0&&this.version++,this._clearcoat=e}get iridescence(){return this._iridescence}set iridescence(e){this._iridescence>0!=e>0&&this.version++,this._iridescence=e}get dispersion(){return this._dispersion}set dispersion(e){this._dispersion>0!=e>0&&this.version++,this._dispersion=e}get sheen(){return this._sheen}set sheen(e){this._sheen>0!=e>0&&this.version++,this._sheen=e}get transmission(){return this._transmission}set transmission(e){this._transmission>0!=e>0&&this.version++,this._transmission=e}copy(e){return super.copy(e),this.defines={STANDARD:"",PHYSICAL:""},this.anisotropy=e.anisotropy,this.anisotropyRotation=e.anisotropyRotation,this.anisotropyMap=e.anisotropyMap,this.clearcoat=e.clearcoat,this.clearcoatMap=e.clearcoatMap,this.clearcoatRoughness=e.clearcoatRoughness,this.clearcoatRoughnessMap=e.clearcoatRoughnessMap,this.clearcoatNormalMap=e.clearcoatNormalMap,this.clearcoatNormalScale.copy(e.clearcoatNormalScale),this.dispersion=e.dispersion,this.ior=e.ior,this.iridescence=e.iridescence,this.iridescenceMap=e.iridescenceMap,this.iridescenceIOR=e.iridescenceIOR,this.iridescenceThicknessRange=[...e.iridescenceThicknessRange],this.iridescenceThicknessMap=e.iridescenceThicknessMap,this.sheen=e.sheen,this.sheenColor.copy(e.sheenColor),this.sheenColorMap=e.sheenColorMap,this.sheenRoughness=e.sheenRoughness,this.sheenRoughnessMap=e.sheenRoughnessMap,this.transmission=e.transmission,this.transmissionMap=e.transmissionMap,this.thickness=e.thickness,this.thicknessMap=e.thicknessMap,this.attenuationDistance=e.attenuationDistance,this.attenuationColor.copy(e.attenuationColor),this.specularIntensity=e.specularIntensity,this.specularIntensityMap=e.specularIntensityMap,this.specularColor.copy(e.specularColor),this.specularColorMap=e.specularColorMap,this}}class ip extends Hn{constructor(e){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Pd,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(e)}copy(e){return super.copy(e),this.depthPacking=e.depthPacking,this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this.wireframe=e.wireframe,this.wireframeLinewidth=e.wireframeLinewidth,this}}class sp extends Hn{constructor(e){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(e)}copy(e){return super.copy(e),this.map=e.map,this.alphaMap=e.alphaMap,this.displacementMap=e.displacementMap,this.displacementScale=e.displacementScale,this.displacementBias=e.displacementBias,this}}function qr(s,e){return!s||s.constructor===e?s:typeof e.BYTES_PER_ELEMENT=="number"?new e(s):Array.prototype.slice.call(s)}function rp(s){return ArrayBuffer.isView(s)&&!(s instanceof DataView)}function op(s){function e(i,r){return s[i]-s[r]}const t=s.length,n=new Array(t);for(let i=0;i!==t;++i)n[i]=i;return n.sort(e),n}function Vl(s,e,t){const n=s.length,i=new s.constructor(n);for(let r=0,o=0;o!==n;++r){const a=t[r]*e;for(let l=0;l!==e;++l)i[o++]=s[a+l]}return i}function pu(s,e,t,n){let i=1,r=s[0];for(;r!==void 0&&r[n]===void 0;)r=s[i++];if(r===void 0)return;let o=r[n];if(o!==void 0)if(Array.isArray(o))do o=r[n],o!==void 0&&(e.push(r.time),t.push(...o)),r=s[i++];while(r!==void 0);else if(o.toArray!==void 0)do o=r[n],o!==void 0&&(e.push(r.time),o.toArray(t,t.length)),r=s[i++];while(r!==void 0);else do o=r[n],o!==void 0&&(e.push(r.time),t.push(o)),r=s[i++];while(r!==void 0)}class xr{constructor(e,t,n,i){this.parameterPositions=e,this._cachedIndex=0,this.resultBuffer=i!==void 0?i:new t.constructor(n),this.sampleValues=t,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(e){const t=this.parameterPositions;let n=this._cachedIndex,i=t[n],r=t[n-1];e:{t:{let o;n:{i:if(!(e<i)){for(let a=n+2;;){if(i===void 0){if(e<r)break i;return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===a)break;if(r=i,i=t[++n],e<i)break t}o=t.length;break n}if(!(e>=r)){const a=t[1];e<a&&(n=2,r=a);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(i=r,r=t[--n-1],e>=r)break t}o=n,n=0;break n}break e}for(;n<o;){const a=n+o>>>1;e<t[a]?o=a:n=a+1}if(i=t[n],r=t[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(i===void 0)return n=t.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,i)}return this.interpolate_(n,r,e,i)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(e){const t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,r=e*i;for(let o=0;o!==i;++o)t[o]=n[r+o];return t}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}}class ap extends xr{constructor(e,t,n,i){super(e,t,n,i),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:Ms,endingEnd:Ms}}intervalChanged_(e,t,n){const i=this.parameterPositions;let r=e-2,o=e+1,a=i[r],l=i[o];if(a===void 0)switch(this.getSettings_().endingStart){case ys:r=e,a=2*t-n;break;case ho:r=i.length-2,a=t+i[r]-i[r+1];break;default:r=e,a=n}if(l===void 0)switch(this.getSettings_().endingEnd){case ys:o=e,l=2*n-t;break;case ho:o=1,l=n+i[1]-i[0];break;default:o=e-1,l=t}const c=(n-t)*.5,h=this.valueSize;this._weightPrev=c/(t-a),this._weightNext=c/(l-n),this._offsetPrev=r*h,this._offsetNext=o*h}interpolate_(e,t,n,i){const r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,h=this._offsetPrev,u=this._offsetNext,d=this._weightPrev,f=this._weightNext,g=(n-t)/(i-t),x=g*g,m=x*g,p=-d*m+2*d*x-d*g,M=(1+d)*m+(-1.5-2*d)*x+(-.5+d)*g+1,y=(-1-f)*m+(1.5+f)*x+.5*g,v=f*m-f*x;for(let w=0;w!==a;++w)r[w]=p*o[h+w]+M*o[c+w]+y*o[l+w]+v*o[u+w];return r}}class mu extends xr{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){const r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=e*a,c=l-a,h=(n-t)/(i-t),u=1-h;for(let d=0;d!==a;++d)r[d]=o[c+d]*u+o[l+d]*h;return r}}class cp extends xr{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e){return this.copySampleValue_(e-1)}}class Fn{constructor(e,t,n,i){if(e===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(t===void 0||t.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+e);this.name=e,this.times=qr(t,this.TimeBufferType),this.values=qr(n,this.ValueBufferType),this.setInterpolation(i||this.DefaultInterpolation)}static toJSON(e){const t=e.constructor;let n;if(t.toJSON!==this.toJSON)n=t.toJSON(e);else{n={name:e.name,times:qr(e.times,Array),values:qr(e.values,Array)};const i=e.getInterpolation();i!==e.DefaultInterpolation&&(n.interpolation=i)}return n.type=e.ValueTypeName,n}InterpolantFactoryMethodDiscrete(e){return new cp(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodLinear(e){return new mu(this.times,this.values,this.getValueSize(),e)}InterpolantFactoryMethodSmooth(e){return new ap(this.times,this.values,this.getValueSize(),e)}setInterpolation(e){let t;switch(e){case ur:t=this.InterpolantFactoryMethodDiscrete;break;case dr:t=this.InterpolantFactoryMethodLinear;break;case Io:t=this.InterpolantFactoryMethodSmooth;break}if(t===void 0){const n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(e!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=t,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return ur;case this.InterpolantFactoryMethodLinear:return dr;case this.InterpolantFactoryMethodSmooth:return Io}}getValueSize(){return this.values.length/this.times.length}shift(e){if(e!==0){const t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]+=e}return this}scale(e){if(e!==1){const t=this.times;for(let n=0,i=t.length;n!==i;++n)t[n]*=e}return this}trim(e,t){const n=this.times,i=n.length;let r=0,o=i-1;for(;r!==i&&n[r]<e;)++r;for(;o!==-1&&n[o]>t;)--o;if(++o,r!==0||o!==i){r>=o&&(o=Math.max(o,1),r=o-1);const a=this.getValueSize();this.times=n.slice(r,o),this.values=this.values.slice(r*a,o*a)}return this}validate(){let e=!0;const t=this.getValueSize();t-Math.floor(t)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),e=!1);const n=this.times,i=this.values,r=n.length;r===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),e=!1);let o=null;for(let a=0;a!==r;a++){const l=n[a];if(typeof l=="number"&&isNaN(l)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,a,l),e=!1;break}if(o!==null&&o>l){console.error("THREE.KeyframeTrack: Out of order keys.",this,a,l,o),e=!1;break}o=l}if(i!==void 0&&rp(i))for(let a=0,l=i.length;a!==l;++a){const c=i[a];if(isNaN(c)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,a,c),e=!1;break}}return e}optimize(){const e=this.times.slice(),t=this.values.slice(),n=this.getValueSize(),i=this.getInterpolation()===Io,r=e.length-1;let o=1;for(let a=1;a<r;++a){let l=!1;const c=e[a],h=e[a+1];if(c!==h&&(a!==1||c!==e[0]))if(i)l=!0;else{const u=a*n,d=u-n,f=u+n;for(let g=0;g!==n;++g){const x=t[u+g];if(x!==t[d+g]||x!==t[f+g]){l=!0;break}}}if(l){if(a!==o){e[o]=e[a];const u=a*n,d=o*n;for(let f=0;f!==n;++f)t[d+f]=t[u+f]}++o}}if(r>0){e[o]=e[r];for(let a=r*n,l=o*n,c=0;c!==n;++c)t[l+c]=t[a+c];++o}return o!==e.length?(this.times=e.slice(0,o),this.values=t.slice(0,o*n)):(this.times=e,this.values=t),this}clone(){const e=this.times.slice(),t=this.values.slice(),n=this.constructor,i=new n(this.name,e,t);return i.createInterpolant=this.createInterpolant,i}}Fn.prototype.ValueTypeName="";Fn.prototype.TimeBufferType=Float32Array;Fn.prototype.ValueBufferType=Float32Array;Fn.prototype.DefaultInterpolation=dr;class Os extends Fn{constructor(e,t,n){super(e,t,n)}}Os.prototype.ValueTypeName="bool";Os.prototype.ValueBufferType=Array;Os.prototype.DefaultInterpolation=ur;Os.prototype.InterpolantFactoryMethodLinear=void 0;Os.prototype.InterpolantFactoryMethodSmooth=void 0;class gu extends Fn{constructor(e,t,n,i){super(e,t,n,i)}}gu.prototype.ValueTypeName="color";class Ds extends Fn{constructor(e,t,n,i){super(e,t,n,i)}}Ds.prototype.ValueTypeName="number";class lp extends xr{constructor(e,t,n,i){super(e,t,n,i)}interpolate_(e,t,n,i){const r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=(n-t)/(i-t);let c=e*a;for(let h=c+a;c!==h;c+=4)qt.slerpFlat(r,0,o,c-a,o,c,l);return r}}class Ns extends Fn{constructor(e,t,n,i){super(e,t,n,i)}InterpolantFactoryMethodLinear(e){return new lp(this.times,this.values,this.getValueSize(),e)}}Ns.prototype.ValueTypeName="quaternion";Ns.prototype.InterpolantFactoryMethodSmooth=void 0;class zs extends Fn{constructor(e,t,n){super(e,t,n)}}zs.prototype.ValueTypeName="string";zs.prototype.ValueBufferType=Array;zs.prototype.DefaultInterpolation=ur;zs.prototype.InterpolantFactoryMethodLinear=void 0;zs.prototype.InterpolantFactoryMethodSmooth=void 0;class Us extends Fn{constructor(e,t,n,i){super(e,t,n,i)}}Us.prototype.ValueTypeName="vector";class dc{constructor(e="",t=-1,n=[],i=Lc){this.name=e,this.tracks=n,this.duration=t,this.blendMode=i,this.uuid=Dn(),this.userData={},this.duration<0&&this.resetDuration()}static parse(e){const t=[],n=e.tracks,i=1/(e.fps||1);for(let o=0,a=n.length;o!==a;++o)t.push(up(n[o]).scale(i));const r=new this(e.name,e.duration,t,e.blendMode);return r.uuid=e.uuid,r.userData=JSON.parse(e.userData||"{}"),r}static toJSON(e){const t=[],n=e.tracks,i={name:e.name,duration:e.duration,tracks:t,uuid:e.uuid,blendMode:e.blendMode,userData:JSON.stringify(e.userData)};for(let r=0,o=n.length;r!==o;++r)t.push(Fn.toJSON(n[r]));return i}static CreateFromMorphTargetSequence(e,t,n,i){const r=t.length,o=[];for(let a=0;a<r;a++){let l=[],c=[];l.push((a+r-1)%r,a,(a+1)%r),c.push(0,1,0);const h=op(l);l=Vl(l,1,h),c=Vl(c,1,h),!i&&l[0]===0&&(l.push(r),c.push(c[0])),o.push(new Ds(".morphTargetInfluences["+t[a].name+"]",l,c).scale(1/n))}return new this(e,-1,o)}static findByName(e,t){let n=e;if(!Array.isArray(e)){const i=e;n=i.geometry&&i.geometry.animations||i.animations}for(let i=0;i<n.length;i++)if(n[i].name===t)return n[i];return null}static CreateClipsFromMorphTargetSequences(e,t,n){const i={},r=/^([\w-]*?)([\d]+)$/;for(let a=0,l=e.length;a<l;a++){const c=e[a],h=c.name.match(r);if(h&&h.length>1){const u=h[1];let d=i[u];d||(i[u]=d=[]),d.push(c)}}const o=[];for(const a in i)o.push(this.CreateFromMorphTargetSequence(a,i[a],t,n));return o}static parseAnimation(e,t){if(console.warn("THREE.AnimationClip: parseAnimation() is deprecated and will be removed with r185"),!e)return console.error("THREE.AnimationClip: No animation in JSONLoader data."),null;const n=function(u,d,f,g,x){if(f.length!==0){const m=[],p=[];pu(f,m,p,g),m.length!==0&&x.push(new u(d,m,p))}},i=[],r=e.name||"default",o=e.fps||30,a=e.blendMode;let l=e.length||-1;const c=e.hierarchy||[];for(let u=0;u<c.length;u++){const d=c[u].keys;if(!(!d||d.length===0))if(d[0].morphTargets){const f={};let g;for(g=0;g<d.length;g++)if(d[g].morphTargets)for(let x=0;x<d[g].morphTargets.length;x++)f[d[g].morphTargets[x]]=-1;for(const x in f){const m=[],p=[];for(let M=0;M!==d[g].morphTargets.length;++M){const y=d[g];m.push(y.time),p.push(y.morphTarget===x?1:0)}i.push(new Ds(".morphTargetInfluence["+x+"]",m,p))}l=f.length*o}else{const f=".bones["+t[u].name+"]";n(Us,f+".position",d,"pos",i),n(Ns,f+".quaternion",d,"rot",i),n(Us,f+".scale",d,"scl",i)}}return i.length===0?null:new this(r,l,i,a)}resetDuration(){const e=this.tracks;let t=0;for(let n=0,i=e.length;n!==i;++n){const r=this.tracks[n];t=Math.max(t,r.times[r.times.length-1])}return this.duration=t,this}trim(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].trim(0,this.duration);return this}validate(){let e=!0;for(let t=0;t<this.tracks.length;t++)e=e&&this.tracks[t].validate();return e}optimize(){for(let e=0;e<this.tracks.length;e++)this.tracks[e].optimize();return this}clone(){const e=[];for(let n=0;n<this.tracks.length;n++)e.push(this.tracks[n].clone());const t=new this.constructor(this.name,this.duration,e,this.blendMode);return t.userData=JSON.parse(JSON.stringify(this.userData)),t}toJSON(){return this.constructor.toJSON(this)}}function hp(s){switch(s.toLowerCase()){case"scalar":case"double":case"float":case"number":case"integer":return Ds;case"vector":case"vector2":case"vector3":case"vector4":return Us;case"color":return gu;case"quaternion":return Ns;case"bool":case"boolean":return Os;case"string":return zs}throw new Error("THREE.KeyframeTrack: Unsupported typeName: "+s)}function up(s){if(s.type===void 0)throw new Error("THREE.KeyframeTrack: track type undefined, can not parse");const e=hp(s.type);if(s.times===void 0){const t=[],n=[];pu(s.keys,t,n,"value"),s.times=t,s.values=n}return e.parse!==void 0?e.parse(s):new e(s.name,s.times,s.values,s.interpolation)}const oi={enabled:!1,files:{},add:function(s,e){this.enabled!==!1&&(this.files[s]=e)},get:function(s){if(this.enabled!==!1)return this.files[s]},remove:function(s){delete this.files[s]},clear:function(){this.files={}}};class dp{constructor(e,t,n){const i=this;let r=!1,o=0,a=0,l;const c=[];this.onStart=void 0,this.onLoad=e,this.onProgress=t,this.onError=n,this.abortController=new AbortController,this.itemStart=function(h){a++,r===!1&&i.onStart!==void 0&&i.onStart(h,o,a),r=!0},this.itemEnd=function(h){o++,i.onProgress!==void 0&&i.onProgress(h,o,a),o===a&&(r=!1,i.onLoad!==void 0&&i.onLoad())},this.itemError=function(h){i.onError!==void 0&&i.onError(h)},this.resolveURL=function(h){return l?l(h):h},this.setURLModifier=function(h){return l=h,this},this.addHandler=function(h,u){return c.push(h,u),this},this.removeHandler=function(h){const u=c.indexOf(h);return u!==-1&&c.splice(u,2),this},this.getHandler=function(h){for(let u=0,d=c.length;u<d;u+=2){const f=c[u],g=c[u+1];if(f.global&&(f.lastIndex=0),f.test(h))return g}return null},this.abort=function(){return this.abortController.abort(),this.abortController=new AbortController,this}}}const fp=new dp;class Bs{constructor(e){this.manager=e!==void 0?e:fp,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(e,t){const n=this;return new Promise(function(i,r){n.load(e,i,t,r)})}parse(){}setCrossOrigin(e){return this.crossOrigin=e,this}setWithCredentials(e){return this.withCredentials=e,this}setPath(e){return this.path=e,this}setResourcePath(e){return this.resourcePath=e,this}setRequestHeader(e){return this.requestHeader=e,this}abort(){return this}}Bs.DEFAULT_MATERIAL_NAME="__DEFAULT";const ti={};class pp extends Error{constructor(e,t){super(e),this.response=t}}class _u extends Bs{constructor(e){super(e),this.mimeType="",this.responseType="",this._abortController=new AbortController}load(e,t,n,i){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=oi.get(`file:${e}`);if(r!==void 0)return this.manager.itemStart(e),setTimeout(()=>{t&&t(r),this.manager.itemEnd(e)},0),r;if(ti[e]!==void 0){ti[e].push({onLoad:t,onProgress:n,onError:i});return}ti[e]=[],ti[e].push({onLoad:t,onProgress:n,onError:i});const o=new Request(e,{headers:new Headers(this.requestHeader),credentials:this.withCredentials?"include":"same-origin",signal:typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal}),a=this.mimeType,l=this.responseType;fetch(o).then(c=>{if(c.status===200||c.status===0){if(c.status===0&&console.warn("THREE.FileLoader: HTTP Status 0 received."),typeof ReadableStream>"u"||c.body===void 0||c.body.getReader===void 0)return c;const h=ti[e],u=c.body.getReader(),d=c.headers.get("X-File-Size")||c.headers.get("Content-Length"),f=d?parseInt(d):0,g=f!==0;let x=0;const m=new ReadableStream({start(p){M();function M(){u.read().then(({done:y,value:v})=>{if(y)p.close();else{x+=v.byteLength;const w=new ProgressEvent("progress",{lengthComputable:g,loaded:x,total:f});for(let S=0,R=h.length;S<R;S++){const I=h[S];I.onProgress&&I.onProgress(w)}p.enqueue(v),M()}},y=>{p.error(y)})}}});return new Response(m)}else throw new pp(`fetch for "${c.url}" responded with ${c.status}: ${c.statusText}`,c)}).then(c=>{switch(l){case"arraybuffer":return c.arrayBuffer();case"blob":return c.blob();case"document":return c.text().then(h=>new DOMParser().parseFromString(h,a));case"json":return c.json();default:if(a==="")return c.text();{const u=/charset="?([^;"\s]*)"?/i.exec(a),d=u&&u[1]?u[1].toLowerCase():void 0,f=new TextDecoder(d);return c.arrayBuffer().then(g=>f.decode(g))}}}).then(c=>{oi.add(`file:${e}`,c);const h=ti[e];delete ti[e];for(let u=0,d=h.length;u<d;u++){const f=h[u];f.onLoad&&f.onLoad(c)}}).catch(c=>{const h=ti[e];if(h===void 0)throw this.manager.itemError(e),c;delete ti[e];for(let u=0,d=h.length;u<d;u++){const f=h[u];f.onError&&f.onError(c)}this.manager.itemError(e)}).finally(()=>{this.manager.itemEnd(e)}),this.manager.itemStart(e)}setResponseType(e){return this.responseType=e,this}setMimeType(e){return this.mimeType=e,this}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}}const xs=new WeakMap;class mp extends Bs{constructor(e){super(e)}load(e,t,n,i){this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=this,o=oi.get(`image:${e}`);if(o!==void 0){if(o.complete===!0)r.manager.itemStart(e),setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0);else{let u=xs.get(o);u===void 0&&(u=[],xs.set(o,u)),u.push({onLoad:t,onError:i})}return o}const a=fr("img");function l(){h(),t&&t(this);const u=xs.get(this)||[];for(let d=0;d<u.length;d++){const f=u[d];f.onLoad&&f.onLoad(this)}xs.delete(this),r.manager.itemEnd(e)}function c(u){h(),i&&i(u),oi.remove(`image:${e}`);const d=xs.get(this)||[];for(let f=0;f<d.length;f++){const g=d[f];g.onError&&g.onError(u)}xs.delete(this),r.manager.itemError(e),r.manager.itemEnd(e)}function h(){a.removeEventListener("load",l,!1),a.removeEventListener("error",c,!1)}return a.addEventListener("load",l,!1),a.addEventListener("error",c,!1),e.slice(0,5)!=="data:"&&this.crossOrigin!==void 0&&(a.crossOrigin=this.crossOrigin),oi.add(`image:${e}`,a),r.manager.itemStart(e),a.src=e,a}}class _o extends Bs{constructor(e){super(e)}load(e,t,n,i){const r=new Nt,o=new mp(this.manager);return o.setCrossOrigin(this.crossOrigin),o.setPath(this.path),o.load(e,function(a){r.image=a,r.needsUpdate=!0,t!==void 0&&t(r)},n,i),r}}class To extends Et{constructor(e,t=1){super(),this.isLight=!0,this.type="Light",this.color=new Ye(e),this.intensity=t}dispose(){}copy(e,t){return super.copy(e,t),this.color.copy(e.color),this.intensity=e.intensity,this}toJSON(e){const t=super.toJSON(e);return t.object.color=this.color.getHex(),t.object.intensity=this.intensity,this.groundColor!==void 0&&(t.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(t.object.distance=this.distance),this.angle!==void 0&&(t.object.angle=this.angle),this.decay!==void 0&&(t.object.decay=this.decay),this.penumbra!==void 0&&(t.object.penumbra=this.penumbra),this.shadow!==void 0&&(t.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(t.object.target=this.target.uuid),t}}class gp extends To{constructor(e,t,n){super(e,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Et.DEFAULT_UP),this.updateMatrix(),this.groundColor=new Ye(t)}copy(e,t){return super.copy(e,t),this.groundColor.copy(e.groundColor),this}}const ra=new Ze,Gl=new P,Wl=new P;class Hc{constructor(e){this.camera=e,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Oe(512,512),this.mapType=Gn,this.map=null,this.mapPass=null,this.matrix=new Ze,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new bo,this._frameExtents=new Oe(1,1),this._viewportCount=1,this._viewports=[new ht(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(e){const t=this.camera,n=this.matrix;Gl.setFromMatrixPosition(e.matrixWorld),t.position.copy(Gl),Wl.setFromMatrixPosition(e.target.matrixWorld),t.lookAt(Wl),t.updateMatrixWorld(),ra.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this._frustum.setFromProjectionMatrix(ra,t.coordinateSystem,t.reversedDepth),t.reversedDepth?n.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(ra)}getViewport(e){return this._viewports[e]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(e){return this.camera=e.camera.clone(),this.intensity=e.intensity,this.bias=e.bias,this.radius=e.radius,this.autoUpdate=e.autoUpdate,this.needsUpdate=e.needsUpdate,this.normalBias=e.normalBias,this.blurSamples=e.blurSamples,this.mapSize.copy(e.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){const e={};return this.intensity!==1&&(e.intensity=this.intensity),this.bias!==0&&(e.bias=this.bias),this.normalBias!==0&&(e.normalBias=this.normalBias),this.radius!==1&&(e.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(e.mapSize=this.mapSize.toArray()),e.camera=this.camera.toJSON(!1).object,delete e.camera.matrix,e}}class _p extends Hc{constructor(){super(new Zt(50,1,.5,500)),this.isSpotLightShadow=!0,this.focus=1,this.aspect=1}updateMatrices(e){const t=this.camera,n=Cs*2*e.angle*this.focus,i=this.mapSize.width/this.mapSize.height*this.aspect,r=e.distance||t.far;(n!==t.fov||i!==t.aspect||r!==t.far)&&(t.fov=n,t.aspect=i,t.far=r,t.updateProjectionMatrix()),super.updateMatrices(e)}copy(e){return super.copy(e),this.focus=e.focus,this}}class xp extends To{constructor(e,t,n=0,i=Math.PI/3,r=0,o=2){super(e,t),this.isSpotLight=!0,this.type="SpotLight",this.position.copy(Et.DEFAULT_UP),this.updateMatrix(),this.target=new Et,this.distance=n,this.angle=i,this.penumbra=r,this.decay=o,this.map=null,this.shadow=new _p}get power(){return this.intensity*Math.PI}set power(e){this.intensity=e/Math.PI}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.angle=e.angle,this.penumbra=e.penumbra,this.decay=e.decay,this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}const Xl=new Ze,Ks=new P,oa=new P;class vp extends Hc{constructor(){super(new Zt(90,1,.5,500)),this.isPointLightShadow=!0,this._frameExtents=new Oe(4,2),this._viewportCount=6,this._viewports=[new ht(2,1,1,1),new ht(0,1,1,1),new ht(3,1,1,1),new ht(1,1,1,1),new ht(3,0,1,1),new ht(1,0,1,1)],this._cubeDirections=[new P(1,0,0),new P(-1,0,0),new P(0,0,1),new P(0,0,-1),new P(0,1,0),new P(0,-1,0)],this._cubeUps=[new P(0,1,0),new P(0,1,0),new P(0,1,0),new P(0,1,0),new P(0,0,1),new P(0,0,-1)]}updateMatrices(e,t=0){const n=this.camera,i=this.matrix,r=e.distance||n.far;r!==n.far&&(n.far=r,n.updateProjectionMatrix()),Ks.setFromMatrixPosition(e.matrixWorld),n.position.copy(Ks),oa.copy(n.position),oa.add(this._cubeDirections[t]),n.up.copy(this._cubeUps[t]),n.lookAt(oa),n.updateMatrixWorld(),i.makeTranslation(-Ks.x,-Ks.y,-Ks.z),Xl.multiplyMatrices(n.projectionMatrix,n.matrixWorldInverse),this._frustum.setFromProjectionMatrix(Xl,n.coordinateSystem,n.reversedDepth)}}class Mp extends To{constructor(e,t,n=0,i=2){super(e,t),this.isPointLight=!0,this.type="PointLight",this.distance=n,this.decay=i,this.shadow=new vp}get power(){return this.intensity*4*Math.PI}set power(e){this.intensity=e/(4*Math.PI)}dispose(){this.shadow.dispose()}copy(e,t){return super.copy(e,t),this.distance=e.distance,this.decay=e.decay,this.shadow=e.shadow.clone(),this}}class Vc extends iu{constructor(e=-1,t=1,n=1,i=-1,r=.1,o=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=e,this.right=t,this.top=n,this.bottom=i,this.near=r,this.far=o,this.updateProjectionMatrix()}copy(e,t){return super.copy(e,t),this.left=e.left,this.right=e.right,this.top=e.top,this.bottom=e.bottom,this.near=e.near,this.far=e.far,this.zoom=e.zoom,this.view=e.view===null?null:Object.assign({},e.view),this}setViewOffset(e,t,n,i,r,o){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=e,this.view.fullHeight=t,this.view.offsetX=n,this.view.offsetY=i,this.view.width=r,this.view.height=o,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){const e=(this.right-this.left)/(2*this.zoom),t=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,i=(this.top+this.bottom)/2;let r=n-e,o=n+e,a=i+t,l=i-t;if(this.view!==null&&this.view.enabled){const c=(this.right-this.left)/this.view.fullWidth/this.zoom,h=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,o=r+c*this.view.width,a-=h*this.view.offsetY,l=a-h*this.view.height}this.projectionMatrix.makeOrthographic(r,o,a,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(e){const t=super.toJSON(e);return t.object.zoom=this.zoom,t.object.left=this.left,t.object.right=this.right,t.object.top=this.top,t.object.bottom=this.bottom,t.object.near=this.near,t.object.far=this.far,this.view!==null&&(t.object.view=Object.assign({},this.view)),t}}class yp extends Hc{constructor(){super(new Vc(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}}class xu extends To{constructor(e,t){super(e,t),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Et.DEFAULT_UP),this.updateMatrix(),this.target=new Et,this.shadow=new yp}dispose(){this.shadow.dispose()}copy(e){return super.copy(e),this.target=e.target.clone(),this.shadow=e.shadow.clone(),this}}class sr{static extractUrlBase(e){const t=e.lastIndexOf("/");return t===-1?"./":e.slice(0,t+1)}static resolveURL(e,t){return typeof e!="string"||e===""?"":(/^https?:\/\//i.test(t)&&/^\//.test(e)&&(t=t.replace(/(^https?:\/\/[^\/]+).*/i,"$1")),/^(https?:)?\/\//i.test(e)||/^data:.*,.*$/i.test(e)||/^blob:.*$/i.test(e)?e:t+e)}}const aa=new WeakMap;class bp extends Bs{constructor(e){super(e),this.isImageBitmapLoader=!0,typeof createImageBitmap>"u"&&console.warn("THREE.ImageBitmapLoader: createImageBitmap() not supported."),typeof fetch>"u"&&console.warn("THREE.ImageBitmapLoader: fetch() not supported."),this.options={premultiplyAlpha:"none"},this._abortController=new AbortController}setOptions(e){return this.options=e,this}load(e,t,n,i){e===void 0&&(e=""),this.path!==void 0&&(e=this.path+e),e=this.manager.resolveURL(e);const r=this,o=oi.get(`image-bitmap:${e}`);if(o!==void 0){if(r.manager.itemStart(e),o.then){o.then(c=>{if(aa.has(o)===!0)i&&i(aa.get(o)),r.manager.itemError(e),r.manager.itemEnd(e);else return t&&t(c),r.manager.itemEnd(e),c});return}return setTimeout(function(){t&&t(o),r.manager.itemEnd(e)},0),o}const a={};a.credentials=this.crossOrigin==="anonymous"?"same-origin":"include",a.headers=this.requestHeader,a.signal=typeof AbortSignal.any=="function"?AbortSignal.any([this._abortController.signal,this.manager.abortController.signal]):this._abortController.signal;const l=fetch(e,a).then(function(c){return c.blob()}).then(function(c){return createImageBitmap(c,Object.assign(r.options,{colorSpaceConversion:"none"}))}).then(function(c){return oi.add(`image-bitmap:${e}`,c),t&&t(c),r.manager.itemEnd(e),c}).catch(function(c){i&&i(c),aa.set(l,c),oi.remove(`image-bitmap:${e}`),r.manager.itemError(e),r.manager.itemEnd(e)});oi.add(`image-bitmap:${e}`,l),r.manager.itemStart(e)}abort(){return this._abortController.abort(),this._abortController=new AbortController,this}}class Sp extends Zt{constructor(e=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=e}}class Ep{constructor(e,t,n){this.binding=e,this.valueSize=n;let i,r,o;switch(t){case"quaternion":i=this._slerp,r=this._slerpAdditive,o=this._setAdditiveIdentityQuaternion,this.buffer=new Float64Array(n*6),this._workIndex=5;break;case"string":case"bool":i=this._select,r=this._select,o=this._setAdditiveIdentityOther,this.buffer=new Array(n*5);break;default:i=this._lerp,r=this._lerpAdditive,o=this._setAdditiveIdentityNumeric,this.buffer=new Float64Array(n*5)}this._mixBufferRegion=i,this._mixBufferRegionAdditive=r,this._setIdentity=o,this._origIndex=3,this._addIndex=4,this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,this.useCount=0,this.referenceCount=0}accumulate(e,t){const n=this.buffer,i=this.valueSize,r=e*i+i;let o=this.cumulativeWeight;if(o===0){for(let a=0;a!==i;++a)n[r+a]=n[a];o=t}else{o+=t;const a=t/o;this._mixBufferRegion(n,r,0,a,i)}this.cumulativeWeight=o}accumulateAdditive(e){const t=this.buffer,n=this.valueSize,i=n*this._addIndex;this.cumulativeWeightAdditive===0&&this._setIdentity(),this._mixBufferRegionAdditive(t,i,0,e,n),this.cumulativeWeightAdditive+=e}apply(e){const t=this.valueSize,n=this.buffer,i=e*t+t,r=this.cumulativeWeight,o=this.cumulativeWeightAdditive,a=this.binding;if(this.cumulativeWeight=0,this.cumulativeWeightAdditive=0,r<1){const l=t*this._origIndex;this._mixBufferRegion(n,i,l,1-r,t)}o>0&&this._mixBufferRegionAdditive(n,i,this._addIndex*t,1,t);for(let l=t,c=t+t;l!==c;++l)if(n[l]!==n[l+t]){a.setValue(n,i);break}}saveOriginalState(){const e=this.binding,t=this.buffer,n=this.valueSize,i=n*this._origIndex;e.getValue(t,i);for(let r=n,o=i;r!==o;++r)t[r]=t[i+r%n];this._setIdentity(),this.cumulativeWeight=0,this.cumulativeWeightAdditive=0}restoreOriginalState(){const e=this.valueSize*3;this.binding.setValue(this.buffer,e)}_setAdditiveIdentityNumeric(){const e=this._addIndex*this.valueSize,t=e+this.valueSize;for(let n=e;n<t;n++)this.buffer[n]=0}_setAdditiveIdentityQuaternion(){this._setAdditiveIdentityNumeric(),this.buffer[this._addIndex*this.valueSize+3]=1}_setAdditiveIdentityOther(){const e=this._origIndex*this.valueSize,t=this._addIndex*this.valueSize;for(let n=0;n<this.valueSize;n++)this.buffer[t+n]=this.buffer[e+n]}_select(e,t,n,i,r){if(i>=.5)for(let o=0;o!==r;++o)e[t+o]=e[n+o]}_slerp(e,t,n,i){qt.slerpFlat(e,t,e,t,e,n,i)}_slerpAdditive(e,t,n,i,r){const o=this._workIndex*r;qt.multiplyQuaternionsFlat(e,o,e,t,e,n),qt.slerpFlat(e,t,e,t,e,o,i)}_lerp(e,t,n,i,r){const o=1-i;for(let a=0;a!==r;++a){const l=t+a;e[l]=e[l]*o+e[n+a]*i}}_lerpAdditive(e,t,n,i,r){for(let o=0;o!==r;++o){const a=t+o;e[a]=e[a]+e[n+o]*i}}}const Gc="\\[\\]\\.:\\/",Tp=new RegExp("["+Gc+"]","g"),Wc="[^"+Gc+"]",wp="[^"+Gc.replace("\\.","")+"]",Ap=/((?:WC+[\/:])*)/.source.replace("WC",Wc),Rp=/(WCOD+)?/.source.replace("WCOD",wp),Cp=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Wc),Ip=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Wc),Pp=new RegExp("^"+Ap+Rp+Cp+Ip+"$"),Lp=["material","materials","bones","map"];class Dp{constructor(e,t,n){const i=n||ut.parseTrackName(t);this._targetGroup=e,this._bindings=e.subscribe_(t,i)}getValue(e,t){this.bind();const n=this._targetGroup.nCachedObjects_,i=this._bindings[n];i!==void 0&&i.getValue(e,t)}setValue(e,t){const n=this._bindings;for(let i=this._targetGroup.nCachedObjects_,r=n.length;i!==r;++i)n[i].setValue(e,t)}bind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].bind()}unbind(){const e=this._bindings;for(let t=this._targetGroup.nCachedObjects_,n=e.length;t!==n;++t)e[t].unbind()}}class ut{constructor(e,t,n){this.path=t,this.parsedPath=n||ut.parseTrackName(t),this.node=ut.findNode(e,this.parsedPath.nodeName),this.rootNode=e,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(e,t,n){return e&&e.isAnimationObjectGroup?new ut.Composite(e,t,n):new ut(e,t,n)}static sanitizeNodeName(e){return e.replace(/\s/g,"_").replace(Tp,"")}static parseTrackName(e){const t=Pp.exec(e);if(t===null)throw new Error("PropertyBinding: Cannot parse trackName: "+e);const n={nodeName:t[2],objectName:t[3],objectIndex:t[4],propertyName:t[5],propertyIndex:t[6]},i=n.nodeName&&n.nodeName.lastIndexOf(".");if(i!==void 0&&i!==-1){const r=n.nodeName.substring(i+1);Lp.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,i),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+e);return n}static findNode(e,t){if(t===void 0||t===""||t==="."||t===-1||t===e.name||t===e.uuid)return e;if(e.skeleton){const n=e.skeleton.getBoneByName(t);if(n!==void 0)return n}if(e.children){const n=function(r){for(let o=0;o<r.length;o++){const a=r[o];if(a.name===t||a.uuid===t)return a;const l=n(a.children);if(l)return l}return null},i=n(e.children);if(i)return i}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(e,t){e[t]=this.targetObject[this.propertyName]}_getValue_array(e,t){const n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)e[t++]=n[i]}_getValue_arrayElement(e,t){e[t]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(e,t){this.resolvedProperty.toArray(e,t)}_setValue_direct(e,t){this.targetObject[this.propertyName]=e[t]}_setValue_direct_setNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(e,t){this.targetObject[this.propertyName]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(e,t){const n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=e[t++]}_setValue_array_setNeedsUpdate(e,t){const n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=e[t++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(e,t){const n=this.resolvedProperty;for(let i=0,r=n.length;i!==r;++i)n[i]=e[t++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(e,t){this.resolvedProperty[this.propertyIndex]=e[t]}_setValue_arrayElement_setNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty[this.propertyIndex]=e[t],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(e,t){this.resolvedProperty.fromArray(e,t)}_setValue_fromArray_setNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(e,t){this.resolvedProperty.fromArray(e,t),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(e,t){this.bind(),this.getValue(e,t)}_setValue_unbound(e,t){this.bind(),this.setValue(e,t)}bind(){let e=this.node;const t=this.parsedPath,n=t.objectName,i=t.propertyName;let r=t.propertyIndex;if(e||(e=ut.findNode(this.rootNode,t.nodeName),this.node=e),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!e){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=t.objectIndex;switch(n){case"materials":if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}e=e.material.materials;break;case"bones":if(!e.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}e=e.skeleton.bones;for(let h=0;h<e.length;h++)if(e[h].name===c){c=h;break}break;case"map":if("map"in e){e=e.map;break}if(!e.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!e.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}e=e.material.map;break;default:if(e[n]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}e=e[n]}if(c!==void 0){if(e[c]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,e);return}e=e[c]}}const o=e[i];if(o===void 0){const c=t.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+c+"."+i+" but it wasn't found.",e);return}let a=this.Versioning.None;this.targetObject=e,e.isMaterial===!0?a=this.Versioning.NeedsUpdate:e.isObject3D===!0&&(a=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(i==="morphTargetInfluences"){if(!e.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!e.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}e.morphTargetDictionary[r]!==void 0&&(r=e.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=o,this.propertyIndex=r}else o.fromArray!==void 0&&o.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=o):Array.isArray(o)?(l=this.BindingType.EntireArray,this.resolvedProperty=o):this.propertyName=i;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][a]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}}ut.Composite=Dp;ut.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};ut.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};ut.prototype.GetterByBindingType=[ut.prototype._getValue_direct,ut.prototype._getValue_array,ut.prototype._getValue_arrayElement,ut.prototype._getValue_toArray];ut.prototype.SetterByBindingTypeAndVersioning=[[ut.prototype._setValue_direct,ut.prototype._setValue_direct_setNeedsUpdate,ut.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[ut.prototype._setValue_array,ut.prototype._setValue_array_setNeedsUpdate,ut.prototype._setValue_array_setMatrixWorldNeedsUpdate],[ut.prototype._setValue_arrayElement,ut.prototype._setValue_arrayElement_setNeedsUpdate,ut.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[ut.prototype._setValue_fromArray,ut.prototype._setValue_fromArray_setNeedsUpdate,ut.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];class Np{constructor(e,t,n=null,i=t.blendMode){this._mixer=e,this._clip=t,this._localRoot=n,this.blendMode=i;const r=t.tracks,o=r.length,a=new Array(o),l={endingStart:Ms,endingEnd:Ms};for(let c=0;c!==o;++c){const h=r[c].createInterpolant(null);a[c]=h,h.settings=l}this._interpolantSettings=l,this._interpolants=a,this._propertyBindings=new Array(o),this._cacheIndex=null,this._byClipCacheIndex=null,this._timeScaleInterpolant=null,this._weightInterpolant=null,this.loop=Ad,this._loopCount=-1,this._startTime=null,this.time=0,this.timeScale=1,this._effectiveTimeScale=1,this.weight=1,this._effectiveWeight=1,this.repetitions=1/0,this.paused=!1,this.enabled=!0,this.clampWhenFinished=!1,this.zeroSlopeAtStart=!0,this.zeroSlopeAtEnd=!0}play(){return this._mixer._activateAction(this),this}stop(){return this._mixer._deactivateAction(this),this.reset()}reset(){return this.paused=!1,this.enabled=!0,this.time=0,this._loopCount=-1,this._startTime=null,this.stopFading().stopWarping()}isRunning(){return this.enabled&&!this.paused&&this.timeScale!==0&&this._startTime===null&&this._mixer._isActiveAction(this)}isScheduled(){return this._mixer._isActiveAction(this)}startAt(e){return this._startTime=e,this}setLoop(e,t){return this.loop=e,this.repetitions=t,this}setEffectiveWeight(e){return this.weight=e,this._effectiveWeight=this.enabled?e:0,this.stopFading()}getEffectiveWeight(){return this._effectiveWeight}fadeIn(e){return this._scheduleFading(e,0,1)}fadeOut(e){return this._scheduleFading(e,1,0)}crossFadeFrom(e,t,n=!1){if(e.fadeOut(t),this.fadeIn(t),n===!0){const i=this._clip.duration,r=e._clip.duration,o=r/i,a=i/r;e.warp(1,o,t),this.warp(a,1,t)}return this}crossFadeTo(e,t,n=!1){return e.crossFadeFrom(this,t,n)}stopFading(){const e=this._weightInterpolant;return e!==null&&(this._weightInterpolant=null,this._mixer._takeBackControlInterpolant(e)),this}setEffectiveTimeScale(e){return this.timeScale=e,this._effectiveTimeScale=this.paused?0:e,this.stopWarping()}getEffectiveTimeScale(){return this._effectiveTimeScale}setDuration(e){return this.timeScale=this._clip.duration/e,this.stopWarping()}syncWith(e){return this.time=e.time,this.timeScale=e.timeScale,this.stopWarping()}halt(e){return this.warp(this._effectiveTimeScale,0,e)}warp(e,t,n){const i=this._mixer,r=i.time,o=this.timeScale;let a=this._timeScaleInterpolant;a===null&&(a=i._lendControlInterpolant(),this._timeScaleInterpolant=a);const l=a.parameterPositions,c=a.sampleValues;return l[0]=r,l[1]=r+n,c[0]=e/o,c[1]=t/o,this}stopWarping(){const e=this._timeScaleInterpolant;return e!==null&&(this._timeScaleInterpolant=null,this._mixer._takeBackControlInterpolant(e)),this}getMixer(){return this._mixer}getClip(){return this._clip}getRoot(){return this._localRoot||this._mixer._root}_update(e,t,n,i){if(!this.enabled){this._updateWeight(e);return}const r=this._startTime;if(r!==null){const l=(e-r)*n;l<0||n===0?t=0:(this._startTime=null,t=n*l)}t*=this._updateTimeScale(e);const o=this._updateTime(t),a=this._updateWeight(e);if(a>0){const l=this._interpolants,c=this._propertyBindings;switch(this.blendMode){case Cd:for(let h=0,u=l.length;h!==u;++h)l[h].evaluate(o),c[h].accumulateAdditive(a);break;case Lc:default:for(let h=0,u=l.length;h!==u;++h)l[h].evaluate(o),c[h].accumulate(i,a)}}}_updateWeight(e){let t=0;if(this.enabled){t=this.weight;const n=this._weightInterpolant;if(n!==null){const i=n.evaluate(e)[0];t*=i,e>n.parameterPositions[1]&&(this.stopFading(),i===0&&(this.enabled=!1))}}return this._effectiveWeight=t,t}_updateTimeScale(e){let t=0;if(!this.paused){t=this.timeScale;const n=this._timeScaleInterpolant;if(n!==null){const i=n.evaluate(e)[0];t*=i,e>n.parameterPositions[1]&&(this.stopWarping(),t===0?this.paused=!0:this.timeScale=t)}}return this._effectiveTimeScale=t,t}_updateTime(e){const t=this._clip.duration,n=this.loop;let i=this.time+e,r=this._loopCount;const o=n===Rd;if(e===0)return r===-1?i:o&&(r&1)===1?t-i:i;if(n===wd){r===-1&&(this._loopCount=0,this._setEndings(!0,!0,!1));e:{if(i>=t)i=t;else if(i<0)i=0;else{this.time=i;break e}this.clampWhenFinished?this.paused=!0:this.enabled=!1,this.time=i,this._mixer.dispatchEvent({type:"finished",action:this,direction:e<0?-1:1})}}else{if(r===-1&&(e>=0?(r=0,this._setEndings(!0,this.repetitions===0,o)):this._setEndings(this.repetitions===0,!0,o)),i>=t||i<0){const a=Math.floor(i/t);i-=t*a,r+=Math.abs(a);const l=this.repetitions-r;if(l<=0)this.clampWhenFinished?this.paused=!0:this.enabled=!1,i=e>0?t:0,this.time=i,this._mixer.dispatchEvent({type:"finished",action:this,direction:e>0?1:-1});else{if(l===1){const c=e<0;this._setEndings(c,!c,o)}else this._setEndings(!1,!1,o);this._loopCount=r,this.time=i,this._mixer.dispatchEvent({type:"loop",action:this,loopDelta:a})}}else this.time=i;if(o&&(r&1)===1)return t-i}return i}_setEndings(e,t,n){const i=this._interpolantSettings;n?(i.endingStart=ys,i.endingEnd=ys):(e?i.endingStart=this.zeroSlopeAtStart?ys:Ms:i.endingStart=ho,t?i.endingEnd=this.zeroSlopeAtEnd?ys:Ms:i.endingEnd=ho)}_scheduleFading(e,t,n){const i=this._mixer,r=i.time;let o=this._weightInterpolant;o===null&&(o=i._lendControlInterpolant(),this._weightInterpolant=o);const a=o.parameterPositions,l=o.sampleValues;return a[0]=r,l[0]=t,a[1]=r+e,l[1]=n,this}}const Up=new Float32Array(1);class Fp extends ts{constructor(e){super(),this._root=e,this._initMemoryManager(),this._accuIndex=0,this.time=0,this.timeScale=1}_bindAction(e,t){const n=e._localRoot||this._root,i=e._clip.tracks,r=i.length,o=e._propertyBindings,a=e._interpolants,l=n.uuid,c=this._bindingsByRootAndName;let h=c[l];h===void 0&&(h={},c[l]=h);for(let u=0;u!==r;++u){const d=i[u],f=d.name;let g=h[f];if(g!==void 0)++g.referenceCount,o[u]=g;else{if(g=o[u],g!==void 0){g._cacheIndex===null&&(++g.referenceCount,this._addInactiveBinding(g,l,f));continue}const x=t&&t._propertyBindings[u].binding.parsedPath;g=new Ep(ut.create(n,f,x),d.ValueTypeName,d.getValueSize()),++g.referenceCount,this._addInactiveBinding(g,l,f),o[u]=g}a[u].resultBuffer=g.buffer}}_activateAction(e){if(!this._isActiveAction(e)){if(e._cacheIndex===null){const n=(e._localRoot||this._root).uuid,i=e._clip.uuid,r=this._actionsByClip[i];this._bindAction(e,r&&r.knownActions[0]),this._addInactiveAction(e,i,n)}const t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){const r=t[n];r.useCount++===0&&(this._lendBinding(r),r.saveOriginalState())}this._lendAction(e)}}_deactivateAction(e){if(this._isActiveAction(e)){const t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){const r=t[n];--r.useCount===0&&(r.restoreOriginalState(),this._takeBackBinding(r))}this._takeBackAction(e)}}_initMemoryManager(){this._actions=[],this._nActiveActions=0,this._actionsByClip={},this._bindings=[],this._nActiveBindings=0,this._bindingsByRootAndName={},this._controlInterpolants=[],this._nActiveControlInterpolants=0;const e=this;this.stats={actions:{get total(){return e._actions.length},get inUse(){return e._nActiveActions}},bindings:{get total(){return e._bindings.length},get inUse(){return e._nActiveBindings}},controlInterpolants:{get total(){return e._controlInterpolants.length},get inUse(){return e._nActiveControlInterpolants}}}}_isActiveAction(e){const t=e._cacheIndex;return t!==null&&t<this._nActiveActions}_addInactiveAction(e,t,n){const i=this._actions,r=this._actionsByClip;let o=r[t];if(o===void 0)o={knownActions:[e],actionByRoot:{}},e._byClipCacheIndex=0,r[t]=o;else{const a=o.knownActions;e._byClipCacheIndex=a.length,a.push(e)}e._cacheIndex=i.length,i.push(e),o.actionByRoot[n]=e}_removeInactiveAction(e){const t=this._actions,n=t[t.length-1],i=e._cacheIndex;n._cacheIndex=i,t[i]=n,t.pop(),e._cacheIndex=null;const r=e._clip.uuid,o=this._actionsByClip,a=o[r],l=a.knownActions,c=l[l.length-1],h=e._byClipCacheIndex;c._byClipCacheIndex=h,l[h]=c,l.pop(),e._byClipCacheIndex=null;const u=a.actionByRoot,d=(e._localRoot||this._root).uuid;delete u[d],l.length===0&&delete o[r],this._removeInactiveBindingsForAction(e)}_removeInactiveBindingsForAction(e){const t=e._propertyBindings;for(let n=0,i=t.length;n!==i;++n){const r=t[n];--r.referenceCount===0&&this._removeInactiveBinding(r)}}_lendAction(e){const t=this._actions,n=e._cacheIndex,i=this._nActiveActions++,r=t[i];e._cacheIndex=i,t[i]=e,r._cacheIndex=n,t[n]=r}_takeBackAction(e){const t=this._actions,n=e._cacheIndex,i=--this._nActiveActions,r=t[i];e._cacheIndex=i,t[i]=e,r._cacheIndex=n,t[n]=r}_addInactiveBinding(e,t,n){const i=this._bindingsByRootAndName,r=this._bindings;let o=i[t];o===void 0&&(o={},i[t]=o),o[n]=e,e._cacheIndex=r.length,r.push(e)}_removeInactiveBinding(e){const t=this._bindings,n=e.binding,i=n.rootNode.uuid,r=n.path,o=this._bindingsByRootAndName,a=o[i],l=t[t.length-1],c=e._cacheIndex;l._cacheIndex=c,t[c]=l,t.pop(),delete a[r],Object.keys(a).length===0&&delete o[i]}_lendBinding(e){const t=this._bindings,n=e._cacheIndex,i=this._nActiveBindings++,r=t[i];e._cacheIndex=i,t[i]=e,r._cacheIndex=n,t[n]=r}_takeBackBinding(e){const t=this._bindings,n=e._cacheIndex,i=--this._nActiveBindings,r=t[i];e._cacheIndex=i,t[i]=e,r._cacheIndex=n,t[n]=r}_lendControlInterpolant(){const e=this._controlInterpolants,t=this._nActiveControlInterpolants++;let n=e[t];return n===void 0&&(n=new mu(new Float32Array(2),new Float32Array(2),1,Up),n.__cacheIndex=t,e[t]=n),n}_takeBackControlInterpolant(e){const t=this._controlInterpolants,n=e.__cacheIndex,i=--this._nActiveControlInterpolants,r=t[i];e.__cacheIndex=i,t[i]=e,r.__cacheIndex=n,t[n]=r}clipAction(e,t,n){const i=t||this._root,r=i.uuid;let o=typeof e=="string"?dc.findByName(i,e):e;const a=o!==null?o.uuid:e,l=this._actionsByClip[a];let c=null;if(n===void 0&&(o!==null?n=o.blendMode:n=Lc),l!==void 0){const u=l.actionByRoot[r];if(u!==void 0&&u.blendMode===n)return u;c=l.knownActions[0],o===null&&(o=c._clip)}if(o===null)return null;const h=new Np(this,o,t,n);return this._bindAction(h,c),this._addInactiveAction(h,a,r),h}existingAction(e,t){const n=t||this._root,i=n.uuid,r=typeof e=="string"?dc.findByName(n,e):e,o=r?r.uuid:e,a=this._actionsByClip[o];return a!==void 0&&a.actionByRoot[i]||null}stopAllAction(){const e=this._actions,t=this._nActiveActions;for(let n=t-1;n>=0;--n)e[n].stop();return this}update(e){e*=this.timeScale;const t=this._actions,n=this._nActiveActions,i=this.time+=e,r=Math.sign(e),o=this._accuIndex^=1;for(let c=0;c!==n;++c)t[c]._update(i,e,r,o);const a=this._bindings,l=this._nActiveBindings;for(let c=0;c!==l;++c)a[c].apply(o);return this}setTime(e){this.time=0;for(let t=0;t<this._actions.length;t++)this._actions[t].time=0;return this.update(e)}getRoot(){return this._root}uncacheClip(e){const t=this._actions,n=e.uuid,i=this._actionsByClip,r=i[n];if(r!==void 0){const o=r.knownActions;for(let a=0,l=o.length;a!==l;++a){const c=o[a];this._deactivateAction(c);const h=c._cacheIndex,u=t[t.length-1];c._cacheIndex=null,c._byClipCacheIndex=null,u._cacheIndex=h,t[h]=u,t.pop(),this._removeInactiveBindingsForAction(c)}delete i[n]}}uncacheRoot(e){const t=e.uuid,n=this._actionsByClip;for(const o in n){const a=n[o].actionByRoot,l=a[t];l!==void 0&&(this._deactivateAction(l),this._removeInactiveAction(l))}const i=this._bindingsByRootAndName,r=i[t];if(r!==void 0)for(const o in r){const a=r[o];a.restoreOriginalState(),this._removeInactiveBinding(a)}}uncacheAction(e,t){const n=this.existingAction(e,t);n!==null&&(this._deactivateAction(n),this._removeInactiveAction(n))}}function ql(s,e,t,n){const i=Op(n);switch(t){case Wh:return s*e;case Rc:return s*e/i.components*i.byteLength;case Cc:return s*e/i.components*i.byteLength;case qh:return s*e*2/i.components*i.byteLength;case Ic:return s*e*2/i.components*i.byteLength;case Xh:return s*e*3/i.components*i.byteLength;case En:return s*e*4/i.components*i.byteLength;case Pc:return s*e*4/i.components*i.byteLength;case to:case no:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*8;case io:case so:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case Ua:case Oa:return Math.max(s,16)*Math.max(e,8)/4;case Na:case Fa:return Math.max(s,8)*Math.max(e,8)/2;case za:case Ba:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*8;case ka:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case Ha:return Math.floor((s+3)/4)*Math.floor((e+3)/4)*16;case Va:return Math.floor((s+4)/5)*Math.floor((e+3)/4)*16;case Ga:return Math.floor((s+4)/5)*Math.floor((e+4)/5)*16;case Wa:return Math.floor((s+5)/6)*Math.floor((e+4)/5)*16;case Xa:return Math.floor((s+5)/6)*Math.floor((e+5)/6)*16;case qa:return Math.floor((s+7)/8)*Math.floor((e+4)/5)*16;case Ya:return Math.floor((s+7)/8)*Math.floor((e+5)/6)*16;case ja:return Math.floor((s+7)/8)*Math.floor((e+7)/8)*16;case Ka:return Math.floor((s+9)/10)*Math.floor((e+4)/5)*16;case Ja:return Math.floor((s+9)/10)*Math.floor((e+5)/6)*16;case Za:return Math.floor((s+9)/10)*Math.floor((e+7)/8)*16;case $a:return Math.floor((s+9)/10)*Math.floor((e+9)/10)*16;case Qa:return Math.floor((s+11)/12)*Math.floor((e+9)/10)*16;case ec:return Math.floor((s+11)/12)*Math.floor((e+11)/12)*16;case tc:case nc:case ic:return Math.ceil(s/4)*Math.ceil(e/4)*16;case sc:case rc:return Math.ceil(s/4)*Math.ceil(e/4)*8;case oc:case ac:return Math.ceil(s/4)*Math.ceil(e/4)*16}throw new Error(`Unable to determine texture byte length for ${t} format.`)}function Op(s){switch(s){case Gn:case kh:return{byteLength:1,components:1};case ar:case Hh:case _r:return{byteLength:2,components:1};case wc:case Ac:return{byteLength:2,components:4};case $i:case Tc:case Pn:return{byteLength:4,components:1};case Vh:case Gh:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${s}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:Ec}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__=Ec);/**
 * @license
 * Copyright 2010-2025 Three.js Authors
 * SPDX-License-Identifier: MIT
 */function vu(){let s=null,e=!1,t=null,n=null;function i(r,o){t(r,o),n=s.requestAnimationFrame(i)}return{start:function(){e!==!0&&t!==null&&(n=s.requestAnimationFrame(i),e=!0)},stop:function(){s.cancelAnimationFrame(n),e=!1},setAnimationLoop:function(r){t=r},setContext:function(r){s=r}}}function zp(s){const e=new WeakMap;function t(a,l){const c=a.array,h=a.usage,u=c.byteLength,d=s.createBuffer();s.bindBuffer(l,d),s.bufferData(l,c,h),a.onUploadCallback();let f;if(c instanceof Float32Array)f=s.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)f=s.HALF_FLOAT;else if(c instanceof Uint16Array)a.isFloat16BufferAttribute?f=s.HALF_FLOAT:f=s.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=s.SHORT;else if(c instanceof Uint32Array)f=s.UNSIGNED_INT;else if(c instanceof Int32Array)f=s.INT;else if(c instanceof Int8Array)f=s.BYTE;else if(c instanceof Uint8Array)f=s.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=s.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:d,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:a.version,size:u}}function n(a,l,c){const h=l.array,u=l.updateRanges;if(s.bindBuffer(c,a),u.length===0)s.bufferSubData(c,0,h);else{u.sort((f,g)=>f.start-g.start);let d=0;for(let f=1;f<u.length;f++){const g=u[d],x=u[f];x.start<=g.start+g.count+1?g.count=Math.max(g.count,x.start+x.count-g.start):(++d,u[d]=x)}u.length=d+1;for(let f=0,g=u.length;f<g;f++){const x=u[f];s.bufferSubData(c,x.start*h.BYTES_PER_ELEMENT,h,x.start,x.count)}l.clearUpdateRanges()}l.onUploadCallback()}function i(a){return a.isInterleavedBufferAttribute&&(a=a.data),e.get(a)}function r(a){a.isInterleavedBufferAttribute&&(a=a.data);const l=e.get(a);l&&(s.deleteBuffer(l.buffer),e.delete(a))}function o(a,l){if(a.isInterleavedBufferAttribute&&(a=a.data),a.isGLBufferAttribute){const h=e.get(a);(!h||h.version<a.version)&&e.set(a,{buffer:a.buffer,type:a.type,bytesPerElement:a.elementSize,version:a.version});return}const c=e.get(a);if(c===void 0)e.set(a,t(a,l));else if(c.version<a.version){if(c.size!==a.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,a,l),c.version=a.version}}return{get:i,remove:r,update:o}}var Bp=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,kp=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,Hp=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,Vp=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Gp=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,Wp=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,Xp=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,qp=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,Yp=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,jp=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,Kp=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,Jp=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,Zp=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,$p=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,Qp=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,em=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,tm=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,nm=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,im=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,sm=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,rm=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,om=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,am=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,cm=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,lm=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,hm=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,um=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,dm=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,fm=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,pm=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,mm="gl_FragColor = linearToOutputTexel( gl_FragColor );",gm=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,_m=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,xm=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,vm=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Mm=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,ym=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,bm=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Sm=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Em=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,Tm=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,wm=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Am=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Rm=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Cm=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Im=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,Pm=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,Lm=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,Dm=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Nm=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Um=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Fm=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Om=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,zm=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Bm=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,km=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,Hm=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,Vm=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Gm=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,Wm=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,Xm=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,qm=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,Ym=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,jm=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,Km=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,Jm=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,Zm=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,$m=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,Qm=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,e0=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,t0=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,n0=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,i0=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,s0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,r0=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,o0=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,a0=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,c0=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,l0=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,h0=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,u0=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,d0=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,f0=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,p0=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,m0=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,g0=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,_0=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,x0=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,v0=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,M0=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		float depth = unpackRGBAToDepth( texture2D( depths, uv ) );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			return step( depth, compare );
		#else
			return step( compare, depth );
		#endif
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow( sampler2D shadow, vec2 uv, float compare ) {
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			float hard_shadow = step( distribution.x, compare );
		#else
			float hard_shadow = step( compare, distribution.x );
		#endif
		if ( hard_shadow != 1.0 ) {
			float distance = compare - distribution.x;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,y0=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,b0=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,S0=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,E0=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,T0=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,w0=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,A0=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,R0=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,C0=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,I0=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,P0=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,L0=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,D0=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,N0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,U0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,F0=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,O0=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`;const z0=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,B0=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,k0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,H0=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,V0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,G0=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,W0=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,X0=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,q0=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,Y0=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,j0=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,K0=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,J0=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Z0=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,$0=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,Q0=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,eg=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,tg=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,ng=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,ig=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,sg=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,rg=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,og=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,ag=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,cg=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,lg=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,hg=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,ug=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,dg=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,fg=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,pg=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,mg=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,gg=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,_g=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Qe={alphahash_fragment:Bp,alphahash_pars_fragment:kp,alphamap_fragment:Hp,alphamap_pars_fragment:Vp,alphatest_fragment:Gp,alphatest_pars_fragment:Wp,aomap_fragment:Xp,aomap_pars_fragment:qp,batching_pars_vertex:Yp,batching_vertex:jp,begin_vertex:Kp,beginnormal_vertex:Jp,bsdfs:Zp,iridescence_fragment:$p,bumpmap_pars_fragment:Qp,clipping_planes_fragment:em,clipping_planes_pars_fragment:tm,clipping_planes_pars_vertex:nm,clipping_planes_vertex:im,color_fragment:sm,color_pars_fragment:rm,color_pars_vertex:om,color_vertex:am,common:cm,cube_uv_reflection_fragment:lm,defaultnormal_vertex:hm,displacementmap_pars_vertex:um,displacementmap_vertex:dm,emissivemap_fragment:fm,emissivemap_pars_fragment:pm,colorspace_fragment:mm,colorspace_pars_fragment:gm,envmap_fragment:_m,envmap_common_pars_fragment:xm,envmap_pars_fragment:vm,envmap_pars_vertex:Mm,envmap_physical_pars_fragment:Pm,envmap_vertex:ym,fog_vertex:bm,fog_pars_vertex:Sm,fog_fragment:Em,fog_pars_fragment:Tm,gradientmap_pars_fragment:wm,lightmap_pars_fragment:Am,lights_lambert_fragment:Rm,lights_lambert_pars_fragment:Cm,lights_pars_begin:Im,lights_toon_fragment:Lm,lights_toon_pars_fragment:Dm,lights_phong_fragment:Nm,lights_phong_pars_fragment:Um,lights_physical_fragment:Fm,lights_physical_pars_fragment:Om,lights_fragment_begin:zm,lights_fragment_maps:Bm,lights_fragment_end:km,logdepthbuf_fragment:Hm,logdepthbuf_pars_fragment:Vm,logdepthbuf_pars_vertex:Gm,logdepthbuf_vertex:Wm,map_fragment:Xm,map_pars_fragment:qm,map_particle_fragment:Ym,map_particle_pars_fragment:jm,metalnessmap_fragment:Km,metalnessmap_pars_fragment:Jm,morphinstance_vertex:Zm,morphcolor_vertex:$m,morphnormal_vertex:Qm,morphtarget_pars_vertex:e0,morphtarget_vertex:t0,normal_fragment_begin:n0,normal_fragment_maps:i0,normal_pars_fragment:s0,normal_pars_vertex:r0,normal_vertex:o0,normalmap_pars_fragment:a0,clearcoat_normal_fragment_begin:c0,clearcoat_normal_fragment_maps:l0,clearcoat_pars_fragment:h0,iridescence_pars_fragment:u0,opaque_fragment:d0,packing:f0,premultiplied_alpha_fragment:p0,project_vertex:m0,dithering_fragment:g0,dithering_pars_fragment:_0,roughnessmap_fragment:x0,roughnessmap_pars_fragment:v0,shadowmap_pars_fragment:M0,shadowmap_pars_vertex:y0,shadowmap_vertex:b0,shadowmask_pars_fragment:S0,skinbase_vertex:E0,skinning_pars_vertex:T0,skinning_vertex:w0,skinnormal_vertex:A0,specularmap_fragment:R0,specularmap_pars_fragment:C0,tonemapping_fragment:I0,tonemapping_pars_fragment:P0,transmission_fragment:L0,transmission_pars_fragment:D0,uv_pars_fragment:N0,uv_pars_vertex:U0,uv_vertex:F0,worldpos_vertex:O0,background_vert:z0,background_frag:B0,backgroundCube_vert:k0,backgroundCube_frag:H0,cube_vert:V0,cube_frag:G0,depth_vert:W0,depth_frag:X0,distanceRGBA_vert:q0,distanceRGBA_frag:Y0,equirect_vert:j0,equirect_frag:K0,linedashed_vert:J0,linedashed_frag:Z0,meshbasic_vert:$0,meshbasic_frag:Q0,meshlambert_vert:eg,meshlambert_frag:tg,meshmatcap_vert:ng,meshmatcap_frag:ig,meshnormal_vert:sg,meshnormal_frag:rg,meshphong_vert:og,meshphong_frag:ag,meshphysical_vert:cg,meshphysical_frag:lg,meshtoon_vert:hg,meshtoon_frag:ug,points_vert:dg,points_frag:fg,shadow_vert:pg,shadow_frag:mg,sprite_vert:gg,sprite_frag:_g},Ae={common:{diffuse:{value:new Ye(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new $e},alphaMap:{value:null},alphaMapTransform:{value:new $e},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new $e}},envmap:{envMap:{value:null},envMapRotation:{value:new $e},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new $e}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new $e}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new $e},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new $e},normalScale:{value:new Oe(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new $e},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new $e}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new $e}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new $e}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new Ye(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new Ye(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new $e},alphaTest:{value:0},uvTransform:{value:new $e}},sprite:{diffuse:{value:new Ye(16777215)},opacity:{value:1},center:{value:new Oe(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new $e},alphaMap:{value:null},alphaMapTransform:{value:new $e},alphaTest:{value:0}}},Bn={basic:{uniforms:Jt([Ae.common,Ae.specularmap,Ae.envmap,Ae.aomap,Ae.lightmap,Ae.fog]),vertexShader:Qe.meshbasic_vert,fragmentShader:Qe.meshbasic_frag},lambert:{uniforms:Jt([Ae.common,Ae.specularmap,Ae.envmap,Ae.aomap,Ae.lightmap,Ae.emissivemap,Ae.bumpmap,Ae.normalmap,Ae.displacementmap,Ae.fog,Ae.lights,{emissive:{value:new Ye(0)}}]),vertexShader:Qe.meshlambert_vert,fragmentShader:Qe.meshlambert_frag},phong:{uniforms:Jt([Ae.common,Ae.specularmap,Ae.envmap,Ae.aomap,Ae.lightmap,Ae.emissivemap,Ae.bumpmap,Ae.normalmap,Ae.displacementmap,Ae.fog,Ae.lights,{emissive:{value:new Ye(0)},specular:{value:new Ye(1118481)},shininess:{value:30}}]),vertexShader:Qe.meshphong_vert,fragmentShader:Qe.meshphong_frag},standard:{uniforms:Jt([Ae.common,Ae.envmap,Ae.aomap,Ae.lightmap,Ae.emissivemap,Ae.bumpmap,Ae.normalmap,Ae.displacementmap,Ae.roughnessmap,Ae.metalnessmap,Ae.fog,Ae.lights,{emissive:{value:new Ye(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Qe.meshphysical_vert,fragmentShader:Qe.meshphysical_frag},toon:{uniforms:Jt([Ae.common,Ae.aomap,Ae.lightmap,Ae.emissivemap,Ae.bumpmap,Ae.normalmap,Ae.displacementmap,Ae.gradientmap,Ae.fog,Ae.lights,{emissive:{value:new Ye(0)}}]),vertexShader:Qe.meshtoon_vert,fragmentShader:Qe.meshtoon_frag},matcap:{uniforms:Jt([Ae.common,Ae.bumpmap,Ae.normalmap,Ae.displacementmap,Ae.fog,{matcap:{value:null}}]),vertexShader:Qe.meshmatcap_vert,fragmentShader:Qe.meshmatcap_frag},points:{uniforms:Jt([Ae.points,Ae.fog]),vertexShader:Qe.points_vert,fragmentShader:Qe.points_frag},dashed:{uniforms:Jt([Ae.common,Ae.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Qe.linedashed_vert,fragmentShader:Qe.linedashed_frag},depth:{uniforms:Jt([Ae.common,Ae.displacementmap]),vertexShader:Qe.depth_vert,fragmentShader:Qe.depth_frag},normal:{uniforms:Jt([Ae.common,Ae.bumpmap,Ae.normalmap,Ae.displacementmap,{opacity:{value:1}}]),vertexShader:Qe.meshnormal_vert,fragmentShader:Qe.meshnormal_frag},sprite:{uniforms:Jt([Ae.sprite,Ae.fog]),vertexShader:Qe.sprite_vert,fragmentShader:Qe.sprite_frag},background:{uniforms:{uvTransform:{value:new $e},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Qe.background_vert,fragmentShader:Qe.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new $e}},vertexShader:Qe.backgroundCube_vert,fragmentShader:Qe.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Qe.cube_vert,fragmentShader:Qe.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Qe.equirect_vert,fragmentShader:Qe.equirect_frag},distanceRGBA:{uniforms:Jt([Ae.common,Ae.displacementmap,{referencePosition:{value:new P},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Qe.distanceRGBA_vert,fragmentShader:Qe.distanceRGBA_frag},shadow:{uniforms:Jt([Ae.lights,Ae.fog,{color:{value:new Ye(0)},opacity:{value:1}}]),vertexShader:Qe.shadow_vert,fragmentShader:Qe.shadow_frag}};Bn.physical={uniforms:Jt([Bn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new $e},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new $e},clearcoatNormalScale:{value:new Oe(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new $e},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new $e},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new $e},sheen:{value:0},sheenColor:{value:new Ye(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new $e},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new $e},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new $e},transmissionSamplerSize:{value:new Oe},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new $e},attenuationDistance:{value:0},attenuationColor:{value:new Ye(0)},specularColor:{value:new Ye(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new $e},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new $e},anisotropyVector:{value:new Oe},anisotropyMap:{value:null},anisotropyMapTransform:{value:new $e}}]),vertexShader:Qe.meshphysical_vert,fragmentShader:Qe.meshphysical_frag};const Yr={r:0,b:0,g:0},Vi=new Wn,xg=new Ze;function vg(s,e,t,n,i,r,o){const a=new Ye(0);let l=r===!0?0:1,c,h,u=null,d=0,f=null;function g(y){let v=y.isScene===!0?y.background:null;return v&&v.isTexture&&(v=(y.backgroundBlurriness>0?t:e).get(v)),v}function x(y){let v=!1;const w=g(y);w===null?p(a,l):w&&w.isColor&&(p(w,1),v=!0);const S=s.xr.getEnvironmentBlendMode();S==="additive"?n.buffers.color.setClear(0,0,0,1,o):S==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,o),(s.autoClear||v)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),s.clear(s.autoClearColor,s.autoClearDepth,s.autoClearStencil))}function m(y,v){const w=g(v);w&&(w.isCubeTexture||w.mapping===Mo)?(h===void 0&&(h=new Fe(new sn(1,1,1),new Ni({name:"BackgroundCubeMaterial",uniforms:Is(Bn.backgroundCube.uniforms),vertexShader:Bn.backgroundCube.vertexShader,fragmentShader:Bn.backgroundCube.fragmentShader,side:tn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),h.geometry.deleteAttribute("normal"),h.geometry.deleteAttribute("uv"),h.onBeforeRender=function(S,R,I){this.matrixWorld.copyPosition(I.matrixWorld)},Object.defineProperty(h.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),i.update(h)),Vi.copy(v.backgroundRotation),Vi.x*=-1,Vi.y*=-1,Vi.z*=-1,w.isCubeTexture&&w.isRenderTargetTexture===!1&&(Vi.y*=-1,Vi.z*=-1),h.material.uniforms.envMap.value=w,h.material.uniforms.flipEnvMap.value=w.isCubeTexture&&w.isRenderTargetTexture===!1?-1:1,h.material.uniforms.backgroundBlurriness.value=v.backgroundBlurriness,h.material.uniforms.backgroundIntensity.value=v.backgroundIntensity,h.material.uniforms.backgroundRotation.value.setFromMatrix4(xg.makeRotationFromEuler(Vi)),h.material.toneMapped=ot.getTransfer(w.colorSpace)!==_t,(u!==w||d!==w.version||f!==s.toneMapping)&&(h.material.needsUpdate=!0,u=w,d=w.version,f=s.toneMapping),h.layers.enableAll(),y.unshift(h,h.geometry,h.material,0,0,null)):w&&w.isTexture&&(c===void 0&&(c=new Fe(new es(2,2),new Ni({name:"BackgroundMaterial",uniforms:Is(Bn.background.uniforms),vertexShader:Bn.background.vertexShader,fragmentShader:Bn.background.fragmentShader,side:ui,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),i.update(c)),c.material.uniforms.t2D.value=w,c.material.uniforms.backgroundIntensity.value=v.backgroundIntensity,c.material.toneMapped=ot.getTransfer(w.colorSpace)!==_t,w.matrixAutoUpdate===!0&&w.updateMatrix(),c.material.uniforms.uvTransform.value.copy(w.matrix),(u!==w||d!==w.version||f!==s.toneMapping)&&(c.material.needsUpdate=!0,u=w,d=w.version,f=s.toneMapping),c.layers.enableAll(),y.unshift(c,c.geometry,c.material,0,0,null))}function p(y,v){y.getRGB(Yr,nu(s)),n.buffers.color.setClear(Yr.r,Yr.g,Yr.b,v,o)}function M(){h!==void 0&&(h.geometry.dispose(),h.material.dispose(),h=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return a},setClearColor:function(y,v=1){a.set(y),l=v,p(a,l)},getClearAlpha:function(){return l},setClearAlpha:function(y){l=y,p(a,l)},render:x,addToRenderList:m,dispose:M}}function Mg(s,e){const t=s.getParameter(s.MAX_VERTEX_ATTRIBS),n={},i=d(null);let r=i,o=!1;function a(b,U,V,F,O){let W=!1;const J=u(F,V,U);r!==J&&(r=J,c(r.object)),W=f(b,F,V,O),W&&g(b,F,V,O),O!==null&&e.update(O,s.ELEMENT_ARRAY_BUFFER),(W||o)&&(o=!1,v(b,U,V,F),O!==null&&s.bindBuffer(s.ELEMENT_ARRAY_BUFFER,e.get(O).buffer))}function l(){return s.createVertexArray()}function c(b){return s.bindVertexArray(b)}function h(b){return s.deleteVertexArray(b)}function u(b,U,V){const F=V.wireframe===!0;let O=n[b.id];O===void 0&&(O={},n[b.id]=O);let W=O[U.id];W===void 0&&(W={},O[U.id]=W);let J=W[F];return J===void 0&&(J=d(l()),W[F]=J),J}function d(b){const U=[],V=[],F=[];for(let O=0;O<t;O++)U[O]=0,V[O]=0,F[O]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:U,enabledAttributes:V,attributeDivisors:F,object:b,attributes:{},index:null}}function f(b,U,V,F){const O=r.attributes,W=U.attributes;let J=0;const H=V.getAttributes();for(const z in H)if(H[z].location>=0){const le=O[z];let re=W[z];if(re===void 0&&(z==="instanceMatrix"&&b.instanceMatrix&&(re=b.instanceMatrix),z==="instanceColor"&&b.instanceColor&&(re=b.instanceColor)),le===void 0||le.attribute!==re||re&&le.data!==re.data)return!0;J++}return r.attributesNum!==J||r.index!==F}function g(b,U,V,F){const O={},W=U.attributes;let J=0;const H=V.getAttributes();for(const z in H)if(H[z].location>=0){let le=W[z];le===void 0&&(z==="instanceMatrix"&&b.instanceMatrix&&(le=b.instanceMatrix),z==="instanceColor"&&b.instanceColor&&(le=b.instanceColor));const re={};re.attribute=le,le&&le.data&&(re.data=le.data),O[z]=re,J++}r.attributes=O,r.attributesNum=J,r.index=F}function x(){const b=r.newAttributes;for(let U=0,V=b.length;U<V;U++)b[U]=0}function m(b){p(b,0)}function p(b,U){const V=r.newAttributes,F=r.enabledAttributes,O=r.attributeDivisors;V[b]=1,F[b]===0&&(s.enableVertexAttribArray(b),F[b]=1),O[b]!==U&&(s.vertexAttribDivisor(b,U),O[b]=U)}function M(){const b=r.newAttributes,U=r.enabledAttributes;for(let V=0,F=U.length;V<F;V++)U[V]!==b[V]&&(s.disableVertexAttribArray(V),U[V]=0)}function y(b,U,V,F,O,W,J){J===!0?s.vertexAttribIPointer(b,U,V,O,W):s.vertexAttribPointer(b,U,V,F,O,W)}function v(b,U,V,F){x();const O=F.attributes,W=V.getAttributes(),J=U.defaultAttributeValues;for(const H in W){const z=W[H];if(z.location>=0){let Z=O[H];if(Z===void 0&&(H==="instanceMatrix"&&b.instanceMatrix&&(Z=b.instanceMatrix),H==="instanceColor"&&b.instanceColor&&(Z=b.instanceColor)),Z!==void 0){const le=Z.normalized,re=Z.itemSize,_e=e.get(Z);if(_e===void 0)continue;const me=_e.buffer,ze=_e.type,ke=_e.bytesPerElement,te=ze===s.INT||ze===s.UNSIGNED_INT||Z.gpuType===Tc;if(Z.isInterleavedBufferAttribute){const ae=Z.data,ye=ae.stride,Ie=Z.offset;if(ae.isInstancedInterleavedBuffer){for(let A=0;A<z.locationSize;A++)p(z.location+A,ae.meshPerAttribute);b.isInstancedMesh!==!0&&F._maxInstanceCount===void 0&&(F._maxInstanceCount=ae.meshPerAttribute*ae.count)}else for(let A=0;A<z.locationSize;A++)m(z.location+A);s.bindBuffer(s.ARRAY_BUFFER,me);for(let A=0;A<z.locationSize;A++)y(z.location+A,re/z.locationSize,ze,le,ye*ke,(Ie+re/z.locationSize*A)*ke,te)}else{if(Z.isInstancedBufferAttribute){for(let ae=0;ae<z.locationSize;ae++)p(z.location+ae,Z.meshPerAttribute);b.isInstancedMesh!==!0&&F._maxInstanceCount===void 0&&(F._maxInstanceCount=Z.meshPerAttribute*Z.count)}else for(let ae=0;ae<z.locationSize;ae++)m(z.location+ae);s.bindBuffer(s.ARRAY_BUFFER,me);for(let ae=0;ae<z.locationSize;ae++)y(z.location+ae,re/z.locationSize,ze,le,re*ke,re/z.locationSize*ae*ke,te)}}else if(J!==void 0){const le=J[H];if(le!==void 0)switch(le.length){case 2:s.vertexAttrib2fv(z.location,le);break;case 3:s.vertexAttrib3fv(z.location,le);break;case 4:s.vertexAttrib4fv(z.location,le);break;default:s.vertexAttrib1fv(z.location,le)}}}}M()}function w(){I();for(const b in n){const U=n[b];for(const V in U){const F=U[V];for(const O in F)h(F[O].object),delete F[O];delete U[V]}delete n[b]}}function S(b){if(n[b.id]===void 0)return;const U=n[b.id];for(const V in U){const F=U[V];for(const O in F)h(F[O].object),delete F[O];delete U[V]}delete n[b.id]}function R(b){for(const U in n){const V=n[U];if(V[b.id]===void 0)continue;const F=V[b.id];for(const O in F)h(F[O].object),delete F[O];delete V[b.id]}}function I(){T(),o=!0,r!==i&&(r=i,c(r.object))}function T(){i.geometry=null,i.program=null,i.wireframe=!1}return{setup:a,reset:I,resetDefaultState:T,dispose:w,releaseStatesOfGeometry:S,releaseStatesOfProgram:R,initAttributes:x,enableAttribute:m,disableUnusedAttributes:M}}function yg(s,e,t){let n;function i(c){n=c}function r(c,h){s.drawArrays(n,c,h),t.update(h,n,1)}function o(c,h,u){u!==0&&(s.drawArraysInstanced(n,c,h,u),t.update(h,n,u))}function a(c,h,u){if(u===0)return;e.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,h,0,u);let f=0;for(let g=0;g<u;g++)f+=h[g];t.update(f,n,1)}function l(c,h,u,d){if(u===0)return;const f=e.get("WEBGL_multi_draw");if(f===null)for(let g=0;g<c.length;g++)o(c[g],h[g],d[g]);else{f.multiDrawArraysInstancedWEBGL(n,c,0,h,0,d,0,u);let g=0;for(let x=0;x<u;x++)g+=h[x]*d[x];t.update(g,n,1)}}this.setMode=i,this.render=r,this.renderInstances=o,this.renderMultiDraw=a,this.renderMultiDrawInstances=l}function bg(s,e,t,n){let i;function r(){if(i!==void 0)return i;if(e.has("EXT_texture_filter_anisotropic")===!0){const R=e.get("EXT_texture_filter_anisotropic");i=s.getParameter(R.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else i=0;return i}function o(R){return!(R!==En&&n.convert(R)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_FORMAT))}function a(R){const I=R===_r&&(e.has("EXT_color_buffer_half_float")||e.has("EXT_color_buffer_float"));return!(R!==Gn&&n.convert(R)!==s.getParameter(s.IMPLEMENTATION_COLOR_READ_TYPE)&&R!==Pn&&!I)}function l(R){if(R==="highp"){if(s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.HIGH_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.HIGH_FLOAT).precision>0)return"highp";R="mediump"}return R==="mediump"&&s.getShaderPrecisionFormat(s.VERTEX_SHADER,s.MEDIUM_FLOAT).precision>0&&s.getShaderPrecisionFormat(s.FRAGMENT_SHADER,s.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=t.precision!==void 0?t.precision:"highp";const h=l(c);h!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",h,"instead."),c=h);const u=t.logarithmicDepthBuffer===!0,d=t.reversedDepthBuffer===!0&&e.has("EXT_clip_control"),f=s.getParameter(s.MAX_TEXTURE_IMAGE_UNITS),g=s.getParameter(s.MAX_VERTEX_TEXTURE_IMAGE_UNITS),x=s.getParameter(s.MAX_TEXTURE_SIZE),m=s.getParameter(s.MAX_CUBE_MAP_TEXTURE_SIZE),p=s.getParameter(s.MAX_VERTEX_ATTRIBS),M=s.getParameter(s.MAX_VERTEX_UNIFORM_VECTORS),y=s.getParameter(s.MAX_VARYING_VECTORS),v=s.getParameter(s.MAX_FRAGMENT_UNIFORM_VECTORS),w=g>0,S=s.getParameter(s.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:o,textureTypeReadable:a,precision:c,logarithmicDepthBuffer:u,reversedDepthBuffer:d,maxTextures:f,maxVertexTextures:g,maxTextureSize:x,maxCubemapSize:m,maxAttributes:p,maxVertexUniforms:M,maxVaryings:y,maxFragmentUniforms:v,vertexTextures:w,maxSamples:S}}function Sg(s){const e=this;let t=null,n=0,i=!1,r=!1;const o=new Xi,a=new $e,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(u,d){const f=u.length!==0||d||n!==0||i;return i=d,n=u.length,f},this.beginShadows=function(){r=!0,h(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(u,d){t=h(u,d,0)},this.setState=function(u,d,f){const g=u.clippingPlanes,x=u.clipIntersection,m=u.clipShadows,p=s.get(u);if(!i||g===null||g.length===0||r&&!m)r?h(null):c();else{const M=r?0:n,y=M*4;let v=p.clippingState||null;l.value=v,v=h(g,d,y,f);for(let w=0;w!==y;++w)v[w]=t[w];p.clippingState=v,this.numIntersection=x?this.numPlanes:0,this.numPlanes+=M}};function c(){l.value!==t&&(l.value=t,l.needsUpdate=n>0),e.numPlanes=n,e.numIntersection=0}function h(u,d,f,g){const x=u!==null?u.length:0;let m=null;if(x!==0){if(m=l.value,g!==!0||m===null){const p=f+x*4,M=d.matrixWorldInverse;a.getNormalMatrix(M),(m===null||m.length<p)&&(m=new Float32Array(p));for(let y=0,v=f;y!==x;++y,v+=4)o.copy(u[y]).applyMatrix4(M,a),o.normal.toArray(m,v),m[v+3]=o.constant}l.value=m,l.needsUpdate=!0}return e.numPlanes=x,e.numIntersection=0,m}}function Eg(s){let e=new WeakMap;function t(o,a){return a===co?o.mapping=As:a===Da&&(o.mapping=Rs),o}function n(o){if(o&&o.isTexture){const a=o.mapping;if(a===co||a===Da)if(e.has(o)){const l=e.get(o).texture;return t(l,o.mapping)}else{const l=o.image;if(l&&l.height>0){const c=new Rf(l.height);return c.fromEquirectangularTexture(s,o),e.set(o,c),o.addEventListener("dispose",i),t(c.texture,o.mapping)}else return null}}return o}function i(o){const a=o.target;a.removeEventListener("dispose",i);const l=e.get(a);l!==void 0&&(e.delete(a),l.dispose())}function r(){e=new WeakMap}return{get:n,dispose:r}}const bs=4,Yl=[.125,.215,.35,.446,.526,.582],ji=20,ca=new Vc,jl=new Ye;let la=null,ha=0,ua=0,da=!1;const qi=(1+Math.sqrt(5))/2,vs=1/qi,Kl=[new P(-qi,vs,0),new P(qi,vs,0),new P(-vs,0,qi),new P(vs,0,qi),new P(0,qi,-vs),new P(0,qi,vs),new P(-1,1,-1),new P(1,1,-1),new P(-1,1,1),new P(1,1,1)],Tg=new P;class fc{constructor(e){this._renderer=e,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(e,t=0,n=.1,i=100,r={}){const{size:o=256,position:a=Tg}=r;la=this._renderer.getRenderTarget(),ha=this._renderer.getActiveCubeFace(),ua=this._renderer.getActiveMipmapLevel(),da=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(o);const l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(e,n,i,l,a),t>0&&this._blur(l,0,0,t),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(e,t=null){return this._fromTexture(e,t)}fromCubemap(e,t=null){return this._fromTexture(e,t)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=$l(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=Zl(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(e){this._lodMax=Math.floor(Math.log2(e)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let e=0;e<this._lodPlanes.length;e++)this._lodPlanes[e].dispose()}_cleanup(e){this._renderer.setRenderTarget(la,ha,ua),this._renderer.xr.enabled=da,e.scissorTest=!1,jr(e,0,0,e.width,e.height)}_fromTexture(e,t){e.mapping===As||e.mapping===Rs?this._setSize(e.image.length===0?16:e.image[0].width||e.image[0].image.width):this._setSize(e.image.width/4),la=this._renderer.getRenderTarget(),ha=this._renderer.getActiveCubeFace(),ua=this._renderer.getActiveMipmapLevel(),da=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;const n=t||this._allocateTargets();return this._textureToCubeUV(e,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){const e=3*Math.max(this._cubeSize,112),t=4*this._cubeSize,n={magFilter:pn,minFilter:pn,generateMipmaps:!1,type:_r,format:En,colorSpace:Qt,depthBuffer:!1},i=Jl(e,t,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==e||this._pingPongRenderTarget.height!==t){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Jl(e,t,n);const{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=wg(r)),this._blurMaterial=Ag(r,e,t)}return i}_compileMaterial(e){const t=new Fe(this._lodPlanes[0],e);this._renderer.compile(t,ca)}_sceneToCubeUV(e,t,n,i,r){const l=new Zt(90,1,t,n),c=[1,-1,1,1,1,1],h=[1,1,1,-1,-1,-1],u=this._renderer,d=u.autoClear,f=u.toneMapping;u.getClearColor(jl),u.toneMapping=Li,u.autoClear=!1,u.state.buffers.depth.getReversed()&&(u.setRenderTarget(i),u.clearDepth(),u.setRenderTarget(null));const x=new Xt({name:"PMREM.Background",side:tn,depthWrite:!1,depthTest:!1}),m=new Fe(new sn,x);let p=!1;const M=e.background;M?M.isColor&&(x.color.copy(M),e.background=null,p=!0):(x.color.copy(jl),p=!0);for(let y=0;y<6;y++){const v=y%3;v===0?(l.up.set(0,c[y],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+h[y],r.y,r.z)):v===1?(l.up.set(0,0,c[y]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+h[y],r.z)):(l.up.set(0,c[y],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+h[y]));const w=this._cubeSize;jr(i,v*w,y>2?w:0,w,w),u.setRenderTarget(i),p&&u.render(m,l),u.render(e,l)}m.geometry.dispose(),m.material.dispose(),u.toneMapping=f,u.autoClear=d,e.background=M}_textureToCubeUV(e,t){const n=this._renderer,i=e.mapping===As||e.mapping===Rs;i?(this._cubemapMaterial===null&&(this._cubemapMaterial=$l()),this._cubemapMaterial.uniforms.flipEnvMap.value=e.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=Zl());const r=i?this._cubemapMaterial:this._equirectMaterial,o=new Fe(this._lodPlanes[0],r),a=r.uniforms;a.envMap.value=e;const l=this._cubeSize;jr(t,0,0,3*l,2*l),n.setRenderTarget(t),n.render(o,ca)}_applyPMREM(e){const t=this._renderer,n=t.autoClear;t.autoClear=!1;const i=this._lodPlanes.length;for(let r=1;r<i;r++){const o=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),a=Kl[(i-r-1)%Kl.length];this._blur(e,r-1,r,o,a)}t.autoClear=n}_blur(e,t,n,i,r){const o=this._pingPongRenderTarget;this._halfBlur(e,o,t,n,i,"latitudinal",r),this._halfBlur(o,e,n,n,i,"longitudinal",r)}_halfBlur(e,t,n,i,r,o,a){const l=this._renderer,c=this._blurMaterial;o!=="latitudinal"&&o!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");const h=3,u=new Fe(this._lodPlanes[i],c),d=c.uniforms,f=this._sizeLods[n]-1,g=isFinite(r)?Math.PI/(2*f):2*Math.PI/(2*ji-1),x=r/g,m=isFinite(r)?1+Math.floor(h*x):ji;m>ji&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${ji}`);const p=[];let M=0;for(let R=0;R<ji;++R){const I=R/x,T=Math.exp(-I*I/2);p.push(T),R===0?M+=T:R<m&&(M+=2*T)}for(let R=0;R<p.length;R++)p[R]=p[R]/M;d.envMap.value=e.texture,d.samples.value=m,d.weights.value=p,d.latitudinal.value=o==="latitudinal",a&&(d.poleAxis.value=a);const{_lodMax:y}=this;d.dTheta.value=g,d.mipInt.value=y-n;const v=this._sizeLods[i],w=3*v*(i>y-bs?i-y+bs:0),S=4*(this._cubeSize-v);jr(t,w,S,3*v,2*v),l.setRenderTarget(t),l.render(u,ca)}}function wg(s){const e=[],t=[],n=[];let i=s;const r=s-bs+1+Yl.length;for(let o=0;o<r;o++){const a=Math.pow(2,i);t.push(a);let l=1/a;o>s-bs?l=Yl[o-s+bs-1]:o===0&&(l=0),n.push(l);const c=1/(a-2),h=-c,u=1+c,d=[h,h,u,h,u,u,h,h,u,u,h,u],f=6,g=6,x=3,m=2,p=1,M=new Float32Array(x*g*f),y=new Float32Array(m*g*f),v=new Float32Array(p*g*f);for(let S=0;S<f;S++){const R=S%3*2/3-1,I=S>2?0:-1,T=[R,I,0,R+2/3,I,0,R+2/3,I+1,0,R,I,0,R+2/3,I+1,0,R,I+1,0];M.set(T,x*g*S),y.set(d,m*g*S);const b=[S,S,S,S,S,S];v.set(b,p*g*S)}const w=new dt;w.setAttribute("position",new Yt(M,x)),w.setAttribute("uv",new Yt(y,m)),w.setAttribute("faceIndex",new Yt(v,p)),e.push(w),i>bs&&i--}return{lodPlanes:e,sizeLods:t,sigmas:n}}function Jl(s,e,t){const n=new Qi(s,e,t);return n.texture.mapping=Mo,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function jr(s,e,t,n,i){s.viewport.set(e,t,n,i),s.scissor.set(e,t,n,i)}function Ag(s,e,t){const n=new Float32Array(ji),i=new P(0,1,0);return new Ni({name:"SphericalGaussianBlur",defines:{n:ji,CUBEUV_TEXEL_WIDTH:1/e,CUBEUV_TEXEL_HEIGHT:1/t,CUBEUV_MAX_MIP:`${s}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:i}},vertexShader:Xc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Pi,depthTest:!1,depthWrite:!1})}function Zl(){return new Ni({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Xc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Pi,depthTest:!1,depthWrite:!1})}function $l(){return new Ni({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Xc(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Pi,depthTest:!1,depthWrite:!1})}function Xc(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function Rg(s){let e=new WeakMap,t=null;function n(a){if(a&&a.isTexture){const l=a.mapping,c=l===co||l===Da,h=l===As||l===Rs;if(c||h){let u=e.get(a);const d=u!==void 0?u.texture.pmremVersion:0;if(a.isRenderTargetTexture&&a.pmremVersion!==d)return t===null&&(t=new fc(s)),u=c?t.fromEquirectangular(a,u):t.fromCubemap(a,u),u.texture.pmremVersion=a.pmremVersion,e.set(a,u),u.texture;if(u!==void 0)return u.texture;{const f=a.image;return c&&f&&f.height>0||h&&f&&i(f)?(t===null&&(t=new fc(s)),u=c?t.fromEquirectangular(a):t.fromCubemap(a),u.texture.pmremVersion=a.pmremVersion,e.set(a,u),a.addEventListener("dispose",r),u.texture):null}}}return a}function i(a){let l=0;const c=6;for(let h=0;h<c;h++)a[h]!==void 0&&l++;return l===c}function r(a){const l=a.target;l.removeEventListener("dispose",r);const c=e.get(l);c!==void 0&&(e.delete(l),c.dispose())}function o(){e=new WeakMap,t!==null&&(t.dispose(),t=null)}return{get:n,dispose:o}}function Cg(s){const e={};function t(n){if(e[n]!==void 0)return e[n];let i;switch(n){case"WEBGL_depth_texture":i=s.getExtension("WEBGL_depth_texture")||s.getExtension("MOZ_WEBGL_depth_texture")||s.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":i=s.getExtension("EXT_texture_filter_anisotropic")||s.getExtension("MOZ_EXT_texture_filter_anisotropic")||s.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":i=s.getExtension("WEBGL_compressed_texture_s3tc")||s.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||s.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":i=s.getExtension("WEBGL_compressed_texture_pvrtc")||s.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:i=s.getExtension(n)}return e[n]=i,i}return{has:function(n){return t(n)!==null},init:function(){t("EXT_color_buffer_float"),t("WEBGL_clip_cull_distance"),t("OES_texture_float_linear"),t("EXT_color_buffer_half_float"),t("WEBGL_multisampled_render_to_texture"),t("WEBGL_render_shared_exponent")},get:function(n){const i=t(n);return i===null&&pr("THREE.WebGLRenderer: "+n+" extension not supported."),i}}}function Ig(s,e,t,n){const i={},r=new WeakMap;function o(u){const d=u.target;d.index!==null&&e.remove(d.index);for(const g in d.attributes)e.remove(d.attributes[g]);d.removeEventListener("dispose",o),delete i[d.id];const f=r.get(d);f&&(e.remove(f),r.delete(d)),n.releaseStatesOfGeometry(d),d.isInstancedBufferGeometry===!0&&delete d._maxInstanceCount,t.memory.geometries--}function a(u,d){return i[d.id]===!0||(d.addEventListener("dispose",o),i[d.id]=!0,t.memory.geometries++),d}function l(u){const d=u.attributes;for(const f in d)e.update(d[f],s.ARRAY_BUFFER)}function c(u){const d=[],f=u.index,g=u.attributes.position;let x=0;if(f!==null){const M=f.array;x=f.version;for(let y=0,v=M.length;y<v;y+=3){const w=M[y+0],S=M[y+1],R=M[y+2];d.push(w,S,S,R,R,w)}}else if(g!==void 0){const M=g.array;x=g.version;for(let y=0,v=M.length/3-1;y<v;y+=3){const w=y+0,S=y+1,R=y+2;d.push(w,S,S,R,R,w)}}else return;const m=new(Jh(d)?tu:eu)(d,1);m.version=x;const p=r.get(u);p&&e.remove(p),r.set(u,m)}function h(u){const d=r.get(u);if(d){const f=u.index;f!==null&&d.version<f.version&&c(u)}else c(u);return r.get(u)}return{get:a,update:l,getWireframeAttribute:h}}function Pg(s,e,t){let n;function i(d){n=d}let r,o;function a(d){r=d.type,o=d.bytesPerElement}function l(d,f){s.drawElements(n,f,r,d*o),t.update(f,n,1)}function c(d,f,g){g!==0&&(s.drawElementsInstanced(n,f,r,d*o,g),t.update(f,n,g))}function h(d,f,g){if(g===0)return;e.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,f,0,r,d,0,g);let m=0;for(let p=0;p<g;p++)m+=f[p];t.update(m,n,1)}function u(d,f,g,x){if(g===0)return;const m=e.get("WEBGL_multi_draw");if(m===null)for(let p=0;p<d.length;p++)c(d[p]/o,f[p],x[p]);else{m.multiDrawElementsInstancedWEBGL(n,f,0,r,d,0,x,0,g);let p=0;for(let M=0;M<g;M++)p+=f[M]*x[M];t.update(p,n,1)}}this.setMode=i,this.setIndex=a,this.render=l,this.renderInstances=c,this.renderMultiDraw=h,this.renderMultiDrawInstances=u}function Lg(s){const e={geometries:0,textures:0},t={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,o,a){switch(t.calls++,o){case s.TRIANGLES:t.triangles+=a*(r/3);break;case s.LINES:t.lines+=a*(r/2);break;case s.LINE_STRIP:t.lines+=a*(r-1);break;case s.LINE_LOOP:t.lines+=a*r;break;case s.POINTS:t.points+=a*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",o);break}}function i(){t.calls=0,t.triangles=0,t.points=0,t.lines=0}return{memory:e,render:t,programs:null,autoReset:!0,reset:i,update:n}}function Dg(s,e,t){const n=new WeakMap,i=new ht;function r(o,a,l){const c=o.morphTargetInfluences,h=a.morphAttributes.position||a.morphAttributes.normal||a.morphAttributes.color,u=h!==void 0?h.length:0;let d=n.get(a);if(d===void 0||d.count!==u){let b=function(){I.dispose(),n.delete(a),a.removeEventListener("dispose",b)};var f=b;d!==void 0&&d.texture.dispose();const g=a.morphAttributes.position!==void 0,x=a.morphAttributes.normal!==void 0,m=a.morphAttributes.color!==void 0,p=a.morphAttributes.position||[],M=a.morphAttributes.normal||[],y=a.morphAttributes.color||[];let v=0;g===!0&&(v=1),x===!0&&(v=2),m===!0&&(v=3);let w=a.attributes.position.count*v,S=1;w>e.maxTextureSize&&(S=Math.ceil(w/e.maxTextureSize),w=e.maxTextureSize);const R=new Float32Array(w*S*4*u),I=new Zh(R,w,S,u);I.type=Pn,I.needsUpdate=!0;const T=v*4;for(let U=0;U<u;U++){const V=p[U],F=M[U],O=y[U],W=w*S*4*U;for(let J=0;J<V.count;J++){const H=J*T;g===!0&&(i.fromBufferAttribute(V,J),R[W+H+0]=i.x,R[W+H+1]=i.y,R[W+H+2]=i.z,R[W+H+3]=0),x===!0&&(i.fromBufferAttribute(F,J),R[W+H+4]=i.x,R[W+H+5]=i.y,R[W+H+6]=i.z,R[W+H+7]=0),m===!0&&(i.fromBufferAttribute(O,J),R[W+H+8]=i.x,R[W+H+9]=i.y,R[W+H+10]=i.z,R[W+H+11]=O.itemSize===4?i.w:1)}}d={count:u,texture:I,size:new Oe(w,S)},n.set(a,d),a.addEventListener("dispose",b)}if(o.isInstancedMesh===!0&&o.morphTexture!==null)l.getUniforms().setValue(s,"morphTexture",o.morphTexture,t);else{let g=0;for(let m=0;m<c.length;m++)g+=c[m];const x=a.morphTargetsRelative?1:1-g;l.getUniforms().setValue(s,"morphTargetBaseInfluence",x),l.getUniforms().setValue(s,"morphTargetInfluences",c)}l.getUniforms().setValue(s,"morphTargetsTexture",d.texture,t),l.getUniforms().setValue(s,"morphTargetsTextureSize",d.size)}return{update:r}}function Ng(s,e,t,n){let i=new WeakMap;function r(l){const c=n.render.frame,h=l.geometry,u=e.get(l,h);if(i.get(u)!==c&&(e.update(u),i.set(u,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",a)===!1&&l.addEventListener("dispose",a),i.get(l)!==c&&(t.update(l.instanceMatrix,s.ARRAY_BUFFER),l.instanceColor!==null&&t.update(l.instanceColor,s.ARRAY_BUFFER),i.set(l,c))),l.isSkinnedMesh){const d=l.skeleton;i.get(d)!==c&&(d.update(),i.set(d,c))}return u}function o(){i=new WeakMap}function a(l){const c=l.target;c.removeEventListener("dispose",a),t.remove(c.instanceMatrix),c.instanceColor!==null&&t.remove(c.instanceColor)}return{update:r,dispose:o}}const Mu=new Nt,Ql=new hu(1,1),yu=new Zh,bu=new uf,Su=new su,eh=[],th=[],nh=new Float32Array(16),ih=new Float32Array(9),sh=new Float32Array(4);function ks(s,e,t){const n=s[0];if(n<=0||n>0)return s;const i=e*t;let r=eh[i];if(r===void 0&&(r=new Float32Array(i),eh[i]=r),e!==0){n.toArray(r,0);for(let o=1,a=0;o!==e;++o)a+=t,s[o].toArray(r,a)}return r}function Ft(s,e){if(s.length!==e.length)return!1;for(let t=0,n=s.length;t<n;t++)if(s[t]!==e[t])return!1;return!0}function Ot(s,e){for(let t=0,n=e.length;t<n;t++)s[t]=e[t]}function wo(s,e){let t=th[e];t===void 0&&(t=new Int32Array(e),th[e]=t);for(let n=0;n!==e;++n)t[n]=s.allocateTextureUnit();return t}function Ug(s,e){const t=this.cache;t[0]!==e&&(s.uniform1f(this.addr,e),t[0]=e)}function Fg(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2f(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Ft(t,e))return;s.uniform2fv(this.addr,e),Ot(t,e)}}function Og(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3f(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else if(e.r!==void 0)(t[0]!==e.r||t[1]!==e.g||t[2]!==e.b)&&(s.uniform3f(this.addr,e.r,e.g,e.b),t[0]=e.r,t[1]=e.g,t[2]=e.b);else{if(Ft(t,e))return;s.uniform3fv(this.addr,e),Ot(t,e)}}function zg(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4f(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Ft(t,e))return;s.uniform4fv(this.addr,e),Ot(t,e)}}function Bg(s,e){const t=this.cache,n=e.elements;if(n===void 0){if(Ft(t,e))return;s.uniformMatrix2fv(this.addr,!1,e),Ot(t,e)}else{if(Ft(t,n))return;sh.set(n),s.uniformMatrix2fv(this.addr,!1,sh),Ot(t,n)}}function kg(s,e){const t=this.cache,n=e.elements;if(n===void 0){if(Ft(t,e))return;s.uniformMatrix3fv(this.addr,!1,e),Ot(t,e)}else{if(Ft(t,n))return;ih.set(n),s.uniformMatrix3fv(this.addr,!1,ih),Ot(t,n)}}function Hg(s,e){const t=this.cache,n=e.elements;if(n===void 0){if(Ft(t,e))return;s.uniformMatrix4fv(this.addr,!1,e),Ot(t,e)}else{if(Ft(t,n))return;nh.set(n),s.uniformMatrix4fv(this.addr,!1,nh),Ot(t,n)}}function Vg(s,e){const t=this.cache;t[0]!==e&&(s.uniform1i(this.addr,e),t[0]=e)}function Gg(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2i(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Ft(t,e))return;s.uniform2iv(this.addr,e),Ot(t,e)}}function Wg(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3i(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Ft(t,e))return;s.uniform3iv(this.addr,e),Ot(t,e)}}function Xg(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4i(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Ft(t,e))return;s.uniform4iv(this.addr,e),Ot(t,e)}}function qg(s,e){const t=this.cache;t[0]!==e&&(s.uniform1ui(this.addr,e),t[0]=e)}function Yg(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y)&&(s.uniform2ui(this.addr,e.x,e.y),t[0]=e.x,t[1]=e.y);else{if(Ft(t,e))return;s.uniform2uiv(this.addr,e),Ot(t,e)}}function jg(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z)&&(s.uniform3ui(this.addr,e.x,e.y,e.z),t[0]=e.x,t[1]=e.y,t[2]=e.z);else{if(Ft(t,e))return;s.uniform3uiv(this.addr,e),Ot(t,e)}}function Kg(s,e){const t=this.cache;if(e.x!==void 0)(t[0]!==e.x||t[1]!==e.y||t[2]!==e.z||t[3]!==e.w)&&(s.uniform4ui(this.addr,e.x,e.y,e.z,e.w),t[0]=e.x,t[1]=e.y,t[2]=e.z,t[3]=e.w);else{if(Ft(t,e))return;s.uniform4uiv(this.addr,e),Ot(t,e)}}function Jg(s,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i);let r;this.type===s.SAMPLER_2D_SHADOW?(Ql.compareFunction=Kh,r=Ql):r=Mu,t.setTexture2D(e||r,i)}function Zg(s,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),t.setTexture3D(e||bu,i)}function $g(s,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),t.setTextureCube(e||Su,i)}function Qg(s,e,t){const n=this.cache,i=t.allocateTextureUnit();n[0]!==i&&(s.uniform1i(this.addr,i),n[0]=i),t.setTexture2DArray(e||yu,i)}function e_(s){switch(s){case 5126:return Ug;case 35664:return Fg;case 35665:return Og;case 35666:return zg;case 35674:return Bg;case 35675:return kg;case 35676:return Hg;case 5124:case 35670:return Vg;case 35667:case 35671:return Gg;case 35668:case 35672:return Wg;case 35669:case 35673:return Xg;case 5125:return qg;case 36294:return Yg;case 36295:return jg;case 36296:return Kg;case 35678:case 36198:case 36298:case 36306:case 35682:return Jg;case 35679:case 36299:case 36307:return Zg;case 35680:case 36300:case 36308:case 36293:return $g;case 36289:case 36303:case 36311:case 36292:return Qg}}function t_(s,e){s.uniform1fv(this.addr,e)}function n_(s,e){const t=ks(e,this.size,2);s.uniform2fv(this.addr,t)}function i_(s,e){const t=ks(e,this.size,3);s.uniform3fv(this.addr,t)}function s_(s,e){const t=ks(e,this.size,4);s.uniform4fv(this.addr,t)}function r_(s,e){const t=ks(e,this.size,4);s.uniformMatrix2fv(this.addr,!1,t)}function o_(s,e){const t=ks(e,this.size,9);s.uniformMatrix3fv(this.addr,!1,t)}function a_(s,e){const t=ks(e,this.size,16);s.uniformMatrix4fv(this.addr,!1,t)}function c_(s,e){s.uniform1iv(this.addr,e)}function l_(s,e){s.uniform2iv(this.addr,e)}function h_(s,e){s.uniform3iv(this.addr,e)}function u_(s,e){s.uniform4iv(this.addr,e)}function d_(s,e){s.uniform1uiv(this.addr,e)}function f_(s,e){s.uniform2uiv(this.addr,e)}function p_(s,e){s.uniform3uiv(this.addr,e)}function m_(s,e){s.uniform4uiv(this.addr,e)}function g_(s,e,t){const n=this.cache,i=e.length,r=wo(t,i);Ft(n,r)||(s.uniform1iv(this.addr,r),Ot(n,r));for(let o=0;o!==i;++o)t.setTexture2D(e[o]||Mu,r[o])}function __(s,e,t){const n=this.cache,i=e.length,r=wo(t,i);Ft(n,r)||(s.uniform1iv(this.addr,r),Ot(n,r));for(let o=0;o!==i;++o)t.setTexture3D(e[o]||bu,r[o])}function x_(s,e,t){const n=this.cache,i=e.length,r=wo(t,i);Ft(n,r)||(s.uniform1iv(this.addr,r),Ot(n,r));for(let o=0;o!==i;++o)t.setTextureCube(e[o]||Su,r[o])}function v_(s,e,t){const n=this.cache,i=e.length,r=wo(t,i);Ft(n,r)||(s.uniform1iv(this.addr,r),Ot(n,r));for(let o=0;o!==i;++o)t.setTexture2DArray(e[o]||yu,r[o])}function M_(s){switch(s){case 5126:return t_;case 35664:return n_;case 35665:return i_;case 35666:return s_;case 35674:return r_;case 35675:return o_;case 35676:return a_;case 5124:case 35670:return c_;case 35667:case 35671:return l_;case 35668:case 35672:return h_;case 35669:case 35673:return u_;case 5125:return d_;case 36294:return f_;case 36295:return p_;case 36296:return m_;case 35678:case 36198:case 36298:case 36306:case 35682:return g_;case 35679:case 36299:case 36307:return __;case 35680:case 36300:case 36308:case 36293:return x_;case 36289:case 36303:case 36311:case 36292:return v_}}class y_{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.setValue=e_(t.type)}}class b_{constructor(e,t,n){this.id=e,this.addr=n,this.cache=[],this.type=t.type,this.size=t.size,this.setValue=M_(t.type)}}class S_{constructor(e){this.id=e,this.seq=[],this.map={}}setValue(e,t,n){const i=this.seq;for(let r=0,o=i.length;r!==o;++r){const a=i[r];a.setValue(e,t[a.id],n)}}}const fa=/(\w+)(\])?(\[|\.)?/g;function rh(s,e){s.seq.push(e),s.map[e.id]=e}function E_(s,e,t){const n=s.name,i=n.length;for(fa.lastIndex=0;;){const r=fa.exec(n),o=fa.lastIndex;let a=r[1];const l=r[2]==="]",c=r[3];if(l&&(a=a|0),c===void 0||c==="["&&o+2===i){rh(t,c===void 0?new y_(a,s,e):new b_(a,s,e));break}else{let u=t.map[a];u===void 0&&(u=new S_(a),rh(t,u)),t=u}}}class ro{constructor(e,t){this.seq=[],this.map={};const n=e.getProgramParameter(t,e.ACTIVE_UNIFORMS);for(let i=0;i<n;++i){const r=e.getActiveUniform(t,i),o=e.getUniformLocation(t,r.name);E_(r,o,this)}}setValue(e,t,n,i){const r=this.map[t];r!==void 0&&r.setValue(e,n,i)}setOptional(e,t,n){const i=t[n];i!==void 0&&this.setValue(e,n,i)}static upload(e,t,n,i){for(let r=0,o=t.length;r!==o;++r){const a=t[r],l=n[a.id];l.needsUpdate!==!1&&a.setValue(e,l.value,i)}}static seqWithValue(e,t){const n=[];for(let i=0,r=e.length;i!==r;++i){const o=e[i];o.id in t&&n.push(o)}return n}}function oh(s,e,t){const n=s.createShader(e);return s.shaderSource(n,t),s.compileShader(n),n}const T_=37297;let w_=0;function A_(s,e){const t=s.split(`
`),n=[],i=Math.max(e-6,0),r=Math.min(e+6,t.length);for(let o=i;o<r;o++){const a=o+1;n.push(`${a===e?">":" "} ${a}: ${t[o]}`)}return n.join(`
`)}const ah=new $e;function R_(s){ot._getMatrix(ah,ot.workingColorSpace,s);const e=`mat3( ${ah.elements.map(t=>t.toFixed(4))} )`;switch(ot.getTransfer(s)){case uo:return[e,"LinearTransferOETF"];case _t:return[e,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",s),[e,"LinearTransferOETF"]}}function ch(s,e,t){const n=s.getShaderParameter(e,s.COMPILE_STATUS),r=(s.getShaderInfoLog(e)||"").trim();if(n&&r==="")return"";const o=/ERROR: 0:(\d+)/.exec(r);if(o){const a=parseInt(o[1]);return t.toUpperCase()+`

`+r+`

`+A_(s.getShaderSource(e),a)}else return r}function C_(s,e){const t=R_(e);return[`vec4 ${s}( vec4 value ) {`,`	return ${t[1]}( vec4( value.rgb * ${t[0]}, value.a ) );`,"}"].join(`
`)}function I_(s,e){let t;switch(e){case vd:t="Linear";break;case Md:t="Reinhard";break;case yd:t="Cineon";break;case Oh:t="ACESFilmic";break;case Sd:t="AgX";break;case Ed:t="Neutral";break;case bd:t="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",e),t="Linear"}return"vec3 "+s+"( vec3 color ) { return "+t+"ToneMapping( color ); }"}const Kr=new P;function P_(){ot.getLuminanceCoefficients(Kr);const s=Kr.x.toFixed(4),e=Kr.y.toFixed(4),t=Kr.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${s}, ${e}, ${t} );`,"	return dot( weights, rgb );","}"].join(`
`)}function L_(s){return[s.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",s.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(Qs).join(`
`)}function D_(s){const e=[];for(const t in s){const n=s[t];n!==!1&&e.push("#define "+t+" "+n)}return e.join(`
`)}function N_(s,e){const t={},n=s.getProgramParameter(e,s.ACTIVE_ATTRIBUTES);for(let i=0;i<n;i++){const r=s.getActiveAttrib(e,i),o=r.name;let a=1;r.type===s.FLOAT_MAT2&&(a=2),r.type===s.FLOAT_MAT3&&(a=3),r.type===s.FLOAT_MAT4&&(a=4),t[o]={type:r.type,location:s.getAttribLocation(e,o),locationSize:a}}return t}function Qs(s){return s!==""}function lh(s,e){const t=e.numSpotLightShadows+e.numSpotLightMaps-e.numSpotLightShadowsWithMaps;return s.replace(/NUM_DIR_LIGHTS/g,e.numDirLights).replace(/NUM_SPOT_LIGHTS/g,e.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,e.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,t).replace(/NUM_RECT_AREA_LIGHTS/g,e.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,e.numPointLights).replace(/NUM_HEMI_LIGHTS/g,e.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,e.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,e.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,e.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,e.numPointLightShadows)}function hh(s,e){return s.replace(/NUM_CLIPPING_PLANES/g,e.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,e.numClippingPlanes-e.numClipIntersection)}const U_=/^[ \t]*#include +<([\w\d./]+)>/gm;function pc(s){return s.replace(U_,O_)}const F_=new Map;function O_(s,e){let t=Qe[e];if(t===void 0){const n=F_.get(e);if(n!==void 0)t=Qe[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',e,n);else throw new Error("Can not resolve #include <"+e+">")}return pc(t)}const z_=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function uh(s){return s.replace(z_,B_)}function B_(s,e,t,n){let i="";for(let r=parseInt(e);r<parseInt(t);r++)i+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return i}function dh(s){let e=`precision ${s.precision} float;
	precision ${s.precision} int;
	precision ${s.precision} sampler2D;
	precision ${s.precision} samplerCube;
	precision ${s.precision} sampler3D;
	precision ${s.precision} sampler2DArray;
	precision ${s.precision} sampler2DShadow;
	precision ${s.precision} samplerCubeShadow;
	precision ${s.precision} sampler2DArrayShadow;
	precision ${s.precision} isampler2D;
	precision ${s.precision} isampler3D;
	precision ${s.precision} isamplerCube;
	precision ${s.precision} isampler2DArray;
	precision ${s.precision} usampler2D;
	precision ${s.precision} usampler3D;
	precision ${s.precision} usamplerCube;
	precision ${s.precision} usampler2DArray;
	`;return s.precision==="highp"?e+=`
#define HIGH_PRECISION`:s.precision==="mediump"?e+=`
#define MEDIUM_PRECISION`:s.precision==="lowp"&&(e+=`
#define LOW_PRECISION`),e}function k_(s){let e="SHADOWMAP_TYPE_BASIC";return s.shadowMapType===Nh?e="SHADOWMAP_TYPE_PCF":s.shadowMapType===Uh?e="SHADOWMAP_TYPE_PCF_SOFT":s.shadowMapType===ni&&(e="SHADOWMAP_TYPE_VSM"),e}function H_(s){let e="ENVMAP_TYPE_CUBE";if(s.envMap)switch(s.envMapMode){case As:case Rs:e="ENVMAP_TYPE_CUBE";break;case Mo:e="ENVMAP_TYPE_CUBE_UV";break}return e}function V_(s){let e="ENVMAP_MODE_REFLECTION";if(s.envMap)switch(s.envMapMode){case Rs:e="ENVMAP_MODE_REFRACTION";break}return e}function G_(s){let e="ENVMAP_BLENDING_NONE";if(s.envMap)switch(s.combine){case Fh:e="ENVMAP_BLENDING_MULTIPLY";break;case _d:e="ENVMAP_BLENDING_MIX";break;case xd:e="ENVMAP_BLENDING_ADD";break}return e}function W_(s){const e=s.envMapCubeUVHeight;if(e===null)return null;const t=Math.log2(e)-2,n=1/e;return{texelWidth:1/(3*Math.max(Math.pow(2,t),7*16)),texelHeight:n,maxMip:t}}function X_(s,e,t,n){const i=s.getContext(),r=t.defines;let o=t.vertexShader,a=t.fragmentShader;const l=k_(t),c=H_(t),h=V_(t),u=G_(t),d=W_(t),f=L_(t),g=D_(r),x=i.createProgram();let m,p,M=t.glslVersion?"#version "+t.glslVersion+`
`:"";t.isRawShaderMaterial?(m=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Qs).join(`
`),m.length>0&&(m+=`
`),p=["#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g].filter(Qs).join(`
`),p.length>0&&(p+=`
`)):(m=[dh(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",t.batching?"#define USE_BATCHING":"",t.batchingColor?"#define USE_BATCHING_COLOR":"",t.instancing?"#define USE_INSTANCING":"",t.instancingColor?"#define USE_INSTANCING_COLOR":"",t.instancingMorph?"#define USE_INSTANCING_MORPH":"",t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.map?"#define USE_MAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+h:"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.displacementMap?"#define USE_DISPLACEMENTMAP":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.mapUv?"#define MAP_UV "+t.mapUv:"",t.alphaMapUv?"#define ALPHAMAP_UV "+t.alphaMapUv:"",t.lightMapUv?"#define LIGHTMAP_UV "+t.lightMapUv:"",t.aoMapUv?"#define AOMAP_UV "+t.aoMapUv:"",t.emissiveMapUv?"#define EMISSIVEMAP_UV "+t.emissiveMapUv:"",t.bumpMapUv?"#define BUMPMAP_UV "+t.bumpMapUv:"",t.normalMapUv?"#define NORMALMAP_UV "+t.normalMapUv:"",t.displacementMapUv?"#define DISPLACEMENTMAP_UV "+t.displacementMapUv:"",t.metalnessMapUv?"#define METALNESSMAP_UV "+t.metalnessMapUv:"",t.roughnessMapUv?"#define ROUGHNESSMAP_UV "+t.roughnessMapUv:"",t.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+t.anisotropyMapUv:"",t.clearcoatMapUv?"#define CLEARCOATMAP_UV "+t.clearcoatMapUv:"",t.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+t.clearcoatNormalMapUv:"",t.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+t.clearcoatRoughnessMapUv:"",t.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+t.iridescenceMapUv:"",t.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+t.iridescenceThicknessMapUv:"",t.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+t.sheenColorMapUv:"",t.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+t.sheenRoughnessMapUv:"",t.specularMapUv?"#define SPECULARMAP_UV "+t.specularMapUv:"",t.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+t.specularColorMapUv:"",t.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+t.specularIntensityMapUv:"",t.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+t.transmissionMapUv:"",t.thicknessMapUv?"#define THICKNESSMAP_UV "+t.thicknessMapUv:"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.flatShading?"#define FLAT_SHADED":"",t.skinning?"#define USE_SKINNING":"",t.morphTargets?"#define USE_MORPHTARGETS":"",t.morphNormals&&t.flatShading===!1?"#define USE_MORPHNORMALS":"",t.morphColors?"#define USE_MORPHCOLORS":"",t.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+t.morphTextureStride:"",t.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+t.morphTargetsCount:"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.sizeAttenuation?"#define USE_SIZEATTENUATION":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(Qs).join(`
`),p=[dh(t),"#define SHADER_TYPE "+t.shaderType,"#define SHADER_NAME "+t.shaderName,g,t.useFog&&t.fog?"#define USE_FOG":"",t.useFog&&t.fogExp2?"#define FOG_EXP2":"",t.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",t.map?"#define USE_MAP":"",t.matcap?"#define USE_MATCAP":"",t.envMap?"#define USE_ENVMAP":"",t.envMap?"#define "+c:"",t.envMap?"#define "+h:"",t.envMap?"#define "+u:"",d?"#define CUBEUV_TEXEL_WIDTH "+d.texelWidth:"",d?"#define CUBEUV_TEXEL_HEIGHT "+d.texelHeight:"",d?"#define CUBEUV_MAX_MIP "+d.maxMip+".0":"",t.lightMap?"#define USE_LIGHTMAP":"",t.aoMap?"#define USE_AOMAP":"",t.bumpMap?"#define USE_BUMPMAP":"",t.normalMap?"#define USE_NORMALMAP":"",t.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",t.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",t.emissiveMap?"#define USE_EMISSIVEMAP":"",t.anisotropy?"#define USE_ANISOTROPY":"",t.anisotropyMap?"#define USE_ANISOTROPYMAP":"",t.clearcoat?"#define USE_CLEARCOAT":"",t.clearcoatMap?"#define USE_CLEARCOATMAP":"",t.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",t.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",t.dispersion?"#define USE_DISPERSION":"",t.iridescence?"#define USE_IRIDESCENCE":"",t.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",t.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",t.specularMap?"#define USE_SPECULARMAP":"",t.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",t.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",t.roughnessMap?"#define USE_ROUGHNESSMAP":"",t.metalnessMap?"#define USE_METALNESSMAP":"",t.alphaMap?"#define USE_ALPHAMAP":"",t.alphaTest?"#define USE_ALPHATEST":"",t.alphaHash?"#define USE_ALPHAHASH":"",t.sheen?"#define USE_SHEEN":"",t.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",t.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",t.transmission?"#define USE_TRANSMISSION":"",t.transmissionMap?"#define USE_TRANSMISSIONMAP":"",t.thicknessMap?"#define USE_THICKNESSMAP":"",t.vertexTangents&&t.flatShading===!1?"#define USE_TANGENT":"",t.vertexColors||t.instancingColor||t.batchingColor?"#define USE_COLOR":"",t.vertexAlphas?"#define USE_COLOR_ALPHA":"",t.vertexUv1s?"#define USE_UV1":"",t.vertexUv2s?"#define USE_UV2":"",t.vertexUv3s?"#define USE_UV3":"",t.pointsUvs?"#define USE_POINTS_UV":"",t.gradientMap?"#define USE_GRADIENTMAP":"",t.flatShading?"#define FLAT_SHADED":"",t.doubleSided?"#define DOUBLE_SIDED":"",t.flipSided?"#define FLIP_SIDED":"",t.shadowMapEnabled?"#define USE_SHADOWMAP":"",t.shadowMapEnabled?"#define "+l:"",t.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",t.numLightProbes>0?"#define USE_LIGHT_PROBES":"",t.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",t.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",t.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",t.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",t.toneMapping!==Li?"#define TONE_MAPPING":"",t.toneMapping!==Li?Qe.tonemapping_pars_fragment:"",t.toneMapping!==Li?I_("toneMapping",t.toneMapping):"",t.dithering?"#define DITHERING":"",t.opaque?"#define OPAQUE":"",Qe.colorspace_pars_fragment,C_("linearToOutputTexel",t.outputColorSpace),P_(),t.useDepthPacking?"#define DEPTH_PACKING "+t.depthPacking:"",`
`].filter(Qs).join(`
`)),o=pc(o),o=lh(o,t),o=hh(o,t),a=pc(a),a=lh(a,t),a=hh(a,t),o=uh(o),a=uh(a),t.isRawShaderMaterial!==!0&&(M=`#version 300 es
`,m=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,p=["#define varying in",t.glslVersion===cl?"":"layout(location = 0) out highp vec4 pc_fragColor;",t.glslVersion===cl?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);const y=M+m+o,v=M+p+a,w=oh(i,i.VERTEX_SHADER,y),S=oh(i,i.FRAGMENT_SHADER,v);i.attachShader(x,w),i.attachShader(x,S),t.index0AttributeName!==void 0?i.bindAttribLocation(x,0,t.index0AttributeName):t.morphTargets===!0&&i.bindAttribLocation(x,0,"position"),i.linkProgram(x);function R(U){if(s.debug.checkShaderErrors){const V=i.getProgramInfoLog(x)||"",F=i.getShaderInfoLog(w)||"",O=i.getShaderInfoLog(S)||"",W=V.trim(),J=F.trim(),H=O.trim();let z=!0,Z=!0;if(i.getProgramParameter(x,i.LINK_STATUS)===!1)if(z=!1,typeof s.debug.onShaderError=="function")s.debug.onShaderError(i,x,w,S);else{const le=ch(i,w,"vertex"),re=ch(i,S,"fragment");console.error("THREE.WebGLProgram: Shader Error "+i.getError()+" - VALIDATE_STATUS "+i.getProgramParameter(x,i.VALIDATE_STATUS)+`

Material Name: `+U.name+`
Material Type: `+U.type+`

Program Info Log: `+W+`
`+le+`
`+re)}else W!==""?console.warn("THREE.WebGLProgram: Program Info Log:",W):(J===""||H==="")&&(Z=!1);Z&&(U.diagnostics={runnable:z,programLog:W,vertexShader:{log:J,prefix:m},fragmentShader:{log:H,prefix:p}})}i.deleteShader(w),i.deleteShader(S),I=new ro(i,x),T=N_(i,x)}let I;this.getUniforms=function(){return I===void 0&&R(this),I};let T;this.getAttributes=function(){return T===void 0&&R(this),T};let b=t.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return b===!1&&(b=i.getProgramParameter(x,T_)),b},this.destroy=function(){n.releaseStatesOfProgram(this),i.deleteProgram(x),this.program=void 0},this.type=t.shaderType,this.name=t.shaderName,this.id=w_++,this.cacheKey=e,this.usedTimes=1,this.program=x,this.vertexShader=w,this.fragmentShader=S,this}let q_=0;class Y_{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(e){const t=e.vertexShader,n=e.fragmentShader,i=this._getShaderStage(t),r=this._getShaderStage(n),o=this._getShaderCacheForMaterial(e);return o.has(i)===!1&&(o.add(i),i.usedTimes++),o.has(r)===!1&&(o.add(r),r.usedTimes++),this}remove(e){const t=this.materialCache.get(e);for(const n of t)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(e),this}getVertexShaderID(e){return this._getShaderStage(e.vertexShader).id}getFragmentShaderID(e){return this._getShaderStage(e.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(e){const t=this.materialCache;let n=t.get(e);return n===void 0&&(n=new Set,t.set(e,n)),n}_getShaderStage(e){const t=this.shaderCache;let n=t.get(e);return n===void 0&&(n=new j_(e),t.set(e,n)),n}}class j_{constructor(e){this.id=q_++,this.code=e,this.usedTimes=0}}function K_(s,e,t,n,i,r,o){const a=new $h,l=new Y_,c=new Set,h=[],u=i.logarithmicDepthBuffer,d=i.vertexTextures;let f=i.precision;const g={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function x(T){return c.add(T),T===0?"uv":`uv${T}`}function m(T,b,U,V,F){const O=V.fog,W=F.geometry,J=T.isMeshStandardMaterial?V.environment:null,H=(T.isMeshStandardMaterial?t:e).get(T.envMap||J),z=H&&H.mapping===Mo?H.image.height:null,Z=g[T.type];T.precision!==null&&(f=i.getMaxPrecision(T.precision),f!==T.precision&&console.warn("THREE.WebGLProgram.getParameters:",T.precision,"not supported, using",f,"instead."));const le=W.morphAttributes.position||W.morphAttributes.normal||W.morphAttributes.color,re=le!==void 0?le.length:0;let _e=0;W.morphAttributes.position!==void 0&&(_e=1),W.morphAttributes.normal!==void 0&&(_e=2),W.morphAttributes.color!==void 0&&(_e=3);let me,ze,ke,te;if(Z){const rt=Bn[Z];me=rt.vertexShader,ze=rt.fragmentShader}else me=T.vertexShader,ze=T.fragmentShader,l.update(T),ke=l.getVertexShaderID(T),te=l.getFragmentShaderID(T);const ae=s.getRenderTarget(),ye=s.state.buffers.depth.getReversed(),Ie=F.isInstancedMesh===!0,A=F.isBatchedMesh===!0,j=!!T.map,Y=!!T.matcap,E=!!H,$=!!T.aoMap,Q=!!T.lightMap,se=!!T.bumpMap,ie=!!T.normalMap,be=!!T.displacementMap,oe=!!T.emissiveMap,de=!!T.metalnessMap,Ve=!!T.roughnessMap,Je=T.anisotropy>0,D=T.clearcoat>0,_=T.dispersion>0,N=T.iridescence>0,k=T.sheen>0,X=T.transmission>0,G=Je&&!!T.anisotropyMap,ge=D&&!!T.clearcoatMap,ce=D&&!!T.clearcoatNormalMap,xe=D&&!!T.clearcoatRoughnessMap,we=N&&!!T.iridescenceMap,ue=N&&!!T.iridescenceThicknessMap,Te=k&&!!T.sheenColorMap,Be=k&&!!T.sheenRoughnessMap,Re=!!T.specularMap,Ee=!!T.specularColorMap,Xe=!!T.specularIntensityMap,B=X&&!!T.transmissionMap,ve=X&&!!T.thicknessMap,Se=!!T.gradientMap,Le=!!T.alphaMap,pe=T.alphaTest>0,he=!!T.alphaHash,Ne=!!T.extensions;let De=Li;T.toneMapped&&(ae===null||ae.isXRRenderTarget===!0)&&(De=s.toneMapping);const tt={shaderID:Z,shaderType:T.type,shaderName:T.name,vertexShader:me,fragmentShader:ze,defines:T.defines,customVertexShaderID:ke,customFragmentShaderID:te,isRawShaderMaterial:T.isRawShaderMaterial===!0,glslVersion:T.glslVersion,precision:f,batching:A,batchingColor:A&&F._colorsTexture!==null,instancing:Ie,instancingColor:Ie&&F.instanceColor!==null,instancingMorph:Ie&&F.morphTexture!==null,supportsVertexTextures:d,outputColorSpace:ae===null?s.outputColorSpace:ae.isXRRenderTarget===!0?ae.texture.colorSpace:Qt,alphaToCoverage:!!T.alphaToCoverage,map:j,matcap:Y,envMap:E,envMapMode:E&&H.mapping,envMapCubeUVHeight:z,aoMap:$,lightMap:Q,bumpMap:se,normalMap:ie,displacementMap:d&&be,emissiveMap:oe,normalMapObjectSpace:ie&&T.normalMapType===Dd,normalMapTangentSpace:ie&&T.normalMapType===jh,metalnessMap:de,roughnessMap:Ve,anisotropy:Je,anisotropyMap:G,clearcoat:D,clearcoatMap:ge,clearcoatNormalMap:ce,clearcoatRoughnessMap:xe,dispersion:_,iridescence:N,iridescenceMap:we,iridescenceThicknessMap:ue,sheen:k,sheenColorMap:Te,sheenRoughnessMap:Be,specularMap:Re,specularColorMap:Ee,specularIntensityMap:Xe,transmission:X,transmissionMap:B,thicknessMap:ve,gradientMap:Se,opaque:T.transparent===!1&&T.blending===Ss&&T.alphaToCoverage===!1,alphaMap:Le,alphaTest:pe,alphaHash:he,combine:T.combine,mapUv:j&&x(T.map.channel),aoMapUv:$&&x(T.aoMap.channel),lightMapUv:Q&&x(T.lightMap.channel),bumpMapUv:se&&x(T.bumpMap.channel),normalMapUv:ie&&x(T.normalMap.channel),displacementMapUv:be&&x(T.displacementMap.channel),emissiveMapUv:oe&&x(T.emissiveMap.channel),metalnessMapUv:de&&x(T.metalnessMap.channel),roughnessMapUv:Ve&&x(T.roughnessMap.channel),anisotropyMapUv:G&&x(T.anisotropyMap.channel),clearcoatMapUv:ge&&x(T.clearcoatMap.channel),clearcoatNormalMapUv:ce&&x(T.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:xe&&x(T.clearcoatRoughnessMap.channel),iridescenceMapUv:we&&x(T.iridescenceMap.channel),iridescenceThicknessMapUv:ue&&x(T.iridescenceThicknessMap.channel),sheenColorMapUv:Te&&x(T.sheenColorMap.channel),sheenRoughnessMapUv:Be&&x(T.sheenRoughnessMap.channel),specularMapUv:Re&&x(T.specularMap.channel),specularColorMapUv:Ee&&x(T.specularColorMap.channel),specularIntensityMapUv:Xe&&x(T.specularIntensityMap.channel),transmissionMapUv:B&&x(T.transmissionMap.channel),thicknessMapUv:ve&&x(T.thicknessMap.channel),alphaMapUv:Le&&x(T.alphaMap.channel),vertexTangents:!!W.attributes.tangent&&(ie||Je),vertexColors:T.vertexColors,vertexAlphas:T.vertexColors===!0&&!!W.attributes.color&&W.attributes.color.itemSize===4,pointsUvs:F.isPoints===!0&&!!W.attributes.uv&&(j||Le),fog:!!O,useFog:T.fog===!0,fogExp2:!!O&&O.isFogExp2,flatShading:T.flatShading===!0&&T.wireframe===!1,sizeAttenuation:T.sizeAttenuation===!0,logarithmicDepthBuffer:u,reversedDepthBuffer:ye,skinning:F.isSkinnedMesh===!0,morphTargets:W.morphAttributes.position!==void 0,morphNormals:W.morphAttributes.normal!==void 0,morphColors:W.morphAttributes.color!==void 0,morphTargetsCount:re,morphTextureStride:_e,numDirLights:b.directional.length,numPointLights:b.point.length,numSpotLights:b.spot.length,numSpotLightMaps:b.spotLightMap.length,numRectAreaLights:b.rectArea.length,numHemiLights:b.hemi.length,numDirLightShadows:b.directionalShadowMap.length,numPointLightShadows:b.pointShadowMap.length,numSpotLightShadows:b.spotShadowMap.length,numSpotLightShadowsWithMaps:b.numSpotLightShadowsWithMaps,numLightProbes:b.numLightProbes,numClippingPlanes:o.numPlanes,numClipIntersection:o.numIntersection,dithering:T.dithering,shadowMapEnabled:s.shadowMap.enabled&&U.length>0,shadowMapType:s.shadowMap.type,toneMapping:De,decodeVideoTexture:j&&T.map.isVideoTexture===!0&&ot.getTransfer(T.map.colorSpace)===_t,decodeVideoTextureEmissive:oe&&T.emissiveMap.isVideoTexture===!0&&ot.getTransfer(T.emissiveMap.colorSpace)===_t,premultipliedAlpha:T.premultipliedAlpha,doubleSided:T.side===Ct,flipSided:T.side===tn,useDepthPacking:T.depthPacking>=0,depthPacking:T.depthPacking||0,index0AttributeName:T.index0AttributeName,extensionClipCullDistance:Ne&&T.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(Ne&&T.extensions.multiDraw===!0||A)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:T.customProgramCacheKey()};return tt.vertexUv1s=c.has(1),tt.vertexUv2s=c.has(2),tt.vertexUv3s=c.has(3),c.clear(),tt}function p(T){const b=[];if(T.shaderID?b.push(T.shaderID):(b.push(T.customVertexShaderID),b.push(T.customFragmentShaderID)),T.defines!==void 0)for(const U in T.defines)b.push(U),b.push(T.defines[U]);return T.isRawShaderMaterial===!1&&(M(b,T),y(b,T),b.push(s.outputColorSpace)),b.push(T.customProgramCacheKey),b.join()}function M(T,b){T.push(b.precision),T.push(b.outputColorSpace),T.push(b.envMapMode),T.push(b.envMapCubeUVHeight),T.push(b.mapUv),T.push(b.alphaMapUv),T.push(b.lightMapUv),T.push(b.aoMapUv),T.push(b.bumpMapUv),T.push(b.normalMapUv),T.push(b.displacementMapUv),T.push(b.emissiveMapUv),T.push(b.metalnessMapUv),T.push(b.roughnessMapUv),T.push(b.anisotropyMapUv),T.push(b.clearcoatMapUv),T.push(b.clearcoatNormalMapUv),T.push(b.clearcoatRoughnessMapUv),T.push(b.iridescenceMapUv),T.push(b.iridescenceThicknessMapUv),T.push(b.sheenColorMapUv),T.push(b.sheenRoughnessMapUv),T.push(b.specularMapUv),T.push(b.specularColorMapUv),T.push(b.specularIntensityMapUv),T.push(b.transmissionMapUv),T.push(b.thicknessMapUv),T.push(b.combine),T.push(b.fogExp2),T.push(b.sizeAttenuation),T.push(b.morphTargetsCount),T.push(b.morphAttributeCount),T.push(b.numDirLights),T.push(b.numPointLights),T.push(b.numSpotLights),T.push(b.numSpotLightMaps),T.push(b.numHemiLights),T.push(b.numRectAreaLights),T.push(b.numDirLightShadows),T.push(b.numPointLightShadows),T.push(b.numSpotLightShadows),T.push(b.numSpotLightShadowsWithMaps),T.push(b.numLightProbes),T.push(b.shadowMapType),T.push(b.toneMapping),T.push(b.numClippingPlanes),T.push(b.numClipIntersection),T.push(b.depthPacking)}function y(T,b){a.disableAll(),b.supportsVertexTextures&&a.enable(0),b.instancing&&a.enable(1),b.instancingColor&&a.enable(2),b.instancingMorph&&a.enable(3),b.matcap&&a.enable(4),b.envMap&&a.enable(5),b.normalMapObjectSpace&&a.enable(6),b.normalMapTangentSpace&&a.enable(7),b.clearcoat&&a.enable(8),b.iridescence&&a.enable(9),b.alphaTest&&a.enable(10),b.vertexColors&&a.enable(11),b.vertexAlphas&&a.enable(12),b.vertexUv1s&&a.enable(13),b.vertexUv2s&&a.enable(14),b.vertexUv3s&&a.enable(15),b.vertexTangents&&a.enable(16),b.anisotropy&&a.enable(17),b.alphaHash&&a.enable(18),b.batching&&a.enable(19),b.dispersion&&a.enable(20),b.batchingColor&&a.enable(21),b.gradientMap&&a.enable(22),T.push(a.mask),a.disableAll(),b.fog&&a.enable(0),b.useFog&&a.enable(1),b.flatShading&&a.enable(2),b.logarithmicDepthBuffer&&a.enable(3),b.reversedDepthBuffer&&a.enable(4),b.skinning&&a.enable(5),b.morphTargets&&a.enable(6),b.morphNormals&&a.enable(7),b.morphColors&&a.enable(8),b.premultipliedAlpha&&a.enable(9),b.shadowMapEnabled&&a.enable(10),b.doubleSided&&a.enable(11),b.flipSided&&a.enable(12),b.useDepthPacking&&a.enable(13),b.dithering&&a.enable(14),b.transmission&&a.enable(15),b.sheen&&a.enable(16),b.opaque&&a.enable(17),b.pointsUvs&&a.enable(18),b.decodeVideoTexture&&a.enable(19),b.decodeVideoTextureEmissive&&a.enable(20),b.alphaToCoverage&&a.enable(21),T.push(a.mask)}function v(T){const b=g[T.type];let U;if(b){const V=Bn[b];U=Ef.clone(V.uniforms)}else U=T.uniforms;return U}function w(T,b){let U;for(let V=0,F=h.length;V<F;V++){const O=h[V];if(O.cacheKey===b){U=O,++U.usedTimes;break}}return U===void 0&&(U=new X_(s,b,T,r),h.push(U)),U}function S(T){if(--T.usedTimes===0){const b=h.indexOf(T);h[b]=h[h.length-1],h.pop(),T.destroy()}}function R(T){l.remove(T)}function I(){l.dispose()}return{getParameters:m,getProgramCacheKey:p,getUniforms:v,acquireProgram:w,releaseProgram:S,releaseShaderCache:R,programs:h,dispose:I}}function J_(){let s=new WeakMap;function e(o){return s.has(o)}function t(o){let a=s.get(o);return a===void 0&&(a={},s.set(o,a)),a}function n(o){s.delete(o)}function i(o,a,l){s.get(o)[a]=l}function r(){s=new WeakMap}return{has:e,get:t,remove:n,update:i,dispose:r}}function Z_(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.material.id!==e.material.id?s.material.id-e.material.id:s.z!==e.z?s.z-e.z:s.id-e.id}function fh(s,e){return s.groupOrder!==e.groupOrder?s.groupOrder-e.groupOrder:s.renderOrder!==e.renderOrder?s.renderOrder-e.renderOrder:s.z!==e.z?e.z-s.z:s.id-e.id}function ph(){const s=[];let e=0;const t=[],n=[],i=[];function r(){e=0,t.length=0,n.length=0,i.length=0}function o(u,d,f,g,x,m){let p=s[e];return p===void 0?(p={id:u.id,object:u,geometry:d,material:f,groupOrder:g,renderOrder:u.renderOrder,z:x,group:m},s[e]=p):(p.id=u.id,p.object=u,p.geometry=d,p.material=f,p.groupOrder=g,p.renderOrder=u.renderOrder,p.z=x,p.group=m),e++,p}function a(u,d,f,g,x,m){const p=o(u,d,f,g,x,m);f.transmission>0?n.push(p):f.transparent===!0?i.push(p):t.push(p)}function l(u,d,f,g,x,m){const p=o(u,d,f,g,x,m);f.transmission>0?n.unshift(p):f.transparent===!0?i.unshift(p):t.unshift(p)}function c(u,d){t.length>1&&t.sort(u||Z_),n.length>1&&n.sort(d||fh),i.length>1&&i.sort(d||fh)}function h(){for(let u=e,d=s.length;u<d;u++){const f=s[u];if(f.id===null)break;f.id=null,f.object=null,f.geometry=null,f.material=null,f.group=null}}return{opaque:t,transmissive:n,transparent:i,init:r,push:a,unshift:l,finish:h,sort:c}}function $_(){let s=new WeakMap;function e(n,i){const r=s.get(n);let o;return r===void 0?(o=new ph,s.set(n,[o])):i>=r.length?(o=new ph,r.push(o)):o=r[i],o}function t(){s=new WeakMap}return{get:e,dispose:t}}function Q_(){const s={};return{get:function(e){if(s[e.id]!==void 0)return s[e.id];let t;switch(e.type){case"DirectionalLight":t={direction:new P,color:new Ye};break;case"SpotLight":t={position:new P,direction:new P,color:new Ye,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":t={position:new P,color:new Ye,distance:0,decay:0};break;case"HemisphereLight":t={direction:new P,skyColor:new Ye,groundColor:new Ye};break;case"RectAreaLight":t={color:new Ye,position:new P,halfWidth:new P,halfHeight:new P};break}return s[e.id]=t,t}}}function ex(){const s={};return{get:function(e){if(s[e.id]!==void 0)return s[e.id];let t;switch(e.type){case"DirectionalLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Oe};break;case"SpotLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Oe};break;case"PointLight":t={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Oe,shadowCameraNear:1,shadowCameraFar:1e3};break}return s[e.id]=t,t}}}let tx=0;function nx(s,e){return(e.castShadow?2:0)-(s.castShadow?2:0)+(e.map?1:0)-(s.map?1:0)}function ix(s){const e=new Q_,t=ex(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new P);const i=new P,r=new Ze,o=new Ze;function a(c){let h=0,u=0,d=0;for(let T=0;T<9;T++)n.probe[T].set(0,0,0);let f=0,g=0,x=0,m=0,p=0,M=0,y=0,v=0,w=0,S=0,R=0;c.sort(nx);for(let T=0,b=c.length;T<b;T++){const U=c[T],V=U.color,F=U.intensity,O=U.distance,W=U.shadow&&U.shadow.map?U.shadow.map.texture:null;if(U.isAmbientLight)h+=V.r*F,u+=V.g*F,d+=V.b*F;else if(U.isLightProbe){for(let J=0;J<9;J++)n.probe[J].addScaledVector(U.sh.coefficients[J],F);R++}else if(U.isDirectionalLight){const J=e.get(U);if(J.color.copy(U.color).multiplyScalar(U.intensity),U.castShadow){const H=U.shadow,z=t.get(U);z.shadowIntensity=H.intensity,z.shadowBias=H.bias,z.shadowNormalBias=H.normalBias,z.shadowRadius=H.radius,z.shadowMapSize=H.mapSize,n.directionalShadow[f]=z,n.directionalShadowMap[f]=W,n.directionalShadowMatrix[f]=U.shadow.matrix,M++}n.directional[f]=J,f++}else if(U.isSpotLight){const J=e.get(U);J.position.setFromMatrixPosition(U.matrixWorld),J.color.copy(V).multiplyScalar(F),J.distance=O,J.coneCos=Math.cos(U.angle),J.penumbraCos=Math.cos(U.angle*(1-U.penumbra)),J.decay=U.decay,n.spot[x]=J;const H=U.shadow;if(U.map&&(n.spotLightMap[w]=U.map,w++,H.updateMatrices(U),U.castShadow&&S++),n.spotLightMatrix[x]=H.matrix,U.castShadow){const z=t.get(U);z.shadowIntensity=H.intensity,z.shadowBias=H.bias,z.shadowNormalBias=H.normalBias,z.shadowRadius=H.radius,z.shadowMapSize=H.mapSize,n.spotShadow[x]=z,n.spotShadowMap[x]=W,v++}x++}else if(U.isRectAreaLight){const J=e.get(U);J.color.copy(V).multiplyScalar(F),J.halfWidth.set(U.width*.5,0,0),J.halfHeight.set(0,U.height*.5,0),n.rectArea[m]=J,m++}else if(U.isPointLight){const J=e.get(U);if(J.color.copy(U.color).multiplyScalar(U.intensity),J.distance=U.distance,J.decay=U.decay,U.castShadow){const H=U.shadow,z=t.get(U);z.shadowIntensity=H.intensity,z.shadowBias=H.bias,z.shadowNormalBias=H.normalBias,z.shadowRadius=H.radius,z.shadowMapSize=H.mapSize,z.shadowCameraNear=H.camera.near,z.shadowCameraFar=H.camera.far,n.pointShadow[g]=z,n.pointShadowMap[g]=W,n.pointShadowMatrix[g]=U.shadow.matrix,y++}n.point[g]=J,g++}else if(U.isHemisphereLight){const J=e.get(U);J.skyColor.copy(U.color).multiplyScalar(F),J.groundColor.copy(U.groundColor).multiplyScalar(F),n.hemi[p]=J,p++}}m>0&&(s.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=Ae.LTC_FLOAT_1,n.rectAreaLTC2=Ae.LTC_FLOAT_2):(n.rectAreaLTC1=Ae.LTC_HALF_1,n.rectAreaLTC2=Ae.LTC_HALF_2)),n.ambient[0]=h,n.ambient[1]=u,n.ambient[2]=d;const I=n.hash;(I.directionalLength!==f||I.pointLength!==g||I.spotLength!==x||I.rectAreaLength!==m||I.hemiLength!==p||I.numDirectionalShadows!==M||I.numPointShadows!==y||I.numSpotShadows!==v||I.numSpotMaps!==w||I.numLightProbes!==R)&&(n.directional.length=f,n.spot.length=x,n.rectArea.length=m,n.point.length=g,n.hemi.length=p,n.directionalShadow.length=M,n.directionalShadowMap.length=M,n.pointShadow.length=y,n.pointShadowMap.length=y,n.spotShadow.length=v,n.spotShadowMap.length=v,n.directionalShadowMatrix.length=M,n.pointShadowMatrix.length=y,n.spotLightMatrix.length=v+w-S,n.spotLightMap.length=w,n.numSpotLightShadowsWithMaps=S,n.numLightProbes=R,I.directionalLength=f,I.pointLength=g,I.spotLength=x,I.rectAreaLength=m,I.hemiLength=p,I.numDirectionalShadows=M,I.numPointShadows=y,I.numSpotShadows=v,I.numSpotMaps=w,I.numLightProbes=R,n.version=tx++)}function l(c,h){let u=0,d=0,f=0,g=0,x=0;const m=h.matrixWorldInverse;for(let p=0,M=c.length;p<M;p++){const y=c[p];if(y.isDirectionalLight){const v=n.directional[u];v.direction.setFromMatrixPosition(y.matrixWorld),i.setFromMatrixPosition(y.target.matrixWorld),v.direction.sub(i),v.direction.transformDirection(m),u++}else if(y.isSpotLight){const v=n.spot[f];v.position.setFromMatrixPosition(y.matrixWorld),v.position.applyMatrix4(m),v.direction.setFromMatrixPosition(y.matrixWorld),i.setFromMatrixPosition(y.target.matrixWorld),v.direction.sub(i),v.direction.transformDirection(m),f++}else if(y.isRectAreaLight){const v=n.rectArea[g];v.position.setFromMatrixPosition(y.matrixWorld),v.position.applyMatrix4(m),o.identity(),r.copy(y.matrixWorld),r.premultiply(m),o.extractRotation(r),v.halfWidth.set(y.width*.5,0,0),v.halfHeight.set(0,y.height*.5,0),v.halfWidth.applyMatrix4(o),v.halfHeight.applyMatrix4(o),g++}else if(y.isPointLight){const v=n.point[d];v.position.setFromMatrixPosition(y.matrixWorld),v.position.applyMatrix4(m),d++}else if(y.isHemisphereLight){const v=n.hemi[x];v.direction.setFromMatrixPosition(y.matrixWorld),v.direction.transformDirection(m),x++}}}return{setup:a,setupView:l,state:n}}function mh(s){const e=new ix(s),t=[],n=[];function i(h){c.camera=h,t.length=0,n.length=0}function r(h){t.push(h)}function o(h){n.push(h)}function a(){e.setup(t)}function l(h){e.setupView(t,h)}const c={lightsArray:t,shadowsArray:n,camera:null,lights:e,transmissionRenderTarget:{}};return{init:i,state:c,setupLights:a,setupLightsView:l,pushLight:r,pushShadow:o}}function sx(s){let e=new WeakMap;function t(i,r=0){const o=e.get(i);let a;return o===void 0?(a=new mh(s),e.set(i,[a])):r>=o.length?(a=new mh(s),o.push(a)):a=o[r],a}function n(){e=new WeakMap}return{get:t,dispose:n}}const rx=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,ox=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function ax(s,e,t){let n=new bo;const i=new Oe,r=new Oe,o=new ht,a=new ip({depthPacking:Ld}),l=new sp,c={},h=t.maxTextureSize,u={[ui]:tn,[tn]:ui,[Ct]:Ct},d=new Ni({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Oe},radius:{value:4}},vertexShader:rx,fragmentShader:ox}),f=d.clone();f.defines.HORIZONTAL_PASS=1;const g=new dt;g.setAttribute("position",new Yt(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));const x=new Fe(g,d),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=Nh;let p=this.type;this.render=function(S,R,I){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||S.length===0)return;const T=s.getRenderTarget(),b=s.getActiveCubeFace(),U=s.getActiveMipmapLevel(),V=s.state;V.setBlending(Pi),V.buffers.depth.getReversed()===!0?V.buffers.color.setClear(0,0,0,0):V.buffers.color.setClear(1,1,1,1),V.buffers.depth.setTest(!0),V.setScissorTest(!1);const F=p!==ni&&this.type===ni,O=p===ni&&this.type!==ni;for(let W=0,J=S.length;W<J;W++){const H=S[W],z=H.shadow;if(z===void 0){console.warn("THREE.WebGLShadowMap:",H,"has no shadow.");continue}if(z.autoUpdate===!1&&z.needsUpdate===!1)continue;i.copy(z.mapSize);const Z=z.getFrameExtents();if(i.multiply(Z),r.copy(z.mapSize),(i.x>h||i.y>h)&&(i.x>h&&(r.x=Math.floor(h/Z.x),i.x=r.x*Z.x,z.mapSize.x=r.x),i.y>h&&(r.y=Math.floor(h/Z.y),i.y=r.y*Z.y,z.mapSize.y=r.y)),z.map===null||F===!0||O===!0){const re=this.type!==ni?{minFilter:$t,magFilter:$t}:{};z.map!==null&&z.map.dispose(),z.map=new Qi(i.x,i.y,re),z.map.texture.name=H.name+".shadowMap",z.camera.updateProjectionMatrix()}s.setRenderTarget(z.map),s.clear();const le=z.getViewportCount();for(let re=0;re<le;re++){const _e=z.getViewport(re);o.set(r.x*_e.x,r.y*_e.y,r.x*_e.z,r.y*_e.w),V.viewport(o),z.updateMatrices(H,re),n=z.getFrustum(),v(R,I,z.camera,H,this.type)}z.isPointLightShadow!==!0&&this.type===ni&&M(z,I),z.needsUpdate=!1}p=this.type,m.needsUpdate=!1,s.setRenderTarget(T,b,U)};function M(S,R){const I=e.update(x);d.defines.VSM_SAMPLES!==S.blurSamples&&(d.defines.VSM_SAMPLES=S.blurSamples,f.defines.VSM_SAMPLES=S.blurSamples,d.needsUpdate=!0,f.needsUpdate=!0),S.mapPass===null&&(S.mapPass=new Qi(i.x,i.y)),d.uniforms.shadow_pass.value=S.map.texture,d.uniforms.resolution.value=S.mapSize,d.uniforms.radius.value=S.radius,s.setRenderTarget(S.mapPass),s.clear(),s.renderBufferDirect(R,null,I,d,x,null),f.uniforms.shadow_pass.value=S.mapPass.texture,f.uniforms.resolution.value=S.mapSize,f.uniforms.radius.value=S.radius,s.setRenderTarget(S.map),s.clear(),s.renderBufferDirect(R,null,I,f,x,null)}function y(S,R,I,T){let b=null;const U=I.isPointLight===!0?S.customDistanceMaterial:S.customDepthMaterial;if(U!==void 0)b=U;else if(b=I.isPointLight===!0?l:a,s.localClippingEnabled&&R.clipShadows===!0&&Array.isArray(R.clippingPlanes)&&R.clippingPlanes.length!==0||R.displacementMap&&R.displacementScale!==0||R.alphaMap&&R.alphaTest>0||R.map&&R.alphaTest>0||R.alphaToCoverage===!0){const V=b.uuid,F=R.uuid;let O=c[V];O===void 0&&(O={},c[V]=O);let W=O[F];W===void 0&&(W=b.clone(),O[F]=W,R.addEventListener("dispose",w)),b=W}if(b.visible=R.visible,b.wireframe=R.wireframe,T===ni?b.side=R.shadowSide!==null?R.shadowSide:R.side:b.side=R.shadowSide!==null?R.shadowSide:u[R.side],b.alphaMap=R.alphaMap,b.alphaTest=R.alphaToCoverage===!0?.5:R.alphaTest,b.map=R.map,b.clipShadows=R.clipShadows,b.clippingPlanes=R.clippingPlanes,b.clipIntersection=R.clipIntersection,b.displacementMap=R.displacementMap,b.displacementScale=R.displacementScale,b.displacementBias=R.displacementBias,b.wireframeLinewidth=R.wireframeLinewidth,b.linewidth=R.linewidth,I.isPointLight===!0&&b.isMeshDistanceMaterial===!0){const V=s.properties.get(b);V.light=I}return b}function v(S,R,I,T,b){if(S.visible===!1)return;if(S.layers.test(R.layers)&&(S.isMesh||S.isLine||S.isPoints)&&(S.castShadow||S.receiveShadow&&b===ni)&&(!S.frustumCulled||n.intersectsObject(S))){S.modelViewMatrix.multiplyMatrices(I.matrixWorldInverse,S.matrixWorld);const F=e.update(S),O=S.material;if(Array.isArray(O)){const W=F.groups;for(let J=0,H=W.length;J<H;J++){const z=W[J],Z=O[z.materialIndex];if(Z&&Z.visible){const le=y(S,Z,T,b);S.onBeforeShadow(s,S,R,I,F,le,z),s.renderBufferDirect(I,null,F,le,S,z),S.onAfterShadow(s,S,R,I,F,le,z)}}}else if(O.visible){const W=y(S,O,T,b);S.onBeforeShadow(s,S,R,I,F,W,null),s.renderBufferDirect(I,null,F,W,S,null),S.onAfterShadow(s,S,R,I,F,W,null)}}const V=S.children;for(let F=0,O=V.length;F<O;F++)v(V[F],R,I,T,b)}function w(S){S.target.removeEventListener("dispose",w);for(const I in c){const T=c[I],b=S.target.uuid;b in T&&(T[b].dispose(),delete T[b])}}}const cx={[wa]:Aa,[Ra]:Pa,[Ca]:La,[ws]:Ia,[Aa]:wa,[Pa]:Ra,[La]:Ca,[Ia]:ws};function lx(s,e){function t(){let B=!1;const ve=new ht;let Se=null;const Le=new ht(0,0,0,0);return{setMask:function(pe){Se!==pe&&!B&&(s.colorMask(pe,pe,pe,pe),Se=pe)},setLocked:function(pe){B=pe},setClear:function(pe,he,Ne,De,tt){tt===!0&&(pe*=De,he*=De,Ne*=De),ve.set(pe,he,Ne,De),Le.equals(ve)===!1&&(s.clearColor(pe,he,Ne,De),Le.copy(ve))},reset:function(){B=!1,Se=null,Le.set(-1,0,0,0)}}}function n(){let B=!1,ve=!1,Se=null,Le=null,pe=null;return{setReversed:function(he){if(ve!==he){const Ne=e.get("EXT_clip_control");he?Ne.clipControlEXT(Ne.LOWER_LEFT_EXT,Ne.ZERO_TO_ONE_EXT):Ne.clipControlEXT(Ne.LOWER_LEFT_EXT,Ne.NEGATIVE_ONE_TO_ONE_EXT),ve=he;const De=pe;pe=null,this.setClear(De)}},getReversed:function(){return ve},setTest:function(he){he?ae(s.DEPTH_TEST):ye(s.DEPTH_TEST)},setMask:function(he){Se!==he&&!B&&(s.depthMask(he),Se=he)},setFunc:function(he){if(ve&&(he=cx[he]),Le!==he){switch(he){case wa:s.depthFunc(s.NEVER);break;case Aa:s.depthFunc(s.ALWAYS);break;case Ra:s.depthFunc(s.LESS);break;case ws:s.depthFunc(s.LEQUAL);break;case Ca:s.depthFunc(s.EQUAL);break;case Ia:s.depthFunc(s.GEQUAL);break;case Pa:s.depthFunc(s.GREATER);break;case La:s.depthFunc(s.NOTEQUAL);break;default:s.depthFunc(s.LEQUAL)}Le=he}},setLocked:function(he){B=he},setClear:function(he){pe!==he&&(ve&&(he=1-he),s.clearDepth(he),pe=he)},reset:function(){B=!1,Se=null,Le=null,pe=null,ve=!1}}}function i(){let B=!1,ve=null,Se=null,Le=null,pe=null,he=null,Ne=null,De=null,tt=null;return{setTest:function(rt){B||(rt?ae(s.STENCIL_TEST):ye(s.STENCIL_TEST))},setMask:function(rt){ve!==rt&&!B&&(s.stencilMask(rt),ve=rt)},setFunc:function(rt,rn,je){(Se!==rt||Le!==rn||pe!==je)&&(s.stencilFunc(rt,rn,je),Se=rt,Le=rn,pe=je)},setOp:function(rt,rn,je){(he!==rt||Ne!==rn||De!==je)&&(s.stencilOp(rt,rn,je),he=rt,Ne=rn,De=je)},setLocked:function(rt){B=rt},setClear:function(rt){tt!==rt&&(s.clearStencil(rt),tt=rt)},reset:function(){B=!1,ve=null,Se=null,Le=null,pe=null,he=null,Ne=null,De=null,tt=null}}}const r=new t,o=new n,a=new i,l=new WeakMap,c=new WeakMap;let h={},u={},d=new WeakMap,f=[],g=null,x=!1,m=null,p=null,M=null,y=null,v=null,w=null,S=null,R=new Ye(0,0,0),I=0,T=!1,b=null,U=null,V=null,F=null,O=null;const W=s.getParameter(s.MAX_COMBINED_TEXTURE_IMAGE_UNITS);let J=!1,H=0;const z=s.getParameter(s.VERSION);z.indexOf("WebGL")!==-1?(H=parseFloat(/^WebGL (\d)/.exec(z)[1]),J=H>=1):z.indexOf("OpenGL ES")!==-1&&(H=parseFloat(/^OpenGL ES (\d)/.exec(z)[1]),J=H>=2);let Z=null,le={};const re=s.getParameter(s.SCISSOR_BOX),_e=s.getParameter(s.VIEWPORT),me=new ht().fromArray(re),ze=new ht().fromArray(_e);function ke(B,ve,Se,Le){const pe=new Uint8Array(4),he=s.createTexture();s.bindTexture(B,he),s.texParameteri(B,s.TEXTURE_MIN_FILTER,s.NEAREST),s.texParameteri(B,s.TEXTURE_MAG_FILTER,s.NEAREST);for(let Ne=0;Ne<Se;Ne++)B===s.TEXTURE_3D||B===s.TEXTURE_2D_ARRAY?s.texImage3D(ve,0,s.RGBA,1,1,Le,0,s.RGBA,s.UNSIGNED_BYTE,pe):s.texImage2D(ve+Ne,0,s.RGBA,1,1,0,s.RGBA,s.UNSIGNED_BYTE,pe);return he}const te={};te[s.TEXTURE_2D]=ke(s.TEXTURE_2D,s.TEXTURE_2D,1),te[s.TEXTURE_CUBE_MAP]=ke(s.TEXTURE_CUBE_MAP,s.TEXTURE_CUBE_MAP_POSITIVE_X,6),te[s.TEXTURE_2D_ARRAY]=ke(s.TEXTURE_2D_ARRAY,s.TEXTURE_2D_ARRAY,1,1),te[s.TEXTURE_3D]=ke(s.TEXTURE_3D,s.TEXTURE_3D,1,1),r.setClear(0,0,0,1),o.setClear(1),a.setClear(0),ae(s.DEPTH_TEST),o.setFunc(ws),se(!1),ie(nl),ae(s.CULL_FACE),$(Pi);function ae(B){h[B]!==!0&&(s.enable(B),h[B]=!0)}function ye(B){h[B]!==!1&&(s.disable(B),h[B]=!1)}function Ie(B,ve){return u[B]!==ve?(s.bindFramebuffer(B,ve),u[B]=ve,B===s.DRAW_FRAMEBUFFER&&(u[s.FRAMEBUFFER]=ve),B===s.FRAMEBUFFER&&(u[s.DRAW_FRAMEBUFFER]=ve),!0):!1}function A(B,ve){let Se=f,Le=!1;if(B){Se=d.get(ve),Se===void 0&&(Se=[],d.set(ve,Se));const pe=B.textures;if(Se.length!==pe.length||Se[0]!==s.COLOR_ATTACHMENT0){for(let he=0,Ne=pe.length;he<Ne;he++)Se[he]=s.COLOR_ATTACHMENT0+he;Se.length=pe.length,Le=!0}}else Se[0]!==s.BACK&&(Se[0]=s.BACK,Le=!0);Le&&s.drawBuffers(Se)}function j(B){return g!==B?(s.useProgram(B),g=B,!0):!1}const Y={[Yi]:s.FUNC_ADD,[ed]:s.FUNC_SUBTRACT,[td]:s.FUNC_REVERSE_SUBTRACT};Y[nd]=s.MIN,Y[id]=s.MAX;const E={[sd]:s.ZERO,[rd]:s.ONE,[od]:s.SRC_COLOR,[Ea]:s.SRC_ALPHA,[dd]:s.SRC_ALPHA_SATURATE,[hd]:s.DST_COLOR,[cd]:s.DST_ALPHA,[ad]:s.ONE_MINUS_SRC_COLOR,[Ta]:s.ONE_MINUS_SRC_ALPHA,[ud]:s.ONE_MINUS_DST_COLOR,[ld]:s.ONE_MINUS_DST_ALPHA,[fd]:s.CONSTANT_COLOR,[pd]:s.ONE_MINUS_CONSTANT_COLOR,[md]:s.CONSTANT_ALPHA,[gd]:s.ONE_MINUS_CONSTANT_ALPHA};function $(B,ve,Se,Le,pe,he,Ne,De,tt,rt){if(B===Pi){x===!0&&(ye(s.BLEND),x=!1);return}if(x===!1&&(ae(s.BLEND),x=!0),B!==Qu){if(B!==m||rt!==T){if((p!==Yi||v!==Yi)&&(s.blendEquation(s.FUNC_ADD),p=Yi,v=Yi),rt)switch(B){case Ss:s.blendFuncSeparate(s.ONE,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case il:s.blendFunc(s.ONE,s.ONE);break;case sl:s.blendFuncSeparate(s.ZERO,s.ONE_MINUS_SRC_COLOR,s.ZERO,s.ONE);break;case rl:s.blendFuncSeparate(s.DST_COLOR,s.ONE_MINUS_SRC_ALPHA,s.ZERO,s.ONE);break;default:console.error("THREE.WebGLState: Invalid blending: ",B);break}else switch(B){case Ss:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE_MINUS_SRC_ALPHA,s.ONE,s.ONE_MINUS_SRC_ALPHA);break;case il:s.blendFuncSeparate(s.SRC_ALPHA,s.ONE,s.ONE,s.ONE);break;case sl:console.error("THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case rl:console.error("THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:console.error("THREE.WebGLState: Invalid blending: ",B);break}M=null,y=null,w=null,S=null,R.set(0,0,0),I=0,m=B,T=rt}return}pe=pe||ve,he=he||Se,Ne=Ne||Le,(ve!==p||pe!==v)&&(s.blendEquationSeparate(Y[ve],Y[pe]),p=ve,v=pe),(Se!==M||Le!==y||he!==w||Ne!==S)&&(s.blendFuncSeparate(E[Se],E[Le],E[he],E[Ne]),M=Se,y=Le,w=he,S=Ne),(De.equals(R)===!1||tt!==I)&&(s.blendColor(De.r,De.g,De.b,tt),R.copy(De),I=tt),m=B,T=!1}function Q(B,ve){B.side===Ct?ye(s.CULL_FACE):ae(s.CULL_FACE);let Se=B.side===tn;ve&&(Se=!Se),se(Se),B.blending===Ss&&B.transparent===!1?$(Pi):$(B.blending,B.blendEquation,B.blendSrc,B.blendDst,B.blendEquationAlpha,B.blendSrcAlpha,B.blendDstAlpha,B.blendColor,B.blendAlpha,B.premultipliedAlpha),o.setFunc(B.depthFunc),o.setTest(B.depthTest),o.setMask(B.depthWrite),r.setMask(B.colorWrite);const Le=B.stencilWrite;a.setTest(Le),Le&&(a.setMask(B.stencilWriteMask),a.setFunc(B.stencilFunc,B.stencilRef,B.stencilFuncMask),a.setOp(B.stencilFail,B.stencilZFail,B.stencilZPass)),oe(B.polygonOffset,B.polygonOffsetFactor,B.polygonOffsetUnits),B.alphaToCoverage===!0?ae(s.SAMPLE_ALPHA_TO_COVERAGE):ye(s.SAMPLE_ALPHA_TO_COVERAGE)}function se(B){b!==B&&(B?s.frontFace(s.CW):s.frontFace(s.CCW),b=B)}function ie(B){B!==Zu?(ae(s.CULL_FACE),B!==U&&(B===nl?s.cullFace(s.BACK):B===$u?s.cullFace(s.FRONT):s.cullFace(s.FRONT_AND_BACK))):ye(s.CULL_FACE),U=B}function be(B){B!==V&&(J&&s.lineWidth(B),V=B)}function oe(B,ve,Se){B?(ae(s.POLYGON_OFFSET_FILL),(F!==ve||O!==Se)&&(s.polygonOffset(ve,Se),F=ve,O=Se)):ye(s.POLYGON_OFFSET_FILL)}function de(B){B?ae(s.SCISSOR_TEST):ye(s.SCISSOR_TEST)}function Ve(B){B===void 0&&(B=s.TEXTURE0+W-1),Z!==B&&(s.activeTexture(B),Z=B)}function Je(B,ve,Se){Se===void 0&&(Z===null?Se=s.TEXTURE0+W-1:Se=Z);let Le=le[Se];Le===void 0&&(Le={type:void 0,texture:void 0},le[Se]=Le),(Le.type!==B||Le.texture!==ve)&&(Z!==Se&&(s.activeTexture(Se),Z=Se),s.bindTexture(B,ve||te[B]),Le.type=B,Le.texture=ve)}function D(){const B=le[Z];B!==void 0&&B.type!==void 0&&(s.bindTexture(B.type,null),B.type=void 0,B.texture=void 0)}function _(){try{s.compressedTexImage2D(...arguments)}catch(B){console.error("THREE.WebGLState:",B)}}function N(){try{s.compressedTexImage3D(...arguments)}catch(B){console.error("THREE.WebGLState:",B)}}function k(){try{s.texSubImage2D(...arguments)}catch(B){console.error("THREE.WebGLState:",B)}}function X(){try{s.texSubImage3D(...arguments)}catch(B){console.error("THREE.WebGLState:",B)}}function G(){try{s.compressedTexSubImage2D(...arguments)}catch(B){console.error("THREE.WebGLState:",B)}}function ge(){try{s.compressedTexSubImage3D(...arguments)}catch(B){console.error("THREE.WebGLState:",B)}}function ce(){try{s.texStorage2D(...arguments)}catch(B){console.error("THREE.WebGLState:",B)}}function xe(){try{s.texStorage3D(...arguments)}catch(B){console.error("THREE.WebGLState:",B)}}function we(){try{s.texImage2D(...arguments)}catch(B){console.error("THREE.WebGLState:",B)}}function ue(){try{s.texImage3D(...arguments)}catch(B){console.error("THREE.WebGLState:",B)}}function Te(B){me.equals(B)===!1&&(s.scissor(B.x,B.y,B.z,B.w),me.copy(B))}function Be(B){ze.equals(B)===!1&&(s.viewport(B.x,B.y,B.z,B.w),ze.copy(B))}function Re(B,ve){let Se=c.get(ve);Se===void 0&&(Se=new WeakMap,c.set(ve,Se));let Le=Se.get(B);Le===void 0&&(Le=s.getUniformBlockIndex(ve,B.name),Se.set(B,Le))}function Ee(B,ve){const Le=c.get(ve).get(B);l.get(ve)!==Le&&(s.uniformBlockBinding(ve,Le,B.__bindingPointIndex),l.set(ve,Le))}function Xe(){s.disable(s.BLEND),s.disable(s.CULL_FACE),s.disable(s.DEPTH_TEST),s.disable(s.POLYGON_OFFSET_FILL),s.disable(s.SCISSOR_TEST),s.disable(s.STENCIL_TEST),s.disable(s.SAMPLE_ALPHA_TO_COVERAGE),s.blendEquation(s.FUNC_ADD),s.blendFunc(s.ONE,s.ZERO),s.blendFuncSeparate(s.ONE,s.ZERO,s.ONE,s.ZERO),s.blendColor(0,0,0,0),s.colorMask(!0,!0,!0,!0),s.clearColor(0,0,0,0),s.depthMask(!0),s.depthFunc(s.LESS),o.setReversed(!1),s.clearDepth(1),s.stencilMask(4294967295),s.stencilFunc(s.ALWAYS,0,4294967295),s.stencilOp(s.KEEP,s.KEEP,s.KEEP),s.clearStencil(0),s.cullFace(s.BACK),s.frontFace(s.CCW),s.polygonOffset(0,0),s.activeTexture(s.TEXTURE0),s.bindFramebuffer(s.FRAMEBUFFER,null),s.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),s.bindFramebuffer(s.READ_FRAMEBUFFER,null),s.useProgram(null),s.lineWidth(1),s.scissor(0,0,s.canvas.width,s.canvas.height),s.viewport(0,0,s.canvas.width,s.canvas.height),h={},Z=null,le={},u={},d=new WeakMap,f=[],g=null,x=!1,m=null,p=null,M=null,y=null,v=null,w=null,S=null,R=new Ye(0,0,0),I=0,T=!1,b=null,U=null,V=null,F=null,O=null,me.set(0,0,s.canvas.width,s.canvas.height),ze.set(0,0,s.canvas.width,s.canvas.height),r.reset(),o.reset(),a.reset()}return{buffers:{color:r,depth:o,stencil:a},enable:ae,disable:ye,bindFramebuffer:Ie,drawBuffers:A,useProgram:j,setBlending:$,setMaterial:Q,setFlipSided:se,setCullFace:ie,setLineWidth:be,setPolygonOffset:oe,setScissorTest:de,activeTexture:Ve,bindTexture:Je,unbindTexture:D,compressedTexImage2D:_,compressedTexImage3D:N,texImage2D:we,texImage3D:ue,updateUBOMapping:Re,uniformBlockBinding:Ee,texStorage2D:ce,texStorage3D:xe,texSubImage2D:k,texSubImage3D:X,compressedTexSubImage2D:G,compressedTexSubImage3D:ge,scissor:Te,viewport:Be,reset:Xe}}function hx(s,e,t,n,i,r,o){const a=e.has("WEBGL_multisampled_render_to_texture")?e.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Oe,h=new WeakMap;let u;const d=new WeakMap;let f=!1;try{f=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function g(D,_){return f?new OffscreenCanvas(D,_):fr("canvas")}function x(D,_,N){let k=1;const X=Je(D);if((X.width>N||X.height>N)&&(k=N/Math.max(X.width,X.height)),k<1)if(typeof HTMLImageElement<"u"&&D instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&D instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&D instanceof ImageBitmap||typeof VideoFrame<"u"&&D instanceof VideoFrame){const G=Math.floor(k*X.width),ge=Math.floor(k*X.height);u===void 0&&(u=g(G,ge));const ce=_?g(G,ge):u;return ce.width=G,ce.height=ge,ce.getContext("2d").drawImage(D,0,0,G,ge),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+X.width+"x"+X.height+") to ("+G+"x"+ge+")."),ce}else return"data"in D&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+X.width+"x"+X.height+")."),D;return D}function m(D){return D.generateMipmaps}function p(D){s.generateMipmap(D)}function M(D){return D.isWebGLCubeRenderTarget?s.TEXTURE_CUBE_MAP:D.isWebGL3DRenderTarget?s.TEXTURE_3D:D.isWebGLArrayRenderTarget||D.isCompressedArrayTexture?s.TEXTURE_2D_ARRAY:s.TEXTURE_2D}function y(D,_,N,k,X=!1){if(D!==null){if(s[D]!==void 0)return s[D];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+D+"'")}let G=_;if(_===s.RED&&(N===s.FLOAT&&(G=s.R32F),N===s.HALF_FLOAT&&(G=s.R16F),N===s.UNSIGNED_BYTE&&(G=s.R8)),_===s.RED_INTEGER&&(N===s.UNSIGNED_BYTE&&(G=s.R8UI),N===s.UNSIGNED_SHORT&&(G=s.R16UI),N===s.UNSIGNED_INT&&(G=s.R32UI),N===s.BYTE&&(G=s.R8I),N===s.SHORT&&(G=s.R16I),N===s.INT&&(G=s.R32I)),_===s.RG&&(N===s.FLOAT&&(G=s.RG32F),N===s.HALF_FLOAT&&(G=s.RG16F),N===s.UNSIGNED_BYTE&&(G=s.RG8)),_===s.RG_INTEGER&&(N===s.UNSIGNED_BYTE&&(G=s.RG8UI),N===s.UNSIGNED_SHORT&&(G=s.RG16UI),N===s.UNSIGNED_INT&&(G=s.RG32UI),N===s.BYTE&&(G=s.RG8I),N===s.SHORT&&(G=s.RG16I),N===s.INT&&(G=s.RG32I)),_===s.RGB_INTEGER&&(N===s.UNSIGNED_BYTE&&(G=s.RGB8UI),N===s.UNSIGNED_SHORT&&(G=s.RGB16UI),N===s.UNSIGNED_INT&&(G=s.RGB32UI),N===s.BYTE&&(G=s.RGB8I),N===s.SHORT&&(G=s.RGB16I),N===s.INT&&(G=s.RGB32I)),_===s.RGBA_INTEGER&&(N===s.UNSIGNED_BYTE&&(G=s.RGBA8UI),N===s.UNSIGNED_SHORT&&(G=s.RGBA16UI),N===s.UNSIGNED_INT&&(G=s.RGBA32UI),N===s.BYTE&&(G=s.RGBA8I),N===s.SHORT&&(G=s.RGBA16I),N===s.INT&&(G=s.RGBA32I)),_===s.RGB&&(N===s.UNSIGNED_INT_5_9_9_9_REV&&(G=s.RGB9_E5),N===s.UNSIGNED_INT_10F_11F_11F_REV&&(G=s.R11F_G11F_B10F)),_===s.RGBA){const ge=X?uo:ot.getTransfer(k);N===s.FLOAT&&(G=s.RGBA32F),N===s.HALF_FLOAT&&(G=s.RGBA16F),N===s.UNSIGNED_BYTE&&(G=ge===_t?s.SRGB8_ALPHA8:s.RGBA8),N===s.UNSIGNED_SHORT_4_4_4_4&&(G=s.RGBA4),N===s.UNSIGNED_SHORT_5_5_5_1&&(G=s.RGB5_A1)}return(G===s.R16F||G===s.R32F||G===s.RG16F||G===s.RG32F||G===s.RGBA16F||G===s.RGBA32F)&&e.get("EXT_color_buffer_float"),G}function v(D,_){let N;return D?_===null||_===$i||_===cr?N=s.DEPTH24_STENCIL8:_===Pn?N=s.DEPTH32F_STENCIL8:_===ar&&(N=s.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):_===null||_===$i||_===cr?N=s.DEPTH_COMPONENT24:_===Pn?N=s.DEPTH_COMPONENT32F:_===ar&&(N=s.DEPTH_COMPONENT16),N}function w(D,_){return m(D)===!0||D.isFramebufferTexture&&D.minFilter!==$t&&D.minFilter!==pn?Math.log2(Math.max(_.width,_.height))+1:D.mipmaps!==void 0&&D.mipmaps.length>0?D.mipmaps.length:D.isCompressedTexture&&Array.isArray(D.image)?_.mipmaps.length:1}function S(D){const _=D.target;_.removeEventListener("dispose",S),I(_),_.isVideoTexture&&h.delete(_)}function R(D){const _=D.target;_.removeEventListener("dispose",R),b(_)}function I(D){const _=n.get(D);if(_.__webglInit===void 0)return;const N=D.source,k=d.get(N);if(k){const X=k[_.__cacheKey];X.usedTimes--,X.usedTimes===0&&T(D),Object.keys(k).length===0&&d.delete(N)}n.remove(D)}function T(D){const _=n.get(D);s.deleteTexture(_.__webglTexture);const N=D.source,k=d.get(N);delete k[_.__cacheKey],o.memory.textures--}function b(D){const _=n.get(D);if(D.depthTexture&&(D.depthTexture.dispose(),n.remove(D.depthTexture)),D.isWebGLCubeRenderTarget)for(let k=0;k<6;k++){if(Array.isArray(_.__webglFramebuffer[k]))for(let X=0;X<_.__webglFramebuffer[k].length;X++)s.deleteFramebuffer(_.__webglFramebuffer[k][X]);else s.deleteFramebuffer(_.__webglFramebuffer[k]);_.__webglDepthbuffer&&s.deleteRenderbuffer(_.__webglDepthbuffer[k])}else{if(Array.isArray(_.__webglFramebuffer))for(let k=0;k<_.__webglFramebuffer.length;k++)s.deleteFramebuffer(_.__webglFramebuffer[k]);else s.deleteFramebuffer(_.__webglFramebuffer);if(_.__webglDepthbuffer&&s.deleteRenderbuffer(_.__webglDepthbuffer),_.__webglMultisampledFramebuffer&&s.deleteFramebuffer(_.__webglMultisampledFramebuffer),_.__webglColorRenderbuffer)for(let k=0;k<_.__webglColorRenderbuffer.length;k++)_.__webglColorRenderbuffer[k]&&s.deleteRenderbuffer(_.__webglColorRenderbuffer[k]);_.__webglDepthRenderbuffer&&s.deleteRenderbuffer(_.__webglDepthRenderbuffer)}const N=D.textures;for(let k=0,X=N.length;k<X;k++){const G=n.get(N[k]);G.__webglTexture&&(s.deleteTexture(G.__webglTexture),o.memory.textures--),n.remove(N[k])}n.remove(D)}let U=0;function V(){U=0}function F(){const D=U;return D>=i.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+D+" texture units while this GPU supports only "+i.maxTextures),U+=1,D}function O(D){const _=[];return _.push(D.wrapS),_.push(D.wrapT),_.push(D.wrapR||0),_.push(D.magFilter),_.push(D.minFilter),_.push(D.anisotropy),_.push(D.internalFormat),_.push(D.format),_.push(D.type),_.push(D.generateMipmaps),_.push(D.premultiplyAlpha),_.push(D.flipY),_.push(D.unpackAlignment),_.push(D.colorSpace),_.join()}function W(D,_){const N=n.get(D);if(D.isVideoTexture&&de(D),D.isRenderTargetTexture===!1&&D.isExternalTexture!==!0&&D.version>0&&N.__version!==D.version){const k=D.image;if(k===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(k.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{te(N,D,_);return}}else D.isExternalTexture&&(N.__webglTexture=D.sourceTexture?D.sourceTexture:null);t.bindTexture(s.TEXTURE_2D,N.__webglTexture,s.TEXTURE0+_)}function J(D,_){const N=n.get(D);if(D.isRenderTargetTexture===!1&&D.version>0&&N.__version!==D.version){te(N,D,_);return}t.bindTexture(s.TEXTURE_2D_ARRAY,N.__webglTexture,s.TEXTURE0+_)}function H(D,_){const N=n.get(D);if(D.isRenderTargetTexture===!1&&D.version>0&&N.__version!==D.version){te(N,D,_);return}t.bindTexture(s.TEXTURE_3D,N.__webglTexture,s.TEXTURE0+_)}function z(D,_){const N=n.get(D);if(D.version>0&&N.__version!==D.version){ae(N,D,_);return}t.bindTexture(s.TEXTURE_CUBE_MAP,N.__webglTexture,s.TEXTURE0+_)}const Z={[Zi]:s.REPEAT,[Ai]:s.CLAMP_TO_EDGE,[lo]:s.MIRRORED_REPEAT},le={[$t]:s.NEAREST,[Bh]:s.NEAREST_MIPMAP_NEAREST,[$s]:s.NEAREST_MIPMAP_LINEAR,[pn]:s.LINEAR,[eo]:s.LINEAR_MIPMAP_NEAREST,[ri]:s.LINEAR_MIPMAP_LINEAR},re={[Nd]:s.NEVER,[kd]:s.ALWAYS,[Ud]:s.LESS,[Kh]:s.LEQUAL,[Fd]:s.EQUAL,[Bd]:s.GEQUAL,[Od]:s.GREATER,[zd]:s.NOTEQUAL};function _e(D,_){if(_.type===Pn&&e.has("OES_texture_float_linear")===!1&&(_.magFilter===pn||_.magFilter===eo||_.magFilter===$s||_.magFilter===ri||_.minFilter===pn||_.minFilter===eo||_.minFilter===$s||_.minFilter===ri)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),s.texParameteri(D,s.TEXTURE_WRAP_S,Z[_.wrapS]),s.texParameteri(D,s.TEXTURE_WRAP_T,Z[_.wrapT]),(D===s.TEXTURE_3D||D===s.TEXTURE_2D_ARRAY)&&s.texParameteri(D,s.TEXTURE_WRAP_R,Z[_.wrapR]),s.texParameteri(D,s.TEXTURE_MAG_FILTER,le[_.magFilter]),s.texParameteri(D,s.TEXTURE_MIN_FILTER,le[_.minFilter]),_.compareFunction&&(s.texParameteri(D,s.TEXTURE_COMPARE_MODE,s.COMPARE_REF_TO_TEXTURE),s.texParameteri(D,s.TEXTURE_COMPARE_FUNC,re[_.compareFunction])),e.has("EXT_texture_filter_anisotropic")===!0){if(_.magFilter===$t||_.minFilter!==$s&&_.minFilter!==ri||_.type===Pn&&e.has("OES_texture_float_linear")===!1)return;if(_.anisotropy>1||n.get(_).__currentAnisotropy){const N=e.get("EXT_texture_filter_anisotropic");s.texParameterf(D,N.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(_.anisotropy,i.getMaxAnisotropy())),n.get(_).__currentAnisotropy=_.anisotropy}}}function me(D,_){let N=!1;D.__webglInit===void 0&&(D.__webglInit=!0,_.addEventListener("dispose",S));const k=_.source;let X=d.get(k);X===void 0&&(X={},d.set(k,X));const G=O(_);if(G!==D.__cacheKey){X[G]===void 0&&(X[G]={texture:s.createTexture(),usedTimes:0},o.memory.textures++,N=!0),X[G].usedTimes++;const ge=X[D.__cacheKey];ge!==void 0&&(X[D.__cacheKey].usedTimes--,ge.usedTimes===0&&T(_)),D.__cacheKey=G,D.__webglTexture=X[G].texture}return N}function ze(D,_,N){return Math.floor(Math.floor(D/N)/_)}function ke(D,_,N,k){const G=D.updateRanges;if(G.length===0)t.texSubImage2D(s.TEXTURE_2D,0,0,0,_.width,_.height,N,k,_.data);else{G.sort((ue,Te)=>ue.start-Te.start);let ge=0;for(let ue=1;ue<G.length;ue++){const Te=G[ge],Be=G[ue],Re=Te.start+Te.count,Ee=ze(Be.start,_.width,4),Xe=ze(Te.start,_.width,4);Be.start<=Re+1&&Ee===Xe&&ze(Be.start+Be.count-1,_.width,4)===Ee?Te.count=Math.max(Te.count,Be.start+Be.count-Te.start):(++ge,G[ge]=Be)}G.length=ge+1;const ce=s.getParameter(s.UNPACK_ROW_LENGTH),xe=s.getParameter(s.UNPACK_SKIP_PIXELS),we=s.getParameter(s.UNPACK_SKIP_ROWS);s.pixelStorei(s.UNPACK_ROW_LENGTH,_.width);for(let ue=0,Te=G.length;ue<Te;ue++){const Be=G[ue],Re=Math.floor(Be.start/4),Ee=Math.ceil(Be.count/4),Xe=Re%_.width,B=Math.floor(Re/_.width),ve=Ee,Se=1;s.pixelStorei(s.UNPACK_SKIP_PIXELS,Xe),s.pixelStorei(s.UNPACK_SKIP_ROWS,B),t.texSubImage2D(s.TEXTURE_2D,0,Xe,B,ve,Se,N,k,_.data)}D.clearUpdateRanges(),s.pixelStorei(s.UNPACK_ROW_LENGTH,ce),s.pixelStorei(s.UNPACK_SKIP_PIXELS,xe),s.pixelStorei(s.UNPACK_SKIP_ROWS,we)}}function te(D,_,N){let k=s.TEXTURE_2D;(_.isDataArrayTexture||_.isCompressedArrayTexture)&&(k=s.TEXTURE_2D_ARRAY),_.isData3DTexture&&(k=s.TEXTURE_3D);const X=me(D,_),G=_.source;t.bindTexture(k,D.__webglTexture,s.TEXTURE0+N);const ge=n.get(G);if(G.version!==ge.__version||X===!0){t.activeTexture(s.TEXTURE0+N);const ce=ot.getPrimaries(ot.workingColorSpace),xe=_.colorSpace===wi?null:ot.getPrimaries(_.colorSpace),we=_.colorSpace===wi||ce===xe?s.NONE:s.BROWSER_DEFAULT_WEBGL;s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,_.flipY),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),s.pixelStorei(s.UNPACK_ALIGNMENT,_.unpackAlignment),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,we);let ue=x(_.image,!1,i.maxTextureSize);ue=Ve(_,ue);const Te=r.convert(_.format,_.colorSpace),Be=r.convert(_.type);let Re=y(_.internalFormat,Te,Be,_.colorSpace,_.isVideoTexture);_e(k,_);let Ee;const Xe=_.mipmaps,B=_.isVideoTexture!==!0,ve=ge.__version===void 0||X===!0,Se=G.dataReady,Le=w(_,ue);if(_.isDepthTexture)Re=v(_.format===hr,_.type),ve&&(B?t.texStorage2D(s.TEXTURE_2D,1,Re,ue.width,ue.height):t.texImage2D(s.TEXTURE_2D,0,Re,ue.width,ue.height,0,Te,Be,null));else if(_.isDataTexture)if(Xe.length>0){B&&ve&&t.texStorage2D(s.TEXTURE_2D,Le,Re,Xe[0].width,Xe[0].height);for(let pe=0,he=Xe.length;pe<he;pe++)Ee=Xe[pe],B?Se&&t.texSubImage2D(s.TEXTURE_2D,pe,0,0,Ee.width,Ee.height,Te,Be,Ee.data):t.texImage2D(s.TEXTURE_2D,pe,Re,Ee.width,Ee.height,0,Te,Be,Ee.data);_.generateMipmaps=!1}else B?(ve&&t.texStorage2D(s.TEXTURE_2D,Le,Re,ue.width,ue.height),Se&&ke(_,ue,Te,Be)):t.texImage2D(s.TEXTURE_2D,0,Re,ue.width,ue.height,0,Te,Be,ue.data);else if(_.isCompressedTexture)if(_.isCompressedArrayTexture){B&&ve&&t.texStorage3D(s.TEXTURE_2D_ARRAY,Le,Re,Xe[0].width,Xe[0].height,ue.depth);for(let pe=0,he=Xe.length;pe<he;pe++)if(Ee=Xe[pe],_.format!==En)if(Te!==null)if(B){if(Se)if(_.layerUpdates.size>0){const Ne=ql(Ee.width,Ee.height,_.format,_.type);for(const De of _.layerUpdates){const tt=Ee.data.subarray(De*Ne/Ee.data.BYTES_PER_ELEMENT,(De+1)*Ne/Ee.data.BYTES_PER_ELEMENT);t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,pe,0,0,De,Ee.width,Ee.height,1,Te,tt)}_.clearLayerUpdates()}else t.compressedTexSubImage3D(s.TEXTURE_2D_ARRAY,pe,0,0,0,Ee.width,Ee.height,ue.depth,Te,Ee.data)}else t.compressedTexImage3D(s.TEXTURE_2D_ARRAY,pe,Re,Ee.width,Ee.height,ue.depth,0,Ee.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else B?Se&&t.texSubImage3D(s.TEXTURE_2D_ARRAY,pe,0,0,0,Ee.width,Ee.height,ue.depth,Te,Be,Ee.data):t.texImage3D(s.TEXTURE_2D_ARRAY,pe,Re,Ee.width,Ee.height,ue.depth,0,Te,Be,Ee.data)}else{B&&ve&&t.texStorage2D(s.TEXTURE_2D,Le,Re,Xe[0].width,Xe[0].height);for(let pe=0,he=Xe.length;pe<he;pe++)Ee=Xe[pe],_.format!==En?Te!==null?B?Se&&t.compressedTexSubImage2D(s.TEXTURE_2D,pe,0,0,Ee.width,Ee.height,Te,Ee.data):t.compressedTexImage2D(s.TEXTURE_2D,pe,Re,Ee.width,Ee.height,0,Ee.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):B?Se&&t.texSubImage2D(s.TEXTURE_2D,pe,0,0,Ee.width,Ee.height,Te,Be,Ee.data):t.texImage2D(s.TEXTURE_2D,pe,Re,Ee.width,Ee.height,0,Te,Be,Ee.data)}else if(_.isDataArrayTexture)if(B){if(ve&&t.texStorage3D(s.TEXTURE_2D_ARRAY,Le,Re,ue.width,ue.height,ue.depth),Se)if(_.layerUpdates.size>0){const pe=ql(ue.width,ue.height,_.format,_.type);for(const he of _.layerUpdates){const Ne=ue.data.subarray(he*pe/ue.data.BYTES_PER_ELEMENT,(he+1)*pe/ue.data.BYTES_PER_ELEMENT);t.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,he,ue.width,ue.height,1,Te,Be,Ne)}_.clearLayerUpdates()}else t.texSubImage3D(s.TEXTURE_2D_ARRAY,0,0,0,0,ue.width,ue.height,ue.depth,Te,Be,ue.data)}else t.texImage3D(s.TEXTURE_2D_ARRAY,0,Re,ue.width,ue.height,ue.depth,0,Te,Be,ue.data);else if(_.isData3DTexture)B?(ve&&t.texStorage3D(s.TEXTURE_3D,Le,Re,ue.width,ue.height,ue.depth),Se&&t.texSubImage3D(s.TEXTURE_3D,0,0,0,0,ue.width,ue.height,ue.depth,Te,Be,ue.data)):t.texImage3D(s.TEXTURE_3D,0,Re,ue.width,ue.height,ue.depth,0,Te,Be,ue.data);else if(_.isFramebufferTexture){if(ve)if(B)t.texStorage2D(s.TEXTURE_2D,Le,Re,ue.width,ue.height);else{let pe=ue.width,he=ue.height;for(let Ne=0;Ne<Le;Ne++)t.texImage2D(s.TEXTURE_2D,Ne,Re,pe,he,0,Te,Be,null),pe>>=1,he>>=1}}else if(Xe.length>0){if(B&&ve){const pe=Je(Xe[0]);t.texStorage2D(s.TEXTURE_2D,Le,Re,pe.width,pe.height)}for(let pe=0,he=Xe.length;pe<he;pe++)Ee=Xe[pe],B?Se&&t.texSubImage2D(s.TEXTURE_2D,pe,0,0,Te,Be,Ee):t.texImage2D(s.TEXTURE_2D,pe,Re,Te,Be,Ee);_.generateMipmaps=!1}else if(B){if(ve){const pe=Je(ue);t.texStorage2D(s.TEXTURE_2D,Le,Re,pe.width,pe.height)}Se&&t.texSubImage2D(s.TEXTURE_2D,0,0,0,Te,Be,ue)}else t.texImage2D(s.TEXTURE_2D,0,Re,Te,Be,ue);m(_)&&p(k),ge.__version=G.version,_.onUpdate&&_.onUpdate(_)}D.__version=_.version}function ae(D,_,N){if(_.image.length!==6)return;const k=me(D,_),X=_.source;t.bindTexture(s.TEXTURE_CUBE_MAP,D.__webglTexture,s.TEXTURE0+N);const G=n.get(X);if(X.version!==G.__version||k===!0){t.activeTexture(s.TEXTURE0+N);const ge=ot.getPrimaries(ot.workingColorSpace),ce=_.colorSpace===wi?null:ot.getPrimaries(_.colorSpace),xe=_.colorSpace===wi||ge===ce?s.NONE:s.BROWSER_DEFAULT_WEBGL;s.pixelStorei(s.UNPACK_FLIP_Y_WEBGL,_.flipY),s.pixelStorei(s.UNPACK_PREMULTIPLY_ALPHA_WEBGL,_.premultiplyAlpha),s.pixelStorei(s.UNPACK_ALIGNMENT,_.unpackAlignment),s.pixelStorei(s.UNPACK_COLORSPACE_CONVERSION_WEBGL,xe);const we=_.isCompressedTexture||_.image[0].isCompressedTexture,ue=_.image[0]&&_.image[0].isDataTexture,Te=[];for(let he=0;he<6;he++)!we&&!ue?Te[he]=x(_.image[he],!0,i.maxCubemapSize):Te[he]=ue?_.image[he].image:_.image[he],Te[he]=Ve(_,Te[he]);const Be=Te[0],Re=r.convert(_.format,_.colorSpace),Ee=r.convert(_.type),Xe=y(_.internalFormat,Re,Ee,_.colorSpace),B=_.isVideoTexture!==!0,ve=G.__version===void 0||k===!0,Se=X.dataReady;let Le=w(_,Be);_e(s.TEXTURE_CUBE_MAP,_);let pe;if(we){B&&ve&&t.texStorage2D(s.TEXTURE_CUBE_MAP,Le,Xe,Be.width,Be.height);for(let he=0;he<6;he++){pe=Te[he].mipmaps;for(let Ne=0;Ne<pe.length;Ne++){const De=pe[Ne];_.format!==En?Re!==null?B?Se&&t.compressedTexSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+he,Ne,0,0,De.width,De.height,Re,De.data):t.compressedTexImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+he,Ne,Xe,De.width,De.height,0,De.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):B?Se&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+he,Ne,0,0,De.width,De.height,Re,Ee,De.data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+he,Ne,Xe,De.width,De.height,0,Re,Ee,De.data)}}}else{if(pe=_.mipmaps,B&&ve){pe.length>0&&Le++;const he=Je(Te[0]);t.texStorage2D(s.TEXTURE_CUBE_MAP,Le,Xe,he.width,he.height)}for(let he=0;he<6;he++)if(ue){B?Se&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+he,0,0,0,Te[he].width,Te[he].height,Re,Ee,Te[he].data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+he,0,Xe,Te[he].width,Te[he].height,0,Re,Ee,Te[he].data);for(let Ne=0;Ne<pe.length;Ne++){const tt=pe[Ne].image[he].image;B?Se&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+he,Ne+1,0,0,tt.width,tt.height,Re,Ee,tt.data):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+he,Ne+1,Xe,tt.width,tt.height,0,Re,Ee,tt.data)}}else{B?Se&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+he,0,0,0,Re,Ee,Te[he]):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+he,0,Xe,Re,Ee,Te[he]);for(let Ne=0;Ne<pe.length;Ne++){const De=pe[Ne];B?Se&&t.texSubImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+he,Ne+1,0,0,Re,Ee,De.image[he]):t.texImage2D(s.TEXTURE_CUBE_MAP_POSITIVE_X+he,Ne+1,Xe,Re,Ee,De.image[he])}}}m(_)&&p(s.TEXTURE_CUBE_MAP),G.__version=X.version,_.onUpdate&&_.onUpdate(_)}D.__version=_.version}function ye(D,_,N,k,X,G){const ge=r.convert(N.format,N.colorSpace),ce=r.convert(N.type),xe=y(N.internalFormat,ge,ce,N.colorSpace),we=n.get(_),ue=n.get(N);if(ue.__renderTarget=_,!we.__hasExternalTextures){const Te=Math.max(1,_.width>>G),Be=Math.max(1,_.height>>G);X===s.TEXTURE_3D||X===s.TEXTURE_2D_ARRAY?t.texImage3D(X,G,xe,Te,Be,_.depth,0,ge,ce,null):t.texImage2D(X,G,xe,Te,Be,0,ge,ce,null)}t.bindFramebuffer(s.FRAMEBUFFER,D),oe(_)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,k,X,ue.__webglTexture,0,be(_)):(X===s.TEXTURE_2D||X>=s.TEXTURE_CUBE_MAP_POSITIVE_X&&X<=s.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&s.framebufferTexture2D(s.FRAMEBUFFER,k,X,ue.__webglTexture,G),t.bindFramebuffer(s.FRAMEBUFFER,null)}function Ie(D,_,N){if(s.bindRenderbuffer(s.RENDERBUFFER,D),_.depthBuffer){const k=_.depthTexture,X=k&&k.isDepthTexture?k.type:null,G=v(_.stencilBuffer,X),ge=_.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,ce=be(_);oe(_)?a.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,ce,G,_.width,_.height):N?s.renderbufferStorageMultisample(s.RENDERBUFFER,ce,G,_.width,_.height):s.renderbufferStorage(s.RENDERBUFFER,G,_.width,_.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,ge,s.RENDERBUFFER,D)}else{const k=_.textures;for(let X=0;X<k.length;X++){const G=k[X],ge=r.convert(G.format,G.colorSpace),ce=r.convert(G.type),xe=y(G.internalFormat,ge,ce,G.colorSpace),we=be(_);N&&oe(_)===!1?s.renderbufferStorageMultisample(s.RENDERBUFFER,we,xe,_.width,_.height):oe(_)?a.renderbufferStorageMultisampleEXT(s.RENDERBUFFER,we,xe,_.width,_.height):s.renderbufferStorage(s.RENDERBUFFER,xe,_.width,_.height)}}s.bindRenderbuffer(s.RENDERBUFFER,null)}function A(D,_){if(_&&_.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(t.bindFramebuffer(s.FRAMEBUFFER,D),!(_.depthTexture&&_.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");const k=n.get(_.depthTexture);k.__renderTarget=_,(!k.__webglTexture||_.depthTexture.image.width!==_.width||_.depthTexture.image.height!==_.height)&&(_.depthTexture.image.width=_.width,_.depthTexture.image.height=_.height,_.depthTexture.needsUpdate=!0),W(_.depthTexture,0);const X=k.__webglTexture,G=be(_);if(_.depthTexture.format===lr)oe(_)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,s.DEPTH_ATTACHMENT,s.TEXTURE_2D,X,0,G):s.framebufferTexture2D(s.FRAMEBUFFER,s.DEPTH_ATTACHMENT,s.TEXTURE_2D,X,0);else if(_.depthTexture.format===hr)oe(_)?a.framebufferTexture2DMultisampleEXT(s.FRAMEBUFFER,s.DEPTH_STENCIL_ATTACHMENT,s.TEXTURE_2D,X,0,G):s.framebufferTexture2D(s.FRAMEBUFFER,s.DEPTH_STENCIL_ATTACHMENT,s.TEXTURE_2D,X,0);else throw new Error("Unknown depthTexture format")}function j(D){const _=n.get(D),N=D.isWebGLCubeRenderTarget===!0;if(_.__boundDepthTexture!==D.depthTexture){const k=D.depthTexture;if(_.__depthDisposeCallback&&_.__depthDisposeCallback(),k){const X=()=>{delete _.__boundDepthTexture,delete _.__depthDisposeCallback,k.removeEventListener("dispose",X)};k.addEventListener("dispose",X),_.__depthDisposeCallback=X}_.__boundDepthTexture=k}if(D.depthTexture&&!_.__autoAllocateDepthBuffer){if(N)throw new Error("target.depthTexture not supported in Cube render targets");const k=D.texture.mipmaps;k&&k.length>0?A(_.__webglFramebuffer[0],D):A(_.__webglFramebuffer,D)}else if(N){_.__webglDepthbuffer=[];for(let k=0;k<6;k++)if(t.bindFramebuffer(s.FRAMEBUFFER,_.__webglFramebuffer[k]),_.__webglDepthbuffer[k]===void 0)_.__webglDepthbuffer[k]=s.createRenderbuffer(),Ie(_.__webglDepthbuffer[k],D,!1);else{const X=D.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,G=_.__webglDepthbuffer[k];s.bindRenderbuffer(s.RENDERBUFFER,G),s.framebufferRenderbuffer(s.FRAMEBUFFER,X,s.RENDERBUFFER,G)}}else{const k=D.texture.mipmaps;if(k&&k.length>0?t.bindFramebuffer(s.FRAMEBUFFER,_.__webglFramebuffer[0]):t.bindFramebuffer(s.FRAMEBUFFER,_.__webglFramebuffer),_.__webglDepthbuffer===void 0)_.__webglDepthbuffer=s.createRenderbuffer(),Ie(_.__webglDepthbuffer,D,!1);else{const X=D.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,G=_.__webglDepthbuffer;s.bindRenderbuffer(s.RENDERBUFFER,G),s.framebufferRenderbuffer(s.FRAMEBUFFER,X,s.RENDERBUFFER,G)}}t.bindFramebuffer(s.FRAMEBUFFER,null)}function Y(D,_,N){const k=n.get(D);_!==void 0&&ye(k.__webglFramebuffer,D,D.texture,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,0),N!==void 0&&j(D)}function E(D){const _=D.texture,N=n.get(D),k=n.get(_);D.addEventListener("dispose",R);const X=D.textures,G=D.isWebGLCubeRenderTarget===!0,ge=X.length>1;if(ge||(k.__webglTexture===void 0&&(k.__webglTexture=s.createTexture()),k.__version=_.version,o.memory.textures++),G){N.__webglFramebuffer=[];for(let ce=0;ce<6;ce++)if(_.mipmaps&&_.mipmaps.length>0){N.__webglFramebuffer[ce]=[];for(let xe=0;xe<_.mipmaps.length;xe++)N.__webglFramebuffer[ce][xe]=s.createFramebuffer()}else N.__webglFramebuffer[ce]=s.createFramebuffer()}else{if(_.mipmaps&&_.mipmaps.length>0){N.__webglFramebuffer=[];for(let ce=0;ce<_.mipmaps.length;ce++)N.__webglFramebuffer[ce]=s.createFramebuffer()}else N.__webglFramebuffer=s.createFramebuffer();if(ge)for(let ce=0,xe=X.length;ce<xe;ce++){const we=n.get(X[ce]);we.__webglTexture===void 0&&(we.__webglTexture=s.createTexture(),o.memory.textures++)}if(D.samples>0&&oe(D)===!1){N.__webglMultisampledFramebuffer=s.createFramebuffer(),N.__webglColorRenderbuffer=[],t.bindFramebuffer(s.FRAMEBUFFER,N.__webglMultisampledFramebuffer);for(let ce=0;ce<X.length;ce++){const xe=X[ce];N.__webglColorRenderbuffer[ce]=s.createRenderbuffer(),s.bindRenderbuffer(s.RENDERBUFFER,N.__webglColorRenderbuffer[ce]);const we=r.convert(xe.format,xe.colorSpace),ue=r.convert(xe.type),Te=y(xe.internalFormat,we,ue,xe.colorSpace,D.isXRRenderTarget===!0),Be=be(D);s.renderbufferStorageMultisample(s.RENDERBUFFER,Be,Te,D.width,D.height),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+ce,s.RENDERBUFFER,N.__webglColorRenderbuffer[ce])}s.bindRenderbuffer(s.RENDERBUFFER,null),D.depthBuffer&&(N.__webglDepthRenderbuffer=s.createRenderbuffer(),Ie(N.__webglDepthRenderbuffer,D,!0)),t.bindFramebuffer(s.FRAMEBUFFER,null)}}if(G){t.bindTexture(s.TEXTURE_CUBE_MAP,k.__webglTexture),_e(s.TEXTURE_CUBE_MAP,_);for(let ce=0;ce<6;ce++)if(_.mipmaps&&_.mipmaps.length>0)for(let xe=0;xe<_.mipmaps.length;xe++)ye(N.__webglFramebuffer[ce][xe],D,_,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+ce,xe);else ye(N.__webglFramebuffer[ce],D,_,s.COLOR_ATTACHMENT0,s.TEXTURE_CUBE_MAP_POSITIVE_X+ce,0);m(_)&&p(s.TEXTURE_CUBE_MAP),t.unbindTexture()}else if(ge){for(let ce=0,xe=X.length;ce<xe;ce++){const we=X[ce],ue=n.get(we);let Te=s.TEXTURE_2D;(D.isWebGL3DRenderTarget||D.isWebGLArrayRenderTarget)&&(Te=D.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),t.bindTexture(Te,ue.__webglTexture),_e(Te,we),ye(N.__webglFramebuffer,D,we,s.COLOR_ATTACHMENT0+ce,Te,0),m(we)&&p(Te)}t.unbindTexture()}else{let ce=s.TEXTURE_2D;if((D.isWebGL3DRenderTarget||D.isWebGLArrayRenderTarget)&&(ce=D.isWebGL3DRenderTarget?s.TEXTURE_3D:s.TEXTURE_2D_ARRAY),t.bindTexture(ce,k.__webglTexture),_e(ce,_),_.mipmaps&&_.mipmaps.length>0)for(let xe=0;xe<_.mipmaps.length;xe++)ye(N.__webglFramebuffer[xe],D,_,s.COLOR_ATTACHMENT0,ce,xe);else ye(N.__webglFramebuffer,D,_,s.COLOR_ATTACHMENT0,ce,0);m(_)&&p(ce),t.unbindTexture()}D.depthBuffer&&j(D)}function $(D){const _=D.textures;for(let N=0,k=_.length;N<k;N++){const X=_[N];if(m(X)){const G=M(D),ge=n.get(X).__webglTexture;t.bindTexture(G,ge),p(G),t.unbindTexture()}}}const Q=[],se=[];function ie(D){if(D.samples>0){if(oe(D)===!1){const _=D.textures,N=D.width,k=D.height;let X=s.COLOR_BUFFER_BIT;const G=D.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT,ge=n.get(D),ce=_.length>1;if(ce)for(let we=0;we<_.length;we++)t.bindFramebuffer(s.FRAMEBUFFER,ge.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+we,s.RENDERBUFFER,null),t.bindFramebuffer(s.FRAMEBUFFER,ge.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+we,s.TEXTURE_2D,null,0);t.bindFramebuffer(s.READ_FRAMEBUFFER,ge.__webglMultisampledFramebuffer);const xe=D.texture.mipmaps;xe&&xe.length>0?t.bindFramebuffer(s.DRAW_FRAMEBUFFER,ge.__webglFramebuffer[0]):t.bindFramebuffer(s.DRAW_FRAMEBUFFER,ge.__webglFramebuffer);for(let we=0;we<_.length;we++){if(D.resolveDepthBuffer&&(D.depthBuffer&&(X|=s.DEPTH_BUFFER_BIT),D.stencilBuffer&&D.resolveStencilBuffer&&(X|=s.STENCIL_BUFFER_BIT)),ce){s.framebufferRenderbuffer(s.READ_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.RENDERBUFFER,ge.__webglColorRenderbuffer[we]);const ue=n.get(_[we]).__webglTexture;s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0,s.TEXTURE_2D,ue,0)}s.blitFramebuffer(0,0,N,k,0,0,N,k,X,s.NEAREST),l===!0&&(Q.length=0,se.length=0,Q.push(s.COLOR_ATTACHMENT0+we),D.depthBuffer&&D.resolveDepthBuffer===!1&&(Q.push(G),se.push(G),s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,se)),s.invalidateFramebuffer(s.READ_FRAMEBUFFER,Q))}if(t.bindFramebuffer(s.READ_FRAMEBUFFER,null),t.bindFramebuffer(s.DRAW_FRAMEBUFFER,null),ce)for(let we=0;we<_.length;we++){t.bindFramebuffer(s.FRAMEBUFFER,ge.__webglMultisampledFramebuffer),s.framebufferRenderbuffer(s.FRAMEBUFFER,s.COLOR_ATTACHMENT0+we,s.RENDERBUFFER,ge.__webglColorRenderbuffer[we]);const ue=n.get(_[we]).__webglTexture;t.bindFramebuffer(s.FRAMEBUFFER,ge.__webglFramebuffer),s.framebufferTexture2D(s.DRAW_FRAMEBUFFER,s.COLOR_ATTACHMENT0+we,s.TEXTURE_2D,ue,0)}t.bindFramebuffer(s.DRAW_FRAMEBUFFER,ge.__webglMultisampledFramebuffer)}else if(D.depthBuffer&&D.resolveDepthBuffer===!1&&l){const _=D.stencilBuffer?s.DEPTH_STENCIL_ATTACHMENT:s.DEPTH_ATTACHMENT;s.invalidateFramebuffer(s.DRAW_FRAMEBUFFER,[_])}}}function be(D){return Math.min(i.maxSamples,D.samples)}function oe(D){const _=n.get(D);return D.samples>0&&e.has("WEBGL_multisampled_render_to_texture")===!0&&_.__useRenderToTexture!==!1}function de(D){const _=o.render.frame;h.get(D)!==_&&(h.set(D,_),D.update())}function Ve(D,_){const N=D.colorSpace,k=D.format,X=D.type;return D.isCompressedTexture===!0||D.isVideoTexture===!0||N!==Qt&&N!==wi&&(ot.getTransfer(N)===_t?(k!==En||X!==Gn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",N)),_}function Je(D){return typeof HTMLImageElement<"u"&&D instanceof HTMLImageElement?(c.width=D.naturalWidth||D.width,c.height=D.naturalHeight||D.height):typeof VideoFrame<"u"&&D instanceof VideoFrame?(c.width=D.displayWidth,c.height=D.displayHeight):(c.width=D.width,c.height=D.height),c}this.allocateTextureUnit=F,this.resetTextureUnits=V,this.setTexture2D=W,this.setTexture2DArray=J,this.setTexture3D=H,this.setTextureCube=z,this.rebindTextures=Y,this.setupRenderTarget=E,this.updateRenderTargetMipmap=$,this.updateMultisampleRenderTarget=ie,this.setupDepthRenderbuffer=j,this.setupFrameBufferTexture=ye,this.useMultisampledRTT=oe}function ux(s,e){function t(n,i=wi){let r;const o=ot.getTransfer(i);if(n===Gn)return s.UNSIGNED_BYTE;if(n===wc)return s.UNSIGNED_SHORT_4_4_4_4;if(n===Ac)return s.UNSIGNED_SHORT_5_5_5_1;if(n===Vh)return s.UNSIGNED_INT_5_9_9_9_REV;if(n===Gh)return s.UNSIGNED_INT_10F_11F_11F_REV;if(n===kh)return s.BYTE;if(n===Hh)return s.SHORT;if(n===ar)return s.UNSIGNED_SHORT;if(n===Tc)return s.INT;if(n===$i)return s.UNSIGNED_INT;if(n===Pn)return s.FLOAT;if(n===_r)return s.HALF_FLOAT;if(n===Wh)return s.ALPHA;if(n===Xh)return s.RGB;if(n===En)return s.RGBA;if(n===lr)return s.DEPTH_COMPONENT;if(n===hr)return s.DEPTH_STENCIL;if(n===Rc)return s.RED;if(n===Cc)return s.RED_INTEGER;if(n===qh)return s.RG;if(n===Ic)return s.RG_INTEGER;if(n===Pc)return s.RGBA_INTEGER;if(n===to||n===no||n===io||n===so)if(o===_t)if(r=e.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===to)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===no)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===io)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===so)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=e.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===to)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===no)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===io)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===so)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Na||n===Ua||n===Fa||n===Oa)if(r=e.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===Na)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Ua)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Fa)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===Oa)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===za||n===Ba||n===ka)if(r=e.get("WEBGL_compressed_texture_etc"),r!==null){if(n===za||n===Ba)return o===_t?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===ka)return o===_t?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===Ha||n===Va||n===Ga||n===Wa||n===Xa||n===qa||n===Ya||n===ja||n===Ka||n===Ja||n===Za||n===$a||n===Qa||n===ec)if(r=e.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Ha)return o===_t?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Va)return o===_t?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Ga)return o===_t?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===Wa)return o===_t?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===Xa)return o===_t?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===qa)return o===_t?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Ya)return o===_t?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===ja)return o===_t?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Ka)return o===_t?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===Ja)return o===_t?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Za)return o===_t?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===$a)return o===_t?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===Qa)return o===_t?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===ec)return o===_t?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===tc||n===nc||n===ic)if(r=e.get("EXT_texture_compression_bptc"),r!==null){if(n===tc)return o===_t?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===nc)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===ic)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===sc||n===rc||n===oc||n===ac)if(r=e.get("EXT_texture_compression_rgtc"),r!==null){if(n===sc)return r.COMPRESSED_RED_RGTC1_EXT;if(n===rc)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===oc)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===ac)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===cr?s.UNSIGNED_INT_24_8:s[n]!==void 0?s[n]:null}return{convert:t}}const dx=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,fx=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`;class px{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(e,t){if(this.texture===null){const n=new uu(e.texture);(e.depthNear!==t.depthNear||e.depthFar!==t.depthFar)&&(this.depthNear=e.depthNear,this.depthFar=e.depthFar),this.texture=n}}getMesh(e){if(this.texture!==null&&this.mesh===null){const t=e.cameras[0].viewport,n=new Ni({vertexShader:dx,fragmentShader:fx,uniforms:{depthColor:{value:this.texture},depthWidth:{value:t.z},depthHeight:{value:t.w}}});this.mesh=new Fe(new es(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}}class mx extends ts{constructor(e,t){super();const n=this;let i=null,r=1,o=null,a="local-floor",l=1,c=null,h=null,u=null,d=null,f=null,g=null;const x=typeof XRWebGLBinding<"u",m=new px,p={},M=t.getContextAttributes();let y=null,v=null;const w=[],S=[],R=new Oe;let I=null;const T=new Zt;T.viewport=new ht;const b=new Zt;b.viewport=new ht;const U=[T,b],V=new Sp;let F=null,O=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(te){let ae=w[te];return ae===void 0&&(ae=new Zo,w[te]=ae),ae.getTargetRaySpace()},this.getControllerGrip=function(te){let ae=w[te];return ae===void 0&&(ae=new Zo,w[te]=ae),ae.getGripSpace()},this.getHand=function(te){let ae=w[te];return ae===void 0&&(ae=new Zo,w[te]=ae),ae.getHandSpace()};function W(te){const ae=S.indexOf(te.inputSource);if(ae===-1)return;const ye=w[ae];ye!==void 0&&(ye.update(te.inputSource,te.frame,c||o),ye.dispatchEvent({type:te.type,data:te.inputSource}))}function J(){i.removeEventListener("select",W),i.removeEventListener("selectstart",W),i.removeEventListener("selectend",W),i.removeEventListener("squeeze",W),i.removeEventListener("squeezestart",W),i.removeEventListener("squeezeend",W),i.removeEventListener("end",J),i.removeEventListener("inputsourceschange",H);for(let te=0;te<w.length;te++){const ae=S[te];ae!==null&&(S[te]=null,w[te].disconnect(ae))}F=null,O=null,m.reset();for(const te in p)delete p[te];e.setRenderTarget(y),f=null,d=null,u=null,i=null,v=null,ke.stop(),n.isPresenting=!1,e.setPixelRatio(I),e.setSize(R.width,R.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(te){r=te,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(te){a=te,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||o},this.setReferenceSpace=function(te){c=te},this.getBaseLayer=function(){return d!==null?d:f},this.getBinding=function(){return u===null&&x&&(u=new XRWebGLBinding(i,t)),u},this.getFrame=function(){return g},this.getSession=function(){return i},this.setSession=async function(te){if(i=te,i!==null){if(y=e.getRenderTarget(),i.addEventListener("select",W),i.addEventListener("selectstart",W),i.addEventListener("selectend",W),i.addEventListener("squeeze",W),i.addEventListener("squeezestart",W),i.addEventListener("squeezeend",W),i.addEventListener("end",J),i.addEventListener("inputsourceschange",H),M.xrCompatible!==!0&&await t.makeXRCompatible(),I=e.getPixelRatio(),e.getSize(R),x&&"createProjectionLayer"in XRWebGLBinding.prototype){let ye=null,Ie=null,A=null;M.depth&&(A=M.stencil?t.DEPTH24_STENCIL8:t.DEPTH_COMPONENT24,ye=M.stencil?hr:lr,Ie=M.stencil?cr:$i);const j={colorFormat:t.RGBA8,depthFormat:A,scaleFactor:r};u=this.getBinding(),d=u.createProjectionLayer(j),i.updateRenderState({layers:[d]}),e.setPixelRatio(1),e.setSize(d.textureWidth,d.textureHeight,!1),v=new Qi(d.textureWidth,d.textureHeight,{format:En,type:Gn,depthTexture:new hu(d.textureWidth,d.textureHeight,Ie,void 0,void 0,void 0,void 0,void 0,void 0,ye),stencilBuffer:M.stencil,colorSpace:e.outputColorSpace,samples:M.antialias?4:0,resolveDepthBuffer:d.ignoreDepthValues===!1,resolveStencilBuffer:d.ignoreDepthValues===!1})}else{const ye={antialias:M.antialias,alpha:!0,depth:M.depth,stencil:M.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(i,t,ye),i.updateRenderState({baseLayer:f}),e.setPixelRatio(1),e.setSize(f.framebufferWidth,f.framebufferHeight,!1),v=new Qi(f.framebufferWidth,f.framebufferHeight,{format:En,type:Gn,colorSpace:e.outputColorSpace,stencilBuffer:M.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}v.isXRRenderTarget=!0,this.setFoveation(l),c=null,o=await i.requestReferenceSpace(a),ke.setContext(i),ke.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(i!==null)return i.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function H(te){for(let ae=0;ae<te.removed.length;ae++){const ye=te.removed[ae],Ie=S.indexOf(ye);Ie>=0&&(S[Ie]=null,w[Ie].disconnect(ye))}for(let ae=0;ae<te.added.length;ae++){const ye=te.added[ae];let Ie=S.indexOf(ye);if(Ie===-1){for(let j=0;j<w.length;j++)if(j>=S.length){S.push(ye),Ie=j;break}else if(S[j]===null){S[j]=ye,Ie=j;break}if(Ie===-1)break}const A=w[Ie];A&&A.connect(ye)}}const z=new P,Z=new P;function le(te,ae,ye){z.setFromMatrixPosition(ae.matrixWorld),Z.setFromMatrixPosition(ye.matrixWorld);const Ie=z.distanceTo(Z),A=ae.projectionMatrix.elements,j=ye.projectionMatrix.elements,Y=A[14]/(A[10]-1),E=A[14]/(A[10]+1),$=(A[9]+1)/A[5],Q=(A[9]-1)/A[5],se=(A[8]-1)/A[0],ie=(j[8]+1)/j[0],be=Y*se,oe=Y*ie,de=Ie/(-se+ie),Ve=de*-se;if(ae.matrixWorld.decompose(te.position,te.quaternion,te.scale),te.translateX(Ve),te.translateZ(de),te.matrixWorld.compose(te.position,te.quaternion,te.scale),te.matrixWorldInverse.copy(te.matrixWorld).invert(),A[10]===-1)te.projectionMatrix.copy(ae.projectionMatrix),te.projectionMatrixInverse.copy(ae.projectionMatrixInverse);else{const Je=Y+de,D=E+de,_=be-Ve,N=oe+(Ie-Ve),k=$*E/D*Je,X=Q*E/D*Je;te.projectionMatrix.makePerspective(_,N,k,X,Je,D),te.projectionMatrixInverse.copy(te.projectionMatrix).invert()}}function re(te,ae){ae===null?te.matrixWorld.copy(te.matrix):te.matrixWorld.multiplyMatrices(ae.matrixWorld,te.matrix),te.matrixWorldInverse.copy(te.matrixWorld).invert()}this.updateCamera=function(te){if(i===null)return;let ae=te.near,ye=te.far;m.texture!==null&&(m.depthNear>0&&(ae=m.depthNear),m.depthFar>0&&(ye=m.depthFar)),V.near=b.near=T.near=ae,V.far=b.far=T.far=ye,(F!==V.near||O!==V.far)&&(i.updateRenderState({depthNear:V.near,depthFar:V.far}),F=V.near,O=V.far),V.layers.mask=te.layers.mask|6,T.layers.mask=V.layers.mask&3,b.layers.mask=V.layers.mask&5;const Ie=te.parent,A=V.cameras;re(V,Ie);for(let j=0;j<A.length;j++)re(A[j],Ie);A.length===2?le(V,T,b):V.projectionMatrix.copy(T.projectionMatrix),_e(te,V,Ie)};function _e(te,ae,ye){ye===null?te.matrix.copy(ae.matrixWorld):(te.matrix.copy(ye.matrixWorld),te.matrix.invert(),te.matrix.multiply(ae.matrixWorld)),te.matrix.decompose(te.position,te.quaternion,te.scale),te.updateMatrixWorld(!0),te.projectionMatrix.copy(ae.projectionMatrix),te.projectionMatrixInverse.copy(ae.projectionMatrixInverse),te.isPerspectiveCamera&&(te.fov=Cs*2*Math.atan(1/te.projectionMatrix.elements[5]),te.zoom=1)}this.getCamera=function(){return V},this.getFoveation=function(){if(!(d===null&&f===null))return l},this.setFoveation=function(te){l=te,d!==null&&(d.fixedFoveation=te),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=te)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(V)},this.getCameraTexture=function(te){return p[te]};let me=null;function ze(te,ae){if(h=ae.getViewerPose(c||o),g=ae,h!==null){const ye=h.views;f!==null&&(e.setRenderTargetFramebuffer(v,f.framebuffer),e.setRenderTarget(v));let Ie=!1;ye.length!==V.cameras.length&&(V.cameras.length=0,Ie=!0);for(let E=0;E<ye.length;E++){const $=ye[E];let Q=null;if(f!==null)Q=f.getViewport($);else{const ie=u.getViewSubImage(d,$);Q=ie.viewport,E===0&&(e.setRenderTargetTextures(v,ie.colorTexture,ie.depthStencilTexture),e.setRenderTarget(v))}let se=U[E];se===void 0&&(se=new Zt,se.layers.enable(E),se.viewport=new ht,U[E]=se),se.matrix.fromArray($.transform.matrix),se.matrix.decompose(se.position,se.quaternion,se.scale),se.projectionMatrix.fromArray($.projectionMatrix),se.projectionMatrixInverse.copy(se.projectionMatrix).invert(),se.viewport.set(Q.x,Q.y,Q.width,Q.height),E===0&&(V.matrix.copy(se.matrix),V.matrix.decompose(V.position,V.quaternion,V.scale)),Ie===!0&&V.cameras.push(se)}const A=i.enabledFeatures;if(A&&A.includes("depth-sensing")&&i.depthUsage=="gpu-optimized"&&x){u=n.getBinding();const E=u.getDepthInformation(ye[0]);E&&E.isValid&&E.texture&&m.init(E,i.renderState)}if(A&&A.includes("camera-access")&&x){e.state.unbindTexture(),u=n.getBinding();for(let E=0;E<ye.length;E++){const $=ye[E].camera;if($){let Q=p[$];Q||(Q=new uu,p[$]=Q);const se=u.getCameraImage($);Q.sourceTexture=se}}}}for(let ye=0;ye<w.length;ye++){const Ie=S[ye],A=w[ye];Ie!==null&&A!==void 0&&A.update(Ie,ae,c||o)}me&&me(te,ae),ae.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:ae}),g=null}const ke=new vu;ke.setAnimationLoop(ze),this.setAnimationLoop=function(te){me=te},this.dispose=function(){}}}const Gi=new Wn,gx=new Ze;function _x(s,e){function t(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function n(m,p){p.color.getRGB(m.fogColor.value,nu(s)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function i(m,p,M,y,v){p.isMeshBasicMaterial||p.isMeshLambertMaterial?r(m,p):p.isMeshToonMaterial?(r(m,p),u(m,p)):p.isMeshPhongMaterial?(r(m,p),h(m,p)):p.isMeshStandardMaterial?(r(m,p),d(m,p),p.isMeshPhysicalMaterial&&f(m,p,v)):p.isMeshMatcapMaterial?(r(m,p),g(m,p)):p.isMeshDepthMaterial?r(m,p):p.isMeshDistanceMaterial?(r(m,p),x(m,p)):p.isMeshNormalMaterial?r(m,p):p.isLineBasicMaterial?(o(m,p),p.isLineDashedMaterial&&a(m,p)):p.isPointsMaterial?l(m,p,M,y):p.isSpriteMaterial?c(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,t(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===tn&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,t(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===tn&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,t(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,t(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,t(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);const M=e.get(p),y=M.envMap,v=M.envMapRotation;y&&(m.envMap.value=y,Gi.copy(v),Gi.x*=-1,Gi.y*=-1,Gi.z*=-1,y.isCubeTexture&&y.isRenderTargetTexture===!1&&(Gi.y*=-1,Gi.z*=-1),m.envMapRotation.value.setFromMatrix4(gx.makeRotationFromEuler(Gi)),m.flipEnvMap.value=y.isCubeTexture&&y.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap&&(m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,t(p.lightMap,m.lightMapTransform)),p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,t(p.aoMap,m.aoMapTransform))}function o(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform))}function a(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function l(m,p,M,y){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*M,m.scale.value=y*.5,p.map&&(m.map.value=p.map,t(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function c(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,t(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,t(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function h(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function u(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function d(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,t(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,t(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function f(m,p,M){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,t(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,t(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,t(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,t(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,t(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===tn&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,t(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,t(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=M.texture,m.transmissionSamplerSize.value.set(M.width,M.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,t(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,t(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,t(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,t(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,t(p.specularIntensityMap,m.specularIntensityMapTransform))}function g(m,p){p.matcap&&(m.matcap.value=p.matcap)}function x(m,p){const M=e.get(p).light;m.referencePosition.value.setFromMatrixPosition(M.matrixWorld),m.nearDistance.value=M.shadow.camera.near,m.farDistance.value=M.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:i}}function xx(s,e,t,n){let i={},r={},o=[];const a=s.getParameter(s.MAX_UNIFORM_BUFFER_BINDINGS);function l(M,y){const v=y.program;n.uniformBlockBinding(M,v)}function c(M,y){let v=i[M.id];v===void 0&&(g(M),v=h(M),i[M.id]=v,M.addEventListener("dispose",m));const w=y.program;n.updateUBOMapping(M,w);const S=e.render.frame;r[M.id]!==S&&(d(M),r[M.id]=S)}function h(M){const y=u();M.__bindingPointIndex=y;const v=s.createBuffer(),w=M.__size,S=M.usage;return s.bindBuffer(s.UNIFORM_BUFFER,v),s.bufferData(s.UNIFORM_BUFFER,w,S),s.bindBuffer(s.UNIFORM_BUFFER,null),s.bindBufferBase(s.UNIFORM_BUFFER,y,v),v}function u(){for(let M=0;M<a;M++)if(o.indexOf(M)===-1)return o.push(M),M;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function d(M){const y=i[M.id],v=M.uniforms,w=M.__cache;s.bindBuffer(s.UNIFORM_BUFFER,y);for(let S=0,R=v.length;S<R;S++){const I=Array.isArray(v[S])?v[S]:[v[S]];for(let T=0,b=I.length;T<b;T++){const U=I[T];if(f(U,S,T,w)===!0){const V=U.__offset,F=Array.isArray(U.value)?U.value:[U.value];let O=0;for(let W=0;W<F.length;W++){const J=F[W],H=x(J);typeof J=="number"||typeof J=="boolean"?(U.__data[0]=J,s.bufferSubData(s.UNIFORM_BUFFER,V+O,U.__data)):J.isMatrix3?(U.__data[0]=J.elements[0],U.__data[1]=J.elements[1],U.__data[2]=J.elements[2],U.__data[3]=0,U.__data[4]=J.elements[3],U.__data[5]=J.elements[4],U.__data[6]=J.elements[5],U.__data[7]=0,U.__data[8]=J.elements[6],U.__data[9]=J.elements[7],U.__data[10]=J.elements[8],U.__data[11]=0):(J.toArray(U.__data,O),O+=H.storage/Float32Array.BYTES_PER_ELEMENT)}s.bufferSubData(s.UNIFORM_BUFFER,V,U.__data)}}}s.bindBuffer(s.UNIFORM_BUFFER,null)}function f(M,y,v,w){const S=M.value,R=y+"_"+v;if(w[R]===void 0)return typeof S=="number"||typeof S=="boolean"?w[R]=S:w[R]=S.clone(),!0;{const I=w[R];if(typeof S=="number"||typeof S=="boolean"){if(I!==S)return w[R]=S,!0}else if(I.equals(S)===!1)return I.copy(S),!0}return!1}function g(M){const y=M.uniforms;let v=0;const w=16;for(let R=0,I=y.length;R<I;R++){const T=Array.isArray(y[R])?y[R]:[y[R]];for(let b=0,U=T.length;b<U;b++){const V=T[b],F=Array.isArray(V.value)?V.value:[V.value];for(let O=0,W=F.length;O<W;O++){const J=F[O],H=x(J),z=v%w,Z=z%H.boundary,le=z+Z;v+=Z,le!==0&&w-le<H.storage&&(v+=w-le),V.__data=new Float32Array(H.storage/Float32Array.BYTES_PER_ELEMENT),V.__offset=v,v+=H.storage}}}const S=v%w;return S>0&&(v+=w-S),M.__size=v,M.__cache={},this}function x(M){const y={boundary:0,storage:0};return typeof M=="number"||typeof M=="boolean"?(y.boundary=4,y.storage=4):M.isVector2?(y.boundary=8,y.storage=8):M.isVector3||M.isColor?(y.boundary=16,y.storage=12):M.isVector4?(y.boundary=16,y.storage=16):M.isMatrix3?(y.boundary=48,y.storage=48):M.isMatrix4?(y.boundary=64,y.storage=64):M.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",M),y}function m(M){const y=M.target;y.removeEventListener("dispose",m);const v=o.indexOf(y.__bindingPointIndex);o.splice(v,1),s.deleteBuffer(i[y.id]),delete i[y.id],delete r[y.id]}function p(){for(const M in i)s.deleteBuffer(i[M]);o=[],i={},r={}}return{bind:l,update:c,dispose:p}}class vx{constructor(e={}){const{canvas:t=sf(),context:n=null,depth:i=!0,stencil:r=!1,alpha:o=!1,antialias:a=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:h="default",failIfMajorPerformanceCaveat:u=!1,reversedDepthBuffer:d=!1}=e;this.isWebGLRenderer=!0;let f;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");f=n.getContextAttributes().alpha}else f=o;const g=new Uint32Array(4),x=new Int32Array(4);let m=null,p=null;const M=[],y=[];this.domElement=t,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Li,this.toneMappingExposure=1,this.transmissionResolutionScale=1;const v=this;let w=!1;this._outputColorSpace=Mt;let S=0,R=0,I=null,T=-1,b=null;const U=new ht,V=new ht;let F=null;const O=new Ye(0);let W=0,J=t.width,H=t.height,z=1,Z=null,le=null;const re=new ht(0,0,J,H),_e=new ht(0,0,J,H);let me=!1;const ze=new bo;let ke=!1,te=!1;const ae=new Ze,ye=new P,Ie=new ht,A={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0};let j=!1;function Y(){return I===null?z:1}let E=n;function $(C,q){return t.getContext(C,q)}try{const C={alpha:!0,depth:i,stencil:r,antialias:a,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:h,failIfMajorPerformanceCaveat:u};if("setAttribute"in t&&t.setAttribute("data-engine",`three.js r${Ec}`),t.addEventListener("webglcontextlost",Se,!1),t.addEventListener("webglcontextrestored",Le,!1),t.addEventListener("webglcontextcreationerror",pe,!1),E===null){const q="webgl2";if(E=$(q,C),E===null)throw $(q)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(C){throw console.error("THREE.WebGLRenderer: "+C.message),C}let Q,se,ie,be,oe,de,Ve,Je,D,_,N,k,X,G,ge,ce,xe,we,ue,Te,Be,Re,Ee,Xe;function B(){Q=new Cg(E),Q.init(),Re=new ux(E,Q),se=new bg(E,Q,e,Re),ie=new lx(E,Q),se.reversedDepthBuffer&&d&&ie.buffers.depth.setReversed(!0),be=new Lg(E),oe=new J_,de=new hx(E,Q,ie,oe,se,Re,be),Ve=new Eg(v),Je=new Rg(v),D=new zp(E),Ee=new Mg(E,D),_=new Ig(E,D,be,Ee),N=new Ng(E,_,D,be),ue=new Dg(E,se,de),ce=new Sg(oe),k=new K_(v,Ve,Je,Q,se,Ee,ce),X=new _x(v,oe),G=new $_,ge=new sx(Q),we=new vg(v,Ve,Je,ie,N,f,l),xe=new ax(v,N,se),Xe=new xx(E,be,se,ie),Te=new yg(E,Q,be),Be=new Pg(E,Q,be),be.programs=k.programs,v.capabilities=se,v.extensions=Q,v.properties=oe,v.renderLists=G,v.shadowMap=xe,v.state=ie,v.info=be}B();const ve=new mx(v,E);this.xr=ve,this.getContext=function(){return E},this.getContextAttributes=function(){return E.getContextAttributes()},this.forceContextLoss=function(){const C=Q.get("WEBGL_lose_context");C&&C.loseContext()},this.forceContextRestore=function(){const C=Q.get("WEBGL_lose_context");C&&C.restoreContext()},this.getPixelRatio=function(){return z},this.setPixelRatio=function(C){C!==void 0&&(z=C,this.setSize(J,H,!1))},this.getSize=function(C){return C.set(J,H)},this.setSize=function(C,q,ee=!0){if(ve.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}J=C,H=q,t.width=Math.floor(C*z),t.height=Math.floor(q*z),ee===!0&&(t.style.width=C+"px",t.style.height=q+"px"),this.setViewport(0,0,C,q)},this.getDrawingBufferSize=function(C){return C.set(J*z,H*z).floor()},this.setDrawingBufferSize=function(C,q,ee){J=C,H=q,z=ee,t.width=Math.floor(C*ee),t.height=Math.floor(q*ee),this.setViewport(0,0,C,q)},this.getCurrentViewport=function(C){return C.copy(U)},this.getViewport=function(C){return C.copy(re)},this.setViewport=function(C,q,ee,ne){C.isVector4?re.set(C.x,C.y,C.z,C.w):re.set(C,q,ee,ne),ie.viewport(U.copy(re).multiplyScalar(z).round())},this.getScissor=function(C){return C.copy(_e)},this.setScissor=function(C,q,ee,ne){C.isVector4?_e.set(C.x,C.y,C.z,C.w):_e.set(C,q,ee,ne),ie.scissor(V.copy(_e).multiplyScalar(z).round())},this.getScissorTest=function(){return me},this.setScissorTest=function(C){ie.setScissorTest(me=C)},this.setOpaqueSort=function(C){Z=C},this.setTransparentSort=function(C){le=C},this.getClearColor=function(C){return C.copy(we.getClearColor())},this.setClearColor=function(){we.setClearColor(...arguments)},this.getClearAlpha=function(){return we.getClearAlpha()},this.setClearAlpha=function(){we.setClearAlpha(...arguments)},this.clear=function(C=!0,q=!0,ee=!0){let ne=0;if(C){let K=!1;if(I!==null){const Me=I.texture.format;K=Me===Pc||Me===Ic||Me===Cc}if(K){const Me=I.texture.type,Ce=Me===Gn||Me===$i||Me===ar||Me===cr||Me===wc||Me===Ac,Ue=we.getClearColor(),Pe=we.getClearAlpha(),qe=Ue.r,Ke=Ue.g,He=Ue.b;Ce?(g[0]=qe,g[1]=Ke,g[2]=He,g[3]=Pe,E.clearBufferuiv(E.COLOR,0,g)):(x[0]=qe,x[1]=Ke,x[2]=He,x[3]=Pe,E.clearBufferiv(E.COLOR,0,x))}else ne|=E.COLOR_BUFFER_BIT}q&&(ne|=E.DEPTH_BUFFER_BIT),ee&&(ne|=E.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),E.clear(ne)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){t.removeEventListener("webglcontextlost",Se,!1),t.removeEventListener("webglcontextrestored",Le,!1),t.removeEventListener("webglcontextcreationerror",pe,!1),we.dispose(),G.dispose(),ge.dispose(),oe.dispose(),Ve.dispose(),Je.dispose(),N.dispose(),Ee.dispose(),Xe.dispose(),k.dispose(),ve.dispose(),ve.removeEventListener("sessionstart",je),ve.removeEventListener("sessionend",mi),on.stop()};function Se(C){C.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),w=!0}function Le(){console.log("THREE.WebGLRenderer: Context Restored."),w=!1;const C=be.autoReset,q=xe.enabled,ee=xe.autoUpdate,ne=xe.needsUpdate,K=xe.type;B(),be.autoReset=C,xe.enabled=q,xe.autoUpdate=ee,xe.needsUpdate=ne,xe.type=K}function pe(C){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",C.statusMessage)}function he(C){const q=C.target;q.removeEventListener("dispose",he),Ne(q)}function Ne(C){De(C),oe.remove(C)}function De(C){const q=oe.get(C).programs;q!==void 0&&(q.forEach(function(ee){k.releaseProgram(ee)}),C.isShaderMaterial&&k.releaseShaderCache(C))}this.renderBufferDirect=function(C,q,ee,ne,K,Me){q===null&&(q=A);const Ce=K.isMesh&&K.matrixWorld.determinant()<0,Ue=Wu(C,q,ee,ne,K);ie.setMaterial(ne,Ce);let Pe=ee.index,qe=1;if(ne.wireframe===!0){if(Pe=_.getWireframeAttribute(ee),Pe===void 0)return;qe=2}const Ke=ee.drawRange,He=ee.attributes.position;let it=Ke.start*qe,gt=(Ke.start+Ke.count)*qe;Me!==null&&(it=Math.max(it,Me.start*qe),gt=Math.min(gt,(Me.start+Me.count)*qe)),Pe!==null?(it=Math.max(it,0),gt=Math.min(gt,Pe.count)):He!=null&&(it=Math.max(it,0),gt=Math.min(gt,He.count));const At=gt-it;if(At<0||At===1/0)return;Ee.setup(K,ne,Ue,ee,Pe);let yt,xt=Te;if(Pe!==null&&(yt=D.get(Pe),xt=Be,xt.setIndex(yt)),K.isMesh)ne.wireframe===!0?(ie.setLineWidth(ne.wireframeLinewidth*Y()),xt.setMode(E.LINES)):xt.setMode(E.TRIANGLES);else if(K.isLine){let Ge=ne.linewidth;Ge===void 0&&(Ge=1),ie.setLineWidth(Ge*Y()),K.isLineSegments?xt.setMode(E.LINES):K.isLineLoop?xt.setMode(E.LINE_LOOP):xt.setMode(E.LINE_STRIP)}else K.isPoints?xt.setMode(E.POINTS):K.isSprite&&xt.setMode(E.TRIANGLES);if(K.isBatchedMesh)if(K._multiDrawInstances!==null)pr("THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),xt.renderMultiDrawInstances(K._multiDrawStarts,K._multiDrawCounts,K._multiDrawCount,K._multiDrawInstances);else if(Q.get("WEBGL_multi_draw"))xt.renderMultiDraw(K._multiDrawStarts,K._multiDrawCounts,K._multiDrawCount);else{const Ge=K._multiDrawStarts,Tt=K._multiDrawCounts,lt=K._multiDrawCount,an=Pe?D.get(Pe).bytesPerElement:1,is=oe.get(ne).currentProgram.getUniforms();for(let cn=0;cn<lt;cn++)is.setValue(E,"_gl_DrawID",cn),xt.render(Ge[cn]/an,Tt[cn])}else if(K.isInstancedMesh)xt.renderInstances(it,At,K.count);else if(ee.isInstancedBufferGeometry){const Ge=ee._maxInstanceCount!==void 0?ee._maxInstanceCount:1/0,Tt=Math.min(ee.instanceCount,Ge);xt.renderInstances(it,At,Tt)}else xt.render(it,At)};function tt(C,q,ee){C.transparent===!0&&C.side===Ct&&C.forceSinglePass===!1?(C.side=tn,C.needsUpdate=!0,gi(C,q,ee),C.side=ui,C.needsUpdate=!0,gi(C,q,ee),C.side=Ct):gi(C,q,ee)}this.compile=function(C,q,ee=null){ee===null&&(ee=C),p=ge.get(ee),p.init(q),y.push(p),ee.traverseVisible(function(K){K.isLight&&K.layers.test(q.layers)&&(p.pushLight(K),K.castShadow&&p.pushShadow(K))}),C!==ee&&C.traverseVisible(function(K){K.isLight&&K.layers.test(q.layers)&&(p.pushLight(K),K.castShadow&&p.pushShadow(K))}),p.setupLights();const ne=new Set;return C.traverse(function(K){if(!(K.isMesh||K.isPoints||K.isLine||K.isSprite))return;const Me=K.material;if(Me)if(Array.isArray(Me))for(let Ce=0;Ce<Me.length;Ce++){const Ue=Me[Ce];tt(Ue,ee,K),ne.add(Ue)}else tt(Me,ee,K),ne.add(Me)}),p=y.pop(),ne},this.compileAsync=function(C,q,ee=null){const ne=this.compile(C,q,ee);return new Promise(K=>{function Me(){if(ne.forEach(function(Ce){oe.get(Ce).currentProgram.isReady()&&ne.delete(Ce)}),ne.size===0){K(C);return}setTimeout(Me,10)}Q.get("KHR_parallel_shader_compile")!==null?Me():setTimeout(Me,10)})};let rt=null;function rn(C){rt&&rt(C)}function je(){on.stop()}function mi(){on.start()}const on=new vu;on.setAnimationLoop(rn),typeof self<"u"&&on.setContext(self),this.setAnimationLoop=function(C){rt=C,ve.setAnimationLoop(C),C===null?on.stop():on.start()},ve.addEventListener("sessionstart",je),ve.addEventListener("sessionend",mi),this.render=function(C,q){if(q!==void 0&&q.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(w===!0)return;if(C.matrixWorldAutoUpdate===!0&&C.updateMatrixWorld(),q.parent===null&&q.matrixWorldAutoUpdate===!0&&q.updateMatrixWorld(),ve.enabled===!0&&ve.isPresenting===!0&&(ve.cameraAutoUpdate===!0&&ve.updateCamera(q),q=ve.getCamera()),C.isScene===!0&&C.onBeforeRender(v,C,q,I),p=ge.get(C,y.length),p.init(q),y.push(p),ae.multiplyMatrices(q.projectionMatrix,q.matrixWorldInverse),ze.setFromProjectionMatrix(ae,kn,q.reversedDepth),te=this.localClippingEnabled,ke=ce.init(this.clippingPlanes,te),m=G.get(C,M.length),m.init(),M.push(m),ve.enabled===!0&&ve.isPresenting===!0){const Me=v.xr.getDepthSensingMesh();Me!==null&&Fi(Me,q,-1/0,v.sortObjects)}Fi(C,q,0,v.sortObjects),m.finish(),v.sortObjects===!0&&m.sort(Z,le),j=ve.enabled===!1||ve.isPresenting===!1||ve.hasDepthSensing()===!1,j&&we.addToRenderList(m,C),this.info.render.frame++,ke===!0&&ce.beginShadows();const ee=p.state.shadowsArray;xe.render(ee,C,q),ke===!0&&ce.endShadows(),this.info.autoReset===!0&&this.info.reset();const ne=m.opaque,K=m.transmissive;if(p.setupLights(),q.isArrayCamera){const Me=q.cameras;if(K.length>0)for(let Ce=0,Ue=Me.length;Ce<Ue;Ce++){const Pe=Me[Ce];vt(ne,K,C,Pe)}j&&we.render(C);for(let Ce=0,Ue=Me.length;Ce<Ue;Ce++){const Pe=Me[Ce];ns(m,C,Pe,Pe.viewport)}}else K.length>0&&vt(ne,K,C,q),j&&we.render(C),ns(m,C,q);I!==null&&R===0&&(de.updateMultisampleRenderTarget(I),de.updateRenderTargetMipmap(I)),C.isScene===!0&&C.onAfterRender(v,C,q),Ee.resetDefaultState(),T=-1,b=null,y.pop(),y.length>0?(p=y[y.length-1],ke===!0&&ce.setGlobalState(v.clippingPlanes,p.state.camera)):p=null,M.pop(),M.length>0?m=M[M.length-1]:m=null};function Fi(C,q,ee,ne){if(C.visible===!1)return;if(C.layers.test(q.layers)){if(C.isGroup)ee=C.renderOrder;else if(C.isLOD)C.autoUpdate===!0&&C.update(q);else if(C.isLight)p.pushLight(C),C.castShadow&&p.pushShadow(C);else if(C.isSprite){if(!C.frustumCulled||ze.intersectsSprite(C)){ne&&Ie.setFromMatrixPosition(C.matrixWorld).applyMatrix4(ae);const Ce=N.update(C),Ue=C.material;Ue.visible&&m.push(C,Ce,Ue,ee,Ie.z,null)}}else if((C.isMesh||C.isLine||C.isPoints)&&(!C.frustumCulled||ze.intersectsObject(C))){const Ce=N.update(C),Ue=C.material;if(ne&&(C.boundingSphere!==void 0?(C.boundingSphere===null&&C.computeBoundingSphere(),Ie.copy(C.boundingSphere.center)):(Ce.boundingSphere===null&&Ce.computeBoundingSphere(),Ie.copy(Ce.boundingSphere.center)),Ie.applyMatrix4(C.matrixWorld).applyMatrix4(ae)),Array.isArray(Ue)){const Pe=Ce.groups;for(let qe=0,Ke=Pe.length;qe<Ke;qe++){const He=Pe[qe],it=Ue[He.materialIndex];it&&it.visible&&m.push(C,Ce,it,ee,Ie.z,He)}}else Ue.visible&&m.push(C,Ce,Ue,ee,Ie.z,null)}}const Me=C.children;for(let Ce=0,Ue=Me.length;Ce<Ue;Ce++)Fi(Me[Ce],q,ee,ne)}function ns(C,q,ee,ne){const K=C.opaque,Me=C.transmissive,Ce=C.transparent;p.setupLightsView(ee),ke===!0&&ce.setGlobalState(v.clippingPlanes,ee),ne&&ie.viewport(U.copy(ne)),K.length>0&&Ht(K,q,ee),Me.length>0&&Ht(Me,q,ee),Ce.length>0&&Ht(Ce,q,ee),ie.buffers.depth.setTest(!0),ie.buffers.depth.setMask(!0),ie.buffers.color.setMask(!0),ie.setPolygonOffset(!1)}function vt(C,q,ee,ne){if((ee.isScene===!0?ee.overrideMaterial:null)!==null)return;p.state.transmissionRenderTarget[ne.id]===void 0&&(p.state.transmissionRenderTarget[ne.id]=new Qi(1,1,{generateMipmaps:!0,type:Q.has("EXT_color_buffer_half_float")||Q.has("EXT_color_buffer_float")?_r:Gn,minFilter:ri,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:ot.workingColorSpace}));const Me=p.state.transmissionRenderTarget[ne.id],Ce=ne.viewport||U;Me.setSize(Ce.z*v.transmissionResolutionScale,Ce.w*v.transmissionResolutionScale);const Ue=v.getRenderTarget(),Pe=v.getActiveCubeFace(),qe=v.getActiveMipmapLevel();v.setRenderTarget(Me),v.getClearColor(O),W=v.getClearAlpha(),W<1&&v.setClearColor(16777215,.5),v.clear(),j&&we.render(ee);const Ke=v.toneMapping;v.toneMapping=Li;const He=ne.viewport;if(ne.viewport!==void 0&&(ne.viewport=void 0),p.setupLightsView(ne),ke===!0&&ce.setGlobalState(v.clippingPlanes,ne),Ht(C,ee,ne),de.updateMultisampleRenderTarget(Me),de.updateRenderTargetMipmap(Me),Q.has("WEBGL_multisampled_render_to_texture")===!1){let it=!1;for(let gt=0,At=q.length;gt<At;gt++){const yt=q[gt],xt=yt.object,Ge=yt.geometry,Tt=yt.material,lt=yt.group;if(Tt.side===Ct&&xt.layers.test(ne.layers)){const an=Tt.side;Tt.side=tn,Tt.needsUpdate=!0,Kn(xt,ee,ne,Ge,Tt,lt),Tt.side=an,Tt.needsUpdate=!0,it=!0}}it===!0&&(de.updateMultisampleRenderTarget(Me),de.updateRenderTargetMipmap(Me))}v.setRenderTarget(Ue,Pe,qe),v.setClearColor(O,W),He!==void 0&&(ne.viewport=He),v.toneMapping=Ke}function Ht(C,q,ee){const ne=q.isScene===!0?q.overrideMaterial:null;for(let K=0,Me=C.length;K<Me;K++){const Ce=C[K],Ue=Ce.object,Pe=Ce.geometry,qe=Ce.group;let Ke=Ce.material;Ke.allowOverride===!0&&ne!==null&&(Ke=ne),Ue.layers.test(ee.layers)&&Kn(Ue,q,ee,Pe,Ke,qe)}}function Kn(C,q,ee,ne,K,Me){C.onBeforeRender(v,q,ee,ne,K,Me),C.modelViewMatrix.multiplyMatrices(ee.matrixWorldInverse,C.matrixWorld),C.normalMatrix.getNormalMatrix(C.modelViewMatrix),K.onBeforeRender(v,q,ee,ne,C,Me),K.transparent===!0&&K.side===Ct&&K.forceSinglePass===!1?(K.side=tn,K.needsUpdate=!0,v.renderBufferDirect(ee,q,ne,K,C,Me),K.side=ui,K.needsUpdate=!0,v.renderBufferDirect(ee,q,ne,K,C,Me),K.side=Ct):v.renderBufferDirect(ee,q,ne,K,C,Me),C.onAfterRender(v,q,ee,ne,K,Me)}function gi(C,q,ee){q.isScene!==!0&&(q=A);const ne=oe.get(C),K=p.state.lights,Me=p.state.shadowsArray,Ce=K.state.version,Ue=k.getParameters(C,K.state,Me,q,ee),Pe=k.getProgramCacheKey(Ue);let qe=ne.programs;ne.environment=C.isMeshStandardMaterial?q.environment:null,ne.fog=q.fog,ne.envMap=(C.isMeshStandardMaterial?Je:Ve).get(C.envMap||ne.environment),ne.envMapRotation=ne.environment!==null&&C.envMap===null?q.environmentRotation:C.envMapRotation,qe===void 0&&(C.addEventListener("dispose",he),qe=new Map,ne.programs=qe);let Ke=qe.get(Pe);if(Ke!==void 0){if(ne.currentProgram===Ke&&ne.lightsStateVersion===Ce)return tl(C,Ue),Ke}else Ue.uniforms=k.getUniforms(C),C.onBeforeCompile(Ue,v),Ke=k.acquireProgram(Ue,Pe),qe.set(Pe,Ke),ne.uniforms=Ue.uniforms;const He=ne.uniforms;return(!C.isShaderMaterial&&!C.isRawShaderMaterial||C.clipping===!0)&&(He.clippingPlanes=ce.uniform),tl(C,Ue),ne.needsLights=qu(C),ne.lightsStateVersion=Ce,ne.needsLights&&(He.ambientLightColor.value=K.state.ambient,He.lightProbe.value=K.state.probe,He.directionalLights.value=K.state.directional,He.directionalLightShadows.value=K.state.directionalShadow,He.spotLights.value=K.state.spot,He.spotLightShadows.value=K.state.spotShadow,He.rectAreaLights.value=K.state.rectArea,He.ltc_1.value=K.state.rectAreaLTC1,He.ltc_2.value=K.state.rectAreaLTC2,He.pointLights.value=K.state.point,He.pointLightShadows.value=K.state.pointShadow,He.hemisphereLights.value=K.state.hemi,He.directionalShadowMap.value=K.state.directionalShadowMap,He.directionalShadowMatrix.value=K.state.directionalShadowMatrix,He.spotShadowMap.value=K.state.spotShadowMap,He.spotLightMatrix.value=K.state.spotLightMatrix,He.spotLightMap.value=K.state.spotLightMap,He.pointShadowMap.value=K.state.pointShadowMap,He.pointShadowMatrix.value=K.state.pointShadowMatrix),ne.currentProgram=Ke,ne.uniformsList=null,Ke}function el(C){if(C.uniformsList===null){const q=C.currentProgram.getUniforms();C.uniformsList=ro.seqWithValue(q.seq,C.uniforms)}return C.uniformsList}function tl(C,q){const ee=oe.get(C);ee.outputColorSpace=q.outputColorSpace,ee.batching=q.batching,ee.batchingColor=q.batchingColor,ee.instancing=q.instancing,ee.instancingColor=q.instancingColor,ee.instancingMorph=q.instancingMorph,ee.skinning=q.skinning,ee.morphTargets=q.morphTargets,ee.morphNormals=q.morphNormals,ee.morphColors=q.morphColors,ee.morphTargetsCount=q.morphTargetsCount,ee.numClippingPlanes=q.numClippingPlanes,ee.numIntersection=q.numClipIntersection,ee.vertexAlphas=q.vertexAlphas,ee.vertexTangents=q.vertexTangents,ee.toneMapping=q.toneMapping}function Wu(C,q,ee,ne,K){q.isScene!==!0&&(q=A),de.resetTextureUnits();const Me=q.fog,Ce=ne.isMeshStandardMaterial?q.environment:null,Ue=I===null?v.outputColorSpace:I.isXRRenderTarget===!0?I.texture.colorSpace:Qt,Pe=(ne.isMeshStandardMaterial?Je:Ve).get(ne.envMap||Ce),qe=ne.vertexColors===!0&&!!ee.attributes.color&&ee.attributes.color.itemSize===4,Ke=!!ee.attributes.tangent&&(!!ne.normalMap||ne.anisotropy>0),He=!!ee.morphAttributes.position,it=!!ee.morphAttributes.normal,gt=!!ee.morphAttributes.color;let At=Li;ne.toneMapped&&(I===null||I.isXRRenderTarget===!0)&&(At=v.toneMapping);const yt=ee.morphAttributes.position||ee.morphAttributes.normal||ee.morphAttributes.color,xt=yt!==void 0?yt.length:0,Ge=oe.get(ne),Tt=p.state.lights;if(ke===!0&&(te===!0||C!==b)){const jt=C===b&&ne.id===T;ce.setState(ne,C,jt)}let lt=!1;ne.version===Ge.__version?(Ge.needsLights&&Ge.lightsStateVersion!==Tt.state.version||Ge.outputColorSpace!==Ue||K.isBatchedMesh&&Ge.batching===!1||!K.isBatchedMesh&&Ge.batching===!0||K.isBatchedMesh&&Ge.batchingColor===!0&&K.colorTexture===null||K.isBatchedMesh&&Ge.batchingColor===!1&&K.colorTexture!==null||K.isInstancedMesh&&Ge.instancing===!1||!K.isInstancedMesh&&Ge.instancing===!0||K.isSkinnedMesh&&Ge.skinning===!1||!K.isSkinnedMesh&&Ge.skinning===!0||K.isInstancedMesh&&Ge.instancingColor===!0&&K.instanceColor===null||K.isInstancedMesh&&Ge.instancingColor===!1&&K.instanceColor!==null||K.isInstancedMesh&&Ge.instancingMorph===!0&&K.morphTexture===null||K.isInstancedMesh&&Ge.instancingMorph===!1&&K.morphTexture!==null||Ge.envMap!==Pe||ne.fog===!0&&Ge.fog!==Me||Ge.numClippingPlanes!==void 0&&(Ge.numClippingPlanes!==ce.numPlanes||Ge.numIntersection!==ce.numIntersection)||Ge.vertexAlphas!==qe||Ge.vertexTangents!==Ke||Ge.morphTargets!==He||Ge.morphNormals!==it||Ge.morphColors!==gt||Ge.toneMapping!==At||Ge.morphTargetsCount!==xt)&&(lt=!0):(lt=!0,Ge.__version=ne.version);let an=Ge.currentProgram;lt===!0&&(an=gi(ne,q,K));let is=!1,cn=!1,Hs=!1;const wt=an.getUniforms(),vn=Ge.uniforms;if(ie.useProgram(an.program)&&(is=!0,cn=!0,Hs=!0),ne.id!==T&&(T=ne.id,cn=!0),is||b!==C){ie.buffers.depth.getReversed()&&C.reversedDepth!==!0&&(C._reversedDepth=!0,C.updateProjectionMatrix()),wt.setValue(E,"projectionMatrix",C.projectionMatrix),wt.setValue(E,"viewMatrix",C.matrixWorldInverse);const en=wt.map.cameraPosition;en!==void 0&&en.setValue(E,ye.setFromMatrixPosition(C.matrixWorld)),se.logarithmicDepthBuffer&&wt.setValue(E,"logDepthBufFC",2/(Math.log(C.far+1)/Math.LN2)),(ne.isMeshPhongMaterial||ne.isMeshToonMaterial||ne.isMeshLambertMaterial||ne.isMeshBasicMaterial||ne.isMeshStandardMaterial||ne.isShaderMaterial)&&wt.setValue(E,"isOrthographic",C.isOrthographicCamera===!0),b!==C&&(b=C,cn=!0,Hs=!0)}if(K.isSkinnedMesh){wt.setOptional(E,K,"bindMatrix"),wt.setOptional(E,K,"bindMatrixInverse");const jt=K.skeleton;jt&&(jt.boneTexture===null&&jt.computeBoneTexture(),wt.setValue(E,"boneTexture",jt.boneTexture,de))}K.isBatchedMesh&&(wt.setOptional(E,K,"batchingTexture"),wt.setValue(E,"batchingTexture",K._matricesTexture,de),wt.setOptional(E,K,"batchingIdTexture"),wt.setValue(E,"batchingIdTexture",K._indirectTexture,de),wt.setOptional(E,K,"batchingColorTexture"),K._colorsTexture!==null&&wt.setValue(E,"batchingColorTexture",K._colorsTexture,de));const Mn=ee.morphAttributes;if((Mn.position!==void 0||Mn.normal!==void 0||Mn.color!==void 0)&&ue.update(K,ee,an),(cn||Ge.receiveShadow!==K.receiveShadow)&&(Ge.receiveShadow=K.receiveShadow,wt.setValue(E,"receiveShadow",K.receiveShadow)),ne.isMeshGouraudMaterial&&ne.envMap!==null&&(vn.envMap.value=Pe,vn.flipEnvMap.value=Pe.isCubeTexture&&Pe.isRenderTargetTexture===!1?-1:1),ne.isMeshStandardMaterial&&ne.envMap===null&&q.environment!==null&&(vn.envMapIntensity.value=q.environmentIntensity),cn&&(wt.setValue(E,"toneMappingExposure",v.toneMappingExposure),Ge.needsLights&&Xu(vn,Hs),Me&&ne.fog===!0&&X.refreshFogUniforms(vn,Me),X.refreshMaterialUniforms(vn,ne,z,H,p.state.transmissionRenderTarget[C.id]),ro.upload(E,el(Ge),vn,de)),ne.isShaderMaterial&&ne.uniformsNeedUpdate===!0&&(ro.upload(E,el(Ge),vn,de),ne.uniformsNeedUpdate=!1),ne.isSpriteMaterial&&wt.setValue(E,"center",K.center),wt.setValue(E,"modelViewMatrix",K.modelViewMatrix),wt.setValue(E,"normalMatrix",K.normalMatrix),wt.setValue(E,"modelMatrix",K.matrixWorld),ne.isShaderMaterial||ne.isRawShaderMaterial){const jt=ne.uniformsGroups;for(let en=0,Co=jt.length;en<Co;en++){const Oi=jt[en];Xe.update(Oi,an),Xe.bind(Oi,an)}}return an}function Xu(C,q){C.ambientLightColor.needsUpdate=q,C.lightProbe.needsUpdate=q,C.directionalLights.needsUpdate=q,C.directionalLightShadows.needsUpdate=q,C.pointLights.needsUpdate=q,C.pointLightShadows.needsUpdate=q,C.spotLights.needsUpdate=q,C.spotLightShadows.needsUpdate=q,C.rectAreaLights.needsUpdate=q,C.hemisphereLights.needsUpdate=q}function qu(C){return C.isMeshLambertMaterial||C.isMeshToonMaterial||C.isMeshPhongMaterial||C.isMeshStandardMaterial||C.isShadowMaterial||C.isShaderMaterial&&C.lights===!0}this.getActiveCubeFace=function(){return S},this.getActiveMipmapLevel=function(){return R},this.getRenderTarget=function(){return I},this.setRenderTargetTextures=function(C,q,ee){const ne=oe.get(C);ne.__autoAllocateDepthBuffer=C.resolveDepthBuffer===!1,ne.__autoAllocateDepthBuffer===!1&&(ne.__useRenderToTexture=!1),oe.get(C.texture).__webglTexture=q,oe.get(C.depthTexture).__webglTexture=ne.__autoAllocateDepthBuffer?void 0:ee,ne.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(C,q){const ee=oe.get(C);ee.__webglFramebuffer=q,ee.__useDefaultFramebuffer=q===void 0};const Yu=E.createFramebuffer();this.setRenderTarget=function(C,q=0,ee=0){I=C,S=q,R=ee;let ne=!0,K=null,Me=!1,Ce=!1;if(C){const Pe=oe.get(C);if(Pe.__useDefaultFramebuffer!==void 0)ie.bindFramebuffer(E.FRAMEBUFFER,null),ne=!1;else if(Pe.__webglFramebuffer===void 0)de.setupRenderTarget(C);else if(Pe.__hasExternalTextures)de.rebindTextures(C,oe.get(C.texture).__webglTexture,oe.get(C.depthTexture).__webglTexture);else if(C.depthBuffer){const He=C.depthTexture;if(Pe.__boundDepthTexture!==He){if(He!==null&&oe.has(He)&&(C.width!==He.image.width||C.height!==He.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");de.setupDepthRenderbuffer(C)}}const qe=C.texture;(qe.isData3DTexture||qe.isDataArrayTexture||qe.isCompressedArrayTexture)&&(Ce=!0);const Ke=oe.get(C).__webglFramebuffer;C.isWebGLCubeRenderTarget?(Array.isArray(Ke[q])?K=Ke[q][ee]:K=Ke[q],Me=!0):C.samples>0&&de.useMultisampledRTT(C)===!1?K=oe.get(C).__webglMultisampledFramebuffer:Array.isArray(Ke)?K=Ke[ee]:K=Ke,U.copy(C.viewport),V.copy(C.scissor),F=C.scissorTest}else U.copy(re).multiplyScalar(z).floor(),V.copy(_e).multiplyScalar(z).floor(),F=me;if(ee!==0&&(K=Yu),ie.bindFramebuffer(E.FRAMEBUFFER,K)&&ne&&ie.drawBuffers(C,K),ie.viewport(U),ie.scissor(V),ie.setScissorTest(F),Me){const Pe=oe.get(C.texture);E.framebufferTexture2D(E.FRAMEBUFFER,E.COLOR_ATTACHMENT0,E.TEXTURE_CUBE_MAP_POSITIVE_X+q,Pe.__webglTexture,ee)}else if(Ce){const Pe=q;for(let qe=0;qe<C.textures.length;qe++){const Ke=oe.get(C.textures[qe]);E.framebufferTextureLayer(E.FRAMEBUFFER,E.COLOR_ATTACHMENT0+qe,Ke.__webglTexture,ee,Pe)}}else if(C!==null&&ee!==0){const Pe=oe.get(C.texture);E.framebufferTexture2D(E.FRAMEBUFFER,E.COLOR_ATTACHMENT0,E.TEXTURE_2D,Pe.__webglTexture,ee)}T=-1},this.readRenderTargetPixels=function(C,q,ee,ne,K,Me,Ce,Ue=0){if(!(C&&C.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let Pe=oe.get(C).__webglFramebuffer;if(C.isWebGLCubeRenderTarget&&Ce!==void 0&&(Pe=Pe[Ce]),Pe){ie.bindFramebuffer(E.FRAMEBUFFER,Pe);try{const qe=C.textures[Ue],Ke=qe.format,He=qe.type;if(!se.textureFormatReadable(Ke)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!se.textureTypeReadable(He)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}q>=0&&q<=C.width-ne&&ee>=0&&ee<=C.height-K&&(C.textures.length>1&&E.readBuffer(E.COLOR_ATTACHMENT0+Ue),E.readPixels(q,ee,ne,K,Re.convert(Ke),Re.convert(He),Me))}finally{const qe=I!==null?oe.get(I).__webglFramebuffer:null;ie.bindFramebuffer(E.FRAMEBUFFER,qe)}}},this.readRenderTargetPixelsAsync=async function(C,q,ee,ne,K,Me,Ce,Ue=0){if(!(C&&C.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let Pe=oe.get(C).__webglFramebuffer;if(C.isWebGLCubeRenderTarget&&Ce!==void 0&&(Pe=Pe[Ce]),Pe)if(q>=0&&q<=C.width-ne&&ee>=0&&ee<=C.height-K){ie.bindFramebuffer(E.FRAMEBUFFER,Pe);const qe=C.textures[Ue],Ke=qe.format,He=qe.type;if(!se.textureFormatReadable(Ke))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!se.textureTypeReadable(He))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");const it=E.createBuffer();E.bindBuffer(E.PIXEL_PACK_BUFFER,it),E.bufferData(E.PIXEL_PACK_BUFFER,Me.byteLength,E.STREAM_READ),C.textures.length>1&&E.readBuffer(E.COLOR_ATTACHMENT0+Ue),E.readPixels(q,ee,ne,K,Re.convert(Ke),Re.convert(He),0);const gt=I!==null?oe.get(I).__webglFramebuffer:null;ie.bindFramebuffer(E.FRAMEBUFFER,gt);const At=E.fenceSync(E.SYNC_GPU_COMMANDS_COMPLETE,0);return E.flush(),await rf(E,At,4),E.bindBuffer(E.PIXEL_PACK_BUFFER,it),E.getBufferSubData(E.PIXEL_PACK_BUFFER,0,Me),E.deleteBuffer(it),E.deleteSync(At),Me}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(C,q=null,ee=0){const ne=Math.pow(2,-ee),K=Math.floor(C.image.width*ne),Me=Math.floor(C.image.height*ne),Ce=q!==null?q.x:0,Ue=q!==null?q.y:0;de.setTexture2D(C,0),E.copyTexSubImage2D(E.TEXTURE_2D,ee,0,0,Ce,Ue,K,Me),ie.unbindTexture()};const ju=E.createFramebuffer(),Ku=E.createFramebuffer();this.copyTextureToTexture=function(C,q,ee=null,ne=null,K=0,Me=null){Me===null&&(K!==0?(pr("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),Me=K,K=0):Me=0);let Ce,Ue,Pe,qe,Ke,He,it,gt,At;const yt=C.isCompressedTexture?C.mipmaps[Me]:C.image;if(ee!==null)Ce=ee.max.x-ee.min.x,Ue=ee.max.y-ee.min.y,Pe=ee.isBox3?ee.max.z-ee.min.z:1,qe=ee.min.x,Ke=ee.min.y,He=ee.isBox3?ee.min.z:0;else{const Mn=Math.pow(2,-K);Ce=Math.floor(yt.width*Mn),Ue=Math.floor(yt.height*Mn),C.isDataArrayTexture?Pe=yt.depth:C.isData3DTexture?Pe=Math.floor(yt.depth*Mn):Pe=1,qe=0,Ke=0,He=0}ne!==null?(it=ne.x,gt=ne.y,At=ne.z):(it=0,gt=0,At=0);const xt=Re.convert(q.format),Ge=Re.convert(q.type);let Tt;q.isData3DTexture?(de.setTexture3D(q,0),Tt=E.TEXTURE_3D):q.isDataArrayTexture||q.isCompressedArrayTexture?(de.setTexture2DArray(q,0),Tt=E.TEXTURE_2D_ARRAY):(de.setTexture2D(q,0),Tt=E.TEXTURE_2D),E.pixelStorei(E.UNPACK_FLIP_Y_WEBGL,q.flipY),E.pixelStorei(E.UNPACK_PREMULTIPLY_ALPHA_WEBGL,q.premultiplyAlpha),E.pixelStorei(E.UNPACK_ALIGNMENT,q.unpackAlignment);const lt=E.getParameter(E.UNPACK_ROW_LENGTH),an=E.getParameter(E.UNPACK_IMAGE_HEIGHT),is=E.getParameter(E.UNPACK_SKIP_PIXELS),cn=E.getParameter(E.UNPACK_SKIP_ROWS),Hs=E.getParameter(E.UNPACK_SKIP_IMAGES);E.pixelStorei(E.UNPACK_ROW_LENGTH,yt.width),E.pixelStorei(E.UNPACK_IMAGE_HEIGHT,yt.height),E.pixelStorei(E.UNPACK_SKIP_PIXELS,qe),E.pixelStorei(E.UNPACK_SKIP_ROWS,Ke),E.pixelStorei(E.UNPACK_SKIP_IMAGES,He);const wt=C.isDataArrayTexture||C.isData3DTexture,vn=q.isDataArrayTexture||q.isData3DTexture;if(C.isDepthTexture){const Mn=oe.get(C),jt=oe.get(q),en=oe.get(Mn.__renderTarget),Co=oe.get(jt.__renderTarget);ie.bindFramebuffer(E.READ_FRAMEBUFFER,en.__webglFramebuffer),ie.bindFramebuffer(E.DRAW_FRAMEBUFFER,Co.__webglFramebuffer);for(let Oi=0;Oi<Pe;Oi++)wt&&(E.framebufferTextureLayer(E.READ_FRAMEBUFFER,E.COLOR_ATTACHMENT0,oe.get(C).__webglTexture,K,He+Oi),E.framebufferTextureLayer(E.DRAW_FRAMEBUFFER,E.COLOR_ATTACHMENT0,oe.get(q).__webglTexture,Me,At+Oi)),E.blitFramebuffer(qe,Ke,Ce,Ue,it,gt,Ce,Ue,E.DEPTH_BUFFER_BIT,E.NEAREST);ie.bindFramebuffer(E.READ_FRAMEBUFFER,null),ie.bindFramebuffer(E.DRAW_FRAMEBUFFER,null)}else if(K!==0||C.isRenderTargetTexture||oe.has(C)){const Mn=oe.get(C),jt=oe.get(q);ie.bindFramebuffer(E.READ_FRAMEBUFFER,ju),ie.bindFramebuffer(E.DRAW_FRAMEBUFFER,Ku);for(let en=0;en<Pe;en++)wt?E.framebufferTextureLayer(E.READ_FRAMEBUFFER,E.COLOR_ATTACHMENT0,Mn.__webglTexture,K,He+en):E.framebufferTexture2D(E.READ_FRAMEBUFFER,E.COLOR_ATTACHMENT0,E.TEXTURE_2D,Mn.__webglTexture,K),vn?E.framebufferTextureLayer(E.DRAW_FRAMEBUFFER,E.COLOR_ATTACHMENT0,jt.__webglTexture,Me,At+en):E.framebufferTexture2D(E.DRAW_FRAMEBUFFER,E.COLOR_ATTACHMENT0,E.TEXTURE_2D,jt.__webglTexture,Me),K!==0?E.blitFramebuffer(qe,Ke,Ce,Ue,it,gt,Ce,Ue,E.COLOR_BUFFER_BIT,E.NEAREST):vn?E.copyTexSubImage3D(Tt,Me,it,gt,At+en,qe,Ke,Ce,Ue):E.copyTexSubImage2D(Tt,Me,it,gt,qe,Ke,Ce,Ue);ie.bindFramebuffer(E.READ_FRAMEBUFFER,null),ie.bindFramebuffer(E.DRAW_FRAMEBUFFER,null)}else vn?C.isDataTexture||C.isData3DTexture?E.texSubImage3D(Tt,Me,it,gt,At,Ce,Ue,Pe,xt,Ge,yt.data):q.isCompressedArrayTexture?E.compressedTexSubImage3D(Tt,Me,it,gt,At,Ce,Ue,Pe,xt,yt.data):E.texSubImage3D(Tt,Me,it,gt,At,Ce,Ue,Pe,xt,Ge,yt):C.isDataTexture?E.texSubImage2D(E.TEXTURE_2D,Me,it,gt,Ce,Ue,xt,Ge,yt.data):C.isCompressedTexture?E.compressedTexSubImage2D(E.TEXTURE_2D,Me,it,gt,yt.width,yt.height,xt,yt.data):E.texSubImage2D(E.TEXTURE_2D,Me,it,gt,Ce,Ue,xt,Ge,yt);E.pixelStorei(E.UNPACK_ROW_LENGTH,lt),E.pixelStorei(E.UNPACK_IMAGE_HEIGHT,an),E.pixelStorei(E.UNPACK_SKIP_PIXELS,is),E.pixelStorei(E.UNPACK_SKIP_ROWS,cn),E.pixelStorei(E.UNPACK_SKIP_IMAGES,Hs),Me===0&&q.generateMipmaps&&E.generateMipmap(Tt),ie.unbindTexture()},this.initRenderTarget=function(C){oe.get(C).__webglFramebuffer===void 0&&de.setupRenderTarget(C)},this.initTexture=function(C){C.isCubeTexture?de.setTextureCube(C,0):C.isData3DTexture?de.setTexture3D(C,0):C.isDataArrayTexture||C.isCompressedArrayTexture?de.setTexture2DArray(C,0):de.setTexture2D(C,0),ie.unbindTexture()},this.resetState=function(){S=0,R=0,I=null,ie.reset(),Ee.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return kn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(e){this._outputColorSpace=e;const t=this.getContext();t.drawingBufferColorSpace=ot._getDrawingBufferColorSpace(e),t.unpackColorSpace=ot._getUnpackColorSpace()}}function Mx(s,e=!1){const t=s[0].index!==null,n=new Set(Object.keys(s[0].attributes)),i=new Set(Object.keys(s[0].morphAttributes)),r={},o={},a=s[0].morphTargetsRelative,l=new dt;let c=0;for(let h=0;h<s.length;++h){const u=s[h];let d=0;if(t!==(u.index!==null))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". All geometries must have compatible attributes; make sure index attribute exists among all geometries, or in none of them."),null;for(const f in u.attributes){if(!n.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+'. All geometries must have compatible attributes; make sure "'+f+'" attribute exists among all geometries, or in none of them.'),null;r[f]===void 0&&(r[f]=[]),r[f].push(u.attributes[f]),d++}if(d!==n.size)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". Make sure all geometries have the same number of attributes."),null;if(a!==u.morphTargetsRelative)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". .morphTargetsRelative must be consistent throughout all geometries."),null;for(const f in u.morphAttributes){if(!i.has(f))return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+".  .morphAttributes must be consistent throughout all geometries."),null;o[f]===void 0&&(o[f]=[]),o[f].push(u.morphAttributes[f])}if(e){let f;if(t)f=u.index.count;else if(u.attributes.position!==void 0)f=u.attributes.position.count;else return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed with geometry at index "+h+". The geometry must have either an index or a position attribute"),null;l.addGroup(c,f,h),c+=f}}if(t){let h=0;const u=[];for(let d=0;d<s.length;++d){const f=s[d].index;for(let g=0;g<f.count;++g)u.push(f.getX(g)+h);h+=s[d].attributes.position.count}l.setIndex(u)}for(const h in r){const u=gh(r[h]);if(!u)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" attribute."),null;l.setAttribute(h,u)}for(const h in o){const u=o[h][0].length;if(u===0)break;l.morphAttributes=l.morphAttributes||{},l.morphAttributes[h]=[];for(let d=0;d<u;++d){const f=[];for(let x=0;x<o[h].length;++x)f.push(o[h][x][d]);const g=gh(f);if(!g)return console.error("THREE.BufferGeometryUtils: .mergeGeometries() failed while trying to merge the "+h+" morphAttribute."),null;l.morphAttributes[h].push(g)}}return l}function gh(s){let e,t,n,i=-1,r=0;for(let c=0;c<s.length;++c){const h=s[c];if(e===void 0&&(e=h.array.constructor),e!==h.array.constructor)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.array must be of consistent array types across matching attributes."),null;if(t===void 0&&(t=h.itemSize),t!==h.itemSize)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.itemSize must be consistent across matching attributes."),null;if(n===void 0&&(n=h.normalized),n!==h.normalized)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.normalized must be consistent across matching attributes."),null;if(i===-1&&(i=h.gpuType),i!==h.gpuType)return console.error("THREE.BufferGeometryUtils: .mergeAttributes() failed. BufferAttribute.gpuType must be consistent across matching attributes."),null;r+=h.count*t}const o=new e(r),a=new Yt(o,t,n);let l=0;for(let c=0;c<s.length;++c){const h=s[c];if(h.isInterleavedBufferAttribute){const u=l/t;for(let d=0,f=h.count;d<f;d++)for(let g=0;g<t;g++){const x=h.getComponent(d,g);a.setComponent(d+u,g,x)}}else o.set(h.array,l);l+=h.count*t}return i!==void 0&&(a.gpuType=i),a}function _h(s,e){if(e===Id)return console.warn("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Geometry already defined as triangles."),s;if(e===cc||e===Yh){let t=s.getIndex();if(t===null){const o=[],a=s.getAttribute("position");if(a!==void 0){for(let l=0;l<a.count;l++)o.push(l);s.setIndex(o),t=s.getIndex()}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Undefined position attribute. Processing not possible."),s}const n=t.count-2,i=[];if(e===cc)for(let o=1;o<=n;o++)i.push(t.getX(0)),i.push(t.getX(o)),i.push(t.getX(o+1));else for(let o=0;o<n;o++)o%2===0?(i.push(t.getX(o)),i.push(t.getX(o+1)),i.push(t.getX(o+2))):(i.push(t.getX(o+2)),i.push(t.getX(o+1)),i.push(t.getX(o)));i.length/3!==n&&console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unable to generate correct amount of triangles.");const r=s.clone();return r.setIndex(i),r.clearGroups(),r}else return console.error("THREE.BufferGeometryUtils.toTrianglesDrawMode(): Unknown draw mode:",e),s}class qc extends Bs{constructor(e){super(e),this.dracoLoader=null,this.ktx2Loader=null,this.meshoptDecoder=null,this.pluginCallbacks=[],this.register(function(t){return new Tx(t)}),this.register(function(t){return new wx(t)}),this.register(function(t){return new Ux(t)}),this.register(function(t){return new Fx(t)}),this.register(function(t){return new Ox(t)}),this.register(function(t){return new Rx(t)}),this.register(function(t){return new Cx(t)}),this.register(function(t){return new Ix(t)}),this.register(function(t){return new Px(t)}),this.register(function(t){return new Ex(t)}),this.register(function(t){return new Lx(t)}),this.register(function(t){return new Ax(t)}),this.register(function(t){return new Nx(t)}),this.register(function(t){return new Dx(t)}),this.register(function(t){return new bx(t)}),this.register(function(t){return new zx(t)}),this.register(function(t){return new Bx(t)})}load(e,t,n,i){const r=this;let o;if(this.resourcePath!=="")o=this.resourcePath;else if(this.path!==""){const c=sr.extractUrlBase(e);o=sr.resolveURL(c,this.path)}else o=sr.extractUrlBase(e);this.manager.itemStart(e);const a=function(c){i?i(c):console.error(c),r.manager.itemError(e),r.manager.itemEnd(e)},l=new _u(this.manager);l.setPath(this.path),l.setResponseType("arraybuffer"),l.setRequestHeader(this.requestHeader),l.setWithCredentials(this.withCredentials),l.load(e,function(c){try{r.parse(c,o,function(h){t(h),r.manager.itemEnd(e)},a)}catch(h){a(h)}},n,a)}setDRACOLoader(e){return this.dracoLoader=e,this}setKTX2Loader(e){return this.ktx2Loader=e,this}setMeshoptDecoder(e){return this.meshoptDecoder=e,this}register(e){return this.pluginCallbacks.indexOf(e)===-1&&this.pluginCallbacks.push(e),this}unregister(e){return this.pluginCallbacks.indexOf(e)!==-1&&this.pluginCallbacks.splice(this.pluginCallbacks.indexOf(e),1),this}parse(e,t,n,i){let r;const o={},a={},l=new TextDecoder;if(typeof e=="string")r=JSON.parse(e);else if(e instanceof ArrayBuffer)if(l.decode(new Uint8Array(e,0,4))===Eu){try{o[nt.KHR_BINARY_GLTF]=new kx(e)}catch(u){i&&i(u);return}r=JSON.parse(o[nt.KHR_BINARY_GLTF].content)}else r=JSON.parse(l.decode(e));else r=e;if(r.asset===void 0||r.asset.version[0]<2){i&&i(new Error("THREE.GLTFLoader: Unsupported asset. glTF versions >=2.0 are supported."));return}const c=new Qx(r,{path:t||this.resourcePath||"",crossOrigin:this.crossOrigin,requestHeader:this.requestHeader,manager:this.manager,ktx2Loader:this.ktx2Loader,meshoptDecoder:this.meshoptDecoder});c.fileLoader.setRequestHeader(this.requestHeader);for(let h=0;h<this.pluginCallbacks.length;h++){const u=this.pluginCallbacks[h](c);u.name||console.error("THREE.GLTFLoader: Invalid plugin found: missing name"),a[u.name]=u,o[u.name]=!0}if(r.extensionsUsed)for(let h=0;h<r.extensionsUsed.length;++h){const u=r.extensionsUsed[h],d=r.extensionsRequired||[];switch(u){case nt.KHR_MATERIALS_UNLIT:o[u]=new Sx;break;case nt.KHR_DRACO_MESH_COMPRESSION:o[u]=new Hx(r,this.dracoLoader);break;case nt.KHR_TEXTURE_TRANSFORM:o[u]=new Vx;break;case nt.KHR_MESH_QUANTIZATION:o[u]=new Gx;break;default:d.indexOf(u)>=0&&a[u]===void 0&&console.warn('THREE.GLTFLoader: Unknown extension "'+u+'".')}}c.setExtensions(o),c.setPlugins(a),c.parse(n,i)}parseAsync(e,t){const n=this;return new Promise(function(i,r){n.parse(e,t,i,r)})}}function yx(){let s={};return{get:function(e){return s[e]},add:function(e,t){s[e]=t},remove:function(e){delete s[e]},removeAll:function(){s={}}}}const nt={KHR_BINARY_GLTF:"KHR_binary_glTF",KHR_DRACO_MESH_COMPRESSION:"KHR_draco_mesh_compression",KHR_LIGHTS_PUNCTUAL:"KHR_lights_punctual",KHR_MATERIALS_CLEARCOAT:"KHR_materials_clearcoat",KHR_MATERIALS_DISPERSION:"KHR_materials_dispersion",KHR_MATERIALS_IOR:"KHR_materials_ior",KHR_MATERIALS_SHEEN:"KHR_materials_sheen",KHR_MATERIALS_SPECULAR:"KHR_materials_specular",KHR_MATERIALS_TRANSMISSION:"KHR_materials_transmission",KHR_MATERIALS_IRIDESCENCE:"KHR_materials_iridescence",KHR_MATERIALS_ANISOTROPY:"KHR_materials_anisotropy",KHR_MATERIALS_UNLIT:"KHR_materials_unlit",KHR_MATERIALS_VOLUME:"KHR_materials_volume",KHR_TEXTURE_BASISU:"KHR_texture_basisu",KHR_TEXTURE_TRANSFORM:"KHR_texture_transform",KHR_MESH_QUANTIZATION:"KHR_mesh_quantization",KHR_MATERIALS_EMISSIVE_STRENGTH:"KHR_materials_emissive_strength",EXT_MATERIALS_BUMP:"EXT_materials_bump",EXT_TEXTURE_WEBP:"EXT_texture_webp",EXT_TEXTURE_AVIF:"EXT_texture_avif",EXT_MESHOPT_COMPRESSION:"EXT_meshopt_compression",EXT_MESH_GPU_INSTANCING:"EXT_mesh_gpu_instancing"};class bx{constructor(e){this.parser=e,this.name=nt.KHR_LIGHTS_PUNCTUAL,this.cache={refs:{},uses:{}}}_markDefs(){const e=this.parser,t=this.parser.json.nodes||[];for(let n=0,i=t.length;n<i;n++){const r=t[n];r.extensions&&r.extensions[this.name]&&r.extensions[this.name].light!==void 0&&e._addNodeRef(this.cache,r.extensions[this.name].light)}}_loadLight(e){const t=this.parser,n="light:"+e;let i=t.cache.get(n);if(i)return i;const r=t.json,l=((r.extensions&&r.extensions[this.name]||{}).lights||[])[e];let c;const h=new Ye(16777215);l.color!==void 0&&h.setRGB(l.color[0],l.color[1],l.color[2],Qt);const u=l.range!==void 0?l.range:0;switch(l.type){case"directional":c=new xu(h),c.target.position.set(0,0,-1),c.add(c.target);break;case"point":c=new Mp(h),c.distance=u;break;case"spot":c=new xp(h),c.distance=u,l.spot=l.spot||{},l.spot.innerConeAngle=l.spot.innerConeAngle!==void 0?l.spot.innerConeAngle:0,l.spot.outerConeAngle=l.spot.outerConeAngle!==void 0?l.spot.outerConeAngle:Math.PI/4,c.angle=l.spot.outerConeAngle,c.penumbra=1-l.spot.innerConeAngle/l.spot.outerConeAngle,c.target.position.set(0,0,-1),c.add(c.target);break;default:throw new Error("THREE.GLTFLoader: Unexpected light type: "+l.type)}return c.position.set(0,0,0),zn(c,l),l.intensity!==void 0&&(c.intensity=l.intensity),c.name=t.createUniqueName(l.name||"light_"+e),i=Promise.resolve(c),t.cache.add(n,i),i}getDependency(e,t){if(e==="light")return this._loadLight(t)}createNodeAttachment(e){const t=this,n=this.parser,r=n.json.nodes[e],a=(r.extensions&&r.extensions[this.name]||{}).light;return a===void 0?null:this._loadLight(a).then(function(l){return n._getNodeRef(t.cache,a,l)})}}class Sx{constructor(){this.name=nt.KHR_MATERIALS_UNLIT}getMaterialType(){return Xt}extendParams(e,t,n){const i=[];e.color=new Ye(1,1,1),e.opacity=1;const r=t.pbrMetallicRoughness;if(r){if(Array.isArray(r.baseColorFactor)){const o=r.baseColorFactor;e.color.setRGB(o[0],o[1],o[2],Qt),e.opacity=o[3]}r.baseColorTexture!==void 0&&i.push(n.assignTexture(e,"map",r.baseColorTexture,Mt))}return Promise.all(i)}}class Ex{constructor(e){this.parser=e,this.name=nt.KHR_MATERIALS_EMISSIVE_STRENGTH}extendMaterialParams(e,t){const i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=i.extensions[this.name].emissiveStrength;return r!==void 0&&(t.emissiveIntensity=r),Promise.resolve()}}class Tx{constructor(e){this.parser=e,this.name=nt.KHR_MATERIALS_CLEARCOAT}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:kt}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],o=i.extensions[this.name];if(o.clearcoatFactor!==void 0&&(t.clearcoat=o.clearcoatFactor),o.clearcoatTexture!==void 0&&r.push(n.assignTexture(t,"clearcoatMap",o.clearcoatTexture)),o.clearcoatRoughnessFactor!==void 0&&(t.clearcoatRoughness=o.clearcoatRoughnessFactor),o.clearcoatRoughnessTexture!==void 0&&r.push(n.assignTexture(t,"clearcoatRoughnessMap",o.clearcoatRoughnessTexture)),o.clearcoatNormalTexture!==void 0&&(r.push(n.assignTexture(t,"clearcoatNormalMap",o.clearcoatNormalTexture)),o.clearcoatNormalTexture.scale!==void 0)){const a=o.clearcoatNormalTexture.scale;t.clearcoatNormalScale=new Oe(a,a)}return Promise.all(r)}}class wx{constructor(e){this.parser=e,this.name=nt.KHR_MATERIALS_DISPERSION}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:kt}extendMaterialParams(e,t){const i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=i.extensions[this.name];return t.dispersion=r.dispersion!==void 0?r.dispersion:0,Promise.resolve()}}class Ax{constructor(e){this.parser=e,this.name=nt.KHR_MATERIALS_IRIDESCENCE}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:kt}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],o=i.extensions[this.name];return o.iridescenceFactor!==void 0&&(t.iridescence=o.iridescenceFactor),o.iridescenceTexture!==void 0&&r.push(n.assignTexture(t,"iridescenceMap",o.iridescenceTexture)),o.iridescenceIor!==void 0&&(t.iridescenceIOR=o.iridescenceIor),t.iridescenceThicknessRange===void 0&&(t.iridescenceThicknessRange=[100,400]),o.iridescenceThicknessMinimum!==void 0&&(t.iridescenceThicknessRange[0]=o.iridescenceThicknessMinimum),o.iridescenceThicknessMaximum!==void 0&&(t.iridescenceThicknessRange[1]=o.iridescenceThicknessMaximum),o.iridescenceThicknessTexture!==void 0&&r.push(n.assignTexture(t,"iridescenceThicknessMap",o.iridescenceThicknessTexture)),Promise.all(r)}}class Rx{constructor(e){this.parser=e,this.name=nt.KHR_MATERIALS_SHEEN}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:kt}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[];t.sheenColor=new Ye(0,0,0),t.sheenRoughness=0,t.sheen=1;const o=i.extensions[this.name];if(o.sheenColorFactor!==void 0){const a=o.sheenColorFactor;t.sheenColor.setRGB(a[0],a[1],a[2],Qt)}return o.sheenRoughnessFactor!==void 0&&(t.sheenRoughness=o.sheenRoughnessFactor),o.sheenColorTexture!==void 0&&r.push(n.assignTexture(t,"sheenColorMap",o.sheenColorTexture,Mt)),o.sheenRoughnessTexture!==void 0&&r.push(n.assignTexture(t,"sheenRoughnessMap",o.sheenRoughnessTexture)),Promise.all(r)}}class Cx{constructor(e){this.parser=e,this.name=nt.KHR_MATERIALS_TRANSMISSION}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:kt}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],o=i.extensions[this.name];return o.transmissionFactor!==void 0&&(t.transmission=o.transmissionFactor),o.transmissionTexture!==void 0&&r.push(n.assignTexture(t,"transmissionMap",o.transmissionTexture)),Promise.all(r)}}class Ix{constructor(e){this.parser=e,this.name=nt.KHR_MATERIALS_VOLUME}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:kt}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],o=i.extensions[this.name];t.thickness=o.thicknessFactor!==void 0?o.thicknessFactor:0,o.thicknessTexture!==void 0&&r.push(n.assignTexture(t,"thicknessMap",o.thicknessTexture)),t.attenuationDistance=o.attenuationDistance||1/0;const a=o.attenuationColor||[1,1,1];return t.attenuationColor=new Ye().setRGB(a[0],a[1],a[2],Qt),Promise.all(r)}}class Px{constructor(e){this.parser=e,this.name=nt.KHR_MATERIALS_IOR}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:kt}extendMaterialParams(e,t){const i=this.parser.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=i.extensions[this.name];return t.ior=r.ior!==void 0?r.ior:1.5,Promise.resolve()}}class Lx{constructor(e){this.parser=e,this.name=nt.KHR_MATERIALS_SPECULAR}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:kt}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],o=i.extensions[this.name];t.specularIntensity=o.specularFactor!==void 0?o.specularFactor:1,o.specularTexture!==void 0&&r.push(n.assignTexture(t,"specularIntensityMap",o.specularTexture));const a=o.specularColorFactor||[1,1,1];return t.specularColor=new Ye().setRGB(a[0],a[1],a[2],Qt),o.specularColorTexture!==void 0&&r.push(n.assignTexture(t,"specularColorMap",o.specularColorTexture,Mt)),Promise.all(r)}}class Dx{constructor(e){this.parser=e,this.name=nt.EXT_MATERIALS_BUMP}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:kt}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],o=i.extensions[this.name];return t.bumpScale=o.bumpFactor!==void 0?o.bumpFactor:1,o.bumpTexture!==void 0&&r.push(n.assignTexture(t,"bumpMap",o.bumpTexture)),Promise.all(r)}}class Nx{constructor(e){this.parser=e,this.name=nt.KHR_MATERIALS_ANISOTROPY}getMaterialType(e){const n=this.parser.json.materials[e];return!n.extensions||!n.extensions[this.name]?null:kt}extendMaterialParams(e,t){const n=this.parser,i=n.json.materials[e];if(!i.extensions||!i.extensions[this.name])return Promise.resolve();const r=[],o=i.extensions[this.name];return o.anisotropyStrength!==void 0&&(t.anisotropy=o.anisotropyStrength),o.anisotropyRotation!==void 0&&(t.anisotropyRotation=o.anisotropyRotation),o.anisotropyTexture!==void 0&&r.push(n.assignTexture(t,"anisotropyMap",o.anisotropyTexture)),Promise.all(r)}}class Ux{constructor(e){this.parser=e,this.name=nt.KHR_TEXTURE_BASISU}loadTexture(e){const t=this.parser,n=t.json,i=n.textures[e];if(!i.extensions||!i.extensions[this.name])return null;const r=i.extensions[this.name],o=t.options.ktx2Loader;if(!o){if(n.extensionsRequired&&n.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setKTX2Loader must be called before loading KTX2 textures");return null}return t.loadTextureImage(e,r.source,o)}}class Fx{constructor(e){this.parser=e,this.name=nt.EXT_TEXTURE_WEBP}loadTexture(e){const t=this.name,n=this.parser,i=n.json,r=i.textures[e];if(!r.extensions||!r.extensions[t])return null;const o=r.extensions[t],a=i.images[o.source];let l=n.textureLoader;if(a.uri){const c=n.options.manager.getHandler(a.uri);c!==null&&(l=c)}return n.loadTextureImage(e,o.source,l)}}class Ox{constructor(e){this.parser=e,this.name=nt.EXT_TEXTURE_AVIF}loadTexture(e){const t=this.name,n=this.parser,i=n.json,r=i.textures[e];if(!r.extensions||!r.extensions[t])return null;const o=r.extensions[t],a=i.images[o.source];let l=n.textureLoader;if(a.uri){const c=n.options.manager.getHandler(a.uri);c!==null&&(l=c)}return n.loadTextureImage(e,o.source,l)}}class zx{constructor(e){this.name=nt.EXT_MESHOPT_COMPRESSION,this.parser=e}loadBufferView(e){const t=this.parser.json,n=t.bufferViews[e];if(n.extensions&&n.extensions[this.name]){const i=n.extensions[this.name],r=this.parser.getDependency("buffer",i.buffer),o=this.parser.options.meshoptDecoder;if(!o||!o.supported){if(t.extensionsRequired&&t.extensionsRequired.indexOf(this.name)>=0)throw new Error("THREE.GLTFLoader: setMeshoptDecoder must be called before loading compressed files");return null}return r.then(function(a){const l=i.byteOffset||0,c=i.byteLength||0,h=i.count,u=i.byteStride,d=new Uint8Array(a,l,c);return o.decodeGltfBufferAsync?o.decodeGltfBufferAsync(h,u,d,i.mode,i.filter).then(function(f){return f.buffer}):o.ready.then(function(){const f=new ArrayBuffer(h*u);return o.decodeGltfBuffer(new Uint8Array(f),h,u,d,i.mode,i.filter),f})})}else return null}}class Bx{constructor(e){this.name=nt.EXT_MESH_GPU_INSTANCING,this.parser=e}createNodeMesh(e){const t=this.parser.json,n=t.nodes[e];if(!n.extensions||!n.extensions[this.name]||n.mesh===void 0)return null;const i=t.meshes[n.mesh];for(const c of i.primitives)if(c.mode!==bn.TRIANGLES&&c.mode!==bn.TRIANGLE_STRIP&&c.mode!==bn.TRIANGLE_FAN&&c.mode!==void 0)return null;const o=n.extensions[this.name].attributes,a=[],l={};for(const c in o)a.push(this.parser.getDependency("accessor",o[c]).then(h=>(l[c]=h,l[c])));return a.length<1?null:(a.push(this.parser.createNodeMesh(e)),Promise.all(a).then(c=>{const h=c.pop(),u=h.isGroup?h.children:[h],d=c[0].count,f=[];for(const g of u){const x=new Ze,m=new P,p=new qt,M=new P(1,1,1),y=new au(g.geometry,g.material,d);for(let v=0;v<d;v++)l.TRANSLATION&&m.fromBufferAttribute(l.TRANSLATION,v),l.ROTATION&&p.fromBufferAttribute(l.ROTATION,v),l.SCALE&&M.fromBufferAttribute(l.SCALE,v),y.setMatrixAt(v,x.compose(m,p,M));for(const v in l)if(v==="_COLOR_0"){const w=l[v];y.instanceColor=new hc(w.array,w.itemSize,w.normalized)}else v!=="TRANSLATION"&&v!=="ROTATION"&&v!=="SCALE"&&g.geometry.setAttribute(v,l[v]);Et.prototype.copy.call(y,g),this.parser.assignFinalMaterial(y),f.push(y)}return h.isGroup?(h.clear(),h.add(...f),h):f[0]}))}}const Eu="glTF",Js=12,xh={JSON:1313821514,BIN:5130562};class kx{constructor(e){this.name=nt.KHR_BINARY_GLTF,this.content=null,this.body=null;const t=new DataView(e,0,Js),n=new TextDecoder;if(this.header={magic:n.decode(new Uint8Array(e.slice(0,4))),version:t.getUint32(4,!0),length:t.getUint32(8,!0)},this.header.magic!==Eu)throw new Error("THREE.GLTFLoader: Unsupported glTF-Binary header.");if(this.header.version<2)throw new Error("THREE.GLTFLoader: Legacy binary file detected.");const i=this.header.length-Js,r=new DataView(e,Js);let o=0;for(;o<i;){const a=r.getUint32(o,!0);o+=4;const l=r.getUint32(o,!0);if(o+=4,l===xh.JSON){const c=new Uint8Array(e,Js+o,a);this.content=n.decode(c)}else if(l===xh.BIN){const c=Js+o;this.body=e.slice(c,c+a)}o+=a}if(this.content===null)throw new Error("THREE.GLTFLoader: JSON content not found.")}}class Hx{constructor(e,t){if(!t)throw new Error("THREE.GLTFLoader: No DRACOLoader instance provided.");this.name=nt.KHR_DRACO_MESH_COMPRESSION,this.json=e,this.dracoLoader=t,this.dracoLoader.preload()}decodePrimitive(e,t){const n=this.json,i=this.dracoLoader,r=e.extensions[this.name].bufferView,o=e.extensions[this.name].attributes,a={},l={},c={};for(const h in o){const u=mc[h]||h.toLowerCase();a[u]=o[h]}for(const h in e.attributes){const u=mc[h]||h.toLowerCase();if(o[h]!==void 0){const d=n.accessors[e.attributes[h]],f=Ts[d.componentType];c[u]=f.name,l[u]=d.normalized===!0}}return t.getDependency("bufferView",r).then(function(h){return new Promise(function(u,d){i.decodeDracoFile(h,function(f){for(const g in f.attributes){const x=f.attributes[g],m=l[g];m!==void 0&&(x.normalized=m)}u(f)},a,c,Qt,d)})})}}class Vx{constructor(){this.name=nt.KHR_TEXTURE_TRANSFORM}extendTexture(e,t){return(t.texCoord===void 0||t.texCoord===e.channel)&&t.offset===void 0&&t.rotation===void 0&&t.scale===void 0||(e=e.clone(),t.texCoord!==void 0&&(e.channel=t.texCoord),t.offset!==void 0&&e.offset.fromArray(t.offset),t.rotation!==void 0&&(e.rotation=t.rotation),t.scale!==void 0&&e.repeat.fromArray(t.scale),e.needsUpdate=!0),e}}class Gx{constructor(){this.name=nt.KHR_MESH_QUANTIZATION}}class Tu extends xr{constructor(e,t,n,i){super(e,t,n,i)}copySampleValue_(e){const t=this.resultBuffer,n=this.sampleValues,i=this.valueSize,r=e*i*3+i;for(let o=0;o!==i;o++)t[o]=n[r+o];return t}interpolate_(e,t,n,i){const r=this.resultBuffer,o=this.sampleValues,a=this.valueSize,l=a*2,c=a*3,h=i-t,u=(n-t)/h,d=u*u,f=d*u,g=e*c,x=g-c,m=-2*f+3*d,p=f-d,M=1-m,y=p-d+u;for(let v=0;v!==a;v++){const w=o[x+v+a],S=o[x+v+l]*h,R=o[g+v+a],I=o[g+v]*h;r[v]=M*w+y*S+m*R+p*I}return r}}const Wx=new qt;class Xx extends Tu{interpolate_(e,t,n,i){const r=super.interpolate_(e,t,n,i);return Wx.fromArray(r).normalize().toArray(r),r}}const bn={POINTS:0,LINES:1,LINE_LOOP:2,LINE_STRIP:3,TRIANGLES:4,TRIANGLE_STRIP:5,TRIANGLE_FAN:6},Ts={5120:Int8Array,5121:Uint8Array,5122:Int16Array,5123:Uint16Array,5125:Uint32Array,5126:Float32Array},vh={9728:$t,9729:pn,9984:Bh,9985:eo,9986:$s,9987:ri},Mh={33071:Ai,33648:lo,10497:Zi},pa={SCALAR:1,VEC2:2,VEC3:3,VEC4:4,MAT2:4,MAT3:9,MAT4:16},mc={POSITION:"position",NORMAL:"normal",TANGENT:"tangent",TEXCOORD_0:"uv",TEXCOORD_1:"uv1",TEXCOORD_2:"uv2",TEXCOORD_3:"uv3",COLOR_0:"color",WEIGHTS_0:"skinWeight",JOINTS_0:"skinIndex"},Si={scale:"scale",translation:"position",rotation:"quaternion",weights:"morphTargetInfluences"},qx={CUBICSPLINE:void 0,LINEAR:dr,STEP:ur},ma={OPAQUE:"OPAQUE",MASK:"MASK",BLEND:"BLEND"};function Yx(s){return s.DefaultMaterial===void 0&&(s.DefaultMaterial=new st({color:16777215,emissive:0,metalness:1,roughness:1,transparent:!1,depthTest:!0,side:ui})),s.DefaultMaterial}function Wi(s,e,t){for(const n in t.extensions)s[n]===void 0&&(e.userData.gltfExtensions=e.userData.gltfExtensions||{},e.userData.gltfExtensions[n]=t.extensions[n])}function zn(s,e){e.extras!==void 0&&(typeof e.extras=="object"?Object.assign(s.userData,e.extras):console.warn("THREE.GLTFLoader: Ignoring primitive type .extras, "+e.extras))}function jx(s,e,t){let n=!1,i=!1,r=!1;for(let c=0,h=e.length;c<h;c++){const u=e[c];if(u.POSITION!==void 0&&(n=!0),u.NORMAL!==void 0&&(i=!0),u.COLOR_0!==void 0&&(r=!0),n&&i&&r)break}if(!n&&!i&&!r)return Promise.resolve(s);const o=[],a=[],l=[];for(let c=0,h=e.length;c<h;c++){const u=e[c];if(n){const d=u.POSITION!==void 0?t.getDependency("accessor",u.POSITION):s.attributes.position;o.push(d)}if(i){const d=u.NORMAL!==void 0?t.getDependency("accessor",u.NORMAL):s.attributes.normal;a.push(d)}if(r){const d=u.COLOR_0!==void 0?t.getDependency("accessor",u.COLOR_0):s.attributes.color;l.push(d)}}return Promise.all([Promise.all(o),Promise.all(a),Promise.all(l)]).then(function(c){const h=c[0],u=c[1],d=c[2];return n&&(s.morphAttributes.position=h),i&&(s.morphAttributes.normal=u),r&&(s.morphAttributes.color=d),s.morphTargetsRelative=!0,s})}function Kx(s,e){if(s.updateMorphTargets(),e.weights!==void 0)for(let t=0,n=e.weights.length;t<n;t++)s.morphTargetInfluences[t]=e.weights[t];if(e.extras&&Array.isArray(e.extras.targetNames)){const t=e.extras.targetNames;if(s.morphTargetInfluences.length===t.length){s.morphTargetDictionary={};for(let n=0,i=t.length;n<i;n++)s.morphTargetDictionary[t[n]]=n}else console.warn("THREE.GLTFLoader: Invalid extras.targetNames length. Ignoring names.")}}function Jx(s){let e;const t=s.extensions&&s.extensions[nt.KHR_DRACO_MESH_COMPRESSION];if(t?e="draco:"+t.bufferView+":"+t.indices+":"+ga(t.attributes):e=s.indices+":"+ga(s.attributes)+":"+s.mode,s.targets!==void 0)for(let n=0,i=s.targets.length;n<i;n++)e+=":"+ga(s.targets[n]);return e}function ga(s){let e="";const t=Object.keys(s).sort();for(let n=0,i=t.length;n<i;n++)e+=t[n]+":"+s[t[n]]+";";return e}function gc(s){switch(s){case Int8Array:return 1/127;case Uint8Array:return 1/255;case Int16Array:return 1/32767;case Uint16Array:return 1/65535;default:throw new Error("THREE.GLTFLoader: Unsupported normalized accessor component type.")}}function Zx(s){return s.search(/\.jpe?g($|\?)/i)>0||s.search(/^data\:image\/jpeg/)===0?"image/jpeg":s.search(/\.webp($|\?)/i)>0||s.search(/^data\:image\/webp/)===0?"image/webp":s.search(/\.ktx2($|\?)/i)>0||s.search(/^data\:image\/ktx2/)===0?"image/ktx2":"image/png"}const $x=new Ze;class Qx{constructor(e={},t={}){this.json=e,this.extensions={},this.plugins={},this.options=t,this.cache=new yx,this.associations=new Map,this.primitiveCache={},this.nodeCache={},this.meshCache={refs:{},uses:{}},this.cameraCache={refs:{},uses:{}},this.lightCache={refs:{},uses:{}},this.sourceCache={},this.textureCache={},this.nodeNamesUsed={};let n=!1,i=-1,r=!1,o=-1;if(typeof navigator<"u"){const a=navigator.userAgent;n=/^((?!chrome|android).)*safari/i.test(a)===!0;const l=a.match(/Version\/(\d+)/);i=n&&l?parseInt(l[1],10):-1,r=a.indexOf("Firefox")>-1,o=r?a.match(/Firefox\/([0-9]+)\./)[1]:-1}typeof createImageBitmap>"u"||n&&i<17||r&&o<98?this.textureLoader=new _o(this.options.manager):this.textureLoader=new bp(this.options.manager),this.textureLoader.setCrossOrigin(this.options.crossOrigin),this.textureLoader.setRequestHeader(this.options.requestHeader),this.fileLoader=new _u(this.options.manager),this.fileLoader.setResponseType("arraybuffer"),this.options.crossOrigin==="use-credentials"&&this.fileLoader.setWithCredentials(!0)}setExtensions(e){this.extensions=e}setPlugins(e){this.plugins=e}parse(e,t){const n=this,i=this.json,r=this.extensions;this.cache.removeAll(),this.nodeCache={},this._invokeAll(function(o){return o._markDefs&&o._markDefs()}),Promise.all(this._invokeAll(function(o){return o.beforeRoot&&o.beforeRoot()})).then(function(){return Promise.all([n.getDependencies("scene"),n.getDependencies("animation"),n.getDependencies("camera")])}).then(function(o){const a={scene:o[0][i.scene||0],scenes:o[0],animations:o[1],cameras:o[2],asset:i.asset,parser:n,userData:{}};return Wi(r,a,i),zn(a,i),Promise.all(n._invokeAll(function(l){return l.afterRoot&&l.afterRoot(a)})).then(function(){for(const l of a.scenes)l.updateMatrixWorld();e(a)})}).catch(t)}_markDefs(){const e=this.json.nodes||[],t=this.json.skins||[],n=this.json.meshes||[];for(let i=0,r=t.length;i<r;i++){const o=t[i].joints;for(let a=0,l=o.length;a<l;a++)e[o[a]].isBone=!0}for(let i=0,r=e.length;i<r;i++){const o=e[i];o.mesh!==void 0&&(this._addNodeRef(this.meshCache,o.mesh),o.skin!==void 0&&(n[o.mesh].isSkinnedMesh=!0)),o.camera!==void 0&&this._addNodeRef(this.cameraCache,o.camera)}}_addNodeRef(e,t){t!==void 0&&(e.refs[t]===void 0&&(e.refs[t]=e.uses[t]=0),e.refs[t]++)}_getNodeRef(e,t,n){if(e.refs[t]<=1)return n;const i=n.clone(),r=(o,a)=>{const l=this.associations.get(o);l!=null&&this.associations.set(a,l);for(const[c,h]of o.children.entries())r(h,a.children[c])};return r(n,i),i.name+="_instance_"+e.uses[t]++,i}_invokeOne(e){const t=Object.values(this.plugins);t.push(this);for(let n=0;n<t.length;n++){const i=e(t[n]);if(i)return i}return null}_invokeAll(e){const t=Object.values(this.plugins);t.unshift(this);const n=[];for(let i=0;i<t.length;i++){const r=e(t[i]);r&&n.push(r)}return n}getDependency(e,t){const n=e+":"+t;let i=this.cache.get(n);if(!i){switch(e){case"scene":i=this.loadScene(t);break;case"node":i=this._invokeOne(function(r){return r.loadNode&&r.loadNode(t)});break;case"mesh":i=this._invokeOne(function(r){return r.loadMesh&&r.loadMesh(t)});break;case"accessor":i=this.loadAccessor(t);break;case"bufferView":i=this._invokeOne(function(r){return r.loadBufferView&&r.loadBufferView(t)});break;case"buffer":i=this.loadBuffer(t);break;case"material":i=this._invokeOne(function(r){return r.loadMaterial&&r.loadMaterial(t)});break;case"texture":i=this._invokeOne(function(r){return r.loadTexture&&r.loadTexture(t)});break;case"skin":i=this.loadSkin(t);break;case"animation":i=this._invokeOne(function(r){return r.loadAnimation&&r.loadAnimation(t)});break;case"camera":i=this.loadCamera(t);break;default:if(i=this._invokeOne(function(r){return r!=this&&r.getDependency&&r.getDependency(e,t)}),!i)throw new Error("Unknown type: "+e);break}this.cache.add(n,i)}return i}getDependencies(e){let t=this.cache.get(e);if(!t){const n=this,i=this.json[e+(e==="mesh"?"es":"s")]||[];t=Promise.all(i.map(function(r,o){return n.getDependency(e,o)})),this.cache.add(e,t)}return t}loadBuffer(e){const t=this.json.buffers[e],n=this.fileLoader;if(t.type&&t.type!=="arraybuffer")throw new Error("THREE.GLTFLoader: "+t.type+" buffer type is not supported.");if(t.uri===void 0&&e===0)return Promise.resolve(this.extensions[nt.KHR_BINARY_GLTF].body);const i=this.options;return new Promise(function(r,o){n.load(sr.resolveURL(t.uri,i.path),r,void 0,function(){o(new Error('THREE.GLTFLoader: Failed to load buffer "'+t.uri+'".'))})})}loadBufferView(e){const t=this.json.bufferViews[e];return this.getDependency("buffer",t.buffer).then(function(n){const i=t.byteLength||0,r=t.byteOffset||0;return n.slice(r,r+i)})}loadAccessor(e){const t=this,n=this.json,i=this.json.accessors[e];if(i.bufferView===void 0&&i.sparse===void 0){const o=pa[i.type],a=Ts[i.componentType],l=i.normalized===!0,c=new a(i.count*o);return Promise.resolve(new Yt(c,o,l))}const r=[];return i.bufferView!==void 0?r.push(this.getDependency("bufferView",i.bufferView)):r.push(null),i.sparse!==void 0&&(r.push(this.getDependency("bufferView",i.sparse.indices.bufferView)),r.push(this.getDependency("bufferView",i.sparse.values.bufferView))),Promise.all(r).then(function(o){const a=o[0],l=pa[i.type],c=Ts[i.componentType],h=c.BYTES_PER_ELEMENT,u=h*l,d=i.byteOffset||0,f=i.bufferView!==void 0?n.bufferViews[i.bufferView].byteStride:void 0,g=i.normalized===!0;let x,m;if(f&&f!==u){const p=Math.floor(d/f),M="InterleavedBuffer:"+i.bufferView+":"+i.componentType+":"+p+":"+i.count;let y=t.cache.get(M);y||(x=new c(a,p*f,i.count*f/h),y=new Pf(x,f/h),t.cache.add(M,y)),m=new Fc(y,l,d%f/h,g)}else a===null?x=new c(i.count*l):x=new c(a,d,i.count*l),m=new Yt(x,l,g);if(i.sparse!==void 0){const p=pa.SCALAR,M=Ts[i.sparse.indices.componentType],y=i.sparse.indices.byteOffset||0,v=i.sparse.values.byteOffset||0,w=new M(o[1],y,i.sparse.count*p),S=new c(o[2],v,i.sparse.count*l);a!==null&&(m=new Yt(m.array.slice(),m.itemSize,m.normalized)),m.normalized=!1;for(let R=0,I=w.length;R<I;R++){const T=w[R];if(m.setX(T,S[R*l]),l>=2&&m.setY(T,S[R*l+1]),l>=3&&m.setZ(T,S[R*l+2]),l>=4&&m.setW(T,S[R*l+3]),l>=5)throw new Error("THREE.GLTFLoader: Unsupported itemSize in sparse BufferAttribute.")}m.normalized=g}return m})}loadTexture(e){const t=this.json,n=this.options,r=t.textures[e].source,o=t.images[r];let a=this.textureLoader;if(o.uri){const l=n.manager.getHandler(o.uri);l!==null&&(a=l)}return this.loadTextureImage(e,r,a)}loadTextureImage(e,t,n){const i=this,r=this.json,o=r.textures[e],a=r.images[t],l=(a.uri||a.bufferView)+":"+o.sampler;if(this.textureCache[l])return this.textureCache[l];const c=this.loadImageSource(t,n).then(function(h){h.flipY=!1,h.name=o.name||a.name||"",h.name===""&&typeof a.uri=="string"&&a.uri.startsWith("data:image/")===!1&&(h.name=a.uri);const d=(r.samplers||{})[o.sampler]||{};return h.magFilter=vh[d.magFilter]||pn,h.minFilter=vh[d.minFilter]||ri,h.wrapS=Mh[d.wrapS]||Zi,h.wrapT=Mh[d.wrapT]||Zi,h.generateMipmaps=!h.isCompressedTexture&&h.minFilter!==$t&&h.minFilter!==pn,i.associations.set(h,{textures:e}),h}).catch(function(){return null});return this.textureCache[l]=c,c}loadImageSource(e,t){const n=this,i=this.json,r=this.options;if(this.sourceCache[e]!==void 0)return this.sourceCache[e].then(u=>u.clone());const o=i.images[e],a=self.URL||self.webkitURL;let l=o.uri||"",c=!1;if(o.bufferView!==void 0)l=n.getDependency("bufferView",o.bufferView).then(function(u){c=!0;const d=new Blob([u],{type:o.mimeType});return l=a.createObjectURL(d),l});else if(o.uri===void 0)throw new Error("THREE.GLTFLoader: Image "+e+" is missing URI and bufferView");const h=Promise.resolve(l).then(function(u){return new Promise(function(d,f){let g=d;t.isImageBitmapLoader===!0&&(g=function(x){const m=new Nt(x);m.needsUpdate=!0,d(m)}),t.load(sr.resolveURL(u,r.path),g,void 0,f)})}).then(function(u){return c===!0&&a.revokeObjectURL(l),zn(u,o),u.userData.mimeType=o.mimeType||Zx(o.uri),u}).catch(function(u){throw console.error("THREE.GLTFLoader: Couldn't load texture",l),u});return this.sourceCache[e]=h,h}assignTexture(e,t,n,i){const r=this;return this.getDependency("texture",n.index).then(function(o){if(!o)return null;if(n.texCoord!==void 0&&n.texCoord>0&&(o=o.clone(),o.channel=n.texCoord),r.extensions[nt.KHR_TEXTURE_TRANSFORM]){const a=n.extensions!==void 0?n.extensions[nt.KHR_TEXTURE_TRANSFORM]:void 0;if(a){const l=r.associations.get(o);o=r.extensions[nt.KHR_TEXTURE_TRANSFORM].extendTexture(o,a),r.associations.set(o,l)}}return i!==void 0&&(o.colorSpace=i),e[t]=o,o})}assignFinalMaterial(e){const t=e.geometry;let n=e.material;const i=t.attributes.tangent===void 0,r=t.attributes.color!==void 0,o=t.attributes.normal===void 0;if(e.isPoints){const a="PointsMaterial:"+n.uuid;let l=this.cache.get(a);l||(l=new lu,Hn.prototype.copy.call(l,n),l.color.copy(n.color),l.map=n.map,l.sizeAttenuation=!1,this.cache.add(a,l)),n=l}else if(e.isLine){const a="LineBasicMaterial:"+n.uuid;let l=this.cache.get(a);l||(l=new cu,Hn.prototype.copy.call(l,n),l.color.copy(n.color),l.map=n.map,this.cache.add(a,l)),n=l}if(i||r||o){let a="ClonedMaterial:"+n.uuid+":";i&&(a+="derivative-tangents:"),r&&(a+="vertex-colors:"),o&&(a+="flat-shading:");let l=this.cache.get(a);l||(l=n.clone(),r&&(l.vertexColors=!0),o&&(l.flatShading=!0),i&&(l.normalScale&&(l.normalScale.y*=-1),l.clearcoatNormalScale&&(l.clearcoatNormalScale.y*=-1)),this.cache.add(a,l),this.associations.set(l,this.associations.get(n))),n=l}e.material=n}getMaterialType(){return st}loadMaterial(e){const t=this,n=this.json,i=this.extensions,r=n.materials[e];let o;const a={},l=r.extensions||{},c=[];if(l[nt.KHR_MATERIALS_UNLIT]){const u=i[nt.KHR_MATERIALS_UNLIT];o=u.getMaterialType(),c.push(u.extendParams(a,r,t))}else{const u=r.pbrMetallicRoughness||{};if(a.color=new Ye(1,1,1),a.opacity=1,Array.isArray(u.baseColorFactor)){const d=u.baseColorFactor;a.color.setRGB(d[0],d[1],d[2],Qt),a.opacity=d[3]}u.baseColorTexture!==void 0&&c.push(t.assignTexture(a,"map",u.baseColorTexture,Mt)),a.metalness=u.metallicFactor!==void 0?u.metallicFactor:1,a.roughness=u.roughnessFactor!==void 0?u.roughnessFactor:1,u.metallicRoughnessTexture!==void 0&&(c.push(t.assignTexture(a,"metalnessMap",u.metallicRoughnessTexture)),c.push(t.assignTexture(a,"roughnessMap",u.metallicRoughnessTexture))),o=this._invokeOne(function(d){return d.getMaterialType&&d.getMaterialType(e)}),c.push(Promise.all(this._invokeAll(function(d){return d.extendMaterialParams&&d.extendMaterialParams(e,a)})))}r.doubleSided===!0&&(a.side=Ct);const h=r.alphaMode||ma.OPAQUE;if(h===ma.BLEND?(a.transparent=!0,a.depthWrite=!1):(a.transparent=!1,h===ma.MASK&&(a.alphaTest=r.alphaCutoff!==void 0?r.alphaCutoff:.5)),r.normalTexture!==void 0&&o!==Xt&&(c.push(t.assignTexture(a,"normalMap",r.normalTexture)),a.normalScale=new Oe(1,1),r.normalTexture.scale!==void 0)){const u=r.normalTexture.scale;a.normalScale.set(u,u)}if(r.occlusionTexture!==void 0&&o!==Xt&&(c.push(t.assignTexture(a,"aoMap",r.occlusionTexture)),r.occlusionTexture.strength!==void 0&&(a.aoMapIntensity=r.occlusionTexture.strength)),r.emissiveFactor!==void 0&&o!==Xt){const u=r.emissiveFactor;a.emissive=new Ye().setRGB(u[0],u[1],u[2],Qt)}return r.emissiveTexture!==void 0&&o!==Xt&&c.push(t.assignTexture(a,"emissiveMap",r.emissiveTexture,Mt)),Promise.all(c).then(function(){const u=new o(a);return r.name&&(u.name=r.name),zn(u,r),t.associations.set(u,{materials:e}),r.extensions&&Wi(i,u,r),u})}createUniqueName(e){const t=ut.sanitizeNodeName(e||"");return t in this.nodeNamesUsed?t+"_"+ ++this.nodeNamesUsed[t]:(this.nodeNamesUsed[t]=0,t)}loadGeometries(e){const t=this,n=this.extensions,i=this.primitiveCache;function r(a){return n[nt.KHR_DRACO_MESH_COMPRESSION].decodePrimitive(a,t).then(function(l){return yh(l,a,t)})}const o=[];for(let a=0,l=e.length;a<l;a++){const c=e[a],h=Jx(c),u=i[h];if(u)o.push(u.promise);else{let d;c.extensions&&c.extensions[nt.KHR_DRACO_MESH_COMPRESSION]?d=r(c):d=yh(new dt,c,t),i[h]={primitive:c,promise:d},o.push(d)}}return Promise.all(o)}loadMesh(e){const t=this,n=this.json,i=this.extensions,r=n.meshes[e],o=r.primitives,a=[];for(let l=0,c=o.length;l<c;l++){const h=o[l].material===void 0?Yx(this.cache):this.getDependency("material",o[l].material);a.push(h)}return a.push(t.loadGeometries(o)),Promise.all(a).then(function(l){const c=l.slice(0,l.length-1),h=l[l.length-1],u=[];for(let f=0,g=h.length;f<g;f++){const x=h[f],m=o[f];let p;const M=c[f];if(m.mode===bn.TRIANGLES||m.mode===bn.TRIANGLE_STRIP||m.mode===bn.TRIANGLE_FAN||m.mode===void 0)p=r.isSkinnedMesh===!0?new Df(x,M):new Fe(x,M),p.isSkinnedMesh===!0&&p.normalizeSkinWeights(),m.mode===bn.TRIANGLE_STRIP?p.geometry=_h(p.geometry,Yh):m.mode===bn.TRIANGLE_FAN&&(p.geometry=_h(p.geometry,cc));else if(m.mode===bn.LINES)p=new Bf(x,M);else if(m.mode===bn.LINE_STRIP)p=new zc(x,M);else if(m.mode===bn.LINE_LOOP)p=new kf(x,M);else if(m.mode===bn.POINTS)p=new Hf(x,M);else throw new Error("THREE.GLTFLoader: Primitive mode unsupported: "+m.mode);Object.keys(p.geometry.morphAttributes).length>0&&Kx(p,r),p.name=t.createUniqueName(r.name||"mesh_"+e),zn(p,r),m.extensions&&Wi(i,p,m),t.assignFinalMaterial(p),u.push(p)}for(let f=0,g=u.length;f<g;f++)t.associations.set(u[f],{meshes:e,primitives:f});if(u.length===1)return r.extensions&&Wi(i,u[0],r),u[0];const d=new at;r.extensions&&Wi(i,d,r),t.associations.set(d,{meshes:e});for(let f=0,g=u.length;f<g;f++)d.add(u[f]);return d})}loadCamera(e){let t;const n=this.json.cameras[e],i=n[n.type];if(!i){console.warn("THREE.GLTFLoader: Missing camera parameters.");return}return n.type==="perspective"?t=new Zt(po.radToDeg(i.yfov),i.aspectRatio||1,i.znear||1,i.zfar||2e6):n.type==="orthographic"&&(t=new Vc(-i.xmag,i.xmag,i.ymag,-i.ymag,i.znear,i.zfar)),n.name&&(t.name=this.createUniqueName(n.name)),zn(t,n),Promise.resolve(t)}loadSkin(e){const t=this.json.skins[e],n=[];for(let i=0,r=t.joints.length;i<r;i++)n.push(this._loadNodeShallow(t.joints[i]));return t.inverseBindMatrices!==void 0?n.push(this.getDependency("accessor",t.inverseBindMatrices)):n.push(null),Promise.all(n).then(function(i){const r=i.pop(),o=i,a=[],l=[];for(let c=0,h=o.length;c<h;c++){const u=o[c];if(u){a.push(u);const d=new Ze;r!==null&&d.fromArray(r.array,c*16),l.push(d)}else console.warn('THREE.GLTFLoader: Joint "%s" could not be found.',t.joints[c])}return new Oc(a,l)})}loadAnimation(e){const t=this.json,n=this,i=t.animations[e],r=i.name?i.name:"animation_"+e,o=[],a=[],l=[],c=[],h=[];for(let u=0,d=i.channels.length;u<d;u++){const f=i.channels[u],g=i.samplers[f.sampler],x=f.target,m=x.node,p=i.parameters!==void 0?i.parameters[g.input]:g.input,M=i.parameters!==void 0?i.parameters[g.output]:g.output;x.node!==void 0&&(o.push(this.getDependency("node",m)),a.push(this.getDependency("accessor",p)),l.push(this.getDependency("accessor",M)),c.push(g),h.push(x))}return Promise.all([Promise.all(o),Promise.all(a),Promise.all(l),Promise.all(c),Promise.all(h)]).then(function(u){const d=u[0],f=u[1],g=u[2],x=u[3],m=u[4],p=[];for(let y=0,v=d.length;y<v;y++){const w=d[y],S=f[y],R=g[y],I=x[y],T=m[y];if(w===void 0)continue;w.updateMatrix&&w.updateMatrix();const b=n._createAnimationTracks(w,S,R,I,T);if(b)for(let U=0;U<b.length;U++)p.push(b[U])}const M=new dc(r,void 0,p);return zn(M,i),M})}createNodeMesh(e){const t=this.json,n=this,i=t.nodes[e];return i.mesh===void 0?null:n.getDependency("mesh",i.mesh).then(function(r){const o=n._getNodeRef(n.meshCache,i.mesh,r);return i.weights!==void 0&&o.traverse(function(a){if(a.isMesh)for(let l=0,c=i.weights.length;l<c;l++)a.morphTargetInfluences[l]=i.weights[l]}),o})}loadNode(e){const t=this.json,n=this,i=t.nodes[e],r=n._loadNodeShallow(e),o=[],a=i.children||[];for(let c=0,h=a.length;c<h;c++)o.push(n.getDependency("node",a[c]));const l=i.skin===void 0?Promise.resolve(null):n.getDependency("skin",i.skin);return Promise.all([r,Promise.all(o),l]).then(function(c){const h=c[0],u=c[1],d=c[2];d!==null&&h.traverse(function(f){f.isSkinnedMesh&&f.bind(d,$x)});for(let f=0,g=u.length;f<g;f++)h.add(u[f]);return h})}_loadNodeShallow(e){const t=this.json,n=this.extensions,i=this;if(this.nodeCache[e]!==void 0)return this.nodeCache[e];const r=t.nodes[e],o=r.name?i.createUniqueName(r.name):"",a=[],l=i._invokeOne(function(c){return c.createNodeMesh&&c.createNodeMesh(e)});return l&&a.push(l),r.camera!==void 0&&a.push(i.getDependency("camera",r.camera).then(function(c){return i._getNodeRef(i.cameraCache,r.camera,c)})),i._invokeAll(function(c){return c.createNodeAttachment&&c.createNodeAttachment(e)}).forEach(function(c){a.push(c)}),this.nodeCache[e]=Promise.all(a).then(function(c){let h;if(r.isBone===!0?h=new ru:c.length>1?h=new at:c.length===1?h=c[0]:h=new Et,h!==c[0])for(let u=0,d=c.length;u<d;u++)h.add(c[u]);if(r.name&&(h.userData.name=r.name,h.name=o),zn(h,r),r.extensions&&Wi(n,h,r),r.matrix!==void 0){const u=new Ze;u.fromArray(r.matrix),h.applyMatrix4(u)}else r.translation!==void 0&&h.position.fromArray(r.translation),r.rotation!==void 0&&h.quaternion.fromArray(r.rotation),r.scale!==void 0&&h.scale.fromArray(r.scale);if(!i.associations.has(h))i.associations.set(h,{});else if(r.mesh!==void 0&&i.meshCache.refs[r.mesh]>1){const u=i.associations.get(h);i.associations.set(h,{...u})}return i.associations.get(h).nodes=e,h}),this.nodeCache[e]}loadScene(e){const t=this.extensions,n=this.json.scenes[e],i=this,r=new at;n.name&&(r.name=i.createUniqueName(n.name)),zn(r,n),n.extensions&&Wi(t,r,n);const o=n.nodes||[],a=[];for(let l=0,c=o.length;l<c;l++)a.push(i.getDependency("node",o[l]));return Promise.all(a).then(function(l){for(let h=0,u=l.length;h<u;h++)r.add(l[h]);const c=h=>{const u=new Map;for(const[d,f]of i.associations)(d instanceof Hn||d instanceof Nt)&&u.set(d,f);return h.traverse(d=>{const f=i.associations.get(d);f!=null&&u.set(d,f)}),u};return i.associations=c(r),r})}_createAnimationTracks(e,t,n,i,r){const o=[],a=e.name?e.name:e.uuid,l=[];Si[r.path]===Si.weights?e.traverse(function(d){d.morphTargetInfluences&&l.push(d.name?d.name:d.uuid)}):l.push(a);let c;switch(Si[r.path]){case Si.weights:c=Ds;break;case Si.rotation:c=Ns;break;case Si.translation:case Si.scale:c=Us;break;default:switch(n.itemSize){case 1:c=Ds;break;case 2:case 3:default:c=Us;break}break}const h=i.interpolation!==void 0?qx[i.interpolation]:dr,u=this._getArrayFromAccessor(n);for(let d=0,f=l.length;d<f;d++){const g=new c(l[d]+"."+Si[r.path],t.array,u,h);i.interpolation==="CUBICSPLINE"&&this._createCubicSplineTrackInterpolant(g),o.push(g)}return o}_getArrayFromAccessor(e){let t=e.array;if(e.normalized){const n=gc(t.constructor),i=new Float32Array(t.length);for(let r=0,o=t.length;r<o;r++)i[r]=t[r]*n;t=i}return t}_createCubicSplineTrackInterpolant(e){e.createInterpolant=function(n){const i=this instanceof Ns?Xx:Tu;return new i(this.times,this.values,this.getValueSize()/3,n)},e.createInterpolant.isInterpolantFactoryMethodGLTFCubicSpline=!0}}function ev(s,e,t){const n=e.attributes,i=new Yn;if(n.POSITION!==void 0){const a=t.json.accessors[n.POSITION],l=a.min,c=a.max;if(l!==void 0&&c!==void 0){if(i.set(new P(l[0],l[1],l[2]),new P(c[0],c[1],c[2])),a.normalized){const h=gc(Ts[a.componentType]);i.min.multiplyScalar(h),i.max.multiplyScalar(h)}}else{console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.");return}}else return;const r=e.targets;if(r!==void 0){const a=new P,l=new P;for(let c=0,h=r.length;c<h;c++){const u=r[c];if(u.POSITION!==void 0){const d=t.json.accessors[u.POSITION],f=d.min,g=d.max;if(f!==void 0&&g!==void 0){if(l.setX(Math.max(Math.abs(f[0]),Math.abs(g[0]))),l.setY(Math.max(Math.abs(f[1]),Math.abs(g[1]))),l.setZ(Math.max(Math.abs(f[2]),Math.abs(g[2]))),d.normalized){const x=gc(Ts[d.componentType]);l.multiplyScalar(x)}a.max(l)}else console.warn("THREE.GLTFLoader: Missing min/max properties for accessor POSITION.")}}i.expandByVector(a)}s.boundingBox=i;const o=new jn;i.getCenter(o.center),o.radius=i.min.distanceTo(i.max)/2,s.boundingSphere=o}function yh(s,e,t){const n=e.attributes,i=[];function r(o,a){return t.getDependency("accessor",o).then(function(l){s.setAttribute(a,l)})}for(const o in n){const a=mc[o]||o.toLowerCase();a in s.attributes||i.push(r(n[o],a))}if(e.indices!==void 0&&!s.index){const o=t.getDependency("accessor",e.indices).then(function(a){s.setIndex(a)});i.push(o)}return ot.workingColorSpace!==Qt&&"COLOR_0"in n&&console.warn(`THREE.GLTFLoader: Converting vertex colors from "srgb-linear" to "${ot.workingColorSpace}" not supported.`),zn(s,e),ev(s,e,t),Promise.all(i).then(function(){return e.targets!==void 0?jx(s,e.targets,t):s})}let tv;function nv(s){const e=s.attributes.position,t=s.attributes.normal,n=s.index.array,i=[],r=[],o=[],a=c=>{const u=-.022+po.smoothstep(-c[2],.01,.04)*(.097+.013*Math.exp(-(((c[0]+.025)/.035)**2)));return Math.min(c[1]-u,Math.abs(c[0])>.071?c[1]-.035:1)};for(let c=0;c<n.length;c+=3){let h=[n[c],n[c+1],n[c+2]].map(f=>[e.getX(f),e.getY(f),e.getZ(f),t.getX(f),t.getY(f),t.getZ(f)]),u=[];for(let f=0;f<3;f++){const g=h[f],x=h[(f+1)%3],m=a(g),p=a(x);if(m>=0&&u.push(g),m>=0!=p>=0){const M=m/(m-p);u.push(g.map((y,v)=>y+M*(x[v]-y)))}}const d=i.length/3;for(const f of u)i.push(f[0]+f[3]*.002,f[1]+f[4]*.002,f[2]+f[5]*.002),r.push(...f.slice(3));for(let f=1;f<u.length-1;f++)o.push(d,d+f,d+f+1)}const l=new dt;return l.setAttribute("position",new We(i,3)),l.setAttribute("normal",new We(r,3)),l.setIndex(o),l.computeBoundingSphere(),l}function iv(){const s=document.createElement("canvas");s.width=128,s.height=64;const e=s.getContext("2d"),t=e.createImageData(128,64);for(let i=0;i<64;i++)for(let r=0;r<128;r++){const o=(r/127-.5)*.026,a=(i/63-.5)*.01,l=Math.hypot(o,a),c=Math.atan2(a,o),h=(i*128+r)*4;let u=[171,160,148];if(l<.004){const d=(Math.sin(c*39+l*6500)+1)*9,f=l/.004;u=l<.00165?[22,24,22]:[69+d*f,64+d*.7,48+d*.5],l>.0037&&(u=[42,43,35])}Math.hypot(o+.001,a-.0013)<42e-5&&(u=[184,179,163]),t.data.set([...u,255],h)}e.putImageData(t,0,0);const n=new Ps(s);return n.colorSpace=Mt,new st({map:n,roughness:.36})}function sv(){const s=[0,0,-.089],e=[.5,.5],t=[];for(let i=0;i<=40;i++){const r=i/40*Math.PI*2,o=Math.cos(r)*.0125,a=Math.sin(r)*.004;s.push(o,a,-.0845),e.push(.5+o/.026,.5+a/.01),i>0&&t.push(0,i+1,i)}const n=new dt;return n.setAttribute("position",new We(s,3)),n.setAttribute("uv",new We(e,2)),n.setIndex(t),n.computeVertexNormals(),n}function rv(){return tv??(tv=Promise.all([new qc().loadAsync("/assets/human/head.glb"),new _o().loadAsync("/assets/human/face-color.jpg"),new _o().loadAsync("/assets/human/face-normal.jpg")]).then(([s,e,t])=>{let n;return s.scene.traverse(i=>{i.isMesh&&(n=i.geometry)}),e.colorSpace=Mt,e.flipY=!0,t.flipY=!0,e.anisotropy=4,{geometry:n,map:e,normalMap:t,scalp:nv(n),eyeGeo:sv(),eyeMat:iv()}}))}async function ov({head:s,fallback:e,hairMesh:t,skinMat:n,variant:i=0}){const{geometry:r,map:o,normalMap:a,scalp:l,eyeGeo:c,eyeMat:h}=await rv(),u=["#fff7ed","#d8b9a0","#ebd3ba","#cbb098","#f4ddc9","#e5c5ae"][i%6],d=new st({map:o,normalMap:a,color:u,normalScale:new Oe(.48,.48),roughness:.78}),f=new at;s.add(f);const g=new Fe(r,d);g.name="Photographic face",f.add(g);const x=new Fe(l,t.material);f.add(x);const m=new at;f.add(m);for(const p of[-.024,.033]){const M=new Fe(c,h);M.position.set(p,.008,0),m.add(M)}return f.traverse(p=>{p.isMesh&&(p.castShadow=!0,p.userData.dynamic=!0)}),n.color.set("#b98a73").multiply(new Ye(u)),{update({detail:p=!0,time:M=1,fallen:y=0}={}){f.visible=p,e.visible=!p,t.visible=!p,m.visible=!y&&(M+i*.71)%5.3>.11},scan:g}}let Ei;const av=new _n(1,8,6),_a=new Map;function cv(){if(Ei||typeof document>"u")return Ei;const s=document.createElement("canvas");s.width=s.height=128;const e=s.getContext("2d");if(!(e!=null&&e.createImageData))return null;const t=e.createImageData(128,128);let n=391;for(let i=0;i<128;i++)for(let r=0;r<128;r++){n=n*1664525+1013904223>>>0;const o=((r+i)%4===0?-12:0)+(r%2===0?4:0),a=235+o+n%13,l=(i*128+r)*4;t.data[l]=t.data[l+1]=t.data[l+2]=a,t.data[l+3]=255}return e.putImageData(t,0,0),Ei=new Ps(s),Ei.colorSpace=Mt,Ei.wrapS=Ei.wrapT=Zi,Ei.repeat.set(3,3),Ei}function Jr(s,e){const t=s+e;if(_a.has(t))return _a.get(t);const n={thigh:[[-.5,.92],[-.37,1.03],[-.13,.99],[.13,.87],[.35,.74],[.5,.74]],shin:[[-.5,1.01],[-.3,1.1],[-.1,.96],[.16,.83],[.35,.72],[.5,.76]],sleeve:[[-.5,.84],[-.36,1.08],[-.13,1.02],[.12,.87],[.34,.78],[.5,.84]],forearm:[[-.5,1.08],[-.31,1.02],[-.05,.91],[.23,.72],[.4,.7],[.5,.79]]}[s],i=e?12:20,r=[],o=[],a=[];for(let c=0;c<n.length;c++){const[h,u]=n[c];for(let d=0;d<=i;d++){const f=d/i*Math.PI*2,g=1+.025*Math.sin(f*3+c*2);r.push(Math.sin(f)*u*g,h,Math.cos(f)*u*.94*g),o.push(d/i,c/(n.length-1))}}for(let c=0;c<n.length-1;c++)for(let h=0;h<i;h++){const u=c*(i+1)+h,d=u+i+1;a.push(u,u+1,d,u+1,d+1,d)}const l=new dt;return l.setAttribute("position",new We(r,3)),l.setAttribute("uv",new We(o,2)),l.setIndex(a),l.computeVertexNormals(),_a.set(t,l),l}function lv(s,e,t){const n=new at,i=(o,a,l,c,h,u)=>{const d=new Fe(av,s);return d.position.set(o,a,l),d.scale.set(c,h,u),n.add(d),d};i(0,-.022,0,.034,.045,.018);for(let o=0;o<4;o++){const a=[.043,.05,.047,.036][o],l=(o-1.5)*.015;i(l,-.054-a*.28,-.004,.008,a*.57,.008),i(l,-.062-a*.7,-.013,.0075,a*.28,.0075)}const r=i(-e*.033,-.022,-.007,.012,.034,.011);return r.rotation.z=-e*.45,n}function wu(s){const e=new Map,t=new Map,n=s.clone();return Au(s,n,function(i,r){e.set(r,i),t.set(i,r)}),n.traverse(function(i){if(!i.isSkinnedMesh)return;const r=i,o=e.get(i),a=o.skeleton.bones;r.skeleton=o.skeleton.clone(),r.bindMatrix.copy(o.bindMatrix),r.skeleton.bones=a.map(function(l){return t.get(l)}),r.bind(r.skeleton,r.bindMatrix)}),n}function Au(s,e,t){t(s,e);for(let n=0;n<s.children.length;n++)Au(s.children[n],e.children[n],t)}let bh;async function hv({group:s,rig:e,variant:t=0}){bh??(bh=new qc().loadAsync("/assets/civilian-rig.glb"));const n=await bh,i=wu(n.scene);s.add(i),i.updateMatrixWorld(!0);const r={};i.traverse(d=>{d.isBone&&(r[d.name.replace(/^mixamorig:?/,"")]=d),d.isMesh&&(d.material=d.material.clone(),d.material.roughness=.85,d.castShadow=!0,d.receiveShadow=!0,d.frustumCulled=!1,d.userData.dynamic=!0)});const o=new Yn().setFromObject(i).getSize(new P);i.scale.multiplyScalar(1.72/o.y),i.rotation.y=Math.PI,i.updateMatrixWorld(!0);const a=new Fe(new sn(.06,.115,.009),new st({color:"#16202b"}));s.add(a),a.visible=!1;const l=new Map;i.traverse(d=>{d.isBone&&l.set(d,{position:d.position.clone(),quaternion:d.quaternion.clone()})});const c=d=>s.worldToLocal(d.getWorldPosition(new P));function h(d,f,g){i.updateMatrixWorld(!0);const x=d.getWorldPosition(new P),m=f.getWorldPosition(new P).sub(x).normalize(),p=s.localToWorld(new P(...g)).sub(x).normalize();d.quaternion.copy(d.parent.getWorldQuaternion(new qt).invert().multiply(new qt().setFromUnitVectors(m,p).multiply(d.getWorldQuaternion(new qt)))),d.updateMatrixWorld(!0)}function u(d,f,g,x,m){const p=c(d),M=new P(...x),y=c(f).distanceTo(p),v=c(g).distanceTo(c(f)),w=M.clone().sub(p),S=Math.min(y+v-.001,Math.max(.01,w.length()));w.normalize();const R=(y*y-v*v+S*S)/(2*S),I=Math.sqrt(Math.max(0,y*y-R*R)),T=new P(...m).addScaledVector(w,-new P(...m).dot(w)).normalize(),b=p.clone().addScaledVector(w,R).addScaledVector(T,I);h(d,f,b.toArray()),h(f,g,x)}return{update({time:d=0,phase:f=0,speed:g=0,fallen:x=0,flinch:m=0,activity:p="walk",detail:M=!0}={}){if(i.visible=M,e.visible=!M,a.visible=M&&p==="phone",a.position.set(.16,1.3,-.25),!M)return;i.rotation.z=0,i.position.y=0;for(const[S,R]of l)S.position.copy(R.position),S.quaternion.copy(R.quaternion);i.updateMatrixWorld(!0);const y=Math.min(1,g/1.2),v=Math.min(1,g/3.8),w=1.06+Math.abs(Math.sin(f))*.022*y+Math.sin(d*2)*.003;r.Hips.position.copy(r.Hips.parent.worldToLocal(s.localToWorld(new P(0,w,0)))),r.Hips.updateMatrixWorld(!0);for(const S of[-1,1]){const R=S<0?"Left":"Right",I=f+(S>0?Math.PI:0),T=[S*.1,.12+Math.max(0,Math.cos(I))*(.1+v*.08)*y,Math.sin(I)*(.25+v*.12)*y];u(r[R+"UpLeg"],r[R+"Leg"],r[R+"Foot"],T,[0,0,-1]);let b=[S*.25,w-.16+v*.12,-.015+Math.sin(I)*(.19+v*.12)*y];p==="phone"&&S>0&&(b=[.16,1.3,-.25]),p==="talk"&&(b=[S*(.25+.05*Math.sin(d*1.8)),1.08+.09*Math.sin(d*1.6+S),-.24]),b[1]+=m*.14,u(r[R+"Arm"],r[R+"ForeArm"],r[R+"Hand"],b,[S*.5,0,1])}p==="phone"?r.Head.rotation.x+=.12:y||(r.Head.rotation.y+=Math.sin(d*.55+t)*.12),i.rotation.z=x*Math.PI*.48,i.position.y=x*.12}}}let Sh;const xa=()=>new P,On=()=>new qt;async function uv({group:s,rig:e,head:t,gunSocket:n}){Sh||(Sh=new qc().loadAsync("/assets/nightfall-rig.glb"));const i=await Sh,r=wu(i.scene);s.add(r),r.updateMatrixWorld(!0);const o={};r.traverse(m=>{m.isBone&&(o[m.name.replace("mixamorig","")]=m)}),r.traverse(m=>{if(m.isMesh){if(m.name.includes("visor")){m.visible=!1;return}if(m.material=m.material.clone(),m.material.color.set("#dce5df"),m.material.roughness=.78,m.castShadow=!0,m.receiveShadow=!0,m.frustumCulled=!1,m.userData.dynamic=!0,m.isSkinnedMesh){const p=m.geometry.clone(),M=[],y=p.attributes.skinIndex,v=p.attributes.skinWeight,w=new Set(m.skeleton.bones.map((S,R)=>/Head/.test(S.name)?R:-1));for(let S=0;S<p.index.count;S+=3){let R=!1;for(let I=0;I<3;I++){const T=p.index.getX(S+I);let b=0;for(let U=0;U<4;U++)w.has(y.getComponent(T,U))&&(b+=v.getComponent(T,U));b>.48&&(R=!0)}R||M.push(p.index.getX(S),p.index.getX(S+1),p.index.getX(S+2))}p.setIndex(M),m.geometry=p}}}),s.add(t,n),e.visible=!1;const a=o.Head.getWorldQuaternion(On()).invert(),l=new Fp(r),c={};for(const m of["Idle","Walk","Run"])c[m]=l.clipAction(i.animations.find(p=>p.name===m)),c[m].play(),c[m].weight=m==="Idle"?1:0;let h=0;const u=m=>s.worldToLocal(m.getWorldPosition(xa())),d=(m,p)=>{m.position.copy(m.parent.worldToLocal(s.localToWorld(new P(...p)))),m.updateMatrixWorld(!0)};function f(m,p,M){s.updateMatrixWorld(!0);const y=m.getWorldPosition(xa()),v=p.getWorldPosition(xa()).sub(y).normalize(),w=s.localToWorld(new P(...M)).sub(y).normalize(),R=On().setFromUnitVectors(v,w).multiply(m.getWorldQuaternion(On()));m.quaternion.copy(m.parent.getWorldQuaternion(On()).invert().multiply(R)),m.updateMatrixWorld(!0)}function g(m,p,M,y,v){const w=u(m),S=new P(...y),R=u(p).distanceTo(w),I=u(M).distanceTo(u(p)),T=S.clone().sub(w),b=Math.min(R+I-.002,Math.max(.005,T.length()));T.normalize();const U=(R*R-I*I+b*b)/(2*b),V=Math.sqrt(Math.max(0,R*R-U*U)),F=new P(...v).addScaledVector(T,-new P(...v).dot(T)).normalize(),O=w.clone().addScaledVector(T,U).addScaledVector(F,V);f(m,p,O.toArray()),f(p,M,y)}function x(m,p){const M=new P(1,0,0).applyQuaternion(s.getWorldQuaternion(On())),y=On().setFromAxisAngle(M,p).multiply(m.getWorldQuaternion(On()));m.quaternion.copy(m.parent.getWorldQuaternion(On()).invert().multiply(y)),m.updateMatrixWorld(!0)}return{update({time:m=0,speed:p=0,seated:M=0,kind:y="bike",seat:v=.81,weapon:w=null,aiming:S=!1,aimPitch:R=0,reload:I=0,recoil:T=0,fallen:b=0}={}){const U=Math.min(.06,Math.max(0,m-h));h=m;const V=p>.25&&!M,F=p>2.5,O={Idle:V?0:1,Walk:V&&!F?1:0,Run:V&&F?1:0};for(const J of Object.keys(c))c[J].weight=po.lerp(c[J].weight,O[J],1-Math.exp(-U*10));if(l.update(U*(V?p/(F?5.4:1.6):1)),s.updateMatrixWorld(!0),M){const J=u(o.Hips);d(o.Hips,[0,po.lerp(J.y,v+.04,M),0]),x(o.Spine1,y==="bike"?-.3*M:.05*M);for(const H of[-1,1]){const z=H<0?"Left":"Right";g(o[z+"UpLeg"],o[z+"Leg"],o[z+"Foot"],y==="car"?[H*.17,.16,-.53]:[H*.27,.39,.1],[0,0,-1]),g(o[z+"Arm"],o[z+"ForeArm"],o[z+"Hand"],y==="car"?[H*.17,v+.4,-.49]:[H*.34,1.02,-.34],[H*.65,-.3,.35])}}if(w&&!M){x(o.Spine1,-.11);const J=u(o.Hips),H=Math.sin(I*Math.PI)*.19,z=Math.sin(R)*.38,Z=J.y+(S?.4:.31)-H-z;g(o.RightArm,o.RightForeArm,o.RightHand,[.18,Z,-.3+T],[.7,-.4,.25]),g(o.LeftArm,o.LeftForeArm,o.LeftHand,w==="carbine"?[.015,Z-.025,-.38]:[.115,Z-.03,-.31],[-.6,-.5,.15]);const le=u(o.RightHand);n.position.copy(le).add(new P(0,.015,-.095)),n.rotation.set(-R+T*1.7,0,-Math.sin(I*Math.PI)*.22)}r.updateMatrixWorld(!0),t.position.copy(u(o.Head)).add(new P(0,.112,-.028));const W=o.Head.getWorldQuaternion(On()).multiply(a);t.quaternion.copy(s.getWorldQuaternion(On()).invert().multiply(W)),r.rotation.z=b*Math.PI*.48,r.position.y=b*.12}}}const oo=(s,e,t)=>s+(e-s)*t,Eh=(s,e,t)=>s.map((n,i)=>oo(n,e[i],t)),dv=new P(0,1,0);function xo({color:s="#d2d8d3",skin:e="#ae795a",lowDetail:t=!1,hero:n=!1,helmet:i=!1,variant:r=0,civilian:o=!1}={}){const a=new at,l=new at;if(a.add(l),t){const _=new Fe(new Ui(.36,12),new Xt({color:"#172128",transparent:!0,opacity:.2,depthWrite:!1}));_.rotation.x=-Math.PI/2,_.position.y=.009,_.scale.y=.7,_.renderOrder=-10,a.add(_)}const c=(_,N=.8)=>new st({color:_,roughness:N}),h=c(s,.64),u=c(["#293541","#494038","#283d49","#343234","#51544a","#354453"][r%6]),d=c(e),f=c("#131d26"),g=c(["#292724","#443326","#201e1c","#605446","#292724","#343330"][r%6]),x=c("#afe3d0"),m=c("#242821");h.map=cv(),u.map=h.map;const p=new _n(1,t?14:24,t?10:18),M=new gn(.74,1,1,t?12:20),y=new at;l.add(y);const v=(_,N,k,X=l)=>{const G=new Fe(p,k);return G.position.set(..._),G.scale.set(...N),X.add(G),G},w=(_,N)=>{const k=new Fe(M,N);return k.userData.radius=_,l.add(k),k},S=(_,N,k)=>{const X=new P(...N),G=new P(...k),ge=G.clone().sub(X);_.position.copy(X.add(G).multiplyScalar(.5)),_.scale.set(_.userData.radius,ge.length(),_.userData.radius),_.quaternion.setFromUnitVectors(dv,ge.normalize())},R=v([0,.93,0],[.175,.145,.125],u),I=v([0,1.25,0],[.215,.275,.135],h),T=v([0,1.41,-.012],[.228,.1,.135],h),b=v([0,1.55,0],[.052,.075,.057],d),U=new dt,V=[],F=[],O=t?16:28,W=[[-.26,.168,.118],[-.19,.166,.12],[-.06,.18,.128],[.1,.215,.141],[.21,.228,.129],[.25,.175,.094],[.285,.078,.063]];for(const[_,N,k]of W)for(let X=0;X<=O;X++){const G=X/O*Math.PI*2;V.push(Math.sin(G)*N,_,Math.cos(G)*k)}for(let _=0;_<W.length-1;_++)for(let N=0;N<O;N++){const k=_*(O+1)+N,X=k+O+1;F.push(k,k+1,X,k+1,X+1,X)}U.setAttribute("position",new We(V,3));const J=[];for(let _=0;_<W.length;_++)for(let N=0;N<=O;N++)J.push(N/O,_/(W.length-1));U.setAttribute("uv",new We(J,2)),U.setIndex(F),U.computeVertexNormals(),I.geometry=U,I.scale.set(1,1,1),T.visible=!1;const H=new at,z=new at;l.add(H),H.add(z);const Z=new _n(1,t?20:32,t?16:24),le=Z.attributes.position;for(let _=0;_<le.count;_++){let N=le.getX(_)*.091,k=le.getY(_)*.123,X=le.getZ(_)*.091;const G=Math.max(0,-k/.123);if(N*=1-G*.18,X<0){const ge=Math.max(0,-X/.091),ce=(xe,we,ue,Te)=>Math.exp(-(((N-xe)/ue)**2+((k-we)/Te)**2));X-=ge*(.023*ce(0,-.004,.017,.028)+.008*ce(0,-.052,.037,.015)),X+=.007*(ce(.033,.026,.019,.015)+ce(-.033,.026,.019,.015))}le.setXYZ(_,N,k,X)}Z.computeVertexNormals();const re=new Fe(Z,d);z.add(re);const _e=new _n(1,t?18:28,t?10:16,0,Math.PI*2,0,Math.PI*.47),me=new Fe(_e,g);me.scale.set(.094,.132,.095),me.position.set(0,.004,.006),me.rotation.x=-.15,H.add(me),me.scale.set(.085,.126,.098),me.position.set(0,.008,.006),i&&(v([0,.013,0],[.109,.137,.111],c("#303c45",.3),H),v([0,.015,-.091],[.098,.053,.029],c("#111e28",.15),H),v([0,-.06,-.071],[.092,.04,.071],c("#444e52",.3),H));const ze=c("#815e51"),ke=c("#c7bfb0");v([0,-.054,-.087],[.027,.0035,.005],ze,z);for(const _ of[-1,1]){v([_*.09,-.002,.008],[.015,.029,.018],d,z),v([_*.099,-.002,.004],[.004,.017,.009],ze,z),v([_*.034,.026,-.082],[.013,.0065,.005],ke,z),v([_*.034,.026,-.087],[.005,.005,.0015],m,z);const N=v([_*.034,.04,-.079],[.019,.003,.005],g,z);N.rotation.z=_*.1}const te=w(.0035,f),ae=v([0,1.48,-.025],[.079,.022,.066],f),ye=v([0,.96,0],[.197,.026,.15],f);te.visible=!1;const Ie=new Ls([new P(0,-.2,-.124),new P(0,-.06,-.13),new P(0,.1,-.143),new P(0,.21,-.132)]),A=new Fe(new Fs(Ie,16,.0025,5,!1),f);I.add(A);const j=v([0,1.26,.142],[.085,.11,.007],f),Y=w(.003,x);j.visible=!1,Y.visible=!1;const E=new at;I.add(E);const $=c("#89928f");for(const _ of[-1,1]){const N=new Fe(new sn(.075,.0025,.002),$);N.position.set(_*.098,-.1,-.124),N.rotation.z=_*.3,E.add(N)}const Q=new Fe(new mn(.16,.008,5,28),h);Q.rotation.x=Math.PI/2,Q.scale.y=.72,Q.position.y=-.244,E.add(Q);const se=new Fe(new sn(.06,.115,.009),c("#18232d",.35));l.add(se),se.visible=!1;const ie=[],be=[];for(const _ of[-1,1]){const N={side:_,upper:w(.099,u),lower:w(.075,u),knee:v([0,0,0],[.071,.066,.069],u),foot:v([0,0,0],[.06,.047,.133],f)};N.upper.geometry=Jr("thigh",t),N.lower.geometry=Jr("shin",t),ie.push(N);const k=lv(d,_);l.add(k);const X={side:_,shoulder:v([0,0,0],[.071,.061,.071],h),upper:w(.077,h),lower:w(.053,h),elbow:v([0,0,0],[.057,.052,.055],h),hand:k};X.upper.geometry=Jr("sleeve",t),X.lower.geometry=Jr("forearm",t),be.push(X)}function oe(_,N,k,X,G){const ge=new P(..._),ce=new P(...N),xe=ce.clone().sub(ge),we=Math.min(k+X-.001,Math.max(.01,xe.length()));xe.normalize();const ue=(k*k-X*X+we*we)/(2*we),Te=Math.sqrt(Math.max(0,k*k-ue*ue)),Be=new P(...G);return Be.addScaledVector(xe,-Be.dot(xe)).normalize(),ge.addScaledVector(xe,ue).addScaledVector(Be,Te).toArray()}function de({time:_=0,phase:N=0,speed:k=0,sprinting:X=!1,seated:G=0,kind:ge="bike",seat:ce=.81,transition:xe=0,turn:we=0,weapon:ue=null,aiming:Te=!1,aimPitch:Be=0,reload:Re=0,recoil:Ee=0,fallen:Xe=0,flinch:B=0,slump:ve=0,activity:Se="walk",detail:Le=!0}={}){l.rotation.z=Xe*Math.PI*.48+ve*.23,l.rotation.x=ve*.28+B*.1,l.position.y=Xe*.12-ve*.08;const pe=Math.min(1,k/1.7),he=Math.min(1,k/7),Ne=Math.sin(_*2.2)*.004,De=oo(.92+Math.abs(Math.sin(N))*pe*.023+Ne,ge==="car"?ce:ce+.025,G),tt=oo(-he*.05,ge==="car"?.02:-.28,G);R.position.set(0,De,0),ye.position.set(0,De+.045,0),I.position.set(0,De+.3,tt*.5),I.rotation.x=oo(-he*.08,ge==="car"?.1:-.38,G),T.position.set(0,De+.48,tt),b.position.set(0,De+.62,tt-.018);const rt=De+.3+Math.cos(I.rotation.x)*.285,rn=tt*.5+Math.sin(I.rotation.x)*.285;ae.position.set(0,rt,rn),b.position.set(0,rt+.045,rn-.003),H.position.set(0,rt+.16,rn-.02),H.rotation.y=-we*.12+(pe?0:Math.sin(_*.65+r)*.1),H.rotation.x=Se==="phone"?.12:0,j.position.set(0,De+.32,tt*.5+.16),S(te,[0,De+.16,tt*.4-.145],[0,De+.5,tt-.145]),S(Y,[-.04,De+.23,tt*.5+.154],[-.04,De+.39,tt*.5+.154]);for(const je of ie){const mi=N+(je.side>0?Math.PI:0),on=Math.sin(mi),Fi=.3+he*.16,ns=[je.side*.12,.07+Math.max(0,Math.cos(mi))*(.09+he*.09)*pe,on*Fi*pe];let vt=ge==="car"?[je.side*.15,.18,-.59]:[je.side*.29,.43,-.075];const Ht=Eh(ns,vt,G);Ht[2]+=Xe*je.side*.15,ge==="bike"&&je.side>0&&xe>0&&(Ht[1]+=Math.sin(xe*Math.PI)*.57);const Kn=[je.side*.125,De,0],gi=oe(Kn,Ht,.44,.43,[0,0,-1]);S(je.upper,Kn,gi),S(je.lower,gi,Ht),je.knee.position.set(...gi),je.foot.position.set(Ht[0],Ht[1]-.015,Ht[2]-.055),je.foot.rotation.x=G?.18:Math.min(0,Math.cos(mi))*.1*pe}for(const je of be){const mi=N+(je.side>0?0:Math.PI),on=[je.side*.25,De+.3+Math.cos(I.rotation.x)*.195,tt*.5+Math.sin(I.rotation.x)*.195],Fi=[je.side*.29,De-.04+he*.12,Math.sin(mi)*(.2+he*.13)*pe-.025],ns=ge==="car"?[je.side*.155,De+.38,-.58]:[je.side*.36,ce<.75?1.04:1.01,ce<.75?-.62:-.71];let vt=Eh(Fi,ns,G);if(ue&&!G){const Kn=ue==="carbine";vt=je.side>0?[.2,De+(Te?.46:.35)-Ee*1.1,-(Kn?.4:.43)+Ee]:[Kn?.06:.17,De+(Te?.44:.33),Kn?-.7:-.44],vt[1]-=Math.sin(Be)*.5,Re&&(vt[1]-=Math.sin(Re*Math.PI)*.22,vt[2]+=.13*Math.sin(Re*Math.PI))}xe>.05&&xe<.7&&je.side>0&&ge==="car"&&(vt[0]+=.3*Math.sin(xe*Math.PI),vt[1]+=.16*Math.sin(xe*Math.PI)),!G&&!ue&&(Se==="phone"&&je.side>0&&(vt=[.16,De+.4,-.25]),Se==="talk"&&(vt=[je.side*(.25+.045*Math.sin(_*1.8)),De+.14+.07*Math.sin(_*1.6+je.side),-.24])),Xe&&(vt[0]+=je.side*Xe*.22,vt[2]+=je.side*Xe*.2),B&&(vt[1]+=B*.18,vt[2]-=B*.12);const Ht=oe(on,vt,.3,.275,[je.side*.5,0,1]);je.shoulder.position.set(...on),S(je.upper,on,Ht),S(je.lower,Ht,vt),je.elbow.position.set(...Ht),je.hand.position.set(...vt),je.hand.rotation.x=G||ue?Math.PI/2:.12,je.hand.rotation.z=je.side*.07,je.side>0&&(se.visible=Se==="phone"&&!Xe,se.position.set(vt[0],vt[1]+.04,vt[2]-.021)),je.side>0&&(y.position.set(vt[0],vt[1]+.035,vt[2]-.035),y.rotation.set(-Be+Ee*1.7,Re?Math.sin(Re*Math.PI)*.25:0,Re?-.32*Math.sin(Re*Math.PI):0))}}a.traverse(_=>{_.isMesh&&(_.castShadow=!0,_.userData.dynamic=!0)}),de();let Ve=null,Je=null;const D={group:a,pose:_=>{de(_),Ve==null||Ve.update(_),Je==null||Je.update(_)},gunSocket:y,ready:Promise.resolve()};return!o&&!i&&typeof window<"u"&&(D.ready=ov({head:H,fallback:z,hairMesh:me,skinMat:d,variant:r}).then(_=>{Je=_,_.update()}).catch(_=>console.warn("Face detail unavailable",_))),o&&typeof window<"u"&&(D.ready=hv({group:a,rig:l,variant:r}).then(_=>Ve=_).catch(_=>console.warn("Civilian detail unavailable",_))),n&&typeof window<"u"&&(D.ready=uv({group:a,rig:l,head:H,gunSocket:y}).then(_=>{Ve=_}).catch(_=>{console.warn("Detailed character unavailable; using local character.",_)})),D}const ai=[{id:"vanta",name:"VANTA S6",label:"Sleek sport bike",kind:"bike",design:"sport",color:"#ee704d",accent:"#ffe2b1",max:49,accel:13.5,brake:27,grip:1.06,mass:195,wheelbase:1.5,length:2.18,width:.78,seat:.81,engine:"sport"},{id:"spectre",name:"SPECTRE RR",label:"Futuristic superbike",kind:"bike",design:"super",color:"#c9e3e4",accent:"#47efe1",max:61,accel:17,brake:30,grip:.97,mass:218,wheelbase:1.54,length:2.25,width:.83,seat:.83,engine:"electric"},{id:"brutus",name:"BRUTUS 900",label:"Heavy power bike",kind:"bike",design:"heavy",color:"#303b43",accent:"#ffc062",max:43,accel:10,brake:22,grip:.8,mass:310,wheelbase:1.8,length:2.5,width:.95,seat:.73,engine:"heavy"},{id:"kite",name:"KITE 450",label:"Agile street bike",kind:"bike",design:"street",color:"#d2ee75",accent:"#edfff3",max:40,accel:12,brake:26,grip:1.3,mass:160,wheelbase:1.4,length:2.04,width:.78,seat:.79,engine:"street"},{id:"aether",name:"AETHER ONE",label:"Premium concept bike",kind:"bike",design:"concept",color:"#ece8f3",accent:"#9678ef",max:56,accel:15,brake:31,grip:1.15,mass:205,wheelbase:1.55,length:2.3,width:.81,seat:.82,engine:"electric"},{id:"strada",name:"STRADA GT",label:"Sports coupe",kind:"car",design:"sport",color:"#c95e45",accent:"#fbf0d2",max:58,accel:10.5,brake:24,grip:1,mass:1460,wheelbase:2.65,length:4.5,width:1.92,height:1.25,engine:"sport"},{id:"civic",name:"MERIDIAN",label:"Executive sedan",kind:"car",design:"sedan",color:"#8698aa",accent:"#e7f9ff",max:43,accel:7,brake:20,grip:.92,mass:1770,wheelbase:2.85,length:4.7,width:1.85,height:1.48,engine:"sedan"},{id:"atlas",name:"ATLAS X",label:"Utility SUV",kind:"car",design:"suv",color:"#798274",accent:"#e3f2c5",max:39,accel:6,brake:18,grip:.75,mass:2400,wheelbase:2.9,length:4.85,width:2.03,height:1.84,engine:"heavy"},{id:"flux",name:"FLUX E4",label:"Futuristic EV",kind:"car",design:"ev",color:"#e3e0ce",accent:"#72e5dd",max:48,accel:11,brake:24,grip:1.08,mass:1950,wheelbase:2.8,length:4.4,width:1.91,height:1.4,engine:"electric"},{id:"elysian",name:"ELYSIAN 01",label:"Premium concept car",kind:"car",design:"concept",color:"#746c9d",accent:"#c7afff",max:63,accel:13,brake:27,grip:1.1,mass:1660,wheelbase:2.9,length:4.8,width:2.05,height:1.18,engine:"electric"},{id:"sentinel",name:"SENTINEL",label:"Security interceptor",kind:"car",design:"security",color:"#d9dedc",accent:"#6a9dff",max:51,accel:10,brake:25,grip:1.05,mass:1870,wheelbase:2.8,length:4.7,width:1.93,height:1.5,engine:"security"},{id:"pulse",name:"PULSE RS",label:"Compact hot hatch",kind:"car",design:"hatch",color:"#277a87",accent:"#e9f4f4",max:44,accel:9,brake:23,grip:1.2,mass:1280,wheelbase:2.5,length:3.95,width:1.78,height:1.46,engine:"sport"},{id:"crown",name:"CROWN V8",label:"Long-hood muscle coupe",kind:"car",design:"muscle",color:"#5d3148",accent:"#e9f4f4",max:55,accel:11,brake:22,grip:.9,mass:1820,wheelbase:2.9,length:5,width:2,height:1.33,engine:"heavy"},{id:"solace",name:"SOLACE CABRIO",label:"Open-top roadster",kind:"car",design:"roadster",color:"#e4bf78",accent:"#e9f4f4",max:54,accel:10,brake:25,grip:1.16,mass:1330,wheelbase:2.55,length:4.2,width:1.84,height:1.18,engine:"sport"},{id:"nomad",name:"NOMAD TOURING",label:"Family estate",kind:"car",design:"wagon",color:"#415e86",accent:"#e9f4f4",max:43,accel:7.8,brake:21,grip:.98,mass:1790,wheelbase:2.85,length:4.95,width:1.9,height:1.53,engine:"sedan"},{id:"titan",name:"TITAN CREW",label:"Utility pickup",kind:"car",design:"pickup",color:"#8f4d31",accent:"#e9f4f4",max:40,accel:6.5,brake:20,grip:.73,mass:2650,wheelbase:3.3,length:5.6,width:2.14,height:1.95,engine:"heavy"},{id:"courier",name:"CARGO 240",label:"City delivery van",kind:"car",design:"van",color:"#d1d5cb",accent:"#e9f4f4",max:35,accel:5,brake:18,grip:.7,mass:2500,wheelbase:3.15,length:5.2,width:2.05,height:2.28,engine:"heavy"},{id:"regent",name:"REGENT L",label:"Long-wheelbase limousine",kind:"car",design:"limo",color:"#252b36",accent:"#e9f4f4",max:46,accel:7.1,brake:22,grip:.83,mass:2250,wheelbase:3.55,length:5.8,width:1.98,height:1.52,engine:"sedan"},{id:"apex",name:"APEX R",label:"Mid-engine hypercar",kind:"car",design:"hyper",color:"#adb941",accent:"#e9f4f4",max:70,accel:15,brake:31,grip:1.23,mass:1430,wheelbase:2.8,length:4.68,width:2.08,height:1.08,engine:"sport"},{id:"metro",name:"METRO CAB",label:"City taxi",kind:"car",design:"taxi",color:"#d4ab37",accent:"#e9f4f4",max:41,accel:7.4,brake:22,grip:.94,mass:1690,wheelbase:2.73,length:4.6,width:1.84,height:1.5,engine:"sedan"},{id:"warden",name:"WARDEN X",label:"Police response SUV",kind:"car",design:"suv",color:"#e2e6e5",accent:"#e9f4f4",max:48,accel:9.5,brake:26,grip:.91,mass:2510,wheelbase:2.98,length:5.05,width:2.08,height:1.92,engine:"security"}],Lt=s=>ai.find(e=>e.id===s)||ai[0],Sn={x:24,z:166,radius:30};function fv(){const s=[],e=(t,n,i,r=0,o={})=>{s.push({uid:"vehicle-"+s.length,type:t,x:n,z:i,heading:r,speed:0,steering:0,distance:0,door:0,...o})};ai.slice(0,5).forEach((t,n)=>e(t.id,18+n*3.4,166,Math.PI,{garage:!0})),e("strada",5,170),e("flux",-5,156,Math.PI),e("atlas",5,144),e("elysian",5,132);for(let t=0;t<24;t++){const n=t%2?"x":"z",i=t%4<2?1:-1,r=(Math.floor(t/4)-3)*100,o=-275+t*83%560;e(ai.filter(a=>a.kind==="car"&&a.engine!=="security")[t%14].id,n==="z"?r-i*4.6:o,n==="x"?r+i*4.6:o,n==="z"?i>0?Math.PI:0:i>0?Math.PI/2:-Math.PI/2,{driver:{health:100,temper:t%3},traffic:!0,axis:n,dir:i,cruise:7+t%5*1.6,speed:7})}for(let t=0;t<18;t++){const n=(t%5-2)*100;e(ai[t%3===0?t%5:5+t%6].id,n+8.2,-255+t*41%520,0)}for(const[t,n]of["pulse","crown","solace","nomad","titan","courier","regent","apex","metro","warden"].entries())e(n,5,118-t*13,0);e("metro",-4.6,172,Math.PI,{traffic:!0,axis:"z",dir:1,cruise:9,speed:0,stopTimer:60,driver:{health:100,temper:1}});for(let t=0;t<11;t++){const n=t%2?"x":"z",i=t%4<2?1:-1,r=(Math.floor(t/4)-1)*100,o=-255+t*51;e(ai[t%5].id,n==="z"?r-i*6.5:o,n==="x"?r+i*6.5:o,n==="z"?i>0?Math.PI:0:i>0?Math.PI/2:-Math.PI/2,{traffic:!0,axis:n,dir:i,cruise:10+t%3*2,speed:8,driver:{health:100,rider:!0}})}return s}const mr=[{id:"sidearm",name:"A9 SIDEARM",label:"Precision sidearm",clip:12,reserve:84,damage:34,interval:.27,reload:1.45,range:120,automatic:!1,recoil:.03},{id:"carbine",name:"VX CARBINE",label:"Automatic carbine",clip:30,reserve:180,damage:24,interval:.105,reload:2.15,range:190,automatic:!0,recoil:.017}],Xn=s=>mr.find(e=>e.id===s);function pv(){return{selected:null,last:"sidearm",aiming:!1,cooldown:0,reloading:0,reloadDuration:0,recoil:0,hit:0,shotCount:0,clips:Object.fromEntries(mr.map(s=>[s.id,s.clip])),reserve:Object.fromEntries(mr.map(s=>[s.id,s.reserve]))}}function Ru(s,e){if(s.phase!=="playing"||s.mode!=="foot"||s.transition)return!1;const t=s.combat;return e&&!Xn(e)?!1:(t.selected=e,t.last=e||t.last,t.reloading=0,t.aiming=!1,t.cooldown=.2,s.events.push("equip"),!0)}function Yc(s){const e=s.combat,t=Xn(e.selected);return s.phase!=="playing"||s.mode!=="foot"||s.transition||!t||e.reloading||e.clips[t.id]>=t.clip||!e.reserve[t.id]?!1:(e.reloading=t.reload,e.reloadDuration=t.reload,s.events.push("reload"),!0)}function mv(s,e){const t=s.combat;if(!(!t||s.phase!=="playing")){if(t.cooldown=Math.max(0,t.cooldown-e),t.recoil*=Math.exp(-e*15),t.hit=Math.max(0,t.hit-e),s.mode!=="foot"||s.transition){t.aiming=!1,t.reloading=0;return}if(t.reloading&&(t.reloading=Math.max(0,t.reloading-e),!t.reloading)){const n=Xn(t.selected);if(n){const i=Math.min(n.clip-t.clips[n.id],t.reserve[n.id]);t.clips[n.id]+=i,t.reserve[n.id]-=i,s.events.push("reloadDone")}}}}function gv(s){const e=s.combat,t=Xn(e.selected);return s.phase!=="playing"||s.mode!=="foot"||s.transition||!t||e.cooldown>0||e.reloading?null:e.clips[t.id]<=0?(e.cooldown=.28,s.events.push("empty"),Yc(s),null):(e.clips[t.id]--,e.cooldown=t.interval,e.recoil=Math.min(.1,e.recoil+t.recoil),e.shotCount++,s.events.push("shot-"+t.id),t)}function _v(s,e){var t,n,i;if(e){s.selected=((t=Xn(e.selected))==null?void 0:t.id)||null,s.last=((n=Xn(e.last))==null?void 0:n.id)||"sidearm";for(const r of mr)for(const[o,a]of[["clips",r.clip],["reserve",999]]){const l=(i=e[o])==null?void 0:i[r.id];Number.isFinite(l)&&(s[o][r.id]=Math.max(0,Math.min(a,Math.floor(l))))}}}function xv(s,e,t,n=200){const i=Math.cos(t.heading||0),r=Math.sin(t.heading||0),o=s.x-t.x,a=s.z-t.z,l=[i*o+r*a,s.y-(t.y||0),-r*o+i*a],c=[i*e.x+r*e.z,e.y,-r*e.x+i*e.z],h=[t.w/2,t.h/2,t.d/2];let u=0,d=n,f=[0,0,0];for(let g=0;g<3;g++){if(Math.abs(c[g])<1e-8){if(Math.abs(l[g])>h[g])return null;continue}let x=(-h[g]-l[g])/c[g],m=(h[g]-l[g])/c[g],p=-1;if(x>m&&([x,m]=[m,x],p=1),x>u&&(u=x,f=[0,0,0],f[g]=p),d=Math.min(d,m),u>d)return null}return u>n||d<0?null:{distance:u,point:{x:s.x+e.x*u,y:s.y+e.y*u,z:s.z+e.z*u},normal:{x:i*f[0]-r*f[2],y:f[1],z:r*f[0]+i*f[2]},object:t}}function va(s,e,t,n=200){let i=null;for(const r of t){if(r.disabled)continue;const o=xv(s,e,r,(i==null?void 0:i.distance)??n);o&&(!i||o.distance<i.distance)&&(i=o)}return i}const Pt=100,Th=345,wh=22,fn=s=>{const e=Math.sin(s*127.1+311.7)*43758.5453;return e-Math.floor(e)},vr=[];for(let s=-3;s<3;s++)for(let e=-3;e<3;e++)if(!(s===0&&e===1||s===-1&&e===-1))for(let t=0;t<4;t++){const n=(s+3)*24+(e+3)*4+t,i=s*Pt+28+t%2*44,r=e*Pt+28+Math.floor(t/2)*44,o=s>=0&&e<0?"zenith":s<0&&e>=0?"old":e>=1?"harbor":"civic",a=o==="zenith"?n%3?"glass":"limestone":o==="old"?n%3?"apartment":"brick":o==="harbor"?"terrace":n%3?"limestone":"glass";let l=a==="glass"?42+Math.floor(fn(n+80)*20)*3.2:a==="terrace"?13+Math.floor(fn(n+80)*5)*3.2:13+Math.floor(fn(n+80)*8)*3.2;o==="old"&&(l=10+Math.floor(fn(n+80)*5)*3.2),vr.push({x:i,z:r,w:24+fn(n)*8,d:24+fn(n+20)*8,h:l,id:n,style:a,district:o})}const Cu=[{x:57,z:184.5,w:28,d:.6},{x:25,z:159,w:24,d:.3},{x:13,z:162,w:.3,d:.3},{x:37,z:162,w:.3,d:.3},{x:50,z:150,w:17,d:17},{x:-50,z:-50,w:17,d:17}],vv=[{name:"ZENITH",x:150,z:-190,color:"#66e8df"},{name:"OLD QUARTER",x:-190,z:160,color:"#ffa786"},{name:"CIVIC CORE",x:-50,z:-50,color:"#afa1ff"},{name:"HARBOR",x:215,z:250,color:"#5bbcff"}],Ao=[{id:"courier",title:"Morning express",type:"COURIER",reward:750,time:180,heat:0,description:"A priority package. Three drop points across Grand City. Follow the amber beacons.",points:[{x:100,z:160,name:"Zenith Arcade"},{x:200,z:-90,name:"North Tower"},{x:-95,z:-200,name:"Civic Archives"}]},{id:"circuit",title:"The sunrise circuit",type:"STREET RUN",reward:1200,time:140,heat:0,description:"Cross four city checkpoints before the clock runs out. Corners matter more than top speed.",points:[{x:0,z:-210,name:"North checkpoint"},{x:210,z:-100,name:"East checkpoint"},{x:100,z:210,name:"South checkpoint"},{x:-210,z:100,name:"West checkpoint"}]},{id:"ghost",title:"Ghost protocol",type:"PURSUIT",reward:1800,time:210,heat:2,description:"Security has your signal. Reach the uplink, then break contact and lose the patrols.",points:[{x:-200,z:-140,name:"Signal uplink"}]}],Dt=(s,e,t)=>Math.max(e,Math.min(t,s));function nn(s,e,t=1){return Math.abs(s)>Th||Math.abs(e)>Th?!0:[...vr,...Cu].some(n=>Math.abs(s-n.x)<n.w/2+t&&Math.abs(e-n.z)<n.d/2+t)}function Iu(s,e){return Math.abs(s-Math.round(s/Pt)*Pt)<wh/2||Math.abs(e-Math.round(e/Pt)*Pt)<wh/2}function Ri(s,e){return s>13&&s<37&&e>160&&e<172?Math.abs(e-166)<1.95&&[18,21.4,24.8,28.2,31.6].some(t=>Math.abs(s-t)<1.3)?.335:.28:Iu(s,e)?0:.14}const Ji=(s,e,t,n)=>s+(e-s)*(1-Math.exp(-t*n)),gr=(s,e)=>Math.atan2(Math.sin(s-e),Math.cos(s-e)),Ti=s=>(s=Dt(s,0,1),s*s*(3-2*s));function Pu(){return{phase:"intro",combat:pv(),mode:"foot",x:15,z:171,heading:-Math.PI/2,speed:0,moveHeading:-Math.PI/2,steering:0,throttle:0,braking:0,vehicleId:null,transition:null,vehicles:fv(),health:100,nitro:100,cash:0,wanted:0,heatTimer:0,bust:0,mission:null,completed:0,elapsed:0,invincible:0,distance:0,boosting:!1,sprinting:!1,footstep:0,notice:"",noticeLeft:0,cops:[],trafficHit:0,arrested:!1,events:[],stats:{distance:0},savedAt:0}}const Mr=s=>s.vehicles.find(e=>e.uid===s.vehicleId);function ci(s,e,t){return{x:s.x+Math.cos(s.heading)*e-Math.sin(s.heading)*t,z:s.z+Math.sin(s.heading)*e+Math.cos(s.heading)*t}}function Lu(s){let e=null,t=4.8;for(const n of[...s.vehicles,...s.cops]){if(n.reserved||n.disabled||Math.abs(n.speed)>8)continue;const i=Math.hypot(s.x-n.x,s.z-n.z);i<t&&(e=n,t=i)}return e}function _c(s){if(s.transition)return!1;if(s.combat&&(s.combat.aiming=!1,s.combat.reloading=0),s.mode==="foot"){const i=Lu(s);if(!i)return!1;if(Math.abs(i.speed)>1.5)return i.stopTimer=8,s.interceptId=i.uid,mt(s,"Driver stopping · Stay beside the vehicle"),!0;s.interceptId=null;const r=Lt(i.type),o=ci(i,-r.width/2-.65,r.kind==="car"?.1:.25);if(nn(o.x,o.z,.35))return!1;const a=s.x-i.x,l=s.z-i.z,c=Math.cos(i.heading)*a+Math.sin(i.heading)*l,h=-Math.sin(i.heading)*a+Math.cos(i.heading)*l,u=[{x:s.x,z:s.z}];if(c>0&&Math.abs(h)<r.length/2+.5){const g=r.length/2+.8;u.push(ci(i,r.width/2+.72,g),ci(i,-r.width/2-.7,g))}if(u.push(o),u.some(g=>nn(g.x,g.z,.32)))return!1;let d=0;for(let g=1;g<u.length;g++)d+=Math.hypot(u[g].x-u[g-1].x,u[g].z-u[g-1].z);s.cops.includes(i)&&(s.cops.splice(s.cops.indexOf(i),1),s.vehicles.push(i),i.police=!0);const f=!!i.driver&&!i.driver.exited;return i.reserved=!0,i.traffic=!1,i.speed=0,!f&&(i.police||r.engine==="security")&&Ci(s,2),f&&(Ci(s,i.police?2:1),i.stolen=!0,mt(s,"Taking vehicle · Driver is getting out"),s.events.push("door")),s.transition={kind:"enter",time:0,duration:d/1.8+1.65+(f?1.25:0),takeover:f,ejectDuration:f?1.25:0,walkDuration:d/1.8,path:u,pathLength:d,vehicleId:i.uid,start:{x:s.x,z:s.z,heading:s.heading},side:o,progress:0},s.speed=0,!0}const e=Mr(s);if(!e||Math.abs(s.speed)>1.5)return!1;const t=Lt(e.type);let n=ci(e,-t.width/2-.72,.2);return nn(n.x,n.z,.4)?(mt(s,"Door blocked · Move to an open space"),!1):(s.transition={kind:"exit",time:0,duration:1.8,vehicleId:e.uid,start:{x:s.x,z:s.z,heading:s.heading},side:n,progress:0},s.speed=0,e.speed=0,s.events.push("door"),!0)}function Mv(s,e){const t=s.transition,n=s.vehicles.find(l=>l.uid===t.vehicleId),i=Lt(n.type),r=s.x,o=s.z;t.time+=e,t.progress=Dt(t.time/t.duration,0,1);let a=t.progress;if(t.kind==="enter")if(t.time<t.walkDuration){t.walking=!0;let l=t.time*1.8;for(let c=1;c<t.path.length;c++){const h=t.path[c-1],u=t.path[c],d=Math.hypot(u.x-h.x,u.z-h.z);if(l<=d){const f=d?l/d:1;s.x=h.x+(u.x-h.x)*f,s.z=h.z+(u.z-h.z)*f;const g=Math.atan2(u.x-h.x,h.z-u.z);s.heading+=gr(g,s.heading)*(1-Math.exp(-10*e));break}l-=d}t.seated=0}else{if(t.walking=!1,t.takeover&&!n.driver.exited){const h=n.driver,u=Dt((t.time-t.walkDuration)/t.ejectDuration,0,1),d=ci(n,i.kind==="bike"?0:-.37,i.kind==="bike"?.28:.12);h.exiting=!0,h.exitProgress=u,h.x=d.x+(t.side.x-d.x)*Ti(u),h.z=d.z+(t.side.z-d.z)*Ti(u),h.heading=n.heading,u>=1&&!h.exited&&(h.exited=!0,h.flee=14,h.fleeX=t.side.x-n.x,h.fleeZ=t.side.z-n.z,h.axis="z",h.dir=1,h.speed=1.4,h.phase=0)}const l=Dt((t.time-t.walkDuration-t.ejectDuration)/1.65,0,1);t.interaction=l,t.sound||(t.sound=!0,s.events.push("door"));const c=Ti((l-.26)/.55);s.x=t.side.x+(n.x-t.side.x)*c,s.z=t.side.z+(n.z-t.side.z)*c,s.heading+=gr(n.heading,s.heading)*(1-Math.exp(-10*e)),t.seated=c,n.door=i.kind==="car"?Math.max(t.takeover&&l===0?1:0,Ti(l/.25))*(1-Ti((l-.8)/.2)):0}else{const l=Ti((a-.26)/.53);s.x=n.x+(t.side.x-n.x)*l,s.z=n.z+(t.side.z-n.z)*l,s.heading=n.heading,t.seated=1-l,t.walking=a>.72,t.interaction=a,n.door=i.kind==="car"?Ti(a/.22)*(1-Ti((a-.78)/.22)):0}s.footstep+=Math.hypot(s.x-r,s.z-o)/1.75*Math.PI*2,a>=1&&(n.door=0,n.reserved=!1,t.kind==="enter"?(s.vehicleId=n.uid,s.mode=i.kind,s.x=n.x,s.z=n.z,s.heading=n.heading,mt(s,i.name+" · Connected")):(s.mode="foot",s.vehicleId=null,mt(s,"On foot · Vehicle parked here")),s.transition=null,s.speed=0)}function yv(s,e){const t=Ao.find(n=>n.id===e);return!t||s.mission?!1:(s.mission={...t,stage:0,left:t.time,escaping:!1},s.wanted=Math.max(s.wanted,t.heat),s.heatTimer=0,s.events.push("mission"),!0)}function mt(s,e){s.notice=e,s.noticeLeft=3.2}function Ci(s,e){s.wanted=Dt(s.wanted+e,0,3),s.heatTimer=0}function bv(s,e,t,n=0){var u;s.elapsed+=t,s.invincible=Math.max(0,s.invincible-t),s.noticeLeft=Math.max(0,s.noticeLeft-t);const i=s.x,r=s.z;if(s.transition){Mv(s,t),Ah(s,t);return}const o=Mr(s),a=o&&Lt(o.type);if(s.throttle=e.forward>0?1:0,s.braking=e.forward<0&&s.speed>.3?1:0,o){s.boosting=!!(e.boost&&s.nitro>1&&s.speed>8&&s.throttle);const d=a.max*(s.boosting?1.18:1)*Math.max(.18,1-(o.damage||0)*.65),f=1+Math.abs(s.speed)**2*.0018;o.disabled?(s.speed*=Math.exp(-t*3),s.throttle=0):e.forward>0?s.speed+=a.accel*(.52+.48*(1-Math.abs(s.speed)/d))*t*(s.boosting?1.5:1):e.forward<0?s.speed-=t*(s.speed>.4?a.brake:3.8):s.speed=Math.sign(s.speed)*Math.max(0,Math.abs(s.speed)-f*t),e.handbrake&&(s.speed=Math.sign(s.speed)*Math.max(0,Math.abs(s.speed)-a.brake*.75*t),s.braking=1),s.speed=Dt(s.speed,-5,d),s.steering=Ji(s.steering,e.steer,a.kind==="bike"?6:3.8,t);const g=s.steering*(a.kind==="bike"?.5:.52)/(1+Math.abs(s.speed)*.052);let x=Math.tan(g)*s.speed/a.wheelbase;const m=a.grip*(o.punctured?.6:1)*(e.handbrake?.72:1);x=Dt(x,-1.2*m,1.2*m),s.heading+=x*t,s.nitro=Dt(s.nitro+(s.boosting?-26:9)*t,0,100),s.x+=Math.sin(s.heading)*s.speed*t,s.z-=Math.cos(s.heading)*s.speed*t}else{s.boosting=!1,s.sprinting=!!e.boost;const d=e.forward||e.steer,f=d?(u=s.combat)!=null&&u.aiming?1.7:e.walk?1.65:s.sprinting?7.2:3.6:0;if(s.speed=Ji(s.speed,f,d?8:13,t),d){const g=Math.atan2(e.steer,e.forward)+n;s.moveHeading=g,s.heading+=gr(g,s.heading)*(1-Math.exp(-12*t))}s.x+=Math.sin(s.moveHeading)*s.speed*t,s.z-=Math.cos(s.moveHeading)*s.speed*t,s.nitro=Math.min(100,s.nitro+10*t)}const l=o?a.kind==="car"?1.15:.48:.32,c=(d,f)=>nn(d,f,l)||(a==null?void 0:a.kind)==="car"&&[-1,1].some(g=>nn(d+Math.sin(s.heading)*g*a.length*.3,f-Math.cos(s.heading)*g*a.length*.3,l*.8));c(s.x,s.z)&&(c(s.x,r)?c(i,s.z)?(s.x=i,s.z=r):s.x=i:s.z=r,o?(xc(s,Math.abs(s.speed)),s.speed*=-.12):s.speed*=.5);for(const d of s.vehicles){if(d===o||d.reserved)continue;const f=Lt(d.type),g=s.x-d.x,x=s.z-d.z,m=Math.cos(d.heading),p=Math.sin(d.heading),M=m*g+p*x,y=-p*g+m*x;if(Math.abs(M)<f.width/2+l&&Math.abs(y)<f.length/2+l){s.x=i,s.z=r,o?(xc(s,Math.abs(s.speed),!0),s.speed*=-.12,d.speed*=.15):s.speed=0;break}}const h=Math.hypot(s.x-i,s.z-r);s.distance+=h,s.stats.distance+=h,s.footstep+=h/(s.sprinting?2.6:1.75)*Math.PI*2,o&&(o.x=s.x,o.z=s.z,o.heading=s.heading,o.speed=s.speed,o.steering=s.steering,o.distance+=h),Ah(s,t)}function xc(s,e,t=!1){const n=Mr(s);n&&e>3&&(n.damage=Math.min(1,(n.damage||0)+e*.004)),e>3&&s.invincible<=0&&(s.health=Math.max(0,s.health-Math.min(24,e*.6)),s.invincible=1,s.events.push("impact"),t&&Ci(s,1),mt(s,t?"Collision · Security alerted":"Impact · Slow down"))}function Ah(s,e){if(s.mission){const t=s.mission;if(t.left-=e,t.left<=0)s.mission=null,mt(s,"Contract expired · Try again from the jobs board");else if(t.escaping)s.wanted===0&&Rh(s);else{const n=t.points[t.stage];Math.hypot(s.x-n.x,s.z-n.z)<11&&(t.stage++,s.events.push("checkpoint"),t.stage>=t.points.length?t.id==="ghost"?(t.escaping=!0,mt(s,"Uplink complete · Lose your wanted level")):Rh(s):mt(s,"Checkpoint reached · Next location marked"))}}}function Rh(s){s.mission&&(s.cash+=s.mission.reward,s.completed++,mt(s,"Contract complete · +₡"+s.mission.reward),s.mission=null,s.health=Math.min(100,s.health+20),s.events.push("reward"))}function jc(s,e){return Math.floor(e/10)%2===0==(s==="z")}function Sv(s,e){var t,n,i;for(const r of s.vehicles.filter(o=>o.traffic&&!o.reserved)){if(r.stopTimer=Math.max(0,(r.stopTimer||0)-e),((t=r.driver)==null?void 0:t.health)<=0||(n=r.driver)!=null&&n.exited||r.disabled){r.speed=Math.max(0,r.speed-12*e),r.speed<.1&&(r.speed=0,r.traffic=!1);continue}const o=Math.hypot(r.x-s.x,r.z-s.z),a=((r.x-s.x)*Math.sin(s.heading)-(r.z-s.z)*Math.cos(s.heading))/Math.max(1,o);(i=s.combat)!=null&&i.aiming&&o<20&&a>.92&&(r.stopTimer=3,r.driver&&(r.driver.scared=!0));let l=r.stopTimer>0?0:r.cruise;const c={x:Math.sin(r.heading),z:-Math.cos(r.heading)},h=[...s.vehicles.filter(g=>g!==r&&!g.traffic),...s.vehicles.filter(g=>g!==r&&g.traffic),...s.mode==="foot"?[{x:s.x,z:s.z}]:[]];for(const g of h){const x=g.x-r.x,m=g.z-r.z,p=x*c.x+m*c.z,M=Math.abs(x*c.z-m*c.x);p>0&&p<18&&M<2.5&&(l=Math.min(l,Math.max(0,(p-6)*.8)))}const u=r.axis==="x"?r.x:r.z,f=(Math.round((u+r.dir*18)/100)*100-u)*r.dir;!jc(r.axis,s.elapsed)&&f>8&&f<30&&(l=Math.min(l,Math.max(0,(f-13)*.65))),r.speed=Ji(r.speed,l,l<r.speed?4:1.2,e),r.x+=c.x*r.speed*e,r.z+=c.z*r.speed*e,r.distance+=r.speed*e,r.x>335&&(r.x=-335),r.x<-335&&(r.x=335),r.z>335&&(r.z=-335),r.z<-335&&(r.z=335),Math.hypot(s.x-r.x,s.z-r.z)<2.5&&s.invincible<=0&&r.speed>2&&!s.transition&&(xc(s,r.speed,!0),r.speed=0,s.speed*=.2)}s.mode!=="foot"&&s.speed>45&&s.wanted===0?(s.trafficHit+=e,s.trafficHit>6&&(Ci(s,1),mt(s,"Speed scan · Security alerted"))):s.trafficHit=Math.max(0,s.trafficHit-e)}function Ro(s){try{return localStorage.setItem("nightfall-save-v3",JSON.stringify({cash:s.cash,completed:s.completed,x:s.x,z:s.z,heading:s.heading,health:s.health,stats:s.stats,mode:s.mode,vehicleId:s.vehicleId,mission:s.mission,combat:s.combat,vehicles:s.vehicles.filter(e=>!e.traffic).map(e=>({uid:e.uid,type:e.type,x:e.x,z:e.z,heading:e.heading,garage:e.garage,stolen:!!e.stolen,damage:e.damage||0,disabled:!!e.disabled})),savedAt:Date.now()})),s.savedAt=Date.now(),!0}catch{return!1}}function Ev(s){try{const e=JSON.parse(localStorage.getItem("nightfall-save-v3"));if(!e)return!1;_v(s.combat,e.combat);for(const i of["cash","completed","heading","health"])Number.isFinite(e[i])&&(s[i]=e[i]);e.stats&&Number.isFinite(e.stats.distance)&&(s.stats=e.stats),Number.isFinite(e.x)&&Number.isFinite(e.z)&&!nn(e.x,e.z,.5)&&(s.x=e.x,s.z=e.z);for(const i of e.vehicles||[]){let r=s.vehicles.find(o=>o.uid===i.uid);!r&&typeof i.uid=="string"&&i.uid.startsWith("patrol-")&&ai.some(o=>o.id===i.type)&&s.vehicles.length<100&&(r={uid:i.uid,type:i.type,distance:0,steering:0,door:0,police:!0},s.vehicles.push(r)),r&&Number.isFinite(i.x)&&Number.isFinite(i.z)&&!nn(i.x,i.z,.5)&&Object.assign(r,i,{traffic:!1,speed:0,driver:null})}const t=s.vehicles.find(i=>i.uid===e.vehicleId);if(t&&["car","bike"].includes(e.mode))s.vehicleId=t.uid,s.mode=Lt(t.type).kind,s.x=t.x,s.z=t.z,s.heading=t.heading;else{const i=s.vehicles.find(r=>Math.hypot(r.x-s.x,r.z-s.z)<2);if(i){const r=ci(i,-Lt(i.type).width/2-.8,.2);s.x=r.x,s.z=r.z}}const n=Ao.find(i=>{var r;return i.id===((r=e.mission)==null?void 0:r.id)});return n&&Number.isFinite(e.mission.left)&&e.mission.left>0&&Number.isInteger(e.mission.stage)&&e.mission.stage>=0&&e.mission.stage<n.points.length&&(s.mission={...n,stage:e.mission.stage,left:e.mission.left,escaping:!!e.mission.escaping},s.wanted=n.heat),s.savedAt=e.savedAt,!0}catch{return!1}}function Tv(s,e){var n;const t=s.cops.length?Math.min(...s.cops.map(i=>Math.hypot(i.x-s.x,i.z-s.z))):1/0;if(s.wanted){const i=t<75;s.heatTimer=i?0:s.heatTimer+e,s.heatTimer>9&&(s.wanted--,s.heatTimer=0,s.wanted===0&&mt(s,"SIGNAL LOST · You are clear")),t<5&&Math.abs(s.speed)<6?s.bust+=e:s.bust=Math.max(0,s.bust-e*1.5),s.bust>3&&(s.arrested=!0,s.phase="busted")}else s.heatTimer=0,s.bust=0;for(const i of s.cops){const r=Math.round(s.x/Pt)*Pt,o=Math.round(s.z/Pt)*Pt;if(!i.target||Math.hypot(i.x-i.target.x,i.z-i.target.z)<3){const f=Math.round(i.x/Pt)*Pt,g=Math.round(i.z/Pt)*Pt;Math.abs(f-r)>2?i.target={x:f+Math.sign(r-f)*Pt,z:g}:Math.abs(g-o)>2?i.target={x:f,z:g+Math.sign(o-g)*Pt}:i.target={x:s.x,z:s.z}}Math.hypot(i.x-s.x,i.z-s.z)<28&&Iu(s.x,s.z)&&(i.target={x:s.x,z:s.z});const a=i.target.x-i.x,l=i.target.z-i.z,c=Math.hypot(a,l)||1;i.heading=Math.atan2(a,-l);const h=Math.min(c,(18+s.wanted*4)*e),u=i.x+a/c*h,d=i.z+l/c*h;if(i.disabled||((n=i.driver)==null?void 0:n.health)<=0||i.guard){i.speed=0;continue}nn(u,d,1)?i.target={x:Math.round(i.x/Pt)*Pt,z:Math.round(i.z/Pt)*Pt}:(i.speed=h/e,i.distance=(i.distance||0)+h,i.x=u,i.z=d),c<1&&(i.target=null),Math.hypot(i.x-s.x,i.z-s.z)<3.5&&s.mode!=="foot"&&s.invincible<=0&&(s.health=Math.max(0,s.health-8),s.speed*=.5,s.invincible=1.5)}s.health<=0&&(s.phase="wrecked")}function Kc(s,e){const t={x:Math.round(s.x),z:Math.round(s.z)},n={x:Math.round(e.x),z:Math.round(e.z)},i=(u,d)=>u+","+d,r=(u,d)=>{if(nn(u,d,.36))return!0;for(const f of s.vehicles){const g=Lt(f.type),x=u-f.x,m=d-f.z,p=Math.cos(f.heading)*x+Math.sin(f.heading)*m,M=-Math.sin(f.heading)*x+Math.cos(f.heading)*m;if(Math.abs(p)<g.width/2+.38&&Math.abs(M)<g.length/2+.38)return!0}return!1};if(r(n.x,n.z)){let u=null,d=1/0;for(let f=-1;f<=1;f++)for(let g=-1;g<=1;g++){const x=n.x+f,m=n.z+g,p=Math.hypot(x-e.x,m-e.z);!r(x,m)&&p<d&&(u={x,z:m},d=p)}if(!u)return[];Object.assign(n,u)}const o={...t,g:0,f:0,parent:null},a=[o],l=new Map([[i(t.x,t.z),0]]);let c=null;for(let u=0;a.length&&u<4500;u++){a.sort((f,g)=>f.f-g.f);const d=a.shift();if(d.x===n.x&&d.z===n.z){c=d;break}for(const[f,g]of[[1,0],[-1,0],[0,1],[0,-1],[1,1],[1,-1],[-1,1],[-1,-1]]){const x=d.x+f,m=d.z+g;if(Math.abs(x-t.x)>55||Math.abs(m-t.z)>55||r(x,m)||f&&g&&(r(d.x+f,d.z)||r(d.x,d.z+g)))continue;const p=d.g+Math.hypot(f,g),M=i(x,m);(l.get(M)??1/0)<=p||(l.set(M,p),a.push({x,z:m,g:p,f:p+Math.hypot(x-n.x,m-n.z),parent:d}))}}if(!c)return[];const h=[];for(;c.parent;)h.push({x:c.x,z:c.z}),c=c.parent;return h.reverse(),h.push(e),h}class wv{constructor(e,{lowDetail:t=!1}={}){this.world=e,this.lowDetail=t,this.pool=[],this.limit=t?10:30,this.departed=[]}acquire(e){let t=this.pool.find(n=>!n.owner&&n.rider===!!e.rider);if(!t&&this.pool.filter(n=>n.rider===!!e.rider).length<(e.rider?Math.ceil(this.limit/4):Math.floor(this.limit*3/4))){const n=["#465f79","#c5b8a0","#677b55","#8b5f56","#41474e"];t=xo({lowDetail:!0,helmet:!!e.rider,color:e.police?"#344658":n[this.pool.length%n.length],skin:["#a47355","#c09979","#77503e"][this.pool.length%3]}),t.rider=!!e.rider,this.pool.push(t)}return t?(t.owner=e,e.group=t.group,e.pose=t.pose,this.world.scene.add(t.group),t):null}release(e){const t=e.owner;if(!t)return;this.world.scene.remove(e.group);const n=this.world.pedestrians.indexOf(t);n>=0&&this.world.pedestrians.splice(n,1),delete t.group,delete t.pose,e.owner=null}update(e,t,n,i){const r=[...e.vehicles,...e.cops].sort((o,a)=>Math.hypot(o.x-i.x,o.z-i.z)-Math.hypot(a.x-i.x,a.z-i.z));for(const o of this.pool){const a=o.owner;if(!a)continue;const l=r.find(c=>c.driver===a);(!l&&!a.exited||!a.exited&&l&&Math.hypot(l.x-i.x,l.z-i.z)>(this.lowDetail?32:70))&&this.release(o)}for(const o of r){const a=o.driver;if(!a||o.guard)continue;if(a.exited){a.group&&!this.world.pedestrians.includes(a)&&(this.world.pedestrians.push(a),this.departed.push(a));continue}const l=Math.hypot(o.x-i.x,o.z-i.z);if(l>(this.lowDetail?32:70))continue;const c=this.pool.find(f=>f.owner===a)||this.acquire(a);if(!c)continue;const h=Lt(o.type),u=ci(o,h.kind==="bike"?0:-.37,h.kind==="bike"?.28:.12),d=a.exiting&&a.exitProgress||0;c.group.visible=!0,c.group.position.set(a.exiting?a.x:u.x,Ri(o.x,o.z),a.exiting?a.z:u.z),c.group.rotation.y=-o.heading,c.pose({detail:l<(this.lowDetail?8:24),time:n,phase:0,seated:1-d,kind:h.kind,seat:h.kind==="bike"?h.seat:["suv","pickup","van"].includes(h.design)?.72:Math.min(.54,h.height-.93),turn:o.steering||0,speed:0,slump:a.health<=0?1:0})}for(;this.departed.length>12;){const o=this.departed.find(l=>Math.hypot(l.x-e.x,l.z-e.z)>35);if(!o)break;this.departed.splice(this.departed.indexOf(o),1);const a=this.pool.find(l=>l.owner===o);a&&this.release(a)}}reset(e){var t;for(const n of this.pool)this.release(n);this.departed.length=0;for(const n of e.vehicles)(t=n.driver)!=null&&t.exiting&&(n.driver.exited=!0,n.driver.exiting=!1)}}const Ch=11.55;function Av(s,e,t=1){const n=s*100,i=e*100,r=Ch,o=100-Ch,a=[{x:n+r,z:i+r},{x:n+r,z:i+o},{x:n+o,z:i+o},{x:n+o,z:i+r}];return t<0?a.reverse():a}function Rv(s,e,t){var c,h;const n={x:s.x,z:s.z};s.flee=Math.max(0,(s.flee||0)-t);let i=0,r=s.heading||0,o=s.activity||"walk";if(s.flee)r=Math.atan2(s.fleeX||1,-(s.fleeZ||1)),i=3.7,o="run";else if((c=s.route)!=null&&c.length){const u=s.route[s.routeIndex||0],d=u.x-s.x,f=u.z-s.z,g=Math.hypot(d,f);r=Math.atan2(d,-f),g<.3&&(s.routeIndex=((s.routeIndex||0)+1)%s.route.length,s.wait=Math.max(s.wait||0,s.activity==="browse"?2.5:0)),s.wait=Math.max(0,(s.wait||0)-t);const x=Math.abs(d)>Math.abs(f)?"x":"z",m=Math.round((x==="x"?s.x:s.z)/100)*100,p=x==="x"?s.x:s.z,M=x==="x"?u.x:u.z,y=Math.abs(p-m)>10&&Math.abs(p-m)<13&&(p-m)*(M-m)<0,v=e.vehicles.some(w=>Math.hypot(w.x-s.x,w.z-s.z)<(w.speed>3?4.3:1.8));i=s.wait||v||y&&!jc(x,e.elapsed)?0:s.activity==="jog"?2.8:s.speed||1.3}s.stun&&(i=0),s.heading=(s.heading??r)+gr(r,s.heading??r)*(1-Math.exp(-t*8));const a=s.x+Math.sin(r)*i*t,l=s.z-Math.cos(r)*i*t;if(!nn(a,l,.32))s.x=a,s.z=l,s.stuck=0;else if(i=0,s.stuck=(s.stuck||0)+t,s.stuck>1.5&&((h=s.route)!=null&&h.length)&&(s.routeIndex=((s.routeIndex||0)+1)%s.route.length,s.stuck=0),s.flee){const u=s.fleeX||1;s.fleeX=-(s.fleeZ||1),s.fleeZ=u}return s.phase=(s.phase||0)+Math.hypot(s.x-n.x,s.z-n.z)*4.2,{speed:i,heading:s.heading,activity:o}}const Cv=new P(0,1,0),Iv=new P(0,0,1),Du=new sn(1,1,1);function Zs(s){const e=new at,t=s==="carbine",n=new st({color:"#29333b",metalness:.72,roughness:.28}),i=new st({color:"#171e23",roughness:.76}),r=new st({color:"#88999f",metalness:.9,roughness:.24}),o=new st({color:"#b7d776",emissive:"#8da845",emissiveIntensity:.17}),a=(u,d,f,g,x,m,p=n)=>{const M=new Fe(Du,p);return M.position.set(u,d,f),M.scale.set(g,x,m),e.add(M),M},l=(u,d,f,g,x,m=n)=>{const p=new Fe(new gn(g,g,x,12),m);return p.rotation.x=Math.PI/2,p.position.set(u,d,f),e.add(p),p};if(t){a(0,.045,-.12,.07,.09,.39),a(0,.004,-.29,.062,.1,.2,i),l(0,.06,-.46,.012,.18),l(0,.06,-.56,.022,.044),a(0,.041,.135,.065,.1,.18,i),a(0,.017,.235,.085,.16,.04,i),a(0,-.12,-.1,.05,.16,.076,i).rotation.x=-.18,a(0,.113,-.07,.034,.022,.19),a(0,.155,-.08,.039,.07,.071),a(0,.152,-.118,.021,.04,.008,o);for(let u=0;u<6;u++)a(0,.104,-.25-u*.026,.075,.012,.01,r);for(const u of[-1,1])for(let d=0;d<4;d++)a(u*.034,.05,-.24-d*.033,.004,.022,.019,i)}else{a(0,.045,-.063,.045,.05,.185),a(0,.01,-.025,.043,.035,.14,i),l(0,.044,-.166,.011,.027,r),a(0,.075,-.145,.009,.011,.018,i),a(0,.075,.008,.034,.01,.02,i);for(const u of[-1,1])for(let d=0;d<5;d++)a(u*.023,.046,-.005-d*.008,.001,.028,.002,r)}a(0,-.058,.025,.046,.118,.055,i).rotation.x=.18,a(0,-.01,-.033,.043,.048,.012,i),a(0,-.035,-.012,.036,.013,.049,i),a(.024,-.041,.033,.002,.06,.021,o);const c=new at;c.position.set(0,t?.06:.044,t?-.588:-.189),e.add(c);const h=new Fe(new So(1),new Xt({color:"#fff1b5"}));return h.scale.set(.035,.036,.11),h.position.z=-.06,c.add(h),h.visible=!1,e.traverse(u=>{u.isMesh&&(u.castShadow=!0,u.userData.dynamic=!0)}),{group:e,muzzle:c,flash:h}}class Pv{constructor(e,t,n,{lowDetail:i=!1}={}){this.world=e,this.camera=t,this.models=n,this.lowDetail=i,this.targets=[],this.guards=[],this.guardPool=[],this.tracers=[],this.sparks=[],this.holes=[],this.shotAge=10,this.selected=null,this.lastResult="",this.targetHits=0,this.weapons={sidearm:Zs("sidearm"),carbine:Zs("carbine")},this.viewWeapons={sidearm:Zs("sidearm"),carbine:Zs("carbine")},this.view=new at,e.scene.add(this.view),this.viewHands=new at,this.view.add(this.viewHands);const r=new st({color:"#343c40",roughness:.83}),o=new st({color:"#77766b",roughness:.85});for(const h of[-1,1]){const u=new Fe(new _n(1,14,10),r);u.scale.set(.039,.047,.065),u.position.set(h===1?0:-.065,-.07,h===1?.04:-.27),this.viewHands.add(u);const d=new Fe(new gn(.042,.065,.34,12),o);d.rotation.x=Math.PI/2+.3,d.position.set(h===1?.035:-.1,-.13,h===1?.2:-.09),this.viewHands.add(d)}for(const h of Object.values(this.weapons))e.player.gunSocket.add(h.group),h.group.visible=!1;for(const h of Object.values(this.viewWeapons))this.view.add(h.group),h.group.visible=!1;const a=new gn(.005,.005,1,5),l=new _n(.018,5,4),c=new Ui(.032,8);for(let h=0;h<18;h++){const u=new Fe(a,new Xt({color:"#ffdea0",transparent:!0,opacity:.8,depthWrite:!1}));u.visible=!1,e.scene.add(u),this.tracers.push({mesh:u,life:0})}for(let h=0;h<40;h++){const u=new Fe(l,new Xt({color:"#f5c773"}));u.visible=!1,e.scene.add(u),this.sparks.push({mesh:u,life:0,velocity:new P})}for(let h=0;h<32;h++){const u=new Fe(c,new Xt({color:"#252b2c",side:Ct,depthWrite:!1,polygonOffset:!0,polygonOffsetFactor:-2}));u.visible=!1,e.scene.add(u),this.holes.push(u)}this.holeIndex=0,this.makeRange()}makeRange(){const e=this.world.scene,t=new st({color:"#334449",roughness:.8}),n=new st({color:"#9b9b89",roughness:1}),i=new st({color:"#dedbcb",roughness:.9}),r=new st({color:"#c88c54",roughness:.65}),o=(u,d,f,g,x,m,p)=>{const M=new Fe(Du,p);return M.position.set(u,d,f),M.scale.set(g,x,m),M.castShadow=!0,e.add(M),M};o(57,1.35,184.5,28,2.4,.6,n),o(57,.125,179,28,.025,12,t);for(let u=0;u<3;u++){const d=48+u*9,f=181,g=new at;g.position.set(d,.3,f),e.add(g);const x=new Fe(new gn(.035,.04,1.6,8),t);x.position.y=.8,g.add(x);const m=new at;m.position.y=1.45,g.add(m);const p=new Fe(new sn(.82,1,.085),i);m.add(p);for(let y=0;y<3;y++){const v=new Fe(new mn(.1+y*.09,.013,5,32),y%2?t:r);v.position.z=-.047,m.add(v)}const M=new Fe(new Ui(.045,16),t);M.position.z=-.049,M.rotation.y=Math.PI,m.add(M),this.targets.push({x:d,z:f,y:1.75,health:100,group:g,board:m,down:0,reset:0,index:u})}const a=document.createElement("canvas");a.width=1024,a.height=128;const l=a.getContext("2d");l.fillStyle="#283d40",l.fillRect(0,0,1024,128),l.fillStyle="#ecedd9",l.font="600 55px Arial",l.textAlign="center",l.fillText("GRAND CITY  /  TARGET RANGE",512,82);const c=new Ps(a);c.colorSpace=Mt;const h=new Fe(new es(8,.9),new st({map:c,side:Ct}));h.position.set(57,2.38,184.18),h.rotation.y=Math.PI,e.add(h)}bounds(e,{people:t=!0}={}){const n=vr.map(i=>({...i,y:i.h/2,h:i.h,kind:"wall"}));for(const i of Cu)n.push({...i,y:i.z===159?1.9:.45,h:i.z===159?3.8:.9,kind:"wall"});n.push({x:57,y:1.35,z:184.5,w:28,h:2.4,d:.6,kind:"wall"});for(const i of[...e.vehicles,...e.cops]){const r=Lt(i.type||"sentinel");n.push({x:i.x,z:i.z,y:Ri(i.x,i.z)+(r.kind==="car"?r.height/2:.6),w:r.width,h:r.height||1.2,d:r.length,heading:i.heading,kind:"vehicle",ref:i})}for(const i of[...e.vehicles,...e.cops]){const r=i.driver;if(r&&!r.exited&&r.health>0){const o=Lt(i.type||"sentinel"),a=ci(i,o.kind==="bike"?0:-.37,o.kind==="bike"?.28:.12),l=(o.kind==="bike"?o.seat:["suv","pickup","van"].includes(o.design)?.72:Math.min(.54,o.height-.93))+.69;n.push({x:a.x,y:l,z:a.z,w:.27,h:.34,d:.27,kind:"driver",ref:r,vehicle:i})}}for(const i of this.targets)i.down||n.push({x:i.x,y:i.y,z:i.z,w:.84,h:1.04,d:.14,kind:"target",ref:i});if(t){for(const i of this.world.pedestrians)(i.health??100)>0&&n.push({x:i.x,z:i.z,y:1.69,w:.23,h:.28,d:.24,kind:"person",region:"head",ref:i});for(const i of this.world.pedestrians)(i.health??100)>0&&n.push({x:i.x,z:i.z,y:1.02,w:.48,h:1.45,d:.38,kind:"person",ref:i});for(const i of this.guards)i.health>0&&n.push({x:i.x,z:i.z,y:1.04,w:.52,h:1.8,d:.42,kind:"guard",ref:i})}return n}trace(e,t,n,i){let r=va(e,t,n,i);if((r==null?void 0:r.object.kind)==="vehicle"&&r.point.y>.9){const o=va(e,t,n.filter(a=>a.kind==="driver"&&a.vehicle===r.object.ref),Math.min(i,r.distance+3));o&&(r=o)}if(t.y<-.001){const o=(.14-e.y)/t.y;o>0&&o<((r==null?void 0:r.distance)??i)&&(r={distance:o,point:{x:e.x+t.x*o,y:.145,z:e.z+t.z*o},normal:{x:0,y:1,z:0},object:{kind:"ground"}})}return r}beam(e,t,n="#ffdda1"){const i=this.tracers.find(o=>!o.life)||this.tracers[0],r=new P().subVectors(t,e);i.mesh.position.copy(e).add(t).multiplyScalar(.5),i.mesh.quaternion.setFromUnitVectors(Cv,r.clone().normalize()),i.mesh.scale.set(1,r.length(),1),i.mesh.material.color.set(n),i.mesh.visible=!0,i.life=.11}impact(e){var r,o;for(let a=0;a<5;a++){const l=this.sparks.find(c=>!c.life);if(!l)break;l.mesh.position.set(e.point.x,e.point.y,e.point.z),l.velocity.set((Math.random()-.5)*2,Math.random()*1.8+.4,(Math.random()-.5)*2),l.life=.25+Math.random()*.2,l.mesh.visible=!0}if(!["wall","ground","vehicle"].includes(e.object.kind))return;const t=this.holes[this.holeIndex++%this.holes.length],n=new P(e.normal.x,e.normal.y,e.normal.z),i=new P(e.point.x,e.point.y,e.point.z).addScaledVector(n,.012);if(this.world.scene.add(t),t.position.copy(i),t.quaternion.setFromUnitVectors(Iv,n),t.visible=!0,e.object.kind==="vehicle"){const a=((r=this.models.get(e.object.ref.uid))==null?void 0:r.group)||((o=e.object.ref.model)==null?void 0:o.group);if(a){const l=t.quaternion.clone();a.add(t),t.position.copy(a.worldToLocal(i)),t.quaternion.copy(a.getWorldQuaternion(new qt).invert().multiply(l))}}}shoot(e,t=!1){const n=gv(e);if(!n)return!1;const i=this.bounds(e),r=this.camera.getWorldPosition(new P),o=this.camera.getWorldDirection(new P);this.world.scene.updateMatrixWorld(!0);const a=this.trace(r,o,i,n.range),l=a?new P(a.point.x,a.point.y,a.point.z):r.clone().addScaledVector(o,n.range),c=(t?this.viewWeapons:this.weapons)[n.id],h=c.muzzle.getWorldPosition(new P),u=l.clone().sub(h).normalize(),d=this.trace(h,u,i,h.distanceTo(l)+.1),f=d?new P(d.point.x,d.point.y,d.point.z):l;if(this.beam(h,f),this.shotAge=0,c.flash.visible=!0,this.lastResult=(d==null?void 0:d.object.kind)||"miss",d){this.impact(d);const x=d.object,m=x.ref;if(x.kind==="target"&&(m.health-=n.damage,e.combat.hit=.2,this.targetHits++,m.health<=0?(m.down=1,m.reset=2.5,mt(e,"Target down")):mt(e,"Target hit · "+Math.max(0,m.health)+"%"),e.events.push("hitMetal")),x.kind==="person"||x.kind==="guard"||x.kind==="driver"){const p=x.region==="head"||x.kind==="driver"?n.damage*3:n.damage;m.health=(m.health??100)-p,m.flee=12,m.fleeX=m.x-e.x,m.fleeZ=m.z-e.z,m.flinch=1,m.stun=.45,x.kind==="driver"&&(x.vehicle.stopTimer=20,m.health<=0?(x.vehicle.speed*=.35,x.vehicle.traffic=!1):m.scared=!0),e.combat.hit=.2,m.health<=0&&(m.fallen=.01,m.downTime=0),Ci(e,x.kind==="guard"?2:1),e.events.push("hitBody")}x.kind==="vehicle"&&(m.damage=Math.min(1,(m.damage||0)+n.damage/250),m.stopTimer=8,m.damage>=1&&(m.disabled=!0,m.traffic=!1),d.point.y<.55&&(m.punctured=!0,m.damage=Math.min(1,m.damage+.08)),m.speed=(m.speed||0)*.5,e.combat.hit=.16,Ci(e,1),e.events.push("hitMetal"))}if(!((d==null?void 0:d.object.kind)==="target"||e.x>41&&e.x<72&&e.z>168&&e.z<183&&o.z>.3)){e.wanted===0?Ci(e,1):e.heatTimer=0;for(const x of this.world.pedestrians)Math.hypot(x.x-e.x,x.z-e.z)<45&&(x.flee=10,x.fleeX=x.x-e.x,x.fleeZ=x.z-e.z)}return!0}update(e,t,n,i=!1){mv(e,t),this.shotAge+=t;const r=e.mode==="foot"&&!e.transition&&Xn(e.combat.selected);this.selected=(r==null?void 0:r.id)||null;for(const[o,a]of Object.entries(this.weapons))a.group.visible=this.selected===o&&!i,a.flash.visible=a.group.visible&&this.shotAge<.065;for(const[o,a]of Object.entries(this.viewWeapons))a.group.visible=this.selected===o&&i,a.flash.visible=a.group.visible&&this.shotAge<.065;this.view.visible=!!r&&i,this.viewHands.children[0].visible=this.selected==="carbine",this.viewHands.children[1].visible=this.selected==="carbine",this.view.position.set(.23,-.24+e.combat.recoil*.5,-.46).applyQuaternion(this.camera.quaternion).add(this.camera.position),this.view.quaternion.copy(this.camera.quaternion),this.view.rotateX(e.combat.recoil*2);for(const o of this.tracers)o.life&&(o.life=Math.max(0,o.life-t),o.mesh.visible=o.life>0,o.mesh.material.opacity=o.life/.11);for(const o of this.sparks)o.life&&(o.life=Math.max(0,o.life-t),o.mesh.visible=o.life>0,o.velocity.y-=6*t,o.mesh.position.addScaledVector(o.velocity,t));for(const o of this.targets)o.reset?(o.reset-=t,o.board.rotation.x=Math.min(Math.PI*.48,o.board.rotation.x+t*5),o.reset<=0&&(o.reset=0,o.down=0,o.health=100)):o.board.rotation.x*=Math.exp(-t*7);e.phase==="playing"&&this.updateGuards(e,t,n)}updatePedestrians(e,t,n,i){for(const r of this.world.pedestrians){const o=Math.hypot(r.x-e.x,r.z-e.z)<(this.lowDetail?45:85);if(r.group.visible=o,!o)continue;i&&e.mode!=="foot"&&Math.abs(e.speed)>4&&(r.health??100)>0&&Math.hypot(r.x-e.x,r.z-e.z)<1.55&&(r.health=0,r.fallen=.01,r.downTime=0,e.speed*=.72,Ci(e,2),e.events.push("hitBody")),r.flinch=Math.max(0,(r.flinch||0)-t*4),r.stun=Math.max(0,(r.stun||0)-t);let a=0,l=r.axis==="z"?r.dir>0?Math.PI:0:r.dir>0?Math.PI/2:-Math.PI/2;if((r.health??100)<=0)r.fallen=Math.min(1,(r.fallen||0)+t*2.5),r.downTime=(r.downTime||0)+t,r.downTime>45&&Math.hypot(r.x-e.x,r.z-e.z)>25&&(r.health=100,r.fallen=0,r.flee=0);else if(i){const c=Rv(r,e,t);a=c.speed,l=c.heading}i||(l=r.heading||0),r.group.position.set(r.x,Ri(r.x,r.z),r.z),r.group.rotation.y=-l,r.pose({phase:r.phase,time:n,speed:a,activity:r.flee?"run":r.activity,detail:Math.hypot(r.x-e.x,r.z-e.z)<(this.lowDetail?8:24),fallen:r.fallen||0,flinch:r.flinch||0})}}updateGuards(e,t,n){var r,o;if(e.wanted>0&&e.mode==="foot")for(const a of e.cops){if(a.guard||((r=a.driver)==null?void 0:r.health)<=0||this.guards.length>=3||Math.hypot(a.x-e.x,a.z-e.z)>38)continue;const l=a.x+2.5,c=a.z+2.8;if(nn(l,c,.4))continue;let h=this.guardPool.find(u=>!this.guards.includes(u));if(!h){const u=xo({color:"#45545e",skin:"#aa795c",lowDetail:!0}),d=Zs("carbine");u.gunSocket.add(d.group),h={...u,gun:d},this.guardPool.push(h)}Object.assign(h,{x:l,z:c,health:100,fireIn:1.6,phase:0,cop:a,fallen:0,flashTime:0,flee:0,downTime:0}),a.guard=h,a.driver&&(a.driver.exited=!0),(o=a.driver)!=null&&o.group&&(a.driver.group.visible=!1),this.world.scene.add(h.group),this.guards.push(h)}const i=this.bounds(e,{people:!1});for(const a of this.guards){const l=Math.hypot(a.x-e.x,a.z-e.z);if(a.group.visible=l<100,!a.group.visible)continue;let c=0;const h=Math.atan2(e.x-a.x,a.z-e.z);if(a.health<=0)a.fallen=Math.min(1,(a.fallen||0)+t*2.4);else if(e.wanted){if(l>15){const u=a.x+Math.sin(h)*t*2.4,d=a.z-Math.cos(h)*t*2.4;nn(u,d,.4)||(a.x=u,a.z=d,c=2.4)}if(a.fireIn-=t,a.fireIn<=0&&l<42){a.fireIn=1.25+Math.random()*.35;const u=new P(a.x,1.45,a.z),d=new P(e.x,Ri(e.x,e.z)+1.14,e.z),f=d.clone().sub(u).normalize();va(u,f,i,l)||(this.beam(u,d,"#edb392"),a.gun.flash.visible=!0,a.flashTime=.08,e.invincible<=0&&(e.health=Math.max(0,e.health-8),e.invincible=.35,e.events.push("incoming"),e.health<=0&&(e.phase="wrecked")))}}a.flashTime=Math.max(0,(a.flashTime||0)-t),a.gun.flash.visible=a.flashTime>0,a.group.position.set(a.x,Ri(a.x,a.z),a.z),a.group.rotation.y=-h,a.phase+=t*c*4,a.pose({detail:l<(this.lowDetail?8:24),time:n,phase:a.phase,speed:c,weapon:"carbine",aiming:!!e.wanted,fallen:a.fallen||0})}if(!e.wanted){for(const a of this.guards)this.world.scene.remove(a.group),a.cop&&(a.cop.guard=null);this.guards.length=0}}reset(){for(const e of this.guards)this.world.scene.remove(e.group),e.cop&&(e.cop.guard=null);this.guards.length=0;for(const e of this.world.pedestrians)e.health=100,e.fallen=0,e.flee=0;for(const e of this.holes)this.world.scene.add(e),e.visible=!1;for(const e of this.tracers)e.life=0,e.mesh.visible=!1}}const Lv=new P(0,1,0),Dv=new sn(1,1,1);function Nv({d:s,group:e,wheels:t,front:n,lowDetail:i}){const r=s.design==="heavy",o=s.design==="street",a=s.design==="concept",l=s.design==="super",c=r?.355:.325,h=s.wheelbase,u=(F,O=.1,W=.55)=>new st({color:F,metalness:O,roughness:W}),d=new kt({color:s.color,metalness:.55,roughness:.2,clearcoat:1,clearcoatRoughness:.12}),f=u("#1b242a",.23,.43),g=u("#13171b",0,.91),x=u("#9ca7ab",.85,.24),m=u("#4a5155",.8,.4),p=u("#ad894e",.72,.26),M=u(s.accent,.4,.3),y=u("#a34736",.5,.4),v=new st({color:"#f2f4e8",emissive:"#e1eee1",emissiveIntensity:.8}),w=new st({color:"#e14732",emissive:"#d53224",emissiveIntensity:.7}),S=(F,O,W=0,J=0,H=0,z=e)=>{const Z=new Fe(F,O);return Z.position.set(W,J,H),z.add(Z),Z},R=(F,O,W,J,H,z,Z,le=e)=>{const re=S(Dv,Z,F,O,W,le);return re.scale.set(J,H,z),re},I=(F,O,W,J,H,z,Z,le=e)=>{const re=S(new _n(1,i?16:28,i?10:18),Z,F,O,W,le);return re.scale.set(J,H,z),re},T=(F,O,W,J=e)=>S(new Fs(new Ls(F.map(H=>new P(...H))),i?12:24,O,i?6:10,!1),W,0,0,0,J),b=(F,O,W,J,H=e)=>{const z=new P(...F),Z=new P(...O),le=Z.clone().sub(z),re=S(new gn(W,W,le.length(),i?8:14),J,...z.add(Z).multiplyScalar(.5).toArray(),H);return re.quaternion.setFromUnitVectors(Lv,le.normalize()),re};function U(F,O){const W=i?18:32,J=[],H=[];for(const[Z,le,re,_e]of F)for(let me=0;me<=W;me++){const ze=me/W*Math.PI*2;J.push(Math.sin(ze)*re,le+Math.cos(ze)*_e,Z)}for(let Z=0;Z<F.length-1;Z++)for(let le=0;le<W;le++){const re=Z*(W+1)+le,_e=re+W+1;H.push(re,_e,re+1,re+1,_e,_e+1)}const z=new dt;return z.setAttribute("position",new We(J,3)),z.setIndex(H),z.computeVertexNormals(),S(z,O)}function V(F,O,W){const J=new at;J.position.set(0,c,F),e.add(J),W&&n.push(J);const H=new at;J.add(H),t.push(H);const z=S(new mn(c*.79,c*.21,i?8:14,i?28:48),g,0,0,0,H);z.rotation.y=Math.PI/2,z.scale.z=O/(c*.42);for(const Z of[-1,1]){const le=S(new mn(c*.67,.019,8,32),a?M:x,Z*O*.43,0,0,H);le.rotation.y=Math.PI/2;const re=S(new Eo(c*.3,c*.59,32),m,Z*(O*.46+.009),0,0,H);re.rotation.y=Z*Math.PI/2,re.material.side=Ct;for(let _e=0;_e<(r?10:5);_e++){const me=_e/(r?10:5)*Math.PI*2;b([Z*O*.42,Math.cos(me)*.045,Math.sin(me)*.045],[Z*O*.42,Math.cos(me+.12)*c*.65,Math.sin(me+.12)*c*.65],r?.01:.019,a?f:x,H)}R(Z*(O*.5+.025),.08,.16,.042,.115,.068,y,J)}b([-.1,0,0],[.1,0,0],.028,x,H)}V(-h/2,r?.145:.125,!0),V(h/2,r?.245:.195,!1);for(const F of[-1,1]){b([F*.1,c,-h/2],[F*.1,.96,-.43],.026,x),b([F*.1,.58,-h/2+.12],[F*.1,.91,-.45],.039,p),T([[F*.15,.82,-.35],[F*.18,.49,-.08],[F*.17,.42,.29],[F*.15,.72,.45]],o?.025:.034,o?M:f),b([F*.14,c,h/2],[F*.17,.49,.09],.032,x),b([F*.16,.74,.36],[F*.1,.52,.01],.025,x);const O=r?1.04:1.01,W=r?-.34:-.43;b([0,.96,-.43],[F*.34,O,W],.018,x),b([F*.28,O,W],[F*.4,O,W],.025,g),b([F*.29,O-.025,W-.02],[F*.41,O-.022,W-.07],.009,x),b([F*.27,.94,-.48],[F*.38,1.11,-.54],.012,f),I(F*.39,1.11,-.54,.064,.03,.025,f),I(F*.39,1.113,-.513,.055,.024,.004,x),b([F*.17,.43,.1],[F*.29,.43,.15],.015,x),R(F*.29,.43,.15,.12,.024,.045,g)}if(U([[-.48,.77,.018,.035],[-.34,.84,r?.23:.2,.125],[-.08,.84,r?.25:.205,.145],[.11,.79,.145,.085],[.2,.77,.05,.027]],d),I(0,s.seat+.012,.28,r?.205:.155,.048,r?.28:.22,g),I(0,s.seat+.09,.6,.12,.04,.18,g),S(new gn(.05,.05,.012,24),x,0,.984,-.12),r){for(const F of[-1,1])for(let O=0;O<7;O++){const W=R(F*.125,.48+O*.022,-.01+F*.06,.23,.011,.26,m);W.rotation.z=F*.28}I(0,.47,.1,.23,.15,.23,m);for(const F of[.08,.2])T([[.1,.51,F],[.23,.3,F+.12],[.28,.32,.71],[.29,.38,.91]],.042,x);I(0,.88,-.6,.14,.13,.065,f),I(0,.88,-.66,.115,.108,.015,v);for(const F of[-1,1]){b([F*.17,.73,.44],[F*.24,.48,.75],.027,x);for(let O=0;O<8;O++){const W=S(new mn(.04,.008,6,12),p,F*(.17+O*.009),.73-O*.032,.44+O*.04);W.rotation.z=F*.23}}U([[.4,.74,.18,.035],[.7,.72,.21,.07],[.94,.6,.17,.055],[1.11,.49,.025,.025]],d)}else if(o){I(0,.48,.06,.2,.18,.26,m);for(let F=0;F<7;F++)R(0,.4+F*.026,.015,.39,.012,.26,x);I(0,.89,-.62,.12,.115,.07,f),I(0,.89,-.691,.1,.095,.012,v),b([-.08,.9,-.707],[.08,.9,-.707],.006,f),U([[.28,.72,.15,.035],[.52,.84,.16,.055],[.82,.91,.1,.04],[.91,.91,.012,.01]],d),T([[.1,.42,-.15],[.18,.27,-.01],[.23,.29,.3],[.24,.41,.65]],.027,x),I(.25,.42,.61,.058,.055,.2,f)}else{I(0,.49,.045,.19,.19,.28,m),U([[-.96,.73,.012,.015],[-.77,.81,.14,.13],[-.53,.82,a?.245:.27,.2],[-.26,.68,.265,.24],[.03,.5,.18,.1],[.24,.49,.025,.028]],d);for(const O of[-1,1])I(O*.258,.66,-.22,.012,.11,.18,f),T([[O*.24,.89,-.49],[O*.26,.75,-.28],[O*.18,.57,-.05]],.01,M),b([O*.1,.79,-.91],[O*.23,.84,-.72],.016,v);U([[.28,.72,.15,.035],[.53,.91,.16,.06],[.83,.97,.08,.038],[1.03,.94,.013,.01]],d);const F=I(0,1.005,-.57,.145,.165,.027,new kt({color:"#49656e",roughness:.08,transparent:!0,opacity:.4,depthWrite:!1}));if(F.rotation.x=-.42,l)for(const O of[-1,1])R(O*.31,.71,-.6,.21,.018,.18,f).rotation.z=O*.08,T([[O*.18,.34,-.06],[O*.24,.36,.36],[O*.22,.57,.62]],.039,x);if(a){U([[-.43,.48,.14,.06],[0,.43,.19,.095],[.49,.51,.12,.06]],f);for(const O of[-1,1]){b([O*.22,.49,-.32],[O*.22,.49,.34],.01,M);const W=S(new Ui(c*.53,32),d,O*.105,c,h/2);W.rotation.y=O*Math.PI/2}}s.design==="sport"&&(I(.24,.4,.53,.064,.058,.23,f),T([[.12,.43,-.14],[.18,.26,.01],[.24,.31,.43]],.028,x))}for(const F of[-h/2,h/2]){const O=[];for(let W=0;W<=20;W++){const J=.23+W/20*2.55;O.push([0,c+Math.sin(J)*(c+.044),F+Math.cos(J)*(c+.044)])}T(O,r?.085:.055,d)}b([0,.68,.25],[0,.52,.02],.031,p);for(let F=0;F<7;F++){const O=S(new mn(.035,.007,6,12),x,0,.54+F*.019,.03+F*.028);O.rotation.x=-.5}T([[-.115,.34,h/2],[-.115,.44,.05],[-.115,.48,.05],[-.115,.38,h/2]],.01,m),R(0,1.018,-.39,.15,.019,.085,f),R(0,1.029,-.39,.125,.004,.06,M),R(0,r?.62:.91,r?1.02:.88,.13,.034,.024,w),R(0,r?.48:.64,r?1.06:.87,.17,.1,.014,x).rotation.x=-.22;for(const F of[-1,1])I(F*.2,.8,-.59,.029,.016,.028,u("#d79036")),I(F*.16,r?.6:.86,.81,.024,.015,.022,u("#d79036"))}const Uv=new P(0,1,0),Fv=new sn(1,1,1);function Ov({d:s,group:e,lowDetail:t,doors:n,wheels:i,front:r,lights:o}){const a=s.width,l=s.length,c=s.height,h=s.design==="pickup",u=s.design==="van",d=s.design==="wagon",f=s.design==="hatch",g=s.design==="roadster",x=s.design==="hyper",m=s.design==="muscle",p=s.design==="limo",M=s.engine==="security",y=s.design==="suv"||h||u,v=["sport","concept","roadster","hyper"].includes(s.design),w=["ev","concept"].includes(s.design),S=(_,N=0,k=.6)=>new st({color:_,metalness:N,roughness:k}),R=new kt({color:s.color,metalness:.64,roughness:.23,clearcoat:1,clearcoatRoughness:.12,envMapIntensity:1.15}),I=S("#152029",.15,.42),T=S("#17191c",0,.95),b=S("#a4b0b5",.92,.2),U=S("#22272d",0,.76),V=S("#a34832",.5,.4),F=new kt({color:"#344c58",metalness:.25,roughness:.09,transparent:!0,opacity:.35,depthWrite:!1,clearcoat:1,envMapIntensity:1.4}),O=new st({color:"#f8efdb",emissive:"#f4ead2",emissiveIntensity:.6}),W=new st({color:"#9e2626",emissive:"#df3222",emissiveIntensity:.7}),J=(_,N,k=0,X=0,G=0,ge=e)=>{const ce=new Fe(_,N);return ce.position.set(k,X,G),ge.add(ce),ce},H=(_,N,k,X,G,ge,ce,xe=e)=>{const we=J(Fv,ce,_,N,k,xe);return we.scale.set(X,G,ge),we},z=(_,N,k,X,G,ge,ce,xe=e)=>{const we=J(new _n(1,t?14:24,t?8:14),ce,_,N,k,xe);return we.scale.set(X,G,ge),we},Z=(_,N,k,X,G=e)=>{const ge=new P(..._),ce=new P(...N),xe=ce.clone().sub(ge),we=ge.add(ce).multiplyScalar(.5),ue=J(new gn(k,k,xe.length(),8),X,...we.toArray(),G);return ue.quaternion.setFromUnitVectors(Uv,xe.normalize()),ue},le=(_,N,k=e)=>{const X=new dt;X.setAttribute("position",new We(_.flat(),3)),X.setIndex([0,1,2,0,2,3]),X.computeVertexNormals();const G=J(X,N,0,0,0,k);return G.material.side=Ct,G},re=u?.82:y?.75:x?.49:.57,_e=u?.46:y?.4:m?.33:.28,me=y?.405:v?.335:.355,ze=s.wheelbase/2,ke=t?28:64,te=t?16:32,ae=[],ye=[],Ie=new Ls([new P(-.5,.83,.64),new P(-.46,.94,.87),new P(-.31,1,1),new P(0,.985,.93),new P(.32,1,1),new P(.46,.95,.92),new P(.5,.83,.72)]);for(let _=0;_<=ke;_++){const N=Ie.getPoint(_/ke),k=N.x*l;for(let X=0;X<=te;X++){const G=X/te*Math.PI*2,ge=Math.cos(G),ce=Math.sin(G);ae.push(Math.sign(ge)*Math.abs(ge)**(x?.6:m?.3:.43)*a*.495*N.y,re+Math.sign(ce)*Math.abs(ce)**.6*_e*N.z,k)}}for(let _=0;_<ke;_++)for(let N=0;N<te;N++){const k=_*(te+1)+N,X=k+te+1;for(const G of[[k,k+1,X],[k+1,X+1,X]]){const ge=G.reduce((Re,Ee)=>Re+ae[Ee*3],0)/3,ce=G.reduce((Re,Ee)=>Re+ae[Ee*3+1],0)/3,xe=G.reduce((Re,Ee)=>Re+ae[Ee*3+2],0)/3,we=Math.abs(ge)>a*.365&&[-ze,ze].some(Re=>Math.hypot(xe-Re,ce-me)<me+.066),ue=Math.abs(xe-.13)<.95&&Math.abs(ge)<a*.4&&ce>re+.06,Te=Math.abs(ge)>a*.43&&xe>-.85&&xe<.49&&ce>.35,Be=h&&xe>.86&&Math.abs(ge)<a*.43&&ce>re;!we&&!ue&&!Te&&!Be&&ye.push(...G)}}const A=new dt;A.setAttribute("position",new We(ae,3)),A.setIndex(ye),A.computeVertexNormals(),J(A,R),z(0,re,-l*.477,a*.46,_e*.74,.115,R),z(0,re+.02,l*.477,a*.455,_e*.78,.115,R),H(0,.29,0,a*.86,.12,l*.9,I);const j=y?.48:.33;for(const _ of[-1,1])H(_*a*.476,j,.03,.055,.105,l*.55,I);const Y=u?-1.12:x?-.18:m?-.2:v?-.25:-.46,E=h?.61:u?l*.43:se(),$=a*(y?.405:x?.34:.373),Q=y?1.09:x?.74:.88;function se(){return p?1.72:d?1.73:f?1.33:y?1.45:v?.89:1.18}const ie=[],be=[],oe=t?10:20;for(let _=0;_<=oe;_++){const N=_/oe,k=(N*2-1)*$,X=c-.045-Math.abs(N*2-1)**3*.045;ie.push(k,X,Y-.025,k,X+.015,E)}for(let _=0;_<oe;_++){const N=_*2;be.push(N,N+1,N+2,N+2,N+1,N+3)}const de=new dt;de.setAttribute("position",new We(ie,3)),de.setIndex(be),de.computeVertexNormals(),g||(J(de,R).material.side=Ct);const Ve=u?-1.64:x?-.86:-1.04,Je=h?.83:u?l*.445:d?1.95:f?1.54:p?1.98:y?1.64:1.49;le([[-a*.407,Q,Ve],[a*.407,Q,Ve],[$,c-.068,Y],[-$,c-.068,Y]],F),g||le([[a*.414,Q,Je],[-a*.414,Q,Je],[-$,c-.06,E],[$,c-.06,E]],F);for(const _ of[-1,1]){Z([_*a*.41,Q,Ve],[_*$,c-.055,Y],.032,R),g||Z([_*a*.415,Q,Je],[_*$,c-.055,E],y?.058:.043,R),g||Z([_*$,c-.049,Y],[_*$,c-.034,E],.022,R);const N=new at;N.position.set(_*a*.481,0,-.85),e.add(N),n.push({group:N,side:_}),le([[0,.37,0],[0,.37,1.34],[-_*.014,Q,1.34],[-_*.008,Q,0]],R,N);const k=_*($-a*.481);g||le([[-_*.018,Q+.025,.035],[-_*.018,Q+.025,1.31],[k,c-.093,1.29],[k,c-.093,Y+.88]],F,N),Z([0,Q+.005,.01],[0,Q+.005,1.33],.013,b,N),Z([k,c-.075,1.32],[-_*.014,Q,1.32],.025,I,N),H(_*.018,Q-.08,1.1,.026,.024,.16,b,N),g||le([[_*a*.46,Q+.02,.54],[_*a*.423,Q+.02,Je-.04],[_*$,c-.09,E-.07],[_*$,c-.09,.5]],F),Z([_*a*.46,Q+.013,.54],[_*a*.422,Q+.013,Je-.04],.011,b),Z([_*a*.48,Q-.08,-.71],[_*a*.58,Q-.035,-.76],.023,I),z(_*a*.586,Q+.01,-.75,.12,.055,.09,R),z(_*a*.59,Q+.013,-.695,.094,.037,.008,F);for(const G of[-ze,ze]){const ge=[];for(let ce=0;ce<=22;ce++){const xe=-.13+ce/22*(Math.PI+.26);ge.push(new P(_*a*.492,me+Math.sin(xe)*(me+.045),G+Math.cos(xe)*(me+.045)))}J(new Fs(new Ls(ge),t?16:24,y?.022:.012,6,!1),y?I:R)}const X=re+_e*.47;if(y){H(_*a*.33,X,-l*.483,a*.22,.13,.042,I);for(const G of[-.037,.037])Z([_*a*.24,X+G,-l*.51],[_*a*.43,X+G,-l*.5],.014,O);Z([_*a*.435,X-.04,-l*.5],[_*a*.435,X+.04,-l*.5],.014,O)}else if(!m){if(z(_*a*.31,X,-l*.485,a*.15,.04,.035,I),Z([_*a*.18,X+.009,-l*.501],[_*a*.43,X+.025,-l*.482],.014,O),x||s.design==="concept")Z([_*a*.43,X+.025,-l*.482],[_*a*.41,X-.12,-l*.497],.012,O);else if(g)for(const G of[-.045,.045])z(_*a*.31+G,X,-l*.506,.027,.027,.016,O)}Z([_*a*.19,re+_e*.61,l*.496],[_*a*.43,re+_e*.55,l*.489],.025,W),z(_*a*.34,re-.07,-l*.496,a*.12,.066,.024,I)}for(const _ of g||x||h?[.15]:[.15,.92])for(const N of[-1,1]){const k=N*a*.215;z(k,.48,_,.21,.065,.27,U);const X=z(k,.73,_+.22,.21,.27,.06,U);X.rotation.x=.12,z(k,1.03,_+.25,.11,.095,.06,U)}H(0,.77,-.76,a*.79,.13,.28,I),H(0,.48,.1,.18,.12,1.1,I);const D=J(new mn(.165,.018,8,24),I,-.37,.94,-.53);if(D.rotation.x=-.25,Z([-.5,.94,-.53],[-.24,.94,-.53],.013,b),H(-.37,.96,-.775,.25,.09,.015,S("#508b94",.3,.3)),H(.05,.84,-.745,.22,.11,.02,S("#344951",.2,.3)),w)Z([-a*.3,re-.12,-l*.5],[a*.3,re-.12,-l*.5],.016,I);else if(y){H(0,re-.025,-l*.503,a*.45,.22,.035,I);for(let _=-2;_<=2;_++)H(_*a*.083,re-.025,-l*.527,.037,.19,.02,b)}else if(v)z(0,re-.1,-l*.501,a*.26,.087,.024,I);else{z(0,re-.04,-l*.501,a*.23,.065,.018,I);for(let _=-2;_<=2;_++)H(0,re-.04+_*.021,-l*.524,a*.4,.009,.018,b)}if(H(0,.42,l*.496,.37,.087,.018,S("#d4d7ce")),H(0,.35,l*.46,a*.75,.065,.15,I),v&&!g){for(const _ of[-1,1])z(_*a*.32,.36,l*.5,.055,.046,.024,b),H(_*a*.3,re+_e+.14,l*.36,.04,.16,.07,I);H(0,re+_e+.23,l*.36,a*.85,.037,.18,R)}if(s.design==="suv"||d)for(const _ of[-1,1])Z([_*$*.85,c,-.4],[_*$*.85,c,1.3],.025,I);if(w&&Z([-a*.29,re+_e*.58,-l*.5],[a*.29,re+_e*.58,-l*.5],.008,O),h){H(0,.68,1.85,a*.86,.08,1.5,I);for(const _ of[-1,1])H(_*a*.46,1.04,1.85,.12,.49,1.5,R),H(_*a*.46,1.3,1.85,.14,.035,1.5,I);H(0,1.03,l*.47,a*.9,.5,.08,R),H(0,1.12,l*.486,.22,.04,.025,b);for(let _=-4;_<=4;_++)H(_*.15,.731,1.87,.022,.016,1.4,b)}if(u){for(const _ of[-1,1])H(_*a*.435,1.58,1.04,.065,1.15,2.23,R),H(_*a*.472,1.35,.62,.02,.05,.21,I),Z([_*a*.477,1.1,-.1],[_*a*.477,1.1,2.1],.009,b);H(0,1.55,l*.443,a*.82,1.27,.07,R),Z([0,.94,l*.46],[0,2.13,l*.46],.008,I)}if(m){H(0,re+_e+.037,-1.39,a*.34,.046,.94,I),H(0,re+_e+.092,-1.34,a*.24,.075,.25,R);for(const _ of[-1,1])for(let N=0;N<2;N++){const k=J(new gn(.075,.075,.028,20),O,_*(a*.28+N*.15),re+.1,-l*.5);k.rotation.x=Math.PI/2}}if(x){for(const _ of[-1,1])z(_*a*.46,.61,.52,.052,.14,.32,I),Z([_*a*.48,.41,-.9],[_*a*.49,.4,.95],.035,I);H(0,.66,1.3,a*.54,.028,.55,I);for(let _=0;_<7;_++)H(0,.689,1.1+_*.07,a*.52,.014,.023,b)}if(g){for(const _ of[-1,1]){const N=J(new mn(.14,.025,8,20,Math.PI),b,_*.38,.98,.55);N.rotation.z=0}H(0,.86,.9,a*.78,.07,.6,R)}if(s.design==="taxi"){H(0,c+.085,.16,.57,.15,.22,O);for(const _ of[-1,1])for(let N=0;N<12;N++)H(_*a*.487,.69,-.55+N*.12,.008,.058,.06,N%2?I:O)}if(M){for(const _ of[-1,1]){H(_*a*.484,.77,.08,.016,.14,1.3,I);for(let N=0;N<5;N++)H(_*a*.497,.8,-.48+N*.23,.016,.055,.12,O);Z([_*a*.24,.42,-l*.52],[_*a*.24,.8,-l*.52],.033,I)}Z([-a*.36,.6,-l*.53],[a*.36,.6,-l*.53],.034,I),Z([a*.32,c,1.05],[a*.32,c+.35,1.05],.007,I),H(.25,.85,-.73,.21,.14,.02,O)}for(const _ of[-1,1])Z([_*a*.4,re+_e*.91,-l*.38],[_*a*.39,re+_e*.94,-1.06],.004,I),Z([_*a*.4,re+_e*.91,l*.34],[_*a*.36,re+_e*.93,l*.45],.004,I),Z([_*.13,Q+.035,Ve-.018],[_*.52,Q+.065,Ve+.03],.008,I),H(_*a*.489,re+.08,l*.33,.008,.12,.15,I),H(_*a*.494,re+.08,l*.33,.009,.1,.13,R);for(const _ of[-1,1])for(const N of[-ze,ze]){const k=new at;k.position.set(_*a*.476,me,N),e.add(k),N<0&&r.push(k);const X=new at;k.add(X),i.push(X);const G=J(new mn(me*.79,me*.21,t?7:12,t?24:40),T,0,0,0,X);G.rotation.y=Math.PI/2,G.scale.z=.22/(me*.42);const ge=J(new Eo(me*.61,me*.77,t?16:32),b,_*.105,0,0,X);ge.rotation.y=_*Math.PI/2,ge.material.side=Ct;const ce=J(new Ui(me*.58,t?16:32),S("#51585b",.8,.47),_*.103,0,0,X);ce.rotation.y=_*Math.PI/2;const xe=x?10:m?5:p?12:y?6:w?5:8;for(let we=0;we<xe;we++){const ue=we/xe*Math.PI*2;Z([_*.115,Math.sin(ue)*me*.12,Math.cos(ue)*me*.12],[_*.115,Math.sin(ue+.12)*me*.69,Math.cos(ue+.12)*me*.69],w?.023:.016,b,X)}z(_*.125,0,0,.015,.055,.055,b,X),H(_*.072,.025,-me*.43,.045,.11,.075,V,k)}if(M){H(0,c+.025,.25,.95,.055,.24,I);for(const _ of[-1,1])o.push(H(_*.27,c+.086,.25,.36,.075,.22,new st({color:_<0?"#447cee":"#ef3e37",emissive:_<0?"#447cee":"#ef3e37",emissiveIntensity:1})))}}const zv=new sn(1,1,1);new P(0,1,0);function Bv(s,{lowDetail:e=!1}={}){const t=Lt(s),n=new at,i=[],r=[],o=[],a=[],l=(y,v=.1,w=.5)=>new st({color:y,metalness:v,roughness:w}),c=new kt({color:t.color,metalness:.58,roughness:.26,clearcoat:1}),h=l("#1d2931",.5,.38),u=l("#161b21",0,.94);l("#9aaab2",.85,.28),new kt({color:"#376172",metalness:.1,roughness:.15,transparent:!0,opacity:.44,depthWrite:!1}),l("#24383f",.5,.3);const d=y=>new st({color:y,emissive:y,emissiveIntensity:.8});d(t.accent),d("#eb4b49");const f=(y,v,w,S=n)=>{const R=new Fe(y,v);return R.position.set(...w),S.add(R),R},g=(y,v,w,S=n)=>{const R=f(zv,w,y,S);return R.scale.set(...v),R},x=(y,v,w,S=n)=>{const R=f(new _n(1,e?10:20,e?7:12),w,y,S);return R.scale.set(...v),R};if(t.kind==="bike"?Nv({d:t,group:n,wheels:i,front:r,lowDetail:e}):Ov({d:t,group:n,lowDetail:e,doors:o,wheels:i,front:r,lights:a}),e){const y=new Fe(new Ui(1,16),new Xt({color:"#142228",transparent:!0,opacity:.22,depthWrite:!1}));y.rotation.x=-Math.PI/2,y.scale.set(t.width*.7,t.length*.48,1),y.position.y=.012,y.renderOrder=-10,y.userData.groundShadow=!0,n.add(y)}const m=[];for(let y=0;y<3;y++){const v=x([0,1,-t.length*.27],[.15,.16,.15],new Xt({color:"#68696a",transparent:!0,opacity:0,depthWrite:!1}));v.userData.smoke=!0,m.push(v)}if(!e){const y=new Map;n.updateMatrixWorld(!0);for(const v of[...n.children]){if(!v.isMesh||v.userData.smoke||v.userData.groundShadow||a.includes(v)||Array.isArray(v.material))continue;let w=v.geometry.clone().applyMatrix4(v.matrix);w.index&&(w=w.toNonIndexed()),v.material.map||w.deleteAttribute("uv");const S=v.material.uuid;y.has(S)||y.set(S,{material:v.material,parts:[]}),y.get(S).parts.push(w),n.remove(v)}for(const{material:v,parts:w}of y.values()){const S=Mx(w,!1);S&&(S.setIndex(Array.from({length:S.attributes.position.count},(R,I)=>I)),n.add(new Fe(S,v)));for(const R of w)R.dispose()}}const p=[...n.children],M=new at;if(n.add(M),t.kind==="car"){x([0,.64,0],[t.width*.51,.37,t.length*.5],c,M),x([0,t.height*.73,.2],[t.width*.4,t.height*.3,t.length*.27],h,M);for(const y of[-1,1])for(const v of[-t.wheelbase/2,t.wheelbase/2])x([y*t.width*.47,.33,v],[.13,.33,.33],u,M)}else g([0,.64,0],[.45,.48,1.55],c,M),g([0,.29,0],[.21,.44,2.1],u,M);return M.visible=!1,n.traverse(y=>{y.isMesh&&(y.castShadow=!0,y.receiveShadow=!0,y.userData.dynamic=!0)}),{group:n,wheels:i,front:r,doors:o,lights:a,def:t,lod(y){const v=y>(t.kind==="car"?e?55:190:e?45:90);M.visible=v;for(const w of p)w.visible=!v},update(y,v=0){const w=y.damage||0;for(let S=0;S<m.length;S++){const R=m[S],I=(v*.65+S/3)%1;R.visible=!M.visible&&w>.55,R.position.y=.9+I*1.5,R.position.x=Math.sin(v+S)*.12,R.scale.setScalar(.12+I*.4),R.material.opacity=(1-I)*Math.min(.4,w*.42)}n.userData.damage!==w&&(n.userData.damage=w,n.traverse(S=>{var R,I;S.isMesh&&((R=S.material)!=null&&R.isMeshPhysicalMaterial)&&!S.material.transparent&&((I=S.userData).baseColor??(I.baseColor=S.material.color.clone()),S.material.color.copy(S.userData.baseColor).multiplyScalar(1-w*.28))})),n.position.set(y.x,0,y.z),n.rotation.set(0,-y.heading,t.kind==="bike"?-(y.steering||0)*Math.min(.43,Math.abs(y.speed||0)*.015):-(y.steering||0)*Math.min(.027,Math.abs(y.speed||0)*.001)),n.position.y=Ri(y.x,y.z)+Math.sin(v*12)*(Math.min(Math.abs(y.speed||0),30)/30)*.009;for(const S of i)S.rotation.x=-(y.distance||0)/.33;for(const S of r)S.rotation.y=-(y.steering||0)*.32;for(const S of o)S.group.rotation.y=S.side<0?(y.door||0)*1.08:0;for(let S=0;S<a.length;S++)a[S].visible=!M.visible&&!!y.siren&&Math.floor(v*9+S)%2===0}}}function kv(){const s=[],e=new _o;function t(f,g){let x;s.push(new Promise(p=>x=p));const m=e.load(f,p=>{g==null||g(p),x()},void 0,()=>x());return m.colorSpace=Mt,m.anisotropy=8,m}const n=document.createElement("canvas");n.width=n.height=1024;const i=new Ps(n);i.colorSpace=Mt,i.anisotropy=8;const r=t("/assets/coastal-facades-atlas.webp");t("/assets/coastal-materials-atlas.webp",f=>{const g=n.getContext("2d"),x=f.image;g.drawImage(x,0,0,1024,1024);for(const[m,p]of[[0,16],[1,2]]){const M=m*x.width/2,y=m*512,v=512/p;for(let w=0;w<p;w++)for(let S=0;S<p;S++)g.drawImage(x,M,0,x.width/2,x.height/2,y+S*v,w*v,v,v)}i.needsUpdate=!0});const o=(f,g=.05,x=.78)=>new st({color:f,metalness:g,roughness:x}),a={facade:new st({color:"#eee8dc",map:r,roughness:.87}),glassFacade:new st({color:"#dcebf1",map:r,metalness:.38,roughness:.31,envMapIntensity:.65}),asphalt:new st({color:"#969b9a",map:i,roughness:.96}),pavement:new st({color:"#f6efe1",map:i,roughness:.91}),stone:new st({color:"#d7d0c0",roughness:.86}),ivory:o("#d6d1bf"),concrete:o("#a0a8a5"),plaster:o("#cfba9e"),brick:o("#9f7666"),roof:o("#646965"),metal:o("#6b7477",.7,.38),dark:o("#273c43",.3,.45),glass:new kt({color:"#62838a",metalness:.22,roughness:.14,transparent:!0,opacity:.79,clearcoat:1,envMapIntensity:1.2}),shopGlass:o("#263c40",.35,.18),white:o("#e1dfcf"),paint:o("#d2ccb3",0,.96),yellow:o("#c9b175",0,.96),grass:o("#626e49",0,1),soil:o("#665b49",0,1),bark:o("#6f6250"),leaf:o("#516849",0,.9),leafLight:o("#6d7b50",0,.9),copper:o("#9a8770",.7,.4),water:new kt({color:"#41818d",metalness:.35,roughness:.18,clearcoat:1,envMapIntensity:1.4}),shadow:new Xt({color:"#17222a",transparent:!0,opacity:.18,depthWrite:!1}),teal:o("#4f8a88",.2,.58),fabric:o("#6d8176",0,.9),red:o("#a75d4d")},l=document.createElement("canvas");l.width=1024,l.height=512;const c=l.getContext("2d"),h=c.createLinearGradient(0,0,0,512);h.addColorStop(0,"#608fae"),h.addColorStop(.38,"#bcd5df"),h.addColorStop(.5,"#f8dfb3"),h.addColorStop(.53,"#adad92"),h.addColorStop(1,"#454e48"),c.fillStyle=h,c.fillRect(0,0,1024,512);const u=c.createRadialGradient(775,216,2,775,216,95);u.addColorStop(0,"#fff7dd"),u.addColorStop(.07,"#fff3c9"),u.addColorStop(.16,"#f6d9a284"),u.addColorStop(1,"#f7d8a300"),c.fillStyle=u,c.fillRect(650,100,250,230);const d=new Ps(l);return d.colorSpace=Mt,d.mapping=co,{m:a,environment:d,ready:Promise.all(s)}}function Hv(s,e,t,n,i=0){const r=[],o=[],a=[],l=[],c=i%2*.5,h=i<2?.5:0,u=.0012,d=.5-2*u;for(let g=0;g<e-.001;g+=n)for(let x=0;x<s-.001;x+=t){const m=Math.min(t,s-x),p=Math.min(n,e-g),M=r.length/3,y=x-s/2,v=g-e/2;r.push(y,v,0,y+m,v,0,y+m,v+p,0,y,v+p,0),o.push(0,0,1,0,0,1,0,0,1,0,0,1),a.push(c+u,h+u,c+u+d*m/t,h+u,c+u+d*m/t,h+u+d*p/n,c+u,h+u+d*p/n),l.push(M,M+1,M+2,M,M+2,M+3)}const f=new dt;return f.setAttribute("position",new We(r,3)),f.setAttribute("normal",new We(o,3)),f.setAttribute("uv",new We(a,2)),f.setIndex(l),f}function Vv({lowDetail:s=!1}={}){const{m:e,environment:t,ready:n}=kv(),i=new If;i.background=new Ye("#c9dae0"),i.fog=new Uc("#c9d5d5",180,620);const r=new sn(1,1,1),o=new _n(1,s?12:20,s?8:14),a=new gn(1,1,1,8),l=new P(0,1,0),c=[],h=[],u=[],d=A=>new st({color:A,emissive:A,emissiveIntensity:.4,roughness:.45}),f=d("#f7dfb0"),g=d("#96cec5"),x=d("#ffcd7d"),m=d("#71c68e"),p=d("#d76347");function M(A,j,Y,E,$,Q,se,ie=i,be=!1){const oe=new Fe(r,se);return oe.position.set(A,j,Y),oe.scale.set(E,$,Q),oe.castShadow=$>.3,oe.receiveShadow=!0,oe.userData.detail=be,ie.add(oe),oe}function y(A,j,Y,E,$,Q,se,ie=i){const be=new Fe(o,se);return be.position.set(A,j,Y),be.scale.set(E,$,Q),be.castShadow=!0,ie.add(be),be}function v(A,j,Y,E,$=i,Q=!0){const se=new P(...A),ie=new P(...j),be=ie.clone().sub(se),oe=new Fe(a,E);return oe.position.copy(se.add(ie).multiplyScalar(.5)),oe.scale.set(Y,be.length(),Y),oe.quaternion.setFromUnitVectors(l,be.normalize()),oe.castShadow=!0,oe.userData.detail=Q,$.add(oe),oe}function w(A,j,Y,E,$,Q,se,ie,be=14,oe=16){const de=new Fe(Hv(E,$,be,oe,se),ie);return de.position.set(A,j,Y),de.rotation.y=Q,de.receiveShadow=!0,de.userData.surface=!0,i.add(de),de}function S(A,j,Y,E,$,Q,se=.15,ie=8,be=-20){const oe=w(A,se,j,Y,E,0,$,Q,ie,ie);return oe.rotation.x=-Math.PI/2,oe.renderOrder=be,oe}function R(A,j,Y,E,$,Q=1,se="#e8e6d3",ie="#294048",be=0){const oe=document.createElement("canvas");oe.width=512,oe.height=128;const de=oe.getContext("2d");de.fillStyle=ie,de.fillRect(0,0,512,128),de.fillStyle=se,de.textAlign="center",de.textBaseline="middle",de.font="600 62px Arial";const Ve=de.measureText(A).width;Ve>466&&(de.font="600 "+Math.floor(62*466/Ve)+"px Arial"),de.fillText(A,256,66);const Je=new Ps(oe);Je.colorSpace=Mt;const D=new Fe(new es($,Q),new st({map:Je,roughness:.8,side:Ct}));return D.position.set(j,Y,E),D.rotation.y=be,D.userData.detail=!0,i.add(D),D}M(0,-.18,0,760,.3,760,e.concrete).renderOrder=-40;for(let A=-3;A<=3;A++){S(A*100,0,22,690,0,e.asphalt,.005,s?16:10,-35);for(let j=-3;j<3;j++)S(j*100+50,A*100,78,22,0,e.asphalt,.007,s?16:10,-35);for(let j=-337;j<340;j+=9)if(!(Math.abs(j-Math.round(j/100)*100)<18))for(const E of[-1,1])M(A*100+E*.14,.025,j,.1,.018,8,e.yellow,i,!0),M(j,.025,A*100+E*.14,8,.018,.1,e.yellow,i,!0),M(A*100+E*3.25,.027,j,.1,.018,3,e.paint,i,!0),M(j,.027,A*100+E*3.25,3,.018,.1,e.paint,i,!0),M(A*100+E*7.55,.027,j,.1,.018,8,e.paint,i,!0),M(j,.027,A*100+E*7.55,8,.018,.1,e.paint,i,!0)}for(let A=-3;A<3;A++)for(let j=-3;j<3;j++){const Y=A*100+50,E=j*100+50;M(Y,.035,E,78,.22,78,e.concrete).renderOrder=-30,S(Y,E,78,78,1,e.pavement,.15,8,-25);for(const $ of[-1,1])M(Y,.19,E+$*38.9,77,.22,.23,e.stone),M(Y+$*38.9,.19,E,.23,.22,77,e.stone),M(Y,.019,E+$*39.25,77,.024,.25,e.dark,i,!0),M(Y+$*39.25,.019,E,.25,.024,77,e.dark,i,!0)}const I=["MARÉ COFFEE","SOUTH COAST","STUDIO 07","NORI MARKET","ATELIER","LUMA HOTEL","ORBIT AUDIO","PALM HOUSE"];function T(A,j,Y,E,$,Q,se,ie){const be=ie==="glass"?1:ie==="brick"?2:ie==="limestone"?3:0,oe=ie==="glass"?e.glassFacade:e.facade,de=14,Ve=ie==="glass"?25.6:ie==="brick"||ie==="limestone"?12.8:16;M(j,Q+se/2,Y,E,se,$,ie==="glass"?e.dark:e.ivory),w(j,Q+se/2,Y+$/2+.02,E,se,0,be,oe,de,Ve),w(j,Q+se/2,Y-$/2-.02,E,se,Math.PI,be,oe,de,Ve),w(j-E/2-.02,Q+se/2,Y,$,se,-Math.PI/2,be,oe,de,Ve),w(j+E/2+.02,Q+se/2,Y,$,se,Math.PI/2,be,oe,de,Ve),M(j,Q+se+.12,Y,E+.42,.25,$+.42,e.stone),M(j,Q+se+.3,Y,E-.4,.2,$-.4,e.roof)}function b(A,j){const Y=j==="z"?A.w:A.d,E=A.x,$=A.z,Q=j==="z"?(A.z%100+100)%100<50?-1:1:(A.x%100+100)%100<50?-1:1,se=(de,Ve,Je=0)=>j==="z"?[E+de,Ve,$+Q*(A.d/2+Je)]:[E+Q*(A.w/2+Je),Ve,$+de],ie=(de,Ve,Je,D,_,N,k,X=!0)=>{const G=se(de,Ve,Je);return M(G[0],G[1],G[2],j==="z"?D:N,_,j==="z"?N:D,k,i,X)};ie(0,1.82,.06,Y-.8,3.3,.1,e.shopGlass,!1);for(let de=-Y/2+1.7;de<Y/2;de+=4.1)ie(de,1.85,.18,.12,3.35,.2,e.stone),ie(de+.35,1.3,.23,.045,.6,.07,e.metal);if(ie(0,.27,.2,Y,.24,.32,e.stone),ie(0,3.58,.2,Y+.4,.24,.5,e.stone),A.id%2===0){ie(0,3.35,.85,Y*.82,.15,1.7,A.id%4===0?e.fabric:e.ivory);for(const de of[-Y*.35,Y*.35])ie(de,1.7,1.4,.06,3,.06,e.metal)}const be=se(0,4.08,.19),oe=j==="z"?Q<0?Math.PI:0:Q<0?-Math.PI/2:Math.PI/2;R(I[A.id%I.length],be[0],be[1],be[2],Math.min(10,Y*.55),.65,"#e8e0c9",A.style==="brick"?"#485851":"#39494b",oe)}for(const A of vr){if(M(A.x,4.7/2+.16,A.z,A.w,4.7,A.d,e.stone),c.push(A),A.style==="glass"){const E=A.id%3===0,$=E?A.h*.5:A.h-4.7;T(A,A.x,A.z,A.w-.35,A.d-.35,.16+4.7,$,A.style),E&&T(A,A.x+A.w*.1,A.z-A.d*.04,A.w*.67,A.d*.76,.16+4.7+$,A.h-4.7-$,A.style);for(const Q of[-1,1])for(let se=-1;se<=1;se++)M(A.x+se*A.w*.28,.16+A.h*.5,A.z+Q*(A.d/2+.12),.16,A.h,.2,e.metal,i,!0);A.id%4===0&&(M(A.x,A.h+1.6,A.z,A.w*.4,2.5,A.d*.35,e.dark),v([A.x,A.h+2,A.z],[A.x,A.h+9,A.z],.045,e.metal,i,!1))}else{const E=A.style==="terrace"?A.h*.62:A.h-4.7;T(A,A.x,A.z,A.w,A.d,.16+4.7,E,A.style),A.style==="terrace"&&T(A,A.x,A.z,A.w*.8,A.d*.72,.16+4.7+E,A.h-4.7-E,A.style);for(let $=4.7+3.2;$<A.h;$+=3.2)A.style==="limestone"&&Math.round($)%2||M(A.x,$,A.z,A.w+.4,.13,A.d+.4,e.stone,i,!0);if(A.id%3===0||A.style==="terrace")for(let $=6.6;$<Math.min(A.h,23);$+=3.2)for(const Q of[-1,1]){const se=A.x+Q*A.w*.24,ie=A.z-A.d/2-.65;M(se,$,ie,4.3,.16,1.6,e.stone,i,!0),M(se,$+.56,ie-.76,4.25,1,.045,e.glass,i,!0);for(const be of[-1,1])M(se+be*2.1,$+.56,ie,.05,1,1.5,e.metal,i,!0)}for(const $ of[-1,1])M(A.x+$*A.w*.27,A.h+.65,A.z,2.5,1.1,2,e.concrete,i,!0),M(A.x+$*A.w*.27,A.h+1.2,A.z,2.6,.1,2.1,e.dark,i,!0)}if(b(A,"z"),b(A,"x"),A.id%5===0)for(let E=0;E<3;E++){const $=M(A.x-4+E*4,A.h+.7,A.z+4,3.3,.07,2,e.glass,i,!0);$.rotation.x=-.23}if(s){const E=new dt,$=Math.min(40,A.h*.45),Q=Math.min(30,A.h*.32),se=A.x,ie=A.z,be=A.w/2,oe=A.d/2;E.setAttribute("position",new We([se-be,.155,ie-oe,se+be,.155,ie-oe,se+be+$,.155,ie+oe+Q,se-be+$,.155,ie+oe+Q],3)),E.setIndex([0,2,1,0,3,2]),E.computeVertexNormals();const de=new Fe(E,e.shadow);de.material.side=Ct,de.renderOrder=-12,de.userData.groundShadow=!0,i.add(de)}}const U=new dt,V=[],F=[];let O=0;for(let A=0;A<9;A++){const j=A/9*Math.PI*2,Y=new P(Math.sin(j),0,Math.cos(j)),E=new P(Math.cos(j),0,-Math.sin(j)),$=2.9+fn(A+41)*.8;for(let Q=1;Q<13;Q++){const se=Q/13,ie=Y.clone().multiplyScalar($*se);ie.y=Math.sin(se*Math.PI)*.45-se*se*1.05;for(const be of[-1,1]){const oe=ie.clone().addScaledVector(E,be*(1-se)*.85).addScaledVector(Y,.38);oe.y-=.16;const de=ie.clone().addScaledVector(Y,.23);V.push(ie.x,ie.y,ie.z,oe.x,oe.y,oe.z,de.x,de.y,de.z),F.push(O,O+1,O+2),O+=3}}}U.setAttribute("position",new We(V,3)),U.setIndex(F),U.computeVertexNormals(),e.leaf.side=Ct,e.leafLight.side=Ct;const W=new Ls([new P(0,0,0),new P(.08,2,0),new P(.3,5,-.07),new P(.63,8.2,.1)]),J=new Fs(W,9,.125,7,!1);function H(A,j,Y=9){const E=new at;E.position.set(A,.16,j),E.scale.setScalar(Y/8.2);const $=new Fe(J,e.bark);$.castShadow=!0,E.add($);const Q=new Fe(U,e.leaf);Q.position.set(.63,8.2,.1),Q.rotation.y=fn(A+j)*6,Q.castShadow=!0,E.add(Q),E.userData.palm=!0,E.userData.baseAngle=Q.rotation.y,E.userData.leaves=Q,i.add(E),h.push(E),M(A,.29,j,1.3,.28,1.3,e.soil,i,!0)}for(let A=-2;A<=2;A++)for(let j=-270;j<=290;j+=40)if(!(Math.abs(j-Math.round(j/100)*100)<17))for(const Y of[-1,1]){const E=A*100+Y*13.7;E>10&&E<40&&j>154&&j<180||H(E,j,7.8+fn(E+j)*3.2)}for(let A=-285;A<300;A+=25)H(A,339,9+fn(A)*2);for(const[A,j]of[[50,150],[-50,-50]]){M(A,.17,j,70,.09,70,e.grass).renderOrder=-22,S(A,j,10,70,3,e.pavement,.235,8,-18),S(A,j,70,8,3,e.pavement,.236,8,-18),M(A,.28,j,19,.32,19,e.stone),M(A,.47,j,16,.1,16,e.water);const Y=new Fe(new mn(3.6,.16,8,48),e.copper);Y.position.set(A,5,j),Y.rotation.y=.45,Y.castShadow=!0,i.add(Y),M(A,2,j,.55,4,.55,e.copper);for(let E=0;E<8;E++){const $=E/8*Math.PI*2,Q=A+Math.cos($)*27,se=j+Math.sin($)*27;if(Q<40&&se>153&&se<178)continue;const ie=new at;ie.position.set(Q,.15,se),v([0,0,0],[.2,3.9,.1],.2,e.bark,ie,!1);for(let be=0;be<5;be++){const oe=be*2.4;y(Math.sin(oe)*1.3,4.4+fn(E+be)*1.1,Math.cos(oe)*1.3,1.7,1.7,1.7,be%2?e.leaf:e.leafLight,ie)}i.add(ie)}}for(let A=0;A<48;A++){const j=(A%6-3)*100+13.3,Y=-265+Math.floor(A/6)*72;if(v([j,.2,Y],[j,6.5,Y],.065,e.metal),v([j,6.5,Y],[j-2,6.5,Y],.06,e.metal),M(j-2,6.5,Y,1.2,.09,.27,e.ivory,i,!0),M(j+1.2,.52,Y,.42,.9,.45,e.dark,i,!0),A%2===0){const E=j+1.4,$=Y+4;for(let Q=0;Q<4;Q++)M(E,.5,$+Q*.12,1.9,.06,.08,e.copper,i,!0);M(E,.8,$+.42,1.9,.4,.06,e.copper,i,!0);for(const Q of[-1,1])M(E+Q*.72,.28,$+.17,.07,.48,.42,e.metal,i,!0)}if(A%8===0){M(j+1.6,2.9,Y-6,3.6,.13,4.6,e.ivory);for(const E of[-1,1])v([j+3,.2,Y-6+E*2],[j+3,2.9,Y-6+E*2],.06,e.metal);M(j+3,1.6,Y-6,.045,2.4,4.2,e.glass),R("CITYLINK",j+1.5,2.6,Y-3.66,2.7,.38)}}for(let A=-2;A<=2;A++)for(let j=-2;j<=2;j++){const Y=A*100,E=j*100;for(const $ of[-1,1]){for(let be=-6;be<=6;be++)M(Y+be*1.48,.033,E+$*13.5,.75,.018,3.2,e.paint,i,!0),M(Y+$*13.5,.034,E+be*1.48,3.2,.018,.75,e.paint,i,!0);M(Y-$*5.2,.033,E+$*18.2,8.2,.018,.25,e.paint,i,!0),M(Y+$*18.2,.033,E+$*5.2,.25,.018,8.2,e.paint,i,!0);const Q=Y+$*12.5,se=E+$*16.5;v([Q,.2,se],[Q,5.8,se],.075,e.metal),M(Q,5.45,se,.32,.96,.22,e.dark);const ie=y(Q,5.6,se+.13,.085,.085,.035,m);ie.userData.axis=$>0?"z":"x",u.push(ie)}R(A<0?"OLD QUARTER":j>0?"HARBOR DRIVE":"ZENITH AVENUE",Y-12.6,3.15,E-13,3.3,.34,"#e1e6df","#50645c")}M(25,.19,166,24,.15,12,e.concrete).renderOrder=-18,S(25,166,24,12,1,e.pavement,.267,6,-16),M(25,3.8,162,26,.24,8,e.ivory),M(25,1.9,159,24,3.8,.16,e.dark);for(const A of[13,37])v([A,.2,162],[A,3.8,162],.09,e.metal);for(let A=0;A<3;A++){const j=17+A*8;M(j,1.6,159.12,6.5,3,.045,e.metal);for(let Y=.3;Y<3.1;Y+=.18)M(j,Y,159.16,6.4,.023,.035,e.dark,i,!0);M(j,3.45,159.16,6.6,.1,.04,f)}R("GRAND CITY MOTORWORKS",25,4.03,166.02,12,.7,"#e8e4cc","#263c43");for(let A=0;A<5;A++){const j=18+A*3.4;M(j,.29,166,2.6,.08,3.9,e.dark).renderOrder=-14,M(j,.338,167.9,2.6,.008,.035,g),R(String(A+1).padStart(2,"0"),j,.62,168.18,.35,.18,"#f2eedf","#3f555a")}M(0,-1.1,357,740,2.2,2,e.stone),S(0,346,710,18,3,e.pavement,.15,8,-22);const z=M(0,-.78,1050,2500,.08,1400,e.water);z.renderOrder=-38;for(let A=-337;A<340;A+=7)v([A,.2,355],[A,1.25,355],.035,e.metal,i,!0),v([A,1.25,355],[A+7,1.25,355],.035,e.metal,i,!0);for(let A=0;A<4;A++){const j=150+A*30;M(j,-.25,375,3,.6,37,e.copper);for(const Y of[-1,1]){const E=new at;E.position.set(j+Y*5,-.2,378+fn(A)*10),E.rotation.y=.08*Y;const $=new Fe(new _n(1,16,8),e.ivory);$.scale.set(1.5,.5,4.3),E.add($),M(0,.6,.5,2,1,2.7,e.dark,E),M(0,1.2,.6,2.1,.1,2.8,e.ivory,E),i.add(E)}}const Z=new es(1800,700,40,16);Z.rotateX(-Math.PI/2);const le=Z.attributes.position;for(let A=0;A<le.count;A++){const j=le.getX(A),Y=le.getZ(A);le.setY(A,20+Math.sin(j*.006)*25+Math.cos(Y*.012+j*.003)*22+Math.max(0,Math.sin(j*.012))*26)}Z.computeVertexNormals();const re=new Fe(Z,new st({color:"#829182",roughness:1}));re.position.set(0,-15,-790),re.userData.distant=!0,i.add(re),M(-318,10,0,5.4,.65,690,e.stone);for(let A=-300;A<=300;A+=60)M(-318,5,A,.95,10,1.2,e.concrete);const _e=new at;_e.position.set(-318,12,0);for(let A=-1;A<=1;A++){M(0,0,A*17,2.8,2,16,e.ivory,_e),M(0,1,A*17,2.8,.13,16.2,e.metal,_e);for(const j of[-1,1]){M(j*1.41,.22,A*17,.025,.87,14,e.shopGlass,_e);for(let Y=-3;Y<=3;Y++)M(j*1.44,.2,A*17+Y*2,.035,1.8,.1,e.ivory,_e)}M(0,-.7,A*17,2.83,.12,16,e.teal,_e)}i.add(_e),i.add(new gp("#dceaf1","#8f856e",1.45));const me=new xu("#ffe3b6",3.2);me.position.set(-65,95,45),me.castShadow=!s,me.shadow.mapSize.set(2048,2048),Object.assign(me.shadow.camera,{left:-58,right:58,top:58,bottom:-58,near:.1,far:240}),me.shadow.bias=-25e-5,me.shadow.normalBias=.035,me.shadow.radius=3,i.add(me,me.target);const ze=xo({lowDetail:s,hero:!1,variant:1});i.add(ze.group);const ke=[];for(let A=0;A<(s?30:52);A++){const j=Av(A<14?0:A%5-2,A<14?1:Math.floor(A/5)%5-2,A%2?1:-1),Y=xo({color:["#667c97","#b7a48e","#835a51","#bec9ce","#526753","#343e50"][A%6],skin:["#ae795a","#d5ac87","#795b43"][A%3],lowDetail:!0,variant:A%6,civilian:s?A===12:A%4===1||A===12}),E=A%4;Object.assign(Y,{route:j,routeIndex:(E+1)%4,x:j[E].x,z:j[E].z,heading:0,speed:1.08+fn(A+111)*.5,phase:A,activity:A%7===0?"jog":A%5===0?"browse":"walk"}),A<10&&(Y.x=A%2?-11.55:11.55,Y.z=135+A*5,Y.route=A%2?[{x:-11.55,z:188.45},{x:-88.45,z:188.45},{x:-88.45,z:111.55},{x:-11.55,z:111.55}]:[{x:11.55,z:188.45},{x:88.45,z:188.45},{x:88.45,z:111.55},{x:11.55,z:111.55}],Y.routeIndex=0),(A===10||A===11)&&(Y.x=18+(A-10)*1.4,Y.z=178.5,Y.route=null,Y.activity="talk",Y.heading=A===10?Math.PI/2:-Math.PI/2),A===12&&(Y.x=12.8,Y.z=178,Y.route=null,Y.activity="phone",Y.heading=-.5),A===13&&(Y.x=39,Y.z=172,Y.route=null,Y.activity="look",Y.heading=-Math.PI/2),(A===14||A===15)&&(Y.x=A===14?-11.55:11.55,Y.z=186,Y.route=[{x:-11.55,z:186},{x:11.55,z:186}],Y.routeIndex=A===14?1:0,Y.activity="walk"),i.add(Y.group),ke.push(Y)}const te=new at,ae=new Fe(new mn(5,.06,6,40),x);ae.rotation.x=Math.PI/2,ae.position.y=.12,te.add(ae);const ye=new Fe(new So(.75),x);ye.position.y=5,te.add(ye);const Ie=new Fe(new gn(.045,.045,45,6),new Xt({color:"#ffd280",transparent:!0,opacity:.22}));if(Ie.position.y=23,Ie.userData.detail=!0,te.add(Ie),te.visible=!1,i.add(te),!s){const A=new Map;i.traverse(Y=>{if(Y.isMesh&&Y.geometry===r&&Y.parent===i){const E=Y.material.uuid;A.has(E)||A.set(E,[]),A.get(E).push(Y)}});for(const Y of A.values()){const E=new au(r,Y[0].material,Y.length);Y.forEach(($,Q)=>{$.updateMatrix(),E.setMatrixAt(Q,$.matrix),i.remove($)}),E.instanceMatrix.needsUpdate=!0,E.castShadow=Y.some($=>$.castShadow),E.receiveShadow=!0,E.computeBoundingSphere(),i.add(E)}const j=new Map;i.traverse(Y=>{if(Y.isMesh&&Y.userData.surface){const E=Y.material.uuid+":"+Math.floor(Y.position.x/200)+":"+Math.floor(Y.position.z/200);j.has(E)||j.set(E,[]),j.get(E).push(Y)}});for(const Y of j.values()){const E=[],$=[],Q=[],se=[];let ie=0;for(const de of Y){de.updateMatrix();const Ve=de.geometry.clone().applyMatrix4(de.matrix);E.push(...Ve.attributes.position.array),$.push(...Ve.attributes.normal.array),Q.push(...Ve.attributes.uv.array);for(const Je of Ve.index.array)se.push(Je+ie);ie+=Ve.attributes.position.count,i.remove(de),de.geometry.dispose(),Ve.dispose()}const be=new dt;be.setAttribute("position",new We(E,3)),be.setAttribute("normal",new We($,3)),be.setAttribute("uv",new We(Q,2)),be.setIndex(se);const oe=new Fe(be,Y[0].material);oe.receiveShadow=!0,oe.frustumCulled=!0,i.add(oe)}}return{scene:i,player:ze,pedestrians:ke,marker:te,diamond:ye,sun:me,signals:u,signalGreen:m,signalRed:p,train:_e,colliders:c,palms:h,environment:t,ready:Promise.all([n,ze.ready]),water:e.water,makeVehicle:A=>{const j=Bv(A,{lowDetail:s});return i.add(j.group),j}}}class Gv{constructor(e){this.canvas=e,this.ctx=e.getContext("2d",{alpha:!1}),this.width=0,this.height=0,this.last=0,this.proj=new Ze,this.mv=new Ze,this.normal=new $e,this.frustum=new bo,this.tmp=new P,this.cache=new WeakMap,this.materials=new WeakMap,this.textures=new WeakMap,this.skinPoint=new P,this.skinNormal=new P}setSize(e,t){const n=Math.min(1,960/e,720/t);this.width=Math.round(e*n),this.height=Math.round(t*n),this.canvas.width=this.width,this.canvas.height=this.height,this.frame=this.ctx.createImageData(this.width,this.height),this.depth=new Float32Array(this.width*this.height),this.sky=new Uint8ClampedArray(this.frame.data.length);for(let i=0;i<this.height;i++){const r=i/this.height,o=r<.62?[132,174,197]:[219,229,223],a=r<.62?[219,229,223]:[241,223,191],l=r<.62?r/.62:(r-.62)/.38;for(let c=0;c<this.width;c++){const h=(i*this.width+c)*4;for(let u=0;u<3;u++)this.sky[h+u]=o[u]+(a[u]-o[u])*l;this.sky[h+3]=255}}}render(e,t){const n=this.ctx,i=this.width,r=this.height;e.updateMatrixWorld(),t.updateMatrixWorld(),this.proj.multiplyMatrices(t.projectionMatrix,t.matrixWorldInverse),this.frustum.setFromProjectionMatrix(this.proj),this.frame.data.set(this.sky),this.depth.fill(0);const o=[],a=new P(-.5,.9,.2).normalize().transformDirection(t.matrixWorldInverse),l=t.projectionMatrix.elements,c=h=>[(l[0]*h[0]/-h[2]+1)*i*.5,(1-l[5]*h[1]/-h[2])*r*.5];e.traverseVisible(h=>{var I,T,b,U,V,F,O,W,J,H;if(!h.isMesh||!((T=(I=h.geometry)==null?void 0:I.attributes)!=null&&T.position)||Array.isArray(h.material))return;h.getWorldPosition(this.tmp);const u=this.tmp.distanceTo(t.position);if(h.userData.detail&&u>65||!this.frustum.intersectsObject(h))return;const d=(((b=h.geometry.boundingSphere)==null?void 0:b.radius)||0)*h.matrixWorld.getMaxScaleOnAxis();if(u-d>(h.userData.distant?1200:350)&&h.renderOrder>=0)return;const f=h.geometry,g=f.attributes.position.array,x=(U=f.attributes.normal)==null?void 0:U.array,m=(V=f.index)==null?void 0:V.array,p=(F=f.attributes.uv)==null?void 0:F.array;if(!m||!x)return;h.isSkinnedMesh&&h.skeleton.update(),this.mv.multiplyMatrices(t.matrixWorldInverse,h.matrixWorld),this.normal.getNormalMatrix(this.mv);const M=this.mv.elements,y=this.normal.elements;let v=this.cache.get(f);v||(v=new Float32Array(g.length*2),this.cache.set(f,v));for(let z=0;z<g.length;z+=3){let Z=g[z],le=g[z+1],re=g[z+2],_e=x[z],me=x[z+1],ze=x[z+2];const ke=z*2;h.isSkinnedMesh&&(this.skinPoint.set(Z,le,re),h.applyBoneTransform(z/3,this.skinPoint),this.skinNormal.set(Z+_e,le+me,re+ze),h.applyBoneTransform(z/3,this.skinNormal),this.skinNormal.sub(this.skinPoint).normalize(),Z=this.skinPoint.x,le=this.skinPoint.y,re=this.skinPoint.z,_e=this.skinNormal.x,me=this.skinNormal.y,ze=this.skinNormal.z),v[ke]=M[0]*Z+M[4]*le+M[8]*re+M[12],v[ke+1]=M[1]*Z+M[5]*le+M[9]*re+M[13],v[ke+2]=M[2]*Z+M[6]*le+M[10]*re+M[14];let te=y[0]*_e+y[3]*me+y[6]*ze,ae=y[1]*_e+y[4]*me+y[7]*ze,ye=y[2]*_e+y[5]*me+y[8]*ze,Ie=Math.hypot(te,ae,ye)||1;v[ke+3]=te/Ie,v[ke+4]=ae/Ie,v[ke+5]=ye/Ie}const w=h.material;let S=this.materials.get(w);const R=(O=w.color)==null?void 0:O.getHex();if(!S||S.key!==R){const z=(w.color||new Ye("#ffffff")).clone().convertLinearToSRGB();S={key:R,base:[z.r*255,z.g*255,z.b*255],glow:!!((W=w.emissive)!=null&&W.getHex())},this.materials.set(w,S)}for(let z=0;z<m.length;z+=3){const Z=m[z]*6,le=m[z+1]*6,re=m[z+2]*6;if(v[Z+2]>=-.18&&v[le+2]>=-.18&&v[re+2]>=-.18)continue;let _e=[Z,le,re].map($=>[v[$],v[$+1],v[$+2],(p==null?void 0:p[$/3])||0,(p==null?void 0:p[$/3+1])||0,S.glow?1.18:.5+.5*Math.max(0,v[$+3]*a.x+v[$+4]*a.y+v[$+5]*a.z)+(w.metalness>.4?Math.pow(Math.max(0,v[$+5]*.9+v[$+4]*.38),24)*.24:0)]);if(_e.some($=>$[2]>-.18)){const $=[];for(let Q=0;Q<3;Q++){const se=_e[Q],ie=_e[(Q+1)%3],be=se[2]<=-.18,oe=ie[2]<=-.18;if(be&&$.push(se),be!==oe){const de=(-.18-se[2])/(ie[2]-se[2]);$.push([se[0]+de*(ie[0]-se[0]),se[1]+de*(ie[1]-se[1]),-.18,se[3]+de*(ie[3]-se[3]),se[4]+de*(ie[4]-se[4]),se[5]+de*(ie[5]-se[5])])}}if(_e=$,_e.length<3)continue}const me=_e.map(c);if((me[1][0]-me[0][0])*(me[2][1]-me[0][1])-(me[1][1]-me[0][1])*(me[2][0]-me[0][0])>=0&&w.side!==Ct||me.every($=>$[0]<0)||me.every($=>$[0]>i)||me.every($=>$[1]<0)||me.every($=>$[1]>r))continue;let ke=(v[Z+3]+v[le+3]+v[re+3])/3,te=(v[Z+4]+v[le+4]+v[re+4])/3,ae=(v[Z+5]+v[le+5]+v[re+5])/3;const ye=Math.hypot(ke,te,ae)||1;ke/=ye,te/=ye,ae/=ye;const Ie=S.glow?1.18:.5+.5*Math.max(0,ke*a.x+te*a.y+ae*a.z),A=w.metalness>.5?Math.pow(Math.max(0,ae*.9+te*.38),24)*60:0,j=_e.reduce(($,Q)=>$+Q[2],0)/_e.length,Y=Math.max(0,Math.min(.92,(-j-130)/420)),E=S.base.map(($,Q)=>Math.round(Math.min(255,$*Ie+A)*(1-Y)+[201,213,213][Q]*Y));o.push({pts:me,poly:_e,tint:S.base,texture:-j<350?(J=w.map)==null?void 0:J.image:null,flipY:((H=w.map)==null?void 0:H.flipY)!==!1,shade:Ie,fog:Y,z:j,rgb:E,alpha:w.transparent?w.opacity:1})}}),o.sort((h,u)=>(h.alpha<1)-(u.alpha<1)||(h.alpha<1?h.z-u.z:u.z-h.z));for(const h of o)for(let u=1;u<h.poly.length-1;u++)this.rasterTriangle(h,[0,u,u+1]);n.putImageData(this.frame,0,0)}textureLevels(e){if(!(e!=null&&e.width))return null;let t=this.textures.get(e);if(t)return t;t=[];const n=document.createElement("canvas"),i=n.getContext("2d",{willReadFrequently:!0});let r=Math.min(1024,e.width),o=Math.round(e.height*r/e.width);for(;r>=8&&o>=8;)n.width=r,n.height=o,i.drawImage(e,0,0,r,o),t.push(i.getImageData(0,0,r,o)),r=Math.floor(r/2),o=Math.floor(o/2);return this.textures.set(e,t),t}rasterTriangle(e,t){const[n,i,r]=t.map(ye=>e.pts[ye]),[o,a,l]=t.map(ye=>e.poly[ye]),c=(i[1]-r[1])*(n[0]-r[0])+(r[0]-i[0])*(n[1]-r[1]);if(Math.abs(c)<.015)return;const h=this.width,u=this.height,d=Math.max(0,Math.floor(Math.min(n[0],i[0],r[0]))),f=Math.min(h-1,Math.ceil(Math.max(n[0],i[0],r[0]))),g=Math.max(0,Math.floor(Math.min(n[1],i[1],r[1]))),x=Math.min(u-1,Math.ceil(Math.max(n[1],i[1],r[1])));if(d>f||g>x)return;const m=(i[1]-r[1])/c,p=(r[0]-i[0])/c,M=(r[1]-n[1])/c,y=(n[0]-r[0])/c,v=-1/o[2],w=-1/a[2],S=-1/l[2],R=o[3]*v,I=a[3]*w,T=l[3]*S,b=(e.flipY?1-o[4]:o[4])*v,U=(e.flipY?1-a[4]:a[4])*w,V=(e.flipY?1-l[4]:l[4])*S;let F=null;const O=this.textureLevels(e.texture);if(O){const ye=Math.abs((a[3]-o[3])*(l[4]-o[4])-(l[3]-o[3])*(a[4]-o[4]))*O[0].width*O[0].height,Ie=Math.max(0,Math.min(O.length-1,Math.floor(Math.log2(Math.max(1,Math.sqrt(ye/Math.abs(c)))))));F=O[Ie]}const W=Math.max(o[5],a[5],l[5])-Math.min(o[5],a[5],l[5])>.012,J=o[5]*v,H=a[5]*w,z=l[5]*S,Z=this.frame.data,le=this.depth,re=e.alpha,_e=re>=.999,me=e.rgb,ze=e.fog,ke=e.tint.map(ye=>ye/255*Math.min(1,e.shade)*(1-ze));let te=((i[1]-r[1])*(d+.5-r[0])+(r[0]-i[0])*(g+.5-r[1]))/c,ae=((r[1]-n[1])*(d+.5-r[0])+(n[0]-r[0])*(g+.5-r[1]))/c;for(let ye=g;ye<=x;ye++,te+=p,ae+=y){let Ie=te,A=ae;for(let j=d;j<=f;j++,Ie+=m,A+=M){const Y=1-Ie-A;if(Ie<-1e-5||A<-1e-5||Y<-1e-5)continue;const E=Ie*v+A*w+Y*S,$=ye*h+j;if(E<le[$]-1e-7)continue;const Q=$*4,se=W?(Ie*J+A*H+Y*z)/E:e.shade;let ie=W?e.tint[0]*se*(1-ze)+201*ze:me[0],be=W?e.tint[1]*se*(1-ze)+213*ze:me[1],oe=W?e.tint[2]*se*(1-ze)+213*ze:me[2];if(F){const de=Math.max(0,Math.min(F.width-1,Math.floor((Ie*R+A*I+Y*T)/E*F.width))),Ve=Math.max(0,Math.min(F.height-1,Math.floor((Ie*b+A*U+Y*V)/E*F.height))),Je=(Ve*F.width+de)*4,D=W?se/Math.min(1,e.shade):1;ie=F.data[Je]*ke[0]*D+201*ze,be=F.data[Je+1]*ke[1]*D+213*ze,oe=F.data[Je+2]*ke[2]*D+213*ze}_e?(le[$]=E,Z[Q]=ie,Z[Q+1]=be,Z[Q+2]=oe):(Z[Q]=ie*re+Z[Q]*(1-re),Z[Q+1]=be*re+Z[Q+1]*(1-re),Z[Q+2]=oe*re+Z[Q+2]*(1-re))}}}}const fe=s=>document.querySelector(s),xn=fe("#world"),Wv=fe("#minimap"),Xv=Wv.getContext("2d");let dn,Nn=!1;const Ih=xn.getContext("webgl2",{antialias:!0,powerPreference:"high-performance"});Ih?(dn=new vx({canvas:xn,context:Ih,antialias:!0}),dn.setPixelRatio(Math.min(devicePixelRatio,1.5)),dn.outputColorSpace=Mt,dn.toneMapping=Oh,dn.toneMappingExposure=.98,dn.shadowMap.enabled=!0,dn.shadowMap.type=Uh):(Nn=!0,dn=new Gv(xn));const ft=Vv({lowDetail:Nn}),ct=new Zt(58,1,.12,1800);if(!Nn){const s=new fc(dn);ft.scene.environment=s.fromEquirectangular(ft.environment).texture,s.dispose()}let L=Pu();const Nu=Ev(L),vo=new Map;for(const s of L.vehicles)vo.set(s.uid,ft.makeVehicle(s.type));const Uu=new wv(ft,{lowDetail:Nn}),Ii=new Pv(ft,ct,vo,{lowDetail:Nn});let di=!1,fi=!1,Vn=!1,vc=!1,Rt={},ii=L.heading,Rn=0,un=.19,hi=!1,Mc=0,yc=0,Fu=0,Wt=0,Ph=0,Ma=0,ya=0,si=!1,rr="",Lh=100,ba=0,Sa=0,Ki="vanta",bc="bike",bt=null,ao=60;const Zr=new P(L.x,1.05,L.z),Bt=new P,$r=new P,St=(s,e)=>fe(s).hidden=!e,qv=()=>({forward:(Rt.w||Rt.ArrowUp?1:0)-(Rt.s||Rt.ArrowDown?1:0),steer:(Rt.d||Rt.ArrowRight?1:0)-(Rt.a||Rt.ArrowLeft?1:0),boost:Rt.Shift,walk:Rt.Alt,handbrake:Rt[" "]});function Jc(){const s=xn.clientWidth,e=xn.clientHeight;dn.setSize(s,e,!1),ct.aspect=s/e,ct.updateProjectionMatrix()}addEventListener("resize",Jc);Jc();const Ut=new Ju(s=>{const e=fe("#sound");e.textContent=s==="on"?"SOUND ON":s==="off"?"SOUND OFF":s==="unavailable"?"AUDIO UNAVAILABLE":"ENABLE SOUND",e.setAttribute("aria-label",s==="on"?"Mute sound":"Enable sound"),e.setAttribute("aria-pressed",String(s==="on")),fe("#audioStatus")&&(fe("#audioStatus").textContent=s==="on"?"Audio running":s==="off"?"Muted":"Click Test sound to enable audio")});fe("#masterVolume").value=Math.round(Ut.volume*100);fe("#volumeValue").textContent=Math.round(Ut.volume*100)+"%";fe("#musicToggle").checked=Ut.music;function Ou(){return Ut.unlock()}for(const s of["pointerdown","keydown"])document.addEventListener(s,e=>{var t,n,i;(n=(t=e.target)==null?void 0:t.closest)!=null&&n.call(t,"#sound")||Ut.enabled&&((i=Ut.ctx)==null?void 0:i.state)!=="running"&&Ou()},{capture:!0});document.addEventListener("click",s=>{s.target.closest("button")&&Ut.cue("click")});addEventListener("pagehide",()=>{L.phase!=="intro"&&Ro(L),Ut.silence()});function Yv(){L.phase="playing",Rt={},St("#intro",!1),St("#hud",!0),St("#touch",matchMedia("(pointer:coarse)").matches),document.body.classList.add("playing"),Ou().then(()=>Ut.cue("mission")),mt(L,Nu?"Welcome back · Progress restored":"Morning in Grand City · Walk to any parked vehicle"),qn()}function zu(){L.phase!=="playing"||L.transition||(bt=null,_c(L)?Rn=0:mt(L,L.mode!=="foot"?"Stop to exit safely":"Approach a parked or stopped vehicle"),qn())}function Ln(){return L.phase==="playing"&&L.mode==="foot"&&!L.transition&&!!L.combat.selected}function or(s){Ru(L,s)&&(di=!1,fi=!1,Vn=!1,un=.01,bt=null,mt(L,s?Xn(s).name+" · Right mouse / F to aim":"Weapon holstered"),qn())}function Zc(){Ln()&&(Vn=!Vn,L.combat.aiming=Vn,qn())}function Bu(){if(!(L.phase!=="playing"||L.mode!=="foot"||Math.hypot(L.x-Sn.x,L.z-Sn.z)>50)){for(const s of mr)L.combat.reserve[s.id]=s.reserve;mt(L,"Ammunition replenished"),L.events.push("equip"),qn()}}function jv(){if(L.phase!=="playing"||L.mode!=="foot"||L.transition)return;const s={x:57.42,z:174},e=Kc(L,s);if(!e.length){mt(L,"Walk east of Motorworks to reach the targets");return}L.combat.aiming=!1,Vn=!1,bt={kind:"range",path:e,target:s,stuck:0},mt(L,"Heading to the target range · WASD to cancel")}function yr(){di=!1,fi=!1,Vn=!1,L.combat.aiming=!1,hi=!1}function Kv(){si=!si,mt(L,si?"First person":"Third person")}function Un(s){if(L.phase==="playing"){if(s==="garage"&&(L.mode!=="foot"||Math.hypot(L.x-Sn.x,L.z-Sn.z)>Sn.radius)){mt(L,"Visit Motorworks on foot · Green marker on your map");return}L.phase="paused",Rt={},yr(),rr=s,St("#panel",!0),St("#contracts",s==="jobs"),St("#garageContent",s==="garage"),St("#pauseActions",s==="pause"),St("#endActions",!1),fe("#closePanel").hidden=!1,fe("#panel").classList.toggle("garage-panel",s==="garage"),document.body.classList.toggle("garage-view",s==="garage"),fe("#panelLabel").textContent=s==="jobs"?"GRAND CITY NETWORK":s==="garage"?"SOUTH GATE MOTORWORKS":"CITY PAUSED",fe("#panelTitle").textContent=s==="jobs"?"Choose your next move.":s==="garage"?"Find your ride.":"Take a breath.",fe("#panelDesc").textContent=s==="jobs"?"Every contract accepts cars and bikes. Explore at your own pace.":s==="garage"?"Five bikes · Sixteen car models across the city.":"Progress is saved on this browser. Your city will be here.",s==="jobs"&&Hu(),s==="garage"&&Qc(),Ro(L)}}function Di(){L.phase==="paused"&&(L.phase="playing",Rt={},St("#panel",!1),document.body.classList.remove("garage-view"),rr="")}function ku(){Ii.reset(),Uu.reset(L),yr();const s=L.cash,e=L.completed,t=L.stats,n=L.vehicles;for(const i of L.cops)ft.scene.remove(i.model.group);L=Pu(),L.vehicles=n;for(const i of n)i.reserved=!1,i.door=0;Object.assign(L,{cash:s,completed:e,stats:t,phase:"playing"}),bt=null,ii=0,Rn=0,si=!1,St("#panel",!1),St("#intro",!1),St("#hud",!0),Rt={},mt(L,"South Gate · Vitals restored"),Ro(L),qn()}function Dh(){yr(),St("#panel",!0),St("#contracts",!1),St("#garageContent",!1),St("#pauseActions",!1),St("#endActions",!0),fe("#panel").classList.remove("garage-panel"),fe("#closePanel").hidden=!0,fe("#panelLabel").textContent=L.phase==="busted"?"DETAINED BY SECURITY":"CRITICAL DAMAGE",fe("#panelTitle").textContent=L.phase==="busted"?"Signal intercepted.":"A new beginning.",fe("#panelDesc").textContent="Your completed contracts and credits are safe. Return to South Gate.",Rt={},bt=null}function Hu(){const s=fe("#contracts");s.replaceChildren();for(const e of Ao){const t=document.createElement("article");t.className="contract"+(L.mission?" disabled":"");const n=document.createElement("div");n.innerHTML='<span class="overline">'+e.type+" · "+Math.floor(e.time/60)+":"+(e.time%60).toString().padStart(2,"0")+"</span><h3>"+e.title+"</h3><p>"+e.description+"</p>";const i=document.createElement("strong");i.textContent="₡ "+e.reward.toLocaleString();const r=document.createElement("button");r.textContent=L.mission?L.mission.id===e.id?"IN PROGRESS":"JOB ACTIVE":"TAKE CONTRACT",r.disabled=!!L.mission,r.onclick=()=>{yv(L,e.id)&&(Di(),mt(L,"Contract accepted · Follow the amber beacon"),qn())},t.append(n,i,r),s.append(t)}if(L.mission){const e=document.createElement("button");e.className="secondary",e.textContent="ABANDON CURRENT CONTRACT",e.onclick=()=>{L.mission=null,mt(L,"Contract abandoned"),Hu(),qn()},s.append(e)}}function $c(s){return L.vehicles.find(e=>e.type===s&&!e.traffic&&!e.driver)||L.vehicles.find(e=>e.type===s&&!e.traffic)}function Qc(){const s=fe("#bikeChoices");s.replaceChildren();for(const r of ai.filter(o=>o.kind===bc)){const o=document.createElement("button");o.className="bike-choice"+(Ki===r.id?" selected":""),o.setAttribute("aria-pressed",String(Ki===r.id)),o.innerHTML='<i style="background:'+r.color+'"></i><span><strong>'+r.name+"</strong><small>"+r.label+"</small></span>",o.onclick=()=>{Ki=r.id,Qc()},s.append(o)}const e=Lt(Ki);fe("#garageName").textContent=e.name,fe("#garageClass").textContent=e.label,fe("#garageStats").innerHTML=[["Top speed",Math.round(e.max*3.6)+" km/h"],["0–100 km/h",(27.78/e.accel*1.4).toFixed(1)+" s"],["Mass",e.mass+" kg"],["Handling",e.grip>1.15?"Agile":e.grip<.9?"Heavy":"Balanced"]].map(([r,o])=>"<div><span>"+r+"</span><b>"+o+"</b></div>").join("");const t=$c(e.id),n=t?Math.round(Math.hypot(t.x-L.x,t.z-L.z)):0,i=t&&n<45;fe("#selectBike").textContent=i?(e.kind==="bike"?"RIDE ":"DRIVE ")+e.name:t?"PARKED "+n+" M AWAY":"FIND IN TRAFFIC",fe("#selectBike").disabled=!i}function Jv(){const s=$c(Ki);if(!s)return;const e=ci(s,-Lt(s.type).width/2-.8,.1),t=Kc(L,e);if(Di(),!t.length){mt(L,"Path blocked · Walk to the selected bike");return}bt={vehicleId:s.uid,path:t,target:e,stuck:0},mt(L,"Approaching "+Lt(s.type).name+" · WASD to cancel")}document.querySelectorAll("[data-weapon]").forEach(s=>s.onclick=()=>or(s.dataset.weapon||null));fe("#aimWeapon").onclick=Zc;fe("#reloadWeapon").onclick=()=>Yc(L);fe("#practiceRange").onclick=jv;fe("#resupply").onclick=Bu;fe("#touchWeapon").onclick=()=>or(L.combat.selected==="sidearm"?"carbine":L.combat.selected?null:"sidearm");fe("#touchAim").onclick=Zc;for(const s of["#fireWeapon","#touchFire"]){const e=fe(s);e.onpointerdown=t=>{t.preventDefault(),e.setPointerCapture(t.pointerId),di=!0,fi=!0},e.onpointerup=e.onpointercancel=e.onlostpointercapture=()=>di=!1,e.onclick=t=>{t.detail===0&&(fi=!0)}}for(const s of document.querySelectorAll("[data-fleet]"))s.onclick=()=>{bc=s.dataset.fleet,Ki=ai.find(e=>e.kind===bc).id;for(const e of document.querySelectorAll("[data-fleet]"))e.setAttribute("aria-pressed",String(e===s));Qc()};fe("#enter").onclick=Yv;fe("#sound").onclick=()=>void Ut.setEnabled(!(Ut.enabled&&Ut.status==="on"));fe("#pause").onclick=()=>{L.phase==="paused"?Di():Un("pause")};fe("#jobs").onclick=()=>Un("jobs");fe("#garage").onclick=()=>Un("garage");fe("#touchGarage").onclick=()=>Un("garage");fe("#touchJobs").onclick=()=>Un("jobs");fe("#touchRide").onclick=zu;fe("#closePanel").onclick=Di;fe("#resume").onclick=Di;fe("#recover").onclick=ku;fe("#respawn").onclick=ku;fe("#selectBike").onclick=Jv;fe("#masterVolume").oninput=s=>{Ut.setVolume(Number(s.target.value)/100),fe("#volumeValue").textContent=s.target.value+"%"};fe("#musicToggle").onchange=s=>{Ut.music=s.target.checked,Ut.persist()};fe("#testSound").onclick=async()=>{await Ut.setEnabled(!0),Ut.cue("test")};addEventListener("keydown",s=>{if(s.target.matches("input"))return;const e=s.key.length===1?s.key.toLowerCase():s.key;["ArrowUp","ArrowDown","ArrowLeft","ArrowRight"," ","Alt"].includes(e)&&s.preventDefault(),s.repeat||(e==="1"&&or("sidearm"),e==="2"&&or("carbine"),(e==="q"||e==="0")&&or(L.combat.selected?null:L.combat.last),e==="f"&&Zc(),e==="r"&&Yc(L),e==="b"&&Bu(),e===" "&&Ln()&&(fi=!0),e==="e"&&zu(),e==="c"&&L.phase==="playing"&&Kv(),e==="g"&&(L.phase==="paused"?Di():Un("garage")),e==="m"&&(L.phase==="paused"?Di():Un("jobs")),(e==="p"||e==="Escape")&&(L.phase==="paused"?Di():Un("pause"))),Rt[e]=!0,["w","a","s","d","ArrowUp","ArrowDown","ArrowLeft","ArrowRight"].includes(e)&&(bt=null)});addEventListener("keyup",s=>Rt[s.key.length===1?s.key.toLowerCase():s.key]=!1);addEventListener("blur",()=>{Rt={},yr(),L.phase==="playing"&&Un("pause")});document.addEventListener("visibilitychange",()=>{document.hidden&&L.phase==="playing"&&Un("pause")});xn.addEventListener("contextmenu",s=>s.preventDefault());xn.addEventListener("pointerdown",s=>{xn.focus({preventScroll:!0}),Mc=s.clientX,yc=s.clientY,s.button===2&&Ln()?(L.combat.aiming=!0,hi=!0):s.button===0&&Ln()?(di=!0,fi=!0,hi=!1):hi=!0,xn.setPointerCapture(s.pointerId)});xn.addEventListener("mousedown",s=>{s.button===0&&Ln()&&(di=!0,fi=!0)});xn.addEventListener("pointermove",s=>{if(hi||Ln()&&Vn){const e=hi?s.clientX-Mc:s.movementX,t=hi?s.clientY-yc:s.movementY;Rn-=e*.004,un=Dt(un+t*.003,Ln()?-.75:.04,.75),Fu=Wt}Mc=s.clientX,yc=s.clientY});addEventListener("mouseup",s=>{s.button===0&&(di=!1),s.button===2&&(L.combat.aiming=Vn),s.buttons||(hi=!1)});xn.addEventListener("pointerup",s=>{s.button===0&&(di=!1),s.button===2&&(L.combat.aiming=Vn),hi=!1});xn.addEventListener("pointercancel",yr);document.querySelectorAll("[data-key]").forEach(s=>{s.onpointerdown=e=>{e.preventDefault(),s.setPointerCapture(e.pointerId),Rt[s.dataset.key]=!0,bt=null},s.onpointerup=s.onpointercancel=s.onlostpointercapture=()=>Rt[s.dataset.key]=!1});function Sc(){return L.z>130&&Math.abs(L.x)<90?"SOUTH GATE":vv.reduce((s,e)=>Math.hypot(L.x-e.x,L.z-e.z)<Math.hypot(L.x-s.x,L.z-s.z)?e:s).name}function qn(){var l;const s=Mr(L),e=s&&Lt(s.type),t=L.wanted;fe("#wanted").textContent="★".repeat(t)+"☆".repeat(3-t),fe("#wanted").style.color=t?"#ff9c80":"#c0ccce",fe("#wanted").setAttribute("aria-label",t+" star wanted level"),fe("#cash").textContent="₡ "+L.cash.toLocaleString(),fe("#heatStatus").textContent=L.bust>0?"DETAINING "+Math.min(100,Math.round(L.bust/3*100))+"%":t?L.heatTimer>0?"LOSING SIGNAL…":"SECURITY PURSUIT":"OFF THE GRID",fe("#healthValue").textContent=Math.ceil(L.health),fe("#healthBar").style.width=L.health+"%",fe("#nitroBar").style.width=L.nitro+"%",fe("#speed").innerHTML=Math.round(Math.abs(L.speed)*3.6)+"<small>KM/H</small>",fe("#vehicleName").textContent=L.transition?L.transition.kind==="enter"?"ENTERING VEHICLE":"EXITING VEHICLE":e?e.name:"ON FOOT",fe("#vehicleHint").textContent=e?"SHIFT BOOST · SPACE HANDBRAKE":"SHIFT SPRINT · ALT WALK",fe("#touchRide").textContent=e?"EXIT":"ENTER",fe("#district").textContent=Sc()+" / 07:12",fe("#mapDistrict").textContent=Sc(),fe("#notice").textContent=L.noticeLeft>0?L.notice:"",document.body.classList.toggle("lowhealth",L.health<30);const n=Lu(L);St("#prompt",L.phase==="playing"&&!L.transition&&(s?Math.abs(L.speed)<1.5:!!n)),fe("#prompt span").textContent=s?"EXIT "+e.name:n?(n.driver&&!n.driver.exited?"TAKE ":"ENTER ")+Lt(n.type).name:"";const i=L.mission;if(St("#jobProgress",!!i),i){fe("#jobType").textContent=i.type,fe("#jobTitle").textContent=i.escaping?"Lose the patrols.":i.points[i.stage].name,fe("#jobText").textContent=i.escaping?"Break contact until your wanted level clears.":Math.round(Math.hypot(L.x-i.points[i.stage].x,L.z-i.points[i.stage].z))+" m to your destination.",fe("#jobStage").textContent=i.escaping?"UPLINK COMPLETE":"CHECKPOINT "+(i.stage+1)+" / "+i.points.length;const c=Math.max(0,Math.ceil(i.left));fe("#jobTimer").textContent=Math.floor(c/60)+":"+(c%60).toString().padStart(2,"0"),fe("#jobs").textContent="M   CURRENT CONTRACT"}else fe("#jobType").textContent="FREE ROAM",fe("#jobTitle").textContent="A city without a script.",fe("#jobText").textContent=e?"Go anywhere. Park anywhere. Make your next move.":"Press E beside stopped traffic to take the vehicle. Aim to make approaching drivers brake.",fe("#jobs").textContent="M   CONTRACTS";const r=Math.hypot(L.x-Sn.x,L.z-Sn.z)<Sn.radius;fe("#garage").classList.toggle("nearby",r),fe("#garage").textContent=r?"G   ENTER MOTORWORKS":"G   MOTORWORKS",fe("#saveStatus").textContent=L.savedAt?"PROGRESS SAVED ON THIS BROWSER":"PROGRESS SAVES AUTOMATICALLY",fe("#audioMeter").value=Math.min(1,Ut.level()*9),fe("#renderMode").textContent=Nn?"COMPATIBILITY RENDERER":vc?"PERFORMANCE QUALITY":"ADAPTIVE QUALITY",fe("#performance").textContent=Math.round(ao)+" FPS";const o=L.phase==="playing"&&L.mode==="foot"&&!L.transition,a=o&&Xn(L.combat.selected);St("#weaponHUD",o),St("#combatActions",!!a),St("#crosshair",!!a),document.body.classList.toggle("aiming",!!a&&L.combat.aiming),fe("#weaponName").textContent=a?a.name:"UNARMED",fe("#weaponAmmo").textContent=a?L.combat.clips[a.id]+" / "+L.combat.reserve[a.id]:"—",fe("#aimWeapon").setAttribute("aria-pressed",String(L.combat.aiming)),fe("#reloadWeapon").textContent=L.combat.reloading?"RELOADING…":"R RELOAD",fe("#reloadProgress").style.width=L.combat.reloading?(1-L.combat.reloading/L.combat.reloadDuration)*100+"%":"0%",fe("#crosshair").classList.toggle("hit-confirm",L.combat.hit>0);for(const c of document.querySelectorAll("[data-weapon]"))c.setAttribute("aria-pressed",String((c.dataset.weapon||null)===L.combat.selected));St("#rangeActions",Math.hypot(L.x-Sn.x,L.z-Sn.z)<50),fe("#rangeScore").textContent=Ii.targetHits?"TARGET HITS  "+Ii.targetHits:"Targets east of Motorworks",fe("#game").dataset.weapon=L.combat.selected||"unarmed",fe("#game").dataset.shots=L.combat.shotCount,fe("#game").dataset.lastHit=Ii.lastResult,fe("#game").dataset.targetHits=Ii.targetHits,fe("#game").dataset.stolen=L.vehicles.filter(c=>c.stolen).length,fe("#game").dataset.drivers=L.vehicles.filter(c=>c.driver&&!c.driver.exited&&c.driver.health>0).length,fe("#game").dataset.phase=L.phase,fe("#game").dataset.mode=L.mode,fe("#game").dataset.position=Math.round(L.x)+","+Math.round(L.z),fe("#game").dataset.transition=((l=L.transition)==null?void 0:l.kind)||"",Zv()}function Zv(){const s=Xv,e=240,t=.78,n=120,i=o=>n+(o-L.x)*t,r=o=>n+(o-L.z)*t;s.fillStyle="#173033",s.fillRect(0,0,e,e),s.strokeStyle="#405358",s.lineWidth=20*t;for(let o=-3;o<=3;o++)s.beginPath(),s.moveTo(i(o*100),0),s.lineTo(i(o*100),e),s.stroke(),s.beginPath(),s.moveTo(0,r(o*100)),s.lineTo(e,r(o*100)),s.stroke();s.fillStyle="#7b9293";for(const o of vr)s.fillRect(i(o.x-o.w/2),r(o.z-o.d/2),o.w*t,o.d*t);if(L.mission&&!L.mission.escaping){const o=L.mission.points[L.mission.stage],a=Dt(i(o.x),10,230),l=Dt(r(o.z),10,230);s.strokeStyle="#ffd279",s.lineWidth=2,s.setLineDash([4,5]),s.beginPath(),s.moveTo(120,120),s.lineTo(a,l),s.stroke(),s.setLineDash([]),s.fillStyle="#ffd279",s.beginPath(),s.arc(a,l,5,0,7),s.fill()}s.fillStyle="#c4ed86",s.fillRect(Dt(i(Sn.x),9,231)-5,Dt(r(Sn.z),9,231)-5,10,10),s.fillStyle="#77d8df";for(const o of L.vehicles)!o.traffic&&Math.hypot(o.x-L.x,o.z-L.z)<160&&s.fillRect(i(o.x)-2,r(o.z)-2,4,4);for(const o of L.cops)s.fillStyle="#ff637d",s.beginPath(),s.arc(Dt(i(o.x),5,235),Dt(r(o.z),5,235),4,0,7),s.fill();s.fillStyle="#e4bc83",s.beginPath(),s.arc(Dt(i(57),6,234),Dt(r(181),6,234),4,0,7),s.fill(),s.save(),s.translate(120,120),s.rotate(L.heading),s.fillStyle="#ffffff",s.beginPath(),s.moveTo(0,-8),s.lineTo(5,6),s.lineTo(0,3),s.lineTo(-5,6),s.closePath(),s.fill(),s.restore()}function $v(){const s=L.wanted?Math.min(3,L.wanted+1):0;for(;L.cops.length<s;){const e=L.cops.length,t=Dt(Math.round(L.x/100)*100+(e%2?100:-100),-300,300),n=Dt(Math.round(L.z/100)*100+(e>1?100:0),-300,300),i=e%2?"warden":"sentinel";L.cops.push({uid:"patrol-"+Date.now()+"-"+e,type:i,police:!0,driver:{health:100,police:!0},x:t,z:n,heading:0,target:null,model:ft.makeVehicle(i)})}for(;L.cops.length>s;){const e=L.cops.pop();ft.scene.remove(e.model.group),e.model.group.traverse(t=>{t.geometry&&t.geometry.type!=="BoxGeometry"&&t.geometry.dispose()})}}function Vu(s){var l;const e=L.phase==="playing";if(e){let c=qv(),h=ii+Rn;if(bt){const f=bt.path[0],g=f.x-L.x,x=f.z-L.z;if(Math.hypot(g,x)<.2){if(bt.path.shift(),!bt.path.length){const m=bt.kind;bt=null,m==="range"?(Ru(L,"sidearm"),ii=Math.PI,Rn=0,un=-.018,L.heading=Math.PI,L.speed=0,Vn=!0,L.combat.aiming=!0,mt(L,"Aim at the centre target · Left mouse / Space to fire")):_c(L)}c={forward:0,steer:0,boost:!1}}else h=Math.atan2(g,-x),c={forward:1,steer:0,walk:bt.kind!=="range"}}const u=L.x,d=L.z;if(bv(L,c,s,h),bt&&(bt.stuck=Math.hypot(L.x-u,L.z-d)<.004?bt.stuck+s:0,bt.stuck>.65)){const f=Kc(L,bt.target);f.length?(bt.path=f,bt.stuck=0):(bt=null,mt(L,"Path blocked · Walk to the selected bike"))}if(Ln()&&!bt&&(L.heading=ii+Rn),Sv(L,s),L.interceptId){const f=L.vehicles.find(g=>g.uid===L.interceptId);!f||Math.hypot(f.x-L.x,f.z-L.z)>6?L.interceptId=null:f.speed<1.5&&_c(L)}$v(),Tv(L,s),Lh>L.health&&(document.body.classList.add("hit"),setTimeout(()=>document.body.classList.remove("hit"),160)),Lh=L.health,(L.phase==="busted"||L.phase==="wrecked")&&Dh(),(L.mode!=="foot"||L.transition)&&(ii+=gr(L.heading,ii)*(1-Math.exp(-s*3.3)),Wt-Fu>2&&(Rn*=Math.exp(-s*1.4))),ba+=s,ba>12&&!L.transition&&(Ro(L),ba=0)}const t=Mr(L),n=L.transition&&L.vehicles.find(c=>c.uid===L.transition.vehicleId),i=Lt((l=n||t)==null?void 0:l.type),r=L.transition?L.transition.seated||0:t?1:0;for(const c of L.vehicles){let h=vo.get(c.uid);h||(h=c.model||ft.makeVehicle(c.type),vo.set(c.uid,h));const u=Math.hypot(c.x-ct.position.x,c.z-ct.position.z);h.group.visible=u<(Nn?150:300),h.lod(u),h.update(c,Wt)}if(ft.player.group.position.set(L.x,Ri(L.x,L.z),L.z),r>0){const c=new P(i.kind==="car"?-.37:0,0,i.kind==="car"?.12:.28).applyAxisAngle(new P(0,1,0),-L.heading);ft.player.group.position.addScaledVector(c,r)}ft.player.group.rotation.y=-L.heading,ft.player.group.visible=(!si||!!L.transition)&&!(t&&t.kind==="car"&&si),ft.player.pose({time:Wt,phase:L.footstep,speed:L.transition?L.transition.walking?1.8:0:L.mode==="foot"?L.speed:0,sprinting:L.sprinting,seated:r,kind:i.kind,seat:i.kind==="car"?["suv","pickup","van"].includes(i.design)?.7:Math.min(.54,i.height-.93):i.seat,transition:L.transition?Math.sin((L.transition.interaction||0)*Math.PI):0,turn:L.steering,weapon:L.mode==="foot"&&!L.transition?L.combat.selected:null,aiming:L.combat.aiming,aimPitch:un,recoil:L.combat.recoil,reload:L.combat.reloading?1-L.combat.reloading/L.combat.reloadDuration:0}),Uu.update(L,s,Wt,ct.position),Ii.updatePedestrians(L,e?s:0,Wt,e||L.phase==="intro");for(const c of L.cops)c.model.update({...c,siren:!0},Wt);ft.train.position.z=Math.sin(Wt*.045)*300;for(const c of ft.palms||[]){const h=Math.hypot(c.position.x-ct.position.x,c.position.z-ct.position.z);c.visible=h<(Nn?160:370),c.visible&&(c.userData.leaves.rotation.z=Math.sin(Wt*.7+c.position.x)*.015,c.userData.leaves.rotation.y=c.userData.baseAngle+Math.sin(Wt*.3)*.015)}for(const c of ft.signals)c.material=jc(c.userData.axis,L.elapsed)?ft.signalGreen:ft.signalRed;const o=L.mission;if(ft.marker.visible=!!o&&!o.escaping,ft.marker.visible){const c=o.points[o.stage];ft.marker.position.set(c.x,0,c.z),ft.diamond.rotation.y=Wt,ft.diamond.position.y=4.5+Math.sin(Wt*2)*.3}ft.sun.position.set(L.x-65,95,L.z+45),ft.sun.target.position.set(L.x,0,L.z);const a=rr==="garage"&&L.phase==="paused";if(L.phase==="intro")ct.position.set(23+Math.sin(Wt*.035)*1.8,5.1,190),ct.lookAt(-18,4,94),ct.fov=57;else if(a){const c=$c(Ki)||L.vehicles[0],h=Lt(c.type).kind==="car";Bt.set(c.x+(h?5.2:2.4),h?2.85:1.45,c.z+(h?6.5:3)),ct.position.lerp(Bt,1-Math.exp(-s*4)),$r.set(c.x+(h?1.1:0),h?.9:.64,c.z-(h?.85:0)),Zr.lerp($r,1-Math.exp(-s*5)),ct.lookAt(Zr),ct.fov=49}else if(si&&!L.transition){const c=L.mode!=="foot"?L.heading+Rn:ii+Rn;Bt.set(L.x,t?i.kind==="car"?1.19:1.43:1.68,L.z),t&&i.kind==="car"&&Bt.add(new P(-.35,0,-.22).applyAxisAngle(new P(0,1,0),-L.heading)),ct.position.lerp(Bt,1-Math.exp(-s*12)),ct.lookAt(ct.position.x+Math.sin(c)*Math.cos(un)*20,ct.position.y-Math.sin(un)*20,ct.position.z-Math.cos(c)*Math.cos(un)*20),ct.fov=Ji(ct.fov,Ln()&&L.combat.aiming?49:68,9,s)}else if(Ln()){const c=ii+Rn,h=new P(Math.sin(c)*Math.cos(un),-Math.sin(un),-Math.cos(c)*Math.cos(un)),u=new P(Math.cos(c),0,Math.sin(c)),d=new P(L.x,Ri(L.x,L.z)+1.48,L.z);Bt.copy(d).addScaledVector(h,L.combat.aiming?-1.8:-3).addScaledVector(u,.42);for(let f=.2;f<=1;f+=.1)if(nn(L.x+(Bt.x-L.x)*f,L.z+(Bt.z-L.z)*f,.18)){Bt.lerp(d,1-Math.max(.1,f-.13));break}ct.position.lerp(Bt,1-Math.exp(-s*11)),ct.lookAt(ct.position.clone().addScaledVector(h,50).add(new P(0,L.combat.recoil*3,0))),ct.fov=Ji(ct.fov,L.combat.aiming?48:59,9,s)}else{const c=ii+Rn,h=Math.abs(L.speed),u=t||L.transition?1:0,d=u?(i.kind==="car"?6.5:4.7)+Math.min(3,h*.054):3.8,f=u?.45:.5;Bt.set(L.x-Math.sin(c)*d+Math.cos(c)*f,u?2.1+un*4:1.55+un*4,L.z+Math.cos(c)*d+Math.sin(c)*f);for(let g=.2;g<=1;g+=.1){const x=L.x+(Bt.x-L.x)*g,m=L.z+(Bt.z-L.z)*g;if(nn(x,m,.2)){Bt.set(L.x+(Bt.x-L.x)*Math.max(.15,g-.13),Bt.y,L.z+(Bt.z-L.z)*Math.max(.15,g-.13));break}}ct.position.lerp(Bt,1-Math.exp(-s*(u?5:8))),$r.set(L.x+Math.sin(L.heading)*Math.min(2,h*.035),1.05,L.z-Math.cos(L.heading)*Math.min(2,h*.035)),Zr.lerp($r,1-Math.exp(-s*9)),ct.lookAt(Zr),ct.fov=Ji(ct.fov,58+Math.min(10,h*.15),3,s)}if(Sa+=s,Sa>.4){const c=ct.position;ft.scene.traverse(h=>{if(h.isMesh&&h.userData.detail&&!h.userData.dynamic){const u=h.position;h.visible=Math.hypot(u.x-c.x,u.z-c.z)<(Nn?65:110)}}),Sa=0}if(ct.updateProjectionMatrix(),Ii.update(L,e?s:0,Wt,si),e&&Ln()){const c=Xn(L.combat.selected);(fi||(di||Rt[" "])&&c.automatic)&&Ii.shoot(L,si)}fi=!1,L.phase==="wrecked"&&rr!=="result"&&(rr="result",Dh()),Ut.update(L,t?Lt(t.type):null)}function Gu(s){const e=(s-Ph)/1e3||.016,t=Math.min(.055,e);Ph=s,Wt+=t,ao=Ji(ao,1/Math.max(.001,e),1,t),!Nn&&!vc&&Wt>12&&ao<38&&(vc=!0,dn.setPixelRatio(1),dn.shadowMap.enabled=!1,Jc()),Vu(t),Ma+=t,Ma>.15&&(qn(),Ma=0),ya+=t,(!Nn||ya>.085)&&(dn.render(ft.scene,ct),ya=0),requestAnimationFrame(Gu)}ft.ready.then(()=>{St("#loading",!1),requestAnimationFrame(Gu)});Nu&&(fe("#enter").firstChild.textContent="CONTINUE IN GRAND CITY ");qn();Vu(.01);const Qr=document.modelContext;if(Qr!=null&&Qr.registerTool){const s=new AbortController;for(const e of[{name:"read_city_status",description:"Read the player movement mode, active contract, credits and wanted level.",inputSchema:{type:"object",properties:{},additionalProperties:!1},annotations:{readOnlyHint:!0},execute:()=>{var t;return{phase:L.phase,mode:L.mode,district:Sc(),mission:((t=L.mission)==null?void 0:t.id)||null,cash:L.cash,wanted:L.wanted}}},{name:"open_jobs_board",description:"Pause free roaming and open the contract board.",inputSchema:{type:"object",properties:{},additionalProperties:!1},annotations:{readOnlyHint:!1},execute:()=>{if(L.phase!=="playing")throw Error("Enter or resume the city first");return Un("jobs"),{panel:"jobs",contracts:Ao.map(t=>({id:t.id,title:t.title}))}}}])try{Promise.resolve(Qr.registerTool(e,{signal:s.signal})).catch(()=>{})}catch{}addEventListener("pagehide",()=>s.abort(),{once:!0})}
