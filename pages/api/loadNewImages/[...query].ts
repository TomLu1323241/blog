// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { sanityClient } from '../sanity';
import { Media } from '../../../shared/typings';
import { linkToImages } from '../../../shared/linkToImages';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<[Media[], number, boolean]>
) {
  const query = req.query['query'] as string[];
  const slug = query[0];
  const index = parseInt(query[1]);
  const arrayProperties: { size: number } = await sanityClient.fetch(`
  *[_type == "archives" && slug.current == '${slug}'][0] {
    'size' : count(links)
  }`
  );
  const queryDB = `
  *[_type == "archives" && slug.current == '${slug}'][0] {
    _id,
    links[${arrayProperties.size - index - 10 > 0 ? arrayProperties.size - index - 10 : 0}...${arrayProperties.size - index - 10 > 0 ? arrayProperties.size - index : arrayProperties.size - index}],
  }
  `;
  const result = await sanityClient.fetch(queryDB);
  if (result.links.length === 0) {
    res.status(404).end();
    return;
  }
  result.links.reverse();
  const startingLength = result.links.length;
  const [archives, badLinks]: [Media[], string[]] = await linkToImages(result.links);
  await Promise.all(badLinks.map(async (link) => {
    await sanityClient.patch(result._id).unset(['links[0]', `links[_key=="${link}"]`]).commit();
  }));
  res.status(200).json([archives, startingLength - badLinks.length, arrayProperties.size - index - 10 > 0]);
}
