const assert = require('node:assert/strict');
const test = require('node:test');
const C = require('../Extension/colors');

test('parses opaque and translucent computed colors', () => {
  assert.deepEqual(C.parse('rgb(12, 34, 56)'), {r: 12, g: 34, b: 56, a: 1});
  assert.deepEqual(C.parse('rgba(12, 34, 56, 0.5)'), {r: 12, g: 34, b: 56, a: .5});
  assert.equal(C.parse('transparent'), null);
});

test('maps common light surfaces to distinct dark surfaces', () => {
  const white = C.darkBackground(C.parse('rgb(255, 255, 255)'));
  const card = C.darkBackground(C.parse('rgb(235, 235, 235)'));
  assert.ok(C.luminance(white) < .04);
  assert.ok(C.luminance(card) < .05);
  assert.ok(C.luminance(card) > C.luminance(white));
});

test('normal text and colored links meet WCAG AA contrast', () => {
  const backgrounds = ['rgb(255, 255, 255)', 'rgb(239, 242, 248)', 'rgb(255, 232, 120)'];
  const foregrounds = ['rgb(0, 0, 0)', 'rgb(45, 54, 66)', 'rgb(15, 87, 178)', 'rgb(190, 30, 50)'];
  for (const bg of backgrounds) for (const fg of foregrounds) {
    const dark = C.darkBackground(C.parse(bg));
    const readable = C.readableForeground(C.parse(fg), dark);
    assert.ok(C.contrast(readable, dark) >= 4.5, `${fg} on ${bg}`);
  }
});
