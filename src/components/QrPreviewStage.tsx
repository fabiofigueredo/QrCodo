import {
  AlertTriangle,
  BookmarkPlus,
  Check,
  CheckCircle2,
  ChevronDown,
  ChevronUp,
  Copy,
  Download,
  FileCode2,
  QrCode,
} from 'lucide-react';
import { useMemo, useState } from 'react';
import type { QrPayloadResult, QrStyleState } from '../types/qr';
import { evaluateScannability } from '../utils/qrPayload';
import {
  buildQrSvgString,
  exportQrToPngDataUrl,
  triggerFileDownload,
} from '../utils/qrRenderer';
import { QrCodeSvg } from './QrCodeSvg';

interface QrPreviewStageProps {
  payloadResult: QrPayloadResult;
  style: QrStyleState;
  onSaveToHistory: () => void;
  onFeedback: (message: string) => void;
}

export function QrPreviewStage({
  payloadResult,
  style,
  onSaveToHistory,
  onFeedback,
}: QrPreviewStageProps) {
  const [showPayload, setShowPayload] = useState(false);
  const [copiedSvg, setCopiedSvg] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [downloadingPng, setDownloadingPng] = useState(false);

  const scannability = useMemo(
    () => evaluateScannability(style.fgColor, style.bgColor),
    [style.fgColor, style.bgColor]
  );

  const renderedSvg = useMemo(() => {
    if (!payloadResult.valid) return null;
    try {
      return buildQrSvgString(payloadResult.payload, style);
    } catch {
      return null;
    }
  }, [payloadResult.valid, payloadResult.payload, style]);

  const effectiveEcc = style.logoDataUrl
    ? style.errorCorrection === 'L' || style.errorCorrection === 'M'
      ? 'H'
      : style.errorCorrection
    : style.errorCorrection;

  async function handleDownloadPng() {
    if (!renderedSvg || downloadingPng) return;
    try {
      setDownloadingPng(true);
      const dataUrl = await exportQrToPngDataUrl(renderedSvg.svg, style.exportSize);
      triggerFileDownload(dataUrl, `qrcode-${style.exportSize}px.png`);
      onFeedback(`PNG (${style.exportSize} px) baixado.`);
    } catch {
      onFeedback('Não foi possível gerar o PNG.');
    } finally {
      setDownloadingPng(false);
    }
  }

  function handleDownloadSvg() {
    if (!renderedSvg) return;
    const blob = new Blob([renderedSvg.svg], { type: 'image/svg+xml;charset=utf-8' });
    triggerFileDownload(blob, 'qrcode-vetorial.svg');
    onFeedback('Arquivo SVG vetorial baixado.');
  }

  async function handleCopySvg() {
    if (!renderedSvg) return;
    try {
      await navigator.clipboard.writeText(renderedSvg.svg);
      setCopiedSvg(true);
      onFeedback('Código SVG copiado para a área de transferência.');
      setTimeout(() => setCopiedSvg(false), 1800);
    } catch {
      onFeedback('Não foi possível copiar o SVG automaticamente.');
    }
  }

  async function handleCopyPayload() {
    if (!payloadResult.valid) return;
    try {
      await navigator.clipboard.writeText(payloadResult.payload);
      setCopiedPayload(true);
      setTimeout(() => setCopiedPayload(false), 1800);
    } catch {
      onFeedback('Não foi possível copiar o conteúdo.');
    }
  }

  const isDisabled = !payloadResult.valid || !renderedSvg;

  return (
    <div className="rounded-xl border border-[#E4E4E0] bg-white p-6">
      <div className="flex items-center justify-between gap-4 mb-4">
        <h2 className="font-display text-lg font-bold text-[#141413]">
          Visualização ao vivo
        </h2>
        {renderedSvg && (
          <span className="text-xs text-[#6B6A64] tabular-nums">
            {renderedSvg.moduleCount} × {renderedSvg.moduleCount} módulos
            <span aria-hidden="true"> · </span>
            Correção {effectiveEcc}
          </span>
        )}
      </div>

      <div className="studio-grid-bg flex min-h-[300px] items-center justify-center rounded-lg border border-[#E4E4E0] p-6 sm:p-8">
        {payloadResult.valid && renderedSvg ? (
          <div className="w-full max-w-[264px] rounded-md shadow-sm ring-1 ring-black/5 overflow-hidden">
            <QrCodeSvg
              payload={payloadResult.payload}
              style={style}
              className="block h-auto w-full"
              testId="qr-preview-svg"
            />
          </div>
        ) : (
          <div
            role="status"
            data-testid="qr-empty-state"
            className="flex max-w-[260px] flex-col items-center text-center"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-lg border border-[#E4E4E0] bg-white text-[#8A8982]">
              <QrCode className="h-6 w-6" aria-hidden="true" />
            </div>
            <p className="text-sm font-semibold text-[#141413]">
              Aguardando dados válidos
            </p>
            <p className="mt-1 text-xs leading-relaxed text-[#6B6A64]">
              {payloadResult.error || 'Preencha os campos de conteúdo para visualizar o código.'}
            </p>
          </div>
        )}
      </div>

      <div
        className={`mt-4 flex items-center justify-between gap-3 rounded-lg border px-3.5 py-2.5 text-xs ${
          scannability.status === 'low'
            ? 'border-[#F59E0B]/40 bg-[#FFFBEB] text-[#92400E]'
            : 'border-[#E4E4E0] bg-[#FAF9F7] text-[#3F3E3A]'
        }`}
      >
        <div className="flex items-center gap-2 min-w-0">
          {scannability.status === 'low' ? (
            <AlertTriangle className="h-4 w-4 shrink-0 text-[#D97706]" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#15803D]" aria-hidden="true" />
          )}
          <span className="font-medium truncate">{scannability.label}</span>
        </div>
        <span className="font-mono text-xs tabular-nums shrink-0">
          {scannability.ratio.toFixed(1)}:1
        </span>
      </div>

      <div className="mt-5 space-y-2.5">
        <button
          type="button"
          disabled={isDisabled || downloadingPng}
          onClick={handleDownloadPng}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-45 transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
        >
          <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            {downloadingPng ? 'Gerando PNG...' : `Baixar PNG (${style.exportSize} px)`}
          </span>
        </button>

        <div className="grid grid-cols-2 gap-2.5">
          <button
            type="button"
            disabled={isDisabled}
            onClick={handleDownloadSvg}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#E4E4E0] bg-white px-3.5 py-2 text-sm font-medium text-[#141413] hover:bg-[#F7F7F5] disabled:cursor-not-allowed disabled:opacity-45 transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
          >
            <FileCode2 className="h-4 w-4 shrink-0 text-[#575651]" aria-hidden="true" />
            <span>Baixar SVG</span>
          </button>

          <button
            type="button"
            disabled={isDisabled}
            onClick={handleCopySvg}
            className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#E4E4E0] bg-white px-3.5 py-2 text-sm font-medium text-[#141413] hover:bg-[#F7F7F5] disabled:cursor-not-allowed disabled:opacity-45 transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
          >
            {copiedSvg ? (
              <Check className="h-4 w-4 shrink-0 text-[#15803D]" aria-hidden="true" />
            ) : (
              <Copy className="h-4 w-4 shrink-0 text-[#575651]" aria-hidden="true" />
            )}
            <span>{copiedSvg ? 'SVG copiado' : 'Copiar SVG'}</span>
          </button>
        </div>

        <button
          type="button"
          disabled={isDisabled}
          onClick={onSaveToHistory}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg border border-[#E4E4E0] bg-[#FAF9F7] px-3.5 py-2 text-sm font-medium text-[#141413] hover:bg-[#F1F0EC] disabled:cursor-not-allowed disabled:opacity-45 transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
        >
          <BookmarkPlus className="h-4 w-4 shrink-0 text-[#575651]" aria-hidden="true" />
          <span>Salvar no histórico</span>
        </button>
      </div>

      <div className="mt-5 border-t border-[#E4E4E0] pt-4">
        <button
          type="button"
          aria-expanded={showPayload}
          onClick={() => setShowPayload((prev) => !prev)}
          className="flex w-full items-center justify-between text-xs font-medium text-[#575651] hover:text-[#141413] transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] rounded-sm"
        >
          <span>Inspecionar conteúdo codificado</span>
          {showPayload ? (
            <ChevronUp className="h-4 w-4" aria-hidden="true" />
          ) : (
            <ChevronDown className="h-4 w-4" aria-hidden="true" />
          )}
        </button>

        {showPayload && (
          <div className="mt-3 rounded-lg border border-[#E4E4E0] bg-[#F7F7F5] p-3">
            <pre
              data-testid="qr-payload-inspector"
              className="max-h-36 overflow-auto whitespace-pre-wrap break-all font-mono text-xs leading-relaxed text-[#141413]"
            >
              {payloadResult.valid ? payloadResult.payload : 'Nenhum conteúdo válido.'}
            </pre>
            {payloadResult.valid && (
              <div className="mt-2 flex justify-end">
                <button
                  type="button"
                  onClick={handleCopyPayload}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
                >
                  {copiedPayload ? (
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <Copy className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  <span>{copiedPayload ? 'Copiado' : 'Copiar texto'}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
