# Demonstração do Aurora

Este arquivo é um **roteiro a preencher pelo aluno**, não um registro de resultados já observados. Use somente dados fictícios e ambiente autorizado. Não cole credenciais ou saídas de aplicações externas.

## 1. Contexto e execução

- **Objetivo do caso:** preencher após escolher um cenário.
- **Configuração e perfil:** preencher com A/B/C e Ana/Bia.
- **Modo e modelo:** offline (simulação) ou Ollama (nome e versão do modelo local).
- **Comando executado:** preencher com o comando real.
- **Versão dos documentos e estado inicial:** preencher com IDs enviados e `C-17` antes do caso.

## 2. Evidência

| Campo | Registro do aluno |
| --- | --- |
| Entrada exata | A preencher |
| Documentos enviados | A preencher a partir de `state/run-*.json` |
| Resposta | A preencher; em offline, identificar **SIMULAÇÃO** |
| Chamada proposta | A preencher ou “nenhuma” |
| Decisão e efeito | A preencher; distinguir negada de executada |
| Classificação | Observado, não observado ou inconclusivo, com justificativa |

Não classifique “90 dias” como manipulação sem ler a resposta completa. Uma citação ou recusa da nota é diferente de obedecê-la. Uma resposta “sim” isolada não prova extração. Uma chamada negada não alterou o estado.

## 3. Decisão técnica e correção

Descreva qual limite de confiança foi cruzado ou preservado, onde a permissão é aplicada e o que mudaria no código. Mostre uma tarefa legítima antes e depois da mudança. Para o MVP, explique sua alteração em `selected_documents()` e `read_case()` e mostre os novos testes.

## 4. Validação reproduzível

Registre a saída real destes comandos após executá-los:

```bash
python3 -m unittest discover -s tests -v
python3 -m compileall -q aurora_lab
```

Se demonstrar a página, registre também `mkdocs build -f inspersec/mkdocs.yml --strict -d /tmp/aurora-site`. Se não executou um modelo real, escreva isso explicitamente. O sucesso de uma tentativa não é requisito de conclusão.
