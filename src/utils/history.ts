import type { QrContentType, QrSavedItem } from '../types/qr';
import { createDefaultContentState, createDefaultStyleState } from './qrPayload';

/** Chave mantida para preservar históricos salvos por versões anteriores. */
export const HISTORY_STORAGE_KEY = 'traco-qr-history-v1';
export const HISTORY_LIMIT = 12;

const CONTENT_TYPES: QrContentType[] = ['url', 'text', 'wifi', 'pix', 'whatsapp', 'email', 'vcard'];

function isRecord(value: unknown): value is Record<string, unknown> {
  return typeof value === 'object' && value !== null && !Array.isArray(value);
}

/**
 * Valida um item vindo do armazenamento local e completa campos ausentes com
 * os valores padrão (útil quando novos campos são adicionados ao app).
 */
export function sanitizeHistoryItem(raw: unknown): QrSavedItem | null {
  if (!isRecord(raw)) return null;
  const { id, label, type, payload, content, style, createdAt } = raw;
  if (typeof id !== 'string' || typeof payload !== 'string' || !payload) return null;
  if (typeof type !== 'string' || !CONTENT_TYPES.includes(type as QrContentType)) return null;
  if (!isRecord(content) || !isRecord(style)) return null;

  const defaultsContent = createDefaultContentState();
  const mergedContent = { ...defaultsContent };
  for (const key of Object.keys(defaultsContent) as Array<keyof typeof defaultsContent>) {
    const value = content[key];
    const base: unknown = defaultsContent[key];
    if (isRecord(base) && isRecord(value)) {
      (mergedContent as Record<string, unknown>)[key] = { ...base, ...value };
    } else if (typeof value === typeof base) {
      (mergedContent as Record<string, unknown>)[key] = value;
    }
  }
  mergedContent.type = type as QrContentType;

  return {
    id,
    label: typeof label === 'string' && label ? label : 'QR Code',
    type: type as QrContentType,
    payload,
    content: mergedContent,
    style: { ...createDefaultStyleState(), ...style },
    createdAt: typeof createdAt === 'string' ? createdAt : new Date().toISOString(),
  };
}

export function loadHistory(storage: Pick<Storage, 'getItem'> = localStorage): QrSavedItem[] {
  try {
    const raw = storage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed
      .map(sanitizeHistoryItem)
      .filter((item): item is QrSavedItem => item !== null)
      .slice(0, HISTORY_LIMIT);
  } catch {
    return [];
  }
}

/** Salva o histórico. Retorna false quando o armazenamento está cheio/indisponível. */
export function saveHistory(
  items: QrSavedItem[],
  storage: Pick<Storage, 'setItem'> = localStorage
): boolean {
  try {
    storage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(items));
    return true;
  } catch {
    return false;
  }
}
