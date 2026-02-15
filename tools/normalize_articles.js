#!/usr/bin/env node
// tools/normalize_articles.js
// Normalizes article HTML files under ../articles:
// - Wraps the first <img> with <p class="article-thumb-wrap"> and adds class="article-thumb" and loading="lazy"
// - Injects Open Graph meta tags using data/news.json (same mapping by index)
// Usage: node tools/normalize_articles.js --baseUrl="https://yourdomain.com"

const fs = require('fs');
const path = require('path');

const args = process.argv.slice(2);
let baseUrl = '';
args.forEach(a=>{ if(a.startsWith('--baseUrl=')) baseUrl = a.split('=')[1].replace(/"/g,''); });

const articlesDir = path.join(__dirname, '..', 'articles');
const dataPath = path.join(__dirname, '..', 'data', 'news.json');

let news = [];
if(fs.existsSync(dataPath)){
  try{ news = JSON.parse(fs.readFileSync(dataPath,'utf8')); }catch(e){ console.warn('Failed reading data/news.json:', e.message); }
}

const files = fs.readdirSync(articlesDir).filter(f => /^article[-_]?\d+\.html$/i.test(f)).sort();

files.forEach((file)=>{
  const filePath = path.join(articlesDir, file);
  let html = fs.readFileSync(filePath,'utf8');
  let changed = false;

  // 1) Normalize first <img>
  // Skip if there is already an element with class article-thumb in the file
  if(!/class=["']?article-thumb["']?/.test(html)){
    // Find first <img ...>
    const imgMatch = html.match(/<img[^>]*>/i);
    if(imgMatch){
      const imgTag = imgMatch[0];
      // Ensure loading attribute
      let newImg = imgTag.replace(/\sloading=("[^"]*"|'[^']*')/i,''); // remove existing loading attr if any
      if(!/\sclass=/.test(newImg)){
        newImg = newImg.replace(/<img/,'<img class="article-thumb" loading="lazy"');
      }else{
        // append class and loading to existing class attribute
        newImg = newImg.replace(/class=("|')([^"']*)("|')/i, function(_,q,cls){
          if(cls.indexOf('article-thumb')===-1) cls = cls + ' article-thumb';
          return `class=${q}${cls}${q}`;
        });
        if(!/\sloading=/i.test(newImg)) newImg = newImg.replace(/<img/, '<img loading="lazy"');
      }
      // Wrap in p.article-thumb-wrap
      const wrapped = `<p class="article-thumb-wrap">${newImg}</p>`;
      html = html.replace(imgTag, wrapped);
      changed = true;
    }
  }

  // 2) Inject Open Graph meta (if data available)
  // Determine index from filename (assume article-01 -> index 0)
  const m = file.match(/(\d+)/);
  let idx = -1;
  if(m) idx = parseInt(m[1],10)-1;
  const item = (idx >=0 && news[idx]) ? news[idx] : null;
  if(item){
    if(html.indexOf('<!-- Open Graph / Twitter meta (injected by tools/apply_og_meta.js) -->') === -1){
      const url = baseUrl ? (baseUrl.replace(/\/$/, '') + '/articles/' + file) : ('/articles/' + file);
      const title = item.title || '';
      const desc = (item.summary || '').replace(/<[^>]*>/g,'').replace(/"/g,'&quot;');
      const image = item.image || (baseUrl ? (baseUrl.replace(/\/$/,'') + '/favicon.jpeg') : '/favicon.jpeg');
      const meta = `\n    <!-- Open Graph / Twitter meta (injected by tools/apply_og_meta.js) -->\n    <meta property="og:type" content="article">\n    <meta property="og:title" content="${escapeHtml(title)}">\n    <meta property="og:description" content="${escapeHtml(desc)}">\n    <meta property="og:image" content="${image}">\n    <meta property="og:url" content="${url}">\n    <meta property="og:site_name" content="Website Data">\n    <meta name="twitter:card" content="summary_large_image">\n    <meta name="twitter:title" content="${escapeHtml(title)}">\n    <meta name="twitter:description" content="${escapeHtml(desc)}">\n    <meta name="twitter:image" content="${image}">\n`;
      if(html.indexOf('</head>') !== -1){ html = html.replace('</head>', meta + '\n</head>'); changed = true; }
    }
  }

  if(changed){
    fs.writeFileSync(filePath, html, 'utf8');
    console.log('Updated', file);
  }else{
    console.log('No change', file);
  }
});

function escapeHtml(str){ return String(str||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;'); }
