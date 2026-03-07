import "dotenv/config";
import express from "express";
import { createServer } from "http";
import net from "net";
import { createExpressMiddleware } from "@trpc/server/adapters/express";
import { registerOAuthRoutes } from "./oauth";
import { appRouter } from "../routers";
import { createContext } from "./context";
import { serveStatic, setupVite } from "./vite";
import { initializeProducts } from "../db";

// URL correta da API do Melhor Envio
const MELHOR_ENVIO_URL = 'https://melhorenvio.com.br/api/v2/me/shipment/calculate';

async function calculateShippingHandler(req: express.Request, res: express.Response) {
  // CORS headers
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { to_postal_code, packages } = req.body;

  if (!to_postal_code || !packages) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  const MELHOR_ENVIO_TOKEN = process.env.MELHOR_ENVIO_TOKEN;
  const ORIGIN_CEP = process.env.MELHOR_ENVIO_ORIGIN_CEP || '89227320';

  // Converter packages para volumes (formato correto da API do Melhor Envio)
  const volumes = (packages as any[]).map((pkg: any) => ({
    height: pkg.height || 15,
    width: pkg.width || 15,
    length: pkg.length || 30,
    weight: pkg.weight || 0.5
  }));

  if (MELHOR_ENVIO_TOKEN) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 15000);

      const meResponse = await fetch(MELHOR_ENVIO_URL, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${MELHOR_ENVIO_TOKEN}`,
          'User-Agent': 'Santos Anjos 3D (contato@santosanjos3d.com.br)'
        },
        body: JSON.stringify({
          from: { postal_code: ORIGIN_CEP },
          to: { postal_code: to_postal_code },
          volumes
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (meResponse.ok) {
        const data = await meResponse.json() as any[];

        if (Array.isArray(data)) {
          // IDs das transportadoras permitidas: SEDEX, Jadlog .Package, JeT Standard
          const ALLOWED_IDS = [2, 3, 33];

          const services = data
            .filter((s: any) => ALLOWED_IDS.includes(s.id) && s.price && !s.error)
            .map((s: any) => ({
              id: s.id,
              name: s.name,
              company: s.company?.name || s.company,
              price: s.price,
              delivery_time: s.delivery_time,
              currency: 'R$'
            }));

          services.push({
            id: 'retirada-local',
            name: 'Retirada no Local',
            company: 'Santos Anjos 3D',
            price: '0.00',
            delivery_time: 0,
            currency: 'R$'
          });

          if (services.length > 1) {
            return res.status(200).json(services);
          }
        }
      }

      console.error('[Shipping] Melhor Envio retornou status:', meResponse.status);
    } catch (error: any) {
      console.error('[Shipping] Erro ao chamar Melhor Envio:', error.message);
    }
  }

  // Fallback com valores estimados
  return res.status(200).json([
    { id: 'pac', name: 'PAC (estimativa)', company: 'Correios', price: '15.00', delivery_time: 10, currency: 'R$' },
    { id: 'sedex', name: 'SEDEX (estimativa)', company: 'Correios', price: '25.00', delivery_time: 5, currency: 'R$' },
    { id: 'retirada-local', name: 'Retirada no Local', company: 'Santos Anjos 3D', price: '0.00', delivery_time: 0, currency: 'R$' }
  ]);
}

function isPortAvailable(port: number): Promise<boolean> {
  return new Promise(resolve => {
    const server = net.createServer();
    server.listen(port, () => {
      server.close(() => resolve(true));
    });
    server.on("error", () => resolve(false));
  });
}

async function findAvailablePort(startPort: number = 3000): Promise<number> {
  for (let port = startPort; port < startPort + 20; port++) {
    if (await isPortAvailable(port)) {
      return port;
    }
  }
  throw new Error(`No available port found starting from ${startPort}`);
}

async function startServer() {
  const app = express();
  const server = createServer(app);
  // Configure body parser with larger size limit for file uploads
  app.use(express.json({ limit: "50mb" }));
  app.use(express.urlencoded({ limit: "50mb", extended: true }));
  // OAuth callback under /api/oauth/callback
  registerOAuthRoutes(app);
  // Shipping calculation endpoint (also served as Vercel Function in production)
  app.all('/api/calculate-shipping', calculateShippingHandler);
  // tRPC API
  app.use(
    "/api/trpc",
    createExpressMiddleware({
      router: appRouter,
      createContext,
    })
  );
  // development mode uses Vite, production mode uses static files
  if (process.env.NODE_ENV === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Initialize products on startup
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
