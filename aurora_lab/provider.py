"""Cliente HTTP explícito para a API local /api/chat do Ollama."""
from __future__ import annotations

import json
from urllib.error import HTTPError, URLError
from urllib.parse import urlparse
from urllib.request import Request, urlopen

TOOLS = [
    {"type": "function", "function": {"name": "read_case", "description": "Consultar o estado local de um chamado fictício.",
      "parameters": {"type": "object", "required": ["case_id"], "properties": {"case_id": {"type": "string"}}}}},
    {"type": "function", "function": {"name": "update_case", "description": "Propor alteração local de chamado; a aplicação valida permissão e confirmação externa.",
      "parameters": {"type": "object", "required": ["case_id", "new_state"],
                     "properties": {"case_id": {"type": "string"}, "new_state": {"type": "string", "enum": ["aberto", "em_analise"]}}}}},
]


def ollama_chat(messages: list[dict], model: str, endpoint: str) -> dict:
    parsed = urlparse(endpoint)
    if parsed.scheme != "http" or parsed.hostname not in {"localhost", "127.0.0.1", "::1"} or parsed.path != "/api/chat":
        raise ValueError("O endpoint Ollama deve ser http://localhost:11434/api/chat ou outro endereço de loopback /api/chat")
    payload = json.dumps({"model": model, "messages": messages, "tools": TOOLS,
                          "stream": False, "options": {"temperature": 0}}).encode()
    req = Request(endpoint, data=payload, headers={"Content-Type": "application/json"}, method="POST")
    try:
        with urlopen(req, timeout=90) as response:
            data = json.load(response)
    except (HTTPError, URLError, TimeoutError) as exc:
        raise RuntimeError(f"Falha na API local do Ollama: {exc}") from exc
    if not isinstance(data.get("message"), dict):
        raise RuntimeError("Resposta da API sem campo message")
    return data["message"]


def run_ollama(lab, messages: list[dict], model: str, endpoint: str) -> str:
    """No máximo uma rodada de ferramentas; qualquer proposta adicional fica sem execução."""
    first = ollama_chat(messages, model, endpoint)
    calls = first.get("tool_calls") or []
    if not calls:
        return str(first.get("content") or "")
    messages.append({"role": "assistant", "content": first.get("content") or "", "tool_calls": calls})
    for call in calls:
        function = call.get("function") or {}
        args = function.get("arguments") or {}
        if not isinstance(args, dict):
            args = {}
        name = str(function.get("name") or "")
        result = lab.call_tool(name, args, source="ollama_model")
        messages.append({"role": "tool", "tool_name": name, "content": json.dumps(result, ensure_ascii=False)})
    second = ollama_chat(messages, model, endpoint)
    if second.get("tool_calls"):
        lab.events.append({"kind": "tool_unexecuted", "reason": "limite de uma rodada de ferramentas"})
    return str(second.get("content") or "")
