import type { NextApiRequest, NextApiResponse } from 'next';
import formidable from 'formidable';
import { sanityClient, urlFor } from '../../../shared/sanity';
import { unlinkSync } from 'fs';
import { LocationForm } from '../../../shared/location';
import { getDistance } from 'geolib';
import sharp from 'sharp';
import { tall } from 'tall';

export const config = {
  api: {
    bodyParser: false,
  },
};

async function POST(req: NextApiRequest, res: NextApiResponse) {
  // TODO: remove
  // res.status(200).json({});
  // return;
  const { fields, files }: { fields: LocationForm; files: any } = await new Promise((resolve, reject) => {
    const form = formidable({
      keepExtensions: true,
      filename(name, ext) {
        return `${name}${ext}`;
      },
    });

    form.parse(req, async (err, _fields, files) => {
      const fields = _fields as any as LocationForm;
      if (err) reject({ err });
      resolve({ fields, files });
    });
  });
  const filePath = files.image.filepath as string;
  sharp.cache(false);
  const image = await sharp(filePath);
  image.resize({ width: 500 });
  const imageAsset = await sanityClient.assets.upload('image', await image.toBuffer());

  await sanityClient.create({
    _type: 'locations',
    location: fields.location,
    preNotes: fields.preNotes,
    postNotes: fields.postNotes,
    previewImage: {
      _type: 'image',
      asset: {
        _type: 'reference',
        _ref: imageAsset._id,
      },
    },
    googleMapsUrl: await tall(fields.googleMapsUrl),
    region: fields.region,
    visited: false,
  });

  unlinkSync(filePath);
  res.status(200).json({});
}

async function GET(req: NextApiRequest, res: NextApiResponse) {
  const { long, lat }: { long: string; lat: string } = req.query as any;
  if (long && lat) {
    const result: LocationForm[] = await sanityClient.fetch<LocationForm[]>(`
      *[_type == "locations"]
    `);
    const resWithDistance: { doc: LocationForm; distance: number }[] = [];
    result.forEach((location) => {
      let locationLong: number, locationLat: number;
      locationLong = Number(location.googleMapsUrl.split('/')[6].split(',')[1]);
      locationLat = Number(location.googleMapsUrl.split('/')[6].split(',')[0].substring(1));
      const distance = getDistance(
        { longitude: Number(long), latitude: Number(lat) },
        { longitude: locationLong, latitude: locationLat }
      );
      resWithDistance.push({
        doc: location,
        distance,
      });
    });
    resWithDistance.sort((a, b) => a.distance - b.distance);
    res.status(200).json(
      resWithDistance.map((item) => {
        const location = item.doc;
        if ((location as any).previewImage) {
          location.image = urlFor((location as any).previewImage).url();
        } else {
          location.image = (location as any).previewUrl;
        }
        return location;
      })
    );
    return;
  }
  res.status(400).end();
}

export default async function handler(req: NextApiRequest, res: NextApiResponse) {
  if (req.method === 'POST') {
    await POST(req, res);
  } else if (req.method === 'GET') {
    await GET(req, res);
  }
}
