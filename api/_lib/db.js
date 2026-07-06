// Helper compartilhado para conexão com banco de dados MySQL
import mysql from 'mysql2/promise';

let pool = null;
let migrationRun = false;

export function getDb() {
  if (!pool) {
    pool = mysql.createPool({
      uri: process.env.DATABASE_URL,
      waitForConnections: true,
      connectionLimit: 5,
      queueLimit: 0,
    });
  }
  return pool;
}

export async function query(sql, params = []) {
  const db = getDb();
  const [rows] = await db.execute(sql, params);
  return rows;
}

// Migration automática: adiciona colunas de pagamento se não existirem
export async function runMigration() {
  if (migrationRun) return;
  migrationRun = true;

  const db = getDb();

  const migrations = [
    `ALTER TABLE orders ADD COLUMN IF NOT EXISTS paymentMethod ENUM('pix', 'card') DEFAULT NULL`,
    `ALTER TABLE orders ADD COLUMN IF NOT EXISTS paymentId VARCHAR(255) DEFAULT NULL`,
    `ALTER TABLE orders ADD COLUMN IF NOT EXISTS paymentStatus ENUM('pending', 'approved', 'rejected', 'expired', 'refunded') DEFAULT NULL`,
    `ALTER TABLE orders ADD COLUMN IF NOT EXISTS pixQrCodeBase64 TEXT DEFAULT NULL`,
    `ALTER TABLE orders ADD COLUMN IF NOT EXISTS pixCopyPaste TEXT DEFAULT NULL`,
    `ALTER TABLE orders ADD COLUMN IF NOT EXISTS cardBrand VARCHAR(32) DEFAULT NULL`,
    `ALTER TABLE orders ADD COLUMN IF NOT EXISTS cardInstallments INT DEFAULT NULL`,
    `ALTER TABLE orders ADD COLUMN IF NOT EXISTS mercadopagoPaymentId VARCHAR(255) DEFAULT NULL`,
  ];

  for (const sql of migrations) {
    try {
      await db.execute(sql);
    } catch (err) {
      // Ignorar erro se coluna já existe (alteração de tabela)
      if (!err.message?.includes('Duplicate column')) {
        console.warn('[Migration] Warning:', err.message);
      }
    }
  }

  console.log('[Migration] Payment columns migration completed');
}

export function cors(res) {
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST,PUT,DELETE,PATCH');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Cookie');
}
