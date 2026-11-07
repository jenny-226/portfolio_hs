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

  /* ───── REBOOT 섹션 바로가기 (해시 변경 없음) ───── */
  document.querySelectorAll('[data-jump]').forEach(btn => {
    btn.addEventListener('click', () => {
      const target = document.getElementById(btn.dataset.jump);
      if (target) target.scrollIntoView({ behavior: 'smooth', block: 'start' });
    });
  });
})();
