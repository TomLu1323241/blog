// Next.js API route support: https://nextjs.org/docs/api-routes/introduction
// Trying original sanity client fix at 2:26:55
import type { NextApiRequest, NextApiResponse } from 'next';
import { Email } from '../../typings';
import { sanityClient } from './sanity';
import nodemailer from 'nodemailer';

type Data = {
  name: string
}

function makeID(length: number): string {
  var result = '';
  var characters = 'abcdefghijklmnopqrstuvwxyz0123456789';
  var charactersLength = characters.length;
  for (var i = 0; i < length; i++) {
    result += characters.charAt(Math.floor(Math.random() *
      charactersLength));
  }
  return result;
}

export default async function createComment(
  req: NextApiRequest,
  res: NextApiResponse<Data>
) {
  const body: Email = JSON.parse(req.body);
  const checkIfEmailAlreadyExists: { code: string, verified: boolean } = await sanityClient.fetch(`
  *[_type == "subEmail" && 
    subEmail == $email][0] {
    code,
    verified,
  }
  `, { email: body.email });
  if (!checkIfEmailAlreadyExists || !checkIfEmailAlreadyExists.verified) {
    let code;
    if (!checkIfEmailAlreadyExists) {
      code = makeID(6);
      await sanityClient.create({
        _type: 'subEmail',
        verified: false,
        subEmail: body.email,
        code,
      });
    } else {
      code = checkIfEmailAlreadyExists.code;
    }
    res.status(200).end();
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
      to: body.email,
      subject: `Verification Code: ${code}`,
      text: `Your verification code is ${code}`,
    };
    await transporter.sendMail(mailOptions);
  } else {
    res.status(409).end();
  }
}
