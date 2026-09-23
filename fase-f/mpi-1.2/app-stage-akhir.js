'use strict';

/* ============================================================
   app-stage-akhir.js — Tahap 9-10
     9.  refleksi  PBL fase 5: menilai proses penyelesaian masalah
     10. selesai   (penutup)
   ============================================================ */

/* ============================================================
   TAHAP 9 — Refleksi
   ============================================================ */
function renderRefleksi(container) {
  var d = DATA.refleksi;
  var st = State.refleksi;

  /* Mengingat kembali tebakan saat menguji teknik. Tebakan boleh saja
     kosong (mis. progres lama), jadi jangan berasumsi ada isinya. */
  var recallItems = DATA.sajikan.cases
    .map(function (c) {
      var u = State.sajikan.cases[c.id];
      if (!u || !u.prediction) return '';
      var opt = findById(c.options, u.prediction);
      if (!opt) return '';
      return (
        '<li class="recall-item">' +
        '<span class="recall-item__mark" aria-hidden="true">' + (u.correct ? '✓' : '↻') + '</span>' +
        '<div><p class="recall-item__case">' + esc(c.title) + '</p>' +
        '<p class="recall-item__guess">Tebakanmu: "' + esc(opt.label) + '"</p>' +
        '<p class="recall-item__verdict">' +
        (u.correct ? 'Terbukti benar.' : 'Ternyata berbeda — dan di situlah kamu belajar.') +
        '</p></div></li>'
      );
    })
    .filter(Boolean)
    .join('');

  /* Pernyataan Likert diacak; skalanya 1-5 TIDAK diacak karena
     berurutan (ordinal) — mengacaknya merusak maknanya. */
  var skalaItems = orderItems(skey('refleksi', 'likert'), d.skalaItems);

  var skalaHtml =
    '<div class="likert">' +
    skalaItems
      .map(function (item) {
        return (
          '<fieldset class="likert-row">' +
          '<legend class="likert-row__text">' + esc(item.text) + '</legend>' +
          '<div class="likert-scale">' +
          d.skala
            .map(function (s) {
              var dipilih = st.likert[item.id].value === s.value;
              return (
                '<label class="likert-option' + (dipilih ? ' is-selected' : '') + '">' +
                '<input type="radio" name="lk-' + esc(item.id) + '" value="' + s.value + '"' +
                (dipilih ? ' checked' : '') +
                (st.submitted ? ' disabled' : '') + ' />' +
                '<span class="likert-option__num">' + s.value + '</span>' +
                '<span class="likert-option__label">' + esc(s.label) + '</span>' +
                '</label>'
              );
            })
            .join('') +
          '</div></fieldset>'
        );
      })
      .join('') +
    '</div>';

  var promptsHtml = d.prompts
    .map(function (p) {
      return (
        '<div class="field-group">' +
        '<label for="rf-' + esc(p.id) + '">' + esc(p.question) + '</label>' +
        '<textarea id="rf-' + esc(p.id) + '" class="input-textarea" data-refl="' + esc(p.id) + '"' +
        ' placeholder="' + esc(p.placeholder) + '"' + (st.submitted ? ' readonly' : '') + '>' +
        esc(st.prompts[p.id].text) +
        '</textarea></div>'
      );
    })
    .join('');

  var semuaSkala = d.skalaItems.every(function (i) {
    return st.likert[i.id].value !== null;
  });

  container.innerHTML =
    stageHead(d.kicker, d.title, d.goal) +
    '<div class="panel panel--warning"><p>' + esc(d.note) + '</p></div>' +

    '<div class="panel">' +
    '<h3>' + esc(d.recallLabel) + '</h3>' +
    (recallItems
      ? '<ul class="recall-list">' + recallItems + '</ul>'
      : '<p class="muted">' + esc(d.recallKosong) + '</p>') +
    '</div>' +

    '<div class="panel">' +
    '<h3>' + esc(d.skalaLabel) + '</h3>' +
    skalaHtml +
    '</div>' +

    '<div class="panel">' +
    promptsHtml +
    '<div class="btn-group">' +
    (st.submitted
      ? '<button type="button" class="btn btn--ghost" id="editReflBtn">Ubah refleksi</button>'
      : '<button type="button" class="btn btn--primary" id="simpanReflBtn"' +
        (semuaSkala ? '' : ' disabled') + '>' + esc(d.simpanLabel) + '</button>') +
    '</div>' +
    '</div>' +

    (st.submitted ? nextButton(d.lanjutLabel) : '');

  d.skalaItems.forEach(function (item) {
    container.querySelectorAll('input[name="lk-' + item.id + '"]').forEach(function (input) {
      input.addEventListener('change', function () {
        st.likert[item.id].value = parseInt(input.value, 10);
        saveState();
        focusAfter('input[name="lk-' + item.id + '"][value="' + input.value + '"]');
        renderRefleksi(container);
      });
    });
  });

  container.querySelectorAll('[data-refl]').forEach(function (ta) {
    ta.addEventListener('input', function () {
      st.prompts[ta.dataset.refl].text = ta.value;
      saveState();
    });
  });

  var simpanBtn = container.querySelector('#simpanReflBtn');
  if (simpanBtn) {
    simpanBtn.addEventListener('click', function () {
      st.submitted = true;
      saveState();
      renderRefleksi(container);
      showNotice(d.tersimpan);
    });
  }

  var editBtn = container.querySelector('#editReflBtn');
  if (editBtn) {
    editBtn.addEventListener('click', function () {
      st.submitted = false;
      saveState();
      renderRefleksi(container);
    });
  }

  bindNext(container, 'refleksi', 'selesai');
  applyPendingFocus(container);
}

/* ============================================================
   TAHAP 10 — Selesai
   ============================================================ */
function renderSelesai(container) {
  var d = DATA.selesai;
  var total = totalScore();
  var pct = percent(total.correct, total.total);

  var labelSkor = {
    masalah: 'Rumusan masalah',
    bekal: 'Bekal teknik',
    saring: 'Saringan sumber',
    klasifikasi: 'Klasifikasi kebutuhan',
    sajikan: 'Uji rekomendasi teknik',
    evaluasi: 'Evaluasi kasus lain'
  };

  var rincianSkor =
    '<ul class="score-list">' +
    Object.keys(labelSkor)
      .map(function (k) {
        var s = State.score[k];
        return (
          '<li class="score-list__item">' +
          '<span class="score-list__label">' + esc(labelSkor[k]) + '</span>' +
          '<span class="score-list__value">' + s.correct + ' / ' + s.total + '</span>' +
          '</li>'
        );
      })
      .join('') +
    '</ul>';

  container.innerHTML =
    stageHead(d.kicker, d.title, '') +

    '<div class="panel panel--success done-panel">' +
    '<span class="done-panel__icon" aria-hidden="true">🎓</span>' +
    '<p class="done-panel__score">' + total.correct + ' / ' + total.total + '</p>' +
    '<p class="done-panel__pct">' + pct + '% benar</p>' +
    '</div>' +

    '<div class="panel">' +
    '<h3>' + esc(d.skorLabel) + '</h3>' +
    rincianSkor +
    '</div>' +

    '<div class="panel">' +
    '<h3>' + esc(d.kartuLabel) + '</h3>' +
    entityCards(DATA.klasifikasi.entities, DATA.klasifikasi.chips, DATA.sajikan.keyBadge) +
    '</div>' +

    (State.evaluasi.conclusion.trim()
      ? '<div class="panel panel--accent">' +
        '<h3>' + esc(d.kesimpulanLabel) + '</h3>' +
        '<blockquote class="quote">' + esc(State.evaluasi.conclusion) + '</blockquote>' +
        '</div>'
      : '') +

    (State.sajikan.justif.trim()
      ? '<div class="panel panel--accent">' +
        '<h3>' + esc(d.justifLabel) + '</h3>' +
        '<blockquote class="quote">' + esc(State.sajikan.justif) + '</blockquote>' +
        '</div>'
      : '') +

    '<div class="panel panel--info">' +
    '<h3>Konsep kunci</h3>' +
    '<ul class="plain-list">' +
    d.konsepKunci
      .map(function (k) {
        return '<li>' + esc(k) + '</li>';
      })
      .join('') +
    '</ul></div>' +

    '<div class="panel">' +
    '<h3>' + esc(d.lanjutLabel) + '</h3>' +
    '<ul class="plain-list">' +
    d.lanjut
      .map(function (l) {
        return '<li>' + esc(l) + '</li>';
      })
      .join('') +
    '</ul></div>' +

    '<div class="btn-group btn-group--spread">' +
    '<button type="button" class="btn btn--ghost" id="ulangSemuaBtn">' + esc(d.ulangLabel) + '</button>' +
    '<a class="btn btn--primary" href="../../index.html">' + esc(d.berandaLabel) + '</a>' +
    '</div>';

  completeStage('selesai');

  container.querySelector('#ulangSemuaBtn').addEventListener('click', function () {
    if (!Engine.confirmAction(d.ulangKonfirmasi)) return;
    lesson.resetProgress();
  });
}
