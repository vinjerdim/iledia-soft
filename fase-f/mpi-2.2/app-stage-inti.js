'use strict';

/* ============================================================
   app-stage-inti.js — Tahap 4-6
     4. konsep  Discovery: Data Collection
     5. olah    Discovery: Data Processing
     6. uji     Discovery: Verification
   ============================================================ */

/* ============================================================
   TAHAP 4 — Pengumpulan Data
   ============================================================ */
function renderKonsep(container) {
  var d = DATA.konsep;
  var st = State.konsep;
  var m = st.match;

  var terbuka = d.cards.filter(function (c) {
    return st.opened[c.id] && st.opened[c.id].seen;
  }).length;
  var semuaTerbuka = terbuka === d.cards.length;

  /* Kartu konsep TIDAK diacak: ini bahan bacaan, bukan pilihan
     jawaban. Yang diacak adalah latihan menjodohkan di bawahnya. */
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
            ? '<span class="concept-card__def">' + esc(c.def) + '</span>' +
              '<span class="concept-card__example">' + esc(c.example) + '</span>'
            : '<span class="concept-card__tap">Ketuk untuk membuka</span>') +
          '</button>'
        );
      })
      .join('') +
    '</div>';

  /* ---- Latihan menjodohkan: istilah ↔ pengertian ---- */
  var terpakai = {};
  Object.keys(m.pairs).forEach(function (t) {
    terpakai[m.pairs[t]] = t;
  });

  function defLabel(defId) {
    var f = findById(d.defs, defId);
    return f ? f.label : '';
  }

  var istilah = orderItems(skey('konsep', 'match', 'terms'), d.terms);
  var pengertian = orderItems(skey('konsep', 'match', 'defs'), d.defs);
  var lengkap = Object.keys(m.pairs).length === d.terms.length;
  var benarSemua = m.checked && m.correct === d.terms.length;

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
        if (m.checked) cls += pasangan === d.key[t.id] ? ' is-correct' : ' is-incorrect';
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
    pengertian
      .map(function (f) {
        return (
          '<button type="button" class="match-def' + (terpakai[f.id] ? ' is-used' : '') + '"' +
          ' data-def="' + esc(f.id) + '">' + esc(f.label) + '</button>'
        );
      })
      .join('') +
    '</div>' +
    '</div>';

  container.innerHTML =
    stageHead(d.kicker, d.title, d.goal) +

    (State.masalah.question.trim()
      ? '<div class="panel panel--accent"><h3>Pertanyaan penyelidikanmu</h3>' +
        '<blockquote class="quote">' + esc(State.masalah.question) + '</blockquote></div>'
      : '') +

    '<div class="panel">' +
    '<p>' + esc(d.instruction) + '</p>' +
    kartu +
    '<p class="find-counter' + (semuaTerbuka ? ' is-done' : '') + '">' +
    '<span class="find-counter__label">Kartu dibuka</span>' +
    '<span class="find-counter__value">' + terbuka + ' / ' + d.cards.length + '</span>' +
    '</p>' +
    '</div>' +

    (semuaTerbuka
      ? '<div class="panel">' +
        '<h3>' + esc(d.ujiTitle) + '</h3>' +
        '<p>' + esc(d.ujiInstruction) + '</p>' +
        '<p class="selected-indicator' + (m.selectedTermId ? ' is-visible' : '') + '" role="status" aria-live="polite">' +
        (m.selectedTermId
          ? 'Dipilih: <strong>' + esc(findById(d.terms, m.selectedTermId).label) +
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
        (m.checked
          ? feedbackBox(
              benarSemua ? 'success' : 'warning',
              benarSemua ? '✓' : '!',
              benarSemua
                ? '<strong>Semua pasangan tepat.</strong> Informasi yang kamu kumpulkan siap diolah.'
                : '<strong>' + m.correct + ' dari ' + d.terms.length + ' pasangan tepat.</strong> ' +
                  'Pasangan bertanda merah perlu kamu tukar. Buka lagi kartu konsep di atas bila perlu.'
            )
          : '') +
        '</div>'
      : '') +

    (benarSemua ? nextButton(d.lanjutLabel) : '');

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
        showNotice('Ketuk dulu satu istilah di kolom kiri, baru pengertiannya.');
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
      m.correct = d.terms.filter(function (t) {
        return m.pairs[t.id] === d.key[t.id];
      }).length;
      setScore('konsep', m.correct, d.terms.length);
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

  bindNext(container, 'konsep', 'olah');
  applyPendingFocus(container);
}

/* ============================================================
   TAHAP 5 — Pengolahan Data
   ============================================================
   Dua papan chip pada satu halaman. Masing-masing dipasang pada
   elemen pembungkusnya sendiri (bukan seluruh container), agar
   tombol [data-drop] milik papan A tidak ikut menerima chip dari
   papan B. */
function renderOlah(container) {
  var d = DATA.olah;
  var st = State.olah;

  function isRight(item) {
    return this.assignments[item.id] === item.entityId;
  }

  function hitungBenar(chips, papan) {
    return chips.filter(function (c) {
      return papan.assignments[c.id] === c.entityId;
    }).length;
  }

  var papanA = {
    key: skey('olah', 'produk'),
    items: d.produkChips,
    columns: d.produkColumns,
    st: st.produk,
    checked: st.produk.checked,
    isRight: isRight.bind(st.produk),
    labels: d.produkLabels,
    onChange: function () {
      st.produk.checked = false;
      saveState();
      renderOlah(container);
    }
  };

  var papanB = {
    key: skey('olah', 'ciri'),
    items: d.ciriChips,
    columns: d.ciriColumns,
    st: st.ciri,
    checked: st.ciri.checked,
    isRight: isRight.bind(st.ciri),
    labels: d.ciriLabels,
    onChange: function () {
      st.ciri.checked = false;
      saveState();
      renderOlah(container);
    }
  };

  var lengkapA = Object.keys(st.produk.assignments).length === d.produkChips.length;
  var lengkapB = Object.keys(st.ciri.assignments).length === d.ciriChips.length;
  var benarA = st.produk.checked && st.produk.correct === d.produkChips.length;
  var benarB = st.ciri.checked && st.ciri.correct === d.ciriChips.length;

  function hasil(papan, total, pesanBenar) {
    if (!papan.checked) return '';
    var semua = papan.correct === total;
    return feedbackBox(
      semua ? 'success' : 'warning',
      semua ? '✓' : '!',
      semua
        ? '<strong>' + esc(pesanBenar) + '</strong>'
        : '<strong>' + papan.correct + ' dari ' + total + ' tepat.</strong> ' + esc(d.salahPesan)
    );
  }

  container.innerHTML =
    stageHead(d.kicker, d.title, d.goal) +
    '<div class="panel panel--hero"><p>' + d.intro + '</p></div>' +

    '<div class="panel" id="papanProduk">' +
    '<h3>' + esc(d.produkLabel) + '</h3>' +
    '<p>' + esc(d.produkInstruction) + '</p>' +
    '<div class="produk-board">' + chipBoard(papanA) + '</div>' +
    '<div class="btn-group">' +
    '<button type="button" class="btn btn--primary" id="cekProdukBtn"' + (lengkapA ? '' : ' disabled') + '>' +
    esc(d.cekLabel) + '</button>' +
    '</div>' +
    hasil(st.produk, d.produkChips.length, d.produkBenar) +
    '</div>' +

    (benarA
      ? '<div class="panel" id="papanCiri">' +
        '<h3>' + esc(d.ciriLabel) + '</h3>' +
        '<p>' + esc(d.ciriInstruction) + '</p>' +
        '<div class="ciri-board">' + chipBoard(papanB) + '</div>' +
        '<div class="btn-group">' +
        '<button type="button" class="btn btn--primary" id="cekCiriBtn"' + (lengkapB ? '' : ' disabled') + '>' +
        esc(d.cekLabel) + '</button>' +
        '</div>' +
        hasil(st.ciri, d.ciriChips.length, d.ciriBenar) +
        '</div>'
      : '') +

    (benarA && benarB ? nextButton(d.lanjutLabel) : '');

  bindChipBoard(container.querySelector('#papanProduk'), papanA);
  var elB = container.querySelector('#papanCiri');
  if (elB) bindChipBoard(elB, papanB);

  function simpanSkor() {
    setScore(
      'olah',
      st.produk.correct + st.ciri.correct,
      d.produkChips.length + d.ciriChips.length
    );
  }

  container.querySelector('#cekProdukBtn').addEventListener('click', function () {
    st.produk.checked = true;
    st.produk.correct = hitungBenar(d.produkChips, st.produk);
    simpanSkor();
    saveState();
    renderOlah(container);
  });

  var cekB = container.querySelector('#cekCiriBtn');
  if (cekB) {
    cekB.addEventListener('click', function () {
      st.ciri.checked = true;
      st.ciri.correct = hitungBenar(d.ciriChips, st.ciri);
      simpanSkor();
      saveState();
      renderOlah(container);
    });
  }

  bindNext(container, 'olah', 'uji');
  applyPendingFocus(container);
}

/* ============================================================
   TAHAP 6 — Verifikasi
   ============================================================
   Setiap kasus memakai empat pilihan jenis DBMS dari DATA.uji.jenis.
   Urutan kasus TIDAK diacak (alur cerita RPL Mart); yang diacak
   adalah pilihan rekomendasi pada tiap kasus. */
function renderUji(container) {
  var d = DATA.uji;
  var st = State.uji;

  var semuaDibuka = d.cases.every(function (c) {
    return st.cases[c.id].revealed;
  });

  function labelJenis(id) {
    var j = findById(d.jenis, id);
    return j ? j.label : id;
  }

  function sisi(kelas, label, text) {
    return (
      '<div class="verify-side verify-side--' + kelas + '">' +
      '<span class="verify-side__head">' + esc(label) + '</span>' +
      '<p>' + esc(text) + '</p>' +
      '</div>'
    );
  }

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
          key: skey('uji', c.id, 'opsi'),
          options: c.options.map(function (id) {
            return { id: id, label: esc(labelJenis(id)) };
          }),
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
            (u.prediction ? '' : ' disabled') + '>🔍 ' + esc(d.bukaLabel) + '</button>' +
            '</div>'
          : feedbackBox(
              benar ? 'success' : 'info',
              benar ? '✓' : '💡',
              (benar ? '<strong>' + esc(d.benarPrediksi) + '</strong> ' : esc(d.salahPrediksi) + ' ') +
                'Jawaban: <strong>' + esc(labelJenis(c.correct)) + '</strong>.'
            ) +
            '<div class="verify-grid">' +
            sisi('butuh', d.butuhLabel, c.butuh) +
            sisi('cocok', d.cocokLabel, c.cocok) +
            '</div>' +
            '<div class="verify-side verify-side--bukan">' +
            '<span class="verify-side__head">' + esc(d.bukanLabel) + '</span>' +
            '<p>' + esc(c.bukan) + '</p>' +
            '</div>' +
            '<div class="dbms-console" role="figure" aria-label="' + esc(d.konsolLabel) + '">' +
            '<span class="dbms-console__head">' + esc(d.konsolLabel + ' · ' + labelJenis(c.correct)) + '</span>' +
            '<pre class="dbms-console__body">' + esc(c.konsol) + '</pre>' +
            '</div>') +
        '</section>'
      );
    })
    .join('');

  container.innerHTML =
    stageHead(d.kicker, d.title, d.goal) +
    '<div class="panel panel--info"><p>' + esc(d.instruction) + '</p></div>' +
    kasus +
    (semuaDibuka ? feedbackBox('success', '🎯', esc(d.penutup)) + nextButton(d.lanjutLabel) : '');

  d.cases.forEach(function (c) {
    container.querySelectorAll('input[name="uji-' + c.id + '"]').forEach(function (input) {
      input.addEventListener('change', function () {
        st.cases[c.id].prediction = input.value;
        saveState();
        focusAfter('input[name="uji-' + c.id + '"][value="' + input.value + '"]');
        renderUji(container);
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
      setScore('uji', benar, d.cases.length);
      saveState();
      renderUji(container);
    });
  });

  bindNext(container, 'uji', 'simpulan');
  applyPendingFocus(container);
}
