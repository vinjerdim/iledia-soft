'use strict';

/* ============================================================
   app-stage-akhir.js — Tahap 7-9
     7. simpulan  Discovery Learning: Generalization
     8. refleksi  (penutup)
     9. selesai   (penutup)
   ============================================================ */

/* ============================================================
   TAHAP 7 — Generalisasi
   ============================================================ */
function renderSimpulan(container) {
  var d = DATA.simpulan;
  var st = State.simpulan;

  var soal = orderItems(skey('simpulan', 'questions'), d.questions);

  var semuaDijawab = d.questions.every(function (q) {
    return !!st.answers[q.id];
  });
  var cukupTulisan = st.conclusion.trim().length >= d.kesimpulanMin;

  var soalHtml = soal
    .map(function (q, i) {
      var jawab = st.answers[q.id];
      return (
        '<div class="question-card">' +
        '<p class="question-card__prompt"><span class="question-card__num">Soal ' + (i + 1) + '</span> ' +
        q.prompt + '</p>' +
        choiceList({
          key: skey('simpulan', q.id, 'opsi'),
          options: q.options,
          name: 'q-' + q.id,
          type: 'radio',
          isChecked: function (id) {
            return jawab === id;
          },
          stateOf: function (id) {
            if (!st.checked) return '';
            if (id === q.correct) return 'is-correct';
            if (id === jawab) return 'is-incorrect';
            return '';
          },
          disabled: st.checked
        }) +
        (st.checked
          ? '<p class="question-feedback ' + (jawab === q.correct ? 'is-correct' : 'is-incorrect') + '">' +
            (jawab === q.correct ? '✓ Tepat. ' : '✗ Belum tepat. ') + q.explanation +
            '</p>'
          : '') +
        '</div>'
      );
    })
    .join('');

  container.innerHTML =
    stageHead(d.kicker, d.title, d.goal) +
    '<div class="panel panel--info"><p>' + d.instruction + '</p></div>' +
    '<div class="question-stack">' + soalHtml + '</div>' +
    '<div class="btn-group">' +
    (st.checked
      ? '<button type="button" class="btn btn--ghost" id="ulangSoalBtn">Kerjakan ulang</button>'
      : '<button type="button" class="btn btn--primary" id="cekSoalBtn"' +
        (semuaDijawab ? '' : ' disabled') + '>' + esc(d.cekLabel) + '</button>') +
    '</div>' +
    (st.checked
      ? feedbackBox(
          st.correct === d.questions.length ? 'success' : 'info',
          st.correct === d.questions.length ? '🎉' : '📊',
          '<strong>Skor kamu: ' + st.correct + ' dari ' + d.questions.length + ' soal benar.</strong>' +
            (st.correct === d.questions.length
              ? ' Konsepnya sudah kamu kuasai.'
              : ' Baca penjelasan di tiap soal, lalu boleh dikerjakan ulang.')
        )
      : '') +

    (st.checked
      ? '<div class="panel">' +
        '<h3>' + esc(d.kesimpulanLabel) + '</h3>' +
        '<div class="field-group">' +
        '<label for="kesimpulan">' + esc(d.kesimpulanPrompt) + '</label>' +
        '<textarea id="kesimpulan" class="input-textarea" placeholder="' + esc(d.kesimpulanPlaceholder) + '">' +
        esc(st.conclusion) +
        '</textarea>' +
        '<p class="char-count">' + st.conclusion.trim().length + ' / ' + d.kesimpulanMin + ' karakter</p>' +
        '</div></div>'
      : '') +

    (st.checked && cukupTulisan ? nextButton(d.lanjutLabel) : '');

  d.questions.forEach(function (q) {
    container.querySelectorAll('input[name="q-' + q.id + '"]').forEach(function (input) {
      input.addEventListener('change', function () {
        st.answers[q.id] = input.value;
        saveState();
        focusAfter('input[value="' + input.value + '"]');
        renderSimpulan(container);
      });
    });
  });

  var cekBtn = container.querySelector('#cekSoalBtn');
  if (cekBtn) {
    cekBtn.addEventListener('click', function () {
      st.checked = true;
      st.correct = d.questions.filter(function (q) {
        return st.answers[q.id] === q.correct;
      }).length;
      setScore('simpulan', st.correct, d.questions.length);
      saveState();
      renderSimpulan(container);
    });
  }

  var ulangBtn = container.querySelector('#ulangSoalBtn');
  if (ulangBtn) {
    ulangBtn.addEventListener('click', function () {
      st.checked = false;
      st.answers = {};
      saveState();
      renderSimpulan(container);
    });
  }

  var ta = container.querySelector('#kesimpulan');
  if (ta) {
    ta.addEventListener('input', function () {
      st.conclusion = ta.value;
      saveState();
      var count = container.querySelector('.char-count');
      if (count) count.textContent = st.conclusion.trim().length + ' / ' + d.kesimpulanMin + ' karakter';
      var kini = st.conclusion.trim().length >= d.kesimpulanMin;
      var adaTombol = !!container.querySelector('[data-next]');
      if (kini !== adaTombol) {
        focusAfter('#kesimpulan');
        renderSimpulan(container);
        var el = container.querySelector('#kesimpulan');
        if (el) el.selectionStart = el.selectionEnd = el.value.length;
      }
    });
  }

  bindNext(container, 'simpulan', 'refleksi');
  applyPendingFocus(container);
}

/* ============================================================
   TAHAP 8 — Refleksi
   ============================================================ */
function renderRefleksi(container) {
  var d = DATA.refleksi;
  var st = State.refleksi;

  /* Mengingat kembali tebakan di tahap Verifikasi. Tebakan boleh saja
     kosong (mis. progres lama), jadi jangan berasumsi ada isinya. */
  var recallItems = DATA.uji.cases
    .map(function (c) {
      var u = State.uji[c.id];
      if (!u || !u.prediction) return '';
      var opt = c.options.filter(function (o) {
        return o.id === u.prediction;
      })[0];
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
   TAHAP 9 — Selesai
   ============================================================ */
function renderSelesai(container) {
  var d = DATA.selesai;
  var r = DATA.rancang;
  var total = totalScore();
  var pct = percent(total.correct, total.total);

  var labelSkor = {
    masalah: 'Rumusan masalah',
    konsep: 'Kosakata konsep',
    rancang: 'Rancangan struktur',
    uji: 'Prediksi verifikasi',
    simpulan: 'Generalisasi'
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

  /* Rancangan akhir murid, dibaca dari penempatan yang tersimpan. */
  var rancanganHtml =
    '<div class="entity-columns entity-columns--readonly">' +
    r.tables
      .map(function (t) {
        var isi = r.columns.filter(function (c) {
          return State.rancang.assignments[c.id] === t.id;
        });
        var fk =
          t.id === 't_pinjam'
            ? r.fkOptions.filter(function (o) {
                return o.correct && State.rancang.foreignKeys.indexOf(o.id) !== -1;
              })
            : [];
        return (
          '<section class="entity-column entity-column--' + t.colorKey + '">' +
          '<header class="entity-column__header">' +
          '<span class="entity-column__name">' + esc(t.name) + '</span>' +
          '</header>' +
          '<div class="entity-column__body">' +
          isi
            .map(function (c) {
              var isPk = State.rancang.primaryKeys[t.id].pick === c.id;
              return (
                '<span class="attr-chip attr-chip--' + t.colorKey + '">' +
                (isPk ? '<span aria-label="primary key">🔑 </span>' : '') +
                esc(c.label) + '</span>'
              );
            })
            .join('') +
          fk
            .map(function (o) {
              return (
                '<span class="attr-chip attr-chip--' + t.colorKey + ' attr-chip--fk">' +
                '<span aria-label="foreign key">🔗 </span>' + esc(o.label) + '</span>'
              );
            })
            .join('') +
          '</div></section>'
        );
      })
      .join('') +
    '</div>';

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
    '<h3>' + esc(d.rancanganLabel) + '</h3>' +
    rancanganHtml +
    '</div>' +

    (State.simpulan.conclusion.trim()
      ? '<div class="panel panel--accent">' +
        '<h3>' + esc(d.kesimpulanLabel) + '</h3>' +
        '<blockquote class="quote">' + esc(State.simpulan.conclusion) + '</blockquote>' +
        '</div>'
      : '') +

    '<div class="panel panel--info">' +
    '<h3>Konsep kunci</h3>' +
    '<ul class="plain-list">' +
    d.konsepKunci
      .map(function (k) {
        return '<li>' + k + '</li>';
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
