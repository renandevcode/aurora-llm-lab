# Implementação e execução do laboratório

[Índice](README.md) · [Anterior: arquitetura](02-arquitetura.md) · [Próximo: desafios](04-desafios.md)

Tempo estimado de leitura: 12 minutos. Reserve tempo adicional para preparar o ambiente e acompanhar a execução.

Este módulo conecta o mapa da arquitetura às funções do código. Faça primeiro uma observação pela interface se estiver realizando os desafios sem consultar respostas internas.

## Preparar e executar

Siga a [instalação do README](../README.md#instalação). Você precisará do ambiente Python, das dependências e do modelo `qwen2.5:1.5b` baixado no Ollama. O nome da pasta do projeto pode mudar; os comandos devem ser executados no diretório que contém `app.py`.

No Linux ou macOS, após criar o ambiente:

```bash
source .venv/bin/activate
python -m pip install -r requirements.txt
ollama list
python app.py
```

Se o Ollama não estiver ativo, execute `ollama serve` em outro terminal. Se o modelo não aparecer, baixe-o antes de iniciar a aula conforme o README. No Windows, use os comandos com `.\.venv\Scripts\python.exe` apresentados no guia de instalação; não é necessário mudar a política do PowerShell.

Abra `http://127.0.0.1:7860/api/health`. O resultado esperado contém `ok: true` e o modelo configurado. Depois abra `http://127.0.0.1:7860`, envie uma saudação e observe a resposta. A saúde do serviço e a geração da resposta são verificações separadas.

## Acompanhar uma consulta de estado

Com o servidor ativo, abra as ferramentas de desenvolvedor do navegador e a aba de rede. Recarregue a página e localize `GET /api/state`. A resposta inclui `levels`, `model`, `parameters`, `histories`, `attempts`, `turns`, `solved` e `activities`.

Observe dois objetos diferentes: o estado recebido da API e o objeto `state` de [static/app.js](../static/app.js). O segundo é uma representação mantida na página para renderização. Ele não substitui a decisão do servidor sobre a validade de uma flag ou a execução de uma ação.

## Ler os contratos Python

Em [app.py](../app.py), comece por `ChatInput`, `FlagInput`, `LevelInput` e `ActionInput`. Essas classes usam Pydantic para declarar tipos e restrições de entrada. Por exemplo, o nível precisa estar dentro da faixa aceita e a mensagem possui limite de tamanho.

Uma restrição de tipo responde “isso tem o formato esperado?”. A pergunta “essa operação é permitida?” continua exigindo uma regra específica. O modelo não aplica automaticamente a política só porque o JSON está bem formado.

Procure também `session_middleware()`: ele obtém ou cria a sessão do navegador e a associa à requisição. O decorador de middleware indica que essa função envolve o processamento das rotas.

## Seguir uma requisição de chat

Leia `chat()` nesta ordem:

1. Tratamento de mensagem vazia e filtro de entrada.
2. Uso da sessão e do histórico do nível.
3. Construção das mensagens, incluindo o ticket quando aplicável.
4. Chamada de `infer()` e tratamento de falhas de serviço.
5. Filtro de saída, gravação de histórico e resposta JSON.

`async def` declara uma função assíncrona. `await` permite aguardar operações como a chamada de rede ao Ollama sem tratar essa espera como trabalho de CPU contínuo. `async with session['lock']` organiza as operações daquela sessão que usam o mesmo bloqueio. Isso não significa que o modelo responde instantaneamente nem que há validação de identidade.

Observe que a lista de mensagens é construída para cada inferência. O modelo não acessa automaticamente todo o histórico guardado no servidor. Essa seleção ajuda a explicar por que um fato visível na página pode não estar disponível em uma chamada posterior.

## Seguir uma ferramenta

Em [campaign.py](../campaign.py), leia primeiro as descrições de ferramentas e `tools_for_level()`. Os esquemas informam nomes e argumentos ao modelo. Depois acompanhe `execute_tool()`, que verifica a disponibilidade da função e executa a regra local correspondente.

Volte a `infer()` e `record_action()` em `app.py`. O modelo propõe; a função local executa; o resultado vira um evento e retorna ao contexto da inferência. Uma exceção na síntese após eventos já concluídos não desfaz as ações anteriores. Por isso, o painel de ações é uma evidência necessária.

Para o estudo defensivo, anote onde seria preciso decidir autorização por objeto e onde seria preciso reduzir os campos retornados. Você não precisa divulgar dados internos para explicar esse ponto de controle.

## Seguir a interface

Em `static/app.js`, leia `api()`, `selectLevel()`, `renderActions()` e os eventos dos formulários. O navegador recebe JSON e atualiza os painéis. A função `renderContent()` constrói elementos de texto para apresentar as respostas sem interpretá-las como HTML.

O envio desabilita controles para evitar duplicidade na interface. Quando ocorre uma falha, a mensagem digitada pode ser restaurada para reenvio. Esses recursos ajudam a interação, mas a API precisa continuar validando solicitações por conta própria.

O botão de exportação obtém o estado público da API e acrescenta data e rascunho do ticket ao arquivo JSON. `document_draft` identifica o texto atual do editor; o documento efetivamente enviado está nos turnos correspondentes.

## Entender os testes

[tests/test_app.py](../tests/test_app.py) usa `unittest`, cliente HTTP assíncrono e transporte ASGI. O transporte faz requisições diretamente à aplicação em Python sem abrir uma porta de rede para cada teste.

`patch.object()` e `AsyncMock` substituem a chamada ao modelo. Isso permite verificar, por exemplo, que uma mensagem bloqueada não foi enviada à inferência ou que uma falha de serviço não grava um turno sem resposta. A resposta simulada permite testar o caminho da aplicação, mas não mede o comportamento do Qwen.

Execute no ambiente virtual:

```bash
python -m unittest discover -s tests -v
python -m pip check
```

Se editar o JavaScript e tiver Node.js disponível, confira também:

```bash
node --check static/app.js
```

## Quando você concluiu esta etapa

Você deve conseguir localizar a montagem do contexto, explicar onde uma ação é executada e apontar quais dependências são simuladas nos testes. Registre uma execução normal e um resultado de teste antes de alterar o código nos desafios.

[Continue em desafios](04-desafios.md).
