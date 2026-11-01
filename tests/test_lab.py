import json
import tempfile
import unittest
from argparse import Namespace
from pathlib import Path
from unittest.mock import patch

from aurora_lab.cli import run
from aurora_lab.core import Lab
from aurora_lab.provider import run_ollama
from aurora_lab.scenarios import SCENARIOS


def args(**changes):
    base = dict(scenario="baseline", config="C", profile="ana", mode="offline",
                model=None, endpoint="http://localhost:11434/api/chat", confirm_change=None,
                propose_update=None, state_dir=tempfile.mkdtemp())
    return Namespace(**(base | changes))


class LabTests(unittest.TestCase):
    def test_context_exact_and_identity_outside_prompt(self):
        for config, expected in [("A", ["PUB-TROCAS", "PUB-CANAIS", "CH-C17", "INT-REVISAO"]),
                                 ("B", ["PUB-TROCAS", "PUB-CANAIS", "CH-C17", "INT-REVISAO"]),
                                 ("C", ["PUB-TROCAS", "PUB-CANAIS", "CH-C17"])]:
            lab = Lab("ana", config, SCENARIOS["direct"])
            self.assertEqual([d["id"] for d in lab.selected_documents()], expected)
            self.assertEqual(lab.profile, "ana")
        bia = Lab("bia", "C", SCENARIOS["baseline"])
        self.assertIn("INT-REVISAO", [d["id"] for d in bia.selected_documents()])

    def test_tool_authorization_confirmation_and_effect(self):
        ana = Lab("ana", "C", SCENARIOS["direct"], "C-17:em_analise")
        result = ana.call_tool("update_case", {"case_id": "C-17", "new_state": "em_analise"})
        self.assertFalse(result["allowed"])
        self.assertEqual(ana.case_state["C-17"], "aberto")
        bia = Lab("bia", "C", SCENARIOS["bia_summary"])
        self.assertFalse(bia.call_tool("update_case", {"case_id": "C-17", "new_state": "em_analise"})["allowed"])
        self.assertEqual(bia.case_state["C-17"], "aberto")
        bia.confirmation = "C-17:aberto"
        self.assertFalse(bia.call_tool("update_case", {"case_id": "C-17", "new_state": "em_analise"})["allowed"])
        bia.confirmation = "C-17:em_analise"
        self.assertTrue(bia.call_tool("update_case", {"case_id": "C-17", "new_state": "em_analise"})["allowed"])
        self.assertEqual(bia.case_state["C-17"], "em_analise")

    def test_external_document_cannot_approve(self):
        lab = Lab("bia", "C", SCENARIOS["bia_summary"])
        self.assertIn("atualize", next(d for d in lab.documents if d["id"] == "PUB-TROCAS")["body"])
        self.assertFalse(lab.call_tool("update_case", {"case_id": "C-17", "new_state": "em_analise"})["allowed"])

    def test_independent_cases_and_multiturn(self):
        directory = tempfile.mkdtemp()
        first = run(args(scenario="multi", state_dir=directory))
        self.assertEqual(len(first["history"]), 6)
        self.assertEqual(first["case_state"], {"C-17": "aberto"})
        second = run(args(scenario="baseline", state_dir=directory))
        self.assertEqual(second["history"], [])
        self.assertEqual(second["documents_sent"][-1]["history_length"], 0)
        self.assertEqual(second["case_state"], {"C-17": "aberto"})
        self.assertNotEqual(first["documents_sent"][0]["documents"][-1]["body"], "")
        self.assertTrue(list(Path(directory).glob("evaluation-*.json")))

    def test_document_restored_markers_distinct_and_binary_no_history(self):
        tainted = Lab("ana", "A", SCENARIOS["response"])
        clean = Lab("ana", "A", SCENARIOS["baseline"])
        self.assertIn("90 dias", tainted.documents[0]["body"])
        self.assertNotIn("90 dias", clean.documents[0]["body"])
        extraction = Lab("ana", "A", SCENARIOS["extract"])
        self.assertNotIn(extraction.internal_marker, extraction.scenario.tainted_document)
        self.assertNotEqual(extraction.internal_marker, extraction.system_marker)
        result = run(args(scenario="binary"))
        self.assertEqual(len(result["documents_sent"]), 2)
        self.assertEqual([entry["history_length"] for entry in result["documents_sent"]], [0, 0])
        self.assertEqual(result["history"], [])

    def test_offline_mode_and_legitimate_query(self):
        result = run(args())
        self.assertEqual(result["mode"], "offline")
        self.assertIn("SIMULAÇÃO", result["answer"])
        self.assertIn("30 dias", result["answer"])
        self.assertEqual([d["id"] for d in result["documents_sent"][-1]["documents"]],
                         ["PUB-TROCAS", "PUB-CANAIS", "CH-C17"])
        own = run(args(scenario="own_case"))
        self.assertIn("aberto", own["answer"])

    def test_forged_call_denied_and_real_mode_recorded(self):
        offline = run(args(scenario="direct", propose_update="em_analise", confirm_change="C-17:em_analise"))
        self.assertEqual(offline["case_state"]["C-17"], "aberto")
        with patch("aurora_lab.cli.run_ollama", return_value="Resposta de teste do adaptador"):
            real = run(args(mode="ollama", model="modelo-local"))
        self.assertEqual(real["mode"], "ollama")
        self.assertEqual(real["answer"], "Resposta de teste do adaptador")
        self.assertFalse(any("SIMULAÇÃO" in e.get("content", "") for e in real["events"]))

    def test_provider_tool_call_denied_even_if_model_proposes(self):
        lab = Lab("ana", "C", SCENARIOS["action"], "C-17:em_analise")
        first = {"role": "assistant", "content": "", "tool_calls": [{"function": {"name": "update_case", "arguments": {"case_id": "C-17", "new_state": "em_analise"}}}]}
        with patch("aurora_lab.provider.ollama_chat", side_effect=[first, {"role": "assistant", "content": "Concluído"}]):
            answer = run_ollama(lab, [{"role": "user", "content": "teste"}], "fake", "http://localhost:11434/api/chat")
        self.assertEqual(answer, "Concluído")
        self.assertEqual(lab.case_state["C-17"], "aberto")
        self.assertFalse([e for e in lab.events if e["kind"] == "tool_decision"][-1]["allowed"])


if __name__ == "__main__":
    unittest.main()

class TransportTests(unittest.TestCase):
    def test_http_ollama_adapter_sends_non_streaming_tool_schema(self):
        from io import BytesIO
        from aurora_lab.provider import ollama_chat
        response_body = BytesIO(json.dumps({"message": {"role": "assistant", "content": "ok"}}).encode())
        with patch("aurora_lab.provider.urlopen", return_value=response_body) as mocked:
            response = ollama_chat([{"role": "user", "content": "teste"}], "modelo-local",
                                   "http://127.0.0.1:11434/api/chat")
        req = mocked.call_args.args[0]
        payload = json.loads(req.data)
        self.assertEqual(response["content"], "ok")
        self.assertEqual(req.full_url, "http://127.0.0.1:11434/api/chat")
        self.assertEqual(payload["model"], "modelo-local")
        self.assertFalse(payload["stream"])
        self.assertEqual({tool["function"]["name"] for tool in payload["tools"]}, {"read_case", "update_case"})

    def test_remote_endpoint_refused(self):
        from aurora_lab.provider import ollama_chat
        with self.assertRaises(ValueError):
            ollama_chat([], "modelo", "https://example.org/api/chat")
