import { Eye, EyeOff, Sparkles } from 'lucide-react';
import { useId, useState, type Dispatch, type ReactNode, type SetStateAction } from 'react';
import type {
  QrContentState,
  QrEmailData,
  QrPixData,
  QrVcardData,
  QrWhatsappData,
  QrWifiData,
} from '../types/qr';
import { CONTENT_PANEL_ID } from './ContentTypeTabs';

interface ContentFormProps {
  content: QrContentState;
  onChange: Dispatch<SetStateAction<QrContentState>>;
  onFillExample: () => void;
}

export const inputBaseClass =
  'w-full rounded-lg border border-[#D9D9D4] bg-white px-3.5 py-2.5 text-sm text-[#141413] placeholder:text-[#8A8982] focus:border-[#2563EB] focus:outline-none focus:ring-4 focus:ring-[#2563EB]/15 transition-colors';

const labelBaseClass = 'mb-1.5 flex items-baseline gap-1.5 text-sm font-medium text-[#141413]';

interface FieldProps {
  label: string;
  hint?: ReactNode;
  required?: boolean;
  optional?: boolean;
  className?: string;
  children: (id: string, hintId: string | undefined) => ReactNode;
}

function Field({ label, hint, required, optional, className, children }: FieldProps) {
  const id = useId();
  const hintId = hint ? `${id}-hint` : undefined;
  return (
    <div className={className}>
      <label htmlFor={id} className={labelBaseClass}>
        <span>{label}</span>
        {required && (
          <span className="text-[#B91C1C]" aria-hidden="true">
            *
          </span>
        )}
        {optional && <span className="text-xs font-normal text-[#8A8982]">opcional</span>}
      </label>
      {children(id, hintId)}
      {hint && (
        <p id={hintId} className="mt-1.5 text-xs leading-relaxed text-[#6B6A64]">
          {hint}
        </p>
      )}
    </div>
  );
}

export function ContentForm({ content, onChange, onFillExample }: ContentFormProps) {
  const [showWifiPassword, setShowWifiPassword] = useState(false);

  // Atualizadores funcionais: evitam sobrescrever alterações concorrentes.
  const setUrl = (url: string) => onChange((prev) => ({ ...prev, url }));
  const setText = (text: string) => onChange((prev) => ({ ...prev, text }));
  const setWifi = (patch: Partial<QrWifiData>) =>
    onChange((prev) => ({ ...prev, wifi: { ...prev.wifi, ...patch } }));
  const setPix = (patch: Partial<QrPixData>) =>
    onChange((prev) => ({ ...prev, pix: { ...prev.pix, ...patch } }));
  const setWhatsapp = (patch: Partial<QrWhatsappData>) =>
    onChange((prev) => ({ ...prev, whatsapp: { ...prev.whatsapp, ...patch } }));
  const setEmail = (patch: Partial<QrEmailData>) =>
    onChange((prev) => ({ ...prev, email: { ...prev.email, ...patch } }));
  const setVcard = (patch: Partial<QrVcardData>) =>
    onChange((prev) => ({ ...prev, vcard: { ...prev.vcard, ...patch } }));

  return (
    <div
      id={CONTENT_PANEL_ID}
      role="tabpanel"
      aria-labelledby={`qr-tab-${content.type}`}
      className="mt-5 space-y-4"
    >
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-[#6B6A64]">
          O QR Code atualiza enquanto você digita.{' '}
          <span className="text-[#B91C1C]" aria-hidden="true">
            *
          </span>{' '}
          campo obrigatório
        </p>
        <button
          type="button"
          onClick={onFillExample}
          className="inline-flex shrink-0 items-center gap-1.5 rounded-md px-2 py-1 text-xs font-medium whitespace-nowrap text-[#2563EB] hover:bg-[#2563EB]/5 hover:text-[#1D4ED8] focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB]"
        >
          <Sparkles className="h-3.5 w-3.5" aria-hidden="true" />
          Preencher exemplo
        </button>
      </div>

      {content.type === 'url' && (
        <Field
          label="Endereço do site (URL)"
          required
          hint="Links sem protocolo recebem https:// automaticamente."
        >
          {(id, hintId) => (
            <input
              id={id}
              type="url"
              inputMode="url"
              autoComplete="url"
              aria-describedby={hintId}
              value={content.url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="https://seusite.com.br"
              className={inputBaseClass}
            />
          )}
        </Field>
      )}

      {content.type === 'text' && (
        <Field
          label="Texto livre"
          required
          hint={
            <span className="flex justify-between gap-4">
              <span>Textos curtos geram códigos mais simples e fáceis de ler.</span>
              <span className="tabular-nums">{content.text.length} caracteres</span>
            </span>
          }
        >
          {(id, hintId) => (
            <textarea
              id={id}
              rows={4}
              aria-describedby={hintId}
              value={content.text}
              onChange={(e) => setText(e.target.value)}
              placeholder="Digite uma mensagem, código de rastreio, cupom ou instrução..."
              className={`${inputBaseClass} resize-y`}
            />
          )}
        </Field>
      )}

      {content.type === 'wifi' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Nome da rede (SSID)" required>
            {(id) => (
              <input
                id={id}
                type="text"
                autoComplete="off"
                spellCheck={false}
                value={content.wifi.ssid}
                onChange={(e) => setWifi({ ssid: e.target.value })}
                placeholder="MinhaRede_5G"
                className={inputBaseClass}
              />
            )}
          </Field>

          <Field label="Segurança">
            {(id) => (
              <select
                id={id}
                value={content.wifi.encryption}
                onChange={(e) =>
                  setWifi({ encryption: e.target.value as QrWifiData['encryption'] })
                }
                className={inputBaseClass}
              >
                <option value="WPA">WPA / WPA2 / WPA3</option>
                <option value="WEP">WEP (antigo)</option>
                <option value="nopass">Aberta (sem senha)</option>
              </select>
            )}
          </Field>

          {content.wifi.encryption !== 'nopass' && (
            <Field
              label="Senha do Wi-Fi"
              required
              className="sm:col-span-2"
              hint="A senha fica gravada no código. Qualquer pessoa que escanear poderá se conectar."
            >
              {(id, hintId) => (
                <div className="relative">
                  <input
                    id={id}
                    type={showWifiPassword ? 'text' : 'password'}
                    autoComplete="off"
                    spellCheck={false}
                    aria-describedby={hintId}
                    value={content.wifi.password}
                    onChange={(e) => setWifi({ password: e.target.value })}
                    placeholder="Digite a senha da rede"
                    className={`${inputBaseClass} pr-11 font-mono`}
                  />
                  <button
                    type="button"
                    onClick={() => setShowWifiPassword((v) => !v)}
                    aria-label={showWifiPassword ? 'Ocultar senha' : 'Mostrar senha'}
                    aria-pressed={showWifiPassword}
                    className="absolute inset-y-0 right-0 flex w-11 items-center justify-center rounded-r-lg text-[#6B6A64] hover:text-[#141413] focus-visible:outline-2 focus-visible:outline-[#2563EB]"
                  >
                    {showWifiPassword ? (
                      <EyeOff className="h-4 w-4" aria-hidden="true" />
                    ) : (
                      <Eye className="h-4 w-4" aria-hidden="true" />
                    )}
                  </button>
                </div>
              )}
            </Field>
          )}

          <div className="sm:col-span-2">
            <label className="inline-flex items-center gap-2.5 text-sm text-[#141413]">
              <input
                type="checkbox"
                checked={content.wifi.hidden}
                onChange={(e) => setWifi({ hidden: e.target.checked })}
                className="h-4 w-4 rounded border-[#D9D9D4] accent-[#2563EB]"
              />
              <span>Rede oculta (SSID não visível)</span>
            </label>
          </div>
        </div>
      )}

      {content.type === 'pix' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field
            label="Chave Pix"
            required
            className="sm:col-span-2"
            hint="CPF/CNPJ podem ter pontuação (é removida). Telefone no formato +5511999999999."
          >
            {(id, hintId) => (
              <input
                id={id}
                type="text"
                autoComplete="off"
                spellCheck={false}
                aria-describedby={hintId}
                value={content.pix.key}
                onChange={(e) => setPix({ key: e.target.value })}
                placeholder="CPF, CNPJ, e-mail, telefone ou chave aleatória"
                className={inputBaseClass}
              />
            )}
          </Field>

          <Field label="Nome do recebedor" required>
            {(id) => (
              <input
                id={id}
                type="text"
                maxLength={25}
                value={content.pix.merchantName}
                onChange={(e) => setPix({ merchantName: e.target.value })}
                placeholder="Maria Silva"
                className={inputBaseClass}
              />
            )}
          </Field>

          <Field label="Cidade" required>
            {(id) => (
              <input
                id={id}
                type="text"
                maxLength={15}
                value={content.pix.merchantCity}
                onChange={(e) => setPix({ merchantCity: e.target.value })}
                placeholder="Sao Paulo"
                className={inputBaseClass}
              />
            )}
          </Field>

          <Field label="Valor (R$)" optional hint="Em branco, o pagador digita o valor.">
            {(id, hintId) => (
              <input
                id={id}
                type="text"
                inputMode="decimal"
                aria-describedby={hintId}
                value={content.pix.amount}
                onChange={(e) => setPix({ amount: e.target.value })}
                placeholder="49,90"
                className={`${inputBaseClass} tabular-nums`}
              />
            )}
          </Field>

          <Field label="Identificador (TxID)" optional hint="Apenas letras e números. *** = sem ID.">
            {(id, hintId) => (
              <input
                id={id}
                type="text"
                maxLength={25}
                spellCheck={false}
                aria-describedby={hintId}
                value={content.pix.txid}
                onChange={(e) => setPix({ txid: e.target.value })}
                placeholder="***"
                className={`${inputBaseClass} font-mono`}
              />
            )}
          </Field>

          <Field label="Descrição" optional className="sm:col-span-2">
            {(id) => (
              <input
                id={id}
                type="text"
                maxLength={40}
                value={content.pix.description}
                onChange={(e) => setPix({ description: e.target.value })}
                placeholder="Pagamento pedido 104"
                className={inputBaseClass}
              />
            )}
          </Field>

          <p className="sm:col-span-2 rounded-lg border border-[#DBEAFE] bg-[#EFF6FF] px-3.5 py-2.5 text-xs leading-relaxed text-[#1E3A8A]">
            Antes de imprimir, faça um pagamento de teste com o app do seu banco para conferir
            nome, chave e valor.
          </p>
        </div>
      )}

      {content.type === 'whatsapp' && (
        <div className="space-y-4">
          <Field
            label="Número com código do país e DDD"
            required
            hint="Ex.: 55 (Brasil) + 11 (DDD) + número. Espaços e traços são ignorados."
          >
            {(id, hintId) => (
              <input
                id={id}
                type="tel"
                autoComplete="tel"
                aria-describedby={hintId}
                value={content.whatsapp.phone}
                onChange={(e) => setWhatsapp({ phone: e.target.value })}
                placeholder="55 11 99999-9999"
                className={`${inputBaseClass} tabular-nums`}
              />
            )}
          </Field>

          <Field label="Mensagem inicial" optional>
            {(id) => (
              <textarea
                id={id}
                rows={3}
                value={content.whatsapp.message}
                onChange={(e) => setWhatsapp({ message: e.target.value })}
                placeholder="Olá! Gostaria de saber mais informações."
                className={`${inputBaseClass} resize-y`}
              />
            )}
          </Field>
        </div>
      )}

      {content.type === 'email' && (
        <div className="space-y-4">
          <Field label="Destinatário" required>
            {(id) => (
              <input
                id={id}
                type="email"
                autoComplete="email"
                value={content.email.to}
                onChange={(e) => setEmail({ to: e.target.value })}
                placeholder="contato@suaempresa.com.br"
                className={inputBaseClass}
              />
            )}
          </Field>

          <Field label="Assunto" optional>
            {(id) => (
              <input
                id={id}
                type="text"
                value={content.email.subject}
                onChange={(e) => setEmail({ subject: e.target.value })}
                placeholder="Solicitação de orçamento"
                className={inputBaseClass}
              />
            )}
          </Field>

          <Field label="Corpo do e-mail" optional>
            {(id) => (
              <textarea
                id={id}
                rows={3}
                value={content.email.body}
                onChange={(e) => setEmail({ body: e.target.value })}
                placeholder="Olá, gostaria de agendar uma conversa..."
                className={`${inputBaseClass} resize-y`}
              />
            )}
          </Field>
        </div>
      )}

      {content.type === 'vcard' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Nome" required>
            {(id) => (
              <input
                id={id}
                type="text"
                autoComplete="given-name"
                value={content.vcard.firstName}
                onChange={(e) => setVcard({ firstName: e.target.value })}
                placeholder="Camila"
                className={inputBaseClass}
              />
            )}
          </Field>
          <Field label="Sobrenome">
            {(id) => (
              <input
                id={id}
                type="text"
                autoComplete="family-name"
                value={content.vcard.lastName}
                onChange={(e) => setVcard({ lastName: e.target.value })}
                placeholder="Ferreira"
                className={inputBaseClass}
              />
            )}
          </Field>
          <Field label="Telefone" optional>
            {(id) => (
              <input
                id={id}
                type="tel"
                autoComplete="tel"
                value={content.vcard.phone}
                onChange={(e) => setVcard({ phone: e.target.value })}
                placeholder="+55 11 98888-7777"
                className={inputBaseClass}
              />
            )}
          </Field>
          <Field label="E-mail" optional>
            {(id) => (
              <input
                id={id}
                type="email"
                autoComplete="email"
                value={content.vcard.email}
                onChange={(e) => setVcard({ email: e.target.value })}
                placeholder="camila@estudio.com.br"
                className={inputBaseClass}
              />
            )}
          </Field>
          <Field label="Empresa" optional>
            {(id) => (
              <input
                id={id}
                type="text"
                autoComplete="organization"
                value={content.vcard.organization}
                onChange={(e) => setVcard({ organization: e.target.value })}
                placeholder="Estúdio Horizonte"
                className={inputBaseClass}
              />
            )}
          </Field>
          <Field label="Cargo" optional>
            {(id) => (
              <input
                id={id}
                type="text"
                autoComplete="organization-title"
                value={content.vcard.role}
                onChange={(e) => setVcard({ role: e.target.value })}
                placeholder="Diretora de Design"
                className={inputBaseClass}
              />
            )}
          </Field>
          <Field label="Site" optional className="sm:col-span-2">
            {(id) => (
              <input
                id={id}
                type="url"
                inputMode="url"
                autoComplete="url"
                value={content.vcard.website}
                onChange={(e) => setVcard({ website: e.target.value })}
                placeholder="https://estudiohorizonte.com.br"
                className={inputBaseClass}
              />
            )}
          </Field>
        </div>
      )}
    </div>
  );
}
