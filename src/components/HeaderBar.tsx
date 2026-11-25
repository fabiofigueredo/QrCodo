import { Plus, QrCode } from 'lucide-react';

interface HeaderBarProps {
  onReset: () => void;
}

const NAV_LINKS = [
  { href: '#conteudo', label: 'Conteúdo' },
  { href: '#aparencia', label: 'Aparência' },
  { href: '#visualizacao', label: 'Exportar' },
  { href: '#historico', label: 'Histórico' },
];

export function HeaderBar({ onReset }: HeaderBarProps) {
  return (
    <header className="sticky top-0 z-40 border-b border-[#E4E4E0] bg-white/85 backdrop-blur supports-[backdrop-filter]:bg-white/75">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-6 px-4 py-3 sm:px-6 lg:px-8">
        <a
          href="#topo"
          className="flex shrink-0 items-center gap-2 rounded-md font-display text-xl font-bold tracking-tight whitespace-nowrap text-[#141413] focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2563EB]"
        >
          <span
            aria-hidden="true"
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-[#141413] text-white"
          >
            <QrCode className="h-4.5 w-4.5" />
          </span>
          QRCodo
        </a>

        <nav
          aria-label="Navegação principal"
          className="hidden items-center gap-1 text-sm font-medium text-[#575651] md:flex"
        >
          {NAV_LINKS.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className="rounded-md px-3 py-1.5 whitespace-nowrap transition-colors hover:bg-[#F3F3F0] hover:text-[#141413] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
            >
              {link.label}
            </a>
          ))}
        </nav>

        <button
          type="button"
          onClick={onReset}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-lg border border-[#E4E4E0] bg-white px-3.5 py-2 text-sm font-medium whitespace-nowrap text-[#141413] transition-colors hover:bg-[#F7F7F5] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
          Novo QR Code
        </button>
      </div>
    </header>
  );
}
