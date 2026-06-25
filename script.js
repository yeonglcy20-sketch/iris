const SHEET_ID='16d85KZSBTErd9wFSaLMztskl86aJlwlchABFwcXv0i8';
const SHEET_NAME='시트1';
const csvUrl=`https://docs.google.com/spreadsheets/d/${SHEET_ID}/gviz/tq?tqx=out:csv&sheet=${encodeURIComponent(SHEET_NAME)}`;

const listEl=document.getElementById('list');
const searchInput=document.getElementById('searchInput');
let data=[];

fetch(csvUrl)
.then(r=>r.text())
.then(csv=>{
  data=parseCSV(csv);
  render(data);
})
.catch(err=>{
  listEl.innerHTML='<div class="empty">데이터를 불러오지 못했습니다.<br>스프레드시트 공유 설정을 확인해주세요.</div>';
  console.error(err);
});

function parseCSV(csv){
  const rows=csv.trim().split('\n').map(row =>
    row.match(/(".*?"|[^",]+)(?=\s*,|\s*$)/g)?.map(cell =>
      cell.replace(/^"|"$/g,'').replace(/""/g,'"').trim()
    ) || []
  );
  const headers=rows.shift() || [];
  return rows.map(row=>{
    const obj={};
    headers.forEach((h,i)=>{ obj[h]=row[i] || ''; });
    return obj;
  });
}

function isVisibleValue(value){
  const v=String(value ?? '').trim();
  return v !== '' && v !== '0';
}

function render(items){
  listEl.innerHTML='';
  let visibleCount=0;

  items.forEach(item=>{
    const first=Object.keys(item)[0];
    const title=String(item[first] ?? '').trim();

    const visibleRows=Object.entries(item)
      .slice(1)
      .filter(([key,value])=>isVisibleValue(value));

    if(!title || visibleRows.length===0) return;

    const div=document.createElement('div');
    div.className='item';
    div.innerHTML =
      `<div class="item-title">🐾 ${title}</div>`+
      visibleRows.map(([k,v])=>`<div class="item-row"><b>${k}</b> : ${v}</div>`).join('');

    listEl.appendChild(div);
    visibleCount++;
  });

  if(visibleCount===0){
    listEl.innerHTML='<div class="empty">표시할 데이터가 없습니다.</div>';
  }
}

searchInput.addEventListener('input',()=>{
  const q=searchInput.value.toLowerCase().trim();
  const filtered=data.filter(item =>
    Object.values(item).some(value =>
      String(value).toLowerCase().includes(q)
    )
  );
  render(filtered);
});
