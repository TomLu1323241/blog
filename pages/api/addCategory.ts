import type { NextApiRequest, NextApiResponse } from 'next';
import { Media, LinkToAdd, ImageCategory, ImageCategoryRes } from '../../shared/typings';
import { sanityClient } from './sanity';

export default async function addCategory(
  req: NextApiRequest,
  res: NextApiResponse<ImageCategoryRes>
) {
  const body: ImageCategory = JSON.parse(req.body);
  const slug: string = body.title.toLowerCase().replace(/\s+/g, '-').slice(0, 96);
  const exist = await sanityClient.fetch(`*[_type == "archives" && slug.current == '${slug}'][0] {}`);
  if (exist) {
    res.status(418).end();
    return;
  }
  await sanityClient.create({
    _type: 'archives',
    title: body.title,
    nsfw: body.nsfw,
    slug: { _type: 'slug', current: slug },
    links: [],
  });
  res.status(200).json({
    title: body.title,
    nsfw: body.nsfw,
    slug: { _type: 'slug', current: slug },
  });
  return;
}