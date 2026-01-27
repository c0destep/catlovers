# Guia de Contribuição

Obrigado por seu interesse em contribuir com o projeto **Catlovers**! Este guia fornece instruções diretas para
configurar seu ambiente e começar a colaborar.

## ⚠️ Regra Fundamental

**Este projeto é estritamente baseado em tecnologias web fundamentais. Só é permitido o uso de HTML, CSS e JavaScript
para a publicação do site.** Não utilize frameworks como React, Vue ou Angular.

## 🛠 Tecnologias Utilizadas

- **Gerenciador de Pacotes:** `pnpm`
- **Bundler:** `Parcel`
- **Modularização de HTML:** `PostHTML` com `posthtml-include`
- **Internacionalização (i18n):** `@andreasremdt/simple-translator`
- **Metodologia CSS:** `BEM` (Block Element Modifier)

## 🚀 Como Começar

### 1. Pré-requisitos

Certifique-se de ter o [Node.js](https://nodejs.org/) e o [pnpm](https://pnpm.io/) instalados em sua máquina.

### 2. Configuração Local

Clone o repositório e instale as dependências:

```bash
git clone https://github.com/seu-usuario/catlovers.git
cd catlovers
pnpm install
```

### 3. Desenvolvimento

Para iniciar o servidor de desenvolvimento com hot-reload:

```bash
pnpm run dev
```

O site abrirá automaticamente em `http://localhost:1234`.

### 4. Build para Produção

Para gerar os arquivos otimizados na pasta `dist/`:

```bash
pnpm run build
```

## 📂 Estrutura do Repositório

- `index.html`, `about.html`, etc.: Arquivos principais (usam `<include>` do PostHTML).
- `includes/`: Fragmentos de HTML reutilizáveis (Header, Footer, Head).
- `css/`: Estilos do projeto (utilize variáveis CSS e metodologia BEM).
- `js/`: Lógica JavaScript (modular e sem dependências pesadas).
- `languages/`: Arquivos JSON para as traduções (`pt_BR`, `en_US`, `es_ES`).

## 📝 Boas Práticas

- **Dúvidas:** Em caso de dúvida sobre como contribuir ou sobre o funcionamento do projeto, sinta-se à vontade para
  abrir uma **Issue** no repositório.
- **Commits:** Siga o padrão de Commits Convencionais (ex: `feat:`, `fix:`, `docs:`). O projeto possui suporte ao
  `commitizen`.
- **Acessibilidade:** Mantenha os atributos ARIA e garanta contraste WCAG.
- **Responsividade:** O design deve ser Mobile-First.
