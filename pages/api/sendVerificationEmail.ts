// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
// Trying original sanity client fix at 2:26:55
import type { NextApiRequest, NextApiResponse } from 'next';
import { Email } from '../../typings';
import { sanityClient } from './sanity';

type Data = {
  name: string
}

function makeID(length: number): string {
  var result = '';
  var characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() *
      charactersLength));
  }
  return result;
}

export default async function createComment(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const body: Email = JSON.parse(req.body);
  await sanityClient.create({
    _type: 'subEmail',
    verified: false,
    subEmail: body.email,
    code: makeID(6),
  });
  console.log(body);
  res.status(200).json({ name: 'John Doe' });
}
