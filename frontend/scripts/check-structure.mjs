#!/usr/bin/env node

/**
 * Validador de Estrutura de Arquivos e Código — Studio Marilia Camilo (Frontend)
 * 
 * Regras estritas (sem exceções ou baselines legadas):
 * 1. Tamanho máximo de arquivo (linhas de código)
 * 2. Tamanho máximo de função / componente (linhas de código)
 * 3. Validação de Design Tokens (proibição de cores hardcoded - lint:tokens)
 * 4. Fronteiras de Atomic Design (hierarquia de importações)
 * 5. Proibição de console.log e debugger residuais
 * 6. Convenção de nomenclatura de componentes (PascalCase)
 */

import fs from 'node:fs';
import path from 'node:path';
import ts from 'typescript';

// --- LIMITES CONFIGURADOS ---
const LIMITS = {
  // Tamanho máximo de arquivos (linhas totais)
  MAX_FILE_LINES_COMPONENT: 300,
  MAX_FILE_LINES_PAGE: 400,
  MAX_FILE_LINES_LIB: 350,

  // Tamanho máximo de funções (linhas)
  MAX_FUNCTION_LINES_HELPER: 50,
  MAX_FUNCTION_LINES_COMPONENT: 100,
};

const errors = [];

function walkDir(dir) {
  let files = [];
  const entries = fs.readdirSync(dir, { withFileTypes: true });
  for (const entry of entries) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      if (!['node_modules', '.next', '.git', 'public', 'scripts'].includes(entry.name)) {
        files = files.concat(walkDir(fullPath));
      }
    } else if (/\.(tsx|ts)$/.test(entry.name) && !entry.name.endsWith('.d.ts')) {
      files.push(fullPath);
    }
  }
  return files;
}

const rootDir = process.cwd();
const files = walkDir(rootDir);

for (const filePath of files) {
  const relPath = path.relative(rootDir, filePath).replace(/\\/g, '/');
  const content = fs.readFileSync(filePath, 'utf8');
  const lines = content.trimEnd().split('\n');
  const lineCount = lines.length;

  // 1. TAMANHO MÁXIMO DE ARQUIVOS (SEM EXCEÇÕES)
  let maxAllowedLines = LIMITS.MAX_FILE_LINES_COMPONENT;
  if (relPath.startsWith('app/') && relPath.endsWith('page.tsx')) {
    maxAllowedLines = LIMITS.MAX_FILE_LINES_PAGE;
  } else if (relPath.startsWith('lib/')) {
    maxAllowedLines = LIMITS.MAX_FILE_LINES_LIB;
  }

  if (lineCount > maxAllowedLines) {
    errors.push(
      `[Tamanho de Arquivo] ${relPath} tem ${lineCount} linhas (máximo permitido: ${maxAllowedLines})`
    );
  }

  // 2. PARSING AST PARA FUNÇÕES (SEM EXCEÇÕES)
  const sourceFile = ts.createSourceFile(filePath, content, ts.ScriptTarget.Latest, true);

  function checkNode(node) {
    if (
      ts.isFunctionDeclaration(node) ||
      ts.isFunctionExpression(node) ||
      ts.isArrowFunction(node) ||
      ts.isMethodDeclaration(node)
    ) {
      const start = sourceFile.getLineAndCharacterOfPosition(node.getStart(sourceFile)).line + 1;
      const end = sourceFile.getLineAndCharacterOfPosition(node.getEnd()).line + 1;
      const funcLines = end - start + 1;

      let funcName = 'anonymous';
      if (node.name && ts.isIdentifier(node.name)) {
        funcName = node.name.getText(sourceFile);
      } else if (ts.isVariableDeclaration(node.parent) && node.parent.name) {
        funcName = node.parent.name.getText(sourceFile);
      }

      const isComponent = /^[A-Z]/.test(funcName);
      const maxFuncLines = isComponent
        ? LIMITS.MAX_FUNCTION_LINES_COMPONENT
        : LIMITS.MAX_FUNCTION_LINES_HELPER;

      if (funcLines > maxFuncLines) {
        errors.push(
          `[Tamanho de Função] ${relPath} -> ${funcName} (L${start}-L${end}): ${funcLines} linhas (máximo permitido: ${maxFuncLines})`
        );
      }
    }
    ts.forEachChild(node, checkNode);
  }

  checkNode(sourceFile);

  // 3. ATOMIC DESIGN (FRONTEIRAS DE IMPORTAÇÃO)
  if (relPath.startsWith('components/atoms/')) {
    if (/from\s+['"][^'"]*(molecules|organisms|templates)/.test(content)) {
      errors.push(
        `[Atomic Design] Átomo viola hierarquia importando molécula/organismo/template: ${relPath}`
      );
    }
  } else if (relPath.startsWith('components/molecules/')) {
    if (/from\s+['"][^'"]*(organisms|templates)/.test(content)) {
      errors.push(
        `[Atomic Design] Molécula viola hierarquia importando organismo/template: ${relPath}`
      );
    }
  } else if (relPath.startsWith('components/organisms/')) {
    if (/from\s+['"][^'"]*(templates)/.test(content)) {
      errors.push(
        `[Atomic Design] Organismo viola hierarquia importando template: ${relPath}`
      );
    }
  }

  // 4. DESIGN TOKENS (PROIBIÇÃO DE CORES HARDCODED - lint:tokens)
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('/*')) return;
    const match = line.match(/(bg|text|border|fill|stroke)-\[(#[0-9a-fA-F]{3,8}|rgb[^\]]+|hsl[^\]]+)\]/);
    if (match) {
      errors.push(
        `[Design Tokens] Cor hardcoded '${match[0]}' em ${relPath}:${idx + 1}. Use tokens semânticos de globals.css.`
      );
    }
  });

  // 5. PROIBIÇÃO DE CONSOLE.LOG E DEBUGGER
  lines.forEach((line, idx) => {
    const trimmed = line.trim();
    if (trimmed.startsWith('//') || trimmed.startsWith('/*')) return;
    if (/\bconsole\.log\(/.test(line)) {
      errors.push(
        `[Boas Práticas] Chamada de console.log residual encontrada em ${relPath}:${idx + 1}`
      );
    }
    if (/\bdebugger;?/.test(line)) {
      errors.push(
        `[Boas Práticas] Declaração debugger encontrada em ${relPath}:${idx + 1}`
      );
    }
  });

  // 6. NOMENCLATURA DE COMPONENTES
  if (relPath.startsWith('components/atoms/') || relPath.startsWith('components/molecules/') || relPath.startsWith('components/organisms/')) {
    const basename = path.basename(relPath);
    if (!/^[A-Z][a-zA-Z0-9]*\.(tsx|ts)$/.test(basename)) {
      errors.push(
        `[Nomenclatura] Componente em ${relPath} deve usar PascalCase (ex: NomeComponente.tsx)`
      );
    }
  }
}

// RELATÓRIO
console.log('\n🔍 Verificação Estrutural do Frontend (Studio Marilia Camilo)');
console.log(`📁 Arquivos escaneados: ${files.length}`);

if (errors.length > 0) {
  console.error(`\n❌ Falhas estruturais encontradas (${errors.length}):`);
  errors.forEach(e => console.error(`   ${e}`));
  console.error('\n🚫 O build ou commit não pode prosseguir até que as regras estruturais sejam satisfeitas.\n');
  process.exit(1);
} else {
  console.log('✅ Todos os testes de estrutura de arquivos, funções e tokens passaram com sucesso!\n');
  process.exit(0);
}
