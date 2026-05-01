import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, products, orders, InsertOrder, shippingRates, InsertShippingRate, InsertProduct } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot upsert user: database not available"); return; }

  try {
    const values: InsertUser = { openId: user.openId };
    const updateSet: Record<string, unknown> = {};
    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];
    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== undefined) { values.lastSignedIn = user.lastSignedIn; updateSet.lastSignedIn = user.lastSignedIn; }
    if (user.role !== undefined) { values.role = user.role; updateSet.role = user.role; }
    else if (user.openId === ENV.ownerOpenId) { values.role = 'admin'; updateSet.role = 'admin'; }
    if (!values.lastSignedIn) values.lastSignedIn = new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) { console.warn("[Database] Cannot get user: database not available"); return undefined; }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

// ─── Products ────────────────────────────────────────────────────────────────

export async function getAllProducts() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(products);
}

export async function getProductById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createProduct(data: InsertProduct) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.insert(products).values(data);
}

export async function updateProduct(id: number, data: Partial<InsertProduct>) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.update(products).set({ ...data, updatedAt: new Date() } as any).where(eq(products.id, id));
}

export async function deleteProduct(id: number) {
  const db = await getDb();
  if (!db) throw new Error('Database not available');
  await db.delete(products).where(eq(products.id, id));
}

// ─── Orders ──────────────────────────────────────────────────────────────────

export async function createOrder(order: InsertOrder) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(orders).values(order);
  return result;
}

export async function getOrderByNumber(orderNumber: string) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getOrderById(id: number) {
  const db = await getDb();
  if (!db) return undefined;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function getAllOrders() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(orders).orderBy(desc(orders.createdAt));
}

export async function updateOrderStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(orders).set({ status: status as any }).where(eq(orders.id, id));
}

export async function deleteOrder(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(orders).where(eq(orders.id, id));
}

export async function updateOrderLabelInfo(id: number, data: {
  melhorEnvioOrderId?: string;
  melhorEnvioProtocol?: string;
  trackingCode?: string;
  labelUrl?: string;
  status?: string;
}) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateSet: Record<string, unknown> = {};
  if (data.melhorEnvioOrderId !== undefined) updateSet.melhorEnvioOrderId = data.melhorEnvioOrderId;
  if (data.melhorEnvioProtocol !== undefined) updateSet.melhorEnvioProtocol = data.melhorEnvioProtocol;
  if (data.trackingCode !== undefined) updateSet.trackingCode = data.trackingCode;
  if (data.labelUrl !== undefined) updateSet.labelUrl = data.labelUrl;
  if (data.status !== undefined) updateSet.status = data.status;
  return await db.update(orders).set(updateSet as any).where(eq(orders.id, id));
}

// ─── Shipping Rates ───────────────────────────────────────────────────────────

export async function initializeShippingRates() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const rates: InsertShippingRate[] = [
    { region: "Sul", cepStart: "80000", cepEnd: "89999", rate100g: "18.00", rate200g: "22.00", prazo: "8-10 dias" },
    { region: "Sudeste", cepStart: "01000", cepEnd: "28999", rate100g: "22.00", rate200g: "28.00", prazo: "6-8 dias" },
    { region: "Centro-Oeste", cepStart: "50000", cepEnd: "72999", rate100g: "25.00", rate200g: "32.00", prazo: "10-12 dias" },
    { region: "Nordeste", cepStart: "40000", cepEnd: "48999", rate100g: "28.00", rate200g: "36.00", prazo: "12-15 dias" },
    { region: "Norte", cepStart: "60000", cepEnd: "69999", rate100g: "35.00", rate200g: "45.00", prazo: "15-20 dias" },
  ];
  for (const rate of rates) {
    try {
      await db.insert(shippingRates).values(rate).onDuplicateKeyUpdate({
        set: { rate100g: rate.rate100g, rate200g: rate.rate200g, prazo: rate.prazo },
      });
    } catch (error) {
      console.warn(`[Database] Failed to insert shipping rate for ${rate.region}:`, error);
    }
  }
}

export async function calculateShippingCost(cep: string, weight: number): Promise<{ cost: string; region: string; prazo: string } | null> {
  const db = await getDb();
  if (!db) return null;
  const cepNumber = parseInt(cep.replace(/\D/g, ''), 10);
  const result = await db.select().from(shippingRates);
  for (const rate of result) {
    const start = parseInt(rate.cepStart, 10);
    const end = parseInt(rate.cepEnd, 10);
    if (cepNumber >= start && cepNumber <= end) {
      const cost = weight <= 100 ? rate.rate100g : rate.rate200g;
      return { cost: cost.toString(), region: rate.region, prazo: rate.prazo };
    }
  }
  return null;
}

export async function initializeProducts() {
  const db = await getDb();
  if (!db) return;
  const existingProducts = await db.select().from(products);
  if (existingProducts.length > 0) return;
  const productsToInsert: InsertProduct[] = [
    { name: "Nossa Senhora de Lourdes", description: "Estatueta de Nossa Senhora de Lourdes em resina branca com acabamento fino.", price: "150.00", image: "/images/nossa-senhora-lourdes.jpg" },
    { name: "Sagrado Coração de Maria", description: "Representação do Sagrado Coração de Maria com detalhes delicados.", price: "150.00", image: "/images/sagrado-coracao-maria.jpg" },
    { name: "Santa Hildegarda de Bingen", description: "Santa Hildegarda, mística e estudiosa, com livro em mãos.", price: "140.00", image: "/images/santa-hildegarda.jpg" },
    { name: "São Francisco de Assis", description: "São Francisco em sua veste característica. Padroeiro da natureza e dos animais.", price: "140.00", image: "/images/sao-francisco.jpg" },
    { name: "São José com Menino Jesus", description: "São José protetor com o Menino Jesus nos braços.", price: "160.00", image: "/images/sao-jose.jpg" },
  ];
  try {
    await db.insert(products).values(productsToInsert);
    console.log("[Database] Products initialized successfully");
  } catch (error) {
    console.error("[Database] Failed to initialize products:", error);
  }
}
