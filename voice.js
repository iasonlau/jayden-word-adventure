(function(){
'use strict';
const MANIFEST='./assets/audio/manifest.json';
const UNLOCK_AUDIO='./assets/audio/narrator-6d4da2a07a9d67ed40.mp3';
const player=new Audio();
player.preload='auto';
let manifestPromise,unlocked=false,playToken=0;

const clean=text=>String(text||'').replace(/\s+/g,' ').trim();
function localSpeak(text){
 if(!('speechSynthesis'in window))return false;
 speechSynthesis.cancel();
 const utterance=new SpeechSynthesisUtterance(text);
 utterance.lang='zh-HK';utterance.rate=.82;utterance.pitch=1.02;
 const voices=speechSynthesis.getVoices();
 utterance.voice=voices.find(v=>v.lang.toLowerCase()==='zh-hk')||voices.find(v=>/cantonese|hong kong|粵語/i.test(v.name))||null;
 speechSynthesis.speak(utterance);return true;
}
function getManifest(){
 if(!manifestPromise)manifestPromise=fetch(MANIFEST,{cache:'no-cache'}).then(r=>r.ok?r.json():Promise.reject(new Error('voice manifest unavailable'))).catch(()=>({lines:{}}));
 return manifestPromise;
}
function unlock(){
 if(unlocked)return;unlocked=true;
 player.src=UNLOCK_AUDIO;player.muted=true;
 player.play().then(()=>{player.pause();player.currentTime=0;player.muted=false}).catch(()=>{player.muted=false});
}
async function speak(text,{role='narrator',fallback=true}={}){
 text=clean(text);if(!text)return false;
 const token=++playToken;
 try{
  player.pause();window.speechSynthesis?.cancel?.();
  const manifest=await getManifest(),entry=manifest.lines?.[role]?.[text]||manifest.lines?.narrator?.[text];
  if(!entry)throw new Error('line not pre-generated');
  if(token!==playToken)return false;
  player.muted=false;player.src=new URL(entry,document.baseURI).href;player.currentTime=0;
  await player.play();return true;
 }catch{return fallback?localSpeak(text):false}
}
function stop(){playToken++;player.pause();window.speechSynthesis?.cancel?.()}
document.addEventListener('pointerdown',unlock,{once:true,passive:true});
getManifest();
window.ZiziVoice={speak,stop,unlock,refresh:()=>{manifestPromise=null;return getManifest()}};
})();
