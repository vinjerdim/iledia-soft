'use strict';

/* ============================================================
   app.js — perakitan materi 1.2  (DIMUAT PALING AKHIR)
   ============================================================
   Urutan <script> di index.html wajib:
     1. ../../shared/engine.js
     2. data.js
     3. app-core.js
     4. app-stage-awal.js    (orientasi, masalah, bekal)
     5. app-stage-inti.js    (telusur, saring, atribut)
     6. app-stage-hasil.js   (sajikan, evaluasi)
     7. app-stage-akhir.js   (refleksi, selesai)
     8. app.js               ← berkas ini

   Berkas ini merujuk fungsi render* saat menyusun daftar tahap,
   jadi seluruh berkas tahap harus sudah dimuat lebih dulu.
   ============================================================ */

var STAGE_DEFS = [
  { id: 'orientasi', label: 'Orientasi', render: 'renderOrientasi' },
  { id: 'masalah', label: 'Masalah', render: 'renderMasalah' },
  { id: 'bekal', label: 'Bekal Analisis', render: 'renderBekal' },
  { id: 'telusur', label: 'Telusur Dokumen', render: 'renderTelusur' },
  { id: 'saring', label: 'Saring Kandidat', render: 'renderSaring' },
  { id: 'atribut', label: 'Petakan Atribut', render: 'renderAtribut' },
  { id: 'sajikan', label: 'Sajikan Hasil', render: 'renderSajikan' },
  { id: 'evaluasi', label: 'Evaluasi', render: 'renderEvaluasi' },
  { id: 'refleksi', label: 'Refleksi', render: 'renderRefleksi' },
  { id: 'selesai', label: 'Selesai', render: 'renderSelesai' }
];

/* Berkas tahap yang lupa didaftarkan di index.html akan gagal tanpa
   pesan apa pun, dan baru terasa saat murid sampai ke tahap itu.
   Lebih baik berhenti sekarang dengan pesan yang jelas. */
(function guardStages() {
  var hilang = STAGE_DEFS.filter(function (s) {
    return typeof window[s.render] !== 'function';
  });
  if (!hilang.length) return;
  var el = document.getElementById('stageContainer');
  if (el) {
    el.innerHTML =
      '<div class="panel panel--error">' +
      '<h3>Berkas tahap belum termuat</h3>' +
      '<p>Fungsi berikut tidak ditemukan: <code>' +
      hilang
        .map(function (s) {
          return Engine.esc(s.render);
        })
        .join('</code>, <code>') +
      '</code></p>' +
      '<p>Periksa daftar &lt;script&gt; pada <code>index.html</code>.</p>' +
      '</div>';
  }
  throw new Error('Renderer tahap tidak ditemukan: ' + hilang.map(function (s) { return s.render; }).join(', '));
})();

var lesson = Engine.createLesson({
  storageKey: 'mpi-f-1-2-v1',

  stages: STAGE_DEFS.map(function (s) {
    return { id: s.id, label: s.label, render: window[s.render] };
  }),

  lockedNotice: function (label) {
    return 'Selesaikan dulu tahap ' + label + ' untuk membukanya.';
  },

  createState: function () {
    return {
      currentStage: 'orientasi',
      completedStages: {},

      /* Rumah bagi seluruh urutan acak. Dikosongkan saat reset,
         sehingga pilihan jawaban teracak ulang. Lihat lesson.order(). */
      shuffles: {},

      /* Tahap 2 — Orientasi pada masalah */
      masalah: {
        picked: [],
        question: '',
        checked: false,
        correct: 0
      },

      /* Tahap 3 — Bekal analisis */
      bekal: {
        opened: mapFrom(DATA.bekal.cards, function () {
          return { seen: false };
        }),
        match: {
          pairs: {},
          selectedTermId: null,
          checked: false,
          correct: 0
        }
      },

      /* Tahap 4 — Telusur dokumen */
      telusur: {
        marked: {},
        revealed: false,
        lastFeedback: null
      },

      /* Tahap 5 — Saring kandidat */
      saring: {
        assignments: {},
        selectedId: null,
        checked: false,
        correct: 0
      },

      /* Tahap 6 — Petakan atribut */
      atribut: {
        assignments: {},
        selectedId: null,
        checkedChips: false,
        keys: mapFrom(DATA.atribut.entities, function () {
          return { pick: null };
        }),
        checkedKeys: false,
        usulan: [],
        checkedUsulan: false,
        score: { chips: 0, keys: 0, usulan: 0 }
      },

      /* Tahap 7 — Sajikan hasil karya */
      sajikan: {
        cases: mapFrom(DATA.sajikan.cases, function () {
          return { prediction: null, revealed: false, correct: false };
        }),
        justif: ''
      },

      /* Tahap 8 — Evaluasi */
      evaluasi: {
        answers: {},
        checked: false,
        correct: 0,
        conclusion: ''
      },

      /* Tahap 9 — Refleksi */
      refleksi: {
        likert: mapFrom(DATA.refleksi.skalaItems, function () {
          return { value: null };
        }),
        prompts: mapFrom(DATA.refleksi.prompts, function () {
          return { text: '' };
        }),
        submitted: false
      },

      /* Tahap 10 — Selesai */
      score: {
        masalah: { correct: 0, total: 0 },
        bekal: { correct: 0, total: 0 },
        saring: { correct: 0, total: 0 },
        atribut: { correct: 0, total: 0 },
        sajikan: { correct: 0, total: 0 },
        evaluasi: { correct: 0, total: 0 }
      }
    };
  },

  onResetClick: function () {
    if (!Engine.confirmAction(DATA.selesai.ulangKonfirmasi)) return;
    lesson.resetProgress();
    Engine.showNotice('Progres dihapus. Pilihan jawaban sudah diacak ulang.');
  }
});

/* Dideklarasikan dengan var (bukan const) agar menjadi global dan dapat
   dipakai berkas app-stage-*.js yang dimuat lebih dulu. */
var State = lesson.state;
var saveState = lesson.saveState;
var navigateTo = lesson.navigateTo;
var completeStage = lesson.completeStage;
var order = lesson.order;
var orderItems = lesson.orderItems;

/* Id ganda membuat satu pilihan hilang diam-diam dari daftar teracak. */
assertUniqueIds(DATA.masalah.statements, 'masalah.statements');
assertUniqueIds(DATA.bekal.cards, 'bekal.cards');
assertUniqueIds(DATA.bekal.terms, 'bekal.terms');
assertUniqueIds(DATA.bekal.defs, 'bekal.defs');
assertUniqueIds(DATA.saring.chips, 'saring.chips');
assertUniqueIds(DATA.saring.buckets, 'saring.buckets');
assertUniqueIds(DATA.atribut.chips, 'atribut.chips');
assertUniqueIds(DATA.atribut.entities, 'atribut.entities');
assertUniqueIds(DATA.atribut.usulan, 'atribut.usulan');
assertUniqueIds(DATA.sajikan.cases, 'sajikan.cases');
DATA.sajikan.cases.forEach(function (c) {
  assertUniqueIds(c.options, 'sajikan.' + c.id + '.options');
});
assertUniqueIds(DATA.evaluasi.questions, 'evaluasi.questions');
DATA.evaluasi.questions.forEach(function (q) {
  assertUniqueIds(q.options, 'evaluasi.' + q.id + '.options');
});
assertUniqueIds(DATA.refleksi.skalaItems, 'refleksi.skalaItems');
assertUniqueIds(DATA.refleksi.prompts, 'refleksi.prompts');

/* Token dokumen juga wajib berid unik: id-nya dipakai sebagai kunci
   tanda pada State.telusur.marked. */
(function assertTokens() {
  var tokens = [];
  DATA.telusur.doc.sections.forEach(function (sec) {
    (sec.paras || []).forEach(function (para) {
      para.forEach(function (part) {
        if (part.id) tokens.push(part);
      });
    });
    (sec.reqs || []).forEach(function (req) {
      req.parts.forEach(function (part) {
        if (part.id) tokens.push(part);
      });
    });
  });
  assertUniqueIds(tokens, 'telusur.doc tokens');
})();

lesson.init();
