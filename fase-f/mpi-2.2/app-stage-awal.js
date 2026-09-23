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
   Bagian A: buka keenam gudang (bahan pengamatan, TIDAK diacak —
   urutannya bagian dari cerita). Bagian B: pilih semua pernyataan
   pengamatan yang benar (multi-pilih teracak) setelah semua gudang
   dibuka. */
function renderStimulasi(container) {
  var d = DATA.stimulasi;
  var st = State.stimulasi;

  var dibuka = d.gudang.filter(function (g) {
    return st.opened[g.id] && st.opened[g.id].seen;
  }).length;
  var semuaDibuka = dibuka === d.gudang.length;

  var gudangHtml =
    '<div class="gudang-grid">' +
    d.gudang
      .map(function (g) {
        var seen = st.opened[g.id] && st.opened[g.id].seen;
        var bodyId = 'gudang-body-' + g.id;
        return (
          '<article class="gudang-card' + (seen ? ' is-open' : '') + '">' +
          '<button type="button" class="gudang-card__toggle" data-gudang="' + esc(g.id) + '"' +
          ' aria-expanded="' + (seen ? 'true' : 'false') + '" aria-controls="' + esc(bodyId) + '">' +
          '<span class="gudang-card__icon" aria-hidden="true">' + g.icon + '</span>' +
          '<span class="gudang-card__name">' + esc(g.name) + '</span>' +
          '<span class="gudang-card__tim">' + esc(g.tim) + '</span>' +
          '<span class="gudang-card__state">' + (seen ? 'Tutup' : 'Intip') + '</span>' +
          '</button>' +
          (seen
            ? '<div class="gudang-card__body" id="' + esc(bodyId) + '">' +
              '<p class="gudang-card__label">' + esc(d.bentukLabel) + '</p>' +
              '<pre class="gudang-visual" tabindex="0">' + esc(g.visual) + '</pre>' +
              '<p class="gudang-card__label">' + esc(d.tanyaLabel) + '</p>' +
              '<pre class="gudang-query" tabindex="0">' + esc(g.tanya) + '</pre>' +
              '<p class="gudang-card__label">' + esc(d.penjagaLabel) + '</p>' +
              '<p class="gudang-note">💬 ' + esc(g.penjaga) + '</p>' +
              '</div>'
            : '') +
          '</article>'
        );
      })
      .join('') +
    '</div>';

  /* ---- Bagian B: pernyataan pengamatan ---- */
  function isPicked(id) {
    return st.picked.indexOf(id) !== -1;
  }

  function stateOf(id) {
    if (!st.checked) return '';
    var a = findById(d.amatan, id);
    if (a.valid && isPicked(id)) return 'is-correct';
    if (!a.valid && isPicked(id)) return 'is-incorrect';
    if (a.valid && !isPicked(id)) return 'unchecked-missed';
    return '';
  }

  var benarSemua =
    st.checked &&
    d.amatan.every(function (a) {
      return a.valid === isPicked(a.id);
    });

  var rincian = '';
  if (st.checked) {
    var urut = order(skey('stimulasi', 'amatan'), d.amatan.map(function (a) { return a.id; }));
    rincian = explainList(
      urut.map(function (id) {
        var a = findById(d.amatan, id);
        return { right: a.valid, text: esc(a.text), why: esc(a.feedback) };
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
    '<div class="find-counter' + (semuaDibuka ? ' is-done' : '') + '">' +
    '<span class="find-counter__label">' + esc(d.bukaLabel) + '</span>' +
    '<span class="find-counter__value">' + dibuka + ' / ' + d.gudang.length + '</span>' +
    '</div>' +
    gudangHtml +
    '</div>' +

    (semuaDibuka
      ? '<div class="panel">' +
        '<h3>' + esc(d.amatLabel) + '</h3>' +
        '<p>' + d.amatInstruction + '</p>' +
        choiceList({
          key: skey('stimulasi', 'amatan'),
          options: d.amatan.map(function (a) {
            return { id: a.id, label: esc(a.text) };
          }),
          name: 'amatan',
          type: 'checkbox',
          isChecked: isPicked,
          stateOf: stateOf
        }) +
        '<div class="btn-group">' +
        '<button type="button" class="btn btn--primary" id="cekAmatanBtn">' + esc(d.cekLabel) + '</button>' +
        '</div>' +
        (st.checked
          ? feedbackBox(
              benarSemua ? 'success' : 'warning',
              benarSemua ? '✓' : '!',
              benarSemua
                ? '<strong>Tepat semua.</strong> Kamu sudah melihat bahwa setiap gudang punya cara sendiri untuk menyimpan data.'
                : '<strong>' + st.correct + ' dari ' + d.amatan.length + ' tepat.</strong> ' +
                  'Baca penjelasan di bawah, intip lagi gudangnya bila perlu, lalu periksa lagi.'
            ) + rincian
          : '') +
        '</div>'
      : '<p class="muted stage-locked-note">Intip keenam gudang untuk membuka bagian berikutnya.</p>') +

    (benarSemua ? nextButton(d.lanjutLabel) : '');

  container.querySelectorAll('[data-gudang]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.dataset.gudang;
      st.opened[id].seen = !st.opened[id].seen;
      saveState();
      focusAfter('[data-gudang="' + id + '"]');
      renderStimulasi(container);
    });
  });

  container.querySelectorAll('input[name="amatan"]').forEach(function (input) {
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

  var cekBtn = container.querySelector('#cekAmatanBtn');
  if (cekBtn) {
    cekBtn.addEventListener('click', function () {
      if (!st.picked.length) {
        showNotice('Pilih dulu minimal satu pernyataan.');
        return;
      }
      st.checked = true;
      st.correct = d.amatan.filter(function (a) {
        return a.valid === isPicked(a.id);
      }).length;
      setScore('stimulasi', st.correct, d.amatan.length);
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

  /* Ringkasan pengamatan yang benar dari tahap stimulasi. */
  var temuan = DATA.stimulasi.amatan.filter(function (j) {
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
