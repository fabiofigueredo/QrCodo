import QRCode from 'qrcode';
import type { QrErrorCorrection, QrEyeStyle, QrModuleShape, QrStyleState } from '../types/qr';

export interface QrMatrix {
  size: number;
  modules: boolean[][];
}

export function generateQrMatrix(
  text: string,
  errorCorrectionLevel: QrErrorCorrection
): QrMatrix {
  const qr = QRCode.create(text, { errorCorrectionLevel });
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
  const clampedScale = Math.min(0.32, Math.max(0.14, logoScale));
  const clearModules = Math.ceil(size * clampedScale) + 2;
  const half = clearModules / 2;
  const center = size / 2;
  return (
    row >= center - half &&
    row < center + half &&
    col >= center - half &&
    col < center + half
  );
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
      `<circle cx="${cx}" cy="${cy}" r="3.5" fill="${fgColor}" />`,
      `<circle cx="${cx}" cy="${cy}" r="2.5" fill="${bgColor}" />`,
      `<circle cx="${cx}" cy="${cy}" r="1.5" fill="${fgColor}" />`,
    ].join('');
  }

  const outerRadius = eyeStyle === 'rounded' ? 1.55 : 0;
  const midRadius = eyeStyle === 'rounded' ? 1.05 : 0;
  const innerRadius = eyeStyle === 'rounded' ? 0.75 : 0;

  return [
    `<rect x="${x}" y="${y}" width="7" height="7" rx="${outerRadius}" fill="${fgColor}" />`,
    `<rect x="${x + 1}" y="${y + 1}" width="5" height="5" rx="${midRadius}" fill="${bgColor}" />`,
    `<rect x="${x + 2}" y="${y + 2}" width="3" height="3" rx="${innerRadius}" fill="${fgColor}" />`,
  ].join('');
}

function renderDataModule(
  x: number,
  y: number,
  shape: QrModuleShape,
  fgColor: string
): string {
  switch (shape) {
    case 'dots': {
      const cx = x + 0.5;
      const cy = y + 0.5;
      return `<circle cx="${cx}" cy="${cy}" r="0.41" fill="${fgColor}" />`;
    }
    case 'rounded': {
      return `<rect x="${x + 0.06}" y="${y + 0.06}" width="0.88" height="0.88" rx="0.26" fill="${fgColor}" />`;
    }
    case 'diamond': {
      const cx = x + 0.5;
      const cy = y + 0.5;
      return `<polygon points="${cx},${y + 0.04} ${x + 0.96},${cy} ${cx},${y + 0.96} ${x + 0.04},${cy}" fill="${fgColor}" />`;
    }
    case 'square':
    default: {
      return `<rect x="${x}" y="${y}" width="1.02" height="1.02" fill="${fgColor}" />`;
    }
  }
}

export interface RenderedQrSvg {
  svg: string;
  moduleCount: number;
}

function escapeXmlAttr(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/"/g, '&quot;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');
}

export function buildQrSvgString(
  payload: string,
  style: QrStyleState
): RenderedQrSvg {
  const effectiveEcc: QrErrorCorrection = style.logoDataUrl
    ? style.errorCorrection === 'L' || style.errorCorrection === 'M'
      ? 'H'
      : style.errorCorrection
    : style.errorCorrection;

  const { size, modules } = generateQrMatrix(payload, effectiveEcc);
  const margin = Math.max(0, Math.min(8, Math.round(style.margin)));
  const totalSize = size + margin * 2;
  const hasLogo = Boolean(style.logoDataUrl);

  const elements: string[] = [];
  elements.push(
    `<rect x="0" y="0" width="${totalSize}" height="${totalSize}" fill="${escapeXmlAttr(style.bgColor)}" />`
  );

  for (let r = 0; r < size; r++) {
    for (let c = 0; c < size; c++) {
      if (!modules[r][c]) continue;
      if (isFinderZone(r, c, size)) continue;
      if (isLogoClearedZone(r, c, size, style.logoScale, hasLogo)) continue;
      elements.push(
        renderDataModule(c + margin, r + margin, style.moduleShape, escapeXmlAttr(style.fgColor))
      );
    }
  }

  const fg = escapeXmlAttr(style.fgColor);
  const bg = escapeXmlAttr(style.bgColor);
  elements.push(renderFinderEye(margin, margin, style.eyeStyle, fg, bg));
  elements.push(renderFinderEye(margin + size - 7, margin, style.eyeStyle, fg, bg));
  elements.push(renderFinderEye(margin, margin + size - 7, style.eyeStyle, fg, bg));

  if (style.logoDataUrl) {
    const clampedScale = Math.min(0.32, Math.max(0.14, style.logoScale));
    const logoSize = size * clampedScale;
    const padSize = logoSize + 1.4;
    const padX = margin + (size - padSize) / 2;
    const padY = margin + (size - padSize) / 2;
    const logoX = margin + (size - logoSize) / 2;
    const logoY = margin + (size - logoSize) / 2;

    elements.push(
      `<rect x="${padX.toFixed(2)}" y="${padY.toFixed(2)}" width="${padSize.toFixed(2)}" height="${padSize.toFixed(2)}" rx="${(padSize * 0.14).toFixed(2)}" fill="${bg}" />`
    );
    elements.push(
      `<image href="${escapeXmlAttr(style.logoDataUrl)}" x="${logoX.toFixed(2)}" y="${logoY.toFixed(2)}" width="${logoSize.toFixed(2)}" height="${logoSize.toFixed(2)}" preserveAspectRatio="xMidYMid meet" />`
    );
  }

  const svg = [
    `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${totalSize} ${totalSize}" width="${style.exportSize}" height="${style.exportSize}" shape-rendering="geometricPrecision" role="img" aria-label="QR Code gerado">`,
    ...elements,
    '</svg>',
  ].join('');

  return {
    svg,
    moduleCount: size,
  };
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
    setTimeout(() => URL.revokeObjectURL(objectUrl), 1000);
  }
}

export function exportQrToPngDataUrl(svg: string, exportSize: number): Promise<string> {
  return new Promise((resolve, reject) => {
    const svgBlob = new Blob([svg], { type: 'image/svg+xml;charset=utf-8' });
    const url = URL.createObjectURL(svgBlob);
    const img = new Image();
    img.onload = () => {
      const canvas = document.createElement('canvas');
      canvas.width = exportSize;
      canvas.height = exportSize;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        URL.revokeObjectURL(url);
        reject(new Error('Contexto 2D indisponível'));
        return;
      }
      ctx.drawImage(img, 0, 0, exportSize, exportSize);
      URL.revokeObjectURL(url);
      resolve(canvas.toDataURL('image/png'));
    };
    img.onerror = () => {
      URL.revokeObjectURL(url);
      reject(new Error('Falha ao renderizar SVG para PNG'));
    };
    img.src = url;
  });
}
