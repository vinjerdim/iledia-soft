'use strict';

/* ============================================================
   app.js — Logika aplikasi media pembelajaran
   Rekayasa Perangkat Lunak: Mengubah Struktur Tabel dengan
   ALTER TABLE (Menambah, Mengubah, dan Menghapus Kolom)
   Fase F — SMK Rekayasa Perangkat Lunak, Problem Based Learning

   Utilitas & komponen bersama berada di shared/engine.js:
     • mesin tahap & store (createStageMachine, createStore);
     • komponen umum (ensureShuffledOrder, buildDiscoveryHead,
       buildTeacherNote, buildChoiceGroup, buildTpPanel,
       buildGuidedQuizList, ensureSortStates, buildSortItems,
       ensureTapOrderState, buildTapOrder, ensureMultiState,
       buildMultiSelect, buildLikertGroup, buildPeranKelompok,
       buildKuisSekali);
     • seksi 17 — SQL DDL (jalankanDdl, strukturDariErd,
       skemaDariStruktur, strukturDariSkema, sorotSql,
       buildSqlKode, buildSkemaDdl, buildKonsolDdl, buildKamusData,
       periksaSkripDdl, bedaSkema, buildBedaSkema,
       ensureEditorState, buildEditorDdl, bindEditorDdl).

   Alur tahap mengikuti lima sintaks Problem Based Learning; lihat
   komentar kepala data.js.

   Seluruh pilihan jawaban DIACAK. Pengacakan dilakukan SEKALI di
   initOrders() lalu urutannya disimpan di State — bukan saat
   render — sehingga pilihan tidak melompat-lompat ketika tahap
   dirender ulang, tetapi teracak ulang setiap Reset.

   Skrip ALTER yang ditulis murid di editor disambung menjadi
   "skrip migrasi tim": tambah → ubah → hapus. Skema awal setiap
   editor adalah DBMS v1 berisi data ditambah skrip tim sebelumnya;
   struktur harapannya adalah hasil skrip kunci sampai editor itu
   (strukturDariSkema), sehingga data yang hilang ikut terdeteksi.

   Bagian:
    1. Konstanta
    2. State & Storage
    3. Pengacakan (initOrders)
    4. Navigasi & render ulang
    5. Utilitas render & skrip migrasi tim
    6. Stage: Orientasi        (PBL sintaks 1)
    7. Stage: Masalah          (PBL sintaks 1)
    8. Stage: Bentuk Tim       (PBL sintaks 2)
    9. Stage: Bekal Sintaks    (PBL sintaks 3)
   10. Stage: Tambah Kolom     (PBL sintaks 3)
   11. Stage: Ubah Kolom       (PBL sintaks 3)
   12. Stage: Hapus Kolom      (PBL sintaks 4)
   13. Stage: Sajikan Hasil    (PBL sintaks 4)
   14. Stage: Evaluasi         (PBL sintaks 5)
   15. Stage: Refleksi         (PBL sintaks 5)
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
var STORAGE_KEY = 'mpi-f-2-3-alter-pbl-v1';

var STRUKTUR_V1 = strukturDariErd(D.erdV1);
var STRUKTUR_V2 = strukturDariErd(D.erdV2);
var STRUKTUR_TEFA = strukturDariErd(D.erdTefa);

/* Editor ALTER berurutan; skripnya disambung menjadi skrip migrasi tim. */
var EDITOR = ['tambah', 'ubah', 'hapus'];

/* Opsi pemeriksaan: kolom wajib & tambahan (ketat), panjang tipe,
   data lama tidak boleh hilang (jagaIsi). */
var OPSI_PERIKSA = { ketat: true, panjang: true, jagaIsi: true };

/* Urutan benar rencana langkah tim = urutan di data.js. */
var RENCANA = D.organisasi.rencana.items;
var JAWAB_RENCANA = RENCANA.map(function (it) {
  return it.id;
});

/* Pertanyaan penuntun (boleh dicoba ulang), untuk pengacakan & skor. */
var GUIDED = {
  konsep: D.konsep.pertanyaan,
  tambah: D.tambah.pertanyaan,
  ubah: D.ubah.pertanyaan,
  rumpang: D.ubah.rumpang,
};

/* Kuis sekali-jawab: key State jawaban → daftar soal. */
var KUIS = {
  jawabEval: D.evaluasi.soal,
};

/* Pemilahan: key State → { items, kategori }. */
var SORTS = {
  aksi: { items: D.konsep.aksi.items, kategori: D.konsep.aksi.kategori },
  dampak: { items: D.konsep.dampak.items, kategori: D.konsep.dampak.kategori },
};

/* Multi-pilih berdiagnosa: key State → daftar opsi. */
var MULTI = {
  akar: D.masalah.akar.opsi,
  analisis: D.hapus.analisis.opsi,
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

  /* Pemilahan: aksi ALTER, dampak data */
  sorts: {},
  sortOrders: {},

  /* Multi-pilih: akar masalah, analisis hapus, klaim, uji silang */
  multi: {},

  /* Masalah — rumusan masalah tim */
  rumusan: '',

  /* Bentuk tim — nama anggota per peran & urut-ketuk rencana */
  peran: {},
  rencana: null,

  /* Konsol latihan: tambah, ubah, hapus */
  konsol: {},

  /* Editor ALTER: tambah, ubah, hapus */
  editor: {},

  /* Sajikan & evaluasi — skrip sudah dijalankan? */
  sajikanJalan: false,
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
    'peran',
    'konsol',
    'editor',
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

  Object.keys(SORTS).forEach(function (k) {
    var tmp = { s: State.sorts[k], o: State.sortOrders[k] };
    ensureSortStates(tmp, 's', 'o', SORTS[k].items, SORTS[k].kategori);
    State.sorts[k] = tmp.s;
    State.sortOrders[k] = tmp.o;
  });

  Object.keys(MULTI).forEach(function (k) {
    ensureMultiState(State.multi, k, MULTI[k]);
  });

  EDITOR.forEach(function (k) {
    ensureEditorState(State.editor, k);
    ensureKonsolState(State.konsol, k);
  });

  ensureTapOrderState(State, 'rencana', RENCANA, JAWAB_RENCANA);
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
   5. UTILITAS RENDER & SKRIP MIGRASI TIM
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

function bindTextarea(root, id, key) {
  var ta = root.querySelector('#' + id);
  if (!ta) return;
  ta.addEventListener('input', function () {
    State[key] = ta.value;
    store.save();
  });
}

function logHtml(log) {
  return '<ul class="ddl-log">' + log.map(buildLogDdl).join('') + '</ul>';
}

/* Kamus data rancangan v2 (seluruhnya atau tabel tertentu). */
function kamus(tabel, judul) {
  return buildKamusData(STRUKTUR_V2, {
    tabel: tabel,
    judul: judul,
    namaDb: tabel ? null : D.namaDb,
  });
}

/* DBMS bank_sampah v1 yang sudah berisi data. */
function skemaV1() {
  return skemaDariStruktur(D.namaDb, STRUKTUR_V1, D.baris);
}

/* DBMS latihan berisi data untuk konsol tahap `key`. */
function skemaLab(key) {
  var lab = D[key].lab;
  return skemaDariStruktur(lab.namaDb, lab.struktur, lab.baris);
}

function konsolPanel(key) {
  var d = D[key];
  var st = State.konsol[key];
  return buildDlPanel(
    '<h3>🧪 Konsol latihan (tabel berisi data)</h3>' +
      counter(Math.min(st.jalan, d.langkah.length), d.langkah.length, 'langkah dijalankan') +
      buildKonsolDdl('k-' + key, d.langkah, st, {
        awal: skemaLab(key),
        judulSkema: 'Isi DBMS latihan',
      })
  );
}

function bindKonsol(root, key) {
  bindKonsolDdl(root, 'k-' + key, D[key].langkah, State.konsol[key], store.save, rerender);
}

function konsolTuntas(key) {
  return State.konsol[key].jalan >= D[key].langkah.length;
}

/* Pernyataan MODIFY dengan semua rumpang terisi. */
function skripRumpang() {
  var sql = D.ubah.rumpangSql;
  D.ubah.rumpang.forEach(function (q, i) {
    sql = sql.replace('__' + (i + 1) + '__', D.ubah.isian[q.id]);
  });
  return sql;
}

/* Skrip editor murid bila sudah lulus; skrip kunci sebagai cadangan. */
function skripEditor(key) {
  var st = State.editor[key];
  return st.lulus && st.jalan ? st.jalan.trim() : D.kunci[key];
}

/* Potongan skrip tim berurutan sampai sebelum editor `sampai`. */
function potonganTim(sampai) {
  var batas = sampai ? EDITOR.indexOf(sampai) : EDITOR.length;
  return EDITOR.slice(0, batas).map(skripEditor);
}

/* Struktur harapan setelah skrip KUNCI sampai (dan termasuk) editor `key`. */
function harapanSampai(key) {
  var n = key ? EDITOR.indexOf(key) + 1 : EDITOR.length;
  var sql = EDITOR.slice(0, n)
    .map(function (k) {
      return D.kunci[k];
    })
    .join('\n');
  return strukturDariSkema(jalankanDdl(skemaV1(), sql).skema);
}

function skripTim() {
  return (
    '-- Migrasi struktur ' +
    D.namaDb +
    ' v1 → v2 (Bank Sampah Sekolah)\n\n' +
    potonganTim().join('\n\n')
  );
}

function editorOpts(key) {
  var d = D[key].editor;
  return {
    harapan: harapanSampai(key),
    awal: jalankanDdl(skemaV1(), potonganTim(key).join('\n')).skema,
    ketat: OPSI_PERIKSA.ketat,
    panjang: OPSI_PERIKSA.panjang,
    jagaIsi: OPSI_PERIKSA.jagaIsi,
    beda: true,
    label: d.label,
    placeholder: d.placeholder,
    kerangka: d.kerangka,
    petunjuk: d.petunjuk,
    sukses: d.sukses,
    rows: 6,
  };
}

function editorPanel(key) {
  var d = D[key].editor;
  return buildDlPanel(
    '<h3>' +
      esc(d.judul) +
      '</h3><p>' +
      d.tugas +
      '</p>' +
      buildEditorDdl('ed-' + key, State.editor[key], editorOpts(key))
  );
}

function bindEditor(root, key) {
  bindEditorDdl(root, 'ed-' + key, State.editor[key], editorOpts(key), store.save, rerender);
}

/* Menjalankan skrip migrasi pada DBMS v1 dan memeriksanya terhadap v2. */
function periksaMigrasi(sql) {
  return periksaSkripDdl(sql, harapanSampai(), {
    awal: skemaV1(),
    ketat: OPSI_PERIKSA.ketat,
    panjang: OPSI_PERIKSA.panjang,
    jagaIsi: OPSI_PERIKSA.jagaIsi,
  });
}

function hasilTim() {
  return periksaMigrasi(skripTim());
}

function hasilTimBiru() {
  return periksaMigrasi(D.evaluasi.ujiSilang.skrip);
}

function bedaPanel(hasil, sql, judul) {
  return buildBedaSkema(bedaSkema(skemaV1(), hasil.skema, sql), { judul: judul });
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
   7. STAGE: MASALAH
   ============================================================ */

function rumusanCukup() {
  return (State.rumusan || '').trim().length >= D.masalah.rumusan.min;
}

function masalahDone() {
  return State.multi.akar.done && rumusanCukup();
}

function renderMasalah(root) {
  var d = D.masalah;
  var r = d.rumusan;
  var aDone = State.multi.akar.done;
  root.innerHTML =
    head('masalah') +
    buildTeacherNote(d.guru) +
    buildDlPanel('<blockquote class="pbl-quote">' + esc(d.kutipan) + '</blockquote>') +
    '<div class="pbl-banding">' +
    buildDlPanel(
      '<h3>🖥️ ' +
        esc(d.logJudul) +
        '</h3><pre class="app-log" aria-label="' +
        esc(d.logJudul) +
        '">' +
        d.log.map(esc).join('\n') +
        '</pre>' +
        buildSkemaDdl(skemaV1(), { judul: d.skemaJudul })
    ) +
    buildDlPanel(kamus(null, d.kamusJudul)) +
    '</div>' +
    buildDlPanel(
      '<h3>① Temukan akar masalah</h3><p>' +
        d.akar.tanya +
        '</p>' +
        multi('akar', { done: d.akar.done })
    ) +
    (aDone
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

  bindMulti(root, 'akar');
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
   8. STAGE: BENTUK TIM
   ============================================================ */

function renderOrganisasi(root) {
  var d = D.organisasi;
  var rc = d.rencana;
  root.innerHTML =
    head('organisasi') +
    buildTeacherNote(d.guru) +
    buildDlPanel(
      '<h3>👥 Peran dalam tim</h3><p>Tulis nama anggota untuk setiap peran (boleh dikosongkan bila belajar mandiri).</p>' +
        buildPeranKelompok(d.peran, State.peran)
    ) +
    buildDlPanel(
      '<h3>🗒️ Rencana langkah tim</h3><p>' +
        rc.pengantar +
        '</p>' +
        buildTapOrder('rencana', RENCANA, State.rencana, {
          answer: JAWAB_RENCANA,
          startLabel: 'Langkah pertama',
          endLabel: 'Langkah terakhir',
          successText: rc.sukses,
          wrongText: rc.salah,
        })
    ) +
    (State.rencana.correct ? nextButton('organisasi') : '');
  bindPeranKelompok(root, State.peran, store.save);
  bindTapOrder(root, 'rencana', State.rencana, JAWAB_RENCANA, store.save, rerender);
  bindNextButton(root, 'organisasi');
}

/* ============================================================
   9. STAGE: BEKAL SINTAKS
   ============================================================ */

function renderKonsep(root) {
  var d = D.konsep;
  var aDone = sortDone('aksi');
  var dDone = aDone && sortDone('dampak');
  var done = dDone && guidedDone('konsep');
  root.innerHTML =
    head('konsep') +
    buildTeacherNote(d.guru) +
    buildDlPanel('<p style="margin:0;">' + d.pengantar + '</p>') +
    '<div class="pbl-kartu-grid">' +
    d.kartu
      .map(function (k) {
        return (
          '<details class="pbl-kartu"><summary><span aria-hidden="true">' +
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
      '<h3>① ' + esc(d.aksi.pengantar) + '</h3>' + sortCounter('aksi') + sortList('aksi')
    ) +
    (aDone
      ? buildDlPanel(
          '<h3>② ' +
            esc(d.dampak.pengantar) +
            '</h3>' +
            sortCounter('dampak') +
            sortList('dampak', { mono: true })
        )
      : '') +
    (dDone ? buildDlPanel('<h3>③ Cek penulisan</h3>' + guidedList('konsep')) : '') +
    (done ? nextButton('konsep') : '');
  bindSort(root, 'aksi');
  if (aDone) bindSort(root, 'dampak');
  if (dDone) bindGuided(root, 'konsep');
  bindNextButton(root, 'konsep');
}

/* ============================================================
   10. STAGE: TAMBAH KOLOM
   ============================================================ */

function renderTambah(root) {
  var d = D.tambah;
  var tuntas = konsolTuntas('tambah');
  var gDone = tuntas && guidedDone('tambah');
  var done = gDone && State.editor.tambah.lulus;
  root.innerHTML =
    head('tambah') +
    buildTeacherNote(d.guru) +
    buildDlPanel('<p style="margin:0;">' + d.pengantar + '</p>') +
    konsolPanel('tambah') +
    (tuntas ? buildDlPanel('<h3>🔎 Olah hasil pengamatan</h3>' + guidedList('tambah')) : '') +
    (gDone
      ? buildDlPanel(kamus(['nasabah'], 'Kamus data v2 tabel nasabah')) + editorPanel('tambah')
      : '') +
    (done ? nextButton('tambah') : '');
  bindKonsol(root, 'tambah');
  if (tuntas) bindGuided(root, 'tambah');
  if (gDone) bindEditor(root, 'tambah');
  bindNextButton(root, 'tambah');
}

/* ============================================================
   11. STAGE: UBAH KOLOM
   ============================================================ */

/* Pernyataan berumpang: rumpang terisi bila sudah dijawab benar. */
function rumpangHtml() {
  var d = D.ubah;
  var html = sorotSql(d.rumpangSql);
  d.rumpang.forEach(function (q, i) {
    var no = i + 1;
    var benar = State.pilih[q.id] === q.correct;
    var isi = benar
      ? '<span class="sql-blank sql-blank--isi">' + esc(d.isian[q.id]) + '</span>'
      : '<span class="sql-blank" aria-label="isian ' + no + '">' + '①②③'[i] + '</span>';
    html = html.replace('__' + no + '__', isi);
  });
  return '<pre class="sql-code" aria-label="Pernyataan berumpang"><code>' + html + '</code></pre>';
}

function renderUbah(root) {
  var d = D.ubah;
  var tuntas = konsolTuntas('ubah');
  var gDone = tuntas && guidedDone('ubah');
  var rDone = gDone && guidedDone('rumpang');
  var done = rDone && State.editor.ubah.lulus;
  root.innerHTML =
    head('ubah') +
    buildTeacherNote(d.guru) +
    buildDlPanel('<p style="margin:0;">' + d.pengantar + '</p>') +
    konsolPanel('ubah') +
    (tuntas ? buildDlPanel('<h3>🔎 Olah hasil pengamatan</h3>' + guidedList('ubah')) : '') +
    (gDone
      ? buildDlPanel(
          kamus(['jenis_sampah'], 'Kamus data v2 tabel jenis_sampah') +
            '<p>' +
            d.rumpangPengantar +
            '</p>' +
            rumpangHtml() +
            guidedList('rumpang')
        )
      : '') +
    (rDone
      ? buildFeedbackBox('success', '✓', d.rumpangSukses) +
        buildDlPanel(kamus(['nasabah'], 'Kamus data v2 tabel nasabah')) +
        editorPanel('ubah')
      : '') +
    (done ? nextButton('ubah') : '');
  bindKonsol(root, 'ubah');
  if (tuntas) bindGuided(root, 'ubah');
  if (gDone) bindGuided(root, 'rumpang');
  if (rDone) bindEditor(root, 'ubah');
  bindNextButton(root, 'ubah');
}

/* ============================================================
   12. STAGE: HAPUS KOLOM
   ============================================================ */

function renderHapus(root) {
  var d = D.hapus;
  var tuntas = konsolTuntas('hapus');
  var aDone = tuntas && State.multi.analisis.done;
  var done = aDone && State.editor.hapus.lulus;
  root.innerHTML =
    head('hapus') +
    buildTeacherNote(d.guru) +
    buildDlPanel('<p style="margin:0;">' + d.pengantar + '</p>') +
    konsolPanel('hapus') +
    (tuntas
      ? buildDlPanel(
          '<h3>🧐 Analisis rencana penghapusan</h3><p>' +
            d.analisis.tanya +
            '</p>' +
            multi('analisis', { done: d.analisis.done })
        )
      : '') +
    (aDone
      ? buildDlPanel(kamus(['setoran'], 'Kamus data v2 tabel setoran')) + editorPanel('hapus')
      : '') +
    (done ? nextButton('hapus') : '');
  bindKonsol(root, 'hapus');
  if (tuntas) bindMulti(root, 'analisis');
  if (aDone) bindEditor(root, 'hapus');
  bindNextButton(root, 'hapus');
}

/* ============================================================
   13. STAGE: SAJIKAN HASIL
   ============================================================ */

function renderSajikan(root) {
  var d = D.sajikan;
  var skrip = skripTim();
  var hasil = State.sajikanJalan ? hasilTim() : null;
  var done = hasil && State.multi.klaim.done;
  root.innerHTML =
    head('sajikan') +
    buildTeacherNote(d.guru) +
    buildDlPanel(
      '<p>' +
        d.pengantar +
        '</p>' +
        buildSqlKode(skrip, { label: 'Skrip migrasi tim' }) +
        (State.sajikanJalan
          ? ''
          : '<div class="btn-group"><button type="button" class="btn btn--primary" id="sajikanRun">▶ Jalankan di DBMS v1 berisi data</button></div>')
    ) +
    (hasil
      ? buildDlPanel(
          '<h3>🖥️ Hasil di DBMS</h3>' +
            logHtml(hasil.log) +
            (hasil.lulus
              ? buildFeedbackBox('success', '✓', d.lulus)
              : buildFeedbackBox(
                  'warning',
                  '💭',
                  '<strong>Hasil migrasi belum sesuai:</strong>' + listHtml(hasil.salah.map(esc))
                ))
        ) +
        '<div class="pbl-banding pbl-banding--rata">' +
        buildDlPanel(bedaPanel(hasil, skrip, 'Bukti: struktur sebelum → sesudah')) +
        buildDlPanel(kamus(null, 'Rancangan: kamus data v2')) +
        '</div>' +
        buildDlPanel(
          '<h3>📣 Klaim presentasi</h3><p>' +
            d.klaim.tanya +
            '</p>' +
            multi('klaim', { done: d.klaim.done })
        )
      : '') +
    (done ? nextButton('sajikan') : '');
  var run = root.querySelector('#sajikanRun');
  if (run) {
    run.addEventListener('click', function () {
      State.sajikanJalan = true;
      store.save();
      rerender();
    });
  }
  if (hasil) bindMulti(root, 'klaim');
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
  var hasil = State.evalJalan ? hasilTimBiru() : null;
  root.innerHTML =
    head('evaluasi') +
    buildTeacherNote(d.guru) +
    buildDlPanel(
      '<p>' +
        d.pengantarKuis +
        '</p><ol class="alter-permintaan">' +
        d.permintaan
          .map(function (p) {
            return '<li>' + p + '</li>';
          })
          .join('') +
        '</ol>' +
        buildKamusData(STRUKTUR_TEFA, { judul: d.kamusJudul, namaDb: D.namaDbTefa })
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
              ? logHtml(hasil.log) +
                bedaPanel(hasil, u.skrip, 'Bukti: struktur sebelum → sesudah skrip Tim Biru')
              : '<div class="btn-group"><button type="button" class="btn btn--ghost btn--small" id="evalRun">▶ Jalankan skrip Tim Biru di DBMS v1</button></div>') +
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
  bindTextarea(root, 'refleksiTeks', 'refleksiTeks');
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

function tapScore(st) {
  return { benar: st.correct && st.attempts === 1 ? 1 : 0, total: 1 };
}

function editorScore(key) {
  return { benar: State.editor[key].lulusPertama === true ? 1 : 0, total: 1 };
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
  return [
    { label: 'Masalah — akar masalah perubahan rancangan', skor: multiScore('akar') },
    { label: 'Bentuk tim — rencana migrasi', skor: tapScore(State.rencana) },
    {
      label: 'Bekal sintaks — aksi ALTER, dampak data, penulisan',
      skor: sum([sortScore('aksi'), sortScore('dampak'), guidedScore('konsep')]),
    },
    {
      label: 'Tambah kolom — pengamatan & skrip ADD',
      skor: sum([guidedScore('tambah'), editorScore('tambah')]),
    },
    {
      label: 'Ubah kolom — pengamatan, rumpang & skrip MODIFY/RENAME',
      skor: sum([guidedScore('ubah'), guidedScore('rumpang'), editorScore('ubah')]),
    },
    {
      label: 'Hapus kolom — analisis & skrip DROP COLUMN',
      skor: sum([multiScore('analisis'), editorScore('hapus')]),
    },
    { label: 'Sajikan — klaim berbasis bukti', skor: multiScore('klaim') },
    {
      label: 'Evaluasi — kuis Servis Laptop TEFA',
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
  var percobaan = EDITOR.map(function (k) {
    return State.editor[k].percobaan;
  }).reduce(function (a, b) {
    return a + b;
  }, 0);

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
        '<p class="sort-counter">Skrip yang kamu jalankan di editor: ' +
        percobaan +
        ' kali (tidak dinilai — setiap perbaikan adalah latihan).</p>'
    ) +
    buildDlPanel(
      '<h3>📜 Skrip migrasi tim</h3>' + buildSqlKode(skripTim(), { label: 'Skrip migrasi tim' })
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
   17. ROUTER RENDER & INIT
   ============================================================ */

var RENDERERS = {
  orientasi: renderOrientasi,
  masalah: renderMasalah,
  organisasi: renderOrganisasi,
  konsep: renderKonsep,
  tambah: renderTambah,
  ubah: renderUbah,
  hapus: renderHapus,
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
