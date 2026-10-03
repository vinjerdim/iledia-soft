'use strict';

/*
 * Tes seksi "ERD lengkap" pada shared/engine.js: letak kunci tamu
 * per jenis relasi, kunci primer (termasuk komposit), pemeriksaan
 * kelengkapan ERD, kartu entitas ber-PK/FK, dan diagram ERD lengkap.
 */
const test = require('node:test');
const assert = require('node:assert/strict');
const { loadEngine } = require('./load-engine');

const E = loadEngine();

function plain(x) {
  return JSON.parse(JSON.stringify(x));
}

const SISWA = { id: 'siswa', label: 'Siswa', ikon: '🧑‍🎓' };
const KARTU = { id: 'kartu', label: 'Kartu', ikon: '🪪' };
const PINJAM = { id: 'pinjam', label: 'Peminjaman', ikon: '📋' };
const ALAT = { id: 'alat', label: 'Alat', ikon: '💻' };

function rel(id, a, b, ab, ba, extra) {
  return Object.assign({ id, a, b, kerja: 'x', kerjaBalik: 'y', ab, ba }, extra || {});
}

function erdLengkap() {
  return {
    entitas: [
      Object.assign({}, SISWA, {
        atribut: [
          { id: 'nis', teks: 'nis', pk: true },
          { id: 'nama', teks: 'nama_siswa' },
        ],
      }),
      Object.assign({}, PINJAM, {
        atribut: [
          { id: 'no', teks: 'no_pinjam', pk: true },
          { id: 'nisFk', teks: 'nis', fk: 'siswa' },
        ],
      }),
      Object.assign({}, ALAT, { atribut: [{ id: 'kode', teks: 'kode_alat', pk: true }] }),
      {
        id: 'detail',
        label: 'Detail Peminjaman',
        penghubung: true,
        atribut: [
          { id: 'dNo', teks: 'no_pinjam', pk: true, fk: 'pinjam' },
          { id: 'dKode', teks: 'kode_alat', pk: true, fk: 'alat' },
        ],
      },
    ],
    relasi: [
      rel('rSiswa', SISWA, PINJAM, '0..N', '1..1'),
      rel('rAlat', PINJAM, ALAT, '1..N', '0..N', { penghubung: 'detail' }),
    ],
  };
}

test('letakKunciTamu: 1:N di sisi banyak, N:1 kebalikannya, M:N perlu penghubung', () => {
  assert.deepEqual(plain(E.letakKunciTamu(rel('r', SISWA, PINJAM, '0..N', '1..1'))), {
    jenis: 'fk',
    di: 'pinjam',
    rujuk: 'siswa',
  });
  assert.deepEqual(plain(E.letakKunciTamu(rel('r', PINJAM, SISWA, '1..1', '0..N'))), {
    jenis: 'fk',
    di: 'pinjam',
    rujuk: 'siswa',
  });
  assert.deepEqual(plain(E.letakKunciTamu(rel('r', PINJAM, ALAT, '1..N', '0..N'))), {
    jenis: 'penghubung',
  });
  assert.equal(E.letakKunciTamu(rel('r', SISWA, ALAT, '2..5', '1..1')), null);
});

test('letakKunciTamu: 1:1 diletakkan di sisi yang wajib punya pasangan', () => {
  /* Siswa boleh belum punya kartu (0..1); kartu wajib milik siswa (1..1). */
  assert.deepEqual(plain(E.letakKunciTamu(rel('r', SISWA, KARTU, '0..1', '1..1'))), {
    jenis: 'fk',
    di: 'kartu',
    rujuk: 'siswa',
  });
  /* Dibalik: tetap di Kartu. */
  assert.deepEqual(plain(E.letakKunciTamu(rel('r', KARTU, SISWA, '1..1', '0..1'))), {
    jenis: 'fk',
    di: 'kartu',
    rujuk: 'siswa',
  });
  /* Sama-sama wajib atau sama-sama opsional → bawaan sisi B. */
  assert.equal(E.letakKunciTamu(rel('r', SISWA, KARTU, '1..1', '1..1')).di, 'kartu');
  assert.equal(E.letakKunciTamu(rel('r', SISWA, KARTU, '0..1', '0..1')).di, 'kartu');
});

test('kunciPrimer mendukung kunci tunggal dan komposit', () => {
  const erd = erdLengkap();
  assert.deepEqual(plain(E.kunciPrimer(erd.entitas[0])), ['nis']);
  assert.deepEqual(plain(E.kunciPrimer(erd.entitas[3])), ['dNo', 'dKode']);
});

test('periksaErd: ERD lengkap tidak punya kesalahan', () => {
  assert.deepEqual(plain(E.periksaErd(erdLengkap())), []);
});

test('periksaErd menemukan PK hilang, FK salah tempat, dan M:N tanpa penghubung', () => {
  const tanpaPk = erdLengkap();
  tanpaPk.entitas[2].atribut[0].pk = false;
  assert.match(E.periksaErd(tanpaPk).join(' '), /Alat belum punya kunci primer/);

  const fkTerbalik = erdLengkap();
  fkTerbalik.entitas[1].atribut.pop();
  fkTerbalik.entitas[0].atribut.push({ id: 'noFk', teks: 'no_pinjam', fk: 'pinjam' });
  assert.match(E.periksaErd(fkTerbalik).join(' '), /Siswa – Peminjaman: kunci tamu/);

  const tanpaPenghubung = erdLengkap();
  delete tanpaPenghubung.relasi[1].penghubung;
  assert.match(E.periksaErd(tanpaPenghubung).join(' '), /M:N belum diwujudkan/);

  const fkAsing = erdLengkap();
  fkAsing.entitas[2].atribut.push({ id: 'x', teks: 'id_rak', fk: 'rak' });
  assert.match(E.periksaErd(fkAsing).join(' '), /tidak ada/);
});

test('buildEntityCard: kunci komposit, penanda FK, dan entitas penghubung', () => {
  const html = E.buildEntityCard(
    { id: 'detail', label: 'Detail', ikon: '🧾' },
    [
      { id: 'a', teks: 'no_pinjam' },
      { id: 'b', teks: 'kode_alat' },
      { id: 'c', teks: 'kondisi' },
    ],
    { kunci: ['a', 'b'], fk: { a: 'Peminjaman' }, penghubung: true }
  );
  assert.equal((html.match(/entity-card__attr--key/g) || []).length, 2);
  assert.equal((html.match(/entity-card__attr--fk/g) || []).length, 1);
  assert.match(html, /→ Peminjaman/);
  assert.match(html, /entity-card--link/);
  /* Kompatibel dengan pemanggilan lama (kunci berupa string). */
  const lama = E.buildEntityCard({ id: 'x', label: 'X' }, [{ id: 'k', teks: 'k' }], { kunci: 'k' });
  assert.match(lama, /entity-card__attr--key/);
  assert.doesNotMatch(lama, /entity-card--link|🔗/);
});

test('buildErdLengkap merender legenda, semua entitas, relasi, dan catatan penghubung', () => {
  const html = E.buildErdLengkap(erdLengkap(), { judul: 'ERD Lab' });
  assert.match(html, /class="erd"/);
  assert.match(html, /ERD Lab/);
  assert.match(html, /erd__legend/);
  assert.equal((html.match(/data-entitas="/g) || []).length, 4);
  assert.equal((html.match(/class="rel-diagram"/g) || []).length, 2);
  assert.match(html, /entitas penghubung <strong>Detail Peminjaman<\/strong>/);
  const tanpaRelasi = E.buildErdLengkap(erdLengkap(), { relasi: false });
  assert.doesNotMatch(tanpaRelasi, /rel-diagram/);
});
