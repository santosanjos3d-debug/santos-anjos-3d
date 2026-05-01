import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";

/**
 * Core user table backing auth flow.
 */
export const users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull(),
});

export type User = typeof users.$inferSelect;
export type InsertUser = typeof users.$inferInsert;

/**
 * Produtos disponíveis para venda
 * Inclui dimensões e peso para cálculo de frete, variações de tamanho e cor
 */
export const products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  details: text("details"),
  category: varchar("category", { length: 100 }),

  // Imagem principal
  image: varchar("image", { length: 512 }),

  // Preço base (menor tamanho)
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),

  // Dimensões para cálculo de frete (em cm)
  widthCm: decimal("widthCm", { precision: 6, scale: 2 }),
  heightCm: decimal("heightCm", { precision: 6, scale: 2 }),
  lengthCm: decimal("lengthCm", { precision: 6, scale: 2 }),

  // Peso para cálculo de frete (em gramas)
  weightGrams: int("weightGrams"),

  // Variações de tamanho e cor em JSON
  // sizes: [{size: 'P', label: 'Pequeno (144mm)', price: '39.47'}]
  sizes: text("sizes"),
  // colors: [{name: 'Branco', value: 'white', image: '/images/...'}]
  colors: text("colors"),

  // Controle
  active: int("active").default(1).notNull(), // 1=ativo, 0=inativo
  sortOrder: int("sortOrder").default(0),

  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Product = typeof products.$inferSelect;
export type InsertProduct = typeof products.$inferInsert;

/**
 * Pedidos realizados pelos clientes
 * Inclui endereço completo para geração de etiqueta via Melhor Envio
 */
export const orders = mysqlTable("orders", {
  id: int("id").autoincrement().primaryKey(),
  orderNumber: varchar("orderNumber", { length: 32 }).notNull().unique(),

  // Colunas legadas (mantidas para compatibilidade)
  productId: int("productId"),
  quantity: int("quantity").default(1),
  pixKey: varchar("pixKey", { length: 255 }),

  // Dados do cliente
  customerName: varchar("customerName", { length: 255 }).notNull(),
  customerEmail: varchar("customerEmail", { length: 320 }),
  customerPhone: varchar("customerPhone", { length: 20 }),
  customerDocument: varchar("customerDocument", { length: 20 }), // CPF/CNPJ

  // Endereço completo para etiqueta
  addressPostalCode: varchar("addressPostalCode", { length: 9 }),
  addressStreet: varchar("addressStreet", { length: 255 }),
  addressNumber: varchar("addressNumber", { length: 20 }),
  addressComplement: varchar("addressComplement", { length: 100 }),
  addressDistrict: varchar("addressDistrict", { length: 100 }),
  addressCity: varchar("addressCity", { length: 100 }),
  addressState: varchar("addressState", { length: 2 }),

  // Frete escolhido
  shippingServiceId: int("shippingServiceId"),       // ID do serviço no Melhor Envio (ex: 2=SEDEX, 3=Jadlog)
  shippingServiceName: varchar("shippingServiceName", { length: 100 }), // Nome exibido
  shippingCompany: varchar("shippingCompany", { length: 100 }),

  // Valores
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  shippingCost: decimal("shippingCost", { precision: 10, scale: 2 }).default("0"),
  totalPrice: decimal("totalPrice", { precision: 10, scale: 2 }).notNull(),

  // Resumo dos itens (JSON serializado)
  itemsSummary: text("itemsSummary"), // JSON: [{name, size, color, qty, price}]

  // Status do pedido
  status: mysqlEnum("status", ["pending", "paid", "processing", "shipped", "completed", "cancelled"]).default("pending").notNull(),

  // Integração Melhor Envio
  melhorEnvioOrderId: varchar("melhorEnvioOrderId", { length: 100 }), // ID do envio no ME
  melhorEnvioProtocol: varchar("melhorEnvioProtocol", { length: 100 }), // Protocolo após compra
  trackingCode: varchar("trackingCode", { length: 50 }),  // Código de rastreio
  labelUrl: text("labelUrl"),  // URL da etiqueta PDF gerada

  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
});

export type Order = typeof orders.$inferSelect;
export type InsertOrder = typeof orders.$inferInsert;

/**
 * Tabela de fretes por região (fallback)
 */
export const shippingRates = mysqlTable("shippingRates", {
  id: int("id").autoincrement().primaryKey(),
  region: varchar("region", { length: 50 }).notNull().unique(),
  cepStart: varchar("cepStart", { length: 5 }).notNull(),
  cepEnd: varchar("cepEnd", { length: 5 }).notNull(),
  rate100g: decimal("rate100g", { precision: 10, scale: 2 }).notNull(),
  rate200g: decimal("rate200g", { precision: 10, scale: 2 }).notNull(),
  prazo: varchar("prazo", { length: 50 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
});

export type ShippingRate = typeof shippingRates.$inferSelect;
export type InsertShippingRate = typeof shippingRates.$inferInsert;
