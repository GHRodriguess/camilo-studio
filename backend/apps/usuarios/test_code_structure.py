"""
Testes estruturais e de integridade de código do Backend — Studio Marilia Camilo.

Garante:
1. Limite máximo de linhas por arquivo Python (300 linhas).
2. Limite máximo de linhas por função/método (50 linhas).
3. Ausência de chamadas print() residuais em código de produção (deve usar logging).
4. Limite de parâmetros por função (máximo de 6).
5. Convenção de nomenclatura de arquivos em snake_case.
"""

import ast
import os
import re
from django.test import SimpleTestCase

MAX_FILE_LINES = 300
MAX_FUNCTION_LINES = 50
MAX_FUNCTION_PARAMS = 6

ALLOWLIST_FILES = set()


class CodeStructureTests(SimpleTestCase):
    @classmethod
    def setUpClass(cls):
        super().setUpClass()
        cls.backend_root = os.path.abspath(os.path.join(os.path.dirname(__file__), '..', '..'))
        cls.python_files = []

        for root, dirs, files in os.walk(cls.backend_root):
            dirs[:] = [d for d in dirs if d not in ('.git', 'venv', '__pycache__', 'migrations')]
            for f in files:
                if f.endswith('.py') and f != 'manage.py':
                    full_path = os.path.join(root, f)
                    rel_path = os.path.relpath(full_path, cls.backend_root)
                    cls.python_files.append((rel_path, full_path))

    def test_max_file_lines(self):
        """Verifica se nenhum arquivo Python ultrapassa o limite máximo de linhas (exceto allowlist)."""
        oversized_files = []
        for rel_path, full_path in self.python_files:
            if rel_path in ALLOWLIST_FILES:
                continue
            with open(full_path, 'r', encoding='utf-8') as fp:
                lines = fp.read().strip().splitlines()
                if len(lines) > MAX_FILE_LINES:
                    oversized_files.append(
                        f"{rel_path}: {len(lines)} linhas (máx permitido: {MAX_FILE_LINES})"
                    )

        self.assertEqual(
            len(oversized_files),
            0,
            "Arquivos excederam o limite de linhas:\n" + "\n".join(oversized_files)
        )

    def test_max_function_lines(self):
        """Verifica se nenhuma função ou método ultrapassa o limite máximo de linhas (exceto allowlist)."""
        oversized_functions = []
        for rel_path, full_path in self.python_files:
            if rel_path in ALLOWLIST_FILES:
                continue
            with open(full_path, 'r', encoding='utf-8') as fp:
                content = fp.read()
            try:
                tree = ast.parse(content, filename=rel_path)
            except SyntaxError as e:
                self.fail(f"Erro de sintaxe em {rel_path}: {e}")

            for node in ast.walk(tree):
                if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                    start = node.lineno
                    end = getattr(node, 'end_lineno', start)
                    func_lines = end - start + 1
                    if func_lines > MAX_FUNCTION_LINES:
                        oversized_functions.append(
                            f"{rel_path}:{node.name} (L{start}-L{end}): {func_lines} linhas (máx: {MAX_FUNCTION_LINES})"
                        )

        self.assertEqual(
            len(oversized_functions),
            0,
            "Funções excederam o limite de linhas:\n" + "\n".join(oversized_functions)
        )

    def test_no_production_prints(self):
        """Garante que não há chamadas print() residuais em código de produção das apps."""
        print_calls = []
        for rel_path, full_path in self.python_files:
            if not rel_path.startswith('apps/'):
                continue
            if 'seed_data.py' in rel_path:
                continue

            with open(full_path, 'r', encoding='utf-8') as fp:
                content = fp.read()
            try:
                tree = ast.parse(content, filename=rel_path)
            except SyntaxError:
                continue

            for node in ast.walk(tree):
                if isinstance(node, ast.Call) and isinstance(node.func, ast.Name) and node.func.id == 'print':
                    print_calls.append(f"{rel_path}:{node.lineno}")

        self.assertEqual(
            len(print_calls),
            0,
            "Chamadas print() encontradas (use logging):\n" + "\n".join(print_calls)
        )

    def test_max_function_parameters(self):
        """Garante que funções não recebam um número excessivo de parâmetros soltos."""
        excessive_args = []
        for rel_path, full_path in self.python_files:
            with open(full_path, 'r', encoding='utf-8') as fp:
                content = fp.read()
            try:
                tree = ast.parse(content, filename=rel_path)
            except SyntaxError:
                continue

            for node in ast.walk(tree):
                if isinstance(node, (ast.FunctionDef, ast.AsyncFunctionDef)):
                    # Desconsidera self e cls
                    args = [a.arg for a in node.args.args if a.arg not in ('self', 'cls')]
                    if len(args) > MAX_FUNCTION_PARAMS:
                        excessive_args.append(
                            f"{rel_path}:{node.name} (L{node.lineno}) possui {len(args)} parâmetros (máx: {MAX_FUNCTION_PARAMS})"
                        )

        self.assertEqual(
            len(excessive_args),
            0,
            "Funções com muitos parâmetros (agrupe em DTO ou classe):\n" + "\n".join(excessive_args)
        )

    def test_python_file_naming_snake_case(self):
        """Garante que todos os arquivos Python dentro de apps/ sigam a convenção snake_case."""
        invalid_names = []
        for rel_path, _ in self.python_files:
            if not rel_path.startswith('apps/'):
                continue
            filename = os.path.basename(rel_path)
            name_without_ext = filename[:-3]
            if not re.match(r'^[a-z0-9_]+$', name_without_ext):
                invalid_names.append(f"{rel_path} (esperado snake_case)")

        self.assertEqual(
            len(invalid_names),
            0,
            "Arquivos com nomenclatura fora do padrão:\n" + "\n".join(invalid_names)
        )
