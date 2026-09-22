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

/* Kunci urutan acak, mis. skey('uji', 'u_update', 'opsi'). */
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
