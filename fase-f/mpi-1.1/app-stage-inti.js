'use strict';

/* ============================================================
   app-stage-inti.js — Tahap 4-6
     4. konsep   Discovery Learning: Data Collection
     5. rancang  Discovery Learning: Data Processing
     6. uji      Discovery Learning: Verification
   ============================================================ */

/* ============================================================
   TAHAP 4 — Pengumpulan Data
   ============================================================ */
function renderKonsep(container) {
  var d = DATA.konsep;
  var st = State.konsep;

  var terbuka = d.cards.filter(function (c) {
    return st.opened[c.id] && st.opened[c.id].seen;
  }).length;
  var semuaTerbuka = terbuka === d.cards.length;

  /* Kartu konsep TIDAK diacak: urutannya membangun pengertian
     bertahap (entitas -> tabel -> record -> field -> kunci).
     Yang diacak adalah latihan menjodohkan di bawahnya. */
  var kartu =
    '<div class="concept-cards">' +
    d.cards
      .map(function (c) {
        var seen = st.opened[c.id] && st.opened[c.id].seen;
        return (
          '<button type="button" class="concept-card' + (seen ? ' is-open' : '') + '"' +
          ' data-card="' + esc(c.id) + '" aria-expanded="' + (seen ? 'true' : 'false') + '">' +
          '<span class="concept-card__icon" aria-hidden="true">' + c.icon + '</span>' +
          '<span class="concept-card__term">' + esc(c.term) + '</span>' +
          (seen
            ? '<span class="concept-card__def">' + c.def + '</span>' +
              '<span class="concept-card__example">' + c.example + '</span>'
            : '<span class="concept-card__tap">Ketuk untuk membuka</span>') +
          '</button>'
        );
      })
      .join('') +
    '</div>';

  /* ---- Latihan menjodohkan ---- */
  var m = st.match;
  var terpakai = {};
  Object.keys(m.pairs).forEach(function (t) {
    terpakai[m.pairs[t]] = t;
  });

  function defLabel(defId) {
    var f = d.matchDefs.filter(function (x) {
      return x.id === defId;
    })[0];
    return f ? f.label : '';
  }

  var istilah = orderItems(skey('konsep', 'match', 'terms'), d.matchTerms);
  var makna = orderItems(skey('konsep', 'match', 'defs'), d.matchDefs);

  var lengkap = Object.keys(m.pairs).length === d.matchTerms.length;

  var latihan =
    '<div class="match-grid">' +
    '<div class="match-col">' +
    '<h4 class="match-col__head">Istilah</h4>' +
    istilah
      .map(function (t) {
        var pasangan = m.pairs[t.id];
        var cls = 'match-term';
        if (m.selectedTermId === t.id) cls += ' is-selected';
        if (pasangan) cls += ' is-paired';
        if (m.checked) cls += pasangan === d.matchKey[t.id] ? ' is-correct' : ' is-incorrect';
        var aria = t.label + (pasangan ? ', dipasangkan dengan: ' + defLabel(pasangan) : ', belum dipasangkan');
        return (
          '<button type="button" class="' + cls + '" data-term="' + esc(t.id) + '"' +
          ' aria-pressed="' + (m.selectedTermId === t.id ? 'true' : 'false') + '"' +
          ' aria-label="' + esc(aria) + '">' +
          '<span class="match-term__label">' + esc(t.label) + '</span>' +
          (pasangan ? '<span class="match-term__pair">' + esc(defLabel(pasangan)) + '</span>' : '') +
          '</button>'
        );
      })
      .join('') +
    '</div>' +
    '<div class="match-col">' +
    '<h4 class="match-col__head">Pengertian</h4>' +
    makna
      .map(function (f) {
        var owner = terpakai[f.id];
        var cls = 'match-def' + (owner ? ' is-used' : '');
        return (
          '<button type="button" class="' + cls + '" data-def="' + esc(f.id) + '">' +
          esc(f.label) +
          '</button>'
        );
      })
      .join('') +
    '</div>' +
    '</div>';

  var hasil = '';
  if (m.checked) {
    var benarSemua = m.correct === d.matchTerms.length;
    hasil = feedbackBox(
      benarSemua ? 'success' : 'warning',
      benarSemua ? '✓' : '!',
      benarSemua
        ? '<strong>Semua pasangan tepat.</strong> Kosakatamu sudah siap dipakai untuk merancang.'
        : '<strong>' + m.correct + ' dari ' + d.matchTerms.length + ' pasangan tepat.</strong> ' +
          'Pasangan bertanda merah perlu kamu tukar. Buka lagi kartu konsep di atas bila perlu.'
    );
  }

  container.innerHTML =
    stageHead(d.kicker, d.title, d.goal) +
    '<div class="panel">' +
    '<p>' + d.instruction + '</p>' +
    kartu +
    '<p class="find-counter' + (semuaTerbuka ? ' is-done' : '') + '">' +
    '<span class="find-counter__label">Kartu dibuka</span>' +
    '<span class="find-counter__value">' + terbuka + ' / ' + d.cards.length + '</span>' +
    '</p>' +
    '</div>' +

    (semuaTerbuka
      ? '<div class="panel">' +
        '<h3>' + esc(d.matchTitle) + '</h3>' +
        '<p>' + d.matchInstruction + '</p>' +
        '<p class="selected-indicator' + (m.selectedTermId ? ' is-visible' : '') + '" role="status" aria-live="polite">' +
        (m.selectedTermId
          ? 'Dipilih: <strong>' +
            esc(d.matchTerms.filter(function (t) { return t.id === m.selectedTermId; })[0].label) +
            '</strong> — sekarang ketuk pengertiannya.'
          : '') +
        '</p>' +
        latihan +
        '<div class="btn-group">' +
        '<button type="button" class="btn btn--primary" id="cekMatchBtn"' + (lengkap ? '' : ' disabled') + '>' +
        esc(d.cekLabel) + '</button>' +
        (Object.keys(m.pairs).length
          ? '<button type="button" class="btn btn--ghost" id="ulangMatchBtn">' + esc(d.ulangLabel) + '</button>'
          : '') +
        '</div>' +
        hasil +
        '</div>'
      : '') +

    (m.checked && m.correct === d.matchTerms.length ? nextButton(d.lanjutLabel) : '');

  container.querySelectorAll('[data-card]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.dataset.card;
      st.opened[id].seen = !st.opened[id].seen;
      saveState();
      focusAfter('[data-card="' + id + '"]');
      renderKonsep(container);
    });
  });

  container.querySelectorAll('[data-term]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.dataset.term;
      if (m.selectedTermId === id) {
        m.selectedTermId = null;
      } else if (m.pairs[id]) {
        /* Istilah yang sudah berpasangan: ketuk untuk melepasnya. */
        delete m.pairs[id];
        m.selectedTermId = id;
        m.checked = false;
      } else {
        m.selectedTermId = id;
      }
      saveState();
      focusAfter('[data-term="' + id + '"]');
      renderKonsep(container);
    });
  });

  container.querySelectorAll('[data-def]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var defId = btn.dataset.def;
      if (!m.selectedTermId) {
        showNotice('Ketuk dulu istilah di kolom kiri, baru pengertiannya.');
        return;
      }
      /* Satu pengertian hanya boleh dipakai satu istilah. */
      Object.keys(m.pairs).forEach(function (t) {
        if (m.pairs[t] === defId) delete m.pairs[t];
      });
      m.pairs[m.selectedTermId] = defId;
      m.selectedTermId = null;
      m.checked = false;
      saveState();
      focusAfter('[data-def="' + defId + '"]');
      renderKonsep(container);
    });
  });

  var cekBtn = container.querySelector('#cekMatchBtn');
  if (cekBtn) {
    cekBtn.addEventListener('click', function () {
      m.checked = true;
      m.correct = d.matchTerms.filter(function (t) {
        return m.pairs[t.id] === d.matchKey[t.id];
      }).length;
      setScore('konsep', m.correct, d.matchTerms.length);
      saveState();
      renderKonsep(container);
    });
  }

  var ulangBtn = container.querySelector('#ulangMatchBtn');
  if (ulangBtn) {
    ulangBtn.addEventListener('click', function () {
      m.pairs = {};
      m.selectedTermId = null;
      m.checked = false;
      saveState();
      renderKonsep(container);
    });
  }

  bindNext(container, 'konsep', 'rancang');
  applyPendingFocus(container);
}

/* ============================================================
   TAHAP 5 — Pengolahan Data
   ============================================================ */
function renderRancang(container) {
  var d = DATA.rancang;
  var st = State.rancang;

  function colById(id) {
    return d.columns.filter(function (c) {
      return c.id === id;
    })[0];
  }

  /* Urutan pool diacak sekali atas SELURUH kolom, lalu disaring.
     Menyaring dulu baru mengacak akan mengubah urutan tiap kali
     satu chip diambil. */
  var urutanPool = orderItems(skey('rancang', 'pool'), d.columns);
  var poolItems = urutanPool.filter(function (c) {
    return !st.assignments[c.id];
  });

  var semuaDitempatkan = poolItems.length === 0;
  var kolomBenar = d.columns.every(function (c) {
    return st.assignments[c.id] === c.tableId;
  });

  function chipHtml(col, inTable) {
    var cls = 'attr-chip';
    var t = st.assignments[col.id];
    if (!inTable && st.selectedColumnId === col.id) cls += ' is-selected';
    if (inTable) {
      var tabel = d.tables.filter(function (x) { return x.id === t; })[0];
      cls += ' attr-chip--' + tabel.colorKey;
      if (st.checkedColumns) cls += col.tableId === t ? ' attr-chip--correct' : ' attr-chip--incorrect';
    }
    var aria = inTable
      ? col.label + ', ada di tabel ' + tabelNama(t) + '. Aktifkan untuk mengembalikannya ke daftar.'
      : col.label + (st.selectedColumnId === col.id ? ', sedang dipilih' : ', belum ditempatkan');
    return (
      '<button type="button" class="' + cls + '" data-col="' + esc(col.id) + '"' +
      ' aria-pressed="' + (st.selectedColumnId === col.id ? 'true' : 'false') + '"' +
      ' aria-label="' + esc(aria) + '">' + esc(col.label) + '</button>'
    );
  }

  function tabelNama(id) {
    var t = d.tables.filter(function (x) { return x.id === id; })[0];
    return t ? t.name : '';
  }

  var pool =
    '<div class="attr-pool-section">' +
    '<p class="attr-pool-label">' + esc(d.poolLabel) +
    '<span class="attr-pool-count">' + poolItems.length + '</span></p>' +
    '<div class="attr-pool' + (semuaDitempatkan ? ' attr-pool--empty' : '') + '">' +
    poolItems
      .map(function (c) {
        return chipHtml(c, false);
      })
      .join('') +
    (semuaDitempatkan ? '<span class="sr-only">' + esc(d.poolEmpty) + '</span>' : '') +
    '</div></div>';

  var tabelKolom =
    '<div class="entity-columns">' +
    d.tables
      .map(function (t, i) {
        var isi = d.columns.filter(function (c) {
          return st.assignments[c.id] === t.id;
        });
        return (
          '<section class="entity-column entity-column--' + t.colorKey + '">' +
          '<header class="entity-column__header">' +
          '<span class="entity-column__name">' + esc(t.name) + '</span>' +
          '<span class="entity-column__desc">' + esc(t.desc) + '</span>' +
          '</header>' +
          '<button type="button" class="entity-column__drop" data-table="' + esc(t.id) + '">' +
          'Tempatkan di sini <span class="entity-column__key">' + (i + 1) + '</span>' +
          '</button>' +
          '<div class="entity-column__body">' +
          (isi.length
            ? isi.map(function (c) { return chipHtml(c, true); }).join('')
            : '<span class="entity-column__empty">Belum ada kolom</span>') +
          '</div>' +
          '</section>'
        );
      })
      .join('') +
    '</div>';

  var rincianKolom = '';
  if (st.checkedColumns && !kolomBenar) {
    var salah = d.columns.filter(function (c) {
      return st.assignments[c.id] && st.assignments[c.id] !== c.tableId;
    });
    rincianKolom =
      '<div class="explain-list">' +
      salah
        .map(function (c) {
          return (
            '<div class="explain-item is-incorrect">' +
            '<span class="explain-item__mark" aria-hidden="true">✗</span>' +
            '<div><p class="explain-item__text"><code>' + esc(c.label) + '</code> seharusnya di tabel <strong>' +
            esc(tabelNama(c.tableId)) + '</strong></p>' +
            '<p class="explain-item__why">' + esc(c.why) + '</p></div>' +
            '</div>'
          );
        })
        .join('') +
      '</div>';
  }

  /* ---- Langkah 2: primary key ---- */
  var pkBenar =
    kolomBenar &&
    d.tables.every(function (t) {
      return st.primaryKeys[t.id].pick === t.pk;
    });

  var langkah2 = '';
  if (kolomBenar) {
    langkah2 =
      '<div class="panel">' +
      '<h3>' + esc(d.step2Title) + '</h3>' +
      '<p>' + d.step2Instruction + '</p>' +
      '<div class="pk-grid">' +
      d.tables
        .map(function (t) {
          var isi = orderItems(
            skey('rancang', 'pk', t.id),
            d.columns.filter(function (c) {
              return st.assignments[c.id] === t.id;
            })
          );
          var dipilih = st.primaryKeys[t.id].pick;
          var status = '';
          if (st.checkedKeys) {
            status = dipilih === t.pk
              ? '<span class="pk-status pk-status--ok">✓ tepat</span>'
              : '<span class="pk-status pk-status--no">✗ belum tepat</span>';
          }
          return (
            '<div class="pk-item">' +
            '<label for="pk-' + esc(t.id) + '"><code>' + esc(t.name) + '</code></label>' +
            '<select id="pk-' + esc(t.id) + '" class="input-select" data-pk="' + esc(t.id) + '">' +
            '<option value="">' + esc(d.pkPlaceholder) + '</option>' +
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
      '</div>';
  }

  /* ---- Langkah 3: foreign key ---- */
  var fkBenar =
    pkBenar &&
    st.checkedKeys &&
    d.fkOptions.every(function (o) {
      return o.correct === (st.foreignKeys.indexOf(o.id) !== -1);
    });

  var langkah3 = '';
  if (pkBenar) {
    langkah3 =
      '<div class="panel">' +
      '<h3>' + esc(d.step3Title) + '</h3>' +
      '<p>' + d.step3Instruction + '</p>' +
      choiceList({
        key: skey('rancang', 'fk'),
        options: d.fkOptions.map(function (o) {
          return { id: o.id, label: '<code>' + esc(o.label) + '</code>' };
        }),
        name: 'fk',
        type: 'checkbox',
        isChecked: function (id) {
          return st.foreignKeys.indexOf(id) !== -1;
        },
        stateOf: function (id) {
          if (!st.checkedKeys) return '';
          var o = d.fkOptions.filter(function (x) { return x.id === id; })[0];
          var dipilih = st.foreignKeys.indexOf(id) !== -1;
          if (o.correct && dipilih) return 'is-correct';
          if (!o.correct && dipilih) return 'is-incorrect';
          if (o.correct && !dipilih) return 'unchecked-missed';
          return '';
        }
      }) +
      '<div class="btn-group">' +
      '<button type="button" class="btn btn--primary" id="cekKunciBtn">' + esc(d.cekKunciLabel) + '</button>' +
      '</div>' +
      (st.checkedKeys
        ? feedbackBox(fkBenar ? 'success' : 'warning', fkBenar ? '✓' : '!',
            fkBenar ? '<strong>' + esc(d.benarKunci) + '</strong>' : esc(d.salahKunci)) +
          '<div class="explain-list">' +
          d.fkOptions
            .map(function (o) {
              return (
                '<div class="explain-item ' + (o.correct ? 'is-correct' : 'is-incorrect') + '">' +
                '<span class="explain-item__mark" aria-hidden="true">' + (o.correct ? '✓' : '✗') + '</span>' +
                '<div><p class="explain-item__text"><code>' + esc(o.label) + '</code></p>' +
                '<p class="explain-item__why">' + esc(o.why) + '</p></div></div>'
              );
            })
            .join('') +
          '</div>'
        : '') +
      '</div>';
  }

  container.innerHTML =
    stageHead(d.kicker, d.title, d.goal) +
    '<div class="panel">' +
    '<h3>' + esc(d.step1Title) + '</h3>' +
    '<p>' + d.step1Instruction + '</p>' +
    '<p class="selected-indicator' + (st.selectedColumnId ? ' is-visible' : '') + '" role="status" aria-live="polite">' +
    (st.selectedColumnId
      ? 'Dipilih: <strong>' + esc(colById(st.selectedColumnId).label) + '</strong> — sekarang ketuk tabel tujuannya.'
      : '') +
    '</p>' +
    pool +
    tabelKolom +
    hintReveal('💡 Bingung menentukan pemiliknya?', d.step1Hint + '<p class="hint-kbd">' + d.keyboardHint + '</p>') +
    '<div class="btn-group">' +
    '<button type="button" class="btn btn--primary" id="cekKolomBtn"' + (semuaDitempatkan ? '' : ' disabled') + '>' +
    esc(d.cekKolomLabel) + '</button>' +
    '</div>' +
    (st.checkedColumns
      ? feedbackBox(kolomBenar ? 'success' : 'warning', kolomBenar ? '✓' : '!',
          kolomBenar ? '<strong>' + esc(d.benarKolom) + '</strong>' : esc(d.salahKolom)) + rincianKolom
      : '') +
    '</div>' +
    langkah2 +
    langkah3 +
    (fkBenar ? nextButton(d.lanjutLabel) : '');

  /* ---- Interaksi chip: pilih lalu tempatkan ---- */
  container.querySelectorAll('[data-col]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.dataset.col;
      if (st.assignments[id]) {
        delete st.assignments[id];
        st.selectedColumnId = id;
      } else {
        st.selectedColumnId = st.selectedColumnId === id ? null : id;
      }
      st.checkedColumns = false;
      saveState();
      focusAfter('[data-col="' + id + '"]');
      renderRancang(container);
    });

    /* Pintasan keyboard: angka 1-3 menempatkan chip yang sedang fokus. */
    btn.addEventListener('keydown', function (e) {
      var n = parseInt(e.key, 10);
      if (!n || n < 1 || n > d.tables.length) return;
      e.preventDefault();
      var id = btn.dataset.col;
      st.assignments[id] = d.tables[n - 1].id;
      st.selectedColumnId = null;
      st.checkedColumns = false;
      saveState();
      focusAfter('[data-col="' + id + '"]');
      renderRancang(container);
      showNotice(colById(id).label + ' ditempatkan di tabel ' + d.tables[n - 1].name + '.');
    });
  });

  container.querySelectorAll('[data-table]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      if (!st.selectedColumnId) {
        showNotice('Pilih dulu satu kolom dari daftar di atas.');
        return;
      }
      var colId = st.selectedColumnId;
      st.assignments[colId] = btn.dataset.table;
      st.selectedColumnId = null;
      st.checkedColumns = false;
      saveState();
      focusAfter('[data-table="' + btn.dataset.table + '"]');
      renderRancang(container);
    });
  });

  var cekKolomBtn = container.querySelector('#cekKolomBtn');
  if (cekKolomBtn) {
    cekKolomBtn.addEventListener('click', function () {
      st.checkedColumns = true;
      var benar = d.columns.filter(function (c) {
        return st.assignments[c.id] === c.tableId;
      }).length;
      st.score.columns = benar;
      saveState();
      renderRancang(container);
    });
  }

  container.querySelectorAll('[data-pk]').forEach(function (sel) {
    sel.addEventListener('change', function () {
      st.primaryKeys[sel.dataset.pk].pick = sel.value || null;
      st.checkedKeys = false;
      saveState();
      focusAfter('[data-pk="' + sel.dataset.pk + '"]');
      renderRancang(container);
    });
  });

  container.querySelectorAll('input[name="fk"]').forEach(function (input) {
    input.addEventListener('change', function () {
      var id = input.value;
      if (input.checked) {
        if (st.foreignKeys.indexOf(id) === -1) st.foreignKeys.push(id);
      } else {
        st.foreignKeys = st.foreignKeys.filter(function (x) {
          return x !== id;
        });
      }
      st.checkedKeys = false;
      saveState();
      focusAfter('input[value="' + id + '"]');
      renderRancang(container);
    });
  });

  var cekKunciBtn = container.querySelector('#cekKunciBtn');
  if (cekKunciBtn) {
    cekKunciBtn.addEventListener('click', function () {
      var belumPk = d.tables.filter(function (t) {
        return !st.primaryKeys[t.id].pick;
      });
      if (belumPk.length) {
        showNotice('Tentukan dulu primary key untuk setiap tabel.');
        return;
      }
      st.checkedKeys = true;
      var benarPk = d.tables.filter(function (t) {
        return st.primaryKeys[t.id].pick === t.pk;
      }).length;
      var benarFk = d.fkOptions.filter(function (o) {
        return o.correct === (st.foreignKeys.indexOf(o.id) !== -1);
      }).length;
      st.score.keys = benarPk + benarFk;
      setScore(
        'rancang',
        st.score.columns + st.score.keys,
        d.columns.length + d.tables.length + d.fkOptions.length
      );
      saveState();
      renderRancang(container);
    });
  }

  bindNext(container, 'rancang', 'uji');
  applyPendingFocus(container);
}

/* ============================================================
   TAHAP 6 — Verifikasi
   ============================================================ */
function renderUji(container) {
  var d = DATA.uji;

  var semuaDibuka = d.cases.every(function (c) {
    return State.uji[c.id].revealed;
  });

  var kasusHtml = d.cases
    .map(function (c) {
      var st = State.uji[c.id];

      var prediksi =
        '<div class="predict-block">' +
        '<p class="predict-label">' + esc(d.prediksiLabel) + '</p>' +
        choiceList({
          key: skey('uji', c.id, 'opsi'),
          options: c.options,
          name: 'pred-' + c.id,
          type: 'radio',
          isChecked: function (id) {
            return st.prediction === id;
          },
          stateOf: function (id) {
            if (!st.revealed) return '';
            if (id === c.correct) return 'is-correct';
            if (id === st.prediction) return 'is-incorrect';
            return '';
          },
          disabled: st.revealed
        }) +
        (st.revealed
          ? ''
          : '<div class="btn-group">' +
            '<button type="button" class="btn btn--primary btn--small" data-reveal="' + esc(c.id) + '"' +
            (st.prediction ? '' : ' disabled') + '>' + esc(d.bukaLabel) + '</button>' +
            '</div>') +
        '</div>';

      var hasil = '';
      if (st.revealed) {
        hasil =
          feedbackBox(
            st.correct ? 'success' : 'info',
            st.correct ? '✓' : '💡',
            '<strong>' + esc(st.correct ? d.benarPrediksi : d.salahPrediksi) + '</strong>'
          ) +
          '<div class="compare-grid">' +
          '<div class="compare-side compare-side--flat">' +
          '<h4 class="compare-side__head">' + esc(d.flatLabel) + '</h4>' +
          '<p class="compare-side__verdict compare-side__verdict--buruk">✗ Bermasalah</p>' +
          '<p>' + c.flat.text + '</p>' +
          '</div>' +
          '<div class="compare-side compare-side--rancangan">' +
          '<h4 class="compare-side__head">' + esc(d.rancanganLabel) + '</h4>' +
          '<p class="compare-side__verdict compare-side__verdict--baik">✓ Aman</p>' +
          '<p>' + c.rancangan.text + '</p>' +
          '</div>' +
          '</div>' +
          '<p class="konsep-tag">Konsep: <strong>' + esc(c.konsep) + '</strong></p>';
      }

      return (
        '<div class="panel case-panel' + (st.revealed ? ' is-open' : '') + '">' +
        '<h3 class="case-title">' +
        '<span class="case-title__icon" aria-hidden="true">' + c.icon + '</span>' +
        esc(c.title) + '</h3>' +
        '<p class="case-scenario">' + esc(c.scenario) + '</p>' +
        prediksi +
        hasil +
        '</div>'
      );
    })
    .join('');

  container.innerHTML =
    stageHead(d.kicker, d.title, d.goal) +
    '<div class="panel panel--info"><p>' + d.instruction + '</p></div>' +
    kasusHtml +
    (semuaDibuka
      ? '<div class="panel panel--accent"><p class="lead">' + d.penutup + '</p></div>' + nextButton(d.lanjutLabel)
      : '');

  d.cases.forEach(function (c) {
    container.querySelectorAll('input[name="pred-' + c.id + '"]').forEach(function (input) {
      input.addEventListener('change', function () {
        State.uji[c.id].prediction = input.value;
        saveState();
        focusAfter('input[value="' + input.value + '"]');
        renderUji(container);
      });
    });
  });

  container.querySelectorAll('[data-reveal]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.dataset.reveal;
      var c = d.cases.filter(function (x) {
        return x.id === id;
      })[0];
      var st = State.uji[id];
      st.revealed = true;
      st.correct = st.prediction === c.correct;

      var benar = d.cases.filter(function (x) {
        return State.uji[x.id].revealed && State.uji[x.id].correct;
      }).length;
      var dibuka = d.cases.filter(function (x) {
        return State.uji[x.id].revealed;
      }).length;
      setScore('uji', benar, dibuka);
      saveState();
      renderUji(container);
    });
  });

  bindNext(container, 'uji', 'simpulan');
  applyPendingFocus(container);
}
