'use strict';

/* ============================================================
   app-stage-hasil.js — Tahap 7-8
     7. sajikan   PBL fase 4: Mengembangkan & menyajikan hasil karya
     8. evaluasi  PBL fase 5: Menganalisis & mengevaluasi proses
   ============================================================ */

/* ============================================================
   TAHAP 7 — Sajikan hasil karya
   ============================================================ */
function renderSajikan(container) {
  var d = DATA.sajikan;
  var st = State.sajikan;

  var semuaDibuka = d.cases.every(function (c) {
    return st.cases[c.id].revealed;
  });
  var cukupTulisan = st.justif.trim().length >= d.justifMin;

  function verdictHtml(side, label, data) {
    return (
      '<div class="verify-side verify-side--' + side + '">' +
      '<span class="verify-side__head">' + esc(label) + '</span>' +
      '<span class="verify-side__verdict verify-side__verdict--' + data.verdict + '">' +
      (data.verdict === 'baik' ? '✓ berhasil' : '✗ gagal') +
      '</span>' +
      '<p>' + data.text + '</p>' +
      '</div>'
    );
  }

  /* Urutan pertanyaan mengikuti dokumen (Pertanyaan 1-3 dinomori di
     dalam judulnya). Yang diacak adalah pilihan tebakannya. */
  var kasus = d.cases
    .map(function (c) {
      var u = st.cases[c.id];
      var benar = u.prediction === c.correct;
      return (
        '<section class="panel verify-case' + (u.revealed ? ' is-open' : '') + '">' +
        '<h3 class="verify-case__title">' +
        '<span class="verify-case__icon" aria-hidden="true">' + c.icon + '</span> ' +
        esc(c.title) +
        '</h3>' +
        '<blockquote class="quote">' + esc(c.scenario) + '</blockquote>' +
        '<div class="predict-block">' +
        '<p class="predict-label">' + esc(d.prediksiLabel) + '</p>' +
        choiceList({
          key: skey('sajikan', c.id, 'opsi'),
          options: c.options,
          name: 'uji-' + c.id,
          type: 'radio',
          isChecked: function (id) {
            return u.prediction === id;
          },
          stateOf: function (id) {
            if (!u.revealed) return '';
            if (id === c.correct) return 'is-correct';
            if (id === u.prediction) return 'is-incorrect';
            return '';
          },
          disabled: u.revealed
        }) +
        '</div>' +
        (!u.revealed
          ? '<div class="btn-group">' +
            '<button type="button" class="btn btn--primary" data-buka="' + esc(c.id) + '"' +
            (u.prediction ? '' : ' disabled') + '>' + esc(d.bukaLabel) + '</button>' +
            '</div>'
          : feedbackBox(
              benar ? 'success' : 'info',
              benar ? '✓' : '💡',
              benar ? '<strong>' + esc(d.benarPrediksi) + '</strong>' : esc(d.salahPrediksi)
            ) +
            '<div class="verify-grid">' +
            verdictHtml('kamu', d.kamuLabel, c.kamu) +
            verdictHtml('tima', d.timALabel, c.timA) +
            '</div>' +
            '<p class="konsep-tag">' + esc(c.konsep) + '</p>') +
        '</section>'
      );
    })
    .join('');

  container.innerHTML =
    stageHead(d.kicker, d.title, d.goal) +

    '<div class="panel panel--hero">' +
    '<h3>' + esc(d.kartuLabel) + '</h3>' +
    '<p>' + esc(d.kartuNote) + '</p>' +
    entityCards(DATA.atribut.entities, DATA.atribut.chips, d.keyBadge) +
    '</div>' +

    '<div class="panel panel--info">' +
    '<h3>' + esc(d.ujiLabel) + '</h3>' +
    '<p>' + d.ujiInstruction + '</p>' +
    '</div>' +
    kasus +

    (semuaDibuka
      ? feedbackBox('success', '🎯', d.penutup) +
        '<div class="panel">' +
        '<h3>' + esc(d.justifLabel) + '</h3>' +
        textareaField('justifikasi', d.justifPrompt, st.justif, d.justifPlaceholder, d.justifMin) +
        '</div>'
      : '') +

    (semuaDibuka && cukupTulisan ? nextButton(d.lanjutLabel) : '');

  d.cases.forEach(function (c) {
    container.querySelectorAll('input[name="uji-' + c.id + '"]').forEach(function (input) {
      input.addEventListener('change', function () {
        st.cases[c.id].prediction = input.value;
        saveState();
        focusAfter('input[value="' + input.value + '"]');
        renderSajikan(container);
      });
    });
  });

  container.querySelectorAll('[data-buka]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.dataset.buka;
      var kasusData = findById(d.cases, id);
      st.cases[id].revealed = true;
      st.cases[id].correct = st.cases[id].prediction === kasusData.correct;
      var benar = d.cases.filter(function (c) {
        return st.cases[c.id].correct;
      }).length;
      setScore('sajikan', benar, d.cases.length);
      saveState();
      renderSajikan(container);
    });
  });

  bindTextarea(container, {
    id: 'justifikasi',
    min: d.justifMin,
    set: function (v) {
      st.justif = v;
    },
    extra: function () {
      return semuaDibuka;
    },
    rerender: function () {
      renderSajikan(container);
    }
  });

  bindNext(container, 'sajikan', 'evaluasi');
  applyPendingFocus(container);
}

/* ============================================================
   TAHAP 8 — Evaluasi pada dokumen lain
   ============================================================ */
function renderEvaluasi(container) {
  var d = DATA.evaluasi;
  var st = State.evaluasi;

  var soal = orderItems(skey('evaluasi', 'questions'), d.questions);

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
          key: skey('evaluasi', q.id, 'opsi'),
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

    '<article class="spec-doc spec-doc--compact">' +
    '<header class="spec-doc__head">' +
    '<span class="spec-doc__code">' + esc(d.dokLabel) + '</span>' +
    '</header>' +
    '<div class="spec-section">' + d.dokumen + '</div>' +
    '</article>' +

    '<div class="question-stack">' + soalHtml + '</div>' +
    '<div class="btn-group">' +
    (st.checked
      ? '<button type="button" class="btn btn--ghost" id="ulangSoalBtn">' + esc(d.ulangLabel) + '</button>'
      : '<button type="button" class="btn btn--primary" id="cekSoalBtn"' +
        (semuaDijawab ? '' : ' disabled') + '>' + esc(d.cekLabel) + '</button>') +
    '</div>' +
    (st.checked
      ? feedbackBox(
          st.correct === d.questions.length ? 'success' : 'info',
          st.correct === d.questions.length ? '🎉' : '📊',
          '<strong>Skor kamu: ' + st.correct + ' dari ' + d.questions.length + ' soal benar.</strong>' +
            (st.correct === d.questions.length
              ? ' Cara analisismu terbukti berlaku di dokumen lain.'
              : ' Baca penjelasan di tiap soal, lalu boleh dikerjakan ulang.')
        )
      : '') +

    (st.checked
      ? '<div class="panel">' +
        '<h3>' + esc(d.kesimpulanLabel) + '</h3>' +
        textareaField('kesimpulan', d.kesimpulanPrompt, st.conclusion, d.kesimpulanPlaceholder, d.kesimpulanMin) +
        '</div>'
      : '') +

    (st.checked && cukupTulisan ? nextButton(d.lanjutLabel) : '');

  d.questions.forEach(function (q) {
    container.querySelectorAll('input[name="q-' + q.id + '"]').forEach(function (input) {
      input.addEventListener('change', function () {
        st.answers[q.id] = input.value;
        saveState();
        focusAfter('input[value="' + input.value + '"]');
        renderEvaluasi(container);
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
      setScore('evaluasi', st.correct, d.questions.length);
      saveState();
      renderEvaluasi(container);
    });
  }

  var ulangBtn = container.querySelector('#ulangSoalBtn');
  if (ulangBtn) {
    ulangBtn.addEventListener('click', function () {
      st.checked = false;
      st.answers = {};
      saveState();
      renderEvaluasi(container);
    });
  }

  bindTextarea(container, {
    id: 'kesimpulan',
    min: d.kesimpulanMin,
    set: function (v) {
      st.conclusion = v;
    },
    extra: function () {
      return st.checked;
    },
    rerender: function () {
      renderEvaluasi(container);
    }
  });

  bindNext(container, 'evaluasi', 'refleksi');
  applyPendingFocus(container);
}
