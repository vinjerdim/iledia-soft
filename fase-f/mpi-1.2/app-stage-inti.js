'use strict';

/* ============================================================
   app-stage-inti.js — Tahap 4-6 (PBL fase 3: penyelidikan)
     4. telusur   menandai frasa pada dokumen spesifikasi
     5. saring    memilah kandidat: entitas / atribut / bukan data
     6. atribut   memetakan atribut, kunci, dan penghubungnya
   ============================================================ */

/* ============================================================
   TAHAP 4 — Telusur dokumen
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

  var entitasTokens = tokens.filter(function (t) {
    return t.kind === 'entitas';
  });
  var ditemukan = entitasTokens.filter(function (t) {
    return st.marked[t.id];
  }).length;
  var cukup = ditemukan >= d.minTemuan || st.revealed;

  function tokenHtml(part) {
    var cls = 'spec-token';
    var status = '';
    if (st.marked[part.id]) {
      cls += ' is-marked is-' + part.kind;
      status = ', ditandai sebagai ' + d.kinds[part.kind].label;
    } else if (st.revealed && part.kind === 'entitas') {
      cls += ' is-revealed';
      status = ', calon entitas yang terlewat';
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
          html: '<strong>' + esc(part.label) + '</strong> — ' + part.why
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
   TAHAP 5 — Saring kandidat
   ============================================================ */
function renderSaring(container) {
  var d = DATA.saring;
  var st = State.saring;

  function isRight(chip) {
    return st.assignments[chip.id] === chip.bucketId;
  }

  var semuaDitempatkan = d.chips.every(function (c) {
    return !!st.assignments[c.id];
  });
  var semuaBenar = d.chips.every(isRight);

  var board = chipBoard({
    key: skey('saring', 'pool'),
    items: d.chips,
    columns: d.buckets,
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
        var tujuan = findById(d.buckets, c.bucketId);
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
    '<p>' + d.instruction + '</p>' +
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
    columns: d.buckets,
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

  bindNext(container, 'saring', 'atribut');
  applyPendingFocus(container);
}

/* ============================================================
   TAHAP 6 — Petakan atribut
   ============================================================ */
function renderAtribut(container) {
  var d = DATA.atribut;
  var st = State.atribut;

  /* ---- Langkah 1: atribut → entitas pemiliknya ---- */
  function isRight(chip) {
    return st.assignments[chip.id] === chip.entityId;
  }

  var semuaDitempatkan = d.chips.every(function (c) {
    return !!st.assignments[c.id];
  });
  var chipBenar = d.chips.every(isRight);

  var board = chipBoard({
    key: skey('atribut', 'pool'),
    items: d.chips,
    columns: d.entities,
    st: st,
    checked: st.checkedChips,
    isRight: isRight,
    labels: { pool: d.poolLabel, poolEmpty: d.poolEmpty, empty: d.emptyColumn }
  });

  var rincianChip = '';
  if (st.checkedChips && !chipBenar) {
    rincianChip = explainList(
      d.chips
        .filter(function (c) {
          return !isRight(c);
        })
        .map(function (c) {
          var pemilik = findById(d.entities, c.entityId);
          return {
            right: false,
            text: '<code>' + esc(c.label) + '</code> seharusnya milik <strong>' + esc(pemilik.name) + '</strong>',
            why: esc(c.why)
          };
        })
    );
  }

  /* ---- Langkah 2: atribut kunci ---- */
  var kunciBenar =
    chipBenar &&
    d.entities.every(function (en) {
      return st.keys[en.id].pick === en.key;
    });

  var langkah2 = '';
  if (chipBenar) {
    langkah2 =
      '<div class="panel">' +
      '<h3>' + esc(d.step2Title) + '</h3>' +
      '<p>' + d.step2Instruction + '</p>' +
      '<div class="pk-grid">' +
      d.entities
        .map(function (en) {
          /* Pilihan select ikut diacak — isinya adalah atribut milik
             entitas itu, menurut penempatan murid sendiri. */
          var isi = orderItems(
            skey('atribut', 'kunci', en.id),
            d.chips.filter(function (c) {
              return st.assignments[c.id] === en.id;
            })
          );
          var dipilih = st.keys[en.id].pick;
          var status = '';
          if (st.checkedKeys) {
            status =
              dipilih === en.key
                ? '<span class="pk-status pk-status--ok">✓ tepat</span>'
                : '<span class="pk-status pk-status--no">✗ belum tepat</span>';
          }
          return (
            '<div class="pk-item">' +
            '<label for="key-' + esc(en.id) + '"><code>' + esc(en.name) + '</code></label>' +
            '<select id="key-' + esc(en.id) + '" class="input-select" data-key="' + esc(en.id) + '">' +
            '<option value="">' + esc(d.keyPlaceholder) + '</option>' +
            isi
              .map(function (c) {
                return (
                  '<option value="' + esc(c.id) + '"' + (dipilih === c.id ? ' selected' : '') + '>' +
                  esc(c.label) + '</option>'
                );
              })
              .join('') +
            '</select>' +
            status +
            '</div>'
          );
        })
        .join('') +
      '</div>' +
      '<div class="btn-group">' +
      '<button type="button" class="btn btn--primary" id="cekKunciBtn">' + esc(d.cekKunciLabel) + '</button>' +
      '</div>' +
      (st.checkedKeys
        ? feedbackBox(
            kunciBenar ? 'success' : 'warning',
            kunciBenar ? '✓' : '!',
            kunciBenar ? '<strong>' + esc(d.benarKunci) + '</strong>' : esc(d.salahKunci)
          )
        : '') +
      '</div>';
  }

  /* ---- Langkah 3: saring usulan atribut penempatan ---- */
  var usulanBenar =
    kunciBenar &&
    st.checkedUsulan &&
    d.usulan.every(function (u) {
      return u.simpan === (st.usulan.indexOf(u.id) !== -1);
    });

  var langkah3 = '';
  if (kunciBenar) {
    langkah3 =
      '<div class="panel">' +
      '<h3>' + esc(d.step3Title) + '</h3>' +
      '<p>' + d.step3Instruction + '</p>' +
      choiceList({
        key: skey('atribut', 'usulan'),
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
            order(skey('atribut', 'usulan'), d.usulan.map(function (u) { return u.id; })).map(function (id) {
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
    '<p>' + d.step1Instruction + '</p>' +
    board +
    hintReveal('💡 Bingung menentukan pemiliknya?', d.step1Hint + '<p class="hint-kbd">' + esc(d.keyboardHint) + '</p>') +
    '<div class="btn-group">' +
    '<button type="button" class="btn btn--primary" id="cekChipBtn"' +
    (semuaDitempatkan ? '' : ' disabled') + '>' + esc(d.cekLabel) + '</button>' +
    '</div>' +
    (st.checkedChips
      ? feedbackBox(
          chipBenar ? 'success' : 'warning',
          chipBenar ? '✓' : '!',
          chipBenar ? '<strong>' + esc(d.benar) + '</strong>' : esc(d.salah)
        ) + rincianChip
      : '') +
    '</div>' +
    langkah2 +
    langkah3 +

    (usulanBenar ? nextButton(d.lanjutLabel) : '');

  bindChipBoard(container, {
    items: d.chips,
    columns: d.entities,
    st: st,
    onChange: function () {
      st.checkedChips = false;
      st.checkedKeys = false;
      st.checkedUsulan = false;
      saveState();
      renderAtribut(container);
    }
  });

  var cekChipBtn = container.querySelector('#cekChipBtn');
  if (cekChipBtn) {
    cekChipBtn.addEventListener('click', function () {
      st.checkedChips = true;
      st.score.chips = d.chips.filter(isRight).length;
      simpanSkorAtribut();
      renderAtribut(container);
    });
  }

  container.querySelectorAll('[data-key]').forEach(function (sel) {
    sel.addEventListener('change', function () {
      st.keys[sel.dataset.key].pick = sel.value || null;
      st.checkedKeys = false;
      st.checkedUsulan = false;
      saveState();
      focusAfter('[data-key="' + sel.dataset.key + '"]');
      renderAtribut(container);
    });
  });

  var cekKunciBtn = container.querySelector('#cekKunciBtn');
  if (cekKunciBtn) {
    cekKunciBtn.addEventListener('click', function () {
      var belum = d.entities.filter(function (en) {
        return !st.keys[en.id].pick;
      });
      if (belum.length) {
        showNotice('Tentukan dulu atribut kunci untuk setiap entitas.');
        return;
      }
      st.checkedKeys = true;
      st.score.keys = d.entities.filter(function (en) {
        return st.keys[en.id].pick === en.key;
      }).length;
      simpanSkorAtribut();
      renderAtribut(container);
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
      renderAtribut(container);
    });
  });

  var cekUsulanBtn = container.querySelector('#cekUsulanBtn');
  if (cekUsulanBtn) {
    cekUsulanBtn.addEventListener('click', function () {
      st.checkedUsulan = true;
      st.score.usulan = d.usulan.filter(function (u) {
        return u.simpan === (st.usulan.indexOf(u.id) !== -1);
      }).length;
      simpanSkorAtribut();
      renderAtribut(container);
    });
  }

  function simpanSkorAtribut() {
    setScore(
      'atribut',
      st.score.chips + st.score.keys + st.score.usulan,
      d.chips.length + d.entities.length + d.usulan.length
    );
  }

  bindNext(container, 'atribut', 'sajikan');
  applyPendingFocus(container);
}
