'use strict';

/*
 * Tes komponen generik shared/engine.js (port dari iledia-math):
 * pengacakan yang dipersistensi, penyimpanan State, pemilahan
 * kategori, urut-ketuk, dan pertanyaan penuntun bertingkat.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

const OPSI = [
  { id: 'a', label: 'A' },
  { id: 'b', label: 'B' },
  { id: 'c', label: 'C' },
  { id: 'd', label: 'D' },
];

function sorted(arr) {
  return Array.from(arr).slice().sort();
}

test('shuffleArray mengembalikan permutasi baru tanpa mengubah masukan', () => {
  const src = [1, 2, 3, 4, 5];
  const out = E.shuffleArray(src);
  assert.notEqual(out, src);
  assert.deepEqual(src, [1, 2, 3, 4, 5]);
  assert.deepEqual(sorted(out), [1, 2, 3, 4, 5]);
});

test('shuffleArray benar-benar mengacak (tidak selalu urutan asal)', () => {
  const ids = ['a', 'b', 'c', 'd', 'e', 'f'];
  let berubah = 0;
  for (let i = 0; i < 50; i++) {
    if (E.shuffleArray(ids).join() !== ids.join()) berubah++;
  }
  assert.ok(berubah > 40, 'urutan teracak pada sebagian besar percobaan');
});

test('ensureShuffledOrder membuat urutan sekali lalu mempertahankannya', () => {
  const state = {};
  const first = Array.from(E.ensureShuffledOrder(state, 'o', OPSI));
  assert.deepEqual(sorted(first), ['a', 'b', 'c', 'd']);
  const again = Array.from(E.ensureShuffledOrder(state, 'o', OPSI));
  assert.deepEqual(again, first, 'render ulang memakai urutan tersimpan');
});

test('ensureShuffledOrder mengacak ulang bila opsi di DATA berubah', () => {
  const state = { o: ['a', 'b', 'x', 'd'] };
  const out = Array.from(E.ensureShuffledOrder(state, 'o', OPSI));
  assert.deepEqual(sorted(out), ['a', 'b', 'c', 'd']);
});

test('orderByIds menyusun opsi menurut urutan id, aman bila urutan rusak', () => {
  const out = E.orderByIds(OPSI, ['c', 'a', 'd', 'b']).map((o) => o.id);
  assert.deepEqual(Array.from(out), ['c', 'a', 'd', 'b']);
  assert.equal(E.orderByIds(OPSI, null), OPSI);
  assert.equal(E.orderByIds(OPSI, ['a', 'zz', 'c', 'd']), OPSI);
});

test('createStore menyimpan, memuat, dan mereset State', () => {
  const mem = {};
  E.localStorage = {
    getItem: (k) => (k in mem ? mem[k] : null),
    setItem: (k, v) => {
      mem[k] = String(v);
    },
    removeItem: (k) => {
      delete mem[k];
    },
  };
  const state = { currentStage: 'orientasi', completedStages: {}, n: 0 };
  const store = E.createStore({ key: 'tes', state });
  state.n = 5;
  state.completedStages.orientasi = true;
  store.save();
  state.n = 9;
  assert.equal(store.load(), true);
  assert.equal(state.n, 5);
  store.reset();
  assert.equal(state.n, 0);
  assert.deepEqual(Object.keys(state.completedStages), []);
  assert.equal(mem.tes, undefined);
});

test('ensureSortStates menyiapkan state per butir dengan opsi teracak', () => {
  const items = [
    { id: 'i1', correct: 'a' },
    { id: 'i2', correct: 'b' },
    { id: 'i3', correct: 'c' },
  ];
  const state = {};
  E.ensureSortStates(state, 'sort', 'sortOrder', items, OPSI);
  assert.deepEqual(sorted(Object.keys(state.sort)), ['i1', 'i2', 'i3']);
  assert.deepEqual(sorted(state.sortOrder), ['i1', 'i2', 'i3']);
  items.forEach((it) => {
    assert.deepEqual(sorted(state.sort[it.id].optionOrder), ['a', 'b', 'c', 'd']);
    assert.equal(state.sort[it.id].chosen, null);
  });
  state.sort.i1.chosen = 'a';
  const order = Array.from(state.sort.i2.optionOrder);
  E.ensureSortStates(state, 'sort', 'sortOrder', items, OPSI);
  assert.equal(state.sort.i1.chosen, 'a', 'jawaban tersimpan dipertahankan');
  assert.deepEqual(Array.from(state.sort.i2.optionOrder), order);
  assert.equal(E.sortItemsAllAnswered(items, state.sort), false);
  state.sort.i1.correct = true;
  assert.equal(E.sortItemsCorrectCount(items, state.sort), 1);
});

test('ensureTapOrderState tidak pernah memulai dari urutan yang sudah benar', () => {
  const items = OPSI;
  const answer = ['a', 'b', 'c', 'd'];
  for (let i = 0; i < 30; i++) {
    const state = {};
    const st = E.ensureTapOrderState(state, 'urut', items, answer);
    assert.notEqual(st.pool.join(), answer.join());
    assert.deepEqual(Array.from(st.placed), []);
  }
  const st = { placed: ['a', 'b', 'c', 'd'], pool: [] };
  assert.equal(E.tapOrderIsCorrect(st, answer), true);
  st.placed = ['b', 'a', 'c', 'd'];
  assert.equal(E.tapOrderIsCorrect(st, answer), false);
});

test('guidedQuizAllCorrect hanya benar bila semua pertanyaan dijawab tepat', () => {
  const list = [
    { id: 'q1', correct: 'a' },
    { id: 'q2', correct: 'c' },
  ];
  assert.equal(E.guidedQuizAllCorrect(list, { q1: 'a' }), false);
  assert.equal(E.guidedQuizAllCorrect(list, { q1: 'a', q2: 'b' }), false);
  assert.equal(E.guidedQuizAllCorrect(list, { q1: 'a', q2: 'c' }), true);
});

test('esc meloloskan karakter HTML', () => {
  assert.equal(E.esc('<b>"x" & \'y\'</b>'), '&lt;b&gt;&quot;x&quot; &amp; &#39;y&#39;&lt;/b&gt;');
});
