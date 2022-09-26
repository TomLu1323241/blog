// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { sanityClient } from '../sanity';
import { Media } from '../../../shared/typings';
import { linkToImages } from '../../../shared/linkToImages';
import { FETCH_SIZE } from '../../../shared/consts';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Media[]>
) {
  const query = req.query['query'] as string[];
  const slug = query[0];
  const index = parseInt(query[1]);
  const queryDB = `
  *[_type == "archives" && slug.current == '${slug}'][0] {
    _id,
    links[${index}...${index + FETCH_SIZE}],
  }
  `;
  const result = await sanityClient.fetch(queryDB);
  if (result.links.length === 0) {
    res.status(404).end();
    return;
  }
  const archives: Media[] = await linkToImages(result.links);
  res.status(200).json(archives);
}
