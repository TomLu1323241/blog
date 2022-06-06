// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
// Trying original sanity client fix at 2:26:55
import { STATUS_CODES } from 'http';
import type { NextApiRequest, NextApiResponse } from 'next';
import { Email, EmailCode } from '../../typings';
import { sanityClient } from './sanity';

type Data = {
  name: string
}

export default async function createComment(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const body: EmailCode = JSON.parse(req.body);
  const result: { _id: string, code: string } = await sanityClient.fetch(`
  *[_type == "subEmail" && 
    subEmail == $email][0] {
    _id,
    code
  }
  `, { email: body.email });
  if (result.code === body.code) {
    res.status(200).end();
    console.log('need to change to accept');
    await sanityClient.patch(result._id).set({ verified: true }).commit();
  } else {
    res.status(418).end();
  }
  console.log(result);
  console.log(body);
}