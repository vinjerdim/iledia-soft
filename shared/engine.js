'use strict';

/* ============================================================
   shared/engine.js — runtime shared by every lesson
   ============================================================
   Owns: saved progress (localStorage), stage navigation and
   locking, the progress bar, and toast notices. Each lesson's
   app.js keeps its own stage renderers and state shape and
   plugs them in through Engine.createLesson().

   Load order in a lesson page: data.js, engine.js, app.js.
   Page shell ids every lesson must provide:
     #stageNavList  #stageContainer  #progressFill
     #progressLabel #appNotice       #resetAppBtn
   ============================================================ */

const Engine = (function () {

  function esc(value) {
    if (value === null || value === undefined) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  let noticeTimer = null;
  let defaultNoticeMs = 3200;

  function showNotice(message, duration) {
    const el = document.getElementById('appNotice');
    if (!el) return;
    el.textContent = message;
    el.classList.add('is-visible');
    if (noticeTimer) clearTimeout(noticeTimer);
    noticeTimer = setTimeout(function () {
      el.classList.remove('is-visible');
    }, duration || defaultNoticeMs);
  }

  function confirmAction(message) {
    return window.confirm(message);
  }

  function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  /* Merge saved progress into the fresh default state so that fields added
     to a lesson later still get their defaults for returning students.
     - objects merge key by key; a saved non-object never replaces a default object
     - lists of records (one entry per case/question) keep the default length
       and merge per index
     - everything else (primitives, plain lists) is taken from the saved value */
  function mergeSaved(target, saved) {
    Object.keys(saved).forEach(function (key) {
      const value = saved[key];
      const current = target[key];
      if (Array.isArray(current) && Array.isArray(value) && current.length && isObject(current[0])) {
        value.forEach(function (item, i) {
          if (isObject(current[i]) && isObject(item)) mergeSaved(current[i], item);
        });
      } else if (isObject(current)) {
        if (isObject(value)) mergeSaved(current, value);
      } else {
        target[key] = value;
      }
    });
  }

  /* config:
       storageKey   localStorage key (bump the suffix when the saved shape breaks)
       stages       [{ id, label, render(container) }] in learning order
       createState  () => fresh state object; must include currentStage
                    and completedStages
       lockedNotice optional (label) => message shown when a stage is still locked
       noticeMs     optional default toast duration
       onResetClick optional handler for #resetAppBtn (default: window.confirm,
                    then resetProgress)                                            */
  function createLesson(config) {
    const stages = config.stages;
    const state = config.createState();
    if (config.noticeMs) defaultNoticeMs = config.noticeMs;

    function stageIndex(id) {
      return stages.findIndex(function (stage) { return stage.id === id; });
    }

    function saveState() {
      try {
        localStorage.setItem(config.storageKey, JSON.stringify(state));
      } catch (e) { }
    }

    function loadState() {
      try {
        const raw = localStorage.getItem(config.storageKey);
        if (!raw) return false;
        const saved = JSON.parse(raw);
        if (!isObject(saved)) return false;
        mergeSaved(state, saved);
        return true;
      } catch (e) {
        return false;
      }
    }

    function clearState() {
      try { localStorage.removeItem(config.storageKey); } catch (e) { }
      Object.keys(state).forEach(function (key) { delete state[key]; });
      Object.assign(state, config.createState());
    }

    function updateProgress() {
      const total = stages.length;
      const done = Object.keys(state.completedStages).length;
      const pct = Math.round((done / total) * 100);
      const barFill = document.getElementById('progressFill');
      const barLabel = document.getElementById('progressLabel');
      if (barFill) barFill.style.width = pct + '%';
      if (barLabel) barLabel.textContent = done + ' dari ' + total + ' tahap selesai';
    }

    function updateStageNav() {
      const currentIdx = stageIndex(state.currentStage);
      document.querySelectorAll('.stage-nav__item').forEach(function (item) {
        const stageId = item.dataset.stage;
        const idx = stageIndex(stageId);
        item.removeAttribute('aria-current');
        item.classList.remove('is-complete');
        item.disabled = false;

        if (stageId === state.currentStage) {
          item.setAttribute('aria-current', 'step');
        } else if (state.completedStages[stageId]) {
          item.classList.add('is-complete');
        }

        if (idx > currentIdx && !state.completedStages[stages[idx - 1].id]) {
          item.disabled = true;
        }
      });
    }

    function buildStageNav() {
      const nav = document.getElementById('stageNavList');
      if (!nav) return;
      nav.innerHTML = stages.map(function (stage, idx) {
        return `<li><button type="button" class="stage-nav__item" data-stage="${esc(stage.id)}">
      <span class="stage-nav__num">${idx + 1}</span>
      <span class="stage-nav__label">${esc(stage.label)}</span>
    </button></li>`;
      }).join('');
    }

    function renderCurrentStage() {
      const container = document.getElementById('stageContainer');
      if (!container) return;
      container.innerHTML = '';
      updateProgress();

      const stage = stages[stageIndex(state.currentStage)];
      if (stage) stage.render(container);
      else container.innerHTML = '<p class="panel">Tahap tidak ditemukan.</p>';
    }

    function navigateTo(stageId) {
      const targetIdx = stageIndex(stageId);
      const currentIdx = stageIndex(state.currentStage);
      if (targetIdx === -1) return;

      if (targetIdx > currentIdx) {
        for (let i = currentIdx; i < targetIdx; i++) {
          if (!state.completedStages[stages[i].id]) {
            const label = stages[i].label;
            showNotice(config.lockedNotice ? config.lockedNotice(label) : 'Selesaikan tahap ' + label + ' terlebih dahulu.');
            return;
          }
        }
      }

      state.currentStage = stageId;
      saveState();
      updateStageNav();
      renderCurrentStage();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function completeStage(stageId) {
      state.completedStages[stageId] = true;
      saveState();
      updateStageNav();
      updateProgress();
    }

    function resetProgress() {
      clearState();
      saveState();
      buildStageNav();
      updateStageNav();
      renderCurrentStage();
    }

    function init() {
      loadState();
      buildStageNav();
      updateStageNav();

      document.getElementById('stageNavList').addEventListener('click', function (event) {
        const button = event.target.closest('.stage-nav__item');
        if (button && button.dataset.stage) navigateTo(button.dataset.stage);
      });

      const resetBtn = document.getElementById('resetAppBtn');
      if (resetBtn) {
        resetBtn.addEventListener('click', config.onResetClick || function () {
          if (!confirmAction('Reset seluruh aplikasi? Semua progres pada materi ini akan dihapus.')) return;
          resetProgress();
        });
      }

      renderCurrentStage();
    }

    return {
      state: state,
      stageIds: stages.map(function (stage) { return stage.id; }),
      saveState: saveState,
      loadState: loadState,
      clearState: clearState,
      updateProgress: updateProgress,
      updateStageNav: updateStageNav,
      buildStageNav: buildStageNav,
      renderCurrentStage: renderCurrentStage,
      navigateTo: navigateTo,
      completeStage: completeStage,
      resetProgress: resetProgress,
      init: init
    };
  }

  return {
    createLesson: createLesson,
    esc: esc,
    showNotice: showNotice,
    confirmAction: confirmAction
  };
})();
