# Trusted Agricultural Product Supply Chain

[简体中文](README.zh-CN.md)

This repository tracks revisions to the Chinese-language manuscript *Research on blockchain construction pathways for a trusted agricultural product supply chain* for 《安徽农学通报》. GitHub Issues are the workspace for revision tasks. The first revision is in [`journal-submission/revision-1/`](journal-submission/revision-1/) (tracked in issue #3).

## Revision brief

| Current proof section | Work to track |
| --- | --- |
| 1. Blockchain-related technologies | Introduce the technical framework and identify gaps in existing supply-chain traceability. Explain the role of IoT in capturing data at the source. |
| 2. Advantages of blockchain for agricultural supply chains | Explain what shared ledgers, consensus, and smart contracts contribute. Identify the gaps that still need to be addressed in Section 3. |
| 3. Core technical pathways for building a trusted supply chain | Tie each proposed measure to a specific gap raised in Sections 1–2. Make the roles of IoT, the consortium blockchain, and combined on-chain and off-chain storage explicit. |

## Figure replacements

| Figure in the current proof | Latest replacement in the thesis materials |
| --- | --- |
| Figure 1. Agricultural product supply-chain traceability application model | [Figure 3-2](thesis-materials/replacement-figures/figure-3-2-supply-chain-traceability-flow.png) |
| Figure 2. Consortium blockchain network architecture | [Figure 2-3](thesis-materials/replacement-figures/figure-2-3-fabric-business-network.png) |

Use the copies directly under `thesis-materials/replacement-figures/`. After replacement, check journal figure numbering, captions, and in-text references against the Word manuscript.

## Working with issues

Use English for issue titles and provide a Chinese equivalent when it helps identify a manuscript section or passage. Record the relevant section or figure, the requested change, and how to verify it.

## Source materials

- [Editorial notes](editorial-feedback.txt) contain the original revision feedback.
- [Journal submission materials](journal-submission/) contain the submitted Word file, the journal proof PDF, and the original submission figures.
- [Journal submission guidelines](journal-submission/formatting/submission-guidelines.docx) cover submission procedures, required manuscript elements, and journal conventions for figures, tables, units, and references.
- [Manuscript template and formatting checklist](journal-submission/formatting/manuscript-template-and-formatting-checklist.doc) provides a Word layout to follow and examples for headings, abstracts, units, three-line tables, and references.
- [Thesis materials](thesis-materials/) contain the thesis Word file, its figure collection, and the two latest figures in [replacement-figures](thesis-materials/replacement-figures/).
- [Revision 1](journal-submission/revision-1/) contains the revised manuscript (`revised-manuscript.docx` and `.doc`), the revision notes for the editor, the prepared figures, and the build scripts that generate the Word file from `build/content.js`. A [Markdown reading copy](markdown/revised-manuscript.md) is also available.
- [Submitted manuscript in Markdown](markdown/submitted-manuscript.md) and [journal proof in Markdown](markdown/journal-proof.md) are reading copies. Use the originals to check pagination and layout.
