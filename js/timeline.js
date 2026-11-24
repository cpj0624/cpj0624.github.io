/**
 * 垂直軌道圓點時間軸渲染模組
 * 支援由 data/experiences.json 動態產生，無外部連結時維持純瀏覽模式
 */
import { escapeFields, escapeHtml } from './utils.js';

function renderRow(rawItem) {
  const item = escapeFields(rawItem, ['term', 'title', 'subtitle', 'role', 'link']);
  const inner = `
    <span class="timeline-term">${item.term || ''}</span>
    <span class="timeline-title">${item.title || ''}</span>
    <span class="timeline-sub">${item.subtitle || ''}</span>
    <span class="timeline-role">${item.role || ''}</span>
  `;

  if (item.link) {
    return `
      <li>
        <a class="timeline-row timeline-row--link" href="${item.link}" target="_blank" rel="noopener noreferrer">
          ${inner}
        </a>
      </li>`;
  }

  return `
      <li>
        <div class="timeline-row">
          ${inner}
        </div>
      </li>`;
}

function renderGroup(group) {
  const label = escapeHtml(group.label || '');
  const rows = (group.items || []).map(renderRow).join('');
  const collapsedAttr = group.collapsed ? ' hidden' : '';
  const extraClass = group.collapsed ? ' timeline-group--extra' : '';

  return `
    <div class="timeline-group${extraClass}"${collapsedAttr}>
      <h3 class="timeline-group-label">${label}</h3>
      <ul class="timeline-rows">${rows}</ul>
    </div>`;
}

function renderCta(rawCta) {
  if (!rawCta) return '';
  const cta = escapeFields(rawCta, ['title', 'subtitle', 'action', 'href']);
  return `
    <div class="timeline-group timeline-group--cta">
      <div class="timeline-group-spacer" aria-hidden="true"></div>
      <ul class="timeline-rows">
        <li>
          <a class="timeline-row timeline-row--cta" href="${cta.href || '#contact'}">
            <span class="timeline-term">交流</span>
            <span class="timeline-title">${cta.title}</span>
            <span class="timeline-sub">${cta.subtitle}</span>
            <span class="timeline-role">${cta.action}</span>
          </a>
        </li>
      </ul>
    </div>`;
}

export async function initTimeline() {
  const container = document.getElementById('experience-container');
  const countEl = document.getElementById('experience-count');
  const toggleBtn = document.getElementById('experience-toggle');
  if (!container) return;

  try {
    const res = await fetch(`data/experiences.json?t=${Date.now()}`, { cache: 'no-store' });
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    const groups = Array.isArray(data.groups) ? data.groups : [];

    container.innerHTML = groups.map(renderGroup).join('') + renderCta(data.cta);

    // 計算統計筆數（排除學歷，或標明經歷＋學歷）
    const totalRecords = groups
      .filter((g) => g.id !== 'education')
      .reduce((sum, g) => sum + (g.items?.length || 0), 0);
    if (countEl && totalRecords > 0) {
      countEl.textContent = `${totalRecords} 筆經歷`;
    }

    // 未來若於 JSON 設 collapsed: true，自動啟用展開／收合鈕
    const extras = container.querySelectorAll('.timeline-group--extra');
    if (toggleBtn && extras.length > 0) {
      let expanded = false;
      const labelEl = toggleBtn.querySelector('.section-toggle-label');
      const actionEl = toggleBtn.querySelector('.section-toggle-action');
      const sync = () => {
        extras.forEach((el) => {
          el.hidden = !expanded;
        });
        toggleBtn.setAttribute('aria-expanded', String(expanded));
        if (labelEl) labelEl.textContent = expanded ? '已顯示全部經歷' : '查看更多經歷';
        if (actionEl) actionEl.textContent = expanded ? '收合 ←' : '查看全部 →';
      };
      toggleBtn.addEventListener('click', () => {
        expanded = !expanded;
        sync();
      });
      toggleBtn.hidden = false;
      sync();
    }
  } catch (err) {
    console.error('載入 data/experiences.json 失敗:', err);
    container.innerHTML = '<p class="timeline-fallback">暫時無法載入經歷資料，請重新整理後再試。</p>';
  }
}
