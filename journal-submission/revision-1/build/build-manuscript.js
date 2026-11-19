// Builds the revised manuscript (.docx) from content.js in the layout of the
// 《安徽农学通报》 template (A4, template margins, 五号宋体 body at 1.5 line spacing).
//
// Usage: NODE_PATH=<dir containing node_modules with docx@9> node build-manuscript.js <out.docx>
// Figures are read from ../figures relative to this script.

const fs = require('fs');
const path = require('path');
const {
  Document, Packer, Paragraph, TextRun, ImageRun, Table, TableRow, TableCell, Footer,
  AlignmentType, WidthType, BorderStyle, LineRuleType, PageNumber, VerticalAlign,
} = require('docx');

const C = require('./content');
const FIG_DIR = path.join(__dirname, '..', 'figures');
const out = process.argv[2] || 'revised-manuscript.docx';

// Font sizes in half-points: 二号 22pt, 小二 18pt, 四号 14pt, 五号 10.5pt, 小五 9pt
const SZ = { erhao: 44, xiaoer: 36, sihao: 28, wuhao: 21, xiaowu: 18 };
const SONG = { ascii: 'Times New Roman', hAnsi: 'Times New Roman', eastAsia: '宋体', cs: 'Times New Roman' };
const HEI = { ascii: 'Times New Roman', hAnsi: 'Times New Roman', eastAsia: '黑体', cs: 'Times New Roman' };
const FANG = { ascii: 'Times New Roman', hAnsi: 'Times New Roman', eastAsia: '仿宋', cs: 'Times New Roman' };
const TNR = { ascii: 'Times New Roman', hAnsi: 'Times New Roman', eastAsia: 'Times New Roman', cs: 'Times New Roman' };

const LINE_15 = { line: 360, lineRule: LineRuleType.AUTO };
const LINE_1 = { line: 240, lineRule: LineRuleType.AUTO };

// Split text into runs, rendering citation markers such as [1], [1-2], [5,7] as superscript.
function runs(text, opts = {}) {
  const parts = text.split(/(\[\d+(?:[-–,，]\d+)*\])/);
  return parts.filter(Boolean).map((t) => {
    const isCite = /^\[\d+(?:[-–,，]\d+)*\]$/.test(t);
    return new TextRun({ text: t, font: SONG, size: SZ.wuhao, ...opts, superScript: isCite || undefined });
  });
}

function bodyPara(text) {
  return new Paragraph({
    children: runs(text),
    alignment: AlignmentType.JUSTIFIED,
    indent: { firstLine: 420 },
    spacing: { ...LINE_15, before: 0, after: 0 },
  });
}

function heading1(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: HEI, size: SZ.sihao })],
    spacing: { ...LINE_15, before: 120, after: 60 },
    keepNext: true,
  });
}

function heading2(text) {
  return new Paragraph({
    children: [new TextRun({ text, font: HEI, size: SZ.wuhao })],
    spacing: { ...LINE_15, before: 60, after: 0 },
    keepNext: true,
  });
}

// Figures: width in px at 96 dpi; text block is ~652 px wide.
const FIGS = {
  fig1: { file: 'figure-1-supply-chain-traceability-flow.png', w: 2669, h: 2534, width: 500 },
  fig2: { file: 'figure-2-fabric-business-network.png', w: 1278, h: 569, width: 620 },
};

function figure(block) {
  const f = FIGS[block.key];
  const height = Math.round((f.width * f.h) / f.w);
  return [
    new Paragraph({
      children: [new ImageRun({
        type: 'png',
        data: fs.readFileSync(path.join(FIG_DIR, f.file)),
        transformation: { width: f.width, height },
        altText: { title: block.caption, description: block.caption, name: block.key },
      })],
      alignment: AlignmentType.CENTER,
      spacing: { before: 120, after: 60 },
      keepNext: true,
    }),
    new Paragraph({
      children: [new TextRun({ text: block.caption, font: HEI, size: SZ.xiaowu })],
      alignment: AlignmentType.CENTER,
      spacing: { ...LINE_1, before: 0, after: 120 },
    }),
  ];
}

// Three-line table (三线表): thick top and bottom rules, thin rule under the header, no verticals.
function table(block) {
  const widths = [2400, 2500, 2050, 2800]; // sums to TABLE_W
  const TABLE_W = widths.reduce((a, b) => a + b, 0);
  const NONE = { style: BorderStyle.NONE, size: 0, color: 'FFFFFF' };
  const THICK = { style: BorderStyle.SINGLE, size: 12, color: '000000' };
  const THIN = { style: BorderStyle.SINGLE, size: 6, color: '000000' };
  const cell = (text, i, isHeader, isLast) => new TableCell({
    width: { size: widths[i], type: WidthType.DXA },
    verticalAlign: VerticalAlign.CENTER,
    margins: { top: 40, bottom: 40, left: 80, right: 80 },
    borders: {
      top: isHeader ? THICK : NONE,
      bottom: isHeader ? THIN : (isLast ? THICK : NONE),
      left: NONE, right: NONE,
    },
    children: [new Paragraph({
      children: [new TextRun({ text, font: isHeader ? HEI : SONG, size: SZ.xiaowu })],
      alignment: AlignmentType.CENTER,
      spacing: { ...LINE_1, before: 0, after: 0 },
    })],
  });
  const rows = [
    new TableRow({ tableHeader: true, children: block.header.map((t, i) => cell(t, i, true, false)) }),
    ...block.rows.map((r, ri) => new TableRow({
      children: r.map((t, i) => cell(t, i, false, ri === block.rows.length - 1)),
    })),
  ];
  return [
    new Paragraph({
      children: [new TextRun({ text: block.caption, font: HEI, size: SZ.xiaowu })],
      alignment: AlignmentType.CENTER,
      spacing: { ...LINE_1, before: 120, after: 0 },
      keepNext: true,
    }),
    new Paragraph({
      children: [new TextRun({ text: block.enCaption, font: TNR, size: SZ.xiaowu })],
      alignment: AlignmentType.CENTER,
      spacing: { ...LINE_1, before: 0, after: 60 },
      keepNext: true,
    }),
    new Table({
      width: { size: TABLE_W, type: WidthType.DXA },
      columnWidths: widths,
      alignment: AlignmentType.CENTER,
      borders: {
        top: NONE, bottom: NONE, left: NONE, right: NONE, insideHorizontal: NONE, insideVertical: NONE,
      },
      rows,
    }),
    new Paragraph({ children: [], spacing: { before: 0, after: 60 } }),
  ];
}

function labelled(label, text, labelFont, textFont, size) {
  return new Paragraph({
    children: [
      new TextRun({ text: label, font: labelFont, size, bold: labelFont === TNR }),
      new TextRun({ text: '  ' + text, font: textFont, size }),
    ],
    alignment: AlignmentType.JUSTIFIED,
    spacing: { ...LINE_1, before: 40, after: 40 },
  });
}

const front = [
  new Paragraph({
    children: [new TextRun({ text: C.title, font: HEI, size: SZ.xiaoer })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 240, after: 160 },
  }),
  new Paragraph({
    children: [new TextRun({ text: C.author, font: FANG, size: SZ.sihao })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 80 },
  }),
  new Paragraph({
    children: [new TextRun({ text: C.affiliation, font: SONG, size: SZ.xiaowu })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 160 },
  }),
  labelled('摘  要', C.abstract, HEI, SONG, SZ.xiaowu),
  labelled('关键词', C.keywords, HEI, SONG, SZ.xiaowu),
  new Paragraph({
    children: [
      new TextRun({ text: '中图分类号', font: HEI, size: SZ.xiaowu }),
      new TextRun({ text: '  ' + C.clc + '        ', font: SONG, size: SZ.xiaowu }),
      new TextRun({ text: '文献标志码', font: HEI, size: SZ.xiaowu }),
      new TextRun({ text: '  ' + C.docCode, font: SONG, size: SZ.xiaowu }),
    ],
    spacing: { before: 40, after: 240 },
  }),
  new Paragraph({
    children: [new TextRun({ text: C.enTitle, font: TNR, size: SZ.sihao, bold: true })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 120, after: 120 },
  }),
  new Paragraph({
    children: [new TextRun({ text: C.enAuthor, font: TNR, size: SZ.wuhao })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 60 },
  }),
  new Paragraph({
    children: [new TextRun({ text: C.enAffiliation, font: TNR, size: SZ.xiaowu })],
    alignment: AlignmentType.CENTER,
    spacing: { before: 0, after: 120 },
  }),
  labelled('Abstract', C.enAbstract, TNR, TNR, SZ.xiaowu),
  labelled('Keywords', C.enKeywords, TNR, TNR, SZ.xiaowu),
  new Paragraph({ children: [], spacing: { before: 0, after: 120 } }),
];

const body = [];
for (const b of C.body) {
  if (b.type === 'h1') body.push(heading1(b.text));
  else if (b.type === 'h2') body.push(heading2(b.text));
  else if (b.type === 'p') body.push(bodyPara(b.text));
  else if (b.type === 'fig') body.push(...figure(b));
  else if (b.type === 'table') body.push(...table(b));
  else throw new Error('unknown block ' + b.type);
}

const refs = [
  new Paragraph({
    children: [new TextRun({ text: '参考文献', font: HEI, size: SZ.wuhao })],
    spacing: { ...LINE_15, before: 240, after: 60 },
    keepNext: true,
  }),
  ...C.references.map((r, i) => new Paragraph({
    children: [new TextRun({ text: `[${i + 1}] ${r}`, font: SONG, size: SZ.xiaowu })],
    alignment: AlignmentType.JUSTIFIED,
    indent: { left: 360, hanging: 360 },
    spacing: { ...LINE_1, before: 0, after: 20 },
  })),
];

const firstFooter = new Footer({
  children: [
    new Paragraph({
      border: { top: { style: BorderStyle.SINGLE, size: 4, color: '000000', space: 2 } },
      children: [new TextRun({ text: C.authorNote, font: SONG, size: SZ.xiaowu })],
      spacing: { before: 0, after: 0 },
    }),
    new Paragraph({
      children: [new TextRun({ text: C.receivedNote, font: SONG, size: SZ.xiaowu })],
      spacing: { before: 0, after: 0 },
    }),
  ],
});

const defaultFooter = new Footer({
  children: [new Paragraph({
    alignment: AlignmentType.CENTER,
    children: [new TextRun({ children: ['- ', PageNumber.CURRENT, ' -'], font: TNR, size: SZ.xiaowu })],
  })],
});

const doc = new Document({
  creator: C.author,
  title: C.title,
  styles: { default: { document: { run: { font: SONG, size: SZ.wuhao } } } },
  sections: [{
    properties: {
      titlePage: true,
      page: {
        size: { width: 11906, height: 16838 },
        margin: { top: 993, bottom: 993, left: 1134, right: 991, header: 567, footer: 567 },
      },
    },
    footers: { first: firstFooter, default: defaultFooter },
    children: [...front, ...body, ...refs],
  }],
});

Packer.toBuffer(doc).then((buf) => {
  fs.writeFileSync(out, buf);
  console.log('wrote', out);
});
