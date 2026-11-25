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
    margin: 3,
    exportSize: 1024,
    logoDataUrl: null,
    logoScale: 0.22,
  };
}

export function normalizeAscii(value: string, maxLength: number): string {
  return value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^\x20-\x7E]/g, '')
    .trim()
    .slice(0, maxLength);
}

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

export function buildStaticPixPayload(pix: QrPixData): string {
  const cleanKey = pix.key.trim();
  const merchantName = normalizeAscii(pix.merchantName || 'RECEBEDOR', 25) || 'RECEBEDOR';
  const merchantCity = normalizeAscii(pix.merchantCity || 'SAO PAULO', 15) || 'SAO PAULO';
  const txid = normalizeAscii(pix.txid || '***', 25).replace(/\s+/g, '') || '***';
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

  const parsedAmount = parseFloat(pix.amount.replace(',', '.'));
  if (!Number.isNaN(parsedAmount) && parsedAmount > 0) {
    payload += formatTlv('54', parsedAmount.toFixed(2));
  }

  payload += formatTlv('58', 'BR');
  payload += formatTlv('59', merchantName);
  payload += formatTlv('60', merchantCity);
  payload += formatTlv('62', formatTlv('05', txid));
  payload += '6304';

  return payload + computeCrc16Ccitt(payload);
}

export function escapeWifiField(value: string): string {
  return value.replace(/([\\;,:""])/g, '\\$1');
}

export function normalizeUrl(raw: string): string {
  const trimmed = raw.trim();
  if (!trimmed) return '';
  if (/^[a-zA-Z][a-zA-Z0-9+.-]*:/.test(trimmed)) {
    return trimmed;
  }
  return `https://${trimmed}`;
}

export function buildQrPayload(state: QrContentState): QrPayloadResult {
  switch (state.type) {
    case 'url': {
      const normalized = normalizeUrl(state.url);
      if (!normalized) {
        return {
          valid: false,
          payload: '',
          error: 'Informe uma URL ou endereço web para gerar o QR Code.',
          summaryLabel: 'URL vazia',
        };
      }
      try {
        const parsed = new URL(normalized);
        return {
          valid: true,
          payload: parsed.toString(),
          summaryLabel: parsed.hostname || normalized,
        };
      } catch {
        return {
          valid: false,
          payload: '',
          error: 'URL inválida. Verifique o endereço informado (ex: https://seusite.com.br).',
          summaryLabel: 'URL inválida',
        };
      }
    }

    case 'text': {
      const text = state.text.trim();
      if (!text) {
        return {
          valid: false,
          payload: '',
          error: 'Digite algum texto para gerar o QR Code.',
          summaryLabel: 'Texto vazio',
        };
      }
      return {
        valid: true,
        payload: state.text,
        summaryLabel: text.length > 32 ? `${text.slice(0, 32)}…` : text,
      };
    }

    case 'wifi': {
      const ssid = state.wifi.ssid.trim();
      if (!ssid) {
        return {
          valid: false,
          payload: '',
          error: 'Informe o nome da rede Wi-Fi (SSID).',
          summaryLabel: 'Wi-Fi sem nome',
        };
      }
      if (state.wifi.encryption !== 'nopass' && !state.wifi.password) {
        return {
          valid: false,
          payload: '',
          error: 'Informe a senha da rede ou selecione segurança "Aberta".',
          summaryLabel: `Wi-Fi: ${ssid}`,
        };
      }
      const enc = state.wifi.encryption;
      const escapedSsid = escapeWifiField(ssid);
      const escapedPass = enc === 'nopass' ? '' : escapeWifiField(state.wifi.password);
      const hiddenPart = state.wifi.hidden ? 'H:true;' : '';
      const passPart = enc === 'nopass' ? '' : `P:${escapedPass};`;
      const payload = `WIFI:T:${enc};S:${escapedSsid};${passPart}${hiddenPart};`;
      return {
        valid: true,
        payload,
        summaryLabel: `Wi-Fi: ${ssid}`,
      };
    }

    case 'pix': {
      const key = state.pix.key.trim();
      if (!key) {
        return {
          valid: false,
          payload: '',
          error: 'Informe a chave Pix (CPF, CNPJ, e-mail, telefone ou chave aleatória).',
          summaryLabel: 'Pix sem chave',
        };
      }
      const merchantName = state.pix.merchantName.trim();
      if (!merchantName) {
        return {
          valid: false,
          payload: '',
          error: 'Informe o nome do recebedor para o código Pix.',
          summaryLabel: `Pix: ${key}`,
        };
      }
      const payload = buildStaticPixPayload(state.pix);
      const parsedAmount = parseFloat(state.pix.amount.replace(',', '.'));
      const amountTag =
        !Number.isNaN(parsedAmount) && parsedAmount > 0
          ? ` · R$ ${parsedAmount.toFixed(2).replace('.', ',')}`
          : '';
      return {
        valid: true,
        payload,
        summaryLabel: `Pix: ${merchantName}${amountTag}`,
      };
    }

    case 'whatsapp': {
      const digits = state.whatsapp.phone.replace(/\D/g, '');
      if (digits.length < 8) {
        return {
          valid: false,
          payload: '',
          error: 'Informe um número de telefone válido com DDD (ex: 5511999999999).',
          summaryLabel: 'WhatsApp incompleto',
        };
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
        return {
          valid: false,
          payload: '',
          error: 'Informe um endereço de e-mail válido.',
          summaryLabel: 'E-mail inválido',
        };
      }
      const params = new URLSearchParams();
      if (state.email.subject.trim()) {
        params.set('subject', state.email.subject.trim());
      }
      if (state.email.body.trim()) {
        params.set('body', state.email.body.trim());
      }
      const qs = params.toString();
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
        return {
          valid: false,
          payload: '',
          error: 'Informe ao menos o nome ou sobrenome do contato.',
          summaryLabel: 'Contato sem nome',
        };
      }
      const fullName = [first, last].filter(Boolean).join(' ');
      const lines = [
        'BEGIN:VCARD',
        'VERSION:3.0',
        `N:${last};${first};;;`,
        `FN:${fullName}`,
      ];
      if (state.vcard.organization.trim()) {
        lines.push(`ORG:${state.vcard.organization.trim()}`);
      }
      if (state.vcard.role.trim()) {
        lines.push(`TITLE:${state.vcard.role.trim()}`);
      }
      if (state.vcard.phone.trim()) {
        lines.push(`TEL;TYPE=CELL:${state.vcard.phone.trim()}`);
      }
      if (state.vcard.email.trim()) {
        lines.push(`EMAIL:${state.vcard.email.trim()}`);
      }
      if (state.vcard.website.trim()) {
        lines.push(`URL:${normalizeUrl(state.vcard.website)}`);
      }
      lines.push('END:VCARD');
      return {
        valid: true,
        payload: lines.join('\n'),
        summaryLabel: `Contato: ${fullName}`,
      };
    }
  }
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
}

export function evaluateScannability(fgHex: string, bgHex: string): ScannabilityReport {
  const ratio = getContrastRatio(fgHex, bgHex);
  if (ratio >= 4.5) {
    return {
      ratio,
      status: 'excellent',
      label: 'Leitura excelente',
    };
  }
  if (ratio >= 3.0) {
    return {
      ratio,
      status: 'acceptable',
      label: 'Leitura aceitável',
    };
  }
  return {
    ratio,
    status: 'low',
    label: 'Contraste baixo — difícil de escanear',
  };
}
