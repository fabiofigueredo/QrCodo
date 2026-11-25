import { Lock, Palette, Download, PenLine } from 'lucide-react';
import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { ContentForm } from './components/ContentForm';
import { ContentTypeTabs } from './components/ContentTypeTabs';
import { HeaderBar } from './components/HeaderBar';
import { HistorySection } from './components/HistorySection';
import { QrPreviewStage } from './components/QrPreviewStage';
import { StyleControls } from './components/StyleControls';
import { Toast, type FeedbackMessage, type FeedbackTone } from './components/Toast';
import type { QrContentState, QrContentType, QrSavedItem, QrStyleState } from './types/qr';
import { HISTORY_LIMIT, loadHistory, saveHistory } from './utils/history';
import {
  buildQrPayload,
  createDefaultContentState,
  createDefaultStyleState,
} from './utils/qrPayload';

const EXAMPLES: { [K in QrContentType]: (prev: QrContentState) => QrContentState } = {
  url: (prev) => ({ ...prev, url: 'https://exemplo.com.br/catalogo' }),
  text: (prev) => ({
    ...prev,
    text: 'Cupom de 15% de desconto: BEMVINDO15 — válido até 31/12.',
  }),
  wifi: (prev) => ({
    ...prev,
    wifi: { ssid: 'Estudio_Convidados', password: 'acesso-seguro-2026', encryption: 'WPA', hidden: false },
  }),
  pix: (prev) => ({
    ...prev,
    pix: {
      key: 'pagamentos@exemplo.com.br',
      merchantName: 'Loja Exemplo Ltda',
      merchantCity: 'Sao Paulo',
      amount: '49,90',
      txid: 'PEDIDO104',
      description: 'Compra na loja',
    },
  }),
  whatsapp: (prev) => ({
    ...prev,
    whatsapp: { phone: '5511999998888', message: 'Olá! Gostaria de falar com o atendimento.' },
  }),
  email: (prev) => ({
    ...prev,
    email: {
      to: 'contato@exemplo.com.br',
      subject: 'Solicitação de orçamento',
      body: 'Olá, gostaria de receber mais detalhes.',
    },
  }),
  vcard: (prev) => ({
    ...prev,
    vcard: {
      firstName: 'Camila',
      lastName: 'Ferreira',
      phone: '+55 11 98888-7777',
      email: 'camila@exemplo.com.br',
      organization: 'Estúdio Exemplo',
      role: 'Diretora de Design',
      website: 'https://exemplo.com.br',
    },
  }),
};

const STEPS = [
  { icon: PenLine, title: 'Conteúdo', text: 'Escolha o tipo e preencha os dados.' },
  { icon: Palette, title: 'Aparência', text: 'Cores, formatos e logotipo.' },
  { icon: Download, title: 'Exportar', text: 'PNG em alta resolução ou SVG vetorial.' },
];

export default function App() {
  const [content, setContent] = useState<QrContentState>(() => createDefaultContentState());
  const [style, setStyle] = useState<QrStyleState>(() => createDefaultStyleState());
  const [history, setHistory] = useState<QrSavedItem[]>(() => loadHistory());
  const [feedback, setFeedback] = useState<FeedbackMessage | null>(null);
  const feedbackSeq = useRef(0);
  const isFirstHistoryRender = useRef(true);

  const notify = useCallback((message: string, tone: FeedbackTone = 'success') => {
    feedbackSeq.current += 1;
    setFeedback({ id: feedbackSeq.current, message, tone });
  }, []);

  useEffect(() => {
    if (isFirstHistoryRender.current) {
      isFirstHistoryRender.current = false;
      return;
    }
    if (!saveHistory(history)) {
      notify(
        'Não há espaço no navegador para salvar o histórico. Exclua itens antigos ou remova logotipos.',
        'error'
      );
    }
  }, [history, notify]);

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), feedback.tone === 'error' ? 6000 : 3200);
    return () => clearTimeout(timer);
  }, [feedback]);

  const payloadResult = useMemo(() => buildQrPayload(content), [content]);

  function handleTypeChange(type: QrContentType) {
    setContent((prev) => ({ ...prev, type }));
  }

  function handleFillExample() {
    setContent((prev) => EXAMPLES[prev.type](prev));
    notify('Exemplo preenchido.', 'info');
  }

  function handleResetAll() {
    setContent(createDefaultContentState());
    setStyle(createDefaultStyleState());
    notify('Pronto para um novo QR Code.', 'info');
    document.getElementById('conteudo')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleSaveToHistory() {
    if (!payloadResult.valid) return;
    const newItem: QrSavedItem = {
      id: `${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      label: payloadResult.summaryLabel,
      type: content.type,
      payload: payloadResult.payload,
      content: structuredClone(content),
      style: structuredClone(style),
      createdAt: new Date().toISOString(),
    };
    const styleKey = JSON.stringify(style);
    setHistory((prev) =>
      [
        newItem,
        // Evita duplicatas: o mesmo conteúdo com o mesmo estilo sobe para o topo.
        ...prev.filter(
          (item) => !(item.payload === newItem.payload && JSON.stringify(item.style) === styleKey)
        ),
      ].slice(0, HISTORY_LIMIT)
    );
    notify(`“${payloadResult.summaryLabel}” salvo no histórico.`);
  }

  function handleLoadHistoryItem(item: QrSavedItem) {
    setContent(structuredClone(item.content));
    setStyle(structuredClone(item.style));
    notify(`“${item.label}” carregado.`, 'info');
    document.getElementById('conteudo')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
  }

  function handleDeleteHistoryItem(id: string) {
    setHistory((prev) => prev.filter((item) => item.id !== id));
    notify('Item removido do histórico.', 'info');
  }

  function handleClearHistory() {
    setHistory([]);
    notify('Histórico limpo.', 'info');
  }

  return (
    <div id="topo" className="min-h-screen bg-[#F7F7F5] text-[#141413]">
      <a
        href="#conteudo"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:left-2 focus:z-50 focus:rounded-md focus:bg-white focus:px-3 focus:py-2 focus:text-sm focus:shadow"
      >
        Pular para o conteúdo
      </a>

      <HeaderBar onReset={handleResetAll} />

      <main className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 grid gap-6 lg:grid-cols-12 lg:items-end">
          <div className="lg:col-span-7">
            <p className="mb-2 inline-flex items-center gap-1.5 rounded-full border border-[#E4E4E0] bg-white px-2.5 py-1 text-xs font-medium text-[#575651]">
              <Lock className="h-3 w-3" aria-hidden="true" />
              100% no navegador · sem cadastro
            </p>
            <h1 className="font-display text-3xl font-bold tracking-tight text-[#141413] sm:text-4xl">
              Gerador de QR Code vetorial
            </h1>
            <p className="mt-2 max-w-2xl text-sm text-[#575651] sm:text-base">
              Crie códigos para links, Wi-Fi, Pix, WhatsApp, e-mail e cartões de contato, com
              formas, cores e logotipo personalizados.
            </p>
          </div>

          <ol className="grid grid-cols-3 gap-2 lg:col-span-5">
            {STEPS.map(({ icon: Icon, title, text }, index) => (
              <li
                key={title}
                className="rounded-xl border border-[#E4E4E0] bg-white/70 p-3"
              >
                <div className="mb-1 flex items-center gap-1.5 text-xs font-semibold text-[#141413]">
                  <span className="flex h-5 w-5 items-center justify-center rounded-full bg-[#2563EB]/10 text-[10px] font-bold text-[#1D4ED8] tabular-nums">
                    {index + 1}
                  </span>
                  <Icon className="h-3.5 w-3.5 text-[#575651]" aria-hidden="true" />
                  {title}
                </div>
                <p className="hidden text-[11px] leading-snug text-[#6B6A64] sm:block">{text}</p>
              </li>
            ))}
          </ol>
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:items-start lg:gap-8">
          <section
            id="conteudo"
            aria-labelledby="conteudo-titulo"
            className="scroll-mt-20 rounded-2xl border border-[#E4E4E0] bg-white p-5 shadow-[0_1px_2px_rgba(20,20,19,0.04)] sm:p-6 lg:col-span-7 lg:col-start-1 lg:row-start-1"
          >
            <h2 id="conteudo-titulo" className="mb-4 font-display text-lg font-bold text-[#141413]">
              <span className="mr-1.5 text-[#2563EB] tabular-nums">01</span>
              Conteúdo do QR Code
            </h2>

            <ContentTypeTabs activeType={content.type} onChange={handleTypeChange} />

            <ContentForm content={content} onChange={setContent} onFillExample={handleFillExample} />

            {!payloadResult.valid && payloadResult.error && (
              <p
                role="alert"
                className="mt-4 rounded-lg border border-[#FCA5A5] bg-[#FEF2F2] px-3.5 py-2.5 text-xs font-medium text-[#B91C1C]"
              >
                {payloadResult.error}
              </p>
            )}
          </section>

          <aside
            id="visualizacao"
            aria-label="Visualização e exportação"
            className="scroll-mt-20 lg:sticky lg:top-20 lg:col-span-5 lg:col-start-8 lg:row-span-2 lg:row-start-1"
          >
            <QrPreviewStage
              payloadResult={payloadResult}
              style={style}
              onSaveToHistory={handleSaveToHistory}
              onFeedback={notify}
            />
          </aside>

          <section
            id="aparencia"
            aria-labelledby="aparencia-titulo"
            className="scroll-mt-20 rounded-2xl border border-[#E4E4E0] bg-white p-5 shadow-[0_1px_2px_rgba(20,20,19,0.04)] sm:p-6 lg:col-span-7 lg:col-start-1 lg:row-start-2"
          >
            <h2 id="aparencia-titulo" className="mb-4 font-display text-lg font-bold text-[#141413]">
              <span className="mr-1.5 text-[#2563EB] tabular-nums">02</span>
              Aparência e formato
            </h2>

            <StyleControls
              style={style}
              onChange={setStyle}
              onLogoUploadError={(msg) => notify(msg, 'error')}
            />
          </section>
        </div>

        <HistorySection
          items={history}
          onLoadItem={handleLoadHistoryItem}
          onDeleteItem={handleDeleteHistoryItem}
          onClearAll={handleClearHistory}
        />
      </main>

      <footer className="mt-12 border-t border-[#E4E4E0] bg-white">
        <div className="mx-auto flex max-w-[1240px] flex-wrap items-center justify-between gap-4 px-4 py-5 text-xs text-[#6B6A64] sm:px-6 lg:px-8">
          <span>QRCodo — geração local no navegador, sem envio de dados a servidores.</span>
          <a
            href="#topo"
            className="rounded-sm underline-offset-4 hover:text-[#141413] hover:underline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
          >
            Voltar ao topo
          </a>
        </div>
      </footer>

      <Toast feedback={feedback} onDismiss={() => setFeedback(null)} />
    </div>
  );
}
