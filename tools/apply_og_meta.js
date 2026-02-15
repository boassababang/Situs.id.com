#!/usr/bin/env node
// tools/apply_og_meta.js
// Usage: node apply_og_meta.js --baseUrl="https://yourdomain.com"
// This script reads data/news.json and inserts Open Graph + Twitter meta tags
// into corresponding articles/article-XX.html files based on their index.

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
let baseUrl = 'https://example.com';
args.forEach(a=>{ if(a.startsWith('--baseUrl=')) baseUrl = a.split('=')[1].replace(/"/g,''); });

const dataPath = path.join(__dirname, '..', 'data', 'news.json');
const articlesDir = path.join(__dirname, '..', 'articles');

if(!fs.existsSync(dataPath)){ console.error('data/news.json not found'); process.exit(1); }
const news = JSON.parse(fs.readFileSync(dataPath,'utf8'));

news.forEach((item, idx)=>{
  const num = String(idx+1).padStart(2,'0');
  const file = path.join(articlesDir, `article-${num}.html`);
  if(!fs.existsSync(file)){ console.warn('Missing', file); return; }
  let html = fs.readFileSync(file,'utf8');

  const url = (baseUrl.replace(/\/$/,'') + `/articles/article-${num}.html`);
  const title = item.title || '';
  const desc = (item.summary || '').replace(/<[^>]*>/g,'');
  const image = item.image || (baseUrl.replace(/\/$/,'') + '/favicon.jpeg');

  const meta = `\n    <!-- Open Graph / Twitter meta (injected by tools/apply_og_meta.js) -->\n    <meta property="og:type" content="article">\n    <meta property="og:title" content="${escapeHtml(title)}">\n    <meta property="og:description" content="${escapeHtml(desc)}">\n    <meta property="og:image" content="${image}">\n    <meta property="og:url" content="${url}">\n    <meta property="og:site_name" content="Website Data">\n    <meta name="twitter:card" content="summary_large_image">\n    <meta name="twitter:title" content="${escapeHtml(title)}">\n    <meta name="twitter:description" content="${escapeHtml(desc)}">\n    <meta name="twitter:image" content="${image}">\n`;

  if(html.indexOf('<!-- Open Graph / Twitter meta (injected by tools/apply_og_meta.js) -->') !== -1){
    console.log('Already has meta:', file); return;
  }

  // Insert meta before </head>
  if(html.indexOf('</head>') !== -1){
    html = html.replace('</head>', meta + '\n</head>');
    fs.writeFileSync(file, html, 'utf8');
    console.log('Updated', file);
  }else{
    console.warn('No </head> in', file);
  }
});

function escapeHtml(str){ return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
