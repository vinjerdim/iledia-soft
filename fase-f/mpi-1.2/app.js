'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Rekayasa Perangkat Lunak: Menentukan Jenis Relasi dan
   Kardinalitas Antar Entitas dalam Rancangan ERD
   Fase F — SMK Rekayasa Perangkat Lunak, Cooperative Learning

   Utilitas & komponen bersama berada di shared/engine.js:
     • mesin tahap & store (createStageMachine, createStore);
     • komponen umum (ensureShuffledOrder, buildDiscoveryHead,
       buildTeacherNote, buildChoiceGroup, buildTpPanel,
       buildGuidedQuizList, ensureSortStates, buildSortItems,
       ensureTapOrderState, buildTapOrder, ensureMultiState,
       buildMultiSelect, buildLikertGroup);
     • seksi 13 — relasi & kardinalitas ERD (buildRelasiDiagram,
       ensureKardinalitasState, buildKardinalitasPicker,
       skorKardinalitas, kalimatRelasi);
     • seksi 14 — kerja kelompok kooperatif (buildPeranKelompok,
       buildKuisSekali, skorKuis, poinPeningkatan, rataPoinTim,
       predikatTim).

   Alur tahap mengikuti sintaks Cooperative Learning (Jigsaw +
   poin peningkatan STAD); lihat komentar kepala data.js.

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
    6. Stage: Orientasi            (CL sintaks 1)
    7. Stage: Kuis Awal            (CL sintaks 1 — skor dasar)
    8. Stage: Info Kunci           (CL sintaks 2)
    9. Stage: Bentuk Tim           (CL sintaks 3)
   10. Stage: Tim Ahli             (CL sintaks 4 — Jigsaw)
   11. Stage: Diskusi Tim          (CL sintaks 4 — tim asal)
   12. Stage: Rancang ERD          (CL sintaks 4)
   13. Stage: Evaluasi             (CL sintaks 5)
   14. Stage: Penghargaan          (CL sintaks 6)
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
var STORAGE_KEY = 'mpi-f-1-2-relasi-cl-v1';

/* Pertanyaan penuntun (boleh dicoba ulang), untuk pengacakan & skor. */
var GUIDED = {
  informasi: D.informasi.pertanyaan,
  rancang: D.rancang.pertanyaan,
};
D.kelompok.topik.forEach(function (t) {
  GUIDED['ahli-' + t.id] = D.ahli.topik[t.id].pertanyaan;
});

/* Kuis sekali-jawab: key State jawaban → daftar soal. */
var KUIS = {
  jawabAwal: D.kuisAwal.soal,
  jawabEval: D.evaluasi.soal,
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

  /* Urutan opsi SEMUA soal (pertanyaan penuntun & kuis) */
  qOrders: {},

  /* Pertanyaan penuntun: jawaban & hasil percobaan pertama */
  pilih: {},
  firstTry: {},

  /* Kuis sekali-jawab: kuis awal (skor dasar) & evaluasi */
  jawabAwal: {},
  jawabEval: {},

  /* Multi-pilih: norma tim, uji silang */
  multi: {},

  /* Bentuk tim */
  peranNama: {},
  topikAhli: null,

  /* Tim ahli — urut-ketuk kartu ajar */
  kartuAjar: null,

  /* Diskusi — pemilahan aturan bisnis */
  sorts: {},
  sortOrders: {},

  /* Rancang — pemilih kardinalitas per relasi */
  kardinalitas: {},

  /* Penghargaan — poin peningkatan teman satu tim */
  poinTim: [],

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
    'jawabAwal',
    'jawabEval',
    'multi',
    'peranNama',
    'sorts',
    'sortOrders',
    'kardinalitas',
    'likert',
  ].forEach(function (k) {
    if (!State[k] || typeof State[k] !== 'object') State[k] = {};
  });
  if (!Array.isArray(State.poinTim)) State.poinTim = [];

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

  ensureMultiState(State.multi, 'norma', D.kelompok.norma.opsi);
  ensureMultiState(State.multi, 'ujiSilang', D.evaluasi.ujiSilang.opsi);

  ensureTapOrderState(State, 'kartuAjar', D.ahli.kartuAjar.langkah, D.ahli.kartuAjar.urutan);

  var tmp = { s: State.sorts.aturan, o: State.sortOrders.aturan };
  ensureSortStates(tmp, 's', 'o', D.diskusi.aturan, D.diskusi.kategori);
  State.sorts.aturan = tmp.s;
  State.sortOrders.aturan = tmp.o;

  ensureKardinalitasState(State, 'kardinalitas', D.rancang.relasi);
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
    'data-q-opt',
    'data-kuis-opt',
    'data-sort-opt',
    'data-multi-opt',
    'data-tap-add',
    'data-kard',
    'data-topik',
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
  return buildDiscoveryHead(d.kicker, d.title, d.goal, 'Cooperative Learning · ' + sintaksOf(id));
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

function kuisList(key) {
  return buildKuisSekali(KUIS[key], State.qOrders, State[key]);
}

function bindKuis(root, key) {
  bindKuisSekali(root, KUIS[key], State[key], store.save, rerender);
}

function kuisDone(key) {
  return kuisSelesai(KUIS[key], State[key]);
}

function kuisCounter(key) {
  var n = KUIS[key].filter(function (q) {
    return !!State[key][q.id];
  }).length;
  return (
    '<p class="sort-counter" aria-live="polite"><strong>' +
    n +
    '</strong> dari ' +
    KUIS[key].length +
    ' soal sudah dijawab</p>'
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

function topikById(id) {
  return D.kelompok.topik.filter(function (t) {
    return t.id === id;
  })[0];
}

/* Skor kuis berskala 0–100 dan poin peningkatan STAD milik murid ini. */
function skorDasar() {
  return skorKuis(KUIS.jawabAwal, State.jawabAwal);
}

function skorEvaluasi() {
  return skorKuis(KUIS.jawabEval, State.jawabEval);
}

function poinSaya() {
  return poinPeningkatan(skorDasar().nilai, skorEvaluasi().nilai);
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
      '<h3>🗺️ Alur kerja tim</h3>' +
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
   7. STAGE: KUIS AWAL (skor dasar)
   ============================================================ */

function renderKuisAwal(root) {
  var d = D.kuisAwal;
  var done = kuisDone('jawabAwal');
  var s = skorDasar();
  root.innerHTML =
    head('kuisAwal') +
    buildTeacherNote(d.guru) +
    buildDlPanel('<p style="margin:0;">' + d.pengantar + '</p>') +
    buildDlPanel(kuisCounter('jawabAwal') + kuisList('jawabAwal')) +
    (done
      ? buildDlPanel(
          '<h3>📌 Skor dasarmu: ' +
            s.nilai +
            '</h3><p style="margin:0;">Kamu menjawab benar ' +
            s.benar +
            ' dari ' +
            s.total +
            ' soal. Catat skor ini — di akhir pelajaran kita bandingkan dengan nilai evaluasimu untuk menghitung <strong>poin peningkatan</strong> yang kamu sumbangkan bagi tim.</p>',
          'panel--info'
        )
      : '') +
    (done ? nextButton('kuisAwal') : '');
  bindKuis(root, 'jawabAwal');
  bindNextButton(root, 'kuisAwal');
}

/* ============================================================
   8. STAGE: INFO KUNCI (menyajikan informasi)
   ============================================================ */

function renderInformasi(root) {
  var d = D.informasi;
  var done = guidedDone('informasi');
  root.innerHTML =
    head('informasi') +
    buildTeacherNote(d.guru) +
    buildDlPanel('<p style="margin:0;">' + d.pengantar + '</p>') +
    '<div class="concept-grid">' +
    d.konsep
      .map(function (k) {
        return (
          '<article class="panel concept-rel">' +
          '<h3 class="concept-rel__title"><span aria-hidden="true">' +
          k.ikon +
          '</span> ' +
          esc(k.judul) +
          '</h3>' +
          '<p>' +
          k.def +
          '</p>' +
          buildRelasiDiagram(k.rel) +
          '<p class="concept-rel__read">' +
          esc(kalimatRelasi(k.rel, 'ab')) +
          '<br>' +
          esc(kalimatRelasi(k.rel, 'ba')) +
          '</p>' +
          '</article>'
        );
      })
      .join('') +
    '</div>' +
    buildDlPanel(
      '<h3>🔢 Notasi kardinalitas min..maks</h3>' +
        '<div class="mini-table-wrap" tabindex="0" role="region" aria-label="Tabel notasi kardinalitas">' +
        '<table class="mini-table"><thead><tr><th scope="col">Notasi</th><th scope="col">Arti</th><th scope="col">Contoh di Sistem Ekskul</th></tr></thead><tbody>' +
        d.notasi
          .map(function (n) {
            return (
              '<tr><th scope="row"><code>' +
              esc(n.id) +
              '</code></th><td>' +
              esc(n.arti) +
              '</td><td>' +
              esc(n.contoh) +
              '</td></tr>'
            );
          })
          .join('') +
        '</tbody></table></div>'
    ) +
    buildDlPanel('<h3>✅ Cek paham bersama tim</h3>' + guidedList('informasi')) +
    (done ? nextButton('informasi') : '');
  bindGuided(root, 'informasi');
  bindNextButton(root, 'informasi');
}

/* ============================================================
   9. STAGE: BENTUK TIM (mengorganisasi kelompok)
   ============================================================ */

function renderKelompok(root) {
  var d = D.kelompok;
  var st = State.multi.norma;
  var done = !!State.topikAhli && st.done;
  root.innerHTML =
    head('kelompok') +
    buildTeacherNote(d.guru) +
    buildDlPanel('<p style="margin:0;">' + d.pengantar + '</p>') +
    buildDlPanel(
      '<h3>① Bagi peran tim</h3>' +
        '<p class="muted-note">Tulis nama anggota yang memegang setiap peran (boleh dikosongkan bila belajar sendiri).</p>' +
        buildPeranKelompok(d.peran, State.peranNama)
    ) +
    buildDlPanel(
      '<h3>② Pilih topik keahlianmu</h3>' +
        '<p>Sepakati bersama tim: setiap topik harus punya minimal satu ahli.</p>' +
        '<div class="expert-grid" role="group" aria-label="Topik ahli">' +
        d.topik
          .map(function (t) {
            var on = State.topikAhli === t.id;
            return (
              '<button type="button" class="expert-chip' +
              (on ? ' is-selected' : '') +
              '" data-topik="' +
              esc(t.id) +
              '" aria-pressed="' +
              on +
              '"><span class="expert-chip__title"><span aria-hidden="true">' +
              t.ikon +
              '</span> ' +
              esc(t.label) +
              '</span><span class="expert-chip__desc">' +
              esc(t.desk) +
              '</span></button>'
            );
          })
          .join('') +
        '</div>'
    ) +
    buildDlPanel(
      '<h3>③ Sepakati norma kerja tim</h3><p>' +
        d.norma.tanya +
        '</p>' +
        buildMultiSelect('norma', d.norma.opsi, st, { done: d.norma.done })
    ) +
    (done
      ? nextButton('kelompok')
      : '<p class="muted-note">Pilih topik keahlian dan sepakati norma tim untuk melanjutkan.</p>');

  bindPeranKelompok(root, State.peranNama, store.save);
  root.querySelectorAll('[data-topik]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      State.topikAhli = btn.dataset.topik;
      store.save();
      rerender();
    });
  });
  bindMultiSelect(root, 'norma', d.norma.opsi, st, store.save, rerender);
  bindNextButton(root, 'kelompok');
}

/* ============================================================
   10. STAGE: TIM AHLI (Jigsaw — kelompok ahli)
   ============================================================ */

function renderAhli(root) {
  var d = D.ahli;
  var topik = topikById(State.topikAhli);
  if (!topik) {
    root.innerHTML =
      head('ahli') +
      buildDlPanel(
        '<p style="margin:0;">Kamu belum memilih topik keahlian. Kembali ke tahap Bentuk Tim dan pilih satu topik.</p>',
        'panel--warning'
      ) +
      '<div class="btn-group"><button type="button" class="btn btn--primary" id="backBtn">← Kembali ke Bentuk Tim</button></div>';
    root.querySelector('#backBtn').addEventListener('click', function () {
      machine.navigateTo('kelompok');
    });
    return;
  }
  var materi = d.topik[topik.id];
  var key = 'ahli-' + topik.id;
  var qDone = guidedDone(key);
  var urut = State.kartuAjar;
  var done = qDone && urut.correct;
  root.innerHTML =
    head('ahli') +
    buildTeacherNote(d.guru) +
    buildDlPanel(
      '<p style="margin:0;">' +
        d.pengantar +
        '</p><p class="expert-badge">Topikmu: <strong>' +
        topik.ikon +
        ' ' +
        esc(topik.label) +
        '</strong></p>'
    ) +
    buildDlPanel(
      '<h3>📖 ' +
        esc(materi.judul) +
        '</h3>' +
        materi.materi
          .map(function (p) {
            return '<p>' + p + '</p>';
          })
          .join('') +
        buildRelasiDiagram(materi.rel) +
        buildFeedbackBox('info', '🔎', '<strong>Ciri khas:</strong> ' + esc(materi.ciri))
    ) +
    buildDlPanel('<h3>① Diskusikan di meja ahli</h3>' + guidedList(key)) +
    (qDone
      ? buildDlPanel(
          '<h3>② Susun kartu ajar</h3><p>' +
            d.kartuAjar.pengantar +
            '</p>' +
            buildTapOrder('kartuAjar', d.kartuAjar.langkah, urut, {
              answer: d.kartuAjar.urutan,
              startLabel: 'Langkah pertama',
              endLabel: 'Langkah terakhir',
              successText:
                '<strong>Kartu ajarmu siap!</strong> Pakai langkah ini saat mengajari tim asal di tahap berikutnya.',
              wrongText:
                'Kartu bertanda merah belum tepat. Ingat: aturan dibaca dulu, lalu minimum, maksimum, baru jenis relasi.',
            })
        )
      : '') +
    (done ? nextButton('ahli') : '');
  bindGuided(root, key);
  if (qDone) bindTapOrder(root, 'kartuAjar', urut, d.kartuAjar.urutan, store.save, rerender);
  bindNextButton(root, 'ahli');
}

/* ============================================================
   11. STAGE: DISKUSI TIM (Jigsaw — kelompok asal)
   ============================================================ */

/* Kartu ringkas tiga topik ahli; topik murid ini dibuka & ditandai. */
function kartuRingkasAhli() {
  return D.kelompok.topik
    .map(function (t) {
      var m = D.ahli.topik[t.id];
      var milikku = State.topikAhli === t.id;
      return (
        '<details class="expert-card"' +
        (milikku ? ' open' : '') +
        '><summary><span aria-hidden="true">' +
        t.ikon +
        '</span> ' +
        esc(t.label) +
        (milikku ? ' <span class="expert-card__mine">topikmu — ajarkan!</span>' : '') +
        '</summary>' +
        '<p>' +
        esc(m.ciri) +
        '</p>' +
        buildRelasiDiagram(m.rel) +
        '</details>'
      );
    })
    .join('');
}

function renderDiskusi(root) {
  var d = D.diskusi;
  var items = d.aturan;
  var states = State.sorts.aturan;
  var n = items.filter(function (it) {
    return states[it.id].chosen;
  }).length;
  var done = sortItemsAllAnswered(items, states);
  root.innerHTML =
    head('diskusi') +
    buildTeacherNote(d.guru) +
    buildDlPanel('<p style="margin:0;">' + d.pengantar + '</p>') +
    buildDlPanel('<h3>🧑‍🏫 Kartu ringkas para ahli</h3>' + kartuRingkasAhli()) +
    buildDlPanel(
      '<h3>🗂️ Pilah aturan bisnis Sistem Ekskul</h3>' +
        '<p class="sort-counter" aria-live="polite"><strong>' +
        n +
        '</strong> dari ' +
        items.length +
        ' sudah dipilah</p>' +
        buildSortItems(items, State.sortOrders.aturan, d.kategori, states)
    ) +
    (done
      ? buildDlPanel(
          '<h3>💡 Temuan tim</h3><p style="margin:0;">' + d.temuan + '</p>',
          'panel--success'
        )
      : '') +
    (done ? nextButton('diskusi') : '');
  bindSortItems(root, items, states, store.save, rerender);
  bindNextButton(root, 'diskusi');
}

/* ============================================================
   12. STAGE: RANCANG ERD
   ============================================================ */

function renderRancang(root) {
  var d = D.rancang;
  var kDone = kardinalitasSelesai(d.relasi, State.kardinalitas);
  var done = kDone && guidedDone('rancang');
  var tuntas = d.relasi.filter(function (rel) {
    var st = State.kardinalitas[rel.id];
    return st.ab.chosen === rel.ab && st.ba.chosen === rel.ba;
  }).length;
  root.innerHTML =
    head('rancang') +
    buildTeacherNote(d.guru) +
    buildDlPanel('<p style="margin:0;">' + d.pengantar + '</p>') +
    buildDlPanel(
      '<h3>① Tentukan kardinalitas setiap relasi</h3>' +
        '<p class="sort-counter" aria-live="polite"><strong>' +
        tuntas +
        '</strong> dari ' +
        d.relasi.length +
        ' relasi sudah tuntas</p>' +
        d.relasi
          .map(function (rel) {
            return buildKardinalitasPicker(rel, State.kardinalitas[rel.id]);
          })
          .join('')
    ) +
    (kDone ? buildDlPanel('<h3>② Wujudkan relasi M:N</h3>' + guidedList('rancang')) : '') +
    (done
      ? buildDlPanel(
          '<h3>🧩 ERD Ekskul tim</h3><p style="margin:0;">' + d.simpulan + '</p>',
          'panel--success'
        )
      : '') +
    (done ? nextButton('rancang') : '');
  bindKardinalitasPicker(root, d.relasi, State.kardinalitas, store.save, rerender);
  if (kDone) bindGuided(root, 'rancang');
  bindNextButton(root, 'rancang');
}

/* ============================================================
   13. STAGE: EVALUASI
   ============================================================ */

function renderEvaluasi(root) {
  var d = D.evaluasi;
  var u = d.ujiSilang;
  var st = State.multi.ujiSilang;
  var kDone = kuisDone('jawabEval');
  var s = skorEvaluasi();
  var done = kDone && st.done;
  root.innerHTML =
    head('evaluasi') +
    buildTeacherNote(d.guru) +
    buildDlPanel('<p style="margin:0;">' + d.pengantarKuis + '</p>') +
    buildDlPanel(kuisCounter('jawabEval') + kuisList('jawabEval')) +
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
          '<p>' +
            u.pengantar +
            '</p>' +
            u.relasi
              .map(function (rel) {
                return (
                  '<div class="cross-check">' +
                  '<p class="kard-picker__rule">📜 ' +
                  esc(rel.aturan) +
                  '</p>' +
                  buildRelasiDiagram(rel, { ab: rel.timAb, ba: rel.timBa }) +
                  '</div>'
                );
              })
              .join('') +
            '<h3>🔍 Temukan kesalahannya</h3><p>' +
            u.tanya +
            '</p>' +
            buildMultiSelect('ujiSilang', u.opsi, st, { done: u.done })
        )
      : '') +
    (done ? nextButton('evaluasi') : '');
  bindKuis(root, 'jawabEval');
  if (kDone) bindMultiSelect(root, 'ujiSilang', u.opsi, st, store.save, rerender);
  bindNextButton(root, 'evaluasi');
}

/* ============================================================
   14. STAGE: PENGHARGAAN (poin peningkatan & predikat tim)
   ============================================================ */

function renderPenghargaan(root) {
  var d = D.penghargaan;
  var dasar = skorDasar().nilai;
  var akhir = skorEvaluasi().nilai;
  var poin = poinSaya();
  var teman = d.jumlahAnggota - 1;
  var nilaiTim = [poin].concat(State.poinTim.slice(0, teman));
  var rata = rataPoinTim(nilaiTim);
  var pred = predikatTim(rata);
  var pilihanPoin = ['', 5, 10, 20, 30];

  var isian = '';
  for (var i = 0; i < teman; i++) {
    var v = State.poinTim[i] === undefined ? '' : String(State.poinTim[i]);
    isian +=
      '<div class="field-group"><label class="input-label" for="poinTim' +
      i +
      '">Anggota ' +
      (i + 2) +
      '</label><select class="input-select" id="poinTim' +
      i +
      '" data-poin-index="' +
      i +
      '">' +
      pilihanPoin
        .map(function (p) {
          var val = String(p);
          return (
            '<option value="' +
            val +
            '"' +
            (val === v ? ' selected' : '') +
            '>' +
            (p === '' ? '— belum diisi —' : p + ' poin') +
            '</option>'
          );
        })
        .join('') +
      '</select></div>';
  }

  root.innerHTML =
    head('penghargaan') +
    buildTeacherNote(d.guru) +
    buildDlPanel('<p style="margin:0;">' + d.pengantar + '</p>') +
    buildDlPanel(
      '<h3>⭐ Poin peningkatanmu</h3>' +
        '<div class="reward-grid">' +
        '<div class="reward-stat"><span class="reward-stat__label">Skor dasar (kuis awal)</span><span class="reward-stat__value">' +
        dasar +
        '</span></div>' +
        '<div class="reward-stat"><span class="reward-stat__label">Nilai evaluasi</span><span class="reward-stat__value">' +
        akhir +
        '</span></div>' +
        '<div class="reward-stat reward-stat--accent"><span class="reward-stat__label">Poin peningkatan</span><span class="reward-stat__value">' +
        poin +
        '</span></div>' +
        '</div>' +
        '<div class="mini-table-wrap" tabindex="0" role="region" aria-label="Aturan poin peningkatan">' +
        '<table class="mini-table"><thead><tr><th scope="col">Nilai evaluasi dibanding skor dasar</th><th scope="col">Poin</th></tr></thead><tbody>' +
        d.aturanPoin
          .map(function (a) {
            return (
              '<tr' +
              (a.poin === poin ? ' class="is-mine"' : '') +
              '><td>' +
              esc(a.syarat) +
              '</td><td>' +
              a.poin +
              '</td></tr>'
            );
          })
          .join('') +
        '</tbody></table></div>'
    ) +
    buildDlPanel(
      '<h3>🏅 Hitung predikat tim</h3>' +
        '<p>Masukkan poin peningkatan teman satu timmu. Poinmu (Anggota 1) sudah terisi: <strong>' +
        poin +
        '</strong>.</p>' +
        '<div class="reward-inputs">' +
        isian +
        '</div>' +
        '<div class="reward-badge" aria-live="polite"><span class="reward-badge__icon" aria-hidden="true">' +
        pred.ikon +
        '</span><div><span class="reward-badge__label">' +
        esc(pred.label) +
        ' — rata-rata ' +
        rata +
        ' poin</span><span>' +
        esc(pred.pesan) +
        '</span></div></div>' +
        '<p class="muted-note">Predikat: Tim Baik ≥ 15, Tim Hebat ≥ 20, Tim Super ≥ 25 poin rata-rata.</p>'
    ) +
    buildDlPanel('<h3>📌 Rangkuman</h3>' + listHtml(d.rangkuman), 'panel--success') +
    nextButton('penghargaan');

  root.querySelectorAll('[data-poin-index]').forEach(function (sel) {
    sel.addEventListener('change', function () {
      var i = parseInt(sel.dataset.poinIndex, 10);
      State.poinTim[i] = sel.value === '' ? '' : parseInt(sel.value, 10);
      store.save();
      rerender();
    });
  });
  bindNextButton(root, 'penghargaan');
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

function guidedScore(key) {
  return { benar: firstTryCount(GUIDED[key]), total: GUIDED[key].length };
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

function hitungSkor() {
  var ahliKey = 'ahli-' + (State.topikAhli || D.kelompok.topik[0].id);
  var urut = State.kartuAjar;
  return [
    { label: 'Info kunci — cek paham', skor: guidedScore('informasi') },
    { label: 'Bentuk tim — norma kerja', skor: multiScore('norma') },
    {
      label: 'Tim ahli — pertanyaan & kartu ajar',
      skor: sum([
        guidedScore(ahliKey),
        { benar: urut.correct && urut.attempts === 1 ? 1 : 0, total: 1 },
      ]),
    },
    {
      label: 'Diskusi tim — pilah aturan bisnis',
      skor: nilaiPemilahan(D.diskusi.aturan, State.sorts.aturan),
    },
    {
      label: 'Rancang ERD — kardinalitas & entitas penghubung',
      skor: sum([skorKardinalitas(D.rancang.relasi, State.kardinalitas), guidedScore('rancang')]),
    },
    { label: 'Evaluasi — kuis individu', skor: skorEvaluasi() },
    { label: 'Evaluasi — uji silang ERD', skor: multiScore('ujiSilang') },
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
    '<span class="done-panel__icon" aria-hidden="true">🏆</span>' +
    '<p class="done-panel__score">' +
    total.benar +
    ' / ' +
    total.total +
    '</p>' +
    '<p class="done-panel__pct">' +
    pct +
    '% benar pada percobaan pertama · poin peningkatanmu ' +
    poinSaya() +
    '</p>' +
    '<p style="margin:0;">' +
    d.pesan +
    '</p>' +
    '</div>' +
    buildDlPanel(
      '<h3>📊 Rincian skor</h3><ul class="score-list">' +
        '<li class="score-list__item"><span class="score-list__label">Kuis awal (skor dasar, tidak dijumlahkan)</span><span class="score-list__value">' +
        skorDasar().benar +
        ' / ' +
        skorDasar().total +
        '</span></li>' +
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
      '<h3>🧩 ERD Sistem Ekskul</h3>' +
        D.rancang.relasi
          .map(function (rel) {
            return buildRelasiDiagram(rel);
          })
          .join('')
    ) +
    buildDlPanel('<h3>📌 Ingat kembali</h3>' + listHtml(D.penghargaan.rangkuman)) +
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
  kuisAwal: renderKuisAwal,
  informasi: renderInformasi,
  kelompok: renderKelompok,
  ahli: renderAhli,
  diskusi: renderDiskusi,
  rancang: renderRancang,
  evaluasi: renderEvaluasi,
  penghargaan: renderPenghargaan,
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
