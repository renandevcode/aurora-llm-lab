# Guia do instrutor — 120 minutos

O objetivo em sala é fazer a turma localizar a fronteira entre texto externo, proposta do modelo e decisão da aplicação. Use apenas o laboratório fictício. O [README](README.md) contém comandos e pré-requisitos; a [aula curta](inspersec/docs/aulas/redTeam/aulasextras/prompt-injection.md) é a leitura inicial.

## Preparação antecipada

1. Verifique Python 3.10+, rode `python3 -m unittest discover -s tests -v` e `python3 -m aurora_lab run --scenario baseline --config C --profile ana`.
2. Abra um relatório em `state/run-*.json` e localize `documents_sent`, `tool_proposed`, `tool_decision` e `case_state`.
3. Se usar Ollama, instale e teste o modelo antes da aula. Tenha o modo offline pronto como alternativa. Não use dados reais.
4. Opcionalmente confira [Gandalf/Agent Breaker](https://gandalf.lakera.ai/) no dia; o destino e os desafios podem mudar. Não dependa dele para cumprir os objetivos.

## Sequência sugerida

| Tempo | Em sala | Evidência ou pergunta |
| --- | --- | --- |
| 0–15 min | Situação da política de 30 versus 90 dias; objetivos | Quem controla cada frase? |
| 15–35 min | LLM, contexto, direto/indireto, jailbreak e vazamento de prompt | O documento pode criar uma regra? |
| 35–55 min | Aurora A/B/C e identidade fora da conversa | Qual dado chega ao modelo? |
| 55–80 min | Demonstração principal: `response` em C e `bia_summary` em C com `--propose-update em_analise` | Resposta, proposta, decisão e efeito são iguais? |
| 80–100 min | Teste de alteração forjada para Ana e alteração legítima confirmada de Bia | Por que confirmação e permissão são verificações diferentes? |
| 100–115 min | Duplas classificam evidência e propõem teste do MVP | O que seria “inconclusivo”? |
| 115–120 min | Encerramento e indicação do `learn/` | Qual controle ficou fora do modelo? |

Não execute todas as combinações de cenários e configurações ao vivo. Deixe `extract`, `system`, `multi`, `binary`, comparação de modelos e programação do MVP para estudo posterior.

## Se o ataque não funcionar

Mostre a entrada, os documentos realmente enviados, a resposta e o log. Uma recusa do modelo é observação daquele teste; peça à turma para localizar que controle seria necessário caso o modelo obedecesse. Em C, uma operação não autorizada deve ser negada pela ferramenta mesmo com chamada forjada. A discussão não depende de um bypass.

## Gandalf opcional

Use o jogo somente se estiver acessível e dentro de suas regras. Peça que os alunos anotem objetivo, tentativa, resposta e limite da evidência. Se indisponível, use `response` e `system` do Aurora em modo offline para mapear o fluxo, deixando claro que o offline não testa resistência de um LLM. Não peça senhas ou dados reais.
