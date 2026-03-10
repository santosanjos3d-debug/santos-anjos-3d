// server/_core/index.ts
import "dotenv/config";
import express2 from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";

// shared/const.ts
var COOKIE_NAME = "app_session_id";
var ONE_YEAR_MS = 1e3 * 60 * 60 * 24 * 365;
var AXIOS_TIMEOUT_MS = 3e4;
var UNAUTHED_ERR_MSG = "Please login (10001)";
var NOT_ADMIN_ERR_MSG = "You do not have required permission (10002)";

// server/db.ts
import { desc, eq } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";

// drizzle/schema.ts
import { decimal, int, mysqlEnum, mysqlTable, text, timestamp, varchar } from "drizzle-orm/mysql-core";
var users = mysqlTable("users", {
  id: int("id").autoincrement().primaryKey(),
  openId: varchar("openId", { length: 64 }).notNull().unique(),
  name: text("name"),
  email: varchar("email", { length: 320 }),
  loginMethod: varchar("loginMethod", { length: 64 }),
  role: mysqlEnum("role", ["user", "admin"]).default("user").notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull(),
  lastSignedIn: timestamp("lastSignedIn").defaultNow().notNull()
});
var products = mysqlTable("products", {
  id: int("id").autoincrement().primaryKey(),
  name: varchar("name", { length: 255 }).notNull(),
  description: text("description"),
  price: decimal("price", { precision: 10, scale: 2 }).notNull(),
  image: varchar("image", { length: 512 }),
  category: varchar("category", { length: 100 }),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var orders = mysqlTable("orders", {
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
  customerDocument: varchar("customerDocument", { length: 20 }),
  // CPF/CNPJ
  // Endereço completo para etiqueta
  addressPostalCode: varchar("addressPostalCode", { length: 9 }),
  addressStreet: varchar("addressStreet", { length: 255 }),
  addressNumber: varchar("addressNumber", { length: 20 }),
  addressComplement: varchar("addressComplement", { length: 100 }),
  addressDistrict: varchar("addressDistrict", { length: 100 }),
  addressCity: varchar("addressCity", { length: 100 }),
  addressState: varchar("addressState", { length: 2 }),
  // Frete escolhido
  shippingServiceId: int("shippingServiceId"),
  // ID do serviço no Melhor Envio (ex: 2=SEDEX, 3=Jadlog)
  shippingServiceName: varchar("shippingServiceName", { length: 100 }),
  // Nome exibido
  shippingCompany: varchar("shippingCompany", { length: 100 }),
  // Valores
  subtotal: decimal("subtotal", { precision: 10, scale: 2 }).notNull(),
  shippingCost: decimal("shippingCost", { precision: 10, scale: 2 }).default("0"),
  totalPrice: decimal("totalPrice", { precision: 10, scale: 2 }).notNull(),
  // Resumo dos itens (JSON serializado)
  itemsSummary: text("itemsSummary"),
  // JSON: [{name, size, color, qty, price}]
  // Status do pedido
  status: mysqlEnum("status", ["pending", "paid", "processing", "shipped", "completed", "cancelled"]).default("pending").notNull(),
  // Integração Melhor Envio
  melhorEnvioOrderId: varchar("melhorEnvioOrderId", { length: 100 }),
  // ID do envio no ME
  melhorEnvioProtocol: varchar("melhorEnvioProtocol", { length: 100 }),
  // Protocolo após compra
  trackingCode: varchar("trackingCode", { length: 50 }),
  // Código de rastreio
  labelUrl: text("labelUrl"),
  // URL da etiqueta PDF gerada
  notes: text("notes"),
  createdAt: timestamp("createdAt").defaultNow().notNull(),
  updatedAt: timestamp("updatedAt").defaultNow().onUpdateNow().notNull()
});
var shippingRates = mysqlTable("shippingRates", {
  id: int("id").autoincrement().primaryKey(),
  region: varchar("region", { length: 50 }).notNull().unique(),
  cepStart: varchar("cepStart", { length: 5 }).notNull(),
  cepEnd: varchar("cepEnd", { length: 5 }).notNull(),
  rate100g: decimal("rate100g", { precision: 10, scale: 2 }).notNull(),
  rate200g: decimal("rate200g", { precision: 10, scale: 2 }).notNull(),
  prazo: varchar("prazo", { length: 50 }).notNull(),
  createdAt: timestamp("createdAt").defaultNow().notNull()
});

// server/_core/env.ts
var ENV = {
  appId: process.env.VITE_APP_ID ?? "",
  cookieSecret: process.env.JWT_SECRET ?? "",
  databaseUrl: process.env.DATABASE_URL ?? "",
  oAuthServerUrl: process.env.OAUTH_SERVER_URL ?? "",
  ownerOpenId: process.env.OWNER_OPEN_ID ?? "",
  isProduction: process.env.NODE_ENV === "production",
  forgeApiUrl: process.env.BUILT_IN_FORGE_API_URL ?? "",
  forgeApiKey: process.env.BUILT_IN_FORGE_API_KEY ?? "",
  adminEmail: process.env.ADMIN_EMAIL ?? "",
  adminPasswordHash: process.env.ADMIN_PASSWORD_HASH ?? ""
};

// server/db.ts
var _db = null;
async function getDb() {
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
async function upsertUser(user) {
  if (!user.openId) throw new Error("User openId is required for upsert");
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }
  try {
    const values = { openId: user.openId };
    const updateSet = {};
    const textFields = ["name", "email", "loginMethod"];
    const assignNullable = (field) => {
      const value = user[field];
      if (value === void 0) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };
    textFields.forEach(assignNullable);
    if (user.lastSignedIn !== void 0) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== void 0) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = "admin";
      updateSet.role = "admin";
    }
    if (!values.lastSignedIn) values.lastSignedIn = /* @__PURE__ */ new Date();
    if (Object.keys(updateSet).length === 0) updateSet.lastSignedIn = /* @__PURE__ */ new Date();
    await db.insert(users).values(values).onDuplicateKeyUpdate({ set: updateSet });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}
async function getUserByOpenId(openId) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return void 0;
  }
  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getAllProducts() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(products);
}
async function getProductById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(products).where(eq(products.id, id)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function createOrder(order) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const result = await db.insert(orders).values(order);
  return result;
}
async function getOrderByNumber(orderNumber) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(orders).where(eq(orders.orderNumber, orderNumber)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getOrderById(id) {
  const db = await getDb();
  if (!db) return void 0;
  const result = await db.select().from(orders).where(eq(orders.id, id)).limit(1);
  return result.length > 0 ? result[0] : void 0;
}
async function getAllOrders() {
  const db = await getDb();
  if (!db) return [];
  return await db.select().from(orders).orderBy(desc(orders.createdAt));
}
async function updateOrderStatus(id, status) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.update(orders).set({ status }).where(eq(orders.id, id));
}
async function deleteOrder(id) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  return await db.delete(orders).where(eq(orders.id, id));
}
async function updateOrderLabelInfo(id, data) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const updateSet = {};
  if (data.melhorEnvioOrderId !== void 0) updateSet.melhorEnvioOrderId = data.melhorEnvioOrderId;
  if (data.melhorEnvioProtocol !== void 0) updateSet.melhorEnvioProtocol = data.melhorEnvioProtocol;
  if (data.trackingCode !== void 0) updateSet.trackingCode = data.trackingCode;
  if (data.labelUrl !== void 0) updateSet.labelUrl = data.labelUrl;
  if (data.status !== void 0) updateSet.status = data.status;
  return await db.update(orders).set(updateSet).where(eq(orders.id, id));
}
async function initializeShippingRates() {
  const db = await getDb();
  if (!db) throw new Error("Database not available");
  const rates = [
    { region: "Sul", cepStart: "80000", cepEnd: "89999", rate100g: "18.00", rate200g: "22.00", prazo: "8-10 dias" },
    { region: "Sudeste", cepStart: "01000", cepEnd: "28999", rate100g: "22.00", rate200g: "28.00", prazo: "6-8 dias" },
    { region: "Centro-Oeste", cepStart: "50000", cepEnd: "72999", rate100g: "25.00", rate200g: "32.00", prazo: "10-12 dias" },
    { region: "Nordeste", cepStart: "40000", cepEnd: "48999", rate100g: "28.00", rate200g: "36.00", prazo: "12-15 dias" },
    { region: "Norte", cepStart: "60000", cepEnd: "69999", rate100g: "35.00", rate200g: "45.00", prazo: "15-20 dias" }
  ];
  for (const rate of rates) {
    try {
      await db.insert(shippingRates).values(rate).onDuplicateKeyUpdate({
        set: { rate100g: rate.rate100g, rate200g: rate.rate200g, prazo: rate.prazo }
      });
    } catch (error) {
      console.warn(`[Database] Failed to insert shipping rate for ${rate.region}:`, error);
    }
  }
}
async function calculateShippingCost(cep, weight) {
  const db = await getDb();
  if (!db) return null;
  const cepNumber = parseInt(cep.replace(/\D/g, ""), 10);
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
async function initializeProducts() {
  const db = await getDb();
  if (!db) return;
  const existingProducts = await db.select().from(products);
  if (existingProducts.length > 0) return;
  const productsToInsert = [
    { name: "Nossa Senhora de Lourdes", description: "Estatueta de Nossa Senhora de Lourdes em resina branca com acabamento fino.", price: "150.00", image: "/images/nossa-senhora-lourdes.jpg" },
    { name: "Sagrado Cora\xE7\xE3o de Maria", description: "Representa\xE7\xE3o do Sagrado Cora\xE7\xE3o de Maria com detalhes delicados.", price: "150.00", image: "/images/sagrado-coracao-maria.jpg" },
    { name: "Santa Hildegarda de Bingen", description: "Santa Hildegarda, m\xEDstica e estudiosa, com livro em m\xE3os.", price: "140.00", image: "/images/santa-hildegarda.jpg" },
    { name: "S\xE3o Francisco de Assis", description: "S\xE3o Francisco em sua veste caracter\xEDstica. Padroeiro da natureza e dos animais.", price: "140.00", image: "/images/sao-francisco.jpg" },
    { name: "S\xE3o Jos\xE9 com Menino Jesus", description: "S\xE3o Jos\xE9 protetor com o Menino Jesus nos bra\xE7os.", price: "160.00", image: "/images/sao-jose.jpg" }
  ];
  try {
    await db.insert(products).values(productsToInsert);
    console.log("[Database] Products initialized successfully");
  } catch (error) {
    console.error("[Database] Failed to initialize products:", error);
  }
}

// server/_core/cookies.ts
function isSecureRequest(req) {
  if (req.protocol === "https") return true;
  const forwardedProto = req.headers["x-forwarded-proto"];
  if (!forwardedProto) return false;
  const protoList = Array.isArray(forwardedProto) ? forwardedProto : forwardedProto.split(",");
  return protoList.some((proto) => proto.trim().toLowerCase() === "https");
}
function getSessionCookieOptions(req) {
  return {
    httpOnly: true,
    path: "/",
    sameSite: "none",
    secure: isSecureRequest(req)
  };
}

// shared/_core/errors.ts
var HttpError = class extends Error {
  constructor(statusCode, message) {
    super(message);
    this.statusCode = statusCode;
    this.name = "HttpError";
  }
};
var ForbiddenError = (msg) => new HttpError(403, msg);

// server/_core/sdk.ts
import axios from "axios";
import { parse as parseCookieHeader } from "cookie";
import { SignJWT, jwtVerify } from "jose";
var isNonEmptyString = (value) => typeof value === "string" && value.length > 0;
var EXCHANGE_TOKEN_PATH = `/webdev.v1.WebDevAuthPublicService/ExchangeToken`;
var GET_USER_INFO_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfo`;
var GET_USER_INFO_WITH_JWT_PATH = `/webdev.v1.WebDevAuthPublicService/GetUserInfoWithJwt`;
var OAuthService = class {
  constructor(client) {
    this.client = client;
    console.log("[OAuth] Initialized with baseURL:", ENV.oAuthServerUrl);
    if (!ENV.oAuthServerUrl) {
      console.error(
        "[OAuth] ERROR: OAUTH_SERVER_URL is not configured! Set OAUTH_SERVER_URL environment variable."
      );
    }
  }
  decodeState(state) {
    const redirectUri = atob(state);
    return redirectUri;
  }
  async getTokenByCode(code, state) {
    const payload = {
      clientId: ENV.appId,
      grantType: "authorization_code",
      code,
      redirectUri: this.decodeState(state)
    };
    const { data } = await this.client.post(
      EXCHANGE_TOKEN_PATH,
      payload
    );
    return data;
  }
  async getUserInfoByToken(token) {
    const { data } = await this.client.post(
      GET_USER_INFO_PATH,
      {
        accessToken: token.accessToken
      }
    );
    return data;
  }
};
var createOAuthHttpClient = () => axios.create({
  baseURL: ENV.oAuthServerUrl,
  timeout: AXIOS_TIMEOUT_MS
});
var SDKServer = class {
  client;
  oauthService;
  constructor(client = createOAuthHttpClient()) {
    this.client = client;
    this.oauthService = new OAuthService(this.client);
  }
  deriveLoginMethod(platforms, fallback) {
    if (fallback && fallback.length > 0) return fallback;
    if (!Array.isArray(platforms) || platforms.length === 0) return null;
    const set = new Set(
      platforms.filter((p) => typeof p === "string")
    );
    if (set.has("REGISTERED_PLATFORM_EMAIL")) return "email";
    if (set.has("REGISTERED_PLATFORM_GOOGLE")) return "google";
    if (set.has("REGISTERED_PLATFORM_APPLE")) return "apple";
    if (set.has("REGISTERED_PLATFORM_MICROSOFT") || set.has("REGISTERED_PLATFORM_AZURE"))
      return "microsoft";
    if (set.has("REGISTERED_PLATFORM_GITHUB")) return "github";
    const first = Array.from(set)[0];
    return first ? first.toLowerCase() : null;
  }
  /**
   * Exchange OAuth authorization code for access token
   * @example
   * const tokenResponse = await sdk.exchangeCodeForToken(code, state);
   */
  async exchangeCodeForToken(code, state) {
    return this.oauthService.getTokenByCode(code, state);
  }
  /**
   * Get user information using access token
   * @example
   * const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
   */
  async getUserInfo(accessToken) {
    const data = await this.oauthService.getUserInfoByToken({
      accessToken
    });
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  parseCookies(cookieHeader) {
    if (!cookieHeader) {
      return /* @__PURE__ */ new Map();
    }
    const parsed = parseCookieHeader(cookieHeader);
    return new Map(Object.entries(parsed));
  }
  getSessionSecret() {
    const secret = ENV.cookieSecret;
    return new TextEncoder().encode(secret);
  }
  /**
   * Create a session token for a Manus user openId
   * @example
   * const sessionToken = await sdk.createSessionToken(userInfo.openId);
   */
  async createSessionToken(openId, options = {}) {
    return this.signSession(
      {
        openId,
        appId: ENV.appId,
        name: options.name || ""
      },
      options
    );
  }
  async signSession(payload, options = {}) {
    const issuedAt = Date.now();
    const expiresInMs = options.expiresInMs ?? ONE_YEAR_MS;
    const expirationSeconds = Math.floor((issuedAt + expiresInMs) / 1e3);
    const secretKey = this.getSessionSecret();
    return new SignJWT({
      openId: payload.openId,
      appId: payload.appId,
      name: payload.name
    }).setProtectedHeader({ alg: "HS256", typ: "JWT" }).setExpirationTime(expirationSeconds).sign(secretKey);
  }
  async verifySession(cookieValue) {
    if (!cookieValue) {
      console.warn("[Auth] Missing session cookie");
      return null;
    }
    try {
      const secretKey = this.getSessionSecret();
      const { payload } = await jwtVerify(cookieValue, secretKey, {
        algorithms: ["HS256"]
      });
      const { openId, appId, name } = payload;
      if (!isNonEmptyString(openId) || !isNonEmptyString(appId) || !isNonEmptyString(name)) {
        console.warn("[Auth] Session payload missing required fields");
        return null;
      }
      return {
        openId,
        appId,
        name
      };
    } catch (error) {
      console.warn("[Auth] Session verification failed", String(error));
      return null;
    }
  }
  async getUserInfoWithJwt(jwtToken) {
    const payload = {
      jwtToken,
      projectId: ENV.appId
    };
    const { data } = await this.client.post(
      GET_USER_INFO_WITH_JWT_PATH,
      payload
    );
    const loginMethod = this.deriveLoginMethod(
      data?.platforms,
      data?.platform ?? data.platform ?? null
    );
    return {
      ...data,
      platform: loginMethod,
      loginMethod
    };
  }
  async authenticateRequest(req) {
    const cookies = this.parseCookies(req.headers.cookie);
    const sessionCookie = cookies.get(COOKIE_NAME);
    const session = await this.verifySession(sessionCookie);
    if (!session) {
      throw ForbiddenError("Invalid session cookie");
    }
    const sessionUserId = session.openId;
    const signedInAt = /* @__PURE__ */ new Date();
    let user = await getUserByOpenId(sessionUserId);
    if (!user) {
      try {
        const userInfo = await this.getUserInfoWithJwt(sessionCookie ?? "");
        await upsertUser({
          openId: userInfo.openId,
          name: userInfo.name || null,
          email: userInfo.email ?? null,
          loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
          lastSignedIn: signedInAt
        });
        user = await getUserByOpenId(userInfo.openId);
      } catch (error) {
        console.error("[Auth] Failed to sync user from OAuth:", error);
        throw ForbiddenError("Failed to sync user info");
      }
    }
    if (!user) {
      throw ForbiddenError("User not found");
    }
    await upsertUser({
      openId: user.openId,
      lastSignedIn: signedInAt
    });
    return user;
  }
};
var sdk = new SDKServer();

// server/_core/oauth.ts
function getQueryParam(req, key) {
  const value = req.query[key];
  return typeof value === "string" ? value : void 0;
}
function registerOAuthRoutes(app) {
  app.get("/api/oauth/callback", async (req, res) => {
    const code = getQueryParam(req, "code");
    const state = getQueryParam(req, "state");
    if (!code || !state) {
      res.status(400).json({ error: "code and state are required" });
      return;
    }
    try {
      const tokenResponse = await sdk.exchangeCodeForToken(code, state);
      const userInfo = await sdk.getUserInfo(tokenResponse.accessToken);
      if (!userInfo.openId) {
        res.status(400).json({ error: "openId missing from user info" });
        return;
      }
      await upsertUser({
        openId: userInfo.openId,
        name: userInfo.name || null,
        email: userInfo.email ?? null,
        loginMethod: userInfo.loginMethod ?? userInfo.platform ?? null,
        lastSignedIn: /* @__PURE__ */ new Date()
      });
      const sessionToken = await sdk.createSessionToken(userInfo.openId, {
        name: userInfo.name || "",
        expiresInMs: ONE_YEAR_MS
      });
      const cookieOptions = getSessionCookieOptions(req);
      res.cookie(COOKIE_NAME, sessionToken, { ...cookieOptions, maxAge: ONE_YEAR_MS });
      res.redirect(302, "/");
    } catch (error) {
      console.error("[OAuth] Callback failed", error);
      res.status(500).json({ error: "OAuth callback failed" });
    }
  });
}

// server/_core/systemRouter.ts
import { z } from "zod";

// server/_core/notification.ts
import { TRPCError } from "@trpc/server";
var TITLE_MAX_LENGTH = 1200;
var CONTENT_MAX_LENGTH = 2e4;
var trimValue = (value) => value.trim();
var isNonEmptyString2 = (value) => typeof value === "string" && value.trim().length > 0;
var buildEndpointUrl = (baseUrl) => {
  const normalizedBase = baseUrl.endsWith("/") ? baseUrl : `${baseUrl}/`;
  return new URL(
    "webdevtoken.v1.WebDevService/SendNotification",
    normalizedBase
  ).toString();
};
var validatePayload = (input) => {
  if (!isNonEmptyString2(input.title)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification title is required."
    });
  }
  if (!isNonEmptyString2(input.content)) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: "Notification content is required."
    });
  }
  const title = trimValue(input.title);
  const content = trimValue(input.content);
  if (title.length > TITLE_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification title must be at most ${TITLE_MAX_LENGTH} characters.`
    });
  }
  if (content.length > CONTENT_MAX_LENGTH) {
    throw new TRPCError({
      code: "BAD_REQUEST",
      message: `Notification content must be at most ${CONTENT_MAX_LENGTH} characters.`
    });
  }
  return { title, content };
};
async function notifyOwner(payload) {
  const { title, content } = validatePayload(payload);
  if (!ENV.forgeApiUrl) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service URL is not configured."
    });
  }
  if (!ENV.forgeApiKey) {
    throw new TRPCError({
      code: "INTERNAL_SERVER_ERROR",
      message: "Notification service API key is not configured."
    });
  }
  const endpoint = buildEndpointUrl(ENV.forgeApiUrl);
  try {
    const response = await fetch(endpoint, {
      method: "POST",
      headers: {
        accept: "application/json",
        authorization: `Bearer ${ENV.forgeApiKey}`,
        "content-type": "application/json",
        "connect-protocol-version": "1"
      },
      body: JSON.stringify({ title, content })
    });
    if (!response.ok) {
      const detail = await response.text().catch(() => "");
      console.warn(
        `[Notification] Failed to notify owner (${response.status} ${response.statusText})${detail ? `: ${detail}` : ""}`
      );
      return false;
    }
    return true;
  } catch (error) {
    console.warn("[Notification] Error calling notification service:", error);
    return false;
  }
}

// server/_core/trpc.ts
import { initTRPC, TRPCError as TRPCError2 } from "@trpc/server";
import superjson from "superjson";
var t = initTRPC.context().create({
  transformer: superjson
});
var router = t.router;
var publicProcedure = t.procedure;
var requireUser = t.middleware(async (opts) => {
  const { ctx, next } = opts;
  if (!ctx.user) {
    throw new TRPCError2({ code: "UNAUTHORIZED", message: UNAUTHED_ERR_MSG });
  }
  return next({
    ctx: {
      ...ctx,
      user: ctx.user
    }
  });
});
var protectedProcedure = t.procedure.use(requireUser);
var adminProcedure = t.procedure.use(
  t.middleware(async (opts) => {
    const { ctx, next } = opts;
    if (!ctx.user || ctx.user.role !== "admin") {
      throw new TRPCError2({ code: "FORBIDDEN", message: NOT_ADMIN_ERR_MSG });
    }
    return next({
      ctx: {
        ...ctx,
        user: ctx.user
      }
    });
  })
);

// server/_core/systemRouter.ts
var systemRouter = router({
  health: publicProcedure.input(
    z.object({
      timestamp: z.number().min(0, "timestamp cannot be negative")
    })
  ).query(() => ({
    ok: true
  })),
  notifyOwner: adminProcedure.input(
    z.object({
      title: z.string().min(1, "title is required"),
      content: z.string().min(1, "content is required")
    })
  ).mutation(async ({ input }) => {
    const delivered = await notifyOwner(input);
    return {
      success: delivered
    };
  })
});

// server/routers.ts
import { z as z2 } from "zod";
import bcrypt from "bcryptjs";
import { SignJWT as SignJWT2, jwtVerify as jwtVerify2 } from "jose";
import { parse as parseCookies } from "cookie";
import { nanoid } from "nanoid";

// server/melhorenvio.ts
import axios2 from "axios";
var USE_PROXY = false;
var CORS_PROXY = "https://api.allorigins.win/raw?url=";
var MELHOR_ENVIO_API = USE_PROXY ? `${CORS_PROXY}https://api.melhorenvio.com.br/v2` : "https://api.melhorenvio.com.br/v2";
var MELHOR_ENVIO_TOKEN = process.env.MELHOR_ENVIO_TOKEN;
var ORIGIN_CEP = process.env.MELHOR_ENVIO_ORIGIN_CEP || "89227320";
function getAccessToken() {
  if (!MELHOR_ENVIO_TOKEN) {
    throw new Error("MELHOR_ENVIO_TOKEN not configured");
  }
  return MELHOR_ENVIO_TOKEN;
}
async function calculateShipping(request) {
  try {
    const token = getAccessToken();
    console.log("[MelhorEnvio] Calculating shipping for CEP:", request.destinationCEP);
    const weightKg = request.weight / 1e3;
    const url = USE_PROXY ? `${MELHOR_ENVIO_API}/shipment/calculate` : `${MELHOR_ENVIO_API}/shipment/calculate`;
    console.log("[MelhorEnvio] Using URL:", url.substring(0, 50) + "...");
    const response = await axios2.post(
      url,
      {
        from: {
          postal_code: ORIGIN_CEP.replace("-", "")
        },
        to: {
          postal_code: request.destinationCEP.replace("-", "")
        },
        products: [
          {
            id: 1,
            width: request.width,
            height: request.height,
            length: request.length,
            weight: weightKg,
            quantity: 1,
            insurance_value: 0
          }
        ]
      },
      {
        headers: {
          "Authorization": `Bearer ${token}`,
          "Accept": "application/json",
          "Content-Type": "application/json",
          "User-Agent": "Melhor Envio (giorgiotestoni@gmail.com)"
        }
      }
    );
    const services = response.data.map((service) => ({
      id: service.id,
      name: service.name,
      price: parseFloat(service.price),
      delivery_time: service.delivery_time,
      company: {
        name: service.company,
        picture: service.picture
      }
    }));
    console.log(`[MelhorEnvio] Calculated shipping for CEP ${request.destinationCEP}: ${services.length} services found`);
    return {
      services
    };
  } catch (error) {
    console.error("[MelhorEnvio] Error calculating shipping");
    console.error("[MelhorEnvio] Status:", error.response?.status);
    console.error("[MelhorEnvio] Error:", error.response?.data || error.message);
    return {
      services: [],
      error: error.response?.data?.message || error.message || "Failed to calculate shipping"
    };
  }
}

// server/shipping-table.ts
var CEP_REGIONS = {
  // Santa Catarina (origem: 89227-320)
  "88": "SC",
  "89": "SC",
  // Sul
  "80": "PR",
  "81": "PR",
  "82": "PR",
  "83": "PR",
  "84": "PR",
  "85": "PR",
  "86": "PR",
  "87": "PR",
  "90": "RS",
  "91": "RS",
  "92": "RS",
  "93": "RS",
  "94": "RS",
  "95": "RS",
  "96": "RS",
  "97": "RS",
  "98": "RS",
  "99": "RS",
  // Sudeste
  "01": "SP",
  "02": "SP",
  "03": "SP",
  "04": "SP",
  "05": "SP",
  "06": "SP",
  "07": "SP",
  "08": "SP",
  "09": "SP",
  "11": "SP",
  "12": "SP",
  "13": "SP",
  "14": "SP",
  "15": "SP",
  "16": "SP",
  "17": "SP",
  "18": "SP",
  "19": "SP",
  "20": "RJ",
  "21": "RJ",
  "22": "RJ",
  "23": "RJ",
  "24": "RJ",
  "25": "RJ",
  "26": "RJ",
  "27": "RJ",
  "28": "RJ",
  "30": "MG",
  "31": "MG",
  "32": "MG",
  "33": "MG",
  "34": "MG",
  "35": "MG",
  "36": "MG",
  "37": "MG",
  "38": "MG",
  "39": "MG",
  "29": "ES",
  // Centro-Oeste
  "70": "DF",
  "71": "DF",
  "72": "DF",
  "73": "DF",
  "74": "GO",
  "75": "GO",
  "76": "GO",
  "78": "MT",
  "79": "MT",
  // Nordeste
  "40": "BA",
  "41": "BA",
  "42": "BA",
  "43": "BA",
  "44": "BA",
  "45": "BA",
  "46": "BA",
  "47": "BA",
  "48": "BA",
  "49": "SE",
  "50": "PE",
  "51": "PE",
  "52": "PE",
  "53": "PE",
  "54": "PE",
  "55": "PE",
  "56": "PE",
  "57": "AL",
  "58": "PB",
  "59": "RN",
  "60": "CE",
  "61": "CE",
  "62": "CE",
  "63": "CE",
  "64": "PI",
  "65": "MA",
  // Norte
  "68": "AC",
  "69": "RO",
  "77": "TO",
  "66": "AP",
  "67": "AM"
};
var SHIPPING_TABLE = {
  "P": {
    // 8x8x15cm, 100g
    "SC": { pac: { price: 18.76, days: 7 }, sedex: { price: 30.25, days: 5 } },
    "PR": { pac: { price: 21.78, days: 8 }, sedex: { price: 34.49, days: 6 } },
    "RS": { pac: { price: 23.6, days: 9 }, sedex: { price: 36.3, days: 6 } },
    "SP": { pac: { price: 26.62, days: 10 }, sedex: { price: 42.35, days: 7 } },
    "RJ": { pac: { price: 29.04, days: 11 }, sedex: { price: 45.98, days: 7 } },
    "MG": { pac: { price: 27.83, days: 11 }, sedex: { price: 44.16, days: 7 } },
    "ES": { pac: { price: 29.65, days: 11 }, sedex: { price: 47.19, days: 7 } },
    "DF": { pac: { price: 31.46, days: 12 }, sedex: { price: 50.82, days: 8 } },
    "GO": { pac: { price: 32.06, days: 12 }, sedex: { price: 51.43, days: 8 } },
    "MT": { pac: { price: 33.88, days: 13 }, sedex: { price: 54.45, days: 9 } },
    "BA": { pac: { price: 32.67, days: 13 }, sedex: { price: 52.64, days: 9 } },
    "SE": { pac: { price: 34.49, days: 14 }, sedex: { price: 55.66, days: 9 } },
    "PE": { pac: { price: 35.09, days: 14 }, sedex: { price: 56.87, days: 10 } },
    "AL": { pac: { price: 35.7, days: 14 }, sedex: { price: 57.48, days: 10 } },
    "PB": { pac: { price: 36.3, days: 15 }, sedex: { price: 58.69, days: 10 } },
    "RN": { pac: { price: 36.91, days: 15 }, sedex: { price: 59.29, days: 10 } },
    "CE": { pac: { price: 37.51, days: 15 }, sedex: { price: 60.5, days: 10 } },
    "PI": { pac: { price: 38.12, days: 16 }, sedex: { price: 61.71, days: 11 } },
    "MA": { pac: { price: 38.72, days: 16 }, sedex: { price: 62.92, days: 11 } },
    "AC": { pac: { price: 42.35, days: 18 }, sedex: { price: 70.18, days: 12 } },
    "RO": { pac: { price: 41.14, days: 17 }, sedex: { price: 67.76, days: 12 } },
    "RR": { pac: { price: 43.56, days: 19 }, sedex: { price: 72.6, days: 13 } },
    "TO": { pac: { price: 39.33, days: 16 }, sedex: { price: 64.13, days: 11 } },
    "AP": { pac: { price: 44.16, days: 19 }, sedex: { price: 73.81, days: 13 } },
    "AM": { pac: { price: 42.95, days: 18 }, sedex: { price: 71.39, days: 12 } }
  },
  "M": {
    // 10x10x23cm, 150g
    "SC": { pac: { price: 22.39, days: 7 }, sedex: { price: 36.3, days: 5 } },
    "PR": { pac: { price: 26.02, days: 8 }, sedex: { price: 41.14, days: 6 } },
    "RS": { pac: { price: 27.83, days: 9 }, sedex: { price: 43.56, days: 6 } },
    "SP": { pac: { price: 32.06, days: 10 }, sedex: { price: 50.82, days: 7 } },
    "RJ": { pac: { price: 35.09, days: 11 }, sedex: { price: 55.05, days: 7 } },
    "MG": { pac: { price: 33.28, days: 11 }, sedex: { price: 52.64, days: 7 } },
    "ES": { pac: { price: 35.7, days: 11 }, sedex: { price: 56.27, days: 7 } },
    "DF": { pac: { price: 38.12, days: 12 }, sedex: { price: 61.11, days: 8 } },
    "GO": { pac: { price: 38.72, days: 12 }, sedex: { price: 61.71, days: 8 } },
    "MT": { pac: { price: 41.14, days: 13 }, sedex: { price: 65.34, days: 9 } },
    "BA": { pac: { price: 39.33, days: 13 }, sedex: { price: 62.92, days: 9 } },
    "SE": { pac: { price: 41.75, days: 14 }, sedex: { price: 66.55, days: 9 } },
    "PE": { pac: { price: 42.35, days: 14 }, sedex: { price: 68.37, days: 10 } },
    "AL": { pac: { price: 42.95, days: 14 }, sedex: { price: 68.97, days: 10 } },
    "PB": { pac: { price: 43.56, days: 15 }, sedex: { price: 70.18, days: 10 } },
    "RN": { pac: { price: 44.16, days: 15 }, sedex: { price: 70.78, days: 10 } },
    "CE": { pac: { price: 45.38, days: 15 }, sedex: { price: 72.6, days: 10 } },
    "PI": { pac: { price: 45.98, days: 16 }, sedex: { price: 73.81, days: 11 } },
    "MA": { pac: { price: 46.59, days: 16 }, sedex: { price: 75.02, days: 11 } },
    "AC": { pac: { price: 50.82, days: 18 }, sedex: { price: 83.49, days: 12 } },
    "RO": { pac: { price: 49.61, days: 17 }, sedex: { price: 81.07, days: 12 } },
    "RR": { pac: { price: 52.64, days: 19 }, sedex: { price: 87.12, days: 13 } },
    "TO": { pac: { price: 47.19, days: 16 }, sedex: { price: 76.83, days: 11 } },
    "AP": { pac: { price: 53.24, days: 19 }, sedex: { price: 88.33, days: 13 } },
    "AM": { pac: { price: 51.43, days: 18 }, sedex: { price: 85.31, days: 12 } }
  },
  "G": {
    // 15x15x30cm, 250g
    "SC": { pac: { price: 27.23, days: 7 }, sedex: { price: 43.56, days: 5 } },
    "PR": { pac: { price: 31.46, days: 8 }, sedex: { price: 49.61, days: 6 } },
    "RS": { pac: { price: 33.88, days: 9 }, sedex: { price: 52.64, days: 6 } },
    "SP": { pac: { price: 38.72, days: 10 }, sedex: { price: 61.11, days: 7 } },
    "RJ": { pac: { price: 42.35, days: 11 }, sedex: { price: 66.55, days: 7 } },
    "MG": { pac: { price: 40.54, days: 11 }, sedex: { price: 63.53, days: 7 } },
    "ES": { pac: { price: 42.95, days: 11 }, sedex: { price: 67.76, days: 7 } },
    "DF": { pac: { price: 45.98, days: 12 }, sedex: { price: 73.81, days: 8 } },
    "GO": { pac: { price: 46.59, days: 12 }, sedex: { price: 74.42, days: 8 } },
    "MT": { pac: { price: 49.61, days: 13 }, sedex: { price: 78.65, days: 9 } },
    "BA": { pac: { price: 47.8, days: 13 }, sedex: { price: 76.23, days: 9 } },
    "SE": { pac: { price: 50.22, days: 14 }, sedex: { price: 80.47, days: 9 } },
    "PE": { pac: { price: 51.43, days: 14 }, sedex: { price: 82.28, days: 10 } },
    "AL": { pac: { price: 52.03, days: 14 }, sedex: { price: 82.89, days: 10 } },
    "PB": { pac: { price: 52.64, days: 15 }, sedex: { price: 84.7, days: 10 } },
    "RN": { pac: { price: 53.85, days: 15 }, sedex: { price: 85.91, days: 10 } },
    "CE": { pac: { price: 55.05, days: 15 }, sedex: { price: 87.73, days: 10 } },
    "PI": { pac: { price: 55.66, days: 16 }, sedex: { price: 88.94, days: 11 } },
    "MA": { pac: { price: 56.27, days: 16 }, sedex: { price: 90.75, days: 11 } },
    "AC": { pac: { price: 61.71, days: 18 }, sedex: { price: 100.43, days: 12 } },
    "RO": { pac: { price: 59.9, days: 17 }, sedex: { price: 98.01, days: 12 } },
    "RR": { pac: { price: 63.53, days: 19 }, sedex: { price: 104.06, days: 13 } },
    "TO": { pac: { price: 57.48, days: 16 }, sedex: { price: 92.57, days: 11 } },
    "AP": { pac: { price: 64.13, days: 19 }, sedex: { price: 106.48, days: 13 } },
    "AM": { pac: { price: 62.32, days: 18 }, sedex: { price: 102.85, days: 12 } }
  }
};
function getRegionFromCEP(cep) {
  const cleanCEP = cep.replace(/\D/g, "");
  const prefix = cleanCEP.substring(0, 2);
  return CEP_REGIONS[prefix] || "SP";
}
function calculateShippingByTable(cep, size, includeLocalPickup = true) {
  const region = getRegionFromCEP(cep);
  const rates = SHIPPING_TABLE[size][region];
  if (!rates) {
    const spRates = SHIPPING_TABLE[size]["SP"];
    return {
      services: [
        {
          id: 1,
          name: "PAC",
          price: spRates.pac.price,
          deliveryTime: spRates.pac.days,
          company: "Correios"
        },
        {
          id: 2,
          name: "SEDEX",
          price: spRates.sedex.price,
          deliveryTime: spRates.sedex.days,
          company: "Correios"
        },
        {
          id: 3,
          name: "Retirar no Local",
          price: 0,
          deliveryTime: 0,
          company: "Retirada em M\xE3os"
        }
      ]
    };
  }
  return {
    services: [
      {
        id: 1,
        name: "PAC",
        price: rates.pac.price,
        deliveryTime: rates.pac.days,
        company: "Correios"
      },
      {
        id: 2,
        name: "SEDEX",
        price: rates.sedex.price,
        deliveryTime: rates.sedex.days,
        company: "Correios"
      },
      {
        id: 3,
        name: "Retirar no Local",
        price: 0,
        deliveryTime: 0,
        company: "Retirada em M\xE3os"
      }
    ]
  };
}

// server/melhorenvio-labels.ts
var ME_BASE_URL = "https://melhorenvio.com.br/api/v2";
var ORIGIN_CEP2 = process.env.MELHOR_ENVIO_ORIGIN_CEP || "89227320";
var SENDER = {
  name: "Santos Anjos 3D",
  phone: "47996641959",
  email: "santos.anjos3d@gmail.com",
  document: process.env.MELHOR_ENVIO_DOCUMENT || "05526634922",
  address: "Rua Arthur Zoefeldt",
  number: "307",
  complement: "",
  district: "Iriri\xFA",
  city: "Joinville",
  state_abbr: "SC",
  postal_code: ORIGIN_CEP2,
  country_id: "BR"
};
function getHeaders() {
  const token = process.env.MELHOR_ENVIO_TOKEN;
  if (!token) throw new Error("MELHOR_ENVIO_TOKEN n\xE3o configurado");
  return {
    "Accept": "application/json",
    "Content-Type": "application/json",
    "Authorization": `Bearer ${token}`,
    "User-Agent": "Santos Anjos 3D (contato@santosanjos3d.com.br)"
  };
}
function estimatePackageDimensions(itemsSummary) {
  return {
    height: 15,
    width: 15,
    length: 25,
    weight: 0.5
    // kg
  };
}
async function addToMelhorEnvioCart(order) {
  const dimensions = estimatePackageDimensions(order.itemsSummary);
  const payload = {
    service: order.shippingServiceId,
    agency: null,
    from: {
      name: SENDER.name,
      phone: SENDER.phone,
      email: SENDER.email,
      document: SENDER.document,
      address: SENDER.address,
      number: SENDER.number,
      complement: SENDER.complement || void 0,
      district: SENDER.district,
      city: SENDER.city,
      state_abbr: SENDER.state_abbr,
      postal_code: SENDER.postal_code,
      country_id: SENDER.country_id
    },
    to: {
      name: order.customerName,
      phone: order.customerPhone?.replace(/\D/g, "") || "",
      email: null,
      document: order.customerDocument?.replace(/\D/g, "") || void 0,
      address: order.addressStreet,
      number: order.addressNumber,
      complement: order.addressComplement || void 0,
      district: order.addressDistrict,
      city: order.addressCity,
      state_abbr: order.addressState,
      postal_code: order.addressPostalCode?.replace(/\D/g, ""),
      country_id: "BR"
    },
    products: [
      {
        name: "Arte Sacra 3D",
        quantity: 1,
        unitary_value: parseFloat(order.totalPrice)
      }
    ],
    volumes: [
      {
        height: dimensions.height,
        width: dimensions.width,
        length: dimensions.length,
        weight: dimensions.weight
      }
    ],
    options: {
      insurance_value: parseFloat(order.totalPrice),
      receipt: false,
      own_hand: false,
      reverse: false,
      non_commercial: false,
      invoice: {
        key: null
      },
      tags: [
        {
          tag: order.orderNumber,
          url: null
        }
      ]
    }
  };
  const response = await fetch(`${ME_BASE_URL}/me/cart`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify(payload)
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao adicionar ao carrinho ME: ${response.status} \u2014 ${errorText.substring(0, 300)}`);
  }
  const data = await response.json();
  console.log("[MelhorEnvio] Adicionado ao carrinho:", data.id);
  return data.id;
}
async function purchaseMelhorEnvioShipment(cartItemIds) {
  const response = await fetch(`${ME_BASE_URL}/me/shipment/checkout`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ orders: cartItemIds })
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao comprar frete ME: ${response.status} \u2014 ${errorText.substring(0, 300)}`);
  }
  const data = await response.json();
  console.log("[MelhorEnvio] Frete comprado:", data);
  return cartItemIds[0];
}
async function generateMelhorEnvioLabel(orderId) {
  const response = await fetch(`${ME_BASE_URL}/me/shipment/generate`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({ orders: [orderId] })
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao gerar etiqueta ME: ${response.status} \u2014 ${errorText.substring(0, 300)}`);
  }
  console.log("[MelhorEnvio] Etiqueta gerada para:", orderId);
}
async function printMelhorEnvioLabel(orderId) {
  const response = await fetch(`${ME_BASE_URL}/me/shipment/print`, {
    method: "POST",
    headers: getHeaders(),
    body: JSON.stringify({
      mode: "private",
      orders: [orderId]
    })
  });
  if (!response.ok) {
    const errorText = await response.text();
    throw new Error(`Erro ao imprimir etiqueta ME: ${response.status} \u2014 ${errorText.substring(0, 300)}`);
  }
  const data = await response.json();
  console.log("[MelhorEnvio] URL da etiqueta:", data.url);
  return data.url;
}
async function generateLabelForOrder(order) {
  const cartItemId = await addToMelhorEnvioCart(order);
  await purchaseMelhorEnvioShipment([cartItemId]);
  await generateMelhorEnvioLabel(cartItemId);
  const labelUrl = await printMelhorEnvioLabel(cartItemId);
  return {
    melhorEnvioOrderId: cartItemId,
    labelUrl
  };
}
async function trackMelhorEnvioShipment(orderId) {
  const response = await fetch(`${ME_BASE_URL}/me/orders/${orderId}`, {
    method: "GET",
    headers: getHeaders()
  });
  if (!response.ok) {
    throw new Error(`Erro ao buscar rastreio: ${response.status}`);
  }
  const data = await response.json();
  return {
    trackingCode: data.tracking || null,
    status: data.status || "unknown"
  };
}

// server/routers.ts
import { TRPCError as TRPCError3 } from "@trpc/server";
var ADMIN_COOKIE = "sa3d_admin_token";
var ADMIN_TOKEN_SECRET = new TextEncoder().encode(
  (ENV.cookieSecret || "fallback-secret-change-me") + "-admin"
);
function getAdminCookie(req) {
  const cookieHeader = req.headers?.cookie;
  if (!cookieHeader) return void 0;
  const parsed = parseCookies(cookieHeader);
  return parsed[ADMIN_COOKIE];
}
var appRouter = router({
  system: systemRouter,
  admin: router({
    /**
     * Login do painel admin com e-mail e senha
     */
    login: publicProcedure.input(z2.object({
      email: z2.string().email(),
      password: z2.string().min(1)
    })).mutation(async ({ input, ctx }) => {
      const adminEmail = ENV.adminEmail;
      const adminHash = ENV.adminPasswordHash;
      if (!adminEmail || !adminHash) {
        throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Admin n\xE3o configurado" });
      }
      if (input.email !== adminEmail) {
        throw new TRPCError3({ code: "UNAUTHORIZED", message: "Credenciais inv\xE1lidas" });
      }
      let valid = false;
      if (adminHash.startsWith("$2b$") || adminHash.startsWith("$2a$")) {
        valid = await bcrypt.compare(input.password, adminHash);
      } else {
        valid = input.password === adminHash;
      }
      if (!valid) {
        throw new TRPCError3({ code: "UNAUTHORIZED", message: "Credenciais inv\xE1lidas" });
      }
      const token = await new SignJWT2({ role: "admin", email: input.email }).setProtectedHeader({ alg: "HS256" }).setExpirationTime("7d").sign(ADMIN_TOKEN_SECRET);
      const isProduction = ENV.isProduction;
      ctx.res.cookie(ADMIN_COOKIE, token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: "lax",
        maxAge: 7 * 24 * 60 * 60 * 1e3,
        path: "/"
      });
      return { success: true };
    }),
    /**
     * Logout do painel admin
     */
    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie(ADMIN_COOKIE, { path: "/" });
      return { success: true };
    }),
    /**
     * Verificar se está autenticado como admin
     */
    check: publicProcedure.query(async ({ ctx }) => {
      const token = getAdminCookie(ctx.req);
      if (!token) return { authenticated: false };
      try {
        await jwtVerify2(token, ADMIN_TOKEN_SECRET);
        return { authenticated: true };
      } catch {
        return { authenticated: false };
      }
    })
  }),
  auth: router({
    me: publicProcedure.query((opts) => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true };
    })
  }),
  products: router({
    list: publicProcedure.query(() => getAllProducts()),
    getById: publicProcedure.input(z2.object({ id: z2.number() })).query(({ input }) => getProductById(input.id))
  }),
  shipping: router({
    calculateCost: publicProcedure.input(z2.object({ cep: z2.string(), weight: z2.number() })).query(async ({ input }) => calculateShippingCost(input.cep, input.weight)),
    initialize: publicProcedure.mutation(async () => {
      await initializeShippingRates();
      return { success: true };
    }),
    calculateMelhorEnvio: publicProcedure.input(z2.object({
      destinationCEP: z2.string().regex(/^\d{8}$/, "CEP deve ter 8 d\xEDgitos"),
      sizeType: z2.enum(["P", "M", "G"])
    })).query(async ({ input }) => {
      const sizeMap = {
        P: { width: 8, height: 8, length: 15, weight: 100 },
        M: { width: 10, height: 10, length: 23, weight: 150 },
        G: { width: 15, height: 15, length: 30, weight: 250 }
      };
      const dimensions = sizeMap[input.sizeType];
      try {
        const apiResult = await calculateShipping({
          destinationCEP: input.destinationCEP,
          weight: dimensions.weight,
          height: dimensions.height,
          width: dimensions.width,
          length: dimensions.length
        });
        if (apiResult.services && apiResult.services.length > 0) {
          const services = apiResult.services.map((service) => ({
            id: service.id,
            name: service.name,
            price: service.price,
            deliveryTime: service.delivery_time,
            company: service.company.name
          }));
          services.push({ id: 999, name: "Retirar no Local", price: 0, deliveryTime: 0, company: "Retirada em M\xE3os" });
          return { success: true, services, source: "api" };
        }
        throw new Error("API returned no services");
      } catch (error) {
        try {
          const result = calculateShippingByTable(input.destinationCEP, input.sizeType);
          return { success: true, services: result.services, source: "table" };
        } catch (tableError) {
          return { success: false, error: "Erro ao calcular frete. Tente novamente.", services: [] };
        }
      }
    })
  }),
  orders: router({
    /**
     * Criar pedido completo com endereço (novo fluxo com etiqueta)
     */
    createFull: publicProcedure.input(z2.object({
      customerName: z2.string().min(1),
      customerPhone: z2.string().min(1),
      customerDocument: z2.string().min(11, "CPF inv\xE1lido"),
      addressPostalCode: z2.string().min(8),
      addressStreet: z2.string().min(1),
      addressNumber: z2.string().min(1),
      addressComplement: z2.string().optional(),
      addressDistrict: z2.string().min(1),
      addressCity: z2.string().min(1),
      addressState: z2.string().length(2),
      shippingServiceId: z2.number().optional(),
      shippingServiceName: z2.string().optional(),
      shippingCompany: z2.string().optional(),
      subtotal: z2.string(),
      shippingCost: z2.string(),
      totalPrice: z2.string(),
      itemsSummary: z2.string().optional()
    })).mutation(async ({ input }) => {
      const orderNumber = `SA-${nanoid(8).toUpperCase()}`;
      await createOrder({
        orderNumber,
        customerName: input.customerName,
        customerPhone: input.customerPhone,
        customerDocument: input.customerDocument,
        addressPostalCode: input.addressPostalCode,
        addressStreet: input.addressStreet,
        addressNumber: input.addressNumber,
        addressComplement: input.addressComplement || null,
        addressDistrict: input.addressDistrict,
        addressCity: input.addressCity,
        addressState: input.addressState,
        shippingServiceId: input.shippingServiceId || null,
        shippingServiceName: input.shippingServiceName || null,
        shippingCompany: input.shippingCompany || null,
        subtotal: input.subtotal,
        shippingCost: input.shippingCost,
        totalPrice: input.totalPrice,
        itemsSummary: input.itemsSummary || null,
        status: "pending"
      });
      const order = await getOrderByNumber(orderNumber);
      if (!order) throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: "Erro ao criar pedido" });
      return order;
    }),
    /**
     * Criar pedido simples (legado)
     */
    create: publicProcedure.input(z2.object({
      customerName: z2.string().min(1),
      customerEmail: z2.string().email().optional(),
      customerPhone: z2.string().optional(),
      productId: z2.number().optional(),
      quantity: z2.number().min(1).default(1),
      subtotal: z2.string(),
      shippingCost: z2.string().optional(),
      totalPrice: z2.string(),
      pixKey: z2.string().optional()
    })).mutation(async ({ input }) => {
      const orderNumber = `SA-${nanoid(8).toUpperCase()}`;
      await createOrder({
        orderNumber,
        customerName: input.customerName,
        customerEmail: input.customerEmail || null,
        customerPhone: input.customerPhone || null,
        subtotal: input.subtotal,
        shippingCost: input.shippingCost || "0",
        totalPrice: input.totalPrice,
        status: "pending"
      });
      const order = await getOrderByNumber(orderNumber);
      return order;
    }),
    getByNumber: publicProcedure.input(z2.object({ orderNumber: z2.string() })).query(({ input }) => getOrderByNumber(input.orderNumber)),
    list: publicProcedure.query(() => getAllOrders()),
    updateStatus: publicProcedure.input(z2.object({ orderId: z2.number(), status: z2.string() })).mutation(({ input }) => updateOrderStatus(input.orderId, input.status)),
    /**
     * Gerar etiqueta via Melhor Envio (ação do admin)
     * Fluxo: adiciona ao carrinho ME → compra → gera → retorna URL do PDF
     */
    generateLabel: publicProcedure.input(z2.object({ orderId: z2.number() })).mutation(async ({ input }) => {
      const order = await getOrderById(input.orderId);
      if (!order) throw new TRPCError3({ code: "NOT_FOUND", message: "Pedido n\xE3o encontrado" });
      if (!order.addressPostalCode || !order.addressStreet || !order.addressCity) {
        throw new TRPCError3({ code: "BAD_REQUEST", message: "Pedido sem endere\xE7o completo para gerar etiqueta" });
      }
      if (order.shippingServiceId === null && order.shippingServiceName !== "Retirada no Local") {
        throw new TRPCError3({ code: "BAD_REQUEST", message: "Pedido sem servi\xE7o de frete selecionado" });
      }
      if (order.shippingServiceName === "Retirada no Local" || order.shippingServiceId === null) {
        await updateOrderLabelInfo(order.id, { status: "processing" });
        return { success: true, labelUrl: null, message: "Pedido de retirada no local \u2014 sem etiqueta necess\xE1ria" };
      }
      try {
        const { melhorEnvioOrderId, labelUrl } = await generateLabelForOrder({
          id: order.id,
          orderNumber: order.orderNumber,
          customerName: order.customerName,
          customerPhone: order.customerPhone,
          customerDocument: order.customerDocument,
          addressPostalCode: order.addressPostalCode,
          addressStreet: order.addressStreet,
          addressNumber: order.addressNumber,
          addressComplement: order.addressComplement,
          addressDistrict: order.addressDistrict,
          addressCity: order.addressCity,
          addressState: order.addressState,
          shippingServiceId: order.shippingServiceId,
          itemsSummary: order.itemsSummary,
          totalPrice: String(order.totalPrice)
        });
        await updateOrderLabelInfo(order.id, {
          melhorEnvioOrderId,
          labelUrl,
          status: "processing"
        });
        return { success: true, labelUrl, melhorEnvioOrderId };
      } catch (err) {
        console.error("[generateLabel] Erro:", err.message);
        throw new TRPCError3({ code: "INTERNAL_SERVER_ERROR", message: err.message });
      }
    }),
    /**
     * Deletar pedido (ação do admin)
     */
    delete: publicProcedure.input(z2.object({ orderId: z2.number() })).mutation(async ({ input }) => {
      const order = await getOrderById(input.orderId);
      if (!order) throw new TRPCError3({ code: "NOT_FOUND", message: "Pedido n\xE3o encontrado" });
      await deleteOrder(input.orderId);
      return { success: true };
    }),
    /**
     * Buscar rastreio de um pedido
     */
    getTracking: publicProcedure.input(z2.object({ orderId: z2.number() })).query(async ({ input }) => {
      const order = await getOrderById(input.orderId);
      if (!order) throw new TRPCError3({ code: "NOT_FOUND", message: "Pedido n\xE3o encontrado" });
      if (!order.melhorEnvioOrderId) return { trackingCode: null, status: order.status };
      try {
        const tracking = await trackMelhorEnvioShipment(order.melhorEnvioOrderId);
        if (tracking.trackingCode && tracking.trackingCode !== order.trackingCode) {
          await updateOrderLabelInfo(order.id, { trackingCode: tracking.trackingCode });
        }
        return tracking;
      } catch {
        return { trackingCode: order.trackingCode, status: order.status };
      }
    })
  })
});

// server/_core/context.ts
async function createContext(opts) {
  let user = null;
  try {
    user = await sdk.authenticateRequest(opts.req);
  } catch (error) {
    user = null;
  }
  return {
    req: opts.req,
    res: opts.res,
    user
  };
}

// server/_core/vite.ts
import express from "express";
import fs from "fs";
import { nanoid as nanoid2 } from "nanoid";
import path2 from "path";
import { createServer as createViteServer } from "vite";

// vite.config.ts
import { jsxLocPlugin } from "@builder.io/vite-plugin-jsx-loc";
import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react";
import path from "path";
import { defineConfig } from "vite";
import { vitePluginManusRuntime } from "vite-plugin-manus-runtime";
var plugins = [react(), tailwindcss(), jsxLocPlugin(), vitePluginManusRuntime()];
var vite_config_default = defineConfig({
  plugins,
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets")
    }
  },
  envDir: path.resolve(import.meta.dirname),
  root: path.resolve(import.meta.dirname, "client"),
  publicDir: path.resolve(import.meta.dirname, "client", "public"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist", "public"),
    emptyOutDir: true
  },
  server: {
    host: true,
    allowedHosts: [
      ".manuspre.computer",
      ".manus.computer",
      ".manus-asia.computer",
      ".manuscomputer.ai",
      ".manusvm.computer",
      "localhost",
      "127.0.0.1"
    ],
    fs: {
      strict: true,
      deny: ["**/.*"]
    }
  }
});

// server/_core/vite.ts
async function setupVite(app, server) {
  const serverOptions = {
    middlewareMode: true,
    hmr: { server },
    allowedHosts: true
  };
  const vite = await createViteServer({
    ...vite_config_default,
    configFile: false,
    server: serverOptions,
    appType: "custom"
  });
  app.use(vite.middlewares);
  app.use("*", async (req, res, next) => {
    const url = req.originalUrl;
    try {
      const clientTemplate = path2.resolve(
        import.meta.dirname,
        "../..",
        "client",
        "index.html"
      );
      let template = await fs.promises.readFile(clientTemplate, "utf-8");
      template = template.replace(
        `src="/src/main.tsx"`,
        `src="/src/main.tsx?v=${nanoid2()}"`
      );
      const page = await vite.transformIndexHtml(url, template);
      res.status(200).set({ "Content-Type": "text/html" }).end(page);
    } catch (e) {
      vite.ssrFixStacktrace(e);
      next(e);
    }
  });
}
function serveStatic(app) {
  const distPath = process.env.NODE_ENV === "development" ? path2.resolve(import.meta.dirname, "../..", "dist", "public") : path2.resolve(import.meta.dirname, "public");
  if (!fs.existsSync(distPath)) {
    console.error(
      `Could not find the build directory: ${distPath}, make sure to build the client first`
    );
  }
  app.use(express.static(distPath));
  app.use("*", (_req, res) => {
    res.sendFile(path2.resolve(distPath, "index.html"));
  });
}

// server/_core/index.ts
var MELHOR_ENVIO_URL = "https://melhorenvio.com.br/api/v2/me/shipment/calculate";
async function calculateShippingHandler(req, res) {
  res.setHeader("Access-Control-Allow-Credentials", "true");
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET,OPTIONS,POST");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }
  if (req.method !== "POST") {
    return res.status(405).json({ error: "Method not allowed" });
  }
  const { to_postal_code, packages } = req.body;
  if (!to_postal_code || !packages) {
    return res.status(400).json({ error: "Missing required fields" });
  }
  const MELHOR_ENVIO_TOKEN2 = process.env.MELHOR_ENVIO_TOKEN;
  const ORIGIN_CEP3 = process.env.MELHOR_ENVIO_ORIGIN_CEP || "89227320";
  const volumes = packages.map((pkg) => ({
    height: pkg.height || 15,
    width: pkg.width || 15,
    length: pkg.length || 30,
    weight: pkg.weight || 0.5
  }));
  if (MELHOR_ENVIO_TOKEN2) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15e3);
      const meResponse = await fetch(MELHOR_ENVIO_URL, {
        method: "POST",
        headers: {
          "Accept": "application/json",
          "Content-Type": "application/json",
          "Authorization": `Bearer ${MELHOR_ENVIO_TOKEN2}`,
          "User-Agent": "Santos Anjos 3D (contato@santosanjos3d.com.br)"
        },
        body: JSON.stringify({
          from: { postal_code: ORIGIN_CEP3 },
          to: { postal_code: to_postal_code },
          volumes
        }),
        signal: controller.signal
      });
      clearTimeout(timeoutId);
      if (meResponse.ok) {
        const data = await meResponse.json();
        if (Array.isArray(data)) {
          const ALLOWED_IDS = [2, 3, 33];
          const services = data.filter((s) => ALLOWED_IDS.includes(s.id) && s.price && !s.error).map((s) => ({
            id: s.id,
            name: s.name,
            company: s.company?.name || s.company,
            price: s.price,
            delivery_time: s.delivery_time,
            currency: "R$"
          }));
          services.push({
            id: "retirada-local",
            name: "Retirada no Local",
            company: "Santos Anjos 3D",
            price: "0.00",
            delivery_time: 0,
            currency: "R$"
          });
          if (services.length > 1) {
            return res.status(200).json(services);
          }
        }
      }
      console.error("[Shipping] Melhor Envio retornou status:", meResponse.status);
    } catch (error) {
      console.error("[Shipping] Erro ao chamar Melhor Envio:", error.message);
    }
  }
  return res.status(200).json([
    { id: "pac", name: "PAC (estimativa)", company: "Correios", price: "15.00", delivery_time: 10, currency: "R$" },
    { id: "sedex", name: "SEDEX (estimativa)", company: "Correios", price: "25.00", delivery_time: 5, currency: "R$" },
    { id: "retirada-local", name: "Retirada no Local", company: "Santos Anjos 3D", price: "0.00", delivery_time: 0, currency: "R$" }
  ]);
}
function isPortAvailable(port) {
  return new Promise((resolve) => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}
async function findAvailablePort(startPort = 3e3) {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}
async function startServer() {
  const app = express2();
  const server = createServer(app);
  app.use(express2.json({ limit: "50mb" }));
  app.use(express2.urlencoded({ limit: "50mb", extended: true }));
  registerOAuthRoutes(app);
  app.all("/api/calculate-shipping", calculateShippingHandler);
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext
    })
  );
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }
  await initializeProducts();
  const preferredPort = parseInt(process.env.PORT || "3000");
  const port = await findAvailablePort(preferredPort);
  if (port !== preferredPort) {
    console.log(`Port ${preferredPort} is busy, using port ${port} instead`);
  }
  server.listen(port, () => {
    console.log(`Server running on http://localhost:${port}/`);
  });
}
startServer().catch(console.error);
