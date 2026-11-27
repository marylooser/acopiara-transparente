# Acopiara Transparente

Portal estático publicado no GitHub Pages, no domínio `acopiaratransparente.com.br`. Não depende de Vercel para a hospedagem ou para o contador de audiência em uso.

## Conteúdo e redação

Os dados ficam em `data/`. A redação deve seguir `DIRETRIZES_EDITORIAIS.md`: linguagem clara, crítica forte, análise fundamentada e distinção entre fatos, inferências e lacunas de prova. Valores previstos, contratados, recebidos, empenhados e pagos não são equivalentes. A nota sobre automação e limites de precisão está em Sobre e correções e tem referência no rodapé.

## Compartilhamento e movimento

O portal compartilha páginas, perfis e trechos, com links para as seções, artes e legendas. Os trechos preservam a classificação do caso. Stories oferecem link; feed oferece legenda. Há cópia, WhatsApp e compartilhamento nativo quando suportado.

`assets/reading-motion.js` aplica entradas de leitura, barras de gráficos e contagem progressiva de valores. A preferência de movimento reduzido e a navegação por teclado finalizam ou dispensam esses efeitos.

## Audiência: Stats4U

O serviço ativo é Stats4U. O código público do contador fica em `data/services.json` e `contador.html`. O endereço de administração e o acesso aos relatórios privados são credenciais e não pertencem aos arquivos publicados.

O carregador `assets/audience.js` só cria o componente no domínio oficial, respeitando Do Not Track e Global Privacy Control. Navegadores automatizados e prévias locais não registram acessos. Os testes usam respostas locais de demonstração e bloqueiam a contagem real do provedor.

O código fornecido pelo serviço é carregado em `contador.html`, dentro de um iframe isolado. O componente só conhece seu endereço fixo, e não a rota da matéria, os nomes dos perfis ou os formulários do portal. O conteúdo do iframe não pode acessar o documento principal. A política de conteúdo limita script, imagens e conexões ao próprio provedor.

O widget apresenta total de acessos e estimativa de presença recente segundo os critérios do Stats4U. Os números visíveis correspondem à consulta feita ao abrir o portal; a atualização automática da imagem não foi liberada pelo provedor. O painel privado permite acompanhar o histórico. Não há preenchimento fictício de visitas anteriores.

O serviço não usa cookies de rastreamento no contador. Segundo sua política, o IP participa de um hash diário com salt, retido por dois dias, e pode permanecer no log operacional por 14 dias; agregados ficam 400 dias. Os relatórios detalhados deste portal são privados. A descrição pública e a política do provedor estão referenciadas em Sobre e correções.

## Funções legadas

A pasta `api/` contém funções para outras possibilidades de backend. O GitHub Pages não as executa. A opção `audience: null` mantém desativado o backend Redis preparado anteriormente. Ele não é utilizado pelo contador Stats4U e não deve ser confundido com um serviço já implantado.

## Matérias em PDF

As 30 matérias de casos e 8 notícias possuem versões completas em `publicacoes/`. O diálogo Compartilhar oferece download do documento e preparação para envio como arquivo PDF nos dispositivos compatíveis. A preparação ocorre sob demanda, sem transferir PDFs quando o visitante escolhe compartilhar somente uma imagem ou link. Onde o envio nativo não é suportado, o download continua disponível.

O manifesto `data/publicacoes.json` relaciona tipo, identificador, data da exportação, páginas, tamanho e SHA-256. O parâmetro de versão deriva do hash para impedir que um PDF antigo seja reutilizado depois de uma atualização. As versões contêm os textos das seções, tabelas, recortes e referências; tabelas largas usam páginas em paisagem. Arquivos não são pré-carregados pelo aplicativo.

Ao alterar o conteúdo de uma publicação, regenere e confira o PDF correspondente e atualize seu registro no manifesto antes da publicação. O exportador e os registros privados de preparação permanecem fora do repositório público. O código `assets/publications.js` integra as ações à interface.

Os pacotes de matéria com documentos só são oferecidos quando houver uma URL de download no Internet Archive efetivamente publicada e verificada. Documentos de prova, backups, chaves de acesso e arquivos privados de revisão não são incluídos automaticamente na publicação do site.

## Datas e histórico das publicações

`data/historico-publicacoes.json` registra a primeira versão preservada e as revisões de conteúdo de cada caso e notícia. A data de registro usa a primeira ocorrência verificável do item no histórico; não é inferida da data de elaboração do dossiê, da notícia original, do ato público ou da geração do PDF. Datas e horários aparecem no fuso America/Fortaleza (UTC−3).

O hash de conteúdo se refere ao objeto editorial da publicação, com chaves ordenadas. A cada revisão editorial, confira esse hash, mantenha a data de registro e acrescente o evento e o horário real de revisão. Alterações somente de interface não mudam a data editorial. Regerar um PDF também não deve, isoladamente, alterar o histórico da matéria.

No mapa de vínculos familiares, cargos e formas de ingresso são conferidos separadamente do parentesco. Informações fornecidas ao portal são identificadas como tal quando não houver comprovação documental independente anexada. Não se equiparam mandato, concurso, contrato temporário e cargo comissionado.
