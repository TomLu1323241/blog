import Head from 'next/head';
import Link from 'next/link';
import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { LoadingGifs } from '../consts';
import { SubmittedProgress } from '../enums';
import { Email } from '../typings';

export default function Unsub() {
  const [submittedEmail, setSubmittedEmail] = useState<SubmittedProgress>(SubmittedProgress.NotSubmitted);
  const {
    register: registerEmail,
    handleSubmit: handleSubmitEmail,
    formState: { errors: errorsEmail },
    setError: setErrorEmail,
  } = useForm<Email>();
  const onSummitEmail: SubmitHandler<Email> = async (data: Email) => {
    setSubmittedEmail(SubmittedProgress.Submitting);
    const res = await fetch('/api/unsubEmail', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setSubmittedEmail(SubmittedProgress.Submitted);
    } else if (res.status === 409) {
      setSubmittedEmail(SubmittedProgress.NotSubmitted);
      setErrorEmail('email', { type: 'custom', message: '- This email is already was never subscribed or not verified!' });
    }
  };
  return <>
    <Head>
      <title>Unsubscribe 🥲</title>
    </Head>
    <div className='flex h-screen'>
      <div className='m-auto rounded-lg border-[1px] border-green-400 shadow-lg shadow-green-300 max-w-7xl flex flex-col p-5'>
        {(submittedEmail == SubmittedProgress.NotSubmitted) &&
          <>
            <h1 className='text-3xl mx-auto py-4'>
              Please enter your email for unsubscribing:
            </h1>
            <form onSubmit={handleSubmitEmail(onSummitEmail)} className='flex flex-col justify-center'>
              <input
                {...registerEmail('email', { required: true })}
                type='email'
                placeholder='example@example.com'
                className='shadow border rounded my-2 py-2 px-3 form-input mt-1 block w-96 mx-auto ring-yellow-500 outline-none focus:ring'
              />
              <button
                type='submit'
                className='shadow bg-yellow-500 hover:bg-yellow-400 focus:shadow-outline focus:outline-none text-white font-bold mt-4 mb-2 py-2 px-4 rounded cursor-pointer max-w-3xl mx-auto'>
                Unsubscribe 🥲
              </button>
              {errorsEmail.email && (
                <span className='text-red-500'>{errorsEmail.email.message ? errorsEmail.email.message : '- The Email field is required'}</span>
              )}
            </form>
          </>
        }

        {submittedEmail == SubmittedProgress.Submitting &&
          <img className='h-40 mx-auto' src={LoadingGifs[Math.floor(Math.random() * LoadingGifs.length)]} />
        }

        {submittedEmail == SubmittedProgress.Submitted &&
          <>
            <h1 className='text-3xl mx-auto pt-4'>
              Sorry to see you leave 🥲
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