# Integração dos pacotes Aurora

Este repositório tem dois pacotes com destinos distintos. Os caminhos abaixo orientam uma integração posterior pelos responsáveis. A preparação local não modifica os repositórios da Liga.

## Mapa de cópia

| Origem neste repositório | Destino proposto | Conteúdo |
| --- | --- | --- |
| `projeto/Aurora/` | `projects/Individual/Aurora/` no repositório Projetos | Laboratório completo e trilha de aprendizagem |
| `aula/inspersec/docs/aulas/redTeam/aulasextras/aurora.md` | `inspersec/docs/aulas/redTeam/aulasextras/aurora.md` no repositório do site | Página da aula |
| Item em `aula/navegacao.yml` | Grupo Aulas → Red Team → Extras do MkDocs existente | Entrada para acessar a página |

Os repositórios de referência são [Projetos](https://github.com/gitinspersec/Projetos) e [site](https://github.com/gitinspersec/site). A localização no catálogo e o nome final da atividade devem ser confirmados pelos mantenedores no momento da integração.

## Pacote do projeto

Copie a pasta `Aurora` inteira, incluindo seu `.gitignore`, README, aplicação, dados fictícios, frontend, testes, ferramentas, guia docente, modelo de demo, documentação e `learn/`. O [README do pacote](../projeto/Aurora/README.md) descreve a instalação a partir dessa pasta.

A aplicação resolve seus caminhos a partir de `__file__`. A consulta ao modelo usa o serviço Ollama local. Mudar a pasta de lugar não exige ajustar os arquivos Python ou JavaScript.

Ambientes virtuais, caches, evidências geradas e arquivos `.git` não fazem parte do pacote. O `.gitignore` do projeto registra essas exclusões. A versão CLI em `cli/` é histórica e fica fora dos dois pacotes preparados.

Depois da cópia, a atualização de um catálogo ou README geral de Projetos é uma decisão editorial dos mantenedores. Nenhum arquivo geral daquele repositório deve ser substituído pelo README do Aurora.

## Pacote da aula

A página está no caminho de aulas extras usado como referência. Ela contém situação inicial, fundamentos, exemplos comentados, perguntas com respostas e atividades no laboratório.

Na integração do site, copie apenas a página e acrescente sua entrada à navegação. O [trecho de navegação](../aula/navegacao.yml) contém somente um item, sem redefinir o restante do menu. A configuração [mkdocs.preview.yml](../aula/mkdocs.preview.yml) é exclusiva da prévia local e não substitui o `inspersec/mkdocs.yml` oficial.

A página usa Markdown, tabelas e blocos de código. Não depende de imagens locais, do diretório `learn/` dentro do site, nem de um backend hospedado no GitHub Pages. Os requisitos e comandos da prévia estão no [README da aula](../aula/README.md).

## Links entre aula e projeto

Os links da aula para instalação, trilha, desafios e entrega são absolutos e apontam para:

```text
https://github.com/renandevcode/aurora-llm-lab/blob/main/projeto/Aurora/
```

Assim, copiar a página isoladamente não altera o destino dos materiais de apoio. Os links complementares do pacote do projeto apontam para a página da aula neste mesmo repositório. Os arquivos da aplicação e os links internos de `learn/` permanecem dentro do próprio pacote.

Esses novos caminhos passam a existir no GitHub depois que esta organização for publicada e integrada à `main` do seu repositório. Antes disso, a validação resolve os destinos na cópia local. Não são apresentados como páginas já publicadas nos repositórios da Liga.

Se a Liga definir um endereço oficial para o laboratório e desejar utilizá-lo nos links da aula, substitua o prefixo acima pelo endereço dessa pasta. Essa troca é editorial e não modifica o funcionamento do chat.

## Prévia e verificação local

Para visualizar a aula, use `aula/mkdocs.preview.yml`. Para verificar a aplicação, execute os testes a partir de `projeto/Aurora/`. Para demonstrar que os pacotes estão separados, ambos podem ser copiados para diretórios temporários distintos e verificados sem a estrutura completa deste repositório.

Os resultados da reorganização são registrados na [validação do projeto](../projeto/Aurora/docs/VALIDACAO.md). Uma prévia local não substitui a verificação final da navegação e do build após a integração ao site oficial.
