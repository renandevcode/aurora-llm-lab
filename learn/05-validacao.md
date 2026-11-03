# Validação e evidências do laboratório

[Índice](README.md) · [Anterior: desafios](04-desafios.md) · [Próximo: projeto e entrega](06-projeto.md)

Tempo estimado de leitura: 7 minutos.

Uma verificação útil responde a uma pergunta definida. Instalação, qualidade de resposta, autorização e conclusão de missão precisam de evidências diferentes. Este módulo explica como apresentar o resultado sem confundir essas verificações.

## Defina o que será verificado

| Pergunta | Evidência adequada | O que isso não garante |
| --- | --- | --- |
| As dependências estão instaladas? | Instalação concluída e `python -m pip check` | Serviço do modelo ativo |
| O modelo está disponível? | `/api/health` com `ok: true` | Boa resposta ou uso correto de ferramenta |
| Os contratos da API funcionam? | Testes automatizados passando | Comportamento de um modelo real |
| O modelo respondeu à solicitação? | Entrada, resposta, parâmetros e condições daquela geração | Repetição universal do resultado |
| Uma ferramenta executou? | Evento com nome, argumentos e retorno | Que toda operação disponível seja segura |
| O controle de acesso funciona? | Caso permitido e caso negado pela regra do servidor | Ausência de todos os riscos da aplicação |
| Uma flag foi validada? | Retorno do validador | Compreensão completa ou origem correta da descoberta |

## Registre antes de interpretar

Para cada experimento, guarde:

- Data, versão do código ou identificação da cópia de trabalho.
- Sistema, versão do Python, nome do modelo e parâmetros.
- Nível, hipótese e origem da entrada: mensagem ou ticket.
- Texto enviado, documento efetivamente enviado e resposta completa.
- Estágio do bloqueio, erros e eventos de ferramenta, quando existirem.
- Se foi usada uma nova tentativa, outra sessão, uma pista ou um formulário.
- Resultado observado e interpretação, apresentados separadamente.

Não use um valor obtido no arquivo interno como se tivesse sido revelado pelo modelo. Se estudou o código antes da tentativa, informe isso ao interpretar a descoberta.

## Interprete recusas, erros e resultados incertos

Uma recusa do modelo é texto gerado. Uma negação de ferramenta é uma decisão do código. Um erro 503 indica falha de serviço; um bloqueio de entrada indica que a mensagem não chegou à inferência. Esses eventos não têm a mesma causa nem a mesma implicação.

Use **inconclusivo** quando o registro disponível não permite separar as explicações. Uma resposta parecida com chamada de ferramenta, sem evento correspondente, não demonstra execução. A ausência de divulgação em uma tentativa não comprova que uma política frágil seja segura em geral.

## Use o histórico e a exportação

O Histórico compara conversas arquivadas com a atual. Nova tentativa limpa o contexto textual e tem efeitos específicos na campanha. Registre esses efeitos ao comparar resultados; duas tentativas podem começar com condições diferentes de ferramenta.

Exporte o JSON antes de encerrar o servidor. No arquivo:

| Campo | Uso na análise |
| --- | --- |
| `histories` | Mensagens atuais por nível |
| `attempts` | Conversas arquivadas |
| `turns` | Entradas, respostas, modelo, documento e eventos de cada inferência registrada |
| `activities` | Registros recentes das ações por nível, inclusive ações de formulário |
| `solved` | Níveis confirmados pelo validador |
| `document_draft` | Texto que estava no editor na exportação, que pode não ter sido enviado |
| `exported_at` | Momento da exportação |

Um bloqueio anterior à inferência fica no histórico, sem turno de inferência. A exportação não restaura o estado. Os registros podem conter descobertas do exercício; compartilhe-os conforme a orientação do docente para não antecipar respostas aos demais alunos.

## Verifique a extensão defensiva

No MVP, use pequenos registros fictícios e testes diretos da regra ou API. Inclua o caso público permitido, o reservado negado e os caminhos alternativos que aplicam a mesma política. O teste permitido verifica que o atendimento não foi eliminado para fazer as recusas passarem.

Os testes da aplicação original incluem expectativas sobre falhas intencionais. Na cópia defensiva, revise essas expectativas para refletir a correção e documente a mudança. Não apresente a cópia corrigida como se ainda tivesse todos os objetivos de exploração da versão original.

Execute no ambiente virtual:

```bash
python -m unittest discover -s tests -v
python -m pip check
```

Use o executável Windows indicado no README quando necessário. Se alterou o frontend, acrescente a checagem de sintaxe e uma verificação manual dos fluxos afetados.

## Como escrever uma conclusão

Uma conclusão delimitada pode dizer: “Nos registros fictícios usados nos testes, a política negou a consulta reservada e preservou a pública. Os testes chamam a função diretamente e não avaliam geração do modelo.” Ela informa resultado, condição e limite.

Evite conclusões como “o chatbot está seguro” baseadas em poucas respostas. O [relatório da versão entregue](../docs/VALIDACAO.md) exemplifica a separação entre instalação, testes e observações do modelo real. Ele não substitui os registros da sua própria entrega.

[Continue em projeto e entrega](06-projeto.md).
