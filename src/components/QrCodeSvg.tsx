import { useMemo } from 'react';
import type { QrStyleState } from '../types/qr';
import { buildQrSvgString } from '../utils/qrRenderer';

interface QrCodeSvgProps {
  payload: string;
  style: QrStyleState;
  className?: string;
  testId?: string;
  ariaLabel?: string;
}

/**
 * Renderiza o QR Code com o mesmo gerador usado na exportação, garantindo que
 * a visualização seja idêntica ao arquivo baixado. O SVG é montado como string
 * (todas as entradas são escapadas) e inserido de uma só vez, o que é bem mais
 * leve do que criar milhares de elementos React para códigos grandes.
 */
export function QrCodeSvg({
  payload,
  style,
  className,
  testId,
  ariaLabel = 'Visualização do QR Code gerado',
}: QrCodeSvgProps) {
  const rendered = useMemo(() => {
    try {
      return buildQrSvgString(payload, style, { ariaLabel, fixedSize: false });
    } catch {
      return null;
    }
  }, [payload, style, ariaLabel]);

  if (!rendered) return null;

  return (
    <div
      className={`[&>svg]:block [&>svg]:h-full [&>svg]:w-full ${className ?? ''}`}
      data-testid={testId}
      data-modules={rendered.moduleCount}
      data-shape={style.moduleShape}
      dangerouslySetInnerHTML={{ __html: rendered.svg }}
    />
  );
}
