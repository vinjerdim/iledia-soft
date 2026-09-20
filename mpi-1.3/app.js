'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   MPI 1.3: Relationship, Kardinalitas & Foreign Key
   ============================================================
   Bagian:
   1.  Konfigurasi tahap & state awal
   2.  (state, storage, navigasi, progress, dispatcher render: shared/engine.js)
   5.  Stage: Orientasi
   6.  Stage: Eksplorasi
   7.  Stage: Contoh Terbimbing
   8.  Stage: Simulasi Data
   9.  Stage: Latihan Kasus
   10. Stage: Asesmen Formatif
   11. Stage: Review
   12. Stage: Refleksi
   13. Stage: Hasil
   14. Helper: entity card, cardinality selector, fk options
   15. Helper: bridge diagram, feedback
   16. Utilitas umum
   17. Init & event delegation
   ============================================================ */

/* ============================================================
   1. KONFIGURASI TAHAP & STATE AWAL
   ============================================================
   State disimpan, dipulihkan, dan dinavigasi oleh shared/engine.js.
   ============================================================ */

function newCaseState() {
  return {
    cardinality: null,
    fkChoice: null,
    cardinalityCorrect: false,
    fkCorrect: false,
    cardinalityDone: false,
    fkDone: false,
    attempts: 0,
    done: false
  };
}

const lesson = Engine.createLesson({
  storageKey: 'mpi-1-3-v1',
  noticeMs: 3000,
  lockedNotice: function (label) {
    return 'Selesaikan tahap "' + label + '" terlebih dahulu.';
  },
  onResetClick: confirmReset,

  stages: [
    { id: 'orientasi', label: 'Orientasi', render: renderOrientasi },
    { id: 'eksplorasi', label: 'Eksplorasi', render: renderEksplorasi },
    { id: 'contoh', label: 'Contoh Terbimbing', render: renderContoh },
    { id: 'simulasi', label: 'Simulasi Data', render: renderSimulasi },
    { id: 'latihan', label: 'Latihan Kasus', render: renderLatihan },
    { id: 'asesmen', label: 'Asesmen Formatif', render: renderAsesmen },
    { id: 'review', label: 'Review', render: renderReview },
    { id: 'refleksi', label: 'Refleksi', render: renderRefleksi },
    { id: 'hasil', label: 'Hasil', render: renderHasil }
  ],

  createState: function () {
    return {
      currentStage: 'orientasi',
      completedStages: {},

      /* Stage: contoh (sub-steps: 1=kardinalitas, 2=fk, 3=hasil) */
      contoh: {
        step: 1,
        cardinality: null,
        fkChoice: null,
        cardinalityDone: false,
        fkDone: false,
        cardinalityCorrect: false,
        fkCorrect: false
      },

      /* Stage: simulasi (highlighted row index in peminjaman, null=none) */
      simHighlight: null,

      /* Stage: latihan — one entry per case in DATA.cases */
      latihan: {
        currentCaseIdx: 0,
        cases: DATA.cases.map(newCaseState)
      },

      /* Stage: asesmen — one entry per question in DATA.assessment */
      asesmen: {
        currentQIdx: 0,
        questions: DATA.assessment.map(newCaseState)
      },

      /* Stage: refleksi */
      refleksiText: ''
    };
  }
});

const State = lesson.state;
const { saveState, navigateTo, completeStage, renderCurrentStage, resetProgress } = lesson;
const { esc, showNotice } = Engine;

/* ============================================================
   5. STAGE: ORIENTASI
   ============================================================ */

function renderOrientasi(container) {
  container.innerHTML = `
    <section aria-label="Orientasi">
      <div class="stage-head">
        <span class="stage-head__kicker">TAHAP 1 — ORIENTASI</span>
        <p class="stage-head__goal">Tujuan: ${esc(DATA.meta.goal)}</p>
      </div>

      <div class="panel panel--hero">
        <h2>${esc(DATA.meta.title)}</h2>
        <p style="font-size:1.05rem;color:var(--color-ink-muted);margin-bottom:var(--space-5);">
          Mata Pelajaran: <strong>${esc(DATA.meta.subject)}</strong>
        </p>

        <div class="panel panel--info" style="margin-bottom:var(--space-4);">
          <h3>Dalam media ini, kamu akan:</h3>
          <ol class="objectives-list">
            <li><span class="objectives-list__num">1</span>Mengeksplorasi tiga jenis kardinalitas: 1:1, 1:N, dan N:M beserta aturan penempatan foreign key.</li>
            <li><span class="objectives-list__num">2</span>Menganalisis contoh terbimbing relasi Anggota–Buku dan menentukan kardinalitas serta kebutuhan tabel penghubung.</li>
            <li><span class="objectives-list__num">3</span>Melihat simulasi data nyata yang menunjukkan cara FK menghubungkan record antarentitas.</li>
            <li><span class="objectives-list__num">4</span>Mengerjakan latihan tiga studi kasus: Guru–Mata Kuliah, Murid–Kartu Pelajar, dan Murid–Produk.</li>
            <li><span class="objectives-list__num">5</span>Menyelesaikan asesmen formatif dengan kasus baru yang mengukur pemahaman kardinalitas dan FK.</li>
            <li><span class="objectives-list__num">6</span>Merefleksikan aturan penempatan FK dengan bahasamu sendiri.</li>
          </ol>
        </div>

        <div class="panel panel--compact" style="background:var(--color-bg);border-color:var(--color-border-strong);margin-bottom:0;">
          <h3 style="margin-bottom:var(--space-3);">Alur pembelajaran</h3>
          <div class="flow-steps">
            ${['Entitas', 'Relationship', 'Kardinalitas', 'Foreign Key', 'Hubungan PK–FK', 'Uji dengan Data'].map(function (step, i) {
    return `<div class="flow-step"><span class="flow-step__num">${i + 1}</span><span>${esc(step)}</span></div>`;
  }).join('<div style="padding-left:14px;color:var(--color-ink-muted);font-size:1.1rem;">↓</div>')}
          </div>
        </div>
      </div>

      <div class="panel panel--compact">
        <h3>Cara menggunakan media ini</h3>
        <ul style="font-size:0.92rem;">
          <li>Baca konteks dan petunjuk pada setiap tahap sebelum menjawab.</li>
          <li>Pilih jawaban dengan mengklik opsi yang tersedia, lalu tekan tombol <strong>Periksa</strong>.</li>
          <li>Baca feedback dengan saksama — feedback menjelaskan <em>mengapa</em> jawaban benar atau salah.</li>
          <li>Jika salah, kamu bisa memperbaiki jawaban dan mencoba kembali.</li>
          <li>Progress tersimpan otomatis di browser ini.</li>
        </ul>
        <div class="btn-group btn-group--center" style="margin-top:var(--space-5);">
          <button type="button" class="btn btn--primary btn--large" data-action="startLearning">
            Mulai Belajar →
          </button>
        </div>
      </div>
    </section>`;
}

/* ============================================================
   6. STAGE: EKSPLORASI
   ============================================================ */

function renderEksplorasi(container) {
  const cards = DATA.cardinalityTypes.map(function (ct) {
    const isNM = ct.id === 'N-M';
    return `
      <div class="cardinality-card">
        <div class="cardinality-card__header">
          <div>
            <div class="cardinality-card__label">${esc(ct.label)}</div>
            <div class="cardinality-card__name">${esc(ct.name)}</div>
          </div>
        </div>
        <div class="cardinality-card__visual">
          <div class="cardinality-card__visual-node">
            <div class="cardinality-card__visual-label">Entitas A</div>
            <div class="cardinality-card__visual-box">${esc(ct.example.entityA)}</div>
          </div>
          <div class="cardinality-card__visual-arrow">
            <div class="cardinality-card__visual-val">${esc(ct.visualA)}</div>
            <div class="cardinality-card__visual-line"></div>
          </div>
          <div style="font-family:var(--font-mono);font-size:0.75rem;color:var(--color-ink-muted);padding:0 4px;">${esc(ct.example.verb)}</div>
          <div class="cardinality-card__visual-arrow">
            <div class="cardinality-card__visual-line"></div>
            <div class="cardinality-card__visual-val">${esc(ct.visualB)}</div>
          </div>
          <div class="cardinality-card__visual-node">
            <div class="cardinality-card__visual-label">Entitas B</div>
            <div class="cardinality-card__visual-box">${isNM ? '<div style="display:flex;flex-direction:column;gap:2px;"><div style="width:40px;height:10px;border:1px solid var(--color-border-strong);border-radius:2px;background:var(--color-bg);"></div><div style="width:40px;height:10px;border:1px solid var(--color-border-strong);border-radius:2px;background:var(--color-bg);"></div><div style="width:40px;height:10px;border:1px solid var(--color-border-strong);border-radius:2px;background:var(--color-bg);"></div></div>' : esc(ct.example.entityB)}</div>
          </div>
        </div>
        <div class="cardinality-card__body">
          <p class="cardinality-card__desc">${ct.description}</p>
          <div class="cardinality-card__example">
            <div class="cardinality-card__example-entities">
              ${esc(ct.example.entityA)} ${esc(ct.example.verb)} ${esc(ct.example.entityB)}
            </div>
            <div class="cardinality-card__example-note">${esc(ct.example.note)}</div>
          </div>
          <div class="cardinality-card__rule">${ct.rule}</div>
        </div>
      </div>`;
  }).join('');

  container.innerHTML = `
    <section aria-label="Eksplorasi Kardinalitas">
      <div class="stage-head">
        <span class="stage-head__kicker">TAHAP 2 — EKSPLORASI</span>
        <p class="stage-head__goal">Pelajari tiga jenis kardinalitas dan aturan penempatan foreign key pada setiap relasi.</p>
      </div>

      <div class="panel panel--accent" style="margin-bottom:var(--space-4);">
        <h2>Tiga Jenis Kardinalitas</h2>
        <p style="color:var(--color-ink-muted);">
          <strong>Kardinalitas</strong> menjelaskan berapa banyak record pada satu entitas yang dapat berhubungan dengan record pada entitas lain.
          Pahami setiap jenis sebelum melanjutkan.
        </p>
      </div>

      <div class="cardinality-explore-grid">
        ${cards}
      </div>

      <div class="panel panel--info">
        <h3>Ringkasan Aturan Foreign Key</h3>
        <ul style="font-size:0.92rem;margin:0;">
          <li><strong>1:1</strong> — FK dapat diletakkan di salah satu entitas; pilih entitas yang lebih dependen.</li>
          <li><strong>1:N</strong> — FK <em>harus</em> di sisi N (entitas yang "banyak"), merujuk PK di sisi 1.</li>
          <li><strong>N:M</strong> — FK tidak bisa di salah satu entitas saja. Butuh <em>tabel/entitas penghubung</em> yang menyimpan FK dari kedua entitas.</li>
        </ul>
      </div>

      <div class="btn-group btn-group--end">
        <button type="button" class="btn btn--primary" data-action="nextStage" data-stage="contoh">
          Lanjut ke Contoh Terbimbing →
        </button>
      </div>
    </section>`;
}

/* ============================================================
   7. STAGE: CONTOH TERBIMBING
   ============================================================ */

function renderContoh(container) {
  const ex = DATA.guidedExample;
  const cs = State.contoh;

  let stepContent = '';

  if (cs.step === 1 || (cs.step >= 2 && !cs.cardinalityDone)) {
    stepContent = renderContohStep1(ex, cs);
  } else if (cs.step === 2 || (cs.step >= 3 && !cs.fkDone)) {
    stepContent = renderContohStep2(ex, cs);
  } else {
    stepContent = renderContohStep3(ex, cs);
  }

  const stepDots = [1, 2, 3].map(function (n) {
    let cls = 'step-dot';
    if (cs.step > n || (n === 1 && cs.cardinalityDone) || (n === 2 && cs.fkDone)) cls += ' is-done';
    else if (cs.step === n) cls += ' is-active';
    return '<span class="' + cls + '" aria-hidden="true"></span>';
  }).join('');

  const stepTexts = ['Tentukan Kardinalitas', 'Tentukan Lokasi FK', 'Lihat Hasil'];

  container.innerHTML = `
    <section aria-label="Contoh Terbimbing">
      <div class="stage-head">
        <span class="stage-head__kicker">TAHAP 3 — CONTOH TERBIMBING</span>
        <p class="stage-head__goal">Analisis relasi Anggota–Buku. Tentukan kardinalitas dan lokasi foreign key secara bertahap.</p>
      </div>

      <div class="step-indicator" aria-label="Langkah pembelajaran">
        ${stepDots}
        <span class="step-label">${esc(stepTexts[cs.step - 1])}</span>
      </div>

      <div class="panel panel--compact" style="margin-bottom:var(--space-4);background:var(--color-bg);">
        <strong>Konteks:</strong> ${ex.context}
      </div>

      ${stepContent}
    </section>`;
}

function renderContohStep1(ex, cs) {
  const entityACard = buildEntityCard(ex.entityA);
  const entityBCard = buildEntityCard(ex.entityB);

  let feedbackHtml = '';
  if (cs.cardinalityDone) {
    if (cs.cardinalityCorrect) {
      feedbackHtml = buildFeedbackBox('success', '✓ Tepat!', ex.cardinalityFeedback.correct);
    } else {
      const wrongKey = cs.cardinality;
      const msg = ex.cardinalityFeedback.wrong[wrongKey] || 'Jawaban kurang tepat. Coba lagi.';
      feedbackHtml = buildFeedbackBox('error', '✗ Kurang tepat', msg);
    }
  }

  const disabled = cs.cardinalityDone && cs.cardinalityCorrect ? 'disabled' : '';

  return `
    <div class="panel">
      <h3>Langkah 1: Tentukan Kardinalitas</h3>
      <p style="color:var(--color-ink-muted);font-size:0.92rem;">
        Perhatikan dua entitas di bawah. Hubungan apa yang terjadi antara <strong>Anggota</strong> dan <strong>Buku</strong>?
        Seberapa banyak record satu entitas bisa berhubungan dengan record entitas lain?
      </p>

      <div class="entity-cards-row entity-cards-row--center" style="margin-bottom:var(--space-4);">
        ${entityACard}
        <div class="relationship-connector">
          <div class="rel-badge">${esc(ex.relationship)}</div>
          <div class="rel-cardinality-line">
            <span class="rel-card-val rel-card-val--a">?</span>
            <span class="rel-line"></span>
            <span class="rel-card-val rel-card-val--b">?</span>
          </div>
        </div>
        ${entityBCard}
      </div>

      <details class="hint-reveal">
        <summary>💡 Petunjuk</summary>
        <div class="hint-reveal__content">${ex.cardinalityHint}</div>
      </details>

      <div style="margin-top:var(--space-4);">
        <p style="font-weight:600;margin-bottom:var(--space-2);">Pilih kardinalitas yang tepat:</p>
        <div class="cardinality-selector" role="radiogroup" aria-label="Pilihan kardinalitas" id="contohCardinalityGroup">
          ${DATA.cardinalityTypes.map(function (ct) {
    const checked = cs.cardinality === ct.id ? 'checked' : '';
    const isChosen = cs.cardinalityDone && cs.cardinality === ct.id;
    const optCls = isChosen ? (cs.cardinalityCorrect ? 'is-correct' : 'is-incorrect') : '';
    return `<div class="cardinality-option ${optCls}">
              <input type="radio" name="contohCardinality" id="cc_${ct.id}" value="${ct.id}" ${checked} ${cs.cardinalityDone && cs.cardinalityCorrect ? 'disabled' : ''}>
              <label class="cardinality-option__label" for="cc_${ct.id}">
                <span class="cardinality-option__val">${esc(ct.label)}</span>
                <span class="cardinality-option__name">${esc(ct.name)}</span>
              </label>
            </div>`;
  }).join('')}
        </div>
        ${feedbackHtml}
      </div>

      <div class="btn-group">
        ${!cs.cardinalityDone || !cs.cardinalityCorrect
      ? `<button type="button" class="btn btn--primary" data-action="checkContohCardinality">Periksa Jawaban</button>`
      : `<button type="button" class="btn btn--primary" data-action="contohNextStep">Lanjut ke Langkah 2 →</button>`
    }
      </div>
    </div>`;
}

function renderContohStep2(ex, cs) {
  const entityACard = buildEntityCard(ex.entityA);
  const entityBCard = buildEntityCard(ex.entityB);

  let feedbackHtml = '';
  if (cs.fkDone) {
    if (cs.fkCorrect) {
      feedbackHtml = buildFeedbackBox('success', '✓ Tepat!', ex.fkFeedback.correct);
    } else {
      const msg = ex.fkFeedback.wrong[cs.fkChoice] || 'Jawaban kurang tepat. Coba lagi.';
      feedbackHtml = buildFeedbackBox('error', '✗ Kurang tepat', msg);
    }
  }

  return `
    <div class="panel">
      <h3>Langkah 2: Tentukan Lokasi Foreign Key</h3>
      <p style="color:var(--color-ink-muted);font-size:0.92rem;">
        Kamu sudah menentukan kardinalitas: <strong>N : M</strong>. Sekarang tentukan bagaimana foreign key direpresentasikan pada relasi ini.
      </p>

      <div class="entity-cards-row entity-cards-row--center" style="margin-bottom:var(--space-4);">
        ${entityACard}
        <div class="relationship-connector">
          <div class="rel-badge">${esc(ex.relationship)}</div>
          <div class="rel-cardinality-line">
            <span class="rel-card-val rel-card-val--a">N</span>
            <span class="rel-line"></span>
            <span class="rel-card-val rel-card-val--b">M</span>
          </div>
        </div>
        ${entityBCard}
      </div>

      <details class="hint-reveal">
        <summary>💡 Petunjuk</summary>
        <div class="hint-reveal__content">${ex.fkHint}</div>
      </details>

      <div style="margin-top:var(--space-4);">
        <p style="font-weight:600;margin-bottom:var(--space-2);">Pilih cara merepresentasikan foreign key untuk relasi N:M ini:</p>
        <div class="fk-options" role="radiogroup" aria-label="Pilihan lokasi FK" id="contohFKGroup">
          ${ex.fkOptions.map(function (opt) {
    const checked = cs.fkChoice === opt.id ? 'checked' : '';
    const isChosen = cs.fkDone && cs.fkChoice === opt.id;
    const optCls = isChosen ? (cs.fkCorrect ? 'is-correct' : 'is-incorrect') : '';
    return `<div class="fk-option ${optCls}">
              <input type="radio" name="contohFK" id="cfk_${opt.id}" value="${opt.id}" ${checked} ${cs.fkDone && cs.fkCorrect ? 'disabled' : ''}>
              <label class="fk-option__label" for="cfk_${opt.id}">
                <span class="fk-option__title">${esc(opt.label)}</span>
                <span class="fk-option__desc">${esc(opt.desc)}</span>
              </label>
            </div>`;
  }).join('')}
        </div>
        ${feedbackHtml}
      </div>

      <div class="btn-group">
        ${!cs.fkDone || !cs.fkCorrect
      ? `<button type="button" class="btn btn--primary" data-action="checkContohFK">Periksa Jawaban</button>`
      : `<button type="button" class="btn btn--primary" data-action="contohNextStep">Lihat Hasil →</button>`
    }
      </div>
    </div>`;
}

function renderContohStep3(ex, cs) {
  const bridge = ex.bridgeEntity;
  const bridgeDiagram = buildBridgeDiagram(ex.entityA, bridge, ex.entityB);

  return `
    <div class="panel">
      <h3>Langkah 3: Visualisasi PK–FK</h3>
      <div class="feedback-box feedback-box--success" style="margin-bottom:var(--space-4);">
        <span class="feedback-box__icon">✓</span>
        <div class="feedback-box__body">
          <strong>Analisis lengkap!</strong> Relasi N:M Anggota–Buku memerlukan tabel penghubung <strong>${esc(bridge.name)}</strong>.
          Perhatikan bagaimana foreign key di tabel penghubung merujuk ke primary key masing-masing entitas.
        </div>
      </div>

      ${bridgeDiagram}

      <div class="panel panel--info" style="margin-top:var(--space-4);">
        <h4>Kesimpulan</h4>
        <ul style="font-size:0.92rem;margin:0;">
          <li>Tabel <strong>${esc(bridge.name)}</strong> menyimpan dua FK: <code>${esc(bridge.fkA.attr)}</code> dan <code>${esc(bridge.fkB.attr)}</code>.</li>
          <li><code>${esc(bridge.fkA.attr)}</code> merujuk PK <code>${esc(bridge.fkA.refsPK)}</code> di entitas <strong>${esc(bridge.fkA.refsEntity)}</strong>.</li>
          <li><code>${esc(bridge.fkB.attr)}</code> merujuk PK <code>${esc(bridge.fkB.refsPK)}</code> di entitas <strong>${esc(bridge.fkB.refsEntity)}</strong>.</li>
          <li>Setiap baris di tabel ${esc(bridge.name)} merepresentasikan satu transaksi peminjaman.</li>
        </ul>
      </div>

      <div class="btn-group btn-group--end">
        <button type="button" class="btn btn--primary" data-action="nextStage" data-stage="simulasi">
          Lanjut ke Simulasi Data →
        </button>
      </div>
    </div>`;
}

/* ============================================================
   8. STAGE: SIMULASI DATA
   ============================================================ */

function renderSimulasi(container) {
  const sim = DATA.simulation;
  const hl = State.simHighlight;

  const hlRow = hl !== null ? sim.peminjaman[hl] : null;
  const hlAnggota = hlRow ? hlRow.nomor_anggota : null;
  const hlBuku = hlRow ? hlRow.kode_buku : null;

  function buildAnggotaTable() {
    const rows = sim.anggota.map(function (row) {
      const isMatch = hlAnggota === row.nomor_anggota;
      return `<tr class="${isMatch ? 'is-highlighted' : ''}">
        <td class="${isMatch ? 'is-pk-match' : ''}">${esc(row.nomor_anggota)}</td>
        <td>${esc(row.nama_anggota)}</td>
        <td>${esc(row.kelas)}</td>
      </tr>`;
    }).join('');
    return `<table class="sim-table" aria-label="Tabel Anggota">
      <thead><tr>
        <th class="is-pk">nomor_anggota (PK)</th>
        <th>nama_anggota</th>
        <th>kelas</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
  }

  function buildBukuTable() {
    const rows = sim.buku.map(function (row) {
      const isMatch = hlBuku === row.kode_buku;
      return `<tr class="${isMatch ? 'is-highlighted' : ''}">
        <td class="${isMatch ? 'is-pk-match' : ''}">${esc(row.kode_buku)}</td>
        <td>${esc(row.judul_buku)}</td>
        <td>${esc(row.pengarang)}</td>
      </tr>`;
    }).join('');
    return `<table class="sim-table" aria-label="Tabel Buku">
      <thead><tr>
        <th class="is-pk">kode_buku (PK)</th>
        <th>judul_buku</th>
        <th>pengarang</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
  }

  function buildPeminjamanTable() {
    const rows = sim.peminjaman.map(function (row, idx) {
      const isActive = hl === idx;
      return `<tr class="is-clickable ${isActive ? 'is-highlighted' : ''}" data-action="simHighlight" data-idx="${idx}"
        role="button" tabindex="0" aria-label="Klik untuk menyoroti record terkait">
        <td>${esc(row.nomor_peminjaman)}</td>
        <td class="${isActive ? 'is-fk-match' : ''}">${esc(row.nomor_anggota)}</td>
        <td class="${isActive ? 'is-fk-match' : ''}">${esc(row.kode_buku)}</td>
        <td>${esc(row.tanggal_pinjam)}</td>
        <td>${esc(row.tanggal_kembali)}</td>
      </tr>`;
    }).join('');
    return `<table class="sim-table" aria-label="Tabel Peminjaman (klik baris untuk menyoroti)">
      <thead><tr>
        <th class="is-pk">nomor_peminjaman (PK)</th>
        <th class="is-fk">nomor_anggota (FK)</th>
        <th class="is-fk">kode_buku (FK)</th>
        <th>tanggal_pinjam</th>
        <th>tanggal_kembali</th>
      </tr></thead>
      <tbody>${rows}</tbody>
    </table>`;
  }

  container.innerHTML = `
    <section aria-label="Simulasi Data">
      <div class="stage-head">
        <span class="stage-head__kicker">TAHAP 4 — SIMULASI DATA</span>
        <p class="stage-head__goal">Periksa bagaimana nilai FK di tabel Peminjaman menghubungkan record ke tabel Anggota dan Buku.</p>
      </div>

      <div class="panel panel--accent" style="margin-bottom:var(--space-4);">
        <p style="margin:0;">${sim.description}</p>
        ${hl !== null ? `<p style="margin-top:var(--space-2);color:var(--color-primary-strong);font-size:0.88rem;margin-bottom:0;">
          Menampilkan: Peminjaman <strong>${esc(sim.peminjaman[hl].nomor_peminjaman)}</strong> —
          Anggota <strong>${esc(sim.peminjaman[hl].nomor_anggota)}</strong>,
          Buku <strong>${esc(sim.peminjaman[hl].kode_buku)}</strong>.
          <button type="button" class="btn btn--ghost btn--small" style="margin-left:var(--space-2);" data-action="simClearHighlight">Reset sorotan</button>
        </p>` : ''}
      </div>

      <div class="sim-tables">
        <div>
          <div class="sim-table-label">
            <span class="sim-table-label-dot sim-table-label-dot--blue"></span>
            Anggota
          </div>
          <div class="sim-table-wrap">${buildAnggotaTable()}</div>
        </div>

        <div>
          <div class="sim-table-label">
            <span class="sim-table-label-dot sim-table-label-dot--orange"></span>
            Peminjaman <span style="font-size:0.75rem;font-weight:400;color:var(--color-ink-muted);">(tabel penghubung)</span>
          </div>
          <div class="sim-table-wrap">${buildPeminjamanTable()}</div>
        </div>

        <div>
          <div class="sim-table-label">
            <span class="sim-table-label-dot sim-table-label-dot--green"></span>
            Buku
          </div>
          <div class="sim-table-wrap">${buildBukuTable()}</div>
        </div>
      </div>

      <div class="panel panel--info" style="margin-top:var(--space-4);">
        <h4>Apa yang terlihat dari simulasi?</h4>
        <ul style="font-size:0.92rem;margin:0;">
          <li>Setiap baris di Peminjaman menyimpan dua FK: <strong>nomor_anggota</strong> dan <strong>kode_buku</strong>.</li>
          <li>Nilai FK di kolom <strong style="color:var(--color-warning-strong);">nomor_anggota</strong> harus cocok dengan salah satu <strong style="color:var(--color-success-strong);">PK</strong> di tabel Anggota.</li>
          <li>Nilai FK di kolom <strong style="color:var(--color-warning-strong);">kode_buku</strong> harus cocok dengan salah satu <strong style="color:var(--color-success-strong);">PK</strong> di tabel Buku.</li>
          <li>Tanpa FK, sistem tidak bisa mengetahui anggota mana yang meminjam buku mana.</li>
        </ul>
      </div>

      <div class="btn-group btn-group--end">
        <button type="button" class="btn btn--primary" data-action="nextStage" data-stage="latihan">
          Lanjut ke Latihan Kasus →
        </button>
      </div>
    </section>`;
}

/* ============================================================
   9. STAGE: LATIHAN KASUS
   ============================================================ */

function renderLatihan(container) {
  const idx = State.latihan.currentCaseIdx;
  const caseData = DATA.cases[idx];
  const caseState = State.latihan.cases[idx];
  const allDone = State.latihan.cases.every(function (c) { return c.done; });

  const tabs = DATA.cases.map(function (c, i) {
    const isDone = State.latihan.cases[i].done;
    const isActive = i === idx;
    return `<button type="button" class="case-tab ${isActive ? 'is-active' : ''} ${isDone ? 'is-done' : ''}"
      data-action="latihanTab" data-idx="${i}">
      ${esc(c.title)}: ${esc(c.scenario.length > 30 ? c.scenario.substring(0, 30) + '…' : c.scenario)}
    </button>`;
  }).join('');

  const caseBody = buildCaseExercise(caseData, caseState, 'latihan', idx);

  container.innerHTML = `
    <section aria-label="Latihan Kasus">
      <div class="stage-head">
        <span class="stage-head__kicker">TAHAP 5 — LATIHAN KASUS</span>
        <p class="stage-head__goal">Analisis tiga studi kasus. Tentukan kardinalitas dan lokasi FK untuk setiap relasi.</p>
      </div>

      <div class="case-tabs" role="tablist" aria-label="Daftar kasus latihan">
        ${tabs}
      </div>

      ${caseBody}

      ${allDone ? `<div class="btn-group btn-group--end" style="margin-top:var(--space-4);">
        <button type="button" class="btn btn--primary" data-action="nextStage" data-stage="asesmen">
          Lanjut ke Asesmen Formatif →
        </button>
      </div>` : ''}
    </section>`;
}

/* ============================================================
   10. STAGE: ASESMEN FORMATIF
   ============================================================ */

function renderAsesmen(container) {
  const idx = State.asesmen.currentQIdx;
  const qData = DATA.assessment[idx];
  const qState = State.asesmen.questions[idx];
  const allDone = State.asesmen.questions.every(function (q) { return q.done; });

  const tabs = DATA.assessment.map(function (q, i) {
    const isDone = State.asesmen.questions[i].done;
    const isActive = i === idx;
    return `<button type="button" class="case-tab ${isActive ? 'is-active' : ''} ${isDone ? 'is-done' : ''}"
      data-action="asesmenTab" data-idx="${i}">
      Soal ${i + 1}
    </button>`;
  }).join('');

  const qBody = buildCaseExercise(qData, qState, 'asesmen', idx);

  container.innerHTML = `
    <section aria-label="Asesmen Formatif">
      <div class="stage-head">
        <span class="stage-head__kicker">TAHAP 6 — ASESMEN FORMATIF</span>
        <p class="stage-head__goal">Kerjakan soal berikut secara mandiri. Hasilnya adalah data asesmen formatif, bukan nilai akhir.</p>
      </div>

      <div class="assessment-badge">
        ✎ Asesmen Formatif — Hasil hanya sebagai data evaluasi pembelajaran
      </div>

      <div class="case-tabs" role="tablist" aria-label="Daftar soal asesmen">
        ${tabs}
      </div>

      <div class="panel panel--compact" style="background:var(--color-bg);border-color:var(--color-border-strong);margin-bottom:var(--space-4);">
        <p style="margin:0;font-size:0.9rem;color:var(--color-ink-muted);">
          <strong>Skenario:</strong> ${qData.question}
        </p>
      </div>

      ${qBody}

      ${allDone ? `<div class="btn-group btn-group--end" style="margin-top:var(--space-4);">
        <button type="button" class="btn btn--primary" data-action="nextStage" data-stage="review">
          Lanjut ke Review →
        </button>
      </div>` : ''}
    </section>`;
}

/* ============================================================
   11. STAGE: REVIEW
   ============================================================ */

function renderReview(container) {
  function buildReviewItem(title, caseData, caseState, isAssessment) {
    const cardinalityLabel = DATA.cardinalityLabels[caseState.cardinality] || caseState.cardinality || '—';
    let fkLabel = '—';
    if (caseState.fkChoice === 'bridge') {
      fkLabel = 'Tabel Penghubung';
    } else if (caseState.fkChoice) {
      const ent = caseData.entities.find(function (e) { return e.id === caseState.fkChoice; });
      fkLabel = ent ? ent.name : caseState.fkChoice;
    }
    const isAllCorrect = caseState.cardinalityCorrect && caseState.fkCorrect;
    return `
      <div class="review-item">
        <div class="review-item__header">
          <span class="review-item__title">${esc(title)}: ${esc(stripHtml(caseData.scenario || caseData.question || ''))}</span>
          <span class="review-status ${isAllCorrect ? 'review-status--correct' : 'review-status--incorrect'}">
            ${isAllCorrect ? '✓ Benar' : '✗ Perlu ditinjau'}
          </span>
        </div>
        <div class="review-item__body">
          <div class="review-answer-row">
            <span class="review-answer-row__key">Jawaban kardinalitas:</span>
            <span class="review-answer-row__val">${esc(cardinalityLabel)}</span>
            <span style="margin-left:var(--space-2);font-size:0.85rem;${caseState.cardinalityCorrect ? 'color:var(--color-success)' : 'color:var(--color-error)'}">
              ${caseState.cardinalityCorrect ? '✓' : '✗ (seharusnya: ' + (DATA.cardinalityLabels[caseData.correctCardinality] || caseData.correctCardinality) + ')'}
            </span>
          </div>
          <div class="review-answer-row">
            <span class="review-answer-row__key">Jawaban lokasi FK:</span>
            <span class="review-answer-row__val">${esc(fkLabel)}</span>
            <span style="margin-left:var(--space-2);font-size:0.85rem;${caseState.fkCorrect ? 'color:var(--color-success)' : 'color:var(--color-error)'}">
              ${caseState.fkCorrect ? '✓' : ''}
            </span>
          </div>
          <div class="panel panel--info" style="margin-top:var(--space-3);margin-bottom:0;padding:var(--space-3);">
            <strong>Penjelasan:</strong> ${caseData.explanation || ''}
          </div>
          ${caseData.note ? `<div class="feedback-box feedback-box--warning" style="margin-top:var(--space-2);">
            <span class="feedback-box__icon">ℹ</span>
            <div class="feedback-box__body" style="font-size:0.85rem;">${caseData.note}</div>
          </div>` : ''}
        </div>
      </div>`;
  }

  const latihanItems = DATA.cases.map(function (c, i) {
    return buildReviewItem(c.title, c, State.latihan.cases[i], false);
  }).join('');

  const asesmenItems = DATA.assessment.map(function (q, i) {
    return buildReviewItem('Soal ' + (i + 1), q, State.asesmen.questions[i], true);
  }).join('');

  container.innerHTML = `
    <section aria-label="Review">
      <div class="stage-head">
        <span class="stage-head__kicker">TAHAP 7 — REVIEW</span>
        <p class="stage-head__goal">Tinjau kembali jawaban dan baca penjelasan konsep untuk setiap kasus.</p>
      </div>

      <div class="panel" style="margin-bottom:var(--space-4);">
        <h3>Review Latihan Kasus</h3>
        ${latihanItems}
      </div>

      <div class="panel">
        <h3>Review Asesmen Formatif</h3>
        ${asesmenItems}
      </div>

      <div class="btn-group btn-group--end">
        <button type="button" class="btn btn--primary" data-action="nextStage" data-stage="refleksi">
          Lanjut ke Refleksi →
        </button>
      </div>
    </section>`;
}

/* ============================================================
   12. STAGE: REFLEKSI
   ============================================================ */

function renderRefleksi(container) {
  container.innerHTML = `
    <section aria-label="Refleksi">
      <div class="stage-head">
        <span class="stage-head__kicker">TAHAP 8 — REFLEKSI</span>
        <p class="stage-head__goal">Ungkapkan pemahamanmu tentang aturan penempatan foreign key.</p>
      </div>

      <div class="panel panel--hero">
        <h2>Pertanyaan Refleksi</h2>
        <div class="panel panel--info" style="margin-bottom:var(--space-5);">
          <p style="font-size:1.05rem;margin:0;font-weight:600;">${esc(DATA.reflectionQuestion)}</p>
        </div>

        <div class="field-group">
          <label for="refleksiInput">Jawaban refleksimu:</label>
          <div class="field-hint">Gunakan bahasamu sendiri. Sertakan contoh dari kasus yang sudah kamu kerjakan.</div>
          <textarea
            class="input-textarea"
            id="refleksiInput"
            name="refleksi"
            rows="6"
            placeholder="Tulis jawabanmu di sini…"
            aria-describedby="refleksiError"
          >${esc(State.refleksiText)}</textarea>
          <div class="field-error" id="refleksiError" aria-live="polite"></div>
        </div>

        <div class="feedback-box feedback-box--info">
          <span class="feedback-box__icon">ℹ</span>
          <div class="feedback-box__body">
            Jawaban refleksi ini tidak dinilai secara otomatis. Jawabanmu mencerminkan pemahaman konseptualmu dan dapat kamu tunjukkan kepada gurumu.
          </div>
        </div>

        <div class="btn-group">
          <button type="button" class="btn btn--primary" data-action="submitRefleksi">Simpan & Lanjut</button>
        </div>
      </div>
    </section>`;

  /* Autosave on input */
  const ta = document.getElementById('refleksiInput');
  if (ta) {
    ta.addEventListener('input', function () {
      State.refleksiText = ta.value;
      saveState();
    });
  }
}

/* ============================================================
   13. STAGE: HASIL
   ============================================================ */

function renderHasil(container) {
  const latihanResults = State.latihan.cases.map(function (c) {
    return { cardinalityCorrect: c.cardinalityCorrect, fkCorrect: c.fkCorrect, attempts: c.attempts };
  });
  const asesmenResults = State.asesmen.questions.map(function (q) {
    return { cardinalityCorrect: q.cardinalityCorrect, fkCorrect: q.fkCorrect, attempts: q.attempts };
  });

  const latihanCardOk = latihanResults.filter(function (r) { return r.cardinalityCorrect; }).length;
  const latihanFKOk = latihanResults.filter(function (r) { return r.fkCorrect; }).length;
  const asesmenCardOk = asesmenResults.filter(function (r) { return r.cardinalityCorrect; }).length;
  const asesmenFKOk = asesmenResults.filter(function (r) { return r.fkCorrect; }).length;
  const totalAsesmenOk = asesmenResults.filter(function (r) { return r.cardinalityCorrect && r.fkCorrect; }).length;
  const totalAsesmenQ = DATA.assessment.length;

  const pct = Math.round((totalAsesmenOk / totalAsesmenQ) * 100);

  const areasToReview = [];
  DATA.assessment.forEach(function (q, i) {
    const qs = State.asesmen.questions[i];
    if (!qs.cardinalityCorrect) areasToReview.push('Menentukan kardinalitas ' + DATA.cardinalityLabels[q.correctCardinality]);
    if (!qs.fkCorrect && qs.cardinalityCorrect) areasToReview.push('Menentukan lokasi FK pada relasi ' + DATA.cardinalityLabels[q.correctCardinality]);
  });
  const uniqueAreas = areasToReview.filter(function (v, i, a) { return a.indexOf(v) === i; });

  container.innerHTML = `
    <section aria-label="Hasil">
      <div class="stage-head">
        <span class="stage-head__kicker">TAHAP 9 — HASIL</span>
        <p class="stage-head__goal">Ringkasan hasil asesmen formatif kamu.</p>
      </div>

      <div class="panel panel--hero">
        <h2>Ringkasan Hasil</h2>

        <div class="assessment-badge">✎ Hasil Asesmen Formatif — Bukan Nilai Akhir</div>

        <div class="score-grid">
          <div class="score-card">
            <div class="score-card__num" style="color:${pct >= 70 ? 'var(--color-success-strong)' : 'var(--color-error-strong)'};">${pct}%</div>
            <div class="score-card__label">Skor Asesmen Formatif<br>(${totalAsesmenOk}/${totalAsesmenQ} soal benar)</div>
          </div>
          <div class="score-card">
            <div class="score-card__num">${asesmenCardOk}/${totalAsesmenQ}</div>
            <div class="score-card__label">Kardinalitas benar (asesmen)</div>
          </div>
          <div class="score-card">
            <div class="score-card__num">${asesmenFKOk}/${totalAsesmenQ}</div>
            <div class="score-card__label">Lokasi FK benar (asesmen)</div>
          </div>
          <div class="score-card">
            <div class="score-card__num">${latihanCardOk + latihanFKOk}/${DATA.cases.length * 2}</div>
            <div class="score-card__label">Poin benar (latihan)</div>
          </div>
        </div>

        ${uniqueAreas.length > 0 ? `
        <div class="panel panel--warning" style="margin-bottom:var(--space-4);">
          <h4>Area yang perlu dipelajari kembali:</h4>
          <ul style="font-size:0.9rem;margin:0;">
            ${uniqueAreas.map(function (a) { return '<li>' + esc(a) + '</li>'; }).join('')}
          </ul>
        </div>` : `
        <div class="panel panel--success" style="margin-bottom:var(--space-4);">
          <p style="margin:0;font-weight:600;">Semua soal asesmen dijawab dengan benar. Kerja bagus!</p>
        </div>`}

        <div class="panel panel--info" style="margin-bottom:0;">
          <h4>Catatan penting</h4>
          <ul style="font-size:0.9rem;margin:0;">
            <li>Skor ini adalah <strong>hasil asesmen formatif</strong> dan bukan nilai akhir mata pelajaran.</li>
            <li>Nilai akhir ditentukan gurumu berdasarkan keseluruhan proses pembelajaran, termasuk presentasi, diskusi, dan observasi.</li>
            <li>Kamu dapat menunjukkan ringkasan ini kepada gurumu sebagai bahan evaluasi.</li>
          </ul>
        </div>
      </div>

      ${State.refleksiText.trim() ? `
      <div class="panel">
        <h3>Refleksimu</h3>
        <blockquote style="border-left:3px solid var(--color-primary);margin:0;padding:var(--space-3) var(--space-4);background:var(--color-primary-soft);border-radius:0 var(--radius-sm) var(--radius-sm) 0;font-style:italic;color:var(--color-primary-strong);">
          ${esc(State.refleksiText)}
        </blockquote>
      </div>` : ''}

      <div class="btn-group btn-group--spread">
        <button type="button" class="btn btn--ghost" data-action="reviewFromHasil">Lihat Review Jawaban</button>
        <button type="button" class="btn btn--primary" data-action="resetFromHasil">Mulai Ulang</button>
      </div>
    </section>`;
}

/* ============================================================
   14. HELPER: ENTITY CARD, CARDINALITY SELECTOR, FK OPTIONS
   ============================================================ */

function buildEntityCard(entity, extraAttrs) {
  /* extraAttrs: [{attr, isFk, refsEntity, refsPK}] — FK attributes to highlight or prepend */
  const extras = extraAttrs || [];

  /* FK attrs that are not already in entity.attrs (new FK column added to entity) */
  const addedFKs = extras.filter(function (e) {
    return e.isFk && !entity.attrs.includes(e.attr);
  });

  const attrList = entity.attrs.map(function (a) {
    const extra = extras.find(function (e) { return e.attr === a; });
    const isFk = extra && extra.isFk;
    return `<li class="entity-card__attr-item ${isFk ? 'entity-card__attr-item--fk' : ''}">
      ${isFk ? '<span class="attr-badge attr-badge--fk">FK</span>' : ''}
      <span>${esc(a)}</span>
      ${isFk ? `<span class="attr-badge--fk-ref">→ ${esc(extra.refsEntity)}.${esc(extra.refsPK)}</span>` : ''}
    </li>`;
  }).join('');

  const addedFKList = addedFKs.map(function (e) {
    return `<li class="entity-card__attr-item entity-card__attr-item--fk entity-card__attr-item--highlight">
      <span class="attr-badge attr-badge--fk">FK</span>
      <span>${esc(e.attr)}</span>
      <span class="attr-badge--fk-ref">→ ${esc(e.refsEntity)}.${esc(e.refsPK)}</span>
    </li>`;
  }).join('');

  return `<div class="entity-card entity-card--${esc(entity.color || 'blue')}">
    <div class="entity-card__header">
      <span>▣</span>
      <span>${esc(entity.name)}</span>
    </div>
    <ul class="entity-card__attr-list">
      <li class="entity-card__attr-item entity-card__attr-item--pk">
        <span class="attr-badge attr-badge--pk">PK</span>
        <span>${esc(entity.pk)}</span>
      </li>
      ${addedFKList}
      ${attrList}
    </ul>
  </div>`;
}

function buildBridgeEntityCard(bridge) {
  const fkItems = [
    `<li class="entity-card__attr-item entity-card__attr-item--fk">
      <span class="attr-badge attr-badge--fk">FK</span>
      <span>${esc(bridge.fkA.attr)}</span>
      <span class="attr-badge--fk-ref">→ ${esc(bridge.fkA.refsEntity)}.${esc(bridge.fkA.refsPK || bridge.fkA.attr)}</span>
    </li>`,
    `<li class="entity-card__attr-item entity-card__attr-item--fk">
      <span class="attr-badge attr-badge--fk">FK</span>
      <span>${esc(bridge.fkB.attr)}</span>
      <span class="attr-badge--fk-ref">→ ${esc(bridge.fkB.refsEntity)}.${esc(bridge.fkB.refsPK || bridge.fkB.attr)}</span>
    </li>`
  ].join('');
  const attrList = (bridge.attrs || []).map(function (a) {
    return `<li class="entity-card__attr-item"><span>${esc(a)}</span></li>`;
  }).join('');
  return `<div class="entity-card entity-card--${esc(bridge.color || 'orange')}">
    <div class="entity-card__header"><span>▣</span><span>${esc(bridge.name)}</span></div>
    <ul class="entity-card__attr-list">
      <li class="entity-card__attr-item entity-card__attr-item--pk">
        <span class="attr-badge attr-badge--pk">PK</span>
        <span>${esc(bridge.pk)}</span>
      </li>
      ${fkItems}
      ${attrList}
    </ul>
  </div>`;
}

function buildBridgeDiagram(entityA, bridge, entityB) {
  return `<div class="bridge-diagram">
    ${buildEntityCard(entityA)}
    <div class="bridge-connector">
      <div class="bridge-connector__arrow">
        <div class="bridge-connector__line"></div>
        <span style="font-size:1.2rem;color:var(--color-warning);">↔</span>
      </div>
      <div class="bridge-connector__label">FK: ${esc(bridge.fkA.attr)}</div>
    </div>
    ${buildBridgeEntityCard(bridge)}
    <div class="bridge-connector">
      <div class="bridge-connector__arrow">
        <span style="font-size:1.2rem;color:var(--color-warning);">↔</span>
        <div class="bridge-connector__line"></div>
      </div>
      <div class="bridge-connector__label">FK: ${esc(bridge.fkB.attr)}</div>
    </div>
    ${buildEntityCard(entityB)}
  </div>`;
}

function buildCardinalitySelector(groupName, selectedValue, disabled, prefix) {
  return `<div class="cardinality-selector" role="radiogroup" aria-label="Pilihan kardinalitas">
    ${DATA.cardinalityTypes.map(function (ct) {
    const id = prefix + '_' + ct.id;
    const checked = selectedValue === ct.id ? 'checked' : '';
    const dis = disabled ? 'disabled' : '';
    return `<div class="cardinality-option">
        <input type="radio" name="${groupName}" id="${id}" value="${ct.id}" ${checked} ${dis}>
        <label class="cardinality-option__label" for="${id}">
          <span class="cardinality-option__val">${esc(ct.label)}</span>
          <span class="cardinality-option__name">${esc(ct.name)}</span>
        </label>
      </div>`;
  }).join('')}
  </div>`;
}

function buildFKOptions(entities, groupName, selectedValue, disabled, prefix, includesBridge) {
  const options = entities.map(function (e) {
    return { id: e.id, title: 'FK di ' + e.name, desc: 'Tambahkan kolom FK di entitas ' + e.name };
  });
  if (includesBridge) {
    options.push({ id: 'bridge', title: 'Butuh Tabel Penghubung', desc: 'Buat entitas/tabel baru yang menghubungkan keduanya' });
  }
  return `<div class="fk-options" role="radiogroup" aria-label="Pilihan lokasi FK">
    ${options.map(function (opt) {
    const id = prefix + '_fk_' + opt.id;
    const checked = selectedValue === opt.id ? 'checked' : '';
    const dis = disabled ? 'disabled' : '';
    return `<div class="fk-option">
        <input type="radio" name="${groupName}" id="${id}" value="${opt.id}" ${checked} ${dis}>
        <label class="fk-option__label" for="${id}">
          <span class="fk-option__title">${esc(opt.title)}</span>
          <span class="fk-option__desc">${esc(opt.desc)}</span>
        </label>
      </div>`;
  }).join('')}
  </div>`;
}

/* ============================================================
   15. HELPER: CASE EXERCISE (shared by latihan & asesmen)
   ============================================================ */

function buildCaseExercise(caseData, caseState, mode, idx) {
  /* Scenario label */
  const scenarioText = mode === 'latihan'
    ? `<div class="panel panel--compact" style="background:var(--color-bg);border-color:var(--color-border-strong);margin-bottom:var(--space-4);">
        <p style="font-weight:600;font-size:0.92rem;margin-bottom:var(--space-1);">${esc(caseData.title || ('Soal ' + (idx + 1)))}: ${esc(caseData.scenario || '')}</p>
        <p style="color:var(--color-ink-muted);font-size:0.88rem;margin:0;">${esc(caseData.description || '')}</p>
       </div>`
    : '';

  const prefix = mode + '_' + idx;
  const isNM = caseData.correctCardinality === 'N-M';
  const groupCard = prefix + '_card';
  const groupFK = prefix + '_fk';

  /* Entity cards */
  const entityACard = buildEntityCard(caseData.entities[0]);
  const entityBCard = buildEntityCard(caseData.entities[1]);

  /* Step 1: Cardinality */
  const cardDone = caseState.cardinalityDone;
  const cardCorrect = caseState.cardinalityCorrect;

  let cardFeedback = '';
  if (cardDone) {
    if (cardCorrect) {
      cardFeedback = buildFeedbackBox('success', '✓ Tepat!', 'Kardinalitas ' + DATA.cardinalityLabels[caseData.correctCardinality] + ' benar.');
    } else {
      const wrongMsg = (caseData.cardinalityFeedback && caseData.cardinalityFeedback[caseState.cardinality])
        || 'Jawaban kurang tepat. Coba pertimbangkan kembali berapa banyak record yang bisa berhubungan di setiap sisi.';
      cardFeedback = buildFeedbackBox('error', '✗ Kurang tepat', wrongMsg);
    }
  }

  const cardSelector = buildCardinalitySelector(groupCard, caseState.cardinality, cardDone && cardCorrect, prefix);

  /* Step 2: FK Placement (only shown after cardinality is correct) */
  let fkSection = '';
  if (cardCorrect) {
    const fkDone = caseState.fkDone;
    const fkCorrect = caseState.fkCorrect;

    let fkFeedback = '';
    if (fkDone) {
      if (fkCorrect) {
        fkFeedback = buildFeedbackBox('success', '✓ Tepat!', caseData.explanation || 'Lokasi FK benar.');
      } else {
        let wrongFKMsg = '';
        if (caseState.fkChoice === 'bridge' && !isNM) {
          wrongFKMsg = 'Tabel penghubung hanya diperlukan pada relasi N:M. Pada relasi ini, cukup tempatkan FK di entitas yang tepat.';
        } else if (caseData.fkFeedback) {
          wrongFKMsg = caseData.fkFeedback[caseState.fkChoice] || caseData.fkFeedback.wrong || 'Jawaban kurang tepat. Perhatikan aturan penempatan FK sesuai kardinalitas.';
        } else {
          wrongFKMsg = 'Jawaban kurang tepat. Perhatikan aturan penempatan FK sesuai kardinalitas.';
        }
        fkFeedback = buildFeedbackBox('error', '✗ Kurang tepat', wrongFKMsg);
      }
    }

    const fkOptions = buildFKOptions(caseData.entities, groupFK, caseState.fkChoice, fkDone && fkCorrect, prefix, isNM);

    /* Bridge diagram (shown when N:M and FK correct) */
    let bridgeResult = '';
    if (fkDone && fkCorrect && isNM && caseData.bridgeEntity) {
      bridgeResult = `<div style="margin-top:var(--space-4);">
        <h4 style="margin-bottom:var(--space-3);">Tabel penghubung yang dibutuhkan:</h4>
        ${buildBridgeDiagram(caseData.entities[0], caseData.bridgeEntity, caseData.entities[1])}
      </div>`;
    }

    /* 1:N result card (only for single-FK cases where one entity is clearly correct) */
    let fkResultCard = '';
    if (fkDone && fkCorrect && !isNM && !caseData.acceptBothFKEntities) {
      const fkEntity = caseData.entities.find(function (e) { return e.id === caseData.correctFKEntity; });
      const refEntity = caseData.entities.find(function (e) { return e.id !== caseData.correctFKEntity; });
      if (fkEntity && refEntity) {
        const extraAttrs = [{ attr: caseData.fkAttr, isFk: true, refsEntity: caseData.fkRefsEntity, refsPK: caseData.fkRefsPK }];
        fkResultCard = `<div style="margin-top:var(--space-4);">
          <h4 style="margin-bottom:var(--space-3);">Visualisasi PK–FK:</h4>
          <div class="entity-cards-row entity-cards-row--center">
            ${buildEntityCard(caseData.entities[0])}
            <div class="relationship-connector">
              <div class="rel-badge">${esc(caseData.relationship)}</div>
              <div class="rel-cardinality-line">
                <span class="rel-card-val rel-card-val--a">${caseData.correctCardinality.split('-')[0]}</span>
                <span class="rel-line"></span>
                <span class="rel-card-val rel-card-val--b">${caseData.correctCardinality.split('-')[1]}</span>
              </div>
            </div>
            ${buildEntityCard(fkEntity, extraAttrs)}
          </div>
        </div>`;
      }
    }

    fkSection = `
      <div style="margin-top:var(--space-4);border-top:1px solid var(--color-border);padding-top:var(--space-4);">
        <p style="font-weight:600;margin-bottom:var(--space-2);">2. Di mana foreign key diletakkan?</p>
        <p style="color:var(--color-ink-muted);font-size:0.88rem;margin-bottom:var(--space-3);">
          Kardinalitas relasi ini adalah <strong>${DATA.cardinalityLabels[caseData.correctCardinality]}</strong>.
          ${isNM ? 'Pada relasi N:M, perlu dipertimbangkan apakah cukup dengan satu FK atau butuh tabel penghubung.' : 'Pilih entitas yang seharusnya menyimpan foreign key.'}
        </p>
        ${fkOptions}
        ${fkFeedback}
        ${bridgeResult}
        ${fkResultCard}
        <div class="btn-group">
          ${!fkDone || !fkCorrect
        ? `<button type="button" class="btn btn--primary" data-action="checkFK" data-mode="${mode}" data-idx="${idx}">Periksa FK</button>`
        : `<span class="feedback-box feedback-box--success" style="margin-top:0;display:inline-flex;">✓ Kasus selesai!</span>`
      }
          ${fkDone && !fkCorrect
        ? `<button type="button" class="btn btn--ghost" data-action="retryFK" data-mode="${mode}" data-idx="${idx}">Coba Lagi</button>`
        : ''
      }
        </div>
      </div>`;
  }

  return `<div class="panel">
    ${scenarioText}
    <div class="entity-cards-row entity-cards-row--center" style="margin-bottom:var(--space-4);">
      ${entityACard}
      <div class="relationship-connector">
        <div class="rel-badge">${esc(caseData.relationship)}</div>
        <div class="rel-cardinality-line">
          <span class="rel-card-val rel-card-val--a">?</span>
          <span class="rel-line"></span>
          <span class="rel-card-val rel-card-val--b">?</span>
        </div>
      </div>
      ${entityBCard}
    </div>

    <p style="font-weight:600;margin-bottom:var(--space-2);">1. Tentukan kardinalitas relasi ini:</p>
    ${cardSelector}
    ${cardFeedback}
    <div class="btn-group">
      ${!cardDone || !cardCorrect
      ? `<button type="button" class="btn btn--primary" data-action="checkCardinality" data-mode="${mode}" data-idx="${idx}">Periksa Kardinalitas</button>`
      : ''
    }
      ${cardDone && !cardCorrect
      ? `<button type="button" class="btn btn--ghost" data-action="retryCardinality" data-mode="${mode}" data-idx="${idx}">Coba Lagi</button>`
      : ''
    }
    </div>
    ${fkSection}
  </div>`;
}

function buildFeedbackBox(type, title, body) {
  const iconMap = { success: '✓', error: '✗', warning: '⚠', info: 'ℹ' };
  return `<div class="feedback-box feedback-box--${type}" role="alert">
    <span class="feedback-box__icon">${iconMap[type] || 'ℹ'}</span>
    <div class="feedback-box__body"><strong>${esc(title)}.</strong> ${body}</div>
  </div>`;
}

/* ============================================================
   16. UTILITAS UMUM
   ============================================================ */

function stripHtml(str) {
  if (!str) return '';
  return String(str).replace(/<[^>]*>/g, '');
}

function confirmReset() {
  const backdrop = document.createElement('div');
  backdrop.className = 'modal-backdrop';
  backdrop.id = 'resetModal';
  backdrop.setAttribute('role', 'dialog');
  backdrop.setAttribute('aria-modal', 'true');
  backdrop.setAttribute('aria-label', 'Konfirmasi reset');
  backdrop.innerHTML = `
    <div class="modal">
      <h3>Reset Semua Progress?</h3>
      <p>Semua jawaban, progress, dan refleksi akan dihapus dan kamu akan kembali ke awal. Tindakan ini tidak dapat dibatalkan.</p>
      <div class="btn-group btn-group--end">
        <button type="button" class="btn btn--ghost" id="cancelResetBtn">Batal</button>
        <button type="button" class="btn btn--danger" id="confirmResetBtn">Ya, Reset</button>
      </div>
    </div>`;
  document.body.appendChild(backdrop);
  document.getElementById('confirmResetBtn').focus();

  function close() { backdrop.remove(); }
  document.getElementById('cancelResetBtn').addEventListener('click', close);
  document.getElementById('confirmResetBtn').addEventListener('click', function () {
    close();
    resetProgress();
    showNotice('Progress direset. Mulai dari awal.');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  });
  backdrop.addEventListener('click', function (e) {
    if (e.target === backdrop) close();
  });
  backdrop.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') close();
  });
}

/* ============================================================
   17. INIT & EVENT DELEGATION
   ============================================================ */

function handleAction(actionName, el) {
  switch (actionName) {

    case 'startLearning': {
      completeStage('orientasi');
      navigateTo('eksplorasi');
      break;
    }

    case 'nextStage': {
      const targetStage = el.dataset.stage;
      completeStage(State.currentStage);
      navigateTo(targetStage);
      break;
    }

    case 'latihanTab': {
      const tabIdx = parseInt(el.dataset.idx, 10);
      State.latihan.currentCaseIdx = tabIdx;
      saveState();
      renderCurrentStage();
      break;
    }

    case 'asesmenTab': {
      const tabIdx = parseInt(el.dataset.idx, 10);
      State.asesmen.currentQIdx = tabIdx;
      saveState();
      renderCurrentStage();
      break;
    }

    case 'checkContohCardinality': {
      const selected = document.querySelector('input[name="contohCardinality"]:checked');
      if (!selected) {
        showNotice('Pilih kardinalitas terlebih dahulu.');
        return;
      }
      State.contoh.cardinality = selected.value;
      State.contoh.cardinalityDone = true;
      State.contoh.cardinalityCorrect = selected.value === DATA.guidedExample.correctCardinality;
      State.contoh.attempts = (State.contoh.attempts || 0) + 1;
      saveState();
      renderCurrentStage();
      break;
    }

    case 'contohNextStep': {
      State.contoh.step = Math.min(State.contoh.step + 1, 3);
      saveState();
      renderCurrentStage();
      break;
    }

    case 'checkContohFK': {
      const selected = document.querySelector('input[name="contohFK"]:checked');
      if (!selected) {
        showNotice('Pilih opsi lokasi FK terlebih dahulu.');
        return;
      }
      State.contoh.fkChoice = selected.value;
      State.contoh.fkDone = true;
      State.contoh.fkCorrect = selected.value === DATA.guidedExample.correctFKPlacement;
      saveState();
      renderCurrentStage();
      break;
    }

    case 'checkCardinality': {
      const mode = el.dataset.mode;
      const idx = parseInt(el.dataset.idx, 10);
      const caseData = mode === 'latihan' ? DATA.cases[idx] : DATA.assessment[idx];
      const caseState = mode === 'latihan' ? State.latihan.cases[idx] : State.asesmen.questions[idx];

      const groupName = mode + '_' + idx + '_card';
      const selected = document.querySelector('input[name="' + groupName + '"]:checked');
      if (!selected) {
        showNotice('Pilih kardinalitas terlebih dahulu.');
        return;
      }
      caseState.cardinality = selected.value;
      caseState.cardinalityDone = true;
      caseState.cardinalityCorrect = selected.value === caseData.correctCardinality;
      caseState.attempts = (caseState.attempts || 0) + 1;
      saveState();
      renderCurrentStage();
      break;
    }

    case 'retryCardinality': {
      const mode = el.dataset.mode;
      const idx = parseInt(el.dataset.idx, 10);
      const caseState = mode === 'latihan' ? State.latihan.cases[idx] : State.asesmen.questions[idx];
      caseState.cardinalityDone = false;
      caseState.cardinality = null;
      saveState();
      renderCurrentStage();
      break;
    }

    case 'checkFK': {
      const mode = el.dataset.mode;
      const idx = parseInt(el.dataset.idx, 10);
      const caseData = mode === 'latihan' ? DATA.cases[idx] : DATA.assessment[idx];
      const caseState = mode === 'latihan' ? State.latihan.cases[idx] : State.asesmen.questions[idx];

      const groupName = mode + '_' + idx + '_fk';
      const selected = document.querySelector('input[name="' + groupName + '"]:checked');
      if (!selected) {
        showNotice('Pilih opsi FK terlebih dahulu.');
        return;
      }
      caseState.fkChoice = selected.value;
      caseState.fkDone = true;

      let correct = false;
      if (caseData.acceptBothFKEntities && caseData.entities.some(function (e) { return e.id === selected.value; })) {
        correct = true;
      } else {
        correct = selected.value === caseData.correctFKEntity;
      }
      caseState.fkCorrect = correct;
      if (correct) {
        caseState.done = true;
        /* Auto-advance to next incomplete case/question */
        if (mode === 'latihan') {
          const nextIdx = State.latihan.cases.findIndex(function (c, i) { return i > idx && !c.done; });
          if (nextIdx !== -1) {
            setTimeout(function () {
              State.latihan.currentCaseIdx = nextIdx;
              saveState();
              renderCurrentStage();
            }, 800);
          }
        } else {
          const nextIdx = State.asesmen.questions.findIndex(function (q, i) { return i > idx && !q.done; });
          if (nextIdx !== -1) {
            setTimeout(function () {
              State.asesmen.currentQIdx = nextIdx;
              saveState();
              renderCurrentStage();
            }, 800);
          }
        }
      }
      saveState();
      renderCurrentStage();
      break;
    }

    case 'retryFK': {
      const mode = el.dataset.mode;
      const idx = parseInt(el.dataset.idx, 10);
      const caseState = mode === 'latihan' ? State.latihan.cases[idx] : State.asesmen.questions[idx];
      caseState.fkDone = false;
      caseState.fkChoice = null;
      saveState();
      renderCurrentStage();
      break;
    }

    case 'simHighlight': {
      const rowIdx = parseInt(el.dataset.idx, 10);
      State.simHighlight = (State.simHighlight === rowIdx) ? null : rowIdx;
      saveState();
      renderCurrentStage();
      break;
    }

    case 'simClearHighlight': {
      State.simHighlight = null;
      saveState();
      renderCurrentStage();
      break;
    }

    case 'submitRefleksi': {
      const ta = document.getElementById('refleksiInput');
      const err = document.getElementById('refleksiError');
      const text = ta ? ta.value.trim() : '';
      if (!text) {
        if (err) err.textContent = 'Tulis jawaban refleksimu sebelum melanjutkan.';
        if (ta) ta.classList.add('has-error');
        return;
      }
      if (err) err.textContent = '';
      if (ta) ta.classList.remove('has-error');
      State.refleksiText = text;
      completeStage('refleksi');
      navigateTo('hasil');
      break;
    }

    case 'reviewFromHasil': {
      navigateTo('review');
      break;
    }

    case 'resetFromHasil': {
      confirmReset();
      break;
    }
  }
}

document.addEventListener('DOMContentLoaded', function () {
  /* Load saved state, build nav, wire nav + reset button, first render */
  lesson.init();

  /* Main event delegation */
  document.getElementById('stageContainer').addEventListener('click', function (e) {
    /* Simulation table row keyboard/click */
    const tr = e.target.closest('tr[data-action="simHighlight"]');
    if (tr) {
      handleAction('simHighlight', tr);
      return;
    }
    const btn = e.target.closest('[data-action]');
    if (btn) handleAction(btn.dataset.action, btn);
  });

  /* Keyboard Enter/Space for simulation table rows */
  document.getElementById('stageContainer').addEventListener('keydown', function (e) {
    if (e.key === 'Enter' || e.key === ' ') {
      const tr = e.target.closest('tr[data-action="simHighlight"]');
      if (tr) {
        e.preventDefault();
        handleAction('simHighlight', tr);
      }
    }
  });
});
