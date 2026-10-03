'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Rekayasa Perangkat Lunak: Merancang ERD Lengkap Berdasarkan
   Hasil Analisis Kebutuhan Data Studi Kasus
   Fase F — SMK Rekayasa Perangkat Lunak, Cooperative Learning

   Utilitas & komponen bersama berada di shared/engine.js:
     • mesin tahap & store (createStageMachine, createStore);
     • komponen umum (ensureShuffledOrder, buildDiscoveryHead,
       buildTeacherNote, buildChoiceGroup, buildTpPanel,
       buildGuidedQuizList, ensureSortStates, buildSortItems,
       ensureTapOrderState, buildTapOrder, ensureMultiState,
       buildMultiSelect, buildLikertGroup);
     • seksi 12 — analisis kebutuhan data (buildDokumenKebutuhan,
       daftarFrasa, nilaiPemilahan, buildEntityCard);
     • seksi 13 — relasi & kardinalitas ERD (buildRelasiDiagram,
       ensureKardinalitasState, buildKardinalitasPicker,
       skorKardinalitas);
     • seksi 14 — kerja kelompok kooperatif (buildPeranKelompok,
       buildKuisSekali, skorKuis, poinPeningkatan, rataPoinTim,
       predikatTim);
     • seksi 15 — ERD lengkap (buildErdLengkap, erdEntitas).

   Alur tahap mengikuti sintaks Cooperative Learning (Jigsaw,
   Dua Tinggal Dua Tamu, poin peningkatan STAD); lihat komentar
   kepala data.js.

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
   11. Stage: Bedah Kebutuhan      (CL sintaks 4 — tim asal)
   12. Stage: Rakit Entitas        (CL sintaks 4)
   13. Stage: Rakit Relasi         (CL sintaks 4)
   14. Stage: Evaluasi             (CL sintaks 5)
   15. Stage: Penghargaan          (CL sintaks 6)
   16. Stage: Refleksi
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
var STORAGE_KEY = 'mpi-f-1-3-erd-cl-v1';

/* Pertanyaan penuntun (boleh dicoba ulang), untuk pengacakan & skor. */
var GUIDED = {
  informasi: D.informasi.pertanyaan,
  kunci: D.rancang.kunci,
  relasi: D.relasi.pertanyaan,
};
D.kelompok.topik.forEach(function (t) {
  GUIDED['ahli-' + t.id] = D.ahli.topik[t.id].pertanyaan;
});

/* Kuis sekali-jawab: key State jawaban → daftar soal. */
var KUIS = {
  jawabAwal: D.kuisAwal.soal,
  jawabEval: D.evaluasi.soal,
};

/* Pemilahan: key State → { items, kategori }. */
var SORTS = {
  frasa: { items: D.analisis.frasa, kategori: D.analisis.kategori },
  atribut: {
    items: D.rancang.atribut,
    kategori: D.rancang.entitas.map(function (id) {
      var e = erdEntitas(D.erd, id);
      return { id: e.id, label: e.ikon + ' ' + e.label };
    }),
  },
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

  /* Info kunci — urut-ketuk langkah merancang ERD */
  langkahErd: null,

  /* Multi-pilih: norma tim, uji silang */
  multi: {},

  /* Bentuk tim */
  peranNama: {},
  topikAhli: null,

  /* Pemilahan: frasa dokumen kebutuhan, atribut ke entitas */
  sorts: {},
  sortOrders: {},

  /* Rakit relasi — pemilih kardinalitas per relasi */
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

  ensureTapOrderState(State, 'langkahErd', D.informasi.langkah.items, D.informasi.langkah.urutan);

  ensureMultiState(State.multi, 'norma', D.kelompok.norma.opsi);
  ensureMultiState(State.multi, 'ujiSilang', D.evaluasi.ujiSilang.opsi);

  Object.keys(SORTS).forEach(function (k) {
    var tmp = { s: State.sorts[k], o: State.sortOrders[k] };
    ensureSortStates(tmp, 's', 'o', SORTS[k].items, SORTS[k].kategori);
    State.sorts[k] = tmp.s;
    State.sortOrders[k] = tmp.o;
  });

  ensureKardinalitasState(State, 'kardinalitas', D.relasi.relasi);
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
    'data-tap-back',
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

function kuisCounter(key) {
  var n = KUIS[key].filter(function (q) {
    return !!State[key][q.id];
  }).length;
  return counter(n, KUIS[key].length, 'soal sudah dijawab');
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

/* Contoh visual: ERD mini bila ada entitas, selain itu diagram relasi. */
function contohVisual(contoh, judul) {
  if (contoh.entitas.length) {
    return buildErdLengkap(contoh, { judul: judul, relasi: contoh.relasi.length > 0 });
  }
  return contoh.relasi
    .map(function (rel) {
      return buildRelasiDiagram(rel);
    })
    .join('');
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
  var urut = State.langkahErd;
  var done = urut.correct && guidedDone('informasi');
  root.innerHTML =
    head('informasi') +
    buildTeacherNote(d.guru) +
    buildDlPanel('<p style="margin:0;">' + d.pengantar + '</p>') +
    buildDlPanel(
      '<h3>🧩 Komponen ERD lengkap</h3>' +
        '<div class="mini-table-wrap" tabindex="0" role="region" aria-label="Tabel komponen ERD">' +
        '<table class="mini-table"><thead><tr><th scope="col">Komponen</th><th scope="col">Notasi Chen</th><th scope="col">Di media ini</th><th scope="col">Contoh</th></tr></thead><tbody>' +
        d.komponen
          .map(function (k) {
            return (
              '<tr><th scope="row">' +
              esc(k.nama) +
              '</th><td>' +
              esc(k.simbol) +
              '</td><td>' +
              esc(k.media) +
              '</td><td><code>' +
              esc(k.contoh) +
              '</code></td></tr>'
            );
          })
          .join('') +
        '</tbody></table></div>'
    ) +
    buildDlPanel(contohVisual(d.contoh, d.contohJudul)) +
    buildDlPanel(
      '<h3>① Susun langkah merancang ERD</h3><p>' +
        d.langkah.pengantar +
        '</p>' +
        buildTapOrder('langkahErd', d.langkah.items, urut, {
          answer: d.langkah.urutan,
          startLabel: 'Langkah pertama',
          endLabel: 'Langkah terakhir',
          successText:
            '<strong>Urutan tepat!</strong> Langkah ini menjadi peta kerja tim di tahap Rakit Entitas dan Rakit Relasi.',
          wrongText:
            'Kartu bertanda merah belum tepat. Ingat: entitas dulu, lalu isinya, baru sambungannya.',
        })
    ) +
    buildDlPanel('<h3>② Cek paham bersama tim</h3>' + guidedList('informasi')) +
    (done ? nextButton('informasi') : '');
  bindTapOrder(root, 'langkahErd', urut, d.langkah.urutan, store.save, rerender);
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
        '<p>Sepakati bersama tim: setiap komponen harus punya satu ahli.</p>' +
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
  var done = guidedDone(key);
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
        contohVisual(materi.contoh, 'Contoh: perpustakaan') +
        buildFeedbackBox('info', '🗒️', '<strong>Kartu ajar:</strong> ' + esc(materi.ciri))
    ) +
    buildDlPanel('<h3>💬 Diskusikan di meja ahli</h3>' + guidedList(key)) +
    (done
      ? buildDlPanel(
          '<p style="margin:0;"><strong>Kamu siap mengajar!</strong> Bawa kartu ajarmu ke tim asal di tahap berikutnya.</p>',
          'panel--success'
        ) + nextButton('ahli')
      : '');
  bindGuided(root, key);
  bindNextButton(root, 'ahli');
}

/* ============================================================
   11. STAGE: BEDAH KEBUTUHAN (Jigsaw — kelompok asal)
   ============================================================ */

/* Kartu ringkas empat topik ahli; topik murid ini dibuka & ditandai. */
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
        '</details>'
      );
    })
    .join('');
}

function nomorFrasa() {
  var nomor = {};
  var n = 0;
  D.analisis.dokumen.forEach(function (dok) {
    daftarFrasa(dok.teks).forEach(function (f) {
      nomor[f.id] = ++n;
    });
  });
  return nomor;
}

function renderAnalisis(root) {
  var d = D.analisis;
  var nomor = nomorFrasa();
  var done = sortDone('frasa');
  root.innerHTML =
    head('analisis') +
    buildTeacherNote(d.guru) +
    buildDlPanel('<p style="margin:0;">' + d.pengantar + '</p>') +
    buildDlPanel('<h3>🧑‍🏫 Kartu ringkas para ahli</h3>' + kartuRingkasAhli()) +
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
        '<div class="sort-compact">' +
        sortList('frasa', {
          prefix: function (it) {
            return '<span class="req-mark__num req-mark__num--inline">' + nomor[it.id] + '</span>';
          },
        }) +
        '</div>'
    ) +
    (done
      ? buildDlPanel(
          '<h3>💡 Temuan tim</h3><p style="margin:0;">' + d.temuan + '</p>',
          'panel--success'
        )
      : '') +
    (done ? nextButton('analisis') : '');
  bindSort(root, 'frasa');
  bindNextButton(root, 'analisis');
}

/* ============================================================
   12. STAGE: RAKIT ENTITAS
   ============================================================ */

/* Kartu entitas yang terisi sesuai jawaban tim (atribut tepat & PK). */
function kartuRakitan() {
  var states = State.sorts.atribut;
  return (
    '<div class="entity-grid">' +
    D.rancang.entitas
      .map(function (id) {
        var ent = erdEntitas(D.erd, id);
        var attrs = D.rancang.atribut.filter(function (it) {
          return it.correct === id && states[it.id].chosen;
        });
        var q = D.rancang.kunci.filter(function (k) {
          return k.entitas === id;
        })[0];
        var pk = q && State.pilih[q.id] === q.correct ? q.correct : null;
        return buildEntityCard(ent, attrs, { kunci: pk, kosong: 'Belum ada atribut.' });
      })
      .join('') +
    '</div>'
  );
}

function renderRancang(root) {
  var d = D.rancang;
  var aDone = sortDone('atribut');
  var done = aDone && guidedDone('kunci');
  root.innerHTML =
    head('rancang') +
    buildTeacherNote(d.guru) +
    buildDlPanel('<p style="margin:0;">' + d.pengantar + '</p>') +
    buildDlPanel('<h3>🧱 Entitas rakitan tim</h3>' + kartuRakitan()) +
    buildDlPanel(
      '<h3>① Kelompokkan atribut ke entitas pemiliknya</h3>' +
        sortCounter('atribut') +
        '<div class="sort-compact">' +
        sortList('atribut', { mono: true }) +
        '</div>'
    ) +
    (aDone ? buildDlPanel('<h3>② Tentukan kunci primer</h3>' + guidedList('kunci')) : '') +
    (done
      ? buildDlPanel(
          '<h3>💡 Entitas siap</h3><p style="margin:0;">' + d.simpulan + '</p>',
          'panel--success'
        )
      : '') +
    (done ? nextButton('rancang') : '');
  bindSort(root, 'atribut');
  if (aDone) bindGuided(root, 'kunci');
  bindNextButton(root, 'rancang');
}

/* ============================================================
   13. STAGE: RAKIT RELASI → ERD LENGKAP
   ============================================================ */

function renderRelasi(root) {
  var d = D.relasi;
  var kDone = kardinalitasSelesai(d.relasi, State.kardinalitas);
  var done = kDone && guidedDone('relasi');
  var tuntas = d.relasi.filter(function (rel) {
    var st = State.kardinalitas[rel.id];
    return st.ab.chosen === rel.ab && st.ba.chosen === rel.ba;
  }).length;
  root.innerHTML =
    head('relasi') +
    buildTeacherNote(d.guru) +
    buildDlPanel('<p style="margin:0;">' + d.pengantar + '</p>') +
    buildDlPanel(
      '<h3>① Tentukan kardinalitas setiap relasi</h3>' +
        counter(tuntas, d.relasi.length, 'relasi sudah tuntas') +
        d.relasi
          .map(function (rel) {
            return buildKardinalitasPicker(rel, State.kardinalitas[rel.id]);
          })
          .join('')
    ) +
    (kDone
      ? buildDlPanel('<h3>② Sambungkan dengan kunci tamu & pecah M:N</h3>' + guidedList('relasi'))
      : '') +
    (done
      ? buildDlPanel(
          '<h3>🧩 ERD lengkap tim</h3>' +
            buildErdLengkap(D.erd, { judul: 'ERD Sistem Peminjaman Alat Lab RPL' }) +
            '<p style="margin:0;">' +
            d.simpulan +
            '</p>',
          'panel--success'
        )
      : '') +
    (done ? nextButton('relasi') : '');
  bindKardinalitasPicker(root, d.relasi, State.kardinalitas, store.save, rerender);
  if (kDone) bindGuided(root, 'relasi');
  bindNextButton(root, 'relasi');
}

/* ============================================================
   14. STAGE: EVALUASI
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
            buildErdLengkap(u.erd, { judul: 'ERD Bank Sampah — Tim Merah' }) +
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
   15. STAGE: PENGHARGAAN (poin peningkatan & predikat tim)
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
  var ta = root.querySelector('#refleksiTeks');
  ta.addEventListener('input', function () {
    State.refleksiTeks = ta.value;
    store.save();
  });
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
  var urut = State.langkahErd;
  return [
    {
      label: 'Info kunci — langkah merancang & cek paham',
      skor: sum([
        { benar: urut.correct && urut.attempts === 1 ? 1 : 0, total: 1 },
        guidedScore('informasi'),
      ]),
    },
    { label: 'Bentuk tim — norma kerja', skor: multiScore('norma') },
    { label: 'Tim ahli — pertanyaan meja ahli', skor: guidedScore(ahliKey) },
    {
      label: 'Bedah kebutuhan — pilah frasa dokumen',
      skor: nilaiPemilahan(SORTS.frasa.items, State.sorts.frasa),
    },
    {
      label: 'Rakit entitas — atribut & kunci primer',
      skor: sum([nilaiPemilahan(SORTS.atribut.items, State.sorts.atribut), guidedScore('kunci')]),
    },
    {
      label: 'Rakit relasi — kardinalitas, M:N & kunci tamu',
      skor: sum([skorKardinalitas(D.relasi.relasi, State.kardinalitas), guidedScore('relasi')]),
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
      '<h3>🧩 ERD lengkap</h3>' +
        buildErdLengkap(D.erd, { judul: 'ERD Sistem Peminjaman Alat Lab RPL' })
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
   18. ROUTER RENDER & INIT
   ============================================================ */

var RENDERERS = {
  orientasi: renderOrientasi,
  kuisAwal: renderKuisAwal,
  informasi: renderInformasi,
  kelompok: renderKelompok,
  ahli: renderAhli,
  analisis: renderAnalisis,
  rancang: renderRancang,
  relasi: renderRelasi,
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
