import type { NextApiRequest, NextApiResponse } from 'next';

const API_URL = process.env.BACKEND_URL || 'http://localhost:5000';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const url = new URL(`${API_URL}/api/tasks`);

  // Forward query params for filtering
  if (req.method === 'GET') {
    for (const [key, val] of Object.entries(req.query)) {
      if (typeof val === 'string') {
        url.searchParams.set(key, val);
      }
    }
  }

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (req.headers.authorization) {
    headers['Authorization'] = req.headers.authorization;
  }

  try {
    const fetchRes = await fetch(url.toString(), {
      method: req.method,
      headers,
      body: ['POST', 'PUT'].includes(req.method || '') ? JSON.stringify(req.body) : undefined,
    });

    const data = await fetchRes.json();
    res.status(fetchRes.status).json(data);
  } catch {
    res.status(502).json({ message: 'Backend unavailable' });
  }
}
