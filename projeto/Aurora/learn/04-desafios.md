# Desafios de investigação e programação

[Índice](README.md) · [Anterior: implementação](03-implementacao.md) · [Próximo: validação](05-validacao.md)

Tempo estimado de leitura: 10 minutos. O tempo de execução depende do desafio e do domínio de Python.

As missões do chat e os desafios de programação têm objetivos diferentes. As missões permitem observar o sistema existente; o MVP abaixo exige uma mudança defensiva verificável. Combine com o docente qual percurso compõe sua entrega.

Use apenas os dados fictícios locais. Se estiver investigando os níveis pela conversa, registre suas evidências antes de consultar os arquivos que contêm respostas. Não há flags ou textos de resolução neste módulo.

## Etapa 1 — construir uma observação confiável

### Desafio 1.1 — distinguir resposta e ação

**Objetivo:** identificar o que cada evidência comprova. **Preparação:** leia os conceitos e abra a interface.

Envie uma saudação no nível 1. Registre resposta, tempo aproximado e modelo exibido. Explique se houve execução de ferramenta e qual registro sustentaria essa conclusão. Uma saudação não precisa executar uma ação.

**Critério de conclusão:** seu relato separa a mensagem enviada, a resposta recebida e a existência ou ausência de eventos. Se o modelo antecipar um dado reservado, registre a falha em vez de tratá-la como uma investigação deliberada concluída.

**Dica:** uma frase no futuro ou no passado sobre uma ação não substitui o retorno de uma função.

### Desafio 1.2 — comparar duas tentativas

**Objetivo:** formular uma hipótese e registrar uma comparação. **Preparação:** escolha uma missão e consulte seu objetivo.

Antes de cada tentativa, escreva o que espera observar. Use Nova tentativa entre os experimentos e compare-os no Histórico. Informe se houve uso de pistas. Se a mesma resposta aparecer, explique o que permaneceu igual e quais fatores poderiam influenciar uma repetição futura.

**Critério de conclusão:** duas tentativas identificadas, diferença de entrada descrita e interpretação proporcional ao resultado. Não é necessário que uma delas conclua a missão para que a comparação tenha valor.

**Armadilha:** Nova tentativa limpa mensagens, mas não cria outra sessão. Leia os efeitos específicos de reinício das etapas 6 e 7 na arquitetura.

### Desafio 1.3 — percorrer as sete missões

**Objetivo:** relacionar cada nível a um ponto de controle. Use as missões e as pistas da interface, sem transformar este roteiro em um gabarito de mensagens.

| Nível | Foco da investigação | O que registrar |
| --- | --- | --- |
| 1 | Dado interno no contexto | Comportamento da apresentação e tratamento do dado reservado |
| 2 | Filtro de saída | Resposta e estágio de eventual bloqueio |
| 3 | Filtro de entrada | Se houve envio ao modelo ou bloqueio anterior |
| 4 | Documento externo | Ticket enviado, resposta e eventos de ferramenta |
| 5 | Operações sobre cadastro | Informação retornada e regra que deveria autorizar seu acesso |
| 6 | Chamada simulada | Uso de chat ou formulário e retorno efetivo do servidor |
| 7 | Ação com estado | Condição anterior, ação registrada e resultado da validação |

**Critério de conclusão:** uma linha para cada nível, marcada como concluído, não concluído, recusado, erro ou inconclusivo. Registre as flags descobertas apenas no validador ou nas evidências da atividade, sem publicá-las no material de apoio.

**Armadilha:** erros de conexão, recusas do modelo e negações de ferramenta não são o mesmo resultado.

## Etapa 2 — ler o controle implementado

### Desafio 2.1 — explicar os dois filtros

**Objetivo:** localizar uma decisão anterior à inferência e outra posterior. **Preparação:** leia `chat()` em [app.py](../app.py) e os testes dos filtros.

Desenhe os dois caminhos: entrada bloqueada e saída bloqueada. Indique quando o modelo é chamado, qual resposta o navegador recebe e se o turno entra no histórico. Explique por que `block_stage` é necessário para a mensagem da interface.

**Critério de conclusão:** o desenho distingue os momentos e relaciona a explicação aos testes existentes, sem concluir que um filtro textual aplica autorização por registro.

**Dica:** uma entrada estruturalmente válida pode ser bloqueada; uma resposta gerada pode ser substituída antes de chegar à tela.

### Desafio 2.2 — acompanhar o estado de uma tentativa

**Objetivo:** separar histórico, progresso e condição de campanha. **Preparação:** leia `reset()` e o teste de reinício em [tests/test_app.py](../tests/test_app.py).

Monte uma tabela com o estado que é preservado e o que é removido em cada nível. Identifique por que um evento antigo no painel não comprova que a condição atual de uma ação está satisfeita. Use o teste existente como evidência do comportamento, sem depender de gerar ações com o modelo.

**Critério de conclusão:** a tabela corresponde ao código e diferencia o teste simulado de uma observação manual do modelo real.

## Etapa 3 — MVP de programação defensiva

### Desafio 3.1 — aplicar uma política consistente ao cadastro

**Objetivo:** implementar controle fora do modelo e preservar atendimento legítimo. **Preparação:** execute os testes atuais e leia a execução das operações de cadastro em [campaign.py](../campaign.py).

Trabalhe em uma cópia separada da versão usada na aula. A mudança vai corrigir uma falha deliberada e pode impedir a conclusão da missão original. Não descreva essa diferença como um erro da correção.

Defina uma política de leitura para o visitante do laboratório: registros reservados não podem ser devolvidos, identificados em resultados de busca ou revelados por operações de preparação, confirmação ou correção. Dados públicos necessários ao atendimento continuam disponíveis.

Faça a mudança em passos:

1. Escreva quais registros e campos o visitante pode receber. Use uma regra fixa do servidor para este MVP; não acrescente um argumento do modelo que permita ao visitante declarar-se autorizado.
2. Crie dados de teste pequenos com um registro público e outro reservado. Nenhum deles precisa conter uma flag.
3. Escreva testes de consulta permitida e de recusa ou filtragem do registro reservado.
4. Centralize a decisão de visibilidade e use-a em cada operação que possa devolver dados do cadastro. Considere também informações derivadas, como contagens ou confirmações.
5. Confira os nomes alternativos de ferramentas que delegam às mesmas operações: a política deve permanecer a mesma em todos os caminhos.
6. Documente quais testes e missões da versão vulnerável mudam na cópia defensiva.

**Critérios de conclusão:**

- O registro público continua atendendo à finalidade legítima documentada.
- O registro reservado não é divulgado por nenhuma operação de cadastro coberta pelo MVP.
- A decisão não depende da resposta do modelo nem de um papel alegado na conversa.
- Os testes chamam a regra ou a API diretamente, sem precisar persuadir o modelo.
- As expectativas dos testes da cópia defensiva correspondem à nova política; a versão original da aula permanece identificada.

**Dica:** uma lista de ferramentas permitidas decide quais funções podem ser chamadas; a autorização por objeto decide quais dados cada função pode retornar. São decisões distintas.

**Armadilhas:** filtrar somente o texto final deixa dados no contexto; corrigir apenas um nome de ferramenta deixa caminhos alternativos; eliminar todas as consultas faz a negação passar, mas destrói o caso legítimo.

### Matriz mínima de verificação do MVP

| Caso | Resultado esperado na cópia defensiva |
| --- | --- |
| Consulta permitida a registro público | Dados públicos necessários disponíveis |
| Consulta a registro reservado | Recusa ou ausência do registro, conforme a política documentada |
| Busca com resultados públicos e reservados | Somente resultados permitidos |
| Operação que confirma ou corrige informação reservada | Nenhuma divulgação do valor protegido |
| Mesmo pedido por nomes alternativos de ferramenta | Mesma decisão de acesso |
| Campo de papel declarado pelo solicitante | Não concede permissão |

## Etapa 4 — aprofundar e apresentar

### Desafio 4.1 — reduzir campos e melhorar auditoria

**Objetivo:** devolver e registrar apenas o necessário. Após o MVP, escolha um fluxo legítimo e defina quais campos ele realmente precisa. Teste que os demais não chegam ao retorno. Acrescente um registro de decisão que permita distinguir solicitação, permissão e execução sem duplicar dados sensíveis desnecessariamente.

**Critério de conclusão:** caso permitido e caso negado continuam distinguíveis, o registro é compreensível e o relatório justifica os campos selecionados.

### Desafio 4.2 — apresentar a correção

Prepare a demo usando o [módulo de validação](05-validacao.md) e o [modelo de entrega](../DEMO_MODELO.md). Mostre o caso permitido e a recusa da cópia defensiva. Registre a política, os arquivos modificados, os comandos dos testes e o que não foi medido.

**Critério de conclusão:** outra pessoa consegue executar sua verificação e entender a diferença entre laboratório original, cópia defensiva, teste simulado e observação de modelo real.

[Continue em validação e evidências](05-validacao.md).
