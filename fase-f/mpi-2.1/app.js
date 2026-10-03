'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Rekayasa Perangkat Lunak: Perintah SQL DDL untuk Membangun
   Basis Data dari ERD
   Fase F — SMK Rekayasa Perangkat Lunak, Inquiry Learning

   Utilitas & komponen bersama berada di shared/engine.js:
     • mesin tahap & store (createStageMachine, createStore);
     • komponen umum (ensureShuffledOrder, buildDiscoveryHead,
       buildTeacherNote, buildChoiceGroup, buildTpPanel,
       buildGuidedQuizList, ensureSortStates, buildSortItems,
       ensureTapOrderState, buildTapOrder, ensureMultiState,
       buildMultiSelect, buildLikertGroup, buildKuisSekali);
     • seksi 15 — ERD lengkap (buildErdLengkap);
     • seksi 17 — SQL DDL (jalankanDdl, strukturDariErd,
       urutanBuatTabel, periksaStruktur, ddlSkripErd, sorotSql,
       buildSqlKode, buildSkemaDdl, buildKonsolDdl, bindKonsolDdl).

   Alur tahap mengikuti enam sintaks Inquiry Learning; lihat
   komentar kepala data.js.

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
    6. Stage: Orientasi          (Inkuiri sintaks 1)
    7. Stage: Rumuskan Masalah   (Inkuiri sintaks 2)
    8. Stage: Hipotesis          (Inkuiri sintaks 3)
    9. Stage: Lab DDL            (Inkuiri sintaks 4)
   10. Stage: Kartu Konsep       (Inkuiri sintaks 4)
   11. Stage: Bedah ERD          (Inkuiri sintaks 4)
   12. Stage: Rakit Skrip        (Inkuiri sintaks 4)
   13. Stage: Uji Hipotesis      (Inkuiri sintaks 5)
   14. Stage: Kesimpulan         (Inkuiri sintaks 6)
   15. Stage: Evaluasi           (Inkuiri sintaks 6)
   16. Stage: Refleksi           (Inkuiri sintaks 6)
   17. Stage: Selesai (skor)
   18. Router render & Init
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
var STORAGE_KEY = 'mpi-f-2-1-ddl-inquiry-v1';

/* Struktur tabel harapan dari ERD Perpustakaan (kunci tahap Uji). */
var STRUKTUR = strukturDariErd(D.erd);

/* Kartu urut-ketuk: satu kartu per tabel. */
var KARTU_TABEL = STRUKTUR.map(function (t) {
  return { id: t.nama, label: t.nama };
});

/* Pertanyaan penuntun (boleh dicoba ulang), untuk pengacakan & skor. */
var GUIDED = {
  eksperimen: D.eksperimen.pertanyaan,
  konsep: D.konsep.pertanyaan,
  identifikasi: D.identifikasi.pertanyaan,
  rakit: D.rakit.rumpang,
  uji: D.uji.pertanyaan,
  kesimpulan: D.kesimpulan.rumpang,
};

/* Kuis sekali-jawab: key State jawaban → daftar soal. */
var KUIS = {
  jawabEval: D.evaluasi.soal,
};

/* Pemilahan: key State → { items, kategori }. */
var SORTS = {
  bahasa: { items: D.konsep.bahasa.items, kategori: D.konsep.bahasa.kategori },
  fungsi: { items: D.konsep.fungsi.items, kategori: D.konsep.fungsi.kategori },
  peran: { items: D.identifikasi.peran.items, kategori: D.identifikasi.peran.kategori },
  tipe: { items: D.identifikasi.tipe.items, kategori: D.identifikasi.tipe.kategori },
};

/* Multi-pilih berdiagnosa: key State → daftar opsi. */
var MULTI = {
  pertanyaan: D.masalah.pertanyaan.opsi,
  ujiSilang: D.evaluasi.ujiSilang.opsi,
};

/* Hipotesis (tidak dinilai): key urutan → daftar opsi. */
var HIPO = {};
D.hipotesis.efek.items.forEach(function (it) {
  HIPO[it.id] = D.hipotesis.efek.opsi;
});
D.hipotesis.prediksi.forEach(function (q) {
  HIPO[q.id] = q.opsi;
});

/* ============================================================
   2. STATE & STORAGE
   ============================================================ */

var State = {
  currentStage: 'orientasi',
  completedStages: {},

  /* Orientasi — apersepsi (tidak dinilai) */
  apersepsiOrder: null,
  apersepsi: null,

  /* Urutan opsi SEMUA soal (pertanyaan penuntun & kuis) */
  qOrders: {},

  /* Pertanyaan penuntun: jawaban & hasil percobaan pertama */
  pilih: {},
  firstTry: {},

  /* Kuis evaluasi sekali-jawab */
  jawabEval: {},

  /* Pemilahan: bahasa SQL, fungsi DDL, peran kolom, tipe data */
  sorts: {},
  sortOrders: {},

  /* Multi-pilih: pertanyaan penyelidikan, uji silang skrip */
  multi: {},

  /* Rumuskan masalah — rumusan masalah tim */
  rumusan: '',

  /* Hipotesis — tebakan murid (id opsi) & urutan opsinya */
  hipo: {},
  hipoOrders: {},

  /* Lab DDL — langkah konsol yang sudah dijalankan & percobaan bebas */
  konsol: {},

  /* Rakit — urut-ketuk urutan CREATE TABLE */
  urutan: null,

  /* Uji & evaluasi — skrip sudah dijalankan? */
  ujiJalan: false,
  evalJalan: false,

  /* Refleksi */
  likert: {},
  refleksiTeks: '',
};

var store = createStore({ key: STORAGE_KEY, state: State });

/* ============================================================
   3. PENGACAKAN (sekali, saat State disiapkan)
   ============================================================ */

function initOrders() {
  [
    'qOrders',
    'pilih',
    'firstTry',
    'jawabEval',
    'sorts',
    'sortOrders',
    'multi',
    'hipo',
    'hipoOrders',
    'konsol',
    'likert',
  ].forEach(function (k) {
    if (!State[k] || typeof State[k] !== 'object') State[k] = {};
  });

  ensureShuffledOrder(State, 'apersepsiOrder', D.orientasi.apersepsi.opsi);

  Object.keys(GUIDED).forEach(function (k) {
    GUIDED[k].forEach(function (q) {
      ensureShuffledOrder(State.qOrders, q.id, q.opsi);
    });
  });
  Object.keys(KUIS).forEach(function (k) {
    KUIS[k].forEach(function (q) {
      ensureShuffledOrder(State.qOrders, q.id, q.opsi);
    });
  });

  Object.keys(HIPO).forEach(function (k) {
    ensureShuffledOrder(State.hipoOrders, k, HIPO[k]);
  });

  Object.keys(SORTS).forEach(function (k) {
    var tmp = { s: State.sorts[k], o: State.sortOrders[k] };
    ensureSortStates(tmp, 's', 'o', SORTS[k].items, SORTS[k].kategori);
    State.sorts[k] = tmp.s;
    State.sortOrders[k] = tmp.o;
  });

  Object.keys(MULTI).forEach(function (k) {
    ensureMultiState(State.multi, k, MULTI[k]);
  });

  ensureKonsolState(State.konsol, 'lab');
  ensureTapOrderState(State, 'urutan', KARTU_TABEL, urutanBuatTabel(D.erd));
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
  var attrs = [
    'data-ap',
    'data-hipo',
    'data-q-opt',
    'data-kuis-opt',
    'data-sort-opt',
    'data-multi-opt',
    'data-tap-add',
    'data-tap-back',
  ];
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
  var s = sintaksOf(id);
  return buildDiscoveryHead(d.kicker, d.title, d.goal, s ? 'Inquiry Learning · ' + s : '');
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
      if (btn.disabled) return;
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

function kuisDone(key) {
  return kuisSelesai(KUIS[key], State[key]);
}

function counter(n, total, teks) {
  return (
    '<p class="sort-counter" aria-live="polite"><strong>' +
    n +
    '</strong> dari ' +
    total +
    ' ' +
    teks +
    '</p>'
  );
}

function sortList(key, opts) {
  return buildSortItems(
    SORTS[key].items,
    State.sortOrders[key],
    SORTS[key].kategori,
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
  return counter(n, items.length, 'sudah dipilah');
}

function multi(key, extra) {
  return buildMultiSelect(key, MULTI[key], State.multi[key], extra);
}

function bindMulti(root, key) {
  bindMultiSelect(root, key, MULTI[key], State.multi[key], store.save, rerender);
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

function bindTextarea(root, id, key) {
  var ta = root.querySelector('#' + id);
  if (!ta) return;
  ta.addEventListener('input', function () {
    State[key] = ta.value;
    store.save();
  });
}

function erdPerpus() {
  return buildErdLengkap(D.erd, { judul: D.masalah.erdJudul });
}

/* Urutan "benar" untuk menilai urut-ketuk: urutan murid bila sah,
   selainnya urutan sah terdekat (lihat urutanBuatTabel). */
function jawabanUrutan() {
  return urutanBuatTabel(D.erd, State.urutan.placed);
}

function skripTim() {
  return ddlSkripErd(D.erd, D.namaDb, State.urutan.correct ? State.urutan.placed : null);
}

/* Pernyataan berumpang tahap Rakit: rumpang terisi bila sudah benar. */
function rumpangHtml() {
  var html = sorotSql(D.rakit.rumpangSql);
  D.rakit.rumpang.forEach(function (q, i) {
    var no = i + 1;
    var benar = State.pilih[q.id] === q.correct;
    var isi = benar
      ? '<span class="sql-blank sql-blank--isi">' + esc(D.rakit.isian[q.id]) + '</span>'
      : '<span class="sql-blank" aria-label="isian ' + no + '">' + '①②③④'[i] + '</span>';
    html = html.replace('__' + no + '__', isi);
  });
  return '<pre class="sql-code" aria-label="Pernyataan berumpang"><code>' + html + '</code></pre>';
}

function logHtml(log) {
  return '<ul class="ddl-log">' + log.map(buildLogDdl).join('') + '</ul>';
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
      '<h3>🗺️ Alur penyelidikan</h3>' +
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
   7. STAGE: RUMUSKAN MASALAH
   ============================================================ */

function rumusanCukup() {
  return (State.rumusan || '').trim().length >= D.masalah.rumusan.min;
}

function masalahDone() {
  return State.multi.pertanyaan.done && rumusanCukup();
}

function renderMasalah(root) {
  var d = D.masalah;
  var r = d.rumusan;
  var pDone = State.multi.pertanyaan.done;
  root.innerHTML =
    head('masalah') +
    buildTeacherNote(d.guru) +
    buildDlPanel('<blockquote class="ddl-quote">' + esc(d.kutipan) + '</blockquote>') +
    '<div class="ddl-banding">' +
    buildDlPanel('<h3>📐 Rancangan</h3>' + erdPerpus()) +
    buildDlPanel(
      '<h3>🖥️ Kenyataan</h3>' +
        buildSkemaDdl(skemaKosong(), { judul: d.dbmsJudul }) +
        '<p class="sort-counter">Lima entitas di ERD, nol tabel di DBMS. Apa yang dibutuhkan untuk menjembatani keduanya?</p>'
    ) +
    '</div>' +
    buildDlPanel(
      '<h3>① Pilih pertanyaan penyelidikan</h3><p>' +
        d.pertanyaan.tanya +
        '</p>' +
        multi('pertanyaan', { done: d.pertanyaan.done })
    ) +
    (pDone
      ? buildDlPanel(
          '<h3>② ' +
            esc(r.label) +
            '</h3>' +
            '<label class="input-label" for="rumusanTeks">' +
            esc(r.petunjuk) +
            '</label>' +
            '<textarea class="input-textarea" id="rumusanTeks" rows="3" placeholder="' +
            esc(r.placeholder) +
            '">' +
            esc(State.rumusan) +
            '</textarea>' +
            '<p class="sort-counter" id="rumusanHitung" aria-live="polite"></p>'
        ) + nextButton('masalah')
      : '');

  bindMulti(root, 'pertanyaan');
  var ta = root.querySelector('#rumusanTeks');
  var btn = root.querySelector('#nextBtn');
  var hitung = root.querySelector('#rumusanHitung');
  function sync() {
    var n = (State.rumusan || '').trim().length;
    if (btn) btn.disabled = !masalahDone();
    if (hitung) {
      hitung.textContent =
        n >= r.min ? '✓ Rumusan siap.' : n + ' / ' + r.min + ' karakter minimal.';
    }
  }
  if (ta) {
    ta.addEventListener('input', function () {
      State.rumusan = ta.value;
      store.save();
      sync();
    });
  }
  sync();
  bindNextButton(root, 'masalah');
}

/* ============================================================
   8. STAGE: HIPOTESIS
   ============================================================ */

function hipotesisDone() {
  return Object.keys(HIPO).every(function (k) {
    return !!State.hipo[k];
  });
}

function hipoPilihan(key) {
  return buildChoiceGroup(HIPO[key], State.hipoOrders[key], {
    chosen: State.hipo[key] || null,
    grade: false,
    attr: 'data-hipo',
    group: key,
  });
}

function renderHipotesis(root) {
  var d = D.hipotesis;
  var n = Object.keys(HIPO).filter(function (k) {
    return !!State.hipo[k];
  }).length;
  root.innerHTML =
    head('hipotesis') +
    buildTeacherNote(d.guru) +
    buildDlPanel('<p style="margin:0;">' + d.pengantar + '</p>', 'panel--info') +
    buildDlPanel(
      '<h3>' +
        esc(d.efek.pengantar) +
        '</h3>' +
        d.efek.items
          .map(function (it) {
            return (
              '<div class="quiz-item">' +
              buildSqlKode(it.sql, { kecil: true }) +
              hipoPilihan(it.id) +
              '</div>'
            );
          })
          .join('')
    ) +
    buildDlPanel(
      erdPerpus() +
        d.prediksi
          .map(function (q) {
            return (
              '<div class="quiz-item"><p class="exercise-label">' +
              q.tanya +
              '</p>' +
              hipoPilihan(q.id) +
              '</div>'
            );
          })
          .join('')
    ) +
    counter(n, Object.keys(HIPO).length, 'hipotesis sudah ditulis') +
    (hipotesisDone()
      ? buildFeedbackBox(
          'info',
          '📝',
          '<strong>Hipotesismu tersimpan.</strong> Boleh diubah sebelum lanjut. Setelah ini, kumpulkan bukti di Lab DDL.'
        ) + nextButton('hipotesis')
      : '');

  root.querySelectorAll('[data-hipo]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.hipo[btn.dataset.group] = btn.getAttribute('data-hipo');
      store.save();
      rerender();
    });
  });
  bindNextButton(root, 'hipotesis');
}

/* ============================================================
   9. STAGE: LAB DDL
   ============================================================ */

function renderEksperimen(root) {
  var d = D.eksperimen;
  var st = State.konsol.lab;
  var tuntas = st.jalan >= d.langkah.length;
  var done = tuntas && guidedDone('eksperimen');
  root.innerHTML =
    head('eksperimen') +
    buildTeacherNote(d.guru) +
    buildDlPanel('<p style="margin:0;">' + d.pengantar + '</p>') +
    buildDlPanel(
      '<h3>🧪 Konsol DBMS</h3>' +
        counter(Math.min(st.jalan, d.langkah.length), d.langkah.length, 'langkah dijalankan') +
        buildKonsolDdl('lab', d.langkah, st, { bebas: true }) +
        (tuntas ? '<p class="sort-counter">' + d.bebasPetunjuk + '</p>' : '')
    ) +
    (tuntas ? buildDlPanel('<h3>🔎 Olah hasil pengamatan</h3>' + guidedList('eksperimen')) : '') +
    (done ? nextButton('eksperimen') : '');
  bindKonsolDdl(root, 'lab', d.langkah, st, store.save, rerender);
  if (tuntas) bindGuided(root, 'eksperimen');
  bindNextButton(root, 'eksperimen');
}

/* ============================================================
   10. STAGE: KARTU KONSEP
   ============================================================ */

function renderKonsep(root) {
  var d = D.konsep;
  var bDone = sortDone('bahasa');
  var fDone = bDone && sortDone('fungsi');
  var done = fDone && guidedDone('konsep');
  root.innerHTML =
    head('konsep') +
    buildTeacherNote(d.guru) +
    buildDlPanel('<p style="margin:0;">' + d.pengantar + '</p>') +
    '<div class="ddl-konsep-grid">' +
    d.kartu
      .map(function (k) {
        return (
          '<details class="ddl-konsep"><summary><span aria-hidden="true">' +
          k.ikon +
          '</span> ' +
          esc(k.istilah) +
          '</summary><p>' +
          esc(k.def) +
          '</p>' +
          buildSqlKode(k.contoh, { kecil: true, label: 'Contoh ' + k.istilah }) +
          '</details>'
        );
      })
      .join('') +
    '</div>' +
    buildDlPanel(
      '<h3>① ' +
        esc(d.bahasa.pengantar) +
        '</h3>' +
        sortCounter('bahasa') +
        sortList('bahasa', { mono: true })
    ) +
    (bDone
      ? buildDlPanel(
          '<h3>② ' +
            esc(d.fungsi.pengantar) +
            '</h3>' +
            sortCounter('fungsi') +
            sortList('fungsi', { mono: true })
        )
      : '') +
    (fDone ? buildDlPanel('<h3>③ Constraint</h3>' + guidedList('konsep')) : '') +
    (done ? nextButton('konsep') : '');
  bindSort(root, 'bahasa');
  if (bDone) bindSort(root, 'fungsi');
  if (fDone) bindGuided(root, 'konsep');
  bindNextButton(root, 'konsep');
}

/* ============================================================
   11. STAGE: BEDAH ERD
   ============================================================ */

function renderIdentifikasi(root) {
  var d = D.identifikasi;
  var pDone = sortDone('peran');
  var tDone = pDone && sortDone('tipe');
  var done = tDone && guidedDone('identifikasi');
  root.innerHTML =
    head('identifikasi') +
    buildTeacherNote(d.guru) +
    buildDlPanel('<p>' + d.pengantar + '</p>' + erdPerpus()) +
    buildDlPanel(
      '<h3>' +
        esc(d.peran.pengantar) +
        '</h3>' +
        sortCounter('peran') +
        sortList('peran', { mono: true })
    ) +
    (pDone
      ? buildDlPanel(
          '<h3>' +
            esc(d.tipe.pengantar) +
            '</h3>' +
            sortCounter('tipe') +
            sortList('tipe', { mono: true })
        )
      : '') +
    (tDone ? buildDlPanel('<h3>🧩 Struktur basis data</h3>' + guidedList('identifikasi')) : '') +
    (done ? nextButton('identifikasi') : '');
  bindSort(root, 'peran');
  if (pDone) bindSort(root, 'tipe');
  if (tDone) bindGuided(root, 'identifikasi');
  bindNextButton(root, 'identifikasi');
}

/* ============================================================
   12. STAGE: RAKIT SKRIP
   ============================================================ */

function renderRakit(root) {
  var d = D.rakit;
  var urut = State.urutan;
  var done = urut.correct && guidedDone('rakit');
  root.innerHTML =
    head('rakit') +
    buildTeacherNote(d.guru) +
    buildDlPanel('<p>' + d.urutan.pengantar + '</p>' + buildErdLengkap(D.erd, { relasi: false })) +
    buildDlPanel(
      buildTapOrder('urutan', KARTU_TABEL, urut, {
        answer: jawabanUrutan(),
        startLabel: 'Dibuat pertama',
        endLabel: 'Dibuat terakhir',
        successText: d.urutan.sukses,
        wrongText: d.urutan.salah,
      })
    ) +
    (urut.correct
      ? buildDlPanel('<p>' + d.rumpangPengantar + '</p>' + rumpangHtml() + guidedList('rakit'))
      : '') +
    (done
      ? buildDlPanel(
          '<h3>📜 Skrip DDL Perpustakaan</h3><p>' +
            d.simpulan +
            '</p>' +
            buildSqlKode(skripTim(), { label: 'Skrip DDL lengkap' }),
          'panel--success'
        ) + nextButton('rakit')
      : '');
  bindTapOrder(root, 'urutan', urut, jawabanUrutan(), store.save, rerender);
  if (urut.correct) bindGuided(root, 'rakit');
  bindNextButton(root, 'rakit');
}

/* ============================================================
   13. STAGE: UJI HIPOTESIS
   ============================================================ */

function labelOpsi(list, id) {
  return findOptionLabel(list, id) || '—';
}

/* Daftar hipotesis vs bukti. → { html, cocok, total } */
function bandingHipotesis() {
  var d = D.hipotesis;
  var baris = [];
  d.efek.items.forEach(function (it) {
    baris.push({
      judul: it.sql,
      tebak: labelOpsi(d.efek.opsi, State.hipo[it.id]),
      bukti: labelOpsi(d.efek.opsi, it.benar),
      cocok: State.hipo[it.id] === it.benar,
      mono: true,
    });
  });
  d.prediksi.forEach(function (q) {
    baris.push({
      judul: q.tanya.replace(/^Hipotesis [^:]+:\s*/, ''),
      tebak: labelOpsi(q.opsi, State.hipo[q.id]),
      bukti: q.bukti,
      cocok: State.hipo[q.id] === q.benar,
    });
  });
  var cocok = baris.filter(function (b) {
    return b.cocok;
  }).length;
  var html =
    '<ul class="hipo-list">' +
    baris
      .map(function (b) {
        return (
          '<li class="hipo-item hipo-item--' +
          (b.cocok ? 'ya' : 'tidak') +
          '"><p class="hipo-item__judul' +
          (b.mono ? ' hipo-item__judul--mono' : '') +
          '">' +
          esc(b.judul) +
          '</p><p><span class="hipo-item__tag">Dugaanku</span> ' +
          esc(b.tebak) +
          '</p><p><span class="hipo-item__tag">Bukti</span> ' +
          esc(b.bukti) +
          '</p><p class="hipo-item__hasil">' +
          (b.cocok ? '✓ Hipotesis diterima' : '✗ Hipotesis perlu direvisi') +
          '</p></li>'
        );
      })
      .join('') +
    '</ul>';
  return { html: html, cocok: cocok, total: baris.length };
}

function renderUji(root) {
  var d = D.uji;
  var skrip = skripTim();
  var hasil = State.ujiJalan ? jalankanDdl(skemaKosong(), skrip) : null;
  var selisih = hasil ? periksaStruktur(hasil.skema, STRUKTUR) : [];
  var lulus = hasil && hasil.ok && !selisih.length;
  var banding = bandingHipotesis();
  var done = lulus && guidedDone('uji');
  root.innerHTML =
    head('uji') +
    buildTeacherNote(d.guru) +
    buildDlPanel(
      '<p>' +
        d.pengantar +
        '</p>' +
        buildSqlKode(skrip, { label: 'Skrip DDL tim' }) +
        (State.ujiJalan
          ? ''
          : '<div class="btn-group"><button type="button" class="btn btn--primary" id="ujiRun">▶ Jalankan skrip di DBMS</button></div>')
    ) +
    (hasil
      ? buildDlPanel(
          '<h3>🖥️ Hasil di DBMS</h3>' +
            logHtml(hasil.log) +
            buildSkemaDdl(hasil.skema, { judul: 'Isi DBMS setelah skrip' }) +
            (lulus
              ? buildFeedbackBox('success', '✓', d.lulus)
              : buildFeedbackBox(
                  'warning',
                  '💭',
                  '<strong>Struktur belum sesuai ERD:</strong>' + listHtml(selisih.map(esc))
                ))
        ) +
        buildDlPanel(
          '<h3>⚖️ Hipotesisku vs bukti</h3>' +
            counter(banding.cocok, banding.total, 'hipotesis diterima') +
            banding.html
        ) +
        buildDlPanel('<h3>💬 Analisis pengujian</h3>' + guidedList('uji'))
      : '') +
    (done ? nextButton('uji') : '');
  var run = root.querySelector('#ujiRun');
  if (run) {
    run.addEventListener('click', function () {
      State.ujiJalan = true;
      store.save();
      rerender();
    });
  }
  if (hasil) bindGuided(root, 'uji');
  bindNextButton(root, 'uji');
}

/* ============================================================
   14. STAGE: KESIMPULAN
   ============================================================ */

function renderKesimpulan(root) {
  var d = D.kesimpulan;
  var done = guidedDone('kesimpulan');
  root.innerHTML =
    head('kesimpulan') +
    buildTeacherNote(d.guru) +
    buildDlPanel('<p style="margin:0;">' + d.pengantar + '</p>') +
    buildDlPanel(guidedList('kesimpulan')) +
    (done
      ? buildDlPanel(
          '<h3>📌 Kesimpulan tim</h3>' +
            d.paragraf
              .map(function (p) {
                return '<p>' + p + '</p>';
              })
              .join(''),
          'panel--success'
        ) + nextButton('kesimpulan')
      : '');
  bindGuided(root, 'kesimpulan');
  bindNextButton(root, 'kesimpulan');
}

/* ============================================================
   15. STAGE: EVALUASI
   ============================================================ */

function renderEvaluasi(root) {
  var d = D.evaluasi;
  var u = d.ujiSilang;
  var kDone = kuisDone('jawabEval');
  var s = skorKuis(KUIS.jawabEval, State.jawabEval);
  var done = kDone && State.multi.ujiSilang.done;
  var dijawab = KUIS.jawabEval.filter(function (q) {
    return !!State.jawabEval[q.id];
  }).length;
  var hasil = State.evalJalan ? jalankanDdl(skemaKosong(), u.skrip) : null;
  root.innerHTML =
    head('evaluasi') +
    buildTeacherNote(d.guru) +
    buildDlPanel(
      '<p>' + d.pengantarKuis + '</p>' + buildErdLengkap(D.erdLab, { judul: d.erdJudul })
    ) +
    buildDlPanel(
      counter(dijawab, KUIS.jawabEval.length, 'soal sudah dijawab') +
        buildKuisSekali(KUIS.jawabEval, State.qOrders, State.jawabEval)
    ) +
    (kDone
      ? buildDlPanel(
          '<p style="margin:0;"><strong>Nilai evaluasimu: ' +
            s.nilai +
            '</strong> (' +
            s.benar +
            ' dari ' +
            s.total +
            ' benar).</p>',
          'panel--info'
        ) +
        buildDlPanel(
          '<h3>🔍 Uji silang</h3><p>' +
            u.pengantar +
            '</p><h4>' +
            esc(u.judul) +
            '</h4>' +
            buildSqlKode(u.skrip, { label: u.judul }) +
            (hasil
              ? logHtml(hasil.log)
              : '<div class="btn-group"><button type="button" class="btn btn--ghost btn--small" id="evalRun">▶ Coba jalankan skrip Tim Biru</button></div>') +
            '<p>' +
            u.tanya +
            '</p>' +
            multi('ujiSilang', { done: u.done })
        )
      : '') +
    (done ? nextButton('evaluasi') : '');
  bindKuisSekali(root, KUIS.jawabEval, State.jawabEval, store.save, rerender);
  var run = root.querySelector('#evalRun');
  if (run) {
    run.addEventListener('click', function () {
      State.evalJalan = true;
      store.save();
      rerender();
    });
  }
  if (kDone) bindMulti(root, 'ujiSilang');
  bindNextButton(root, 'evaluasi');
}

/* ============================================================
   16. STAGE: REFLEKSI
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
  bindTextarea(root, 'refleksiTeks', 'refleksiTeks');
  bindNextButton(root, 'refleksi');
}

/* ============================================================
   17. STAGE: SELESAI (skor)
   ============================================================ */

function firstTryCount(list) {
  return list.filter(function (q) {
    return State.firstTry[q.id] === true;
  }).length;
}

function guidedScore(key) {
  return { benar: firstTryCount(GUIDED[key]), total: GUIDED[key].length };
}

function multiScore(key) {
  return { benar: State.multi[key].firstTry === true ? 1 : 0, total: 1 };
}

function sortScore(key) {
  return nilaiPemilahan(SORTS[key].items, State.sorts[key]);
}

function sum(parts) {
  return parts.reduce(
    function (acc, p) {
      return { benar: acc.benar + p.benar, total: acc.total + p.total };
    },
    { benar: 0, total: 0 }
  );
}

function hitungSkor() {
  var urut = State.urutan;
  return [
    { label: 'Rumuskan masalah — pertanyaan penyelidikan', skor: multiScore('pertanyaan') },
    { label: 'Lab DDL — olah hasil pengamatan', skor: guidedScore('eksperimen') },
    {
      label: 'Kartu konsep — DDL/DML/DCL, fungsi DDL, constraint',
      skor: sum([sortScore('bahasa'), sortScore('fungsi'), guidedScore('konsep')]),
    },
    {
      label: 'Bedah ERD — peran kolom, tipe data, struktur',
      skor: sum([sortScore('peran'), sortScore('tipe'), guidedScore('identifikasi')]),
    },
    {
      label: 'Rakit skrip — urutan tabel & isian CREATE TABLE',
      skor: sum([
        { benar: urut.correct && urut.attempts === 1 ? 1 : 0, total: 1 },
        guidedScore('rakit'),
      ]),
    },
    { label: 'Uji hipotesis — analisis pengujian', skor: guidedScore('uji') },
    { label: 'Kesimpulan — konsep & fungsi DDL', skor: guidedScore('kesimpulan') },
    {
      label: 'Evaluasi — kuis basis data Lab RPL',
      skor: skorKuis(KUIS.jawabEval, State.jawabEval),
    },
    { label: 'Evaluasi — uji silang skrip Tim Biru', skor: multiScore('ujiSilang') },
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
  var banding = bandingHipotesis();

  root.innerHTML =
    head('selesai') +
    '<div class="panel panel--success done-panel">' +
    '<span class="done-panel__icon" aria-hidden="true">🏆</span>' +
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
        '</ul>' +
        '<p class="sort-counter">Hipotesis awal yang terbukti: ' +
        banding.cocok +
        ' dari ' +
        banding.total +
        ' (tidak dinilai — yang penting kamu mengujinya).</p>'
    ) +
    buildDlPanel(
      '<h3>📜 Skrip DDL Perpustakaan</h3>' + buildSqlKode(skripTim(), { label: 'Skrip DDL' })
    ) +
    buildDlPanel('<h3>📌 Ingat kembali</h3>' + listHtml(d.rangkuman)) +
    '<div class="btn-group btn-group--end">' +
    '<a href="../../index.html" class="btn btn--ghost">Kembali ke Beranda</a>' +
    '<button type="button" class="btn btn--primary" id="ulangBtn">Ulangi dari Awal</button>' +
    '</div>';

  root.querySelector('#ulangBtn').addEventListener('click', function () {
    document.getElementById('resetAppBtn').click();
  });
}

/* ============================================================
   18. ROUTER RENDER & INIT
   ============================================================ */

var RENDERERS = {
  orientasi: renderOrientasi,
  masalah: renderMasalah,
  hipotesis: renderHipotesis,
  eksperimen: renderEksperimen,
  konsep: renderKonsep,
  identifikasi: renderIdentifikasi,
  rakit: renderRakit,
  uji: renderUji,
  kesimpulan: renderKesimpulan,
  evaluasi: renderEvaluasi,
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
