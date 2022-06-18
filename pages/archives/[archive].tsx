import { GetStaticProps } from 'next';
import { useCallback, useEffect, useRef, useState } from 'react';
import Gallery from 'react-photo-gallery-next';
import Header from '../../components/header';
import { ArchiveType } from '../../enums';
import { sanityClient } from '../../sanity';
import { Archive } from '../../typings';

interface Props {
  title: string;
  archives: Archive[];
}

export default function Archives({ title, archives }: Props) {
  console.log(archives.map(item => item.src));
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
  const imageRender = useCallback((props) => {
    console.log(props);
    return <img className='object-cover p-4' src={props.photo.src} width={props.photo.width} height={props.photo.height} />;
  }, []);
  // console.log(title);
  // console.log(archives);
  return <>
    <div className='max-w-7xl mx-auto' ref={pageHeightDiv}>
      <Header />
      <div className='flex justify-between items-center bg-yellow-400 border-y border-black py-10 lg:py-0'>
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
      <Gallery photos={archives} renderImage={imageRender} />
    </div>
  </>;
}

export const getStaticPaths = async () => {
  const query = `
  *[_type == "archives"] {
    _id,
    _createdAt,
    title,
  }
  `;
  const imageTypes: any = await sanityClient.fetch(query);

  const paths = imageTypes.map((images: any) => ({
    params: {
      archive: images.title,
    }
  }));

  return {
    paths,
    fallback: 'blocking',
  };
};

export const getStaticProps: GetStaticProps = async ({ params }) => {
  const query = `
  *[_type == "archives" && title == $title][0] {
    _id,
    _createdAt,
    title,
    body,
  }
  `;
  const images = await sanityClient.fetch(query, {
    title: params?.archive,
  });
  if (!images) {
    return {
      notFound: true,
    };
  }

  const archives: Archive[] = await Promise.all(images.body.map(async (item: any) => {
    const url = item.urlField;
    // Assume its a reddit url
    const res = await fetch(`${url.slice(0, -1)}.json`);
    const redditBody = await res.json();
    return {
      src: redditBody[0].data.children[0].data.url,
      // type: ArchiveType.reddit,
      width: Math.floor(Math.random() * 4 + 1),
      height: Math.floor(Math.random() * 4 + 1),
    };
  }));

  return {
    props: {
      title: images.title,
      archives,
    },
    revalidate: 60,
  };
};