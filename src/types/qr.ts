export type QrContentType =
  | 'url'
  | 'text'
  | 'wifi'
  | 'pix'
  | 'whatsapp'
  | 'email'
  | 'vcard';

export type QrModuleShape = 'square' | 'rounded' | 'dots' | 'diamond';

export type QrEyeStyle = 'square' | 'rounded' | 'circle';

export type QrErrorCorrection = 'L' | 'M' | 'Q' | 'H';

export type QrExportSize = 512 | 1024 | 2048;

export interface QrWifiData {
  ssid: string;
  password: string;
  encryption: 'WPA' | 'WEP' | 'nopass';
  hidden: boolean;
}

export interface QrPixData {
  key: string;
  merchantName: string;
  merchantCity: string;
  amount: string;
  txid: string;
  description: string;
}

export interface QrWhatsappData {
  phone: string;
  message: string;
}

export interface QrEmailData {
  to: string;
  subject: string;
  body: string;
}

export interface QrVcardData {
  firstName: string;
  lastName: string;
  phone: string;
  email: string;
  organization: string;
  role: string;
  website: string;
}

export interface QrContentState {
  type: QrContentType;
  url: string;
  text: string;
  wifi: QrWifiData;
  pix: QrPixData;
  whatsapp: QrWhatsappData;
  email: QrEmailData;
  vcard: QrVcardData;
}

export interface QrStyleState {
  fgColor: string;
  bgColor: string;
  moduleShape: QrModuleShape;
  eyeStyle: QrEyeStyle;
  errorCorrection: QrErrorCorrection;
  margin: number;
  exportSize: QrExportSize;
  logoDataUrl: string | null;
  logoScale: number;
}

export interface QrSavedItem {
  id: string;
  label: string;
  type: QrContentType;
  payload: string;
  content: QrContentState;
  style: QrStyleState;
  createdAt: string;
}

export interface QrPayloadResult {
  valid: boolean;
  payload: string;
  error?: string;
  summaryLabel: string;
}
