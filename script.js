// Simple client-side scaffolding: registration and dashboard data loader
document.addEventListener('DOMContentLoaded', function(){
  // Load users into dashboard table if present
  const users = JSON.parse(localStorage.getItem('wd_users') || '[]');
  const usersTable = document.getElementById('usersTable');
  if(usersTable){
    const tbody = usersTable.querySelector('tbody');
    tbody.innerHTML = '';
    users.forEach((u,i)=>{
      const tr = document.createElement('tr');
      tr.innerHTML = `<td>${i+1}</td>
        <td>${escapeHtml(u.fullname)}</td>
        <td>${escapeHtml(u.email)}</td>
        <td>${escapeHtml(u.whatsapp || '—')}</td>
        <td>${escapeHtml(u.chapchat || '—')}</td>
        <td>${u.age != null ? escapeHtml(String(u.age)) : '—'}</td>`;
      tbody.appendChild(tr);
    });
  }

  // Registration form handling
  const form = document.getElementById('registerForm');
  const dobInput = document.getElementById('dob');
  const ageDisplay = document.getElementById('calculatedAge');

  // Live age calculation when DOB changes
  if(dobInput && ageDisplay){
    dobInput.addEventListener('change', function(){
      const age = calculateAge(dobInput.value);
      ageDisplay.textContent = isNaN(age) ? '—' : age + ' tahun';
    });
  }

  if(form){
    form.addEventListener('submit', function(e){
      e.preventDefault();
      const fullname = document.getElementById('fullname').value.trim();
      const email = document.getElementById('email').value.trim().toLowerCase();
      const password = document.getElementById('password').value;
      const confirm = document.getElementById('confirmPassword').value;
      const whatsapp = document.getElementById('whatsapp').value.trim();
      const chapchat = document.getElementById('chapchat').value.trim();
      const dob = document.getElementById('dob').value;
      const msg = document.getElementById('formMessage');

      if(!fullname || !email || !password || !whatsapp || !chapchat || !dob){
        setMessage('Harap lengkapi semua bidang.', 'error');
        return;
      }
      if(!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)){
        setMessage('Format email tidak valid.', 'error');
        return;
      }
      if(password.length < 8){
        setMessage('Kata sandi minimal 8 karakter.', 'error');
        return;
      }
      if(password !== confirm){
        setMessage('Kata sandi dan konfirmasi tidak cocok.', 'error');
        return;
      }
      // Basic WhatsApp number check (international-ish)
      if(!/^\+?[0-9\s\-]{6,20}$/.test(whatsapp)){
        setMessage('Format nomor WhatsApp tampak tidak valid.', 'error');
        return;
      }

      const age = calculateAge(dob);
      if(isNaN(age) || age < 0){
        setMessage('Tanggal lahir tidak valid.', 'error');
        return;
      }

      // Save user (in localStorage for prototype)
      const users = JSON.parse(localStorage.getItem('wd_users') || '[]');
      if(users.some(u=>u.email === email)){
        setMessage('Email sudah terdaftar.', 'error');
        return;
      }
      users.push({fullname, email, whatsapp, chapchat, dob, age, created: new Date().toISOString()});
      localStorage.setItem('wd_users', JSON.stringify(users));
      // Set current user for authoring context
      try{ localStorage.setItem('wd_current_user', JSON.stringify({fullname,email,whatsapp,chapchat,dob,age})); }catch(e){}
      setMessage('Registrasi berhasil. Mengalihkan ke dashboard...', 'success');
      setTimeout(()=>{ window.location.href = 'dashboard.html'; }, 900);
    });
  }

  function setMessage(text, type){
    const el = document.getElementById('formMessage');
    if(!el) return;
    el.textContent = text;
    el.style.color = type === 'success' ? 'green' : 'crimson';
  }

  function escapeHtml(str){
    return String(str || '').replace(/[&<>"']/g, function(s){
      return ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"})[s];
    });
  }

  function calculateAge(dob){
    if(!dob) return NaN;
    const birth = new Date(dob);
    if(isNaN(birth)) return NaN;
    const today = new Date();
    let age = today.getFullYear() - birth.getFullYear();
    const m = today.getMonth() - birth.getMonth();
    if(m < 0 || (m === 0 && today.getDate() < birth.getDate())) age--;
    return age;
  }

  // --- Gallery & News dynamic rendering ---
  const samplePhotos = [
    {src: 'https://picsum.photos/seed/1/800/600', alt: 'Kegiatan 1', caption: 'Kegiatan komunitas — pelatihan lapangan'},
    {src: 'https://picsum.photos/seed/2/800/600', alt: 'Kegiatan 2', caption: 'Workshop pengelolaan data'},
    {src: 'https://picsum.photos/seed/3/800/600', alt: 'Kegiatan 3', caption: 'Sesi diskusi & kolaborasi'},
    {src: 'https://picsum.photos/seed/4/800/600', alt: 'Kegiatan 4', caption: 'Pengumpulan data lapangan'},
    {src: 'https://picsum.photos/seed/5/800/600', alt: 'Kegiatan 5', caption: 'Presentasi hasil proyek'}
  ];

  let sampleNews = [
    {title:'Pelatihan Data untuk Relawan', date:'2026-02-10', summary:'Pelatihan singkat mengenai teknik pengumpulan data dan etika pengolahan data dilaksanakan minggu lalu.dan menjadi bagian yang  palign  tepenting  addalah ', image:'https://picsum.photos/seed/news1/1200/800', content:'<p>Pelatihan singkat mengenai teknik pengumpulan data dan etika pengolahan data dilaksanakan minggu lalu. Kegiatan mencakup sesi praktik lapangan, pengenalan alat, dan diskusi mengenai privasi data.</p><p>Peserta belajar tentang desain kuesioner, penggunaan formulir digital, dan pengelolaan metadata. Hasil awal menunjukkan peningkatan kualitas data dibandingkan periode sebelumnya.</p>'},
    {title:'Kolaborasi dengan Sekolah Lokal', date:'2026-02-03', summary:'Proyek kolaborasi menghasilkan 120 dataset baru yang berpotensi meningkatkan kualitas analisis.', image:'https://picsum.photos/seed/news2/1200/800', content:'<p>Proyek kolaborasi menghasilkan 120 dataset baru yang berpotensi meningkatkan kualitas analisis. Siswa dan guru dilibatkan dalam proses pengumpulan dan verifikasi data.</p>'},
    {title:'Rilis Laporan Tahunan', date:'2025-12-20', summary:'Laporan tahunan menyoroti capaian dan rencana peningkatan infrastruktur data.', image:'https://picsum.photos/seed/news3/1200/800', content:'<p>Laporan tahunan menyoroti capaian dan rencana peningkatan infrastruktur data. Ringkasan KPI, capaian proyek, dan rekomendasi terdapat pada dokumen lengkap.</p>'}
  ];

  // Try to load data/news.json (developer convenience). If fetch fails (file://) we'll keep the inline sampleNews.
  (function tryLoadNewsJson(){
    try{
      fetch('data/news.json').then(r=>{ if(!r.ok) throw new Error('no'); return r.json() }).then(j=>{ if(Array.isArray(j) && j.length) sampleNews = j; renderNews(); }).catch(()=>{ renderNews(); });
    }catch(e){ renderNews(); }
  })();

  // Render gallery
  const galleryGrid = document.getElementById('galleryGrid');
  const lightbox = document.getElementById('lightbox');
  const lbImage = document.getElementById('lbImage');
  const lbClose = document.querySelector('.lb-close');
  const lbPrev = document.querySelector('.lb-prev');
  const lbNext = document.querySelector('.lb-next');
  let currentIndex = 0;

  function renderGallery(){
    if(!galleryGrid) return;
    galleryGrid.innerHTML = '';
    samplePhotos.forEach((p, idx) => {
      const a = document.createElement('a');
      a.href = p.src;
      a.className = 'gallery-item';
      a.setAttribute('data-index', idx);
      a.innerHTML = `<img src="${p.src}" alt="${escapeHtml(p.alt)}"><div class="caption">${escapeHtml(p.caption)}</div>`;
      a.addEventListener('click', function(e){
        e.preventDefault();
        openLightbox(idx);
      });
      galleryGrid.appendChild(a);
    });
  }

  function openLightbox(idx){
    const p = samplePhotos[idx];
    if(!p) return;
    currentIndex = idx;
    lbImage.src = p.src;
    lbImage.alt = p.alt;
    lightbox.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
  }

  function closeLightbox(){
    lightbox.setAttribute('aria-hidden','true');
    lbImage.src = '';
    document.body.style.overflow = '';
  }

  function showPrev(){ openLightbox((currentIndex - 1 + samplePhotos.length) % samplePhotos.length); }
  function showNext(){ openLightbox((currentIndex + 1) % samplePhotos.length); }

  if(lbClose) lbClose.addEventListener('click', closeLightbox);
  if(lbPrev) lbPrev.addEventListener('click', showPrev);
  if(lbNext) lbNext.addEventListener('click', showNext);
  document.addEventListener('keydown', function(e){
    if(lightbox && lightbox.getAttribute('aria-hidden') === 'false'){
      if(e.key === 'Escape') closeLightbox();
      if(e.key === 'ArrowLeft') showPrev();
      if(e.key === 'ArrowRight') showNext();
    }
  });

  // Render news (static from code: edit `sampleNews` array to add/remove)
  const newsList = document.getElementById('newsList');
  const newsViewer = document.getElementById('newsViewer');

  function renderNews(){
    if(!newsList) return;
    newsList.innerHTML = '';
    sampleNews.forEach(n => {
      const card = document.createElement('article');
      card.className = 'news-card';
      const author = n.author || getCurrentAuthor();
      card.innerHTML = `<h4>${escapeHtml(n.title)}</h4>
        <small class="muted">${escapeHtml(n.date)} — Oleh ${escapeHtml(author)}</small>
        <p>${escapeHtml(n.summary)}</p>`;
      card.addEventListener('click', ()=> openNewsViewer(n));
      newsList.appendChild(card);
    });
  }

  function openNewsViewer(n){
    if(!newsViewer) return;
    const titleEl = newsViewer.querySelector('.viewer-title');
    const dateEl = newsViewer.querySelector('.viewer-date');
    const imgWrap = newsViewer.querySelector('.viewer-image');
    const contentEl = newsViewer.querySelector('.viewer-content');
    titleEl.textContent = n.title || '';
    const author = n.author || getCurrentAuthor();
    dateEl.textContent = (n.date || '') + (author ? (' — Oleh ' + author) : '');
    imgWrap.innerHTML = '';
    if(n.image){ const img = document.createElement('img'); img.src = n.image; img.alt = n.title || 'image'; imgWrap.appendChild(img); }
    contentEl.innerHTML = escapeHtml(n.summary || '');
    newsViewer.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
  }

  function closeNewsViewer(){ if(!newsViewer) return; newsViewer.setAttribute('aria-hidden','true'); newsViewer.querySelector('.viewer-content').innerHTML = ''; document.body.style.overflow = ''; }

  const viewerCloseBtn = document.querySelector('.viewer-close');
  if(viewerCloseBtn) viewerCloseBtn.addEventListener('click', closeNewsViewer);

  function getCurrentAuthor(){
    try{
      const cu = JSON.parse(localStorage.getItem('wd_current_user') || 'null');
      if(cu && cu.fullname) return cu.fullname;
      const users = JSON.parse(localStorage.getItem('wd_users') || '[]');
      if(Array.isArray(users) && users.length){
        const last = users[users.length - 1];
        if(last && last.fullname) return last.fullname;
      }
    }catch(e){}
    return 'Tim Data';
  }

  // Ad slot behavior: placeholder click logs or opens external link (demo)
  const adSlot = document.getElementById('adSlot');
  if(adSlot) adSlot.addEventListener('click', function(){
    window.open('https://example.com','_blank');
  });

  // Initialize gallery and news
  renderGallery();
  renderNews();

  // --- Logo dynamic behavior ---
  function initLogoAnimation(){
    const gradient = document.getElementById('logoGradient');
    if(!gradient) return;
    const stops = gradient.querySelectorAll('stop');
    const palettes = [
      ['#0b69ff','#7c3aed'],
      ['#0ea5a4','#06b6d4'],
      ['#ff7a59','#ffb86b'],
      ['#6ee7b7','#3b82f6']
    ];
    let p = 0;
    setInterval(()=>{
      p = (p+1) % palettes.length;
      stops[0].setAttribute('stop-color', palettes[p][0]);
      stops[1].setAttribute('stop-color', palettes[p][1]);
    }, 2500);
  }

  initLogoAnimation();
  // Ensure all images inside article pages lazy-load for better performance
  try{
    document.querySelectorAll('.article-page article img, article img, .article-content img').forEach(img => {
      if(!img.hasAttribute('loading')) img.setAttribute('loading','lazy');
    });
  }catch(e){/* noop */}

  // Ensure the first image in every article is wrapped and styled consistently
  try{
    const articleEl = document.querySelector('.article-page article') || document.querySelector('article');
    if(articleEl){
      const firstImg = articleEl.querySelector('img');
      if(firstImg){
        // if not already wrapped in .article-thumb-wrap, wrap it
        const wrap = firstImg.closest('.article-thumb-wrap');
        if(!wrap){
          // ensure attributes
          if(!firstImg.classList.contains('article-thumb')) firstImg.classList.add('article-thumb');
          if(!firstImg.hasAttribute('loading')) firstImg.setAttribute('loading','lazy');
          const p = document.createElement('p');
          p.className = 'article-thumb-wrap';
          firstImg.parentNode.insertBefore(p, firstImg);
          p.appendChild(firstImg);
        }
      }
    }
  }catch(e){/* ignore */}

  // Inject share bar + preview on article pages (WhatsApp & Facebook)
  try{
    const articleEl = document.querySelector('.article-page article') || document.querySelector('article');
    if(articleEl){
      const titleEl = articleEl.querySelector('h2') || document.querySelector('h1');
      const metaEl = articleEl.querySelector('.meta') || articleEl.querySelector('small') || null;
      const firstImg = articleEl.querySelector('img');
      const title = titleEl ? titleEl.textContent.trim() : document.title;
      // parse author and date if present in meta text like: "2026-02-10 — Oleh Nama"
      let author = '';
      let date = '';
      if(metaEl){
        const txt = metaEl.textContent || '';
        const parts = txt.split('—').map(s=>s.trim());
        if(parts.length === 2){ date = parts[0]; author = parts[1].replace(/^Oleh\s*/i,''); }
        else { date = parts[0]; }
      }

      // Build share bar
      const shareBar = document.createElement('div');
      shareBar.className = 'share-bar';

      const preview = document.createElement('div');
      preview.className = 'share-preview';
      const img = document.createElement('img');
      img.src = firstImg ? firstImg.src : 'https://picsum.photos/seed/header/400/260';
      img.alt = title;
      const metaWrap = document.createElement('div');
      metaWrap.className = 'meta';
      const t = document.createElement('div'); t.className='title'; t.textContent = title;
      const by = document.createElement('div'); by.className='by'; by.textContent = author ? ('Oleh ' + author) : 'Tim Data';
      const dt = document.createElement('div'); dt.className='date'; dt.textContent = date || '';
      metaWrap.appendChild(t); metaWrap.appendChild(by); metaWrap.appendChild(dt);
      preview.appendChild(img); preview.appendChild(metaWrap);

      const buttons = document.createElement('div'); buttons.className='share-buttons';

      // WhatsApp share
      const wa = document.createElement('a');
      wa.className = 'share-btn whatsapp';
      wa.href = '#'; wa.setAttribute('role','button');
      wa.title = 'Bagikan lewat WhatsApp';
      wa.innerHTML = '<span class="icon" aria-hidden="true">\n        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M20.5 3.5a11.9 11.9 0 10-3.3 8.3L22 22l3.2-5.2A11.9 11.9 0 0020.5 3.5z" fill="#25D366"/><path d="M17.6 15.2c-.4-.2-2.3-1.1-2.6-1.2-.4-.1-.6-.2-.9.2-.3.4-1.1 1.2-1.4 1.4-.3.2-.6.2-1 .1-.4-.1-1.4-.5-2.6-1.6-1-1-1.7-2.3-1.9-3.1-.2-.8 0-1 .2-1.3.2-.2.4-.6.6-.9.2-.3.3-.5.5-.9.1-.3 0-.6-.1-.9-.1-.2-.9-2.2-1.2-3-.3-.8-.7-.6-1-.6-.3 0-.6 0-.9 0-.3 0-.8.1-1.2.6-.4.5-1.6 1.6-1.6 4.1 0 2.4 1.6 4.7 1.8 5 .2.3 3 4.6 7.6 6.4 4.6 1.8 4.6 1.2 5.4 1.1.8-.1 2.7-1.1 3.1-2.2.4-1.1.4-2.1.3-2.3-.1-.2-.4-.3-.8-.5z" fill="#fff"/></svg>\n      </span><span>WhatsApp</span>';
      wa.addEventListener('click', function(e){
        e.preventDefault();
        const url = location.href;
        const text = `${title} — ${author ? author : 'Tim Data'}\n${date ? date + '\n' : ''}${url}`;
        const shareUrl = 'https://api.whatsapp.com/send?text=' + encodeURIComponent(text);
        window.open(shareUrl,'_blank');
      });

      // Facebook share
      const fb = document.createElement('a');
      fb.className = 'share-btn facebook';
      fb.href = '#'; fb.setAttribute('role','button');
      fb.title = 'Bagikan ke Facebook';
      fb.innerHTML = '<span class="icon" aria-hidden="true">\n        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M22 12.07C22 6.48 17.52 2 11.93 2S2 6.48 2 12.07c0 4.99 3.66 9.12 8.44 9.93v-7.03H8.9v-2.9h1.53V9.41c0-1.51.9-2.34 2.28-2.34.66 0 1.35.12 1.35.12v1.49h-.77c-.76 0-1 .47-1 0v1.13h1.7l-.27 2.9h-1.43V22C18.34 21.19 22 17.06 22 12.07z" fill="#fff"/></svg>\n      </span><span>Facebook</span>';
      fb.addEventListener('click', function(e){
        e.preventDefault();
        const url = location.href;
        const shareUrl = 'https://www.facebook.com/sharer/sharer.php?u=' + encodeURIComponent(url);
        window.open(shareUrl,'_blank','width=720,height=420');
      });

      // Copy link button
      const cp = document.createElement('button');
      cp.className = 'share-btn';
      cp.type = 'button';
      cp.title = 'Salin link ke clipboard';
      cp.innerHTML = '<span class="icon" aria-hidden="true">\n        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg" aria-hidden="true"><path d="M16 1H4c-1.1 0-2 .9-2 2v12h2V3h12V1z" fill="#111"/><path d="M20 5H8c-1.1 0-2 .9-2 2v14c0 1.1.9 2 2 2h12c1.1 0 2-.9 2-2V7c0-1.1-.9-2-2-2zm0 16H8V7h12v14z" fill="#111"/></svg>\n      </span><span>Salin Link</span>';
      cp.addEventListener('click', function(){
        try{ navigator.clipboard.writeText(location.href); cp.textContent = 'Tersalin ✓'; setTimeout(()=> cp.innerHTML = '<span class="icon">🔗</span><span>Salin Link</span>',1500); }catch(e){ alert('Gagal menyalin link'); }
      });

      buttons.appendChild(wa); buttons.appendChild(fb); buttons.appendChild(cp);

      shareBar.appendChild(preview); shareBar.appendChild(buttons);

      // Insert share bar after the first heading or at top of article
      if(titleEl && titleEl.parentNode){ titleEl.parentNode.insertBefore(shareBar, titleEl.nextSibling); }
      else{ articleEl.insertBefore(shareBar, articleEl.firstChild); }
    }
  }catch(e){ console.warn('share injection failed', e); }
});
