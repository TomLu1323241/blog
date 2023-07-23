import { GetStaticPaths, GetStaticProps } from 'next';
import Head from 'next/head';
import React, { useState } from 'react';
import Header from '../../components/header';
import { sanityClient } from '../../shared/sanity';
import { Media, LinkToAdd } from '../../shared/typings';
import { linkToImages } from '../../shared/linkToImages';
import InfiniteScroll from 'react-infinite-scroll-component';
import { SubmitHandler, useForm } from 'react-hook-form';
import { SubmittedProgress } from '../../shared/enums';
import { FETCH_SIZE, LoadingGifs } from '../../shared/consts';
import ReactSwitch from 'react-switch';

interface Props {
  title: string;
  archives: Media[];
  slug: string;
  size: number;
}

export default function Archives({ title, archives, slug, size }: Props) {
  // Extra Large Size
  const [sizeToggle, setSizeToggle] = useState<boolean>(true);

  // load images
  const [images, setImages] = useState<Media[]>(archives);
  const [currentIndex, setCurrentIndex] = useState<number>(20);
  const [linkArraySize, setLinkArraySize] = useState<number>(size);
  const [hasMoreImages, setHasMoreImages] = useState<boolean>(size <= 20 ? false : true);
  const loadMoreImages = async () => {
    const res = await fetch(`/api/loadNewImages?slug=${slug}&index=${currentIndex}`);
    if (res.ok) {
      const resJson: Media[] = await res.json();
      setImages((images) => [...images, ...resJson]);
      setCurrentIndex(currentIndex + FETCH_SIZE);
      if (linkArraySize <= currentIndex) {
        setHasMoreImages(false);
      }
    } else {
      setHasMoreImages(false);
    }
  };

  // add images
  const { register, handleSubmit, setValue, reset } = useForm<LinkToAdd>();
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
      setImages((images) => [...newArchive, ...images]);
      setCurrentIndex(currentIndex + 1);
      reset({ link: '' });
      setLinkArraySize(linkArraySize + 1);
      await fetch(`/api/revalidate?path=/media/${slug}`);
    } else {
      setSubmittingImage(SubmittedProgress.NotSubmitted);
      // Some kinda error for the user
    }
  };
  setValue('slug', slug);
  return (
    <>
      <Head>
        <title>{title}</title>
      </Head>
      <div className='mx-auto max-w-7xl'>
        <Header />
        <div className='flex items-start justify-between bg-yellow-400 py-10 md:items-center md:py-0'>
          <div className='space-y-5 px-10'>
            <h1 className='max-w-xl font-serif text-6xl'>{title}</h1>
            <h2>
              Some details about {title} - {linkArraySize}
            </h2>
          </div>
          <div className='flex flex-col'>
            <div className='ml-auto hidden flex-col items-center font-mono font-bold md:visible md:flex md:flex-row md:gap-x-4 md:pr-5 md:pt-4'>
              <p className='text-lg'>Large View</p>
              <ReactSwitch
                checked={sizeToggle}
                onChange={(state) => setSizeToggle(state)}
                onColor='#86d3ff'
                onHandleColor='#2693e6'
                handleDiameter={30}
                uncheckedIcon={false}
                checkedIcon={false}
                boxShadow='0px 1px 5px rgba(0, 0, 0, 0.6)'
                activeBoxShadow='0px 0px 1px 10px rgba(0, 0, 0, 0.2)'
                height={20}
                width={48}
              ></ReactSwitch>
            </div>
            <img className='hidden h-52 pr-5 md:inline-flex lg:h-72' src='/T.png' alt='' />
          </div>
        </div>
        <form
          className='flex flex-col justify-evenly gap-y-3 bg-yellow-400 py-2 md:flex-row'
          onSubmit={handleSubmit(onSubmit)}
        >
          <input
            {...register('link')}
            placeholder='https://www.reddit.com/r/HuTao_Mains/comments/vbym4y/hu_tao_plays_guitar_now/'
            className='w-fill mx-8 rounded border px-4 py-2 shadow outline-none ring-yellow-500 focus:ring md:mx-0 md:w-96'
          />
          <div className='flex flex-row justify-evenly md:gap-12'>
            {submittingImage === SubmittedProgress.NotSubmitted && (
              <button
                type='submit'
                className='focus:shadow-outline w-fit cursor-pointer rounded bg-yellow-500 px-4 py-2 font-bold text-white shadow hover:bg-yellow-400 focus:outline-none'
              >
                Add Link
              </button>
            )}
            {submittingImage === SubmittedProgress.Submitting && (
              <img className='h-12' src={LoadingGifs[Math.floor(Math.random() * LoadingGifs.length)]} />
            )}
            <button
              className='focus:shadow-outline w-fit cursor-pointer rounded bg-yellow-500 px-4 py-2 font-bold text-white shadow hover:bg-yellow-400 focus:outline-none'
              onClick={async (e) => {
                e.preventDefault();
                const text = await navigator.clipboard.readText();
                setValue('link', text);
              }}
            >
              Paste Clipboard
            </button>
          </div>
        </form>
      </div>
      <InfiniteScroll
        dataLength={images.length}
        next={loadMoreImages}
        loader={<img className='mx-auto h-96 hover:scale-125' src='/loading-circles.gif' />}
        hasMore={hasMoreImages}
        className={`flex flex-wrap gap-4 ${sizeToggle ? 'mx-4' : 'mx-auto max-w-7xl'} justify-between`}
        style={{ overflow: `clip visible` }}
      >
        {images.map((item: Media, index: number) => {
          const multiplier = 384 / item.height;
          return (
            <>
              <div
                className='mx-auto overflow-hidden rounded-xl p-12 shadow-inner-md md:mx-0'
                style={{ backgroundColor: item.colors[0] }}
                key={`${item.mediaSrc}-${index}`}
              >
                <img
                  height={item.height * multiplier}
                  width={item.width * multiplier}
                  className='shadow-3xl transition-transform duration-200 ease-in-out hover:scale-125'
                  src={item.mediaSrc}
                  loading='lazy'
                />
              </div>
            </>
          );
        })}
      </InfiniteScroll>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
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
      slug: images.slug.current,
    },
  }));

  return {
    paths,
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const query = `
  *[_type == "archives" && slug.current == '${params?.slug}'][0] {
    title,
    'size' : count(links),
    links[0...20],
  }
  `;
  const images = await sanityClient.fetch(query);
  if (!images) {
    return {
      notFound: true,
    };
  }
  const archives: Media[] = await linkToImages(images.links);
  return {
    props: {
      title: images.title,
      slug: params?.slug,
      archives,
      size: images.size,
    },
    revalidate: 3600,
  };
};
