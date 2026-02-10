import { router, publicProcedure } from '../_core/trpc';
import { z } from 'zod';
import { calculateShipping } from '../melhorenvio';

export const shippingRouter = router({
  calculateShipping: publicProcedure
    .input(
      z.object({
        destinationCEP: z.string().regex(/^\d{8}$/, 'CEP deve ter 8 dígitos'),
        sizeType: z.enum(['P', 'M', 'G']),
      })
    )
    .query(async ({ input }) => {
      // Map size to dimensions and weight
      const sizeMap: Record<string, { width: number; height: number; length: number; weight: number }> = {
        P: { width: 8, height: 8, length: 15, weight: 100 },
        M: { width: 10, height: 10, length: 23, weight: 150 },
        G: { width: 15, height: 15, length: 30, weight: 250 },
      };

      const dimensions = sizeMap[input.sizeType];

      try {
        const result = await calculateShipping({
          destinationCEP: input.destinationCEP,
          weight: dimensions.weight,
          height: dimensions.height,
          width: dimensions.width,
          length: dimensions.length,
        });

        if (result.error) {
          return {
            success: false,
            error: result.error,
            services: [],
          };
        }

        // Format services for frontend
        const services = result.services.map((service) => ({
          id: service.id,
          name: service.name,
          price: service.price,
          deliveryTime: service.delivery_time,
          company: service.company.name,
        }));

        return {
          success: true,
          services,
        };
      } catch (error: any) {
        console.error('[Shipping Router] Error:', error);
        return {
          success: false,
          error: 'Erro ao calcular frete. Tente novamente.',
          services: [],
        };
      }
    }),
});
