import type { NextApiRequest, NextApiResponse } from 'next';
import { Email } from '../../typings';
import { sanityClient } from './sanity';

type Data = {
  name: string
}

export default async function unsubEmail(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const body: Email = JSON.parse(req.body);
  const result: { _id: string, verified: boolean } = await sanityClient.fetch(`
  *[_type == "subEmail" && subEmail == $email][0] {
    _id,
    verified
  }
  `, { email: body.email });
  if (result?.verified) {
    await sanityClient.delete(result._id);
    res.status(200).end();
  } else {
    res.status(409).end();
  }
}
