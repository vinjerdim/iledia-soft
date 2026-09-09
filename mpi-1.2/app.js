'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Bagian:
   1. State & storage
   2. Navigasi
   3. Render stage: Orientasi
   4. Render stage: SRS & Klasifikasi
   5. Render stage: Peta Atribut
   6. Render stage: Primary Key Challenge
   7. Render stage: Uji Keunikan
   8. Render stage: Studi Kasus
   9. Render stage: Tabel Pemetaan
   10. Render stage: Peer Review
   11. Render stage: Hasil Latihan
   12. Render stage: Refleksi
   13. Render stage: Selesai
   14. Helper & utilitas
   15. Init
   ============================================================ */

/* ============================================================
   1. STATE & STORAGE
   ============================================================ */

const STAGES = [
  'orientasi', 'srs', 'mapping', 'pk',
  'uniqueness', 'casestudy', 'table',
  'peerreview', 'results', 'reflection', 'done'
];

const STAGE_LABELS = [
  'Orientasi', 'Narasi SRS', 'Peta Atribut', 'Primary Key',
  'Uji Keunikan', 'Studi Kasus', 'Tabel Pemetaan',
  'Peer Review', 'Hasil Latihan', 'Refleksi', 'Selesai'
];

const STORAGE_KEY = 'mpi-1-2-v1';

const State = {
  currentStage:       'orientasi',
  completedStages:    {},   // { stageName: true }

  /* Stage 2 — SRS Klasifikasi */
  classification:     {},   // { candidateId: 'entitas'|'atribut'|'bukan' }
  classifChecked:     false,

  /* Stage 3 — Peta Atribut */
  attrAssignments:    {},   // { attrId: entityId|null }
  selectedAttrId:     null,
  mappingChecked:     false,

  /* Stage 4 — PK Challenge */
  pkCurrentIdx:       0,
  pkAnswers:          [],   // [{ selectedPK, selectedReasons:[], checked }]

  /* Stage 5 — Uji Keunikan */
  testedColumns:      {},   // { colId: true }

  /* Stage 6 — Studi Kasus */
  selectedCase:       null,
  caseEntities:       [],   // [{ id, name, attrs:[], pk, reason }]
  caseChecked:        false,

  /* Stage 7 — Tabel Pemetaan */
  tableRows:          [],   // [{ id, entity, attributes, pk, reason }]
  tableNextId:        1,
  tableChecked:       false,

  /* Stage 8 — Peer Review */
  peerChecked:        {},   // { pr1: bool, ... }

  /* Stage 10 — Refleksi */
  reflections:        {},   // { r1: string, r2: string }

  /* Scoring */
  score: {
    classifCorrect: 0, classifTotal: 0,
    mappingCorrect: 0, mappingTotal: 0,
    pkCorrect: 0,      pkTotal: 0
  }
};

function saveState() {
  try {
    const s = Object.assign({}, State);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(s));
  } catch (e) { /* silently continue if storage unavailable */ }
}

function loadState() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const saved = JSON.parse(raw);
    Object.assign(State, saved);
    return true;
  } catch (e) { return false; }
}

function clearState() {
  try { localStorage.removeItem(STORAGE_KEY); } catch (e) { /* ignore */ }
  State.currentStage    = 'orientasi';
  State.completedStages = {};
  State.classification  = {};
  State.classifChecked  = false;
  State.attrAssignments = {};
  State.selectedAttrId  = null;
  State.mappingChecked  = false;
  State.pkCurrentIdx    = 0;
  State.pkAnswers       = [];
  State.testedColumns   = {};
  State.selectedCase    = null;
  State.caseEntities    = [];
  State.caseChecked     = false;
  State.tableRows       = [];
  State.tableNextId     = 1;
  State.tableChecked    = false;
  State.peerChecked     = {};
  State.reflections     = {};
  State.score           = { classifCorrect:0, classifTotal:0, mappingCorrect:0, mappingTotal:0, pkCorrect:0, pkTotal:0 };
}

/* ============================================================
   2. NAVIGASI
   ============================================================ */

function navigateTo(stageId) {
  const targetIdx  = STAGES.indexOf(stageId);
  const currentIdx = STAGES.indexOf(State.currentStage);
  if (targetIdx === -1) return;

  /* Allow backward navigation freely; forward requires current to be complete */
  if (targetIdx > currentIdx) {
    /* Check all stages between current and target are completed */
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

    /* Disable stages not yet reachable */
    if (idx > currentIdx && !State.completedStages[STAGES[idx - 1]]) {
      item.disabled = true;
    }
  });
}

function updateProgress() {
  const total     = STAGES.length;
  const done      = Object.keys(State.completedStages).length;
  const pct       = Math.round((done / total) * 100);
  const barFill   = document.getElementById('progressFill');
  const barLabel  = document.getElementById('progressLabel');
  if (barFill)  barFill.style.width = pct + '%';
  if (barLabel) barLabel.textContent = done + ' dari ' + total + ' tahap selesai';
}

/* ============================================================
   3. RENDER DISPATCHER
   ============================================================ */

function renderCurrentStage() {
  const container = document.getElementById('stageContainer');
  container.innerHTML = '';
  updateProgress();

  switch (State.currentStage) {
    case 'orientasi':  renderOrientasi(container);  break;
    case 'srs':        renderSRS(container);         break;
    case 'mapping':    renderMapping(container);     break;
    case 'pk':         renderPK(container);          break;
    case 'uniqueness': renderUniqueness(container);  break;
    case 'casestudy':  renderCaseStudy(container);   break;
    case 'table':      renderTable(container);       break;
    case 'peerreview': renderPeerReview(container);  break;
    case 'results':    renderResults(container);     break;
    case 'reflection': renderReflection(container);  break;
    case 'done':       renderDone(container);        break;
    default:           container.innerHTML = '<p>Tahap tidak ditemukan.</p>';
  }
}

/* ============================================================
   4. STAGE: ORIENTASI
   ============================================================ */

function renderOrientasi(container) {
  const html = `
    <section aria-label="Orientasi">
      <div class="stage-head">
        <span class="stage-head__kicker">TAHAP 1 — MEMAHAMI</span>
        <p class="stage-head__goal">Tujuan: Memahami tujuan pembelajaran dan cara menggunakan media ini.</p>
      </div>

      <div class="panel panel--hero">
        <h2>${esc(DATA.meta.title)}</h2>
        <p style="font-size:1.05rem;"><strong>Tujuan Pembelajaran:</strong><br>
          ${esc(DATA.meta.goal)}
        </p>

        <div class="panel panel--info" style="margin-bottom:0;">
          <h3 style="margin-bottom:var(--space-2);">Dalam media ini kamu akan:</h3>
          <ol class="objectives-list">
            <li><span class="objectives-list__num">1</span>Membaca narasi Spesifikasi Kebutuhan Sistem (SRS) dan mengklasifikasikan kandidat entitas &amp; atribut.</li>
            <li><span class="objectives-list__num">2</span>Menghubungkan atribut dengan entitas yang tepat melalui peta atribut interaktif.</li>
            <li><span class="objectives-list__num">3</span>Memilih kandidat primary key dan memberikan alasan pemilihan.</li>
            <li><span class="objectives-list__num">4</span>Menguji keunikan kandidat primary key menggunakan contoh data nyata.</li>
            <li><span class="objectives-list__num">5</span>Menganalisis studi kasus baru dan menyusun tabel pemetaan entitas.</li>
            <li><span class="objectives-list__num">6</span>Melakukan simulasi peer-review untuk memeriksa kualitas analisis.</li>
            <li><span class="objectives-list__num">7</span>Merefleksikan proses belajar dan konsep yang dipelajari.</li>
          </ol>
        </div>
      </div>

      <div class="panel panel--compact">
        <h3>Cara menggunakan media ini</h3>
        <div class="hero-steps">
          <div class="hero-steps__item"><span class="hero-steps__num">1</span>Kerjakan setiap tahap secara berurutan dari kiri ke kanan.</div>
          <div class="hero-steps__item"><span class="hero-steps__num">2</span>Pada setiap aktivitas, kamu bisa <strong>mencoba kembali</strong> jika ingin memperbaiki jawaban.</div>
          <div class="hero-steps__item"><span class="hero-steps__num">3</span>Perhatikan <strong>feedback</strong> yang muncul — feedback menjelaskan alasan, bukan sekadar "benar/salah".</div>
          <div class="hero-steps__item"><span class="hero-steps__num">4</span>Media ini <em>tidak</em> menggantikan diskusi kelompok dan penilaian guru.</div>
        </div>
      </div>

      <div class="panel panel--compact" style="background:var(--color-warning-soft);border-color:var(--color-warning);">
        <p style="margin:0;font-size:0.88rem;color:var(--color-warning-strong);">
          <strong>Catatan guru:</strong> Hasil latihan dalam media ini adalah panduan belajar, bukan nilai akhir. 
          Asesmen sumatif, peer-review, diskusi kelompok, dan keputusan penilaian tetap sepenuhnya di tangan guru.
        </p>
      </div>

      <div class="btn-group btn-group--end">
        <button type="button" class="btn btn--primary btn--large" id="startBtn">
          Mulai Belajar →
        </button>
      </div>
    </section>`;

  container.innerHTML = html;
  document.getElementById('startBtn').addEventListener('click', function () {
    completeStage('orientasi');
    navigateTo('srs');
  });
}

/* ============================================================
   5. STAGE: SRS & KLASIFIKASI
   ============================================================ */

function parseSRSParagraphs(paragraphs) {
  /* Replace {id|text} markers with <span class="candidate-ref"> */
  return paragraphs.map(function (para) {
    return para.replace(/\{([^|]+)\|([^}]+)\}/g, function (_, id, text) {
      const cls = State.classification[id]
        ? 'candidate-ref--' + State.classification[id]
        : 'candidate-ref--unclassified';
      return '<span class="candidate-ref ' + cls + '" data-cref="' + esc(id) + '">' + esc(text) + '</span>';
    });
  });
}

function renderSRS(container) {
  const srs     = DATA.srs;
  const paras   = parseSRSParagraphs(srs.paragraphs);
  const checked = State.classifChecked;

  const candidatesHTML = srs.candidates.map(function (c) {
    const current = State.classification[c.id] || null;
    const fb      = (State.classifChecked && current) ? buildClassifFeedback(c, current) : { cls: '', html: '' };

    return `<div class="candidate-item ${checked ? 'candidate-item--checked' : ''}" id="ci-${esc(c.id)}" data-cid="${esc(c.id)}">
      <div class="candidate-item__header">
        <span class="candidate-item__label">${esc(c.label)}</span>
        ${current ? `<span class="candidate-item__badge badge--${esc(current)}">${esc(current === 'bukan' ? 'bukan kandidat utama' : current)}</span>` : ''}
      </div>
      <div class="candidate-item__actions">
        <button type="button" class="classify-btn ${current === 'entitas' ? 'is-selected' : ''}" data-cid="${esc(c.id)}" data-classify="entitas">Entitas</button>
        <button type="button" class="classify-btn ${current === 'atribut' ? 'is-selected' : ''}" data-cid="${esc(c.id)}" data-classify="atribut">Atribut</button>
        <button type="button" class="classify-btn ${current === 'bukan' ? 'is-selected' : ''}" data-cid="${esc(c.id)}" data-classify="bukan">Bukan Kandidat Utama</button>
      </div>
      <div class="candidate-item__feedback ${fb.cls}" id="cfb-${esc(c.id)}">${fb.html}</div>
    </div>`;
  }).join('');

  const allClassified = srs.candidates.every(function (c) { return !!State.classification[c.id]; });

  /* Build score if checked */
  let scoreHTML = '';
  if (checked) {
    const correct = srs.candidates.filter(function (c) { return State.classification[c.id] === c.correct; }).length;
    const total   = srs.candidates.length;
    const pct     = Math.round((correct / total) * 100);
    const ok      = correct === total;
    scoreHTML = `<div class="feedback-box feedback-box--${ok ? 'success' : 'warning'}" style="margin-bottom:var(--space-4);">
      <span class="feedback-box__icon">${ok ? '🎉' : '📊'}</span>
      <div class="feedback-box__body">
        <strong>${correct} dari ${total} klasifikasi benar (${pct}%)</strong>
        ${ok ? '<br>Semua kandidat berhasil diklasifikasikan dengan tepat!' : '<br>Periksa feedback di bawah setiap kandidat dan coba perbaiki.'}
      </div>
    </div>`;
  }

  container.innerHTML = `
    <section aria-label="Narasi SRS dan Klasifikasi">
      <div class="stage-head">
        <span class="stage-head__kicker">TAHAP 2 — MEMBACA NARASI & KLASIFIKASI</span>
        <p class="stage-head__goal">Tujuan: Mengidentifikasi dan mengklasifikasikan entitas serta atribut dari narasi kebutuhan sistem.</p>
      </div>

      <div class="panel">
        <h3>${esc(srs.title)}</h3>
        <p style="font-size:0.85rem;color:var(--color-ink-muted);margin-bottom:var(--space-4);">${esc(srs.instruction)}</p>
        <div class="srs-text" id="srsText">
          ${paras.map(p => '<p>' + p + '</p>').join('')}
        </div>
        <details class="hint-reveal" style="margin-top:var(--space-3);">
          <summary>💡 Petunjuk membaca narasi SRS</summary>
          <div class="hint-reveal__content">
            <ul style="margin:0;padding-left:1.2em;">
              <li>Kata benda yang disebut berkali-kali biasanya adalah <strong>entitas</strong>.</li>
              <li>Setiap kalimat <em>"X memiliki Y, Z, W"</em> menunjukkan Y, Z, W adalah atribut dari X.</li>
              <li>Entitas tidak harus benda fisik — kejadian/transaksi juga bisa menjadi entitas.</li>
              <li>"Bukan Kandidat Utama" digunakan jika frasa tersebut tidak tepat sebagai entitas maupun atribut utama dalam sistem ini.</li>
            </ul>
          </div>
        </details>
      </div>

      <div class="panel">
        <h3>Klasifikasikan setiap kandidat</h3>
        <p style="font-size:0.85rem;color:var(--color-ink-muted);margin-bottom:var(--space-4);">
          Klik salah satu pilihan (Entitas / Atribut / Bukan Kandidat Utama) untuk setiap frasa yang disorot dalam narasi.
        </p>
        ${scoreHTML}
        <div class="candidate-list" id="candidateList">
          ${candidatesHTML}
        </div>
        <div class="btn-group btn-group--spread" style="margin-top:var(--space-4);">
          <button type="button" class="btn btn--ghost" id="retryClassifBtn" style="${checked ? '' : 'visibility:hidden'}">↩ Coba Lagi</button>
          <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;">
            <button type="button" class="btn btn--primary" id="checkClassifBtn" ${allClassified ? '' : 'disabled'}>
              ${checked ? '✓ Periksa Ulang' : 'Periksa Klasifikasi'}
            </button>
            ${checked ? '<button type="button" class="btn btn--primary" id="nextFromSRS">Lanjut →</button>' : ''}
          </div>
        </div>
      </div>
    </section>`;

  /* --- Events --- */
  container.querySelectorAll('.classify-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const cid      = btn.dataset.cid;
      const classify = btn.dataset.classify;
      State.classification[cid] = classify;
      State.classifChecked      = false;
      saveState();
      renderSRS(container);
    });
  });

  const checkBtn = document.getElementById('checkClassifBtn');
  if (checkBtn) {
    checkBtn.addEventListener('click', function () {
      checkClassification(container);
    });
  }

  const retryBtn = document.getElementById('retryClassifBtn');
  if (retryBtn) {
    retryBtn.addEventListener('click', function () {
      if (!confirmAction('Coba lagi akan menghapus feedback saat ini. Lanjutkan?')) return;
      State.classifChecked = false;
      saveState();
      renderSRS(container);
    });
  }

  const nextBtn = document.getElementById('nextFromSRS');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      completeStage('srs');
      navigateTo('mapping');
    });
  }
}

function buildClassifFeedback(candidate, chosen) {
  const isCorrect = chosen === candidate.correct;
  const text      = candidate.feedback[chosen] || '';
  return {
    cls:  isCorrect ? 'is-correct' : 'is-incorrect',
    html: text
  };
}

function checkClassification(container) {
  State.classifChecked = true;
  const cands   = DATA.srs.candidates;
  let correct   = 0;
  cands.forEach(function (c) {
    if (State.classification[c.id] === c.correct) correct++;
  });
  State.score.classifCorrect = correct;
  State.score.classifTotal   = cands.length;
  saveState();
  renderSRS(container);
}

/* ============================================================
   6. STAGE: PETA ATRIBUT
   ============================================================ */

function renderMapping(container) {
  const mapData  = DATA.mapping;
  const checked  = State.mappingChecked;
  const selected = State.selectedAttrId;

  /* Build assignment map */
  const assigned = {}; // { entityId: [attrId, ...] }
  mapData.entities.forEach(function (e) { assigned[e.id] = []; });
  const unassigned = [];

  mapData.attributes.forEach(function (a) {
    const assignedTo = State.attrAssignments[a.id];
    if (assignedTo && assigned[assignedTo]) {
      assigned[assignedTo].push(a.id);
    } else {
      unassigned.push(a.id);
    }
  });

  /* Pool HTML */
  const poolChips = unassigned.map(function (aid) {
    const a = mapData.attributes.find(function (x) { return x.id === aid; });
    return `<button type="button" class="attr-chip ${selected === aid ? 'is-selected' : ''}" data-atid="${esc(aid)}" aria-pressed="${selected === aid}">${esc(a.label)}</button>`;
  }).join('');

  /* Entity columns HTML */
  const columnsHTML = mapData.entities.map(function (entity) {
    const attrChips = assigned[entity.id].map(function (aid) {
      const a    = mapData.attributes.find(function (x) { return x.id === aid; });
      const cor  = mapData.attributes.find(function (x) { return x.id === aid; }).entityId;
      let chipCls = 'attr-chip attr-chip--' + esc(entity.colorKey);
      if (checked) {
        chipCls += cor === entity.id ? ' attr-chip--correct' : ' attr-chip--incorrect';
      }
      return `<button type="button" class="${chipCls}" data-atid="${esc(aid)}" title="Klik untuk kembalikan ke daftar">${esc(a.label)}</button>`;
    }).join('');

    return `<div class="entity-column entity-column--${esc(entity.colorKey)}" id="ecol-${esc(entity.id)}">
      <div class="entity-column__header" data-eid="${esc(entity.id)}" role="button" tabindex="0" aria-label="Kolom entitas ${esc(entity.label)} — klik untuk tempatkan atribut">
        <span>${esc(entity.label)}</span>
        <span class="entity-column__header-hint">${selected ? 'Klik untuk tempatkan' : ''}</span>
      </div>
      <div class="entity-column__body" id="ecol-body-${esc(entity.id)}">
        ${attrChips}
      </div>
    </div>`;
  }).join('');

  /* Score */
  let scoreHTML = '';
  if (checked) {
    let correct = 0;
    mapData.attributes.forEach(function (a) {
      if (State.attrAssignments[a.id] === a.entityId) correct++;
    });
    State.score.mappingCorrect = correct;
    State.score.mappingTotal   = mapData.attributes.length;
    const total = mapData.attributes.length;
    const ok    = correct === total;
    scoreHTML = `<div class="feedback-box feedback-box--${ok ? 'success' : 'warning'}" style="margin-bottom:var(--space-4);">
      <span class="feedback-box__icon">${ok ? '🎉' : '📊'}</span>
      <div class="feedback-box__body">
        <strong>${correct} dari ${total} atribut ditempatkan dengan benar.</strong>
        ${ok ? '<br>Semua atribut sudah berada di entitas yang tepat!'
              : '<br>Atribut yang ditandai ✗ perlu dipindahkan. Klik chip tersebut untuk mengembalikannya ke daftar, lalu pindahkan ke entitas yang benar.'}
      </div>
    </div>`;
  }

  const allAssigned = unassigned.length === 0;

  container.innerHTML = `
    <section aria-label="Peta Entitas dan Atribut">
      <div class="stage-head">
        <span class="stage-head__kicker">TAHAP 3 — PETA ENTITAS–ATRIBUT</span>
        <p class="stage-head__goal">Tujuan: Menghubungkan setiap atribut dengan entitas yang sesuai.</p>
      </div>

      <div class="panel">
        <p style="font-size:0.88rem;color:var(--color-ink-muted);">${esc(mapData.instruction)}</p>

        <div id="selectedIndicator" class="selected-indicator ${selected ? 'is-visible' : ''}">
          ${selected ? `Dipilih: <strong>${esc(mapData.attributes.find(function(x){return x.id===selected;}).label)}</strong> — Sekarang klik nama entitas yang sesuai, atau klik atribut lain untuk ganti pilihan.` : ''}
        </div>

        <div class="attr-pool-section">
          <div class="attr-pool-label">
            Atribut Belum Ditempatkan
            <span class="attr-pool-count">${unassigned.length}</span>
          </div>
          <div class="attr-pool ${unassigned.length === 0 ? 'attr-pool--empty' : ''}" id="attrPool">
            ${poolChips}
          </div>
        </div>

        <details class="hint-reveal" style="margin-bottom:var(--space-4);">
          <summary>💡 Petunjuk</summary>
          <div class="hint-reveal__content">
            Pertanyaan panduan: <em>"Atribut ini mendeskripsikan apa?"</em> — jawaban itulah entitas yang tepat.
            Misal: "kode_buku mendeskripsikan Buku" → tempatkan di kolom Buku.
          </div>
        </details>

        ${scoreHTML}

        <div class="entity-columns" id="entityColumns">
          ${columnsHTML}
        </div>

        <div class="btn-group btn-group--spread" style="margin-top:var(--space-4);">
          <button type="button" class="btn btn--ghost" id="retryMappingBtn" style="${checked ? '' : 'visibility:hidden'}">↩ Coba Lagi</button>
          <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;">
            <button type="button" class="btn btn--primary" id="checkMappingBtn" ${allAssigned ? '' : 'disabled'}>
              ${checked ? '✓ Periksa Ulang' : 'Cek Penempatan'}
            </button>
            ${checked ? '<button type="button" class="btn btn--primary" id="nextFromMapping">Lanjut →</button>' : ''}
          </div>
        </div>
      </div>
    </section>`;

  /* --- Events: pool chips --- */
  container.querySelectorAll('#attrPool .attr-chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      const aid = chip.dataset.atid;
      State.selectedAttrId = (State.selectedAttrId === aid) ? null : aid;
      State.mappingChecked = false;
      saveState();
      renderMapping(container);
    });
  });

  /* --- Events: entity column headers --- */
  container.querySelectorAll('.entity-column__header[data-eid]').forEach(function (hdr) {
    const handler = function () {
      if (!State.selectedAttrId) {
        showNotice('Pilih atribut dari daftar terlebih dahulu.');
        return;
      }
      State.attrAssignments[State.selectedAttrId] = hdr.dataset.eid;
      State.selectedAttrId = null;
      State.mappingChecked = false;
      saveState();
      renderMapping(container);
    };
    hdr.addEventListener('click', handler);
    hdr.addEventListener('keydown', function (e) { if (e.key === 'Enter' || e.key === ' ') handler(); });
  });

  /* --- Events: assigned chips (click to unassign) --- */
  container.querySelectorAll('.entity-column__body .attr-chip').forEach(function (chip) {
    chip.addEventListener('click', function () {
      const aid = chip.dataset.atid;
      delete State.attrAssignments[aid];
      State.selectedAttrId = null;
      State.mappingChecked = false;
      saveState();
      renderMapping(container);
    });
  });

  const checkBtn = document.getElementById('checkMappingBtn');
  if (checkBtn) {
    checkBtn.addEventListener('click', function () {
      State.mappingChecked = true;
      saveState();
      renderMapping(container);
    });
  }

  const retryBtn = document.getElementById('retryMappingBtn');
  if (retryBtn) {
    retryBtn.addEventListener('click', function () {
      if (!confirmAction('Reset penempatan atribut?')) return;
      State.attrAssignments = {};
      State.selectedAttrId  = null;
      State.mappingChecked  = false;
      saveState();
      renderMapping(container);
    });
  }

  const nextBtn = document.getElementById('nextFromMapping');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      completeStage('mapping');
      navigateTo('pk');
    });
  }
}

/* ============================================================
   7. STAGE: PRIMARY KEY CHALLENGE
   ============================================================ */

function renderPK(container) {
  const challenges = DATA.pkChallenges;
  const idx        = Math.min(State.pkCurrentIdx, challenges.length - 1);
  const ch         = challenges[idx];
  const ans        = State.pkAnswers[idx] || { selectedPK: null, selectedReasons: [], checked: false };

  /* Step indicator */
  const stepDots = challenges.map(function (_, i) {
    let cls = 'pk-step-dot';
    if (i < idx || (State.pkAnswers[i] && State.pkAnswers[i].checked)) cls += ' is-done';
    else if (i === idx) cls += ' is-current';
    return '<span class="' + cls + '"></span>';
  }).join('');

  /* PK options */
  const pkOptionsHTML = ch.attributes.map(function (attr) {
    let optCls = 'pk-option';
    if (ans.selectedPK === attr.id) optCls += ' is-selected';
    if (ans.checked) {
      if (attr.id === ch.correctPK)          optCls += ' is-correct';
      else if (ans.selectedPK === attr.id)   optCls += ' is-incorrect';
    }
    return `<label class="${optCls}">
      <input type="radio" name="pk_choice" value="${esc(attr.id)}" ${ans.selectedPK === attr.id ? 'checked' : ''}>
      <span>
        <span class="pk-option__label">${esc(attr.label)}</span>
        <span class="pk-option__note">${esc(attr.note)}</span>
      </span>
    </label>`;
  }).join('');

  /* Reasoning options */
  const reasonHTML = ch.reasoningOptions.map(function (r) {
    const isSel     = ans.selectedReasons.indexOf(r.id) >= 0;
    let optCls      = 'reasoning-option';
    if (isSel)       optCls += ' is-selected';
    if (ans.checked) {
      if (isSel && r.isGood)   optCls += ' checked-good';
      else if (isSel && !r.isGood) optCls += ' checked-poor';
      else if (!isSel && r.isGood) optCls += ' unchecked-missed';
    }
    return `<label class="${optCls}">
      <input type="checkbox" name="pk_reason" value="${esc(r.id)}" ${isSel ? 'checked' : ''}>
      <span>${esc(r.label)}</span>
    </label>`;
  }).join('');

  /* Feedback HTML */
  let feedbackHTML = '';
  if (ans.checked && ans.selectedPK) {
    const fb = ch.feedbackMap[ans.selectedPK];
    if (typeof fb === 'object') {
      const hasGoodReason = ans.selectedReasons.some(function (rid) {
        return ch.reasoningOptions.find(function (r) { return r.id === rid && r.isGood; });
      });
      const txt = hasGoodReason ? fb.goodReason : fb.poorReason;
      const ok  = ans.selectedPK === ch.correctPK;
      feedbackHTML = `<div class="feedback-box feedback-box--${ok && hasGoodReason ? 'success' : ok ? 'warning' : 'error'}" style="margin-top:var(--space-4);">
        <span class="feedback-box__icon">${ok ? (hasGoodReason ? '✅' : '⚠️') : '❌'}</span>
        <div class="feedback-box__body">${txt}</div>
      </div>`;
    } else {
      feedbackHTML = `<div class="feedback-box feedback-box--error" style="margin-top:var(--space-4);">
        <span class="feedback-box__icon">❌</span>
        <div class="feedback-box__body">${fb}</div>
      </div>`;
    }
  }

  /* Navigation state */
  const allDone = challenges.every(function (_, i) { return State.pkAnswers[i] && State.pkAnswers[i].checked; });

  container.innerHTML = `
    <section aria-label="Primary Key Challenge">
      <div class="stage-head">
        <span class="stage-head__kicker">TAHAP 4 — PEMILIHAN PRIMARY KEY</span>
        <p class="stage-head__goal">Tujuan: Memilih kandidat primary key yang tepat dan memberikan alasan yang valid.</p>
      </div>

      <div class="panel">
        <div class="pk-step-indicator">
          ${stepDots}
          <span>Challenge ${idx + 1} dari ${challenges.length}</span>
          ${challenges.map(function (c, i) {
            return `<span style="font-weight:${i===idx?700:400};color:${i===idx?'var(--color-primary)':'var(--color-ink-muted)'};">${esc(c.entityName)}</span>`;
          }).join(' → ')}
        </div>

        <h3>Entitas: ${esc(ch.entityName)}</h3>
        <p class="pk-entity-context">${esc(ch.context)}</p>

        <h4 style="margin-bottom:var(--space-3);">1. Pilih kandidat Primary Key yang paling tepat:</h4>
        <div class="pk-options" id="pkOptions">
          ${pkOptionsHTML}
        </div>

        <h4 style="margin-bottom:var(--space-3);">2. Pilih alasan pemilihan (boleh lebih dari satu):</h4>
        <div class="reasoning-options" id="reasoningOptions">
          ${reasonHTML}
        </div>

        ${feedbackHTML}

        <details class="hint-reveal" style="margin-top:var(--space-3);">
          <summary>💡 Petunjuk memilih Primary Key</summary>
          <div class="hint-reveal__content">
            Tanyakan tiga pertanyaan: ① Bisakah nilainya berulang? ② Bisakah nilainya berubah? ③ Bisakah nilainya kosong?
            Jika salah satu jawabannya "ya", atribut tersebut tidak ideal sebagai primary key.
          </div>
        </details>

        <div class="btn-group btn-group--spread" style="margin-top:var(--space-4);">
          <div style="display:flex;gap:var(--space-2);">
            ${idx > 0 ? '<button type="button" class="btn btn--ghost" id="pkPrevBtn">← Sebelumnya</button>' : '<span></span>'}
            ${ans.checked ? '<button type="button" class="btn btn--ghost" id="pkRetryBtn">↩ Coba Lagi</button>' : ''}
          </div>
          <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;">
            ${!ans.checked ? `<button type="button" class="btn btn--primary" id="checkPKBtn" ${ans.selectedPK ? '' : 'disabled'}>Periksa</button>` : ''}
            ${ans.checked && idx < challenges.length - 1 ? '<button type="button" class="btn btn--primary" id="pkNextBtn">Challenge Berikutnya →</button>' : ''}
            ${allDone ? '<button type="button" class="btn btn--primary" id="nextFromPK">Lanjut ke Uji Keunikan →</button>' : ''}
          </div>
        </div>
      </div>
    </section>`;

  /* --- Events --- */
  container.querySelectorAll('input[name="pk_choice"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
      ensurePkAnswer(idx);
      State.pkAnswers[idx].selectedPK = radio.value;
      State.pkAnswers[idx].checked    = false;
      saveState();
      renderPK(container);
    });
  });

  container.querySelectorAll('input[name="pk_reason"]').forEach(function (cb) {
    cb.addEventListener('change', function () {
      ensurePkAnswer(idx);
      const reasons = State.pkAnswers[idx].selectedReasons;
      if (cb.checked) {
        if (reasons.indexOf(cb.value) < 0) reasons.push(cb.value);
      } else {
        State.pkAnswers[idx].selectedReasons = reasons.filter(function (r) { return r !== cb.value; });
      }
      State.pkAnswers[idx].checked = false;
      saveState();
      renderPK(container);
    });
  });

  const checkBtn = document.getElementById('checkPKBtn');
  if (checkBtn) {
    checkBtn.addEventListener('click', function () {
      ensurePkAnswer(idx);
      if (!State.pkAnswers[idx].selectedReasons.length) {
        showNotice('Pilih setidaknya satu alasan sebelum memeriksa.');
        return;
      }
      State.pkAnswers[idx].checked = true;
      /* Update score */
      State.score.pkTotal = challenges.length;
      let pkCorrect = 0;
      challenges.forEach(function (ch, i) {
        if (State.pkAnswers[i] && State.pkAnswers[i].checked && State.pkAnswers[i].selectedPK === ch.correctPK) pkCorrect++;
      });
      State.score.pkCorrect = pkCorrect;
      saveState();
      renderPK(container);
    });
  }

  const retryBtn = document.getElementById('pkRetryBtn');
  if (retryBtn) {
    retryBtn.addEventListener('click', function () {
      ensurePkAnswer(idx);
      State.pkAnswers[idx] = { selectedPK: null, selectedReasons: [], checked: false };
      saveState();
      renderPK(container);
    });
  }

  const prevBtn = document.getElementById('pkPrevBtn');
  if (prevBtn) {
    prevBtn.addEventListener('click', function () {
      State.pkCurrentIdx = Math.max(0, idx - 1);
      saveState();
      renderPK(container);
    });
  }

  const pkNextBtn = document.getElementById('pkNextBtn');
  if (pkNextBtn) {
    pkNextBtn.addEventListener('click', function () {
      State.pkCurrentIdx = idx + 1;
      saveState();
      renderPK(container);
    });
  }

  const nextFromPK = document.getElementById('nextFromPK');
  if (nextFromPK) {
    nextFromPK.addEventListener('click', function () {
      completeStage('pk');
      navigateTo('uniqueness');
    });
  }
}

function ensurePkAnswer(idx) {
  if (!State.pkAnswers[idx]) {
    State.pkAnswers[idx] = { selectedPK: null, selectedReasons: [], checked: false };
  }
}

/* ============================================================
   8. STAGE: UJI KEUNIKAN
   ============================================================ */

function renderUniqueness(container) {
  const uData    = DATA.uniqueness;
  const tested   = State.testedColumns;
  const active   = Object.keys(tested).find(function (k) { return tested[k] === 'active'; }) || null;

  /* Find duplicate rows for active column */
  const dupPairs = active ? (DATA.uniqueness.duplicates[active] || []) : [];
  const dupRowSet = new Set();
  dupPairs.forEach(function (pair) { pair.forEach(function (i) { dupRowSet.add(i); }); });

  /* Table header */
  const thHTML = uData.columns.map(function (col) {
    const isActive  = active === col.id;
    const isDone    = tested[col.id] && tested[col.id] !== 'active';
    return `<th>
      <div style="font-family:var(--font-mono);font-size:0.82rem;margin-bottom:4px;">${esc(col.label)}</div>
      <div style="font-size:0.72rem;color:var(--color-ink-muted);margin-bottom:6px;">${esc(col.hint)}</div>
      <button type="button" class="col-test-btn ${isActive ? 'is-active' : ''}" data-colid="${esc(col.id)}">
        ${isActive ? '▶ Sedang diuji' : (isDone ? '✓ Sudah diuji' : 'Uji sebagai PK')}
      </button>
    </th>`;
  }).join('');

  /* Table rows */
  const rowsHTML = uData.rows.map(function (row, ridx) {
    const isDupRow = dupRowSet.has(ridx);
    return '<tr>' + uData.columns.map(function (col) {
      const val = row[col.id];
      const tdCls = active ? (isDupRow && uData.duplicates[active].some(function (p) { return p.indexOf(ridx) >= 0; }) ? 'td-highlight-dup' : 'td-highlight-ok') : '';
      return `<td class="${tdCls}">${esc(String(val))}</td>`;
    }).join('') + '</tr>';
  }).join('');

  /* Result panel */
  let resultHTML = '';
  if (active) {
    const analysis = uData.analysis[active];
    const cls      = analysis.hasDuplicate ? 'result--dup' : 'result--ok';
    resultHTML = `<div class="uniqueness-result ${cls}">
      <div>${analysis.feedback}</div>
      <div class="verdict-badge verdict-badge--${analysis.hasDuplicate ? 'dup' : 'ok'}">${esc(analysis.verdict)}</div>
    </div>`;
  }

  const testedCount   = Object.keys(tested).length;
  const canProceed    = testedCount >= uData.columns.length;

  container.innerHTML = `
    <section aria-label="Simulasi Keunikan Data">
      <div class="stage-head">
        <span class="stage-head__kicker">TAHAP 5 — UJI KEUNIKAN DATA</span>
        <p class="stage-head__goal">Tujuan: Memahami mengapa suatu atribut memenuhi atau tidak memenuhi syarat keunikan primary key.</p>
      </div>

      <div class="panel">
        <h3>${esc(uData.title)}</h3>
        <p style="font-size:0.88rem;color:var(--color-ink-muted);">${esc(uData.instruction)}</p>

        <div style="font-size:0.85rem;color:var(--color-ink-muted);margin-bottom:var(--space-3);">
          Sudah diuji: <strong>${testedCount} dari ${uData.columns.length} kolom</strong>
        </div>

        <div class="uniqueness-table-wrap">
          <table class="uniqueness-table" aria-label="${esc(uData.tableName)}">
            <thead><tr>${thHTML}</tr></thead>
            <tbody>${rowsHTML}</tbody>
          </table>
        </div>

        ${resultHTML}

        <div class="btn-group btn-group--end" style="margin-top:var(--space-4);">
          ${canProceed
            ? '<button type="button" class="btn btn--primary" id="nextFromUniqueness">Lanjut ke Studi Kasus →</button>'
            : `<button type="button" class="btn btn--ghost" disabled>Uji semua kolom untuk melanjutkan (${testedCount}/${uData.columns.length})</button>`}
        </div>
      </div>
    </section>`;

  container.querySelectorAll('.col-test-btn').forEach(function (btn) {
    btn.addEventListener('click', function () {
      const colId = btn.dataset.colid;
      /* Mark previously active as done */
      Object.keys(State.testedColumns).forEach(function (k) {
        if (State.testedColumns[k] === 'active') State.testedColumns[k] = 'done';
      });
      State.testedColumns[colId] = 'active';
      saveState();
      renderUniqueness(container);
    });
  });

  const nextBtn = document.getElementById('nextFromUniqueness');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      completeStage('uniqueness');
      navigateTo('casestudy');
    });
  }
}

/* ============================================================
   9. STAGE: STUDI KASUS
   ============================================================ */

function renderCaseStudy(container) {
  const cases    = DATA.casestudies;
  const selCase  = State.selectedCase ? cases[State.selectedCase] : null;
  const entities = State.caseEntities;

  /* Case selector */
  const caseSelHTML = Object.keys(cases).map(function (cid) {
    const c    = cases[cid];
    const isSel = State.selectedCase === cid;
    return `<button type="button" class="case-card ${isSel ? 'is-selected' : ''}" data-caseid="${esc(cid)}">
      <span class="case-card__icon">${c.icon}</span>
      <span>${esc(c.title)}</span>
    </button>`;
  }).join('');

  /* Narasi */
  let narHTML = '';
  if (selCase) {
    narHTML = `<div class="panel panel--accent" style="margin-bottom:var(--space-4);">
      <h3>${esc(selCase.title)}</h3>
      ${selCase.narasi.map(function (p) { return '<p>' + esc(p) + '</p>'; }).join('')}
      <details class="hint-reveal">
        <summary>💡 Petunjuk analisis narasi</summary>
        <div class="hint-reveal__content">
          <ul style="margin:0;padding-left:1.2em;">
            ${selCase.hints.map(function (h) { return '<li>' + esc(h) + '</li>'; }).join('')}
          </ul>
        </div>
      </details>
    </div>`;
  }

  /* Entity builder */
  let entitiesHTML = '';
  if (selCase) {
    entitiesHTML = entities.map(function (ent, eidx) {
      const attrChips = ent.attrs.map(function (attr, aidx) {
        return `<span class="attr-removable">
          ${esc(attr)}
          <button type="button" class="attr-removable__remove" data-eidx="${eidx}" data-aidx="${aidx}" aria-label="Hapus atribut ${esc(attr)}">×</button>
        </span>`;
      }).join('');

      const pkOptions = ent.attrs.map(function (attr) {
        return `<option value="${esc(attr)}" ${ent.pk === attr ? 'selected' : ''}>${esc(attr)}</option>`;
      }).join('');

      return `<div class="entity-card" id="ecard-${eidx}">
        <div class="entity-card__head">
          <span class="entity-card__title">${ent.name ? esc(ent.name) : '<em>Entitas ' + (eidx + 1) + '</em>'}</span>
          <button type="button" class="btn btn--small btn--ghost" data-remove-entity="${eidx}" aria-label="Hapus entitas ini">Hapus Entitas</button>
        </div>
        <div class="entity-card__body">
          <div class="field-group">
            <label for="ename-${eidx}">Nama Entitas</label>
            <input type="text" id="ename-${eidx}" class="input-text" placeholder="Misal: Pelanggan" value="${esc(ent.name || '')}" data-eidx="${eidx}" data-field="name">
          </div>
          <div class="field-group">
            <label>Atribut</label>
            <div class="attr-chips-row" id="attrrow-${eidx}">${attrChips}</div>
            <div class="add-attr-row">
              <input type="text" class="input-text" placeholder="Ketik nama atribut, Enter untuk tambah" id="attrInput-${eidx}" data-eidx="${eidx}" maxlength="80">
              <button type="button" class="btn btn--ghost btn--small" data-add-attr="${eidx}">+ Tambah</button>
            </div>
          </div>
          <div class="field-group">
            <label for="pksel-${eidx}">Kandidat Primary Key</label>
            ${ent.attrs.length > 0
              ? `<select id="pksel-${eidx}" class="input-select" data-eidx="${eidx}" data-field="pk">
                  <option value="">— Pilih salah satu atribut —</option>
                  ${pkOptions}
                </select>`
              : '<p style="font-size:0.85rem;color:var(--color-ink-muted);margin:0;">Tambahkan atribut terlebih dahulu.</p>'}
          </div>
          <div class="field-group" style="margin-bottom:0;">
            <label for="preason-${eidx}">Alasan Pemilihan PK</label>
            <textarea id="preason-${eidx}" class="input-textarea" placeholder="Jelaskan mengapa atribut tersebut tepat sebagai primary key..." rows="3" data-eidx="${eidx}" data-field="reason">${esc(ent.reason || '')}</textarea>
          </div>
        </div>
      </div>`;
    }).join('');
  }

  /* Validation result */
  let validHTML = '';
  if (State.caseChecked && selCase) {
    const errs = validateCaseEntities();
    if (errs.length === 0) {
      validHTML = `<div class="feedback-box feedback-box--success">
        <span class="feedback-box__icon">✅</span>
        <div class="feedback-box__body"><strong>Analisis kamu sudah memenuhi syarat minimum!</strong><br>
        Kamu berhasil mengidentifikasi ${entities.length} entitas dengan atribut dan kandidat PK untuk setiap entitas. Lanjutkan untuk menyusun tabel pemetaan.</div>
      </div>`;
    } else {
      validHTML = `<div class="feedback-box feedback-box--warning">
        <span class="feedback-box__icon">⚠️</span>
        <div class="feedback-box__body"><strong>Ada yang perlu dilengkapi:</strong><br>
        <ul style="margin:var(--space-2) 0 0 0;padding-left:1.4em;">${errs.map(function (e) { return '<li>' + esc(e) + '</li>'; }).join('')}</ul></div>
      </div>`;
    }
  }

  const canValidate = selCase && entities.length >= (selCase ? selCase.minEntities : 3);

  container.innerHTML = `
    <section aria-label="Studi Kasus Penerapan">
      <div class="stage-head">
        <span class="stage-head__kicker">TAHAP 6 — STUDI KASUS PENERAPAN</span>
        <p class="stage-head__goal">Tujuan: Mengidentifikasi entitas, atribut, dan primary key dari narasi sistem baru.</p>
      </div>

      <div class="panel">
        <h3>Pilih studi kasus</h3>
        <div class="case-selector">${caseSelHTML}</div>
      </div>

      ${narHTML}

      ${selCase ? `
      <div class="panel">
        <div style="display:flex;align-items:center;justify-content:space-between;margin-bottom:var(--space-4);flex-wrap:wrap;gap:var(--space-2);">
          <h3 style="margin:0;">Identifikasi Entitas, Atribut &amp; PK</h3>
          <span style="font-size:0.82rem;color:var(--color-ink-muted);">Minimal ${selCase.minEntities} entitas diperlukan</span>
        </div>

        <div class="entity-builder" id="entityBuilder">
          ${entitiesHTML || '<p style="color:var(--color-ink-muted);font-size:0.88rem;">Klik "+ Tambah Entitas" untuk mulai mengidentifikasi entitas.</p>'}
        </div>

        <div class="btn-group" style="margin-top:var(--space-3);margin-bottom:var(--space-4);">
          <button type="button" class="btn btn--ghost" id="addEntityBtn">+ Tambah Entitas</button>
        </div>

        ${validHTML}

        <div class="btn-group btn-group--spread" style="margin-top:var(--space-4);">
          <button type="button" class="btn btn--ghost" id="retryCaseBtn" style="${State.caseChecked ? '' : 'visibility:hidden'}">↩ Edit</button>
          <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;">
            <button type="button" class="btn btn--primary" id="validateCaseBtn" ${canValidate ? '' : 'disabled'}>
              Validasi Analisis
            </button>
            ${State.caseChecked && validateCaseEntities().length === 0
              ? '<button type="button" class="btn btn--primary" id="nextFromCase">Lanjut ke Tabel →</button>'
              : ''}
          </div>
        </div>
      </div>` : ''}
    </section>`;

  /* --- Events --- */
  container.querySelectorAll('.case-card').forEach(function (card) {
    card.addEventListener('click', function () {
      State.selectedCase  = card.dataset.caseid;
      State.caseEntities  = [];
      State.caseChecked   = false;
      saveState();
      renderCaseStudy(container);
    });
  });

  if (selCase) {
    document.getElementById('addEntityBtn').addEventListener('click', function () {
      State.caseEntities.push({ id: Date.now(), name: '', attrs: [], pk: '', reason: '' });
      State.caseChecked = false;
      saveState();
      renderCaseStudy(container);
    });

    /* Entity name / field updates */
    container.querySelectorAll('[data-field="name"]').forEach(function (inp) {
      inp.addEventListener('input', function () {
        const i = parseInt(inp.dataset.eidx, 10);
        State.caseEntities[i].name = inp.value;
        saveState();
      });
    });
    container.querySelectorAll('[data-field="pk"]').forEach(function (sel) {
      sel.addEventListener('change', function () {
        const i = parseInt(sel.dataset.eidx, 10);
        State.caseEntities[i].pk = sel.value;
        saveState();
      });
    });
    container.querySelectorAll('[data-field="reason"]').forEach(function (ta) {
      ta.addEventListener('input', function () {
        const i = parseInt(ta.dataset.eidx, 10);
        State.caseEntities[i].reason = ta.value;
        saveState();
      });
    });

    /* Add attribute */
    container.querySelectorAll('[data-add-attr]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const i   = parseInt(btn.dataset.addAttr, 10);
        const inp = document.getElementById('attrInput-' + i);
        addAttrToEntity(i, inp ? inp.value : '', container);
      });
    });
    container.querySelectorAll('[id^="attrInput-"]').forEach(function (inp) {
      inp.addEventListener('keydown', function (e) {
        if (e.key === 'Enter') {
          e.preventDefault();
          const i = parseInt(inp.dataset.eidx, 10);
          addAttrToEntity(i, inp.value, container);
        }
      });
    });

    /* Remove attribute */
    container.querySelectorAll('.attr-removable__remove').forEach(function (btn) {
      btn.addEventListener('click', function () {
        const ei = parseInt(btn.dataset.eidx, 10);
        const ai = parseInt(btn.dataset.aidx, 10);
        State.caseEntities[ei].attrs.splice(ai, 1);
        if (State.caseEntities[ei].pk === State.caseEntities[ei].attrs[ai]) {
          State.caseEntities[ei].pk = '';
        }
        saveState();
        renderCaseStudy(container);
      });
    });

    /* Remove entity */
    container.querySelectorAll('[data-remove-entity]').forEach(function (btn) {
      btn.addEventListener('click', function () {
        if (!confirmAction('Hapus entitas ini?')) return;
        const i = parseInt(btn.dataset.removeEntity, 10);
        State.caseEntities.splice(i, 1);
        State.caseChecked = false;
        saveState();
        renderCaseStudy(container);
      });
    });

    /* Validate */
    const valBtn = document.getElementById('validateCaseBtn');
    if (valBtn) {
      valBtn.addEventListener('click', function () {
        State.caseChecked = true;
        saveState();
        renderCaseStudy(container);
      });
    }

    const retryCaseBtn = document.getElementById('retryCaseBtn');
    if (retryCaseBtn) {
      retryCaseBtn.addEventListener('click', function () {
        State.caseChecked = false;
        saveState();
        renderCaseStudy(container);
      });
    }

    const nextFromCase = document.getElementById('nextFromCase');
    if (nextFromCase) {
      nextFromCase.addEventListener('click', function () {
        /* Pre-populate table */
        if (State.tableRows.length === 0) {
          State.caseEntities.forEach(function (ent) {
            State.tableRows.push({
              id: State.tableNextId++,
              entity: ent.name,
              attributes: ent.attrs.join(', '),
              pk: ent.pk,
              reason: ent.reason
            });
          });
        }
        completeStage('casestudy');
        navigateTo('table');
      });
    }
  }
}

function addAttrToEntity(idx, val, container) {
  const trimmed = val.trim();
  if (!trimmed) { showNotice('Nama atribut tidak boleh kosong.'); return; }
  if (trimmed.length > 80) { showNotice('Nama atribut terlalu panjang.'); return; }
  if (State.caseEntities[idx].attrs.indexOf(trimmed) >= 0) {
    showNotice('Atribut "' + trimmed + '" sudah ada.');
    return;
  }
  State.caseEntities[idx].attrs.push(trimmed);
  State.caseChecked = false;
  saveState();
  renderCaseStudy(container);
}

function validateCaseEntities() {
  const errs     = [];
  const selCase  = DATA.casestudies[State.selectedCase];
  const min      = selCase ? selCase.minEntities : 3;
  const entities = State.caseEntities;

  if (entities.length < min) {
    errs.push('Identifikasi minimal ' + min + ' entitas (saat ini: ' + entities.length + ').');
    return errs;
  }
  entities.forEach(function (ent, i) {
    const label = ent.name || 'Entitas ' + (i + 1);
    if (!ent.name.trim()) errs.push('Entitas ' + (i + 1) + ': nama entitas tidak boleh kosong.');
    if (ent.attrs.length < 2)   errs.push(label + ': tambahkan minimal 2 atribut.');
    if (!ent.pk.trim())          errs.push(label + ': pilih kandidat primary key.');
    if (!ent.reason.trim())      errs.push(label + ': isi alasan pemilihan PK.');
  });
  return errs;
}

/* ============================================================
   10. STAGE: TABEL PEMETAAN
   ============================================================ */

function renderTable(container) {
  const rows    = State.tableRows;
  const checked = State.tableChecked;

  const rowsHTML = rows.map(function (row) {
    return `<tr data-rowid="${row.id}">
      <td><textarea class="cell-input" data-rowid="${row.id}" data-col="entity" rows="2" placeholder="Nama entitas">${esc(row.entity || '')}</textarea></td>
      <td><textarea class="cell-input" data-rowid="${row.id}" data-col="attributes" rows="2" placeholder="Pisahkan dengan koma: attr1, attr2, attr3">${esc(row.attributes || '')}</textarea></td>
      <td><textarea class="cell-input" data-rowid="${row.id}" data-col="pk" rows="2" placeholder="Nama atribut PK">${esc(row.pk || '')}</textarea></td>
      <td><textarea class="cell-input" data-rowid="${row.id}" data-col="reason" rows="2" placeholder="Alasan pemilihan PK...">${esc(row.reason || '')}</textarea></td>
      <td class="cell-action"><button type="button" class="btn-row-delete" data-rowid="${row.id}" aria-label="Hapus baris">✕</button></td>
    </tr>`;
  }).join('');

  /* Validation result */
  let validHTML = '';
  if (checked) {
    const errs = validateTableRows();
    if (errs.length === 0) {
      validHTML = `<div class="feedback-box feedback-box--success">
        <span class="feedback-box__icon">✅</span>
        <div class="feedback-box__body"><strong>Tabel sudah lengkap dan valid!</strong><br>Semua baris memiliki entitas, atribut, kandidat PK, dan alasan.</div>
      </div>`;
    } else {
      validHTML = `<div class="feedback-box feedback-box--warning">
        <span class="feedback-box__icon">⚠️</span>
        <div class="feedback-box__body"><strong>Ada kolom yang perlu dilengkapi:</strong><br>
        <ul style="margin:var(--space-2) 0 0 0;padding-left:1.4em;">${errs.map(function (e) { return '<li>' + esc(e) + '</li>'; }).join('')}</ul></div>
      </div>`;
    }
  }

  const canValidate = rows.length >= 3;
  const canProceed  = checked && validateTableRows().length === 0;

  container.innerHTML = `
    <section aria-label="Tabel Pemetaan Entitas">
      <div class="stage-head">
        <span class="stage-head__kicker">TAHAP 7 — TABEL PEMETAAN</span>
        <p class="stage-head__goal">Tujuan: Menyusun hasil analisis dalam tabel pemetaan entitas-atribut-PK yang terstruktur.</p>
      </div>

      <div class="panel">
        <p style="font-size:0.88rem;color:var(--color-ink-muted);margin-bottom:var(--space-4);">
          Isi atau edit tabel berikut berdasarkan analisis studi kasus yang sudah kamu lakukan. 
          Satu baris = satu entitas. Kolom "Atribut" dapat diisi dengan beberapa atribut dipisahkan koma.
        </p>

        <div class="mapping-table-wrap">
          <table class="mapping-table" aria-label="Tabel pemetaan entitas">
            <thead>
              <tr>
                <th style="min-width:120px;">Entitas</th>
                <th style="min-width:200px;">Atribut</th>
                <th style="min-width:140px;">Kandidat PK</th>
                <th style="min-width:200px;">Alasan Pemilihan PK</th>
                <th style="width:48px;"></th>
              </tr>
            </thead>
            <tbody id="tableBody">
              ${rowsHTML}
            </tbody>
          </table>
        </div>

        <div class="btn-group" style="margin-bottom:var(--space-4);">
          <button type="button" class="btn btn--ghost" id="addRowBtn">+ Tambah Baris</button>
          <button type="button" class="btn btn--ghost btn--small" id="resetTableBtn">Reset Tabel</button>
        </div>

        ${validHTML}

        <div class="btn-group btn-group--spread">
          <span></span>
          <div style="display:flex;gap:var(--space-2);flex-wrap:wrap;">
            <button type="button" class="btn btn--primary" id="validateTableBtn" ${canValidate ? '' : 'disabled'}>
              ${canValidate ? 'Validasi Tabel' : 'Isi minimal 3 baris'}
            </button>
            ${canProceed ? '<button type="button" class="btn btn--primary" id="nextFromTable">Lanjut →</button>' : ''}
          </div>
        </div>
      </div>
    </section>`;

  /* --- Events --- */
  container.querySelectorAll('.cell-input').forEach(function (inp) {
    inp.addEventListener('input', function () {
      const rowId = parseInt(inp.dataset.rowid, 10);
      const col   = inp.dataset.col;
      const row   = State.tableRows.find(function (r) { return r.id === rowId; });
      if (row) row[col] = inp.value;
      State.tableChecked = false;
      saveState();
    });
  });

  container.querySelectorAll('.btn-row-delete').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!confirmAction('Hapus baris ini?')) return;
      const rowId = parseInt(btn.dataset.rowid, 10);
      State.tableRows = State.tableRows.filter(function (r) { return r.id !== rowId; });
      State.tableChecked = false;
      saveState();
      renderTable(container);
    });
  });

  document.getElementById('addRowBtn').addEventListener('click', function () {
    State.tableRows.push({ id: State.tableNextId++, entity: '', attributes: '', pk: '', reason: '' });
    State.tableChecked = false;
    saveState();
    renderTable(container);
  });

  document.getElementById('resetTableBtn').addEventListener('click', function () {
    if (!confirmAction('Reset seluruh tabel? Semua isian akan dihapus.')) return;
    State.tableRows    = [];
    State.tableNextId  = 1;
    State.tableChecked = false;
    saveState();
    renderTable(container);
  });

  document.getElementById('validateTableBtn').addEventListener('click', function () {
    State.tableChecked = true;
    saveState();
    renderTable(container);
  });

  const nextBtn = document.getElementById('nextFromTable');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      completeStage('table');
      navigateTo('peerreview');
    });
  }
}

function validateTableRows() {
  const errs = [];
  State.tableRows.forEach(function (row, i) {
    const label = row.entity.trim() || 'Baris ' + (i + 1);
    if (!row.entity.trim())     errs.push(label + ': nama entitas kosong.');
    if (!row.attributes.trim()) errs.push(label + ': kolom atribut kosong.');
    if (!row.pk.trim())         errs.push(label + ': kandidat PK kosong.');
    if (!row.reason.trim())     errs.push(label + ': alasan pemilihan PK kosong.');
  });
  return errs;
}

/* ============================================================
   11. STAGE: PEER REVIEW
   ============================================================ */

function renderPeerReview(container) {
  const pr         = DATA.peerReview;
  const checked    = State.peerChecked;
  const totalItems = pr.items.length;
  const checkedCnt = Object.values(checked).filter(Boolean).length;

  const checklistHTML = pr.items.map(function (item) {
    const isCk = !!checked[item.id];
    return `<label class="checklist-item ${isCk ? 'is-checked' : ''}">
      <input type="checkbox" value="${esc(item.id)}" ${isCk ? 'checked' : ''} aria-label="${esc(item.question)}">
      <span>
        <p class="checklist-item__question">${esc(item.question)}</p>
        <p class="checklist-item__hint">${esc(item.hint)}</p>
      </span>
    </label>`;
  }).join('');

  const canProceed = checkedCnt >= Math.ceil(totalItems * 0.6);

  container.innerHTML = `
    <section aria-label="Simulasi Peer Review">
      <div class="stage-head">
        <span class="stage-head__kicker">TAHAP 8 — PEER REVIEW</span>
        <p class="stage-head__goal">Tujuan: Memeriksa kualitas analisis menggunakan checklist peer-review.</p>
      </div>

      <div class="panel panel--info" style="margin-bottom:var(--space-4);">
        <p style="margin:0;font-size:0.9rem;">${esc(pr.intro)}</p>
      </div>

      <div class="panel">
        <h3>Checklist Kualitas Analisis</h3>
        <p style="font-size:0.85rem;color:var(--color-ink-muted);margin-bottom:var(--space-4);">
          Gunakan checklist ini untuk menilai hasil analisis (misal: hasil kelompok lain). Beri tanda centang pada kriteria yang terpenuhi.
        </p>

        <div class="checklist" id="peerChecklist">
          ${checklistHTML}
        </div>

        <div style="font-size:0.85rem;color:var(--color-ink-muted);margin-top:var(--space-4);text-align:right;">
          ${checkedCnt} dari ${totalItems} kriteria dipenuhi
        </div>

        <div class="btn-group btn-group--end" style="margin-top:var(--space-3);">
          ${canProceed
            ? '<button type="button" class="btn btn--primary" id="nextFromPR">Lanjut ke Hasil →</button>'
            : `<button type="button" class="btn btn--ghost" disabled>Centang minimal ${Math.ceil(totalItems * 0.6)} kriteria untuk lanjut</button>`}
        </div>
      </div>
    </section>`;

  container.querySelectorAll('#peerChecklist input[type="checkbox"]').forEach(function (cb) {
    cb.addEventListener('change', function () {
      State.peerChecked[cb.value] = cb.checked;
      saveState();
      renderPeerReview(container);
    });
  });

  const nextBtn = document.getElementById('nextFromPR');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      completeStage('peerreview');
      navigateTo('results');
    });
  }
}

/* ============================================================
   12. STAGE: HASIL LATIHAN
   ============================================================ */

function renderResults(container) {
  completeStage('results');

  const sc      = State.score;
  const prDone  = Object.values(State.peerChecked).filter(Boolean).length;
  const refDone = Object.values(State.reflections).filter(function (v) { return v && v.trim().length > 10; }).length;
  const entCount = State.caseEntities.length;
  const tblRows  = State.tableRows.length;

  const classifPct = sc.classifTotal ? Math.round((sc.classifCorrect / sc.classifTotal) * 100) : 0;
  const mappingPct = sc.mappingTotal ? Math.round((sc.mappingCorrect / sc.mappingTotal) * 100) : 0;
  const pkPct      = sc.pkTotal      ? Math.round((sc.pkCorrect      / sc.pkTotal)      * 100) : 0;

  function card(label, score, detail, variant) {
    return `<div class="result-card ${variant || ''}">
      <div class="result-card__label">${esc(label)}</div>
      <div class="result-card__score">${esc(String(score))}</div>
      <div class="result-card__detail">${esc(detail)}</div>
    </div>`;
  }

  container.innerHTML = `
    <section aria-label="Hasil Latihan">
      <div class="stage-head">
        <span class="stage-head__kicker">TAHAP 9 — HASIL LATIHAN</span>
        <p class="stage-head__goal">Ringkasan aktivitas yang sudah kamu selesaikan dalam latihan ini.</p>
      </div>

      <div class="disclaimer-box">
        <strong>Penting:</strong> Hasil di bawah ini adalah ringkasan latihan mandiri, <strong>bukan nilai akhir</strong>. 
        Nilai akhir ditentukan oleh guru berdasarkan rubrik asesmen, kualitas diskusi kelompok, peer-review nyata, 
        dan unjuk kerja secara menyeluruh.
      </div>

      <div class="results-grid">
        ${card('Klasifikasi Entitas/Atribut', sc.classifCorrect + '/' + sc.classifTotal, classifPct + '% benar', classifPct === 100 ? 'result-card--success' : classifPct >= 70 ? '' : 'result-card--warning')}
        ${card('Peta Atribut', sc.mappingCorrect + '/' + sc.mappingTotal, mappingPct + '% benar', mappingPct === 100 ? 'result-card--success' : mappingPct >= 70 ? '' : 'result-card--warning')}
        ${card('Primary Key Challenge', sc.pkCorrect + '/' + sc.pkTotal, pkPct + '% benar', pkPct === 100 ? 'result-card--success' : pkPct >= 50 ? '' : 'result-card--warning')}
        ${card('Kolom Diuji (Keunikan)', Object.keys(State.testedColumns).length + '/' + DATA.uniqueness.columns.length, 'kolom diuji', '')}
        ${card('Entitas Studi Kasus', entCount + '', 'entitas diidentifikasi', entCount >= 3 ? 'result-card--success' : '')}
        ${card('Baris Tabel Pemetaan', tblRows + '', 'baris terisi', tblRows >= 3 ? 'result-card--success' : '')}
        ${card('Peer Review', prDone + '/' + DATA.peerReview.items.length, 'kriteria dipenuhi', '')}
        ${card('Refleksi', refDone + '/' + DATA.reflection.questions.length, 'pertanyaan dijawab', refDone === DATA.reflection.questions.length ? 'result-card--success' : '')}
      </div>

      ${(sc.classifTotal && classifPct < 80) || (sc.mappingTotal && mappingPct < 80) || (sc.pkTotal && pkPct < 50) ? `
      <div class="panel panel--warning" style="margin-bottom:var(--space-4);">
        <h3 style="margin-bottom:var(--space-2);">Konsep yang perlu dipelajari kembali:</h3>
        <ul style="margin:0;">
          ${classifPct < 80 && sc.classifTotal ? '<li>Perbedaan antara entitas dan atribut</li>' : ''}
          ${mappingPct < 80 && sc.mappingTotal ? '<li>Menghubungkan atribut dengan entitas yang tepat</li>' : ''}
          ${pkPct < 50 && sc.pkTotal ? '<li>Kriteria pemilihan primary key (unik, stabil, tidak null)</li>' : ''}
        </ul>
        <p style="margin:var(--space-3) 0 0;font-size:0.88rem;">Kamu bisa kembali ke tahap tersebut dan mencoba lagi.</p>
      </div>` : ''}

      <div class="btn-group btn-group--end">
        <button type="button" class="btn btn--primary" id="nextFromResults">Lanjut ke Refleksi →</button>
      </div>
    </section>`;

  document.getElementById('nextFromResults').addEventListener('click', function () {
    navigateTo('reflection');
  });
}

/* ============================================================
   13. STAGE: REFLEKSI
   ============================================================ */

function renderReflection(container) {
  const questions = DATA.reflection.questions;

  const qHTML = questions.map(function (q) {
    return `<div class="panel" style="margin-bottom:var(--space-4);">
      <h3>${esc(q.question)}</h3>
      <p style="font-size:0.82rem;color:var(--color-ink-muted);">${esc(q.guidance)}</p>
      <textarea class="input-textarea" id="reflTa-${esc(q.id)}" placeholder="${esc(q.placeholder)}" rows="5">${esc(State.reflections[q.id] || '')}</textarea>
    </div>`;
  }).join('');

  const allFilled = questions.every(function (q) {
    return State.reflections[q.id] && State.reflections[q.id].trim().length > 5;
  });

  container.innerHTML = `
    <section aria-label="Refleksi Pembelajaran">
      <div class="stage-head">
        <span class="stage-head__kicker">TAHAP 10 — REFLEKSI</span>
        <p class="stage-head__goal">Tujuan: Mengidentifikasi pemahaman dan kesulitan dalam proses belajar.</p>
      </div>

      <div class="panel panel--info" style="margin-bottom:var(--space-4);">
        <p style="margin:0;font-size:0.9rem;">
          Jawab pertanyaan berikut dengan jujur berdasarkan pengalamanmu selama latihan. 
          <strong>Tidak ada jawaban benar atau salah</strong> — refleksi ini membantumu dan gurumu memahami bagian mana yang masih perlu dibahas lebih lanjut di kelas.
        </p>
      </div>

      ${qHTML}

      <div class="btn-group btn-group--spread">
        <button type="button" class="btn btn--ghost" id="saveReflBtn">Simpan Jawaban</button>
        <button type="button" class="btn btn--primary" id="nextFromRefl" ${allFilled ? '' : 'disabled'}>
          ${allFilled ? 'Lanjut ke Kesimpulan →' : 'Isi semua pertanyaan untuk lanjut'}
        </button>
      </div>
    </section>`;

  questions.forEach(function (q) {
    const ta = document.getElementById('reflTa-' + q.id);
    if (ta) {
      ta.addEventListener('input', function () {
        State.reflections[q.id] = ta.value;
        saveState();
        /* Enable/disable next button dynamically */
        const ok = questions.every(function (qq) {
          return State.reflections[qq.id] && State.reflections[qq.id].trim().length > 5;
        });
        const btn = document.getElementById('nextFromRefl');
        if (btn) {
          btn.disabled = !ok;
          btn.textContent = ok ? 'Lanjut ke Kesimpulan →' : 'Isi semua pertanyaan untuk lanjut';
        }
      });
    }
  });

  document.getElementById('saveReflBtn').addEventListener('click', function () {
    questions.forEach(function (q) {
      const ta = document.getElementById('reflTa-' + q.id);
      if (ta) State.reflections[q.id] = ta.value;
    });
    saveState();
    showNotice('Jawaban refleksi tersimpan.');
  });

  const nextBtn = document.getElementById('nextFromRefl');
  if (nextBtn) {
    nextBtn.addEventListener('click', function () {
      questions.forEach(function (q) {
        const ta = document.getElementById('reflTa-' + q.id);
        if (ta) State.reflections[q.id] = ta.value;
      });
      saveState();
      completeStage('reflection');
      navigateTo('done');
    });
  }
}

/* ============================================================
   14. STAGE: SELESAI
   ============================================================ */

function renderDone(container) {
  completeStage('done');

  const conceptsHTML = DATA.summaryConcepts.map(function (c) {
    return `<div class="concept-card">
      <span class="concept-card__icon">${c.icon}</span>
      <div class="concept-card__term">${esc(c.term)}</div>
      <p class="concept-card__def">${esc(c.definition)}</p>
      <div class="concept-card__example">${esc(c.example)}</div>
    </div>`;
  }).join('');

  container.innerHTML = `
    <section aria-label="Selesai">
      <div class="stage-head">
        <span class="stage-head__kicker">TAHAP 11 — SELESAI</span>
        <p class="stage-head__goal">Ringkasan konsep dan rekomendasi tindak lanjut.</p>
      </div>

      <div class="panel panel--hero" style="text-align:center;padding:var(--space-7) var(--space-6);">
        <div style="font-size:3rem;margin-bottom:var(--space-3);">🎓</div>
        <h2>Latihan Selesai!</h2>
        <p style="font-size:1.05rem;color:var(--color-ink-muted);">
          Kamu telah menyelesaikan semua tahap latihan analisis entitas, atribut, dan primary key.
        </p>
      </div>

      <div class="panel">
        <h3>Ringkasan Konsep Utama</h3>
        <p style="font-size:0.88rem;color:var(--color-ink-muted);margin-bottom:var(--space-4);">
          Pastikan kamu memahami konsep-konsep berikut sebelum melanjutkan ke topik berikutnya.
        </p>
        <div class="concept-cards">
          ${conceptsHTML}
        </div>
      </div>

      <div class="panel panel--accent">
        <h3>Rekomendasi Tindak Lanjut</h3>
        <ul>
          <li><strong>Diskusikan</strong> hasil analisis studi kasusmu dengan guru dan teman kelompok.</li>
          <li><strong>Lakukan peer-review nyata</strong> dengan menukar hasil analisis antarkelompok di kelas.</li>
          <li><strong>Tanyakan</strong> kepada guru jika ada bagian yang masih membingungkan.</li>
          <li><strong>Coba kembali</strong> tahap yang belum mencapai skor penuh dengan klik nama tahap di navigasi atas.</li>
          <li>Ingat: pemilihan PK bergantung pada <strong>sifat data nyata dan kebutuhan sistem</strong> — tidak ada aturan mutlak tanpa konteks.</li>
        </ul>
      </div>

      <div class="btn-group" style="justify-content:center;">
        <button type="button" class="btn btn--ghost" id="reviewBtn">Lihat Hasil Latihan</button>
        <button type="button" class="btn btn--primary" id="restartBtn">Mulai dari Awal</button>
      </div>
    </section>`;

  document.getElementById('reviewBtn').addEventListener('click', function () {
    navigateTo('results');
  });

  document.getElementById('restartBtn').addEventListener('click', function () {
    if (!confirmAction('Mulai dari awal? Semua progress latihan akan dihapus.')) return;
    clearState();
    saveState();
    updateStageNav();
    navigateTo('orientasi');
  });
}

/* ============================================================
   15. HELPER & UTILITAS
   ============================================================ */

function esc(str) {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
}

let noticeTimer = null;
function showNotice(msg) {
  const el = document.getElementById('appNotice');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('is-visible');
  if (noticeTimer) clearTimeout(noticeTimer);
  noticeTimer = setTimeout(function () {
    el.classList.remove('is-visible');
  }, 3200);
}

function confirmAction(msg) {
  return window.confirm(msg);
}

/* ============================================================
   16. INIT
   ============================================================ */

function buildStageNav() {
  const nav = document.getElementById('stageNavList');
  if (!nav) return;
  nav.innerHTML = STAGES.map(function (sid, i) {
    return `<li><button type="button" class="stage-nav__item" data-stage="${sid}">
      <span class="stage-nav__num">${i + 1}</span>
      <span class="stage-nav__label">${STAGE_LABELS[i]}</span>
    </button></li>`;
  }).join('');

  nav.querySelectorAll('.stage-nav__item').forEach(function (btn) {
    btn.addEventListener('click', function () {
      navigateTo(btn.dataset.stage);
    });
  });
}

function init() {
  buildStageNav();

  /* Load saved state */
  loadState();

  /* Reset button */
  const resetBtn = document.getElementById('resetAppBtn');
  if (resetBtn) {
    resetBtn.addEventListener('click', function () {
      if (!confirmAction('Reset seluruh aplikasi? Semua progress latihan akan dihapus.')) return;
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
