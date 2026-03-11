import type { NextApiRequest, NextApiResponse } from 'next';

const API_URL = process.env.BACKEND_URL || 'http://localhost:5000';

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  const { id } = req.query;
  const url = `${API_URL}/api/tasks/${id}`;

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
      body: ['PUT', 'PATCH'].includes(req.method || '') ? JSON.stringify(req.body) : undefined,
    });

    const data = await fetchRes.json();
    res.status(fetchRes.status).json(data);
  } catch {
    res.status(502).json({ message: 'Backend unavailable' });
  }
}
