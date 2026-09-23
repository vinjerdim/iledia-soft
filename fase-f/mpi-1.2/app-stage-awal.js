'use strict';

/* ============================================================
   app-stage-awal.js — Tahap 1-3
     1. orientasi  (pra)
     2. masalah    PBL fase 1: Orientasi murid pada masalah
     3. bekal      PBL fase 2: Mengorganisasikan murid untuk belajar
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

    nextButton('Mulai: terima pekerjaan dari klien →');

  bindNext(container, 'orientasi', 'masalah');
}

/* ============================================================
   TAHAP 2 — Orientasi pada masalah (PBL fase 1)
   ============================================================ */
function renderMasalah(container) {
  var d = DATA.masalah;
  var st = State.masalah;

  function byId(id) {
    return findById(d.statements, id);
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

  var cukupTulisan = st.question.trim().length >= d.ownMin;

  var rincian = '';
  if (st.checked) {
    /* Penjelasan mengikuti urutan acak yang sama dengan daftar
       pilihannya, supaya mudah ditelusuri murid. */
    var urut = order(skey('masalah', 'statements'), d.statements.map(function (s) { return s.id; }));
    rincian = explainList(
      urut.map(function (id) {
        var s = byId(id);
        return { right: s.valid, text: esc(s.text), why: s.feedback };
      })
    );
  }

  container.innerHTML =
    stageHead(d.kicker, d.title, d.goal) +

    '<div class="panel panel--hero">' +
    '<h3>' + esc(d.briefLabel) + '</h3>' +
    d.brief +
    '<blockquote class="quote">' + esc(d.kutipan) + '</blockquote>' +
    '</div>' +

    '<div class="panel">' +
    '<h3>' + esc(d.kejadianLabel) + '</h3>' +
    '<div class="team-grid">' +
    d.kejadian
      .map(function (k) {
        return (
          '<div class="team-card">' +
          '<span class="team-card__name">' + esc(k.tim) + '</span>' +
          '<p class="team-card__desc">' + esc(k.hasil) + '</p>' +
          '</div>'
        );
      })
      .join('') +
    '</div>' +
    feedbackBox('warning', '⚠️', esc(d.insiden)) +
    '</div>' +

    '<div class="panel">' +
    '<p>' + d.instruction + '</p>' +
    choiceList({
      key: skey('masalah', 'statements'),
      options: d.statements.map(function (s) {
        return { id: s.id, label: esc(s.text) };
      }),
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
            ? '<strong>Tepat semua.</strong> Kamu berhasil memisahkan akar masalah dari gejalanya.'
            : '<strong>' + st.correct + ' dari ' + d.statements.length + ' tepat.</strong> ' +
              'Baca penjelasan di bawah, perbaiki pilihanmu, lalu periksa lagi.'
        ) + rincian
      : '') +
    '</div>' +

    (benarSemua
      ? '<div class="panel">' +
        '<h3>' + esc(d.ownLabel) + '</h3>' +
        textareaField('ownQuestion', d.ownPrompt, st.question, d.ownPlaceholder, d.ownMin) +
        '</div>'
      : '') +

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

  bindTextarea(container, {
    id: 'ownQuestion',
    min: d.ownMin,
    set: function (v) {
      st.question = v;
    },
    extra: function () {
      return benarSemua;
    },
    rerender: function () {
      renderMasalah(container);
    }
  });

  bindNext(container, 'masalah', 'bekal');
  applyPendingFocus(container);
}

/* ============================================================
   TAHAP 3 — Mengorganisasikan belajar (PBL fase 2)
   ============================================================ */
function renderBekal(container) {
  var d = DATA.bekal;
  var st = State.bekal;
  var m = st.match;

  var terbuka = d.cards.filter(function (c) {
    return st.opened[c.id] && st.opened[c.id].seen;
  }).length;
  var semuaTerbuka = terbuka === d.cards.length;

  /* Kartu teknik TIDAK diacak: ini konten pengantar, bukan pilihan
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

  /* ---- Latihan menjodohkan: teknik ↔ ciri ---- */
  var terpakai = {};
  Object.keys(m.pairs).forEach(function (t) {
    terpakai[m.pairs[t]] = t;
  });

  function defLabel(defId) {
    var f = findById(d.defs, defId);
    return f ? f.label : '';
  }

  var teknik = orderItems(skey('bekal', 'match', 'terms'), d.terms);
  var ciri = orderItems(skey('bekal', 'match', 'defs'), d.defs);
  var lengkap = Object.keys(m.pairs).length === d.terms.length;
  var benarSemua = m.checked && m.correct === d.terms.length;

  var latihan =
    '<div class="match-grid">' +
    '<div class="match-col">' +
    '<h4 class="match-col__head">Teknik</h4>' +
    teknik
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
    '<h4 class="match-col__head">Ciri</h4>' +
    ciri
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
            '</strong> — sekarang ketuk cirinya.'
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
                ? '<strong>Semua pasangan tepat.</strong> Bekalmu siap dipakai menelusuri temuan lapangan.'
                : '<strong>' + m.correct + ' dari ' + d.terms.length + ' pasangan tepat.</strong> ' +
                  'Pasangan bertanda merah perlu kamu tukar. Buka lagi kartu teknik di atas bila perlu.'
            )
          : '') +
        '</div>'
      : '') +

    (benarSemua
      ? '<div class="panel panel--info">' +
        '<h3>' + esc(d.rencanaLabel) + '</h3>' +
        '<ol class="flow-list">' +
        d.rencana
          .map(function (r) {
            return (
              '<li class="flow-list__item">' +
              '<span class="flow-list__title">' + esc(r.title) + '</span>' +
              '<span class="flow-list__desc">' + esc(r.desc) + '</span>' +
              '</li>'
            );
          })
          .join('') +
        '</ol>' +
        hintReveal(d.ujiSaringLabel, d.ujiSaring) +
        '</div>'
      : '') +

    (benarSemua ? nextButton(d.lanjutLabel) : '');

  container.querySelectorAll('[data-card]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.dataset.card;
      st.opened[id].seen = !st.opened[id].seen;
      saveState();
      focusAfter('[data-card="' + id + '"]');
      renderBekal(container);
    });
  });

  container.querySelectorAll('[data-term]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var id = btn.dataset.term;
      if (m.selectedTermId === id) {
        m.selectedTermId = null;
      } else if (m.pairs[id]) {
        /* Teknik yang sudah berpasangan: ketuk untuk melepasnya. */
        delete m.pairs[id];
        m.selectedTermId = id;
        m.checked = false;
      } else {
        m.selectedTermId = id;
      }
      saveState();
      focusAfter('[data-term="' + id + '"]');
      renderBekal(container);
    });
  });

  container.querySelectorAll('[data-def]').forEach(function (btn) {
    btn.addEventListener('click', function () {
      var defId = btn.dataset.def;
      if (!m.selectedTermId) {
        showNotice('Ketuk dulu satu teknik di kolom kiri, baru cirinya.');
        return;
      }
      /* Satu ciri hanya boleh dipakai satu teknik. */
      Object.keys(m.pairs).forEach(function (t) {
        if (m.pairs[t] === defId) delete m.pairs[t];
      });
      m.pairs[m.selectedTermId] = defId;
      m.selectedTermId = null;
      m.checked = false;
      saveState();
      focusAfter('[data-def="' + defId + '"]');
      renderBekal(container);
    });
  });

  var cekBtn = container.querySelector('#cekMatchBtn');
  if (cekBtn) {
    cekBtn.addEventListener('click', function () {
      m.checked = true;
      m.correct = d.terms.filter(function (t) {
        return m.pairs[t.id] === d.key[t.id];
      }).length;
      setScore('bekal', m.correct, d.terms.length);
      saveState();
      renderBekal(container);
    });
  }

  var ulangBtn = container.querySelector('#ulangMatchBtn');
  if (ulangBtn) {
    ulangBtn.addEventListener('click', function () {
      m.pairs = {};
      m.selectedTermId = null;
      m.checked = false;
      saveState();
      renderBekal(container);
    });
  }

  bindNext(container, 'bekal', 'telusur');
  applyPendingFocus(container);
}
