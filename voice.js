(function(){
'use strict';
const MANIFEST='./assets/audio/manifest.json';
let manifestPromise,currentAudio,unlocked=false;

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
 const audio=new Audio('data:audio/mp3;base64,//uQxAAAAAAAAAAAAAAAAAAAAAAASW5mbwAAAA8AAAACAAACcQCA');
 audio.volume=0;audio.play().catch(()=>{});
}
async function speak(text,{role='narrator',fallback=true}={}){
 text=clean(text);if(!text)return false;
 try{
  currentAudio?.pause();window.speechSynthesis?.cancel?.();
  const manifest=await getManifest(),entry=manifest.lines?.[role]?.[text]||manifest.lines?.narrator?.[text];
  if(!entry)throw new Error('line not pre-generated');
  const audio=new Audio(entry);currentAudio=audio;audio.preload='auto';
  await audio.play();return true;
 }catch{return fallback?localSpeak(text):false}
}
function stop(){currentAudio?.pause();currentAudio=null;window.speechSynthesis?.cancel?.()}
document.addEventListener('pointerdown',unlock,{once:true,passive:true});
getManifest();
window.ZiziVoice={speak,stop,unlock,refresh:()=>{manifestPromise=null;return getManifest()}};
})();
