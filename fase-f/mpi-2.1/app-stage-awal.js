'use strict';

/* ============================================================
   app-stage-awal.js — Tahap 1-3
     1. orientasi  (pra)
     2. stimulasi  Discovery: Stimulation
     3. masalah    Discovery: Problem Statement
   ============================================================ */

/* ============================================================
   TAHAP 1 — Orientasi
   ============================================================ */
function renderOrientasi(container) {
  var d = DATA.orientasi;

  container.innerHTML =
    stageHead(d.kicker, d.title, d.goal) +
    '<div class="panel panel--hero">' +
    '<p class="lead">' + esc(d.salam) + '</p>' +
    '<h3>' + esc(d.tujuanLabel) + '</h3>' +
    '<ul class="objectives-list">' +
    d.tujuan
      .map(function (t, i) {
        return '<li><span class="objectives-list__num">' + (i + 1) + '</span><span>' + esc(t) + '</span></li>';
      })
      .join('') +
    '</ul>' +
    '</div>' +

    '<div class="panel">' +
    '<h3>' + esc(d.alurLabel) + '</h3>' +
    '<ol class="flow-list">' +
    d.alur
      .map(function (a) {
        return (
          '<li class="flow-list__item">' +
          '<span class="flow-list__title">' + esc(a.title) + '</span>' +
          '<span class="flow-list__desc">' + esc(a.desc) + '</span>' +
          '</li>'
        );
      })
      .join('') +
    '</ol>' +
    '</div>' +

    '<div class="panel panel--info">' +
    '<h3>' + esc(d.caraPakaiLabel) + '</h3>' +
    '<ul class="plain-list">' +
    d.caraPakai
      .map(function (c) {
        return '<li>' + esc(c) + '</li>';
      })
      .join('') +
    '</ul>' +
    '</div>' +

    nextButton(d.mulaiLabel);

  bindNext(container, 'orientasi', 'stimulasi');
}

/* ============================================================
   TAHAP 2 — Stimulasi
   ============================================================
   Bagian A: tandai sel janggal pada tiga file (bukan pilihan
   jawaban teracak — posisinya adalah bagian dari data yang sedang
   diamati). Bagian B: kelompokkan jenis masalah (multi-pilih
   teracak) setelah temuan minimal tercapai. */
function renderStimulasi(container) {
  var d = DATA.stimulasi;
  var st = State.stimulasi;
  var totalMasalah = Object.keys(d.problemCells).length;
  var ditemukan = Object.keys(st.flagged).length;
  var cukup = ditemukan >= d.minTemuan || st.revealed;

  function cellHtml(file, row, colIdx) {
    var col = file.columns[colIdx];
    var key = file.id + ':' + row.id + ':' + col.id;
    var value = row.cells[colIdx];
    var isProblem = !!d.problemCells[key];
    var found = !!st.flagged[key];
    var missed = !!st.missed[key];

    var cls = 'flat-cell';
    if (found) cls += ' is-found';
    else if (missed) cls += ' is-missed';
    else if (st.revealed && isProblem) cls += ' is-revealed';

    var label = value + ', kolom ' + col.label + ', file ' + file.name;
    if (found) label += ', sudah ditandai sebagai janggal';

    return (
      '<td>' +
      '<button type="button" class="' + cls + '" data-cell="' + esc(key) + '"' +
      ' aria-pressed="' + (found ? 'true' : 'false') + '"' +
      ' aria-label="' + esc(label) + '">' +
      esc(value) +
      '</button>' +
      '</td>'
    );
  }

  function fileHtml(file) {
    return (
      '<section class="file-card">' +
      '<header class="file-card__head">' +
      '<span class="file-card__icon" aria-hidden="true">' + file.icon + '</span>' +
      '<span class="file-card__name">' + esc(file.name) + '</span>' +
      '<span class="file-card__owner">' + esc(file.owner) + '</span>' +
      '</header>' +
      '<div class="mini-table-wrap" role="region" tabindex="0"' +
      ' aria-label="' + esc('Tabel ' + file.name + ', geser mendatar untuk melihat semua kolom') + '">' +
      '<table class="mini-table flat-table">' +
      '<caption class="sr-only">' + esc(file.name + ' milik ' + file.owner + '. Ketuk sel untuk menandainya sebagai janggal.') + '</caption>' +
      '<thead><tr>' +
      file.columns
        .map(function (c) {
          return '<th scope="col">' + esc(c.label) + '</th>';
        })
        .join('') +
      '</tr></thead><tbody>' +
      file.rows
        .map(function (row) {
          return (
            '<tr>' +
            row.cells
              .map(function (_, ci) {
                return cellHtml(file, row, ci);
              })
              .join('') +
            '</tr>'
          );
        })
        .join('') +
      '</tbody></table></div>' +
      '</section>'
    );
  }

  var umpan = '';
  if (st.lastFeedback) {
    umpan = feedbackBox(
      st.lastFeedback.type,
      st.lastFeedback.type === 'success' ? '✓' : 'ℹ️',
      st.lastFeedback.html
    );
  }

  /* ---- Bagian B: jenis masalah ---- */
  function isPicked(id) {
    return st.picked.indexOf(id) !== -1;
  }

  function stateOf(id) {
    if (!st.checked) return '';
    var j = findById(d.jenis, id);
    if (j.valid && isPicked(id)) return 'is-correct';
    if (!j.valid && isPicked(id)) return 'is-incorrect';
    if (j.valid && !isPicked(id)) return 'unchecked-missed';
    return '';
  }

  var benarSemua =
    st.checked &&
    d.jenis.every(function (j) {
      return j.valid === isPicked(j.id);
    });

  var rincian = '';
  if (st.checked) {
    var urut = order(skey('stimulasi', 'jenis'), d.jenis.map(function (j) { return j.id; }));
    rincian = explainList(
      urut.map(function (id) {
        var j = findById(d.jenis, id);
        return { right: j.valid, text: esc(j.text), why: esc(j.feedback) };
      })
    );
  }

  container.innerHTML =
    stageHead(d.kicker, d.title, d.goal) +
    '<div class="panel panel--hero">' +
    d.cerita +
    '<blockquote class="quote">' + esc(d.keluhan) + '</blockquote>' +
    '</div>' +

    '<div class="panel">' +
    '<p>' + d.instruction + '</p>' +
    '<div class="find-counter' + (ditemukan >= d.minTemuan ? ' is-done' : '') + '">' +
    '<span class="find-counter__label">' + esc(d.temuanLabel) + '</span>' +
    '<span class="find-counter__value">' + ditemukan + ' / ' + d.minTemuan + '</span>' +
    (st.revealed ? '<span class="find-counter__all">(total ' + totalMasalah + ' kejanggalan)</span>' : '') +
    '</div>' +
    '<div class="file-grid">' + d.files.map(fileHtml).join('') + '</div>' +
    '<div class="cell-feedback" aria-live="polite">' + umpan + '</div>' +
    hintReveal(d.hintLabel, d.hint) +
    (ditemukan >= d.minTemuan && !st.revealed
      ? '<div class="btn-group"><button type="button" class="btn btn--ghost btn--small" id="revealAllBtn">Tampilkan semua kejanggalan</button></div>'
      : '') +
    '</div>' +

    '<div class="panel">' +
    '<h3>' + esc(d.kejadianLabel) + '</h3>' +
    '<div class="incident-grid">' +
    d.kejadian
      .map(function (k) {
        return (
          '<article class="incident-card">' +
          '<span class="incident-card__icon" aria-hidden="true">' + k.icon + '</span>' +
          '<div><h4 class="incident-card__title">' + esc(k.title) + '</h4>' +
          '<p class="incident-card__text">' + esc(k.text) + '</p></div>' +
          '</article>'
        );
      })
      .join('') +
    '</div>' +
    '</div>' +

    (cukup
      ? '<div class="panel">' +
        '<h3>' + esc(d.jenisLabel) + '</h3>' +
        '<p>' + d.jenisInstruction + '</p>' +
        choiceList({
          key: skey('stimulasi', 'jenis'),
          options: d.jenis.map(function (j) {
            return { id: j.id, label: esc(j.text) };
          }),
          name: 'jenis',
          type: 'checkbox',
          isChecked: isPicked,
          stateOf: stateOf
        }) +
        '<div class="btn-group">' +
        '<button type="button" class="btn btn--primary" id="cekJenisBtn">' + esc(d.cekLabel) + '</button>' +
        '</div>' +
        (st.checked
          ? feedbackBox(
              benarSemua ? 'success' : 'warning',
              benarSemua ? '✓' : '!',
              benarSemua
                ? '<strong>Tepat semua.</strong> Kamu sudah memetakan seluruh masalah pengelolaan data di SMK Nusantara.'
                : '<strong>' + st.correct + ' dari ' + d.jenis.length + ' tepat.</strong> ' +
                  'Baca penjelasan di bawah, perbaiki pilihanmu, lalu periksa lagi.'
            ) + rincian
          : '') +
        '</div>'
      : '<p class="muted stage-locked-note">Temukan minimal ' + d.minTemuan + ' kejanggalan untuk membuka bagian berikutnya.</p>') +

    (benarSemua ? nextButton(d.lanjutLabel) : '');

  container.querySelectorAll('[data-cell]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var key = btn.dataset.cell;
      var problem = d.problemCells[key];

      if (problem) {
        if (st.flagged[key]) {
          delete st.flagged[key];
          st.lastFeedback = null;
        } else {
          st.flagged[key] = true;
          delete st.missed[key];
          st.lastFeedback = { type: 'success', html: problem.why };
        }
      } else if (st.missed[key]) {
        delete st.missed[key];
        st.lastFeedback = null;
      } else {
        st.missed[key] = true;
        st.lastFeedback = { type: 'info', html: esc(d.okCell) };
      }

      saveState();
      focusAfter('[data-cell="' + key + '"]');
      renderStimulasi(container);
    });
  });

  var revealBtn = container.querySelector('#revealAllBtn');
  if (revealBtn) {
    revealBtn.addEventListener('click', function () {
      st.revealed = true;
      saveState();
      renderStimulasi(container);
      showNotice('Semua sel yang bermasalah kini bertanda kuning.');
    });
  }

  container.querySelectorAll('input[name="jenis"]').forEach(function (input) {
    input.addEventListener('change', function () {
      var id = input.value;
      if (input.checked) {
        if (!isPicked(id)) st.picked.push(id);
      } else {
        st.picked = st.picked.filter(function (x) {
          return x !== id;
        });
      }
      st.checked = false;
      saveState();
      focusAfter('input[value="' + id + '"]');
      renderStimulasi(container);
    });
  });

  var cekBtn = container.querySelector('#cekJenisBtn');
  if (cekBtn) {
    cekBtn.addEventListener('click', function () {
      if (!st.picked.length) {
        showNotice('Pilih dulu minimal satu jenis masalah.');
        return;
      }
      st.checked = true;
      st.correct = d.jenis.filter(function (j) {
        return j.valid === isPicked(j.id);
      }).length;
      setScore('stimulasi', st.correct, d.jenis.length);
      saveState();
      renderStimulasi(container);
    });
  }

  bindNext(container, 'stimulasi', 'masalah');
  applyPendingFocus(container);
}

/* ============================================================
   TAHAP 3 — Rumusan Masalah
   ============================================================ */
function renderMasalah(container) {
  var d = DATA.masalah;
  var st = State.masalah;

  var pilihan = st.answer ? findById(d.options, st.answer) : null;
  var tepat = st.checked && pilihan && pilihan.correct;
  var cukupTulisan = st.question.trim().length >= d.ownMin;

  /* Ringkasan jenis masalah yang benar dari tahap stimulasi. */
  var temuan = DATA.stimulasi.jenis.filter(function (j) {
    return j.valid;
  });

  container.innerHTML =
    stageHead(d.kicker, d.title, d.goal) +

    '<div class="panel panel--info">' +
    '<h3>' + esc(d.ringkasLabel) + '</h3>' +
    '<ul class="plain-list">' +
    temuan
      .map(function (j) {
        return '<li>' + esc(j.text) + '</li>';
      })
      .join('') +
    '</ul>' +
    '</div>' +

    '<div class="panel">' +
    '<p>' + d.instruction + '</p>' +
    choiceList({
      key: skey('masalah', 'opsi'),
      options: d.options.map(function (o) {
        return { id: o.id, label: esc(o.text) };
      }),
      name: 'masalah',
      type: 'radio',
      isChecked: function (id) {
        return st.answer === id;
      },
      stateOf: function (id) {
        if (!st.checked || id !== st.answer) return '';
        return tepat ? 'is-correct' : 'is-incorrect';
      }
    }) +
    '<div class="btn-group">' +
    '<button type="button" class="btn btn--primary" id="cekMasalahBtn"' + (st.answer ? '' : ' disabled') + '>' +
    esc(d.cekLabel) + '</button>' +
    '</div>' +
    (st.checked && pilihan
      ? feedbackBox(tepat ? 'success' : 'warning', tepat ? '✓' : '!', esc(pilihan.feedback) +
          (tepat ? '' : ' Coba pilih rumusan lain.'))
      : '') +
    '</div>' +

    (tepat
      ? '<div class="panel">' +
        '<h3>' + esc(d.ownLabel) + '</h3>' +
        textareaField('ownQuestion', d.ownPrompt, st.question, d.ownPlaceholder, d.ownMin) +
        '</div>'
      : '') +

    (tepat && cukupTulisan ? nextButton(d.lanjutLabel) : '');

  container.querySelectorAll('input[name="masalah"]').forEach(function (input) {
    input.addEventListener('change', function () {
      st.answer = input.value;
      st.checked = false;
      saveState();
      focusAfter('input[value="' + input.value + '"]');
      renderMasalah(container);
    });
  });

  container.querySelector('#cekMasalahBtn').addEventListener('click', function () {
    var p = findById(d.options, st.answer);
    if (!p) return;
    st.checked = true;
    /* Skor dicatat pada percobaan pertama saja, agar mencoba-coba
       semua pilihan tidak menghasilkan nilai penuh. */
    if (!st.attempted) {
      st.attempted = true;
      setScore('masalah', p.correct ? 1 : 0, 1);
    }
    saveState();
    renderMasalah(container);
  });

  bindTextarea(container, {
    id: 'ownQuestion',
    min: d.ownMin,
    set: function (v) {
      st.question = v;
    },
    extra: function () {
      return tepat;
    },
    rerender: function () {
      renderMasalah(container);
    }
  });

  bindNext(container, 'masalah', 'konsep');
  applyPendingFocus(container);
}
