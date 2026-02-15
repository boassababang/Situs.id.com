// Node script: generate static article HTML files from data/news.json
// Usage: node tools/generate_articles.js
const fs = require('fs');
const path = require('path');

const dataPath = path.join(__dirname, '..', 'data', 'news.json');
const outDir = path.join(__dirname, '..', 'articles');

function slugify(s){ return s.toLowerCase().replace(/[^a-z0-9]+/g,'-').replace(/^-|-$/g,''); }

if(!fs.existsSync(dataPath)){
  console.error('news.json not found at', dataPath);
  process.exit(1);
}

const items = JSON.parse(fs.readFileSync(dataPath, 'utf8'));
if(!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });

items.forEach((it, idx)=>{
  const slug = slugify(it.title || ('article-'+idx));
  const filename = path.join(outDir, `article-${slug}.html`);
  const html = `<!doctype html>
<html lang="id">
  <head>
    <meta charset="utf-8">
    <meta name="viewport" content="width=device-width,initial-scale=1">
    <title>${it.title} — Website Data</title>
    <link rel="stylesheet" href="../styles.css">
    <link rel="icon" href="../favicon.jpeg" type="image/jpeg">
  </head>
  <body>
    <header class="site-header">
      <div class="container">
        <a href="../Index.html" class="brand" aria-label="Website Data">
          <div class="logo-thumb" aria-hidden="true">
            <img src="../favicon.jpeg" alt="Logo Website Data">
          </div>
          <div class="brand-text">
            <h1 class="site-title">${escapeHtml(it.title)}</h1>
            <p class="tagline">Artikel</p>
          </div>
        </a>
        <nav aria-label="Navigasi utama">
          <ul class="nav">
            <li><a href="../Index.html">Beranda</a></li>
            <li><a href="../dashboard.html">Dashboard</a></li>
          </ul>
        </nav>
      </div>
    </header>
    <main class="container article-page">
      <article>
        <h2>${escapeHtml(it.title)}</h2>
        <p class="meta">${escapeHtml(it.date || '')} — Oleh ${escapeHtml(it.author || 'Tim Data')}</p>
        ${it.image ? `<p><img src="${it.image}" alt="${escapeHtml(it.title)}"></p>` : ''}
        ${it.content || ''}
        <p><a href="../Index.html">← Kembali ke Beranda</a></p>
      </article>
    </main>
    <footer class="site-footer">
      <div class="container">© 2026 Website Data</div>
    </footer>
  </body>
</html>`;
  fs.writeFileSync(filename, html, 'utf8');
  console.log('Wrote', filename);
});

function escapeHtml(s){ return String(s||'').replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;').replace(/'/g,'&#39;'); }

console.log('Done. Generated', items.length, 'articles.');
