import {readFile,writeFile,mkdir,access} from 'node:fs/promises';
import {createHash} from 'node:crypto';
import {fileURLToPath} from 'node:url';
import {dirname,join,relative} from 'node:path';

const root=join(dirname(fileURLToPath(import.meta.url)),'..');
const output=join(root,'assets/audio');
const key=process.env.AZURE_SPEECH_KEY;
const region=process.env.AZURE_SPEECH_REGION||'eastasia';
const dryRun=process.argv.includes('--dry-run');
const voices={narrator:'zh-HK-HiuMaanNeural',character:'zh-HK-WanLungNeural'};
const clean=text=>String(text||'').replace(/\\'/g,"'").replace(/\s+/g,' ').trim();
const quoted=source=>[...source.matchAll(/'([^'\\]*(?:\\.[^'\\]*)*)'/g)].map(m=>clean(m[1]));
const unique=items=>[...new Set(items.map(clean).filter(Boolean))];
const xml=text=>text.replace(/[<>&"']/g,c=>({'<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":'&apos;'}[c]));
const filename=(role,text)=>`${role}-${createHash('sha256').update(`${role}\0${text}`).digest('hex').slice(0,18)}.mp3`;

const app=await readFile(join(root,'app.js'),'utf8');
const game=await readFile(join(root,'game.js'),'utf8');
const rawBlock=app.match(/const raw=\[([\s\S]*?)\n\];/)?.[1]||'';
const assessmentPrompts=rawBlock.split('\n').map(line=>line.match(/,\d+,'([^']+)',\d+\],?$/)?.[1]).filter(Boolean);
const vocabBlock=app.match(/const vocab=\[([\s\S]*?)\];/)?.[1]||'';
const gradeBlock=app.match(/const gradeCurriculum=\{([\s\S]*?)\n\};/)?.[1]||'';
const dailyBlock=app.match(/const dailyBanks=\{([\s\S]*?)\n\};/)?.[1]||'';
const dailySay=[...dailyBlock.matchAll(/(?:say|hint):'([^']+)'/g)].map(m=>m[1]);
const gameSay=[...game.matchAll(/(?:say|spoken|hint|intro|s):'([^']+)'/g)].map(m=>m[1]);

const narrator=unique([
 ...assessmentPrompts,...quoted(vocabBlock),...quoted(gradeBlock),...dailySay,...gameSay,
 '左邊月亮，中間星星，右邊太陽。','先木，然後水，最後火。',
 '差少少！留意左邊、中間、右邊嘅位置，再試一次。','差少少！留意先、然後、最後嘅次序，再試一次。',
 '森林','樹木','花朵','溪水','明亮','伙伴','首先','然後','最後','旁邊','中間',
 '今天下雨','小明在公園跑步','妹妹正在喝水'
]);
const spiritNames=['芽團','小澄','燈豆','桃桃','羽墨','岩仔','月糰','風鈴','星芽'];
const treasureNames=['勇氣果','故事葉','字光石'];
const character=unique([
 '字光指住下一個發光草叢。','字光指住左上方符文台。','字光指住右上方神殿。','字光指住北面古門。',
 '字光已經連成路線，去發光草叢搵伙伴啦。',
 ...['木','葉','森','果','風','山','月','聲','星'].map(glyph=>`字光感應到「${glyph}」，跟住光線去收集。`),
 ...spiritNames.flatMap(name=>[`${name}出現咗。完成三個詞語，同佢做朋友。`,`${name}跟住阿字出發！`,...treasureNames.map(prize=>`打開寶箱得到${prize}！${name}跟住阿字出發。`)])
]);
const lines={narrator,character};

if(dryRun){
 console.log(JSON.stringify({region,voices,counts:{narrator:narrator.length,character:character.length},characters:narrator.join('').length+character.join('').length},null,2));
 process.exit(0);
}
if(!key)throw new Error('AZURE_SPEECH_KEY is required');
await mkdir(output,{recursive:true});

async function exists(path){try{await access(path);return true}catch{return false}}
async function synthesize(role,text){
 const name=filename(role,text),path=join(output,name);
 if(await exists(path))return name;
 const ssml=`<speak version="1.0" xml:lang="zh-HK"><voice name="${voices[role]}"><prosody rate="-6%">${xml(text)}</prosody></voice></speak>`;
 const response=await fetch(`https://${region}.tts.speech.microsoft.com/cognitiveservices/v1`,{
  method:'POST',headers:{'Ocp-Apim-Subscription-Key':key,'Content-Type':'application/ssml+xml','X-Microsoft-OutputFormat':'audio-24khz-48kbitrate-mono-mp3','User-Agent':'jayden-word-adventure'},body:ssml
 });
 if(!response.ok)throw new Error(`Azure TTS ${response.status}: ${await response.text()}`);
 await writeFile(path,Buffer.from(await response.arrayBuffer()));return name;
}
async function mapLimit(items,limit,worker){
 const results=new Array(items.length);let next=0;
 await Promise.all(Array.from({length:Math.min(limit,items.length)},async()=>{while(next<items.length){const i=next++;results[i]=await worker(items[i],i)}}));
 return results;
}
const manifest={version:1,generatedAt:new Date().toISOString(),region,voices,lines:{narrator:{},character:{}}};
for(const role of Object.keys(lines)){
 const files=await mapLimit(lines[role],4,(text,i)=>{console.log(`[${role}] ${i+1}/${lines[role].length} ${text}`);return synthesize(role,text)});
 lines[role].forEach((text,i)=>manifest.lines[role][text]=`./assets/audio/${files[i]}`);
}
await writeFile(join(output,'manifest.json'),`${JSON.stringify(manifest,null,2)}\n`);
console.log(`Generated ${Object.values(lines).flat().length} lines in ${relative(root,output)}`);
