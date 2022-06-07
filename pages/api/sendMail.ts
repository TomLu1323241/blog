import nodemailer from 'nodemailer';
export async function sendMail(bcc: boolean, to: string | string[], subject: string, isText: boolean, content: string) {
  const transporter = nodemailer.createTransport({
    host: 'smtp.gmail.com',
    port: 465,
    secure: true,
    auth: {
      user: process.env.EMAIL,
      pass: process.env.PASS
    }
  });
  const sendTo = Array.isArray(to) ? to.join(',') : to;
  const mailOptions = {
    from: process.env.EMAIL,
    to: bcc ? undefined : sendTo,
    bcc: bcc ? sendTo : undefined,
    subject: subject,
    text: isText ? content : undefined,
    html: isText ? undefined : content,
  };
  await transporter.sendMail(mailOptions);
}
