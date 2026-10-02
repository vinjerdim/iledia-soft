'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Rekayasa Perangkat Lunak: Menganalisis Kebutuhan Data untuk
   Mengidentifikasi Entitas & Atribut Basis Data
   Fase F — SMK Rekayasa Perangkat Lunak, Discovery Learning

   Utilitas & komponen bersama berada di shared/engine.js:
     • mesin tahap & store (createStageMachine, createStore);
     • komponen penemuan (ensureShuffledOrder, buildDiscoveryHead,
       buildTeacherNote, buildChoiceGroup, buildTpPanel,
       buildGuidedQuizList, ensureSortStates, buildSortItems,
       ensureTapOrderState, buildTapOrder, ensureMultiState,
       buildMultiSelect, buildLikertGroup);
     • seksi 12 — analisis kebutuhan data (buildDokumenKebutuhan,
       cakupanKebutuhan, nilaiPemilahan, buildEntityCard).

   Alur tahap mengikuti sintaks Discovery Learning; lihat komentar
   kepala data.js untuk pemetaan dan rangkaian aktivitasnya.

   Seluruh pilihan jawaban DIACAK. Pengacakan dilakukan SEKALI di
   initOrders() lalu urutannya disimpan di State — bukan saat
   render — sehingga pilihan tidak melompat-lompat ketika tahap
   dirender ulang, tetapi teracak ulang setiap Reset.

   Bagian:
    1. Konstanta
    2. State & Storage
    3. Pengacakan (initOrders)
    4. Navigasi & render ulang
    5. Utilitas render
    6. Stage: Orientasi
    7. Stage: Stimulasi              (DL sintaks 1)
    8. Stage: Rumusan Masalah        (DL sintaks 2)
    9. Stage: Gali Kebutuhan         (DL sintaks 3)
   10. Stage: Contoh & Bukan Contoh  (DL sintaks 3)
   11. Stage: Rancang Entitas        (DL sintaks 4)
   12. Stage: Uji Rancangan          (DL sintaks 5)
   13. Stage: Kesimpulan             (DL sintaks 6)
   14. Stage: Uji Terap
   15. Stage: Refleksi
   16. Stage: Selesai (skor)
   17. Router render & Init
   ============================================================ */

/* ============================================================
   1. KONSTANTA
   ============================================================ */

var D = DATA;
var STAGES = D.tahap.map(function (t) {
  return t.id;
});
var STAGE_LABELS = D.tahap.map(function (t) {
  return t.label;
});
var STORAGE_KEY = 'mpi-f-1-1-entitas-dl-v1';

/* Semua pertanyaan penuntun, untuk pengacakan opsi & skor. */
var GUIDED = {
  masalah: D.masalah.pertanyaan,
  contoh: D.contoh.pertanyaan,
  kunci: D.olah.kunci,
  simpulan: D.simpulan.pertanyaan,
  terapKunci: [D.terapkan.kunci],
};

/* Daftar pemilahan: key State → { items, options }. */
var SORTS = {
  frasa: { items: D.kumpulData.frasa, options: D.kumpulData.kategori },
  atribut: { items: D.olah.atribut, options: D.olah.entitas },
  kasus: { items: D.pembuktian.kasus, options: D.pembuktian.kategori },
  terapAtribut: { items: D.terapkan.atribut, options: D.terapkan.entitas },
};

/* ============================================================
   2. STATE & STORAGE
   ============================================================ */

var State = {
  currentStage: 'orientasi',
  completedStages: {},

  /* Orientasi — apersepsi (tidak dinilai) */
  apersepsiOrder: null,
  apersepsi: null,

  /* Multi-pilih: stimulasi (kejanggalan), kandidat (uji terap) */
  multi: {},

  /* Pertanyaan penuntun: urutan opsi, jawaban, hasil percobaan pertama */
  qOrders: {},
  pilih: {},
  firstTry: {},

  /* Pemilahan: state per butir & urutan butir */
  sorts: {},
  sortOrders: {},

  /* Kesimpulan — urut-ketuk langkah analisis */
  langkahUrut: null,

  /* Refleksi */
  likert: {},
  refleksiTeks: '',
};

var store = createStore({ key: STORAGE_KEY, state: State });

/* ============================================================
   3. PENGACAKAN (sekali, saat State disiapkan)
   ============================================================ */

function initOrders() {
  ['multi', 'qOrders', 'pilih', 'firstTry', 'sorts', 'sortOrders', 'likert'].forEach(function (k) {
    if (!State[k] || typeof State[k] !== 'object') State[k] = {};
  });

  ensureShuffledOrder(State, 'apersepsiOrder', D.orientasi.apersepsi.opsi);
  ensureMultiState(State.multi, 'stimulasi', D.stimulasi.kejanggalan.opsi);
  ensureMultiState(State.multi, 'kandidat', D.terapkan.kandidat.opsi);

  Object.keys(GUIDED).forEach(function (k) {
    GUIDED[k].forEach(function (q) {
      ensureShuffledOrder(State.qOrders, q.id, q.opsi);
    });
  });

  Object.keys(SORTS).forEach(function (k) {
    var tmp = { s: State.sorts[k], o: State.sortOrders[k] };
    ensureSortStates(tmp, 's', 'o', SORTS[k].items, SORTS[k].options);
    State.sorts[k] = tmp.s;
    State.sortOrders[k] = tmp.o;
  });

  ensureTapOrderState(State, 'langkahUrut', D.simpulan.langkah, D.simpulan.urutan);
}

/* ============================================================
   4. NAVIGASI & RENDER ULANG
   ============================================================ */

var machine = createStageMachine({
  stages: STAGES,
  stageLabels: STAGE_LABELS,
  state: State,
  save: store.save,
  render: function () {
    renderCurrentStage();
  },
});

function container() {
  return document.getElementById('stageContainer');
}

/*
 * Render ulang tahap aktif sambil menjaga fokus keyboard: elemen yang
 * sedang fokus dikenali dari id atau atribut data-*-nya, lalu elemen
 * padanannya difokuskan kembali setelah render.
 */
function focusKey(el) {
  if (!el || el === document.body) return null;
  if (el.id) return '#' + el.id;
  var attrs = ['data-opt-id', 'data-q-opt', 'data-sort-opt', 'data-multi-opt', 'data-tap-add'];
  for (var i = 0; i < attrs.length; i++) {
    var v = el.getAttribute(attrs[i]);
    if (v !== null) {
      var group = el.getAttribute('data-group');
      return (
        '[' +
        attrs[i] +
        '="' +
        v +
        '"]' +
        (group ? '[data-group="' + group + '"]' : '') +
        (el.dataset.multiId ? '[data-multi-id="' + el.dataset.multiId + '"]' : '')
      );
    }
  }
  return null;
}

function rerender() {
  var key = focusKey(document.activeElement);
  renderCurrentStage();
  if (!key) return;
  var el = container().querySelector(key);
  if (el && !el.disabled) el.focus({ preventScroll: true });
}

function nextStageOf(id) {
  return STAGES[STAGES.indexOf(id) + 1];
}

function goNext(id) {
  machine.completeStage(id);
  var next = nextStageOf(id);
  if (next) machine.navigateTo(next);
}

/* ============================================================
   5. UTILITAS RENDER
   ============================================================ */

function sintaksOf(id) {
  for (var i = 0; i < D.tahap.length; i++) {
    if (D.tahap[i].id === id) return D.tahap[i].sintaks;
  }
  return '';
}

function head(id) {
  var d = D[id];
  return buildDiscoveryHead(d.kicker, d.title, d.goal, 'Discovery Learning · ' + sintaksOf(id));
}

/* Tombol lanjut ke tahap berikutnya. */
function nextButton(id) {
  var next = nextStageOf(id);
  var label = next ? 'Lanjut: ' + STAGE_LABELS[STAGES.indexOf(next)] + ' →' : 'Selesai';
  return buildDlNextButton('nextBtn', label, true);
}

function bindNextButton(root, id) {
  var btn = root.querySelector('#nextBtn');
  if (btn) {
    btn.addEventListener('click', function () {
      goNext(id);
    });
  }
}

function guidedList(key) {
  return buildGuidedQuizList(GUIDED[key], State.qOrders, State.pilih);
}

function bindGuided(root, key) {
  bindGuidedQuizList(root, GUIDED[key], State.pilih, store.save, rerender, function (q, benar) {
    State.firstTry[q.id] = benar;
  });
}

function guidedDone(key) {
  return guidedQuizAllCorrect(GUIDED[key], State.pilih);
}

function sortList(key, opts) {
  return buildSortItems(
    SORTS[key].items,
    State.sortOrders[key],
    SORTS[key].options,
    State.sorts[key],
    opts
  );
}

function bindSort(root, key) {
  bindSortItems(root, SORTS[key].items, State.sorts[key], store.save, rerender);
}

function sortDone(key) {
  return sortItemsAllAnswered(SORTS[key].items, State.sorts[key]);
}

function sortCounter(key) {
  var items = SORTS[key].items;
  var n = items.filter(function (it) {
    return State.sorts[key][it.id].chosen;
  }).length;
  return (
    '<p class="sort-counter" aria-live="polite"><strong>' +
    n +
    '</strong> dari ' +
    items.length +
    ' sudah dipilah</p>'
  );
}

/*
 * Kartu-kartu entitas. Atribut yang ditampilkan: semua (opts.semua)
 * atau hanya yang sudah dipilah murid (sudah diberi umpan balik,
 * sehingga entitas pemiliknya sudah diketahui). 🔑 muncul setelah
 * pertanyaan kuncinya dijawab tepat (atau selalu bila opts.semua).
 */
function entityCards(entitas, atribut, sortKey, kunciQ, opts) {
  opts = opts || {};
  return (
    '<div class="entity-grid">' +
    entitas
      .map(function (ent) {
        var attrs = atribut.filter(function (a) {
          if (a.correct !== ent.id) return false;
          return opts.semua || !!State.sorts[sortKey][a.id].chosen;
        });
        var q = kunciQ.filter(function (k) {
          return k.entitas === ent.id;
        })[0];
        var kunciTerjawab = q && State.pilih[q.id] === q.correct;
        return buildEntityCard(ent, attrs, {
          kunci: opts.semua || kunciTerjawab ? ent.kunci : null,
          kosong: 'Belum ada atribut.',
        });
      })
      .join('') +
    '</div>'
  );
}

function listHtml(items, cls) {
  return (
    '<ul class="' +
    (cls || 'bullet-list') +
    '">' +
    items
      .map(function (t) {
        return '<li>' + t + '</li>';
      })
      .join('') +
    '</ul>'
  );
}

/* ============================================================
   6. STAGE: ORIENTASI
   ============================================================ */

function renderOrientasi(root) {
  var d = D.orientasi;
  var ap = d.apersepsi;
  root.innerHTML =
    head('orientasi') +
    buildTeacherNote(d.guru) +
    buildTpPanel(d) +
    buildDlPanel('<p style="margin:0;">' + d.pengantar + '</p>') +
    buildDlPanel(
      '<h3>🗺️ Alur belajar</h3>' +
        '<ol class="flow-list">' +
        d.alur
          .map(function (a) {
            return (
              '<li class="flow-list__item"><span class="flow-list__title">' +
              esc(a.judul) +
              '</span><span class="flow-list__desc">' +
              esc(a.desk) +
              '</span></li>'
            );
          })
          .join('') +
        '</ol>' +
        '<h3>🧭 Cara memakai</h3>' +
        listHtml(d.caraPakai)
    ) +
    buildDlPanel(
      '<h3>💬 Pemanasan</h3>' +
        '<p>' +
        ap.tanya +
        '</p>' +
        buildChoiceGroup(ap.opsi, State.apersepsiOrder, {
          chosen: State.apersepsi,
          grade: false,
          attr: 'data-ap',
        }) +
        (State.apersepsi ? buildFeedbackBox('info', '💭', ap.umpan) : '')
    ) +
    (State.apersepsi ? nextButton('orientasi') : '');

  root.querySelectorAll('[data-ap]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.apersepsi = btn.getAttribute('data-ap');
      store.save();
      rerender();
    });
  });
  bindNextButton(root, 'orientasi');
}

/* ============================================================
   7. STAGE: STIMULASI
   ============================================================ */

function renderStimulasi(root) {
  var d = D.stimulasi;
  var st = State.multi.stimulasi;
  var t = d.tabel;
  var tabel =
    '<div class="mini-table-wrap" tabindex="0" role="region" aria-label="' +
    esc(t.judul) +
    '">' +
    '<table class="mini-table flat-table">' +
    '<caption>' +
    esc(t.judul) +
    '</caption>' +
    '<thead><tr><th scope="col">#</th>' +
    t.kolom
      .map(function (k) {
        return '<th scope="col">' + esc(k) + '</th>';
      })
      .join('') +
    '</tr></thead><tbody>' +
    t.baris
      .map(function (b, i) {
        return (
          '<tr><th scope="row">' +
          (i + 1) +
          '</th>' +
          b
            .map(function (c) {
              return '<td>' + esc(c) + '</td>';
            })
            .join('') +
          '</tr>'
        );
      })
      .join('') +
    '</tbody></table></div>';

  root.innerHTML =
    head('stimulasi') +
    buildTeacherNote(d.guru) +
    buildDlPanel(
      '<p>' +
        d.cerita +
        '</p>' +
        '<blockquote class="quote-box">' +
        esc(d.keluhan) +
        '</blockquote>'
    ) +
    buildDlPanel(tabel) +
    buildDlPanel(
      '<h3>🔍 Temukan kejanggalannya</h3>' +
        '<p>' +
        d.kejanggalan.tanya +
        '</p>' +
        buildMultiSelect('kejanggalan', d.kejanggalan.opsi, st, { done: d.kejanggalan.done })
    ) +
    (st.done
      ? buildDlPanel('<h3>🤔 Pertanyaan pemantik</h3><p>' + d.pemantik + '</p>', 'panel--info')
      : '') +
    (st.done ? nextButton('stimulasi') : '');

  bindMultiSelect(root, 'kejanggalan', d.kejanggalan.opsi, st, store.save, rerender);
  bindNextButton(root, 'stimulasi');
}

/* ============================================================
   8. STAGE: RUMUSAN MASALAH
   ============================================================ */

function renderMasalah(root) {
  var d = D.masalah;
  var done = guidedDone('masalah');
  root.innerHTML =
    head('masalah') +
    buildTeacherNote(d.guru) +
    buildDlPanel('<p style="margin:0;">' + d.pengantar + '</p>') +
    buildDlPanel(guidedList('masalah')) +
    (done ? nextButton('masalah') : '');
  bindGuided(root, 'masalah');
  bindNextButton(root, 'masalah');
}

/* ============================================================
   9. STAGE: GALI KEBUTUHAN (pengumpulan data 1)
   ============================================================ */

function nomorFrasa() {
  var nomor = {};
  var n = 0;
  D.kumpulData.dokumen.forEach(function (dok) {
    daftarFrasa(dok.teks).forEach(function (f) {
      nomor[f.id] = ++n;
    });
  });
  return nomor;
}

function renderKumpulData(root) {
  var d = D.kumpulData;
  var nomor = nomorFrasa();
  var done = sortDone('frasa');
  root.innerHTML =
    head('kumpulData') +
    buildTeacherNote(d.guru) +
    buildDlPanel('<p style="margin:0;">' + d.pengantar + '</p>') +
    '<div class="req-doc-grid">' +
    d.dokumen
      .map(function (dok) {
        return buildDokumenKebutuhan(dok, nomor);
      })
      .join('') +
    '</div>' +
    buildDlPanel(
      '<h3>🗂️ Pilah setiap frasa</h3>' +
        sortCounter('frasa') +
        sortList('frasa', {
          prefix: function (it) {
            return '<span class="req-mark__num req-mark__num--inline">' + nomor[it.id] + '</span>';
          },
        })
    ) +
    (done
      ? buildDlPanel(
          '<h3>💡 Temuan</h3><p style="margin:0;">' + d.temuan + '</p>',
          'panel--success'
        )
      : '') +
    (done ? nextButton('kumpulData') : '');
  bindSort(root, 'frasa');
  bindNextButton(root, 'kumpulData');
}

/* ============================================================
   10. STAGE: CONTOH & BUKAN CONTOH (pengumpulan data 2)
   ============================================================ */

function kartuKolom(jenis, judul) {
  return (
    '<div class="compare-col compare-col--' +
    jenis +
    '">' +
    '<h3 class="compare-col__title">' +
    judul +
    '</h3>' +
    D.contoh.kartu
      .filter(function (k) {
        return k.jenis === jenis;
      })
      .map(function (k) {
        return (
          '<div class="compare-card"><strong>' +
          esc(k.judul) +
          '</strong><p>' +
          esc(k.isi) +
          '</p></div>'
        );
      })
      .join('') +
    '</div>'
  );
}

function renderContoh(root) {
  var d = D.contoh;
  var done = guidedDone('contoh');
  root.innerHTML =
    head('contoh') +
    buildTeacherNote(d.guru) +
    buildDlPanel('<p style="margin:0;">' + d.pengantar + '</p>') +
    '<div class="compare-grid">' +
    kartuKolom('contoh', '✅ Entitas') +
    kartuKolom('bukan', '❌ Bukan entitas') +
    '</div>' +
    buildDlPanel('<h3>🧭 Pertanyaan penuntun</h3>' + guidedList('contoh')) +
    (done ? nextButton('contoh') : '');
  bindGuided(root, 'contoh');
  bindNextButton(root, 'contoh');
}

/* ============================================================
   11. STAGE: RANCANG ENTITAS (pengolahan data)
   ============================================================ */

function renderOlah(root) {
  var d = D.olah;
  var atributDone = sortDone('atribut');
  var done = atributDone && guidedDone('kunci');
  root.innerHTML =
    head('olah') +
    buildTeacherNote(d.guru) +
    buildDlPanel('<p style="margin:0;">' + d.pengantar + '</p>') +
    buildDlPanel(
      '<h3>🧩 Rancanganmu</h3>' + entityCards(d.entitas, d.atribut, 'atribut', d.kunci)
    ) +
    buildDlPanel(
      '<h3>① Kelompokkan atribut ke entitasnya</h3>' +
        sortCounter('atribut') +
        sortList('atribut', { mono: true })
    ) +
    (atributDone
      ? buildDlPanel('<h3>② Tentukan atribut kunci 🔑</h3>' + guidedList('kunci'))
      : '') +
    (done ? nextButton('olah') : '');
  bindSort(root, 'atribut');
  if (atributDone) bindGuided(root, 'kunci');
  bindNextButton(root, 'olah');
}

/* ============================================================
   12. STAGE: UJI RANCANGAN (pembuktian)
   ============================================================ */

function atributRancangan() {
  return D.olah.atribut.map(function (a) {
    return a.id;
  });
}

/* Rincian atribut yang dibutuhkan sebuah kebutuhan — tampil setelah
   murid menjawab, dihitung dengan cakupanKebutuhan (engine). */
function rincianKebutuhan(k) {
  if (!State.sorts.kasus[k.id].chosen) return '';
  var c = cakupanKebutuhan(atributRancangan(), k);
  return (
    '<p class="need-attrs"><span class="need-attrs__label">Atribut yang dibutuhkan:</span> ' +
    k.perlu
      .map(function (id) {
        var ada = c.kurang.indexOf(id) === -1;
        return (
          '<code class="need-attr need-attr--' +
          (ada ? 'ada' : 'kurang') +
          '">' +
          (ada ? '✓ ' : '➕ ') +
          esc(id) +
          '</code>'
        );
      })
      .join(' ') +
    '</p>'
  );
}

function renderPembuktian(root) {
  var d = D.pembuktian;
  var done = sortDone('kasus');
  root.innerHTML =
    head('pembuktian') +
    buildTeacherNote(d.guru) +
    buildDlPanel(
      '<h3>🧩 Rancangan KopSis</h3>' +
        entityCards(D.olah.entitas, D.olah.atribut, 'atribut', D.olah.kunci, { semua: true })
    ) +
    buildDlPanel(
      '<p>' +
        d.pengantar +
        '</p>' +
        sortCounter('kasus') +
        sortList('kasus', { visual: rincianKebutuhan })
    ) +
    (done
      ? buildDlPanel(
          '<h3>✅ Hasil pembuktian</h3><p style="margin:0;">' + d.kesimpulan + '</p>',
          'panel--success'
        )
      : '') +
    (done ? nextButton('pembuktian') : '');
  bindSort(root, 'kasus');
  bindNextButton(root, 'pembuktian');
}

/* ============================================================
   13. STAGE: KESIMPULAN (generalisasi)
   ============================================================ */

function renderSimpulan(root) {
  var d = D.simpulan;
  var urut = State.langkahUrut;
  var done = urut.correct && guidedDone('simpulan');
  root.innerHTML =
    head('simpulan') +
    buildTeacherNote(d.guru) +
    buildDlPanel(
      '<h3>① Susun langkah kerja analis</h3><p>' +
        d.pengantar +
        '</p>' +
        buildTapOrder('langkah', d.langkah, urut, {
          answer: d.urutan,
          startLabel: 'Langkah pertama',
          endLabel: 'Langkah terakhir',
          successText:
            '<strong>Urutannya tepat!</strong> Inilah langkah yang kamu kerjakan dari tahap 4 sampai 7.',
          wrongText:
            'Kartu bertanda merah belum tepat. Ingat lagi: apa yang kamu kerjakan lebih dulu di tahap Gali Kebutuhan, Rancang Entitas, lalu Uji Rancangan?',
        })
    ) +
    (urut.correct ? buildDlPanel('<h3>② Lengkapi kesimpulan</h3>' + guidedList('simpulan')) : '') +
    (done ? buildDlPanel('<h3>📌 Rangkuman</h3>' + listHtml(d.rangkuman), 'panel--success') : '') +
    (done ? nextButton('simpulan') : '');
  bindTapOrder(root, 'langkah', urut, d.urutan, store.save, rerender);
  if (urut.correct) bindGuided(root, 'simpulan');
  bindNextButton(root, 'simpulan');
}

/* ============================================================
   14. STAGE: UJI TERAP
   ============================================================ */

function renderTerapkan(root) {
  var d = D.terapkan;
  var st = State.multi.kandidat;
  var atributDone = st.done && sortDone('terapAtribut');
  var done = atributDone && guidedDone('terapKunci');
  root.innerHTML =
    head('terapkan') +
    buildTeacherNote(d.guru) +
    buildDlPanel(
      '<h3>🎙️ ' +
        esc(d.kasus.judul) +
        '</h3><blockquote class="quote-box">' +
        esc(d.kasus.teks) +
        '</blockquote>'
    ) +
    buildDlPanel(
      '<p>' +
        d.kandidat.tanya +
        '</p>' +
        buildMultiSelect('kandidat', d.kandidat.opsi, st, { done: d.kandidat.done })
    ) +
    (st.done
      ? buildDlPanel(
          '<h3>Langkah 2 — Kelompokkan atribut ke entitasnya</h3>' +
            entityCards(d.entitas, d.atribut, 'terapAtribut', [d.kunci]) +
            sortCounter('terapAtribut') +
            sortList('terapAtribut', { mono: true })
        )
      : '') +
    (atributDone ? buildDlPanel(guidedList('terapKunci')) : '') +
    (done ? nextButton('terapkan') : '');
  bindMultiSelect(root, 'kandidat', d.kandidat.opsi, st, store.save, rerender);
  if (st.done) bindSort(root, 'terapAtribut');
  if (atributDone) bindGuided(root, 'terapKunci');
  bindNextButton(root, 'terapkan');
}

/* ============================================================
   15. STAGE: REFLEKSI
   ============================================================ */

function renderRefleksi(root) {
  var d = D.refleksi;
  var done = d.pernyataan.every(function (p) {
    return typeof State.likert[p.id] === 'number';
  });
  root.innerHTML =
    head('refleksi') +
    buildTeacherNote(d.guru) +
    buildDlPanel(buildLikertGroup('refleksi', d.pernyataan, d.skala, State.likert, false)) +
    buildDlPanel(
      '<label class="input-label" for="refleksiTeks">' +
        esc(d.tanyaTerbuka) +
        '</label>' +
        '<textarea class="input-textarea" id="refleksiTeks" rows="4">' +
        esc(State.refleksiTeks) +
        '</textarea>'
    ) +
    (done
      ? nextButton('refleksi')
      : '<p class="muted-note">Isi semua skala untuk melanjutkan.</p>');

  bindLikertGroup(root, 'refleksi', State.likert, store.save, rerender);
  var ta = root.querySelector('#refleksiTeks');
  ta.addEventListener('input', function () {
    State.refleksiTeks = ta.value;
    store.save();
  });
  bindNextButton(root, 'refleksi');
}

/* ============================================================
   16. STAGE: SELESAI (skor)
   ============================================================ */

function firstTryCount(list) {
  return list.filter(function (q) {
    return State.firstTry[q.id] === true;
  }).length;
}

function multiScore(key) {
  return { benar: State.multi[key].firstTry === true ? 1 : 0, total: 1 };
}

function sum(parts) {
  return parts.reduce(
    function (acc, p) {
      return { benar: acc.benar + p.benar, total: acc.total + p.total };
    },
    { benar: 0, total: 0 }
  );
}

function guidedScore(key) {
  return { benar: firstTryCount(GUIDED[key]), total: GUIDED[key].length };
}

function sortScore(key) {
  return nilaiPemilahan(SORTS[key].items, State.sorts[key]);
}

function hitungSkor() {
  return [
    { label: 'Stimulasi — kejanggalan (tepat sekali coba)', skor: multiScore('stimulasi') },
    { label: 'Rumusan masalah', skor: guidedScore('masalah') },
    { label: 'Gali kebutuhan — pemilahan frasa', skor: sortScore('frasa') },
    { label: 'Contoh & bukan contoh', skor: guidedScore('contoh') },
    {
      label: 'Rancang entitas — atribut & kunci',
      skor: sum([sortScore('atribut'), guidedScore('kunci')]),
    },
    { label: 'Uji rancangan', skor: sortScore('kasus') },
    {
      label: 'Kesimpulan',
      skor: sum([
        { benar: State.langkahUrut.correct && State.langkahUrut.attempts === 1 ? 1 : 0, total: 1 },
        guidedScore('simpulan'),
      ]),
    },
    {
      label: 'Uji terap',
      skor: sum([multiScore('kandidat'), sortScore('terapAtribut'), guidedScore('terapKunci')]),
    },
  ];
}

function renderSelesai(root) {
  var d = D.selesai;
  if (!State.completedStages.selesai) machine.completeStage('selesai');
  var rincian = hitungSkor();
  var total = sum(
    rincian.map(function (r) {
      return r.skor;
    })
  );
  var pct = total.total ? Math.round((total.benar / total.total) * 100) : 0;

  root.innerHTML =
    head('selesai') +
    '<div class="panel panel--success done-panel">' +
    '<span class="done-panel__icon" aria-hidden="true">🎓</span>' +
    '<p class="done-panel__score">' +
    total.benar +
    ' / ' +
    total.total +
    '</p>' +
    '<p class="done-panel__pct">' +
    pct +
    '% benar pada percobaan pertama</p>' +
    '<p style="margin:0;">' +
    d.pesan +
    '</p>' +
    '</div>' +
    buildDlPanel(
      '<h3>📊 Rincian skor</h3><ul class="score-list">' +
        rincian
          .map(function (r) {
            return (
              '<li class="score-list__item"><span class="score-list__label">' +
              esc(r.label) +
              '</span><span class="score-list__value">' +
              r.skor.benar +
              ' / ' +
              r.skor.total +
              '</span></li>'
            );
          })
          .join('') +
        '</ul>'
    ) +
    buildDlPanel(
      '<h3>🧩 Rancangan entitas KopSis</h3>' +
        entityCards(D.olah.entitas, D.olah.atribut, 'atribut', D.olah.kunci, { semua: true })
    ) +
    buildDlPanel('<h3>📌 Ingat kembali</h3>' + listHtml(D.simpulan.rangkuman)) +
    '<div class="btn-group btn-group--end">' +
    '<a href="../../index.html" class="btn btn--ghost">Kembali ke Beranda</a>' +
    '<button type="button" class="btn btn--primary" id="ulangBtn">Ulangi dari Awal</button>' +
    '</div>';

  root.querySelector('#ulangBtn').addEventListener('click', function () {
    document.getElementById('resetAppBtn').click();
  });
}

/* ============================================================
   17. ROUTER RENDER & INIT
   ============================================================ */

var RENDERERS = {
  orientasi: renderOrientasi,
  stimulasi: renderStimulasi,
  masalah: renderMasalah,
  kumpulData: renderKumpulData,
  contoh: renderContoh,
  olah: renderOlah,
  pembuktian: renderPembuktian,
  simpulan: renderSimpulan,
  terapkan: renderTerapkan,
  refleksi: renderRefleksi,
  selesai: renderSelesai,
};

function renderCurrentStage() {
  var fn = RENDERERS[State.currentStage] || renderOrientasi;
  fn(container());
}

function resetAll() {
  store.reset();
  initOrders();
  store.save();
  machine.buildStageNav();
  machine.updateProgress();
  renderCurrentStage();
  window.scrollTo({ top: 0, behavior: 'smooth' });
  showNotice('Progres direset. Pilihan jawaban sudah diacak ulang.');
}

function init() {
  store.load();
  if (STAGES.indexOf(State.currentStage) === -1) State.currentStage = STAGES[0];
  initOrders();
  store.save();
  machine.buildStageNav();
  machine.updateProgress();
  renderCurrentStage();
  bindResetModal(resetAll);
}

/* Di Node (tes) tidak ada DOM: hanya fungsi & State yang dimuat. */
if (typeof document !== 'undefined') {
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
}
