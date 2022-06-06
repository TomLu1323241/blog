import Head from 'next/head';
import { useRef, useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { SubmittedProgress } from '../enums';
import { Email, EmailCode } from '../typings';
import { LoadingGifs } from '../consts';
import VerificationInput from 'react-verification-input';

export default function EmailVerification() {
  const [email, setEmail] = useState<string>('');
  const [submittedEmail, setSubmittedEmail] = useState<SubmittedProgress>(SubmittedProgress.NotSubmitted); // TODO: change this
  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: errorsEmail },
  } = useForm<Email>();
  const onSummitEmail: SubmitHandler<Email> = async (data: Email) => {
    setEmail(data.email);
    setSubmittedEmail(SubmittedProgress.Submitting);
    const res = await fetch('/api/sendVerificationEmail', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.ok) {
      console.log('submitted comment');
    } else {
      console.log(`${res.status} : ${res.statusText}`);
    }
    setSubmittedEmail(SubmittedProgress.Submitted);
  };

  const [submittedCode, setSubmittedCode] = useState<SubmittedProgress>(SubmittedProgress.NotSubmitted);
  const {
    register: registerCode,
    handleSubmit: handleSubmitCode,
    formState: { errors: errorsCode },
    setValue: setValueCode,
  } = useForm<EmailCode>();
  const onSummitCode: SubmitHandler<EmailCode> = async (data: EmailCode) => {
    // console.log(data);
    // return;
    const res = await fetch('/api/verifyEmailCode', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.ok) {
      console.log('submitted comment');
    } else {
      console.log(`${res.status} : ${res.statusText}`);
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
            <p className='text-gray-500 text-sm pb-4 pt-2'>Note: This will probably end up in your spam email and you need to tell your email account this is not spam</p>
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
              <span className='text-red-500'>- The Email field is required</span>
            )}
          </form>
        }
        {submittedEmail == SubmittedProgress.Submitting &&
          <img className='h-40 mx-auto' src={LoadingGifs[Math.floor(Math.random() * LoadingGifs.length)]} />
        }

        {(submittedEmail == SubmittedProgress.Submitted && submittedCode == SubmittedProgress.NotSubmitted) &&
          <form onSubmit={handleSubmitCode(onSummitCode)}>
            <input
              {...registerCode('email')}
              // Set require to true
              type='hidden'
              value={email}
            />
            <div className='flex flex-row align-middle'>
              <VerificationInput
                removeDefaultStyles
                validChars='[a-z|0-9]*'
                placeholder='·'
                onChange={(e) => {
                  setValueCode('code', e);
                }}
                classNames={{
                  container: 'h-24 flex flex-row',
                  character: 'w-16 text-6xl leading-[5.5rem]'
                }}
              />
            </div>
            <button
              type='submit'
              className='shadow bg-yellow-500 hover:bg-yellow-400 focus:shadow-outline focus:outline-none text-white font-bold mt-4 mb-2 py-2 px-4 rounded cursor-pointer w-full'>
              Verify Email!
            </button>
            {errorsCode.email && (
              <span className='text-red-500'>- The Email field is required</span>
            )}
            {errorsCode.code && (
              <span className='text-red-500'>- The code field is required</span>
            )}
          </form>
        }
      </div>
    </div>
  </>;
}