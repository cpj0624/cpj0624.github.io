/**
 * 主進入點（ES Module）
 * 並行載入 JSON 資料並協調 UI 動效與捲動狀態重算
 */
import { initTimeline } from './timeline.js';
import {
  initTyping,
  initScrollState,
  initScrollReveal,
  initContactActions,
  initQrModal,
} from './ui.js';

document.documentElement.classList.add('js-ready');

document.addEventListener('DOMContentLoaded', async () => {
  // 1. 立即初始化核心互動
  initTyping('陳品均', 170);
  initContactActions();
  initQrModal();
  const refreshScroll = initScrollState();
  initScrollReveal();

  // 2. 載入 JSON 資料並渲染時間軸
  await initTimeline();

  // 3. 動態內容渲染完畢後，重算進度條高度並重新掃描進場動效
  refreshScroll();
  initScrollReveal();
});

// 防止圖片誤拖曳
document.addEventListener('dragstart', (event) => {
  if (event.target && event.target.tagName && event.target.tagName.toLowerCase() === 'img') {
    event.preventDefault();
  }
});
