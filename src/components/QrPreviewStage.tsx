import {
  AlertTriangle,
  BookmarkPlus,
  Check,
  CheckCircle2,
  ChevronDown,
  ClipboardCopy,
  Code2,
  Download,
  FileCode2,
  Info,
  QrCode,
} from 'lucide-react';
import { useEffect, useMemo, useRef, useState } from 'react';
import type { QrPayloadResult, QrStyleState } from '../types/qr';
import { evaluateScannability } from '../utils/qrPayload';
import {
  QrCapacityError,
  buildExportFileName,
  buildQrSvgString,
  exportQrToPngBlob,
  triggerFileDownload,
} from '../utils/qrRenderer';
import type { FeedbackTone } from './Toast';

interface QrPreviewStageProps {
  payloadResult: QrPayloadResult;
  style: QrStyleState;
  onSaveToHistory: () => void;
  onFeedback: (message: string, tone?: FeedbackTone) => void;
}

const secondaryButton =
  'inline-flex items-center justify-center gap-2 rounded-lg border border-[#E4E4E0] bg-white px-3 py-2 text-sm font-medium whitespace-nowrap text-[#141413] transition-colors hover:bg-[#F7F7F5] disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]';

type CopiedKind = 'png' | 'svg' | 'payload' | null;

export function QrPreviewStage({
  payloadResult,
  style,
  onSaveToHistory,
  onFeedback,
}: QrPreviewStageProps) {
  const [showPayload, setShowPayload] = useState(false);
  const [copied, setCopied] = useState<CopiedKind>(null);
  const [busy, setBusy] = useState(false);
  const copiedTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => () => {
    if (copiedTimer.current) clearTimeout(copiedTimer.current);
  }, []);

  const scannability = useMemo(
    () => evaluateScannability(style.fgColor, style.bgColor),
    [style.fgColor, style.bgColor]
  );

  const preview = useMemo(() => {
    if (!payloadResult.valid) return { rendered: null, error: payloadResult.error ?? null };
    try {
      return {
        rendered: buildQrSvgString(payloadResult.payload, style, {
          fixedSize: false,
          ariaLabel: `QR Code: ${payloadResult.summaryLabel}`,
        }),
        error: null,
      };
    } catch (err) {
      return {
        rendered: null,
        error:
          err instanceof QrCapacityError
            ? err.message
            : 'Não foi possível gerar o QR Code com este conteúdo.',
      };
    }
  }, [payloadResult, style]);

  const rendered = preview.rendered;
  const isDisabled = !rendered || busy;
  const fileLabel = payloadResult.summaryLabel;

  function flagCopied(kind: CopiedKind) {
    setCopied(kind);
    if (copiedTimer.current) clearTimeout(copiedTimer.current);
    copiedTimer.current = setTimeout(() => setCopied(null), 1800);
  }

  /** SVG final para exportação, com largura/altura fixas na resolução escolhida. */
  function exportSvg(): string {
    return buildQrSvgString(payloadResult.payload, style, {
      ariaLabel: `QR Code: ${payloadResult.summaryLabel}`,
    }).svg;
  }

  async function handleDownloadPng() {
    if (isDisabled) return;
    setBusy(true);
    try {
      const blob = await exportQrToPngBlob(exportSvg(), style.exportSize);
      triggerFileDownload(blob, buildExportFileName(fileLabel, 'png', `${style.exportSize}px`));
      onFeedback(`PNG de ${style.exportSize} px baixado.`, 'success');
    } catch {
      onFeedback('Não foi possível gerar o PNG.', 'error');
    } finally {
      setBusy(false);
    }
  }

  function handleDownloadSvg() {
    if (isDisabled) return;
    const blob = new Blob([exportSvg()], { type: 'image/svg+xml;charset=utf-8' });
    triggerFileDownload(blob, buildExportFileName(fileLabel, 'svg'));
    onFeedback('Arquivo SVG vetorial baixado.', 'success');
  }

  async function handleCopyPng() {
    if (isDisabled) return;
    if (typeof ClipboardItem === 'undefined' || !navigator.clipboard?.write) {
      onFeedback('Seu navegador não permite copiar imagens. Use “Baixar PNG”.', 'error');
      return;
    }
    setBusy(true);
    try {
      const blob = await exportQrToPngBlob(exportSvg(), style.exportSize);
      await navigator.clipboard.write([new ClipboardItem({ 'image/png': blob })]);
      flagCopied('png');
      onFeedback('Imagem copiada. Cole em documentos, e-mails ou chats.', 'success');
    } catch {
      onFeedback('Não foi possível copiar a imagem.', 'error');
    } finally {
      setBusy(false);
    }
  }

  async function handleCopySvg() {
    if (isDisabled) return;
    try {
      await navigator.clipboard.writeText(exportSvg());
      flagCopied('svg');
      onFeedback('Código SVG copiado para a área de transferência.', 'success');
    } catch {
      onFeedback('Não foi possível copiar o SVG automaticamente.', 'error');
    }
  }

  async function handleCopyPayload() {
    if (!payloadResult.valid) return;
    try {
      await navigator.clipboard.writeText(payloadResult.payload);
      flagCopied('payload');
    } catch {
      onFeedback('Não foi possível copiar o conteúdo.', 'error');
    }
  }

  const contrastTone =
    scannability.status === 'low'
      ? 'border-[#F59E0B]/40 bg-[#FFFBEB] text-[#92400E]'
      : 'border-[#E4E4E0] bg-[#FAF9F7] text-[#3F3E3A]';

  return (
    <div className="rounded-2xl border border-[#E4E4E0] bg-white p-5 shadow-[0_1px_2px_rgba(20,20,19,0.04)] sm:p-6">
      <div className="mb-4 flex items-center justify-between gap-4">
        <h2 className="font-display text-lg font-bold text-[#141413]">Visualização ao vivo</h2>
        {rendered && (
          <span className="rounded-full bg-[#F3F3F0] px-2.5 py-1 text-[11px] font-medium text-[#575651] tabular-nums">
            {rendered.moduleCount}×{rendered.moduleCount}
            <span aria-hidden="true"> · </span>
            Correção {rendered.errorCorrection}
          </span>
        )}
      </div>

      <div className="studio-grid-bg flex min-h-[300px] items-center justify-center rounded-xl border border-[#E4E4E0] bg-[#FAFAF8] p-6 sm:p-8">
        {rendered ? (
          <div
            className="w-full max-w-[280px] overflow-hidden rounded-lg shadow-md ring-1 ring-black/5 [&>svg]:block [&>svg]:h-auto [&>svg]:w-full"
            data-testid="qr-preview-svg"
            data-modules={rendered.moduleCount}
            data-shape={style.moduleShape}
            // Seguro: todas as entradas do usuário são escapadas em buildQrSvgString.
            dangerouslySetInnerHTML={{ __html: rendered.svg }}
          />
        ) : (
          <div
            role="status"
            data-testid="qr-empty-state"
            className="flex max-w-[260px] flex-col items-center text-center"
          >
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-xl border border-[#E4E4E0] bg-white text-[#8A8982]">
              <QrCode className="h-6 w-6" aria-hidden="true" />
            </div>
            <p className="text-sm font-semibold text-[#141413]">Aguardando dados válidos</p>
            <p className="mt-1 text-xs leading-relaxed text-[#6B6A64]">
              {preview.error || 'Preencha os campos de conteúdo para visualizar o código.'}
            </p>
          </div>
        )}
      </div>

      <div
        className={`mt-4 flex items-center justify-between gap-3 rounded-lg border px-3.5 py-2.5 text-xs ${contrastTone}`}
      >
        <div className="flex min-w-0 items-center gap-2">
          {scannability.status === 'low' ? (
            <AlertTriangle className="h-4 w-4 shrink-0 text-[#D97706]" aria-hidden="true" />
          ) : (
            <CheckCircle2 className="h-4 w-4 shrink-0 text-[#15803D]" aria-hidden="true" />
          )}
          <span className="truncate font-medium">{scannability.label}</span>
        </div>
        <span
          className="shrink-0 font-mono text-xs tabular-nums"
          title="Razão de contraste entre módulos e fundo (mínimo recomendado 4,5:1)"
        >
          {scannability.ratio.toFixed(1)}:1
        </span>
      </div>

      {scannability.inverted && (
        <p className="mt-2 flex items-start gap-2 rounded-lg border border-[#E4E4E0] bg-[#FAF9F7] px-3.5 py-2.5 text-xs leading-relaxed text-[#3F3E3A]">
          <Info className="mt-0.5 h-3.5 w-3.5 shrink-0 text-[#575651]" aria-hidden="true" />
          Cores invertidas (módulos claros em fundo escuro): a maioria das câmeras lê, mas
          alguns leitores antigos falham. Teste antes de imprimir.
        </p>
      )}

      <div className="mt-5 space-y-2.5">
        <button
          type="button"
          disabled={isDisabled}
          onClick={handleDownloadPng}
          className="inline-flex w-full items-center justify-center gap-2 rounded-lg bg-[#2563EB] px-4 py-3 text-sm font-semibold whitespace-nowrap text-white shadow-sm transition-colors hover:bg-[#1D4ED8] disabled:cursor-not-allowed disabled:opacity-45 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
        >
          <Download className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>{busy ? 'Gerando imagem...' : `Baixar PNG · ${style.exportSize} px`}</span>
        </button>

        <div className="grid grid-cols-3 gap-2">
          <button type="button" disabled={isDisabled} onClick={handleDownloadSvg} className={secondaryButton}>
            <FileCode2 className="h-4 w-4 shrink-0 text-[#575651]" aria-hidden="true" />
            <span>SVG</span>
          </button>

          <button
            type="button"
            disabled={isDisabled}
            onClick={handleCopyPng}
            className={secondaryButton}
            aria-label="Copiar imagem PNG"
          >
            {copied === 'png' ? (
              <Check className="h-4 w-4 shrink-0 text-[#15803D]" aria-hidden="true" />
            ) : (
              <ClipboardCopy className="h-4 w-4 shrink-0 text-[#575651]" aria-hidden="true" />
            )}
            <span>{copied === 'png' ? 'Copiado' : 'Imagem'}</span>
          </button>

          <button
            type="button"
            disabled={isDisabled}
            onClick={handleCopySvg}
            className={secondaryButton}
            aria-label="Copiar código SVG"
          >
            {copied === 'svg' ? (
              <Check className="h-4 w-4 shrink-0 text-[#15803D]" aria-hidden="true" />
            ) : (
              <Code2 className="h-4 w-4 shrink-0 text-[#575651]" aria-hidden="true" />
            )}
            <span>{copied === 'svg' ? 'Copiado' : 'Código'}</span>
          </button>
        </div>

        <button
          type="button"
          disabled={isDisabled}
          onClick={onSaveToHistory}
          className={`${secondaryButton} w-full bg-[#FAF9F7] hover:bg-[#F1F0EC]`}
        >
          <BookmarkPlus className="h-4 w-4 shrink-0 text-[#575651]" aria-hidden="true" />
          <span>Salvar no histórico</span>
        </button>
      </div>

      <div className="mt-5 border-t border-[#E4E4E0] pt-4">
        <button
          type="button"
          aria-expanded={showPayload}
          aria-controls="qr-payload-panel"
          onClick={() => setShowPayload((prev) => !prev)}
          className="flex w-full items-center justify-between rounded-sm text-xs font-medium text-[#575651] transition-colors hover:text-[#141413] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
        >
          <span>Inspecionar conteúdo codificado</span>
          <ChevronDown
            className={`h-4 w-4 transition-transform ${showPayload ? 'rotate-180' : ''}`}
            aria-hidden="true"
          />
        </button>

        {showPayload && (
          <div
            id="qr-payload-panel"
            className="mt-3 rounded-lg border border-[#E4E4E0] bg-[#F7F7F5] p-3"
          >
            <pre
              data-testid="qr-payload-inspector"
              className="max-h-40 overflow-auto font-mono text-xs leading-relaxed break-all whitespace-pre-wrap text-[#141413]"
            >
              {payloadResult.valid ? payloadResult.payload : 'Nenhum conteúdo válido.'}
            </pre>
            {payloadResult.valid && (
              <div className="mt-2 flex items-center justify-between gap-3">
                <span className="text-[11px] text-[#6B6A64] tabular-nums">
                  {new TextEncoder().encode(payloadResult.payload).length} bytes
                </span>
                <button
                  type="button"
                  onClick={handleCopyPayload}
                  className="inline-flex items-center gap-1.5 text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
                >
                  {copied === 'payload' ? (
                    <Check className="h-3.5 w-3.5" aria-hidden="true" />
                  ) : (
                    <ClipboardCopy className="h-3.5 w-3.5" aria-hidden="true" />
                  )}
                  <span>{copied === 'payload' ? 'Copiado' : 'Copiar texto'}</span>
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
