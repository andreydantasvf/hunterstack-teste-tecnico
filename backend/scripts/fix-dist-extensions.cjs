// scripts/fix-dist-extensions.js
const fs = require('fs');
const path = require('path');

function processFile(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');

  // Adiciona .js para imports/exports relativos sem extensão.
  // Cobre: import ... from '...'; export ... from '...';
  content = content.replace(
    /(\b(?:from|import)\s+|export\s+.*\s+from\s+)(['"])(\.{1,2}\/[^'"]+?)(['"])/g,
    (_, pfx, q1, rel, q2) => {
      // se já tem extensão comum, não altera
      if (/\.[tj]s(x)?$/.test(rel) || /\.json$/.test(rel))
        return `${pfx}${q1}${rel}${q2}`;
      return `${pfx}${q1}${rel}.js${q2}`;
    }
  );

  // Também cobre dynamic import('...') sem extensão
  content = content.replace(
    /(\bimport\()\s*(['"])(\.{1,2}\/[^'"]+?)(['"])\s*(\))/g,
    (_, p0, q1, rel, q2, p1) => {
      if (/\.[tj]s(x)?$/.test(rel) || /\.json$/.test(rel))
        return `${p0}${q1}${rel}${q2}${p1}`;
      return `${p0}${q1}${rel}.js${q2}${p1}`;
    }
  );

  fs.writeFileSync(filePath, content, 'utf8');
}

function walk(dir) {
  for (const name of fs.readdirSync(dir)) {
    const full = path.join(dir, name);
    if (fs.statSync(full).isDirectory()) walk(full);
    else if (full.endsWith('.js')) processFile(full);
  }
}

const dist = path.join(__dirname, '..', 'dist');
if (!fs.existsSync(dist)) {
  console.error('Pasta dist/ não encontrada. Rode tsc antes.');
  process.exit(1);
}
walk(dist);
console.log(
  'Corrigidos imports no dist (adicionadas extensões .js onde aplicável).'
);
