// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
// Trying original sanity client fix at 2:26:55
import type { NextApiRequest, NextApiResponse } from 'next';
import { sanityClient } from '../../sanity';
import { BlogComment } from '../../typings';

type Data = {
  name: string
}

export default function createComment(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const body: BlogComment = JSON.parse(req.body);
  sanityClient.create({
    _type: 'comment',
    post: {
      _type: 'reference',
      _ref: body._id,
    },
    approved: false,
    author: body.author,
    email: body.email,
    comment: body.comment,
  })
  console.log(body);
  res.status(200).json({ name: 'John Doe' })
}
