#!/usr/bin/env python3
"""Atualiza destinos dos QR Codes com validação; usado pelo GitHub Actions."""
import json
import os
from pathlib import Path
from urllib.parse import urlsplit

path = Path("config/destinos-qr.json")
data = json.loads(path.read_text(encoding="utf-8"))
items = data["items"]
item = os.environ["QR_ITEM"]
dest = os.environ["QR_DESTINO"]
url = os.environ.get("QR_URL", "").strip()
if item != "todos" and item not in items:
    raise SystemExit("Item inválido")
if dest not in ("original", "audire"):
    raise SystemExit("Destino inválido")
if url:
    p = urlsplit(url)
    if p.scheme != "https" or not p.hostname or p.username or p.password or any(c in url for c in "\r\n\t"):
        raise SystemExit("O endereço deve ser HTTPS válido, sem credenciais")
if item == "todos" and url:
    raise SystemExit("Não informe URL ao selecionar todos")
targets = list(items) if item == "todos" else [item]
for key in targets:
    obj = items[key]
    if item != "todos" and url:
        obj["audire"] = url
    if dest == "audire":
        address = obj["audire"].strip()
        p = urlsplit(address)
        if p.scheme != "https" or not p.hostname or p.username or p.password:
            raise SystemExit(f"URL do Audire não cadastrada ou inválida para {key}")
for key in targets:
    items[key]["active"] = dest
path.write_text(json.dumps(data, ensure_ascii=False, indent=2) + "\n", encoding="utf-8")
print(f"Atualizados {len(targets)} itens para {dest}.")
