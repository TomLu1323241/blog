// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
// Trying original sanity client fix at 2:26:55
import type { NextApiRequest, NextApiResponse } from 'next';
import { BlogComment } from '../../typings';
import { sanityClient } from './sanity';

type Data = {
  name: string
}

export default async function createComment(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const body: BlogComment = JSON.parse(req.body);
  await sanityClient.create({
    _type: 'comment',
    post: {
      _type: 'reference',
      _ref: body._id,
    },
    approved: true,
    author: body.author,
    comment: body.comment,
  });
  console.log(body);
  res.status(200).json({ name: 'John Doe' });
}
