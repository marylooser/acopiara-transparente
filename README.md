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
