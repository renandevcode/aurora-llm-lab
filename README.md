# Aurora Prompt Lab

Laboratório local para uma aula de segurança de aplicações com modelos de linguagem. Inclui sete exercícios com dados fictícios, pistas graduais, validação no servidor e uma campanha de ações simuladas. A proposta é observar comportamento, registrar evidências e explicar controles de segurança.

| Modo | Dificuldade sugerida | Stack | Duração sugerida |
| --- | --- | --- | --- |
| Individual ou dupla em aula | N2 para uso guiado; N3 para extensão defensiva | Python, FastAPI, Ollama, HTML, CSS e JavaScript | Duas aulas de 90 minutos, com instalação prévia |

A classificação é uma proposta para este material; não representa inclusão ou aprovação no catálogo da Liga.

## Objetivo e aprendizagem

Ao terminar, o aluno deverá distinguir instruções de dados externos, reconhecer divulgação de informação, separar fala do modelo de execução de ferramenta e propor autorização aplicada pelo servidor.

- [Trilha completa em learn](learn/README.md): introdução, conceitos, arquitetura, implementação, desafios, validação e entrega.
- [Aula curta](docs/AULA.md): roteiro do aluno para adaptação ao MkDocs.
- [Projeto e critérios de entrega](learn/06-projeto.md): escopo mínimo, extensão e avaliação.
- [Guia docente](GUIA_DOCENTE.md): condução, referências e discussão.
- [Modelo de demo](DEMO_MODELO.md): estrutura para o aluno preencher com evidências próprias.
- [Resultados da validação](docs/VALIDACAO.md): instalação limpa, testes, navegador e modelo real.
- [Integração futura](docs/INTEGRACAO.md): comparação com os repositórios da Liga e destinos sugeridos.

## Pré-requisitos

- Python **3.10 ou superior**, com `pip` e suporte a ambientes virtuais.
- [Ollama instalado](https://ollama.com/download) e um navegador atualizado.
- Internet para instalar dependências e baixar o modelo; depois disso, a inferência é local e não exige chave de API.
- Aproximadamente 1 GB para o arquivo do modelo padrão, mais espaço e memória para execução. A necessidade de RAM e o tempo de resposta variam com o sistema; GPU não é obrigatória. Teste na máquina da aula antes de começar.

Use Linux, macOS ou Windows. No Windows com WSL, execute Python e Ollama no mesmo ambiente Linux: este projeto consulta `127.0.0.1:11434`. As instruções Linux também valem dentro do WSL. A validação desta entrega foi feita em Linux; os comandos Windows e macOS são orientações, sem teste nessas plataformas.

## Instalação

Baixe esta pasta do projeto e abra o terminal nela. Execute os comandos na pasta que contém `app.py` e `requirements.txt`. Não é preciso instalar Node.js para usar o laboratório.

### Linux e macOS

```bash
python3 --version
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
```

Se o Ubuntu ou Debian informar que falta `ensurepip` ou `venv`, instale o pacote `python3-venv` pelo gerenciador de pacotes e repita a criação do ambiente.

### Windows com PowerShell

```powershell
py -3 --version
py -3 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
```

Não é necessário ativar o ambiente nem alterar a política de execução do PowerShell. Use o executável `.\.venv\Scripts\python.exe` nos comandos seguintes no lugar de `python`.

### Preparar o Ollama

Instale pelo [distribuidor oficial](https://ollama.com/download); no Linux, consulte também o [guia oficial](https://docs.ollama.com/linux). Depois:

```bash
ollama --version
ollama list
```

Se `ollama list` não conseguir conectar ao serviço, abra outro terminal e mantenha-o executando:

```bash
ollama serve
```

Se aparecer que a porta 11434 já está em uso, o serviço pode já estar ativo; confirme com `ollama list` em vez de iniciar outra instância. Baixe o modelo no terminal de preparação:

```bash
ollama pull qwen2.5:1.5b
ollama list
```

Confirme que `qwen2.5:1.5b` aparece na lista. O download só é necessário na primeira preparação ou para atualizar o modelo.

## Executar

No terminal do projeto, com o ambiente virtual ativado no Linux ou macOS:

```bash
python app.py
```

No PowerShell:

```powershell
.\.venv\Scripts\python.exe app.py
```

Abra **http://127.0.0.1:7860**. Não abra `static/index.html` diretamente: o chat precisa da API Python. Pare com Ctrl+C. O serviço atende somente na máquina local.

Antes da aula, abra **http://127.0.0.1:7860/api/health**. O resultado esperado é:

```json
{"ok":true,"model":"qwen2.5:1.5b"}
```

Essa verificação confirma serviço e modelo disponíveis, sem gerar conversa. Para conferir a geração, envie uma saudação no nível 1. A resposta deve apresentar Aurora sem divulgar o identificador reservado. Depois abra uma nova tentativa. Não há respostas instantâneas garantidas: a primeira geração pode carregar o modelo na memória.

### Trocar o modelo ou a porta

Linux e macOS, antes de iniciar:

```bash
OLLAMA_MODEL=llama3.2:1b PORT=7861 python app.py
```

PowerShell:

```powershell
$env:OLLAMA_MODEL = "llama3.2:1b"
$env:PORT = "7861"
.\.venv\Scripts\python.exe app.py
```

Baixe o modelo escolhido com `ollama pull llama3.2:1b` antes de usar esse exemplo e abra a porta correspondente no navegador. Trocar o modelo altera as respostas e pode alterar a dificuldade; o padrão desta aula é `qwen2.5:1.5b`.

## Usar o laboratório

1. Comece pela [trilha de aprendizagem](learn/README.md) ou pela [aula curta](docs/AULA.md), selecione o nível e consulte sua missão.
2. Registre sua hipótese e converse com a Aurora. Enter envia; Shift+Enter cria outra linha.
3. Revele uma pista por vez quando precisar. No nível 4, o editor permite alterar o ticket externo, enviado na próxima mensagem.
4. Nos níveis com ferramentas, consulte **Ações simuladas**: apenas esse retorno comprova execução. Os formulários das etapas 6 e 7 são alternativas ao chat.
5. Envie a descoberta completa em `CTF{…}` no campo de validação. Uma afirmação do modelo não conclui o desafio.
6. Use **Histórico** para comparar tentativas e **Exportar evidências JSON** antes de encerrar o servidor. O arquivo registra a sessão, mas não a restaura.

| Nível | Tema | Evidência a discutir |
| --- | --- | --- |
| 1 | Divulgação de dado no contexto | Diferença entre apresentação normal e exposição indevida |
| 2 | Filtro de saída | Em qual momento a resposta foi bloqueada |
| 3 | Filtro de entrada | Diferença entre bloqueio de texto e autorização |
| 4 | Documento externo e leitura de arquivo | Origem da instrução e retorno efetivo da ferramenta |
| 5 | Autorização no cadastro fictício | Consistência de permissões entre operações |
| 6 | Identidade e chamada simulada | Por que um identificador não autentica uma pessoa |
| 7 | Estado e ação simulada | O que o servidor verificou antes da ação |

No nível 4, a ferramenta lê arquivos `.txt` existentes dentro de `lab_data`, rejeitando caminhos que escapem dessa pasta. Os dados internos são carregados quando a ferramenta é chamada, não antecipadamente nas instruções do modelo. O ticket é texto editável na página, não um arquivo gravado pelo aluno no servidor. A campanha usa `clientes_demo.json`. Não há telefonia, portas físicas ou execução de comandos.

## Tentativas e duração dos dados

Cada navegador mantém uma sessão por cookie. Os níveis têm históricos separados. Nova tentativa arquiva as mensagens e limpa o contexto textual do nível, preservando as flags já validadas e os registros de ações. Há duas particularidades:

- No nível 6, Nova tentativa remove a confirmação da chamada; é necessário repeti-la antes de abrir a porta.
- No nível 7, Nova tentativa remove o estado de abertura, preservando a chamada anterior.

Os registros antigos continuam visíveis e não comprovam que a condição atual está satisfeita. Reiniciar o servidor apaga sessões, histórico e progresso. Uma sessão privada separada inicia outra campanha. As pistas reveladas duram somente enquanto a página permanece aberta.

A inferência recebe até 16 mensagens anteriores; a janela é de 4096 tokens e a saída está limitada a 384 tokens. Conversas e documentos longos podem perder contexto. Chamadas de ferramentas intermediárias não são reapresentadas integralmente em mensagens futuras; consulte o painel e carregue suas anotações entre etapas. Temperatura 0 reduz variação, mas não garante reprodução idêntica.

## Validação

Com as dependências instaladas, os testes automatizados não precisam do Ollama:

```bash
python -m unittest discover -s tests -v
python -m pip check
```

No Windows, use `.\.venv\Scripts\python.exe` no lugar de `python`. Para quem editar o frontend e tiver Node.js instalado:

```bash
node --check static/app.js
```

Os testes usam respostas simuladas para verificar contratos da API, isolamento de sessões, filtros, limites de leitura e estado. **Eles não comprovam a conclusão dos sete níveis pelo modelo real.** A verificação de saúde também não comprova a qualidade das respostas. O roteiro de validação manual está no [guia docente](GUIA_DOCENTE.md).

## Resolver problemas

| Sintoma | O que conferir |
| --- | --- |
| `python` não encontrado | Linux/macOS: use `python3` para criar o ambiente; Windows: use `py -3`. |
| `ModuleNotFoundError` | Instale com o mesmo Python usado para executar: `python -m pip install -r requirements.txt`. |
| Ollama indisponível ou erro 503 | Execute `ollama list`, confira o serviço e visite `/api/health`. |
| Modelo não encontrado | Execute `ollama pull qwen2.5:1.5b`, ou baixe o nome definido em `OLLAMA_MODEL`. |
| Porta 7860 ocupada | Pare a instância anterior com Ctrl+C ou escolha outra porta com `PORT`. |
| Erro 504 ou resposta lenta | O limite é de 120 s por chamada ao Ollama; uma mensagem com várias ferramentas pode levar mais tempo no total. Feche processos pesados e tente um contexto menor. |
| Arquivos antigos no navegador | Recarregue com Ctrl+Shift+R depois de reiniciar a aplicação. |
| Resposta inventada ou ação não executada | Confira o painel de ações. Registre a falha; texto do modelo não é evidência de execução. |
| Perdi o progresso | O estado é temporário. Exporte as evidências antes de reiniciar; o JSON não pode ser importado. |

## Limites e escopo

Este é um ambiente didático com falhas deliberadas e dados fictícios. Os controles frágeis dos exercícios não são recomendações para sistemas reais. Trabalhe somente neste laboratório local. A interface trata respostas como texto, sem interpretar HTML do modelo.

Não há streaming, cancelamento de geração, restauração de sessões, ramificação de tentativas ou autenticação para hospedagem pública. A aplicação Python não pode ser executada pelo GitHub Pages: uma futura página da aula será estática, e cada aluno executará o laboratório localmente.

## Referências

- [Aula de Prompt Injection da Liga](https://gitinspersec.github.io/site/aulas/conteudosAntigos/redTeam/aula3/engenharia_social/prompt_injection/)
- [Instruções do repositório Projetos](https://github.com/gitinspersec/Projetos/blob/main/INSTRUCTIONS.md)
- [OWASP sobre Prompt Injection](https://genai.owasp.org/llmrisk/llm01-prompt-injection/)
- [Ollama e execução local](https://docs.ollama.com/quickstart)


## Implementação CLI preservada

A versão anterior deste repositório está em [cli/](cli/README.md), com código, dados, testes e material próprios. Ela utiliza outros cenários e não é o backend desta interface web. Para executá-la, entre em `cli/` e siga seu README. A trilha da versão web continua em [learn/](learn/README.md).
