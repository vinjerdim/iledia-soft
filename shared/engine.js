'use strict';

/* ============================================================
   engine.js — Utilitas & komponen bersama media pembelajaran MPI
   Rekayasa Perangkat Lunak (iLedia Soft)

   Dimuat sebagai <script> biasa (tanpa module bundler), sebelum
   data.js dan app.js pada setiap modul. Fungsi diekspos sebagai
   global — pola yang sama dengan iledia-math — sehingga app.js
   modul dapat memanggilnya langsung.

   Bagian:
    1. Utilitas teks & acak
    2. Notifikasi (toast)
    3. Utilitas render
    4. Mesin navigasi tahap
    5. Penyimpanan State
    6. Komponen Discovery Learning (pilihan acak, kepala tahap,
       catatan guru, petunjuk berjenjang, panel tujuan belajar)
    7. Pemilahan kategori (setiap butir dipilahkan ke satu kategori,
       opsi teracak, umpan balik + alasan)
    8. Urut-ketuk (menyusun kartu menjadi urutan)
    9. Pertanyaan penuntun bertingkat
   10. Multi-pilih berdiagnosa
   11. Skala Likert (refleksi diri)
   12. Analisis kebutuhan data — dokumen kebutuhan bertanda frasa,
       skor pemilahan, cakupan kebutuhan, kartu entitas
   13. Relasi & kardinalitas ERD — notasi min..maks, jenis relasi,
       diagram relasi, pemilih kardinalitas teracak
   14. Kerja kelompok kooperatif — kartu peran, kuis sekali-jawab,
       poin peningkatan & predikat tim (STAD)
   15. ERD lengkap — letak kunci tamu, kunci primer, pemeriksaan
       ERD, diagram ERD lengkap
   16. Normalisasi basis data — sel atomik, grup berulang, closure,
       ketergantungan penuh/parsial/transitif, bentuk normal 0–3,
       pemeriksaan dekomposisi, hitungan redundansi, tabel data
       bersel ketuk, skema relasi
   17. SQL DDL — pengurai & simulator DDL mini (CREATE/ALTER/DROP/
       TRUNCATE/RENAME, basis data, kunci primer & tamu), struktur
       tabel dari ERD, urutan pembuatan tabel, pemeriksaan struktur,
       pembangkit CREATE TABLE, penyorot sintaks, konsol berlangkah
   18. Modal reset
   19. Kompatibilitas: Engine.createLesson (modul lama)

   ATURAN PENGACAKAN: setiap daftar pilihan yang ditampilkan ke
   murid WAJIB diacak. Acak SEKALI saat State disiapkan (pakai
   ensureShuffledOrder / ensureSortStates / ensureTapOrderState /
   ensureMultiState / ensureKardinalitasState), simpan urutannya
   di State, lalu render menurut urutan tersimpan. Jangan memanggil shuffleArray() dari
   renderer — pilihan akan melompat setiap kali tahap dirender
   ulang. Jawaban murid disimpan per id opsi, bukan per indeks.
   ============================================================ */

/* ============================================================
   1. UTILITAS TEKS & ACAK
   ============================================================ */

function esc(str) {
  if (str === null || str === undefined) return '';
  var m = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#39;',
  };
  return String(str).replace(/[&<>"']/g, function (ch) {
    return m[ch];
  });
}

/*
 * Mengacak urutan isi sebuah array (Fisher-Yates) dan mengembalikan array
 * BARU — array asal tidak pernah disentuh, sehingga aman dipakai langsung
 * pada array milik DATA. Panggil hanya lewat fungsi ensure*() saat State
 * disiapkan, bukan saat render.
 */
function shuffleArray(arr) {
  var out = arr.slice();
  for (var i = out.length - 1; i > 0; i--) {
    var j = Math.floor(Math.random() * (i + 1));
    var tmp = out[i];
    out[i] = out[j];
    out[j] = tmp;
  }
  return out;
}

/* ============================================================
   2. NOTIFIKASI (TOAST)
   ============================================================ */

var noticeTimer = null;

function showNotice(msg, elementId) {
  var el = document.getElementById(elementId || 'appNotice');
  if (!el) return;
  el.textContent = msg;
  el.classList.add('is-visible');
  if (noticeTimer) clearTimeout(noticeTimer);
  noticeTimer = setTimeout(function () {
    el.classList.remove('is-visible');
  }, 3000);
}

/* ============================================================
   3. UTILITAS RENDER
   ============================================================ */

function buildFeedbackBox(type, icon, html) {
  return (
    '<div class="feedback-box feedback-box--' +
    esc(type) +
    '" role="alert">' +
    '<span class="feedback-box__icon" aria-hidden="true">' +
    icon +
    '</span>' +
    '<div class="feedback-box__body">' +
    html +
    '</div>' +
    '</div>'
  );
}

/* ============================================================
   4. MESIN NAVIGASI TAHAP
   ============================================================ */

/*
 * Membuat mesin navigasi tahap yang dipakai bersama oleh setiap modul MPI.
 * opts:
 *   stages          array id tahap, urut (wajib)
 *   stageLabels     array label tahap, sejajar dengan `stages` (wajib)
 *   state           objek State milik modul (wajib, dimutasi langsung)
 *   save            function() — menyimpan State (wajib)
 *   render          function() — merender tahap aktif (wajib)
 *   notice          function(msg) — notifikasi (opsional, default showNotice)
 *   listId          id <ol> daftar navigasi (default 'stageNavList')
 *   progressFillId  id fill progress bar (default 'progressFill')
 *   progressLabelId id label progress bar (default 'progressLabel')
 *
 * Mengembalikan { navigateTo, completeStage, updateStageNav, buildStageNav, updateProgress }.
 */
function createStageMachine(opts) {
  var stages = opts.stages;
  var stageLabels = opts.stageLabels;
  var state = opts.state;
  var save = opts.save;
  var render = opts.render;
  var notice = opts.notice || showNotice;
  var listId = opts.listId || 'stageNavList';
  var progressFillId = opts.progressFillId || 'progressFill';
  var progressLabelId = opts.progressLabelId || 'progressLabel';

  function navigateTo(stageId) {
    var targetIdx = stages.indexOf(stageId);
    var currentIdx = stages.indexOf(state.currentStage);
    if (targetIdx === -1) return;

    if (targetIdx > currentIdx) {
      for (var i = currentIdx; i < targetIdx; i++) {
        if (!state.completedStages[stages[i]]) {
          notice('Selesaikan tahap "' + stageLabels[i] + '" terlebih dahulu.');
          return;
        }
      }
    }

    state.currentStage = stageId;
    save();
    updateStageNav();
    render();
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  function completeStage(stageId) {
    state.completedStages[stageId] = true;
    save();
    updateStageNav();
    updateProgress();
  }

  function updateStageNav() {
    var items = document.querySelectorAll('.stage-nav__item[data-stage]');
    var currentIdx = stages.indexOf(state.currentStage);
    items.forEach(function (item) {
      var sid = item.dataset.stage;
      var idx = stages.indexOf(sid);
      item.removeAttribute('aria-current');
      item.classList.remove('is-complete');
      item.disabled = false;
      if (sid === state.currentStage) item.setAttribute('aria-current', 'step');
      else if (state.completedStages[sid]) item.classList.add('is-complete');
      if (idx > currentIdx && !state.completedStages[stages[idx - 1]]) item.disabled = true;
    });
  }

  function buildStageNav() {
    var list = document.getElementById(listId);
    if (!list) return;
    list.innerHTML = stages
      .map(function (sid, i) {
        return (
          '<li>' +
          '<button type="button" class="stage-nav__item" data-stage="' +
          esc(sid) +
          '">' +
          '<span class="stage-nav__num">' +
          (i + 1) +
          '</span>' +
          esc(stageLabels[i]) +
          '</button></li>'
        );
      })
      .join('');
    list.querySelectorAll('.stage-nav__item').forEach(function (btn) {
      btn.addEventListener('click', function () {
        navigateTo(btn.dataset.stage);
      });
    });
    updateStageNav();
  }

  function updateProgress() {
    var total = stages.length;
    var done = stages.filter(function (sid) {
      return state.completedStages[sid];
    }).length;
    var pct = Math.round((done / total) * 100);
    var fill = document.getElementById(progressFillId);
    var label = document.getElementById(progressLabelId);
    if (fill) {
      fill.style.width = pct + '%';
      fill.parentElement.setAttribute('aria-valuenow', pct);
    }
    if (label) label.textContent = done + ' dari ' + total + ' tahap selesai';
  }

  return {
    navigateTo: navigateTo,
    completeStage: completeStage,
    updateStageNav: updateStageNav,
    buildStageNav: buildStageNav,
    updateProgress: updateProgress,
  };
}

/* ============================================================
   5. PENYIMPANAN STATE
   ============================================================ */

/*
 * Penyimpanan localStorage untuk objek State satu modul. "Bentuk awal"
 * diambil dari `state` saat createStore() dipanggil (segera setelah
 * `var State = {...}`), sehingga reset() tidak perlu daftar default lagi.
 * State dimutasi langsung — tidak pernah diganti — agar referensi lain
 * tetap valid. Penyimpanan yang diblokir (mode privat) diabaikan.
 *
 * Mengembalikan { save(), load(), reset() }.
 */
function createStore(opts) {
  var key = opts.key;
  var state = opts.state;
  var defaults = JSON.parse(JSON.stringify(state));

  function save() {
    try {
      localStorage.setItem(key, JSON.stringify(state));
    } catch (e) {
      /* abaikan: progres hanya tidak tersimpan */
    }
  }

  function load() {
    try {
      var raw = localStorage.getItem(key);
      if (!raw) return false;
      Object.assign(state, JSON.parse(raw));
      return true;
    } catch (e) {
      return false;
    }
  }

  function reset() {
    try {
      localStorage.removeItem(key);
    } catch (e) {
      /* abaikan */
    }
    Object.keys(state).forEach(function (k) {
      delete state[k];
    });
    Object.assign(state, JSON.parse(JSON.stringify(defaults)));
  }

  return { save: save, load: load, reset: reset };
}

/* ============================================================
   6. KOMPONEN DISCOVERY LEARNING
   ============================================================ */

/* Daftar id dari array opsi {id, ...}. */
function optionIds(options) {
  return options.map(function (o) {
    return o.id;
  });
}

/*
 * Memastikan state[key] berisi urutan acak id opsi yang masih cocok
 * dengan `options`; bila belum ada atau tidak cocok lagi (DATA berubah),
 * urutan baru diacak. Panggil saat menyiapkan State, bukan saat render.
 */
function ensureShuffledOrder(state, key, options) {
  var order = state[key];
  var ids = optionIds(options);
  var cocok =
    Array.isArray(order) &&
    order.length === ids.length &&
    ids.every(function (id) {
      return order.indexOf(id) !== -1;
    });
  if (!cocok) state[key] = shuffleArray(ids);
  return state[key];
}

/* Menyusun opsi menurut urutan id tersimpan; urutan DATA bila rusak. */
function orderByIds(options, order) {
  if (!Array.isArray(order) || order.length !== options.length) return options;
  var byId = {};
  options.forEach(function (o) {
    byId[o.id] = o;
  });
  var out = [];
  for (var i = 0; i < order.length; i++) {
    if (!byId[order[i]]) return options;
    out.push(byId[order[i]]);
  }
  return out;
}

/* Label opsi {id, label} berdasarkan id; '' bila tidak ada. */
function findOptionLabel(options, id) {
  for (var i = 0; i < options.length; i++) {
    if (options[i].id === id) return options[i].label || options[i].teks || '';
  }
  return '';
}

/*
 * Kepala tahap (.stage-head). `syntax` opsional menandai sintaks model
 * pembelajaran, mis. "Discovery Learning · Sintaks 3".
 */
function buildDiscoveryHead(kicker, title, goal, syntax) {
  return (
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">' +
    esc(kicker) +
    '</span>' +
    (syntax ? '<span class="dl-syntax-chip">' + esc(syntax) + '</span>' : '') +
    '<h2 class="stage-head__title">' +
    esc(title) +
    '</h2>' +
    '<p class="stage-head__goal">Tujuan: ' +
    esc(goal) +
    '</p>' +
    '</div>'
  );
}

/* Catatan peran guru yang dapat dibuka-tutup. */
function buildTeacherNote(text) {
  if (!text) return '';
  return (
    '<details class="teacher-note">' +
    '<summary>👩‍🏫 Peran guru di tahap ini</summary>' +
    '<p>' +
    text +
    '</p>' +
    '</details>'
  );
}

/*
 * Tombol pilihan ganda (.choice-btn + .is-*) dalam urutan `order`.
 *   opts.chosen     id opsi yang sudah dipilih (atau null)
 *   opts.correctId  id opsi benar untuk ditandai hijau; null bila belum
 *                   boleh dibocorkan
 *   opts.grade      true → tandai benar/salah; false → hanya .is-selected
 *   opts.locked     true → matikan tombol setelah dijawab
 *   opts.attr       nama atribut data id opsi (default 'data-opt-id')
 *   opts.group      nilai data-group untuk membedakan kelompok pilihan
 */
function buildChoiceGroup(options, order, opts) {
  opts = opts || {};
  var letters = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
  var chosen = opts.chosen;
  var answered = chosen !== null && chosen !== undefined && chosen !== '';
  var attr = opts.attr || 'data-opt-id';
  return (
    '<div class="challenge-options" role="group"' +
    (opts.group ? ' data-group="' + esc(opts.group) + '"' : '') +
    '>' +
    orderByIds(options, order)
      .map(function (opt, i) {
        var cls = 'choice-btn';
        if (answered) {
          if (opts.grade) {
            if (opts.correctId && opt.id === opts.correctId) cls += ' is-correct';
            else if (opt.id === chosen) cls += ' is-incorrect';
          } else if (opt.id === chosen) {
            cls += ' is-selected';
          }
        }
        return (
          '<button type="button" class="' +
          cls +
          '" ' +
          attr +
          '="' +
          esc(opt.id) +
          '"' +
          (opts.group ? ' data-group="' + esc(opts.group) + '"' : '') +
          (answered && opts.locked ? ' disabled' : '') +
          ' aria-pressed="' +
          (opt.id === chosen ? 'true' : 'false') +
          '">' +
          '<span class="choice-btn__icon">' +
          letters[i] +
          '</span>' +
          '<span>' +
          (opt.label || esc(opt.teks)) +
          '</span>' +
          '</button>'
        );
      })
      .join('') +
    '</div>'
  );
}

/* Kotak petunjuk berjenjang: menampilkan `level` petunjuk pertama. */
function buildHintStack(hints, level) {
  if (!hints || !level || level < 1) return '';
  return hints
    .slice(0, level)
    .map(function (h, i) {
      return (
        '<div class="hint-box">' +
        '<span class="hint-box__label">' +
        (hints.length > 1 ? 'Petunjuk ' + (i + 1) : 'Petunjuk') +
        '</span>' +
        h +
        '</div>'
      );
    })
    .join('');
}

/* Tombol pembuka petunjuk berikutnya; '' bila semua petunjuk terbuka. */
function buildHintToggle(id, hints, level) {
  if (!hints || level >= hints.length) return '';
  var label =
    hints.length > 1 ? '💡 Petunjuk (' + (level + 1) + '/' + hints.length + ')' : '💡 Petunjuk';
  return (
    '<button type="button" class="btn btn--ghost btn--small" id="' +
    esc(id) +
    '">' +
    label +
    '</button>'
  );
}

/* Panel (.panel) dengan class tambahan opsional. */
function buildDlPanel(inner, cls) {
  return '<div class="panel' + (cls ? ' ' + cls : '') + '">' + inner + '</div>';
}

/* Tombol lanjut rata kanan. */
function buildDlNextButton(id, label, large) {
  return (
    '<div class="btn-group btn-group--end">' +
    '<button type="button" class="btn btn--primary' +
    (large ? ' btn--large' : '') +
    '" id="' +
    esc(id) +
    '">' +
    esc(label) +
    '</button>' +
    '</div>'
  );
}

/* Panel "Tujuan belajar hari ini": TP + kriteria bernomor.
   D = objek tahap ({tpJudul, tp, kriteria}). */
function buildTpPanel(D, fmt) {
  var f = fmt || esc;
  return buildDlPanel(
    '<h3 style="margin-top:0;">🎯 ' +
      esc(D.tpJudul) +
      '</h3>' +
      '<p class="tp-teks">' +
      esc(D.tp) +
      '</p>' +
      '<ol class="objectives-list">' +
      D.kriteria
        .map(function (c, i) {
          return (
            '<li><span class="objectives-list__num">' +
            (i + 1) +
            '</span><span>' +
            f(c) +
            '</span></li>'
          );
        })
        .join('') +
      '</ol>',
    'panel--info'
  );
}

/* ============================================================
   7. PEMILAHAN KATEGORI
   Setiap butir dipilahkan ke salah satu kategori. Opsi tiap butir
   dan urutan butir diacak sekali. Butir terkunci setelah dijawab
   dan langsung diberi umpan balik beserta alasannya.
     item = { id, teks, correct, explanation }
   ensureSortStates(state, key, orderKey, items, options) menyiapkan
     state[key]      { <itemId>: { chosen, correct, optionOrder } }
     state[orderKey] urutan acak id butir
   ============================================================ */

function ensureSortStates(state, key, orderKey, items, options) {
  var map = state[key] && typeof state[key] === 'object' ? state[key] : {};
  var next = {};
  items.forEach(function (it) {
    var st = map[it.id];
    if (!st || typeof st !== 'object') {
      st = { chosen: null, correct: false, optionOrder: null };
    }
    ensureShuffledOrder(st, 'optionOrder', options);
    next[it.id] = st;
  });
  state[key] = next;
  ensureShuffledOrder(state, orderKey, items);
}

function sortItemsAllAnswered(items, states) {
  return items.every(function (it) {
    return !!(states[it.id] && states[it.id].chosen);
  });
}

function sortItemsCorrectCount(items, states) {
  return items.filter(function (it) {
    return states[it.id] && states[it.id].correct;
  }).length;
}

/*
 *   opts.mono    true → teks butir bergaya kode (nama atribut)
 *   opts.visual  function(it) → HTML blok di bawah teks butir
 *   opts.prefix  function(it) → HTML sebelum teks butir (mis. nomor frasa)
 */
function buildSortItems(items, itemOrder, options, states, opts) {
  opts = opts || {};
  return (
    '<div class="sort-list">' +
    orderByIds(items, itemOrder)
      .map(function (it) {
        var st = states[it.id];
        return (
          '<div class="sort-item">' +
          '<p class="sort-item__text' +
          (opts.mono ? ' sort-item__text--mono' : '') +
          '">' +
          (opts.prefix ? opts.prefix(it) : '') +
          esc(it.teks) +
          '</p>' +
          (opts.visual ? '<div class="sort-item__visual">' + opts.visual(it) + '</div>' : '') +
          buildChoiceGroup(options, st.optionOrder, {
            chosen: st.chosen,
            correctId: it.correct,
            grade: true,
            locked: true,
            group: it.id,
            attr: 'data-sort-opt',
          }) +
          (st.chosen
            ? '<div style="margin-top:var(--space-2);">' +
              buildFeedbackBox(
                st.correct ? 'success' : 'error',
                st.correct ? '✓' : '✗',
                (st.correct ? '<strong>Benar.</strong> ' : '<strong>Belum tepat.</strong> ') +
                  it.explanation
              ) +
              '</div>'
            : '') +
          '</div>'
        );
      })
      .join('') +
    '</div>'
  );
}

/* Memasang event buildSortItems di dalam `root`. */
function bindSortItems(root, items, states, save, rerender) {
  var byId = {};
  items.forEach(function (it) {
    byId[it.id] = it;
  });
  root.querySelectorAll('[data-sort-opt]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var it = byId[btn.dataset.group];
      var st = it && states[it.id];
      if (!st || st.chosen) return;
      st.chosen = btn.dataset.sortOpt;
      st.correct = st.chosen === it.correct;
      save();
      rerender();
    });
  });
}

/* ============================================================
   8. URUT-KETUK
   Murid mengetuk kartu dari kolam (teracak) untuk mengisi slot
   urutan, lalu memeriksa. Kartu di slot dapat diketuk untuk
   dikembalikan.
   ensureTapOrderState(state, key, items, answer) menyiapkan
     state[key] = { pool, placed, checked, correct, attempts }
   Kolam awal dijamin tidak sama dengan urutan benar.
   ============================================================ */

function ensureTapOrderState(state, key, items, answer) {
  var st = state[key];
  var ids = optionIds(items);
  var valid =
    st &&
    typeof st === 'object' &&
    Array.isArray(st.pool) &&
    Array.isArray(st.placed) &&
    st.pool.length + st.placed.length === ids.length &&
    ids.every(function (id) {
      return st.pool.indexOf(id) !== -1 || st.placed.indexOf(id) !== -1;
    });
  if (!valid) {
    var pool = shuffleArray(ids);
    for (var coba = 0; coba < 20 && answer && pool.join('|') === answer.join('|'); coba++) {
      pool = shuffleArray(ids);
    }
    state[key] = { pool: pool, placed: [], checked: false, correct: false, attempts: 0 };
  }
  return state[key];
}

function tapOrderIsCorrect(st, answer) {
  return st.placed.length === answer.length && st.placed.join('|') === answer.join('|');
}

/*
 *   opts.answer      array id urutan benar (wajib)
 *   opts.startLabel  keterangan awal urutan (mis. 'Langkah pertama')
 *   opts.endLabel    keterangan akhir urutan
 *   opts.successText HTML umpan balik setelah benar
 *   opts.wrongText   HTML petunjuk saat urutan belum tepat
 */
function buildTapOrder(id, items, st, opts) {
  opts = opts || {};
  var byId = {};
  items.forEach(function (it) {
    byId[it.id] = it;
  });
  var locked = st.correct;
  var n = items.length;

  var slots = '';
  for (var i = 0; i < n; i++) {
    var pid = st.placed[i];
    if (pid) {
      var cls = 'tap-order__card tap-order__card--placed';
      if (st.checked) cls += pid === opts.answer[i] ? ' is-correct' : ' is-wrong';
      slots +=
        '<button type="button" class="' +
        cls +
        '" data-tap-back="' +
        i +
        '" data-tap-id="' +
        esc(id) +
        '"' +
        (locked ? ' disabled' : '') +
        ' aria-label="Urutan ' +
        (i + 1) +
        ': ' +
        esc(byId[pid].label) +
        (locked ? '' : '. Ketuk untuk mengembalikan') +
        '">' +
        '<span class="tap-order__rank">' +
        (i + 1) +
        '</span>' +
        esc(byId[pid].label) +
        '</button>';
    } else {
      slots +=
        '<span class="tap-order__slot" role="listitem" aria-label="Urutan ' +
        (i + 1) +
        ' masih kosong"><span class="tap-order__rank">' +
        (i + 1) +
        '</span></span>';
    }
  }

  var pool = st.pool
    .map(function (pid) {
      return (
        '<button type="button" class="tap-order__card" data-tap-add="' +
        esc(pid) +
        '" data-tap-id="' +
        esc(id) +
        '">' +
        esc(byId[pid].label) +
        '</button>'
      );
    })
    .join('');

  var feedback = '';
  if (st.correct) {
    feedback = buildFeedbackBox(
      'success',
      '✓',
      opts.successText || '<strong>Urutannya tepat!</strong>'
    );
  } else if (st.checked) {
    var tepat = st.placed.filter(function (p, k) {
      return p === opts.answer[k];
    }).length;
    feedback = buildFeedbackBox(
      'warning',
      '💭',
      '<strong>' +
        tepat +
        ' dari ' +
        n +
        ' kartu sudah di tempat yang tepat.</strong> ' +
        (opts.wrongText ||
          'Kartu bertanda merah belum tepat — ketuk kartu itu untuk mengembalikannya, lalu susun ulang.')
    );
  }

  return (
    '<div class="tap-order tap-order--stack" id="' +
    esc(id) +
    '">' +
    (opts.startLabel || opts.endLabel
      ? '<div class="tap-order__ends"><span>⬆ ' +
        esc(opts.startLabel || '') +
        '</span><span>' +
        esc(opts.endLabel || '') +
        ' ⬇</span></div>'
      : '') +
    '<div class="tap-order__slots" role="list" aria-label="Urutan yang kamu susun">' +
    slots +
    '</div>' +
    (locked
      ? ''
      : '<p class="tap-order__cap">' +
        (st.pool.length
          ? 'Ketuk kartu di bawah untuk mengisi urutan berikutnya. Ketuk kartu di atas untuk mengembalikannya.'
          : 'Semua kartu sudah terpasang. Periksa urutanmu!') +
        '</p>' +
        '<div class="tap-order__pool" role="group" aria-label="Kartu yang belum diurutkan">' +
        pool +
        '</div>' +
        '<div class="btn-group">' +
        '<button type="button" class="btn btn--primary" id="' +
        esc(id) +
        'Check"' +
        (st.pool.length ? ' disabled' : '') +
        '>Periksa Urutan</button>' +
        '<button type="button" class="btn btn--ghost btn--small" id="' +
        esc(id) +
        'Clear"' +
        (st.placed.length ? '' : ' disabled') +
        '>Kosongkan</button>' +
        '</div>') +
    feedback +
    '</div>'
  );
}

function bindTapOrder(root, id, st, answer, save, rerender) {
  if (st.correct) return;
  var sel = '[data-tap-id="' + id + '"]';
  root.querySelectorAll(sel + '[data-tap-add]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var pid = btn.dataset.tapAdd;
      var k = st.pool.indexOf(pid);
      if (k === -1) return;
      st.pool.splice(k, 1);
      st.placed.push(pid);
      st.checked = false;
      save();
      rerender();
    });
  });
  root.querySelectorAll(sel + '[data-tap-back]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var i = parseInt(btn.dataset.tapBack, 10);
      var pid = st.placed[i];
      if (!pid) return;
      st.placed.splice(i, 1);
      st.pool.push(pid);
      st.checked = false;
      save();
      rerender();
    });
  });
  var check = root.querySelector('#' + id + 'Check');
  if (check) {
    check.addEventListener('click', function () {
      if (st.pool.length) return;
      st.attempts += 1;
      st.checked = true;
      st.correct = tapOrderIsCorrect(st, answer);
      save();
      rerender();
    });
  }
  var clear = root.querySelector('#' + id + 'Clear');
  if (clear) {
    clear.addEventListener('click', function () {
      st.pool = st.pool.concat(st.placed);
      st.placed = [];
      st.checked = false;
      save();
      rerender();
    });
  }
}

/* ============================================================
   9. PERTANYAAN PENUNTUN BERTINGKAT
   Pertanyaan pilihan yang boleh dicoba lagi sampai benar, lalu
   terkunci; setiap pilihan punya umpan balik sendiri. Urutan opsi
   diambil dari orders[q.id] (diacak sekali dengan
   ensureShuffledOrder saat State disiapkan).
     q = { id, tanya, opsi: [{id, label}], correct, umpan: { <idOpsi>: html } }
   ============================================================ */

function buildGuidedChoiceFeedback(chosen, benar, umpan) {
  if (!chosen) return '';
  return (
    '<div style="margin-top:var(--space-3);">' +
    buildFeedbackBox(benar ? 'success' : 'warning', benar ? '✓' : '💭', umpan[chosen]) +
    '</div>'
  );
}

function buildGuidedQuizList(list, orders, pilih) {
  return list
    .map(function (q, i) {
      var chosen = pilih[q.id] || null;
      var benar = chosen === q.correct;
      return (
        '<div class="quiz-item quiz-item--guided">' +
        '<p class="exercise-label"><span class="dl-step__num">' +
        (i + 1) +
        '</span>' +
        (q.tanya || q.teks) +
        '</p>' +
        buildChoiceGroup(q.opsi, orders[q.id], {
          chosen: chosen,
          correctId: benar ? q.correct : null,
          grade: true,
          locked: benar,
          group: q.id,
          attr: 'data-q-opt',
        }) +
        buildGuidedChoiceFeedback(chosen, benar, q.umpan) +
        '</div>'
      );
    })
    .join('');
}

/* onFirst(q, benar) opsional dipanggil pada percobaan pertama tiap
   pertanyaan — dipakai modul untuk mencatat skor percobaan pertama. */
function bindGuidedQuizList(root, list, pilih, save, rerender, onFirst) {
  var byId = {};
  list.forEach(function (q) {
    byId[q.id] = q;
  });
  root.querySelectorAll('[data-q-opt]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var q = byId[btn.dataset.group];
      if (!q || pilih[q.id] === q.correct) return;
      var pertama = !pilih[q.id];
      pilih[q.id] = btn.dataset.qOpt;
      if (pertama && onFirst) onFirst(q, pilih[q.id] === q.correct);
      save();
      rerender();
    });
  });
}

function guidedQuizAllCorrect(list, pilih) {
  return list.every(function (q) {
    return pilih[q.id] === q.correct;
  });
}

/* ============================================================
   10. MULTI-PILIH BERDIAGNOSA
   "Pilih SEMUA yang tepat." Murid menandai beberapa opsi lalu
   memeriksa. Pilihan keliru langsung diberi alasan; banyaknya
   yang terlewat disebutkan tanpa membocorkan opsinya, sehingga
   murid menelaah ulang sendiri.
     opsi = { id, label, benar, alasan }
   ============================================================ */

/* Pemeriksa murni: { semuaBenar, tepat, totalBenar, salahPilih, terlewat }. */
function periksaMultiPilih(options, chosenIds) {
  var chosen = {};
  (chosenIds || []).forEach(function (id) {
    chosen[id] = true;
  });
  var tepat = 0;
  var totalBenar = 0;
  var salahPilih = [];
  var terlewat = [];
  options.forEach(function (o) {
    if (o.benar) {
      totalBenar++;
      if (chosen[o.id]) tepat++;
      else terlewat.push(o.id);
    } else if (chosen[o.id]) {
      salahPilih.push(o.id);
    }
  });
  return {
    semuaBenar: totalBenar > 0 && !salahPilih.length && !terlewat.length,
    tepat: tepat,
    totalBenar: totalBenar,
    salahPilih: salahPilih,
    terlewat: terlewat,
  };
}

/* state[key] = { chosen, checked, done, attempts, firstTry, order } */
function ensureMultiState(state, key, options) {
  var st = state[key];
  if (!st || typeof st !== 'object' || !Array.isArray(st.chosen)) {
    st = { chosen: [], checked: false, done: false, attempts: 0, firstTry: null, order: null };
  }
  var valid = optionIds(options);
  st.chosen = st.chosen.filter(function (id) {
    return valid.indexOf(id) !== -1;
  });
  ensureShuffledOrder(st, 'order', options);
  state[key] = st;
  return st;
}

/*
 *   opts.hint   teks petunjuk singkat di atas daftar
 *   opts.done   HTML umpan balik setelah semua benar
 */
function buildMultiSelect(id, options, st, opts) {
  opts = opts || {};
  var hasil = st.checked ? periksaMultiPilih(options, st.chosen) : null;
  var list = orderByIds(options, st.order)
    .map(function (o) {
      var on = st.chosen.indexOf(o.id) !== -1;
      var cls = 'choice-btn multi-btn';
      if (st.done) cls += o.benar ? ' is-correct' : on ? ' is-incorrect' : ' is-muted';
      else if (hasil && on && !o.benar) cls += ' is-incorrect';
      else if (on) cls += ' is-selected';
      return (
        '<button type="button" class="' +
        cls +
        '" data-multi-opt="' +
        esc(o.id) +
        '" data-multi-id="' +
        esc(id) +
        '" aria-pressed="' +
        (on ? 'true' : 'false') +
        '"' +
        (st.done ? ' disabled' : '') +
        '>' +
        '<span class="choice-btn__icon multi-btn__box" aria-hidden="true">' +
        (on ? '✓' : '') +
        '</span>' +
        '<span>' +
        o.label +
        '</span>' +
        '</button>'
      );
    })
    .join('');

  var feedback = '';
  if (st.done) {
    feedback =
      buildFeedbackBox(
        'success',
        '✓',
        opts.done || '<strong>Tepat!</strong> Semua yang benar sudah kamu temukan.'
      ) +
      '<ul class="explain-mini">' +
      orderByIds(options, st.order)
        .map(function (o) {
          return (
            '<li class="explain-mini__item explain-mini__item--' +
            (o.benar ? 'ya' : 'tidak') +
            '"><strong>' +
            (o.benar ? '✓ ' : '✗ ') +
            o.label +
            '</strong> — ' +
            o.alasan +
            '</li>'
          );
        })
        .join('') +
      '</ul>';
  } else if (hasil) {
    var byId = {};
    options.forEach(function (o) {
      byId[o.id] = o;
    });
    var bagian = [];
    hasil.salahPilih.forEach(function (sid) {
      bagian.push('<li><strong>' + byId[sid].label + '</strong> — ' + byId[sid].alasan + '</li>');
    });
    feedback = buildFeedbackBox(
      'warning',
      '💭',
      '<strong>' +
        hasil.tepat +
        ' dari ' +
        hasil.totalBenar +
        ' jawaban tepat sudah kamu pilih.</strong>' +
        (bagian.length
          ? '<p>Pilihan bertanda merah belum tepat:</p><ul>' + bagian.join('') + '</ul>'
          : '') +
        (hasil.terlewat.length
          ? '<p>Masih ada <strong>' +
            hasil.terlewat.length +
            '</strong> jawaban tepat yang belum kamu pilih. Telaah lagi, lalu periksa ulang.</p>'
          : '')
    );
  }

  return (
    '<div class="multi-select" id="' +
    esc(id) +
    '">' +
    '<p class="multi-select__hint">' +
    esc(opts.hint || 'Pilih SEMUA yang tepat, lalu tekan Periksa.') +
    '</p>' +
    '<div class="challenge-options" role="group">' +
    list +
    '</div>' +
    (st.done
      ? ''
      : '<div class="btn-group"><button type="button" class="btn btn--primary" id="' +
        esc(id) +
        'Check"' +
        (st.chosen.length ? '' : ' disabled') +
        '>Periksa</button></div>') +
    feedback +
    '</div>'
  );
}

function bindMultiSelect(root, id, options, st, save, rerender) {
  if (st.done) return;
  root.querySelectorAll('[data-multi-id="' + id + '"]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var oid = btn.dataset.multiOpt;
      var k = st.chosen.indexOf(oid);
      if (k === -1) st.chosen.push(oid);
      else st.chosen.splice(k, 1);
      st.checked = false;
      save();
      rerender();
    });
  });
  var check = root.querySelector('#' + id + 'Check');
  if (check) {
    check.addEventListener('click', function () {
      if (!st.chosen.length) return;
      var hasil = periksaMultiPilih(options, st.chosen);
      st.attempts += 1;
      st.checked = true;
      st.done = hasil.semuaBenar;
      if (st.firstTry === null) st.firstTry = hasil.semuaBenar;
      save();
      rerender();
    });
  }
}

/* ============================================================
   11. SKALA LIKERT (REFLEKSI DIRI)
     items  = [{ id, teks }]
     skala  = [{ value, label }]
     values = { <itemId>: value }
   ============================================================ */

function buildLikertGroup(name, items, skala, values, locked) {
  return (
    '<div class="likert">' +
    items
      .map(function (item) {
        return (
          '<fieldset class="likert-row">' +
          '<legend class="likert-row__text">' +
          esc(item.teks) +
          '</legend>' +
          '<div class="likert-scale">' +
          skala
            .map(function (s) {
              var dipilih = values[item.id] === s.value;
              return (
                '<label class="likert-option' +
                (dipilih ? ' is-selected' : '') +
                '">' +
                '<input type="radio" name="' +
                esc(name + '-' + item.id) +
                '" value="' +
                s.value +
                '" data-likert="' +
                esc(name) +
                '" data-likert-item="' +
                esc(item.id) +
                '"' +
                (dipilih ? ' checked' : '') +
                (locked ? ' disabled' : '') +
                ' />' +
                '<span class="likert-option__num">' +
                s.value +
                '</span>' +
                '<span class="likert-option__label">' +
                esc(s.label) +
                '</span>' +
                '</label>'
              );
            })
            .join('') +
          '</div>' +
          '</fieldset>'
        );
      })
      .join('') +
    '</div>'
  );
}

function bindLikertGroup(root, name, values, save, rerender) {
  root.querySelectorAll('input[data-likert="' + name + '"]').forEach(function (input) {
    input.addEventListener('change', function () {
      var itemId = input.dataset.likertItem;
      values[itemId] = parseInt(input.value, 10);
      save();
      rerender();
      var next = root.querySelector(
        'input[data-likert-item="' + itemId + '"][value="' + input.value + '"]'
      );
      if (next) next.focus();
    });
  });
}

/* ============================================================
   12. ANALISIS KEBUTUHAN DATA
   Komponen khusus RPL untuk menganalisis kebutuhan data sebuah
   studi kasus: dokumen kebutuhan (transkrip wawancara, formulir,
   nota) yang frasanya ditandai [[id|teks]], skor pemilahan,
   cakupan kebutuhan terhadap rancangan, dan kartu entitas.
   ============================================================ */

var FRASA_RE = /\[\[([\w-]+)\|([^\]]+)\]\]/g;

/* Daftar frasa bertanda dalam teks, urut kemunculan: [{ id, label }]. */
function daftarFrasa(teks) {
  var out = [];
  var m;
  FRASA_RE.lastIndex = 0;
  while ((m = FRASA_RE.exec(teks))) out.push({ id: m[1], label: m[2] });
  return out;
}

/*
 * Mengubah penanda [[id|teks]] menjadi <mark> bernomor. Teks di luar
 * penanda diloloskan (esc); baris baru menjadi <br>.
 *   nomor  { <id>: nomor tampil } — opsional
 */
function tandaiFrasa(teks, nomor) {
  nomor = nomor || {};
  var html = '';
  var last = 0;
  var m;
  FRASA_RE.lastIndex = 0;
  while ((m = FRASA_RE.exec(teks))) {
    html += esc(teks.slice(last, m.index));
    html +=
      '<mark class="req-mark" data-frasa="' +
      esc(m[1]) +
      '">' +
      (nomor[m[1]]
        ? '<span class="req-mark__num" aria-label="frasa ' +
          nomor[m[1]] +
          '">' +
          nomor[m[1]] +
          '</span>'
        : '') +
      esc(m[2]) +
      '</mark>';
    last = m.index + m[0].length;
  }
  html += esc(teks.slice(last));
  return html.replace(/\n/g, '<br>');
}

/* Kartu dokumen kebutuhan. dok = { judul, ikon, jenis, teks }. */
function buildDokumenKebutuhan(dok, nomor) {
  return (
    '<article class="req-doc">' +
    '<header class="req-doc__head">' +
    '<span class="req-doc__icon" aria-hidden="true">' +
    (dok.ikon || '📄') +
    '</span>' +
    '<div><span class="req-doc__type">' +
    esc(dok.jenis || '') +
    '</span>' +
    '<h4 class="req-doc__title">' +
    esc(dok.judul) +
    '</h4></div>' +
    '</header>' +
    '<p class="req-doc__body">' +
    tandaiFrasa(dok.teks, nomor) +
    '</p>' +
    '</article>'
  );
}

/* Rekap skor pemilahan: { benar, total }. */
function nilaiPemilahan(items, states) {
  return { benar: sortItemsCorrectCount(items, states), total: items.length };
}

/*
 * Apakah sebuah kebutuhan dapat dipenuhi rancangan?
 *   atributRancangan  array id atribut yang ada di rancangan
 *   kebutuhan         { perlu: [id atribut yang dibutuhkan] }
 * → { terpenuhi, kurang: [id atribut yang belum ada] }
 */
function cakupanKebutuhan(atributRancangan, kebutuhan) {
  var kurang = (kebutuhan.perlu || []).filter(function (id) {
    return atributRancangan.indexOf(id) === -1;
  });
  return { terpenuhi: kurang.length === 0, kurang: kurang };
}

/*
 * Kartu entitas dengan daftar atributnya.
 *   ent    { id, label, ikon, deskripsi? }
 *   attrs  [{ id, teks }]
 *   opts.kunci       id atribut kunci (diberi 🔑); boleh array (kunci komposit)
 *   opts.fk          { <id atribut>: label entitas rujukan } — diberi 🔗
 *   opts.penghubung  true → ditandai sebagai entitas penghubung
 *   opts.kosong      teks bila belum ada atribut
 */
function buildEntityCard(ent, attrs, opts) {
  opts = opts || {};
  var kunci = [].concat(opts.kunci || []);
  var fk = opts.fk || {};
  return (
    '<div class="entity-card' +
    (opts.penghubung ? ' entity-card--link' : '') +
    '" data-entitas="' +
    esc(ent.id) +
    '">' +
    '<div class="entity-card__head">' +
    '<span class="entity-card__icon" aria-hidden="true">' +
    (ent.ikon || '🧩') +
    '</span>' +
    '<span class="entity-card__name">' +
    esc(ent.label) +
    '</span>' +
    (opts.penghubung ? '<span class="entity-card__tag">penghubung</span>' : '') +
    '</div>' +
    (attrs.length
      ? '<ul class="entity-card__attrs">' +
        attrs
          .map(function (a) {
            var key = kunci.indexOf(a.id) !== -1;
            var ref = fk[a.id];
            return (
              '<li class="entity-card__attr' +
              (key ? ' entity-card__attr--key' : '') +
              (ref ? ' entity-card__attr--fk' : '') +
              '">' +
              (key ? '<span aria-label="atribut kunci">🔑</span> ' : '') +
              (ref ? '<span aria-label="kunci tamu">🔗</span> ' : '') +
              esc(a.teks) +
              (ref ? ' <span class="entity-card__ref">→ ' + esc(ref) + '</span>' : '') +
              '</li>'
            );
          })
          .join('') +
        '</ul>'
      : '<p class="entity-card__empty">' + esc(opts.kosong || 'Belum ada atribut.') + '</p>') +
    '</div>'
  );
}

/* ============================================================
   13. RELASI & KARDINALITAS ERD
   Komponen RPL untuk menentukan jenis relasi dan kardinalitas
   antar dua entitas. Sebuah relasi dibaca dari dua arah:
     rel = { id, a: {id,label,ikon}, b: {id,label,ikon},
             kerja,       // kata kerja A → B, mis. 'mengikuti'
             kerjaBalik,  // kata kerja B → A, mis. 'diikuti oleh'
             ab,          // kardinalitas: satu A punya berapa B
             ba }         // kardinalitas: satu B punya berapa A
   Notasi kardinalitas 'min..maks' (0..1, 1..1, 0..N, 1..N).
   Pada diagram, notasi ditulis di dekat entitas yang dihitung
   (konvensi look-across): `ab` di sisi B, `ba` di sisi A.
   ============================================================ */

var KARDINALITAS_OPSI = [
  { id: '0..1', label: '<strong>0..1</strong> — boleh tidak ada, paling banyak satu' },
  { id: '1..1', label: '<strong>1..1</strong> — wajib ada, tepat satu' },
  { id: '0..N', label: '<strong>0..N</strong> — boleh tidak ada, bisa banyak' },
  { id: '1..N', label: '<strong>1..N</strong> — wajib minimal satu, bisa banyak' },
];

/* '0..N' → { min: '0', maks: 'N' }; notasi asing → null. */
function uraiKardinalitas(notasi) {
  var m = /^([01])\.\.([1N])$/.exec(notasi || '');
  return m ? { min: m[1], maks: m[2] } : null;
}

/* Jenis relasi dari batas maksimum dua arah:
   maksAB = paling banyak B untuk satu A; maksBA sebaliknya. */
function jenisRelasi(maksAB, maksBA) {
  if (maksAB === 'N' && maksBA === 'N') return 'M:N';
  if (maksAB === 'N') return '1:N';
  if (maksBA === 'N') return 'N:1';
  return '1:1';
}

/* Jenis relasi dari notasi ab & ba; null bila salah satu belum valid. */
function jenisDariKardinalitas(ab, ba) {
  var x = uraiKardinalitas(ab);
  var y = uraiKardinalitas(ba);
  return x && y ? jenisRelasi(x.maks, y.maks) : null;
}

/* Umpan balik terdiagnosa untuk satu sisi kardinalitas (HTML). */
function umpanKardinalitas(benar, dipilih) {
  var b = uraiKardinalitas(benar);
  var p = uraiKardinalitas(dipilih);
  if (!b || !p) return '';
  if (benar === dipilih) {
    return (
      '<strong>Tepat!</strong> ' +
      (b.min === '0' ? 'Boleh tidak punya pasangan' : 'Wajib punya pasangan') +
      ' dan ' +
      (b.maks === '1' ? 'paling banyak satu.' : 'bisa lebih dari satu.')
    );
  }
  var bagian = [];
  if (b.min !== p.min) {
    bagian.push(
      'Batas <strong>minimum</strong> belum tepat — ' +
        (b.min === '0'
          ? 'menurut aturan, pasangannya boleh <em>tidak ada</em> (opsional), jadi minimumnya 0.'
          : 'menurut aturan, pasangannya <em>wajib ada</em>, jadi minimumnya 1.')
    );
  }
  if (b.maks !== p.maks) {
    bagian.push(
      'Batas <strong>maksimum</strong> belum tepat — ' +
        (b.maks === 'N'
          ? 'baca lagi aturannya: apakah pasangannya bisa <em>lebih dari satu</em>?'
          : 'baca lagi aturannya: pasangannya dibatasi <em>hanya satu</em>.')
    );
  }
  return bagian.join(' ');
}

/* "Satu A <kerja> minimal x dan maksimal y B." untuk arah 'ab' / 'ba'.
   `notasi` opsional (bawaan rel[arah]); tidak valid → '?'. */
function kalimatRelasi(rel, arah, notasi) {
  var balik = arah === 'ba';
  var dari = balik ? rel.b : rel.a;
  var ke = balik ? rel.a : rel.b;
  var kerja = balik ? rel.kerjaBalik : rel.kerja;
  var k = uraiKardinalitas(arguments.length > 2 ? notasi : rel[arah]);
  var min = k ? k.min : '?';
  var maks = k ? (k.maks === 'N' ? 'banyak' : k.maks) : '?';
  return (
    'Satu ' +
    dari.label +
    ' ' +
    kerja +
    ' minimal ' +
    min +
    ' dan maksimal ' +
    maks +
    ' ' +
    ke.label +
    '.'
  );
}

var JENIS_RELASI_LABEL = {
  '1:1': 'One-to-One (1:1)',
  '1:N': 'One-to-Many (1:N)',
  'N:1': 'Many-to-One (N:1)',
  'M:N': 'Many-to-Many (M:N)',
};

/*
 * Diagram relasi gaya Chen: [A] notasi-ba —◇kerja◇— notasi-ab [B].
 *   opts.ab / opts.ba  notasi yang ditampilkan (bawaan rel.ab / rel.ba);
 *                      null/tidak valid → '?'
 *   opts.jenis         false → sembunyikan chip jenis relasi
 * Chip jenis relasi hanya tampil bila kedua sisi sudah valid.
 */
function buildRelasiDiagram(rel, opts) {
  opts = opts || {};
  var ab = 'ab' in opts ? opts.ab : rel.ab;
  var ba = 'ba' in opts ? opts.ba : rel.ba;
  var jenis = jenisDariKardinalitas(ab, ba);
  function ent(e) {
    return (
      '<span class="rel-diagram__ent"><span aria-hidden="true">' +
      (e.ikon || '🧩') +
      '</span> ' +
      esc(e.label) +
      '</span>'
    );
  }
  function kard(sisi, notasi) {
    var ok = !!uraiKardinalitas(notasi);
    return (
      '<span class="rel-diagram__card' +
      (ok ? '' : ' rel-diagram__card--kosong') +
      '" data-sisi="' +
      sisi +
      '">' +
      (ok ? esc(notasi) : '?') +
      '</span>'
    );
  }
  var label = kalimatRelasi(rel, 'ab', ab) + ' ' + kalimatRelasi(rel, 'ba', ba);
  return (
    '<figure class="rel-diagram" role="img" aria-label="' +
    esc(label) +
    '">' +
    '<div class="rel-diagram__row">' +
    ent(rel.a) +
    kard('ba', ba) +
    '<span class="rel-diagram__line" aria-hidden="true"></span>' +
    '<span class="rel-diagram__rel"><span>' +
    esc(rel.kerja) +
    '</span></span>' +
    '<span class="rel-diagram__line" aria-hidden="true"></span>' +
    kard('ab', ab) +
    ent(rel.b) +
    '</div>' +
    (jenis && opts.jenis !== false
      ? '<figcaption class="rel-diagram__jenis">Jenis relasi: <strong>' +
        esc(JENIS_RELASI_LABEL[jenis]) +
        '</strong></figcaption>'
      : '') +
    '</figure>'
  );
}

/*
 * Pemilih kardinalitas: untuk setiap relasi murid memilih notasi
 * sisi `ab` dan `ba` dari KARDINALITAS_OPSI (urutan diacak sekali per
 * sisi). Boleh dicoba lagi sampai tepat, lalu terkunci.
 *   state[key] = { <relId>: { ab: {chosen, order, firstTry}, ba: {...} } }
 */
function ensureKardinalitasState(state, key, relasi) {
  var map = state[key] && typeof state[key] === 'object' ? state[key] : {};
  var next = {};
  relasi.forEach(function (rel) {
    var st = map[rel.id] && typeof map[rel.id] === 'object' ? map[rel.id] : {};
    ['ab', 'ba'].forEach(function (s) {
      var sisi = st[s] && typeof st[s] === 'object' ? st[s] : {};
      if (sisi.chosen === undefined) sisi.chosen = null;
      if (sisi.firstTry === undefined) sisi.firstTry = null;
      ensureShuffledOrder(sisi, 'order', KARDINALITAS_OPSI);
      st[s] = sisi;
    });
    next[rel.id] = st;
  });
  state[key] = next;
  return next;
}

function kardinalitasSelesai(relasi, states) {
  return relasi.every(function (rel) {
    var st = states[rel.id];
    return st && st.ab.chosen === rel.ab && st.ba.chosen === rel.ba;
  });
}

/* Skor: banyaknya sisi yang tepat pada percobaan pertama. */
function skorKardinalitas(relasi, states) {
  var benar = 0;
  relasi.forEach(function (rel) {
    ['ab', 'ba'].forEach(function (s) {
      if (states[rel.id] && states[rel.id][s].firstTry === true) benar++;
    });
  });
  return { benar: benar, total: relasi.length * 2 };
}

function buildKardinalitasPicker(rel, st) {
  function sisi(s) {
    var balik = s === 'ba';
    var dari = balik ? rel.b : rel.a;
    var ke = balik ? rel.a : rel.b;
    var chosen = st[s].chosen;
    var tepat = chosen === rel[s];
    return (
      '<div class="kard-picker__side">' +
      '<p class="exercise-label">Satu <strong>' +
      esc(dari.label) +
      '</strong> ' +
      esc(balik ? rel.kerjaBalik : rel.kerja) +
      ' berapa <strong>' +
      esc(ke.label) +
      '</strong>?</p>' +
      buildChoiceGroup(KARDINALITAS_OPSI, st[s].order, {
        chosen: chosen,
        correctId: tepat ? rel[s] : null,
        grade: true,
        locked: tepat,
        group: rel.id + ':' + s,
        attr: 'data-kard',
      }) +
      (chosen
        ? '<div style="margin-top:var(--space-2);">' +
          buildFeedbackBox(
            tepat ? 'success' : 'warning',
            tepat ? '✓' : '💭',
            umpanKardinalitas(rel[s], chosen)
          ) +
          '</div>'
        : '') +
      '</div>'
    );
  }
  var tuntas = st.ab.chosen === rel.ab && st.ba.chosen === rel.ba;
  return (
    '<div class="kard-picker" data-relasi="' +
    esc(rel.id) +
    '">' +
    (rel.aturan ? '<p class="kard-picker__rule">📜 ' + esc(rel.aturan) + '</p>' : '') +
    buildRelasiDiagram(rel, { ab: st.ab.chosen, ba: st.ba.chosen, jenis: tuntas }) +
    '<div class="kard-picker__sides">' +
    sisi('ab') +
    sisi('ba') +
    '</div>' +
    '</div>'
  );
}

/* Memasang event semua pemilih kardinalitas di dalam `root`. */
function bindKardinalitasPicker(root, relasi, states, save, rerender) {
  var byId = {};
  relasi.forEach(function (rel) {
    byId[rel.id] = rel;
  });
  root.querySelectorAll('[data-kard]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var g = (btn.dataset.group || '').split(':');
      var rel = byId[g[0]];
      var s = g[1];
      if (!rel || (s !== 'ab' && s !== 'ba')) return;
      var st = states[rel.id][s];
      if (st.chosen === rel[s]) return;
      st.chosen = btn.dataset.kard;
      if (st.firstTry === null) st.firstTry = st.chosen === rel[s];
      save();
      rerender();
    });
  });
}

/* ============================================================
   14. KERJA KELOMPOK KOOPERATIF
   Kartu peran anggota tim, kuis individu sekali-jawab (skor dasar
   & evaluasi), poin peningkatan individu dan predikat tim (STAD).
   ============================================================ */

/* Kartu peran. peran = [{ id, ikon, label, tugas }], nama = { id: teks }. */
function buildPeranKelompok(peran, nama) {
  nama = nama || {};
  return (
    '<div class="role-grid">' +
    peran
      .map(function (p) {
        var id = 'peran-' + p.id;
        return (
          '<div class="role-card">' +
          '<span class="role-card__icon" aria-hidden="true">' +
          (p.ikon || '👤') +
          '</span>' +
          '<label class="role-card__label" for="' +
          esc(id) +
          '">' +
          esc(p.label) +
          '</label>' +
          '<p class="role-card__task">' +
          esc(p.tugas) +
          '</p>' +
          '<input type="text" class="input-text" id="' +
          esc(id) +
          '" data-peran="' +
          esc(p.id) +
          '" maxlength="40" autocomplete="off" placeholder="Nama anggota" value="' +
          esc(nama[p.id] || '') +
          '" />' +
          '</div>'
        );
      })
      .join('') +
    '</div>'
  );
}

/* Isian nama disimpan tanpa render ulang agar fokus tidak hilang. */
function bindPeranKelompok(root, nama, save) {
  root.querySelectorAll('[data-peran]').forEach(function (input) {
    input.addEventListener('input', function () {
      nama[input.dataset.peran] = input.value;
      save();
    });
  });
}

/*
 * Kuis sekali-jawab: setiap soal terkunci setelah dipilih, lalu kunci
 * dan umpan balik pilihan murid ditampilkan. Urutan opsi diambil dari
 * orders[q.id] (diacak sekali dengan ensureShuffledOrder).
 *   q = { id, tanya, opsi: [{id, label}], correct, umpan: { <idOpsi>: html } }
 */
function buildKuisSekali(list, orders, jawab) {
  return list
    .map(function (q, i) {
      var chosen = jawab[q.id] || null;
      var benar = chosen === q.correct;
      return (
        '<div class="quiz-item quiz-item--guided">' +
        '<p class="exercise-label"><span class="dl-step__num">' +
        (i + 1) +
        '</span>' +
        (q.tanya || q.teks) +
        '</p>' +
        buildChoiceGroup(q.opsi, orders[q.id], {
          chosen: chosen,
          correctId: q.correct,
          grade: true,
          locked: true,
          group: q.id,
          attr: 'data-kuis-opt',
        }) +
        (chosen
          ? '<div style="margin-top:var(--space-3);">' +
            buildFeedbackBox(
              benar ? 'success' : 'error',
              benar ? '✓' : '✗',
              (benar ? '<strong>Benar.</strong> ' : '<strong>Belum tepat.</strong> ') +
                (q.umpan[chosen] || '')
            ) +
            '</div>'
          : '') +
        '</div>'
      );
    })
    .join('');
}

function bindKuisSekali(root, list, jawab, save, rerender) {
  var byId = {};
  list.forEach(function (q) {
    byId[q.id] = q;
  });
  root.querySelectorAll('[data-kuis-opt]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var q = byId[btn.dataset.group];
      if (!q || jawab[q.id]) return;
      jawab[q.id] = btn.dataset.kuisOpt;
      save();
      rerender();
    });
  });
}

function kuisSelesai(list, jawab) {
  return list.every(function (q) {
    return !!jawab[q.id];
  });
}

/* { benar, total, nilai } — nilai berskala 0–100 (dibulatkan). */
function skorKuis(list, jawab) {
  var benar = list.filter(function (q) {
    return jawab[q.id] === q.correct;
  }).length;
  var total = list.length;
  return { benar: benar, total: total, nilai: total ? Math.round((benar / total) * 100) : 0 };
}

/*
 * Poin peningkatan individu model STAD (skor berskala 0–100):
 *   kuis < dasar − 10          →  5
 *   dasar − 10 ≤ kuis < dasar  → 10
 *   dasar ≤ kuis ≤ dasar + 10  → 20
 *   kuis > dasar + 10          → 30
 *   nilai sempurna (100)       → 30
 */
function poinPeningkatan(dasar, kuis) {
  if (kuis >= 100) return 30;
  if (kuis > dasar + 10) return 30;
  if (kuis >= dasar) return 20;
  if (kuis >= dasar - 10) return 10;
  return 5;
}

/* Rata-rata poin anggota; isian kosong/tidak valid diabaikan, [] → null. */
function rataPoinTim(list) {
  var nilai = (list || [])
    .filter(function (v) {
      return v !== null && v !== '' && !isNaN(Number(v));
    })
    .map(Number);
  if (!nilai.length) return null;
  var jumlah = nilai.reduce(function (a, b) {
    return a + b;
  }, 0);
  return Math.round((jumlah / nilai.length) * 10) / 10;
}

var PREDIKAT_TIM = [
  {
    id: 'super',
    min: 25,
    ikon: '🏆',
    label: 'Tim Super',
    pesan: 'Luar biasa! Setiap anggota tumbuh pesat — terus saling mengajari.',
  },
  {
    id: 'hebat',
    min: 20,
    ikon: '🥈',
    label: 'Tim Hebat',
    pesan: 'Hebat! Hampir semua anggota meningkat. Bantu teman yang masih ragu.',
  },
  {
    id: 'baik',
    min: 15,
    ikon: '🥉',
    label: 'Tim Baik',
    pesan: 'Kerja bagus! Cari bagian yang paling sering keliru, lalu bahas bersama.',
  },
  {
    id: 'berkembang',
    min: -Infinity,
    ikon: '🌱',
    label: 'Tim Berkembang',
    pesan: 'Tim kalian sedang tumbuh. Ulangi diskusi ahli dan saling uji dengan soal baru.',
  },
];

function predikatTim(rata) {
  for (var i = 0; i < PREDIKAT_TIM.length; i++) {
    if (rata >= PREDIKAT_TIM[i].min) return PREDIKAT_TIM[i];
  }
  return PREDIKAT_TIM[PREDIKAT_TIM.length - 1];
}

/* ============================================================
   15. ERD LENGKAP
   Komponen RPL untuk merangkai ERD utuh: entitas beserta atribut,
   kunci primer (PK), kunci tamu (FK), relasi & kardinalitas, dan
   entitas penghubung untuk relasi M:N.
     erd = {
       entitas: [{ id, label, ikon, penghubung?,
                   atribut: [{ id, teks, pk?, fk? }] }],
                   // pk: true → bagian kunci primer
                   // fk: id entitas yang dirujuk
       relasi:  [rel]   // format seksi 13; relasi M:N memakai
                        // rel.penghubung = id entitas penghubung
     }
   ============================================================ */

/*
 * Di mana kunci tamu sebuah relasi diletakkan?
 *   1:N → di sisi "banyak"; N:1 → kebalikannya;
 *   1:1 → di sisi yang wajib punya pasangan (minimum 1), bawaan B;
 *   M:N → tidak bisa: perlu entitas penghubung.
 * → { jenis: 'fk', di, rujuk } | { jenis: 'penghubung' } | null
 */
function letakKunciTamu(rel) {
  var j = jenisDariKardinalitas(rel.ab, rel.ba);
  if (!j) return null;
  if (j === 'M:N') return { jenis: 'penghubung' };
  if (j === '1:N') return { jenis: 'fk', di: rel.b.id, rujuk: rel.a.id };
  if (j === 'N:1') return { jenis: 'fk', di: rel.a.id, rujuk: rel.b.id };
  var bWajib = uraiKardinalitas(rel.ba).min === '1';
  var aWajib = uraiKardinalitas(rel.ab).min === '1';
  if (!bWajib && aWajib) return { jenis: 'fk', di: rel.a.id, rujuk: rel.b.id };
  return { jenis: 'fk', di: rel.b.id, rujuk: rel.a.id };
}

function erdEntitas(erd, id) {
  for (var i = 0; i < erd.entitas.length; i++) {
    if (erd.entitas[i].id === id) return erd.entitas[i];
  }
  return null;
}

/* Id atribut kunci primer sebuah entitas (bisa komposit). */
function kunciPrimer(ent) {
  return ent.atribut
    .filter(function (a) {
      return a.pk;
    })
    .map(function (a) {
      return a.id;
    });
}

function adaFk(ent, rujuk) {
  return (
    !!ent &&
    ent.atribut.some(function (a) {
      return a.fk === rujuk;
    })
  );
}

/*
 * Memeriksa kelengkapan ERD. → array pesan kesalahan; [] bila lengkap.
 *   • setiap entitas punya kunci primer;
 *   • setiap kunci tamu merujuk entitas yang ada;
 *   • relasi 1:1 / 1:N punya kunci tamu di tempat yang tepat;
 *   • relasi M:N punya entitas penghubung berkunci tamu ke kedua sisi.
 */
function periksaErd(erd) {
  var salah = [];
  erd.entitas.forEach(function (ent) {
    if (!kunciPrimer(ent).length) salah.push(ent.label + ' belum punya kunci primer.');
    ent.atribut.forEach(function (a) {
      if (a.fk && !erdEntitas(erd, a.fk)) {
        salah.push(ent.label + '.' + a.teks + ' merujuk entitas yang tidak ada.');
      }
    });
  });
  erd.relasi.forEach(function (rel) {
    var letak = letakKunciTamu(rel);
    var nama = rel.a.label + ' – ' + rel.b.label;
    if (!letak) {
      salah.push(nama + ': kardinalitas belum valid.');
    } else if (letak.jenis === 'penghubung') {
      var p = rel.penghubung ? erdEntitas(erd, rel.penghubung) : null;
      if (!p || !adaFk(p, rel.a.id) || !adaFk(p, rel.b.id)) {
        salah.push(nama + ': relasi M:N belum diwujudkan dengan entitas penghubung.');
      }
    } else if (!adaFk(erdEntitas(erd, letak.di), letak.rujuk)) {
      salah.push(nama + ': kunci tamu belum diletakkan di sisi yang tepat.');
    }
  });
  return salah;
}

/*
 * ERD lengkap yang responsif: legenda, kartu entitas (PK 🔑, FK 🔗,
 * entitas penghubung bertanda) dan daftar relasi gaya Chen.
 *   opts.judul   judul figur (opsional)
 *   opts.relasi  false → sembunyikan daftar relasi
 */
function buildErdLengkap(erd, opts) {
  opts = opts || {};
  var legenda =
    '<ul class="erd__legend" aria-label="Keterangan notasi">' +
    '<li><span class="erd__swatch erd__swatch--ent" aria-hidden="true"></span>Entitas</li>' +
    '<li><span class="erd__swatch erd__swatch--link" aria-hidden="true"></span>Entitas penghubung</li>' +
    '<li><span aria-hidden="true">🔑</span> Kunci primer (PK)</li>' +
    '<li><span aria-hidden="true">🔗</span> Kunci tamu (FK)</li>' +
    '</ul>';
  var kartu = erd.entitas
    .map(function (ent) {
      var fk = {};
      ent.atribut.forEach(function (a) {
        if (a.fk) {
          var r = erdEntitas(erd, a.fk);
          fk[a.id] = r ? r.label : a.fk;
        }
      });
      return buildEntityCard(ent, ent.atribut, {
        kunci: kunciPrimer(ent),
        fk: fk,
        penghubung: !!ent.penghubung,
      });
    })
    .join('');
  var relasi =
    opts.relasi === false
      ? ''
      : '<div class="erd__relasi">' +
        erd.relasi
          .map(function (rel) {
            var p = rel.penghubung ? erdEntitas(erd, rel.penghubung) : null;
            return (
              buildRelasiDiagram(rel) +
              (p
                ? '<p class="erd__catatan">↳ Diwujudkan lewat entitas penghubung <strong>' +
                  esc(p.label) +
                  '</strong>.</p>'
                : '')
            );
          })
          .join('') +
        '</div>';
  return (
    '<figure class="erd">' +
    (opts.judul ? '<figcaption class="erd__judul">' + esc(opts.judul) + '</figcaption>' : '') +
    legenda +
    '<div class="entity-grid erd__grid">' +
    kartu +
    '</div>' +
    relasi +
    '</figure>'
  );
}

/* ============================================================
   16. NORMALISASI BASIS DATA (1NF, 2NF, 3NF)
   Komponen RPL untuk menganalisis tabel dan memecahnya menjadi
   bentuk normal. Kunci kandidat dianggap sama dengan kunci
   primer `pk` (cukup untuk kasus belajar di SMK).
     tabel = {
       id, label, ikon?,
       kolom: [{ id, teks, fk? }],   // fk: id tabel yang dirujuk
       pk:    [idKolom],             // kunci primer (boleh gabungan)
       fd:    [{ id?, dari: [idKolom], ke: [idKolom] }],
       baris: [{ <idKolom>: nilai | [nilai, …] }]   // opsional
     }
   Sel berupa array berisi lebih dari satu nilai menandai nilai
   tidak atomik / grup berulang (bentuk tidak normal).
   Dekomposisi = [tabel tanpa fd]; ketergantungannya diambil dari
   tabel asal.
   ============================================================ */

function selAtomik(nilai) {
  return !Array.isArray(nilai) || nilai.length <= 1;
}

/* Kunci sebuah sel: "<indeks baris>:<id kolom>". */
function kunciSel(i, kolomId) {
  return i + ':' + kolomId;
}

function kolomIds(tabel) {
  return tabel.kolom.map(function (k) {
    return k.id;
  });
}

/* Apakah semua isi `a` ada di `b`? */
function termuat(a, b) {
  return a.every(function (x) {
    return b.indexOf(x) !== -1;
  });
}

function teksKolom(tabel, id) {
  for (var i = 0; i < tabel.kolom.length; i++) {
    if (tabel.kolom[i].id === id) return tabel.kolom[i].teks;
  }
  return id;
}

/* Kunci sel yang tidak atomik, urut baris lalu kolom. */
function selTakAtomik(tabel) {
  var out = [];
  (tabel.baris || []).forEach(function (b, i) {
    tabel.kolom.forEach(function (k) {
      if (!selAtomik(b[k.id])) out.push(kunciSel(i, k.id));
    });
  });
  return out;
}

/*
 * Bentuk 1NF dari baris bergrup berulang: setiap array (sejajar) dipecah
 * menjadi baris tersendiri; nilai tunggal disalin ke setiap baris
 * pecahan. Mengembalikan baris BARU; masukan tidak diubah.
 */
function ratakanBaris(baris) {
  var out = [];
  baris.forEach(function (b) {
    var n = 1;
    Object.keys(b).forEach(function (k) {
      if (Array.isArray(b[k])) n = Math.max(n, b[k].length);
    });
    for (var i = 0; i < n; i++) {
      var r = {};
      Object.keys(b).forEach(function (k) {
        var v = b[k];
        r[k] = Array.isArray(v) ? (v.length > 1 ? v[i] : v[0]) : v;
      });
      out.push(r);
    }
  });
  return out;
}

/* Closure atribut: semua kolom yang ditentukan oleh `attrs`. */
function tutupAtribut(attrs, fds) {
  var hasil = attrs.slice();
  var berubah = true;
  while (berubah) {
    berubah = false;
    fds.forEach(function (fd) {
      if (!termuat(fd.dari, hasil)) return;
      fd.ke.forEach(function (k) {
        if (hasil.indexOf(k) === -1) {
          hasil.push(k);
          berubah = true;
        }
      });
    });
  }
  return hasil;
}

/*
 * Ketergantungan yang berlaku di dalam sekumpulan kolom: untuk setiap
 * ruas kiri yang seluruhnya ada di `kolom`, ruas kanannya = closure ∩
 * kolom (urut `kolom`). → [{ dari, ke }]
 */
function proyeksiFd(fds, kolom) {
  var out = [];
  fds.forEach(function (fd) {
    if (!termuat(fd.dari, kolom)) return;
    var tutup = tutupAtribut(fd.dari, fds);
    var ke = kolom.filter(function (k) {
      return tutup.indexOf(k) !== -1 && fd.dari.indexOf(k) === -1;
    });
    if (ke.length) out.push({ dari: fd.dari.slice(), ke: ke });
  });
  return out;
}

/*
 * Jenis ketergantungan fungsional terhadap kunci primer tabel:
 *   'penuh'     ruas kiri memuat seluruh kunci primer
 *   'parsial'   ruas kiri hanya sebagian kunci primer (gabungan)
 *   'transitif' ruas kiri bukan (bagian) kunci — lewat atribut lain
 */
function jenisKetergantungan(fd, tabel) {
  if (termuat(tabel.pk, fd.dari)) return 'penuh';
  if (termuat(fd.dari, tabel.pk)) return 'parsial';
  return 'transitif';
}

/* "No Nota, Kode Barang → Jumlah" */
function fdTeks(fd, tabel) {
  function nama(ids) {
    return ids
      .map(function (id) {
        return teksKolom(tabel, id);
      })
      .join(', ');
  }
  return nama(fd.dari) + ' → ' + nama(fd.ke);
}

/*
 * Bentuk normal tertinggi sebuah tabel (0–3):
 *   0  ada sel tidak atomik, tidak berkunci, atau kunci primernya tidak
 *      menentukan semua kolom (baris kembar mungkin terjadi)
 *   1  ada atribut bukan kunci yang bergantung parsial pada kunci
 *   2  tidak ada parsial, tetapi ada ketergantungan transitif
 *   3  setiap atribut bukan kunci bergantung penuh & langsung pada kunci
 */
function bentukNormal(tabel) {
  var kolom = kolomIds(tabel);
  var pk = tabel.pk || [];
  if (tabel.baris && selTakAtomik(tabel).length) return 0;
  if (!pk.length || !termuat(kolom, tutupAtribut(pk, tabel.fd))) return 0;
  var nf = 3;
  proyeksiFd(tabel.fd, kolom).forEach(function (fd) {
    var bukanKunci = fd.ke.filter(function (k) {
      return pk.indexOf(k) === -1;
    });
    if (!bukanKunci.length) return;
    var j = jenisKetergantungan(fd, tabel);
    if (j === 'parsial') nf = Math.min(nf, 1);
    else if (j === 'transitif') nf = Math.min(nf, 2);
  });
  return nf;
}

function labelNf(nf) {
  return nf ? nf + 'NF' : 'bentuk tidak normal';
}

/*
 * Memeriksa rancangan hasil normalisasi terhadap tabel asal.
 * `target` bentuk normal yang dituju (bawaan 3). → [pesan kesalahan]
 */
function periksaDekomposisi(asal, hasil, target) {
  target = target || 3;
  var salah = [];
  var semua = kolomIds(asal);
  function nama(ids) {
    return ids
      .map(function (id) {
        return teksKolom(asal, id);
      })
      .join(', ');
  }

  semua.forEach(function (c) {
    var di = hasil.filter(function (t) {
      return kolomIds(t).indexOf(c) !== -1;
    });
    if (!di.length) {
      salah.push('Atribut "' + teksKolom(asal, c) + '" hilang dari rancangan.');
    } else if (
      di.length > 1 &&
      !di.some(function (t) {
        return t.pk.indexOf(c) !== -1;
      })
    ) {
      salah.push(
        'Atribut "' +
          teksKolom(asal, c) +
          '" disimpan di lebih dari satu tabel (' +
          di
            .map(function (t) {
              return t.label;
            })
            .join(', ') +
          ') padahal bukan kunci.'
      );
    }
  });

  hasil.forEach(function (t) {
    var kol = kolomIds(t);
    if (!t.pk.length || !termuat(kol, tutupAtribut(t.pk, asal.fd))) {
      salah.push('Kunci primer tabel ' + t.label + ' tidak menentukan semua kolomnya.');
      return;
    }
    var nf = bentukNormal({ kolom: t.kolom, pk: t.pk, fd: asal.fd });
    if (nf < target) {
      salah.push(
        'Tabel ' + t.label + ' baru memenuhi ' + labelNf(nf) + ', belum ' + target + 'NF.'
      );
    }
  });

  if (
    !hasil.some(function (t) {
      return termuat(asal.pk, kolomIds(t));
    })
  ) {
    salah.push(
      'Tidak ada tabel yang menyimpan kunci asal (' +
        nama(asal.pk) +
        '), sehingga data asal tidak bisa disusun kembali.'
    );
  }

  asal.fd.forEach(function (fd) {
    var perlu = fd.dari.concat(fd.ke);
    var terjaga = hasil.some(function (t) {
      return termuat(perlu, kolomIds(t));
    });
    if (!terjaga) {
      salah.push('Ketergantungan "' + fdTeks(fd, asal) + '" tidak terjaga di satu tabel pun.');
    }
  });

  return salah;
}

/* Baris unik setelah diproyeksikan ke `kolom`. */
function proyeksiBaris(baris, kolom) {
  var lihat = {};
  var out = [];
  baris.forEach(function (b) {
    var r = {};
    kolom.forEach(function (k) {
      r[k] = b[k];
    });
    var kunci = JSON.stringify(
      kolom.map(function (k) {
        return b[k];
      })
    );
    if (!lihat[kunci]) {
      lihat[kunci] = true;
      out.push(r);
    }
  });
  return out;
}

/*
 * Banyak sel tabel dan sel yang hanya mengulang fakta yang sudah
 * tercatat di baris sebelumnya (karena ketergantungan pada atribut
 * yang bukan kunci utuh). Baris harus sudah atomik. → { sel, berulang }
 */
function hitungRedundansi(tabel) {
  var kolom = kolomIds(tabel);
  var baris = tabel.baris || [];
  var berulang = {};
  proyeksiFd(tabel.fd, kolom).forEach(function (fd) {
    if (termuat(tabel.pk, fd.dari)) return;
    var sudah = {};
    baris.forEach(function (b, i) {
      var kunci = JSON.stringify(
        fd.dari.map(function (k) {
          return b[k];
        })
      );
      if (!sudah[kunci]) {
        sudah[kunci] = true;
        return;
      }
      fd.ke.forEach(function (k) {
        berulang[kunciSel(i, k)] = true;
      });
    });
  });
  return { sel: baris.length * kolom.length, berulang: Object.keys(berulang).length };
}

/* Total sel & sel berulang setelah tabel asal dipecah menjadi `hasil`. */
function hitungDekomposisi(asal, hasil) {
  var total = { sel: 0, berulang: 0 };
  hasil.forEach(function (t) {
    var kol = kolomIds(t);
    var r = hitungRedundansi({
      kolom: t.kolom,
      pk: t.pk,
      fd: asal.fd,
      baris: proyeksiBaris(asal.baris || [], kol),
    });
    total.sel += r.sel;
    total.berulang += r.berulang;
  });
  return total;
}

/* Pemeriksa murni sel ketuk → { semuaBenar, tepat, total, salah, terlewat }. */
function periksaSel(benar, pilih) {
  var salah = Object.keys(pilih || {}).filter(function (k) {
    return pilih[k] && benar.indexOf(k) === -1;
  });
  var terlewat = benar.filter(function (k) {
    return !pilih[k];
  });
  return {
    semuaBenar: !salah.length && !terlewat.length,
    tepat: benar.length - terlewat.length,
    total: benar.length,
    salah: salah,
    terlewat: terlewat,
  };
}

function nilaiSel(v) {
  return Array.isArray(v) ? v.join(', ') : v;
}

function tandaKolom(tabel, k) {
  var pk = tabel.pk || [];
  return (
    (pk.indexOf(k.id) !== -1 ? '<span aria-label="kunci primer">🔑</span> ' : '') +
    (k.fk ? '<span aria-label="kunci tamu">🔗</span> ' : '')
  );
}

/*
 * Tabel data responsif (bergulir mendatar di dalam wadahnya sendiri).
 *   opts.judul   caption tabel
 *   opts.baris   baris yang ditampilkan (bawaan tabel.baris)
 *   opts.ketuk   true → setiap sel menjadi tombol yang bisa ditandai
 *   opts.id      id tabel untuk bindTabelSel (wajib bila ketuk)
 *   opts.pilih   { <kunciSel>: true } sel yang ditandai murid
 *   opts.tanda   { <kunciSel>: 'benar' | 'salah' | 'terlewat' }
 *   opts.kunci   false → sembunyikan penanda kunci di kepala kolom
 */
function buildTabelData(tabel, opts) {
  opts = opts || {};
  var baris = opts.baris || tabel.baris || [];
  var pilih = opts.pilih || {};
  var tanda = opts.tanda || {};
  var kelasTanda = { benar: ' is-correct', salah: ' is-incorrect', terlewat: ' is-missed' };
  var label = opts.judul || tabel.label || 'Tabel data';
  return (
    '<div class="nf-table-wrap" tabindex="0" role="region" aria-label="' +
    esc(label) +
    '">' +
    '<table class="nf-table' +
    (opts.ketuk ? ' nf-table--ketuk' : '') +
    '">' +
    (opts.judul ? '<caption class="nf-table__caption">' + esc(opts.judul) + '</caption>' : '') +
    '<thead><tr>' +
    tabel.kolom
      .map(function (k) {
        return (
          '<th scope="col">' +
          (opts.kunci === false ? '' : tandaKolom(tabel, k)) +
          esc(k.teks) +
          '</th>'
        );
      })
      .join('') +
    '</tr></thead><tbody>' +
    baris
      .map(function (b, i) {
        return (
          '<tr>' +
          tabel.kolom
            .map(function (k) {
              var v = b[k.id];
              var majemuk = !selAtomik(v);
              if (!opts.ketuk) {
                return (
                  '<td' +
                  (majemuk ? ' class="nf-cell--majemuk"' : '') +
                  '>' +
                  esc(nilaiSel(v)) +
                  '</td>'
                );
              }
              var key = kunciSel(i, k.id);
              var on = !!pilih[key];
              return (
                '<td><button type="button" class="nf-cell-btn' +
                (on ? ' is-selected' : '') +
                (kelasTanda[tanda[key]] || '') +
                '" data-sel="' +
                esc(key) +
                '" data-tabel="' +
                esc(opts.id || '') +
                '" aria-pressed="' +
                on +
                '" aria-label="Baris ' +
                (i + 1) +
                ', ' +
                esc(k.teks) +
                ': ' +
                esc(nilaiSel(v)) +
                '">' +
                esc(nilaiSel(v)) +
                '</button></td>'
              );
            })
            .join('') +
          '</tr>'
        );
      })
      .join('') +
    '</tbody></table></div>'
  );
}

/* Memasang ketukan sel buildTabelData({ketuk:true}); pilih dimutasi. */
function bindTabelSel(root, id, pilih, save, rerender) {
  root.querySelectorAll('[data-tabel="' + id + '"][data-sel]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var key = btn.dataset.sel;
      if (pilih[key]) delete pilih[key];
      else pilih[key] = true;
      save();
      rerender();
    });
  });
}

/* Skema relasi ringkas: Nama(🔑 pk, kolom, 🔗 fk). */
function buildSkemaRelasi(tabel) {
  var pk = tabel.pk || [];
  return (
    '<div class="nf-schema">' +
    '<span class="nf-schema__nama">' +
    (tabel.ikon ? '<span aria-hidden="true">' + tabel.ikon + '</span> ' : '') +
    esc(tabel.label) +
    '</span>' +
    '<ul class="nf-schema__kolom" aria-label="Kolom tabel ' +
    esc(tabel.label) +
    '">' +
    tabel.kolom
      .map(function (k) {
        var key = pk.indexOf(k.id) !== -1;
        return (
          '<li class="nf-schema__kol' +
          (key ? ' nf-schema__kol--pk' : '') +
          (k.fk ? ' nf-schema__kol--fk' : '') +
          '">' +
          tandaKolom(tabel, k) +
          esc(k.teks) +
          '</li>'
        );
      })
      .join('') +
    '</ul></div>'
  );
}

/* ============================================================
   17. SQL DDL — PERINTAH PEMBUAT STRUKTUR BASIS DATA
   Komponen RPL untuk mengenal perintah Data Definition Language
   lewat simulasi DBMS mini di browser, lalu menurunkan struktur
   tabel dari ERD (format seksi 15).
     skema = { basisData: [{ nama, tabel: [tabel] }], aktif }
     tabel = { nama, baris,
               kolom: [{ nama, tipe, notNull, unique, autoInc, bawaan }],
               pk:    [namaKolom],
               fk:    [{ kolom, rujukTabel, rujukKolom }] }
   Atribut ERD boleh membawa `tipe` (mis. 'VARCHAR(50)') dan
   `wajib: true` (NOT NULL); entitas boleh membawa `tabel` (nama
   tabel bila berbeda dari id entitas).
   Simulator menjalankan perintah DDL (CREATE/ALTER/DROP/TRUNCATE/
   RENAME, CREATE/DROP DATABASE, USE) dan INSERT sederhana — cukup
   untuk membandingkan "mengubah struktur" dengan "mengubah isi".
   Nama tabel & kolom dibandingkan tanpa membedakan huruf besar.
   ============================================================ */

var SQL_KATEGORI = {
  CREATE: 'ddl',
  ALTER: 'ddl',
  DROP: 'ddl',
  TRUNCATE: 'ddl',
  RENAME: 'ddl',
  INSERT: 'dml',
  UPDATE: 'dml',
  DELETE: 'dml',
  SELECT: 'dml',
  GRANT: 'dcl',
  REVOKE: 'dcl',
  COMMIT: 'tcl',
  ROLLBACK: 'tcl',
  SAVEPOINT: 'tcl',
};

var SQL_TIPE = {
  INT: 'bulat',
  INTEGER: 'bulat',
  TINYINT: 'bulat',
  SMALLINT: 'bulat',
  MEDIUMINT: 'bulat',
  BIGINT: 'bulat',
  DECIMAL: 'desimal',
  NUMERIC: 'desimal',
  FLOAT: 'desimal',
  DOUBLE: 'desimal',
  CHAR: 'teks',
  VARCHAR: 'teks',
  TEXT: 'teks',
  DATE: 'waktu',
  DATETIME: 'waktu',
  TIMESTAMP: 'waktu',
  TIME: 'waktu',
  YEAR: 'waktu',
  BOOLEAN: 'logika',
  BOOL: 'logika',
};

var SQL_KATA_KUNCI = (
  'CREATE DATABASE SCHEMA TABLE USE ALTER ADD COLUMN DROP MODIFY RENAME TO TRUNCATE ' +
  'PRIMARY KEY FOREIGN REFERENCES CONSTRAINT NOT NULL UNIQUE DEFAULT AUTO_INCREMENT IF ' +
  'EXISTS INSERT INTO VALUES SELECT FROM WHERE UPDATE SET DELETE GRANT REVOKE ON COMMIT ROLLBACK'
).split(' ');

function samaNama(a, b) {
  return String(a).toLowerCase() === String(b).toLowerCase();
}

function cariNama(list, nama, kunci) {
  var k = kunci || 'nama';
  for (var i = 0; i < list.length; i++) {
    if (samaNama(list[i][k], nama)) return list[i];
  }
  return null;
}

/* Membuang komentar SQL (-- … dan /* … *\/) di luar teks berkutip. */
function buangKomentarSql(sql) {
  var s = String(sql || '');
  var out = '';
  var i = 0;
  while (i < s.length) {
    var c = s[i];
    if (c === "'" || c === '"' || c === '`') {
      var j = i + 1;
      while (j < s.length && s[j] !== c) j++;
      out += s.slice(i, j + 1);
      i = j + 1;
    } else if (c === '-' && s[i + 1] === '-') {
      while (i < s.length && s[i] !== '\n') i++;
    } else if (c === '/' && s[i + 1] === '*') {
      var e = s.indexOf('*/', i + 2);
      i = e === -1 ? s.length : e + 2;
    } else {
      out += c;
      i++;
    }
  }
  return out;
}

/* Memecah skrip menjadi pernyataan per titik koma (di luar kutip). */
function pecahPernyataan(sql) {
  var s = buangKomentarSql(sql);
  var out = [];
  var cur = '';
  var kutip = null;
  for (var i = 0; i < s.length; i++) {
    var c = s[i];
    if (kutip) {
      if (c === kutip) kutip = null;
      cur += c;
    } else if (c === "'" || c === '"' || c === '`') {
      kutip = c;
      cur += c;
    } else if (c === ';') {
      if (cur.trim()) out.push(cur.trim());
      cur = '';
    } else {
      cur += c;
    }
  }
  if (cur.trim()) out.push(cur.trim());
  return out;
}

/* Kategori bahasa sebuah perintah SQL: 'ddl' | 'dml' | 'dcl' | 'tcl' | 'lain'. */
function klasifikasiPerintah(sql) {
  var m = buangKomentarSql(sql)
    .trim()
    .match(/^[A-Za-z]+/);
  return (m && SQL_KATEGORI[m[0].toUpperCase()]) || 'lain';
}

/* Token: { t: 'kata' | 'id' | 'angka' | 'teks' | 'simbol', v }. */
function tokenSql(sql) {
  var s = String(sql);
  var out = [];
  var i = 0;
  while (i < s.length) {
    var c = s[i];
    if (/\s/.test(c)) {
      i++;
    } else if (c === "'" || c === '"') {
      var j = i + 1;
      while (j < s.length && s[j] !== c) j++;
      if (j >= s.length) throw { galat: 'Tanda kutip ' + c + ' belum ditutup.' };
      out.push({ t: 'teks', v: s.slice(i, j + 1) });
      i = j + 1;
    } else if (c === '`') {
      var k = s.indexOf('`', i + 1);
      if (k === -1) throw { galat: 'Tanda ` belum ditutup.' };
      out.push({ t: 'id', v: s.slice(i + 1, k) });
      i = k + 1;
    } else if (/[0-9]/.test(c) || (c === '-' && /[0-9]/.test(s[i + 1] || ''))) {
      var m = s.slice(i).match(/^-?[0-9]+(\.[0-9]+)?/);
      out.push({ t: 'angka', v: m[0] });
      i += m[0].length;
    } else if (/[A-Za-z_]/.test(c)) {
      var w = s.slice(i).match(/^[A-Za-z_][A-Za-z0-9_]*/)[0];
      out.push({ t: 'kata', v: w });
      i += w.length;
    } else {
      out.push({ t: 'simbol', v: c });
      i++;
    }
  }
  return out;
}

/* Kursor pengurai di atas daftar token. */
function kursorSql(tokens) {
  var i = 0;
  var K = {
    lihat: function (n) {
      return tokens[i + (n || 0)] || null;
    },
    habis: function () {
      return i >= tokens.length;
    },
    maju: function () {
      return tokens[i++] || null;
    },
    kata: function (w, n) {
      var t = K.lihat(n);
      return !!t && t.t === 'kata' && t.v.toUpperCase() === w;
    },
    ambilKata: function (w) {
      if (!K.kata(w)) return false;
      i++;
      return true;
    },
    harusKata: function (w, konteks) {
      if (K.ambilKata(w)) return;
      var t = K.lihat();
      throw {
        galat:
          'Diharapkan kata kunci ' +
          w +
          (konteks ? ' ' + konteks : '') +
          (t ? ', tetapi tertulis "' + t.v + '".' : ', tetapi pernyataan sudah berakhir.'),
      };
    },
    simbol: function (v) {
      var t = K.lihat();
      return !!t && t.t === 'simbol' && t.v === v;
    },
    harusSimbol: function (v, konteks) {
      if (K.simbol(v)) {
        i++;
        return;
      }
      var t = K.lihat();
      throw {
        galat:
          'Diharapkan tanda "' +
          v +
          '"' +
          (konteks ? ' ' + konteks : '') +
          (t ? ', tetapi tertulis "' + t.v + '".' : ', tetapi pernyataan sudah berakhir.'),
      };
    },
    nama: function (apa) {
      var t = K.lihat();
      if (t && (t.t === 'id' || t.t === 'kata')) {
        i++;
        return t.v;
      }
      throw { galat: 'Nama ' + apa + ' belum ditulis.' };
    },
    daftarNama: function (apa) {
      K.harusSimbol('(', 'sebelum daftar ' + apa);
      var out = [K.nama(apa)];
      while (K.simbol(',')) {
        i++;
        out.push(K.nama(apa));
      }
      K.harusSimbol(')', 'setelah daftar ' + apa);
      return out;
    },
  };
  return K;
}

/* nama TIPE[(n[,m])] [NOT NULL | NULL | UNIQUE | PRIMARY KEY | AUTO_INCREMENT | DEFAULT x]… */
function uraiKolomSql(K) {
  var kol = { nama: K.nama('kolom'), tipe: '', notNull: false, unique: false, autoInc: false };
  var t = K.maju();
  if (!t || t.t !== 'kata') throw { galat: 'Tipe data kolom ' + kol.nama + ' belum ditulis.' };
  var dasar = t.v.toUpperCase();
  if (!SQL_TIPE[dasar]) {
    throw { galat: 'Tipe data ' + t.v + ' (kolom ' + kol.nama + ') tidak dikenal.' };
  }
  var tipe = dasar;
  if (K.simbol('(')) {
    K.maju();
    var n = K.maju();
    if (!n || n.t !== 'angka') throw { galat: 'Panjang tipe ' + dasar + ' harus berupa angka.' };
    tipe += '(' + n.v;
    if (K.simbol(',')) {
      K.maju();
      var m = K.maju();
      if (!m || m.t !== 'angka') throw { galat: 'Skala tipe ' + dasar + ' harus berupa angka.' };
      tipe += ',' + m.v;
    }
    K.harusSimbol(')', 'setelah panjang tipe');
    tipe += ')';
  } else if (dasar === 'VARCHAR') {
    throw {
      galat: 'Tipe VARCHAR (kolom ' + kol.nama + ') wajib diberi panjang, mis. VARCHAR(50).',
    };
  }
  kol.tipe = tipe;
  var pk = false;
  for (;;) {
    if (K.ambilKata('NOT')) {
      K.harusKata('NULL', 'setelah NOT');
      kol.notNull = true;
    } else if (K.ambilKata('NULL')) {
      kol.notNull = false;
    } else if (K.ambilKata('UNIQUE')) {
      K.ambilKata('KEY');
      kol.unique = true;
    } else if (K.ambilKata('PRIMARY')) {
      K.harusKata('KEY', 'setelah PRIMARY');
      pk = true;
      kol.notNull = true;
    } else if (K.ambilKata('AUTO_INCREMENT')) {
      kol.autoInc = true;
    } else if (K.ambilKata('DEFAULT')) {
      var d = K.maju();
      if (!d || d.t === 'simbol')
        throw { galat: 'Nilai DEFAULT kolom ' + kol.nama + ' belum ditulis.' };
      kol.bawaan = d.v;
    } else {
      break;
    }
  }
  return { kolom: kol, pk: pk };
}

/* FOREIGN KEY (kolom) REFERENCES tabel(kolom) — FOREIGN sudah diambil. */
function uraiFkSql(K) {
  K.harusKata('KEY', 'setelah FOREIGN');
  var kol = K.daftarNama('kolom');
  K.harusKata('REFERENCES', 'setelah FOREIGN KEY (…)');
  var tab = K.nama('tabel rujukan');
  var ruj = K.daftarNama('kolom rujukan');
  if (kol.length !== 1 || ruj.length !== 1) {
    throw { galat: 'Di media ini setiap FOREIGN KEY memakai tepat satu kolom.' };
  }
  return { kolom: kol[0], rujukTabel: tab, rujukKolom: ruj[0] };
}

function uraiCreateTable(K) {
  var p = { jenis: 'createTable', ifNotExists: false, kolom: [], pk: [], fk: [] };
  if (K.ambilKata('IF')) {
    K.harusKata('NOT', 'setelah IF');
    K.harusKata('EXISTS', 'setelah IF NOT');
    p.ifNotExists = true;
  }
  p.nama = K.nama('tabel');
  K.harusSimbol('(', 'setelah nama tabel');
  for (;;) {
    if (K.ambilKata('PRIMARY')) {
      K.harusKata('KEY', 'setelah PRIMARY');
      p.pk = K.daftarNama('kolom kunci primer');
    } else if (K.kata('CONSTRAINT') || K.kata('FOREIGN')) {
      if (K.ambilKata('CONSTRAINT')) K.nama('constraint');
      K.harusKata('FOREIGN');
      p.fk.push(uraiFkSql(K));
    } else if (K.kata('UNIQUE') && K.lihat(1) && K.lihat(1).v === '(') {
      K.maju();
      var u = K.daftarNama('kolom');
      u.forEach(function (nm) {
        var k = cariNama(p.kolom, nm);
        if (k) k.unique = true;
      });
    } else {
      var hasil = uraiKolomSql(K);
      p.kolom.push(hasil.kolom);
      if (hasil.pk) p.pk.push(hasil.kolom.nama);
    }
    if (K.simbol(',')) {
      K.maju();
      continue;
    }
    K.harusSimbol(')', 'untuk menutup daftar kolom');
    break;
  }
  p.pk.forEach(function (nm) {
    var k = cariNama(p.kolom, nm);
    if (k) k.notNull = true;
  });
  return p;
}

function uraiAlterTable(K) {
  var p = { jenis: 'alterTable', nama: K.nama('tabel'), aksi: [] };
  for (;;) {
    if (K.ambilKata('ADD')) {
      if (K.ambilKata('PRIMARY')) {
        K.harusKata('KEY', 'setelah PRIMARY');
        p.aksi.push({ tipe: 'addPk', kolom: K.daftarNama('kolom kunci primer') });
      } else if (K.kata('CONSTRAINT') || K.kata('FOREIGN')) {
        if (K.ambilKata('CONSTRAINT')) K.nama('constraint');
        K.harusKata('FOREIGN');
        p.aksi.push({ tipe: 'addFk', fk: uraiFkSql(K) });
      } else {
        K.ambilKata('COLUMN');
        var h = uraiKolomSql(K);
        p.aksi.push({ tipe: 'add', kolom: h.kolom, pk: h.pk });
      }
    } else if (K.ambilKata('DROP')) {
      K.ambilKata('COLUMN');
      p.aksi.push({ tipe: 'drop', nama: K.nama('kolom') });
    } else if (K.ambilKata('MODIFY')) {
      K.ambilKata('COLUMN');
      p.aksi.push({ tipe: 'modify', kolom: uraiKolomSql(K).kolom });
    } else if (K.ambilKata('RENAME')) {
      if (K.ambilKata('COLUMN')) {
        var lama = K.nama('kolom');
        K.harusKata('TO', 'setelah RENAME COLUMN …');
        p.aksi.push({ tipe: 'renameCol', dari: lama, ke: K.nama('kolom baru') });
      } else {
        if (!K.ambilKata('TO')) K.ambilKata('AS');
        p.aksi.push({ tipe: 'renameTo', nama: K.nama('tabel baru') });
      }
    } else {
      var t = K.lihat();
      throw {
        galat:
          'Setelah ALTER TABLE ' +
          p.nama +
          ' tulis ADD, DROP, MODIFY, atau RENAME' +
          (t ? ' (tertulis "' + t.v + '").' : '.'),
      };
    }
    if (!K.simbol(',')) break;
    K.maju();
  }
  return p;
}

/* INSERT INTO t [(kolom…)] VALUES (…), (…) — hanya jumlah baris & nilai. */
function uraiInsert(K) {
  K.harusKata('INTO', 'setelah INSERT');
  var p = { jenis: 'insert', nama: K.nama('tabel'), kolom: null, baris: 0, nilai: [] };
  if (K.simbol('(')) p.kolom = K.daftarNama('kolom');
  K.harusKata('VALUES', 'sebelum daftar nilai');
  for (;;) {
    K.harusSimbol('(', 'sebelum nilai baris');
    var n = 0;
    while (!K.simbol(')')) {
      var t = K.maju();
      if (!t) throw { galat: 'Daftar nilai belum ditutup dengan ")".' };
      if (t.v !== ',') n++;
    }
    K.maju();
    p.baris++;
    p.nilai.push(n);
    if (!K.simbol(',')) break;
    K.maju();
  }
  return p;
}

function uraiSatuDdl(sql) {
  var kategori = klasifikasiPerintah(sql);
  try {
    var K = kursorSql(tokenSql(sql));
    var p;
    if (K.ambilKata('CREATE')) {
      if (K.ambilKata('DATABASE') || K.ambilKata('SCHEMA')) {
        p = { jenis: 'createDatabase', ifNotExists: false };
        if (K.ambilKata('IF')) {
          K.harusKata('NOT', 'setelah IF');
          K.harusKata('EXISTS', 'setelah IF NOT');
          p.ifNotExists = true;
        }
        p.nama = K.nama('basis data');
      } else if (K.ambilKata('TABLE')) {
        p = uraiCreateTable(K);
      } else {
        throw { galat: 'Setelah CREATE tulis DATABASE atau TABLE.' };
      }
    } else if (K.ambilKata('DROP')) {
      var db = K.ambilKata('DATABASE') || K.ambilKata('SCHEMA');
      if (!db) K.harusKata('TABLE', 'atau DATABASE setelah DROP');
      p = { jenis: db ? 'dropDatabase' : 'dropTable', ifExists: false };
      if (K.ambilKata('IF')) {
        K.harusKata('EXISTS', 'setelah IF');
        p.ifExists = true;
      }
      p.nama = K.nama(db ? 'basis data' : 'tabel');
    } else if (K.ambilKata('USE')) {
      p = { jenis: 'use', nama: K.nama('basis data') };
    } else if (K.ambilKata('ALTER')) {
      K.harusKata('TABLE', 'setelah ALTER');
      p = uraiAlterTable(K);
    } else if (K.ambilKata('TRUNCATE')) {
      K.ambilKata('TABLE');
      p = { jenis: 'truncate', nama: K.nama('tabel') };
    } else if (K.ambilKata('RENAME')) {
      K.harusKata('TABLE', 'setelah RENAME');
      p = { jenis: 'renameTable', dari: K.nama('tabel') };
      K.harusKata('TO', 'di antara nama lama dan nama baru');
      p.ke = K.nama('tabel baru');
    } else if (K.ambilKata('INSERT')) {
      p = uraiInsert(K);
    } else if (kategori !== 'lain') {
      return { jenis: 'bukanDdl', kategori: kategori, sql: sql };
    } else {
      var t0 = K.lihat();
      throw { galat: 'Perintah "' + (t0 ? t0.v : '') + '" tidak dikenali.' };
    }
    if (!K.habis()) throw { galat: 'Ada teks berlebih: "' + K.lihat().v + '".' };
    p.sql = sql;
    return p;
  } catch (e) {
    if (!e || !e.galat) throw e;
    return { jenis: 'galat', pesan: e.galat, sql: sql };
  }
}

/* Mengurai skrip SQL menjadi daftar pernyataan terstruktur. */
function uraiDdl(sql) {
  return pecahPernyataan(sql).map(uraiSatuDdl);
}

function skemaKosong() {
  return { basisData: [], aktif: null };
}

function ddlDbAktif(skema) {
  return skema && skema.aktif ? cariNama(skema.basisData, skema.aktif) : null;
}

function ddlTabel(skema, nama) {
  var db = ddlDbAktif(skema);
  return db ? cariNama(db.tabel, nama) : null;
}

/* Tipe dasar tanpa panjang; INTEGER disamakan dengan INT. */
function tipeDasar(tipe) {
  var d = String(tipe || '')
    .toUpperCase()
    .replace(/\(.*$/, '');
  return d === 'INTEGER' ? 'INT' : d;
}

function ddlPerluDb(skema) {
  var db = ddlDbAktif(skema);
  if (!db) {
    throw { galat: 'Belum ada basis data yang dipilih. Jalankan USE nama_basis_data; lebih dulu.' };
  }
  return db;
}

function ddlPerluTabel(db, nama) {
  var t = cariNama(db.tabel, nama);
  if (!t) throw { galat: 'Tabel ' + nama + ' tidak ada di basis data ' + db.nama + '.' };
  return t;
}

/* Tabel lain yang punya kunci tamu ke `nama` (opsional: ke kolom tertentu). */
function perujukTabel(db, nama, kolom) {
  return db.tabel.filter(function (t) {
    return (
      !samaNama(t.nama, nama) &&
      t.fk.some(function (f) {
        return samaNama(f.rujukTabel, nama) && (!kolom || samaNama(f.rujukKolom, kolom));
      })
    );
  });
}

function periksaFkBaru(db, t, fk) {
  var k = cariNama(t.kolom, fk.kolom);
  if (!k)
    throw { galat: 'Kolom ' + fk.kolom + ' untuk FOREIGN KEY tidak ada di tabel ' + t.nama + '.' };
  var r = cariNama(db.tabel, fk.rujukTabel);
  if (!r) {
    throw {
      galat:
        'Tabel rujukan ' +
        fk.rujukTabel +
        ' belum ada. Buat tabel ' +
        fk.rujukTabel +
        ' lebih dulu, baru tabel ' +
        t.nama +
        ' yang merujuknya.',
    };
  }
  var rk = cariNama(r.kolom, fk.rujukKolom);
  if (!rk)
    throw { galat: 'Kolom ' + fk.rujukKolom + ' tidak ada di tabel rujukan ' + r.nama + '.' };
  var kunci =
    rk.unique ||
    (r.pk.length === 1 && samaNama(r.pk[0], rk.nama)) ||
    (r.pk.length > 1 && samaNama(r.pk[0], rk.nama));
  if (!kunci) {
    throw {
      galat:
        'Kolom ' +
        r.nama +
        '.' +
        rk.nama +
        ' bukan kunci primer, jadi tidak bisa dirujuk kunci tamu.',
    };
  }
  if (tipeDasar(k.tipe) !== tipeDasar(rk.tipe)) {
    throw {
      galat:
        'Tipe data ' +
        t.nama +
        '.' +
        k.nama +
        ' (' +
        k.tipe +
        ') harus sama dengan ' +
        r.nama +
        '.' +
        rk.nama +
        ' (' +
        rk.tipe +
        ') yang dirujuknya.',
    };
  }
}

function gantiRujukan(db, lama, baru) {
  db.tabel.forEach(function (t) {
    t.fk.forEach(function (f) {
      if (samaNama(f.rujukTabel, lama)) f.rujukTabel = baru;
    });
  });
}

/* Menerapkan satu pernyataan pada skema (dimutasi). → pesan sukses. */
function terapkanDdl(skema, p) {
  var db, t, ada;
  switch (p.jenis) {
    case 'galat':
      throw { galat: 'Galat sintaks: ' + p.pesan };
    case 'bukanDdl':
      throw {
        galat:
          'Perintah ini termasuk ' +
          p.kategori.toUpperCase() +
          '. Simulator ini hanya menjalankan perintah DDL (ditambah INSERT untuk contoh isi data).',
      };
    case 'createDatabase':
      if (cariNama(skema.basisData, p.nama)) {
        if (p.ifNotExists) return 'Basis data ' + p.nama + ' sudah ada — dilewati (IF NOT EXISTS).';
        throw { galat: 'Basis data ' + p.nama + ' sudah ada.' };
      }
      skema.basisData.push({ nama: p.nama, tabel: [] });
      return (
        'Basis data ' + p.nama + ' dibuat. Pilih dengan USE ' + p.nama + '; sebelum membuat tabel.'
      );
    case 'dropDatabase':
      db = cariNama(skema.basisData, p.nama);
      if (!db) {
        if (p.ifExists) return 'Basis data ' + p.nama + ' tidak ada — dilewati (IF EXISTS).';
        throw { galat: 'Basis data ' + p.nama + ' tidak ada.' };
      }
      skema.basisData.splice(skema.basisData.indexOf(db), 1);
      if (skema.aktif && samaNama(skema.aktif, db.nama)) skema.aktif = null;
      return 'Basis data ' + db.nama + ' beserta semua tabelnya dihapus.';
    case 'use':
      db = cariNama(skema.basisData, p.nama);
      if (!db) {
        throw { galat: 'Basis data ' + p.nama + ' belum ada. Buat dulu dengan CREATE DATABASE.' };
      }
      skema.aktif = db.nama;
      return 'Basis data ' + db.nama + ' sekarang aktif.';
    case 'createTable':
      db = ddlPerluDb(skema);
      if (cariNama(db.tabel, p.nama)) {
        if (p.ifNotExists) return 'Tabel ' + p.nama + ' sudah ada — dilewati (IF NOT EXISTS).';
        throw { galat: 'Tabel ' + p.nama + ' sudah ada.' };
      }
      t = { nama: p.nama, baris: 0, kolom: [], pk: [], fk: [] };
      p.kolom.forEach(function (k) {
        if (cariNama(t.kolom, k.nama)) throw { galat: 'Kolom ' + k.nama + ' ditulis dua kali.' };
        t.kolom.push(JSON.parse(JSON.stringify(k)));
      });
      p.pk.forEach(function (nm) {
        var k = cariNama(t.kolom, nm);
        if (!k) throw { galat: 'Kunci primer memakai kolom ' + nm + ' yang tidak ada di tabel.' };
        t.pk.push(k.nama);
      });
      p.fk.forEach(function (f) {
        periksaFkBaru(db, t, f);
        t.fk.push({ kolom: f.kolom, rujukTabel: f.rujukTabel, rujukKolom: f.rujukKolom });
      });
      db.tabel.push(t);
      return 'Tabel ' + t.nama + ' dibuat dengan ' + t.kolom.length + ' kolom.';
    case 'alterTable':
      db = ddlPerluDb(skema);
      t = ddlPerluTabel(db, p.nama);
      return p.aksi
        .map(function (a) {
          return terapkanAlter(db, t, a);
        })
        .join(' ');
    case 'dropTable':
      db = ddlPerluDb(skema);
      t = cariNama(db.tabel, p.nama);
      if (!t) {
        if (p.ifExists) return 'Tabel ' + p.nama + ' tidak ada — dilewati (IF EXISTS).';
        throw { galat: 'Tabel ' + p.nama + ' tidak ada.' };
      }
      ada = perujukTabel(db, t.nama);
      if (ada.length) {
        throw {
          galat:
            'Tabel ' +
            t.nama +
            ' masih dirujuk kunci tamu tabel ' +
            ada[0].nama +
            '. Hapus tabel ' +
            ada[0].nama +
            ' lebih dulu.',
        };
      }
      db.tabel.splice(db.tabel.indexOf(t), 1);
      return 'Tabel ' + t.nama + ' beserta struktur dan seluruh isinya dihapus.';
    case 'truncate':
      db = ddlPerluDb(skema);
      t = ddlPerluTabel(db, p.nama);
      ada = t.baris;
      t.baris = 0;
      return 'Isi tabel ' + t.nama + ' dikosongkan (' + ada + ' baris dihapus). Strukturnya tetap.';
    case 'renameTable':
      db = ddlPerluDb(skema);
      t = ddlPerluTabel(db, p.dari);
      if (cariNama(db.tabel, p.ke)) throw { galat: 'Tabel ' + p.ke + ' sudah ada.' };
      gantiRujukan(db, t.nama, p.ke);
      ada = t.nama;
      t.nama = p.ke;
      return 'Tabel ' + ada + ' berganti nama menjadi ' + p.ke + '. Isi dan strukturnya tetap.';
    case 'insert':
      db = ddlPerluDb(skema);
      t = ddlPerluTabel(db, p.nama);
      (p.kolom || []).forEach(function (nm) {
        if (!cariNama(t.kolom, nm)) {
          throw { galat: 'Kolom ' + nm + ' tidak ada di tabel ' + t.nama + '.' };
        }
      });
      var perlu = p.kolom ? p.kolom.length : t.kolom.length;
      p.nilai.forEach(function (n) {
        if (n !== perlu) {
          throw {
            galat:
              'Jumlah nilai (' +
              n +
              ') tidak sama dengan jumlah kolom (' +
              perlu +
              ') tabel ' +
              t.nama +
              '.',
          };
        }
      });
      t.baris += p.baris;
      return (
        p.baris +
        ' baris data ditambahkan ke tabel ' +
        t.nama +
        '. Isinya bertambah, strukturnya tidak berubah.'
      );
  }
  throw { galat: 'Pernyataan tidak dikenali.' };
}

function terapkanAlter(db, t, a) {
  var k;
  if (a.tipe === 'add') {
    if (cariNama(t.kolom, a.kolom.nama)) {
      throw { galat: 'Kolom ' + a.kolom.nama + ' sudah ada di tabel ' + t.nama + '.' };
    }
    t.kolom.push(JSON.parse(JSON.stringify(a.kolom)));
    if (a.pk) t.pk = [a.kolom.nama];
    return 'Kolom ' + a.kolom.nama + ' ditambahkan ke tabel ' + t.nama + '.';
  }
  if (a.tipe === 'drop') {
    k = cariNama(t.kolom, a.nama);
    if (!k) throw { galat: 'Kolom ' + a.nama + ' tidak ada di tabel ' + t.nama + '.' };
    var ruj = perujukTabel(db, t.nama, k.nama);
    if (ruj.length) {
      throw {
        galat:
          'Kolom ' +
          k.nama +
          ' dirujuk kunci tamu tabel ' +
          ruj[0].nama +
          ', jadi tidak bisa dihapus.',
      };
    }
    if (t.kolom.length === 1) {
      throw {
        galat: 'Tabel harus punya minimal satu kolom. Pakai DROP TABLE untuk menghapus tabel.',
      };
    }
    t.kolom.splice(t.kolom.indexOf(k), 1);
    t.pk = t.pk.filter(function (nm) {
      return !samaNama(nm, k.nama);
    });
    t.fk = t.fk.filter(function (f) {
      return !samaNama(f.kolom, k.nama);
    });
    return 'Kolom ' + k.nama + ' dihapus dari tabel ' + t.nama + '.';
  }
  if (a.tipe === 'modify') {
    k = cariNama(t.kolom, a.kolom.nama);
    if (!k) throw { galat: 'Kolom ' + a.kolom.nama + ' tidak ada di tabel ' + t.nama + '.' };
    var baru = JSON.parse(JSON.stringify(a.kolom));
    baru.nama = k.nama;
    if (
      t.pk.some(function (nm) {
        return samaNama(nm, k.nama);
      })
    )
      baru.notNull = true;
    t.kolom[t.kolom.indexOf(k)] = baru;
    return 'Definisi kolom ' + k.nama + ' diubah menjadi ' + baru.tipe + '.';
  }
  if (a.tipe === 'renameCol') {
    k = cariNama(t.kolom, a.dari);
    if (!k) throw { galat: 'Kolom ' + a.dari + ' tidak ada di tabel ' + t.nama + '.' };
    if (cariNama(t.kolom, a.ke))
      throw { galat: 'Kolom ' + a.ke + ' sudah ada di tabel ' + t.nama + '.' };
    var lama = k.nama;
    t.pk = t.pk.map(function (nm) {
      return samaNama(nm, lama) ? a.ke : nm;
    });
    t.fk.forEach(function (f) {
      if (samaNama(f.kolom, lama)) f.kolom = a.ke;
    });
    db.tabel.forEach(function (o) {
      o.fk.forEach(function (f) {
        if (samaNama(f.rujukTabel, t.nama) && samaNama(f.rujukKolom, lama)) f.rujukKolom = a.ke;
      });
    });
    k.nama = a.ke;
    return 'Kolom ' + lama + ' berganti nama menjadi ' + a.ke + '.';
  }
  if (a.tipe === 'renameTo') {
    if (cariNama(db.tabel, a.nama)) throw { galat: 'Tabel ' + a.nama + ' sudah ada.' };
    var dulu = t.nama;
    gantiRujukan(db, dulu, a.nama);
    t.nama = a.nama;
    return 'Tabel ' + dulu + ' berganti nama menjadi ' + a.nama + '.';
  }
  if (a.tipe === 'addPk') {
    if (t.pk.length) throw { galat: 'Tabel ' + t.nama + ' sudah punya kunci primer.' };
    a.kolom.forEach(function (nm) {
      var kk = cariNama(t.kolom, nm);
      if (!kk) throw { galat: 'Kolom ' + nm + ' tidak ada di tabel ' + t.nama + '.' };
      kk.notNull = true;
      t.pk.push(kk.nama);
    });
    return 'Kunci primer (' + t.pk.join(', ') + ') ditambahkan ke tabel ' + t.nama + '.';
  }
  periksaFkBaru(db, t, a.fk);
  t.fk.push({ kolom: a.fk.kolom, rujukTabel: a.fk.rujukTabel, rujukKolom: a.fk.rujukKolom });
  return (
    'Kunci tamu ' + a.fk.kolom + ' → ' + a.fk.rujukTabel + '.' + a.fk.rujukKolom + ' ditambahkan.'
  );
}

/*
 * Menjalankan skrip SQL pada salinan skema. Berhenti di galat pertama
 * (pernyataan sebelumnya tetap berlaku, seperti DBMS sungguhan).
 * → { ok, skema, log: [{ sql, ok, pesan, kategori }] }
 */
function jalankanDdl(skema, sql) {
  var s = JSON.parse(JSON.stringify(skema || skemaKosong()));
  var log = [];
  var ok = true;
  var daftar = uraiDdl(sql);
  for (var i = 0; i < daftar.length; i++) {
    var p = daftar[i];
    var entri = { sql: p.sql, kategori: klasifikasiPerintah(p.sql), ok: true, pesan: '' };
    try {
      entri.pesan = terapkanDdl(s, p);
    } catch (e) {
      if (!e || !e.galat) throw e;
      entri.ok = false;
      entri.pesan = e.galat;
    }
    log.push(entri);
    if (!entri.ok) {
      ok = false;
      break;
    }
  }
  if (!daftar.length) {
    ok = false;
    log.push({
      sql: '',
      kategori: 'lain',
      ok: false,
      pesan: 'Belum ada perintah SQL yang ditulis.',
    });
  }
  return { ok: ok, skema: s, log: log };
}

/* Struktur tabel harapan dari ERD lengkap (urutan entitas ERD). */
function strukturDariErd(erd) {
  function namaTabel(ent) {
    return ent.tabel || ent.id;
  }
  return erd.entitas.map(function (ent) {
    var pk = kunciPrimer(ent);
    return {
      nama: namaTabel(ent),
      kolom: ent.atribut.map(function (a) {
        return {
          nama: a.teks,
          tipe: a.tipe || 'VARCHAR(50)',
          notNull: !!(a.pk || a.wajib),
        };
      }),
      pk: ent.atribut
        .filter(function (a) {
          return pk.indexOf(a.id) !== -1;
        })
        .map(function (a) {
          return a.teks;
        }),
      fk: ent.atribut
        .filter(function (a) {
          return a.fk;
        })
        .map(function (a) {
          var ref = erdEntitas(erd, a.fk);
          var refPk = ref.atribut.filter(function (x) {
            return x.pk;
          });
          var sama = refPk.filter(function (x) {
            return x.teks === a.teks;
          })[0];
          return {
            kolom: a.teks,
            rujukTabel: namaTabel(ref),
            rujukKolom: (sama || refPk[0]).teks,
          };
        }),
    };
  });
}

function tergantungPada(t) {
  return t.fk
    .map(function (f) {
      return f.rujukTabel;
    })
    .filter(function (n) {
      return !samaNama(n, t.nama);
    });
}

/*
 * Urutan CREATE TABLE yang sah: tabel induk (yang dirujuk) lebih dulu.
 * `preferensi` (daftar nama tabel) diikuti sejauh masih sah, sehingga
 * urutan murid yang benar dikembalikan apa adanya.
 */
function urutanBuatTabel(erd, preferensi) {
  var st = strukturDariErd(erd);
  var prioritas = (preferensi || [])
    .map(function (n) {
      return cariNama(st, n);
    })
    .filter(Boolean);
  st.forEach(function (t) {
    if (prioritas.indexOf(t) === -1) prioritas.push(t);
  });
  var hasil = [];
  while (hasil.length < st.length) {
    var pilih = null;
    for (var i = 0; i < prioritas.length && !pilih; i++) {
      var t = prioritas[i];
      if (hasil.indexOf(t.nama) !== -1) continue;
      var siap = tergantungPada(t).every(function (n) {
        return hasil.some(function (h) {
          return samaNama(h, n);
        });
      });
      if (siap) pilih = t;
    }
    if (!pilih) {
      pilih = prioritas.filter(function (x) {
        return hasil.indexOf(x.nama) === -1;
      })[0];
    }
    hasil.push(pilih.nama);
  }
  return hasil;
}

function urutanValid(erd, urutan) {
  var st = strukturDariErd(erd);
  if (!Array.isArray(urutan) || urutan.length !== st.length) return false;
  return urutanBuatTabel(erd, urutan).join('|') === urutan.join('|');
}

/* Membandingkan basis data aktif dengan struktur harapan. → [pesan]. */
function periksaStruktur(skema, harapan) {
  var db = ddlDbAktif(skema);
  if (!db) return ['Belum ada basis data yang aktif.'];
  var salah = [];
  harapan.forEach(function (h) {
    var t = cariNama(db.tabel, h.nama);
    if (!t) {
      salah.push('Tabel ' + h.nama + ' belum ada.');
      return;
    }
    h.kolom.forEach(function (hk) {
      var k = cariNama(t.kolom, hk.nama);
      if (!k) salah.push('Tabel ' + h.nama + ' belum punya kolom ' + hk.nama + '.');
      else if (tipeDasar(k.tipe) !== tipeDasar(hk.tipe)) {
        salah.push(
          'Kolom ' + h.nama + '.' + hk.nama + ' bertipe ' + k.tipe + ', seharusnya ' + hk.tipe + '.'
        );
      }
    });
    var kunci = function (arr) {
      return arr
        .map(function (n) {
          return n.toLowerCase();
        })
        .sort()
        .join(',');
    };
    if (kunci(t.pk) !== kunci(h.pk)) {
      salah.push('Kunci primer tabel ' + h.nama + ' seharusnya (' + h.pk.join(', ') + ').');
    }
    h.fk.forEach(function (hf) {
      var ada = t.fk.some(function (f) {
        return samaNama(f.kolom, hf.kolom) && samaNama(f.rujukTabel, hf.rujukTabel);
      });
      if (!ada) {
        salah.push(
          'Tabel ' +
            h.nama +
            ' belum punya kunci tamu ' +
            hf.kolom +
            ' → ' +
            hf.rujukTabel +
            '.' +
            hf.rujukKolom +
            '.'
        );
      }
    });
  });
  return salah;
}

/* Teks CREATE TABLE terformat untuk satu struktur tabel. */
function ddlBuatTabel(t) {
  var baris = t.kolom.map(function (k) {
    return '  ' + k.nama + ' ' + k.tipe + (k.notNull ? ' NOT NULL' : '');
  });
  if (t.pk.length) baris.push('  PRIMARY KEY (' + t.pk.join(', ') + ')');
  t.fk.forEach(function (f) {
    baris.push(
      '  FOREIGN KEY (' + f.kolom + ') REFERENCES ' + f.rujukTabel + '(' + f.rujukKolom + ')'
    );
  });
  return 'CREATE TABLE ' + t.nama + ' (\n' + baris.join(',\n') + '\n);';
}

/* Skrip lengkap: CREATE DATABASE, USE, lalu CREATE TABLE berurutan. */
function ddlSkripErd(erd, namaDb, urutan) {
  var st = strukturDariErd(erd);
  var u = urutan || urutanBuatTabel(erd);
  return (
    'CREATE DATABASE ' +
    namaDb +
    ';\nUSE ' +
    namaDb +
    ';\n\n' +
    u
      .map(function (n) {
        return ddlBuatTabel(cariNama(st, n));
      })
      .join('\n\n')
  );
}

/* Penyorot sintaks SQL; setiap potongan di-escape lebih dulu. */
function sorotSql(sql) {
  var s = String(sql || '');
  var out = '';
  var i = 0;
  function bungkus(cls, teks) {
    return '<span class="' + cls + '">' + esc(teks) + '</span>';
  }
  while (i < s.length) {
    var c = s[i];
    var j;
    if (c === '-' && s[i + 1] === '-') {
      j = s.indexOf('\n', i);
      if (j === -1) j = s.length;
      out += bungkus('sql-com', s.slice(i, j));
      i = j;
    } else if (c === "'" || c === '"') {
      j = s.indexOf(c, i + 1);
      j = j === -1 ? s.length : j + 1;
      out += bungkus('sql-str', s.slice(i, j));
      i = j;
    } else if (/[0-9]/.test(c) && !/[A-Za-z_]/.test(s[i - 1] || '')) {
      var m = s.slice(i).match(/^[0-9]+(\.[0-9]+)?/)[0];
      out += bungkus('sql-num', m);
      i += m.length;
    } else if (/[A-Za-z_]/.test(c)) {
      var w = s.slice(i).match(/^[A-Za-z_][A-Za-z0-9_]*/)[0];
      var up = w.toUpperCase();
      if (SQL_KATA_KUNCI.indexOf(up) !== -1) out += bungkus('sql-kw', w);
      else if (SQL_TIPE[up]) out += bungkus('sql-type', w);
      else out += esc(w);
      i += w.length;
    } else {
      out += esc(c);
      i++;
    }
  }
  return out;
}

/* Blok kode SQL bersorot. opts.label → aria-label blok. */
function buildSqlKode(sql, opts) {
  opts = opts || {};
  return (
    '<pre class="sql-code' +
    (opts.kecil ? ' sql-code--kecil' : '') +
    '"' +
    (opts.label ? ' aria-label="' + esc(opts.label) + '"' : '') +
    '><code>' +
    sorotSql(sql) +
    '</code></pre>'
  );
}

/* Kartu tabel dari basis data aktif: kolom, tipe, PK 🔑, FK 🔗, jumlah baris. */
function buildSkemaDdl(skema, opts) {
  opts = opts || {};
  var judul = opts.judul ? '<p class="ddl-schema__judul">' + esc(opts.judul) + '</p>' : '';
  if (!skema || !skema.basisData.length) {
    return (
      '<div class="ddl-schema ddl-schema--kosong">' +
      judul +
      '<p class="ddl-schema__db">🗄️ Belum ada basis data di DBMS.</p></div>'
    );
  }
  var db = ddlDbAktif(skema);
  var daftarDb =
    '<p class="ddl-schema__db">🗄️ ' +
    skema.basisData
      .map(function (b) {
        var aktif = db && b === db;
        return aktif ? '<strong>' + esc(b.nama) + '</strong> (aktif)' : esc(b.nama);
      })
      .join(', ') +
    '</p>';
  if (!db) {
    return (
      '<div class="ddl-schema">' +
      judul +
      daftarDb +
      '<p class="ddl-schema__kosong">Belum ada basis data yang dipilih dengan USE.</p></div>'
    );
  }
  var tabel = db.tabel.length
    ? '<div class="ddl-schema__grid">' +
      db.tabel
        .map(function (t) {
          return (
            '<div class="ddl-table"><div class="ddl-table__head"><span class="ddl-table__nama">▦ ' +
            esc(t.nama) +
            '</span><span class="ddl-table__baris">' +
            t.baris +
            ' baris</span></div><ul class="ddl-table__kolom">' +
            t.kolom
              .map(function (k) {
                var pk = t.pk.some(function (n) {
                  return samaNama(n, k.nama);
                });
                var fk = t.fk.filter(function (f) {
                  return samaNama(f.kolom, k.nama);
                })[0];
                return (
                  '<li class="ddl-col' +
                  (pk ? ' ddl-col--pk' : '') +
                  (fk ? ' ddl-col--fk' : '') +
                  '"><span class="ddl-col__nama">' +
                  (pk ? '<span aria-label="kunci primer">🔑</span> ' : '') +
                  (fk ? '<span aria-label="kunci tamu">🔗</span> ' : '') +
                  esc(k.nama) +
                  '</span><span class="ddl-col__tipe">' +
                  esc(k.tipe) +
                  (k.notNull && !pk ? ' · NOT NULL' : '') +
                  (k.unique ? ' · UNIQUE' : '') +
                  '</span>' +
                  (fk
                    ? '<span class="ddl-col__ref">→ ' +
                      esc(fk.rujukTabel + '.' + fk.rujukKolom) +
                      '</span>'
                    : '') +
                  '</li>'
                );
              })
              .join('') +
            '</ul></div>'
          );
        })
        .join('') +
      '</div>'
    : '<p class="ddl-schema__kosong">Basis data ini belum punya tabel.</p>';
  return '<div class="ddl-schema">' + judul + daftarDb + tabel + '</div>';
}

/* ---------- Konsol DDL berlangkah ----------
   langkah = [{ id, sql, amati? }]  — pernyataan siap-jalan berurutan
   state[key] = { jalan, bebas, draf }
     jalan  banyaknya langkah yang sudah dijalankan
     bebas  pernyataan yang diketik murid sendiri (setelah langkah tuntas)
     draf   isi kotak ketik yang belum dijalankan
   Skema dihitung ulang dari awal (putarKonsol), bukan disimpan. */

function ensureKonsolState(state, key) {
  var st = state[key];
  if (!st || typeof st !== 'object' || typeof st.jalan !== 'number' || !Array.isArray(st.bebas)) {
    st = { jalan: 0, bebas: [], draf: '' };
  }
  if (typeof st.draf !== 'string') st.draf = '';
  state[key] = st;
  return state;
}

/* Setiap langkah dijalankan terpisah; galat satu langkah tidak menghentikan berikutnya. */
function putarKonsol(awal, langkah, st) {
  var skema = awal || skemaKosong();
  var log = [];
  function jalan(sql, tanda) {
    var h = jalankanDdl(skema, sql);
    skema = h.skema;
    h.log.forEach(function (l) {
      Object.keys(tanda).forEach(function (k) {
        l[k] = tanda[k];
      });
      log.push(l);
    });
  }
  var n = Math.min(st.jalan, langkah.length);
  for (var i = 0; i < n; i++) jalan(langkah[i].sql, { langkah: langkah[i].id });
  st.bebas.forEach(function (sql, j) {
    jalan(sql, { bebas: j });
  });
  return { skema: skema, log: log };
}

function buildLogDdl(entri) {
  return (
    '<li class="ddl-log__item ddl-log__item--' +
    (entri.ok ? 'ok' : 'galat') +
    '"><span class="ddl-log__ikon" aria-hidden="true">' +
    (entri.ok ? '✓' : '✗') +
    '</span><span><span class="ddl-log__kat">' +
    esc(entri.kategori === 'lain' ? 'SQL' : entri.kategori.toUpperCase()) +
    '</span> ' +
    esc(entri.pesan) +
    '</span></li>'
  );
}

/*
 *   opts.awal    skema awal (default kosong)
 *   opts.bebas   true → kotak "coba sendiri" setelah semua langkah dijalankan
 *   opts.judulSkema  judul panel skema
 */
function buildKonsolDdl(id, langkah, st, opts) {
  opts = opts || {};
  var hasil = putarKonsol(opts.awal, langkah, st);
  var tuntas = st.jalan >= langkah.length;
  var daftar = langkah
    .map(function (l, i) {
      var log = hasil.log.filter(function (e) {
        return e.langkah === l.id;
      });
      var sudah = i < st.jalan;
      var giliran = i === st.jalan;
      var ok =
        sudah &&
        log.every(function (e) {
          return e.ok;
        });
      return (
        '<li class="ddl-step' +
        (sudah
          ? ok
            ? ' ddl-step--ok'
            : ' ddl-step--galat'
          : giliran
            ? ' ddl-step--next'
            : ' ddl-step--wait') +
        '"><span class="ddl-step__no" aria-hidden="true">' +
        (sudah ? (ok ? '✓' : '✗') : i + 1) +
        '</span><div class="ddl-step__body">' +
        buildSqlKode(l.sql, { kecil: true }) +
        (sudah
          ? '<ul class="ddl-log">' +
            log.map(buildLogDdl).join('') +
            '</ul>' +
            (l.amati ? '<p class="ddl-step__amati">👀 ' + l.amati + '</p>' : '')
          : '') +
        (giliran
          ? '<button type="button" class="btn btn--primary btn--small" id="' +
            esc(id) +
            'Run" data-konsol-run="' +
            esc(id) +
            '">▶ Jalankan langkah ' +
            (i + 1) +
            '</button>'
          : '') +
        '</div></li>'
      );
    })
    .join('');
  var bebas = '';
  if (opts.bebas && tuntas) {
    var logBebas = hasil.log.filter(function (e) {
      return typeof e.bebas === 'number';
    });
    bebas =
      '<div class="ddl-free"><label class="input-label" for="' +
      esc(id) +
      'Bebas">🧪 Coba sendiri — ketik perintah DDL lalu jalankan</label>' +
      '<textarea class="input-textarea ddl-free__input" id="' +
      esc(id) +
      'Bebas" rows="3" spellcheck="false" autocapitalize="off" placeholder="ALTER TABLE anggota ADD no_hp VARCHAR(15);">' +
      esc(st.draf) +
      '</textarea><div class="btn-group"><button type="button" class="btn btn--primary btn--small" id="' +
      esc(id) +
      'BebasRun">▶ Jalankan</button>' +
      (st.bebas.length
        ? '<button type="button" class="btn btn--ghost btn--small" id="' +
          esc(id) +
          'BebasClear">Hapus percobaanku</button>'
        : '') +
      '</div><ul class="ddl-log ddl-log--bebas" aria-live="polite">' +
      (logBebas.length
        ? logBebas.map(buildLogDdl).join('')
        : '<li class="ddl-log__item">Belum ada percobaan.</li>') +
      '</ul></div>';
  }
  return (
    '<div class="ddl-console" id="' +
    esc(id) +
    '"><div class="ddl-console__grid"><div class="ddl-console__langkah"><ol class="ddl-steps">' +
    daftar +
    '</ol>' +
    bebas +
    (st.jalan > 0
      ? '<div class="btn-group"><button type="button" class="btn btn--ghost btn--small" id="' +
        esc(id) +
        'Ulang">↺ Ulangi percobaan dari awal</button></div>'
      : '') +
    '</div><div class="ddl-console__skema" aria-live="polite">' +
    buildSkemaDdl(hasil.skema, { judul: opts.judulSkema || 'Isi DBMS saat ini' }) +
    '</div></div></div>'
  );
}

function bindKonsolDdl(root, id, langkah, st, save, rerender) {
  var run = root.querySelector('#' + id + 'Run');
  if (run) {
    run.addEventListener('click', function () {
      if (st.jalan >= langkah.length) return;
      st.jalan += 1;
      save();
      rerender();
    });
  }
  var ulang = root.querySelector('#' + id + 'Ulang');
  if (ulang) {
    ulang.addEventListener('click', function () {
      st.jalan = 0;
      st.bebas = [];
      st.draf = '';
      save();
      rerender();
    });
  }
  var ta = root.querySelector('#' + id + 'Bebas');
  if (ta) {
    ta.addEventListener('input', function () {
      st.draf = ta.value;
      save();
    });
  }
  var bebas = root.querySelector('#' + id + 'BebasRun');
  if (bebas) {
    bebas.addEventListener('click', function () {
      var sql = (st.draf || '').trim();
      if (!sql) return;
      st.bebas.push(sql);
      if (st.bebas.length > 20) st.bebas.shift();
      st.draf = '';
      save();
      rerender();
    });
  }
  var clear = root.querySelector('#' + id + 'BebasClear');
  if (clear) {
    clear.addEventListener('click', function () {
      st.bebas = [];
      save();
      rerender();
    });
  }
}

/* ============================================================
   18. MODAL RESET
   Halaman modul menyertakan shared/partials/reset-modal.html.
   onConfirm dipanggil setelah murid menekan "Ya, Reset".
   ============================================================ */

function bindResetModal(onConfirm) {
  var openBtn = document.getElementById('resetAppBtn');
  var modal = document.getElementById('resetModal');
  var cancel = document.getElementById('resetCancelBtn');
  var confirmBtn = document.getElementById('resetConfirmBtn');
  if (!openBtn || !modal) return;

  function close() {
    modal.style.display = 'none';
    openBtn.focus();
  }

  openBtn.addEventListener('click', function () {
    modal.style.display = 'flex';
    if (cancel) cancel.focus();
  });
  if (cancel) cancel.addEventListener('click', close);
  if (confirmBtn) {
    confirmBtn.addEventListener('click', function () {
      modal.style.display = 'none';
      onConfirm();
    });
  }
  modal.addEventListener('click', function (e) {
    if (e.target === modal) close();
  });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape' && modal.style.display !== 'none') close();
  });
}

/* ============================================================
   19. KOMPATIBILITAS: Engine.createLesson (MODUL LAMA)
   Modul fase-f/mpi-2.2 masih memakai API ini. Bagian ini
   dipertahankan apa adanya sampai modul-modul itu dimigrasikan ke
   pola mesin tahap + store di atas.
   ============================================================ */

const Engine = (function () {
  function esc(value) {
    if (value === null || value === undefined) return '';
    return String(value)
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;');
  }

  let noticeTimer = null;
  let defaultNoticeMs = 3200;

  function showNotice(message, duration) {
    const el = document.getElementById('appNotice');
    if (!el) return;
    el.textContent = message;
    el.classList.add('is-visible');
    if (noticeTimer) clearTimeout(noticeTimer);
    noticeTimer = setTimeout(function () {
      el.classList.remove('is-visible');
    }, duration || defaultNoticeMs);
  }

  function confirmAction(message) {
    return window.confirm(message);
  }

  function isObject(value) {
    return value !== null && typeof value === 'object' && !Array.isArray(value);
  }

  /* ============================================================
     Pengacakan urutan pilihan
     ============================================================
     Setiap kumpulan pilihan yang ditampilkan ke murid diacak SATU
     KALI, lalu urutannya ikut tersimpan bersama progres. Render
     ulang dan reload halaman memakai urutan yang sama, sehingga
     jawaban yang sudah tersimpan tidak pernah berpindah ke pilihan
     lain.

     JANGAN memanggil shuffle() langsung dari renderer: setiap
     interaksi menggambar ulang tahap, jadi urutannya akan berubah
     tiap klik. Pakai lesson.order() / lesson.orderItems().

     Konsekuensinya: jawaban WAJIB disimpan per id pilihan, bukan
     per indeks. Indeks tidak bermakna pada daftar yang diacak.
     ============================================================ */

  /* Fisher-Yates. Mengembalikan array BARU; masukan tidak diubah. */
  function shuffle(list) {
    const out = list.slice();
    for (let i = out.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      const tmp = out[i];
      out[i] = out[j];
      out[j] = tmp;
    }
    return out;
  }

  /* Cocokkan urutan tersimpan dengan daftar id yang berlaku sekarang,
     untuk kasus isi data.js berubah setelah murid mulai belajar:
       - id yang sudah tidak ada di data.js dibuang
       - id ganda pada data tersimpan dibuang
       - id baru disisipkan pada posisi acak
       - urutan relatif id lama dipertahankan
     Bila tidak ada satu pun id lama yang masih terpakai (mis. soal
     diganti seluruhnya), urutannya diacak penuh. Kembaliannya selalu
     permutasi persis dari `ids`. */
  function reconcileOrder(saved, ids) {
    const valid = Object.create(null);
    ids.forEach(function (id) {
      valid[id] = true;
    });

    const taken = Object.create(null);
    const kept = [];
    if (Array.isArray(saved)) {
      saved.forEach(function (id) {
        if (valid[id] && !taken[id]) {
          taken[id] = true;
          kept.push(id);
        }
      });
    }
    if (!kept.length) return shuffle(ids);

    const added = ids.filter(function (id) {
      return !taken[id];
    });
    shuffle(added).forEach(function (id) {
      kept.splice(Math.floor(Math.random() * (kept.length + 1)), 0, id);
    });
    return kept;
  }

  function sameOrder(a, b) {
    if (!Array.isArray(a) || !Array.isArray(b) || a.length !== b.length) return false;
    for (let i = 0; i < a.length; i++) {
      if (a[i] !== b[i]) return false;
    }
    return true;
  }

  /* Merge saved progress into the fresh default state so that fields added
     to a lesson later still get their defaults for returning students.
     - objects merge key by key; a saved non-object never replaces a default object
     - lists of records (one entry per case/question) keep the default length
       and merge per index
     - everything else (primitives, plain lists) is taken from the saved value */
  function mergeSaved(target, saved) {
    Object.keys(saved).forEach(function (key) {
      const value = saved[key];
      const current = target[key];
      if (
        Array.isArray(current) &&
        Array.isArray(value) &&
        current.length &&
        isObject(current[0])
      ) {
        value.forEach(function (item, i) {
          if (isObject(current[i]) && isObject(item)) mergeSaved(current[i], item);
        });
      } else if (isObject(current)) {
        if (isObject(value)) mergeSaved(current, value);
      } else {
        target[key] = value;
      }
    });
  }

  /* config:
       storageKey   localStorage key (bump the suffix when the saved shape breaks)
       stages       [{ id, label, render(container) }] in learning order
       createState  () => fresh state object; must include currentStage,
                    completedStages, and shuffles ({} — rumah bagi
                    urutan acak, lihat lesson.order())
       lockedNotice optional (label) => message shown when a stage is still locked
       noticeMs     optional default toast duration
       onResetClick optional handler for #resetAppBtn (default: window.confirm,
                    then resetProgress)                                            */
  function createLesson(config) {
    const stages = config.stages;
    const state = config.createState();
    if (config.noticeMs) defaultNoticeMs = config.noticeMs;

    function stageIndex(id) {
      return stages.findIndex(function (stage) {
        return stage.id === id;
      });
    }

    function saveState() {
      try {
        localStorage.setItem(config.storageKey, JSON.stringify(state));
      } catch (e) {}
    }

    function loadState() {
      try {
        const raw = localStorage.getItem(config.storageKey);
        if (!raw) return false;
        const saved = JSON.parse(raw);
        if (!isObject(saved)) return false;
        mergeSaved(state, saved);
        return true;
      } catch (e) {
        return false;
      }
    }

    function clearState() {
      try {
        localStorage.removeItem(config.storageKey);
      } catch (e) {}
      Object.keys(state).forEach(function (key) {
        delete state[key];
      });
      Object.assign(state, config.createState());
    }

    /* state.shuffles selalu dibaca ulang lewat fungsi ini: clearState()
       mengganti isi objek state, jadi referensinya tidak boleh di-cache. */
    function shuffleStore() {
      if (!isObject(state.shuffles)) state.shuffles = {};
      return state.shuffles;
    }

    /* Urutan tampil untuk sekumpulan id pilihan. Dibuat sekali, lalu
       dipakai apa adanya pada render-render berikutnya.
         key  string unik, mis. 'uji:c2:opsi'
         ids  daftar id pilihan versi data.js yang sedang dipakai      */
    function order(key, ids) {
      const store = shuffleStore();
      const saved = store[key];
      const next = reconcileOrder(saved, ids);
      if (!sameOrder(saved, next)) {
        /* Disimpan ke memori lebih dulu, supaya urutan tetap stabil
           sepanjang sesi walaupun saveState() gagal (kuota penuh). */
        store[key] = next;
        saveState();
      }
      return next.slice();
    }

    /* Sama seperti order(), tapi mengembalikan objek datanya.
       Setiap item wajib punya id unik (default properti 'id'). */
    function orderItems(key, items, idProp) {
      const prop = idProp || 'id';
      const byId = Object.create(null);
      const ids = items.map(function (item) {
        byId[item[prop]] = item;
        return item[prop];
      });
      return order(key, ids).map(function (id) {
        return byId[id];
      });
    }

    /* Buang urutan tersimpan agar render berikutnya mengacak ulang.
       Tanpa argumen: seluruh urutan pada materi ini. */
    function reshuffle(key) {
      if (key === undefined) state.shuffles = {};
      else delete shuffleStore()[key];
      saveState();
    }

    function updateProgress() {
      const total = stages.length;
      const done = Object.keys(state.completedStages).length;
      const pct = Math.round((done / total) * 100);
      const barFill = document.getElementById('progressFill');
      const barLabel = document.getElementById('progressLabel');
      if (barFill) barFill.style.width = pct + '%';
      if (barLabel) barLabel.textContent = done + ' dari ' + total + ' tahap selesai';
    }

    function updateStageNav() {
      const currentIdx = stageIndex(state.currentStage);
      document.querySelectorAll('.stage-nav__item').forEach(function (item) {
        const stageId = item.dataset.stage;
        const idx = stageIndex(stageId);
        item.removeAttribute('aria-current');
        item.classList.remove('is-complete');
        item.disabled = false;

        if (stageId === state.currentStage) {
          item.setAttribute('aria-current', 'step');
        } else if (state.completedStages[stageId]) {
          item.classList.add('is-complete');
        }

        if (idx > currentIdx && !state.completedStages[stages[idx - 1].id]) {
          item.disabled = true;
        }
      });
    }

    function buildStageNav() {
      const nav = document.getElementById('stageNavList');
      if (!nav) return;
      nav.innerHTML = stages
        .map(function (stage, idx) {
          return `<li><button type="button" class="stage-nav__item" data-stage="${esc(stage.id)}">
      <span class="stage-nav__num">${idx + 1}</span>
      <span class="stage-nav__label">${esc(stage.label)}</span>
    </button></li>`;
        })
        .join('');
    }

    function renderCurrentStage() {
      const container = document.getElementById('stageContainer');
      if (!container) return;
      container.innerHTML = '';
      updateProgress();

      const stage = stages[stageIndex(state.currentStage)];
      if (stage) stage.render(container);
      else container.innerHTML = '<p class="panel">Tahap tidak ditemukan.</p>';
    }

    function navigateTo(stageId) {
      const targetIdx = stageIndex(stageId);
      const currentIdx = stageIndex(state.currentStage);
      if (targetIdx === -1) return;

      if (targetIdx > currentIdx) {
        for (let i = currentIdx; i < targetIdx; i++) {
          if (!state.completedStages[stages[i].id]) {
            const label = stages[i].label;
            showNotice(
              config.lockedNotice
                ? config.lockedNotice(label)
                : 'Selesaikan tahap ' + label + ' terlebih dahulu.'
            );
            return;
          }
        }
      }

      state.currentStage = stageId;
      saveState();
      updateStageNav();
      renderCurrentStage();
      window.scrollTo({ top: 0, behavior: 'smooth' });
    }

    function completeStage(stageId) {
      state.completedStages[stageId] = true;
      saveState();
      updateStageNav();
      updateProgress();
    }

    function resetProgress() {
      clearState();
      saveState();
      buildStageNav();
      updateStageNav();
      renderCurrentStage();
    }

    function init() {
      loadState();
      buildStageNav();
      updateStageNav();

      document.getElementById('stageNavList').addEventListener('click', function (event) {
        const button = event.target.closest('.stage-nav__item');
        if (button && button.dataset.stage) navigateTo(button.dataset.stage);
      });

      const resetBtn = document.getElementById('resetAppBtn');
      if (resetBtn) {
        resetBtn.addEventListener(
          'click',
          config.onResetClick ||
            function () {
              if (
                !confirmAction(
                  'Reset seluruh aplikasi? Semua progres pada materi ini akan dihapus.'
                )
              )
                return;
              resetProgress();
            }
        );
      }

      renderCurrentStage();
    }

    return {
      state: state,
      stageIds: stages.map(function (stage) {
        return stage.id;
      }),
      saveState: saveState,
      loadState: loadState,
      clearState: clearState,
      updateProgress: updateProgress,
      updateStageNav: updateStageNav,
      buildStageNav: buildStageNav,
      renderCurrentStage: renderCurrentStage,
      navigateTo: navigateTo,
      completeStage: completeStage,
      resetProgress: resetProgress,
      order: order,
      orderItems: orderItems,
      reshuffle: reshuffle,
      init: init,
    };
  }

  return {
    createLesson: createLesson,
    /* shuffle() sengaja diekspos hanya untuk pengujian. Renderer harus
       memakai lesson.order()/lesson.orderItems() agar urutannya stabil. */
    shuffle: shuffle,
    esc: esc,
    showNotice: showNotice,
    confirmAction: confirmAction,
  };
})();
