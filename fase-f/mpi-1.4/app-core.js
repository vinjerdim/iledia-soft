'use strict';

/* ============================================================
   app-core.js — pembantu yang dipakai bersama oleh berkas tahap
   ============================================================
   Dimuat setelah engine.js + data.js, sebelum app-stage-*.js.
   Berkas ini TIDAK memuat renderer tahap mana pun.

   Catatan: State, saveState, order, orderItems, navigateTo, dan
   completeStage baru dibuat di app.js (dimuat terakhir). Fungsi
   di sini hanya memakainya saat dipanggil, bukan saat dimuat,
   sehingga urutan itu aman.
   ============================================================ */

var esc = Engine.esc;
var showNotice = Engine.showNotice;

/* Kunci urutan acak, mis. skey('evaluasi', 'e1', 'opsi'). */
function skey() {
  return Array.prototype.slice.call(arguments).join(':');
}

/* Bangun object map { itemId: record } dari daftar berisi id.
   Object map dipilih (bukan array) karena mergeSaved di engine.js
   memangkas panjang array-of-object ke panjang bawaan. */
function mapFrom(items, makeRecord) {
  var out = {};
  items.forEach(function (item) {
    out[item.id] = makeRecord(item);
  });
  return out;
}

/* Id ganda membuat urutan acak kehilangan satu pilihan tanpa pesan
   apa pun, jadi lebih baik berisik sejak awal. */
function assertUniqueIds(list, label) {
  var seen = Object.create(null);
  var dup = [];
  list.forEach(function (item) {
    var id = item && item.id;
    if (!id) dup.push('(tanpa id)');
    else if (seen[id]) dup.push(id);
    else seen[id] = true;
  });
  if (dup.length) {
    console.error('data.js — id ganda/kosong pada ' + label + ': ' + dup.join(', '));
  }
  return !dup.length;
}

/* Cari satu item berdasarkan id pada daftar apa pun di data.js. */
function findById(list, id) {
  for (var i = 0; i < list.length; i++) {
    if (list[i].id === id) return list[i];
  }
  return null;
}

/* ============================================================
   Fokus setelah render ulang
   ============================================================
   Engine menggambar ulang tahap dengan container.innerHTML = '...',
   sehingga elemen yang sedang difokus ikut terhapus dan fokus
   keyboard jatuh ke <body>. Renderer menandai elemen yang harus
   difokuskan setelah render, lalu memanggil applyPendingFocus().

   Sengaja disimpan di variabel modul, bukan di State: ini keadaan
   antarmuka sesaat. Bila ikut tersimpan, fokus akan meloncat
   sendiri setiap halaman dibuka. */
var pendingFocus = null;

function focusAfter(selector) {
  pendingFocus = selector;
}

function applyPendingFocus(container) {
  if (!pendingFocus) return;
  var el = container.querySelector(pendingFocus);
  pendingFocus = null;
  if (el) el.focus();
}

/* ============================================================
   Potongan HTML yang berulang
   ============================================================ */

function stageHead(kicker, title, goal) {
  return (
    '<div class="stage-head">' +
    '<span class="stage-head__kicker">' + esc(kicker) + '</span>' +
    '<h2>' + esc(title) + '</h2>' +
    (goal ? '<p class="stage-head__goal">🎯 ' + esc(goal) + '</p>' : '') +
    '</div>'
  );
}

/* type: success | error | warning | info */
function feedbackBox(type, icon, html) {
  return (
    '<div class="feedback-box feedback-box--' + type + '">' +
    '<span class="feedback-box__icon" aria-hidden="true">' + icon + '</span>' +
    '<div class="feedback-box__body">' + html + '</div>' +
    '</div>'
  );
}

function hintReveal(label, html) {
  return (
    '<details class="hint-reveal">' +
    '<summary>' + esc(label) + '</summary>' +
    '<div class="hint-reveal__content">' + html + '</div>' +
    '</details>'
  );
}

/* Tombol lanjut ke tahap berikutnya. */
function nextButton(label) {
  return (
    '<div class="btn-group btn-group--end">' +
    '<button type="button" class="btn btn--primary" data-next="1">' + esc(label) + '</button>' +
    '</div>'
  );
}

function bindNext(container, stageId, nextStageId) {
  var btn = container.querySelector('[data-next]');
  if (!btn) return;
  btn.addEventListener('click', function () {
    completeStage(stageId);
    navigateTo(nextStageId);
  });
}

/* Kotak isian panjang + penghitung karakter. Tombol lanjut pada
   beberapa tahap baru muncul setelah ambangnya terlampaui, jadi
   renderer memakai textareaThreshold() di bawah. */
function textareaField(id, label, value, placeholder, min) {
  return (
    '<div class="field-group">' +
    '<label for="' + esc(id) + '">' + esc(label) + '</label>' +
    '<textarea id="' + esc(id) + '" class="input-textarea" placeholder="' + esc(placeholder) + '">' +
    esc(value) +
    '</textarea>' +
    '<p class="char-count" data-count="' + esc(id) + '">' +
    value.trim().length + ' / ' + min + ' karakter</p>' +
    '</div>'
  );
}

/* Pasang textarea: simpan tiap ketikan, perbarui penghitung, dan
   gambar ulang HANYA saat ambang minimalnya baru saja terlampaui
   atau tidak lagi terpenuhi (karena tombol lanjut ikut berubah).
   o: { id, min, get(), set(text), rerender(), extra() } */
function bindTextarea(container, o) {
  var ta = container.querySelector('#' + o.id);
  if (!ta) return;
  ta.addEventListener('input', function () {
    o.set(ta.value);
    saveState();
    var count = container.querySelector('[data-count="' + o.id + '"]');
    if (count) count.textContent = ta.value.trim().length + ' / ' + o.min + ' karakter';

    var cukup = ta.value.trim().length >= o.min;
    var adaTombol = !!container.querySelector('[data-next]');
    var bolehLanjut = o.extra ? o.extra() : true;
    if (bolehLanjut && cukup !== adaTombol) {
      focusAfter('#' + o.id);
      o.rerender();
      var el = container.querySelector('#' + o.id);
      if (el) el.selectionStart = el.selectionEnd = el.value.length;
    }
  });
}

/* ============================================================
   Daftar pilihan (pilihan ganda / multi-pilih)
   ============================================================
   Urutan opsi SELALU lewat orderItems() supaya tetap sama pada
   setiap render ulang dan setelah halaman dimuat ulang. Nilai yang
   dikirim balik adalah id opsi, bukan nomor urutnya.

   opts:
     key        kunci urutan acak
     options    [{id, label}]
     name       nama grup input
     type       'radio' | 'checkbox'
     isChecked  (optionId) => bool
     stateOf    (optionId) => '' | 'is-correct' | 'is-incorrect' | 'unchecked-missed'
     disabled   bool                                                       */
function choiceList(opts) {
  var shown = orderItems(opts.key, opts.options);
  return (
    '<div class="choice-stack">' +
    shown
      .map(function (opt) {
        var checked = opts.isChecked ? opts.isChecked(opt.id) : false;
        var extra = opts.stateOf ? opts.stateOf(opt.id) : '';
        var cls = 'choice-option' + (checked && !extra ? ' is-selected' : '') + (extra ? ' ' + extra : '');
        return (
          '<label class="' + cls + '">' +
          '<input type="' + opts.type + '" name="' + esc(opts.name) + '"' +
          ' value="' + esc(opt.id) + '"' +
          (checked ? ' checked' : '') +
          (opts.disabled ? ' disabled' : '') +
          ' />' +
          '<span>' + opt.label + '</span>' +
          '</label>'
        );
      })
      .join('') +
    '</div>'
  );
}

/* Daftar penjelasan per pilihan, dipakai setelah murid menekan
   "Periksa". Urutannya mengikuti urutan acak yang sama dengan
   daftar pilihannya supaya mudah ditelusuri.
   items: [{ right: bool, text: html, why: html }] */
function explainList(items) {
  return (
    '<div class="explain-list">' +
    items
      .map(function (it) {
        var cls = it.right ? 'is-correct' : 'is-incorrect';
        return (
          '<div class="explain-item ' + cls + '">' +
          '<span class="explain-item__mark" aria-hidden="true">' + (it.right ? '✓' : '✗') + '</span>' +
          '<div><p class="explain-item__text">' + it.text + '</p>' +
          '<p class="explain-item__why">' + it.why + '</p></div>' +
          '</div>'
        );
      })
      .join('') +
    '</div>'
  );
}

/* ============================================================
   Papan chip: kolam chip → beberapa kolom sasaran
   ============================================================
   Urutan kolam diacak SEKALI atas SELURUH chip lewat orderItems(),
   lalu disaring. Menyaring dulu baru mengacak akan mengubah urutan
   tiap kali satu chip diambil.

   o:
     key       kunci urutan acak kolam
     items     [{id, label}]                seluruh chip
     columns   [{id, name, desc, colorKey}] kolom sasaran
     st        { assignments: {}, selectedId: null }
     checked   bool — tampilkan tanda benar/salah
     isRight   (item) => bool
     labels    { pool, poolEmpty, empty }                              */
function chipBoard(o) {
  var pool = orderItems(o.key, o.items).filter(function (it) {
    return !o.st.assignments[it.id];
  });

  function namaKolom(id) {
    var c = findById(o.columns, id);
    return c ? c.name : '';
  }

  function chipHtml(item, kolomId) {
    var cls = 'attr-chip';
    var aria;
    if (kolomId) {
      var kolom = findById(o.columns, kolomId);
      cls += ' attr-chip--' + kolom.colorKey;
      if (o.checked) cls += o.isRight(item) ? ' attr-chip--correct' : ' attr-chip--incorrect';
      aria = item.label + ', ada di ' + namaKolom(kolomId) + '. Aktifkan untuk mengembalikannya ke daftar.';
    } else {
      if (o.st.selectedId === item.id) cls += ' is-selected';
      aria = item.label + (o.st.selectedId === item.id ? ', sedang dipilih' : ', belum ditempatkan');
    }
    return (
      '<button type="button" class="' + cls + '" data-chip="' + esc(item.id) + '"' +
      ' aria-pressed="' + (o.st.selectedId === item.id ? 'true' : 'false') + '"' +
      ' aria-label="' + esc(aria) + '">' + esc(item.label) + '</button>'
    );
  }

  /* Pesan kolam kosong pada base.css dapat diganti lewat variabel CSS;
     nilainya masuk ke content: sehingga kutip dan garis miring dibuang. */
  var kosong = pool.length === 0;
  var pesanKosong = String(o.labels.poolEmpty).replace(/["'\\]/g, '');
  var poolHtml =
    '<div class="attr-pool-section">' +
    '<p class="attr-pool-label">' + esc(o.labels.pool) +
    '<span class="attr-pool-count">' + pool.length + '</span></p>' +
    '<div class="attr-pool' + (kosong ? ' attr-pool--empty' : '') + '"' +
    (kosong ? ' style="--attr-pool-empty-text: \'' + esc(pesanKosong) + '\'"' : '') + '>' +
    pool
      .map(function (item) {
        return chipHtml(item, null);
      })
      .join('') +
    (kosong ? '<span class="sr-only">' + esc(o.labels.poolEmpty) + '</span>' : '') +
    '</div></div>';

  var kolomHtml =
    '<div class="entity-columns" style="--entity-columns-count: ' + o.columns.length + '">' +
    o.columns
      .map(function (col, i) {
        var isi = o.items.filter(function (item) {
          return o.st.assignments[item.id] === col.id;
        });
        return (
          '<section class="entity-column entity-column--' + col.colorKey + '">' +
          '<header class="entity-column__header">' +
          '<span class="entity-column__name">' + esc(col.name) + '</span>' +
          '<span class="entity-column__desc">' + esc(col.desc) + '</span>' +
          '</header>' +
          '<button type="button" class="entity-column__drop" data-drop="' + esc(col.id) + '">' +
          'Tempatkan di sini <span class="entity-column__key">' + (i + 1) + '</span>' +
          '</button>' +
          '<div class="entity-column__body">' +
          (isi.length
            ? isi
                .map(function (item) {
                  return chipHtml(item, col.id);
                })
                .join('')
            : '<span class="entity-column__empty">' + esc(o.labels.empty) + '</span>') +
          '</div>' +
          '</section>'
        );
      })
      .join('') +
    '</div>';

  var terpilih = o.st.selectedId ? findById(o.items, o.st.selectedId) : null;
  var indikator =
    '<p class="selected-indicator' + (terpilih ? ' is-visible' : '') + '" role="status" aria-live="polite">' +
    (terpilih
      ? 'Dipilih: <strong>' + esc(terpilih.label) + '</strong> — sekarang ketuk tujuannya.'
      : '') +
    '</p>';

  return indikator + poolHtml + kolomHtml;
}

/* Pasang interaksi papan chip. o sama seperti chipBoard(), ditambah
   onChange() yang dipanggil setelah setiap perubahan (menyimpan dan
   menggambar ulang tahapnya). */
function bindChipBoard(container, o) {
  container.querySelectorAll('[data-chip]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.dataset.chip;
      if (o.st.assignments[id]) {
        /* Chip yang sudah ditempatkan: ketuk untuk menariknya kembali. */
        delete o.st.assignments[id];
        o.st.selectedId = id;
      } else {
        o.st.selectedId = o.st.selectedId === id ? null : id;
      }
      focusAfter('[data-chip="' + id + '"]');
      o.onChange();
    });

    /* Pintasan keyboard: angka 1-n menempatkan chip yang sedang fokus. */
    btn.addEventListener('keydown', function (e) {
      var n = parseInt(e.key, 10);
      if (!n || n < 1 || n > o.columns.length) return;
      e.preventDefault();
      var id = btn.dataset.chip;
      o.st.assignments[id] = o.columns[n - 1].id;
      o.st.selectedId = null;
      focusAfter('[data-chip="' + id + '"]');
      o.onChange();
      showNotice(findById(o.items, id).label + ' ditempatkan di ' + o.columns[n - 1].name + '.');
    });
  });

  container.querySelectorAll('[data-drop]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!o.st.selectedId) {
        showNotice('Ketuk dulu satu chip dari daftar di atas.');
        return;
      }
      o.st.assignments[o.st.selectedId] = btn.dataset.drop;
      o.st.selectedId = null;
      focusAfter('[data-drop="' + btn.dataset.drop + '"]');
      o.onChange();
    });
  });
}

/* ============================================================
   Kartu Entitas (hasil karya murid)
   ============================================================
   Hanya menampilkan — tidak ada interaksi di dalamnya. columns
   berperan sebagai entitas, chips berperan sebagai atribut yang
   sudah dikelompokkan ke entitas tersebut (lewat entityId). */
function entityCards(columns, chips, keyLabel) {
  return (
    '<div class="entity-cards">' +
    columns
      .map(function (en) {
        var isi = chips.filter(function (c) {
          return c.entityId === en.id;
        });
        return (
          '<section class="entity-card entity-card--' + en.colorKey + '">' +
          '<header class="entity-card__head">' +
          '<span class="entity-card__name">' + esc(en.name) + '</span>' +
          '<span class="entity-card__desc">' + esc(en.desc) + '</span>' +
          '</header>' +
          '<ul class="entity-card__list">' +
          isi
            .map(function (c) {
              var kunci = c.id === en.key;
              return (
                '<li class="entity-card__attr' + (kunci ? ' is-key' : '') + '">' +
                '<code>' + esc(c.label) + '</code>' +
                (kunci ? '<span class="entity-card__badge">' + esc(keyLabel) + '</span>' : '') +
                '</li>'
              );
            })
            .join('') +
          '</ul>' +
          '</section>'
        );
      })
      .join('') +
    '</div>'
  );
}

/* ============================================================
   Tabel ringkas
   ============================================================
   Dipakai tahap 7 (sajikan) dan tahap 10 (selesai) untuk
   merangkum relasi antar entitas. Sel-sel diberikan sebagai HTML
   yang sudah di-esc() oleh pemanggil, sama seperti choiceList()/
   explainList() menerima label HTML siap pakai. */
function miniTable(headers, rows) {
  return (
    '<div class="mini-table-wrap" role="region" tabindex="0">' +
    '<table class="mini-table"><thead><tr>' +
    headers
      .map(function (h) {
        return '<th scope="col">' + esc(h) + '</th>';
      })
      .join('') +
    '</tr></thead><tbody>' +
    rows
      .map(function (r) {
        return '<tr>' + r.map(function (c) { return '<td>' + c + '</td>'; }).join('') + '</tr>';
      })
      .join('') +
    '</tbody></table></div>'
  );
}

/* ============================================================
   Skor
   ============================================================ */

function setScore(stageKey, correct, total) {
  State.score[stageKey] = { correct: correct, total: total };
  saveState();
}

function totalScore() {
  var sum = { correct: 0, total: 0 };
  Object.keys(State.score).forEach(function (k) {
    sum.correct += State.score[k].correct;
    sum.total += State.score[k].total;
  });
  return sum;
}

function percent(correct, total) {
  if (!total) return 0;
  return Math.round((correct / total) * 100);
}
