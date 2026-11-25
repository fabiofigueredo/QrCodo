import {
  FileText,
  Link2,
  Mail,
  MessageCircle,
  QrCode,
  UserSquare2,
  Wifi,
} from 'lucide-react';
import { useRef, type ComponentType, type KeyboardEvent } from 'react';
import type { QrContentType } from '../types/qr';

interface TypeOption {
  id: QrContentType;
  label: string;
  Icon: ComponentType<{ className?: string }>;
}

export const TYPE_OPTIONS: TypeOption[] = [
  { id: 'url', label: 'URL', Icon: Link2 },
  { id: 'text', label: 'Texto', Icon: FileText },
  { id: 'wifi', label: 'Wi-Fi', Icon: Wifi },
  { id: 'pix', label: 'Pix', Icon: QrCode },
  { id: 'whatsapp', label: 'WhatsApp', Icon: MessageCircle },
  { id: 'email', label: 'E-mail', Icon: Mail },
  { id: 'vcard', label: 'Contato', Icon: UserSquare2 },
];

export const CONTENT_PANEL_ID = 'qr-content-panel';

interface ContentTypeTabsProps {
  activeType: QrContentType;
  onChange: (type: QrContentType) => void;
}

export function ContentTypeTabs({ activeType, onChange }: ContentTypeTabsProps) {
  const tabRefs = useRef<Array<HTMLButtonElement | null>>([]);

  function focusAndSelect(index: number) {
    const total = TYPE_OPTIONS.length;
    const next = (index + total) % total;
    onChange(TYPE_OPTIONS[next].id);
    tabRefs.current[next]?.focus();
  }

  function handleKeyDown(e: KeyboardEvent<HTMLButtonElement>, index: number) {
    switch (e.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        e.preventDefault();
        focusAndSelect(index + 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        e.preventDefault();
        focusAndSelect(index - 1);
        break;
      case 'Home':
        e.preventDefault();
        focusAndSelect(0);
        break;
      case 'End':
        e.preventDefault();
        focusAndSelect(TYPE_OPTIONS.length - 1);
        break;
    }
  }

  return (
    <div
      role="tablist"
      aria-label="Tipo de conteúdo do QR Code"
      className="grid grid-cols-4 gap-1 rounded-xl bg-[#F3F3F0] p-1 sm:grid-cols-7"
    >
      {TYPE_OPTIONS.map(({ id, label, Icon }, index) => {
        const isActive = activeType === id;
        return (
          <button
            key={id}
            ref={(el) => {
              tabRefs.current[index] = el;
            }}
            id={`qr-tab-${id}`}
            type="button"
            role="tab"
            aria-selected={isActive}
            aria-controls={CONTENT_PANEL_ID}
            tabIndex={isActive ? 0 : -1}
            onClick={() => onChange(id)}
            onKeyDown={(e) => handleKeyDown(e, index)}
            className={`flex min-h-11 flex-col items-center justify-center gap-1 rounded-lg px-1.5 py-2 text-[11px] font-medium transition-all sm:text-xs focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#2563EB] ${
              isActive
                ? 'bg-white text-[#1D4ED8] shadow-sm ring-1 ring-black/5'
                : 'text-[#575651] hover:bg-white/60 hover:text-[#141413]'
            }`}
          >
            <Icon className="h-4 w-4 shrink-0" aria-hidden="true" />
            <span className="whitespace-nowrap">{label}</span>
          </button>
        );
      })}
    </div>
  );
}
