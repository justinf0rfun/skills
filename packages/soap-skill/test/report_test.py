"""Run with Python's standard library; no network requests leave this process."""

import contextlib
from copy import deepcopy
import importlib.util
import io
import json
import os
from pathlib import Path
import tempfile
import urllib.error
from unittest.mock import patch


ROOT = Path(__file__).resolve().parents[3]
SKILL = ROOT / 'skills' / 'soap'
spec = importlib.util.spec_from_file_location('soap_report', SKILL / 'scripts' / 'report.py')
module = importlib.util.module_from_spec(spec)
spec.loader.exec_module(module)

report = {
    'schema_version': '2.0',
    'report_id': 'c13f9f0c-a2eb-48d6-9fa1-38419c40be70',
    'created_at': '2026-09-28T14:30:00+00:00',
    'task': {'id': None, 'title': 'Order deduplication', 'scope': 'Design through verification'},
    'context': {'repository': None, 'branch': None, 'agent': 'Codex'},
    'coverage': {'status': 'complete', 'limitations': []},
    'summary': 'An agreed design constraint was omitted during implementation.',
    'findings': [{
        'id': 'F1',
        'dimensions': [{'code': 'implementation_verification', 'detail': None}],
        'observation': 'The first implementation created duplicate orders.',
        'evidence': [{'summary': 'The user required request deduplication during design; the first implementation omitted it.', 'source': 'Design agreement and first implementation correction'}],
        'cause': {'status': 'supported', 'explanation': 'The constraint was available before coding but was not carried into the implementation.'},
        'impact': 'The user repeated the requirement and the implementation was revised.',
        'recommendations': [{'id': 'R1', 'change': 'Add a repeated-request regression check using the same request key.', 'target': 'Order creation tests', 'applicability': 'Order creation accepts a caller-provided request key.', 'verification': 'Repeating the request creates exactly one order.'}],
    }],
    'practices': [],
}


def rejected(value, path):
    path.write_text(json.dumps(value))
    try:
        module.read_report(path)
    except ValueError:
        return
    raise AssertionError('Invalid report was accepted')


class Response:
    status = 204

    def __enter__(self):
        return self

    def __exit__(self, *args):
        pass


with tempfile.TemporaryDirectory() as folder:
    path = Path(folder) / 'report.json'
    path.write_text(json.dumps(report))
    raw, parsed = module.read_report(path)
    assert parsed == report
    empty = deepcopy(report)
    empty['findings'] = []
    empty['summary'] = 'No evidenced avoidable friction.'
    path.write_text(json.dumps(empty))
    module.read_report(path)
    partial = deepcopy(empty)
    partial['coverage'] = {'status': 'insufficient', 'limitations': ['Only a compacted summary remains.']}
    path.write_text(json.dumps(partial))
    module.read_report(path)
    partial['coverage']['limitations'] = []
    rejected(partial, path)
    for key, value in [('ratings', {}), ('schema_version', '1.0'), ('report_id', '../unsafe'), ('created_at', '2026-09-28T14:30:00')]:
        invalid = deepcopy(report)
        invalid[key] = value
        rejected(invalid, path)
    invalid = deepcopy(report)
    del invalid['task']['id']
    rejected(invalid, path)
    invalid = deepcopy(report)
    invalid['findings'][0]['evidence'] = []
    rejected(invalid, path)
    invalid = deepcopy(report)
    invalid['findings'] *= 2
    rejected(invalid, path)
    invalid = deepcopy(report)
    invalid['findings'][0]['dimensions'] = [{'code': 'other', 'detail': None}]
    rejected(invalid, path)
    invalid['findings'][0]['dimensions'][0]['detail'] = 'A documented process boundary not covered by the standard lenses.'
    path.write_text(json.dumps(invalid))
    module.read_report(path)
    path.write_text('{"schema_version":"2.0","schema_version":"2.0"}')
    try:
        module.read_report(path)
        raise AssertionError('Duplicate JSON keys accepted')
    except ValueError:
        pass

    for encoding in ['utf-16', 'utf-32', 'utf-8-sig']:
        path.write_bytes(json.dumps(report).encode(encoding))
        with patch.object(module.urllib.request, 'build_opener') as opener:
            try:
                module.read_report(path)
                raise AssertionError('Non-UTF-8 JSON accepted')
            except ValueError:
                pass
            opener.assert_not_called()
    leap = deepcopy(report)
    leap['created_at'] = '2016-12-31T23:59:60Z'
    path.write_text(json.dumps(leap))
    module.read_report(path)
    for fraction in ['1', '12', '123', '1234', '12345', '123456', '1234567']:
        fractional = deepcopy(report)
        fractional['created_at'] = f'2026-09-28T14:30:00.{fraction}Z'
        path.write_text(json.dumps(fractional))
        module.read_report(path)
    leap['created_at'] = '2017-01-01T00:59:60+01:00'
    path.write_text(json.dumps(leap))
    module.read_report(path)
    for timestamp in ['2026-09-28T14:30:00.١Z', '2026-02-30T14:30:00Z', '2026-09-28T14:30:60Z', '2016-12-30T23:59:60Z']:
        invalid = deepcopy(report)
        invalid['created_at'] = timestamp
        path.write_text(json.dumps(invalid))
        errors = io.StringIO()
        with patch.object(module.sys, 'argv', ['report.py', 'validate', str(path)]), contextlib.redirect_stderr(errors):
            assert module.main() == 2
        assert timestamp not in errors.getvalue()
        assert str(path) not in errors.getvalue()
    path.write_text('[' * 2000 + '0' + ']' * 2000)
    errors = io.StringIO()
    with patch.object(module.sys, 'argv', ['report.py', 'send', str(path)]), contextlib.redirect_stderr(errors), patch.object(module.urllib.request, 'build_opener') as opener:
        assert module.main() == 2
        opener.assert_not_called()
    assert 'Traceback' not in errors.getvalue()
    assert str(path) not in errors.getvalue()
    path.write_bytes(raw)
    with patch.dict(os.environ, {}, clear=True), patch.object(module.urllib.request, 'build_opener') as opener:
        assert module.send(raw, report) == 0
        opener.assert_not_called()
    with patch.dict(os.environ, {'SOAP_ENDPOINT': 'https://collector.example.com/events'}, clear=True), patch.object(module.urllib.request, 'build_opener') as opener:
        assert module.send(raw, report) == 0
        opener.assert_not_called()
    for endpoint in ['', 'http://collector.example.com/events', 'file:///tmp/report', 'https://user:secret@example.com/events', 'https://example.com/events?token=secret']:
        with patch.dict(os.environ, {'SOAP_REPORTING': '1', 'SOAP_ENDPOINT': endpoint}, clear=True), patch.object(module.urllib.request, 'build_opener') as opener:
            try:
                module.send(raw, report)
                raise AssertionError('Unsafe or missing endpoint accepted')
            except ValueError:
                pass
            opener.assert_not_called()
    with patch.dict(os.environ, {'SOAP_REPORTING': '1', 'SOAP_ENDPOINT': 'https://collector.example.com/events'}, clear=True), patch.object(module.urllib.request, 'build_opener') as builder, patch.object(module.time, 'sleep') as sleep:
        opener = builder.return_value
        opener.open.side_effect = [urllib.error.URLError('offline'), urllib.error.HTTPError('https://example.com', 503, '', {}, io.BytesIO()), Response()]
        assert module.send(raw, report) == 0
        assert opener.open.call_count == 3
        assert [call.args[0] for call in sleep.call_args_list] == [1, 2]
        for call in opener.open.call_args_list:
            assert call.kwargs['timeout'] == 5
            request = call.args[0]
            assert request.data == raw
            assert request.get_header('Idempotency-key') == report['report_id']
        for status, attempts in [(400, 1), (302, 1), (429, 3), (500, 3)]:
            opener.open.reset_mock()
            opener.open.side_effect = lambda *args, **kwargs: (_ for _ in ()).throw(urllib.error.HTTPError('https://example.com', status, '', {}, io.BytesIO()))
            assert module.send(raw, report) == 1
            assert opener.open.call_count == attempts
    assert path.read_bytes() == raw
    assert module.NoRedirect().redirect_request(None, None, 302, '', {}, 'https://other.example.com') is None

print('SOAP report checks passed: contract, evidence gaps, opt-in, retry identity, failures, and payload preservation.')
