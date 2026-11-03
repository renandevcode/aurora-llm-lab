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

Após a ampliação da trilha `learn/`, foram verificados os 14 documentos Markdown do pacote quanto a links relativos locais e fechamento de blocos de código, sem erros encontrados. A aula em `docs/AULA.md` usa exemplos textuais e links locais para instalação e aprofundamento; esses destinos devem ser ajustados à pasta oficial do projeto quando a página for publicada separadamente. Os módulos aprofundados têm navegação entre si e links para os arquivos da implementação. A comparação de estrutura está descrita em [Integração](INTEGRACAO.md).

A ampliação do material se limitou a documentação: a trilha ganhou módulos de conceitos, arquitetura, implementação, desafios, validação e entrega. O MVP defensivo está proposto para o aluno, com passos e critérios, sem ser apresentado como funcionalidade já implementada. A API e o chatbot não foram alterados nessa ampliação.

Não foram executados o build do site oficial, testes em Windows ou macOS, testes de carga, nem uma nova campanha completa de resolução dos sete níveis com o modelo real. A documentação diferencia essas verificações da instalação, da saúde do serviço e dos testes simulados. A execução da aula exige as dependências locais e o modelo baixado; GitHub Pages hospeda apenas o texto estático.


## Revisão da aula para o site

A página `docs/AULA.md` foi ampliada com uma situação de atendimento acompanhada ao longo da explicação, exemplos comentados, quatro perguntas com respostas explicadas e práticas em três grupos de níveis. Os exemplos estão identificados como conceituais e não como execuções medidas do Aurora. A organização preserva dois encontros de 90 minutos, com instalação prévia.

A aula recebeu links para instalação, diagnóstico, trilha, desafios e entrega. O guia de integração descreve como redirecionar esses links para a pasta definitiva em Projetos, ainda não definida. Não foram criadas URLs para uma pasta remota inexistente.

Foi preparada uma cópia temporária do material e executado `mkdocs build --strict` com MkDocs 1.6.1 e Material 9.7.7. O build concluiu. Na página HTML da aula, foram verificados 42 links do artigo, incluindo navegação interna: todos os destinos locais e âncoras verificados existem. A renderização foi conferida em Chrome nas larguras de 390 e 1440 pixels, sem transbordamento horizontal da página nem erros JavaScript. As capturas foram inspecionadas, e o diagrama foi disposto verticalmente para facilitar a leitura no celular. Essa prévia local não utiliza a configuração completa do site oficial nem valida sua integração futura.

A trilha `learn/` foi preservada nesta revisão. Seus arquivos foram comparados por hash antes e depois da edição da aula. A mudança se restringiu à aula e aos registros locais de integração e validação; não houve alteração de código, commit, push ou publicação.
