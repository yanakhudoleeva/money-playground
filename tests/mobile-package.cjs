const fs = require('node:fs');
const path = require('node:path');
const assert = require('node:assert/strict');
const vm = require('node:vm');
const { execFileSync } = require('node:child_process');
const root = path.resolve(__dirname, '..');
const sourcePath = path.join(root, 'piggy-onboarding.html');
const distPath = path.join(root, 'dist/index.html');
const source = fs.readFileSync(sourcePath, 'utf8');
const dist = fs.readFileSync(distPath, 'utf8');
execFileSync(process.execPath, [path.join(root, 'scripts/build-mobile.cjs')]);
const mobile = fs.readFileSync(path.join(root, '.capacitor-web/index.html'), 'utf8');
assert.equal(fs.readFileSync(sourcePath, 'utf8'), source);
assert.equal(fs.readFileSync(distPath, 'utf8'), dist);
const scripts = html => [...html.matchAll(/<script\b[^>]*>([\s\S]*?)<\/script>/g)].map(m => m[1]);
assert.deepEqual(scripts(mobile), scripts(source), 'Packaging must preserve every application script verbatim');
for (const script of scripts(mobile)) new vm.Script(script);
assert.equal((mobile.match(/<head>/g) || []).length, 1);
assert.equal((mobile.match(/<body>/g) || []).length, 1);
assert.ok(!mobile.includes('href="https://fonts.googleapis.com'));
const css = fs.readFileSync(path.join(root, '.capacitor-web/fonts/fonts.css'), 'utf8');
assert.ok(!/url\(https?:/.test(css));
for (const [, file] of css.matchAll(/url\(([^)]+)\)/g)) {
  assert.ok(fs.statSync(path.join(root, '.capacitor-web/fonts', file)).size > 0);
}
const config = require('../capacitor.config.json');
assert.ok(!config.server?.url, 'The iOS app must load bundled files, not a remote website');
assert.equal(config.webDir, '.capacitor-web');
console.log('PASS mobile packaging: application scripts identical, valid JS, bundled fonts, web files unchanged, local launch.');
