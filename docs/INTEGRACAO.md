# Organização para a aula e o projeto da Liga

Este pacote foi organizado para servir como aula e laboratório local. A comparação usa o [site publicado](https://gitinspersec.github.io/site/), o [README do site](https://github.com/gitinspersec/site) e as [instruções de Projetos](https://github.com/gitinspersec/Projetos/blob/main/INSTRUCTIONS.md), consultados em 2 de novembro de 2026. Nenhuma alteração nos repositórios externos integra esta entrega.

## Correspondência com as referências

| Referência observada | Aplicação neste pacote |
| --- | --- |
| Aulas organizadas por tema, com fundamentos e prática | `docs/AULA.md`, com conceitos, atividade e discussão defensiva |
| Pré-requisitos e instruções de execução | README com ambiente virtual, Ollama, execução e diagnóstico |
| Projetos com objetivo, aprendizagem, escopo e validação | `learn/06-projeto.md` e README |
| Materiais de apoio em `learn/` | Índice e módulos de introdução, conceitos, arquitetura, implementação, desafios, validação e entrega |
| Entrega com demonstração e explicação | `DEMO_MODELO.md` e rubrica proposta |
| Site com conteúdo em `inspersec/docs` e navegação em `inspersec/mkdocs.yml` | Aula em Markdown, sem dependência de recursos exclusivos deste repositório |

A estrutura segue os exemplos consultados. Isso não representa aprovação editorial, definição de semestre ou inclusão no catálogo oficial. O nível N2/N3 e os tempos de aula são propostas locais.

## Conteúdo preparado para o site

O arquivo `docs/AULA.md` contém a aula do aluno, com situação inicial, exemplos comentados, perguntas com respostas explicadas e três blocos de prática. A trilha aprofundada fica em `learn/`, com navegação entre módulos. A aula usa títulos, tabelas, listas e blocos de código compatíveis com Markdown, sem imagens ou plugins adicionais. Os links relativos de instalação e aprofundamento funcionam neste pacote e precisam apontar para a pasta definitiva do projeto quando a aula for copiada isoladamente para o site. Os módulos de aprofundamento usam links locais de navegação e um diagrama Mermaid; a renderização desse diagrama precisa ser habilitada na futura configuração do MkDocs. A apresentação é própria; o conteúdo das aulas da Liga não foi copiado.

Em uma integração futura, um responsável pode colocar a aula em um caminho como `inspersec/docs/aulas/redTeam/extras/aurora.md` e cadastrá-la na navegação do MkDocs. O caminho é apenas uma sugestão, que precisa ser ajustada ao calendário e à estrutura escolhida pela Liga. A aula antiga de Prompt Injection já existe em Conteúdos antigos; a nova aula não precisa substituí-la automaticamente.

### Ajuste dos links na publicação

A aula pode ser estudada neste repositório com todos os links abaixo. Ao copiar apenas `docs/AULA.md` para o site, mantenha a origem desses materiais no repositório de projetos e substitua os destinos relativos pelas URLs oficiais da pasta em que o pacote realmente for incluído. O endereço da pasta de Aurora em `Projetos` ainda não foi definido; por isso não há links para caminhos remotos inventados.

| Link atual na aula | Destino a usar na publicação |
| --- | --- |
| `../README.md` | README da pasta definitiva do laboratório, com instalação e execução |
| `../README.md#resolver-problemas` | Mesmo README, seção de diagnóstico |
| `../learn/README.md` | Índice da trilha no projeto publicado |
| `../learn/04-desafios.md` | Desafios de programação do mesmo pacote |
| `../learn/06-projeto.md` | Critérios de entrega do mesmo pacote |
| `../DEMO_MODELO.md` | Modelo de demo do mesmo pacote |

Confira também as âncoras no renderizador de destino: GitHub e MkDocs podem gerar identificadores diferentes para títulos com acentos. Os links entre páginas podem ser publicados sem a âncora quando necessário, preservando o nome da seção no texto. A navegação do site e o build oficial devem ser verificados depois dessa integração; o material permanece local nesta entrega.


O site pode hospedar o texto e apontar para o projeto. O backend FastAPI e o Ollama devem continuar rodando localmente nas máquinas dos alunos; GitHub Pages não executa Python nem inferência do modelo. Após a integração futura, é necessário validar a navegação e os links no build real do site.

## Conteúdo preparado para Projetos

O pacote completo pode ser colocado em uma pasta de projeto escolhida pela gestão, preservando README, `learn/`, código, dados fictícios, frontend e testes. A instalação não depende do nome dessa pasta nem de um caminho pessoal.

`DEMO_MODELO.md` é um formulário para o aluno preencher e salvar como `DEMO.md`. Ele não é uma demo concluída. A rubrica mantém critérios de funcionamento, compreensão, validação, comunicação e escopo. Regras de equipe, prazos, mídia e classificação oficial continuam sob responsabilidade da Liga.

## Limites da validação

A organização textual foi comparada com os arquivos de referência. A instalação, API, testes e navegador são validados localmente, conforme o relatório de validação desta entrega. Os repositórios externos não foram clonados, editados, publicados ou usados para commits e pushes. O build do site oficial não foi executado.


## Contexto da trilha completa

A sequência foi comparada com o [learn do Hash_ID](https://github.com/gitinspersec/Projetos/tree/main/projects/Individual/Hash_ID/learn) e com o [material do teste-sec](https://github.com/renandevcode/teste-sec/tree/main/learn), consultados na mesma data. O primeiro separa introdução, conceitos, arquitetura, implementação e desafios. O segundo já contém introdução, conceitos, arquitetura e desafios para outra implementação de Aurora.

Nesta pasta, as explicações foram adaptadas à API FastAPI, ao frontend e às ferramentas realmente existentes. Comandos de CLI, perfis Ana/Bia e configurações A/B/C do outro projeto não foram apresentados como recursos desta versão. O MVP defensivo tem tarefas, casos permitidos e negados e critérios de conclusão; ele é um exercício a implementar pelo aluno.
