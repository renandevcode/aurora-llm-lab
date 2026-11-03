# Validação local do Aurora Prompt Lab

Validação realizada em 2 de novembro de 2026, em Linux, com Python 3.10.12. O trabalho ficou restrito a este diretório e a ambientes temporários de verificação. Os repositórios externos serviram de referência de leitura; não houve commit ou push.

## Instalação e API

Foi criado um ambiente virtual vazio em `/tmp/aurora-install-check`, seguido de instalação com `python -m pip install -r requirements.txt`. A instalação terminou com sucesso. `python -m pip check` não encontrou dependências incompatíveis.

Versões diretas resolvidas nessa instalação:

| Dependência | Versão |
| --- | --- |
| FastAPI | 0.162.0 |
| Uvicorn | 0.54.0 |
| Ollama Python | 0.6.3 |
| HTTPX | 0.28.1 |

A instância de verificação foi iniciada por Uvicorn no endereço local `127.0.0.1:7862`. `/api/health` confirmou disponibilidade do modelo `qwen2.5:1.5b`. A porta 7862 foi usada para separar a validação de outras instâncias; a porta padrão do projeto continua sendo 7860.

## Testes automatizados

`python -m unittest discover -s tests -v` passou nos **19 testes**, tanto no ambiente existente quanto no ambiente recém-instalado. A checagem `node --check static/app.js` também passou.

A cobertura inclui isolamento de sessão, validação de entradas e flags, separação de níveis, estágio dos filtros, erros do modelo, disponibilidade do serviço, restrição de caminhos de leitura e efeitos do reinício da campanha. O teste antigo do nível 4 foi atualizado para verificar a disponibilização da ferramenta, sem exigir que os dados do arquivo já estivessem nas instruções iniciais.

Esses testes usam respostas simuladas. Eles verificam os contratos da aplicação e não demonstram a resolução dos sete desafios pelo modelo real.

## Navegador

A interface foi verificada com Chrome headless e Playwright em larguras de **360, 768, 1280 e 1440 pixels**. As capturas de desktop e celular foram inspecionadas visualmente.

Passaram as verificações de:

- Carregamento dos sete níveis sem erros JavaScript.
- Ausência de transbordamento horizontal da página nos tamanhos verificados.
- Exibição do editor e do painel de ações no nível 4.
- Revelação progressiva de pistas.
- Mensagem de bloqueio de entrada, obtida pela API real, e de saída, obtida com resposta simulada no navegador.
- Arquivamento de tentativa e presença no histórico.
- Download e leitura do JSON exportado.
- Preservação da mensagem digitada após um erro 503 simulado.

A exportação registra o estado público da sessão e o rascunho atual do ticket em `document_draft`. Os documentos efetivamente enviados constam nos turnos. A exportação não restaura a sessão.

## Modelo real

Três conversas independentes do nível 1 foram testadas com perguntas de apresentação. Nenhuma resposta continha o prefixo literal de flag. Os tempos foram:

| Solicitação | Tempo |
| --- | --- |
| Apresentação e como ajudar, em até três frases | 17,00 s |
| Saudação de bom dia | 1,68 s |
| Explicação breve do papel no atendimento | 6,91 s |

A instrução do nível 1 foi ajustada para separar o nome da empresa do identificador confidencial e evitar sua inclusão na apresentação. Essas observações demonstram melhora nos casos verificados, sem constituir garantia de confidencialidade ou de dificuldade do exercício.

## Material e limites

Após a ampliação da trilha `learn/`, foram verificados os 14 documentos Markdown do pacote quanto a links relativos locais e fechamento de blocos de código, sem erros encontrados. Na organização atual, a aula em `aula/inspersec/docs/aulas/redTeam/aulasextras/aurora.md` usa exemplos textuais e links absolutos para instalação e aprofundamento no repositório de apoio. Esses destinos não dependem do local de cópia da página; se o endereço oficial do projeto mudar, devem ser atualizados conforme o guia de integração. Os módulos aprofundados têm navegação entre si e links para os arquivos da implementação. A comparação de estrutura está descrita em [Integração](https://github.com/renandevcode/aurora-llm-lab/blob/main/docs/INTEGRACAO.md).

A ampliação do material se limitou a documentação: a trilha ganhou módulos de conceitos, arquitetura, implementação, desafios, validação e entrega. O MVP defensivo está proposto para o aluno, com passos e critérios, sem ser apresentado como funcionalidade já implementada. A API e o chatbot não foram alterados nessa ampliação.

Não foram executados o build do site oficial, testes em Windows ou macOS, testes de carga, nem uma nova campanha completa de resolução dos sete níveis com o modelo real. A documentação diferencia essas verificações da instalação, da saúde do serviço e dos testes simulados. A execução da aula exige as dependências locais e o modelo baixado; GitHub Pages hospeda apenas o texto estático.


## Revisão da aula para o site

A página da aula foi ampliada com uma situação de atendimento acompanhada ao longo da explicação, exemplos comentados, quatro perguntas com respostas explicadas e práticas em três grupos de níveis. Os exemplos estão identificados como conceituais e não como execuções medidas do Aurora. A organização preserva dois encontros de 90 minutos, com instalação prévia.

A aula recebeu links para instalação, diagnóstico, trilha, desafios e entrega. O guia de integração descreve como redirecionar esses links para a pasta definitiva em Projetos, ainda não definida. Não foram criadas URLs para uma pasta remota inexistente.

Foi preparada uma cópia temporária do material e executado `mkdocs build --strict` com MkDocs 1.6.1 e Material 9.7.7. O build concluiu. Na página HTML da aula, foram verificados 42 links do artigo, incluindo navegação interna: todos os destinos locais e âncoras verificados existem. A renderização foi conferida em Chrome nas larguras de 390 e 1440 pixels, sem transbordamento horizontal da página nem erros JavaScript. As capturas foram inspecionadas, e o diagrama foi disposto verticalmente para facilitar a leitura no celular. Essa prévia local não utiliza a configuração completa do site oficial nem valida sua integração futura.

A trilha `learn/` foi preservada nesta revisão. Seus arquivos foram comparados por hash antes e depois da edição da aula. A mudança se restringiu à aula e aos registros locais de integração e validação; não houve alteração de código, commit, push ou publicação.


## Separação em pacotes em 3 de novembro de 2026

O laboratório foi colocado em `projeto/Aurora/` e a página em `aula/inspersec/docs/aulas/redTeam/aulasextras/aurora.md`. O README da raiz apresenta os dois pacotes. A implementação CLI permanece separada em `cli/`.

Arquivos da aplicação, frontend, dados, requisitos, testes e ferramentas foram comparados por SHA-256 antes e depois da mudança de pasta: o conteúdo foi preservado. As alterações de documentação ajustam caminhos, links e instruções de uso dos pacotes.

Foram criadas cópias temporárias independentes do laboratório e da aula. Na cópia do laboratório, os 19 testes passaram usando um ambiente de dependências separado, e a sintaxe do JavaScript foi conferida. Os 10 testes da CLI também passaram. A interface da cópia foi verificada em quatro larguras de tela, incluindo editor, pistas, filtros, histórico, exportação e recuperação de erro.

O build estrito de MkDocs Material concluiu tanto no pacote local quanto na cópia isolada da aula. A página foi conferida em celular e desktop, sem transbordamento horizontal nem erros JavaScript.

Os links internos da documentação foram verificados contra os arquivos existentes. Os links absolutos da aula para o repositório de apoio foram resolvidos contra a nova árvore local. Sua disponibilidade no GitHub depende da publicação e integração desta organização na main; não foi apresentada como uma integração já realizada nos repositórios da Liga.

Nenhuma alteração de repositório externo, commit, push ou publicação faz parte desta reorganização local.

## Auditoria dos caminhos e da execução em 3 de novembro de 2026

Esta verificação considera a organização em `projeto/Aurora/`, `aula/` e `cli/`. Os resultados anteriores de conversas com o modelo são históricos; a limitação observada nesta auditoria está registrada abaixo.

### Caminhos, links e instruções

Foram revisados os 26 arquivos Markdown do repositório, incluindo a implementação anterior. A verificação encontrou 157 referências locais ou URLs deste repositório resolvidas contra a árvore local, sem arquivos ou âncoras ausentes. Os endereços antigos de `teste-sec` na documentação da CLI foram substituídos pelos caminhos atuais em `aurora-llm-lab/cli/`.

Os comandos de instalação e execução agora deixam explícita a pasta de trabalho. O pacote do laboratório foi executado em uma cópia temporária independente, sem depender da raiz original. A comparação SHA-256 de 21 arquivos de execução, testes, requisitos, dados e recursos confirmou a preservação de conteúdo durante a reorganização.

A prévia da aula recebeu uma página inicial com acesso à aula e passou a usar a porta 8001. O README também explica como escolher a porta 8002 quando houver conflito. A página inicial e a configuração de prévia são exclusivas do uso local; o guia de integração identifica a página e o item de navegação destinados à cópia futura.

Os 13 endereços distintos deste repositório que apontam para arquivos, pastas ou âncoras foram conferidos localmente. Sua disponibilidade online depende de publicar e integrar esta organização à `main`. Outros 21 destinos HTTP externos responderam com status 200, seguindo redirecionamentos e desconsiderando diferenças de minutagem de um mesmo vídeo. Essa checagem verifica disponibilidade, sem comprovar o conteúdo de cada vídeo ou a integração futura ao site da Liga.

### Instalação, testes e interface

- Instalação das dependências do laboratório e da aula em dois ambientes virtuais novos, com `pip check` sem conflitos.
- Compilação sintática de 11 arquivos Python, leitura de dois arquivos JSON e verificação sintática do JavaScript, sem erros.
- 19 testes do laboratório e 10 testes da CLI aprovados. As respostas de modelo nesses testes são simuladas.
- Execução do cenário público `baseline` da CLI em modo offline, sem ações de ferramenta, e verificação de sua ajuda de terminal.
- Build estrito da aula e da documentação da CLI concluído. A cópia isolada da aula também foi servida por HTTP com sucesso.
- Aplicação isolada: sete níveis disponíveis, recursos estáticos carregados, isolamento entre sessões e validação de entrada verificados; arquivo de dados interno não servido diretamente por HTTP.
- Navegador nas larguras 360, 768, 1280 e 1440 pixels: editor, pistas, filtros, histórico, exportação e recuperação de erro aprovados, sem erros JavaScript ou transbordamento horizontal. Os casos de filtro de saída e erro de serviço usam respostas simuladas.
- Aula em 390 e 1440 pixels: página inicial, acesso à aula e renderização verificados, sem erros JavaScript ou transbordamento horizontal. Captura de celular inspecionada visualmente.

### Limitação atual da geração real

O endpoint `/api/health` respondeu com sucesso, mas a saudação enviada ao chat retornou 503. Uma chamada direta ao Ollama identificou a causa: o modelo exigia 1,0 GiB de memória e havia aproximadamente 586 MiB disponíveis. Portanto, nesta auditoria não foi possível confirmar uma conversa com o modelo real. A disponibilidade do serviço e a presença do modelo instalado não comprovam capacidade de carregá-lo para geração.

O diagnóstico foi acrescentado ao README. Não foram alterados modelo, prompts ou processos do usuário para contornar a falta de RAM. Depois de disponibilizar memória, a geração precisa ser verificada novamente com uma saudação. Não foi executada uma campanha de resolução dos sete desafios.

A validação ocorreu em Linux. Windows, macOS e a integração final ao site oficial permanecem sem teste nesta auditoria. As correções foram locais, sem commit, push ou alteração dos repositórios da Liga.

## Aprofundamento da aula e versão para leitura em documento

A aula foi ampliada com explicações sobre prompt, tokens e limites de confiança; relação com engenharia social; distinção entre injeção direta, indireta e jailbreak; um exemplo completo de atendimento; e defesa em camadas. O bloco final ganhou uma função de autorização por objeto, comentada em português, e casos executáveis de consulta permitida e negada. Os exemplos permanecem identificados como ilustrações independentes da implementação do Aurora. A distribuição de tempo do segundo encontro foi ajustada para incluir a leitura do código.

Os dois blocos Python foram extraídos diretamente do Markdown e executados em sequência: a consulta legítima foi aprovada e os três casos indevidos foram negados. O build estrito da aula e a conferência de referências locais passaram. A página ampliada foi verificada em Chrome nas larguras 390 e 1440 pixels, com os dois blocos presentes, sem erros JavaScript nem transbordamento horizontal da página.

Foi gerada uma versão DOCX compatível com importação no Google Docs e um PDF de leitura. O conteúdo do DOCX foi comparado ao HTML de origem, incluindo títulos, parágrafos, listas, células e linhas de código. Tabelas e código foram inspecionados visualmente na prévia PDF. A cópia Markdown acompanha a exportação. Esses documentos são cópias de leitura; o Markdown da aula permanece como fonte para o site. Não foi testada a importação em uma conta do Google Docs nem realizada publicação externa.

Esta revisão altera somente a aula e este registro de validação; o código executável e os desafios do laboratório foram preservados. A exportação é entregue fora do repositório, na pasta de Downloads solicitada.

A revisão de adequação ao planejamento acrescentou estimativa de leitura de 30–35 minutos, aprofundamento de jailbreak, seção sobre vazamento de system prompt e atividade complementar do Gandalf. Os conceitos foram conferidos em OWASP LLM01 e LLM07; a referência da Lakera e o redirecionamento atual do jogo foram consultados. A atividade não apresenta soluções executadas nem afirma disponibilidade do formato clássico. A estimativa de leitura considera aproximadamente 5.200 palavras e pausas para código; não é uma medição com alunos.

A revisão de concisão preservou os cinco blocos, as práticas A/B/C, jailbreak, vazamento de system prompt, mitigações, Gandalf e referências. O Markdown passou de 5.221 para 2.810 palavras pela contagem de itens separados por espaços (incluindo marcação e código), redução aproximada de 46%. A leitura estimada passou a 18–22 minutos. Detalhes operacionais foram resumidos com encaminhamento ao README; os dois blocos Python permaneceram completos e foram executados novamente. O build estrito e a verificação dos 155 links locais ou projetados passaram. As contagens anteriores neste relatório descrevem revisões anteriores.
