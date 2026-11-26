# Acopiara Transparente

Site estático (HTML, CSS e JavaScript, sem etapa de build) com funções serverless da Vercel em `api/`.

## Estrutura
- `index.html` e `assets/`: o site. Rotas por `#/` (casos, notícias, linha do tempo, dinheiro, pessoas, fiscalize, direitos, denuncie, sobre). Versão de celular própria (barra inferior, listas e fichas no lugar de tabelas).
- `data/casos.json`, `data/site.json`: conteúdo do Dossiê da Reconstrução.
- `data/noticias.json`: notícias com fato, fonte, análise e casos cruzados.
- `data/perfis.json`: perfis dos agentes públicos (só dados oficiais e canais institucionais).
- `api/`: contadores de visualização, curtidas, compartilhamentos, presença, denúncias, notificações e painel.
- `painel.html`: painel privado (exige a chave `ADMIN_TOKEN`).
- `sw.js` e `manifest.webmanifest`: instalação como aplicativo e notificações.

## Configuração na Vercel (uma vez)
1. Storage → Marketplace → **Upstash for Redis** → Create → conectar a este projeto. Isso cria `KV_REST_API_URL` e `KV_REST_API_TOKEN`.
2. Settings → Environment Variables: `ADMIN_TOKEN` (chave do painel), `VAPID_PUBLIC_KEY`, `VAPID_PRIVATE_KEY` e `VAPID_EMAIL`.
3. Deployments → Redeploy.

Sem essas variáveis o site funciona normalmente; contadores, reações, denúncias e notificações ficam ocultos.

## Atualização de conteúdo
A rotina de varredura atualiza `data/*.json` e publica por commit neste repositório. Cada commit gera um novo deploy na Vercel.
