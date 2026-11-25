import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildQrPayload,
  buildStaticPixPayload,
  computeCrc16Ccitt,
  createDefaultContentState,
  evaluateScannability,
  getContrastRatio,
} from './qrPayload';

test('URL payload normalizes missing scheme and validates empty input', () => {
  const state = createDefaultContentState();
  state.url = 'google.com';
  const res = buildQrPayload(state);
  assert.equal(res.valid, true);
  assert.equal(res.payload, 'https://google.com/');

  state.url = '   ';
  const emptyRes = buildQrPayload(state);
  assert.equal(emptyRes.valid, false);
  assert.ok(emptyRes.error);
});

test('Wi-Fi payload escapes special characters and handles open networks', () => {
  const state = createDefaultContentState();
  state.type = 'wifi';
  state.wifi = {
    ssid: 'Casa;Net',
    password: 'pass:123',
    encryption: 'WPA',
    hidden: true,
  };
  const res = buildQrPayload(state);
  assert.equal(res.valid, true);
  assert.equal(res.payload, 'WIFI:T:WPA;S:Casa\\;Net;P:pass\\:123;H:true;;');

  state.wifi = {
    ssid: 'Guest',
    password: '',
    encryption: 'nopass',
    hidden: false,
  };
  const openRes = buildQrPayload(state);
  assert.equal(openRes.valid, true);
  assert.equal(openRes.payload, 'WIFI:T:nopass;S:Guest;;');
});

test('Pix static BRCode generates valid EMV TLV payload with CRC16-CCITT', () => {
  const crc = computeCrc16Ccitt('123456789');
  assert.equal(crc, '29B1');

  const payload = buildStaticPixPayload({
    key: 'pix@exemplo.com.br',
    merchantName: 'João Café',
    merchantCity: 'São Paulo',
    amount: '25,50',
    txid: 'PEDIDO01',
    description: 'Cafe especial',
  });

  assert.ok(payload.startsWith('000201'));
  assert.ok(payload.includes('br.gov.bcb.pix'));
  assert.ok(payload.includes('540525.50'));
  assert.ok(payload.includes('5909Joao Cafe'));
  assert.ok(payload.includes('6009Sao Paulo'));
  assert.match(payload, /6304[0-9A-F]{4}$/);

  const bodyWithoutCrc = payload.slice(0, -4);
  const actualCrc = payload.slice(-4);
  assert.equal(actualCrc, computeCrc16Ccitt(bodyWithoutCrc));
});

test('WhatsApp and Email payloads encode fields cleanly', () => {
  const state = createDefaultContentState();
  state.type = 'whatsapp';
  state.whatsapp = { phone: '+55 (11) 98765-4321', message: 'Olá!' };
  const wa = buildQrPayload(state);
  assert.equal(wa.valid, true);
  assert.equal(wa.payload, 'https://wa.me/5511987654321?text=Ol%C3%A1!');

  state.type = 'email';
  state.email = { to: 'contato@empresa.com', subject: 'Orcamento', body: 'Ola' };
  const email = buildQrPayload(state);
  assert.equal(email.valid, true);
  assert.equal(email.payload, 'mailto:contato@empresa.com?subject=Orcamento&body=Ola');
});

test('Scannability contrast calculation flags low contrast properly', () => {
  const high = getContrastRatio('#000000', '#FFFFFF');
  assert.ok(high > 20);
  assert.equal(evaluateScannability('#000000', '#FFFFFF').status, 'excellent');

  const low = evaluateScannability('#CCCCCC', '#FFFFFF');
  assert.equal(low.status, 'low');
});
