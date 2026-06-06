import crypto from 'node:crypto';
import { query, cors } from './_lib/db.js';

const TOKEN_HASH = '280c7a1fc2ea4d1e6cf7b25ad9a68989019b3612b00a8efaf30c8060de5875df';
const URL_MAP = {
  "/images/angels-collection.jpg": "https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/angels-collection-YyIjpjFfL4QwWQXzGcsJHqxfh3drU9.jpg",
  "/images/hero-banner.jpg": "https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/hero-banner-dk90LdYaCkSa3AmoLjZHM5HZ7mCNBC.jpg",
  "/images/logo-simplified.png": "https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/logo-simplified-u8oZdUZkuko3bNg1R9lUHFn1RVGkZP.png",
  "/images/logo-simplified_original.jpg": "https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/logo-simplified_original-6k6RREQbTw3CXmfAmRTCa3X1t5yST5.jpg",
  "/images/nossa-senhora-lourdes-edited.jpg": "https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/nossa-senhora-lourdes-edited-ghcaBoSv8EteE0AH6034FqMu1tO0Bg.jpg",
  "/images/nossa-senhora-lourdes-grande-branca-edited.jpg": "https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/nossa-senhora-lourdes-grande-branca-edited-Ea2ch8llEyXsKBCLBtHpDyLhFaxcic.jpg",
  "/images/nossa-senhora-lourdes-grande-branca-nobg.jpg": "https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/nossa-senhora-lourdes-grande-branca-nobg-waI5JWEtRw1u1TYbp2Uzr9FbRSmHX2.jpg",
  "/images/nossa-senhora-lourdes-grande-branca.jpg": "https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/nossa-senhora-lourdes-grande-branca-gj4PA8KR3ZN0uRTKixVjnXJYSc2cR5.jpg",
  "/images/nossa-senhora-lourdes-grande-marrom-edited.jpg": "https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/nossa-senhora-lourdes-grande-marrom-edited-u8UtRQmIl7pJ1LzkR6wwT7YenR1ohD.jpg",
  "/images/nossa-senhora-lourdes-grande-marrom-nobg.jpg": "https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/nossa-senhora-lourdes-grande-marrom-nobg-c4USOydhMls3zCLPSgURwBeV1hyZWt.jpg",
  "/images/nossa-senhora-lourdes-grande-marrom-real-edited.jpg": "https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/nossa-senhora-lourdes-grande-marrom-real-edited-Ehn3NKJNYV6Skl8N0Fhy6nobiibcRc.jpg",
  "/images/nossa-senhora-lourdes-grande-marrom.jpg": "https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/nossa-senhora-lourdes-grande-marrom-EFQjKlhRRuVuKV4DYhwcVxOp1ic2ha.jpg",
  "/images/nossa-senhora-lourdes-grande-verde-edited.jpg": "https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/nossa-senhora-lourdes-grande-verde-edited-6SImHDrHHT6bM6H2Qujra1eDQH5wVc.jpg",
  "/images/nossa-senhora-lourdes-grande-verde-nobg.jpg": "https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/nossa-senhora-lourdes-grande-verde-nobg-DpMLTKLAcLqqmHn0Jdqi8akcdloPPO.jpg",
  "/images/nossa-senhora-lourdes-grande-verde-real-edited.jpg": "https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/nossa-senhora-lourdes-grande-verde-real-edited-0Ik5hW6IDbIMa34CLbnEMHJs0INebQ.jpg",
  "/images/nossa-senhora-lourdes-grande-verde.jpg": "https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/nossa-senhora-lourdes-grande-verde-NJm1NIS5cjQhgtCV2AnrktfsYDixA0.jpg",
  "/images/nossa-senhora-lourdes-pequena-nobg.jpg": "https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/nossa-senhora-lourdes-pequena-nobg-lmau9BF18lyi0ubQgcWq9NcdzjoEjo.jpg",
  "/images/nossa-senhora-lourdes.jpg": "https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/nossa-senhora-lourdes-olGpVTRzSgzBWRpHp6yXqz2Ft7GkeK.jpg",
  "/images/sagrado-coracao-maria-edited.jpg": "https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/sagrado-coracao-maria-edited-2imolgLJ5gPEyb5PIhN48r01DTeKor.jpg",
  "/images/sagrado-coracao-maria-nobg.jpg": "https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/sagrado-coracao-maria-nobg-gFtJqBaynkM9cT0OnISQ7rapMvcMAR.jpg",
  "/images/sagrado-coracao-maria.jpg": "https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/sagrado-coracao-maria-8P0n84P36FmHzo38Pf4EuzDFieUvs8.jpg",
  "/images/saint-francis.jpg": "https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/saint-francis-Tuw8SaDTVfBMMQRL9HZyjjc4DgiJNg.jpg",
  "/images/saint-joseph.jpg": "https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/saint-joseph-MzRlSTuueaTmeGmUA39BjeM0DbXpEw.jpg",
  "/images/saint-michael.jpg": "https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/saint-michael-Q9D7DVbDYVQfiNMWwy3e9EF4f6AP2U.jpg",
  "/images/santa-gianna-edited.jpg": "https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/santa-gianna-edited-vTuEY3i5gBD24jyQASURCTD6hPHFBo.jpg",
  "/images/santa-hildegarda-bingen-edited.jpg": "https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/santa-hildegarda-bingen-edited-mfDRnJYqIkphH8udQ0MycpHILbfBmp.jpg",
  "/images/santa-hildegarda-bingen-nobg.jpg": "https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/santa-hildegarda-bingen-nobg-XNAO49nexXtb1WA6CwE1y0ZlBl4vw8.jpg",
  "/images/santa-hildegarda-verde-edited.jpg": "https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/santa-hildegarda-verde-edited-tvccoanBeEGefPeZ9h4krSUz2ujYTO.jpg",
  "/images/santa-hildegarda.jpg": "https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/santa-hildegarda-jHqvWr3UKIcy8H3IGo5uD7POuaAmlV.jpg",
  "/images/santo-antonio-edited.jpg": "https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/santo-antonio-edited-NxCDkiF8oyBe4giS3xCn5LzfmmpYxh.jpg",
  "/images/santo-antonio-nobg.jpg": "https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/santo-antonio-nobg-lWqCuzy57XC5qjT3pOuWAnSnD7ew1d.jpg",
  "/images/sao-bento-edited.jpg": "https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/sao-bento-edited-njSVGPUCr5Y09k3E2fa5PCwOG6AEGR.jpg",
  "/images/sao-francisco-assis-edited.jpg": "https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/sao-francisco-assis-edited-JEXREXGgBosVejVFyX3WdJC1YwxzNv.jpg",
  "/images/sao-francisco-assis-nobg.jpg": "https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/sao-francisco-assis-nobg-8Vfrehjmlalt48FeCZRddQAMEqD8NO.jpg",
  "/images/sao-francisco.jpg": "https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/sao-francisco-P3C4npnjrKLC5Zz8k75F4UoBgs67IT.jpg",
  "/images/sao-jose-coluna-edited.jpg": "https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/sao-jose-coluna-edited-lwWxV6v3yWxvhS8Aji5vNdXBVsrxJY.jpg",
  "/images/sao-jose-menino-jesus-edited.jpg": "https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/sao-jose-menino-jesus-edited-9TSBWNvnN5jFRfLz0pnq02udqr5VQL.jpg",
  "/images/sao-jose-menino-jesus-nobg.jpg": "https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/sao-jose-menino-jesus-nobg-mJsneu0xywdks1BlXs43iZctud27IQ.jpg",
  "/images/sao-jose-menino-jesus-real-edited.jpg": "https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/sao-jose-menino-jesus-real-edited-sNrWOPIWUJmFet0PGLVwaXen6uMK6q.jpg",
  "/images/sao-jose-original.jpeg": "https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/sao-jose-original-bbFopIDjH9WY76waUccdaPQqOMyQOD.jpeg",
  "/images/sao-jose.jpg": "https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/sao-jose-LUC0gYsNyDqsYGpZ0vLH1Vx3Sm6BBv.jpg",
  "/images/sao-josemaria-edited.jpg": "https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/sao-josemaria-edited-HKU0rNn4d3Nk0W3xA8bxHeik6tJduB.jpg",
  "/images/sao-miguel-medio-edited.jpg": "https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/images/sao-miguel-medio-edited-O9rcaTsIxXqRV79xcvpE3KLAK50jRp.jpg",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663261682973/sxaHLAFZvaIFKRwp.jpg": "https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/imported/sxaHLAFZvaIFKRwp-PRwXDDwTQ47u7zb5ToYTdI5k2NWGd6.jpg",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663261682973/xftApfIlgSkQYrlR.png": "https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/imported/xftApfIlgSkQYrlR-5OwMiD9pbDj3V3fZoXO1CBzSwr5HbU.webp",
  "https://files.manuscdn.com/user_upload_by_module/session_file/310519663261682973/GlEQeVeuQeQuarJA.png": "https://puqvgwfdbcravfwe.public.blob.vercel-storage.com/santos-anjos-3d/imported/GlEQeVeuQeQuarJA-ymTmoXq9ZAAXGhVnj15Kkj3iznA6Sx.webp"
};

function safeEqualToken(token) {
  if (!token || typeof token !== 'string') return false;
  const hash = crypto.createHash('sha256').update(token).digest('hex');
  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(TOKEN_HASH));
}

function replaceInString(value) {
  if (typeof value !== 'string') return { value, count: 0 };
  let next = value;
  let count = 0;
  for (const [oldUrl, newUrl] of Object.entries(URL_MAP)) {
    const variants = oldUrl.startsWith('/images/') ? [oldUrl, oldUrl.slice(1)] : [oldUrl];
    for (const variant of variants) {
      const before = next;
      next = next.split(variant).join(newUrl);
      if (next !== before) count += before.split(variant).length - 1;
    }
  }
  return { value: next, count };
}

function parseColors(value) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try { return JSON.parse(value); } catch { return []; }
}

function updateColors(colorsRaw) {
  const colors = parseColors(colorsRaw);
  let count = 0;
  const next = colors.map((color) => {
    if (!color || typeof color !== 'object') return color;
    const copy = { ...color };
    const imageResult = replaceInString(copy.image);
    copy.image = imageResult.value;
    count += imageResult.count;
    return copy;
  });
  return { value: JSON.stringify(next), count };
}

export default async function handler(req, res) {
  cors(res);
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const token = req.headers['x-migration-token'] || req.body?.token || req.query?.token;
  if (!safeEqualToken(Array.isArray(token) ? token[0] : token)) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const dryRun = req.query?.dryRun === '1' || req.body?.dryRun === true;
  const products = await query('SELECT id, name, image, colors FROM products ORDER BY id ASC');
  const report = {
    dryRun,
    productsScanned: products.length,
    productsChanged: 0,
    replacements: 0,
    changedProducts: [],
  };

  for (const product of products) {
    const imageResult = replaceInString(product.image);
    const colorsResult = updateColors(product.colors);
    const total = imageResult.count + colorsResult.count;
    if (!total) continue;

    report.productsChanged += 1;
    report.replacements += total;
    report.changedProducts.push({
      id: product.id,
      name: product.name,
      replacements: total,
      imageChanged: imageResult.count > 0,
      colorsChanged: colorsResult.count > 0,
      newImage: imageResult.value,
    });

    if (!dryRun) {
      await query(
        'UPDATE products SET image = ?, colors = ?, updatedAt = NOW() WHERE id = ?',
        [imageResult.value, colorsResult.value, product.id]
      );
    }
  }

  return res.status(200).json(report);
}
