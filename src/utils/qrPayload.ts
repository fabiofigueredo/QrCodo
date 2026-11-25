import type {
  QrContentState,
  QrPayloadResult,
  QrPixData,
  QrStyleState,
} from '../types/qr';

export function createDefaultContentState(): QrContentState {
  return {
    type: 'url',
    url: 'https://exemplo.com.br',
    text: '',
    wifi: {
      ssid: '',
      password: '',
      encryption: 'WPA',
      hidden: false,
    },
    pix: {
      key: '',
      merchantName: '',
      merchantCity: 'Sao Paulo',
      amount: '',
      txid: '***',
      description: '',
    },
    whatsapp: {
      phone: '',
      message: '',
    },
    email: {
      to: '',
      subject: '',
      body: '',
    },
    vcard: {
      firstName: '',
      lastName: '',
      phone: '',
      email: '',
      organization: '',
      role: '',
      website: '',
    },
  };
}

export function createDefaultStyleState(): QrStyleState {
  return {
    fgColor: '#141413',
    bgColor: '#FFFFFF',
    moduleShape: 'square',
    eyeStyle: 'square',
    errorCorrection: 'M',
    // A especificação ISO/IEC 18004 recomenda zona de respiro de 4 módulos.
    margin: 4,
    exportSize: 1024,
    logoDataUrl: null,
    logoScale: 0.22,
  };
}

/* -------------------------------------------------------------------------- */
/* Utilidades de texto                                                         */
/* -------------------------------------------------------------------------- */

export function normalizeAscii(value: string, maxLength: number): string {
  return value
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .replace(/[^\x20-\x7E]/g, '')
    .trim()
    .slice(0, maxLength);
}

export function escapeWifiField(value: string): string {
  return value.replace(/([\\;,:"])/g, '\\$1');
}

/** Escapa caracteres reservados em valores de vCard 3.0 (RFC 2426). */
export function escapeVcardValue(value: string): string {
  return value
    .replace(/\\/g, '\\\\')
    .replace(/\r?\n/g, '\\n')
    .replace(/([;,])/g, '\\$1');
}

export function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  // Mantém esquemas explícitos (https:, ftp:, tel:...), sem confundir
  // "exemplo.com:8080" ou "localhost:3000" com um esquema.
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:(?!\d)/.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

function truncateLabel(value: string, max = 32): string {
  return value.length > max ? `${value.slice(0, max)}…` : value;
}

/* -------------------------------------------------------------------------- */
/* Pix (BR Code estático — padrão EMV® QRCPS do Banco Central)                 */
/* -------------------------------------------------------------------------- */

function formatTlv(id: string, value: string): string {
  const length = value.length.toString().padStart(2, '0');
  return `${id}${length}${value}`;
}

export function computeCrc16Ccitt(payloadWithoutCrcValue: string): string {
  let crc = 0xffff;
  for (let i = 0; i < payloadWithoutCrcValue.length; i++) {
    crc ^= payloadWithoutCrcValue.charCodeAt(i) << 8;
    for (let bit = 0; bit < 8; bit++) {
      if ((crc & 0x8000) !== 0) {
        crc = ((crc << 1) ^ 0x1021) & 0xffff;
      } else {
        crc = (crc << 1) & 0xffff;
      }
    }
  }
  return crc.toString(16).toUpperCase().padStart(4, '0');
}

/**
 * Converte valores no padrão brasileiro ("1.234,56") ou internacional
 * ("1234.56") em número. Retorna NaN quando o texto não é um valor válido.
 */
export function parseBrlAmount(raw: string): number {
  const cleaned = raw.trim().replace(/[R$\s]/g, '');
  if (!cleaned) return NaN;
  let normalized = cleaned;
  if (cleaned.includes(',')) {
    // Vírgula é o separador decimal; pontos são separadores de milhar.
    normalized = cleaned.replace(/\./g, '').replace(',', '.');
  } else if (/^\d{1,3}(\.\d{3})+$/.test(cleaned)) {
    // "1.234" ou "1.234.567" sem vírgula: pontos de milhar.
    normalized = cleaned.replace(/\./g, '');
  }
  if (!/^\d+(\.\d+)?$/.test(normalized)) return NaN;
  return Number(normalized);
}

/**
 * Normaliza a chave Pix: remove a pontuação de CPF/CNPJ e telefones, deixa
 * e-mails e chaves aleatórias (EVP) em minúsculas.
 */
export function normalizePixKey(raw: string): string {
  const key = raw.trim();
  if (!key) return '';
  if (key.includes('@')) return key.toLowerCase();
  if (/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(key)) {
    return key.toLowerCase();
  }
  if (key.startsWith('+')) return `+${key.replace(/\D/g, '')}`;
  if (/^[\d.\-/\s()]+$/.test(key)) return key.replace(/\D/g, '');
  return key;
}

export function buildStaticPixPayload(pix: QrPixData): string {
  const cleanKey = normalizePixKey(pix.key);
  const merchantName = normalizeAscii(pix.merchantName || 'RECEBEDOR', 25) || 'RECEBEDOR';
  const merchantCity = normalizeAscii(pix.merchantCity || 'SAO PAULO', 15) || 'SAO PAULO';
  const rawTxid = normalizeAscii(pix.txid || '', 25);
  // O TxID aceita apenas caracteres alfanuméricos; "***" indica ausência de identificador.
  const txid = rawTxid === '***' ? '***' : rawTxid.replace(/[^A-Za-z0-9]/g, '') || '***';
  const desc = normalizeAscii(pix.description || '', 40);

  let merchantAccountInfo = formatTlv('00', 'br.gov.bcb.pix') + formatTlv('01', cleanKey);
  if (desc) {
    const maxDescLen = Math.max(0, 99 - merchantAccountInfo.length - 4);
    if (maxDescLen > 0) {
      merchantAccountInfo += formatTlv('02', desc.slice(0, maxDescLen));
    }
  }

  let payload = '';
  payload += formatTlv('00', '01');
  payload += formatTlv('26', merchantAccountInfo);
  payload += formatTlv('52', '0000');
  payload += formatTlv('53', '986');

  const parsedAmount = parseBrlAmount(pix.amount);
  if (Number.isFinite(parsedAmount) && parsedAmount > 0) {
    payload += formatTlv('54', parsedAmount.toFixed(2));
  }

  payload += formatTlv('58', 'BR');
  payload += formatTlv('59', merchantName);
  payload += formatTlv('60', merchantCity);
  payload += formatTlv('62', formatTlv('05', txid));
  payload += '6304';

  return payload + computeCrc16Ccitt(payload);
}

/* -------------------------------------------------------------------------- */
/* Montagem do conteúdo (payload) por tipo                                     */
/* -------------------------------------------------------------------------- */

function invalid(error: string, summaryLabel: string): QrPayloadResult {
  return { valid: false, payload: '', error, summaryLabel };
}

export function buildQrPayload(state: QrContentState): QrPayloadResult {
  switch (state.type) {
    case 'url': {
      const normalized = normalizeUrl(state.url);
      if (!normalized) {
        return invalid('Informe uma URL ou endereço web para gerar o QR Code.', 'URL vazia');
      }
      try {
        const parsed = new URL(normalized);
        const isWeb = parsed.protocol === 'http:' || parsed.protocol === 'https:';
        if (isWeb && !parsed.hostname.includes('.') && parsed.hostname !== 'localhost') {
          throw new Error('Domínio incompleto');
        }
        return {
          valid: true,
          payload: parsed.toString(),
          summaryLabel: parsed.hostname || truncateLabel(normalized),
        };
      } catch {
        return invalid(
          'URL inválida. Verifique o endereço informado (ex: https://seusite.com.br).',
          'URL inválida'
        );
      }
    }

    case 'text': {
      const text = state.text.trim();
      if (!text) {
        return invalid('Digite algum texto para gerar o QR Code.', 'Texto vazio');
      }
      return {
        valid: true,
        payload: state.text,
        summaryLabel: truncateLabel(text),
      };
    }

    case 'wifi': {
      const ssid = state.wifi.ssid;
      if (!ssid.trim()) {
        return invalid('Informe o nome da rede Wi-Fi (SSID).', 'Wi-Fi sem nome');
      }
      const enc = state.wifi.encryption;
      if (enc !== 'nopass' && !state.wifi.password) {
        return invalid(
          'Informe a senha da rede ou selecione segurança "Aberta".',
          `Wi-Fi: ${ssid}`
        );
      }
      if (enc === 'WPA' && state.wifi.password.length < 8) {
        return invalid('Senhas WPA/WPA2/WPA3 têm no mínimo 8 caracteres.', `Wi-Fi: ${ssid}`);
      }
      const passPart = enc === 'nopass' ? '' : `P:${escapeWifiField(state.wifi.password)};`;
      const hiddenPart = state.wifi.hidden ? 'H:true;' : '';
      return {
        valid: true,
        payload: `WIFI:T:${enc};S:${escapeWifiField(ssid)};${passPart}${hiddenPart};`,
        summaryLabel: `Wi-Fi: ${ssid.trim()}`,
      };
    }

    case 'pix': {
      const key = state.pix.key.trim();
      if (!key) {
        return invalid(
          'Informe a chave Pix (CPF, CNPJ, e-mail, telefone ou chave aleatória).',
          'Pix sem chave'
        );
      }
      const merchantName = state.pix.merchantName.trim();
      if (!merchantName) {
        return invalid('Informe o nome do recebedor para o código Pix.', `Pix: ${key}`);
      }
      const amountRaw = state.pix.amount.trim();
      const parsedAmount = parseBrlAmount(amountRaw);
      const hasAmount = Number.isFinite(parsedAmount) && parsedAmount > 0;
      if (amountRaw && !hasAmount) {
        return invalid(
          'Valor inválido. Use o formato 49,90 ou deixe em branco para valor livre.',
          `Pix: ${merchantName}`
        );
      }
      const amountTag = hasAmount ? ` · R$ ${parsedAmount.toFixed(2).replace('.', ',')}` : '';
      return {
        valid: true,
        payload: buildStaticPixPayload(state.pix),
        summaryLabel: `Pix: ${merchantName}${amountTag}`,
      };
    }

    case 'whatsapp': {
      const digits = state.whatsapp.phone.replace(/\D/g, '');
      if (digits.length < 10 || digits.length > 15) {
        return invalid(
          'Informe o número com código do país e DDD (ex: 5511999999999).',
          'WhatsApp incompleto'
        );
      }
      const msg = state.whatsapp.message.trim();
      const query = msg ? `?text=${encodeURIComponent(msg)}` : '';
      return {
        valid: true,
        payload: `https://wa.me/${digits}${query}`,
        summaryLabel: `WhatsApp: +${digits}`,
      };
    }

    case 'email': {
      const to = state.email.to.trim();
      if (!to || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(to)) {
        return invalid('Informe um endereço de e-mail válido.', 'E-mail inválido');
      }
      // encodeURIComponent (e não URLSearchParams) para que espaços virem %20:
      // vários clientes de e-mail exibem "+" literalmente em links mailto.
      const params: string[] = [];
      if (state.email.subject.trim()) {
        params.push(`subject=${encodeURIComponent(state.email.subject.trim())}`);
      }
      if (state.email.body.trim()) {
        params.push(`body=${encodeURIComponent(state.email.body.trim())}`);
      }
      const qs = params.join('&');
      return {
        valid: true,
        payload: `mailto:${to}${qs ? `?${qs}` : ''}`,
        summaryLabel: `E-mail: ${to}`,
      };
    }

    case 'vcard': {
      const first = state.vcard.firstName.trim();
      const last = state.vcard.lastName.trim();
      if (!first && !last) {
        return invalid('Informe ao menos o nome ou sobrenome do contato.', 'Contato sem nome');
      }
      const email = state.vcard.email.trim();
      if (email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
        return invalid('O e-mail do contato parece inválido.', `Contato: ${first} ${last}`.trim());
      }
      const fullName = [first, last].filter(Boolean).join(' ');
      const esc = escapeVcardValue;
      const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${esc(last)};${esc(first)};;;`,
        `FN:${esc(fullName)}`,
      ];
      const org = state.vcard.organization.trim();
      const role = state.vcard.role.trim();
      const phone = state.vcard.phone.trim();
      const website = state.vcard.website.trim();
      if (org) lines.push(`ORG:${esc(org)}`);
      if (role) lines.push(`TITLE:${esc(role)}`);
      if (phone) lines.push(`TEL;TYPE=CELL:${phone}`);
      if (email) lines.push(`EMAIL;TYPE=INTERNET:${email}`);
      if (website) lines.push(`URL:${normalizeUrl(website)}`);
      lines.push('END:VCARD');
      return {
        valid: true,
        payload: lines.join('\n'),
        summaryLabel: `Contato: ${fullName}`,
      };
    }
  }
}

/* -------------------------------------------------------------------------- */
/* Cores e legibilidade                                                        */
/* -------------------------------------------------------------------------- */

export function isValidHexColor(value: string): boolean {
  return /^#[0-9a-fA-F]{6}$/.test(value.trim());
}

function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const clean = hex.trim().replace('#', '');
  if (!/^[0-9a-fA-F]{6}$/.test(clean)) return null;
  return {
    r: parseInt(clean.slice(0, 2), 16),
    g: parseInt(clean.slice(2, 4), 16),
    b: parseInt(clean.slice(4, 6), 16),
  };
}

function relativeLuminance(r: number, g: number, b: number): number {
  const channel = (c: number) => {
    const s = c / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };
  return 0.2126 * channel(r) + 0.7152 * channel(g) + 0.0722 * channel(b);
}

export function getContrastRatio(fgHex: string, bgHex: string): number {
  const fg = hexToRgb(fgHex);
  const bg = hexToRgb(bgHex);
  if (!fg || !bg) return 1;
  const l1 = relativeLuminance(fg.r, fg.g, fg.b);
  const l2 = relativeLuminance(bg.r, bg.g, bg.b);
  const lighter = Math.max(l1, l2);
  const darker = Math.min(l1, l2);
  return (lighter + 0.05) / (darker + 0.05);
}

export interface ScannabilityReport {
  ratio: number;
  status: 'excellent' | 'acceptable' | 'low';
  label: string;
  /** Módulos mais claros que o fundo: alguns leitores mais antigos não reconhecem. */
  inverted: boolean;
}

export function evaluateScannability(fgHex: string, bgHex: string): ScannabilityReport {
  const ratio = getContrastRatio(fgHex, bgHex);
  const fg = hexToRgb(fgHex);
  const bg = hexToRgb(bgHex);
  const inverted =
    !!fg && !!bg && relativeLuminance(fg.r, fg.g, fg.b) > relativeLuminance(bg.r, bg.g, bg.b);

  if (ratio >= 4.5) {
    return { ratio, status: 'excellent', label: 'Leitura excelente', inverted };
  }
  if (ratio >= 3.0) {
    return { ratio, status: 'acceptable', label: 'Leitura aceitável', inverted };
  }
  return { ratio, status: 'low', label: 'Contraste baixo — difícil de escanear', inverted };
}
