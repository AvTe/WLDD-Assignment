import type { NextApiRequest, NextApiResponse } from 'next';

const API_URL = process.env.BACKEND_URL || 'http://localhost:5000';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { path } = req.query;
  const subPath = Array.isArray(path) ? path.join('/') : path;
  const url = `${API_URL}/api/auth/${subPath}`;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
  };

  if (req.headers.authorization) {
    headers['Authorization'] = req.headers.authorization;
  }

  try {
    const fetchRes = await fetch(url, {
      method: req.method,
      headers,
      body: req.method !== 'GET' ? JSON.stringify(req.body) : undefined,
    });

    const data = await fetchRes.json();
    res.status(fetchRes.status).json(data);
  } catch {
    res.status(502).json({ message: 'Backend unavailable' });
  }
}
