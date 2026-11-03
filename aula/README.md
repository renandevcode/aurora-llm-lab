# Aula do Aurora para o site

Este pacote contém a página de aula e os arquivos necessários para visualizá-la localmente. O caminho da página espelha a organização de aulas extras de Red Team no site.

## Arquivo para copiar

```text
inspersec/docs/aulas/redTeam/aulasextras/aurora.md
```

Copie somente essa página para o mesmo caminho relativo no repositório do site. Ela usa Markdown, tabelas e blocos de código, sem imagens locais ou dependências de outros arquivos deste pacote. Os links de instalação e aprofundamento apontam para o laboratório no repositório `renandevcode/aurora-llm-lab`.

O arquivo [navegacao.yml](navegacao.yml) contém a entrada da página. Na futura integração, essa entrada deve ser acrescentada ao grupo **Aulas → Red Team → Extras** já existente. Não substitua o arquivo de configuração completo do site por nenhum arquivo deste pacote.

## Prévia local

Python 3.10 ou superior é suficiente para criar o ambiente de documentação. Esta prévia não precisa de Ollama. Dentro da pasta `aula`, no Linux ou macOS:

```bash
python3 -m venv .venv
source .venv/bin/activate
python -m pip install -r requirements.txt
python -m mkdocs serve -f mkdocs.preview.yml
```

No PowerShell:

```powershell
py -3 -m venv .venv
.\.venv\Scripts\python.exe -m pip install -r requirements.txt
.\.venv\Scripts\python.exe -m mkdocs serve -f mkdocs.preview.yml
```

Abra `http://127.0.0.1:8001` ou a aula diretamente em `http://127.0.0.1:8001/aulas/redTeam/aulasextras/aurora/`. Encerre com Ctrl+C. A prévia usa a porta 8001 para evitar a disputa mais comum pela porta 8000.

### Se a porta estiver ocupada

O erro `Address already in use` indica que outro processo já está usando o endereço escolhido. Mantenha o outro serviço e escolha outra porta:

```bash
python -m mkdocs serve -f mkdocs.preview.yml -a 127.0.0.1:8002
```

Nesse caso, abra `http://127.0.0.1:8002`. No Windows, use o executável do ambiente virtual no lugar de `python`. Não é necessário reinstalar as dependências para trocar a porta.

### Verificar o build

Para verificar a geração das páginas sem iniciar o servidor:

```bash
python -m mkdocs build --strict -f mkdocs.preview.yml
```

No Windows, use o executável do ambiente virtual no lugar de `python`. A saída de build fica em `build/aula` na raiz deste repositório; não integra o material a copiar.

## O que permanece apenas neste pacote

`mkdocs.preview.yml`, `requirements.txt`, `navegacao.yml` e `inspersec/docs/index.md` servem à preparação e à prévia. A página inicial local não deve substituir a página inicial do site da Liga. A configuração do site oficial já existe e deve receber apenas a entrada necessária. A prévia local não publica nada.

## Relação com o projeto

O laboratório está em `projeto/Aurora/` neste repositório. A página publicada deve continuar apontando para seu material de apoio. Se o laboratório passar a ter outro endereço oficial, atualize esses links na página; o código do aplicativo não precisa mudar.

Os links para os novos caminhos do repositório ficam disponíveis online após esta organização ser publicada e integrada à sua branch `main`. Antes disso, a página e os arquivos podem ser lidos diretamente na cópia local.
