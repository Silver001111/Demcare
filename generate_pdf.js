const fs = require('fs');
const path = require('path');
const puppeteer = require('./node_modules/puppeteer-core');

const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
const inputHtmlPath = path.resolve(__dirname, 'guide_raw.html');
const outputPdfPath = path.resolve(__dirname, 'COGNICARE_COMPLETE_IMPLEMENTATION_GUIDE.pdf');

console.log('Reading raw HTML...');
let rawHtml = fs.readFileSync(inputHtmlPath, 'utf8');

// Separate the banner comment from the actual content
const tocIdx = rawHtml.indexOf('<h1>TABLE OF CONTENTS</h1>');
if (tocIdx !== -1) {
  rawHtml = rawHtml.substring(tocIdx);
}

// Transform H2 headers to add category badges (Bug Fix, Feature, Redesign, Polish)
rawHtml = rawHtml.replace(/<h2>(BUG FIX [^:]+):(.*?)<\/h2>/gi, (m, p1, p2) => {
  return `<h2 class="task-h2 bug-fix"><span class="badge badge-bug">${p1}</span> <span class="title-text">${p2.trim()}</span></h2>`;
});

rawHtml = rawHtml.replace(/<h2>(FEATURE [^:]+):(.*?)<\/h2>/gi, (m, p1, p2) => {
  return `<h2 class="task-h2 feature"><span class="badge badge-feature">${p1}</span> <span class="title-text">${p2.trim()}</span></h2>`;
});

rawHtml = rawHtml.replace(/<h2>(REDESIGN [^:]+):(.*?)<\/h2>/gi, (m, p1, p2) => {
  return `<h2 class="task-h2 redesign"><span class="badge badge-redesign">${p1}</span> <span class="title-text">${p2.trim()}</span></h2>`;
});

rawHtml = rawHtml.replace(/<h2>(POLISH [^:]+):(.*?)<\/h2>/gi, (m, p1, p2) => {
  return `<h2 class="task-h2 polish"><span class="badge badge-polish">${p1}</span> <span class="title-text">${p2.trim()}</span></h2>`;
});

// Identify wireframe pre blocks vs regular code pre blocks
rawHtml = rawHtml.replace(/<pre><code>([\s\S]*?)<\/code><\/pre>/gi, (match, codeContent) => {
  const isWireframe = codeContent.includes('┌') || codeContent.includes('╔') || codeContent.includes('│') || codeContent.includes('║') || codeContent.includes('├──');
  if (isWireframe) {
    return `<div class="wireframe-container"><div class="wireframe-label">ARCHITECTURAL BLUEPRINT / WIREFRAME</div><pre class="wireframe"><code>${codeContent}</code></pre></div>`;
  } else {
    return `<div class="code-container"><pre class="code-block"><code>${codeContent}</code></pre></div>`;
  }
});

// Style key bullet points like WHAT, WHERE, WHY, HOW
rawHtml = rawHtml.replace(/<strong>WHAT:<\/strong>/gi, '<span class="key-pill pill-what">WHAT</span>');
rawHtml = rawHtml.replace(/<strong>WHERE:<\/strong>/gi, '<span class="key-pill pill-where">WHERE</span>');
rawHtml = rawHtml.replace(/<strong>WHY:<\/strong>/gi, '<span class="key-pill pill-why">WHY</span>');
rawHtml = rawHtml.replace(/<strong>HOW:<\/strong>/gi, '<span class="key-pill pill-how">HOW</span>');
rawHtml = rawHtml.replace(/<strong>File:<\/strong>/gi, '<span class="key-pill pill-where">FILE</span>');
rawHtml = rawHtml.replace(/<strong>Lines:<\/strong>/gi, '<span class="key-pill pill-lines">LINES</span>');

// Construct full HTML document with styling
const finalHtml = `<!DOCTYPE html>
<html lang="en">
<head>
<meta charset="utf-8">
<title>CogniCare NER — Complete Implementation Guide (SIH 26003)</title>
<style>
  @import url('https://fonts.googleapis.com/css2?family=Plus+Jakarta+Sans:wght@400;500;600;700;800&family=JetBrains+Mono:wght@400;500;600&family=Playfair+Display:ital,wght@0,600;0,700;1,600&display=swap');

  *, *::before, *::after {
    box-sizing: border-box;
  }

  body {
    font-family: 'Plus Jakarta Sans', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif;
    color: #1e293b;
    background-color: #ffffff;
    font-size: 9.5pt;
    line-height: 1.6;
    margin: 0;
    padding: 0;
    -webkit-print-color-adjust: exact;
    print-color-adjust: exact;
  }

  /* Cover Page Styling */
  .cover-page {
    page-break-after: always;
    min-height: 90vh;
    display: flex;
    flex-direction: column;
    justify-content: space-between;
    padding: 20px 10px 40px 10px;
  }

  .cover-top {
    margin-top: 20px;
  }

  .sih-badge {
    display: inline-block;
    background: linear-gradient(135deg, #b91c1c 0%, #991b1b 100%);
    color: #ffffff;
    font-size: 8pt;
    font-weight: 700;
    letter-spacing: 1.2px;
    padding: 6px 14px;
    border-radius: 9999px;
    text-transform: uppercase;
    margin-bottom: 24px;
    box-shadow: 0 2px 4px rgba(185, 28, 28, 0.2);
  }

  .project-title {
    font-family: 'Playfair Display', Georgia, serif;
    font-size: 34pt;
    font-weight: 700;
    color: #0f172a;
    line-height: 1.15;
    margin: 0 0 8px 0;
  }

  .project-title-vernacular {
    color: #b91c1c;
    font-family: 'Plus Jakarta Sans', sans-serif;
    font-size: 26pt;
    font-weight: 600;
  }

  .doc-subtitle {
    font-size: 14.5pt;
    font-weight: 600;
    color: #0d9488;
    margin: 0 0 16px 0;
    letter-spacing: -0.2px;
  }

  .doc-desc {
    font-size: 11pt;
    color: #475569;
    max-width: 650px;
    line-height: 1.5;
    margin-bottom: 30px;
  }

  .meta-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 12px;
    margin: 30px 0;
  }

  .meta-card {
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 8px;
    padding: 12px 16px;
  }

  .meta-label {
    font-size: 7.5pt;
    font-weight: 700;
    text-transform: uppercase;
    letter-spacing: 0.8px;
    color: #64748b;
    margin-bottom: 4px;
  }

  .meta-value {
    font-size: 9.5pt;
    font-weight: 600;
    color: #0f172a;
  }

  .executive-box {
    background: #f0fdfa;
    border-left: 4px solid #0d9488;
    border-radius: 0 8px 8px 0;
    padding: 14px 18px;
    margin-top: 20px;
  }

  .executive-box h4 {
    margin: 0 0 6px 0;
    color: #0f766e;
    font-size: 10pt;
    font-weight: 700;
  }

  .executive-box p {
    margin: 0;
    font-size: 9pt;
    color: #134e4a;
    line-height: 1.5;
  }

  .cover-footer {
    display: flex;
    justify-content: space-between;
    align-items: center;
    border-top: 1px solid #e2e8f0;
    padding-top: 16px;
    font-size: 8pt;
    color: #94a3b8;
  }

  /* Section Typography */
  h1 {
    font-size: 18pt;
    font-weight: 800;
    color: #0f172a;
    page-break-before: always;
    margin-top: 28px;
    margin-bottom: 16px;
    padding-bottom: 8px;
    border-bottom: 2.5px solid #0d9488;
    letter-spacing: -0.3px;
  }

  /* Do not break before Table of Contents */
  h1:first-of-type {
    page-break-before: avoid;
  }

  h2 {
    font-size: 12.5pt;
    font-weight: 700;
    color: #1e293b;
    page-break-after: avoid;
    margin-top: 22px;
    margin-bottom: 10px;
    padding-bottom: 4px;
    border-bottom: 1px solid #e2e8f0;
  }

  .task-h2 {
    display: flex;
    align-items: center;
    gap: 8px;
    padding: 8px 12px;
    background: #f8fafc;
    border: 1px solid #e2e8f0;
    border-radius: 6px;
    border-bottom: none;
    margin-top: 24px;
  }

  .task-h2.bug-fix { border-left: 4px solid #ef4444; }
  .task-h2.feature { border-left: 4px solid #0284c7; }
  .task-h2.redesign { border-left: 4px solid #8b5cf6; }
  .task-h2.polish { border-left: 4px solid #10b981; }

  .badge {
    font-size: 7.5pt;
    font-weight: 700;
    padding: 3px 8px;
    border-radius: 4px;
    text-transform: uppercase;
    letter-spacing: 0.5px;
  }

  .badge-bug { background: #fee2e2; color: #b91c1c; }
  .badge-feature { background: #e0f2fe; color: #0369a1; }
  .badge-redesign { background: #f3e8ff; color: #7e22ce; }
  .badge-polish { background: #dcfce7; color: #15803d; }

  .title-text {
    font-size: 11pt;
    font-weight: 700;
    color: #0f172a;
  }

  h3 {
    font-size: 10.5pt;
    font-weight: 700;
    color: #334155;
    page-break-after: avoid;
    margin-top: 14px;
    margin-bottom: 6px;
  }

  h4 {
    font-size: 9.5pt;
    font-weight: 700;
    color: #475569;
    page-break-after: avoid;
    margin-top: 10px;
    margin-bottom: 4px;
  }

  p {
    margin: 6px 0;
    color: #334155;
  }

  ul, ol {
    margin: 6px 0 12px 0;
    padding-left: 20px;
  }

  li {
    margin-bottom: 4px;
    color: #334155;
  }

  /* Key Pills */
  .key-pill {
    display: inline-block;
    font-size: 7.5pt;
    font-weight: 800;
    padding: 2px 7px;
    border-radius: 4px;
    margin-right: 6px;
    letter-spacing: 0.5px;
  }
  .pill-what { background: #fef3c7; color: #b45309; }
  .pill-where { background: #e0e7ff; color: #4338ca; }
  .pill-why { background: #fce7f3; color: #be185d; }
  .pill-how { background: #dcfce7; color: #15803d; }
  .pill-lines { background: #f1f5f9; color: #475569; }

  /* Code Container */
  .code-container {
    margin: 10px 0 16px 0;
    page-break-inside: avoid;
  }

  pre.code-block {
    background: #0f172a;
    color: #f1f5f9;
    font-family: 'JetBrains Mono', 'Consolas', 'Cascadia Code', monospace;
    font-size: 8pt;
    line-height: 1.45;
    padding: 12px 14px;
    border-radius: 6px;
    border: 1px solid #1e293b;
    overflow-x: hidden;
    white-space: pre-wrap;
    word-break: break-word;
    margin: 0;
  }

  /* Wireframe Container */
  .wireframe-container {
    margin: 14px 0 20px 0;
    page-break-inside: avoid;
    background: #f8fafc;
    border: 1.5px solid #cbd5e1;
    border-radius: 8px;
    padding: 10px 14px;
  }

  .wireframe-label {
    font-size: 7.5pt;
    font-weight: 700;
    color: #64748b;
    letter-spacing: 1px;
    margin-bottom: 6px;
  }

  pre.wireframe {
    font-family: 'JetBrains Mono', 'Consolas', 'Courier New', monospace;
    font-size: 7.2pt;
    line-height: 1.22;
    color: #0f172a;
    background: transparent;
    margin: 0;
    padding: 0;
    white-space: pre !important;
    overflow-x: visible;
  }

  /* Inline Code */
  code {
    font-family: 'JetBrains Mono', 'Consolas', monospace;
    font-size: 8.5pt;
    background: #f1f5f9;
    color: #0f172a;
    padding: 1.5px 5px;
    border-radius: 4px;
    border: 1px solid #e2e8f0;
  }

  pre code {
    background: transparent;
    border: none;
    padding: 0;
    color: inherit;
    font-size: inherit;
  }

  /* Checkboxes */
  input[type="checkbox"] {
    appearance: none;
    -webkit-appearance: none;
    width: 13px;
    height: 13px;
    border: 1.5px solid #0d9488;
    border-radius: 3px;
    margin-right: 6px;
    vertical-align: middle;
    display: inline-block;
    background: #ffffff;
    position: relative;
    top: -1px;
  }

  input[type="checkbox"]:checked {
    background-color: #0d9488;
  }

  /* Tables */
  table {
    width: 100%;
    border-collapse: collapse;
    margin: 14px 0;
    font-size: 8.5pt;
    page-break-inside: avoid;
  }

  th {
    background: #0f172a;
    color: #ffffff;
    text-align: left;
    padding: 8px 10px;
    font-weight: 600;
    border: 1px solid #334155;
  }

  td {
    padding: 6px 10px;
    border: 1px solid #e2e8f0;
    color: #334155;
  }

  tr:nth-child(even) td {
    background-color: #f8fafc;
  }

  hr {
    border: none;
    height: 1px;
    background: #e2e8f0;
    margin: 24px 0;
  }

  a {
    color: #0284c7;
    text-decoration: none;
  }
</style>
</head>
<body>

<!-- Cover Page -->
<div class="cover-page">
  <div class="cover-top">
    <div class="sih-badge">Smart India Hackathon 2026 &bull; Problem Statement 26003</div>
    <div class="project-title">CogniCare NER <span class="project-title-vernacular">(স্মৃতি-সেতু)</span></div>
    <div class="doc-subtitle">Complete Technical Implementation Blueprint & Architecture Guide for AI Agents</div>
    <div class="doc-desc">
      A comprehensive MedTech engineering manual detailing the turnkey implementation, missing clinical features,
      Zustand persistent state architecture, Web Audio speech biomarkers, and modern accessible UI redesign
      for the North East India elderly cognitive screening platform.
    </div>

    <div class="meta-grid">
      <div class="meta-card">
        <div class="meta-label">Architecture & Stack</div>
        <div class="meta-value">React 19 &bull; Vite 8 &bull; TypeScript 6 &bull; Tailwind CSS 4</div>
      </div>
      <div class="meta-card">
        <div class="meta-label">State & Machine Learning</div>
        <div class="meta-value">Zustand 5 (Persisted) &bull; Thompson Sampling CMAB</div>
      </div>
      <div class="meta-card">
        <div class="meta-label">Offline & PWA Capabilities</div>
        <div class="meta-value">Service Worker &bull; Local Cache &bull; Firebase Cloud Sync</div>
      </div>
      <div class="meta-card">
        <div class="meta-label">Target Deployment Directory</div>
        <div class="meta-value">apps/cognicare-app/src/</div>
      </div>
    </div>

    <div class="executive-box">
      <h4>Engineering Instructions for AI Agents & Developers</h4>
      <p>
        This document is structured sequentially. Every task details: <strong>WHAT</strong> to modify,
        <strong>WHERE</strong> (exact file paths and line boundaries), <strong>WHY</strong> it matters clinically and technically,
        and <strong>HOW</strong> (ready-to-run, complete production TypeScript/React code). Follow the execution order
        outlined in Section 9 for optimal stability.
      </p>
    </div>
  </div>

  <div class="cover-footer">
    <div>Document Revision: 2.0 &bull; Turnkey AI Engineering Manual</div>
    <div>North East India MedTech Initiative</div>
  </div>
</div>

<!-- Main Content -->
<div class="content-body">
${rawHtml}
</div>

</body>
</html>`;

const styledHtmlPath = path.resolve(__dirname, 'guide_styled.html');
fs.writeFileSync(styledHtmlPath, finalHtml, 'utf8');
console.log('Saved styled HTML to:', styledHtmlPath);

async function generate() {
  console.log('Launching browser via puppeteer-core...');
  const browser = await puppeteer.launch({
    executablePath: chromePath,
    args: [
      '--no-sandbox',
      '--disable-setuid-sandbox',
      '--disable-gpu',
      '--font-render-hinting=medium'
    ]
  });

  const page = await browser.newPage();
  console.log('Loading styled HTML...');
  await page.goto('file:///' + styledHtmlPath.replace(/\\/g, '/'), { waitUntil: 'networkidle0' });

  console.log('Rendering PDF with custom headers and footers...');
  await page.pdf({
    path: outputPdfPath,
    format: 'A4',
    printBackground: true,
    displayHeaderFooter: true,
    headerTemplate: `
      <div style="font-size: 7.5pt; font-family: 'Segoe UI', system-ui, sans-serif; color: #94a3b8; width: 100%; display: flex; justify-content: space-between; border-bottom: 1px solid #f1f5f9; padding: 0 16mm 4px 16mm; margin: 0;">
        <span><strong>CogniCare NER (SIH 26003)</strong> — Complete Implementation Guide</span>
        <span>Technical Architecture Manual</span>
      </div>
    `,
    footerTemplate: `
      <div style="font-size: 7.5pt; font-family: 'Segoe UI', system-ui, sans-serif; color: #94a3b8; width: 100%; display: flex; justify-content: space-between; border-top: 1px solid #f1f5f9; padding: 4px 16mm 0 16mm; margin: 0;">
        <span>Smart India Hackathon 2026 &bull; MedTech Cognitive Screening</span>
        <span>Page <span class="pageNumber"></span> of <span class="totalPages"></span></span>
      </div>
    `,
    margin: {
      top: '22mm',
      bottom: '22mm',
      left: '16mm',
      right: '16mm'
    }
  });

  await browser.close();
  const stats = fs.statSync(outputPdfPath);
  console.log('SUCCESS! PDF generated:');
  console.log('Path:', outputPdfPath);
  console.log('Size:', stats.size, 'bytes (' + Math.round(stats.size / 1024) + ' KB)');
}

generate().catch(err => {
  console.error('Error generating PDF:', err);
  process.exit(1);
});
