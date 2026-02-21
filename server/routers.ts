import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getAllProducts, getProductById, createOrder, getOrderByNumber, getAllOrders, updateOrderStatus, calculateShippingCost, initializeShippingRates } from "./db";
import { nanoid } from "nanoid";
import { calculateShipping } from "./melhorenvio";
import { calculateShippingByTable } from "./shipping-table";

export const appRouter = router({
  system: systemRouter,
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return {
        success: true,
      } as const;
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
      .input(
        z.object({
          destinationCEP: z.string().regex(/^\d{8}$/, 'CEP deve ter 8 dígitos'),
          sizeType: z.enum(['P', 'M', 'G']),
        })
      )
      .query(async ({ input }) => {
        const sizeMap: Record<string, { width: number; height: number; length: number; weight: number }> = {
          P: { width: 8, height: 8, length: 15, weight: 100 },
          M: { width: 10, height: 10, length: 23, weight: 150 },
          G: { width: 15, height: 15, length: 30, weight: 250 },
        };

        const dimensions = sizeMap[input.sizeType];

        try {
          // Try Melhor Envio API first
          console.log('[Shipping Router] Attempting API call to Melhor Envio');
          const apiResult = await calculateShipping({
            destinationCEP: input.destinationCEP,
            weight: dimensions.weight,
            height: dimensions.height,
            width: dimensions.width,
            length: dimensions.length,
          });

          // If API returns services, use them
          if (apiResult.services && apiResult.services.length > 0) {
            console.log('[Shipping Router] API returned', apiResult.services.length, 'services');
            
            // Convert API format to our format
            const services = apiResult.services.map(service => ({
              id: service.id,
              name: service.name,
              price: service.price,
              deliveryTime: service.delivery_time,
              company: service.company.name,
            }));

            // Add local pickup option
            services.push({
              id: 999,
              name: 'Retirar no Local',
              price: 0,
              deliveryTime: 0,
              company: 'Retirada em Mãos',
            });

            return {
              success: true,
              services,
              source: 'api',
            };
          }

          // If API returns error, fallback to table
          console.log('[Shipping Router] API returned no services, using fallback table');
          throw new Error('API returned no services');
        } catch (error: any) {
          // Fallback to static table
          console.log('[Shipping Router] API failed, using static table fallback');
          console.error('[Shipping Router] API Error:', error.message);
          
          try {
            const result = calculateShippingByTable(input.destinationCEP, input.sizeType);
            return {
              success: true,
              services: result.services,
              source: 'table',
            };
          } catch (tableError: any) {
            console.error('[Shipping Router] Table fallback also failed:', tableError);
            return {
              success: false,
              error: 'Erro ao calcular frete. Tente novamente.',
              services: [],
            };
          }
        }
      }),
  }),

  orders: router({
    create: publicProcedure
      .input(z.object({
        customerName: z.string().min(1),
        customerEmail: z.string().email().optional(),
        customerPhone: z.string().optional(),
        customerCep: z.string().optional(),
        productId: z.number(),
        quantity: z.number().min(1).default(1),
        subtotal: z.string(),
        shippingCost: z.string().optional(),
        totalPrice: z.string(),
        pixKey: z.string(),
      }))
      .mutation(async ({ input }) => {
        const orderNumber = `SA-${nanoid(8).toUpperCase()}`;
        const result = await createOrder({
          orderNumber,
          customerName: input.customerName,
          customerEmail: input.customerEmail || null,
          customerPhone: input.customerPhone || null,
          customerCep: input.customerCep || null,
          productId: input.productId,
          quantity: input.quantity,
          subtotal: input.subtotal as any,
          shippingCost: (input.shippingCost || "0") as any,
          totalPrice: input.totalPrice as any,
          pixKey: input.pixKey,
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
  }),
});

export type AppRouter = typeof appRouter;
