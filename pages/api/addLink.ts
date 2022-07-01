import type { NextApiRequest, NextApiResponse } from 'next';
import { LinkToAdd } from '../../typings';
import { sanityClient } from './sanity';

type Data = {
  name: string
}

export default async function addLink(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const body: LinkToAdd = JSON.parse(req.body);
  const queryResult: { _id: string, contains: boolean } = await sanityClient.fetch(`
  *[_type == "archives" && slug.current == '${body.slug}'][0] {
    _id,
    'contain': '${body.link}' in links
  }
  `);
  if (queryResult.contains) {
    res.status(416).end();
    return;
  } else {
    await sanityClient.patch(queryResult._id).prepend('links', [body.link]).commit();
    res.status(200).end();
    return;
  }
}