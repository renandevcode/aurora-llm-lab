# Aurora LLM Lab

Este repositório reúne dois pacotes: o laboratório Aurora e a aula preparada para o site do Insper Sec. Cada pacote tem um destino próprio e pode ser copiado separadamente. O histórico Git continua sendo único.

| Pacote | Conteúdo | Destino de integração |
| --- | --- | --- |
| [projeto/Aurora](projeto/Aurora/README.md) | Aplicação, dados fictícios, testes, documentação e trilha `learn/` | Uma pasta `Aurora` em `projects/Individual/` de Projetos |
| [aula](aula/README.md) | Página Markdown no caminho do site, trecho de navegação e configuração de prévia | A página correspondente em `inspersec/docs/aulas/redTeam/aulasextras/` do site |

Os destinos são orientações para a integração futura. Nenhuma cópia, alteração ou publicação nos repositórios da Liga faz parte da preparação local.

## Estrutura

```text
aurora-llm-lab/
├── projeto/
│   └── Aurora/
│       ├── README.md
│       ├── app.py
│       ├── campaign.py
│       ├── requirements.txt
│       ├── learn/
│       ├── static/
│       ├── lab_data/
│       ├── tests/
│       ├── tools/
│       ├── docs/VALIDACAO.md
│       ├── GUIA_DOCENTE.md
│       └── DEMO_MODELO.md
├── aula/
│   ├── README.md
│   ├── requirements.txt
│   ├── mkdocs.preview.yml
│   ├── navegacao.yml
│   └── inspersec/docs/aulas/redTeam/aulasextras/aurora.md
├── docs/INTEGRACAO.md
└── cli/
```

## Executar o laboratório

Em um terminal aberto na raiz deste repositório, entre no pacote:

```bash
cd projeto/Aurora
```

Siga o [guia de instalação](projeto/Aurora/README.md). Crie o ambiente virtual nessa pasta, instale suas dependências e prepare o Ollama. Depois, execute `python app.py` a partir dela e abra `http://127.0.0.1:7860`.

A aplicação encontra seus arquivos a partir de sua própria localização. Copiar a pasta `Aurora` para outro caminho não exige mudar o código.

## Ler e visualizar a aula

A página está em [aula/inspersec/docs/aulas/redTeam/aulasextras/aurora.md](aula/inspersec/docs/aulas/redTeam/aulasextras/aurora.md). O [README da aula](aula/README.md) apresenta os comandos para uma prévia local em MkDocs Material.

Em outro terminal aberto na raiz do repositório, entre na pasta da prévia:

```bash
cd aula
```

Depois de instalar as dependências indicadas nesse README, execute `python -m mkdocs serve -f mkdocs.preview.yml`. A página inicial estará em `http://127.0.0.1:8001`. Se a porta estiver ocupada, o guia mostra como escolher outra.

A aula aponta para os materiais do laboratório neste repositório. Ela pode ser copiada para o site sem depender de arquivos relativos fora da pasta de documentação do site. A publicação da página não hospeda o servidor Python nem o modelo.

## Preparar a integração

O [guia de integração](docs/INTEGRACAO.md) informa exatamente o que copiar, quais arquivos são apenas de prévia e como relacionar aula e projeto. A configuração completa do site e o catálogo de Projetos permanecem sob responsabilidade de seus mantenedores.

Os testes realizados, a revisão dos caminhos e as limitações encontradas estão no [relatório de validação](projeto/Aurora/docs/VALIDACAO.md#auditoria-dos-caminhos-e-da-execução-em-3-de-novembro-de-2026).

## Implementação anterior

A versão anterior, por terminal, permanece em [cli/](cli/README.md), com suas instruções e dados próprios. Ela não é necessária para nenhum dos dois pacotes acima.
