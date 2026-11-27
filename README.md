# Acopiara Transparente

Portal estático com rotas por fragmento (`#/`), publicado no GitHub Pages e no domínio `acopiaratransparente.com.br`. O GitHub Pages não executa as funções Node.js da pasta `api/`.

## Compartilhamento

O início compartilha o portal. As demais páginas oferecem compartilhamento da página inteira. Seções editoriais e quadros da página O dinheiro têm uma ação junto ao título, com endereço que abre o trecho correspondente. Os guias de direitos e fiscalização mantêm suas ações por trecho.

Stories usam link para a figurinha; feed usa legenda contextual. Há exportação de imagem, WhatsApp, cópia do link e compartilhamento nativo quando disponível. Cancelar o compartilhamento nativo não registra um envio.

## Registro de audiência

A integração permanece desativada enquanto `data/services.json` tiver `"audience": null`. Não há números de demonstração nem contagens locais apresentadas como totais globais.

Para ativar, hospede `api/audience.js` e `api/_db.js` em um serviço Node.js e conecte Redis REST com suporte a Lua/EVAL. Configure no ambiente do servidor `KV_REST_API_URL` e `KV_REST_API_TOKEN`, ou `UPSTASH_REDIS_REST_URL` e `UPSTASH_REDIS_REST_TOKEN`. As chaves nunca vão para o navegador ou repositório.

Teste o serviço real antes da ativação: duplicidade de eventos, requisições simultâneas, navegação, expiração da presença e exportação diária. Depois coloque somente o endereço HTTPS público da função no campo `audience` de `data/services.json`. O serviço aceita os domínios oficiais do portal; localhost só é aceito fora de produção. Esse serviço pode ser separado da hospedagem estática, preservando o domínio.

Critérios:

- **Visita:** sessão de navegador, renovada após 30 minutos sem atividade. Abas do mesmo navegador compartilham a sessão temporária.
- **Visualização:** abertura ou mudança de página. Redimensionar a janela ou saltar entre trechos da mesma página não gera visualização adicional.
- **Online:** sessão com sinal de uma aba visível nos últimos 90 segundos. É uma estimativa de navegadores ativos, não de pessoas identificadas.
- **Registro:** totais gerais persistentes, visualizações por página e totais diários. O CSV público oferece os últimos 31 dias. Dados diários têm retenção de 400 dias; totais gerais são preservados.

Essa base não grava IP, nome de visitante, email, agente do navegador, origem de navegação ou parâmetros da URL. O identificador temporário é convertido em código pelo servidor e expira. A infraestrutura de hospedagem pode manter seus próprios registros operacionais, fora dessa base de audiência.

O novo registro respeita Do Not Track e Global Privacy Control. Testes automatizados em produção apenas leem os totais. Indicadores ficam ocultos quando o serviço está indisponível. A data inicial representa a ativação real, sem reconstrução fictícia de visitas anteriores.

## Outros serviços

Contadores de casos, reações, denúncias, painel e notificações têm funções separadas em `api/`. Sua disponibilidade depende da hospedagem e configuração correspondentes. O painel usa `ADMIN_TOKEN`; notificações usam chaves VAPID. Publicar os arquivos no GitHub Pages não ativa essas funções.
