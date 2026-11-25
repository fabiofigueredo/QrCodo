import test from 'node:test';
import assert from 'node:assert/strict';
import { HISTORY_STORAGE_KEY, loadHistory, sanitizeHistoryItem, saveHistory } from './history';
import { createDefaultContentState, createDefaultStyleState } from './qrPayload';
import {
  QrCapacityError,
  buildExportFileName,
  buildQrSvgString,
  generateQrMatrix,
  getEffectiveErrorCorrection,
  isFinderZone,
} from './qrRenderer';

test('square modules are emitted as one compact path with one subpath per dark module', () => {
  const style = createDefaultStyleState();
  const payload = 'https://exemplo.com.br';
  const { svg } = buildQrSvgString(payload, style);
  const { size, modules } = generateQrMatrix(payload, style.errorCorrection);

  let expected = 0;
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (modules[r][c] && !isFinderZone(r, c, size)) expected++;
    }
  }
  const d = /<path fill="[^"]+" d="([^"]*)"/.exec(svg)?.[1] ?? '';
  assert.equal(d.split('M').length - 1, expected);
  assert.equal((svg.match(/<path/g) ?? []).length, 1);
});

test('fixedSize=false omits width/height for responsive rendering', () => {
  const style = createDefaultStyleState();
  const fixed = buildQrSvgString('abc', style).svg;
  const fluid = buildQrSvgString('abc', style, { fixedSize: false }).svg;
  assert.ok(fixed.includes(`width="${style.exportSize}"`));
  assert.ok(!/<svg[^>]*\swidth=/.test(fluid));
});

test('user-provided values are escaped in the SVG markup', () => {
  const style = createDefaultStyleState();
  style.fgColor = '#000000"><script>';
  const { svg } = buildQrSvgString('abc', style, { ariaLabel: '<b>"x"</b>' });
  assert.ok(!svg.includes('<script>'));
  assert.ok(!svg.includes('<b>'));
});

test('oversized content throws a friendly QrCapacityError', () => {
  assert.throws(() => generateQrMatrix('x'.repeat(5000), 'H'), QrCapacityError);
});

test('logo forces error correction H only for L/M levels', () => {
  assert.equal(getEffectiveErrorCorrection({ errorCorrection: 'M', logoDataUrl: 'data:' }), 'H');
  assert.equal(getEffectiveErrorCorrection({ errorCorrection: 'Q', logoDataUrl: 'data:' }), 'Q');
  assert.equal(getEffectiveErrorCorrection({ errorCorrection: 'L', logoDataUrl: null }), 'L');
});

test('buildExportFileName produces safe slugs', () => {
  assert.equal(buildExportFileName('Wi-Fi: Café Ação', 'png', '1024px'), 'qrcode-wi-fi-cafe-acao-1024px.png');
  assert.equal(buildExportFileName('***', 'svg'), 'qrcode-qrcodo.svg');
});

test('history sanitizes corrupted entries and fills missing fields', () => {
  assert.equal(sanitizeHistoryItem(null), null);
  assert.equal(sanitizeHistoryItem({ id: '1', payload: 'x', type: 'unknown' }), null);

  const legacy = {
    id: '1',
    label: 'Antigo',
    type: 'url',
    payload: 'https://a.com/',
    content: { type: 'url', url: 'https://a.com' },
    style: { fgColor: '#000000' },
    createdAt: '2025-01-01T00:00:00.000Z',
  };
  const item = sanitizeHistoryItem(legacy);
  assert.ok(item);
  assert.equal(item.content.url, 'https://a.com');
  assert.deepEqual(item.content.wifi, createDefaultContentState().wifi);
  assert.equal(item.style.fgColor, '#000000');
  assert.equal(item.style.exportSize, createDefaultStyleState().exportSize);
});

test('loadHistory/saveHistory round-trip and report storage failures', () => {
  const store = new Map<string, string>();
  const storage = {
    getItem: (k: string) => store.get(k) ?? null,
    setItem: (k: string, v: string) => void store.set(k, v),
  };
  const item = sanitizeHistoryItem({
    id: '1',
    label: 'X',
    type: 'text',
    payload: 'oi',
    content: { text: 'oi' },
    style: {},
    createdAt: '2025-01-01T00:00:00.000Z',
  });
  assert.ok(item);
  assert.equal(saveHistory([item], storage), true);
  assert.equal(loadHistory(storage).length, 1);

  store.set(HISTORY_STORAGE_KEY, '{corrompido');
  assert.deepEqual(loadHistory(storage), []);

  const full = { setItem: () => { throw new Error('QuotaExceededError'); } };
  assert.equal(saveHistory([item], full), false);
});
