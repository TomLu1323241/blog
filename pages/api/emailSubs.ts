import type { NextApiRequest, NextApiResponse } from 'next';
import { Email, Post } from '../../typings';
import { sanityClient, urlFor } from './sanity';
import nodemailer from 'nodemailer';

type Data = {
  name: string
}

export default async function createComment(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
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
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS
    }
  });
  const mailOptions = {
    from: process.env.EMAIL,
    bcc: emails.map(item => item.subEmail).join(','),
    subject: results.length === 1 ? `Check out the new post on Tom's Blog '${results[0].title}'` : `There's a bunch of new posts one Tom's Blog`,
    html: `
    <!doctype html>
    <html ⚡4email>
      <head>
        <meta charset="utf-8">
      </head>
      <body>
        ${results.map((item) => `
          <a href='https://www.tomlu.me/post/${item.slug.current}'><h1 style='margin: 0px;'>${item.title}</h1></a>
          <h6 style='margin: 0px;'>${item.description}</h6>
          <img src='${urlFor(item.mainImage)}' style='object-fit: cover; width: 30rem; height: 20rem;'/>
        `).join('')}
      </body>
    </html>
    `,
  };
  await new Promise((resolve, reject) => {
    transporter.sendMail(mailOptions, (err, info) => {
      if (err) {
        reject(err);
      } else {
        resolve(info);
      }
    });
  });
  res.status(200).end();
}
