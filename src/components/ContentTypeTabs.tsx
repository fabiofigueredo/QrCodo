import {
  FileText,
  Link2,
  Mail,
  MessageCircle,
  QrCode,
  UserSquare2,
  Wifi,
} from 'lucide-react';
import type { ComponentType } from 'react';
import type { QrContentType } from '../types/qr';

interface TypeOption {
  id: QrContentType;
  label: string;
  Icon: ComponentType<{ className?: string }>;
}

const TYPE_OPTIONS: TypeOption[] = [
  { id: 'url', label: 'URL', Icon: Link2 },
  { id: 'text', label: 'Texto', Icon: FileText },
  { id: 'wifi', label: 'Wi-Fi', Icon: Wifi },
  { id: 'pix', label: 'Pix', Icon: QrCode },
  { id: 'whatsapp', label: 'WhatsApp', Icon: MessageCircle },
  { id: 'email', label: 'E-mail', Icon: Mail },
  { id: 'vcard', label: 'Contato', Icon: UserSquare2 },
];

interface ContentTypeTabsProps {
  activeType: QrContentType;
  onChange: (type: QrContentType) => void;
}

export function ContentTypeTabs({ activeType, onChange }: ContentTypeTabsProps) {
  return (
    <div
      role="tablist"
      aria-label="Tipo de conteúdo do QR Code"
      className="grid grid-cols-3 gap-1 rounded-lg bg-[#F3F3F0] p-1 sm:grid-cols-7"
    >
      {TYPE_OPTIONS.map(({ id, label, Icon }) => {
        const isActive = activeType === id;
        return (
          <button
            key={id}
            type="button"
            role="tab"
            aria-selected={isActive}
            onClick={() => onChange(id)}
            className={`inline-flex items-center justify-center gap-1.5 rounded-md px-2 py-2 text-xs font-medium transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-[#2563EB] ${
              isActive
                ? 'bg-white text-[#141413] shadow-xs'
                : 'text-[#575651] hover:text-[#141413]'
            }`}
          >
            <Icon className="h-3.5 w-3.5 shrink-0" aria-hidden="true" />
            <span>{label}</span>
          </button>
        );
      })}
    </div>
  );
}
