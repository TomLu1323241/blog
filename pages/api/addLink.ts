import type { NextApiRequest, NextApiResponse } from 'next';
import { Media, LinkToAdd } from '../../shared/typings';
import { sanityClient } from './sanity';
import { linkToImages } from '../../shared/linkToImages';

export default async function addLink(
  req: NextApiRequest,
  res: NextApiResponse<Media[]>
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
    if (body.link.toLowerCase().includes('reddit') && body.link.includes('?')) {
      body.link = body.link.substring(0, body.link.indexOf('?'));
    }
    const newArchives: Media[] = (await linkToImages([body.link]))[0];
    if (newArchives.length === 0) {
      res.status(416).end();
      return;
    }
    await sanityClient.patch(queryResult._id).append('links', [body.link]).commit();
    await res.revalidate(`/media/${body.slug}`);
    res.status(200).json(newArchives);
    return;
  }
}