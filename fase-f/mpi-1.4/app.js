'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Rekayasa Perangkat Lunak: Menganalisis Konsep Normalisasi
   Basis Data (1NF, 2NF, 3NF) untuk Mengatasi Redundansi Data
   Fase F — SMK Rekayasa Perangkat Lunak, Problem Based Learning

   Utilitas & komponen bersama berada di shared/engine.js:
     • mesin tahap & store (createStageMachine, createStore);
     • komponen umum (ensureShuffledOrder, buildDiscoveryHead,
       buildTeacherNote, buildChoiceGroup, buildTpPanel,
       buildHintStack, buildHintToggle, buildGuidedQuizList,
       ensureSortStates, buildSortItems, ensureTapOrderState,
       buildTapOrder, ensureMultiState, buildMultiSelect,
       buildLikertGroup, buildPeranKelompok, buildKuisSekali);
     • seksi 16 — normalisasi (ratakanBaris, selTakAtomik,
       periksaSel, buildTabelData, bindTabelSel, buildSkemaRelasi,
       hitungRedundansi, hitungDekomposisi, proyeksiBaris).

   Alur tahap mengikuti lima sintaks Problem Based Learning; lihat
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
    6. Stage: Orientasi         (PBL sintaks 1)
    7. Stage: Masalah Koperasi  (PBL sintaks 1)
    8. Stage: Atur Tim          (PBL sintaks 2)
    9. Stage: Bekal Konsep      (PBL sintaks 3)
   10. Stage: Selidiki 1NF      (PBL sintaks 3)
   11. Stage: Ketergantungan    (PBL sintaks 3)
   12. Stage: Pecah 2NF & 3NF   (PBL sintaks 4)
   13. Stage: Sajikan Hasil     (PBL sintaks 4)
   14. Stage: Evaluasi          (PBL sintaks 5)
   15. Stage: Refleksi          (PBL sintaks 5)
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
var STORAGE_KEY = 'mpi-f-1-4-normalisasi-pbl-v1';

/* Tabel penjualan bentuk 1NF: grup berulang dipecah menjadi baris. */
var TABEL_1NF = {
  id: 'penjualan',
  label: 'Penjualan (1NF)',
  kolom: D.rekap.kolom,
  pk: D.rekap.pk,
  fd: D.rekap.fd,
  baris: ratakanBaris(D.rekap.baris),
};

/* Kunci sel spreadsheet yang tidak atomik (jawaban tahap Selidiki 1NF). */
var SEL_TAK_ATOMIK = selTakAtomik(D.rekap);

/* Pertanyaan penuntun (boleh dicoba ulang), untuk pengacakan & skor. */
var GUIDED = {
  konsep: D.konsep.pertanyaan,
  nf1: D.nf1.pertanyaan,
  ketergantungan: D.ketergantungan.pertanyaan,
  dek2: D.dekomposisi.pertanyaan2NF,
  dek3: D.dekomposisi.pertanyaan3NF,
};

/* Kuis sekali-jawab: key State jawaban → daftar soal. */
var KUIS = {
  jawabEval: D.evaluasi.soal,
};

/* Pemilahan: key State → { items, kategori }. */
var SORTS = {
  anomali: { items: D.masalah.anomali.items, kategori: D.masalah.anomali.kategori },
  fd: { items: D.ketergantungan.items, kategori: D.ketergantungan.kategori },
  a2: { items: D.dekomposisi.atribut2NF, kategori: D.dekomposisi.kategori2NF },
  a3: { items: D.dekomposisi.atribut3NF, kategori: D.dekomposisi.kategori3NF },
};

/* Multi-pilih berdiagnosa: key State → daftar opsi. */
var MULTI = {
  akar: D.masalah.akar.opsi,
  klaim: D.sajikan.klaim.opsi,
  ujiSilang: D.evaluasi.ujiSilang.opsi,
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

  /* Kuis evaluasi sekali-jawab */
  jawabEval: {},

  /* Pemilahan: anomali, ketergantungan, atribut 2NF & 3NF */
  sorts: {},
  sortOrders: {},

  /* Multi-pilih: akar masalah, klaim presentasi, uji silang */
  multi: {},

  /* Masalah — rumusan masalah tim */
  rumusan: '',

  /* Atur tim — peran & urut-ketuk langkah normalisasi */
  peranNama: {},
  langkah: null,

  /* Bekal konsep — petunjuk bertingkat yang sudah dibuka */
  hintKonsep: 0,

  /* Selidiki 1NF — sel yang ditandai & hasil pemeriksaannya */
  selUnf: {},
  selCek: { checked: false, done: false, attempts: 0, firstTry: null, reveal: false },

  /* Sajikan — kalimat pembuka presentasi (opsional) */
  catatanSaji: '',

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
    'peranNama',
    'selUnf',
    'likert',
  ].forEach(function (k) {
    if (!State[k] || typeof State[k] !== 'object') State[k] = {};
  });
  if (!State.selCek || typeof State.selCek !== 'object') {
    State.selCek = { checked: false, done: false, attempts: 0, firstTry: null, reveal: false };
  }

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

  Object.keys(SORTS).forEach(function (k) {
    var tmp = { s: State.sorts[k], o: State.sortOrders[k] };
    ensureSortStates(tmp, 's', 'o', SORTS[k].items, SORTS[k].kategori);
    State.sorts[k] = tmp.s;
    State.sortOrders[k] = tmp.o;
  });

  Object.keys(MULTI).forEach(function (k) {
    ensureMultiState(State.multi, k, MULTI[k]);
  });

  ensureTapOrderState(State, 'langkah', D.organisasi.langkah.items, D.organisasi.langkah.urutan);
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
    'data-sel',
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
  return buildDiscoveryHead(d.kicker, d.title, d.goal, s ? 'Problem Based Learning · ' + s : '');
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

function skemaList(tabelList) {
  return '<div class="nf-schema-list">' + tabelList.map(buildSkemaRelasi).join('') + '</div>';
}

/*
 * Skema tabel sesuai pemilahan tim: kunci primer tabel kunci ditambah
 * atribut yang dipilah murid ke tabel itu (benar maupun keliru).
 */
function skemaRakitan(hasil, key) {
  var items = SORTS[key].items;
  var states = State.sorts[key];
  return hasil.map(function (t) {
    var kolom = t.kolom.filter(function (k) {
      return t.pk.indexOf(k.id) !== -1;
    });
    items.forEach(function (it) {
      if (states[it.id].chosen !== t.id) return;
      var asli = t.kolom.filter(function (k) {
        return k.id === it.id;
      })[0];
      kolom.push(asli || { id: it.id, teks: it.teks });
    });
    return { id: t.id, label: t.label, ikon: t.ikon, kolom: kolom, pk: t.pk };
  });
}

/* Tabel 3NF beserta isinya (baris unik hasil proyeksi tabel 1NF). */
function tabel3NFBerisi() {
  return D.hasil3NF
    .map(function (t) {
      var ids = t.kolom.map(function (k) {
        return k.id;
      });
      return buildTabelData(t, {
        judul: t.ikon + ' ' + t.label,
        baris: proyeksiBaris(TABEL_1NF.baris, ids),
      });
    })
    .join('');
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
      '<h3>🗺️ Alur pemecahan masalah</h3>' +
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
   7. STAGE: MASALAH KOPERASI
   ============================================================ */

function rumusanCukup() {
  return (State.rumusan || '').trim().length >= D.masalah.rumusan.min;
}

function masalahDone() {
  return sortDone('anomali') && State.multi.akar.done && rumusanCukup();
}

function renderMasalah(root) {
  var d = D.masalah;
  var r = d.rumusan;
  var aDone = sortDone('anomali');
  var akarDone = State.multi.akar.done;
  root.innerHTML =
    head('masalah') +
    buildTeacherNote(d.guru) +
    buildDlPanel('<blockquote class="nf-quote">' + esc(d.kutipan) + '</blockquote>') +
    buildDlPanel(
      '<h3>👀 Amati spreadsheet</h3>' +
        buildTabelData(D.rekap, { judul: d.tabelJudul, kunci: false }) +
        '<p style="margin:0;">' +
        d.amati +
        '</p>'
    ) +
    buildDlPanel(
      '<h3>① Pilah anomali yang terjadi</h3><p>' +
        d.anomali.pengantar +
        '</p>' +
        sortCounter('anomali') +
        sortList('anomali')
    ) +
    (aDone
      ? buildDlPanel(
          '<h3>② Temukan akar masalahnya</h3><p>' +
            d.akar.tanya +
            '</p>' +
            multi('akar', { done: d.akar.done })
        )
      : '') +
    (akarDone
      ? buildDlPanel(
          '<h3>③ ' +
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

  bindSort(root, 'anomali');
  if (aDone) bindMulti(root, 'akar');
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
   8. STAGE: ATUR TIM
   ============================================================ */

function renderOrganisasi(root) {
  var d = D.organisasi;
  var urut = State.langkah;
  root.innerHTML =
    head('organisasi') +
    buildTeacherNote(d.guru) +
    buildDlPanel('<p style="margin:0;">' + d.pengantar + '</p>') +
    buildDlPanel(
      '<h3>① Bagi peran tim</h3>' +
        '<p class="sort-counter">Tulis nama anggota yang memegang setiap peran (boleh dikosongkan bila belajar sendiri).</p>' +
        buildPeranKelompok(d.peran, State.peranNama)
    ) +
    buildDlPanel(
      '<h3>② Susun rencana penyelidikan</h3><p>' +
        d.langkah.pengantar +
        '</p>' +
        buildTapOrder('langkah', d.langkah.items, urut, {
          answer: d.langkah.urutan,
          startLabel: 'Langkah pertama',
          endLabel: 'Langkah terakhir',
          successText:
            '<strong>Rencana tepat!</strong> Tahap-tahap berikutnya mengikuti urutan ini: 1NF → ketergantungan → 2NF → 3NF → uji hasil.',
          wrongText:
            'Kartu bertanda merah belum tepat. Ingat: sel atomik dan kunci dulu, baru ketergantungan, lalu pecah bertahap.',
        })
    ) +
    (urut.correct ? nextButton('organisasi') : '');
  bindPeranKelompok(root, State.peranNama, store.save);
  bindTapOrder(root, 'langkah', urut, d.langkah.urutan, store.save, rerender);
  bindNextButton(root, 'organisasi');
}

/* ============================================================
   9. STAGE: BEKAL KONSEP
   ============================================================ */

function renderKonsep(root) {
  var d = D.konsep;
  var done = guidedDone('konsep');
  root.innerHTML =
    head('konsep') +
    buildTeacherNote(d.guru) +
    buildDlPanel('<p style="margin:0;">' + d.pengantar + '</p>') +
    '<div class="nf-konsep-grid">' +
    d.kartu
      .map(function (k) {
        return (
          '<details class="nf-konsep"><summary><span aria-hidden="true">' +
          k.ikon +
          '</span> ' +
          esc(k.istilah) +
          '</summary><p>' +
          esc(k.def) +
          '</p><p class="nf-konsep__contoh"><strong>Contoh:</strong> ' +
          esc(k.contoh) +
          '</p></details>'
        );
      })
      .join('') +
    '</div>' +
    buildDlPanel(
      '<h3>💬 Pertanyaan penuntun</h3>' +
        buildHintStack(d.petunjuk, State.hintKonsep) +
        (done
          ? ''
          : '<div class="btn-group">' +
            buildHintToggle('hintKonsep', d.petunjuk, State.hintKonsep) +
            '</div>') +
        guidedList('konsep')
    ) +
    (done ? nextButton('konsep') : '');
  var hint = root.querySelector('#hintKonsep');
  if (hint) {
    hint.addEventListener('click', function () {
      State.hintKonsep += 1;
      store.save();
      rerender();
    });
  }
  bindGuided(root, 'konsep');
  bindNextButton(root, 'konsep');
}

/* ============================================================
   10. STAGE: SELIDIKI 1NF
   ============================================================ */

function tandaSelUnf() {
  var cek = State.selCek;
  var tanda = {};
  if (!cek.checked && !cek.done && !cek.reveal) return tanda;
  var hasil = periksaSel(SEL_TAK_ATOMIK, State.selUnf);
  if (cek.checked || cek.done) {
    SEL_TAK_ATOMIK.forEach(function (k) {
      if (State.selUnf[k]) tanda[k] = 'benar';
    });
    hasil.salah.forEach(function (k) {
      tanda[k] = 'salah';
    });
  }
  if (cek.reveal) {
    hasil.terlewat.forEach(function (k) {
      tanda[k] = 'terlewat';
    });
  }
  return tanda;
}

function umpanSel() {
  var cek = State.selCek;
  if (cek.done) {
    return buildFeedbackBox(
      'success',
      '✓',
      '<strong>Semua ' +
        SEL_TAK_ATOMIK.length +
        ' sel tak atomik ditemukan.</strong> Kolom Kode Barang, Nama Barang, Harga, dan Jumlah membentuk <em>grup berulang</em>. Nota N003 hanya berisi satu barang, jadi selnya sudah atomik.'
    );
  }
  if (!cek.checked) return '';
  var h = periksaSel(SEL_TAK_ATOMIK, State.selUnf);
  return buildFeedbackBox(
    'warning',
    '💭',
    '<strong>' +
      h.tepat +
      ' dari ' +
      h.total +
      ' sel tak atomik sudah kamu tandai.</strong>' +
      (h.salah.length
        ? '<p>Sel bertanda merah sebenarnya berisi satu nilai saja — ketuk untuk membatalkan.</p>'
        : '') +
      (h.terlewat.length
        ? '<p>Masih ada <strong>' + h.terlewat.length + '</strong> sel yang terlewat.</p>'
        : '')
  );
}

function renderNf1(root) {
  var d = D.nf1;
  var cek = State.selCek;
  var qDone = guidedDone('nf1');
  var done = cek.done && qDone;
  root.innerHTML =
    head('nf1') +
    buildTeacherNote(d.guru) +
    buildDlPanel(
      '<p style="margin:0;">' +
        d.pengantar +
        '</p>' +
        buildTabelData(D.rekap, {
          judul: d.tabelJudul,
          kunci: false,
          ketuk: true,
          id: 'unf',
          pilih: State.selUnf,
          tanda: tandaSelUnf(),
        }) +
        (cek.done
          ? ''
          : '<div class="btn-group"><button type="button" class="btn btn--primary" id="selCheck"' +
            (Object.keys(State.selUnf).length ? '' : ' disabled') +
            '>Periksa</button>' +
            (cek.attempts >= 2 && !cek.reveal
              ? '<button type="button" class="btn btn--ghost btn--small" id="selReveal">Tunjukkan yang terlewat</button>'
              : '') +
            '</div>') +
        umpanSel()
    ) +
    (cek.done ? buildDlPanel('<h3>🔧 Ubah ke 1NF</h3>' + guidedList('nf1')) : '') +
    (done
      ? buildDlPanel(
          buildTabelData(TABEL_1NF, { judul: d.tabel1Judul }) +
            '<p style="margin:0;">' +
            d.simpulan +
            '</p>',
          'panel--success'
        ) + nextButton('nf1')
      : '');

  if (!cek.done) {
    bindTabelSel(
      root,
      'unf',
      State.selUnf,
      function () {
        cek.checked = false;
        store.save();
      },
      rerender
    );
  }
  var check = root.querySelector('#selCheck');
  if (check) {
    check.addEventListener('click', function () {
      var h = periksaSel(SEL_TAK_ATOMIK, State.selUnf);
      cek.attempts += 1;
      cek.checked = true;
      cek.done = h.semuaBenar;
      if (cek.firstTry === null) cek.firstTry = h.semuaBenar;
      store.save();
      rerender();
    });
  }
  var reveal = root.querySelector('#selReveal');
  if (reveal) {
    reveal.addEventListener('click', function () {
      cek.reveal = true;
      store.save();
      rerender();
    });
  }
  if (cek.done) bindGuided(root, 'nf1');
  bindNextButton(root, 'nf1');
}

/* ============================================================
   11. STAGE: KETERGANTUNGAN
   ============================================================ */

function renderKetergantungan(root) {
  var d = D.ketergantungan;
  var sDone = sortDone('fd');
  var done = sDone && guidedDone('ketergantungan');
  root.innerHTML =
    head('ketergantungan') +
    buildTeacherNote(d.guru) +
    buildDlPanel(
      '<p style="margin:0;">' +
        d.pengantar +
        '</p>' +
        buildTabelData(TABEL_1NF, { judul: D.nf1.tabel1Judul })
    ) +
    buildDlPanel(
      '<h3>① Pilah setiap ketergantungan</h3>' + sortCounter('fd') + sortList('fd', { mono: true })
    ) +
    (sDone ? buildDlPanel('<h3>② Simpulkan</h3>' + guidedList('ketergantungan')) : '') +
    (done ? nextButton('ketergantungan') : '');
  bindSort(root, 'fd');
  if (sDone) bindGuided(root, 'ketergantungan');
  bindNextButton(root, 'ketergantungan');
}

/* ============================================================
   12. STAGE: PECAH 2NF & 3NF
   ============================================================ */

function renderDekomposisi(root) {
  var d = D.dekomposisi;
  var a2 = sortDone('a2');
  var q2 = a2 && guidedDone('dek2');
  var a3 = q2 && sortDone('a3');
  var done = a3 && guidedDone('dek3');
  var nota2 = D.hasil2NF[0];
  var tabel3 = D.hasil3NF.filter(function (t) {
    return t.id === 'nota' || t.id === 'siswa' || t.id === 'kelas';
  });
  root.innerHTML =
    head('dekomposisi') +
    buildTeacherNote(d.guru) +
    buildDlPanel(
      '<h3>Langkah 2NF</h3><p>' +
        d.pengantar2NF +
        '</p>' +
        sortCounter('a2') +
        sortList('a2') +
        '<h4>🧱 Tabel rakitan tim</h4>' +
        skemaList(skemaRakitan(D.hasil2NF, 'a2'))
    ) +
    (a2 ? buildDlPanel('<h3>Cek 2NF</h3>' + guidedList('dek2')) : '') +
    (q2
      ? buildDlPanel(
          '<h3>Langkah 3NF</h3><p>' +
            d.pengantar3NF +
            '</p>' +
            skemaList([nota2]) +
            sortCounter('a3') +
            sortList('a3') +
            '<h4>🧱 Tabel rakitan tim</h4>' +
            skemaList(skemaRakitan(tabel3, 'a3'))
        )
      : '') +
    (a3 ? buildDlPanel('<h3>Kunci primer & kunci tamu</h3>' + guidedList('dek3')) : '') +
    (done
      ? buildDlPanel(
          '<h3>✅ Rancangan 3NF</h3>' +
            skemaList(D.hasil3NF) +
            '<p style="margin:0;">' +
            d.simpulan +
            '</p>',
          'panel--success'
        ) + nextButton('dekomposisi')
      : '');
  bindSort(root, 'a2');
  if (a2) bindGuided(root, 'dek2');
  if (q2) bindSort(root, 'a3');
  if (a3) bindGuided(root, 'dek3');
  bindNextButton(root, 'dekomposisi');
}

/* ============================================================
   13. STAGE: SAJIKAN HASIL
   ============================================================ */

function statKartu(label, nilai, aksen) {
  return (
    '<div class="reward-stat' +
    (aksen ? ' reward-stat--accent' : '') +
    '"><span class="reward-stat__label">' +
    esc(label) +
    '</span><span class="reward-stat__value">' +
    nilai +
    '</span></div>'
  );
}

function renderSajikan(root) {
  var d = D.sajikan;
  var k = d.klaim;
  var sebelum = hitungRedundansi(TABEL_1NF);
  var sesudah = hitungDekomposisi(TABEL_1NF, D.hasil3NF);
  root.innerHTML =
    head('sajikan') +
    buildTeacherNote(d.guru) +
    buildDlPanel('<p style="margin:0;">' + d.pengantar + '</p>') +
    buildDlPanel(
      '<h3>📊 Bukti: sebelum vs sesudah</h3>' +
        '<div class="reward-grid">' +
        statKartu('Sel tabel 1NF (1 tabel)', sebelum.sel) +
        statKartu('Sel yang mengulang fakta (1NF)', sebelum.berulang) +
        statKartu('Sel tabel 3NF (' + D.hasil3NF.length + ' tabel)', sesudah.sel, true) +
        statKartu('Sel yang mengulang fakta (3NF)', sesudah.berulang, true) +
        '</div>' +
        '<p class="sort-counter">"Mengulang fakta" = sel yang isinya sudah pasti dari baris lain, misalnya harga B07 yang ditulis lagi. Kunci tamu tidak dihitung karena berfungsi sebagai penghubung.</p>'
    ) +
    buildDlPanel(
      '<h3>🗂️ Tabel 3NF beserta isinya</h3>' + skemaList(D.hasil3NF) + tabel3NFBerisi()
    ) +
    buildDlPanel(
      '<h3>🎤 Pilih klaim presentasi</h3><p>' + k.tanya + '</p>' + multi('klaim', { done: k.done })
    ) +
    buildDlPanel(
      '<label class="input-label" for="catatanSaji">' +
        esc(d.catatanLabel) +
        '</label>' +
        '<textarea class="input-textarea" id="catatanSaji" rows="3" placeholder="' +
        esc(d.catatanPlaceholder) +
        '">' +
        esc(State.catatanSaji) +
        '</textarea>'
    ) +
    (State.multi.klaim.done ? nextButton('sajikan') : '');
  bindMulti(root, 'klaim');
  var ta = root.querySelector('#catatanSaji');
  ta.addEventListener('input', function () {
    State.catatanSaji = ta.value;
    store.save();
  });
  bindNextButton(root, 'sajikan');
}

/* ============================================================
   14. STAGE: EVALUASI
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
  root.innerHTML =
    head('evaluasi') +
    buildTeacherNote(d.guru) +
    buildDlPanel(
      '<p style="margin:0;">' +
        d.pengantarKuis +
        '</p>' +
        buildTabelData(d.tabel, { judul: d.tabelJudul, kunci: false })
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
            skemaList(u.hasil) +
            '<p>' +
            u.tanya +
            '</p>' +
            multi('ujiSilang', { done: u.done })
        )
      : '') +
    (done ? nextButton('evaluasi') : '');
  bindKuisSekali(root, KUIS.jawabEval, State.jawabEval, store.save, rerender);
  if (kDone) bindMulti(root, 'ujiSilang');
  bindNextButton(root, 'evaluasi');
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
  var urut = State.langkah;
  return [
    {
      label: 'Masalah koperasi — pilah anomali & akar masalah',
      skor: sum([sortScore('anomali'), multiScore('akar')]),
    },
    {
      label: 'Atur tim — rencana langkah normalisasi',
      skor: { benar: urut.correct && urut.attempts === 1 ? 1 : 0, total: 1 },
    },
    { label: 'Bekal konsep — pertanyaan penuntun', skor: guidedScore('konsep') },
    {
      label: 'Selidiki 1NF — sel tak atomik & kunci primer',
      skor: sum([{ benar: State.selCek.firstTry === true ? 1 : 0, total: 1 }, guidedScore('nf1')]),
    },
    {
      label: 'Ketergantungan — penuh, parsial, transitif',
      skor: sum([sortScore('fd'), guidedScore('ketergantungan')]),
    },
    {
      label: 'Pecah 2NF & 3NF — atribut, kunci primer & kunci tamu',
      skor: sum([sortScore('a2'), guidedScore('dek2'), sortScore('a3'), guidedScore('dek3')]),
    },
    { label: 'Sajikan hasil — klaim presentasi', skor: multiScore('klaim') },
    { label: 'Evaluasi — kuis kasus servis TEFA', skor: skorKuis(KUIS.jawabEval, State.jawabEval) },
    { label: 'Evaluasi — uji silang rancangan', skor: multiScore('ujiSilang') },
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
    buildDlPanel('<h3>🗂️ Rancangan 3NF koperasi</h3>' + skemaList(D.hasil3NF)) +
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
   17. ROUTER RENDER & INIT
   ============================================================ */

var RENDERERS = {
  orientasi: renderOrientasi,
  masalah: renderMasalah,
  organisasi: renderOrganisasi,
  konsep: renderKonsep,
  nf1: renderNf1,
  ketergantungan: renderKetergantungan,
  dekomposisi: renderDekomposisi,
  sajikan: renderSajikan,
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
