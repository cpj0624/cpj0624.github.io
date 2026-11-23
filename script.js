(() => {
  'use strict';

  const SITE_URL = 'https://cpj0624.github.io/';
  const SITE_TITLE = '陳品均｜個人數位名片';

  document.documentElement.classList.add('js-ready');

  // 1. 電子郵件防靜態爬蟲組裝與還原
  const emailLink = document.getElementById('link-email');
  const emailDisplay = document.getElementById('email-display');
  let emailAddress = '';

  if (emailLink) {
    const user = emailLink.dataset.u || '';
    const domain = emailLink.dataset.d || '';
    if (user && domain) {
      emailAddress = `${user}@${domain}`;
      emailLink.setAttribute('href', `mailto:${emailAddress}`);
      if (emailDisplay) {
        emailDisplay.textContent = emailAddress;
      }
    }
  }

  // 2. 浮動提示 Toast
  const toastEl = document.getElementById('toast');
  let toastTimer = null;

  function showToast(message) {
    if (!toastEl) return;
    toastEl.textContent = message;
    toastEl.classList.add('is-visible');
    window.clearTimeout(toastTimer);
    toastTimer = window.setTimeout(() => {
      toastEl.classList.remove('is-visible');
    }, 2200);
  }

  // 3. 通用剪貼簿複製（支援現代 Clipboard API 與舊瀏覽器備援）
  async function copyText(text) {
    if (!text) return false;
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch {
        // 降級至 textarea 備援方案
      }
    }
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.setAttribute('readonly', '');
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    ta.style.pointerEvents = 'none';
    document.body.appendChild(ta);
    ta.select();
    let ok = false;
    try {
      ok = document.execCommand('copy');
    } catch {
      ok = false;
    }
    document.body.removeChild(ta);
    return ok;
  }

  // 4. 複製電子郵件按鈕（Hero 主按鈕 ＋ 聯絡列表按鈕）
  const heroCopyBtn = document.getElementById('hero-copy-email-btn');
  const inlineCopyBtn = document.getElementById('copy-email-inline-btn');

  async function handleCopyEmail(triggerEl, labelSelector, defaultLabel, copiedLabel) {
    if (!emailAddress) return;
    const ok = await copyText(emailAddress);
    if (!ok) {
      showToast('無法自動複製，請手動選取信箱地址');
      return;
    }

    showToast(`已複製信箱：${emailAddress}`);
    if (triggerEl) {
      const labelEl = triggerEl.querySelector(labelSelector);
      triggerEl.classList.add('is-copied');
      if (labelEl) labelEl.textContent = copiedLabel;

      window.clearTimeout(triggerEl._resetTimer);
      triggerEl._resetTimer = window.setTimeout(() => {
        triggerEl.classList.remove('is-copied');
        if (labelEl) labelEl.textContent = defaultLabel;
      }, 2000);
    }
  }

  if (heroCopyBtn) {
    heroCopyBtn.addEventListener('click', () => {
      handleCopyEmail(heroCopyBtn, '.btn-label', '複製電子郵件', '已複製信箱');
    });
  }

  if (inlineCopyBtn) {
    inlineCopyBtn.addEventListener('click', () => {
      handleCopyEmail(inlineCopyBtn, '.copy-text', '複製', '已複製');
    });
  }

  // 5. 分享名片連結
  const shareBtn = document.getElementById('share-card-btn');
  if (shareBtn) {
    shareBtn.addEventListener('click', async () => {
      if (navigator.share) {
        try {
          await navigator.share({
            title: SITE_TITLE,
            text: '陳品均｜國立臺中科技大學資訊工程科五專生',
            url: SITE_URL,
          });
          return;
        } catch (err) {
          if (err && err.name === 'AbortError') return;
        }
      }
      const ok = await copyText(SITE_URL);
      showToast(ok ? '已複製名片網址' : SITE_URL);
    });
  }

  // 6. 名片行動條碼彈窗（含焦點回復與 Esc 關閉）
  const qrModal = document.getElementById('qr-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalDoneBtn = document.getElementById('modal-done-btn');
  const modalCopyUrlBtn = document.getElementById('modal-copy-url-btn');
  const qrTriggers = [
    document.getElementById('nav-qr-btn'),
    document.getElementById('hero-qr-btn'),
    document.getElementById('open-qr-btn'),
  ].filter(Boolean);

  let lastFocusedEl = null;

  function openQrModal(trigger) {
    if (!qrModal) return;
    lastFocusedEl = trigger || document.activeElement;
    qrModal.hidden = false;
    document.body.classList.add('modal-open');
    window.requestAnimationFrame(() => {
      qrModal.classList.add('is-open');
      if (modalCloseBtn) modalCloseBtn.focus();
    });
  }

  function closeQrModal() {
    if (!qrModal || qrModal.hidden) return;
    qrModal.classList.remove('is-open');
    document.body.classList.remove('modal-open');
    window.setTimeout(() => {
      if (!qrModal.classList.contains('is-open')) {
        qrModal.hidden = true;
      }
    }, 240);
    if (lastFocusedEl && typeof lastFocusedEl.focus === 'function') {
      lastFocusedEl.focus();
    }
  }

  qrTriggers.forEach((btn) => {
    btn.addEventListener('click', () => openQrModal(btn));
  });

  if (modalCloseBtn) modalCloseBtn.addEventListener('click', closeQrModal);
  if (modalDoneBtn) modalDoneBtn.addEventListener('click', closeQrModal);

  if (qrModal) {
    qrModal.addEventListener('click', (event) => {
      if (event.target === qrModal) {
        closeQrModal();
      }
    });
  }

  document.addEventListener('keydown', (event) => {
    if (event.key === 'Escape' && qrModal && !qrModal.hidden) {
      closeQrModal();
    }
  });

  if (modalCopyUrlBtn) {
    modalCopyUrlBtn.addEventListener('click', async () => {
      const ok = await copyText(SITE_URL);
      showToast(ok ? '已複製名片網址' : SITE_URL);
    });
  }

  // 7. 捲動狀態：導覽列細線 ＋ 區塊高亮
  const siteHeader = document.getElementById('site-header');
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  const observedSections = navLinks
    .map((link) => {
      const id = link.getAttribute('href')?.slice(1);
      return id ? document.getElementById(id) : null;
    })
    .filter(Boolean);

  function updateScrollState() {
    if (siteHeader) {
      siteHeader.classList.toggle('is-scrolled', window.scrollY > 12);
    }

    const scrollMarker = window.scrollY + 140;
    let activeId = '';

    // 接近頁面底部時高亮最後一個區塊
    if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 24) {
      activeId = observedSections[observedSections.length - 1]?.id || '';
    } else {
      for (const sec of observedSections) {
        if (sec.offsetTop <= scrollMarker) {
          activeId = sec.id;
        }
      }
    }

    navLinks.forEach((link) => {
      const targetId = link.getAttribute('href')?.slice(1);
      link.classList.toggle('is-active', targetId === activeId);
    });
  }

  window.addEventListener('scroll', updateScrollState, { passive: true });
  updateScrollState();

  // 8. 進場微動效（IntersectionObserver）
  const revealEls = Array.from(document.querySelectorAll('.reveal'));
  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('is-visible');
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.08, rootMargin: '0px 0px -32px 0px' }
    );
    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }
})();
