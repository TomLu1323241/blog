import { GetStaticProps } from 'next';
import Head from 'next/head';
import { useCallback, useEffect, useRef, useState } from 'react';
import Header from '../../components/header';
import { ArchiveType } from '../../enums';
import { sanityClient } from '../../sanity';
import { Archive } from '../../typings';
import probe from 'probe-image-size';

interface Props {
  title: string;
  archives: Archive[];
}

export default function Archives({ title, archives }: Props) {
  console.log(archives.map(item => item.mediaSrc));
  /*
  TODO: set the useRefs for the columns
  TODO: load images programmatically dependent on height
  */
  const [pageHeight, setPageHeight] = useState<number>(0);
  const pageHeightDiv = useRef(null);
  useEffect(() => {
    window.addEventListener('resize', () => {
      if (pageHeightDiv.current) {
        setPageHeight(pageHeightDiv.current['clientHeight']);
      }
    });
    if (pageHeightDiv.current) {
      setPageHeight(pageHeightDiv.current['clientHeight']);
    }
  }, []);
  // console.log(title);
  // console.log(archives);
  return <>
    <Head>
      <title>{title}</title>
    </Head>
    <div className='max-w-7xl mx-auto' ref={pageHeightDiv}>
      <Header />
      <div className='flex justify-between items-center bg-yellow-400 py-10 lg:py-0'>
        <div className='px-10 space-y-5'>
          <h1 className='text-6xl max-w-xl font-serif'>
            {title}
          </h1>
          <h2>
            Some details about {title} Height : {pageHeight}!!!
          </h2>
        </div>
        <img
          className='hidden md:inline-flex h-52 lg:h-96 pr-5'
          src='/T.png'
          alt=''
        />
      </div>
      <form className='flex flex-row justify-evenly bg-yellow-400 py-2'>
        <input
          placeholder='https://www.reddit.com/r/HuTao_Mains/comments/vbym4y/hu_tao_plays_guitar_now/'
          className='shadow border rounded px-4 py-2 w-96 ring-yellow-500 outline-none focus:ring' />
        <button
          type='submit'
          className='shadow bg-yellow-500 hover:bg-yellow-400 focus:shadow-outline focus:outline-none text-white font-bold px-4 py-2 rounded cursor-pointer w-fit'>
          Add Link
        </button>
      </form>
    </div>
    <div className='flex flex-wrap gap-4 md:mx-12' ref={pageHeightDiv}>
      {archives.map((item: Archive) => {
        const multiplier = 384 / item.height;
        return <img key={item.mediaSrc} height={item.height * multiplier} width={item.width * multiplier} className='mx-auto hover:scale-125 transition-transform duration-200 ease-in-out' src={item.mediaSrc} loading='lazy' />;
      })}
      <img className='h-96 mx-auto hover:scale-125 transition-transform duration-200 ease-in-out' src='/loading-circles.gif' />
    </div>
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
    links,
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

  // the map returns an array of array of Archive objects, it is an array of array because a link can be a gallery of images
  // the ... converts the array of arrays into a bunch of separate arrays
  // the concat combines everything into one array of objects
  // this is done to keep order
  const baseURL = 'https://i.redd.it/';
  const archives: Archive[] = [].concat(...await Promise.all(images.links.map(async (link: any) => {
    // Assume its a reddit url
    const res = await fetch(`${link.slice(0, -1)}.json`);
    const redditBody = await res.json();
    if (redditBody[0].data.children[0].data.url.includes('gallery')) {
      const data = redditBody[0].data.children[0].data.media_metadata;
      const temp = [];
      for (const key of Object.keys(data)) {
        const mediaSrc = `${baseURL}${key}.${data[key].m.split('/')[1]}`;
        const imageDetails = await probe(mediaSrc);
        temp.push({
          src: link,
          mediaSrc,
          type: ArchiveType.reddit,
          height: imageDetails.height,
          width: imageDetails.width,
        });
      }
      return temp;
    } else {
      const mediaSrc = redditBody[0].data.children[0].data.url;
      const imageDetails = await probe(mediaSrc);
      return [
        {
          src: link,
          mediaSrc,
          type: ArchiveType.reddit,
          height: imageDetails.height,
          width: imageDetails.width,
        }
      ];
    }
  })));
  archives.reverse();
  return {
    props: {
      title: images.title,
      archives,
    },
    revalidate: 60,
  };
};