interface HeaderBarProps {
  onReset: () => void;
}

export function HeaderBar({ onReset }: HeaderBarProps) {
  return (
    <header className="border-b border-[#E4E4E0] bg-white">
      <div className="mx-auto flex max-w-[1240px] items-center justify-between gap-8 px-4 py-4 sm:px-6 lg:px-8">
        <a
          href="#topo"
          className="font-display text-xl font-bold tracking-tight text-[#141413] whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-[#2563EB] rounded-sm"
        >
          QRCodo
        </a>

        <nav
          aria-label="Navegação principal"
          className="hidden md:flex items-center gap-6 text-sm font-medium text-[#575651]"
        >
          <a
            href="#conteudo"
            className="hover:text-[#141413] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Conteúdo
          </a>
          <a
            href="#aparencia"
            className="hover:text-[#141413] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Aparência
          </a>
          <a
            href="#visualizacao"
            className="hover:text-[#141413] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Visualização
          </a>
          <a
            href="#historico"
            className="hover:text-[#141413] hover:underline underline-offset-4 transition-colors whitespace-nowrap shrink-0"
          >
            Histórico
          </a>
        </nav>

        <div className="flex items-center shrink-0">
          <button
            type="button"
            onClick={onReset}
            className="rounded-lg border border-[#E4E4E0] bg-white px-4 py-2 text-sm font-medium text-[#141413] hover:bg-[#F7F7F5] transition-colors whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
          >
            Novo QR Code
          </button>
        </div>
      </div>
    </header>
  );
}
