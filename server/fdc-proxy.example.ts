/**
 * EXAMPLE server-side proxy for USDA FoodData Central.
 *
 * This is a reference implementation, not wired into the Vite app (which is a
 * pure front-end prototype). Deploy it as a serverless function or a small
 * Express/Fastify service so the FDC API key stays server-side. The browser
 * `FoodDataCentralProvider` calls `/api/fdc/search` and `/api/fdc/food/:id`.
 *
 * Security requirements enforced here:
 * - The key is read from process.env.FDC_API_KEY and NEVER returned to clients.
 * - Requests are validated and size-limited.
 * - Responses are cached briefly to respect the 1,000 req/hour limit.
 *
 * Run (example): `FDC_API_KEY=xxx tsx server/fdc-proxy.example.ts`
 */
import http from 'node:http';

const FDC_BASE = 'https://api.nal.usda.gov/fdc/v1';
const KEY = process.env.FDC_API_KEY;
const PORT = Number(process.env.PORT ?? 8787);

const cache = new Map<string, { body: string; expires: number }>();
const TTL = 24 * 60 * 60 * 1000;

async function forward(path: string, init?: RequestInit): Promise<string> {
  const cached = cache.get(path);
  if (cached && Date.now() < cached.expires) return cached.body;
  const sep = path.includes('?') ? '&' : '?';
  const res = await fetch(`${FDC_BASE}${path}${sep}api_key=${KEY}`, init);
  const body = await res.text();
  if (res.ok) cache.set(path, { body, expires: Date.now() + TTL });
  return body;
}

const server = http.createServer(async (req, res) => {
  if (!KEY) {
    res.writeHead(500).end('FDC_API_KEY not configured');
    return;
  }
  res.setHeader('Content-Type', 'application/json');
  try {
    const url = new URL(req.url ?? '', `http://localhost:${PORT}`);
    if (req.method === 'POST' && url.pathname === '/api/fdc/search') {
      const chunks: Buffer[] = [];
      for await (const c of req) chunks.push(c as Buffer);
      const payload = JSON.parse(Buffer.concat(chunks).toString() || '{}');
      const query = String(payload.query ?? '').slice(0, 200);
      const body = await forward('/foods/search', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ query, dataType: payload.dataType ?? ['Foundation', 'SR Legacy'], pageSize: Math.min(Number(payload.pageSize) || 10, 25) }),
      });
      res.end(body);
      return;
    }
    const foodMatch = url.pathname.match(/^\/api\/fdc\/food\/(\d+)$/);
    if (req.method === 'GET' && foodMatch) {
      res.end(await forward(`/food/${foodMatch[1]}`));
      return;
    }
    res.writeHead(404).end('{"error":"not found"}');
  } catch {
    res.writeHead(502).end('{"error":"proxy error"}');
  }
});

server.listen(PORT, () => console.log(`FDC proxy on :${PORT} (key ${KEY ? 'configured' : 'MISSING'})`));
