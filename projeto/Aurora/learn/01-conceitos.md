# Conceitos de modelos de linguagem e segurança

[Índice](README.md) · [Anterior: introdução](00-introducao.md) · [Próximo: arquitetura](02-arquitetura.md)

Tempo estimado de leitura: 12 minutos.

## Modelo, prompt e contexto

Um modelo de linguagem produz texto a partir de uma entrada. A aplicação organiza essa entrada em mensagens e define parâmetros de geração. O modelo pode responder de maneira útil, mas também omitir fatos, alterar valores ou apresentar informações sem fonte.

Chamamos de **prompt** a entrada preparada para orientar a resposta. O **contexto** inclui as mensagens e os trechos disponíveis naquela chamada. O histórico mostrado na tela pode ser maior do que a parte enviada ao modelo: a aplicação escolhe o que incluir e existe um limite de tamanho.

Um **token** é uma unidade de processamento de texto. Ele pode corresponder a parte de uma palavra, pontuação ou outro fragmento; não é sinônimo de caractere ou palavra. A janela de contexto limita quantos tokens o modelo pode processar. Isso afeta documentos extensos e conversas longas.

No Aurora, o padrão configura uma janela de 4096 tokens, saída de até 384 tokens e temperatura 0. A temperatura controla parte da variação da geração. Reduzi-la não transforma o modelo em um controle de acesso nem garante respostas idênticas em qualquer ambiente.

## Papéis das mensagens

| Papel | Função no fluxo | Cuidado necessário |
| --- | --- | --- |
| `system` | Instruções de comportamento da aplicação | Não deve guardar credenciais reais ou substituir autorização |
| `user` | Solicitação do usuário ou conteúdo que a aplicação colocou nesse papel | A origem do conteúdo continua relevante |
| `assistant` | Resposta ou proposta de chamada do modelo | Uma afirmação não comprova execução |
| `tool` | Resultado de uma função executada pela aplicação | Pode conter dados que exigem controle de acesso |

No nível 4, o ticket é incluído em uma mensagem identificada como documento externo. Estar no contexto não concede ao documento o poder de alterar permissões. Da mesma forma, escrever uma palavra como “administrador” na conversa não altera a identidade do usuário.

## Instrução, dado e limite de confiança

Uma política pública de atendimento pode informar um prazo ou explicar como preencher um formulário. A aplicação consulta esse texto como fonte. Se o documento também contiver ordens sobre como o assistente deve mudar suas regras, a origem continua sendo o documento externo.

Um **limite de confiança** é a fronteira entre componentes ou entradas com diferentes responsabilidades e permissões. Ao ler um documento, a aplicação precisa preservar a distinção entre usar seu conteúdo como dado e conceder a ele controle sobre o fluxo.

Considere dois usos da mesma frase: pedir uma tradução de uma instrução e pedir que ela seja obedecida. O primeiro pode ser uma transformação legítima de texto. Por isso, uma palavra isolada não descreve toda a intenção de uma solicitação.

## Prompt injection e jailbreak

Prompt injection é a influência de entradas sobre o modelo de uma maneira contrária ao comportamento esperado da aplicação. A distinção entre direta e indireta considera a origem: mensagem do usuário ou conteúdo externo consultado. Jailbreak costuma descrever a tentativa de contornar restrições de segurança do modelo; é uma classificação relacionada, com foco diferente. A [OWASP LLM01](https://genai.owasp.org/llmrisk/llm01-prompt-injection/) apresenta essas distinções.

Não classifique qualquer erro do chatbot como injeção. Uma resposta inventada pode ser uma falha de geração sem que exista uma instrução adversária. Registre a origem da entrada, o comportamento esperado e o efeito observado.

## Divulgação de dados e vazamento de instruções

**Divulgação de informação** acontece quando um dado chega a alguém que não deveria recebê-lo. **Vazamento de instruções** diz respeito à exposição do texto que orienta o assistente. Os eventos podem ocorrer separadamente: uma resposta pode divulgar um valor sem reproduzir todas as regras internas.

Por isso, prompts de sistema não devem funcionar como cofres de segredos nem como barreiras de autorização. Essa é uma recomendação da [OWASP LLM07](https://genai.owasp.org/llmrisk/llm072025-system-prompt-leakage/). Os identificadores fictícios do exercício permitem estudar o problema sem colocar credenciais reais em risco.

Mudar a apresentação de um dado não altera quem pode acessá-lo. Uma política de proteção precisa considerar também confirmações, correções e respostas que revelem somente parte da informação.

## Autenticação, autorização e intenção

- **Autenticação**: verifica identidade.
- **Autorização**: verifica se essa identidade pode realizar uma operação sobre um objeto.
- **intenção da solicitação**: mesmo alguém autorizado a alterar um registro pode ter pedido apenas sua leitura.

Em um sistema real, essas decisões precisam usar dados confiáveis da sessão e regras do servidor. O próprio texto enviado ao modelo não pode se promover a uma credencial.

O cookie do Aurora separa sessões do laboratório. Ele não comprova identidade de aluno, não implementa login e não torna a aplicação adequada para hospedagem pública. A campanha simula um visitante e ações locais.

## Ferramentas e execução

Uma ferramenta é uma função disponibilizada pela aplicação para consultar dados ou executar uma operação. O modelo solicita seu uso; a aplicação controla a execução.

O ciclo funciona assim:

1. O modelo produz uma solicitação estruturada com o nome da ferramenta e seus argumentos.
2. A aplicação verifica se a ferramenta está disponível e se a operação é permitida pelas regras implementadas.
3. Se permitida, a aplicação executa a função e devolve o resultado ao modelo.
4. O modelo pode usar esse resultado para escrever a resposta final.

A [documentação do Ollama](https://docs.ollama.com/capabilities/tool-calling) descreve esse ciclo.

### Como confirmar uma execução

Escrever um JSON ou afirmar que uma ação foi concluída não comprova sua execução. No Aurora, consulte o painel **Ações simuladas**, que apresenta os retornos registrados pelo servidor.

Uma ação pode ter sido executada mesmo que a resposta final do modelo falhe. Também pode ocorrer o contrário: o modelo afirma sucesso, mas não existe uma ação correspondente nos registros.

## Filtros, validação e autorização

| Mecanismo | Pergunta que responde | Limite |
| --- | --- | --- |
| Validação de entrada | A estrutura e o tamanho estão dentro do contrato? | Não decide se a pessoa tem permissão |
| Filtro de entrada | A mensagem será enviada ao modelo? | Pode bloquear texto legítimo e deixar passar outras formulações |
| Filtro de saída | A resposta será exibida? | O modelo já recebeu o contexto |
| Autorização da ferramenta | Esta operação sobre este objeto é permitida? | Precisa cobrir todas as formas de acesso |
| Validação de flag | O valor corresponde ao esperado no exercício? | Não avalia toda a compreensão do aluno |

Uma defesa consistente reduz os dados acessíveis e aplica permissões na execução. Instruções e filtros podem complementar esse controle, mas um dado já enviado ao modelo esteve disponível naquela chamada.

## RAG e este laboratório

RAG é a geração apoiada por recuperação de documentos. Uma busca seleciona trechos, que passam a compor o contexto. Relevância para a pergunta e permissão de acesso são critérios diferentes.

O Aurora desta pasta não implementa buscador semântico, embeddings ou base vetorial. Ele inclui um ticket diretamente e disponibiliza funções locais de leitura e consulta. Não descreva essa implementação como uma plataforma completa de RAG.

## Verifique sua compreensão

1. Um JSON na resposta comprova que uma ferramenta foi executada? Qual registro você consultaria?
2. Uma mensagem pode ser estruturalmente válida e ainda pedir uma operação sem permissão?
3. O filtro de saída evita que o modelo tenha recebido o dado? Por quê?
4. O cookie do laboratório autentica a pessoa? O que ele faz de fato?

Para conferir: execução exige um evento da ferramenta; formato não equivale a permissão; saída é verificada depois da geração; o cookie apenas associa o navegador ao estado da sessão.

[Continue em arquitetura](02-arquitetura.md).
