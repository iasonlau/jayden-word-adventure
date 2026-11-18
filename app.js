'use strict';

const ASSESS_KEY='zizi_assessment_v1';
const LEARN_KEY='zizi_learning_v1';
const root=document.getElementById('root');
const statusEl=document.getElementById('status');
const starEl=document.getElementById('starCount');
const dock=document.getElementById('dock');
const esc=s=>String(s).replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
const load=(key,fallback)=>{try{return{...fallback,...(JSON.parse(localStorage.getItem(key)||'null')||{})}}catch{return fallback}};
const persist=(key,value)=>{try{localStorage.setItem(key,JSON.stringify(value))}catch{}};

// 題目次序及評分方式與原版相同，確保已儲存的 50 題進度可以繼續使用。
const raw=[
['聽','請揀出蘋果。',['🍎','🐟','🚗'],0,'請揀出蘋果。',1],['聽','請揀出可以飲水嘅物件。',['🧦','🥛','📚'],1,'請揀出可以飲水嘅物件。',1],['聽','請揀出會飛嘅動物。',['🐦','🐕','🐢'],0,'請揀出會飛嘅動物。',1],['聽','請揀出紅色嘅物件。',['🟦','🔴','🟩'],1,'請揀出紅色嘅物件。',1],['聽','請揀出兩個蘋果。',['🍎','🍎🍎','🍎🍎🍎'],1,'請揀出兩個蘋果。',2],['聽','請揀出喺屋企瞓覺會用到嘅物件。',['🛏️','🚲','🥄'],0,'請揀出喺屋企瞓覺會用到嘅物件。',2],['聽','請揀出喺書本下面嘅星星。',['⭐📘','📘⭐','⭐'],1,'請揀出喺書本下面嘅星星。',2],['聽','先揀太陽，再揀月亮。邊組次序啱？',['☀️ → 🌙','🌙 → ☀️','🌙 → ⭐'],0,'先揀太陽，再揀月亮。邊組次序啱？',3],['聽','邊組係先洗手，然後食飯？',['🍚 → 🧼','🧼 → 🍚','🛏️ → 🍚'],1,'邊組係先洗手，然後食飯？',3],['聽','除咗香蕉，請揀另一種水果。',['🍌','🍎','🥕'],1,'除咗香蕉，請揀另一種水果。',3],
['說','請講出呢樣物件嘅名稱。',['🍎'],0,'呢樣係乜嘢？',1],['說','請講出呢隻動物嘅名稱。',['🐈'],0,'呢隻係乜嘢動物？',1],['說','請講出呢個動作。',['🏃'],0,'佢做緊乜嘢？',1],['說','請用一句說話形容圖片。',['👦📖'],0,'請用一句說話形容：一個男仔睇書。',2],['說','請用一句說話形容圖片。',['👧☂️🌧️'],0,'請用一句說話形容：落雨時女仔擔遮。',2],['說','請講一樣你會帶返學嘅物品，並講原因。',['🎒'],0,'請講一樣你會帶返學嘅物品，同埋原因。',2],['說','請用「首先……然後……」講出朝早做嘅兩件事。',['🌅'],0,'請用首先同然後講朝早做嘅兩件事。',3],['說','如果同學跌倒，你會點做？',['🤝'],0,'如果同學跌倒，你會點做？',3],
['讀','揀出「山」字。',['水','山','火'],1,'揀出山字。',1],['讀','揀出「口」字。',['日','目','口'],2,'揀出口字。',1],['讀','揀出「手」字。',['毛','手','牛'],1,'揀出手字。',1],['讀','揀出「大」字。',['太','大','天'],1,'揀出大字。',1],['讀','揀出「雨」字。',['雪','雲','雨'],2,'揀出雨字。',1],['讀','「學校」係邊一個詞語？',['學校','學習','校車'],0,'揀出學校呢個詞語。',2],['讀','「老師」係邊一個詞語？',['老虎','老師','老鼠'],1,'揀出老師呢個詞語。',2],['讀','「旁邊」係咩意思？',['附近嘅一側','好遠嘅地方','最上面'],0,'旁邊係咩意思？',2],['讀','「準備」係咩意思？',['事前安排好','即刻忘記','走開'],0,'準備係咩意思？',2],['讀','「比較」係咩意思？',['將事物放埋一齊睇異同','抄寫十次','隨便揀'],0,'比較係咩意思？',3],['讀','「除了」係咩意思？',['只講同一樣','唔計提到嗰樣，仲有其他','全部都唔可以'],1,'除了係咩意思？',3],['讀','「分別」喺「說出兩者的分別」中係咩意思？',['相同嘅地方','唔同嘅地方','數量最多'],1,'說出兩者嘅分別，即係講佢哋有咩唔同。',3],
['理解','小明在公園跑步。小明在哪裏？',['學校','公園','家裏'],1,'小明喺邊度跑步？',1],['理解','妹妹正在喝水。誰在喝水？',['妹妹','哥哥','爸爸'],0,'邊個飲緊水？',1],['理解','今天下雨，所以小美帶雨傘。小美帶了甚麼？',['帽子','雨傘','手套'],1,'小美帶咗乜嘢？',2],['理解','小明先刷牙，然後吃早餐。哪件事先發生？',['吃早餐','刷牙','睡覺'],1,'邊件事先發生？',2],['理解','書包在椅子的旁邊。書包在哪裏？',['椅子旁邊','桌子下面','門外'],0,'書包喺邊度？',2],['理解','請圈出不是水果的一項。',['蘋果','香蕉','鉛筆'],2,'圈出唔係水果嗰一項。',2],['理解','把以下數字由小至大排列：8、2、5。',['2、5、8','8、5、2','5、2、8'],0,'由小至大排列八、二、五。',3],['理解','「選出正確答案」要做甚麼？',['全部都揀','揀啱嗰個答案','唔使答'],1,'選出正確答案要做乜嘢？',2],['理解','「找出相同之處」係要找甚麼？',['一樣嘅地方','唔同嘅地方','最長嘅字'],0,'找出相同之處係要搵乜嘢？',3],['理解','「根據短文回答」係要點做？',['只靠估','睇短文內容搵答案','唔睇短文'],1,'根據短文回答要點做？',3],['理解','雖然天氣很冷，小華仍然去游泳。哪句正確？',['天氣很熱','小華沒有游泳','小華有游泳'],2,'雖然天氣凍，小華仍然去游泳。',3],['理解','阿明比阿樂高，但比阿欣矮。誰最高？',['阿明','阿樂','阿欣'],2,'阿明比阿樂高，但比阿欣矮。邊個最高？',3],
['寫','請用手指寫出「人」字。',['人'],0,'請寫人字。',1],['寫','請用手指寫出「山」字。',['山'],0,'請寫山字。',1],['寫','請用手指寫出「水」字。',['水'],0,'請寫水字。',1],['寫','請用手指寫出「明」字。',['明'],0,'請寫明字。',2],['寫','請用手指寫出「學」字。',['學'],0,'請寫學字。',2],['寫','請寫出「老師」兩個字。',['老師'],0,'請寫老師兩個字。',2],['寫','請寫出「比較」兩個字。',['比較'],0,'請寫比較兩個字。',3],['寫','請寫一句話，講出你最喜歡嘅活動。',['自由寫句子'],0,'請寫一句話講你最鍾意嘅活動。',3]
];

const vocab=['老師','教室','課室','學校','同學','書包','鉛筆','橡皮','尺子','功課','回答','問題','正確','錯誤','選擇','圈出','填寫','連線','比較','分別','相同','不同','除了','首先','然後','最後','按照','次序','排列','原因','因為','所以','前面','後面','上面','下面','旁邊','中間','左邊','右邊','今天','昨天','明天','早上','晚上','星期','時間','開始','完成','準備','整理','安靜','留心','聆聽','閱讀','書寫','句子','詞語','短文','故事','人物','地點','事情','開心','難過','擔心','勇敢','幫忙','分享','一起','朋友','家庭','爸爸','媽媽','哥哥','妹妹','早餐','午餐','晚餐','水果','蘋果','香蕉','橙子','動物','小鳥','小狗','小貓','天氣','下雨','太陽','月亮','公園','巴士','地鐵','走路','跑步','游泳','洗手','刷牙','睡覺','起床','穿衣','吃飯','喝水','打開','關上','拿起','放下','長短','大小','多少','高低','快慢','輕重','顏色','紅色','藍色','綠色','黃色','黑色','白色','圓形','方形','三角形','數字','一個','兩個','三個','全部','部分','每個','一半','增加','減少','需要','可以','應該','必須','如果','但是','雖然','仍然','只有','已經','正在','看見','知道','明白','記得','忘記','發現','尋找','觀察','描述','解釋','回答問題','根據','適當','以下','以上','其中','其他','一項','兩項','答案','題目','內容','圖片','聲音','讀音','筆畫','筆順','部首','組合','造句','標點','逗號','句號','問號','感嘆號','文章','段落','主角','結局','順序','方法','結果','特別','簡單','困難','清楚','認真','仔細','努力','進步','練習','複習','學習','理解'];
const units=[
 {name:'森林認字島',icon:'🌲',start:0,end:18,color:'green'},
 {name:'指令山谷',icon:'🧭',start:18,end:32,color:'orange'},
 {name:'時空小鎮',icon:'🕰️',start:32,end:48,color:'green'},
 {name:'故事海灣',icon:'📖',start:48,end:64,color:'purple'},
 {name:'生活樂園',icon:'🏡',start:64,end:100,color:'orange'},
 {name:'概念星球',icon:'🪐',start:100,end:140,color:'green'},
 {name:'詞語城堡',icon:'🏰',start:140,end:vocab.length,color:'purple'}
];

let state=load(ASSESS_KEY,{index:0,answers:[],started:false,finished:false});
if(!Array.isArray(state.answers))state.answers=[];
let learning=load(LEARN_KEY,{stars:0,known:{},mistakes:{},sessions:0,custom:[],dailyDates:[]});
learning.known=learning.known||{};learning.mistakes=learning.mistakes||{};learning.custom=learning.custom||[];learning.dailyDates=learning.dailyDates||[];
let route='home',chosen=null,practice=null,recognition=null,recognizedText='',speechRuleIndexOverride=null,handwritingIndex=0,dictationSession=null;
const saveState=()=>persist(ASSESS_KEY,state),saveLearning=()=>persist(LEARN_KEY,learning);

function updateChrome(label=route){
 statusEl.textContent=label==='home'?'探險基地':label;
 starEl.textContent=learning.stars||0;
 dock.querySelectorAll('button').forEach(b=>b.classList.toggle('active',b.dataset.route===route));
 dock.classList.toggle('hidden',route==='assessment'||route==='practice'||route==='home');
}
function toast(message){const el=document.getElementById('toast');el.textContent=message;el.classList.add('show');clearTimeout(toast.timer);toast.timer=setTimeout(()=>el.classList.remove('show'),2600)}
function confetti(){const box=document.getElementById('celebration');box.innerHTML=Array.from({length:30},(_,i)=>`<i style="left:${(i*37)%100}%;animation-delay:${(i%8)*.06}s">${['⭐','✨','🎉','🟣','🟡','🟢'][i%6]}</i>`).join('');setTimeout(()=>box.innerHTML='',2100)}
function feedback(text,good=true){const el=document.createElement('div');el.className='feedback';el.textContent=(good?'🌟 ':'💡 ')+text;document.body.appendChild(el);if(good)confetti();setTimeout(()=>el.remove(),1100)}
function scrollTop(){window.scrollTo({top:0,behavior:'smooth'})}
function today(){return new Intl.DateTimeFormat('en-CA',{timeZone:'Asia/Hong_Kong'}).format(new Date())}
function speak(text){
 if(window.ZiziVoice){window.ZiziVoice.speak(text,{role:'narrator'});return}
 if(!('speechSynthesis'in window)){toast('呢個瀏覽器未能讀題，請家長幫忙讀出。');return}
 speechSynthesis.cancel();const u=new SpeechSynthesisUtterance(text);u.lang='zh-HK';u.rate=.82;u.pitch=1.05;
 const voices=speechSynthesis.getVoices();u.voice=voices.find(v=>v.lang.toLowerCase()==='zh-hk')||voices.find(v=>/cantonese|hong kong|粵語/i.test(v.name))||null;
 speechSynthesis.speak(u);if(!u.voice)toast('裝置未有廣東話語音，讀音可能唔準確。');
}
function enterLearningScene(kind,title){
 document.body.classList.add('realm-learning');document.body.dataset.learning=kind;
 const section=root.querySelector('section');if(!section)return;section.classList.add('learning-arena',`learning-${kind}`);
 section.insertAdjacentHTML('afterbegin',`<div class="learning-world" aria-hidden="true"><i></i><i></i><i></i><div class="learning-spirit">${({speech:'🎙️',write:'✍️',dictation:'📜',words:'🔤',daily:'🎯',assessment:'🏆',parent:'🏡'})[kind]||'✨'}</div><div class="learning-world-title">${title}</div></div>`);
}

function go(next){if(recognition){try{recognition.abort()}catch{}recognition=null}if(next!=='home')window.ZiziGame?.unmount?.();route=next;updateChrome();({home:renderHome,map:renderMap,daily:renderDaily,parent:renderParent}[next]||renderHome)();scrollTop()}
document.getElementById('brandHome').onclick=()=>go('home');
dock.querySelectorAll('button').forEach(b=>b.onclick=()=>go(b.dataset.route));

function renderHome(){
 if(window.ZiziGame)return window.ZiziGame.mount();
 updateChrome('home');const remaining=Math.max(0,50-state.answers.length),dailyDone=learning.dailyDates.includes(today());
 root.innerHTML=`
 <section class="hero">
  <div><span class="hero-badge">今日探險任務</span><h1>你好，文字探險家！</h1><p>同阿字一齊穿過森林、解開詞語謎題，逐步儲齊中文超能力。</p>
  <div class="actions"><button class="btn mint" id="heroDaily">${dailyDone?'再玩每日任務':'出發做每日任務'}</button><button class="btn ghost" id="heroMap">打開冒險地圖</button></div></div>
  <div class="hero-character" aria-label="探險狐狸阿字正在揮手"><span class="hero-spark">✨</span><span class="fox-emoji">🦊</span><span class="character-callout">一齊出發！</span></div>
 </section>
 <div class="section-head"><h2>今日任務</h2><span class="muted tiny">${dailyDone?'已完成，叻叻！':'約 5 分鐘'}</span></div>
 <div class="quest-strip"><div class="qicon">${dailyDone?'🏅':'🎯'}</div><div><b>${dailyDone?'今日寶箱已打開':'完成 5 個認字挑戰'}</b><div class="muted tiny">${dailyDone?'明日再有新任務，亦可以繼續練習。':'完成可獲星星，錯題會自動加入複習。'}</div></div><button class="btn ${dailyDone?'secondary':'mint'}" id="dailyBtn">${dailyDone?'再玩':'開始'}</button></div>
 <div class="section-head"><h2>選擇冒險</h2></div>
 <div class="mission-grid">
  <button class="mission purple" id="assess"><span class="mission-icon">🏆</span><b>50 題能力大冒險</b><small>${state.finished?'已完成，可查看報告':state.answers.length?`已完成 ${state.answers.length} 題，尚餘 ${remaining} 題`:'保留原有 50 題評估與進度'}</small></button>
  <button class="mission green" id="words"><span class="mission-icon">🗺️</span><b>認字冒險地圖</b><small>${Object.keys(learning.known).length} 個已練詞語 · 7 個世界</small></button>
  <button class="mission orange" id="speakHouse"><span class="mission-icon">🎙️</span><b>說話屋</b><small>iPhone 廣東話辨認、重試與家長後備評分</small></button>
 </div>
 <section class="card" style="margin-top:18px"><div class="install-note"><span>📲</span><div><b>可以加到 iPhone／iPad 主畫面</b><div class="muted tiny">用 Safari 開啟，按「分享」→「加入主畫面」，就可以像 App 一樣使用及離線開啟。</div></div></div></section>`;
 const daily=()=>go('daily');document.getElementById('heroDaily').onclick=daily;document.getElementById('dailyBtn').onclick=daily;document.getElementById('heroMap').onclick=()=>go('map');document.getElementById('words').onclick=()=>go('map');
 document.getElementById('assess').onclick=startAssessment;document.getElementById('speakHouse').onclick=renderSpeechLab;
}

function renderSpeechLab(){
 route='practice';speechRuleIndexOverride=10;updateChrome('說話屋');
 const supported=Boolean(window.SpeechRecognition||window.webkitSpeechRecognition);
 root.innerHTML=`<section class="card question-card speech-quest"><div class="question-top"><span class="route-label">🎙️ 回聲洞穴</span><b>聲音精靈試煉</b></div><div class="echo-orbs" aria-hidden="true"><i>♪</i><i>♫</i><i>♪</i></div><h1>叫醒蘋果聲音精靈</h1><p class="muted">望住圖案講出名稱，洞穴會用光圈回應。錄音唔會儲存。</p><div class="picture spirit-picture">🍎<span>✨</span></div><div class="mic-panel"><b>大聲講：「蘋果」</b><p class="muted tiny">第一次使用會詢問咪高峰權限。</p><button class="mic-button" id="micButton" aria-label="開始錄音">${supported?'🎙️':'👨‍👩‍👦'}</button><div class="transcript" id="transcript">${supported?'撳住聲音寶石開始':'此瀏覽器未提供語音辨認'}</div><p id="speechHint" class="muted tiny">辨認到關鍵詞，聲音精靈就會亮起。</p><button class="btn secondary hidden" id="retrySpeech">🔁 再召喚一次</button></div><div class="actions"><button class="btn" id="fullAssess">進入完整能力冒險</button><button class="btn secondary" id="speechHome">返回森境</button></div></section>`;
 enterLearningScene('speech','回聲洞穴');setupSpeaking();document.getElementById('fullAssess').onclick=()=>{speechRuleIndexOverride=null;startAssessment()};document.getElementById('speechHome').onclick=()=>{speechRuleIndexOverride=null;go('home')};
}

function renderHandwritingLab(){
 window.ZiziGame?.unmount?.();route='practice';updateChrome('手寫工房');
 const targets=['人','山','水','明','學'],target=targets[handwritingIndex%targets.length];
 root.innerHTML=`<section class="card question-card rune-workshop"><div class="question-top"><span class="route-label">✍️ 符文工房</span><b>第 ${handwritingIndex%targets.length+1} 枚符文</b></div><h1>畫出「${target}」字，注入字光</h1><p class="muted">每完成一筆，符文能量就會上升；可以重畫，唔影響 50 題評估。</p><button class="btn secondary speaker" id="playPrompt">🔊 聽守護字讀音</button><div class="rune-meter"><i id="runeEnergy"></i><span id="strokeCount">0 筆字光</span></div><div class="rune-pad"><canvas class="writing-pad" id="pad" width="760" height="300" aria-label="手寫符文區"></canvas></div><div class="actions"><button class="btn secondary" id="clearPad">清除符文</button><button class="btn ghost" id="showTarget">顯示守護字</button><button class="btn" id="sealRune">✨ 完成符文</button></div><p class="info hidden" id="target">守護字：<b>${target}</b></p><div class="actions"><button class="btn" id="anotherWord">下一枚符文</button><button class="btn secondary" id="writingAssess">完整能力冒險</button><button class="btn ghost" id="writingHome">返回森境</button></div></section>`;
 enterLearningScene('write','符文工房');setupCanvas();document.getElementById('playPrompt').onclick=()=>speak(`請寫${target}字。`);document.getElementById('sealRune').onclick=()=>{const strokes=Number(document.getElementById('pad').dataset.strokes||0);feedback(strokes?'符文亮起嚟啦！':'先畫幾筆，注入字光啦',Boolean(strokes));if(strokes){learning.stars=(learning.stars||0)+1;saveLearning();starEl.textContent=learning.stars}};document.getElementById('anotherWord').onclick=()=>{handwritingIndex++;renderHandwritingLab()};document.getElementById('writingAssess').onclick=()=>startAssessment();document.getElementById('writingHome').onclick=()=>go('home');
}

function renderDictationLab(){
 window.ZiziGame?.unmount?.();document.body.classList.add('realm-learning');route='practice';updateChrome('默書工房');
 const saved=(learning.dictationWords||['森林','樹木','溪水','明亮','伙伴','首先','然後','最後']).join('\n');
 root.innerHTML=`<section class="card question-card dictation-card"><span class="route-label">📜 寶箱默書</span><h1>把學校詞語放入寶箱</h1><p class="muted">每行輸入一個字、詞語或句子。開始後只會聽到廣東話，要寫啱先可以收集寶石。</p><div class="dictation-chest" aria-hidden="true">🧰<i>✨</i></div><div class="dictation-presets"><button data-dictation-preset="森林,樹木,花朵,溪水,明亮">🌿 森林寶箱</button><button data-dictation-preset="首先,然後,最後,旁邊,中間">🧭 次序寶箱</button><button data-dictation-preset="今天下雨,小明在公園跑步,妹妹正在喝水">📖 故事寶箱</button></div><textarea id="dictationWords" rows="7">${esc(saved)}</textarea><div class="actions"><button class="btn" id="startDictation">打開寶箱開始挑戰</button><button class="btn secondary" id="dictationHome">返回森境</button></div></section>`;
 enterLearningScene('dictation','寶箱默書');
 root.querySelectorAll('[data-dictation-preset]').forEach(b=>b.onclick=()=>document.getElementById('dictationWords').value=b.dataset.dictationPreset.split(',').join('\n'));document.getElementById('startDictation').onclick=()=>{const words=document.getElementById('dictationWords').value.split(/[\n,，]/).map(x=>x.trim()).filter(x=>x).slice(0,30);if(!words.length){toast('請先輸入默書內容');return}learning.dictationWords=words;saveLearning();dictationSession={words,index:0,right:0,retry:[]};renderDictationRound()};document.getElementById('dictationHome').onclick=()=>go('home');
}
function renderDictationRound(){
 if(dictationSession.index>=dictationSession.words.length){const s=dictationSession;learning.dictation=learning.dictation||{sessions:0,right:0,total:0,retry:[]};learning.dictation.sessions++;learning.dictation.right+=s.right;learning.dictation.total+=s.words.length;learning.dictation.retry=[...new Set([...(learning.dictation.retry||[]),...s.retry])].slice(-50);learning.stars=(learning.stars||0)+s.right;saveLearning();starEl.textContent=learning.stars;root.innerHTML=`<section class="card question-card dictation-card dictation-finish" style="text-align:center"><div class="dictation-chest open">🧰<i>✨</i></div><h1>寶箱打開咗！</h1><p class="prompt">收集到 ${s.right} / ${s.words.length} 顆字詞寶石</p><div class="word-cloud">${s.retry.length?s.retry.map(w=>`<span>${esc(w)}</span>`).join(''):'<span>全部完成，叻叻！</span>'}</div><div class="actions" style="justify-content:center"><button class="btn" id="dictationAgain">再開一個寶箱</button><button class="btn secondary" id="dictationFinish">返回森境</button></div></section>`;enterLearningScene('dictation','寶箱默書');document.getElementById('dictationAgain').onclick=renderDictationLab;document.getElementById('dictationFinish').onclick=()=>go('home');return}
 const word=dictationSession.words[dictationSession.index];root.innerHTML=`<section class="card question-card dictation-card dictation-battle"><div class="question-top"><span class="route-label">📜 寶箱默書</span><b>寶石 ${dictationSession.index+1} / ${dictationSession.words.length}</b></div><div class="progress"><span style="width:${dictationSession.index/dictationSession.words.length*100}%"></span></div><div class="dictation-lives">${Array.from({length:dictationSession.words.length},(_,i)=>`<i class="${i<dictationSession.index?'found':''}">◆</i>`).join('')}</div><h1>聽守護聲音，寫低答案</h1><button class="btn secondary speaker" id="hearDictation">🔊 再聽守護聲音</button><input id="dictationInput" class="dictation-input" autocomplete="off" autocorrect="off" placeholder="可以喺呢度輸入答案"><div class="rune-pad"><canvas class="writing-pad" id="pad" width="760" height="300" aria-label="默書手寫區"></canvas></div><div class="actions"><button class="btn secondary" id="clearPad">清除筆跡</button><button class="btn" id="revealDictation">🔐 開鎖睇答案</button></div><div id="dictationReveal" class="dictation-reveal hidden"><small>寶箱密語</small><b>${esc(word)}</b><div class="score-options"><button class="choice" data-dictation-score="right">💎 收集成功</button><button class="choice" data-dictation-score="retry">🗺️ 加入重溫地圖</button></div></div><button class="hidden" id="showTarget"></button><p class="hidden" id="target"></p></section>`;enterLearningScene('dictation','寶箱默書');setupCanvas();const read=()=>speak(word);document.getElementById('hearDictation').onclick=read;document.getElementById('revealDictation').onclick=()=>document.getElementById('dictationReveal').classList.remove('hidden');root.querySelectorAll('[data-dictation-score]').forEach(b=>b.onclick=()=>{if(b.dataset.dictationScore==='right')dictationSession.right++;else dictationSession.retry.push(word);dictationSession.index++;renderDictationRound()});setTimeout(read,250)
}

function renderMap(){
 updateChrome('冒險地圖');root.innerHTML=`<section class="card adventure-card"><div class="question-top"><div><span class="route-label">🗺️ 動畫冒險地圖</span><h1 style="margin:12px 0 4px">阿字等你帶路！</h1><p class="muted">由森林認字島出發，每站都有廣東話聽聲、找字同星星獎勵。</p></div><div class="map-compass" aria-hidden="true">🧭</div></div><div class="adventure-world" id="adventureWorld"><div class="map-sun" aria-hidden="true">☀️</div><div class="map-cloud cloud-one" aria-hidden="true">☁️</div><div class="map-cloud cloud-two" aria-hidden="true">☁️</div><div class="mountains" aria-hidden="true">⛰️</div><div class="forest-line" aria-hidden="true">🌲🌳🌲🌴🌳🌲🌳</div><div class="trail" aria-hidden="true"></div><div class="map-fox" id="mapFox" aria-label="阿字準備出發"><span>🦊</span><small>出發！</small></div><div class="map">${units.map((u,i)=>`<div class="map-node"><div class="node-copy"><b>${u.icon} ${u.name}</b><small>${u.end-u.start} 個詞語</small></div><button class="node-button" data-unit="${i}" aria-label="開始${u.name}">${i+1}<span class="node-stars" aria-hidden="true">${i===0?'★':'☆'}</span></button></div>`).join('')}</div></div><p class="tip map-tip">🌟 先試「森林認字島」：阿字會沿住小路跳去你揀嘅關卡。</p></section>`;
 enterLearningScene('words','字靈訓練地圖');root.querySelectorAll('[data-unit]').forEach(b=>b.onclick=()=>{const unitIndex=Number(b.dataset.unit),fox=document.getElementById('mapFox'),world=document.getElementById('adventureWorld');root.querySelectorAll('[data-unit]').forEach(x=>x.disabled=true);b.classList.add('chosen');world.style.setProperty('--fox-stop',`${Math.min(86,10+unitIndex*12)}%`);fox.classList.add('running');fox.querySelector('small').textContent=`去${units[unitIndex].name}！`;setTimeout(()=>startPractice(unitIndex,5,false),850)});
}

function dailyWords(){
 const seed=[...today()].reduce((a,c)=>a+c.charCodeAt(0),0),all=[...vocab,...learning.custom];
 return Array.from({length:5},(_,i)=>all[(seed+i*29)%all.length]);
}
function renderDaily(){
 updateChrome('每日任務');const done=learning.dailyDates.includes(today());
 root.innerHTML=`<section class="card question-card"><div class="hero" style="grid-template-columns:1fr auto"><div><span class="hero-badge">${done?'今日已完成':'連續小任務'}</span><h1>每日 5 分鐘</h1><p>今日會練 5 個詞語：聽清楚、認出佢、再記住佢。</p></div><div class="mascot" style="font-size:90px;min-height:130px">🎒</div></div><h2 style="margin-top:24px">今日詞語</h2><div class="word-cloud">${dailyWords().map(x=>`<span>${x}</span>`).join('')}</div><div class="actions"><button class="btn mint" id="beginDaily">${done?'再挑戰一次':'開始今日任務'}</button><button class="btn secondary" id="hearDaily">🔊 聽詞語</button></div><p class="tip" style="margin-top:20px">家長小貼士：每日短時間重複，比一次過做大量題目更容易建立記憶。</p></section>`;
 enterLearningScene('daily','每日伙伴任務');document.getElementById('beginDaily').onclick=()=>startPractice(0,5,true);document.getElementById('hearDaily').onclick=()=>speak(dailyWords().join('，'));
}

function startPractice(unitIndex=0,total=5,isDaily=false){
 const unit=units[unitIndex],pool=isDaily?dailyWords():vocab.slice(unit.start,unit.end);
 practice={unitIndex,pool,total,index:0,right:0,isDaily,words:Array.from({length:total},(_,i)=>pool[(learning.sessions*3+i)%pool.length])};learning.sessions=(learning.sessions||0)+1;saveLearning();route='practice';updateChrome('認字任務');renderPractice();
}
function renderPractice(){
 starEl.textContent=learning.stars||0;
 if(practice.index>=practice.total){finishPractice();return}
 const word=practice.words[practice.index],all=[...vocab,...learning.custom],alts=[];
 for(let n=1;alts.length<3;n++){const w=all[(all.indexOf(word)+n*17+practice.index*7)%all.length];if(w!==word&&!alts.includes(w))alts.push(w)}
 const choices=[word,...alts].sort((a,b)=>((a.charCodeAt(0)+practice.index*11)%9)-((b.charCodeAt(0)+practice.index*11)%9));
 root.innerHTML=`<section class="card question-card forest-level spirit-training"><div class="forest-canopy" aria-hidden="true"><span>🌿</span><span>🦋</span><span>🌿</span></div><div class="question-top"><span class="route-label">${practice.isDaily?'🎯 每日伙伴任務':units[practice.unitIndex].icon+' '+units[practice.unitIndex].name}</span><b>${practice.index+1} / ${practice.total}</b></div><div class="progress"><span style="width:${practice.index/practice.total*100}%"></span></div><div class="forest-guide"><span class="guide-fox" id="guideFox" aria-hidden="true">🦊</span><div><b>四隻詞語精靈飛出嚟啦！</b><small>聽清楚讀音，捉住正確嗰隻。</small></div></div><div class="prompt">聽聲，捉住正確詞語精靈</div><button class="btn secondary speaker" id="hearWord">🔊 召喚讀音</button><div class="answer-grid spirit-field">${choices.map((c,i)=>`<button class="choice word-spirit spirit-${i}" data-answer="${esc(c)}"><i>✦</i>${esc(c)}</button>`).join('')}</div><div class="actions"><button class="btn ghost" id="leavePractice">離開訓練場</button></div></section>`;
 enterLearningScene('words','字靈訓練場');document.getElementById('hearWord').onclick=()=>speak(word);document.getElementById('leavePractice').onclick=()=>go(practice.isDaily?'daily':'map');setTimeout(()=>speak(word),260);
 root.querySelectorAll('[data-answer]').forEach(b=>b.onclick=()=>{const right=b.dataset.answer===word,fox=document.getElementById('guideFox');root.querySelectorAll('[data-answer]').forEach(x=>{x.disabled=true;x.classList.toggle('correct',x.dataset.answer===word);x.classList.toggle('wrong',x===b&&!right)});fox.classList.add(right?'fox-cheer':'fox-think');if(right){practice.right++;learning.stars++;learning.known[word]=(learning.known[word]||0)+1}else learning.mistakes[word]=(learning.mistakes[word]||0)+1;saveLearning();feedback(right?'阿字跳起咗：搵到啦！':'阿字記低咗，下次再試',right);setTimeout(()=>{practice.index++;renderPractice();scrollTop()},1050)});
}
function finishPractice(){
 if(practice.isDaily&&!learning.dailyDates.includes(today()))learning.dailyDates=[...learning.dailyDates,today()].slice(-60);
 saveLearning();updateChrome('任務完成');confetti();root.innerHTML=`<section class="card question-card finish-scene" style="text-align:center"><div class="finish-fox" aria-label="阿字開心跳舞">🦊</div><div class="finish-stars" aria-hidden="true">✨ ⭐ ✨</div><h1>任務完成！</h1><p class="prompt">答啱 ${practice.right} / ${practice.total} 題</p><p class="muted">阿字同你一齊解鎖咗新嘅中文超能力！</p><div class="actions" style="justify-content:center"><button class="btn mint" id="again">再玩一次</button><button class="btn secondary" id="finishMap">返回冒險地圖</button><button class="btn ghost" id="finishHome">返回基地</button></div></section>`;document.getElementById('again').onclick=()=>startPractice(practice.unitIndex,practice.total,practice.isDaily);document.getElementById('finishMap').onclick=()=>go('map');document.getElementById('finishHome').onclick=()=>go('home');
}

function startAssessment(forcedIndex){
 if(Number.isInteger(forcedIndex)){state.index=forcedIndex;state.started=true}else if(state.finished){renderReport();return}else state.started=true;
 saveState();route='assessment';updateChrome('能力評估');renderAssessment();scrollTop();
}
function renderAssessment(){
 if(state.finished||state.index>=raw.length){state.finished=true;saveState();renderReport();return}
 if(state.index>0&&state.index%10===0&&state.breakSeen!==state.index){renderRest();return}
 const q=raw[state.index],type=q[0];chosen=null;recognizedText='';updateChrome(`${state.index+1} / 50`);
 const labels={聽:'👂 聽力雷達',說:'🎙️ 說話屋',讀:'🔤 認字島',理解:'🔎 閱讀偵探',寫:'✍️ 寫字工房'};
 let body=`<section class="card question-card"><div class="question-top"><span class="route-label">${labels[type]}</span><b>第 ${state.index+1} / 50 題</b></div><div class="progress"><span style="width:${state.index/50*100}%"></span></div>`;
 if(type==='聽')body+=`<div class="prompt">撳播放，聽清楚任務</div><button class="btn secondary speaker" id="playPrompt">🔊 播放／再聽一次</button><div class="answer-grid">${q[2].map((x,i)=>`<button class="choice" data-choice="${i}">${esc(x)}</button>`).join('')}</div>`;
 else if(type==='說')body+=speakingMarkup(q);
 else if(type==='寫')body+=writingMarkup(q);
 else body+=`<div class="prompt">${esc(q[1])}</div><button class="btn secondary speaker" id="playPrompt">🔊 廣東話讀題</button><div class="answer-grid">${q[2].map((x,i)=>`<button class="choice" data-choice="${i}">${esc(x)}</button>`).join('')}</div>`;
 body+=`<div class="assessment-path" aria-label="五個能力區域">${['聽力林','說話洞','認字島','理解塔','書寫殿'].map((x,i)=>`<span class="${Math.floor(state.index/10)===i?'here':Math.floor(state.index/10)>i?'done':''}">${i+1}<small>${x}</small></span>`).join('')}</div><div class="actions"><button class="btn" id="nextAssess" disabled>收集能力徽章，下一題 →</button><button class="btn secondary" id="pauseAssess">返回休息營地</button></div><p class="muted tiny">能力冒險唔會即時顯示答案，確保 50 題結果有效。</p></section>`;root.innerHTML=body;enterLearningScene('assessment','五域能力冒險');
 const play=document.getElementById('playPrompt');if(play)play.onclick=()=>speak(q[4]);
 root.querySelectorAll('[data-choice]').forEach(b=>b.onclick=()=>selectAssessmentChoice(b));
 document.getElementById('pauseAssess').onclick=()=>{state.started=false;saveState();go('home')};
 document.getElementById('nextAssess').onclick=saveAssessmentAnswer;
 if(type==='寫')setupCanvas();
 if(type==='說')setupSpeaking();
}
function selectAssessmentChoice(button){
 chosen=Number(button.dataset.choice);root.querySelectorAll('[data-choice]').forEach(x=>x.classList.toggle('selected',x===button));document.getElementById('nextAssess').disabled=false;
}
function saveAssessmentAnswer(){
 if(chosen===null)return;const q=raw[state.index],parent=q[0]==='說'||q[0]==='寫',score=parent?chosen:(chosen===q[3]?2:0);
 state.answers[state.index]={type:q[0],level:q[5],score,selected:chosen,...(q[0]==='說'?{transcript:recognizedText||''}:{})};state.index++;state.finished=state.index>=raw.length;saveState();feedback(score===2?'任務完成！':'已經記低答案',score===2);setTimeout(()=>{renderAssessment();scrollTop()},700);
}
function renderRest(){
 updateChrome('休息站');root.innerHTML=`<section class="card question-card"><div class="hero"><div><span class="hero-badge">休息站</span><h1>完成 ${state.index} 題！</h1><p>飲啖水、望下遠處，準備好先繼續，唔使急㗎。</p></div><div class="mascot">🦊🥤</div></div><div class="actions"><button class="btn mint" id="continueAssess">我準備好啦</button><button class="btn secondary" id="restHome">今日玩到呢度</button></div></section>`;document.getElementById('continueAssess').onclick=()=>{state.breakSeen=state.index;saveState();renderAssessment()};document.getElementById('restHome').onclick=()=>go('home');
}

const speechRules=[
 {groups:[['蘋果','生果']],simple:true},{groups:[['貓','貓咪','小貓']],simple:true},{groups:[['跑','跑步','跑緊']],simple:true},
 {groups:[['男仔','男孩','小朋友'],['睇書','看書','閱讀']]},{groups:[['女仔','女孩','小朋友'],['落雨','下雨'],['遮','雨傘','傘']]},
 {groups:[['書包','鉛筆','文具','功課','水樽','飯盒','課本','書'],['因為','所以','用嚟','需要']]},
 {groups:[['首先','先'],['然後','之後','跟住']]},{groups:[['扶','幫','協助','叫老師','關心'],['同學','佢']]}
];
function speakingMarkup(q){
 const supported=Boolean(window.SpeechRecognition||window.webkitSpeechRecognition);
 return `<div class="prompt">${esc(q[1])}</div><div class="picture">${esc(q[2][0])}</div><button class="btn secondary speaker" id="playPrompt">🔊 廣東話讀題</button>
 <div class="mic-panel"><b>小朋友自己講，講完等一等</b><p class="muted tiny">第一次使用會詢問咪高峰權限。請在安靜環境、靠近 iPhone 講話。</p>
 <button class="mic-button" id="micButton" aria-label="開始錄音">${supported?'🎙️':'👨‍👩‍👦'}</button><div class="transcript" id="transcript">${supported?'撳咪高峰開始':'此瀏覽器未提供語音辨認'}</div><p id="speechHint" class="muted tiny">${supported?'辨認只用來核對講咗乜，唔能夠可靠判斷粵語聲調或發音準確度。':'仍然可以由家長聽完後評分。'}</p><button class="btn secondary hidden" id="retrySpeech">🔁 再講一次</button></div>
 <div id="parentScore"><h3 style="margin-top:22px">家長確認評分</h3><p class="tip">語音辨認可能聽錯兒童聲音。請以實際聽到嘅答案為準：獨立清楚完成＝2；部分正確／少量提示＝1；未能完成＝0。</p><div class="score-options">${scoreButtons()}</div></div>`;
}
function writingMarkup(q){return `<div class="prompt">${esc(q[1])}</div><button class="btn secondary speaker" id="playPrompt">🔊 廣東話讀題</button><p class="tip">請小朋友先自己寫。家長需要時先揭曉目標字。</p><canvas class="writing-pad" id="pad" width="760" height="260" aria-label="手寫區"></canvas><div class="actions"><button class="btn secondary" id="clearPad">清除筆跡</button><button class="btn ghost" id="showTarget">家長查看目標字</button></div><p class="info hidden" id="target">目標：<b>${esc(q[2][0])}</b></p><h3 style="margin-top:22px">家長評分</h3><div class="score-options">${scoreButtons()}</div>`}
function scoreButtons(){return `<button class="choice" data-choice="2">🌟<br>獨立完成<br><small>2 分</small></button><button class="choice" data-choice="1">🙂<br>部分完成<br><small>1 分</small></button><button class="choice" data-choice="0">💡<br>暫時未識<br><small>0 分</small></button>`}

async function requestMicPermission(){
 if(!navigator.mediaDevices?.getUserMedia)return false;
 try{const stream=await navigator.mediaDevices.getUserMedia({audio:true});stream.getTracks().forEach(t=>t.stop());return true}
 catch(err){const hint=document.getElementById('speechHint');if(hint)hint.textContent=err?.name==='NotAllowedError'?'咪高峰權限未開啟。請到 iPhone「設定 → Safari → 咪高峰」允許，再重新載入。':'未能開啟咪高峰，請檢查權限後重試。';return false}
}
function normaliseSpeech(s){return String(s).toLowerCase().replace(/[，。！？、,.!?\s]/g,'').replace(/苹果/g,'蘋果').replace(/猫/g,'貓').replace(/看书/g,'睇書').replace(/下雨/g,'落雨').replace(/雨伞/g,'雨傘')}
function analyseSpeech(text,index){
 const rule=speechRules[index-10],value=normaliseSpeech(text);if(!rule)return{score:1,message:'請家長核對內容。'};
 const hits=rule.groups.filter(group=>group.some(k=>value.includes(normaliseSpeech(k)))).length;
 if(rule.simple&&hits===1)return{score:2,message:'辨認到關鍵答案，請家長聽一次再確認。'};
 if(hits===rule.groups.length)return{score:2,message:'辨認到主要內容，請家長核對句子是否自然完整。'};
 if(hits>0)return{score:1,message:'辨認到部分內容，請家長決定係部分完成定完整完成。'};
 return{score:0,message:'未能配對到關鍵內容，可以再講一次，或者由家長直接評分。'};
}
function setupSpeaking(){
 const mic=document.getElementById('micButton'),retry=document.getElementById('retrySpeech');if(!mic)return;
 mic.onclick=startRecognition;if(retry)retry.onclick=startRecognition;
}
async function startRecognition(){
 const Ctor=window.SpeechRecognition||window.webkitSpeechRecognition,mic=document.getElementById('micButton'),out=document.getElementById('transcript'),hint=document.getElementById('speechHint'),retry=document.getElementById('retrySpeech');
 if(!Ctor){hint.textContent='iOS／瀏覽器未提供 Web Speech 辨認；請家長直接評分。';document.getElementById('parentScore').scrollIntoView({behavior:'smooth'});return}
 mic.disabled=true;out.textContent='正在準備咪高峰…';if(!(await requestMicPermission())){mic.disabled=false;retry.classList.remove('hidden');return}
 try{
  recognition=new Ctor();recognition.lang='zh-HK';recognition.continuous=false;recognition.interimResults=false;recognition.maxAlternatives=5;
  recognition.onstart=()=>{mic.disabled=false;mic.classList.add('listening');mic.textContent='⏹️';out.textContent='聽緊…講完可以等一等';hint.textContent='正在辨認廣東話內容。'};
  recognition.onresult=e=>{const alternatives=Array.from(e.results[0]||[]).map(x=>x.transcript).filter(Boolean);recognizedText=alternatives[0]||'';out.textContent=recognizedText?`辨認到：「${recognizedText}」`:'未聽清楚';const result=analyseSpeech(alternatives.join(' '),speechRuleIndexOverride??state.index);hint.textContent=result.message;retry.classList.remove('hidden');const suggested=root.querySelector(`[data-choice="${result.score}"]`);if(suggested){root.querySelectorAll('[data-choice]').forEach(x=>x.classList.remove('selected'));suggested.classList.add('selected')}};
  recognition.onerror=e=>{const map={'no-speech':'未聽到說話，請靠近咪高峰再試。','audio-capture':'未能使用咪高峰，請檢查權限。','not-allowed':'咪高峰或語音辨認權限被拒絕，請在設定允許。','network':'語音辨認服務暫時連線唔到；可以重試或由家長評分。'};out.textContent=map[e.error]||'今次未能辨認，可以再試。';hint.textContent='毋須卡住：家長可以直接聽小朋友答案並評分。';retry.classList.remove('hidden')};
  recognition.onend=()=>{mic.classList.remove('listening');mic.textContent='🎙️';mic.disabled=false;recognition=null};
  recognition.start();
 }catch{out.textContent='未能啟動語音辨認。';hint.textContent='請重新載入後再試，或者由家長直接評分。';mic.disabled=false;retry.classList.remove('hidden')}
}

function setupCanvas(){
 const c=document.getElementById('pad'),ctx=c.getContext('2d');ctx.lineWidth=7;ctx.strokeStyle='#273959';ctx.lineCap='round';ctx.lineJoin='round';let down=false,strokes=0;c.dataset.strokes='0';
 const pos=e=>{const r=c.getBoundingClientRect();return{x:(e.clientX-r.left)*c.width/r.width,y:(e.clientY-r.top)*c.height/r.height}};
 c.onpointerdown=e=>{down=true;c.setPointerCapture(e.pointerId);const p=pos(e);ctx.beginPath();ctx.moveTo(p.x,p.y)};
 c.onpointermove=e=>{if(!down)return;const p=pos(e);ctx.lineTo(p.x,p.y);ctx.stroke()};c.onpointerup=e=>{if(!down)return;down=false;strokes++;c.dataset.strokes=String(strokes);const count=document.getElementById('strokeCount'),energy=document.getElementById('runeEnergy');if(count)count.textContent=`${strokes} 筆字光`;if(energy)energy.style.width=`${Math.min(100,strokes*20)}%`};c.onpointercancel=()=>down=false;
 document.getElementById('clearPad').onclick=()=>{ctx.clearRect(0,0,c.width,c.height);strokes=0;c.dataset.strokes='0';const count=document.getElementById('strokeCount'),energy=document.getElementById('runeEnergy');if(count)count.textContent='0 筆字光';if(energy)energy.style.width='0%'};document.getElementById('showTarget').onclick=()=>document.getElementById('target').classList.remove('hidden');
}

function summaries(){
 const labels={聽:'聽力理解',說:'口語表達',讀:'認字詞義',理解:'句子與題目理解',寫:'書寫能力'};
 return Object.keys(labels).map(type=>{const a=state.answers.filter(x=>x?.type===type),max=a.length*2,score=a.reduce((s,x)=>s+(Number(x.score)||0),0);return{type,label:labels[type],score,max,pct:max?Math.round(score/max*100):0}});
}
function renderReport(){
 route='assessment';updateChrome('能力報告');const rows=summaries(),weak=[...rows].filter(x=>x.max&&x.pct<65).sort((a,b)=>a.pct-b.pct);
 root.innerHTML=`<section class="card question-card"><div class="hero"><div><span class="hero-badge">探險報告</span><h1>完成 50 題！</h1><p>以下係今次任務嘅學習起點參考，唔係臨床診斷或年級常模。</p></div><div class="mascot">🏆🦊</div></div><h2 style="margin-top:26px">能力分項</h2><div class="report-grid">${rows.map(x=>`<div class="report-item"><div class="question-top"><b>${x.label}</b><span>${x.score} / ${x.max}</span></div><div class="bar"><i style="width:${x.pct}%"></i></div><small class="muted">${x.pct}%</small></div>`).join('')}</div><p class="tip" style="margin-top:20px"><b>建議先練：</b>${weak.length?weak.slice(0,2).map(x=>x.label).join('、'):'各範疇循序練習'}。每日 5–10 分鐘，先複習熟悉詞語，再學少量新詞。</p><p class="info"><b>說話分數說明：</b>語音辨認只協助顯示可能講咗乜；最終仍由家長確認。此 App 沒有可靠評估粵語聲調或發音準確度。</p><div class="actions"><button class="btn" id="downloadReport">下載文字報告</button><button class="btn secondary" id="reportHome">返回基地</button><button class="btn coral" id="resetAssess">重新評估</button></div></section>`;
 document.getElementById('downloadReport').onclick=downloadReport;document.getElementById('reportHome').onclick=()=>go('home');document.getElementById('resetAssess').onclick=resetAssessment;
}
function downloadReport(){
 const text=`字字探險隊｜能力評估\n日期：${new Date().toLocaleDateString('zh-HK')}\n完成題數：${state.answers.length}\n${summaries().map(x=>`${x.label}：${x.score}/${x.max}（${x.pct}%）`).join('\n')}\n\n注意：本工具不是標準化診斷；說話及書寫由家長確認評分，語音辨認不評估粵語聲調。\n`;downloadBlob('字字探險隊_評估報告.txt','\ufeff'+text,'text/plain;charset=utf-8');
}
function resetAssessment(){if(!confirm('確定清除 50 題評估答案並重新開始？認字樂園進度唔會受影響。'))return;state={index:0,answers:[],started:false,finished:false};saveState();go('home')}
function downloadBlob(name,content,type){const a=document.createElement('a');a.href=URL.createObjectURL(new Blob([content],{type}));a.download=name;a.click();setTimeout(()=>URL.revokeObjectURL(a.href),1200)}

function renderParent(){
 updateChrome('家長中心');const missed=Object.entries(learning.mistakes).sort((a,b)=>b[1]-a[1]).slice(0,12);
 root.innerHTML=`<section class="card"><span class="route-label">👨‍👩‍👦 家長中心</span><h1 style="margin:14px 0 5px">學習概況</h1><p class="muted">所有資料只保存在呢部裝置，唔會上傳小朋友錄音。</p><div class="report-grid"><div class="report-item"><b>⭐ ${learning.stars}</b><div class="muted tiny">累積星星</div></div><div class="report-item"><b>📚 ${Object.keys(learning.known).length}</b><div class="muted tiny">練過嘅詞語</div></div><div class="report-item"><b>🎮 ${learning.sessions}</b><div class="muted tiny">遊戲局數</div></div><div class="report-item"><b>🎯 ${learning.dailyDates.length}</b><div class="muted tiny">完成每日任務日數</div></div></div><h2 style="margin-top:26px">需要再見面嘅詞語</h2><div class="word-cloud">${missed.length?missed.map(([w,n])=>`<span>${esc(w)} · ${n}</span>`).join(''):'<span>暫時未有錯題</span>'}</div><h2 style="margin-top:26px">加入學校詞語</h2><textarea id="customWords" placeholder="每行一個詞語，例如：&#10;郊遊&#10;圖書館"></textarea><div class="actions"><button class="btn" id="addWords">加入詞庫</button><button class="btn secondary" id="backup">備份全部進度</button><button class="btn secondary" id="importBackup">還原備份</button><input type="file" id="backupFile" accept="application/json" class="hidden"></div><h2 style="margin-top:28px">關於說話屋</h2><p class="info">iPhone 上的 Web Speech API 可用性會因 iOS 版本、Safari 設定及網絡而異，對兒童廣東話亦可能聽錯。本 App 只用辨認文字做關鍵詞提示，唔會聲稱可靠評估聲調或咬字。若日後需要真正發音評估，應另設經驗證的後端語音模型、取得家長同意，並制定錄音保留與私隱安排。</p></section>`;
 document.getElementById('addWords').onclick=()=>{const words=document.getElementById('customWords').value.split(/[,，\n]/).map(x=>x.trim()).filter(x=>x&&x.length<=12);learning.custom=[...new Set([...learning.custom,...words])].slice(0,100);saveLearning();toast(`已加入 ${words.length} 個詞語`)};
 document.getElementById('backup').onclick=()=>downloadBlob('zizi-backup.json',JSON.stringify({version:2,assessment:state,learning,date:new Date().toISOString()},null,2),'application/json');
 document.getElementById('importBackup').onclick=()=>document.getElementById('backupFile').click();document.getElementById('backupFile').onchange=importBackup;
}
function importBackup(e){const file=e.target.files?.[0];if(!file)return;const reader=new FileReader();reader.onload=()=>{try{const data=JSON.parse(reader.result);if(!data.assessment||!data.learning)throw new Error();state={...state,...data.assessment};learning={...learning,...data.learning};saveState();saveLearning();toast('進度已還原');renderParent()}catch{toast('呢個備份檔案格式唔正確')}};reader.readAsText(file)}

window.addEventListener('beforeinstallprompt',e=>e.preventDefault());
if('serviceWorker'in navigator&&location.protocol.startsWith('http'))window.addEventListener('load',()=>navigator.serviceWorker.register('./sw.js').then(reg=>reg.update()).catch(()=>{}));
window.speechSynthesis?.addEventListener?.('voiceschanged',()=>{});
const requested=new URLSearchParams(location.search).get('go');
if(requested==='daily')go('daily');else if(requested==='assessment')startAssessment();else go('home');
