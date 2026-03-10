import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { protectedProcedure, publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { parse as parseCookies } from "cookie";
import { ENV } from "./_core/env";

const ADMIN_COOKIE = "sa3d_admin_token";
const ADMIN_TOKEN_SECRET = new TextEncoder().encode(
  (ENV.cookieSecret || "fallback-secret-change-me") + "-admin"
);

// Helper para ler cookie do admin sem depender de cookie-parser
function getAdminCookie(req: any): string | undefined {
  const cookieHeader = req.headers?.cookie;
  if (!cookieHeader) return undefined;
  const parsed = parseCookies(cookieHeader);
  return parsed[ADMIN_COOKIE];
}

import {
  getAllProducts,
  getProductById,
  createOrder,
  getOrderByNumber,
  getOrderById,
  getAllOrders,
  updateOrderStatus,
  updateOrderLabelInfo,
  deleteOrder,
  calculateShippingCost,
  initializeShippingRates,
} from "./db";
import { nanoid } from "nanoid";
import { calculateShipping } from "./melhorenvio";
import { calculateShippingByTable } from "./shipping-table";
import { generateLabelForOrder, trackMelhorEnvioShipment } from "./melhorenvio-labels";
import { TRPCError } from "@trpc/server";

export const appRouter = router({
  system: systemRouter,

  admin: router({
    /**
     * Login do painel admin com e-mail e senha
     */
    login: publicProcedure
      .input(z.object({
        email: z.string().email(),
        password: z.string().min(1),
      }))
      .mutation(async ({ input, ctx }) => {
        const adminEmail = ENV.adminEmail;
        const adminHash = ENV.adminPasswordHash;

        if (!adminEmail || !adminHash) {
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Admin não configurado' });
        }

        if (input.email !== adminEmail) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Credenciais inválidas' });
        }

        // Suporta tanto senha em texto simples quanto hash bcrypt
        let valid = false;
        if (adminHash.startsWith('$2b$') || adminHash.startsWith('$2a$')) {
          valid = await bcrypt.compare(input.password, adminHash);
        } else {
          // Senha armazenada em texto simples (comparação direta)
          valid = input.password === adminHash;
        }
        if (!valid) {
          throw new TRPCError({ code: 'UNAUTHORIZED', message: 'Credenciais inválidas' });
        }

        const token = await new SignJWT({ role: 'admin', email: input.email })
          .setProtectedHeader({ alg: 'HS256' })
          .setExpirationTime('7d')
          .sign(ADMIN_TOKEN_SECRET);

        const isProduction = ENV.isProduction;
        ctx.res.cookie(ADMIN_COOKIE, token, {
          httpOnly: true,
          secure: isProduction,
          sameSite: 'lax',
          maxAge: 7 * 24 * 60 * 60 * 1000,
          path: '/',
        });

        return { success: true };
      }),

    /**
     * Logout do painel admin
     */
    logout: publicProcedure.mutation(({ ctx }) => {
      ctx.res.clearCookie(ADMIN_COOKIE, { path: '/' });
      return { success: true };
    }),

    /**
     * Verificar se está autenticado como admin
     */
    check: publicProcedure.query(async ({ ctx }) => {
      const token = getAdminCookie(ctx.req);
      if (!token) return { authenticated: false };
      try {
        await jwtVerify(token, ADMIN_TOKEN_SECRET);
        return { authenticated: true };
      } catch {
        return { authenticated: false };
      }
    }),
  }),

  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  products: router({
    list: publicProcedure.query(() => getAllProducts()),
    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(({ input }) => getProductById(input.id)),
  }),

  shipping: router({
    calculateCost: publicProcedure
      .input(z.object({ cep: z.string(), weight: z.number() }))
      .query(async ({ input }) => calculateShippingCost(input.cep, input.weight)),
    initialize: publicProcedure.mutation(async () => {
      await initializeShippingRates();
      return { success: true };
    }),
    calculateMelhorEnvio: publicProcedure
      .input(z.object({
        destinationCEP: z.string().regex(/^\d{8}$/, 'CEP deve ter 8 dígitos'),
        sizeType: z.enum(['P', 'M', 'G']),
      }))
      .query(async ({ input }) => {
        const sizeMap: Record<string, { width: number; height: number; length: number; weight: number }> = {
          P: { width: 8, height: 8, length: 15, weight: 100 },
          M: { width: 10, height: 10, length: 23, weight: 150 },
          G: { width: 15, height: 15, length: 30, weight: 250 },
        };
        const dimensions = sizeMap[input.sizeType];
        try {
          const apiResult = await calculateShipping({
            destinationCEP: input.destinationCEP,
            weight: dimensions.weight,
            height: dimensions.height,
            width: dimensions.width,
            length: dimensions.length,
          });
          if (apiResult.services && apiResult.services.length > 0) {
            const services = apiResult.services.map(service => ({
              id: service.id,
              name: service.name,
              price: service.price,
              deliveryTime: service.delivery_time,
              company: service.company.name,
            }));
            services.push({ id: 999, name: 'Retirar no Local', price: 0, deliveryTime: 0, company: 'Retirada em Mãos' });
            return { success: true, services, source: 'api' };
          }
          throw new Error('API returned no services');
        } catch (error: any) {
          try {
            const result = calculateShippingByTable(input.destinationCEP, input.sizeType);
            return { success: true, services: result.services, source: 'table' };
          } catch (tableError: any) {
            return { success: false, error: 'Erro ao calcular frete. Tente novamente.', services: [] };
          }
        }
      }),
  }),

  orders: router({
    /**
     * Criar pedido completo com endereço (novo fluxo com etiqueta)
     */
    createFull: publicProcedure
      .input(z.object({
        customerName: z.string().min(1),
        customerPhone: z.string().min(1),
        customerDocument: z.string().min(11, 'CPF inválido'),
        addressPostalCode: z.string().min(8),
        addressStreet: z.string().min(1),
        addressNumber: z.string().min(1),
        addressComplement: z.string().optional(),
        addressDistrict: z.string().min(1),
        addressCity: z.string().min(1),
        addressState: z.string().length(2),
        shippingServiceId: z.number().optional(),
        shippingServiceName: z.string().optional(),
        shippingCompany: z.string().optional(),
        subtotal: z.string(),
        shippingCost: z.string(),
        totalPrice: z.string(),
        itemsSummary: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
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
          subtotal: input.subtotal as any,
          shippingCost: input.shippingCost as any,
          totalPrice: input.totalPrice as any,
          itemsSummary: input.itemsSummary || null,
          status: 'pending',
        });
        const order = await getOrderByNumber(orderNumber);
        if (!order) throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: 'Erro ao criar pedido' });
        return order;
      }),

    /**
     * Criar pedido simples (legado)
     */
    create: publicProcedure
      .input(z.object({
        customerName: z.string().min(1),
        customerEmail: z.string().email().optional(),
        customerPhone: z.string().optional(),
        productId: z.number().optional(),
        quantity: z.number().min(1).default(1),
        subtotal: z.string(),
        shippingCost: z.string().optional(),
        totalPrice: z.string(),
        pixKey: z.string().optional(),
      }))
      .mutation(async ({ input }) => {
        const orderNumber = `SA-${nanoid(8).toUpperCase()}`;
        await createOrder({
          orderNumber,
          customerName: input.customerName,
          customerEmail: input.customerEmail || null,
          customerPhone: input.customerPhone || null,
          subtotal: input.subtotal as any,
          shippingCost: (input.shippingCost || "0") as any,
          totalPrice: input.totalPrice as any,
          status: "pending",
        });
        const order = await getOrderByNumber(orderNumber);
        return order;
      }),

    getByNumber: publicProcedure
      .input(z.object({ orderNumber: z.string() }))
      .query(({ input }) => getOrderByNumber(input.orderNumber)),

    list: publicProcedure.query(() => getAllOrders()),

    updateStatus: publicProcedure
      .input(z.object({ orderId: z.number(), status: z.string() }))
      .mutation(({ input }) => updateOrderStatus(input.orderId, input.status)),

    /**
     * Gerar etiqueta via Melhor Envio (ação do admin)
     * Fluxo: adiciona ao carrinho ME → compra → gera → retorna URL do PDF
     */
    generateLabel: publicProcedure
      .input(z.object({ orderId: z.number() }))
      .mutation(async ({ input }) => {
        const order = await getOrderById(input.orderId);
        if (!order) throw new TRPCError({ code: 'NOT_FOUND', message: 'Pedido não encontrado' });

        if (!order.addressPostalCode || !order.addressStreet || !order.addressCity) {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Pedido sem endereço completo para gerar etiqueta' });
        }

        if (order.shippingServiceId === null && order.shippingServiceName !== 'Retirada no Local') {
          throw new TRPCError({ code: 'BAD_REQUEST', message: 'Pedido sem serviço de frete selecionado' });
        }

        // Se for retirada local, não gera etiqueta
        if (order.shippingServiceName === 'Retirada no Local' || order.shippingServiceId === null) {
          await updateOrderLabelInfo(order.id, { status: 'processing' });
          return { success: true, labelUrl: null, message: 'Pedido de retirada no local — sem etiqueta necessária' };
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
            totalPrice: String(order.totalPrice),
          });

          await updateOrderLabelInfo(order.id, {
            melhorEnvioOrderId,
            labelUrl,
            status: 'processing',
          });

          return { success: true, labelUrl, melhorEnvioOrderId };
        } catch (err: any) {
          console.error('[generateLabel] Erro:', err.message);
          throw new TRPCError({ code: 'INTERNAL_SERVER_ERROR', message: err.message });
        }
      }),

    /**
     * Deletar pedido (ação do admin)
     */
    delete: publicProcedure
      .input(z.object({ orderId: z.number() }))
      .mutation(async ({ input }) => {
        const order = await getOrderById(input.orderId);
        if (!order) throw new TRPCError({ code: 'NOT_FOUND', message: 'Pedido não encontrado' });
        await deleteOrder(input.orderId);
        return { success: true };
      }),

    /**
     * Buscar rastreio de um pedido
     */
    getTracking: publicProcedure
      .input(z.object({ orderId: z.number() }))
      .query(async ({ input }) => {
        const order = await getOrderById(input.orderId);
        if (!order) throw new TRPCError({ code: 'NOT_FOUND', message: 'Pedido não encontrado' });
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
      }),
  }),
});

export type AppRouter = typeof appRouter;
