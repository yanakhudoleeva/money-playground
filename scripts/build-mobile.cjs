const fs = require('node:fs');
const path = require('node:path');
const crypto = require('node:crypto');
const root = path.resolve(__dirname, '..');
const output = path.join(root, '.capacitor-web');
const source = fs.readFileSync(path.join(root, 'piggy-onboarding.html'), 'utf8');
// The Pages workflow publishes this same canonical fragment. Never rewrite dist.
// Explicit head/body are necessary for Capacitor to inject its native bridge.
const fontLink = /<link rel="stylesheet" href="https:\/\/fonts\.googleapis\.com\/[^"\n]+">/;
if (!fontLink.test(source)) throw new Error('Expected Google Fonts link was not found; review the mobile packaging step.');
const meta = source.match(/<meta\b[^>]*>/g) || [];
let body = source.replace(fontLink, '').replace(/<meta\b[^>]*>/g, '');
if (/<\/?(?:html|head|body)\b/i.test(body)) throw new Error('Canonical HTML is no longer a fragment; review packaging.');
if (!fs.existsSync(path.join(root, 'mobile/fonts/fonts.css'))) throw new Error('Bundled fonts are missing.');
fs.rmSync(output, { recursive: true, force: true });
fs.mkdirSync(output, { recursive: true });
fs.cpSync(path.join(root, 'dist/assets'), path.join(output, 'assets'), { recursive: true });
fs.cpSync(path.join(root, 'mobile/fonts'), path.join(output, 'fonts'), { recursive: true });
fs.copyFileSync(path.join(root, 'mobile/native-layout.css'), path.join(output, 'native-layout.css'));
for (const file of ['jszip-LICENSE.txt', 'pdf-lib-LICENSE.txt']) {
  fs.copyFileSync(path.join(root, 'dist', file), path.join(output, file));
}
fs.writeFileSync(path.join(output, 'index.html'), `<!doctype html>\n<html lang="en">\n<head>\n${meta.join('\n')}\n<title>Money Playground</title>\n<link rel="stylesheet" href="fonts/fonts.css">\n</head>\n<body>\n${body}\n<link rel="stylesheet" href="native-layout.css">\n</body>\n</html>\n`);
fs.writeFileSync(path.join(output, 'build-info.json'), JSON.stringify({
  source: 'piggy-onboarding.html',
  sha256: crypto.createHash('sha256').update(source).digest('hex'),
  capacitor: require('../package.json').dependencies['@capacitor/core']
}, null, 2) + '\n');
console.log('Mobile web package generated from canonical HTML; web sources and dist unchanged.');
