import { eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { InsertUser, users, products, orders, InsertOrder, shippingRates, InsertShippingRate, InsertProduct } from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

// Lazily create the drizzle instance so local tooling can run without a DB.
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
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
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

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// Product queries
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

// Order queries
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
  return await db.select().from(orders);
}

export async function updateOrderStatus(id: number, status: string) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(orders).set({ status: status as any }).where(eq(orders.id, id));
}

// Shipping rate queries
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
  if (existingProducts.length > 0) return; // Already initialized

  const productsToInsert: InsertProduct[] = [
    {
      name: "Nossa Senhora de Lourdes",
      description: "Estatueta de Nossa Senhora de Lourdes em resina branca com acabamento fino. Perfeita para devoção e decoração.",
      price: "150.00",
      image: "/images/nossa-senhora-lourdes.jpg",
    },
    {
      name: "Sagrado Coração de Maria",
      description: "Representação do Sagrado Coração de Maria com detalhes delicados. Símbolo de amor e proteção maternal.",
      price: "150.00",
      image: "/images/sagrado-coracao-maria.jpg",
    },
    {
      name: "Santa Hildegarda de Bingen",
      description: "Santa Hildegarda, mística e estudiosa, com livro em mãos. Padroeira dos intelectuais e cientistas.",
      price: "140.00",
      image: "/images/santa-hildegarda.jpg",
    },
    {
      name: "São Francisco de Assis",
      description: "São Francisco em sua veste característica. Padroeiro da natureza e dos animais, símbolo de paz e simplicidade.",
      price: "140.00",
      image: "/images/sao-francisco.jpg",
    },
    {
      name: "São José com Menino Jesus",
      description: "São José protetor com o Menino Jesus nos braços. Representa a paternidade, proteção e amor familiar.",
      price: "160.00",
      image: "/images/sao-jose.jpg",
    },
  ];

  try {
    await db.insert(products).values(productsToInsert);
    console.log("[Database] Products initialized successfully");
  } catch (error) {
    console.error("[Database] Failed to initialize products:", error);
  }
}
