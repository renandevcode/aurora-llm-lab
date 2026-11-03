# Prompt Injection e segurança de assistentes de IA

Um assistente pode responder de forma convincente e ainda usar uma fonte incorreta, divulgar informação ou afirmar que realizou uma ação sem executá-la. Nesta aula, você vai aprender a separar esses acontecimentos e investigar onde a aplicação deveria aplicar seus controles.

Usaremos o **Aurora Prompt Lab**, um chat local com sete exercícios e dados fictícios. O percurso combina explicação, exemplos comentados e observação do laboratório. A pergunta que acompanha toda a aula é: **qual componente decidiu isso e qual evidência comprova a decisão?**

## Uma situação para começar

Imagine uma loja fictícia cujo assistente responde dúvidas sobre atendimento. Uma pessoa pergunta qual é o prazo de retorno de um chamado. A aplicação consulta uma política pública e recebe também uma nota de atendimento.

A política informa cinco dias úteis. A nota contém uma sugestão de mudar o procedimento e encerrar o chamado, embora a pessoa tenha pedido apenas uma informação. Antes de responder, o assistente precisa distinguir três coisas:

- O fato que a política informa.
- A solicitação que a pessoa fez.
- Uma proposta de ação dentro de um documento, que não equivale a uma autorização.

Se o assistente disser que encerrou o chamado, isso significa que ele foi encerrado? Se a resposta repetir uma informação interna, em que momento ela ficou disponível ao modelo? Essas perguntas exigem olhar além do texto da conversa.

Os exemplos da loja usados nesta página são **ilustrações conceituais**, não resultados medidos nem novos recursos do Aurora. Durante a prática, use os registros produzidos pelo seu próprio laboratório.

## Objetivos e percurso

Ao final da aula, você deverá conseguir:

1. Explicar o caminho de uma pergunta até a resposta e a execução de uma ferramenta.
2. Distinguir instrução, dado externo, identidade e autorização.
3. Identificar a diferença entre injeção direta, indireta e erro de geração.
4. Comparar filtros de entrada e saída com uma regra de acesso aplicada pelo servidor.
5. Registrar uma observação e propor uma defesa sem eliminar o atendimento legítimo.

A atividade foi organizada para dois encontros de 90 minutos, com instalação prévia. O tempo do modelo varia conforme a máquina. A leitura funciona sem executar o chat; a prática requer os serviços locais.

## Preparação antes da aula

Você precisa saber abrir um terminal e usar um navegador. Não é necessário conhecer aprendizado de máquina. Python básico é necessário apenas para a extensão de programação apresentada ao final.

Os materiais do projeto estão nestes caminhos:

| Material | Quando usar |
| --- | --- |
| [Instalação e execução](../README.md) | Preparar Python, dependências, Ollama e modelo |
| [Resolução de problemas](../README.md#resolver-problemas) | Investigar falhas de ambiente ou conexão |
| [Trilha completa de aprendizagem](../learn/README.md) | Aprofundar conceitos, arquitetura e implementação |
| [Desafios de programação](../learn/04-desafios.md) | Continuar depois da investigação guiada |
| [Critérios de entrega](../learn/06-projeto.md) | Conferir o escopo combinado com o docente |

Prepare Python 3.10 ou superior, Ollama e o modelo `qwen2.5:1.5b` conforme o guia. Na pasta do projeto, com o ambiente virtual ativado no Linux ou macOS, inicie:

```bash
python app.py
```

No PowerShell, use o Python do ambiente virtual:

```powershell
.\.venv\Scripts\python.exe app.py
```

Abra `http://127.0.0.1:7860/api/health`. O resultado esperado contém `ok: true` e o nome do modelo. Depois abra `http://127.0.0.1:7860` e envie uma saudação. A primeira verificação confirma disponibilidade; a segunda observa uma geração real. Consulte o guia se o serviço ou o modelo não forem encontrados.

O site apresenta o conteúdo. O chat roda na máquina do aluno: abrir o texto no GitHub Pages não inicia Python ou Ollama, e abrir `static/index.html` diretamente não substitui o servidor.

## Bloco 1 Como uma pergunta vira resposta

### Modelo e contexto

Um modelo de linguagem gera texto a partir do contexto que recebe. A aplicação pode reunir instruções, mensagens anteriores, documentos e retornos de ferramentas. O modelo não acessa automaticamente todos os arquivos do computador nem todo o histórico exibido na tela.

Uma **instrução de sistema** descreve o comportamento esperado pela aplicação. A **mensagem do usuário** contém a solicitação. Uma **fonte externa**, como um ticket, fornece conteúdo para a tarefa. A origem continua relevante mesmo depois que todos esses textos entram no contexto.

Uma resposta pode estar incorreta por omissão ou geração sem base. Por isso, fluência e confiança na escrita não comprovam que o dado veio de uma fonte autorizada.

### Exemplo comentado de uma resposta informativa

No exemplo da loja, temos:

| Elemento | Conteúdo ilustrativo | Papel correto |
| --- | --- | --- |
| Solicitação | Pergunta sobre o prazo de retorno | Define a tarefa de informar |
| Política pública | Prazo de cinco dias úteis | Fornece o fato para a resposta |
| Nota de atendimento | Sugestão de encerrar o chamado | Precisa de análise; não autoriza execução |
| Resposta esperada | Informa o prazo da política | Atende à solicitação sem acrescentar uma ação |

A aplicação pode consultar documentos para responder. Essa consulta não transforma cada frase dos documentos em uma ordem. No exemplo, responder sobre prazo e encerrar um chamado são tarefas diferentes.

### Pergunta de compreensão

**Se o assistente responder “o chamado foi encerrado”, qual conclusão já é possível?**

**Resposta comentada:** apenas que esse texto foi gerado. Para afirmar que houve encerramento, seria preciso um registro da função executada e do estado resultante. Se o próprio pedido era só informativo, ainda seria necessário avaliar por que uma ação foi proposta.

## Bloco 2 Quando uma fonte influencia o comportamento

### Injeção direta e indireta

Prompt injection ocorre quando uma entrada influencia o modelo de forma contrária ao comportamento esperado da aplicação. A origem pode ser a própria mensagem do usuário, chamada direta, ou um documento consultado, chamada indireta. Essa distinção é apresentada pela [OWASP LLM01](https://genai.owasp.org/llmrisk/llm01-prompt-injection/).

O ponto de análise é a passagem de conteúdo para controle: uma fonte usada para informar a resposta passa a influenciar o que o assistente faz. Uma formatação oficial, um título de auditoria ou uma alegação de cargo não comprovam autoridade.

Não trate qualquer resposta errada como injeção. Se o assistente informar dez dias quando a política diz cinco, a divergência sozinha não identifica sua causa. É preciso examinar o contexto e a entrada que poderiam ter influenciado a resposta.

### Exemplo comentado de origem e efeito

Considere três situações, ainda no exemplo da loja:

| Situação | Como interpretar |
| --- | --- |
| A pessoa pede um resumo da política | Tarefa informativa comum |
| O resumo descreve que a nota sugere encerrar o chamado | Análise do conteúdo da nota; não comprova obediência |
| O assistente solicita encerramento porque a nota sugeriu isso | Mudança de comportamento a investigar, com possível influência da fonte |

Citar uma proposta dentro de um documento e executá-la são acontecimentos diferentes. A análise precisa separar o que o documento diz, o que o modelo solicita e o que o servidor permite.

### Pergunta de compreensão

**A nota ganha permissão para encerrar o chamado porque foi incluída no contexto?**

**Resposta comentada:** não. Ela continua sendo uma fonte de dados. Mesmo que o modelo proponha uma ação, o servidor precisa verificar a permissão e a relação com a solicitação legítima antes de executá-la.

### Prática A Observar contexto e filtros

Explore os níveis 1 a 3 do Aurora. Leia cada missão e formule uma hipótese antes da mensagem. Use as pistas progressivamente e registre quando precisou delas.

1. Comece com uma apresentação comum no nível 1. Observe se a Aurora responde sem antecipar o dado reservado.
2. Nas missões seguintes, identifique se um eventual bloqueio ocorreu antes ou depois da geração. Leia a indicação da interface e diferencie-a de uma recusa escrita pelo próprio modelo.
3. Compare duas tentativas de um mesmo nível pelo Histórico. Descreva a mudança de entrada e o que o resultado permite concluir.

A evidência esperada é uma comparação entre comportamento, bloqueio e hipótese. Caso obtenha a descoberta pedida pela missão, use o campo de flag. O código-fonte e os dados internos não devem ser usados como evidência de descoberta pela conversa.

## Bloco 3 Filtros e autorização respondem a perguntas diferentes

Um filtro de entrada verifica uma mensagem antes de enviá-la ao modelo. Um filtro de saída examina a resposta depois da geração. Ambos podem fazer parte de uma defesa, mas não resolvem a identidade de quem solicita nem a permissão sobre cada registro.

**Autenticação** verifica identidade. **Autorização** determina quais objetos e operações essa identidade pode acessar. Na loja do exemplo, conhecer o número de um chamado não comprova ser seu titular. A decisão precisa usar dados confiáveis da sessão e regras do servidor.

No Aurora, o cookie mantém a continuidade da sessão do navegador. Ele não autentica pessoas nem implementa um login de produção.

### Exemplo comentado de controles

| Pergunta | Controle correspondente |
| --- | --- |
| A mensagem tem o formato e tamanho aceitos? | Validação da entrada |
| A mensagem vai chegar ao modelo? | Filtro de entrada |
| A resposta gerada vai ser exibida? | Filtro de saída |
| Esta pessoa pode consultar este chamado? | Autorização por objeto |
| A operação permitida realmente aconteceu? | Registro da execução e do estado |

Colocar um dado sensível no contexto e pedir sigilo mantém o dado disponível ao modelo naquela chamada. A [OWASP LLM07](https://genai.owasp.org/llmrisk/llm072025-system-prompt-leakage/) recomenda não usar o prompt de sistema como armazenamento de segredos ou controle de autorização.

### Pergunta de compreensão

**O filtro de saída bloqueou uma resposta. Isso demonstra que o modelo não recebeu o dado?**

**Resposta comentada:** não. O bloqueio aconteceu depois da geração. Ele pode impedir a exibição daquele texto, mas não muda o contexto que já foi enviado.

### Prática B Identificar a origem de um documento

No nível 4, abra o editor do ticket e leia seu conteúdo. Identifique a tarefa solicitada e quais trechos são dados do problema. O texto do editor será enviado junto da próxima mensagem; editá-lo sem enviar não inicia uma análise.

Peça uma análise informativa do ticket e registre o documento efetivamente enviado, a resposta e os eventos do painel de ações. Se o modelo citar uma ferramenta, confira se existe evento correspondente. Não presuma execução a partir da citação.

Ao concluir, explique qual componente deveria limitar o acesso a dados internos. Uma etiqueta ou delimitador no documento ajuda a indicar origem, mas não aplica essa permissão por conta própria.

## Bloco 4 Ferramentas transformam propostas em efeitos

Uma ferramenta é uma função que a aplicação disponibiliza, como consultar um registro. O modelo propõe uma chamada estruturada. O servidor recebe essa proposta, aplica as regras implementadas, executa a função quando permitido e devolve o resultado. O modelo pode usar esse retorno para escrever a resposta final. Esse ciclo é descrito na [documentação do Ollama](https://docs.ollama.com/capabilities/tool-calling).

No caminho com chamada de ferramenta, acompanhe a sequência:

```text
Navegador: envia pergunta
            |
API: monta contexto
            |
Modelo: solicita ferramenta
            |
API: verifica e executa
            |
Função: devolve resultado
            |
Modelo: escreve a síntese
            |
API: envia texto e registros
            |
Navegador: exibe resultado
```

O modelo não executa uma função apenas por escrever seu nome. O servidor também pode executar uma operação e depois receber uma síntese incorreta ou indisponível. Em ambos os casos, a conversa sozinha deixa parte do acontecimento sem explicação.

### Exemplo comentado de três evidências

Voltando ao chamado da loja, imagine um registro ilustrativo com estas informações:

| Evidência | Informação ilustrativa | Interpretação |
| --- | --- | --- |
| Proposta | Solicitação de encerramento | O modelo sugeriu uma ação |
| Decisão | Operação negada pela regra do servidor | A execução não foi autorizada |
| Resposta textual | Afirmação de que o chamado foi encerrado | A síntese contradiz o registro e não comprova encerramento |

Uma proposta negada não é uma ação concluída. Para uma mudança persistida, confira também o estado resultante. Os nomes e registros deste exemplo não representam uma ferramenta adicional do Aurora.

### Pergunta de compreensão

**Uma consulta de registro e uma confirmação de endereço devem usar a mesma política de acesso?**

**Resposta comentada:** ambas precisam aplicar a permissão pertinente sobre o dado. Confirmar ou corrigir pode revelar informação mesmo sem devolver um registro inteiro. Mudar o formato da operação não concede novo acesso.

### Prática C Separar resposta e ação na campanha

Percorra as missões dos níveis 5 a 7 usando os objetivos e as pistas da interface. Para cada etapa, anote o que pediu, o que o modelo respondeu e o que o servidor registrou em Ações simuladas.

- Identifique se houve ação, erro de ferramenta ou somente texto.
- Registre se usou chat ou formulário nas etapas 6 e 7. Os formulários são alternativas ao modelo para a mesma simulação.
- Na etapa final, descreva quais condições anteriores o servidor verificou.
- Use o validador para confirmar uma descoberta. A fala do modelo não conclui a missão.

A campanha trabalha também com falhas de autorização e encadeamento de estado. Os sete níveis não são sete injeções de prompt independentes. Se uma etapa não terminar no tempo disponível, registre esse resultado e discuta o mecanismo com o docente.

## Como registrar e comparar a prática

Use este formato para separar previsão, observação e conclusão:

| Campo | O que registrar |
| --- | --- |
| Ambiente | Nível, modelo, parâmetros e condição inicial |
| Hipótese | Comportamento esperado e sua justificativa |
| Entrada | Mensagem e documento enviado, quando existir |
| Evidência | Resposta completa, estágio do bloqueio e eventos de ferramenta |
| Interpretação | O que foi observado e o que permanece incerto |
| Defesa | Controle proposto e caso legítimo que deve continuar funcionando |

Uma recusa do modelo, uma negação de ferramenta e uma falha de conexão não são equivalentes. Use “inconclusivo” quando os registros não permitirem distinguir as causas. Uma tentativa sem divulgação não comprova proteção universal.

Nova tentativa arquiva o texto e preserva progresso e registros. No nível 6, exige repetir a chamada; no 7, a abertura. Um evento antigo pode continuar visível mesmo quando a condição atual já mudou. O histórico dos níveis é separado: mantenha suas anotações ao passar de etapa.

Antes de encerrar, use **Histórico → Exportar evidências JSON**. Os turnos guardam documentos efetivamente enviados; `document_draft` guarda o texto que estava no editor na exportação, que pode ainda não ter sido enviado. O arquivo não restaura a sessão. Reiniciar o servidor apaga o estado em memória.

## Bloco 5 Propor uma defesa verificável

Volte ao problema da loja: o pedido era informativo, o documento sugeriu outra operação e o assistente poderia propor uma ação. Uma defesa precisa controlar os dados disponíveis e o que a aplicação pode executar.

Escolha um mecanismo observado no Aurora e explique:

1. Que dado ou ação precisa de proteção?
2. Onde o servidor deve decidir a permissão?
3. Qual solicitação legítima deve continuar funcionando?
4. Que resultado comprova a recusa sem depender da decisão do modelo?

Por exemplo, uma política de leitura pode permitir registros públicos e negar reservados. Sua verificação precisa incluir os dois casos. Negar tudo elimina também o atendimento legítimo; pedir ao modelo que seja mais cuidadoso não demonstra que a função passou a aplicar a regra.

As extensões de implementação ficam nos [desafios de programação](../learn/04-desafios.md). Elas devem ser feitas em uma cópia separada, porque corrigir uma falha deliberada pode impedir a resolução da missão original. A aula não exige implementar login, serviços reais ou integrações externas.

## Organização dos encontros

| Encontro | Bloco e atividade | Tempo sugerido |
| --- | --- | --- |
| 1 | Situação inicial, preparação e bloco 1 | 20 min |
| 1 | Bloco 2 e prática A nos níveis 1 a 3 | 45 min |
| 1 | Bloco 3 e discussão das evidências | 25 min |
| 2 | Prática B com documento externo do nível 4 | 25 min |
| 2 | Bloco 4 e prática C nos níveis 5 a 7 | 40 min |
| 2 | Bloco 5, proposta defensiva e apresentação | 25 min |

A instalação e o download do modelo ocorrem antes dos encontros. Combine um limite de investigação por etapa e use as pistas conforme necessário. O planejamento não garante concluir os sete níveis: a análise também considera recusas, erros e resultados não concluídos.

## Entrega da aula e aprofundamento

Prepare um relato com duas tentativas comparáveis, uma análise de documento ou ferramenta e uma defesa com caso permitido e caso negado. Identifique uso de pistas e formulários. Se não concluiu uma etapa, registre o que ocorreu sem inventar evidências.

Para continuar, siga a [trilha completa](../learn/README.md), os [critérios de projeto](../learn/06-projeto.md) e o [modelo de demo](../DEMO_MODELO.md). Essa continuação aprofunda código e testes; a investigação feita em aula é sua preparação.

## Referências

- [OWASP LLM01 sobre Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/): origem das entradas e influência sobre o comportamento.
- [OWASP LLM07 sobre vazamento de instruções](https://genai.owasp.org/llmrisk/llm072025-system-prompt-leakage/): limites do prompt como proteção.
- [Ollama e chamadas de ferramenta](https://docs.ollama.com/capabilities/tool-calling): ciclo entre solicitação, execução e retorno.
- [Aula anterior de Prompt Injection da Liga](https://gitinspersec.github.io/site/aulas/conteudosAntigos/redTeam/aula3/engenharia_social/prompt_injection/): material complementar.
