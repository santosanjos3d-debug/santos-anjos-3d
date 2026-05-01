import { createConnection } from 'mysql2/promise';
import { readFileSync, existsSync } from 'fs';
import { resolve, dirname } from 'path';
import { fileURLToPath } from 'url';

const __dirname = dirname(fileURLToPath(import.meta.url));

// Carregar .env manualmente se existir
const envPath = resolve(__dirname, '../.env');
if (existsSync(envPath)) {
  const envContent = readFileSync(envPath, 'utf8');
  for (const line of envContent.split('\n')) {
    const [key, ...vals] = line.split('=');
    if (key && vals.length) {
      process.env[key.trim()] = vals.join('=').trim();
    }
  }
}

const DATABASE_URL = process.env.DATABASE_URL;
if (!DATABASE_URL) {
  console.error('DATABASE_URL não definida');
  process.exit(1);
}

const conn = await createConnection(DATABASE_URL);
const [rows] = await conn.execute('DESCRIBE products');
console.log('Colunas da tabela products:');
console.log(rows.map(r => r.Field).join(', '));
await conn.end();
