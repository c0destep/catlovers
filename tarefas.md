# Planejamento de Melhorias e Tarefas - Catlovers

Este documento contém o backlog de ideias e funcionalidades planejadas para expandir o projeto Catlovers.

## 🐾 Novas Páginas e Conteúdo Interativo
- [x] **Galeria de Adoção (Catálogo Dinâmico):** Criar página `cats.html` que consuma dados de um arquivo `cats.json` usando JavaScript puro.
- [x] **Filtros na Galeria:** Adicionar funcionalidade de filtrar gatos por idade, sexo, pelagem e temperamento.
- [x] **Quiz "Match Perfeito":** Desenvolver um formulário interativo passo a passo para sugerir o gato ideal com base na rotina do adotante.
- [x] **Página de Doações / Como Ajudar:** Criar uma nova seção detalhando formas de apoio à causa (doações, voluntariado, apadrinhamento).
- [x] **Página de "Finais Felizes":** Expandir os depoimentos da página inicial para uma galeria completa com histórias reais e fotos de "antes e depois".

## 📚 Blog Educacional
- [x] **Estrutura do Blog:** Desenvolver os layouts base `blog.html` (listagem de posts) e `post.html` (estrutura de um artigo individual).
- [x] **Artigos Iniciais (Sugestões):**
  - [x] Como adaptar um novo gato com outros pets.
  - [x] Guia prático de gatificação (enriquecimento ambiental).
  - [x] A importância das telas de proteção em janelas e varandas.
  - [x] Tudo o que você precisa saber sobre castração e vacinas.

## ⚙️ Melhorias Técnicas e UX/UI
- [x] **PWA (Progressive Web App):** Implementar um Service Worker para habilitar cache offline e permitir que o site seja "instalável" (já há o manifesto configurado).
- [x] **Validação de Formulários 100% Acessível:** Adicionar validação JavaScript customizada no formulário de adoção, utilizando atributos WAI-ARIA (`aria-invalid`, `aria-live`) para total suporte a leitores de tela.
- [x] **Animações e Micro-interações:** Refinar a UI com transições mais fluidas nos cards, botões e navegação (scroll suave), trazendo um aspecto mais premium.

## 🔗 Integrações e Qualidade
- [x] **Consumo de APIs Externas:** Explorar o uso da *The Cat API* para gerar curiosidades dinâmicas ou imagens de raças pelo site.
- [x] **Testes Automatizados (E2E):** Implementar o Cypress para criar testes que garantam o funcionamento da troca de idiomas (i18n) e do formulário de adoção em cada deploy.
