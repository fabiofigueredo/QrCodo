import { useMemo } from 'react';
import type { QrErrorCorrection, QrEyeStyle, QrStyleState } from '../types/qr';
import {
  generateQrMatrix,
  isFinderZone,
  isLogoClearedZone,
} from '../utils/qrRenderer';

interface QrCodeSvgProps {
  payload: string;
  style: QrStyleState;
  className?: string;
  testId?: string;
}

function FinderEye({
  x,
  y,
  eyeStyle,
  fgColor,
  bgColor,
}: {
  x: number;
  y: number;
  eyeStyle: QrEyeStyle;
  fgColor: string;
  bgColor: string;
}) {
  if (eyeStyle === 'circle') {
    const cx = x + 3.5;
    const cy = y + 3.5;
    return (
      <g>
        <circle cx={cx} cy={cy} r={3.5} fill={fgColor} />
        <circle cx={cx} cy={cy} r={2.5} fill={bgColor} />
        <circle cx={cx} cy={cy} r={1.5} fill={fgColor} />
      </g>
    );
  }

  const outerR = eyeStyle === 'rounded' ? 1.55 : 0;
  const midR = eyeStyle === 'rounded' ? 1.05 : 0;
  const innerR = eyeStyle === 'rounded' ? 0.75 : 0;

  return (
    <g>
      <rect x={x} y={y} width={7} height={7} rx={outerR} fill={fgColor} />
      <rect x={x + 1} y={y + 1} width={5} height={5} rx={midR} fill={bgColor} />
      <rect x={x + 2} y={y + 2} width={3} height={3} rx={innerR} fill={fgColor} />
    </g>
  );
}

export function QrCodeSvg({ payload, style, className, testId }: QrCodeSvgProps) {
  const matrix = useMemo(() => {
    const effectiveEcc: QrErrorCorrection = style.logoDataUrl
      ? style.errorCorrection === 'L' || style.errorCorrection === 'M'
        ? 'H'
        : style.errorCorrection
      : style.errorCorrection;
    return generateQrMatrix(payload, effectiveEcc);
  }, [payload, style.errorCorrection, style.logoDataUrl]);

  const margin = Math.max(0, Math.min(8, Math.round(style.margin)));
  const totalSize = matrix.size + margin * 2;
  const hasLogo = Boolean(style.logoDataUrl);
  const clampedScale = Math.min(0.32, Math.max(0.14, style.logoScale));
  const logoSize = matrix.size * clampedScale;
  const padSize = logoSize + 1.4;
  const padX = margin + (matrix.size - padSize) / 2;
  const padY = margin + (matrix.size - padSize) / 2;
  const logoX = margin + (matrix.size - logoSize) / 2;
  const logoY = margin + (matrix.size - logoSize) / 2;

  return (
    <svg
      xmlns="http://www.w3.org/2000/svg"
      viewBox={`0 0 ${totalSize} ${totalSize}`}
      shapeRendering="geometricPrecision"
      role="img"
      aria-label="Visualização do QR Code gerado"
      data-testid={testId}
      data-modules={matrix.size}
      data-shape={style.moduleShape}
      className={className}
    >
      <rect x={0} y={0} width={totalSize} height={totalSize} fill={style.bgColor} />

      {matrix.modules.map((row, r) =>
        row.map((filled, c) => {
          if (!filled) return null;
          if (isFinderZone(r, c, matrix.size)) return null;
          if (isLogoClearedZone(r, c, matrix.size, style.logoScale, hasLogo)) return null;

          const x = c + margin;
          const y = r + margin;
          const key = `${r}-${c}`;

          if (style.moduleShape === 'dots') {
            return (
              <circle
                key={key}
                cx={x + 0.5}
                cy={y + 0.5}
                r={0.41}
                fill={style.fgColor}
              />
            );
          }

          if (style.moduleShape === 'rounded') {
            return (
              <rect
                key={key}
                x={x + 0.06}
                y={y + 0.06}
                width={0.88}
                height={0.88}
                rx={0.26}
                fill={style.fgColor}
              />
            );
          }

          if (style.moduleShape === 'diamond') {
            const cx = x + 0.5;
            const cy = y + 0.5;
            return (
              <polygon
                key={key}
                points={`${cx},${y + 0.04} ${x + 0.96},${cy} ${cx},${y + 0.96} ${x + 0.04},${cy}`}
                fill={style.fgColor}
              />
            );
          }

          return (
            <rect
              key={key}
              x={x}
              y={y}
              width={1.02}
              height={1.02}
              fill={style.fgColor}
            />
          );
        })
      )}

      <FinderEye
        x={margin}
        y={margin}
        eyeStyle={style.eyeStyle}
        fgColor={style.fgColor}
        bgColor={style.bgColor}
      />
      <FinderEye
        x={margin + matrix.size - 7}
        y={margin}
        eyeStyle={style.eyeStyle}
        fgColor={style.fgColor}
        bgColor={style.bgColor}
      />
      <FinderEye
        x={margin}
        y={margin + matrix.size - 7}
        eyeStyle={style.eyeStyle}
        fgColor={style.fgColor}
        bgColor={style.bgColor}
      />

      {style.logoDataUrl && (
        <g>
          <rect
            x={padX}
            y={padY}
            width={padSize}
            height={padSize}
            rx={padSize * 0.14}
            fill={style.bgColor}
          />
          <image
            href={style.logoDataUrl}
            x={logoX}
            y={logoY}
            width={logoSize}
            height={logoSize}
            preserveAspectRatio="xMidYMid meet"
          />
        </g>
      )}
    </svg>
  );
}
