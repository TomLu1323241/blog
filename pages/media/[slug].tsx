import { GetServerSideProps } from 'next';
import Head from 'next/head';
import React, { useState } from 'react';
import Header from '../../components/header';
import { sanityClient } from '../../shared/sanity';
import { Media, LinkToAdd } from '../../shared/typings';
import { linkToImages } from '../../shared/linkToImages';
import InfiniteScroll from 'react-infinite-scroll-component';
import { SubmitHandler, useForm } from 'react-hook-form';
import { SubmittedProgress } from '../../shared/enums';
import { LoadingGifs } from '../../shared/consts';

interface Props {
  title: string;
  archives: Media[];
  slug: string;
  size: number
}

export default function Archives({ title, archives, slug, size }: Props) {

  // load new images
  const [images, setImages] = useState<Media[]>(archives);
  const [fetchSize, setFetchSize] = useState<number>(size);
  const [hasMoreImages, setHasMoreImages] = useState<boolean>(true);
  const loadMoreImages = async () => {
    const res = await fetch(`/api/loadNewImages/${slug}/${fetchSize}`);
    if (res.ok) {
      const [resJson, size]: [Media[], number] = await res.json();
      setImages(images => [...images, ...resJson]);
      setFetchSize(fetchSize + size);
    } else {
      setHasMoreImages(false);
    }
  };

  // add images
  const {
    register,
    handleSubmit,
    setValue,
    reset,
  } = useForm<LinkToAdd>();
  const [submittingImage, setSubmittingImage] = useState<SubmittedProgress>(SubmittedProgress.NotSubmitted);
  const onSubmit: SubmitHandler<LinkToAdd> = async (data: LinkToAdd) => {
    if (submittingImage !== SubmittedProgress.NotSubmitted) {
      return;
    }
    setSubmittingImage(SubmittedProgress.Submitting);
    const res = await fetch('/api/addLink', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setSubmittingImage(SubmittedProgress.NotSubmitted);
      const newArchive: Media[] = await res.json();
      setImages(images => [...newArchive, ...images]);
      setFetchSize(fetchSize + 1);
      reset({ link: '' });
    } else {
      setSubmittingImage(SubmittedProgress.NotSubmitted);
      // Some kinda error for the user
    }
  };
  setValue('slug', slug);
  return <>
    <Head>
      <title>{title}</title>
    </Head>
    <div className='max-w-7xl mx-auto' >
      <Header />
      <div className='flex justify-between items-center bg-yellow-400 py-10 lg:py-0'>
        <div className='px-10 space-y-5'>
          <h1 className='text-6xl max-w-xl font-serif'>
            {title}
          </h1>
          <h2>
            Some details about {title}
          </h2>
        </div>
        <img
          className='hidden md:inline-flex h-52 lg:h-96 pr-5'
          src='/T.png'
          alt=''
        />
      </div>
      <form className='flex flex-col gap-y-3 md:flex-row justify-evenly bg-yellow-400 py-2' onSubmit={handleSubmit(onSubmit)}>
        <input
          {...register('link')}
          placeholder='https://www.reddit.com/r/HuTao_Mains/comments/vbym4y/hu_tao_plays_guitar_now/'
          className='shadow border rounded px-4 py-2 mx-8 w-fill md:w-96 ring-yellow-500 outline-none focus:ring md:mx-0' />
        <div className='flex flex-row justify-evenly md:gap-12'>
          {submittingImage === SubmittedProgress.NotSubmitted &&
            <button
              type='submit'
              className='shadow bg-yellow-500 hover:bg-yellow-400 focus:shadow-outline focus:outline-none text-white font-bold px-4 py-2 rounded cursor-pointer w-fit'>
              Add Link
            </button>
          }
          {submittingImage === SubmittedProgress.Submitting &&
            <img className='h-12' src={LoadingGifs[Math.floor(Math.random() * LoadingGifs.length)]} />
          }
          <button
            className='shadow bg-yellow-500 hover:bg-yellow-400 focus:shadow-outline focus:outline-none text-white font-bold px-4 py-2 rounded cursor-pointer w-fit'
            onClick={async (e) => {
              e.preventDefault();
              const text = await navigator.clipboard.readText();
              setValue('link', text);
            }}>
            Paste Clipboard
          </button>
        </div>
      </form>
    </div>
    <InfiniteScroll
      dataLength={images.length}
      next={loadMoreImages}
      loader={<img className='h-96 mx-auto hover:scale-125 transition-transform duration-200 ease-in-out' src='/loading-circles.gif' />}
      hasMore={hasMoreImages}
      className='flex flex-wrap gap-4 md:mx-4'
      style={{ overflow: 'clip visible' }}
    >
      {images.map((item: Media) => {
        const multiplier = 384 / item.height;
        return <img key={item.mediaSrc} height={item.height * multiplier} width={item.width * multiplier} className='mx-auto hover:scale-125 transition-transform duration-200 ease-in-out' src={item.mediaSrc} loading='lazy' />;
      })}
    </InfiniteScroll>
  </>;
}

export const getServerSideProps: GetServerSideProps = async ({ params }) => {
  const initialFetchSize = 20;
  const arrayProperties: { size: number} = await sanityClient.fetch(`
  *[_type == "archives" && slug.current == '${params?.slug}'][0] {
    'size' : count(links)
  }`
  );
  const query = `
  *[_type == "archives" && slug.current == '${params?.slug}'][0] {
    _id,
    _createdAt,
    title,
    links[${arrayProperties.size - initialFetchSize}...${arrayProperties.size}],
  }
  `;
  const images = await sanityClient.fetch(query);
  if (!images) {
    return {
      notFound: true,
    };
  }
  images.links.reverse();
  const [archives, badEntries]: [Media[], number[]] = await linkToImages(images.links);
  await Promise.all(badEntries.map(async (indexToRemove) => {
    await sanityClient.patch(images._id).splice('links', indexToRemove, 1, []).commit();
  }));
  console.log(badEntries);
  return {
    props: {
      title: images.title,
      slug: params?.slug,
      archives,
      size: initialFetchSize - badEntries.length,
    }
  };
};