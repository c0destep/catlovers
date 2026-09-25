# Linha de base das jornadas demonstrativas

> Estado em 25 de setembro de 2026: critérios definidos; execução das jornadas ainda pendente.

## Escopo

Este roteiro verifica as jornadas do Catlovers como demonstração educacional estática. Perfis e resultados são fictícios. O formulário serve apenas para testar validação no navegador; os dados digitados nele não são enviados nem armazenados pelo Catlovers. Esta linha de base não representa revisão editorial ou veterinária.

## Critérios de aceitação

| Jornada | Páginas | Critérios |
| --- | --- | --- |
| Navegação | Todas | O skip link leva ao conteúdo principal; os links de navegação e rodapé abrem as páginas locais corretas; os controles de idioma e tema continuam utilizáveis por teclado; o idioma escolhido atualiza os textos e o atributo `lang`. |
| Galeria | `cats.html` | Os seis perfis aparecem identificados como fictícios; filtros combinados mostram somente resultados correspondentes; a combinação sem resultados apresenta um estado vazio compreensível; textos, rótulos e textos alternativos acompanham o idioma selecionado. |
| Quiz | `quiz.html` | Campos obrigatórios não respondidos recebem orientação compreensível; respostas completas produzem um resultado ilustrativo; o resultado não se apresenta como avaliação ou recomendação sobre gatos reais; o link leva à galeria fictícia. |
| Conteúdo educativo | `index.html`, `adoption.html`, `benefits.html`, `happy-endings.html`, `blog.html` e `post.html` | A demonstração não é apresentada como serviço de adoção; afirmações factuais inventariadas mantêm fonte visível no contexto correspondente; links de fonte levam ao material citado; cenários permanecem identificados como ilustrativos quando aplicável. |
| Formulário local | `adoption.html` | Campos inválidos impedem a conclusão e indicam como corrigir; dados válidos mostram claramente que nada foi enviado ou armazenado; a submissão não gera uma requisição de rede com os dados do formulário. |

## Cobertura transversal

- Conferir conteúdo e controles nos idiomas PT-BR, EN e ES, incluindo fallback HTML onde existir.
- Percorrer a navegação por teclado e confirmar foco visível nos controles usados em cada jornada.
- Repetir os critérios do formulário com valores fictícios, sem registrar dados pessoais reais.
- Anotar diferenças de navegador, largura de tela ou estado de rede quando afetarem um resultado. A navegação offline do app shell continua coberta pelo contrato PWA e pelos critérios de qualidade do `ROADMAP.md`.

## Registro de execução

Cada execução manual deve registrar data, navegador e versão, largura de tela, idioma, condição de rede, jornadas percorridas e resultado de cada critério. Para falhas, incluir página, passos para reproduzir e resultado esperado. Não registrar dados pessoais.

Os critérios acima definem o que verificar; não afirmam que a execução já ocorreu nem substituem testes E2E, revisão editorial por idioma, auditoria de acessibilidade ou medição de desempenho.

## Prioridades da demonstração

1. Concluir a revisão editorial formal e a cobertura de conteúdo nos três idiomas, sem atribuir autoria ou qualificação ainda não confirmadas.
2. Validar teclado, foco, estados dinâmicos e leitor de tela nas jornadas; depois automatizar verificações adequadas.
3. Definir indexação multilíngue antes de completar metadados `canonical` e sociais por página.
4. Reduzir e medir os ativos publicados, estabelecer orçamentos de desempenho e acompanhar LCP, INP e CLS.
5. Preservar CI, E2E, validação de i18n e navegação offline como evidência técnica contínua.

As prioridades operacionais de uma plataforma real de adoção permanecem fora do escopo atual, conforme registrado no `ROADMAP.md`.
