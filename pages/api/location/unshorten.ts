import { NextApiRequest, NextApiResponse } from 'next';
import { tall } from 'tall';

async function POST(req: NextApiRequest, res: NextApiResponse) {
  const { url } = req.body;
  try {
    const unshortened = await tall(url);
    res.status(200).send(unshortened);
  } catch {
    res.status(400).send('cant unshorten');
  }
  return;
}

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse
) {
  if (req.method === 'POST') {
    await POST(req, res);
  }
}
