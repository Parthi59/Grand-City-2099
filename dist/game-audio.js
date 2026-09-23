// All sources are created only after a real pointer or keyboard gesture.
export class GameAudio {
 constructor(onStatus=()=>{},contextFactory){this.onStatus=onStatus;this.contextFactory=contextFactory;this.enabled=true;this.volume=.82;this.music=false;this.status='ready';this.ctx=null;this.pending=null;this.nextStep=0;this.nextBird=0;this.nextMusic=0;this.nextHorn=0;this.lastSpeed=0;this.lastGear=1;this.previousHealth=100;try{const p=JSON.parse(localStorage.getItem('nightfall-audio'));if(p){this.volume=Math.max(0,Math.min(1,p.volume??.82));this.enabled=p.enabled!==false;this.music=!!p.music}}catch{}}
 report(status){this.status=status;this.onStatus(status)}
 persist(){try{localStorage.setItem('nightfall-audio',JSON.stringify({volume:this.volume,enabled:this.enabled,music:this.music}))}catch{}}
 build(){
  const Factory=this.contextFactory||globalThis.AudioContext||globalThis.webkitAudioContext;if(!Factory)throw new Error('Audio is unavailable');
  const ac=this.ctx=new Factory();this.master=ac.createGain();this.master.gain.value=this.volume;
  this.vehicleBus=ac.createGain();this.vehicleBus.gain.value=1.12;this.cityBus=ac.createGain();this.cityBus.gain.value=.92;this.fxBus=ac.createGain();this.fxBus.gain.value=1.08;this.vehicleBus.connect(this.master);this.cityBus.connect(this.master);this.fxBus.connect(this.master);
  const limiter=ac.createDynamicsCompressor();limiter.threshold.value=-10;limiter.knee.value=18;limiter.ratio.value=4;this.analyser=ac.createAnalyser();this.analyser.fftSize=256;this.samples=new Uint8Array(256);this.master.connect(limiter);limiter.connect(this.analyser);this.analyser.connect(ac.destination);
  const osc=(type,freq,bus=this.vehicleBus)=>{const o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.value=freq;g.gain.value=0;o.connect(g);g.connect(bus);o.start();return[o,g]};
  [this.motor,this.motorGain]=osc('sawtooth',72);[this.sub,this.subGain]=osc('triangle',36);[this.whine,this.whineGain]=osc('sine',240);[this.exhaust,this.exhaustGain]=osc('square',48);[this.siren,this.sirenGain]=osc('sine',600,this.cityBus);[this.traffic,this.trafficGain]=osc('triangle',88,this.cityBus);
  this.motor.disconnect();this.motorFilter=ac.createBiquadFilter();this.motorFilter.type='lowpass';this.motorFilter.frequency.value=700;this.motorFilter.Q.value=.7;this.motor.connect(this.motorFilter);this.motorFilter.connect(this.motorGain);
  const buffer=ac.createBuffer(1,ac.sampleRate*2,ac.sampleRate),data=buffer.getChannelData(0);for(let i=0;i<data.length;i++)data[i]=Math.random()*2-1;this.noiseBuffer=buffer;
  const noise=(frequency,type='lowpass',bus=this.cityBus)=>{const n=ac.createBufferSource(),f=ac.createBiquadFilter(),g=ac.createGain();n.buffer=buffer;n.loop=true;f.type=type;f.frequency.value=frequency;g.gain.value=0;n.connect(f);f.connect(g);g.connect(bus);n.start();return g};
  this.ambientGain=noise(210);this.windGain=noise(1250,'bandpass',this.vehicleBus);this.roadGain=noise(520,'bandpass',this.vehicleBus);this.brakeGain=noise(2850,'bandpass',this.vehicleBus);this.boostGain=noise(1900,'bandpass',this.vehicleBus);
  ac.onstatechange=()=>this.report(!this.enabled?'off':ac.state==='running'?'on':ac.state==='closed'?'unavailable':'blocked');
 }
 unlock(){
  if(!this.enabled)return Promise.resolve(false);if(this.pending)return this.pending;
  try{if(!this.ctx||this.ctx.state==='closed')this.build();if(this.ctx.state==='running'){this.report('on');return Promise.resolve(true)}
   this.pending=Promise.resolve(this.ctx.resume()).then(()=>{if(!this.enabled){this.report('off');return false}const ok=this.ctx.state==='running';this.report(ok?'on':'blocked');return ok}).catch(()=>{this.report(this.enabled?'blocked':'off');return false}).finally(()=>this.pending=null);return this.pending;
  }catch{this.report('unavailable');return Promise.resolve(false)}
 }
 async setEnabled(value){this.enabled=value;this.persist();if(!value){this.silence();this.report('off');return false}const ok=await this.unlock();if(ok){this.master.gain.setTargetAtTime(this.volume,this.ctx.currentTime,.02);this.cue('click')}return ok}
 setVolume(value){this.volume=Math.max(0,Math.min(1,value));this.persist();if(this.ctx)this.master.gain.setTargetAtTime(this.enabled?this.volume:0,this.ctx.currentTime,.02)}
 tone(frequency=440,duration=.12,volume=.13,delay=0,end=frequency*.98,type='sine'){
  if(!this.enabled||this.ctx?.state!=='running')return;const ac=this.ctx,t=ac.currentTime+delay,o=ac.createOscillator(),g=ac.createGain();o.type=type;o.frequency.setValueAtTime(frequency,t);o.frequency.exponentialRampToValueAtTime(Math.max(30,end),t+duration);g.gain.setValueAtTime(.001,t);g.gain.exponentialRampToValueAtTime(volume,t+.01);g.gain.exponentialRampToValueAtTime(.001,t+duration);o.connect(g);g.connect(this.fxBus);o.start(t);o.stop(t+duration+.02);o.onended=()=>{o.disconnect();g.disconnect()};
 }
 burst(duration=.12,volume=.2,filter=500){if(!this.enabled||this.ctx?.state!=='running')return;const ac=this.ctx,t=ac.currentTime,n=ac.createBufferSource(),g=ac.createGain(),f=ac.createBiquadFilter();n.buffer=this.noiseBuffer;f.frequency.value=filter;n.connect(f);f.connect(g);g.connect(this.fxBus);g.gain.setValueAtTime(volume,t);g.gain.exponentialRampToValueAtTime(.001,t+duration);n.start(t);n.stop(t+duration+.01);n.onended=()=>{n.disconnect();g.disconnect();f.disconnect()}}
 cue(name){
  if(name==='shot-sidearm'){this.burst(.18,.78,3300);this.tone(138,.18,.29,0,42,'triangle');this.tone(82,.14,.08,.16,34)}
  if(name==='shot-carbine'){this.burst(.11,.62,2650);this.tone(112,.10,.26,0,46,'triangle')}
  if(name==='reload'){this.burst(.08,.23,2600);this.tone(230,.06,.09,.10,95)}
  if(name==='reloadDone'||name==='equip'){this.burst(.065,.22,1700);this.tone(340,.06,.09,0,150)}
  if(name==='empty')this.burst(.027,.17,3500);
  if(name==='hitMetal'){this.tone(2100,.16,.075,0,670,'triangle');this.burst(.08,.24,3400)}
  if(name==='hitBody')this.burst(.09,.22,360);
  if(name==='incoming'){this.burst(.13,.40,850);this.tone(70,.16,.15,0,35)}
  if(name==='click')this.tone(720,.065,.13);
  if(name==='door'){this.burst(.16,.39,430);this.tone(96,.12,.14)}
  if(name==='impact'){this.burst(.46,.86,1250);this.tone(64,.36,.38,0,28);this.tone(170,.18,.13,0,52,'square')}
  if(name==='gear'){this.tone(92,.07,.08,0,62,'square');this.burst(.045,.09,900)}
  if(name==='horn'){this.tone(330,.20,.11,0,300,'square');this.tone(440,.18,.08,.02,390,'square')}
  if(name==='checkpoint')[660,880].forEach((f,i)=>this.tone(f,.15,.15,i*.08));
  if(name==='mission')[330,440,660].forEach((f,i)=>this.tone(f,.22,.17,i*.1));
  if(name==='reward')[523,659,784,1046].forEach((f,i)=>this.tone(f,.35,.18,i*.12));
  if(name==='test'){this.tone(440,.28,.24);this.tone(660,.28,.24,.32);this.tone(880,.40,.24,.64);this.burst(.12,.16,1800)}
 }
 level(){if(!this.analyser)return 0;this.analyser.getByteTimeDomainData(this.samples);return Math.sqrt(this.samples.reduce((sum,v)=>sum+((v-128)/128)**2,0)/this.samples.length)}
 update(state,def){
  const ac=this.ctx;if(!ac||ac.state!=='running'){state.events.length=0;return}const t=ac.currentTime,active=state.phase==='playing'&&this.enabled,riding=active&&state.mode!=='foot'&&!state.transition,speed=Math.abs(state.speed||0),electric=def?.engine==='electric',heavy=def?.engine==='heavy',throttle=state.throttle||0;
  const set=(p,v,s=.10)=>p.setTargetAtTime(v,t,s);set(this.master.gain,this.enabled?this.volume:0,.025);
  const gear=1+Math.floor(speed/11),rpm=58+(speed%11)*8+throttle*30;set(this.motor.frequency,heavy?rpm*.55:electric?rpm*1.9:rpm);set(this.sub.frequency,heavy?rpm*.26:rpm*.48);set(this.exhaust.frequency,heavy?rpm*.42:rpm*.68);set(this.motorFilter.frequency,360+throttle*1200+speed*19);
  set(this.motorGain.gain,riding?(electric?.055:heavy?.26:.22)*(1+throttle*.58):0);set(this.subGain.gain,riding?(electric?.045:heavy?.16:.125)*(1+throttle*.25):0);set(this.exhaustGain.gain,riding&&!electric?(heavy?.10:.055)*(1+throttle*.75):0);
  set(this.whine.frequency,electric?190+speed*23:260+speed*10);set(this.whineGain.gain,riding?(electric?.13:state.boosting?.10:.025):0);
  set(this.ambientGain.gain,active?.17:0,.3);set(this.windGain.gain,active?Math.min(.30,speed*.0055):0,.2);set(this.roadGain.gain,riding?Math.min(.15,.025+speed*.0026):0,.15);set(this.boostGain.gain,active&&state.boosting?.20:0);set(this.brakeGain.gain,riding&&state.braking&&speed>5?Math.min(.18,.025+speed*.003):0);
  const nearest=(state.cops||[]).reduce((d,c)=>Math.min(d,Math.hypot(c.x-state.x,c.z-state.z)),Infinity),siren=active&&state.wanted>0?Math.max(0,1-nearest/145)*.18:0;set(this.siren.frequency,650+Math.sin(t*4.8)*240,.05);set(this.sirenGain.gain,siren);
  let trafficLevel=0,trafficSpeed=0;for(const v of state.vehicles||[]){if(!v.traffic)continue;const distance=Math.hypot(v.x-state.x,v.z-state.z);if(distance<48){trafficLevel+=.028*(1-distance/48);trafficSpeed=Math.max(trafficSpeed,v.speed)}}set(this.trafficGain.gain,active?Math.min(.12,trafficLevel):0);set(this.traffic.frequency,65+trafficSpeed*5);

  if(riding&&gear!==this.lastGear&&speed>6){this.cue('gear');this.lastGear=gear}
  if(active&&trafficLevel>.018&&t>=this.nextHorn){if(Math.random()<.42)this.cue('horn');this.nextHorn=t+5+Math.random()*9}
  this.lastSpeed=speed;
  if(active&&state.mode==='foot'&&!state.transition&&speed>.6&&t>=this.nextStep){this.burst(.065,.15,350);this.tone(95,.07,.08);this.nextStep=t+(state.sprinting?.23:speed>2?.32:.5)}
  if(active&&t>this.nextBird){this.tone(1650,.13,.026,0,2300);this.tone(1900,.12,.02,.18,1350);this.nextBird=t+9+Math.random()*7;}
  if(active&&this.music&&t>this.nextMusic){[130.81,164.81,196].forEach((f,i)=>this.tone(f,3.8,.018,i*.4,f));this.nextMusic=t+5;}
  if(active)for(const event of state.events)this.cue(event);state.events.length=0;
 }
 silence(){if(this.ctx&&this.master)this.master.gain.setTargetAtTime(0,this.ctx.currentTime,.02)}
}
