import { ArrowLeftRight, ImagePlus, Trash2 } from 'lucide-react';
import {
  useEffect,
  useId,
  useState,
  type ChangeEvent,
  type Dispatch,
  type SetStateAction,
} from 'react';
import type {
  QrErrorCorrection,
  QrExportSize,
  QrEyeStyle,
  QrModuleShape,
  QrStyleState,
} from '../types/qr';
import { isValidHexColor } from '../utils/qrPayload';
import { getEffectiveErrorCorrection } from '../utils/qrRenderer';

interface StyleControlsProps {
  style: QrStyleState;
  onChange: Dispatch<SetStateAction<QrStyleState>>;
  onLogoUploadError: (msg: string) => void;
}

const COLOR_PRESETS: Array<{ name: string; fullName: string; fg: string; bg: string }> = [
  { name: 'Grafite', fullName: 'Grafite Clássico', fg: '#141413', bg: '#FFFFFF' },
  { name: 'Cobalto', fullName: 'Azul Cobalto', fg: '#1D4ED8', bg: '#FFFFFF' },
  { name: 'Floresta', fullName: 'Verde Floresta', fg: '#166534', bg: '#F7FAF7' },
  { name: 'Vinho', fullName: 'Vinho Profundo', fg: '#7F1D1D', bg: '#FFF8F6' },
  { name: 'Terracota', fullName: 'Terracota Escuro', fg: '#9A3412', bg: '#FFFBF7' },
  { name: 'Invertido', fullName: 'Papel Invertido', fg: '#FFFFFF', bg: '#141413' },
];

const MODULE_SHAPES: Array<{ id: QrModuleShape; label: string }> = [
  { id: 'square', label: 'Quadrado' },
  { id: 'rounded', label: 'Suave' },
  { id: 'dots', label: 'Pontos' },
  { id: 'diamond', label: 'Diamante' },
];

const EYE_STYLES: Array<{ id: QrEyeStyle; label: string }> = [
  { id: 'square', label: 'Quadrado' },
  { id: 'rounded', label: 'Arredondado' },
  { id: 'circle', label: 'Circular' },
];

const ECC_LEVELS: Array<{ id: QrErrorCorrection; label: string; title: string }> = [
  { id: 'L', label: 'L · 7%', title: 'Baixa: código mais simples, ideal para telas' },
  { id: 'M', label: 'M · 15%', title: 'Média: equilíbrio para a maioria dos usos' },
  { id: 'Q', label: 'Q · 25%', title: 'Alta: impressos sujeitos a desgaste' },
  { id: 'H', label: 'H · 30%', title: 'Máxima: necessária com logotipo' },
];

const EXPORT_SIZES: QrExportSize[] = [512, 1024, 2048];

const ACCEPTED_LOGO_TYPES = ['image/png', 'image/svg+xml', 'image/jpeg', 'image/webp'];
const MAX_LOGO_BYTES = 5 * 1024 * 1024;
const MAX_LOGO_PIXELS = 512;

/**
 * Reduz imagens bitmap para no máximo 512 px no maior lado. Mantém a nitidez
 * no QR Code e deixa o data URL pequeno o bastante para o histórico local.
 * SVGs são mantidos como estão (já são vetoriais e normalmente leves).
 */
function downscaleLogo(dataUrl: string, mimeType: string): Promise<string> {
  if (mimeType === 'image/svg+xml') return Promise.resolve(dataUrl);
  return new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => {
      const scale = Math.min(1, MAX_LOGO_PIXELS / Math.max(img.width, img.height));
      const width = Math.max(1, Math.round(img.width * scale));
      const height = Math.max(1, Math.round(img.height * scale));
      const canvas = document.createElement('canvas');
      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');
      if (!ctx) {
        resolve(dataUrl);
        return;
      }
      ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(img, 0, 0, width, height);
      resolve(canvas.toDataURL(mimeType === 'image/jpeg' ? 'image/jpeg' : 'image/png', 0.92));
    };
    img.onerror = () => reject(new Error('Imagem inválida'));
    img.src = dataUrl;
  });
}

/* -------------------------------------------------------------------------- */

interface SegmentedOption<T extends string | number> {
  id: T;
  label: string;
  title?: string;
}

function Segmented<T extends string | number>({
  label,
  options,
  value,
  onSelect,
  columns,
}: {
  label: string;
  options: SegmentedOption<T>[];
  value: T;
  onSelect: (value: T) => void;
  columns: string;
}) {
  const labelId = useId();
  return (
    <div>
      <span id={labelId} className="mb-1.5 block text-sm font-medium text-[#141413]">
        {label}
      </span>
      <div
        role="group"
        aria-labelledby={labelId}
        className={`grid ${columns} gap-1 rounded-lg bg-[#F3F3F0] p-1`}
      >
        {options.map((opt) => {
          const active = value === opt.id;
          return (
            <button
              key={String(opt.id)}
              type="button"
              title={opt.title}
              aria-pressed={active}
              onClick={() => onSelect(opt.id)}
              className={`min-h-9 rounded-md px-2 py-2 text-xs font-medium tabular-nums whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#2563EB] ${
                active
                  ? 'bg-white text-[#1D4ED8] shadow-sm ring-1 ring-black/5'
                  : 'text-[#575651] hover:text-[#141413]'
              }`}
            >
              {opt.label}
            </button>
          );
        })}
      </div>
    </div>
  );
}

/**
 * Campo de cor com seletor nativo + código hexadecimal. O texto digitado fica
 * em rascunho e só é aplicado quando forma um hex válido (#RRGGBB).
 */
function ColorField({
  label,
  value,
  onCommit,
}: {
  label: string;
  value: string;
  onCommit: (hex: string) => void;
}) {
  const id = useId();
  const [draft, setDraft] = useState(value.toUpperCase());

  useEffect(() => {
    setDraft(value.toUpperCase());
  }, [value]);

  const draftInvalid = !isValidHexColor(draft);

  function handleText(raw: string) {
    let next = raw.trim().toUpperCase();
    if (next && !next.startsWith('#')) next = `#${next}`;
    if (!/^#?[0-9A-F]{0,6}$/.test(next)) return;
    setDraft(next);
    if (isValidHexColor(next)) onCommit(next);
  }

  return (
    <div>
      <label htmlFor={id} className="mb-1.5 block text-sm font-medium text-[#141413]">
        {label}
      </label>
      <div
        className={`flex items-center gap-2 rounded-lg border bg-white px-2.5 py-1.5 transition-colors focus-within:ring-4 focus-within:ring-[#2563EB]/15 ${
          draftInvalid ? 'border-[#F59E0B]' : 'border-[#D9D9D4] focus-within:border-[#2563EB]'
        }`}
      >
        <input
          type="color"
          value={value}
          onChange={(e) => onCommit(e.target.value.toUpperCase())}
          aria-label={`${label}: seletor visual`}
          className="h-8 w-8 shrink-0 rounded border-0 bg-transparent p-0"
        />
        <input
          id={id}
          type="text"
          value={draft}
          maxLength={7}
          spellCheck={false}
          autoComplete="off"
          onChange={(e) => handleText(e.target.value)}
          onBlur={() => setDraft(value.toUpperCase())}
          aria-invalid={draftInvalid}
          className="w-full bg-transparent font-mono text-sm text-[#141413] uppercase tabular-nums focus:outline-none"
        />
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

export function StyleControls({ style, onChange, onLogoUploadError }: StyleControlsProps) {
  const update = (patch: Partial<QrStyleState>) => onChange((prev) => ({ ...prev, ...patch }));
  const effectiveEcc = getEffectiveErrorCorrection(style);

  function handleLogoChange(e: ChangeEvent<HTMLInputElement>) {
    const input = e.target;
    const file = input.files?.[0];
    input.value = '';
    if (!file) return;
    if (!ACCEPTED_LOGO_TYPES.includes(file.type)) {
      onLogoUploadError('Formato não suportado. Use PNG, SVG, JPG ou WebP.');
      return;
    }
    if (file.size > MAX_LOGO_BYTES) {
      onLogoUploadError('O logotipo deve ter no máximo 5 MB.');
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result !== 'string') return;
      downscaleLogo(reader.result, file.type)
        .then((logoDataUrl) => update({ logoDataUrl }))
        .catch(() => onLogoUploadError('Não foi possível processar a imagem do logotipo.'));
    };
    reader.onerror = () => onLogoUploadError('Não foi possível ler o arquivo do logotipo.');
    reader.readAsDataURL(file);
  }

  return (
    <div className="space-y-6">
      {/* Cores */}
      <div>
        <div className="mb-2.5 flex items-center justify-between gap-4">
          <span className="text-sm font-medium text-[#141413]">Paletas rápidas</span>
          <span className="text-xs text-[#6B6A64]">Módulos e fundo</span>
        </div>
        <div className="grid grid-cols-3 gap-2 sm:grid-cols-6">
          {COLOR_PRESETS.map((preset) => {
            const selected =
              style.fgColor.toUpperCase() === preset.fg.toUpperCase() &&
              style.bgColor.toUpperCase() === preset.bg.toUpperCase();
            return (
              <button
                key={preset.fullName}
                type="button"
                onClick={() => update({ fgColor: preset.fg, bgColor: preset.bg })}
                aria-label={`Aplicar paleta ${preset.fullName}`}
                aria-pressed={selected}
                className={`flex min-h-10 flex-col items-center justify-center gap-1.5 rounded-lg border px-2 py-2 text-xs font-medium transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] ${
                  selected
                    ? 'border-[#2563EB] bg-[#2563EB]/5 text-[#1D4ED8]'
                    : 'border-[#E4E4E0] bg-white text-[#141413] hover:bg-[#F7F7F5]'
                }`}
              >
                <span
                  aria-hidden="true"
                  className="flex h-5 w-9 overflow-hidden rounded-md border border-black/15"
                >
                  <span className="h-full w-1/2" style={{ backgroundColor: preset.fg }} />
                  <span className="h-full w-1/2" style={{ backgroundColor: preset.bg }} />
                </span>
                <span>{preset.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-[1fr_auto_1fr] items-end gap-2 sm:gap-3">
        <ColorField
          label="Cor dos módulos"
          value={style.fgColor}
          onCommit={(fgColor) => update({ fgColor })}
        />
        <button
          type="button"
          onClick={() =>
            onChange((prev) => ({ ...prev, fgColor: prev.bgColor, bgColor: prev.fgColor }))
          }
          title="Inverter cores"
          aria-label="Inverter cor dos módulos e do fundo"
          className="mb-1 flex h-9 w-9 items-center justify-center rounded-lg border border-[#E4E4E0] bg-white text-[#575651] hover:bg-[#F7F7F5] hover:text-[#141413] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
        >
          <ArrowLeftRight className="h-4 w-4" aria-hidden="true" />
        </button>
        <ColorField
          label="Cor do fundo"
          value={style.bgColor}
          onCommit={(bgColor) => update({ bgColor })}
        />
      </div>

      {/* Formas */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <Segmented
          label="Formato dos módulos"
          options={MODULE_SHAPES}
          value={style.moduleShape}
          onSelect={(moduleShape) => update({ moduleShape })}
          columns="grid-cols-4 sm:grid-cols-2"
        />
        <Segmented
          label="Cantos (olhos)"
          options={EYE_STYLES}
          value={style.eyeStyle}
          onSelect={(eyeStyle) => update({ eyeStyle })}
          columns="grid-cols-3"
        />
      </div>

      {style.moduleShape === 'diamond' && (
        <p className="-mt-3 text-xs text-[#92400E]">
          Diamante é o formato mais decorativo e o menos tolerante: evite combiná-lo com cores
          invertidas ou conteúdos longos e teste a leitura antes de imprimir.
        </p>
      )}

      {/* Técnico */}
      <div className="grid grid-cols-1 gap-5 border-t border-[#E4E4E0] pt-5 sm:grid-cols-2">
        <div>
          <Segmented
            label="Correção de erro"
            options={ECC_LEVELS}
            value={style.errorCorrection}
            onSelect={(errorCorrection) => update({ errorCorrection })}
            columns="grid-cols-4"
          />
          {effectiveEcc !== style.errorCorrection && (
            <p className="mt-1.5 text-xs text-[#6B6A64]">
              Com logotipo, o código usa correção <strong>{effectiveEcc}</strong> automaticamente.
            </p>
          )}
        </div>

        <Segmented
          label="Resolução do PNG"
          options={EXPORT_SIZES.map((size) => ({ id: size, label: `${size} px` }))}
          value={style.exportSize}
          onSelect={(exportSize) => update({ exportSize })}
          columns="grid-cols-3"
        />

        <div className="sm:col-span-2">
          <div className="mb-1.5 flex items-center justify-between">
            <label htmlFor="qr-margin-range" className="text-sm font-medium text-[#141413]">
              Margem externa (zona de respiro)
            </label>
            <span className="font-mono text-xs text-[#575651] tabular-nums">
              {style.margin} {style.margin === 1 ? 'módulo' : 'módulos'}
            </span>
          </div>
          <input
            id="qr-margin-range"
            type="range"
            min={0}
            max={8}
            step={1}
            value={style.margin}
            onChange={(e) => update({ margin: Number(e.target.value) })}
            className="w-full accent-[#2563EB]"
          />
          {style.margin < 2 && (
            <p className="mt-1 text-xs text-[#92400E]">
              Margens pequenas dificultam a leitura em fundos estampados. Recomendado: 4.
            </p>
          )}
        </div>
      </div>

      {/* Logotipo */}
      <div className="border-t border-[#E4E4E0] pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div
              aria-hidden="true"
              className="studio-grid-bg flex h-11 w-11 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-[#E4E4E0] bg-white"
            >
              {style.logoDataUrl ? (
                <img src={style.logoDataUrl} alt="" className="h-8 w-8 object-contain" />
              ) : (
                <ImagePlus className="h-4 w-4 text-[#8A8982]" />
              )}
            </div>
            <div>
              <p className="text-sm font-medium text-[#141413]">Logotipo central</p>
              <p className="text-xs text-[#6B6A64]">PNG, SVG, JPG ou WebP até 5 MB. Prefira fundo transparente.</p>
            </div>
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor="qr-logo-upload"
              className="inline-flex cursor-pointer items-center gap-2 rounded-lg border border-[#E4E4E0] bg-white px-3.5 py-2 text-xs font-medium whitespace-nowrap text-[#141413] transition-colors hover:bg-[#F7F7F5] has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-[#2563EB]"
            >
              <ImagePlus className="h-4 w-4 text-[#575651]" aria-hidden="true" />
              <span>{style.logoDataUrl ? 'Trocar logotipo' : 'Enviar logotipo'}</span>
              <input
                id="qr-logo-upload"
                type="file"
                accept={ACCEPTED_LOGO_TYPES.join(',')}
                onChange={handleLogoChange}
                className="sr-only"
              />
            </label>

            {style.logoDataUrl && (
              <button
                type="button"
                onClick={() => update({ logoDataUrl: null })}
                aria-label="Remover logotipo central"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#E4E4E0] bg-white px-3 py-2 text-xs font-medium whitespace-nowrap text-[#B91C1C] transition-colors hover:bg-[#FEF2F2] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Remover</span>
              </button>
            )}
          </div>
        </div>

        {style.logoDataUrl && (
          <div className="mt-4">
            <div className="mb-1.5 flex items-center justify-between">
              <label htmlFor="qr-logo-scale" className="text-xs font-medium text-[#141413]">
                Tamanho do logotipo
              </label>
              <span className="font-mono text-xs text-[#575651] tabular-nums">
                {Math.round(style.logoScale * 100)}%
              </span>
            </div>
            <input
              id="qr-logo-scale"
              type="range"
              min={14}
              max={30}
              step={1}
              value={Math.round(style.logoScale * 100)}
              onChange={(e) => update({ logoScale: Number(e.target.value) / 100 })}
              className="w-full accent-[#2563EB]"
            />
            {style.logoScale > 0.26 && (
              <p className="mt-1 text-xs text-[#92400E]">
                Logotipos grandes cobrem mais dados — teste a leitura antes de imprimir.
              </p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
