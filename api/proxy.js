// Vercel serverless proxy for Cloud Run
// Set CLOUD_RUN_URL in Vercel to your Cloud Run HTTPS URL (e.g., https://SERVICE-REGION.a.run.app)

export default async function handler(req, res) {
  const targetBase = process.env.CLOUD_RUN_URL;
  if (!targetBase) {
    res.status(500).json({ error: 'CLOUD_RUN_URL not set on Vercel' });
    return;
  }
  const target = targetBase.replace(/\/$/, '') + req.url;

  const getRawBody = (request) => new Promise((resolve, reject) => {
    const chunks = [];
    request.on('data', (c) => chunks.push(c));
    request.on('end', () => resolve(Buffer.concat(chunks)));
    request.on('error', reject);
  });

  let body;
  if (req.method && req.method !== 'GET' && req.method !== 'HEAD') {
    body = await getRawBody(req);
    if (body.length === 0) body = undefined;
  }

  const headers = { ...req.headers };
  delete headers.host;

  try {
    const fetchRes = await fetch(target, {
      method: req.method,
      headers,
      body,
      redirect: 'manual',
    });

    res.status(fetchRes.status);
    fetchRes.headers.forEach((v, k) => {
      if (k.toLowerCase() === 'content-encoding') return;
      res.setHeader(k, v);
    });

    const ab = await fetchRes.arrayBuffer();
    res.send(Buffer.from(ab));
  } catch (err) {
    console.error('proxy error', err);
    res.status(502).json({ error: 'Bad gateway', details: String(err) });
  }
}
