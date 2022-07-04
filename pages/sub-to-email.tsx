import Head from 'next/head';
import { useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { SubmittedProgress } from '../shared/enums';
import { Email, EmailCode } from '../shared/typings';
import { LoadingGifs } from '../shared/consts';
import VerificationInput from 'react-verification-input';
import Link from 'next/link';

export default function EmailVerification() {
  const [email, setEmail] = useState<string>('');
  const [submittedEmail, setSubmittedEmail] = useState<SubmittedProgress>(SubmittedProgress.NotSubmitted);
  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: errorsEmail },
    setError: setErrorEmail,
  } = useForm<Email>();
  const onSummitEmail: SubmitHandler<Email> = async (data: Email) => {
    setEmail(data.email);
    setSubmittedEmail(SubmittedProgress.Submitting);
    const res = await fetch('/api/sendVerificationEmail', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setSubmittedEmail(SubmittedProgress.Submitted);
    } else if (res.status === 409) {
      setSubmittedEmail(SubmittedProgress.NotSubmitted);
      setErrorEmail('email', { type: 'custom', message: '- This email is already subscribed!' });
    }
  };

  const [submittedCode, setSubmittedCode] = useState<SubmittedProgress>(SubmittedProgress.NotSubmitted);
  const [codeError, setCodeError] = useState<string>('');
  const {
    register: registerCode,
    handleSubmit: handleSubmitCode,
    formState: { errors: errorsCode },
    setValue: setValueCode,
  } = useForm<EmailCode>();
  const onSummitCode: SubmitHandler<EmailCode> = async (data: EmailCode) => {
    console.log(data);
    if (data.code.length != 6) {
      setCodeError('- code must be 6 digits long');
      return;
    }
    setSubmittedCode(SubmittedProgress.Submitting);
    const res = await fetch('/api/verifyEmailCode', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setSubmittedCode(SubmittedProgress.Submitted);
    } else if (res.status === 409) {
      setSubmittedCode(SubmittedProgress.NotSubmitted);
      setCodeError('- you have entered the incorrect code');
    }
  };
  return <>
    <Head>
      <title>Subscribe!!!</title>
    </Head>
    <div className='flex h-screen'>
      <div className='m-auto rounded-lg border-[1px] border-green-400 shadow-lg shadow-green-300 max-w-7xl flex flex-col p-5'>
        {(submittedEmail == SubmittedProgress.NotSubmitted || submittedEmail == SubmittedProgress.Submitting) &&
          <>
            <h1 className='text-3xl mx-auto pt-4'>
              Please enter your email:
            </h1>
            <p className='text-gray-500 text-sm pt-2 text-center'>Note: This will probably end up in your spam email and you need to <span className='text-red-500'>tell your email account this is not spam</span></p>
            <p className='text-gray-500 text-sm pb-4 pt-2 text-center'>Emails are sent out every Saturday at 8:00am informing you of that week's blog posts!</p>
          </>
        }

        {submittedEmail == SubmittedProgress.NotSubmitted &&
          <form onSubmit={handleSubmitEmail(onSummitEmail)}>
            <input
              {...registerEmail('email', { required: true })}
              type='email'
              placeholder='example@example.com'
              className='shadow border rounded my-2 py-2 px-3 form-input mt-1 block w-96 mx-auto ring-yellow-500 outline-none focus:ring'
            />
            <button
              type='submit'
              className='shadow bg-yellow-500 hover:bg-yellow-400 focus:shadow-outline focus:outline-none text-white font-bold mt-4 mb-2 py-2 px-4 rounded cursor-pointer w-full'>
              Send Verification Email
            </button>
            {errorsEmail.email && (
              <span className='text-red-500'>{errorsEmail.email.message ? errorsEmail.email.message : '- The Email field is required'}</span>
            )}
          </form>
        }

        {submittedEmail == SubmittedProgress.Submitting &&
          <img className='h-40 mx-auto' src={LoadingGifs[Math.floor(Math.random() * LoadingGifs.length)]} />
        }

        {(submittedEmail == SubmittedProgress.Submitted && submittedCode != SubmittedProgress.Submitted) &&
          <>
            <h1 className='text-3xl mx-auto pt-4 text-center'>
              Please check your email: <span className='text-gray-500'>{email}</span>
            </h1>
            <p className='text-gray-500 text-sm pb-4 pt-2 text-center'>Note: This will probably end up in your spam email and <span className='text-red-500'>you need to tell your email account this is not spam</span></p>
          </>
        }

        {(submittedEmail == SubmittedProgress.Submitted && submittedCode == SubmittedProgress.NotSubmitted) &&
          <form onSubmit={handleSubmitCode(onSummitCode)} className='flex flex-col justify-center'>
            <input
              {...registerCode('email')}
              type='hidden'
              value={email}
            />
            <div className='flex flex-row align-middle mx-auto justify-center'>
              <VerificationInput
                removeDefaultStyles
                validChars='[0-9]*'
                placeholder='·'
                onChange={(e) => {
                  setValueCode('code', e.length < 6 ? e : e.substring(0, 6));
                  if (e.length > 6) {
                    setCodeError('');
                  }
                }}
                classNames={{
                  container: 'h-24 flex flex-row mx-auto gap-2',
                  character: 'w-16 text-6xl leading-[5.5rem] rounded-2xl bg-yellow-100 border-2 border-yellow-200 hover:bg-yellow-200'
                }}
              />
            </div>
            <button
              type='submit'
              className='shadow bg-yellow-500 hover:bg-yellow-400 focus:shadow-outline focus:outline-none text-white font-bold mt-4 mb-2 py-2 px-4 rounded cursor-pointer max-w-3xl mx-auto'>
              Verify Email!
            </button>
            {codeError && (
              <span className='text-red-500'>{codeError}</span>
            )}
          </form>
        }

        {submittedCode == SubmittedProgress.Submitting &&
          <img className='h-40 mx-auto' src={LoadingGifs[Math.floor(Math.random() * LoadingGifs.length)]} />
        }

        {submittedCode == SubmittedProgress.Submitted &&
          <>
            <h1 className='text-3xl mx-auto pt-4'>
              Thanks for subscribing to Tom's Blog!!!
            </h1>
            <Link href={'/'} passHref>
              <a
                className='shadow bg-yellow-500 hover:bg-yellow-400 focus:shadow-outline focus:outline-none text-white font-bold mt-4 mb-2 py-2 px-4 rounded cursor-pointer w-full text-center'>
                Return to home page
              </a>
            </Link>
          </>
        }
      </div>
    </div>
  </>;
}