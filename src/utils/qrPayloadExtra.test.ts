import test from 'node:test';
import assert from 'node:assert/strict';
import {
  buildQrPayload,
  buildStaticPixPayload,
  computeCrc16Ccitt,
  createDefaultContentState,
  escapeVcardValue,
  evaluateScannability,
  isValidHexColor,
  normalizePixKey,
  normalizeUrl,
  parseBrlAmount,
} from './qrPayload';

test('parseBrlAmount accepts Brazilian and international formats', () => {
  assert.equal(parseBrlAmount('49,90'), 49.9);
  assert.equal(parseBrlAmount('1.234,56'), 1234.56);
  assert.equal(parseBrlAmount('R$ 1.234,56'), 1234.56);
  assert.equal(parseBrlAmount('1234.56'), 1234.56);
  assert.equal(parseBrlAmount('1.234'), 1234);
  assert.ok(Number.isNaN(parseBrlAmount('')));
  assert.ok(Number.isNaN(parseBrlAmount('abc')));
  assert.ok(Number.isNaN(parseBrlAmount('12,3,4')));
});

test('Pix payload uses thousands-separated amount correctly', () => {
  const payload = buildStaticPixPayload({
    key: 'pix@exemplo.com.br',
    merchantName: 'Loja',
    merchantCity: 'Recife',
    amount: '1.234,50',
    txid: '***',
    description: '',
  });
  assert.ok(payload.includes('54071234.50'));
  assert.equal(payload.slice(-4), computeCrc16Ccitt(payload.slice(0, -4)));
});

test('normalizePixKey strips CPF/CNPJ/phone formatting and keeps e-mail/EVP', () => {
  assert.equal(normalizePixKey('123.456.789-09'), '12345678909');
  assert.equal(normalizePixKey('12.345.678/0001-95'), '12345678000195');
  assert.equal(normalizePixKey('+55 (11) 98765-4321'), '+5511987654321');
  assert.equal(normalizePixKey(' Pix@Exemplo.com.BR '), 'pix@exemplo.com.br');
  assert.equal(
    normalizePixKey('123E4567-E89B-12D3-A456-426614174000'),
    '123e4567-e89b-12d3-a456-426614174000'
  );
});

test('Pix TxID keeps only alphanumerics and falls back to ***', () => {
  const base = {
    key: '12345678909',
    merchantName: 'Loja',
    merchantCity: 'Recife',
    amount: '',
    description: '',
  };
  assert.ok(buildStaticPixPayload({ ...base, txid: 'PEDIDO-104 A' }).includes('0510PEDIDO104A'));
  assert.ok(buildStaticPixPayload({ ...base, txid: '' }).includes('0503***'));
  assert.ok(buildStaticPixPayload({ ...base, txid: '---' }).includes('0503***'));
});

test('Pix rejects invalid amounts instead of silently ignoring them', () => {
  const state = createDefaultContentState();
  state.type = 'pix';
  state.pix = { ...state.pix, key: 'a@b.com', merchantName: 'Loja', amount: 'dez reais' };
  const res = buildQrPayload(state);
  assert.equal(res.valid, false);
  assert.match(res.error ?? '', /Valor inválido/);
});

test('normalizeUrl does not mistake host:port for a scheme', () => {
  assert.equal(normalizeUrl('exemplo.com:8080/x'), 'https://exemplo.com:8080/x');
  assert.equal(normalizeUrl('localhost:3000'), 'https://localhost:3000');
  assert.equal(normalizeUrl('http://exemplo.com'), 'http://exemplo.com');
  assert.equal(normalizeUrl('tel:+5511999999999'), 'tel:+5511999999999');
});

test('URL validation rejects hosts without a domain', () => {
  const state = createDefaultContentState();
  state.url = 'abc';
  assert.equal(buildQrPayload(state).valid, false);
  state.url = 'localhost:3000';
  assert.equal(buildQrPayload(state).valid, true);
});

test('mailto encodes spaces as %20, not +', () => {
  const state = createDefaultContentState();
  state.type = 'email';
  state.email = { to: 'a@b.com', subject: 'Olá mundo', body: 'Linha 1 & 2' };
  const res = buildQrPayload(state);
  assert.equal(res.payload, 'mailto:a@b.com?subject=Ol%C3%A1%20mundo&body=Linha%201%20%26%202');
});

test('Wi-Fi WPA requires at least 8 characters', () => {
  const state = createDefaultContentState();
  state.type = 'wifi';
  state.wifi = { ssid: 'Casa', password: '1234567', encryption: 'WPA', hidden: false };
  assert.equal(buildQrPayload(state).valid, false);
  state.wifi.password = '12345678';
  assert.equal(buildQrPayload(state).valid, true);
});

test('vCard escapes reserved characters', () => {
  assert.equal(escapeVcardValue('A; B, C\\D\nE'), 'A\\; B\\, C\\\\D\\nE');
  const state = createDefaultContentState();
  state.type = 'vcard';
  state.vcard = { ...state.vcard, firstName: 'Ana', organization: 'Silva, Souza & Cia' };
  const res = buildQrPayload(state);
  assert.equal(res.valid, true);
  assert.ok(res.payload.includes('ORG:Silva\\, Souza & Cia'));
});

test('evaluateScannability flags inverted colors and hex validation works', () => {
  assert.equal(evaluateScannability('#FFFFFF', '#141413').inverted, true);
  assert.equal(evaluateScannability('#141413', '#FFFFFF').inverted, false);
  assert.equal(isValidHexColor('#A1B2C3'), true);
  assert.equal(isValidHexColor('#A1B'), false);
  assert.equal(isValidHexColor('A1B2C3'), false);
});
