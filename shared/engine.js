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
   15. Modal reset
   16. Kompatibilitas: Engine.createLesson (modul lama)

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
   16. MODAL RESET
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
   17. KOMPATIBILITAS: Engine.createLesson (MODUL LAMA)
   Modul fase-f/mpi-1.3 … 2.2 masih memakai API ini. Bagian ini
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
