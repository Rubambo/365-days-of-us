(function () {
  const START_DATE = new Date('2025-07-31T00:00:00');

  function updateDayCount() {
    const now = new Date();
    const days = Math.floor((now - START_DATE) / 86400000);
    document.getElementById('dayCount').textContent = Math.max(days, 1);
  }
  updateDayCount();

  function spawnHearts() {
    const container = document.getElementById('floatingHearts');
    const symbols = ['🤍', '💛', '🐾', '✨'];
    for (let i = 0; i < 14; i++) {
      const el = document.createElement('span');
      el.className = 'floating-heart';
      el.textContent = symbols[i % symbols.length];
      el.style.left = (Math.random() * 100) + '%';
      el.style.animationDuration = (10 + Math.random() * 14) + 's';
      el.style.animationDelay = (Math.random() * 12) + 's';
      el.style.fontSize = (1 + Math.random() * 1.2) + 'rem';
      container.appendChild(el);
    }
  }
  spawnHearts();

  fetch('assets/manifest.json')
    .then(r => r.json())
    .then(data => renderTimeline(data.groups));

  let allPhotos = [];
  let currentIndex = 0;

  function renderTimeline(groups) {
    const main = document.getElementById('timeline');
    let seededRot = 0;

    groups.forEach(group => {
      const section = document.createElement('section');
      section.className = 'month-section';

      const header = document.createElement('div');
      header.className = 'month-header';
      header.innerHTML = `
        <h2 class="month-title">${group.label}</h2>
        <div class="month-line"></div>
        <span class="month-count">${group.photos.length} ${group.photos.length === 1 ? 'photo' : 'photos'}</span>
      `;
      section.appendChild(header);

      const grid = document.createElement('div');
      grid.className = 'photo-grid';

      group.photos.forEach(photo => {
        const globalIndex = allPhotos.length;
        allPhotos.push(photo);

        const card = document.createElement('div');
        card.className = 'polaroid';
        seededRot = (seededRot + 47) % 100;
        const rot = (seededRot / 100 - 0.5) * 6;
        card.style.setProperty('--rot', rot.toFixed(2) + 'deg');
        card.dataset.index = globalIndex;

        const tape = document.createElement('div');
        tape.className = 'tape';
        card.appendChild(tape);

        const img = document.createElement('img');
        img.loading = 'lazy';
        img.src = `assets/photos/thumb/${photo.id}.jpg`;
        img.alt = 'A memory of us';
        card.appendChild(img);

        card.addEventListener('click', () => openLightbox(globalIndex));

        grid.appendChild(card);
      });

      section.appendChild(grid);
      main.appendChild(section);
    });

    document.getElementById('closingStats').textContent =
      `${allPhotos.length} photos, ${groups.length} months, 1 whole year`;

    observeReveal();
  }

  function observeReveal() {
    const io = new IntersectionObserver((entries) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('visible');
          io.unobserve(entry.target);
        }
      });
    }, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });

    document.querySelectorAll('.polaroid').forEach(el => io.observe(el));
  }

  // LIGHTBOX
  const lightbox = document.getElementById('lightbox');
  const lightboxImg = document.getElementById('lightboxImg');

  function openLightbox(index) {
    currentIndex = index;
    showCurrent();
    lightbox.classList.add('open');
  }

  function showCurrent() {
    const photo = allPhotos[currentIndex];
    lightboxImg.src = `assets/photos/full/${photo.id}.jpg`;
  }

  function closeLightbox() {
    lightbox.classList.remove('open');
    lightboxImg.src = '';
  }

  function nextPhoto() {
    currentIndex = (currentIndex + 1) % allPhotos.length;
    showCurrent();
  }

  function prevPhoto() {
    currentIndex = (currentIndex - 1 + allPhotos.length) % allPhotos.length;
    showCurrent();
  }

  document.getElementById('lightboxClose').addEventListener('click', closeLightbox);
  document.getElementById('lightboxNext').addEventListener('click', nextPhoto);
  document.getElementById('lightboxPrev').addEventListener('click', prevPhoto);
  lightbox.addEventListener('click', (e) => { if (e.target === lightbox) closeLightbox(); });

  document.addEventListener('keydown', (e) => {
    if (!lightbox.classList.contains('open')) return;
    if (e.key === 'Escape') closeLightbox();
    if (e.key === 'ArrowRight') nextPhoto();
    if (e.key === 'ArrowLeft') prevPhoto();
  });
})();
