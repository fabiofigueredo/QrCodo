import { RotateCcw, Trash2 } from 'lucide-react';
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

function formatDatePtBr(iso: string): string {
  try {
    return new Intl.DateTimeFormat('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }).format(new Date(iso));
  } catch {
    return '';
  }
}

export function HistorySection({
  items,
  onLoadItem,
  onDeleteItem,
  onClearAll,
}: HistorySectionProps) {
  return (
    <section
      id="historico"
      aria-labelledby="historico-titulo"
      className="mt-10 rounded-xl border border-[#E4E4E0] bg-white p-6"
    >
      <div className="flex flex-wrap items-center justify-between gap-4 mb-5">
        <div>
          <h2 id="historico-titulo" className="font-display text-lg font-bold text-[#141413]">
            Histórico salvo
          </h2>
          <p className="text-xs text-[#6B6A64]">
            Seus códigos ficam salvos localmente neste navegador para reutilizar quando quiser.
          </p>
        </div>

        {items.length > 0 && (
          <button
            type="button"
            onClick={onClearAll}
            className="text-xs font-medium text-[#6B6A64] hover:text-[#B91C1C] transition-colors whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] rounded-sm"
          >
            Limpar histórico
          </button>
        )}
      </div>

      {items.length === 0 ? (
        <div className="rounded-lg border border-dashed border-[#D9D9D4] bg-[#FAF9F7] px-6 py-8 text-center">
          <p className="text-sm font-medium text-[#141413]">
            Nenhum QR Code salvo ainda
          </p>
          <p className="mt-1 text-xs text-[#6B6A64]">
            Clique em “Salvar no histórico” no painel ao lado para guardar configurações recorrentes.
          </p>
        </div>
      ) : (
        <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <li
              key={item.id}
              className="flex items-center gap-3.5 rounded-lg border border-[#E4E4E0] bg-[#FAF9F7] p-3.5"
            >
              <div className="h-14 w-14 shrink-0 overflow-hidden rounded border border-[#E4E4E0] bg-white p-1">
                <QrCodeSvg
                  payload={item.payload}
                  style={{ ...item.style, margin: 1 }}
                  className="h-full w-full"
                />
              </div>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-semibold text-[#141413]">
                  {item.label}
                </p>
                <p className="mt-0.5 text-xs text-[#6B6A64] tabular-nums truncate">
                  {TYPE_LABELS[item.type]}
                  <span aria-hidden="true"> · </span>
                  {formatDatePtBr(item.createdAt)}
                </p>

                <div className="mt-2 flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => onLoadItem(item)}
                    aria-label={`Carregar ${item.label}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8] whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] rounded-sm"
                  >
                    <RotateCcw className="h-3 w-3" aria-hidden="true" />
                    <span>Carregar</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => onDeleteItem(item.id)}
                    aria-label={`Excluir ${item.label}`}
                    className="inline-flex items-center gap-1 text-xs font-medium text-[#6B6A64] hover:text-[#B91C1C] whitespace-nowrap focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] rounded-sm"
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
