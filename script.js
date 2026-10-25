(() => {
  "use strict";
  const words = [
    {word:"baju", syllables:["ba","ju"], emoji:"👕", meaning:"Baju dipakai pada badan."},
    {word:"buku", syllables:["bu","ku"], emoji:"📚", meaning:"Buku digunakan untuk membaca."},
    {word:"sapu", syllables:["sa","pu"], emoji:"🧹", meaning:"Sapu digunakan untuk menyapu."},
    {word:"guli", syllables:["gu","li"], emoji:"🔵", meaning:"Guli ialah bebola kecil untuk bermain."},
    {word:"meja", syllables:["me","ja"], emoji:"🪑", meaning:"Meja digunakan untuk meletakkan barang."},
    {word:"mata", syllables:["ma","ta"], emoji:"👀", meaning:"Mata digunakan untuk melihat."},
    {word:"susu", syllables:["su","su"], emoji:"🥛", meaning:"Susu ialah minuman."},
    {word:"topi", syllables:["to","pi"], emoji:"🧢", meaning:"Topi dipakai di kepala."}
  ];
  const missions = {
    listen:{tag:"MISI 1",title:"Dengar dan Sebut",instruction:"Tekan butang dengar. Sebut perkataan dengan kuat, kemudian tandakan bahawa kamu sudah mencuba.",eyebrow:"KEMAHIRAN LISAN"},
    build:{tag:"MISI 2",title:"Cantum dan Baca",instruction:"Pilih suku kata pertama dan kedua untuk membentuk perkataan yang sepadan dengan gambar.",eyebrow:"KEMAHIRAN MEMBACA"},
    understand:{tag:"MISI 3",title:"Faham dan Pilih",instruction:"Baca perkataan dan pilih gambar yang betul.",eyebrow:"KEMAHIRAN KEFAHAMAN"}
  };
  const state = {
    mission:null,index:0,selectedFirst:null,selectedSecond:null,selectedAnswer:null,tried:false,checked:false,
    correct:0,attempts:0,stars:0,done:{listen:false,build:false,understand:false},
    stats:{listen:{correct:0,attempts:0},build:{correct:0,attempts:0},understand:{correct:0,attempts:0}},
    sound:true, currentOptions:[]
  };
  const $ = id => document.getElementById(id);
  const gamePanel=$("gamePanel"), resultsPanel=$("resultsPanel"), missionsSection=$("missions");
  const shuffle = arr => [...arr].sort(() => Math.random() - .5);
  function speak(text) {
    if(!state.sound) return;
    if(!("speechSynthesis" in window)) { setFeedback("Audio sintesis tidak tersedia dalam pelayar ini. Minta cikgu membaca perkataan ya.", ""); return; }
    window.speechSynthesis.cancel();
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "ms-MY";
    utterance.rate = 0.78;
    utterance.pitch = 1.12;
    const voices = window.speechSynthesis.getVoices();
    const msVoice = voices.find(v => /ms[-_]?my/i.test(v.lang)) || voices.find(v => /malay|melayu/i.test(v.name+" "+v.lang));
    if(msVoice) utterance.voice = msVoice;
    else {
      const femaleLike = voices.find(v => /female|woman|zira|samantha|aria|jenny/i.test(v.name));
      if(femaleLike) utterance.voice = femaleLike;
    }
    window.speechSynthesis.speak(utterance);
  }
  function setFeedback(text,type=""){const el=$("feedback");el.textContent=text;el.className="feedback"+(type?" "+type:"");}
  function updateProgress(){
    const completed=Object.values(state.done).filter(Boolean).length;
    $("progressText").textContent=`${completed} daripada 3 misi`;
    $("progressFill").style.width=(completed/3*100)+"%";
    $("totalStars").textContent=state.stars;
    Object.keys(state.done).forEach(key=>{
      $( "status-"+key).textContent=state.done[key]?"Selesai ✓":"Belum selesai";
    });
  }
  function openMission(key){
    state.mission=key;state.index=0;state.correct=0;state.attempts=0;state.selectedFirst=null;state.selectedSecond=null;state.selectedAnswer=null;state.tried=false;state.checked=false;
    state.currentOptions=[];
    resultsPanel.classList.add("hidden");missionsSection.classList.add("hidden");gamePanel.classList.remove("hidden");
    $("gameMissionTag").textContent=missions[key].tag;$("gameTitle").textContent=missions[key].title;
    $("gameInstruction").textContent=missions[key].instruction;$("gameEyebrow").textContent=missions[key].eyebrow;
    renderQuestion();gamePanel.scrollIntoView({behavior:"smooth",block:"start"});
  }
  function renderQuestion(){
    const key=state.mission, word=words[state.index];
    state.selectedFirst=null;state.selectedSecond=null;state.selectedAnswer=null;state.tried=false;state.checked=false;state.currentOptions=[];
    $("questionCounter").textContent=`${state.index+1} / ${words.length}`;
    setFeedback("");
    const content=$("gameContent");content.innerHTML="";
    if(key==="listen"){
      content.innerHTML=`<div class="word-visual">${word.emoji}</div><div class="word-label">${word.word}</div><p class="hint">Dengar sebutan perkataan ini.</p><div class="listen-controls"><button type="button" class="listen-button" id="playWord">🔊 Dengar perkataan</button><button type="button" class="tried-button" id="triedButton" aria-pressed="false">✓ Saya sudah sebut</button></div><p class="hint">Cuba sebut: ${word.syllables[0]} – ${word.syllables[1]}</p>`;
      $("playWord").addEventListener("click",()=>speak(word.word));
      $("triedButton").addEventListener("click",()=>{state.tried=!state.tried;$("triedButton").classList.toggle("selected",state.tried);$("triedButton").setAttribute("aria-pressed",String(state.tried));setFeedback(state.tried?"Bagus! Kamu sudah mencuba menyebut perkataan. Tekan “Selesai” untuk teruskan.":"Tidak mengapa, cuba sebut sekali lagi.");});
      $("checkButton").innerHTML='Selesai <span>✓</span>';
      $("repeatButton").classList.remove("hidden");
      speak(word.word);
    } else if(key==="build"){
      const firstOptions=shuffle([...new Set([word.syllables[0],...words.map(w=>w.syllables[0])])]).slice(0,4);
      const secondOptions=shuffle([...new Set([word.syllables[1],...words.map(w=>w.syllables[1])])]).slice(0,4);
      if(!firstOptions.includes(word.syllables[0]))firstOptions[0]=word.syllables[0];
      if(!secondOptions.includes(word.syllables[1]))secondOptions[0]=word.syllables[1];
      state.currentOptions={first:shuffle(firstOptions),second:shuffle(secondOptions)};
      content.innerHTML=`<div class="word-visual">${word.emoji}</div><p class="hint">Pilih suku kata yang betul.</p><div class="syllable-row"><div class="syllable-tile" id="firstTile">?</div><span class="plus-sign">+</span><div class="syllable-tile second" id="secondTile">?</div></div><div class="choice-grid" id="firstChoices"></div><p class="hint">Suku kata pertama</p><div class="choice-grid" id="secondChoices"></div><p class="hint">Suku kata kedua</p>`;
      addSyllableChoices("first",state.currentOptions.first,word);addSyllableChoices("second",state.currentOptions.second,word);
      $("checkButton").innerHTML='Semak jawapan <span>✓</span>';$("repeatButton").classList.remove("hidden");
    } else {
      const options=shuffle([word,...shuffle(words.filter(w=>w.word!==word.word)).slice(0,3)]);
      state.currentOptions=options;
      content.innerHTML=`<div class="word-label">${word.word}</div><p class="hint">Gambar manakah yang sepadan dengan perkataan ini?</p><div class="choice-grid" id="pictureChoices"></div>`;
      const grid=$("pictureChoices");
      options.forEach(option=>{
        const btn=document.createElement("button");btn.type="button";btn.className="choice-button";btn.dataset.word=option.word;
        btn.innerHTML=`<span class="choice-emoji">${option.emoji}</span>${option.word}`;
        btn.addEventListener("click",()=>{if(state.checked)return;state.selectedAnswer=option.word;grid.querySelectorAll("button").forEach(b=>b.classList.toggle("selected",b===btn));});
        grid.appendChild(btn);
      });
      $("checkButton").innerHTML='Semak jawapan <span>✓</span>';$("repeatButton").classList.remove("hidden");
      speak(word.word);
    }
  }
  function addSyllableChoices(which,options,word){
    const grid=$(which==="first"?"firstChoices":"secondChoices");
    options.forEach(syl=>{
      const btn=document.createElement("button");btn.type="button";btn.className="choice-button";btn.textContent=syl.toUpperCase();
      btn.addEventListener("click",()=>{
        if(state.checked)return;
        if(which==="first"){state.selectedFirst=syl;$("firstTile").textContent=syl.toUpperCase();}
        else{state.selectedSecond=syl;$("secondTile").textContent=syl.toUpperCase();}
        grid.querySelectorAll("button").forEach(b=>b.classList.toggle("selected",b===btn));
      });grid.appendChild(btn);
    });
  }
  function checkAnswer(){
    const key=state.mission, word=words[state.index];
    if(key==="listen"){
      if(!state.tried){setFeedback("Tekan “Saya sudah sebut” selepas kamu mencuba ya. 💗","bad");return;}
      state.checked=true;state.attempts++;state.stats.listen.attempts++;advanceQuestion();return;
    }
    let isCorrect=false;
    if(key==="build"){
      if(!state.selectedFirst||!state.selectedSecond){setFeedback("Pilih kedua-dua suku kata dahulu ya. 💗","bad");return;}
      isCorrect=state.selectedFirst===word.syllables[0]&&state.selectedSecond===word.syllables[1];
      $("firstTile").classList.toggle("correct",state.selectedFirst===word.syllables[0]);$("firstTile").classList.toggle("wrong",state.selectedFirst!==word.syllables[0]);
      $("secondTile").classList.toggle("correct",state.selectedSecond===word.syllables[1]);$("secondTile").classList.toggle("wrong",state.selectedSecond!==word.syllables[1]);
    } else {
      if(!state.selectedAnswer){setFeedback("Pilih satu gambar dahulu ya. 💗","bad");return;}
      isCorrect=state.selectedAnswer===word.word;
      $("pictureChoices").querySelectorAll("button").forEach(btn=>{if(btn.dataset.word===word.word)btn.classList.add("correct");else if(btn.dataset.word===state.selectedAnswer)btn.classList.add("wrong");});
    }
    state.attempts++;state.stats[key].attempts++;
    if(isCorrect){state.correct++;state.stats[key].correct++;state.stars+=1;setFeedback(`Hebat! Jawapan kamu betul. ${word.word.toUpperCase()}! ⭐`,"good");}
    else setFeedback(`Belum tepat. Jawapan yang betul ialah ${word.word.toUpperCase()}. Cuba ingat bunyi suku katanya!`,"bad");
    state.checked=true;$("checkButton").innerHTML=state.index===words.length-1?'Lihat keputusan <span>→</span>':'Perkataan seterusnya <span>→</span>';
    updateProgress();
  }
  function advanceQuestion(){
    if(state.index<words.length-1){state.index++;renderQuestion();}
    else showResults();
  }
  function nextAfterCheck(){
    if(!state.checked){checkAnswer();return;}
    advanceQuestion();
  }
  function showResults(){
    const key=state.mission;const stat=state.stats[key];
    state.done[key]=true;updateProgress();
    gamePanel.classList.add("hidden");resultsPanel.classList.remove("hidden");
    $("resultCorrect").textContent=key==="listen"?`${words.length}`:state.correct;
    $("resultAttempts").textContent=stat.attempts;
    $("resultPercent").textContent=key==="listen"?"—":`${stat.attempts?Math.round(stat.correct/stat.attempts*100):0}%`;
    $("resultMessage").textContent=key==="listen"?"Syabas kerana berlatih menyebut semua perkataan! Minta cikgu dengar sebutan kamu.":`Kamu berjaya menamatkan ${missions[key].title.toLowerCase()}. Terus berlatih, kamu semakin hebat!`;
    $("continueButton").textContent=Object.values(state.done).every(Boolean)?"Lihat peta pengembaraan ✓":"Kembali ke peta →";
    resultsPanel.scrollIntoView({behavior:"smooth",block:"center"});
  }
  $("checkButton").addEventListener("click",()=>{if(state.mission==="listen"){checkAnswer();return;}nextAfterCheck();});
  $("repeatButton").addEventListener("click",()=>{
    const word=words[state.index];
    if(state.mission==="build")speak(word.syllables[0]+"... "+word.syllables[1]+"... "+word.word);
    else speak(word.word);
  });
  $("startButton").addEventListener("click",()=>{missionsSection.scrollIntoView({behavior:"smooth",block:"start"});});
  $("howButton").addEventListener("click",()=>$("howDialog").showModal());
  $("closeHow").addEventListener("click",()=>$("howDialog").close());
  document.querySelectorAll("[data-mission]").forEach(btn=>btn.addEventListener("click",()=>openMission(btn.dataset.mission)));
  $("backButton").addEventListener("click",()=>{window.speechSynthesis?.cancel();gamePanel.classList.add("hidden");resultsPanel.classList.add("hidden");missionsSection.classList.remove("hidden");missionsSection.scrollIntoView({behavior:"smooth",block:"start"});});
  $("continueButton").addEventListener("click",()=>{resultsPanel.classList.add("hidden");missionsSection.classList.remove("hidden");missionsSection.scrollIntoView({behavior:"smooth",block:"start"});});
  $("soundToggle").addEventListener("click",()=>{state.sound=!state.sound;$("soundToggle").setAttribute("aria-pressed",String(state.sound));$("soundToggle").firstChild.textContent=state.sound?"🔊 ":"🔇 ";$("soundLabel").textContent=state.sound?"Suara":"Senyap";if(!state.sound)window.speechSynthesis?.cancel();});
  $("resetButton").addEventListener("click",()=>{
    if(!confirm("Mula semula permainan? Kemajuan dan bintang dalam sesi ini akan ditetapkan semula."))return;
    window.speechSynthesis?.cancel();state.index=0;state.mission=null;state.stars=0;state.done={listen:false,build:false,understand:false};state.stats={listen:{correct:0,attempts:0},build:{correct:0,attempts:0},understand:{correct:0,attempts:0}};
    gamePanel.classList.add("hidden");resultsPanel.classList.add("hidden");missionsSection.classList.remove("hidden");updateProgress();window.scrollTo({top:0,behavior:"smooth"});
  });
  if("speechSynthesis" in window)window.speechSynthesis.getVoices();
  updateProgress();
})();