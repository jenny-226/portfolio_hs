// 탭 전환 · 이미지 확대(라이트박스) · 빈 이미지 처리 · 섹션 바로가기
(function () {
  const TABS = ['intro', 'cosmoa', 'reboot', 'health'];
  const tabLinks = document.querySelectorAll('.tab');
  const panels = document.querySelectorAll('.panel');

  /* ───── 탭 전환 (URL 해시) ───── */
  function currentTab() {
    const id = location.hash.replace('#', '');
    return TABS.includes(id) ? id : 'intro';
  }

  function showTab(id, scroll) {
    panels.forEach(p => { p.hidden = p.dataset.panel !== id; });
    tabLinks.forEach(a => {
      if (a.dataset.tab === id) a.setAttribute('aria-current', 'page');
      else a.removeAttribute('aria-current');
    });
    const active = document.querySelector('.tab[aria-current="page"]');
    if (active) active.scrollIntoView({ block: 'nearest', inline: 'nearest' });
    if (scroll) window.scrollTo(0, 0);
  }

  window.addEventListener('hashchange', () => showTab(currentTab(), true));
  showTab(currentTab(), false);

  /* ───── 빈 이미지 → 회색 점선 자리표시 ───── */
  function toPlaceholder(img) {
    const frame = img.closest('.frame');
    const ph = document.createElement('span');
    ph.className = 'ph';
    ph.innerHTML = '<span>이미지 준비 중</span><small></small>';
    ph.querySelector('small').textContent = img.alt;
    ph.setAttribute('role', 'img');
    ph.setAttribute('aria-label', '이미지 준비 중: ' + img.alt);
    img.replaceWith(ph);
    if (frame) {
      frame.disabled = true;
      frame.classList.add('is-empty');
    }
  }

  document.querySelectorAll('.frame img').forEach(img => {
    if (img.complete && img.naturalWidth === 0) toPlaceholder(img);
    else img.addEventListener('error', () => toPlaceholder(img), { once: true });
  });

  /* ───── 라이트박스 ───── */
  const box = document.getElementById('lightbox');
  const boxImg = box.querySelector('.lightbox-img');
  const boxCap = box.querySelector('.lightbox-cap');

  document.addEventListener('click', e => {
    const frame = e.target.closest('.frame');
    if (!frame || frame.disabled) return;
    const img = frame.querySelector('img');
    if (!img) return;
    boxImg.src = img.currentSrc || img.src;
    boxImg.alt = img.alt;
    const fig = frame.closest('figure');
    const cap = fig && fig.querySelector('figcaption');
    boxCap.textContent = cap ? cap.textContent : img.alt;
    box.showModal();
  });

  box.querySelector('.lightbox-close').addEventListener('click', () => box.close());
  // 바깥(backdrop) 클릭 시 닫기
  box.addEventListener('click', e => { if (e.target === box) box.close(); });
  box.addEventListener('close', () => { boxImg.removeAttribute('src'); });

  /* ───── 이미지 슬라이드 (이전 · 다음 · 점 · 스와이프 · 방향키) ───── */
  document.querySelectorAll('[data-gallery]').forEach(gal => {
    const slides = [...gal.querySelectorAll('.gallery-slide')];
    const count = gal.querySelector('.gallery-count');
    const title = gal.querySelector('.gallery-title');
    const desc = gal.querySelector('.gallery-desc');
    const dotsWrap = gal.querySelector('.gallery-dots');
    let index = 0;

    const dots = slides.map((s, i) => {
      const d = document.createElement('button');
      d.type = 'button';
      d.setAttribute('role', 'tab');
      d.setAttribute('aria-label', (i + 1) + '번째: ' + s.dataset.title);
      d.addEventListener('click', () => go(i));
      dotsWrap.appendChild(d);
      return d;
    });

    function go(i) {
      index = (i + slides.length) % slides.length;
      slides.forEach((s, n) => { s.hidden = n !== index; });
      dots.forEach((d, n) => d.setAttribute('aria-selected', n === index ? 'true' : 'false'));
      const s = slides[index];
      count.textContent = (index + 1) + ' / ' + slides.length;
      title.textContent = s.dataset.title;
      desc.textContent = s.dataset.desc;
      // 다음 이미지를 미리 불러와 넘길 때 빈 화면이 보이지 않게
      const next = slides[(index + 1) % slides.length].querySelector('img');
      if (next) next.loading = 'eager';
    }

    gal.querySelector('.gallery-nav--prev').addEventListener('click', () => go(index - 1));
    gal.querySelector('.gallery-nav--next').addEventListener('click', () => go(index + 1));
    gal.addEventListener('keydown', e => {
      if (e.key === 'ArrowLeft') go(index - 1);
      if (e.key === 'ArrowRight') go(index + 1);
    });

    // 터치 스와이프
    let startX = null;
    const track = gal.querySelector('.gallery-track');
    track.addEventListener('touchstart', e => { startX = e.touches[0].clientX; }, { passive: true });
    track.addEventListener('touchend', e => {
      if (startX === null) return;
      const dx = e.changedTouches[0].clientX - startX;
      if (Math.abs(dx) > 40) go(dx < 0 ? index + 1 : index - 1);
      startX = null;
    });

    go(0);
  });

  /* ───── REBOOT 섹션 바로가기 (해시 변경 없음) ───── */
  document.querySelectorAll('[data-jump]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.jump);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();
