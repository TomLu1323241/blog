import type { NextApiRequest, NextApiResponse } from 'next';
import { Email, Post } from '../../typings';
import { sanityClient, urlFor } from './sanity';
import { sendMail } from './sendMail';

type Data = {
  name: string
}

export default async function createComment(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  if (req.headers.authorization?.split(' ')[1] !== process.env.SECRET_STRING) {
    res.status(418).end();
  }
  let results: Post[] = await sanityClient.fetch(`
  *[_type == "post"] | order(_createdAt desc) {
    _createdAt,
    title,
    author -> {
      name,
    },
    description,
    mainImage,
    slug {
      current
    }
  }
  `);
  // minus 7 days
  const oldest = new Date();
  oldest.setDate(oldest.getDate() - 7);
  results = results.filter((post: Post) => new Date(post._createdAt) > oldest);
  if (results.length === 0) {
    res.status(200).end();
    return;
  }
  const emails: { subEmail: string }[] = await sanityClient.fetch(`
  *[_type == 'subEmail' && verified == true] {
    subEmail,
  }
  `);
  await sendMail(true,
    emails.map(item => item.subEmail),
    results.length === 1 ? `Check out the new post on Tom's Blog '${results[0].title}'` : `There's a bunch of new posts from Tom's Blog`,
    false,
    `
    <!doctype html>
    <html ⚡4email>
      <head>
        <meta charset="utf-8">
      </head>
      <body>
        ${results.map((item) => `
          <a href='https://www.tomlu.me/post/${item.slug.current}'>https://www.tomlu.me/post/${item.slug.current}</a><br>
        `).join('')}
      </body>
    </html>
    `
  );
  res.status(200).end();
}
