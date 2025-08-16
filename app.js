// Fish Ranking demo (client-only).
// Notes:
// - Data loads from /data/fish.json in the same repo (works on GitHub Pages).
// - Voting persists to localStorage per browser (no shared backend).
// - "Hot" rank gives newer, high-score items a boost.

const listEl = document.getElementById("fish-list");
const statusEl = document.getElementById("status");

const sortHotBtn = document.getElementById("sortHot");
const sortScoreBtn = document.getElementById("sortScore");
const sortDateBtn = document.getElementById("sortDate");
const sortRandomBtn = document.getElementById("sortRandom");

let fishes = [];
let currentSort = "hot";

function timeSince(date) {
  const seconds = Math.floor((Date.now() - new Date(date).getTime()) / 1000);
  const intervals = [
    ["year", 31536000],
    ["month", 2592000],
    ["day", 86400],
    ["hour", 3600],
    ["minute", 60],
  ];
  for (const [label, sec] of intervals) {
    const count = Math.floor(seconds / sec);
    if (count >= 1) return `${count} ${label}${count>1?"s":""} ago`;
  }
  return "just now";
}

function hotScore(item) {
  // Simple "hot" ranking: score / (hours_since_post + 2)^1.8
  const hours = (Date.now() - new Date(item.date).getTime()) / 36e5;
  return item.score / Math.pow(hours + 2, 1.8);
}

function shuffle(arr) {
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

function getLocalScore(id) {
  const local = JSON.parse(localStorage.getItem("votes") || "{}");
  return local[id] ?? 0;
}
function setLocalScore(id, score) {
  const local = JSON.parse(localStorage.getItem("votes") || "{}");
  local[id] = score;
  localStorage.setItem("votes", JSON.stringify(local));
}

function render(items) {
  listEl.innerHTML = "";
  for (const f of items) {
    const card = document.createElement("article");
    card.className = "card";

    const img = document.createElement("img");
    img.className = "thumb";
    img.alt = f.title;
    img.loading = "lazy";
    img.src = f.img;
    card.appendChild(img);

    const body = document.createElement("div");
    body.className = "card-body";

    const title = document.createElement("div");
    title.className = "title";
    title.textContent = f.title;

    const meta = document.createElement("div");
    meta.className = "meta";
    const author = document.createElement("span");
    author.textContent = `by ${f.author}`;
    const date = document.createElement("span");
    date.textContent = `• ${timeSince(f.date)}`;
    const score = document.createElement("span");
    score.className = "score";
    const local = getLocalScore(f.id);
    score.textContent = `Score ${f.score + local}`;
    meta.append(author, date, score);

    const actions = document.createElement("div");
    actions.className = "actions";
    const up = document.createElement("button");
    up.className = "vote up";
    up.textContent = "▲ Upvote";
    up.onclick = () => {
      const v = getLocalScore(f.id) + 1;
      setLocalScore(f.id, v);
      score.textContent = `Score ${f.score + v}`;
      resort();
    };
    const down = document.createElement("button");
    down.className = "vote down";
    down.textContent = "▼ Downvote";
    down.onclick = () => {
      const v = getLocalScore(f.id) - 1;
      setLocalScore(f.id, v);
      score.textContent = `Score ${f.score + v}`;
      resort();
    };
    actions.append(up, down);

    body.append(title, meta, actions);
    card.appendChild(body);
    listEl.appendChild(card);
  }
}

function resort() {
  let items = fishes.map(f => ({...f, score: f.score + getLocalScore(f.id)}));
  if (currentSort === "hot") items.sort((a,b) => hotScore(b) - hotScore(a));
  else if (currentSort === "score") items.sort((a,b) => b.score - a.score);
  else if (currentSort === "date") items.sort((a,b) => new Date(b.date)-new Date(a.date));
  else if (currentSort === "random") items = shuffle(items);
  render(items);
}

async function loadData() {
  statusEl.textContent = "Loading fish…";
  try {
    const res = await fetch("data/fish.json", { cache: "no-store" });
    if (!res.ok) throw new Error("fetch failed");
    fishes = await res.json();
  } catch(e) {
    // Fallback demo data
    fishes = [
      {"id":"f1","title":"Neon Tetra","author":"Ava","score":128,"date":"2025-08-01T12:00:00Z","img":"https://placehold.co/600x400?text=Fish+1"},
      {"id":"f2","title":"Clownfish","author":"Sam","score":201,"date":"2025-08-10T09:30:00Z","img":"https://placehold.co/600x400?text=Fish+2"},
      {"id":"f3","title":"Betta Splendens","author":"Maya","score":96,"date":"2025-07-28T18:15:00Z","img":"https://placehold.co/600x400?text=Fish+3"},
      {"id":"f4","title":"Discus","author":"Noah","score":74,"date":"2025-08-12T14:10:00Z","img":"https://placehold.co/600x400?text=Fish+4"},
      {"id":"f5","title":"Guppy","author":"Leo","score":153,"date":"2025-07-30T08:00:00Z","img":"https://placehold.co/600x400?text=Fish+5"},
      {"id":"f6","title":"Zebra Danio","author":"Ella","score":45,"date":"2025-08-14T20:45:00Z","img":"https://placehold.co/600x400?text=Fish+6"},
      {"id":"f7","title":"Arowana","author":"Kai","score":310,"date":"2025-08-05T11:05:00Z","img":"https://placehold.co/600x400?text=Fish+7"},
      {"id":"f8","title":"Koi Carp","author":"Zoe","score":222,"date":"2025-08-03T07:25:00Z","img":"https://placehold.co/600x400?text=Fish+8"},
      {"id":"f9","title":"Angelfish","author":"Liam","score":88,"date":"2025-08-15T16:50:00Z","img":"https://placehold.co/600x400?text=Fish+9"}
    ];
  }
  statusEl.textContent = "";
  resort();
}

sortHotBtn.onclick = () => { currentSort = "hot"; resort(); };
sortScoreBtn.onclick = () => { currentSort = "score"; resort(); };
sortDateBtn.onclick = () => { currentSort = "date"; resort(); };
sortRandomBtn.onclick = () => { currentSort = "random"; resort(); };

loadData();
