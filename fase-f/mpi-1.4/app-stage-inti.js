'use strict';

/* ============================================================
   app-stage-inti.js — Tahap 4-6 (PBL fase 3: penyelidikan)
     4. telusur      menandai petunjuk jenis relasi pada catatan diskusi
     5. saring       mengelompokkan pasangan entitas ke jenis relasinya
     6. klasifikasi  menentukan sisi FK & merancang tabel penghubung
   ============================================================ */

/* ============================================================
   TAHAP 4 — Telusuri petunjuk keterhubungan entitas
   ============================================================ */
function renderTelusur(container) {
  var d = DATA.telusur;
  var st = State.telusur;

  /* Seluruh token dokumen, dalam urutan dokumen. Urutan ini TIDAK
     diacak: letak sebuah frasa di dalam kalimat adalah bagian dari
     maknanya. Yang diacak pada materi ini adalah pilihan jawaban
     (tahap 2, 3, 5, 6, 7, dan 8). */
  var tokens = [];
  d.doc.sections.forEach(function (sec) {
    (sec.paras || []).forEach(function (para) {
      para.forEach(function (part) {
        if (part.id) tokens.push(part);
      });
    });
    (sec.reqs || []).forEach(function (req) {
      req.parts.forEach(function (part) {
        if (part.id) tokens.push(part);
      });
    });
  });

  /* Petunjuk relasi sah adalah token yang kind-nya bukan 'bukan';
     kind 'bukan' adalah pengecoh yang dapat ditandai murid, tapi
     tidak dihitung menuju minTemuan. */
  function isRelasiClue(t) {
    return t.kind !== 'bukan';
  }

  var relasiTokens = tokens.filter(isRelasiClue);
  var ditemukan = relasiTokens.filter(function (t) {
    return st.marked[t.id];
  }).length;
  var cukup = ditemukan >= d.minTemuan || st.revealed;

  function tokenHtml(part) {
    var cls = 'spec-token';
    var status = '';
    if (st.marked[part.id]) {
      cls += ' is-marked is-' + part.kind;
      status = ', ditandai sebagai ' + d.kinds[part.kind].label;
    } else if (st.revealed && isRelasiClue(part)) {
      cls += ' is-revealed';
      status = ', petunjuk yang terlewat';
    }
    return (
      '<button type="button" class="' + cls + '" data-token="' + esc(part.id) + '"' +
      ' aria-pressed="' + (st.marked[part.id] ? 'true' : 'false') + '"' +
      ' aria-label="' + esc(part.label + status) + '">' +
      esc(part.label) +
      '</button>'
    );
  }

  function partsHtml(parts) {
    return parts
      .map(function (part) {
        return part.id ? tokenHtml(part) : esc(part.t);
      })
      .join('');
  }

  var dokumen =
    '<article class="spec-doc">' +
    '<header class="spec-doc__head">' +
    '<span class="spec-doc__code">' + esc(d.doc.code) + '</span>' +
    '<h3 class="spec-doc__title">' + esc(d.doc.title) + '</h3>' +
    '<dl class="spec-doc__meta">' +
    d.doc.meta
      .map(function (m) {
        return '<div><dt>' + esc(m.label) + '</dt><dd>' + esc(m.value) + '</dd></div>';
      })
      .join('') +
    '</dl>' +
    '</header>' +
    d.doc.sections
      .map(function (sec) {
        return (
          '<section class="spec-section">' +
          '<h4 class="spec-section__head">' + esc(sec.heading) + '</h4>' +
          (sec.paras || [])
            .map(function (para) {
              return '<p class="spec-para">' + partsHtml(para) + '</p>';
            })
            .join('') +
          (sec.reqs || [])
            .map(function (req) {
              return (
                '<p class="spec-req">' +
                '<span class="spec-req__code">' + esc(req.code) + '</span>' +
                '<span class="spec-req__text">' + partsHtml(req.parts) + '</span>' +
                '</p>'
              );
            })
            .join('') +
          '</section>'
        );
      })
      .join('') +
    '</article>';

  var legenda =
    '<div class="spec-legend">' +
    '<span class="spec-legend__label">' + esc(d.legendLabel) + '</span>' +
    Object.keys(d.kinds)
      .map(function (k) {
        return (
          '<span class="spec-legend__item is-' + k + '">' +
          '<span aria-hidden="true">' + d.kinds[k].icon + '</span> ' + esc(d.kinds[k].label) +
          '</span>'
        );
      })
      .join('') +
    '</div>';

  var umpan = '';
  if (st.lastFeedback) {
    umpan = feedbackBox(st.lastFeedback.tone, st.lastFeedback.icon, st.lastFeedback.html);
  }

  container.innerHTML =
    stageHead(d.kicker, d.title, d.goal) +

    '<div class="panel">' +
    '<p>' + d.instruction + '</p>' +
    '<p class="find-counter' + (ditemukan >= d.minTemuan ? ' is-done' : '') + '">' +
    '<span class="find-counter__label">' + esc(d.temuanLabel) + '</span>' +
    '<span class="find-counter__value">' + ditemukan + ' / ' + d.minTemuan + '</span>' +
    '</p>' +
    legenda +
    dokumen +
    '<div class="cell-feedback" aria-live="polite">' + umpan + '</div>' +
    hintReveal(d.hintLabel, d.hint) +
    (ditemukan >= d.revealMin && !st.revealed
      ? '<div class="btn-group">' +
        '<button type="button" class="btn btn--ghost btn--small" id="revealBtn">' + esc(d.revealLabel) + '</button>' +
        '</div>'
      : '') +
    '</div>' +

    (cukup ? nextButton(d.lanjutLabel) : '');

  container.querySelectorAll('[data-token]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.dataset.token;
      var part = findById(tokens, id);
      if (st.marked[id]) {
        delete st.marked[id];
        st.lastFeedback = null;
      } else {
        st.marked[id] = true;
        st.lastFeedback = {
          tone: d.kinds[part.kind].tone,
          icon: d.kinds[part.kind].icon,
          html: '<strong>' + esc(part.label) + '</strong> — ' + esc(part.why)
        };
      }
      saveState();
      focusAfter('[data-token="' + id + '"]');
      renderTelusur(container);
    });
  });

  var revealBtn = container.querySelector('#revealBtn');
  if (revealBtn) {
    revealBtn.addEventListener('click', function () {
      st.revealed = true;
      saveState();
      renderTelusur(container);
      showNotice(d.revealNotice);
    });
  }

  bindNext(container, 'telusur', 'saring');
  applyPendingFocus(container);
}

/* ============================================================
   TAHAP 5 — Saring pasangan entitas ke jenis relasinya
   ============================================================ */
function renderSaring(container) {
  var d = DATA.saring;
  var st = State.saring;

  function isRight(chip) {
    return st.assignments[chip.id] === chip.entityId;
  }

  var semuaDitempatkan = d.chips.every(function (c) {
    return !!st.assignments[c.id];
  });
  var semuaBenar = d.chips.every(isRight);

  var board = chipBoard({
    key: skey('saring', 'pool'),
    items: d.chips,
    columns: d.columns,
    st: st,
    checked: st.checked,
    isRight: isRight,
    labels: { pool: d.poolLabel, poolEmpty: d.poolEmpty, empty: d.emptyColumn }
  });

  var rincian = '';
  if (st.checked && !semuaBenar) {
    var salah = d.chips.filter(function (c) {
      return !isRight(c);
    });
    rincian = explainList(
      salah.map(function (c) {
        var tujuan = findById(d.columns, c.entityId);
        return {
          right: false,
          text: '<code>' + esc(c.label) + '</code> seharusnya masuk <strong>' + esc(tujuan.name) + '</strong>',
          why: esc(c.why)
        };
      })
    );
  }

  container.innerHTML =
    stageHead(d.kicker, d.title, d.goal) +

    '<div class="panel">' +
    '<p>' + esc(d.instruction) + '</p>' +
    board +
    hintReveal(d.hintLabel, d.hint + '<p class="hint-kbd">' + esc(d.keyboardHint) + '</p>') +
    '<div class="btn-group">' +
    '<button type="button" class="btn btn--primary" id="cekSaringBtn"' +
    (semuaDitempatkan ? '' : ' disabled') + '>' + esc(d.cekLabel) + '</button>' +
    '</div>' +
    (st.checked
      ? feedbackBox(
          semuaBenar ? 'success' : 'warning',
          semuaBenar ? '✓' : '!',
          semuaBenar
            ? '<strong>' + esc(d.benar) + '</strong>'
            : '<strong>' + st.correct + ' dari ' + d.chips.length + ' tepat.</strong> ' + esc(d.salah)
        ) + rincian
      : '') +
    '</div>' +

    (st.checked && semuaBenar ? nextButton(d.lanjutLabel) : '');

  bindChipBoard(container, {
    items: d.chips,
    columns: d.columns,
    st: st,
    onChange: function () {
      st.checked = false;
      saveState();
      renderSaring(container);
    }
  });

  var cekBtn = container.querySelector('#cekSaringBtn');
  if (cekBtn) {
    cekBtn.addEventListener('click', function () {
      st.checked = true;
      st.correct = d.chips.filter(isRight).length;
      setScore('saring', st.correct, d.chips.length);
      saveState();
      renderSaring(container);
    });
  }

  bindNext(container, 'saring', 'klasifikasi');
  applyPendingFocus(container);
}

/* ============================================================
   TAHAP 6 — Klasifikasikan foreign key & tabel penghubung
   ============================================================ */
function renderKlasifikasi(container) {
  var d = DATA.klasifikasi;
  var st = State.klasifikasi;

  /* ---- Langkah 1: tentukan sisi foreign key ---- */
  var semuaDijawabFk = d.fkQuestions.every(function (q) {
    return !!st.fkAnswers[q.id];
  });
  var fkBenar = d.fkQuestions.every(function (q) {
    return st.fkAnswers[q.id] === q.correct;
  });

  var soalFk = d.fkQuestions
    .map(function (q, i) {
      var jawab = st.fkAnswers[q.id];
      return (
        '<div class="question-card">' +
        '<p class="question-card__prompt"><span class="question-card__num">Relasi ' + (i + 1) + '</span> ' +
        esc(q.pairLabel) + '</p>' +
        '<p>' + esc(q.prompt) + '</p>' +
        choiceList({
          key: skey('klasifikasi', q.id, 'opsi'),
          options: q.options,
          name: 'fk-' + q.id,
          type: 'radio',
          isChecked: function (id) {
            return jawab === id;
          },
          stateOf: function (id) {
            if (!st.checkedFk) return '';
            if (id === q.correct) return 'is-correct';
            if (id === jawab) return 'is-incorrect';
            return '';
          },
          disabled: st.checkedFk
        }) +
        (st.checkedFk
          ? '<p class="question-feedback ' + (jawab === q.correct ? 'is-correct' : 'is-incorrect') + '">' +
            (jawab === q.correct ? '✓ Tepat. ' : '✗ Belum tepat. ') + esc(q.explanation) +
            '</p>'
          : '') +
        '</div>'
      );
    })
    .join('');

  /* ---- Langkah 2: rancang tabel penghubung ---- */
  var usulanBenar =
    fkBenar &&
    st.checkedUsulan &&
    d.usulan.every(function (u) {
      return u.simpan === (st.usulan.indexOf(u.id) !== -1);
    });

  var langkah2 = '';
  if (fkBenar) {
    langkah2 =
      '<div class="panel">' +
      '<h3>' + esc(d.step2Title) + '</h3>' +
      '<p>' + esc(d.step2Instruction) + '</p>' +
      choiceList({
        key: skey('klasifikasi', 'usulan'),
        options: d.usulan.map(function (u) {
          return { id: u.id, label: '<code>' + esc(u.label) + '</code>' };
        }),
        name: 'usulan',
        type: 'checkbox',
        isChecked: function (id) {
          return st.usulan.indexOf(id) !== -1;
        },
        stateOf: function (id) {
          if (!st.checkedUsulan) return '';
          var u = findById(d.usulan, id);
          var dipilih = st.usulan.indexOf(id) !== -1;
          if (u.simpan && dipilih) return 'is-correct';
          if (!u.simpan && dipilih) return 'is-incorrect';
          if (u.simpan && !dipilih) return 'unchecked-missed';
          return '';
        }
      }) +
      '<div class="btn-group">' +
      '<button type="button" class="btn btn--primary" id="cekUsulanBtn">' + esc(d.cekUsulanLabel) + '</button>' +
      '</div>' +
      (st.checkedUsulan
        ? feedbackBox(
            usulanBenar ? 'success' : 'warning',
            usulanBenar ? '✓' : '!',
            usulanBenar ? '<strong>' + esc(d.benarUsulan) + '</strong>' : esc(d.salahUsulan)
          ) +
          explainList(
            order(skey('klasifikasi', 'usulan'), d.usulan.map(function (u) { return u.id; })).map(function (id) {
              var u = findById(d.usulan, id);
              return {
                right: u.simpan,
                text: '<code>' + esc(u.label) + '</code>',
                why: esc(u.why)
              };
            })
          )
        : '') +
      '</div>';
  }

  container.innerHTML =
    stageHead(d.kicker, d.title, d.goal) +

    '<div class="panel">' +
    '<h3>' + esc(d.step1Title) + '</h3>' +
    '<p>' + esc(d.step1Instruction) + '</p>' +
    hintReveal('💡 Bingung menentukan sisinya?', d.step1Hint) +
    '<div class="question-stack">' + soalFk + '</div>' +
    '<div class="btn-group">' +
    (st.checkedFk
      ? '<button type="button" class="btn btn--ghost" id="ulangFkBtn">' + esc(d.ulangLabel) + '</button>'
      : '<button type="button" class="btn btn--primary" id="cekFkBtn"' +
        (semuaDijawabFk ? '' : ' disabled') + '>' + esc(d.cekLabel) + '</button>') +
    '</div>' +
    (st.checkedFk
      ? feedbackBox(
          fkBenar ? 'success' : 'warning',
          fkBenar ? '✓' : '!',
          fkBenar ? '<strong>' + esc(d.benar) + '</strong>' : esc(d.salah)
        )
      : '') +
    '</div>' +
    langkah2 +

    (usulanBenar ? nextButton(d.lanjutLabel) : '');

  d.fkQuestions.forEach(function (q) {
    container.querySelectorAll('input[name="fk-' + q.id + '"]').forEach(function (input) {
      input.addEventListener('change', function () {
        st.fkAnswers[q.id] = input.value;
        saveState();
        focusAfter('input[value="' + input.value + '"]');
        renderKlasifikasi(container);
      });
    });
  });

  var cekFkBtn = container.querySelector('#cekFkBtn');
  if (cekFkBtn) {
    cekFkBtn.addEventListener('click', function () {
      st.checkedFk = true;
      st.score.fk = d.fkQuestions.filter(function (q) {
        return st.fkAnswers[q.id] === q.correct;
      }).length;
      simpanSkorKlasifikasi();
      renderKlasifikasi(container);
    });
  }

  var ulangFkBtn = container.querySelector('#ulangFkBtn');
  if (ulangFkBtn) {
    ulangFkBtn.addEventListener('click', function () {
      st.checkedFk = false;
      st.fkAnswers = {};
      st.checkedUsulan = false;
      st.usulan = [];
      saveState();
      renderKlasifikasi(container);
    });
  }

  container.querySelectorAll('input[name="usulan"]').forEach(function (input) {
    input.addEventListener('change', function () {
      var id = input.value;
      if (input.checked) {
        if (st.usulan.indexOf(id) === -1) st.usulan.push(id);
      } else {
        st.usulan = st.usulan.filter(function (x) {
          return x !== id;
        });
      }
      st.checkedUsulan = false;
      saveState();
      focusAfter('input[value="' + id + '"]');
      renderKlasifikasi(container);
    });
  });

  var cekUsulanBtn = container.querySelector('#cekUsulanBtn');
  if (cekUsulanBtn) {
    cekUsulanBtn.addEventListener('click', function () {
      st.checkedUsulan = true;
      st.score.usulan = d.usulan.filter(function (u) {
        return u.simpan === (st.usulan.indexOf(u.id) !== -1);
      }).length;
      simpanSkorKlasifikasi();
      renderKlasifikasi(container);
    });
  }

  function simpanSkorKlasifikasi() {
    setScore(
      'klasifikasi',
      st.score.fk + st.score.usulan,
      d.fkQuestions.length + d.usulan.length
    );
  }

  bindNext(container, 'klasifikasi', 'sajikan');
  applyPendingFocus(container);
}
