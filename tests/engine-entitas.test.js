'use strict';

/*
 * Tes seksi "Analisis kebutuhan data" pada shared/engine.js:
 * pemeriksa multi-pilih berdiagnosa, penanda frasa dokumen kebutuhan,
 * skor pemilahan, cakupan kebutuhan terhadap rancangan, dan
 * builder kartu entitas.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

const OPSI = [
  { id: 'o1', label: 'Satu', benar: true },
  { id: 'o2', label: 'Dua', benar: true },
  { id: 'o3', label: 'Tiga', benar: false },
  { id: 'o4', label: 'Empat', benar: false },
];

function plain(x) {
  return JSON.parse(JSON.stringify(x));
}

test('periksaMultiPilih: semua benar dan tanpa pengecoh', () => {
  const r = plain(E.periksaMultiPilih(OPSI, ['o2', 'o1']));
  assert.deepEqual(r, {
    semuaBenar: true,
    tepat: 2,
    totalBenar: 2,
    salahPilih: [],
    terlewat: [],
  });
});

test('periksaMultiPilih: mendiagnosa pilihan keliru dan yang terlewat', () => {
  const r = plain(E.periksaMultiPilih(OPSI, ['o1', 'o3']));
  assert.equal(r.semuaBenar, false);
  assert.equal(r.tepat, 1);
  assert.deepEqual(r.salahPilih, ['o3']);
  assert.deepEqual(r.terlewat, ['o2']);
});

test('periksaMultiPilih: id asing diabaikan, pilihan kosong tidak benar', () => {
  const r = plain(E.periksaMultiPilih(OPSI, ['zz']));
  assert.equal(r.semuaBenar, false);
  assert.equal(r.tepat, 0);
  assert.deepEqual(r.terlewat, ['o1', 'o2']);
});

test('ensureMultiState menyiapkan urutan acak yang stabil', () => {
  const state = {};
  const st = E.ensureMultiState(state, 'm', OPSI);
  assert.deepEqual(Array.from(st.chosen), []);
  assert.equal(st.checked, false);
  assert.equal(st.done, false);
  assert.deepEqual(Array.from(st.order).sort(), ['o1', 'o2', 'o3', 'o4']);
  const order = Array.from(st.order);
  st.chosen.push('o1');
  const again = E.ensureMultiState(state, 'm', OPSI);
  assert.deepEqual(Array.from(again.order), order);
  assert.deepEqual(Array.from(again.chosen), ['o1']);
});

test('daftarFrasa membaca penanda [[id|teks]] sesuai urutan kemunculan', () => {
  const teks = 'Saya mencatat [[f1|nama anggota]] lalu [[f2|harga barang]].';
  assert.deepEqual(plain(E.daftarFrasa(teks)), [
    { id: 'f1', label: 'nama anggota' },
    { id: 'f2', label: 'harga barang' },
  ]);
  assert.deepEqual(plain(E.daftarFrasa('tanpa penanda')), []);
});

test('tandaiFrasa mengubah penanda menjadi <mark> bernomor dan meloloskan teks', () => {
  const html = E.tandaiFrasa('A [[f1|<nama>]] B', { f1: 3 });
  assert.match(html, /<mark class="req-mark" data-frasa="f1">/);
  assert.match(html, /<span class="req-mark__num"[^>]*>3<\/span>/);
  assert.match(html, /&lt;nama&gt;/);
  assert.ok(!html.includes('[['));
});

test('nilaiPemilahan menghitung butir yang benar', () => {
  const items = [{ id: 'a1' }, { id: 'a2' }, { id: 'a3' }];
  const states = { a1: { correct: true }, a2: { correct: false }, a3: { correct: true } };
  assert.deepEqual(plain(E.nilaiPemilahan(items, states)), { benar: 2, total: 3 });
});

test('cakupanKebutuhan: kebutuhan terpenuhi bila semua atribut ada', () => {
  const rancangan = ['nama', 'kelas', 'stok'];
  assert.deepEqual(plain(E.cakupanKebutuhan(rancangan, { perlu: ['nama', 'stok'] })), {
    terpenuhi: true,
    kurang: [],
  });
  assert.deepEqual(plain(E.cakupanKebutuhan(rancangan, { perlu: ['nama', 'stok_minimum'] })), {
    terpenuhi: false,
    kurang: ['stok_minimum'],
  });
});

test('buildEntityCard menandai atribut kunci dan meloloskan label', () => {
  const html = E.buildEntityCard(
    { id: 'anggota', label: 'Anggota', ikon: '🧑' },
    [
      { id: 'id_anggota', teks: 'id_anggota' },
      { id: 'nama', teks: '<nama>' },
    ],
    { kunci: 'id_anggota' }
  );
  assert.match(html, /class="entity-card"/);
  assert.match(html, /Anggota/);
  assert.match(html, /entity-card__attr--key[^"]*">[\s\S]*?🔑[\s\S]*?id_anggota/);
  assert.match(html, /&lt;nama&gt;/);
});
