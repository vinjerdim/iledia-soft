'use strict';

/*
 * Tes seksi "Relasi & kardinalitas ERD" dan "Kerja kelompok
 * kooperatif" pada shared/engine.js: penurunan jenis relasi dari
 * kardinalitas min..maks, umpan balik terdiagnosa, kalimat relasi,
 * diagram relasi, pemilih kardinalitas teracak, kuis sekali-jawab,
 * poin peningkatan STAD, dan predikat tim.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

function plain(x) {
  return JSON.parse(JSON.stringify(x));
}

const REL = {
  id: 'ikut',
  a: { id: 'siswa', label: 'Siswa', ikon: '🧑‍🎓' },
  b: { id: 'ekskul', label: 'Ekskul', ikon: '⚽' },
  kerja: 'mengikuti',
  kerjaBalik: 'diikuti oleh',
  ab: '0..N',
  ba: '1..N',
};

test('KARDINALITAS_OPSI memuat empat notasi min..maks berlabel', () => {
  const ids = plain(E.KARDINALITAS_OPSI).map((o) => o.id);
  assert.deepEqual(ids, ['0..1', '1..1', '0..N', '1..N']);
  E.KARDINALITAS_OPSI.forEach((o) => assert.ok(o.label.includes(o.id)));
});

test('uraiKardinalitas memecah notasi; notasi asing → null', () => {
  assert.deepEqual(plain(E.uraiKardinalitas('0..N')), { min: '0', maks: 'N' });
  assert.deepEqual(plain(E.uraiKardinalitas('1..1')), { min: '1', maks: '1' });
  assert.equal(E.uraiKardinalitas('2..5'), null);
  assert.equal(E.uraiKardinalitas(null), null);
});

test('jenisRelasi dari batas maksimum kedua arah', () => {
  assert.equal(E.jenisRelasi('1', '1'), '1:1');
  assert.equal(E.jenisRelasi('N', '1'), '1:N');
  assert.equal(E.jenisRelasi('1', 'N'), 'N:1');
  assert.equal(E.jenisRelasi('N', 'N'), 'M:N');
});

test('jenisDariKardinalitas memakai notasi min..maks', () => {
  assert.equal(E.jenisDariKardinalitas('0..1', '1..1'), '1:1');
  assert.equal(E.jenisDariKardinalitas('0..N', '1..1'), '1:N');
  assert.equal(E.jenisDariKardinalitas('1..1', '0..N'), 'N:1');
  assert.equal(E.jenisDariKardinalitas('0..N', '1..N'), 'M:N');
  assert.equal(E.jenisDariKardinalitas('?', '1..N'), null);
});

test('umpanKardinalitas mendiagnosa batas minimum dan maksimum', () => {
  assert.match(E.umpanKardinalitas('0..N', '0..N'), /Tepat/);
  const min = E.umpanKardinalitas('0..N', '1..N');
  assert.match(min, /minimum/i);
  assert.doesNotMatch(min, /maksimum/i);
  const maks = E.umpanKardinalitas('1..N', '1..1');
  assert.match(maks, /maksimum/i);
  assert.doesNotMatch(maks, /minimum/i);
  const dua = E.umpanKardinalitas('0..1', '1..N');
  assert.match(dua, /minimum/i);
  assert.match(dua, /maksimum/i);
});

test('kalimatRelasi membaca kedua arah relasi', () => {
  assert.equal(
    E.kalimatRelasi(REL, 'ab'),
    'Satu Siswa mengikuti minimal 0 dan maksimal banyak Ekskul.'
  );
  assert.equal(
    E.kalimatRelasi(REL, 'ba'),
    'Satu Ekskul diikuti oleh minimal 1 dan maksimal banyak Siswa.'
  );
  assert.match(E.kalimatRelasi(REL, 'ab', null), /\?/);
});

test('buildRelasiDiagram: entitas, notasi look-across, jenis, escaping', () => {
  const html = E.buildRelasiDiagram(REL);
  assert.match(html, /role="img"/);
  assert.match(html, /Siswa/);
  assert.match(html, /Ekskul/);
  assert.match(html, /mengikuti/);
  /* notasi ab (per satu Siswa) ditulis di dekat Ekskul — sisi kanan */
  const iA = html.indexOf('data-sisi="ba"');
  const iB = html.indexOf('data-sisi="ab"');
  assert.ok(iA !== -1 && iB !== -1 && iA < iB, 'ba di sisi A, ab di sisi B');
  assert.match(html, /M:N/);

  const kosong = E.buildRelasiDiagram(REL, { ab: null, ba: '1..N' });
  assert.match(kosong, />\?</);
  assert.doesNotMatch(kosong, /rel-diagram__jenis/);

  const jahat = Object.assign({}, REL, { a: { id: 'x', label: '<b>X</b>' } });
  assert.doesNotMatch(E.buildRelasiDiagram(jahat), /<b>X<\/b>/);
});

test('ensureKardinalitasState: urutan opsi teracak per sisi dan stabil', () => {
  const state = {};
  E.ensureKardinalitasState(state, 'k', [REL]);
  const st = state.k.ikut;
  ['ab', 'ba'].forEach((s) => {
    assert.deepEqual(plain(st[s].order).slice().sort(), ['0..1', '0..N', '1..1', '1..N']);
    assert.equal(st[s].chosen, null);
    assert.equal(st[s].firstTry, null);
  });
  const snap = JSON.stringify(state);
  E.ensureKardinalitasState(state, 'k', [REL]);
  assert.equal(JSON.stringify(state), snap);
});

test('kardinalitasSelesai dan skorKardinalitas (tepat sekali coba)', () => {
  const state = {};
  E.ensureKardinalitasState(state, 'k', [REL]);
  const st = state.k;
  assert.equal(E.kardinalitasSelesai([REL], st), false);
  st.ikut.ab.chosen = '0..N';
  st.ikut.ab.firstTry = true;
  st.ikut.ba.chosen = '1..N';
  st.ikut.ba.firstTry = false;
  assert.equal(E.kardinalitasSelesai([REL], st), true);
  assert.deepEqual(plain(E.skorKardinalitas([REL], st)), { benar: 1, total: 2 });
});

test('buildKardinalitasPicker: dua kelompok pilihan, diagram, jenis setelah tuntas', () => {
  const state = {};
  E.ensureKardinalitasState(state, 'k', [REL]);
  const st = state.k.ikut;
  let html = E.buildKardinalitasPicker(REL, st);
  assert.equal((html.match(/data-kard="/g) || []).length, 8);
  assert.match(html, /data-group="ikut:ab"/);
  assert.doesNotMatch(html, /rel-diagram__jenis/);
  st.ab.chosen = '0..N';
  st.ba.chosen = '1..N';
  html = E.buildKardinalitasPicker(REL, st);
  assert.match(html, /rel-diagram__jenis/);
  assert.match(html, /M:N/);
});

const KUIS = [
  { id: 'q1', tanya: 'Satu?', opsi: [{ id: 'a' }, { id: 'b' }], correct: 'a', umpan: {} },
  { id: 'q2', tanya: 'Dua?', opsi: [{ id: 'a' }, { id: 'b' }], correct: 'b', umpan: {} },
];

test('skorKuis dan kuisSelesai pada kuis sekali-jawab', () => {
  assert.deepEqual(plain(E.skorKuis(KUIS, {})), { benar: 0, total: 2, nilai: 0 });
  assert.equal(E.kuisSelesai(KUIS, { q1: 'a' }), false);
  assert.deepEqual(plain(E.skorKuis(KUIS, { q1: 'a', q2: 'a' })), {
    benar: 1,
    total: 2,
    nilai: 50,
  });
  assert.equal(E.kuisSelesai(KUIS, { q1: 'a', q2: 'a' }), true);
});

test('buildKuisSekali mengunci soal setelah dijawab dan menandai kunci', () => {
  const soal = [
    {
      id: 'q1',
      tanya: 'Satu?',
      opsi: [
        { id: 'a', label: 'A' },
        { id: 'b', label: 'B' },
      ],
      correct: 'a',
      umpan: { a: 'ya', b: 'bukan' },
    },
  ];
  const belum = E.buildKuisSekali(soal, { q1: ['b', 'a'] }, {});
  assert.doesNotMatch(belum, /disabled/);
  assert.ok(belum.indexOf('data-kuis-opt="b"') < belum.indexOf('data-kuis-opt="a"'));
  const sudah = E.buildKuisSekali(soal, { q1: ['b', 'a'] }, { q1: 'b' });
  assert.match(sudah, /disabled/);
  assert.match(sudah, /is-correct/);
  assert.match(sudah, /is-incorrect/);
  assert.match(sudah, /bukan/);
});

test('poinPeningkatan mengikuti aturan STAD', () => {
  assert.equal(E.poinPeningkatan(60, 40), 5);
  assert.equal(E.poinPeningkatan(60, 50), 10);
  assert.equal(E.poinPeningkatan(60, 59), 10);
  assert.equal(E.poinPeningkatan(60, 60), 20);
  assert.equal(E.poinPeningkatan(60, 70), 20);
  assert.equal(E.poinPeningkatan(60, 80), 30);
  assert.equal(E.poinPeningkatan(100, 100), 30, 'nilai sempurna selalu 30');
});

test('rataPoinTim mengabaikan isian kosong; predikatTim per ambang', () => {
  assert.equal(E.rataPoinTim([20, '', null, 30, 'x', 10]), 20);
  assert.equal(E.rataPoinTim([]), null);
  assert.equal(E.predikatTim(25).id, 'super');
  assert.equal(E.predikatTim(20).id, 'hebat');
  assert.equal(E.predikatTim(15).id, 'baik');
  assert.equal(E.predikatTim(14.9).id, 'berkembang');
  ['super', 'hebat', 'baik', 'berkembang'].forEach((id) => {
    const p = vm.runInContext('PREDIKAT_TIM', E).find((x) => x.id === id);
    assert.ok(p.label && p.ikon && p.pesan);
  });
});

test('buildPeranKelompok: input berlabel untuk setiap peran', () => {
  const html = E.buildPeranKelompok(
    [{ id: 'ketua', ikon: '🧭', label: 'Ketua', tugas: 'Mengatur giliran' }],
    { ketua: 'Ani <x>' }
  );
  assert.match(html, /<label[^>]*for="peran-ketua"/);
  assert.match(html, /id="peran-ketua"/);
  assert.match(html, /Ani &lt;x&gt;/);
});
