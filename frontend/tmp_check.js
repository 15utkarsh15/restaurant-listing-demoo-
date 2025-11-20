const fs = require('fs');
const s = fs.readFileSync('c:/Users/91983/OneDrive/Desktop/swiggy-web/frontend/src/App.tsx', 'utf8');
const pairs = {'(':')','{':'}','[':']'};
const open = Object.keys(pairs).join('');
const close = Object.values(pairs).join('');
let stack = [];
for (let i = 0; i < s.length; i++) {
  const ch = s[i];
  if (open.includes(ch)) stack.push({ch, i});
  else if (close.includes(ch)) {
    const last = stack.pop();
    if (!last) { console.error('Unmatched closer', ch, 'at', i); process.exit(2); }
    const expect = pairs[last.ch];
    if (expect !== ch) { console.error('Mismatched', last.ch, 'at', last.i, 'closed by', ch, 'at', i); process.exit(3); }
  }
}
if (stack.length) { console.error('Unclosed openers at end:', stack.map(x => x.ch + '@' + x.i)); process.exit(4); }
console.log('All braces match');
