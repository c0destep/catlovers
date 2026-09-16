# Guia de contribuição

Obrigado por contribuir com o Catlovers. O projeto usa HTML, CSS e JavaScript sem framework de interface, com foco em fundamentos da web, acessibilidade e manutenção simples.

## Ambiente local

Instale:

- Node.js 24, versão recomendada em `.nvmrc`;
- pnpm 11;
- Google Chrome para a execução E2E padrão.

```bash
git clone https://github.com/c0destep/catlovers.git
cd catlovers
pnpm install --frozen-lockfile
pnpm dev
```

O servidor abre `http://127.0.0.1:1234`. A porta é fixa porque o preview e o Cypress usam o mesmo endereço.

## Organização do projeto

- Os arquivos `*.html` da raiz são as entradas do site multipágina.
- `includes/` contém os fragmentos compartilhados. Um plugin local em `vite.config.mjs` processa as tags `<include>`.
- `css/` concentra os estilos e tokens visuais.
- `js/` contém módulos de comportamento, tradução e validação.
- `languages/` mantém os catálogos `pt_BR`, `en_US` e `es_ES`.
- `public/` guarda manifesto, service worker e recursos que precisam de URL estável.
- `scripts/` contém as validações e a preparação da build.
- `cypress/e2e/` reúne os testes de ponta a ponta.

## Validação

Antes de concluir uma alteração, execute:

```bash
pnpm check
```

Esse comando verifica JavaScript, CSS, traduções e a build de produção. Para mudanças no comportamento da interface, execute também:

```bash
pnpm test:e2e:run
```

O comando inicia o preview, aguarda a aplicação, executa o Cypress e verifica o app shell com a rede do navegador desativada. Ao final, encerra o servidor e o navegador. Para validar tudo em sequência, use `pnpm test`.

## Convenções

- Preserve a arquitetura em HTML, CSS e JavaScript sem framework de interface.
- Escreva CSS com abordagem mobile first, variáveis existentes e nomes BEM quando isso melhorar a clareza.
- Mantenha navegação por teclado, foco visível, semântica HTML e atributos ARIA.
- Atualize os três idiomas quando adicionar ou alterar conteúdo traduzível.
- Não apresente dados, histórias, animais ou envios fictícios como uma operação real.
- Inclua testes quando uma mudança de comportamento puder regredir de forma relevante.
- Não versione credenciais, caches, arquivos da IDE nem artefatos de `dist/`.

## Commits

Separe alterações sem relação em commits pequenos e revisáveis. Use Conventional Commits:

```text
feat: adiciona novo recurso
fix(form): corrige validação do telefone
docs: atualiza instruções de desenvolvimento
test: cobre navegação por teclado
refactor(i18n): simplifica carregamento de catálogos
```

Depois de cada commit, confira `git status --short` para garantir que nenhuma alteração acidental ficou no diretório de trabalho.

## Pull requests

Explique o problema resolvido, o comportamento final e as verificações executadas. Inclua capturas de tela quando a alteração visual for relevante e mantenha o escopo pequeno o suficiente para uma revisão objetiva.
