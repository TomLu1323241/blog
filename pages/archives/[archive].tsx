import { GetStaticProps } from 'next';
import Head from 'next/head';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import Header from '../../components/header';
import { sanityClient } from '../../sanity';
import { Archive, LinkToAdd } from '../../typings';
import { linkToImages } from '../linkToImages';
import InfiniteScroll from 'react-infinite-scroll-component';
import { SubmitHandler, useForm } from 'react-hook-form';
import { SubmittedProgress } from '../../enums';

interface Props {
  title: string;
  archives: Archive[];
  slug: string;
}

const initialImageLoad = 10;

export default function Archives({ title, archives, slug }: Props) {
  // console.log(archives.map(item => item.mediaSrc));

  // load new images
  const [images, setImages] = useState<Archive[]>(archives);
  const [fetchSize, setFetchSize] = useState<number>(initialImageLoad);
  const [hasMoreImages, setHasMoreImages] = useState<boolean>(archives.length >= initialImageLoad);
  const loadMoreImages = async () => {
    const res = await fetch(`/api/loadNewImages/${slug}/${fetchSize}`);
    setFetchSize(fetchSize + 10);
    if (res.ok) {
      const resJson: Archive[] = await res.json();
      setImages(images => [...images, ...resJson]);
    } else {
      setHasMoreImages(false);
    }
  };

  // add images
  const {
    register,
    handleSubmit,
    setValue,
    formState: { errors },
  } = useForm<LinkToAdd>();
  const [submitted, setSubmitted] = useState<SubmittedProgress>(SubmittedProgress.NotSubmitted);
  const onSubmit: SubmitHandler<LinkToAdd> = async (data: LinkToAdd) => {
    if (submitted !== SubmittedProgress.NotSubmitted) {
      return;
    }
    setSubmitted(SubmittedProgress.Submitting);
    const res = await fetch('/api/addLink', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.ok) {
      setSubmitted(SubmittedProgress.NotSubmitted);
      // TODO: add image to client
    } else {
      setSubmitted(SubmittedProgress.NotSubmitted);
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
      <form className='flex flex-row justify-evenly bg-yellow-400 py-2' onSubmit={handleSubmit(onSubmit)}>
        <input
          {...register('link')}
          placeholder='https://www.reddit.com/r/HuTao_Mains/comments/vbym4y/hu_tao_plays_guitar_now/'
          className='shadow border rounded px-4 py-2 w-96 ring-yellow-500 outline-none focus:ring' />
        <button
          type='submit'
          className='shadow bg-yellow-500 hover:bg-yellow-400 focus:shadow-outline focus:outline-none text-white font-bold px-4 py-2 rounded cursor-pointer w-fit'>
          Add Link
        </button>
      </form>
    </div>
    <InfiniteScroll
      dataLength={images.length}
      next={loadMoreImages}
      loader={<img className='h-96 mx-auto hover:scale-125 transition-transform duration-200 ease-in-out' src='/loading-circles.gif' />}
      hasMore={hasMoreImages}
      className='flex flex-wrap gap-4 md:mx-12 overflow-visible'
      style={{ overflow: 'visible' }}
    >
      {images.map((item: Archive) => {
        const multiplier = 384 / item.height;
        return <img key={item.mediaSrc} height={item.height * multiplier} width={item.width * multiplier} className='mx-auto hover:scale-125 transition-transform duration-200 ease-in-out' src={item.mediaSrc} loading='lazy' />;
      })}
    </InfiniteScroll>
  </>;
}

export const getStaticPaths = async () => {
  const query = `
  *[_type == "archives"] {
    _id,
    _createdAt,
    title,
    slug,
  }
  `;
  const imageTypes: any = await sanityClient.fetch(query);

  const paths = imageTypes.map((images: any) => ({
    params: {
      archive: images.slug.current,
    }
  }));

  return {
    paths,
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const query = `
  *[_type == "archives" && slug.current == $slug][0] {
    _id,
    _createdAt,
    title,
    links[0...${initialImageLoad}],
  }
  `;
  const images = await sanityClient.fetch(query, {
    slug: params?.archive,
  });
  if (!images) {
    return {
      notFound: true,
    };
  }
  const archives: Archive[] = await linkToImages(images.links);
  return {
    props: {
      title: images.title,
      slug: params?.archive,
      archives,
    },
    revalidate: 60,
  };
};