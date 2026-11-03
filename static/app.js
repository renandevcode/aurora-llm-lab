/**
 * Interface do Aurora Prompt Lab.
 *
 * Papel na arquitetura
 * -------------------
 * A página mantém uma representação visual da sessão. api() conversa com o
 * servidor Python; as funções render* transformam o estado recebido em DOM.
 * A confirmação de flags e a execução de ferramentas pertencem ao servidor.
 *
 * Fluxo principal:
 *   evento do formulário -> api('/api/chat') -> resposta da API -> renderização
 *
 * Arquivos relacionados:
 *   index.html define os componentes e seus identificadores;
 *   style.css organiza a apresentação e os painéis em diferentes telas;
 *   app.py mantém a sessão e monta o contexto enviado ao modelo;
 *   campaign.py executa as operações registradas no painel de ações.
 *
 * O objeto state reúne conversa, tentativas, progresso e atividades por nível.
 * Ele não é uma segunda fonte de autorização ou de execução. As pistas reveladas
 * e os horários observados nesta página têm duração diferente do estado remoto.
 */

const $ = (id) => document.getElementById(id);
// Históricos e tentativas são separados por nível; as pistas duram nesta página.
const state = {
  level: 1,
  levels: [],
  histories: {},
  solved: [],
  busy: false,
  document: "",
  hintsRevealed: {},
  activities: {},
  attempts: {},
  turns: {},
  parameters: {},
  model: "",
};
/**
 * Centraliza a comunicação JSON com a API Python.
 *
 * Quando body não é informado, utiliza GET; com body, envia um POST. As funções
 * de apresentação recebem o objeto já lido e usam try/catch para mostrar falhas.
 * Isso evita repetir tratamento de protocolo em cada formulário.
 *
 * Um retorno HTTP válido pode conter erro de operação dentro do resultado de
 * ferramenta. O chamador ainda precisa interpretar os dados retornados.
 *
 * @param {string} path Caminho de uma rota da aplicação.
 * @param {Object} [body] Dados do formulário, quando há envio.
 * @returns {Promise<Object>} Corpo JSON recebido; falhas HTTP geram uma exceção.
 */
async function api(path, body) {
  const response = await fetch(path, {
    method: body === undefined ? "GET" : "POST",
    headers: { "Content-Type": "application/json" },
    ...(body === undefined ? {} : { body: JSON.stringify(body) }),
  });
  const data = await response.json();
  if (!response.ok)
    throw new Error(
      typeof data.detail === "string"
        ? data.detail
        : "Não foi possível concluir a solicitação.",
    );
  return data;
}
/** Atualiza os indicadores com os níveis confirmados pelo validador. */
function progress() {
  $("progress-count").textContent =
    `${state.solved.length} de ${state.levels.length} concluídos`;
  $("progress-bar").style.width =
    `${(state.solved.length / state.levels.length) * 100}%`;
  $("progress-text").textContent =
    state.solved.length === state.levels.length
      ? "Todos os desafios concluídos. Muito bem!"
      : `${state.solved.length} de ${state.levels.length} desafios concluídos`;
  document.querySelectorAll(".level-button").forEach((button) => {
    const solved = state.solved.includes(Number(button.dataset.level));
    button.classList.toggle("solved", solved);
    button.querySelector(".level-number").textContent = String(
      button.dataset.level,
    ).padStart(2, "0");
    button.title = solved ? "Desafio concluído" : "Desafio disponível";
    button.setAttribute(
      "aria-label",
      `${button.querySelector(".level-copy").textContent} — ${solved ? "concluído" : "disponível"}`,
    );
  });
}
/** Constrói uma mensagem com elementos DOM, sem interpretar HTML recebido. */
function addMessage(role, content, blocked = false, timestamp = null) {
  const article = document.createElement("article");
  article.className = `message ${role}${blocked ? " blocked" : ""}`;
  const avatar = document.createElement("span");
  avatar.className = role === "user" ? "user-avatar" : "assistant-avatar";
  avatar.setAttribute("aria-hidden", "true");
  if (role === "user") avatar.append(icon("user"));
  const group = document.createElement("div");
  group.className = "message-group";
  const label = document.createElement("div");
  label.className = "message-label";
  const name = document.createElement("strong");
  name.textContent = role === "user" ? "Você" : "Aurora";
  label.append(name);
  if (timestamp) {
    const time = document.createElement("time");
    time.dateTime = timestamp;
    time.textContent = new Date(timestamp).toLocaleTimeString("pt-BR", {
      hour: "2-digit",
      minute: "2-digit",
    });
    time.title = "Horário de envio ou recebimento nesta sessão";
    label.append(time);
  }
  const body = document.createElement("div");
  body.className = "message-body";
  renderContent(body, content);
  const actions = document.createElement("div");
  actions.className = "message-actions";
  const copy = document.createElement("button");
  copy.type = "button";
  copy.className = "copy-message";
  copy.append(icon("copy"));
  copy.setAttribute("aria-label", "Copiar mensagem");
  copy.title = "Copiar mensagem";
  copy.addEventListener("click", async () => {
    try {
      await navigator.clipboard.writeText(content);
      copy.replaceChildren(document.createTextNode("Copiado"));
    } catch {
      copy.replaceChildren(document.createTextNode("Selecione o texto"));
    }
  });
  actions.append(copy);
  if (role === "assistant") {
    const note = document.createElement("span");
    note.textContent = state.solved.includes(state.level)
      ? "Desafio concluído pelo validador"
      : "Resultado ainda não validado";
    actions.append(note);
  }
  group.append(label, body);
  if (role === "assistant") group.append(actions);
  article.append(avatar, group);
  $("messages").append(article);
}
/**
 * Reconstrói a conversa do nível selecionado sem alterar o histórico da sessão.
 *
 * O histórico preserva os dados; os elementos da lista podem ser recriados por
 * addMessage(). A rolagem só acompanha a resposta quando a leitura já está perto
 * do fim ou quando o chamador solicita acompanhamento explícito. Assim, uma
 * atualização não interrompe quem está relendo mensagens anteriores.
 *
 * @param {boolean} force Faz a conversa acompanhar o final, como na troca de nível.
 */
function renderMessages(force = false) {
  const scroller = $("chat-scroll");
  const top = scroller.scrollTop;
  const follow = force || scroller.scrollHeight - scroller.clientHeight - top < 64;
  $("messages").replaceChildren();
  const history = state.histories[state.level] || [];
  $("welcome").hidden = history.length > 0;
  history.forEach((message) =>
    addMessage(message.role, message.content, message.blocked, message.timestamp),
  );
  $("send-count").textContent =
    `${history.filter((m) => m.role === "user").length} ${history.filter((m) => m.role === "user").length === 1 ? "envio" : "envios"}`;
  scroller.scrollTop = follow ? scroller.scrollHeight : top;
}
/**
 * Seleciona o nível e sincroniza os componentes que dependem dessa escolha.
 *
 * Usa os metadados recebidos da API para preencher objetivo, pistas e histórico.
 * Também decide se deve mostrar editor de ticket e formulários, atualiza a URL
 * e limpa os campos de entrada. Nenhuma chamada ao modelo ocorre nesta função.
 *
 * Trocar de nível não reinicia a campanha ou apaga tentativas. O mesmo objeto
 * state conserva os registros por nível; a API continua decidindo o progresso.
 *
 * @param {number} id Identificador de um nível presente em state.levels.
 */
function selectLevel(id) {
  if (state.busy) return;
  state.level = id;
  closeMission();
  document.body.classList.remove("sidebar-open");
  $("sidebar-toggle").setAttribute("aria-expanded", "false");
  const url = new URL(window.location.href);
  url.searchParams.set("nivel", String(id));
  window.history.replaceState(null, "", url);
  const level = state.levels.find((item) => item.id === id);
  $("current-name").textContent = level.name;
  $("level-tag").textContent = level.tag;
  $("challenge-number").textContent = String(id).padStart(2, "0");
  $("difficulty").textContent = level.difficulty;
  $("level-description").textContent = level.description;
  $("mission-objective").replaceChildren();
  for (const part of level.objective.split(/([A-Z]+_[A-Z_]+)/g)) {
    const node = document.createElement(
      /^[A-Z]+_[A-Z_]+$/.test(part) ? "code" : "span",
    );
    node.textContent = part;
    $("mission-objective").append(node);
  }
  $("mission-location").textContent = `Onde procurar: ${level.location}`;
  $("video-source").hidden = !level.video_url;
  if (level.video_url) {
    $("video-source").href = level.video_url;
    $("video-source").textContent = `Assistir ao trecho · ${level.video_label}`;
  }
  $("reflection").hidden = !level.reflection;
  $("reflection").textContent = level.reflection
    ? `Para discutir em aula: ${level.reflection}`
    : "";
  $("tool-panel").hidden = id < 4;
  $("tool-panel").open = false;
  $("action-form").hidden = id < 6;
  $("phone-fields").hidden = id !== 6;
  $("door-fields").hidden = id !== 7;
  $("phone-input").required = id === 6;
  $("code-input").required = id === 7;
  $("direction-input").required = id === 7;
  $("action-button").textContent =
    id === 6 ? "Ligar no simulador" : "Abrir porta no simulador";
  $("action-feedback").textContent = "";
  renderActions();
  $("hint").hidden = false;
  renderHints();

  $("document-panel").hidden = id !== 4;
  $("flag-input").value = "";
  $("flag-feedback").textContent = "";
  $("capture-title").textContent = "Validar descoberta";
  $("mission-status").textContent = state.solved.includes(id)
    ? "Concluído"
    : "Em andamento";
  $("message-input").value = "";
  $("char-count").textContent = "0 / 4000";
  $("chat-status").textContent = "";
  document.querySelectorAll(".level-button").forEach((button) => {
    const selected = Number(button.dataset.level) === id;
    button.classList.toggle("active", selected);
    button.setAttribute("aria-current", selected ? "step" : "false");
  });
  renderMessages(true);
  $("attempt-label").textContent =
    `Conversa ${String((state.attempts[id] || []).length + 1).padStart(2, "0")}`;
  document.querySelectorAll(".level-button").forEach((button) => {
    const level = state.levels.find((x) => x.id === Number(button.dataset.level));
    button.querySelector("small").textContent = level.tag;
  });
  $("next-level").hidden = !state.solved.includes(id) || id === state.levels.length;
  if (state.solved.includes(id)) {
    $("flag-feedback").className = "success";
    $("flag-feedback").textContent = "✓ Este desafio já foi concluído.";
  }
}
/** Evita envios duplicados pela interface enquanto uma requisição está em curso. */
function setBusy(busy) {
  state.busy = busy;
  [
    "send-button",
    "new-chat",
    "message-input",
    "document-input",
    "action-button",
  ].forEach((id) => ($(id).disabled = busy));
  document
    .querySelectorAll(".level-button, .suggestions button")
    .forEach((button) => (button.disabled = busy));
  $("send-button").disabled = busy || !$("message-input").value.trim();
  $("chat-form").setAttribute("aria-busy", String(busy));
}
/** Exibe somente a quantidade de pistas já revelada nesta página. */
function renderHints() {
  const level = state.levels.find((item) => item.id === state.level);
  const count = state.hintsRevealed[state.level] || 0;
  $("hint-list").replaceChildren();
  level.hints.slice(0, count).forEach((text) => {
    const item = document.createElement("li");
    item.textContent = text;
    $("hint-list").append(item);
  });
  $("hint-count").textContent = `${count} de ${level.hints.length}`;
  $("next-hint").disabled = count >= level.hints.length;
  $("next-hint").textContent =
    count >= level.hints.length
      ? "Todas as pistas reveladas"
      : count === 0
        ? "Revelar primeira pista"
        : "Revelar próxima pista";
}
// Revelação progressiva de pistas; não altera o progresso validado.
$("next-hint").addEventListener("click", () => {
  const level = state.levels.find((item) => item.id === state.level);
  state.hintsRevealed[state.level] = Math.min(
    (state.hintsRevealed[state.level] || 0) + 1,
    level.hints.length,
  );
  renderHints();
});

/**
 * Exibe os eventos registrados pela API para o nível atual.
 *
 * A lista é copiada antes de inverter a ordem, preservando o estado original.
 * Cada item mostra nome, argumentos da operação e retorno, inclusive erros.
 * O painel não deduz uma execução a partir da resposta textual do modelo.
 *
 * Um evento antigo continua sendo evidência daquela tentativa, mas não garante
 * que uma condição da campanha ainda esteja satisfeita depois de um reinício.
 */
function renderActions() {
  const events = state.activities[state.level] || [];
  $("action-count").textContent = events.length
    ? `${events.length} ações registradas`
    : "Nenhuma ação registrada";
  $("action-log").replaceChildren();
  events
    .slice()
    .reverse()
    .forEach((event) => {
      const details = document.createElement("details");
      const summary = document.createElement("summary");
      summary.textContent = `${event.result.erro ? "⚠" : "✓"} ${event.name}${event.arguments.operacao ? " · " + event.arguments.operacao : ""}`;
      const pre = document.createElement("pre");
      pre.textContent = JSON.stringify(event.result, null, 2);
      details.append(summary, pre);
      $("action-log").append(details);
    });
}
// Os formulários usam a API de ações diretamente, sem inferência do modelo.
$("action-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  if (state.busy) return;
  setBusy(true);
  $("action-feedback").textContent = "Executando…";
  try {
    const payload =
      state.level === 6
        ? { action: "ligar_ramal", arguments: { ramal: $("phone-input").value } }
        : {
            action: "abrir_porta",
            arguments: {
              codigo: $("code-input").value,
              direcao: $("direction-input").value,
            },
          };
    const data = await api("/api/action", { level: state.level, ...payload });
    state.activities[state.level] = data.activities;
    renderActions();
    $("action-feedback").textContent =
      data.event.result.erro || "Ação executada. Confira o resultado abaixo.";
    const latest = $("action-log").querySelector("details");
    if (latest) latest.open = true;
  } catch (error) {
    $("action-feedback").textContent = error.message;
  } finally {
    setBusy(false);
  }
});
/** Abre o painel de missão e posiciona o foco conforme a largura da tela. */
function openMission() {
  document.body.classList.add("mission-open");
  $("mission-toggle").setAttribute("aria-expanded", "true");
  $("context-panel").scrollIntoView({ block: "start" });
  if (matchMedia("(max-width:1100px)").matches) $("close-mission").focus();
  else $("flag-input").focus();
}
/** Fecha o painel e mantém o atributo de acessibilidade sincronizado. */
function closeMission() {
  document.body.classList.remove("mission-open");
  $("mission-toggle").setAttribute("aria-expanded", "false");
}
// Navegação dos painéis e atalhos de teclado.
$("challenge-button").addEventListener("click", openMission);
$("mission-toggle").addEventListener("click", () => {
  if (document.body.classList.contains("mission-open")) {
    closeMission();
  } else {
    openMission();
  }
});
$("close-mission").addEventListener("click", () => {
  closeMission();
  $("mission-toggle").focus();
});
$("sidebar-toggle").addEventListener("click", () => {
  const open = document.body.classList.toggle("sidebar-open");
  $("sidebar-toggle").setAttribute("aria-expanded", String(open));
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape") {
    closeMission();
    document.body.classList.remove("sidebar-open");
    $("sidebar-toggle").setAttribute("aria-expanded", "false");
    $("message-input").focus({ preventScroll: true });
  }
});
$("document-toggle").addEventListener("click", () => {
  $("document-editor").hidden = !$("document-editor").hidden;
  $("document-toggle").setAttribute(
    "aria-expanded",
    String(!$("document-editor").hidden),
  );
});
$("message-input").addEventListener("input", () => {
  $("char-count").textContent = `${$("message-input").value.length} / 4000`;
  $("send-button").disabled = state.busy || !$("message-input").value.trim();
});
$("message-input").addEventListener("keydown", (event) => {
  if (event.key === "Enter" && !event.shiftKey && !event.isComposing) {
    event.preventDefault();
    if (!state.busy) $("chat-form").requestSubmit();
  }
});
document.querySelectorAll("[data-message]").forEach((button) =>
  button.addEventListener("click", () => {
    $("message-input").value = button.dataset.message;
    $("chat-form").requestSubmit();
  }),
);
// Conversa: apresentação imediata, inferência no servidor e atualização da tela.
// A mensagem aparece antes da resposta para indicar o envio. Em falhas de serviço,
// esse registro visual é desfeito e o campo é restaurado para nova tentativa.
// Os eventos de ferramenta vêm da API; o texto do assistente não os substitui.
$("chat-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const message = $("message-input").value.trim();
  if (!message || state.busy) return;
  const history = (state.histories[state.level] ||= []);
  history.push({ role: "user", content: message, timestamp: new Date().toISOString() });
  renderMessages();
  $("message-input").value = "";
  $("char-count").textContent = "0 / 4000";
  setBusy(true);
  $("chat-status").textContent = "✧ Aurora está pensando…";
  try {
    const data = await api("/api/chat", {
      level: state.level,
      message,
      document: $("document-input").value,
    });
    history.push({
      role: "assistant",
      content: data.reply,
      blocked: data.blocked,
      timestamp: new Date().toISOString(),
    });
    state.turns[state.level] ||= [];
    // Um bloqueio de entrada não representa um turno de inferência.
    if (data.block_stage !== "input")
      state.turns[state.level].push({
        prompt: message,
        response: data.reply,
        document: state.level === 4 ? $("document-input").value : null,
        model: state.model,
        parameters: state.parameters,
        activities: data.activities || [],
      });
    if (data.activities) {
      state.activities[state.level] = data.activities;
      renderActions();
    }
    $("chat-status").textContent =
      data.block_stage === "input"
        ? "Mensagem bloqueada antes da inferência."
        : data.block_stage === "output"
          ? "Resposta bloqueada após a inferência pelo filtro de saída."
          : "";
  } catch (error) {
    history.pop();
    $("message-input").value = message;
    $("char-count").textContent = `${message.length} / 4000`;
    $("chat-status").textContent = error.message;
  } finally {
    setBusy(false);
    renderMessages();
    $("message-input").focus({ preventScroll: true });
  }
});
// A checagem de formato ajuda o aluno; a confirmação real vem do servidor.
$("flag-form").addEventListener("submit", async (event) => {
  event.preventDefault();
  const button = event.submitter;
  const flag = $("flag-input").value.trim();
  $("flag-feedback").className = "error";
  if (!flag) {
    $("flag-feedback").textContent = "Digite a flag encontrada.";
    return;
  }
  if (!/^CTF\{.+\}$/.test(flag)) {
    $("flag-feedback").textContent =
      "Formato inválido. Use CTF{…}, incluindo as chaves.";
    return;
  }
  button.disabled = true;
  $("flag-feedback").textContent = "Validando descoberta…";
  // Guarde o nível do envio, pois a pessoa pode mudar de missão durante a espera.
  const level = state.level;
  try {
    const result = await api("/api/flag", { level, flag: $("flag-input").value });
    state.solved = result.solved;
    progress();
    if (state.level === level) {
      $("flag-feedback").className = result.correct ? "success" : "error";
      $("flag-feedback").textContent = result.correct
        ? `✓ Flag capturada! ${result.lesson}`
        : "Ainda não. Confira a flag completa, incluindo CTF{…}.";
      if (result.correct) {
        $("mission-status").textContent = "Concluído";
        renderMessages();
        $("flag-input").value = "";
        $("next-level").hidden = level === state.levels.length;
      }
    }
  } catch (error) {
    $("flag-feedback").className = "error";
    $("flag-feedback").textContent = error.message;
  } finally {
    button.disabled = false;
  }
});
// Nova tentativa é uma operação do servidor, não apenas a limpeza da tela.
// Depois do reinício, consulte novamente os arquivos de tentativas e os turnos.
// Progresso e campanha seguem as regras da API; não são recriados aqui.
$("new-chat").addEventListener("click", async () => {
  if (state.busy) return;
  setBusy(true);
  try {
    await api("/api/reset", { level: state.level });
    const data = await api("/api/state");
    state.attempts = data.attempts || {};
    state.turns = data.turns || {};
    state.histories[state.level] = [];
    $("attempt-label").textContent =
      `Conversa ${String((state.attempts[state.level] || []).length + 1).padStart(2, "0")}`;
    renderMessages();
    $("chat-status").textContent = "";
  } catch (error) {
    $("chat-status").textContent = error.message;
  } finally {
    setBusy(false);
    $("message-input").focus({ preventScroll: true });
  }
});
/**
 * Inicializa a página a partir da sessão mantida pelo servidor.
 *
 * A primeira consulta fornece metadados dos níveis, históricos, tentativas e
 * parâmetros do modelo. Só então os botões de navegação são criados e os
 * controles liberados. A interface não precisa repetir uma inferência para
 * reapresentar uma conversa que já pertence à sessão.
 *
 * O parâmetro nivel da URL seleciona uma missão existente; caso não corresponda
 * aos metadados disponíveis, a página começa no primeiro nível. Falhas na consulta
 * inicial são apresentadas ao aluno sem inventar um estado de progresso.
 */
async function init() {
  setBusy(true);
  try {
    const data = await api("/api/state");
    Object.assign(state, {
      levels: data.levels,
      solved: data.solved,
      histories: data.histories,
      document: data.document,
      activities: data.activities || {},
      attempts: data.attempts || {},
      turns: data.turns || {},
      model: data.model,
      parameters: data.parameters || {},
    });
    $("model-settings").textContent = data.parameters
      ? `${data.model} · temperatura ${data.parameters.temperature} · limite de saída ${data.parameters.num_predict} tokens · janela ${data.parameters.num_ctx} tokens`
      : `${data.model} · parâmetros não informados por esta versão do servidor`;
    $("model-label").textContent = data.model;
    $("document-input").value = data.document;
    data.levels.forEach((level) => {
      const button = document.createElement("button");
      button.type = "button";
      button.className = "level-button";
      button.dataset.level = level.id;
      const number = document.createElement("span");
      number.className = "level-number";
      const copy = document.createElement("span");
      copy.className = "level-copy";
      copy.textContent = level.name;
      const tag = document.createElement("small");
      tag.textContent = level.tag;
      copy.append(tag);
      const arrow = document.createElement("span");
      arrow.className = "level-chevron";
      arrow.textContent = "›";
      button.append(number, copy, arrow);
      button.addEventListener("click", () => selectLevel(level.id));
      $("levels").append(button);
    });
    const requested = Number(new URLSearchParams(window.location.search).get("nivel"));
    setBusy(false);
    progress();
    selectLevel(data.levels.some((level) => level.id === requested) ? requested : 1);
  } catch (error) {
    $("chat-status").textContent =
      "Erro ao carregar o laboratório. Atualize a página. " + error.message;
  }
}
/**
 * Apresenta um subconjunto de texto formatado sem interpretar HTML recebido.
 *
 * Respostas do modelo e documentos são conteúdo, não elementos confiáveis da
 * página. A função cria nós DOM e atribui texto com textContent. Blocos de código
 * ganham linhas numeradas e listas simples recebem elementos próprios.
 *
 * Este tratamento não é um interpretador completo de Markdown. Ele é reutilizado
 * na conversa e no histórico, mantendo o mesmo comportamento de apresentação.
 *
 * @param {HTMLElement} target Elemento cujo conteúdo visual será substituído.
 * @param {string} text Texto da mensagem ou do registro consultado.
 */
function renderContent(target, text) {
  target.replaceChildren();
  // Nunca transforme a saída do modelo em HTML: o conteúdo entra como texto.
  if (text.includes("```")) {
    let code = false;
    for (const chunk of text.split(/(```[^\n]*\n|```)/g)) {
      if (chunk.startsWith("```")) {
        code = !code;
        continue;
      }
      const el = document.createElement(code ? "pre" : "div");
      if (code) {
        const content = document.createElement("code");
        chunk
          .replace(/\n$/, "")
          .split("\n")
          .forEach((line, i) => {
            const row = document.createElement("span");
            row.className = "code-line";
            const number = document.createElement("span");
            number.className = "line-number";
            number.setAttribute("aria-hidden", "true");
            number.textContent = i + 1;
            row.append(number);
            for (const token of line.split(/("[^"\n]*")/g)) {
              const text = document.createElement("span");
              if (token.startsWith('"')) text.className = "code-string";
              text.textContent = token;
              row.append(text);
            }
            content.append(row);
          });
        el.append(content);
      } else el.textContent = chunk;
      target.append(el);
    }
  } else {
    let list = null;
    for (const line of text.split("\n")) {
      const match = line.match(/^\s*(?:[-*]|\d+\.)\s+(.+)/);
      if (match) {
        if (!list) {
          list = document.createElement("ul");
          target.append(list);
        }
        const li = document.createElement("li");
        li.textContent = match[1];
        list.append(li);
      } else {
        list = null;
        const el = document.createElement("div");
        el.textContent = line || "\u00a0";
        target.append(el);
      }
    }
  }
}
$("next-level").addEventListener("click", () => {
  if (!state.busy && state.level < state.levels.length) selectLevel(state.level + 1);
});
/**
 * Reúne o arquivo de tentativas e uma representação da conversa atual.
 *
 * A comparação é de leitura: não reaplica prompts, não desfaz ações e não
 * restaura o estado da campanha. Por isso, os resultados de duas tentativas
 * precisam ser interpretados considerando suas condições iniciais.
 */
function attemptData() {
  return [
    ...(state.attempts[state.level] || []),
    {
      messages: state.histories[state.level] || [],
      turns: state.turns[state.level] || [],
      model: state.model,
      parameters: state.parameters,
    },
  ];
}
/** Monta a visualização de uma tentativa e dos documentos enviados nos turnos. */
function attemptView(attempt) {
  const box = document.createElement("div");
  box.className = "attempt-view";
  const meta = document.createElement("p");
  meta.textContent = `${attempt.model} · ${JSON.stringify(attempt.parameters)}`;
  box.append(meta);
  for (const message of attempt.messages) {
    const label = document.createElement("h4");
    label.textContent = message.role === "user" ? "Seu prompt" : "Aurora";
    const content = document.createElement("div");
    renderContent(content, message.content);
    box.append(label, content);
  }
  for (const [i, turn] of (attempt.turns || []).entries()) {
    if (turn.document) {
      const details = document.createElement("details");
      const summary = document.createElement("summary");
      summary.textContent = `Documento enviado · turno ${i + 1}`;
      const pre = document.createElement("pre");
      pre.textContent = turn.document;
      details.append(summary, pre);
      box.append(details);
    }
  }
  return box;
}
/** Exibe lado a lado as tentativas selecionadas para leitura. */
function compareAttempts() {
  const attempts = attemptData();
  $("compare-content").replaceChildren();
  for (const id of ["compare-a", "compare-b"]) {
    const section = document.createElement("section");
    const title = document.createElement("h3");
    title.textContent = `Tentativa ${Number($(id).value) + 1}`;
    section.append(title, attemptView(attempts[Number($(id).value)]));
    $("compare-content").append(section);
  }
}
// Histórico e comparação são consultas; não ramificam nem reproduzem a sessão.
$("history-button").addEventListener("click", () => {
  const attempts = attemptData();
  $("attempt-list").replaceChildren();
  attempts.forEach((attempt, i) => {
    const details = document.createElement("details");
    const summary = document.createElement("summary");
    summary.textContent = `Tentativa ${i + 1}${i === attempts.length - 1 ? " · atual" : ""} · ${attempt.messages.length} mensagens`;
    details.append(summary, attemptView(attempt));
    $("attempt-list").append(details);
  });
  $("comparison").hidden = attempts.length < 2;
  for (const id of ["compare-a", "compare-b"]) {
    $(id).replaceChildren();
    attempts.forEach((_, i) => {
      const option = document.createElement("option");
      option.value = i;
      option.textContent = `Tentativa ${i + 1}`;
      $(id).append(option);
    });
  }
  $("compare-b").value = String(attempts.length - 1);
  compareAttempts();
  $("history-dialog").showModal();
});
$("compare-a").addEventListener("change", compareAttempts);
$("compare-b").addEventListener("change", compareAttempts);
$("close-history").addEventListener("click", () => $("history-dialog").close());
// Exportação é um registro para análise, não um mecanismo de restauração.
// O estado público é obtido novamente da API para incluir os registros do servidor.
// document_draft guarda o editor atual; os documentos enviados pertencem aos turnos.
$("export-history").addEventListener("click", async () => {
  const button = $("export-history");
  button.disabled = true;
  try {
    // O registro parte do servidor; o editor atual é salvo como rascunho separado.
    const snapshot = await api("/api/state");
    const data = {
      ...snapshot,
      document_draft: $("document-input").value,
      exported_at: new Date().toISOString(),
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
    );
    const link = document.createElement("a");
    link.href = url;
    link.download = "aurora-evidencias.json";
    link.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
    $("export-status").textContent =
      "Evidências exportadas. O arquivo não restaura a sessão.";
  } catch (error) {
    $("export-status").textContent = error.message;
  } finally {
    button.disabled = false;
  }
});
// Formas dos ícones da interface; não dependem de uma biblioteca externa.
const iconPaths = {
  plus: "M12 4v16M4 12h16",
  arrow: "M12 20V4M5 11l7-7 7 7",
  history: "M12 8v5l4 2M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0",
  copy: "M8 7h12v15H8zM15 7V2H3v15h5",
  monitor: "M3 3h18v13H3zM12 16v5M8 21h8",
  help: "M22 12a10 10 0 1 1-20 0 10 10 0 0 1 20 0M9 8a3 3 0 0 1 6 0c0 3-3 2-3 5M12 17h.01",
  flag: "M4 22V3c5-3 9 3 16 0v12c-7 3-11-3-16 0",
  bulb: "M9 19h6M10 22h4M8 16c0-3-4-3-4-8a8 8 0 0 1 16 0c0 5-4 5-4 8v1H8z",
  target: "M21 10a10 10 0 1 1-7-8M17 10a6 6 0 1 1-7-3M12 12l9-9M17 3h4v4",
  user: "M16 7a4 4 0 1 1-8 0 4 4 0 0 1 8 0M4 22v-3a8 8 0 0 1 16 0v3z",
};
/** Cria um SVG local a partir das formas definidas neste arquivo. */
function icon(name) {
  const svg = document.createElementNS("http://www.w3.org/2000/svg", "svg");
  svg.setAttribute("viewBox", "0 0 24 24");
  svg.setAttribute("aria-hidden", "true");
  svg.classList.add("icon");
  const path = document.createElementNS(svg.namespaceURI, "path");
  path.setAttribute("d", iconPaths[name]);
  svg.append(path);
  return svg;
}
document
  .querySelectorAll("[data-icon]")
  .forEach((el) => el.append(icon(el.dataset.icon)));
$("how-button").addEventListener("click", () => $("how-dialog").showModal());
$("close-how").addEventListener("click", () => $("how-dialog").close());
init();

// Mantém a navegação por Tab dentro do painel aberto em telas menores.
document.addEventListener("keydown", (event) => {
  if (
    event.key !== "Tab" ||
    !document.body.classList.contains("mission-open") ||
    !matchMedia("(max-width:1100px)").matches
  )
    return;
  const controls = [
    ...$("context-panel").querySelectorAll("button, input, textarea, summary, a[href]"),
  ].filter((el) => !el.disabled && el.getClientRects().length);
  const first = controls[0],
    last = controls[controls.length - 1];
  if (event.shiftKey && document.activeElement === first) {
    event.preventDefault();
    last.focus();
  }
  if (!event.shiftKey && document.activeElement === last) {
    event.preventDefault();
    first.focus();
  }
});
