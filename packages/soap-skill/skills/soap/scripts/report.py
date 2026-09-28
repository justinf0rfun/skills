#!/usr/bin/env python3
"""Validate SOAP reports and send only to an explicitly enabled collector."""

import argparse
import datetime
import http.client
import json
import os
from pathlib import Path
import re
import sys
import time
import urllib.error
import urllib.parse
import urllib.request
import uuid


SCHEMA = json.loads((Path(__file__).resolve().parents[1] / 'references' / 'report.schema.json').read_text())


def validate(value, rule=SCHEMA, location='$'):
    """Check the keywords used by our bundled schema; reject unsupported ones."""
    # ponytail: supports this schema's subset only; use a full validator if the contract needs more keywords.
    supported = {'$schema', '$defs', 'title', '$ref', 'oneOf', 'type', 'properties',
                 'required', 'additionalProperties', 'items', 'minItems', 'minLength',
                 'enum', 'const', 'format'}
    if set(rule) - supported:
        raise ValueError('Unsupported schema keyword')
    if '$ref' in rule:
        return validate(value, SCHEMA['$defs'][rule['$ref'].removeprefix('#/$defs/')], location)
    if 'oneOf' in rule:
        matches = 0
        for option in rule['oneOf']:
            try:
                validate(value, option, location)
                matches += 1
            except ValueError:
                pass
        if matches != 1:
            raise ValueError(f'{location}: expected exactly one allowed shape')
        return
    if 'const' in rule and value != rule['const']:
        raise ValueError(f'{location}: unexpected constant')
    if 'enum' in rule and value not in rule['enum']:
        raise ValueError(f'{location}: unknown enum value')
    types = {'object': dict, 'array': list, 'string': str, 'null': type(None)}
    allowed = rule.get('type', [])
    allowed = [allowed] if isinstance(allowed, str) else allowed
    if allowed and type(value) not in [types[kind] for kind in allowed]:
        raise ValueError(f'{location}: invalid type')
    if isinstance(value, dict):
        properties = rule.get('properties', {})
        if set(rule.get('required', [])) - value.keys():
            raise ValueError(f'{location}: missing required fields')
        if rule.get('additionalProperties') is False and value.keys() - properties.keys():
            raise ValueError(f'{location}: unknown fields')
        for key, item in value.items():
            validate(item, properties[key], f'{location}.{key}')
    if isinstance(value, list):
        if len(value) < rule.get('minItems', 0):
            raise ValueError(f'{location}: too few items')
        for index, item in enumerate(value):
            validate(item, rule['items'], f'{location}[{index}]')
    if isinstance(value, str):
        if len(value) < rule.get('minLength', 0):
            raise ValueError(f'{location}: empty string')
        if rule.get('format') == 'uuid':
            if not re.fullmatch(r'[0-9a-fA-F]{8}(?:-[0-9a-fA-F]{4}){3}-[0-9a-fA-F]{12}', value):
                raise ValueError(f'{location}: expected a UUID')
            uuid.UUID(value)
        if rule.get('format') == 'date-time':
            if not re.fullmatch(r'\d{4}-\d{2}-\d{2}[Tt](?:[01]\d|2[0-3]):[0-5]\d:(?:[0-5]\d|60)(?:\.\d+)?(?:[Zz]|[+-](?:[01]\d|2[0-3]):[0-5]\d)', value, flags=re.ASCII):
                raise ValueError(f'{location}: expected a timestamp with timezone')
            normalized = value.upper().replace('Z', '+00:00')
            leap = normalized[17:19] == '60'
            # Validate calendar/offset separately from fractions (Python 3.9 only parses 3/6 digits).
            calendar_value = normalized[:17] + ('59' if leap else normalized[17:19]) + normalized[-6:]
            try:
                moment = datetime.datetime.fromisoformat(calendar_value)
                if leap:
                    utc = moment.astimezone(datetime.timezone.utc)
                    if (utc.hour, utc.minute) != (23, 59) or (utc + datetime.timedelta(seconds=1)).day != 1:
                        raise ValueError()
            except (ValueError, OverflowError):
                raise ValueError(f'{location}: invalid calendar timestamp or leap-second position') from None



def unique(values, label):
    if len(values) != len(set(values)):
        raise ValueError(f'Duplicate {label}')


def reject_duplicates(pairs):
    result = {}
    for key, value in pairs:
        if key in result:
            raise ValueError('Duplicate JSON object key')
        result[key] = value
    return result


def read_report(path):
    raw = Path(path).read_bytes()
    report = json.loads(raw.decode('utf-8'), object_pairs_hook=reject_duplicates)
    validate(report)
    unique([finding['id'] for finding in report['findings']], 'finding ID')
    unique([item['id'] for finding in report['findings'] for item in finding['recommendations']], 'recommendation ID')
    for finding in report['findings']:
        unique([item['code'] for item in finding['dimensions']], 'dimension code')
    return raw, report


class NoRedirect(urllib.request.HTTPRedirectHandler):
    def redirect_request(self, req, fp, code, msg, headers, newurl):
        return None


def send(raw, report):
    if os.environ.get('SOAP_REPORTING') != '1':
        print('Reporting disabled. The local report was retained.')
        return 0
    endpoint = os.environ.get('SOAP_ENDPOINT', '')
    try:
        if any(character.isspace() for character in endpoint):
            raise ValueError()
        url = urllib.parse.urlsplit(endpoint)
        valid = (url.scheme == 'https' or
                 (url.scheme == 'http' and url.hostname in {'localhost', '127.0.0.1', '::1'}))
        if not valid or not url.hostname or url.username or url.password or url.query or url.fragment:
            raise ValueError()
        url.port
    except ValueError:
        raise ValueError('Set SOAP_ENDPOINT to an HTTPS collector URL without credentials, query, or fragment (HTTP loopback is allowed)') from None
    request = urllib.request.Request(endpoint, data=raw, method='POST', headers={
        'Content-Type': 'application/json', 'Idempotency-Key': report['report_id'],
    })
    opener = urllib.request.build_opener(NoRedirect)
    for attempt in range(3):
        try:
            with opener.open(request, timeout=5) as response:
                if not 200 <= response.status < 300:
                    print('Upload failed: collector did not accept the report. The local report was retained.')
                    return 1
            print(f"Uploaded report {report['report_id']} (attempt {attempt + 1}).")
            return 0
        except urllib.error.HTTPError as error:
            status = error.code
            error.close()
            retry = status in {408, 429} or 500 <= status < 600
            reason = f'HTTP {status}'
        except (urllib.error.URLError, OSError, http.client.HTTPException):
            retry, reason = True, 'network failure'
        if not retry or attempt == 2:
            print(f'Upload failed: {reason}. The local report was retained; retry the same file later.')
            return 1
        time.sleep(2 ** attempt)


def main():
    parser = argparse.ArgumentParser(description=__doc__)
    parser.add_argument('command', choices=['validate', 'send'])
    parser.add_argument('report', help='Path to a saved SOAP JSON report')
    args = parser.parse_args()
    try:
        raw, report = read_report(args.report)
        if args.command == 'send':
            return send(raw, report)
        print('Valid SOAP report.')
        return 0
    except (ValueError, OSError, RecursionError) as error:
        # Do not echo payload values, endpoint credentials, or absolute input paths.
        message = str(error) if isinstance(error, ValueError) and not isinstance(error, (json.JSONDecodeError, UnicodeError)) else 'Cannot read a valid JSON report'
        print(f'Report error: {message}', file=sys.stderr)
        return 2


if __name__ == '__main__':
    sys.exit(main())
