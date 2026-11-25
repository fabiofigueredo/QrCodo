import { useEffect, useMemo, useState } from 'react';
import { ContentForm } from './components/ContentForm';
import { ContentTypeTabs } from './components/ContentTypeTabs';
import { HeaderBar } from './components/HeaderBar';
import { HistorySection } from './components/HistorySection';
import { QrPreviewStage } from './components/QrPreviewStage';
import { StyleControls } from './components/StyleControls';
import type { QrContentState, QrContentType, QrSavedItem, QrStyleState } from './types/qr';
import {
  buildQrPayload,
  createDefaultContentState,
  createDefaultStyleState,
} from './utils/qrPayload';

const HISTORY_STORAGE_KEY = 'traco-qr-history-v1';

function loadSavedHistory(): QrSavedItem[] {
  try {
    const raw = localStorage.getItem(HISTORY_STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export default function App() {
  const [content, setContent] = useState<QrContentState>(() => createDefaultContentState());
  const [style, setStyle] = useState<QrStyleState>(() => createDefaultStyleState());
  const [history, setHistory] = useState<QrSavedItem[]>(() => loadSavedHistory());
  const [feedback, setFeedback] = useState<string | null>(null);

  useEffect(() => {
    try {
      localStorage.setItem(HISTORY_STORAGE_KEY, JSON.stringify(history));
    } catch {
      // Ignore storage quota issues gracefully
    }
  }, [history]);

  useEffect(() => {
    if (!feedback) return;
    const timer = setTimeout(() => setFeedback(null), 3200);
    return () => clearTimeout(timer);
  }, [feedback]);

  const payloadResult = useMemo(() => buildQrPayload(content), [content]);

  function handleTypeChange(type: QrContentType) {
    setContent((prev) => ({ ...prev, type }));
  }

  function handleFillExample() {
    setContent((prev) => {
      switch (prev.type) {
        case 'url':
          return { ...prev, url: 'https://studiotraco.com.br/catalogo' };
        case 'text':
          return {
            ...prev,
            text: 'Cupom de 15% de desconto: BEMVINDO15 — válido até 31/12.',
          };
        case 'wifi':
          return {
            ...prev,
            wifi: {
              ssid: 'Estudio_Convidados',
              password: 'acesso-seguro-2026',
              encryption: 'WPA',
              hidden: false,
            },
          };
        case 'pix':
          return {
            ...prev,
            pix: {
              key: 'pagamentos@studiotraco.com.br',
              merchantName: 'Studio Traco Ltda',
              merchantCity: 'Sao Paulo',
              amount: '49,90',
              txid: 'PEDIDO104',
              description: 'Compra na loja',
            },
          };
        case 'whatsapp':
          return {
            ...prev,
            whatsapp: {
              phone: '5511999998888',
              message: 'Olá! Gostaria de falar com o atendimento.',
            },
          };
        case 'email':
          return {
            ...prev,
            email: {
              to: 'contato@studiotraco.com.br',
              subject: 'Solicitação de orçamento',
              body: 'Olá, gostaria de receber mais detalhes.',
            },
          };
        case 'vcard':
          return {
            ...prev,
            vcard: {
              firstName: 'Camila',
              lastName: 'Ferreira',
              phone: '+55 11 98888-7777',
              email: 'camila@studiotraco.com.br',
              organization: 'Studio Traço',
              role: 'Diretora de Design',
              website: 'https://studiotraco.com.br',
            },
          };
      }
    });
    setFeedback('Exemplo preenchido.');
  }

  function handleResetAll() {
    setContent(createDefaultContentState());
    setStyle(createDefaultStyleState());
    setFeedback('Configuração restaurada.');
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
    setHistory((prev) => [newItem, ...prev].slice(0, 12));
    setFeedback(`“${payloadResult.summaryLabel}” salvo no histórico.`);
  }

  function handleLoadHistoryItem(item: QrSavedItem) {
    setContent(structuredClone(item.content));
    setStyle(structuredClone(item.style));
    setFeedback(`“${item.label}” carregado.`);
  }

  function handleDeleteHistoryItem(id: string) {
    setHistory((prev) => prev.filter((item) => item.id !== id));
    setFeedback('Item removido do histórico.');
  }

  function handleClearHistory() {
    setHistory([]);
    setFeedback('Histórico limpo.');
  }

  return (
    <div id="topo" className="min-h-screen bg-[#F7F7F5] text-[#141413]">
      <HeaderBar onReset={handleResetAll} />

      <main className="mx-auto max-w-[1240px] px-4 py-8 sm:px-6 lg:px-8">
        <div className="mb-8 flex flex-col gap-3 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <h1 className="font-display text-3xl font-bold tracking-tight text-[#141413] sm:text-4xl">
              Gerador de QR Code vetorial
            </h1>
            <p className="mt-2 max-w-2xl text-sm sm:text-base text-[#575651]">
              Crie códigos para links, Wi-Fi, Pix, WhatsApp, e-mail e cartões de contato com personalização de formas, cores e logotipo.
            </p>
          </div>

          {feedback && (
            <div
              role="status"
              aria-live="polite"
              className="text-xs font-medium text-[#15803D] shrink-0"
            >
              {feedback}
            </div>
          )}
        </div>

        <div className="grid grid-cols-1 gap-6 lg:grid-cols-12 lg:gap-8 lg:items-start">
          <section
            id="conteudo"
            aria-labelledby="conteudo-titulo"
            className="rounded-xl border border-[#E4E4E0] bg-white p-6 lg:col-span-7 lg:col-start-1 lg:row-start-1"
          >
            <h2
              id="conteudo-titulo"
              className="font-display text-lg font-bold text-[#141413] mb-4"
            >
              01. Conteúdo do QR Code
            </h2>

            <ContentTypeTabs activeType={content.type} onChange={handleTypeChange} />

            <ContentForm
              content={content}
              onChange={setContent}
              onFillExample={handleFillExample}
            />

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
            aria-label="Painel de visualização e exportação"
            className="lg:col-span-5 lg:col-start-8 lg:row-start-1 lg:row-span-2 lg:sticky lg:top-6"
          >
            <QrPreviewStage
              payloadResult={payloadResult}
              style={style}
              onSaveToHistory={handleSaveToHistory}
              onFeedback={setFeedback}
            />
          </aside>

          <section
            id="aparencia"
            aria-labelledby="aparencia-titulo"
            className="rounded-xl border border-[#E4E4E0] bg-white p-6 lg:col-span-7 lg:col-start-1 lg:row-start-2"
          >
            <h2
              id="aparencia-titulo"
              className="font-display text-lg font-bold text-[#141413] mb-4"
            >
              02. Aparência e formato
            </h2>

            <StyleControls
              style={style}
              onChange={setStyle}
              onLogoUploadError={(msg) => setFeedback(msg)}
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
          <span>QRCodo — Geração local no navegador, sem envio de dados a servidores.</span>
          <a href="#topo" className="hover:text-[#141413] hover:underline underline-offset-4">
            Voltar ao topo
          </a>
        </div>
      </footer>
    </div>
  );
}
