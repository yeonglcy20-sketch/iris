const listEl = document.getElementById("list");
const statusEl = document.getElementById("status");
const searchInput = document.getElementById("searchInput");
const imageInput = document.getElementById("imageInput");
const imageBox = document.querySelector(".imageBox");
const heroImage = document.getElementById("heroImage");

let allCards = [];

imageInput.addEventListener("change", () => {
  const file = imageInput.files && imageInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = () => {
    heroImage.src = reader.result;
    imageBox.classList.add("hasImage");
  };
  reader.readAsDataURL(file);
});

google.charts.load("current", { packages: ["corechart"] });
google.charts.setOnLoadCallback(loadSheet);

function loadSheet() {
  const url =
    "https://docs.google.com/spreadsheets/d/" +
    SHEET_ID +
    "/gviz/tq?sheet=" +
    encodeURIComponent(SHEET_NAME) +
    "&tq=" +
    encodeURIComponent("select *");

  const query = new google.visualization.Query(url);
  query.send(handleQueryResponse);
}

function handleQueryResponse(response) {
  if (response.isError()) {
    statusEl.innerHTML =
      "스프레드시트 연동 실패<br>공유 설정을 '링크가 있는 모든 사용자 - 뷰어'로 바꿔주세요.";
    console.error(response.getMessage(), response.getDetailedMessage());
    return;
  }

  const table = response.getDataTable();
  allCards = tableToCards(table);
  statusEl.textContent = "";
  render(allCards);
}

function tableToCards(table) {
  const colCount = table.getNumberOfColumns();
  const rowCount = table.getNumberOfRows();

  const headers = [];
  for (let c = 0; c < colCount; c++) {
    headers.push(table.getColumnLabel(c) || "");
  }

  const cards = [];
  for (let r = 0; r < rowCount; r++) {
    const name = clean(table.getFormattedValue(r, 0));
    if (!name) continue;

    const rows = [];
    for (let c = 1; c < colCount; c++) {
      const key = clean(headers[c]);
      const value = clean(table.getFormattedValue(r, c));

      if (!key) continue;
      if (!isVisible(value)) continue;

      rows.push({ key, value });
    }

    if (rows.length > 0) {
      cards.push({ name, rows });
    }
  }

  return cards;
}

function clean(value) {
  return String(value ?? "").replace(/^"|"$/g, "").trim();
}

function isVisible(value) {
  const v = clean(value);
  return v !== "" && v !== "0";
}

function render(cards) {
  listEl.innerHTML = "";

  if (!cards.length) {
    listEl.innerHTML = '<div class="empty">표시할 데이터가 없습니다.</div>';
    return;
  }

  cards.forEach(card => {
    const div = document.createElement("article");
    div.className = "card";
    div.innerHTML =
      `<div class="name">🐾 ${escapeHtml(card.name)}</div>` +
      card.rows
        .map(row => `<div class="row"><b>${escapeHtml(row.key)}</b> : ${escapeHtml(row.value)}</div>`)
        .join("");

    listEl.appendChild(div);
  });
}

searchInput.addEventListener("input", () => {
  const q = searchInput.value.trim().toLowerCase();

  const filtered = allCards.filter(card => {
    const text =
      card.name +
      " " +
      card.rows.map(row => row.key + " " + row.value).join(" ");
    return text.toLowerCase().includes(q);
  });

  render(filtered);
});

function escapeHtml(text) {
  return String(text)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}
