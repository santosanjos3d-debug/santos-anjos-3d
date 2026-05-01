import { createConnection } from 'mysql2/promise';
import { readFileSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Carregar .env manualmente
try {
  const envPath = resolve(__dirname, '../.env');
  const envContent = readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const [key, ...vals] = line.split('=');
    if (key && vals.length) {
      process.env[key.trim()] = vals.join('=').trim();
    }
  }
} catch (e) {
  // .env pode não existir, usar variáveis do ambiente
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL não definida');
  process.exit(1);
}

const conn = await createConnection(DATABASE_URL);

try {
  await conn.execute('ALTER TABLE products ADD COLUMN details TEXT NULL AFTER description');
  console.log('✅ Coluna details adicionada com sucesso!');
} catch (e) {
  if (e.code === 'ER_DUP_FIELDNAME') {
    console.log('ℹ️ Coluna details já existe');
  } else {
    console.error('❌ Erro:', e.message);
  }
}

await conn.end();
