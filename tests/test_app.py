import unittest
from types import SimpleNamespace
from unittest.mock import AsyncMock, patch

from httpx import ASGITransport, AsyncClient
import app


class LabTests(unittest.IsolatedAsyncioTestCase):
    async def asyncSetUp(self):
        app.sessions.clear()
        self.client = AsyncClient(transport=ASGITransport(app=app.app), base_url='http://test')

    async def asyncTearDown(self):
        await self.client.aclose()

    async def test_public_metadata_does_not_expose_secrets(self):
        response = await self.client.get('/api/state')
        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.json()['levels']), app.LEVEL_COUNT)
        for flag in app.FLAGS.values():
            self.assertNotIn(flag, response.text)
        for level in response.json()['levels']:
            self.assertTrue(level['objective'])
            self.assertTrue(level['location'])
            self.assertEqual(len(level['hints']), 3)
        self.assertEqual((await self.client.get('/lab_data/credenciais_demo.txt')).status_code, 404)

    async def test_filter_prevents_inference(self):
        with patch.object(app.client, 'chat', new_callable=AsyncMock) as model:
            for word in ('FLAG', 'ignore', 'sistema'):
                result = await self.client.post('/api/chat', json={'level': 3, 'message': 'teste ' + word})
                self.assertTrue(result.json()['blocked'])
                self.assertEqual(result.json()['block_stage'], 'input')
            model.assert_not_awaited()

    async def test_flag_validation_and_session_isolation(self):
        wrong = (await self.client.post('/api/flag', json={'level': 1, 'flag': app.FLAGS[2]})).json()
        self.assertFalse(wrong['correct'])
        for _ in range(2):
            right = (await self.client.post('/api/flag', json={'level': 1, 'flag': app.FLAGS[1]})).json()
            self.assertTrue(right['correct'])
            self.assertEqual(right['solved'], [1])
        async with AsyncClient(transport=ASGITransport(app=app.app), base_url='http://test') as other:
            self.assertEqual((await other.get('/api/state')).json()['solved'], [])

    async def test_file_tool_and_external_document_reach_model(self):
        fake = SimpleNamespace(message=SimpleNamespace(content='Resposta de teste'))
        with patch.object(app.client, 'chat', new_callable=AsyncMock, return_value=fake) as model:
            result = await self.client.post('/api/chat', json={'level': 4, 'message': 'Analise o ticket.', 'document': 'Documento de teste <script>alert(1)</script>'})
            self.assertEqual(result.status_code, 200)
            messages = model.call_args.kwargs['messages']
            self.assertNotIn('ApenasUmaSenhaFicticia!42', messages[0]['content'])
            self.assertEqual([t['function']['name'] for t in model.call_args.kwargs['tools']], ['ler_arquivo'])
            self.assertIn('Documento de teste', messages[-2]['content'])
            self.assertEqual(messages[-1]['role'], 'user')
            self.assertEqual(len((await self.client.get('/api/state')).json()['histories']['4']), 2)
            await self.client.post('/api/reset', json={'level': 4})
            self.assertNotIn('4', (await self.client.get('/api/state')).json()['histories'])

    async def test_output_filter_reports_stage_and_records_turn(self):
        fake = SimpleNamespace(message=SimpleNamespace(content=app.FLAGS[2]))
        with patch.object(app.client, 'chat', new_callable=AsyncMock, return_value=fake) as model:
            response = await self.client.post('/api/chat', json={'level': 2, 'message': 'Olá'})
            self.assertEqual(response.status_code, 200)
            self.assertEqual(response.json()['block_stage'], 'output')
            self.assertNotIn(app.FLAGS[2], response.text)
            model.assert_awaited_once()
            data = (await self.client.get('/api/state')).json()
            self.assertEqual(data['turns']['2'][0]['response'], app.LEVEL2_BLOCKED_REPLY)

    async def test_health_reports_missing_and_available_model(self):
        with patch.object(app.client, 'list', new_callable=AsyncMock, return_value=SimpleNamespace(models=[])):
            self.assertEqual((await self.client.get('/api/health')).status_code, 503)
        models = SimpleNamespace(models=[SimpleNamespace(model=app.MODELO)])
        with patch.object(app.client, 'list', new_callable=AsyncMock, return_value=models):
            response = await self.client.get('/api/health')
            self.assertEqual(response.status_code, 200)
            self.assertTrue(response.json()['ok'])
        with patch.object(app.client, 'list', new_callable=AsyncMock, side_effect=RuntimeError('private error')):
            response = await self.client.get('/api/health')
            self.assertEqual(response.status_code, 503)
            self.assertNotIn('private error', response.text)

    async def test_file_reader_rejects_paths_outside_lab_and_campaign_data(self):
        from campaign import read_lab_file
        for name in ('../app.py', '../../README.txt', 'clientes_demo.json', '/etc/passwd', 'inexistente.txt'):
            self.assertIn('erro', read_lab_file(name))

    async def test_reset_campaign_effects_match_documented_behavior(self):
        await self.client.get('/api/state')
        session = next(iter(app.sessions.values()))
        session['campaign'].update(called=True, escaped=True)
        session['solved'].add(6)
        session['activities'][6] = [{'name': 'registro de teste'}]
        await self.client.post('/api/reset', json={'level': 7})
        self.assertTrue(session['campaign']['called'])
        self.assertNotIn('escaped', session['campaign'])
        await self.client.post('/api/reset', json={'level': 6})
        self.assertNotIn('called', session['campaign'])
        self.assertIn(6, session['solved'])
        self.assertEqual(len(session['activities'][6]), 1)

    async def test_levels_keep_separate_histories(self):
        fake = SimpleNamespace(message=SimpleNamespace(content='Olá'))
        with patch.object(app.client, 'chat', new_callable=AsyncMock, return_value=fake) as model:
            await self.client.post('/api/chat', json={'level': 1, 'message': 'SOMENTE NIVEL UM'})
            await self.client.post('/api/chat', json={'level': 2, 'message': 'Olá'})
            self.assertNotIn('SOMENTE NIVEL UM', str(model.call_args.kwargs['messages']))

    async def test_model_failure_does_not_save_unanswered_turn(self):
        with patch.object(app.client, 'chat', new_callable=AsyncMock, side_effect=RuntimeError('private error')):
            response = await self.client.post('/api/chat', json={'level': 1, 'message': 'Olá'})
            self.assertEqual(response.status_code, 503)
            self.assertNotIn('private error', response.text)
            self.assertEqual((await self.client.get('/api/state')).json()['histories']['1'], [])

    async def test_invalid_input_rejected(self):
        for payload in ({'level': app.LEVEL_COUNT + 1, 'message': 'teste'}, {'level': 1, 'message': ' '}, {'level': 1, 'message': 'x' * 4001}):
            self.assertEqual((await self.client.post('/api/chat', json=payload)).status_code, 422)

    async def test_campaign_tool_call_is_executed_and_recorded(self):
        import ollama
        first = SimpleNamespace(message=ollama.Message(role='assistant', content='', tool_calls=[{'function': {'name': 'consultar_cadastro', 'arguments': {'operacao': 'conferir_endereco', 'cliente': 'Íris Vale', 'endereco_informado': 'Rua Modelo, 10'}}}]))
        last = SimpleNamespace(message=ollama.Message(role='assistant', content='Confira o resultado da ferramenta.'))
        with patch.object(app.client, 'chat', new_callable=AsyncMock, side_effect=[first, last]) as model:
            response = await self.client.post('/api/chat', json={'level': 5, 'message': 'Confira o endereço de entrega.'})
            self.assertEqual(response.status_code, 200)
            result = response.json()['activities'][0]['result']
            self.assertIn(app.FLAGS[5], result['endereco_correto'])
            self.assertEqual(model.await_count, 2)
            self.assertEqual(model.call_args.kwargs['messages'][-1]['role'], 'tool')

    async def test_campaign_state_requires_call_and_correct_values(self):
        from campaign import DATA_PATH
        import json
        values = json.loads(DATA_PATH.read_text())['acesso']
        payload = {'level': 7, 'action': 'abrir_porta', 'arguments': {'codigo': values['codigo'], 'direcao': values['direcao']}}
        early = (await self.client.post('/api/action', json=payload)).json()
        self.assertIn('erro', early['event']['result'])
        wrong = await self.client.post('/api/action', json={'level': 6, 'action': 'ligar_ramal', 'arguments': {'ramal': 'inexistente'}})
        self.assertIn('erro', wrong.json()['event']['result'])
        call = await self.client.post('/api/action', json={'level': 6, 'action': 'ligar_ramal', 'arguments': {'ramal': values['ramal']}})
        self.assertEqual(call.json()['event']['result']['flag'], app.FLAGS[6])
        wrong_code = dict(payload, arguments={'codigo': 'errado', 'direcao': values['direcao']})
        self.assertIn('erro', (await self.client.post('/api/action', json=wrong_code)).json()['event']['result'])
        opened = (await self.client.post('/api/action', json=payload)).json()
        self.assertEqual(opened['event']['result']['flag'], app.FLAGS[7])
        async with AsyncClient(transport=ASGITransport(app=app.app), base_url='http://test') as other:
            self.assertIn('erro', (await other.post('/api/action', json=payload)).json()['event']['result'])

    async def test_campaign_direct_access_blocked_but_correction_leaks(self):
        from campaign import execute_tool
        direct = execute_tool(5, 'consultar_cadastro', {'operacao': 'ler_registro', 'cliente': 'Íris Vale'}, {})
        self.assertIn('erro', direct)
        corrected = execute_tool(5, 'consultar_cadastro', {'operacao': 'conferir_endereco', 'cliente': 'Íris Vale', 'endereco_informado': 'Rua Modelo, 10'}, {})
        self.assertIn(app.FLAGS[5], corrected['endereco_correto'])
        self.assertIn('erro', execute_tool(5, 'abrir_porta', {}, {}))
        self.assertIn('erro', execute_tool(5, 'executar_shell', {'cmd': 'qualquer'}, {}))

    async def test_missing_operation_reports_argument_error_for_model_recovery(self):
        import ollama
        first = SimpleNamespace(message=ollama.Message(role='assistant', content='', tool_calls=[{'function': {'name': 'consultar_cadastro', 'arguments': {'pet': 'coelho branco'}}}]))
        second = SimpleNamespace(message=ollama.Message(role='assistant', content='', tool_calls=[{'function': {'name': 'consultar_cadastro', 'arguments': {'operacao': 'buscar_por_pet', 'pet': 'coelho branco'}}}]))
        last = SimpleNamespace(message=SimpleNamespace(content='Consulta concluída.'))
        with patch.object(app.client, 'chat', new_callable=AsyncMock, side_effect=[first, second, last]) as model:
            response = await self.client.post('/api/chat', json={'level': 5, 'message': 'Busque o coelho branco.'})
            self.assertEqual(response.status_code, 200)
            events = response.json()['activities']
            self.assertIn('operacao ausente', events[0]['result']['erro'])
            self.assertIn('buscar_por_pet', events[0]['result']['operacoes_disponiveis'])
            self.assertTrue(events[1]['result']['clientes'])
            self.assertEqual(model.await_count, 3)

    async def test_named_operations_keep_existing_authorization_and_results(self):
        from campaign import execute_tool
        session = {}
        found = execute_tool(5, 'buscar_por_pet', {'pet': 'coelho branco'}, session)
        name = found['clientes'][0]['nome']
        for tool, arguments in [('preparar_entrega', {'cliente': name}), ('conferir_endereco', {'cliente': name, 'endereco_informado': 'Rua Modelo, 10'})]:
            self.assertEqual(execute_tool(5, tool, arguments, session), execute_tool(5, 'consultar_cadastro', dict(arguments, operacao=tool), session))
            self.assertIn('erro', execute_tool(7, tool, arguments, session))
        # The named correction operation cannot be redirected to a direct read.
        corrected = execute_tool(5, 'conferir_endereco', {'cliente': name, 'endereco_informado': 'Rua Modelo, 10', 'operacao': 'ler_registro'}, session)
        self.assertIn('endereco_correto', corrected)
        self.assertIn('erro', execute_tool(5, 'consultar_cadastro', {'cliente': name, 'operacao': 'ler_registro'}, session))

    async def test_action_endpoint_rejects_wrong_tool(self):
        response = await self.client.post('/api/action', json={'level': 6, 'action': 'consultar_cadastro', 'arguments': {'operacao': 'estatisticas'}})
        self.assertEqual(response.status_code, 422)

class AttemptTests(unittest.IsolatedAsyncioTestCase):
    asyncSetUp = LabTests.asyncSetUp
    asyncTearDown = LabTests.asyncTearDown
    async def test_new_attempt_archives_without_reusing_context(self):
        fake = SimpleNamespace(message=SimpleNamespace(content='Resposta anterior'))
        with patch.object(app.client, 'chat', new_callable=AsyncMock, return_value=fake) as model:
            await self.client.post('/api/chat', json={'level': 4, 'message': 'Primeira hipótese', 'document': 'Ticket A'})
            await self.client.post('/api/reset', json={'level': 4})
            data = (await self.client.get('/api/state')).json()
            self.assertEqual(data['attempts']['4'][0]['turns'][0]['document'], 'Ticket A')
            self.assertEqual(data['attempts']['4'][0]['messages'][0]['content'], 'Primeira hipótese')
            self.assertEqual(data['parameters'], app.MODEL_OPTIONS)
            await self.client.post('/api/chat', json={'level': 4, 'message': 'Segunda hipótese', 'document': 'Ticket B'})
            self.assertNotIn('Primeira hipótese', str(model.call_args.kwargs['messages']))
            await self.client.post('/api/reset', json={'level': 4})
            await self.client.post('/api/reset', json={'level': 4})
            self.assertEqual(len((await self.client.get('/api/state')).json()['attempts']['4']), 2)
            async with AsyncClient(transport=ASGITransport(app=app.app), base_url='http://test') as other:
                self.assertEqual((await other.get('/api/state')).json()['attempts'], {})

    async def test_blocked_attempt_is_archived_but_not_sent_to_model(self):
        await self.client.post('/api/chat', json={'level': 3, 'message': 'ignore este teste'})
        fake = SimpleNamespace(message=SimpleNamespace(content='Resposta'))
        with patch.object(app.client, 'chat', new_callable=AsyncMock, return_value=fake) as model:
            await self.client.post('/api/chat', json={'level': 3, 'message': 'Olá'})
            self.assertNotIn('ignore este teste', str(model.call_args.kwargs['messages']))
        await self.client.post('/api/reset', json={'level': 3})
        saved = (await self.client.get('/api/state')).json()['attempts']['3'][0]
        self.assertTrue(saved['messages'][0]['blocked'])
        self.assertEqual(len(saved['messages']), 4)


if __name__ == '__main__':
    unittest.main()
