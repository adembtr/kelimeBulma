// ---- Basit Depo (Local Storage) ----
const KEY = "kelime-notlari-v1";
/** @type {{id:string, word:string, sentence:string, meaning:string, created:number}[]} */
let items = [];

function load(){
  try{
    const raw = localStorage.getItem(KEY);
    items = raw ? JSON.parse(raw) : [];
  }catch(e){ items = []; }
}
function save(){
  localStorage.setItem(KEY, JSON.stringify(items));
}

// ---- Yardımcılar ----
const byId = s => document.getElementById(s);
function escapeRegExp(str){
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}
function sortItems(arr){
  return arr.sort((a,b)=>{
    const la = a.sentence.length, lb = b.sentence.length;
    if(la !== lb) return la - lb;                // kısa -> uzun
    return a.sentence.localeCompare(b.sentence, undefined, {sensitivity:'base'}); // eşitse alfabetik
  });
}
function uuid(){
  return Math.random().toString(36).slice(2, 9) + Date.now().toString(36).slice(-4);
}

// ---- Render ----
let listEl, emptyEl, countEl, searchEl, wordEl, meaningEl, sentenceEl;

function render(filterTerm=""){
  listEl.innerHTML = "";
  let data = [...items];

  // filtreleme: yalnızca CÜMLE içinde arar (büyük/küçük duyarsız)
  if(filterTerm.trim() !== ""){
    const q = filterTerm.trim();
    const rx = new RegExp(escapeRegExp(q), "gi");
    data = data.filter(x => rx.test(x.sentence));
  }

  data = sortItems(data);
  countEl.textContent = data.length ? `${data.length} sonuç` : "";

  if(data.length === 0){
    emptyEl.style.display = "block";
    return;
  } else {
    emptyEl.style.display = "none";
  }

  const q = filterTerm.trim();
  const rxHighlight = q ? new RegExp(escapeRegExp(q), "gi") : null;

  for(const it of data){
    const item = document.createElement("article");
    item.className = "item";

    // Cümle + vurgulama
    let sentenceHTML = it.sentence;
    if(rxHighlight){
      sentenceHTML = it.sentence.replace(rxHighlight, m => `<mark>${m}</mark>`);
    }

    item.innerHTML = `
      <div class="sent">${sentenceHTML}</div>
      <div class="meta">
        ${it.word ? `<span class="tag">Kelime: <strong>${it.word}</strong></span>` : ``}
        ${it.meaning ? `<span class="tag">Açıklama: ${it.meaning}</span>` : ``}
        <span class="actions">
          <button class="iconbtn danger" data-del="${it.id}" title="Sil">Sil</button>
        </span>
      </div>
    `;
    listEl.appendChild(item);
  }
}

// ---- Etkileşimler ve Başlatma ----
document.addEventListener("DOMContentLoaded", () => {
  listEl = byId("list"); emptyEl = byId("empty"); countEl = byId("count");
  searchEl = byId("search"); wordEl = byId("word");
  meaningEl = byId("meaning"); sentenceEl = byId("sentence");

  // İlk yükleme
  load();
  render();

  // Arama
  searchEl.addEventListener("input", () => {
    render(searchEl.value);
  });

  // Kaydet
  byId("saveBtn").addEventListener("click", () => {
    const sentence = sentenceEl.value.trim();
    const word = wordEl.value.trim();
    const meaning = meaningEl.value.trim();

    if(!sentence){
      sentenceEl.focus();
      sentenceEl.style.boxShadow = "0 0 0 3px rgba(239,68,68,.25)";
      setTimeout(()=> sentenceEl.style.boxShadow = "", 400);
      return;
    }

    items.push({
      id: uuid(),
      word,
      sentence,
      meaning,
      created: Date.now()
    });
    save();

    // formu temizle
    sentenceEl.value = "";
    wordEl.value = "";
    meaningEl.value = "";
    render(searchEl.value);
    sentenceEl.focus();
  });

  // Silme (event delegation)
  listEl.addEventListener("click", (e)=>{
    const btn = e.target.closest("button[data-del]");
    if(!btn) return;
    const id = btn.getAttribute("data-del");
    items = items.filter(x => x.id !== id);
    save();
    render(searchEl.value);
  });

  // Tümünü temizle
  byId("clearAllBtn").addEventListener("click", ()=>{
    if(confirm("Tüm kayıtlar silinsin mi? Bu işlem geri alınamaz.")){
      items = [];
      save();
      render(searchEl.value);
    }
  });
});
