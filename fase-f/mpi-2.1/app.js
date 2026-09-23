'use strict';

/* ============================================================
   app.js — perakitan materi 2.1  (DIMUAT PALING AKHIR)
   ============================================================
   Urutan <script> di index.html wajib:
     1. ../../shared/engine.js
     2. data.js
     3. app-core.js
     4. app-stage-awal.js    (orientasi, stimulasi, masalah)
     5. app-stage-inti.js    (konsep, olah, uji)
     6. app-stage-akhir.js   (simpulan, refleksi, selesai)
     7. app.js               ← berkas ini

   Berkas ini merujuk fungsi render* saat menyusun daftar tahap,
   jadi seluruh berkas tahap harus sudah dimuat lebih dulu.
   ============================================================ */

var STAGE_DEFS = [
  { id: 'orientasi', label: 'Orientasi', render: 'renderOrientasi' },
  { id: 'stimulasi', label: 'Stimulasi', render: 'renderStimulasi' },
  { id: 'masalah', label: 'Rumusan Masalah', render: 'renderMasalah' },
  { id: 'konsep', label: 'Pengumpulan Data', render: 'renderKonsep' },
  { id: 'olah', label: 'Pengolahan Data', render: 'renderOlah' },
  { id: 'uji', label: 'Verifikasi', render: 'renderUji' },
  { id: 'simpulan', label: 'Generalisasi', render: 'renderSimpulan' },
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
  storageKey: 'mpi-f-2-1-v1',

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

      /* Tahap 2 — Stimulasi */
      stimulasi: {
        flagged: {},
        missed: {},
        revealed: false,
        lastFeedback: null,
        picked: [],
        checked: false,
        correct: 0
      },

      /* Tahap 3 — Rumusan masalah */
      masalah: {
        answer: null,
        checked: false,
        attempted: false,
        question: ''
      },

      /* Tahap 4 — Pengumpulan data */
      konsep: {
        opened: mapFrom(DATA.konsep.cards, function () {
          return { seen: false };
        }),
        match: {
          pairs: {},
          selectedTermId: null,
          checked: false,
          correct: 0
        }
      },

      /* Tahap 5 — Pengolahan data */
      olah: {
        fungsi: { assignments: {}, selectedId: null, checked: false, correct: 0 },
        bahasa: { assignments: {}, selectedId: null, checked: false, correct: 0 }
      },

      /* Tahap 6 — Verifikasi */
      uji: {
        cases: mapFrom(DATA.uji.cases, function () {
          return { prediction: null, revealed: false, correct: false };
        })
      },

      /* Tahap 7 — Generalisasi */
      simpulan: {
        picked: [],
        checked: false,
        correct: 0,
        conclusion: '',
        answers: {},
        kuisChecked: false,
        kuisCorrect: 0
      },

      /* Tahap 8 — Refleksi */
      refleksi: {
        likert: mapFrom(DATA.refleksi.skalaItems, function () {
          return { value: null };
        }),
        prompts: mapFrom(DATA.refleksi.prompts, function () {
          return { text: '' };
        }),
        submitted: false
      },

      /* Tahap 9 — Selesai */
      score: {
        stimulasi: { correct: 0, total: 0 },
        masalah: { correct: 0, total: 0 },
        konsep: { correct: 0, total: 0 },
        olah: { correct: 0, total: 0 },
        uji: { correct: 0, total: 0 },
        simpulan: { correct: 0, total: 0 },
        kuis: { correct: 0, total: 0 }
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
assertUniqueIds(DATA.stimulasi.jenis, 'stimulasi.jenis');
assertUniqueIds(DATA.stimulasi.files, 'stimulasi.files');
DATA.stimulasi.files.forEach(function (f) {
  assertUniqueIds(f.rows, 'stimulasi.' + f.id + '.rows');
  assertUniqueIds(f.columns, 'stimulasi.' + f.id + '.columns');
});
assertUniqueIds(DATA.masalah.options, 'masalah.options');
assertUniqueIds(DATA.konsep.cards, 'konsep.cards');
assertUniqueIds(DATA.konsep.terms, 'konsep.terms');
assertUniqueIds(DATA.konsep.defs, 'konsep.defs');
assertUniqueIds(DATA.olah.fungsiColumns, 'olah.fungsiColumns');
assertUniqueIds(DATA.olah.fungsiChips, 'olah.fungsiChips');
assertUniqueIds(DATA.olah.bahasaColumns, 'olah.bahasaColumns');
assertUniqueIds(DATA.olah.bahasaChips, 'olah.bahasaChips');
assertUniqueIds(DATA.uji.cases, 'uji.cases');
DATA.uji.cases.forEach(function (c) {
  assertUniqueIds(c.options, 'uji.' + c.id + '.options');
});
assertUniqueIds(DATA.simpulan.statements, 'simpulan.statements');
assertUniqueIds(DATA.simpulan.questions, 'simpulan.questions');
DATA.simpulan.questions.forEach(function (q) {
  assertUniqueIds(q.options, 'simpulan.' + q.id + '.options');
});
assertUniqueIds(DATA.refleksi.skalaItems, 'refleksi.skalaItems');
assertUniqueIds(DATA.refleksi.prompts, 'refleksi.prompts');

/* Kedua papan chip di tahap 5 tampil pada halaman yang sama, dan
   id chip/kolom dipakai sebagai selektor [data-chip]/[data-drop].
   Id yang sama di kedua papan akan membuat fokus salah sasaran. */
assertUniqueIds(
  DATA.olah.fungsiChips.concat(DATA.olah.bahasaChips, DATA.olah.fungsiColumns, DATA.olah.bahasaColumns),
  'olah (gabungan papan A & B)'
);

/* Setiap sel bermasalah harus menunjuk sel yang benar-benar ada. */
Object.keys(DATA.stimulasi.problemCells).forEach(function (key) {
  var p = key.split(':');
  var f = findById(DATA.stimulasi.files, p[0]);
  if (!f || !findById(f.rows, p[1]) || !findById(f.columns, p[2])) {
    console.error('stimulasi.problemCells menunjuk sel yang tidak ada: ' + key);
  }
});

lesson.init();
