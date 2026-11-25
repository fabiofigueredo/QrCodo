import { ImagePlus, Trash2 } from 'lucide-react';
import type { ChangeEvent } from 'react';
import type {
  QrErrorCorrection,
  QrExportSize,
  QrEyeStyle,
  QrModuleShape,
  QrStyleState,
} from '../types/qr';

interface StyleControlsProps {
  style: QrStyleState;
  onChange: (next: QrStyleState) => void;
  onLogoUploadError: (msg: string) => void;
}

const COLOR_PRESETS: Array<{ name: string; fullName: string; fg: string; bg: string }> = [
  { name: 'Grafite', fullName: 'Grafite Clássico', fg: '#141413', bg: '#FFFFFF' },
  { name: 'Cobalto', fullName: 'Azul Cobalto', fg: '#1D4ED8', bg: '#FFFFFF' },
  { name: 'Floresta', fullName: 'Verde Floresta', fg: '#166534', bg: '#F7FAF7' },
  { name: 'Invertido', fullName: 'Papel Invertido', fg: '#FFFFFF', bg: '#141413' },
  { name: 'Terracota', fullName: 'Terracota Escuro', fg: '#9A3412', bg: '#FFFBF7' },
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

const ECC_LEVELS: Array<{ id: QrErrorCorrection; label: string }> = [
  { id: 'L', label: 'L (7%)' },
  { id: 'M', label: 'M (15%)' },
  { id: 'Q', label: 'Q (25%)' },
  { id: 'H', label: 'H (30%)' },
];

const EXPORT_SIZES: QrExportSize[] = [512, 1024, 2048];

export function StyleControls({
  style,
  onChange,
  onLogoUploadError,
}: StyleControlsProps) {
  function handleLogoChange(e: ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) {
      onLogoUploadError('O logotipo deve ter no máximo 2 MB.');
      e.target.value = '';
      return;
    }
    const reader = new FileReader();
    reader.onload = () => {
      if (typeof reader.result === 'string') {
        onChange({
          ...style,
          logoDataUrl: reader.result,
          errorCorrection: 'H',
        });
      }
    };
    reader.readAsDataURL(file);
    e.target.value = '';
  }

  return (
    <div className="space-y-6">
      <div>
        <div className="flex items-center justify-between gap-4 mb-2.5">
          <span className="text-sm font-medium text-[#141413]">Paletas rápidas</span>
          <span className="text-xs text-[#6B6A64]">Frente e fundo</span>
        </div>
        <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
          {COLOR_PRESETS.map((preset) => {
            const selected =
              style.fgColor.toUpperCase() === preset.fg.toUpperCase() &&
              style.bgColor.toUpperCase() === preset.bg.toUpperCase();
            return (
              <button
                key={preset.fullName}
                type="button"
                onClick={() =>
                  onChange({ ...style, fgColor: preset.fg, bgColor: preset.bg })
                }
                aria-label={`Aplicar paleta ${preset.fullName}`}
                aria-pressed={selected}
                className={`inline-flex items-center justify-center gap-2 rounded-lg border px-2.5 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] ${
                  selected
                    ? 'border-[#2563EB] bg-[#2563EB]/5 text-[#1D4ED8]'
                    : 'border-[#E4E4E0] bg-white text-[#141413] hover:bg-[#F7F7F5]'
                }`}
              >
                <span
                  aria-hidden="true"
                  className="inline-flex h-4 w-4 shrink-0 overflow-hidden rounded border border-black/15"
                >
                  <span className="w-1/2 h-full" style={{ backgroundColor: preset.fg }} />
                  <span className="w-1/2 h-full" style={{ backgroundColor: preset.bg }} />
                </span>
                <span>{preset.name}</span>
              </button>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="qr-fg-color" className="block text-sm font-medium text-[#141413] mb-1.5">
            Cor dos módulos
          </label>
          <div className="flex items-center gap-2 rounded-lg border border-[#D9D9D4] bg-white px-2.5 py-1.5">
            <input
              id="qr-fg-color"
              type="color"
              value={style.fgColor}
              onChange={(e) => onChange({ ...style, fgColor: e.target.value })}
              aria-label="Seletor de cor dos módulos"
              className="h-8 w-8 rounded border-0 bg-transparent p-0"
            />
            <input
              type="text"
              value={style.fgColor.toUpperCase()}
              onChange={(e) => {
                const v = e.target.value;
                if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) {
                  onChange({ ...style, fgColor: v });
                }
              }}
              aria-label="Código hexadecimal da cor dos módulos"
              className="w-full font-mono text-sm text-[#141413] focus:outline-none uppercase tabular-nums"
            />
          </div>
        </div>

        <div>
          <label htmlFor="qr-bg-color" className="block text-sm font-medium text-[#141413] mb-1.5">
            Cor do fundo
          </label>
          <div className="flex items-center gap-2 rounded-lg border border-[#D9D9D4] bg-white px-2.5 py-1.5">
            <input
              id="qr-bg-color"
              type="color"
              value={style.bgColor}
              onChange={(e) => onChange({ ...style, bgColor: e.target.value })}
              aria-label="Seletor de cor do fundo"
              className="h-8 w-8 rounded border-0 bg-transparent p-0"
            />
            <input
              type="text"
              value={style.bgColor.toUpperCase()}
              onChange={(e) => {
                const v = e.target.value;
                if (/^#[0-9A-Fa-f]{0,6}$/.test(v)) {
                  onChange({ ...style, bgColor: v });
                }
              }}
              aria-label="Código hexadecimal da cor do fundo"
              className="w-full font-mono text-sm text-[#141413] focus:outline-none uppercase tabular-nums"
            />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <span className="block text-sm font-medium text-[#141413] mb-1.5">
            Formato dos módulos
          </span>
          <div className="grid grid-cols-2 gap-1.5 rounded-lg bg-[#F3F3F0] p-1">
            {MODULE_SHAPES.map(({ id, label }) => {
              const active = style.moduleShape === id;
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onChange({ ...style, moduleShape: id })}
                  className={`rounded-md px-3 py-2 text-xs font-medium transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#2563EB] ${
                    active
                      ? 'bg-white text-[#141413] shadow-xs'
                      : 'text-[#575651] hover:text-[#141413]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <span className="block text-sm font-medium text-[#141413] mb-1.5">
            Cantos (olhos)
          </span>
          <div className="grid grid-cols-3 gap-1.5 rounded-lg bg-[#F3F3F0] p-1">
            {EYE_STYLES.map(({ id, label }) => {
              const active = style.eyeStyle === id;
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onChange({ ...style, eyeStyle: id })}
                  className={`rounded-md px-2 py-2 text-xs font-medium transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#2563EB] ${
                    active
                      ? 'bg-white text-[#141413] shadow-xs'
                      : 'text-[#575651] hover:text-[#141413]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>
      </div>

      <div className="border-t border-[#E4E4E0] pt-5 grid grid-cols-1 gap-5 sm:grid-cols-2">
        <div>
          <span className="block text-sm font-medium text-[#141413] mb-1.5">
            Correção de erro
          </span>
          <div className="grid grid-cols-4 gap-1 rounded-lg bg-[#F3F3F0] p-1">
            {ECC_LEVELS.map(({ id, label }) => {
              const active = style.errorCorrection === id;
              return (
                <button
                  key={id}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onChange({ ...style, errorCorrection: id })}
                  className={`rounded-md px-2 py-2 text-xs font-medium tabular-nums transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#2563EB] ${
                    active
                      ? 'bg-white text-[#141413] shadow-xs'
                      : 'text-[#575651] hover:text-[#141413]'
                  }`}
                >
                  {label}
                </button>
              );
            })}
          </div>
        </div>

        <div>
          <span className="block text-sm font-medium text-[#141413] mb-1.5">
            Resolução PNG
          </span>
          <div className="grid grid-cols-3 gap-1 rounded-lg bg-[#F3F3F0] p-1">
            {EXPORT_SIZES.map((size) => {
              const active = style.exportSize === size;
              return (
                <button
                  key={size}
                  type="button"
                  aria-pressed={active}
                  onClick={() => onChange({ ...style, exportSize: size })}
                  className={`rounded-md px-2 py-2 text-xs font-medium tabular-nums transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#2563EB] ${
                    active
                      ? 'bg-white text-[#141413] shadow-xs'
                      : 'text-[#575651] hover:text-[#141413]'
                  }`}
                >
                  {size} px
                </button>
              );
            })}
          </div>
        </div>

        <div className="sm:col-span-2">
          <div className="flex items-center justify-between mb-1.5">
            <label htmlFor="qr-margin-range" className="text-sm font-medium text-[#141413]">
              Margem externa (zona de respiro)
            </label>
            <span className="font-mono text-xs text-[#575651] tabular-nums">
              {style.margin} módulos
            </span>
          </div>
          <input
            id="qr-margin-range"
            type="range"
            min={0}
            max={6}
            step={1}
            value={style.margin}
            onChange={(e) => onChange({ ...style, margin: Number(e.target.value) })}
            className="w-full accent-[#2563EB]"
          />
        </div>
      </div>

      <div className="border-t border-[#E4E4E0] pt-5">
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div>
            <p className="text-sm font-medium text-[#141413]">Logotipo central</p>
            <p className="text-xs text-[#6B6A64]">
              PNG, SVG ou JPG até 2 MB. Ativa correção H automaticamente.
            </p>
          </div>

          <div className="flex items-center gap-2">
            <label
              htmlFor="qr-logo-upload"
              className="inline-flex items-center gap-2 rounded-lg border border-[#E4E4E0] bg-white px-3.5 py-2 text-xs font-medium text-[#141413] hover:bg-[#F7F7F5] transition-colors cursor-pointer whitespace-nowrap shrink-0"
            >
              <ImagePlus className="h-4 w-4 text-[#575651]" aria-hidden="true" />
              <span>{style.logoDataUrl ? 'Trocar logotipo' : 'Enviar logotipo'}</span>
            </label>
            <input
              id="qr-logo-upload"
              type="file"
              accept="image/png,image/svg+xml,image/jpeg,image/webp"
              onChange={handleLogoChange}
              className="sr-only"
            />

            {style.logoDataUrl && (
              <button
                type="button"
                onClick={() => onChange({ ...style, logoDataUrl: null })}
                aria-label="Remover logotipo central"
                className="inline-flex items-center gap-1.5 rounded-lg border border-[#E4E4E0] bg-white px-3 py-2 text-xs font-medium text-[#B91C1C] hover:bg-[#FEF2F2] transition-colors whitespace-nowrap shrink-0"
              >
                <Trash2 className="h-3.5 w-3.5" aria-hidden="true" />
                <span>Remover</span>
              </button>
            )}
          </div>
        </div>

        {style.logoDataUrl && (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-1.5">
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
              onChange={(e) =>
                onChange({ ...style, logoScale: Number(e.target.value) / 100 })
              }
              className="w-full accent-[#2563EB]"
            />
          </div>
        )}
      </div>
    </div>
  );
}
