#!/usr/bin/env python3
"""Testes locais sem alterar a configuração publicada."""
import json
import os
import subprocess
import sys
import tempfile
import unittest
from pathlib import Path

ROOT = Path(__file__).resolve().parents[1]
SCRIPT = ROOT / "scripts/atualizar_destinos_qr.py"
CONFIG = ROOT / "config/destinos-qr.json"

class DestinosQRTests(unittest.TestCase):
    def run_case(self, item, destino, url=""):
        with tempfile.TemporaryDirectory() as temp:
            base = Path(temp)
            (base / "config").mkdir()
            (base / "config/destinos-qr.json").write_bytes(CONFIG.read_bytes())
            env = dict(os.environ, QR_ITEM=item, QR_DESTINO=destino, QR_URL=url)
            result = subprocess.run([sys.executable, str(SCRIPT)], cwd=base, env=env, capture_output=True, text=True)
            data = json.loads((base / "config/destinos-qr.json").read_text())
            return result, data

    def test_primeiro_item_sem_alterar_os_demais(self):
        result, data = self.run_case("item01", "audire")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(data["items"]["item01"]["active"], "audire")
        self.assertTrue(all(v["active"] == "original" for k,v in data["items"].items() if k != "item01"))

    def test_reverter_primeiro_item(self):
        result, data = self.run_case("item01", "original")
        self.assertEqual(result.returncode, 0)
        self.assertEqual(data["items"]["item01"]["active"], "original")

    def test_nao_aceita_endereco_inseguro(self):
        result, data = self.run_case("item01", "audire", "http://example.com")
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(data["items"]["item01"]["active"], "audire")

    def test_nao_ativa_itens_sem_url(self):
        result, data = self.run_case("todos", "audire")
        self.assertNotEqual(result.returncode, 0)
        self.assertEqual(data["items"]["item01"]["active"], "audire")
        self.assertTrue(all(v["active"] == "original" for k, v in data["items"].items() if k != "item01"))

    def test_alterar_url_nao_modifica_roteiros_ou_outros_itens(self):
        before = json.loads(CONFIG.read_text(encoding="utf-8"))
        url = "https://audesc-events-api.onrender.com/audire/q/teste-seguro"
        result, after = self.run_case("item01", "audire", url)
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(after["items"]["item01"]["original"], before["items"]["item01"]["original"])
        self.assertEqual(after["items"]["item01"]["audire"], url)
        for key in list(before["items"])[1:]:
            self.assertEqual(after["items"][key], before["items"][key])

    def test_reverter_preserva_endereco_audire_para_uso_futuro(self):
        before = json.loads(CONFIG.read_text(encoding="utf-8"))
        result, after = self.run_case("item01", "original")
        self.assertEqual(result.returncode, 0, result.stderr)
        self.assertEqual(after["items"]["item01"]["audire"], before["items"]["item01"]["audire"])
        self.assertEqual(after["items"]["item01"]["original"], before["items"]["item01"]["original"])

    def test_17_rotas_consultam_item_correto_e_preservam_retorno(self):
        data = json.loads(CONFIG.read_text(encoding="utf-8"))
        self.assertEqual(len(data["items"]), 17)
        for i in range(1, 18):
            item = f"item{i:02d}"
            page = ROOT / "q" / item / "index.html"
            with self.subTest(item=item):
                self.assertTrue(page.is_file(), f"Rota ausente: {page}")
                html = page.read_text(encoding="utf-8")
                self.assertIn(f'c.items["{item}"]', html)
                self.assertIn("config/destinos-qr.json", html)
                self.assertIn("location.replace(fallback)", html)
                self.assertIn(data["items"][item]["original"], html)

if __name__ == "__main__":
    unittest.main()
