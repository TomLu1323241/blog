import { GetStaticProps } from 'next';
import Link from 'next/link';
import { sanityClient } from '../../shared/sanity';
import { ImageCategory, ImageCategoryRes, Media, Slug } from '../../shared/typings';
import { SubmitHandler, useForm } from 'react-hook-form';
import ReactSwitch from 'react-switch';
import { useState } from 'react';

interface Props {
  pageInfo: { title: string, slug: Slug }[]
}

export default function Archives(props: Props) {
  const [pageInfo, setPageInfo] = useState(props.pageInfo);
  console.log(pageInfo);

  // add new media
  const [NSFW, setNSFW] = useState<boolean>(false);
  const {
    register: regCategory,
    handleSubmit: handCategory,
    reset: resetCategory,
  } = useForm<ImageCategory>();
  const onSubmitCategory: SubmitHandler<ImageCategory> = async (data: ImageCategory) => {
    data.nsfw = NSFW;
    const res = await fetch('/api/addCategory', {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (res.ok) {
      const resBody: ImageCategoryRes = await res.json();
      setPageInfo(original => [...original, { title: data.title, slug: resBody.slug }]);
      resetCategory({ title: '' });
      setNSFW(false);
      await fetch('/api/revalidate?path=/media');
    } else {
      // tell the user the thing failed
    }
  };
  return <>
    <h1>This is the archives page</h1>
    {pageInfo.map((item, index) => {
      return <div key={`${index}-div`}>
        {/* TODO: put the link tag back when this on demand isr stable */}
        <a className='text-2xl text-blue-500 underline' href={`/media/${item.slug.current}`}>{item.title}</a>
      </div>;
    })}
    <form className='flex flex-row gap-x-3 justify-left items-center py-8 mx-12' onSubmit={handCategory(onSubmitCategory)}>
      <input
        {...regCategory('title')}
        placeholder={'Hu Tao'}
        className='shadow border rounded px-4 py-2 mx-8 w-fill md:w-96 ring-yellow-500 outline-none focus:ring md:mx-0'
      />
      <p className='italic text-yellow-400'>NSFW</p>
      <ReactSwitch
        checked={NSFW}
        onChange={(state) => {
          setNSFW(state);
        }}
        onColor='#facc15'
      />
      <button
        type='submit'
        className='shadow bg-yellow-500 hover:bg-yellow-400 focus:shadow-outline focus:outline-none text-white font-bold px-4 py-2 rounded cursor-pointer w-fit'
      >
        Add Media Category
      </button>
    </form>
  </>;
}

export const getStaticProps: GetStaticProps = async () => {
  const query = `
  *[_type == "archives"] {
    title,
    slug,
    links[0...10]
  }
  `;
  const results: { title: string, slug: string, links: string[], media: Media[] }[] = await sanityClient.fetch(query);
  return {
    props: {
      pageInfo: results,
    },
    revalidate: 3600,
  };
};