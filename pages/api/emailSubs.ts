import type { NextApiRequest, NextApiResponse } from 'next';
import { Email, Post } from '../../shared/typings';
import { sanityClient, urlFor } from './sanity';
import { sendMail } from './sendMail';
import { Webhook, MessageBuilder } from 'discord-webhook-node';

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
      image
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

  await Promise.all([sendDiscordMessage(results), sendEmails(results)]);

  res.status(200).end();
}

async function sendEmails(posts: Post[]): Promise<void> {
  const emails: { subEmail: string }[] = await sanityClient.fetch(`
  *[_type == 'subEmail' && verified == true] {
    subEmail,
  }
  `);
  await sendMail(true,
    // 'tom1323241@gmail.com',
    emails.map(item => item.subEmail),
    posts.length === 1 ? `Check out the new post on Tom's Blog '${posts[0].title}'` : `There's a bunch of new posts from Tom's Blog`,
    false,
    `
    <!doctype html>
    <html ⚡4email>
      <head>
        <meta charset="utf-8">
      </head>
      <body>
        ${posts.map((item) => `
          <a href='https://www.tomlu.me/post/${item.slug.current}'>https://www.tomlu.me/post/${item.slug.current}</a><br>
        `).join('')}
        <p>You can unsubscribe with this link <a href='https://www.tomlu.me/unsub'>https://www.tomlu.me/unsub</a></p>
      </body>
    </html>
    `
  );
}

async function sendDiscordMessage(posts: Post[]): Promise<void> {
  const hook = new Webhook(process.env.DISCORD_WEBHOOK_URL as string);
  for (const post of posts) {
    const embed = new MessageBuilder()
      .setTitle(`Check out: ${post.title}`)
      .setAuthor(post.author.name, urlFor(post.author.image).url())
      .setDescription(post.description)
      // @ts-ignore
      .setURL(`https://www.tomlu.me/post/${post.slug.current}`)
      .setImage(urlFor(post.mainImage).url())
      .setFooter(`Published: ${new Date(post._createdAt).toLocaleString('en-US', {
        weekday: 'long', year: 'numeric', month: 'long', day: 'numeric'
      })}`)
      .setColor(5814783);
    await hook.send(embed);
  }
}