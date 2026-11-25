import type { QrContentState } from '../types/qr';

interface ContentFormProps {
  content: QrContentState;
  onChange: (next: QrContentState) => void;
  onFillExample: () => void;
}

const inputBaseClass =
  'w-full rounded-lg border border-[#D9D9D4] bg-white px-3.5 py-2.5 text-sm text-[#141413] placeholder:text-[#8A8982] focus:border-[#2563EB] focus:outline-2 focus:outline-[#2563EB]/20 transition-colors';

const labelBaseClass = 'block text-sm font-medium text-[#141413] mb-1.5';

export function ContentForm({ content, onChange, onFillExample }: ContentFormProps) {
  return (
    <div className="mt-5 space-y-4">
      <div className="flex items-center justify-between gap-4">
        <p className="text-xs text-[#6B6A64]">
          Preencha os campos abaixo; o QR Code atualiza instantaneamente.
        </p>
        <button
          type="button"
          onClick={onFillExample}
          className="text-xs font-medium text-[#2563EB] hover:text-[#1D4ED8] hover:underline underline-offset-4 whitespace-nowrap shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[#2563EB] rounded-sm"
        >
          Preencher exemplo
        </button>
      </div>

      {content.type === 'url' && (
        <div>
          <label htmlFor="qr-url-input" className={labelBaseClass}>
            Endereço do site (URL)
          </label>
          <input
            id="qr-url-input"
            type="url"
            value={content.url}
            onChange={(e) => onChange({ ...content, url: e.target.value })}
            placeholder="https://seusite.com.br"
            className={inputBaseClass}
          />
          <p className="mt-1.5 text-xs text-[#6B6A64]">
            Links sem protocolo recebem https:// automaticamente.
          </p>
        </div>
      )}

      {content.type === 'text' && (
        <div>
          <label htmlFor="qr-text-input" className={labelBaseClass}>
            Texto livre
          </label>
          <textarea
            id="qr-text-input"
            rows={4}
            value={content.text}
            onChange={(e) => onChange({ ...content, text: e.target.value })}
            placeholder="Digite uma mensagem, código de rastreio, cupom ou instrução..."
            className={inputBaseClass}
          />
          <div className="mt-1.5 flex justify-end text-xs text-[#6B6A64] tabular-nums">
            {content.text.length} caracteres
          </div>
        </div>
      )}

      {content.type === 'wifi' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="qr-wifi-ssid" className={labelBaseClass}>
              Nome da rede (SSID)
            </label>
            <input
              id="qr-wifi-ssid"
              type="text"
              value={content.wifi.ssid}
              onChange={(e) =>
                onChange({ ...content, wifi: { ...content.wifi, ssid: e.target.value } })
              }
              placeholder="MinhaRede_5G"
              className={inputBaseClass}
            />
          </div>

          <div>
            <label htmlFor="qr-wifi-enc" className={labelBaseClass}>
              Segurança
            </label>
            <select
              id="qr-wifi-enc"
              value={content.wifi.encryption}
              onChange={(e) =>
                onChange({
                  ...content,
                  wifi: {
                    ...content.wifi,
                    encryption: e.target.value as QrContentState['wifi']['encryption'],
                  },
                })
              }
              className={inputBaseClass}
            >
              <option value="WPA">WPA / WPA2 / WPA3</option>
              <option value="WEP">WEP</option>
              <option value="nopass">Aberta (sem senha)</option>
            </select>
          </div>

          {content.wifi.encryption !== 'nopass' && (
            <div className="sm:col-span-2">
              <label htmlFor="qr-wifi-pass" className={labelBaseClass}>
                Senha do Wi-Fi
              </label>
              <input
                id="qr-wifi-pass"
                type="text"
                value={content.wifi.password}
                onChange={(e) =>
                  onChange({
                    ...content,
                    wifi: { ...content.wifi, password: e.target.value },
                  })
                }
                placeholder="Digite a senha da rede"
                className={inputBaseClass}
              />
            </div>
          )}

          <div className="sm:col-span-2">
            <label className="inline-flex items-center gap-2.5 text-sm text-[#141413]">
              <input
                type="checkbox"
                checked={content.wifi.hidden}
                onChange={(e) =>
                  onChange({
                    ...content,
                    wifi: { ...content.wifi, hidden: e.target.checked },
                  })
                }
                className="h-4 w-4 rounded border-[#D9D9D4] accent-[#2563EB]"
              />
              <span>Rede oculta (SSID não visível)</span>
            </label>
          </div>
        </div>
      )}

      {content.type === 'pix' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div className="sm:col-span-2">
            <label htmlFor="qr-pix-key" className={labelBaseClass}>
              Chave Pix
            </label>
            <input
              id="qr-pix-key"
              type="text"
              value={content.pix.key}
              onChange={(e) =>
                onChange({ ...content, pix: { ...content.pix, key: e.target.value } })
              }
              placeholder="CPF, CNPJ, e-mail, +5511999999999 ou chave aleatória"
              className={inputBaseClass}
            />
          </div>

          <div>
            <label htmlFor="qr-pix-name" className={labelBaseClass}>
              Nome do recebedor
            </label>
            <input
              id="qr-pix-name"
              type="text"
              maxLength={25}
              value={content.pix.merchantName}
              onChange={(e) =>
                onChange({
                  ...content,
                  pix: { ...content.pix, merchantName: e.target.value },
                })
              }
              placeholder="Maria Silva"
              className={inputBaseClass}
            />
          </div>

          <div>
            <label htmlFor="qr-pix-city" className={labelBaseClass}>
              Cidade
            </label>
            <input
              id="qr-pix-city"
              type="text"
              maxLength={15}
              value={content.pix.merchantCity}
              onChange={(e) =>
                onChange({
                  ...content,
                  pix: { ...content.pix, merchantCity: e.target.value },
                })
              }
              placeholder="Sao Paulo"
              className={inputBaseClass}
            />
          </div>

          <div>
            <label htmlFor="qr-pix-amount" className={labelBaseClass}>
              Valor (R$) — opcional
            </label>
            <input
              id="qr-pix-amount"
              type="text"
              inputMode="decimal"
              value={content.pix.amount}
              onChange={(e) =>
                onChange({ ...content, pix: { ...content.pix, amount: e.target.value } })
              }
              placeholder="49,90"
              className={`${inputBaseClass} tabular-nums`}
            />
          </div>

          <div>
            <label htmlFor="qr-pix-txid" className={labelBaseClass}>
              Identificador (TxID)
            </label>
            <input
              id="qr-pix-txid"
              type="text"
              maxLength={25}
              value={content.pix.txid}
              onChange={(e) =>
                onChange({ ...content, pix: { ...content.pix, txid: e.target.value } })
              }
              placeholder="***"
              className={`${inputBaseClass} font-mono`}
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="qr-pix-desc" className={labelBaseClass}>
              Descrição — opcional
            </label>
            <input
              id="qr-pix-desc"
              type="text"
              maxLength={40}
              value={content.pix.description}
              onChange={(e) =>
                onChange({
                  ...content,
                  pix: { ...content.pix, description: e.target.value },
                })
              }
              placeholder="Pagamento pedido #104"
              className={inputBaseClass}
            />
          </div>
        </div>
      )}

      {content.type === 'whatsapp' && (
        <div className="space-y-4">
          <div>
            <label htmlFor="qr-wa-phone" className={labelBaseClass}>
              Número com DDI e DDD
            </label>
            <input
              id="qr-wa-phone"
              type="tel"
              value={content.whatsapp.phone}
              onChange={(e) =>
                onChange({
                  ...content,
                  whatsapp: { ...content.whatsapp, phone: e.target.value },
                })
              }
              placeholder="5511999999999"
              className={`${inputBaseClass} tabular-nums`}
            />
          </div>

          <div>
            <label htmlFor="qr-wa-msg" className={labelBaseClass}>
              Mensagem inicial — opcional
            </label>
            <textarea
              id="qr-wa-msg"
              rows={3}
              value={content.whatsapp.message}
              onChange={(e) =>
                onChange({
                  ...content,
                  whatsapp: { ...content.whatsapp, message: e.target.value },
                })
              }
              placeholder="Olá! Gostaria de saber mais informações."
              className={inputBaseClass}
            />
          </div>
        </div>
      )}

      {content.type === 'email' && (
        <div className="space-y-4">
          <div>
            <label htmlFor="qr-email-to" className={labelBaseClass}>
              Destinatário
            </label>
            <input
              id="qr-email-to"
              type="email"
              value={content.email.to}
              onChange={(e) =>
                onChange({ ...content, email: { ...content.email, to: e.target.value } })
              }
              placeholder="contato@suaempresa.com.br"
              className={inputBaseClass}
            />
          </div>

          <div>
            <label htmlFor="qr-email-subject" className={labelBaseClass}>
              Assunto — opcional
            </label>
            <input
              id="qr-email-subject"
              type="text"
              value={content.email.subject}
              onChange={(e) =>
                onChange({
                  ...content,
                  email: { ...content.email, subject: e.target.value },
                })
              }
              placeholder="Solicitação de orçamento"
              className={inputBaseClass}
            />
          </div>

          <div>
            <label htmlFor="qr-email-body" className={labelBaseClass}>
              Corpo do e-mail — opcional
            </label>
            <textarea
              id="qr-email-body"
              rows={3}
              value={content.email.body}
              onChange={(e) =>
                onChange({
                  ...content,
                  email: { ...content.email, body: e.target.value },
                })
              }
              placeholder="Olá, gostaria de agendar uma conversa..."
              className={inputBaseClass}
            />
          </div>
        </div>
      )}

      {content.type === 'vcard' && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label htmlFor="qr-vc-first" className={labelBaseClass}>
              Nome
            </label>
            <input
              id="qr-vc-first"
              type="text"
              value={content.vcard.firstName}
              onChange={(e) =>
                onChange({
                  ...content,
                  vcard: { ...content.vcard, firstName: e.target.value },
                })
              }
              placeholder="Camila"
              className={inputBaseClass}
            />
          </div>

          <div>
            <label htmlFor="qr-vc-last" className={labelBaseClass}>
              Sobrenome
            </label>
            <input
              id="qr-vc-last"
              type="text"
              value={content.vcard.lastName}
              onChange={(e) =>
                onChange({
                  ...content,
                  vcard: { ...content.vcard, lastName: e.target.value },
                })
              }
              placeholder="Ferreira"
              className={inputBaseClass}
            />
          </div>

          <div>
            <label htmlFor="qr-vc-phone" className={labelBaseClass}>
              Telefone
            </label>
            <input
              id="qr-vc-phone"
              type="tel"
              value={content.vcard.phone}
              onChange={(e) =>
                onChange({
                  ...content,
                  vcard: { ...content.vcard, phone: e.target.value },
                })
              }
              placeholder="+55 11 98888-7777"
              className={inputBaseClass}
            />
          </div>

          <div>
            <label htmlFor="qr-vc-email" className={labelBaseClass}>
              E-mail
            </label>
            <input
              id="qr-vc-email"
              type="email"
              value={content.vcard.email}
              onChange={(e) =>
                onChange({
                  ...content,
                  vcard: { ...content.vcard, email: e.target.value },
                })
              }
              placeholder="camila@estudio.com.br"
              className={inputBaseClass}
            />
          </div>

          <div>
            <label htmlFor="qr-vc-org" className={labelBaseClass}>
              Empresa
            </label>
            <input
              id="qr-vc-org"
              type="text"
              value={content.vcard.organization}
              onChange={(e) =>
                onChange({
                  ...content,
                  vcard: { ...content.vcard, organization: e.target.value },
                })
              }
              placeholder="Estúdio Horizonte"
              className={inputBaseClass}
            />
          </div>

          <div>
            <label htmlFor="qr-vc-role" className={labelBaseClass}>
              Cargo
            </label>
            <input
              id="qr-vc-role"
              type="text"
              value={content.vcard.role}
              onChange={(e) =>
                onChange({
                  ...content,
                  vcard: { ...content.vcard, role: e.target.value },
                })
              }
              placeholder="Diretora de Design"
              className={inputBaseClass}
            />
          </div>

          <div className="sm:col-span-2">
            <label htmlFor="qr-vc-web" className={labelBaseClass}>
              Site
            </label>
            <input
              id="qr-vc-web"
              type="url"
              value={content.vcard.website}
              onChange={(e) =>
                onChange({
                  ...content,
                  vcard: { ...content.vcard, website: e.target.value },
                })
              }
              placeholder="https://estudiohorizonte.com.br"
              className={inputBaseClass}
            />
          </div>
        </div>
      )}
    </div>
  );
}
