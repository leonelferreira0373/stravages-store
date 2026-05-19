# Stravages Store

Design mock-up estático em HTML/CSS para a loja online **Stravages** — streetwear premium baseado em Lisboa (peças com a abelha bordada a dourado).

Este repo é uma referência visual / lookbook navegável. A loja em produção corre na stack Next.js + Sanity (repo separado, `plug-empire`); as imagens em produção vivem na base de dados, não hard-coded.

## Páginas

- `index.html` — homepage com hero (balaclava), Signature Bee Collection, beanies grid, Stravages Set, packaging
- `shop.html` — catálogo
- `tracksuits.html` — categoria fatos
- `colecao-bee.html` — coleção destacada
- `sobre-nos.html` · `contacto.html` — institucionais
- `envios-entregas.html` · `trocas-devolucoes.html` · `politica-privacidade.html` · `termos-condicoes.html` · `perguntas-frequentes.html` — legais

## Stack

HTML estático + CSS único (`styles.css`) + JS partilhado (`shared.js`). Sem build step. Abre o `index.html` directamente no browser.

## Regras de design

- **Linhas douradas divisoras** entre cada secção (`rgba(212,175,55,0.35)`)
- **Imagens hero/editoriais full-bleed** — topo e fundo encostam às linhas douradas, sem padding vertical na secção
- **Sem `<div>` à volta de imagens** — `<img>` directo, estilos no próprio selector
- **Mobile** — sombras/overlays só onde fazem falta para legibilidade do texto
