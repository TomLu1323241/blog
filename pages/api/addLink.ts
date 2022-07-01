import type { NextApiRequest, NextApiResponse } from 'next';
import { Archive, LinkToAdd } from '../../typings';
import { sanityClient } from './sanity';
import { linkToImages } from '../shared functions/linkToImages';

export default async function addLink(
  req: NextApiRequest,
  res: NextApiResponse<Archive[]>
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
    if (body.link.toLowerCase().includes('reddit')) {
      body.link = body.link.substring(0, body.link.indexOf('?'));
    }
    await sanityClient.patch(queryResult._id).prepend('links', [body.link]).commit();
    const newArchives: Archive[] = await linkToImages([body.link]);
    res.status(200).json(newArchives);
    return;
  }
}