'use strict';

/* ============================================================
   app-stage-awal.js — Tahap 1-3
     1. orientasi   (pra)
     2. stimulasi   Discovery Learning: Stimulation
     3. masalah     Discovery Learning: Problem Statement
   ============================================================ */

/* ============================================================
   TAHAP 1 — Orientasi
   ============================================================ */
function renderOrientasi(container) {
  var d = DATA.orientasi;

  container.innerHTML =
    stageHead(d.kicker, d.title, d.goal) +
    '<div class="panel panel--hero">' +
    '<p class="lead">' + d.salam + '</p>' +
    '<h3>' + esc(d.tujuanLabel) + '</h3>' +
    '<ul class="objectives-list">' +
    d.tujuan
      .map(function (t, i) {
        return (
          '<li><span class="objectives-list__num">' + (i + 1) + '</span><span>' + esc(t) + '</span></li>'
        );
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
        return '<li>' + c + '</li>';
      })
      .join('') +
    '</ul>' +
    '</div>' +

    nextButton('Mulai: lihat catatan Pak Yusuf →');

  bindNext(container, 'orientasi', 'stimulasi');
}

/* ============================================================
   TAHAP 2 — Stimulasi
   ============================================================ */
function renderStimulasi(container) {
  var d = DATA.stimulasi;
  var st = State.stimulasi;
  var totalMasalah = Object.keys(d.problemCells).length;
  var ditemukan = Object.keys(st.flagged).length;
  var cukup = ditemukan >= d.minTemuan;

  function cellHtml(row, colIdx) {
    var col = d.columns[colIdx];
    var key = row.id + ':' + col.id;
    var value = row.cells[colIdx];
    var isProblem = !!d.problemCells[key];
    var found = !!st.flagged[key];
    var missed = !!st.missed[key];

    var cls = 'flat-cell';
    if (found) cls += ' is-found';
    else if (missed) cls += ' is-missed';
    else if (st.revealed && isProblem) cls += ' is-revealed';

    var label = value + ', kolom ' + col.label;
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

  var tabel =
    '<div class="mini-table-wrap" role="region" tabindex="0"' +
    ' aria-label="Tabel catatan SiPinjam, geser mendatar untuk melihat semua kolom">' +
    '<table class="mini-table flat-table">' +
    '<caption class="sr-only">Catatan peminjaman SiPinjam, 8 baris, 8 kolom. Ketuk sel untuk menandainya sebagai janggal.</caption>' +
    '<thead><tr><th scope="col">#</th>' +
    d.columns
      .map(function (c) {
        return '<th scope="col">' + esc(c.label) + '</th>';
      })
      .join('') +
    '</tr></thead><tbody>' +
    d.rows
      .map(function (row, ri) {
        return (
          '<tr><th scope="row" class="flat-rownum">' + (ri + 1) + '</th>' +
          row.cells
            .map(function (_, ci) {
              return cellHtml(row, ci);
            })
            .join('') +
          '</tr>'
        );
      })
      .join('') +
    '</tbody></table></div>';

  var umpan = '';
  if (st.lastFeedback) {
    umpan = feedbackBox(
      st.lastFeedback.type,
      st.lastFeedback.type === 'success' ? '✓' : 'ℹ️',
      st.lastFeedback.html
    );
  }

  container.innerHTML =
    stageHead(d.kicker, d.title, d.goal) +
    '<div class="panel">' +
    d.cerita +
    '<blockquote class="quote">' + esc(d.keluhan) + '</blockquote>' +
    '</div>' +

    '<div class="panel">' +
    '<p>' + d.instruction + '</p>' +
    '<div class="find-counter' + (cukup ? ' is-done' : '') + '">' +
    '<span class="find-counter__label">' + esc(d.temuanLabel) + '</span>' +
    '<span class="find-counter__value">' + ditemukan + ' / ' + d.minTemuan + '</span>' +
    (st.revealed ? '<span class="find-counter__all">(total ' + totalMasalah + ' kejanggalan)</span>' : '') +
    '</div>' +
    tabel +
    '<div class="cell-feedback" aria-live="polite">' + umpan + '</div>' +
    hintReveal(d.hintLabel, d.hint) +
    (cukup && !st.revealed
      ? '<div class="btn-group"><button type="button" class="btn btn--ghost btn--small" id="revealAllBtn">Tampilkan semua kejanggalan</button></div>'
      : '') +
    '</div>' +

    (cukup ? nextButton(d.lanjutLabel) : '');

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
      } else {
        var colId = key.split(':')[1];
        if (st.missed[key]) {
          delete st.missed[key];
          st.lastFeedback = null;
        } else {
          st.missed[key] = true;
          st.lastFeedback = {
            type: 'info',
            html: d.okCells[colId] || 'Sel ini wajar — isinya memang berbeda di tiap baris.'
          };
        }
      }

      State.temuan = Object.keys(st.flagged).length;
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
      showNotice('Semua sel yang bermasalah kini bertanda.');
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

  var options = d.statements.map(function (s) {
    return { id: s.id, label: esc(s.text) };
  });

  function byId(id) {
    return d.statements.filter(function (s) {
      return s.id === id;
    })[0];
  }

  function isPicked(id) {
    return st.picked.indexOf(id) !== -1;
  }

  /* Setelah diperiksa, tiap pilihan diberi warna sesuai kebenarannya:
     yang benar-dipilih hijau, yang salah-dipilih merah, dan yang benar
     tetapi terlewat diberi warna peringatan. */
  function stateOf(id) {
    if (!st.checked) return '';
    var s = byId(id);
    if (s.valid && isPicked(id)) return 'is-correct';
    if (!s.valid && isPicked(id)) return 'is-incorrect';
    if (s.valid && !isPicked(id)) return 'unchecked-missed';
    return '';
  }

  var benarSemua =
    st.checked &&
    d.statements.every(function (s) {
      return s.valid === isPicked(s.id);
    });

  var cukupTulisan = st.ownProblem.trim().length >= d.ownMin;

  var rincian = '';
  if (st.checked) {
    /* Penjelasan ditampilkan mengikuti urutan acak yang sama dengan
       daftar pilihannya, supaya mudah ditelusuri murid. */
    var urut = order(skey('masalah', 'statements'), d.statements.map(function (s) { return s.id; }));
    rincian =
      '<div class="explain-list">' +
      urut
        .map(function (id) {
          var s = byId(id);
          var cls = s.valid ? 'is-correct' : 'is-incorrect';
          return (
            '<div class="explain-item ' + cls + '">' +
            '<span class="explain-item__mark" aria-hidden="true">' + (s.valid ? '✓' : '✗') + '</span>' +
            '<div><p class="explain-item__text">' + esc(s.text) + '</p>' +
            '<p class="explain-item__why">' + s.feedback + '</p></div>' +
            '</div>'
          );
        })
        .join('') +
      '</div>';
  }

  container.innerHTML =
    stageHead(d.kicker, d.title, d.goal) +
    '<div class="panel">' +
    '<p>' + d.instruction + '</p>' +
    choiceList({
      key: skey('masalah', 'statements'),
      options: options,
      name: 'masalah',
      type: 'checkbox',
      isChecked: isPicked,
      stateOf: stateOf
    }) +
    '<div class="btn-group">' +
    '<button type="button" class="btn btn--primary" id="cekMasalahBtn">' + esc(d.cekLabel) + '</button>' +
    '</div>' +
    (st.checked
      ? feedbackBox(
          benarSemua ? 'success' : 'warning',
          benarSemua ? '✓' : '!',
          benarSemua
            ? '<strong>Tepat semua.</strong> Kamu berhasil memisahkan masalah struktural dari gejalanya.'
            : '<strong>' + st.correct + ' dari ' + d.statements.length + ' tepat.</strong> ' +
              'Baca penjelasan di bawah, perbaiki pilihanmu, lalu periksa lagi.'
        ) + rincian
      : '') +
    '</div>' +

    '<div class="panel">' +
    '<h3>' + esc(d.ownLabel) + '</h3>' +
    '<div class="field-group">' +
    '<label for="ownProblem">' + esc(d.ownPrompt) + '</label>' +
    '<textarea id="ownProblem" class="input-textarea" placeholder="' + esc(d.ownPlaceholder) + '">' +
    esc(st.ownProblem) +
    '</textarea>' +
    '<p class="char-count">' + st.ownProblem.trim().length + ' / ' + d.ownMin + ' karakter</p>' +
    '</div>' +
    '</div>' +

    (benarSemua && cukupTulisan ? nextButton(d.lanjutLabel) : '');

  container.querySelectorAll('input[name="masalah"]').forEach(function (input) {
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
      renderMasalah(container);
    });
  });

  container.querySelector('#cekMasalahBtn').addEventListener('click', function () {
    if (!st.picked.length) {
      showNotice('Pilih dulu minimal satu pernyataan.');
      return;
    }
    st.checked = true;
    st.correct = d.statements.filter(function (s) {
      return s.valid === isPicked(s.id);
    }).length;
    setScore('masalah', st.correct, d.statements.length);
    saveState();
    renderMasalah(container);
  });

  var ta = container.querySelector('#ownProblem');
  ta.addEventListener('input', function () {
    st.ownProblem = ta.value;
    saveState();
    var count = container.querySelector('.char-count');
    if (count) count.textContent = st.ownProblem.trim().length + ' / ' + d.ownMin + ' karakter';
    /* Tombol lanjut baru muncul setelah tulisannya cukup, jadi
       perlu render ulang tepat saat ambang itu terlampaui. */
    var kini = st.ownProblem.trim().length >= d.ownMin;
    var adaTombol = !!container.querySelector('[data-next]');
    if (benarSemua && kini !== adaTombol) {
      focusAfter('#ownProblem');
      renderMasalah(container);
      var el = container.querySelector('#ownProblem');
      if (el) el.selectionStart = el.selectionEnd = el.value.length;
    }
  });

  bindNext(container, 'masalah', 'konsep');
  applyPendingFocus(container);
}
