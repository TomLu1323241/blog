import { useState } from 'react';
import { SubmitHandler, useForm } from 'react-hook-form';
import { BlogComment, Comment } from '../typings';

interface Props {
  post_id: string;
  comments: Comment[];
}

enum SubmittedProgress {
  NotSubmitted,
  Submitting,
  Submitted,
}

const LoadingGifs: string[] = ['/loading-ame.gif', '/loading-keqing.gif', '/loading-hutao.gif'];

export default function CommentSection({ post_id, comments }: Props) {
  // Handle comments
  const [submitted, setSubmitted] = useState<SubmittedProgress>(SubmittedProgress.NotSubmitted);
  const [submittedSuccess, setSubmittedSuccess] = useState<boolean>(false);
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<BlogComment>();
  const onSummit: SubmitHandler<BlogComment> = async (data: BlogComment) => {
    setSubmitted(SubmittedProgress.Submitting);
    const res = await fetch('/api/createComment', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.ok) {
      console.log('submitted comment');
      setSubmitted(SubmittedProgress.Submitted);
      setSubmittedSuccess(true);
    } else {
      console.log(`${res.status} : ${res.statusText}`);
      setSubmitted(SubmittedProgress.Submitted);
      setSubmittedSuccess(false);
    }
  };
  return <>
    {/* comment section form*/}
    {submitted == SubmittedProgress.NotSubmitted && (
      <form
        onSubmit={handleSubmit(onSummit)}
        className='flex flex-col p-5 max-w-2xl mx-auto'
      >
        <h3 className='text-sm text-yellow-500'>Enjoy this article?</h3>
        <h3 className='text-3xl font-bold'>Leave a comment!</h3>
        <hr className='max-w-4xl mx-auto border border-yellow-500' />
        <hr className='max-w-4xl mt-2' />

        <input
          {...register('_id')}
          type='hidden'
          name='_id'
          value={post_id}
        />

        <label className='block mb-5'>
          <span className='text-gray-700'>Name</span>
          <input
            {...register('author', { required: true })}
            className='shadow border rounded py-2 px-3 form-input mt-1 block w-full ring-yellow-500 outline-none focus:ring' placeholder='Tom Lu'
            type='text' />
        </label>
        <label className='block mb-5'>
          <span className='text-gray-700'>Comment</span>
          <textarea
            {...register('comment', { required: true })}
            className='shadow border rounded py-2 px-3 form-textarea mt-1 block w-full ring-yellow-500 outline-none focus:ring' placeholder='Comment'
            rows={8} />
        </label>
        <div className='flex flex-col p-5'>
          {errors.author && (
            <span className='text-red-500'>- The Name field is required</span>
          )}
          {errors.comment && (
            <span className='text-red-500'>- The Comment field is required</span>
          )}
        </div>
        <input type='submit' className='shadow bg-yellow-500 hover:bg-yellow-400 focus:shadow-outline focus:outline-none text-white font-bold py-2 px-4 rounded cursor-pointer' />
      </form>
    )
    }
    {/* loading gif */}
    {
      submitted == SubmittedProgress.Submitting && (
        <img className='h-40 mx-auto' src={LoadingGifs[Math.floor(Math.random() * LoadingGifs.length)]} />
      )
    }
    {/* successful submission of comment */}
    {
      submitted == SubmittedProgress.Submitted && submittedSuccess && (
        <div className='flex flex-col p-10 my-10 bg-yellow-500 text-white max-w-2xl mx-auto'>
          <h3 className='text-2xl font-bold'>
            Thank you for submitting your comment!
          </h3>
          <p>
            Once it has been approved, it will appear below!
          </p>
        </div>
      )
    }
    {/* failed submission of comment */}
    {
      submitted == SubmittedProgress.Submitted && !submittedSuccess && (
        <div className='flex flex-col p-10 my-10 bg-yellow-500 text-white max-w-2xl mx-auto'>
          <h3 className='text-2xl font-bold'>
            Error has occurred while submitting your comment.
          </h3>
          <p>
            Please refresh the page and try again.
          </p>
        </div>
      )
    }

    <div className='mx-auto max-w-2xl shadow-sm shadow-yellow-500 p-12 mb-5'>
      <h3 className='mx-auto max-w-2xl text-3xl font-bold'>Comments</h3>
      <hr className='pb-2' />
      <div className='flex flex-row mx-auto max-w-2xl gap-1'>
        <div className='flex flex-col'>
          {comments.map((current, index) => (
            <p key={`${current.author}-${index}`} className='text-yellow-600 text-bold whitespace-nowrap'>{current.author}</p>
          ))}
        </div>
        <div className='flex flex-col'>
          {comments.map((current, index) => (
            <p key={`${current.comment}-${index}|`}> <span className='text-yellow-600 text-bold'>|</span></p>
          ))}
        </div>
        <div className='flex flex-col'>
          {comments.map((current, index) => (
            <p key={`${current.comment}-${index}`}>{current.comment}</p>
          ))}
        </div>
      </div>
    </div>
  </>;
}