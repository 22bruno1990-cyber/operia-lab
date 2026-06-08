#!/usr/bin/env python3
import json
import os
import urllib.error
import urllib.request
from http.server import SimpleHTTPRequestHandler, ThreadingHTTPServer


PORT = int(os.environ.get("PORT", "8025"))
OPENAI_MODEL = os.environ.get("OPENAI_MODEL", "gpt-4.1-mini")


REPORT_SCHEMA = {
    "type": "object",
    "additionalProperties": False,
    "required": [
        "title",
        "technical",
        "category",
        "severity",
        "deadline",
        "costMin",
        "costMax",
        "pro",
        "crew",
        "duration",
        "actions",
        "materials",
        "scope",
        "checks",
    ],
    "properties": {
        "title": {"type": "string"},
        "technical": {"type": "string"},
        "category": {
            "type": "string",
            "enum": ["hidraulica", "eletrica", "civil", "climatizacao", "limpeza", "seguranca"],
        },
        "severity": {"type": "string", "enum": ["Media", "Alta", "Critica"]},
        "deadline": {"type": "string"},
        "costMin": {"type": "integer"},
        "costMax": {"type": "integer"},
        "pro": {"type": "string"},
        "crew": {"type": "string"},
        "duration": {"type": "string"},
        "actions": {"type": "array", "minItems": 3, "maxItems": 5, "items": {"type": "string"}},
        "materials": {"type": "array", "minItems": 4, "maxItems": 8, "items": {"type": "string"}},
        "scope": {"type": "array", "minItems": 4, "maxItems": 7, "items": {"type": "string"}},
        "checks": {"type": "array", "minItems": 4, "maxItems": 7, "items": {"type": "string"}},
    },
}


def send_json(handler, status, payload):
    body = json.dumps(payload, ensure_ascii=True).encode("utf-8")
    handler.send_response(status)
    handler.send_header("Content-Type", "application/json; charset=utf-8")
    handler.send_header("Content-Length", str(len(body)))
    handler.end_headers()
    handler.wfile.write(body)


def normalize_cost(report):
    report["costMin"] = int(report.get("costMin") or 0)
    report["costMax"] = int(report.get("costMax") or report["costMin"] or 0)
    report["cost"] = f"R$ {report['costMin']:,} - R$ {report['costMax']:,}".replace(",", ".")
    return report


def call_openai(payload):
    api_key = os.environ.get("OPENAI_API_KEY")
    if not api_key:
        raise RuntimeError("OPENAI_API_KEY ausente. Configure a chave para usar análise visual real.")

    images = payload.get("images", [])[:5]
    content = [
        {
            "type": "input_text",
            "text": (
                "Você é um assistente de manutenção predial para zeladores. "
                "Analise as fotos e a descrição como pré-laudo cautelar, não como laudo técnico definitivo. "
                "Liste problemas prováveis, materiais, escopo, mão de obra, prazo e custo médio em BRL. "
                "O campo deadline deve ser sempre uma janela operacional em português, como 'Imediato', '24h a 48h', "
                "'2 a 5 dias úteis' ou '7 a 15 dias'. Nunca retorne uma data de calendário nem anos. "
                "Se não houver evidência visual suficiente, seja conservador e indique validação profissional. "
                "Data atual de referência: 07/06/2026. "
                f"Local: {payload.get('location') or 'não informado'}. "
                f"Categoria informada: {payload.get('category') or 'auto'}. "
                f"Urgência percebida: {payload.get('urgency') or 'normal'}. "
                f"Descrição do zelador: {payload.get('description') or 'sem descrição'}."
            ),
        }
    ]

    for item in images:
        data_url = item.get("dataUrl")
        if data_url:
            content.append({"type": "input_image", "image_url": data_url, "detail": "high"})

    request_payload = {
        "model": OPENAI_MODEL,
        "input": [{"role": "user", "content": content}],
        "text": {
            "format": {
                "type": "json_schema",
                "name": "zelador_ia_pre_laudo",
                "schema": REPORT_SCHEMA,
                "strict": True,
            }
        },
    }

    req = urllib.request.Request(
        "https://api.openai.com/v1/responses",
        data=json.dumps(request_payload).encode("utf-8"),
        headers={
            "Authorization": f"Bearer {api_key}",
            "Content-Type": "application/json",
        },
        method="POST",
    )

    try:
        with urllib.request.urlopen(req, timeout=60) as response:
            response_payload = json.loads(response.read().decode("utf-8"))
    except urllib.error.HTTPError as exc:
        detail = exc.read().decode("utf-8", errors="replace")
        if exc.code == 401:
            raise RuntimeError("API key inválida ou revogada. Crie uma nova chave na OpenAI Platform e reinicie o servidor.") from exc
        if exc.code == 400 and "valid image" in detail:
            raise RuntimeError("Imagem em formato inválido para análise. Envie JPG, PNG, GIF ou WEBP, ou tente tirar a foto novamente.") from exc
        if exc.code == 429:
            raise RuntimeError("Limite ou crédito da API indisponível. Verifique billing/credits na OpenAI Platform.") from exc
        raise RuntimeError(f"Erro da OpenAI ({exc.code}): {detail}") from exc

    text = response_payload.get("output_text")
    if not text:
        for output in response_payload.get("output", []):
            for part in output.get("content", []):
                if part.get("type") in ("output_text", "text") and part.get("text"):
                    text = part["text"]
                    break
            if text:
                break

    if not text:
        raise RuntimeError("A API não retornou texto estruturado.")

    return normalize_cost(json.loads(text))


class Handler(SimpleHTTPRequestHandler):
    def do_POST(self):
        if self.path != "/api/analyze":
            send_json(self, 404, {"error": "not_found"})
            return

        length = int(self.headers.get("Content-Length", "0"))
        try:
            payload = json.loads(self.rfile.read(length).decode("utf-8"))
            report = call_openai(payload)
            send_json(self, 200, {"source": "openai", "report": report})
        except Exception as exc:
            send_json(self, 503, {"source": "fallback", "error": str(exc)})


if __name__ == "__main__":
    server = ThreadingHTTPServer(("127.0.0.1", PORT), Handler)
    print(f"Zelador.ia em http://127.0.0.1:{PORT}")
    server.serve_forever()
