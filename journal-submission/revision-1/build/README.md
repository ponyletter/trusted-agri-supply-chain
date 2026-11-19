# Build scripts

`content.js` holds the revised manuscript text. Edit the text there, then regenerate the Word files.

```bash
# docx@9 is the only dependency; install it outside the repository
npm install --prefix /path/to/deps docx@9.5.1
NODE_PATH=/path/to/deps/node_modules node build-manuscript.js ../revised-manuscript.docx
node to-markdown.js ../../../markdown/revised-manuscript.md
# legacy .doc copy (LibreOffice)
soffice --headless --convert-to doc --outdir .. ../revised-manuscript.docx
```

The layout follows `journal-submission/formatting/manuscript-template-and-formatting-checklist.doc`: A4 page with the template's margins, 小二黑体 title, 五号宋体 body at 1.5 line spacing, 四号/五号黑体 headings, and a three-line table. The author note sits in the first-page footer.
