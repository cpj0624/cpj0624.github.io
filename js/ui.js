/**
 * UI 互動模組：
 * 1. 姓名打字機動畫（支援視窗進出重播與減少動態無障礙設定）
 * 2. 頂部即時捲動進度條 ＋ 導覽列狀態 ＋ 區塊高亮
 * 3. 進場漸顯動畫（IntersectionObserver）
 * 4. 電子郵件防爬蟲組裝、一鍵複製、原生分享
 * 5. 名片行動條碼彈窗（焦點回復 ＋ Esc 關閉）
 */
import { copyText, showToast } from './utils.js';

const SITE_URL = 'https://cpj0624.github.io/';
const SITE_TITLE = '陳品均｜個人數位名片';

export function initTyping(text = '陳品均', speed = 170) {
  const target = document.getElementById('hero-typing');
  if (!target) return;

  const prefersReduced = window.matchMedia && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (prefersReduced || !('IntersectionObserver' in window)) {
    target.textContent = text;
    return;
  }

  let index = 0;
  let timer = null;
  let running = false;

  function step() {
    if (index < text.length) {
      target.textContent += text.charAt(index);
      index += 1;
      timer = window.setTimeout(step, speed);
    }
  }

  function reset() {
    window.clearTimeout(timer);
    index = 0;
    target.textContent = '';
    running = false;
  }

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !running) {
          running = true;
          target.textContent = '';
          index = 0;
          timer = window.setTimeout(step, 140);
        } else if (!entry.isIntersecting) {
          reset();
        }
      });
    },
    { threshold: 0.45 }
  );

  observer.observe(target);
}

export function initScrollState() {
  const siteHeader = document.getElementById('site-header');
  const scrollProgressBar = document.getElementById('scroll-progress-bar');
  const navLinks = Array.from(document.querySelectorAll('.nav-link'));
  const observedSections = navLinks
    .map((link) => {
      const id = link.getAttribute('href')?.slice(1);
      return id ? document.getElementById(id) : null;
    })
    .filter(Boolean);

  let ticking = false;

  function update() {
    ticking = false;

    const scrollTop = window.scrollY;
    const scrollableHeight = document.documentElement.scrollHeight - window.innerHeight;

    if (scrollProgressBar) {
      const progress = scrollableHeight > 0 ? Math.min(1, Math.max(0, scrollTop / scrollableHeight)) : 0;
      scrollProgressBar.style.transform = `scaleX(${progress})`;
    }

    if (siteHeader) {
      siteHeader.classList.toggle('is-scrolled', scrollTop > 12);
    }

    const scrollMarker = scrollTop + 140;
    let activeId = '';

    if (window.innerHeight + scrollTop >= document.documentElement.scrollHeight - 24) {
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

  function schedule() {
    if (!ticking) {
      ticking = true;
      window.requestAnimationFrame(update);
    }
  }

  window.addEventListener('scroll', schedule, { passive: true });
  window.addEventListener('resize', schedule, { passive: true });
  update();

  return update;
}

export function initScrollReveal() {
  const revealEls = Array.from(document.querySelectorAll('.reveal:not(.is-visible)'));
  if (!revealEls.length) return;

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
      { threshold: 0.08, rootMargin: '0px 0px -24px 0px' }
    );
    revealEls.forEach((el) => observer.observe(el));
  } else {
    revealEls.forEach((el) => el.classList.add('is-visible'));
  }
}

export function initContactActions() {
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

  const heroCopyBtn = document.getElementById('hero-copy-email-btn');
  if (heroCopyBtn) {
    heroCopyBtn.addEventListener('click', () => {
      handleCopyEmail(heroCopyBtn, '.btn-label', '複製電子郵件', '已複製信箱');
    });
  }

  const inlineCopyBtn = document.getElementById('copy-email-inline-btn');
  if (inlineCopyBtn) {
    inlineCopyBtn.addEventListener('click', () => {
      handleCopyEmail(inlineCopyBtn, '.copy-text', '複製信箱', '已複製');
    });
  }

  const shareTriggers = [
    document.getElementById('share-circle-btn'),
    document.getElementById('share-card-btn'),
  ].filter(Boolean);

  shareTriggers.forEach((btn) => {
    btn.addEventListener('click', async () => {
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
  });
}

export function initQrModal() {
  const qrModal = document.getElementById('qr-modal');
  const modalCloseBtn = document.getElementById('modal-close-btn');
  const modalDoneBtn = document.getElementById('modal-done-btn');
  const modalCopyUrlBtn = document.getElementById('modal-copy-url-btn');
  const qrTriggers = [
    document.getElementById('nav-qr-btn'),
    document.getElementById('hero-qr-btn'),
    document.getElementById('open-qr-circle-btn'),
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
      if (event.target === qrModal) closeQrModal();
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
}
