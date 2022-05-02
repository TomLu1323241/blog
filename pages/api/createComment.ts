// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
// Trying original sanity client fix at 2:26:55
import type { NextApiRequest, NextApiResponse } from 'next';
import { createClient } from 'next-sanity';
import { BlogComment } from '../../typings';

type Data = {
  name: string
}

export default function createComment(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const body: BlogComment = JSON.parse(req.body);
  const config = {
    dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
    projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
    token: process.env.SANITY_API_TOKEN,
    apiVersion: '2021-03-25',
    useCdn: process.env.USE_CDN == '1',
  };

  const sanityClient = createClient(config);
  sanityClient.create({
    _type: 'comment',
    post: {
      _type: 'reference',
      _ref: body._id,
    },
    approved: false,
    author: body.author,
    comment: body.comment,
  });
  console.log(body);
  res.status(200).json({ name: 'John Doe' });
}
