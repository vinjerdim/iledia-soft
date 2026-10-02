'use strict';

/*
 * build-pages.js — Menghasilkan index.html setiap modul MPI dari satu
 * template bersama (shared/page-template.html) + manifest per modul
 * (shared/pages-manifest.json).
 *
 * Ini adalah alat waktu-build yang dijalankan manual oleh developer
 * sebelum commit ("npm run build:pages") — situs tetap di-deploy sebagai
 * berkas statis apa adanya, tanpa langkah build di CI/hosting. Jalankan
 * `prettier --write` pada berkas yang dihasilkan seperti biasa setelahnya
 * (lint-staged sudah menanganinya saat commit).
 *
 * Pemakaian: node scripts/build-pages.js
 */

const fs = require('fs');
const path = require('path');

const ROOT = path.join(__dirname, '..');
const TEMPLATE_PATH = path.join(ROOT, 'shared', 'page-template.html');
const MANIFEST_PATH = path.join(ROOT, 'shared', 'pages-manifest.json');

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function renderPage(template, entry) {
  var extraBody = entry.extraBody
    ? fs.readFileSync(path.join(ROOT, 'shared', entry.extraBody), 'utf8')
    : '';
  var extraScripts = entry.extraScripts
    ? entry.extraScripts
        .map(function (src) {
          return '<script src="' + escapeHtml(src) + '"></script>';
        })
        .join('\n    ')
    : '';

  return template
    .replace(/\{\{TITLE\}\}/g, escapeHtml(entry.title))
    .replace(/\{\{DESCRIPTION\}\}/g, escapeHtml(entry.description))
    .replace(/\{\{KICKER\}\}/g, escapeHtml(entry.kicker))
    .replace(/\{\{H1\}\}/g, escapeHtml(entry.h1))
    .replace(/\{\{STAGE_COUNT\}\}/g, String(entry.stageCount))
    .replace(/\{\{EXTRA_BODY\}\}/g, extraBody)
    .replace(/\{\{EXTRA_SCRIPTS\}\}/g, extraScripts);
}

function main() {
  const template = fs.readFileSync(TEMPLATE_PATH, 'utf8');
  const manifest = JSON.parse(fs.readFileSync(MANIFEST_PATH, 'utf8'));

  Object.keys(manifest).forEach(function (modulePath) {
    const html = renderPage(template, manifest[modulePath]);
    const outPath = path.join(ROOT, modulePath, 'index.html');
    fs.writeFileSync(outPath, html);
    console.log('Generated ' + path.relative(ROOT, outPath));
  });
}

main();
