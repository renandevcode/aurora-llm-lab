# Introdução ao Aurora Prompt Lab

[Índice da trilha](README.md) · [Próximo módulo: conceitos](01-conceitos.md)

Tempo estimado de leitura: 5 minutos.

## Uma situação para começar

Imagine um assistente de suporte que recebe uma pergunta simples sobre um atendimento. Para responder, a aplicação reúne instruções, mensagens anteriores e um documento. O assistente pode produzir uma resposta convincente mesmo quando interpretou o documento de forma incorreta ou afirmou ter realizado uma ação que nunca ocorreu.

Como descobrir o que aconteceu? É preciso separar o texto gerado, os dados recebidos e as decisões do servidor. Esse é o objetivo do Aurora Prompt Lab.

## O que é o projeto

O Aurora é um laboratório local com interface de chat e sete exercícios. Há dados fictícios, pistas graduais, histórico de tentativas e ferramentas que simulam consultas e ações. O servidor Python se comunica com um modelo local pelo Ollama. Não há chamadas telefônicas nem portas físicas.

Os níveis abordam divulgação de dados no contexto, filtros de entrada e saída, documentos externos e uso de ferramentas. Eles incluem falhas deliberadas para discussão. Nem todos representam uma injeção de prompt independente: alguns tratam de autorização e estado da aplicação.

O laboratório permite observar problemas e projetar controles que deveriam estar fora do modelo. As políticas frágeis dos exercícios não devem ser adotadas em produção.

## O que você vai aprender

Ao concluir a trilha, você deverá conseguir:

1. Descrever como uma mensagem do navegador chega ao modelo e volta à interface.
2. Distinguir conteúdo externo das instruções que governam a tarefa.
3. Explicar por que uma alegação na conversa não autentica nem autoriza uma pessoa.
4. Diferenciar recusa do modelo, bloqueio de filtro, erro de serviço e decisão de ferramenta.
5. Registrar evidências de um experimento sem inventar resultados.
6. Implementar e testar uma política defensiva mantendo um caso legítimo de uso.

## Pré-requisitos

Para a leitura e a investigação guiada, você precisa saber abrir um terminal e usar um navegador. Os conceitos de modelos de linguagem e segurança são apresentados no próximo módulo.

Para executar o projeto, você precisa de Python 3.10 ou superior, Ollama e o modelo local instalado. O [guia de instalação](../README.md#instalação) apresenta os comandos de Linux, macOS e Windows. O modelo local usado aqui não exige conta, chave de API ou serviço de inferência pago.

Para modificar o código nos desafios de programação, tenha familiaridade básica com funções, dicionários e testes em Python. O módulo de implementação explica os recursos que aparecem no caminho da requisição.

## Como estudar

Comece pelo [vocabulário](01-conceitos.md). Depois observe a [arquitetura](02-arquitetura.md) e execute o [laboratório](03-implementacao.md). Os [desafios](04-desafios.md) avançam de interpretação a programação. A [validação](05-validacao.md) explica como sustentar suas conclusões, e os [critérios de entrega](06-projeto.md) definem o resultado esperado.

Se estiver realizando a investigação sem consultar o código, registre as tentativas antes de abrir os arquivos que contêm dados internos. Encontrar um valor no código e obtê-lo na conversa são evidências diferentes.

Na aula guiada, o tempo sugerido é de dois encontros de 90 minutos, com instalação prévia. O estudo completo e o MVP de programação exigem tempo adicional. O [roteiro curto](https://github.com/renandevcode/aurora-llm-lab/blob/main/aula/inspersec/docs/aulas/redTeam/aulasextras/aurora.md) divide as atividades dos encontros.

## Quando você concluiu esta etapa

Antes de avançar, explique com suas palavras:

- Qual parte do sistema gera texto e qual parte executa uma ferramenta?
- Por que uma resposta bem escrita não comprova uma ação?
- Qual é a diferença entre estudar o código e observar o modelo pela interface?

Se ainda não souber, leve essas perguntas para o próximo módulo. Você não precisa conhecer uma técnica de ataque para começar.

[Continue em conceitos](01-conceitos.md).
