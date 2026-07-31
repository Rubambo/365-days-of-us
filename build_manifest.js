const fs = require('fs');
const path = require('path');

const csv = fs.readFileSync(path.join(__dirname, 'manifest.csv'), 'utf8').trim().split('\n');

const MONTH_NAMES = ["January","February","March","April","May","June","July","August","September","October","November","December"];

const items = csv.map(line => {
  const [id, dateRaw, ...baseParts] = line.split(',');
  const base = baseParts.join(',');
  // dateRaw format: 2025:11:22 11:02:38
  const m = dateRaw.match(/(\d{4}):(\d{2}):(\d{2}) (\d{2}):(\d{2}):(\d{2})/);
  let ts;
  if (m) {
    const sec = Math.min(parseInt(m[6], 10), 59);
    ts = new Date(`${m[1]}-${m[2]}-${m[3]}T${m[4]}:${m[5]}:${String(sec).padStart(2, '0')}`).getTime();
  } else {
    ts = 0;
  }
  if (isNaN(ts)) ts = 0;
  return { id, ts, base };
});

items.sort((a, b) => a.ts - b.ts);

// group by year-month
const groups = [];
let currentKey = null;
let currentGroup = null;
for (const it of items) {
  const d = new Date(it.ts);
  const key = `${d.getFullYear()}-${d.getMonth()}`;
  if (key !== currentKey) {
    currentGroup = { label: `${MONTH_NAMES[d.getMonth()]} ${d.getFullYear()}`, year: d.getFullYear(), month: d.getMonth(), photos: [] };
    groups.push(currentGroup);
    currentKey = key;
  }
  currentGroup.photos.push({ id: it.id, ts: it.ts });
}

fs.writeFileSync(path.join(__dirname, 'assets', 'manifest.json'), JSON.stringify({ groups }, null, 2));
console.log(`Wrote ${items.length} photos across ${groups.length} month groups.`);
groups.forEach(g => console.log(`  ${g.label}: ${g.photos.length}`));
