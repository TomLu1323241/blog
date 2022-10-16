import { GetServerSideProps, GetStaticPaths, GetStaticProps } from 'next';
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
  size: number
}

export default function Archives({ title, archives, slug, size }: Props) {
  // Extra Large Size
  const [sizeToggle, setSizeToggle] = useState<boolean>(false);

  // load images
  const [images, setImages] = useState<Media[]>(archives);
  const [currentIndex, setCurrentIndex] = useState<number>(20);
  const [linkArraySize, setLinkArraySize] = useState<number>(size);
  const [hasMoreImages, setHasMoreImages] = useState<boolean>(size <= 20 ? false : true);
  const loadMoreImages = async () => {
    const res = await fetch(`/api/loadNewImages?slug=${slug}&index=${currentIndex}`);
    if (res.ok) {
      const resJson: Media[] = await res.json();
      setImages(images => [...images, ...resJson]);
      setCurrentIndex(currentIndex + FETCH_SIZE);
      if (linkArraySize <= currentIndex) {
        setHasMoreImages(false);
      }
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
  return <>
    <Head>
      <title>{title}</title>
    </Head>
    <div className='max-w-7xl mx-auto' >
      <Header />
      <div className='flex justify-between items-start md:items-center bg-yellow-400 py-10 md:py-0'>
        <div className='px-10 space-y-5'>
          <h1 className='text-6xl max-w-xl font-serif'>
            {title}
          </h1>
          <h2>
            Some details about {title} - {linkArraySize}
          </h2>
        </div>
        <div className='flex flex-col'>
          <div className='ml-auto md:pr-5 md:flex flex-col md:flex-row md:gap-x-4 font-bold font-mono md:pt-4 items-center hidden md:visible'>
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
          <img
            className='hidden md:inline-flex h-52 lg:h-72 pr-5'
            src='/T.png'
            alt=''
          />
        </div>
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
      className={`flex flex-wrap gap-4 ${sizeToggle ? 'mx-4' : 'mx-auto max-w-7xl'} justify-between`}
      style={{ overflow: `clip visible` }}
    >
      {images.map((item: Media) => {
        const multiplier = 384 / item.height;
        return <img
          key={item.mediaSrc}
          height={item.height * multiplier}
          width={item.width * multiplier}
          className='mx-auto md:mx-0 hover:scale-125 transition-transform duration-200 ease-in-out'
          src={item.mediaSrc}
          loading='lazy'
        />;
      })}
    </InfiniteScroll>
  </>;
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
    }
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
