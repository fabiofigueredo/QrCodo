# QRCodo

**Gerador de QR Code vetorial que roda 100% no navegador.**
**A vector QR code studio that runs entirely in your browser.**

[🇧🇷 Português](#-português) · [🇺🇸 English](#-english)

![React](https://img.shields.io/badge/React-19-149eca) ![TypeScript](https://img.shields.io/badge/TypeScript-strict-3178c6) ![Vite](https://img.shields.io/badge/Vite-8-646cff) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-4-38bdf8)

---

## 🇧🇷 Português

### Sumário

- [O que é](#o-que-é)
- [Funcionalidades](#funcionalidades)
- [Tipos de conteúdo suportados](#tipos-de-conteúdo-suportados)
- [Como usar](#como-usar)
- [Procedimentos por tipo de QR Code](#procedimentos-por-tipo-de-qr-code)
- [Personalização da aparência](#personalização-da-aparência)
- [Exportação](#exportação)
- [Histórico](#histórico)
- [Boas práticas para impressão e leitura](#boas-práticas-para-impressão-e-leitura)
- [Instalação e execução local](#instalação-e-execução-local)
- [Scripts disponíveis](#scripts-disponíveis)
- [Publicação (deploy)](#publicação-deploy)
- [Estrutura do projeto](#estrutura-do-projeto)
- [Privacidade](#privacidade)
- [Solução de problemas](#solução-de-problemas)

### O que é

O **QRCodo** é um estúdio para criar, personalizar e exportar QR Codes para links, redes Wi-Fi, cobranças Pix, conversas no WhatsApp, e-mails e cartões de contato (vCard). Todo o processamento acontece no seu navegador: nenhum dado digitado é enviado a servidores, não há cadastro e não há limite de uso.

O código é desenhado em **SVG vetorial**, então pode ser ampliado para qualquer tamanho (de cartão de visita a banner) sem perder qualidade.

### Funcionalidades

- **7 tipos de conteúdo**: URL, texto livre, Wi-Fi, Pix (BR Code estático), WhatsApp, e-mail e contato (vCard).
- **Visualização ao vivo**: o QR Code é atualizado enquanto você digita, com validação e mensagens de erro claras.
- **Personalização visual**: 6 paletas prontas, cores livres (com botão de inverter), 4 formatos de módulo (quadrado, suave, pontos, diamante) e 3 estilos de cantos (quadrado, arredondado, circular).
- **Logotipo central**: envie PNG, SVG, JPG ou WebP. A imagem é otimizada automaticamente e a correção de erro é elevada para o nível H.
- **Medidor de legibilidade**: calcula o contraste entre módulos e fundo e avisa sobre contraste baixo ou cores invertidas.
- **Exportação**: PNG em 512, 1024 ou 2048 px; SVG vetorial; copiar a imagem ou o código SVG direto para a área de transferência.
- **Histórico local**: salve até 12 configurações (conteúdo + estilo) e recarregue com um clique.
- **Inspetor de conteúdo**: veja exatamente o texto codificado no QR Code e o tamanho em bytes.
- **Acessível**: navegação completa por teclado (inclusive setas nas abas), rótulos para leitores de tela e respeito à preferência de movimento reduzido.
- **Responsivo**: funciona em desktop, tablet e celular.

### Tipos de conteúdo suportados

| Tipo | O que acontece ao escanear | Formato gerado |
|---|---|---|
| **URL** | Abre o site no navegador | `https://...` |
| **Texto** | Exibe o texto na tela | Texto puro |
| **Wi-Fi** | Conecta o celular à rede | `WIFI:T:WPA;S:rede;P:senha;;` |
| **Pix** | Abre o app do banco com a cobrança preenchida | BR Code EMV® com CRC16 |
| **WhatsApp** | Abre uma conversa com o número (e mensagem opcional) | `https://wa.me/55...` |
| **E-mail** | Abre um novo e-mail com destinatário, assunto e corpo | `mailto:...` |
| **Contato** | Oferece salvar o contato na agenda | vCard 3.0 |

### Como usar

1. **Escolha o tipo de conteúdo** na seção **01 · Conteúdo do QR Code** (URL, Texto, Wi-Fi, Pix, WhatsApp, E-mail ou Contato).
2. **Preencha os campos.** Campos marcados com `*` são obrigatórios. Use **Preencher exemplo** para ver um modelo pronto.
3. **Acompanhe a visualização ao vivo** no painel lateral (no celular, ele aparece logo abaixo do formulário). Se algo estiver inválido, uma mensagem explica o que corrigir.
4. **Personalize a aparência** na seção **02 · Aparência e formato**: cores, formatos, correção de erro, margem e logotipo.
5. **Confira o indicador de legibilidade.** O ideal é "Leitura excelente" (contraste ≥ 4,5:1).
6. **Exporte**: clique em **Baixar PNG**, **SVG**, **Imagem** (copia o PNG) ou **Código** (copia o SVG).
7. (Opcional) Clique em **Salvar no histórico** para reutilizar a configuração depois.
8. **Teste antes de distribuir**: escaneie com a câmera de pelo menos dois celulares diferentes.

Para começar do zero, use o botão **Novo QR Code** no topo da página.

### Procedimentos por tipo de QR Code

#### URL
1. Digite o endereço, por exemplo `exemplo.com.br/catalogo`.
2. Se você não informar o protocolo, `https://` é adicionado automaticamente.
3. Endereços sem domínio válido (ex.: `abc`) são recusados.

#### Texto
1. Digite qualquer mensagem: cupom, código de rastreio, instrução etc.
2. Quanto menor o texto, mais simples e fácil de ler fica o código. O contador de caracteres ajuda a controlar o tamanho.
3. Textos muito longos (acima da capacidade máxima de um QR Code) são sinalizados no painel de visualização.

#### Wi-Fi
1. Informe o **nome da rede (SSID)** exatamente como aparece no roteador (maiúsculas e minúsculas importam).
2. Escolha a **segurança**: WPA/WPA2/WPA3 (a mais comum), WEP (redes antigas) ou Aberta.
3. Informe a **senha**. Redes WPA exigem no mínimo 8 caracteres. Use o ícone de olho para conferir o que digitou.
4. Marque **Rede oculta** se o SSID não for transmitido.
5. ⚠️ A senha fica gravada no QR Code: qualquer pessoa que escanear poderá se conectar. Prefira uma rede de convidados.

#### Pix
1. Informe a **chave Pix**:
   - CPF/CNPJ: pode digitar com ou sem pontuação (ela é removida automaticamente).
   - Telefone: use o formato internacional, ex.: `+5511999999999`.
   - E-mail ou chave aleatória: cole como está.
2. Informe o **nome do recebedor** (até 25 caracteres) e a **cidade** (até 15). Acentos são removidos automaticamente, como exige o padrão.
3. **Valor** (opcional): aceita `49,90`, `1.234,56` ou `1234.56`. Em branco, quem paga digita o valor.
4. **TxID** (opcional): apenas letras e números, até 25 caracteres. `***` significa "sem identificador".
5. **Descrição** (opcional): aparece para o pagador em alguns bancos.
6. ✅ **Sempre faça um pagamento de teste** com o app do seu banco antes de imprimir, conferindo nome, chave e valor.

> O QRCodo gera **Pix estático** (BR Code). Ele não registra cobranças no banco nem confirma pagamentos; para isso é preciso uma integração de Pix dinâmico com sua instituição financeira.

#### WhatsApp
1. Informe o número com **código do país + DDD + número**, ex.: `55 11 99999-9999`. Espaços, parênteses e traços são ignorados.
2. (Opcional) Escreva a **mensagem inicial**, que já aparece digitada para quem escanear.

#### E-mail
1. Informe o **destinatário**.
2. (Opcional) Preencha **assunto** e **corpo**. Acentos e espaços são codificados corretamente para os clientes de e-mail.

#### Contato (vCard)
1. Informe ao menos **nome** ou **sobrenome**.
2. Complete com telefone, e-mail, empresa, cargo e site conforme desejar.
3. Ao escanear, o celular oferece salvar o contato na agenda.
4. Quanto mais campos, mais denso fica o código. Para cartões pequenos, preencha só o essencial.

### Personalização da aparência

| Opção | Descrição | Recomendação |
|---|---|---|
| **Paletas rápidas** | Combinações prontas de cor dos módulos e do fundo | Grafite ou Cobalto para máxima legibilidade |
| **Cor dos módulos / fundo** | Seletor visual ou código hexadecimal (`#RRGGBB`) | Módulos escuros sobre fundo claro |
| **Inverter cores** (⇄) | Troca as cores dos módulos e do fundo | Cores invertidas funcionam na maioria das câmeras, mas não em todas |
| **Formato dos módulos** | Quadrado, Suave, Pontos ou Diamante | Quadrado é o mais robusto; Diamante é o mais decorativo e o menos tolerante |
| **Cantos (olhos)** | Quadrado, Arredondado ou Circular | Todos são seguros |
| **Correção de erro** | L (7%), M (15%), Q (25%), H (30%) — quanto do código pode ser danificado e ainda ser lido | M para telas; Q para impressos; H com logotipo (automático) |
| **Resolução do PNG** | 512, 1024 ou 2048 px | 1024 px para uso geral; 2048 px para impressão grande |
| **Margem externa** | Zona de respiro ao redor do código, em módulos | 4 módulos (padrão da especificação) |
| **Logotipo central** | Imagem no centro do código | Fundo transparente e tamanho até ~26% |

### Exportação

- **Baixar PNG**: imagem bitmap na resolução escolhida, ideal para redes sociais, documentos e apresentações.
- **SVG**: arquivo vetorial, ideal para gráficas, ferramentas de design (Figma, Illustrator, Inkscape) e impressão em qualquer tamanho.
- **Imagem**: copia o PNG para a área de transferência; cole direto em documentos, e-mails ou chats.
- **Código**: copia a marcação SVG, útil para incorporar o QR Code em páginas HTML.

Os arquivos recebem nomes descritivos, por exemplo `qrcode-pix-loja-exemplo-ltda-r-49-90-1024px.png`.

### Histórico

- Clique em **Salvar no histórico** para guardar o conteúdo e o estilo atuais.
- Até **12 itens** ficam salvos no armazenamento local (`localStorage`) **deste navegador**. Eles não são sincronizados entre dispositivos.
- Salvar a mesma configuração novamente não cria duplicata; o item apenas sobe para o topo.
- **Carregar** restaura o conteúdo e o estilo; **Excluir** remove um item; **Limpar histórico** pede um segundo clique para confirmar.
- Limpar os dados de navegação ou usar janela anônima apaga o histórico.

### Boas práticas para impressão e leitura

- **Tamanho mínimo impresso**: cerca de 2 × 2 cm para leitura a curta distância. Uma regra prática: distância de leitura ÷ 10 = largura do código.
- **Contraste**: mantenha o indicador em "Leitura excelente". Evite cores claras sobre fundo claro.
- **Margem**: não remova a zona de respiro, principalmente sobre fundos estampados.
- **Logotipo**: quanto maior, menos dados sobram; teste sempre.
- **Conteúdo curto**: URLs curtas geram códigos menos densos e mais fáceis de ler.
- **Teste final**: escaneie o material impresso (não só a tela) com mais de um aparelho.

### Instalação e execução local

**Pré-requisitos:** [Node.js](https://nodejs.org/) 20 ou superior (com npm).

```bash
# 1. Clone o repositório
git clone <url-do-repositorio>
cd QrCodo

# 2. Instale as dependências
npm install

# 3. Inicie o servidor de desenvolvimento
npm run dev
```

Acesse **http://localhost:3000**. O servidor também fica disponível na rede local (`--host=0.0.0.0`), o que permite abrir pelo celular usando o IP do computador.

Nenhuma variável de ambiente é necessária. Opcionalmente, `DISABLE_HMR=true` desliga o recarregamento automático.

### Scripts disponíveis

| Comando | Descrição |
|---|---|
| `npm run dev` | Servidor de desenvolvimento na porta 3000 |
| `npm run build` | Gera a versão de produção em `dist/` |
| `npm run preview` | Serve localmente a versão de produção (porta 4173) |
| `npm run lint` | Verificação de tipos do TypeScript (modo estrito) |
| `npm test` | Executa os testes unitários (`node:test` via `tsx`) |
| `npm run check` | Executa lint, testes e build em sequência |

### Publicação (deploy)

O QRCodo é um site estático: basta publicar o conteúdo de `dist/` após `npm run build`.

- **Netlify / Vercel / Cloudflare Pages**: comando de build `npm run build`, diretório de saída `dist`.
- **GitHub Pages**: publique a pasta `dist`. Se o site ficar em um subcaminho (ex.: `/QrCodo/`), adicione `base: '/QrCodo/'` em `vite.config.ts`.
- **Qualquer servidor web** (Nginx, Apache, S3): copie os arquivos de `dist/`.

### Estrutura do projeto

```
QrCodo/
├── index.html                 # Página base, metadados e fontes
├── public/favicon.ico
├── src/
│   ├── main.tsx               # Ponto de entrada do React
│   ├── App.tsx                # Estado global, histórico e layout
│   ├── index.css              # Tailwind CSS e estilos globais
│   ├── types/qr.ts            # Tipos de conteúdo e estilo
│   ├── components/
│   │   ├── HeaderBar.tsx       # Cabeçalho fixo e navegação
│   │   ├── ContentTypeTabs.tsx # Abas de tipo (navegáveis por teclado)
│   │   ├── ContentForm.tsx     # Formulários de cada tipo
│   │   ├── StyleControls.tsx   # Cores, formatos, correção e logotipo
│   │   ├── QrPreviewStage.tsx  # Visualização, legibilidade e exportação
│   │   ├── QrCodeSvg.tsx       # Miniaturas do histórico
│   │   ├── HistorySection.tsx  # Lista do histórico
│   │   └── Toast.tsx           # Notificações
│   └── utils/
│       ├── qrPayload.ts        # Montagem do conteúdo (Pix, Wi-Fi, vCard...), contraste
│       ├── qrRenderer.ts       # Matriz do QR, desenho em SVG e exportação PNG
│       ├── history.ts          # Leitura/validação/gravação do histórico
│       └── *.test.ts           # Testes unitários
├── package.json
├── tsconfig.json
└── vite.config.ts
```

**Tecnologias:** React 19, TypeScript, Vite, Tailwind CSS 4, [`qrcode`](https://www.npmjs.com/package/qrcode) (geração da matriz) e [`lucide-react`](https://lucide.dev/) (ícones).

**Como funciona por dentro:** `qrPayload.ts` transforma o formulário no texto a ser codificado (por exemplo, o BR Code do Pix com cálculo de CRC16-CCITT). `qrRenderer.ts` gera a matriz com a biblioteca `qrcode` e a desenha como um SVG compacto (todos os módulos em um único `<path>`). O mesmo SVG é usado na visualização e na exportação, garantindo que o arquivo baixado seja idêntico ao que aparece na tela. O PNG é obtido rasterizando o SVG em um `<canvas>`.

### Privacidade

- Nenhum dado digitado sai do seu navegador: não há back-end, banco de dados, analytics ou cookies de rastreamento.
- O histórico fica apenas no `localStorage` do navegador.
- A única requisição externa é o carregamento das fontes do Google Fonts.

### Solução de problemas

| Problema | Solução |
|---|---|
| O celular não lê o código | Aumente o contraste, volte ao formato Quadrado, aumente a margem e imprima maior |
| "Conteúdo grande demais" | Reduza o texto, encurte a URL ou baixe a correção de erro (sem logotipo) |
| Pix recusado pelo banco | Confira a chave (telefone com `+55`), nome e cidade; faça um pagamento de teste |
| Wi-Fi não conecta | Confira SSID e senha (diferenciam maiúsculas/minúsculas) e o tipo de segurança |
| "Copiar imagem" não funciona | Alguns navegadores não permitem copiar imagens; use "Baixar PNG" |
| Histórico não salva | O armazenamento do navegador está cheio; exclua itens antigos ou remova logotipos |

---

## 🇺🇸 English

### Table of contents

- [What it is](#what-it-is)
- [Features](#features)
- [Supported content types](#supported-content-types)
- [How to use](#how-to-use)
- [Step-by-step by QR type](#step-by-step-by-qr-type)
- [Appearance options](#appearance-options)
- [Exporting](#exporting)
- [History](#history)
- [Printing and scanning best practices](#printing-and-scanning-best-practices)
- [Local setup](#local-setup)
- [Available scripts](#available-scripts)
- [Deployment](#deployment)
- [Project structure](#project-structure)
- [Privacy](#privacy)
- [Troubleshooting](#troubleshooting)

### What it is

**QRCodo** is a studio for creating, styling, and exporting QR codes for links, Wi-Fi networks, Pix payments (Brazil's instant payment system), WhatsApp chats, e-mails, and contact cards (vCard). Everything runs in your browser: nothing you type is sent to a server, there is no sign-up, and there are no usage limits.

Codes are drawn as **vector SVG**, so they scale to any size (from business cards to banners) without losing quality.

> The interface is in Brazilian Portuguese. The tables below include the on-screen labels in parentheses.

### Features

- **7 content types**: URL, free text, Wi-Fi, Pix (static BR Code), WhatsApp, e-mail, and contact (vCard).
- **Live preview**: the code updates as you type, with validation and clear error messages.
- **Visual customization**: 6 preset palettes, free colors (with a swap button), 4 module shapes (square, soft, dots, diamond), and 3 corner ("eye") styles (square, rounded, circular).
- **Center logo**: upload PNG, SVG, JPG, or WebP. The image is optimized automatically and error correction is raised to level H.
- **Scannability meter**: computes foreground/background contrast and warns about low contrast or inverted colors.
- **Export**: PNG at 512, 1024, or 2048 px; vector SVG; copy the image or the SVG markup to the clipboard.
- **Local history**: save up to 12 setups (content + style) and reload them in one click.
- **Payload inspector**: see the exact encoded text and its size in bytes.
- **Accessible**: full keyboard navigation (including arrow keys on tabs), screen-reader labels, and reduced-motion support.
- **Responsive**: works on desktop, tablet, and mobile.

### Supported content types

| Type (label) | What happens when scanned | Generated format |
|---|---|---|
| **URL** | Opens the website | `https://...` |
| **Text** (Texto) | Shows the text | Plain text |
| **Wi-Fi** | Joins the network | `WIFI:T:WPA;S:network;P:password;;` |
| **Pix** | Opens the banking app with the payment prefilled | EMV® BR Code with CRC16 |
| **WhatsApp** | Opens a chat with the number (and optional message) | `https://wa.me/55...` |
| **E-mail** | Opens a new e-mail with recipient, subject, and body | `mailto:...` |
| **Contact** (Contato) | Offers to save the contact | vCard 3.0 |

### How to use

1. **Pick a content type** in section **01 · Conteúdo do QR Code**.
2. **Fill in the fields.** Fields marked `*` are required. Click **Preencher exemplo** (Fill example) to see a ready-made sample.
3. **Watch the live preview** in the side panel (on mobile it appears below the form). If something is invalid, a message explains how to fix it.
4. **Customize the look** in section **02 · Aparência e formato**: colors, shapes, error correction, margin, and logo.
5. **Check the scannability indicator.** Aim for "Leitura excelente" (excellent, contrast ≥ 4.5:1).
6. **Export** with **Baixar PNG** (download PNG), **SVG**, **Imagem** (copy PNG), or **Código** (copy SVG markup).
7. (Optional) Click **Salvar no histórico** (Save to history) to reuse the setup later.
8. **Test before distributing**: scan it with at least two different phones.

To start over, click **Novo QR Code** (New QR code) at the top of the page.

### Step-by-step by QR type

#### URL
1. Type the address, e.g. `example.com/catalog`.
2. If you omit the protocol, `https://` is added automatically.
3. Addresses without a valid domain (e.g. `abc`) are rejected.

#### Text
1. Type any message: coupon, tracking code, instructions, etc.
2. Shorter text produces simpler, easier-to-scan codes; the character counter helps.
3. Text that exceeds the maximum QR capacity is flagged in the preview panel.

#### Wi-Fi
1. Enter the **network name (SSID)** exactly as broadcast (case-sensitive).
2. Choose the **security**: WPA/WPA2/WPA3 (most common), WEP (legacy), or Open (Aberta).
3. Enter the **password**. WPA networks require at least 8 characters. Use the eye icon to double-check.
4. Tick **Rede oculta** (hidden network) if the SSID is not broadcast.
5. ⚠️ The password is stored inside the QR code: anyone who scans it can join. Prefer a guest network.

#### Pix
1. Enter the **Pix key**:
   - CPF/CNPJ (Brazilian tax IDs): with or without punctuation (it is stripped automatically).
   - Phone: international format, e.g. `+5511999999999`.
   - E-mail or random key: paste as is.
2. Enter the **receiver name** (up to 25 chars) and **city** (up to 15). Accents are removed automatically, as the standard requires.
3. **Amount** (optional): accepts `49,90`, `1.234,56`, or `1234.56`. Leave blank to let the payer type it.
4. **TxID** (optional): letters and digits only, up to 25 chars. `***` means "no identifier".
5. **Description** (optional): shown to the payer by some banks.
6. ✅ **Always make a test payment** with your banking app before printing.

> QRCodo generates **static Pix** codes (BR Code). It does not register charges with a bank or confirm payments; that requires a dynamic Pix integration with your financial institution.

#### WhatsApp
1. Enter the number with **country code + area code + number**, e.g. `55 11 99999-9999`. Spaces, parentheses, and dashes are ignored.
2. (Optional) Write a **prefilled message**.

#### E-mail
1. Enter the **recipient**.
2. (Optional) Fill in **subject** and **body**. Accents and spaces are encoded correctly for mail clients.

#### Contact (vCard)
1. Enter at least a **first** or **last name**.
2. Add phone, e-mail, company, job title, and website as needed.
3. When scanned, the phone offers to save the contact.
4. More fields mean a denser code; for small cards, keep it to the essentials.

### Appearance options

| Option (label) | Description | Recommendation |
|---|---|---|
| **Presets** (Paletas rápidas) | Ready-made module/background color pairs | Grafite or Cobalto for best readability |
| **Module / background color** | Visual picker or hex code (`#RRGGBB`) | Dark modules on a light background |
| **Swap colors** (⇄) | Swaps module and background colors | Inverted codes work on most, but not all, scanners |
| **Module shape** | Square, Soft, Dots, or Diamond | Square is the most robust; Diamond is the most decorative and least tolerant |
| **Corners / eyes** (Cantos) | Square, Rounded, or Circular | All are safe |
| **Error correction** | L (7%), M (15%), Q (25%), H (30%): how much damage the code tolerates | M for screens; Q for print; H with a logo (automatic) |
| **PNG resolution** | 512, 1024, or 2048 px | 1024 px general use; 2048 px for large prints |
| **Margin** (quiet zone) | White space around the code, in modules | 4 modules (spec default) |
| **Center logo** | Image in the middle of the code | Transparent background, size up to ~26% |

### Exporting

- **Baixar PNG** (download PNG): bitmap at the chosen resolution, for social media, documents, and slides.
- **SVG**: vector file, for print shops, design tools (Figma, Illustrator, Inkscape), and any print size.
- **Imagem** (image): copies the PNG to the clipboard to paste into documents, e-mails, or chats.
- **Código** (code): copies the SVG markup, handy for embedding in HTML.

Files get descriptive names, e.g. `qrcode-pix-loja-exemplo-ltda-r-49-90-1024px.png`.

### History

- **Salvar no histórico** stores the current content and style.
- Up to **12 items** are kept in **this browser's** `localStorage`; they are not synced across devices.
- Saving the same setup again does not create a duplicate; it moves the item to the top.
- **Carregar** (load) restores content and style; **Excluir** (delete) removes an item; **Limpar histórico** (clear) asks for a second click to confirm.
- Clearing browsing data or using a private window wipes the history.

### Printing and scanning best practices

- **Minimum print size**: about 2 × 2 cm (0.8 in) for close-range scanning. Rule of thumb: scanning distance ÷ 10 = code width.
- **Contrast**: keep the indicator at "excellent". Avoid light-on-light colors.
- **Margin**: keep the quiet zone, especially on patterned backgrounds.
- **Logo**: the bigger it is, the less data remains; always test.
- **Short content**: short URLs produce less dense, easier-to-scan codes.
- **Final test**: scan the printed piece (not just the screen) with more than one device.

### Local setup

**Requirements:** [Node.js](https://nodejs.org/) 20+ (with npm).

```bash
# 1. Clone the repository
git clone <repository-url>
cd QrCodo

# 2. Install dependencies
npm install

# 3. Start the dev server
npm run dev
```

Open **http://localhost:3000**. The dev server also listens on your local network (`--host=0.0.0.0`), so you can open it on your phone using your computer's IP address.

No environment variables are required. Optionally, `DISABLE_HMR=true` turns off hot reload.

### Available scripts

| Command | Description |
|---|---|
| `npm run dev` | Dev server on port 3000 |
| `npm run build` | Production build into `dist/` |
| `npm run preview` | Serves the production build locally (port 4173) |
| `npm run lint` | TypeScript type-check (strict mode) |
| `npm test` | Runs unit tests (`node:test` via `tsx`) |
| `npm run check` | Runs lint, tests, and build in sequence |

### Deployment

QRCodo is a static site: run `npm run build` and publish the `dist/` folder.

- **Netlify / Vercel / Cloudflare Pages**: build command `npm run build`, output directory `dist`.
- **GitHub Pages**: publish `dist`. If served from a sub-path (e.g. `/QrCodo/`), add `base: '/QrCodo/'` to `vite.config.ts`.
- **Any web server** (Nginx, Apache, S3): copy the files from `dist/`.

### Project structure

See the [tree in the Portuguese section](#estrutura-do-projeto). In short:

- `src/utils/qrPayload.ts` — builds the encoded text for each type (Pix BR Code with CRC16-CCITT, Wi-Fi, vCard, mailto…) and computes contrast.
- `src/utils/qrRenderer.ts` — builds the QR matrix with the `qrcode` library, draws it as a compact SVG (all modules in a single `<path>`), and rasterizes PNGs.
- `src/utils/history.ts` — loads, validates, and saves the local history.
- `src/components/` — UI components (form, style controls, preview/export, history, toast).

**Stack:** React 19, TypeScript, Vite, Tailwind CSS 4, [`qrcode`](https://www.npmjs.com/package/qrcode), and [`lucide-react`](https://lucide.dev/).

The same SVG is used for the on-screen preview and for exports, so the downloaded file always matches what you see.

### Privacy

- Nothing you type leaves your browser: no back end, database, analytics, or tracking cookies.
- History lives only in the browser's `localStorage`.
- The only external request is loading fonts from Google Fonts.

### Troubleshooting

| Problem | Fix |
|---|---|
| Phone won't scan the code | Increase contrast, switch to the Square shape, increase the margin, and print larger |
| "Content too large" | Shorten the text/URL or lower the error correction (without a logo) |
| Bank rejects the Pix code | Check the key (phone with `+55`), name, and city; make a test payment |
| Wi-Fi won't connect | Check SSID and password (case-sensitive) and the security type |
| "Copy image" does not work | Some browsers block copying images; use "Baixar PNG" instead |
| History is not saved | Browser storage is full; delete old items or remove logos |
