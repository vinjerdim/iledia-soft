'use strict';

const STAGES = [
  'orientasi',
  'aktivasi',
  'konsep',
  'kasus',
  'struktur',
  'evaluasi',
  'refleksi',
  'selesai'
];

const STAGE_LABELS = [
  'Orientasi',
  'Aktivasi',
  'Konsep Inti',
  'Studi Kasus',
  'Struktur Data',
  'Evaluasi',
  'Refleksi',
  'Selesai'
];

const STORAGE_KEY = 'mpi-1-1-v1';

const State = {
  currentStage: 'orientasi',
  completedStages: {},

  activationAnswers: {},
  activationChecked: false,

  conceptAnswers: {},
  conceptChecked: false,

  caseAnswers: {},
  caseChecked: false,

  attrAssignments: {},
  selectedAttrId: null,
  structureChecked: false,

  evaluation: {
    selectedDesign: null,
    selectedReasons: [],
    checked: false
  },

  reflections: {},

  score: {
    activationCorrect: 0,
    activationTotal: 0,
    conceptCorrect: 0,
    conceptTotal: 0,
    caseCorrect: 0,
    caseTotal: 0,
    structureCorrect: 0,
    structureTotal: 0,
    evaluationCorrect: 0
  }
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
    State.evaluation = Object.assign({ selectedDesign: null, selectedReasons: [], checked: false }, State.evaluation || {});
    State.score = Object.assign({
      activationCorrect: 0,
      activationTotal: 0,
      conceptCorrect: 0,
      conceptTotal: 0,
      caseCorrect: 0,
      caseTotal: 0,
      structureCorrect: 0,
      structureTotal: 0,
      evaluationCorrect: 0
    }, State.score || {});
    return true;
  } catch (e) {
    return false;
  }
}

function clearState() {
  try { localStorage.removeItem(STORAGE_KEY); } catch (e) { }
  State.currentStage = 'orientasi';
  State.completedStages = {};
  State.activationAnswers = {};
  State.activationChecked = false;
  State.conceptAnswers = {};
  State.conceptChecked = false;
  State.caseAnswers = {};
  State.caseChecked = false;
  State.attrAssignments = {};
  State.selectedAttrId = null;
  State.structureChecked = false;
  State.evaluation = { selectedDesign: null, selectedReasons: [], checked: false };
  State.reflections = {};
  State.score = {
    activationCorrect: 0,
    activationTotal: 0,
    conceptCorrect: 0,
    conceptTotal: 0,
    caseCorrect: 0,
    caseTotal: 0,
    structureCorrect: 0,
    structureTotal: 0,
    evaluationCorrect: 0
  };
}

function navigateTo(stageId) {
  const targetIdx = STAGES.indexOf(stageId);
  const currentIdx = STAGES.indexOf(State.currentStage);
  if (targetIdx === -1) return;

  if (targetIdx > currentIdx) {
    for (let i = currentIdx; i < targetIdx; i++) {
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
    const sid = item.dataset.stage;
    const idx = STAGES.indexOf(sid);
    item.removeAttribute('aria-current');
    item.classList.remove('is-complete');
    item.disabled = false;

    if (sid === State.currentStage) {
      item.setAttribute('aria-current', 'step');
    } else if (State.completedStages[sid]) {
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
  const barFill = document.getElementById('progressFill');
  const barLabel = document.getElementById('progressLabel');
  if (barFill) barFill.style.width = pct + '%';
  if (barLabel) barLabel.textContent = done + ' dari ' + total + ' tahap selesai';
}

function renderCurrentStage() {
  const container = document.getElementById('stageContainer');
  if (!container) return;
  container.innerHTML = '';
  updateProgress();

  switch (State.currentStage) {
    case 'orientasi': renderOrientasi(container); break;
    case 'aktivasi': renderAktivasi(container); break;
    case 'konsep': renderKonsep(container); break;
    case 'kasus': renderKasus(container); break;
    case 'struktur': renderStruktur(container); break;
    case 'evaluasi': renderEvaluasi(container); break;
    case 'refleksi': renderRefleksi(container); break;
    case 'selesai': renderSelesai(container); break;
    default: container.innerHTML = '<p>Tahap tidak ditemukan.</p>';
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
        <p class="stage-head__goal">Tujuan: Memahami target belajar, manfaat materi, dan urutan aktivitas pembelajaran.</p>
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
        <h3>Pembelajaran mendalam yang diharapkan</h3>
        <div class="hero-steps">
          <div class="hero-steps__item"><span class="hero-steps__num">1</span>Mengamati contoh data yang dekat dengan kehidupan sekolah.</div>
          <div class="hero-steps__item"><span class="hero-steps__num">2</span>Menganalisis alasan mengapa data perlu disusun rapi sebelum aplikasi dibuat.</div>
          <div class="hero-steps__item"><span class="hero-steps__num">3</span>Membangun pemahaman melalui simulasi, bukan hafalan istilah semata.</div>
          <div class="hero-steps__item"><span class="hero-steps__num">4</span>Merefleksikan manfaat struktur data bagi kualitas perangkat lunak.</div>
        </div>
      </div>

      <div class="panel panel--compact panel--warning">
        <p style="margin:0;font-size:0.88rem;">
          <strong>Catatan:</strong> Media ini membantu latihan bertahap. Diskusi, penegasan konsep, dan penilaian akhir tetap dipandu guru di kelas.
        </p>
      </div>

      <div class="btn-group btn-group--end">
        <button type="button" class="btn btn--primary btn--large" id="startBtn">Mulai Belajar →</button>
      </div>
    </section>`;

  document.getElementById('startBtn').addEventListener('click', function () {
    completeStage('orientasi');
    navigateTo('aktivasi');
  });
}

function renderAktivasi(container) {
  const stageData = DATA.activation;
  const checked = State.activationChecked;
  const allAnswered = stageData.items.every(function (item) { return !!State.activationAnswers[item.id]; });

  let scoreHTML = '';
  if (checked) {
    const correct = stageData.items.filter(function (item) {
      return State.activationAnswers[item.id] === item.correct;
    }).length;
    const total = stageData.items.length;
    const perfect = correct === total;
    scoreHTML = `<div class="feedback-box feedback-box--${perfect ? 'success' : 'warning'}" style="margin-bottom:var(--space-4);">
      <span class="feedback-box__icon">${perfect ? '🎉' : '📊'}</span>
      <div class="feedback-box__body"><strong>${correct} dari ${total} jawaban tepat.</strong>${perfect ? '<br>Kamu sudah membedakan data, informasi, dan basis data dengan baik.' : '<br>Baca feedback pada tiap contoh, lalu perbaiki bila perlu.'}</div>
    </div>`;
  }

  const itemsHTML = stageData.items.map(function (item) {
    const current = State.activationAnswers[item.id] || null;
    const fb = checked && current ? item.feedback[current] : '';
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
      <div class="candidate-item__feedback ${checked && current ? (isCorrect ? 'is-correct' : 'is-incorrect') : ''}">${fb}</div>
    </div>`;
  }).join('');

  container.innerHTML = `
    <section aria-label="Aktivasi pengetahuan awal">
      <div class="stage-head">
        <span class="stage-head__kicker">TAHAP 2 — AKTIVASI PENGETAHUAN AWAL</span>
        <p class="stage-head__goal">Tujuan: Membedakan data mentah, informasi, dan basis data sebelum masuk ke struktur relasional.</p>
      </div>

      <div class="panel">
        <h3>Pilih kategori yang tepat</h3>
        <p style="font-size:0.88rem;color:var(--color-ink-muted);">${esc(stageData.instruction)}</p>
        ${scoreHTML}
        <div class="candidate-list">${itemsHTML}</div>
        <div class="btn-group btn-group--spread">
          <button type="button" class="btn btn--ghost" id="retryActivationBtn" style="${checked ? '' : 'visibility:hidden'}">↩ Coba Lagi</button>
          <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;">
            <button type="button" class="btn btn--primary" id="checkActivationBtn" ${allAnswered ? '' : 'disabled'}>${checked ? '✓ Periksa Ulang' : 'Periksa Jawaban'}</button>
            ${checked ? '<button type="button" class="btn btn--primary" id="nextFromActivation">Lanjut →</button>' : ''}
          </div>
        </div>
      </div>
    </section>`;

  container.querySelectorAll('.classify-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.activationAnswers[btn.dataset.itemid] = btn.dataset.classify;
      State.activationChecked = false;
      saveState();
      renderAktivasi(container);
    });
  });

  document.getElementById('checkActivationBtn').addEventListener('click', function () {
    State.activationChecked = true;
    State.score.activationCorrect = stageData.items.filter(function (item) {
      return State.activationAnswers[item.id] === item.correct;
    }).length;
    State.score.activationTotal = stageData.items.length;
    saveState();
    renderAktivasi(container);
  });

  const retryBtn = document.getElementById('retryActivationBtn');
  if (retryBtn) {
    retryBtn.addEventListener('click', function () {
      if (!confirmAction('Hapus feedback tahap ini dan coba lagi?')) return;
      State.activationChecked = false;
      saveState();
      renderAktivasi(container);
    });
  }

  const nextBtn = document.getElementById('nextFromActivation');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      completeStage('aktivasi');
      navigateTo('konsep');
    });
  }
}

function renderKonsep(container) {
  const stageData = DATA.conceptLab;
  const checked = State.conceptChecked;
  const allAnswered = stageData.questions.every(function (question) { return !!State.conceptAnswers[question.id]; });

  let scoreHTML = '';
  if (checked) {
    const correct = stageData.questions.filter(function (question) {
      return State.conceptAnswers[question.id] === question.correct;
    }).length;
    const total = stageData.questions.length;
    scoreHTML = `<div class="feedback-box feedback-box--${correct === total ? 'success' : 'warning'}" style="margin-bottom:var(--space-4);">
      <span class="feedback-box__icon">${correct === total ? '🎯' : '📚'}</span>
      <div class="feedback-box__body"><strong>${correct} dari ${total} konsep terjawab dengan tepat.</strong>${correct === total ? '<br>Kamu siap masuk ke studi kasus.' : '<br>Gunakan feedback untuk memperkuat istilah yang masih tertukar.'}</div>
    </div>`;
  }

  const tablesHTML = stageData.tables.map(function (table) {
    return `<div class="example-card">
      <h4>${esc(table.title)}</h4>
      <div class="mini-table-wrap">
        <table class="mini-table">
          <thead><tr>${table.columns.map(function (column) { return '<th>' + esc(column) + '</th>'; }).join('')}</tr></thead>
          <tbody>${table.rows.map(function (row) {
      return '<tr>' + row.map(function (value) { return '<td>' + esc(value) + '</td>'; }).join('') + '</tr>';
    }).join('')}</tbody>
        </table>
      </div>
    </div>`;
  }).join('');

  const questionsHTML = stageData.questions.map(function (question) {
    const current = State.conceptAnswers[question.id] || null;
    const feedback = checked && current ? question.feedback[current] : '';
    const correct = current === question.correct;

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
      <div class="question-feedback ${checked && current ? (correct ? 'is-correct' : 'is-incorrect') : ''}">${feedback}</div>
    </div>`;
  }).join('');

  container.innerHTML = `
    <section aria-label="Eksplorasi konsep inti">
      <div class="stage-head">
        <span class="stage-head__kicker">TAHAP 3 — EKSPLORASI KONSEP INTI</span>
        <p class="stage-head__goal">Tujuan: Mengenali istilah dasar basis data relasional dan alasan struktur data perlu dirancang dengan baik.</p>
      </div>

      <div class="panel">
        <p style="font-size:0.88rem;color:var(--color-ink-muted);">${esc(stageData.intro)}</p>
        <div class="example-grid">${tablesHTML}</div>
      </div>

      <div class="panel">
        <h3>Uji pemahaman konsep</h3>
        ${scoreHTML}
        <div class="question-stack">${questionsHTML}</div>
        <div class="btn-group btn-group--spread">
          <button type="button" class="btn btn--ghost" id="retryConceptBtn" style="${checked ? '' : 'visibility:hidden'}">↩ Coba Lagi</button>
          <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;">
            <button type="button" class="btn btn--primary" id="checkConceptBtn" ${allAnswered ? '' : 'disabled'}>${checked ? '✓ Periksa Ulang' : 'Periksa Jawaban'}</button>
            ${checked ? '<button type="button" class="btn btn--primary" id="nextFromConcept">Lanjut →</button>' : ''}
          </div>
        </div>
      </div>
    </section>`;

  container.querySelectorAll('.choice-option input[type="radio"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
      State.conceptAnswers[radio.name] = radio.value;
      State.conceptChecked = false;
      saveState();
      renderKonsep(container);
    });
  });

  document.getElementById('checkConceptBtn').addEventListener('click', function () {
    State.conceptChecked = true;
    State.score.conceptCorrect = stageData.questions.filter(function (question) {
      return State.conceptAnswers[question.id] === question.correct;
    }).length;
    State.score.conceptTotal = stageData.questions.length;
    saveState();
    renderKonsep(container);
  });

  const retryBtn = document.getElementById('retryConceptBtn');
  if (retryBtn) {
    retryBtn.addEventListener('click', function () {
      if (!confirmAction('Hapus feedback tahap konsep dan coba lagi?')) return;
      State.conceptChecked = false;
      saveState();
      renderKonsep(container);
    });
  }

  const nextBtn = document.getElementById('nextFromConcept');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      completeStage('konsep');
      navigateTo('kasus');
    });
  }
}

function renderKasus(container) {
  const stageData = DATA.caseStudy;
  const checked = State.caseChecked;
  const allAnswered = stageData.items.every(function (item) { return !!State.caseAnswers[item.id]; });

  let scoreHTML = '';
  if (checked) {
    const correct = stageData.items.filter(function (item) {
      return State.caseAnswers[item.id] === item.correct;
    }).length;
    const total = stageData.items.length;
    scoreHTML = `<div class="feedback-box feedback-box--${correct === total ? 'success' : 'warning'}" style="margin-bottom:var(--space-4);">
      <span class="feedback-box__icon">${correct === total ? '✅' : '📌'}</span>
      <div class="feedback-box__body"><strong>${correct} dari ${total} komponen dikelompokkan dengan tepat.</strong>${correct === total ? '<br>Kamu sudah siap menyusun struktur tabelnya.' : '<br>Perhatikan lagi mana data inti, mana yang hanya kebutuhan tampilan.'}</div>
    </div>`;
  }

  const itemsHTML = stageData.items.map(function (item) {
    const current = State.caseAnswers[item.id] || null;
    const feedback = checked && current ? item.feedback[current] : '';
    const correct = current === item.correct;

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
      <div class="candidate-item__feedback ${checked && current ? (correct ? 'is-correct' : 'is-incorrect') : ''}">${feedback}</div>
    </div>`;
  }).join('');

  container.innerHTML = `
    <section aria-label="Studi kasus">
      <div class="stage-head">
        <span class="stage-head__kicker">TAHAP 4 — ANALISIS STUDI KASUS</span>
        <p class="stage-head__goal">Tujuan: Menentukan data inti yang perlu disimpan agar sistem absensi bisa bekerja dengan rapi.</p>
      </div>

      <div class="panel panel--accent">
        <h3>${esc(stageData.title)}</h3>
        <p style="font-size:0.88rem;color:var(--color-ink-muted);">${esc(stageData.instruction)}</p>
        <div class="narrative">
          ${stageData.paragraphs.map(function (paragraph) { return '<p>' + esc(paragraph) + '</p>'; }).join('')}
        </div>
        <details class="hint-reveal">
          <summary>💡 Petunjuk analisis</summary>
          <div class="hint-reveal__content">
            Tanyakan dua hal: <strong>data ini perlu disimpan berulang kali atau cukup satu kali?</strong> dan
            <strong>data ini mendukung proses absensi atau hanya tampilan aplikasi?</strong>
          </div>
        </details>
      </div>

      <div class="panel">
        <h3>Kelompokkan komponen data</h3>
        ${scoreHTML}
        <div class="candidate-list">${itemsHTML}</div>
        <div class="btn-group btn-group--spread">
          <button type="button" class="btn btn--ghost" id="retryCaseBtn" style="${checked ? '' : 'visibility:hidden'}">↩ Coba Lagi</button>
          <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;">
            <button type="button" class="btn btn--primary" id="checkCaseBtn" ${allAnswered ? '' : 'disabled'}>${checked ? '✓ Periksa Ulang' : 'Periksa Jawaban'}</button>
            ${checked ? '<button type="button" class="btn btn--primary" id="nextFromCase">Lanjut →</button>' : ''}
          </div>
        </div>
      </div>
    </section>`;

  container.querySelectorAll('.classify-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.caseAnswers[btn.dataset.itemid] = btn.dataset.classify;
      State.caseChecked = false;
      saveState();
      renderKasus(container);
    });
  });

  document.getElementById('checkCaseBtn').addEventListener('click', function () {
    State.caseChecked = true;
    State.score.caseCorrect = stageData.items.filter(function (item) {
      return State.caseAnswers[item.id] === item.correct;
    }).length;
    State.score.caseTotal = stageData.items.length;
    saveState();
    renderKasus(container);
  });

  const retryBtn = document.getElementById('retryCaseBtn');
  if (retryBtn) {
    retryBtn.addEventListener('click', function () {
      if (!confirmAction('Hapus feedback tahap studi kasus dan coba lagi?')) return;
      State.caseChecked = false;
      saveState();
      renderKasus(container);
    });
  }

  const nextBtn = document.getElementById('nextFromCase');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      completeStage('kasus');
      navigateTo('struktur');
    });
  }
}

function renderStruktur(container) {
  const mapData = DATA.structureMap;
  const checked = State.structureChecked;
  const selected = State.selectedAttrId;
  const assigned = {};
  const unassigned = [];

  mapData.entities.forEach(function (entity) {
    assigned[entity.id] = [];
  });

  mapData.attributes.forEach(function (attr) {
    const assignedTo = State.attrAssignments[attr.id];
    if (assignedTo && assigned[assignedTo]) assigned[assignedTo].push(attr.id);
    else unassigned.push(attr.id);
  });

  const poolChips = unassigned.map(function (attrId) {
    const attr = findAttribute(mapData.attributes, attrId);
    return `<button type="button" class="attr-chip ${selected === attrId ? 'is-selected' : ''}" data-atid="${esc(attrId)}" aria-pressed="${selected === attrId}">${esc(attr.label)}</button>`;
  }).join('');

  const columnsHTML = mapData.entities.map(function (entity) {
    const chipsHTML = assigned[entity.id].map(function (attrId) {
      const attr = findAttribute(mapData.attributes, attrId);
      let cls = 'attr-chip attr-chip--' + entity.colorKey;
      if (checked) cls += attr.entityId === entity.id ? ' attr-chip--correct' : ' attr-chip--incorrect';
      return `<button type="button" class="${cls}" data-atid="${esc(attrId)}" title="Klik untuk mengembalikan ke daftar">${esc(attr.label)}</button>`;
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
    const correct = mapData.attributes.filter(function (attr) {
      return State.attrAssignments[attr.id] === attr.entityId;
    }).length;
    const total = mapData.attributes.length;
    State.score.structureCorrect = correct;
    State.score.structureTotal = total;
    scoreHTML = `<div class="feedback-box feedback-box--${correct === total ? 'success' : 'warning'}" style="margin-bottom:var(--space-4);">
      <span class="feedback-box__icon">${correct === total ? '🧱' : '🛠️'}</span>
      <div class="feedback-box__body"><strong>${correct} dari ${total} atribut ditempatkan dengan tepat.</strong>${correct === total ? '<br>Struktur tabelmu sudah rapi dan siap dibaca sebagai rancangan awal.' : '<br>Atribut bertanda ✗ masih perlu dipindah agar tidak terjadi campur aduk fungsi tabel.'}</div>
    </div>`;
  }

  const allAssigned = unassigned.length === 0;

  container.innerHTML = `
    <section aria-label="Simulasi struktur data">
      <div class="stage-head">
        <span class="stage-head__kicker">TAHAP 5 — MENYUSUN STRUKTUR DATA</span>
        <p class="stage-head__goal">Tujuan: Menempatkan data ke tabel yang tepat agar rancangan relasional menjadi jelas dan minim duplikasi.</p>
      </div>

      <div class="panel">
        <p style="font-size:0.88rem;color:var(--color-ink-muted);">${esc(mapData.instruction)}</p>

        <div class="selected-indicator ${selected ? 'is-visible' : ''}">
          ${selected ? `Dipilih: <strong>${esc(findAttribute(mapData.attributes, selected).label)}</strong> — sekarang klik tabel yang sesuai.` : ''}
        </div>

        <div class="attr-pool-section">
          <div class="attr-pool-label">Atribut belum ditempatkan <span class="attr-pool-count">${unassigned.length}</span></div>
          <div class="attr-pool ${unassigned.length === 0 ? 'attr-pool--empty' : ''}">${poolChips}</div>
        </div>

        <details class="hint-reveal" style="margin-bottom:var(--space-4);">
          <summary>💡 Cara berpikirnya</summary>
          <div class="hint-reveal__content">
            Tanyakan: <em>"atribut ini menjelaskan data apa?"</em> Jika jawabannya siswa, taruh di Tabel Siswa.
            Jika atribut itu mencatat kejadian hadir/izin/sakit pada tanggal tertentu, taruh di Tabel Absensi.
          </div>
        </details>

        ${scoreHTML}

        <div class="entity-columns">${columnsHTML}</div>

        <div class="btn-group btn-group--spread">
          <button type="button" class="btn btn--ghost" id="retryStructureBtn" style="${checked ? '' : 'visibility:hidden'}">↩ Coba Lagi</button>
          <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;">
            <button type="button" class="btn btn--primary" id="checkStructureBtn" ${allAssigned ? '' : 'disabled'}>${checked ? '✓ Periksa Ulang' : 'Cek Struktur'}</button>
            ${checked ? '<button type="button" class="btn btn--primary" id="nextFromStructure">Lanjut →</button>' : ''}
          </div>
        </div>
      </div>
    </section>`;

  container.querySelectorAll('.attr-pool .attr-chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      const attrId = chip.dataset.atid;
      State.selectedAttrId = State.selectedAttrId === attrId ? null : attrId;
      State.structureChecked = false;
      saveState();
      renderStruktur(container);
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
      State.structureChecked = false;
      saveState();
      renderStruktur(container);
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
      State.structureChecked = false;
      saveState();
      renderStruktur(container);
    });
  });

  document.getElementById('checkStructureBtn').addEventListener('click', function () {
    State.structureChecked = true;
    saveState();
    renderStruktur(container);
  });

  const retryBtn = document.getElementById('retryStructureBtn');
  if (retryBtn) {
    retryBtn.addEventListener('click', function () {
      if (!confirmAction('Reset penempatan atribut pada tahap ini?')) return;
      State.attrAssignments = {};
      State.selectedAttrId = null;
      State.structureChecked = false;
      saveState();
      renderStruktur(container);
    });
  }

  const nextBtn = document.getElementById('nextFromStructure');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      completeStage('struktur');
      navigateTo('evaluasi');
    });
  }
}

function renderEvaluasi(container) {
  const stageData = DATA.evaluation;
  const evalState = State.evaluation;
  const selectedDesign = evalState.selectedDesign;
  const allReady = !!selectedDesign && evalState.selectedReasons.length > 0;

  let feedbackHTML = '';
  if (evalState.checked) {
    const goodReasonCount = evalState.selectedReasons.filter(function (reasonId) {
      const reason = stageData.reasons.find(function (item) { return item.id === reasonId; });
      return reason && reason.isGood;
    }).length;
    const hasBadReason = evalState.selectedReasons.some(function (reasonId) {
      const reason = stageData.reasons.find(function (item) { return item.id === reasonId; });
      return reason && !reason.isGood;
    });

    let cls = 'error';
    let icon = '❌';
    let text = stageData.feedback.wrong;

    if (selectedDesign === stageData.correctDesign) {
      State.score.evaluationCorrect = 1;
      if (goodReasonCount >= 2 && !hasBadReason) {
        cls = 'success';
        icon = '✅';
        text = stageData.feedback.perfect;
      } else {
        cls = 'warning';
        icon = '⚠️';
        text = stageData.feedback.partial;
      }
    } else {
      State.score.evaluationCorrect = 0;
    }

    feedbackHTML = `<div class="feedback-box feedback-box--${cls}">
      <span class="feedback-box__icon">${icon}</span>
      <div class="feedback-box__body">${text}</div>
    </div>`;
  }

  const designHTML = stageData.designs.map(function (design) {
    return `<label class="design-card ${selectedDesign === design.id ? 'is-selected' : ''}">
      <div class="design-card__header">
        <input type="radio" name="design_choice" value="${esc(design.id)}" ${selectedDesign === design.id ? 'checked' : ''}>
        <div>
          <strong>${esc(design.label)}</strong>
          <div class="design-card__desc">${esc(design.description)}</div>
        </div>
      </div>
      <div class="mini-table-wrap">
        <table class="mini-table">
          <tbody>${design.rows.map(function (row) {
      return '<tr>' + row.map(function (cell) { return '<td>' + esc(cell) + '</td>'; }).join('') + '</tr>';
    }).join('')}</tbody>
        </table>
      </div>
    </label>`;
  }).join('');

  const reasonHTML = stageData.reasons.map(function (reason) {
    const isSelected = evalState.selectedReasons.indexOf(reason.id) >= 0;
    let cls = 'choice-option';
    if (isSelected) cls += ' is-selected';
    if (evalState.checked) {
      if (isSelected && reason.isGood) cls += ' is-correct';
      else if (isSelected && !reason.isGood) cls += ' is-incorrect';
      else if (!isSelected && reason.isGood) cls += ' unchecked-missed';
    }
    return `<label class="${cls}">
      <input type="checkbox" value="${esc(reason.id)}" ${isSelected ? 'checked' : ''}>
      <span>${esc(reason.label)}</span>
    </label>`;
  }).join('');

  container.innerHTML = `
    <section aria-label="Evaluasi rancangan">
      <div class="stage-head">
        <span class="stage-head__kicker">TAHAP 6 — EVALUASI RANCANGAN</span>
        <p class="stage-head__goal">Tujuan: Menjelaskan mengapa struktur data yang baik penting bagi pengembangan perangkat lunak.</p>
      </div>

      <div class="panel">
        <h3>${esc(stageData.title)}</h3>
        <p style="font-size:0.88rem;color:var(--color-ink-muted);">${esc(stageData.prompt)}</p>

        <div class="design-grid">${designHTML}</div>

        <h4 style="margin-top:var(--space-5);">Pilih alasan yang paling kuat</h4>
        <div class="reasoning-options">${reasonHTML}</div>

        ${feedbackHTML}

        <div class="btn-group btn-group--spread">
          <button type="button" class="btn btn--ghost" id="retryEvaluationBtn" style="${evalState.checked ? '' : 'visibility:hidden'}">↩ Coba Lagi</button>
          <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;">
            <button type="button" class="btn btn--primary" id="checkEvaluationBtn" ${allReady ? '' : 'disabled'}>${evalState.checked ? '✓ Periksa Ulang' : 'Periksa Jawaban'}</button>
            ${evalState.checked ? '<button type="button" class="btn btn--primary" id="nextFromEvaluation">Lanjut →</button>' : ''}
          </div>
        </div>
      </div>
    </section>`;

  container.querySelectorAll('input[name="design_choice"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
      State.evaluation.selectedDesign = radio.value;
      State.evaluation.checked = false;
      saveState();
      renderEvaluasi(container);
    });
  });

  container.querySelectorAll('.reasoning-options input[type="checkbox"]').forEach(function (checkbox) {
    checkbox.addEventListener('change', function () {
      const reasons = State.evaluation.selectedReasons.slice();
      if (checkbox.checked) {
        if (reasons.indexOf(checkbox.value) < 0) reasons.push(checkbox.value);
      } else {
        State.evaluation.selectedReasons = reasons.filter(function (reasonId) { return reasonId !== checkbox.value; });
      }
      if (checkbox.checked) State.evaluation.selectedReasons = reasons;
      State.evaluation.checked = false;
      saveState();
      renderEvaluasi(container);
    });
  });

  document.getElementById('checkEvaluationBtn').addEventListener('click', function () {
    State.evaluation.checked = true;
    saveState();
    renderEvaluasi(container);
  });

  const retryBtn = document.getElementById('retryEvaluationBtn');
  if (retryBtn) {
    retryBtn.addEventListener('click', function () {
      if (!confirmAction('Ulangi penilaian rancangan?')) return;
      State.evaluation.checked = false;
      saveState();
      renderEvaluasi(container);
    });
  }

  const nextBtn = document.getElementById('nextFromEvaluation');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      completeStage('evaluasi');
      navigateTo('refleksi');
    });
  }
}

function renderRefleksi(container) {
  const ready = DATA.reflection.questions.every(function (question) {
    return (State.reflections[question.id] || '').trim().length >= 20;
  });

  const questionsHTML = DATA.reflection.questions.map(function (question) {
    return `<div class="reflection-card">
      <h3>${esc(question.question)}</h3>
      <p class="reflection-guidance">${esc(question.guidance)}</p>
      <textarea class="input-textarea" id="reflection-${esc(question.id)}" rows="5" placeholder="${esc(question.placeholder)}">${esc(State.reflections[question.id] || '')}</textarea>
    </div>`;
  }).join('');

  container.innerHTML = `
    <section aria-label="Refleksi">
      <div class="stage-head">
        <span class="stage-head__kicker">TAHAP 7 — REFLEKSI</span>
        <p class="stage-head__goal">Tujuan: Menyimpulkan manfaat struktur data relasional dan mengaitkannya dengan pengembangan aplikasi.</p>
      </div>

      <div class="panel">
        <p style="font-size:0.88rem;color:var(--color-ink-muted);">Tuliskan jawaban refleksimu. Minimal beberapa kalimat singkat agar pemikiranmu terlihat jelas.</p>
        <div class="reflection-grid">${questionsHTML}</div>

        <div class="btn-group btn-group--spread">
          <button type="button" class="btn btn--ghost" id="saveReflectionBtn">Simpan Refleksi</button>
          <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;">
            <button type="button" class="btn btn--primary" id="nextFromReflection" ${ready ? '' : 'disabled'}>Selesai →</button>
          </div>
        </div>
      </div>
    </section>`;

  document.querySelectorAll('.input-textarea').forEach(function (textarea) {
    textarea.addEventListener('input', function () {
      State.reflections[textarea.id.replace('reflection-', '')] = textarea.value;
      saveState();
      const nextBtn = document.getElementById('nextFromReflection');
      if (nextBtn) {
        const allReady = DATA.reflection.questions.every(function (question) {
          return (State.reflections[question.id] || '').trim().length >= 20;
        });
        nextBtn.disabled = !allReady;
      }
    });
  });

  document.getElementById('saveReflectionBtn').addEventListener('click', function () {
    const allReady = DATA.reflection.questions.every(function (question) {
      return (State.reflections[question.id] || '').trim().length >= 20;
    });
    saveState();
    showNotice(allReady ? 'Refleksi tersimpan. Kamu bisa lanjut ke tahap selesai.' : 'Refleksi tersimpan. Lengkapi jawaban agar tombol lanjut aktif.');
  });

  document.getElementById('nextFromReflection').addEventListener('click', function () {
    completeStage('refleksi');
    navigateTo('selesai');
  });
}

function renderSelesai(container) {
  completeStage('selesai');

  const conceptHTML = DATA.summaryConcepts.map(function (item) {
    return `<div class="concept-card">
      <span class="concept-card__icon">${item.icon}</span>
      <div class="concept-card__term">${esc(item.term)}</div>
      <p class="concept-card__def">${esc(item.definition)}</p>
      <div class="concept-card__example">${esc(item.example)}</div>
    </div>`;
  }).join('');

  const summaryChips = [
    scoreChip('Aktivasi', State.score.activationCorrect, State.score.activationTotal),
    scoreChip('Konsep', State.score.conceptCorrect, State.score.conceptTotal),
    scoreChip('Studi kasus', State.score.caseCorrect, State.score.caseTotal),
    scoreChip('Struktur', State.score.structureCorrect, State.score.structureTotal),
    'Evaluasi: ' + (State.score.evaluationCorrect ? 'tepat' : 'perlu ditinjau')
  ];

  container.innerHTML = `
    <section aria-label="Selesai">
      <div class="stage-head">
        <span class="stage-head__kicker">TAHAP 8 — SELESAI</span>
        <p class="stage-head__goal">Ringkasan konsep dan hasil belajar.</p>
      </div>

      <div class="panel panel--hero" style="text-align:center;padding:var(--space-7) var(--space-6);">
        <div style="font-size:3rem;margin-bottom:var(--space-3);">🎓</div>
        <h2>Media selesai dipelajari</h2>
        <p style="font-size:1.02rem;color:var(--color-ink-muted);">
          Kamu telah menelusuri alur dari data mentah sampai alasan mengapa struktur basis data relasional penting untuk pengembangan perangkat lunak.
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
          <li>Bandingkan rancanganmu dengan kelompok lain dan diskusikan mana yang lebih hemat duplikasi data.</li>
          <li>Hubungkan materi ini dengan topik berikutnya: entitas, atribut, primary key, relationship, dan foreign key.</li>
          <li>Coba pikirkan sistem lain di sekolah yang juga membutuhkan struktur data relasional, misalnya perpustakaan atau inventaris.</li>
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
  const match = categories.find(function (item) { return item.id === id; });
  return match ? match.label : id;
}

function findAttribute(attributes, id) {
  return attributes.find(function (item) { return item.id === id; });
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
