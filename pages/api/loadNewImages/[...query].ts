// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
import type { NextApiRequest, NextApiResponse } from 'next';
import { sanityClient } from '../sanity';
import { Archive } from '../../../typings';
import { linkToImages } from '../linkToImagesBack';

export default async function handler(
  req: NextApiRequest,
  res: NextApiResponse<Archive[]>
) {
  const { query } = req.query;
  const slug = query[0];
  const index = parseInt(query[1]);
  const queryDB = `
  *[_type == "archives" && slug.current == $slug][0] {
    links[${index}...${index + 10}],
  }
  `;
  console.log(query);
  const result = await sanityClient.fetch(queryDB, { slug });
  if (result.links.length === 0) {
    res.status(404).end();
    return;
  }
  const archives: Archive[] = await linkToImages(result.links);
  res.status(200).json(archives);
}
