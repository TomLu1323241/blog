// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { sanityClient } from '../sanity';
import { Archive } from '../../../typings';
import { linkToImages } from '../linkToImagesBack';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<[Archive[], number]>
) {
  const { query } = req.query;
  const slug = query[0];
  const index = parseInt(query[1]);
  const queryDB = `
  *[_type == "archives" && slug.current == $slug][0] {
    _id,
    links[${index}...${index + 10}],
  }
  `;
  const result = await sanityClient.fetch(queryDB, { slug });
  if (result.links.length === 0) {
    res.status(404).end();
    return;
  }
  const [archives, badEntries]: [Archive[], number[]] = await linkToImages(result.links);
  await Promise.all(badEntries.map(async (indexToRemove) => {
    await sanityClient.patch(result._id).splice('links', indexToRemove + index, 1, []).commit();
  }));
  console.log(badEntries);
  res.status(200).json([archives, 10 - badEntries.length]);
}
