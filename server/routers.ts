import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { getAllProducts, getProductById, createOrder, getOrderByNumber, getAllOrders, updateOrderStatus } from "./db";
import { nanoid } from "nanoid";

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

  orders: router({
    create: publicProcedure
      .input(z.object({
        customerName: z.string().min(1),
        customerEmail: z.string().email().optional(),
        customerPhone: z.string().optional(),
        productId: z.number(),
        quantity: z.number().min(1).default(1),
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
          productId: input.productId,
          quantity: input.quantity,
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
