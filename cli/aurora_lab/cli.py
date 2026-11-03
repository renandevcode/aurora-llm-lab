"""CLI do laboratório. --profile simula uma sessão autenticada, sem autenticar pessoas."""
from __future__ import annotations

import argparse
import json
from datetime import datetime, timezone
from pathlib import Path

from .core import Lab, VALID_CONFIGS, VALID_PROFILES
from .provider import run_ollama
from .scenarios import SCENARIOS, binary_controls

DEFAULT_STATE = Path(__file__).resolve().parent.parent / "state"


def offline_answer(lab: Lab, question: str) -> str:
    """Simulação conservadora do fluxo; nunca representa uma saída de LLM."""
    if lab.scenario.name == "own_case" or "estado do meu chamado" in question.lower():
        result = lab.call_tool("read_case", {"case_id": "C-17"}, source="offline_simulation")
        return f"SIMULAÇÃO: C-17 está {result['state']}." if result["allowed"] else "SIMULAÇÃO: consulta negada."
    if lab.scenario.name == "legit_update":
        result = lab.call_tool("update_case", {"case_id": "C-17", "new_state": "em_analise"}, source="offline_simulation")
        return f"SIMULAÇÃO: alteração {'realizada' if result['allowed'] else 'negada'}."
    return "SIMULAÇÃO: conforme PUB-TROCAS, o prazo é de até 30 dias após o recebimento, com comprovante."


def save_json(path: Path, value: dict) -> None:
    path.parent.mkdir(parents=True, exist_ok=True)
    path.write_text(json.dumps(value, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")


def run(args: argparse.Namespace) -> dict:
    scenario = SCENARIOS[args.scenario]
    lab = Lab(args.profile, args.config, scenario, args.confirm_change)
    questions = [*scenario.history, scenario.question]
    if args.scenario == "binary":  # duas perguntas independentes com mesmo marcador, sem histórico
        questions = list(binary_controls(lab.internal_marker))
    answer = ""
    for question in questions:
        docs = lab.selected_documents()
        lab.events.append({"kind": "context", "question": question,
                           "documents": [{"id": d["id"], "body": d["body"]} for d in docs],
                           "history_length": len(lab.history)})
        messages = lab.messages(question, docs)
        if args.mode == "offline":
            answer = offline_answer(lab, question)
        else:
            if not args.model:
                raise ValueError("--model é obrigatório no modo ollama")
            answer = run_ollama(lab, messages, args.model, args.endpoint)
        lab.record_response(answer, args.mode)
        if args.scenario == "multi":
            lab.history.extend([{"role": "user", "content": question}, {"role": "assistant", "content": answer}])
    if args.propose_update:
        # Chamada forjada para testar autorização sem depender do comportamento do modelo.
        lab.call_tool("update_case", {"case_id": "C-17", "new_state": args.propose_update}, source="cli_forged")
    result = lab.report(args.mode)
    result["model"] = args.model if args.mode == "ollama" else None
    result["answer"] = answer
    stamp = datetime.now(timezone.utc).strftime("%Y%m%dT%H%M%S%fZ")
    state_dir = Path(args.state_dir)
    save_json(state_dir / f"run-{stamp}.json", result)
    save_json(state_dir / "current.json", {"case_state": lab.case_state, "history": lab.history})
    save_json(state_dir / f"evaluation-{stamp}.json", {"internal_marker": lab.internal_marker,
               "system_marker": lab.system_marker, "binary_controls": binary_controls(lab.internal_marker)})
    return result


def main(argv: list[str] | None = None) -> int:
    parser = argparse.ArgumentParser(description="Laboratório Aurora: dados e operações locais fictícios")
    sub = parser.add_subparsers(dest="command", required=True)
    run_p = sub.add_parser("run", help="executar um caso com estado novo")
    run_p.add_argument("--scenario", choices=sorted(SCENARIOS), required=True)
    run_p.add_argument("--config", choices=sorted(VALID_CONFIGS), required=True)
    run_p.add_argument("--profile", choices=sorted(VALID_PROFILES), required=True,
                       help="perfil de laboratório definido fora da conversa; não é autenticação de produção")
    run_p.add_argument("--mode", choices=["offline", "ollama"], default="offline")
    run_p.add_argument("--model", help="nome de modelo local já instalado no Ollama")
    run_p.add_argument("--endpoint", default="http://localhost:11434/api/chat")
    run_p.add_argument("--confirm-change", help="confirmação externa exata, por exemplo C-17:em_analise")
    run_p.add_argument("--propose-update", choices=["aberto", "em_analise"],
                       help="forja chamada de ferramenta para testar os controles sem LLM")
    run_p.add_argument("--state-dir", default=str(DEFAULT_STATE))
    reset_p = sub.add_parser("reset", help="reiniciar estado persistido de demonstração")
    reset_p.add_argument("--state-dir", default=str(DEFAULT_STATE))
    args = parser.parse_args(argv)
    if args.command == "reset":
        save_json(Path(args.state_dir) / "current.json", {"case_state": {"C-17": "aberto"}, "history": []})
        print("Estado de demonstração reiniciado; relatórios anteriores preservados.")
        return 0
    try:
        result = run(args)
    except (ValueError, RuntimeError) as exc:
        parser.error(str(exc))
    print(json.dumps({"mode": result["mode"], "scenario": result["scenario"],
                      "profile": result["profile"], "config": result["config"],
                      "documents_sent": [d["id"] for d in result["documents_sent"][-1]["documents"]],
                      "answer": result["answer"], "case_state": result["case_state"],
                      "tool_events": [e for e in result["events"] if e["kind"].startswith("tool_")]},
                     ensure_ascii=False, indent=2))
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
