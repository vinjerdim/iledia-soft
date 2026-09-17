'use strict';

const STAGES = [
  'orientasi',
  'bekal',
  'dokumen',
  'peta',
  'analisis',
  'evaluasi',
  'refleksi',
  'selesai'
];

const STAGE_LABELS = [
  'Orientasi',
  'Bekal Konsep',
  'Bedah Dokumen',
  'Peta Entitas',
  'Analisis Mandiri',
  'Evaluasi',
  'Refleksi',
  'Selesai'
];

const STORAGE_KEY = 'mpi-1-2-v2';

const defaultScore = function () {
  return {
    prepCorrect: 0,
    prepTotal: 0,
    classifCorrect: 0,
    classifTotal: 0,
    mappingCorrect: 0,
    mappingTotal: 0,
    caseCorrect: 0,
    caseTotal: 0,
    evaluationCorrect: 0,
    evaluationTotal: 0
  };
};

const State = {
  currentStage: 'orientasi',
  completedStages: {},

  prepAnswers: {},
  prepChecked: false,

  classification: {},
  classifChecked: false,

  attrAssignments: {},
  selectedAttrId: null,
  mappingChecked: false,

  caseAnswers: {},
  caseChecked: false,

  evaluationAnswers: {},
  evaluationChecked: false,

  reflections: {},

  score: defaultScore()
};

function saveState() {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(State));
  } catch (e) { }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw);
    Object.assign(State, parsed);
    State.score = Object.assign(defaultScore(), State.score || {});
    State.prepAnswers = State.prepAnswers || {};
    State.classification = State.classification || {};
    State.attrAssignments = State.attrAssignments || {};
    State.caseAnswers = State.caseAnswers || {};
    State.evaluationAnswers = State.evaluationAnswers || {};
    State.reflections = State.reflections || {};
    return true;
  } catch (e) {
    return false;
  }
}

function clearState() {
  try { localStorage.removeItem(STORAGE_KEY); } catch (e) { }
  State.currentStage = 'orientasi';
  State.completedStages = {};
  State.prepAnswers = {};
  State.prepChecked = false;
  State.classification = {};
  State.classifChecked = false;
  State.attrAssignments = {};
  State.selectedAttrId = null;
  State.mappingChecked = false;
  State.caseAnswers = {};
  State.caseChecked = false;
  State.evaluationAnswers = {};
  State.evaluationChecked = false;
  State.reflections = {};
  State.score = defaultScore();
}

function navigateTo(stageId) {
  const targetIdx = STAGES.indexOf(stageId);
  const currentIdx = STAGES.indexOf(State.currentStage);
  if (targetIdx === -1) return;

  if (targetIdx > currentIdx) {
    for (let i = currentIdx; i < targetIdx; i += 1) {
      if (!State.completedStages[STAGES[i]]) {
        showNotice('Selesaikan tahap ' + STAGE_LABELS[i] + ' terlebih dahulu.');
        return;
      }
    }
  }

  State.currentStage = stageId;
  saveState();
  updateStageNav();
  renderCurrentStage();
  window.scrollTo({ top: 0, behavior: 'smooth' });
}

function completeStage(stageId) {
  State.completedStages[stageId] = true;
  saveState();
  updateStageNav();
}

function updateStageNav() {
  const items = document.querySelectorAll('.stage-nav__item');
  const currentIdx = STAGES.indexOf(State.currentStage);

  items.forEach(function (item) {
    const stageId = item.dataset.stage;
    const idx = STAGES.indexOf(stageId);
    item.removeAttribute('aria-current');
    item.classList.remove('is-complete');
    item.disabled = false;

    if (stageId === State.currentStage) {
      item.setAttribute('aria-current', 'step');
    } else if (State.completedStages[stageId]) {
      item.classList.add('is-complete');
    }

    if (idx > currentIdx && !State.completedStages[STAGES[idx - 1]]) {
      item.disabled = true;
    }
  });
}

function updateProgress() {
  const total = STAGES.length;
  const done = Object.keys(State.completedStages).length;
  const pct = Math.round((done / total) * 100);
  const progressFill = document.getElementById('progressFill');
  const progressLabel = document.getElementById('progressLabel');

  if (progressFill) progressFill.style.width = pct + '%';
  if (progressLabel) progressLabel.textContent = done + ' dari ' + total + ' tahap selesai';
}

function renderCurrentStage() {
  const container = document.getElementById('stageContainer');
  if (!container) return;

  container.innerHTML = '';
  updateProgress();

  switch (State.currentStage) {
    case 'orientasi':
      renderOrientasi(container);
      break;
    case 'bekal':
      renderBekal(container);
      break;
    case 'dokumen':
      renderDokumen(container);
      break;
    case 'peta':
      renderPeta(container);
      break;
    case 'analisis':
      renderAnalisis(container);
      break;
    case 'evaluasi':
      renderEvaluasi(container);
      break;
    case 'refleksi':
      renderRefleksi(container);
      break;
    case 'selesai':
      renderSelesai(container);
      break;
    default:
      container.innerHTML = '<p>Tahap tidak ditemukan.</p>';
      break;
  }
}

function renderOrientasi(container) {
  const activityHTML = DATA.activityFlow.map(function (item, idx) {
    return `<div class="activity-flow__item">
      <span class="activity-flow__num">${idx + 1}</span>
      <div class="activity-flow__text">
        <strong>${esc(item.title)}</strong>
        <span>${esc(item.description)}</span>
      </div>
    </div>`;
  }).join('');

  container.innerHTML = `
    <section aria-label="Orientasi">
      <div class="stage-head">
        <span class="stage-head__kicker">TAHAP 1 — ORIENTASI</span>
        <p class="stage-head__goal">Tujuan: Memahami target belajar, urutan aktivitas, dan cara memakai media interaktif ini.</p>
      </div>

      <div class="panel panel--hero">
        <h2>${esc(DATA.meta.title)}</h2>
        <p style="font-size:1.05rem;"><strong>Tujuan Pembelajaran:</strong><br>${esc(DATA.meta.goal)}</p>
        <div class="panel panel--info" style="margin-bottom:0;">
          <h3>Rangkaian aktivitas pembelajaran</h3>
          <div class="activity-flow">${activityHTML}</div>
        </div>
      </div>

      <div class="panel panel--compact">
        <h3>Cara belajar pada media ini</h3>
        <div class="hero-steps">
          <div class="hero-steps__item"><span class="hero-steps__num">1</span>Baca penjelasan singkat pada setiap tahap sebelum menjawab pertanyaan.</div>
          <div class="hero-steps__item"><span class="hero-steps__num">2</span>Gunakan petunjuk kalimat untuk membedakan entitas, atribut, dan data yang bukan fokus inti.</div>
          <div class="hero-steps__item"><span class="hero-steps__num">3</span>Perhatikan feedback setelah memeriksa jawaban agar alasan berpikirmu semakin kuat.</div>
          <div class="hero-steps__item"><span class="hero-steps__num">4</span>Simpan pemahamanmu untuk dipakai lagi saat menganalisis kasus baru.</div>
        </div>
      </div>

      <div class="panel panel--compact panel--warning">
        <p style="margin:0;font-size:0.88rem;">
          <strong>Catatan:</strong> Setiap aktivitas tanya-jawab di media ini selalu diawali penjelasan. Fokus utamanya adalah menganalisis data inti yang dibutuhkan sistem.
        </p>
      </div>

      <div class="btn-group btn-group--end">
        <button type="button" class="btn btn--primary btn--large" id="startBtn">Mulai Belajar →</button>
      </div>
    </section>`;

  document.getElementById('startBtn').addEventListener('click', function () {
    completeStage('orientasi');
    navigateTo('bekal');
  });
}

function renderBekal(container) {
  const stageData = DATA.conceptPrep;
  const checked = State.prepChecked;
  const allAnswered = stageData.questions.every(function (question) {
    return !!State.prepAnswers[question.id];
  });

  const cardsHTML = stageData.cards.map(function (card) {
    return `<div class="concept-card">
      <span class="concept-card__icon">${card.icon}</span>
      <div class="concept-card__term">${esc(card.term)}</div>
      <p class="concept-card__def">${esc(card.definition)}</p>
      <div class="concept-card__example">${esc(card.example)}</div>
    </div>`;
  }).join('');

  const signalsHTML = stageData.signals.map(function (signal) {
    return '<li>' + esc(signal) + '</li>';
  }).join('');

  let scoreHTML = '';
  if (checked) {
    const correct = stageData.questions.filter(function (question) {
      return State.prepAnswers[question.id] === question.correct;
    }).length;
    const total = stageData.questions.length;
    scoreHTML = `<div class="feedback-box feedback-box--${correct === total ? 'success' : 'warning'}" style="margin-bottom:var(--space-4);">
      <span class="feedback-box__icon">${correct === total ? '📘' : '🧭'}</span>
      <div class="feedback-box__body"><strong>${correct} dari ${total} jawaban tepat.</strong>${correct === total ? '<br>Bekal konsepmu sudah siap untuk membaca dokumen spesifikasi.' : '<br>Baca lagi penjelasannya dan cocokkan dengan feedback pada tiap soal.'}</div>
    </div>`;
  }

  const questionsHTML = stageData.questions.map(function (question) {
    const current = State.prepAnswers[question.id] || null;
    const feedback = checked && current ? question.feedback[current] : '';
    const isCorrect = current === question.correct;

    return `<div class="question-card">
      <div class="question-card__prompt">${esc(question.prompt)}</div>
      <div class="choice-stack">
        ${question.options.map(function (option) {
          let cls = 'choice-option';
          if (current === option.id) cls += ' is-selected';
          if (checked) {
            if (option.id === question.correct) cls += ' is-correct';
            else if (current === option.id) cls += ' is-incorrect';
          }
          return `<label class="${cls}">
            <input type="radio" name="${esc(question.id)}" value="${esc(option.id)}" ${current === option.id ? 'checked' : ''}>
            <span>${esc(option.label)}</span>
          </label>`;
        }).join('')}
      </div>
      <div class="question-feedback ${checked && current ? (isCorrect ? 'is-correct' : 'is-incorrect') : ''}">${feedback}</div>
    </div>`;
  }).join('');

  container.innerHTML = `
    <section aria-label="Bekal konsep">
      <div class="stage-head">
        <span class="stage-head__kicker">TAHAP 2 — BEKAL KONSEP</span>
        <p class="stage-head__goal">Tujuan: Memahami apa yang dicari dari dokumen spesifikasi sistem sebelum mulai menjawab pertanyaan.</p>
      </div>

      <div class="panel">
        <p style="font-size:0.88rem;color:var(--color-ink-muted);">${esc(stageData.intro)}</p>
        <div class="concept-cards">${cardsHTML}</div>
      </div>

      <div class="panel panel--accent">
        <h3>Petunjuk cepat saat membaca spesifikasi</h3>
        <ul>${signalsHTML}</ul>
      </div>

      <div class="panel">
        <h3>Cek pemahaman awal</h3>
        <p style="font-size:0.88rem;color:var(--color-ink-muted);">Sekarang jawab pertanyaan berikut berdasarkan penjelasan yang baru kamu baca.</p>
        ${scoreHTML}
        <div class="question-stack">${questionsHTML}</div>
        <div class="btn-group btn-group--spread">
          <button type="button" class="btn btn--ghost" id="retryPrepBtn" style="${checked ? '' : 'visibility:hidden'}">↩ Coba Lagi</button>
          <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;">
            <button type="button" class="btn btn--primary" id="checkPrepBtn" ${allAnswered ? '' : 'disabled'}>${checked ? '✓ Periksa Ulang' : 'Periksa Jawaban'}</button>
            ${checked ? '<button type="button" class="btn btn--primary" id="nextFromPrep">Lanjut →</button>' : ''}
          </div>
        </div>
      </div>
    </section>`;

  container.querySelectorAll('.choice-option input[type="radio"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
      State.prepAnswers[radio.name] = radio.value;
      State.prepChecked = false;
      saveState();
      renderBekal(container);
    });
  });

  document.getElementById('checkPrepBtn').addEventListener('click', function () {
    State.prepChecked = true;
    State.score.prepCorrect = stageData.questions.filter(function (question) {
      return State.prepAnswers[question.id] === question.correct;
    }).length;
    State.score.prepTotal = stageData.questions.length;
    saveState();
    renderBekal(container);
  });

  const retryBtn = document.getElementById('retryPrepBtn');
  if (retryBtn) {
    retryBtn.addEventListener('click', function () {
      if (!confirmAction('Hapus feedback tahap ini dan coba lagi?')) return;
      State.prepChecked = false;
      saveState();
      renderBekal(container);
    });
  }

  const nextBtn = document.getElementById('nextFromPrep');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      completeStage('bekal');
      navigateTo('dokumen');
    });
  }
}

function parseMarkedParagraphs(paragraphs) {
  return paragraphs.map(function (paragraph) {
    return paragraph.replace(/\{([^|]+)\|([^}]+)\}/g, function (_, id, text) {
      const chosen = State.classification[id];
      const cls = chosen ? 'candidate-ref--' + chosen : 'candidate-ref--unclassified';
      return '<span class="candidate-ref ' + cls + '">' + esc(text) + '</span>';
    });
  });
}

function renderDokumen(container) {
  const stageData = DATA.specAnalysis;
  const checked = State.classifChecked;
  const allAnswered = stageData.candidates.every(function (candidate) {
    return !!State.classification[candidate.id];
  });

  const paragraphsHTML = parseMarkedParagraphs(stageData.paragraphs).map(function (paragraph) {
    return '<p>' + paragraph + '</p>';
  }).join('');

  let scoreHTML = '';
  if (checked) {
    const correct = stageData.candidates.filter(function (candidate) {
      return State.classification[candidate.id] === candidate.correct;
    }).length;
    const total = stageData.candidates.length;
    scoreHTML = `<div class="feedback-box feedback-box--${correct === total ? 'success' : 'warning'}" style="margin-bottom:var(--space-4);">
      <span class="feedback-box__icon">${correct === total ? '🎯' : '📌'}</span>
      <div class="feedback-box__body"><strong>${correct} dari ${total} kandidat terklasifikasi dengan tepat.</strong>${correct === total ? '<br>Kamu sudah mampu membedakan data inti pada narasi spesifikasi.' : '<br>Perhatikan feedback setiap kandidat, lalu perbaiki jika masih tertukar.'}</div>
    </div>`;
  }

  const candidatesHTML = stageData.candidates.map(function (candidate) {
    const current = State.classification[candidate.id] || null;
    const feedback = checked && current ? candidate.feedback[current] : '';
    const isCorrect = current === candidate.correct;

    return `<div class="candidate-item ${checked ? 'candidate-item--checked' : ''}">
      <div class="candidate-item__header">
        <span class="candidate-item__label">${esc(candidate.label)}</span>
        ${current ? `<span class="candidate-item__badge badge--${esc(current)}">${esc(findCategoryLabel(stageData.categories, current))}</span>` : ''}
      </div>
      <div class="candidate-item__actions">
        ${stageData.categories.map(function (category) {
          return `<button type="button" class="classify-btn ${current === category.id ? 'is-selected' : ''}" data-itemid="${esc(candidate.id)}" data-classify="${esc(category.id)}">${esc(category.label)}</button>`;
        }).join('')}
      </div>
      <div class="candidate-item__feedback ${checked && current ? (isCorrect ? 'is-correct' : 'is-incorrect') : ''}">${feedback}</div>
    </div>`;
  }).join('');

  container.innerHTML = `
    <section aria-label="Bedah dokumen">
      <div class="stage-head">
        <span class="stage-head__kicker">TAHAP 3 — BEDAH DOKUMEN</span>
        <p class="stage-head__goal">Tujuan: Menemukan calon entitas dan atribut utama dari dokumen spesifikasi sistem yang dibaca.</p>
      </div>

      <div class="panel panel--accent">
        <h3>${esc(stageData.title)}</h3>
        <p style="font-size:0.88rem;color:var(--color-ink-muted);">${esc(stageData.instruction)}</p>
        <div class="srs-text">${paragraphsHTML}</div>
        <details class="hint-reveal">
          <summary>💡 Cara membaca sebelum menjawab</summary>
          <div class="hint-reveal__content">
            Cari dulu proses utamanya, lalu perhatikan objek yang selalu muncul. Setelah itu, tandai detail yang menjelaskan objek tersebut. Data tampilan seperti warna atau slogan biasanya bukan fokus inti pada analisis awal.
          </div>
        </details>
      </div>

      <div class="panel">
        <h3>Klasifikasikan kandidat yang disorot</h3>
        ${scoreHTML}
        <div class="candidate-list">${candidatesHTML}</div>
        <div class="btn-group btn-group--spread">
          <button type="button" class="btn btn--ghost" id="retryClassifBtn" style="${checked ? '' : 'visibility:hidden'}">↩ Coba Lagi</button>
          <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;">
            <button type="button" class="btn btn--primary" id="checkClassifBtn" ${allAnswered ? '' : 'disabled'}>${checked ? '✓ Periksa Ulang' : 'Periksa Klasifikasi'}</button>
            ${checked ? '<button type="button" class="btn btn--primary" id="nextFromDokumen">Lanjut →</button>' : ''}
          </div>
        </div>
      </div>
    </section>`;

  container.querySelectorAll('.classify-btn').forEach(function (button) {
    button.addEventListener('click', function () {
      State.classification[button.dataset.itemid] = button.dataset.classify;
      State.classifChecked = false;
      saveState();
      renderDokumen(container);
    });
  });

  document.getElementById('checkClassifBtn').addEventListener('click', function () {
    State.classifChecked = true;
    State.score.classifCorrect = stageData.candidates.filter(function (candidate) {
      return State.classification[candidate.id] === candidate.correct;
    }).length;
    State.score.classifTotal = stageData.candidates.length;
    saveState();
    renderDokumen(container);
  });

  const retryBtn = document.getElementById('retryClassifBtn');
  if (retryBtn) {
    retryBtn.addEventListener('click', function () {
      if (!confirmAction('Hapus feedback tahap ini dan coba lagi?')) return;
      State.classifChecked = false;
      saveState();
      renderDokumen(container);
    });
  }

  const nextBtn = document.getElementById('nextFromDokumen');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      completeStage('dokumen');
      navigateTo('peta');
    });
  }
}

function renderPeta(container) {
  const stageData = DATA.mapping;
  const checked = State.mappingChecked;
  const selected = State.selectedAttrId;
  const assigned = {};
  const unassigned = [];

  stageData.entities.forEach(function (entity) {
    assigned[entity.id] = [];
  });

  stageData.attributes.forEach(function (attr) {
    const target = State.attrAssignments[attr.id];
    if (target && assigned[target]) assigned[target].push(attr.id);
    else unassigned.push(attr.id);
  });

  const poolHTML = unassigned.map(function (attrId) {
    const attr = findAttribute(stageData.attributes, attrId);
    return `<button type="button" class="attr-chip ${selected === attrId ? 'is-selected' : ''}" data-atid="${esc(attrId)}" aria-pressed="${selected === attrId}">${esc(attr.label)}</button>`;
  }).join('');

  const columnsHTML = stageData.entities.map(function (entity) {
    const chipsHTML = assigned[entity.id].map(function (attrId) {
      const attr = findAttribute(stageData.attributes, attrId);
      let cls = 'attr-chip attr-chip--' + entity.colorKey;
      if (checked) cls += attr.entityId === entity.id ? ' attr-chip--correct' : ' attr-chip--incorrect';
      return `<button type="button" class="${cls}" data-atid="${esc(attrId)}" title="Klik untuk mengembalikan atribut ke daftar">${esc(attr.label)}</button>`;
    }).join('');

    return `<div class="entity-column entity-column--${esc(entity.colorKey)}">
      <div class="entity-column__header" data-eid="${esc(entity.id)}" role="button" tabindex="0" aria-label="${esc(entity.label)}">
        <span>${esc(entity.label)}</span>
        <span class="entity-column__header-hint">${selected ? 'Klik untuk tempatkan' : ''}</span>
      </div>
      <div class="entity-column__body">${chipsHTML}</div>
    </div>`;
  }).join('');

  let scoreHTML = '';
  if (checked) {
    const correct = stageData.attributes.filter(function (attr) {
      return State.attrAssignments[attr.id] === attr.entityId;
    }).length;
    const total = stageData.attributes.length;
    State.score.mappingCorrect = correct;
    State.score.mappingTotal = total;
    scoreHTML = `<div class="feedback-box feedback-box--${correct === total ? 'success' : 'warning'}" style="margin-bottom:var(--space-4);">
      <span class="feedback-box__icon">${correct === total ? '🧩' : '🛠️'}</span>
      <div class="feedback-box__body"><strong>${correct} dari ${total} atribut ditempatkan dengan tepat.</strong>${correct === total ? '<br>Pemetaanmu sudah rapi: setiap atribut berada pada entitas yang dijelaskannya.' : '<br>Atribut bertanda silang masih berada di entitas yang kurang tepat.'}</div>
    </div>`;
  }

  container.innerHTML = `
    <section aria-label="Peta entitas dan atribut">
      <div class="stage-head">
        <span class="stage-head__kicker">TAHAP 4 — PETA ENTITAS</span>
        <p class="stage-head__goal">Tujuan: Menempatkan atribut utama ke entitas yang tepat agar rancangan data lebih jelas.</p>
      </div>

      <div class="panel">
        <p style="font-size:0.88rem;color:var(--color-ink-muted);">${esc(stageData.explanation)}</p>
        <p style="font-size:0.88rem;color:var(--color-ink-muted);">${esc(stageData.instruction)}</p>

        <div class="selected-indicator ${selected ? 'is-visible' : ''}">
          ${selected ? `Dipilih: <strong>${esc(findAttribute(stageData.attributes, selected).label)}</strong> — sekarang klik entitas yang sesuai.` : ''}
        </div>

        <div class="attr-pool-section">
          <div class="attr-pool-label">Atribut yang belum ditempatkan <span class="attr-pool-count">${unassigned.length}</span></div>
          <div class="attr-pool ${unassigned.length === 0 ? 'attr-pool--empty' : ''}">${poolHTML}</div>
        </div>

        <details class="hint-reveal" style="margin-bottom:var(--space-4);">
          <summary>💡 Pertanyaan panduan</summary>
          <div class="hint-reveal__content">
            Tanyakan: "atribut ini menjelaskan siapa atau apa?" Jika atribut menjelaskan peminjam, letakkan di entitas Peminjam. Jika menjelaskan perangkat, letakkan di Laptop. Jika menjelaskan kejadian peminjaman, letakkan di Transaksi Peminjaman.
          </div>
        </details>

        ${scoreHTML}
        <div class="entity-columns">${columnsHTML}</div>

        <div class="btn-group btn-group--spread">
          <button type="button" class="btn btn--ghost" id="retryMappingBtn" style="${checked ? '' : 'visibility:hidden'}">↩ Coba Lagi</button>
          <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;">
            <button type="button" class="btn btn--primary" id="checkMappingBtn" ${unassigned.length === 0 ? '' : 'disabled'}>${checked ? '✓ Periksa Ulang' : 'Cek Pemetaan'}</button>
            ${checked ? '<button type="button" class="btn btn--primary" id="nextFromPeta">Lanjut →</button>' : ''}
          </div>
        </div>
      </div>
    </section>`;

  container.querySelectorAll('.attr-pool .attr-chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      const attrId = chip.dataset.atid;
      State.selectedAttrId = State.selectedAttrId === attrId ? null : attrId;
      State.mappingChecked = false;
      saveState();
      renderPeta(container);
    });
  });

  container.querySelectorAll('.entity-column__header').forEach(function (header) {
    const handler = function () {
      if (!State.selectedAttrId) {
        showNotice('Pilih atribut dari daftar terlebih dahulu.');
        return;
      }
      State.attrAssignments[State.selectedAttrId] = header.dataset.eid;
      State.selectedAttrId = null;
      State.mappingChecked = false;
      saveState();
      renderPeta(container);
    };

    header.addEventListener('click', handler);
    header.addEventListener('keydown', function (event) {
      if (event.key === 'Enter' || event.key === ' ') {
        event.preventDefault();
        handler();
      }
    });
  });

  container.querySelectorAll('.entity-column__body .attr-chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      delete State.attrAssignments[chip.dataset.atid];
      State.selectedAttrId = null;
      State.mappingChecked = false;
      saveState();
      renderPeta(container);
    });
  });

  document.getElementById('checkMappingBtn').addEventListener('click', function () {
    State.mappingChecked = true;
    saveState();
    renderPeta(container);
  });

  const retryBtn = document.getElementById('retryMappingBtn');
  if (retryBtn) {
    retryBtn.addEventListener('click', function () {
      if (!confirmAction('Reset penempatan atribut pada tahap ini?')) return;
      State.attrAssignments = {};
      State.selectedAttrId = null;
      State.mappingChecked = false;
      saveState();
      renderPeta(container);
    });
  }

  const nextBtn = document.getElementById('nextFromPeta');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      completeStage('peta');
      navigateTo('analisis');
    });
  }
}

function renderAnalisis(container) {
  const stageData = DATA.independentCase;
  const checked = State.caseChecked;
  const allAnswered = stageData.items.every(function (item) {
    return !!State.caseAnswers[item.id];
  });

  let scoreHTML = '';
  if (checked) {
    const correct = stageData.items.filter(function (item) {
      return State.caseAnswers[item.id] === item.correct;
    }).length;
    const total = stageData.items.length;
    scoreHTML = `<div class="feedback-box feedback-box--${correct === total ? 'success' : 'warning'}" style="margin-bottom:var(--space-4);">
      <span class="feedback-box__icon">${correct === total ? '✅' : '📊'}</span>
      <div class="feedback-box__body"><strong>${correct} dari ${total} jawaban tepat.</strong>${correct === total ? '<br>Kamu sudah konsisten menerapkan cara berpikir yang sama pada kasus baru.' : '<br>Masih ada kandidat yang tertukar. Gunakan kembali pertanyaan panduan sebelum memperbaiki.'}</div>
    </div>`;
  }

  const itemsHTML = stageData.items.map(function (item) {
    const current = State.caseAnswers[item.id] || null;
    const feedback = checked && current ? item.feedback[current] : '';
    const isCorrect = current === item.correct;

    return `<div class="candidate-item">
      <div class="candidate-item__header">
        <span class="candidate-item__label">${esc(item.label)}</span>
        ${current ? `<span class="candidate-item__badge badge--${esc(current)}">${esc(findCategoryLabel(stageData.categories, current))}</span>` : ''}
      </div>
      <div class="candidate-item__actions">
        ${stageData.categories.map(function (category) {
          return `<button type="button" class="classify-btn ${current === category.id ? 'is-selected' : ''}" data-itemid="${esc(item.id)}" data-classify="${esc(category.id)}">${esc(category.label)}</button>`;
        }).join('')}
      </div>
      <div class="candidate-item__feedback ${checked && current ? (isCorrect ? 'is-correct' : 'is-incorrect') : ''}">${feedback}</div>
    </div>`;
  }).join('');

  container.innerHTML = `
    <section aria-label="Analisis mandiri">
      <div class="stage-head">
        <span class="stage-head__kicker">TAHAP 5 — ANALISIS MANDIRI</span>
        <p class="stage-head__goal">Tujuan: Menggunakan cara analisis yang sama pada dokumen spesifikasi sistem yang berbeda.</p>
      </div>

      <div class="panel panel--accent">
        <h3>${esc(stageData.title)}</h3>
        <p style="font-size:0.88rem;color:var(--color-ink-muted);">${esc(stageData.instruction)}</p>
        <div class="narrative">
          ${stageData.paragraphs.map(function (paragraph) { return '<p>' + esc(paragraph) + '</p>'; }).join('')}
        </div>
        <details class="hint-reveal">
          <summary>💡 Langkah berpikir</summary>
          <div class="hint-reveal__content">
            Lihat dulu siapa yang terlibat dalam proses utama, apa yang dijual atau dikelola, dan kejadian apa yang dicatat sistem. Setelah itu, barulah bedakan detail yang menjelaskan tiap objek dengan data tampilan yang hanya bersifat pelengkap.
          </div>
        </details>
      </div>

      <div class="panel">
        <h3>Kelompokkan kandidat data</h3>
        ${scoreHTML}
        <div class="candidate-list">${itemsHTML}</div>
        <div class="btn-group btn-group--spread">
          <button type="button" class="btn btn--ghost" id="retryCaseBtn" style="${checked ? '' : 'visibility:hidden'}">↩ Coba Lagi</button>
          <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;">
            <button type="button" class="btn btn--primary" id="checkCaseBtn" ${allAnswered ? '' : 'disabled'}>${checked ? '✓ Periksa Ulang' : 'Periksa Jawaban'}</button>
            ${checked ? '<button type="button" class="btn btn--primary" id="nextFromAnalisis">Lanjut →</button>' : ''}
          </div>
        </div>
      </div>
    </section>`;

  container.querySelectorAll('.classify-btn').forEach(function (button) {
    button.addEventListener('click', function () {
      State.caseAnswers[button.dataset.itemid] = button.dataset.classify;
      State.caseChecked = false;
      saveState();
      renderAnalisis(container);
    });
  });

  document.getElementById('checkCaseBtn').addEventListener('click', function () {
    State.caseChecked = true;
    State.score.caseCorrect = stageData.items.filter(function (item) {
      return State.caseAnswers[item.id] === item.correct;
    }).length;
    State.score.caseTotal = stageData.items.length;
    saveState();
    renderAnalisis(container);
  });

  const retryBtn = document.getElementById('retryCaseBtn');
  if (retryBtn) {
    retryBtn.addEventListener('click', function () {
      if (!confirmAction('Hapus feedback tahap ini dan coba lagi?')) return;
      State.caseChecked = false;
      saveState();
      renderAnalisis(container);
    });
  }

  const nextBtn = document.getElementById('nextFromAnalisis');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      completeStage('analisis');
      navigateTo('evaluasi');
    });
  }
}

function renderEvaluasi(container) {
  const stageData = DATA.evaluation;
  const checked = State.evaluationChecked;
  const allAnswered = stageData.questions.every(function (question) {
    return !!State.evaluationAnswers[question.id];
  });

  let scoreHTML = '';
  if (checked) {
    const correct = stageData.questions.filter(function (question) {
      return State.evaluationAnswers[question.id] === question.correct;
    }).length;
    const total = stageData.questions.length;
    scoreHTML = `<div class="feedback-box feedback-box--${correct === total ? 'success' : 'warning'}" style="margin-bottom:var(--space-4);">
      <span class="feedback-box__icon">${correct === total ? '🏁' : '🔍'}</span>
      <div class="feedback-box__body"><strong>${correct} dari ${total} jawaban tepat.</strong>${correct === total ? '<br>Kamu sudah memahami alasan penentuan entitas dan atribut utama.' : '<br>Masih ada alasan yang perlu diperkuat. Baca feedback dan hubungan tiap jawaban dengan proses inti sistem.'}</div>
    </div>`;
  }

  const questionsHTML = stageData.questions.map(function (question) {
    const current = State.evaluationAnswers[question.id] || null;
    const feedback = checked && current ? question.feedback[current] : '';
    const isCorrect = current === question.correct;

    return `<div class="question-card">
      <div class="question-card__prompt">${esc(question.prompt)}</div>
      <div class="choice-stack">
        ${question.options.map(function (option) {
          let cls = 'choice-option';
          if (current === option.id) cls += ' is-selected';
          if (checked) {
            if (option.id === question.correct) cls += ' is-correct';
            else if (current === option.id) cls += ' is-incorrect';
          }
          return `<label class="${cls}">
            <input type="radio" name="${esc(question.id)}" value="${esc(option.id)}" ${current === option.id ? 'checked' : ''}>
            <span>${esc(option.label)}</span>
          </label>`;
        }).join('')}
      </div>
      <div class="question-feedback ${checked && current ? (isCorrect ? 'is-correct' : 'is-incorrect') : ''}">${feedback}</div>
    </div>`;
  }).join('');

  container.innerHTML = `
    <section aria-label="Evaluasi">
      <div class="stage-head">
        <span class="stage-head__kicker">TAHAP 6 — EVALUASI</span>
        <p class="stage-head__goal">Tujuan: Memeriksa apakah kamu memahami alasan di balik pemilihan entitas dan atribut utama.</p>
      </div>

      <div class="panel panel--accent">
        <h3>Sebelum menjawab</h3>
        <p style="margin-bottom:0;">${esc(stageData.intro)}</p>
      </div>

      <div class="panel">
        ${scoreHTML}
        <div class="question-stack">${questionsHTML}</div>
        <div class="btn-group btn-group--spread">
          <button type="button" class="btn btn--ghost" id="retryEvalBtn" style="${checked ? '' : 'visibility:hidden'}">↩ Coba Lagi</button>
          <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;">
            <button type="button" class="btn btn--primary" id="checkEvalBtn" ${allAnswered ? '' : 'disabled'}>${checked ? '✓ Periksa Ulang' : 'Periksa Jawaban'}</button>
            ${checked ? '<button type="button" class="btn btn--primary" id="nextFromEvaluasi">Lanjut →</button>' : ''}
          </div>
        </div>
      </div>
    </section>`;

  container.querySelectorAll('.choice-option input[type="radio"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
      State.evaluationAnswers[radio.name] = radio.value;
      State.evaluationChecked = false;
      saveState();
      renderEvaluasi(container);
    });
  });

  document.getElementById('checkEvalBtn').addEventListener('click', function () {
    State.evaluationChecked = true;
    State.score.evaluationCorrect = stageData.questions.filter(function (question) {
      return State.evaluationAnswers[question.id] === question.correct;
    }).length;
    State.score.evaluationTotal = stageData.questions.length;
    saveState();
    renderEvaluasi(container);
  });

  const retryBtn = document.getElementById('retryEvalBtn');
  if (retryBtn) {
    retryBtn.addEventListener('click', function () {
      if (!confirmAction('Hapus feedback tahap evaluasi dan coba lagi?')) return;
      State.evaluationChecked = false;
      saveState();
      renderEvaluasi(container);
    });
  }

  const nextBtn = document.getElementById('nextFromEvaluasi');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      completeStage('evaluasi');
      navigateTo('refleksi');
    });
  }
}

function renderRefleksi(container) {
  const promptsHTML = DATA.reflection.prompts.map(function (prompt) {
    const value = State.reflections[prompt.id] || '';
    return `<div class="reflection-card">
      <h3>${esc(prompt.title)}</h3>
      <p class="reflection-guidance">${esc(prompt.guidance)}</p>
      <textarea class="input-textarea" data-reflectionid="${esc(prompt.id)}" placeholder="Tulis refleksimu di sini...">${esc(value)}</textarea>
    </div>`;
  }).join('');

  const completed = DATA.reflection.prompts.every(function (prompt) {
    return (State.reflections[prompt.id] || '').trim().length > 0;
  });

  container.innerHTML = `
    <section aria-label="Refleksi">
      <div class="stage-head">
        <span class="stage-head__kicker">TAHAP 7 — REFLEKSI</span>
        <p class="stage-head__goal">Tujuan: Menyimpulkan strategi berpikirmu saat menentukan entitas dan atribut utama.</p>
      </div>

      <div class="panel panel--accent">
        <h3>Sebelum menulis refleksi</h3>
        <p style="margin-bottom:0;">Ingat kembali alur belajarmu: memahami konsep, membaca dokumen, menandai kandidat, lalu memetakan atribut ke entitas. Gunakan pengalaman itu untuk menjawab pertanyaan berikut.</p>
      </div>

      <div class="reflection-grid">${promptsHTML}</div>

      <div class="btn-group btn-group--end">
        <button type="button" class="btn btn--primary" id="nextFromReflection" ${completed ? '' : 'disabled'}>Simpan Refleksi & Lanjut →</button>
      </div>
    </section>`;

  container.querySelectorAll('.input-textarea').forEach(function (textarea) {
    textarea.addEventListener('input', function () {
      State.reflections[textarea.dataset.reflectionid] = textarea.value;
      saveState();
      document.getElementById('nextFromReflection').disabled = !DATA.reflection.prompts.every(function (prompt) {
        return (State.reflections[prompt.id] || '').trim().length > 0;
      });
    });
  });

  document.getElementById('nextFromReflection').addEventListener('click', function () {
    completeStage('refleksi');
    navigateTo('selesai');
  });
}

function renderSelesai(container) {
  completeStage('selesai');
  updateProgress();

  const conceptHTML = DATA.summaryConcepts.map(function (item) {
    return `<div class="concept-card">
      <span class="concept-card__icon">${item.icon}</span>
      <div class="concept-card__term">${esc(item.term)}</div>
      <p class="concept-card__def">${esc(item.definition)}</p>
      <div class="concept-card__example">${esc(item.example)}</div>
    </div>`;
  }).join('');

  const summaryChips = [
    scoreChip('Bekal konsep', State.score.prepCorrect, State.score.prepTotal),
    scoreChip('Bedah dokumen', State.score.classifCorrect, State.score.classifTotal),
    scoreChip('Peta entitas', State.score.mappingCorrect, State.score.mappingTotal),
    scoreChip('Analisis mandiri', State.score.caseCorrect, State.score.caseTotal),
    scoreChip('Evaluasi', State.score.evaluationCorrect, State.score.evaluationTotal)
  ];

  container.innerHTML = `
    <section aria-label="Selesai">
      <div class="stage-head">
        <span class="stage-head__kicker">TAHAP 8 — SELESAI</span>
        <p class="stage-head__goal">Ringkasan hasil belajar dan konsep yang perlu dibawa ke topik berikutnya.</p>
      </div>

      <div class="panel panel--hero" style="text-align:center;padding:var(--space-7) var(--space-6);">
        <div style="font-size:3rem;margin-bottom:var(--space-3);">🎓</div>
        <h2>Kamu sudah menyelesaikan media ini</h2>
        <p style="font-size:1.02rem;color:var(--color-ink-muted);">
          Sekarang kamu sudah berlatih membaca dokumen spesifikasi sistem untuk menemukan entitas, atribut utama, dan membedakannya dari data pelengkap.
        </p>
        <div class="summary-list">
          ${summaryChips.map(function (chip) { return '<span class="summary-chip">' + esc(chip) + '</span>'; }).join('')}
        </div>
      </div>

      <div class="panel">
        <h3>Ringkasan konsep utama</h3>
        <div class="concept-cards">${conceptHTML}</div>
      </div>

      <div class="panel panel--accent">
        <h3>Tindak lanjut di kelas</h3>
        <ul>
          <li>Bandingkan hasil analisismu dengan teman sekelompok dan diskusikan entitas mana yang paling penting terlebih dahulu.</li>
          <li>Coba ubah narasi spesifikasi sistem menjadi daftar calon tabel sederhana berdasarkan entitas dan atribut utama yang ditemukan.</li>
          <li>Gunakan hasil ini sebagai jembatan ke materi berikutnya, misalnya relasi antartabel atau penentuan kunci.</li>
        </ul>
      </div>

      <div class="btn-group" style="justify-content:center;">
        <button type="button" class="btn btn--ghost" id="backToReflectionBtn">Kembali ke Refleksi</button>
        <button type="button" class="btn btn--primary" id="restartBtn">Mulai dari Awal</button>
      </div>
    </section>`;

  document.getElementById('backToReflectionBtn').addEventListener('click', function () {
    navigateTo('refleksi');
  });

  document.getElementById('restartBtn').addEventListener('click', function () {
    if (!confirmAction('Mulai dari awal? Semua progres pada materi ini akan dihapus.')) return;
    clearState();
    saveState();
    updateStageNav();
    renderCurrentStage();
  });
}

function scoreChip(label, score, total) {
  if (!total) return label + ': belum diperiksa';
  return label + ': ' + score + '/' + total;
}

function findCategoryLabel(categories, id) {
  const found = categories.find(function (category) {
    return category.id === id;
  });
  return found ? found.label : id;
}

function findAttribute(attributes, id) {
  return attributes.find(function (attr) {
    return attr.id === id;
  });
}

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

function showNotice(message) {
  const el = document.getElementById('appNotice');
  if (!el) return;
  el.textContent = message;
  el.classList.add('is-visible');
  if (noticeTimer) clearTimeout(noticeTimer);
  noticeTimer = setTimeout(function () {
    el.classList.remove('is-visible');
  }, 3200);
}

function confirmAction(message) {
  return window.confirm(message);
}

function buildStageNav() {
  const nav = document.getElementById('stageNavList');
  if (!nav) return;
  nav.innerHTML = STAGES.map(function (stageId, idx) {
    return `<li><button type="button" class="stage-nav__item" data-stage="${stageId}">
      <span class="stage-nav__num">${idx + 1}</span>
      <span class="stage-nav__label">${STAGE_LABELS[idx]}</span>
    </button></li>`;
  }).join('');

  nav.querySelectorAll('.stage-nav__item').forEach(function (button) {
    button.addEventListener('click', function () {
      navigateTo(button.dataset.stage);
    });
  });
}

function init() {
  buildStageNav();
  loadState();

  const resetBtn = document.getElementById('resetAppBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      if (!confirmAction('Reset seluruh aplikasi? Semua progres pada materi ini akan dihapus.')) return;
      clearState();
      saveState();
      updateStageNav();
      renderCurrentStage();
    });
  }

  updateStageNav();
  renderCurrentStage();
}

document.addEventListener('DOMContentLoaded', init);
