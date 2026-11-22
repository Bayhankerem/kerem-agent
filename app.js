const form=document.getElementById('chatForm');
const input=document.getElementById('prompt');
const messages=document.getElementById('messages');
const welcome=document.getElementById('welcome');
const statusLine=document.getElementById('status');
function addMessage(text,who){const el=document.createElement('div');el.className='message '+who;el.textContent=text;messages.appendChild(el);el.scrollIntoView({behavior:'smooth',block:'end'});}
function demoReply(text){
  const t=text.toLocaleLowerCase('tr-TR');
  if(t.includes('merhaba')||t.includes('selam')) return 'Merhaba! Ben Kerem Agent. Şu anda ilk sürümümdeyim. Yapay zekâ bağlantısı eklendiğinde sorularını gerçek bir dil modeliyle yanıtlayabileceğim.';
  if(t.includes('adın')||t.includes('ismin')) return 'Benim adım Kerem Agent! Kişisel yapay zekâ asistanın olmak için hazırlanıyorum.';
  if(t.includes('saat')) return 'Cihazının yerel saati: '+new Date().toLocaleTimeString('tr-TR',{hour:'2-digit',minute:'2-digit'})+'.';
  if(t.includes('tarih')||t.includes('bugün')) return 'Bugünün tarihi: '+new Date().toLocaleDateString('tr-TR')+'.';
  return 'Mesajını aldım: "'+text+'"\n\nBu şu an arayüzün deneme modu. Henüz gerçek bir yapay zekâ modeline bağlı değilim. Sonraki aşamada ücretsiz/açık kaynak bir model bağlantısı ekleyeceğiz.';
}
form.addEventListener('submit',e=>{e.preventDefault();const text=input.value.trim();if(!text)return;welcome.style.display='none';addMessage(text,'user');input.value='';input.style.height='auto';setTimeout(()=>addMessage(demoReply(text),'agent'),350);});
input.addEventListener('input',()=>{input.style.height='auto';input.style.height=Math.min(input.scrollHeight,130)+'px';});
document.querySelectorAll('.suggestion').forEach(b=>b.addEventListener('click',()=>{input.value=b.textContent.replace(/^.{1,3}/,'').trim();form.requestSubmit();}));
document.getElementById('newChat').addEventListener('click',()=>{messages.innerHTML='';welcome.style.display='block';document.getElementById('sidebar').classList.remove('open');});
document.getElementById('menuBtn').addEventListener('click',()=>document.getElementById('sidebar').classList.toggle('open'));
document.getElementById('memoryButton').addEventListener('click',()=>alert('Hafıza sistemi sonraki sürümde eklenecek.'));
const mic=document.getElementById('micBtn');
const SpeechRecognition=window.SpeechRecognition||window.webkitSpeechRecognition;
if(SpeechRecognition){mic.addEventListener('click',()=>{const rec=new SpeechRecognition();rec.lang='tr-TR';rec.interimResults=false;mic.classList.add('listening');statusLine.textContent='Dinliyorum...';rec.onresult=e=>{input.value=e.results[0][0].transcript;};rec.onerror=()=>{statusLine.textContent='Mikrofon kullanılamadı. İzinleri kontrol et.';};rec.onend=()=>{mic.classList.remove('listening');statusLine.textContent='Başlangıç sürümü · Yapay zekâ bağlantısı henüz eklenmedi';};rec.start();});}
else{mic.addEventListener('click',()=>alert('Bu tarayıcı ses tanımayı desteklemiyor. Chrome ile deneyebilirsin.'));}
if('serviceWorker' in navigator && location.protocol.startsWith('http')) navigator.serviceWorker.register('./sw.js').catch(()=>{});
