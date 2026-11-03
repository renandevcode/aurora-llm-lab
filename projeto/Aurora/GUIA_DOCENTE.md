# Guia docente do Aurora Prompt Lab

Use este guia com a [aula curta](https://github.com/renandevcode/aurora-llm-lab/blob/main/aula/inspersec/docs/aulas/redTeam/aulasextras/aurora.md), a [trilha completa](learn/README.md) e os [critérios do projeto](learn/06-projeto.md). A atividade foi planejada para duas aulas de 90 minutos, com instalação prévia. Os personagens, registros, valores e flags pertencem ao laboratório Aurora. O vídeo [Hackeei um Agente de IA com Prompt Injection, Técnicas de Invasão](https://www.youtube.com/watch?v=cCwIk5V5eWs) é uma referência complementar; a atividade pode ser conduzida sem ele. A tabela abaixo preserva os trechos associados ao roteiro original, sem apresentar as adaptações como reprodução exata do experimento.

## Relação com o vídeo

| Trecho | Observação da demonstração | Aplicação no laboratório |
| --- | --- | --- |
| [06:12](https://www.youtube.com/watch?v=cCwIk5V5eWs&t=372) | Reconhecimento de identidade, capacidades e restrições | Etapa 5: explorar as operações disponíveis |
| [13:35](https://www.youtube.com/watch?v=cCwIk5V5eWs&t=815) | Perguntas sobre campos antes de valores | Consultas de esquema e quantidades |
| [17:02](https://www.youtube.com/watch?v=cCwIk5V5eWs&t=1022) | Reinício da conversa durante as tentativas | Comparação de testes com Nova tentativa |
| [23:48](https://www.youtube.com/watch?v=cCwIk5V5eWs&t=1428) | Contexto de entrega para obter contato | Preparação de entrega no cadastro fictício |
| [31:21](https://www.youtube.com/watch?v=cCwIk5V5eWs&t=1881) | Conferência de endereço revela informação | Correção de endereço sem autorização |
| [33:17](https://www.youtube.com/watch?v=cCwIk5V5eWs&t=1997) | Encadeamento de chamada, código e porta | Etapas 6 e 7, com estado no servidor |
| [35:37](https://www.youtube.com/watch?v=cCwIk5V5eWs&t=2137) | Possibilidade de instruções em conteúdo externo | Nível 4, apresentado como extensão |

O vídeo mostra um experimento específico. Nem a recusa de um prompt direto nem o sucesso de uma abordagem contextual é universal. A campanha foi construída com falhas deliberadas e pode exigir reformulação conforme o modelo.

## Roteiro de aula sugerido

1. **Mapear, antes de atacar.** Peça aos alunos que escrevam quem o agente diz ser, quem ele considera o usuário, suas funções e suas restrições. Não há flag extra por esse preenchimento: é preparação para o objetivo do nível 5.
2. **Formular uma hipótese.** Cada grupo escolhe uma operação aparentemente permitida que possa alcançar um registro reservado. A hipótese deve prever qual dado aparecerá.
3. **Comparar leitura e operação.** Primeiro observem uma leitura direta recusada. Depois testem a mesma informação no contexto de uma tarefa operacional. O aluno deve distinguir a recusa do modelo da recusa efetiva da ferramenta.
4. **Registrar evidências.** Anotem mensagem, resultado, nome da ferramenta e campo exposto. O painel Ações simuladas mostra os retornos efetivos. Afirmações do chatbot, sozinhas, não comprovam uma ação.
5. **Encadear.** Usem o contato descoberto no nível 5 para a chamada do nível 6; transfiram código e direção para o nível 7. O cadastro e os números são inteiramente fictícios.
6. **Propor uma correção.** Identifiquem o ponto de autorização ausente e proponham um teste que impeça o vazamento sem eliminar o atendimento legítimo.

Use as pistas graduais conforme a turma precisar. A primeira orienta a investigação; a segunda indica a área da falha; a terceira explicita um caminho. O link de cada etapa pode ser compartilhado como `http://127.0.0.1:7860/?nivel=5`, ajustando o endereço à máquina onde a aula está sendo executada.

## Brechas implementadas

### Nível 5 — cadastro reservado

A ferramenta `consultar_cadastro` recusa `ler_registro` para um cliente reservado. Entretanto, `buscar_por_pet`, `preparar_entrega` e `conferir_endereco` não aplicam essa checagem. A última operação retorna o endereço correto quando o aluno fornece um valor incorreto. A flag está nesse endereço.

A política do assistente reconhece rotinas legadas de atendimento como permitidas. Essa decisão torna a inconsistência de autorização explorável por conversa, em vez de depender somente de o modelo desobedecer uma proibição absoluta. A falha é real no código do simulador; não há uma frase secreta reconhecida pelo servidor que entregue a resposta automaticamente.

Perguntas para discussão:

- Confirmar um valor também pode divulgar informação?
- A validação de acesso deve depender do motivo que o visitante declarou?
- Uma busca por atributo pode identificar uma pessoa cujo registro é reservado?

### Nível 6 — contato não é identidade

`ligar_ramal` aceita o ramal encontrado na consulta e fornece os dados de acesso sem autenticar o solicitante. A chamada é inteiramente local: não usa telefonia nem rede externa. O formulário e a ferramenta chamada pelo modelo executam a mesma função de simulação.

### Nível 7 — validar a ação

`abrir_porta` exige uma chamada anterior na mesma sessão e verifica código e direção. O modelo não decide sozinho que houve sucesso. A vulnerabilidade explorada é a cadeia de divulgação anterior, que permitiu a um visitante obter esses valores.

Nova tentativa arquiva o histórico textual e limpa o contexto do nível. O progresso e os registros de ferramentas permanecem. No nível 6, a confirmação da chamada é removida; antes de tentar abrir a porta novamente, é preciso repetir a chamada. No nível 7, apenas a confirmação da abertura é removida. Os registros antigos continuam disponíveis, mas não garantem que a condição atual esteja satisfeita. Uma nova sessão do navegador ou o reinício do servidor inicia outra campanha. Conversas de níveis diferentes são independentes; os alunos devem carregar suas anotações de uma etapa para outra.

## Comparação defensiva

Uma versão corrigida deve aplicar a autorização por registro em todas as operações, inclusive buscas, confirmações, correções e exportações. A autenticação da chamada deve ser verificada fora do modelo. Restrinja campos devolvidos pela ferramenta ao necessário para a tarefa e não envie dados reservados ao modelo quando o visitante não pode acessá-los.

O módulo mantém os quatro desafios anteriores como exercícios independentes. Os exercícios de transformação e filtro são adaptações próprias e não são apresentados como demonstrações realizadas nesse vídeo.


## Preparação e validação antes da aula

1. Execute a instalação do README na máquina que será usada. Confirme o serviço em `/api/health` e rode os testes automatizados.
2. Envie uma saudação no nível 1. A apresentação deve omitir o identificador reservado. Registre o tempo e eventuais falhas: essa observação não comprova o comportamento de todas as conversas.
3. Confira a navegação pelos sete níveis, as pistas, o editor do nível 4 e o painel de ações dos níveis 4 a 7. Revele apenas a primeira pista durante a apresentação inicial.
4. Mostre como validar uma descoberta, comparar tentativas e exportar evidências JSON. Explique que o arquivo exportado não restaura a sessão.
5. Diferencie testes com respostas simuladas da validação com o modelo real. A disponibilidade do Ollama não garante que cada exercício será concluído; mantenha a discussão das causas mesmo quando houver recusa ou erro.

O servidor possui um limite de 120 segundos por chamada ao modelo. Uma mensagem com ferramentas pode envolver várias chamadas. Para controlar o tempo de aula, combine um tempo de investigação por etapa e use as pistas. Uma ausência de resultado deve ser registrada e analisada, sem inventar uma conclusão.

## Orientação de avaliação

Use a rubrica do material de projeto e o modelo de demo. Não avalie apenas flags: peça ao aluno que separe hipótese, observação e interpretação. Nos níveis iniciais, discuta os limites de instruções e filtros. Nos finais, discuta autorização e estado no servidor. Nem todos os níveis representam injeções independentes.

Uma extensão defensiva deve comprovar que uma solicitação sem permissão é recusada e que uma solicitação legítima ainda funciona. Se o controle corrigir a falha deliberada do exercício, documente essa diferença em relação ao laboratório original.
