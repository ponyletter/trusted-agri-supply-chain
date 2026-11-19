// Writes a Markdown reading copy of the revised manuscript from content.js.
// Usage: node to-markdown.js <out.md>
const fs = require('fs');
const path = require('path');
const C = require('./content');

const out = process.argv[2] || 'revised-manuscript.md';
const outDir = path.dirname(path.resolve(out));
const figDir = path.join(__dirname, '..', 'figures');
const FIGS = {
  fig1: 'figure-1-supply-chain-traceability-flow.png',
  fig2: 'figure-2-fabric-business-network.png',
};
const sup = (t) => t.replace(/\[(\d+(?:[-,，]\d+)*)\]/g, '<sup>[$1]</sup>');

const L = [];
L.push('> 修改稿（第1轮）阅读副本，由 `journal-submission/revision-1/build/content.js` 生成。排版以 `revised-manuscript.docx` 为准。', '');
L.push(`# ${C.title}`, '', `${C.author}${C.affiliation}`, '');
L.push(`**摘  要** ${C.abstract}`, '', `**关键词** ${C.keywords}`, '');
L.push(`**中图分类号** ${C.clc}　**文献标志码** ${C.docCode}`, '');
L.push(`**${C.enTitle}**`, '', `${C.enAuthor} ${C.enAffiliation}`, '');
L.push(`**Abstract** ${C.enAbstract}`, '', `**Keywords** ${C.enKeywords}`, '');
L.push('---', '');
for (const b of C.body) {
  if (b.type === 'h1') L.push(`## ${b.text}`, '');
  else if (b.type === 'h2') L.push(`### ${b.text}`, '');
  else if (b.type === 'p') L.push(sup(b.text), '');
  else if (b.type === 'fig') {
    const rel = path.relative(outDir, path.join(figDir, FIGS[b.key])).split(path.sep).join('/');
    L.push(`![${b.caption}](${rel})`, '', `*${b.caption}*`, '');
  } else if (b.type === 'table') {
    L.push(`**${b.caption}**`, '', `*${b.enCaption}*`, '');
    L.push(`| ${b.header.join(' | ')} |`, `| ${b.header.map(() => '---').join(' | ')} |`);
    for (const r of b.rows) L.push(`| ${r.join(' | ')} |`);
    L.push('');
  }
}
L.push('## 参考文献', '');
C.references.forEach((r, i) => L.push(`[${i + 1}] ${r}`, ''));
L.push('---', '', C.authorNote, '', C.receivedNote, '');
fs.writeFileSync(out, L.join('\n'));
console.log('wrote', out);
