import test from 'node:test';
import assert from 'node:assert/strict';
import { createDefaultStyleState } from './qrPayload';
import {
  buildQrSvgString,
  generateQrMatrix,
  isFinderZone,
  isLogoClearedZone,
} from './qrRenderer';

test('generateQrMatrix produces square boolean matrix with valid finder patterns', () => {
  const matrix = generateQrMatrix('https://exemplo.com.br', 'M');
  assert.ok(matrix.size >= 21);
  assert.equal(matrix.modules.length, matrix.size);
  assert.equal(matrix.modules[0].length, matrix.size);
  // Top-left finder corner must be filled
  assert.equal(matrix.modules[0][0], true);
  assert.equal(matrix.modules[3][3], true);
  assert.equal(matrix.modules[1][1], false);
});

test('isFinderZone identifies all three 7x7 finder corners', () => {
  const size = 25;
  assert.equal(isFinderZone(0, 0, size), true);
  assert.equal(isFinderZone(6, 6, size), true);
  assert.equal(isFinderZone(0, 18, size), true);
  assert.equal(isFinderZone(18, 0, size), true);
  assert.equal(isFinderZone(12, 12, size), false);
});

test('buildQrSvgString renders requested module shapes, eye styles, and optional logo', () => {
  const style = createDefaultStyleState();
  style.moduleShape = 'dots';
  style.eyeStyle = 'circle';
  style.fgColor = '#2563EB';
  style.bgColor = '#FFFFFF';
  style.exportSize = 512;

  const { svg, moduleCount } = buildQrSvgString('https://exemplo.com.br', style);
  assert.ok(moduleCount >= 21);
  assert.ok(svg.startsWith('<svg '));
  assert.ok(svg.includes('width="512"'));
  assert.ok(svg.includes('<circle'));
  assert.ok(svg.includes('#2563EB'));

  style.logoDataUrl = 'data:image/png;base64,iVBORw0KGgo=';
  const withLogo = buildQrSvgString('https://exemplo.com.br', style);
  assert.ok(withLogo.svg.includes('<image href="data:image/png;base64,iVBORw0KGgo="'));
});

test('isLogoClearedZone clears center modules only when logo is active', () => {
  assert.equal(isLogoClearedZone(12, 12, 25, 0.22, false), false);
  assert.equal(isLogoClearedZone(12, 12, 25, 0.22, true), true);
  assert.equal(isLogoClearedZone(0, 0, 25, 0.22, true), false);
});
