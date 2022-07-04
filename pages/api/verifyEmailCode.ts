import type { NextApiRequest, NextApiResponse } from 'next';
import { EmailCode } from '../../shared/typings';
import { sanityClient } from './sanity';

type Data = {
  name: string
}

export default async function verifyEmailCode(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const body: EmailCode = JSON.parse(req.body);
  body.email = body.email.toLowerCase();
  const result: { _id: string, code: string } = await sanityClient.fetch(`
  *[_type == "subEmail" && 
    subEmail == $email][0] {
    _id,
    code
  }
  `, { email: body.email });
  if (result.code === body.code) {
    await sanityClient.patch(result._id).set({ verified: true }).commit();
    res.status(200).end();
  } else {
    res.status(409).end();
  }
}
