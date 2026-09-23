'use strict';

/* ============================================================
   app-stage-akhir.js — Tahap 7-9
     7. simpulan  Discovery: Generalization (+ uji pemahaman)
     8. refleksi  (penutup)
     9. selesai   (penutup)
   ============================================================ */

/* ============================================================
   TAHAP 7 — Generalisasi
   ============================================================
   Alur di dalam tahap: pilih pernyataan benar → tulis kesimpulan
   → uji pemahaman pada kasus baru → lanjut. */
function renderSimpulan(container) {
  var d = DATA.simpulan;
  var st = State.simpulan;

  function isPicked(id) {
    return st.picked.indexOf(id) !== -1;
  }

  function stateOf(id) {
    if (!st.checked) return '';
    var s = findById(d.statements, id);
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
  var cukupTulisan = st.conclusion.trim().length >= d.kesimpulanMin;
  var bukaKuis = benarSemua && cukupTulisan;

  var rincian = '';
  if (st.checked) {
    var urut = order(skey('simpulan', 'statements'), d.statements.map(function (s) { return s.id; }));
    rincian = explainList(
      urut.map(function (id) {
        var s = findById(d.statements, id);
        return { right: s.valid, text: esc(s.text), why: esc(s.feedback) };
      })
    );
  }

  /* ---- Uji pemahaman ---- */
  var soal = orderItems(skey('simpulan', 'questions'), d.questions);
  var semuaDijawab = d.questions.every(function (q) {
    return !!st.answers[q.id];
  });

  var soalHtml = soal
    .map(function (q, i) {
      var jawab = st.answers[q.id];
      return (
        '<div class="question-card">' +
        '<p class="question-card__prompt"><span class="question-card__num">Soal ' + (i + 1) + '</span> ' +
        esc(q.prompt) + '</p>' +
        choiceList({
          key: skey('simpulan', q.id, 'opsi'),
          options: q.options,
          name: 'q-' + q.id,
          type: 'radio',
          isChecked: function (id) {
            return jawab === id;
          },
          stateOf: function (id) {
            if (!st.kuisChecked) return '';
            if (id === q.correct) return 'is-correct';
            if (id === jawab) return 'is-incorrect';
            return '';
          },
          disabled: st.kuisChecked
        }) +
        (st.kuisChecked
          ? '<p class="question-feedback ' + (jawab === q.correct ? 'is-correct' : 'is-incorrect') + '">' +
            (jawab === q.correct ? '✓ Tepat. ' : '✗ Belum tepat. ') + esc(q.explanation) +
            '</p>'
          : '') +
        '</div>'
      );
    })
    .join('');

  container.innerHTML =
    stageHead(d.kicker, d.title, d.goal) +

    '<div class="panel">' +
    '<p>' + d.instruction + '</p>' +
    choiceList({
      key: skey('simpulan', 'statements'),
      options: d.statements.map(function (s) {
        return { id: s.id, label: esc(s.text) };
      }),
      name: 'pernyataan',
      type: 'checkbox',
      isChecked: isPicked,
      stateOf: stateOf
    }) +
    '<div class="btn-group">' +
    '<button type="button" class="btn btn--primary" id="cekPernyataanBtn">' + esc(d.cekLabel) + '</button>' +
    '</div>' +
    (st.checked
      ? feedbackBox(
          benarSemua ? 'success' : 'warning',
          benarSemua ? '✓' : '!',
          benarSemua
            ? '<strong>Tepat semua.</strong> Sekarang rangkai kesimpulanmu sendiri.'
            : '<strong>' + st.correct + ' dari ' + d.statements.length + ' tepat.</strong> ' +
              'Baca penjelasan di bawah, perbaiki pilihanmu, lalu periksa lagi.'
        ) + rincian
      : '') +
    '</div>' +

    (benarSemua
      ? '<div class="panel">' +
        '<h3>' + esc(d.kesimpulanLabel) + '</h3>' +
        textareaField('kesimpulan', d.kesimpulanPrompt, st.conclusion, d.kesimpulanPlaceholder, d.kesimpulanMin) +
        '</div>'
      : '') +

    (bukaKuis
      ? '<div class="panel panel--info">' +
        '<h3>' + esc(d.kuisLabel) + '</h3>' +
        '<p>' + esc(d.kuisIntro) + '</p>' +
        '</div>' +
        '<div class="question-stack">' + soalHtml + '</div>' +
        '<div class="btn-group">' +
        (st.kuisChecked
          ? '<button type="button" class="btn btn--ghost" id="ulangKuisBtn">' + esc(d.kuisUlangLabel) + '</button>'
          : '<button type="button" class="btn btn--primary" id="cekKuisBtn"' +
            (semuaDijawab ? '' : ' disabled') + '>' + esc(d.kuisCekLabel) + '</button>') +
        '</div>' +
        (st.kuisChecked
          ? feedbackBox(
              st.kuisCorrect === d.questions.length ? 'success' : 'info',
              st.kuisCorrect === d.questions.length ? '🎉' : '📊',
              '<strong>Skor kamu: ' + st.kuisCorrect + ' dari ' + d.questions.length + ' soal benar.</strong>' +
                (st.kuisCorrect === d.questions.length
                  ? ' Kesimpulanmu terbukti berlaku pada kasus baru.'
                  : ' Baca penjelasan di tiap soal. Kamu boleh mengerjakan ulang atau lanjut.')
            )
          : '')
      : '') +

    (bukaKuis && st.kuisChecked ? nextButton(d.lanjutLabel) : '');

  container.querySelectorAll('input[name="pernyataan"]').forEach(function (input) {
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
      renderSimpulan(container);
    });
  });

  container.querySelector('#cekPernyataanBtn').addEventListener('click', function () {
    if (!st.picked.length) {
      showNotice('Pilih dulu minimal satu pernyataan.');
      return;
    }
    st.checked = true;
    st.correct = d.statements.filter(function (s) {
      return s.valid === isPicked(s.id);
    }).length;
    setScore('simpulan', st.correct, d.statements.length);
    saveState();
    renderSimpulan(container);
  });

  /* Textarea kesimpulan: gambar ulang hanya saat ambang minimal baru
     terlampaui atau tidak lagi terpenuhi, karena bagian uji pemahaman
     ikut muncul/hilang. bindTextarea() di app-core.js memakai tombol
     lanjut sebagai penanda, yang di tahap ini baru muncul setelah
     kuis diperiksa, jadi tidak dipakai di sini. */
  var ta = container.querySelector('#kesimpulan');
  if (ta) {
    ta.addEventListener('input', function () {
      st.conclusion = ta.value;
      saveState();
      var count = container.querySelector('[data-count="kesimpulan"]');
      if (count) count.textContent = ta.value.trim().length + ' / ' + d.kesimpulanMin + ' karakter';
      if ((ta.value.trim().length >= d.kesimpulanMin) !== cukupTulisan) {
        focusAfter('#kesimpulan');
        renderSimpulan(container);
        var el = container.querySelector('#kesimpulan');
        if (el) el.selectionStart = el.selectionEnd = el.value.length;
      }
    });
  }

  d.questions.forEach(function (q) {
    container.querySelectorAll('input[name="q-' + q.id + '"]').forEach(function (input) {
      input.addEventListener('change', function () {
        st.answers[q.id] = input.value;
        saveState();
        focusAfter('input[name="q-' + q.id + '"][value="' + input.value + '"]');
        renderSimpulan(container);
      });
    });
  });

  var cekKuis = container.querySelector('#cekKuisBtn');
  if (cekKuis) {
    cekKuis.addEventListener('click', function () {
      st.kuisChecked = true;
      st.kuisCorrect = d.questions.filter(function (q) {
        return st.answers[q.id] === q.correct;
      }).length;
      setScore('kuis', st.kuisCorrect, d.questions.length);
      saveState();
      renderSimpulan(container);
    });
  }

  var ulangKuis = container.querySelector('#ulangKuisBtn');
  if (ulangKuis) {
    ulangKuis.addEventListener('click', function () {
      st.kuisChecked = false;
      st.answers = {};
      saveState();
      renderSimpulan(container);
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

  /* Mengingat kembali tebakan saat simulasi. Tebakan boleh saja
     kosong (mis. progres lama), jadi jangan berasumsi ada isinya. */
  var recallItems = DATA.uji.cases
    .map(function (c) {
      var u = State.uji.cases[c.id];
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
   TAHAP 9 — Selesai
   ============================================================ */
function renderSelesai(container) {
  var d = DATA.selesai;
  var total = totalScore();
  var pct = percent(total.correct, total.total);

  var labelSkor = {
    stimulasi: 'Jenis masalah (stimulasi)',
    masalah: 'Rumusan masalah',
    konsep: 'Menjodohkan istilah',
    olah: 'Pusat Kendali DBMS',
    uji: 'Tebakan simulasi',
    simpulan: 'Pernyataan kesimpulan',
    kuis: 'Uji pemahaman'
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

  var fungsiRows = DATA.olah.fungsiColumns.map(function (col) {
    return [
      '<strong>' + esc(col.name) + '</strong>',
      esc(col.desc),
      esc(d.fungsiMasalah[col.id] || '')
    ];
  });

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
    '<h3>' + esc(d.fungsiLabel) + '</h3>' +
    miniTable(d.fungsiHeaders, fungsiRows) +
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
