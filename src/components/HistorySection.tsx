import { History, RotateCcw, Trash2 } from 'lucide-react';
import { useEffect, useState } from 'react';
import type { QrContentType, QrSavedItem } from '../types/qr';
import { QrCodeSvg } from './QrCodeSvg';

interface HistorySectionProps {
  items: QrSavedItem[];
  onLoadItem: (item: QrSavedItem) => void;
  onDeleteItem: (id: string) => void;
  onClearAll: () => void;
}

const TYPE_LABELS: Record<QrContentType, string> = {
  url: 'URL',
  text: 'Texto',
  wifi: 'Wi-Fi',
  pix: 'Pix',
  whatsapp: 'WhatsApp',
  email: 'E-mail',
  vcard: 'Contato',
};

const dateFormatter = new Intl.DateTimeFormat('pt-BR', {
  day: '2-digit',
  month: '2-digit',
  hour: '2-digit',
  minute: '2-digit',
});

function formatDatePtBr(iso: string): string {
  const date = new Date(iso);
  return Number.isNaN(date.getTime()) ? '' : dateFormatter.format(date);
}

export function HistorySection({ items, onLoadItem, onDeleteItem, onClearAll }: HistorySectionProps) {
  const [confirmClear, setConfirmClear] = useState(false);

  // A confirmação expira sozinha para evitar um clique acidental depois.
  useEffect(() => {
    if (!confirmClear) return;
    const timer = setTimeout(() => setConfirmClear(false), 4000);
    return () => clearTimeout(timer);
  }, [confirmClear]);

  return (
    <section
      id="historico"
      aria-labelledby="historico-titulo"
      className="mt-8 scroll-mt-20 rounded-2xl border border-[#E4E4E0] bg-white p-5 shadow-[0_1px_2px_rgba(20,20,19,0.04)] sm:p-6"
    >
      <div className="mb-5 flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2
            id="historico-titulo"
            className="flex items-center gap-2 font-display text-lg font-bold text-[#141413]"
          >
            Histórico salvo
            {items.length > 0 && (
              <span className="rounded-full bg-[#F3F3F0] px-2 py-0.5 font-sans text-xs font-medium text-[#575651] tabular-nums">
                {items.length}
              </span>
            )}
          </h2>
          <p className="text-xs text-[#6B6A64]">
            Fica salvo apenas neste navegador (até 12 itens). Nada é enviado para servidores.
          </p>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={() => {
              if (confirmClear) {
                onClearAll();
                setConfirmClear(false);
              } else {
                setConfirmClear(true);
              }
            }}
            className={`rounded-md px-2.5 py-1.5 text-xs font-medium whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] ${
              confirmClear
                ? 'bg-[#FEF2F2] text-[#B91C1C] ring-1 ring-[#FCA5A5]'
                : 'text-[#6B6A64] hover:text-[#B91C1C]'
            }`}
          >
            {confirmClear ? 'Clique para confirmar' : 'Limpar histórico'}
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="flex flex-col items-center rounded-xl border border-dashed border-[#D9D9D4] bg-[#FAF9F7] px-6 py-10 text-center">
          <History className="mb-2 h-6 w-6 text-[#8A8982]" aria-hidden="true" />
          <p className="text-sm font-medium text-[#141413]">Nenhum QR Code salvo ainda</p>
          <p className="mt-1 max-w-sm text-xs text-[#6B6A64]">
            Use “Salvar no histórico” no painel de visualização para guardar conteúdo e estilo e
            reutilizar depois.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="group flex items-center gap-3.5 rounded-xl border border-[#E4E4E0] bg-[#FAF9F7] p-3 transition-colors hover:border-[#D9D9D4] hover:bg-white"
            >
              <button
                type="button"
                onClick={() => onLoadItem(item)}
                aria-label={`Carregar ${item.label}`}
                className="h-16 w-16 shrink-0 overflow-hidden rounded-lg border border-[#E4E4E0] bg-white p-1 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
              >
                <QrCodeSvg
                  payload={item.payload}
                  style={{ ...item.style, margin: 1 }}
                  ariaLabel=""
                  className="h-full w-full"
                />
              </button>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#141413]" title={item.label}>
                  {item.label}
                </p>
                <p className="mt-0.5 truncate text-xs text-[#6B6A64] tabular-nums">
                  {TYPE_LABELS[item.type]}
                  <span aria-hidden="true"> · </span>
                  {formatDatePtBr(item.createdAt)}
                </p>

                <div className="mt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onLoadItem(item)}
                    className="inline-flex items-center gap-1 rounded-sm text-xs font-medium whitespace-nowrap text-[#2563EB] hover:text-[#1D4ED8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
                  >
                    <RotateCcw className="h-3 w-3" aria-hidden="true" />
                    <span>Carregar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteItem(item.id)}
                    aria-label={`Excluir ${item.label}`}
                    className="inline-flex items-center gap-1 rounded-sm text-xs font-medium whitespace-nowrap text-[#6B6A64] hover:text-[#B91C1C] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
                  >
                    <Trash2 className="h-3 w-3" aria-hidden="true" />
                    <span>Excluir</span>
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      )}
    </section>
  );
}
