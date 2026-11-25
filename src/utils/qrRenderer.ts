import QRCode from 'qrcode';
import type { QrErrorCorrection, QrEyeStyle, QrModuleShape, QrStyleState } from '../types/qr';

export interface QrMatrix {
  size: number;
  modules: boolean[][];
}

/** Erro lançado quando o conteúdo não cabe em um QR Code (versão 40). */
export class QrCapacityError extends Error {
  constructor() {
    super(
      'O conteúdo é grande demais para um QR Code. Reduza o texto ou use um nível de correção menor.'
    );
    this.name = 'QrCapacityError';
  }
}

export function generateQrMatrix(
  text: string,
  errorCorrectionLevel: QrErrorCorrection
): QrMatrix {
  let qr: ReturnType<typeof QRCode.create>;
  try {
    qr = QRCode.create(text, { errorCorrectionLevel });
  } catch (err) {
    if (err instanceof Error && /too big|amount of data/i.test(err.message)) {
      throw new QrCapacityError();
    }
    throw err;
  }
  const size = qr.modules.size;
  const data = qr.modules.data;
  const modules: boolean[][] = [];

  for (let r = 0; r < size; r++) {
    const row: boolean[] = [];
    for (let c = 0; c < size; c++) {
      row.push(Boolean(data[r * size + c]));
    }
    modules.push(row);
  }

  return { size, modules };
}

/**
 * Com logotipo, a área central do código é coberta; por isso a correção de
 * erro é elevada para H (30%) sempre que o nível escolhido for L ou M.
 */
export function getEffectiveErrorCorrection(
  style: Pick<QrStyleState, 'errorCorrection' | 'logoDataUrl'>
): QrErrorCorrection {
  if (style.logoDataUrl && (style.errorCorrection === 'L' || style.errorCorrection === 'M')) {
    return 'H';
  }
  return style.errorCorrection;
}

export function clampLogoScale(scale: number): number {
  return Math.min(0.32, Math.max(0.14, scale));
}

export function clampMargin(margin: number): number {
  return Math.max(0, Math.min(8, Math.round(margin)));
}

export function isFinderZone(row: number, col: number, size: number): boolean {
  const topLeft = row < 7 && col < 7;
  const topRight = row < 7 && col >= size - 7;
  const bottomLeft = row >= size - 7 && col < 7;
  return topLeft || topRight || bottomLeft;
}

export function isLogoClearedZone(
  row: number,
  col: number,
  size: number,
  logoScale: number,
  hasLogo: boolean
): boolean {
  if (!hasLogo) return false;
  const clearModules = Math.ceil(size * clampLogoScale(logoScale)) + 2;
  const half = clearModules / 2;
  const center = size / 2;
  return (
    row >= center - half &&
    row < center + half &&
    col >= center - half &&
    col < center + half
  );
}

/* -------------------------------------------------------------------------- */
/* Desenho em SVG                                                              */
/* -------------------------------------------------------------------------- */

/** Arredonda para 3 casas e remove zeros à direita, mantendo o SVG compacto. */
function n(value: number): string {
  return String(Math.round(value * 1000) / 1000);
}

function escapeXmlAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

function roundedRectPath(x: number, y: number, w: number, r: number): string {
  const s = w - 2 * r;
  return (
    `M${n(x + r)} ${n(y)}h${n(s)}a${n(r)} ${n(r)} 0 0 1 ${n(r)} ${n(r)}` +
    `v${n(s)}a${n(r)} ${n(r)} 0 0 1 ${n(-r)} ${n(r)}` +
    `h${n(-s)}a${n(r)} ${n(r)} 0 0 1 ${n(-r)} ${n(-r)}` +
    `v${n(-s)}a${n(r)} ${n(r)} 0 0 1 ${n(r)} ${n(-r)}z`
  );
}

/** Segmento de path para um módulo de dados na posição (x, y). */
function modulePath(x: number, y: number, shape: QrModuleShape): string {
  switch (shape) {
    case 'dots': {
      const r = 0.41;
      const cx = x + 0.5;
      const cy = y + 0.5;
      return `M${n(cx - r)} ${n(cy)}a${r} ${r} 0 1 0 ${n(2 * r)} 0a${r} ${r} 0 1 0 ${n(-2 * r)} 0z`;
    }
    case 'rounded':
      return roundedRectPath(x + 0.06, y + 0.06, 0.88, 0.26);
    case 'diamond': {
      // Losango levemente maior que a célula (≈67% de área): vizinhos se tocam
      // nas pontas e a leitura fica bem mais confiável que com losangos pequenos.
      const h = 0.58;
      const cx = x + 0.5;
      const cy = y + 0.5;
      return `M${n(cx)} ${n(cy - h)}L${n(cx + h)} ${n(cy)}L${n(cx)} ${n(cy + h)}L${n(cx - h)} ${n(cy)}z`;
    }
    case 'square':
    default:
      // Quadrados vizinhos no mesmo path são preenchidos juntos, sem frestas.
      return `M${x} ${y}h1v1h-1z`;
  }
}

function renderFinderEye(
  x: number,
  y: number,
  eyeStyle: QrEyeStyle,
  fgColor: string,
  bgColor: string
): string {
  if (eyeStyle === 'circle') {
    const cx = x + 3.5;
    const cy = y + 3.5;
    return [
      `<circle cx="${cx}" cy="${cy}" r="3.5" fill="${fgColor}"/>`,
      `<circle cx="${cx}" cy="${cy}" r="2.5" fill="${bgColor}"/>`,
      `<circle cx="${cx}" cy="${cy}" r="1.5" fill="${fgColor}"/>`,
    ].join('');
  }

  const rounded = eyeStyle === 'rounded';
  const outerR = rounded ? 1.55 : 0;
  const midR = rounded ? 1.05 : 0;
  const innerR = rounded ? 0.75 : 0;

  return [
    `<rect x="${x}" y="${y}" width="7" height="7" rx="${outerR}" fill="${fgColor}"/>`,
    `<rect x="${x + 1}" y="${y + 1}" width="5" height="5" rx="${midR}" fill="${bgColor}"/>`,
    `<rect x="${x + 2}" y="${y + 2}" width="3" height="3" rx="${innerR}" fill="${fgColor}"/>`,
  ].join('');
}

export interface RenderedQrSvg {
  svg: string;
  moduleCount: number;
  errorCorrection: QrErrorCorrection;
}

export interface BuildSvgOptions {
  /** Texto alternativo do SVG (acessibilidade). */
  ariaLabel?: string;
  /** Inclui width/height fixos (exportação). Desligue para SVG responsivo. */
  fixedSize?: boolean;
}

export function buildQrSvgString(
  payload: string,
  style: QrStyleState,
  options: BuildSvgOptions = {}
): RenderedQrSvg {
  const { ariaLabel = 'QR Code gerado', fixedSize = true } = options;
  const errorCorrection = getEffectiveErrorCorrection(style);
  const { size, modules } = generateQrMatrix(payload, errorCorrection);
  const margin = clampMargin(style.margin);
  const totalSize = size + margin * 2;
  const hasLogo = Boolean(style.logoDataUrl);
  const fg = escapeXmlAttr(style.fgColor);
  const bg = escapeXmlAttr(style.bgColor);

  const pathParts: string[] = [];
  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!modules[r][c]) continue;
      if (isFinderZone(r, c, size)) continue;
      if (isLogoClearedZone(r, c, size, style.logoScale, hasLogo)) continue;
      pathParts.push(modulePath(c + margin, r + margin, style.moduleShape));
    }
  }

  const elements: string[] = [
    `<rect width="${totalSize}" height="${totalSize}" fill="${bg}"/>`,
    `<path fill="${fg}" d="${pathParts.join('')}"/>`,
    renderFinderEye(margin, margin, style.eyeStyle, fg, bg),
    renderFinderEye(margin + size - 7, margin, style.eyeStyle, fg, bg),
    renderFinderEye(margin, margin + size - 7, style.eyeStyle, fg, bg),
  ];

  if (style.logoDataUrl) {
    const logoSize = size * clampLogoScale(style.logoScale);
    const padSize = logoSize + 1.4;
    const padPos = margin + (size - padSize) / 2;
    const logoPos = margin + (size - logoSize) / 2;

    elements.push(
      `<rect x="${n(padPos)}" y="${n(padPos)}" width="${n(padSize)}" height="${n(padSize)}" rx="${n(padSize * 0.14)}" fill="${bg}"/>`,
      `<image href="${escapeXmlAttr(style.logoDataUrl)}" x="${n(logoPos)}" y="${n(logoPos)}" width="${n(logoSize)}" height="${n(logoSize)}" preserveAspectRatio="xMidYMid meet"/>`
    );
  }

  const sizeAttrs = fixedSize ? ` width="${style.exportSize}" height="${style.exportSize}"` : '';
  const svg =
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}"${sizeAttrs}` +
    ` shape-rendering="geometricPrecision" role="img" aria-label="${escapeXmlAttr(ariaLabel)}">` +
    elements.join('') +
    '</svg>';

  return { svg, moduleCount: size, errorCorrection };
}

/* -------------------------------------------------------------------------- */
/* Exportação                                                                  */
/* -------------------------------------------------------------------------- */

/** Gera um nome de arquivo seguro a partir do rótulo do QR Code. */
export function buildExportFileName(label: string, extension: string, suffix = ''): string {
  const slug = label
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '')
    .slice(0, 48);
  return `qrcode-${slug || 'qrcodo'}${suffix ? `-${suffix}` : ''}.${extension}`;
}

export function triggerFileDownload(blobOrUrl: Blob | string, filename: string): void {
  const link = document.createElement('a');
  let objectUrl: string | null = null;
  if (typeof blobOrUrl === 'string') {
    link.href = blobOrUrl;
  } else {
    objectUrl = URL.createObjectURL(blobOrUrl);
    link.href = objectUrl;
  }
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  if (objectUrl) {
    const toRevoke = objectUrl;
    setTimeout(() => URL.revokeObjectURL(toRevoke), 1000);
  }
}

/** Rasteriza o SVG em um PNG quadrado de `exportSize` pixels. */
export function exportQrToPngBlob(svg: string, exportSize: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      URL.revokeObjectURL(url);
      const canvas = document.createElement('canvas');
      canvas.width = exportSize;
      canvas.height = exportSize;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        reject(new Error('Contexto 2D indisponível'));
        return;
      }
      ctx.imageSmoothingEnabled = true;
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, exportSize, exportSize);
      canvas.toBlob((blob) => {
        if (blob) resolve(blob);
        else reject(new Error('Falha ao gerar o PNG'));
      }, 'image/png');
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Falha ao renderizar SVG para PNG'));
    };
    img.src = url;
  });
}
