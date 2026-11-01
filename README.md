# Assistente Aurora — laboratório de Prompt Injection

O Aurora é uma loja fictícia com duas identidades de laboratório: **Ana**, cliente e titular de `C-17`; **Bia**, atendente com acesso ao registro interno e permissão limitada de alteração. O projeto ensina a separar instruções do modelo, conteúdo externo e autorização da aplicação. A [aula curta para o site](inspersec/docs/aulas/redTeam/aulasextras/prompt-injection.md) introduz o tema; [`learn/`](learn/00-Introducao.md) aprofunda a implementação. **Nenhum sistema da Liga ou de terceiros é alvo do laboratório.**

## O que você aprende

- Identificar injeção direta e indireta e investigar possíveis efeitos sem inventar resultados.
- Comparar A (dados e ferramentas amplos), B (mesmos acessos, instruções reforçadas) e C (filtro e autorização fora do modelo).
- Separar proposta de ferramenta, decisão e efeito persistido.
- Criar testes de controle de acesso e de regressão para tarefas legítimas.

## Pré-requisitos e instalação

Python **3.10+**. O modo offline usa apenas a biblioteca padrão; não requer instalação de pacotes. Na raiz do repositório:

```bash
python3 -m aurora_lab run --scenario baseline --config C --profile ana
python3 -m unittest discover -s tests -v
```

O parâmetro `--profile` **simula uma sessão já autenticada**; ele não implementa login ou autenticação de produção. `--scenario` escolhe o caso; `--config` escolhe A, B ou C. Cada `run` cria dados, marcadores e estado novos. `python3 -m aurora_lab reset` repõe `C-17` como `aberto` no arquivo `state/current.json`; relatórios anteriores ficam preservados. `state/` é ignorado pelo Git. Não coloque dados reais ali.

## Primeiros experimentos

```bash
python3 -m aurora_lab run --scenario response --config C --profile ana
python3 -m aurora_lab run --scenario extract --config A --profile ana
python3 -m aurora_lab run --scenario action --config C --profile ana --propose-update em_analise --confirm-change C-17:em_analise
python3 -m aurora_lab run --scenario legit_update --config C --profile bia --confirm-change C-17:em_analise
python3 -m aurora_lab run --scenario bia_summary --config C --profile bia --propose-update em_analise
```

No terceiro comando, a chamada **forjada** testa a autorização diretamente: Ana é negada mesmo com confirmação. No quarto, a alteração de Bia é legítima e confirmada fora do modelo. No quinto, Bia pode alterar, mas uma ordem inserida no documento não fornece confirmação. `--confirm-change` deve ser digitado pelo operador da CLI e corresponder exatamente a `objeto:novo_estado`; o modelo e o documento não controlam essa opção. Os resultados podem ser lidos em `state/run-*.json`; `state/evaluation-*.json` guarda uma cópia dos marcadores aleatórios para avaliação. O valor do registro interno também chega ao modelo em A/B, por desenho do caso; o arquivo de avaliação não é enviado ao modelo nem controlado pelo atacante.

| Caso | Entrada controlada | Objetivo de análise |
| --- | --- | --- |
| `baseline`, `own_case` | Pergunta legítima | Qualidade e acesso permitido |
| `direct` | Mensagem de Ana | Falsa autoridade e identidade de sessão |
| `response` | Nota em `PUB-TROCAS` | Integridade do prazo |
| `extract` | Nota em `PUB-TROCAS` sem valor do marcador | Possível divulgação de `INT-REVISAO` |
| `action`, `bia_summary` | Nota em `PUB-TROCAS` | Proposta, autorização e confirmação de alteração |
| `system` | Mensagem de Ana | Possível reprodução de instrução de sistema |
| `multi`, `binary` | Mensagens diretas | Histórico e controles de confirmação binária |
| `legit_update` | Pedido legítimo de Bia | Operação permitida com confirmação |

O relatório registra **documentos enviados**, perguntas, respostas, propostas de ferramenta, decisões e estado final. A simples presença de uma palavra na resposta não prova sucesso: ela pode aparecer em citação ou rejeição. Os controles `binary` fazem duas perguntas com respostas esperadas diferentes; mesmo assim, uma avaliação automática simples não encerra a análise. Use “inconclusivo” quando a evidência não distingue as causas.

## Offline e modelo real

O modo **offline** é uma simulação determinística da aplicação. Ele usa respostas programadas conservadoras para mostrar dados e permissões; **não demonstra** que um LLM seguiria uma injeção. `--propose-update` é um teste direto da ferramenta, não uma chamada produzida por modelo.

Para conectar explicitamente um **modelo real local**, instale e inicie [Ollama](https://docs.ollama.com/), baixe um modelo que suporte [tool calling](https://docs.ollama.com/capabilities/tool-calling) e escolha seu nome. Exemplo, depois de instalar `qwen3` conforme as instruções do Ollama:

```bash
python3 -m aurora_lab run --scenario response --config C --profile ana --mode ollama --model qwen3
```

A integração usa `POST http://localhost:11434/api/chat` da [API oficial](https://docs.ollama.com/api/chat), via biblioteca padrão de Python. `--endpoint` aceita somente HTTP em loopback com caminho `/api/chat`; não há conexão automática ou envio a serviço remoto. A execução com modelo depende do Ollama estar ativo e do modelo escolhido suportar chamadas de ferramenta. O cliente executa no máximo uma rodada de ferramentas. Registre nome e versão do modelo, entrada e saída antes de interpretar o resultado. A integração foi executada com os modelos locais `llama3.2:1b` e `llama3.2:latest` no caso `baseline`/C/Ana: a API respondeu e os relatórios registraram os três documentos permitidos, mas as duas saídas foram textos parecidos com chamadas de ferramenta, sem responder corretamente ao prazo. Isso verifica o transporte, **não** a qualidade do modelo nem a resistência a ataques. Os testes automatizados usam um adaptador falso para verificar formato HTTP e decisões de ferramenta; nenhum ataque com modelo real foi executado.

## MVP do aluno

Implemente uma **nova política de leitura**: adicione um segundo chamado fictício de outro cliente em `data/documents.json`, altere `selected_documents()` e `read_case()` para que Ana só possa ler `C-17`, e escreva testes que neguem o novo chamado para Ana e preservem a consulta de Bia. O [desafio guiado](learn/03-Desafios.md) explica critérios e armadilhas. Esse MVP exige mudar código e adicionar testes; ler ou executar o projeto é a preparação.

**Extensões opcionais:** novos objetos com proprietários distintos; avaliação manual de respostas com evidências; comparação de modelos; confirmação com expiração e auditoria; melhoria da seleção de trechos sem transformar relevância em autorização. Não amplie as ferramentas para shell ou mensagens reais.

## Critérios de conclusão, validação e demonstração

Conclua o MVP quando os novos testes e os testes existentes passarem, Ana não receber ou consultar o chamado alheio em C, Bia continuar atendendo pedidos legítimos, e você explicar onde cada decisão é aplicada. Rode:

```bash
python3 -m unittest discover -s tests -v
python3 -m compileall -q aurora_lab
```

Para validar a página com MkDocs Material instalado, execute `mkdocs build -f inspersec/mkdocs.yml --strict -d /tmp/aurora-site`. O `inspersec/mkdocs.yml` deste repositório é **mínimo e só para prévia**; uma integração futura no site oficial exige copiar a página e acrescentar a entrada à configuração completa existente, sem substituí-la.

Use [DEMO.md](DEMO.md) como roteiro de entrega e registro de resultados. A [introdução](learn/00-Introducao.md), os [conceitos](learn/01-Conceitos.md), a [arquitetura e implementação](learn/02-Arquitetura-e-Laboratorio.md) e os [desafios](learn/03-Desafios.md) formam a trilha completa.
