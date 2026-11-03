# Projeto Aurora Prompt Lab

[Índice](README.md) · [Anterior: validação](05-validacao.md)

Este projeto acompanha uma aula sobre segurança de assistentes. O aplicativo já está implementado: a entrega do aluno é uma investigação documentada e, na extensão, uma melhoria defensiva verificável.

**Modo sugerido:** individual ou dupla. **Nível sugerido:** N2 no uso guiado e N3 na extensão de programação. **Stack:** Python, FastAPI, Ollama e JavaScript. Esses níveis são uma proposta local, sem aprovação de inclusão no catálogo da Liga.

## Objetivo

Explicar como dados, instruções, permissões e ferramentas interagem no laboratório. Demonstre que sua conclusão vem de evidências e proponha um controle fora do modelo quando a operação exigir autorização.

## Aprendizagem esperada

- Reconhecer diferenças entre comportamento do modelo e política do servidor.
- Comparar tentativas sem confundir variação de resposta com garantia de segurança.
- Documentar instalação, execução e limitações de forma reproduzível.
- Justificar uma defesa e preservar um fluxo legítimo.

Leia a [trilha completa](README.md), começando pela [introdução](00-introducao.md), e execute o [README do laboratório](../README.md).

## Escopo mínimo

1. Instalar o projeto, confirmar `/api/health` e executar os testes.
2. Percorrer as sete missões e registrar o resultado de cada uma: concluída, recusada, erro ou não concluída no tempo disponível.
3. Comparar ao menos duas tentativas de uma mesma etapa e relacionar a diferença à hipótese inicial.
4. Selecionar uma operação com ferramenta e separar pedido, retorno do servidor e síntese do modelo. Quando usar formulário, registrar esse fato.
5. Propor uma defesa, indicando onde deve ser aplicada e qual fluxo legítimo precisa continuar funcionando.
6. Entregar um `DEMO.md` com ambiente, evidências, interpretação e limitações. Use o [modelo](../DEMO_MODELO.md) como ponto de partida.

Não é necessário concluir todas as flags para demonstrar compreensão. O relatório deve deixar claro quais resultados foram observados. Consultar respostas no código não comprova resolução pela interface.

## MVP de programação e extensões

Para a entrega de investigação, o escopo mínimo acima é suficiente. Para a entrega de programação, conclua também o [desafio 3.1](04-desafios.md): uma política consistente de acesso aos registros do cadastro, aplicada pelo servidor. O desafio apresenta os passos e a matriz de testes. Não basta executar o aplicativo e capturar flags para cumprir esse MVP.

Trabalhe em uma cópia separada do laboratório usado em aula. Preserve um caso legítimo e teste a recusa sem permissão. Explique o efeito na aula: a versão corrigida pode impedir a conclusão do exercício vulnerável original.

Outras extensões possíveis são melhorar acessibilidade, exportação de evidências ou documentação de erros. Não é necessário adicionar novos vetores de ataque, integrações externas ou serviços reais.

## Validação

Execute os comandos do README e registre as versões de Python e do modelo. Testes simulados, verificação de saúde e observação manual são evidências diferentes; identifique cada uma no relatório.

A apresentação deve mostrar uma execução legítima, a leitura dos registros e a justificativa da defesa. Para uma entrega individual, pode ser usado um vídeo breve; para uma dupla, uma apresentação com demonstração. O formato final deve ser confirmado pelo docente, conforme as orientações da Liga para a atividade.

## Critérios de avaliação

| Critério | Pontos | Evidência esperada |
| --- | --- | --- |
| Funcionamento | 2 | Ambiente executa; erros e limitações estão registrados |
| Compreensão | 3 | Explica a causa e distingue modelo, filtro e ferramenta |
| Validação | 2 | Registra testes, observações e comparação de tentativas |
| Comunicação | 2 | Demo legível, reproduzível e com conclusões sustentadas |
| Escopo | 1 | Usa dados fictícios e somente o laboratório local |

Esta rubrica é uma proposta para a aula. A contagem de flags é um indicador de progresso, não a nota completa.

## Referência de organização

O [repositório Projetos da Liga](https://github.com/gitinspersec/Projetos) usa materiais de aprendizagem em `learn/` e descreve entregas nas [instruções gerais](https://github.com/gitinspersec/Projetos/blob/main/INSTRUCTIONS.md). Este pacote segue essa organização, sem alterar o catálogo ou o fluxo de entrega oficial.
